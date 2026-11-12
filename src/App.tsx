import {useEffect,useRef} from 'react';
import {BrowserRouter,Route,Routes,useLocation} from 'react-router-dom';
import {Layout} from './components/Layout';
import {StoreProvider} from './context/StoreContext';
import {Home} from './pages/Home';
import {Catalog} from './pages/Catalog';
import {ProductPage} from './pages/Product';
import {Cart,Wishlist} from './pages/Commerce';
import {CheckoutPage} from './pages/CheckoutPage';
import {Account,Policy,Register} from './pages/Static';
import {AboutUs,ContactUs} from './pages/AboutContact';
import {PrivacyPolicy,ReturnsPolicy,TermsAndConditions,WarrantyClaims} from './pages/Policies';
import {products} from './data/catalog';
import {trackRecentlyViewed} from './services/recentlyViewed';
import {ScrollToTopButton} from './components/ScrollToTopButton';

function ScrollToTop(){const {pathname,search}=useLocation();const previous=useRef({pathname,search});useEffect(()=>{const last=previous.current;const sameCategoryPage=last.pathname===pathname&&pathname.startsWith('/category/');const previousSubcategory=new URLSearchParams(last.search).get('subcategory');const nextSubcategory=new URLSearchParams(search).get('subcategory');const switchingSubcategory=sameCategoryPage&&previousSubcategory!==nextSubcategory;if(!switchingSubcategory)window.scrollTo({top:0,left:0,behavior:'auto'});previous.current={pathname,search}},[pathname,search]);return null}
function RecentlyViewedTracker(){const {pathname}=useLocation();useEffect(()=>{const match=pathname.match(/^\/product\/(\d+)\/?$/);if(!match)return;const id=Number(match[1]);if(products.some(product=>product.id===id))trackRecentlyViewed(id)},[pathname]);return null}

export default function App(){return <BrowserRouter><ScrollToTop/><RecentlyViewedTracker/><StoreProvider><Layout><Routes>
 <Route path="/" element={<Home/>}/><Route path="/shop" element={<Catalog/>}/><Route path="/category/:slug" element={<Catalog/>}/><Route path="/search" element={<Catalog search/>}/><Route path="/product/:id" element={<ProductPage/>}/><Route path="/wishlist" element={<Wishlist/>}/><Route path="/cart" element={<Cart/>}/><Route path="/checkout" element={<CheckoutPage/>}/><Route path="/account" element={<Account/>}/><Route path="/register" element={<Register/>}/>
 <Route path="/about-us" element={<AboutUs/>}/><Route path="/contact-us" element={<ContactUs/>}/><Route path="/about" element={<AboutUs/>}/><Route path="/contact" element={<ContactUs/>}/>
 <Route path="/privacy-policy" element={<PrivacyPolicy/>}/><Route path="/returns-policy" element={<ReturnsPolicy/>}/><Route path="/warranty-claims" element={<WarrantyClaims/>}/><Route path="/terms-and-conditions" element={<TermsAndConditions/>}/>
 <Route path="/policy/:type" element={<Policy/>}/><Route path="*" element={<Home/>}/>
</Routes></Layout><ScrollToTopButton/></StoreProvider></BrowserRouter>}
