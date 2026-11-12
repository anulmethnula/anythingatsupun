import type {PromoBanner,PromoBannerApiPayload} from '../types/promoBanner';
import {apiConfig} from '../config/api';

const apiBase=apiConfig.wordpressBaseUrl;
const promoBannerEndpoint=(import.meta.env.VITE_WORDPRESS_PROMO_BANNER_ENDPOINT as string|undefined)?.trim();

export const isPromoBannerApiConfigured=()=>Boolean(apiBase&&promoBannerEndpoint);

const safeUrl=(value:unknown)=>{
 if(typeof value!=='string'||!value.trim())return null;
 const candidate=value.trim();
 if(candidate.startsWith('/')&&!candidate.startsWith('//'))return candidate;
 try{const parsed=new URL(candidate);if(parsed.protocol==='https:'||(import.meta.env.DEV&&parsed.protocol==='http:'))return parsed.toString()}catch{return null}
 return null;
};
const text=(value:unknown,max:number)=>typeof value==='string'?value.trim().slice(0,max):'';
const positiveNumber=(value:unknown,fallback:number)=>typeof value==='number'&&Number.isFinite(value)&&value>0?value:fallback;
const validDate=(value:unknown)=>typeof value==='string'&&!Number.isNaN(Date.parse(value));

const parseBanner=(value:unknown):PromoBanner|null=>{
 if(!value||typeof value!=='object')return null;
 const item=value as Record<string,unknown>;
 const desktopImageUrl=safeUrl(item.desktopImageUrl);const mobileImageUrl=safeUrl(item.mobileImageUrl);const destinationUrl=safeUrl(item.destinationUrl);
 const name=text(item.name,120);const alt=text(item.alt,220);
 if(!desktopImageUrl||!mobileImageUrl||!destinationUrl||!name||!alt)return null;
 return {id:text(item.id,80)||crypto.randomUUID(),desktopImageUrl,mobileImageUrl,name,alt,destinationUrl,order:typeof item.order==='number'?item.order:999,isActive:item.isActive===true,startDate:validDate(item.startDate)?item.startDate as string:undefined,endDate:validDate(item.endDate)?item.endDate as string:undefined,desktopWidth:positiveNumber(item.desktopWidth,1200),desktopHeight:positiveNumber(item.desktopHeight,286),mobileWidth:positiveNumber(item.mobileWidth,750),mobileHeight:positiveNumber(item.mobileHeight,500)};
};

const isPublishedNow=(banner:PromoBanner,now=Date.now())=>banner.isActive&&(!banner.startDate||Date.parse(banner.startDate)<=now)&&(!banner.endDate||Date.parse(banner.endDate)>now);

export async function fetchPublishedPromoBanners(signal?:AbortSignal):Promise<PromoBanner[]>{
 if(!apiBase||!promoBannerEndpoint)throw new Error('Promotional banner API is not configured.');
 const endpoint=promoBannerEndpoint.startsWith('/')?promoBannerEndpoint:`/${promoBannerEndpoint}`;
 const response=await fetch(`${apiBase}${endpoint}`,{signal,headers:{Accept:'application/json'},credentials:'omit'});
 if(!response.ok)throw new Error(`Promotional banner API returned ${response.status}.`);
 const payload=await response.json() as PromoBannerApiPayload;
 if(!payload||!Array.isArray(payload.banners))throw new Error('Promotional banner API response is invalid.');
 return payload.banners.map(parseBanner).filter((banner):banner is PromoBanner=>Boolean(banner)).filter(banner=>isPublishedNow(banner)).sort((a,b)=>a.order-b.order);
}
