/* ===== স্টোরেজ ম্যানেজার =====
   নীতি: শুধু ম্যানুয়াল ডিলিট। অ্যাপ নিজে থেকে কিছুই মুছবে না।
   হিসাব করার বোতাম চাপলে তবেই Firestore থেকে পড়া হয় (খোলার সময় কোনো বাড়তি Read নেই)। */
(function(){
 var CAP=1073741824,WARN=.8,LIM=1000,PAGE=20,OVH=100,BATCH=400;
 var COLS=[
  ["chat","💬 চ্যাট মেসেজ",function(x){return who(x.from)+": "+(x.text||"")}],
  ["voices","🎙️ ভয়েস নোট",function(x){return who(x.from)+": ভয়েস"}],
  ["snaps","📸 স্ন্যাপ",function(x){return who(x.from)+": স্ন্যাপ ("+(x.seen?"দেখা হয়েছে":"অদেখা")+")"}],
  ["puzzles","🧩 পাজল চ্যালেঞ্জ",function(x){return who(x.from)+": পাজল "+bn(x.n||0)+"×"+bn(x.n||0)}],
  ["events","🔔 অ্যাক্টিভিটি লগ",function(x){return who(x.from)+": "+(x.text||"")}],
  ["notes","💌 নোট",function(x){return who(x.from)+": "+(x.text||"")}],
  ["dares","🎁 সত্যি/সাহস কার্ড",function(x){return who(x.from)+": "+(x.text||"")}],
  ["letters","📮 চিঠি",function(x){return who(x.from)+": "+(x.title||"চিঠি")}],
  ["wo","📬 যখন খুলবে চিঠি",function(x){return who(x.from)+": "+(x.label||"চিঠি")}],
  ["vm","🎙️ চ্যাটের ভয়েস (অডিও)",function(x){return who(x.from)+": ভয়েস মেসেজ"}],
  ["coupons","🎟️ নিজেদের কুপন",function(x){return who(x.from)+": "+(x.title||"কুপন")}],
  ["album","🖼️ অ্যালবামের ছবি",function(x){return who(x.from)+": "+(x.cap||"ছবি")+" ("+(x.date||"")+")"}],
  ["stories","📚 গল্প আর্কাইভ",function(x){return who(x.from)+": "+(x.title||"গল্প")}],
  ["memgame","🧠 স্মৃতি অনুমান",function(x){return who(x.from)+": "+(x.q||"স্মৃতি")}]
 ];
 var AGE=[[7,"৭ দিন"],[30,"৩০ দিন"],[90,"৯০ দিন"],[0,"সব"]],age=30;
 var data={},errs={},metaB=0,scanned=false,open={},shown={},busy=false;

 /* স্টাইল (index.html না ছুঁয়ে) */
 var st=document.createElement("style");
 st.textContent="#stov{position:fixed;inset:0;z-index:26;background:var(--bg);display:none;flex-direction:column}"+
  "#stov .sth{display:flex;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;border-bottom:1px solid var(--line);background:var(--glass)}"+
  "#stov .sth button{width:auto;padding:6px 14px}"+
  "#stov .stb{flex:1;overflow-y:auto;padding:14px 12px 40px;max-width:480px;width:100%;margin:0 auto}"+
  ".mtr{height:14px;border-radius:7px;background:var(--line);overflow:hidden;margin:8px 0}"+
  ".mtr i{display:block;height:100%;background:var(--rose);width:0}"+
  ".mtr.warn i{background:#e0243f}"+
  ".sti{border-top:1px solid var(--line);padding:8px 0;font-size:.95rem}"+
  ".sti .chip{padding:2px 10px;font-size:.85rem;margin-top:4px}"+
  ".stw{color:#e0243f;font-weight:600}";
 document.head.appendChild(st);

 function fb(n){
  if(n<1024)return bn(n)+" B";
  if(n<1048576)return bn(Math.round(n/1024))+" KB";
  return bn(Math.round(n/104857.6)/10)+" MB"}
 function sz(o){try{return new Blob([JSON.stringify(o)]).size+OVH}catch(e){return OVH}}
 function total(){var t=metaB;COLS.forEach(function(c){(data[c[0]]||[]).forEach(function(o){t+=o.s})});return t}

 /* হোম কার্ড */
 var hc=mk2('<div class="serif" style="font-size:1.2rem;margin-bottom:6px">🗄️ স্টোরেজ ম্যানেজার</div><p class="hint" id="sth" style="margin:0 0 10px"></p><button class="ghost" id="stb">খোলো</button>');
 function homeInfo(){
  var e=null;try{e=JSON.parse(localStorage.getItem("stEst"))}catch(x){}
  var h=$("sth");h.className="hint";
  if(!e){h.textContent="জায়গা কতটা ব্যবহার হচ্ছে দেখো, আর পুরোনো জিনিস নিজে মুছে ফেলো। অ্যাপ নিজে কিছু মুছবে না।";return}
  var p=e.b/CAP,d=Math.floor((Date.now()-e.t)/864e5);
  h.textContent="সর্বশেষ আনুমানিক হিসাব: "+fb(e.b)+" / "+fb(CAP)+" ("+bn(Math.round(p*100))+"%), "+(d<1?"আজ":bn(d)+" দিন আগে");
  if(p>=WARN){h.className="hint stw";h.textContent="⚠️ জায়গা কমে আসছে, পুরোনো জিনিস মুছে ফেলো। "+h.textContent}
  else if(d>=14)h.textContent+=" · অনেকদিন হয়েছে, আবার হিসাব করো"}
 homeInfo();

 /* ওভারলে */
 var ov=document.createElement("div");ov.id="stov";
 ov.innerHTML='<div class="sth"><button class="ghost" id="stx" aria-label="ফিরে যাও">←</button><b class="serif" style="font-size:1.2rem">🗄️ স্টোরেজ ম্যানেজার</b></div>'+
  '<div class="stb"><div class="card"><div id="stsum" class="serif" style="font-size:1.15rem"></div><div class="mtr" id="stm"><i></i></div>'+
  '<p class="hint" id="stnote" style="margin:0 0 10px">ফ্রী প্ল্যানে মোট ১ GiB। এটা আনুমানিক হিসাব (Firebase-এর আসল ব্যবহার Console-এ দেখা যাবে)। হিসাব করলে প্রতিটি ডকুমেন্ট ১টা Read ধরা হয়, দিনে এক-দুবার করলেই যথেষ্ট।</p>'+
  '<button id="stscan">📊 হিসাব করো</button><p class="note" id="stn"></p></div>'+
  '<div class="card"><div class="hint" style="margin-bottom:4px">“পুরোনো মুছো” বোতাম কত দিনের পুরোনো মুছবে:</div><div class="chips" id="stage"></div>'+
  '<p class="hint" style="margin:6px 0 0">শুধু তোমার নিজের পাঠানো জিনিস মোছা যাবে। ওর পাঠানোগুলো ও নিজে মুছবে। মোছার আগে Export করে রাখতে পারো।</p></div>'+
  '<div id="stl"></div></div>';
 document.body.appendChild(ov);
 chips("stage",AGE.map(function(a){return a[1]}),function(i){age=AGE[i][0]},1);
 function openM(){
  if(!DB||!WHO){$("note").textContent="আগে লগইন করো।";return}
  ov.style.display="flex";render()}
 $("stb").onclick=openM;
 $("stx").onclick=function(){ov.style.display="none";homeInfo()};

 function say(t){$("stn").textContent=t}

 /* হিসাব */
 $("stscan").onclick=function(){
  if(busy||!DB)return;busy=true;$("stscan").disabled=true;say("পড়া হচ্ছে…");
  data={};errs={};metaB=0;
  var jobs=COLS.map(function(c){
   return DB.collection(c[0]).orderBy("t","desc").limit(LIM).get().then(function(qs){
    var a=[];qs.forEach(function(d){var x=d.data();a.push({id:d.id,x:x,s:sz(x)})});data[c[0]]=a
   }).catch(function(e){errs[c[0]]=e.code||"error";data[c[0]]=[]})});
  ["meta","live","answers"].forEach(function(n){
   jobs.push(DB.collection(n).get().then(function(qs){qs.forEach(function(d){metaB+=sz(d.data())})}).catch(function(e){errs[n]=e.code||"error"}))});
  Promise.all(jobs).then(function(){
   scanned=true;busy=false;$("stscan").disabled=false;
   try{localStorage.setItem("stEst",JSON.stringify({t:Date.now(),b:total()}))}catch(e){}
   var ek=Object.keys(errs);say(ek.length?"কিছু অংশ পড়া যায়নি: "+ek.join(", ")+" ("+errs[ek[0]]+")":"হিসাব হয়ে গেছে ✓");
   render()})};

 /* Export: যে চিঠি/স্ন্যাপ এখনো খোলা হয়নি, ওর পাঠানোগুলোর ভেতরের লেখা/ছবি Export-এ যাবে না (সারপ্রাইজ নষ্ট হবে) */
 function exportCol(col){
  var a=data[col]||[];
  var items=a.map(function(o){
   var x=JSON.parse(JSON.stringify(o.x));
   if(x.from!==WHO){
    if((col==="letters"||col==="wo")&&!x.opened){delete x.text}
    if(col==="snaps"){delete x.img}}
   x.id=o.id;return x});
  var blob=new Blob([JSON.stringify({collection:col,exportedAt:new Date().toISOString(),count:items.length,items:items},null,1)],{type:"application/json"});
  var l=document.createElement("a");l.href=URL.createObjectURL(blob);l.download="backup-"+col+"-"+TODAY+".json";
  document.body.appendChild(l);l.click();l.remove();
  setTimeout(function(){URL.revokeObjectURL(l.href)},4000)}

 /* ডিলিট: ধাপে ধাপে ব্যাচে */
 function delMany(col,ids,done){
  var i=0,ok=0;
  (function next(){
   if(i>=ids.length){done(ok,null);return}
   var part=ids.slice(i,i+BATCH),b=DB.batch();
   part.forEach(function(id){b.delete(DB.collection(col).doc(id))});
   b.commit().then(function(){ok+=part.length;i+=BATCH;next()}).catch(function(e){done(ok,e.code||"error")})})()}
 function fixAlbum(col,removed){
  if(col!=="album"||!removed.length||!DB)return;var b=0;removed.forEach(function(o){b+=(o.x.sz||150000)});
  DB.doc("meta/albumstat").set({n:firebase.firestore.FieldValue.increment(-removed.length),b:firebase.firestore.FieldValue.increment(-b)},{merge:true}).catch(function(){})}
 function drop(col,ids){
  var set={};ids.forEach(function(id){set[id]=1});
  data[col]=(data[col]||[]).filter(function(o){return !set[o.id]})}
 function after(){
  try{localStorage.setItem("stEst",JSON.stringify({t:Date.now(),b:total()}))}catch(e){}
  render()}

 function bulk(c){
  if(busy)return;
  var cutoff=age?Date.now()-age*864e5:Infinity;
  var ids=(data[c[0]]||[]).filter(function(o){return o.x.from===WHO&&o.x.t<cutoff}).map(function(o){return o.id});
  if(!ids.length){say("এই শর্তে মোছার মতো কিছু নেই।");return}
  var sum=0;(data[c[0]]||[]).forEach(function(o){if(ids.indexOf(o.id)>=0)sum+=o.s});
  var lbl=age?bn(age)+" দিনের পুরোনো":"সব";
  if(!confirm(c[1]+": তোমার "+lbl+" "+bn(ids.length)+"টা (প্রায় "+fb(sum)+") চিরতরে মুছে যাবে। ফেরত আনা যাবে না।\n\nআগে Export করতে চাইলে বাতিল চাপো, তারপর Export চাপো। মুছবে?"))return;
  busy=true;say("মোছা হচ্ছে…");
  delMany(c[0],ids,function(ok,err){
   busy=false;
   var okIds=ids.slice(0,ok);fixAlbum(c[0],(data[c[0]]||[]).filter(function(o){return okIds.indexOf(o.id)>=0}));drop(c[0],okIds);
   say(err?"মোছা থেমে গেছে ("+err+"), "+bn(ok)+"টা মোছা হয়েছে।":"✓ "+bn(ok)+"টা মোছা হয়েছে।");after()})}

 function delOne(c,o){
  if(busy)return;
  if(!confirm("এটা চিরতরে মুছবে?"))return;
  DB.collection(c[0]).doc(o.id).delete().then(function(){fixAlbum(c[0],[o]);drop(c[0],[o.id]);say("✓ মোছা হয়েছে।");after()})
   .catch(function(e){say("মোছা যায়নি: "+e.code)})}

 function render(){
  var box=$("stl");box.innerHTML="";
  var t=total(),p=t/CAP,m=$("stm");
  m.firstChild.style.width=Math.min(100,p*100)+"%";m.className="mtr"+(p>=WARN?" warn":"");
  $("stsum").textContent=scanned?"আনুমানিক ব্যবহার: "+fb(t)+" / "+fb(CAP)+" ("+bn(Math.round(p*100))+"%)":"এখনো হিসাব করা হয়নি";
  if(scanned&&p>=WARN){var w=document.createElement("p");w.className="stw";w.textContent="⚠️ জায়গা কমে আসছে। পুরোনো জিনিস মুছে ফেলো।";box.appendChild(w)}
  if(!scanned){box.innerHTML='<p class="hint">উপরে “হিসাব করো” চাপলে প্রতিটি অংশ আলাদা করে দেখা যাবে।</p>';return}
  var mo=document.createElement("p");mo.className="hint";mo.textContent="অন্যান্য (আঁকা, প্রোফাইল ছবি, স্মৃতি, তারিখ ইত্যাদি): "+fb(metaB);box.appendChild(mo);
  COLS.forEach(function(c){
   var a=data[c[0]]||[],own=a.filter(function(o){return o.x.from===WHO}),sum=0;a.forEach(function(o){sum+=o.s});
   var d=document.createElement("div");d.className="card";d.style.margin="0 0 10px";
   var h=document.createElement("b");h.className="serif";h.textContent=c[1];d.appendChild(h);
   var s=document.createElement("div");s.className="hint";
   s.textContent="মোট "+bn(a.length)+(a.length>=LIM?"+":"")+"টা (তোমার "+bn(own.length)+"), প্রায় "+fb(sum)+(errs[c[0]]?" · সমস্যা: "+errs[c[0]]:"");d.appendChild(s);
   var r=document.createElement("div");r.className="chips";r.style.cssText="justify-content:flex-start;margin:6px 0 0";
   function chip(txt,fn){var b=document.createElement("button");b.className="chip";b.textContent=txt;b.onclick=fn;r.appendChild(b)}
   chip(open[c[0]]?"▲ বন্ধ":"▼ দেখো",function(){open[c[0]]=!open[c[0]];render()});
   chip("⬇️ Export",function(){exportCol(c[0])});
   chip("🗑️ পুরোনো মুছো",function(){bulk(c)});
   d.appendChild(r);
   if(open[c[0]]){
    if(!a.length){var e=document.createElement("p");e.className="hint";e.textContent="কিছু নেই।";d.appendChild(e)}
    var n=shown[c[0]]||PAGE;
    a.slice(0,n).forEach(function(o){
     var it=document.createElement("div");it.className="sti";
     var tx=document.createElement("div");tx.textContent=c[2](o.x).slice(0,70);
     var mt=document.createElement("div");mt.className="hint";mt.textContent=ft(o.x.t)+" · "+fb(o.s);
     it.appendChild(tx);it.appendChild(mt);
     if(o.x.from===WHO){var k=document.createElement("button");k.className="chip";k.textContent="🗑️ মুছো";k.onclick=function(){delOne(c,o)};it.appendChild(k)}
     d.appendChild(it)});
    if(a.length>n){var mr=document.createElement("button");mr.className="ghost";mr.style.cssText="margin-top:8px;padding:6px";mr.textContent="আরও দেখাও";mr.onclick=function(){shown[c[0]]=n+PAGE;render()};d.appendChild(mr)}
   }
   box.appendChild(d)})}
})();
