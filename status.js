/* ===== Current Activity / Quick Status (১৩.১) =====
   সম্পূর্ণ ম্যানুয়াল। GPS বা লোকেশনের সাথে কোনো সম্পর্ক নেই।
   ডেটা: meta/status_{sagor|shima} → { act, note, t (আপডেটের সময়), exp (মেয়াদ শেষ, না থাকলে null) }
   মেয়াদ শেষ হলে কিছু মোছা হয় না, শুধু ক্লায়েন্ট "খালি" দেখায়। */
(function(){
 var PRE=["🏫 এখন ক্লাসে","🛏️ এখন রুমে","🎓 এখন ভার্সিটিতে","📚 লাইব্রেরিতে আছি","✍️ পড়াশোনা করছি","😴 ঘুমাচ্ছি","🚶 বাইরে আছি","⏳ ব্যস্ত আছি","🟢 এখন ফ্রি","🏠 বাসায় ফিরছি"];
 var DUR=[[1,"১ ঘণ্টা"],[3,"৩ ঘণ্টা"],[6,"৬ ঘণ্টা"],[12,"১২ ঘণ্টা"],["c","কাস্টম"],[0,"সময়সীমা নেই"]];
 var sel="",dur=3,mine=null,pt=null,ld={m:false,p:false},er={m:"",p:""},ran=false;

 var st=document.createElement("style");
 st.textContent=".qsg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}"+
  ".qsc{margin:0;padding:12px 14px;min-width:0}"+
  ".qsc .qa{font-family:'Tiro Bangla',Georgia,serif;font-size:1.1rem;line-height:1.45;margin:2px 0;word-break:break-word}"+
  ".qsc .qa.e{color:var(--soft);font-size:.98rem}"+
  ".qsc .hint{display:block;line-height:1.4;word-break:break-word}"+
  "input[type=number]{width:100%;border:1.5px solid var(--line);background:var(--glass);color:var(--ink);border-radius:14px;padding:11px 14px;font:inherit;margin:8px 0}";
 document.head.appendChild(st);

 /* কার্ড দুটি: হেডারের ঠিক নিচে */
 var sec=document.createElement("div");sec.id="qs";
 sec.innerHTML='<div class="serif" style="font-size:1.15rem;margin:0 2px 8px">CURRENT ACTIVITY <span class="hint">· এখন কী করছে</span></div>'+
  '<div class="qsg"><div class="card qsc" id="qsp"></div><div class="card qsc" id="qsm"></div></div>'+
  '<button class="ghost" id="qse" style="margin:-6px 0 14px">✏️ আমার স্ট্যাটাস বদলাও</button>'+
  '<div class="card" id="qsx" style="display:none">'+
  '<div class="hint" style="margin-bottom:6px">একটা বেছে নাও, অথবা নিচে নিজে লেখো</div><div class="chips" id="qspc"></div>'+
  '<input type="text" id="qsu" maxlength="60" placeholder="নিজের মতো লেখো (যেমন: বন্ধুদের সাথে আছি)">'+
  '<input type="text" id="qsn" maxlength="100" placeholder="ছোট নোট (ঐচ্ছিক)">'+
  '<div class="hint">কতক্ষণ দেখাবে?</div><div class="chips" id="qsd"></div>'+
  '<input type="number" id="qsh" min="0.25" max="168" step="0.25" placeholder="কত ঘণ্টা? (যেমন ২.৫)" style="display:none">'+
  '<div class="two"><button id="qss">সেভ করো</button><button class="ghost" id="qsr">স্ট্যাটাস মুছে ফেলো</button></div>'+
  '<button class="ghost" id="qsb" style="margin-top:10px">বন্ধ করো</button><p class="note" id="qsmsg"></p></div>';
 var hero=document.querySelector("#home .hero");
 hero.insertAdjacentElement("afterend",sec);

 function msg(t){$("qsmsg").textContent=t}
 function ago(ms){var m=Math.floor(ms/60000);if(m<1)return "এইমাত্র";if(m<60)return bn(m)+" মিনিট আগে";var h=Math.floor(m/60);if(h<24)return bn(h)+" ঘণ্টা আগে";return bn(Math.floor(h/24))+" দিন আগে"}
 function left(ms){var m=Math.ceil(ms/60000);if(m<60)return bn(m)+" মিনিট";var h=Math.floor(m/60),r=m%60;return bn(h)+" ঘণ্টা"+(r?" "+bn(r)+" মিনিট":"")}
 function live(o){return !!(o&&o.act&&(!o.exp||o.exp>Date.now()))}

 function fill(box,title,o,loaded,err,isMine){
  box.innerHTML="";
  function add(cls,t){var d=document.createElement("div");d.className=cls;d.textContent=t;box.appendChild(d);return d}
  add("hint",title);
  if(err){add("qa e","সমস্যা: "+err);return}
  if(!loaded){add("qa e","লোড হচ্ছে…");return}
  if(!live(o)){
   add("qa e",o&&o.act&&o.exp?"মেয়াদ শেষ, এখন কিছু নেই":"কিছু জানায়নি");
   if(o&&o.act&&o.exp)add("hint","শেষ ছিল: "+o.act+" ("+ago(Date.now()-o.t)+")");
   return}
  add("qa",o.act);
  if(o.note)add("hint","“"+o.note+"”");
  add("hint","আপডেট: "+ago(Date.now()-o.t)+" ("+ft(o.t)+")");
  add("hint",o.exp?"মেয়াদ: আরও "+left(o.exp-Date.now()):"মেয়াদ: নিজে মুছলে যাবে")}

 function render(){
  var pn=(typeof PW!=="undefined"&&PW&&PN[PW])?PN[PW]:"ওর";
  fill($("qsp"),pn+"র স্ট্যাটাস",pt,ld.p,er.p);
  fill($("qsm"),"আমার স্ট্যাটাস",mine,ld.m,er.m,true)}
 render();
 setInterval(render,30000);

 /* এডিটর */
 chips("qspc",PRE,function(i){sel=PRE[i];$("qsu").value=""},-1);
 chips("qsd",DUR.map(function(d){return d[1]}),function(i){dur=DUR[i][0];$("qsh").style.display=dur==="c"?"block":"none"},1);
 $("qsu").addEventListener("input",function(){
  sel="";[].forEach.call($("qspc").children,function(b){b.classList.remove("on")})});
 $("qse").onclick=function(){
  var b=$("qsx"),show=b.style.display==="none";b.style.display=show?"block":"none";msg("")};
 $("qsb").onclick=function(){$("qsx").style.display="none"};

 $("qss").onclick=function(){
  if(!DB||!WHO){msg("আগে লগইন করো।");return}
  var act=$("qsu").value.trim()||sel;
  if(!act){msg("একটা স্ট্যাটাস বেছে নাও বা লেখো।");return}
  var h=dur;
  if(h==="c"){h=parseFloat($("qsh").value);if(!(h>=0.25&&h<=168)){msg("সময় ০.২৫ থেকে ১৬৮ ঘণ্টার মধ্যে দাও।");return}}
  var now=Date.now(),o={act:act.slice(0,60),note:$("qsn").value.trim().slice(0,100),t:now,exp:h?now+Math.round(h*36e5):null};
  $("qss").disabled=true;msg("সেভ হচ্ছে…");
  DB.doc("meta/status_"+WHO).set(o).then(function(){
   $("qss").disabled=false;msg("সেভ হয়েছে ✓");$("qsu").value="";$("qsn").value="";
   logEv("স্ট্যাটাস দিয়েছে: "+o.act,"home");$("qsx").style.display="none"
  }).catch(function(e){$("qss").disabled=false;msg("সমস্যা: "+e.code)})};
 $("qsr").onclick=function(){
  if(!DB||!WHO)return;
  DB.doc("meta/status_"+WHO).delete().then(function(){msg("স্ট্যাটাস মুছে গেছে ✓")}).catch(function(e){msg("সমস্যা: "+e.code)})};

 /* রিয়েল-টাইম: মোট ২টা Listener */
 var _s=start;
 start=function(){
  var was=ran;ran=true;_s();if(was)return;
  DB.doc("meta/status_"+WHO).onSnapshot(function(s){mine=s.exists?s.data():null;ld.m=true;er.m="";render()},function(e){er.m=e.code;render()});
  DB.doc("meta/status_"+PW).onSnapshot(function(s){pt=s.exists?s.data():null;ld.p=true;er.p="";render()},function(e){er.p=e.code;render()})};
})();
