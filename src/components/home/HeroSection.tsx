import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight,LayoutGrid} from 'lucide-react';
import {Link} from 'react-router-dom';
import {heroFallbackSlides} from '../../config/heroFallback';
import {fetchPublishedHeroSlides,isHeroApiConfigured} from '../../services/heroService';
import type {HeroLoadState,HeroSlide} from '../../types/hero';

const localSlides=heroFallbackSlides.filter(slide=>slide.isActive&&slide.status==='published').sort((a,b)=>a.order-b.order);

export function HeroSection(){
 const [slides,setSlides]=useState<HeroSlide[]>(localSlides);const [active,setActive]=useState(0);const [direction,setDirection]=useState<1|-1>(1);const [loadState,setLoadState]=useState<HeroLoadState>('fallback');const [paused,setPaused]=useState(false);const [reducedMotion,setReducedMotion]=useState(false);const gesture=useRef({pointerId:-1,startX:0,startY:0,lastX:0,lastY:0});const suppressClick=useRef(false);
 useEffect(()=>{if(!isHeroApiConfigured())return;const controller=new AbortController();setLoadState('loading');fetchPublishedHeroSlides(controller.signal).then(remoteSlides=>{if(remoteSlides.length){setSlides(remoteSlides);setActive(0);setLoadState('ready')}else setLoadState('fallback')}).catch(error=>{if((error as Error).name!=='AbortError')setLoadState('error')});return()=>controller.abort()},[]);
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReducedMotion(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[]);
 const hasMultiple=slides.length>1;const move=useCallback((step:number)=>{setDirection(step<0?-1:1);setActive(current=>(current+step+slides.length)%slides.length)},[slides.length]);
 useEffect(()=>{if(!hasMultiple||paused||reducedMotion)return;const timer=window.setInterval(()=>move(1),3000);return()=>window.clearInterval(timer)},[hasMultiple,move,paused,reducedMotion]);
 const slide=slides[active]||heroFallbackSlides[0];
 const fallbackImage=heroFallbackSlides[0].desktopImage.url;
 const startSwipe=(event:React.PointerEvent<HTMLElement>)=>{if(event.pointerType==='mouse')return;gesture.current={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,lastX:event.clientX,lastY:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);setPaused(true)};
 const updateSwipe=(event:React.PointerEvent<HTMLElement>)=>{if(gesture.current.pointerId!==event.pointerId)return;gesture.current.lastX=event.clientX;gesture.current.lastY=event.clientY};
 const finishSwipe=(event:React.PointerEvent<HTMLElement>)=>{if(gesture.current.pointerId!==event.pointerId)return;const distanceX=gesture.current.lastX-gesture.current.startX;const distanceY=gesture.current.lastY-gesture.current.startY;gesture.current.pointerId=-1;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);if(Math.abs(distanceX)>45&&Math.abs(distanceX)>Math.abs(distanceY)){suppressClick.current=true;if(hasMultiple)move(distanceX<0?1:-1)}setPaused(false)};
 return (
  <section className={`hero hero-image-${slide.imagePresentation||'product'}`} aria-labelledby="hero-title" aria-roledescription={hasMultiple?'carousel':undefined} aria-busy={loadState==='loading'} data-content-state={loadState} onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false)}} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onPointerDown={startSwipe} onPointerMove={updateSwipe} onPointerUp={finishSwipe} onPointerCancel={finishSwipe} onClickCapture={event=>{if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false}}}>
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
     {slide.imagePresentation==='full-banner'?<Link className="hero-full-banner-link" to={slide.primaryButton.link} aria-label={slide.primaryButton.text}><picture className="hero-picture">{slide.mobileImage&&<source media="(max-width: 767px)" srcSet={slide.mobileImage.url}/>}<img draggable={false} src={slide.desktopImage.url} alt={slide.desktopImage.alt} width={slide.desktopImage.width} height={slide.desktopImage.height} fetchPriority={active===0?'high':'auto'} decoding="async" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src=fallbackImage}}/></picture></Link>:<picture className="hero-picture">{slide.mobileImage&&<source media="(max-width: 767px)" srcSet={slide.mobileImage.url}/>}<img draggable={false} src={slide.desktopImage.url} alt={slide.desktopImage.alt} width={slide.desktopImage.width} height={slide.desktopImage.height} fetchPriority={active===0?'high':'auto'} decoding="async" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src=fallbackImage}}/></picture>}
    </div>
   </div>
   {hasMultiple&&<><button className="hero-arrow previous" type="button" onClick={()=>move(-1)} aria-label="Previous hero slide"><ChevronLeft/></button><button className="hero-arrow next" type="button" onClick={()=>move(1)} aria-label="Next hero slide"><ChevronRight/></button><div className="hero-indicators" aria-label="Hero slides">{slides.map((item,index)=><button key={item.id} className={index===active?'active':''} onClick={()=>{setDirection(index<active?-1:1);setActive(index)}} aria-label={`Show slide ${index+1}`} aria-current={index===active?'true':undefined}/>)}</div></>}
  </section>
 );
}
