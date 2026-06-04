import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const username = process.env.OPENAPI_USERNAME;
const password = process.env.OPENAPI_PASSWORD;
const url = process.env.OPENAPI_URL ?? "https://smart-pet-care.duckdns.org/openapi/v1.json";
const outputPath = process.env.OPENAPI_OUTPUT ?? "docs/openapi.json";

if (!username || !password) {
  console.error("Set OPENAPI_USERNAME and OPENAPI_PASSWORD before fetching the OpenAPI spec.");
  process.exit(1);
}

const credentials = Buffer.from(`${username}:${password}`).toString("base64");
const response = await fetch(url, {
  headers: {
    Authorization: `Basic ${credentials}`,
  },
});

if (!response.ok) {
  console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const spec = await response.json();

if (!spec.openapi || !spec.paths) {
  console.error(`Response from ${url} does not look like an OpenAPI document.`);
  process.exit(1);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(`${outputPath}`, `${JSON.stringify(spec, null, 2)}\n`);

console.log(`Wrote ${outputPath}`);
