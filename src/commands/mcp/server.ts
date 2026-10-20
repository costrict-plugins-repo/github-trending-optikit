import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createRequire } from "module";
import { MCP_CONFIG } from "../../constants.js";
import { tools } from "./tools.js";

const require = createRequire(import.meta.url);
const packageInfo: { version: string } = require("../../../package.json");

export async function startMcpServer(): Promise<void> {
  const server = new McpServer({
    name: MCP_CONFIG.SERVER_NAME,
    version: packageInfo.version,
  });

  for (const tool of tools) {
    server.tool(
      tool.name,
      tool.description,
      { ...tool.schema.shape },
      async (args) => {
        try {
          const result = await tool.handler(args as Record<string, unknown>);
          return { content: [{ type: "text" as const, text: result }] };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
        }
      },
    );
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
