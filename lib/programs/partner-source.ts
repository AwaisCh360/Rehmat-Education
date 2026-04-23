import { readFileSync } from "node:fs";
import path from "node:path";

type BrowserCookie = {
  name: string;
  value: string;
  domain?: string;
};

function getCookieHeaderFromFile() {
  const filePath = path.join(process.cwd(), "Cookies.txt");
  const raw = readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as BrowserCookie[];

  return parsed
    .filter((cookie) => {
      if (!cookie || typeof cookie.name !== "string" || typeof cookie.value !== "string") {
        return false;
      }

      return cookie.domain === "partner.unitededucation.com" || cookie.domain === ".unitededucation.com";
    })
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function fetchPartnerProgramsPayload(sourceUrl: string) {
  const cookieHeader = getCookieHeaderFromFile();

  if (!cookieHeader) {
    throw new Error("Cookies.txt does not contain valid partner cookies.");
  }

  const response = await fetch(sourceUrl, {
    method: "GET",
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "x-requested-with": "XMLHttpRequest",
      referer: "https://partner.unitededucation.com/Manage/ProgramSearch",
      cookie: cookieHeader
    }
  });

  if (!response.ok) {
    throw new Error(`Partner source request failed (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("Partner source did not return JSON data.");
  }

  const json = (await response.json()) as unknown;
  return JSON.stringify(json);
}
