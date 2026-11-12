import type {ProductId,ProductReview} from '../types/commerce';
const wishlistKey='aas-wish';
export const readWishlist=():ProductId[]=>{try{const value:unknown=JSON.parse(localStorage.getItem(wishlistKey)||'[]');return Array.isArray(value)?[...new Set(value.filter(item=>Number.isInteger(item)).map(Number))]:[]}catch{return []}};
export const saveWishlist=(ids:ProductId[])=>localStorage.setItem(wishlistKey,JSON.stringify([...new Set(ids)]));

export interface ReviewRepository {
 getPublishedReviews(productId:ProductId):Promise<ProductReview[]>;
 submitReview(productId:ProductId,review:Omit<ProductReview,'id'|'productId'|'createdAt'>):Promise<ProductReview>;
}
export const reviewRepository:ReviewRepository={
 async getPublishedReviews(){return []},
 async submitReview(){throw new Error('Review API is not configured.')},
};
