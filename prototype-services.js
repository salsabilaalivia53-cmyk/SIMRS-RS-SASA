(() => {
  "use strict";

  const moduleName = document.body && document.body.dataset.prototypeModule;
  const root = document.querySelector("[data-prototype-root]");
  if (!root || !["laboratorium", "radiologi", "kasir"].includes(moduleName)) return;

  const collections = [
    "patients", "visits", "examinations", "medications", "pharmacyOrders",
    "stockTransactions", "admissions", "beds", "rooms", "staff", "clinics",
    "activityLog", "invoices", "payments", "labOrders", "radiologyOrders"
  ];
  const tariffsKey = "prototypeSimulated";
  const defaultTariffs = Object.freeze({
    visit: 15000,
    procedure: 50000,
    medicineUnit: 5000,
    laboratory: 75000,
    radiology: 150000,
    inpatientDaily: 250000
  });
  const statuses = ["Menunggu", "Diproses", "Selesai", "Dibatalkan"];
  const statusFlow = {
    Menunggu: ["Menunggu", "Diproses", "Dibatalkan"],
    Diproses: ["Diproses", "Selesai", "Dibatalkan"],
    Selesai: ["Selesai"],
    Dibatalkan: ["Dibatalkan"]
  };
  let renderModule = () => {};
  const $ = (selector) => root.querySelector(selector);
  const text = (value) => String(value == null ? "" : value);
  const now = () => new Date().toISOString();
  const localDate = () => window.SIMRSSasa.getLocalDate();
  const money = (value) => new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0
  }).format(value);
  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? text(value)
      : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
  };
  const escapeHtml = (value) => text(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[character]));

  const readData = () => {
    if (!window.SIMRSSasa || typeof window.SIMRSSasa.readData !== "function" ||
      typeof window.SIMRSSasa.ensureCollections !== "function" ||
      typeof window.SIMRSSasa.saveData !== "function") {
      throw new Error("Layanan data bersama SIMRS belum tersedia. Muat script.js sebelum modul ini.");
    }
    const data = window.SIMRSSasa.readData();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Akar data bersama tidak valid.");
    }
    const missing = collections.filter((key) => data[key] === undefined);
    window.SIMRSSasa.ensureCollections(data);
    if (data.examinations === undefined) {
      data.examinations = [];
      missing.push("examinations");
    }
    if (data.tariffs === undefined) {
      data.tariffs = {};
      missing.push("tariffs");
    }
    if (!data.tariffs || typeof data.tariffs !== "object" || Array.isArray(data.tariffs)) {
      throw new Error("Struktur tarif layanan tidak valid.");
    }
    collections.forEach((key) => {
      if (!Array.isArray(data[key])) throw new Error(`Struktur data ${key} tidak valid.`);
      if (data[key].some((record) => !record || typeof record !== "object" || Array.isArray(record))) {
        throw new Error(`Ada baris data yang tidak valid pada ${key}.`);
      }
    });
    if (missing.length) window.SIMRSSasa.saveData(data);
    return data;
  };

  const showAlert = (message, type) => {
    const alert = $("[data-alert]");
    if (!alert) return;
    alert.textContent = message;
    alert.hidden = !message;
    alert.dataset.type = type || "error";
  };

  const saveMutation = (change, message) => {
    try {
      const data = readData();
      change(data);
      if (!Array.isArray(data.activityLog)) throw new Error("Struktur data activityLog tidak valid.");
      data.activityLog.push({
        id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        module: moduleName,
        action: message,
        createdAt: now()
      });
      window.SIMRSSasa.saveData(data);
      showAlert(message, "success");
      renderModule();
      return true;
    } catch (error) {
      showAlert(`Perubahan tidak tersimpan: ${error.message}`);
      return false;
    }
  };

  const patientFor = (data, medicalRecordNumber) => {
    const matches = data.patients.filter((patient) => patient.medicalRecordNumber === medicalRecordNumber);
    if (matches.length > 1) throw new Error(`No. RM ${text(medicalRecordNumber)} tidak unik pada data pasien.`);
    return matches[0] || null;
  };
  const visitFor = (data, registrationNumber) => {
    const matches = data.visits.filter((visit) => visit.registrationNumber === registrationNumber);
    if (matches.length > 1) throw new Error(`Nomor registrasi ${text(registrationNumber)} tidak unik pada data kunjungan.`);
    return matches[0] || null;
  };
  const nextId = (prefix, existing) => {
    const date = localDate().replace(/-/g, "");
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`^${escapedPrefix}-${date}-(\\d{4})$`);
    let highest = 0;
    existing.forEach((record) => {
      const match = text(record.id).match(pattern);
      if (match) highest = Math.max(highest, Number(match[1]));
    });
    return `${prefix}-${date}-${String(highest + 1).padStart(4, "0")}`;
  };

  const setSummary = (name, value) => {
    const element = $(`[data-summary="${name}"]`);
    if (element) element.textContent = String(value);
  };
  const statusClass = (status) => {
    if (status === "Selesai" || status === "Lunas" || status === "Berhasil") return "status-completed";
    if (status === "Diproses" || status === "Menunggu Penjaminan") return "status-called";
    if (status === "Dibatalkan") return "status-cancelled";
    return "status-waiting";
  };

  const initDiagnostics = () => {
    const type = moduleName === "radiologi" ? "radiology" : "laboratory";
    const collectionName = type === "radiology" ? "radiologyOrders" : "labOrders";
    const prefix = type === "radiology" ? "RAD" : "LAB";
    const collectionTitle = type === "radiology" ? "radiologi" : "laboratorium";
    const list = $("[data-order-list]");
    const empty = $("[data-empty]");
    const search = $("[data-search]");
    const statusFilter = $("[data-status-filter]");
    const manualForm = $("[data-manual-form]");
    const editorPanel = $("[data-editor-panel]");
    const resultForm = $("[data-result-form]");
    let currentOrderId = "";
    let currentOrder = null;
    let currentPatient = null;

    const readSearchValue = () => (search ? search.value.trim().toLocaleLowerCase("id") : "");
    const renderVisits = (data) => {
      const select = manualForm.elements.visit;
      const selectedValue = select.value;
      const orphan = data.visits.find((visit) => visit.status !== "Batal" && visit.registrationNumber &&
        visit.medicalRecordNumber && !patientFor(data, visit.medicalRecordNumber));
      if (orphan) {
        showAlert(`Kunjungan ${text(orphan.registrationNumber)} tidak dapat dipakai: pasien No. RM ${text(orphan.medicalRecordNumber)} tidak ditemukan.`);
      }
      select.replaceChildren(new Option("Pilih kunjungan", ""));
      data.visits.filter((visit) => visit.status !== "Batal" && visit.registrationNumber &&
        visit.medicalRecordNumber && patientFor(data, visit.medicalRecordNumber))
        .sort((a, b) => text(b.visitDate).localeCompare(text(a.visitDate)))
        .forEach((visit) => {
          const patient = patientFor(data, visit.medicalRecordNumber);
          const option = new Option(
            `${patient.fullName} · RM ${patient.medicalRecordNumber} · ${visit.registrationNumber} · ${formatDate(visit.visitDate)}`,
            visit.registrationNumber
          );
          select.add(option);
        });
      if (selectedValue && Array.from(select.options).some((option) => option.value === selectedValue)) {
        select.value = selectedValue;
      }
    };

    const renderList = (data) => {
      const orders = data[collectionName].slice().sort((a, b) =>
        text(b.requestedAt || b.createdAt || b.visitDate).localeCompare(text(a.requestedAt || a.createdAt || a.visitDate))
      );
      const query = readSearchValue();
      const selectedStatus = statusFilter.value;
      const filtered = orders.filter((order) => {
        const patient = patientFor(data, order.medicalRecordNumber);
        const searchable = [
          order.id, order.registrationNumber, order.medicalRecordNumber,
          order.testName, order.doctor, order.source, patient && patient.fullName
        ].join(" ").toLocaleLowerCase("id");
        return (!query || searchable.includes(query)) && (!selectedStatus || order.status === selectedStatus);
      });
      list.replaceChildren();
      filtered.forEach((order) => {
        const patient = patientFor(data, order.medicalRecordNumber);
        const row = document.createElement("tr");
        const orderCell = document.createElement("td");
        const primary = document.createElement("strong");
        primary.className = "table-primary-text";
        primary.textContent = text(order.id || "Order tanpa nomor");
        const secondary = document.createElement("small");
        secondary.className = "table-secondary-text";
        secondary.textContent = formatDate(order.visitDate || order.requestedAt);
        orderCell.append(primary, secondary);
        const patientCell = document.createElement("td");
        const patientName = document.createElement("strong");
        patientName.className = `table-primary-text${patient ? "" : " missing-patient"}`;
        patientName.textContent = patient ? text(patient.fullName) : "Pasien tidak ditemukan";
        const patientNumber = document.createElement("small");
        patientNumber.className = "table-secondary-text";
        patientNumber.textContent = `No. RM ${text(order.medicalRecordNumber || "tidak tercatat")}`;
        patientCell.append(patientName, patientNumber);
        const testCell = document.createElement("td");
        testCell.textContent = text(order.testName || "Pemeriksaan tidak tercatat");
        const doctorCell = document.createElement("td");
        doctorCell.textContent = `${text(order.doctor || "—")} · ${text(order.source || "Sumber tidak tercatat")}`;
        const statusCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `visit-status-badge ${statusClass(order.status)}`;
        badge.textContent = text(order.status || "Status tidak tercatat");
        statusCell.append(badge);
        const actionCell = document.createElement("td");
        const open = document.createElement("button");
        open.type = "button";
        open.className = "button button-small button-secondary";
        open.textContent = order.status === "Selesai" ? "Lihat hasil" : "Input hasil";
        open.disabled = !patient;
        open.addEventListener("click", () => openEditor(order.id));
        actionCell.append(open);
        row.append(orderCell, patientCell, testCell, doctorCell, statusCell, actionCell);
        list.append(row);
      });
      empty.hidden = filtered.length > 0;
      setSummary("total", orders.length);
      setSummary("pending", orders.filter((order) => order.status === "Menunggu" || order.status === "Diproses").length);
      setSummary("done", orders.filter((order) => order.status === "Selesai").length);
      if (orders.length && !filtered.length) {
        empty.querySelector("strong").textContent = "Tidak ada order yang cocok";
        empty.querySelector("p").textContent = "Ubah kata pencarian atau filter status.";
      } else {
        empty.querySelector("strong").textContent = `Belum ada order ${collectionTitle}`;
        empty.querySelector("p").textContent = "Permintaan dokter atau order manual akan ditampilkan di sini.";
      }
    };

    const openEditor = (orderId) => {
      try {
        const data = readData();
        const order = data[collectionName].find((record) => record.id === orderId);
        if (!order) throw new Error("Order tidak lagi tersedia pada data bersama.");
        const patient = patientFor(data, order.medicalRecordNumber);
        if (!patient) throw new Error("Identitas pasien dari No. RM order tidak ditemukan. Hasil tidak dapat diedit.");
        if (!statuses.includes(order.status)) throw new Error(`Status order tidak dikenal: ${text(order.status)}.`);
        currentOrderId = order.id;
        currentOrder = order;
        currentPatient = patient;
        $("[data-editor-title]").textContent = `Hasil ${text(order.testName)}`;
        $("[data-patient-banner]").textContent =
          `${patient.fullName} · No. RM ${patient.medicalRecordNumber} · ${order.registrationNumber} · ${formatDate(order.visitDate)}`;
        resultForm.elements.result.value = text(order.result);
        if (resultForm.elements.reference) resultForm.elements.reference.value = text(order.reference);
        resultForm.elements.conclusion.value = text(order.conclusion);
        resultForm.elements.status.value = order.status;
        const immutable = order.status === "Selesai" || order.status === "Dibatalkan";
        Array.from(resultForm.elements).forEach((element) => {
          if (element.name) element.disabled = immutable;
        });
        const submit = resultForm.querySelector('button[type="submit"]');
        submit.hidden = immutable;
        $("[data-print-result]").disabled = order.status !== "Selesai";
        editorPanel.hidden = false;
        editorPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        showAlert("");
      } catch (error) {
        showAlert(`Order tidak dapat dibuka: ${error.message}`);
      }
    };

    manualForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const registrationNumber = manualForm.elements.visit.value;
      const testName = manualForm.elements.testName.value.trim();
      if (!registrationNumber || !testName) {
        showAlert("Pilih kunjungan dan isi nama pemeriksaan.");
        return;
      }
      const saved = saveMutation((data) => {
        const visit = visitFor(data, registrationNumber);
        if (!visit || visit.status === "Batal") throw new Error("Kunjungan tidak tersedia atau sudah dibatalkan.");
        const patient = patientFor(data, visit.medicalRecordNumber);
        if (!patient) throw new Error("No. RM kunjungan tidak memiliki identitas pasien yang terdaftar.");
        const orderId = nextId(prefix, data[collectionName]);
        data[collectionName].push({
          id: orderId,
          registrationNumber: visit.registrationNumber,
          medicalRecordNumber: patient.medicalRecordNumber,
          testName,
          doctor: text(visit.doctor || ""),
          visitDate: text(visit.visitDate || localDate()),
          status: "Menunggu",
          result: "",
          ...(type === "laboratory" ? { reference: "" } : {}),
          conclusion: "",
          requestedAt: now(),
          source: "Order Manual"
        });
      }, `Order ${collectionTitle} berhasil dibuat.`);
      if (saved) manualForm.elements.testName.value = "";
    });

    resultForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = resultForm.elements.result.value.trim();
      const reference = resultForm.elements.reference ? resultForm.elements.reference.value.trim() : "";
      const conclusion = resultForm.elements.conclusion.value.trim();
      const newStatus = resultForm.elements.status.value;
      if (!result) {
        showAlert("Hasil pemeriksaan wajib diisi.");
        return;
      }
      if (type === "radiology" && newStatus === "Selesai" && !conclusion) {
        showAlert("Kesimpulan wajib diisi sebelum order radiologi diselesaikan.");
        return;
      }
      const saved = saveMutation((data) => {
        const order = data[collectionName].find((record) => record.id === currentOrderId);
        if (!order) throw new Error("Order tidak ditemukan saat menyimpan.");
        if (!patientFor(data, order.medicalRecordNumber)) throw new Error("No. RM order tidak memiliki pasien terdaftar.");
        if (!statusFlow[order.status] || !statusFlow[order.status].includes(newStatus)) {
          throw new Error(`Perubahan status ${text(order.status)} ke ${newStatus} tidak diizinkan.`);
        }
        if (order.status === "Selesai" || order.status === "Dibatalkan") {
          throw new Error("Order final tidak dapat diubah.");
        }
        order.result = result;
        if (type === "laboratory") order.reference = reference;
        order.conclusion = conclusion;
        if (!Array.isArray(order.statusHistory)) {
          if (order.statusHistory !== undefined) throw new Error("Riwayat status order tidak valid.");
          order.statusHistory = [];
        }
        if (order.status !== newStatus) {
          order.statusHistory.push({ from: order.status, to: newStatus, changedAt: now() });
        }
        order.status = newStatus;
        order.resultUpdatedAt = now();
      }, `Hasil order ${collectionTitle} berhasil disimpan.`);
      if (saved) openEditor(currentOrderId);
    });

    $("[data-close-editor]").addEventListener("click", () => { editorPanel.hidden = true; });
    $("[data-print-result]").addEventListener("click", () => {
      if (!currentOrder || !currentPatient || currentOrder.status !== "Selesai") {
        showAlert("Hanya hasil selesai dengan pasien terdaftar yang dapat dicetak.");
        return;
      }
      const visit = visitFor(readData(), currentOrder.registrationNumber);
      printDocument(`${type === "radiology" ? "Hasil Radiologi" : "Hasil Laboratorium"}`, `
        <h1>${type === "radiology" ? "Hasil Radiologi" : "Hasil Laboratorium"}</h1>
        <p><b>SIMRS SASA · Dokumen simulasi</b></p>
        <hr><p><b>Pasien:</b> ${escapeHtml(currentPatient.fullName)}<br>
        <b>No. RM:</b> ${escapeHtml(currentPatient.medicalRecordNumber)}<br>
        <b>No. Registrasi:</b> ${escapeHtml(currentOrder.registrationNumber)}<br>
        <b>Tanggal:</b> ${escapeHtml(formatDate(currentOrder.visitDate))}<br>
        <b>Pemeriksaan:</b> ${escapeHtml(currentOrder.testName)}<br>
        <b>Dokter:</b> ${escapeHtml(currentOrder.doctor || (visit && visit.doctor) || "—")}</p>
        <h3>Hasil</h3><p>${escapeHtml(currentOrder.result).replace(/\n/g, "<br>")}</p>
        ${type === "laboratory" ? `<h3>Nilai rujukan</h3><p>${escapeHtml(currentOrder.reference || "—").replace(/\n/g, "<br>")}</p>` : ""}
        <h3>Kesimpulan</h3><p>${escapeHtml(currentOrder.conclusion || "—").replace(/\n/g, "<br>")}</p>
        <p><b>Status:</b> ${escapeHtml(currentOrder.status)}</p><p class="fine">Hasil demonstrasi, bukan dokumen klinis resmi.</p>
      `);
    });
    search.addEventListener("input", () => { try { renderList(readData()); } catch (error) { showAlert(error.message); } });
    statusFilter.addEventListener("change", () => { try { renderList(readData()); } catch (error) { showAlert(error.message); } });

    const render = () => {
      try {
        const data = readData();
        renderVisits(data);
        renderList(data);
      } catch (error) {
        showAlert(`Data ${collectionTitle} tidak dapat dimuat: ${error.message}`);
      }
    };
    renderModule = render;
    render();
  };

  const initCashier = () => {
    const invoiceForm = $("[data-invoice-form]");
    const invoiceView = $("[data-invoice-view]");
    const historyBody = $("[data-invoice-history]");
    const historyEmpty = $("[data-invoice-empty]");
    const search = $("[data-cash-search]");
    const tariffForm = $("[data-tariff-form]");
    const paymentForm = $("[data-payment-form]");
    let activeRegistration = "";
    let activeInvoiceId = "";
    let activeQuote = [];
    let activeTotal = 0;

    const tariffsFrom = (data) => {
      const configured = data.tariffs[tariffsKey];
      if (configured === undefined) {
        data.tariffs[tariffsKey] = Object.assign({}, defaultTariffs, {
          visit: Number.isSafeInteger(data.tariffs.registration) ? data.tariffs.registration : defaultTariffs.visit,
          procedure: Number.isSafeInteger(data.tariffs.doctor) ? data.tariffs.doctor : defaultTariffs.procedure,
          laboratory: Number.isSafeInteger(data.tariffs.laboratory) ? data.tariffs.laboratory : defaultTariffs.laboratory,
          radiology: Number.isSafeInteger(data.tariffs.radiology) ? data.tariffs.radiology : defaultTariffs.radiology,
          inpatientDaily: Number.isSafeInteger(data.tariffs.bedPerDay) ? data.tariffs.bedPerDay : defaultTariffs.inpatientDaily
        });
        window.SIMRSSasa.saveData(data);
        return data.tariffs[tariffsKey];
      }
      if (!configured || typeof configured !== "object" || Array.isArray(configured)) {
        throw new Error("Konfigurasi tarif simulasi tidak valid.");
      }
      Object.keys(defaultTariffs).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(configured, key) ||
          typeof configured[key] !== "number" || !Number.isFinite(configured[key]) ||
          configured[key] < 0 || !Number.isSafeInteger(configured[key])) {
          throw new Error(`Tarif simulasi "${key}" kosong atau tidak valid. Perbaiki konfigurasi secara eksplisit.`);
        }
      });
      return configured;
    };

    const visitOptions = (data) => {
      const select = invoiceForm.elements.visit;
      const selected = select.value;
      const orphan = data.visits.find((visit) => visit.status !== "Batal" && visit.registrationNumber &&
        visit.medicalRecordNumber && !patientFor(data, visit.medicalRecordNumber));
      if (orphan) {
        showAlert(`Kunjungan ${text(orphan.registrationNumber)} tidak dapat ditagihkan: pasien No. RM ${text(orphan.medicalRecordNumber)} tidak ditemukan.`);
      }
      select.replaceChildren(new Option("Pilih kunjungan", ""));
      data.visits.filter((visit) => visit.status !== "Batal" && visit.registrationNumber &&
        visit.medicalRecordNumber && patientFor(data, visit.medicalRecordNumber))
        .sort((a, b) => text(b.visitDate).localeCompare(text(a.visitDate)))
        .forEach((visit) => {
          const patient = patientFor(data, visit.medicalRecordNumber);
          select.add(new Option(
            `${patient.fullName} · RM ${patient.medicalRecordNumber} · ${visit.registrationNumber} · ${formatDate(visit.visitDate)}`,
            visit.registrationNumber
          ));
        });
      if (selected && Array.from(select.options).some((option) => option.value === selected)) select.value = selected;
    };

    const invoiceFor = (data, registrationNumber) => {
      const matches = data.invoices.filter((invoice) => invoice.prototypeType === "simulasi" &&
        invoice.registrationNumber === registrationNumber);
      if (matches.length > 1) throw new Error(`Terdapat lebih dari satu tagihan simulasi untuk ${text(registrationNumber)}.`);
      return matches[0] || null;
    };

    const validateTariffSnapshot = (snapshot) => {
      if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
        throw new Error("Snapshot tarif tagihan tidak valid.");
      }
      Object.keys(defaultTariffs).forEach((key) => {
        if (typeof snapshot[key] !== "number" || !Number.isSafeInteger(snapshot[key]) || snapshot[key] < 0) {
          throw new Error(`Snapshot tarif tagihan memiliki nilai ${key} yang tidak valid.`);
        }
      });
    };

    const validateInvoice = (invoice) => {
      if (!invoice.id || !invoice.registrationNumber || !invoice.medicalRecordNumber ||
        !Number.isSafeInteger(invoice.total) || invoice.total < 0 ||
        !["Belum Dibayar", "Lunas", "Menunggu Penjaminan"].includes(invoice.status) ||
        !Array.isArray(invoice.sourceRefs)) {
        throw new Error(`Struktur tagihan ${text(invoice.id || "(tanpa nomor)")} tidak valid.`);
      }
      validateTariffSnapshot(invoice.tariffSnapshot);
      return invoice;
    };

    const validateInvoicePayments = (data, invoice) => {
      const related = data.payments.filter((payment) => payment.invoiceId === invoice.id);
      related.forEach((payment) => {
        if (!payment.transactionId || !Number.isSafeInteger(payment.amount) || payment.amount < 0 ||
          !["tunai", "transfer", "BPJS"].includes(payment.method) ||
          !["Berhasil", "Menunggu Penjaminan", "Gagal"].includes(payment.status)) {
          throw new Error(`Struktur transaksi tagihan ${text(invoice.id)} tidak valid.`);
        }
      });
      if (invoice.status === "Lunas" && !related.some((payment) => payment.status === "Berhasil")) {
        throw new Error(`Tagihan ${text(invoice.id)} berstatus lunas tanpa transaksi berhasil.`);
      }
      if (invoice.status === "Menunggu Penjaminan" &&
        !related.some((payment) => payment.status === "Menunggu Penjaminan")) {
        throw new Error(`Tagihan ${text(invoice.id)} menunggu penjaminan tanpa transaksi BPJS.`);
      }
      return related;
    };

    const buildLines = (data, visit, tariffs) => {
      const lines = [];
      const add = (kind, label, detail, amount, ref) => {
        if (!Number.isSafeInteger(amount) || amount < 0) throw new Error(`Jumlah tarif tidak valid pada ${label}.`);
        lines.push({ kind, label, detail, amount, ref });
      };
      add("visit", "Biaya pendaftaran / kunjungan", text(visit.poliName || visit.poliCode || "Rawat jalan"), tariffs.visit, {
        collection: "visits", id: text(visit.registrationNumber)
      });
      const examination = data.examinations.find((record) =>
        record.registrationNumber === visit.registrationNumber) || null;
      if (examination) {
        add("examination", "Pemeriksaan dokter", text(examination.primaryDiagnosis || examination.visitDate || "Pemeriksaan tersimpan"), tariffs.procedure, {
          collection: "examinations", id: text(examination.registrationNumber)
        });
        if (text(examination.medicalActions).trim()) {
          add("procedure", "Tindakan medis", text(examination.medicalActions), tariffs.procedure, {
            collection: "examinations", id: text(examination.registrationNumber)
          });
        }
      }
      data.pharmacyOrders.filter((order) => order.registrationNumber === visit.registrationNumber &&
        order.status !== "Dibatalkan").forEach((order) => {
        if (!Array.isArray(order.items)) throw new Error(`Rincian resep ${text(order.id)} tidak valid.`);
        order.items.forEach((item, index) => {
          const quantity = Number(item.quantity);
          if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error(`Jumlah obat ${text(item.medicineName || item.id || index + 1)} tidak valid; periksa order farmasi.`);
          }
          const medication = data.medications.find((record) => record.id === item.medicationId) ||
            data.medications.find((record) => text(record.name).trim().toLocaleLowerCase("id") === text(item.medicineName).trim().toLocaleLowerCase("id"));
          const unitPrice = medication ? Number(medication.price) : tariffs.medicineUnit;
          if (!Number.isSafeInteger(unitPrice) || unitPrice < 0) {
            throw new Error(`Harga obat ${text(item.medicineName || item.id || index + 1)} tidak valid pada master farmasi.`);
          }
          const amount = Math.round(quantity * unitPrice);
          const unit = medication ? text(medication.unit || "unit") : "unit";
          add("medicine", text(item.medicineName || "Obat"), `${quantity} ${unit} × ${money(unitPrice)} · resep ${text(order.id)}`, amount, {
            collection: "pharmacyOrders", id: text(order.id), item: index
          });
        });
      });
      ["labOrders", "radiologyOrders"].forEach((collection) => {
        data[collection].filter((order) => order.registrationNumber === visit.registrationNumber &&
          order.status !== "Dibatalkan").forEach((order) => {
          add(collection === "labOrders" ? "laboratory" : "radiology",
            collection === "labOrders" ? "Laboratorium" : "Radiologi",
            `${text(order.testName || "Pemeriksaan")} · ${text(order.id)}`,
            collection === "labOrders" ? tariffs.laboratory : tariffs.radiology,
            { collection, id: text(order.id) });
        });
      });
      data.admissions.filter((admission) => admission.registrationNumber === visit.registrationNumber ||
        (admission.registrationNumber == null && admission.medicalRecordNumber === visit.medicalRecordNumber &&
          admission.visitDate === visit.visitDate)).forEach((admission) => {
        const startValue = admission.admissionDate || admission.admittedAt || admission.createdAt;
        if (!startValue || Number.isNaN(new Date(startValue).getTime())) {
          throw new Error(`Tanggal admisi ${text(admission.id || admission.registrationNumber)} tidak valid.`);
        }
        let endValue = admission.dischargeDate || admission.dischargedAt;
        if (!endValue) {
          const activeStatuses = ["aktif", "dirawat", "rawat inap", "active", "inpatient"];
          if (!activeStatuses.includes(text(admission.status).trim().toLocaleLowerCase("id"))) {
            throw new Error(`Tanggal pulang admisi ${text(admission.id || admission.registrationNumber)} belum tercatat.`);
          }
          endValue = localDate();
        }
        if (Number.isNaN(new Date(endValue).getTime())) {
          throw new Error(`Tanggal pulang admisi ${text(admission.id || admission.registrationNumber)} tidak valid.`);
        }
        const start = new Date(`${String(startValue).slice(0, 10)}T00:00:00`);
        const end = new Date(`${String(endValue).slice(0, 10)}T00:00:00`);
        if (end < start) throw new Error(`Tanggal pulang admisi ${text(admission.id || admission.registrationNumber)} lebih awal dari tanggal masuk.`);
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1);
        add("inpatient", "Rawat inap", `${days} hari · admisi ${text(admission.id || admission.registrationNumber || "")}`,
          days * tariffs.inpatientDaily, { collection: "admissions", id: text(admission.id || admission.registrationNumber) });
      });
      return lines;
    };

    const invoiceLines = (data, invoice) => {
      validateInvoice(invoice);
      const visit = visitFor(data, invoice.registrationNumber);
      if (!visit) throw new Error("Kunjungan sumber tagihan tidak lagi tersedia.");
      if (!patientFor(data, invoice.medicalRecordNumber)) throw new Error("No. RM tagihan tidak lagi memiliki pasien terdaftar.");
      return buildLines(data, visit, invoice.tariffSnapshot);
    };

    const renderQuote = (data, registrationNumber) => {
      const visit = visitFor(data, registrationNumber);
      if (!visit) throw new Error("Kunjungan tidak ditemukan.");
      const patient = patientFor(data, visit.medicalRecordNumber);
      if (!patient) throw new Error("No. RM kunjungan tidak memiliki pasien terdaftar.");
      const existing = invoiceFor(data, registrationNumber);
      if (existing) validateInvoice(existing);
      const existingPayments = existing ? validateInvoicePayments(data, existing) : [];
      const paymentExists = existingPayments.some((payment) => payment.status !== "Gagal");
      if (existing && (existing.status === "Lunas" || existing.status === "Menunggu Penjaminan") && !paymentExists) {
        throw new Error(`Status tagihan ${text(existing.id)} tidak sesuai dengan riwayat transaksi.`);
      }
      const tariffs = existing && paymentExists ? existing.tariffSnapshot : tariffsFrom(data);
      const lines = buildLines(data, visit, tariffs);
      const total = lines.reduce((sum, line) => sum + line.amount, 0);
      if (!Number.isSafeInteger(total)) throw new Error("Total tagihan melebihi batas nilai aman.");
      if (existing) {
        activeInvoiceId = existing.id;
        if (!paymentExists) {
          existing.total = total;
          existing.sourceRefs = lines.map((line) => line.ref);
          existing.updatedAt = now();
          existing.status = "Belum Dibayar";
          window.SIMRSSasa.saveData(data);
        }
      } else {
        const invoice = {
          id: nextId("INV", data.invoices),
          prototypeType: "simulasi",
          registrationNumber: visit.registrationNumber,
          medicalRecordNumber: patient.medicalRecordNumber,
          issuedAt: now(),
          updatedAt: now(),
          total,
          status: "Belum Dibayar",
          tariffSnapshot: Object.assign({}, tariffs),
          sourceRefs: lines.map((line) => line.ref),
          statusHistory: [{ status: "Belum Dibayar", changedAt: now() }]
        };
        data.invoices.push(invoice);
        activeInvoiceId = invoice.id;
        window.SIMRSSasa.saveData(data);
      }
      activeRegistration = registrationNumber;
      activeQuote = lines;
      activeTotal = total;
      $("[data-invoice-patient]").textContent =
        `${patient.fullName} · No. RM ${patient.medicalRecordNumber} · Registrasi ${visit.registrationNumber} · ${formatDate(visit.visitDate)}`;
      const body = $("[data-invoice-items]");
      body.replaceChildren();
      lines.forEach((line) => {
        const row = document.createElement("tr");
        const label = document.createElement("td");
        label.textContent = line.label;
        const detail = document.createElement("td");
        detail.textContent = line.detail;
        const amount = document.createElement("td");
        amount.textContent = money(line.amount);
        row.append(label, detail, amount);
        body.append(row);
      });
      if (!lines.length) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 3;
        cell.textContent = "Tidak ada item biaya yang dapat dihitung.";
        row.append(cell);
        body.append(row);
      }
      $("[data-invoice-total]").textContent = money(total);
      const payments = data.payments.filter((payment) => payment.invoiceId === activeInvoiceId);
      const paid = payments.some((payment) => payment.status === "Berhasil" || payment.status === "Menunggu Penjaminan");
      paymentForm.hidden = paid || existing && existing.status === "Lunas";
      $("[data-print-receipt]").disabled = false;
      invoiceView.hidden = false;
      renderHistory(data);
    };

    const renderHistory = (data) => {
      const query = search.value.trim().toLocaleLowerCase("id");
      const invoices = data.invoices.filter((invoice) => invoice.prototypeType === "simulasi" || !invoice.prototypeType)
        .sort((a, b) => text(b.issuedAt || b.createdAt).localeCompare(text(a.issuedAt || a.createdAt)))
        .filter((invoice) => {
          const patient = patientFor(data, invoice.medicalRecordNumber);
          const payments = data.payments.filter((payment) => payment.invoiceId === invoice.id);
          const value = [invoice.id, invoice.registrationNumber, invoice.medicalRecordNumber,
            patient && patient.fullName, ...payments.map((payment) => payment.method)].join(" ").toLocaleLowerCase("id");
          return !query || value.includes(query);
        });
      historyBody.replaceChildren();
      invoices.forEach((invoice) => {
        const legacyInvoice = invoice.prototypeType !== "simulasi";
        if (!legacyInvoice) validateInvoice(invoice);
        const patient = patientFor(data, invoice.medicalRecordNumber);
        const payments = legacyInvoice
          ? data.payments.filter((payment) => payment.invoiceId === invoice.id)
          : validateInvoicePayments(data, invoice);
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        const strong = document.createElement("strong");
        strong.className = "table-primary-text";
        strong.textContent = text(invoice.id);
        const small = document.createElement("small");
        small.className = "table-secondary-text";
        small.textContent = `${text(invoice.registrationNumber)} · ${formatDate(invoice.issuedAt || invoice.createdAt)}${legacyInvoice ? " · arsip format lama" : ""}`;
        idCell.append(strong, small);
        const patientCell = document.createElement("td");
        const name = document.createElement("strong");
        name.className = `table-primary-text${patient ? "" : " missing-patient"}`;
        name.textContent = patient ? text(patient.fullName) : "Pasien tidak ditemukan";
        const mrn = document.createElement("small");
        mrn.className = "table-secondary-text";
        mrn.textContent = `No. RM ${text(invoice.medicalRecordNumber)}`;
        patientCell.append(name, mrn);
        const total = document.createElement("td");
        total.textContent = money(Number(invoice.total) || 0);
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className = `visit-status-badge ${statusClass(invoice.status)}`;
        statusBadge.textContent = text(invoice.status || "Status tidak tercatat");
        statusCell.append(statusBadge);
        const paymentCell = document.createElement("td");
        paymentCell.textContent = payments.length
          ? payments.map((payment) => `${text(payment.method)} · ${text(payment.transactionId || payment.id || "Transaksi")} (${text(payment.status)})`).join("; ")
          : "Belum ada pembayaran";
        const actions = document.createElement("td");
        const open = document.createElement("button");
        open.type = "button";
        open.className = "button button-small button-secondary";
        open.textContent = legacyInvoice ? "Arsip" : "Buka";
        open.disabled = legacyInvoice || !patient || !visitFor(data, invoice.registrationNumber);
        if (!legacyInvoice) open.addEventListener("click", () => {
          try {
            renderQuote(readData(), invoice.registrationNumber);
            invoiceForm.elements.visit.value = invoice.registrationNumber;
            invoiceView.scrollIntoView({ behavior: "smooth", block: "start" });
          } catch (error) {
            showAlert(`Tagihan tidak dapat dibuka: ${error.message}`);
          }
        });
        actions.append(open);
        row.append(idCell, patientCell, total, statusCell, paymentCell, actions);
        historyBody.append(row);
      });
      historyEmpty.hidden = invoices.length > 0;
      if (invoices.length && !historyBody.children.length) {
        historyEmpty.hidden = false;
        historyEmpty.querySelector("strong").textContent = "Tagihan tidak ditemukan";
        historyEmpty.querySelector("p").textContent = "Coba kata pencarian lain.";
      } else {
        historyEmpty.querySelector("strong").textContent = "Belum ada tagihan tersimpan";
        historyEmpty.querySelector("p").textContent = "Hitung biaya dari kunjungan untuk melihat ringkasan tagihan di sini.";
      }
      const simulated = data.invoices.filter((invoice) => invoice.prototypeType === "simulasi");
      const payments = data.payments.filter((payment) =>
        simulated.some((invoice) => invoice.id === payment.invoiceId));
      $("[data-cash-summary='invoices']").textContent = String(simulated.length);
      $("[data-cash-summary='paid']").textContent = String(payments.filter((payment) => payment.status === "Berhasil").length);
      $("[data-cash-summary='pending']").textContent = String(payments.filter((payment) => payment.status === "Menunggu Penjaminan").length);
    };

    const fillTariffs = (data) => {
      const tariffs = tariffsFrom(data);
      Object.keys(defaultTariffs).forEach((key) => { tariffForm.elements[key].value = String(tariffs[key]); });
    };

    invoiceForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const registrationNumber = invoiceForm.elements.visit.value;
      if (!registrationNumber) {
        showAlert("Pilih kunjungan terlebih dahulu.");
        return;
      }
      try {
        renderQuote(readData(), registrationNumber);
        showAlert("Rincian tagihan dihitung dari layanan yang tercatat.", "success");
      } catch (error) {
        showAlert(`Tagihan tidak dapat dihitung: ${error.message}`);
      }
    });

    tariffForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const parsed = {};
      for (const key of Object.keys(defaultTariffs)) {
        const value = tariffForm.elements[key].value;
        const amount = Number(value);
        if (value.trim() === "" || !Number.isSafeInteger(amount) || amount < 0 || amount > 100000000) {
          showAlert(`Tarif simulasi ${key} harus berupa bilangan bulat Rp 0–100.000.000.`);
          return;
        }
        parsed[key] = amount;
      }
      const saved = saveMutation((data) => {
        if (data.tariffs[tariffsKey] !== undefined &&
          (!data.tariffs[tariffsKey] || typeof data.tariffs[tariffsKey] !== "object" || Array.isArray(data.tariffs[tariffsKey]))) {
          throw new Error("Konfigurasi tarif simulasi yang tersimpan rusak.");
        }
        data.tariffs[tariffsKey] = parsed;
        data.tariffs.registration = parsed.visit;
        data.tariffs.doctor = parsed.procedure;
        data.tariffs.laboratory = parsed.laboratory;
        data.tariffs.radiology = parsed.radiology;
        data.tariffs.bedPerDay = parsed.inpatientDaily;
      }, "Tarif simulasi berhasil disimpan.");
      if (saved && activeRegistration) {
        try { renderQuote(readData(), activeRegistration); } catch (error) { showAlert(`Tagihan belum dapat diperbarui: ${error.message}`); }
      }
    });

    paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!activeInvoiceId || !activeRegistration) {
        showAlert("Pilih dan hitung tagihan sebelum mencatat pembayaran.");
        return;
      }
      const method = paymentForm.elements.method.value;
      if (!["tunai", "transfer", "BPJS"].includes(method)) {
        showAlert("Metode pembayaran tidak dikenal.");
        return;
      }
      saveMutation((data) => {
        const invoice = data.invoices.find((record) =>
          record.id === activeInvoiceId && record.prototypeType === "simulasi");
        if (!invoice || invoice.registrationNumber !== activeRegistration) throw new Error("Tagihan tidak ditemukan.");
        if (data.payments.some((payment) => payment.invoiceId === invoice.id && payment.status !== "Gagal")) {
          throw new Error("Tagihan ini sudah memiliki transaksi; pembayaran ganda ditolak.");
        }
        const currentLines = invoiceLines(data, invoice);
        const total = currentLines.reduce((sum, line) => sum + line.amount, 0);
        if (total !== Number(invoice.total) || total !== activeTotal) {
          throw new Error("Rincian biaya berubah. Hitung ulang tagihan sebelum membayar.");
        }
        const timestamp = now();
        const transactionId = nextId("PAY", data.payments);
        const status = method === "BPJS" ? "Menunggu Penjaminan" : "Berhasil";
        data.payments.push({
          id: transactionId,
          transactionId,
          invoiceId: invoice.id,
          registrationNumber: invoice.registrationNumber,
          medicalRecordNumber: invoice.medicalRecordNumber,
          amount: total,
          method,
          status,
          simulated: true,
          createdAt: timestamp
        });
        invoice.status = method === "BPJS" ? "Menunggu Penjaminan" : "Lunas";
        invoice.updatedAt = timestamp;
        if (!Array.isArray(invoice.statusHistory)) {
          if (invoice.statusHistory !== undefined) throw new Error("Riwayat status tagihan tidak valid.");
          invoice.statusHistory = [];
        }
        invoice.statusHistory.push({ status: invoice.status, changedAt: timestamp, transactionId });
      }, method === "BPJS" ? "Transaksi BPJS simulasi tercatat, menunggu penjaminan." : "Pembayaran simulasi berhasil dicatat.");
    });

    $("[data-print-receipt]").addEventListener("click", () => {
      try {
        const data = readData();
        const invoice = data.invoices.find((record) => record.id === activeInvoiceId && record.prototypeType === "simulasi");
        if (!invoice) throw new Error("Tagihan tidak ditemukan.");
        const patient = patientFor(data, invoice.medicalRecordNumber);
        if (!patient) throw new Error("Pasien tidak ditemukan berdasarkan No. RM tagihan.");
        const lines = invoiceLines(data, invoice);
        const payments = data.payments.filter((payment) => payment.invoiceId === invoice.id);
        const lineHtml = lines.map((line) => `<tr><td>${escapeHtml(line.label)}</td><td>${escapeHtml(line.detail)}</td><td>${money(line.amount)}</td></tr>`).join("");
        const paymentHtml = payments.length
          ? payments.map((payment) => `<p>${escapeHtml(payment.transactionId)} · ${escapeHtml(payment.method)} · ${escapeHtml(payment.status)} · ${money(payment.amount)}</p>`).join("")
          : "<p>Belum ada transaksi pembayaran.</p>";
        printDocument("Kuitansi Simulasi", `<h1>Kuitansi Pembayaran</h1><p><b>SIMRS SASA · DOKUMEN SIMULASI</b></p>
          <hr><p><b>No. tagihan:</b> ${escapeHtml(invoice.id)}<br><b>Tanggal:</b> ${escapeHtml(formatDate(invoice.issuedAt))}<br>
          <b>Pasien:</b> ${escapeHtml(patient.fullName)}<br><b>No. RM:</b> ${escapeHtml(patient.medicalRecordNumber)}<br>
          <b>Registrasi:</b> ${escapeHtml(invoice.registrationNumber)}</p>
          <table><thead><tr><th>Layanan</th><th>Rincian</th><th>Jumlah</th></tr></thead><tbody>${lineHtml}</tbody>
          <tfoot><tr><th colspan="2">Total simulasi</th><th>${money(lines.reduce((sum, line) => sum + line.amount, 0))}</th></tr></tfoot></table>
          <h3>Transaksi</h3>${paymentHtml}<p><b>Status tagihan:</b> ${escapeHtml(invoice.status)}</p>
          <p class="fine">Seluruh tarif dan transaksi pada kuitansi ini hanya simulasi, bukan bukti pembayaran resmi.</p>`);
      } catch (error) {
        showAlert(`Kuitansi tidak dapat dicetak: ${error.message}`);
      }
    });
    search.addEventListener("input", () => { try { renderHistory(readData()); } catch (error) { showAlert(error.message); } });

    const render = () => {
      try {
        const data = readData();
        visitOptions(data);
        fillTariffs(data);
        renderHistory(data);
        if (activeRegistration) renderQuote(readData(), activeRegistration);
      } catch (error) {
        showAlert(`Data kasir tidak dapat dimuat: ${error.message}`);
      }
    };
    renderModule = render;
    render();
  };

  function printDocument(title, content) {
    const printWindow = window.open("", "_blank", "width=850,height=700");
    if (!printWindow) throw new Error("Jendela cetak diblokir browser. Izinkan pop-up lalu coba lagi.");
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${escapeHtml(title)} | SIMRS SASA</title>
      <style>body{font:14px Arial,sans-serif;color:#203348;margin:32px auto;max-width:760px;padding:0 20px;line-height:1.55}h1{font-size:22px;color:#102a43}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{text-align:left;padding:9px;border-bottom:1px solid #dfe5ea}.fine{margin-top:30px;color:#687989;font-size:11px}@media print{body{margin:0 auto}}</style></head>
      <body>${content}<script>window.addEventListener("load",function(){window.print()})<\/script></body></html>`);
    printWindow.document.close();
  }

  const style = document.createElement("style");
  style.textContent = `
    .prototype-page { --prototype-border:#e6edf1; }
    .prototype-notice { margin:0 0 15px;padding:12px 14px;border:1px solid #d7eee8;border-radius:7px;color:#55756e;background:#f1faf7;font-size:10px;line-height:1.6; }
    .prototype-notice strong { color:#147c6c; }
    .prototype-alert { margin:0 0 15px;padding:11px 13px;border:1px solid #f1caca;border-radius:6px;color:#a44040;background:#fff5f5;font-size:11px;line-height:1.6; }
    .prototype-alert[data-type="success"] { border-color:#cdeae1;color:#187b66;background:#f0faf6; }
    .prototype-summary { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin:0 0 16px; }
    .prototype-summary .stat-card { display:flex;min-height:82px;justify-content:center;flex-direction:column;gap:8px; }
    .prototype-summary strong { color:var(--navy);font:700 23px var(--font-heading); }
    .prototype-panel { margin-bottom:15px;padding:18px 20px; }
    .prototype-panel .panel-heading { margin-bottom:15px; }
    .prototype-form { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:end;gap:14px 17px; }
    .prototype-form .form-field textarea { min-height:82px; }
    .prototype-form .button { min-height:39px;font-size:10px; }
    .prototype-actions { display:flex;justify-content:flex-end;align-items:center;gap:8px;grid-column:1/-1; }
    .prototype-heading { align-items:flex-start; }
    .prototype-filters { display:flex;min-width:min(420px,55%);justify-content:flex-end;gap:8px; }
    .prototype-filters .table-search { width:min(320px,100%); }
    .prototype-filters select,.tariff-form input { width:100%;min-height:36px;padding:7px 9px;border:1px solid #e1e8ed;border-radius:6px;outline:0;color:#41576b;background:#fff;font:10px var(--font-body); }
    .prototype-filters select { width:145px; }
    .prototype-result-form { grid-template-columns:repeat(2,minmax(0,1fr));padding-top:14px; }
    .prototype-result-form .form-field:first-child { grid-column:1/-1; }
    .prototype-patient-banner { margin:12px 0 0;padding:12px;border:1px solid #d9eee8;border-radius:7px;color:#304c61;background:#f2faf8;font-size:10px;font-weight:600; }
    .prototype-invoice-view { margin-top:17px;padding-top:16px;border-top:1px solid #edf0f3; }
    .prototype-invoice-view .data-table { min-width:540px; }
    .prototype-invoice-view tfoot th { color:#314a60;font-size:11px; }
    .prototype-invoice-view tfoot th:last-child { color:#11877e;font:700 14px var(--font-heading); }
    .payment-form { margin-top:15px;padding-top:15px;border-top:1px solid #edf0f3; }
    .payment-form .prototype-actions { justify-content:flex-start; }
    .prototype-payment-note { align-self:center;color:#8795a2;font-size:9px; }
    .tariff-form { padding-top:3px; }
    .tariff-form .prototype-actions { justify-content:flex-end; }
    .prototype-panel .data-table { min-width:760px; }
    .prototype-panel [data-order-list] td, .prototype-panel [data-invoice-history] td { vertical-align:middle; }
    .missing-patient { color:#a44040!important; }
    @media(max-width:760px) {
      .prototype-summary { gap:8px; }
      .prototype-summary .stat-card { padding:11px; }
      .prototype-panel { padding:15px 13px; }
      .prototype-heading { flex-direction:column; }
      .prototype-filters { width:100%;min-width:0;flex-direction:column; }
      .prototype-filters .table-search,.prototype-filters select { width:100%; }
      .prototype-form { grid-template-columns:1fr;gap:12px; }
      .prototype-result-form .form-field:first-child { grid-column:auto; }
      .prototype-actions { align-items:stretch;flex-direction:column; }
      .prototype-actions .button { width:100%; }
      .prototype-payment-note { padding:2px 0; }
    }
    @media(max-width:480px) { .prototype-summary strong{font-size:19px}.prototype-summary .stat-label{font-size:9px} }
  `;
  document.head.append(style);

  try {
    if (moduleName === "kasir") initCashier();
    else initDiagnostics();
  } catch (error) {
    showAlert(`Modul gagal dijalankan: ${error.message}`);
  }
})();
