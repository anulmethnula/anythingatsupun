import {useEffect,useState} from 'react';
import {ChevronUp} from 'lucide-react';

export function ScrollToTopButton(){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{const update=()=>setVisible(window.scrollY>450);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update)},[]);
 const scrollToTop=()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 return <button type="button" className={`scroll-to-top ${visible?'visible':''}`} onClick={scrollToTop} aria-label="Scroll to top" title="Scroll to top" tabIndex={visible?0:-1}><ChevronUp/></button>;
}
