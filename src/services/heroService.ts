import type {HeroApiPayload,HeroButton,HeroImage,HeroSlide} from '../types/hero';
import {apiConfig} from '../config/api';

const apiBase=apiConfig.wordpressBaseUrl;
const heroEndpoint=(import.meta.env.VITE_WORDPRESS_HERO_ENDPOINT as string|undefined)?.trim();

export const isHeroApiConfigured=()=>Boolean(apiBase&&heroEndpoint);

const safeUrl=(value:unknown,kind:'image'|'link')=>{
 if(typeof value!=='string'||!value.trim())return null;
 const candidate=value.trim();
 if(candidate.startsWith('/')&&!candidate.startsWith('//'))return candidate;
 try{const parsed=new URL(candidate);if(parsed.protocol==='https:'||(import.meta.env.DEV&&parsed.protocol==='http:'))return parsed.toString()}catch{return null}
 return null;
};
const text=(value:unknown,max=240)=>typeof value==='string'?value.trim().slice(0,max):'';
const positiveNumber=(value:unknown,fallback:number)=>typeof value==='number'&&Number.isFinite(value)&&value>0?value:fallback;
const image=(value:unknown):HeroImage|null=>{if(!value||typeof value!=='object')return null;const item=value as Record<string,unknown>;const url=safeUrl(item.url,'image');if(!url)return null;return {url,alt:text(item.alt,180),width:positiveNumber(item.width,1536),height:positiveNumber(item.height,1024)}};
const button=(value:unknown):HeroButton|null=>{if(!value||typeof value!=='object')return null;const item=value as Record<string,unknown>;const link=safeUrl(item.link,'link');const label=text(item.text,60);return link&&label?{text:label,link}:null};
const dateIsValid=(value:unknown)=>typeof value==='string'&&!Number.isNaN(Date.parse(value));

const parseSlide=(value:unknown):HeroSlide|null=>{
 if(!value||typeof value!=='object')return null;
 const item=value as Record<string,unknown>;const desktopImage=image(item.desktopImage);const mobileImage=image(item.mobileImage);const primaryButton=button(item.primaryButton);const secondaryButton=button(item.secondaryButton);const heading=text(item.heading,140);const description=text(item.description,500);
 if(!desktopImage||!primaryButton||!heading||!description)return null;
 const status=item.status==='published'||item.status==='scheduled'||item.status==='draft'?item.status:'draft';
 const imagePresentation=item.imagePresentation==='full-banner'?'full-banner':item.imagePresentation==='banner'?'banner':'product';
 return {id:text(item.id,80)||crypto.randomUUID(),eyebrow:text(item.eyebrow,60)||undefined,heading,highlightedHeading:text(item.highlightedHeading,140)||undefined,description,desktopImage,mobileImage:mobileImage||undefined,primaryButton,secondaryButton:secondaryButton||undefined,showPrimaryButton:item.showPrimaryButton!==false,showSecondaryButton:item.showSecondaryButton===true&&Boolean(secondaryButton),imagePresentation,order:typeof item.order==='number'?item.order:999,isActive:item.isActive===true,status,publishAt:dateIsValid(item.publishAt)?item.publishAt as string:undefined,expiresAt:dateIsValid(item.expiresAt)?item.expiresAt as string:undefined};
};

const isPublishedNow=(slide:HeroSlide,now=Date.now())=>slide.isActive&&slide.status==='published'&&(!slide.publishAt||Date.parse(slide.publishAt)<=now)&&(!slide.expiresAt||Date.parse(slide.expiresAt)>now);

export async function fetchPublishedHeroSlides(signal?:AbortSignal):Promise<HeroSlide[]>{
 if(!apiBase||!heroEndpoint)throw new Error('Hero API is not configured.');
 const response=await fetch(`${apiBase}${heroEndpoint.startsWith('/')?heroEndpoint:`/${heroEndpoint}`}`,{signal,headers:{Accept:'application/json'},credentials:'omit'});
 if(!response.ok)throw new Error(`Hero API returned ${response.status}.`);
 const payload=await response.json() as HeroApiPayload;
 if(!payload||!Array.isArray(payload.slides))throw new Error('Hero API response is invalid.');
 return payload.slides.map(parseSlide).filter((slide):slide is HeroSlide=>Boolean(slide)).filter(slide=>isPublishedNow(slide)).sort((a,b)=>a.order-b.order);
}
