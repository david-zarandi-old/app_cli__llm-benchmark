import fs from "node:fs";
import { join } from "node:path";
import { Ollama } from "langchain/llms/ollama";
import { getModelConfigs } from "./get-model-configs";
import { getPrompts } from "./get-prompts";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const RESULTS_DIRECTORY_NAME = "results";

async function benchmarkModel(
  modelName: string,
  config: ReturnType<typeof getModelConfigs>[number],
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
