# Phool Shop Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Environment Setup
1. Copy `.env.example` to `.env` and fill in your real values:
   - EmailJS credentials for order notifications
   - Google Sheets URL for order tracking
   - Real payment details (JazzCash/Bank)
   - Contact information

### 2. Build for Production
```bash
npm run build
```

### 3. Deploy Options

#### Option A: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Connect your repository
4. Set environment variables in Vercel dashboard

#### Option B: Netlify
1. Drag and drop `dist` folder to Netlify
2. Set environment variables in Netlify dashboard
3. Configure custom domain

#### Option C: Traditional Hosting
1. Upload `dist` folder to your hosting
2. Configure .htaccess for SPA routing
3. Set up SSL certificate

### 4. Post-Deployment Checklist
- [ ] Test all forms and checkout process
- [ ] Verify email notifications work
- [ ] Check Google Sheets integration
- [ ] Test admin dashboard (admin/admin123)
- [ ] Update payment details with real information
- [ ] Set up custom domain
- [ ] Configure SSL (if not using Vercel/Netlify)

### 5. Google Sheets Setup (If not done)
1. Create Google Sheet with columns: Timestamp, Order Type, Name, Email, Phone, Address, Products, Quantity, Payment Method, Notes, Custom Description, Custom Colors, Custom Timeline
2. Go to Extensions > Apps Script
3. Paste the deployment code from `src/services/googleSheets.ts`
4. Deploy as Web App with "Anyone" access
5. Copy URL to environment variables

## 🔧 Configuration Files

### Environment Variables Required
- `VITE_EMAILJS_SERVICE_ID` - EmailJS service ID
- `VITE_EMAILJS_TEMPLATE_ID` - EmailJS template ID  
- `VITE_EMAILJS_PUBLIC_KEY` - EmailJS public key
- `VITE_GOOGLE_SHEETS_URL` - Google Apps Script URL
- `VITE_SHOP_CONTACT_EMAIL` - Customer contact email
- `VITE_SHOP_CONTACT_PHONE` - Customer contact phone
- `VITE_JAZZCASH_NUMBER` - JazzCash payment number
- `VITE_BANK_IBAN` - Bank transfer IBAN

### Default Admin Access
- URL: `/admin-login`
- Username: `admin`
- Password: `admin123`
⚠️ **Change these credentials in production!**

## 🌐 Domain Configuration
After deployment, update these files with your domain:
- `index.html` - Update og:url and image URLs
- `.env` - Set VITE_BASE_URL to your domain

## 📱 Mobile Optimization
The site is fully responsive and works on all devices. Test on:
- iOS Safari
- Android Chrome
- Various screen sizes

## 🛡️ Security Notes
- Admin credentials should be changed
- Environment variables must be kept secret
- Google Sheet should be properly shared
- Payment details should be verified

## 📊 Analytics (Optional)
Add Google Analytics or similar by updating `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎉 You're Live!
Once deployed, your Phool Shop will be fully functional with:
- ✅ Product catalog with images
- ✅ Shopping cart and checkout
- ✅ Order management system
- ✅ Payment processing (offline)
- ✅ Admin dashboard
- ✅ Custom order functionality
- ✅ Mobile responsive design
- ✅ SEO optimization
