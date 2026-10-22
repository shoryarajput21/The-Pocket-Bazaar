/* ===== STORE CONFIG – edit these ===== */
const CONFIG={
  upiId:"shauryarajput599@ptaxis", payeeName:"The Pocket Bazaar",
  price:60, deliveryCharge:0,            // set e.g. 40 to charge delivery
  whatsapp:"",                           // e.g. "919XXXXXXXXX" (digits only, with country code)
  email:"", phone:""                     // shown on Contact section
};
const CATS=["All","Wall Hangings","Diyas & Candles","Lights","Door Décor","Gift Boxes"];
const PRODUCTS=[
[1,"Pearl Jhumar Hanging Lights","Door Décor"],[2,"Gota Patti Diya Wall Hanging (Pair)","Wall Hangings"],
[3,"Lotus & Bell Wall Hanging Set","Wall Hangings"],[4,"Hand-Painted Lotus Diyas","Diyas & Candles"],
[5,"Pearl Tealight Holders (Set of 7)","Diyas & Candles"],[6,"Hand-Painted Pattachitra Table Lamp","Lights"],
[7,"Crochet Door Toran with Pearls","Door Décor"],[8,"Warm White LED String Light","Lights"],
[9,"Warm White LED String Light (Long)","Lights"],[10,"Cool White LED String Light","Lights"],
[11,"Lotus Pom-Pom Door Hangings","Door Décor"],[12,"Shubh Labh Wall Hangings (Pair)","Wall Hangings"],
[13,"Kite Design Wall Hanging","Wall Hangings"],[14,"Om Shree Tulsi-Style Diyas","Diyas & Candles"],
[15,"Glass Candle Gift Box","Gift Boxes"],[16,"Elephant Print Candle Gift Box","Gift Boxes"],
[17,"Ceramic Lotus Diyas","Diyas & Candles"]
].map(([n,name,category])=>({id:"P"+n,name,category,price:CONFIG.price,stock:20,
  img:`images/product-${n}.jpg`,desc:"Festive décor from The Pocket Bazaar."}));
// Edit stock above (stock:0 shows "Out of stock"). Names are editable here.

const $=s=>document.querySelector(s), inr=n=>"₹"+n;
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
let cart=store.get("tpb_cart",{});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}

/* ---- catalogue ---- */
$("#grid").innerHTML=Array(6).fill('<div class="skel"></div>').join("");
$("#cat").innerHTML=CATS.map(c=>`<option>${c}</option>`).join("");
function render(){
  const q=$("#search").value.trim().toLowerCase(),c=$("#cat").value;
  const list=PRODUCTS.filter(p=>(c==="All"||p.category===c)&&p.name.toLowerCase().includes(q));
  $("#empty").hidden=list.length>0;
  $("#grid").innerHTML=list.map(p=>{const out=p.stock<=0;return `<article class="pc">
   <img src="${p.img}" alt="${esc(p.name)}" loading="lazy">
   <div class="in"><h3>${esc(p.name)}</h3><div class="price">${inr(p.price)}</div>
   <div class="stock ${out?"out":""}">${out?"Out of stock":"In stock: "+p.stock}</div>
   <div class="btns"><button class="btn sm" ${out?"disabled":""} data-add="${p.id}">Add to Cart</button>
   <button class="btn sm ghost" ${out?"disabled":""} data-buy="${p.id}">Buy Now</button></div></div></article>`}).join("");
}
setTimeout(render,300);
$("#search").oninput=render;$("#cat").onchange=render;
$("#grid").onclick=e=>{const a=e.target.dataset.add,b=e.target.dataset.buy;if(a){add(a);toast("Added to cart")}if(b){add(b);openCheckout()}};

/* ---- cart ---- */
const prod=id=>PRODUCTS.find(p=>p.id===id);
function add(id){const p=prod(id);cart[id]=Math.min((cart[id]||0)+1,p.stock);saveCart()}
function saveCart(){store.set("tpb_cart",cart);drawCart()}
const subtotal=()=>Object.entries(cart).reduce((s,[id,q])=>s+prod(id).price*q,0);
function drawCart(){
  const ids=Object.keys(cart).filter(id=>prod(id));
  $("#cartCount").textContent=ids.reduce((s,i)=>s+cart[i],0);
  $("#cartItems").innerHTML=ids.length?ids.map(id=>{const p=prod(id);return `<div class="ci"><img src="${p.img}" alt=""><div class="t">${esc(p.name)}<br><b>${inr(p.price)}</b></div>
   <div class="q"><button data-d="${id}" aria-label="Decrease">−</button>${cart[id]}<button data-i="${id}" aria-label="Increase">+</button></div>
   <button data-r="${id}" aria-label="Remove" style="border:0;background:none;cursor:pointer">🗑</button></div>`}).join(""):'<p style="padding:20px;text-align:center">Your cart is empty.</p>';
  $("#subtotal").textContent=inr(subtotal());$("#checkoutBtn").disabled=!ids.length;
}
$("#cartItems").onclick=e=>{const d=e.target.dataset;
  if(d.i)cart[d.i]=Math.min(cart[d.i]+1,prod(d.i).stock);
  if(d.d){cart[d.d]--;if(cart[d.d]<=0)delete cart[d.d]}
  if(d.r)delete cart[d.r];saveCart()};
const drawer=$("#drawer");
$("#openCart").onclick=()=>drawer.classList.add("open");
$("#closeCart").onclick=$("#contBtn").onclick=()=>drawer.classList.remove("open");
$("#checkoutBtn").onclick=openCheckout;
drawCart();

/* ---- modal ---- */
const modal=$("#modal");
const showModal=h=>{$("#mbody").innerHTML=h;modal.hidden=false;modal.scrollTop=0};
$("#closeModal").onclick=()=>modal.hidden=true;

function summary(o){return `${o.items.map(i=>`<div class="row"><span>${esc(i.name)} × ${i.qty}</span><span>${inr(i.price*i.qty)}</span></div>`).join("")}
 <div class="row"><span>Product subtotal</span><span>${inr(o.subtotal)}</span></div>
 <div class="row"><span>Delivery charge</span><span>${inr(o.delivery)}</span></div>
 <div class="row"><span>Discount</span><span>${inr(0)}</span></div>
 <div class="row"><b>Final payable</b><b>${inr(o.total)}</b></div>`}

function openCheckout(){
  drawer.classList.remove("open");
  const items=Object.entries(cart).map(([id,q])=>({id,name:prod(id).name,price:prod(id).price,qty:q}));
  if(!items.length)return;
  const sub=subtotal(),o={items,subtotal:sub,delivery:CONFIG.deliveryCharge,total:sub+CONFIG.deliveryCharge};
  showModal(`<h3>Checkout</h3><p class="fastsm">FAST DELIVERY 🚚 Delivery within 3 days</p>${summary(o)}
  <form id="cf" novalidate><input name="name" placeholder="Full name" required>
  <input name="mobile" placeholder="Mobile number (10 digits)" inputmode="numeric" maxlength="10" required>
  <input name="street" placeholder="House no. / Street" required>
  <input name="city" placeholder="City" required><input name="state" placeholder="State" required>
  <input name="pin" placeholder="PIN code" inputmode="numeric" maxlength="6" required>
  <p class="err" id="ce"></p><button class="btn" style="width:100%">Place Order & Pay</button></form>`);
  $("#cf").onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));
    for(const k in f)f[k]=f[k].trim();
    const err=!f.name||f.name.length<2?"Enter your full name.":!/^[6-9]\d{9}$/.test(f.mobile)?"Enter a valid 10-digit Indian mobile number.":
      !f.street||!f.city||!f.state?"Please fill the complete address.":!/^[1-9]\d{5}$/.test(f.pin)?"Enter a valid 6-digit PIN code.":"";
    if(err){$("#ce").textContent=err;return}
    const orders=store.get("tpb_orders",[]);
    // reuse an unpaid identical order to avoid duplicates on refresh/double-click
    const sig=JSON.stringify([items,f.mobile]);
    let ord=orders.find(x=>x.status==="Awaiting Payment"&&x.sig===sig);
    if(!ord){ord={id:"TPB-"+Date.now().toString(36).toUpperCase().slice(-6)+Math.random().toString(36).slice(2,4).toUpperCase(),
      sig,customer:f,...o,status:"Awaiting Payment",created:new Date().toISOString()};orders.push(ord);store.set("tpb_orders",orders)}
    payStep(ord)};
}

function payStep(o){
  const note=encodeURIComponent(o.id),
  uri=`upi://pay?pa=${CONFIG.upiId}&pn=${encodeURIComponent(CONFIG.payeeName)}&am=${o.total.toFixed(2)}&cu=INR&tn=${note}&tr=${note}`;
  showModal(`<h3>SCAN & PAY</h3><p>Pay securely using your preferred supported UPI app.</p>
  <div class="row"><span>Order ID</span><b>${o.id}</b></div><div class="row"><span>Amount to pay</span><b>${inr(o.total)}</b></div>
  <div class="row"><span>UPI ID</span><b>${CONFIG.upiId}</b></div>
  <div class="qrbox" id="qr"></div>
  <button class="btn sm" id="copyUpi">Copy UPI ID</button> <a class="btn sm ghost" style="color:#8a4b00;border-color:#8a4b00" href="${uri}">Pay Now (opens UPI app)</a>
  <div class="warn">Pay the exact amount, then enter your UTR / transaction reference below. Payment completion depends on your UPI app. Your order is <b>not confirmed</b> until we verify the payment.</div>
  <form id="pf"><input name="utr" placeholder="UTR / UPI reference number (12 digits)" inputmode="numeric" maxlength="12" required>
  <label style="font-size:.8rem">Payment screenshot (JPG/PNG/WebP, max 2 MB)</label><input type="file" name="shot" accept="image/jpeg,image/png,image/webp">
  <p class="err" id="pe"></p><button class="btn" style="width:100%">Submit Payment Details</button></form>`);
  if(window.QRCode)new QRCode($("#qr"),{text:uri,width:200,height:200,correctLevel:QRCode.CorrectLevel.M});
  else $("#qr").innerHTML='<p>QR library could not load (check internet). Use the Pay Now button.</p>';
  $("#copyUpi").onclick=()=>{navigator.clipboard?.writeText(CONFIG.upiId).then(()=>toast("UPI ID copied"),()=>toast(CONFIG.upiId))};
  $("#pf").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),utr=fd.get("utr").trim(),file=fd.get("shot");
    if(!/^\d{12}$/.test(utr)){$("#pe").textContent="UTR must be exactly 12 digits.";return}
    if(file&&file.size){if(!["image/jpeg","image/png","image/webp"].includes(file.type)){$("#pe").textContent="Screenshot must be JPG, PNG or WebP.";return}
      if(file.size>2*1024*1024){$("#pe").textContent="Screenshot must be under 2 MB.";return}}
    const orders=store.get("tpb_orders",[]),x=orders.find(i=>i.id===o.id);
    x.utr=utr;x.screenshotName=file&&file.size?file.name:"";x.status="Payment Submitted";x.paySubmitted=new Date().toISOString();
    store.set("tpb_orders",orders);cart={};saveCart();thanks(x)};
}

function thanks(o){
  const msg=encodeURIComponent(`Hello The Pocket Bazaar, I paid for order ${o.id}. Amount: ₹${o.total}. UTR: ${o.utr}. Name: ${o.customer.name}, Mobile: ${o.customer.mobile}. (Screenshot attached)`);
  showModal(`<div class="ok"><div class="ic">📩</div><h3>Thank You for Shopping with The Pocket Bazaar!</h3>
  <p>Your order has been submitted successfully.</p><p><b>Order ID: ${o.id}</b></p>
  <p>Payment Status: <b>Awaiting Verification</b></p><p>We will confirm your order after verifying your payment.</p>
  <p class="fastsm">Fast Delivery — Within 3 Days.</p></div>${summary(o)}
  ${CONFIG.whatsapp?`<a class="btn" style="width:100%;text-align:center;margin-top:10px" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.whatsapp}?text=${msg}">Send payment proof on WhatsApp</a>`:'<div class="warn">Seller: set <code>CONFIG.whatsapp</code> in app.js so customers can send the screenshot to you.</div>'}`);
}

/* ---- tracking ---- */
const FLOW=["Order received","Payment verification","Order confirmed","Processing","Shipped","Delivered"];
const STEP={"Awaiting Payment":0,"Payment Submitted":1,"Payment Under Verification":1,"Payment Verified":2,"Order Confirmed":2,"Processing":3,"Shipped":4,"Delivered":5};
$("#trackForm").onsubmit=e=>{e.preventDefault();
  const id=$("#tId").value.trim().toUpperCase(),m=$("#tMob").value.trim();
  const o=store.get("tpb_orders",[]).find(x=>x.id===id&&x.customer.mobile===m),out=$("#trackOut");
  if(!o){out.innerHTML='<p class="err">No order found for that Order ID and mobile number on this device.</p>';return}
  if(o.status==="Payment Rejected"){out.innerHTML="<p><b>Payment Rejected.</b> Please contact support.</p>";return}
  const s=STEP[o.status]??0;
  out.innerHTML=`<p>Status: <b>${o.status}</b></p><div class="steps">${FLOW.map((f,i)=>`<span class="${i<=s?"on":""}">${f}</span>`).join("")}</div>`;
};

$("#cEmail").textContent=CONFIG.email||"[add your email]";$("#cPhone").textContent=CONFIG.phone||"[add your phone]";
$("#yr").textContent=new Date().getFullYear();
