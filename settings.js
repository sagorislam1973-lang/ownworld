/* ===== সেটিংস ও নিরাপত্তা (থিম, অ্যাপ লক, ব্যাকআপ, ইনস্টল এখানে জমা হয়) ===== */
(function(){
 var hc=mk2('<div class="serif" style="font-size:1.2rem;margin-bottom:6px">⚙️ সেটিংস ও নিরাপত্তা</div><p class="hint" style="margin:0 0 10px">থিম, অ্যাপ লক, ডেটা ব্যাকআপ, অ্যাপ ইনস্টল</p><button class="ghost" id="setb">খোলো</button>');
 var ov=LV.el("div","lvo");ov.id="setov";
 ov.innerHTML='<div class="lvh"><button class="ghost" id="setx" aria-label="ফিরে যাও">←</button><b class="serif" style="font-size:1.2rem">⚙️ সেটিংস ও নিরাপত্তা</b></div><div class="lvb" id="setl"></div>';
 document.body.appendChild(ov);
 $("setb").onclick=function(){ov.style.display="flex"};
 $("setx").onclick=function(){ov.style.display="none"};
 LV.section=function(title,fn){
  var c=LV.el("div","card");var h=LV.el("div","serif",title);h.style.cssText="font-size:1.15rem;margin-bottom:8px";c.appendChild(h);
  try{fn(c)}catch(e){c.appendChild(LV.el("p","hint","এই অংশ লোড হয়নি: "+e.message))}
  $("setl").appendChild(c);return c};
 LV.section("🗄️ স্টোরেজ ম্যানেজার",function(c){
  c.appendChild(LV.el("p","hint","জায়গা কতটা ব্যবহার হচ্ছে দেখো, আর পুরোনো জিনিস নিজে মুছে ফেলো।"));
  var b=LV.el("button","ghost","খোলো");b.onclick=function(){ov.style.display="none";var s=$("stb");if(s)s.click()};c.appendChild(b)});
})();
