# Cypress Cloud Security Guide

## Record Key Security

Your Cypress Cloud record key (`774c7460-****`) is a sensitive credential that must be protected.

### ⚠️ NEVER DO THIS:
- ❌ Never commit the record key to your repository
- ❌ Never hardcode it in your test files
- ❌ Never share it in public forums or documentation
- ❌ Never include it in client-side code

### ✅ ALWAYS DO THIS:
- ✅ Store it in `.env.cypress.local` (already gitignored)
- ✅ Use environment variables in CI/CD
- ✅ Rotate the key periodically
- ✅ Restrict access to team members who need it

## Local Development Setup

1. The record key is stored in `.env.cypress.local`
2. This file is automatically loaded when running Cypress commands
3. To verify your setup:
   ```bash
   source .env.cypress.local
   echo $CYPRESS_RECORD_KEY
   ```

## Running Tests with Recording

### Local Recording
```bash
# Load environment and run with recording
source .env.cypress.local && npm run cypress:record

# Or use the helper script
./scripts/cypress-with-env.sh npm run cypress:record
```

### Without Recording (for local development)
```bash
# Regular test runs don't require the record key
npm run cypress:run
npm run test:e2e
```

## CI/CD Setup

### GitHub Actions
1. Add the record key to repository secrets:
   - Go to Settings → Secrets → Actions
   - Add new secret: `CYPRESS_RECORD_KEY`
   - Value: `774c7460-ae98-4c1d-827f-c5eed3317176`

2. Use in workflow:
   ```yaml
   - name: Run E2E Tests with Recording
     run: npm run test:e2e:record
     env:
       CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
   ```

### Vercel
1. Add to Vercel environment variables:
   ```bash
   vercel env add CYPRESS_RECORD_KEY
   ```

2. Use in build/test scripts

### Other CI Platforms
- **CircleCI**: Add to project environment variables
- **Jenkins**: Use credentials plugin
- **GitLab CI**: Add to CI/CD variables

## Monitoring Usage

View your test recordings at:
- Dashboard: https://cloud.cypress.io/projects/enb4g2
- Project ID: `enb4g2`

## Key Rotation

If your key is compromised:
1. Generate new key in Cypress Cloud dashboard
2. Update `.env.cypress.local`
3. Update all CI/CD secrets
4. Notify team members

## Team Access

To grant team members access:
1. Invite them to Cypress Cloud project
2. Share the record key securely (use password manager)
3. Never share via:
   - Email
   - Slack/Discord
   - Git commits
   - Public documentation

## Troubleshooting

### "Recording not working"
```bash
# Check if key is loaded
echo $CYPRESS_RECORD_KEY

# Verify project ID in config
grep projectId cypress.config.ts

# Test with explicit key
CYPRESS_RECORD_KEY=774c7460-ae98-4c1d-827f-c5eed3317176 npm run cypress:record
```

### "Unauthorized" errors
- Check key hasn't been rotated
- Verify you have access to project
- Ensure key matches project ID

## Security Checklist

- [ ] `.env.cypress.local` is in `.gitignore`
- [ ] Record key not in any committed files
- [ ] CI/CD uses secrets management
- [ ] Team members know security practices
- [ ] Key rotation schedule established
- [ ] Access logs reviewed periodically