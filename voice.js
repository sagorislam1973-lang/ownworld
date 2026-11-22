/* ===== চ্যাটে ভয়েস মেসেজ =====
   🎙️ বোতাম চেপে ধরে রেকর্ড, ছেড়ে দিলে সেন্ড, বাম দিকে সরালে বাতিল। সর্বোচ্চ ২০ সেকেন্ড।
   ডেটা: vm/{id} = { from, t, mime, d (base64 অডিও, ~১৬ kbps ⇒ ২০ সেকেন্ডে প্রায় ৫০ KB) }
         chat/{id} = { from, text:"🎙️ ভয়েস মেসেজ (০:০৭)", vm:id, dur, t }   ← চ্যাট লিস্টে শুধু ছোট রেফারেন্স
   অডিও লোড হয় প্লে চাপলে (১ Read), চ্যাট লোডে কয়েক MB নামে না।
   মেসেজ মুছলে অডিও ডকুমেন্টও মুছে যায় (app.js-এ সংযোগ আছে)। স্টোরেজ ম্যানেজারেও দেখা ও মোছা যায়। */
(function(){
 var MAXS=20,MINS=1,cur=null,audio=null,playing="",cache={},rec=null,stream=null,tmr=null,t0=0,want=false,startX=0,cancelled=false;
 function dur2(s){s=Math.round(s);var m=Math.floor(s/60),r=s%60;return bn(m)+":"+(r<10?"০"+bn(r):bn(r))}

 /* ---------- প্লেয়ার (চ্যাট বাবলে বসে) ---------- */
 function setBtns(){[].forEach.call(document.querySelectorAll("[data-vm]"),function(b){b.textContent=b.dataset.vm===playing?"⏸":"▶️"})}
 function toggle(id,btn){
  if(playing===id&&audio){audio.pause();return}
  if(audio){audio.pause();audio=null;playing=""}
  function go(url){
   audio=new Audio(url);playing=id;setBtns();
   audio.onended=audio.onpause=function(){playing="";setBtns()};
   audio.onplay=function(){playing=id;setBtns()};
   audio.play().catch(function(){playing="";setBtns();toast("প্লে করা যায়নি, আবার চাপো")})}
  if(cache[id]){go(cache[id]);return}
  btn.textContent="…";
  DB.collection("vm").doc(id).get().then(function(s){
   if(!s.exists){btn.textContent="❌";toast("অডিওটা মুছে গেছে");return}
   cache[id]=s.data().d;go(cache[id])}).catch(function(e){btn.textContent="▶️";toast("লোড হয়নি: "+(e.code||"")) })}
 window.LVvm=function(bubble,txSpan,x){
  var w=LV.el("span");w.style.cssText="display:inline-flex;align-items:center;gap:10px";
  var b=LV.el("button","chip","▶️");b.dataset.vm=x.vm;b.style.cssText="padding:4px 14px;font-size:1.1rem;color:inherit";
  b.setAttribute("aria-label","ভয়েস মেসেজ চালাও");b.onclick=function(){toggle(x.vm,b)};
  var l=LV.el("span","","🎙️ "+dur2(x.dur||0));
  w.appendChild(b);w.appendChild(l);txSpan.textContent="";txSpan.appendChild(w);
  if(playing===x.vm)b.textContent="⏸"};

 /* ---------- রেকর্ডার ---------- */
 var mic=LV.el("button","chip","🎙️");mic.id="vmic";mic.setAttribute("aria-label","ভয়েস মেসেজ রেকর্ড করতে চেপে ধরে রাখো");
 mic.style.cssText="touch-action:none;user-select:none;-webkit-user-select:none;font-size:1.3rem;padding:6px 12px";
 var bar=LV.el("div","","");bar.id="vbar";bar.setAttribute("role","status");
 bar.style.cssText="display:none;text-align:center;padding:8px;background:#e0243f;color:#fff;font-weight:600";
 var chb=$("chb");chb.parentNode.insertBefore(mic,chb);$("chatov").insertBefore(bar,$("chatov").lastElementChild);
 mic.addEventListener("contextmenu",function(e){e.preventDefault()});

 function mime(){var l=["audio/webm;codecs=opus","audio/mp4","audio/webm","audio/ogg;codecs=opus"];
  if(!window.MediaRecorder)return null;for(var i=0;i<l.length;i++)if(MediaRecorder.isTypeSupported(l[i]))return l[i];return ""}
 function cleanup(){
  clearInterval(tmr);tmr=null;bar.style.display="none";mic.style.background="";
  if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}rec=null;want=false}
 function begin(e){
  if(!DB||!WHO)return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){toast("এই ব্রাউজারে ভয়েস রেকর্ড চলবে না");return}
  want=true;cancelled=false;startX=e.clientX;
  try{mic.setPointerCapture(e.pointerId)}catch(x){}
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){
   if(!want){s.getTracks().forEach(function(t){t.stop()});return}
   stream=s;var m=mime(),chunks=[];
   try{rec=new MediaRecorder(s,m?{mimeType:m,audioBitsPerSecond:16000}:{audioBitsPerSecond:16000})}catch(x){rec=new MediaRecorder(s)}
   rec.ondataavailable=function(ev){if(ev.data&&ev.data.size)chunks.push(ev.data)};
   var rr=rec;
   rr.onstop=function(){
    var secs=(Date.now()-t0)/1000,mt=rr.mimeType||m||"audio/webm";
    cleanup();
    if(cancelled)return;
    if(secs<MINS){toast("খুব ছোট হয়ে গেছে, চেপে ধরে কথা বলো");return}
    var blob=new Blob(chunks,{type:mt});
    if(blob.size>400000){toast("রেকর্ডিং বড় হয়ে গেছে");return}
    var fr=new FileReader();fr.onload=function(){send(fr.result,mt,secs)};fr.readAsDataURL(blob)};
   t0=Date.now();rr.start();bar.style.display="block";mic.style.background="#e0243f";
   var tick=function(){var s2=(Date.now()-t0)/1000;
    bar.textContent="🔴 রেকর্ড হচ্ছে "+dur2(s2)+" · ছাড়লে সেন্ড · বাম দিকে সরালে বাতিল";
    if(s2>=MAXS)finish(false)};
   tick();tmr=setInterval(tick,250);
  }).catch(function(err){
   cleanup();
   var n=err&&err.name;
   toast(n==="NotAllowedError"||n==="SecurityError"?"মাইক্রোফোনের Permission বন্ধ। ব্রাউজারের সেটিংসে অনুমতি দাও।":n==="NotFoundError"?"মাইক্রোফোন পাওয়া যায়নি":"রেকর্ড শুরু করা যায়নি")})}
 function finish(cancel){
  want=false;if(cancel)cancelled=true;
  if(rec&&rec.state!=="inactive"){try{rec.stop()}catch(x){cleanup()}}else cleanup()}
 function send(d,mt,secs){
  var t=Date.now();
  DB.collection("vm").add({from:WHO,t:t,mime:mt,d:d}).then(function(ref){
   if(typeof pushPartner==="function")pushPartner();
   return DB.collection("chat").add({from:WHO,text:"🎙️ ভয়েস মেসেজ ("+dur2(secs)+")",vm:ref.id,dur:Math.round(secs),t:Date.now()})
  }).catch(function(e){toast("ভয়েস পাঠানো যায়নি: "+(e.code||""))})}
 mic.addEventListener("pointerdown",function(e){e.preventDefault();begin(e)});
 mic.addEventListener("pointermove",function(e){if(rec&&e.clientX-startX<-80){finish(true);toast("বাতিল করা হয়েছে")}});
 mic.addEventListener("pointerup",function(){finish(false)});
 mic.addEventListener("pointercancel",function(){finish(true)});
 document.addEventListener("visibilitychange",function(){if(document.hidden&&rec)finish(true)});
})();
