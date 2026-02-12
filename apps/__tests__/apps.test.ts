import { describe, expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import { parseComposeJson } from "@runtipi/common/schemas";
import Ajv2020 from "ajv/dist/2020.js";
import draft7MetaSchema from "ajv/dist/refs/json-schema-draft-07.json" with { type: "json" };

interface AppConfig {
  id: string;
  name: string;
  available: boolean;
  tipi_version: number;
  version?: string;
  short_desc: string;
  author: string;
  source: string;
  port?: number;
  categories?: string[];
  description?: string;
  form_fields?: Array<{ type: string; required?: boolean }>;
  supported_architectures?: string[];
  dynamic_config?: boolean;
  created_at?: number;
  updated_at?: number;
}

const getApps = (): string[] => {
  const appsDir = fs.readdirSync(path.join(process.cwd(), "apps"));
  return appsDir.filter((app) => {
    const stat = fs.statSync(path.join(process.cwd(), "apps", app));
    const hasConfig = fs.existsSync(path.join(process.cwd(), "apps", app, "config.json"));
    return stat.isDirectory() && hasConfig;
  });
};

const getAppConfig = (app: string): AppConfig => {
  const configPath = path.join(process.cwd(), "apps", app, "config.json");
  return JSON.parse(fs.readFileSync(configPath, "utf-8"));
};

const getFile = (app: string, file: string): string | null => {
  const filePath = path.join(process.cwd(), "apps", app, file);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
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

describe("each app should have the required files", () => {
  const apps = getApps();

  for (const app of apps) {
    const files = ["config.json", "docker-compose.json", "metadata/logo.jpg", "metadata/description.md"];

    for (const file of files) {
      test(`app ${app} should have ${file}`, () => {
        const fileContent = getFile(app, file);
        expect(fileContent).not.toBeNull();
      });
    }
  }
});

describe("each app should have a valid config.json", () => {
  const apps = getApps();

  for (const app of apps) {
    test(`app ${app} should have a valid config.json`, () => {
      const config = getAppConfig(app);

      expect(config.id).toBeDefined();
      expect(config.name).toBeDefined();
      expect(config.available).toBeDefined();
      expect(config.tipi_version).toBeDefined();
      expect(config.tipi_version).toBeGreaterThan(0);
      expect(config.short_desc).toBeDefined();
      expect(config.author).toBeDefined();
      expect(config.source).toBeDefined();
    });
  }
});

describe("each app should have a valid docker-compose.json", async () => {
  const apps = getApps();
  const validateDynamic = await dynamicValidatorPromise;

  for (const app of apps) {
    test(`app ${app} should have a valid docker-compose.json`, () => {
      const fileContent = getFile(app, "docker-compose.json");
      const parsed = JSON.parse(fileContent || "{}");

      // Validate against JSON schema
      const { $schema: _, ...dataToValidate } = parsed;
      const schemaValid = validateDynamic(dataToValidate);
      if (!schemaValid) {
        console.error(`Schema validation failed for app ${app}:`, validateDynamic.errors);
      }
      expect(schemaValid).toBe(true);

      // Validate against @runtipi/common parser
      try {
        const res = parseComposeJson(parsed);
        expect(res).toBeDefined();
      } catch (err) {
        console.error(`parseComposeJson failed for app ${app}:`, err);
        expect(err).toBeUndefined();
      }
    });
  }
});

describe("each app should have unique ports", () => {
  test("no duplicate ports", () => {
    const apps = getApps();
    const ports = apps.map((app) => getAppConfig(app).port).filter(Boolean);
    expect(new Set(ports).size).toBe(ports.length);
  });
});

describe("each app should have a unique id", () => {
  test("no duplicate ids", () => {
    const apps = getApps();
    const ids = apps.map((app) => getAppConfig(app).id);
    expect(new Set(ids).size).toBe(apps.length);
  });
});

describe("each app should have timestamps", () => {
  const apps = getApps();

  for (const app of apps) {
    test(`app ${app} should have valid created_at and updated_at`, () => {
      const config = getAppConfig(app);
      expect(config.created_at).toBeDefined();
      expect(config.created_at).toBeGreaterThan(0);
      expect(config.updated_at).toBeDefined();
      expect(config.updated_at).toBeGreaterThan(0);
    });
  }
});

describe("random form fields should not be required", () => {
  const apps = getApps();

  for (const app of apps) {
    const config = getAppConfig(app);
    if (config.form_fields) {
      for (const field of config.form_fields) {
        if (field.type === "random") {
          test(`app ${app} random field should not be required`, () => {
            expect(Boolean(field.required)).toBe(false);
          });
        }
      }
    }
  }
});
