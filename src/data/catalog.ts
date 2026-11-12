import {fallbackCategories,fallbackProducts} from './fallback/catalog';
import type {Category,CategoryNode} from '../types/commerce';
export type {Category,CategoryNode,Product} from '../types/commerce';
export const categoryRecords=fallbackCategories;
export const products=fallbackProducts;
export function buildCategoryTree(records:Category[]):CategoryNode[]{
 const visible=records.filter(item=>item.visible).sort((a,b)=>a.order-b.order);
 const nodes=new Map(visible.map(item=>[item.id,{...item,children:[]} as CategoryNode]));
 const roots:CategoryNode[]=[];
 nodes.forEach(node=>{if(node.parentId===null)roots.push(node);else nodes.get(node.parentId)?.children.push(node)});
 return roots;
}
export const categories=buildCategoryTree(categoryRecords);
export const categoryDescriptions=Object.fromEntries(categoryRecords.map(category=>[category.slug,category.description])) as Record<string,string>;
export const money=(value:number)=>`Rs. ${value.toLocaleString('en-LK',{minimumFractionDigits:2})}`;
