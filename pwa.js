/* ===== PWA: Service Worker নিবন্ধন, ইনস্টল প্রম্পট, অফলাইন ব্যানার =====
   অফলাইন: অ্যাপের ফাইল Service Worker ক্যাশে থাকে (একবার ইন্টারনেটে খোলার পর)।
   ডেটা: app.js-এ Firestore-এর অফলাইন ক্যাশ চালু আছে, তাই আগে দেখা লেখা/তথ্য ইন্টারনেট ছাড়াও দেখা যায়,
   আর অফলাইনে করা পরিবর্তন ইন্টারনেট ফিরলে নিজে থেকে সিঙ্ক হয়।
   সীমা: লগইন, লাইভ লোকেশন, ম্যাপ, YouTube, নতুন ছবি দেখা ইন্টারনেট ছাড়া চলবে না। */
(function(){
 if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){
  window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}

 var deferred=null;
 window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferred=e;upd()});
 window.addEventListener("appinstalled",function(){deferred=null;upd()});
 var standalone=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true;
 var body=null;
 function upd(){
  if(!body)return;body.innerHTML="";
  if(standalone){body.appendChild(LV.el("p","","✅ অ্যাপ হিসেবে ইনস্টল করা আছে।"))}
  else if(deferred){
   body.appendChild(LV.el("p","hint","হোম স্ক্রিনে অ্যাপের মতো যোগ করো, আলাদা আইকন ও ফুল স্ক্রিনে খুলবে।"));
   var b=LV.el("button","","📲 অ্যাপ ইনস্টল করো");b.onclick=function(){deferred.prompt();deferred.userChoice.finally(function(){deferred=null;upd()})};body.appendChild(b)}
  else{
   body.appendChild(LV.el("p","hint","Android Chrome: ওপরের ⋮ মেনু → “Install app” বা “Add to Home screen”।"));
   body.appendChild(LV.el("p","hint","iPhone Safari: নিচের Share বোতাম → “Add to Home Screen”।"));
   body.appendChild(LV.el("p","hint","(ব্রাউজার ইনস্টল প্রস্তাব দিলে এখানে বোতাম আসবে। সাইট HTTPS-এ থাকতে হবে।)"))}
  body.appendChild(LV.el("p","hint","📴 অফলাইনে: একবার ইন্টারনেটে খোলার পর অ্যাপ ইন্টারনেট ছাড়াও খোলে এবং আগে দেখা তথ্য দেখায়। অফলাইনে লেখা পরিবর্তন ইন্টারনেট ফিরলে নিজে সিঙ্ক হয়। লগইন, লাইভ লোকেশন, ম্যাপ ও YouTube ইন্টারনেট ছাড়া চলবে না।"))}
 LV.section("📲 অ্যাপ ইনস্টল ও অফলাইন",function(c){body=LV.el("div");c.appendChild(body);upd()});

 var bar=LV.el("div","","📴 ইন্টারনেট নেই। আগে দেখা তথ্য দেখাচ্ছে, ইন্টারনেট এলে নিজে সিঙ্ক হবে।");
 bar.setAttribute("role","status");
 bar.style.cssText="position:fixed;left:10px;right:10px;bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:7;background:var(--ink);color:var(--bg);border-radius:12px;padding:8px 12px;font-size:.88rem;text-align:center;display:none";
 document.body.appendChild(bar);
 function net(){bar.style.display=navigator.onLine===false?"block":"none"}
 window.addEventListener("online",net);window.addEventListener("offline",net);net();
})();
