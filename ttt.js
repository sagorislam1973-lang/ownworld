/* ===== দুজনের X-O (লাইভ) =====
   বিদ্যমান এক-ফোনের X-O অক্ষত। এটা আলাদা, দুজন দুই ফোনে খেলে, রিয়েল-টাইমে।
   ডেটা: meta/ttt = { b:[৯টা ঘর], turn, xs (কে X), w:null|"X"|"O"|"D", line:[..]|null, n }
         meta/tttstat = { sagor, shima, draw, hist:[{w,t}] (শেষ ১৫) }
   চাল দেওয়া হয় ট্রানজ্যাকশনে, তাই দুজন একসাথে চাপলেও বোর্ড গোলমাল হয় না। */
(function(){
 var LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 function win(b){for(var i=0;i<LINES.length;i++){var l=LINES[i];if(b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[0]]===b[l[2]])return{w:b[l[0]],line:l}}
  if(b.every(function(x){return x}))return{w:"D",line:null};return null}
 window.__tttWin=win;
 var g=null,stat=null,ld={g:false,s:false},err="",ran=false,busy=false;
 var pn=LV.el("div","panel card");pn.id="gttt";
 pn.innerHTML='<div class="serif" style="text-align:center;font-size:1.2rem">⭕ দুজনের X-O (লাইভ)</div><div class="score" id="ttsc"></div><div class="note" id="tttn" style="min-height:1.6em"></div>'+
  '<div class="grid" id="ttg" style="grid-template-columns:repeat(3,1fr);margin:8px 0"></div><button class="ghost" id="ttr">🔄 নতুন খেলা</button><div id="tth"></div>';
 LV.panelChip($("gm"),$("games"),"⭕ দুজনের X-O",pn,function(){render()});
 function sym(who){return g&&g.xs===who?"X":"O"}
 function fresh(prev){var xs=prev?(prev.xs==="sagor"?"shima":"sagor"):"sagor";return{b:["","","","","","","","",""],turn:xs,xs:xs,w:null,line:null,n:(prev&&prev.n||0)+1}}
 function move(i){
  if(!DB||!WHO||busy)return;busy=true;
  var ref=DB.doc("meta/ttt"),sref=DB.doc("meta/tttstat");
  DB.runTransaction(function(tx){
   return Promise.all([tx.get(ref),tx.get(sref)]).then(function(r){
    var d=r[0].exists?r[0].data():fresh(null),s=r[1].exists?r[1].data():{sagor:0,shima:0,draw:0,hist:[]};
    if(d.w||d.turn!==WHO||d.b[i])return;
    d.b[i]=d.xs===WHO?"X":"O";
    var res=win(d.b);
    if(res){d.w=res.w;d.line=res.line;
     var who=res.w==="D"?"draw":(d.xs===WHO&&res.w==="X"||d.xs!==WHO&&res.w==="O"?WHO:PW);
     s[who]=(s[who]||0)+1;s.hist=(s.hist||[]).concat([{w:who,t:Date.now()}]).slice(-15);tx.set(sref,s)}
    else d.turn=PW;
    tx.set(ref,d)})
  }).then(function(){busy=false}).catch(function(e){busy=false;err=e.code||e.message;render()})}
 $("ttr").onclick=function(){
  if(!DB||!WHO)return;
  if(g&&!g.w&&g.b.some(function(x){return x})&&!confirm("চলমান খেলাটা বাদ দিয়ে নতুন শুরু করবে?"))return;
  DB.doc("meta/ttt").set(fresh(g)).catch(function(e){err=e.code;render()})};
 function render(){
  var sc=$("ttsc");
  sc.textContent=stat?"তুমি "+bn(stat[WHO]||0)+" · "+LV.pn()+" "+bn(stat[PW]||0)+" · ড্র "+bn(stat.draw||0):"";
  var n=$("tttn"),b=$("ttg");b.innerHTML="";$("tth").innerHTML="";
  if(err){n.textContent="সমস্যা: "+err;return}
  if(!(ld.g&&ld.s)){n.textContent="লোড হচ্ছে…";return}
  if(!g){n.textContent="কেউ এখনো শুরু করেনি। “নতুন খেলা” চাপো।";return}
  if(g.w==="D")n.textContent="🤝 ড্র! নতুন খেলা দিতে পারো।";
  else if(g.w)n.textContent=(g.xs===WHO?g.w==="X":g.w==="O")?"🎉 তুমি জিতেছো!":"😄 "+LV.pn()+" জিতেছে!";
  else n.textContent=g.turn===WHO?"👉 তোমার পালা ("+sym(WHO)+")":"⏳ "+LV.pn()+"র পালা ("+sym(PW)+")";
  for(var i=0;i<9;i++)(function(i){
   var c=LV.el("button","cell",g.b[i]);c.setAttribute("aria-label","ঘর "+bn(i+1)+(g.b[i]?": "+g.b[i]:""));
   if(g.line&&g.line.indexOf(i)>=0){c.style.outline="3px solid var(--rose)"}
   c.disabled=!!g.b[i]||!!g.w||g.turn!==WHO;c.onclick=function(){move(i)};b.appendChild(c)})(i);
  var h=(stat&&stat.hist)||[];
  if(h.length){var t=LV.el("div","hint","শেষ খেলাগুলো (নতুন আগে): ");
   t.appendChild(document.createTextNode(h.slice().reverse().map(function(x){return x.w==="draw"?"ড্র":(x.w===WHO?"আমি":LV.pn())}).join(" · ")));$("tth").appendChild(t)}}
 LV.onStart(function(){
  function fail(e){err=e.code||"error";render()}
  DB.doc("meta/ttt").onSnapshot(function(s){var was=g;g=s.exists?s.data():null;ld.g=true;err="";
   if(g&&was&&g.turn===WHO&&!g.w&&was.turn!==WHO&&!pn.classList.contains("on"))toast("⭕ "+LV.pn()+" চাল দিয়েছে, তোমার পালা",function(){goTab("games");var c=document.querySelectorAll("#gm .chip");for(var i=0;i<c.length;i++)if(/X-O \(লাইভ\)/.test(c[i].textContent))c[i].click()});
   render()},fail);
  DB.doc("meta/tttstat").onSnapshot(function(s){stat=s.exists?s.data():{sagor:0,shima:0,draw:0,hist:[]};ld.s=true;render()},fail)});
})();
