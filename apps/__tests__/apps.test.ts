import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { appInfoSchema } from "@runtipi/common/schemas";
import Ajv2020 from "ajv/dist/2020.js";
import draft7MetaSchema from "ajv/dist/refs/json-schema-draft-07.json" assert { type: "json" };
import { fromError } from "zod-validation-error";

const getApps = async () => {
  const appsDir = await fs.promises.readdir(path.join(process.cwd(), "apps"));

  const appDirs = appsDir.filter((app) => {
    const stat = fs.statSync(path.join(process.cwd(), "apps", app));
    const hasConfig = fs.existsSync(path.join(process.cwd(), "apps", app, "config.json"));
    return stat.isDirectory() && hasConfig;
  });

  return appDirs;
};

const getFile = async (app: string, file: string) => {
  const filePath = path.join(process.cwd(), "apps", app, file);
  try {
    const file = await fs.promises.readFile(filePath, "utf-8");
    return file;
  } catch (err) {
    return null;
  }
};

const ajv = new Ajv2020({ allErrors: true, strict: false });
ajv.addMetaSchema(draft7MetaSchema);
const dynamicSchemaUrl = "https://schemas.runtipi.io/v2/dynamic-compose.json";
const localDynamicSchemaPath = path.join(process.cwd(), "apps", "dynamic-compose-schema.json");

const dynamicValidatorPromise = (async () => {
  try {
    const res = await fetch(dynamicSchemaUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const remoteSchema = await res.json();
    return ajv.compile(remoteSchema);
  } catch (err) {
    console.warn(`Falling back to local dynamic-compose schema (${localDynamicSchemaPath}): ${err}`);
    const localSchema = JSON.parse(fs.readFileSync(localDynamicSchemaPath, "utf-8"));
    return ajv.compile(localSchema);
  }
})();
const dynamicSchemaPath = path.join(process.cwd(), "apps", "dynamic-compose-schema.json");
const dynamicSchema = JSON.parse(fs.readFileSync(dynamicSchemaPath, "utf-8"));
const validateDynamic = ajv.compile(dynamicSchema);

describe("each app should have the required files", async () => {
  const apps = await getApps();

  for (const app of apps) {
    const files = ["config.json", "docker-compose.json", "metadata/logo.jpg", "metadata/description.md"];

    for (const file of files) {
      test(`app ${app} should have ${file}`, async () => {
        const fileContent = await getFile(app, file);
        expect(fileContent).not.toBeNull();
      });
    }
  }
});

describe("each app should have a valid config.json", async () => {
  const apps = await getApps();

  for (const app of apps) {
    test(`app ${app} should have a valid config.json`, async () => {
      const fileContent = await getFile(app, "config.json");
      const parsed = appInfoSchema.omit({ urn: true }).safeParse(JSON.parse(fileContent || "{}"));

      if (!parsed.success) {
        const validationError = fromError(parsed.error);
        console.error(`Error parsing config.json for app ${app}:`, validationError.toString());
      }

      expect(parsed.success).toBe(true);
    });
  }
});

describe("each app should have a valid docker-compose.json", async () => {
  const apps = await getApps();
  const validateDynamic = await dynamicValidatorPromise;

  for (const app of apps) {
    test(`app ${app} should have a valid docker-compose.json`, async () => {
      const fileContent = await getFile(app, "docker-compose.json");
      const parsedCompose = validateDynamic(JSON.parse(fileContent || "{}"));

      if (!parsedCompose) {
        console.error(`Error parsing docker-compose.json for app ${app}:`, validateDynamic.errors);
      }

      expect(parsedCompose).toBe(true);
    });
  }
});
