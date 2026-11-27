/* ===== 🗺️ আমাদের বাংলাদেশ: একসাথে ঘোরা জেলার মানচিত্র =====
   স্মৃতি ট্যাবের চিপ। ৬৪ জেলার আসল আকার (bdmap.js)। জেলায় চাপলে নিচে কার্ড: তারিখ, নোট, ছবি।
   যে জেলা একসাথে ঘোরা হয়েছে সেটা গোলাপি রঙে ভরা থাকে। দুজনের ফোনে একই মানচিত্র।
   ডেটা: meta/trips = { d: { জেলার_কী: { t:"YYYY-MM-DD", n:"নোট", by } } }   (ছোট, একটাই ডকুমেন্ট)
         tripph/{id} = { key, nm, img(সংকুচিত JPEG), from, t }                (জেলাপ্রতি সর্বোচ্চ ৪টা ছবি, কার্ড খুললে তবেই লোড)
   মুছতে নিশ্চিতকরণ লাগে। স্টোরেজ ম্যানেজারে “জেলার ছবি” আলাদা দেখা যায়। */
(function(){
 var M=window.BDMAP;if(!M)return;
 var trips={},ph={},ld=false,err="",sel=null,shown=0,busy=false;
 var D={},ORDER=[];M.d.forEach(function(r){D[r[0]]={k:r[0],en:r[1],bn:r[2],dv:r[3],p:r[4]};ORDER.push(r[0])});
 var DVS=[];M.d.forEach(function(r){if(DVS.indexOf(r[3])<0)DVS.push(r[3])});
 var vb0=M.vb.slice(),vb=vb0.slice();

 var st=document.createElement("style");
 st.textContent="#gbd .bdh{text-align:center}#gbd .bdn{font-family:'Tiro Bangla',serif;font-size:2.6rem;color:var(--rose);line-height:1.1}"+
  "#gbd .bdt{height:8px;border-radius:99px;background:var(--line);overflow:hidden;margin:8px 0 12px}#gbd .bdt i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--rose2),var(--rose));border-radius:99px;transition:width .9s cubic-bezier(.2,.8,.2,1)}"+
  "#bdmapw{position:relative;border-radius:18px;background:rgba(255,255,255,.28);border:1px solid var(--line);overflow:hidden}"+
  "#bdsvg{display:block;width:100%;height:min(66vh,520px);touch-action:none;cursor:grab}"+
  ".bdp{fill:rgba(138,75,102,.17);stroke:var(--bg);stroke-width:1px;vector-effect:non-scaling-stroke;transition:fill .6s ease;cursor:pointer}"+
  ".bdp.v{fill:var(--rose)}.bdp.sel{stroke:var(--ink);stroke-width:2.2px}"+
  "@media (prefers-reduced-motion:no-preference){.bdp{animation:bdin .5s ease both}.bdp.pop{animation:bdpop .7s ease}}"+
  "@keyframes bdin{from{opacity:0}to{opacity:1}}@keyframes bdpop{0%{opacity:.3}60%{opacity:1;filter:brightness(1.35)}100%{filter:none}}"+
  "#bdzm{position:absolute;right:8px;bottom:8px;display:flex;flex-direction:column;gap:6px}#bdzm button{width:38px;height:38px;padding:0;border-radius:50%;font-size:1.2rem;line-height:1}"+
  "#bdsh{position:fixed;left:0;right:0;bottom:0;z-index:25;display:none;max-height:78vh;overflow-y:auto;background:var(--bg);border-top:1px solid var(--line);border-radius:22px 22px 0 0;box-shadow:0 -14px 40px rgba(0,0,0,.25);padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 18px)}"+
  "@media (prefers-reduced-motion:no-preference){#bdsh.on{animation:bdup .28s ease}}@keyframes bdup{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}"+
  "#bdsh.on{display:block}#bdsh .bdc{max-width:480px;margin:0 auto}"+
  ".bdph{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:10px 0}.bdph div{position:relative}.bdph img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;display:block}"+
  ".bdph button{position:absolute;top:4px;right:4px;width:30px;height:30px;padding:0;border-radius:50%;font-size:.9rem;background:rgba(0,0,0,.55);color:#fff;border:0}"+
  ".bdd{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin:10px 0}.bdd div{border:1px solid var(--line);border-radius:12px;padding:6px 10px;font-size:.88rem}.bdd b{color:var(--rose)}"+
  ".bdr{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 12px;margin:6px 0;border:1px solid var(--line);border-radius:14px;cursor:pointer;background:var(--glass)}"+
  ".bdr small{color:var(--soft)}.bdr .v{color:var(--rose);font-weight:600}"+
  ".bdfl{position:fixed;z-index:30;pointer-events:none;font-size:1.6rem;animation:bdfl 1.4s ease-out forwards}@keyframes bdfl{from{opacity:1;transform:translateY(0) scale(.7)}to{opacity:0;transform:translateY(-90px) scale(1.4)}}";
 document.head.appendChild(st);

 var pn=LV.el("div","panel card");pn.id="gbd";
 pn.innerHTML='<div class="bdh"><div class="bdn" id="bdn">০/৬৪</div><div class="hint">একসাথে ঘোরা জেলা</div></div><div class="bdt"><i id="bdb"></i></div>'+
  '<div id="bdmapw"><svg id="bdsvg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="বাংলাদেশের জেলার মানচিত্র"></svg><div id="bdzm"><button class="ghost" id="bdzi" aria-label="বড় করো">＋</button><button class="ghost" id="bdzo" aria-label="ছোট করো">－</button><button class="ghost" id="bdzr" aria-label="পুরো মানচিত্র">⟲</button></div></div>'+
  '<div id="bddv" style="display:flex;flex-wrap:wrap;gap:6px;margin:12px 0"></div><input type="text" id="bdq" placeholder="🔍 জেলা খোঁজো" aria-label="জেলা খোঁজো"><div id="bdl"></div><p class="note" id="bdnt"></p>';
 LV.panelChip($("mm"),$("mem"),"🗺️ আমাদের বাংলাদেশ",pn,function(){draw();stats()});

 var sh=LV.el("div","");sh.id="bdsh";document.body.appendChild(sh);
 function say(t){$("bdnt").textContent=t}
 function slug(k){return k}
 function today(){return LV.day()}

 /* ---------- মানচিত্র আঁকা ---------- */
 var svg=$("bdsvg"),drawn=false;
 function setVB(){svg.setAttribute("viewBox",vb.map(function(x){return x.toFixed(1)}).join(" "))}
 function draw(){
  if(!drawn){
   var h="";ORDER.forEach(function(k,i){h+='<path class="bdp" data-k="'+k+'" style="animation-delay:'+(i*9)+'ms" d="'+D[k].p+'"><title>'+D[k].bn+'</title></path>'});
   svg.innerHTML=h;drawn=true;setVB()}
  paint()}
 function paint(){
  [].forEach.call(svg.querySelectorAll(".bdp"),function(p){
   var k=p.getAttribute("data-k");p.classList.toggle("v",!!trips[k]);p.classList.toggle("sel",k===sel)})}
 function popOne(k){var p=svg.querySelector('.bdp[data-k="'+k+'"]');if(!p)return;p.classList.remove("pop");void p.getBoundingClientRect();p.classList.add("pop")}

 /* জুম ও সরানো (এক আঙুলে টানা, দুই আঙুলে চিমটি, বোতাম, মাউস হুইল) */
 function clampVB(){
  var W=vb0[2],H=vb0[3];vb[2]=Math.max(W/10,Math.min(W,vb[2]));vb[3]=vb[2]*H/W;
  vb[0]=Math.max(vb0[0]-W*.1,Math.min(vb0[0]+W*1.1-vb[2],vb[0]));vb[1]=Math.max(vb0[1]-H*.1,Math.min(vb0[1]+H*1.1-vb[3],vb[1]));setVB()}
 function zoomAt(f,fx,fy){var nw=vb[2]/f;vb[0]+=(vb[2]-nw)*fx;vb[1]+=(vb[3]-nw*vb[3]/vb[2])*fy;vb[3]=vb[3]*nw/vb[2];vb[2]=nw;clampVB()}
 function rectFix(){var r=svg.getBoundingClientRect(),W=vb[2],H=vb[3],s=Math.min(r.width/W,r.height/H);return{r:r,s:s,ox:(r.width-W*s)/2,oy:(r.height-H*s)/2}}
 var ptrs={},moved=0,pinch0=0,down=null;
 svg.addEventListener("pointerdown",function(e){ptrs[e.pointerId]=[e.clientX,e.clientY];moved=0;down=[e.clientX,e.clientY];try{svg.setPointerCapture(e.pointerId)}catch(x){}
  var ks=Object.keys(ptrs);if(ks.length===2){var a=ptrs[ks[0]],b=ptrs[ks[1]];pinch0=Math.hypot(a[0]-b[0],a[1]-b[1])}});
 svg.addEventListener("pointermove",function(e){
  var p=ptrs[e.pointerId];if(!p)return;var ks=Object.keys(ptrs),dx=e.clientX-p[0],dy=e.clientY-p[1];
  if(ks.length===1){moved+=Math.abs(dx)+Math.abs(dy);var g=rectFix();vb[0]-=dx/g.s;vb[1]-=dy/g.s;clampVB()}
  else if(ks.length===2){moved+=99;ptrs[e.pointerId]=[e.clientX,e.clientY];var a=ptrs[ks[0]],b=ptrs[ks[1]],d=Math.hypot(a[0]-b[0],a[1]-b[1]);
   if(pinch0&&d){var g2=rectFix(),mx=((a[0]+b[0])/2-g2.r.left)/g2.r.width,my=((a[1]+b[1])/2-g2.r.top)/g2.r.height;zoomAt(d/pinch0,mx,my);pinch0=d}}
  ptrs[e.pointerId]=[e.clientX,e.clientY]});
 function up(e){
  var had=ptrs[e.pointerId];delete ptrs[e.pointerId];pinch0=0;
  if(had&&moved<8&&!Object.keys(ptrs).length){
   var t=document.elementFromPoint(e.clientX,e.clientY),k=t&&t.getAttribute&&t.getAttribute("data-k");
   if(k&&D[k])openSheet(k);else closeSheet()}}
 svg.addEventListener("pointerup",up);svg.addEventListener("pointercancel",function(e){delete ptrs[e.pointerId];pinch0=0});
 svg.addEventListener("wheel",function(e){e.preventDefault();var g=rectFix();zoomAt(e.deltaY<0?1.25:.8,(e.clientX-g.r.left)/g.r.width,(e.clientY-g.r.top)/g.r.height)},{passive:false});
 $("bdzi").onclick=function(){zoomAt(1.6,.5,.5)};$("bdzo").onclick=function(){zoomAt(1/1.6,.5,.5)};$("bdzr").onclick=function(){vb=vb0.slice();setVB()};

 /* ---------- সংখ্যা ও তালিকা ---------- */
 var shownN=0,cntT=null;
 function countTo(n){
  var from=shownN;shownN=n;if(cntT)clearInterval(cntT);
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  function set(v){$("bdn").textContent=bn(v)+"/"+bn(64)}
  if(reduce||from===n){set(n);return}
  var s=0,steps=Math.min(20,Math.abs(n-from)*3||1);cntT=setInterval(function(){s++;set(Math.round(from+(n-from)*s/steps));if(s>=steps)clearInterval(cntT)},40)}
 function stats(){
  var keys=Object.keys(trips).filter(function(k){return D[k]}),n=keys.length;
  countTo(n);$("bdb").style.width=(n/64*100)+"%";
  var dv=$("bddv");dv.innerHTML="";
  DVS.forEach(function(v){var tot=0,got=0;ORDER.forEach(function(k){if(D[k].dv===v){tot++;if(trips[k])got++}});
   var c=LV.el("span","chip"+(got===tot?" on":""),v+" "+bn(got)+"/"+bn(tot));dv.appendChild(c)});
  list()}
 function list(){
  var l=$("bdl");l.innerHTML="";
  if(err){l.appendChild(LV.el("p","hint","সমস্যা: "+err));return}
  if(!ld){l.appendChild(LV.el("p","hint","লোড হচ্ছে…"));return}
  var q=$("bdq").value.trim().toLowerCase(),ks;
  if(q)ks=ORDER.filter(function(k){return D[k].bn.indexOf(q)>=0||D[k].en.toLowerCase().indexOf(q)>=0});
  else ks=Object.keys(trips).filter(function(k){return D[k]}).sort(function(a,b){return (trips[b].t||"").localeCompare(trips[a].t||"")});
  if(!ks.length){l.appendChild(LV.el("p","hint",q?"পাওয়া যায়নি":"মানচিত্রে কোনো জেলায় চাপো"));return}
  ks.forEach(function(k){var t=trips[k],r=LV.el("div","bdr");
   r.appendChild(LV.el("span",t?"v":"",(t?"✓ ":"")+D[k].bn));
   r.appendChild(LV.el("small","",t&&t.t?fd(t.t):D[k].dv));
   r.onclick=function(){openSheet(k,true)};l.appendChild(r)})}
 $("bdq").oninput=list;

 /* ---------- জেলার কার্ড ---------- */
 function closeSheet(){sel=null;sh.classList.remove("on");paint()}
 function openSheet(k,focus){
  sel=k;paint();var d=D[k],t=trips[k];sh.innerHTML="";sh.classList.add("on");
  var c=LV.el("div","bdc");sh.appendChild(c);
  var top=LV.el("div","");top.style.cssText="display:flex;justify-content:space-between;align-items:flex-start;gap:8px";
  var h=LV.el("div","");h.appendChild(LV.el("div","serif",d.bn)).style.cssText="font-size:1.5rem;line-height:1.2";h.appendChild(LV.el("div","hint",d.en+" · "+d.dv+" বিভাগ"));
  var x=LV.el("button","ghost","✕");x.style.cssText="width:40px;height:40px;padding:0;border-radius:50%";x.setAttribute("aria-label","বন্ধ করো");x.onclick=closeSheet;
  top.appendChild(h);top.appendChild(x);c.appendChild(top);
  if(focus&&drawn){var p=svg.querySelector('.bdp[data-k="'+k+'"]');if(p){var bb=p.getBBox(),m=Math.max(bb.width,bb.height,28)*2.4;vb[2]=Math.min(vb0[2],m*1.0);vb[3]=vb[2]*vb0[3]/vb0[2];vb[0]=bb.x+bb.width/2-vb[2]/2;vb[1]=bb.y+bb.height/2-vb[3]/2;clampVB()}}
  var date=document.createElement("input");date.type="date";date.max=today();date.value=(t&&t.t)||today();date.setAttribute("aria-label","ঘোরার তারিখ");
  var note=document.createElement("textarea");note.rows=2;note.maxLength=200;note.placeholder="ছোট একটা স্মৃতি (ঐচ্ছিক)";note.value=(t&&t.n)||"";note.setAttribute("aria-label","স্মৃতি");
  c.appendChild(date);c.appendChild(note);
  var sv=LV.el("button","",t?"💾 সেভ করো":"✅ একসাথে ঘুরেছি");sv.style.marginTop="6px";
  sv.onclick=function(){save(k,date.value||today(),note.value.trim(),!t)};c.appendChild(sv);
  var ms=LV.el("p","note","");ms.id="bdsm";c.appendChild(ms);
  if(t){
   var pb=LV.el("div","bdph");pb.id="bdph";c.appendChild(pb);
   var row=LV.el("div","two");
   var add=LV.el("button","ghost","📷 ছবি যোগ করো");var fi=document.createElement("input");fi.type="file";fi.accept="image/*";fi.style.display="none";
   add.onclick=function(){if((ph[k]||[]).length>=4){ms.textContent="সর্বোচ্চ ৪টা ছবি";return}fi.click()};
   fi.onchange=function(){var f=fi.files[0];fi.value="";if(f)addPhoto(k,f,ms)};
   var rm=LV.el("button","ghost","🗑️ তালিকা থেকে সরাও");rm.onclick=function(){remove(k,ms)};
   row.appendChild(add);row.appendChild(rm);c.appendChild(row);c.appendChild(fi);
   loadPhotos(k)}}
 function save(k,date,note,isNew){
  if(!DB||!WHO)return;
  var o={};o[k]={t:date,n:note.slice(0,200),by:WHO};
  DB.doc("meta/trips").set({d:o},{merge:true}).then(function(){
   if(isNew){logEv("একসাথে ঘোরা জেলা: "+D[k].bn+" 🗺️","memories");fly(sh.querySelector(".serif"));setTimeout(function(){popOne(k)},60)}
   var m=$("bdsm");if(m)m.textContent="সেভ হয়েছে ✓";openSheet(k)}).catch(function(e){var m=$("bdsm");if(m)m.textContent="সমস্যা: "+e.code})}
 function remove(k,ms){
  if(!confirm(D[k].bn+" তালিকা থেকে সরাবে? এই জেলার ছবিগুলোও মুছে যাবে।"))return;
  var u={};u["d."+k]=firebase.firestore.FieldValue.delete();
  DB.collection("tripph").where("key","==",k).get().then(function(qs){var a=[];qs.forEach(function(d){a.push(d.ref.delete())});return Promise.all(a)})
   .then(function(){return DB.doc("meta/trips").update(u)}).then(function(){delete ph[k];closeSheet()}).catch(function(e){ms.textContent="সমস্যা: "+(e.code||e.message)})}
 function loadPhotos(k){
  DB.collection("tripph").where("key","==",k).get().then(function(qs){
   var a=[];qs.forEach(function(d){var x=d.data();x.id=d.id;a.push(x)});a.sort(function(p,q){return p.t-q.t});ph[k]=a;showPhotos(k)}).catch(function(){})}
 function showPhotos(k){
  var b=$("bdph");if(!b||sel!==k)return;b.innerHTML="";
  (ph[k]||[]).forEach(function(x){
   var w=LV.el("div","");var im=document.createElement("img");im.src=x.img;im.alt=D[k].bn+" এর ছবি";w.appendChild(im);
   if(x.from===WHO){var d=LV.el("button","","✕");d.setAttribute("aria-label","ছবি মুছো");d.onclick=function(){if(confirm("ছবিটা চিরতরে মুছবে?"))DB.collection("tripph").doc(x.id).delete().then(function(){ph[k]=(ph[k]||[]).filter(function(y){return y.id!==x.id});showPhotos(k)})};w.appendChild(d)}
   b.appendChild(w)})}
 function addPhoto(k,f,ms){
  if(busy)return;busy=true;ms.textContent="ছবি প্রস্তুত হচ্ছে…";
  LV.compress(f,900,.7,110000).then(function(img){
   return DB.collection("tripph").add({key:k,nm:D[k].bn,img:img,from:WHO,t:Date.now()})}).then(function(){busy=false;ms.textContent="ছবি যোগ হয়েছে ✓";loadPhotos(k)})
   .catch(function(e){busy=false;ms.textContent=e&&e.message==="big"?"ছবিটা বেশি বড়, অন্যটা দাও":"সমস্যা: "+(e.code||"ছবি")})}
 function fly(near){
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  var r=near?near.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2};
  for(var i=0;i<5;i++){(function(i){setTimeout(function(){var h=LV.el("div","bdfl",["💗","✨","💖","🎉","💕"][i]);h.style.left=(r.left+i*22)+"px";h.style.top=(r.top-10)+"px";document.body.appendChild(h);setTimeout(function(){h.remove()},1500)},i*110)})(i)}}

 setInterval(function(){if(sh.classList.contains("on")&&pn.offsetParent===null)closeSheet()},500);
 LV.onStart(function(){
  DB.doc("meta/trips").onSnapshot(function(s){
   var nd=(s.data()||{}).d||{},old=trips;trips=nd;ld=true;err="";
   if(pn.classList.contains("on")){draw();stats()}
   Object.keys(nd).forEach(function(k){if(!old[k]&&ld&&pn.classList.contains("on")&&Object.keys(old).length)setTimeout(function(){popOne(k)},60)});
   if(sel&&sh.classList.contains("on")&&!sh.contains(document.activeElement))openSheet(sel)},
   function(e){err=e.code||"error";list()})});
})();
