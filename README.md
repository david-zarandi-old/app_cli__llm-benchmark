# LLM Benchmark

Welcome to the repository! This repository is made to benchmark LLMs using [ollama](https://github.com/jmorganca/ollama)
and typescript, it uses the [LangChain.js](https://github.com/langchain-ai/langchainjs) library to communicate with the
ollama server.

## Getting Started

### Prerequisites

- Node.js 20.9 or higher
- NPM 10.2.4 or higher

### Local setup

1. Clone this repository to your local machine.
2. Navigate to the repository folder in your terminal.
3. Run `npm install` to install all dependencies.
4. Run `npm run build` to compile the TypeScript code. 
5. Run `npm run clean:results` to clear the `results` directory 
6. If you aren't running the ollama server locally, you need to specify the base url by creating a `.env` file, using
the `.env.template` file.
6. Run `npm run benchmark` to execute the benchmarks 
7. Check the results `results` folder

## License

This project is licensed under the [BSD-3-Clause](LICENSE).
