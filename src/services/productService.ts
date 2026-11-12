import {fallbackProducts} from '../data/fallback/catalog';
import type {Product} from '../types/commerce';

export interface ProductQuery { categorySlug?:string; subcategorySlug?:string; search?:string }
export interface ProductRepository {
 getPublishedProducts(query?:ProductQuery):Promise<Product[]>;
 getProductById(id:number):Promise<Product|null>;
}

class FallbackProductRepository implements ProductRepository {
 async getPublishedProducts(query:ProductQuery={}):Promise<Product[]> {
  const search=query.search?.trim().toLowerCase();
  return fallbackProducts.filter(product=>(!query.categorySlug||product.category===query.categorySlug)&&(!query.subcategorySlug||product.subcategory===query.subcategorySlug)&&(!search||`${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(search)));
 }
 async getProductById(id:number):Promise<Product|null>{return fallbackProducts.find(product=>product.id===id)||null}
}

// Swap this implementation for a mapper backed by the public WooCommerce API.
// UI callers keep the same contract and never receive API credentials.
const productRepository:ProductRepository=new FallbackProductRepository();
export const getPublishedProducts=(query?:ProductQuery)=>productRepository.getPublishedProducts(query);
export const getProductById=(id:number)=>productRepository.getProductById(id);
