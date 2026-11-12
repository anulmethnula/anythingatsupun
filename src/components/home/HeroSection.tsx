import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight,LayoutGrid} from 'lucide-react';
import {Link} from 'react-router-dom';
import {heroFallbackSlides} from '../../config/heroFallback';
import {fetchPublishedHeroSlides,isHeroApiConfigured} from '../../services/heroService';
import type {HeroLoadState,HeroSlide} from '../../types/hero';

const localSlides=heroFallbackSlides.filter(slide=>slide.isActive&&slide.status==='published').sort((a,b)=>a.order-b.order);

export function HeroSection(){
 const [slides,setSlides]=useState<HeroSlide[]>(localSlides);const [active,setActive]=useState(0);const [direction,setDirection]=useState<1|-1>(1);const [loadState,setLoadState]=useState<HeroLoadState>('fallback');const [paused,setPaused]=useState(false);const [reducedMotion,setReducedMotion]=useState(false);const touchStart=useRef<number|null>(null);
 useEffect(()=>{if(!isHeroApiConfigured())return;const controller=new AbortController();setLoadState('loading');fetchPublishedHeroSlides(controller.signal).then(remoteSlides=>{if(remoteSlides.length){setSlides(remoteSlides);setActive(0);setLoadState('ready')}else setLoadState('fallback')}).catch(error=>{if((error as Error).name!=='AbortError')setLoadState('error')});return()=>controller.abort()},[]);
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReducedMotion(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[]);
 const hasMultiple=slides.length>1;const move=useCallback((step:number)=>{setDirection(step<0?-1:1);setActive(current=>(current+step+slides.length)%slides.length)},[slides.length]);
 useEffect(()=>{if(!hasMultiple||paused||reducedMotion)return;const timer=window.setInterval(()=>move(1),3000);return()=>window.clearInterval(timer)},[hasMultiple,move,paused,reducedMotion]);
 const slide=slides[active]||heroFallbackSlides[0];
 return (
  <section className={`hero hero-image-${slide.imagePresentation||'product'}`} aria-labelledby="hero-title" aria-roledescription={hasMultiple?'carousel':undefined} aria-busy={loadState==='loading'} data-content-state={loadState} onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false)}} onTouchStart={event=>{touchStart.current=event.touches[0].clientX;setPaused(true)}} onTouchEnd={event=>{if(touchStart.current===null)return;const distance=event.changedTouches[0].clientX-touchStart.current;touchStart.current=null;if(Math.abs(distance)>45&&hasMultiple)move(distance<0?1:-1);setPaused(false)}}>
   <div className="hero-accent hero-accent-one"/>
   <div className="hero-accent hero-accent-two"/>
   <div className={`hero-inner hero-slide-enter ${direction>0?'from-right':'from-left'}`} key={slide.id}>
    <div className="hero-copy">
     {slide.eyebrow&&<span>{slide.eyebrow}</span>}
     <h1 id="hero-title">{slide.heading}{slide.highlightedHeading&&<><br/><em>{slide.highlightedHeading}</em></>}</h1>
     <p>{slide.description}</p>
     <div className="hero-actions">
      {slide.showPrimaryButton&&<Link to={slide.primaryButton.link} className="primary">{slide.primaryButton.text} <ArrowRight size={18}/></Link>}
      {slide.showSecondaryButton&&slide.secondaryButton&&<Link to={slide.secondaryButton.link} className="secondary"><LayoutGrid size={18}/>{slide.secondaryButton.text}</Link>}
     </div>
    </div>
    <div className="hero-visual">
     {slide.imagePresentation==='full-banner'?<Link className="hero-full-banner-link" to={slide.primaryButton.link} aria-label={slide.primaryButton.text}><picture className="hero-picture"><source media="(max-width: 760px)" srcSet={slide.mobileImage.url}/><img src={slide.desktopImage.url} alt={slide.desktopImage.alt} width={slide.desktopImage.width} height={slide.desktopImage.height} fetchPriority={active===0?'high':'auto'} decoding="async"/></picture></Link>:<picture className="hero-picture"><source media="(max-width: 760px)" srcSet={slide.mobileImage.url}/><img src={slide.desktopImage.url} alt={slide.desktopImage.alt} width={slide.desktopImage.width} height={slide.desktopImage.height} fetchPriority={active===0?'high':'auto'} decoding="async"/></picture>}
    </div>
   </div>
   {hasMultiple&&<><button className="hero-arrow previous" type="button" onClick={()=>move(-1)} aria-label="Previous hero slide"><ChevronLeft/></button><button className="hero-arrow next" type="button" onClick={()=>move(1)} aria-label="Next hero slide"><ChevronRight/></button><div className="hero-indicators" aria-label="Hero slides">{slides.map((item,index)=><button key={item.id} className={index===active?'active':''} onClick={()=>{setDirection(index<active?-1:1);setActive(index)}} aria-label={`Show slide ${index+1}`} aria-current={index===active?'true':undefined}/>)}</div></>}
  </section>
 );
}
