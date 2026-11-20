(() => {
  const sessionKey = "simrsSasaUser";
  const roleStorageKey = "simrsSasaRole";
  const registrationStorageKey = "simrsSasaRegistrationData";
  const poliOptions = {
    umum: { name: "Poli Umum", code: "UM", doctors: ["dr. Andi Pratama", "dr. Nur Aini"] },
    anak: { name: "Poli Anak", code: "AN", doctors: ["dr. Siti Rahma, Sp.A"] },
    gigi: { name: "Poli Gigi", code: "GI", doctors: ["drg. Budi Santoso"] },
    "penyakit-dalam": { name: "Poli Penyakit Dalam", code: "PD", doctors: ["dr. Rina Kusuma, Sp.PD"] },
    kandungan: { name: "Poli Kandungan", code: "KA", doctors: ["dr. Maya Permata, Sp.OG"] },
    mata: { name: "Poli Mata", code: "MT", doctors: ["dr. Fajar Nugroho, Sp.M"] }
  };
  const visitStatuses = ["Menunggu", "Dipanggil", "Sedang Diperiksa", "Selesai", "Batal"];
  const pageInfo = {
    "pendaftaran.html": { title: "Pendaftaran Pasien", description: "Kelola alur pendaftaran dan kunjungan pasien.", icon: "＋" },
    "pasien.html": { title: "Data Pasien", description: "Akses informasi dasar pasien rumah sakit.", icon: "♙" },
    "rawat-jalan.html": { title: "Rawat Jalan", description: "Pantau pelayanan pasien di poliklinik.", icon: "⌂" },
    "detail-kunjungan.html": { title: "Detail Kunjungan", description: "Informasi lengkap kunjungan pasien.", icon: "⌂" },
    "pemeriksaan.html": { title: "Pemeriksaan Dokter", description: "Periksa pasien yang sudah dipanggil dari antrean Rawat Jalan.", icon: "♡" },
    "rekam-medis.html": { title: "Rekam Medis", description: "Akses ringkasan rekam medis pasien.", icon: "▤" },
    "coding-icd.html": { title: "Coding ICD", description: "Kelola informasi klasifikasi diagnosis.", icon: "⌕" },
    "laporan.html": { title: "Laporan", description: "Lihat ringkasan informasi operasional rumah sakit.", icon: "▥" },
    "dokter.html": { title: "Data Dokter", description: "Akses informasi dokter dan tenaga medis.", icon: "♧" },
    "poli.html": { title: "Data Poliklinik", description: "Akses informasi poliklinik dan jadwal pelayanan.", icon: "⌖" },
    "farmasi.html": { title: "Farmasi", description: "Kelola resep, persediaan, dan transaksi obat.", icon: "✚" },
    "rawat-inap.html": { title: "Rawat Inap", description: "Kelola admisi, tempat tidur, perkembangan, dan pasien pulang.", icon: "▦" },
    "laboratorium.html": { title: "Laboratorium", description: "Kelola permintaan dan hasil pemeriksaan laboratorium.", icon: "⚗" },
    "radiologi.html": { title: "Radiologi", description: "Kelola permintaan dan hasil pemeriksaan radiologi.", icon: "◉" },
    "kasir.html": { title: "Kasir dan Pembayaran", description: "Kelola tagihan, pembayaran, dan kuitansi pasien.", icon: "Rp" },
    "manajemen-data.html": { title: "Manajemen Data", description: "Kelola data tenaga kesehatan, layanan, ruangan, dan akun.", icon: "⚙" },
    "pengaturan.html": { title: "Pengaturan Sistem", description: "Atur profil rumah sakit, hak akses, dan data demonstrasi.", icon: "☷" }
  };
  const moduleCollectionKeys = [
    "medications", "pharmacyOrders", "stockTransactions", "admissions", "beds",
    "labOrders", "radiologyOrders", "invoices", "payments", "staff", "rooms",
    "clinics", "userAccounts", "activityLog"
  ];
  const demoAccounts = [
    { username: "admin", password: "admin123", fullName: "Administrator SIMRS", role: "admin" },
    { username: "pendaftaran", password: "daftar123", fullName: "Petugas Pendaftaran", role: "registration" },
    { username: "dokter", password: "dokter123", fullName: "Dokter Demo", role: "doctor" },
    { username: "perawat", password: "perawat123", fullName: "Perawat Demo", role: "nurse" },
    { username: "rekammedis", password: "rm123", fullName: "Petugas Rekam Medis", role: "medical-records" },
    { username: "coding", password: "coding123", fullName: "Petugas Coding", role: "coding" },
    { username: "farmasi", password: "farmasi123", fullName: "Petugas Farmasi", role: "pharmacy" },
    { username: "lab", password: "lab123", fullName: "Petugas Laboratorium", role: "laboratory" },
    { username: "radiologi", password: "radio123", fullName: "Petugas Radiologi", role: "radiology" },
    { username: "kasir", password: "kasir123", fullName: "Petugas Kasir", role: "cashier" }
  ];
  const rolePageAccess = {
    admin: ["*"],
    registration: ["dashboard.html", "pendaftaran.html", "pasien.html", "rawat-jalan.html"],
    doctor: ["dashboard.html", "rawat-jalan.html", "pemeriksaan.html", "rekam-medis.html", "coding-icd.html", "laporan.html"],
    nurse: ["dashboard.html", "pasien.html", "rawat-jalan.html", "rawat-inap.html", "laboratorium.html", "radiologi.html"],
    "medical-records": ["dashboard.html", "pasien.html", "rekam-medis.html", "coding-icd.html", "laporan.html"],
    coding: ["dashboard.html", "rekam-medis.html", "coding-icd.html", "laporan.html"],
    pharmacy: ["dashboard.html", "farmasi.html", "laporan.html"],
    laboratory: ["dashboard.html", "laboratorium.html", "laporan.html"],
    radiology: ["dashboard.html", "radiologi.html", "laporan.html"],
    cashier: ["dashboard.html", "kasir.html", "laporan.html"]
  };
  const roleLabels = {
    admin: "Admin",
    registration: "Petugas Pendaftaran",
    doctor: "Dokter",
    nurse: "Perawat",
    "medical-records": "Petugas Rekam Medis",
    coding: "Petugas Coding",
    pharmacy: "Petugas Farmasi",
    laboratory: "Petugas Laboratorium",
    radiology: "Petugas Radiologi",
    cashier: "Kasir"
  };

  const readUser = () => {
    try {
      return localStorage.getItem(sessionKey);
    } catch (error) {
      return null;
    }
  };

  const readRole = () => {
    try {
      return localStorage.getItem(roleStorageKey) || "admin";
    } catch (error) {
      return "admin";
    }
  };

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  const readRegistrationData = () => {
    const stored = localStorage.getItem(registrationStorageKey);
    if (!stored) {
      return { patients: [], visits: [] };
    }

    const parsed = JSON.parse(stored);
    if (!parsed || !Array.isArray(parsed.patients) || !Array.isArray(parsed.visits)) {
      throw new Error("Struktur data pendaftaran tidak valid.");
    }
    if (migrateSharedData(parsed)) {
      saveRegistrationData(parsed);
    }
    return parsed;
  };

  const saveRegistrationData = (data) => {
    localStorage.setItem(registrationStorageKey, JSON.stringify(data));
  };

  const migrateSharedData = (data) => {
    let changed = false;
    const isRecord = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
    const setIfMissing = (record, key, value) => {
      if (!isRecord(record)) return;
      if (record[key] === undefined && value !== undefined && value !== null && value !== "") {
        record[key] = value;
        changed = true;
      }
    };
    (Array.isArray(data.rooms) ? data.rooms : []).forEach((room) => {
      if (!isRecord(room)) return;
      setIfMissing(room, "code", room.roomCode);
      setIfMissing(room, "class", room.roomClass || room.className || "Belum ditentukan");
    });
    (Array.isArray(data.beds) ? data.beds : []).forEach((bed) => {
      if (!isRecord(bed)) return;
      setIfMissing(bed, "code", bed.bedNumber);
      setIfMissing(bed, "bedNumber", bed.code);
      setIfMissing(bed, "patientMRN", bed.medicalRecordNumber);
      const legacyStatuses = { tersedia: "available", terisi: "occupied", perawatan: "cleaning", dibersihkan: "cleaning" };
      const normalizedStatus = legacyStatuses[String(bed.status || "").trim().toLocaleLowerCase("id")];
      if (normalizedStatus && bed.status !== normalizedStatus) {
        bed.status = normalizedStatus;
        changed = true;
      }
    });
    (Array.isArray(data.admissions) ? data.admissions : []).forEach((admission) => {
      if (!isRecord(admission)) return;
      setIfMissing(admission, "admissionDate", String(admission.admittedAt || admission.createdAt || "").slice(0, 10));
      const legacyStatuses = { dirawat: "Aktif", aktif: "Aktif", dipindah: "Dipindahkan", dipindahkan: "Dipindahkan", pulang: "Selesai", selesai: "Selesai" };
      const normalizedStatus = legacyStatuses[String(admission.status || "").trim().toLocaleLowerCase("id")];
      if (normalizedStatus && admission.status !== normalizedStatus) {
        admission.status = normalizedStatus;
        changed = true;
      }
    });
    (Array.isArray(data.medications) ? data.medications : []).forEach((medication) => {
      if (!isRecord(medication)) return;
      setIfMissing(medication, "minStock", medication.minimumStock);
    });
    (Array.isArray(data.stockTransactions) ? data.stockTransactions : []).forEach((transaction) => {
      if (!isRecord(transaction)) return;
      setIfMissing(transaction, "medicineName", transaction.medication);
      setIfMissing(transaction, "createdAt", transaction.date);
      setIfMissing(transaction, "notes", transaction.note);
      const medication = (Array.isArray(data.medications) ? data.medications : []).find((record) =>
        isRecord(record) && record.id === transaction.medicationId
      );
      if (medication) setIfMissing(transaction, "unit", medication.unit);
    });
    (Array.isArray(data.pharmacyOrders) ? data.pharmacyOrders : []).forEach((order) => {
      if (!isRecord(order)) return;
      (Array.isArray(order.items) ? order.items : []).forEach((item) => {
        if (!isRecord(item)) return;
        setIfMissing(item, "medicineName", item.medication);
        const medication = (Array.isArray(data.medications) ? data.medications : []).find((record) =>
          isRecord(record) && (record.id === item.medicationId ||
          String(record.name || "").trim().toLocaleLowerCase("id") === String(item.medicineName || item.medication || "").trim().toLocaleLowerCase("id")
          )
        );
        if (medication) setIfMissing(item, "medicationId", medication.id);
      });
    });
    ["labOrders", "radiologyOrders"].forEach((collection) => {
      (Array.isArray(data[collection]) ? data[collection] : []).forEach((order) => {
        if (!isRecord(order)) return;
        setIfMissing(order, "testName", order.examName || order.name);
        setIfMissing(order, "requestedAt", order.createdAt);
      });
    });
    return changed;
  };

  const ensureModuleCollections = (data) => {
    moduleCollectionKeys.forEach((key) => {
      if (data[key] === undefined) {
        data[key] = [];
      } else if (!Array.isArray(data[key])) {
        throw new Error(`Struktur data ${key} tidak valid.`);
      }
    });
    if (data.hospitalSettings === undefined) {
      data.hospitalSettings = {};
    } else if (!data.hospitalSettings || typeof data.hospitalSettings !== "object" || Array.isArray(data.hospitalSettings)) {
      throw new Error("Struktur pengaturan rumah sakit tidak valid.");
    }
    if (data.tariffs === undefined) {
      data.tariffs = {};
    } else if (!data.tariffs || typeof data.tariffs !== "object" || Array.isArray(data.tariffs)) {
      throw new Error("Struktur tarif layanan tidak valid.");
    }
    return data;
  };

  window.SIMRSSasa = Object.freeze({
    storageKey: registrationStorageKey,
    readData: readRegistrationData,
    saveData: saveRegistrationData,
    ensureCollections: ensureModuleCollections,
    demoAccounts,
    roleLabels,
    rolePageAccess,
    getRole: readRole,
    getLocalDate: (date) => getLocalDate(date)
  });

  const readExaminations = (data) => {
    if (data.examinations === undefined) {
      return [];
    }
    if (!Array.isArray(data.examinations)) {
      throw new Error("Struktur riwayat pemeriksaan tidak valid.");
    }
    return data.examinations;
  };

  const createElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = text;
    }
    return element;
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }
    const parsedDate = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsedDate.getTime())
      ? value
      : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(parsedDate);
  };

  const getLocalDate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const findVisitPoli = (visit) => Object.entries(poliOptions).find(([key, poli]) =>
    visit.poliCode === key || visit.poliCode === poli.code || visit.poliName === poli.name
  );

  const getVisitPoliKey = (visit) => {
    const match = findVisitPoli(visit);
    return match ? match[0] : visit.poliCode || visit.poliName || "";
  };

  const getVisitPoliCode = (visit) => {
    const match = findVisitPoli(visit);
    return match ? match[1].code : visit.poliCode || "";
  };

  const getVisitPoliName = (visit) => {
    const match = findVisitPoli(visit);
    return visit.poliName || (match ? match[1].name : "Poli tidak diketahui");
  };

  const hydrateClinicalMasters = (data) => {
    if (!Array.isArray(data.clinics)) {
      return;
    }
    data.clinics.forEach((clinic) => {
      const code = String(clinic.code || "").trim();
      const existingEntry = Object.entries(poliOptions).find(([, poli]) => poli.code === code);
      const key = String(clinic.key || (existingEntry ? existingEntry[0] : clinic.code) || "").trim().toLowerCase();
      const name = String(clinic.name || "").trim();
      if (!key || !name || !code) {
        return;
      }
      const assignedDoctors = Array.isArray(data.staff)
        ? data.staff.filter((staff) =>
          staff.role === "doctor" &&
          (staff.clinicKey === key || staff.clinicCode === code || staff.clinicName === name || staff.clinic === name)
        ).map((staff) => staff.fullName || staff.name).filter(Boolean)
        : [];
      const existing = existingEntry ? existingEntry[1] : null;
      const scheduledDoctors = Array.isArray(clinic.doctorSchedules)
        ? clinic.doctorSchedules.map((schedule) => schedule.doctor).filter(Boolean)
        : [];
      const doctors = assignedDoctors.length ? assignedDoctors : scheduledDoctors;
      poliOptions[key] = { name, code, doctors: doctors.length ? [...new Set(doctors)] : (existing ? existing.doctors : []) };
    });
  };

  const findVisitPatient = (data, visit) =>
    data.patients.find((patient) => patient.medicalRecordNumber === visit.medicalRecordNumber);

  const setVisitStatus = (visit, nextStatus, changedAt = new Date().toISOString()) => {
    if (!visitStatuses.includes(nextStatus)) {
      throw new Error("Status kunjungan tidak dikenal.");
    }

    if (visit.status === nextStatus) {
      return false;
    }

    const previousStatus = visit.status || "Tidak diketahui";
    visit.status = nextStatus;
    visit.statusUpdatedAt = changedAt;
    if (nextStatus === "Dipanggil") {
      visit.calledAt = changedAt;
    }
    if (!Array.isArray(visit.statusHistory)) {
      visit.statusHistory = [];
    }
    visit.statusHistory.push({ from: previousStatus, to: nextStatus, changedAt });
    return true;
  };

  const syncExaminationOrders = (data, examination, patient) => {
    ensureModuleCollections(data);
    const orderId = `RX-${examination.registrationNumber}`;
    const existingOrder = data.pharmacyOrders.find((order) => order.id === orderId);
    if (Array.isArray(examination.prescriptions) && examination.prescriptions.length) {
      if (!existingOrder || existingOrder.status === "Menunggu Verifikasi") {
        const items = examination.prescriptions.map((prescription, index) => {
          const medication = data.medications.find((record) =>
            String(record.name || "").trim().toLocaleLowerCase("id") === String(prescription.medicineName || "").trim().toLocaleLowerCase("id")
          );
          const quantityText = String(prescription.quantity || "").trim();
          const quantityMatch = quantityText.match(/^\d+(?:[.,]\d+)?/);
          return {
            id: `${orderId}-${index + 1}`,
            medicationId: medication ? medication.id : "",
            medicineName: String(prescription.medicineName || "").trim(),
            dosage: String(prescription.dosage || "").trim(),
            quantity: quantityMatch ? Number(quantityMatch[0].replace(",", ".")) : 0,
            quantityLabel: quantityText,
            instructions: String(prescription.instructions || "").trim(),
            notes: String(prescription.notes || "").trim()
          };
        });
        const order = {
          id: orderId,
          registrationNumber: examination.registrationNumber,
          medicalRecordNumber: patient.medicalRecordNumber,
          patientName: patient.fullName,
          doctor: examination.doctor || "",
          visitDate: examination.visitDate,
          status: "Menunggu Verifikasi",
          items,
          createdAt: existingOrder ? existingOrder.createdAt : examination.updatedAt,
          updatedAt: examination.updatedAt
        };
        if (existingOrder) {
          Object.assign(existingOrder, order);
        } else {
          data.pharmacyOrders.push(order);
        }
      }
    } else if (existingOrder && existingOrder.status === "Menunggu Verifikasi") {
      existingOrder.status = "Dibatalkan";
      existingOrder.updatedAt = examination.updatedAt;
    }

    const requests = Array.isArray(examination.diagnosticRequests) ? examination.diagnosticRequests : [];
    requests.forEach((request) => {
      const type = request.type === "radiology" ? "radiology" : "laboratory";
      const collection = type === "radiology" ? data.radiologyOrders : data.labOrders;
      const prefix = type === "radiology" ? "RAD" : "LAB";
      const requestNameKey = encodeURIComponent(String(request.name || "").trim());
      const id = `${prefix}-${examination.registrationNumber}-${requestNameKey}`;
      if (!collection.some((order) => order.id === id)) {
        collection.push({
          id,
          registrationNumber: examination.registrationNumber,
          medicalRecordNumber: patient.medicalRecordNumber,
          patientName: patient.fullName,
          visitDate: examination.visitDate,
          doctor: examination.doctor || "",
          testName: String(request.name || "").trim(),
          status: "Menunggu",
          result: "",
          conclusion: "",
          requestedAt: examination.updatedAt,
          source: "Pemeriksaan Dokter"
        });
      }
    });
  };

  const updateVisitStatus = (registrationNumber, nextStatus) => {
    const data = readRegistrationData();
    const visit = data.visits.find((record) => record.registrationNumber === registrationNumber);
    if (!visit) {
      throw new Error("Kunjungan tidak ditemukan. Muat ulang daftar kunjungan.");
    }
    const changed = setVisitStatus(visit, nextStatus);
    if (!changed) {
      return { visit, changed: false };
    }
    saveRegistrationData(data);
    return { visit, changed: true };
  };

  const showVisitNotification = (element, text, isError = false) => {
    if (!element) {
      return;
    }
    element.textContent = text;
    element.classList.toggle("toast-error", isError);
    element.classList.add("is-visible");
    window.clearTimeout(element._hideTimer);
    element._hideTimer = window.setTimeout(() => element.classList.remove("is-visible"), 4500);
  };

  const showDataLoadError = (element, error) => {
    element.hidden = false;
    element.replaceChildren(
      createElement("strong", "", "Data tidak dapat dimuat"),
      createElement("p", "", error.message || "Terjadi kesalahan saat membaca penyimpanan browser.")
    );
  };

  const initializeRegistration = () => {
    const form = document.querySelector("#registrationForm");
    if (!form) {
      return;
    }

    const message = document.querySelector("#registrationMessage");
    const newPatientFields = document.querySelector("#newPatientFields");
    const existingPatientFields = document.querySelector("#existingPatientFields");
    const visitSection = document.querySelector("#visitSection");
    const visitDate = document.querySelector("#visitDate");
    const poliSelect = document.querySelector("#poliSelect");
    const doctorSelect = document.querySelector("#doctorSelect");
    const paymentType = document.querySelector("#paymentType");
    const bpjsField = document.querySelector("#bpjsField");
    const bpjsNumber = document.querySelector("#bpjsNumber");
    const searchInput = document.querySelector("#patientSearchInput");
    const searchResult = document.querySelector("#patientSearchResult");
    const selectedPatientSummary = document.querySelector("#selectedPatientSummary");
    const toast = document.querySelector("#registrationToast");
    let mode = "new";
    let selectedPatient = null;
    let toastTimer;
    try {
      const data = readRegistrationData();
      hydrateClinicalMasters(data);
      const knownOptions = new Set([...poliSelect.options].map((option) => option.value));
      Object.entries(poliOptions).forEach(([key, poli]) => {
        if (!knownOptions.has(key)) {
          poliSelect.add(new Option(poli.name, key));
        }
      });
    } catch (error) {
      showDataLoadError(message, error);
    }

    const showMessage = (text, type) => {
      message.textContent = text;
      message.dataset.type = type || "error";
      message.hidden = !text;
    };

    const showToast = (text) => {
      toast.textContent = text;
      toast.classList.add("is-visible");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 4500);
    };

    const updatePaymentFields = () => {
      const needsBpjs = paymentType.value === "BPJS";
      bpjsField.hidden = !needsBpjs;
      bpjsNumber.disabled = !needsBpjs;
      bpjsNumber.required = needsBpjs;
    };

    const updateVisitAvailability = () => {
      const isAvailable = mode === "new" || Boolean(selectedPatient);
      visitSection.hidden = !isAvailable;
      visitSection.querySelectorAll("input, select, textarea").forEach((input) => {
        input.disabled = !isAvailable;
      });
      if (isAvailable) {
        updatePaymentFields();
      }
    };

    const setMode = (nextMode) => {
      mode = nextMode;
      selectedPatient = null;
      newPatientFields.disabled = mode !== "new";
      existingPatientFields.hidden = mode !== "existing";
      searchResult.replaceChildren();
      selectedPatientSummary.hidden = true;
      document.querySelectorAll("[data-patient-mode]").forEach((button) => {
        const isSelected = button.dataset.patientMode === mode;
        button.classList.toggle("active", isSelected);
        button.setAttribute("aria-selected", String(isSelected));
      });
      updateVisitAvailability();
      showMessage("");
      if (mode === "existing") {
        searchInput.focus();
      }
    };

    const renderPatientDetails = (patient, container, includeSelectButton) => {
      const card = createElement("div", "patient-result-card");
      const identity = createElement("div", "patient-result-identity");
      identity.append(
        createElement("span", "patient-result-avatar", patient.fullName.charAt(0).toUpperCase()),
        createElement("div", "", "")
      );
      const identityCopy = identity.lastElementChild;
      identityCopy.append(
        createElement("strong", "", patient.fullName),
        createElement("small", "", `No. RM ${patient.medicalRecordNumber}`)
      );
      const details = createElement("div", "patient-result-details");
      [
        ["NIK", patient.nik],
        ["Nomor KK", patient.familyCard],
        ["Tempat lahir", patient.birthPlace],
        ["Tanggal lahir", formatDate(patient.birthDate)],
        ["Jenis kelamin", patient.gender],
        ["Nomor HP", patient.phone],
        ["Alamat", patient.address]
      ].forEach(([label, value]) => {
        const item = createElement("div", "patient-detail-item");
        item.append(createElement("small", "", label), createElement("strong", "", value || "-"));
        details.append(item);
      });
      card.append(identity, details);
      if (includeSelectButton) {
        const selectButton = createElement("button", "button button-primary patient-select-button", "Lanjutkan pendaftaran kunjungan");
        selectButton.type = "button";
        selectButton.addEventListener("click", () => {
          selectedPatient = patient;
          selectedPatientSummary.replaceChildren();
          const label = createElement("span", "selected-patient-label", "PASIEN TERPILIH");
          const patientName = createElement("strong", "", patient.fullName);
          const patientRecord = createElement("small", "", `No. RM ${patient.medicalRecordNumber} · NIK ${patient.nik}`);
          selectedPatientSummary.append(label, patientName, patientRecord);
          selectedPatientSummary.hidden = false;
          updateVisitAvailability();
          visitDate.focus();
          visitSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        card.append(selectButton);
      }
      container.append(card);
    };

    document.querySelectorAll("[data-patient-mode]").forEach((button) => {
      button.addEventListener("click", () => setMode(button.dataset.patientMode));
    });

    document.querySelector("#patientSearchButton").addEventListener("click", () => {
      searchResult.replaceChildren();
      selectedPatient = null;
      selectedPatientSummary.hidden = true;
      updateVisitAvailability();
      showMessage("");
      const query = searchInput.value.trim();
      if (!query) {
        searchResult.append(createElement("p", "inline-feedback feedback-error", "Masukkan NIK atau nomor rekam medis untuk mencari pasien."));
        return;
      }

      try {
        const data = readRegistrationData();
        const normalizedQuery = query.replace(/\s/g, "").toLowerCase();
        const patient = data.patients.find((record) =>
          record.nik.replace(/\D/g, "") === normalizedQuery.replace(/\D/g, "") ||
          record.medicalRecordNumber.toLowerCase() === normalizedQuery
        );
        if (!patient) {
          const notFound = createElement("div", "search-empty");
          notFound.append(createElement("p", "", "Pasien tidak ditemukan. Pastikan NIK atau nomor rekam medis sudah benar."));
          const newPatientButton = createElement("button", "text-button", "Daftarkan sebagai pasien baru");
          newPatientButton.type = "button";
          newPatientButton.addEventListener("click", () => setMode("new"));
          notFound.append(newPatientButton);
          searchResult.append(notFound);
          return;
        }

        renderPatientDetails(patient, searchResult, true);
      } catch (error) {
        showMessage(`Data pasien gagal dibaca: ${error.message}`, "error");
      }
    });

    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.querySelector("#patientSearchButton").click();
      }
    });

    poliSelect.addEventListener("change", () => {
      const selectedPoli = poliOptions[poliSelect.value];
      doctorSelect.replaceChildren(new Option(selectedPoli ? "Pilih dokter" : "Pilih poli terlebih dahulu", ""));
      doctorSelect.disabled = !selectedPoli;
      if (selectedPoli) {
        selectedPoli.doctors.forEach((doctor) => doctorSelect.add(new Option(doctor, doctor)));
      }
    });

    paymentType.addEventListener("change", updatePaymentFields);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      showMessage("");
      if (mode === "existing" && !selectedPatient) {
        showMessage("Cari dan pilih pasien lama terlebih dahulu.", "error");
        searchInput.focus();
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      try {
        const data = readRegistrationData();
        const values = new FormData(form);
        let patient = selectedPatient;
        const now = new Date();
        const monthKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
        const dayKey = `${values.get("visitDate").replace(/-/g, "")}`;

        if (mode === "new") {
          const nik = String(values.get("nik")).replace(/\D/g, "");
          const duplicate = data.patients.find((record) => record.nik.replace(/\D/g, "") === nik);
          if (duplicate) {
            showMessage(`NIK sudah terdaftar atas nama ${duplicate.fullName} (No. RM ${duplicate.medicalRecordNumber}). Gunakan tab Pasien Lama untuk melanjutkan kunjungan.`, "error");
            document.querySelector('[data-patient-mode="existing"]').focus();
            return;
          }

          const recordPrefix = `RM-${monthKey}-`;
          const nextMedicalRecord = data.patients.reduce((maximum, record) => {
            const sequence = record.medicalRecordNumber.startsWith(recordPrefix)
              ? Number(record.medicalRecordNumber.slice(recordPrefix.length))
              : 0;
            return Math.max(maximum, sequence);
          }, 0) + 1;
          patient = {
            medicalRecordNumber: `${recordPrefix}${String(nextMedicalRecord).padStart(5, "0")}`,
            nik,
            familyCard: String(values.get("familyCard")).replace(/\D/g, ""),
            fullName: String(values.get("fullName")).trim(),
            birthPlace: String(values.get("birthPlace")).trim(),
            birthDate: String(values.get("birthDate")),
            gender: String(values.get("gender")),
            address: String(values.get("address")).trim(),
            phone: String(values.get("phone")).trim(),
            createdAt: now.toISOString()
          };
          data.patients.push(patient);
        } else {
          patient = data.patients.find((record) => record.medicalRecordNumber === selectedPatient.medicalRecordNumber);
          if (!patient) {
            showMessage("Data pasien tidak lagi tersedia. Silakan cari pasien kembali.", "error");
            setMode("existing");
            return;
          }
        }

        const poli = poliOptions[String(values.get("poli"))];
        const selectedPoliKey = String(values.get("poli"));
        const queueCount = data.visits.filter((visit) =>
          visit.visitDate === values.get("visitDate") &&
          (visit.poliCode === poli.code || visit.poliCode === selectedPoliKey || visit.poliName === poli.name)
        ).length;
        const registrationCount = data.visits.filter((visit) => visit.visitDate === values.get("visitDate")).length;
        const visit = {
          registrationNumber: `REG-${dayKey}-${String(registrationCount + 1).padStart(4, "0")}`,
          queueNumber: `${poli.code}-${String(queueCount + 1).padStart(3, "0")}`,
          medicalRecordNumber: patient.medicalRecordNumber,
          patientName: patient.fullName,
          patientNik: patient.nik,
          visitDate: String(values.get("visitDate")),
          poliCode: poli.code,
          poliName: poli.name,
          doctor: String(values.get("doctor")),
          paymentType: String(values.get("paymentType")),
          bpjsNumber: String(values.get("paymentType")) === "BPJS" ? String(values.get("bpjsNumber")).trim() : "",
          complaint: String(values.get("complaint")).trim(),
          status: "Menunggu",
          createdAt: now.toISOString()
        };
        data.visits.push(visit);
        saveRegistrationData(data);
        showMessage(`Pendaftaran berhasil. No. registrasi ${visit.registrationNumber}, antrean ${visit.queueNumber}, No. RM ${patient.medicalRecordNumber}.`, "success");
        showToast("Pendaftaran pasien berhasil disimpan.");
        form.reset();
        setMode("new");
        visitDate.value = new Date().toLocaleDateString("en-CA");
        poliSelect.dispatchEvent(new Event("change"));
        updatePaymentFields();
        showMessage(`Pendaftaran berhasil. No. registrasi ${visit.registrationNumber}, antrean ${visit.queueNumber}, No. RM ${patient.medicalRecordNumber}.`, "success");
      } catch (error) {
        showMessage(`Pendaftaran gagal disimpan: ${error.message}`, "error");
      }
    });

    visitDate.value = new Date().toLocaleDateString("en-CA");
    document.querySelector('[name="birthDate"]').max = new Date().toLocaleDateString("en-CA");
    setMode("new");
    updatePaymentFields();
  };

  const initializePatientList = () => {
    const tableBody = document.querySelector("#patientsTableBody");
    if (!tableBody) {
      return;
    }

    const search = document.querySelector("#patientListSearch");
    const emptyState = document.querySelector("#patientsEmptyState");
    let patients = [];
    try {
      patients = readRegistrationData().patients;
    } catch (error) {
      showDataLoadError(emptyState, error);
    }

    const render = () => {
      const query = search.value.trim().toLowerCase();
      const filtered = patients.filter((patient) =>
        [patient.medicalRecordNumber, patient.fullName, patient.nik].some((value) => value.toLowerCase().includes(query))
      );
      tableBody.replaceChildren();
      filtered.forEach((patient) => {
        const row = document.createElement("tr");
        [
          patient.medicalRecordNumber,
          patient.fullName,
          patient.nik,
          formatDate(patient.birthDate),
          patient.gender,
          patient.phone
        ].forEach((value, index) => {
          const cell = createElement("td", index === 0 ? "record-number" : "", value);
          row.append(cell);
        });
        tableBody.append(row);
      });
      document.querySelector("#patientCount").textContent = `${patients.length} pasien terdaftar`;
      if (patients.length > 0) {
        emptyState.hidden = filtered.length > 0;
        if (filtered.length === 0) {
          emptyState.replaceChildren(
            createElement("span", "", "⌕"),
            createElement("strong", "", "Pasien tidak ditemukan"),
            createElement("p", "", "Coba kata kunci lain seperti nama, NIK, atau nomor rekam medis.")
          );
        }
      } else if (tableBody.children.length === 0) {
        emptyState.hidden = false;
      }
    };

    search.addEventListener("input", render);
    render();
  };

  const initializeVisitList = () => {
    const tableBody = document.querySelector("#visitsTableBody");
    if (!tableBody) {
      return;
    }

    const search = document.querySelector("#visitListSearch");
    const emptyState = document.querySelector("#visitsEmptyState");
    const filterVisitDate = document.querySelector("#filterVisitDate");
    const filterPoli = document.querySelector("#filterPoli");
    const filterDoctor = document.querySelector("#filterDoctor");
    const filterStatus = document.querySelector("#filterStatus");
    const queueBoard = document.querySelector("#queueBoard");
    const notification = document.querySelector("#visitStatusToast");
    const statusClasses = {
      "Menunggu": "status-waiting",
      "Dipanggil": "status-called",
      "Sedang Diperiksa": "status-examining",
      "Selesai": "status-completed",
      "Batal": "status-cancelled"
    };
    let initialData;
    try {
      initialData = readRegistrationData();
    } catch (error) {
      showDataLoadError(emptyState, error);
      return;
    }

    const populatePoliFilter = (visits) => {
      const selectedValue = filterPoli.value;
      const knownPolis = new Map(Object.entries(poliOptions).map(([key, poli]) => [key, poli.name]));
      visits.forEach((visit) => {
        const key = getVisitPoliKey(visit);
        if (key && !knownPolis.has(key)) {
          knownPolis.set(key, getVisitPoliName(visit));
        }
      });
      filterPoli.replaceChildren(new Option("Semua poliklinik", ""));
      knownPolis.forEach((name, key) => filterPoli.add(new Option(name, key)));
      filterPoli.value = knownPolis.has(selectedValue) ? selectedValue : "";
    };

    const populateDoctorFilter = (visits) => {
      const selectedValue = filterDoctor.value;
      const selectedPoli = filterPoli.value;
      const doctors = new Set();
      Object.entries(poliOptions).forEach(([key, poli]) => {
        if (!selectedPoli || selectedPoli === key) {
          poli.doctors.forEach((doctor) => doctors.add(doctor));
        }
      });
      visits.forEach((visit) => {
        if ((!selectedPoli || getVisitPoliKey(visit) === selectedPoli) && visit.doctor) {
          doctors.add(visit.doctor);
        }
      });
      filterDoctor.replaceChildren(new Option("Semua dokter", ""));
      [...doctors].sort((first, second) => first.localeCompare(second, "id")).forEach((doctor) => {
        filterDoctor.add(new Option(doctor, doctor));
      });
      filterDoctor.value = doctors.has(selectedValue) ? selectedValue : "";
    };

    const getFilteredVisits = (visits) => {
      const query = search.value.trim().toLocaleLowerCase("id");
      return visits.filter((visit) => {
        const patient = findVisitPatient(initialData, visit);
        const name = patient ? patient.fullName : "";
        const searchMatches = !query ||
          name.toLocaleLowerCase("id").includes(query) ||
          visit.medicalRecordNumber.toLocaleLowerCase("id").includes(query);
        return searchMatches &&
          (!filterVisitDate.value || visit.visitDate === filterVisitDate.value) &&
          (!filterPoli.value || getVisitPoliKey(visit) === filterPoli.value) &&
          (!filterDoctor.value || visit.doctor === filterDoctor.value) &&
          (!filterStatus.value || visit.status === filterStatus.value);
      });
    };

    const renderQueueBoard = (visits) => {
      const boardDate = filterVisitDate.value || getLocalDate();
      const chosenPoli = filterPoli.value;
      document.querySelector("#queueBoardDate").textContent =
        `Antrean ${new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${boardDate}T00:00:00`))}`;

      const boardPolis = new Map(Object.entries(poliOptions).map(([key, poli]) => [key, poli.name]));
      visits.forEach((visit) => {
        const key = getVisitPoliKey(visit);
        if (key && !boardPolis.has(key)) {
          boardPolis.set(key, getVisitPoliName(visit));
        }
      });
      if (chosenPoli) {
        const selectedName = boardPolis.get(chosenPoli) || getVisitPoliName({ poliCode: chosenPoli });
        boardPolis.clear();
        boardPolis.set(chosenPoli, selectedName);
      }

      queueBoard.replaceChildren();
      boardPolis.forEach((poliName, poliKey) => {
        const poliVisits = visits.filter((visit) =>
          visit.visitDate === boardDate && getVisitPoliKey(visit) === poliKey
        );
        const waitingVisits = poliVisits
          .filter((visit) => visit.status === "Menunggu")
          .sort((first, second) => first.queueNumber.localeCompare(second.queueNumber, "en", { numeric: true }));
        const calledVisits = poliVisits
          .filter((visit) => visit.status === "Dipanggil")
          .sort((first, second) => String(second.statusUpdatedAt || second.calledAt || "").localeCompare(String(first.statusUpdatedAt || first.calledAt || "")));
        const card = createElement("article", "queue-poli-card");
        const heading = createElement("div", "queue-poli-heading");
        heading.append(
          createElement("strong", "", poliName),
          createElement("span", "queue-waiting-count", `${waitingVisits.length} menunggu`)
        );
        const called = createElement("div", "queue-current-call");
        called.append(createElement("small", "", "SEDANG DIPANGGIL"));
        if (calledVisits.length > 0) {
          const currentPatient = findVisitPatient(initialData, calledVisits[0]);
          called.append(
            createElement("strong", "", calledVisits[0].queueNumber),
            createElement("span", "", currentPatient ? currentPatient.fullName : "Data pasien tidak ditemukan")
          );
        } else {
          called.append(createElement("span", "queue-no-call", "Belum ada antrean dipanggil"));
        }
        const next = waitingVisits[0];
        const nextPatient = next ? findVisitPatient(initialData, next) : null;
        const nextQueue = createElement("div", "queue-next-patient");
        nextQueue.append(createElement("small", "", "ANTREAN SELANJUTNYA"));
        nextQueue.append(createElement("strong", "", next ? next.queueNumber : "—"));
        nextQueue.append(createElement("span", "", next ? (nextPatient ? nextPatient.fullName : "Data pasien tidak ditemukan") : "Tidak ada pasien menunggu"));
        const callButton = createElement("button", "button button-primary queue-call-button", "Panggil antrean berikutnya");
        callButton.type = "button";
        callButton.disabled = !next;
        callButton.addEventListener("click", () => {
          if (!next) {
            return;
          }
          try {
            const result = updateVisitStatus(next.registrationNumber, "Dipanggil");
            if (result.changed) {
              const patient = findVisitPatient(initialData, result.visit);
              showVisitNotification(notification, `${result.visit.queueNumber} dipanggil${patient ? `: ${patient.fullName}` : ""}.`);
            }
            render();
          } catch (error) {
            showVisitNotification(notification, `Antrean gagal dipanggil: ${error.message}`, true);
          }
        });
        card.append(heading, called, nextQueue, callButton);
        queueBoard.append(card);
      });
    };

    const render = () => {
      try {
        initialData = readRegistrationData();
      } catch (error) {
        showDataLoadError(emptyState, error);
        showVisitNotification(notification, `Data kunjungan gagal dimuat: ${error.message}`, true);
        return;
      }

      populatePoliFilter(initialData.visits);
      populateDoctorFilter(initialData.visits);
      const filtered = getFilteredVisits(initialData.visits)
        .sort((first, second) => second.visitDate.localeCompare(first.visitDate) || second.registrationNumber.localeCompare(first.registrationNumber));
      tableBody.replaceChildren();
      filtered.forEach((visit) => {
        const row = document.createElement("tr");
        const registrationCell = createElement("td", "record-number", visit.registrationNumber);
        const queueCell = createElement("td");
        queueCell.append(createElement("span", "queue-badge", visit.queueNumber));
        const patientCell = createElement("td");
        const patient = findVisitPatient(initialData, visit);
        patientCell.append(
          createElement("strong", patient ? "table-primary-text" : "table-primary-text missing-patient", patient ? patient.fullName : "Data pasien tidak ditemukan"),
          createElement("small", "table-secondary-text", `No. RM ${visit.medicalRecordNumber}`)
        );
        const poliCell = createElement("td");
        poliCell.append(
          createElement("strong", "table-primary-text", getVisitPoliName(visit)),
          createElement("small", "table-secondary-text", visit.doctor)
        );
        const paymentCell = createElement("td", "", visit.paymentType === "BPJS" ? "BPJS" : "Umum");
        const statusCell = createElement("td");
        const currentStatus = visit.status;
        const displayStatus = visitStatuses.includes(currentStatus) ? currentStatus : "Status tidak diketahui";
        statusCell.append(createElement("span", `visit-status-badge ${statusClasses[currentStatus] || "status-invalid"}`, displayStatus));
        const actionCell = createElement("td");
        const actions = createElement("div", "visit-row-actions");
        const statusSelect = createElement("select", "row-status-select");
        statusSelect.setAttribute("aria-label", `Status kunjungan ${visit.registrationNumber}`);
        visitStatuses.forEach((status) => statusSelect.add(new Option(status, status)));
        statusSelect.value = visitStatuses.includes(currentStatus) ? currentStatus : "";
        const saveButton = createElement("button", "button button-small button-secondary", "Simpan");
        saveButton.type = "button";
        saveButton.addEventListener("click", () => {
          try {
            const result = updateVisitStatus(visit.registrationNumber, statusSelect.value);
            showVisitNotification(notification, result.changed
              ? `Status ${result.visit.registrationNumber} diperbarui menjadi ${result.visit.status}.`
              : `Status kunjungan tetap ${result.visit.status}.`);
            render();
          } catch (error) {
            showVisitNotification(notification, `Status gagal diperbarui: ${error.message}`, true);
          }
        });
        const statusEditor = createElement("div", "row-status-editor");
        statusEditor.append(statusSelect, saveButton);
        actions.append(statusEditor);
        if (currentStatus === "Menunggu") {
          const callButton = createElement("button", "button button-small button-call", "Panggil");
          callButton.type = "button";
          callButton.addEventListener("click", () => {
            try {
              const result = updateVisitStatus(visit.registrationNumber, "Dipanggil");
              showVisitNotification(notification, `${result.visit.queueNumber} dipanggil.`);
              render();
            } catch (error) {
              showVisitNotification(notification, `Antrean gagal dipanggil: ${error.message}`, true);
            }
          });
          actions.append(callButton);
        }
        const detailLink = createElement("a", "visit-detail-link", "Detail");
        detailLink.href = `detail-kunjungan.html?registrasi=${encodeURIComponent(visit.registrationNumber)}`;
        actions.append(detailLink);
        actionCell.append(actions);
        [registrationCell, queueCell, patientCell, createElement("td", "", formatDate(visit.visitDate)), poliCell, paymentCell, statusCell, actionCell]
          .forEach((cell) => row.append(cell));
        tableBody.append(row);
      });
      document.querySelector("#visitCount").textContent = `${filtered.length} dari ${initialData.visits.length} kunjungan`;
      document.querySelector("#waitingCount").textContent = String(filtered.filter((visit) => visit.status === "Menunggu").length);
      document.querySelector("#examiningCount").textContent = String(filtered.filter((visit) => visit.status === "Sedang Diperiksa").length);
      document.querySelector("#completedCount").textContent = String(filtered.filter((visit) => visit.status === "Selesai").length);
      renderQueueBoard(initialData.visits);
      if (initialData.visits.length > 0) {
        emptyState.hidden = filtered.length > 0;
        if (filtered.length === 0) {
          emptyState.replaceChildren(
            createElement("span", "", "⌕"),
            createElement("strong", "", "Kunjungan tidak ditemukan"),
            createElement("p", "", "Ubah pencarian atau filter untuk melihat kunjungan lain.")
          );
        }
      } else if (tableBody.children.length === 0) {
        emptyState.hidden = false;
      }
    };

    visitStatuses.forEach((status) => filterStatus.add(new Option(status, status)));
    populatePoliFilter(initialData.visits);
    populateDoctorFilter(initialData.visits);
    search.addEventListener("input", render);
    filterVisitDate.addEventListener("change", render);
    filterPoli.addEventListener("change", render);
    filterDoctor.addEventListener("change", render);
    filterStatus.addEventListener("change", render);
    document.querySelector("#resetVisitFilters").addEventListener("click", () => {
      search.value = "";
      filterVisitDate.value = "";
      filterPoli.value = "";
      filterDoctor.value = "";
      filterStatus.value = "";
      render();
    });
    window.addEventListener("storage", (event) => {
      if (event.key === registrationStorageKey) {
        render();
      }
    });
    render();
  };

  const initializeVisitDetail = () => {
    const detailContent = document.querySelector("#visitDetailContent");
    if (!detailContent) {
      return;
    }

    const errorPanel = document.querySelector("#visitDetailError");
    const notification = document.querySelector("#visitStatusToast");
    const registrationNumber = new URLSearchParams(window.location.search).get("registrasi");
    const showError = (text) => {
      detailContent.hidden = true;
      errorPanel.replaceChildren(
        createElement("strong", "", "Detail kunjungan tidak tersedia"),
        createElement("p", "", text),
        createElement("a", "button button-primary", "Kembali ke daftar kunjungan")
      );
      errorPanel.querySelector("a").href = "rawat-jalan.html";
      errorPanel.hidden = false;
    };

    const appendDefinition = (list, label, value) => {
      const item = createElement("div", "definition-item");
      item.append(createElement("dt", "", label), createElement("dd", "", value || "-"));
      list.append(item);
    };

    const render = () => {
      if (!registrationNumber) {
        showError("Nomor registrasi tidak disertakan pada tautan.");
        return;
      }

      let data;
      try {
        data = readRegistrationData();
      } catch (error) {
        showError(`Data tidak dapat dibaca: ${error.message}`);
        return;
      }

      const visit = data.visits.find((record) => record.registrationNumber === registrationNumber);
      if (!visit) {
        showError("Kunjungan ini tidak ditemukan di penyimpanan.");
        return;
      }
      const patient = findVisitPatient(data, visit);
      if (!patient) {
        showError(`Data pasien dengan No. RM ${visit.medicalRecordNumber} tidak ditemukan. Kunjungan tetap tersimpan; periksa data pasien di halaman Data Pasien.`);
        return;
      }

      errorPanel.hidden = true;
      detailContent.hidden = false;
      document.querySelector("#detailPatientName").textContent = patient.fullName;
      document.querySelector("#detailMedicalRecord").textContent = `No. rekam medis ${patient.medicalRecordNumber}`;
      document.querySelector("#detailQueueNumber").textContent = visit.queueNumber;
      const statusBadge = document.querySelector("#detailVisitStatus");
      const currentStatus = visit.status;
      const displayStatus = visitStatuses.includes(currentStatus) ? currentStatus : "Status tidak diketahui";
      statusBadge.className = `visit-status-badge ${{
        "Menunggu": "status-waiting",
        "Dipanggil": "status-called",
        "Sedang Diperiksa": "status-examining",
        "Selesai": "status-completed",
        "Batal": "status-cancelled"
      }[currentStatus] || "status-invalid"}`;
      statusBadge.textContent = displayStatus;
      document.querySelector("#detailPatientFields").replaceChildren();
      [
        ["NIK", patient.nik],
        ["Nomor KK", patient.familyCard],
        ["Tempat lahir", patient.birthPlace],
        ["Tanggal lahir", formatDate(patient.birthDate)],
        ["Jenis kelamin", patient.gender],
        ["Nomor HP", patient.phone],
        ["Alamat", patient.address]
      ].forEach(([label, value]) => appendDefinition(document.querySelector("#detailPatientFields"), label, value));

      document.querySelector("#detailVisitFields").replaceChildren();
      [
        ["Nomor registrasi", visit.registrationNumber],
        ["Nomor antrean", visit.queueNumber],
        ["Tanggal kunjungan", formatDate(visit.visitDate)],
        ["Poliklinik", getVisitPoliName(visit)],
        ["Dokter", visit.doctor],
        ["Jenis pembayaran", visit.paymentType],
        ...(visit.paymentType === "BPJS" ? [["Nomor kartu BPJS", visit.bpjsNumber]] : []),
        ["Status pelayanan", displayStatus]
      ].forEach(([label, value]) => appendDefinition(document.querySelector("#detailVisitFields"), label, value));
      document.querySelector("#detailComplaint").textContent = visit.complaint || "-";

      const statusSelect = document.querySelector("#detailStatusSelect");
      statusSelect.replaceChildren(...visitStatuses.map((status) => new Option(status, status)));
      statusSelect.value = visitStatuses.includes(currentStatus) ? currentStatus : "";
      const callButton = document.querySelector("#detailCallButton");
      callButton.hidden = currentStatus !== "Menunggu";
      callButton.onclick = () => saveStatus("Dipanggil");
      document.querySelector("#detailSaveStatus").onclick = () => saveStatus(statusSelect.value);
    };

    const saveStatus = (nextStatus) => {
      try {
        const result = updateVisitStatus(registrationNumber, nextStatus);
        showVisitNotification(notification, result.changed
          ? `Status kunjungan diperbarui menjadi ${result.visit.status}.`
          : `Status kunjungan tetap ${result.visit.status}.`);
        render();
      } catch (error) {
        showVisitNotification(notification, `Status gagal diperbarui: ${error.message}`, true);
      }
    };

    window.addEventListener("storage", (event) => {
      if (event.key === registrationStorageKey) {
        render();
      }
    });
    render();
  };

  const initializeExamination = () => {
    const worklist = document.querySelector("#doctorWorklist");
    if (!worklist) {
      return;
    }

    const search = document.querySelector("#examinationSearch");
    const workspace = document.querySelector("#examWorkspace");
    const form = document.querySelector("#examinationForm");
    const fields = document.querySelector("#examFields");
    const rows = document.querySelector("#prescriptionRows");
    const prescriptionEmpty = document.querySelector("#prescriptionEmpty");
    const notification = document.querySelector("#examinationToast");
    const alert = document.querySelector("#examinationAlert");
    let selectedRegistration = null;
    let selectedReadOnly = false;
    let diagnosticRequests = [];

    const showFormMessage = (text, isError = false) => {
      const message = document.querySelector("#examFormMessage");
      message.textContent = text;
      message.classList.toggle("message-error", isError);
      message.hidden = !text;
    };

    const requestSection = createElement("section", "exam-form-section service-request-section");
    requestSection.append(
      createElement("h3", "", "Permintaan pemeriksaan penunjang"),
      createElement("p", "", "Permintaan yang disimpan akan diteruskan ke antrean Laboratorium atau Radiologi.")
    );
    const requestControls = createElement("div", "service-request-controls");
    [
      ["laboratory", "Laboratorium", ["Darah Lengkap", "Glukosa Darah", "Urinalisis", "Fungsi Ginjal", "Fungsi Hati"]],
      ["radiology", "Radiologi", ["Foto Toraks", "USG Abdomen", "USG Obstetri", "Foto Ekstremitas"]]
    ].forEach(([type, labelText, options]) => {
      const label = createElement("label", "service-request-field");
      label.append(createElement("span", "", labelText));
      const select = document.createElement("select");
      select.add(new Option(`Pilih ${labelText.toLowerCase()}`, ""));
      options.forEach((name) => select.add(new Option(name, name)));
      const addButton = createElement("button", "button button-secondary service-request-add", "Tambah");
      addButton.type = "button";
      addButton.addEventListener("click", () => {
        const name = select.value;
        if (!name) {
          select.focus();
          return;
        }
        if (diagnosticRequests.some((request) => request.type === type && request.name === name)) {
          showFormMessage(`${name} sudah ditambahkan ke permintaan.`, true);
          return;
        }
        diagnosticRequests.push({ type, name });
        select.value = "";
        renderDiagnosticRequests();
        showFormMessage("");
      });
      label.append(select, addButton);
      requestControls.append(label);
    });
    const requestList = createElement("div", "service-request-list");
    requestSection.append(requestControls, requestList);
    fields.append(requestSection);

    const renderDiagnosticRequests = () => {
      requestList.replaceChildren();
      if (!diagnosticRequests.length) {
        requestList.append(createElement("p", "service-request-empty", "Belum ada permintaan pemeriksaan penunjang."));
        return;
      }
      diagnosticRequests.forEach((request, index) => {
        const item = createElement("div", "service-request-item");
        item.append(
          createElement("span", request.type === "radiology" ? "service-request-tag is-radiology" : "service-request-tag", request.type === "radiology" ? "RAD" : "LAB"),
          createElement("strong", "", request.name)
        );
        const removeButton = createElement("button", "service-request-remove", "×");
        removeButton.type = "button";
        removeButton.setAttribute("aria-label", `Hapus permintaan ${request.name}`);
        removeButton.addEventListener("click", () => {
          diagnosticRequests.splice(index, 1);
          renderDiagnosticRequests();
        });
        item.append(removeButton);
        requestList.append(item);
      });
    };

    const showAlert = (text) => {
      alert.textContent = text;
      alert.hidden = !text;
    };

    const createTableCell = (row, value, className) => {
      const cell = createElement("td", className || "", value);
      row.append(cell);
      return cell;
    };

    const renderPatientBanner = (patient, visit) => {
      const banner = document.querySelector("#examPatientBanner");
      banner.replaceChildren();
      const identity = createElement("div", "exam-patient-identity");
      identity.append(
        createElement("span", "detail-patient-avatar", "♙"),
        createElement("div", "exam-patient-copy", "")
      );
      identity.lastElementChild.append(
        createElement("strong", "", patient.fullName),
        createElement("span", "", `No. RM ${patient.medicalRecordNumber} · ${formatDate(patient.birthDate)} · ${patient.gender}`)
      );
      const visitInfo = createElement("div", "exam-visit-info");
      visitInfo.append(
        createElement("span", "", getVisitPoliName(visit)),
        createElement("strong", "", `${visit.queueNumber} · ${visit.doctor}`),
        createElement("small", "", `Registrasi ${visit.registrationNumber}`)
      );
      banner.append(identity, visitInfo);
    };

    const addPrescriptionRow = (prescription = {}) => {
      const row = createElement("div", "prescription-row");
      const fieldsList = [
        ["medicineName", "Nama obat", "Contoh: Parasetamol"],
        ["dosage", "Dosis", "Contoh: 500 mg"],
        ["quantity", "Jumlah", "Contoh: 10 tablet"],
        ["instructions", "Aturan pakai", "Contoh: 3 x sehari"],
        ["notes", "Keterangan", "Contoh: sesudah makan"]
      ];
      fieldsList.forEach(([key, labelText, placeholder]) => {
        const label = createElement("label", "prescription-field");
        label.append(createElement("span", "", labelText));
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = key === "notes" ? 160 : 100;
        input.placeholder = placeholder;
        input.dataset.prescriptionField = key;
        input.value = prescription[key] || "";
        input.addEventListener("input", () => input.setCustomValidity(""));
        label.append(input);
        row.append(label);
      });
      const removeButton = createElement("button", "remove-prescription", "×");
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", "Hapus obat dari resep");
      removeButton.addEventListener("click", () => {
        row.remove();
        prescriptionEmpty.hidden = rows.children.length > 0;
      });
      row.append(removeButton);
      rows.append(row);
      prescriptionEmpty.hidden = true;
    };

    const setFormValues = (visit, examination) => {
      const values = {
        mainComplaint: examination ? examination.mainComplaint : visit.complaint,
        currentHistory: examination ? examination.currentHistory : "",
        pastHistory: examination ? examination.pastHistory : "",
        bloodPressure: examination ? examination.bloodPressure : "",
        temperature: examination ? examination.temperature : "",
        pulse: examination ? examination.pulse : "",
        respiratory: examination ? examination.respiratory : "",
        weight: examination ? examination.weight : "",
        physicalExam: examination ? examination.physicalExam : "",
        primaryDiagnosis: examination ? examination.primaryDiagnosis : "",
        additionalDiagnosis: examination ? examination.additionalDiagnosis : "",
        medicalActions: examination ? examination.medicalActions : "",
        doctorNotes: examination ? examination.doctorNotes : "",
        treatmentPlan: examination ? examination.treatmentPlan : ""
      };
      Object.entries(values).forEach(([name, value]) => {
        form.elements.namedItem(name).value = value || "";
      });
      rows.replaceChildren();
      (examination && Array.isArray(examination.prescriptions) ? examination.prescriptions : [])
        .forEach((prescription) => addPrescriptionRow(prescription));
      prescriptionEmpty.hidden = rows.children.length > 0;
      diagnosticRequests = examination && Array.isArray(examination.diagnosticRequests)
        ? examination.diagnosticRequests.map((request) => ({ type: request.type, name: request.name }))
        : [];
      renderDiagnosticRequests();
    };

    const openWorkspace = (visit, patient, examination, readOnly) => {
      selectedRegistration = visit.registrationNumber;
      selectedReadOnly = readOnly;
      renderPatientBanner(patient, visit);
      setFormValues(visit, examination);
      fields.disabled = readOnly;
      document.querySelector("#examReadOnlyNotice").hidden = !readOnly;
      document.querySelector("#examFormActions").hidden = readOnly;
      document.querySelector("#closeExamWorkspace").hidden = false;
      showFormMessage(examination && !readOnly
        ? `Draf pemeriksaan terakhir disimpan ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(examination.updatedAt))}.`
        : "", false);
      workspace.hidden = false;
      workspace.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const loadData = () => {
      const data = readRegistrationData();
      return { data, examinations: readExaminations(data) };
    };

    const renderHistory = (data, examinations, query) => {
      const table = document.querySelector("#examHistoryTable");
      const empty = document.querySelector("#examHistoryEmpty");
      const normalizedQuery = query.toLocaleLowerCase("id");
      const filtered = examinations
        .filter((examination) => {
          const patient = data.patients.find((record) => record.medicalRecordNumber === examination.medicalRecordNumber);
          const patientName = patient ? patient.fullName.toLocaleLowerCase("id") : "";
          return !normalizedQuery || patientName.includes(normalizedQuery) ||
            examination.medicalRecordNumber.toLocaleLowerCase("id").includes(normalizedQuery);
        })
        .sort((first, second) => String(second.updatedAt).localeCompare(String(first.updatedAt)));
      table.replaceChildren();
      filtered.forEach((examination) => {
        const visit = data.visits.find((record) => record.registrationNumber === examination.registrationNumber);
        const patient = data.patients.find((record) => record.medicalRecordNumber === examination.medicalRecordNumber);
        const row = document.createElement("tr");
        createTableCell(row, formatDate(examination.visitDate), "record-number");
        const patientCell = createTableCell(row, "");
        patientCell.append(
          createElement("strong", "table-primary-text", patient ? patient.fullName : "Data pasien tidak ditemukan"),
          createElement("small", "table-secondary-text", `No. RM ${examination.medicalRecordNumber}`)
        );
        createTableCell(row, visit ? getVisitPoliName(visit) : (examination.poliName || "-"));
        createTableCell(row, examination.primaryDiagnosis || "-");
        createTableCell(row, visit ? visit.doctor : (examination.doctor || "-"));
        const actionCell = createTableCell(row, "");
        const viewButton = createElement("button", "button button-small button-secondary", "Lihat");
        viewButton.type = "button";
        viewButton.disabled = !visit || !patient;
        viewButton.addEventListener("click", () => {
          try {
            const latest = loadData();
            const currentVisit = latest.data.visits.find((record) => record.registrationNumber === examination.registrationNumber);
            const currentPatient = currentVisit ? findVisitPatient(latest.data, currentVisit) : null;
            const savedExamination = latest.examinations.find((record) => record.registrationNumber === examination.registrationNumber);
            if (!currentVisit || !currentPatient || !savedExamination) {
              throw new Error("Data kunjungan atau pasien sudah tidak tersedia.");
            }
            openWorkspace(currentVisit, currentPatient, savedExamination, true);
            showVisitNotification(notification, "Riwayat pemeriksaan dibuka dalam mode baca.");
          } catch (error) {
            showVisitNotification(notification, `Riwayat gagal dibuka: ${error.message}`, true);
          }
        });
        actionCell.append(viewButton);
        table.append(row);
      });
      document.querySelector("#examHistoryCount").textContent = `${filtered.length} catatan`;
      empty.hidden = filtered.length > 0;
      if (filtered.length === 0 && examinations.length > 0) {
        empty.replaceChildren(
          createElement("span", "", "⌕"),
          createElement("strong", "", "Riwayat tidak ditemukan"),
          createElement("p", "", "Coba nama pasien atau nomor rekam medis yang lain.")
        );
      } else if (examinations.length === 0) {
        empty.replaceChildren(
          createElement("span", "", "▤"),
          createElement("strong", "", "Belum ada riwayat pemeriksaan"),
          createElement("p", "", "Catatan akan muncul setelah dokter menyimpan pemeriksaan pasien.")
        );
      }
    };

    const render = () => {
      showAlert("");
      let data;
      let examinations;
      try {
        ({ data, examinations } = loadData());
      } catch (error) {
        showAlert(`Data pemeriksaan tidak dapat dimuat: ${error.message}`);
        showDataLoadError(document.querySelector("#worklistEmpty"), error);
        return;
      }

      const query = search.value.trim().toLocaleLowerCase("id");
      const activeVisits = data.visits.filter((visit) =>
        visit.status === "Dipanggil" || visit.status === "Sedang Diperiksa"
      );
      const filteredVisits = activeVisits.filter((visit) => {
        const patient = findVisitPatient(data, visit);
        const patientName = patient ? patient.fullName.toLocaleLowerCase("id") : "";
        return !query || patientName.includes(query) ||
          visit.medicalRecordNumber.toLocaleLowerCase("id").includes(query);
      }).sort((first, second) =>
        first.visitDate.localeCompare(second.visitDate) ||
        first.queueNumber.localeCompare(second.queueNumber, "en", { numeric: true })
      );

      worklist.replaceChildren();
      filteredVisits.forEach((visit) => {
        const patient = findVisitPatient(data, visit);
        const row = document.createElement("tr");
        createTableCell(row, visit.queueNumber, "record-number");
        const patientCell = createTableCell(row, "");
        patientCell.append(
          createElement("strong", patient ? "table-primary-text" : "table-primary-text missing-patient", patient ? patient.fullName : "Data pasien tidak ditemukan"),
          createElement("small", "table-secondary-text", `No. RM ${visit.medicalRecordNumber}`)
        );
        createTableCell(row, patient ? formatDate(patient.birthDate) : "-");
        createTableCell(row, patient ? patient.gender : "-");
        const clinicCell = createTableCell(row, "");
        clinicCell.append(
          createElement("strong", "table-primary-text", getVisitPoliName(visit)),
          createElement("small", "table-secondary-text", visit.doctor || "-")
        );
        const statusCell = createTableCell(row, "");
        statusCell.append(createElement("span", `visit-status-badge ${visit.status === "Dipanggil" ? "status-called" : "status-examining"}`, visit.status));
        const actionCell = createTableCell(row, "");
        const openButton = createElement("button", "button button-small button-primary", visit.status === "Dipanggil" ? "Mulai pemeriksaan" : "Lanjutkan");
        openButton.type = "button";
        openButton.disabled = !patient;
        openButton.addEventListener("click", () => {
          try {
            const latest = loadData();
            const currentVisit = latest.data.visits.find((record) => record.registrationNumber === visit.registrationNumber);
            if (!currentVisit) {
              throw new Error("Kunjungan tidak ditemukan. Muat ulang halaman.");
            }
            const currentPatient = findVisitPatient(latest.data, currentVisit);
            if (!currentPatient) {
              throw new Error("Data pasien terdaftar tidak ditemukan.");
            }
            if (currentVisit.status === "Dipanggil") {
              setVisitStatus(currentVisit, "Sedang Diperiksa");
              saveRegistrationData(latest.data);
              showVisitNotification(notification, `${currentVisit.queueNumber} mulai diperiksa.`);
            } else if (currentVisit.status !== "Sedang Diperiksa") {
              throw new Error("Kunjungan ini tidak lagi berada dalam antrean pemeriksaan.");
            }
            const savedExamination = latest.examinations.find((record) => record.registrationNumber === currentVisit.registrationNumber);
            openWorkspace(currentVisit, currentPatient, savedExamination, false);
            render();
          } catch (error) {
            showVisitNotification(notification, `Pemeriksaan tidak dapat dibuka: ${error.message}`, true);
          }
        });
        actionCell.append(openButton);
        worklist.append(row);
      });

      document.querySelector("#doctorWorklistCount").textContent = `${filteredVisits.length} pasien dalam antrean pemeriksaan`;
      document.querySelector("#examCalledCount").textContent = String(activeVisits.filter((visit) => visit.status === "Dipanggil").length);
      document.querySelector("#examInProgressCount").textContent = String(activeVisits.filter((visit) => visit.status === "Sedang Diperiksa").length);
      document.querySelector("#examSavedCount").textContent = String(examinations.length);
      const worklistEmpty = document.querySelector("#worklistEmpty");
      worklistEmpty.hidden = filteredVisits.length > 0;
      if (filteredVisits.length === 0 && activeVisits.length > 0) {
        worklistEmpty.replaceChildren(
          createElement("span", "", "⌕"),
          createElement("strong", "", "Pasien tidak ditemukan"),
          createElement("p", "", "Coba kata kunci nama atau nomor rekam medis yang lain.")
        );
      } else if (activeVisits.length === 0) {
        worklistEmpty.replaceChildren(
          createElement("span", "", "♡"),
          createElement("strong", "", "Tidak ada pasien dalam antrean pemeriksaan"),
          createElement("p", "", "Pasien akan muncul setelah status antrean menjadi Dipanggil atau Sedang Diperiksa di modul Rawat Jalan."),
          createElement("a", "button button-secondary", "Buka Rawat Jalan")
        );
        worklistEmpty.querySelector("a").href = "rawat-jalan.html";
      }
      renderHistory(data, examinations, search.value.trim());
    };

    const collectPrescriptions = () => {
      const prescriptions = [];
      for (const row of rows.querySelectorAll(".prescription-row")) {
        const inputs = [...row.querySelectorAll("[data-prescription-field]")];
        const values = inputs.map((input) => input.value.trim());
        if (values.every((value) => !value)) {
          continue;
        }
        const missingInput = inputs.find((input) => !input.value.trim());
        if (missingInput) {
          missingInput.setCustomValidity("Lengkapi semua kolom obat atau hapus baris resep ini.");
          missingInput.reportValidity();
          missingInput.focus();
          throw new Error("Lengkapi semua kolom pada obat yang ditambahkan.");
        }
        prescriptions.push(Object.fromEntries(inputs.map((input) => [input.dataset.prescriptionField, input.value.trim()])));
      }
      return prescriptions;
    };

    const saveExamination = (complete) => {
      if (!selectedRegistration || selectedReadOnly) {
        showFormMessage("Pilih pasien aktif dari antrean untuk menyimpan pemeriksaan.", true);
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      try {
        const data = readRegistrationData();
        const examinations = readExaminations(data);
        const visit = data.visits.find((record) => record.registrationNumber === selectedRegistration);
        if (!visit || visit.status !== "Sedang Diperiksa") {
          throw new Error("Kunjungan harus berstatus Sedang Diperiksa sebelum catatan disimpan.");
        }
        const patient = findVisitPatient(data, visit);
        if (!patient) {
          throw new Error("Data pasien terdaftar tidak ditemukan.");
        }

        const prescriptions = collectPrescriptions();
        const existingIndex = examinations.findIndex((record) => record.registrationNumber === selectedRegistration);
        const existing = existingIndex >= 0 ? examinations[existingIndex] : null;
        const values = new FormData(form);
        const now = new Date();
        const timestamp = now.toISOString();
        const examination = {
          registrationNumber: visit.registrationNumber,
          medicalRecordNumber: patient.medicalRecordNumber,
          visitDate: visit.visitDate,
          poliName: getVisitPoliName(visit),
          doctor: visit.doctor,
          mainComplaint: String(values.get("mainComplaint")).trim(),
          currentHistory: String(values.get("currentHistory")).trim(),
          pastHistory: String(values.get("pastHistory")).trim(),
          bloodPressure: String(values.get("bloodPressure")).trim(),
          temperature: String(values.get("temperature")).trim(),
          pulse: String(values.get("pulse")).trim(),
          respiratory: String(values.get("respiratory")).trim(),
          weight: String(values.get("weight")).trim(),
          physicalExam: String(values.get("physicalExam")).trim(),
          primaryDiagnosis: String(values.get("primaryDiagnosis")).trim(),
          additionalDiagnosis: String(values.get("additionalDiagnosis")).trim(),
          medicalActions: String(values.get("medicalActions")).trim(),
          doctorNotes: String(values.get("doctorNotes")).trim(),
          treatmentPlan: String(values.get("treatmentPlan")).trim(),
          prescriptions,
          diagnosticRequests: diagnosticRequests.map((request) => ({ ...request })),
          createdAt: existing ? existing.createdAt : timestamp,
          updatedAt: timestamp,
          completedAt: complete ? timestamp : (existing ? existing.completedAt || "" : "")
        };

        if (complete) {
          setVisitStatus(visit, "Selesai", timestamp);
        }
        if (existingIndex >= 0) {
          examinations[existingIndex] = examination;
        } else {
          examinations.push(examination);
        }
        data.examinations = examinations;
        syncExaminationOrders(data, examination, patient);
        saveRegistrationData(data);
        if (complete) {
          showVisitNotification(notification, `Pemeriksaan ${visit.registrationNumber} selesai dan tersimpan.`);
          workspace.hidden = true;
          selectedRegistration = null;
          selectedReadOnly = false;
        } else {
          showFormMessage(`Pemeriksaan tersimpan pada ${new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(now)}.`);
          showVisitNotification(notification, "Pemeriksaan berhasil disimpan.");
        }
        render();
      } catch (error) {
        showFormMessage(`Pemeriksaan gagal disimpan: ${error.message}`, true);
      }
    };

    document.querySelector("#addPrescription").addEventListener("click", () => addPrescriptionRow());
    document.querySelector("#closeExamWorkspace").addEventListener("click", () => {
      workspace.hidden = true;
      selectedRegistration = null;
      selectedReadOnly = false;
      fields.disabled = false;
      form.reset();
      rows.replaceChildren();
      prescriptionEmpty.hidden = false;
      diagnosticRequests = [];
      renderDiagnosticRequests();
      showFormMessage("");
    });
    document.querySelector("#saveExamButton").addEventListener("click", (event) => {
      event.preventDefault();
      saveExamination(false);
    });
    document.querySelector("#completeExamButton").addEventListener("click", () => {
      saveExamination(true);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      saveExamination(false);
    });
    search.addEventListener("input", render);
    window.addEventListener("storage", (event) => {
      if (event.key === registrationStorageKey) {
        render();
      }
    });
    render();
  };

  const initializeMedicalRecords = () => {
    const table = document.querySelector("#medicalRecordsTable");
    if (!table) {
      return;
    }

    const search = document.querySelector("#medicalRecordSearch");
    const detail = document.querySelector("#medicalRecordDetail");
    const alert = document.querySelector("#medicalRecordAlert");
    let selectedMedicalRecord = "";

    const displayValue = (value, fallback = "—") => {
      if (Array.isArray(value)) {
        const values = value.map((item) => String(item || "").trim()).filter(Boolean);
        return values.length ? values.join(", ") : fallback;
      }
      const normalized = String(value || "").trim();
      return normalized || fallback;
    };

    const getCode = (examination, kind) => {
      const values = kind === "icd10"
        ? [examination.icd10Code, examination.icd10Codes, examination.primaryIcd10Code]
        : [examination.icd9CmCode, examination.icd9CmCodes, examination.icd9Code];
      const code = values.map((value) => displayValue(value, "")).find(Boolean);
      return code || "Belum dikodekan";
    };

    const loadData = () => {
      const data = readRegistrationData();
      return { data, examinations: readExaminations(data) };
    };

    const getPatientVisits = (data, patient) =>
      data.visits.filter((visit) => visit.medicalRecordNumber === patient.medicalRecordNumber)
        .sort((first, second) => String(second.visitDate || "").localeCompare(String(first.visitDate || "")));

    const getPatientExaminations = (examinations, patient) =>
      examinations.filter((examination) => examination.medicalRecordNumber === patient.medicalRecordNumber)
        .sort((first, second) =>
          String(second.visitDate || "").localeCompare(String(first.visitDate || "")) ||
          String(second.updatedAt || "").localeCompare(String(first.updatedAt || ""))
        );

    const getCompleteness = (patient, visits, examinations) => {
      const identityComplete = ["nik", "fullName", "birthDate", "gender", "address", "phone"]
        .every((field) => Boolean(String(patient[field] || "").trim()));
      const visitsComplete = visits.length > 0;
      const examByRegistration = new Map(examinations.map((examination) => [examination.registrationNumber, examination]));
      const completedVisitsDocumented = visits
        .filter((visit) => visit.status === "Selesai")
        .every((visit) => examByRegistration.has(visit.registrationNumber));
      const examinationNotesComplete = examinations.length > 0 &&
        examinations.every((examination) => Boolean(examination.mainComplaint && examination.primaryDiagnosis));
      const icd10Complete = examinations.length > 0 &&
        examinations.every((examination) => Boolean(examination.primaryDiagnosis) && getCode(examination, "icd10") !== "Belum dikodekan");
      const actionExaminations = examinations.filter((examination) => Boolean(examination.medicalActions));
      const icd9Complete = actionExaminations.every((examination) => getCode(examination, "icd9") !== "Belum dikodekan");
      const resumeAvailable = examinations.length > 0;
      const complete = identityComplete && visitsComplete && completedVisitsDocumented &&
        examinationNotesComplete && icd10Complete && icd9Complete;

      return {
        complete,
        checks: [
          { title: "Identitas pasien", description: "NIK, nama, tanggal lahir, jenis kelamin, alamat, dan nomor HP", complete: identityComplete },
          { title: "Riwayat kunjungan", description: visitsComplete ? `${visits.length} kunjungan terhubung` : "Belum ada kunjungan", complete: visitsComplete },
          { title: "Catatan pemeriksaan", description: examinationNotesComplete ? `${examinations.length} catatan tersimpan` : "Keluhan dan diagnosis utama perlu dilengkapi", complete: examinationNotesComplete && completedVisitsDocumented },
          { title: "Coding ICD-10", description: icd10Complete ? "Diagnosis memiliki kode ICD-10" : "Kode ICD-10 belum tersedia pada seluruh diagnosis", complete: icd10Complete },
          { title: "Coding ICD-9-CM", description: actionExaminations.length === 0 ? "Tidak ada tindakan yang dicatat" : icd9Complete ? "Tindakan memiliki kode ICD-9-CM" : "Kode ICD-9-CM belum tersedia pada seluruh tindakan", complete: icd9Complete },
          { title: "Resume medis", description: resumeAvailable ? "Resume dapat dicetak dari catatan pemeriksaan" : "Belum ada catatan untuk menyusun resume", complete: resumeAvailable }
        ]
      };
    };

    const createCell = (row, value, className = "") => {
      const cell = createElement("td", className, value);
      row.append(cell);
      return cell;
    };

    const createDefinition = (label, value, wide = false) => {
      const item = createElement("div", `record-definition${wide ? " record-definition-wide" : ""}`);
      item.append(createElement("dt", "", label), createElement("dd", "", displayValue(value)));
      return item;
    };

    const createExamField = (label, value, wide = false) => {
      const item = createElement("div", `record-exam-field${wide ? " record-exam-field-wide" : ""}`);
      item.append(createElement("small", "", label), createElement("p", "", displayValue(value)));
      return item;
    };

    const renderIdentity = (patient) => {
      const identity = document.querySelector("#recordPatientIdentity");
      identity.replaceChildren(
        createDefinition("Nomor rekam medis", patient.medicalRecordNumber),
        createDefinition("NIK", patient.nik),
        createDefinition("Nomor KK", patient.familyCard),
        createDefinition("Nama lengkap", patient.fullName),
        createDefinition("Tempat lahir", patient.birthPlace),
        createDefinition("Tanggal lahir", formatDate(patient.birthDate)),
        createDefinition("Jenis kelamin", patient.gender),
        createDefinition("Nomor HP", patient.phone),
        createDefinition("Alamat", patient.address, true)
      );
    };

    const renderVisits = (visits) => {
      const tbody = document.querySelector("#recordVisitHistory");
      const empty = document.querySelector("#recordVisitEmpty");
      tbody.replaceChildren();
      visits.forEach((visit) => {
        const row = document.createElement("tr");
        createCell(row, formatDate(visit.visitDate), "record-number");
        createCell(row, visit.registrationNumber);
        const clinic = createCell(row, "");
        clinic.append(
          createElement("strong", "table-primary-text", getVisitPoliName(visit)),
          createElement("small", "table-secondary-text", displayValue(visit.doctor))
        );
        createCell(row, displayValue(visit.paymentType));
        createCell(row, displayValue(visit.complaint));
        const statusCell = createCell(row, "");
        const statusClass = {
          Menunggu: "status-waiting",
          Dipanggil: "status-called",
          "Sedang Diperiksa": "status-examining",
          Selesai: "status-completed",
          Batal: "status-cancelled"
        }[visit.status] || "status-invalid";
        statusCell.append(createElement("span", `visit-status-badge ${statusClass}`, displayValue(visit.status, "Status tidak diketahui")));
        tbody.append(row);
      });
      document.querySelector("#recordVisitHistoryCount").textContent = `${visits.length} kunjungan`;
      empty.hidden = visits.length > 0;
    };

    const renderExaminations = (examinations, visits) => {
      const list = document.querySelector("#recordExamHistory");
      const empty = document.querySelector("#recordExamEmpty");
      list.replaceChildren();
      examinations.forEach((examination) => {
        const visit = visits.find((record) => record.registrationNumber === examination.registrationNumber);
        const card = createElement("article", "record-exam-card");
        const heading = createElement("div", "record-exam-card-heading");
        const headingCopy = createElement("div", "");
        headingCopy.append(
          createElement("strong", "", `Pemeriksaan ${formatDate(examination.visitDate)}`),
          createElement("small", "", `${displayValue(examination.registrationNumber, "Registrasi tidak tersedia")} · ${getVisitPoliName(visit || examination)} · ${displayValue(examination.doctor || (visit && visit.doctor))}`)
        );
        heading.append(headingCopy, createElement("span", "record-exam-date", examination.completedAt ? "Selesai" : "Tersimpan"));
        const fields = createElement("div", "record-exam-fields");
        fields.append(
          createExamField("Keluhan utama", examination.mainComplaint, true),
          createExamField("Riwayat penyakit sekarang", examination.currentHistory),
          createExamField("Riwayat penyakit dahulu", examination.pastHistory),
          createExamField("Tanda-tanda vital", [
            examination.bloodPressure && `Tekanan darah ${examination.bloodPressure} mmHg`,
            examination.temperature && `Suhu ${examination.temperature} °C`,
            examination.pulse && `Nadi ${examination.pulse} x/menit`,
            examination.respiratory && `Respirasi ${examination.respiratory} x/menit`,
            examination.weight && `Berat badan ${examination.weight} kg`
          ].filter(Boolean).join(" · ")),
          createExamField("Pemeriksaan fisik", examination.physicalExam, true),
          createExamField("Diagnosis utama", examination.primaryDiagnosis),
          createExamField("Diagnosis tambahan", examination.additionalDiagnosis),
          createExamField("Tindakan medis", examination.medicalActions),
          createExamField("Rencana pengobatan", examination.treatmentPlan),
          createExamField("Catatan dokter", examination.doctorNotes, true)
        );
        card.append(heading, fields);
        list.append(card);
      });
      document.querySelector("#recordExamHistoryCount").textContent = `${examinations.length} pemeriksaan`;
      empty.hidden = examinations.length > 0;
    };

    const renderDiagnosesAndActions = (examinations) => {
      const tbody = document.querySelector("#recordDiagnosisHistory");
      const empty = document.querySelector("#recordDiagnosisEmpty");
      tbody.replaceChildren();
      examinations.forEach((examination) => {
        const row = document.createElement("tr");
        createCell(row, formatDate(examination.visitDate), "record-number");
        const diagnosis = createCell(row, "");
        diagnosis.append(
          createElement("strong", "table-primary-text", displayValue(examination.primaryDiagnosis, "Diagnosis utama belum dicatat")),
          createElement("small", "table-secondary-text", examination.additionalDiagnosis ? `Tambahan: ${examination.additionalDiagnosis}` : "Tidak ada diagnosis tambahan")
        );
        createCell(row, getCode(examination, "icd10"), "record-code-cell");
        createCell(row, displayValue(examination.medicalActions, "Tidak ada tindakan dicatat"));
        createCell(row, examination.medicalActions ? getCode(examination, "icd9") : "—", "record-code-cell");
        tbody.append(row);
      });
      empty.hidden = examinations.length > 0;
    };

    const renderPrescriptions = (examinations) => {
      const tbody = document.querySelector("#recordPrescriptionHistory");
      const empty = document.querySelector("#recordPrescriptionEmpty");
      tbody.replaceChildren();
      examinations.forEach((examination) => {
        const prescriptions = Array.isArray(examination.prescriptions) ? examination.prescriptions : [];
        prescriptions.forEach((prescription) => {
          const row = document.createElement("tr");
          createCell(row, formatDate(examination.visitDate), "record-number");
          createCell(row, displayValue(prescription.medicineName));
          createCell(row, displayValue(prescription.dosage));
          createCell(row, displayValue(prescription.quantity));
          createCell(row, displayValue(prescription.instructions));
          createCell(row, displayValue(prescription.notes));
          tbody.append(row);
        });
      });
      empty.hidden = tbody.children.length > 0;
    };

    const renderCompleteness = (patient, visits, examinations) => {
      const completeness = getCompleteness(patient, visits, examinations);
      const status = document.querySelector("#recordOverallStatus");
      status.textContent = completeness.complete ? "Lengkap" : "Perlu dilengkapi";
      status.className = `record-completeness-badge ${completeness.complete ? "is-complete" : "is-incomplete"}`;
      const checklist = document.querySelector("#recordCompleteness");
      checklist.replaceChildren();
      completeness.checks.forEach((check) => {
        const item = createElement("div", `record-check-item ${check.complete ? "is-complete" : "is-incomplete"}`);
        item.append(
          createElement("span", "record-check-icon", check.complete ? "✓" : "!"),
          createElement("div", "", "")
        );
        item.lastElementChild.append(
          createElement("strong", "", check.title),
          createElement("small", "", check.description)
        );
        checklist.append(item);
      });
      return completeness;
    };

    const renderResume = (patient, visits, examinations) => {
      const content = document.querySelector("#recordResumeContent");
      content.replaceChildren();
      const latestExamination = examinations[0];
      if (!latestExamination) {
        content.append(createElement("div", "record-inline-empty", "Resume belum tersedia karena belum ada catatan pemeriksaan dokter."));
        return;
      }
      const visit = visits.find((record) => record.registrationNumber === latestExamination.registrationNumber);
      const header = createElement("div", "resume-patient-heading");
      header.append(
        createElement("strong", "", displayValue(patient.fullName)),
        createElement("span", "", `No. RM ${patient.medicalRecordNumber} · Resume berdasarkan pemeriksaan ${formatDate(latestExamination.visitDate)}`)
      );
      const fields = createElement("div", "resume-summary-grid");
      [
        ["Tanggal kunjungan", formatDate(latestExamination.visitDate)],
        ["Poliklinik", getVisitPoliName(visit || latestExamination)],
        ["Dokter", latestExamination.doctor || (visit && visit.doctor)],
        ["Status kunjungan", visit && visit.status],
        ["Keluhan utama", latestExamination.mainComplaint],
        ["Diagnosis utama", latestExamination.primaryDiagnosis],
        ["Kode ICD-10", getCode(latestExamination, "icd10")],
        ["Tindakan medis", latestExamination.medicalActions],
        ["Kode ICD-9-CM", latestExamination.medicalActions ? getCode(latestExamination, "icd9") : "—"],
        ["Rencana pengobatan", latestExamination.treatmentPlan],
        ["Catatan dokter", latestExamination.doctorNotes]
      ].forEach(([label, value]) => {
        const item = createElement("div", "resume-summary-item");
        item.append(createElement("small", "", label), createElement("strong", "", displayValue(value)));
        fields.append(item);
      });
      const medications = Array.isArray(latestExamination.prescriptions)
        ? latestExamination.prescriptions.map((prescription) =>
          `${displayValue(prescription.medicineName)} — ${displayValue(prescription.dosage)}, ${displayValue(prescription.quantity)}, ${displayValue(prescription.instructions)}`
        )
        : [];
      const medicationItem = createElement("div", "resume-summary-item resume-summary-wide");
      medicationItem.append(
        createElement("small", "", "Resep / obat"),
        createElement("strong", "", medications.length ? medications.join("; ") : "Tidak ada resep obat pada pemeriksaan ini.")
      );
      fields.append(medicationItem);
      content.append(header, fields);
    };

    const renderOperationalHistory = (data, patient) => {
      const previous = detail.querySelector("#recordOperationalHistory");
      if (previous) {
        previous.remove();
      }
      const section = createElement("section", "record-detail-section record-operational-history");
      section.id = "recordOperationalHistory";
      section.append(
        createElement("h3", "", "Pelayanan terintegrasi"),
        createElement("p", "record-section-note", "Hasil penunjang, status resep, dan riwayat rawat inap yang tertaut ke pasien ini.")
      );
      const groups = [
        ["Resep farmasi", Array.isArray(data.pharmacyOrders) ? data.pharmacyOrders.filter((order) => order.medicalRecordNumber === patient.medicalRecordNumber) : [], (order) => {
          const names = Array.isArray(order.items) ? order.items.map((item) => item.medicineName).filter(Boolean).join(", ") : "";
          return `${order.status || "Menunggu"}${names ? ` · ${names}` : ""}`;
        }],
        ["Laboratorium", Array.isArray(data.labOrders) ? data.labOrders.filter((order) => order.medicalRecordNumber === patient.medicalRecordNumber) : [], (order) => {
          const results = Array.isArray(order.results)
            ? order.results.map((item) => [item.testName || item.name, item.result].filter(Boolean).join(": ")).filter(Boolean).join("; ")
            : "";
          return [order.status || "Menunggu", order.result || results].filter(Boolean).join(" · ");
        }],
        ["Radiologi", Array.isArray(data.radiologyOrders) ? data.radiologyOrders.filter((order) => order.medicalRecordNumber === patient.medicalRecordNumber) : [], (order) =>
          [order.status || "Menunggu", order.conclusion || order.result].filter(Boolean).join(" · ")
        ],
        ["Rawat inap", Array.isArray(data.admissions) ? data.admissions.filter((admission) => admission.medicalRecordNumber === patient.medicalRecordNumber) : [], (admission) =>
          [admission.status || "Dirawat", admission.className || admission.class, admission.dischargeDate ? `Keluar ${formatDate(admission.dischargeDate)}` : ""].filter(Boolean).join(" · ")
        ]
      ];
      const list = createElement("div", "record-operational-list");
      let total = 0;
      groups.forEach(([label, records, describe]) => {
        records.slice().sort((first, second) =>
          String(second.visitDate || second.admissionDate || second.createdAt || "").localeCompare(String(first.visitDate || first.admissionDate || first.createdAt || ""))
        ).forEach((record) => {
          total += 1;
          const card = createElement("article", "record-operational-item");
          const heading = createElement("div", "record-operational-heading");
          heading.append(
            createElement("strong", "", label),
            createElement("span", "", formatDate(record.visitDate || record.admissionDate || record.requestedAt || record.createdAt))
          );
          card.append(
            heading,
            createElement("span", "", record.testName || record.examType || record.id || record.orderNumber || record.registrationNumber || "Pelayanan"),
            createElement("p", "", describe(record) || "Belum ada hasil atau catatan.")
          );
          list.append(card);
        });
      });
      if (!total) {
        list.append(createElement("p", "record-operational-empty", "Belum ada resep farmasi, pemeriksaan penunjang, atau rawat inap."));
      }
      section.append(list);
      detail.append(section);
    };

    const renderDetail = (data, examinations, patient) => {
      const visits = getPatientVisits(data, patient);
      const patientExaminations = getPatientExaminations(examinations, patient);
      document.querySelector("#recordDetailTitle").textContent = `Rekam medis · ${patient.fullName}`;
      document.querySelector("#recordPatientBanner").replaceChildren(
        createElement("span", "record-banner-icon", "▤"),
        createElement("div", "record-banner-copy", ""),
        createElement("div", "record-banner-meta", "")
      );
      const banner = document.querySelector("#recordPatientBanner");
      banner.children[1].append(
        createElement("strong", "", patient.fullName),
        createElement("span", "", `No. RM ${patient.medicalRecordNumber} · ${visits.length} kunjungan · ${patientExaminations.length} pemeriksaan`)
      );
      banner.children[2].append(
        createElement("small", "", "KUNJUNGAN TERAKHIR"),
        createElement("strong", "", visits.length ? formatDate(visits[0].visitDate) : "Belum ada kunjungan")
      );
      renderIdentity(patient);
      renderVisits(visits);
      renderExaminations(patientExaminations, visits);
      renderDiagnosesAndActions(patientExaminations);
      renderPrescriptions(patientExaminations);
      renderOperationalHistory(data, patient);
      renderCompleteness(patient, visits, patientExaminations);
      renderResume(patient, visits, patientExaminations);
      detail.hidden = false;
    };

    const render = () => {
      alert.hidden = true;
      const empty = document.querySelector("#medicalRecordsEmpty");
      let data;
      let examinations;
      try {
        ({ data, examinations } = loadData());
      } catch (error) {
        alert.textContent = `Data rekam medis tidak dapat dimuat: ${error.message}`;
        alert.hidden = false;
        showDataLoadError(empty, error);
        return;
      }

      const allPatients = data.patients.filter((patient) => Boolean(patient.medicalRecordNumber));
      const query = search.value.trim().toLocaleLowerCase("id");
      const filteredPatients = allPatients.filter((patient) =>
        [patient.fullName, patient.nik, patient.medicalRecordNumber]
          .some((value) => String(value || "").toLocaleLowerCase("id").includes(query))
      ).sort((first, second) => String(first.fullName || "").localeCompare(String(second.fullName || ""), "id"));
      table.replaceChildren();
      filteredPatients.forEach((patient) => {
        const visits = getPatientVisits(data, patient);
        const patientExaminations = getPatientExaminations(examinations, patient);
        const completeness = getCompleteness(patient, visits, patientExaminations);
        const row = document.createElement("tr");
        createCell(row, patient.medicalRecordNumber, "record-number");
        const patientCell = createCell(row, "");
        patientCell.append(
          createElement("strong", "table-primary-text", displayValue(patient.fullName)),
          createElement("small", "table-secondary-text", `NIK ${displayValue(patient.nik)}`)
        );
        createCell(row, String(visits.length));
        createCell(row, String(patientExaminations.length));
        createCell(row, visits.length ? formatDate(visits[0].visitDate) : "—");
        const statusCell = createCell(row, "");
        statusCell.append(createElement("span", `record-completeness-badge ${completeness.complete ? "is-complete" : "is-incomplete"}`, completeness.complete ? "Lengkap" : "Perlu dilengkapi"));
        const actionCell = createCell(row, "");
        const openButton = createElement("button", "button button-small button-secondary", "Lihat detail");
        openButton.type = "button";
        openButton.addEventListener("click", () => {
          selectedMedicalRecord = patient.medicalRecordNumber;
          renderDetail(data, examinations, patient);
          detail.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        actionCell.append(openButton);
        table.append(row);
      });

      document.querySelector("#medicalRecordCount").textContent = `${filteredPatients.length} dari ${allPatients.length} pasien`;
      document.querySelector("#recordPatientCount").textContent = String(allPatients.length);
      document.querySelector("#recordVisitCount").textContent = String(data.visits.length);
      document.querySelector("#recordExamCount").textContent = String(examinations.length);
      document.querySelector("#recordIncompleteCount").textContent = String(allPatients.filter((patient) =>
        !getCompleteness(patient, getPatientVisits(data, patient), getPatientExaminations(examinations, patient)).complete
      ).length);
      empty.hidden = allPatients.length > 0;
      if (allPatients.length > 0 && filteredPatients.length === 0) {
        empty.replaceChildren(
          createElement("span", "", "⌕"),
          createElement("strong", "", "Pasien tidak ditemukan"),
          createElement("p", "", "Periksa kembali nama pasien, NIK, atau nomor rekam medis.")
        );
        empty.hidden = false;
      } else if (allPatients.length === 0) {
        empty.replaceChildren(
          createElement("span", "", "▤"),
          createElement("strong", "", "Belum ada rekam medis pasien"),
          createElement("p", "", "Rekam medis akan tersedia setelah pasien terdaftar melalui modul Pendaftaran."),
          createElement("a", "button button-primary", "Buka pendaftaran")
        );
        empty.querySelector("a").href = "pendaftaran.html";
      }

      if (selectedMedicalRecord) {
        const selectedPatient = allPatients.find((patient) => patient.medicalRecordNumber === selectedMedicalRecord);
        if (selectedPatient) {
          renderDetail(data, examinations, selectedPatient);
        } else {
          selectedMedicalRecord = "";
          detail.hidden = true;
        }
      }
    };

    search.addEventListener("input", render);
    document.querySelector("#closeMedicalRecord").addEventListener("click", () => {
      selectedMedicalRecord = "";
      detail.hidden = true;
    });
    document.querySelector("#printResumeButton").addEventListener("click", () => {
      if (!selectedMedicalRecord) {
        showVisitNotification(document.querySelector("#medicalRecordToast"), "Pilih pasien untuk mencetak resume medis.", true);
        return;
      }
      window.print();
    });
    window.addEventListener("storage", (event) => {
      if (event.key === registrationStorageKey) {
        render();
      }
    });
    render();
  };

  const initializeIcdCoding = () => {
    const worklist = document.querySelector("#codingWorklist");
    if (!worklist) {
      return;
    }

    const referenceStorageKey = "simrsSasaIcdReferenceData";
    const search = document.querySelector("#codingPatientSearch");
    const editorPanel = document.querySelector("#codingEditor");
    const alert = document.querySelector("#codingAlert");
    const notice = document.querySelector("#icdReferenceNotice");
    const primaryEditor = document.querySelector("#primaryIcd10Editor");
    const secondaryRows = document.querySelector("#secondaryDiagnosisRows");
    const procedureRows = document.querySelector("#procedureCodingRows");
    const form = document.querySelector("#codingForm");
    let activeRegistration = "";
    let icdCatalog = { icd10: [], icd9cm: [] };

    const createCell = (row, value, className = "") => {
      const cell = createElement("td", className, value);
      row.append(cell);
      return cell;
    };

    const displayValue = (value, fallback = "—") => {
      if (Array.isArray(value)) {
        const values = value.map((item) => String(item || "").trim()).filter(Boolean);
        return values.length ? values.join(", ") : fallback;
      }
      const normalized = String(value || "").trim();
      return normalized || fallback;
    };

    const getCodingStatus = (examination) => {
      const status = examination.coding && examination.coding.status
        ? examination.coding.status
        : examination.codingStatus;
      if (["Belum Dikode", "Proses", "Selesai"].includes(status)) {
        return status;
      }
      const hasExistingCode = Boolean(examination.icd10Code || examination.icd10Codes || examination.icd9CmCode || examination.icd9CmCodes);
      return hasExistingCode ? "Proses" : "Belum Dikode";
    };

    const getCodingPayload = (examination) => {
      if (examination.coding && typeof examination.coding === "object") {
        return examination.coding;
      }
      return {
        primaryDiagnosis: {
          description: examination.primaryDiagnosis || "",
          code: examination.primaryIcd10Code || "",
          codeDescription: examination.icd10Description || "",
          verified: false
        },
        secondaryDiagnoses: examination.additionalDiagnosis
          ? [{ description: examination.additionalDiagnosis, code: examination.additionalIcd10Code || "", codeDescription: "", verified: false }]
          : [],
        procedures: examination.medicalActions
          ? [{ description: examination.medicalActions, code: examination.icd9CmCode || "", codeDescription: examination.icd9CmDescription || "", verified: false }]
          : [],
        status: getCodingStatus(examination),
        updatedAt: ""
      };
    };

    const normalizeCatalogEntries = (value) => {
      if (!Array.isArray(value)) {
        return [];
      }
      return value.map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }
        const code = String(entry.code || entry.kode || "").trim();
        const description = String(entry.description || entry.deskripsi || entry.name || entry.nama || "").trim();
        return code && description ? { code, description } : null;
      }).filter(Boolean);
    };

    const readCatalog = (data) => {
      const stored = localStorage.getItem(referenceStorageKey);
      const source = stored
        ? JSON.parse(stored)
        : (data.icdReference || data.icdReferenceData || {});
      if (!source || typeof source !== "object" || Array.isArray(source)) {
        throw new Error("Struktur referensi ICD tidak valid.");
      }
      return {
        icd10: normalizeCatalogEntries(source.icd10 || source.icd10Catalog || source.icd10Codes || data.icd10Catalog),
        icd9cm: normalizeCatalogEntries(source.icd9cm || source.icd9Cm || source.icd9CmCatalog || source.icd9CmCodes || data.icd9CmCatalog)
      };
    };

    const getReferenceItems = (type) => type === "icd10" ? icdCatalog.icd10 : icdCatalog.icd9cm;

    const updateReferenceNotice = () => {
      const total = icdCatalog.icd10.length + icdCatalog.icd9cm.length;
      document.querySelector("#icdReferenceCount").textContent = String(total);
      document.querySelector("#icdReferenceLabel").textContent = total ? "kode tersedia" : "belum tersedia";
      if (total) {
        notice.textContent = `Katalog aplikasi memuat ${icdCatalog.icd10.length} kode ICD-10 dan ${icdCatalog.icd9cm.length} kode ICD-9-CM. Pencarian hanya memakai data tersebut; pastikan sumber katalog sesuai referensi resmi yang digunakan fasilitas.`;
        notice.dataset.type = "available";
      } else {
        notice.textContent = "Katalog referensi ICD-10 dan ICD-9-CM resmi tidak ditemukan di data aplikasi. Pencarian kode tidak menampilkan hasil rekaan; kode manual hanya tersimpan sebagai Proses dan perlu diverifikasi setelah referensi resmi tersedia.";
        notice.dataset.type = "missing";
      }
      notice.hidden = false;
    };

    const setEditorVerificationNote = (editor) => {
      const note = editor.querySelector("[data-code-note]");
      if (editor.dataset.verified === "true") {
        note.textContent = "Kode dan deskripsi cocok dengan katalog aplikasi.";
        note.className = "code-verification-note is-verified";
      } else if (editor.querySelector("[data-code-value]").value.trim()) {
        note.textContent = "Kode manual belum dicocokkan dengan katalog aplikasi.";
        note.className = "code-verification-note is-unverified";
      } else {
        note.textContent = "Kode belum dipilih dari referensi aplikasi.";
        note.className = "code-verification-note";
      }
    };

    const bindCodeEditor = (editor, type, initial = {}) => {
      const searchInput = editor.querySelector("[data-lookup-search]");
      const resultList = editor.querySelector("[data-lookup-results]");
      const codeInput = editor.querySelector("[data-code-value]");
      const descriptionInput = editor.querySelector("[data-code-description]");
      codeInput.value = initial.code || "";
      descriptionInput.value = initial.codeDescription || "";
      editor.dataset.verified = initial.verified ? "true" : "false";
      setEditorVerificationNote(editor);

      const renderResults = () => {
        const query = searchInput.value.trim().toLocaleLowerCase("id");
        resultList.replaceChildren();
        if (!query) {
          resultList.hidden = true;
          return;
        }
        const references = getReferenceItems(type);
        if (references.length === 0) {
          resultList.append(createElement("p", "icd-result-empty", `Referensi resmi ${type === "icd10" ? "ICD-10" : "ICD-9-CM"} belum tersedia.`));
          resultList.hidden = false;
          return;
        }
        const matches = references.filter((entry) =>
          entry.code.toLocaleLowerCase("id").includes(query) ||
          entry.description.toLocaleLowerCase("id").includes(query)
        ).slice(0, 12);
        if (matches.length === 0) {
          resultList.append(createElement("p", "icd-result-empty", "Tidak ada kecocokan pada referensi ICD yang tersedia."));
          resultList.hidden = false;
          return;
        }
        matches.forEach((entry) => {
          const option = createElement("button", "icd-result-option");
          option.type = "button";
          option.append(
            createElement("strong", "", entry.code),
            createElement("span", "", entry.description)
          );
          option.addEventListener("click", () => {
            codeInput.value = entry.code;
            descriptionInput.value = entry.description;
            editor.dataset.verified = "true";
            searchInput.value = entry.code;
            resultList.hidden = true;
            setEditorVerificationNote(editor);
          });
          resultList.append(option);
        });
        resultList.hidden = false;
      };

      if (editor.dataset.listenersAttached !== "true") {
        searchInput.addEventListener("input", renderResults);
        codeInput.addEventListener("input", () => {
          editor.dataset.verified = "false";
          descriptionInput.value = "";
          setEditorVerificationNote(editor);
        });
        editor.dataset.listenersAttached = "true";
      }
      editor.getValue = () => ({
        code: codeInput.value.trim(),
        codeDescription: descriptionInput.value.trim(),
        verified: editor.dataset.verified === "true" && Boolean(codeInput.value.trim())
      });
    };

    const createCodeEditor = (type, initial = {}) => {
      const editor = createElement("div", "icd-code-editor");
      editor.dataset.type = type;
      const searchLabel = createElement("label", "coding-field");
      searchLabel.append(createElement("span", "", `Cari kode / deskripsi ${type === "icd10" ? "ICD-10" : "ICD-9-CM"} pada referensi`));
      const searchInput = document.createElement("input");
      searchInput.type = "search";
      searchInput.autocomplete = "off";
      searchInput.placeholder = "Cari berdasarkan kode atau nama";
      searchInput.dataset.lookupSearch = "";
      searchLabel.append(searchInput);
      const results = createElement("div", "icd-lookup-results");
      results.dataset.lookupResults = "";
      results.hidden = true;
      const inputs = createElement("div", "coding-code-inputs");
      const codeLabel = createElement("label", "coding-field");
      codeLabel.append(createElement("span", "", `Kode ${type === "icd10" ? "ICD-10" : "ICD-9-CM"}`));
      const codeInput = document.createElement("input");
      codeInput.type = "text";
      codeInput.maxLength = 30;
      codeInput.placeholder = "Kode manual belum terverifikasi";
      codeInput.dataset.codeValue = "";
      codeLabel.append(codeInput);
      const descriptionLabel = createElement("label", "coding-field");
      descriptionLabel.append(createElement("span", "", "Deskripsi kode"));
      const descriptionInput = document.createElement("input");
      descriptionInput.type = "text";
      descriptionInput.readOnly = true;
      descriptionInput.placeholder = "Pilih hasil dari referensi resmi";
      descriptionInput.dataset.codeDescription = "";
      descriptionLabel.append(descriptionInput);
      inputs.append(codeLabel, descriptionLabel);
      const note = createElement("small", "code-verification-note");
      note.dataset.codeNote = "";
      editor.append(searchLabel, results, inputs, note);
      bindCodeEditor(editor, type, initial);
      return editor;
    };

    const createSecondaryRow = (item = {}) => {
      const row = createElement("div", "coding-item-row secondary-diagnosis-row");
      const descriptionLabel = createElement("label", "coding-field");
      descriptionLabel.append(createElement("span", "", "Diagnosis sekunder"));
      const descriptionInput = document.createElement("input");
      descriptionInput.type = "text";
      descriptionInput.maxLength = 500;
      descriptionInput.placeholder = "Masukkan diagnosis tambahan";
      descriptionInput.value = item.description || "";
      descriptionInput.dataset.secondaryDescription = "";
      descriptionLabel.append(descriptionInput);
      const codeEditor = createCodeEditor("icd10", item);
      const removeButton = createElement("button", "remove-coding-item", "×");
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", "Hapus diagnosis sekunder");
      removeButton.addEventListener("click", () => {
        row.remove();
        document.querySelector("#secondaryDiagnosisEmpty").hidden = secondaryRows.children.length > 0;
      });
      row.append(descriptionLabel, codeEditor, removeButton);
      secondaryRows.append(row);
      document.querySelector("#secondaryDiagnosisEmpty").hidden = true;
      return row;
    };

    const createProcedureRow = (item = {}) => {
      const row = createElement("div", "coding-item-row procedure-coding-row");
      const descriptionLabel = createElement("label", "coding-field");
      descriptionLabel.append(createElement("span", "", "Tindakan medis"));
      const descriptionInput = document.createElement("input");
      descriptionInput.type = "text";
      descriptionInput.maxLength = 800;
      descriptionInput.placeholder = "Masukkan tindakan dari pemeriksaan dokter";
      descriptionInput.value = item.description || "";
      descriptionInput.dataset.procedureDescription = "";
      descriptionLabel.append(descriptionInput);
      const codeEditor = createCodeEditor("icd9cm", item);
      const removeButton = createElement("button", "remove-coding-item", "×");
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", "Hapus tindakan medis");
      removeButton.addEventListener("click", () => {
        row.remove();
        document.querySelector("#procedureCodingEmpty").hidden = procedureRows.children.length > 0;
      });
      row.append(descriptionLabel, codeEditor, removeButton);
      procedureRows.append(row);
      document.querySelector("#procedureCodingEmpty").hidden = true;
      return row;
    };

    const renderHistory = (data, examinations, patient) => {
      const tbody = document.querySelector("#codingHistory");
      const empty = document.querySelector("#codingHistoryEmpty");
      const patientExaminations = examinations
        .filter((examination) => examination.medicalRecordNumber === patient.medicalRecordNumber)
        .sort((first, second) => String(second.visitDate || "").localeCompare(String(first.visitDate || "")));
      tbody.replaceChildren();
      patientExaminations.forEach((examination) => {
        const coding = getCodingPayload(examination);
        const visit = data.visits.find((record) => record.registrationNumber === examination.registrationNumber);
        const procedures = Array.isArray(coding.procedures) ? coding.procedures : [];
        const row = document.createElement("tr");
        createCell(row, formatDate(examination.visitDate), "record-number");
        createCell(row, coding.primaryDiagnosis && coding.primaryDiagnosis.description || examination.primaryDiagnosis || "—");
        createCell(row, coding.primaryDiagnosis && coding.primaryDiagnosis.code || "Belum dikodekan", "record-code-cell");
        createCell(row, procedures.map((procedure) => [
          procedure.description || "",
          procedure.code ? ` (${procedure.code})` : ""
        ].join("")).filter(Boolean).join("; ") || examination.medicalActions || "—");
        const statusCell = createCell(row, "");
        const status = getCodingStatus(examination);
        statusCell.append(createElement("span", `coding-status-badge ${status === "Selesai" ? "is-complete" : status === "Proses" ? "is-progress" : "is-pending"}`, status));
        createCell(row, coding.updatedAt ? formatDate(coding.updatedAt) : (visit ? formatDate(visit.visitDate) : "—"));
        tbody.append(row);
      });
      document.querySelector("#codingHistoryCount").textContent = `${patientExaminations.length} riwayat`;
      empty.hidden = patientExaminations.length > 0;
    };

    const renderEditor = (data, examinations, registrationNumber) => {
      const examination = examinations.find((record) => record.registrationNumber === registrationNumber);
      if (!examination) {
        editorPanel.hidden = true;
        activeRegistration = "";
        return;
      }
      const patient = findVisitPatient(data, examination);
      if (!patient) {
        alert.textContent = "Data pasien untuk pemeriksaan ini tidak ditemukan.";
        alert.hidden = false;
        editorPanel.hidden = true;
        return;
      }
      const visit = data.visits.find((record) => record.registrationNumber === registrationNumber);
      const coding = getCodingPayload(examination);
      const primary = coding.primaryDiagnosis || {};
      activeRegistration = registrationNumber;
      document.querySelector("#codingEditorTitle").textContent = `Coding kunjungan · ${formatDate(examination.visitDate)}`;
      document.querySelector("#codingPatientBanner").replaceChildren(
        createElement("div", "coding-patient-identity", ""),
        createElement("div", "coding-visit-info", "")
      );
      const banner = document.querySelector("#codingPatientBanner");
      banner.children[0].append(
        createElement("strong", "", patient.fullName),
        createElement("span", "", `No. RM ${patient.medicalRecordNumber} · NIK ${displayValue(patient.nik)}`),
        createElement("small", "", `${formatDate(patient.birthDate)} · ${patient.gender}`)
      );
      banner.children[1].append(
        createElement("span", "", getVisitPoliName(visit || examination)),
        createElement("strong", "", formatDate(examination.visitDate)),
        createElement("small", "", `${displayValue(examination.registrationNumber)} · ${displayValue(examination.doctor || (visit && visit.doctor))}`)
      );

      document.querySelector("#primaryDiagnosisText").value = primary.description || examination.primaryDiagnosis || "";
      bindCodeEditor(primaryEditor, "icd10", primary);
      secondaryRows.replaceChildren();
      const secondaryDiagnoses = Array.isArray(coding.secondaryDiagnoses) ? coding.secondaryDiagnoses : [];
      secondaryDiagnoses.forEach((item) => createSecondaryRow(item));
      if (secondaryDiagnoses.length === 0 && examination.additionalDiagnosis) {
        createSecondaryRow({ description: examination.additionalDiagnosis });
      }
      document.querySelector("#secondaryDiagnosisEmpty").hidden = secondaryRows.children.length > 0;

      procedureRows.replaceChildren();
      const procedures = Array.isArray(coding.procedures) ? coding.procedures : [];
      procedures.forEach((item) => createProcedureRow(item));
      if (procedures.length === 0 && examination.medicalActions) {
        createProcedureRow({ description: examination.medicalActions });
      }
      document.querySelector("#procedureCodingEmpty").hidden = procedureRows.children.length > 0;
      const codingStatus = document.querySelector("#codingStatus");
      codingStatus.value = coding.status || getCodingStatus(examination);
      renderHistory(data, examinations, patient);
      editorPanel.hidden = false;
      document.querySelector("#codingStatusHint").textContent = icdCatalog.icd10.length || icdCatalog.icd9cm.length
        ? "Status Selesai hanya dapat dipilih jika kode yang diperlukan sudah dipilih dari referensi aplikasi."
        : "Referensi resmi belum tersedia. Anda dapat menyimpan progres manual, tetapi status Selesai belum dapat ditetapkan.";
    };

    const readItemRows = (container, descriptionSelector) => [...container.querySelectorAll(".coding-item-row")].map((row) => ({
      description: row.querySelector(descriptionSelector).value.trim(),
      ...row.querySelector(".icd-code-editor").getValue()
    })).filter((item) => item.description || item.code);

    const saveCoding = (event) => {
      event.preventDefault();
      if (!activeRegistration) {
        alert.textContent = "Pilih pemeriksaan pasien sebelum menyimpan hasil coding.";
        alert.hidden = false;
        return;
      }
      const primaryDescription = document.querySelector("#primaryDiagnosisText").value.trim();
      if (!primaryDescription) {
        document.querySelector("#primaryDiagnosisText").focus();
        alert.textContent = "Diagnosis utama wajib tersedia dari catatan pemeriksaan.";
        alert.hidden = false;
        return;
      }
      const primaryCode = primaryEditor.getValue();
      const secondaryDiagnoses = readItemRows(secondaryRows, "[data-secondary-description]");
      const procedures = readItemRows(procedureRows, "[data-procedure-description]");
      const status = document.querySelector("#codingStatus").value;
      if (secondaryDiagnoses.some((diagnosis) => diagnosis.code && !diagnosis.description) ||
        procedures.some((procedure) => procedure.code && !procedure.description)) {
        alert.textContent = "Lengkapi deskripsi diagnosis atau tindakan pada setiap baris yang memiliki kode.";
        alert.hidden = false;
        return;
      }
      const allDiagnosesVerified = primaryCode.verified &&
        secondaryDiagnoses.every((diagnosis) => diagnosis.verified);
      const allProceduresVerified = procedures.every((procedure) => procedure.verified);
      const hasCodeEntries = Boolean(primaryCode.code) ||
        secondaryDiagnoses.some((diagnosis) => Boolean(diagnosis.code)) ||
        procedures.some((procedure) => Boolean(procedure.code));
      if (status === "Belum Dikode" && hasCodeEntries) {
        alert.textContent = "Pilih status Proses untuk menyimpan kode yang belum selesai diverifikasi.";
        alert.hidden = false;
        return;
      }
      if (status === "Selesai" && (!allDiagnosesVerified || !allProceduresVerified)) {
        alert.textContent = "Status Selesai memerlukan kode diagnosis dan tindakan yang cocok dengan katalog ICD aplikasi. Simpan sebagai Proses sampai kode dapat diverifikasi.";
        alert.hidden = false;
        return;
      }

      try {
        const data = readRegistrationData();
        const examinations = readExaminations(data);
        const examination = examinations.find((record) => record.registrationNumber === activeRegistration);
        if (!examination) {
          throw new Error("Catatan pemeriksaan tidak ditemukan. Muat ulang daftar.");
        }
        const patient = findVisitPatient(data, examination);
        if (!patient) {
          throw new Error("Data pasien tidak ditemukan pada daftar pasien terdaftar.");
        }
        const timestamp = new Date().toISOString();
        examination.coding = {
          primaryDiagnosis: { description: primaryDescription, ...primaryCode },
          secondaryDiagnoses,
          procedures,
          status,
          updatedAt: timestamp,
          updatedBy: currentUser || ""
        };
        examination.codingStatus = status;
        const icd10Codes = [primaryCode.code, ...secondaryDiagnoses.map((item) => item.code)].filter(Boolean);
        const icd9Codes = procedures.map((item) => item.code).filter(Boolean);
        examination.primaryIcd10Code = primaryCode.code;
        examination.icd10Codes = icd10Codes;
        examination.icd10Code = icd10Codes;
        examination.icd10Description = primaryCode.codeDescription;
        examination.icd9CmCodes = icd9Codes;
        examination.icd9CmCode = icd9Codes;
        examination.icd9CmDescription = procedures.map((item) => item.codeDescription).filter(Boolean).join("; ");
        saveRegistrationData(data);
        alert.hidden = true;
        showVisitNotification(document.querySelector("#codingToast"), `Hasil coding ${patient.fullName} berhasil disimpan.`);
        render();
        renderEditor(data, examinations, activeRegistration);
      } catch (error) {
        alert.textContent = `Hasil coding gagal disimpan: ${error.message}`;
        alert.hidden = false;
      }
    };

    const render = () => {
      alert.hidden = true;
      let data;
      let examinations;
      try {
        data = readRegistrationData();
        examinations = readExaminations(data);
        icdCatalog = readCatalog(data);
      } catch (error) {
        alert.textContent = `Data coding tidak dapat dimuat: ${error.message}`;
        alert.hidden = false;
        showDataLoadError(document.querySelector("#codingWorklistEmpty"), error);
        return;
      }
      updateReferenceNotice();
      const query = search.value.trim().toLocaleLowerCase("id");
      const patientExaminations = examinations.filter((examination) => {
        const patient = findVisitPatient(data, examination);
        if (!patient) {
          return false;
        }
        return !query || String(patient.fullName || "").toLocaleLowerCase("id").includes(query) ||
          String(patient.medicalRecordNumber || "").toLocaleLowerCase("id").includes(query);
      }).sort((first, second) => String(second.visitDate || "").localeCompare(String(first.visitDate || "")));
      worklist.replaceChildren();
      patientExaminations.forEach((examination) => {
        const patient = findVisitPatient(data, examination);
        const visit = data.visits.find((record) => record.registrationNumber === examination.registrationNumber);
        const coding = getCodingPayload(examination);
        const status = getCodingStatus(examination);
        const row = document.createElement("tr");
        createCell(row, formatDate(examination.visitDate), "record-number");
        const patientCell = createCell(row, "");
        patientCell.append(
          createElement("strong", "table-primary-text", patient.fullName),
          createElement("small", "table-secondary-text", `No. RM ${patient.medicalRecordNumber}`)
        );
        const clinic = createCell(row, "");
        clinic.append(
          createElement("strong", "table-primary-text", getVisitPoliName(visit || examination)),
          createElement("small", "table-secondary-text", examination.doctor || (visit && visit.doctor) || "Dokter tidak tercatat")
        );
        createCell(row, examination.primaryDiagnosis || (coding.primaryDiagnosis && coding.primaryDiagnosis.description) || "Diagnosis belum dicatat");
        createCell(row, coding.primaryDiagnosis && coding.primaryDiagnosis.code || "—", "record-code-cell");
        const statusCell = createCell(row, "");
        statusCell.append(createElement("span", `coding-status-badge ${status === "Selesai" ? "is-complete" : status === "Proses" ? "is-progress" : "is-pending"}`, status));
        const actionCell = createCell(row, "");
        const openButton = createElement("button", "button button-small button-primary", "Coding");
        openButton.type = "button";
        openButton.addEventListener("click", () => {
          activeRegistration = examination.registrationNumber;
          renderEditor(data, examinations, activeRegistration);
          editorPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        actionCell.append(openButton);
        worklist.append(row);
      });

      const empty = document.querySelector("#codingWorklistEmpty");
      empty.hidden = patientExaminations.length > 0;
      if (patientExaminations.length === 0 && examinations.length > 0) {
        empty.replaceChildren(
          createElement("span", "", "⌕"),
          createElement("strong", "", "Pemeriksaan tidak ditemukan"),
          createElement("p", "", "Coba nama pasien atau nomor rekam medis yang lain.")
        );
      } else if (examinations.length === 0) {
        empty.replaceChildren(
          createElement("span", "", "⌕"),
          createElement("strong", "", "Belum ada pemeriksaan untuk coding"),
          createElement("p", "", "Pasien muncul setelah dokter menyimpan catatan pemeriksaan."),
          createElement("a", "button button-secondary", "Buka pemeriksaan")
        );
        empty.querySelector("a").href = "pemeriksaan.html";
      }
      document.querySelector("#codingWorklistCount").textContent = `${patientExaminations.length} pemeriksaan`;
      document.querySelector("#codingNotStartedCount").textContent = String(patientExaminations.filter((examination) => getCodingStatus(examination) === "Belum Dikode").length);
      document.querySelector("#codingInProgressCount").textContent = String(patientExaminations.filter((examination) => getCodingStatus(examination) === "Proses").length);
      document.querySelector("#codingCompletedCount").textContent = String(patientExaminations.filter((examination) => getCodingStatus(examination) === "Selesai").length);
    };

    document.querySelector("#addSecondaryDiagnosis").addEventListener("click", () => createSecondaryRow());
    document.querySelector("#addProcedure").addEventListener("click", () => createProcedureRow());
    document.querySelector("#closeCodingEditor").addEventListener("click", () => {
      activeRegistration = "";
      editorPanel.hidden = true;
    });
    form.addEventListener("submit", saveCoding);
    search.addEventListener("input", render);
    window.addEventListener("storage", (event) => {
      if (event.key === registrationStorageKey || event.key === referenceStorageKey) {
        render();
      }
    });
    render();
  };

  const initializeCodingReport = () => {
    const report = document.querySelector(".module-placeholder");
    if (!report || !window.location.pathname.endsWith("/laporan.html")) {
      return;
    }
    const reportTypes = [
      ["visits", "Kunjungan rawat jalan"],
      ["admissions", "Rawat inap"],
      ["patients", "Jumlah pasien"],
      ["clinics", "Kunjungan per poliklinik"],
      ["diagnoses", "Diagnosis terbanyak"],
      ["medications", "Penggunaan obat"],
      ["laboratory", "Laboratorium"],
      ["radiology", "Radiologi"],
      ["revenue", "Pendapatan"]
    ];
    const columns = {
      visits: [["Tanggal", "date"], ["Registrasi", "registrationNumber"], ["No. RM", "medicalRecordNumber"], ["Pasien", "patientName"], ["Poliklinik", "poliName"], ["Dokter", "doctor"], ["Pembayaran", "paymentType"], ["Status", "status"]],
      admissions: [["Tanggal masuk", "admissionDate"], ["No. RM", "medicalRecordNumber"], ["Pasien", "patientName"], ["Kamar / bed", "bed"], ["Kelas", "className"], ["Status", "status"], ["Tanggal keluar", "dischargeDate"]],
      patients: [["No. RM", "medicalRecordNumber"], ["Nama pasien", "patientName"], ["NIK", "nik"], ["Tanggal lahir", "birthDate"], ["Jenis kelamin", "gender"], ["Terdaftar", "createdAt"]],
      clinics: [["Poliklinik", "label"], ["Jumlah kunjungan", "count"]],
      diagnoses: [["Tanggal", "date"], ["No. RM", "medicalRecordNumber"], ["Pasien", "patientName"], ["Diagnosis", "diagnosis"], ["Kode ICD-10", "code"], ["Status coding", "codingStatus"]],
      medications: [["Tanggal", "date"], ["Kode obat", "code"], ["Nama obat", "medicineName"], ["Jenis transaksi", "type"], ["Jumlah", "quantity"], ["Satuan", "unit"]],
      laboratory: [["No. pemeriksaan", "id"], ["Tanggal", "date"], ["No. RM", "medicalRecordNumber"], ["Pasien", "patientName"], ["Pemeriksaan", "testName"], ["Status", "status"]],
      radiology: [["No. pemeriksaan", "id"], ["Tanggal", "date"], ["No. RM", "medicalRecordNumber"], ["Pasien", "patientName"], ["Pemeriksaan", "testName"], ["Status", "status"]],
      revenue: [["Tanggal", "date"], ["Transaksi", "id"], ["No. RM", "medicalRecordNumber"], ["Pasien", "patientName"], ["Metode", "paymentMethod"], ["Jumlah", "amount"]]
    };
    const asText = (value) => value === undefined || value === null || value === "" ? "—" : String(value);
    const amountText = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);
    const getPatient = (data, medicalRecordNumber) =>
      data.patients.find((patient) => patient.medicalRecordNumber === medicalRecordNumber);
    const getDate = (record) => String(record.visitDate || record.admissionDate || record.date || record.createdAt || "").slice(0, 10);
    const createReportRows = (data, type) => {
      const examinations = readExaminations(data);
      if (type === "visits") {
        return data.visits.map((visit) => {
          const patient = getPatient(data, visit.medicalRecordNumber);
          return { date: visit.visitDate, registrationNumber: visit.registrationNumber, medicalRecordNumber: visit.medicalRecordNumber, patientName: patient ? patient.fullName : visit.patientName, poliName: getVisitPoliName(visit), doctor: visit.doctor, paymentType: visit.paymentType, status: visit.status };
        });
      }
      if (type === "admissions") {
        return data.admissions.map((admission) => {
          const patient = getPatient(data, admission.medicalRecordNumber);
          const bed = data.beds.find((item) => item.id === admission.bedId);
          return { ...admission, admissionDate: admission.admissionDate || admission.createdAt, patientName: patient ? patient.fullName : admission.patientName, bed: bed ? `${bed.roomNumber || bed.room || "—"} / ${bed.bedNumber || bed.label || "—"}` : "—" };
        });
      }
      if (type === "patients") {
        return data.patients.map((patient) => ({ medicalRecordNumber: patient.medicalRecordNumber, patientName: patient.fullName, nik: patient.nik, birthDate: patient.birthDate, gender: patient.gender, createdAt: patient.createdAt }));
      }
      if (type === "clinics") {
        const totals = new Map();
        data.visits.forEach((visit) => {
          const name = getVisitPoliName(visit);
          totals.set(name, (totals.get(name) || 0) + 1);
        });
        return [...totals.entries()].map(([label, count]) => ({ label, count }));
      }
      if (type === "diagnoses") {
        return examinations.map((examination) => {
          const patient = getPatient(data, examination.medicalRecordNumber);
          const coding = examination.coding || {};
          const primary = coding.primaryDiagnosis || {};
          return { date: examination.visitDate, medicalRecordNumber: examination.medicalRecordNumber, patientName: patient ? patient.fullName : "—", diagnosis: primary.description || examination.primaryDiagnosis, code: primary.code || examination.primaryIcd10Code, codingStatus: coding.status || examination.codingStatus || "Belum Dikode" };
        });
      }
      if (type === "medications") {
        return data.stockTransactions.map((transaction) => {
          const medication = data.medications.find((item) => item.id === transaction.medicationId);
          return { date: transaction.date || transaction.createdAt, code: medication ? medication.code : "", medicineName: medication ? medication.name : transaction.medicineName, type: transaction.type, quantity: transaction.quantity, unit: medication ? medication.unit : transaction.unit };
        });
      }
      if (type === "laboratory" || type === "radiology") {
        const orders = type === "laboratory" ? data.labOrders : data.radiologyOrders;
        return orders.map((order) => {
          const patient = getPatient(data, order.medicalRecordNumber);
          return { id: order.id || order.orderNumber, date: order.visitDate || order.requestedAt, medicalRecordNumber: order.medicalRecordNumber, patientName: patient ? patient.fullName : order.patientName, testName: order.testName || order.examType, status: order.status };
        });
      }
      const paidPayments = data.payments.filter((payment) =>
        ["Berhasil", "Lunas", "Selesai"].includes(payment.status)
      );
      const revenueRecords = paidPayments.length ? paidPayments : data.invoices.filter((invoice) => invoice.status === "Lunas" || invoice.status === "Selesai");
      return revenueRecords.map((payment) => {
        const patient = getPatient(data, payment.medicalRecordNumber);
        return { date: payment.date || payment.paidAt || payment.createdAt, id: payment.id || payment.transactionNumber || payment.invoiceId, medicalRecordNumber: payment.medicalRecordNumber, patientName: patient ? patient.fullName : payment.patientName, paymentMethod: payment.paymentMethod || payment.method, amount: Number(payment.amount || payment.paidAmount || payment.total || 0) };
      });
    };
    const render = () => {
      let data;
      try {
        data = ensureModuleCollections(readRegistrationData());
      } catch (error) {
        report.replaceChildren(createElement("div", "report-load-error", `Laporan tidak dapat dimuat: ${error.message}`));
        return;
      }
      const type = report.querySelector("#hospitalReportType").value;
      const from = report.querySelector("#hospitalReportFrom").value;
      const to = report.querySelector("#hospitalReportTo").value;
      const sourceRows = type === "clinics"
        ? createReportRows({ ...data, visits: data.visits.filter((visit) => {
          const dateValue = String(visit.visitDate || "");
          return (!from || !dateValue || dateValue >= from) && (!to || !dateValue || dateValue <= to);
        }) }, type)
        : createReportRows(data, type);
      const rows = sourceRows.filter((row) => {
        const dateValue = getDate(row);
        return (!from || !dateValue || dateValue >= from) && (!to || !dateValue || dateValue <= to);
      });
      const table = report.querySelector("#hospitalReportTable");
      const tableHead = table.querySelector("thead");
      const tableBody = table.querySelector("tbody");
      tableHead.replaceChildren();
      const headerRow = document.createElement("tr");
      columns[type].forEach(([label]) => headerRow.append(createElement("th", "", label.toLocaleUpperCase("id"))));
      tableHead.append(headerRow);
      tableBody.replaceChildren();
      rows.forEach((record) => {
        const row = document.createElement("tr");
        columns[type].forEach(([, key]) => {
          let value = record[key];
          if (key === "amount") {
            value = amountText(value);
          } else if (["date", "admissionDate", "birthDate", "createdAt", "dischargeDate"].includes(key)) {
            value = formatDate(String(value || "").slice(0, 10));
          } else if (key === "patientName" && !value) {
            value = "—";
          }
          row.append(createElement("td", "", asText(value)));
        });
        tableBody.append(row);
      });
      report.querySelector("#hospitalReportCount").textContent = `${rows.length} baris`;
      report.querySelector("#hospitalReportEmpty").hidden = rows.length > 0;
      const uniquePatients = new Set(rows.map((row) => row.medicalRecordNumber).filter(Boolean)).size;
      const revenue = type === "revenue" ? rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0) : 0;
      report.querySelector("#hospitalReportMetrics").replaceChildren(
        ...[
          ["Data dalam laporan", rows.length, "report-icon-teal"],
          ["Pasien unik", uniquePatients, "report-icon-blue"],
          ["Pendapatan tercatat", amountText(revenue), "report-icon-green"],
          ["Status laporan", "Data simulasi", "report-icon-slate"]
        ].map(([label, value, iconClass]) => {
          const card = createElement("article", "hospital-report-metric");
          card.append(createElement("span", `hospital-report-metric-icon ${iconClass}`, "•"));
          const copy = createElement("div", "");
          copy.append(createElement("small", "", label), createElement("strong", "", String(value)));
          card.append(copy);
          return card;
        })
      );
      const groupCounts = new Map();
      rows.forEach((row) => {
        const label = String(
          row.poliName || row.diagnosis || row.medicineName || row.testName ||
          row.status || row.paymentMethod || row.patientName || "Data"
        );
        groupCounts.set(label, (groupCounts.get(label) || 0) + 1);
      });
      const chart = report.querySelector("#hospitalReportChart");
      chart.replaceChildren();
      const chartItems = [...groupCounts.entries()].sort((first, second) => second[1] - first[1]).slice(0, 8);
      if (!chartItems.length) {
        chart.append(createElement("p", "report-chart-empty", "Belum ada data pada periode ini."));
      } else {
        const max = Math.max(...chartItems.map(([, count]) => count));
        chartItems.forEach(([label, count]) => {
          const barRow = createElement("div", "report-chart-row");
          barRow.append(createElement("span", "report-chart-label", label));
          const track = createElement("span", "report-chart-track");
          const bar = createElement("span", "report-chart-bar");
          bar.style.width = `${Math.max(4, Math.round(count / max * 100))}%`;
          track.append(bar);
          barRow.append(track, createElement("strong", "", String(count)));
          chart.append(barRow);
        });
      }
      report.querySelector("#hospitalReportExport").onclick = () => {
        const headings = columns[type].map(([label]) => label);
        const csvValue = (value) => `"${String(value === undefined || value === null ? "" : value).replace(/"/g, '""')}"`;
        const csv = [headings, ...rows.map((row) => columns[type].map(([, key]) => row[key]))]
          .map((line) => line.map(csvValue).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `laporan-simrs-${type}-${getLocalDate()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      };
    };

    try {
      report.replaceChildren();
      const content = createElement("section", "hospital-report-content");
      const heading = createElement("div", "hospital-report-heading");
      heading.append(
        createElement("span", "eyebrow", "LAPORAN OPERASIONAL"),
        createElement("h2", "", "Laporan Rumah Sakit"),
        createElement("p", "", "Ringkasan kunjungan, pelayanan, farmasi, dan transaksi dari penyimpanan bersama SIMRS SASA. Nilai biaya merupakan simulasi.")
      );
      const actions = createElement("div", "hospital-report-actions");
      const printButton = createElement("button", "button button-secondary", "Cetak");
      printButton.type = "button";
      printButton.addEventListener("click", () => window.print());
      const exportButton = createElement("button", "button button-primary", "Ekspor CSV");
      exportButton.type = "button";
      exportButton.id = "hospitalReportExport";
      actions.append(printButton, exportButton);
      heading.append(actions);
      const filters = createElement("div", "hospital-report-filters");
      const typeLabel = createElement("label", "report-filter-field");
      typeLabel.append(createElement("span", "", "Jenis laporan"));
      const typeSelect = document.createElement("select");
      typeSelect.id = "hospitalReportType";
      reportTypes.forEach(([value, label]) => typeSelect.add(new Option(label, value)));
      typeLabel.append(typeSelect);
      const fromLabel = createElement("label", "report-filter-field");
      fromLabel.append(createElement("span", "", "Dari tanggal"));
      const fromInput = document.createElement("input");
      fromInput.type = "date";
      fromInput.id = "hospitalReportFrom";
      fromLabel.append(fromInput);
      const toLabel = createElement("label", "report-filter-field");
      toLabel.append(createElement("span", "", "Sampai tanggal"));
      const toInput = document.createElement("input");
      toInput.type = "date";
      toInput.id = "hospitalReportTo";
      toLabel.append(toInput);
      filters.append(typeLabel, fromLabel, toLabel);
      const metrics = createElement("div", "hospital-report-metrics");
      metrics.id = "hospitalReportMetrics";
      const chartPanel = createElement("section", "panel hospital-report-chart-panel");
      const chartHeading = createElement("div", "panel-heading");
      chartHeading.append(
        createElement("div", "", ""),
        createElement("span", "table-count", "Maks. 8 kategori")
      );
      chartHeading.firstElementChild.append(
        createElement("h2", "", "Grafik ringkasan"),
        createElement("p", "", "Perbandingan jumlah data pada laporan terpilih.")
      );
      const chart = createElement("div", "hospital-report-chart");
      chart.id = "hospitalReportChart";
      chartPanel.append(chartHeading, chart);
      const tablePanel = createElement("section", "panel hospital-report-table-panel");
      const tableHeading = createElement("div", "panel-heading");
      tableHeading.append(
        createElement("div", "", ""),
        createElement("span", "table-count", "")
      );
      tableHeading.firstElementChild.append(
        createElement("h2", "", "Rincian laporan"),
        createElement("p", "", "Data ditautkan ke identitas pasien yang sama pada seluruh modul.")
      );
      tableHeading.lastElementChild.id = "hospitalReportCount";
      const tableWrap = createElement("div", "table-wrap");
      const table = document.createElement("table");
      table.id = "hospitalReportTable";
      table.className = "data-table";
      table.append(document.createElement("thead"), document.createElement("tbody"));
      tableWrap.append(table);
      const empty = createElement("div", "empty-state", "Tidak ada data untuk filter yang dipilih.");
      empty.id = "hospitalReportEmpty";
      empty.hidden = true;
      tablePanel.append(tableHeading, tableWrap, empty);
      content.append(
        heading,
        filters,
        metrics,
        chartPanel,
        tablePanel,
        createElement("a", "button button-secondary coding-report-link", "Buka Coding ICD →")
      );
      content.querySelector("a").href = "coding-icd.html";
      report.append(content);
      [typeSelect, fromInput, toInput].forEach((input) => input.addEventListener("change", render));
      window.addEventListener("storage", (event) => {
        if (event.key === registrationStorageKey) {
          render();
        }
      });
      render();
    } catch (error) {
      report.replaceChildren(
        createElement("span", "eyebrow", "LAPORAN OPERASIONAL"),
        createElement("h2", "", "Laporan tidak dapat dimuat"),
        createElement("p", "", error.message)
      );
    }
  };

  const currentUser = readUser();
  const currentRole = readRole();
  const isLoginPage = Boolean(document.querySelector("#loginForm"));
  const isDashboardPage = window.location.pathname.endsWith("/dashboard.html");
  const fileName = window.location.pathname.split("/").pop() || "index.html";
  const readStoredPermissions = (role) => {
    try {
      const data = readRegistrationData();
      const account = Array.isArray(data.userAccounts)
        ? data.userAccounts.find((record) => String(record.username || "").toLowerCase() === String(currentUser || "").toLowerCase())
        : null;
      if (account && Array.isArray(account.permissions)) {
        return account.permissions;
      }
      const permissions = data.hospitalSettings && data.hospitalSettings.rolePermissions;
      return permissions && Array.isArray(permissions[role]) ? permissions[role] : null;
    } catch (error) {
      console.error("Izin tersimpan tidak dapat dibaca; izin bawaan digunakan.", error);
      return null;
    }
  };
  const canAccessPage = (role, page) => {
    const normalizedPage = page === "detail-kunjungan.html" ? "rawat-jalan.html" : page;
    if (normalizedPage === "dashboard.html" || role === "admin" && normalizedPage === "pengaturan.html") {
      return true;
    }
    const savedPermissions = readStoredPermissions(role);
    const allowedPages = savedPermissions || rolePageAccess[role] || [];
    return allowedPages.includes("*") || allowedPages.includes(normalizedPage);
  };

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const date = new Date();
  setText("[data-current-date]", new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date));
  setText("[data-long-date]", new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date));

  if (!isLoginPage && !currentUser) {
    window.location.replace("index.html");
    return;
  }
  if (isLoginPage && currentUser) {
    window.location.replace("dashboard.html");
    return;
  }
  if (currentUser && !isLoginPage && !canAccessPage(currentRole, fileName)) {
    window.location.replace("dashboard.html");
    return;
  }

  if (currentUser) {
    const demoAccount = demoAccounts.find((record) => record.username === currentUser.toLowerCase());
    let storedAccount = null;
    try {
      const storedData = readRegistrationData();
      storedAccount = Array.isArray(storedData.userAccounts)
        ? storedData.userAccounts.find((record) => String(record.username || "").toLowerCase() === currentUser.toLowerCase())
        : null;
    } catch (error) {
      console.error("Data akun pengguna tidak dapat dibaca.", error);
    }
    const account = demoAccount || storedAccount;
    const displayName = account ? account.fullName : currentUser;
    const firstName = displayName.trim().split(/\s+/)[0];
    setText("[data-user-name]", displayName);
    setText("[data-user-initial]", firstName.charAt(0).toUpperCase());
    setText("[data-welcome-name]", firstName);
    setText("[data-user-role]", roleLabels[currentRole] || "Pengguna");
  }

  if (pageInfo[fileName]) {
    const info = pageInfo[fileName];
    document.title = `${info.title} | SIMRS SASA`;
    setText("[data-page-title]", info.title);
    setText("[data-page-description]", info.description);
    setText("[data-breadcrumb]", info.title);
    setText("[data-page-icon]", info.icon);
  } else if (isDashboardPage) {
    setText("[data-breadcrumb]", "Dashboard");
  }
  if (fileName === "dokter.html" || fileName === "poli.html") {
    const placeholder = document.querySelector(".module-placeholder");
    if (placeholder) {
      const isDoctorPage = fileName === "dokter.html";
      const link = createElement("a", "button button-primary", isDoctorPage ? "Kelola tenaga kesehatan" : "Kelola poliklinik");
      link.href = "manajemen-data.html";
      placeholder.replaceChildren(
        createElement("span", "eyebrow", "MANAJEMEN DATA"),
        createElement("h2", "", isDoctorPage ? "Data dokter dan staf terpusat" : "Data poliklinik terpusat"),
        createElement("p", "", "Data master dikelola pada satu sumber bersama agar konsisten dengan jadwal, admisi, dan pelayanan pasien."),
        link
      );
    }
  }

  const moduleNavigation = [
    ["farmasi.html", "Farmasi", "✚"],
    ["rawat-inap.html", "Rawat Inap", "▦"],
    ["laboratorium.html", "Laboratorium", "⚗"],
    ["radiologi.html", "Radiologi", "◉"],
    ["kasir.html", "Kasir", "Rp"],
    ["manajemen-data.html", "Manajemen Data", "⚙"],
    ["pengaturan.html", "Pengaturan Sistem", "☷"]
  ];
  const navigationReference = document.querySelector("[data-nav]");
  const navigationContainer = navigationReference ? navigationReference.closest("nav") || navigationReference.parentElement : null;
  if (navigationContainer) {
    moduleNavigation.forEach(([href, label, icon]) => {
      if (!canAccessPage(currentRole, href)) {
        return;
      }
      let link = document.querySelector(`[data-nav="${href}"]`);
      if (!link) {
        link = navigationReference.cloneNode(true);
        link.href = href;
        link.dataset.nav = href;
        link.removeAttribute("aria-current");
        link.classList.remove("active");
        const iconElement = link.querySelector("span");
        if (iconElement) {
          iconElement.textContent = icon;
        }
        const labelElement = link.querySelectorAll("span")[1];
        if (labelElement) {
          labelElement.textContent = label;
        } else {
          link.append(document.createTextNode(` ${label}`));
        }
        navigationContainer.append(link);
      }
    });
  }
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.hidden = !canAccessPage(currentRole, link.dataset.nav);
  });
  document.querySelectorAll("a[href]").forEach((link) => {
    const target = String(link.getAttribute("href") || "").split("#")[0].split("/").pop();
    if (pageInfo[target] && !canAccessPage(currentRole, target)) {
      link.hidden = true;
    }
  });

  const activeNavigationFile = fileName === "detail-kunjungan.html" ? "rawat-jalan.html" : fileName;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === activeNavigationFile) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  if (isDashboardPage) {
    const dashboardRoot = document.querySelector(".page-content");
    if (dashboardRoot) {
      try {
        const data = ensureModuleCollections(readRegistrationData());
        const dashboardCounts = {
          "Total Pasien": data.patients.length,
          "Kunjungan Hari Ini": data.visits.filter((visit) => visit.visitDate === getLocalDate()).length,
          "Dokter Bertugas": data.staff.filter((staff) => staff.role === "doctor" && staff.status !== "Nonaktif").length,
          "Menunggu Pelayanan": data.visits.filter((visit) => visit.status === "Menunggu" || visit.status === "Dipanggil").length
        };
        document.querySelectorAll(".stat-card").forEach((card) => {
          const label = card.querySelector(".stat-label");
          const value = card.querySelector(".stat-value");
          if (label && value && Object.prototype.hasOwnProperty.call(dashboardCounts, label.textContent.trim())) {
            value.textContent = Number(dashboardCounts[label.textContent.trim()]).toLocaleString("id-ID");
          }
        });
        const activityPanel = [...document.querySelectorAll(".panel")].find((panel) =>
          panel.querySelector("h2") && panel.querySelector("h2").textContent.trim() === "Aktivitas pelayanan"
        );
        if (activityPanel) {
          const todayVisits = data.visits.filter((visit) => visit.visitDate === getLocalDate());
          const activityCounts = [
            todayVisits.length,
            todayVisits.filter((visit) => visit.status === "Selesai").length,
            todayVisits.filter((visit) => visit.status === "Menunggu" || visit.status === "Dipanggil").length
          ];
          activityPanel.querySelectorAll("strong").forEach((value, index) => {
            if (index < activityCounts.length) {
              value.textContent = String(activityCounts[index]).padStart(index === 2 ? 2 : 1, "0");
            }
          });
        }
        const allowedLinks = Object.entries(pageInfo)
          .filter(([page]) => canAccessPage(currentRole, page))
          .slice(0, currentRole === "admin" ? 7 : 6);
        const panel = createElement("section", "panel role-dashboard-panel");
        const heading = createElement("div", "role-dashboard-heading");
        const headingCopy = createElement("div", "");
        headingCopy.append(
          createElement("span", "eyebrow", roleLabels[currentRole] || "DASHBOARD"),
          createElement("h2", "", "Ringkasan tugas"),
          createElement("p", "", "Akses cepat dan indikator operasional untuk peran Anda.")
        );
        heading.append(headingCopy);
        const metrics = createElement("div", "role-dashboard-metrics");
        [
          ["Pasien", data.patients.length],
          ["Kunjungan", data.visits.length],
          ["Rawat inap aktif", data.admissions.filter((admission) => admission.status !== "Pulang").length],
          ["Permintaan penunjang", data.labOrders.length + data.radiologyOrders.length]
        ].forEach(([label, count]) => {
          const metric = createElement("div", "role-dashboard-metric");
          metric.append(createElement("small", "", label), createElement("strong", "", String(count)));
          metrics.append(metric);
        });
        const links = createElement("div", "role-dashboard-links");
        allowedLinks.forEach(([page, info]) => {
          const link = createElement("a", "role-dashboard-link");
          link.href = page;
          link.append(
            createElement("span", "role-dashboard-link-icon", info.icon),
            createElement("span", "", info.title),
            createElement("span", "role-dashboard-link-arrow", "›")
          );
          links.append(link);
        });
        panel.append(heading, metrics, links);
        const welcome = dashboardRoot.querySelector(".welcome-row");
        if (welcome) {
          welcome.after(panel);
        } else {
          dashboardRoot.prepend(panel);
        }
      } catch (error) {
        const warning = createElement("div", "report-load-error", `Ringkasan tugas tidak dapat dimuat: ${error.message}`);
        dashboardRoot.prepend(warning);
      }
    }
  }

  const loginForm = document.querySelector("#loginForm");
  if (loginForm) {
    if (!document.querySelector("#demoAccountsList")) {
      const demoDetails = createElement("details", "demo-accounts-list");
      demoDetails.id = "demoAccountsList";
      demoDetails.append(createElement("summary", "", "Akun demo untuk presentasi"));
      const accountList = createElement("div", "demo-accounts-grid");
      demoAccounts.forEach((account) => {
        const item = createElement("div", "demo-account-item");
        item.append(
          createElement("strong", "", roleLabels[account.role]),
          createElement("span", "", `Username: ${account.username}`),
          createElement("span", "", `Password: ${account.password}`)
        );
        accountList.append(item);
      });
      demoDetails.append(accountList);
      loginForm.insertAdjacentElement("afterend", demoDetails);
    }
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(loginForm);
      const username = String(values.get("username") || "").trim();
      const passwordField = loginForm.querySelector('[name="password"]') || loginForm.querySelector("#password");
      const password = String(values.get("password") || (passwordField && passwordField.value) || "");
      const message = document.querySelector("#loginMessage");
      if (!username) {
        message.textContent = "Nama pengguna wajib diisi.";
        return;
      }

      const account = demoAccounts.find((record) => record.username === username.toLowerCase());
      let loginAccount = account;
      if (!loginAccount) {
        try {
          const data = readRegistrationData();
          loginAccount = Array.isArray(data.userAccounts)
            ? data.userAccounts.find((record) =>
              String(record.username || "").toLowerCase() === username.toLowerCase() &&
              record.status === "Aktif" && record.password === password && roleLabels[record.role])
            : null;
        } catch (error) {
          message.textContent = `Data akun tidak dapat dibaca: ${error.message}`;
          return;
        }
      }
      if (passwordField && (!loginAccount || loginAccount.password !== password)) {
        message.textContent = "Nama pengguna atau kata sandi tidak sesuai. Gunakan akun demo yang tersedia.";
        return;
      }

      try {
        localStorage.setItem(sessionKey, username);
        localStorage.setItem(roleStorageKey, loginAccount ? loginAccount.role : "admin");
        window.location.assign("dashboard.html");
      } catch (error) {
        message.textContent = "Sesi tidak dapat disimpan di browser ini. Periksa pengaturan penyimpanan browser.";
      }
    });
  }

  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const password = document.querySelector("#password");
      const showPassword = password.type === "password";
      password.type = showPassword ? "text" : "password";
      button.setAttribute("aria-label", showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
    });
  });

  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", () => {
      try {
        localStorage.removeItem(sessionKey);
        localStorage.removeItem(roleStorageKey);
        window.location.assign("index.html");
      } catch (error) {
        window.location.assign("index.html");
      }
    });
  });

  const shell = document.querySelector(".app-shell");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const sidebarClose = document.querySelector("[data-sidebar-close]");
  if (shell && menuToggle && sidebarClose) {
    menuToggle.addEventListener("click", () => shell.classList.toggle("sidebar-open"));
    sidebarClose.addEventListener("click", () => shell.classList.remove("sidebar-open"));
  }

  initializeRegistration();
  initializePatientList();
  initializeVisitList();
  initializeVisitDetail();
  initializeExamination();
  initializeMedicalRecords();
  initializeIcdCoding();
  initializeCodingReport();
})();
