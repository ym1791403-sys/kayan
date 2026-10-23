/**
 * ========================================================
 * كيان سيتي للتطوير العقاري
 * 2. المشهد ثلاثي الأبعاد والتحريك مع السكرول (Hero 3D Scene)
 * ========================================================
 */

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