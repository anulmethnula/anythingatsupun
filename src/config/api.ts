const clean=(value:string|undefined)=>value?.trim().replace(/\/$/,'')||'';
export const apiConfig=Object.freeze({wordpressBaseUrl:clean(import.meta.env.VITE_WORDPRESS_API_BASE_URL),wooCommerceStoreApiBaseUrl:clean(import.meta.env.VITE_WOOCOMMERCE_STORE_API_BASE_URL)});
export const hasWordPressApi=()=>Boolean(apiConfig.wordpressBaseUrl);
export const hasWooCommerceStoreApi=()=>Boolean(apiConfig.wooCommerceStoreApiBaseUrl);
// Base URLs are public configuration. API secrets and privileged nonces must remain server-side.
