# EmailJS Troubleshooting Guide

## Current Configuration Issues Found:

### 1. ❌ Public Key Seems Incomplete
- Current: `ew8YT9mIwAD6XzO7M` (only 16 characters)
- EmailJS public keys are typically much longer (around 80+ characters)

### 2. ❌ Template ID Format
- Current: `template_14zefe9`
- This format looks correct, but needs verification

### 3. ❌ Service ID Format  
- Current: `phool_shop_service`
- This format looks correct, but needs verification

## Steps to Fix EmailJS:

### Step 1: Verify Your EmailJS Account
1. Go to https://www.emailjs.com/
2. Log into your account
3. Check your Email Services:
   - Go to "Email Services" in the left sidebar
   - Verify `phool_shop_service` exists and is active
   - Note the correct Service ID

### Step 2: Check Your Email Template
1. Go to "Email Templates" in the left sidebar
2. Find template `template_14zefe9`
3. Verify the template exists and is active
4. Check that the template has all the variables we're sending:
   - `{{order_id}}`, `{{name}}`, `{{email}}`, `{{phone}}`, `{{address}}`
   - `{{order_summary}}`, `{{total_amount}}`, `{{status}}`, etc.

### Step 3: Get Your Correct Public Key
1. Go to "Account" → "General" 
2. Copy your Public Key (should be long, like: `B2YkR_pF8xN7J3K5m9L1qQrZsT4uVwXyZaBcD6eFgHiJkLmNoPqRsTuVwXyZ`)
3. Replace the current key in `.env`

### Step 4: Test EmailJS Configuration
Add this test code to your browser console on your website:
```javascript
import("@emailjs/browser").then(({ send }) => {
  send("phool_shop_service", "template_14zefe9", 
    {name: "Test", email: "test@example.com"}, 
    "YOUR_CORRECT_PUBLIC_KEY")
  .then(() => console.log("Email sent successfully!"))
  .catch(err => console.error("Email failed:", err));
});
```

### Step 5: Common Issues & Solutions

#### Issue: "Public key is invalid"
**Solution**: Get the correct public key from your EmailJS account

#### Issue: "Template not found"  
**Solution**: Verify template ID and that template is active

#### Issue: "Service not found"
**Solution**: Verify service ID and that email service is configured

#### Issue: "Missing required parameters"
**Solution**: Add all required variables to your EmailJS template

#### Issue: Emails going to spam
**Solution**: Check email content, SPF/DKIM records, and sender reputation

## Debug Code Addition:
Add this to your Order.tsx to see detailed error messages:

```javascript
// Send email in background (do not block checkout)
send(serviceId, templateId, emailPayload, publicKey)
  .then((response) => {
    console.log("Email sent successfully!", response.status, response.text);
  })
  .catch((err) => {
    console.error("Order email send failed:", err);
    console.error("Full error details:", JSON.stringify(err, null, 2));
  });
```

## Quick Test:
Place a test order and check the browser console (F12) for detailed error messages.
