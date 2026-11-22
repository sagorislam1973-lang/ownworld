/* ===== LIVE LOCATION SHARING (১৩.২) =====
   Current Activity থেকে সম্পূর্ণ আলাদা: আলাদা সেকশন, আলাদা ডেটা (loc/*), আলাদা অনুমতি, আলাদা লজিক।
   Activity লিখলে GPS চালু হয় না, GPS চালু করলে Activity বদলায় না।

   ডেটা: loc/{sagor|shima} → একটাই ডকুমেন্ট, প্রতিবার overwrite। কোনো লোকেশন ইতিহাস জমে না।
     { sharing, started, until|null, lat, lng, acc, t (শেষ GPS ফিক্সের সময়), hb (অ্যাপ শেষ কখন জানিয়েছে), st: wait|ok|denied|unavail }
   নিয়ম:
   • ডিফল্ট OFF। চালু হয় শুধু নিজে বোতাম চেপে ও নিশ্চিত করলে।
   • লাইভ বলা হয় শুধু যখন st=ok ও hb ১৫০ সেকেন্ডের মধ্যে। নইলে সবসময় "Last Known"।
   • বন্ধ করলে বা ডেটা মুছলে পুরোনো লোকেশনও ডকুমেন্ট থেকে চলে যায়।
   • শুধু অ্যাপ/ব্রাউজার খোলা থাকলে চলে। ফোন লক বা ব্যাকগ্রাউন্ডে ব্রাউজার সাধারণত GPS থামিয়ে দেয়,
     তখন অন্যজন Last Known দেখবে। এটা ওয়েব অ্যাপের সীমাবদ্ধতা, নিরবচ্ছিন্ন ট্র্যাকিংয়ের প্রতিশ্রুতি নেই। */
(function(){
 var FRESH=150000,MOVE=25,BEAT=60000;
 var DURS=[[1,"১ ঘণ্টা"],[3,"৩ ঘণ্টা"],[6,"৬ ঘণ্টা"],[0,"নিজে বন্ধ না করা পর্যন্ত"]];
 var dur=1,keep=false;try{keep=localStorage.getItem("locKeep")==="1"}catch(e){}
 var mine=null,pt=null,ld={m:false,p:false},er={m:"",p:""},ran=false;
 var watchId=null,wl=null,lastW=0,lastLat=null,lastLng=null,pend=false,mst="",lastFix=null,online=navigator.onLine!==false,mapOpen=false,map=null,mk={},fitted=false;

 function el(tag,cls,t){var d=document.createElement(tag);if(cls)d.className=cls;if(t!=null)d.textContent=t;return d}
 function ago(ms){var m=Math.floor(ms/60000);if(m<1)return "এইমাত্র";if(m<60)return bn(m)+" মিনিট আগে";var h=Math.floor(m/60);if(h<24)return bn(h)+" ঘণ্টা "+(m%60?bn(m%60)+" মিনিট ":"")+"আগে";return bn(Math.floor(h/24))+" দিন আগে"}
 function km(a,b,c,d){var R=6371,r=Math.PI/180,x=(c-a)*r,y=(d-b)*r,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(h))}
 function pname(){return (PW&&PN[PW])?PN[PW]:"ও"}
 function on(o){return !!(o&&o.sharing&&(!o.until||o.until>Date.now()))}
 function live(o){return on(o)&&o.st==="ok"&&o.hb&&Date.now()-o.hb<FRESH&&typeof o.lat==="number"}

 var st=document.createElement("style");
 st.textContent="#locb{position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:12px;z-index:8;display:none;background:var(--glass);border:1px solid #e0243f;color:#e0243f;border-radius:999px;padding:6px 12px;font-size:.85rem;font-weight:600;width:auto;box-shadow:0 6px 16px -8px rgba(224,36,63,.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}"+
  "#locb::before{content:'';display:inline-block;width:9px;height:9px;border-radius:50%;background:#e0243f;margin-right:6px;animation:fp 1.4s ease-in-out infinite}"+
  "#lmc{padding:10px}#lmap{height:280px;border-radius:14px;z-index:0}"+
  ".lcs{display:inline-block;border-radius:999px;padding:1px 12px;font-size:.88rem;font-weight:600;color:#fff}"+
  ".lcs.l{background:#1f9d55}.lcs.k{background:#8a7580}.lcs.o{background:var(--soft)}"+
  ".lcw{color:#e0243f;font-weight:600}"+
  "@media (prefers-reduced-motion:reduce){#locb::before{animation:none}}";
 document.head.appendChild(st);

 var badge=el("button","","শেয়ার চলছে");badge.id="locb";badge.setAttribute("aria-label","লোকেশন শেয়ারিং চালু আছে, দেখতে চাপো");document.body.appendChild(badge);
 badge.onclick=function(){var h=document.querySelector('nav button[data-t="home"]');if(h)h.click();$("lq").scrollIntoView({behavior:"smooth"})};

 var sec=el("div");sec.id="lq";
 sec.innerHTML='<div class="serif" style="font-size:1.15rem;margin:0 2px 8px">LIVE LOCATION SHARING <span class="hint">· GPS, দুজনের সম্মতিতে</span></div>'+
  '<div class="card" id="lcp"></div><div class="card" id="lcm"></div><div class="card" id="lmc" style="display:none"><div id="lmap"></div></div>';
 var anchor=$("qs")||document.querySelector("#home .hero");
 anchor.insertAdjacentElement("afterend",sec);

 function msgEl(box,cls,t){var d=el("div",cls,t);box.appendChild(d);return d}

 /* ---------- অন্যজনের কার্ড ---------- */
 function renderPt(){
  var b=$("lcp");b.innerHTML="";
  var h=el("div","serif",pname()+"র লোকেশন");h.style.fontSize="1.1rem";b.appendChild(h);
  if(er.p){msgEl(b,"hint","সমস্যা: "+er.p);return}
  if(!ld.p){msgEl(b,"hint","লোড হচ্ছে…");return}
  if(!pt||!pt.sharing){msgEl(b,"hint",pname()+" এখন লোকেশন শেয়ার করছে না। ও নিজে চালু করলে এখানে দেখা যাবে।");return}
  if(!on(pt)){msgEl(b,"hint",pname()+"র শেয়ারিংয়ের সময় শেষ হয়ে গেছে।");return}
  if(typeof pt.lat!=="number"){msgEl(b,"hint","শেয়ারিং চালু আছে, কিন্তু এখনো কোনো লোকেশন পাওয়া যায়নি।");return}
  var lv=live(pt),s=el("span","lcs "+(lv?"l":"k"),lv?"🟢 LIVE":"🕓 LAST KNOWN (লাইভ নয়)");b.appendChild(s);
  if(lv){
   msgEl(b,"hint","শেষ আপডেট: "+ago(Date.now()-pt.hb)).style.marginTop="6px";
   msgEl(b,"hint","সঠিকতা প্রায় ±"+bn(Math.round(pt.acc||0))+" মিটার")}
  else{
   var why=pt.st==="denied"?"ওর ফোনে Location Permission বন্ধ।":pt.st==="unavail"?"ওর ফোনের GPS বন্ধ বা সিগন্যাল পাচ্ছে না।":"ইন্টারনেট, GPS বা অ্যাপ বন্ধ থাকতে পারে, কারণটা জানা নেই।";
   msgEl(b,"hint","এটা পুরোনো লোকেশন, এখন ও এখানে আছে কি না নিশ্চিত নয়। "+why).style.marginTop="6px";
   msgEl(b,"hint","সর্বশেষ লোকেশন পাওয়া গেছে: "+ft(pt.t)+" ("+ago(Date.now()-pt.t)+")");
   msgEl(b,"hint","অ্যাপ শেষবার জানিয়েছে: "+ago(Date.now()-(pt.hb||pt.t)))}
  var a=el("a","",bn(pt.lat.toFixed(5))+", "+bn(pt.lng.toFixed(5))+" · OpenStreetMap-এ দেখো");
  a.href="https://www.openstreetmap.org/?mlat="+pt.lat+"&mlon="+pt.lng+"#map=16/"+pt.lat+"/"+pt.lng;a.target="_blank";a.rel="noopener";
  a.style.cssText="display:block;margin-top:6px;color:var(--rose);word-break:break-all";b.appendChild(a);
  if(pt.until)msgEl(b,"hint","ওর শেয়ারিং শেষ হবে: "+ft(pt.until));
  if(lv&&live(mine)){msgEl(b,"hint","দুজনের মধ্যে দূরত্ব প্রায় "+bn(km(mine.lat,mine.lng,pt.lat,pt.lng).toFixed(1))+" কিমি")}}

 /* ---------- নিজের কার্ড ---------- */
 function say(t){var n=$("lcn");if(n)n.textContent=t}
 function renderMine(){
  var b=$("lcm");b.innerHTML="";
  var h=el("div","serif","আমার লোকেশন শেয়ারিং");h.style.fontSize="1.1rem";b.appendChild(h);
  if(er.m){msgEl(b,"hint","সমস্যা: "+er.m);return}
  if(!ld.m){msgEl(b,"hint","লোড হচ্ছে…");return}
  var active=on(mine),here=watchId!=null;
  if(!active){
   msgEl(b,"hint","এখন বন্ধ আছে, তোমার লোকেশন কেউ দেখতে পাচ্ছে না। চালু করলে "+pname()+" তোমার লোকেশন দেখতে পাবে। ও চালু না করলে তুমি ওরটা দেখবে না।").style.margin="4px 0 8px";
   var c=el("div","chips");c.id="lcd";b.appendChild(c);
   DURS.forEach(function(d,i){var k=el("button","chip"+(d[0]===dur?" on":""),d[1]);k.onclick=function(){dur=d[0];renderMine()};c.appendChild(k)});
   var lb=el("label","hint","");lb.style.cssText="display:block;margin:4px 0 8px";
   var cb=document.createElement("input");cb.type="checkbox";cb.checked=keep;cb.onchange=function(){keep=cb.checked;try{localStorage.setItem("locKeep",keep?"1":"0")}catch(e){}};
   lb.appendChild(cb);lb.appendChild(document.createTextNode("শেয়ারিং চলার সময় স্ক্রিন জাগিয়ে রাখো (লাইভ ঠিক থাকে, ব্যাটারি বেশি খরচ হয়)"));b.appendChild(lb);
   var go=el("button","","📍 আমার লোকেশন শেয়ার শুরু করো");go.onclick=startShare;b.appendChild(go);
   msgEl(b,"hint","শুধু অ্যাপ খোলা থাকলে লাইভ থাকে। ফোন লক করলে বা অন্য অ্যাপে গেলে ব্রাউজার GPS থামিয়ে দিতে পারে, তখন ও Last Known দেখবে।").style.marginTop="8px"}
  else{
   var s=el("span","lcs "+(here&&mst==="ok"?"l":"o"),"📍 শেয়ারিং চালু");b.appendChild(s);
   var m=!online?"⚠️ ইন্টারনেট নেই, আপডেট পাঠানো যাচ্ছে না। ফিরলে আবার চলবে।"
    :!here?"এই ডিভাইসে লোকেশন নেওয়া হচ্ছে না (অ্যাপ নতুন করে খোলা হয়েছে বা অন্য ডিভাইসে চালু)। এখানে শুরু করতে নিচের বোতাম চাপো।"
    :mst==="denied"?"🚫 Location Permission বন্ধ। ব্রাউজারের সেটিংসে এই সাইটের Location অনুমতি দাও, তারপর “আবার চেষ্টা করো”।"
    :mst==="unavail"?"📡 GPS বন্ধ বা সিগন্যাল পাওয়া যাচ্ছে না। GPS চালু করো, বাইরে বা জানালার কাছে যাও।"
    :mst==="ok"?"🟢 তোমার লোকেশন "+pname()+"কে লাইভ দেখানো হচ্ছে"+(lastFix?" · সঠিকতা ±"+bn(Math.round(lastFix.acc))+" মিটার":"")
    :"লোকেশনের অপেক্ষা করা হচ্ছে…";
   var mt=msgEl(b,(!online||mst==="denied"||mst==="unavail"||!here)?"lcw":"hint",m);mt.style.margin="6px 0";
   if(mine.until)msgEl(b,"hint","নিজে নিজে বন্ধ হবে: "+ft(mine.until));else msgEl(b,"hint","তুমি নিজে বন্ধ না করা পর্যন্ত চলবে।");
   if(!here||mst==="denied"){var rt=el("button","",here?"আবার চেষ্টা করো":"এই ডিভাইসে শুরু করো");rt.style.margin="8px 0 0";rt.onclick=function(){begin()};b.appendChild(rt)}
   var sp=el("button","ghost","⏹️ শেয়ারিং বন্ধ করো");sp.style.marginTop="8px";sp.onclick=function(){stopShare(false)};b.appendChild(sp)}
  var dl=el("button","ghost","🗑️ আমার লোকেশন ডেটা মুছে ফেলো");dl.style.marginTop="8px";dl.onclick=delData;b.appendChild(dl);
  var mb=el("button","ghost",mapOpen?"🗺️ ম্যাপ বন্ধ করো":"🗺️ ম্যাপে দেখো");mb.style.marginTop="8px";mb.onclick=function(){mapOpen=!mapOpen;fitted=false;$("lmc").style.display=mapOpen?"block":"none";if(!mapOpen&&map){map.remove();map=null;mk={}}renderMine();if(mapOpen)renderMap()};b.appendChild(mb);
  var n=el("p","note");n.id="lcn";b.appendChild(n)}

 function render(){renderPt();renderMine();if(mapOpen)renderMap();badge.style.display=watchId!=null?"inline-block":"none"}

 /* ---------- ম্যাপ (Leaflet + OpenStreetMap, শুধু চাইলে লোড হয়) ---------- */
 function loadLeaflet(cb){
  if(window.L){cb(null);return}
  var c=document.createElement("link");c.rel="stylesheet";c.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(c);
  var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
  s.onload=function(){cb(null)};s.onerror=function(){cb(true)};document.head.appendChild(s)}
 function renderMap(){
  var box=$("lmap");if(!box)return;
  loadLeaflet(function(e){
   box=$("lmap");if(!box)return;
   if(e){box.textContent="ম্যাপ লোড হয়নি (ইন্টারনেট বা ব্লক)। ওপরের OpenStreetMap লিংক ব্যবহার করো।";box.style.cssText+=";padding:14px;color:var(--soft)";return}
   if(!map){
    map=L.map(box,{zoomControl:true}).setView([23.8,90.4],6);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);
    mk={};fitted=false;setTimeout(function(){map&&map.invalidateSize()},50)}
   function put(key,o,color,lvl,label){
    if(!o||typeof o.lat!=="number"||!on(o)){if(mk[key]){map.removeLayer(mk[key]);delete mk[key]}return}
    var ll=[o.lat,o.lng];
    if(!mk[key])mk[key]=L.circleMarker(ll,{radius:10,weight:3}).addTo(map);
    mk[key].setLatLng(ll).setStyle({color:color,fillColor:color,fillOpacity:lvl?.8:.2,dashArray:lvl?null:"4 4"}).bindTooltip(label+(lvl?" (লাইভ)":" (Last Known)"))}
   put("pt",pt,"#e0356b",live(pt),pname());
   put("me",mine,"#2563eb",live(mine),"আমি");
   var pts=Object.keys(mk).map(function(k){return mk[k].getLatLng()});
   if(pts.length&&!fitted){fitted=true;if(pts.length===1)map.setView(pts[0],15);else map.fitBounds(L.latLngBounds(pts),{padding:[40,40],maxZoom:16})}})}

 /* ---------- শেয়ারিং চালু/বন্ধ ---------- */
 function wlGet(){
  if(keep&&"wakeLock" in navigator&&document.visibilityState==="visible"&&!wl&&watchId!=null){
   navigator.wakeLock.request("screen").then(function(l){wl=l;l.addEventListener("release",function(){wl=null})}).catch(function(){})}}
 function wlRel(){if(wl){try{wl.release()}catch(e){}wl=null}}

 function startShare(){
  if(!navigator.geolocation){say("এই ব্রাউজারে GPS লোকেশন সাপোর্ট নেই।");return}
  if(!DB||!WHO){say("আগে লগইন করো।");return}
  var lbl=DURS.filter(function(d){return d[0]===dur})[0][1];
  if(!confirm("তোমার লাইভ লোকেশন "+pname()+" দেখতে পাবে ("+lbl+")। যেকোনো সময় বন্ধ করতে পারবে। চালু করবে?"))return;
  var now=Date.now();
  DB.doc("loc/"+WHO).set({sharing:true,started:now,until:dur?now+dur*36e5:null,st:"wait",hb:now}).then(function(){
   try{localStorage.setItem("locOn","1")}catch(e){}
   logEv("লোকেশন শেয়ার শুরু করেছে 📍","home");begin()
  }).catch(function(e){say("সমস্যা: "+e.code)})}

 function begin(){
  if(!navigator.geolocation||!DB||!WHO)return;
  if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null}
  mst="wait";lastW=0;lastLat=null;
  watchId=navigator.geolocation.watchPosition(onPos,onErr,{enableHighAccuracy:true,maximumAge:10000,timeout:30000});
  wlGet();render()}

 function stopLocal(){
  if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null}
  wlRel();mst="";lastFix=null;lastLat=null;
  try{localStorage.removeItem("locOn")}catch(e){}}

 function stopShare(expired){
  stopLocal();
  if(!DB||!WHO){render();return}
  DB.doc("loc/"+WHO).set({sharing:false,stopped:Date.now()}).then(function(){
   say(expired?"নির্ধারিত সময় শেষ, শেয়ারিং বন্ধ হয়েছে।":"শেয়ারিং বন্ধ হয়েছে ✓ আগের লোকেশনও মুছে গেছে।");
   logEv("লোকেশন শেয়ার বন্ধ করেছে ⏹️","home")}).catch(function(e){say("সমস্যা: "+e.code)});
  render()}

 function delData(){
  if(!DB||!WHO)return;
  if(!confirm("তোমার সংরক্ষিত লোকেশন ডেটা মুছে যাবে ও শেয়ারিং বন্ধ হবে। মুছবে?"))return;
  stopLocal();
  DB.doc("loc/"+WHO).delete().then(function(){say("মোছা হয়েছে ✓");render()}).catch(function(e){say("সমস্যা: "+e.code)});render()}

 function write(o){
  if(pend)return;pend=true;lastW=Date.now();
  DB.doc("loc/"+WHO).update(o).then(function(){pend=false}).catch(function(e){
   pend=false;
   if(e&&(e.code==="not-found")){stopLocal();render()}})}

 function onPos(p){
  var c=p.coords,now=Date.now();
  if(mine&&mine.until&&mine.until<now){stopShare(true);return}
  var was=mst;mst="ok";
  lastFix={lat:c.latitude,lng:c.longitude,acc:c.accuracy||0,t:p.timestamp||now};
  var moved=lastLat==null?1e9:km(lastLat,lastLng,c.latitude,c.longitude)*1000;
  if(was==="ok"&&moved<MOVE&&now-lastW<BEAT){return}
  lastLat=c.latitude;lastLng=c.longitude;
  write({lat:c.latitude,lng:c.longitude,acc:Math.round(c.accuracy||0),t:lastFix.t,hb:now,st:"ok"});
  if(was!=="ok")render()}

 function onErr(e){
  var now=Date.now(),code=e&&e.code,was=mst;
  if(code===1){mst="denied";if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null}wlRel()}
  else mst="unavail";
  if(was!==mst&&DB&&WHO)write({st:mst,hb:now});
  render()}

 /* হার্টবিট: দাঁড়িয়ে থাকলেও "অ্যাপ চালু আছে" জানানো, আর মেয়াদ শেষ হলে নিজে বন্ধ */
 setInterval(function(){
  var now=Date.now();
  if(mine&&mine.sharing&&mine.until&&mine.until<now&&watchId!=null){stopShare(true);return}
  if(watchId!=null&&mst==="ok"&&online&&lastFix&&now-lastW>=BEAT&&DB&&WHO)write({hb:now,st:"ok"});
  if(ld.m&&ld.p){renderPt();renderMine()}},15000);

 window.addEventListener("online",function(){online=true;render()});
 window.addEventListener("offline",function(){online=false;render()});
 document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="visible"){wlGet();if(watchId!=null&&mst==="ok"&&lastFix&&online&&DB&&WHO)write({hb:Date.now(),st:"ok"});render()}});

 var _s=start;
 start=function(){
  var was=ran;ran=true;_s();if(was)return;
  var first=true;
  DB.doc("loc/"+WHO).onSnapshot(function(s){
   mine=s.exists?s.data():null;ld.m=true;er.m="";
   /* মেয়াদ শেষ হয়ে গেছে কিন্তু অ্যাপ বন্ধ ছিল: পুরোনো লোকেশন মুছে ফেলো */
   if(mine&&mine.sharing&&mine.until&&mine.until<Date.now()&&watchId==null)DB.doc("loc/"+WHO).set({sharing:false,stopped:Date.now()}).catch(function(){});
   /* অন্য ডিভাইস থেকে বা মেয়াদে বন্ধ হলে এই ডিভাইসও থামে */
   if(!on(mine)&&watchId!=null)stopLocal();
   /* আগে এই ডিভাইসেই চালু করা ছিল (পেজ রিলোড): স্পষ্ট ইন্ডিকেটরসহ আবার শুরু */
   if(first&&on(mine)){
    first=false;var f=false;try{f=localStorage.getItem("locOn")==="1"}catch(e){}
    if(f&&watchId==null){begin();toast("📍 তোমার লোকেশন শেয়ারিং চালু আছে")}}
   first=false;render()},function(e){er.m=e.code||"error";render()});
  DB.doc("loc/"+PW).onSnapshot(function(s){
   var was=pt;pt=s.exists?s.data():null;ld.p=true;er.p="";
   if(on(pt)&&!on(was)&&was!==null)toast("📍 "+pname()+" লোকেশন শেয়ার শুরু করেছে");
   render()},function(e){er.p=e.code||"error";render()})};
 render();
})();
