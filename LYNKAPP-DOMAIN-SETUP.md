# 🌐 LynkApp.net - Custom Domain Setup Guide

**Connect your lynkapp.net domain to AWS S3 in 15 minutes!**

---

## 📋 WHAT THIS GUIDE DOES

After deploying your site with `deploy-to-lynkapp.bat`, you have:
- ✅ S3 bucket named "lynkapp.net" with your website
- ✅ Temporary URL: `http://lynkapp.net.s3-website-us-east-1.amazonaws.com`

Now we need to point your custom domain **lynkapp.net** to this S3 bucket.

---

## 🎯 DEPLOYMENT STATUS

### Step 1: Deploy to S3 ✅
Run this first if you haven't already:
```cmd
cd C:\Users\Jnewball\Test-apps\Test-apps
deploy-to-lynkapp.bat
```

### Step 2: Configure Domain DNS ⬅️ YOU ARE HERE
Follow this guide to connect lynkapp.net to your S3 website

---

## 🌐 DNS CONFIGURATION METHODS

Choose the method that matches where you purchased/manage lynkapp.net:

### Method 1: AWS Route 53 (Recommended - Full AWS Integration)
### Method 2: External Domain Registrar (GoDaddy, Namecheap, etc.)

---

## METHOD 1: AWS ROUTE 53 (RECOMMENDED)

### Benefits:
- Fastest DNS propagation (5-10 minutes)
- Native AWS integration
- Automatic health checks
- Easy SSL/HTTPS setup later

### Cost: $0.50/month for hosted zone

### Steps:

#### 1. Log into AWS Console
```
https://console.aws.amazon.com/
```

#### 2. Open Route 53
- Search for "Route 53" in the top search bar
- Click "Route 53"

#### 3. Create Hosted Zone
- Click "Hosted zones" in left sidebar
- Click "Create hosted zone"
- Domain name: `lynkapp.net`
- Type: Public hosted zone
- Click "Create hosted zone"

#### 4. Note Your Name Servers
You'll see 4 name servers like:
```
ns-1234.awsdns-12.org
ns-5678.awsdns-34.com
ns-9012.awsdns-56.net
ns-3456.awsdns-78.co.uk
```
**COPY THESE** - you'll need them if lynkapp.net is registered elsewhere!

#### 5. Create A Record for Root Domain
- Click "Create record"
- Record name: (leave blank for root domain)
- Record type: A - Routes traffic to an IPv4 address
- Click "Alias" toggle
- Route traffic to: "Alias to S3 website endpoint"
- Choose region: "US East (N. Virginia) us-east-1"
- Choose S3 bucket: `s3-website-us-east-1.amazonaws.com.` or `lynkapp.net`
- Click "Create records"

#### 6. Create A Record for www Subdomain (Optional)
- Click "Create record"
- Record name: `www`
- Record type: A
- Click "Alias" toggle  
- Route traffic to: "Alias to S3 website endpoint"
- Choose region: "US East (N. Virginia) us-east-1"
- Choose S3 bucket: `s3-website-us-east-1.amazonaws.com.` or `lynkapp.net`
- Click "Create records"

#### 7. Update Domain Name Servers (If Registered Elsewhere)
If you bought lynkapp.net from GoDaddy, Namecheap, etc.:
- Go to your domain registrar's website
- Find DNS/Nameserver settings
- Replace their nameservers with the 4 AWS nameservers from Step 4
- Save changes

#### 8. Wait for DNS Propagation
- Usually 5-15 minutes with Route 53
- Check status: `nslookup lynkapp.net`

#### 9. Test Your Domain!
```
http://lynkapp.net
http://www.lynkapp.net
```

---

## METHOD 2: EXTERNAL DOMAIN REGISTRAR

If lynkapp.net is registered with GoDaddy, Namecheap, Google Domains, etc.

### Option A: CNAME Record (Easiest)

**For www.lynkapp.net:**

1. Log into your domain registrar
2. Find DNS Management / DNS Settings
3. Add a CNAME record:
   - Type: CNAME
   - Name/Host: `www`
   - Value/Points to: `lynkapp.net.s3-website-us-east-1.amazonaws.com`
   - TTL: 300 (or lowest available)
4. Save changes
5. Wait 15-30 minutes
6. Test: `http://www.lynkapp.net`

**Note:** CNAME doesn't work for root domain (lynkapp.net without www)

### Option B: URL Redirect (Quick Fix)

1. Log into your domain registrar
2. Set up URL forwarding/redirect:
   - From: `lynkapp.net`
   - To: `http://lynkapp.net.s3-website-us-east-1.amazonaws.com`
   - Type: 301 Permanent
3. Save changes
4. Test immediately

### Option C: A Record with Static IP (Advanced)

**⚠️ Not recommended** - S3 website endpoints don't have static IPs

Use Route 53 (Method 1) instead for proper A record setup.

---

## 🔍 COMMON REGISTRAR INSTRUCTIONS

### GoDaddy:
1. Go to https://dnsmanagement.godaddy.com/
2. Click on lynkapp.net
3. Click "Add" under Records
4. Type: CNAME, Name: www, Value: `lynkapp.net.s3-website-us-east-1.amazonaws.com`
5. Save

### Namecheap:
1. Go to Domain List → Manage
2. Advanced DNS tab
3. Add New Record
4. Type: CNAME, Host: www, Value: `lynkapp.net.s3-website-us-east-1.amazonaws.com`
5. Save

### Google Domains:
1. Go to DNS settings
2. Custom resource records
3. Name: www, Type: CNAME, Data: `lynkapp.net.s3-website-us-east-1.amazonaws.com`
4. Add

### Cloudflare:
1. DNS settings
2. Add record
3. Type: CNAME, Name: www, Target: `lynkapp.net.s3-website-us-east-1.amazonaws.com`
4. Save (Orange cloud = proxied, Gray cloud = DNS only)

---

## 🧪 TESTING YOUR DOMAIN

### Test DNS Resolution:
```cmd
nslookup lynkapp.net
nslookup www.lynkapp.net
```

Should return IP addresses or CNAME record.

### Test in Browser:
```
http://lynkapp.net
http://www.lynkapp.net
```

### Check DNS Propagation Globally:
```
https://www.whatsmydns.net/#A/lynkapp.net
```

---

## ⏱️ HOW LONG DOES IT TAKE?

| Method | Typical Time |
|--------|-------------|
| AWS Route 53 | 5-15 minutes |
| CNAME Record | 15-60 minutes |
| Nameserver Change | 1-48 hours (usually < 6 hours) |
| URL Redirect | Instant - 5 minutes |

---

## 🛠️ TROUBLESHOOTING

### Domain doesn't work after 1 hour

**Check 1: DNS Settings**
```cmd
nslookup lynkapp.net
```
If it shows your old IP or nothing, DNS isn't configured correctly.

**Check 2: S3 Bucket Name**
- Bucket name MUST be exactly: `lynkapp.net`
- Check in S3 console: https://s3.console.aws.amazon.com/

**Check 3: Website Hosting Enabled**
```cmd
aws s3 website s3://lynkapp.net/ --index-document ConnectHub_Mobile_Design.html
```

### Shows "NoSuchBucket" or 404 Error

- Bucket name doesn't match domain name
- Create bucket named exactly `lynkapp.net`

### DNS shows correct but browser doesn't load

- Clear browser cache (Ctrl+Shift+Del)
- Try incognito/private mode
- Try different browser
- Check if using http:// not https://

### "This site can't be reached"

- DNS not propagated yet - wait longer
- Check DNS with: `nslookup lynkapp.net`
- Flush DNS cache: `ipconfig /flushdns` (Windows)

---

## 🔒 ADDING HTTPS (OPTIONAL - RECOMMENDED)

S3 website endpoints only support HTTP. For HTTPS, you need CloudFront:

### Quick HTTPS Setup:

1. **Create CloudFront Distribution:**
   - Origin: `lynkapp.net.s3-website-us-east-1.amazonaws.com`
   - Alternate domain names: `lynkapp.net`, `www.lynkapp.net`

2. **Request SSL Certificate in ACM:**
   - Go to AWS Certificate Manager
   - Request public certificate
   - Domain: `lynkapp.net` and `*.lynkapp.net`
   - Validate via DNS or email

3. **Update DNS:**
   - Point A record to CloudFront distribution
   - Instead of S3 endpoint

**Cost:** FREE for first year, then ~$0-$10/month depending on traffic

**Detailed guide:** See AWS-DEPLOYMENT-GUIDE.md section on CloudFront

---

## ✅ VERIFICATION CHECKLIST

After DNS setup, verify:

- [ ] `http://lynkapp.net` loads your website
- [ ] `http://www.lynkapp.net` loads your website
- [ ] `nslookup lynkapp.net` returns valid response
- [ ] Test from different devices/networks
- [ ] Website shows latest content
- [ ] Images and resources load correctly

---

## 📊 DNS RECORD SUMMARY

### If Using Route 53:
```
lynkapp.net         A    Alias → lynkapp.net.s3-website-us-east-1.amazonaws.com
www.lynkapp.net     A    Alias → lynkapp.net.s3-website-us-east-1.amazonaws.com
```

### If Using External Registrar:
```
www.lynkapp.net     CNAME    lynkapp.net.s3-website-us-east-1.amazonaws.com
lynkapp.net         URL      Redirect to www.lynkapp.net
```

---

## 🔄 AFTER DOMAIN IS LIVE

### Update Website:
```cmd
cd C:\Users\Jnewball\Test-apps\Test-apps
update-lynkapp.bat
```

### Your URLs:
- **Primary:** http://lynkapp.net
- **With www:** http://www.lynkapp.net
- **S3 Direct:** http://lynkapp.net.s3-website-us-east-1.amazonaws.com

---

## 💰 COSTS

| Service | Monthly Cost |
|---------|-------------|
| S3 Hosting | $0.00 - $0.50 |
| Route 53 (if used) | $0.50 |
| Domain Registration | $10 - $15/year |
| **TOTAL** | **~$0.50 - $1.00/month** |

---

## 🆘 NEED HELP?

### AWS Support:
- Route 53 Docs: https://docs.aws.amazon.com/route53/
- S3 Website Docs: https://docs.aws.amazon.com/s3/

### DNS Tools:
- DNS Checker: https://dnschecker.org/
- What's My DNS: https://www.whatsmydns.net/
- DNS Propagation: https://www.whatsmydns.net/dns-propagation-checker

### Common Issues:
1. **Bucket name must exactly match domain**
2. **Use HTTP not HTTPS** (unless CloudFront is set up)
3. **DNS takes time** - be patient!

---

## 🎉 SUCCESS!

Once your domain is working:

1. ✅ lynkapp.net points to your S3 website
2. ✅ Updates deploy in seconds with `update-lynkapp.bat`
3. ✅ Professional web presence for pennies
4. ✅ Scalable infrastructure ready for growth

### What's Next?

- **Add HTTPS:** Set up CloudFront + SSL certificate
- **Custom Email:** Set up email@lynkapp.net with AWS SES
- **Analytics:** Add Google Analytics or AWS CloudWatch
- **CDN:** Use CloudFront for faster global access
- **Monitoring:** Set up uptime monitoring

---

**Created:** February 3, 2026  
**Domain:** lynkapp.net  
**Deployment:** AWS S3 Static Website  
**Estimated Setup Time:** 15 minutes  

---

## Quick Reference Commands

```cmd
# Deploy website
deploy-to-lynkapp.bat

# Update website  
update-lynkapp.bat

# Check DNS
nslookup lynkapp.net

# Flush DNS cache (Windows)
ipconfig /flushdns

# Test S3 endpoint
start http://lynkapp.net.s3-website-us-east-1.amazonaws.com

# Test domain
start http://lynkapp.net
```

---

**Your website will be live at http://lynkapp.net after DNS propagation!** 🚀
