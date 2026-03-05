# 📧 AWS Route 53 - Mailgun DNS Records Setup Guide

## Visual Guide for Adding Mailgun DNS Records to lynkapp.net

---

## 🎯 Quick Access:

**AWS Route 53 Console:**
```
https://console.aws.amazon.com/route53/v2/hostedzones
```

---

## 📋 RECORD 1: MX Record (First Mail Server)

### **In AWS Route 53, Click "Create Record":**

```
┌─────────────────────────────────────────────────────┐
│ AWS Route 53 - Create Record                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Record name:  [                        ]             │
│              Leave BLANK or enter @                  │
│              (blank = root domain)                   │
│                                                      │
│ Record type:  [MX - Mail exchange      ▼]           │
│                                                      │
│ Value:        [10 mxa.mailgun.org      ]            │
│              ^ Priority  ^ Server                    │
│                                                      │
│ TTL:          [300                     ] seconds     │
│                                                      │
│ Routing:      [Simple routing          ▼]           │
│                                                      │
│              [Cancel]  [Create records]              │
└─────────────────────────────────────────────────────┘
```

**Exactly How to Fill:**
- **Record name:** Leave BLANK (or type `@`)
- **Record type:** Select `MX` from dropdown
- **Value:** `10 mxa.mailgun.org`
- **TTL:** `300`
- **Routing:** Simple routing

---

## 📋 RECORD 2: MX Record (Second Mail Server)

### **Click "Create Record" Again:**

```
┌─────────────────────────────────────────────────────┐
│ AWS Route 53 - Create Record                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Record name:  [                        ]             │
│              Leave BLANK or enter @                  │
│                                                      │
│ Record type:  [MX - Mail exchange      ▼]           │
│                                                      │
│ Value:        [10 mxb.mailgun.org      ]            │
│              ^ Priority  ^ Server                    │
│                                                      │
│ TTL:          [300                     ] seconds     │
│                                                      │
│ Routing:      [Simple routing          ▼]           │
│                                                      │
│              [Cancel]  [Create records]              │
└─────────────────────────────────────────────────────┘
```

**Exactly How to Fill:**
- **Record name:** Leave BLANK (or type `@`)
- **Record type:** Select `MX` from dropdown
- **Value:** `10 mxb.mailgun.org`
- **TTL:** `300`
- **Routing:** Simple routing

---

## 📋 RECORD 3: TXT Record (SPF - Email Authentication)

### **Click "Create Record" Again:**

```
┌─────────────────────────────────────────────────────┐
│ AWS Route 53 - Create Record                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Record name:  [                        ]             │
│              Leave BLANK or enter @                  │
│                                                      │
│ Record type:  [TXT - Text              ▼]           │
│                                                      │
│ Value:        ["v=spf1 include:mailgun.org ~all"]   │
│              Must include quotes in Route 53!        │
│                                                      │
│ TTL:          [300                     ] seconds     │
│                                                      │
│ Routing:      [Simple routing          ▼]           │
│                                                      │
│              [Cancel]  [Create records]              │
└─────────────────────────────────────────────────────┘
```

**Exactly How to Fill:**
- **Record name:** Leave BLANK (or type `@`)
- **Record type:** Select `TXT` from dropdown  
- **Value:** `"v=spf1 include:mailgun.org ~all"` (WITH quotes!)
- **TTL:** `300`
- **Routing:** Simple routing

**⚠️ IMPORTANT:** AWS Route 53 requires quotes around TXT record values!

---

## 📋 RECORD 4: TXT Record (DKIM - Email Signing)

### **Click "Create Record" Again:**

```
┌─────────────────────────────────────────────────────┐
│ AWS Route 53 - Create Record                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Record name:  [mailo._domainkey        ]            │
│              Type exactly: mailo._domainkey          │
│                                                      │
│ Record type:  [TXT - Text              ▼]           │
│                                                      │
│ Value:        ["k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUA │
│               A4GNADCBiQKBgQDA+oy3W5NEfjOyJMV+N1gf0 │
│               ARhAsdDe5Zs1SF4vvNvDb8AMyt5LO5WV8JYx │
│               8B2+oHcjeqAwi+cMnBlMtTiZvxvRFYyqVgEB │
│               ENunlvGj4SxCzGslGEf2K68y8A6U12c+viPo │
│               wVzJqZrnrsaIcbFO5bKn+hFbhnOos9/5gEY2 │
│               nN9UQIDAQAB"]                          │
│              (All one line in quotes!)               │
│                                                      │
│ TTL:          [300                     ] seconds     │
│                                                      │
│ Routing:      [Simple routing          ▼]           │
│                                                      │
│              [Cancel]  [Create records]              │
└─────────────────────────────────────────────────────┘
```

**Exactly How to Fill:**
- **Record name:** `mailo._domainkey`
- **Record type:** Select `TXT` from dropdown
- **Value:** The ENTIRE public key in ONE LINE with quotes:
  ```
  "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDA+oy3W5NEfjOyJMV+N1gf0ARhAsdDe5Zs1SF4vvNvDb8AMyt5LO5WV8JYx8B2+oHcjeqAwi+cMnBlMtTiZvxvRFYyqVgEBENunlvGj4SxCzGslGEf2K68y8A6U12c+viPowVzJqZrnrsaIcbFO5bKn+hFbhnOos9/5gEY2nN9UQIDAQAB"
  ```
- **TTL:** `300`
- **Routing:** Simple routing

---

## 📊 SUMMARY TABLE - All 4 Records:

| # | Record Name | Type | Priority | Value |
|---|-------------|------|----------|-------|
| 1 | @ (blank) | MX | 10 | mxa.mailgun.org |
| 2 | @ (blank) | MX | 10 | mxb.mailgun.org |
| 3 | @ (blank) | TXT | N/A | "v=spf1 include:mailgun.org ~all" |
| 4 | mailo._domainkey | TXT | N/A | "k=rsa; p=MIIG..." |

---

## 🎯 Step-by-Step Process:

### **Step 1: Access Route 53**
```bash
1. Go to: https://console.aws.amazon.com/route53/
2. Click: "Hosted zones"
3. Click: "lynkapp.net"
```

### **Step 2: Add First MX Record**
```bash
1. Click: "Create record"
2. Record name: Leave BLANK
3. Record type: MX
4. Value: 10 mxa.mailgun.org
5. TTL: 300
6. Click: "Create records"
```

### **Step 3: Add Second MX Record**
```bash
1. Click: "Create record"
2. Record name: Leave BLANK
3. Record type: MX
4. Value: 10 mxb.mailgun.org
5. TTL: 300
6. Click: "Create records"
```

### **Step 4: Add SPF TXT Record**
```bash
1. Click: "Create record"
2. Record name: Leave BLANK
3. Record type: TXT
4. Value: "v=spf1 include:mailgun.org ~all"
   (WITH the quotes!)
5. TTL: 300
6. Click: "Create records"
```

### **Step 5: Add DKIM TXT Record**
```bash
1. Click: "Create record"
2. Record name: mailo._domainkey
3. Record type: TXT
4. Value: "k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDA+oy3W5NEfjOyJMV+N1gf0ARhAsdDe5Zs1SF4vvNvDb8AMyt5LO5WV8JYx8B2+oHcjeqAwi+cMnBlMtTiZvxvRFYyqVgEBENunlvGj4SxCzGslGEf2K68y8A6U12c+viPowVzJqZrnrsaIcbFO5bKn+hFbhnOos9/5gEY2nN9UQIDAQAB"
   (All one line, WITH quotes!)
5. TTL: 300
6. Click: "Create records"
```

---

## ⚠️ COMMON MISTAKES TO AVOID:

### **1. TXT Records NEED Quotes in Route 53:**
❌ **Wrong:** `v=spf1 include:mailgun.org ~all`  
✅ **Right:** `"v=spf1 include:mailgun.org ~all"`

### **2. MX Records Format:**
❌ **Wrong:** `mxa.mailgun.org 10`  
✅ **Right:** `10 mxa.mailgun.org` (priority first!)

### **3. Record Name for Root Domain:**
✅ **Either:** Leave completely BLANK  
✅ **Or:** Type `@`  
❌ **Not:** `lynkapp.net` (don't repeat domain!)

### **4. DKIM Subdomain:**
✅ **Right:** `mailo._domainkey`  
❌ **Wrong:** `mailo._domainkey.lynkapp.net`

### **5. Line Breaks in DKIM:**
❌ **Wrong:** Multiple lines with line breaks  
✅ **Right:** All on ONE line, no breaks

---

## 🔍 After Adding - Verify Records:

### **Wait 5-10 Minutes, Then Check:**

```bash
# Check MX records
nslookup -type=MX lynkapp.net

# Expected output:
lynkapp.net mail exchanger = 10 mxa.mailgun.org
lynkapp.net mail exchanger = 10 mxb.mailgun.org
```

```bash
# Check TXT records  
nslookup -type=TXT lynkapp.net

# Expected output:
lynkapp.net text = "v=spf1 include:mailgun.org ~all"
```

```bash
# Check DKIM record
nslookup -type=TXT mailo._domainkey.lynkapp.net

# Expected output:
mailo._domainkey.lynkapp.net text = "k=rsa; p=MIIG..."
```

---

## 📸 VISUAL EXAMPLE - What It Should Look Like:

### **In Route 53 After Adding All Records:**

```
┌────────────────────────────────────────────────────────────────┐
│ Records for lynkapp.net                                         │
├──────────────────────┬──────┬───────────────────────────────────┤
│ Record name          │ Type │ Value/Route traffic to            │
├──────────────────────┼──────┼───────────────────────────────────┤
│ lynkapp.net          │ A    │ 52.70.xxx.xxx (S3)               │
│ lynkapp.net          │ MX   │ 10 mxa.mailgun.org               │
│ lynkapp.net          │ MX   │ 10 mxb.mailgun.org               │
│ lynkapp.net          │ TXT  │ "v=spf1 include:mailgun.org ~all"│
│ mailo._domainkey...  │ TXT  │ "k=rsa; p=MIIG..."               │
└──────────────────────┴──────┴───────────────────────────────────┘
```

---

## 🎯 Quick Copy-Paste Values:

### **MX Record 1:**
```
10 mxa.mailgun.org
```

### **MX Record 2:**
```
10 mxb.mailgun.org
```

### **SPF TXT Record:**
```
"v=spf1 include:mailgun.org ~all"
```

### **DKIM TXT Record Name:**
```
mailo._domainkey
```

### **DKIM TXT Record Value:**
```
"k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDA+oy3W5NEfjOyJMV+N1gf0ARhAsdDe5Zs1SF4vvNvDb8AMyt5LO5WV8JYx8B2+oHcjeqAwi+cMnBlMtTiZvxvRFYyqVgEBENunlvGj4SxCzGslGEf2K68y8A6U12c+viPowVzJqZrnrsaIcbFO5bKn+hFbhnOos9/5gEY2nN9UQIDAQAB"
```

---

## ✅ Verification Checklist:

After adding all records, verify:

- [ ] Total of 4 records added
- [ ] 2 MX records (mxa and mxb)
- [ ] 1 SPF TXT record (at root)
- [ ] 1 DKIM TXT record (at mailo._domainkey)
- [ ] All TXT records have quotes
- [ ] MX records have priority 10 first
- [ ] Waited 5-10 minutes for DNS propagation
- [ ] Tested with nslookup commands
- [ ] Verified in Mailgun dashboard

---

## 🚀 After Setup Complete:

### **Test Email Forwarding:**
1. Send test email to: `test@lynkapp.net`
2. Should arrive at your Gmail
3. Check delivery time (should be instant)

### **Verify in Mailgun:**
1. Login: https://app.mailgun.com/
2. Go to: Sending → Domains
3. Click: lynkapp.net
4. Should show: ✅ Verified

---

## 💡 Pro Tips:

1. **Always use quotes** for TXT records in Route 53
2. **Priority comes first** for MX records (10 before server)
3. **Leave record name blank** for root domain (@)
4. **One record at a time** - don't rush
5. **Wait for propagation** - DNS takes 5-15 minutes
6. **Test each record** with nslookup after adding

---

## 🎉 Success Indicators:

**You'll know it's working when:**
- ✅ nslookup shows all 4 records
- ✅ Mailgun dashboard shows "Verified"
- ✅ Test emails arrive at Gmail
- ✅ No errors in Route 53 console
- ✅ DNS propagation complete (check with https://dnschecker.org/)

---

**Ready to add the records? Follow the steps above exactly!** 📧✅
