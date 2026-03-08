import { describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdirSync, mkdtempSync, symlinkSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const repoRoot = resolve(import.meta.dir, "..");

function copyTemplateRepo(destination: string) {
  cpSync(repoRoot, destination, {
    recursive: true,
    filter: (source) => !source.includes(`${join(repoRoot, ".git")}`) && !source.includes(`${join(repoRoot, "node_modules")}`),
  });
}

describe("template smoke test", () => {
  test("scaffolds a usable plugin project and supports local plugin linking", async () => {
    const workspace = mkdtempSync(join(tmpdir(), "opencode-plugin-template-"));
    const generatedProject = join(workspace, "smoke-plugin");
    copyTemplateRepo(generatedProject);

    const setup = Bun.spawnSync([process.execPath, "setup.ts"], {
      cwd: generatedProject,
      env: {
        ...process.env,
        OPENCODE_TEMPLATE_NONINTERACTIVE: "1",
        OPENCODE_TEMPLATE_PLUGIN_NAME: "smoke-plugin",
        OPENCODE_TEMPLATE_PLUGIN_DESCRIPTION: "Smoke test plugin",
        OPENCODE_TEMPLATE_PLUGIN_AUTHOR: "Template Test",
        OPENCODE_TEMPLATE_PLUGIN_LICENSE: "MIT",
        OPENCODE_TEMPLATE_KEEP_AGENT: "y",
        OPENCODE_TEMPLATE_KEEP_SKILL: "y",
        OPENCODE_TEMPLATE_KEEP_TOOL: "y",
        OPENCODE_TEMPLATE_KEEP_STATE: "y",
        OPENCODE_TEMPLATE_KEEP_DATABASE: "y",
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(setup.exitCode).toBe(0);
    expect(existsSync(join(generatedProject, "template"))).toBe(false);
    expect(existsSync(join(generatedProject, "setup.ts"))).toBe(false);
    expect(existsSync(join(generatedProject, ".github"))).toBe(false);
    expect(existsSync(join(generatedProject, ".opencode", "plugins", "smoke-plugin", "index.ts"))).toBe(true);
    expect(existsSync(join(generatedProject, ".opencode", "plugins", "smoke-plugin", "database", "index.ts"))).toBe(true);
    expect(existsSync(join(generatedProject, "tests", "plugin.test.ts"))).toBe(true);

    const pkg = (await Bun.file(join(generatedProject, "package.json")).json()) as Record<string, unknown>;
    expect(pkg).toMatchObject({ name: "smoke-plugin" });
    expect(pkg).not.toHaveProperty("bun-create");
  });

  test("generated project test and sqlite helper both work", async () => {
    const workspace = mkdtempSync(join(tmpdir(), "opencode-plugin-template-"));
    const generatedProject = join(workspace, "sqlite-plugin");
    copyTemplateRepo(generatedProject);

    const setup = Bun.spawnSync([process.execPath, "setup.ts"], {
      cwd: generatedProject,
      env: {
        ...process.env,
        OPENCODE_TEMPLATE_NONINTERACTIVE: "1",
        OPENCODE_TEMPLATE_PLUGIN_NAME: "sqlite-plugin",
        OPENCODE_TEMPLATE_PLUGIN_DESCRIPTION: "SQLite test plugin",
        OPENCODE_TEMPLATE_PLUGIN_AUTHOR: "Template Test",
        OPENCODE_TEMPLATE_PLUGIN_LICENSE: "MIT",
        OPENCODE_TEMPLATE_KEEP_AGENT: "n",
        OPENCODE_TEMPLATE_KEEP_SKILL: "n",
        OPENCODE_TEMPLATE_KEEP_TOOL: "n",
        OPENCODE_TEMPLATE_KEEP_STATE: "y",
        OPENCODE_TEMPLATE_KEEP_DATABASE: "y",
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(setup.exitCode).toBe(0);

    const generatedTests = Bun.spawnSync([process.execPath, "test", "tests/plugin.test.ts"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(generatedTests.exitCode).toBe(0);

    const sqliteCheck = Bun.spawnSync(
      [
        process.execPath,
        "-e",
        [
          "import { PluginDatabase } from './.opencode/plugins/sqlite-plugin/database/index.ts';",
          "const db = await PluginDatabase.open('sqlite-plugin', { directory: process.cwd() });",
          "db.set('healthcheck', { ok: true });",
          "const row = db.get('healthcheck');",
          "db.close();",
          "process.stdout.write(String(row?.value.ok));",
        ].join(" "),
      ],
      {
        cwd: generatedProject,
        stdout: "pipe",
        stderr: "pipe",
      },
    );

    expect(sqliteCheck.exitCode).toBe(0);
    expect(new TextDecoder().decode(sqliteCheck.stdout).trim()).toBe("true");

    const consumerProject = join(workspace, "consumer-project");
    mkdirSync(join(consumerProject, ".opencode", "plugins"), { recursive: true });
    symlinkSync(
      join(generatedProject, ".opencode", "plugins", "sqlite-plugin"),
      join(consumerProject, ".opencode", "plugins", "sqlite-plugin"),
      "dir",
    );

    const localLoad = Bun.spawnSync(
      [
        process.execPath,
        "-e",
        "import('./.opencode/plugins/sqlite-plugin/index.ts').then((mod) => process.stdout.write(typeof mod.default))",
      ],
      {
        cwd: consumerProject,
        stdout: "pipe",
        stderr: "pipe",
      },
    );

    expect(localLoad.exitCode).toBe(0);
    expect(new TextDecoder().decode(localLoad.stdout).trim()).toBe("function");
  });

  test("generated logging guardrails warn on commit and block on push", async () => {
    const workspace = mkdtempSync(join(tmpdir(), "opencode-plugin-template-"));
    const generatedProject = join(workspace, "logging-plugin");
    copyTemplateRepo(generatedProject);

    const setup = Bun.spawnSync([process.execPath, "setup.ts"], {
      cwd: generatedProject,
      env: {
        ...process.env,
        OPENCODE_TEMPLATE_NONINTERACTIVE: "1",
        OPENCODE_TEMPLATE_PLUGIN_NAME: "logging-plugin",
        OPENCODE_TEMPLATE_PLUGIN_DESCRIPTION: "Logging test plugin",
        OPENCODE_TEMPLATE_PLUGIN_AUTHOR: "Template Test",
        OPENCODE_TEMPLATE_PLUGIN_LICENSE: "MIT",
        OPENCODE_TEMPLATE_KEEP_AGENT: "n",
        OPENCODE_TEMPLATE_KEEP_SKILL: "n",
        OPENCODE_TEMPLATE_KEEP_TOOL: "y",
        OPENCODE_TEMPLATE_KEEP_STATE: "n",
        OPENCODE_TEMPLATE_KEEP_DATABASE: "n",
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(setup.exitCode).toBe(0);

    const pluginFile = join(generatedProject, ".opencode", "plugins", "logging-plugin", "index.ts");
    const original = await Bun.file(pluginFile).text();
    await Bun.write(pluginFile, `${original}\nconsole.log("should be blocked");\n`);

    const warnCheck = Bun.spawnSync([process.execPath, "run", "scripts/check-plugin-logging.ts", "warn"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(warnCheck.exitCode).toBe(0);
    expect(new TextDecoder().decode(warnCheck.stderr)).toContain("Warning: direct console logging found");

    const blockCheck = Bun.spawnSync([process.execPath, "run", "scripts/check-plugin-logging.ts", "block"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(blockCheck.exitCode).toBe(1);
    expect(new TextDecoder().decode(blockCheck.stderr)).toContain("Direct console logging is blocked");
  });
});
