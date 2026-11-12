import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {products} from '../data/catalog';
import type {CartLine,Product} from '../types/commerce';
import {readCart,saveCart} from '../services/cartCheckoutService';
import {readWishlist,saveWishlist} from '../services/wishlistReviewService';
type CartItem=CartLine;
type Store={cart:CartItem[];wishlist:number[];add:(p:Product)=>void;remove:(id:number)=>void;setQty:(id:number,q:number)=>void;toggleWish:(id:number)=>void;cartCount:number;subtotal:number};
const C=createContext<Store|null>(null);
export function StoreProvider({children}:{children:React.ReactNode}){
 const [cart,setCart]=useState<CartItem[]>(()=>readCart(products));
 const [wishlist,setWishlist]=useState<number[]>(readWishlist);
 useEffect(()=>saveCart(cart.map(item=>({productId:item.product.id,quantity:item.qty}))),[cart]);
 useEffect(()=>saveWishlist(wishlist),[wishlist]);
 const value=useMemo(()=>({cart,wishlist,add:(p:Product)=>setCart(c=>c.some(x=>x.product.id===p.id)?c.map(x=>x.product.id===p.id?{...x,qty:x.qty+1}:x):[...c,{product:p,qty:1}]),remove:(id:number)=>setCart(c=>c.filter(x=>x.product.id!==id)),setQty:(id:number,q:number)=>setCart(c=>c.map(x=>x.product.id===id?{...x,qty:Math.max(1,q)}:x)),toggleWish:(id:number)=>setWishlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]),cartCount:cart.reduce((a,x)=>a+x.qty,0),subtotal:cart.reduce((a,x)=>a+x.product.price*x.qty,0)}),[cart,wishlist]);
 return <C.Provider value={value}>{children}</C.Provider>
}
export const useStore=()=>{const v=useContext(C);if(!v)throw Error('Store missing');return v};
