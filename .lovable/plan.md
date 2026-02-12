

# Phool Shop — Crochet Business Website

## Design Direction
- Apple-inspired: clean, minimal, generous whitespace, large typography, smooth scroll animations
- Color palette: `#FCF8F8` (lightest bg), `#FBEFEF`, `#F9DFDF`, `#F5AFAF` (accent/CTA)
- Soft, elegant feel with subtle hover effects and fluid transitions

---

## Pages

### 1. Landing Page
- Hero section with large headline, tagline, and a beautiful product image/illustration
- "Shop Now" and "Custom Orders" CTAs
- Featured products section (3–4 highlights)
- About/story section — a brief intro to Phool Shop
- Testimonials or social proof section
- Footer with contact info, social links, and quick navigation

### 2. Catalog Page
- Grid layout of all available products
- Each card shows: product image, name, price, and a quick "Order" button
- Filter/sort by category (e.g., amigurumi, blankets, accessories)
- Products are managed from the admin dashboard

### 3. Custom Orders Page
- Explanation of the custom order process
- Form to submit a custom order request: name, contact, description of what they want, preferred colors/size, budget range, timeline
- Confirmation message after submission

### 4. Fundraisers Page
- List of active and past fundraiser campaigns
- Each fundraiser shows: title, description, goal, and how to participate
- Managed from admin dashboard

### 5. Order Page
- Full order form collecting: customer name, email, phone, shipping address, selected product(s), quantity, and any notes
- Order summary before submission
- Confirmation screen after placing the order
- No online payment — form-only, with instructions on how to pay (e.g., Venmo/cash)

---

## Admin Dashboard (protected)
- Login page for the shop owner
- **Products management**: Add, edit, delete products (name, image URL, price, category, in-stock status)
- **Orders view**: See all submitted orders with customer details
- **Custom orders view**: See custom order requests
- **Fundraisers management**: Add, edit, remove fundraiser campaigns

---

## Backend (Lovable Cloud / Supabase)
- **Products table**: name, description, image_url, price, category, in_stock
- **Orders table**: customer info, product selections, status, notes
- **Custom orders table**: customer info, request details
- **Fundraisers table**: title, description, image, active status
- **Auth**: Simple admin login for the dashboard
- RLS policies to protect data; public read for products/fundraisers, authenticated write for admin

---

## Navigation
- Clean top navbar with: Home, Catalog, Custom Orders, Fundraisers, Order
- Mobile: hamburger menu
- Sticky header with subtle background blur (Apple-style)

