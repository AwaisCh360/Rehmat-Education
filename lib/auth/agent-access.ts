import { db } from "@/lib/db";
import { revalidateTag, unstable_cache } from "next/cache";

type AgentAccessSettings = {
  revokedAgentIds: string[];
};

const SETTINGS_KEY = "agent-access-settings";
const AGENT_ACCESS_CACHE_TAG = "agent-access-settings";

const defaultAgentAccessSettings: AgentAccessSettings = {
  revokedAgentIds: []
};

type AppSettingDelegate = {
  findUnique: (args: unknown) => Promise<{ valueJson: string } | null>;
  upsert: (args: unknown) => Promise<unknown>;
};

export async function getAgentAccessSettings(): Promise<AgentAccessSettings> {
  const loader = async () => {
    const appSetting = (db as unknown as { appSetting?: AppSettingDelegate }).appSetting;

    if (!appSetting) {
      return defaultAgentAccessSettings;
    }

    const setting = await appSetting.findUnique({
      where: {
        key: SETTINGS_KEY
      }
    });

    if (!setting) {
      return defaultAgentAccessSettings;
    }

    return normalizeAgentAccessSettings(setting.valueJson);
  };

  try {
    return await unstable_cache(loader, [AGENT_ACCESS_CACHE_TAG], {
      revalidate: 300,
      tags: [AGENT_ACCESS_CACHE_TAG]
    })();
  } catch {
    return await loader();
  }
}

export async function getRevokedAgentIds(): Promise<string[]> {
  const settings = await getAgentAccessSettings();
  return settings.revokedAgentIds;
}

export async function isAgentRevoked(agentId: string): Promise<boolean> {
  if (!agentId) {
    return false;
  }

  const revokedIds = await getRevokedAgentIds();
  return revokedIds.includes(agentId);
}

export async function setAgentRevoked(agentId: string, revoked: boolean): Promise<AgentAccessSettings> {
  const current = await getAgentAccessSettings();
  const nextRevokedIds = new Set(current.revokedAgentIds);

  if (revoked) {
    nextRevokedIds.add(agentId);
  } else {
    nextRevokedIds.delete(agentId);
  }

  return setAgentAccessSettings({
    revokedAgentIds: [...nextRevokedIds]
  });
}

async function setAgentAccessSettings(nextSettings: AgentAccessSettings): Promise<AgentAccessSettings> {
  const normalized = {
    revokedAgentIds: normalizeIds(nextSettings.revokedAgentIds)
  };

  const appSetting = (db as unknown as { appSetting?: AppSettingDelegate }).appSetting;

  if (!appSetting) {
    return normalized;
  }

  await appSetting.upsert({
    where: {
      key: SETTINGS_KEY
    },
    create: {
      key: SETTINGS_KEY,
      valueJson: JSON.stringify(normalized)
    },
    update: {
      valueJson: JSON.stringify(normalized)
    }
  });

  revalidateTag(AGENT_ACCESS_CACHE_TAG);

  return normalized;
}

function normalizeAgentAccessSettings(valueJson: string): AgentAccessSettings {
  try {
    const parsed = JSON.parse(valueJson) as Partial<AgentAccessSettings>;

    return {
      revokedAgentIds: normalizeIds(parsed.revokedAgentIds)
    };
  } catch {
    return defaultAgentAccessSettings;
  }
}

function normalizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const unique = new Set(
    value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
  );

  return [...unique];
}
