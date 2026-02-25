/**
 * =============================================
 *  T&M Online Fashions — Shopify Configuration
 * =============================================
 *
 *  Central config module for Shopify integration.
 *  Reads values from the environment (.env) when available,
 *  otherwise falls back to placeholder defaults.
 *
 *  USAGE (in browser via <script>):
 *    The config is exposed as `window.ShopifyConfig`
 *
 *  USAGE (in Node / bundler):
 *    const config = require('./shopify.config');
 */

(function () {
    'use strict';

    // ── Helpers ──────────────────────────────────────────
    // In a browser context, env vars aren't available natively.
    // When using a bundler (Vite, Webpack, etc.) they are injected
    // at build time via `process.env` or `import.meta.env`.
    // This function safely reads from either source.

    function getEnv(key, fallback) {
        // Node / bundler environment
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
        // Vite-style env
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            return import.meta.env[key];
        }
        return fallback;
    }

    // ── Configuration Object ────────────────────────────

    const ShopifyConfig = {

        // ── Store Details ──
        storeDomain: getEnv(
            'SHOPIFY_STORE_DOMAIN',
            'your-store.myshopify.com'           // ← placeholder
        ),

        storefrontAccessToken: getEnv(
            'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
            'your-storefront-access-token-here'   // ← placeholder
        ),

        // ── Admin API (optional, for future server-side use) ──
        adminApiKey: getEnv('SHOPIFY_API_KEY', ''),
        adminApiSecret: getEnv('SHOPIFY_API_SECRET', ''),
        adminAccessToken: getEnv('SHOPIFY_ADMIN_ACCESS_TOKEN', ''),

        // ── Preferences ──
        currency: getEnv('SHOPIFY_CURRENCY', 'INR'),
        debugMode: getEnv('SHOPIFY_DEBUG_MODE', 'true') === 'true',

        // ── Derived ──
        get isConfigured() {
            return (
                this.storeDomain !== 'your-store.myshopify.com' &&
                this.storefrontAccessToken !== 'your-storefront-access-token-here'
            );
        },

        get storefrontApiUrl() {
            return `https://${this.storeDomain}/api/2024-01/graphql.json`;
        },
    };

    // ── Expose globally ─────────────────────────────────
    if (typeof window !== 'undefined') {
        window.ShopifyConfig = ShopifyConfig;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ShopifyConfig;
    }

})();
