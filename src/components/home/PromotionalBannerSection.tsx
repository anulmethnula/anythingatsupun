import {useEffect,useRef,useState} from 'react';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import {promoBannerFallback} from '../../config/promoBannerFallback';
import {fetchPublishedPromoBanners,isPromoBannerApiConfigured} from '../../services/promoBannerService';
import type {PromoBanner,PromoBannerLoadState} from '../../types/promoBanner';

type PromotionalBannerSectionProps={autoplay?:boolean;autoplayMs?:number};

function BannerLink({banner,isActive,children}:{banner:PromoBanner;isActive:boolean;children:React.ReactNode}){
 return banner.destinationUrl.startsWith('/')?<Link to={banner.destinationUrl} aria-label={banner.name} tabIndex={isActive?undefined:-1}>{children}</Link>:<a href={banner.destinationUrl} aria-label={banner.name} tabIndex={isActive?undefined:-1}>{children}</a>;
}

export function PromotionalBannerSection({autoplay=true,autoplayMs=6500}:PromotionalBannerSectionProps){
 const [banners,setBanners]=useState<PromoBanner[]>(promoBannerFallback);const [active,setActive]=useState(0);const [paused,setPaused]=useState(false);const [loadState,setLoadState]=useState<PromoBannerLoadState>('fallback');const touchStart=useRef<number|null>(null);
 const hasMultiple=banners.length>1;const move=(direction:number)=>setActive(current=>(current+direction+banners.length)%banners.length);
 useEffect(()=>{if(!isPromoBannerApiConfigured())return;const controller=new AbortController();setLoadState('loading');fetchPublishedPromoBanners(controller.signal).then(remote=>{if(remote.length){setBanners(remote);setActive(0);setLoadState('ready')}else setLoadState('fallback')}).catch(error=>{if((error as Error).name!=='AbortError')setLoadState('error')});return()=>controller.abort()},[]);
 useEffect(()=>{if(!autoplay||!hasMultiple||paused)return;const timer=window.setInterval(()=>setActive(current=>(current+1+banners.length)%banners.length),autoplayMs);return()=>window.clearInterval(timer)},[autoplay,autoplayMs,hasMultiple,paused,banners.length]);
 if(!banners.length)return null;
 return <section className="promo-banner-section" aria-label="Promotions" aria-roledescription={hasMultiple?'carousel':undefined} aria-busy={loadState==='loading'} data-content-state={loadState} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false)}} onTouchStart={event=>{touchStart.current=event.touches[0].clientX;setPaused(true)}} onTouchEnd={event=>{if(touchStart.current===null)return;const distance=event.changedTouches[0].clientX-touchStart.current;touchStart.current=null;if(Math.abs(distance)>45&&hasMultiple)move(distance<0?1:-1)}}><div className="promo-banner-container"><div className="promo-banner-viewport"><div className="promo-banner-track" style={{transform:`translateX(-${active*100}%)`}}>{banners.map((banner,index)=><article className="promo-banner-slide" key={banner.id} aria-hidden={index!==active}><BannerLink banner={banner} isActive={index===active}><picture><source media="(max-width: 640px)" srcSet={banner.mobileImageUrl} width={banner.mobileWidth} height={banner.mobileHeight}/><img src={banner.desktopImageUrl} alt={banner.alt} width={banner.desktopWidth} height={banner.desktopHeight} loading="lazy" decoding="async"/></picture></BannerLink></article>)}</div>{hasMultiple?<><button className="promo-banner-arrow previous" type="button" onClick={()=>move(-1)} aria-label="Previous promotional banner"><ChevronLeft/></button><button className="promo-banner-arrow next" type="button" onClick={()=>move(1)} aria-label="Next promotional banner"><ChevronRight/></button></>:null}</div>{hasMultiple?<div className="promo-banner-dots" aria-label="Choose promotional banner">{banners.map((banner,index)=><button type="button" key={banner.id} className={index===active?'active':''} onClick={()=>setActive(index)} aria-label={`Show ${banner.name}`} aria-current={index===active?'true':undefined}/>)}</div>:null}</div></section>;
}
