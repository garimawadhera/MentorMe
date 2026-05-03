<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xPrwhdntg0TCCdSuZ6ZL0CIcZHngSYwE

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## WhatsApp World News Digest Worker (Python)

This repo now also includes a background worker that sends a daily WhatsApp digest:

1. Fetches top world headlines from NewsAPI (by configurable topics).
2. Asks Claude (Anthropic) to write a WhatsApp-friendly summary.
3. Sends the digest to all subscribers via Twilio WhatsApp.
4. Runs once daily on a schedule (default: 07:00 UTC).

### Files

- `digest_worker/config.py` - environment settings loader
- `digest_worker/news_client.py` - NewsAPI fetcher
- `digest_worker/summarizer.py` - Claude digest generation
- `digest_worker/whatsapp_client.py` - Twilio sender
- `digest_worker/subscribers.py` - JSON subscriber store
- `digest_worker/runner.py` - orchestration pipeline
- `digest_worker/main.py` - CLI entry point + scheduler loop
- `.env.digest.example` - required environment variables
- `requirements-digest-worker.txt` - Python dependencies

### Quick start

1. Install dependencies:
   `pip3 install -r requirements-digest-worker.txt`
2. Create env file:
   `cp .env.digest.example .env`
3. Fill in your real credentials in `.env`.
4. Add subscribers to `digest_worker/data/subscribers.json` in E.164 format (`+15551234567`).

### Run modes

- Run immediately one time:
  `python3 -m digest_worker.main --once`
- Start daily scheduler:
  `python3 -m digest_worker.main`

### Environment notes

- `DIGEST_TOPICS` expects a comma-separated list.
- `DIGEST_HOUR` and `DIGEST_MINUTE` define local send time in `DIGEST_TIMEZONE`.
- Set `TWILIO_WHATSAPP_FROM` to your Twilio WhatsApp sender (e.g. `+14155238886` for sandbox).
