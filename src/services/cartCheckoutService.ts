import type {CheckoutDraft,PersistedCartLine,Product} from '../types/commerce';

const cartKey='aas-cart';
const couponKey='aas-coupon';
export interface CheckoutRepository { createCheckout(draft:CheckoutDraft):Promise<never> }
export const checkoutRepository:CheckoutRepository={async createCheckout(){throw new Error('Checkout API is not configured.')}};

export function readCart(products:Product[]):Array<{product:Product;qty:number}>{
 try{
  const parsed:unknown=JSON.parse(localStorage.getItem(cartKey)||'[]');
  if(!Array.isArray(parsed))return [];
  return parsed.flatMap(item=>{
   if(!item||typeof item!=='object')return [];
   const value=item as {id?:unknown;productId?:unknown;qty?:unknown;quantity?:unknown};
   const id=Number(value.productId??value.id);const qty=Math.max(1,Number(value.quantity??value.qty)||1);const product=products.find(candidate=>candidate.id===id);
   return product?[{product,qty}]:[];
  });
 }catch{return []}
}
export const saveCart=(lines:PersistedCartLine[])=>localStorage.setItem(cartKey,JSON.stringify(lines));
export const getAppliedCoupon=()=>localStorage.getItem(couponKey)||'';
export const saveAppliedCoupon=(code:string)=>code?localStorage.setItem(couponKey,code):localStorage.removeItem(couponKey);
