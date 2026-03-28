import fs from "node:fs";
import path from "node:path";

const REPO_RAW_URL = "https://raw.githubusercontent.com/filippolmt/runtipi-appstore/main";

type AppConfig = {
  id: string;
  name: string;
  short_desc: string;
  source: string;
  website?: string;
  port?: number;
  version?: string;
  categories?: string[];
  dynamic_config?: boolean;
  supported_architectures?: string[];
  deprecated?: boolean;
};

const appsDir = path.resolve(__dirname, "../../apps");
const templatePath = path.resolve(__dirname, "../../templates/README.md");
const outputPath = path.resolve(__dirname, "../../README.md");

const categoryLabels: Record<string, { emoji: string; label: string }> = {
  automation: { emoji: "🤖", label: "Automation" },
  development: { emoji: "🛠️", label: "Development" },
  media: { emoji: "📺", label: "Media" },
  utilities: { emoji: "🧰", label: "Utilities" },
};

function loadApps(): AppConfig[] {
  return fs
    .readdirSync(appsDir)
    .filter((name) => {
      const appPath = path.join(appsDir, name);
      return fs.statSync(appPath).isDirectory() && fs.existsSync(path.join(appPath, "config.json"));
    })
    .map((name) => {
      const raw = fs.readFileSync(path.join(appsDir, name, "config.json"), "utf8");
      return JSON.parse(raw) as AppConfig;
    })
    .filter((app) => !app.deprecated)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function archBadges(archs?: string[]): string {
  if (!archs || archs.length === 0) return "";
  return archs.map((a) => `\`${a}\``).join(" ");
}

function appRow(app: AppConfig): string {
  const logo = `<img src="${REPO_RAW_URL}/apps/${app.id}/metadata/logo.jpg" width="24" height="24">`;
  const name = `[${app.name}](${app.source})`;
  const version = app.version ?? "-";
  const port = app.port ?? "-";
  const archs = archBadges(app.supported_architectures);
  return `| ${logo} | ${name} | ${app.short_desc} | ${version} | ${port} | ${archs} |`;
}

function buildCategorySection(category: string, apps: AppConfig[]): string {
  const info = categoryLabels[category] ?? { emoji: "📦", label: category };
  const lines: string[] = [];
  lines.push(`### ${info.emoji} ${info.label}`);
  lines.push("");
  lines.push("| | Name | Description | Version | Port | Arch |");
  lines.push("|-|------|-------------|---------|------|------|");
  for (const app of apps) {
    lines.push(appRow(app));
  }
  return lines.join("\n");
}

function main() {
  const apps = loadApps();

  const grouped: Record<string, AppConfig[]> = {};
  for (const app of apps) {
    const cat = app.categories?.[0] ?? "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(app);
  }

  const categoryOrder = Object.keys(categoryLabels);
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ia = categoryOrder.indexOf(a);
    const ib = categoryOrder.indexOf(b);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const sections = sortedCategories.map((cat) => buildCategorySection(cat, grouped[cat]));
  const appsList = sections.join("\n\n");

  const template = fs.readFileSync(templatePath, "utf8");
  const readme = template
    .replace("<!appsCount>", apps.length.toString())
    .replace("<!categoryCount>", sortedCategories.length.toString())
    .replace("<!appsList>", appsList);

  fs.writeFileSync(outputPath, readme);
  console.log(`README generated: ${apps.length} apps in ${sortedCategories.length} categories`);
}

main();
