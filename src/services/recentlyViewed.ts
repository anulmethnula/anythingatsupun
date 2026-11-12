const storageKey='anything-at-supun:recently-viewed:v1';
const legacyStorageKey='anything-at-supun:recently-viewed';
const updateEvent='recently-viewed-updated';
const maximumItems=12;

export function getRecentlyViewedIds():number[]{
 try{
  const stored=localStorage.getItem(storageKey);const legacy=stored?null:localStorage.getItem(legacyStorageKey);const value=JSON.parse(stored||legacy||'[]');
  const ids=Array.isArray(value)?value.filter((id):id is number=>Number.isInteger(id)&&id>0).slice(0,maximumItems):[];
  if(!stored&&legacy&&ids.length){localStorage.setItem(storageKey,JSON.stringify(ids));localStorage.removeItem(legacyStorageKey)}
  return ids;
 }catch{return []}
}

export function trackRecentlyViewed(productId:number){
 if(!Number.isInteger(productId)||productId<=0)return;
 const ids=[productId,...getRecentlyViewedIds().filter(id=>id!==productId)].slice(0,maximumItems);
 try{localStorage.setItem(storageKey,JSON.stringify(ids));window.dispatchEvent(new Event(updateEvent))}catch{/* Storage can be unavailable in private browsing. */}
}

export const recentlyViewedUpdateEvent=updateEvent;
