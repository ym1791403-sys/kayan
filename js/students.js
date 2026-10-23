/**
 * ========================================================
 * كيان سيتي للتطوير العقاري
 * 5. سجل الطلاب وسكن الطالبات والجامعات (Students Ledger Module)
 * ========================================================
 */

window.Kayan = window.Kayan || {};

(function(K){
  const dbEngine = K.db;
  const esc = dbEngine.esc;
  const showToast = dbEngine.showToast;
  const getStudents = dbEngine.getStudents;
  const saveStudents = dbEngine.saveStudents;

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

  // تسجيل سداد أو إلغاء سداد الشهر بضغطة زر
  function adminToggleStudentMonth(studentId, monthKey){
    const list = getStudents();
    const st = list.find(s => s.id === studentId);
    if(!st) return;
    if(!st.months) st.months = {};
    st.months[monthKey] = !st.months[monthKey];
    saveStudents(list);
    renderStudentsTable();
    const statusText = st.months[monthKey] ? "تم تسجيل سداد" : "تم إلغاء سداد";
    showToast(`${statusText} شهر ${monthKey} للطالب: ${esc(st.name)}`);
  }

  // عرض جدول الطلاب مع الفلترة والبحث
  function renderStudentsTable(){
    const tbody = document.getElementById("admin-students-tbody");
    if(!tbody) return;
    tbody.innerHTML = "";

    const list = getStudents();
    const search = (document.getElementById("student-search-box")?.value || "").toLowerCase().trim();
    const supFilter = document.getElementById("student-supervisor-filter")?.value || "all";
    const bldFilter = document.getElementById("student-building-filter")?.value || "all";

    // تحديث قوائم الفلاتر تلقائياً
    const supervisors = new Set(), buildings = new Set();
    list.forEach(s => {
      if(s.supervisor && s.supervisor.trim()) supervisors.add(s.supervisor.trim());
      if(s.building && s.building.trim()) buildings.add(s.building.trim());
    });

    const supSelect = document.getElementById("student-supervisor-filter");
    if(supSelect && supSelect.options.length <= 1){
      supervisors.forEach(sup => {
        const opt = document.createElement("option");
        opt.value = sup;
        opt.textContent = sup;
        supSelect.appendChild(opt);
      });
    }

    const bldSelect = document.getElementById("student-building-filter");
    if(bldSelect && bldSelect.options.length <= 1){
      buildings.forEach(bld => {
        const opt = document.createElement("option");
        opt.value = bld;
        opt.textContent = bld;
        bldSelect.appendChild(opt);
      });
    }

    let filtered = list.filter(s => {
      const matchSearch = !search ||
        (s.name && s.name.toLowerCase().includes(search)) ||
        (s.phone && s.phone.includes(search)) ||
        (s.college && s.college.toLowerCase().includes(search)) ||
        (s.apartment && s.apartment.includes(search));
      const matchSup = supFilter === "all" || s.supervisor === supFilter;
      const matchBld = bldFilter === "all" || s.building === bldFilter;
      return matchSearch && matchSup && matchBld;
    });

    // الإحصائيات
    let totalMonthlyExpected = 0, totalInsurance = 0;
    list.forEach(s => {
      totalMonthlyExpected += parseInt(s.rent || 0, 10);
      totalInsurance += parseInt(s.insurance || 0, 10);
    });

    const totalEl = document.getElementById("kpi-total-students");
    const expEl = document.getElementById("kpi-expected-rent");
    const insEl = document.getElementById("kpi-total-insurance");
    if(totalEl) totalEl.innerText = list.length;
    if(expEl) expEl.innerText = totalMonthlyExpected.toLocaleString() + " ج.م";
    if(insEl) insEl.innerText = totalInsurance.toLocaleString() + " ج.م";

    const totalPages = Math.ceil(filtered.length / STUDENT_PAGE) || 1;
    if(studentPage >= totalPages) studentPage = Math.max(0, totalPages - 1);
    renderPager(filtered.length, totalPages);

    if(filtered.length === 0){
      tbody.innerHTML = `<tr><td colspan="15" style="text-align:center; padding:32px; color:var(--text-muted);">لا توجد أي بيانات طلاب مطابقة للبحث أو الفلتر</td></tr>`;
      return;
    }

    const paged = filtered.slice(studentPage * STUDENT_PAGE, (studentPage + 1) * STUDENT_PAGE);
    paged.forEach((st, idx) => {
      const tr = document.createElement("tr");

      let monthsHtml = "";
      MONTH_KEYS.forEach(m => {
        const paid = st.months && st.months[m];
        monthsHtml += `
          <td style="text-align:center; padding:4px;">
            <button type="button" class="month-pill ${paid ? 'paid' : 'unpaid'}"
                    data-admin-action="toggle-student-month" data-student-id="${esc(st.id)}" data-month="${m}"
                    title="${MONTH_LABELS[m]}: اضغط للتبديل بين مسدد / متبقي">
              ${paid ? '✔' : '—'}
            </button>
          </td>
        `;
      });

      const cleanPhone = (st.phone || "").replace(/[^\d]/g, "");
      const waPhone = cleanPhone.startsWith("0") ? "2" + cleanPhone : cleanPhone;

      tr.innerHTML = `
        <td style="font-weight:700; color:var(--text-muted);">${(studentPage * STUDENT_PAGE) + idx + 1}</td>
        <td>
          <strong style="color:var(--gold-light); font-size:1rem; display:block;">${esc(st.name)}</strong>
          <span style="font-size:0.8rem; color:var(--text-muted);">${esc(st.city || '')} • ${esc(st.college || '')}</span>
        </td>
        <td>
          <span style="color:#cbd7e6; font-family:monospace; font-size:0.9rem;" dir="ltr">${esc(st.phone || '—')}</span>
        </td>
        <td><span class="badge-bld">${esc(st.building || '—')}</span></td>
        <td><span style="color:#fff; font-weight:600;">${esc(st.apartment || '—')}</span></td>
        <td><strong style="color:var(--cyan);">${parseInt(st.rent || 0, 10).toLocaleString()} ج.م</strong></td>
        <td><span style="color:var(--text-muted);">${parseInt(st.insurance || 0, 10).toLocaleString()} ج.م</span></td>
        <td><span style="color:#e2e8f0; font-size:0.88rem;">${esc(st.supervisor || '—')}</span></td>
        ${monthsHtml}
        <td>
          <div class="action-group">
            <a href="https://wa.me/${waPhone}" target="_blank" rel="noopener" class="btn-wa-sm" title="محادثة واتساب">
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

  // تعديل بيانات طالب
  function adminEditStudent(id){
    const list = getStudents();
    const st = list.find(s => s.id === id);
    if(!st) return;

    document.getElementById("student-modal-title").innerText = "تعديل بيانات الطالب";
    document.getElementById("student-form-id").value = st.id;
    document.getElementById("st-name").value = st.name || "";
    document.getElementById("st-phone").value = st.phone || "";
    document.getElementById("st-city").value = st.city || "";
    document.getElementById("st-college").value = st.college || "";
    document.getElementById("st-building").value = st.building || "";
    document.getElementById("st-apartment").value = st.apartment || "";
    document.getElementById("st-address").value = st.address || "";
    document.getElementById("st-owner").value = st.owner || "";
    document.getElementById("st-supervisor").value = st.supervisor || "";
    document.getElementById("st-rent").value = st.rent || "";
    document.getElementById("st-insurance").value = st.insurance || "";
    document.getElementById("st-notes").value = st.notes || "";

    document.getElementById("admin-student-modal")?.classList.add("open");
  }

  // حذف طالب من السجل (مؤمن بكلمة سر لوحة التحكم في فايربيس)
  function adminDeleteStudent(id){
    const st = getStudents().find(s => s.id === id);
    const name = st && st.name ? `الطالب "${st.name}"` : "هذا الطالب";
    if(K.admin && K.admin.requestDeleteWithPassword){
      K.admin.requestDeleteWithPassword(`هل أنت متأكد من رغبتك في حذف ${name} من السجل نهائياً؟`, () => {
        let list = getStudents();
        list = list.filter(s => s.id !== id);
        saveStudents(list);
        renderStudentsTable();
        showToast("تم حذف الطالب من السجل بنجاح بعد التحقق من كلمة السر!");
      });
    }
  }

  // مستمعات البحث والفلترة
  let searchT;
  const resetRender = () => { studentPage = 0; renderStudentsTable(); };
  document.getElementById("student-search-box")?.addEventListener("input", () => { clearTimeout(searchT); searchT = setTimeout(resetRender, 200); });
  document.getElementById("student-supervisor-filter")?.addEventListener("change", resetRender);
  document.getElementById("student-building-filter")?.addEventListener("change", resetRender);

  // نافذة إضافة وتعديل طالب
  const studentModal = document.getElementById("admin-student-modal");
  const studentForm = document.getElementById("admin-student-form");
  const openStudentBtn = document.getElementById("btn-open-add-student");
  const closeStudentBtn = document.getElementById("student-modal-close");
  const cancelStudentBtn = document.getElementById("student-modal-cancel");

  if(openStudentBtn){
    openStudentBtn.addEventListener("click", () => {
      document.getElementById("student-modal-title").innerText = "إضافة طالب جديد للسجل";
      if(studentForm) studentForm.reset();
      document.getElementById("student-form-id").value = "";
      if(studentModal) studentModal.classList.add("open");
    });
  }

  if(closeStudentBtn && studentModal) closeStudentBtn.addEventListener("click", () => studentModal.classList.remove("open"));
  if(cancelStudentBtn && studentModal) cancelStudentBtn.addEventListener("click", () => studentModal.classList.remove("open"));

  if(studentForm){
    studentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("student-form-id").value;
      const list = getStudents();

      const newStudent = {
        id: id || "st_" + Date.now(),
        name: document.getElementById("st-name").value.trim(),
        phone: document.getElementById("st-phone").value.trim(),
        city: document.getElementById("st-city").value.trim(),
        college: document.getElementById("st-college").value.trim(),
        building: document.getElementById("st-building").value.trim(),
        apartment: document.getElementById("st-apartment").value.trim(),
        address: document.getElementById("st-address").value.trim(),
        owner: document.getElementById("st-owner").value.trim(),
        supervisor: document.getElementById("st-supervisor").value.trim(),
        rent: parseInt(document.getElementById("st-rent").value || "0", 10),
        insurance: parseInt(document.getElementById("st-insurance").value || "0", 10),
        notes: document.getElementById("st-notes").value.trim(),
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
      if(studentModal) studentModal.classList.remove("open");
      showToast(id ? "تم حفظ وتعديل بيانات الطالب بنجاح!" : "تمت إضافة الطالب الجديد إلى السجل بنجاح!");
    });
  }

  // مسح كافة الطلاب بالكامل من السجل
  document.getElementById("btn-clear-all-students")?.addEventListener("click", () => {
    if(K.admin && K.admin.requestDeleteWithPassword){
      K.admin.requestDeleteWithPassword("تحذير أمني شديد جداً: هل أنت متأكد من رغبتك في مسح كافة الطلاب المسجلين بالكامل من السجل؟", () => {
        saveStudents([]);
        renderStudentsTable();
        showToast("تم مسح جميع بيانات الطلاب بنجاح بعد التحقق من كلمة السر!");
      });
    }
  });

  // تصدير ملف إكسيل CSV بترميز UTF-8 مع BOM لدعم الحروف العربية بالكامل
  document.getElementById("btn-export-students-excel")?.addEventListener("click", () => {
    const list = getStudents();
    if(list.length === 0){
      alert("لا يوجد طلاب مسجلين لتصديرهم!");
      return;
    }

    let csv = "\uFEFFم,اسم الطالب,رقم الموبايل,البلد,الكلية,العمارة,الشقة والدور,العنوان,المالك,المشرف المسؤول,الإيجار الشهري,التأمين,الملاحظات,ش 10,ش 11,ش 12,ش 1,ش 2,ش 3,ش 4,ش 5,ش 6,ش 7,ش 8,ش 9\n";

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

  // تصدير دوال الطلاب
  K.students = {
    renderStudentsTable: renderStudentsTable,
    adminToggleStudentMonth: adminToggleStudentMonth,
    adminEditStudent: adminEditStudent,
    adminDeleteStudent: adminDeleteStudent
  };

  // ربط الدوال العالمية
  window.adminToggleStudentMonth = adminToggleStudentMonth;
  window.adminEditStudent = adminEditStudent;
  window.adminDeleteStudent = adminDeleteStudent;

})(window.Kayan);
