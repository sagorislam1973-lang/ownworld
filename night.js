/* ===== শুভরাত্রি / একসাথে ঘুমাই মোড =====
   হোমে কার্ড, বোতাম চাপলে তারাভরা রাতের স্ক্রিন। দুজনের রাতের অবস্থা, ঐচ্ছিক টাইমার, রাতের ছোট মেসেজ।
   ডেটা: meta/night_{who} → { on, t, until|null, st:"awake"|"asleep", msgs:[{t,x}] (শেষ ২০টা) }
   অন্যজন চালু করলে অ্যাপে টোস্ট, আর বিদ্যমান ব্যবস্থায় (events → ntfy) পুশ নোটিফিকেশন। রাত শুরুতে আগের রাতের মেসেজ মুছে যায়। */
(function(){
 var mine=null,pt=null,ld={m:false,p:false},er="",open=false,dur=0,dim=false,ran=false;
 var st=document.createElement("style");
 st.textContent="#nightov{position:fixed;inset:0;z-index:27;display:none;flex-direction:column;background:linear-gradient(180deg,#070b25,#141a4a 60%,#2a1f55);color:#f3eaff;overflow:hidden}"+
  "#nightov .ns{position:absolute;border-radius:50%;background:#fff;animation:ntw 3s ease-in-out infinite}"+
  "@keyframes ntw{50%{opacity:.15}}"+
  "#nightov .nb{position:relative;flex:1;overflow-y:auto;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px 30px;max-width:480px;width:100%;margin:0 auto;transition:opacity .8s}"+
  "#nightov.dim .nb{opacity:.06}"+
  "#nightov .nm{font-size:4rem;text-align:center;line-height:1.2;margin-top:6px}"+
  "#nightov .card{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#f3eaff;box-shadow:none}"+
  "#nightov .hint{color:#cdbff0}#nightov input[type=text]{background:rgba(255,255,255,.1);color:#fff;border-color:rgba(255,255,255,.3)}"+
  "#nightov .chip{color:#f3eaff;border-color:rgba(255,255,255,.35)}#nightov .chip.on{background:#7c6cf0;border-color:#7c6cf0}"+
  "#nightov button.ghost{color:#f3eaff;border-color:rgba(255,255,255,.5)}"+
  "@media (prefers-reduced-motion:reduce){#nightov .ns{animation:none}}";
 document.head.appendChild(st);

 var hc=mk2('<div class="serif" style="font-size:1.2rem;margin-bottom:6px">🌙 শুভরাত্রি মোড</div><div id="nhs" class="hint" style="margin:0 0 10px"></div><button id="nhb">🌙 শুভরাত্রি বলো</button>');
 var ov=LV.el("div","");ov.id="nightov";
 for(var i=0;i<60;i++){var s=LV.el("span","ns");var z=Math.random()*2.5+1;s.style.cssText="left:"+Math.random()*100+"%;top:"+Math.random()*100+"%;width:"+z+"px;height:"+z+"px;animation-delay:"+(Math.random()*3)+"s";ov.appendChild(s)}
 var nb=LV.el("div","nb");nb.id="nbody";ov.appendChild(nb);document.body.appendChild(ov);
 ov.addEventListener("click",function(e){if(dim){dim=false;ov.classList.remove("dim");e.stopPropagation()}});

 function on(o){return !!(o&&o.on)}
 function stat(o,name){
  if(!o||!o.on)return name+": এখনো জেগে আছে বা বলেনি";
  return name+": "+(o.st==="asleep"?"😴 ঘুমিয়ে পড়েছে":"🌙 শুভরাত্রি বলেছে")+" ("+LV.ago(Date.now()-o.t)+")"}
 function homeStat(){
  var el=$("nhs");if(er){el.textContent="সমস্যা: "+er;return}
  el.textContent=stat(mine,"আমি")+" · "+stat(pt,LV.pn());
  $("nhb").textContent=on(mine)?"🌙 রাতের স্ক্রিন খোলো":"🌙 শুভরাত্রি বলো"}

 function render(){
  homeStat();
  if(!open)return;
  var b=$("nbody");b.innerHTML="";
  var x=LV.el("button","ghost","← ফিরে যাও");x.style.cssText="width:auto;padding:6px 14px";x.onclick=function(){open=false;ov.style.display="none"};b.appendChild(x);
  b.appendChild(LV.el("div","nm","🌙"));
  var h=LV.el("div","serif",on(mine)?"শুভরাত্রি, ঘুমিয়ে পড়ো 💤":"আজকের রাতটা কেমন?");h.style.cssText="text-align:center;font-size:1.4rem;margin:6px 0 12px";b.appendChild(h);
  var c=LV.el("div","card");c.appendChild(LV.el("div","",stat(mine,"আমি")));c.appendChild(LV.el("div","",stat(pt,LV.pn())));
  if(on(mine)&&on(pt))c.appendChild(LV.el("div","hint","দুজনেই শুভরাত্রি বলেছি, একসাথে ঘুমাই 💞")).style.marginTop="6px";
  if(on(mine)&&mine.until&&mine.st!=="asleep")c.appendChild(LV.el("div","hint","টাইমার: "+ft(mine.until)+" পর্যন্ত, তারপর অবস্থা “ঘুমিয়ে পড়েছে” হবে"));
  b.appendChild(c);
  if(!on(mine)){
   b.appendChild(LV.el("div","hint","ঘুমানোর টাইমার (ঐচ্ছিক): সময় শেষে স্ক্রিন অন্ধকার হয়ে যাবে ও তোমার অবস্থা “ঘুমিয়ে পড়েছে” হবে"));
   var ch=LV.el("div","chips");b.appendChild(ch);
   [[0,"টাইমার নেই"],[15,"১৫ মিনিট"],[30,"৩০ মিনিট"],[60,"১ ঘণ্টা"]].forEach(function(d){var k=LV.el("button","chip"+(dur===d[0]?" on":""),d[1]);k.onclick=function(){dur=d[0];render()};ch.appendChild(k)});
   var g=LV.el("button","","🌙 শুভরাত্রি বলি");g.onclick=start;b.appendChild(g)}
  else{
   var ms=[];(mine.msgs||[]).forEach(function(m){ms.push({by:"আমি",t:m.t,x:m.x})});((pt&&pt.msgs)||[]).forEach(function(m){ms.push({by:LV.pn(),t:m.t,x:m.x})});
   ms.sort(function(p,q){return p.t-q.t});
   if(ms.length){var mc=LV.el("div","card");ms.slice(-12).forEach(function(m){var r=LV.el("div","");r.style.margin="4px 0";r.appendChild(LV.el("b","",m.by+": "));r.appendChild(document.createTextNode(m.x));r.appendChild(LV.el("small","hint","  "+new Date(m.t).toLocaleTimeString("bn-BD",{hour:"numeric",minute:"2-digit"})));mc.appendChild(r)});b.appendChild(mc)}
   var inp=document.createElement("input");inp.type="text";inp.maxLength=120;inp.placeholder="রাতের একটা ছোট মেসেজ…";inp.setAttribute("aria-label","রাতের মেসেজ");b.appendChild(inp);
   var sb=LV.el("button","","পাঠাও 💌");sb.onclick=function(){sendMsg(inp.value)};inp.addEventListener("keydown",function(e){if(e.key==="Enter")sendMsg(inp.value)});b.appendChild(sb);
   var dm=LV.el("button","ghost","🌑 স্ক্রিন অন্ধকার করো");dm.style.marginTop="10px";dm.onclick=function(){dim=true;ov.classList.add("dim")};b.appendChild(dm);
   var mo=LV.el("button","ghost","☀️ সকাল হয়েছে, বন্ধ করো");mo.style.marginTop="10px";mo.onclick=stop;b.appendChild(mo)}
  if(er)b.appendChild(LV.el("p","hint","সমস্যা: "+er))}

 function start(){
  if(!DB||!WHO)return;var n=Date.now();
  DB.doc("meta/night_"+WHO).set({on:true,t:n,until:dur?n+dur*60000:null,st:"awake",msgs:[]}).then(function(){logEv("শুভরাত্রি বলেছে 🌙","home")}).catch(function(e){er=e.code;render()})}
 function stop(){
  if(!DB||!WHO)return;dim=false;ov.classList.remove("dim");
  DB.doc("meta/night_"+WHO).set({on:false,t:Date.now(),until:null,st:"awake",msgs:[]}).then(function(){open=false;ov.style.display="none"}).catch(function(e){er=e.code;render()})}
 function sendMsg(v){
  v=(v||"").trim();if(!v||!mine||!mine.on)return;
  var list=(mine.msgs||[]).slice(-19);list.push({t:Date.now(),x:v.slice(0,120)});
  DB.doc("meta/night_"+WHO).update({msgs:list}).catch(function(e){er=e.code;render()})}
 $("nhb").onclick=function(){open=true;ov.style.display="flex";render()};

 setInterval(function(){
  if(mine&&mine.on&&mine.until&&Date.now()>=mine.until&&mine.st!=="asleep"&&DB&&WHO){
   DB.doc("meta/night_"+WHO).update({st:"asleep"}).catch(function(){});dim=true;ov.classList.add("dim")}
  homeStat();if(open&&!dim)render()},30000);

 LV.onStart(function(){
  DB.doc("meta/night_"+WHO).onSnapshot(function(s){mine=s.exists?s.data():null;ld.m=true;er="";render()},function(e){er=e.code||"error";render()});
  DB.doc("meta/night_"+PW).onSnapshot(function(s){
   var was=pt;pt=s.exists?s.data():null;ld.p=true;
   if(on(pt)&&was!==null&&!on(was)&&Date.now()-pt.t<60000)toast("🌙 "+LV.pn()+" শুভরাত্রি বলেছে",function(){$("nhb").click()});
   render()},function(){})});
 render();
})();
