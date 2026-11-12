import {useEffect,useMemo,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import {money,products} from '../../data/catalog';
import {getRecentlyViewedIds,recentlyViewedUpdateEvent} from '../../services/recentlyViewed';

const productsById=new Map(products.map(product=>[product.id,product]));

export function RecentlyViewed(){
 const [ids,setIds]=useState<number[]>([]);
 const rail=useRef<HTMLDivElement>(null);
 const [scrollState,setScrollState]=useState({start:true,end:true,overflow:false});
 useEffect(()=>{const update=()=>setIds(getRecentlyViewedIds());update();window.addEventListener(recentlyViewedUpdateEvent,update);window.addEventListener('storage',update);return()=>{window.removeEventListener(recentlyViewedUpdateEvent,update);window.removeEventListener('storage',update)}},[]);
 const viewed=useMemo(()=>ids.map(id=>productsById.get(id)).filter((product):product is (typeof products)[number]=>Boolean(product)),[ids]);
 useEffect(()=>{const element=rail.current;if(!element)return;const update=()=>setScrollState({start:element.scrollLeft<=2,end:element.scrollLeft+element.clientWidth>=element.scrollWidth-2,overflow:element.scrollWidth>element.clientWidth+2});update();element.addEventListener('scroll',update,{passive:true});const resize=new ResizeObserver(update);resize.observe(element);return()=>{element.removeEventListener('scroll',update);resize.disconnect()}},[viewed.length]);
 if(!viewed.length)return null;
 const move=(direction:number)=>rail.current?.scrollBy({left:direction*rail.current.clientWidth*.9,behavior:'smooth'});
 return <section className="container recently-viewed-section" aria-labelledby="recently-viewed-title">
  <div className="section-title recently-viewed-head"><h2 id="recently-viewed-title">Recently Viewed Items</h2>{scrollState.overflow&&<div className="recently-viewed-controls"><button type="button" onClick={()=>move(-1)} disabled={scrollState.start} aria-label="Previous recently viewed products"><ChevronLeft/></button><button type="button" onClick={()=>move(1)} disabled={scrollState.end} aria-label="Next recently viewed products"><ChevronRight/></button></div>}</div>
  <div className="recently-viewed-rail" ref={rail} tabIndex={0} role="region" aria-label="Recently viewed products" onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}if(event.key==='ArrowRight'){event.preventDefault();move(1)}}}>
   {viewed.map(product=><Link className="recently-viewed-card" to={`/product/${product.id}`} key={product.id}><span className="recently-viewed-image"><img src={product.image} alt={product.name} width="150" height="150" loading="lazy"/></span><span className="recently-viewed-copy"><strong>{product.name}</strong><span className="recently-viewed-price"><b>{money(product.price)}</b>{product.originalPrice&&<del>{money(product.originalPrice)}</del>}</span><span className="recently-viewed-payment">or 3 × <b>{money(product.price/3)}</b> with <img src="/assets/brands/koko.png" alt="KOKO" width="43" height="20"/></span><span className="recently-viewed-payment">or up to 4 × <b>{money(product.price/4)}</b> with <img src="/assets/brands/payzy.png" alt="Payzy" width="48" height="17"/></span></span></Link>)}
  </div>
 </section>;
}
