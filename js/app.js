/**
 * ========================================================
 * كيان سيتي للتطوير العقاري
 * 9. ملف التشغيل والانطلاق الرئيسي للموقع (Main App Bootstrapper)
 * ========================================================
 */

window.Kayan = window.Kayan || {};

(function(K){
  const dbEngine = K.db;
  if(!dbEngine) return;

  // تهيئة وعرض الإعلانات والشقق العامة فوراً
  if(K.ads && K.ads.renderPublicAd) K.ads.renderPublicAd();
  if(K.properties && K.properties.renderPublicProperties) K.properties.renderPublicProperties("all");

  const db = dbEngine.rawDb;
  const auth = dbEngine.auth;

  if(db && auth){
    auth.onAuthStateChanged(async (user) => {
      const isAdmin = await dbEngine.refreshAdminState(user);
      if(isAdmin){
        try { await dbEngine.loadStudents(); } catch(e){}
        try { await dbEngine.loadRequests(); } catch(e){}
      }
    });

    dbEngine.loadPublic();
  } else {
    if(K.properties && K.properties.renderPublicProperties) K.properties.renderPublicProperties();
    console.warn("Kayan: قاعدة البيانات غير مربوطة — يرجى مراجعة إعدادات Firebase في js/config.js");
  }

})(window.Kayan);
