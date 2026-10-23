/**
 * ========================================================
 * كيان سيتي للتطوير العقاري
 * 8. لوحة الإدارة المركزية وحماية الحذف بكلمة السر (Admin Module)
 * ========================================================
 */

window.Kayan = window.Kayan || {};

(function(K){
  const CFG = window.KAYAN_CONFIG || {};
  const dbEngine = K.db;
  const showToast = dbEngine.showToast;
  const auth = dbEngine.auth;

  // عناصر لوحة التحكم
  const adminPanel = document.getElementById("integrated-admin-panel");
  const returnSiteBtn = document.getElementById("btn-return-site");
  const logoutPanelBtn = document.getElementById("btn-logout-panel");
  const floatTrigger = document.getElementById("floating-admin-trigger");

  // نافذة الدخول بكلمة السر
  const passcodeModal = document.getElementById("admin-passcode-modal");
  const passcodeForm = document.getElementById("passcode-form");
  const passcodeInput = document.getElementById("passcode-input");
  const passcodeCancel = document.getElementById("passcode-cancel");
  const passcodeErr = document.getElementById("passcode-err");

  // ========================================================
  // نظام الحماية ضد الهجمات والتخمين وحقن البيانات (Anti-Brute Force & Anti-Injection)
  // ========================================================
  const STORAGE_LOCKOUT_KEY = "kayan_sec_lockout_until";
  const STORAGE_ATTEMPTS_KEY = "kayan_sec_failed_attempts";

  function getLockoutRemaining(){
    const until = parseInt(localStorage.getItem(STORAGE_LOCKOUT_KEY) || "0", 10);
    const now = Date.now();
    if(until > now){
      return Math.ceil((until - now) / 1000);
    }
    return 0;
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

  // فحص وتعقيم كلمة السر ومنع ثغرات الحقن وتجاوز السعة (Buffer Overflow & Injection Payloads)
  function sanitizeAndValidatePass(raw){
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

  // تبويبات لوحة التحكم
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
      if(adminPageTitle) adminPageTitle.innerText = adminTitles[targetId] || "لوحة التحكم";

      if(targetId === "admin-tab-students" && K.students) K.students.renderStudentsTable();
      if(targetId === "admin-tab-units" && K.properties) K.properties.renderAdminTable();
      if(targetId === "admin-tab-requests" && K.requests) K.requests.renderRequestsTable();
    });
  });

  // فتح وإغلاق لوحة التحكم
  async function openDashboard(){
    if(!auth || !(await dbEngine.refreshAdminState(auth.currentUser))){
      showToast("غير مصرح لك بالدخول إلى لوحة التحكم.");
      return;
    }
    if(adminPanel) adminPanel.classList.add("open");
    document.body.style.overflow = "hidden";

    if(K.properties) K.properties.renderAdminTable();
    if(K.ads) K.ads.loadAdminAd();
    try {
      await dbEngine.loadStudents();
    } catch(e){
      console.error(e);
      showToast("تعذر تحميل سجل الطلاب: " + (e.message || ""));
    }
    if(K.students) K.students.renderStudentsTable();
    try {
      await dbEngine.loadRequests();
    } catch(e){
      console.error(e);
    }
    if(K.requests) K.requests.renderRequestsTable();
  }

  function closeDashboard(){
    if(adminPanel) adminPanel.classList.remove("open");
    document.body.style.overflow = "auto";
    if(K.properties) K.properties.renderPublicProperties();
    if(K.ads) K.ads.renderPublicAd();
  }

  function triggerLoginPrompt(){
    if(dbEngine.getIsAdmin()){
      openDashboard();
    } else {
      if(passcodeModal) passcodeModal.classList.add("show");
      if(passcodeInput) passcodeInput.value = "";
      if(passcodeErr) passcodeErr.style.display = "none";
      if(!updateLockoutUI()){
        setTimeout(() => { if(passcodeInput) passcodeInput.focus(); }, 150);
      }
    }
  }

  if(floatTrigger){
    floatTrigger.addEventListener("click", triggerLoginPrompt);
  }

  if(passcodeCancel && passcodeModal){
    passcodeCancel.addEventListener("click", () => {
      passcodeModal.classList.remove("show");
    });
  }

  if(passcodeModal){
    passcodeModal.addEventListener("click", (e) => {
      if(e.target === passcodeModal) passcodeModal.classList.remove("show");
    });
  }

  if(passcodeForm){
    passcodeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = passcodeForm.querySelector('button[type="submit"]');
      const fail = (m) => {
        if(passcodeErr){
          passcodeErr.textContent = m;
          passcodeErr.style.display = "block";
        }
      };

      if(updateLockoutUI()) return;

      if(!auth) return fail("قاعدة البيانات غير مربوطة بعد — راجع إعدادات KAYAN_CONFIG.FIREBASE.");

      const rawPass = passcodeInput ? passcodeInput.value : "";
      const validation = sanitizeAndValidatePass(rawPass);
      if(!validation.valid){
        return fail(validation.message);
      }
      const pass = validation.pass;

      if(btn) btn.disabled = true;

      const explain = (err) => {
        const c = (err && err.code) || "";
        if(c === "auth/network-request-failed") return "تعذر الاتصال بالإنترنت، حاول مرة أخرى";
        if(c === "auth/operation-not-allowed") return "فعّل Email/Password من Firebase Authentication";
        if(c === "auth/too-many-requests") return "محاولات كثيرة جداً، تم قفل الدخول مؤقتاً لحماية الموقع";
        if(c === "auth/operation-not-supported-in-this-environment") return "افتح الموقع من رابط https";
        if(c === "auth/weak-password") return "الرقم السري لازم يكون 6 خانات على الأقل";
        if(c === "auth/invalid-credential" || c === "auth/wrong-password") return "الرقم السري غير صحيح!";
        if(c === "auth/api-key-not-valid" || c === "auth/invalid-api-key") return "مفتاح Firebase غير صحيح";
        return "تعذر الدخول (" + (c || "خطأ غير معروف") + ")";
      };

      try {
        await auth.signInWithEmailAndPassword(CFG.ADMIN_EMAIL, pass);
      } catch(err){
        if(btn) btn.disabled = false;
        const c = (err && err.code) || "";

        // تسجيل المحاولة الفاشلة وتفعيل القفل التلقائي
        recordFailedLogin();
        if(updateLockoutUI()) return;

        if(c === "auth/user-not-found"){
          try {
            await auth.createUserWithEmailAndPassword(CFG.ADMIN_EMAIL, pass);
          } catch(e2){
            return fail(explain(e2));
          }
        } else {
          return fail(explain(err));
        }
      }

      if(!(await dbEngine.refreshAdminState(auth.currentUser))){
        await auth.signOut();
        if(btn) btn.disabled = false;
        recordFailedLogin();
        updateLockoutUI();
        return fail("هذا الحساب غير مصرح له بالدخول إلى لوحة التحكم.");
      }

      // الدخول ناجح: مسح العدادات وفتح اللوحة
      clearLockout();
      if(btn) btn.disabled = false;
      if(passcodeInput) passcodeInput.value = "";
      if(passcodeErr) passcodeErr.style.display = "none";
      if(passcodeModal) passcodeModal.classList.remove("show");
      openDashboard();
      showToast("مرحباً بك في لوحة تحكم كيان سيتي!");
    });
  }

  // نافذة تأكيد الحذف بكلمة السر (Security Delete Confirmation Modal)
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

  if(deleteModalCancel) deleteModalCancel.addEventListener("click", closeDeleteModal);
  if(deleteModal){
    deleteModal.addEventListener("click", (e) => {
      if(e.target === deleteModal) closeDeleteModal();
    });
  }

  if(deleteModalForm){
    deleteModalForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const raw = (deleteModalInput ? deleteModalInput.value : "").trim();
      const validation = sanitizeAndValidatePass(raw);
      if(!validation.valid){
        if(deleteModalErr){
          deleteModalErr.textContent = validation.message;
          deleteModalErr.style.display = "block";
        }
        return;
      }
      const pass = validation.pass;

      if(deleteModalSubmit){
        deleteModalSubmit.disabled = true;
        deleteModalSubmit.textContent = "جارٍ التحقق من كلمة السر...";
      }

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

        if(deleteModalSubmit){
          deleteModalSubmit.disabled = false;
          deleteModalSubmit.textContent = "تأكيد الحذف نهائياً";
        }
        const actionToRun = pendingDeleteAction;
        closeDeleteModal();
        if(typeof actionToRun === "function"){
          await actionToRun();
        }
      } catch(err){
        if(deleteModalSubmit){
          deleteModalSubmit.disabled = false;
          deleteModalSubmit.textContent = "تأكيد الحذف نهائياً";
        }
        if(deleteModalErr){
          deleteModalErr.textContent = "الرقم السري غير صحيح! تعذر إجراء الحذف.";
          deleteModalErr.style.display = "block";
        }
        if(deleteModalInput){
          deleteModalInput.focus();
          deleteModalInput.select();
        }
      }
    });
  }

  // قائمة الموبايل العلوية (Hamburger Drawer)
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

  // أزرار العودة للموقع وتسجيل الخروج
  if(returnSiteBtn) returnSiteBtn.addEventListener("click", closeDashboard);

  if(logoutPanelBtn){
    logoutPanelBtn.addEventListener("click", () => {
      dbEngine.setIsAdmin(false);
      dbEngine.saveStudents([]);
      if(auth) auth.signOut();
      closeDashboard();
      showToast("تم قفل لوحة التحكم بنجاح.");
    });
  }

  // مستمعات تفويض الأحداث على جداول لوحة التحكم
  document.getElementById("admin-units-tbody")?.addEventListener("change", (e) => {
    const select = e.target.closest('[data-admin-action="change-property-status"]');
    if(select && window.adminChangeStatus) window.adminChangeStatus(select.dataset.propertyId, select.value);
  });

  document.getElementById("admin-units-tbody")?.addEventListener("click", (e) => {
    const control = e.target.closest("[data-admin-action]");
    if(!control) return;
    if(control.dataset.adminAction === "edit-property" && window.adminEditProp) window.adminEditProp(control.dataset.propertyId);
    if(control.dataset.adminAction === "delete-property" && window.adminDeleteProp) window.adminDeleteProp(control.dataset.propertyId);
  });

  document.getElementById("admin-students-tbody")?.addEventListener("click", (e) => {
    const control = e.target.closest("[data-admin-action]");
    if(!control) return;
    if(control.dataset.adminAction === "toggle-student-month" && window.adminToggleStudentMonth) window.adminToggleStudentMonth(control.dataset.studentId, control.dataset.month);
    if(control.dataset.adminAction === "edit-student" && window.adminEditStudent) window.adminEditStudent(control.dataset.studentId);
    if(control.dataset.adminAction === "delete-student" && window.adminDeleteStudent) window.adminDeleteStudent(control.dataset.studentId);
  });

  // تصدير دوال الإدارة
  K.admin = {
    openDashboard: openDashboard,
    closeDashboard: closeDashboard,
    triggerLoginPrompt: triggerLoginPrompt,
    requestDeleteWithPassword: requestDeleteWithPassword,
    closeDeleteModal: closeDeleteModal,
    sanitizeAndValidatePass: sanitizeAndValidatePass
  };

  window.requestDeleteWithPassword = requestDeleteWithPassword;

})(window.Kayan);
