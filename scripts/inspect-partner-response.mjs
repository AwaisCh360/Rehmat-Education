import fs from "node:fs";

const cookiesPath = new URL("../Cookies.txt", import.meta.url);
const cookiesRaw = fs.readFileSync(cookiesPath, "utf8");
const cookies = JSON.parse(cookiesRaw);

const cookieHeader = cookies
  .filter((cookie) => {
    if (!cookie || typeof cookie.name !== "string" || typeof cookie.value !== "string") {
      return false;
    }

    return cookie.domain === "partner.unitededucation.com" || cookie.domain === ".unitededucation.com";
  })
  .map((cookie) => `${cookie.name}=${cookie.value}`)
  .join("; ");

const termId = "a1ZP2000004F0JxMAK";
const baseHeaders = {
  accept: "*/*",
  "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
  "x-requested-with": "XMLHttpRequest",
  referer: "https://partner.unitededucation.com/Manage/ProgramSearch",
  cookie: cookieHeader
};

const endpoints = [
  `https://partner.unitededucation.com/Manage/test?termid=${termId}`,
  `https://partner.unitededucation.com/Manage/Degreelist?termid=${termId}`,
  "https://partner.unitededucation.com/Manage/listbadge2?name=&page=1"
];

for (const url of endpoints) {
  const response = await fetch(url, {
    method: "GET",
    headers: baseHeaders
  });

  const contentType = response.headers.get("content-type") || "unknown";
  const body = await response.text();
  const preview = body.slice(0, 600).replace(/\s+/g, " ").trim();

  console.log("---");
  console.log(url);
  console.log(`status=${response.status}`);
  console.log(`content-type=${contentType}`);
  console.log(`length=${body.length}`);

  try {
    const json = JSON.parse(body);
    if (Array.isArray(json)) {
      console.log(`parsed-json=array(${json.length})`);
      console.log(JSON.stringify(json[0] ?? null).slice(0, 600));
    } else if (json && typeof json === "object") {
      const keys = Object.keys(json);
      console.log(`parsed-json=object keys=${keys.slice(0, 12).join(",")}`);
      console.log(JSON.stringify(json).slice(0, 600));
    } else {
      console.log(`parsed-json=primitive type=${typeof json}`);
      console.log(String(json).slice(0, 600));
    }
  } catch {
    console.log("parsed-json=no");
    console.log(`preview=${preview}`);
  }
}
