# Vercel Deployment 404 Error - Troubleshooting Guide

## Error
```
https://inbokercom.vercel.app/signup?canceled=true 404: NOT_FOUND
Code: DEPLOYMENT_NOT_FOUND
```

## Possible Causes

### 1. **Deployment Doesn't Exist**
The Vercel deployment may have been deleted or never created.

### 2. **Incorrect Project Name**
The URL shows `inbokercom.vercel.app` (no dot), which might be the actual Vercel project name.

### 3. **Domain Configuration Issue**
The custom domain `inboker.com` might not be properly configured.

## Solutions

### Step 1: Check Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Check if your project exists
3. Verify the project name matches `inbokercom` or `inboker-com`

### Step 2: Verify Deployment Status
1. In Vercel Dashboard, check the "Deployments" tab
2. Ensure there's an active deployment
3. Check if the latest deployment succeeded

### Step 3: Check Domain Configuration
1. Go to Project Settings → Domains
2. Verify `inboker.com` is added as a custom domain
3. Check DNS records are properly configured

### Step 4: Re-deploy if Needed
If deployment is missing:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to existing project or create new one
vercel link

# Deploy
vercel --prod
```

### Step 5: Update Environment Variables
Ensure all required environment variables are set in Vercel:

**Required Variables:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_MONTHLY_PRICE_ID=...
STRIPE_ANNUAL_PRICE_ID=...

# App
NEXT_PUBLIC_APP_URL=https://inboker.com
NODE_ENV=production
```

### Step 6: Fix Cancel URL in Stripe
The cancel URL is pointing to the Vercel URL. Update it to use the custom domain:

**File:** `app/api/stripe/create-trial-subscription/route.ts`

The cancel URL is already configured correctly (line 137):
```typescript
cancel_url: `${baseUrl}/signup?canceled=true`,
```

But ensure `baseUrl` resolves to `https://inboker.com` in production.

## Quick Fix: Update Cancel URL Logic

If the issue persists, we can make the cancel URL more robust:

```typescript
// In app/api/stripe/create-trial-subscription/route.ts
const getBaseUrl = () => {
  // Always prefer custom domain in production
  if (process.env.NODE_ENV === 'production') {
    return 'https://inboker.com';
  }
  // For development/preview deployments
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  if (host.includes('vercel.app')) {
    // Use the actual Vercel deployment URL
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    return `${protocol}://${host}`;
  }
  // Fallback
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
};
```

## Verify Deployment

1. **Check Vercel Project:**
   - Visit: https://vercel.com/dashboard
   - Find your project
   - Check latest deployment status

2. **Test Custom Domain:**
   - Visit: https://inboker.com
   - Should load the app

3. **Test Vercel URL:**
   - Visit: https://[your-project].vercel.app
   - Should redirect to inboker.com (via middleware)

## Common Issues

### Issue: Project Name Mismatch
- **Symptom:** URL shows different project name
- **Fix:** Check Vercel project settings and update URLs

### Issue: Domain Not Configured
- **Symptom:** Custom domain doesn't work
- **Fix:** Add domain in Vercel Dashboard → Settings → Domains

### Issue: Environment Variables Missing
- **Symptom:** App works but features break
- **Fix:** Add all required env vars in Vercel Dashboard → Settings → Environment Variables

## Next Steps

1. ✅ Check Vercel Dashboard for project status
2. ✅ Verify deployment exists and is active
3. ✅ Check domain configuration
4. ✅ Re-deploy if necessary
5. ✅ Test both custom domain and Vercel URL

## Support

If issues persist:
- Check Vercel logs: Dashboard → Project → Deployments → View Function Logs
- Check Vercel status: https://www.vercel-status.com/
- Review Vercel docs: https://vercel.com/docs
