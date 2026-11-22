/* ===== Mood Light: 🟢 Green / 🟡 Yellow / 🔴 Red =====
   ঐচ্ছিক। কাউকে বাধ্য করা হয় না, যেকোনো সময় বদলানো বা সরানো যায়।
   ডেটা: meta/light_{sagor|shima} → { c: "g"|"y"|"r", t }
   কেউ Red হলে দুজনের স্ক্রিনেই লাভ কুপন, সারপ্রাইজ টাস্ক ও সত্যি-সাহস লুকানো থাকে।
   (এটা UI-স্তরের লুকানো, ডেটা মোছা হয় না। Red সরালেই সব ফিরে আসে।) */
(function(){
 var L={
  g:["🟢","Green","স্বাভাবিক ও আনন্দময় কথোপকথনের মুড"],
  y:["🟡","Yellow","শান্ত ও সাধারণ কথোপকথন পছন্দ"],
  r:["🔴","Red","আপাতত ব্যক্তিগত সময় বা বিরতি দরকার"]};
 var mine=null,pt=null,ld={m:false,p:false},er={m:"",p:""},ran=false;

 var st=document.createElement("style");
 st.textContent=".mlg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0 6px}"+
  ".mld{border:1.5px solid var(--line);border-radius:14px;padding:10px 12px;min-width:0}"+
  ".mld .e{font-size:1.9rem;line-height:1.2}"+
  ".mld b{display:block;font-weight:600;line-height:1.35}"+
  ".mld .hint{display:block;line-height:1.35;word-break:break-word}"+
  ".mld.r{border-color:#e0243f}.mld.y{border-color:#d9a400}.mld.g{border-color:#2ecc71}";
 document.head.appendChild(st);

 var card=document.createElement("div");card.className="card";card.id="ml";
 card.innerHTML='<div class="serif" style="font-size:1.15rem">MOOD LIGHT <span class="hint">· এখনকার আলো</span></div>'+
  '<div class="mlg"><div class="mld" id="mlp"></div><div class="mld" id="mlm"></div></div>'+
  '<div class="hint">আমার আলো বেছে নাও (বাধ্যতামূলক নয়, যেকোনো সময় বদলানো যাবে)</div>'+
  '<div class="chips" id="mlc"></div>'+
  '<button class="ghost" id="mlx">আলো সরিয়ে ফেলো</button><p class="note" id="mln"></p>';
 var anchor=$("qs")||document.querySelector("#home .hero");
 anchor.insertAdjacentElement("afterend",card);

 var nt=document.createElement("p");nt.className="hint";nt.id="mlN";nt.style.cssText="display:none;text-align:center";
 nt.textContent="🔴 লাল আলো জ্বলছে, তাই কুপন ও সারপ্রাইজ টাস্ক আপাতত লুকানো। বিরতি শেষ হলে নিজেরাই ফিরে আসবে।";
 document.querySelector("#love .sub").insertAdjacentElement("afterend",nt);

 function ago(ms){var m=Math.floor(ms/60000);if(m<1)return "এইমাত্র";if(m<60)return bn(m)+" মিনিট আগে";var h=Math.floor(m/60);if(h<24)return bn(h)+" ঘণ্টা আগে";return bn(Math.floor(h/24))+" দিন আগে"}
 function say(t){$("mln").textContent=t}

 function fill(box,title,o,loaded,err){
  box.innerHTML="";box.className="mld";
  function add(tag,cls,t){var d=document.createElement(tag);if(cls)d.className=cls;d.textContent=t;box.appendChild(d)}
  add("div","hint",title);
  if(err){add("div","hint","সমস্যা: "+err);return}
  if(!loaded){add("div","hint","লোড হচ্ছে…");return}
  var l=o&&L[o.c];
  if(!l){add("div","e","⚪");add("b","","কিছু বেছে নেয়নি");return}
  box.classList.add(o.c);
  add("div","e",l[0]);add("b","",l[1]);add("span","hint",l[2]);add("span","hint","আপডেট: "+ago(Date.now()-o.t))}

 /* Red হলে রোম্যান্টিক/ইন্টারঅ্যাক্টিভ অংশ লুকানো */
 function apply(){
  var red=!!((mine&&mine.c==="r")||(pt&&pt.c==="r"));
  var cps=$("cps"),nav=document.querySelector('nav button[data-t="td"]');
  [cps,cps&&cps.previousElementSibling,$("ccp"),$("sur"),$("surn"),$("td"),nav].forEach(function(e){if(e)e.style.display=red?"none":""});
  nt.style.display=red?"block":"none";
  if(red&&$("td").classList.contains("on")){var h=document.querySelector('nav button[data-t="home"]');if(h)h.click()}}

 function chipsRender(){
  var box=$("mlc");box.innerHTML="";
  ["g","y","r"].forEach(function(k){
   var b=document.createElement("button");b.className="chip"+(mine&&mine.c===k?" on":"");
   b.textContent=L[k][0]+" "+L[k][1];b.setAttribute("aria-label",L[k][1]+": "+L[k][2]);
   b.onclick=function(){setMood(k)};box.appendChild(b)})}

 function render(){
  var pn=(typeof PW!=="undefined"&&PW&&PN[PW])?PN[PW]:"ওর";
  fill($("mlp"),pn+"র আলো",pt,ld.p,er.p);
  fill($("mlm"),"আমার আলো",mine,ld.m,er.m);
  chipsRender();apply()}
 render();
 setInterval(function(){fill($("mlp"),(PW&&PN[PW]?PN[PW]:"ওর")+"র আলো",pt,ld.p,er.p);fill($("mlm"),"আমার আলো",mine,ld.m,er.m)},60000);

 function setMood(k){
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  if(mine&&mine.c===k)return;
  DB.doc("meta/light_"+WHO).set({c:k,t:Date.now()}).then(function(){say("");logEv("মুড লাইট বদলেছে "+L[k][0],"home")}).catch(function(e){say("সমস্যা: "+e.code)})}
 $("mlx").onclick=function(){
  if(!DB||!WHO)return;
  DB.doc("meta/light_"+WHO).delete().then(function(){say("আলো সরানো হয়েছে ✓")}).catch(function(e){say("সমস্যা: "+e.code)})};

 var _s=start;
 start=function(){
  var was=ran;ran=true;_s();if(was)return;
  DB.doc("meta/light_"+WHO).onSnapshot(function(s){mine=s.exists?s.data():null;ld.m=true;er.m="";render()},function(e){er.m=e.code;render()});
  DB.doc("meta/light_"+PW).onSnapshot(function(s){pt=s.exists?s.data():null;ld.p=true;er.p="";render()},function(e){er.p=e.code;render()})};
})();
