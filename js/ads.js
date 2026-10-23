/**
 * ========================================================
 * كيان سيتي للتطوير العقاري
 * 7. شريط الإعلانات والعروض الترويجية (Ads Banner Module)
 * ========================================================
 */

window.Kayan = window.Kayan || {};

(function(K){
  const dbEngine = K.db;
  const showToast = dbEngine.showToast;
  const getAd = dbEngine.getAd;
  const saveAd = dbEngine.saveAd;

  // عرض شريط الإعلان في أعلى الموقع للزوار
  function renderPublicAd(){
    const ad = getAd();
    const adBar = document.getElementById("ad-announcement-bar");
    if(ad && ad.enabled && ad.text && ad.text.trim() !== "" && adBar){
      adBar.style.display = "flex";
      const txtEl = document.getElementById("ad-text-content");
      const pillEl = document.getElementById("ad-pill");
      const btnEl = document.getElementById("ad-action-btn");
      if(txtEl) txtEl.innerText = ad.text || "";
      if(pillEl) pillEl.innerText = ad.tag || "عرض خاص";
      if(btnEl) btnEl.innerText = ad.btnText || "احجز الآن";
    } else if(adBar){
      adBar.style.display = "none";
    }
  }

  // عناصر التحكم في الإعلان داخل لوحة الإدارة
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
    if(adminAdEnabled) adminAdEnabled.checked = a.enabled || false;
    if(adminAdText) adminAdText.value = a.text || "";
    if(adminAdTag) adminAdTag.value = a.tag || "";
    if(adminAdBtnText) adminAdBtnText.value = a.btnText || "";
    updateAdPreview();
  }

  function updateAdPreview(){
    if(!adPreviewText || !adPreviewBox) return;
    adPreviewText.innerText = (adminAdText && adminAdText.value) || "اكتب نص الإعلان الذي تريده...";
    if(adPreviewBtn) adPreviewBtn.innerText = (adminAdBtnText && adminAdBtnText.value) || "احجز الآن";
    adPreviewBox.style.display = (adminAdEnabled && adminAdEnabled.checked && adminAdText && adminAdText.value.trim() !== "") ? "flex" : "none";
  }

  if(adminAdText) adminAdText.addEventListener("input", updateAdPreview);
  if(adminAdBtnText) adminAdBtnText.addEventListener("input", updateAdPreview);
  if(adminAdEnabled) adminAdEnabled.addEventListener("change", updateAdPreview);

  if(btnSaveAd){
    btnSaveAd.addEventListener("click", () => {
      const a = {
        enabled: adminAdEnabled ? adminAdEnabled.checked : false,
        text: (adminAdText ? adminAdText.value : "").trim(),
        tag: (adminAdTag ? adminAdTag.value : "").trim(),
        btnText: (adminAdBtnText ? adminAdBtnText.value : "").trim()
      };
      saveAd(a);
      renderPublicAd();
      showToast("تم حفظ الإعلان ونشره بالموقع بنجاح!");
    });
  }

  if(btnDeleteAd){
    btnDeleteAd.addEventListener("click", () => {
      if(K.admin && K.admin.requestDeleteWithPassword){
        K.admin.requestDeleteWithPassword("هل تريد بالتأكيد حذف شريط الإعلان وإلغاء تفعيله تماماً من الموقع؟", () => {
          if(adminAdEnabled) adminAdEnabled.checked = false;
          if(adminAdText) adminAdText.value = "";
          if(adminAdTag) adminAdTag.value = "";
          if(adminAdBtnText) adminAdBtnText.value = "";
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
      }
    });
  }

  // تصدير دوال الإعلانات
  K.ads = {
    renderPublicAd: renderPublicAd,
    loadAdminAd: loadAdminAd,
    updateAdPreview: updateAdPreview
  };

})(window.Kayan);
