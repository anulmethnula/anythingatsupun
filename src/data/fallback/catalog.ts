import type {Category,Product} from '../../types/commerce';
export const fallbackCategories:Category[]=[
 {id:1,name:'CAMY Products',slug:'camy',parentId:null,image:'/assets/category-camy-cookware.png',order:1,visible:true,description:'Practical cookware for everyday meals.'},
 {id:2,name:'WRIST WATCHES',slug:'watches',parentId:null,image:'/assets/category-watch-transparent.png',order:2,visible:true,description:'Timeless styles for every occasion.'},
 {id:3,name:'PERFUMES',slug:'perfumes',parentId:null,image:'/assets/category-perfume-transparent.png',order:3,visible:true,description:'Signature scents for every personality.'},
 {id:4,name:'ELECTRONICS',slug:'electronics',parentId:null,image:'/assets/category-tv-transparent.png',order:4,visible:true,description:'Smart technology for modern living.'},
 {id:5,name:'HOUSEHOLD',slug:'household',parentId:null,image:'/assets/category-household-transparent.png',order:5,visible:true,description:'Useful essentials for a comfortable home.'},
 {id:6,name:'KITCHENWARE',slug:'kitchenware',parentId:null,image:'/assets/category-kitchenware-transparent.png',order:6,visible:true,description:'Reliable tools for your kitchen.'},
 {id:7,name:'PERSONAL CARE',slug:'personal-care',parentId:null,image:'/assets/category-personal-care-transparent.png',order:7,visible:true,description:'Everyday grooming and care essentials.'},
 {id:8,name:'OUTDOORS',slug:'outdoors',parentId:null,image:'/assets/category-outdoors.png',order:8,visible:true,showWhenEmpty:true,description:'Useful gear for life outside.'},
 {id:9,name:'AIR CONDITIONERS',slug:'air-conditioners',parentId:null,image:'/assets/category-air-conditioner.png',order:9,visible:true,showWhenEmpty:true,description:'Cooling comfort for every room.'},
 {id:10,name:"Men's Watches",slug:'mens-watches',parentId:2,image:'/assets/subcategory-mens-watches.png',order:1,visible:true,description:'Classic and modern watches designed for men.'},
 {id:11,name:"Women's Watches",slug:'womens-watches',parentId:2,image:'/assets/subcategory-womens-watches.png',order:2,visible:true,showWhenEmpty:true,description:'Elegant watches designed for women.'},
 {id:12,name:'Smart Watches',slug:'smart-watches',parentId:2,image:'/assets/subcategory-smart-watches.png',order:3,visible:true,showWhenEmpty:true,description:'Connected watches for everyday activity and convenience.'}
];
const description='Genuine quality product backed by our trusted in-store service. Product appearance and included accessories may vary by model.';
export const fallbackProducts:Product[]=[
 {id:1,name:'Bamboo Leaf 21 Pieces Dinner Set',category:'kitchenware',brand:'Dankotuwa',price:33660,originalPrice:37400,image:'/assets/dinner-set.jpg',stock:true,rating:5,description},
 {id:2,name:'Beverly Hills Polo Club Pour Femme',category:'perfumes',brand:'Polo',price:6290,originalPrice:6990,image:'/assets/perfume.png',stock:true,rating:4,options:true,description},
 {id:3,name:'Beverly Hills Polo Club Deodorant Sports 185ml',category:'personal-care',brand:'Polo',price:1611,originalPrice:1790,image:'/assets/deodorant.png',stock:true,rating:5,description},
 {id:4,name:'Casio Classic Men’s Wrist Watch',category:'watches',subcategory:'mens-watches',brand:'Casio',price:24900,originalPrice:27900,image:'/assets/watch.png',stock:true,rating:5,description},
 {id:5,name:'Panasonic Microwave Oven 20L',category:'electronics',brand:'Panasonic',price:42900,originalPrice:46500,image:'/assets/microwave.png',stock:true,rating:4,description},
 {id:6,name:'Samsung QLED 4K Smart TV',category:'electronics',brand:'Samsung',price:289900,originalPrice:319900,image:'/assets/tv.jpg',stock:true,rating:5,options:true,description},
 {id:7,name:'CAMY 20cm Non-Stick Frying Pan',category:'camy',brand:'CAMY',price:1600,image:'/assets/kitchen.jpg',stock:true,rating:4,description},
 {id:8,name:'CAMY 22cm Casserole',category:'camy',brand:'CAMY',price:4290,image:'/assets/household.jpg',stock:true,rating:4,description},
 {id:9,name:'Premium Porcelain Serving Set',category:'household',brand:'Dankotuwa',price:14900,originalPrice:16500,image:'/assets/dinner-set.jpg',stock:true,rating:5,description},
 {id:10,name:'Designer Eau De Parfum 100ml',category:'perfumes',brand:'Afnan',price:11990,originalPrice:13900,image:'/assets/perfume.png',stock:false,rating:4,description},
 {id:11,name:'CAMY Family Cookware Set',category:'camy',brand:'CAMY',price:18900,originalPrice:21000,image:'/assets/kitchen.jpg',stock:true,rating:5,description},
 {id:12,name:'Digital Kitchen Scale',category:'household',brand:'Geepas',price:3950,image:'/assets/household.jpg',stock:true,rating:4,description}
];
