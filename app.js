/**
 * كيان سيتي للتطوير العقاري وإدارة الأصول — Kayan City Real Estate
 * محرك النظام المتكامل: إدارة العقارات، سجل السكن الجامعي للطلاب، وقاعدة بيانات فايربيس
 * إصدار متطور يدعم كافة الأجهزة (موبايل، تابلت، لابتوب، شاشات عريضة)
 */

// ========================================================
// 0. الإعدادات العامة وقاعدة بيانات Firebase
// ========================================================
window.KAYAN_CONFIG = {
  FIREBASE: {
    apiKey: "AIzaSyDJ5Bl1G-mYkzO9ovilFrsa7Z5OhcI0vO4",
    authDomain: "kyan-b9581.firebaseapp.com",
    projectId: "kyan-b9581",
    databaseURL: "https://kyan-b9581-default-rtdb.firebaseio.com",
    storageBucket: "kyan-b9581.firebasestorage.app",
    messagingSenderId: "275317091922",
    appId: "1:275317091922:web:60e95ecb19caad26dd798b"
  },
  // البريد المسجل في Firebase Authentication لمدير النظام (لازم يطابق القواعد)
  ADMIN_EMAIL: "citykayan3@gmail.com"
};

// ========================================================
// 1. العرض ثلاثي الأبعاد والتفاعل الحركي (Three.js 3D Scene)
// ========================================================
(function(){
  const heroStage = document.getElementById("hero-stage");
  if(!heroStage) return;

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
      if(slide1) slide1.className = "hero-slide active";
      if(slide2) slide2.className = "hero-slide inactive";
      if(slide3) slide3.className = "hero-slide inactive";
      if(scrollCue) scrollCue.style.opacity = "1";
    } else if(scrollProgress >= 0.25 && scrollProgress < 0.65){
      if(slide1) slide1.className = "hero-slide inactive";
      if(slide2) slide2.className = "hero-slide active";
      if(slide3) slide3.className = "hero-slide inactive";
      if(scrollCue) scrollCue.style.opacity = "0.5";
    } else {
      if(slide1) slide1.className = "hero-slide inactive";
      if(slide2) slide2.className = "hero-slide inactive";
      if(slide3) slide3.className = "hero-slide active";
      if(scrollCue) scrollCue.style.opacity = "0";
    }
  }

  let scrollTick = false;
  window.addEventListener("scroll", () => {
    if(scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => { scrollTick = false; updateScroll(); });
  }, {passive: true});
  updateScroll();

  function init3D(){
    if(typeof THREE === "undefined") return;
    const canvas = document.getElementById("canvas-3d");
    if(!canvas) return;

    const isMobile = window.innerWidth < 768;
    const lowEnd = (navigator.hardwareConcurrency || 4) <= 4 || isMobile;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: !lowEnd,
        alpha: false,
        powerPreference: "high-performance"
      });
    } catch(e) {
      console.warn("WebGL not available", e);
      return;
    }

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
    sunLight.castShadow = !lowEnd;
    sunLight.shadow.mapSize.set(512, 512);
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x4080ff, 1.2);
    blueRimLight.position.set(30, 25, -25);
    scene.add(blueRimLight);

    // Ground Plaza
    const plazaMat = new THREE.MeshStandardMaterial({color: 0x0f1c2e, roughness: 0.25, metalness: 0.4});
    const ground = new THREE.Mesh(new THREE.CircleGeometry(160, 48), plazaMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = !lowEnd;
    scene.add(ground);

    // Reflecting Pool
    const poolMat = new THREE.MeshStandardMaterial({color: 0x092644, roughness: 0.05, metalness: 0.9});
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.2, 32), poolMat);
    pool.position.set(0, 0.1, 14);
    scene.add(pool);

    const poolLight = new THREE.PointLight(0x35e8c0, 1.5, 18);
    poolLight.position.set(0, 1.2, 14);
    scene.add(poolLight);

    // Glass Texture
    function createGlassTexture() {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 256;
      const ctx = c.getContext("2d");
      const g = ctx.createLinearGradient(0, 0, 256, 256);
      g.addColorStop(0, "#193554");
      g.addColorStop(1, "#0a192c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 256, 256);

      ctx.strokeStyle = "#324e70";
      ctx.lineWidth = 2;
      for(let x = 0; x <= 256; x += 32){
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 256); ctx.stroke();
      }
      for(let y = 0; y <= 256; y += 64){
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
      }

      ctx.fillStyle = "rgba(255, 222, 150, 0.85)";
      for(let x = 4; x < 256; x += 32){
        for(let y = 6; y < 256; y += 64){
          if(Math.random() > 0.45) ctx.fillRect(x + 2, y + 2, 24, 50);
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

    // Building the Architectural Tower
    const tower = new THREE.Group();
    const lobby = new THREE.Mesh(new THREE.BoxGeometry(16, 3.8, 12), glassMaterial);
    lobby.position.y = 1.9;
    tower.add(lobby);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 6), champagneTrim);
    canopy.position.set(0, 3.2, 7.5);
    tower.add(canopy);

    const floorCount = 14;
    const floorHeight = 1.45;

    for(let i = 0; i < floorCount; i++){
      const yPos = 3.8 + i * floorHeight;
      const scaleFactor = 1 - Math.pow(i / floorCount, 3) * 0.15;
      const w = 12 * scaleFactor;
      const d = 9 * scaleFactor;

      const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(w - 0.5, floorHeight * 0.95, d - 0.5), glassMaterial);
      floorMesh.position.set(0, yPos + floorHeight / 2, 0);
      tower.add(floorMesh);

      const slab = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.18, d + 1.2), champagneTrim);
      slab.position.set(0, yPos, 0);
      tower.add(slab);

      const frontRail = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 0.55, 0.05), balconyGlass);
      frontRail.position.set(0, yPos + 0.35, (d + 1.2) / 2);
      const backRail = frontRail.clone();
      backRail.position.z = -(d + 1.2) / 2;
      tower.add(frontRail, backRail);
    }

    const roofY = 3.8 + floorCount * floorHeight;
    const penthouse = new THREE.Mesh(new THREE.BoxGeometry(8, 2.2, 6), glassMaterial);
    penthouse.position.set(0, roofY + 1.1, 0);
    tower.add(penthouse);

    const roofPergola = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.25, 7.4), champagneTrim);
    roofPergola.position.set(0, roofY + 2.3, 0);
    tower.add(roofPergola);

    scene.add(tower);

    // Mouse & Touch Swipe Rotation
    let isDragging = false;
    let previousX = 0;
    let mouseSpinOffset = 0;

    function onPointerDown(e){
      isDragging = true;
      previousX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    }
    function onPointerMove(e){
      if(!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const deltaX = clientX - previousX;
      mouseSpinOffset += deltaX * 0.005;
      previousX = clientX;
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
      if(!canvas.parentElement) return;
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
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      if(heroVisible && !running){ running = true; requestAnimationFrame(animate); }
    }).observe(heroStage);

    let lastFrame = 0;
    function animate(t){
      if(!heroVisible || document.hidden){ running = false; return; }
      requestAnimationFrame(animate);
      if(lowEnd && t - lastFrame < 30) return;
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

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  }

  function loadThree(){
    if(typeof THREE !== "undefined"){
      init3D();
      return;
    }
    const sc = document.createElement("script");
    sc.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    sc.onload = init3D;
    document.head.appendChild(sc);
  }
  if("requestIdleCallback" in window) requestIdleCallback(loadThree, {timeout: 1000});
  else setTimeout(loadThree, 200);
})();

// ========================================================
// 2. محرك إدارة البيانات المتزامن (Data Engine & Realtime Sync)
// ========================================================
(function(){
  const CFG = window.KAYAN_CONFIG || {};
  const FB = CFG.FIREBASE || {};

  // تهيئة اتصال Firebase
  let fbApp = null, db = null, auth = null;
  try {
    if(window.firebase && FB.apiKey && FB.projectId){
      fbApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(FB);
      db = firebase.database();
      auth = firebase.auth();
    }
  } catch(e) {
    console.warn("Firebase initialization notice:", e);
  }

  // ثوابت ومفاتيح الأشهر الأكاديمية (12 شهراً دراسياً تبدأ من شهر 10)
  const MONTH_KEYS = ["10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const MONTH_LABELS = {
    "10": "ش 10", "11": "ش 11", "12": "ش 12",
    "1": "ش 1", "2": "ش 2", "3": "ش 3",
    "4": "ش 4", "5": "ش 5", "6": "ش 6",
    "7": "ش 7", "8": "ش 8", "9": "ش 9"
  };

  const EMPTY_AD = { enabled: false, text: "", tag: "", btnText: "" };
  const PH = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='%230d172a'/></svg>";

  // نماذج جاهزة للشقق المعروضة في حالة عدم وجود وحدات بعد
  const DEFAULT_PROPERTIES = [
    {
      id: "prop_1",
      title: "جناح الجامعة الفندقي VIP — K101",
      category: "hotel",
      price: "7,500 ج.م / شهر",
      status: "available",
      location: "أمام بوابة جامعة أسيوط الرئيسية",
      area: "125 م²",
      rooms: "3 غرف ماستر",
      baths: "2 حمام فاخر",
      badge: "متاح للحجز الفوري",
      image: "profile.jpg"
    },
    {
      id: "prop_2",
      title: "سكن طلابي سوبر لوكس — النميس K202",
      category: "student",
      price: "1,500 ج.م / سرير",
      status: "available",
      location: "شارع النميس، قريب من كليات الطب والعلوم",
      area: "160 م²",
      rooms: "4 غرف سنجل ودابل",
      baths: "2 حمام مجهز",
      badge: "إنترنت فايبر مجاني",
      image: "profile.jpg"
    },
    {
      id: "prop_3",
      title: "شقة النيل الفندقية البانورامية — K303",
      category: "hotel",
      price: "12,000 ج.م / شهر",
      status: "reserved",
      location: "شارع كورنيش النيل، أسيوط",
      area: "210 م²",
      rooms: "3 غرف نوم + ريسبشن كبير",
      baths: "3 حمامات",
      badge: "إطلالة مباشرة على النيل",
      image: "profile.jpg"
    },
    {
      id: "prop_4",
      title: "سكن رويال الطبي للطلاب — K404",
      category: "student",
      price: "2,000 ج.م / سرير",
      status: "available",
      location: "شارع الجمهورية، جوار مستشفيات جامعة أسيوط",
      area: "145 م²",
      rooms: "3 غرف سنجل مكيفة",
      baths: "2 حمام",
      badge: "مكيف بالكامل وهادئ",
      image: "profile.jpg"
    },
    {
      id: "prop_5",
      title: "بنتهاوس عائلي فاخر بروف خاص — K505",
      category: "family",
      price: "15,000 ج.م / شهر",
      status: "available",
      location: "حي الجامعة، أرقى أحياء أسيوط",
      area: "280 م²",
      rooms: "4 غرف نوم + غرفة معيشة",
      baths: "3 حمامات جاكوزي",
      badge: "روف بانورامي خاص",
      image: "profile.jpg"
    },
    {
      id: "prop_6",
      title: "جناح النخبة لطلاب الدراسات العليا — K606",
      category: "student",
      price: "2,500 ج.م / شهر",
      status: "sold",
      location: "شارع المكتبات خلف دريم بلازا",
      area: "90 م²",
      rooms: "غرفة نوم ماستر خاصة + مكتب",
      baths: "1 حمام خاص",
      badge: "تم الحجز بالكامل",
      image: "profile.jpg"
    }
  ];

  // دالة توحيد وتنسيق بيانات الطالب
  function normalizeStudent(id, raw){
    if(!raw || typeof raw !== "object") return null;
    const r = Object.assign({}, raw);
    r.id = String(id);
    r.name = String(r.name || "").trim();
    r.phone = String(r.phone || "").trim();
    r.city = String(r.city || "").trim();
    r.college = String(r.college || "").trim();
    r.building = String(r.building || "").trim();
    r.apartment = String(r.apartment || "").trim();
    r.address = String(r.address || "").trim();
    r.owner = String(r.owner || "").trim();
    r.supervisor = String(r.supervisor || "").trim();
    r.rent = parseFloat(r.rent) || 0;
    r.insurance = parseFloat(r.insurance) || 0;
    r.notes = String(r.notes || "").trim();
    r.createdAt = r.createdAt || Date.now();

    const mo = {};
    MONTH_KEYS.forEach(k => { mo[k] = false; });

    if(r.months){
      if(Array.isArray(r.months)){
        r.months.forEach((val, idx) => {
          if(val !== null && val !== undefined && idx > 0){
            mo[String(idx)] = Boolean(val);
          }
        });
      } else if(typeof r.months === "object"){
        Object.keys(r.months).forEach(k => {
          if(r.months[k] != null){
            mo[String(k)] = Boolean(r.months[k]);
          }
        });
      }
    }
    r.months = mo;
    return r;
  }

  // بيانات الطلاب لا تُحمَّل للزوار نهائياً: تُجلب من Firebase فقط بعد تسجيل دخول الإدارة
  function loadInitialStudents(){
    try { localStorage.removeItem("kayan_students_cache"); } catch(e){}
    return [];
  }

  function loadInitialProps(){
    try {
      const cached = localStorage.getItem("kayan_props_cache");
      if(cached){
        const parsed = JSON.parse(cached);
        if(Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e){}
    return DEFAULT_PROPERTIES.slice();
  }

  function loadInitialAd(){
    try {
      const cached = localStorage.getItem("kayan_ad_cache");
      if(cached) return JSON.parse(cached);
    } catch(e){}
    return EMPTY_AD;
  }

  // الحالة العامة
  let STUDENTS = loadInitialStudents();
  let PROPS = loadInitialProps();
  let AD = loadInitialAd();
  let isAdmin = false;
  let isFirebaseConnected = false;
  let currentStudentView = localStorage.getItem("kayan_view_mode") || (window.innerWidth < 768 ? "cards" : "table");
  let studentPage = 0;
  const STUDENT_PAGE_SIZE = 50;

  function esc(v){
    return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function isSignedAdmin(){
    try {
      const u = auth && auth.currentUser;
      return !!(u && u.email && u.email.toLowerCase() === String(CFG.ADMIN_EMAIL || "").toLowerCase());
    } catch(e){ return false; }
  }
  function sid(v){ return String(v == null ? "" : v).replace(/[^\w-]/g, ""); }
  function safeImg(u){
    u = String(u || "").trim();
    return /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp|svg\+xml);)/i.test(u) ? u : "";
  }

  function showToast(msg){
    const t = document.getElementById("toast");
    if(!t) return;
    t.innerText = msg;
    t.style.display = "block";
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.display = "none"; }, 3200);
  }

  // حفظ محلي فوري للحماية من فقدان أي بيانات
  function persistLocal(){
    try {
      if(isSignedAdmin()) localStorage.setItem("kayan_students_cache", JSON.stringify(STUDENTS));
      else localStorage.removeItem("kayan_students_cache");
      localStorage.setItem("kayan_props_cache", JSON.stringify(PROPS));
      localStorage.setItem("kayan_ad_cache", JSON.stringify(AD));
    } catch(e){
      console.warn("Storage quota warning", e);
    }
  }

  // مؤشر اتصال قاعدة بيانات Firebase
  function updateDbStatusBadge(connected, note){
    isFirebaseConnected = connected;
    const badge = document.getElementById("db-status-pill");
    if(!badge) return;
    if(connected){
      badge.className = "db-status-pill connected";
      badge.innerHTML = "🟢 متصل بقاعدة Firebase (مباشر)";
      badge.title = "قاعدة البيانات متصلة وتعمل بنجاح مع السحابة";
    } else {
      badge.className = "db-status-pill local";
      badge.innerHTML = "🟡 يعمل محلياً (انقر لربط فايربيس)";
      badge.title = note || "يعمل حالياً في الوضع المحلي الآمن. انقر لمعرفة كيفية تفعيل قواعد Firebase";
    }
  }

  // مزامنة السجل مع Firebase Realtime Database
  async function syncStudentToFirebase(student, isDelete = false){
    persistLocal();
    if(!db) return;
    try {
      if(isDelete){
        await db.ref("students/" + student.id).remove();
      } else {
        const { id, ...data } = student;
        await db.ref("students/" + id).set(data);
      }
      updateDbStatusBadge(true);
    } catch(err){
      console.warn("Firebase sync notice:", err);
      updateDbStatusBadge(false, err.message);
    }
  }

  async function syncAllStudentsToFirebase(){
    if(!db) return false;
    try {
      const updates = {};
      STUDENTS.forEach(st => {
        const { id, ...data } = st;
        updates["students/" + id] = data;
      });
      await db.ref().update(updates);
      updateDbStatusBadge(true);
      showToast("تمت مزامنة جميع الطلاب بنجاح مع Firebase! ✔");
      return true;
    } catch(err){
      console.warn("Firebase push error:", err);
      updateDbStatusBadge(false, err.message);
      showToast("⚠️ لم تكتمل المزامنة السحابية: " + (err.message || "تأكد من تسجيل الدخول وقواعد Firebase"));
      return false;
    }
  }

  async function syncPropToFirebase(prop, isDelete = false){
    persistLocal();
    if(!db) return;
    try {
      if(isDelete){
        await db.ref("properties/" + prop.id).remove();
      } else {
        const { id, ...data } = prop;
        await db.ref("properties/" + id).set(data);
      }
      updateDbStatusBadge(true);
    } catch(err){
      console.warn("Firebase property sync error:", err);
      updateDbStatusBadge(false, err.message);
    }
  }

  async function syncAdToFirebase(adObj){
    persistLocal();
    if(!db) return;
    try {
      await db.ref("settings/ad_banner").set({ value: adObj });
      updateDbStatusBadge(true);
    } catch(err){
      console.warn("Firebase ad sync error:", err);
      updateDbStatusBadge(false, err.message);
    }
  }

  // جلب سجل الطلاب (للإدارة فقط بعد تسجيل الدخول)
  let studentsLoaded = false;
  async function loadStudentsFromFirebase(){
    if(!db || !isSignedAdmin()) return false;
    try {
      const snapshot = await db.ref("students").once("value");
      const val = snapshot.val();
      STUDENTS = (val && typeof val === "object")
        ? Object.keys(val).map(id => normalizeStudent(id, val[id])).filter(Boolean)
        : [];
      studentsLoaded = true;
      persistLocal();
      updateDbStatusBadge(true);
      return true;
    } catch(err){
      console.warn("Students read error:", err);
      updateDbStatusBadge(false, "لا توجد صلاحية لقراءة سجل الطلاب");
      return false;
    }
  }

  // ربط Firebase وجلب البيانات عند توفر الاتصال
  async function initFirebaseSync(){
    if(!db) {
      updateDbStatusBadge(false, "لم يتم تضمين مكتبة Firebase");
      return;
    }

    try {
      // الاستماع للوحدات المعروضة
      db.ref("properties").on("value", snapshot => {
        const val = snapshot.val();
        if(val && typeof val === "object"){
          const list = Object.keys(val).map(id => {
            const item = val[id];
            item.id = id;
            return item;
          });
          if(list.length > 0){
            PROPS = list;
            persistLocal();
            renderPublicProperties();
            if(isAdmin) renderAdminTable();
          }
        }
        updateDbStatusBadge(true);
      }, err => {
        console.warn("Properties fetch error", err);
        updateDbStatusBadge(false, err.message);
      });

      // الاستماع لشريط الإعلانات
      db.ref("settings/ad_banner").on("value", snapshot => {
        const val = snapshot.val();
        if(val && val.value){
          AD = val.value;
          persistLocal();
          renderPublicAd();
          if(isAdmin) loadAdminAd();
        }
      });

    } catch(e) {
      console.warn("Sync setup error:", e);
      updateDbStatusBadge(false, e.message);
    }
  }

  // ========================================================
  // 3. عرض شريط الإعلانات العام (Announcement Bar)
  // ========================================================
  function renderPublicAd(){
    const adBar = document.getElementById("ad-announcement-bar");
    if(!adBar) return;
    if(AD && AD.enabled && AD.text && AD.text.trim() !== ""){
      adBar.style.display = "flex";
      const pill = document.getElementById("ad-pill");
      const text = document.getElementById("ad-text-content");
      const btn = document.getElementById("ad-action-btn");
      if(pill) pill.innerText = AD.tag || "عرض خاص";
      if(text) text.innerText = AD.text || "";
      if(btn) btn.innerText = AD.btnText || "احجز الآن";
    } else {
      adBar.style.display = "none";
    }
  }

  // ========================================================
  // 4. عرض الوحدات والعقارات في الموقع العام
  // ========================================================
  let publicFilter = "all";
  function renderPublicProperties(filter){
    publicFilter = filter || publicFilter;
    const grid = document.getElementById("properties-grid");
    if(!grid) return;

    const filtered = publicFilter === "all" ? PROPS : PROPS.filter(p => p.category === publicFilter);
    grid.innerHTML = "";

    if(filtered.length === 0){
      grid.innerHTML = `
        <div class="empty-state-box" style="grid-column:1/-1; text-align:center; padding:40px 20px;">
          <h3 style="color:#fff; font-size:1.4rem; margin-bottom:8px;">لا توجد وحدات معروضة في هذا القسم حالياً</h3>
          <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:16px;">يرجى التواصل معنا للاستفسار عن أحدث الوحدات المتاحة ومواعيد التسليم.</p>
          <a href="#contact" class="btn-primary" style="display:inline-flex;">تواصل مع فريق المبيعات</a>
        </div>
      `;
      return;
    }

    filtered.forEach(p => {
      const isSold = p.status === "sold";
      const isReserved = p.status === "reserved";

      const card = document.createElement("div");
      card.className = "property-card" + (isSold ? " sold-card" : "");

      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${esc(safeImg(p.image) || 'profile.jpg')}" alt="${esc(p.title)}" loading="lazy" decoding="async">
          ${isSold ? '<div class="sold-ribbon">تم البيع</div>' : ''}
          <div class="card-badge ${isSold ? 'sold' : (isReserved ? 'reserved' : '')}">
            ${isSold ? 'تم البيع / Sold Out' : (isReserved ? 'محجوز مؤقتاً' : esc(p.badge || 'متاح للحجز'))}
          </div>
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
              `<a href="https://wa.me/201017006541?text=${encodeURIComponent('السلام عليكم، استفسر عن حجز وحدة: ' + p.title)}" target="_blank" rel="noopener" class="btn-primary" style="flex:1; justify-content:center;">حجز الشقة</a>`
            }
            <a href="#contact" class="btn-outline">معاينة وتفاصيل</a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // تبويبات تصفية العقارات في الموقع العام
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPublicProperties(btn.getAttribute("data-filter"));
    });
  });

  // ========================================================
  // 5. سجل الطلاب وسكن الطلاب (Student Housing System)
  // ========================================================

  // تغيير سداد شهر لطالب بنقرة واحدة
  window.adminToggleStudentMonth = function(studentId, monthKey){
    const st = STUDENTS.find(s => s.id === studentId);
    if(!st) return;
    if(!st.months) st.months = {};
    st.months[monthKey] = !st.months[monthKey];
    syncStudentToFirebase(st);
    renderStudentsTable();
    const stText = st.months[monthKey] ? "تم تسجيل سداد ✔" : "تم إلغاء سداد ✗";
    showToast(`${stText} شهر ${monthKey} للطالب: ${st.name}`);
  };

  // تعديل طالب
  window.adminEditStudent = function(studentId){
    const st = STUDENTS.find(s => s.id === studentId);
    if(!st) return;

    document.getElementById("admin-student-modal-title").innerText = "تعديل بيانات الطالب والسكن";
    document.getElementById("form-student-id").value = st.id;
    document.getElementById("form-student-name").value = st.name || "";
    document.getElementById("form-student-phone").value = st.phone || "";
    document.getElementById("form-student-city").value = st.city || "";
    document.getElementById("form-student-college").value = st.college || "";
    document.getElementById("form-student-building").value = st.building || "";
    document.getElementById("form-student-apartment").value = st.apartment || "";
    document.getElementById("form-student-address").value = st.address || "";
    document.getElementById("form-student-owner").value = st.owner || "";
    document.getElementById("form-student-supervisor").value = st.supervisor || "";
    document.getElementById("form-student-rent").value = st.rent || "";
    document.getElementById("form-student-insurance").value = st.insurance || "";
    document.getElementById("form-student-notes").value = st.notes || "";

    const modal = document.getElementById("admin-student-modal");
    if(modal) modal.classList.add("open");
  };

  // حذف طالب
  window.adminDeleteStudent = function(studentId){
    const st = STUDENTS.find(s => s.id === studentId);
    if(!st) return;
    if(confirm(`هل أنت متأكد من حذف الطالب "${st.name}" نهائياً من السجل؟`)){
      STUDENTS = STUDENTS.filter(s => s.id !== studentId);
      syncStudentToFirebase(st, true);
      renderStudentsTable();
      showToast(`تم حذف الطالب "${st.name}" بنجاح!`);
    }
  };

  // تبديل نمط العرض (جدول / كروت)
  function setStudentViewMode(mode){
    currentStudentView = mode;
    localStorage.setItem("kayan_view_mode", mode);

    const btnTable = document.getElementById("btn-view-table");
    const btnCards = document.getElementById("btn-view-cards");
    const tableWrap = document.getElementById("students-table-wrap");
    const cardsWrap = document.getElementById("admin-students-cards-container");

    if(btnTable) btnTable.classList.toggle("active", mode === "table");
    if(btnCards) btnCards.classList.toggle("active", mode === "cards");

    if(tableWrap) tableWrap.style.display = mode === "table" ? "block" : "none";
    if(cardsWrap) cardsWrap.style.display = mode === "cards" ? "grid" : "none";

    renderStudentsTable();
  }

  // فلترة وبناء عناصر السجل
  function getFilteredStudents(){
    const searchKeyword = (document.getElementById("student-search-box")?.value || "").trim().toLowerCase();
    const supervisorFilter = document.getElementById("student-supervisor-filter")?.value || "all";
    const buildingFilter = document.getElementById("student-building-filter")?.value || "all";
    const collegeFilter = document.getElementById("student-college-filter")?.value || "all";
    const paymentFilter = document.getElementById("student-payment-filter")?.value || "all";

    const curMonth = String(new Date().getMonth() + 1); // الشهر الحالي 1..12

    return STUDENTS.filter(st => {
      if(supervisorFilter !== "all" && st.supervisor !== supervisorFilter) return false;
      if(buildingFilter !== "all" && st.building !== buildingFilter) return false;
      if(collegeFilter !== "all" && st.college !== collegeFilter) return false;

      // فلترة حالة السداد
      if(paymentFilter === "current_paid"){
        if(!st.months || !st.months[curMonth]) return false;
      } else if(paymentFilter === "current_unpaid"){
        if(st.months && st.months[curMonth]) return false;
      } else if(paymentFilter === "all_paid"){
        const unpaidCount = MONTH_KEYS.filter(m => !st.months || !st.months[m]).length;
        if(unpaidCount > 0) return false;
      } else if(paymentFilter === "has_due"){
        const paidCount = MONTH_KEYS.filter(m => st.months && st.months[m]).length;
        if(paidCount === MONTH_KEYS.length) return false;
      }

      if(searchKeyword){
        const terms = [st.name, st.phone, st.city, st.college, st.building, st.apartment, st.owner, st.supervisor, st.notes].join(" ").toLowerCase();
        if(!terms.includes(searchKeyword)) return false;
      }
      return true;
    });
  }

  // بناء وعرض جدول وبطاقات الطلاب
  function renderStudentsTable(){
    const tbody = document.getElementById("admin-students-tbody");
    const cardsContainer = document.getElementById("admin-students-cards-container");
    if(!tbody) return;

    // تحديث خيارات الفلاتر المنسدلة تلقائياً
    const populateDropdown = (elemId, key, allLabel) => {
      const sel = document.getElementById(elemId);
      if(!sel) return;
      const cur = sel.value;
      const uniqueVals = Array.from(new Set(STUDENTS.map(s => String(s[key] || "")).filter(Boolean))).sort((a,b) => a.localeCompare(b, "ar"));
      sel.innerHTML = `<option value="all">${allLabel}</option>` + uniqueVals.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
      sel.value = uniqueVals.includes(cur) ? cur : "all";
    };

    populateDropdown("student-building-filter", "building", "جميع العمارات");
    populateDropdown("student-supervisor-filter", "supervisor", "جميع المشرفين المسؤولين");
    populateDropdown("student-college-filter", "college", "جميع الكليات");

    // قائمة المشرفين للاقتراح في النموذج
    const dl = document.getElementById("supervisor-list");
    if(dl){
      const supSet = Array.from(new Set(STUDENTS.map(s => s.supervisor).filter(Boolean))).sort();
      dl.innerHTML = supSet.map(s => `<option value="${esc(s)}">`).join("");
    }

    const filtered = getFilteredStudents();

    // تحديث مؤشرات الأداء KPIs
    let totalRent = 0, totalInsurance = 0, totalNotes = 0;
    STUDENTS.forEach(st => {
      totalRent += parseFloat(st.rent) || 0;
      totalInsurance += parseFloat(st.insurance) || 0;
      const n = parseFloat(String(st.notes || "").replace(/[^\d.]/g, "")) || 0;
      totalNotes += n;
    });

    const elTotal = document.getElementById("kpi-students-total");
    const elRent = document.getElementById("kpi-students-rent");
    const elIns = document.getElementById("kpi-students-insurance");
    const elNotes = document.getElementById("kpi-students-notes-total");

    if(elTotal) elTotal.innerText = STUDENTS.length + " طالب";
    if(elRent) elRent.innerText = totalRent.toLocaleString() + " ج.م";
    if(elIns) elIns.innerText = totalInsurance.toLocaleString() + " ج.م";
    if(elNotes) elNotes.innerText = totalNotes.toLocaleString() + " ج.م";

    // إدارة الصفحات (Pagination)
    const pages = Math.max(1, Math.ceil(filtered.length / STUDENT_PAGE_SIZE));
    if(studentPage >= pages) studentPage = pages - 1;
    if(studentPage < 0) studentPage = 0;
    const start = studentPage * STUDENT_PAGE_SIZE;
    const pageItems = filtered.slice(start, start + STUDENT_PAGE_SIZE);

    // تحديث أزرار التنقل بين الصفحات
    const pagerEl = document.getElementById("students-pager");
    if(pagerEl){
      if(filtered.length <= STUDENT_PAGE_SIZE){
        pagerEl.innerHTML = `<span class="pager-info">إجمالي النتائج: ${filtered.length} طالب</span>`;
      } else {
        pagerEl.innerHTML = `
          <button type="button" class="btn-outline" id="pg-prev" ${studentPage === 0 ? "disabled" : ""}>السابق</button>
          <span class="pager-info">صفحة ${studentPage + 1} من ${pages} — المعروض (${pageItems.length} من ${filtered.length})</span>
          <button type="button" class="btn-outline" id="pg-next" ${studentPage >= pages - 1 ? "disabled" : ""}>التالي</button>
        `;
        document.getElementById("pg-prev")?.addEventListener("click", () => {
          if(studentPage > 0){ studentPage--; renderStudentsTable(); }
        });
        document.getElementById("pg-next")?.addEventListener("click", () => {
          if(studentPage < pages - 1){ studentPage++; renderStudentsTable(); }
        });
      }
    }

    // 1. بناء عرض الجدول (Table View)
    tbody.innerHTML = "";
    if(filtered.length === 0){
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:36px; color:var(--text-muted); font-size:1.05rem;">لا توجد سجلات مطابقة للبحث أو التصفية الحالية.</td></tr>`;
    } else {
      pageItems.forEach((st, idx) => {
        const tr = document.createElement("tr");

        let monthsHtml = '<div class="month-badges-grid">';
        MONTH_KEYS.forEach(m => {
          const isPaid = st.months && st.months[m];
          monthsHtml += `
            <button type="button" class="month-badge-item ${isPaid ? 'paid' : 'unpaid'}" 
                    data-admin-action="toggle-student-month" data-student-id="${esc(st.id)}" data-month="${m}"
                    title="انقر لتغيير السداد">
              ${isPaid ? '✓' : '✗'} ${MONTH_LABELS[m]}
            </button>
          `;
        });
        monthsHtml += '</div>';

        const rawPhone = (st.phone || "").replace(/[^\d]/g, "");
        const waPhone = rawPhone.startsWith("0") ? "2" + rawPhone : (rawPhone.startsWith("20") ? rawPhone : "20" + rawPhone);

        tr.innerHTML = `
          <td style="font-weight:700; color:var(--text-muted); text-align:center;">${start + idx + 1}</td>
          <td>
            <strong style="color:#fff; font-size:1.05rem; display:block;">${esc(st.name)}</strong>
            <span style="font-size:0.85rem; color:var(--gold-light); font-family:monospace; direction:ltr; display:inline-block;">${esc(st.phone)}</span>
          </td>
          <td>
            <div style="font-size:0.92rem; color:#fff; font-weight:600;">${esc(st.college || "—")}</div>
            <div style="font-size:0.82rem; color:var(--text-muted);">${esc(st.city || "—")}</div>
          </td>
          <td>
            <strong style="color:var(--gold); display:block; font-size:0.95rem;">${esc(st.building || "—")}</strong>
            <span style="font-size:0.86rem; color:#cbd7e6;">${esc(st.apartment || "—")}</span>
          </td>
          <td>
            <div style="font-size:0.85rem; color:#cbd7e6;">${esc(st.address || "—")}</div>
          </td>
          <td>
            <div style="font-size:0.88rem; color:#fff; margin-bottom:4px;">المالك: <b>${esc(st.owner || "—")}</b></div>
            <span class="supervisor-pill">${esc(st.supervisor || "غير محدد")}</span>
          </td>
          <td>
            <div style="font-size:0.98rem; font-weight:700; color:var(--cyan);">${(parseFloat(st.rent)||0).toLocaleString()} ج.م / شهر</div>
            <div style="font-size:0.82rem; color:var(--text-muted);">تأمين: ${(parseFloat(st.insurance)||0).toLocaleString()} ج.م</div>
          </td>
          <td>
            ${st.notes ? `<span class="notes-pill">${esc(st.notes)}</span>` : '<span style="color:var(--text-muted); font-size:0.85rem;">—</span>'}
          </td>
          <td>
            ${monthsHtml}
          </td>
          <td>
            <div class="action-group">
              <a href="https://wa.me/${waPhone}?text=${encodeURIComponent('السلام عليكم أ/ ' + st.name + ' بخصوص سكن ' + st.building)}" target="_blank" rel="noopener" class="btn-wa-sm" title="محادثة واتساب سريعة">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </a>
              <a href="tel:${esc(st.phone)}" class="btn-tel-sm" title="اتصال هاتفي">
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

    // 2. بناء عرض البطاقات (Cards View - مخصص للموبايل والتابلت)
    if(cardsContainer){
      cardsContainer.innerHTML = "";
      if(filtered.length === 0){
        cardsContainer.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:36px; color:var(--text-muted); font-size:1.05rem;">لا توجد نتائج مطابقة.</div>`;
      } else {
        pageItems.forEach((st, idx) => {
          const card = document.createElement("div");
          card.className = "student-card";

          let monthsHtml = '<div class="student-card-months">';
          MONTH_KEYS.forEach(m => {
            const isPaid = st.months && st.months[m];
            monthsHtml += `
              <button type="button" class="month-badge-item ${isPaid ? 'paid' : 'unpaid'}" 
                      data-admin-action="toggle-student-month" data-student-id="${esc(st.id)}" data-month="${m}">
                ${isPaid ? '✓' : '✗'} ${MONTH_LABELS[m]}
              </button>
            `;
          });
          monthsHtml += '</div>';

          const rawPhone = (st.phone || "").replace(/[^\d]/g, "");
          const waPhone = rawPhone.startsWith("0") ? "2" + rawPhone : (rawPhone.startsWith("20") ? rawPhone : "20" + rawPhone);

          card.innerHTML = `
            <div class="student-card-header">
              <div>
                <span class="student-card-num">#${start + idx + 1}</span>
                <strong class="student-card-name">${esc(st.name)}</strong>
              </div>
              <div class="action-group">
                <a href="https://wa.me/${waPhone}?text=${encodeURIComponent('السلام عليكم أ/ ' + st.name)}" target="_blank" rel="noopener" class="btn-wa-sm" title="واتساب">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </a>
                <a href="tel:${esc(st.phone)}" class="btn-tel-sm" title="اتصال">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </a>
                <button class="btn-icon" type="button" data-admin-action="edit-student" data-student-id="${esc(st.id)}" title="تعديل">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon delete" type="button" data-admin-action="delete-student" data-student-id="${esc(st.id)}" title="حذف">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>

            <div class="student-card-details">
              <div><b>الموبايل:</b> <span style="direction:ltr; display:inline-block;">${esc(st.phone)}</span></div>
              <div><b>الكلية:</b> ${esc(st.college || "—")} (${esc(st.city || "—")})</div>
              <div><b>السكن:</b> <span style="color:var(--gold); font-weight:700;">${esc(st.building)}</span> — ${esc(st.apartment)}</div>
              <div><b>المشرف:</b> <span class="supervisor-pill">${esc(st.supervisor || "غير محدد")}</span> • <b>المالك:</b> ${esc(st.owner || "—")}</div>
              <div><b>الإيجار:</b> <span style="color:var(--cyan); font-weight:700;">${(parseFloat(st.rent)||0).toLocaleString()} ج.م</span> • <b>التأمين:</b> ${(parseFloat(st.insurance)||0).toLocaleString()} ج.م</div>
              ${st.notes ? `<div><b>ملاحظات:</b> <span class="notes-pill">${esc(st.notes)}</span></div>` : ''}
            </div>

            <div style="font-size:0.8rem; color:var(--gold-light); font-weight:700; margin:10px 0 6px;">حالة سداد الشهور (اضغط لتغيير السداد):</div>
            ${monthsHtml}
          `;
          cardsContainer.appendChild(card);
        });
      }
    }
  }

  // مستمعات التصفية والبحث في الطلاب
  let searchDebounce;
  const triggerStudentRerender = () => {
    studentPage = 0;
    renderStudentsTable();
  };

  document.getElementById("student-search-box")?.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(triggerStudentRerender, 180);
  });
  document.getElementById("student-supervisor-filter")?.addEventListener("change", triggerStudentRerender);
  document.getElementById("student-building-filter")?.addEventListener("change", triggerStudentRerender);
  document.getElementById("student-college-filter")?.addEventListener("change", triggerStudentRerender);
  document.getElementById("student-payment-filter")?.addEventListener("change", triggerStudentRerender);

  // زر تبديل العرض (جدول / كروت)
  document.getElementById("btn-view-table")?.addEventListener("click", () => setStudentViewMode("table"));
  document.getElementById("btn-view-cards")?.addEventListener("click", () => setStudentViewMode("cards"));

  // تفويض أحداث جدول وبطاقات الطلاب
  function handleStudentActionClick(e){
    const btn = e.target.closest("[data-admin-action]");
    if(!btn) return;
    const action = btn.dataset.adminAction;
    const studentId = btn.dataset.studentId;

    if(action === "toggle-student-month"){
      window.adminToggleStudentMonth(studentId, btn.dataset.month);
    } else if(action === "edit-student"){
      window.adminEditStudent(studentId);
    } else if(action === "delete-student"){
      window.adminDeleteStudent(studentId);
    }
  }

  document.getElementById("admin-students-tbody")?.addEventListener("click", handleStudentActionClick);
  document.getElementById("admin-students-cards-container")?.addEventListener("click", handleStudentActionClick);

  // نموذج إضافة / تعديل طالب
  const studentForm = document.getElementById("admin-student-form");
  const studentModal = document.getElementById("admin-student-modal");

  document.getElementById("btn-open-add-student")?.addEventListener("click", () => {
    document.getElementById("admin-student-modal-title").innerText = "إضافة طالب / ساكن جديد";
    studentForm.reset();
    document.getElementById("form-student-id").value = "";
    studentModal.classList.add("open");
  });

  document.getElementById("admin-student-modal-close")?.addEventListener("click", () => studentModal.classList.remove("open"));
  document.getElementById("admin-student-modal-cancel")?.addEventListener("click", () => studentModal.classList.remove("open"));

  studentForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("form-student-id").value;

    const newObj = {
      id: id || "std_" + Date.now(),
      name: document.getElementById("form-student-name").value.trim(),
      phone: document.getElementById("form-student-phone").value.trim(),
      city: document.getElementById("form-student-city").value.trim(),
      college: document.getElementById("form-student-college").value.trim(),
      building: document.getElementById("form-student-building").value.trim(),
      apartment: document.getElementById("form-student-apartment").value.trim(),
      address: document.getElementById("form-student-address").value.trim(),
      owner: document.getElementById("form-student-owner").value.trim(),
      supervisor: document.getElementById("form-student-supervisor").value.trim(),
      rent: parseFloat(document.getElementById("form-student-rent").value) || 0,
      insurance: parseFloat(document.getElementById("form-student-insurance").value) || 0,
      notes: document.getElementById("form-student-notes").value.trim(),
      createdAt: Date.now()
    };

    if(id){
      const idx = STUDENTS.findIndex(s => s.id === id);
      if(idx !== -1){
        newObj.months = STUDENTS[idx].months || {};
        newObj.createdAt = STUDENTS[idx].createdAt || Date.now();
        STUDENTS[idx] = newObj;
      }
    } else {
      newObj.months = {};
      MONTH_KEYS.forEach(m => { newObj.months[m] = false; });
      STUDENTS.unshift(newObj);
    }

    syncStudentToFirebase(newObj);
    renderStudentsTable();
    studentModal.classList.remove("open");
    showToast(id ? "تم حفظ وتعديل بيانات الطالب بنجاح ✔" : "تمت إضافة الطالب الجديد بنجاح ✔");
  });

  // مسح جميع الطلاب مع تأكيد
  document.getElementById("btn-clear-all-students")?.addEventListener("click", () => {
    if(confirm("تحذير أمني: هل أنت متأكد من رغبتك في مسح جميع الطلاب المسجلين بالكامل للبدء من الصفر؟")){
      STUDENTS = [];
      persistLocal();
      if(db) db.ref("students").set(null);
      renderStudentsTable();
      showToast("تم مسح السجل بالكامل بنجاح.");
    }
  });

  // تصدير ملف إكسيل Excel / CSV مع UTF-8 BOM
  document.getElementById("btn-export-students-excel")?.addEventListener("click", () => {
    if(STUDENTS.length === 0){
      alert("لا يوجد طلاب مسجلين لتصديرهم!");
      return;
    }

    let csv = "\uFEFFم,اسم الطالب,رقم الموبايل,البلد / المحافظة,الكلية,العمارة,الشقة والدور,العنوان,المالك,المشرف المسؤول,الإيجار الشهري,التأمين,الملاحظات والاستهلاك,ش 10,ش 11,ش 12,ش 1,ش 2,ش 3,ش 4,ش 5,ش 6,ش 7,ش 8,ش 9\n";

    STUDENTS.forEach((st, i) => {
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
    showToast("تم تصدير ملف الإكسيل بنجاح! ✔");
  });

  // تصدير نسخة احتياطية JSON
  document.getElementById("btn-backup-students-json")?.addEventListener("click", () => {
    const backupObj = {};
    STUDENTS.forEach(st => {
      const { id, ...data } = st;
      backupObj[id] = data;
    });

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyan-students-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("تم تنزيل ملف النسخة الاحتياطية بنجاح ✔");
  });

  // استيراد بيانات من ملف JSON
  const importFileInput = document.getElementById("input-import-students-file");
  document.getElementById("btn-import-students-json")?.addEventListener("click", () => {
    if(importFileInput) importFileInput.click();
  });

  importFileInput?.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        let parsed = JSON.parse(evt.target.result);
        if(parsed.students) parsed = parsed.students;

        let addedCount = 0;
        Object.keys(parsed).forEach(id => {
          const norm = normalizeStudent(id, parsed[id]);
          if(norm){
            const existIdx = STUDENTS.findIndex(s => s.id === id);
            if(existIdx !== -1) STUDENTS[existIdx] = norm;
            else STUDENTS.push(norm);
            addedCount++;
          }
        });

        persistLocal();
        syncAllStudentsToFirebase();
        renderStudentsTable();
        showToast(`تم استيراد ${addedCount} طالب بنجاح! ✔`);
      } catch(err){
        alert("حدث خطأ أثناء قراءة ملف JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  });

  // طباعة كشف الطلاب
  document.getElementById("btn-print-students")?.addEventListener("click", () => {
    window.print();
  });

  // ========================================================
  // 6. إدارة العقارات والشقق المعروضة في لوحة التحكم (Admin Properties)
  // ========================================================
  function renderAdminTable(){
    const tbody = document.getElementById("admin-props-tbody");
    if(!tbody) return;
    tbody.innerHTML = "";

    let total = PROPS.length, avail = 0, res = 0, sold = 0, totalVal = 0, soldVal = 0;

    if(PROPS.length === 0){
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-muted);">لا توجد شقق مسجلة. اضغط على "+ إضافة شقة جديدة" للبدء.</td></tr>`;
    }

    PROPS.forEach(p => {
      if(p.status === "available") avail++;
      else if(p.status === "reserved") res++;
      else if(p.status === "sold") sold++;

      const num = parseInt(String(p.price).replace(/[^\d]/g, "")) || 0;
      totalVal += num;
      if(p.status === "sold" || p.status === "reserved") soldVal += num;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img src="${esc(safeImg(p.image) || 'profile.jpg')}" class="property-thumb" alt="${esc(p.title)}" loading="lazy"></td>
        <td>
          <strong style="color:#fff; display:block;">${esc(p.title)}</strong>
          <span style="font-size:0.78rem; color:var(--gold);">${esc(p.badge || "")}</span>
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
            <button class="btn-icon" type="button" data-admin-action="edit-property" data-property-id="${esc(p.id)}" title="تعديل الشقة">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon delete" type="button" data-admin-action="delete-property" data-property-id="${esc(p.id)}" title="حذف الشقة">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const elTotalUnits = document.getElementById("kpi-total-units");
    const elAvailUnits = document.getElementById("kpi-avail-units");
    const elResUnits = document.getElementById("kpi-res-units");
    const elSoldUnits = document.getElementById("kpi-sold-units");
    const elStatsTotal = document.getElementById("stats-total-val");
    const elStatsSold = document.getElementById("stats-sold-val");
    const elStatsOcc = document.getElementById("stats-occupancy");

    if(elTotalUnits) elTotalUnits.innerText = total;
    if(elAvailUnits) elAvailUnits.innerText = avail;
    if(elResUnits) elResUnits.innerText = res;
    if(elSoldUnits) elSoldUnits.innerText = sold;
    if(elStatsTotal) elStatsTotal.innerText = totalVal.toLocaleString() + " ج.م";
    if(elStatsSold) elStatsSold.innerText = soldVal.toLocaleString() + " ج.م";
    if(elStatsOcc) elStatsOcc.innerText = (total > 0 ? Math.round(((res + sold) / total) * 100) : 0) + "%";
  }

  // تفويض أحداث جدول الشقق
  document.getElementById("admin-props-tbody")?.addEventListener("change", (e) => {
    const sel = e.target.closest('[data-admin-action="change-property-status"]');
    if(!sel) return;
    const propId = sel.dataset.propertyId;
    const item = PROPS.find(p => p.id === propId);
    if(item){
      item.status = sel.value;
      if(sel.value === "sold") item.badge = "تم البيع";
      else if(sel.value === "available") item.badge = "متاح للحجز الفوري";
      else if(sel.value === "reserved") item.badge = "محجوز مؤقتاً";
      syncPropToFirebase(item);
      renderAdminTable();
      renderPublicProperties();
      showToast("تم تحديث حالة الشقة فوراً في الموقع! ✔");
    }
  });

  document.getElementById("admin-props-tbody")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-admin-action]");
    if(!btn) return;
    const action = btn.dataset.adminAction;
    const propId = btn.dataset.propertyId;

    if(action === "edit-property"){
      const item = PROPS.find(p => p.id === propId);
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
      document.getElementById("admin-property-modal")?.classList.add("open");
    } else if(action === "delete-property"){
      const item = PROPS.find(p => p.id === propId);
      if(item && confirm(`هل تريد حذف وحدة "${item.title}" نهائياً؟`)){
        PROPS = PROPS.filter(p => p.id !== propId);
        syncPropToFirebase(item, true);
        renderAdminTable();
        renderPublicProperties();
        showToast("تم حذف الشقة بنجاح!");
      }
    }
  });

  // رفع وضغط صور الشقق من الجهاز تلقائياً
  function setPropImage(v){
    v = v || "";
    const hidden = document.getElementById("form-prop-image");
    const preview = document.getElementById("form-prop-image-preview");
    const urlInput = document.getElementById("form-prop-image-url");

    if(hidden) hidden.value = v;
    const ok = safeImg(v);
    if(preview){
      if(ok){ preview.src = ok; preview.style.display = "block"; }
      else { preview.removeAttribute("src"); preview.style.display = "none"; }
    }
    if(urlInput) urlInput.value = (v && !/^data:/i.test(v)) ? v : "";
  }

  function compressImage(file){
    return new Promise((resolve, reject) => {
      if(!/^image\/(png|jpe?g|webp|gif)$/i.test(file.type)) return reject(new Error("نوع الملف غير مدعوم"));
      if(file.size > 25 * 1024 * 1024) return reject(new Error("حجم الصورة كبير جداً"));
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
        resolve(out);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("تعذر قراءة الصورة")); };
      img.src = url;
    });
  }

  document.getElementById("form-prop-file")?.addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if(!f) return;
    showToast("جاري تجهيز وضغط الصورة...");
    try {
      const compressed = await compressImage(f);
      setPropImage(compressed);
      showToast("تم اختيار وتجهيز الصورة بنجاح ✔");
    } catch(err){
      showToast("⚠️ " + (err.message || "تعذر معالجة الصورة"));
    }
  });

  document.getElementById("form-prop-image-url")?.addEventListener("input", (e) => {
    const v = e.target.value.trim();
    if(v) setPropImage(v);
  });
  document.getElementById("form-prop-image-clear")?.addEventListener("click", () => setPropImage(""));

  // نموذج إضافة وحدة جديدة
  const propModal = document.getElementById("admin-property-modal");
  const propForm = document.getElementById("admin-property-form");

  document.getElementById("btn-open-add-unit")?.addEventListener("click", () => {
    document.getElementById("admin-modal-title").innerText = "إضافة شقة / وحدة جديدة";
    propForm.reset();
    document.getElementById("form-prop-id").value = "";
    setPropImage("");
    propModal?.classList.add("open");
  });

  document.getElementById("admin-modal-close")?.addEventListener("click", () => propModal?.classList.remove("open"));
  document.getElementById("admin-modal-cancel")?.addEventListener("click", () => propModal?.classList.remove("open"));

  document.querySelectorAll(".preset-thumb").forEach(thumb => {
    thumb.addEventListener("click", () => {
      setPropImage(thumb.src);
      document.querySelectorAll(".preset-thumb").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  propForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("form-prop-id").value;

    const newProp = {
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
      image: document.getElementById("form-prop-image").value.trim() || "profile.jpg"
    };

    if(id){
      const idx = PROPS.findIndex(p => p.id === id);
      if(idx !== -1) PROPS[idx] = newProp;
    } else {
      PROPS.unshift(newProp);
    }

    syncPropToFirebase(newProp);
    renderAdminTable();
    renderPublicProperties();
    propModal?.classList.remove("open");
    showToast(id ? "تم تعديل الشقة بنجاح ✔" : "تمت إضافة الشقة ونشرها فوراً ✔");
  });

  document.getElementById("btn-clear-all-units")?.addEventListener("click", () => {
    if(confirm("تحذير: هل أنت متأكد من مسح جميع الوحدات المعروضة؟")){
      PROPS = [];
      persistLocal();
      if(db) db.ref("properties").set(null);
      renderAdminTable();
      renderPublicProperties();
      showToast("تم مسح كافة الوحدات بنجاح.");
    }
  });

  // ========================================================
  // 7. إدارة الإعلانات في لوحة التحكم (Ads Manager)
  // ========================================================
  const adminAdEnabled = document.getElementById("admin-ad-enabled");
  const adminAdText = document.getElementById("admin-ad-text");
  const adminAdTag = document.getElementById("admin-ad-tag");
  const adminAdBtnText = document.getElementById("admin-ad-btn-text");
  const adPreviewBox = document.getElementById("admin-ad-preview-box");
  const adPreviewText = document.getElementById("admin-ad-preview-text");
  const adPreviewBtn = document.getElementById("admin-ad-preview-btn");

  function loadAdminAd(){
    if(!adminAdEnabled) return;
    adminAdEnabled.checked = AD.enabled || false;
    adminAdText.value = AD.text || "";
    adminAdTag.value = AD.tag || "";
    adminAdBtnText.value = AD.btnText || "";
    updateAdPreview();
  }

  function updateAdPreview(){
    if(!adPreviewText) return;
    adPreviewText.innerText = adminAdText.value || "اكتب نص الإعلان الذي تريده...";
    if(adPreviewBtn) adPreviewBtn.innerText = adminAdBtnText.value || "احجز الآن";
    if(adPreviewBox) adPreviewBox.style.display = (adminAdEnabled.checked && adminAdText.value.trim() !== "") ? "flex" : "none";
  }

  adminAdText?.addEventListener("input", updateAdPreview);
  adminAdBtnText?.addEventListener("input", updateAdPreview);
  adminAdEnabled?.addEventListener("change", updateAdPreview);

  document.getElementById("btn-save-ad")?.addEventListener("click", () => {
    AD = {
      enabled: adminAdEnabled.checked,
      text: adminAdText.value.trim(),
      tag: adminAdTag.value.trim(),
      btnText: adminAdBtnText.value.trim()
    };
    syncAdToFirebase(AD);
    renderPublicAd();
    showToast("تم حفظ ونشر الإعلان في أعلى الموقع بنجاح ✔");
  });

  document.getElementById("btn-delete-ad")?.addEventListener("click", () => {
    if(confirm("هل تريد حذف وإلغاء شريط الإعلان تماماً؟")){
      AD = Object.assign({}, EMPTY_AD);
      syncAdToFirebase(AD);
      renderPublicAd();
      loadAdminAd();
      showToast("تم إلغاء شريط الإعلان بنجاح.");
    }
  });

  // تبويبات لوحة التحكم المركزية
  const adminTabBtns = document.querySelectorAll(".admin-tab-btn");
  const adminTabPanes = document.querySelectorAll(".admin-tab-pane");
  const adminPageTitle = document.getElementById("admin-page-title");

  const adminTitles = {
    "admin-tab-units": "إدارة الشقق والوحدات المعروضة",
    "admin-tab-students": "سجل الطلاب والسكن الجامعي",
    "admin-tab-ads": "نظام الإعلانات والعروض الترويجية",
    "admin-tab-stats": "الإحصائيات والملخص المالي"
  };

  adminTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-admin-tab");
      adminTabBtns.forEach(b => b.classList.remove("active"));
      adminTabPanes.forEach(p => p.style.display = "none");
      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if(targetPane) targetPane.style.display = "block";
      if(adminPageTitle) adminPageTitle.innerText = adminTitles[targetId] || "لوحة التحكم";
      if(targetId === "admin-tab-students") renderStudentsTable();
      if(targetId === "admin-tab-units") renderAdminTable();
      if(targetId === "admin-tab-ads") loadAdminAd();
    });
  });

  // ========================================================
  // 8. الدخول الآمن والرقم السري (Authentication & Security)
  // ========================================================
  const passcodeModal = document.getElementById("admin-passcode-modal");
  const passcodeForm = document.getElementById("passcode-form");
  const passcodeInput = document.getElementById("passcode-input");
  const passcodeErr = document.getElementById("passcode-err");
  const adminPanel = document.getElementById("integrated-admin-panel");

  // الجلسة تنتهي بإغلاق التبويب
  try { if(auth) auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(() => {}); } catch(e){}

  function openDashboard(){
    isAdmin = true;
    if(adminPanel) adminPanel.classList.add("open");
    document.body.style.overflow = "hidden";
    renderAdminTable();
    loadAdminAd();
    renderStudentsTable();
  }

  function closeDashboard(){
    isAdmin = false;
    if(adminPanel) adminPanel.classList.remove("open");
    document.body.style.overflow = "auto";
    renderPublicProperties();
    renderPublicAd();
  }

  function triggerLoginPrompt(){
    if(isAdmin){
      openDashboard();
    } else if(isSignedAdmin()){
      (studentsLoaded ? Promise.resolve(true) : loadStudentsFromFirebase()).then(() => openDashboard());
    } else {
      if(passcodeModal) passcodeModal.classList.add("show");
      if(passcodeInput) { passcodeInput.value = ""; setTimeout(() => passcodeInput.focus(), 150); }
      if(passcodeErr) passcodeErr.style.display = "none";
    }
  }

  // فتح نافذة الدخول من القائمة أو الزر العائم
  document.getElementById("nav-admin-trigger")?.addEventListener("click", (e) => {
    e.preventDefault();
    triggerLoginPrompt();
  });
  document.getElementById("drawer-admin-trigger")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeMobileDrawer();
    triggerLoginPrompt();
  });
  document.getElementById("footer-admin-trigger")?.addEventListener("click", (e) => {
    e.preventDefault();
    triggerLoginPrompt();
  });
  document.getElementById("floating-admin-trigger")?.addEventListener("click", triggerLoginPrompt);

  document.getElementById("passcode-cancel")?.addEventListener("click", () => {
    passcodeModal?.classList.remove("show");
  });

  passcodeModal?.addEventListener("click", (e) => {
    if(e.target === passcodeModal) passcodeModal.classList.remove("show");
  });

  passcodeForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const entered = (passcodeInput?.value || "").trim();
    const showErr = (m) => {
      if(passcodeErr){ passcodeErr.style.display = "block"; passcodeErr.innerText = m; }
    };
    if(!auth){ showErr("تعذر الاتصال بخدمة الدخول، تأكد من الإنترنت وأعد تحميل الصفحة."); return; }
    if(!entered){ showErr("اكتب كلمة السر."); return; }
    const submitBtn = passcodeForm.querySelector('button[type="submit"]');
    if(submitBtn) submitBtn.disabled = true;
    try {
      await auth.signInWithEmailAndPassword(CFG.ADMIN_EMAIL, entered);
      await loadStudentsFromFirebase();
      passcodeModal?.classList.remove("show");
      if(passcodeErr) passcodeErr.style.display = "none";
      if(passcodeInput) passcodeInput.value = "";
      openDashboard();
      showToast("مرحباً بك في لوحة تحكم كيان سيتي! 👑");
    } catch(err){
      const c = (err && err.code) || "";
      if(c === "auth/too-many-requests") showErr("محاولات كثيرة، حاول مرة أخرى بعد قليل.");
      else if(c === "auth/network-request-failed") showErr("لا يوجد اتصال بالإنترنت.");
      else showErr("كلمة السر غير صحيحة، حاول مرة أخرى.");
      passcodeInput?.select();
    } finally {
      if(submitBtn) submitBtn.disabled = false;
    }
  });

  document.getElementById("btn-return-site")?.addEventListener("click", closeDashboard);
  document.getElementById("btn-logout-panel")?.addEventListener("click", () => {
    closeDashboard();
    try { if(auth) auth.signOut(); } catch(e){}
    studentsLoaded = false;
    STUDENTS = [];
    try { localStorage.removeItem("kayan_students_cache"); } catch(e){}
    showToast("تم قفل لوحة التحكم بنجاح.");
  });

  // نافذة تغيير الرقم السري
  const changePassModal = document.getElementById("admin-change-passcode-modal");
  document.getElementById("btn-open-change-passcode")?.addEventListener("click", () => {
    if(changePassModal) changePassModal.classList.add("open");
  });
  document.getElementById("btn-close-change-passcode")?.addEventListener("click", () => {
    if(changePassModal) changePassModal.classList.remove("open");
  });

  document.getElementById("form-change-passcode")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const oldP = document.getElementById("input-old-passcode").value.trim();
    const newP = document.getElementById("input-new-passcode").value.trim();
    const confirmP = document.getElementById("input-confirm-passcode").value.trim();

    if(!isSignedAdmin()){
      alert("انتهت الجلسة، سجّل الدخول مرة أخرى.");
      return;
    }
    if(newP.length < 8){
      alert("كلمة السر الجديدة يجب أن تتكون من 8 خانات على الأقل!");
      return;
    }
    if(newP !== confirmP){
      alert("تأكيد كلمة السر غير متطابق!");
      return;
    }
    try {
      const cred = firebase.auth.EmailAuthProvider.credential(CFG.ADMIN_EMAIL, oldP);
      await auth.currentUser.reauthenticateWithCredential(cred);
      await auth.currentUser.updatePassword(newP);
      changePassModal?.classList.remove("open");
      e.target.reset();
      showToast("تم تحديث كلمة السر بنجاح ✔");
    } catch(err){
      const c = (err && err.code) || "";
      if(c === "auth/weak-password") alert("كلمة السر الجديدة ضعيفة، اختر كلمة أقوى.");
      else alert("كلمة السر الحالية غير صحيحة!");
    }
  });

  // نافذة وقواعد Firebase
  const fbModal = document.getElementById("admin-firebase-modal");
  document.getElementById("btn-open-firebase-settings")?.addEventListener("click", () => {
    if(fbModal) fbModal.classList.add("open");
  });
  document.getElementById("db-status-pill")?.addEventListener("click", () => {
    if(fbModal) fbModal.classList.add("open");
  });
  document.getElementById("btn-close-firebase-modal")?.addEventListener("click", () => {
    if(fbModal) fbModal.classList.remove("open");
  });

  // اختبار الاتصال بـ Firebase فوراً
  document.getElementById("btn-test-firebase-connection")?.addEventListener("click", async () => {
    showToast("جاري اختبار الاتصال بقاعدة Firebase...");
    const ok = await syncAllStudentsToFirebase();
    if(ok){
      alert("الاتصال ناجح تماماً! تم تحديث ومزامنة البيانات في قاعدة بيانات Firebase بنجاح.");
    } else {
      alert("تنبيه: قاعدة البيانات رفضت الاتصال (Permission denied). يرجى نسخ القواعد الظاهرة ولصقها في Firebase Console > Realtime Database > Rules.");
    }
  });

  // نسخ قواعد Firebase
  document.getElementById("btn-copy-firebase-rules")?.addEventListener("click", () => {
    const rulesText = document.getElementById("firebase-rules-snippet")?.innerText;
    if(rulesText){
      navigator.clipboard.writeText(rulesText).then(() => {
        showToast("تم نسخ قواعد Firebase بنجاح ✔");
      });
    }
  });

  // ========================================================
  // 9. القائمة المتجاوبة للهواتف والموبايل (Mobile Drawer)
  // ========================================================
  const mobileToggle = document.getElementById("mobile-nav-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");

  function closeMobileDrawer(){
    if(mobileDrawer) mobileDrawer.classList.remove("open");
    if(mobileToggle) mobileToggle.classList.remove("open");
  }

  if(mobileToggle && mobileDrawer){
    mobileToggle.addEventListener("click", () => {
      const isOpen = mobileDrawer.classList.toggle("open");
      mobileToggle.classList.toggle("open", isOpen);
    });

    mobileDrawer.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMobileDrawer);
    });
  }

  // معالجة نموذج الحجز العام
  document.getElementById("booking-request-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("book-name")?.value || "";
    const phone = document.getElementById("book-phone")?.value || "";
    const type = document.getElementById("book-type")?.value || "";

    const msg = `طلب معاينة وحجز من الموقع الإلكتروني:\nالاسم: ${name}\nالموبايل: ${phone}\nنوع الطلب: ${type}`;
    window.open(`https://wa.me/201017006541?text=${encodeURIComponent(msg)}`, "_blank");
    showToast("تم إرسال طلبك بنجاح! سيتواصل معك فريق كيان سيتي فوراً.");
    e.target.reset();
  });

  // ========================================================
  // 10. الإقلاع والتهيئة الفورية
  // ========================================================
  renderPublicAd();
  renderPublicProperties("all");
  initFirebaseSync();

  // ضبط النمط المتجاوب لعرض الطلاب
  setStudentViewMode(currentStudentView);

})();
