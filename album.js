/* ===== শেয়ার্ড ফটো অ্যালবাম (Firebase Storage ছাড়া, সম্পূর্ণ ফ্রী) =====
   ছবি ফোনেই ৮০০ পিক্সেলে সংকুচিত হয় (সর্বোচ্চ ~১৫০ KB), তারপর Firestore ডকুমেন্টে থাকে।
   ডেটা: album/{id}      = { from, t, date:"YYYY-MM-DD", md:"MM-DD", cap, img (JPEG ডেটা URL), sz }
         meta/albumstat = { n, b }    ← মোট ছবি ও আনুমানিক বাইট (স্টোরেজ মিটারের জন্য)
   সীমা: মোট ~৫০০ MB (প্রায় ৩,০০০ ছবি)। ৩০০ MB পার হলে সতর্কতা, ৫০০ MB-তে নতুন আপলোড বন্ধ।
   গ্যালারি ১২টা করে পেজে লোড হয় (Read বাঁচাতে)। মুছলে জায়গা ফাঁকা হয়, মোছার আগে Confirmation আসে। */
(function(){
 var PAGE=12,WARN=300e6,MAX=500e6,items=[],last=null,more=false,ld=false,err="",stat={n:0,b:0},mon="",busy=false,pending=null;
 var pn=LV.el("div","panel");pn.id="malbum";
 pn.innerHTML='<div class="card"><div class="serif" style="font-size:1.15rem">🖼️ আমাদের অ্যালবাম</div><div class="hint" id="alm" style="margin:4px 0 8px"></div>'+
  '<label class="btn" for="alf" style="margin:0 0 8px">📷 ছবি বেছে নাও</label><input type="file" id="alf" accept="image/*">'+
  '<div id="alp" style="display:none"><img id="ali" alt="নির্বাচিত ছবি" style="width:100%;border-radius:14px"></div>'+
  '<input type="text" id="alc" maxlength="80" placeholder="ক্যাপশন (ঐচ্ছিক)"><input type="date" id="ald" aria-label="ছবির তারিখ">'+
  '<button id="alu">ছবি যোগ করো</button><p class="note" id="aln"></p>'+
  '<p class="hint" style="margin:6px 0 0">ছবি ইন্টারনেটে (Firebase) সংরক্ষিত হয়। যা দুজনে স্বচ্ছন্দে রাখতে চাও শুধু তাই দাও।</p></div>'+
  '<div class="card"><span class="hint">মাস ও বছর অনুযায়ী দেখো</span><input type="month" id="alk" aria-label="মাস বেছে নাও" class="lvs"><button class="ghost" id="alx" style="margin-bottom:8px">সব দেখাও</button><div id="alg"></div><button class="ghost" id="alb" style="display:none">আরও দেখাও</button></div>';
 LV.panelChip($("mm"),$("mem"),"🖼️ অ্যালবাম",pn,function(){if(!items.length&&!ld)load(true)});
 $("ald").value=LV.day();
 function say(t){$("aln").textContent=t}
 function mb(n){return bn(Math.round(n/1e5)/10)}
 function meter(){
  var t=$("alm");t.className="hint";
  t.textContent=bn(stat.n||0)+"টা ছবি · প্রায় "+mb(stat.b||0)+" / "+mb(MAX)+" MB (অ্যালবামের সীমা)";
  if((stat.b||0)>=MAX){t.className="hint lvw";t.textContent+=" · জায়গা শেষ, পুরোনো ছবি মুছে ফেলো"}
  else if((stat.b||0)>=WARN){t.className="hint lvw";t.textContent+=" · ⚠️ জায়গা কমে আসছে, পুরোনো ছবি মুছে ফেলো"}}

 $("alf").onchange=function(){
  var f=this.files&&this.files[0];if(!f)return;say("ছবি ছোট করা হচ্ছে…");
  LV.compress(f,800,.72,150000).then(function(d){pending=d;$("ali").src=d;$("alp").style.display="block";say("প্রস্তুত (প্রায় "+bn(Math.round(d.length*.75/1024))+" KB)")})
   .catch(function(){pending=null;say("এই ছবিটা ছোট করা যায়নি, অন্য ছবি দাও।")})};
 $("alu").onclick=function(){
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  if(!pending){say("আগে একটা ছবি বেছে নাও।");return}
  if((stat.b||0)>=MAX){say("অ্যালবামের জায়গা শেষ। আগে পুরোনো ছবি মুছো।");return}
  var date=$("ald").value||LV.day(),sz=Math.round(pending.length*.75)+300;
  busy=true;$("alu").disabled=true;say("আপলোড হচ্ছে…");
  DB.collection("album").add({from:WHO,t:Date.now(),date:date,md:date.slice(5),cap:$("alc").value.trim().slice(0,80),img:pending,sz:sz}).then(function(){
   return DB.doc("meta/albumstat").set({n:firebase.firestore.FieldValue.increment(1),b:firebase.firestore.FieldValue.increment(sz)},{merge:true})
  }).then(function(){
   busy=false;$("alu").disabled=false;pending=null;$("alp").style.display="none";$("alc").value="";$("alf").value="";say("যোগ হয়েছে ✓");
   logEv("অ্যালবামে নতুন ছবি দিয়েছে 🖼️","mem");load(true)
  }).catch(function(e){busy=false;$("alu").disabled=false;say("সমস্যা: "+(e.code||e.message))})};

 function load(reset){
  if(!DB)return;
  if(reset){items=[];last=null;more=false}
  ld=true;err="";render();
  var q=DB.collection("album");
  if(mon)q=q.where("date",">=",mon+"-01").where("date","<=",mon+"-31");
  q=q.orderBy("date","desc");if(last)q=q.startAfter(last);
  q.limit(PAGE).get().then(function(qs){
   qs.forEach(function(d){var x=d.data();x.id=d.id;items.push(x)});
   last=qs.docs.length?qs.docs[qs.docs.length-1]:last;more=qs.docs.length===PAGE;ld=false;render()
  }).catch(function(e){ld=false;err=e.code||e.message;render()})}
 $("alk").onchange=function(){mon=this.value||"";load(true)};
 $("alx").onclick=function(){mon="";$("alk").value="";load(true)};
 $("alb").onclick=function(){load(false)};

 function del(x){
  if(!confirm("ছবিটা দুজনের অ্যালবাম থেকেই চিরতরে মুছে যাবে। মুছবে?"))return;
  DB.collection("album").doc(x.id).delete().then(function(){
   return DB.doc("meta/albumstat").set({n:firebase.firestore.FieldValue.increment(-1),b:firebase.firestore.FieldValue.increment(-(x.sz||150000))},{merge:true})
  }).then(function(){items=items.filter(function(i){return i.id!==x.id});say("মোছা হয়েছে ✓");render()}).catch(function(e){say("সমস্যা: "+e.code)})}
 function big(x){
  var o=LV.el("div","");o.style.cssText="position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:14px";
  var i=document.createElement("img");i.src=x.img;i.alt=x.cap||"ছবি";i.style.cssText="max-width:100%;max-height:92vh;border-radius:10px";o.appendChild(i);
  o.onclick=function(){o.remove()};document.body.appendChild(o)}
 function render(){
  var g=$("alg");g.innerHTML="";meter();
  if(err){g.appendChild(LV.el("p","hint","সমস্যা: "+err));return}
  if(!items.length){g.appendChild(LV.el("p","hint",ld?"লোড হচ্ছে…":(mon?"এই মাসে কোনো ছবি নেই।":"এখনো কোনো ছবি নেই। প্রথমটা তুমিই দাও 💞")));$("alb").style.display="none";return}
  var cm="";
  items.forEach(function(x){
   var k=x.date.slice(0,7);
   if(k!==cm){cm=k;var a=k.split("-");g.appendChild(LV.el("div","serif",new Date(+a[0],+a[1]-1,1).toLocaleDateString("bn-BD",{month:"long",year:"numeric"}))).style.cssText="font-size:1.1rem;margin:12px 0 6px"}
   var c=LV.el("div","");c.style.cssText="margin:0 0 12px";
   var im=document.createElement("img");im.src=x.img;im.alt=x.cap||"অ্যালবামের ছবি";im.loading="lazy";im.style.cssText="width:100%;border-radius:14px;display:block;cursor:zoom-in";im.onclick=function(){big(x)};c.appendChild(im);
   c.appendChild(LV.el("div","",x.cap||""));
   c.appendChild(LV.el("div","hint",fd(x.date)+" · "+(x.from===WHO?"আমি":LV.pn())+" দিয়েছি"));
   if(x.from===WHO){var d=LV.el("button","chip","🗑️ মুছো");d.onclick=function(){del(x)};c.appendChild(d)}
   g.appendChild(c)});
  $("alb").style.display=more?"block":"none";$("alb").disabled=ld}
 LV.onStart(function(){DB.doc("meta/albumstat").onSnapshot(function(s){stat=s.exists?s.data():{n:0,b:0};meter()},function(){})});
})();
