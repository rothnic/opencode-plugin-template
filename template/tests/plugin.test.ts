import { describe, expect, test } from "bun:test";
import MyPlugin from "../index";

describe("generated plugin template", () => {
  test("exports a plugin function", () => {
    expect(typeof MyPlugin).toBe("function");
  });

  test("returns documented starter hooks", async () => {
    const hooks = await MyPlugin({
      project: { name: "demo", path: "/tmp/demo" },
      directory: "/tmp/demo",
      worktree: "/tmp/demo",
      client: {},
      $: async () => ({ stdout: "", stderr: "", exitCode: 0 }),
    } as any);

    expect(typeof hooks.event).toBe("function");
    expect(typeof hooks["tool.execute.before"]).toBe("function");
    expect(typeof hooks["tool.execute.after"]).toBe("function");
  });
});
