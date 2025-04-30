import fs from "fs";
import { google } from "googleapis";
import http from "http";
import open from "open";
import { CREDENTIALS_PATH, TOKEN_PATH } from ".";
export let oauth2Client: any = null;

export async function authenticate() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
  if (!credentials) {
    throw new Error("Credentials not found");
  }
  const { client_id, client_secret, redirect_uris } = credentials.web;

  oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  if (fs.existsSync(TOKEN_PATH)) {
    const token = fs.readFileSync(TOKEN_PATH, "utf-8");
    oauth2Client.setCredentials(JSON.parse(token));
    return;
  }
  const server = http.createServer();
  server.listen(3000);

  return new Promise<void>((resolve, reject) => {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.modify"],
    });

    open(authUrl);

    server.on("request", async (req, res) => {
      if (!req.url?.startsWith("/oauth2callback")) return;

      const url = new URL(req.url, "http://localhost:3000");
      const code = url.searchParams.get("code");

      if (!code) {
        res.writeHead(400);
        res.end("No code provided");
        reject(new Error("No code provided"));
        return;
      }

      try {
        const { tokens } = await oauth2Client.getToken(code);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        oauth2Client.setCredentials(tokens);
        res.writeHead(200);
        res.end("Authentication successful! Close this window.");
        server.close();
        resolve();
      } catch (error) {
        res.writeHead(500);
        res.end("Authentication failed");
        reject(error);
        server.close();
      }
    });
  });
}
