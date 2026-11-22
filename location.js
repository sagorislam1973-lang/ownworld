/* ===== লোকেশন (একদম ন্যূনতম) =====
   সাগরের আইডিতে: হোমের শেষে একটা 📍 আইকন। চাপলে ম্যাপে শিমার রিয়েল-টাইম লোকেশন।
   শিমার আইডিতে: কিচ্ছু নেই। অ্যাপ খোলা থাকলে চুপচাপ GPS থেকে লোকেশন পাঠাতে থাকে।
   ডেটা: loc/shima (একটাই ডকুমেন্ট, প্রতিবার overwrite) */
(function(){
 var SHARER="shima",VIEWER="sagor";
 var MOVE=25,BEAT=60000,FRESH=150000;
 function el(tag,cls,t){var x=document.createElement(tag);if(cls)x.className=cls;if(t!=null)x.textContent=t;return x}
 function km(a,b,c,e){var R=6371,r=Math.PI/180,x=(c-a)*r,y=(e-b)*r,h=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*r)*Math.cos(c*r)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(h))}
 function num(n){return (typeof bn==="function")?bn(n):String(n)}
 function short(ms){
  var m=Math.floor(ms/60000);
  if(m<1)return "এইমাত্র";
  if(m<60)return num(m)+" মি আগে";
  var h=Math.floor(m/60);
  if(h<24)return num(h)+" ঘ আগে";
  return num(Math.floor(h/24))+" দিন আগে"}
 function isLive(o){return !!(o&&typeof o.lat==="number"&&o.hb&&Date.now()-o.hb<FRESH)}

 /* ---------- সাগরের আইডি: আইকন + ম্যাপ ---------- */
 if(WHO===VIEWER){
  var st=document.createElement("style");
  st.textContent="#locicon{width:52px;height:52px;border-radius:50%;padding:0;font-size:1.5rem;line-height:1;background:var(--glass);color:var(--rose);border:1px solid var(--line);box-shadow:0 6px 16px -8px rgba(224,53,107,.5);display:block;margin:6px auto 0}"+
   "#locov{position:fixed;inset:0;z-index:26;background:var(--bg);display:none;flex-direction:column}"+
   "#locov .lh{display:flex;align-items:center;padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 8px;background:var(--glass);border-bottom:1px solid var(--line)}"+
   "#locov .lh button{width:44px;height:44px;border-radius:50%;padding:0;font-size:1.3rem}"+
   "#locmap{flex:1;z-index:0}"+
   ".lkt{background:rgba(0,0,0,.65);color:#fff;border:0;border-radius:8px;font-size:.8rem;padding:2px 7px}.lkt:before{display:none}";
  document.head.appendChild(st);

  var d=null,map=null,mk=null,openM=false;

  var ic=el("button","","📍");ic.id="locicon";ic.setAttribute("aria-label","লোকেশন");
  var lgo=$("lgo");(lgo?lgo:$("home").lastElementChild).insertAdjacentElement("afterend",ic);

  var ov=el("div","");ov.id="locov";
  ov.innerHTML='<div class="lh"><button class="ghost" id="locx" aria-label="ফিরে যাও">←</button></div><div id="locmap"></div>';
  document.body.appendChild(ov);

  function loadL(cb){
   if(window.L){cb();return}
   var c=document.createElement("link");c.rel="stylesheet";c.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(c);
   var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
   s.onload=function(){cb()};document.head.appendChild(s)}
  function buildMap(){
   if(map||!openM)return;
   map=L.map("locmap",{zoomControl:true}).setView([23.8,90.4],6);
   L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);
   setTimeout(function(){if(map)map.invalidateSize()},60);
   paint()}
  function paint(){
   if(!map||!d||typeof d.lat!=="number")return;
   var ll=[d.lat,d.lng],lv=isLive(d),first=!mk;
   if(!mk){mk=L.circleMarker(ll,{radius:11,weight:3}).addTo(map);map.setView(ll,15)}
   else mk.setLatLng(ll);
   mk.setStyle({color:lv?"#e0356b":"#8a7580",fillColor:lv?"#e0356b":"#8a7580",fillOpacity:lv?.85:.12,dashArray:lv?null:"4 4"});
   mk.unbindTooltip();
   if(!lv)mk.bindTooltip(short(Date.now()-(d.t||d.hb)),{permanent:true,direction:"right",offset:[12,0],className:"lkt"});
   if(first)return}

  ic.onclick=function(){openM=true;ov.style.display="flex";loadL(buildMap)};
  $("locx").onclick=function(){openM=false;ov.style.display="none";if(map){map.remove();map=null;mk=null}};

  setInterval(function(){if(openM&&map)paint()},15000);

  LV.onStart(function(){
   DB.doc("loc/"+SHARER).onSnapshot(function(s){
    d=s.exists?s.data():null;
    if(openM&&map)paint()
   },function(){})})
 }

 /* ---------- শিমার আইডি: নীরবে GPS পাঠানো, কোনো UI নেই ---------- */
 if(WHO===SHARER){
  var watchId=null,lastW=0,lastLat=null,lastLng=null,pend=false;
  function wr(o){
   if(pend||!DB)return;pend=true;lastW=Date.now();
   DB.doc("loc/"+SHARER).set(o,{merge:true}).then(function(){pend=false}).catch(function(){pend=false})}
  var lastFix=null;
  function onPos(p){
   var c=p.coords,now=Date.now();
   lastFix={lat:c.latitude,lng:c.longitude,t:p.timestamp||now};
   var moved=lastLat==null?1e9:km(lastLat,lastLng,c.latitude,c.longitude)*1000;
   if(moved<MOVE&&now-lastW<BEAT)return;
   lastLat=c.latitude;lastLng=c.longitude;
   wr({lat:c.latitude,lng:c.longitude,t:lastFix.t,hb:now})}
  setInterval(function(){
   if(watchId!=null&&lastFix&&navigator.onLine!==false&&Date.now()-lastW>=BEAT)wr({hb:Date.now()})
  },15000);
  LV.onStart(function(){
   if(navigator.geolocation)watchId=navigator.geolocation.watchPosition(onPos,function(){},{enableHighAccuracy:true,maximumAge:10000,timeout:30000})})
 }
})();
