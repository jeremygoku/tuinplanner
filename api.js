async function fW(n){let z=n.trim().charAt(0).toUpperCase()+n.trim().slice(1);if(!z)return null;if(wC[z])return wC[z];try{let r=await fetch(`https://nl.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(z.replace(/ /g,'_'))}`);let d=r.ok?await r.json():null;if(!d||['disambiguation','no-title'].includes(d.type)){let s=await fetch(`https://nl.wikipedia.org/w/api.php?action=query&list=prefixsearch&pssearch=${encodeURIComponent(z.replace(/ /g,'_'))}&pslimit=3&format=json&origin=*`);if(s.ok){let res=(await s.json())?.query?.prefixsearch;if(res?.length){let b=res.find(x=>x.title.toLowerCase()!==z.toLowerCase())||res[0];if(b){let f=await fetch(`https://nl.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(b.title.replace(/ /g,'_'))}`);if(f.ok)d=await f.json()}}}}if(d&&d.type==='standard')return wC[z]=d}catch{}return null}
async function lW(){
    try {
        let r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=51.0343&longitude=3.5483&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max&timezone=Europe%2FAmsterdam&models=ecmwf_ifs&past_days=14&forecast_days=14`);
        if(!r.ok)throw"";
        let d=await r.json(), dy=d.daily, h='', dD=0;
        if(!dy?.time)throw"";
        
        let pastRain = dy.precipitation_sum.slice(0, 14).reduce((a,b)=>a+(b||0), 0).toFixed(1);
        let futureRain = dy.precipitation_sum.slice(14, 21).reduce((a,b)=>a+(b||0), 0).toFixed(1);
        
        h += `<div style="background:#eaf6ea; padding:12px; border-radius:6px; margin-bottom:15px; font-size:13px; color:var(--gd); border:1px solid var(--a); text-align:center;">
                <strong style="color:var(--p); display:block; margin-bottom:4px; font-size:14px;">💧 Neerslagbalans Nevele</strong>
                Afgelopen 14 dagen: <b>${pastRain} mm</b><br>
                Komende 7 dagen: <b>${futureRain} mm</b>
              </div>`;
        
        for(let i=14; i<Math.min(dy.time.length, 28); i++){
            let dn=new Date(dy.time[i]).toLocaleDateString('nl-NL',{weekday:'short',day:'numeric',month:'short'}),
                mx=Math.round(dy.temperature_2m_max[i]||0), mn=Math.round(dy.temperature_2m_min[i]||0),
                rg=dy.precipitation_sum[i]||0, wn=dy.wind_gusts_10m_max[i]||0,
                ic=rg>5?'🌧️':rg>.5?'🌦️':mx<5?'❄️':'🌤️';
            
            let dW = [];
            if(mn<0){ dW.push({i:'❄️', t:`Vorst: ${mn}°C`}); fVorst=!0; }
            if(rg>15){ dW.push({i:'🌧️', t:`Zware regen: ${rg}mm`}); }
            if(wn>45){ dW.push({i:'💨', t:`Harde wind: ${wn}km/h`}); }
            dD = rg<.5 ? dD+1 : 0;
            if(dD>=4){ dW.push({i:'⚠️', t:`Gevaar voor droogte`}); fDroog=!0; }
            
            let iH = dW.map(w => `<span class="dag-waarschuwing" title="${w.t}">${w.i}</span>`).join('');
            h+=`<div class="weer-dag"><span class="weer-dag-datum">${ic} ${dn}</span><div class="weer-dag-rechts"><div class="weer-dag-icons">${iH}</div><span class="weer-dag-temp">${mx}° / ${mn}°</span></div></div>`;
        }
        D.wL.innerHTML = h; D.wW.style.display = 'none'; ren();
    } catch { D.wL.innerHTML='<p style="color:var(--d);font-size:12px;text-align:center">Weer laden mislukt.</p>'; }
}
