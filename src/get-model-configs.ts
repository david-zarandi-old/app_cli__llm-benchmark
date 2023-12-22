import fs from "node:fs";
import { join } from "node:path";
import { OllamaInput } from "langchain/llms/ollama";

const MODELS_DIRECTORY_NAME = "models";

export function getModelConfigs() {
  const modelConfigs: Record<
    string,
    Omit<OllamaInput, "model" | "baseUrl">
  > = {};

  const fileNames = fs.readdirSync(
    MODELS_DIRECTORY_NAME,
  ) as Array<`${string}.json`>;

  for (const fileName of fileNames) {
    const fileContent = fs.readFileSync(
      join(MODELS_DIRECTORY_NAME, fileName),
      "utf8",
    );

    Object.entries(
      JSON.parse(fileContent) as Record<string, OllamaInput>,
    ).forEach(([parameterKey, config]) => {
      delete config?.["model"];
      delete config?.["baseUrl"];
      modelConfigs[`${fileName.replace(".json", "")}:${parameterKey}`] = config;
    });
  }

  return modelConfigs;
}
