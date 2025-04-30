import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { google } from "googleapis";
import { z } from "zod";
import { searchEmail, sendEmail, type ISearchEmailOptions } from "./services";
import { authenticate, oauth2Client } from "./utils";
export const mcpServerConfig = async () => {
  await authenticate();

  if (!oauth2Client) {
    throw new Error("OAuth2 client is not initialized");
  }
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const server = new McpServer({
    name: "Demo",
    version: "1.0.0",
  });

  server.tool(
    "search-emails",
    "This tool is used to search the user emails",
    {
      query: z
        .string()
        .describe("Gmail search query (e.g., 'from:example@gmail.com')"),
      maxResults: z
        .number()
        .optional()
        .describe("Maximum number of results to return"),
    },
    async ({ query, maxResults }) => {
      const results: ISearchEmailOptions[] = await searchEmail(gmail, {
        query,
        maxResults,
      });
      return {
        content: [
          {
            type: "text",
            text: results
              .map(
                (r) =>
                  `ID: ${r.id}\nSubject: ${r.subject}\nFrom: ${r.from}\nDate: ${r.date}\nBody:\n${r.body}\n---`
              )
              .join("\n\n"),
          },
        ],
      };
    }
  );

  server.tool(
    "send-email",
    "This tool is used to send an email ",
    {
      receiver_email: z.string().email(),
      cc: z.array(z.string().email()).optional(),
      bcc: z.array(z.string().email()).optional(),
      subject: z.string().optional(),
      text: z.string().optional(),
    },
    async ({ receiver_email, cc, bcc, subject, text }) => {
      const res = await sendEmail(gmail, {
        receiver_email,
        cc,
        bcc,
        subject,
        text,
      });
      return {
        content: [
          {
            type: "text",
            text: `Email sent successfully ${res.data.id} `,
          },
        ],
      };
    }
  );
  const transport = new StdioServerTransport();
  await server.connect(transport);
};
