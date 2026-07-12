#!/usr/bin/env node
/**
 * add-icon.mjs
 *
 * Generates an icon component from a lucide-static SVG source, following
 * this project's simple one-icon-per-folder pattern:
 *
 *   icons/<category>/<icon-folder>/index.tsx   <- the component itself
 *   icons/<category>/index.ts                  <- gets a new re-export line appended
 *
 * e.g. icons/pets/cat/index.tsx + a line in icons/pets/index.ts:
 *   export { CatIcon } from "./cat";
 *
 * Component template (matches the project's working files):
 *   - StyledSvg wrapper, width/height/viewBox copied verbatim from source
 *   - one <Path>/<Circle>/... per source element (no merging, no coordinate math)
 *   - stroke/strokeWidth/strokeLinecap/strokeLinejoin repeated on every element
 *     (NOT lifted to <Svg> - confirmed broken in this project's react-native-svg version)
 *
 * Setup (once):
 *   pnpm add -D lucide-static
 *
 * Usage:
 *   node scripts/add-icon.mjs <lucide-icon-name> --category=<folder> [--name=<ExportName>] [--folder=<icon-folder-name>]
 *
 * Examples:
 *   node scripts/add-icon.mjs house --category=pets --name=HomeIcon
 *     -> icons/pets/house/index.tsx, appends `export { HomeIcon } from "./house";` to icons/pets/index.ts
 *
 *   node scripts/add-icon.mjs bell-dot --category=bell
 *     -> name auto-derived as BellDotIcon, folder auto-derived as "bell-dot"
 *
 *   node scripts/add-icon.mjs dog --category=pets --folder=dog --name=DogIcon
 *
 * What it does:
 *   1. Reads node_modules/lucide-static/icons/<lucide-icon-name>.svg
 *   2. Extracts width/height/viewBox and every drawable child element
 *   3. Writes icons/<category>/<icon-folder>/index.tsx using the project template
 *   4. Appends a re-export line to icons/<category>/index.ts (creates the file
 *      if the category is brand new). Never overwrites existing lines.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

// Base directory for icon components, relative to wherever this script is run from
// (i.e. your project root, where node_modules and package.json live).
// Adjust this if your project's icons folder ever moves.
const ICONS_DIR = "src/icons";

const SUPPORTED_TAGS = ["path", "circle", "rect", "line", "polyline", "polygon", "ellipse"];

function parseArgs(argv) {
  const [iconName, ...rest] = argv;
  if (!iconName) {
    console.error("Usage: node scripts/add-icon.mjs <lucide-icon-name> --category=<folder> [--name=<ExportName>]");
    process.exit(1);
  }
  const opts = { iconName };
  for (const arg of rest) {
    const [key, value] = arg.replace(/^--/, "").split("=");
    opts[key] = value;
  }
  if (!opts.category) {
    console.error("Missing --category=<folder>, e.g. --category=bell or --category=arrows/chevron");
    process.exit(1);
  }
  if (!opts.name) {
    // kebab-case -> PascalCase + "Icon", e.g. "chevron-right" -> "ChevronRightIcon"
    opts.name =
      opts.iconName
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("") + "Icon";
  }
  if (!opts.folder) {
    // default: the lucide slug itself, e.g. "house" -> icons/pets/house/index.tsx
    opts.folder = opts.iconName;
  }
  return opts;
}

function loadSourceSvg(iconName) {
  const svgPath = resolve("node_modules/lucide-static/icons", `${iconName}.svg`);
  if (!existsSync(svgPath)) {
    console.error(`Could not find ${svgPath}`);
    console.error(`Is "${iconName}" the correct lucide icon slug, and is lucide-static installed?`);
    console.error(`Check the exact slug on https://lucide.dev (it's in the URL, e.g. lucide.dev/icons/chevron-right).`);
    process.exit(1);
  }
  return readFileSync(svgPath, "utf-8");
}

function extractAttr(tag, name) {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : null;
}

function parseSvg(svgSource) {
  const rootMatch = svgSource.match(/<svg[^>]*>/);
  if (!rootMatch) throw new Error("No <svg> root found");
  const root = rootMatch[0];

  const width = extractAttr(root, "width") ?? "24";
  const height = extractAttr(root, "height") ?? "24";
  const viewBox = extractAttr(root, "viewBox") ?? "0 0 24 24";

  const elements = [];
  const tagPattern = new RegExp(`<(${SUPPORTED_TAGS.join("|")})\\b([^>]*?)\\/?>`, "g");
  let m;
  while ((m = tagPattern.exec(svgSource)) !== null) {
    const [, tag, attrString] = m;
    // strip presentation attrs we re-add ourselves (stroke, fill, stroke-width, etc.)
    // and anything that isn't shape geometry
    const geometryAttrs = attrString
      .replace(/\s(stroke|fill|stroke-width|stroke-linecap|stroke-linejoin)="[^"]*"/g, "")
      .trim();
    elements.push({ tag, attrs: geometryAttrs });
  }

  if (elements.length === 0) {
    throw new Error("No drawable elements found in SVG - check the source file manually");
  }

  return { width, height, viewBox, elements };
}

function tagToComponent(tag) {
  return tag.charAt(0).toUpperCase() + tag.slice(1);
}

function attrsToJsx(attrString) {
  // convert kebab-case svg attrs (if any slipped through, e.g. custom shapes) to camelCase JSX props
  return attrString.replace(/([a-z]+)-([a-z]+)="/g, (_, a, b) => `${a}${b[0].toUpperCase()}${b.slice(1)}="`);
}

function buildComponent({ name, width, height, viewBox, elements }) {
  const usedTags = [...new Set(elements.map((e) => tagToComponent(e.tag)))];
  const importLine = `import { ${usedTags.join(", ")}, StyledSvg as Svg } from "../../StyledSvg";`;

  const children = elements
    .map(({ tag, attrs }) => {
      const Component = tagToComponent(tag);
      const jsxAttrs = attrsToJsx(attrs);
      return `      <${Component}
        ${jsxAttrs}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />`;
    })
    .join("\n");

  return `import type { Icon, IconProps } from "../../icons";
${importLine}

export const ${name}: Icon = ({ style, color = "#000000", ...props }: IconProps) => {
  return (
    <Svg width="${width}" height="${height}" viewBox="${viewBox}" fill="none" style={style} {...props}>
${children}
    </Svg>
  );
};
`;
}

function appendReExport({ category, folder, name }) {
  const barrelPath = resolve(ICONS_DIR, category, "index.ts");
  const exportLine = `export { ${name} } from "./${folder}";\n`;

  if (!existsSync(barrelPath)) {
    // brand new category - create the barrel file with this one line
    mkdirSync(dirname(barrelPath), { recursive: true });
    writeFileSync(barrelPath, exportLine, "utf-8");
    console.log(`Created ${barrelPath} with the export.`);
    return;
  }

  const existing = readFileSync(barrelPath, "utf-8");
  if (existing.includes(`from "./${folder}"`)) {
    console.log(`${barrelPath} already re-exports "./${folder}" - left untouched.`);
    return;
  }
  if (existing.includes(`export { ${name} }`)) {
    console.error(`${barrelPath} already exports something named "${name}" from elsewhere - check for a naming collision before wiring this up manually.`);
    return;
  }

  appendFileSync(barrelPath, exportLine, "utf-8");
  console.log(`Appended to ${barrelPath}: ${exportLine.trim()}`);
}

function main() {
  const { iconName, category, name, folder } = parseArgs(process.argv.slice(2));

  const svgSource = loadSourceSvg(iconName);
  const parsed = parseSvg(svgSource);
  const fileContent = buildComponent({ name, ...parsed });

  const outPath = resolve(ICONS_DIR, category, folder, "index.tsx");
  mkdirSync(dirname(outPath), { recursive: true });

  if (existsSync(outPath)) {
    console.error(`Refusing to overwrite existing file: ${outPath}`);
    console.error(`Delete it first (and remove its line from icons/${category}/index.ts) if you want to regenerate.`);
    process.exit(1);
  }

  writeFileSync(outPath, fileContent, "utf-8");
  console.log(`Created ${outPath}`);
  console.log(`Elements ported: ${parsed.elements.map((e) => e.tag).join(", ")}`);

  appendReExport({ category, folder, name });

  console.log(`\nDone. Import as: import { ${name} } from "@/icons/${category}";`);
}

main();
