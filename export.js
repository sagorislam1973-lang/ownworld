/* ===== ডেটা এক্সপোর্ট ও ব্যাকআপ (JSON/CSV) =====
   ডায়েরি, নোট, গুরুত্বপূর্ণ তারিখ ও চ্যাটের লেখা। ছবি/ভয়েস এক্সপোর্টে নেই (সেগুলো বড়)।
   প্রতিবার এক্সপোর্টে Read খরচ হয় (বোতামের পাশে লেখা)। */
(function(){
 function tm(t){return new Date(t).toLocaleString("bn-BD")}
 function who(f){return PN[f]||f}
 function diary(){
  return DB.doc("meta/diary_idx").get().then(function(s){
   var ms=((s.data()||{}).months||[]).slice().sort();
   return Promise.all(ms.map(function(k){return DB.doc("meta/diary_"+k).get().then(function(d){return d.exists?(d.data().e||{}):{}})}))
  }).then(function(all){
   var out=[];all.forEach(function(e){Object.keys(e).forEach(function(id){var x=e[id];out.push({id:id,by:x.by,t:x.t,u:x.u||null,text:x.x})})});
   out.sort(function(a,b){return a.t-b.t});return out})}
 function notes(){
  return DB.collection("notes").orderBy("t","desc").limit(2000).get().then(function(qs){
   var a=[];qs.forEach(function(d){var x=d.data();a.push({id:d.id,from:x.from,t:x.t,text:x.text})});a.sort(function(p,q){return p.t-q.t});return a})}
 function chat(){
  return DB.collection("chat").orderBy("t","desc").limit(1000).get().then(function(qs){
   var a=[];qs.forEach(function(d){var x=d.data();a.push({id:d.id,from:x.from,t:x.t,text:x.vm?"[ভয়েস মেসেজ]":x.text})});a.sort(function(p,q){return p.t-q.t});return a})}
 function dates(){
  return Promise.all([DB.doc("meta/special").get(),DB.doc("meta/dates").get()]).then(function(r){
   var sp=r[0].data()||{},dt=r[1].data()||{},rows=[];
   rows.push({type:"বর্ষপূর্তি",label:"আমাদের শুরু",date:sp.annv||"2022-06-24"});
   if(sp.bd&&sp.bd.sagor)rows.push({type:"জন্মদিন",label:"সাগর",date:sp.bd.sagor});
   if(sp.bd&&sp.bd.shima)rows.push({type:"জন্মদিন",label:"শিমা",date:sp.bd.shima});
   (sp.custom||[]).forEach(function(c){rows.push({type:"স্পেশাল তারিখ",label:c.t,date:c.d,yearly:!!c.y})});
   if(dt.first)rows.push({type:"প্রথম দেখা",label:"",date:dt.first});
   if(dt.last)rows.push({type:"শেষ দেখা",label:"",date:dt.last});
   if(typeof NEXT!=="undefined"&&NEXT)rows.push({type:"পরের দেখা",label:"",date:NEXT});
   try{(JSON.parse(localStorage.getItem("tl"))||[]).forEach(function(x){rows.push({type:"টাইমলাইন",label:x.t,date:x.d})})}catch(e){}
   return rows})}
 var KINDS=[
  ["📖 ডায়েরি","diary",diary,function(a){return [["তারিখ","লেখক","লেখা","সম্পাদিত"]].concat(a.map(function(x){return [tm(x.t),who(x.by),x.text,x.u?tm(x.u):""]}))},"মাসপ্রতি ১ Read"],
  ["📝 নোট","notes",notes,function(a){return [["তারিখ","লেখক","নোট"]].concat(a.map(function(x){return [tm(x.t),who(x.from),x.text]}))},"প্রতি নোটে ১ Read"],
  ["📅 গুরুত্বপূর্ণ তারিখ","dates",dates,function(a){return [["ধরন","নাম","তারিখ"]].concat(a.map(function(x){return [x.type,x.label,x.date]}))},"কয়েকটা Read"],
  ["💬 চ্যাটের লেখা","chat",chat,function(a){return [["তারিখ","কে","মেসেজ"]].concat(a.map(function(x){return [tm(x.t),who(x.from),x.text]}))},"শেষ ১০০০ মেসেজ, প্রতিটায় ১ Read"]];
 LV.section("💾 ডেটা এক্সপোর্ট ও ব্যাকআপ",function(c){
  c.appendChild(LV.el("p","hint","নিজের ফোনে ফাইল হিসেবে নামাও। JSON ব্যাকআপের জন্য ভালো, CSV Excel বা Google Sheets-এ খোলা যায়। ছবি ও ভয়েস এখানে নেই।"));
  var note=LV.el("p","note");
  KINDS.forEach(function(k){
   var row=LV.el("div","lvr");row.appendChild(LV.el("div","",k[0]));row.appendChild(LV.el("div","hint",k[4]));
   var ch=LV.el("div","chips");ch.style.cssText="justify-content:flex-start;margin:4px 0 0";
   ["json","csv"].forEach(function(f){
    var b=LV.el("button","chip","⬇️ "+f.toUpperCase());
    b.onclick=function(){
     if(!DB||!WHO){note.textContent="আগে লগইন করো।";return}
     if(k[1]==="chat"&&!confirm("শেষ ১০০০টা মেসেজ পড়া হবে (প্রতিটা ১ Read)। চালিয়ে যাবে?"))return;
     b.disabled=true;note.textContent="তৈরি হচ্ছে…";
     k[2]().then(function(a){
      var name="backup-"+k[1]+"-"+LV.day()+"."+f;
      if(f==="json")LV.download(name,JSON.stringify({exportedAt:new Date().toISOString(),kind:k[1],count:a.length,items:a},null,1),"application/json");
      else LV.download(name,LV.csv(k[3](a)),"text/csv;charset=utf-8");
      note.textContent="✓ "+bn(a.length)+"টা আইটেম নামানো হয়েছে।";b.disabled=false
     }).catch(function(e){b.disabled=false;note.textContent="সমস্যা: "+(e.code||e.message)})};
    ch.appendChild(b)});
   row.appendChild(ch);c.appendChild(row)});
  c.appendChild(note)})
})();
