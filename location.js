/* ===== লোকেশন (ন্যূনতম রূপ) =====
   হোমের একদম শেষে শুধু একটা 📍 আইকন। চাপলে ম্যাপ। কোনো লেখা নেই।
   • সাগরের অ্যাকাউন্টে: শুধু শিমার লোকেশন দেখা যায় (ম্যাপে মার্কার)।
   • শিমার অ্যাকাউন্টে: ম্যাপের কোণে ছোট একটা 📡 সুইচ। শিমা নিজে চালু করলে তবেই লোকেশন যায়। বন্ধ করলে পুরোনো লোকেশনও মুছে যায়।
   • চালু থাকলে সব ট্যাবের ওপরে বাঁ কোণে ছোট লাল স্পন্দিত বিন্দু থাকে (গোপনে চলে না)।
   • মার্কার: লাইভ = ভরাট গোলাপি; পুরোনো (Last Known) = ধূসর ফাঁকা বৃত্ত, পাশে "কত আগে" (যেমন ১৫ মি)।
   ডেটা: loc/shima (একটাই ডকুমেন্ট, প্রতিবার overwrite, কোনো ইতিহাস নেই)
   সীমা: শুধু অ্যাপ খোলা ও স্ক্রিন চালু থাকলে লাইভ। ফোন লক বা ব্যাকগ্রাউন্ডে গেলে ব্রাউজার GPS থামায়, তখন সাগর Last Known দেখে। */
(function(){
 var SHARER="shima",VIEWER="sagor";
 var FRESH=90000,MOVE=8,BEAT=30000,MINGAP=3000,wl=null;
 var d=null,ld=false,ran=false,watchId=null,lastW=0,lastLat=null,lastLng=null,pend=false,mst="",lastFix=null,warned=false;
 var map=null,mk={},fitted=false,openM=false;
 function el(tag,cls,t){var x=document.createElement(tag);if(cls)x.className=cls;if(t!=null)x.textContent=t;return x}
 function km(a,b,c,e){var R=6371,r=Math.PI/180,x=(c-a)*r,y=(e-b)*r,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(h))}
 function short(ms){var m=Math.floor(ms/60000);if(m<1)return "এইমাত্র";if(m<60)return bn(m)+" মি";var h=Math.floor(m/60);if(h<24)return bn(h)+" ঘ";return bn(Math.floor(h/24))+" দিন"}
 function on(o){return !!(o&&o.sharing&&(!o.until||o.until>Date.now()))}
 function live(o){return on(o)&&o.st==="ok"&&o.hb&&Date.now()-o.hb<FRESH&&typeof o.lat==="number"}
 function isSharer(){return WHO===SHARER}

 var st=document.createElement("style");
 st.textContent="#locicon{position:relative;width:44px;height:44px;border-radius:50%;padding:0;font-size:1.25rem;line-height:1;background:var(--glass);color:var(--rose);border:1px solid var(--line);box-shadow:0 6px 16px -8px rgba(224,53,107,.5);display:block;margin:6px auto 0}"+
  ".locd{position:absolute;top:2px;right:2px;width:13px;height:13px;border-radius:50%;border:2px solid var(--bg);display:none}"+
  "#locb{position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);left:12px;z-index:8;display:none;width:16px;height:16px;padding:0;border-radius:50%;background:#e0243f;box-shadow:0 0 0 3px rgba(224,36,63,.3);animation:fp 1.4s ease-in-out infinite}"+
  "#locov{position:fixed;inset:0;z-index:26;background:var(--bg);display:none;flex-direction:column}"+
  "#locov .lh{display:flex;align-items:center;justify-content:space-between;padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 8px;background:var(--glass);border-bottom:1px solid var(--line)}"+
  "#locov .lh button{width:44px;height:44px;border-radius:50%;padding:0;font-size:1.3rem}"+
  "#locsw{background:var(--glass);color:var(--ink);border:2px solid var(--line);box-shadow:none}"+
  "#locsw.on{border-color:#1f9d55;box-shadow:0 0 0 3px rgba(31,157,85,.3)}#locsw.err{border-color:#e0243f}"+
  "#locmap{flex:1;z-index:0}"+
  ".lkt{background:rgba(0,0,0,.65);color:#fff;border:0;border-radius:8px;font-size:.8rem;padding:2px 7px}.lkt:before{display:none}"+
  "@media (prefers-reduced-motion:reduce){#locb{animation:none}}";
 document.head.appendChild(st);

 /* হোমের শেষে আইকন */
 var ic=el("button","","📍");ic.id="locicon";ic.setAttribute("aria-label","লোকেশন");
 var dot=el("span","locd");ic.appendChild(dot);
 var lgo=$("lgo");(lgo?lgo:$("home").lastElementChild).insertAdjacentElement("afterend",ic);
 var bdg=el("button","");bdg.id="locb";bdg.setAttribute("aria-label","লোকেশন শেয়ার চালু আছে");document.body.appendChild(bdg);

 var ov=el("div","");ov.id="locov";
 ov.innerHTML='<div class="lh"><button class="ghost" id="locx" aria-label="ফিরে যাও">←</button><button id="locsw" aria-label="আমার লোকেশন শেয়ার" style="display:none">📡</button></div><div id="locmap"></div>';
 document.body.appendChild(ov);
 function open(){openM=true;ov.style.display="flex";fitted=false;$("locsw").style.display=isSharer()?"":"none";swState();loadL(function(e){if(!e)buildMap()})}
 ic.onclick=open;bdg.onclick=open;
 $("locx").onclick=function(){openM=false;ov.style.display="none";if(map){map.remove();map=null;mk={}}};

 /* ---------- ম্যাপ (Leaflet + OpenStreetMap, শুধু খুললে লোড) ---------- */
 function loadL(cb){
  if(window.L){cb(null);return}
  var c=document.createElement("link");c.rel="stylesheet";c.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(c);
  var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
  s.onload=function(){cb(null)};s.onerror=function(){cb(true)};document.head.appendChild(s)}
 function buildMap(){
  if(map||!window.L||!openM)return;
  map=L.map("locmap",{zoomControl:true}).setView([23.8,90.4],6);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);
  mk={};fitted=false;setTimeout(function(){if(map)map.invalidateSize()},60);marks()}
 function put(key,o,color,lv,label){
  if(!o||typeof o.lat!=="number"||!on(o)){if(mk[key]){map.removeLayer(mk[key]);delete mk[key]}return}
  var ll=[o.lat,o.lng];
  if(!mk[key])mk[key]=L.circleMarker(ll,{radius:11,weight:3}).addTo(map);
  mk[key].setLatLng(ll).setStyle({color:color,fillColor:color,fillOpacity:lv?.85:.12,dashArray:lv?null:"4 4"});
  mk[key].unbindTooltip();
  if(label)mk[key].bindTooltip(label,{permanent:true,direction:"right",offset:[12,0],className:"lkt"})}
 function marks(){
  if(!map)return;
  var o=d,ago=o&&o.hb?short(Date.now()-(o.t||o.hb)):"";
  if(isSharer()){put("me",o,"#2563eb",true,"")}
  else{put("pt",o,"#e0356b",live(o),live(o)?"":ago)}
  var pts=Object.keys(mk).map(function(k){return mk[k].getLatLng()});
  if(pts.length&&!fitted){fitted=true;map.setView(pts[0],16)}else if(pts.length&&live(o)&&!map.getBounds().contains(pts[0]))map.panTo(pts[0])}

 /* ---------- আইকনের বিন্দু ও সুইচ ---------- */
 function dots(){
  var s=null;
  if(isSharer()){if(watchId!=null)s="#e0243f"}
  else if(on(d)&&typeof d.lat==="number")s=live(d)?"#1f9d55":"#8a7580";
  dot.style.display=s?"block":"none";if(s)dot.style.background=s;
  bdg.style.display=(isSharer()&&watchId!=null)?"block":"none"}
 function swState(){
  var b=$("locsw");if(!b)return;
  var active=on(d)&&watchId!=null;
  b.className=(active?(mst==="denied"||mst==="unavail"?"err":"on"):"");
  b.textContent=(mst==="denied"||mst==="unavail")&&active?"⚠️":"📡";
  b.setAttribute("aria-pressed",active?"true":"false");
  b.setAttribute("aria-label",active?"আমার লোকেশন শেয়ার বন্ধ করো":"আমার লোকেশন শেয়ার চালু করো");b.title=b.getAttribute("aria-label")}
 function render(){dots();swState();if(openM)marks()}

 /* ---------- শিমার ফোন: চালু/বন্ধ ও GPS ---------- */
 function wr(o){
  if(pend||!DB)return;pend=true;lastW=Date.now();
  DB.doc("loc/"+SHARER).update(o).then(function(){pend=false}).catch(function(e){pend=false;if(e&&e.code==="not-found"){stopLocal();render()}})}
 function begin(){
  if(!navigator.geolocation)return;
  if(watchId!=null)navigator.geolocation.clearWatch(watchId);
  mst="wait";lastW=0;lastLat=null;warned=false;
  watchId=navigator.geolocation.watchPosition(onPos,onErr,{enableHighAccuracy:true,maximumAge:2000,timeout:30000});awake();render()}
 function awake(){try{if(navigator.wakeLock&&!wl)navigator.wakeLock.request("screen").then(function(x){wl=x;x.addEventListener("release",function(){wl=null})}).catch(function(){})}catch(e){}}
 function stopLocal(){
  if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null}
  mst="";lastFix=null;lastLat=null;try{if(wl)wl.release()}catch(e){}wl=null;try{localStorage.removeItem("locOn")}catch(e){}}
 function onPos(p){
  var c=p.coords,now=Date.now(),was=mst;mst="ok";
  lastFix={lat:c.latitude,lng:c.longitude,acc:c.accuracy||0,t:p.timestamp||now};
  var moved=lastLat==null?1e9:km(lastLat,lastLng,c.latitude,c.longitude)*1000;
  if(was==="ok"&&((moved<MOVE&&now-lastW<BEAT)||now-lastW<MINGAP))return;
  lastLat=c.latitude;lastLng=c.longitude;
  wr({lat:c.latitude,lng:c.longitude,acc:Math.round(c.accuracy||0),t:lastFix.t,hb:now,st:"ok"});
  if(was!=="ok")render()}
 function onErr(e){
  var code=e&&e.code,was=mst;
  if(code===1){mst="denied";if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null}if(!warned){warned=true;toast("লোকেশন Permission বন্ধ")}}
  else mst="unavail";
  if(was!==mst)wr({st:mst,hb:Date.now()});render()}
 function toggle(){
  if(!isSharer()||!DB)return;
  if(on(d)&&watchId!=null){
   stopLocal();DB.doc("loc/"+SHARER).set({sharing:false,stopped:Date.now()}).then(function(){logEv("লোকেশন শেয়ার বন্ধ করেছে","home")});render();return}
  if(!navigator.geolocation){toast("এই ব্রাউজারে GPS নেই");return}
  if(!confirm("লোকেশন শেয়ার চালু করবে?"))return;
  var n=Date.now();
  DB.doc("loc/"+SHARER).set({sharing:true,started:n,until:null,st:"wait",hb:n}).then(function(){try{localStorage.setItem("locOn","1")}catch(e){}logEv("লোকেশন শেয়ার চালু করেছে","home");begin()}).catch(function(e){toast("সমস্যা: "+e.code)})}
 $("locsw").onclick=toggle;

 setInterval(function(){
  if(isSharer()&&watchId!=null&&mst==="ok"&&lastFix&&navigator.onLine!==false&&Date.now()-lastW>=BEAT)wr({hb:Date.now(),st:"ok"});
  if(ld)render()},15000);
 document.addEventListener("visibilitychange",function(){if(!document.hidden&&isSharer()&&watchId!=null){awake();if(mst==="ok"&&lastFix)wr({hb:Date.now(),st:"ok"})}});

 LV.onStart(function(){
  if(ran)return;ran=true;
  DB.doc("loc/"+SHARER).onSnapshot(function(s){
   d=s.exists?s.data():null;ld=true;
   if(isSharer()){
    if(!on(d)&&watchId!=null)stopLocal();
    var f=false;try{f=localStorage.getItem("locOn")==="1"}catch(e){}
    if(on(d)&&f&&watchId==null)begin()}
   render()},function(){})});
})();
