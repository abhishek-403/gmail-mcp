
# Gmail MCP Server



## Tools

- Search emails from a particular email id.
- Send emails with subject, content, and recipient.


## Installation
a. Clone the Repo
```bash
git clone https://github.com/abhishek-403/gmail-mcp.git
bun install 
   ```

 b. Create a Google Cloud Project:
- Go to [Google Cloud Console](https://console.cloud.google.com/).
- Create a new project and enable the Gmail API for your project.

 c. Create OAuth 2.0 Credentials:
- Go to "APIs & Services" -> "Credentials".
- Click "Create Credentials" -> "OAuth client ID".
- Choose "Web application" as application type.
- For Web application, add `http://localhost:3000/oauth2callback` to the authorized redirect URIs.
- Download the JSON file of your client's OAuth keys.
- Rename the key file to `credentials.json` and paste it in the root of the project.
- Go to "OAuth Consent Screen" -> "Audience"
- Scroll down, under "Test User" click "Add Users" and enter your email you wish to use for sending emails.

d. Download and install [Claude Desktop App](https://claude.ai/download)
   - Enable developer mode from "Help" -> "Enable Developer Mode'
   - Restart the Claude App.
   - Press ```Ctrl``` ```,``` (comma) and go to "Developer"->"Edit Config".
   - Open the config file and paste this
      ```
      {
         "mcpServers": {
            "gmail": {
               "command": "bun",
               "args": ["path-to-gmail-mcp/src/index.ts"]
            }
         }
      }
      ```
   - Replace the ```path-to-gmail-mcp``` by your project directory.
   - Restart the Claude App and it should redirect you to browser for authentication, use the same email you added under "Test User".
   - Now you can send and search your emails via claude.