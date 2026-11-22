/* ===== নিজেদের কুপন (Custom Coupons) =====
   একজন কুপন বানিয়ে অন্যজনকে দেয়। গ্রহণকারী: গ্রহণ / না / এড়িয়ে যাও। গ্রহণ করলে (এবং সময় হলে) “ব্যবহার করো”।
   ঐচ্ছিক আনলক সময়: তার আগে গ্রহণকারী শুধু “🔒 সারপ্রাইজ কুপন” দেখে, শিরোনাম লুকানো থাকে (UI-তে)।
   ডেটা: coupons/{id} = { from, to, title, desc, t, unlock|null, st: pending|accepted|declined|redeemed|skipped, rt }
   বিদ্যমান ৬টা হার্ডকোড কুপন অক্ষত। 🔴 Red মুডে এই কার্ডও লুকায় (mood.js)। */
(function(){
 var list=[],err="",ld=false,ran=false;
 var card=LV.el("div","card");card.id="ccp";
 card.innerHTML='<div class="serif" style="font-size:1.2rem;margin-bottom:6px">🎟️ আমাদের নিজের কুপন</div>'+
  '<p class="hint" style="margin:0 0 8px">নিজের মতো কুপন বানিয়ে ওকে দাও। ও চাইলে নিতে পারে, না-ও নিতে পারে।</p>'+
  '<input type="text" id="cct" maxlength="60" placeholder="কুপনের নাম (যেমন: ভার্চুয়াল মুভি নাইট)">'+
  '<input type="text" id="ccd" maxlength="120" placeholder="ছোট বিবরণ (ঐচ্ছিক)">'+
  '<span class="hint">কবে খুলবে? (ঐচ্ছিক, না দিলে এখনই)</span><input type="datetime-local" id="ccu" aria-label="খোলার সময়" class="lvs">'+
  '<button id="ccb">কুপন দাও 🎁</button><p class="note" id="ccn"></p><div id="ccl"></div>';
 var cps=$("cps"),h=cps.previousElementSibling;h.insertAdjacentElement("beforebegin",card);
 function say(t){$("ccn").textContent=t}
 function lockedFor(c){return c.to===WHO&&c.unlock&&c.unlock>Date.now()}
 var ST={pending:"⏳ অপেক্ষায়",accepted:"✅ গ্রহণ করেছে",declined:"❌ নেয়নি",redeemed:"🎉 ব্যবহার হয়েছে",skipped:"⏭️ এড়িয়ে গেছে"};

 $("ccb").onclick=function(){
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  var t=$("cct").value.trim();if(!t){say("কুপনের নাম লেখো।");return}
  var u=$("ccu").value?new Date($("ccu").value).getTime():null;
  if(u&&isNaN(u)){say("সময়টা ঠিক নেই।");return}
  DB.collection("coupons").add({from:WHO,to:PW,title:t.slice(0,60),desc:$("ccd").value.trim().slice(0,120),t:Date.now(),unlock:u,st:"pending",rt:null})
   .then(function(){$("cct").value="";$("ccd").value="";$("ccu").value="";say("কুপন দেওয়া হয়েছে ✓");logEv("নতুন একটা কুপন দিয়েছে 🎟️","love")}).catch(function(e){say("সমস্যা: "+e.code)})};

 function setSt(c,s,ev){DB.collection("coupons").doc(c.id).update({st:s,rt:Date.now()}).then(function(){if(ev)logEv(ev,"love")}).catch(function(e){say("সমস্যা: "+e.code)})}
 function del(c){if(!confirm("কুপনটা মুছে ফেলবে?"))return;DB.collection("coupons").doc(c.id).delete().catch(function(e){say("সমস্যা: "+e.code)})}
 function row(c){
  var d=LV.el("div","card ticket"),lk=lockedFor(c),mineTo=c.to===WHO;
  d.style.margin="0 0 8px";
  var p=LV.el("div");p.style.flex="1";
  if(lk){p.appendChild(LV.el("b","","🔒 একটা সারপ্রাইজ কুপন"));p.appendChild(LV.el("div","hint","খুলবে: "+ft(c.unlock)))}
  else{p.appendChild(LV.el("b","",c.title));if(c.desc)p.appendChild(LV.el("div","hint",c.desc));
   if(c.unlock&&c.unlock>Date.now())p.appendChild(LV.el("div","hint","🔒 খুলবে: "+ft(c.unlock)))}
  p.appendChild(LV.el("div","hint",(mineTo?LV.pn()+" দিয়েছে":"আমি দিয়েছি")+" · "+ST[c.st]));
  d.appendChild(p);
  var a=LV.el("div");a.style.cssText="display:flex;flex-direction:column;gap:6px";
  function btn(t,fn,g){var b=LV.el("button",g?"ghost":"",t);b.style.cssText="width:auto;padding:6px 12px;font-size:.9rem";b.onclick=fn;a.appendChild(b)}
  if(mineTo){
   if(c.st==="pending"){btn("✅ গ্রহণ",function(){setSt(c,"accepted","কুপন গ্রহণ করেছে ✅")});btn("❌ না",function(){setSt(c,"declined","কুপন নেয়নি")},1);btn("⏭️ এড়াও",function(){setSt(c,"skipped")},1)}
   else if(c.st==="accepted"){if(lk||(c.unlock&&c.unlock>Date.now())){}else btn("🎉 ব্যবহার করো",function(){setSt(c,"redeemed","একটা কুপন ব্যবহার করেছে 🎉");burst()})}}
  else if(c.from===WHO)btn("🗑️ মুছো",function(){del(c)},1);
  if(a.children.length)d.appendChild(a);
  if(c.st==="declined"||c.st==="skipped"||c.st==="redeemed")d.classList.add("used");
  return d}
 function render(){
  var b=$("ccl");b.innerHTML="";
  if(err){b.appendChild(LV.el("p","hint","সমস্যা: "+err));return}
  if(!ld){b.appendChild(LV.el("p","hint","লোড হচ্ছে…"));return}
  if(!list.length){b.appendChild(LV.el("p","hint","এখনো কোনো কুপন নেই। প্রথমটা তুমিই দাও 💞"));return}
  var tome=list.filter(function(c){return c.to===WHO}),byme=list.filter(function(c){return c.from===WHO});
  if(tome.length){b.appendChild(LV.el("div","serif","আমার জন্য")).style.cssText="font-size:1.05rem;margin:10px 0 6px";tome.forEach(function(c){b.appendChild(row(c))})}
  if(byme.length){b.appendChild(LV.el("div","serif","আমার দেওয়া")).style.cssText="font-size:1.05rem;margin:10px 0 6px";byme.forEach(function(c){b.appendChild(row(c))})}}
 setInterval(function(){if(ld)render()},30000);
 LV.onStart(function(){
  var first=true;
  DB.collection("coupons").orderBy("t","desc").limit(60).onSnapshot(function(qs){
   var a=[];qs.forEach(function(d){var x=d.data();x.id=d.id;a.push(x)});list=a;ld=true;err="";
   if(!first)qs.docChanges().forEach(function(ch){if(ch.type==="added"){var x=ch.doc.data();if(x.to===WHO&&x.t>bootT)toast("🎟️ "+LV.pn()+" একটা কুপন দিয়েছে",function(){goTab("love")})}});
   first=false;render()},function(e){err=e.code||"error";render()})});
 render();
})();
