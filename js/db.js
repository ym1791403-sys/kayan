/**
 * ========================================================
 * كيان سيتي للتطوير العقاري
 * 3. محرك قاعدة البيانات والمزامنة الفورية (Firebase DB Engine)
 * ========================================================
 */

window.Kayan = window.Kayan || {};

(function(K){
  const CFG = window.KAYAN_CONFIG || {};
  const FB = CFG.FIREBASE || {};
  const fbApp = (FB.apiKey && FB.projectId && window.firebase) ? firebase.initializeApp(FB) : null;
  const db = fbApp ? firebase.database() : null;
  const auth = fbApp ? firebase.auth() : null;

  const created = { properties: new Map(), students: new Map(), requests: new Map() };
  const EMPTY_AD = { enabled: false, text: "", tag: "", btnText: "" };
  const PH = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%230d172a'/></svg>";

  let PROPS = [], STUDENTS = [], REQUESTS = [], AD = EMPTY_AD;
  let loaded = false, isAdmin = false;
  const snaps = { properties: new Map(), students: new Map(), requests: new Map() };
  let queue = Promise.resolve();

  function esc(v){
    return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }

  function showToast(msg){
    const t = document.getElementById("toast") || document.getElementById("custom-toast");
    if(!t) return;
    t.innerText = msg;
    t.style.display = "block";
    setTimeout(() => { t.style.display = "none"; }, 3200);
  }

  function formatDateTime(ts){
    if(!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleDateString("ar-EG", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
  }

  async function refreshAdminState(user){
    if(!user || !user.email){ isAdmin = false; return false; }
    try {
      await user.getIdTokenResult();
      const adminEmail = (CFG.ADMIN_EMAIL || "").toLowerCase().trim();
      if(user.email.toLowerCase().trim() !== adminEmail){
        isAdmin = false;
        return false;
      }
      isAdmin = true;
    } catch(e) {
      console.warn("Unable to verify administrator authorization", e);
      isAdmin = false;
    }
    return isAdmin;
  }

  async function fetchAll(table){
    if(!db) return [];
    const snapshot = await db.ref(table).get();
    const val = snapshot.val() || {};
    created[table] = new Map();
    const rows = Object.keys(val).map(id => {
      if(!val[id] || typeof val[id] !== "object") return null;
      const r = Object.assign({}, val[id]);
      r.id = id;
      if(table === "students"){
        const mo = {};
        if(r.months) Object.keys(r.months).forEach(k => { if(r.months[k] != null) mo[k] = r.months[k]; });
        r.months = mo;
      }
      created[table].set(id, r.createdAt || 0);
      if(table !== "requests"){
        delete r.createdAt;
      }
      return r;
    });
    const validRows = rows.filter(Boolean);
    validRows.sort((a, b) => (created[table].get(b.id) - created[table].get(a.id)) || String(a.id).localeCompare(String(b.id)));
    return validRows;
  }

  function setSnap(table, list){
    snaps[table] = new Map(list.map(i => [i.id, JSON.stringify(i)]));
  }

  function syncTable(table, list){
    const snap = snaps[table], keep = new Set(), up = [], del = [];
    list.forEach(it => {
      keep.add(it.id);
      const j = JSON.stringify(it);
      if(snap.get(it.id) !== j){ up.push(it); snap.set(it.id, j); }
    });
    snap.forEach((_, id) => { if(!keep.has(id)) del.push(id); });
    del.forEach(id => snap.delete(id));
    if(!db || (!up.length && !del.length)) return;
    const stamps = created[table];
    up.forEach(it => { if(!stamps.has(it.id)) stamps.set(it.id, Date.now()); });
    queue = queue.then(async () => {
      const updates = {};
      up.forEach(it => {
        const { id, ...data } = it;
        updates[table + "/" + id] = JSON.parse(JSON.stringify({ ...data, createdAt: stamps.get(id) }));
      });
      del.forEach(id => { updates[table + "/" + id] = null; stamps.delete(id); });
      await db.ref().update(updates);
    }).catch(err => {
      console.error(err);
      showToast("⚠️ فشل الحفظ في قاعدة البيانات: " + (err.message || ""));
      reloadAll();
    });
  }

  function getProps(){ return PROPS; }
  function saveProps(p){ PROPS = p; syncTable("properties", p); }

  function getStudents(){ return STUDENTS; }
  function saveStudents(s){ STUDENTS = s; syncTable("students", s); }

  function getRequests(){ return REQUESTS; }
  function saveRequests(r){ REQUESTS = r; syncTable("requests", r); }

  function getAd(){ return AD || EMPTY_AD; }
  function saveAd(a){
    AD = a;
    if(!db) return;
    queue = queue.then(async () => {
      await db.ref("settings/ad_banner").set({ value: JSON.parse(JSON.stringify(a)) });
    }).catch(err => { console.error(err); showToast("⚠️ فشل حفظ الإعلان: " + (err.message || "")); });
  }

  async function loadPublic(){
    if(!db) return;
    try {
      const [props, ad] = await Promise.all([
        fetchAll("properties"),
        db.ref("settings/ad_banner").get()
      ]);
      PROPS = props; setSnap("properties", PROPS);
      const adVal = ad.val();
      AD = (adVal && adVal.value) || EMPTY_AD;
    } catch(e){
      console.error(e);
      showToast("تعذر تحميل البيانات من قاعدة البيانات");
    }
    loaded = true;
    if(K.ads && K.ads.renderPublicAd) K.ads.renderPublicAd();
    if(K.properties && K.properties.renderPublicProperties) K.properties.renderPublicProperties();
  }

  async function loadStudents(){
    if(!db) return;
    STUDENTS = await fetchAll("students");
    setSnap("students", STUDENTS);
  }

  async function loadRequests(){
    if(!db) return;
    try {
      REQUESTS = await fetchAll("requests");
      setSnap("requests", REQUESTS);
      if(K.requests && K.requests.renderRequestsTable) K.requests.renderRequestsTable();
    } catch(e){
      console.warn("Requests load error:", e);
    }
  }

  async function reloadAll(){
    await loadPublic();
    if(isAdmin){
      try { await loadStudents(); } catch(e){ console.error(e); }
      try { await loadRequests(); } catch(e){}
      if(K.properties && K.properties.renderAdminTable) K.properties.renderAdminTable();
      if(K.students && K.students.renderStudentsTable) K.students.renderStudentsTable();
      if(K.ads && K.ads.loadAdminAd) K.ads.loadAdminAd();
      if(K.requests && K.requests.renderRequestsTable) K.requests.renderRequestsTable();
    }
  }

  // تصدير واجهة قاعدة البيانات للموقع
  K.db = {
    app: fbApp,
    rawDb: db,
    auth: auth,
    created: created,
    PH: PH,
    EMPTY_AD: EMPTY_AD,
    esc: esc,
    showToast: showToast,
    formatDateTime: formatDateTime,
    refreshAdminState: refreshAdminState,
    fetchAll: fetchAll,
    syncTable: syncTable,
    getProps: getProps,
    saveProps: saveProps,
    getStudents: getStudents,
    saveStudents: saveStudents,
    getRequests: getRequests,
    saveRequests: saveRequests,
    getAd: getAd,
    saveAd: saveAd,
    loadPublic: loadPublic,
    loadStudents: loadStudents,
    loadRequests: loadRequests,
    reloadAll: reloadAll,
    getLoaded: () => loaded,
    getIsAdmin: () => isAdmin,
    setIsAdmin: (val) => { isAdmin = val; }
  };

})(window.Kayan);
