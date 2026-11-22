/* ===== সাধারণ সহায়ক (বাকি ফাইলগুলো এটার ওপর নির্ভর করে, তাই সবার আগে লোড হয়) ===== */
(function(){
 var LV=window.LV={};
 LV.el=function(tag,cls,t){var d=document.createElement(tag);if(cls)d.className=cls;if(t!=null)d.textContent=t;return d};
 LV.ago=function(ms){var m=Math.floor(ms/60000);if(m<1)return "এইমাত্র";if(m<60)return bn(m)+" মিনিট আগে";var h=Math.floor(m/60);if(h<24)return bn(h)+" ঘণ্টা আগে";return bn(Math.floor(h/24))+" দিন আগে"};
 LV.pn=function(){return (typeof PW!=="undefined"&&PW&&PN[PW])?PN[PW]:"ও"};
 LV.day=function(d){d=d||new Date();return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())};
 /* start() চেইনে একবার চালানো, অন্য ফাইলের মতোই */
 LV.onStart=function(fn){var _s=start,ran=false;start=function(){var was=ran;ran=true;_s();if(!was)fn()}};
 /* খেলা/স্মৃতি ট্যাবের চিপ+প্যানেল: আইডি সংঘর্ষ বা অন্য প্যানেল খোলা থাকার ঝামেলা ছাড়া */
 LV.panelChip=function(chipsEl,sec,label,panel,onShow){
  var chip=LV.el("button","chip",label);chipsEl.appendChild(chip);sec.appendChild(panel);
  chip.onclick=function(){
   [].forEach.call(sec.children,function(c){if(c.classList.contains("panel"))c.classList.remove("on")});
   [].forEach.call(chipsEl.children,function(x){x.classList.toggle("on",x===chip)});
   panel.classList.add("on");if(onShow)onShow()};
  chipsEl.addEventListener("click",function(e){var c=e.target.closest&&e.target.closest(".chip");if(c&&c!==chip)panel.classList.remove("on")});
  return chip};
 /* ছবি সংকুচিত করা: সর্বোচ্চ max পিক্সেল, limit বাইটের মধ্যে JPEG ডেটা URL */
 LV.compress=function(file,max,q,limit){
  return new Promise(function(res,rej){
   var u=URL.createObjectURL(file),im=new Image();
   im.onload=function(){
    var s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");
    c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);
    c.getContext("2d").drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);
    var out,qq=q;do{out=c.toDataURL("image/jpeg",qq);qq-=.1}while(out.length*.75>limit&&qq>.3);
    if(out.length*.75>limit)rej(new Error("big"));else res(out)};
   im.onerror=function(){URL.revokeObjectURL(u);rej(new Error("img"))};im.src=u})};
 LV.download=function(name,text,mime){
  var l=document.createElement("a");l.href=URL.createObjectURL(new Blob([text],{type:mime||"text/plain"}));l.download=name;
  document.body.appendChild(l);l.click();l.remove();setTimeout(function(){URL.revokeObjectURL(l.href)},4000)};
 LV.csv=function(rows){return "﻿"+rows.map(function(r){return r.map(function(c){c=c==null?"":String(c);return /[",\n\r]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(",")}).join("\r\n")};
 /* রাত/দিন ও সাধারণ স্টাইল */
 var st=document.createElement("style");
 st.textContent="select.lvs,input[type=number].lvs,input[type=time].lvs{width:100%;border:1.5px solid var(--line);background:var(--glass);color:var(--ink);border-radius:14px;padding:11px 14px;font:inherit;margin:8px 0}"+
  ".lvr{border-top:1px solid var(--line);padding:8px 0}.lvw{color:#e0243f;font-weight:600}"+
  ".lvo{position:fixed;inset:0;z-index:26;background:var(--bg);display:none;flex-direction:column}"+
  ".lvo .lvh{display:flex;align-items:center;gap:12px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;border-bottom:1px solid var(--line);background:var(--glass)}"+
  ".lvo .lvh button{width:auto;padding:6px 14px}"+
  ".lvo .lvb{flex:1;overflow-y:auto;padding:14px 12px 40px;max-width:480px;width:100%;margin:0 auto}";
 document.head.appendChild(st);
})();
