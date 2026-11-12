export type PromoBanner={
 id:string;
 desktopImageUrl:string;
 mobileImageUrl:string;
 name:string;
 alt:string;
 destinationUrl:string;
 order:number;
 isActive:boolean;
 startDate?:string;
 endDate?:string;
 desktopWidth:number;
 desktopHeight:number;
 mobileWidth:number;
 mobileHeight:number;
};

export type PromoBannerApiPayload={banners:unknown[]};
export type PromoBannerLoadState='fallback'|'loading'|'ready'|'error';
