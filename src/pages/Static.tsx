import {useState,type FormEvent} from 'react';
import {ArrowRight,Eye,EyeOff,Heart,LockKeyhole,Mail,MapPin,Package,Phone,UserPlus,UserRound,Zap} from 'lucide-react';
import {Link,useParams} from 'react-router-dom';
import {AccountDashboard} from '../components/account/AccountDashboard';
import {getCurrentAccountSession,logoutAccount,type AccountSession} from '../services/accountService';

const dashboardPreviewSession:AccountSession={customer:{id:0,name:'Dashboard Preview',email:'Development preview mode'},orders:[
 {id:9001,number:'DEMO-9001',date:'8 November 2026',status:'Completed',total:'Rs. 31,190.00',viewUrl:'#order-9001',items:[{productId:4,name:'Casio Classic Men’s Wrist Watch',image:'/assets/watch.png',quantity:1,total:'Rs. 24,900.00'},{productId:2,name:'Beverly Hills Polo Club Pour Femme',image:'/assets/perfume.png',quantity:1,total:'Rs. 6,290.00'}]},
 {id:9002,number:'DEMO-9002',date:'24 October 2026',status:'Processing',total:'Rs. 4,290.00',viewUrl:'#order-9002',items:[{productId:8,name:'CAMY 22cm Casserole',image:'/assets/household.jpg',quantity:1,total:'Rs. 4,290.00'}]},
 {id:9003,number:'DEMO-9003',date:'2 September 2026',status:'Delivered',total:'Rs. 33,660.00',viewUrl:'#order-9003',items:[{productId:1,name:'Bamboo Leaf 21 Pieces Dinner Set',image:'/assets/dinner-set.jpg',quantity:1,total:'Rs. 33,660.00'}]}
],addresses:[],downloads:[],logoutUrl:'/account'};

function AccountLogin(){
 const [showPassword,setShowPassword]=useState(false);
 const [remember,setRemember]=useState(false);
 const [message,setMessage]=useState('');
 const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();setMessage('Backend login is not connected in this frontend prototype. Your credentials were not sent or stored.')};
 return <main className="login-page"><div className="login-shell">
  <section className="login-welcome" aria-labelledby="welcome-title"><div className="login-welcome-copy"><span className="login-accent"/><h1 id="welcome-title">Welcome Back!<br/>Login to <em>Your Account</em></h1><p>Access your orders, favourites and enjoy a better shopping experience at Anything at Supun.</p><ul className="login-benefits"><li><span><Package/></span>Track Your Orders</li><li><span><Heart/></span>Save Your Favourites</li><li><span><Zap/></span>Faster &amp; Easier Checkout</li></ul></div><img className="login-shopping-art" src="/assets/login-shopping-bags-logo.png" alt="" aria-hidden="true" width="640" height="480"/></section>
  <section className="login-form-wrap" aria-label="Account login"><form className="login-card" onSubmit={submit}>
   <header className="login-card-head"><span><UserRound/></span><div><h2>Login</h2><p>Access your account</p></div></header>
   <label className="login-field">Email address<div className="login-input"><Mail/><input name="email" type="email" autoComplete="email" placeholder="Enter your email address" required/></div></label>
   <label className="login-field">Password<div className="login-input"><LockKeyhole/><input name="password" type={showPassword?'text':'password'} autoComplete="current-password" placeholder="Enter your password" minLength={6} required/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff/>:<Eye/>}</button></div></label>
   <div className="login-options"><label className="login-check"><input type="checkbox" checked={remember} onChange={event=>setRemember(event.target.checked)}/>Remember me</label><Link to="/contact-us">Lost your password?</Link></div>
   {message&&<div className="login-status" role="alert">{message}</div>}
   <button className="login-submit" type="submit"><span>Log In</span><ArrowRight/></button><p className="login-register">Don&apos;t have an account? <Link to="/register">Sign Up</Link></p>
  </form></section>
 </div></main>
}

export function Account(){
 const [session]=useState(getCurrentAccountSession);
 const preview=import.meta.env.DEV&&new URLSearchParams(window.location.search).get('preview')==='dashboard';
 if(!session&&!preview)return <AccountLogin/>;
 const accountSession=session||dashboardPreviewSession;
 return <AccountDashboard session={accountSession} onLogout={async()=>{if(preview){window.location.assign('/account');return}await logoutAccount(accountSession);window.location.assign('/account')}}/>;
}

export function Register(){
 const [showPassword,setShowPassword]=useState(false);const [showConfirm,setShowConfirm]=useState(false);const [password,setPassword]=useState('');const [confirmPassword,setConfirmPassword]=useState('');const [message,setMessage]=useState('');const mismatch=confirmPassword.length>0&&password!==confirmPassword;
 const submit=(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();if(password!==confirmPassword){setMessage('Passwords do not match. Please enter the same password in both fields.');return}setMessage('Backend registration is not connected in this frontend prototype. No account was created and your details were not sent or stored.')};
 return <main className="login-page register-page"><div className="login-shell">
  <section className="login-welcome" aria-labelledby="register-welcome-title"><div className="login-welcome-copy"><span className="login-accent"/><h1 id="register-welcome-title">Create Your <em>Account</em></h1><p>Join Anything at Supun and enjoy a better shopping experience.</p><ul className="login-benefits"><li><span><Package/></span>Track Your Orders</li><li><span><Heart/></span>Save Your Favourites</li><li><span><Zap/></span>Faster &amp; Easier Checkout</li></ul></div><img className="login-shopping-art" src="/assets/login-shopping-bags-logo.png" alt="" aria-hidden="true" width="640" height="480"/></section>
  <section className="login-form-wrap" aria-label="Account registration"><form className="login-card register-card" onSubmit={submit}>
   <header className="login-card-head"><span><UserPlus/></span><div><h2>Sign Up</h2><p>Create a new account</p></div></header>
   <label className="login-field">Full Name<div className="login-input"><UserRound/><input name="name" type="text" autoComplete="name" placeholder="Enter your full name" required/></div></label>
   <label className="login-field">Email Address<div className="login-input"><Mail/><input name="email" type="email" autoComplete="email" placeholder="Enter your email address" required/></div></label>
   <label className="login-field">Password<div className="login-input"><LockKeyhole/><input name="password" type={showPassword?'text':'password'} autoComplete="new-password" placeholder="Create a password" value={password} onChange={event=>{setPassword(event.target.value);setMessage('')}} minLength={8} aria-describedby="password-guidance" required/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff/>:<Eye/>}</button></div><small id="password-guidance" className="field-guidance">Use at least 8 characters for this prototype.</small></label>
   <label className="login-field">Confirm Password<div className={`login-input ${mismatch?'is-invalid':''}`}><LockKeyhole/><input name="confirmPassword" type={showConfirm?'text':'password'} autoComplete="new-password" placeholder="Confirm your password" value={confirmPassword} onChange={event=>{setConfirmPassword(event.target.value);setMessage('')}} minLength={8} aria-invalid={mismatch} required/><button type="button" onClick={()=>setShowConfirm(value=>!value)} aria-label={showConfirm?'Hide confirmed password':'Show confirmed password'}>{showConfirm?<EyeOff/>:<Eye/>}</button></div>{mismatch&&<small className="field-error">Passwords do not match.</small>}</label>
   {message&&<div className="login-status" role="alert">{message}</div>}
   <button className="login-submit" type="submit"><span>Create Account</span><ArrowRight/></button><p className="login-register">Already have an account? <Link to="/account">Log In</Link></p>
  </form></section>
 </div></main>
}

export function About(){return <div className="container page content-page"><span className="eyebrow">ABOUT ANYTHING AT SUPUN</span><h1>Making everyday shopping simpler.</h1><p>Anything at Supun brings together dependable home, lifestyle, personal care and electronic products for customers across Sri Lanka. Our familiar shopping experience is backed by a team that values clear information, fair pricing and helpful service.</p><div className="values"><div><b>Trusted selection</b><span>Carefully sourced products from recognised brands.</span></div><div><b>Local service</b><span>Friendly support from our Colombo-based team.</span></div><div><b>Convenient shopping</b><span>Browse online and arrange islandwide delivery.</span></div></div></div>}
export function Contact(){return <div className="container page"><div className="contact-grid"><div><span className="eyebrow">CONTACT US</span><h1>How can we help?</h1><p>Questions about a product or an order? Reach our team using the details below.</p><p><MapPin/>16, R. A. De Mel Mawatha,<br/>Colombo 04, Sri Lanka</p><p><Phone/>+94 11 255 2555</p><p><Mail/>info@anythingatsupun.lk</p></div><form onSubmit={event=>event.preventDefault()}><label>Your name<input/></label><label>Email address<input type="email"/></label><label>Phone number<input/></label><label>Message<textarea rows={5}/></label><button className="primary">SEND MESSAGE</button></form></div></div>}
const text:Record<string,[string,string]>={privacy:['Privacy Policy','This prototype does not collect or transmit personal data. A production WooCommerce integration should publish the company’s approved privacy notice, cookie details and data-retention terms.'],returns:['Returns Policy','Returns are subject to the condition of the item, proof of purchase and the applicable product category. Contact the store before returning an item.'],warranty:['Warranty Claims','Warranty coverage varies by product and manufacturer. Retain your invoice and contact our team with the product model and purchase details.'],terms:['Terms & Conditions','Prices, availability and promotional information shown in this frontend prototype are demonstration content and are not binding offers.']};
export function Policy(){const {type='terms'}=useParams();const [title,body]=text[type]||text.terms;return <div className="container page content-page"><div className="breadcrumb">Home / {title}</div><h1>{title}</h1><p>{body}</p><h2>Need assistance?</h2><p>Please contact our team before making a purchase if you need clarification about delivery, returns or warranty coverage.</p></div>}
