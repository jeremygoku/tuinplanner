// ====== BASISVARIABELEN EN SETUP ======
const KEY='tuinMatrixPlannerData',mnden=["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"];
const tO=[{id:"bloei",l:"🌸 Bloei",n:"Bloei"},{id:"snoei",l:"✂️ Snoei",n:"Snoei"},{id:"bemest",l:"🧪 Bemest",n:"Bemest"},{id:"water",l:"💧 Water",n:"Water"},{id:"mulch",l:"🪵 Mulch",n:"Mulch"},{id:"winter",l:"🛡️ Winter",n:"Winterklaar"},{id:"wied",l:"🌿 Wied",n:"Wieden"}];
const catDet={Boom:{i:"🌳"},Struik:{i:"🌿"},Bloem:{i:"🌹"},Kruid:{i:"🌱"}};
const wC={};

let fVorst=!1, fDroog=!1, plts=[]; 
const undo=[]; const MAX_U=25; 
let eId=null, slep=!1, selIds=new Set(), dStart=null, dStartP=new Map(), aTItem=null, tLog=[], tImg=null;

const D={c:document.getElementById('tuin-container'),tt:document.getElementById('tooltip'),m:document.getElementById('plant-modal'),aL:document.getElementById('agenda-lijst'),fM:document.getElementById('filter-maand'),aS:document.getElementById('agenda-search'),mC:document.getElementById('matrix-container'),tA:document.getElementById('tuin-afbeelding'),pV:document.getElementById('p-vorm'),hC:document.getElementById('hoogte-container'),lB:document.getElementById('label-breedte'),kS:document.getElementById('kompas-slider'),kW:document.getElementById('kompas-waarde'),wL:document.getElementById('weer-lijst'),wW:document.getElementById('weer-waarschuwingen'),hL:document.getElementById('p-history-list'),nLI:document.getElementById('p-new-log'),hS:document.getElementById('p-history-section'),tAv:document.getElementById('touch-drag-avatar'),iPC:document.getElementById('p-log-img-preview-container'),iPS:document.getElementById('p-log-img-preview-src'),lD:document.getElementById('p-log-dropzone'),pE:document.getElementById('p-evergreen'),pF:document.getElementById('p-frost'),zL:document.getElementById('zijbalk-links'),zA:document.getElementById('zijbalk-agenda'),bUI:document.getElementById('btn-toggle-ui')};

let cST; 
const sav = async () => {
    await saveToDB(KEY, plts);
    clearTimeout(cST);
    cST = setTimeout(() => {
        if(typeof gapi!=='undefined' && gapi.client && gapi.client.getToken()){
            document.getElementById('btn-gdrive').innerText="💾";
            syncToCloud().then(()=>{
                document.getElementById('btn-gdrive').innerText="✅";
                setTimeout(()=>document.getElementById('btn-gdrive').innerText="☁️",2000);
            });
        }
    }, 1500);
};

const sU=()=>{undo.push(JSON.parse(JSON.stringify(plts)));if(undo.length>MAX_U)undo.shift();};
const vU=()=>{if(!undo.length)return;plts=undo.pop();sav();ren();ds()};

// ====== INTERACTIES (DRAG & DROP) ======
const gC=e=>{let t=e.touches?.[0];return{x:t?t.clientX:e.clientX,y:t?t.clientY:e.clientY}};
const sl=(id,i,a=!1)=>{if(!a)ds();selIds.add(`${id}-${i}`);document.querySelector(`.plant-marker[data-id="${id}"][data-index="${i}"]`)?.classList.add('selected')};
const ds=()=>{selIds.clear();document.querySelectorAll('.plant-marker.selected').forEach(m=>m.classList.remove('selected'))};
function sD(e){let m=e.target.closest('.plant-marker');if(m){let id=+m.dataset.id,i=+m.dataset.index,k=`${id}-${i}`;if(e.shiftKey)sl(id,i,!0);else if(!selIds.has(k))sl(id,i,!1);dStart=gC(e);dStartP.clear();selIds.forEach(sk=>{let[pId,pI]=sk.split('-').map(Number),p=plts.find(x=>x.id===pId);if(p?.posities[pI])dStartP.set(sk,{x:p.posities[pI].x,y:p.posities[pI].y})});slep=!0;D.tt.style.display='none';e.stopPropagation()}else if(!e.shiftKey)ds()}
function vB(e){if(!slep)return;let cP=gC(e),r=D.c.getBoundingClientRect(),dX=((cP.x-dStart.x)/r.width)*100,dY=((cP.y-dStart.y)/r.height)*100;selIds.forEach(k=>{let[id,idx]=k.split('-').map(Number),p=plts.find(x=>x.id===id),sP=dStartP.get(k);if(p&&sP){p.posities[idx].x=`${Math.max(0,Math.min(100,parseFloat(sP.x)+dX)).toFixed(2)}%`;p.posities[idx].y=`${Math.max(0,Math.min(100,parseFloat(sP.y)+dY)).toFixed(2)}%`;let m=document.querySelector(`.plant-marker[data-id="${id}"][data-index="${idx}"]`);if(m){m.style.left=p.posities[idx].x;m.style.top=p.posities[idx].y}}})}
const vL=()=>{if(slep){sU();sav();slep=!1}};

document.addEventListener('mousemove',vB);document.addEventListener('touchmove',vB,{passive:!1});
document.addEventListener('mouseup',vL);document.addEventListener('touchend',vL);
document.addEventListener('keydown',e=>{let inI=['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName);if(e.key==='Escape'){D.m.style.display='none';document.getElementById('bloei-modal').style.display='none'}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&!inI){e.preventDefault();vU()}if(!inI&&selIds.size>0){let mX=0,mY=0,md=!1;if(e.key==='ArrowUp'){mY=-.5;md=!0}else if(e.key==='ArrowDown'){mY=.5;md=!0}else if(e.key==='ArrowLeft'){mX=-.5;md=!0}else if(e.key==='ArrowRight'){mX=.5;md=!0}if(md){e.preventDefault();sU();selIds.forEach(k=>{let[id,idx]=k.split('-').map(Number),p=plts.find(x=>x.id===id);if(p?.posities?.[idx]){p.posities[idx].x=`${Math.max(0,Math.min(100,parseFloat(p.posities[idx].x)+mX))}%`;p.posities[idx].y=`${Math.max(0,Math.min(100,parseFloat(p.posities[idx].y)+mY))}%`}});sav();ren()}if(e.key==='Enter'||e.key.toLowerCase()==='e'){e.preventDefault();oB(plts.find(p=>p.id===+Array.from(selIds)[0].split('-')[0]))}if(['Delete','Backspace'].includes(e.key)){e.preventDefault();if(confirm(`Verwijder ${selIds.size} marker(s)?`)){sU();let mDel=[...selIds].map(k=>{let[id,idx]=k.split('-').map(Number);return{id,idx}}).sort((a,b)=>b.idx-a.idx);mDel.forEach(({id,idx})=>{let p=plts.find(x=>x.id===id);if(p){p.posities.splice(idx,1);p.count=p.posities.length}});plts=plts.filter(p=>p.posities.length>0);selIds.clear();sav();ren();D.tt.style.display='none'}}}});
