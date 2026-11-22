/* ===== Mutual Interest Matching (💞 মিল খুঁজি) =====
   ডেটা:
   meta/match_{sagor|shima} → { a: { questionId: "y" | "m" | "n" | "s" } }  (প্রত্যেকে শুধু নিজেরটা লেখে)
   meta/match_q            → { custom: [{id, t, by}] }                     (দুজনেই প্রশ্ন যোগ করতে পারে)
   UI কখনো ওর কাঁচা উত্তর দেখায় না, শুধু মিল দেখায়:
     হ্যাঁ + হ্যাঁ            → 💗 দুজনেই রাজি
     হ্যাঁ/হয়তো + হ্যাঁ/হয়তো → 🌱 সম্ভাবনা আছে
     অন্য সব (না, এড়ানো, উত্তর নেই) → কিছুই দেখায় না
   সীমাবদ্ধতা: Rules দিয়ে আটকানো না থাকলে ডেভেলপার টুলে ওর কাঁচা ডেটা দেখা সম্ভব। */
(function(){
 var BI=[
  ["b1","🕯️ ভার্চুয়াল ক্যান্ডেললাইট ডিনার"],
  ["b2","🎬 একসঙ্গে মুভি দেখা"],
  ["b3","🎙️ ভয়েস মেসেজ পাঠানো"],
  ["b4","🤝 পরের দেখায় একসঙ্গে সারাদিন কাটানো"],
  ["b5","🎁 একে অপরকে সারপ্রাইজ দেওয়া"],
  ["b6","🎧 একসঙ্গে গান শোনা"],
  ["b7","📞 রাত জেগে লম্বা ফোনকল"],
  ["b8","🎮 একসাথে অনলাইনে গেম খেলা"],
  ["b9","💌 একে অপরকে হাতে লেখা চিঠি পাঠানো"],
  ["b10","🌄 পরের দেখায় কোথাও ঘুরতে যাওয়া"]];
 var LBL={y:"✅ হ্যাঁ",m:"🤔 হয়তো",n:"❌ না",s:"⏭️ এড়িয়েছি"};
 var mine={},part={},cq=[],ld={m:false,p:false,q:false},err="",view="a",ran=false,lastCnt=-1,lastLog=0;

 function el(tag,cls,t){var d=document.createElement(tag);if(cls)d.className=cls;if(t!=null)d.textContent=t;return d}
 var gm=$("gm"),gsec=$("games");
 var pn=el("div","panel card");pn.id="gmatch";
 pn.innerHTML='<div class="serif" style="font-size:1.2rem;text-align:center">💞 মিল খুঁজি</div>'+
  '<p class="hint" style="text-align:center;margin:4px 0 8px">দুজনে আলাদাভাবে উত্তর দাও। শুধু যেগুলোতে দুজনেই রাজি, সেগুলোই দেখা যাবে। ওর উত্তর কখনো দেখা যাবে না।</p>'+
  '<div class="chips" id="mxt"></div><div id="mxb"></div>'+
  '<details style="margin-top:12px"><summary>➕ নিজের প্রশ্ন যোগ করো</summary>'+
  '<input type="text" id="mxi" maxlength="80" placeholder="যেমন: একসাথে একটা সিরিজ শেষ করা"><button class="ghost" id="mxa">প্রশ্ন যোগ করো</button></details>'+
  '<p class="note" id="mxn"></p>';
 var cb=LV.panelChip(gm,gsec,"💞 মিল খুঁজি",pn,function(){render()});

 function say(t){$("mxn").textContent=t}
 function qs(){return BI.map(function(b){return{id:b[0],t:b[1]}}).concat(cq.map(function(c){return{id:c.id,t:c.t,c:c}}))}
 function kind(a,b){
  if(a==="y"&&b==="y")return "y";
  if((a==="y"||a==="m")&&(b==="y"||b==="m"))return "m";
  return null}
 function matches(){
  var r=[];qs().forEach(function(q){var k=kind(mine[q.id],part[q.id]);if(k)r.push({q:q,k:k})});
  r.sort(function(a,b){return a.k===b.k?0:a.k==="y"?-1:1});return r}

 function logT(){var n=Date.now();if(n-lastLog>600000){lastLog=n;logEv("মিল খোঁজার প্রশ্নে উত্তর দিয়েছে 💞","games")}}
 function save(id,v){
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  var o={};o[id]=v;
  DB.doc("meta/match_"+WHO).set({a:o},{merge:true}).then(function(){say("");logT()}).catch(function(e){say("সমস্যা: "+e.code)})}

 function tabs(){
  var box=$("mxt");box.innerHTML="";
  var n=matches().length;
  [["a","উত্তর দাও"],["m","💗 মিলেছে ("+bn(n)+")"],["r","আমার উত্তর"]].forEach(function(t){
   var b=el("button","chip"+(view===t[0]?" on":""),t[1]);b.onclick=function(){view=t[0];render()};box.appendChild(b)})}

 function ans(b){
  var rest=qs().filter(function(q){return !mine[q.id]});
  if(!rest.length){
   b.appendChild(el("p","serif","সবগুলোর উত্তর দেওয়া হয়ে গেছে 🎉"));
   b.appendChild(el("p","hint","নিচ থেকে নিজের প্রশ্ন যোগ করো, অথবা “মিলেছে” ট্যাবে দেখো।"));return}
  var q=rest[0];
  b.appendChild(el("div","hint","বাকি "+bn(rest.length)+"টা প্রশ্ন"));
  b.appendChild(el("div","hint","তোমার কি ভালো লাগবে?"));
  b.appendChild(el("p","serif",q.t)).style.cssText="font-size:1.35rem;margin:6px 0 12px";
  var g=el("div");g.style.cssText="display:grid;grid-template-columns:repeat(3,1fr);gap:8px";
  [["y","✅ হ্যাঁ"],["m","🤔 হয়তো"],["n","❌ না"]].forEach(function(o){
   var k=el("button",o[0]==="y"?"":"ghost",o[1]);k.style.padding="12px 4px";k.onclick=function(){save(q.id,o[0])};g.appendChild(k)});
  b.appendChild(g);
  var sk=el("button","ghost","⏭️ এড়িয়ে যাও");sk.style.marginTop="8px";sk.onclick=function(){save(q.id,"s")};b.appendChild(sk);
  b.appendChild(el("p","hint","না বা এড়িয়ে গেলে ওকে কিছুই জানানো হয় না।")).style.textAlign="center"}

 function mat(b){
  var m=matches();
  if(!m.length){
   b.appendChild(el("p","hint","এখনো কোনো মিল পাওয়া যায়নি। ও কিছু উত্তর দিলে মিল এখানে আসবে। ও উত্তর দিয়েছে কি না, এখান থেকে বোঝা যায় না।"));return}
  m.forEach(function(x){
   var c=el("div","card");c.style.cssText="margin:0 0 10px;border:1.5px solid "+(x.k==="y"?"var(--rose)":"var(--gold)");
   c.appendChild(el("div","hint",x.k==="y"?"💗 দুজনেই রাজি":"🌱 সম্ভাবনা আছে, কথা বলে দেখো"));
   c.appendChild(el("div","serif",x.q.t)).style.cssText="font-size:1.2rem;margin-top:4px";
   b.appendChild(c)})}

 function myA(b){
  qs().forEach(function(q){
   var row=el("div");row.style.cssText="border-top:1px solid var(--line);padding:8px 0";
   row.appendChild(el("div","",q.t));
   row.appendChild(el("div","hint","আমার উত্তর: "+(mine[q.id]?LBL[mine[q.id]]:"এখনো দিইনি")));
   var ch=el("div","chips");ch.style.cssText="justify-content:flex-start;margin:4px 0 0";
   [["y","হ্যাঁ"],["m","হয়তো"],["n","না"],["s","এড়াই"]].forEach(function(o){
    var k=el("button","chip"+(mine[q.id]===o[0]?" on":""),o[1]);k.style.cssText="padding:2px 10px;font-size:.9rem";k.onclick=function(){save(q.id,o[0])};ch.appendChild(k)});
   if(q.c){var d=el("button","chip","🗑️ প্রশ্ন মুছো");d.style.cssText="padding:2px 10px;font-size:.9rem";d.onclick=function(){delQ(q.c)};ch.appendChild(d)}
   row.appendChild(ch);b.appendChild(row)});
  var all=el("button","ghost","🗑️ আমার সব উত্তর মুছে ফেলো");all.style.marginTop="12px";
  all.onclick=function(){
   if(!DB||!confirm("তোমার সব উত্তর চিরতরে মুছে যাবে। মুছবে?"))return;
   DB.doc("meta/match_"+WHO).delete().then(function(){say("মোছা হয়েছে ✓")}).catch(function(e){say("সমস্যা: "+e.code)})};
  b.appendChild(all)}

 function render(){
  tabs();
  var b=$("mxb");b.innerHTML="";
  if(err){b.appendChild(el("p","hint","সমস্যা: "+err));return}
  if(!(ld.m&&ld.p&&ld.q)){b.appendChild(el("p","hint","লোড হচ্ছে…"));return}
  if(view==="a")ans(b);else if(view==="m")mat(b);else myA(b)}

 $("mxa").onclick=function(){
  var t=$("mxi").value.trim();
  if(!t)return;if(!DB||!WHO){say("আগে লগইন করো।");return}
  var o={id:"c"+Date.now().toString(36),t:t.slice(0,80),by:WHO};
  DB.doc("meta/match_q").set({custom:firebase.firestore.FieldValue.arrayUnion(o)},{merge:true})
   .then(function(){$("mxi").value="";say("প্রশ্ন যোগ হয়েছে ✓");logEv("মিল খোঁজায় নতুন প্রশ্ন যোগ করেছে ➕","games")}).catch(function(e){say("সমস্যা: "+e.code)})};
 function delQ(c){
  if(!DB||!confirm("“"+c.t+"” প্রশ্নটা দুজনের কাছ থেকেই মুছে যাবে। মুছবে?"))return;
  DB.doc("meta/match_q").update({custom:firebase.firestore.FieldValue.arrayRemove(c)}).then(function(){say("মোছা হয়েছে ✓")}).catch(function(e){say("সমস্যা: "+e.code)})}

 function changed(){
  var n=matches().length;
  if(lastCnt>=0&&n>lastCnt)toast("💞 নতুন একটা মিল পাওয়া গেছে!",function(){var t=document.querySelector('nav button[data-t="games"]');if(t)t.click();cb.click();view="m";render()});
  lastCnt=n;render()}

 var _s=start;
 start=function(){
  var was=ran;ran=true;_s();if(was)return;
  function fail(e){err=e.code||"error";render()}
  DB.doc("meta/match_"+WHO).onSnapshot(function(s){var d=s.data();mine=(d&&d.a)||{};ld.m=true;changed()},fail);
  DB.doc("meta/match_"+PW).onSnapshot(function(s){var d=s.data();part=(d&&d.a)||{};ld.p=true;changed()},fail);
  DB.doc("meta/match_q").onSnapshot(function(s){var d=s.data();cq=(d&&d.custom)||[];ld.q=true;changed()},fail)};
})();
