export type ProductId = number;
export type CategoryId = number;
export interface Product { id:ProductId; name:string; category:string; subcategory?:string; brand:string; price:number; originalPrice?:number; image:string; stock:boolean; rating:number; options?:boolean; description:string }
export interface Category { id:CategoryId; name:string; slug:string; parentId:CategoryId|null; image:string; productCount?:number; order:number; visible:boolean; showWhenEmpty?:boolean; description:string }
export type CategoryNode=Category&{children:CategoryNode[]};
export interface CartLine { product:Product; qty:number }
export interface PersistedCartLine { productId:ProductId; quantity:number }
export interface CheckoutAddress { firstName:string; lastName:string; email:string; phone:string; address1:string; city:string; province:string; postalCode:string; country:string }
export interface CheckoutDraft { billing:CheckoutAddress; shipping?:CheckoutAddress; notes?:string; paymentMethod:string; lines:PersistedCartLine[] }
export interface ProductReview { id:number; productId:ProductId; author:string; rating:number; content:string; createdAt:string; verified?:boolean }
export type ResourceStatus='idle'|'loading'|'ready'|'empty'|'error';
export interface ResourceState<T> { status:ResourceStatus; data:T; error:string|null }
