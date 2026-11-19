import {useEffect,useRef,useState} from 'react';
import {Cookie,ShieldCheck,X} from 'lucide-react';
import {Link} from 'react-router-dom';
import {cookieSettingsEvent,readCookieConsent,saveCookieConsent} from '../services/cookieConsent';

type Preferences={analytics:boolean;marketing:boolean};
const optionalOff:Preferences={analytics:false,marketing:false};

export function CookieConsentBanner(){
 const saved=readCookieConsent();
 const [visible,setVisible]=useState(saved===null);
 const [settingsOpen,setSettingsOpen]=useState(false);
 const [preferences,setPreferences]=useState<Preferences>(()=>saved?{analytics:saved.analytics,marketing:saved.marketing}:optionalOff);
 const bannerRef=useRef<HTMLElement>(null);
 useEffect(()=>{
  const openSettings=()=>{const current=readCookieConsent();setPreferences(current?{analytics:current.analytics,marketing:current.marketing}:optionalOff);setSettingsOpen(true);setVisible(true)};
  window.addEventListener(cookieSettingsEvent,openSettings);
  return()=>window.removeEventListener(cookieSettingsEvent,openSettings);
 },[]);
 useEffect(()=>{
  const root=document.documentElement;
  if(!visible){document.body.classList.remove('cookie-consent-visible');root.style.removeProperty('--cookie-consent-height');return}
  document.body.classList.add('cookie-consent-visible');
  const updateHeight=()=>root.style.setProperty('--cookie-consent-height',`${bannerRef.current?.offsetHeight||0}px`);
  updateHeight();
  const observer=new ResizeObserver(updateHeight);
  if(bannerRef.current)observer.observe(bannerRef.current);
  return()=>{observer.disconnect();document.body.classList.remove('cookie-consent-visible');root.style.removeProperty('--cookie-consent-height')};
 },[visible]);
 const save=(next:Preferences)=>{saveCookieConsent(next);setPreferences(next);setSettingsOpen(false);setVisible(false)};
 if(!visible)return null;
 return <aside ref={bannerRef} className={`cookie-consent${settingsOpen?' settings-open':''}`} aria-label="Cookie consent" aria-live="polite">
  <div className="cookie-consent-intro"><span className="cookie-consent-icon"><Cookie/></span><div><h2>Your privacy choices</h2><p>We use essential storage for core site features. With your permission, analytics and marketing cookies may also be used. Read our <Link to="/privacy-policy">Privacy Policy</Link>.</p></div></div>
  {settingsOpen&&<div className="cookie-preferences" aria-label="Cookie preferences">
   <label><span><ShieldCheck/><b>Essential</b><small>Required for cart, security and saved choices.</small></span><input type="checkbox" checked disabled aria-label="Essential cookies always enabled"/></label>
   <label><span><b>Analytics</b><small>Helps understand site usage and performance.</small></span><input type="checkbox" checked={preferences.analytics} onChange={event=>setPreferences(value=>({...value,analytics:event.target.checked}))}/></label>
   <label><span><b>Marketing</b><small>Allows relevant advertising and campaign measurement.</small></span><input type="checkbox" checked={preferences.marketing} onChange={event=>setPreferences(value=>({...value,marketing:event.target.checked}))}/></label>
  </div>}
  <div className="cookie-consent-actions">
   <button type="button" className="cookie-accept" onClick={()=>save({analytics:true,marketing:true})}>Accept All</button>
   <button type="button" className="cookie-reject" onClick={()=>save(optionalOff)}>Reject Optional</button>
   {settingsOpen?<button type="button" className="cookie-save" onClick={()=>save(preferences)}>Save Choices</button>:<button type="button" className="cookie-settings" onClick={()=>setSettingsOpen(true)}>Settings</button>}
  </div>
  {readCookieConsent()&&<button type="button" className="cookie-close" onClick={()=>{setSettingsOpen(false);setVisible(false)}} aria-label="Close cookie settings"><X/></button>}
 </aside>
}
