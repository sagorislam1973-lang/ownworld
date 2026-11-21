var FIRST=new Date(2022,6,24), LAST=new Date(2026,10,2);
var MSGS=["তুমি দূরে আছো, কিন্তু আমার প্রতিটা দিনের ভেতরেই আছো।","তোমার একটা হাসি আমার পুরো দিনটা সুন্দর করে দেয়।","দূরত্ব শুধু একটা সংখ্যা, আমার মন তো তোমার পাশেই থাকে।","আজ যত দূরেই থাকি, রাতে একই আকাশের নিচে আমরা দুজন।","তুমি আমার সবচেয়ে প্রিয় অভ্যাস।","তোমাকে ভালোবাসি, আজও, কালও, সবসময়।"];
var TASKS=["আজ একটা হাসিমুখের সেলফি পাঠাও।","আমাকে ৩টা কারণ বলো, কেন আমাকে ভালোবাসো।","তোমার প্রিয় গানটা আমাকে পাঠাও।","একটা ভয়েস নোটে আমাকে শুভরাত্রি বলো।","পরের দেখায় আমরা কী করবো, একটা জিনিস বলো।","আমার সবচেয়ে ভালো লাগার একটা গুণ বলো।"];
var CPS=["একটা লম্বা ফোনকল, রাত জেগে, শুধু আমরা দুজন","ভিডিও কলে ফরমায়েশি একটা ফ্লাইং কিস 😘","আমার জন্য একটা গান গেয়ে শোনানো","একদিন সব আবদার মেনে নেওয়া, কোনো তর্ক ছাড়া","ফিসফিস করে ভয়েস নোটে একটা সিক্রেট বলা","দেখা হলে ১০ মিনিটের একটানা জড়িয়ে ধরা 🤗"];
var LV=["মিষ্টি 🌸","দুষ্টু 😈","গরম 🔥"];
var TD={
t:[["আমাদের প্রথম দেখায় আমার সম্পর্কে তোমার প্রথম কী মনে হয়েছিল?","আমার কোন জিনিসটা তোমার সবচেয়ে প্রিয়?","শেষ দেখার কোন মুহূর্তটা তুমি সবচেয়ে বেশি মিস করো?"],
["আমাকে নিয়ে তোমার সবচেয়ে দুষ্টু ভাবনা কোনটা?","আমার কোন ছবি দেখলে তোমার বুক ধুকপুক করে?","দেখা হলে প্রথমেই আমার কাছে কী চাইবে?"],
["দেখা হলে আমার কাছ থেকে কী কী আদর চাও, তিনটা বলো।","আমার কোথায় ছুঁয়ে দিলে তোমার সবচেয়ে ভালো লাগে?","কল্পনায় আমাদের সবচেয়ে রোমান্টিক রাতটা কেমন?"]],
d:[["এখনই একটা হার্ট আঁকা ছবি তুলে পাঠাও।","আমার নাম দিয়ে একটা ছোট কবিতা বানিয়ে বলো।","৩০ সেকেন্ডের ভয়েসে আমাকে নতুন নতুন ভাবে ‘ভালোবাসি’ বলো।"],
["ফিসফিস করে একটা ভয়েস নোট পাঠাও।","ঘুমানোর আগে আমাকে একটা গুড নাইট কিস পাঠাও।","চোখ বন্ধ করে বলো, আমি পাশে থাকলে এখন কী করতে।"],
["ভিডিও কলে ৩০ সেকেন্ড চোখে চোখ রেখে কিছু না বলে তাকিয়ে থাকো।","যতটুকুতে তুমি স্বচ্ছন্দ, ততটুকু ফ্লার্টি একটা ভয়েস মেসেজ রেকর্ড করো।","আমাকে এমন একটা কথা বলো যেটা শুনলে আমি লজ্জা পাবো।"]]};
var FL=[["সাধারণ",""],["গোলাপি","sepia(.45) hue-rotate(-30deg) saturate(1.8)"],["স্বপ্ন","brightness(1.1) saturate(1.4) blur(.6px)"],["পুরোনো","sepia(.8) contrast(1.1)"]];
function $(i){return document.getElementById(i)}
function bn(n){return n.toLocaleString("bn-BD")}
function days(d){return Math.floor((Date.now()-d.getTime())/864e5)}
function key(d){return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}
function load(k,f){try{return JSON.parse(localStorage.getItem(k))||f}catch(e){return f}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var now=new Date(), doy=Math.floor((now-new Date(now.getFullYear(),0,0))/864e5), h=now.getHours();

$("hi").textContent=(h<5?"শুভ রাত্রি":h<12?"শুভ সকাল":h<17?"শুভ দুপুর":h<20?"শুভ সন্ধ্যা":"শুভ রাত্রি")+", আজকের দিনটা তোমাদের";
$("msg").textContent="“"+MSGS[doy%MSGS.length]+"”";
$("c1").textContent=bn(days(FIRST)); $("c2").textContent=bn(days(LAST));
$("task").textContent=TASKS[doy%TASKS.length];

var tabs=document.querySelectorAll("nav button");
tabs.forEach(function(b){b.onclick=function(){
  tabs.forEach(function(x){x.classList.toggle("on",x===b)});
  document.querySelectorAll(".tab").forEach(function(s){s.classList.toggle("on",s.id===b.dataset.t)});
  window.scrollTo(0,0);
}});

function chips(id,list,cb,start){
  var box=$(id), sel=start;
  list.forEach(function(t,i){var c=document.createElement("button");c.className="chip"+(i===sel?" on":"");c.textContent=t;
    c.onclick=function(){sel=i;[].forEach.call(box.children,function(x,j){x.classList.toggle("on",j===sel)});cb(i)};box.appendChild(c)});
}
chips("moods",["😊 খুশি","🥰 প্রেমে","😔 মিস করছি","😴 ক্লান্ত","😈 দুষ্টু মুড","🥺 জড়িয়ে ধরো"],function(i){},-1);

function burst(){for(var i=0;i<14;i++){var s=document.createElement("span");s.className="heart";s.textContent=["💗","💖","💕","🌸"][i%4];
  s.style.left=(Math.random()*90+3)+"%";s.style.animationDelay=(Math.random()*.5)+"s";document.body.appendChild(s);
  setTimeout(function(e){e.remove()}.bind(null,s),3000)}}

var lv=0,last="";
chips("lv",LV,function(i){lv=i},0);
function draw(t){
  var a=TD[t][lv],x;do{x=a[Math.floor(Math.random()*a.length)]}while(x===last&&a.length>1);last=x;
  $("play").innerHTML='<span class="badge">'+(t==="t"?"সত্যি বলো":"সাহস দেখাও")+'</span><p class="serif">'+x+'</p>';
}
$("bt").onclick=function(){draw("t")}; $("bd").onclick=function(){draw("d")};

var flt="",img=null;
chips("flt",FL.map(function(f){return f[0]}),function(i){flt=FL[i][1];if(img)img.style.filter=flt},0);
$("ct").oninput=function(){var c=$("cap");c.textContent=this.value;c.style.display=this.value?"block":"none"};
$("file").onchange=function(){var f=this.files[0];if(!f)return;
  var fr=$("fr");if(img)img.remove();img=document.createElement("img");img.alt="তোমার ছবি";img.src=URL.createObjectURL(f);img.style.filter=flt;
  fr.insertBefore(img,fr.firstChild);fr.querySelector("span").style.display="none"};
$("clr").onclick=function(){if(img){img.remove();img=null}$("fr").querySelector("span").style.display="";$("ct").value="";$("cap").style.display="none";$("snote").textContent=""};
$("send").onclick=function(){
  if(!img){$("snote").textContent="আগে একটা ছবি তোলো বা বেছে নাও।";return}
  var v=$("view"),n=5;$("vf").innerHTML="";var c=img.cloneNode();$("vf").appendChild(c);
  if($("ct").value){var d=document.createElement("div");d.className="cap";d.style.display="block";d.textContent=$("ct").value;$("vf").appendChild(d)}
  v.style.display="flex";$("vt").textContent=bn(n)+" সেকেন্ডে মিলিয়ে যাবে";
  var t=setInterval(function(){n--;if(n<=0){clearInterval(t);v.style.display="none";$("snote").textContent="স্ন্যাপ মিলিয়ে গেছে ✨ (এখন শুধু ডেমো, পরে শিমার ফোনে যাবে)"}else $("vt").textContent=bn(n)+" সেকেন্ডে মিলিয়ে যাবে"},1000);
};

var dl=load("doneDays",[]);
function streak(){var d=new Date(),n=0;if(dl.indexOf(key(d))<0)d.setDate(d.getDate()-1);while(dl.indexOf(key(d))>=0){n++;d.setDate(d.getDate()-1)}return n}
function rd(){var ok=dl.indexOf(key(new Date()))>=0,s=streak();$("done").disabled=ok;$("done").textContent=ok?"আজকের টাস্ক শেষ ✓":"করে ফেলেছি 💗";$("streak").textContent=s?"Love Streak 🔥 "+bn(s)+" দিন":""}
$("done").onclick=function(){var k=key(new Date());if(dl.indexOf(k)<0){dl.push(k);save("doneDays",dl)}rd();burst()};rd();

var used=load("cpUsed",[]);
function rc(){$("cps").innerHTML="";CPS.forEach(function(t,i){var u=used.indexOf(i)>=0,d=document.createElement("div");d.className="card ticket"+(u?" used":"");
  d.innerHTML="<p></p>";d.firstChild.textContent=t;var b=document.createElement("button");b.textContent=u?"ব্যবহৃত":"ব্যবহার করো";b.disabled=u;
  b.onclick=function(){used.push(i);save("cpUsed",used);rc();burst()};d.appendChild(b);$("cps").appendChild(d)})}
rc();
function pad(n){return n<10?"0"+n:""+n}
var TODAY=now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate());
function fd(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString("bn-BD",{day:"numeric",month:"long",year:"numeric"})}
function panels(p,n,i){for(var j=0;j<n;j++)$(p+j).classList.toggle("on",j===i)}
function shuf(a){return a.sort(function(){return Math.random()-.5})}
chips("gm",["🧠 কুইজ","🃏 মেমরি","⭕ টিক-ট্যাক","🎨 লাইভ আঁকি","🤔 কোনটা?"],function(i){panels("g",5,i)},0);
chips("mm",["🕰️ টাইমলাইন","🔐 গোপন ডায়েরি","📝 বাকেট লিস্ট"],function(i){panels("m",3,i)},0);

var gw=load("gameWins",0);
var _rd=rd;rd=function(){_rd();var s=streak(),p=dl.length*10+gw*5,bx=$("bdg");$("pts").textContent="💎 "+bn(p)+" পয়েন্ট";bx.innerHTML="";
 [[3,"🌱 ৩ দিন"],[7,"🔥 ৭ দিন"],[30,"👑 ৩০ দিন"]].forEach(function(b){var c=document.createElement("span");c.className="chip"+(s>=b[0]?" on":"");c.textContent=(s>=b[0]?"":"🔒 ")+b[1];bx.appendChild(c)})};
rd();
var SUR=["💌 ১০ মিনিটের মধ্যে আমাকে একটা ভালোবাসার লাইন লিখে পাঠাও।","📸 তুমি এখন যেখানে আছো, সেই জায়গার একটা ছবি পাঠাও।","🎤 আমাকে একটা লাইন গেয়ে শোনাও।","😘 একটা ফ্লাইং কিস ভিডিও পাঠাও।","🌙 আজ রাতে আমাকে ভাবার একটা কারণ বলো।"];
$("sur").onclick=function(){var t=SUR[Math.floor(Math.random()*SUR.length)];burst();
 if(!DB||!WHO){$("surn").textContent="আগে লগইন করো।";return}
 DB.collection("dares").add({for:PW,from:WHO,kind:"d",text:t,t:Date.now(),done:false})
  .then(function(){$("surn").textContent=PN[PW]+"র কাছে সারপ্রাইজ টাস্ক পাঠানো হয়েছে 🎁"})
  .catch(function(e){$("surn").textContent="সমস্যা: "+e.code})};

var QZ=[["আমার প্রিয় রং কী?",["গোলাপি","নীল","কালো","সাদা"]],["ছুটির দিনে আমার পছন্দ কী?",["ঘুম","ঘোরা","মুভি","আড্ডা"]],["আমার প্রিয় খাবার?",["বিরিয়ানি","চাইনিজ","ফুচকা","পিৎজা"]],["আমাকে সবচেয়ে বেশি কী রাগায়?",["দেরি","মিথ্যা","অবহেলা","চুপ থাকা"]],["ডেটে আমি কোথায় যেতে চাই?",["নদীর ধার","ক্যাফে","পার্ক","শহরের বাইরে"]]],qi=0;
function rq(){var q=QZ[qi],o=$("qo");o.innerHTML="";
 if(!q){$("qq").textContent="কুইজ শেষ! 🎉";var b=document.createElement("button");b.className="ghost";b.textContent="আবার খেলো";b.onclick=function(){qi=0;rq()};o.appendChild(b);$("qn").textContent="এবার শিমাকে জিজ্ঞেস করো, ও কতগুলো মেলাতে পারে 😄";return}
 $("qq").textContent=bn(qi+1)+"/"+bn(QZ.length)+"  "+q[0];$("qn").textContent="নিজের উত্তরটা বেছে নাও";
 q[1].forEach(function(t){var c=document.createElement("button");c.className="chip";c.textContent=t;c.onclick=function(){qi++;rq()};o.appendChild(c)})}
rq();

var ME=["🌹","💌","🍫","💍","🧸","🌸"],mf=[],ml=false,mv=0,mc=[];
function win(){gw++;save("gameWins",gw);rd();burst()}
function mk(){mc=shuf(ME.concat(ME));mf=[];ml=false;mv=0;var g=$("mg");g.innerHTML="";$("mn").textContent="জোড়া মেলাও";
 mc.forEach(function(e,i){var b=document.createElement("button");b.className="cell";b.textContent="❔";
  b.onclick=function(){if(ml||b.dataset.ok||mf.indexOf(i)>=0)return;b.textContent=e;mf.push(i);
   if(mf.length===2){mv++;var a=mf[0],c=mf[1],A=g.children[a],C=g.children[c];
    if(mc[a]===mc[c]){A.dataset.ok=1;C.dataset.ok=1;mf=[];if(g.querySelectorAll("[data-ok]").length===12){$("mn").textContent="জিতে গেছো! "+bn(mv)+" চালে 🎉";win()}}
    else{ml=true;setTimeout(function(){A.textContent="❔";C.textContent="❔";mf=[];ml=false},700)}}};
  g.appendChild(b)})}
$("mr").onclick=mk;mk();

var TM=["💗","🌸"],TLN=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],tb,tt,tw;
function tk(){tb=Array(9).fill("");tt=0;tw=false;var g=$("tg");g.innerHTML="";$("tn").textContent="💗 এর পালা";
 for(var i=0;i<9;i++)(function(i){var b=document.createElement("button");b.className="cell";b.onclick=function(){if(tw||tb[i])return;tb[i]=TM[tt];b.textContent=TM[tt];
  var w=TLN.some(function(l){return tb[l[0]]&&tb[l[0]]===tb[l[1]]&&tb[l[0]]===tb[l[2]]});
  if(w){tw=true;$("tn").textContent=TM[tt]+" জিতেছে! 🎉";win()}
  else if(tb.every(Boolean)){tw=true;$("tn").textContent="ড্র! আবার খেলো 😄"}
  else{tt=1-tt;$("tn").textContent=TM[tt]+" এর পালা"}};g.appendChild(b)})(i)}
$("tr").onclick=tk;tk();

var W=[["ভিডিও কলে সারারাত গল্প","একদিন সামনাসামনি দেখা"],["চিঠি লিখে ভালোবাসা জানানো","গান গেয়ে শোনানো"],["আমাকে সারপ্রাইজ দেওয়া","আমার সারপ্রাইজ পাওয়া"],["পাহাড়ে একসাথে ঘোরা","সমুদ্রের ধারে হাতে হাত রেখে হাঁটা"],["দুষ্টু মেসেজে সারাদিন খুনসুটি","ফিসফিস ভয়েসে একটা রাত"]],wi=-1;
function nextW(){var n;do{n=Math.floor(Math.random()*W.length)}while(n===wi);wi=n;$("wa").textContent=W[n][0];$("wb").textContent=W[n][1]}
$("wa").onclick=$("wb").onclick=function(){$("wnote").textContent="ভালো পছন্দ 💗 শিমাকে জিজ্ঞেস করো, ও কোনটা বেছে নিত!";setTimeout(nextW,800)};nextW();

var TL2=load("tl",[{d:"2022-07-24",t:"প্রথম দেখা, রাবি পরীক্ষা দিতে এসে 💞"},{d:"2026-11-02",t:"শেষ দেখা 🥹"}]);
function rt(){TL2.sort(function(a,b){return a.d<b.d?-1:1});$("tl").innerHTML="";TL2.forEach(function(x){var d=document.createElement("div");d.className="card item";d.innerHTML="<b class='serif' style='color:var(--rose)'></b><span></span>";d.firstChild.textContent=fd(x.d);d.lastChild.textContent=x.t;$("tl").appendChild(d)})}
$("tla").onclick=function(){var t=$("tlt").value.trim(),d=$("tld").value;if(!t||!d)return;TL2.push({d:d,t:t});save("tl",TL2);$("tlt").value="";rt()};rt();
var NT=load("nt",[]);
function rn(){$("nl").innerHTML="";NT.forEach(function(x){var d=document.createElement("div");d.className="card item";d.textContent=x.d>TODAY?"🔒 "+fd(x.d)+" তারিখে খুলবে":"💌 "+x.t;$("nl").appendChild(d)})}
$("na").onclick=function(){var t=$("nt").value.trim(),d=$("nd").value;if(!t||!d)return;NT.push({t:t,d:d});save("nt",NT);$("nt").value="";rn()};rn();
var BL=load("bl",[{t:"একসাথে সমুদ্র দেখা 🌊"},{t:"তারা ভরা আকাশের নিচে বসা ✨"},{t:"একই কফি দুজনে ভাগ করে খাওয়া ☕"}]);
function rb(){$("bl").innerHTML="";BL.forEach(function(x){var d=document.createElement("button");d.className="chip";d.style.cssText="display:block;width:100%;text-align:left;margin-bottom:8px;border-radius:16px";d.textContent=(x.x?"✅ ":"⬜ ")+x.t;if(x.x)d.style.opacity=.6;d.onclick=function(){x.x=!x.x;save("bl",BL);rb();if(x.x)burst()};$("bl").appendChild(d)})}
$("ba").onclick=function(){var t=$("bt2").value.trim();if(!t)return;BL.push({t:t});save("bl",BL);$("bt2").value="";rb()};rb();

/* ===== Firebase: লগইন ও রিয়েল-টাইম ===== */
var CFG={apiKey:"AIzaSyBtUBx1x8NwrJbU-Z_qHAcqWueAlqNYdEw",authDomain:"ownworld-42078.firebaseapp.com",projectId:"ownworld-42078",storageBucket:"ownworld-42078.firebasestorage.app",messagingSenderId:"51897813200",appId:"1:51897813200:web:be4bade72549a53edb36d5"};
var EM_S="sagorislam1973@gmail.com",PN={sagor:"সাগর",shima:"শিমা"},MOODS=["😊 খুশি","🥰 প্রেমে","😔 মিস করছি","😴 ক্লান্ত","😈 দুষ্টু মুড","🥺 জড়িয়ে ধরো"];
var FBV="10.12.2",AU,DB,WHO,PW,snapIn=null;
function ldOne(n,cb){var u=["https://cdnjs.cloudflare.com/ajax/libs/firebase/"+FBV+"/firebase-"+n+"-compat.min.js","https://cdn.jsdelivr.net/npm/firebase@"+FBV+"/firebase-"+n+"-compat.js"],i=0;
 (function t(){var s=document.createElement("script");s.src=u[i];s.onload=function(){cb()};s.onerror=function(){i++;if(i<u.length)t();else cb(1)};document.head.appendChild(s)})()}
ldOne("app",function(e){if(e)return fail();ldOne("auth",function(e){if(e)return fail();ldOne("firestore",function(e){if(e)return fail();boot()})})});
function fail(){$("lgn").textContent="সার্ভারের সাথে যুক্ত হওয়া যায়নি। ইন্টারনেট দেখে পেজ রিলোড করো।"}

var pm=document.createElement("p");pm.className="note";pm.id="pmood";$("note").parentNode.appendChild(pm);
var ib=document.createElement("button");ib.id="inbox";ib.className="ghost";ib.style.cssText="display:none;margin-bottom:12px";ib.textContent="📩 নতুন স্ন্যাপ এসেছে, দেখো";$("snap").insertBefore(ib,$("fr"));

function boot(){
 firebase.initializeApp(CFG);AU=firebase.auth();DB=firebase.firestore();
 AU.onAuthStateChanged(function(u){
  if(!u){$("lg").style.display="flex";return}
  WHO=(u.email||"").toLowerCase()===EM_S?"sagor":"shima";PW=WHO==="sagor"?"shima":"sagor";
  $("lg").style.display="none";start();
 });
}
$("lgb").onclick=function(){
 if(!AU){fail();return}
 $("lgn").textContent="";
 AU.signInWithEmailAndPassword($("lge").value.trim().toLowerCase(),$("lgp").value).catch(function(er){
  var m={"auth/invalid-credential":"ইমেইল বা পাসওয়ার্ড ভুল।","auth/wrong-password":"পাসওয়ার্ড ভুল।","auth/user-not-found":"এই ইমেইলে অ্যাকাউন্ট নেই।","auth/invalid-email":"ইমেইলটা ঠিক করে লেখো।","auth/operation-not-allowed":"Firebase-এ Email/Password চালু করা হয়নি।","auth/network-request-failed":"ইন্টারনেট বা নেটওয়ার্কে সমস্যা।","auth/too-many-requests":"অনেকবার ভুল হয়েছে, একটু পরে চেষ্টা করো।"};
  $("lgn").textContent=m[er.code]||("সমস্যা: "+er.code);
 });
};

var started=false;
function start(){
 if(started)return;started=true;
 var first=true,lastPing=0;
 DB.doc("live/"+PW).onSnapshot(function(s){
  var d=s.data()||{};
  if(d.mood!=null)$("pmood").textContent=PN[PW]+" এখন: "+MOODS[d.mood];
  if(d.ping){if(!first&&d.ping>lastPing){burst();$("note").textContent=PN[PW]+" তোমাকে ভাবছে 💞"}lastPing=d.ping}
  first=false;
  snapIn=d.snap||null;$("inbox").style.display=snapIn?"block":"none";
 },function(e){$("note").textContent="কানেকশনে সমস্যা: "+e.code+" (Rules ও ডাটাবেস দেখো)"});
 [].forEach.call($("moods").children,function(b,i){b.addEventListener("click",function(){
  DB.doc("live/"+WHO).set({mood:i},{merge:true}).then(function(){$("note").textContent="তোমার মুড "+PN[PW]+" দেখতে পাবে 💗"}).catch(function(e){$("note").textContent="সমস্যা: "+e.code})})});
}
$("think").onclick=function(){
 burst();if(!DB)return;
 DB.doc("live/"+WHO).set({ping:Date.now()},{merge:true}).then(function(){$("note").textContent=PN[PW]+"কে জানানো হয়েছে 💗"}).catch(function(e){$("note").textContent="সমস্যা: "+e.code});
};
$("send").onclick=function(){
 if(!img){$("snote").textContent="আগে একটা ছবি তোলো বা বেছে নাও।";return}
 if(!DB)return;
 var w=img.naturalWidth,h=img.naturalHeight,k=Math.min(1,640/Math.max(w,h)),c=document.createElement("canvas");
 c.width=Math.round(w*k);c.height=Math.round(h*k);var x=c.getContext("2d");var cf=("filter" in CanvasRenderingContext2D.prototype);if(cf)x.filter=flt||"none";x.drawImage(img,0,0,c.width,c.height);
 $("snote").textContent="পাঠানো হচ্ছে...";
 DB.doc("live/"+WHO).set({snap:{img:c.toDataURL("image/jpeg",.6),cap:$("ct").value,f:cf?"":(flt||""),t:Date.now()}},{merge:true})
  .then(function(){$("snote").textContent="স্ন্যাপ "+PN[PW]+"র কাছে পৌঁছে গেছে ✨";$("clr").onclick()})
  .catch(function(e){$("snote").textContent="সমস্যা: "+e.code});
};
$("inbox").onclick=function(){
 if(!snapIn)return;
 var s=snapIn,n=5,v=$("view");$("vf").innerHTML="";
 var im=document.createElement("img");im.src=s.img;if(s.f)im.style.filter=s.f;$("vf").appendChild(im);
 if(s.cap){var d=document.createElement("div");d.className="cap";d.style.display="block";d.textContent=s.cap;$("vf").appendChild(d)}
 v.style.display="flex";$("vt").textContent=bn(n)+" সেকেন্ডে মিলিয়ে যাবে";
 var t=setInterval(function(){n--;
  if(n<=0){clearInterval(t);v.style.display="none";$("vf").innerHTML="";DB.doc("live/"+PW).update({snap:firebase.firestore.FieldValue.delete()})}
  else $("vt").textContent=bn(n)+" সেকেন্ডে মিলিয়ে যাবে"},1000);
};

/* ===== বের হও ও পাসওয়ার্ড রিসেট ===== */
var lo=document.createElement("button");lo.className="ghost";lo.id="lgo";lo.textContent="বের হও";lo.style.marginTop="14px";$("home").appendChild(lo);
lo.onclick=function(){if(!AU)return;AU.signOut().then(function(){location.reload()})};
$("lgf").onclick=function(){
 var e=$("lge").value.trim().toLowerCase();
 if(!e){$("lgn").textContent="আগে উপরে তোমার ইমেইলটা লেখো।";return}
 if(!AU){fail();return}
 AU.sendPasswordResetEmail(e)
  .then(function(){$("lgn").textContent="রিসেট লিংক ইমেইলে পাঠানো হয়েছে। Spam ফোল্ডারও দেখো।"})
  .catch(function(er){$("lgn").textContent=er.code==="auth/user-not-found"?"এই ইমেইলে অ্যাকাউন্ট নেই।":"সমস্যা: "+er.code});
};

/* ===== নোট, রিঅ্যাকশন, রিপ্লে ও নিজের ডেয়ার ===== */
var RX=["❤️","😘","🥺","😂"],nstart=false,dr2={},dk="d";
function ft(t){return new Date(t).toLocaleString("bn-BD",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})}
function who(f){return f===WHO?"তুমি":PN[f]}

var nc=document.createElement("div");nc.className="card";
nc.innerHTML='<div class="serif" style="font-size:1.25rem;margin-bottom:8px">💌 আমাদের নোট</div><div id="nbl"></div><input type="text" id="nin" placeholder="একটা নোট লেখো..." maxlength="300"><button id="nsend">নোট রাখো</button>';
$("home").insertBefore(nc,$("home").children[1]);

var dc=document.createElement("div");dc.className="card";dc.style.marginTop="16px";
dc.innerHTML='<div class="serif" style="font-size:1.25rem;margin-bottom:6px">💝 নিজের মতো করে কার্ড বানাও</div><div class="chips" id="dkc"></div><input type="text" id="din" placeholder="যা খুশি লেখো, ওর জন্য কার্ড হয়ে যাবে" maxlength="200"><button id="dsend">পাঠাও 🎁</button><p class="note" id="dnote"></p><div class="serif" style="font-size:1.25rem;margin:12px 0 8px">🎁 তোমার জন্য আসা কার্ড</div><div id="dinb"></div>';
$("td").appendChild(dc);
chips("dkc",["সত্যি","সাহস"],function(i){dk=i?"d":"t"},1);

function renderNotes(qs){
 [].forEach.call(document.querySelectorAll(".rin"),function(i){dr2[i.dataset.id]=i.value});
 var box=$("nbl");box.innerHTML="";
 if(qs.empty){box.innerHTML='<p class="hint">এখনো কোনো নোট নেই। প্রথমটা তুমি লেখো 💗</p>'}
 qs.forEach(function(doc){
  var n=doc.data(),id=doc.id,r=n.r||{},d=document.createElement("div");
  d.style.cssText="border-bottom:1px solid var(--line);padding:10px 0";
  var h=document.createElement("div");h.className="hint";h.textContent=who(n.from)+", "+ft(n.t);
  var p=document.createElement("p");p.className="serif";p.style.cssText="margin:4px 0;font-size:1.15rem";p.textContent=n.text;
  var rx=document.createElement("div");rx.className="chips";rx.style.justifyContent="flex-start";
  RX.forEach(function(e){var b=document.createElement("button");b.className="chip"+(r[WHO]===e?" on":"");b.textContent=e;b.style.padding="3px 10px";
   b.onclick=function(){var v={};v["r."+WHO]=r[WHO]===e?firebase.firestore.FieldValue.delete():e;DB.collection("notes").doc(id).update(v)};rx.appendChild(b)});
  if(r[PW]){var s=document.createElement("span");s.className="hint";s.textContent=PN[PW]+": "+r[PW];rx.appendChild(s)}
  d.appendChild(h);d.appendChild(p);d.appendChild(rx);
  (n.replies||[]).forEach(function(q){var x=document.createElement("div");x.style.cssText="margin:4px 0 0 14px;padding-left:10px;border-left:3px solid var(--rose2)";x.textContent=who(q.from)+": "+q.text;d.appendChild(x)});
  var ri=document.createElement("input");ri.type="text";ri.className="rin";ri.dataset.id=id;ri.placeholder="রিপ্লে দাও";ri.maxLength=200;ri.value=dr2[id]||"";
  var rb=document.createElement("button");rb.className="ghost";rb.textContent="রিপ্লে";rb.style.padding="8px";
  rb.onclick=function(){var t=ri.value.trim();if(!t)return;dr2[id]="";DB.collection("notes").doc(id).update({replies:firebase.firestore.FieldValue.arrayUnion({from:WHO,text:t,t:Date.now()})})};
  d.appendChild(ri);d.appendChild(rb);box.appendChild(d);
 });
}
function renderDares(qs){
 var box=$("dinb"),a=[];box.innerHTML="";
 qs.forEach(function(d){var x=d.data();if(!x.done)a.push({id:d.id,x:x})});
 a.sort(function(p,q){return q.x.t-p.x.t});
 if(!a.length){box.innerHTML='<p class="hint">এখন কোনো কার্ড নেই।</p>';return}
 a.forEach(function(o){
  var d=document.createElement("div");d.className="card";d.style.cssText="margin:0 0 10px;border:1.5px dashed var(--rose2)";
  var b=document.createElement("span");b.className="badge";b.textContent=(o.x.kind==="t"?"সত্যি বলো":"সাহস দেখাও")+", "+PN[o.x.from]+"র কার্ড";
  var p=document.createElement("p");p.className="serif";p.style.margin="8px 0";p.textContent=o.x.text;
  var k=document.createElement("button");k.textContent="করে ফেলেছি ✓";k.onclick=function(){DB.collection("dares").doc(o.id).update({done:true});burst()};
  d.appendChild(b);d.appendChild(p);d.appendChild(k);box.appendChild(d);
 });
}
$("nsend").onclick=function(){
 var t=$("nin").value.trim();if(!t||!DB)return;
 DB.collection("notes").add({from:WHO,text:t,t:Date.now()}).then(function(){$("nin").value=""}).catch(function(e){$("note").textContent="সমস্যা: "+e.code});
};
$("dsend").onclick=function(){
 var t=$("din").value.trim();if(!t||!DB)return;
 DB.collection("dares").add({for:PW,from:WHO,kind:dk,text:t,t:Date.now(),done:false})
  .then(function(){$("din").value="";$("dnote").textContent=PN[PW]+"র জন্য কার্ড পাঠানো হয়েছে 🎁"})
  .catch(function(e){$("dnote").textContent="সমস্যা: "+e.code});
};
var _st=start;
start=function(){
 _st();if(nstart)return;nstart=true;
 var f1=true,f2=true;
 DB.collection("notes").orderBy("t","desc").limit(6).onSnapshot(function(qs){
  renderNotes(qs);
  if(!f1)qs.docChanges().forEach(function(c){if(c.type==="added"&&c.doc.data().from!==WHO){burst();$("note").textContent=PN[PW]+" একটা নোট রেখেছে 💌"}});
  f1=false;
 },function(e){$("nbl").textContent="নোটে সমস্যা: "+e.code});
 DB.collection("dares").where("for","==",WHO).onSnapshot(function(qs){
  renderDares(qs);
  if(!f2)qs.docChanges().forEach(function(c){if(c.type==="added"){burst();$("note").textContent=PN[PW]+" তোমার জন্য একটা কার্ড পাঠিয়েছে 🎁"}});
  f2=false;
 },function(e){$("dnote").textContent="কার্ডে সমস্যা: "+e.code});
};

/* ===== কাউন্টডাউন, প্রশ্ন, হাত ধরা, ভয়েস, চিঠি, নোটিফিকেশন ===== */
function mk2(h){var d=document.createElement("div");d.className="card";d.innerHTML=h;$("home").insertBefore(d,$("lgo"));return d}
var T='<div class="serif" style="font-size:1.2rem;margin-bottom:6px">';
mk2('<div class="hint">পরের দেখা হতে বাকি</div><div class="serif" id="cdv" style="font-size:2rem;color:var(--rose);margin:4px 0">—</div><input type="date" id="cdi" aria-label="পরের দেখার তারিখ"><button class="ghost" id="cdb">তারিখ ঠিক করো</button>');
mk2(T+'🤝 হাত ধরো</div><p class="hint" id="hn" style="margin:0 0 12px">দুজনে একসাথে ধরলে জ্বলে উঠবে</p><div id="hp">🤍</div>');
mk2(T+'❓ আজকের প্রশ্ন</div><p class="serif" id="dq" style="font-size:1.15rem;margin:6px 0"></p><div id="da"></div>');
mk2(T+'🎙️ ভয়েস নোট</div><button id="vrec">🎙️ রেকর্ড শুরু করো</button><p class="note" id="vn"></p><div id="vl"></div>');
mk2(T+'🔔 নোটিফিকেশন</div><p class="hint" style="margin:0 0 10px">অ্যাপ খোলা বা ব্যাকগ্রাউন্ডে থাকলে ফোনে জানাবে।</p><button class="ghost" id="nfb">চালু করো</button>');

var ICON=['<path d="M3 11l9-8 9 8M5 10v10h14V10"/>','<rect x="5" y="3" width="12" height="17" rx="2"/><path d="M9 21h9a2 2 0 002-2V8"/>','<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M8 11v4M6 13h4M16 12h.01M18 14h.01"/>','<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>','<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.6-7 10-7 10z"/>','<path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v3a2 2 0 000 4v3a2 2 0 00-2 2H5a2 2 0 00-2-2v-3a2 2 0 000-4z"/>'];
document.querySelectorAll("nav button").forEach(function(b,i){var s=b.querySelector("span");if(s){var v=document.createElement("span");v.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+ICON[i]+'</svg>';b.replaceChild(v,s)}});

function notify(t){
 try{if(navigator.vibrate)navigator.vibrate([120,60,120])}catch(e){}
 if(!("Notification" in window)||Notification.permission!=="granted"||!document.hidden||!navigator.serviceWorker)return;
 navigator.serviceWorker.getRegistration().then(function(r){if(r)r.showNotification("আমাদের পৃথিবী",{body:t})});
}
var _b=burst;burst=function(){_b();setTimeout(function(){notify($("note").textContent)},60)};
$("nfb").onclick=function(){
 if(!("Notification" in window)){$("nfb").textContent="এই ব্রাউজারে চলবে না";return}
 Notification.requestPermission().then(function(p){if(p==="granted"){if(navigator.serviceWorker)navigator.serviceWorker.register("sw.js").catch(function(){});$("nfb").textContent="চালু আছে ✓"}else $("nfb").textContent="অনুমতি দেওয়া হয়নি"});
};
if("Notification" in window&&Notification.permission==="granted"&&navigator.serviceWorker){navigator.serviceWorker.register("sw.js").catch(function(){});$("nfb").textContent="চালু আছে ✓"}

var NEXT=null;
setInterval(function(){var e=$("cdv");if(!NEXT){e.textContent="তারিখ ঠিক করো";return}
 var p=NEXT.split("-"),ms=new Date(+p[0],+p[1]-1,+p[2])-Date.now();
 if(ms<-864e5){e.textContent="নতুন তারিখ ঠিক করো";return}
 if(ms<=0){e.textContent="আজ দেখা! 🥰";return}
 e.textContent=bn(Math.floor(ms/864e5))+" দিন "+bn(Math.floor(ms%864e5/36e5))+" ঘণ্টা"},1000);
$("cdb").onclick=function(){var d=$("cdi").value;if(d&&DB)DB.doc("meta/next").set({d:d})};

var QS=["এই সপ্তাহে কোন মুহূর্তে আমাকে সবচেয়ে বেশি মিস করেছো?","আমাদের একসাথে কাটানো সবচেয়ে প্রিয় দিনটা কোনটা?","আমার কোন অভ্যাসটা তোমার সবচেয়ে ভালো লাগে?","পরের দেখায় প্রথম কী করতে চাও?","আজ তোমার দিনের সবচেয়ে ভালো জিনিস কী ছিল?","আমাদের নিয়ে তোমার একটা স্বপ্নের কথা বলো।","আমার কোন কথাটা তোমার মনে গেঁথে আছে?","এখন আমাকে কাছে পেলে কী করতে?"];
$("dq").textContent=QS[doy%QS.length];
function rA(d){var b=$("da"),m=d[WHO],p=d[PW];b.innerHTML="";
 function ln(t){var x=document.createElement("p");x.style.margin="4px 0";x.textContent=t;b.appendChild(x)}
 if(m){ln("তুমি: "+m);ln(p?PN[PW]+": "+p:PN[PW]+"র উত্তরের অপেক্ষায়...");return}
 if(p)ln(PN[PW]+" উত্তর দিয়ে ফেলেছে, তুমি দিলে দেখতে পাবে।");
 var i=document.createElement("input");i.type="text";i.placeholder="তোমার উত্তর";i.maxLength=300;
 var k=document.createElement("button");k.textContent="উত্তর দাও";
 k.onclick=function(){var t=i.value.trim();if(!t)return;var o={};o[WHO]=t;DB.doc("answers/"+TODAY).set(o,{merge:true})};
 b.appendChild(i);b.appendChild(k);
}

var myH=false,hT=null,pH=0,pRecv=0,bothH=false;
function setHold(v){DB.doc("live/"+WHO).set({hold:v},{merge:true})}
function pHold(){return pH>0&&Date.now()-pRecv<3500}
function hv(){var b=myH&&pHold(),e=$("hp");e.className=b?"both":myH?"me":"";
 e.textContent=b?"💗":myH?"🤍":"🤍";
 $("hn").textContent=b?"দুজনে হাত ধরে আছো 💗":myH?PN[PW]+"র অপেক্ষায়...":pHold()?PN[PW]+" হাত ধরে আছে, তুমিও ধরো!":"দুজনে একসাথে ধরলে জ্বলে উঠবে";
 if(b&&!bothH&&navigator.vibrate)navigator.vibrate([200,100,200]);bothH=b}
function stopH(){if(!myH)return;myH=false;clearInterval(hT);setHold(0);hv()}
$("hp").onpointerdown=function(e){e.preventDefault();if(!DB||myH)return;myH=true;setHold(Date.now());hT=setInterval(function(){setHold(Date.now())},1000);hv()};
["pointerup","pointercancel","pointerleave"].forEach(function(ev){$("hp").addEventListener(ev,stopH)});
$("hp").addEventListener("contextmenu",function(e){e.preventDefault()});
setInterval(hv,700);

var mr,chunks,vrt;
$("vrec").onclick=function(){
 if(mr&&mr.state==="recording"){mr.stop();return}
 if(!DB||!navigator.mediaDevices){$("vn").textContent="এই ব্রাউজারে রেকর্ড চলবে না।";return}
 navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){
  chunks=[];mr=new MediaRecorder(st,{audioBitsPerSecond:16000});
  mr.ondataavailable=function(e){chunks.push(e.data)};
  mr.onstop=function(){clearTimeout(vrt);st.getTracks().forEach(function(t){t.stop()});$("vrec").textContent="🎙️ রেকর্ড শুরু করো";
   var fr=new FileReader();fr.onload=function(){
    if(fr.result.length>900000){$("vn").textContent="অনেক বড় হয়ে গেছে, ছোট করে আবার রেকর্ড করো।";return}
    DB.collection("voices").add({from:WHO,data:fr.result,t:Date.now()}).then(function(){$("vn").textContent="পাঠানো হয়েছে 💗"}).catch(function(e){$("vn").textContent="সমস্যা: "+e.code})};
   fr.readAsDataURL(new Blob(chunks,{type:mr.mimeType}))};
  mr.start();$("vrec").textContent="⏹️ থামাও (সর্বোচ্চ ৩০ সেকেন্ড)";vrt=setTimeout(function(){mr.stop()},30000);
 }).catch(function(){$("vn").textContent="মাইক্রোফোনের অনুমতি দাও।"});
};
function rV(qs){var b=$("vl");b.innerHTML="";
 qs.forEach(function(d){var x=d.data(),w=document.createElement("div"),h=document.createElement("div"),a=document.createElement("audio");
  w.style.marginTop="10px";h.className="hint";h.textContent=who(x.from)+", "+ft(x.t);a.controls=true;a.src=x.data;a.style.width="100%";
  w.appendChild(h);w.appendChild(a);b.appendChild(w)})}

var LB=["মন খারাপ হলে","ঘুম না এলে","আমাকে মিস করলে","রাগ করলে","খুব খুশি হলে"],wl=0;
var m3=document.createElement("div");m3.className="panel";m3.id="m3";
m3.innerHTML='<div class="card"><div class="hint" style="margin-bottom:6px">ওর জন্য চিঠি লিখে রাখো। ও যখন খুলবে তখনই পড়বে।</div><div class="chips" id="wol"></div><textarea id="wot" rows="3" placeholder="চিঠিটা লেখো"></textarea><button id="wos">সিল করে পাঠাও 💌</button></div><div class="serif" style="font-size:1.2rem;margin:14px 4px 8px">তোমার জন্য</div><div id="wr"></div><div class="serif" style="font-size:1.2rem;margin:14px 4px 8px">তুমি যা পাঠিয়েছো</div><div id="ws"></div>';
$("mem").appendChild(m3);
chips("wol",LB,function(i){wl=i},0);
[].forEach.call($("mm").children,function(b){b.addEventListener("click",function(){$("m3").classList.remove("on")})});
var wc=document.createElement("button");wc.className="chip";wc.textContent="📬 যখন খুলবে";
wc.onclick=function(){[].forEach.call($("mm").children,function(x){x.classList.toggle("on",x===wc)});panels("m",3,-1);$("m3").classList.add("on")};$("mm").appendChild(wc);
$("wos").onclick=function(){var t=$("wot").value.trim();if(!t||!DB)return;
 DB.collection("wo").add({from:WHO,for:PW,label:LB[wl],text:t,t:Date.now(),opened:false}).then(function(){$("wot").value=""})};
function rW(id,qs,rec){var b=$(id),a=[];b.innerHTML="";
 qs.forEach(function(d){a.push({id:d.id,x:d.data()})});a.sort(function(p,q){return q.x.t-p.x.t});
 if(!a.length){b.innerHTML='<p class="hint">কিছু নেই।</p>';return}
 a.forEach(function(o){var d=document.createElement("div");d.className="card item";
  var h=document.createElement("b");h.className="serif";h.textContent="💌 "+o.x.label;d.appendChild(h);
  var s=document.createElement("span");
  if(rec){if(o.x.opened){s.textContent=o.x.text;d.appendChild(s)}else{var k=document.createElement("button");k.textContent="খোলো";k.style.marginTop="8px";k.onclick=function(){DB.collection("wo").doc(o.id).update({opened:true});burst()};d.appendChild(k)}}
  else{s.className="hint";s.textContent=o.x.opened?"খোলা হয়েছে ✓":"এখনো বন্ধ";d.appendChild(s)}
  b.appendChild(d)})}

var _st2=start,s2=false;
start=function(){
 _st2();if(s2)return;s2=true;
 DB.doc("meta/next").onSnapshot(function(s){var d=s.data();NEXT=d&&d.d||null});
 DB.doc("answers/"+TODAY).onSnapshot(function(s){rA(s.data()||{})});
 var ls=-1;
 DB.doc("live/"+PW).onSnapshot(function(s){var d=s.data()||{};
  if((d.hold||0)!==pH){pH=d.hold||0;pRecv=Date.now();hv()}
  if(ls!==-1&&d.snap&&d.snap.t!==ls)notify(PN[PW]+" একটা স্ন্যাপ পাঠিয়েছে 📸");
  ls=d.snap?d.snap.t:0});
 var fv=true;
 DB.collection("voices").orderBy("t","desc").limit(4).onSnapshot(function(qs){rV(qs);
  if(!fv)qs.docChanges().forEach(function(c){if(c.type==="added"&&c.doc.data().from!==WHO)notify(PN[PW]+" একটা ভয়েস পাঠিয়েছে 🎙️")});fv=false});
 DB.collection("wo").where("for","==",WHO).onSnapshot(function(qs){rW("wr",qs,true)});
 DB.collection("wo").where("from","==",WHO).onSnapshot(function(qs){rW("ws",qs,false)});
};

/* ===== অনলাইন স্ট্যাটাস ও প্রোফাইল ছবি ===== */
(function(){
 var pr=document.createElement("div");pr.className="pres";
 pr.innerHTML='<div class="pp"><div class="av me" id="avMe" title="ছবি বদলাও"><span id="avMeT">🙂</span><i class="dot on" id="dotMe"></i></div><span id="nmMe">তুমি</span></div><div class="pp"><div class="av" id="avPt"><span id="avPtT">💗</span><i class="dot" id="dotPt"></i></div><span id="nmPt">—</span><span class="ptxt" id="stPt">অফলাইন</span></div>';
 var hero=document.querySelector("#home .hero");hero.appendChild(pr);
 var fi=document.createElement("input");fi.type="file";fi.accept="image/*";fi.id="avFile";document.body.appendChild(fi);
 var myAv=null,ptAv=null,ptSeen=0,ptOn=false,started2=false;

 function setAv(boxId,txtId,url){
  var box=$(boxId),old=box.querySelector("img"),t=$(txtId);
  if(old)old.remove();
  if(url){var im=document.createElement("img");im.src=url;im.alt="প্রোফাইল ছবি";box.insertBefore(im,box.firstChild);t.style.display="none"}
  else t.style.display="";
 }
 function ago(ms){var m=Math.floor(ms/60000);if(m<1)return "এইমাত্র";if(m<60)return bn(m)+" মিনিট আগে";var h=Math.floor(m/60);if(h<24)return bn(h)+" ঘণ্টা আগে";return bn(Math.floor(h/24))+" দিন আগে"}
 function renderPt(){
  if(!WHO)return;
  var on=ptSeen&&Date.now()-ptSeen<75000;
  $("dotPt").className="dot"+(on?" on":"");
  $("stPt").textContent=on?"অনলাইনে আছে 🟢":(ptSeen?"শেষ দেখা: "+ago(Date.now()-ptSeen):"অফলাইন");
  if(on&&!ptOn&&started2)notify(PN[PW]+" এখন অনলাইনে 💗");
  ptOn=on;
 }
 function beat(){
  if(!DB||!WHO||document.hidden)return;
  DB.doc("live/"+WHO).set({seen:Date.now()},{merge:true}).catch(function(){});
 }
 function begin(){
  $("nmMe").textContent="তুমি";$("nmPt").textContent=PN[PW];
  beat();setInterval(beat,30000);
  document.addEventListener("visibilitychange",function(){if(!document.hidden)beat()});
  window.addEventListener("pagehide",function(){if(DB&&WHO)DB.doc("live/"+WHO).set({seen:Date.now()-80000},{merge:true})});
  DB.doc("live/"+WHO).onSnapshot(function(s){var d=s.data()||{};if(d.avatar!==myAv){myAv=d.avatar||null;setAv("avMe","avMeT",myAv)}});
  DB.doc("live/"+PW).onSnapshot(function(s){var d=s.data()||{};
   ptSeen=d.seen||0;
   if(d.avatar!==ptAv){ptAv=d.avatar||null;setAv("avPt","avPtT",ptAv)}
   renderPt();started2=true});
  setInterval(renderPt,15000);
 }
 var _st3=start;
 start=function(){var was=started;_st3();if(!was)begin()};

 $("avMe").onclick=function(){fi.click()};
 fi.onchange=function(){
  var f=fi.files[0];if(!f||!DB)return;
  var im=new Image();im.onload=function(){
   var z=200,c=document.createElement("canvas");c.width=c.height=z;var x=c.getContext("2d");
   var m=Math.min(im.width,im.height),sx=(im.width-m)/2,sy=(im.height-m)/2;
   x.drawImage(im,sx,sy,m,m,0,0,z,z);
   var url=c.toDataURL("image/jpeg",.75);URL.revokeObjectURL(im.src);
   DB.doc("live/"+WHO).set({avatar:url},{merge:true}).catch(function(e){$("note").textContent="ছবিতে সমস্যা: "+e.code});
  };
  im.src=URL.createObjectURL(f);fi.value="";
 };
})();

/* ===== অ্যাক্টিভিটি বার ও চিঠির বাক্স ===== */
(function(){
 function goTab(t){var b=document.querySelector('nav button[data-t="'+t+'"]');if(b)b.click()}
 var seen=+(localStorage.getItem("actSeen")||0),evs=[],evReady=false;

 var bell=document.createElement("button");bell.id="bell";bell.setAttribute("aria-label","অ্যাক্টিভিটি");
 bell.innerHTML='<svg viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0112 0v5l2 2H4z"/><path d="M10 21a2 2 0 004 0"/></svg><b id="bellN"></b>';
 document.body.appendChild(bell);
 var act=document.createElement("div");act.id="act";
 act.innerHTML='<div class="box"><div class="serif" style="font-size:1.3rem;margin-bottom:10px">🔔 কী কী হলো</div><div id="evl"></div><button class="ghost" id="evx" style="margin-top:6px">বন্ধ করো</button></div>';
 document.body.appendChild(act);

 function unread(){return evs.filter(function(e){return e.t>seen}).length}
 function badge(){var n=unread(),b=$("bellN");b.style.display=n?"block":"none";b.textContent=n>9?"৯+":bn(n)}
 function renderEv(){
  var l=$("evl");l.innerHTML="";
  if(!evs.length){l.innerHTML='<p class="hint">এখনো কিছু হয়নি।</p>';return}
  evs.forEach(function(e){
   var b=document.createElement("button");b.className="ev"+(e.t>seen?" new":"");
   b.textContent=PN[e.from]+" "+e.text;
   var sm=document.createElement("small");sm.textContent=ft(e.t);b.appendChild(sm);
   b.onclick=function(){closeAct();goTab(e.tab||"home");if(e.sub==="letters")showLetters()};
   l.appendChild(b)})
 }
 function openAct(){renderEv();act.style.display="flex"}
 function closeAct(){act.style.display="none";seen=Date.now();localStorage.setItem("actSeen",seen);badge()}
 bell.onclick=openAct;$("evx").onclick=closeAct;
 act.addEventListener("click",function(e){if(e.target===act)closeAct()});

 function logEv(text,tab,sub){if(!DB||!WHO)return;DB.collection("events").add({from:WHO,text:text,tab:tab,sub:sub||"",t:Date.now()}).catch(function(){})}

 /* বিদ্যমান কাজগুলো থেকে নিজে নিজে ঘটনা লেখা */
 var MAP={notes:["একটা নোট রেখেছে 💌","home"],dares:["তোমার জন্য নতুন কার্ড বানিয়েছে 🎁","td"],voices:["ভয়েস পাঠিয়েছে 🎙️","home"],wo:["যখন খুলবে চিঠি রেখেছে 📬","mem"],letters:["তোমাকে একটা চিঠি লিখেছে ✉️","mem","letters"]};
 function patchDB(){
  var c=DB.collection.bind(DB);
  DB.collection=function(n){var r=c(n);
   if(MAP[n]){var a=r.add.bind(r);r.add=function(o){var m=MAP[n];logEv(m[0],m[1],m[2]);return a(o)}}
   return r}
 }
 $("send").addEventListener("click",function(){if(img)logEv("একটা স্ন্যাপ পাঠিয়েছে 📸","snap")},true);
 $("think").addEventListener("click",function(){logEv("তোমাকে ভাবছে 💞","home")},true);

 /* চিঠির বাক্স */
 var PAP=["🌸 গোলাপি","📜 পুরোনো","🌙 রাত"],pi=0;
 var m4=document.createElement("div");m4.className="panel";m4.id="m4";
 m4.innerHTML='<div class="card"><div class="hint" style="margin-bottom:6px">মন খুলে লম্বা চিঠি লেখো। কাগজ বেছে নাও।</div><div class="chips" id="ptc"></div><input type="text" id="lt" placeholder="চিঠির শিরোনাম" maxlength="60"><textarea id="lx" rows="8" placeholder="প্রিয়..."></textarea><span class="hint">কবে খুলতে পারবে? (না দিলে সাথে সাথে)</span><input type="date" id="ld" aria-label="খোলার তারিখ"><div class="two"><button class="ghost" id="lsv">খসড়া রাখো</button><button id="lsd">পাঠাও 💌</button></div><p class="note" id="ln"></p></div><div class="serif" style="font-size:1.2rem;margin:14px 4px 8px">তোমার জন্য</div><div id="lrc"></div><div class="serif" style="font-size:1.2rem;margin:14px 4px 8px">তুমি যা লিখেছো</div><div id="lsn"></div>';
 $("mem").appendChild(m4);
 chips("ptc",PAP,function(i){pi=i},0);
 try{var dr=JSON.parse(localStorage.getItem("ltd"));if(dr){$("lt").value=dr.t||"";$("lx").value=dr.x||"";$("ld").value=dr.d||""}}catch(e){}
 $("lsv").onclick=function(){localStorage.setItem("ltd",JSON.stringify({t:$("lt").value,x:$("lx").value,d:$("ld").value}));$("ln").textContent="খসড়া রাখা হলো ✓ (শুধু এই ফোনে)"};
 $("lsd").onclick=function(){
  var x=$("lx").value.trim();if(!x||!DB)return;
  var o={from:WHO,for:PW,title:$("lt").value.trim()||"একটা চিঠি",text:x,paper:pi,t:Date.now(),opened:false};
  if($("ld").value)o.openOn=$("ld").value;
  DB.collection("letters").add(o).then(function(){$("lt").value="";$("lx").value="";$("ld").value="";localStorage.removeItem("ltd");$("ln").textContent="চিঠি পাঠানো হয়েছে 💌"}).catch(function(e){$("ln").textContent="সমস্যা: "+e.code+" (Rules-এ letters যোগ করেছো?)"})
 };
 function showLetters(){
  [].forEach.call($("mm").children,function(x){x.classList.toggle("on",x===lc)});
  panels("m",3,-1);$("m3").classList.remove("on");m4.classList.add("on");
 }
 var lc=document.createElement("button");lc.className="chip";lc.textContent="📮 চিঠির বাক্স";lc.onclick=showLetters;$("mm").appendChild(lc);
 [].forEach.call($("mm").children,function(b){if(b!==lc)b.addEventListener("click",function(){m4.classList.remove("on")})});

 function paperEl(x,fresh){var d=document.createElement("div");d.className="paper p"+(x.paper||0)+(fresh?" fresh":"");var h=document.createElement("b");h.textContent=x.title;d.appendChild(h);d.appendChild(document.createTextNode(x.text));return d}
 var ltb=document.createElement("button");ltb.className="ghost";ltb.style.cssText="display:none;margin-bottom:12px";ltb.id="ltb";
 $("home").insertBefore(ltb,$("home").firstChild);ltb.onclick=function(){goTab("mem");showLetters()};
 function rL(id,qs,rec){
  var b=$(id),a=[];b.innerHTML="";qs.forEach(function(d){a.push({id:d.id,x:d.data()})});a.sort(function(p,q){return q.x.t-p.x.t});
  if(!a.length){b.innerHTML='<p class="hint">কোনো চিঠি নেই।</p>';return a}
  a.forEach(function(o){var x=o.x;
   if(rec){
    if(x.opened){b.appendChild(paperEl(x,false));var sm=document.createElement("div");sm.className="hint";sm.textContent=PN[x.from]+", "+ft(x.t);b.appendChild(sm);return}
    var locked=x.openOn&&x.openOn>TODAY,e=document.createElement("div");e.className="env";
    e.innerHTML='<div class="big">'+(locked?"🔒":"✉️")+'</div><div class="serif" style="font-size:1.15rem"></div><div class="hint"></div>';
    e.children[1].textContent=PN[x.from]+"র চিঠি, "+x.title;
    e.children[2].textContent=locked?fd(x.openOn)+" তারিখে খুলবে":"চাপলে খুলবে";
    if(!locked){var k=document.createElement("button");k.textContent="খামটা খোলো";k.style.marginTop="10px";
     k.onclick=function(){DB.collection("letters").doc(o.id).update({opened:true});logEv("তোমার চিঠি খুলেছে 💌","mem","letters");burst()};e.appendChild(k)}
    b.appendChild(e);
   }else{
    var dt=document.createElement("details");dt.className="card item";var su=document.createElement("summary");
    su.textContent=x.title+"  ·  "+(x.opened?"খোলা হয়েছে ✓":x.openOn&&x.openOn>TODAY?"খুলবে "+fd(x.openOn):"এখনো বন্ধ");dt.appendChild(su);dt.appendChild(paperEl(x,false));b.appendChild(dt)}
  });return a}
 var s4=false;
 var _st4=start;
 start=function(){
  var was=s4;if(!was){s4=true;patchDB()}
  _st4();if(was)return;
  bell.style.display="flex";
  DB.collection("events").orderBy("t","desc").limit(30).onSnapshot(function(qs){
   evs=[];qs.forEach(function(d){var x=d.data();if(x.from!==WHO)evs.push(x)});badge();if(act.style.display==="flex")renderEv()});
  DB.collection("letters").where("for","==",WHO).onSnapshot(function(qs){
   var a=rL("lrc",qs,true),n=a.filter(function(o){return !o.x.opened&&!(o.x.openOn&&o.x.openOn>TODAY)}).length;
   ltb.style.display=n?"block":"none";ltb.textContent="📬 "+PN[PW]+"র নতুন চিঠি এসেছে ("+bn(n)+")"});
  DB.collection("letters").where("from","==",WHO).onSnapshot(function(qs){rL("lsn",qs,false)},function(e){$("ln").textContent="চিঠিতে সমস্যা: "+e.code});
 };
})();

/* ===== লাইভ আঁকা ও শেয়ার করা স্মৃতি ===== */
(function(){
 var cv=$("cv"),cx=cv.getContext("2d"),col="#E0356B",bw=5,drw=false,cur=null,mine=[],other=[],dDirty=false,dTimer=null,dU=0,dClr=false,lx=0,ly=0,inited=false,idle=null,lastNote=0,lastEv=0;
 var CC=["#E0356B","#FF8FB1","#8E2DE2","#4A1530","#FFFFFF"],BW=[5,12],ST="দুজনে একসাথে আঁকো ✏️";
 cx.scale(2,2);
 function pt(e){var r=cv.getBoundingClientRect();return[(e.clientX-r.left)*360/r.width,(e.clientY-r.top)*360/r.height]}
 function dStroke(s){
  var p=(s.p||"").split(",").map(Number),n=p.length>>1;if(!n)return;
  cx.strokeStyle=s.c;cx.fillStyle=s.c;cx.lineWidth=s.w;cx.lineCap="round";cx.lineJoin="round";
  if(n===1){cx.beginPath();cx.arc(p[0],p[1],s.w/2,0,7);cx.fill();return}
  cx.beginPath();cx.moveTo(p[0],p[1]);for(var i=1;i<n;i++)cx.lineTo(p[2*i],p[2*i+1]);cx.stroke()}
 function dRedraw(){
  cx.fillStyle="#fff";cx.fillRect(0,0,360,360);
  other.concat(mine).sort(function(a,b){return a.t-b.t}).forEach(dStroke);
  if(cur)dStroke(cur)}
 function dTrim(){while(mine.length>1&&JSON.stringify(mine).length>600000)mine.shift()}
 function dSave(){
  if(!DB||!WHO)return;dTrim();
  var all=cur?mine.concat([cur]):mine,u=Date.now();dU=u;
  DB.doc("meta/draw_"+WHO).set({strokes:all,u:u}).then(function(){if(dU===u&&!drw)dDirty=false}).catch(function(e){$("dst").textContent="সমস্যা: "+e.code})}
 function dQueue(now){
  dDirty=true;
  if(now){clearTimeout(dTimer);dTimer=null;dSave();return}
  if(!dTimer)dTimer=setTimeout(function(){dTimer=null;dSave()},700)}
 function evl(){
  var n=Date.now();if(n-lastEv<300000||!DB||!WHO)return;lastEv=n;
  DB.collection("events").add({from:WHO,text:"ছবি আঁকছে 🎨",tab:"games",sub:"",t:n}).catch(function(){})}

 cv.onpointerdown=function(e){
  e.preventDefault();var p=pt(e);drw=true;lx=Math.round(p[0]);ly=Math.round(p[1]);
  cur={c:col,w:col==="#FFFFFF"?bw*2.5:bw,t:Date.now(),p:lx+","+ly};
  try{cv.setPointerCapture(e.pointerId)}catch(er){}
  dRedraw();dQueue()};
 cv.onpointermove=function(e){
  if(!drw||!cur)return;var p=pt(e),x=Math.round(p[0]),y=Math.round(p[1]);
  if(Math.abs(x-lx)+Math.abs(y-ly)<3)return;
  cx.strokeStyle=cur.c;cx.lineWidth=cur.w;cx.lineCap="round";cx.lineJoin="round";
  cx.beginPath();cx.moveTo(lx,ly);cx.lineTo(x,y);cx.stroke();
  lx=x;ly=y;cur.p+=","+x+","+y;dQueue()};
 function dEnd(){
  if(!drw)return;drw=false;
  if(dClr){dClr=false;mine=[]}
  if(cur){mine.push(cur);cur=null}
  dRedraw();dQueue(true);evl()}
 cv.onpointerup=dEnd;cv.onpointercancel=dEnd;
 cv.addEventListener("contextmenu",function(e){e.preventDefault()});

 chips("cc",["গোলাপি","হালকা","বেগুনি","গাঢ়","রাবার"],function(i){col=CC[i]},0);
 chips("cw",["চিকন","মোটা"],function(i){bw=BW[i]},0);
 $("cclr").onclick=function(){
  if(!confirm("দুজনের আঁকাই মুছে যাবে। মুছবে?"))return;
  mine=[];other=[];cur=null;dClr=false;dRedraw();
  if(DB){var u=Date.now();dU=u;
   DB.doc("meta/draw_"+WHO).set({strokes:[],u:u});
   DB.doc("meta/draw_"+PW).set({strokes:[],u:u})}};
 $("csv").onclick=function(){
  var a=document.createElement("a");a.href=cv.toDataURL("image/png");a.download="sagor-shima-"+TODAY+".png";
  document.body.appendChild(a);a.click();a.remove()};
 dRedraw();

 /* শেয়ার করা টাইমলাইন ও বাকেট লিস্ট */
 var _save=save,mFirst=true;
 function pushMem(){if(DB)DB.doc("meta/memory").set({tl:TL2,bl:BL},{merge:true}).catch(function(){})}
 save=function(k,v){_save(k,v);if(k==="tl"||k==="bl")pushMem()};
 function mg(a,b,kf){var m={},o=[];a.concat(b).forEach(function(x){var k=kf(x);if(!m[k]){m[k]=1;o.push(x)}});return o}

 var _s=start,ran=false;
 start=function(){
  var was=ran;ran=true;_s();if(was)return;
  DB.doc("meta/draw_"+PW).onSnapshot(function(s){
   var d=s.data()||{},a=d.strokes||[],last=a.length?a[a.length-1]:null,pl=other.length?other[other.length-1]:null;
   var changed=a.length!==other.length||(last&&pl&&last.p!==pl.p);
   other=a;dRedraw();
   if(inited&&changed&&a.length){
    $("dst").textContent=PN[PW]+" এখন আঁকছে ✏️";clearTimeout(idle);idle=setTimeout(function(){$("dst").textContent=ST},4000);
    if(Date.now()-lastNote>60000&&(document.hidden||!$("g3").classList.contains("on"))){lastNote=Date.now();notify(PN[PW]+" আঁকছে ✏️")}}
   inited=true});
  DB.doc("meta/draw_"+WHO).onSnapshot(function(s){
   if(s.metadata.hasPendingWrites)return;
   var d=s.data()||{},a=d.strokes||[];
   if(d.u&&d.u===dU)return;
   if(!a.length&&mine.length&&(d.u||0)>dU){
    if(drw){dClr=true;return}
    mine=[];dDirty=false;clearTimeout(dTimer);dTimer=null;dRedraw();return}
   if(!drw&&!dDirty){mine=a;dRedraw()}});
  DB.doc("meta/memory").onSnapshot(function(s){
   if(s.metadata.hasPendingWrites)return;
   var d=s.data();
   if(!d){mFirst=false;pushMem();return}
   if(mFirst){mFirst=false;
    var a=mg(d.tl||[],TL2,function(x){return x.d+"|"+x.t}),b=mg(d.bl||[],BL,function(x){return x.t});
    var grow=a.length>(d.tl||[]).length||b.length>(d.bl||[]).length;TL2=a;BL=b;if(grow)pushMem()}
   else{TL2=d.tl||TL2;BL=d.bl||BL}
   _save("tl",TL2);_save("bl",BL);rt();rb()});
 };
})();

/* ===== স্পিন হুইল ও পেনাল্টি শুটআউট ===== */
(function(){
 function ev(t){if(DB&&WHO)DB.collection("events").add({from:WHO,text:t,tab:"games",sub:"",t:Date.now()}).catch(function(){})}
 var gm=$("gm"),gsec=$("games");
 var wp=document.createElement("div");wp.className="panel card";wp.id="g5";
 wp.innerHTML='<div class="chips" id="wtabs"></div><div class="wwrap"><div class="wptr"></div><canvas id="wcv" width="640" height="640"></canvas></div><div class="wres" id="wres"></div><button id="wsp">🎡 ঘোরাও</button><div class="serif" style="font-size:1.1rem;margin:16px 0 6px">⏱️ শেষ ২৪ ঘণ্টা</div><div id="whist"></div><details style="margin-top:12px"><summary>✏️ চাকার ঘর সাজাও</summary><textarea id="wed" rows="7" placeholder="প্রতি লাইনে একটা, ২ থেকে ১২টা"></textarea><button class="ghost" id="wsv">সেভ করো</button><p class="note" id="wnn"></p></details>';
 var pn=document.createElement("div");pn.className="panel card";pn.id="g6";
 pn.innerHTML='<div class="score" id="pscore">⚽</div><p class="note" id="pstat"></p><div class="goal" id="pgoal"></div><p class="wres" id="plast" style="min-height:2em"></p><button class="ghost" id="prst">নতুন ম্যাচ</button><p class="hint" style="text-align:center">৫ রাউন্ড করে, পালা করে শট। দুজন একই সময়ে না থাকলেও চলবে।</p>';
 gsec.appendChild(wp);gsec.appendChild(pn);

 var wc=document.createElement("button"),pc=document.createElement("button");
 wc.className=pc.className="chip";wc.textContent="🎡 চাকা";pc.textContent="⚽ পেনাল্টি";
 gm.appendChild(wc);gm.appendChild(pc);
 function showG(i){[].forEach.call(gm.children,function(x){x.classList.toggle("on",x===(i===5?wc:pc))});panels("g",5,-1);$("g5").classList.toggle("on",i===5);$("g6").classList.toggle("on",i===6)}
 wc.onclick=function(){showG(5)};pc.onclick=function(){showG(6)};
 [].forEach.call(gm.children,function(b){if(b!==wc&&b!==pc)b.addEventListener("click",function(){$("g5").classList.remove("on");$("g6").classList.remove("on")})});

 /* চাকা */
 var WD=["৫ মিনিট জড়িয়ে ধরা 🤗","কপালে আলতো চুমু 😘","কানে ফিসফিস করে কিছু বলা","পিঠে ম্যাসাজ 💆","চোখ বেঁধে অনুমান 🙈","ধীরে ধীরে নাচ 💃"];
 var WCOL=["#FF8FB1","#FFC9DC","#E0356B","#FFB3CF","#C2185B","#FFD6E6"];
 var wd={},wcur="me",rot=0,spin=false,seenT={},wcv=$("wcv"),x=wcv.getContext("2d");
 function key(){return wcur==="me"?WHO:PW}
 function items(){return (wd[key()]&&wd[key()].items)||WD}
 function trunc(t){return t.length>15?t.slice(0,14)+"…":t}
 function drawW(){
  var it=items(),n=it.length,a=2*Math.PI/n,c=320,r=312;x.clearRect(0,0,640,640);
  for(var i=0;i<n;i++){
   x.beginPath();x.moveTo(c,c);x.arc(c,c,r,-Math.PI/2+i*a,-Math.PI/2+(i+1)*a);x.closePath();x.fillStyle=WCOL[i%WCOL.length];x.fill();
   x.save();x.translate(c,c);x.rotate(-Math.PI/2+i*a+a/2);x.fillStyle=(i%WCOL.length===2||i%WCOL.length===4)?"#fff":"#4A1530";x.font="24px 'Hind Siliguri',sans-serif";x.textAlign="right";x.fillText(trunc(it[i]),r-18,8);x.restore();
  }
  x.beginPath();x.arc(c,c,26,0,7);x.fillStyle="#fff";x.fill();
 }
 function wtabs(){var b=$("wtabs");b.innerHTML="";[["me","তোমার চাকা"],["pt",PN[PW]+"র চাকা"]].forEach(function(o){var t=document.createElement("button");t.className="chip"+(wcur===o[0]?" on":"");t.textContent=o[1];t.onclick=function(){wcur=o[0];wtabs();drawW();hist();$("wed").value=items().join("\n");$("wres").textContent=""};b.appendChild(t)})}
 function hist(){
  var b=$("whist"),h=((wd[key()]||{}).hist||[]).filter(function(e){return Date.now()-e.t<864e5}).sort(function(p,q){return q.t-p.t});b.innerHTML="";
  if(!h.length){b.innerHTML='<p class="hint">এখনো কিছু আসেনি।</p>';return}
  var nm=key()===WHO?"তোমার":PN[key()]+"র";
  h.forEach(function(e){var d=document.createElement("div");d.className="hint";d.style.margin="4px 0";d.textContent=nm+" চাকায় এসেছিল: "+e.text+", "+ft(e.t);b.appendChild(d)})}
 function anim(idx,text){
  spin=true;$("wsp").disabled=true;$("wres").textContent="";
  var n=items().length,a=360/n,center=idx*a+a/2,base=Math.ceil(rot/360)*360;
  rot=base+360*5+(360-center);wcv.style.transform="rotate("+rot+"deg)";
  setTimeout(function(){spin=false;$("wsp").disabled=false;$("wres").textContent="🎉 "+text;burst()},4300)}
 $("wsp").onclick=function(){
  if(spin||!DB)return;var k=key(),it=items(),idx=Math.floor(Math.random()*it.length),t=Date.now(),text=it[idx];
  seenT[k]=t;anim(idx,text);ev("চাকা ঘুরিয়েছে 🎡");
  var ref=DB.doc("meta/wheel_"+k);
  ref.get().then(function(d){var h=((d.data()||{}).hist||[]).filter(function(e){return t-e.t<864e5});h.push({text:text,by:WHO,t:t});
   return ref.set({last:{idx:idx,text:text,by:WHO,t:t},hist:h},{merge:true})}).catch(function(e){$("wnn").textContent="সমস্যা: "+e.code})};
 $("wsv").onclick=function(){
  var it=$("wed").value.split("\n").map(function(v){return v.trim()}).filter(Boolean).slice(0,12);
  if(it.length<2){$("wnn").textContent="কমপক্ষে ২টা ঘর লাগবে।";return}
  DB.doc("meta/wheel_"+key()).set({items:it},{merge:true}).then(function(){$("wnn").textContent="সেভ হয়েছে ✓"}).catch(function(e){$("wnn").textContent="সমস্যা: "+e.code})};

 /* পেনাল্টি */
 var PD=["⬅️ বাঁ","⬆️ মাঝ","➡️ ডান"],ps=null,lastPT=null,resolving=-1;
 function pdef(){return {n:0,score:{sagor:0,shima:0},picks:{}}}
 function prender(){
  var s=ps||pdef(),n=s.n||0,sc=s.score||{},pk=s.picks||{},k=n%2===0?"sagor":"shima",o=k==="sagor"?"shima":"sagor",g=$("pgoal");
  $("pscore").textContent=PN.sagor+" "+bn(sc.sagor||0)+" - "+bn(sc.shima||0)+" "+PN.shima;
  g.innerHTML="";
  if(n>=10){var a=sc.sagor||0,b=sc.shima||0;$("pstat").textContent=a===b?"ম্যাচ ড্র! 🤝":"🏆 "+(a>b?PN.sagor:PN.shima)+" জিতেছে!";g.style.display="none"}
  else{
   g.style.display="grid";var me=WHO===k,mine=pk[WHO];
   $("pstat").textContent="শট "+bn(n+1)+"/"+bn(10)+": "+(me?"তুমি শট নাও ⚽":"তুমি গোলকিপার 🧤 (শট নেবে "+PN[k]+")")+(mine!=null?", তোমার চাল দেওয়া হয়েছে, অপেক্ষা করো...":"");
   PD.forEach(function(t,i){var b=document.createElement("button");b.textContent=t;if(mine===i)b.className="pk";b.disabled=mine!=null;
    b.onclick=function(){var o2={};o2[WHO]=i;DB.doc("meta/pen").set({picks:o2},{merge:true}).then(function(){ev("পেনাল্টিতে চাল দিয়েছে ⚽")}).catch(function(e){$("pstat").textContent="সমস্যা: "+e.code})};g.appendChild(b)});
   if(WHO===k&&pk[k]!=null&&pk[o]!=null&&resolving!==n){
    resolving=n;var goal=pk[k]!==pk[o],u={n:n+1,picks:firebase.firestore.FieldValue.delete(),last:{k:k,shot:pk[k],keep:pk[o],goal:goal,t:Date.now()}};
    u["score."+k]=(sc[k]||0)+(goal?1:0);DB.doc("meta/pen").update(u).catch(function(e){resolving=-1;$("pstat").textContent="সমস্যা: "+e.code})}
  }
  var l=s.last;if(l){$("plast").textContent=(l.goal?"⚽ গোল! ":"🧤 সেভ! ")+PN[l.k]+" "+PD[l.shot]+" মেরেছিল, কিপার "+PD[l.keep]+" ঝাঁপ দিয়েছিল";
   if(lastPT!==null&&l.t>lastPT&&l.goal)burst();lastPT=l.t}else $("plast").textContent="";
 }
 $("prst").onclick=function(){if(DB)DB.doc("meta/pen").set({n:0,score:{sagor:0,shima:0},picks:{},last:null}).then(function(){resolving=-1;lastPT=null})};

 var s5=false,_st5=start;
 start=function(){
  var was=s5;s5=true;_st5();if(was)return;
  wtabs();drawW();hist();$("wed").value=items().join("\n");
  ["sagor","shima"].forEach(function(k){
   var first=true;
   DB.doc("meta/wheel_"+k).onSnapshot(function(s){
    var d=s.data()||{};wd[k]=d;
    if(k===key()){drawW();hist()}
    var l=d.last;
    if(first){seenT[k]=l?l.t:0;first=false;return}
    if(l&&l.t>(seenT[k]||0)){seenT[k]=l.t;if(l.by!==WHO){if(k===key()&&$("g5").classList.contains("on")&&!spin)anim(l.idx,l.text);else notify(PN[PW]+" "+(k===WHO?"তোমার":PN[k]+"র")+" চাকা ঘুরিয়েছে 🎡")}}
   })});
  DB.doc("meta/pen").onSnapshot(function(s){ps=s.exists?s.data():null;prender()});
 };
 prender();
})();

/* ===== মিলনের দৌড় (সাগর + শিমা বনাম ব্লকার বট) ===== */
(function(){
 /*LOGIC_START*/
 var N=9,LIMIT=30,DIR={u:[-1,0],d:[1,0],l:[0,-1],r:[0,1]},BP=[[0,0],[8,8],[4,4],[4,6]];
 function dist(a,b){return Math.abs(a.r-b.r)+Math.abs(a.c-b.c)}
 function wall(r,c){return r<0||c<0||r>=N||c>=N||(r%2===1&&c%2===1)}
 function fresh(nb,lv){
  var bots=[];for(var i=0;i<nb;i++)bots.push({r:BP[i][0],c:BP[i][1],s:0,l:0});
  return{v:1,n:0,phase:"play",nb:nb,lv:lv,sagor:{r:8,c:0},shima:{r:0,c:8},bots:bots,caught:false,prog:0,picks:{},evs:[],by:WHO,t:Date.now()}}
 function resolve(d){
  var s=JSON.parse(JSON.stringify(d)),P=s.picks||{},sg=s.sagor,sh=s.shima,bots=s.bots,evs=[];
  function occ(r,c,ex){
   if(ex!=="sg"&&sg.r===r&&sg.c===c)return true;
   if(ex!=="sh"&&sh.r===r&&sh.c===c)return true;
   for(var i=0;i<bots.length;i++){if(ex==="b"+i||bots[i].l)continue;if(bots[i].r===r&&bots[i].c===c)return true}
   return false}
  function mv(pos,ex,k){var v=DIR[k];if(!v)return;var r=pos.r+v[0],c=pos.c+v[1];if(wall(r,c)||occ(r,c,ex))return;pos.r=r;pos.c=c}
  function bfs(f,t,ex){
   var q=[{r:f.r,c:f.c,p:null}],seen={};seen[f.r*N+f.c]=1;
   for(var h=0;h<q.length;h++){var a=q[h];
    if(a.r===t.r&&a.c===t.c){var x=a;while(x.p&&x.p.p)x=x.p;if(!x.p)return null;if(x.r===t.r&&x.c===t.c)return null;return{r:x.r,c:x.c}}
    for(var k in DIR){var nr=a.r+DIR[k][0],nc=a.c+DIR[k][1];
     if(wall(nr,nc)||seen[nr*N+nc])continue;
     if(!(nr===t.r&&nc===t.c)&&occ(nr,nc,ex))continue;
     seen[nr*N+nc]=1;q.push({r:nr,c:nc,p:a})}}
   return null}
  function rnd(f,ex){
   var ks=["u","d","l","r"].sort(function(){return Math.random()-.5});
   for(var i=0;i<4;i++){var r=f.r+DIR[ks[i]][0],c=f.c+DIR[ks[i]][1];if(!wall(r,c)&&!occ(r,c,ex))return{r:r,c:c}}
   return null}
  function done(){s.n++;s.picks={};s.evs=evs;s.t=Date.now();return s}

  mv(sg,"sg",P.sagor);
  if(!s.caught)mv(sh,"sh",P.shima);
  if(!s.caught&&dist(sg,sh)===1){s.phase="win";evs.push({k:"win"});return done()}

  var lvp=[.45,.65,.9][s.lv];if(lvp==null)lvp=.75;
  bots.forEach(function(b,i){
   if(b.l)return;
   if(b.s>0){b.s--;return}
   if(i===3&&s.n%2===1)return;
   if(Math.random()>lvp)return;
   var t=null;
   if(s.caught)t=sg;
   else if(i===0||i===3)t=sh;
   else if(i===1)t=sg;
   else if(Math.random()<.5)t=dist(b,sg)<dist(b,sh)?sg:sh;
   var nx=t?bfs(b,t,"b"+i):rnd(b,"b"+i);
   if(nx){b.r=nx.r;b.c=nx.c}});

  if(s.caught){
   if(P.sagor==="x"&&dist(sg,sh)===1){
    var blocked=bots.some(function(b){return !b.l&&dist(b,sg)===1});
    if(blocked){s.prog=0;evs.push({k:"rb"})}else{s.prog=(s.prog||0)+1;evs.push({k:"rp",v:s.prog})}
   }
   if(s.prog>=2){s.phase="win";evs.push({k:"win"});return done()}
  }else{
   var adj=[];bots.forEach(function(b,i){if(!b.l&&dist(b,sh)===1)adj.push(i)});
   if(adj.length>=2){s.caught=true;s.prog=0;adj.forEach(function(i){bots[i].r=sh.r;bots[i].c=sh.c;bots[i].l=1});evs.push({k:"catch",b:adj})}
  }
  if(s.n+1>=LIMIT){s.phase="lose";evs.push({k:"lose"})}
  return done()}
 /*LOGIC_END*/

 var BE=["😈","🦊","🐻","🤪"],cs=null,cfg=[],nbSel=3,lvSel=1,inited=false;
 var gm=$("gm"),gsec=$("games");
 function ev(t){if(DB&&WHO)DB.collection("events").add({from:WHO,text:t,tab:"games",sub:"",t:Date.now()}).catch(function(){})}
 function nm(i){return (cfg[i]||"").trim()||"ব্লকার "+bn(i+1)}

 var pn=document.createElement("div");pn.className="panel card";pn.id="g7";
 pn.innerHTML='<p class="note" id="cst"></p><div class="cg" id="cgrid"></div><div class="legend" id="cleg"></div><p class="wres" id="cmsg" style="font-size:1.05rem;min-height:2.4em"></p>'+
  '<div class="dpad" id="cdp"><span></span><button data-k="u" aria-label="উপরে">⬆️</button><span></span><button data-k="l" aria-label="বাঁয়ে">⬅️</button><button data-k="s" aria-label="দাঁড়াও">⏸️</button><button data-k="r" aria-label="ডানে">➡️</button><span></span><button data-k="d" aria-label="নিচে">⬇️</button><span></span></div>'+
  '<button id="cx" style="display:none;margin-bottom:10px">🆘 উদ্ধার করো</button>'+
  '<div class="chips" id="cnb"></div><div class="chips" id="clv"></div><button class="ghost" id="cnew">🎮 নতুন খেলা</button>'+
  '<details style="margin-top:12px"><summary>👾 ব্লকারদের নাম দাও</summary><input type="text" id="cn0" maxlength="14" placeholder="১ নম্বর ব্লকার 😈"><input type="text" id="cn1" maxlength="14" placeholder="২ নম্বর ব্লকার 🦊"><input type="text" id="cn2" maxlength="14" placeholder="৩ নম্বর ব্লকার 🐻"><input type="text" id="cn3" maxlength="14" placeholder="৪ নম্বর ব্লকার 🤪"><button class="ghost" id="cns">নাম সেভ করো</button><p class="note" id="cnn"></p></details>'+
  '<p class="hint" style="margin-top:12px">নিয়ম: সাগর 🧑 আর শামীমা আফরোজ শিমা 👩 পাশাপাশি এলেই জিত। দুজন ব্লকার শিমার দুপাশে এলে সে আটকা পড়বে, ওরা তার ওপর শুয়ে পড়বে 😂। তখন সাগর কাছে গিয়ে ২ বার 🆘 চাপলে শিমা ছাড়া পাবে, তবে ছাড়া ব্লকার সাগরের পাশে থাকলে উদ্ধার থামবে। ৩০ রাউন্ডের মধ্যে মিলতে হবে। দুজনেই চাল দিলে তবে পরের রাউন্ড শুরু হয়। কম্পিউটার ব্লকাররা নিজে নিজে চলে।</p>';
 gsec.appendChild(pn);

 var c7=document.createElement("button");c7.className="chip";c7.textContent="💞 মিলনের দৌড়";gm.appendChild(c7);
 c7.onclick=function(){[].forEach.call(gm.children,function(x){x.classList.toggle("on",x===c7)});panels("g",5,-1);$("g5").classList.remove("on");$("g6").classList.remove("on");pn.classList.add("on")};
 [].forEach.call(gm.children,function(b){if(b!==c7)b.addEventListener("click",function(){pn.classList.remove("on")})});
 chips("cnb",["৩ জন ব্লকার","৪ জন ব্লকার"],function(i){nbSel=3+i},0);
 chips("clv",["সহজ","মাঝারি","কঠিন"],function(i){lvSel=i},1);

 function evText(e){
  if(e.k==="catch")return e.b.map(nm).join(" ও ")+" শামীমা আফরোজ শিমার ওপর শুয়ে পড়েছে 😂 শিমা আটকা!";
  if(e.k==="rp")return "🆘 উদ্ধার চলছে "+bn(e.v)+"/২";
  if(e.k==="rb")return "ব্লকাররা বাধা দিলো, উদ্ধার থামলো 😤";
  if(e.k==="win")return "🎉 সাগর আর শামীমা আফরোজ শিমা এক হয়েছে!";
  if(e.k==="lose")return "⏰ সময় শেষ, ব্লকাররা জিতেছে 😈";
  return ""}

 function crender(){
  var g=$("cgrid"),leg=$("cleg");g.innerHTML="";leg.innerHTML="";
  if(!cs){$("cst").textContent="এখনো খেলা শুরু হয়নি। নিচে নতুন খেলা চাপো।";$("cmsg").textContent="";[].forEach.call($("cdp").children,function(b){b.disabled=true});$("cx").style.display="none";return}
  var cell={},k=function(r,c){return r*N+c};
  cell[k(cs.sagor.r,cs.sagor.c)]={t:"🧑",cl:"sg"};
  var lay="";
  cs.bots.forEach(function(b,i){if(b.l)lay+=BE[i];else cell[k(b.r,b.c)]={t:b.s>0?"😵":BE[i],cl:""}});
  cell[k(cs.shima.r,cs.shima.c)]={t:"👩",cl:"sh"+(cs.caught?" pile":""),sm:lay};
  for(var r=0;r<N;r++)for(var c=0;c<N;c++){
   var d=document.createElement("div"),o=cell[k(r,c)];
   if(o){d.className=o.cl;d.textContent=o.t;if(o.sm){var sm=document.createElement("small");sm.textContent=o.sm;d.appendChild(sm)}}
   else if(wall(r,c)){d.className="w";d.textContent="🧱"}
   g.appendChild(d)}
  cs.bots.forEach(function(b,i){var sp=document.createElement("span");sp.textContent=BE[i]+" "+nm(i)+(b.l?" (শুয়ে আছে)":b.s>0?" (ঝিমুচ্ছে)":"");leg.appendChild(sp)});
  var P=cs.picks||{},mine=P[WHO],other=P[PW],play=cs.phase==="play",me=WHO==="sagor"?"🧑 সাগর":"👩 শিমা";
  var st="তুমি "+me;
  if(cs.phase==="win")st+=" · 🏆 জিতে গেছো!";
  else if(cs.phase==="lose")st+=" · ব্লকাররা জিতেছে";
  else{
   st+=" · রাউন্ড "+bn(cs.n+1)+"/"+bn(LIMIT);
   if(cs.caught)st+=" · শিমা আটকা 🆘";
   if(WHO==="shima"&&cs.caught)st+=" · তুমি আটকা, সাগরের অপেক্ষা করো";
   else if(mine)st+=" · চাল দেওয়া হয়েছে, অপেক্ষা করো…";
   else st+=" · তোমার চাল দাও"+(other?" ("+PN[PW]+" দিয়ে ফেলেছে)":"")}
  $("cst").textContent=st;
  $("cmsg").textContent=(cs.evs||[]).map(evText).filter(Boolean).join(" · ");
  var off=!play||!!mine||(WHO==="shima"&&cs.caught);
  [].forEach.call($("cdp").children,function(b){b.disabled=off});
  var cx=$("cx");cx.style.display=(WHO==="sagor"&&cs.caught&&play)?"block":"none";cx.disabled=!!mine;
 }

 function pick(k){
  if(!DB||!cs||cs.phase!=="play"||(cs.picks||{})[WHO])return;
  if(k==="x"&&WHO!=="sagor")return;
  if(cs.caught&&WHO==="shima")return;
  var ref=DB.doc("meta/chase"),myN=cs.n;
  DB.runTransaction(function(tx){return tx.get(ref).then(function(doc){
   var d=doc.data();if(!d||d.phase!=="play"||d.n!==myN)return;
   var P=d.picks||{};if(P[WHO])return;P[WHO]=k;
   var need=d.caught?["sagor"]:["sagor","shima"];
   if(need.every(function(w){return P[w]})){d.picks=P;tx.set(ref,resolve(d))}
   else{var o={};o["picks."+WHO]=k;tx.update(ref,o)}
  })}).catch(function(e){$("cst").textContent="সমস্যা: "+(e.code||e.message)})}
 [].forEach.call($("cdp").querySelectorAll("button"),function(b){b.onclick=function(){pick(b.dataset.k)}});
 $("cx").onclick=function(){pick("x")};
 document.addEventListener("keydown",function(e){
  if(!pn.classList.contains("on")||!$("games").classList.contains("on"))return;
  if(/INPUT|TEXTAREA/.test((document.activeElement||{}).tagName||""))return;
  var m={ArrowUp:"u",ArrowDown:"d",ArrowLeft:"l",ArrowRight:"r"," ":"s"}[e.key];
  if(m){e.preventDefault();pick(m)}});

 $("cnew").onclick=function(){
  if(!DB||!WHO)return;
  DB.doc("meta/chase").set(fresh(nbSel,lvSel)).then(function(){ev("মিলনের দৌড় শুরু করেছে 💞")}).catch(function(e){$("cst").textContent="সমস্যা: "+e.code})};
 $("cns").onclick=function(){
  var a=[0,1,2,3].map(function(i){return $("cn"+i).value.trim()});
  if(!DB)return;
  DB.doc("meta/chase_cfg").set({names:a},{merge:true}).then(function(){$("cnn").textContent="নাম সেভ হয়েছে ✓"}).catch(function(e){$("cnn").textContent="সমস্যা: "+e.code})};

 var _s=start,ran=false;
 start=function(){
  var was=ran;ran=true;_s();if(was)return;
  DB.doc("meta/chase_cfg").onSnapshot(function(s){
   var d=s.data()||{};cfg=d.names||[];
   [0,1,2,3].forEach(function(i){var e=$("cn"+i);if(document.activeElement!==e)e.value=cfg[i]||""});
   crender()});
  DB.doc("meta/chase").onSnapshot(function(s){
   var d=s.exists?s.data():null,pp=cs?cs.phase:null,pt=cs?cs.t:0;
   cs=d;crender();
   if(d&&inited){
    if(pp==="play"&&d.phase==="win"){burst();win()}
    if(pp==="play"&&d.phase!=="play")notify(d.phase==="win"?"সাগর আর শিমা এক হয়েছে 🎉":"মিলনের দৌড় শেষ, ব্লকাররা জিতেছে 😈");
    if(d.n===0&&d.t>pt&&d.by!==WHO)notify(PN[PW]+" মিলনের দৌড় শুরু করেছে 💞")}
   inited=true});
 };
})();
