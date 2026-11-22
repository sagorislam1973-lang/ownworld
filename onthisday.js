/* ===== এই দিনে (On This Day) =====
   আজকের তারিখের (মাস-দিন) আগের বছরগুলোর স্মৃতি হোমে দেখায়: অ্যালবামের ছবি, ডায়েরির লেখা, টাইমলাইন, বর্ষপূর্তি ও স্পেশাল তারিখ।
   Read খরচ: দিনে একবার (অ্যালবামে ১টা কুয়েরি সর্বোচ্চ ৪টা ছবি, ডায়েরির প্রতি বছরের মাসের জন্য ১টা)। ডায়েরির ফল আজকের দিনের জন্য ফোনে ক্যাশ হয়।
   কিছু না থাকলে ছোট একটা বার্তা দেখায়। */
(function(){
 var now=new Date(),MD=pad(now.getMonth()+1)+"-"+pad(now.getDate()),Y=now.getFullYear(),MM=pad(now.getMonth()+1);
 var card=LV.el("div","card");card.id="otd";
 card.innerHTML='<div class="serif" style="font-size:1.2rem;margin-bottom:6px">📅 এই দিনে, আগের বছরগুলোতে</div><div id="otdb"><p class="hint">খোঁজা হচ্ছে…</p></div>';
 var a=$("sp")||$("ml")||$("qs")||document.querySelector("#home .hero");a.insertAdjacentElement("afterend",card);
 var out={tl:[],dy:[],ph:[],sp:[]},done={dy:false,ph:false,sp:false},started=false;
 function yrs(y){var n=Y-y;return n===1?"১ বছর আগে":bn(n)+" বছর আগে"}
 function render(){
  var b=$("otdb");b.innerHTML="";var any=false;
  function head(t){b.appendChild(LV.el("div","hint",t)).style.cssText="margin:8px 0 2px;font-weight:600"}
  if(out.sp.length){any=true;out.sp.forEach(function(x){b.appendChild(LV.el("div","",x))})}
  if(out.tl.length){any=true;head("🕰️ টাইমলাইন");out.tl.forEach(function(x){b.appendChild(LV.el("div","",yrs(+x.d.slice(0,4))+": "+x.t))})}
  if(out.dy.length){any=true;head("📖 ডায়েরি");out.dy.forEach(function(x){var d=LV.el("div","");d.style.margin="4px 0";d.appendChild(LV.el("small","hint",yrs(x.y)+" · "+(x.by===WHO?"আমি":LV.pn())+": "));d.appendChild(document.createTextNode(x.x.length>160?x.x.slice(0,160)+"…":x.x));b.appendChild(d)})}
  if(out.ph.length){any=true;head("🖼️ ছবি");var r=LV.el("div","");r.style.cssText="display:grid;grid-template-columns:repeat(2,1fr);gap:8px";
   out.ph.forEach(function(x){var c=LV.el("div");var i=document.createElement("img");i.src=x.img;i.alt=x.cap||"স্মৃতির ছবি";i.style.cssText="width:100%;border-radius:12px;display:block";c.appendChild(i);c.appendChild(LV.el("div","hint",yrs(+x.date.slice(0,4))+(x.cap?" · "+x.cap:"")));r.appendChild(c)});b.appendChild(r)}
  if(!any){
   if(!(done.dy&&done.ph&&done.sp))b.appendChild(LV.el("p","hint","খোঁজা হচ্ছে…"));
   else b.appendChild(LV.el("p","hint","এই দিনের আগের বছরের কোনো স্মৃতি নেই। আজকের দিনটা নতুন স্মৃতি হয়ে থাকুক 💞"))}}
 function local(){
  try{(JSON.parse(localStorage.getItem("tl"))||[]).forEach(function(x){if(x.d&&x.d.slice(5)===MD&&+x.d.slice(0,4)<Y)out.tl.push(x)})}catch(e){}
  out.tl.sort(function(p,q){return q.d<p.d?-1:1})}
 LV.onStart(function(){
  if(started)return;started=true;local();render();
  var ck="otd-"+LV.day(),cached=null;try{cached=JSON.parse(localStorage.getItem(ck))}catch(e){}
  /* অ্যালবাম */
  DB.collection("album").where("md","==",MD).limit(8).get().then(function(qs){
   var a=[];qs.forEach(function(d){var x=d.data();if(+x.date.slice(0,4)<Y)a.push(x)});a.sort(function(p,q){return q.date<p.date?-1:1});out.ph=a.slice(0,4);done.ph=true;render()
  }).catch(function(){done.ph=true;render()});
  /* বর্ষপূর্তি ও স্পেশাল তারিখ */
  DB.doc("meta/special").get().then(function(s){
   var d=s.data()||{},ann=d.annv||"2022-06-24";
   if(ann.slice(5)===MD&&+ann.slice(0,4)<Y)out.sp.push("💞 "+bn(Y-+ann.slice(0,4))+" বছর আগে আজকের দিনে আমরা শুরু করেছিলাম");
   (d.custom||[]).forEach(function(c){if(c.d.slice(5)===MD&&+c.d.slice(0,4)<Y)out.sp.push("⭐ "+yrs(+c.d.slice(0,4))+": "+c.t)});
   done.sp=true;render()}).catch(function(){done.sp=true;render()});
  /* ডায়েরি: আগের প্রতি বছরের একই মাসের ডকুমেন্ট */
  if(cached){out.dy=cached;done.dy=true;render();return}
  DB.doc("meta/diary_idx").get().then(function(s){
   var ms=((s.data()||{}).months||[]).filter(function(k){return k.slice(5)===MM&&+k.slice(0,4)<Y});
   return Promise.all(ms.map(function(k){return DB.doc("meta/diary_"+k).get().then(function(d){
    var e=(d.data()||{}).e||{},r=[];
    Object.keys(e).forEach(function(id){var x=e[id];if(LV.day(new Date(x.t)).slice(5)===MD)r.push({y:+k.slice(0,4),by:x.by,x:x.x,t:x.t})});return r})}))
  }).then(function(all){
   var f=[].concat.apply([],all).sort(function(p,q){return q.t-p.t}).slice(0,4);out.dy=f;done.dy=true;
   try{localStorage.setItem(ck,JSON.stringify(f))}catch(e){}render()
  }).catch(function(){done.dy=true;render()})});
})();
