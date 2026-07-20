// ====== INDEXEDDB SETUP (Voor grotere opslag) ======
const DB_NAME = 'TuinPlannerDB';
const DB_VERSION = 1;
const STORE_NAME = 'tuinData';

function initDB() {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = e => {
            let db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = e => resolve(e.target.result);
        request.onerror = e => reject(e.target.error);
    });
}

async function saveToDB(key, data) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        let tx = db.transaction(STORE_NAME, 'readwrite');
        let store = tx.objectStore(STORE_NAME);
        let req = store.put(data, key);
        req.onsuccess = () => resolve();
        req.onerror = e => reject(e.target.error);
    });
}

async function loadFromDB(key) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        let tx = db.transaction(STORE_NAME, 'readonly');
        let store = tx.objectStore(STORE_NAME);
        let req = store.get(key);
        req.onsuccess = e => resolve(e.target.result);
        req.onerror = e => reject(e.target.error);
    });
}
