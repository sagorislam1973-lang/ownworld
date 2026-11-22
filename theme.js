/* ===== থিম: সিস্টেম/লাইট/ডার্ক ও নিজের পছন্দের অ্যাকসেন্ট রঙ (এই ফোনে সংরক্ষিত) ===== */
(function(){
 var KEY="themeCfg",cfg={mode:"system",acc:""};
 try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&typeof s==="object")cfg=s}catch(e){}
 var ACC=[["","গোলাপি (ডিফল্ট)"],["#8B5CF6","বেগুনি"],["#2563EB","নীল"],["#059669","সবুজ"],["#EA580C","কমলা"],["#DC2626","লাল"]];
 function mix(h,t){var n=parseInt(h.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;function m(c){return Math.round(c+(255-c)*t)}return "#"+((1<<24)+(m(r)<<16)+(m(g)<<8)+m(b)).toString(16).slice(1)}
 function apply(){
  var r=document.documentElement;
  if(cfg.mode==="light"||cfg.mode==="dark")r.setAttribute("data-theme",cfg.mode);else r.removeAttribute("data-theme");
  if(/^#[0-9a-fA-F]{6}$/.test(cfg.acc)){r.style.setProperty("--rose",cfg.acc);r.style.setProperty("--rose2",mix(cfg.acc,.35))}
  else{r.style.removeProperty("--rose");r.style.removeProperty("--rose2")}
  var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",/^#/.test(cfg.acc)?cfg.acc:"#E0356B")}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}apply()}
 apply();
 LV.section("🎨 থিম",function(c){
  c.appendChild(LV.el("div","hint","আলো/অন্ধকার"));
  var m=LV.el("div","chips");c.appendChild(m);
  var MODES=[["system","📱 ফোনের মতো"],["light","☀️ লাইট"],["dark","🌙 ডার্ক"]];
  function rm(){m.innerHTML="";MODES.forEach(function(x){var b=LV.el("button","chip"+(cfg.mode===x[0]?" on":""),x[1]);b.onclick=function(){cfg.mode=x[0];save();rm()};m.appendChild(b)})}rm();
  c.appendChild(LV.el("div","hint","অ্যাকসেন্ট রঙ"));
  var a=LV.el("div","chips");c.appendChild(a);
  function ra(){a.innerHTML="";ACC.forEach(function(x){var b=LV.el("button","chip"+(cfg.acc===x[0]?" on":""),x[1]);if(x[0])b.style.borderColor=x[0];b.onclick=function(){cfg.acc=x[0];save();ra()};a.appendChild(b)})}ra();
  var l=LV.el("label","hint","নিজের রঙ: ");var i=document.createElement("input");i.type="color";i.value=/^#/.test(cfg.acc)?cfg.acc:"#e0356b";i.setAttribute("aria-label","নিজের পছন্দের রঙ");
  i.onchange=function(){cfg.acc=i.value;save();ra()};l.appendChild(i);c.appendChild(l);
  c.appendChild(LV.el("p","hint","পছন্দ শুধু এই ফোনে সংরক্ষিত থাকে, ওর ফোনে বদলায় না।"))})
})();
