/* ===== Two-Person Quiz (🧠 দুজনের কুইজ) =====
   একজন প্রশ্ন বানিয়ে (২–৪ অপশন) নিজের উত্তর বেছে নেয়, অন্যজন অনুমান করে, মিললে অনুমানকারী ১ পয়েন্ট পায়।
   ডেটা (প্রত্যেকে শুধু নিজের ডকুমেন্টে লেখে, তাই ওভাররাইটের ঝামেলা নেই):
   meta/quiz_{who}  → { items: { id: { q, o:[...], a:index, t } } }   (who-র বানানো প্রশ্ন)
   meta/quizg_{who} → { g: { id: guessIndex } }                         (who-র করা অনুমান)
   স্কোর আলাদা সংরক্ষণ হয় না, প্রতিবার হিসাব করা হয়। প্রশ্ন মুছলে তার পয়েন্টও চলে যায়।
   সীমাবদ্ধতা: ওর উত্তর প্রযুক্তিগতভাবে ডেভেলপার টুলে দেখা সম্ভব (UI অনুমানের আগে দেখায় না)। */
(function(){
 var MAXQ=100;
 var mi={},pi={},mg={},pg={},ld={a:false,b:false,c:false,d:false},err="",view="p",ran=false,lastN=-1,lastLog=0,lastId=null;
 function el(tag,cls,t){var d=document.createElement(tag);if(cls)d.className=cls;if(t!=null)d.textContent=t;return d}
 var gm=$("gm"),gsec=$("games");

 var st=document.createElement("style");
 st.textContent="select.dus{width:100%;border:1.5px solid var(--line);background:var(--glass);color:var(--ink);border-radius:14px;padding:11px 14px;font:inherit;margin:8px 0}"+
  ".duo{display:block;width:100%;text-align:left;margin:0 0 8px;font-weight:400}"+
  ".dur{border-top:1px solid var(--line);padding:8px 0;font-size:.97rem}";
 document.head.appendChild(st);

 var pn=el("div","panel card");pn.id="g10";
 pn.innerHTML='<div class="serif" style="font-size:1.2rem;text-align:center">🧠 দুজনের কুইজ</div>'+
  '<div class="score" id="dusc" style="margin:4px 0"></div>'+
  '<p class="hint" style="text-align:center;margin:0 0 8px">একজন প্রশ্ন বানায় ও নিজের উত্তর বেছে নেয়, অন্যজন অনুমান করে। মিললে অনুমানকারী ১ পয়েন্ট পায়।</p>'+
  '<div class="chips" id="dut"></div><div id="dub"></div>'+
  '<div id="duf" style="display:none"><input type="text" id="duq" maxlength="120" placeholder="প্রশ্ন (যেমন: আমার প্রিয় ঋতু কোনটা?)">'+
  '<input type="text" id="duo0" maxlength="40" placeholder="অপশন ১"><input type="text" id="duo1" maxlength="40" placeholder="অপশন ২">'+
  '<input type="text" id="duo2" maxlength="40" placeholder="অপশন ৩ (ঐচ্ছিক)"><input type="text" id="duo3" maxlength="40" placeholder="অপশন ৪ (ঐচ্ছিক)">'+
  '<select class="dus" id="dua" aria-label="আমার উত্তর"><option value="0">আমার উত্তর: অপশন ১</option><option value="1">আমার উত্তর: অপশন ২</option><option value="2">আমার উত্তর: অপশন ৩</option><option value="3">আমার উত্তর: অপশন ৪</option></select>'+
  '<button id="duc">প্রশ্ন পাঠাও 🧠</button></div><p class="note" id="dun"></p>';
 var cb=LV.panelChip(gm,gsec,"🧠 দুজনের কুইজ",pn,function(){render()});

 function say(t){$("dun").textContent=t}
 function pname(){return (typeof PW!=="undefined"&&PW&&PN[PW])?PN[PW]:"ও"}
 function arr(m){return Object.keys(m||{}).map(function(k){var o=m[k];return{id:k,x:o}}).sort(function(a,b){return a.x.t-b.x.t})}
 function scores(){
  var me=0,pt=0;
  arr(pi).forEach(function(o){if(mg[o.id]!==undefined&&mg[o.id]===o.x.a)me++});
  arr(mi).forEach(function(o){if(pg[o.id]!==undefined&&pg[o.id]===o.x.a)pt++});
  return{me:me,pt:pt}}
 function logT(t){var n=Date.now();if(n-lastLog>600000){lastLog=n;logEv(t,"games")}}

 function tabs(){
  var box=$("dut");box.innerHTML="";
  var todo=arr(pi).filter(function(o){return mg[o.id]===undefined}).length;
  [["p","খেলো"+(todo?" ("+bn(todo)+")":"")],["c","প্রশ্ন বানাও"],["m","আমার প্রশ্ন"]].forEach(function(t){
   var b=el("button","chip"+(view===t[0]?" on":""),t[1]);b.onclick=function(){view=t[0];render()};box.appendChild(b)})}

 function guess(id,i){
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  var o={};o[id]=i;lastId=id;
  DB.doc("meta/quizg_"+WHO).set({g:o},{merge:true}).then(function(){say("");logT("কুইজে অনুমান করেছে 🧠")}).catch(function(e){say("সমস্যা: "+e.code)})}

 function play(b){
  /* এইমাত্র দেওয়া অনুমানের ফল */
  if(lastId&&pi[lastId]&&mg[lastId]!==undefined){
   var x=pi[lastId],ok=mg[lastId]===x.a,c=el("div","card");c.style.cssText="margin:0 0 10px;border:1.5px solid "+(ok?"var(--rose)":"var(--line)");
   c.appendChild(el("div","serif",ok?"✅ মিলেছে! +১ পয়েন্ট":"❌ মেলেনি"));
   c.appendChild(el("div","hint",x.q));
   c.appendChild(el("div","hint","তোমার অনুমান: "+x.o[mg[lastId]]+" · "+pname()+"র উত্তর: "+x.o[x.a]));
   b.appendChild(c)}
  var rest=arr(pi).filter(function(o){return mg[o.id]===undefined});
  if(!rest.length){
   b.appendChild(el("p","hint",arr(pi).length?pname()+"র সব প্রশ্নের উত্তর দেওয়া হয়ে গেছে 🎉 ও নতুন প্রশ্ন বানালে এখানে আসবে।":pname()+" এখনো কোনো প্রশ্ন বানায়নি। তুমিই আগে বানাও!"))}
  else{
   var q=rest[0];
   b.appendChild(el("div","hint",pname()+"র প্রশ্ন · বাকি "+bn(rest.length)+"টা"));
   b.appendChild(el("p","serif",q.x.q)).style.cssText="font-size:1.3rem;margin:6px 0 12px";
   b.appendChild(el("div","hint","ও কোনটা বেছেছে বলে তোমার মনে হয়?"));
   q.x.o.forEach(function(t,i){var k=el("button","ghost duo",t);k.style.marginTop="8px";k.onclick=function(){guess(q.id,i)};b.appendChild(k)})}
  var hist=arr(pi).filter(function(o){return mg[o.id]!==undefined&&o.id!==lastId}).reverse();
  if(hist.length){
   b.appendChild(el("div","serif","আগের প্রশ্ন")).style.cssText="font-size:1.1rem;margin:14px 0 4px";
   hist.slice(0,15).forEach(function(o){
    var ok=mg[o.id]===o.x.a,r=el("div","dur");
    r.appendChild(el("div","",(ok?"✅ ":"❌ ")+o.x.q));
    r.appendChild(el("div","hint","তোমার অনুমান: "+o.x.o[mg[o.id]]+" · "+pname()+"র উত্তর: "+o.x.o[o.x.a]));b.appendChild(r)})}}

 function mine(b){
  var a=arr(mi).reverse();
  if(!a.length){b.appendChild(el("p","hint","তুমি এখনো কোনো প্রশ্ন বানাওনি। “প্রশ্ন বানাও” ট্যাবে গিয়ে বানাও।"));return}
  a.forEach(function(o){
   var r=el("div","dur"),g=pg[o.id];
   r.appendChild(el("div","",o.x.q));
   r.appendChild(el("div","hint","আমার উত্তর: "+o.x.o[o.x.a]));
   r.appendChild(el("div","hint",g===undefined?pname()+" এখনো অনুমান করেনি":pname()+"র অনুমান: "+o.x.o[g]+(g===o.x.a?" ✅ মিলেছে":" ❌ মেলেনি")));
   var d=el("button","chip","🗑️ মুছো");d.style.cssText="padding:2px 10px;font-size:.9rem;margin-top:4px";d.onclick=function(){del(o)};r.appendChild(d);b.appendChild(r)})}

 function del(o){
  if(!DB||!confirm("এই প্রশ্নটা (ও এর পয়েন্ট) দুজনের কাছ থেকেই মুছে যাবে। মুছবে?"))return;
  var u={};u["items."+o.id]=firebase.firestore.FieldValue.delete();
  DB.doc("meta/quiz_"+WHO).update(u).then(function(){say("মোছা হয়েছে ✓")}).catch(function(e){say("সমস্যা: "+e.code)})}

 $("duc").onclick=function(){
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  var q=$("duq").value.trim(),opts=[],map=[];
  for(var i=0;i<4;i++){var v=$("duo"+i).value.trim();if(v){map[i]=opts.length;opts.push(v.slice(0,40))}else map[i]=-1}
  if(!q){say("প্রশ্নটা লেখো।");return}
  if(opts.length<2){say("কমপক্ষে ২টা অপশন দাও।");return}
  var sel=map[+$("dua").value];
  if(sel<0){say("যে অপশনটা বেছেছো সেটা ফাঁকা রয়েছে, অন্য অপশন বেছে নাও।");return}
  if(Object.keys(mi).length>=MAXQ){say("প্রশ্ন অনেক হয়ে গেছে ("+bn(MAXQ)+"), পুরোনো কিছু মুছে ফেলো।");return}
  var id="q"+Date.now().toString(36),it={};it[id]={q:q.slice(0,120),o:opts,a:sel,t:Date.now()};
  $("duc").disabled=true;
  DB.doc("meta/quiz_"+WHO).set({items:it},{merge:true}).then(function(){
   $("duc").disabled=false;["duq","duo0","duo1","duo2","duo3"].forEach(function(k){$(k).value=""});$("dua").value="0";
   say("প্রশ্ন পাঠানো হয়েছে ✓");logT("কুইজের নতুন প্রশ্ন বানিয়েছে 🧠");view="m";render()
  }).catch(function(e){$("duc").disabled=false;say("সমস্যা: "+e.code)})};

 function render(){
  tabs();
  var s=scores();$("dusc").textContent=PN.sagor&&WHO?(WHO==="sagor"?"তুমি "+bn(s.me)+" - "+bn(s.pt)+" "+pname():pname()+" "+bn(s.pt)+" - "+bn(s.me)+" তুমি"):"";
  $("duf").style.display=view==="c"?"block":"none";
  var b=$("dub");b.innerHTML="";
  if(view==="c")return;
  if(err){b.appendChild(el("p","hint","সমস্যা: "+err));return}
  if(!(ld.a&&ld.b&&ld.c&&ld.d)){b.appendChild(el("p","hint","লোড হচ্ছে…"));return}
  if(view==="p")play(b);else mine(b)}

 function changed(){
  var n=arr(pi).length;
  if(lastN>=0&&n>lastN)toast("🧠 "+pname()+" একটা নতুন কুইজ প্রশ্ন পাঠিয়েছে!",function(){var t=document.querySelector('nav button[data-t="games"]');if(t)t.click();cb.click();view="p";render()});
  lastN=n;render()}

 var _s=start;
 start=function(){
  var was=ran;ran=true;_s();if(was)return;
  function fail(e){err=e.code||"error";render()}
  DB.doc("meta/quiz_"+WHO).onSnapshot(function(s){var d=s.data();mi=(d&&d.items)||{};ld.a=true;render()},fail);
  DB.doc("meta/quiz_"+PW).onSnapshot(function(s){var d=s.data();pi=(d&&d.items)||{};ld.b=true;changed()},fail);
  DB.doc("meta/quizg_"+WHO).onSnapshot(function(s){var d=s.data();mg=(d&&d.g)||{};ld.c=true;render()},fail);
  DB.doc("meta/quizg_"+PW).onSnapshot(function(s){var d=s.data();pg=(d&&d.g)||{};ld.d=true;render()},fail)};
})();
