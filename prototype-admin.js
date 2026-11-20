(() => {
  const root = document.querySelector("[data-prototype-root]");
  const api = window.SIMRSSasa;
  if (!root || !api || !document.body.dataset.prototypeModule) return;

  const moduleName = document.body.dataset.prototypeModule;
  const roles = api.roleLabels || {};
  const roleKeys = Object.keys(roles);
  const roleAccess = api.rolePageAccess || {};
  const roleStaff = {
    doctor: "Dokter",
    nurse: "Perawat",
    registration: "Pendaftaran",
    "medical-records": "Rekam Medis",
    pharmacy: "Farmasi",
    laboratory: "Laboratorium",
    radiology: "Radiologi",
    cashier: "Kasir"
  };
  const rolePages = [
    ["dashboard.html", "Dashboard"], ["pendaftaran.html", "Pendaftaran"],
    ["pasien.html", "Data Pasien"], ["rawat-jalan.html", "Rawat Jalan"],
    ["pemeriksaan.html", "Pemeriksaan"], ["rekam-medis.html", "Rekam Medis"],
    ["coding-icd.html", "Coding ICD"], ["farmasi.html", "Farmasi"],
    ["rawat-inap.html", "Rawat Inap"], ["laboratorium.html", "Laboratorium"],
    ["radiologi.html", "Radiologi"], ["kasir.html", "Kasir"], ["laporan.html", "Laporan"],
    ["dokter.html", "Data Dokter"], ["poli.html", "Data Poliklinik"],
    ["manajemen-data.html", "Manajemen Data"], ["pengaturan.html", "Pengaturan Sistem"]
  ];
  const defaultTariffs = {
    registration: 15000, doctor: 50000, nursing: 25000, bedPerDay: 250000,
    laboratory: 75000, radiology: 150000, pharmacy: 50000
  };
  const tariffLabels = {
    registration: "Pendaftaran", doctor: "Konsultasi dokter", nursing: "Tindakan keperawatan",
    bedPerDay: "Rawat inap per hari", laboratory: "Laboratorium", radiology: "Radiologi", pharmacy: "Layanan farmasi"
  };
  const tabLabels = { staff: "Staf & Jadwal", clinics: "Klinik", rooms: "Ruangan & Bed", users: "Akun & Hak Akses" };
  let activeTab = "staff";
  let search = "";
  let notice = "";
  let noticeError = false;

  const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));
  const id = (prefix) => {
    const suffix = window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    return `${prefix}-${suffix}`;
  };
  const dateTime = () => new Date().toISOString();
  const money = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);
  const getData = () => api.ensureCollections(api.readData());
  const actor = () => document.querySelector("[data-user-name]")?.textContent || "Admin";
  const recordId = (record) => record.id || record.username || record.name || "";
  const setNotice = (message, isError) => {
    notice = message;
    noticeError = Boolean(isError);
  };
  const save = (data, action, entity, entityId, details) => {
    data.activityLog.push({
      id: id("ACT"), action, entity, entityId: String(entityId || ""),
      details: details || "", actor: actor(), timestamp: dateTime()
    });
    api.saveData(data);
    root.dataset.editingCollection = "";
    root.dataset.editingId = "";
    root.dataset.editingScheduleId = "";
    root.dataset.editingScheduleClinicId = "";
    setNotice("Perubahan berhasil disimpan.", false);
    render();
  };
  const showError = (error) => {
    setNotice(error instanceof Error ? error.message : String(error), true);
    render();
  };
  const displayMessage = () => `<p class="admin-message${noticeError ? " error" : ""}" role="${noticeError ? "alert" : "status"}" aria-live="polite">${esc(notice)}</p>`;
  const field = (label, name, value, type, required, extra) =>
    `<div class="admin-field${extra && extra.full ? " admin-field-full" : ""}"><label for="field-${name}">${esc(label)}</label><input id="field-${name}" name="${esc(name)}" type="${type || "text"}" value="${esc(value)}"${required ? " required" : ""}${extra && extra.min !== undefined ? ` min="${extra.min}"` : ""}${extra && extra.step ? ` step="${extra.step}"` : ""}${extra && extra.maxLength ? ` maxlength="${extra.maxLength}"` : ""}></div>`;
  const selectField = (label, name, options, value, required) =>
    `<div class="admin-field"><label for="field-${name}">${esc(label)}</label><select id="field-${name}" name="${esc(name)}"${required ? " required" : ""}>${options.map(([optionValue, text]) => `<option value="${esc(optionValue)}"${String(optionValue) === String(value) ? " selected" : ""}>${esc(text)}</option>`).join("")}</select></div>`;
  const table = (headers, rows, empty) => `<div class="table-wrap"><table class="admin-table"><thead><tr>${headers.map((item) => `<th>${esc(item)}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td class="admin-empty" colspan="${headers.length}">${esc(empty || "Belum ada data.")}</td></tr>`}</tbody></table></div>`;
  const rowActions = (collection, record) => `<div class="admin-row-actions"><button type="button" data-edit="${esc(collection)}" data-record-id="${esc(record.id)}">Ubah</button><button type="button" data-delete="${esc(collection)}" data-record-id="${esc(record.id)}">Hapus</button></div>`;
  const searchBar = (placeholder) => `<div class="admin-toolbar"><span class="admin-badge">Data tersimpan bersama</span><input type="search" data-search placeholder="${esc(placeholder)}" value="${esc(search)}" aria-label="Cari data"></div>`;
  const matchesSearch = (...values) => !search.trim() || values.some((value) => String(value || "").toLocaleLowerCase("id").includes(search.trim().toLocaleLowerCase("id")));
  const roleOptions = (selected, includeEmpty) => [
    ...(includeEmpty ? [["", "Pilih peran"]] : []),
    ...roleKeys.map((key) => [key, roles[key]])
  ];

  function shell(content, intro) {
    root.innerHTML = `${intro ? `<div class="admin-intro">${esc(intro)}</div>` : ""}${content}${displayMessage()}`;
  }

  function renderManagement() {
    const data = getData();
    const tabs = `<div class="admin-tabs" role="tablist" aria-label="Jenis data">${Object.entries(tabLabels).map(([key, label]) => `<button class="admin-tab" type="button" role="tab" data-tab="${key}" aria-selected="${activeTab === key}">${label}</button>`).join("")}</div>`;
    const stats = `<div class="admin-stats"><div class="panel admin-stat"><span>Staf</span><strong>${data.staff.length}</strong></div><div class="panel admin-stat"><span>Klinik</span><strong>${data.clinics.length}</strong></div><div class="panel admin-stat"><span>Ruangan / bed</span><strong>${data.rooms.length} / ${data.beds.length}</strong></div><div class="panel admin-stat"><span>Akun tambahan</span><strong>${data.userAccounts.length}</strong></div></div>`;
    const panel = activeTab === "clinics" ? clinicPanel(data)
      : activeTab === "rooms" ? roomPanel(data)
      : activeTab === "users" ? userPanel(data)
      : staffPanel(data);
    shell(`${stats}${tabs}${panel}`, "Kelola master staf, jadwal dokter, klinik, ruangan, tempat tidur, dan akun pada sumber data bersama. Semua perubahan dicatat di log aktivitas.");
  }

  function staffPanel(data) {
    const editing = root.dataset.editingCollection === "staff"
      ? data.staff.find((record) => record.id === root.dataset.editingId)
      : null;
    const record = editing || {};
    const staffRoleOptions = Object.entries(roleStaff).map(([key, label]) => [key, label]);
    const staffRows = data.staff.filter((staff) => matchesSearch(staff.name, roles[staff.role], staff.clinic, staff.phone))
      .map((staff) => `<tr><td><strong>${esc(staff.name)}</strong><br><span class="admin-badge">${esc(roleStaff[staff.role] || roles[staff.role] || staff.role)}</span></td><td>${esc(staff.clinic || "—")}</td><td>${esc(staff.schedule || "—")}${staff.startTime ? ` · ${esc(staff.startTime)}–${esc(staff.endTime)}` : ""}</td><td>${esc(staff.phone || "—")}</td><td>${rowActions("staff", staff)}</td></tr>`).join("");
    const form = `<article class="panel admin-panel"><h2>${editing ? "Ubah data staf" : "Tambah staf"}</h2><p>Peran yang dapat dikelola: dokter, perawat, pendaftaran, rekam medis, farmasi, laboratorium, radiologi, dan kasir.</p><form data-form="staff"><input type="hidden" name="id" value="${esc(record.id || "")}"><div class="admin-form-grid">${field("Nama lengkap", "name", record.name, "text", true)}${selectField("Peran", "role", staffRoleOptions, record.role || "doctor", true)}${field("Nomor kontak", "phone", record.phone, "tel", false)}${selectField("Klinik / unit", "clinic", [["", "Pilih klinik / unit"], ...data.clinics.map((clinic) => [clinic.name, clinic.name]), ...(!data.clinics.length ? [["Poli Umum", "Poli Umum"]] : [])], record.clinic, false)}${field("Hari / jadwal", "schedule", record.schedule, "text", false, { full: true })}${field("Jam mulai", "startTime", record.startTime, "time", false)}${field("Jam selesai", "endTime", record.endTime, "time", false)}</div><div class="admin-actions"><button class="button button-primary" type="submit">${editing ? "Simpan perubahan" : "Tambah staf"}</button>${editing ? '<button class="button button-secondary" type="button" data-cancel-edit>Batal</button>' : ""}</div></form></article>`;
    return `<div class="admin-layout"><article class="panel admin-panel"><h2>Daftar staf</h2>${searchBar("Cari nama, peran, klinik…")}${table(["NAMA / PERAN", "KLINIK / UNIT", "JADWAL", "KONTAK", "AKSI"], staffRows, "Belum ada staf. Tambahkan melalui formulir.")}</article>${form}</div>`;
  }

  function clinicPanel(data) {
    const editing = root.dataset.editingCollection === "clinics" ? data.clinics.find((record) => record.id === root.dataset.editingId) : null;
    const clinic = editing || {};
    const editingScheduleClinic = data.clinics.find((item) => item.id === root.dataset.editingScheduleClinicId);
    const editingSchedule = editingScheduleClinic && (editingScheduleClinic.doctorSchedules || []).find((item) => item.id === root.dataset.editingScheduleId);
    const staffDoctors = data.staff.filter((staff) => staff.role === "doctor");
    const scheduleRows = data.clinics.flatMap((item) => (Array.isArray(item.doctorSchedules) ? item.doctorSchedules : []).map((schedule) => ({ ...schedule, clinicName: item.name, clinicId: item.id })))
      .filter((record) => matchesSearch(record.clinicName, record.doctor, record.day))
      .map((schedule) => {
        const clinicId = schedule.clinicId || "";
        return `<tr><td>${esc(schedule.clinicName)}</td><td>${esc(schedule.doctor)}</td><td>${esc(schedule.day)}</td><td>${esc(schedule.startTime)}–${esc(schedule.endTime)}</td><td><div class="admin-row-actions"><button type="button" data-edit-schedule="${esc(schedule.id)}" data-clinic-id="${esc(clinicId)}">Ubah</button><button type="button" data-delete-schedule="${esc(schedule.id)}" data-clinic-id="${esc(clinicId)}">Hapus</button></div></td></tr>`;
      }).join("");
    const clinicRows = data.clinics.filter((item) => matchesSearch(item.name, item.code, item.location))
      .map((item) => `<tr><td><strong>${esc(item.name)}</strong><br><small>${esc(item.code || "Tanpa kode")}</small></td><td>${esc(item.location || "—")}</td><td>${(item.doctorSchedules || []).length}</td><td>${rowActions("clinics", item)}</td></tr>`).join("");
    return `<div class="admin-layout"><div><article class="panel admin-panel"><h2>Daftar klinik</h2>${searchBar("Cari nama atau kode klinik…")}${table(["KLINIK", "LOKASI", "JADWAL", "AKSI"], clinicRows, "Belum ada klinik.")}</article><article class="panel admin-panel" style="margin-top:15px"><h2>Jadwal dokter</h2><p>Jadwal disimpan di data klinik dan ditautkan ke staf dokter yang terdaftar.</p>${table(["KLINIK", "DOKTER", "HARI", "JAM", "AKSI"], scheduleRows, "Belum ada jadwal dokter.")}</article></div><div><article class="panel admin-panel"><h2>${editing ? "Ubah klinik" : "Tambah klinik"}</h2><form data-form="clinic"><input type="hidden" name="id" value="${esc(clinic.id || "")}"><div class="admin-form-grid">${field("Nama klinik", "name", clinic.name, "text", true)}${field("Kode", "code", clinic.code, "text", true)}${field("Lokasi", "location", clinic.location, "text", false, { full: true })}</div><div class="admin-actions"><button class="button button-primary" type="submit">Simpan klinik</button>${editing ? '<button class="button button-secondary" type="button" data-cancel-edit>Batal</button>' : ""}</div></form></article><article class="panel admin-panel" style="margin-top:15px"><h2>${editingSchedule ? "Ubah jadwal dokter" : "Tambah jadwal dokter"}</h2><form data-form="schedule"><input type="hidden" name="scheduleId" value="${esc(editingSchedule?.id || "")}"><input type="hidden" name="originalClinicId" value="${esc(editingScheduleClinic?.id || "")}"><div class="admin-form-grid">${selectField("Klinik", "clinicId", [["", "Pilih klinik"], ...data.clinics.map((item) => [item.id, item.name])], editingScheduleClinic?.id || "", true)}${selectField("Dokter", "staffId", [["", "Pilih dokter"], ...staffDoctors.map((staff) => [staff.id, staff.name])], editingSchedule?.doctorId || "", true)}${selectField("Hari", "day", ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day) => [day, day]), editingSchedule?.day || "", true)}${field("Jam mulai", "startTime", editingSchedule?.startTime, "time", true)}${field("Jam selesai", "endTime", editingSchedule?.endTime, "time", true)}</div><div class="admin-actions"><button class="button button-primary" type="submit">${editingSchedule ? "Simpan jadwal" : "Tambah jadwal"}</button>${editingSchedule ? '<button class="button button-secondary" type="button" data-cancel-schedule-edit>Batal</button>' : ""}</div></form></article></div></div>`;
  }

  function roomPanel(data) {
    const editingRoom = root.dataset.editingCollection === "rooms" ? data.rooms.find((record) => record.id === root.dataset.editingId) : null;
    const editingBed = root.dataset.editingCollection === "beds" ? data.beds.find((record) => record.id === root.dataset.editingId) : null;
    const roomRows = data.rooms.filter((room) => matchesSearch(room.name, room.code, room.class, room.ward, room.location))
      .map((room) => `<tr><td><strong>${esc(room.name)}</strong><br><small>${esc(room.code || "Tanpa kode")}</small></td><td>${esc(room.class || room.ward || "—")}<br><small>${esc(room.ward || room.location || "—")}</small></td><td>${data.beds.filter((bed) => bed.roomId === room.id).length} / ${esc(room.capacity || "—")}</td><td>${rowActions("rooms", room)}</td></tr>`).join("");
    const bedStatusLabels = { available: "Tersedia", occupied: "Terisi", cleaning: "Dibersihkan" };
    const bedRows = data.beds.filter((bed) => {
      const room = data.rooms.find((item) => item.id === bed.roomId);
      return matchesSearch(bed.bedNumber || bed.code, room && room.name, bed.status, bed.patientMRN);
    }).map((bed) => {
      const room = data.rooms.find((item) => item.id === bed.roomId);
      return `<tr><td>${esc(room ? room.name : "Ruangan dihapus")}</td><td>${esc(bed.bedNumber || bed.code || "—")}</td><td><span class="admin-badge">${esc(bedStatusLabels[bed.status] || bed.status || "Tersedia")}</span></td><td>${esc(bed.patientMRN || "—")}</td><td>${rowActions("beds", bed)}</td></tr>`;
    }).join("");
    const roomForm = `<article class="panel admin-panel"><h2>${editingRoom ? "Ubah ruangan" : "Tambah ruangan"}</h2><form data-form="room"><input type="hidden" name="id" value="${esc(editingRoom?.id || "")}"><div class="admin-form-grid">${field("Nama ruangan", "name", editingRoom?.name, "text", true)}${field("Kode ruangan", "code", editingRoom?.code, "text", false)}${field("Kelas perawatan", "class", editingRoom?.class, "text", true)}${field("Bangsal / unit", "ward", editingRoom?.ward, "text", true)}${field("Lokasi", "location", editingRoom?.location, "text", false)}${field("Kapasitas bed", "capacity", editingRoom?.capacity, "number", true, { min: 1, step: 1 })}</div><div class="admin-actions"><button class="button button-primary" type="submit">Simpan ruangan</button>${editingRoom ? '<button class="button button-secondary" type="button" data-cancel-edit>Batal</button>' : ""}</div></form></article>`;
    const bedForm = `<article class="panel admin-panel" style="margin-top:15px"><h2>${editingBed ? "Ubah bed" : "Tambah bed"}</h2><form data-form="bed"><input type="hidden" name="id" value="${esc(editingBed?.id || "")}"><div class="admin-form-grid">${selectField("Ruangan", "roomId", [["", "Pilih ruangan"], ...data.rooms.map((room) => [room.id, room.name])], editingBed?.roomId, true)}${field("Nomor bed", "bedNumber", editingBed?.bedNumber || editingBed?.code, "text", true)}${selectField("Status", "status", [["available", "Tersedia"], ["occupied", "Terisi"], ["cleaning", "Dibersihkan"]], editingBed?.status || "available", true)}${field("No. RM pasien (opsional)", "patientMRN", editingBed?.patientMRN, "text", false)}</div><div class="admin-actions"><button class="button button-primary" type="submit">Simpan bed</button>${editingBed ? '<button class="button button-secondary" type="button" data-cancel-edit>Batal</button>' : ""}</div></form></article>`;
    return `<div class="admin-layout"><div><article class="panel admin-panel"><h2>Daftar ruangan</h2>${searchBar("Cari ruangan, bangsal, bed…")}${table(["RUANGAN", "KELAS / BANGSAL", "BED TERPAKAI / KAPASITAS", "AKSI"], roomRows, "Belum ada ruangan.")}</article><article class="panel admin-panel" style="margin-top:15px"><h2>Daftar bed</h2>${table(["RUANGAN", "BED", "STATUS", "NO. RM", "AKSI"], bedRows, "Belum ada bed.")}</article></div><div>${roomForm}${bedForm}</div></div>`;
  }

  function userPanel(data) {
    const editing = root.dataset.editingCollection === "userAccounts" ? data.userAccounts.find((record) => record.id === root.dataset.editingId) : null;
    const user = editing || {};
    const userRows = data.userAccounts.filter((item) => matchesSearch(item.username, item.fullName, roles[item.role], item.role))
      .map((item) => `<tr><td><strong>${esc(item.fullName || item.username)}</strong><br><small>${esc(item.username)}</small></td><td>${esc(roles[item.role] || item.role)}</td><td><span class="admin-badge">${esc(item.status || "Aktif")}</span></td><td>${rowActions("userAccounts", item)}</td></tr>`).join("");
    const demoRows = api.demoAccounts.map((account) => `<tr><td><strong>${esc(account.fullName)}</strong></td><td>${esc(roles[account.role] || account.role)}</td><td><code>${esc(account.username)} / ${esc(account.password)}</code></td></tr>`).join("");
    const userAllowedPages = user.permissions || roleAccess[user.role] || [];
    return `<div class="admin-layout"><div><article class="panel admin-panel"><h2>Akun demo bawaan</h2><p>Daftar dan kredensial berasal dari window.SIMRSSasa.demoAccounts di script.js, menggunakan sistem login yang sudah ada.</p>${table(["PENGGUNA", "PERAN", "KREDENSIAL DEMO"], demoRows, "Akun demo tidak tersedia.")}</article><article class="panel admin-panel" style="margin-top:15px"><h2>Akun tambahan</h2>${searchBar("Cari akun…")}${table(["PENGGUNA", "PERAN", "STATUS", "AKSI"], userRows, "Belum ada akun tambahan.")}</article></div><article class="panel admin-panel"><h2>${editing ? "Ubah akun tambahan" : "Tambah akun tambahan"}</h2><p>Akun tambahan dapat digunakan untuk login lokal prototipe. Kata sandi disimpan di browser; jangan gunakan kata sandi nyata. Izin akun membatasi halaman yang dapat dibuka.</p><form data-form="user"><input type="hidden" name="id" value="${esc(user.id || "")}"><div class="admin-form-grid">${field("Nama tampilan", "fullName", user.fullName, "text", true)}${field("Nama pengguna", "username", user.username, "text", true)}${field("Kata sandi", "password", "", "password", !editing)}${selectField("Peran", "role", roleOptions(user.role || "", true), user.role || "", true)}${selectField("Status", "status", [["Aktif", "Aktif"], ["Nonaktif", "Nonaktif"]], user.status || "Aktif", true)}<div class="admin-field admin-field-full"><label>Izin modul</label><div class="check-list">${rolePages.map(([page, label]) => `<label><input type="checkbox" name="permissions" value="${esc(page)}"${userAllowedPages.includes("*") || userAllowedPages.includes(page) ? " checked" : ""}>${esc(label)}</label>`).join("")}</div></div></div><div class="admin-actions"><button class="button button-primary" type="submit">Simpan akun</button>${editing ? '<button class="button button-secondary" type="button" data-cancel-edit>Batal</button>' : ""}</div></form></article></div>`;
  }

  function renderSettings() {
    const data = getData();
    const settings = data.hospitalSettings || {};
    const tariffs = { ...defaultTariffs, ...(data.tariffs || {}) };
    const simulatedTariffs = data.tariffs.prototypeSimulated;
    if (simulatedTariffs && typeof simulatedTariffs === "object" && !Array.isArray(simulatedTariffs)) {
      tariffs.registration = Number.isSafeInteger(simulatedTariffs.visit) ? simulatedTariffs.visit : tariffs.registration;
      tariffs.doctor = Number.isSafeInteger(simulatedTariffs.procedure) ? simulatedTariffs.procedure : tariffs.doctor;
      tariffs.laboratory = Number.isSafeInteger(simulatedTariffs.laboratory) ? simulatedTariffs.laboratory : tariffs.laboratory;
      tariffs.radiology = Number.isSafeInteger(simulatedTariffs.radiology) ? simulatedTariffs.radiology : tariffs.radiology;
      tariffs.bedPerDay = Number.isSafeInteger(simulatedTariffs.inpatientDaily) ? simulatedTariffs.inpatientDaily : tariffs.bedPerDay;
    }
    const rolePermissions = settings.rolePermissions || {};
    const profileForm = `<article class="panel admin-panel"><h2>Profil rumah sakit</h2><p>Nama awal untuk prototipe: Rumah Sakit Sehat Abadi. Penyimpanan mengubah profil shared data, bukan konfigurasi server.</p><form data-form="settings"><div class="admin-form-grid">${field("Nama rumah sakit", "hospitalName", settings.name || "Rumah Sakit Sehat Abadi", "text", true)}${field("Telepon", "phone", settings.phone, "tel", false)}${field("Alamat", "address", settings.address, "text", false, { full: true })}${field("Email kontak", "email", settings.email, "email", false)}${field("Teks logo", "logoText", settings.logoText || "SIMRS SASA", "text", false)}</div><div class="admin-actions"><button class="button button-primary" type="submit">Simpan profil</button></div></form></article>`;
    const tariffFields = Object.keys(defaultTariffs).map((key) => field(tariffLabels[key], key, tariffs[key], "number", true, { min: 0, step: 1000 })).join("");
    const tariffForm = `<article class="panel admin-panel"><h2>Konfigurasi tarif simulasi</h2><p>Nilai hanya untuk demonstrasi, bukan tarif resmi atau dasar penagihan nyata.</p><form data-form="tariffs"><div class="admin-form-grid">${tariffFields}</div><div class="admin-actions"><button class="button button-primary" type="submit">Simpan tarif</button></div></form></article>`;
    const permissions = roleKeys.map((role) => {
      const allowed = Array.isArray(rolePermissions[role]) ? rolePermissions[role] : (roleAccess[role] || []);
      return `<div class="permission-role">${esc(roles[role])}</div><div class="check-list">${rolePages.map(([page, label]) => `<label><input type="checkbox" name="permission-${esc(role)}" value="${esc(page)}"${allowed.includes("*") || allowed.includes(page) ? " checked" : ""}>${esc(label)}</label>`).join("")}</div>`;
    }).join("");
    const permPanel = `<article class="panel admin-panel"><h2>Hak akses peran</h2><p>Pengaturan ini membatasi navigasi dan rute halaman pada prototipe lokal. Ini bukan pengganti autentikasi dan otorisasi server untuk penggunaan produksi.</p><form data-form="permissions">${permissions}<div class="admin-actions"><button class="button button-primary" type="submit">Simpan hak akses</button></div></form></article>`;
    const accountList = (api.demoAccounts || []).map((account) => `<div class="demo-account"><strong>${esc(account.fullName)} · ${esc(roles[account.role] || account.role)}</strong>Pengguna / kata sandi: <code>${esc(account.username)} / ${esc(account.password)}</code></div>`).join("");
    const accountsPanel = `<article class="panel admin-panel"><h2>Akun demo</h2><p>Gunakan akun demo yang sudah tersedia. Kredensial ditampilkan dari script.js—tidak dibuat sistem login baru.</p><div class="demo-list">${accountList || '<span class="admin-empty">Akun demo tidak tersedia.</span>'}</div></article>`;
    const logs = data.activityLog.slice().sort((a, b) => String(b.timestamp || b.createdAt || "").localeCompare(String(a.timestamp || a.createdAt || ""))).slice(0, 30)
      .map((entry) => `<tr><td>${esc((entry.timestamp || entry.createdAt) ? new Date(entry.timestamp || entry.createdAt).toLocaleString("id-ID") : "—")}</td><td>${esc(entry.actor || entry.user || "—")}</td><td>${esc(entry.action || entry.description || "—")} · ${esc(entry.entity || entry.module || "—")}</td><td>${esc(entry.details || entry.entityId || "—")}</td></tr>`).join("");
    const activityPanel = `<article class="panel admin-panel"><h2>Aktivitas terbaru</h2><p>Riwayat perubahan administrasi tersimpan pada koleksi activityLog bersama.</p>${table(["WAKTU", "AKTOR", "AKSI", "RINCIAN"], logs, "Belum ada aktivitas tercatat.")}</article>`;
    const resetPanel = `<article class="panel admin-panel"><h2>Reset data demonstrasi</h2><div class="reset-box"><strong>Perhatian: seluruh isi data bersama akan diganti.</strong><p>Reset hanya berjalan setelah konfirmasi eksplisit. Data yang dibuat memakai identitas fiktif dengan NIK sintetis unik, alamat dan nomor kontak dummy. Seluruh data dan tarif di aplikasi ini adalah simulasi.</p><button class="button button-danger" type="button" data-reset-demo>Reset data demo</button></div></article>`;
    shell(`<div class="admin-layout">${profileForm}${tariffForm}${permPanel}${accountsPanel}${activityPanel}${resetPanel}</div>`, "Pengaturan dan transaksi di prototipe ini hanya simulasi. Pastikan data demo tidak dipakai sebagai data klinis atau keuangan nyata.");
  }

  function formValues(form) {
    const values = {};
    new FormData(form).forEach((value, key) => {
      if (key === "permissions") {
        values.permissions = form.querySelectorAll('input[name="permissions"]:checked');
        return;
      }
      if (key.startsWith("permission-")) {
        values[key] = form.querySelectorAll(`input[name="${CSS.escape(key)}"]:checked`);
        return;
      }
      values[key] = typeof value === "string" ? value.trim() : value;
    });
    if (form.querySelector('input[name="permissions"]')) {
      values.permissions = Array.from(form.querySelectorAll('input[name="permissions"]:checked')).map((input) => input.value);
    }
    return values;
  }

  function validateSchedule(start, end) {
    if (start && end && start >= end) throw new Error("Jam selesai harus setelah jam mulai.");
  }

  function handleSubmit(event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    try {
      const data = getData();
      const values = formValues(form);
      const kind = form.dataset.form;
      if (kind === "settings") {
        const previous = data.hospitalSettings || {};
        data.hospitalSettings = { ...previous, name: values.hospitalName, address: values.address, phone: values.phone, email: values.email, logoText: values.logoText };
        save(data, "Ubah", "hospitalSettings", "profile", "Profil rumah sakit");
      } else if (kind === "tariffs") {
        const next = { ...(data.tariffs || {}) };
        Object.keys(defaultTariffs).forEach((key) => {
          const number = Number(values[key]);
          if (!Number.isSafeInteger(number) || number < 0 || number > 100000000) throw new Error(`Nilai ${tariffLabels[key]} harus bilangan bulat Rp 0–100.000.000.`);
          next[key] = number;
        });
        const simulated = { ...(next.prototypeSimulated || {}) };
        simulated.visit = next.registration;
        simulated.procedure = next.doctor;
        simulated.medicineUnit = Number.isSafeInteger(simulated.medicineUnit) ? simulated.medicineUnit : 5000;
        simulated.laboratory = next.laboratory;
        simulated.radiology = next.radiology;
        simulated.inpatientDaily = next.bedPerDay;
        next.prototypeSimulated = simulated;
        data.tariffs = next;
        save(data, "Ubah", "tariffs", "simulation", "Tarif simulasi");
      } else if (kind === "permissions") {
        const nextPermissions = { ...(data.hospitalSettings.rolePermissions || {}) };
        roleKeys.forEach((role) => {
          const checks = form.querySelectorAll(`input[name="permission-${CSS.escape(role)}"]:checked`);
          nextPermissions[role] = Array.from(checks).map((check) => check.value);
        });
        data.hospitalSettings = { ...data.hospitalSettings, rolePermissions: nextPermissions };
        save(data, "Ubah", "rolePermissions", "roles", "Ringkasan izin peran simulasi");
      } else if (kind === "staff") {
        validateSchedule(values.startTime, values.endTime);
        const duplicate = data.staff.find((item) => item.id !== values.id && String(item.name || "").toLocaleLowerCase("id") === values.name.toLocaleLowerCase("id") && item.role === values.role);
        if (duplicate) throw new Error("Nama staf dengan peran tersebut sudah terdaftar.");
        const existingIndex = data.staff.findIndex((item) => item.id === values.id);
        const updated = { ...(existingIndex >= 0 ? data.staff[existingIndex] : {}), ...values, id: values.id || id("STF"), updatedAt: dateTime() };
        if (existingIndex >= 0) data.staff[existingIndex] = updated; else data.staff.push(updated);
        save(data, existingIndex >= 0 ? "Ubah" : "Tambah", "staff", updated.id, updated.name);
      } else if (kind === "clinic") {
        if (data.clinics.some((item) => item.id !== values.id && (String(item.name || "").toLocaleLowerCase("id") === values.name.toLocaleLowerCase("id") || String(item.code || "").toLocaleLowerCase("id") === values.code.toLocaleLowerCase("id")))) {
          throw new Error("Nama atau kode klinik sudah digunakan.");
        }
        const existingIndex = data.clinics.findIndex((item) => item.id === values.id);
        const existing = existingIndex >= 0 ? data.clinics[existingIndex] : {};
        const updated = { ...existing, ...values, key: existing.key || values.code.toLowerCase(), id: values.id || id("CLN"), doctorSchedules: existing.doctorSchedules || [], updatedAt: dateTime() };
        if (existingIndex >= 0) data.clinics[existingIndex] = updated; else data.clinics.push(updated);
        save(data, existingIndex >= 0 ? "Ubah" : "Tambah", "clinics", updated.id, updated.name);
      } else if (kind === "schedule") {
        validateSchedule(values.startTime, values.endTime);
        const clinic = data.clinics.find((item) => item.id === values.clinicId);
        const doctor = data.staff.find((item) => item.id === values.staffId && item.role === "doctor");
        if (!clinic || !doctor) throw new Error("Pilih klinik dan staf dokter yang tersedia.");
        clinic.doctorSchedules = Array.isArray(clinic.doctorSchedules) ? clinic.doctorSchedules : [];
        const previousClinic = values.originalClinicId ? data.clinics.find((item) => item.id === values.originalClinicId) : null;
        const previousSchedule = previousClinic && previousClinic.doctorSchedules && previousClinic.doctorSchedules.find((item) => item.id === values.scheduleId);
        const overlaps = data.clinics.some((item) => (Array.isArray(item.doctorSchedules) ? item.doctorSchedules : []).some((schedule) =>
          schedule.id !== values.scheduleId && schedule.doctorId === doctor.id && schedule.day === values.day &&
          values.startTime < schedule.endTime && values.endTime > schedule.startTime
        ));
        if (overlaps) {
          throw new Error("Jadwal dokter bertabrakan dengan jadwal lain pada hari tersebut.");
        }
        const updatedSchedule = { ...(previousSchedule || {}), id: values.scheduleId || id("SCH"), doctorId: doctor.id, doctor: doctor.name, day: values.day, startTime: values.startTime, endTime: values.endTime };
        if (previousClinic && previousClinic.id !== clinic.id) previousClinic.doctorSchedules = previousClinic.doctorSchedules.filter((item) => item.id !== values.scheduleId);
        const targetIndex = clinic.doctorSchedules.findIndex((item) => item.id === values.scheduleId);
        if (targetIndex >= 0) clinic.doctorSchedules[targetIndex] = updatedSchedule; else clinic.doctorSchedules.push(updatedSchedule);
        save(data, values.scheduleId ? "Ubah" : "Tambah", "doctorSchedule", clinic.id, `${doctor.name} · ${values.day}`);
      } else if (kind === "room") {
        const capacity = Number(values.capacity);
        if (!Number.isInteger(capacity) || capacity < 1) throw new Error("Kapasitas harus bilangan bulat minimal 1.");
        if (data.beds.filter((bed) => bed.roomId === values.id).length > capacity) throw new Error("Kapasitas tidak boleh lebih kecil dari jumlah bed di ruangan.");
        if (data.rooms.some((item) => item.id !== values.id && item.name.toLocaleLowerCase("id") === values.name.toLocaleLowerCase("id"))) throw new Error("Nama ruangan sudah digunakan.");
        const existingIndex = data.rooms.findIndex((item) => item.id === values.id);
        const updated = { ...(existingIndex >= 0 ? data.rooms[existingIndex] : {}), ...values, class: values.class.trim(), code: values.code.trim(), capacity, id: values.id || id("ROM"), updatedAt: dateTime() };
        if (existingIndex >= 0) data.rooms[existingIndex] = updated; else data.rooms.push(updated);
        save(data, existingIndex >= 0 ? "Ubah" : "Tambah", "rooms", updated.id, updated.name);
      } else if (kind === "bed") {
        if (!data.rooms.some((room) => room.id === values.roomId)) throw new Error("Pilih ruangan yang tersedia.");
        const duplicate = data.beds.find((item) => item.id !== values.id && item.roomId === values.roomId && String(item.bedNumber || "").toLocaleLowerCase("id") === values.bedNumber.toLocaleLowerCase("id"));
        if (duplicate) throw new Error("Nomor bed tersebut sudah ada di ruangan yang dipilih.");
        if (values.status === "occupied" && !values.patientMRN) throw new Error("Isi No. RM pasien untuk bed berstatus Terisi.");
        if (values.patientMRN && !data.patients.some((patient) => patient.medicalRecordNumber === values.patientMRN)) throw new Error("No. RM pasien tidak ditemukan pada data pasien bersama.");
        const selectedRoom = data.rooms.find((room) => room.id === values.roomId);
        if (data.beds.filter((item) => item.roomId === values.roomId && item.id !== values.id).length >= Number(selectedRoom.capacity)) throw new Error("Kapasitas ruangan sudah penuh.");
        const existingIndex = data.beds.findIndex((item) => item.id === values.id);
        const existingBed = existingIndex >= 0 ? data.beds[existingIndex] : null;
        const activeAdmission = data.admissions.find((admission) =>
          admission.bedId === values.id && !["Selesai", "Pulang"].includes(admission.status)
        );
        if (activeAdmission && (!existingBed || values.status !== "occupied" || values.roomId !== existingBed.roomId ||
          values.patientMRN !== activeAdmission.medicalRecordNumber)) {
          throw new Error("Bed terhubung ke admisi aktif; perubahan status, ruangan, atau pasien harus dilakukan melalui Rawat Inap.");
        }
        const updated = {
          ...(existingIndex >= 0 ? data.beds[existingIndex] : {}),
          ...values,
          code: values.bedNumber,
          patientMRN: values.status === "occupied" ? values.patientMRN : "",
          id: values.id || id("BED"),
          updatedAt: dateTime()
        };
        if (existingIndex >= 0) data.beds[existingIndex] = updated; else data.beds.push(updated);
        save(data, existingIndex >= 0 ? "Ubah" : "Tambah", "beds", updated.id, updated.bedNumber);
      } else if (kind === "user") {
        const username = values.username.toLowerCase();
        if ((api.demoAccounts || []).some((account) => String(account.username || "").toLowerCase() === username)) throw new Error("Nama pengguna sudah dipakai akun demo bawaan.");
        if (data.userAccounts.some((item) => item.id !== values.id && String(item.username || "").toLowerCase() === username)) throw new Error("Nama pengguna sudah digunakan.");
        const existingIndex = data.userAccounts.findIndex((item) => item.id === values.id);
        const existing = existingIndex >= 0 ? data.userAccounts[existingIndex] : null;
        if (!existing && values.password.length < 6) throw new Error("Kata sandi akun baru minimal 6 karakter.");
        if (values.password && values.password.length < 6) throw new Error("Kata sandi minimal 6 karakter.");
        if (!values.permissions.length) throw new Error("Pilih setidaknya satu halaman yang dapat diakses akun.");
        const updated = { ...(existing || {}), ...values, password: values.password || (existing && existing.password), username, id: values.id || id("USR"), updatedAt: dateTime() };
        if (existingIndex >= 0) data.userAccounts[existingIndex] = updated; else data.userAccounts.push(updated);
        save(data, existingIndex >= 0 ? "Ubah" : "Tambah", "userAccounts", updated.id, `${updated.username} · ${roles[updated.role]}`);
      }
    } catch (error) {
      showError(error);
    }
  }

  function editRecord(collection, recordIdValue) {
    root.dataset.editingCollection = collection;
    root.dataset.editingId = recordIdValue;
    setNotice("", false);
    render();
    const form = root.querySelector(`form[data-form="${collection === "userAccounts" ? "user" : collection === "clinics" ? "clinic" : collection === "rooms" ? "room" : collection === "beds" ? "bed" : "staff"}"]`);
    if (form) form.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function removeRecord(collection, targetId) {
    const data = getData();
    if (collection === "rooms" && data.beds.some((bed) => bed.roomId === targetId)) {
      showError(new Error("Ruangan masih memiliki bed. Hapus atau pindahkan bed terlebih dahulu."));
      return;
    }
    if (collection === "clinics" && (data.clinics.find((clinic) => clinic.id === targetId)?.doctorSchedules || []).length) {
      showError(new Error("Klinik masih memiliki jadwal dokter. Hapus jadwal terlebih dahulu."));
      return;
    }
    const clinicTarget = collection === "clinics" ? data.clinics.find((clinic) => clinic.id === targetId) : null;
    if (clinicTarget && data.staff.some((staff) => staff.clinic === clinicTarget.name)) {
      showError(new Error("Klinik masih terhubung ke data staf. Ubah unit staf terlebih dahulu."));
      return;
    }
    if (collection === "staff" && data.clinics.some((clinic) => (clinic.doctorSchedules || []).some((schedule) => schedule.doctorId === targetId))) {
      showError(new Error("Staf masih terhubung ke jadwal klinik. Hapus jadwal terlebih dahulu."));
      return;
    }
    if (collection === "beds" && data.admissions.some((admission) => admission.bedId === targetId && !["Pulang", "Selesai"].includes(admission.status))) {
      showError(new Error("Bed masih digunakan oleh admisi aktif."));
      return;
    }
    const labels = { staff: "staf", clinics: "klinik", rooms: "ruangan", beds: "bed", userAccounts: "akun tambahan" };
    const records = data[collection];
    const target = records.find((item) => item.id === targetId);
    if (!target || !window.confirm(`Hapus ${labels[collection] || "data"} ini?`)) return;
    data[collection] = records.filter((item) => item.id !== targetId);
    save(data, "Hapus", collection, targetId, target.name || target.username || target.bedNumber || "");
  }

  function createInitialMasters() {
    const staff = [
      { id: "STF-UM-1", name: "dr. Andi Pratama", role: "doctor", clinic: "Poli Umum", schedule: "Senin", startTime: "08:00", endTime: "14:00", status: "Aktif" },
      { id: "STF-UM-2", name: "dr. Nur Aini", role: "doctor", clinic: "Poli Umum", schedule: "Selasa", startTime: "08:00", endTime: "14:00", status: "Aktif" },
      { id: "STF-AN-1", name: "dr. Siti Rahma, Sp.A", role: "doctor", clinic: "Poli Anak", schedule: "Rabu", startTime: "09:00", endTime: "15:00", status: "Aktif" },
      { id: "STF-GI-1", name: "drg. Budi Santoso", role: "doctor", clinic: "Poli Gigi", schedule: "Kamis", startTime: "10:00", endTime: "16:00", status: "Aktif" },
      { id: "STF-PD-1", name: "dr. Rina Kusuma, Sp.PD", role: "doctor", clinic: "Poli Penyakit Dalam", schedule: "Jumat", startTime: "08:00", endTime: "14:00", status: "Aktif" },
      { id: "STF-KA-1", name: "dr. Maya Permata, Sp.OG", role: "doctor", clinic: "Poli Kandungan", schedule: "Senin", startTime: "09:00", endTime: "15:00", status: "Aktif" },
      { id: "STF-MT-1", name: "dr. Fajar Nugroho, Sp.M", role: "doctor", clinic: "Poli Mata", schedule: "Selasa", startTime: "10:00", endTime: "16:00", status: "Aktif" },
      { id: "STF-NUR-1", name: "Perawat Demo 01", role: "nurse", clinic: "Rawat Inap", schedule: "Shift simulasi", status: "Aktif" },
      { id: "STF-RM-1", name: "Petugas Rekam Medis Demo", role: "medical-records", clinic: "Rekam Medis", status: "Aktif" },
      { id: "STF-REG-1", name: "Petugas Pendaftaran Demo", role: "registration", clinic: "Pendaftaran", status: "Aktif" },
      { id: "STF-PH-1", name: "Petugas Farmasi Demo", role: "pharmacy", clinic: "Farmasi", status: "Aktif" },
      { id: "STF-LAB-1", name: "Petugas Laboratorium Demo", role: "laboratory", clinic: "Laboratorium", status: "Aktif" },
      { id: "STF-RAD-1", name: "Petugas Radiologi Demo", role: "radiology", clinic: "Radiologi", status: "Aktif" },
      { id: "STF-CASH-1", name: "Petugas Kasir Demo", role: "cashier", clinic: "Kasir", status: "Aktif" }
    ];
    const clinics = [
      { id: "CLN-UM", key: "umum", name: "Poli Umum", code: "UM", location: "Gedung A", doctorSchedules: [{ id: "SCH-UM-1", doctorId: "STF-UM-1", doctor: "dr. Andi Pratama", day: "Senin", startTime: "08:00", endTime: "14:00" }, { id: "SCH-UM-2", doctorId: "STF-UM-2", doctor: "dr. Nur Aini", day: "Selasa", startTime: "08:00", endTime: "14:00" }] },
      { id: "CLN-AN", key: "anak", name: "Poli Anak", code: "AN", location: "Gedung A", doctorSchedules: [{ id: "SCH-AN-1", doctorId: "STF-AN-1", doctor: "dr. Siti Rahma, Sp.A", day: "Rabu", startTime: "09:00", endTime: "15:00" }] },
      { id: "CLN-GI", key: "gigi", name: "Poli Gigi", code: "GI", location: "Gedung B", doctorSchedules: [{ id: "SCH-GI-1", doctorId: "STF-GI-1", doctor: "drg. Budi Santoso", day: "Kamis", startTime: "10:00", endTime: "16:00" }] },
      { id: "CLN-PD", key: "penyakit-dalam", name: "Poli Penyakit Dalam", code: "PD", location: "Gedung A", doctorSchedules: [{ id: "SCH-PD-1", doctorId: "STF-PD-1", doctor: "dr. Rina Kusuma, Sp.PD", day: "Jumat", startTime: "08:00", endTime: "14:00" }] },
      { id: "CLN-KA", key: "kandungan", name: "Poli Kandungan", code: "KA", location: "Gedung C", doctorSchedules: [{ id: "SCH-KA-1", doctorId: "STF-KA-1", doctor: "dr. Maya Permata, Sp.OG", day: "Senin", startTime: "09:00", endTime: "15:00" }] },
      { id: "CLN-MT", key: "mata", name: "Poli Mata", code: "MT", location: "Gedung B", doctorSchedules: [{ id: "SCH-MT-1", doctorId: "STF-MT-1", doctor: "dr. Fajar Nugroho, Sp.M", day: "Selasa", startTime: "10:00", endTime: "16:00" }] }
    ];
    const rooms = [
      { id: "ROOM-001", code: "R101", name: "Melati", class: "Kelas 1", ward: "Rawat Inap", location: "Gedung Rawat Inap", floor: "1", capacity: 2 },
      { id: "ROOM-002", code: "R201", name: "Anggrek", class: "Kelas 2", ward: "Rawat Inap", location: "Gedung Rawat Inap", floor: "2", capacity: 2 },
      { id: "ROOM-003", code: "R301", name: "Kenanga", class: "Kelas 3", ward: "Rawat Inap", location: "Gedung Rawat Inap", floor: "3", capacity: 2 }
    ];
    const beds = [
      { id: "BED-001", code: "M-101", bedNumber: "M-101", roomId: "ROOM-001", status: "available", patientMRN: "" },
      { id: "BED-002", code: "M-102", bedNumber: "M-102", roomId: "ROOM-001", status: "available", patientMRN: "" },
      { id: "BED-003", code: "A-201", bedNumber: "A-201", roomId: "ROOM-002", status: "available", patientMRN: "" },
      { id: "BED-004", code: "A-202", bedNumber: "A-202", roomId: "ROOM-002", status: "available", patientMRN: "" },
      { id: "BED-005", code: "K-301", bedNumber: "K-301", roomId: "ROOM-003", status: "available", patientMRN: "" },
      { id: "BED-006", code: "K-302", bedNumber: "K-302", roomId: "ROOM-003", status: "available", patientMRN: "" }
    ];
    return { staff, clinics, rooms, beds };
  }

  function addSyntheticDemoData() {
    const today = new Date();
    const day = api.getLocalDate(today);
    const now = today.toISOString();
    const patients = [1, 2].map((number) => ({
      medicalRecordNumber: `RM-DEMO-${String(number).padStart(3, "0")}`,
      nik: `000000000000000${number}`, familyCard: `000000000000000${number}`,
      fullName: `Pasien Demo ${String(number).padStart(2, "0")}`,
      birthPlace: "Kota Contoh", birthDate: number === 1 ? "1990-01-01" : "1985-05-05",
      gender: number === 1 ? "Laki-laki" : "Perempuan",
      address: `Alamat Fiktif ${String(number).padStart(2, "0")}, Jalan Contoh`,
      phone: "080000000000", createdAt: now
    }));
    const visits = patients.map((patient, index) => ({
      registrationNumber: `REG-DEMO-${String(index + 1).padStart(3, "0")}`,
      queueNumber: `UM-${String(index + 1).padStart(3, "0")}`,
      medicalRecordNumber: patient.medicalRecordNumber, patientName: patient.fullName, patientNik: patient.nik,
      visitDate: day, poliCode: "UM", poliName: "Poli Umum", doctor: "dr. Andi Pratama",
      paymentType: "Umum", complaint: "Keluhan simulasi", status: index === 0 ? "Selesai" : "Menunggu",
      createdAt: now, statusHistory: []
    }));
    const examinations = [{
      registrationNumber: visits[0].registrationNumber,
      medicalRecordNumber: patients[0].medicalRecordNumber, visitDate: day,
      poliName: visits[0].poliName, doctor: "dr. Andi Pratama", mainComplaint: "Keluhan simulasi",
      physicalExam: "Pemeriksaan fisik simulasi.", primaryDiagnosis: "Catatan diagnosis simulasi",
      additionalDiagnosis: "", medicalActions: "Observasi simulasi", doctorNotes: "Catatan fiktif.",
      treatmentPlan: "Kontrol bila diperlukan.",
      prescriptions: [{ medicineName: "Paracetamol 500 mg", dosage: "1 tablet", quantity: "9 tablet", instructions: "3 kali sehari selama 3 hari", notes: "Sesudah makan" }],
      diagnosticRequests: [{ type: "laboratory", name: "Pemeriksaan darah simulasi" }],
      createdAt: now, updatedAt: now
    }];
    const masters = createInitialMasters();
    const { staff, clinics, rooms, beds } = masters;
    beds[0].status = "occupied";
    beds[0].patientMRN = patients[0].medicalRecordNumber;
    const admission = { id: "ADM-DEMO-01", registrationNumber: visits[0].registrationNumber, medicalRecordNumber: patients[0].medicalRecordNumber, patientName: patients[0].fullName, roomId: beds[0].roomId, bedId: beds[0].id, admissionDate: day, admittedAt: now, status: "Aktif", diagnosis: "Diagnosis simulasi", doctor: "dr. Andi Pratama", progressNotes: [], createdAt: now, updatedAt: now };
    const medications = [
      { id: "MED-DEMO-01", code: "OBT-DEMO-01", name: "Paracetamol 500 mg", category: "Analgesik", unit: "tablet", stock: 100, minStock: 10, price: 500, description: "Obat demo" },
      { id: "MED-DEMO-02", code: "OBT-DEMO-02", name: "Amoxicillin 500 mg", category: "Antibiotik", unit: "kapsul", stock: 80, minStock: 20, price: 1500, description: "Obat demo" },
      { id: "MED-DEMO-03", code: "OBT-DEMO-03", name: "Omeprazole 20 mg", category: "Saluran cerna", unit: "kapsul", stock: 12, minStock: 20, price: 2500, description: "Obat demo" }
    ];
    const medication = medications[0];
    const orderId = `RX-${visits[0].registrationNumber}`;
    const simulatedTariffs = {
      visit: 15000, procedure: 50000, medicineUnit: 5000,
      laboratory: 75000, radiology: 150000, inpatientDaily: 250000
    };
    const invoiceTotal = 15000 + 50000 + 50000 + 9 * medication.price + 75000 + 250000;
    return {
      patients, visits, examinations, staff, clinics, rooms, beds, admissions: [admission],
      medications,
      pharmacyOrders: [{ id: orderId, registrationNumber: visits[0].registrationNumber, medicalRecordNumber: patients[0].medicalRecordNumber, patientName: patients[0].fullName, doctor: "dr. Andi Pratama", visitDate: day, items: [{ id: `${orderId}-1`, medicationId: medication.id, medicineName: medication.name, dosage: "1 tablet", quantity: 9, quantityLabel: "9 tablet", instructions: "3 kali sehari selama 3 hari", notes: "Sesudah makan" }], status: "Menunggu Verifikasi", createdAt: now }],
      stockTransactions: medications.map((item, index) => ({ id: `STK-DEMO-${String(index + 1).padStart(2, "0")}`, medicationId: item.id, medicineName: item.name, unit: item.unit, type: "Masuk", quantity: item.stock, createdAt: now, notes: "Stok awal simulasi" })),
      labOrders: [{ id: "LAB-DEMO-01", registrationNumber: visits[0].registrationNumber, medicalRecordNumber: patients[0].medicalRecordNumber, patientName: patients[0].fullName, visitDate: day, testName: "Pemeriksaan darah simulasi", status: "Menunggu", result: "", reference: "", conclusion: "", requestedAt: now, source: "Pemeriksaan Dokter" }],
      radiologyOrders: [{ id: "RAD-DEMO-01", registrationNumber: visits[1].registrationNumber, medicalRecordNumber: patients[1].medicalRecordNumber, patientName: patients[1].fullName, visitDate: day, testName: "Radiologi simulasi", status: "Menunggu", result: "", conclusion: "", requestedAt: now, source: "Order simulasi" }],
      invoices: [{ id: "INV-DEMO-01", prototypeType: "simulasi", registrationNumber: visits[0].registrationNumber, medicalRecordNumber: patients[0].medicalRecordNumber, issuedAt: now, updatedAt: now, total: invoiceTotal, status: "Belum Dibayar", tariffSnapshot: { ...simulatedTariffs }, sourceRefs: [], statusHistory: [{ status: "Belum Dibayar", changedAt: now }] }],
      payments: [],
      userAccounts: [], activityLog: [{ id: "ACT-DEMO-01", action: "Reset", entity: "demoData", entityId: "DEMO", details: "Dataset sintetis fiktif dibuat", actor: actor(), timestamp: now }],
      hospitalSettings: { name: "Rumah Sakit Sehat Abadi", address: "Alamat Fiktif, Jalan Contoh", phone: "080000000000", email: "demo@example.invalid", logoText: "SIMRS SASA" },
      tariffs: { ...defaultTariffs, prototypeSimulated: simulatedTariffs }
    };
  }

  function resetDemo() {
    if (!window.confirm("Reset akan MENGGANTI seluruh data bersama, termasuk data pasien, kunjungan, pemeriksaan, dan transaksi. Lanjutkan hanya untuk demonstrasi?")) return;
    try {
      api.saveData(api.ensureCollections(addSyntheticDemoData()));
      root.dataset.editingCollection = "";
      root.dataset.editingId = "";
      setNotice("Data demonstrasi sintetis berhasil dibuat. Semua identitas bersifat fiktif.", false);
      render();
    } catch (error) {
      showError(error);
    }
  }

  function seedInitialMasters() {
    const data = getData();
    const masters = createInitialMasters();
    let changed = false;
    if (data.clinics.length === 0) {
      data.clinics = masters.clinics;
      changed = true;
    }
    if (data.staff.length === 0) {
      data.staff = masters.staff;
      changed = true;
    }
    if (data.rooms.length === 0) {
      data.rooms = masters.rooms;
      changed = true;
    }
    if (data.beds.length === 0) {
      data.beds = masters.beds;
      changed = true;
    }
    if (changed) api.saveData(data);
  }

  function render() {
    try {
      if (moduleName === "pengaturan") renderSettings();
      else renderManagement();
    } catch (error) {
      root.innerHTML = `<section class="panel admin-panel"><h2>Data tidak dapat dimuat</h2><p role="alert">${esc(error.message || error)}</p></section>`;
    }
  }

  root.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.dataset.tab) {
      activeTab = target.dataset.tab;
      root.dataset.editingCollection = "";
      root.dataset.editingId = "";
      search = "";
      setNotice("", false);
      render();
    } else if (target.dataset.edit) {
      editRecord(target.dataset.edit, target.dataset.recordId);
    } else if (target.dataset.delete) {
      removeRecord(target.dataset.delete, target.dataset.recordId);
    } else if (target.dataset.cancelEdit !== undefined) {
      root.dataset.editingCollection = "";
      root.dataset.editingId = "";
      setNotice("", false);
      render();
    } else if (target.dataset.editSchedule) {
      root.dataset.editingScheduleId = target.dataset.editSchedule;
      root.dataset.editingScheduleClinicId = target.dataset.clinicId;
      setNotice("", false);
      render();
      const scheduleForm = root.querySelector('form[data-form="schedule"]');
      if (scheduleForm) scheduleForm.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (target.hasAttribute("data-cancel-schedule-edit")) {
      root.dataset.editingScheduleId = "";
      root.dataset.editingScheduleClinicId = "";
      setNotice("", false);
      render();
    } else if (target.dataset.deleteSchedule) {
      const data = getData();
      const clinic = data.clinics.find((item) => item.id === target.dataset.clinicId);
      const schedule = clinic && (clinic.doctorSchedules || []).find((item) => item.id === target.dataset.deleteSchedule);
      if (clinic && schedule && window.confirm("Hapus jadwal dokter ini?")) {
        clinic.doctorSchedules = clinic.doctorSchedules.filter((item) => item.id !== schedule.id);
        root.dataset.editingScheduleId = "";
        root.dataset.editingScheduleClinicId = "";
        save(data, "Hapus", "doctorSchedule", schedule.id, `${schedule.doctor} · ${schedule.day}`);
      }
    } else if (target.hasAttribute("data-reset-demo")) {
      resetDemo();
    }
  });
  root.addEventListener("submit", handleSubmit);
  root.addEventListener("input", (event) => {
    if (!event.target.matches("[data-search]")) return;
    search = event.target.value;
    const cursor = event.target.selectionStart;
    render();
    const searchInput = root.querySelector("[data-search]");
    if (searchInput) {
      searchInput.focus();
      searchInput.setSelectionRange(cursor, cursor);
    }
  });
  window.addEventListener("storage", (event) => {
    if (!api.storageKey || event.key === api.storageKey) render();
  });

  if (moduleName === "manajemen-data") seedInitialMasters();
  render();
})();
