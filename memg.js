/* ===== স্মৃতি অনুমান খেলা =====
   একজন একটা স্মৃতি বা ছবি দেয় (প্রশ্নসহ: কোথায়? কবে? কী প্রসঙ্গ?) ও নিজের উত্তর লিখে রাখে। অন্যজন অনুমান করে।
   উত্তর অনুমান দেওয়ার আগে (এবং বিচারের আগে) UI-তে লুকানো থাকে। “কবে” প্রশ্নে তারিখ হুবহু মিললে নিজে নিজে ✅।
   বাকিগুলো যে দিয়েছে সে বিচার করে: ✅ মিলেছে (১ পয়েন্ট) / 🟡 কাছাকাছি (০.৫) / ❌ মেলেনি।
   ডেটা: memgame/{id} = { from, t, type, q, img?, ans, guess|null, gt, verdict|null }
   ছবি ৭০০ পিক্সেলে সংকুচিত (~১২০ KB), সর্বোচ্চ শেষ ১০টা প্রশ্ন লোড হয়। স্টোরেজ ম্যানেজার থেকেও মোছা যায়। */
(function(){
 var TYPES=[["where","📍 কোথায়?"],["when","📅 কবে?"],["what","💭 কী প্রসঙ্গ?"]];
 var list=[],ld=false,err="",ty=0,img=null,ran=false;
 var pn=LV.el("div","panel card");pn.id="gmem";
 pn.innerHTML='<div class="serif" style="text-align:center;font-size:1.2rem">🧠 স্মৃতি অনুমান</div><div class="score" id="mgs"></div>'+
  '<details><summary>➕ নতুন প্রশ্ন বানাও</summary><div class="chips" id="mgt"></div>'+
  '<input type="text" id="mgq" maxlength="100" placeholder="প্রশ্ন (যেমন: এই ছবিটা কোথায় তোলা?)">'+
  '<label class="btn" for="mgf" style="margin:0 0 8px">📷 ছবি (ঐচ্ছিক)</label><input type="file" id="mgf" accept="image/*"><div id="mgp" style="display:none"><img id="mgi" alt="নির্বাচিত ছবি" style="width:100%;border-radius:12px"></div>'+
  '<div id="mga"></div><button id="mgb">প্রশ্ন পাঠাও 🧠</button></details><p class="note" id="mgn"></p><div id="mgl"></div>';
 LV.panelChip($("gm"),$("games"),"🧠 স্মৃতি অনুমান",pn,function(){render()});
 function say(t){$("mgn").textContent=t}
 function ansField(){
  var b=$("mga");b.innerHTML="";var i=document.createElement("input");i.id="mgx";i.setAttribute("aria-label","আমার উত্তর");
  if(TYPES[ty][0]==="when"){i.type="date"}else{i.type="text";i.maxLength=80;i.placeholder="আমার উত্তর (এখন লুকানো থাকবে)"}b.appendChild(i)}
 chips("mgt",TYPES.map(function(t){return t[1]}),function(i){ty=i;ansField()},0);ansField();
 $("mgf").onchange=function(){var f=this.files&&this.files[0];if(!f)return;say("ছবি ছোট করা হচ্ছে…");
  LV.compress(f,700,.7,120000).then(function(d){img=d;$("mgi").src=d;$("mgp").style.display="block";say("")}).catch(function(){img=null;say("এই ছবিটা ছোট করা যায়নি।")})};
 $("mgb").onclick=function(){
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  var q=$("mgq").value.trim(),a=$("mgx").value.trim();
  if(!q||!a){say("প্রশ্ন ও নিজের উত্তর দুটোই দাও।");return}
  var o={from:WHO,t:Date.now(),type:TYPES[ty][0],q:q,ans:a,guess:null,gt:null,verdict:null};if(img)o.img=img;
  $("mgb").disabled=true;
  DB.collection("memgame").add(o).then(function(){$("mgb").disabled=false;$("mgq").value="";$("mgx").value="";img=null;$("mgp").style.display="none";$("mgf").value="";say("পাঠানো হয়েছে ✓");logEv("স্মৃতি অনুমানে নতুন প্রশ্ন দিয়েছে 🧠","games")}).catch(function(e){$("mgb").disabled=false;say("সমস্যা: "+e.code)})};

 function pts(who){var s=0;list.forEach(function(x){if(x.from!==who&&x.verdict)s+=x.verdict==="y"?1:x.verdict==="p"?.5:0});return s}
 function guess(x,v){
  if(!v)return;var ok=x.type==="when"&&v===x.ans;
  var u={guess:v.slice(0,80),gt:Date.now()};if(ok)u.verdict="y";
  DB.collection("memgame").doc(x.id).update(u).then(function(){logEv("স্মৃতির প্রশ্নে অনুমান দিয়েছে 🧠","games")}).catch(function(e){say("সমস্যা: "+e.code)})}
 function judge(x,v){DB.collection("memgame").doc(x.id).update({verdict:v}).then(function(){logEv("অনুমানের ফল জানিয়েছে 🧠","games")}).catch(function(e){say("সমস্যা: "+e.code)})}
 function del(x){if(confirm("প্রশ্নটা মুছে ফেলবে?"))DB.collection("memgame").doc(x.id).delete().catch(function(e){say("সমস্যা: "+e.code)})}
 var VT={y:"✅ মিলেছে",p:"🟡 কাছাকাছি",n:"❌ মেলেনি"};
 function fmt(x,v){return x.type==="when"&&/^\d{4}-\d\d-\d\d$/.test(v)?fd(v):v}
 function render(){
  var b=$("mgl");b.innerHTML="";
  $("mgs").textContent=ld?"তুমি "+bn(pts(PW))+" · "+LV.pn()+" "+bn(pts(WHO))+" পয়েন্ট (অনুমান থেকে)":"";
  if(err){b.appendChild(LV.el("p","hint","সমস্যা: "+err));return}
  if(!ld){b.appendChild(LV.el("p","hint","লোড হচ্ছে…"));return}
  if(!list.length){b.appendChild(LV.el("p","hint","এখনো কোনো প্রশ্ন নেই। একটা স্মৃতি দিয়ে শুরু করো 💞"));return}
  list.forEach(function(x){
   var c=LV.el("div","card");c.style.margin="0 0 10px";var mine=x.from===WHO;
   c.appendChild(LV.el("div","hint",(mine?"আমার প্রশ্ন":LV.pn()+"র প্রশ্ন")+" · "+(TYPES.filter(function(t){return t[0]===x.type})[0]||[0,""])[1]));
   if(x.img){var im=document.createElement("img");im.src=x.img;im.alt="স্মৃতির ছবি";im.style.cssText="width:100%;border-radius:12px;margin:6px 0";c.appendChild(im)}
   c.appendChild(LV.el("div","serif",x.q)).style.fontSize="1.1rem";
   if(mine){
    c.appendChild(LV.el("div","hint","আমার উত্তর: "+fmt(x,x.ans)));
    if(x.guess==null)c.appendChild(LV.el("div","hint","⏳ "+LV.pn()+" এখনো অনুমান করেনি"));
    else{c.appendChild(LV.el("div","",LV.pn()+"র অনুমান: "+fmt(x,x.guess)));
     if(!x.verdict){c.appendChild(LV.el("div","hint","মিলেছে কি না বিচার করো:"));var r=LV.el("div","chips");r.style.justifyContent="flex-start";
      [["y","✅ মিলেছে"],["p","🟡 কাছাকাছি"],["n","❌ মেলেনি"]].forEach(function(o){var k=LV.el("button","chip",o[1]);k.onclick=function(){judge(x,o[0])};r.appendChild(k)});c.appendChild(r)}
     else c.appendChild(LV.el("div","",VT[x.verdict]))}
    var d=LV.el("button","chip","🗑️ মুছো");d.onclick=function(){del(x)};c.appendChild(d)}
   else{
    if(x.guess==null){
     var i=document.createElement("input");i.setAttribute("aria-label","আমার অনুমান");
     if(x.type==="when")i.type="date";else{i.type="text";i.maxLength=80;i.placeholder="তোমার অনুমান"}c.appendChild(i);
     var s=LV.el("button","","অনুমান পাঠাও");s.onclick=function(){guess(x,i.value.trim())};c.appendChild(s)}
    else{c.appendChild(LV.el("div","",x.verdict?"তোমার অনুমান: "+fmt(x,x.guess):"তোমার অনুমান: "+fmt(x,x.guess)));
     if(!x.verdict)c.appendChild(LV.el("div","hint","⏳ "+LV.pn()+"র বিচারের অপেক্ষা"));
     else{c.appendChild(LV.el("div","",VT[x.verdict]));c.appendChild(LV.el("div","hint","আসল উত্তর: "+fmt(x,x.ans)))}}}
   b.appendChild(c)})}
 LV.onStart(function(){
  var first=true;
  DB.collection("memgame").orderBy("t","desc").limit(10).onSnapshot(function(qs){
   var a=[];qs.forEach(function(d){var x=d.data();x.id=d.id;a.push(x)});list=a;ld=true;err="";
   if(!first)qs.docChanges().forEach(function(ch){var x=ch.doc.data();if(x.t<=bootT)return;
    if(ch.type==="added"&&x.from!==WHO)toast("🧠 "+LV.pn()+" একটা স্মৃতির প্রশ্ন দিয়েছে",function(){goTab("games")})});
   first=false;render()},function(e){err=e.code||"error";render()})});
})();
