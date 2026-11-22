/* ===== অ্যাপ লক: PIN + (সমর্থিত ফোনে) বায়োমেট্রিক + নিষ্ক্রিয়তায় নিজে লক =====
   সৎ সীমাবদ্ধতা: এটা শুধু এই ডিভাইসের স্ক্রিন-গেট। Firebase লগইন সেশন ডিভাইসেই থাকে।
   যে ব্যক্তি ডেভেলপার টুল চালাতে পারে বা ব্রাউজারের ডেটা মুছতে পারে, সে এটা এড়াতে পারে।
   এটা কৌতূহলী চোখ থেকে রক্ষা করে, ফোন-চোরের বিরুদ্ধে নয়। স্ক্রিনশট/স্ক্রিন রেকর্ড ব্রাউজারে আটকানো যায় না।
   PIN সংরক্ষিত হয় PBKDF2 হ্যাশ হিসেবে, শুধু এই ফোনের localStorage-এ। সার্ভারে যায় না। */
(function(){
 var KEY="lockCfg",cfg=null,locked=false,last=Date.now(),hidAt=0,tries=0,until=0,SUB=window.crypto&&window.crypto.subtle;
 try{cfg=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 function save(){try{if(cfg)localStorage.setItem(KEY,JSON.stringify(cfg));else localStorage.removeItem(KEY)}catch(e){}}
 function b64(buf){var s="",a=new Uint8Array(buf);for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s)}
 function unb64(s){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
 function hash(pin,salt){
  return SUB.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveBits"]).then(function(k){
   return SUB.deriveBits({name:"PBKDF2",salt:unb64(salt),iterations:100000,hash:"SHA-256"},k,256)}).then(b64)}

 var ov=LV.el("div","");ov.id="lockov";
 ov.style.cssText="position:fixed;inset:0;z-index:60;background:radial-gradient(circle at 20% 10%,var(--bg2),transparent 50%),var(--bg);display:none;align-items:center;justify-content:center;padding:20px";
 ov.innerHTML='<div class="card" style="width:100%;max-width:340px;text-align:center"><div style="font-size:2.6rem">🔒</div><h2 style="margin:4px 0">আমাদের ছোট্ট পৃথিবী</h2><p class="sub" style="margin-bottom:8px">খুলতে PIN দাও</p>'+
  '<input type="password" id="lkp" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="PIN" aria-label="PIN" style="text-align:center;letter-spacing:.3em;font-size:1.4rem">'+
  '<button id="lku">খোলো</button><button class="ghost" id="lkb" style="margin-top:8px;display:none">🫆 বায়োমেট্রিক দিয়ে খোলো</button>'+
  '<button class="ghost" id="lkf" style="margin-top:8px">PIN ভুলে গেছি</button><p class="note" id="lkn" role="status"></p></div>';
 document.body.appendChild(ov);
 function msg(t){$("lkn").textContent=t}
 function show(){
  if(!cfg)return;locked=true;ov.style.display="flex";$("lkp").value="";msg("");
  $("lkb").style.display=cfg.bio?"block":"none";
  setTimeout(function(){try{$("lkp").focus()}catch(e){}},50)}
 function hide(){locked=false;ov.style.display="none";last=Date.now();tries=0;$("lkp").value=""}
 function tryPin(){
  var now=Date.now();if(now<until){msg("একটু অপেক্ষা করো ("+bn(Math.ceil((until-now)/1000))+" সেকেন্ড)");return}
  var p=$("lkp").value;if(!p)return;
  hash(p,cfg.s).then(function(h){
   if(h===cfg.h)hide();
   else{tries++;$("lkp").value="";if(tries>=5){until=Date.now()+30000;tries=0;msg("অনেকবার ভুল, ৩০ সেকেন্ড অপেক্ষা করো।")}else msg("PIN ভুল। আবার চেষ্টা করো।")}
  }).catch(function(){msg("যাচাই করা যায়নি।")})}
 $("lku").onclick=tryPin;$("lkp").addEventListener("keydown",function(e){if(e.key==="Enter")tryPin()});
 $("lkb").onclick=function(){
  if(!cfg||!cfg.bio)return;
  navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{id:unb64(cfg.bio),type:"public-key"}],userVerification:"required",timeout:60000}})
   .then(function(){hide()}).catch(function(){msg("বায়োমেট্রিক হয়নি, PIN দাও।")})};
 $("lkf").onclick=function(){
  if(!confirm("PIN ভুলে গেলে বের হয়ে ইমেইল-পাসওয়ার্ড দিয়ে আবার ঢুকতে হবে এবং অ্যাপ লক মুছে যাবে। এগোবে?"))return;
  cfg=null;save();try{if(AU)AU.signOut().then(function(){location.reload()});else location.reload()}catch(e){location.reload()}};

 /* নিষ্ক্রিয়তা */
 function touch(){if(!locked)last=Date.now()}
 ["pointerdown","keydown","touchstart","scroll"].forEach(function(t){document.addEventListener(t,touch,{passive:true,capture:true})});
 setInterval(function(){if(cfg&&!locked&&cfg.min&&Date.now()-last>cfg.min*60000)show()},5000);
 document.addEventListener("visibilitychange",function(){
  if(document.hidden)hidAt=Date.now();
  else if(cfg&&!locked&&cfg.min&&hidAt&&Date.now()-hidAt>cfg.min*60000)show()});
 if(cfg)show();

 /* সেটিংস */
 LV.section("🔒 অ্যাপ লক",function(c){
  var body=LV.el("div");c.appendChild(body);
  function ask(t){return prompt(t)}
  function setPin(){
   if(!SUB){alert("PIN-এর জন্য নিরাপদ (HTTPS) কানেকশন লাগবে।");return}
   var p=ask("নতুন PIN দাও (৪ থেকে ৮টা সংখ্যা)");if(p===null)return;
   if(!/^\d{4,8}$/.test(p)){alert("৪ থেকে ৮টা সংখ্যা দিতে হবে।");return}
   if(ask("আবার একই PIN দাও")!==p){alert("মেলেনি।");return}
   var salt=b64(crypto.getRandomValues(new Uint8Array(16)));
   hash(p,salt).then(function(h){cfg={s:salt,h:h,min:cfg&&cfg.min||2,bio:cfg&&cfg.bio||null};save();last=Date.now();r()})}
  function verify(then){
   var p=ask("বর্তমান PIN দাও");if(p===null)return;
   hash(p,cfg.s).then(function(h){if(h===cfg.h)then();else alert("PIN ভুল।")})}
  function bioOn(){
   if(!window.PublicKeyCredential){alert("এই ব্রাউজারে বায়োমেট্রিক সাপোর্ট নেই।");return}
   PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(function(ok){
    if(!ok){alert("এই ডিভাইসে ফিঙ্গারপ্রিন্ট/ফেস লক সেট করা নেই বা সাপোর্ট নেই।");return}
    return navigator.credentials.create({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),rp:{name:"আমাদের পৃথিবী"},
     user:{id:crypto.getRandomValues(new Uint8Array(16)),name:"app-lock",displayName:"অ্যাপ লক"},pubKeyCredParams:[{type:"public-key",alg:-7},{type:"public-key",alg:-257}],
     authenticatorSelection:{authenticatorAttachment:"platform",userVerification:"required"},timeout:60000}}).then(function(cr){cfg.bio=b64(cr.rawId);save();r()})
   }).catch(function(){alert("বায়োমেট্রিক চালু করা যায়নি।")})}
  function r(){
   body.innerHTML="";
   if(!cfg){
    body.appendChild(LV.el("p","hint","এখন বন্ধ। চালু করলে অ্যাপ খুলতে PIN লাগবে।"));
    var b=LV.el("button","","🔒 PIN সেট করো");b.onclick=setPin;body.appendChild(b)}
   else{
    body.appendChild(LV.el("p","","✅ অ্যাপ লক চালু আছে"));
    body.appendChild(LV.el("div","hint","কতক্ষণ নিষ্ক্রিয় থাকলে নিজে লক হবে"));
    var ch=LV.el("div","chips");body.appendChild(ch);
    [[1,"১ মিনিট"],[2,"২ মিনিট"],[5,"৫ মিনিট"],[15,"১৫ মিনিট"],[30,"৩০ মিনিট"]].forEach(function(x){
     var k=LV.el("button","chip"+(cfg.min===x[0]?" on":""),x[1]);k.onclick=function(){cfg.min=x[0];save();r()};ch.appendChild(k)});
    var bi=LV.el("button","ghost",cfg.bio?"🫆 বায়োমেট্রিক বন্ধ করো":"🫆 বায়োমেট্রিক চালু করো");bi.style.marginTop="6px";
    bi.onclick=function(){if(cfg.bio){cfg.bio=null;save();r()}else bioOn()};body.appendChild(bi);
    var cp=LV.el("button","ghost","PIN বদলাও");cp.style.marginTop="8px";cp.onclick=function(){verify(setPin)};body.appendChild(cp);
    var lk=LV.el("button","ghost","🔒 এখনই লক করো");lk.style.marginTop="8px";lk.onclick=function(){show()};body.appendChild(lk);
    var off=LV.el("button","ghost","অ্যাপ লক বন্ধ করো");off.style.marginTop="8px";off.onclick=function(){verify(function(){cfg=null;save();r()})};body.appendChild(off)}
   body.appendChild(LV.el("p","hint","⚠️ সীমাবদ্ধতা: এটা শুধু এই ফোনের স্ক্রিন-লক। ব্রাউজারের লগইন সেশন ফোনেই থাকে, তাই ডেভেলপার টুল বা ডেটা মুছে এটা এড়ানো সম্ভব। এটা কৌতূহলী চোখ থেকে রক্ষা করে, ফোন-চোরের বিরুদ্ধে নয়। স্ক্রিনশট বা স্ক্রিন রেকর্ড ব্রাউজার থেকে বন্ধ করা যায় না। বায়োমেট্রিক শুধু সমর্থিত ফোনে (ফিঙ্গারপ্রিন্ট/ফেস লক সেট থাকলে) চলে এবং ডিভাইসের ভেতরেই যাচাই হয়।"))}
  r()})
})();
