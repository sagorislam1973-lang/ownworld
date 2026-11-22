/* ===== Shared Digital Diary (📖 আমাদের ডায়েরি) =====
   স্মৃতি ট্যাবে নতুন "📖 ডায়েরি" চিপ। বিদ্যমান গোপন ডায়েরি (শুধু লোকাল) অক্ষত, এটা আলাদা ও দুজনের শেয়ার করা।
   ডেটা:
   meta/diary_YYYY-MM → { e: { id: { by, t, u?, x } } }   (একটা মাস = একটা ডকুমেন্ট, তাই মাসভিত্তিক আর্কাইভ ও কম Read)
   meta/diary_idx     → { months: ["2026-11", ...] }       (কোন কোন মাসে লেখা আছে)
   নিয়ম: নিজের লেখা শুধু নিজে এডিট/ডিলিট করতে পারবে (UI-তে)। ওরটা শুধু পড়া যাবে।
   সীমা: লেখা সর্বোচ্চ ২০০০ অক্ষর, মাসের ডকুমেন্ট ~৮০০ KB-এর বেশি হলে নতুন লেখা আটকায় (Firestore ১ MiB সীমা)। */
(function(){
 var MAXC=2000,MAXB=800000;
 var cur=ym(new Date()),idx=[],data=null,err="",ld=false,ran=false,unsub=null,editId=null,q="",sres=null,scache={},busy=false,lastLog=0;
 function pad2(n){return n<10?"0"+n:""+n}
 function ym(d){return d.getFullYear()+"-"+pad2(d.getMonth()+1)}
 function el(tag,cls,t){var d=document.createElement(tag);if(cls)d.className=cls;if(t!=null)d.textContent=t;return d}
 function mname(k){var a=k.split("-");return new Date(+a[0],+a[1]-1,1).toLocaleDateString("bn-BD",{month:"long",year:"numeric"})}
 function shift(k,n){var a=k.split("-"),d=new Date(+a[0],+a[1]-1+n,1);return ym(d)}
 function full(t){return new Date(t).toLocaleString("bn-BD",{weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"numeric",minute:"2-digit"})}

 var st=document.createElement("style");
 st.textContent=".dye{border-top:1px solid var(--line);padding:10px 0}"+
  ".dye .tx{white-space:pre-wrap;word-break:break-word;margin:4px 0 6px;line-height:1.7}"+
  ".dye.mi .by{color:var(--rose)}"+
  ".dye textarea{margin:6px 0}"+
  ".dyn{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px 0}"+
  ".dyn button{width:auto;padding:6px 14px}";
 document.head.appendChild(st);

 var pn=el("div","panel");pn.id="mdiary";
 pn.innerHTML='<div class="card"><textarea id="dyt" rows="4" maxlength="2000" placeholder="আজ কেমন গেল? মনের কথা লেখো, দুজনেই পড়তে পারবে"></textarea>'+
  '<div class="hint" id="dyc" style="text-align:right">০ / ২০০০</div><button id="dys">ডায়েরিতে লেখো ✍️</button><p class="note" id="dyn0"></p></div>'+
  '<div class="card"><input type="text" id="dyq" maxlength="60" placeholder="🔎 পুরোনো লেখা খোঁজো"><div class="two" style="margin-top:0"><button class="ghost" id="dyg">খোঁজো</button><button class="ghost" id="dyx">মুছে দাও</button></div>'+
  '<p class="hint" style="margin:6px 0 0">খুঁজতে সব মাসের লেখা একবার পড়া হয় (মাসপ্রতি ১ Read), পরে আবার খুঁজলে নতুন Read লাগে না।</p></div>'+
  '<div class="dyn"><button class="ghost" id="dyp" aria-label="আগের মাস">◀</button><b class="serif" id="dym" style="font-size:1.15rem;text-align:center"></b><button class="ghost" id="dyf" aria-label="পরের মাস">▶</button></div>'+
  '<div class="chips" id="dyi"></div><div class="card" id="dyl"></div>';
 var cb=LV.panelChip($("mm"),$("mem"),"📖 ডায়েরি",pn,function(){render()});

 function say(t){$("dyn0").textContent=t}
 function pname(f){return f===WHO?"তুমি":PN[f]}
 function entries(){var e=(data&&data.e)||{};return Object.keys(e).map(function(k){return{id:k,x:e[k]}}).sort(function(a,b){return b.x.t-a.x.t})}
 function size(){try{return JSON.stringify(data||{}).length}catch(e){return 0}}

 /* সাবস্ক্রিপশন: শুধু যে মাসটা দেখছি */
 function watch(){
  if(!DB)return;
  if(unsub){unsub();unsub=null}
  ld=false;err="";data=null;render();
  var k=cur;
  unsub=DB.doc("meta/diary_"+k).onSnapshot(function(s){if(k!==cur)return;data=s.exists?s.data():null;ld=true;err="";render()},function(e){err=e.code||"error";render()})}

 $("dyp").onclick=function(){cur=shift(cur,-1);editId=null;watch()};
 $("dyf").onclick=function(){cur=shift(cur,1);editId=null;watch()};
 $("dyt").addEventListener("input",function(){$("dyc").textContent=bn($("dyt").value.length)+" / "+bn(MAXC)});

 /* লেখা */
 $("dys").onclick=function(){
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  var x=$("dyt").value.trim();
  if(!x){say("কিছু লেখো।");return}
  var now=new Date(),k=ym(now);
  if(k===cur&&size()>MAXB){say("এই মাসের ডায়েরি ভরে গেছে, পুরোনো কিছু মুছে ফেলো।");return}
  var id="d"+now.getTime().toString(36),o={};o[id]={by:WHO,t:now.getTime(),x:x.slice(0,MAXC)};
  $("dys").disabled=true;say("সেভ হচ্ছে…");
  DB.doc("meta/diary_"+k).set({e:o},{merge:true}).then(function(){
   return DB.doc("meta/diary_idx").set({months:firebase.firestore.FieldValue.arrayUnion(k)},{merge:true})
  }).then(function(){
   $("dys").disabled=false;$("dyt").value="";$("dyc").textContent="০ / "+bn(MAXC);say("লেখা হয়েছে ✓");
   delete scache[k];sres=null;
   var n=Date.now();if(n-lastLog>600000){lastLog=n;logEv("ডায়েরিতে নতুন লেখা লিখেছে 📖","mem")}
   if(cur!==k){cur=k;watch()}
  }).catch(function(e){$("dys").disabled=false;say("সমস্যা: "+e.code)})};

 function saveEdit(en,txt){
  var t=txt.trim();if(!t){say("খালি রাখা যাবে না, চাইলে মুছে ফেলো।");return}
  var u={};u["e."+en.id+".x"]=t.slice(0,MAXC);u["e."+en.id+".u"]=Date.now();
  DB.doc("meta/diary_"+cur).update(u).then(function(){editId=null;delete scache[cur];sres=null;say("আপডেট হয়েছে ✓")}).catch(function(e){say("সমস্যা: "+e.code)})}
 function del(en){
  if(!confirm("এই লেখাটা দুজনের ডায়েরি থেকেই চিরতরে মুছে যাবে। মুছবে?"))return;
  var u={};u["e."+en.id]=firebase.firestore.FieldValue.delete();
  DB.doc("meta/diary_"+cur).update(u).then(function(){delete scache[cur];sres=null;say("মোছা হয়েছে ✓")}).catch(function(e){say("সমস্যা: "+e.code)})}

 function entry(en,month){
  var mine=en.x.by===WHO,d=el("div","dye"+(mine?" mi":""));
  var h=el("div","hint");var b=el("b","by",pname(en.x.by)+" · ");h.appendChild(b);
  h.appendChild(document.createTextNode(full(en.x.t)+(en.x.u?" · সম্পাদিত "+ft(en.x.u):"")));d.appendChild(h);
  if(mine&&editId===en.id&&!month){
   var ta=document.createElement("textarea");ta.rows=4;ta.maxLength=MAXC;ta.value=en.x.x;d.appendChild(ta);
   var r=el("div","two");var s=el("button","","সেভ");s.onclick=function(){saveEdit(en,ta.value)};
   var c=el("button","ghost","বাতিল");c.onclick=function(){editId=null;render()};r.appendChild(s);r.appendChild(c);d.appendChild(r)}
  else{
   d.appendChild(el("div","tx",en.x.x));
   if(month){var go=el("button","chip","📖 "+mname(month)+"-এ যাও");go.onclick=function(){cur=month;q="";sres=null;$("dyq").value="";watch()};d.appendChild(go)}
   else if(mine){
    var ed=el("button","chip","✏️ এডিট");ed.onclick=function(){editId=en.id;render()};
    var dl=el("button","chip","🗑️ মুছো");dl.style.marginLeft="6px";dl.onclick=function(){del(en)};d.appendChild(ed);d.appendChild(dl)}}
  return d}

 /* সার্চ */
 function months(){var s={};idx.forEach(function(k){s[k]=1});s[ym(new Date())]=1;return Object.keys(s).sort().reverse()}
 function doSearch(){
  q=$("dyq").value.trim().toLowerCase();
  if(!q){sres=null;render();return}
  if(busy||!DB)return;busy=true;$("dyg").disabled=true;say("খোঁজা হচ্ছে…");
  var ms=months();
  Promise.all(ms.map(function(k){
   if(scache[k])return Promise.resolve();
   return DB.doc("meta/diary_"+k).get().then(function(s){scache[k]=s.exists?((s.data()||{}).e||{}):{}})
  })).then(function(){
   var r=[];ms.forEach(function(k){var e=scache[k]||{};Object.keys(e).forEach(function(id){if((e[id].x||"").toLowerCase().indexOf(q)>=0)r.push({id:id,x:e[id],m:k})})});
   r.sort(function(a,b){return b.x.t-a.x.t});sres=r;busy=false;$("dyg").disabled=false;say("");render()
  }).catch(function(e){busy=false;$("dyg").disabled=false;say("সমস্যা: "+e.code)})}
 $("dyg").onclick=doSearch;
 $("dyq").addEventListener("keydown",function(e){if(e.key==="Enter")doSearch()});
 $("dyx").onclick=function(){q="";sres=null;$("dyq").value="";say("");render()};

 function render(){
  $("dym").textContent=mname(cur);
  $("dyf").disabled=cur>=ym(new Date());
  var ib=$("dyi");ib.innerHTML="";
  months().slice(0,12).forEach(function(k){
   var c=el("button","chip"+(k===cur&&!sres?" on":""),mname(k));c.onclick=function(){cur=k;sres=null;q="";$("dyq").value="";editId=null;watch()};ib.appendChild(c)});
  var box=$("dyl");box.innerHTML="";
  if(sres){
   box.appendChild(el("div","serif","“"+q+"” খুঁজে পাওয়া গেছে "+bn(sres.length)+"টা")).style.cssText="font-size:1.1rem;margin-bottom:4px";
   if(!sres.length)box.appendChild(el("p","hint","কিছু পাওয়া যায়নি।"));
   sres.slice(0,50).forEach(function(r){box.appendChild(entry(r,r.m))});
   if(sres.length>50)box.appendChild(el("p","hint","প্রথম ৫০টা দেখানো হয়েছে, আরও নির্দিষ্ট করে খোঁজো।"));return}
  if(err){box.appendChild(el("p","hint","সমস্যা: "+err));return}
  if(!ld){box.appendChild(el("p","hint","লোড হচ্ছে…"));return}
  var es=entries();
  if(!es.length){box.appendChild(el("p","hint",cur===ym(new Date())?"এই মাসে এখনো কিছু লেখা হয়নি। প্রথম লেখাটা তুমিই লেখো 💞":"এই মাসে কোনো লেখা নেই।"));return}
  box.appendChild(el("div","hint",bn(es.length)+"টা লেখা"+(size()>MAXB*.8?" · ⚠️ এই মাসের জায়গা প্রায় শেষ":"")));
  es.forEach(function(en){box.appendChild(entry(en))})}

 var _s=start;
 start=function(){
  var was=ran;ran=true;_s();if(was)return;
  DB.doc("meta/diary_idx").onSnapshot(function(s){var d=s.data();idx=(d&&d.months)||[];render()},function(){});
  watch()};
})();
