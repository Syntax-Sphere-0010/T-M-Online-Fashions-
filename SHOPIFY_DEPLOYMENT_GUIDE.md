# 🛍️ T&M Online Fashions — Shopify Deployment Guide

A step-by-step guide to deploy your website as a Shopify-powered storefront.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create Your Shopify Store](#2-create-your-shopify-store)
3. [Get Your API Tokens](#3-get-your-api-tokens)
4. [Configure Environment](#4-configure-environment)
5. [Install Dependencies](#5-install-dependencies)
6. [Test Locally](#6-test-locally)
7. [Connect Your Pages to Shopify](#7-connect-your-pages-to-shopify)
8. [Deployment Options](#8-deployment-options)
9. [Going Live Checklist](#9-going-live-checklist)

---

## 1. Prerequisites

Before you begin, make sure you have:

- [ ] **Node.js** (v18 or later) — [Download here](https://nodejs.org/)
- [ ] **npm** (comes with Node.js)
- [ ] **A Shopify account** — [Sign up here](https://www.shopify.com/)
- [ ] **Git** installed (for version control)

---

## 2. Create Your Shopify Store

1. Go to [shopify.com](https://www.shopify.com/) and sign up
2. Choose a plan (you can start with the free trial)
3. Set up your store name (e.g. `tm-online-fashions`)
4. Your store domain will be: `tm-online-fashions.myshopify.com`
5. Add your products via **Shopify Admin → Products**
   - Upload product images
   - Set prices in INR
   - Organise into collections (Sarees, Lehengas, Men's Wear, etc.)

---

## 3. Get Your API Tokens

### Storefront API Token (Required)

1. Log in to [Shopify Admin](https://admin.shopify.com)
2. Go to **Settings** → **Apps and sales channels**
3. Click **Develop apps** (you may need to enable this first)
4. Click **Create an app** → Name it `T&M Storefront`
5. Go to **Configuration** → **Storefront API integration**
6. Select these scopes:
   - ✅ `unauthenticated_read_product_listings`
   - ✅ `unauthenticated_read_product_inventory`
   - ✅ `unauthenticated_write_checkouts`
   - ✅ `unauthenticated_read_checkouts`
   - ✅ `unauthenticated_read_content`
7. Click **Save** → **Install app**
8. Copy the **Storefront API access token**

### Admin API Token (Optional — for future features)

1. In the same app, go to **Configuration** → **Admin API integration**
2. Select scopes you need (e.g. `read_products`, `read_orders`)
3. Click **Save** → **Install app**
4. Copy the **Admin API access token**, **API key**, and **API secret**

---

## 4. Configure Environment

1. **Copy the example environment file:**

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`** and fill in your actual values:

   ```env
   SHOPIFY_STORE_DOMAIN=tm-online-fashions.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=abc123your-real-token-here
   SHOPIFY_CURRENCY=INR
   SHOPIFY_DEBUG_MODE=false
   ```

3. **⚠️ NEVER commit `.env` to Git** — it's already in `.gitignore`

---

## 5. Install Dependencies

```bash
npm install
```

This installs:
- `shopify-buy` — Shopify's official JavaScript Buy SDK
- `dotenv` — Loads `.env` variables
- `live-server` — Local development server

---

## 6. Test Locally

### Quick Config Test

```bash
npm run shopify:test
```

This will tell you if your config is loading correctly.

### Run the Dev Server

```bash
npm run dev
```

This opens your site at `http://localhost:3000`.

### Test the Integration

Open your browser console and try:

```javascript
// Initialise the store
await ShopifyStore.init();

// Check if connected
console.log('Connected:', ShopifyStore.isReady());
console.log('Mock mode:', ShopifyStore.isMockMode());

// Fetch products
const products = await ShopifyStore.fetchProducts();
console.log('Products:', products);

// Add to cart
await ShopifyStore.addToCart('variant-id-here', 1);
console.log('Cart:', ShopifyStore.getCart());
```

---

## 7. Connect Your Pages to Shopify

### Add the SDK Scripts to Your HTML

Add these three `<script>` tags **before** your closing `</body>` tag, and **before** `index.js`:

```html
<!-- Shopify Buy SDK (CDN) -->
<script src="https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js"></script>

<!-- Shopify Config & Integration -->
<script src="./shopify.config.js"></script>
<script src="./shopify-buy.js"></script>

<!-- Your existing scripts -->
<script src="./index.js"></script>
```

### Use ShopifyStore in Your Code

```javascript
// In your index.js or product.js:
document.addEventListener('DOMContentLoaded', async () => {
    await ShopifyStore.init();
    
    // Example: Fetch and display products
    if (ShopifyStore.isReady()) {
        const products = await ShopifyStore.fetchProducts();
        // Render products dynamically...
    }
});
```

---

## 8. Deployment Options

### Option A: Custom Storefront (Recommended)

Deploy your site as a **headless Shopify storefront** on any hosting:

| Platform | Command / Steps |
|----------|----------------|
| **Vercel** | `npx vercel --prod` |
| **Netlify** | Drag & drop your folder, or connect Git repo |
| **GitHub Pages** | Push to a `gh-pages` branch |
| **Firebase** | `npx firebase deploy` |

Your site stays as HTML/CSS/JS and uses the Shopify Storefront API for products, cart, and checkout.

### Option B: Shopify Theme (Full Migration)

Convert your site into a Shopify Liquid theme. This requires:
- Converting HTML → `.liquid` templates
- Moving CSS/JS to `assets/` folder
- Using Liquid tags for dynamic content
- Uploading via Shopify CLI

```bash
npm install -g @shopify/cli @shopify/theme
shopify theme init
shopify theme dev
```

> **Note:** Option B requires significant restructuring. Option A (custom storefront) lets you keep your current HTML structure as-is.

---

## 9. Going Live Checklist

- [ ] Shopify store created with products and collections
- [ ] `.env` file configured with real API tokens
- [ ] `SHOPIFY_DEBUG_MODE` set to `false`
- [ ] Products displaying correctly from Shopify
- [ ] Cart add/remove working
- [ ] Checkout redirect working (goes to Shopify checkout)
- [ ] Payment gateway configured in Shopify Admin
- [ ] Shipping rates configured
- [ ] Tax settings configured
- [ ] Custom domain connected (optional)
- [ ] SSL certificate active
- [ ] Test purchase completed successfully

---

## File Structure After Setup

```
T&M online Fashions/
├── .env.example          ← Template (committed to Git)
├── .env                  ← Your secrets (NOT committed)
├── .gitignore            ← Protects .env & node_modules
├── package.json          ← Dependencies & scripts
├── shopify.config.js     ← Reads config from .env
├── shopify-buy.js        ← Buy SDK integration (cart, products, checkout)
├── index.html            ← Homepage (unchanged)
├── index.css             ← Styles (unchanged)
├── index.js              ← Homepage JS (unchanged)
├── product.html          ← Product page (unchanged)
├── product.js            ← Product page JS (unchanged)
├── women-collection.html ← Collection page (unchanged)
├── men-collection.html   ← Collection page (unchanged)
├── sarees-collection.html← Collection page (unchanged)
├── lehenga-collection.html← Collection page (unchanged)
├── images/               ← Your images (unchanged)
└── node_modules/         ← Installed packages (NOT committed)
```

---

## Need Help?

- 📖 [Shopify Buy SDK Docs](https://shopify.github.io/js-buy-sdk/)
- 📖 [Storefront API Reference](https://shopify.dev/docs/api/storefront)
- 📖 [Shopify CLI for Themes](https://shopify.dev/docs/themes/tools/cli)
- 💬 [Shopify Community Forum](https://community.shopify.com/)
