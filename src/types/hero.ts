export type HeroImage={
 url:string;
 alt:string;
 width:number;
 height:number;
};

export type HeroButton={
 text:string;
 link:string;
};

export type HeroSlide={
 id:string;
 eyebrow?:string;
 heading:string;
 highlightedHeading?:string;
 description:string;
 desktopImage:HeroImage;
 mobileImage:HeroImage;
 primaryButton:HeroButton;
 secondaryButton?:HeroButton;
 showPrimaryButton:boolean;
 showSecondaryButton:boolean;
 imagePresentation?:'product'|'banner'|'full-banner';
 order:number;
 isActive:boolean;
 status:'draft'|'scheduled'|'published';
 publishAt?:string;
 expiresAt?:string;
};

export type HeroApiPayload={slides:unknown[]};

export type HeroLoadState='fallback'|'loading'|'ready'|'error';
