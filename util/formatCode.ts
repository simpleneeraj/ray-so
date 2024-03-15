import { Language } from "./languages";

const parsers = {
  JavaScript: { import: () => import("prettier/plugins/babel"), name: "babel" },
  TypeScript: { import: () => import("prettier/plugins/typescript"), name: "typescript" },
  TSX: { import: () => import("prettier/plugins/typescript"), name: "typescript" },
  Markdown: { import: () => import("prettier/plugins/markdown"), name: "markdown" },
  HTML: { import: () => import("prettier/plugins/html"), name: "html" },
  CSS: { import: () => import("prettier/plugins/postcss"), name: "css" },
  SCSS: { import: () => import("prettier/plugins/postcss"), name: "css" },
  YAML: { import: () => import("prettier/plugins/yaml"), name: "yaml" },
};

export const formatterSupportedLanguages: Language["name"][] = Object.keys(parsers);

const prettierConfig = {
  singleQuote: false,
  printWidth: 120,
};

const formatCode = async (code: string, language: Language | null) => {
  if (!language || !formatterSupportedLanguages.includes(language.name)) {
    return code;
  }
  const prettier = await import("prettier/standalone");

  const parser = parsers[language.name as keyof typeof parsers];
  if (!parser) {
    throw new Error(`No parser found for language: ${language.name}`);
  }
  const parserModule = await parser.import();
  const plugins = [parserModule.default];

  // Add estree plugin for TypeScript, TSX, and JavaScript
  if (["TSX", "TypeScript", "JavaScript"].includes(language.name)) {
    const estree = await import("prettier/plugins/estree");
    plugins.push(estree.default as typeof parserModule.default);
  }

  const formatted = await prettier.format(code, {
    parser: parser.name,
    plugins,
    ...prettierConfig,
  });

  // remove trailing newline added by prettier
  // https://github.com/prettier/prettier/issues/6360#issuecomment-520368783
  return formatted.replace(/\n$/, "");
};

export default formatCode;
