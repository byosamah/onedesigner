# Vercel MCP Setup Guide

## Overview
This document outlines the steps taken to integrate Vercel MCP (Model Context Protocol) with Claude Code for the OneDesigner project.

## Setup Date: August 8, 2025

## Prerequisites
- Vercel CLI installed (`vercel` command available)
- Claude Code with MCP support
- Vercel account

## Step-by-Step Setup Process

### 1. Initial Status Check
```bash
claude mcp list
# Output: vercel: https://mcp.vercel.com (HTTP) - ⚠ Needs authentication
```

### 2. Vercel CLI Authentication
```bash
vercel login
# Selected: Continue with GitHub (or your preferred method)
# Completed authentication in browser
```

### 3. Verify Login
```bash
vercel whoami
# Output: designbattlefield-2236
```

### 4. Create Vercel Access Token
1. Navigate to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: "Claude MCP Integration"
4. Scope: Full Account (or limited as needed)
5. Expiration: No Expiration (for development)
6. Created token: `Jn9dwrQamPfPDoFJpzsSpIjm`

### 5. Configure Vercel MCP

#### Remove existing configuration:
```bash
claude mcp remove vercel -s local
```

#### Add Vercel MCP with authentication:
```bash
claude mcp add vercel https://mcp.vercel.com -t http -H "Authorization: Bearer Jn9dwrQamPfPDoFJpzsSpIjm"
```

### 6. Verify Configuration
```bash
claude mcp get vercel
# Output shows:
# - Type: http
# - URL: https://mcp.vercel.com
# - Headers: Authorization: Bearer [token]
```

## Configuration Details

### MCP Configuration Location
- **Claude Code Project Config**: `/Users/osamakhalil/.claude.json`
- **Scope**: Local config (private to this project)

### Available MCP Servers
1. **Vercel** - For deployment and project management
2. **Supabase** - Database access (read-only)
3. **Resend** - Email sending capabilities

## What You Can Do Now

With Vercel MCP configured, you can:
- Deploy the OneDesigner project to Vercel
- Manage deployments and check status
- Configure environment variables
- Set up custom domains
- View deployment logs
- Manage project settings

## Important Notes

1. The token is stored securely in the local Claude configuration
2. The MCP may show "Needs authentication" in status checks, but it's properly configured with the Bearer token
3. The project name must be lowercase for Vercel (onedesigner, not OneDesigner)
4. The Vercel MCP uses HTTP transport with Bearer token authentication

## Troubleshooting

If the MCP stops working:
1. Check if the token is still valid at https://vercel.com/account/tokens
2. Re-run the setup process with a new token if needed
3. Ensure Claude Code has access to the MCP configuration file

## Related Documentation
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Claude MCP Documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [OneDesigner Deployment Guide](./PRODUCTION_DEPLOYMENT.md)