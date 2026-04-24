const DIACRITICS_PATTERN = /[\u0300-\u036f]/g;
const SUSPICIOUS_MOJIBAKE_PATTERN = /[þÿÃØÙÆÐ]/g;
const SUSPICIOUS_MOJIBAKE_SCAN_PATTERN = /[þÿÃØÙÆÐ]/;
const CONTROL_CHARS_PATTERN = /[\u0000-\u001F]/g;
const CONTROL_CHARS_SCAN_PATTERN = /[\u0000-\u001F]/;
const ARABIC_SCRIPT_PATTERN = /[\u0600-\u06FF]/g;

export function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFKD")
    .replace(DIACRITICS_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function normalizeFilterKey(value: string | null | undefined) {
  return normalizeText(value).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
}

export function normalizeDisplayValue(value: string | null | undefined, fallback = "Not specified") {
  const cleaned = repairPotentialMojibake(value ?? "").replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}

export function normalizeOptionalDisplayValue(value: string | null | undefined) {
  const cleaned = normalizeDisplayValue(value, "");
  return cleaned || null;
}

export function toNullableNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildSearchText(values: Array<string | null | undefined>) {
  return normalizeText(values.filter(Boolean).join(" "));
}

export function getRepresentativeValue(values: string[]) {
  const score = new Map<string, number>();

  for (const value of values) {
    score.set(value, (score.get(value) ?? 0) + 1);
  }

  return [...score.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }

      if (a[0].length !== b[0].length) {
        return a[0].length - b[0].length;
      }

      return a[0].localeCompare(b[0]);
    })
    .at(0)?.[0];
}

export function repairPotentialMojibake(value: string) {
  const input = value.replace(/\s+/g, " ").trim();

  if (!input) {
    return input;
  }

  if (!SUSPICIOUS_MOJIBAKE_SCAN_PATTERN.test(input) && !CONTROL_CHARS_SCAN_PATTERN.test(input)) {
    return input;
  }

  const baselineScore = scoreText(input);
  const sourceBytes = Uint8Array.from([...input].map((char) => char.charCodeAt(0) & 0xff));
  const candidates = [decodeBytes(sourceBytes, "utf-8"), decodeBytes(sourceBytes, "utf-16le")]
    .filter((candidate): candidate is string => Boolean(candidate))
    .map((candidate) => candidate.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const best = candidates
    .map((candidate) => ({
      candidate,
      score: scoreText(candidate)
    }))
    .sort((a, b) => b.score - a.score)
    .at(0);

  if (!best) {
    return input;
  }

  return best.score >= baselineScore + 2 ? best.candidate : input;
}

function decodeBytes(bytes: Uint8Array, encoding: string) {
  try {
    return new TextDecoder(encoding, { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function scoreText(value: string) {
  const arabic = (value.match(ARABIC_SCRIPT_PATTERN) ?? []).length;
  const suspicious = (value.match(SUSPICIOUS_MOJIBAKE_PATTERN) ?? []).length;
  const controlChars = (value.match(CONTROL_CHARS_PATTERN) ?? []).length;

  return arabic * 3 - suspicious * 3 - controlChars * 5;
}
