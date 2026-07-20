// ====== GEBRUIKERSINTERFACE & WEERGAVE ======
D.bUI.onclick=()=>{let h=D.zL.style.display==='none';D.zL.style.display=h?'flex':'none';D.zA.style.display=h?'flex':'none';D.bUI.innerText=h?'↔️ Focus':'➡️ Terug';D.bUI.style.background=h?'var(--gd)':'var(--ah)'};

let kR = parseInt(localStorage.getItem('tuinKompasRotatie')) || 0;
D.kS.value = kR; document.getElementById('kompas-roos').style.transform = `rotate(${kR}deg)`; document.querySelectorAll('.windstreek').forEach(w => w.style.transform = `translate(-50%, -50%) rotate(${-kR}deg)`); D.kW.innerText = `${kR}°`;
D.kS.oninput = e => { kR = e.target.value; document.getElementById('kompas-roos').style.transform = `rotate(${kR}deg)`; document.querySelectorAll('.windstreek').forEach(w => w.style.transform = `translate(-50%, -50%) rotate(${-kR}deg)`); D.kW.innerText = `${kR}°`; localStorage.setItem('tuinKompasRotatie', kR); };

D.fM.value=mnden[new Date().getMonth()];
D.mC.innerHTML=mnden.map(m=>`<div class="matrix-row"><div class="matrix-month">${m}</div><div class="matrix-options">${tO.map(t=>`<label title="${t.n}"><input type="checkbox" class="matrix-check" data-month="${m}" value="${t.l}">${t.l.split(' ')[0]}</label>`).join('')}</div></div>`).join('');
D.fM.onchange=ren;D.aS.oninput=fil;document.querySelectorAll('#laag-filters input').forEach(c=>c.onchange=ren);

document.getElementById('btn-bloeikalender').onclick=()=>{let h=`<div style="display:grid;grid-template-columns:140px repeat(12,1fr);gap:4px;font-size:11px;text-align:center;font-weight:bold;margin-bottom:8px;border-bottom:2px solid #e2e8f0;padding-bottom:5px"><div style="text-align:left">Plant</div>${mnden.map(m=>`<div>${m.substring(0,3)}</div>`).join('')}</div>`;
[...plts].sort((a,b)=>a.name.localeCompare(b.name)).forEach(p=>{let r=`<div style="display:grid;grid-template-columns:140px repeat(12,1fr);gap:4px;margin-bottom:6px;align-items:center;border-bottom:1px dashed #f0f0f0;padding-bottom:4px"><div style="text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px" title="${p.name}">${p.customIcon!=='standaard'?p.customIcon:catDet[p.type]?.i||'🌱'} ${p.name}</div>`;
mnden.forEach(m=>r+=`<div style="height:18px;border-radius:3px;background:${p.schema?.[m]?.includes("🌸 Bloei")?p.color:'#f7fafc'}"></div>`);h+=r+'</div>';});
document.getElementById('bloei-content').innerHTML=plts.length?h:"<p><i>Voeg planten toe.</i></p>";document.getElementById('bloei-modal').style.display='block'};
document.getElementById('btn-sluit-bloei').onclick=()=>document.getElementById('bloei-modal').style.display='none';
D.pV.onchange=function(){let r=this.value==='rechthoek';D.hC.style.display=r?'block':'none';D.lB.innerText=r?"Breedte (px)":"Grootte (px)"};

// ====== FOTO UPLOAD ======
document.getElementById('btn-bg-upload').onclick = () => document.getElementById('bg-file-input').click();
if(document.getElementById('btn-bg-camera')) document.getElementById('btn-bg-camera').onclick = () => document.getElementById('bg-camera-input').click();
const handleBgUpload = e => { let f = e.target.files[0]; if (f) { let r = new FileReader(); r.onload = ev => { let img = new Image(); img.onload = async () => { let canvas = document.createElement('canvas'); let ctx = canvas.getContext('2d'); let maxW = 1200, maxH = 1200; let width = img.width, height = img.height; if (width > height) { if (width > maxW) { height *= maxW / width; width = maxW; } } else { if (height > maxH) { width *= maxH / height; height = maxH; } } canvas.width = width; canvas.height = height; ctx.drawImage(img, 0, 0, width, height); let compressedData = canvas.toDataURL('image/jpeg', 0.7); D.tA.src = compressedData; try { await saveToDB('tuinAchtergrondData', compressedData); sav(); } catch (err) { alert("⚠️ Opslaan mislukt."); } }; img.src = ev.target.result; }; r.readAsDataURL(f); } e.target.value = ''; };
document.getElementById('bg-file-input').onchange = handleBgUpload;
if(document.getElementById('bg-camera-input')) document.getElementById('bg-camera-input').onchange = handleBgUpload;

// ====== UI INTERACTIES ======
D.c.addEventListener('mousedown',sD);D.c.addEventListener('touchstart',sD,{passive:!0});
D.c.addEventListener('mouseenter',e=>{let m=e.target.closest('.plant-marker');if(m&&!slep){let p=plts.find(p=>p.id===+m.dataset.id);if(p)tT(p,(p.customIcon&&p.customIcon!=='standaard')?p.customIcon:(catDet[p.type]?.i||"🌱"),gW(p.name))}},{capture:!0});
D.c.addEventListener('mousemove',e=>{if(e.target.closest('.plant-marker')&&!slep){let x=e.clientX+15,y=e.clientY+15;if(x+D.tt.offsetWidth+20>window.innerWidth)x=e.clientX-D.tt.offsetWidth-15;if(y+D.tt.offsetHeight+20>window.innerHeight)y=e.clientY-D.tt.offsetHeight-15;Object.assign(D.tt.style,{left:`${x}px`,top:`${y}px`})}},{capture:!0});
D.c.addEventListener('mouseleave',e=>{let m=e.target.closest('.plant-marker');if(m){D.tt.style.display='none';document.getElementById(`agenda-${m.dataset.id}`)?.classList.remove('active-hover')}},{capture:!0});
D.c.addEventListener('dblclick',e=>{let m=e.target.closest('.plant-marker');if(m){e.stopPropagation();oB(plts.find(p=>p.id===+m.dataset.id))}});

D.aL.onchange=e=>{if(e.target.classList.contains('todo-check')){let p=plts.find(p=>p.id===+e.target.dataset.plantId);if(p){sU();let{month:m,task:t}=e.target.dataset;p.completedTasks??={};p.completedTasks[m]??=[];if(e.target.checked){if(!p.completedTasks[m].includes(t))p.completedTasks[m].push(t);e.target.closest('.todo-item').classList.add('completed');p.history??=[];p.history.unshift({date:new Date().toLocaleDateString('nl-NL'),text:`Taak voltooid: ${t}`})}else{p.completedTasks[m]=p.completedTasks[m].filter(x=>x!==t);e.target.closest('.todo-item').classList.remove('completed')}sav();ren()}}};
D.aL.onclick=e=>{let i=e.target.closest('.agenda-item');if(i&&!e.target.closest('.todo-item')&&!e.target.closest('a'))oB(plts.find(p=>p.id===+i.id.split('-')[1]))};
D.aL.addEventListener('mouseenter',e=>{let i=e.target.closest('.agenda-item');if(i)document.querySelectorAll(`.plant-marker[data-id="${i.id.split('-')[1]}"]`).forEach(m=>m.classList.add('highlight'))},{capture:!0});
D.aL.addEventListener('mouseleave',e=>{let i=e.target.closest('.agenda-item');if(i)document.querySelectorAll(`.plant-marker[data-id="${i.id.split('-')[1]}"]`).forEach(m=>m.classList.remove('highlight'))},{capture:!0});
document.getElementById('btn-undo').onclick=vU;

document.querySelectorAll('.catalogus-item').forEach(i=>{i.ondragstart=e=>{e.dataTransfer.setData('text/plain',JSON.stringify({t:i.dataset.type,i:i.dataset.icon,c:i.dataset.color,n:i.dataset.name}));e.dataTransfer.effectAllowed='copy'};
i.addEventListener('touchstart',e=>{aTItem={t:i.dataset.type,i:i.dataset.icon,c:i.dataset.color,n:i.dataset.name};D.tAv.innerText=i.dataset.icon;D.tAv.style.display='block';D.tAv.style.left=`${e.touches[0].clientX}px`;D.tAv.style.top=`${e.touches[0].clientY}px`},{passive:!0})});
document.addEventListener('touchmove',e=>{if(aTItem){let t=e.touches[0],r=D.c.getBoundingClientRect();D.tAv.style.left=`${t.clientX}px`;D.tAv.style.top=`${t.clientY}px`;D.c.classList.toggle('tuin-dragover',t.clientX>=r.left&&t.clientX<=r.right&&t.clientY>=r.top&&t.clientY<=r.bottom)}},{passive:!0});
document.addEventListener('touchend',e=>{if(aTItem){D.c.classList.remove('tuin-dragover');D.tAv.style.display='none';let t=e.changedTouches[0],r=D.c.getBoundingClientRect();if(t.clientX>=r.left&&t.clientX<=r.right&&t.clientY>=r.top&&t.clientY<=r.bottom)vE(aTItem,Math.max(0,Math.min(100,((t.clientX-r.left)/r.width*100))),Math.max(0,Math.min(100,((t.clientY-r.top)/r.height*100))));aTItem=null}});
D.c.ondragover=e=>{e.preventDefault();D.c.classList.add('tuin-dragover')};D.c.ondragleave=()=>D.c.classList.remove('tuin-dragover');
D.c.ondrop=e=>{e.preventDefault();D.c.classList.remove('tuin-dragover');try{let d=JSON.parse(e.dataTransfer.getData('text/plain')),r=D.c.getBoundingClientRect();vE(d,Math.max(0,Math.min(100,((e.clientX-r.left)/r.width*100))),Math.max(0,Math.min(100,((e.clientY-r.top)/r.height*100))))}catch{}};

const vE=(d,x,y)=>{sU();let n={id:Date.now(),name:d.n,type:d.t,customIcon:d.i,vorm:'cirkel',color:d.c,size:40,height:40,count:1,info:'',groenblijvend:!0,vorstGevoelig:!1,schema:Object.fromEntries(mnden.map(m=>[m,[]])),posities:[{x:`${x.toFixed(2)}%`,y:`${y.toFixed(2)}%`}],completedTasks:{},history:[]};plts.push(n);sav();ren();sl(n.id,0);oB(n);setTimeout(()=>document.getElementById('p-name').select(),100)};
const gW=n=>{if(!n)return"Ov";let c=n.trim().toLowerCase();return c.includes("hortensia")?"Ho":c.includes("bieslook")?"Bi":n.length>1?n[0].toUpperCase()+n[1].toLowerCase():n[0].toUpperCase()};

function ren(){let gM=D.fM.value,hM=mnden[new Date().getMonth()];document.getElementById('agenda-titel').innerText=gM==='alle'?"📋 Alle Elementen":`📅 Agenda ${gM}`;document.querySelectorAll('.plant-marker').forEach(m=>m.remove());D.aL.innerHTML='';let aL=Array.from(document.querySelectorAll('#laag-filters input:checked')).map(c=>c.value),iW=['December','Januari','Februari'].includes(gM),f=document.createDocumentFragment();
[...plts].sort((a,b)=>a.name.localeCompare(b.name)).forEach(p=>{if(!aL.includes(p.type))return;let tD=p.schema?.[gM]||[],aW=(gM==='alle'||gM===hM)&&((fVorst&&p.vorstGevoelig)||fDroog),mF=gM==='alle'||tD.length>0||aW,tW=iW&&!p.groenblijvend,cI=(p.customIcon&&p.customIcon!=='standaard')?p.customIcon:catDet[p.type]?.i||"🌱",wL=gW(p.name);
p.posities??=[{x:'50%',y:'50%'}];p.posities.forEach((ps,i)=>{let m=document.createElement('div');m.className=`plant-marker${p.vorm==='rechthoek'?' vorm-rechthoek':''}`;m.dataset.id=p.id;m.dataset.index=i;
if(p.vorm==='rechthoek')Object.assign(m.style,{width:`${p.size}px`,height:`${p.height||p.size}px`,background:`${p.color}40`,borderColor:p.color});else Object.assign(m.style,{width:`${p.size}px`,height:`${p.size}px`,borderRadius:'50%'});
m.style.left=ps.x;m.style.top=ps.y;if(tW)Object.assign(m.style,{filter:'sepia(70%) saturate(50%) hue-rotate(340deg) brightness(85%)'});
let iS=(p.vorm==='rechthoek'?1.2:p.size/40)*(p.type==='Boom'?.75:1),aB='';if(gM!=='alle'&&tD.length){let o=tD.filter(t=>!p.completedTasks?.[gM]?.includes(t));if(o.length)aB=`<div class="marker-action-badges">${o.map(t=>`<span class="action-mini-badge">${t.split(' ')[0]}</span>`).join('')}</div>`}
m.innerHTML=`<span class="marker-icon" style="font-size:${16*iS}px">${cI}</span><span class="marker-text" style="font-size:${p.vorm==='rechthoek'?11:10}px">${wL}</span>${aB}`;if(selIds.has(`${p.id}-${i}`))m.classList.add('selected');f.appendChild(m)});
if(mF){let tH='';if(aW){if(fVorst&&p.vorstGevoelig)tH+=`<div class="todo-item" style="color:var(--d);font-weight:bold;margin-top:8px">⚠️ Vorst: Beschermen!</div>`;if(fDroog)tH+=`<div class="todo-item" style="color:var(--w);font-weight:bold;margin-top:8px">💧 Droogte: Extra water!</div>`}
if(gM==='alle')mnden.forEach(m=>{if(p.schema?.[m]?.length)tH+=`<div style="margin-top:4px"><span class="task-tag month-tag">${m.substring(0,3)}</span> ${p.schema[m].map(t=>`<span class="task-tag">${t}</span>`).join('')}</div>`});else if(tD.length)tH+=`<div class="task-tag-container">${tD.map(t=>{let v=p.completedTasks?.[gM]?.includes(t),pn=tO.find(o=>o.l===t)?.n||'';return `<label class="todo-item ${v?'completed':''}"><input type="checkbox" class="todo-check" data-plant-id="${p.id}" data-month="${gM}" data-task="${t}" ${v?'checked':''}><span>${t} (${pn})</span></label>`}).join('')}</div>`;
let aI=document.createElement('div');aI.className='agenda-item';aI.id=`agenda-${p.id}`;aI.style.borderLeftColor=p.color;aI.dataset.sN=p.name.toLowerCase();aI.dataset.sT=p.type.toLowerCase();aI.dataset.sI=p.info.toLowerCase();aI.innerHTML=`<div class="agenda-title"><span>${cI} ${p.name}${p.count>1?` <span style="color:#e64980;font-size:14px">(${p.count}x)</span>`:''}</span><span style="font-size:12px;color:#718096">[${wL}]</span></div><div style="font-size:13px;color:#4a5568;margin-bottom:5px">${p.info}</div><div id="wiki-link-${p.id}"></div>${tH}`;D.aL.appendChild(aI)}});
D.c.appendChild(f);if(!D.aL.innerHTML)D.aL.innerHTML='<p style="color:#777;font-style:italic;text-align:center;margin-top:30px">Geen taken.</p>';fil()}

async function tT(p,cI,wL){let sH=mnden.filter(m=>p.schema?.[m]?.length).map(m=>`<div class="tooltip-month-section"><b>${m}:</b> ${p.schema[m].join(', ')}</div>`).join('')||'<div><i>Geen onderhoud</i></div>',wH=`<p style="margin:8px 0 0;font-size:12px;color:#555;border-top:1px dashed #ccc;padding-top:4px">${p.info}</p>`;
D.tt.innerHTML=`<strong>${cI} ${p.name}${p.count>1?` <small>(${p.count}x)</small>`:''}</strong><small><b>Type:</b> ${p.type}</small><br>${sH}${wH}`;D.tt.style.display='block';document.getElementById(`agenda-${p.id}`)?.classList.add('active-hover');
let d=await fW(p.name);if(d){D.tt.innerHTML=`<strong>${cI} ${p.name}${p.count>1?` <small>(${p.count}x)</small>`:''}</strong><small><b>Type:</b> ${p.type}</small><br>${sH}<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.4">${d.thumbnail?`<img src="${d.thumbnail.source}" style="float:right;width:65px;border-radius:4px">`:''}<b>Wiki:</b><br>${d.extract}</div><p style="margin:8px 0 0;font-size:11px;color:#777"><b>Notities:</b> ${p.info||'Geen'}</p>`;let aL=document.getElementById(`wiki-link-${p.id}`);if(aL&&!aL.innerHTML)aL.innerHTML=`<a href="${d.content_urls.desktop.page}" target="_blank" style="color:var(--p);font-size:12px;font-weight:bold;text-decoration:underline">📖 Wiki →</a>`}}

function fil(){let q=D.aS.value.toLowerCase().trim();document.querySelectorAll('.agenda-item').forEach(i=>{let m=i.dataset.sN.includes(q)||i.dataset.sT.includes(q)||i.dataset.sI.includes(q);i.style.display=m?'block':'none';document.querySelectorAll(`.plant-marker[data-id="${i.id.split('-')[1]}"]`).forEach(mk=>mk.classList.toggle('search-hidden',!m))})}

document.getElementById('btn-add').onclick=()=>{eId=null;wTL();document.getElementById('modal-title').innerText="Nieuw";['p-name','p-info'].forEach(id=>document.getElementById(id).value='');document.getElementById('p-type').value='Struik';document.getElementById('p-custom-icon').value='standaard';D.pV.value='cirkel';document.getElementById('p-color').value='#40c057';['p-size','p-height'].forEach(id=>document.getElementById(id).value='40');document.getElementById('p-count').value='1';D.pE.checked=!0;D.pF.checked=!1;D.hS.style.display='none';document.querySelectorAll('.matrix-check').forEach(c=>c.checked=!1);document.getElementById('btn-delete').style.display='none';D.pV.dispatchEvent(new Event('change'));D.m.style.display='block';D.m.scrollTop=0;};
function oB(p){if(!p)return;eId=p.id;wTL();document.getElementById('modal-title').innerText="Wijzigen";document.getElementById('p-name').value=p.name;document.getElementById('p-type').value=p.type;document.getElementById('p-custom-icon').value=p.customIcon||'standaard';D.pV.value=p.vorm||'cirkel';document.getElementById('p-color').value=p.color;document.getElementById('p-size').value=p.size;document.getElementById('p-height').value=p.height||p.size;document.getElementById('p-count').value=p.count||1;document.getElementById('p-info').value=p.info;D.pE.checked=p.groenblijvend??!0;D.pF.checked=p.vorstGevoelig||!1;D.hS.style.display='block';tLog=p.history?[...p.history]:[];rL();document.querySelectorAll('.matrix-check').forEach(c=>c.checked=p.schema?.[c.dataset.month]?.includes(c.value)||!1);document.getElementById('btn-delete').style.display='block';D.pV.dispatchEvent(new Event('change'));D.m.style.display='block';D.m.scrollTop=0;}
const rL=()=>{D.hL.innerHTML=tLog.length?tLog.map(i=>`<div class="history-item"><span class="history-date">[${i.date}]</span> ${i.text||''}${i.img?`<img src="${i.img}" class="history-img">`:''}</div>`).join(''):'<i>Geen logboek.</i>'};

const vLF=f=>{let r=new FileReader();r.onload=ev=>{let i=new Image();i.onload=()=>{let c=document.createElement('canvas'),s=Math.min(800/i.width,1);c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);tImg=c.toDataURL('image/jpeg',.7);D.iPS.src=tImg;D.iPC.style.display='inline-block'};i.src=ev.target.result};r.readAsDataURL(f)};

document.getElementById('btn-add-log-img').onclick = e => { e.preventDefault(); document.getElementById('p-new-log-file').click(); };
document.getElementById('p-new-log-file').onchange = e => { if (e.target.files[0]) vLF(e.target.files[0]); };
document.getElementById('btn-add-log-camera').onclick = e => { e.preventDefault(); document.getElementById('p-new-log-camera-file').click(); };
document.getElementById('p-new-log-camera-file').onchange = e => { if (e.target.files[0]) vLF(e.target.files[0]); };
D.nLI.onpaste=e=>{for(let i of(e.clipboardData||e.originalEvent.clipboardData).items)if(i.kind==='file')vLF(i.getAsFile())};
D.lD.ondragover=e=>{e.preventDefault();D.lD.classList.add('dragover')};D.lD.ondragleave=()=>D.lD.classList.remove('dragover');D.lD.ondrop=e=>{e.preventDefault();D.lD.classList.remove('dragover');if(e.dataTransfer.files[0]?.type.startsWith('image/'))vLF(e.dataTransfer.files[0])};
const wTL=()=>{tImg=null;D.iPC.style.display='none';document.getElementById('p-new-log-file').value='';document.getElementById('p-new-log-camera-file').value='';};
document.getElementById('btn-clear-log-img').onclick=e=>{e.preventDefault();wTL()};
document.getElementById('btn-add-log').onclick=e=>{e.preventDefault();let t=D.nLI.value.trim();if(t||tImg){tLog.unshift({date:new Date().toLocaleDateString('nl-NL'),text:t,img:tImg});D.nLI.value='';wTL();rL()};sav();};
document.getElementById('btn-cancel').onclick=()=>D.m.style.display='none';
document.getElementById('btn-save').onclick=()=>{sU();let nA=Math.max(1,+document.getElementById('p-count').value||1),pD={name:document.getElementById('p-name').value||'Naamloos',type:document.getElementById('p-type').value,customIcon:document.getElementById('p-custom-icon').value,vorm:D.pV.value,color:document.getElementById('p-color').value,size:document.getElementById('p-size').value,height:document.getElementById('p-height').value,count:nA,info:document.getElementById('p-info').value||'',groenblijvend:D.pE.checked,vorstGevoelig:D.pF.checked,schema:Object.fromEntries(mnden.map(m=>[m,[]])),history:tLog};document.querySelectorAll('.matrix-check:checked').forEach(c=>pD.schema[c.dataset.month].push(c.value));if(eId!==null){let bP=plts.find(p=>p.id===eId),hP=bP.posities||[{x:'50%',y:'50%'}];if(nA>hP.length){let bX=parseFloat(hP[0].x),bY=parseFloat(hP[0].y),eN=nA-hP.length;for(let i=0;i<eN;i++){let h=(i/eN)*Math.PI*2;hP.push({x:`${Math.max(0,Math.min(100,bX+Math.cos(h)*5)).toFixed(2)}%`,y:`${Math.max(0,Math.min(100,bY+Math.sin(h)*5)).toFixed(2)}%`})}}else if(nA<hP.length)hP=hP.slice(0,nA);Object.assign(bP,pD);bP.posities=hP}else plts.push({...pD,id:Date.now(),posities:[{x:'50%',y:'50%'}],completedTasks:{}});sav();ds();ren();D.m.style.display='none'};
document.getElementById('btn-delete').onclick=()=>{if(confirm("Verwijderen?")){sU();plts=plts.filter(p=>p.id!==eId);[...selIds].forEach(k=>{if(k.startsWith(`${eId}-`))selIds.delete(k)});sav();ren();D.m.style.display=D.tt.style.display='none'}};
document.getElementById('btn-export').onclick=()=>{if(!plts.length)return alert("Geen data!");let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(plts,null,2)],{type:"application/json"}));a.download=`tuinplanner.json`;a.click();URL.revokeObjectURL(a.href)};
document.getElementById('btn-import').onclick=()=>document.getElementById('import-file').click();
document.getElementById('import-file').onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=ev=>{try{let d=JSON.parse(ev.target.result);if(Array.isArray(d)&&confirm("Overschrijven?")){sU();plts=d;sav();ren()}}catch{alert("Fout bij lezen.")}};r.readAsText(f);e.target.value=''};
document.getElementById('btn-clear').onclick = async () => {if(confirm("Wissen?")){sU();plts = [];await saveToDB(KEY, plts);await saveToDB('tuinAchtergrondData', null);D.tA.src = 'tuin.jpeg';selIds.clear();ren();}};

// ====== MOBIELE UI ======
document.getElementById('btn-agenda-mobile').onclick = () => { document.getElementById('zijbalk-agenda').classList.toggle('open-panel'); document.getElementById('zijbalk-links').classList.remove('open-panel'); };
document.getElementById('btn-weer-mobile').onclick = () => { document.getElementById('zijbalk-links').classList.toggle('open-panel'); document.getElementById('zijbalk-agenda').classList.remove('open-panel'); };
document.getElementById('plattegrond-sectie').addEventListener('touchstart', () => { document.getElementById('zijbalk-agenda').classList.remove('open-panel'); document.getElementById('zijbalk-links').classList.remove('open-panel'); }, {passive: true});
document.getElementById('plattegrond-sectie').addEventListener('mousedown', () => { document.getElementById('zijbalk-agenda').classList.remove('open-panel'); document.getElementById('zijbalk-links').classList.remove('open-panel'); });

// ====== APPLICATIE STARTEN ======
async function initApp() {
    try {
        let savedPlts = await loadFromDB(KEY);
        if (savedPlts) {
            plts = savedPlts;
            plts.forEach(p => {
                if (p.x && p.y && !p.posities) { p.posities = [{ x: p.x, y: p.y }]; delete p.x; delete p.y; }
                p.groenblijvend ??= !0; p.vorstGevoelig ??= !0;
            });
        }
        let savedBg = await loadFromDB('tuinAchtergrondData');
        if (savedBg) { D.tA.src = savedBg; } 
        else { let oldBg = localStorage.getItem('tuinAchtergrondData'); if (oldBg) { D.tA.src = oldBg; await saveToDB('tuinAchtergrondData', oldBg); localStorage.removeItem('tuinAchtergrondData'); } }
    } catch (e) { console.error("Database laden mislukt:", e); }
    ren(); lW();
}
initApp();
