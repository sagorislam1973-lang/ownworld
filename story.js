/* ===== একসাথে গল্প (Collaborative Storytelling) =====
   একজন থিম ও প্রথম লাইন লেখে, তারপর পালা করে একটা করে লাইন। যেকোনো সময় গল্প শেষ করে আর্কাইভে সেভ করা যায়।
   ডেটা: meta/story   = { theme, title, lines:[{by,x,t}], turn }     (চলমান গল্প, একটাই)
         stories/{id} = { from, title, theme, lines, t }             (সেভ করা গল্প)
   লাইন যোগ হয় ট্রানজ্যাকশনে (পালা না হলে আটকায়)। সীমা: ২০০ লাইন, লাইনপ্রতি ৩০০ অক্ষর। */
(function(){
 var THEMES=["💞 রোম্যান্টিক","🗺️ অ্যাডভেঞ্চার","🧚 ফ্যান্টাসি","😂 মজার","🕵️ রহস্য","🌟 আমাদের গল্প"];
 var cur=null,ld=false,err="",th=0,arch=null,showA=false,busy=false;
 var pn=LV.el("div","panel card");pn.id="gstory";
 pn.innerHTML='<div class="serif" style="text-align:center;font-size:1.2rem">📖 একসাথে গল্প</div><p class="hint" style="text-align:center;margin:4px 0 8px">পালা করে একটা করে লাইন লিখে একটা গল্প বানাও।</p><div id="sty_stc"></div><p class="note" id="sty_stn"></p><div id="sty_sta"></div>';
 LV.panelChip($("gm"),$("games"),"📖 গল্প",pn,function(){render()});
 function say(t){$("sty_stn").textContent=t}
 function line(l){var d=LV.el("div","");d.style.cssText="margin:6px 0;padding:6px 10px;border-left:3px solid "+(l.by===WHO?"var(--rose)":"var(--gold)");
  d.appendChild(LV.el("small","hint",(l.by===WHO?"আমি":LV.pn())+"  "));d.appendChild(document.createTextNode(l.x));return d}

 function startStory(title,first){
  if(!DB||!WHO)return;
  DB.doc("meta/story").set({theme:THEMES[th],title:title||"আমাদের গল্প",lines:[{by:WHO,x:first.slice(0,300),t:Date.now()}],turn:PW})
   .then(function(){logEv("নতুন গল্প শুরু করেছে 📖","games")}).catch(function(e){say("সমস্যা: "+e.code)})}
 function addLine(x){
  if(busy)return;busy=true;var ref=DB.doc("meta/story");
  DB.runTransaction(function(tx){return tx.get(ref).then(function(s){
   var d=s.data();if(!d||d.turn!==WHO||(d.lines||[]).length>=200)return;
   d.lines.push({by:WHO,x:x.slice(0,300),t:Date.now()});d.turn=PW;tx.set(ref,d)})
  }).then(function(){busy=false;say("")}).catch(function(e){busy=false;say("সমস্যা: "+(e.code||e.message))})}
 function finish(){
  if(!cur||!confirm("গল্পটা শেষ করে আর্কাইভে সেভ করবে?"))return;
  DB.collection("stories").add({from:WHO,title:cur.title,theme:cur.theme,lines:cur.lines,t:Date.now()})
   .then(function(){return DB.doc("meta/story").delete()}).then(function(){arch=null;say("গল্প সেভ হয়েছে ✓");logEv("একটা গল্প শেষ করেছে 📚","games")}).catch(function(e){say("সমস্যা: "+e.code)})}
 function discard(){
  if(!cur||!confirm("চলমান গল্পটা সেভ না করেই মুছে ফেলবে?"))return;
  DB.doc("meta/story").delete().catch(function(e){say("সমস্যা: "+e.code)})}
 function loadArch(){
  DB.collection("stories").orderBy("t","desc").limit(20).get().then(function(qs){var a=[];qs.forEach(function(d){var x=d.data();x.id=d.id;a.push(x)});arch=a;render()}).catch(function(e){say("সমস্যা: "+e.code)})}

 function render(){
  var c=$("sty_stc");c.innerHTML="";var a=$("sty_sta");a.innerHTML="";
  if(err){c.appendChild(LV.el("p","hint","সমস্যা: "+err));return}
  if(!ld){c.appendChild(LV.el("p","hint","লোড হচ্ছে…"));return}
  if(!cur){
   c.appendChild(LV.el("div","hint","থিম বেছে নাও"));
   var ch=LV.el("div","chips");c.appendChild(ch);
   THEMES.forEach(function(t,i){var k=LV.el("button","chip"+(i===th?" on":""),t);k.onclick=function(){th=i;render()};ch.appendChild(k)});
   var ti=document.createElement("input");ti.type="text";ti.maxLength=40;ti.placeholder="গল্পের নাম (ঐচ্ছিক)";ti.setAttribute("aria-label","গল্পের নাম");c.appendChild(ti);
   var ta=document.createElement("textarea");ta.rows=3;ta.maxLength=300;ta.placeholder="প্রথম লাইনটা তুমি লেখো…";ta.setAttribute("aria-label","প্রথম লাইন");c.appendChild(ta);
   var b=LV.el("button","","গল্প শুরু করো ✨");b.onclick=function(){if(!ta.value.trim()){say("প্রথম লাইন লেখো।");return}startStory(ti.value.trim(),ta.value.trim())};c.appendChild(b)}
  else{
   c.appendChild(LV.el("div","serif",cur.title)).style.cssText="font-size:1.15rem;text-align:center";
   c.appendChild(LV.el("div","hint",cur.theme+" · "+bn(cur.lines.length)+" লাইন")).style.textAlign="center";
   cur.lines.forEach(function(l){c.appendChild(line(l))});
   if(cur.turn===WHO){
    var t2=document.createElement("textarea");t2.rows=3;t2.maxLength=300;t2.placeholder="পরের লাইন তোমার…";t2.setAttribute("aria-label","পরের লাইন");c.appendChild(t2);
    var s=LV.el("button","","লাইন যোগ করো ✍️");s.onclick=function(){if(!t2.value.trim()){say("কিছু লেখো।");return}addLine(t2.value.trim())};c.appendChild(s)}
   else c.appendChild(LV.el("p","hint","⏳ "+LV.pn()+"র পালা, ও লিখলে এখানে আসবে।")).style.textAlign="center";
   var r=LV.el("div","two");var f=LV.el("button","ghost","✅ গল্প শেষ করো");f.onclick=finish;var d=LV.el("button","ghost","🗑️ মুছে ফেলো");d.onclick=discard;r.appendChild(f);r.appendChild(d);c.appendChild(r)}
  var tb=LV.el("button","ghost",showA?"📚 আগের গল্প লুকাও":"📚 আগের গল্প দেখো");tb.style.marginTop="12px";
  tb.onclick=function(){showA=!showA;if(showA&&!arch)loadArch();render()};a.appendChild(tb);
  if(showA){
   if(!arch)a.appendChild(LV.el("p","hint","লোড হচ্ছে…"));
   else if(!arch.length)a.appendChild(LV.el("p","hint","এখনো কোনো সেভ করা গল্প নেই।"));
   else arch.forEach(function(s){
    var dt=document.createElement("details");var sm=document.createElement("summary");sm.textContent=s.title+" · "+fd(LV.day(new Date(s.t)));dt.appendChild(sm);
    dt.appendChild(LV.el("div","hint",s.theme+" · "+bn(s.lines.length)+" লাইন"));s.lines.forEach(function(l){dt.appendChild(line(l))});
    if(s.from===WHO){var x=LV.el("button","chip","🗑️ মুছো");x.onclick=function(){if(confirm("গল্পটা চিরতরে মুছবে?"))DB.collection("stories").doc(s.id).delete().then(function(){arch=null;loadArch()}).catch(function(e){say("সমস্যা: "+e.code)})};dt.appendChild(x)}
    a.appendChild(dt)})}}
 LV.onStart(function(){
  DB.doc("meta/story").onSnapshot(function(s){
   var was=cur;cur=s.exists?s.data():null;ld=true;err="";
   if(cur&&was&&cur.turn===WHO&&was.turn!==WHO&&!pn.classList.contains("on"))toast("📖 গল্পে তোমার পালা এসেছে",function(){goTab("games")});
   render()},function(e){err=e.code||"error";render()})});
})();
