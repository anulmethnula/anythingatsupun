/// <reference types="vite/client" />

interface ImportMetaEnv {
 readonly VITE_WORDPRESS_API_BASE_URL?:string;
 readonly VITE_WOOCOMMERCE_STORE_API_BASE_URL?:string;
 readonly VITE_WORDPRESS_HERO_ENDPOINT?:string;
 readonly VITE_WORDPRESS_PROMO_BANNER_ENDPOINT?:string;
 readonly VITE_PRODUCT_VIEWERS_ENDPOINT?:string;
 readonly VITE_WOOCOMMERCE_REVIEWS_ENDPOINT?:string;
}
interface ImportMeta { readonly env:ImportMetaEnv }
