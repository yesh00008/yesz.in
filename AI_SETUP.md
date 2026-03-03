# AI Summarize Feature Setup Guide

The AI summarize feature has been restored and now uses Supabase Edge Functions for secure, server-side summarization.

## Prerequisites

1. **Supabase Project** - You should already have one configured
2. **AI Service API Key** - Choose ONE of:
   - **Claude (Anthropic)** - `ANTHROPIC_API_KEY` - Recommended for quality
   - **DeepSeek** - `DEEPSEEK_API_KEY` - Budget-friendly alternative
   - **OpenAI** - `OPENAI_API_KEY` - GPT-4o mini

## Setup Steps

### Step 1: Update Supabase URL in Frontend Code

Replace `YOUR_SUPABASE_URL` in the AI fetch calls:

**File: src/pages/BlogPost.tsx (Line ~74)**
```typescript
const res = await fetch("https://YOUR_SUPABASE_URL/functions/v1/ai-summarize", {
```

**File: src/pages/ResearchPaper.tsx (Line ~131)**
```typescript
const res = await fetch("https://YOUR_SUPABASE_URL/functions/v1/ai-summarize", {
```

Replace `YOUR_SUPABASE_URL` with your actual Supabase project URL:
- Example: `https://abc123xyz.supabase.co`

### Step 2: Set Environment Variable in Supabase

1. Go to **Supabase Dashboard**
2. Go to **Settings → Secrets**
3. Add ONE of these based on your chosen AI provider:

```
ANTHROPIC_API_KEY = sk-ant-... (your API key)
```

OR

```
DEEPSEEK_API_KEY = sk-... (your API key)
```

OR

```
OPENAI_API_KEY = sk-... (your API key)
```

### Step 3: Deploy Edge Function

```bash
# Deploy the AI summarize function
supabase functions deploy ai-summarize

# Verify deployment
supabase functions list
```

### Step 4: Test the Function

Option A: Via Curl
```bash
curl -X POST https://YOUR_SUPABASE_URL/functions/v1/ai-summarize \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Summarize this in one sentence: The Earth orbits the Sun.",
    "contentType": "post"
  }'
```

Option B: Via Browser Console
```javascript
fetch('https://YOUR_SUPABASE_URL/functions/v1/ai-summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Summarize this in one sentence: The Earth orbits the Sun.',
    contentType: 'post'
  })
}).then(r => r.json()).then(console.log)
```

## How It Works

1. **User clicks "AI Summarize"** button on a blog post or research paper
2. **Frontend extracts content** from the page (title, summary, body text)
3. **Frontend sends to Edge Function** via HTTPS POST request
4. **Edge Function calls AI service** (Claude, DeepSeek, or OpenAI) with the content
5. **AI service generates summary** (4-6 sentences)
6. **Edge Function returns summary** to frontend
7. **Summary displays in panel** on the page

## Features

✅ **Secure** - API keys never exposed to client
✅ **Fast** - Optimized prompts for quick summarization
✅ **Flexible** - Supports multiple AI providers
✅ **Error Handling** - User-friendly error messages
✅ **Timeout** - 30-second timeout to prevent hanging

## Cost Estimates (Monthly)

**Claude 3.5 Sonnet (Anthropic)**
- ~$0.50 per 100 posts summarized
- Recommended for best quality

**DeepSeek**
- ~$0.01 per 100 posts summarized
- Most budget-friendly option

**GPT-4o Mini (OpenAI)**
- ~$0.10 per 100 posts summarized
- Good balance of cost and quality

## Troubleshooting

### Error: "No AI service configured"
- ✓ Set one of the API key environment variables in Supabase (see Step 2)
- ✓ Restart edge function after setting secret

### Error: "Request timed out"
- API service is slow or unreachable
- Try again in a moment
- Check API service status

###Error: "401 Unauthorized"
- API key is invalid or expired
- Verify key in Supabase Secrets
- Get new key from AI service provider

### Error: "Network error"
- Check browser console for details
- Ensure Supabase URL is correct in code
- Verify function is deployed (`supabase functions list`)

## Monitoring

**View function logs:**
```bash
supabase functions logs ai-summarize
```

**Check invocation errors:**
```bash
supabase edge-function logs ai-summarize --limit=50
```

## API Response Format

**Success Response:**
```json
{
  "status": "success",
  "text": "This is the AI-generated summary of the content..."
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": "Description of what went wrong"
}
```

## Customization

### Change Summary Length
Edit the prompt in `handleAISummarize` function:
```typescript
const prompt = `Summarize this in 2-3 short sentences...`; // Change sentence count
```

### Adjust Timeout
Change timeout value (in milliseconds):
```typescript
const timeoutId = setTimeout(() => {
  controller.abort();
}, 30000); // Change from 30000 to your preferred timeout
```

### Add Custom Formatting
Modify the prompt to request specific formatting:
```typescript
const prompt = `Summarize as bullet points:\n\n${textContent}`;
```

## Support

For issues with:
- **Anthropic Claude**: https://support.anthropic.com
- **DeepSeek**: https://deepseek.com/help
- **OpenAI**: https://help.openai.com

---

**Status**: ✅ Ready to deploy
**Last Updated**: March 3, 2026
