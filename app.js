
// ===== إعدادات قاعدة البيانات (Firebase) =====
// املأ القيم من: Firebase Console > Project settings (⚙️) > General > Your apps > Web app > SDK setup and configuration
window.KAYAN_CONFIG = {
  FIREBASE: {
    apiKey: "AIzaSyDJ5Bl1G-mYkzO9ovilFrsa7Z5OhcI0vO4",
    authDomain: "kyan-b9581.firebaseapp.com",
    projectId: "kyan-b9581",
    databaseURL: "https://kyan-b9581-default-rtdb.firebaseio.com/",
    storageBucket: "kyan-b9581.firebasestorage.app",
    messagingSenderId: "275317091922",
    appId: "1:275317091922:web:60e95ecb19caad26dd798b"
  },
  // إيميل داخلي ثابت لا يراه أو يكتبه أحد (Firebase يحتاجه تقنياً). الدخول من الموقع بالرقم السري فقط،
  // وأول رقم سري (6 خانات أو أكثر) تدخله يتحول تلقائياً لرقم المدير السري.
  ADMIN_EMAIL: "admin@kayancity.com"
};

// ========================================================
// 1. SCROLL & 3D REALISTIC SCENE LOGIC
// ========================================================
(function(){
  const heroStage = document.getElementById("hero-stage");
  const slide1 = document.getElementById("slide-1");
  const slide2 = document.getElementById("slide-2");
  const slide3 = document.getElementById("slide-3");
  const scrollCue = document.getElementById("scroll-cue");
  let scrollProgress = 0;

  function updateScroll(){
    const rect = heroStage.getBoundingClientRect();
    const totalDist = rect.height - window.innerHeight;
    if(totalDist > 0){
      scrollProgress = Math.max(0, Math.min(1, -rect.top / totalDist));
    }

    if(scrollProgress < 0.25){
      slide1.className = "hero-slide active";
      slide2.className = "hero-slide inactive";
      slide3.className = "hero-slide inactive";
      scrollCue.style.opacity = "1";
    } else if(scrollProgress >= 0.25 && scrollProgress < 0.65){
      slide1.className = "hero-slide inactive";
      slide2.className = "hero-slide active";
      slide3.className = "hero-slide inactive";
      scrollCue.style.opacity = "0.5";
    } else {
      slide1.className = "hero-slide inactive";
      slide2.className = "hero-slide inactive";
      slide3.className = "hero-slide active";
      scrollCue.style.opacity = "0";
    }
  }

  let scrollTick = false;
  window.addEventListener("scroll", () => { if(scrollTick) return; scrollTick = true; requestAnimationFrame(() => { scrollTick = false; updateScroll(); }); }, {passive: true});
  updateScroll();

  // 3D Scene Initialization (lazy + light)
  function init3D(){
  const canvas = document.getElementById("canvas-3d");
  const lowEnd = (navigator.hardwareConcurrency || 4) <= 4 || window.innerWidth < 768;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: !lowEnd, alpha: false, powerPreference: "high-performance"}); } catch(e){ return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowEnd ? 1 : 1.5));
  renderer.shadowMap.enabled = !lowEnd;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x071120, 0.012);

  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 500);

  const ambientLight = new THREE.HemisphereLight(0x7694bf, 0x111e33, 0.7);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffdfa9, 2.2);
  sunLight.position.set(-35, 45, 30);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(1024, 1024);
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  const blueRimLight = new THREE.DirectionalLight(0x4080ff, 1.2);
  blueRimLight.position.set(30, 25, -25);
  scene.add(blueRimLight);

  // Ground Plaza
  const plazaMat = new THREE.MeshStandardMaterial({color: 0x0f1c2e, roughness: 0.25, metalness: 0.4});
  const ground = new THREE.Mesh(new THREE.CircleGeometry(160, 64), plazaMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Water Feature / Reflecting Pool
  const poolMat = new THREE.MeshStandardMaterial({color: 0x092644, roughness: 0.05, metalness: 0.9});
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.2, 48), poolMat);
  pool.position.set(0, 0.1, 14);
  pool.receiveShadow = true;
  scene.add(pool);

  const poolLight = new THREE.PointLight(0x35e8c0, 1.5, 18);
  poolLight.position.set(0, 1.2, 14);
  scene.add(poolLight);

  // Road
  const roadMat = new THREE.MeshStandardMaterial({color: 0x080f1a, roughness: 0.8});
  const road = new THREE.Mesh(new THREE.RingGeometry(35, 45, 64), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.02;
  scene.add(road);

  // Procedural Window Glass Texture
  function createGlassTexture() {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 512, 512);
    g.addColorStop(0, "#193554");
    g.addColorStop(1, "#0a192c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = "#324e70";
    ctx.lineWidth = 4;
    for(let x = 0; x <= 512; x += 64){
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for(let y = 0; y <= 512; y += 128){
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
    
    ctx.fillStyle = "rgba(255, 222, 150, 0.85)";
    for(let x = 8; x < 512; x += 64){
      for(let y = 12; y < 512; y += 128){
        if(Math.random() > 0.42) ctx.fillRect(x + 4, y + 4, 48, 100);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  const glassTex = createGlassTexture();
  glassTex.repeat.set(2, 4);

  const glassMaterial = new THREE.MeshStandardMaterial({map: glassTex, roughness: 0.15, metalness: 0.85});
  const champagneTrim = new THREE.MeshStandardMaterial({color: 0xcfb26d, roughness: 0.3, metalness: 0.8});
  const balconyGlass = new THREE.MeshStandardMaterial({color: 0x88d9ff, transparent: true, opacity: 0.45, roughness: 0.1, metalness: 0.6});

  // Building the Tower
  const tower = new THREE.Group();

  // Lobby
  const lobby = new THREE.Mesh(new THREE.BoxGeometry(16, 3.8, 12), glassMaterial);
  lobby.position.y = 1.9;
  lobby.castShadow = true;
  tower.add(lobby);

  const canopy = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 6), champagneTrim);
  canopy.position.set(0, 3.2, 7.5);
  canopy.castShadow = true;
  tower.add(canopy);

  // Tower Shaft
  const floorCount = 14;
  const floorHeight = 1.45;

  for(let i = 0; i < floorCount; i++){
    const yPos = 3.8 + i * floorHeight;
    const scaleFactor = 1 - Math.pow(i / floorCount, 3) * 0.15;
    const w = 12 * scaleFactor;
    const d = 9 * scaleFactor;

    const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(w - 0.5, floorHeight * 0.95, d - 0.5), glassMaterial);
    floorMesh.position.set(0, yPos + floorHeight / 2, 0);
    floorMesh.castShadow = true;
    tower.add(floorMesh);

    const slab = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.18, d + 1.2), champagneTrim);
    slab.position.set(0, yPos, 0);
    slab.castShadow = true;
    tower.add(slab);

    const frontRail = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.55, 0.05), balconyGlass);
    frontRail.position.set(0, yPos + 0.35, (d + 1.2) / 2);
    const backRail = frontRail.clone();
    backRail.position.z = -(d + 1.2) / 2;
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.55, d + 1.2), balconyGlass);
    leftRail.position.set(-(w + 1.2) / 2, yPos + 0.35, 0);
    const rightRail = leftRail.clone();
    rightRail.position.x = (w + 1.2) / 2;

    tower.add(frontRail, backRail, leftRail, rightRail);
  }

  // Rooftop Sky-Lounge (No Crane)
  const roofY = 3.8 + floorCount * floorHeight;
  const penthouse = new THREE.Mesh(new THREE.BoxGeometry(8, 2.2, 6), glassMaterial);
  penthouse.position.set(0, roofY + 1.1, 0);
  tower.add(penthouse);

  const roofPergola = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.25, 7.4), champagneTrim);
  roofPergola.position.set(0, roofY + 2.3, 0);
  tower.add(roofPergola);

  const crownLight = new THREE.PointLight(0x35e8c0, 2.0, 15);
  crownLight.position.set(0, roofY + 1.8, 0);
  tower.add(crownLight);

  scene.add(tower);

  // Landscape Trees
  const treeTrunkMat = new THREE.MeshStandardMaterial({color: 0x2e1e14, roughness: 0.9});
  const treeLeafMat = new THREE.MeshStandardMaterial({color: 0x16533c, roughness: 0.8});

  for(let t = 0; t < 22; t++){
    const ang = (t / 22) * Math.PI * 2;
    const dist = 18 + Math.random() * 8;
    const tx = Math.cos(ang) * dist;
    const tz = Math.sin(ang) * dist;
    if(tz > 6 && Math.abs(tx) < 8) continue;

    const tg = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.2, 8), treeTrunkMat);
    trunk.position.y = 1.1;
    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), treeLeafMat);
    foliage.position.y = 2.8;
    tg.add(trunk, foliage);
    tg.position.set(tx, 0, tz);
    scene.add(tg);
  }

  // Moving Cars
  const cars = [];
  const carColors = [0xd4af37, 0xeeeeee, 0x092644, 0x111111];
  function makeCar(c, r, spd, ang){
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 1.1), new THREE.MeshStandardMaterial({color: c, metalness: 0.8, roughness: 0.2}));
    b.position.y = 0.5;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.45, 0.95), new THREE.MeshStandardMaterial({color: 0x07111e, roughness: 0.1, metalness: 0.9}));
    cabin.position.set(-0.2, 0.95, 0);
    g.add(b, cabin);
    scene.add(g);
    cars.push({g: g, r: r, spd: spd, a: ang});
  }
  makeCar(carColors[0], 39, 0.008, 0);
  makeCar(carColors[1], 41, -0.007, 1.8);
  makeCar(carColors[2], 39, 0.009, 3.4);

  // Mouse Drag Rotation (Safely checks targets to avoid freezing UI!)
  let isDragging = false;
  let previousMouseX = 0;
  let mouseSpinOffset = 0;

  function onPointerDown(e){
    isDragging = true;
    previousMouseX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
  }

  function onPointerMove(e){
    if(!isDragging) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - previousMouseX;
    mouseSpinOffset += deltaX * 0.005;
    previousMouseX = clientX;
  }

  function onPointerUp(){
    isDragging = false;
  }

  canvas.addEventListener("mousedown", onPointerDown);
  window.addEventListener("mousemove", onPointerMove);
  window.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("touchstart", onPointerDown, {passive: true});
  window.addEventListener("touchmove", onPointerMove, {passive: true});
  window.addEventListener("touchend", onPointerUp, {passive: true});

  function resize(){
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  let smoothProgress = 0;
  let running = true, heroVisible = true;
  new IntersectionObserver(es => {
    heroVisible = es[0].isIntersecting;
    if(heroVisible && !running){ running = true; requestAnimationFrame(animate); }
  }).observe(heroStage);
  document.addEventListener("visibilitychange", () => {
    if(!document.hidden && heroVisible && !running){ running = true; requestAnimationFrame(animate); }
  });
  let lastFrame = 0;
  function animate(t){
    if(!heroVisible || document.hidden){ running = false; return; }
    requestAnimationFrame(animate);
    if(lowEnd && t - lastFrame < 32) return;
    lastFrame = t;
    smoothProgress += (scrollProgress - smoothProgress) * 0.08;

    const baseAngle = -0.6 + smoothProgress * 1.8 + mouseSpinOffset;
    const radius = 34 - smoothProgress * 6;
    const camY = 8 + smoothProgress * 16;
    const lookY = 7 + smoothProgress * 12;

    camera.position.x = Math.sin(baseAngle) * radius;
    camera.position.z = Math.cos(baseAngle) * radius;
    camera.position.y = camY;
    camera.lookAt(0, lookY, 0);

    cars.forEach(car => {
      car.a += car.spd;
      car.g.position.x = Math.sin(car.a) * car.r;
      car.g.position.z = Math.cos(car.a) * car.r;
      car.g.rotation.y = car.a + (car.spd > 0 ? Math.PI / 2 : -Math.PI / 2);
    });

    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);
  }
  function loadThree(){
    const sc = document.createElement("script");
    sc.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    sc.onload = init3D;
    document.head.appendChild(sc);
  }
  if("requestIdleCallback" in window) requestIdleCallback(loadThree, {timeout: 1500}); else setTimeout(loadThree, 300);
})();

// ========================================================
// 2. REAL ESTATE DATA ENGINE & SYNCHRONIZATION
// ========================================================
(function(){
  const CFG = window.KAYAN_CONFIG || {};
  const FB = CFG.FIREBASE || {};
  const fbApp = (FB.apiKey && FB.projectId && window.firebase) ? firebase.initializeApp(FB) : null;
  const db = fbApp ? firebase.database() : null;
  const auth = fbApp ? firebase.auth() : null;
  const created = { properties: new Map(), students: new Map(), requests: new Map() }; // وقت الإنشاء لترتيب الأحدث أولاً
  const EMPTY_AD = { enabled: false, text: "", tag: "", btnText: "" };
  const PH = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%230d172a'/></svg>";
  const DEFAULT_PROPERTIES = [
    {
      id: "prop_shoheib_st_1",
      title: "شقة للبيع 95م مرخصة بشارع شهيب – تشطيب كامل",
      category: "family",
      price: "2,200,000 ج.م",
      status: "available",
      location: "شارع شهيب - عمارة مرخصة الدور الثالث",
      area: "95 م²",
      rooms: "3 غرف وصالة",
      baths: "مطبخ وحمام",
      badge: "الدور الثالث - عمارة مرخصة",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      video: ""
    },
    {
      id: "prop_farouk_kaddis_1",
      title: "شقة سوبر لوكس 75م بشارع فاروق قديس",
      category: "family",
      price: "1,300,000 ج.م",
      status: "available",
      location: "شارع فاروق قديس - دور أرضي سوبر لوكس",
      area: "75 م²",
      rooms: "غرفتين وصالة",
      baths: "مطبخ وحمام",
      badge: "دور أرضي - سوبر لوكس",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      video: ""
    },
    {
      id: "prop_city_branches_1",
      title: "شقة للبيع 65م عمارة مباني جديدة بتفرعات سيتي",
      category: "family",
      price: "1,350,000 ج.م",
      status: "available",
      location: "تفرعات سيتي - عمارة مباني جديدة",
      area: "65 م²",
      rooms: "غرفتين وصالة",
      baths: "مطبخ وحمام",
      badge: "الدور الرابع - مباني جديدة",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      video: ""
    },
    {
      id: "prop_masnaa_sayed_1",
      title: "شقة للبيع 65م بمصنع سيد – تقسيم الحقوقيين",
      category: "family",
      price: "850,000 ج.م",
      status: "available",
      location: "مصنع سيد – شارع تقسيم الحقوقيين",
      area: "65 م²",
      rooms: "غرفتين وصالة",
      baths: "مطبخ وحمام",
      badge: "الدور الرابع - للبيع",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      video: ""
    },
    {
      id: "prop_tawba_mosque_1",
      title: "شقة للبيع 80م عند مسجد التوبة",
      category: "family",
      price: "2,500,000 ج.م",
      status: "available",
      location: "عند مسجد التوبة - الدور الأول بلكونة",
      area: "80 م²",
      rooms: "3 غرف وصالة",
      baths: "حمام ومطبخ",
      badge: "أول بلكونة - للبيع",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      video: ""
    }
  ];
  let PROPS = DEFAULT_PROPERTIES.slice(), STUDENTS = [], REQUESTS = [], AD = EMPTY_AD;
  let loaded = false, isAdmin = false;
  const snaps = { properties: new Map(), students: new Map(), requests: new Map() };
  let queue = Promise.resolve();

  function esc(v){
    return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }

  function safeImg(url){
    if(!url || typeof url !== "string") return PH;
    const trimmed = url.trim();
    if(trimmed.startsWith("data:image/")) return trimmed;
    if(/^https?:\/\//i.test(trimmed)) return trimmed;
    if(/^[a-zA-Z0-9_\-\.\/]+\.(png|jpe?g|webp|gif|svg)$/i.test(trimmed)) return trimmed;
    return PH;
  }

  // A signed-in Firebase user is not automatically an administrator. The
  // `admin` custom claim is assigned only by a trusted Admin SDK process.
  async function refreshAdminState(user){
    if(!user){ isAdmin = false; return false; }
    try {
      const token = await user.getIdTokenResult();
      const email = (user.email || "").toLowerCase();
      const adminEmail = (CFG.ADMIN_EMAIL || "").toLowerCase();
      isAdmin = Boolean(token.claims && token.claims.admin === true || (adminEmail && email === adminEmail));
    } catch(e) {
      console.warn("Unable to verify administrator authorization", e);
      isAdmin = false;
    }
    return isAdmin;
  }

  async function fetchAll(table){
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

  // يقارن القائمة الحالية بآخر نسخة محفوظة ويرسل الفروقات فقط (إضافة/تعديل/حذف)
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
      PROPS = (props && props.length > 0) ? props : DEFAULT_PROPERTIES.slice(); setSnap("properties", PROPS);
      const adVal = ad.val();
      AD = (adVal && adVal.value) || EMPTY_AD;
    } catch(e){
      console.error(e);
      showToast("تعذر تحميل البيانات من قاعدة البيانات");
    }
    loaded = true;
    renderPublicAd();
    renderPublicProperties();
  }

  async function loadStudents(){
    if(!db) return;
    STUDENTS = await fetchAll("students");
    setSnap("students", STUDENTS);
  }

  async function reloadAll(){
    await loadPublic();
    if(isAdmin){
      try { await loadStudents(); } catch(e){ console.error(e); }
      renderAdminTable(); renderStudentsTable(); loadAdminAd();
    }
  }

  function showToast(msg){
    const t = document.getElementById("toast");
    if(!t) return;
    t.innerText = msg;
    t.style.display = "block";
    setTimeout(() => { t.style.display = "none"; }, 3000);
  }

  // 1. Render Public Announcement Bar
  function renderPublicAd(){
    const ad = getAd();
    const adBar = document.getElementById("ad-announcement-bar");
    if(ad && ad.enabled && ad.text && ad.text.trim() !== "" && adBar){
      adBar.style.display = "flex";
      document.getElementById("ad-text-content").innerText = ad.text || "";
      document.getElementById("ad-pill").innerText = ad.tag || "عرض خاص";
      document.getElementById("ad-action-btn").innerText = ad.btnText || "احجز الآن";
    } else if(adBar){
      adBar.style.display = "none";
    }
  }

  // 2. Render Public Properties
  let publicFilter = "all", publicLimit = 24;
  function renderPublicProperties(filter){
    if(filter && filter !== publicFilter) publicLimit = 24;
    publicFilter = filter || publicFilter;
    const props = getProps();
    const filtered = publicFilter === "all" ? props : props.filter(p => p.category === publicFilter);
    const grid = document.getElementById("properties-grid");
    if(!grid) return;
    if(!loaded && db){ grid.innerHTML = '<div class="empty-state-box"><p style="color:var(--text-muted)">جاري تحميل الوحدات…</p></div>'; return; }
    grid.innerHTML = "";

    if(filtered.length === 0){
      grid.innerHTML = `
        <div class="empty-state-box">
          <h3 style="color:#fff; font-size:1.4rem; margin-bottom:8px;">لا توجد وحدات معروضة حالياً</h3>
          <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:16px;">يرجى التواصل معنا للاستفسار عن أحدث الوحدات المتاحة ومواعيد التسليم.</p>
          <a href="#contact" class="btn-primary" style="display:inline-flex; text-decoration:none;">تواصل مع فريق المبيعات</a>
        </div>
      `;
      return;
    }

    const shown = filtered.slice(0, publicLimit);
    shown.forEach(p => {
      const isSold = p.status === "sold";
      const isReserved = p.status === "reserved";

      const card = document.createElement("div");
      card.className = "property-card" + (isSold ? " sold-card" : "");

      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${esc(safeImg(p.image))}" alt="${esc(p.title)}" loading="lazy" decoding="async">
          ${isSold ? '<div class="sold-ribbon">تم البيع</div>' : ''}
          <div class="card-badge ${isSold ? 'sold' : (isReserved ? 'reserved' : '')}">
            ${isSold ? 'تم البيع / Sold Out' : (isReserved ? 'محجوز مؤقتاً' : esc(p.badge || 'متاح للحجز'))}
          </div>
          ${p.video ? `<button type="button" class="video-play-badge" data-video-prop-id="${esc(p.id)}" title="مشاهدة فيديو الشقة">🎥 فيديو الشقة</button>` : ''}
          <div class="card-price">${esc(p.price)}</div>
        </div>
        <div class="card-body">
          <h3>${esc(p.title)}</h3>
          <div class="card-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${esc(p.location)}</span>
          </div>
          <div class="card-features">
            <div class="card-feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              <span>${esc(p.area)}</span>
            </div>
            <div class="card-feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10H2M2 17h20M6 8v9"/></svg>
              <span>${esc(p.rooms)}</span>
            </div>
            <div class="card-feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M2 12h20M7 12V7a5 5 0 0 1 10 0v5"/></svg>
              <span>${esc(p.baths)}</span>
            </div>
          </div>
          <div class="card-foot">
            ${isSold ? 
              '<span class="btn-sold">تم البيع بالكامل</span>' : 
              '<a href="#contact" class="btn-primary" style="flex:1; justify-content:center;">حجز الشقة</a>'
            }
            ${p.video ? `<button type="button" class="btn-outline btn-video-trigger" data-video-prop-id="${esc(p.id)}" style="cursor:pointer; display:inline-flex; align-items:center; gap:6px;"><span>🎥 فيديو</span></button>` : ''}
            <a href="#contact" class="btn-outline">معاينة 3D</a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    if(filtered.length > shown.length){
      const m = document.createElement("div");
      m.style.cssText = "grid-column:1/-1;text-align:center";
      m.innerHTML = `<button type="button" class="btn-outline">عرض المزيد (${filtered.length - shown.length})</button>`;
      m.firstChild.onclick = () => { publicLimit += 24; renderPublicProperties(); };
      grid.appendChild(m);
    }
  }

  // Filter Buttons on Public Site
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPublicProperties(btn.getAttribute("data-filter"));
    });
  });

  // 3. Render Admin Properties Table
  function renderAdminTable(){
    const props = getProps();
    const tbody = document.getElementById("admin-props-tbody");
    if(!tbody) return;
    tbody.innerHTML = "";

    let total = props.length;
    let avail = 0;
    let res = 0;
    let sold = 0;
    let totalVal = 0;
    let soldVal = 0;

    if(props.length === 0){
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-muted);">لا توجد أي شقق مسجلة حالياً. اضغط على زر "إضافة شقة جديدة" بالأعلى لإضافة شققك الحقيقية.</td></tr>`;
    }

    props.forEach(p => {
      if(p.status === "available") avail++;
      else if(p.status === "reserved") res++;
      else if(p.status === "sold") sold++;

      const num = parseInt(p.price.replace(/[^\d]/g, "")) || 0;
      totalVal += num;
      if(p.status === "sold" || p.status === "reserved") soldVal += num;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img src="${esc(safeImg(p.image))}" class="property-thumb" alt="${esc(p.title)}" loading="lazy" decoding="async"></td>
        <td>
          <strong style="color:#fff; display:block;">${esc(p.title)}</strong>
          <div style="display:flex; align-items:center; gap:6px; margin-top:2px; flex-wrap:wrap;">
            <span style="font-size:0.78rem; color:var(--gold);">${esc(p.badge || "")}</span>
            ${p.video ? `<button type="button" class="btn-video-admin-badge" data-video-prop-id="${esc(p.id)}" title="تشغيل فيديو الشقة" style="background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); color:var(--gold); font-size:0.72rem; padding:1px 6px; border-radius:4px; cursor:pointer; font-family:inherit;">🎥 فيديو</button>` : ''}
          </div>
        </td>
        <td>
          <span style="color:var(--text-muted); font-size:0.85rem;">
            ${p.category === 'hotel' ? 'أجنحة فندقية' : p.category === 'student' ? 'سكن طلابي VIP' : 'شقق عائلية'}
          </span>
        </td>
        <td><strong style="color:var(--gold-light); font-size:0.95rem;">${esc(p.price)}</strong></td>
        <td><span style="font-size:0.85rem; color:#b7c7db;">${esc(p.location)}</span></td>
        <td><span style="font-size:0.85rem;">${esc(p.area)} • ${esc(p.rooms)}</span></td>
        <td>
          <select class="status-select" data-admin-action="change-property-status" data-property-id="${esc(p.id)}">
            <option value="available" ${p.status === 'available' ? 'selected' : ''}>🟢 متاح للحجز</option>
            <option value="reserved" ${p.status === 'reserved' ? 'selected' : ''}>🟡 محجوز مؤقتاً</option>
            <option value="sold" ${p.status === 'sold' ? 'selected' : ''}>🔴 تم البيع (Sold)</option>
          </select>
        </td>
        <td>
          <div class="action-group">
            <button class="btn-icon" type="button" data-admin-action="edit-property" data-property-id="${esc(p.id)}" title="تعديل تفاصيل الشقة">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon delete" type="button" data-admin-action="delete-property" data-property-id="${esc(p.id)}" title="حذف الشقة نهائياً">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    document.getElementById("kpi-total-units").innerText = total;
    document.getElementById("kpi-avail-units").innerText = avail;
    document.getElementById("kpi-res-units").innerText = res;
    document.getElementById("kpi-sold-units").innerText = sold;

    document.getElementById("stats-total-val").innerText = totalVal.toLocaleString() + " ج.م";
    document.getElementById("stats-sold-val").innerText = soldVal.toLocaleString() + " ج.م";
    const occ = total > 0 ? Math.round(((res + sold) / total) * 100) : 0;
    document.getElementById("stats-occupancy").innerText = occ + "%";
  }

  // Admin: Change Status directly
  window.adminChangeStatus = function(id, newStatus){
    const props = getProps();
    const item = props.find(p => p.id === id);
    if(item){
      item.status = newStatus;
      if(newStatus === "sold") item.badge = "تم البيع";
      else if(newStatus === "available") item.badge = "متاح للحجز الفوري";
      else if(newStatus === "reserved") item.badge = "محجوز مؤقتاً";

      saveProps(props);
      renderAdminTable();
      renderPublicProperties();
      showToast("تم تحديث حالة الشقة فوراً في الموقع!");
    }
  };

  // Admin: Delete Unit (مؤمن بكلمة سر لوحة التحكم في فايربيس)
  window.adminDeleteProp = function(id){
    const prop = getProps().find(p => p.id === id);
    const title = prop && prop.title ? `الشقة "${prop.title}"` : "هذه الشقة";
    requestDeleteWithPassword(`هل أنت متأكد من رغبتك في حذف ${title} نهائياً؟`, () => {
      let props = getProps();
      props = props.filter(p => p.id !== id);
      saveProps(props);
      renderAdminTable();
      renderPublicProperties();
      showToast("تم حذف الشقة بنجاح بعد التحقق من كلمة السر!");
    });
  };

  // Admin: Clear All Units (Start from Scratch)
  document.getElementById("btn-clear-all-units")?.addEventListener("click", () => {
    requestDeleteWithPassword("تحذير أمني شديد: هل أنت متأكد من رغبتك في مسح كافة الشقق المسجلة من الصفر؟", () => {
      saveProps([]);
      renderAdminTable();
      renderPublicProperties();
      showToast("تم مسح كافة الوحدات بنجاح بعد التحقق من كلمة السر!");
    });
  });


  // Admin: Edit Modal
  window.adminEditProp = function(id){
    const props = getProps();
    const item = props.find(p => p.id === id);
    if(!item) return;

    document.getElementById("admin-modal-title").innerText = "تعديل بيانات الشقة";
    document.getElementById("form-prop-id").value = item.id;
    document.getElementById("form-prop-title").value = item.title;
    document.getElementById("form-prop-category").value = item.category;
    document.getElementById("form-prop-price").value = item.price;
    document.getElementById("form-prop-status").value = item.status;
    document.getElementById("form-prop-location").value = item.location;
    document.getElementById("form-prop-area").value = item.area;
    document.getElementById("form-prop-rooms").value = item.rooms;
    document.getElementById("form-prop-baths").value = item.baths;
    document.getElementById("form-prop-badge").value = item.badge || "";
        setPropImage(item.image || "");
        setPropVideo(item.video || "");

    document.getElementById("admin-property-modal").classList.add("open");
  };
  // ===== رفع صورة الشقة من الجهاز (ضغط تلقائي ثم حفظ داخل قاعدة البيانات) =====
  function okImg(u){
    u = String(u || "").trim();
    return /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp);)/i.test(u) ? u : "";
  }

  function setPropImage(v){
    v = v || "";
    document.getElementById("form-prop-image").value = v;
    const prev = document.getElementById("form-prop-image-preview");
    const ok = okImg(v);
    if(ok){ prev.src = ok; prev.style.display = "block"; }
    else { prev.removeAttribute("src"); prev.style.display = "none"; }
    document.getElementById("form-prop-image-url").value = (v && !/^data:/i.test(v)) ? v : "";
  }

  function compressImage(file){
    return new Promise((resolve, reject) => {
      if(!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) return reject(new Error("نوع الملف غير مدعوم (استخدم JPG أو PNG أو WEBP)"));
      if(file.size > 20 * 1024 * 1024) return reject(new Error("حجم الصورة كبير جداً (الحد الأقصى 20 ميجا)"));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 900;
        const k = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * k));
        const h = Math.max(1, Math.round(img.naturalHeight * k));
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        let q = 0.8, out = c.toDataURL("image/jpeg", q);
        while(out.length > 250000 && q > 0.4){ q -= 0.1; out = c.toDataURL("image/jpeg", q); }
        if(out.length > 380000) return reject(new Error("الصورة معقدة جداً، جرّب صورة أصغر"));
        resolve(out);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("تعذر قراءة الصورة")); };
      img.src = url;
    });
  }

  document.getElementById("form-prop-file").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if(!f) return;
    showToast("جاري تجهيز الصورة...");
    try { setPropImage(await compressImage(f)); showToast("تم اختيار الصورة ✔"); }
    catch(err){ showToast("⚠️ " + (err && err.message ? err.message : "تعذر رفع الصورة")); }
  });
  document.getElementById("form-prop-image-url").addEventListener("input", (e) => {
    const v = e.target.value.trim();
    if(!v) return;
    document.getElementById("form-prop-image").value = v;
    const prev = document.getElementById("form-prop-image-preview");
    const ok = okImg(v);
    if(ok){ prev.src = ok; prev.style.display = "block"; } else { prev.style.display = "none"; }
  });
  document.getElementById("form-prop-image-clear").addEventListener("click", () => setPropImage(""));

  // ===== إدارة وفحص وعرض فيديو الشقة =====
  function parseVideoSource(rawUrl){
    if(!rawUrl || typeof rawUrl !== "string") return { type: "html5", src: "" };
    const u = rawUrl.trim();
    // 1. YouTube (Watch, Share, Shorts, Embed)
    const ytMatch = u.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
    if(ytMatch && ytMatch[1]){
      return { type: "iframe", src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
    }
    // 2. Google Drive (All link variations: /file/d/ID/..., open?id=ID, uc?id=ID)
    const driveMatch = u.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+)|uc\?id=([a-zA-Z0-9_-]+))/i);
    const driveId = driveMatch ? (driveMatch[1] || driveMatch[2] || driveMatch[3]) : null;
    if(driveId){
      return { type: "iframe", src: `https://drive.google.com/file/d/${driveId}/preview` };
    }
    // 3. Vimeo
    const vimeoMatch = u.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i);
    if(vimeoMatch && vimeoMatch[3]){
      return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1` };
    }
    // 4. Direct video URL / MP4 / WebM / Blob
    return { type: "html5", src: u };
  }

  function setPropVideo(v){
    v = (v || "").trim();
    const hiddenIn = document.getElementById("form-prop-video");
    const urlIn = document.getElementById("form-prop-video-url");
    const clearBtn = document.getElementById("form-prop-video-clear");
    const wrap = document.getElementById("form-prop-video-preview-wrap");
    const vidPrev = document.getElementById("form-prop-video-preview");
    const ifrPrev = document.getElementById("form-prop-video-iframe");
    const msgEl = document.getElementById("form-prop-video-msg");

    if(hiddenIn) hiddenIn.value = v;
    if(urlIn && urlIn !== document.activeElement) {
      urlIn.value = (v && !/^data:/i.test(v)) ? v : "";
    }

    if(v){
      if(clearBtn) clearBtn.style.display = "inline-flex";
      if(wrap) wrap.style.display = "block";
      const parsed = parseVideoSource(v);
      if(parsed.type === "iframe"){
        if(vidPrev){ vidPrev.pause(); vidPrev.removeAttribute("src"); vidPrev.style.display = "none"; }
        if(ifrPrev){ ifrPrev.src = parsed.src; ifrPrev.style.display = "block"; }
      } else {
        if(ifrPrev){ ifrPrev.removeAttribute("src"); ifrPrev.style.display = "none"; }
        if(vidPrev){ vidPrev.src = parsed.src; vidPrev.style.display = "block"; }
      }
    } else {
      if(clearBtn) clearBtn.style.display = "none";
      if(wrap) wrap.style.display = "none";
      if(vidPrev){ vidPrev.pause(); vidPrev.removeAttribute("src"); vidPrev.style.display = "none"; }
      if(ifrPrev){ ifrPrev.removeAttribute("src"); ifrPrev.style.display = "none"; }
      if(msgEl) msgEl.style.display = "none";
    }
  }

  // فحص توفر خدمة التخزين السحابي Firebase Storage بسرعة وبدون تجميد
  async function checkStorageBucketExists(bucket){
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), 1200);
      const res = await fetch("https://firebasestorage.googleapis.com/v0/b/" + bucket + "/o?maxResults=1", {
        method: "GET",
        signal: ctrl.signal
      });
      clearTimeout(tid);
      return res.status !== 404;
    } catch(e) {
      return false;
    }
  }

  // دالة الرفع السحابي عبر Firebase Storage
  async function uploadFileToFirebaseStorage(file, onProgress){
    if(!window.firebase || !firebase.storage){
      throw new Error("storage-sdk-missing");
    }
    const bucketCandidates = [
      (CFG.FIREBASE && CFG.FIREBASE.storageBucket) || "kyan-b9581.firebasestorage.app",
      "kyan-b9581.appspot.com",
      "kyan-b9581.firebasestorage.app"
    ].filter((v, i, a) => a.indexOf(v) === i);

    for(const b of bucketCandidates){
      // فحص سريع: هل الباكت موجود أصلاً لتفادي التجميد؟
      const available = await checkStorageBucketExists(b);
      if(!available) continue;

      try {
        const storage = firebase.app().storage("gs://" + b);
        storage.setMaxUploadRetryTime(8000);
        storage.setMaxOperationRetryTime(8000);
        const safeName = Date.now() + "_" + (file.name || "video.mp4").replace(/[^\w\.\-]/g, "_");
        const vRef = storage.ref("properties_videos/" + safeName);
        const task = vRef.put(file);

        const downloadUrl = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            try { task.cancel(); } catch(e){}
            reject(new Error("upload-timeout"));
          }, 45000);

          task.on("state_changed",
            (snap) => {
              const pct = snap.totalBytes ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0;
              if(onProgress) onProgress(pct);
            },
            (err) => { clearTimeout(timeout); reject(err); },
            async () => {
              clearTimeout(timeout);
              try {
                const u = await vRef.getDownloadURL();
                resolve(u);
              } catch(e) {
                reject(e);
              }
            }
          );
        });

        if(downloadUrl) return downloadUrl;
      } catch(err){
        console.warn("Storage upload failed on bucket " + b + ":", err);
      }
    }
    throw new Error("storage-not-configured");
  }

  // مستمعات رفع الفيديو في لوحة التحكم (دعم الرفع السحابي والمباشر من الجهاز)
  document.getElementById("form-prop-video-file")?.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const msgEl = document.getElementById("form-prop-video-msg");
    const showMsg = (html) => {
      if(!msgEl) return;
      msgEl.innerHTML = html;
      msgEl.style.display = "block";
    };

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    showMsg(`
      <div style="color:var(--gold); display:flex; align-items:center; gap:8px;">
        <span style="display:inline-block; width:14px; height:14px; border:2px solid var(--gold); border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite;"></span>
        <span>جارٍ تجهيز وقراءة الفيديو (${sizeMB} ميجا)... يرجى الانتظار <b id="prop-upload-pct">0%</b></span>
      </div>
    `);

    // 1. محاولة الرفع السحابي (إذا كانت الخدمة مفعلة في المشروع)
    try {
      const url = await uploadFileToFirebaseStorage(file, (pct) => {
        const el = document.getElementById("prop-upload-pct");
        if(el) el.textContent = pct + "%";
      });
      setPropVideo(url);
      showMsg(`
        <div style="color:#10b981; font-weight:bold; margin-top:4px;">
          ✓ تم رفع وتثبيت الفيديو بنجاح في السحابة (${sizeMB} ميجا)! 🎥
        </div>
      `);
      showToast("تم رفع وتثبيت الفيديو بنجاح! 🎥");
      return;
    } catch(err){
      console.warn("Storage upload not available, processing direct file attach:", err);
    }

    // 2. إرفاق الفيديو مباشرة من الجهاز (يعمل فوراً وبدون الحاجة لأي إعدادات خارجية)
    if(file.size <= 15 * 1024 * 1024){
      showMsg(`
        <div style="color:var(--gold); display:flex; align-items:center; gap:8px;">
          <span style="display:inline-block; width:14px; height:14px; border:2px solid var(--gold); border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite;"></span>
          <span>جارٍ إرفاق الفيديو مباشرة من جهازك (${sizeMB} ميجا)...</span>
        </div>
      `);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPropVideo(ev.target.result);
        showMsg(`
          <div style="color:#10b981; font-weight:bold; margin-top:4px;">
            ✓ تم إرفاق ومعاينة الفيديو بنجاح من جهازك (${sizeMB} ميجا)! اضغط "حفظ ونشر الشقة" لحفظه 🎥
          </div>
        `);
        showToast("تم إرفاق الفيديو بنجاح من جهازك! 🎥");
      };
      reader.onerror = () => {
        showMsg(`
          <div style="color:#ef4444; font-weight:bold;">
            تعذر قراءة ملف الفيديو من الجهاز، حاول مرة أخرى أو استخدم رابط فيديو.
          </div>
        `);
      };
      reader.readAsDataURL(file);
    } else {
      showMsg(`
        <div style="background:rgba(245, 158, 11, 0.15); border:1px solid rgba(245, 158, 11, 0.5); border-radius:8px; padding:12px; margin-top:8px; text-align:right; line-height:1.6; color:#fff;">
          <div style="font-weight:700; color:#fbbf24; font-size:0.95rem; margin-bottom:4px;">⚠️ حجم ملف الفيديو (${sizeMB} ميجا) كبير للحفظ المباشر</div>
          <div style="font-size:0.83rem; color:#cbd5e1; margin-bottom:8px;">
            حتى يعمل الفيديو بسرعة فائقة وبدون أي بطء للموقع على الموبايل:
          </div>
          <div style="font-size:0.82rem; color:#e2e8f0; line-height:1.7;">
            📌 ارفع الفيديو على <b>Google Drive</b> أو <b>YouTube</b> والصق الرابط في خانة الرابط وسيعمل فوراً بجودة فائقة وبأي حجم!
          </div>
        </div>
      `);
      showToast("استخدم رابط YouTube أو Google Drive للفيديوهات الكبيرة");
    }
  });

  document.getElementById("form-prop-video-url")?.addEventListener("input", (e) => {
    const v = e.target.value.trim();
    const msgEl = document.getElementById("form-prop-video-msg");
    if(msgEl) msgEl.style.display = "none";
    if(!v){ setPropVideo(""); return; }
    setPropVideo(v);
  });

  document.getElementById("form-prop-video-clear")?.addEventListener("click", () => {
    setPropVideo("");
    const fileIn = document.getElementById("form-prop-video-file");
    if(fileIn) fileIn.value = "";
    const msgEl = document.getElementById("form-prop-video-msg");
    if(msgEl) msgEl.style.display = "none";
    showToast("تم حذف الفيديو المرفق");
  });

  // نافذة تشغيل الفيديو
  function openVideoModal(propId){
    const props = getProps();
    const p = props.find(x => x.id === propId);
    if(!p || !p.video) return;

    const modal = document.getElementById("property-video-modal");
    const heading = document.getElementById("video-modal-heading");
    const container = document.getElementById("video-modal-player-container");
    if(!modal || !container) return;

    if(heading) heading.textContent = `فيديو: ${p.title}`;
    container.innerHTML = "";

    const vUrl = (p.video || "").trim();
    const parsed = parseVideoSource(vUrl);

    if(parsed.type === "iframe"){
      const ifr = document.createElement("iframe");
      ifr.src = parsed.src;
      ifr.style.width = "100%";
      ifr.style.height = "400px";
      ifr.style.border = "none";
      ifr.setAttribute("allowfullscreen", "true");
      ifr.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      container.appendChild(ifr);
    } else {
      const vid = document.createElement("video");
      vid.src = parsed.src;
      vid.controls = true;
      vid.autoplay = true;
      vid.playsInline = true;
      vid.style.width = "100%";
      vid.style.maxHeight = "460px";
      vid.style.borderRadius = "8px";
      vid.style.background = "#000";
      container.appendChild(vid);
    }

    modal.classList.add("show");
  }

  function closeVideoModal(){
    const modal = document.getElementById("property-video-modal");
    if(!modal) return;
    modal.classList.remove("show");
    const container = document.getElementById("video-modal-player-container");
    if(container){
      const vid = container.querySelector("video");
      if(vid) vid.pause();
      container.innerHTML = "";
    }
  }

  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-video-prop-id]");
    if(btn){
      e.preventDefault();
      openVideoModal(btn.dataset.videoPropId);
    }
  });

  document.getElementById("video-modal-close")?.addEventListener("click", closeVideoModal);
  document.getElementById("property-video-modal")?.addEventListener("click", (e) => {
    if(e.target === document.getElementById("property-video-modal")) closeVideoModal();
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){
      closeVideoModal();
    }
  });

  // Admin: Add Unit Modal
  const addModal = document.getElementById("admin-property-modal");
  const addForm = document.getElementById("admin-property-form");
  const openAddBtn = document.getElementById("btn-open-add-unit");
  const closeAddBtn = document.getElementById("admin-modal-close");
  const cancelAddBtn = document.getElementById("admin-modal-cancel");

  openAddBtn.addEventListener("click", () => {
    document.getElementById("admin-modal-title").innerText = "إضافة شقة / وحدة جديدة";
    addForm.reset();
    document.getElementById("form-prop-id").value = "";
        setPropImage("");
        setPropVideo("");
    addModal.classList.add("open");
  });

  closeAddBtn.addEventListener("click", () => addModal.classList.remove("open"));
  cancelAddBtn.addEventListener("click", () => addModal.classList.remove("open"));

  // Presets selector
  document.querySelectorAll(".preset-thumb").forEach(thumb => {
    thumb.addEventListener("click", () => {
            setPropImage(thumb.src);
      document.querySelectorAll(".preset-thumb").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("form-prop-id").value;
    const props = getProps();

    const newObj = {
      id: id || "prop_" + Date.now(),
      title: document.getElementById("form-prop-title").value.trim(),
      category: document.getElementById("form-prop-category").value,
      price: document.getElementById("form-prop-price").value.trim(),
      status: document.getElementById("form-prop-status").value,
      location: document.getElementById("form-prop-location").value.trim(),
      area: document.getElementById("form-prop-area").value.trim(),
      rooms: document.getElementById("form-prop-rooms").value.trim(),
      baths: document.getElementById("form-prop-baths").value.trim(),
      badge: document.getElementById("form-prop-badge").value.trim() || (document.getElementById("form-prop-status").value === "sold" ? "تم البيع" : "متاح للحجز"),
      image: document.getElementById("form-prop-image").value.trim(),
      video: (document.getElementById("form-prop-video").value || "").trim()
    };

    if(id){
      const idx = props.findIndex(p => p.id === id);
      if(idx !== -1) props[idx] = newObj;
    } else {
      props.unshift(newObj);
    }

    saveProps(props);
    renderAdminTable();
    renderPublicProperties();
    addModal.classList.remove("open");
    showToast(id ? "تم تعديل الشقة بنجاح!" : "تمت إضافة الشقة الجديدة ونشرها في الموقع فوراً!");
  });

  // ========================================================
  // 3. STUDENT HOUSING SYSTEM (سجل الطلاب والسكن الجامعي — بدون حد أقصى)
  // ========================================================
    const MONTH_KEYS = ["10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const MONTH_LABELS = {
    "10": "ش 10",
    "11": "ش 11",
    "12": "ش 12",
    "1": "ش 1",
    "2": "ش 2",
    "3": "ش 3",
    "4": "ش 4",
    "5": "ش 5",
    "6": "ش 6",
    "7": "ش 7",
    "8": "ش 8",
    "9": "ش 9"
  };

  function getStudents(){ return STUDENTS; }
  function saveStudents(s){ STUDENTS = s; syncTable("students", s); }

  const STUDENT_PAGE = 50;
  let studentPage = 0;
  function renderPager(total, pages){
    const el = document.getElementById("students-pager");
    if(!el) return;
    if(!total){ el.innerHTML = ""; return; }
    if(total <= STUDENT_PAGE){ el.innerHTML = `<span class="pager-info">${total} طالب</span>`; return; }
    el.innerHTML = `<button type="button" class="btn-outline" data-pg="prev" ${studentPage === 0 ? "disabled" : ""}>السابق</button>
      <span class="pager-info">صفحة ${studentPage + 1} من ${pages} — ${total} طالب</span>
      <button type="button" class="btn-outline" data-pg="next" ${studentPage >= pages - 1 ? "disabled" : ""}>التالي</button>`;
  }
  document.getElementById("students-pager")?.addEventListener("click", e => {
    const b = e.target.closest("[data-pg]");
    if(!b || b.disabled) return;
    studentPage += b.dataset.pg === "next" ? 1 : -1;
    renderStudentsTable();
    document.getElementById("student-search-box")?.scrollIntoView({block: "center"});
  });

  // Toggle Month Payment on click
  window.adminToggleStudentMonth = function(studentId, monthKey){
    const list = getStudents();
    const st = list.find(s => s.id === studentId);
    if(!st) return;
    if(!st.months) st.months = {};
    st.months[monthKey] = !st.months[monthKey];
    saveStudents(list);
    renderStudentsTable();
    const statusText = st.months[monthKey] ? "تم تسجيل سداد" : "تم إلغاء سداد";
    showToast(`${statusText} شهر ${monthKey} للطالب: ${esc(st.name)}`);
  };

  // Render Students Table
  function renderStudentsTable(){
    const list = getStudents();
    const tbody = document.getElementById("admin-students-tbody");
    if(!tbody) return;
    tbody.innerHTML = "";

    const searchKeyword = (document.getElementById("student-search-box")?.value || "").trim().toLowerCase();
    const supervisorFilter = document.getElementById("student-supervisor-filter")?.value || "all";
    const buildingFilter = document.getElementById("student-building-filter")?.value || "all";

    const fillOpts = (sel, vals, allLabel) => {
      if(!sel) return;
      const cur = sel.value;
      sel.innerHTML = `<option value="all">${allLabel}</option>` + vals.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
      sel.value = vals.includes(cur) ? cur : "all";
    };
    const uniq = k => Array.from(new Set(list.map(x => String(x[k] != null ? x[k] : "")).filter(Boolean))).sort((a, b) => a.localeCompare(b, "ar"));
    const bList = uniq("building"), sList = uniq("supervisor");
    fillOpts(document.getElementById("student-building-filter"), bList, "جميع العمارات");
    fillOpts(document.getElementById("student-supervisor-filter"), sList, "جميع المشرفين المسؤولين");
    const dl = document.getElementById("supervisor-list");
    if(dl) dl.innerHTML = sList.map(v => `<option value="${esc(v)}">`).join("");

    // Filter list
    const filtered = list.filter(st => {
      if(supervisorFilter !== "all" && st.supervisor !== supervisorFilter) return false;
      if(buildingFilter !== "all" && st.building !== buildingFilter) return false;
      if(searchKeyword){
        const matchName = (st.name || "").toLowerCase().includes(searchKeyword);
        const matchPhone = (st.phone || "").toLowerCase().includes(searchKeyword);
        const matchCity = (st.city || "").toLowerCase().includes(searchKeyword);
        const matchCollege = (st.college || "").toLowerCase().includes(searchKeyword);
        const matchBuilding = (st.building || "").toLowerCase().includes(searchKeyword);
        const matchOwner = (st.owner || "").toLowerCase().includes(searchKeyword);
        if(!matchName && !matchPhone && !matchCity && !matchCollege && !matchBuilding && !matchOwner) return false;
      }
      return true;
    });

    // Update KPIs (based on all students)
    let totalStudents = list.length;
    let totalRent = 0;
    let totalInsurance = 0;
    let totalNotesNum = 0;

    list.forEach(st => {
      const r = parseFloat(st.rent) || 0;
      const ins = parseFloat(st.insurance) || 0;
      totalRent += r;
      totalInsurance += ins;
      const noteNum = parseFloat(String(st.notes || "").replace(/[^\d.]/g, "")) || 0;
      totalNotesNum += noteNum;
    });

    const elTotal = document.getElementById("kpi-students-total");
    const elRent = document.getElementById("kpi-students-rent");
    const elIns = document.getElementById("kpi-students-insurance");
    const elNotes = document.getElementById("kpi-students-notes-total");
    if(elTotal) elTotal.innerText = totalStudents;
    if(elRent) elRent.innerText = totalRent.toLocaleString() + " ج.م";
    if(elIns) elIns.innerText = totalInsurance.toLocaleString() + " ج.م";
    if(elNotes) elNotes.innerText = totalNotesNum.toLocaleString() + " ج.م";

    const pages = Math.max(1, Math.ceil(filtered.length / STUDENT_PAGE));
    if(studentPage >= pages) studentPage = pages - 1;
    const start = studentPage * STUDENT_PAGE;
    const pageItems = filtered.slice(start, start + STUDENT_PAGE);
    renderPager(filtered.length, pages);

    if(filtered.length === 0){
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:32px; color:var(--text-muted);">لا يوجد طلاب مطابقين للبحث. اضغط على "+ إضافة طالب جديد" لإدخال طلابك.</td></tr>`;
      return;
    }

    pageItems.forEach((st, i) => {
      const idx = start + i;
      const tr = document.createElement("tr");

      // Build month badges HTML
      let monthsHtml = '<div class="month-badges-grid">';
      MONTH_KEYS.forEach(m => {
        const isPaid = st.months && st.months[m];
        monthsHtml += `
          <button type="button" class="month-badge-item ${isPaid ? 'paid' : 'unpaid'}" 
                data-admin-action="toggle-student-month" data-student-id="${esc(st.id)}" data-month="${m}"
                title="اضغط لتغيير السداد">
            ${isPaid ? '✓' : '✗'} ${MONTH_LABELS[m]}
          </button>
        `;
      });
      monthsHtml += '</div>';

      const cleanPhone = (st.phone || "").replace(/[^\d]/g, "");
      const waPhone = cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone;

      tr.innerHTML = `
        <td style="font-weight:700; color:var(--text-muted);">${idx + 1}</td>
        <td>
          <strong style="color:#fff; font-size:1.02rem; display:block;">${esc(st.name)}</strong>
          <span style="font-size:0.82rem; color:var(--gold-light); font-family:monospace;">${esc(st.phone)}</span>
        </td>
        <td>
          <div style="font-size:0.9rem; color:#fff;">${esc(st.college || "—")}</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">${esc(st.city || "—")}</div>
        </td>
        <td>
          <strong style="color:var(--gold); display:block;">${esc(st.building || "—")}</strong>
          <span style="font-size:0.85rem; color:#cbd7e6;">${esc(st.apartment || "—")}</span>
        </td>
        <td>
          <div style="font-size:0.85rem; color:#cbd7e6;">${esc(st.address || "—")}</div>
        </td>
        <td>
          <div style="font-size:0.88rem; color:#fff; margin-bottom:4px;">المالك: <b>${esc(st.owner || "—")}</b></div>
          <span class="supervisor-pill">${esc(st.supervisor || "غير محدد")}</span>
        </td>
        <td>
          <div style="font-size:0.95rem; font-weight:700; color:var(--cyan);">${(parseFloat(st.rent)||0).toLocaleString()} ج.م / شهر</div>
          <div style="font-size:0.8rem; color:var(--text-muted);">تأمين: ${(parseFloat(st.insurance)||0).toLocaleString()} ج.م</div>
        </td>
        <td>
          ${st.notes ? `<span class="notes-pill">${esc(st.notes)}</span>` : '<span style="color:var(--text-muted); font-size:0.8rem;">—</span>'}
        </td>
        <td>
          ${monthsHtml}
        </td>
        <td>
          <div class="action-group">
            <a href="https://wa.me/${waPhone}" target="_blank" rel="noopener" class="btn-wa-sm" title="محادثة واتساب سريعة">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
            <a href="tel:${cleanPhone}" class="btn-tel-sm" title="اتصال هاتفي">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
            <button class="btn-icon" type="button" data-admin-action="edit-student" data-student-id="${esc(st.id)}" title="تعديل بيانات الطالب">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon delete" type="button" data-admin-action="delete-student" data-student-id="${esc(st.id)}" title="حذف الطالب">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Edit Student
  window.adminEditStudent = function(id){
    const list = getStudents();
    const st = list.find(s => s.id === id);
    if(!st) return;

    document.getElementById("admin-student-modal-title").innerText = "تعديل بيانات الطالب";
    document.getElementById("form-student-id").value = st.id;
    document.getElementById("form-student-name").value = st.name;
    document.getElementById("form-student-phone").value = st.phone;
    document.getElementById("form-student-city").value = st.city || "";
    document.getElementById("form-student-college").value = st.college || "";
    document.getElementById("form-student-building").value = st.building;
    document.getElementById("form-student-apartment").value = st.apartment;
    document.getElementById("form-student-address").value = st.address || "";
    document.getElementById("form-student-owner").value = st.owner || "";
    document.getElementById("form-student-supervisor").value = st.supervisor || "";
    document.getElementById("form-student-rent").value = st.rent;
    document.getElementById("form-student-insurance").value = st.insurance || "";
    document.getElementById("form-student-notes").value = st.notes || "";

    document.getElementById("admin-student-modal").classList.add("open");
  };

  // Delete Student (مؤمن بكلمة سر لوحة التحكم في فايربيس)
  window.adminDeleteStudent = function(id){
    const st = getStudents().find(s => s.id === id);
    const name = st && st.name ? `الطالب "${st.name}"` : "هذا الطالب";
    requestDeleteWithPassword(`هل أنت متأكد من رغبتك في حذف ${name} من السجل نهائياً؟`, () => {
      let list = getStudents();
      list = list.filter(s => s.id !== id);
      saveStudents(list);
      renderStudentsTable();
      showToast("تم حذف الطالب من السجل بنجاح بعد التحقق من كلمة السر!");
    });
  };

  // Student Search and Filter listeners
  let searchT;
  const resetRender = () => { studentPage = 0; renderStudentsTable(); };
  document.getElementById("student-search-box")?.addEventListener("input", () => { clearTimeout(searchT); searchT = setTimeout(resetRender, 200); });
  document.getElementById("student-supervisor-filter")?.addEventListener("change", resetRender);
  document.getElementById("student-building-filter")?.addEventListener("change", resetRender);

  // Student Modal Elements & Event Listeners
  const studentModal = document.getElementById("admin-student-modal");
  const studentForm = document.getElementById("admin-student-form");
  const openAddStudentBtn = document.getElementById("btn-open-add-student");
  const closeStudentBtn = document.getElementById("admin-student-modal-close");
  const cancelStudentBtn = document.getElementById("admin-student-modal-cancel");

  if(openAddStudentBtn){
    openAddStudentBtn.addEventListener("click", () => {
      document.getElementById("admin-student-modal-title").innerText = "إضافة طالب / ساكن جديد";
      studentForm.reset();
      document.getElementById("form-student-id").value = "";
      studentModal.classList.add("open");
    });
  }

  if(closeStudentBtn) closeStudentBtn.addEventListener("click", () => studentModal.classList.remove("open"));
  if(cancelStudentBtn) cancelStudentBtn.addEventListener("click", () => studentModal.classList.remove("open"));

  // Student Form Submit
  if(studentForm){
    studentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("form-student-id").value;
      const list = getStudents();

      const newStudent = {
        id: id || "std_" + Date.now(),
        name: document.getElementById("form-student-name").value.trim(),
        phone: document.getElementById("form-student-phone").value.trim(),
        city: document.getElementById("form-student-city").value.trim(),
        college: document.getElementById("form-student-college").value.trim(),
        building: document.getElementById("form-student-building").value.trim(),
        apartment: document.getElementById("form-student-apartment").value.trim(),
        address: document.getElementById("form-student-address").value.trim(),
        owner: document.getElementById("form-student-owner").value.trim(),
        supervisor: document.getElementById("form-student-supervisor").value,
        rent: parseFloat(document.getElementById("form-student-rent").value) || 0,
        insurance: parseFloat(document.getElementById("form-student-insurance").value) || 0,
        notes: document.getElementById("form-student-notes").value.trim(),
        months: {}
      };

      if(id){
        const idx = list.findIndex(s => s.id === id);
        if(idx !== -1){
          newStudent.months = list[idx].months || {};
          list[idx] = newStudent;
        }
      } else {
        MONTH_KEYS.forEach(m => { newStudent.months[m] = false; });
        list.unshift(newStudent);
      }

      saveStudents(list);
      renderStudentsTable();
      studentModal.classList.remove("open");
      showToast(id ? "تم حفظ وتعديل بيانات الطالب بنجاح!" : "تمت إضافة الطالب الجديد إلى السجل بنجاح!");
    });
  }

  // Clear All Students (مؤمن بكلمة سر لوحة التحكم في فايربيس)
  document.getElementById("btn-clear-all-students")?.addEventListener("click", () => {
    requestDeleteWithPassword("تحذير أمني شديد جداً: هل أنت متأكد من رغبتك في مسح كافة الطلاب المسجلين بالكامل من السجل؟", () => {
      saveStudents([]);
      renderStudentsTable();
      showToast("تم مسح جميع بيانات الطلاب بنجاح بعد التحقق من كلمة السر!");
    });
  });


  // Export to Excel (CSV with UTF-8 BOM)
  document.getElementById("btn-export-students-excel")?.addEventListener("click", () => {
    const list = getStudents();
    if(list.length === 0){
      alert("لا يوجد طلاب مسجلين لتصديرهم!");
      return;
    }

    let csv = "\uFEFFم,اسم الطالب,رقم الموبايل,البلد,الكلية,العمارة,الشقة والدور,العنوان,المالك,المشرف المسؤول,الإيجار الشهري,التأمين,الملاحظات,ش 10,ش 11,ش 12,ش 1,ش 2,ش 3,ش 4,ش 5,ش 6,ش 7\n";

    list.forEach((st, i) => {
      const row = [
        i + 1,
        `"${(st.name||'').replace(/"/g, '""')}"`,
        `"${(st.phone||'').replace(/"/g, '""')}"`,
        `"${(st.city||'').replace(/"/g, '""')}"`,
        `"${(st.college||'').replace(/"/g, '""')}"`,
        `"${(st.building||'').replace(/"/g, '""')}"`,
        `"${(st.apartment||'').replace(/"/g, '""')}"`,
        `"${(st.address||'').replace(/"/g, '""')}"`,
        `"${(st.owner||'').replace(/"/g, '""')}"`,
        `"${(st.supervisor||'').replace(/"/g, '""')}"`,
        st.rent || 0,
        st.insurance || 0,
        `"${(st.notes||'').replace(/"/g, '""')}"`,
        st.months && st.months["10"] ? "مدفوع" : "متبقي",
        st.months && st.months["11"] ? "مدفوع" : "متبقي",
        st.months && st.months["12"] ? "مدفوع" : "متبقي",
        st.months && st.months["1"] ? "مدفوع" : "متبقي",
        st.months && st.months["2"] ? "مدفوع" : "متبقي",
        st.months && st.months["3"] ? "مدفوع" : "متبقي",
        st.months && st.months["4"] ? "مدفوع" : "متبقي",
        st.months && st.months["5"] ? "مدفوع" : "متبقي",
        st.months && st.months["6"] ? "مدفوع" : "متبقي",
        st.months && st.months["7"] ? "مدفوع" : "متبقي",
        st.months && st.months["8"] ? "مدفوع" : "متبقي",
        st.months && st.months["9"] ? "مدفوع" : "متبقي"
      ];
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `سجل_طلاب_كيان_سيتي_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("تم تصدير ملف الإكسيل بنجاح!");
  });

  // 4. Ads Manager in Admin
  const adminAdEnabled = document.getElementById("admin-ad-enabled");
  const adminAdText = document.getElementById("admin-ad-text");
  const adminAdTag = document.getElementById("admin-ad-tag");
  const adminAdBtnText = document.getElementById("admin-ad-btn-text");
  const btnSaveAd = document.getElementById("btn-save-ad");
  const btnDeleteAd = document.getElementById("btn-delete-ad");
  const adPreviewBox = document.getElementById("admin-ad-preview-box");
  const adPreviewText = document.getElementById("admin-ad-preview-text");
  const adPreviewBtn = document.getElementById("admin-ad-preview-btn");

  function loadAdminAd(){
    const a = getAd();
    adminAdEnabled.checked = a.enabled || false;
    adminAdText.value = a.text || "";
    adminAdTag.value = a.tag || "";
    adminAdBtnText.value = a.btnText || "";
    updateAdPreview();
  }

  function updateAdPreview(){
    adPreviewText.innerText = adminAdText.value || "اكتب نص الإعلان الذي تريده...";
    adPreviewBtn.innerText = adminAdBtnText.value || "احجز الآن";
    adPreviewBox.style.display = (adminAdEnabled.checked && adminAdText.value.trim() !== "") ? "flex" : "none";
  }

  adminAdText.addEventListener("input", updateAdPreview);
  adminAdBtnText.addEventListener("input", updateAdPreview);
  adminAdEnabled.addEventListener("change", updateAdPreview);

  btnSaveAd.addEventListener("click", () => {
    const a = {
      enabled: adminAdEnabled.checked,
      text: adminAdText.value.trim(),
      tag: adminAdTag.value.trim(),
      btnText: adminAdBtnText.value.trim()
    };
    saveAd(a);
    renderPublicAd();
    showToast("تم حفظ الإعلان ونشره بالموقع بنجاح!");
  });

  if(btnDeleteAd){
    btnDeleteAd.addEventListener("click", () => {
      requestDeleteWithPassword("هل تريد بالتأكيد حذف شريط الإعلان وإلغاء تفعيله تماماً من الموقع؟", () => {
        adminAdEnabled.checked = false;
        adminAdText.value = "";
        adminAdTag.value = "";
        adminAdBtnText.value = "";
        saveAd({
          enabled: false,
          text: "",
          tag: "",
          btnText: ""
        });
        localStorage.removeItem("kayan_ad_banner");
        renderPublicAd();
        updateAdPreview();
        showToast("تم حذف وإلغاء الإعلان بنجاح بعد التحقق من كلمة السر!");
      });
    });
  }

  // Admin Tabs Navigation
  const adminTabBtns = document.querySelectorAll(".admin-tab-btn");
  const adminTabPanes = document.querySelectorAll(".admin-tab-pane");
  const adminPageTitle = document.getElementById("admin-page-title");

  const adminTitles = {
    "admin-tab-units": "إدارة الشقق والوحدات المعروضة",
    "admin-tab-students": "سجل الطلاب والسكن الجامعي",
    "admin-tab-ads": "نظام الإعلانات والعروض الترويجية",
    "admin-tab-requests": "طلبات الحجز واستفسارات العملاء",
    "admin-tab-stats": "الإحصائيات والمبيعات"
  };

  adminTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-admin-tab");
      adminTabBtns.forEach(b => b.classList.remove("active"));
      adminTabPanes.forEach(p => p.style.display = "none");
      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if(targetPane) targetPane.style.display = "block";
      adminPageTitle.innerText = adminTitles[targetId] || "لوحة التحكم";
      if(targetId === "admin-tab-students") renderStudentsTable();
      if(targetId === "admin-tab-units") renderAdminTable();
      if(targetId === "admin-tab-requests") renderRequestsTable();
    });
  });

  // 5. Authentication & Open/Close Admin Dashboard
  const floatTrigger = document.getElementById("floating-admin-trigger");
  const passcodeModal = document.getElementById("admin-passcode-modal");
  const passcodeForm = document.getElementById("passcode-form");
  const passcodeInput = document.getElementById("passcode-input");
  const passcodeCancel = document.getElementById("passcode-cancel");
  const passcodeErr = document.getElementById("passcode-err");

  const adminPanel = document.getElementById("integrated-admin-panel");
  const returnSiteBtn = document.getElementById("btn-return-site");
  const logoutPanelBtn = document.getElementById("btn-logout-panel");

  async function openDashboard(){
    if(!auth || !(await refreshAdminState(auth.currentUser))){
      showToast("غير مصرح لك بالدخول إلى لوحة التحكم.");
      return;
    }
    adminPanel.classList.add("open");
    document.body.style.overflow = "hidden";
    renderAdminTable();
    loadAdminAd();
    try { await loadStudents(); } catch(e){ console.error(e); showToast("تعذر تحميل سجل الطلاب: " + (e.message || "")); }
    renderStudentsTable();
    try { await loadRequests(); } catch(e){ console.error(e); }
    renderRequestsTable();
  }

  function closeDashboard(){
    adminPanel.classList.remove("open");
    document.body.style.overflow = "auto";
    renderPublicProperties();
    renderPublicAd();
  }

  function triggerLoginPrompt(){
    if(isAdmin){
      openDashboard();
    } else {
      passcodeModal.classList.add("show");
      passcodeInput.value = "";
      passcodeErr.style.display = "none";
      setTimeout(() => passcodeInput.focus(), 150);
    }
  }

  if(floatTrigger){
    floatTrigger.addEventListener("click", triggerLoginPrompt);
  }

  if(passcodeCancel){
    passcodeCancel.addEventListener("click", () => {
      passcodeModal.classList.remove("show");
    });
  }

  if(passcodeModal){
    passcodeModal.addEventListener("click", (e) => {
      if(e.target === passcodeModal) passcodeModal.classList.remove("show");
    });
  }

  // ========================================================
  // نظام الحماية ضد الهجمات والتخمين وحقن البيانات (Anti-Brute Force & Anti-Injection)
  // ========================================================
  const STORAGE_LOCKOUT_KEY = "kayan_sec_lockout_until";
  const STORAGE_ATTEMPTS_KEY = "kayan_sec_failed_attempts";

  function getLockoutRemaining(){
    const until = parseInt(localStorage.getItem(STORAGE_LOCKOUT_KEY) || "0", 10);
    const now = Date.now();
    return until > now ? Math.ceil((until - now) / 1000) : 0;
  }

  function recordFailedLogin(){
    let count = parseInt(localStorage.getItem(STORAGE_ATTEMPTS_KEY) || "0", 10) + 1;
    localStorage.setItem(STORAGE_ATTEMPTS_KEY, String(count));
    if(count >= 10){
      const lockSeconds = 15 * 60; // 15 دقيقة بعد 10 محاولات
      localStorage.setItem(STORAGE_LOCKOUT_KEY, String(Date.now() + lockSeconds * 1000));
      return lockSeconds;
    } else if(count >= 5){
      const lockSeconds = 60; // دقيقة واحدة بعد 5 محاولات
      localStorage.setItem(STORAGE_LOCKOUT_KEY, String(Date.now() + lockSeconds * 1000));
      return lockSeconds;
    }
    return 0;
  }

  function clearLockout(){
    localStorage.removeItem(STORAGE_ATTEMPTS_KEY);
    localStorage.removeItem(STORAGE_LOCKOUT_KEY);
  }

  function validateAndSanitizePass(raw){
    if(typeof raw !== "string") return { valid: false, message: "صيغة الرقم السري غير صالحة" };
    const clean = raw.trim();
    if(clean.includes("\0")){
      return { valid: false, message: "تم اكتشاف رموز غير مسموح بها أمنياً" };
    }
    if(clean.length < 6){
      return { valid: false, message: "الرقم السري يجب ألا يقل عن 6 خانات" };
    }
    if(clean.length > 128){
      return { valid: false, message: "الرقم السري طويل جداً، غير مسموح به" };
    }
    return { valid: true, pass: clean };
  }

  let lockoutTimer = null;
  function updateLockoutUI(){
    const remaining = getLockoutRemaining();
    if(remaining > 0){
      if(passcodeErr){
        passcodeErr.textContent = `⚠️ تم حظر المحاولات مؤقتاً لحماية اللوحة من هجمات التخمين. يرجى الانتظار (${remaining}) ثانية.`;
        passcodeErr.style.display = "block";
      }
      const submitBtn = passcodeForm?.querySelector('button[type="submit"]');
      if(submitBtn) submitBtn.disabled = true;
      if(passcodeInput) passcodeInput.disabled = true;

      clearInterval(lockoutTimer);
      lockoutTimer = setInterval(() => {
        const rem = getLockoutRemaining();
        if(rem <= 0){
          clearInterval(lockoutTimer);
          if(passcodeErr) passcodeErr.style.display = "none";
          if(submitBtn) submitBtn.disabled = false;
          if(passcodeInput) {
            passcodeInput.disabled = false;
            passcodeInput.focus();
          }
        } else {
          if(passcodeErr){
            passcodeErr.textContent = `⚠️ تم حظر المحاولات مؤقتاً لحماية اللوحة من هجمات التخمين. يرجى الانتظار (${rem}) ثانية.`;
          }
        }
      }, 1000);
      return true;
    }
    return false;
  }

  if(passcodeForm){
    passcodeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = passcodeForm.querySelector('button[type="submit"]');
      const fail = (m) => { passcodeErr.textContent = m; passcodeErr.style.display = "block"; };

      if(updateLockoutUI()) return;
      if(!auth) return fail("قاعدة البيانات غير مربوطة بعد — أضف إعدادات Firebase في أول السكريبت (KAYAN_CONFIG.FIREBASE).");

      const validation = validateAndSanitizePass(passcodeInput.value);
      if(!validation.valid){
        return fail(validation.message);
      }
      const pass = validation.pass;
      btn.disabled = true;
      const explain = (err) => {
        const c = (err && err.code) || "";
        if(c === "auth/network-request-failed") return "تعذر الاتصال بالإنترنت، حاول مرة أخرى";
        if(c === "auth/operation-not-allowed") return "فعّل Email/Password من Firebase: Authentication > Sign-in method";
        if(c === "auth/too-many-requests") return "محاولات كثيرة، انتظر قليلاً ثم حاول مجدداً";
        if(c === "auth/operation-not-supported-in-this-environment") return "افتح الموقع من رابط الاستضافة (https) وليس من الملف مباشرة";
        if(c === "auth/weak-password") return "الرقم السري لازم يكون 6 خانات على الأقل";
        if(c === "auth/api-key-not-valid" || c === "auth/invalid-api-key") return "مفتاح Firebase غير صحيح";
        return "تعذر الدخول (" + (c || "خطأ غير معروف") + ")";
      };
      try {
        await auth.signInWithEmailAndPassword(CFG.ADMIN_EMAIL, pass);
      } catch(err){
        btn.disabled = false;
        const c = (err && err.code) || "";
        if(c === "auth/invalid-credential" || c === "auth/user-not-found" || c === "auth/wrong-password" || c === "auth/invalid-login-credentials"){
          try {
            await auth.createUserWithEmailAndPassword(CFG.ADMIN_EMAIL, pass);
          } catch(e2){
            btn.disabled = false;
            recordFailedLogin();
            updateLockoutUI();
            if(e2 && e2.code === "auth/email-already-in-use") return fail("الرقم السري غير صحيح. يمكنك تعيين كلمة سر لحساب " + CFG.ADMIN_EMAIL + " من Firebase > Authentication");
            return fail(explain(e2));
          }
        } else {
          recordFailedLogin();
          updateLockoutUI();
          return fail(explain(err));
        }
      }
      if(!(await refreshAdminState(auth.currentUser))){
        await auth.signOut();
        btn.disabled = false;
        return fail("هذا الحساب غير مصرح له بالدخول إلى لوحة التحكم.");
      }
      clearLockout();
      btn.disabled = false;
      passcodeInput.value = "";
      passcodeErr.style.display = "none";
      passcodeModal.classList.remove("show");
      openDashboard();
      showToast("مرحباً بك في لوحة تحكم كيان سيتي!");
    });
  }

  // ===== 6. تأكيد الحذف بكلمة سر لوحة التحكم في فايربيس =====
  const deleteModal = document.getElementById("admin-delete-modal");
  const deleteModalForm = document.getElementById("delete-modal-form");
  const deleteModalInput = document.getElementById("delete-modal-passcode");
  const deleteModalMsg = document.getElementById("delete-modal-msg");
  const deleteModalErr = document.getElementById("delete-modal-err");
  const deleteModalCancel = document.getElementById("delete-modal-cancel");
  const deleteModalSubmit = document.getElementById("delete-modal-submit");
  let pendingDeleteAction = null;

  function requestDeleteWithPassword(message, onConfirmAction){
    pendingDeleteAction = onConfirmAction;
    if(deleteModalMsg) deleteModalMsg.textContent = message || "هل أنت متأكد من الحذف؟";
    if(deleteModalInput) deleteModalInput.value = "";
    if(deleteModalErr) deleteModalErr.style.display = "none";
    if(deleteModalSubmit){
      deleteModalSubmit.disabled = false;
      deleteModalSubmit.textContent = "تأكيد الحذف نهائياً";
    }
    if(deleteModal) deleteModal.classList.add("show");
    setTimeout(() => { if(deleteModalInput) deleteModalInput.focus(); }, 150);
  }

  function closeDeleteModal(){
    if(deleteModal) deleteModal.classList.remove("show");
    pendingDeleteAction = null;
  }

  if(deleteModalCancel){
    deleteModalCancel.addEventListener("click", closeDeleteModal);
  }
  if(deleteModal){
    deleteModal.addEventListener("click", (e) => {
      if(e.target === deleteModal) closeDeleteModal();
    });
  }

  if(deleteModalForm){
    deleteModalForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const validation = validateAndSanitizePass(deleteModalInput.value);
      if(!validation.valid){
        deleteModalErr.textContent = validation.message;
        deleteModalErr.style.display = "block";
        return;
      }
      const pass = validation.pass;
      deleteModalSubmit.disabled = true;
      deleteModalSubmit.textContent = "جارٍ التحقق من كلمة السر...";

      try {
        if(!auth || !firebase.auth){
          throw new Error("قاعدة البيانات غير مربوطة");
        }
        const cred = firebase.auth.EmailAuthProvider.credential(CFG.ADMIN_EMAIL, pass);
        if(auth.currentUser){
          await auth.currentUser.reauthenticateWithCredential(cred);
        } else {
          await auth.signInWithEmailAndPassword(CFG.ADMIN_EMAIL, pass);
        }

        deleteModalSubmit.disabled = false;
        deleteModalSubmit.textContent = "تأكيد الحذف نهائياً";
        const actionToRun = pendingDeleteAction;
        closeDeleteModal();
        if(typeof actionToRun === "function"){
          await actionToRun();
        }
      } catch(err){
        deleteModalSubmit.disabled = false;
        deleteModalSubmit.textContent = "تأكيد الحذف نهائياً";
        deleteModalErr.textContent = "الرقم السري غير صحيح! تعذر إجراء الحذف.";
        deleteModalErr.style.display = "block";
        if(deleteModalInput){
          deleteModalInput.focus();
          deleteModalInput.select();
        }
      }
    });
  }

  // Mobile Navbar Drawer Toggle
  const navMobileToggle = document.getElementById("nav-mobile-toggle");
  const mainNavLinks = document.getElementById("main-nav-links");
  if(navMobileToggle && mainNavLinks){
    navMobileToggle.addEventListener("click", () => {
      const open = mainNavLinks.classList.toggle("mobile-open");
      navMobileToggle.classList.toggle("active", open);
    });
    mainNavLinks.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        mainNavLinks.classList.remove("mobile-open");
        navMobileToggle.classList.remove("active");
      });
    });
  }

  // Return to public site
  if(returnSiteBtn){
    returnSiteBtn.addEventListener("click", closeDashboard);
  }

  // Lock and logout
  if(logoutPanelBtn){
    logoutPanelBtn.addEventListener("click", () => {
      isAdmin = false; STUDENTS = []; snaps.students = new Map(); if(auth) auth.signOut();
      closeDashboard();
      showToast("تم قفل لوحة التحكم بنجاح.");
    });
  }

  // Delegated handlers keep user data out of executable inline attributes.
  document.getElementById("admin-props-tbody")?.addEventListener("change", (e) => {
    const select = e.target.closest('[data-admin-action="change-property-status"]');
    if(select) window.adminChangeStatus(select.dataset.propertyId, select.value);
  });

  document.getElementById("admin-props-tbody")?.addEventListener("click", (e) => {
    const control = e.target.closest("[data-admin-action]");
    if(!control) return;
    if(control.dataset.adminAction === "edit-property") window.adminEditProp(control.dataset.propertyId);
    if(control.dataset.adminAction === "delete-property") window.adminDeleteProp(control.dataset.propertyId);
  });

  document.getElementById("admin-students-tbody")?.addEventListener("click", (e) => {
    const control = e.target.closest("[data-admin-action]");
    if(!control) return;
    if(control.dataset.adminAction === "toggle-student-month") window.adminToggleStudentMonth(control.dataset.studentId, control.dataset.month);
    if(control.dataset.adminAction === "edit-student") window.adminEditStudent(control.dataset.studentId);
    if(control.dataset.adminAction === "delete-student") window.adminDeleteStudent(control.dataset.studentId);
  });

  // ========================================================
  // 5. BOOKING REQUESTS SYSTEM (نظام طلبات الحجز والعملاء وقاعدة البيانات)
  // ========================================================
  function getRequests(){ return REQUESTS; }
  function saveRequests(r){ REQUESTS = r; syncTable("requests", r); }

  async function loadRequests(){
    if(!db) return;
    try {
      REQUESTS = await fetchAll("requests");
      setSnap("requests", REQUESTS);
      renderRequestsTable();
    } catch(e){
      console.warn("Requests load error:", e);
    }
  }

  function formatDateTime(ts){
    if(!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleDateString("ar-EG", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
  }

  function buildRequestWhatsAppText(req, idx){
    const dStr = req.createdAt ? new Date(req.createdAt).toLocaleString("ar-EG") : "";
    const num = req.orderNum || (req.id && /^req_\d+$/.test(req.id) ? req.id.replace("req_", "") : (idx != null ? (idx + 1) : ""));
    return encodeURIComponent(
      `السلام عليكم، تفاصيل طلب حجز جديد عبر موقع كيان سيتي:\n` +
      `👤 اسم العميل: ${req.name || ""}\n` +
      `📱 الهاتف: ${req.phone || ""}\n` +
      `🏢 نوع الطلب: ${req.type || ""}\n` +
      (req.notes ? `📝 تفاصيل إضافية: ${req.notes}\n` : '') +
      (dStr ? `⏰ تاريخ الطلب: ${dStr}\n` : '') +
      (num ? `🔢 رقم الطلب: #${num}` : '')
    );
  }

  function updateRequestsBadge(){
    const badge = document.getElementById("admin-requests-badge");
    if(!badge) return;
    const newCount = REQUESTS.filter(r => !r.status || r.status === "new").length;
    if(newCount > 0){
      badge.textContent = newCount;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  function renderRequestsTable(){
    const tbody = document.getElementById("admin-requests-tbody");
    if(!tbody) return;
    tbody.innerHTML = "";

    const search = (document.getElementById("requests-search-box")?.value || "").toLowerCase().trim();
    const statusFilter = document.getElementById("requests-status-filter")?.value || "all";

    let filtered = REQUESTS.filter(r => {
      const matchSearch = !search ||
        (r.name && r.name.toLowerCase().includes(search)) ||
        (r.phone && r.phone.includes(search)) ||
        (r.type && r.type.toLowerCase().includes(search));
      const rStatus = r.status || "new";
      const matchStatus = statusFilter === "all" || rStatus === statusFilter;
      return matchSearch && matchStatus;
    });

    const totalEl = document.getElementById("kpi-total-requests");
    const newEl = document.getElementById("kpi-new-requests");
    const contactedEl = document.getElementById("kpi-contacted-requests");
    if(totalEl) totalEl.textContent = REQUESTS.length;
    if(newEl) newEl.textContent = REQUESTS.filter(r => !r.status || r.status === "new").length;
    if(contactedEl) contactedEl.textContent = REQUESTS.filter(r => r.status === "contacted" || r.status === "booked").length;
    updateRequestsBadge();

    if(filtered.length === 0){
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:36px; color:var(--text-muted); font-size:1.05rem;">لا توجد أي طلبات واردة حالياً</td></tr>`;
      return;
    }

    filtered.forEach((req, idx) => {
      const tr = document.createElement("tr");
      const cleanPhone = (req.phone || "").replace(/[^\d]/g, "");
      const waPhone = cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone;
      const status = req.status || "new";
      const reqNum = req.orderNum || (req.id && /^req_\d+$/.test(req.id) ? req.id.replace("req_", "") : (idx + 1));
      const encodedMsg = buildRequestWhatsAppText(req, idx);
      const reqDate = req.createdAt || (created["requests"] ? created["requests"].get(req.id) : null);

      tr.innerHTML = `
        <td style="font-weight:700; color:var(--text-muted);">${idx + 1}</td>
        <td>
          <div style="font-weight:600; color:#fff; font-size:0.9rem;">${formatDateTime(reqDate)}</div>
          <span style="font-size:0.8rem; color:var(--gold-light); font-weight:700;">طلب #${esc(reqNum)}</span>
        </td>
        <td>
          <strong style="color:var(--gold-light); font-size:1rem; display:block;">${esc(req.name || "عميل")}</strong>
          <span style="font-size:0.85rem; color:#cbd7e6; font-family:monospace;" dir="ltr">${esc(req.phone || "—")}</span>
        </td>
        <td>
          <div style="font-weight:600; color:#fff; font-size:0.92rem;">${esc(req.type || "معاينة")}</div>
          ${req.notes ? `<div style="font-size:0.82rem; color:var(--text-muted); margin-top:4px;">${esc(req.notes)}</div>` : ''}
        </td>
        <td>
          <div class="team-forward-grid" style="display:flex; gap:6px; flex-wrap:wrap;">
            <a href="https://wa.me/201017006541?text=${encodedMsg}" target="_blank" rel="noopener" class="btn-sm wa" style="padding:4px 8px; font-size:0.78rem;" title="تحويل واتساب إلى م. مصطفى طلعت">
              <span>م. مصطفى</span>
            </a>
            <a href="https://wa.me/201091048919?text=${encodedMsg}" target="_blank" rel="noopener" class="btn-sm wa" style="padding:4px 8px; font-size:0.78rem;" title="تحويل واتساب إلى أ. أحمد ناصر">
              <span>أ. أحمد</span>
            </a>
            <a href="https://wa.me/201029105138?text=${encodedMsg}" target="_blank" rel="noopener" class="btn-sm wa" style="padding:4px 8px; font-size:0.78rem;" title="تحويل واتساب إلى أ. عمرو جلال">
              <span>أ. عمرو</span>
            </a>
            <a href="https://wa.me/201070451554?text=${encodedMsg}" target="_blank" rel="noopener" class="btn-sm wa" style="padding:4px 8px; font-size:0.78rem;" title="تحويل واتساب إلى أ. عمر قاسم">
              <span>أ. عمر</span>
            </a>
          </div>
        </td>
        <td>
          <select class="req-status-select status-${status}" data-req-action="change-status" data-req-id="${esc(req.id)}" style="background:rgba(255,255,255,0.08); border:1px solid var(--border-subtle); color:#fff; padding:6px 10px; border-radius:6px; font-size:0.85rem; font-family:inherit; cursor:pointer;">
            <option value="new" ${status === 'new' ? 'selected' : ''}>جديد 🔴</option>
            <option value="contacted" ${status === 'contacted' ? 'selected' : ''}>تم التواصل 🟢</option>
            <option value="booked" ${status === 'booked' ? 'selected' : ''}>تم الحجز 🟡</option>
            <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>ملغي ⚪</option>
          </select>
        </td>
        <td>
          <div class="action-group">
            <a href="https://wa.me/${waPhone}" target="_blank" rel="noopener" class="btn-wa-sm" title="واتساب مباشر مع العميل">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
            <a href="tel:${cleanPhone}" class="btn-tel-sm" title="اتصال هاتفي بالعميل">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </a>
            <button class="btn-icon delete" type="button" data-req-action="delete-request" data-req-id="${esc(req.id)}" title="حذف الطلب">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Requests Table Listeners
  document.getElementById("admin-requests-tbody")?.addEventListener("change", (e) => {
    const sel = e.target.closest('[data-req-action="change-status"]');
    if(!sel) return;
    const reqId = sel.dataset.reqId;
    const newStatus = sel.value;
    const list = getRequests();
    const item = list.find(r => r.id === reqId);
    if(item){
      item.status = newStatus;
      saveRequests(list);
      updateRequestsBadge();
      showToast("تم تحديث حالة الطلب بنجاح!");
    }
  });

  document.getElementById("admin-requests-tbody")?.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-req-action="delete-request"]');
    if(!btn) return;
    const reqId = btn.dataset.reqId;
    const item = getRequests().find(r => r.id === reqId);
    const label = item && item.name ? `طلب العميل "${item.name}"` : "هذا الطلب";
    requestDeleteWithPassword(`هل أنت متأكد من حذف ${label} نهائياً؟`, () => {
      let list = getRequests().filter(r => r.id !== reqId);
      saveRequests(list);
      renderRequestsTable();
      showToast("تم حذف الطلب بنجاح بعد التحقق من كلمة السر!");
    });
  });

  document.getElementById("btn-clear-all-requests")?.addEventListener("click", () => {
    requestDeleteWithPassword("تحذير: هل أنت متأكد من مسح جميع طلبات الحجز والاستفسارات الواردة؟", () => {
      saveRequests([]);
      renderRequestsTable();
      showToast("تم مسح كافة الطلبات بنجاح!");
    });
  });

  document.getElementById("requests-search-box")?.addEventListener("input", () => renderRequestsTable());
  document.getElementById("requests-status-filter")?.addEventListener("change", () => renderRequestsTable());

  // Public Booking Form Handler
  const bookingForm = document.getElementById("booking-request-form");
  const bookingSuccessModal = document.getElementById("booking-success-modal");
  const bookingSuccessClose = document.getElementById("booking-success-close");

  if(bookingSuccessClose && bookingSuccessModal){
    bookingSuccessClose.addEventListener("click", () => {
      bookingSuccessModal.classList.remove("show");
    });
    bookingSuccessModal.addEventListener("click", (e) => {
      if(e.target === bookingSuccessModal) bookingSuccessModal.classList.remove("show");
    });
  }

  if(bookingForm){
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("booking-submit-btn");

      // 1. فحص مصيدة البوتات الخفية (Honeypot Anti-Bot Protection)
      const hp = document.getElementById("booking-hp");
      if(hp && hp.value.trim() !== ""){
        console.warn("Spam bot submission blocked via honeypot.");
        if(submitBtn) submitBtn.disabled = false;
        localStorage.setItem("kayan_sec_last_booking_submit", String(Date.now()));
      bookingForm.reset();
        return;
      }

      // 2. نظام منع الإغراق وتكرار الطلبات (Anti-Flood / Anti-DDoS Rate Limiting)
      const LAST_REQ_KEY = "kayan_sec_last_booking_submit";
      const lastSubmit = parseInt(localStorage.getItem(LAST_REQ_KEY) || "0", 10);
      const now = Date.now();
      if(now - lastSubmit < 25000){
        const wait = Math.ceil((25000 - (now - lastSubmit)) / 1000);
        alert(`يرجى الانتظار (${wait}) ثانية قبل إرسال طلب جديد لمنع التكرار والإغراق.`);
        if(submitBtn) submitBtn.disabled = false;
        return;
      }

      const name = (document.getElementById("booking-name")?.value || "").trim();
      const phone = (document.getElementById("booking-phone")?.value || "").trim();
      const type = document.getElementById("booking-type")?.value || "معاينة وحجز شقة مفروشة";
      const rawNotes = (document.getElementById("booking-notes")?.value || "").trim();

      // 3. التحقق الصارم من صحة المدخلات ومنع الحقن (Input Validation & Anti-Injection)
      if(!name || name.length < 2 || name.length > 80){
        alert("يرجى إدخال اسم صحيح يتراوح بين 2 و 80 حرفاً.");
        if(submitBtn) submitBtn.disabled = false;
        return;
      }

      const cleanPhoneDigits = phone.replace(/[^\d+]/g, "");
      if(cleanPhoneDigits.length < 10 || cleanPhoneDigits.length > 20){
        alert("يرجى إدخال رقم هاتف صحيح ومكتمل.");
        if(submitBtn) submitBtn.disabled = false;
        return;
      }

      const notes = rawNotes.slice(0, 500);

      if(submitBtn){
        submitBtn.disabled = true;
        submitBtn.textContent = "جارٍ حفظ وإرسال الطلب...";
      }

      let reqNum = 1;
      if(db){
        try {
          const txRes = await db.ref("request_counter").transaction(current => {
            return (current || 0) + 1;
          });
          if(txRes && txRes.committed && txRes.snapshot && txRes.snapshot.val() != null){
            reqNum = txRes.snapshot.val();
          } else {
            const fallbackSnap = await db.ref("request_counter").get();
            if(fallbackSnap && fallbackSnap.exists() && fallbackSnap.val()){
              reqNum = fallbackSnap.val();
            }
          }
        } catch(e){
          console.warn("Counter transaction failed, falling back:", e);
          const localCount = parseInt(localStorage.getItem("kayan_local_req_counter") || "0", 10) + 1;
          localStorage.setItem("kayan_local_req_counter", String(localCount));
          reqNum = localCount;
        }
      } else {
        const localCount = parseInt(localStorage.getItem("kayan_local_req_counter") || "0", 10) + 1;
        localStorage.setItem("kayan_local_req_counter", String(localCount));
        reqNum = localCount;
      }

      const reqId = "req_" + reqNum;
      const reqData = {
        id: reqId,
        orderNum: reqNum,
        name: name,
        phone: phone,
        type: type,
        notes: notes,
        status: "new",
        createdAt: Date.now()
      };

      try {
        if(db){
          await db.ref("requests/" + reqId).set(reqData);
        }
      } catch(err){
        console.warn("Failed to write request to db:", err);
      }

      const encodedMsg = encodeURIComponent(
        `السلام عليكم، تفاصيل طلب حجز جديد عبر موقع كيان سيتي:\n` +
        `👤 الاسم: ${name}\n` +
        `📱 الهاتف: ${phone}\n` +
        `🏢 نوع الطلب: ${type}\n` +
        (notes ? `📝 تفاصيل إضافية: ${notes}\n` : '') +
        `🔢 رقم الطلب: #${reqNum}`
      );

      const team1 = document.getElementById("wa-send-team-1");
      const team2 = document.getElementById("wa-send-team-2");
      const team3 = document.getElementById("wa-send-team-3");
      const team4 = document.getElementById("wa-send-team-4");
      if(team1) team1.href = `https://wa.me/201017006541?text=${encodedMsg}`;
      if(team2) team2.href = `https://wa.me/201091048919?text=${encodedMsg}`;
      if(team3) team3.href = `https://wa.me/201029105138?text=${encodedMsg}`;
      if(team4) team4.href = `https://wa.me/201070451554?text=${encodedMsg}`;

      const reqIdEl = document.getElementById("success-req-id");
      if(reqIdEl) reqIdEl.textContent = `رقم الطلب: #${reqNum}`;

      if(submitBtn){
        submitBtn.disabled = false;
        submitBtn.textContent = "إرسال طلب الحجز فوراً";
      }

      localStorage.setItem("kayan_sec_last_booking_submit", String(Date.now()));
      bookingForm.reset();

      if(bookingSuccessModal){
        bookingSuccessModal.classList.add("show");
      } else {
        alert(`تم استلام طلبك بنجاح برقم (#${reqNum})! سيتواصل معك فريق الإدارة فوراً.`);
      }
    });
  }

  // Initialize
  renderPublicAd();
  renderPublicProperties("all");
  if(db){
    auth.onAuthStateChanged(async user => {
      await refreshAdminState(user);
      if(isAdmin){ try { await loadStudents(); } catch(e){} try { await loadRequests(); } catch(e){} }
    });
    loadPublic();
  } else {
    loaded = true;
    renderPublicProperties();
    console.warn("Kayan: قاعدة البيانات غير مربوطة — املأ KAYAN_CONFIG.FIREBASE في أول السكريبت.");
  }

})();

