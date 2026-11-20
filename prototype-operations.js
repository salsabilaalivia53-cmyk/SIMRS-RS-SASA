(() => {
  "use strict";

  const moduleName = document.body && document.body.dataset.prototypeModule;
  if (!moduleName) return;

  const api = window.SIMRSSasa;
  if (!api) return;

  const escapeHtml = (value) => String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  const now = () => new Date().toISOString();
  const today = () => api.getLocalDate ? api.getLocalDate(new Date()) : new Date().toISOString().slice(0, 10);
  const formatDate = (value) => {
    if (!value) return "-";
    const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
  };
  const formatMoney = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value) || 0);
  const alertBox = document.querySelector("#prototypeAlert");
  const showAlert = (message, error = false) => {
    if (!alertBox) return;
    alertBox.hidden = false;
    alertBox.textContent = message;
    alertBox.className = `exam-form-message${error ? " message-error" : ""}`;
  };
  const load = () => {
    try {
      const data = api.readData();
      api.ensureCollections(data);
      return data;
    } catch (error) {
      showAlert(error.message || "Data SIMRS tidak dapat dibaca.", true);
      return null;
    }
  };
  const save = (data) => {
    try {
      api.saveData(data);
      return true;
    } catch (error) {
      showAlert("Perubahan tidak dapat disimpan. Periksa penyimpanan browser.", true);
      return false;
    }
  };
  const addActivity = (data, text) => {
    data.activityLog.push({ id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, description: text, createdAt: now(), module: moduleName });
  };

  if (moduleName === "farmasi") initFarmasi();
  if (moduleName === "rawat-inap") initRawatInap();

  function initFarmasi() {
    const seed = (data) => {
      if (data.medications.length === 0) {
        data.medications.push(
          { id: "MED-001", code: "OBT-001", name: "Paracetamol 500 mg", category: "Analgesik", unit: "Tablet", price: 500, stock: 200, minStock: 30, description: "Dummy" },
          { id: "MED-002", code: "OBT-002", name: "Amoxicillin 500 mg", category: "Antibiotik", unit: "Kapsul", price: 1500, stock: 80, minStock: 20, description: "Dummy" },
          { id: "MED-003", code: "OBT-003", name: "Omeprazole 20 mg", category: "Saluran cerna", unit: "Kapsul", price: 2500, stock: 12, minStock: 20, description: "Dummy" }
        );
        save(data);
      }
    };
    let data = load();
    if (!data) return;
    seed(data);
    data = load();

    const medicineTable = document.querySelector("#medicineTable");
    const medicineSearch = document.querySelector("#medicineSearch");
    const orderTable = document.querySelector("#orderTable");
    const orderSearch = document.querySelector("#orderSearch");

    const renderStockOptions = () => {
      const select = document.querySelector("#stockMedication");
      if (!select) return;
      select.innerHTML = data.medications.map((m) => `<option value="${escapeHtml(m.id)}">${escapeHtml(m.name)} (${escapeHtml(m.stock)} ${escapeHtml(m.unit)})</option>`).join("");
    };
    const render = () => {
      data = load();
      if (!data) return;
      const medicineQuery = medicineSearch.value.trim().toLowerCase();
      const medicines = data.medications.filter((m) => [m.code, m.name, m.category].some((v) => String(v || "").toLowerCase().includes(medicineQuery)));
      medicineTable.innerHTML = medicines.map((m) => {
        const low = Number(m.stock) <= Number(m.minStock);
        return `<tr><td><strong>${escapeHtml(m.code)}</strong></td><td><strong>${escapeHtml(m.name)}</strong><br><small>${escapeHtml(m.category)}</small></td><td>${escapeHtml(m.unit)}</td><td>${formatMoney(m.price)}</td><td>${escapeHtml(m.stock)}</td><td><span class="table-status ${low ? "status-upcoming" : "status-open"}"><i></i>${low ? "Stok rendah" : "Cukup"}</span></td><td><button class="button button-secondary medicine-edit" data-id="${escapeHtml(m.id)}" type="button">Edit</button> <button class="button button-secondary medicine-delete" data-id="${escapeHtml(m.id)}" type="button">Hapus</button></td></tr>`;
      }).join("") || `<tr><td colspan="7">Tidak ada obat ditemukan.</td></tr>`;
      document.querySelector("#medicineCount").textContent = data.medications.length;
      document.querySelector("#lowCount").textContent = data.medications.filter((m) => Number(m.stock) <= Number(m.minStock)).length;
      document.querySelector("#transactionCount").textContent = data.stockTransactions.length;
      const orderQuery = orderSearch.value.trim().toLowerCase();
      const orders = data.pharmacyOrders.filter((o) => [o.id, o.patientName, o.medicalRecordNumber].some((v) => String(v || "").toLowerCase().includes(orderQuery)));
      document.querySelector("#orderCount").textContent = orders.filter((o) => ["Menunggu Verifikasi", "Diverifikasi"].includes(o.status)).length;
      orderTable.innerHTML = orders.map((o) => {
        const items = Array.isArray(o.items) ? o.items.map((i) => `${escapeHtml(i.medicineName)} × ${escapeHtml(i.quantityLabel || i.quantity)}`).join("<br>") : "-";
        const verify = o.status === "Menunggu Verifikasi" ? `<button class="button button-secondary order-verify" data-id="${escapeHtml(o.id)}" type="button">Verifikasi</button>` : "";
        const dispense = o.status === "Diverifikasi" ? `<button class="button button-primary order-dispense" data-id="${escapeHtml(o.id)}" type="button">Serahkan</button>` : "";
        return `<tr><td><strong>${escapeHtml(o.id)}</strong></td><td><strong>${escapeHtml(o.patientName)}</strong><br><small>RM ${escapeHtml(o.medicalRecordNumber)}</small></td><td>${items}</td><td>${escapeHtml(o.status)}</td><td>${verify}${dispense}</td></tr>`;
      }).join("") || `<tr><td colspan="5">Tidak ada resep ditemukan.</td></tr>`;
      document.querySelector("#transactionTable").innerHTML = data.stockTransactions.slice().reverse().map((t) =>
        `<tr><td>${formatDate(t.createdAt)}</td><td><strong>${escapeHtml(t.medicineName)}</strong></td><td>${escapeHtml(t.type)}</td><td>${escapeHtml(t.quantity)} ${escapeHtml(t.unit || "")}</td><td>${escapeHtml(t.notes || "-")}</td></tr>`
      ).join("") || `<tr><td colspan="5">Belum ada transaksi.</td></tr>`;
      renderStockOptions();
    };

    document.querySelector("#medicineSearch").addEventListener("input", render);
    document.querySelector("#orderSearch").addEventListener("input", render);
    document.querySelector("#addMedicineButton").addEventListener("click", () => {
      const form = document.querySelector("#medicineForm");
      form.reset();
      form.elements.id.value = "";
      document.querySelector("#medicineFormWrap").hidden = false;
      form.elements.code.focus();
    });
    document.querySelector("#cancelMedicine").addEventListener("click", () => {
      document.querySelector("#medicineForm").reset();
      document.querySelector("#medicineFormWrap").hidden = true;
    });
    document.querySelector("#medicineForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const values = new FormData(form);
      const code = String(values.get("code")).trim();
      const name = String(values.get("name")).trim();
      const category = String(values.get("category")).trim();
      const unit = String(values.get("unit")).trim();
      const price = Number(values.get("price"));
      const stock = Number(values.get("stock"));
      const minStock = Number(values.get("minStock"));
      if (!code || !name || !category || !unit || !Number.isSafeInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0 || !Number.isInteger(minStock) || minStock < 0) {
        showAlert("Lengkapi data obat dengan angka valid.", true); return;
      }
      const id = String(values.get("id"));
      if (data.medications.some((m) => String(m.code).toLowerCase().trim() === code.toLowerCase() && m.id !== id)) {
        showAlert("Kode obat sudah digunakan.", true); return;
      }
      if (id) {
        const item = data.medications.find((m) => m.id === id);
        if (!item) { showAlert("Obat tidak ditemukan.", true); return; }
        const previousStock = Number(item.stock) || 0;
        Object.assign(item, { code, name, category, unit, price, stock, minStock, description: String(values.get("description")).trim() });
        if (stock !== previousStock) {
          data.stockTransactions.push({
            id: `TRX-${Date.now()}-${item.id}`,
            medicationId: item.id,
            medicineName: item.name,
            unit: item.unit,
            type: stock > previousStock ? "Masuk" : "Keluar",
            quantity: Math.abs(stock - previousStock),
            notes: "Koreksi stok melalui master obat",
            createdAt: now()
          });
        }
        addActivity(data, `Obat ${name} diperbarui`);
      } else {
        const newId = `MED-${String(Date.now()).slice(-8)}`;
        data.medications.push({ id: newId, code, name, category, unit, price, stock, minStock, description: String(values.get("description")).trim() });
        addActivity(data, `Obat ${name} ditambahkan`);
      }
      if (save(data)) { form.reset(); document.querySelector("#medicineFormWrap").hidden = true; showAlert("Data obat tersimpan."); render(); }
    });
    medicineTable.addEventListener("click", (event) => {
      const edit = event.target.closest(".medicine-edit");
      const del = event.target.closest(".medicine-delete");
      if (edit) {
        const item = data.medications.find((m) => m.id === edit.dataset.id);
        if (!item) return;
        const form = document.querySelector("#medicineForm");
        ["id","code","name","category","unit","price","stock","minStock","description"].forEach((key) => { form.elements[key].value = item[key] ?? ""; });
        document.querySelector("#medicineFormWrap").hidden = false;
      }
      if (del) {
        const item = data.medications.find((m) => m.id === del.dataset.id);
        if (!item) return;
        if (data.pharmacyOrders.some((order) =>
          ["Menunggu Verifikasi", "Diverifikasi"].includes(order.status) &&
          (order.items || []).some((prescription) => prescription.medicationId === item.id)
        )) {
          showAlert("Obat masih digunakan oleh resep aktif dan tidak dapat dihapus.", true);
          return;
        }
        if (!window.confirm(`Hapus obat ${item.name}?`)) return;
        data.medications = data.medications.filter((m) => m.id !== item.id);
        addActivity(data, `Obat ${item.name} dihapus`);
        if (save(data)) { showAlert("Obat berhasil dihapus."); render(); }
      }
    });
    document.querySelector("#stockForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      const medication = data.medications.find((m) => m.id === String(values.get("medicationId")));
      const quantity = Number(values.get("quantity"));
      const type = String(values.get("type"));
      if (!medication) { showAlert("Pilih obat yang valid.", true); return; }
      if (!Number.isInteger(quantity) || quantity <= 0) { showAlert("Jumlah mutasi harus bilangan bulat positif.", true); return; }
      if (type === "Keluar" && quantity > Number(medication.stock)) { showAlert(`Stok ${medication.name} tidak cukup. Tersedia ${medication.stock}.`, true); return; }
      medication.stock = type === "Masuk" ? Number(medication.stock) + quantity : Number(medication.stock) - quantity;
      data.stockTransactions.push({ id: `TRX-${Date.now()}`, medicationId: medication.id, medicineName: medication.name, unit: medication.unit, type, quantity, notes: String(values.get("notes")).trim(), createdAt: now() });
      addActivity(data, `Mutasi stok ${type.toLowerCase()} ${medication.name}: ${quantity}`);
      if (save(data)) { event.currentTarget.reset(); showAlert("Mutasi stok tersimpan."); render(); }
    });
    orderTable.addEventListener("click", (event) => {
      const verifyButton = event.target.closest(".order-verify");
      const dispenseButton = event.target.closest(".order-dispense");
      const button = verifyButton || dispenseButton;
      if (!button) return;
      const order = data.pharmacyOrders.find((o) => o.id === button.dataset.id);
      if (!order) { showAlert("Resep tidak ditemukan.", true); return; }
      if (verifyButton) {
        if (order.status !== "Menunggu Verifikasi") { showAlert("Resep sudah diverifikasi atau selesai.", true); return; }
        order.status = "Diverifikasi";
        order.updatedAt = now();
        addActivity(data, `Resep ${order.id} diverifikasi`);
        if (save(data)) { showAlert("Resep berhasil diverifikasi."); render(); }
      } else {
        if (order.status === "Sudah Diserahkan" || order.status === "Dibatalkan") { showAlert("Resep tidak dapat diserahkan lagi.", true); return; }
        if (order.status !== "Diverifikasi") { showAlert("Resep harus diverifikasi sebelum obat diserahkan.", true); return; }
        if (!Array.isArray(order.items) || order.items.length === 0) { showAlert("Resep tidak memiliki item obat.", true); return; }
        const shortages = [];
        (order.items || []).forEach((item) => {
          const medication = data.medications.find((m) => m.id === item.medicationId) ||
            data.medications.find((m) => String(m.name).toLowerCase() === String(item.medicineName).toLowerCase());
          if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) shortages.push(`${item.medicineName}: jumlah resep tidak valid`);
          else if (!medication) shortages.push(`${item.medicineName}: obat tidak ditemukan`);
          else if (Number(medication.stock) < Number(item.quantity)) shortages.push(`${medication.name}: perlu ${item.quantity}, tersedia ${medication.stock}`);
        });
        if (shortages.length) { showAlert(`Penyerahan ditolak. ${shortages.join("; ")}.`, true); return; }
        (order.items || []).forEach((item) => {
          const medication = data.medications.find((m) => m.id === item.medicationId) ||
            data.medications.find((m) => String(m.name).toLowerCase() === String(item.medicineName).toLowerCase());
          const quantity = Number(item.quantity);
          medication.stock = Number(medication.stock) - quantity;
          data.stockTransactions.push({ id: `TRX-${Date.now()}-${medication.id}`, medicationId: medication.id, medicineName: medication.name, unit: medication.unit, type: "Keluar", quantity, notes: `Penyerahan resep ${order.id}`, createdAt: now() });
        });
        order.status = "Sudah Diserahkan";
        order.updatedAt = now();
        order.dispensedAt = now();
        addActivity(data, `Resep ${order.id} diserahkan`);
        if (save(data)) { showAlert("Resep diserahkan dan stok berhasil dikurangi."); render(); }
      }
    });
    render();
  }

  function initRawatInap() {
    const bedStatusLabels = { available: "Tersedia", occupied: "Terisi", cleaning: "Dibersihkan" };
    const seedBeds = (data) => {
      if (data.rooms.length === 0) {
        data.rooms.push(
          { id: "ROOM-001", code: "R101", name: "Melati", class: "Kelas 1", floor: "1" },
          { id: "ROOM-002", code: "R201", name: "Anggrek", class: "Kelas 2", floor: "2" },
          { id: "ROOM-003", code: "R301", name: "Kenanga", class: "Kelas 3", floor: "3" }
        );
      }
      if (data.beds.length === 0) {
        data.beds.push(
          { id: "BED-001", code: "M-101", roomId: "ROOM-001", status: "available" },
          { id: "BED-002", code: "M-102", roomId: "ROOM-001", status: "available" },
          { id: "BED-003", code: "A-201", roomId: "ROOM-002", status: "available" },
          { id: "BED-004", code: "A-202", roomId: "ROOM-002", status: "available" },
          { id: "BED-005", code: "K-301", roomId: "ROOM-003", status: "available" },
          { id: "BED-006", code: "K-302", roomId: "ROOM-003", status: "available" }
        );
        save(data);
      } else if (data.rooms.length) {
        save(data);
      }
    };
    let data = load();
    if (!data) return;
    seedBeds(data);
    data = load();

    const patientSelect = document.querySelector("#admissionPatient");
    const visitSelect = document.querySelector("#admissionVisit");
    const roomSelect = document.querySelector("#admissionRoom");
    const bedSelect = document.querySelector("#admissionBed");

    const fillPatients = () => {
      patientSelect.innerHTML = `<option value="">Pilih pasien</option>` + data.patients.map((p) =>
        `<option value="${escapeHtml(p.medicalRecordNumber)}">${escapeHtml(p.fullName)} — RM ${escapeHtml(p.medicalRecordNumber)}</option>`
      ).join("");
    };
    const fillRooms = () => {
      roomSelect.innerHTML = `<option value="">Pilih ruang</option>` + data.rooms.map((r) =>
        `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)} — ${escapeHtml(r.class)}</option>`
      ).join("");
    };
    const fillBeds = () => {
      const roomId = roomSelect.value;
      bedSelect.innerHTML = `<option value="">Pilih tempat tidur</option>` + data.beds.filter((b) => b.status === "available" && (!roomId || b.roomId === roomId)).map((b) =>
        `<option value="${escapeHtml(b.id)}">${escapeHtml(b.code)}</option>`
      ).join("");
    };
    const fillVisits = () => {
      const mr = patientSelect.value;
      visitSelect.innerHTML = `<option value="">Tidak ditautkan</option>` + data.visits.filter((v) => v.medicalRecordNumber === mr).map((v) =>
        `<option value="${escapeHtml(v.registrationNumber)}">${escapeHtml(v.registrationNumber)} — ${escapeHtml(v.poliName || v.poliCode || "Kunjungan")}</option>`
      ).join("");
    };

    document.querySelector("#toggleAdmissionForm").addEventListener("click", () => {
      document.querySelector("#admissionForm").hidden = false;
    });
    document.querySelector("#cancelAdmission").addEventListener("click", () => {
      document.querySelector("#admissionForm").reset();
      document.querySelector("#admissionForm").hidden = true;
    });
    patientSelect.addEventListener("change", fillVisits);
    roomSelect.addEventListener("change", fillBeds);

    const render = () => {
      data = load();
      if (!data) return;
      const active = data.admissions.filter((a) => ["Aktif", "Dipindahkan"].includes(a.status));
      document.querySelector("#activeAdmissionCount").textContent = active.length;
      document.querySelector("#availableBedCount").textContent = data.beds.filter((b) => b.status === "available").length;
      document.querySelector("#occupiedBedCount").textContent = data.beds.filter((b) => b.status === "occupied").length;
      document.querySelector("#cleaningBedCount").textContent = data.beds.filter((b) => b.status === "cleaning").length;

      const query = document.querySelector("#admissionSearch").value.trim().toLowerCase();
      const status = document.querySelector("#admissionStatusFilter").value;
      const admissions = data.admissions.filter((a) => (!status || a.status === status) &&
        [a.patientName, a.medicalRecordNumber, a.id].some((v) => String(v || "").toLowerCase().includes(query)));
      document.querySelector("#admissionCountLabel").textContent = `${admissions.length} data admisi`;
      document.querySelector("#admissionTable").innerHTML = admissions.slice().reverse().map((a) => {
        const bed = data.beds.find((b) => b.id === a.bedId);
        const room = data.rooms.find((r) => r.id === (bed ? bed.roomId : a.roomId));
        const place = `${bed ? bed.code : "-"} · ${room ? room.name : "-"} (${room ? room.class : "-"})`;
        const canResume = a.status === "Selesai";
        const progress = ["Aktif", "Dipindahkan"].includes(a.status) ? `<button class="button button-secondary admission-progress" data-id="${escapeHtml(a.id)}" type="button">Progres</button> <button class="button button-secondary admission-transfer" data-id="${escapeHtml(a.id)}" type="button">Pindah bed</button> <button class="button button-primary admission-discharge" data-id="${escapeHtml(a.id)}" type="button">Pulangkan</button>` : "";
        const resume = canResume ? `<button class="button button-secondary admission-resume" data-id="${escapeHtml(a.id)}" type="button">Lihat resume</button>` : "";
        return `<tr><td><strong>${escapeHtml(a.id)}</strong></td><td><strong>${escapeHtml(a.patientName)}</strong><br><small>RM ${escapeHtml(a.medicalRecordNumber)}</small></td><td>${escapeHtml(place)}</td><td>${formatDate(a.admissionDate)}</td><td>${escapeHtml(a.status)}</td><td>${progress}${resume}</td></tr>`;
      }).join("") || `<tr><td colspan="6">Tidak ada data admisi.</td></tr>`;

      document.querySelector("#bedTable").innerHTML = data.beds.map((b) => {
        const room = data.rooms.find((r) => r.id === b.roomId);
        const admission = b.status === "occupied" ? data.admissions.find((a) => a.bedId === b.id && ["Aktif", "Dipindahkan"].includes(a.status)) : null;
        const clean = b.status === "cleaning" ? `<button class="button button-primary bed-clean" data-id="${escapeHtml(b.id)}" type="button">Selesai dibersihkan</button>` : "";
        return `<tr><td><strong>${escapeHtml(b.code)}</strong></td><td>${escapeHtml(room ? `${room.name} — ${room.class}` : "-")}</td><td>${escapeHtml(bedStatusLabels[b.status] || "Tidak diketahui")}</td><td>${admission ? escapeHtml(admission.patientName) : "-"}</td><td>${clean}</td></tr>`;
      }).join("") || `<tr><td colspan="5">Belum ada bed.</td></tr>`;

      fillPatients();
      fillRooms();
      fillBeds();
    };

    document.querySelector("#admissionSearch").addEventListener("input", render);
    document.querySelector("#admissionStatusFilter").addEventListener("change", render);
    document.querySelector("#admissionForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      const mr = String(values.get("medicalRecordNumber"));
      const bedId = String(values.get("bedId"));
      const roomId = String(values.get("roomId"));
      const admissionDate = String(values.get("admissionDate"));
      const patient = data.patients.find((p) => p.medicalRecordNumber === mr);
      const bed = data.beds.find((b) => b.id === bedId && b.status === "available");
      if (!patient) { showAlert("Pilih pasien terdaftar.", true); return; }
      if (!bed) { showAlert("Tempat tidur tidak tersedia. Pilih bed lain.", true); return; }
      if (!admissionDate) { showAlert("Tanggal masuk wajib diisi.", true); return; }
      if (bed.roomId !== roomId) { showAlert("Tempat tidur tidak berada di ruang yang dipilih.", true); return; }
      bed.status = "occupied";
      const id = `ADM-${today().replace(/-/g, "")}-${String(data.admissions.length + 1).padStart(4, "0")}`;
      data.admissions.push({
        id, medicalRecordNumber: mr, patientName: patient.fullName,
        registrationNumber: String(values.get("registrationNumber")) || "",
        bedId, roomId, admissionDate, doctor: String(values.get("doctor")).trim(),
        diagnosis: String(values.get("diagnosis")).trim(), status: "Aktif",
        progressNotes: [], createdAt: now(), updatedAt: now()
      });
      addActivity(data, `Admisi ${id} dibuat untuk ${patient.fullName}`);
      if (save(data)) {
        event.currentTarget.reset(); event.currentTarget.hidden = true;
        showAlert(`Admisi ${id} tersimpan dan bed ${bed.code} dialokasikan.`);
        render();
      }
    });

    document.querySelector("#admissionTable").addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const admission = data.admissions.find((a) => a.id === button.dataset.id);
      if (!admission) return;
      if (button.classList.contains("admission-progress")) {
        const existingNotes = Array.isArray(admission.progressNotes) && admission.progressNotes.length
          ? `Riwayat catatan:\n${admission.progressNotes.map((item) => `- ${formatDate(item.createdAt)}: ${item.note}`).join("\n")}\n\n`
          : "";
        const note = window.prompt(`${existingNotes}Catatan perkembangan baru:`);
        if (!note || !note.trim()) { showAlert("Catatan perkembangan tidak boleh kosong.", true); return; }
        if (!Array.isArray(admission.progressNotes)) admission.progressNotes = [];
        admission.progressNotes.push({ note: note.trim(), createdAt: now(), author: "Petugas Rawat Inap" });
        admission.updatedAt = now();
        addActivity(data, `Catatan perkembangan ditambah pada ${admission.id}`);
        if (save(data)) { showAlert("Catatan perkembangan tersimpan."); render(); }
      }
      if (button.classList.contains("admission-transfer")) {
        const available = data.beds.filter((b) => b.status === "available");
        if (!available.length) { showAlert("Tidak ada bed tersedia untuk pemindahan.", true); return; }
        const choices = available.map((b, index) => `${index + 1}. ${b.code}`).join("\n");
        const choice = window.prompt(`Pindahkan ke bed:\n${choices}\nMasukkan nomor urut.`);
        const index = Number(choice) - 1;
        if (!choice || !available[index]) { showAlert("Pemindahan dibatalkan atau bed tidak valid.", true); return; }
        const oldBed = data.beds.find((b) => b.id === admission.bedId);
        const newBed = available[index];
        if (oldBed) oldBed.status = "cleaning";
        newBed.status = "occupied";
        admission.bedId = newBed.id;
        admission.roomId = newBed.roomId;
        admission.status = "Dipindahkan";
        admission.transfers = Array.isArray(admission.transfers) ? admission.transfers : [];
        admission.transfers.push({ fromBedId: oldBed ? oldBed.id : "", toBedId: newBed.id, transferredAt: now() });
        addActivity(data, `Pasien ${admission.patientName} dipindahkan ke bed ${newBed.code}`);
        if (save(data)) { showAlert(`Pasien dipindahkan ke bed ${newBed.code}. Bed lama masuk status cleaning.`); render(); }
      }
      if (button.classList.contains("admission-discharge")) {
        if (!window.confirm(`Pulangkan pasien ${admission.patientName}?`)) return;
        const summary = window.prompt("Resume medis / kondisi pasien saat pulang:", admission.diagnosis || "");
        if (summary === null) return;
        if (!summary.trim()) { showAlert("Resume medis wajib diisi sebelum pasien dipulangkan.", true); return; }
        admission.status = "Selesai";
        admission.dischargeDate = today();
        admission.dischargedAt = now();
        admission.updatedAt = now();
        admission.dischargeSummary = summary.trim();
        const bed = data.beds.find((b) => b.id === admission.bedId);
        if (bed) bed.status = "cleaning";
        addActivity(data, `Pasien ${admission.patientName} dipulangkan dari ${admission.id}`);
        if (save(data)) { showAlert("Pasien dipulangkan. Bed lama perlu dibersihkan."); render(); }
      }
      if (button.classList.contains("admission-resume")) {
        const patient = data.patients.find((record) => record.medicalRecordNumber === admission.medicalRecordNumber);
        const content = document.querySelector("#admissionResumeContent");
        content.replaceChildren();
        [
          ["Nama pasien", patient ? patient.fullName : admission.patientName],
          ["Nomor rekam medis", admission.medicalRecordNumber],
          ["Nomor admisi", admission.id],
          ["Tanggal masuk", formatDate(admission.admissionDate)],
          ["Tanggal keluar", formatDate(admission.dischargeDate)],
          ["Diagnosis / alasan rawat", admission.diagnosis || "—"],
          ["Dokter", admission.doctor || "—"],
          ["Catatan perkembangan", Array.isArray(admission.progressNotes) && admission.progressNotes.length
            ? admission.progressNotes.map((note) => `${formatDate(note.createdAt)}: ${note.note}`).join("\n")
            : "—"],
          ["Resume medis", admission.dischargeSummary || "Resume belum tersedia."]
        ].forEach(([label, value]) => {
          const item = document.createElement("div");
          item.className = "admission-resume-field";
          item.append(Object.assign(document.createElement("strong"), { textContent: label }));
          item.append(Object.assign(document.createElement("p"), { textContent: value }));
          content.append(item);
        });
        document.querySelector("#admissionResumePanel").hidden = false;
        document.querySelector("#admissionResumePanel").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    document.querySelector("#bedTable").addEventListener("click", (event) => {
      const button = event.target.closest(".bed-clean");
      if (!button) return;
      const bed = data.beds.find((b) => b.id === button.dataset.id);
      if (!bed) return;
      bed.status = "available";
      addActivity(data, `Bed ${bed.code} selesai dibersihkan dan tersedia`);
      if (save(data)) { showAlert(`Bed ${bed.code} tersedia kembali.`); render(); }
    });

    document.querySelector("#closeAdmissionResume").addEventListener("click", () => {
      document.querySelector("#admissionResumePanel").hidden = true;
    });
    document.querySelector("#printAdmissionResume").addEventListener("click", () => {
      document.body.classList.add("printing-admission-resume");
      window.print();
      window.setTimeout(() => document.body.classList.remove("printing-admission-resume"), 1000);
    });
    document.querySelector("#admissionForm").elements.admissionDate.value = today();
    fillPatients();
    fillRooms();
    fillBeds();
    fillVisits();
    render();
  }
})();
