export type ContactMessage={
 firstName:string;
 lastName:string;
 email:string;
 phone:string;
 subject:string;
 message:string;
 website?:string;
};

export type ContactResult={mode:'mailto';url:string};

export interface ContactService{
 prepare(message:ContactMessage):Promise<ContactResult>;
}

export const contactService:ContactService={
 async prepare(message){
  const subject=encodeURIComponent(message.subject);
  const body=encodeURIComponent(`Name: ${message.firstName} ${message.lastName}\nEmail: ${message.email}\nPhone: ${message.phone||'Not provided'}\n\n${message.message}`);
  return {mode:'mailto',url:`mailto:info@anythingatsupun.lk?subject=${subject}&body=${body}`};
 }
};
