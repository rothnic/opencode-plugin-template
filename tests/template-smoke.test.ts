import { describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdirSync, mkdtempSync, symlinkSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";

const repoRoot = resolve(import.meta.dir, "..");
const bunExecutable = Bun.which("bun") ?? process.execPath;

function copyTemplateRepo(destination: string) {
  cpSync(repoRoot, destination, {
    recursive: true,
    filter: (source) => !source.includes(`${join(repoRoot, ".git")}`) && !source.includes(`${join(repoRoot, "node_modules")}`),
  });
}

function setupProject(projectDir: string, args: string[]) {
  return Bun.spawnSync([bunExecutable, "setup.ts", "--non-interactive", ...args], {
    cwd: projectDir,
    env: process.env,
    stdout: "pipe",
    stderr: "pipe",
  });
}

async function readFrontmatter(filePath: string) {
  const content = await Bun.file(filePath).text();
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    throw new Error(`Missing frontmatter in ${filePath}`);
  }
  return match[1];
}

function topLevelFrontmatterKeys(frontmatter: string) {
  return frontmatter
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0 && !line.trimStart().startsWith("#") && !line.startsWith(" ") && line.includes(":"))
    .map((line) => line.split(":")[0]!.trim());
}

describe("template smoke test", () => {
  test("scaffolds a usable core-only plugin project and supports local plugin linking", async () => {
    const workspace = mkdtempSync(join(tmpdir(), "opencode-plugin-template-"));
    const generatedProject = join(workspace, "smoke-plugin");
    copyTemplateRepo(generatedProject);

    const setup = setupProject(generatedProject, [
      "--plugin-name",
      "smoke-plugin",
      "--description",
      "Smoke test plugin",
      "--author",
      "Template Test",
      "--license",
      "MIT",
    ]);

    expect(setup.exitCode).toBe(0);
    expect(existsSync(join(generatedProject, "template"))).toBe(false);
    expect(existsSync(join(generatedProject, "setup.ts"))).toBe(false);
    expect(existsSync(join(generatedProject, ".github"))).toBe(false);
    expect(existsSync(join(generatedProject, ".opencode", "plugins", "smoke-plugin", "index.ts"))).toBe(true);
    expect(existsSync(join(generatedProject, ".opencode", "plugins", "smoke-plugin", "config"))).toBe(false);
    expect(existsSync(join(generatedProject, ".opencode", "plugins", "smoke-plugin", "state"))).toBe(false);
    expect(existsSync(join(generatedProject, ".opencode", "plugins", "smoke-plugin", "database"))).toBe(false);
    expect(existsSync(join(generatedProject, ".opencode", "agents"))).toBe(false);
    expect(existsSync(join(generatedProject, ".opencode", "commands"))).toBe(false);
    expect(existsSync(join(generatedProject, ".opencode", "skills"))).toBe(false);
    expect(existsSync(join(generatedProject, ".opencode", "tools"))).toBe(false);
    expect(existsSync(join(generatedProject, "tests", "plugin.test.ts"))).toBe(true);

    const generatedInstall = Bun.spawnSync([bunExecutable, "install"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(generatedInstall.exitCode).toBe(0);

    const generatedBuild = Bun.spawnSync([bunExecutable, "run", "build"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(generatedBuild.exitCode).toBe(0);

    const generatedLint = Bun.spawnSync([bunExecutable, "run", "lint"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(generatedLint.exitCode).toBe(0);

    const generatedTests = Bun.spawnSync([bunExecutable, "test", "tests/plugin.test.ts"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(generatedTests.exitCode).toBe(0);

    const pkg = (await Bun.file(join(generatedProject, "package.json")).json()) as Record<string, unknown>;
    expect(pkg).toMatchObject({ name: "smoke-plugin" });
    expect(pkg).not.toHaveProperty("bun-create");

    const generatedReadme = await Bun.file(join(generatedProject, "README.md")).text();
    expect(generatedReadme).toContain("## Core best practices included by default");
    expect(generatedReadme).toContain("## Available add-ons");

    const consumerProject = join(workspace, "consumer-project");
    mkdirSync(join(consumerProject, ".opencode", "plugins"), { recursive: true });
    symlinkSync(
      join(generatedProject, ".opencode", "plugins", "smoke-plugin"),
      join(consumerProject, ".opencode", "plugins", "smoke-plugin"),
      "dir",
    );

    const localLoad = Bun.spawnSync(
      [
        bunExecutable,
        "-e",
        "import('./.opencode/plugins/smoke-plugin/index.ts').then((mod) => process.stdout.write(typeof mod.default))",
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

  test("generated project add-ons and sqlite helper both work", async () => {
    const workspace = mkdtempSync(join(tmpdir(), "opencode-plugin-template-"));
    const generatedProject = join(workspace, "sqlite-plugin");
    copyTemplateRepo(generatedProject);

    const setup = setupProject(generatedProject, [
      "--plugin-name",
      "sqlite-plugin",
      "--description",
      "SQLite test plugin",
      "--author",
      "Template Test",
      "--license",
      "MIT",
      "--addon",
      "config",
      "--addon",
      "state",
      "--addon",
      "database",
      "--addon",
      "agent",
      "--addon",
      "command",
      "--addon",
      "skill",
      "--addon",
      "tool",
    ]);

    expect(setup.exitCode).toBe(0);

    const generatedInstall = Bun.spawnSync([bunExecutable, "install"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(generatedInstall.exitCode).toBe(0);

    const generatedBuild = Bun.spawnSync([bunExecutable, "run", "build"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(generatedBuild.exitCode).toBe(0);

    const generatedLint = Bun.spawnSync([bunExecutable, "run", "lint"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(generatedLint.exitCode).toBe(0);

    const generatedTests = Bun.spawnSync([bunExecutable, "test", "tests/plugin.test.ts"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(generatedTests.exitCode).toBe(0);

    const agentFrontmatter = await readFrontmatter(join(generatedProject, ".opencode", "agents", "template.md"));
    expect(topLevelFrontmatterKeys(agentFrontmatter)).toEqual(["description", "mode"]);
    expect(agentFrontmatter).toContain("mode: subagent");

    const commandFrontmatter = await readFrontmatter(join(generatedProject, ".opencode", "commands", "template.md"));
    expect(topLevelFrontmatterKeys(commandFrontmatter)).toEqual(["description"]);

    const skillFrontmatter = await readFrontmatter(join(generatedProject, ".opencode", "skills", "template", "SKILL.md"));
    expect(topLevelFrontmatterKeys(skillFrontmatter)).toEqual(["name", "description"]);
    expect(skillFrontmatter).toContain("name: template");

    const toolStarter = await Bun.file(join(generatedProject, ".opencode", "tools", "example-tool.ts")).text();
    expect(toolStarter).toContain("export const exampleTool = tool(");

    const pluginIndex = await Bun.file(join(generatedProject, ".opencode", "plugins", "sqlite-plugin", "index.ts")).text();
    expect(pluginIndex).toContain('"example-custom-tool": exampleTool');

    const sqliteCheck = Bun.spawnSync(
      [
        bunExecutable,
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
  });

  test("generated logging guardrails warn on commit and block on push", async () => {
    const workspace = mkdtempSync(join(tmpdir(), "opencode-plugin-template-"));
    const generatedProject = join(workspace, "logging-plugin");
    copyTemplateRepo(generatedProject);

    const setup = setupProject(generatedProject, [
      "--plugin-name",
      "logging-plugin",
      "--description",
      "Logging test plugin",
      "--author",
      "Template Test",
      "--license",
      "MIT",
      "--addon",
      "tool",
    ]);

    expect(setup.exitCode).toBe(0);

    const pluginFile = join(generatedProject, ".opencode", "plugins", "logging-plugin", "index.ts");
    const original = await Bun.file(pluginFile).text();
    await Bun.write(pluginFile, `${original}\nconsole.log("should be blocked");\n`);

    const warnCheck = Bun.spawnSync([bunExecutable, "run", "scripts/check-plugin-logging.ts", "warn"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(warnCheck.exitCode).toBe(0);
    expect(new TextDecoder().decode(warnCheck.stderr)).toContain("Warning: direct console logging found");

    const blockCheck = Bun.spawnSync([bunExecutable, "run", "scripts/check-plugin-logging.ts", "block"], {
      cwd: generatedProject,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(blockCheck.exitCode).toBe(1);
    expect(new TextDecoder().decode(blockCheck.stderr)).toContain("Direct console logging is blocked");
  });
});
