/* ===== একসাথে গান শোনা (YouTube লিংক) =====
   নিজে কোনো গান হোস্ট করা হয় না। শুধু YouTube-এর অফিসিয়াল এমবেড প্লেয়ার (IFrame API) ব্যবহার হয়।
   ডেটা: meta/music      = { vid, by, play, pos, at, v }   (শেষ নিয়ন্ত্রণ: কে, চলছে কি না, কোন সেকেন্ডে, কখন)
         meta/mus_{who}  = { open, playing, hb }            (শোনার অবস্থা)
   সিঙ্ক: একজন চালালে/থামালে/এগিয়ে নিলে অন্যজনের প্লেয়ার মিলিয়ে নেয়। দুই ফোনের ঘড়ির পার্থক্যে ১–২ সেকেন্ড ফারাক হতে পারে,
   তখন “🔄 সিঙ্ক করো” চাপো। YouTube-এর বিজ্ঞাপন নিয়ন্ত্রণ করা যায় না। মোবাইলে অটোপ্লে ব্লক হলে “▶️ যোগ দিতে চাপো”। */
(function(){
 var doc=null,player=null,ready=false,vid="",applying=0,lastCur=0,hb=null,tm=null,partner=null,opened=false,apiTried=false,err="",needTap=false,cv=0;
 var pn=LV.el("div","panel card");pn.id="gmusic";
 pn.innerHTML='<div class="serif" style="text-align:center;font-size:1.2rem">🎵 একসাথে গান</div><p class="hint" style="text-align:center;margin:4px 0 8px">YouTube লিংক দাও, দুজনে একসাথে শোনো।</p>'+
  '<input type="text" id="mul" placeholder="YouTube লিংক পেস্ট করো" aria-label="YouTube লিংক"><button id="mub">🎵 লোড করো</button>'+
  '<div id="mup" style="margin:10px 0;border-radius:14px;overflow:hidden;background:#000;min-height:0"></div>'+
  '<div class="two" id="muc" style="display:none"><button id="mup1">▶️ চালাও</button><button class="ghost" id="mup2">⏸ থামাও</button></div>'+
  '<button class="ghost" id="mus" style="display:none;margin-top:8px">🔄 সিঙ্ক করো</button>'+
  '<button id="mut" style="display:none;margin-top:8px">▶️ যোগ দিতে চাপো</button>'+
  '<p class="note" id="mun"></p><p class="hint" id="muw" style="text-align:center"></p>';
 LV.panelChip($("gm"),$("games"),"🎵 একসাথে গান",pn,function(){opened=true;loadApi();beat();status()});
 [].forEach.call($("gm").children,function(b){b.addEventListener("click",function(){setTimeout(function(){if(!pn.classList.contains("on")){opened=false;beat()}},0)})});
 function say(t){$("mun").textContent=t}
 function parse(u){
  var m=(u||"").trim().match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})/);return m?m[1]:null}

 function loadApi(){
  if(window.YT&&YT.Player){mount();return}
  if(apiTried)return;apiTried=true;
  var prev=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=function(){if(prev)prev();mount()};
  var s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";s.onerror=function(){err="YouTube লোড হয়নি (ইন্টারনেট বা ব্লক)।";status()};document.head.appendChild(s)}
 function mount(){
  if(player||!(window.YT&&YT.Player))return;
  var d=LV.el("div");d.id="muyt";$("mup").appendChild(d);
  player=new YT.Player("muyt",{width:"100%",height:"220",playerVars:{playsinline:1,rel:0,modestbranding:1},events:{onReady:function(){ready=true;$("muc").style.display="";$("mus").style.display="";if(doc&&doc.vid)apply()},onStateChange:onState,onAutoplayBlocked:function(){needTap=true;status()}}})}

 function pos(){try{return player.getCurrentTime()||0}catch(e){return 0}}
 function playing(){try{return player.getPlayerState()===1}catch(e){return false}}
 function expected(d){return d.play?d.pos+Math.max(0,(Date.now()-d.at)/1000):d.pos}
 function publish(play){
  if(!DB||!WHO||!vid)return;
  DB.doc("meta/music").set({vid:vid,by:WHO,play:play,pos:Math.round(pos()*10)/10,at:Date.now(),v:Date.now()+"_"+WHO+"_"+(++cv)}).catch(function(e){say("সমস্যা: "+e.code)})}
 function guard(ms){applying=Date.now()+(ms||1800)}
 /* অন্যজনের শেষ অবস্থার সঙ্গে নিজের প্লেয়ার মেলায় (বারবার চালালেও একই ফল) */
 function apply(){
  if(!ready||!doc||!doc.vid)return;
  var ex=Math.max(0,expected(doc));guard(4000);
  if(vid!==doc.vid){vid=doc.vid;
   if(doc.play)player.loadVideoById({videoId:vid,startSeconds:ex});else player.cueVideoById({videoId:vid,startSeconds:ex})}
  else{
   if(Math.abs(pos()-ex)>(doc.play?3:1.5))player.seekTo(ex,true);
   if(doc.play&&!playing()){player.playVideo();setTimeout(function(){if(doc&&doc.play&&!playing()){needTap=true;status()}},2500)}
   if(!doc.play&&playing())player.pauseVideo()}
  $("mul").value="https://youtu.be/"+vid;status()}
 function onState(e){
  if(Date.now()<applying)return;
  if(e.data===1){needTap=false;publish(true)}else if(e.data===2)publish(false);
  beat();status()}
 $("mub").onclick=function(){
  var id=parse($("mul").value);if(!id){say("সঠিক YouTube লিংক দাও (youtube.com বা youtu.be)।");return}
  if(!ready){say("প্লেয়ার লোড হচ্ছে, একটু পরে চেষ্টা করো।");loadApi();return}
  vid=id;guard();player.loadVideoById(id);say("");setTimeout(function(){publish(true)},800)};
 $("mup1").onclick=function(){if(!vid)return;guard();player.playVideo();setTimeout(function(){publish(true)},400)};
 $("mup2").onclick=function(){if(!vid)return;guard();player.pauseVideo();setTimeout(function(){publish(false)},400)};
 $("mus").onclick=function(){if(!vid)return;publish(playing());say("")};
 $("mut").onclick=function(){needTap=false;if(doc)apply();guard(4000);try{player.playVideo()}catch(e){}status()};

 /* শোনার অবস্থা */
 function beat(){
  if(!DB||!WHO)return;
  var o={open:!!(opened&&pn.classList.contains("on")),playing:ready&&playing(),hb:Date.now()};
  DB.doc("meta/mus_"+WHO).set(o).catch(function(){})}
 function status(){
  var w=$("muw");if(!w)return;
  $("mut").style.display=needTap&&doc&&doc.play?"block":"none";
  var p=partner,live=p&&p.open&&Date.now()-p.hb<90000;
  w.textContent=err||("আমি: "+(ready&&playing()?"🎧 শুনছি":"চুপ")+" · "+LV.pn()+": "+(live?(p.playing?"🎧 শুনছে":"প্লেয়ার খোলা আছে"):"এখন এখানে নেই"))}
 setInterval(function(){if(pn.classList.contains("on")){beat();status();
  if(ready&&playing()){var c=pos();if(Date.now()>applying&&Math.abs(c-lastCur-1)>3&&lastCur){publish(true)}lastCur=c}else lastCur=0}},1000);
 setInterval(function(){if(pn.classList.contains("on"))beat()},30000);
 window.addEventListener("pagehide",function(){if(DB&&WHO)DB.doc("meta/mus_"+WHO).set({open:false,playing:false,hb:Date.now()}).catch(function(){})});

 LV.onStart(function(){
  DB.doc("meta/music").onSnapshot(function(s){
   var was=doc;doc=s.exists?s.data():null;
   if(doc&&doc.by!==WHO&&!s.metadata.hasPendingWrites){
    if(ready)apply();
    if(!pn.classList.contains("on")&&doc.play&&Date.now()-doc.at<20000&&(!was||was.at!==doc.at))toast("🎵 "+LV.pn()+" একটা গান চালিয়েছে, শুনবে?",function(){goTab("games");[].forEach.call($("gm").children,function(c){if(/একসাথে গান/.test(c.textContent))c.click()})})}
   status()},function(e){err="সমস্যা: "+e.code;status()});
  DB.doc("meta/mus_"+PW).onSnapshot(function(s){partner=s.exists?s.data():null;status()},function(){})});
})();
