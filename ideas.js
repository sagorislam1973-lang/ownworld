/* ===== ভিডিও কল ডেট আইডিয়া =====
   নিজস্ব ভিডিও কল নেই। বাইরের যেকোনো কল লিংক (Meet, Zoom, WhatsApp ইত্যাদি) একবার সেভ করলে দুজনের কাছেই “কলে যাও” বোতাম আসে।
   ক্যাটেগরি, র‍্যান্ডম আইডিয়া, ঐচ্ছিক টাইমার, প্রশ্নের তালিকা, এড়িয়ে যাওয়া, নিজের আইডিয়া যোগ।
   ডেটা: meta/ideas = { list:[{id,c,x,by}] }  (নিজেদের আইডিয়া),  meta/calllink = { url, by } */
(function(){
 var CATS={
  "💞 রোম্যান্টিক":["ভার্চুয়াল ক্যান্ডেললাইট ডিনার: দুজনেই সাজগোজ করে একই সময়ে খেতে বসো","একে অপরকে ১০টা বৈশিষ্ট্য বলো যা তোমার ভালো লাগে","দেখা হলে কী কী করবে তার একটা স্বপ্নের দিন পরিকল্পনা করো","একে অপরের জন্য কয়েক লাইনের চিঠি লিখে পড়ে শোনাও","চোখে চোখ রেখে ১ মিনিট কিছু না বলে তাকিয়ে থাকো"],
  "🎬 একসাথে দেখি/শুনি":["একসাথে একটা মুভি দেখো (একই সময়ে প্লে চাপো, কল চালু রেখো)","এক এক করে নিজের প্রিয় গান শোনাও ও কেন প্রিয় বলো","একটা ছোট ডকুমেন্টারি বা ইউটিউব ভিডিও একসাথে দেখো","পুরোনো ছবি স্ক্রিন শেয়ার করে দেখো"],
  "🎮 মজার":["একটা অনলাইন গেম খেলো (স্ক্রিবল, ট্রিভিয়া)","পাঁচ মিনিটে একে অপরের ছবি আঁকো, তারপর দেখাও","এক শব্দে গল্প: একজন একটা শব্দ বলে, পরের জন পরেরটা","কে কত ভালো মুখভঙ্গি করতে পারে, প্রতিযোগিতা"],
  "🍳 একসাথে করি":["একই রেসিপি দুজনে রান্না করো কল চালু রেখে","একসাথে ব্যায়াম বা স্ট্রেচিং করো","একসাথে পড়াশোনা: ক্যামেরা চালু রেখে ৪৫ মিনিট, তারপর বিরতি","একসাথে ঘর বা টেবিল গোছাও"]};
 var QS=["ছোটবেলার সবচেয়ে মজার স্মৃতি কোনটা?","আমাদের প্রথম দেখার দিনটা তোমার কেমন মনে আছে?","পাঁচ বছর পর আমাদের কেমন দেখতে চাও?","এমন কী আছে যা আমাকে এখনো বলোনি?","কোন গানটা শুনলে আমার কথা মনে পড়ে?","আমাদের সবচেয়ে প্রিয় স্মৃতি কোনটা?","তোমার সবচেয়ে বড় স্বপ্ন কী?","একটা দিন যা খুশি করতে পারলে কী করতে?","আমার কোন অভ্যাসটা তোমার সবচেয়ে ভালো লাগে?","জীবনের কোন সিদ্ধান্তটা বদলাতে চাও?"];
 var custom=[],link=null,cat=Object.keys(CATS)[0],cur="",tmr=null,left=0,ld=false,err="",ran=false;
 var pn=LV.el("div","panel card");pn.id="gidea";
 pn.innerHTML='<div class="serif" style="text-align:center;font-size:1.2rem">💻 ভিডিও কল ডেট আইডিয়া</div><div id="ivl" style="margin:8px 0"></div>'+
  '<div class="chips" id="ivc"></div><div class="card" id="ivd" style="margin:0 0 10px;text-align:center;min-height:90px;display:flex;align-items:center;justify-content:center"><span class="hint">নিচের বোতামে একটা আইডিয়া নাও</span></div>'+
  '<div class="two"><button id="ivr">🎲 র‍্যান্ডম আইডিয়া</button><button class="ghost" id="ivs">⏭️ এড়িয়ে যাও</button></div>'+
  '<div class="two"><button class="ghost" id="ivq">❓ একটা প্রশ্ন</button><button class="ghost" id="ivt">⏱️ টাইমার</button></div><div id="ivm" class="score"></div>'+
  '<details style="margin-top:10px"><summary>➕ নিজের আইডিয়া</summary><input type="text" id="ivi" maxlength="100" placeholder="নিজের কাজের আইডিয়া"><button class="ghost" id="iva">যোগ করো</button><div id="ivx"></div></details><p class="note" id="ivn"></p>';
 LV.panelChip($("gm"),$("games"),"💻 ভিডিও কল আইডিয়া",pn,function(){render()});
 function say(t){$("ivn").textContent=t}
 function all(){var a=[];Object.keys(CATS).forEach(function(k){if(k===cat||false)CATS[k].forEach(function(x){a.push(x)})});custom.forEach(function(c){if(c.c===cat)a.push(c.x)});return a}
 function show(t){var d=$("ivd");d.innerHTML="";d.appendChild(LV.el("div","serif",t)).style.cssText="font-size:1.2rem;line-height:1.6;padding:6px";cur=t}
 function rnd(list){return list[Math.floor(Math.random()*list.length)]}
 function next(list){var t,n=0;do{t=rnd(list);n++}while(t===cur&&n<8&&list.length>1);show(t)}
 $("ivr").onclick=function(){var a=all();if(!a.length){say("এই ক্যাটেগরিতে কিছু নেই");return}next(a)};
 $("ivs").onclick=function(){$("ivr").click()};
 $("ivq").onclick=function(){next(QS)};
 $("ivt").onclick=function(){
  if(tmr){clearInterval(tmr);tmr=null;$("ivm").textContent="";$("ivt").textContent="⏱️ টাইমার";return}
  var m=prompt("কত মিনিটের টাইমার? (১–১২০)","10");if(m===null)return;m=parseInt(m,10);if(!(m>=1&&m<=120)){say("১ থেকে ১২০ মিনিট দাও।");return}
  left=m*60;$("ivt").textContent="⏹️ টাইমার বন্ধ";
  function tick(){var mm=Math.floor(left/60),ss=left%60;$("ivm").textContent="⏱️ "+bn(mm)+":"+(ss<10?"০"+bn(ss):bn(ss));
   if(left--<=0){clearInterval(tmr);tmr=null;$("ivm").textContent="⏰ সময় শেষ!";$("ivt").textContent="⏱️ টাইমার";try{navigator.vibrate&&navigator.vibrate([300,150,300])}catch(e){}toast("⏰ ভিডিও কল টাইমার শেষ")}}
  tick();tmr=setInterval(tick,1000)};
 $("iva").onclick=function(){
  var t=$("ivi").value.trim();if(!t)return;if(!DB||!WHO){say("আগে লগইন করো।");return}
  var o={id:"i"+Date.now().toString(36),c:cat,x:t.slice(0,100),by:WHO};
  DB.doc("meta/ideas").set({list:firebase.firestore.FieldValue.arrayUnion(o)},{merge:true}).then(function(){$("ivi").value="";say("যোগ হয়েছে ✓")}).catch(function(e){say("সমস্যা: "+e.code)})};
 function delC(o){if(!confirm("আইডিয়াটা মুছবে?"))return;DB.doc("meta/ideas").update({list:firebase.firestore.FieldValue.arrayRemove(o)}).catch(function(e){say("সমস্যা: "+e.code)})}
 function safe(u){try{var x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:null}catch(e){return null}}
 function render(){
  var c=$("ivc");c.innerHTML="";Object.keys(CATS).forEach(function(k){var b=LV.el("button","chip"+(k===cat?" on":""),k);b.onclick=function(){cat=k;render()};c.appendChild(b)});
  var x=$("ivx");x.innerHTML="";custom.filter(function(o){return o.c===cat}).forEach(function(o){var r=LV.el("div","lvr",o.x+"  ");if(o.by===WHO){var d=LV.el("button","chip","🗑️");d.setAttribute("aria-label","মুছো");d.onclick=function(){delC(o)};r.appendChild(d)}x.appendChild(r)});
  var l=$("ivl");l.innerHTML="";
  var u=link&&safe(link.url);
  if(u){var a=LV.el("a","","📞 ভিডিও কলে যাও");a.href=u;a.target="_blank";a.rel="noopener noreferrer";a.style.cssText="display:block;text-align:center;background:var(--rose);color:#fff;border-radius:14px;padding:12px;font-weight:600;text-decoration:none";l.appendChild(a)}
  else l.appendChild(LV.el("p","hint","কল লিংক এখনো দেওয়া নেই।")).style.textAlign="center";
  var inp=document.createElement("input");inp.type="text";inp.placeholder="কল লিংক (Meet/Zoom/WhatsApp)";inp.value=link&&link.url||"";inp.setAttribute("aria-label","কল লিংক");l.appendChild(inp);
  var s=LV.el("button","ghost","লিংক সেভ করো");s.onclick=function(){
   var v=inp.value.trim(),h=v?safe(v):"";if(v&&!h){say("লিংকটা http বা https দিয়ে শুরু হতে হবে।");return}
   if(!DB||!WHO)return;DB.doc("meta/calllink").set({url:h,by:WHO}).then(function(){say("সেভ হয়েছে ✓")}).catch(function(e){say("সমস্যা: "+e.code)})};l.appendChild(s);
  if(err)l.appendChild(LV.el("p","hint","সমস্যা: "+err))}
 LV.onStart(function(){
  DB.doc("meta/ideas").onSnapshot(function(s){custom=(s.data()||{}).list||[];render()},function(e){err=e.code||"error";render()});
  DB.doc("meta/calllink").onSnapshot(function(s){link=s.exists?s.data():null;render()},function(){})});
 render();
})();
