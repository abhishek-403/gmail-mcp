import path from "path";
import { mcpServerConfig } from "./mcp-server.config";
require("dotenv").config();
export const CREDENTIALS_PATH = path.join(__dirname, "../credentials.json");
export const TOKEN_PATH = path.join(__dirname, "../token.json");

async function main() {
  try {
    await mcpServerConfig();
  } catch (e) {
    console.log(e);
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
