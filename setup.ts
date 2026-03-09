#!/usr/bin/env bun

import { object } from "@optique/core/constructs";
import { multiple } from "@optique/core/modifiers";
import { option } from "@optique/core/primitives";
import { choice, string } from "@optique/core/valueparser";
import { run } from "@optique/run";
import { mkdir, readdir, rename, rm } from "node:fs/promises";

const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

const addonCatalog = {
  agent: {
    description: "Bundled `.opencode/agents/` starter.",
    paths: [".opencode/agents"],
  },
  command: {
    description: "Bundled `.opencode/commands/` starter.",
    paths: [".opencode/commands"],
  },
  skill: {
    description: "Bundled `.opencode/skills/` starter.",
    paths: [".opencode/skills"],
  },
  tool: {
    description: "Bundled `.opencode/tools/` starter and tool registration example.",
    paths: [".opencode/tools"],
  },
  config: {
    description: "Config helper for plugin settings loaded from OpenCode config files.",
    paths: [".opencode/plugins/{{PLUGIN_NAME}}/config"],
  },
  state: {
    description: "JSON state helper for project/global plugin state.",
    paths: [".opencode/plugins/{{PLUGIN_NAME}}/state"],
  },
  database: {
    description: "Bun SQLite helper for local structured plugin storage.",
    paths: [".opencode/plugins/{{PLUGIN_NAME}}/database"],
  },
} as const;

// Add-on names are intentionally lowercase because both CLI flags and prompt
// input are normalized to lowercase before validation.
const addonNames = Object.keys(addonCatalog) as Array<keyof typeof addonCatalog>;
type AddonName = (typeof addonNames)[number];

const cliParser = object({
  pluginName: option("--plugin-name", string()),
  description: option("--description", string()),
  author: option("--author", string()),
  license: option("--license", string()),
  addon: multiple(option("--addon", choice(addonNames))),
  allAddons: option("--all-addons"),
  nonInteractive: option("--non-interactive", "--yes"),
});

function joinPath(...parts: string[]) {
  return parts
    .filter(Boolean)
    .join("/")
    .replace(/\/{2,}/g, "/");
}

function basename(pathname: string) {
  return pathname.split(/[/\\]+/).filter(Boolean).at(-1) ?? pathname;
}

function writeLine(message = "", color = colors.reset) {
  process.stdout.write(`${color}${message}${colors.reset}\n`);
}

function ask(question: string, fallback: string) {
  const answer = prompt(`${colors.cyan}${question}${colors.reset}`) ?? "";
  return answer.trim() || fallback;
}

/**
 * Parses a comma-separated add-on selection string.
 *
 * Supported special values:
 * - `none`: select no add-ons
 * - `all`: select every add-on
 *
 * Any other value must be a comma-separated list of valid add-on names.
 */
function normalizeAddonList(input: string): AddonName[] {
  if (!input.trim()) return [];

  const parts = input
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  if (parts.includes("all")) {
    return [...addonNames];
  }

  if (parts.includes("none")) {
    return [];
  }

  const unique = new Set<AddonName>();
  for (const part of parts) {
    if (addonNames.includes(part as AddonName)) {
      unique.add(part as AddonName);
      continue;
    }

    throw new Error(
      `Unknown add-on "${part}". Valid add-ons: ${addonNames.join(", ")}, "all", or "none".`,
    );
  }

  return [...unique].sort();
}

/**
 * Backward-compatibility layer for the previous environment-variable-based setup
 * flow. Newer automation should prefer `--addon` flags or `OPENCODE_TEMPLATE_ADDONS`,
 * but we still honor the older KEEP_* variables to avoid breaking existing usage.
 */
function legacyAddonsFromEnv(): AddonName[] {
  if (process.env.OPENCODE_TEMPLATE_ADDONS) {
    return normalizeAddonList(process.env.OPENCODE_TEMPLATE_ADDONS);
  }

  const selected = new Set<AddonName>();
  if ((process.env.OPENCODE_TEMPLATE_KEEP_AGENT ?? "n").toLowerCase().startsWith("y")) selected.add("agent");
  if ((process.env.OPENCODE_TEMPLATE_KEEP_COMMAND ?? "n").toLowerCase().startsWith("y")) selected.add("command");
  if ((process.env.OPENCODE_TEMPLATE_KEEP_SKILL ?? "n").toLowerCase().startsWith("y")) selected.add("skill");
  if ((process.env.OPENCODE_TEMPLATE_KEEP_TOOL ?? "n").toLowerCase().startsWith("y")) selected.add("tool");
  if ((process.env.OPENCODE_TEMPLATE_KEEP_CONFIG ?? "n").toLowerCase().startsWith("y")) selected.add("config");
  if ((process.env.OPENCODE_TEMPLATE_KEEP_STATE ?? "n").toLowerCase().startsWith("y")) selected.add("state");
  if ((process.env.OPENCODE_TEMPLATE_KEEP_DATABASE ?? "n").toLowerCase().startsWith("y")) {
    selected.add("database");
  }
  return [...selected];
}

/**
 * Resolves the final add-on selection using this precedence:
 *
 * 1. `--all-addons`
 * 2. repeated `--addon` flags
 * 3. legacy environment variables / `OPENCODE_TEMPLATE_ADDONS`
 * 4. interactive prompt fallback (interactive mode only)
 *
 * In non-interactive mode, the prompt path is skipped and the highest-priority
 * non-empty selection wins.
 */
function resolveAddons(nonInteractive: boolean, cliAddons: readonly AddonName[], allAddons: boolean): AddonName[] {
  const defaultAddons = allAddons
    ? [...addonNames]
    : cliAddons.length > 0
      ? [...cliAddons]
      : legacyAddonsFromEnv();

  if (nonInteractive) {
    return defaultAddons;
  }

  writeLine("\nCore best practices included in every generated plugin:", colors.cyan);
  writeLine("  • structured Logger wrapper around client.app.log()", colors.green);
  writeLine("  • logging guardrails via lefthook + logging check script", colors.green);
  writeLine("  • Bun build/lint/test/version-bump scripts", colors.green);
  writeLine("  • starter plugin hooks and local .opencode/plugins/<plugin-name>/ layout", colors.green);

  writeLine("\nOptional add-ons you can include now:", colors.yellow);
  for (const addonName of addonNames) {
    writeLine(`  • ${addonName}: ${addonCatalog[addonName].description}`, colors.green);
  }

  const fallback = defaultAddons.length > 0 ? defaultAddons.join(", ") : "none";
  const answer = ask(
    `Add-ons to include [${fallback}] (comma-separated, "none", or "all"): `,
    fallback,
  );

  return normalizeAddonList(answer);
}

async function copyDirectory(src: string, dest: string) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = joinPath(src, entry.name);
    const destPath = joinPath(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await Bun.write(destPath, Bun.file(srcPath));
    }
  }
}

async function replaceInFile(filePath: string, replacements: Record<string, string>) {
  const content = await Bun.file(filePath).text();
  let updated = content;

  for (const [key, value] of Object.entries(replacements)) {
    updated = updated.replaceAll(`{{${key}}}`, value);
  }

  if (updated !== content) {
    await Bun.write(filePath, updated);
  }
}

async function replaceInDirectory(dir: string, replacements: Record<string, string>) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = joinPath(dir, entry.name);
    if (entry.isDirectory()) {
      await replaceInDirectory(fullPath, replacements);
      continue;
    }

    if (entry.name.match(/\.(ts|js|json|md|yml|yaml)$/)) {
      await replaceInFile(fullPath, replacements);
    }
  }
}

/**
 * Removes add-on starter directories that were not selected for the generated
 * project. Core scaffold files remain untouched; only add-on paths from the
 * catalog are removed.
 */
async function removeUnselectedAddons(cwd: string, pluginName: string, selectedAddons: readonly AddonName[]) {
  const selected = new Set(selectedAddons);
  for (const addonName of addonNames) {
    if (selected.has(addonName)) continue;

    for (const rawPath of addonCatalog[addonName].paths) {
      const resolvedPath = rawPath.replaceAll("{{PLUGIN_NAME}}", pluginName);
      await rm(joinPath(cwd, resolvedPath), { recursive: true, force: true });
    }
  }
}

async function main() {
  const cli = run(cliParser, {
    programName: "bun run setup.ts",
    help: "option",
  });

  writeLine("\n" + "=".repeat(60));
  writeLine("  OpenCode Plugin Template Setup", colors.cyan);
  writeLine("=".repeat(60) + "\n");

  const cwd = process.cwd();
  const templateDir = joinPath(cwd, "template");
  const dirName = basename(cwd);
  const inferredPluginName = dirName.startsWith("opencode-plugin-")
    ? dirName.slice("opencode-plugin-".length)
    : dirName;

  const nonInteractive = cli.nonInteractive || process.env.OPENCODE_TEMPLATE_NONINTERACTIVE === "1";

  try {
    const envPluginName = process.env.OPENCODE_TEMPLATE_PLUGIN_NAME;
    const defaultPluginName = cli.pluginName || envPluginName || inferredPluginName;
    const pluginName = nonInteractive
      ? defaultPluginName
      : ask(`Plugin package name (${defaultPluginName}): `, defaultPluginName);
    const envDescription = process.env.OPENCODE_TEMPLATE_PLUGIN_DESCRIPTION;
    const defaultDescription = cli.description || envDescription || `OpenCode plugin: ${pluginName}`;
    const pluginDescription = nonInteractive
      ? defaultDescription
      : ask(
          `Plugin description (${defaultDescription}): `,
          defaultDescription,
        );
    const pluginAuthor = nonInteractive
      ? cli.author || process.env.OPENCODE_TEMPLATE_PLUGIN_AUTHOR || ""
      : ask("Author (): ", cli.author || "");
    const pluginLicense = nonInteractive
      ? cli.license || process.env.OPENCODE_TEMPLATE_PLUGIN_LICENSE || "MIT"
      : ask("License (MIT): ", cli.license || "MIT");
    const selectedAddons = resolveAddons(nonInteractive, cli.addon, cli.allAddons);

    writeLine("\nCleaning template-repo files...", colors.cyan);
    for (const repoOnlyPath of ["README.md", "AGENTS.md", "docs", "tests", ".ls-lint.yml", "lefthook.yml", ".github"]) {
      await rm(joinPath(cwd, repoOnlyPath), { recursive: true, force: true });
    }

    writeLine("\nCopying template files...", colors.cyan);
    const entries = await readdir(templateDir, { withFileTypes: true });

    for (const entry of entries) {
      const src = joinPath(templateDir, entry.name);
      const dest = joinPath(cwd, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(src, dest);
        writeLine(`  ✓ Copied ${entry.name}/`, colors.green);
        continue;
      }

      if (entry.name === "package.json.template") {
        await Bun.write(joinPath(cwd, "package.json"), Bun.file(src));
        writeLine("  ✓ Copied package.json", colors.green);
        continue;
      }

      await Bun.write(dest, Bun.file(src));
      writeLine(`  ✓ Copied ${entry.name}`, colors.green);
    }

    const replacements = {
      PLUGIN_NAME: pluginName,
      PLUGIN_DESCRIPTION: pluginDescription,
      PLUGIN_AUTHOR: pluginAuthor,
      PLUGIN_LICENSE: pluginLicense,
    };

    writeLine("\nApplying template variables...", colors.cyan);
    await replaceInDirectory(cwd, replacements);
    writeLine("  ✓ Replaced template variables", colors.green);

    const pluginTemplateDir = joinPath(cwd, ".opencode", "plugins", "{{PLUGIN_NAME}}");
    const pluginActualDir = joinPath(cwd, ".opencode", "plugins", pluginName);
    try {
      await rename(pluginTemplateDir, pluginActualDir);
      writeLine(`  ✓ Created .opencode/plugins/${pluginName}/`, colors.green);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (code !== "ENOENT") {
        throw error;
      }
      writeLine("  ! Plugin directory placeholder not found; continuing without rename", colors.yellow);
    }

    await removeUnselectedAddons(cwd, pluginName, selectedAddons);
    writeLine(
      `\nSelected add-ons: ${selectedAddons.length > 0 ? selectedAddons.join(", ") : "none (core scaffold only)"}`,
      colors.cyan,
    );

    const pkgPath = joinPath(cwd, "package.json");
    const pkg = (await Bun.file(pkgPath).json()) as Record<string, unknown>;
    delete pkg["bun-create"];
    await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

    await rm(templateDir, { recursive: true, force: true });
    await Bun.file(joinPath(cwd, "setup.ts")).delete();

    writeLine("\n" + "=".repeat(60));
    writeLine("  ✓ Setup Complete", colors.green);
    writeLine("=".repeat(60));
    writeLine(
      "\nNext steps:\n  1. bun install\n  2. bun run build\n  3. bun run lint\n  4. bun test\n  5. Review README.md for core vs add-on guidance\n",
      colors.cyan,
    );
  } finally {
    // No interactive resources to close when using Bun's built-in prompt().
  }
}

main().catch((error) => {
  writeLine(`\nSetup failed: ${error instanceof Error ? error.message : String(error)}`, colors.red);
  process.exit(1);
});
