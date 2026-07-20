// ====== GOOGLE DRIVE SETUP ======
const CLIENT_ID = '170845820129-0bbce9pdd7gn3m52bia3rvm3v9ua7sba.apps.googleusercontent.com';
let tokenClient;
let gapiInited = false, gisInited = false;
let driveFileId = localStorage.getItem('tuinDriveFileId') || null;

function gapiLoaded() { gapi.load('client', () => { gapiInited = true; maybeEnableButtons(); }); }

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (resp) => {
            if (resp.error) return alert("Fout bij inloggen.");
            const expireTime = new Date().getTime() + (resp.expires_in * 1000);
            sessionStorage.setItem('tuinPlannerToken', JSON.stringify({ token: resp, expires: expireTime }));
            startDriveSessie(resp);
        },
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() { 
    if (gapiInited && gisInited) {
        const savedTokenData = sessionStorage.getItem('tuinPlannerToken');
        if (savedTokenData) {
            const parsedData = JSON.parse(savedTokenData);
            if (new Date().getTime() < parsedData.expires) {
                startDriveSessie(parsedData.token);
                return; 
            } else {
                sessionStorage.removeItem('tuinPlannerToken'); 
            }
        }
        document.getElementById('btn-gdrive').style.display = 'inline-block'; 
    } 
}

function startDriveSessie(resp) {
    gapi.client.setToken(resp);
    document.getElementById('btn-gdrive').innerText = "⏳";
    document.getElementById('btn-gdrive').style.background = "var(--a)";
    document.getElementById('btn-gdrive').style.display = 'inline-block';
    syncFromCloud();
}

function handleAuthClick() {
    tokenClient.requestAccessToken({prompt: 'consent'});
}

async function syncToCloud() {
    if (!gapi.client.getToken()) return;
    
    let bgData = await loadFromDB('tuinAchtergrondData');
    const bD = JSON.stringify({ plants: plts, bg: bgData });
    let tk = gapi.client.getToken().access_token;
    
    let query = encodeURIComponent("name='tuinplanner_backup.json' and trashed=false");
    
    if (driveFileId === 'undefined' || driveFileId === 'null') driveFileId = null;

    try {
        if (!driveFileId) {
            let s = await fetch("https://www.googleapis.com/drive/v3/files?q=" + query, { headers: { 'Authorization': 'Bearer ' + tk } }).then(r => r.json());
            if (s.files && s.files.length > 0) driveFileId = s.files[0].id;
        }
        if (driveFileId) {
            await fetch("https://www.googleapis.com/upload/drive/v3/files/" + driveFileId + "?uploadType=media", { method: 'PATCH', headers: { 'Authorization': 'Bearer ' + tk, 'Content-Type': 'application/json' }, body: bD });
        } else {
            let m = await fetch("https://www.googleapis.com/drive/v3/files", { method: 'POST', headers: { 'Authorization': 'Bearer ' + tk, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'tuinplanner_backup.json' }) }).then(r => r.json());
            driveFileId = m.id; localStorage.setItem('tuinDriveFileId', driveFileId);
            await fetch("https://www.googleapis.com/upload/drive/v3/files/" + driveFileId + "?uploadType=media", { method: 'PATCH', headers: { 'Authorization': 'Bearer ' + tk, 'Content-Type': 'application/json' }, body: bD });
        }
    } catch(e) { console.error("Cloud Save Error:", e); }
}

async function syncFromCloud() {
    try {
        let tk = gapi.client.getToken().access_token;
        let query = encodeURIComponent("name='tuinplanner_backup.json' and trashed=false");
        
        let s = await fetch("https://www.googleapis.com/drive/v3/files?q=" + query, { headers: { 'Authorization': 'Bearer ' + tk } }).then(r => r.json());
        
        if (s.files && s.files.length > 0) {
            driveFileId = s.files[0].id; localStorage.setItem('tuinDriveFileId', driveFileId);
            let d = await fetch("https://www.googleapis.com/drive/v3/files/" + driveFileId + "?alt=media", { headers: { 'Authorization': 'Bearer ' + tk } }).then(r => r.json());
            
            if (d.plants) {
                plts = d.plants;
                if (d.bg) { await saveToDB('tuinAchtergrondData', d.bg); D.tA.src = d.bg; }
                await saveToDB(KEY, plts);
                ren(); 
            }
        } else {
            if (plts && plts.length > 0) syncToCloud();
        }
        document.getElementById('btn-gdrive').innerText = "☁️";
    } catch(e) {
        document.getElementById('btn-gdrive').innerText = "❌";
    }
}
