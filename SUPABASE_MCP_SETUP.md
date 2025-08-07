# Supabase MCP Setup for OneDesigner

This guide will help you set up Supabase Model Context Protocol (MCP) for Claude to interact with your OneDesigner database.

## Prerequisites

1. A Supabase account with the OneDesigner project
2. Claude Desktop application installed
3. Node.js installed on your system

## Setup Steps

### 1. Create a Supabase Personal Access Token (PAT)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click on your avatar in the top right → **Account Settings**
3. Navigate to **Access Tokens** section
4. Click **Generate New Token**
5. Give it a descriptive name: `Claude MCP Server`
6. Copy the generated token immediately (you won't see it again!)

### 2. Get Your Project Reference

1. In your Supabase Dashboard, go to your OneDesigner project
2. Navigate to **Settings** → **General**
3. Find and copy your **Reference ID** (looks like: `abcdefghijklmnop`)

### 3. Update Claude Configuration

The configuration file has been created at:
```
~/.config/claude/claude_desktop_config.json
```

Edit this file and replace:
- `YOUR_PROJECT_REF` with your actual Supabase project reference ID
- `YOUR_PERSONAL_ACCESS_TOKEN` with the token you created in step 1

Example:
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=abcdefghijklmnop"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_1234567890abcdef..."
      }
    }
  }
}
```

### 4. Restart Claude

After updating the configuration:
1. Completely quit Claude Desktop (Cmd+Q on macOS)
2. Restart Claude Desktop
3. The MCP server should now be active

### 5. Verify Connection

Once Claude restarts, you can verify the connection by asking Claude to:
- List tables in your Supabase database
- Query data from specific tables
- Check database schema

## Security Notes

- The configuration is set to **read-only** mode by default to prevent accidental database modifications
- Keep your Personal Access Token secure and never commit it to version control
- Consider using a development/staging database for MCP access rather than production

## Available MCP Commands

With Supabase MCP, Claude can:
- Query database tables
- View schema information
- Analyze data relationships
- Help with SQL queries
- Understand your database structure

## Troubleshooting

If the MCP server doesn't connect:

1. **Check logs**: Look for errors in Claude's developer console
2. **Verify token**: Ensure your PAT is valid and hasn't expired
3. **Check project ref**: Make sure you're using the correct project reference
4. **Node.js**: Ensure Node.js is installed and accessible from terminal
5. **Restart**: Try fully quitting and restarting Claude

## Removing Read-Only Mode (Advanced)

If you need Claude to make database changes, you can remove the `--read-only` flag from the args array. **Use with caution!**

```json
"args": [
  "-y",
  "@supabase/mcp-server-supabase@latest",
  "--project-ref=YOUR_PROJECT_REF"
]
```

## Additional Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Model Context Protocol Overview](https://modelcontextprotocol.io)
- [Claude Desktop Documentation](https://claude.ai/docs)