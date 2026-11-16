import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';

type PolicyPageLayoutProps={
 title:string;
 children:ReactNode;
 reviewNotice?:string;
};

export function PolicyPageLayout({title,children,reviewNotice}:PolicyPageLayoutProps){
 const pageClass=`policy-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')}`;
 return <div className={`policy-page ${pageClass}`}>
  <div className="policy-container">
   <nav className="policy-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span aria-hidden="true">/</span><span>{title}</span></nav>
   <header className="policy-header"><h1>{title}</h1></header>
   {reviewNotice&&<aside className="policy-review-notice" aria-label="Content review notice"><strong>Review notice</strong><p>{reviewNotice}</p></aside>}
   <article className="policy-content">{children}</article>
  </div>
 </div>;
}
