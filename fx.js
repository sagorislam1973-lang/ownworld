/* ===== হালকা অ্যানিমেশন ও ছোঁয়া =====
   • ট্যাব/প্যানেল বদলালে নরম ফুটে ওঠা  • স্ক্রলে কার্ড একটার পর একটা ভেসে ওঠা
   • বোতাম চাপলে ছোট চাপ-ভাব, মাউস নিলে হালকা ওঠা
   ফোনে “Reduce motion” চালু থাকলে কিছুই চলে না। শুধু CSS ও IntersectionObserver, কোনো লাইব্রেরি নেই। */
(function(){
 var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(reduce)return;
 var st=document.createElement("style");
 st.textContent="@keyframes fxtab{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}"+
  ".tab.on,.panel.on{animation:fxtab .34s ease}"+
  "button{transition:transform .15s ease,filter .2s ease,box-shadow .2s ease,background-color .2s ease}button:active{transform:scale(.96)}"+
  "nav button.on{animation:fxtab .3s ease}"+
  ".card{transition:box-shadow .25s ease}"+
  "@media (hover:hover){button:hover{filter:brightness(1.06)}.chip:hover{transform:translateY(-1px)}}"+
  "html.fx .card.fxh{opacity:0;transform:translateY(18px)}html.fx .card.fxh.fxi{opacity:1;transform:none;transition:opacity .55s ease,transform .55s cubic-bezier(.2,.8,.2,1)}";
 document.head.appendChild(st);
 if(!("IntersectionObserver" in window))return;
 var io=new IntersectionObserver(function(es){
  var n=0;es.forEach(function(e){if(!e.isIntersecting)return;
   var c=e.target;c.style.transitionDelay=Math.min(n++*70,280)+"ms";c.classList.add("fxi");io.unobserve(c);
   setTimeout(function(){c.style.transitionDelay="";c.classList.remove("fxh","fxi")},1100)})},{threshold:.05,rootMargin:"0px 0px -4% 0px"});
 document.documentElement.classList.add("fx");
 function scan(){[].forEach.call(document.querySelectorAll(".card:not(.fxs)"),function(c){c.classList.add("fxs","fxh");io.observe(c)})}
 /* নিরাপদ দিক: কোনো কারণে কার্ড লুকিয়ে থাকলে ৪ সেকেন্ড পরে জোর করে দেখানো (শুধু বর্তমান ট্যাবে) */
 function rescue(){setTimeout(function(){[].forEach.call(document.querySelectorAll(".card.fxh"),function(c){if(c.offsetParent!==null){var r=c.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0){c.classList.add("fxi");setTimeout(function(){c.classList.remove("fxh","fxi")},700)}}})},4000)}
 setTimeout(function(){scan();rescue()},900);
 [].forEach.call(document.querySelectorAll("nav button"),function(b){b.addEventListener("click",function(){setTimeout(function(){scan();rescue()},60)})});
})();
