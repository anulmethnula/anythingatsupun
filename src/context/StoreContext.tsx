import {createContext,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {products} from '../data/catalog';
import type {CartLine,Product} from '../types/commerce';
import {readCart,saveCart} from '../services/cartCheckoutService';
import {readWishlist,saveWishlist} from '../services/wishlistReviewService';
type CartItem=CartLine;
type CartFeedback={type:'success'|'error';message:string}|null;
type Store={cart:CartItem[];wishlist:number[];add:(p:Product,quantity?:number)=>Promise<void>;remove:(id:number)=>void;setQty:(id:number,q:number)=>void;toggleWish:(id:number)=>void;cartCount:number;subtotal:number;cartFeedback:CartFeedback;dismissCartFeedback:()=>void};
const C=createContext<Store|null>(null);
export function StoreProvider({children}:{children:React.ReactNode}){
 const [cart,setCart]=useState<CartItem[]>(()=>readCart(products));
 const [wishlist,setWishlist]=useState<number[]>(readWishlist);
 const [cartFeedback,setCartFeedback]=useState<CartFeedback>(null);
 const cartRef=useRef(cart);
 const feedbackTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>saveWishlist(wishlist),[wishlist]);
 useEffect(()=>()=>{if(feedbackTimer.current)clearTimeout(feedbackTimer.current)},[]);
 const showFeedback=(feedback:Exclude<CartFeedback,null>)=>{setCartFeedback(feedback);if(feedbackTimer.current)clearTimeout(feedbackTimer.current);feedbackTimer.current=setTimeout(()=>setCartFeedback(null),3000)};
 const commitCart=(next:CartItem[])=>{saveCart(next.map(item=>({productId:item.product.id,quantity:item.qty})));cartRef.current=next;setCart(next)};
 const value=useMemo(()=>({cart,wishlist,add:async(p:Product,quantity=1)=>{if(!p.stock)throw new Error('This product is currently out of stock.');await new Promise<void>(resolve=>setTimeout(resolve,120));try{const amount=Math.max(1,Math.floor(quantity));const current=cartRef.current;const next=current.some(x=>x.product.id===p.id)?current.map(x=>x.product.id===p.id?{...x,qty:x.qty+amount}:x):[...current,{product:p,qty:amount}];commitCart(next);showFeedback({type:'success',message:'Added to cart!'})}catch(error){showFeedback({type:'error',message:'Unable to add this item. Please try again.'});throw error}},remove:(id:number)=>{const next=cartRef.current.filter(x=>x.product.id!==id);commitCart(next)},setQty:(id:number,q:number)=>{const next=cartRef.current.map(x=>x.product.id===id?{...x,qty:Math.max(1,q)}:x);commitCart(next)},toggleWish:(id:number)=>setWishlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id]),cartCount:cart.reduce((a,x)=>a+x.qty,0),subtotal:cart.reduce((a,x)=>a+x.product.price*x.qty,0),cartFeedback,dismissCartFeedback:()=>setCartFeedback(null)}),[cart,wishlist,cartFeedback]);
 return <C.Provider value={value}>{children}</C.Provider>
}
export const useStore=()=>{const v=useContext(C);if(!v)throw Error('Store missing');return v};
