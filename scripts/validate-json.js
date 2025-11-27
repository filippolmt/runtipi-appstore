import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import draft7MetaSchema from "ajv/dist/refs/json-schema-draft-07.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ajv = new Ajv2020({ allErrors: true, strict: false });
ajv.addMetaSchema(draft7MetaSchema);

async function validateJson() {
  // Use local schema (aligned with repo format)
  const schemaPath = path.join(__dirname, "..", "apps", "dynamic-compose-schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const validate = ajv.compile(schema);

  // Find all docker-compose.json files
  const appsDir = path.join(__dirname, "..", "apps");
  const files = [];

  function findFiles(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        findFiles(fullPath);
      } else if (item === "docker-compose.json") {
        files.push(fullPath);
      }
    }
  }

  findFiles(appsDir);

  let hasErrors = false;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      // Remove $schema for validation as it's meta
      const { $schema: _, ...dataToValidate } = data;
      const valid = validate(dataToValidate);
      if (!valid) {
        console.error(`Validation failed for ${file}:`);
        console.error(validate.errors);
        hasErrors = true;
      } else {
        console.log(`✓ ${path.relative(path.join(__dirname, ".."), file)}`);
      }
    } catch (error) {
      console.error(`Error reading/parsing ${file}: ${error.message}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log("All JSON files are valid!");
  }
}

validateJson().catch((error) => {
  console.error("Validation script error:", error);
  process.exit(1);
});
