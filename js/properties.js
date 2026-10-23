/**
 * ========================================================
 * كيان سيتي للتطوير العقاري
 * 4. إدارة وعرض الشقق والوحدات العقارية (Properties Module)
 * ========================================================
 */

window.Kayan = window.Kayan || {};

(function(K){
  const dbEngine = K.db;
  const esc = dbEngine.esc;
  const showToast = dbEngine.showToast;
  const getProps = dbEngine.getProps;
  const saveProps = dbEngine.saveProps;
  const PH = dbEngine.PH;

  // 1. عرض الشقق في الواجهة العامة للموقع (Public Listing)
  let publicFilter = "all", publicLimit = 24;

  function renderPublicProperties(filter){
    if(filter && filter !== publicFilter) publicLimit = 24;
    publicFilter = filter || publicFilter;
    const props = getProps();
    const filtered = publicFilter === "all" ? props : props.filter(p => p.category === publicFilter);
    const grid = document.getElementById("properties-grid");
    if(!grid) return;
    if(!dbEngine.getLoaded() && dbEngine.rawDb){
      grid.innerHTML = '<div class="empty-state-box"><p style="color:var(--text-muted)">جاري تحميل الوحدات…</p></div>';
      return;
    }
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
          <img src="${esc(p.image || PH)}" alt="${esc(p.title)}" loading="lazy" decoding="async">
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
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>${esc(p.rooms)}</span>
            </div>
            <div class="card-feature-item">
              <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span>${esc(p.baths)}</span>
            </div>
          </div>
          <div class="card-foot">
            ${isSold ? `
              <div class="btn-sold">تم حجز وبيغ الوحدة بالكامل</div>
            ` : `
              <a href="#contact" class="btn-primary" style="flex:1; justify-content:center;">طلب معاينة وحجز</a>
              <a href="https://wa.me/201017006541?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن الشقة المعروضة في موقع كيان سيتي: ' + (p.title || ''))}" target="_blank" rel="noopener" class="btn-outline" style="padding:9px 14px;" title="محادثة واتساب سريعة">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </a>
            `}
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    const moreBtn = document.getElementById("btn-load-more-props");
    if(moreBtn){
      moreBtn.style.display = filtered.length > publicLimit ? "inline-flex" : "none";
    }
  }

  // فلترة الشقق في الواجهة الرئيسية عبر الأزرار
  document.querySelectorAll(".filter-tabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-tabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPublicProperties(btn.getAttribute("data-filter"));
    });
  });

  document.getElementById("btn-load-more-props")?.addEventListener("click", () => {
    publicLimit += 24;
    renderPublicProperties();
  });

  // فلاتر شريط البحث في الهيرو
  const heroSearchInput = document.getElementById("hero-search-input");
  const heroTypeFilter = document.getElementById("hero-type-filter");
  const heroPriceFilter = document.getElementById("hero-price-filter");
  const btnHeroSearch = document.getElementById("btn-hero-search");

  function runHeroSearch(){
    const text = (heroSearchInput?.value || "").toLowerCase().trim();
    const type = heroTypeFilter?.value || "all";
    const priceMax = parseInt(heroPriceFilter?.value || "999999999", 10);

    const props = getProps();
    const filtered = props.filter(p => {
      const matchText = !text || (p.title && p.title.toLowerCase().includes(text)) || (p.location && p.location.toLowerCase().includes(text));
      const matchType = type === "all" || p.category === type;
      const numPrice = parseInt(String(p.price || "").replace(/[^\d]/g, ""), 10) || 0;
      const matchPrice = isNaN(priceMax) || numPrice <= priceMax;
      return matchText && matchType && matchPrice;
    });

    const grid = document.getElementById("properties-grid");
    if(!grid) return;
    grid.scrollIntoView({ behavior: "smooth", block: "start" });

    // تحديث الأزرار لتكون مخصصة للبحث
    document.querySelectorAll(".filter-tabs .tab-btn").forEach(b => b.classList.remove("active"));
    
    // عرض نتائج البحث
    publicLimit = 50;
    grid.innerHTML = "";
    if(filtered.length === 0){
      grid.innerHTML = `
        <div class="empty-state-box">
          <h3 style="color:#fff; font-size:1.4rem; margin-bottom:8px;">لم نجد شققاً مطابقة لبحثك</h3>
          <p style="color:var(--text-muted); font-size:0.95rem; margin-bottom:16px;">جرب تغيير معايير البحث أو اختيار نوع آخر من الوحدات.</p>
          <button type="button" class="btn-primary" onclick="window.Kayan.properties.renderPublicProperties('all')">عرض كل الشقق</button>
        </div>
      `;
      return;
    }
    renderPublicProperties();
  }

  if(btnHeroSearch) btnHeroSearch.addEventListener("click", runHeroSearch);

  // 2. جدول الشقق داخل لوحة تحكم الإدارة (Admin Properties Table)
  function renderAdminTable(){
    const tbody = document.getElementById("admin-units-tbody");
    if(!tbody) return;
    tbody.innerHTML = "";

    const props = getProps();
    let total = props.length, avail = 0, res = 0, sold = 0;
    let totalVal = 0, soldVal = 0;

    props.forEach(p => {
      if(p.status === "available") avail++;
      else if(p.status === "reserved") res++;
      else if(p.status === "sold") sold++;

      const numVal = parseInt(String(p.price || "").replace(/[^\d]/g, "")) || 0;
      totalVal += numVal;
      if(p.status === "sold") soldVal += numVal;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${esc(p.image || PH)}" style="width:52px; height:40px; border-radius:6px; object-fit:cover; border:1px solid var(--border-subtle);">
            <div>
              <b style="color:#fff; font-size:0.95rem; display:block;">${esc(p.title)}</b>
              <span style="font-size:0.8rem; color:var(--text-muted);">${esc(p.location)}</span>
            </div>
          </div>
        </td>
        <td><span class="category-badge">${esc(p.category || 'عائلي')}</span></td>
        <td><strong style="color:var(--gold-light); font-size:0.95rem;">${esc(p.price)}</strong></td>
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

    const elTotal = document.getElementById("kpi-total-units");
    const elAvail = document.getElementById("kpi-avail-units");
    const elRes = document.getElementById("kpi-res-units");
    const elSold = document.getElementById("kpi-sold-units");
    if(elTotal) elTotal.innerText = total;
    if(elAvail) elAvail.innerText = avail;
    if(elRes) elRes.innerText = res;
    if(elSold) elSold.innerText = sold;

    const elTotVal = document.getElementById("stats-total-val");
    const elSoldVal = document.getElementById("stats-sold-val");
    const elOcc = document.getElementById("stats-occupancy");
    if(elTotVal) elTotVal.innerText = totalVal.toLocaleString() + " ج.م";
    if(elSoldVal) elSoldVal.innerText = soldVal.toLocaleString() + " ج.م";
    const occ = total > 0 ? Math.round(((res + sold) / total) * 100) : 0;
    if(elOcc) elOcc.innerText = occ + "%";
  }

  // تغيير حالة الشقة مباشرة
  function adminChangeStatus(id, newStatus){
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
  }

  // حذف شقة (مؤمن بكلمة سر لوحة التحكم في فايربيس)
  function adminDeleteProp(id){
    const prop = getProps().find(p => p.id === id);
    const title = prop && prop.title ? `الشقة "${prop.title}"` : "هذه الشقة";
    if(K.admin && K.admin.requestDeleteWithPassword){
      K.admin.requestDeleteWithPassword(`هل أنت متأكد من رغبتك في حذف ${title} نهائياً؟`, () => {
        let props = getProps();
        props = props.filter(p => p.id !== id);
        saveProps(props);
        renderAdminTable();
        renderPublicProperties();
        showToast("تم حذف الشقة بنجاح بعد التحقق من كلمة السر!");
      });
    }
  }

  // مسح كافة الوحدات من الصفر
  document.getElementById("btn-clear-all-units")?.addEventListener("click", () => {
    if(K.admin && K.admin.requestDeleteWithPassword){
      K.admin.requestDeleteWithPassword("تحذير أمني شديد: هل أنت متأكد من رغبتك في مسح كافة الشقق المسجلة من الصفر؟", () => {
        saveProps([]);
        renderAdminTable();
        renderPublicProperties();
        showToast("تم مسح كافة الوحدات بنجاح بعد التحقق من كلمة السر!");
      });
    }
  });

  // فتح نافذة تعديل الشقة
  function adminEditProp(id){
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

    document.getElementById("admin-property-modal")?.classList.add("open");
  }

  // رفع وضغط الصورة تلقائياً
  function okImg(u){
    u = String(u || "").trim();
    return /^(https?:\/\/|data:image\/(png|jpe?g|gif|webp);)/i.test(u) ? u : "";
  }

  function setPropImage(v){
    v = v || "";
    const input = document.getElementById("form-prop-image");
    if(input) input.value = v;
    const prev = document.getElementById("form-prop-image-preview");
    const ok = okImg(v);
    if(prev){
      if(ok){ prev.src = ok; prev.style.display = "block"; }
      else { prev.removeAttribute("src"); prev.style.display = "none"; }
    }
    const urlInput = document.getElementById("form-prop-image-url");
    if(urlInput) urlInput.value = (v && !/^data:/i.test(v)) ? v : "";
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

  document.getElementById("form-prop-file")?.addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if(!f) return;
    showToast("جاري تجهيز الصورة...");
    try { setPropImage(await compressImage(f)); showToast("تم اختيار الصورة ✔"); }
    catch(err){ showToast("⚠️ " + (err && err.message ? err.message : "تعذر رفع الصورة")); }
  });

  document.getElementById("form-prop-image-url")?.addEventListener("input", (e) => {
    const v = e.target.value.trim();
    if(!v) return;
    document.getElementById("form-prop-image").value = v;
    const prev = document.getElementById("form-prop-image-preview");
    const ok = okImg(v);
    if(prev){
      if(ok){ prev.src = ok; prev.style.display = "block"; } else { prev.style.display = "none"; }
    }
  });

  document.getElementById("form-prop-image-clear")?.addEventListener("click", () => setPropImage(""));

  // نوافذ إضافة وحدة جديدة
  const addModal = document.getElementById("admin-property-modal");
  const addForm = document.getElementById("admin-property-form");
  const openAddBtn = document.getElementById("btn-open-add-unit");
  const closeAddBtn = document.getElementById("admin-modal-close");
  const cancelAddBtn = document.getElementById("admin-modal-cancel");

  if(openAddBtn){
    openAddBtn.addEventListener("click", () => {
      document.getElementById("admin-modal-title").innerText = "إضافة شقة / وحدة جديدة";
      if(addForm) addForm.reset();
      document.getElementById("form-prop-id").value = "";
      setPropImage("");
      if(addModal) addModal.classList.add("open");
    });
  }

  if(closeAddBtn && addModal) closeAddBtn.addEventListener("click", () => addModal.classList.remove("open"));
  if(cancelAddBtn && addModal) cancelAddBtn.addEventListener("click", () => addModal.classList.remove("open"));

  document.querySelectorAll(".preset-thumb").forEach(thumb => {
    thumb.addEventListener("click", () => {
      setPropImage(thumb.src);
      document.querySelectorAll(".preset-thumb").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });

  if(addForm){
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
        image: document.getElementById("form-prop-image").value.trim()
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
      if(addModal) addModal.classList.remove("open");
      showToast(id ? "تم تعديل الشقة بنجاح!" : "تمت إضافة الشقة الجديدة ونشرها في الموقع فوراً!");
    });
  }

  // تصدير دوال الشقق
  K.properties = {
    renderPublicProperties: renderPublicProperties,
    renderAdminTable: renderAdminTable,
    adminChangeStatus: adminChangeStatus,
    adminDeleteProp: adminDeleteProp,
    adminEditProp: adminEditProp,
    setPropImage: setPropImage,
    compressImage: compressImage
  };

  // ربط الدوال العالمية
  window.adminChangeStatus = adminChangeStatus;
  window.adminDeleteProp = adminDeleteProp;
  window.adminEditProp = adminEditProp;

})(window.Kayan);
