export type CookieCategory='analytics'|'marketing';
export type CookieConsent={version:1;essential:true;analytics:boolean;marketing:boolean;updatedAt:string};

const consentKey='aas-cookie-consent-v1';
export const cookieSettingsEvent='aas:open-cookie-settings';
export const cookieConsentChangedEvent='aas:cookie-consent-changed';

export function readCookieConsent():CookieConsent|null{
 try{
  const value:unknown=JSON.parse(localStorage.getItem(consentKey)||'null');
  if(!value||typeof value!=='object')return null;
  const consent=value as Partial<CookieConsent>;
  if(consent.version!==1||consent.essential!==true||typeof consent.analytics!=='boolean'||typeof consent.marketing!=='boolean')return null;
  return consent as CookieConsent;
 }catch{return null}
}

export function saveCookieConsent(preferences:Pick<CookieConsent,'analytics'|'marketing'>):CookieConsent{
 const consent:CookieConsent={version:1,essential:true,...preferences,updatedAt:new Date().toISOString()};
 localStorage.setItem(consentKey,JSON.stringify(consent));
 window.dispatchEvent(new CustomEvent<CookieConsent>(cookieConsentChangedEvent,{detail:consent}));
 return consent;
}

export function hasCookieConsent(category:CookieCategory):boolean{return readCookieConsent()?.[category]===true}
export function openCookieSettings():void{window.dispatchEvent(new Event(cookieSettingsEvent))}
