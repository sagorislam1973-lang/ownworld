/* ===== Anniversary Counter, স্পেশাল ডেটস ও শেষ ৭ দিনের কার্ড =====
   ডেটা:
   meta/special  → { annv:"2022-06-24", bd:{sagor:"YYYY-MM-DD", shima:"..."}, custom:[{id,t,d,y}] }
   meta/nextmsg  → { m:"শেষ দিনের মেসেজ" }
   বিদ্যমান meta/next (পরের দেখার তারিখ) অপরিবর্তিত, শুধু পড়া হয়।
   কার্ড আনলক তারিখ থেকে হিসাব হয়, তাই আলাদা কিছু সংরক্ষণ করা লাগে না। */
(function(){
 var DEF_ANN="2022-06-24";
 var sp=null,spErr="",msgT="",ran=false,remDone=false,lastNext=undefined,lastR=0;

 var st=document.createElement("style");
 st.textContent=".spbig{font-family:'Tiro Bangla',Georgia,serif;font-size:2rem;color:var(--rose);line-height:1.25}"+
  ".spr{border-top:1px solid var(--line);padding:8px 0;font-size:.97rem}"+
  ".spr.soon{color:var(--rose);font-weight:600}"+
  ".mcc{border:1.5px solid var(--line);border-radius:14px;padding:10px 12px;margin:0 0 8px}"+
  ".mcc.lk{opacity:.6;border-style:dashed}"+
  ".mcc.fin{border-color:var(--gold)}"+
  "input[type=checkbox]{width:20px;height:20px;vertical-align:middle;margin-right:6px}";
 document.head.appendChild(st);

 function el(tag,cls,t){var d=document.createElement(tag);if(cls)d.className=cls;if(t!=null)d.textContent=t;return d}
 function today(){var n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())}
 function pd(s){var a=s.split("-");return new Date(+a[0],+a[1]-1,+a[2])}
 function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
 function diff(a,b){return Math.round((a-b)/864e5)}
 function nextOcc(s,t){var d=pd(s),n=new Date(t.getFullYear(),d.getMonth(),d.getDate());if(n<t)n=new Date(t.getFullYear()+1,d.getMonth(),d.getDate());return n}
 function ymd(a,b){
  var y=b.getFullYear()-a.getFullYear(),m=b.getMonth()-a.getMonth(),d=b.getDate()-a.getDate();
  if(d<0){m--;d+=new Date(b.getFullYear(),b.getMonth(),0).getDate()}
  if(m<0){y--;m+=12}
  return [y,m,d]}
 function dl(d){return d===0?"আজই":bn(d)+" দিন বাকি"}

 /* ---------- কার্ড ১: আমাদের পথচলা ---------- */
 var sc=el("div","card");sc.id="sp";
 sc.innerHTML='<div class="serif" style="font-size:1.15rem;margin-bottom:6px">💞 আমাদের পথচলা</div><div id="spb"></div>'+
  '<button class="ghost" id="spe" style="margin-top:10px">✏️ তারিখ ও জন্মদিন বদলাও</button>'+
  '<div id="spx" style="display:none;margin-top:10px">'+
  '<span class="hint">বর্ষপূর্তির তারিখ (শুরুর দিন)</span><input type="date" id="spa" aria-label="বর্ষপূর্তির তারিখ">'+
  '<span class="hint">সাগরের জন্মদিন</span><input type="date" id="spbs" aria-label="সাগরের জন্মদিন">'+
  '<span class="hint">শিমার জন্মদিন</span><input type="date" id="spbh" aria-label="শিমার জন্মদিন">'+
  '<button id="spsv">সেভ করো</button>'+
  '<div class="serif" style="font-size:1.05rem;margin:14px 0 4px">⭐ নিজের স্পেশাল তারিখ যোগ করো</div>'+
  '<input type="text" id="spct" maxlength="50" placeholder="কী উপলক্ষ? (যেমন: প্রথম ফোনকল)"><input type="date" id="spcd" aria-label="তারিখ">'+
  '<label class="hint" style="display:block;margin:4px 0 8px"><input type="checkbox" id="spcy" checked>প্রতি বছর মনে করিয়ে দাও</label>'+
  '<button class="ghost" id="spca">যোগ করো</button></div><p class="note" id="spn"></p>';
 var anchor=$("ml")||$("qs")||document.querySelector("#home .hero");
 anchor.insertAdjacentElement("afterend",sc);
 function say(t){$("spn").textContent=t}

 function items(t){
  var a=[],ann=(sp&&sp.annv)||DEF_ANN,bd=(sp&&sp.bd)||{};
  var n=nextOcc(ann,t),yrs=n.getFullYear()-pd(ann).getFullYear();
  a.push({k:"ann",label:yrs>0?"💞 "+bn(yrs)+" বছরের বর্ষপূর্তি":"💞 বর্ষপূর্তি",d:diff(n,t),date:iso(n)});
  ["sagor","shima"].forEach(function(k){
   if(bd[k]){var o=nextOcc(bd[k],t);a.push({k:"bd",label:"🎂 "+PN[k]+"র জন্মদিন",d:diff(o,t),date:iso(o)})}});
  ((sp&&sp.custom)||[]).forEach(function(c){
   var d0=pd(c.d),o=c.y?nextOcc(c.d,t):d0,dd=diff(o,t);
   a.push({k:"c",id:c.id,raw:c,label:"⭐ "+c.t,d:dd,date:iso(o),past:dd<0,yearly:!!c.y})});
  return a}

 function renderSp(){
  var b=$("spb");b.innerHTML="";
  if(spErr){b.appendChild(el("div","hint","সমস্যা: "+spErr))}
  var t=today(),ann=(sp&&sp.annv)||DEF_ANN,a=pd(ann),total=diff(t,a);
  if(total<0){b.appendChild(el("div","hint","শুরুর তারিখ ভবিষ্যতে, তারিখটা ঠিক করো।"))}
  else{
   b.appendChild(el("div","spbig",bn(total)+" দিন"));
   var r=ymd(a,t);
   b.appendChild(el("div","hint","একসাথে পথচলা, "+bn(r[0])+" বছর "+bn(r[1])+" মাস "+bn(r[2])+" দিন ("+fd(ann)+" থেকে)"))}
  var list=items(t).filter(function(x){return !x.past}).sort(function(p,q){return p.d-q.d});
  list.forEach(function(x){
   var row=el("div","spr"+(x.d<=7?" soon":""));
   row.appendChild(document.createTextNode(x.label+": "+(x.d===0?"🎉 আজ!":dl(x.d))+" · "+fd(x.date)));
   if(x.k==="c"){
    var rm=el("button","chip","🗑️ মুছো");rm.style.cssText="margin-left:8px;padding:1px 10px;font-size:.85rem";
    rm.onclick=function(){delCustom(x.raw)};row.appendChild(rm)}
   b.appendChild(row)});
  var bd=(sp&&sp.bd)||{};
  if(!bd.sagor||!bd.shima)b.appendChild(el("div","hint","জন্মদিনের তারিখ দেওয়া নেই, ওপরের এডিট বোতামে দিয়ে রাখো।"));
  var past=items(t).filter(function(x){return x.past});
  past.forEach(function(x){
   var row=el("div","spr hint",x.label+": গত হয়েছে ("+fd(x.date)+")");
   var rm=el("button","chip","🗑️ মুছো");rm.style.cssText="margin-left:8px;padding:1px 10px;font-size:.85rem";
   rm.onclick=function(){delCustom(x.raw)};row.appendChild(rm);b.appendChild(row)})}

 /* রিমাইন্ডার: ৩ দিনের মধ্যে কিছু থাকলে দিনে একবার টোস্ট */
 function remind(){
  if(remDone)return;remDone=true;
  var t=today(),k0="spRem-"+iso(t),seen={};try{seen=JSON.parse(localStorage.getItem(k0))||{}}catch(e){}
  var due=items(t).filter(function(x){return !x.past&&x.d<=3&&!seen[x.label]});
  if(!due.length)return;
  due.forEach(function(x){seen[x.label]=1});
  try{localStorage.setItem(k0,JSON.stringify(seen))}catch(e){}
  var x=due[0];toast("🔔 "+x.label+": "+(x.d===0?"আজ!":dl(x.d)))}

 $("spe").onclick=function(){
  var b=$("spx"),show=b.style.display==="none";b.style.display=show?"block":"none";
  if(show){var bd=(sp&&sp.bd)||{};$("spa").value=(sp&&sp.annv)||DEF_ANN;$("spbs").value=bd.sagor||"";$("spbh").value=bd.shima||""}};
 $("spsv").onclick=function(){
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  var a=$("spa").value;if(!a){say("বর্ষপূর্তির তারিখ দাও।");return}
  DB.doc("meta/special").set({annv:a,bd:{sagor:$("spbs").value||"",shima:$("spbh").value||""}},{merge:true})
   .then(function(){say("সেভ হয়েছে ✓");logEv("স্পেশাল তারিখ বদলেছে ⭐","home");$("spx").style.display="none"}).catch(function(e){say("সমস্যা: "+e.code)})};
 $("spca").onclick=function(){
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  var t=$("spct").value.trim(),d=$("spcd").value;
  if(!t||!d){say("উপলক্ষ আর তারিখ দুটোই দাও।");return}
  var o={id:Date.now().toString(36),t:t.slice(0,50),d:d,y:$("spcy").checked};
  DB.doc("meta/special").set({custom:firebase.firestore.FieldValue.arrayUnion(o)},{merge:true})
   .then(function(){$("spct").value="";$("spcd").value="";say("যোগ হয়েছে ✓");logEv("নতুন স্পেশাল তারিখ যোগ করেছে ⭐","home")}).catch(function(e){say("সমস্যা: "+e.code)})};
 function delCustom(o){
  if(!DB)return;
  if(!confirm("“"+o.t+"” মুছে ফেলবে? দুজনের কাছ থেকেই মুছে যাবে।"))return;
  DB.doc("meta/special").update({custom:firebase.firestore.FieldValue.arrayRemove(o)}).then(function(){say("মোছা হয়েছে ✓")}).catch(function(e){say("সমস্যা: "+e.code)})}

 /* ---------- কার্ড ২: শেষ ৭ দিনের স্পেশাল কার্ড ---------- */
 var CARDS={
  7:"আর ৭ দিন। গুনতে গুনতে প্রায় তোমার কাছে এসে গেলাম 💗",
  6:"ছয় দিন বাকি। আজ একটা পুরোনো স্মৃতি মনে করো, যেটা ভাবলে তুমি হাসো 😊",
  5:"পাঁচ দিন। দেখা হলে প্রথমে কী বলবে, মনে মনে ভেবে রাখো।",
  4:"চার দিন। আজ ভিডিও কলে দেখা হওয়ার দিনের একটা ছোট্ট প্ল্যান বানাই?",
  3:"তিন দিন। আজকের সবচেয়ে ছোট্ট আদরটা তোমার জন্য 🤍",
  2:"দুই দিন। আর একটু ধৈর্য, তারপর আর দূরত্ব থাকবে না।",
  1:"আগামীকাল! আজ ভালো করে ঘুমাও, কাল পুরোটা দিন তোমার সাথে 💞"};
 var DEFFIN="আজ আমাদের দেখা হচ্ছে। সব অপেক্ষা শেষ, এখন শুধু তুমি আর আমি 💞";
 var mc=el("div","card");mc.id="mc";mc.style.display="none";
 mc.innerHTML='<div class="serif" style="font-size:1.15rem;margin-bottom:6px">🎁 দেখা হওয়ার স্পেশাল কার্ড</div><p class="hint" id="mch" style="margin:0 0 10px"></p><div id="mcl"></div>'+
  '<details style="margin-top:6px"><summary>✏️ শেষ দিনের মেসেজ লেখো (সারপ্রাইজ, দেখা যাবে না)</summary>'+
  '<input type="text" id="mci" maxlength="200" placeholder="দেখা হওয়ার দিন যা দেখাবে"><button class="ghost" id="mcs">সেভ করো</button></details><p class="note" id="mcn"></p>';
 $("cdv").parentNode.insertAdjacentElement("afterend",mc);

 function renderMc(){
  lastNext=NEXT;lastR=Date.now();
  var t=today();
  if(!NEXT){mc.style.display="none";return}
  var left=diff(pd(NEXT),t);
  if(left<0){mc.style.display="none";return}
  mc.style.display="block";
  var l=$("mcl");l.innerHTML="";
  if(left>7){
   $("mch").textContent="দেখা হওয়ার আগের শেষ ৭ দিনে প্রতিদিন একটা করে কার্ড খুলবে। প্রথমটা খুলবে "+bn(left-7)+" দিন পরে।";return}
  $("mch").textContent=left===0?"আজ সেই দিন! 🥰":"প্রতিদিন নতুন একটা কার্ড খুলছে, আজ আর "+bn(left)+" দিন বাকি।";
  for(var n=7;n>=1;n--){
   var open=left<=n,c=el("div","mcc"+(open?"":" lk"));
   c.appendChild(el("b","serif","দিন "+bn(n)+" বাকি"));
   c.appendChild(el("div",open?"":"hint",open?CARDS[n]:"🔒 "+fd(iso(new Date(pd(NEXT).getTime()-n*864e5)))+" তারিখে খুলবে"));
   l.appendChild(c)}
  var f=left===0,fc=el("div","mcc fin"+(f?"":" lk"));
  fc.appendChild(el("b","serif","🎉 দেখা হওয়ার দিন"));
  fc.appendChild(el("div",f?"":"hint",f?(msgT||DEFFIN):"🔒 "+fd(NEXT)+" তারিখে খুলবে"));
  l.appendChild(fc);
  var k="mcT-"+iso(t);
  if(!localStorage.getItem(k)){try{localStorage.setItem(k,"1")}catch(e){}toast("🎁 আজকের স্পেশাল কার্ড খুলেছে!")}}
 $("mcs").onclick=function(){
  var v=$("mci").value.trim();if(!v||!DB)return;
  DB.doc("meta/nextmsg").set({m:v.slice(0,200)}).then(function(){$("mci").value="";$("mcn").textContent="সেভ হয়েছে ✓ (দেখা হওয়ার দিন খুলবে)"}).catch(function(e){$("mcn").textContent="সমস্যা: "+e.code})};
 setInterval(function(){if(NEXT!==lastNext||Date.now()-lastR>60000)renderMc();if(Date.now()-lastR>60000)renderSp()},2000);

 renderSp();renderMc();

 var _s=start;
 start=function(){
  var was=ran;ran=true;_s();if(was)return;
  DB.doc("meta/special").onSnapshot(function(s){sp=s.exists?s.data():null;spErr="";renderSp();remind()},function(e){spErr=e.code;renderSp()});
  DB.doc("meta/nextmsg").onSnapshot(function(s){var d=s.data();msgT=d&&d.m||"";renderMc()},function(){})};
})();
