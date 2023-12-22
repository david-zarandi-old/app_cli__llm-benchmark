import fs from "node:fs";
import { join } from "node:path";

const PROMPTS_DIRECTORY_NAME = "prompts";

export function getPrompts() {
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
