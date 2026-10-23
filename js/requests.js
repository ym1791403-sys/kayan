/**
 * ========================================================
 * كيان سيتي للتطوير العقاري
 * 6. نظام طلبات الحجز واستفسارات العملاء والواتساب (Requests Module)
 * ========================================================
 */

window.Kayan = window.Kayan || {};

(function(K){
  const dbEngine = K.db;
  const esc = dbEngine.esc;
  const showToast = dbEngine.showToast;
  const formatDateTime = dbEngine.formatDateTime;
  const getRequests = dbEngine.getRequests;
  const saveRequests = dbEngine.saveRequests;

  // صياغة رسالة الواتساب للطلب مع الترقيم التسلسلي
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

  // تحديث شارة عدد الطلبات الجديدة في الشريط الجانبي
  function updateRequestsBadge(){
    const badge = document.getElementById("admin-requests-badge");
    if(!badge) return;
    const requests = getRequests();
    const newCount = requests.filter(r => !r.status || r.status === "new").length;
    if(newCount > 0){
      badge.textContent = newCount;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  }

  // عرض جدول طلبات الحجز في لوحة الإدارة
  function renderRequestsTable(){
    const tbody = document.getElementById("admin-requests-tbody");
    if(!tbody) return;
    tbody.innerHTML = "";

    const requests = getRequests();
    const search = (document.getElementById("requests-search-box")?.value || "").toLowerCase().trim();
    const statusFilter = document.getElementById("requests-status-filter")?.value || "all";

    let filtered = requests.filter(r => {
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
    if(totalEl) totalEl.textContent = requests.length;
    if(newEl) newEl.textContent = requests.filter(r => !r.status || r.status === "new").length;
    if(contactedEl) contactedEl.textContent = requests.filter(r => r.status === "contacted" || r.status === "booked").length;
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
      const reqDate = req.createdAt || (dbEngine.created["requests"] ? dbEngine.created["requests"].get(req.id) : null);

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

  // مستمعات جدول الطلبات
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
    if(K.admin && K.admin.requestDeleteWithPassword){
      K.admin.requestDeleteWithPassword(`هل أنت متأكد من حذف ${label} نهائياً؟`, () => {
        let list = getRequests().filter(r => r.id !== reqId);
        saveRequests(list);
        renderRequestsTable();
        showToast("تم حذف الطلب بنجاح بعد التحقق من كلمة السر!");
      });
    }
  });

  document.getElementById("btn-clear-all-requests")?.addEventListener("click", () => {
    if(K.admin && K.admin.requestDeleteWithPassword){
      K.admin.requestDeleteWithPassword("تحذير: هل أنت متأكد من مسح جميع طلبات الحجز والاستفسارات الواردة؟", () => {
        saveRequests([]);
        renderRequestsTable();
        showToast("تم مسح كافة الطلبات بنجاح!");
      });
    }
  });

  document.getElementById("requests-search-box")?.addEventListener("input", () => renderRequestsTable());
  document.getElementById("requests-status-filter")?.addEventListener("change", () => renderRequestsTable());

  // معالجة إرسال طلب الحجز من الواجهة العامة (Client Booking Submission)
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

      const notes = rawNotes.slice(0, 500); // منع الحمولات الزائدة

      if(submitBtn){
        submitBtn.disabled = true;
        submitBtn.textContent = "جارٍ حفظ وإرسال الطلب...";
      }

      const db = dbEngine.rawDb;
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

  // تصدير دوال الطلبات
  K.requests = {
    buildRequestWhatsAppText: buildRequestWhatsAppText,
    updateRequestsBadge: updateRequestsBadge,
    renderRequestsTable: renderRequestsTable
  };

})(window.Kayan);