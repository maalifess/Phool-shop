Placeholder / Reference

This file lists where contact information, email settings, and related placeholders are defined and used in the project.

1) Contact information shown to users
- Order page displays contact placeholders (email/phone):
  File: src/pages/Order.tsx (lines ~200-210)
  - Exact lines:
    - Email fallback shown at: src/pages/Order.tsx#L206
    - Phone fallback shown at: src/pages/Order.tsx#L207
- Environment variables used (set these in a .env at project root):
  - VITE_SHOP_CONTACT_EMAIL  (e.g., orders@example.com)
  - VITE_SHOP_CONTACT_PHONE  (e.g., 0321-000-0000)

2) Email sending configuration (EmailJS)
- Files that send emails:
  - src/pages/CustomOrders.tsx (env/read/send at lines ~30-35)
    - Service ID: src/pages/CustomOrders.tsx#L30
    - Template ID: src/pages/CustomOrders.tsx#L31
    - Public key: src/pages/CustomOrders.tsx#L32
    - send() call: src/pages/CustomOrders.tsx#L35
  - src/pages/Order.tsx (env/read/send at lines ~49-54)
    - Service ID: src/pages/Order.tsx#L49
    - Template ID: src/pages/Order.tsx#L50
    - Public key: src/pages/Order.tsx#L51
    - send() call: src/pages/Order.tsx#L54
- Environment variables for EmailJS (set in .env):
  - VITE_EMAILJS_SERVICE_ID
  - VITE_EMAILJS_TEMPLATE_ID
  - VITE_EMAILJS_PUBLIC_KEY
- Package dependency added in package.json: @emailjs/browser

3) Form payload fields (sent to EmailJS)
- CustomOrders payload includes: name, email, phone, description, colors, timeline
- Order payload includes: name, email, phone, quantity, address, products, notes

4) Local fallbacks and keys
- If env vars are not set, the UI falls back to placeholders shown in `src/pages/Order.tsx`.
- LocalStorage/cart keys (for reference): phool_cart_v1

5) How to enable emails locally
- Create a `.env` file in the project root with the variables above, e.g.:
  VITE_EMAILJS_SERVICE_ID=your_service_id
  VITE_EMAILJS_TEMPLATE_ID=your_template_id
  VITE_EMAILJS_PUBLIC_KEY=your_public_key
  VITE_SHOP_CONTACT_EMAIL=orders@example.com
  VITE_SHOP_CONTACT_PHONE=0321-000-0000
- Run `npm install` then `npm run dev`.

If you want, I can add an example EmailJS template payload or commit a `.env.example` file. Let me know which you'd prefer.