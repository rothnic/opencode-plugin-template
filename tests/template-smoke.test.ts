import { describe, expect, test } from "bun:test";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { spawnSync } from "child_process";

const repoRoot = resolve(import.meta.dir, "..");

function copyTemplateRepo(destination: string) {
  cpSync(repoRoot, destination, {
    recursive: true,
    filter: (source) => !source.includes(`${join(repoRoot, ".git")}`) && !source.includes(`${join(repoRoot, "node_modules")}`),
  });
}

describe("template smoke test", () => {
  test("scaffolds a usable plugin project and supports local plugin linking", () => {
    const workspace = mkdtempSync(join(tmpdir(), "opencode-plugin-template-"));
    const generatedProject = join(workspace, "smoke-plugin");
    copyTemplateRepo(generatedProject);

    const setup = spawnSync("node", ["--experimental-strip-types", "setup.ts"], {
      cwd: generatedProject,
      encoding: "utf-8",
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
      },
    });

    expect(setup.status).toBe(0);
    expect(existsSync(join(generatedProject, "template"))).toBe(false);
    expect(existsSync(join(generatedProject, "setup.ts"))).toBe(false);
    expect(existsSync(join(generatedProject, ".github"))).toBe(false);
    expect(existsSync(join(generatedProject, ".opencode", "plugins", "smoke-plugin", "index.ts"))).toBe(true);
    expect(existsSync(join(generatedProject, "tests", "plugin.test.ts"))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(generatedProject, "package.json"), "utf-8"));
    expect(pkg.name).toBe("smoke-plugin");
    expect(pkg["bun-create"]).toBeUndefined();

    const generatedTests = spawnSync("bun", ["test", "tests/plugin.test.ts"], {
      cwd: generatedProject,
      encoding: "utf-8",
    });

    expect(generatedTests.status).toBe(0);

    const consumerProject = join(workspace, "consumer-project");
    mkdirSync(join(consumerProject, ".opencode", "plugins"), { recursive: true });
    symlinkSync(
      join(generatedProject, ".opencode", "plugins", "smoke-plugin"),
      join(consumerProject, ".opencode", "plugins", "smoke-plugin"),
      "dir",
    );

    const localLoad = spawnSync(
      "bun",
      [
        "-e",
        "import('./.opencode/plugins/smoke-plugin/index.ts').then((mod) => process.stdout.write(typeof mod.default))",
      ],
      {
        cwd: consumerProject,
        encoding: "utf-8",
      },
    );

    expect(localLoad.status).toBe(0);
    expect(localLoad.stdout.trim()).toBe("function");
  });
});
