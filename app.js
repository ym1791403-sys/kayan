/**
 * ========================================================
 * كيان سيتي للتطوير العقاري وإدارة الأصول (Kayan City)
 * ملف الربط الموحد (Main Universal Bridge)
 * 
 * تم تنظيم وتقسيم كود الموقع بالكامل داخل مجلد /js/:
 * 1. js/config.js      -> إعدادات فايربيس، أرقام الإدارة، وبيانات التواصل.
 * 2. js/db.js          -> محرك قاعدة البيانات والمزامنة الفورية.
 * 3. js/hero-3d.js     -> المشهد المعماري ثلاثي الأبعاد والتحريك مع السكرول.
 * 4. js/properties.js  -> نظام عرض وإدارة الشقق والفلترة وضغط الصور.
 * 5. js/students.js    -> سجل الطلاب وسكن الطالبات والشهور وتصدير إكسيل.
 * 6. js/requests.js    -> طلبات الحجز والترقيم التسلسلي (1، 2، 3) والواتساب.
 * 7. js/ads.js         -> شريط الإعلانات والعروض الترويجية في أعلى الموقع.
 * 8. js/admin.js       -> لوحة الإدارة المركزية وتأكيد الحذف بكلمة السر.
 * 9. js/app.js         -> نقطة الانطلاق والتشغيل العام للموقع.
 * ========================================================
 */

(function(){
  // إذا كانت الوحدات تم تحميلها بالفعل عبر index.html، لا داعي لإعادة التحميل
  if(window.Kayan && window.Kayan.db) return;

  const scripts = [
    "js/config.js",
    "js/db.js",
    "js/hero-3d.js",
    "js/properties.js",
    "js/students.js",
    "js/requests.js",
    "js/ads.js",
    "js/admin.js",
    "js/app.js"
  ];

  function loadNext(idx){
    if(idx >= scripts.length) return;
    const s = document.createElement("script");
    s.src = scripts[idx];
    s.onload = () => loadNext(idx + 1);
    s.onerror = () => loadNext(idx + 1);
    document.body.appendChild(s);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => loadNext(0));
  } else {
    loadNext(0);
  }
})();
