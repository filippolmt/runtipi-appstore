import fs from "node:fs/promises";
import path from "node:path";

const packageFile = process.argv[2];
const newVersion = process.argv[3];
const packageName = process.argv[4];

interface AppConfig {
  tipi_version: number;
  version: string;
  updated_at: number;
}

interface DockerComposeJson {
  services: Array<{
    image: string;
    isMain?: boolean;
  }>;
}

async function readJsonFile<T>(filepath: string): Promise<T> {
  const content = await fs.readFile(filepath, "utf-8");
  return JSON.parse(content);
}

const updateAppConfig = async (packageFile: string, newVersion: string, packageName?: string) => {
  try {
    const packageRoot = path.dirname(packageFile);
    const configPath = path.join(packageRoot, "config.json");
    const dockerComposeJsonPath = path.join(packageRoot, "docker-compose.json");

    const config = await readJsonFile<AppConfig>(configPath);
    const dockerComposeJson = await readJsonFile<DockerComposeJson>(dockerComposeJsonPath);

    if (packageName && dockerComposeJson) {
      for (const service of dockerComposeJson.services) {
        if (service.image === `${packageName}:${newVersion}` && service.isMain) {
          config.version = newVersion;
        }
      }
    } else {
      config.version = newVersion;
    }

    config.tipi_version = config.tipi_version + 1;
    config.updated_at = Date.now();

    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error(`Failed to update app config, error: ${e}`);
  }
};

if (!packageFile || !newVersion) {
  console.error("Usage: bun run scripts/update-config.ts <packageFile> <newVersion> [packageName]");
  process.exit(1);
}
updateAppConfig(packageFile, newVersion, packageName);
