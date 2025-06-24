# Pallette App Setup TODO

## Authentication Setup Required

### 1. Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Copy the output and update `NEXTAUTH_SECRET` in `.env.local`

### 2. GitHub OAuth Setup
1. Go to https://github.com/settings/applications/new
2. Create a new OAuth App with:
   - Application name: `Pallette App`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Copy the Client ID and Client Secret
4. Update `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env.local`

### 3. Google OAuth Setup
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 Client ID with:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret
6. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`

### 4. Environment Variables Summary
Update these in `.env.local`:
- `NEXTAUTH_SECRET` - Random string from step 1
- `GITHUB_CLIENT_ID` - From GitHub OAuth app
- `GITHUB_CLIENT_SECRET` - From GitHub OAuth app  
- `GOOGLE_CLIENT_ID` - From Google OAuth credentials
- `GOOGLE_CLIENT_SECRET` - From Google OAuth credentials

## Database
✅ Database and tables already created and configured

## Next Steps
Once OAuth is configured, the authentication should work and you can start creating and managing color palettes.