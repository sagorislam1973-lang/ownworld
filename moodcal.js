/* ===== দৈনিক মুড ক্যালেন্ডার =====
   স্মৃতি ট্যাবে “🗓️ মুড ক্যালেন্ডার”। প্রতিদিন আমি ও ও শেষ কোন মুড (৬ ইমোজি) ও কোন আলো (🟢🟡🔴) রেখেছিলাম, মাসের ছকে।
   মুড বা আলো বদলালে সেদিনের ঘরে নিজে নিজে সংরক্ষিত হয় (শুধু বদলের সময়, গোপনে কিছু রেকর্ড হয় না)।
   ডেটা: meta/moodcal_{who} = { d: { "YYYY-MM-DD": { m: মুডের ইনডেক্স, l: "g"|"y"|"r" } } }  (বছরে ~১০ KB) */
(function(){
 var mine={},pt={},cur=LV.day().slice(0,7),ran=false,ld={m:false,p:false},err="";
 var LG={g:"🟢",y:"🟡",r:"🔴"};
 var pn=LV.el("div","panel");pn.id="mcal";
 pn.innerHTML='<div class="card"><div class="serif" style="font-size:1.15rem;text-align:center">🗓️ মুড ক্যালেন্ডার</div>'+
  '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin:8px 0"><button class="ghost" id="cal_mcp" style="width:auto;padding:6px 14px" aria-label="আগের মাস">◀</button><b class="serif" id="cal_mct" style="font-size:1.1rem"></b><button class="ghost" id="cal_mcn" style="width:auto;padding:6px 14px" aria-label="পরের মাস">▶</button></div>'+
  '<div class="hint" style="text-align:center;margin-bottom:6px">প্রতি ঘরে ওপরে আমি, নিচে <span id="cal_mcw"></span></div><div id="cal_mcg"></div><p class="hint" id="cal_mcs" style="margin:8px 0 0"></p></div>';
 LV.panelChip($("mm"),$("mem"),"🗓️ মুড ক্যালেন্ডার",pn,function(){render()});
 function shift(k,n){var a=k.split("-"),d=new Date(+a[0],+a[1]-1+n,1);return d.getFullYear()+"-"+pad(d.getMonth()+1)}
 $("cal_mcp").onclick=function(){cur=shift(cur,-1);render()};
 $("cal_mcn").onclick=function(){if(cur<LV.day().slice(0,7)){cur=shift(cur,1);render()}};
 function emo(o){var m=(typeof MOODS!=="undefined"&&o&&o.m!=null&&MOODS[o.m])?MOODS[o.m].split(" ")[0]:"";return m+(o&&o.l?LG[o.l]||"":"")}
 function render(){
  var a=cur.split("-"),y=+a[0],m=+a[1]-1,first=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
  $("cal_mct").textContent=new Date(y,m,1).toLocaleDateString("bn-BD",{month:"long",year:"numeric"});
  $("cal_mcw").textContent=LV.pn();$("cal_mcn").disabled=cur>=LV.day().slice(0,7);
  var g=$("cal_mcg");g.innerHTML="";
  if(err){g.appendChild(LV.el("p","hint","সমস্যা: "+err));return}
  var w=LV.el("div","");w.style.cssText="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center";
  ["রবি","সোম","মঙ্গল","বুধ","বৃহ","শুক্র","শনি"].forEach(function(d){w.appendChild(LV.el("div","hint",d)).style.fontSize=".72rem"});
  for(var i=0;i<first;i++)w.appendChild(LV.el("div"));
  var cm=0,cp=0,today=LV.day();
  for(var d=1;d<=n;d++){
   var k=cur+"-"+pad(d),mo=mine[k],po=pt[k];if(mo)cm++;if(po)cp++;
   var c=LV.el("div","");c.style.cssText="border:1px solid var(--line);border-radius:8px;padding:2px 0;min-height:56px;font-size:.8rem;line-height:1.25;"+(k===today?"outline:2px solid var(--rose);":"");
   c.appendChild(LV.el("div","hint",bn(d)));c.appendChild(LV.el("div","",emo(mo)||"·"));c.appendChild(LV.el("div","",emo(po)||"·"));
   c.setAttribute("aria-label",bn(d)+" তারিখ: আমি "+(emo(mo)||"কিছু নেই")+", "+LV.pn()+" "+(emo(po)||"কিছু নেই"));w.appendChild(c)}
  g.appendChild(w);
  $("cal_mcs").textContent=(ld.m&&ld.p)?"এই মাসে আমি "+bn(cm)+" দিন, "+LV.pn()+" "+bn(cp)+" দিন মুড রেখেছি।":"লোড হচ্ছে…"}
 function rec(field,val){
  if(!DB||!WHO)return;var k=LV.day(),o={};o[field]=val;
  DB.doc("meta/moodcal_"+WHO).set({d:(function(){var d={};d[k]=o;return d})()},{merge:true}).catch(function(){})}
 LV.onStart(function(){
  var lm,ll,fm=true,fl=true;
  DB.doc("meta/moodcal_"+WHO).onSnapshot(function(s){mine=(s.data()||{}).d||{};ld.m=true;err="";render()},function(e){err=e.code||"error";render()});
  DB.doc("meta/moodcal_"+PW).onSnapshot(function(s){pt=(s.data()||{}).d||{};ld.p=true;render()},function(){});
  /* বদল ধরা: প্রথম স্ন্যাপশট শুধু মনে রাখে, রেকর্ড করে না */
  DB.doc("live/"+WHO).onSnapshot(function(s){var v=(s.data()||{}).mood;if(typeof v==="number"){if(!fm&&v!==lm)rec("m",v);lm=v}fm=false});
  DB.doc("meta/light_"+WHO).onSnapshot(function(s){var v=(s.data()||{}).c;if(v){if(!fl&&v!==ll)rec("l",v);ll=v}fl=false})});
})();
