import type {ResourceState} from '../types/commerce';
export const loadingState=<T>(data:T):ResourceState<T>=>({status:'loading',data,error:null});
export const resolvedState=<T>(data:T,isEmpty:(value:T)=>boolean):ResourceState<T>=>({status:isEmpty(data)?'empty':'ready',data,error:null});
export const errorState=<T>(data:T,error:unknown):ResourceState<T>=>({status:'error',data,error:error instanceof Error?error.message:'Unable to load data.'});
