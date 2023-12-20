import fs from "node:fs";
import { join } from "node:path";
import { Ollama, OllamaInput } from "langchain/llms/ollama";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const RESULTS_DIRECTORY_NAME = "results";
const MODELS_DIRECTORY_NAME = "models";
const PROMPTS_DIRECTORY_NAME = "prompts";

type ModelConfig = Omit<OllamaInput, "model" | "baseUrl">;

function getModelConfigs() {
  const modelConfigs: Record<string, ModelConfig> = {};

  const fileNames = fs.readdirSync(
    MODELS_DIRECTORY_NAME,
  ) as Array<`${string}.json`>;

  for (const fileName of fileNames) {
    const fileContent = fs.readFileSync(
      join(MODELS_DIRECTORY_NAME, fileName),
      "utf8",
    );

    Object.entries(
      JSON.parse(fileContent) as ReturnType<typeof getModelConfigs>,
    ).forEach(([parameterKey, config]) => {
      modelConfigs[`${fileName.replace(".json", "")}:${parameterKey}`] = config;
    });
  }

  return modelConfigs;
}

function getPrompts() {
  const prompts: Record<string, string> = {};

  const fileNames = fs.readdirSync(
    PROMPTS_DIRECTORY_NAME,
  ) as Array<`${string}.txt`>;

  for (const fileName of fileNames) {
    prompts[fileName] = fs.readFileSync(
      join(PROMPTS_DIRECTORY_NAME, fileName),
      "utf8",
    );
  }

  return prompts;
}

async function benchmarkModel(
  modelName: string,
  config: ModelConfig,
  prompts: ReturnType<typeof getPrompts>,
) {
  const modelDirectoryPath = join(RESULTS_DIRECTORY_NAME, modelName);
  if (!fs.existsSync(modelDirectoryPath)) {
    fs.mkdirSync(modelDirectoryPath);
  }

  const ollama = new Ollama({
    baseUrl: OLLAMA_BASE_URL,
    model: modelName,
    ...config,
  });

  for (const [promptName, promptContent] of Object.entries(prompts)) {
    const promptFilePath = join(modelDirectoryPath, promptName);
    if (fs.existsSync(promptFilePath)) {
      process.stdout.write(
        `${modelName} - ${promptName.replace(".txt", "")} skipped\n`,
      );
      continue;
    }

    process.stdout.write(`${modelName} - ${promptName.replace(".txt", "")}\n`);

    const promptFileStream = fs.createWriteStream(promptFilePath);
    for await (const chunk of await ollama.stream(promptContent)) {
      promptFileStream.write(chunk);
    }
  }
}

async function runBenchmark() {
  if (!fs.existsSync(RESULTS_DIRECTORY_NAME)) {
    fs.mkdirSync(RESULTS_DIRECTORY_NAME);
  }

  const modelConfigs = getModelConfigs();
  const prompts = getPrompts();

  for (const [modelName, config] of Object.entries(modelConfigs)) {
    await benchmarkModel(modelName, config, prompts);
  }
}

runBenchmark().catch(console.error);
