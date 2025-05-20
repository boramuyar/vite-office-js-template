import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";
import * as esbuild from "esbuild";
// Import the 'generate' function and IGenerateResult type
import {
  generateCustomFunctionsMetadata,
  type IGenerateResult,
} from "custom-functions-metadata";
import path from "path";

export interface OfficeFunctionsPluginOptions {
  input: string | string[];
  outputJsName?: string;
  outputJsonName?: string;
  target?: string | string[];
  logMetadataGeneration?: boolean;
}

const DEFAULT_JS_NAME = "functions.js";
const DEFAULT_JSON_NAME = "functions.json";

export default function officeFunctionsPlugin(
  options: OfficeFunctionsPluginOptions
): Plugin {
  if (
    !options.input ||
    (Array.isArray(options.input) && options.input.length === 0)
  ) {
    throw new Error('[vite-plugin-office-functions] Missing "input" option.');
  }

  const outputJsName = options.outputJsName || DEFAULT_JS_NAME;
  const outputJsonName = options.outputJsonName || DEFAULT_JSON_NAME;
  const logMetadata = options.logMetadataGeneration || false;

  let viteConfig: ResolvedConfig;
  let generatedJsContent: string | null = null;
  let generatedJsonContent: string | null = null;
  let generateResult: IGenerateResult | null = null;

  const getEntryPoints = () => {
    const inputs = Array.isArray(options.input)
      ? options.input
      : [options.input];
    return inputs.map((p) => path.resolve(viteConfig.root, p));
  };

  const getMetadataInputFile = () => {
    const entryPoints = getEntryPoints();
    // custom-functions-metadata's generate function can take string | string[]
    // but for consistency with how Office usually expects one metadata source,
    // we'll still conceptually use the first for "primary" metadata generation.
    // The `generate` function itself might handle multiple inputs for metadata if designed so.
    // Based on its typical CLI usage (input file, output file), it's safer to assume
    // it processes the input file(s) to extract metadata.
    // If it aggregates metadata from multiple files, then `entryPoints` is fine.
    // If it expects a single primary source, `entryPoints[0]` is better.
    // Let's assume it can handle an array for metadata source files.
    return entryPoints;
  };

  async function regenerateFiles(isBuild: boolean, server?: ViteDevServer) {
    if (!viteConfig) {
      console.warn(
        "[vite-plugin-office-functions] Vite config not resolved. Skipping generation."
      );
      return;
    }

    const jsEntryPoints = getEntryPoints();
    const metadataInputFiles = getMetadataInputFile(); // This could be string or string[]

    // 1. Generate functions.json
    try {
      // The `generate` function returns a Promise<IGenerateResult>
      const result: IGenerateResult = await generateCustomFunctionsMetadata(
        metadataInputFiles,
        logMetadata
      );

      // Store the result for adding associations later
      generateResult = result;

      if (result.errors && result.errors.length > 0) {
        console.error(
          `[vite-plugin-office-functions] Errors during ${outputJsonName} generation:`,
          result.errors.join("\n")
        );
        generatedJsonContent = JSON.stringify({
          error: `Failed to generate ${outputJsonName}`,
          details: result.errors,
        });
      } else if (result.metadataJson) {
        generatedJsonContent = result.metadataJson;
      } else {
        throw new Error("No metadata generated and no errors reported.");
      }

      if (!isBuild && server && generatedJsonContent) {
        server.ws.send({
          type: "custom",
          event: "office-functions-updated",
          data: { file: outputJsonName },
        });
      }
    } catch (e: any) {
      const errorMessage = `[vite-plugin-office-functions] Error generating ${outputJsonName}: ${e.message}`;
      console.error(errorMessage, e);
      generatedJsonContent = JSON.stringify({
        error: `Failed to generate ${outputJsonName}`,
        details: e.message,
      });
    }

    // 2. Generate functions.js
    try {
      const esbuildResult = await esbuild.build({
        entryPoints: jsEntryPoints,
        bundle: true,
        write: false,
        format: "iife",
        platform: "browser",
        target: options.target || viteConfig.build.target || "es2020",
        minify: isBuild ? (viteConfig.build.minify ? true : false) : false,
        sourcemap: viteConfig.command === "serve" ? "inline" : false,
        sourcesContent: viteConfig.command === "serve" ? true : false,
      });
      if (esbuildResult.outputFiles && esbuildResult.outputFiles.length > 0) {
        let jsContent = esbuildResult.outputFiles[0].text;

        generatedJsContent = jsContent;
        if (!isBuild && server && generatedJsContent) {
          server.ws.send({ type: "full-reload" });
          server.ws.send({
            type: "custom",
            event: "office-functions-updated",
            data: { file: outputJsName },
          });
        }
      } else {
        throw new Error("esbuild did not produce output files.");
      }
    } catch (e: any) {
      const errorMessage = `[vite-plugin-office-functions] Error generating ${outputJsName}: ${e.message}`;
      console.error(errorMessage, e);
      generatedJsContent = `console.error("Failed to build ${outputJsName}: ${e.message.replace(/"/g, '\\"').replace(/\n/g, "\\n")}");`;
    }
  }

  return {
    name: "vite-plugin-office-functions",

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },

    async buildStart() {
      if (viteConfig.command === "build") {
        console.log(
          `[vite-plugin-office-functions] Generating ${outputJsName} and ${outputJsonName} for build...`
        );
        await regenerateFiles(true);
      }
    },

    async configureServer(server) {
      console.log(
        `[vite-plugin-office-functions] Generating ${outputJsName} and ${outputJsonName} for dev server...`
      );
      await regenerateFiles(false, server);

      const inputFilesToWatch = getEntryPoints();
      if (inputFilesToWatch.length > 0) {
        server.watcher.add(inputFilesToWatch);
      }

      const handleFileChange = async (changedPath: string) => {
        const normalizedChangedPath = path.normalize(changedPath);
        if (
          inputFilesToWatch.some(
            (inputFile) => path.normalize(inputFile) === normalizedChangedPath
          )
        ) {
          console.log(
            `[vite-plugin-office-functions] Detected change in ${path.relative(viteConfig.root, changedPath)}. Regenerating...`
          );
          await regenerateFiles(false, server);
        }
      };

      server.watcher.on("change", handleFileChange);
      server.watcher.on("add", handleFileChange);

      server.middlewares.use(async (req, res, next) => {
        if (req.url === `/${outputJsonName}`) {
          if (generatedJsonContent) {
            return res
              .writeHead(200, { "Content-Type": "application/json" })
              .end(generatedJsonContent);
          }
          console.warn(
            `[vite-plugin-office-functions] ${outputJsonName} requested but not generated.`
          );
          return res.writeHead(404).end("Not Found");
        }
        if (req.url === `/${outputJsName}`) {
          if (generatedJsContent) {
            return res
              .writeHead(200, { "Content-Type": "application/javascript" })
              .end(generatedJsContent);
          }
          console.warn(
            `[vite-plugin-office-functions] ${outputJsName} requested but not generated.`
          );
          return res.writeHead(404).end("Not Found");
        }
        next();
      });
    },

    generateBundle() {
      if (viteConfig.command === "build") {
        if (generatedJsonContent) {
          this.emitFile({
            type: "asset",
            fileName: outputJsonName,
            source: generatedJsonContent,
          });
        } else {
          console.warn(
            `[vite-plugin-office-functions] No content for ${outputJsonName} to emit for build.`
          );
        }
        if (generatedJsContent) {
          this.emitFile({
            type: "asset",
            fileName: outputJsName,
            source: generatedJsContent,
          });
        } else {
          console.warn(
            `[vite-plugin-office-functions] No content for ${outputJsName} to emit for build.`
          );
        }
      }
    },
  };
}
