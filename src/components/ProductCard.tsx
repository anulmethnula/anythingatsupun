import {useEffect,useRef,useState} from 'react';
import {Check,Heart,ShoppingCart} from 'lucide-react';
import {Link} from 'react-router-dom';
import {money,Product} from '../data/catalog';
import {useStore} from '../context/StoreContext';

export function ProductCard({product}:{product:Product}){
 const store=useStore();
 const [added,setAdded]=useState(false);
 const confirmationTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const sale=product.originalPrice?Math.round((1-product.price/product.originalPrice)*100):0;
 const wished=store.wishlist.includes(product.id);
 const purchaseLabel=product.options?'Select options':product.stock?'Add to cart':'Out of stock';
 useEffect(()=>()=>{if(confirmationTimer.current)clearTimeout(confirmationTimer.current)},[]);
 const addToCart=()=>{if(added||!product.stock)return;store.add(product);setAdded(true);confirmationTimer.current=setTimeout(()=>setAdded(false),1200)};
 return <article className="product-card">
  <div className="product-media">
   {sale>0&&<span className="sale">-{sale}%</span>}
   {!product.stock&&<span className="sold">Out of stock</span>}
   <button type="button" className={`wish ${wished?'active':''}`} onClick={()=>store.toggleWish(product.id)} aria-label={`${wished?'Remove':'Add'} ${product.name} ${wished?'from':'to'} wishlist`} aria-pressed={wished}><Heart size={19} fill={wished?'currentColor':'none'}/></button>
   <Link to={`/product/${product.id}`}><img src={product.image} alt={product.name} loading="lazy" width="320" height="320"/></Link>
  </div>
  <div className="product-info">
   <Link className="product-name" to={`/product/${product.id}`}>{product.name}</Link>
   <div className="price"><strong>{money(product.price)}</strong>{product.originalPrice&&<del>{money(product.originalPrice)}</del>}</div>
   <div className="product-installments" aria-label="Estimated installment payments">
    <div><span>or 3 × <b>{money(product.price/3)}</b> with</span><img src="/assets/brands/koko.png" alt="KOKO" width="43" height="20" loading="lazy"/></div>
    <div><span>or up to 4 × <b>{money(product.price/4)}</b> with</span><img src="/assets/brands/payzy.png" alt="Payzy" width="48" height="17" loading="lazy"/></div>
   </div>
  </div>
  <div className="product-purchase-reveal">
   {product.options?<Link className="product-purchase-button" to={`/product/${product.id}`} aria-label={`Select options for ${product.name}`}><ShoppingCart/>{purchaseLabel}</Link>:<button type="button" className={`product-purchase-button ${added?'is-added':''}`} disabled={!product.stock||added} onClick={addToCart} aria-label={product.stock?`${added?'Added':'Add'} ${product.name} to cart`:undefined}>{added?<Check/>:<ShoppingCart/>}<span aria-live="polite">{added?'Added to Cart':purchaseLabel}</span></button>}
  </div>
 </article>
}
