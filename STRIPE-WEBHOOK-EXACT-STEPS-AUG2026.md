# Stripe Webhook — EXACT Field-by-Field Instructions
# LynkApp — August 2026
# Written specifically for YOUR project based on your actual .env file

---

## SITUATION SUMMARY — READ THIS FIRST

After reading your `ConnectHub-Backend/.env` file, here is exactly where things stand:

| What you have | Status |
|---|---|
| `STRIPE_SECRET_KEY` | ✅ Already set — `sk_test_51Sk8Oo...` |
| `STRIPE_PUBLISHABLE_KEY` | ✅ Already set — `pk_test_51Sk8Oo...` |
| `STRIPE_WEBHOOK_SECRET` | ❌ **MISSING** — currently says `MISSING_GET_FROM_STRIPE_DASHBOARD_WEBHOOKS` |
| Backend URL | ⚠️ Running on `localhost:5000` — not publicly deployed yet |

**The one thing you need to do:** Get the `STRIPE_WEBHOOK_SECRET` value from Stripe and 
paste it into `ConnectHub-Backend/.env` on line 69.

Because your backend is on `localhost` (not a public server yet), you CANNOT use the 
Stripe Dashboard webhook method. Stripe's servers can't reach your computer.
**You must use the Stripe CLI method.** This takes about 5 minutes.

---

## THE COMPLETE PROCESS — STEP BY STEP

### STEP 1 — Open a Command Prompt

1. Press the **Windows key** on your keyboard
2. Type: `cmd`
3. Press **Enter**
4. A black Command Prompt window opens

---

### STEP 2 — Install the Stripe CLI

In the Command Prompt window, type this exactly and press Enter:

```
winget install Stripe.StripeCLI
```

You will see it downloading and installing. Wait for it to finish.
When it says "Successfully installed" you can move to Step 3.

> **If winget doesn't work:** Go to https://github.com/stripe/stripe-cli/releases/latest
> Download the file named `stripe_X.X.X_windows_x86_64.zip`
> Unzip it. You will get a file called `stripe.exe`
> Move `stripe.exe` to your Desktop
> In Command Prompt, type: `cd Desktop` then use `stripe` instead of `stripe` in steps below

---

### STEP 3 — Log In to Stripe CLI

In the same Command Prompt window, type:

```
stripe login
```

Press **Enter**.

A message like this will appear:
```
Your pairing code is: enjoy-fancy-word-word
This pairing code verifies your authentication with Stripe.
Press Enter to open the browser or visit https://dashboard.stripe.com/stripecli/confirm_auth?t=...
```

Press **Enter** (or copy the link into your browser).

Your browser opens the Stripe website. You will see:
- A page saying "Allow Stripe CLI access to your account?"
- Your **pairing code** shown on screen — confirm it matches what the terminal showed
- Click the big **"Allow access"** button

Go back to the Command Prompt. It should now say:
```
> Done! The Stripe CLI is configured for your Stripe account.
```

---

### STEP 4 — Start the Webhook Listener

**Keep this Command Prompt window open the entire time you are testing.**

Type this command exactly and press Enter:

```
stripe listen --forward-to localhost:5000/api/v1/wallet/webhook/stripe
```

**Why port 5000?** Because your `ConnectHub-Backend/.env` has `PORT=5000`.

You will see output like this:
```
> Ready! You are using Stripe API Version [2024-xx-xx]. Your webhook signing secret is
  whsec_abc1def2ghi3jkl4mno5pqr6stu7vwx8yz90...
  (^C to quit)
```

**STOP HERE. Do not close this window.**

**Copy the `whsec_...` value.** Select it with your mouse in the terminal and press 
Ctrl+C to copy it. It starts with `whsec_` and is a long string of letters and numbers.

---

### STEP 5 — Paste the Secret Into Your .env File

1. Open **Visual Studio Code** (it is already open with your project)

2. Open the file: `ConnectHub-Backend/.env`
   - Press **Ctrl+P** in VS Code
   - Type: `.env`
   - Click **ConnectHub-Backend/.env** in the dropdown

3. Find **line 69**. It currently says:
   ```
   STRIPE_WEBHOOK_SECRET=MISSING_GET_FROM_STRIPE_DASHBOARD_WEBHOOKS
   ```

4. **Delete that entire line** and replace it with:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_PASTE_YOUR_VALUE_HERE
   ```
   
   Where `whsec_PASTE_YOUR_VALUE_HERE` is the exact `whsec_...` value you copied from 
   the Command Prompt in Step 4.

   **Example of what it should look like after you paste:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_abc1def2ghi3jkl4mno5pqr6stu7vwx8yz90abc123
   ```
   (Your actual value will be different — use the one the CLI gave you.)

5. Press **Ctrl+S** to save the file.

---

### STEP 6 — Start Your Backend Server

Open a **NEW** Command Prompt window (keep the Step 4 window open).

In the new window:
```
cd /d "c:\Users\Jnewball\Test-apps\Test-apps\ConnectHub-Backend"
```
Press Enter, then:
```
npm run dev
```
or if that doesn't work:
```
npx ts-node src/server.ts
```

Wait until you see a message like:
```
Server running on port 5000
```

---

### STEP 7 — Test That It Works

Open a **THIRD** Command Prompt window.

Type this and press Enter:
```
stripe trigger payment_intent.succeeded
```

Now watch all three windows:

**Window 1 (stripe listen):** You should see new lines appear showing the event was received:
```
2026-08-31 11:00:00 --> payment_intent.succeeded [evt_xxx]
2026-08-31 11:00:00 <-- [200] POST http://localhost:5000/api/v1/wallet/webhook/stripe [evt_xxx]
```

**The key thing to look for:** The `[200]` number. 
- `[200]` = ✅ SUCCESS — your backend processed the webhook correctly
- `[400]` or `[500]` = ❌ ERROR — something is wrong (see Troubleshooting below)

**Window 2 (your backend server):** You should see log output like:
```
[stripe-webhook] Event: payment_intent.succeeded
[stripe-webhook] Coin credit: ...
```

---

### STEP 8 — You're Done!

Once you see `[200]` in the stripe listen window, webhooks are working.

The `STRIPE_WEBHOOK_SECRET` in your `.env` is now correct and your payments will 
actually complete — coins will be credited and marketplace orders will update.

---

## WHAT EACH FIELD MEANS (Quick Reference)

Here is every line in `ConnectHub-Backend/.env` that is related to Stripe, and what 
each one is for:

```
STRIPE_SECRET_KEY=sk_test_51Sk8Oo...
```
✅ Already filled in. This is your Stripe account's secret API key. 
Your backend uses this to create payment sessions and charge cards.
Starts with `sk_test_` because you are in test mode (no real charges).

```
STRIPE_PUBLISHABLE_KEY=pk_test_51Sk8Oo...
```
✅ Already filled in. This goes in the frontend and is safe to be public.
Your app's checkout form uses this to talk to Stripe's servers.

```
STRIPE_WEBHOOK_SECRET=MISSING_GET_FROM_STRIPE_DASHBOARD_WEBHOOKS
```
❌ THIS IS THE ONE YOU NEED TO FIX. After you do Steps 1-7 above, 
this will have the `whsec_...` value and will be fixed.

---

## TROUBLESHOOTING — IF YOU SEE AN ERROR

### Error: "stripe: command not found" or "winget not found"

winget is built into Windows 11. If it says not found, open **Microsoft Store**, 
search for "App Installer" and install/update it. Then retry Step 2.

---

### The stripe listen window shows [400] instead of [200]

This means the webhook secret doesn't match. Most likely you didn't save the .env file 
after pasting. Try again:
1. Go back to VS Code
2. Check line 69 of `ConnectHub-Backend/.env`
3. Make sure it says `STRIPE_WEBHOOK_SECRET=whsec_...` with a real value (no MISSING)
4. Press Ctrl+S to save
5. Stop and restart your backend server (Ctrl+C, then npm run dev again)
6. Run stripe trigger again

---

### The stripe listen window shows [500] instead of [200]

This means there is a server error. Look at Window 2 (backend server) — you will see 
an error message in red. The most common cause is the backend can't connect to Firebase 
because the Firebase service account isn't configured.

---

### "Not logged in" error from stripe login

Your login expired. Type `stripe login` again and repeat Step 3.

---

## WHEN YOUR BACKEND IS DEPLOYED TO A PUBLIC SERVER

The `whsec_...` secret from the CLI **only works while the CLI is running**.
It is a temporary local testing secret.

When you deploy your backend to a real server (AWS, Heroku, etc.), you will need to:
1. Go to **https://dashboard.stripe.com → Developers → Webhooks**
2. Click **"+ Add endpoint"**
3. Fill in:
   - **Endpoint URL:** `https://YOUR-SERVER.com/api/v1/wallet/webhook/stripe`
   - **Events:** Check `payment_intent.succeeded` and `payment_intent.payment_failed`
4. Click **"Add endpoint"**
5. On the next page, click **"Reveal"** next to Signing secret
6. Copy the `whsec_...` value
7. Update `STRIPE_WEBHOOK_SECRET` in your server's environment variables

Do the same thing again for the marketplace webhook:
   - **Endpoint URL:** `https://YOUR-SERVER.com/api/v1/marketplace/webhook`
   - **Events:** Check `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`

---

## VISUAL CHECKLIST — CHECK OFF AS YOU GO

- [ ] Step 1: Opened Command Prompt
- [ ] Step 2: Installed Stripe CLI (`winget install Stripe.StripeCLI`)
- [ ] Step 3: Ran `stripe login` and clicked Allow Access in browser
- [ ] Step 4: Ran `stripe listen --forward-to localhost:5000/api/v1/wallet/webhook/stripe`
            and copied the `whsec_...` value it printed
- [ ] Step 5: Opened `ConnectHub-Backend/.env` in VS Code
            and replaced line 69 with `STRIPE_WEBHOOK_SECRET=whsec_...YOUR_VALUE`
            and saved the file (Ctrl+S)
- [ ] Step 6: Started the backend server in a new Command Prompt (`npm run dev`)
- [ ] Step 7: Ran `stripe trigger payment_intent.succeeded` in a third Command Prompt
            and confirmed the stripe listen window showed `[200]`
- [ ] DONE! Payments are working.

---

*Guide written August 31, 2026*
*Based on reading your actual `ConnectHub-Backend/.env` file line by line*
*Your Stripe account is confirmed in TEST MODE (sk_test_ prefix) — safe for testing*
