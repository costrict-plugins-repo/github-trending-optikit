import type { CommandModule } from "yargs";
import { startMcpServer } from "./server.js";
import { setupClaude } from "./setup.js";

export const mcpCommands: CommandModule[] = [
  {
    command: "mcp",
    describe: "Start OptiKit MCP server for Claude Code integration",
    handler: async () => { await startMcpServer(); },
  },
  {
    command: "setup-claude",
    describe: "Register OptiKit MCP server with Claude Code",
    builder: {
      uninstall: {
        type: "boolean",
        default: false,
        description: "Remove OptiKit MCP server from Claude Code",
      },
    },
    handler: (argv) => { setupClaude(argv.uninstall as boolean); },
  },
];
