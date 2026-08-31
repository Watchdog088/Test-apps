# 🔌 Stripe Webhook — Complete Step-by-Step Setup Guide
**Last Updated:** August 31, 2026  
**Status:** ⚠️ NOT YET CONFIGURED — Follow every step below

---

## ⚡ OPTION A — Local Testing with Stripe CLI (Do This First)

**Use this if your backend is NOT yet deployed to a public server.**  
Your Stripe CLI is already installed at `C:\Users\Jnewball\stripe-cli\stripe.exe`

### STEP 1 — Log in to Stripe CLI
Open a **new Command Prompt** window and run:
```
"C:\Users\Jnewball\stripe-cli\stripe.exe" login
```
- Your browser will open automatically
- Click **"Allow access"** on the Stripe page
- Come back to the terminal — you'll see `Done! The Stripe CLI is configured`

---

### STEP 2 — Start your backend server
Open a **second Command Prompt** window and run:
```
cd /d "C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Backend"
npm run dev
```
Your backend should start on port **4000** (or whatever port is set in your `.env`).

---

### STEP 3 — Start Stripe webhook forwarding
Open a **third Command Prompt** window and run:
```
"C:\Users\Jnewball\stripe-cli\stripe.exe" listen --forward-to http://localhost:4000/api/v1/wallet/webhook/stripe
```

You will see output like this:
```
> Ready! Your webhook signing secret is whsec_abc123def456...
```

**COPY that entire `whsec_...` value — you need it in the next step.**

---

### STEP 4 — Put the secret into your .env file
Open this file in VS Code:
```
C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Backend\.env
```

Find this line:
```
STRIPE_WEBHOOK_SECRET=MISSING_GET_FROM_STRIPE_DASHBOARD_WEBHOOKS
```

Replace it with the secret you copied:
```
STRIPE_WEBHOOK_SECRET=whsec_abc123def456...
```
*(use your actual secret, not this example)*

**Save the file.**

---

### STEP 5 — Test it works
In the Stripe CLI terminal window (from Step 3), run a test event:
```
"C:\Users\Jnewball\stripe-cli\stripe.exe" trigger payment_intent.succeeded
```

In your backend terminal (from Step 2), you should see:
```
[stripe-webhook] Event: payment_intent.succeeded
```

✅ **If you see that — your local webhook is working!**

---

---

## 🌐 OPTION B — Production Setup via Stripe Dashboard

**Use this AFTER your backend is deployed to a public HTTPS URL (e.g., AWS/EC2).**  
Replace `https://YOUR-BACKEND-URL` with your actual deployed URL (e.g., `https://api.lynkapp.com`).

---

### STEP 1 — Go to the Stripe Dashboard
1. Open your browser
2. Go to: **https://dashboard.stripe.com**
3. Log in with your Stripe account email and password
4. Make sure you are in **Test Mode** (look for the orange "Test mode" toggle in the top right — it should be ON for testing)

---

### STEP 2 — Navigate to Webhooks
1. In the left sidebar, click **"Developers"**
2. In the sub-menu that appears, click **"Webhooks"**
3. You will see a page titled "Webhooks"

---

### STEP 3 — Add the first webhook endpoint (Wallet / Coin Purchases)

1. Click the blue **"Add endpoint"** button
2. In the **"Endpoint URL"** field, type:
   ```
   https://YOUR-BACKEND-URL/api/v1/wallet/webhook/stripe
   ```
   *(Replace `YOUR-BACKEND-URL` with your real domain, e.g. `https://api.lynkapp.com/api/v1/wallet/webhook/stripe`)*
3. In the **"Description"** field, type: `LynkApp Wallet - Coin Purchases`
4. Under **"Select events"**, click **"+ Select events"**
5. In the search box that appears, type: `payment_intent.succeeded`
6. Check the box next to **`payment_intent.succeeded`**
7. Click **"Add events"** button
8. Scroll down and click the **"Add endpoint"** button to save

---

### STEP 4 — Get the signing secret for Endpoint 1

After saving, you will be on the webhook details page.
1. Look for the section called **"Signing secret"**
2. Click **"Reveal"** (or "Click to reveal")
3. You will see a value starting with `whsec_...`
4. **Copy this entire value** — do NOT share it with anyone

---

### STEP 5 — Add the second webhook endpoint (Marketplace Orders)

1. Go back to the Webhooks page (click "Webhooks" in the left sidebar again)
2. Click **"Add endpoint"** again
3. In the **"Endpoint URL"** field, type:
   ```
   https://YOUR-BACKEND-URL/marketplace-payments/webhook
   ```
   *(e.g., `https://api.lynkapp.com/marketplace-payments/webhook`)*
4. In the **"Description"** field, type: `LynkApp Marketplace - Orders & Refunds`
5. Under **"Select events"**, click **"+ Select events"**
6. Search for and check ALL FOUR of these events:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
   - ✅ `charge.refunded`
7. Click **"Add events"** button
8. Click **"Add endpoint"** to save

---

### STEP 6 — Get the signing secret for Endpoint 2

1. Click **"Reveal"** next to **"Signing secret"** on this endpoint's page
2. **Copy this `whsec_...` value**

---

### STEP 7 — Put both secrets into your .env file

Open this file in VS Code:
```
C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Backend\.env
```

Find this line:
```
STRIPE_WEBHOOK_SECRET=MISSING_GET_FROM_STRIPE_DASHBOARD_WEBHOOKS
```

Replace it with the secrets you copied.

> **Note:** If both endpoints use the SAME signing secret (Stripe sometimes does this if they're in the same account), just use one:
```
STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
```

> **If they have different secrets**, the app currently uses one `STRIPE_WEBHOOK_SECRET` for both. Add a second variable:
```
STRIPE_WEBHOOK_SECRET=whsec_secret_for_wallet_endpoint
STRIPE_MARKETPLACE_WEBHOOK_SECRET=whsec_secret_for_marketplace_endpoint
```

**Save the file.**

---

### STEP 8 — Restart your backend server

After saving `.env`, restart the backend so it picks up the new value:
```
cd /d "C:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Backend"
npm run dev
```

---

### STEP 9 — Test the webhook in Stripe Dashboard

1. Go back to Stripe Dashboard → Developers → Webhooks
2. Click on your endpoint
3. Click **"Send test webhook"**
4. Select `payment_intent.succeeded` from the dropdown
5. Click **"Send test webhook"**
6. Look at the response — it should show **200 OK**
7. Check your backend terminal — you should see the webhook event logged

✅ **If you see 200 OK — your production webhook is working!**

---

## 📝 Summary — What Goes Where

| What | File to edit | What to change |
|------|-------------|----------------|
| Webhook secret | `ConnectHub-Backend/.env` | Change `STRIPE_WEBHOOK_SECRET=MISSING_GET_FROM_STRIPE_DASHBOARD_WEBHOOKS` to the real `whsec_...` value |

---

## ❓ Troubleshooting

**Problem: "No webhook secret — skipping signature verification"**  
→ Your `.env` file still has the placeholder. Go back to Step 4/Step 7 and paste the real secret.

**Problem: "Webhook Error: No signatures found matching the expected signature for payload"**  
→ You pasted the wrong secret. Go to Stripe Dashboard → Webhooks → your endpoint → Reveal the signing secret again and re-paste it.

**Problem: Stripe CLI says "Error: You must be logged in"**  
→ Run Step 1 again: `"C:\Users\Jnewball\stripe-cli\stripe.exe" login`

**Problem: Backend terminal shows nothing when webhook fires**  
→ Make sure your backend server is actually running (Step 2). Look for errors in the backend terminal.

---

*This guide was created August 31, 2026 for the LynkApp / ConnectHub-Backend project.*
