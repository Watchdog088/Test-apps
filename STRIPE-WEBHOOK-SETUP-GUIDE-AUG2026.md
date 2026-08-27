# Stripe Webhook Setup — Detailed Step-by-Step Guide
# LynkApp / ConnectHub — August 2026

## Why Webhooks Matter

Stripe uses webhooks to notify your backend when a payment succeeds, fails, or a
subscription changes. Without them, your app has no way to know a purchase was
completed — orders will stay "pending" forever and coins will never be credited.

Your backend already has the code ready. You just need to register the endpoints in
the Stripe dashboard so Stripe knows where to send the events.

---

## What Stripe Endpoints Your Backend Has

After reading your code, there are **two** Stripe webhook listeners, each handling
different parts of the app:

| Route in your backend code | Purpose |
|---|---|
| `POST /api/v1/marketplace/webhook` | Marketplace orders — marks orders as "completed" when payment succeeds |
| `POST /api/v1/wallet/webhook/stripe` | Wallet / Coins — credits coins to a user's account after a buy-coins purchase |

Both need their own separate entry in the Stripe Dashboard.
Both use the same `STRIPE_WEBHOOK_SECRET` environment variable.

---

## PART 1 — Find Your Backend URL

Before you go to Stripe, you need to know your backend's public URL.

**If your backend is deployed on AWS (most likely based on your project):**
- Open `backend-deployment-info.txt` in VS Code (it's in your project root)
- Your URL will look like: `https://api.connecthub.com` or an EC2 address like `http://ec2-xx-xx-xx-xx.compute-1.amazonaws.com`

**If your backend is NOT yet deployed and you're testing locally:**
- You cannot use `localhost` with Stripe webhooks — Stripe can't reach your computer
- You must use the **Stripe CLI** method instead (see Part 3 below)

---

## PART 2 — Register Webhooks in the Stripe Dashboard (Production/Deployed Backend)

Do this when your backend server is live and publicly accessible.

### Step 1 — Log Into Stripe

1. Open your browser
2. Go to: **https://dashboard.stripe.com**
3. Log in with your Stripe account credentials
4. ⚠️ **Make sure you are in TEST MODE** — look at the top of the page for a toggle that says "Test mode". It should be **ON** (the toggle should be lit up). If you see "Live mode", click the toggle to switch to Test mode.

---

### Step 2 — Go to Webhooks

1. In the left sidebar, click **"Developers"**
2. Then click **"Webhooks"**
3. You will see a page that says "Webhook endpoints"

---

### Step 3 — Create the Marketplace Webhook

This handles orders in the buy/sell marketplace.

1. Click the **"+ Add endpoint"** button (top right)
2. In the "Endpoint URL" field, type:
   ```
   https://YOUR-BACKEND-URL/api/v1/marketplace/webhook
   ```
   Replace `YOUR-BACKEND-URL` with your actual backend address.
   
   Example if on AWS: `https://api.connecthub.com/api/v1/marketplace/webhook`

3. Under **"Select events to listen to"**, click **"+ Select events"**
4. Search for and check these events (one by one):
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **"Add events"** to confirm your selection
6. Click **"Add endpoint"** to save

7. You will be taken to the endpoint detail page.
8. Look for a section called **"Signing secret"** — click **"Reveal"**
9. Copy the value — it starts with `whsec_...`
10. **Save this value** — you will add it to your `.env` in Step 5

---

### Step 4 — Create the Wallet / Coins Webhook

This handles users buying coins.

1. Click the **"+ Add endpoint"** button again
2. In the "Endpoint URL" field, type:
   ```
   https://YOUR-BACKEND-URL/api/v1/wallet/webhook/stripe
   ```
   Example: `https://api.connecthub.com/api/v1/wallet/webhook/stripe`

3. Under **"Select events to listen to"**, click **"+ Select events"**
4. Search for and check these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **"Add events"** then **"Add endpoint"** to save

6. On the endpoint detail page, click **"Reveal"** next to Signing secret
7. Copy the `whsec_...` value

> ⚠️ **IMPORTANT NOTE**: Both endpoints will show the same `whsec_...` key format, but 
> they may have **different** signing secrets. For simplicity during beta, you can use the 
> same secret for both by copying from either one (Stripe will verify correctly because 
> your code uses `STRIPE_WEBHOOK_SECRET` for both). If you want maximum security, create 
> separate secrets — but you would then need to update the code to use two different env vars.

---

### Step 5 — Add the Webhook Secret to Your .env File

1. Open this file in VS Code:
   ```
   ConnectHub-Backend/.env
   ```

2. Find the line that says:
   ```
   STRIPE_WEBHOOK_SECRET=MISSING_GET_FROM_STRIPE_DASHBOARD_WEBHOOKS
   ```

3. Replace the whole line with:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_PASTE_YOUR_VALUE_HERE
   ```
   Paste the `whsec_...` value you copied from the Stripe Dashboard.

4. Save the file (Ctrl+S)

5. **Restart your backend server** so it picks up the new value:
   - If running locally: stop the terminal running the server, then run it again
   - If on AWS/EC2: redeploy or restart the service

---

### Step 6 — Verify It's Working

1. In the Stripe Dashboard, go back to **Developers → Webhooks**
2. Click on the endpoint you just created
3. Click **"Send test webhook"**
4. Select event: `payment_intent.succeeded`
5. Click **"Send test webhook"**
6. You should see the response change from "Pending" to **"200"** (green)
   - A 200 means your backend received and processed the webhook correctly
   - A 400 or 500 means there is an error — check your backend server logs

---

## PART 3 — Testing Locally Without a Deployed Backend (Stripe CLI)

If your backend is still running locally (`localhost:3001`) and not yet deployed,
use the Stripe CLI to forward webhooks to your local machine.

### Step 1 — Install Stripe CLI

Open Command Prompt and run:
```cmd
winget install Stripe.StripeCLI
```

Or download manually from: **https://stripe.com/docs/stripe-cli** → Download for Windows

---

### Step 2 — Login to Stripe CLI

```cmd
stripe login
```
This will open a browser window asking you to authorize. Click **"Allow access"**.

---

### Step 3 — Start Forwarding Webhooks to Localhost

Run this command (keep this terminal open while testing):
```cmd
stripe listen --forward-to localhost:3001/api/v1/wallet/webhook/stripe
```

The CLI will print a line like:
```
> Ready! Your webhook signing secret is whsec_abc123xyz...
```

Copy that `whsec_...` value.

---

### Step 4 — Add the CLI Signing Secret to .env

Open `ConnectHub-Backend/.env` and set:
```
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz...
```
(Use the value printed by the CLI, NOT a Dashboard secret — they are different for local testing)

---

### Step 5 — Trigger a Test Event

In a **second** Command Prompt window, run:
```cmd
stripe trigger payment_intent.succeeded
```

You should see the event appear in the first terminal window and your backend logs
should show a coin credit happening.

---

## PART 4 — Testing a Real Payment End-to-End

Once webhooks are set up, test a full payment flow:

1. Open the app and go to **Wallet → Buy Coins**
2. Enter Stripe's test card number: `4242 4242 4242 4242`
3. Expiry: any future date (e.g., `12/29`)
4. CVC: any 3 digits (e.g., `123`)
5. ZIP: any 5 digits (e.g., `10001`)
6. Complete the purchase
7. Check your Stripe Dashboard → **Payments** — you should see a new payment appear
8. Check your app — the user's coin balance should have increased

---

## PART 5 — When You Go Live (Production)

When you're ready to launch for real:

1. Turn OFF "Test mode" in the Stripe Dashboard
2. Repeat Steps 2–5 above but in **Live mode**
3. Use your **Live** Stripe keys in `.env`:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY=pk_live_...`
4. Create new webhook endpoints in Live mode and get a new `whsec_...` secret
5. Update `STRIPE_WEBHOOK_SECRET` with the live webhook secret

---

## Summary Checklist

- [ ] Know your backend URL (or confirm using Stripe CLI for local)
- [ ] Log into Stripe Dashboard — confirm TEST MODE is on
- [ ] Create webhook endpoint #1: `YOUR-BACKEND-URL/api/v1/marketplace/webhook`
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- [ ] Create webhook endpoint #2: `YOUR-BACKEND-URL/api/v1/wallet/webhook/stripe`
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copy the `whsec_...` signing secret from either endpoint
- [ ] Paste it into `ConnectHub-Backend/.env` as `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Restart backend server
- [ ] Send test webhook from Dashboard — confirm 200 response
- [ ] Run a test payment with card `4242 4242 4242 4242`

---

*Created by: Cline AI Assistant*
*Date: August 27, 2026*
*Based on actual backend routes found in:*
*- `ConnectHub-Backend/src/routes/marketplace-payments.ts` (line: `router.post('/webhook', ...`)*
*- `ConnectHub-Backend/src/routes/wallet.ts` (line: `router.post('/webhook/stripe', ...`)*
