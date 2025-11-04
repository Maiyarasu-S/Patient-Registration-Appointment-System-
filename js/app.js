// ===========================
// SPA ROUTER
// ===========================
function handleRouting() {
  const route = (window.location.hash || "#home").replace("#", "");

  // Hide all sections
  document.querySelectorAll(".view-section").forEach(sec => sec.classList.add("d-none"));

  // Show active section
  const activeSection = document.getElementById(route + "Page");
  if (activeSection) activeSection.classList.remove("d-none");

  // Update sidebar active state
  document.querySelectorAll("[data-route]").forEach(link => {
    link.classList.toggle("active", link.dataset.route === route);
  });

  // View-specific hooks
  if (route === "home") {
    renderAppointmentsTable();
    initSearch();
    initTableActions();
  } else if (route === "appointment") {
    initAppointmentForm();
  } else if (route === "records") {
    renderPatientsTable();
    initPatientSearch();
    initPatientActions();
  }
}

function setupRouting() {
  // “New Registration” button → go to Register view
  const newRegBtn = document.getElementById("btnNewReg");
  if (newRegBtn) {
    newRegBtn.addEventListener("click", () => {
      window.location.hash = "register";
    });
  }
  window.addEventListener("hashchange", handleRouting);
}

// ===========================
// PATIENT REGISTRATION
// ===========================
function handlePatientForm() {
  const form = document.getElementById("patientForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // values
    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const contact = document.getElementById("contact").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;

    // validate
    if (!validator.name(name)) return alert("Enter a valid name");
    if (!validator.age(age)) return alert("Age must be greater than 0");
    if (!validator.gender(gender)) return alert("Please select gender");
    if (!validator.contact(contact)) return alert("Contact must be 10 digits");
    if (!validator.email(email)) return alert("Enter a valid email");

    // save
    const patients = storageAPI.getPatients();
    const newPatient = {
      id: storageAPI.uid("p"),
      name,
      age,
      gender,
      contact,
      email,
      address,
      createdAt: new Date().toISOString(),
    };
    patients.push(newPatient);
    storageAPI.setPatients(patients);

    // remember last registered patient
    localStorage.setItem("lastRegisteredPatientId", newPatient.id);

    alert(`Patient Registered! ID: ${newPatient.id}`);
    form.reset();
    window.location.hash = "appointment";
  });
}

// ===========================
// APPOINTMENT BOOKING
// ===========================
function initAppointmentForm() {
  const ps = document.getElementById("patientSelect");
  const ds = document.getElementById("deptSelect");
  const drs = document.getElementById("doctorSelect");
  const ts = document.getElementById("timeSelect");
  const dateInput = document.getElementById("apptDate");
  if (!ps || !ds || !drs || !ts || !dateInput) return;

  fillPatients(ps);
  fillDepartments(ds);

  // preselect last registered patient
  const lastPid = localStorage.getItem("lastRegisteredPatientId");
  if (lastPid) ps.value = lastPid;

  ds.onchange = () => {
    fillDoctors(drs, ds.value);
    ts.innerHTML = `<option value="">Select time</option>`;
  };
  drs.onchange = () => fillTimeSlots(ts, drs.value);

  // set min date = today
  const today = new Date();
  today.setHours(0,0,0,0);
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  dateInput.min = `${y}-${m}-${d}`;

  handleApptFormSubmit();
}

function fillPatients(selectEl) {
  const patients = storageAPI.getPatients();
  selectEl.innerHTML =
    `<option value="">Select patient</option>` +
    patients.map(p => `<option value="${p.id}">${p.name} (${p.age}/${p.gender})</option>`).join("");
}

function fillDepartments(selectEl) {
  const deps = storageAPI.getDepartments();
  selectEl.innerHTML =
    `<option value="">Select department</option>` +
    deps.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
}

function fillDoctors(selectEl, departmentId) {
  const docs = storageAPI.getDoctors().filter(doc => doc.departmentId === departmentId);
  selectEl.innerHTML =
    `<option value="">Select doctor</option>` +
    docs.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
}

function fillTimeSlots(selectEl, doctorId) {
  const doc = storageAPI.getDoctors().find(d => d.id === doctorId);
  selectEl.innerHTML = `<option value="">Select time</option>`;
  if (!doc) return;
  selectEl.innerHTML += doc.slots.map(t => `<option value="${t}">${t}</option>`).join("");
}

function isFutureDate(dateStr) {
  const picked = new Date(dateStr + "T00:00:00");
  const today = new Date();
  picked.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  return picked.getTime() >= today.getTime();
}

function isSlotTaken(doctorId, dateStr, timeStr) {
  const appts = storageAPI.getAppointments();
  return appts.some(a => a.doctorId === doctorId && a.date === dateStr && a.time === timeStr);
}

function handleApptFormSubmit() {
  const form = document.getElementById("apptForm");
  if (!form) return;

  form.onsubmit = (e) => {
    e.preventDefault();

    const patientId = document.getElementById("patientSelect").value;
    const deptId = document.getElementById("deptSelect").value;
    const doctorId = document.getElementById("doctorSelect").value;
    const dateStr = document.getElementById("apptDate").value;
    const timeStr = document.getElementById("timeSelect").value;

    if (!patientId) return alert("Select patient");
    if (!deptId) return alert("Select department");
    if (!doctorId) return alert("Select doctor");
    if (!dateStr) return alert("Select date");
    if (!isFutureDate(dateStr)) return alert("Date must be today or future");
    if (!timeStr) return alert("Select a time slot");
    if (isSlotTaken(doctorId, dateStr, timeStr)) return alert("This slot is already booked for the doctor");

    const appts = storageAPI.getAppointments();
    const newAppt = {
      id: storageAPI.uid("a"),
      patientId,
      departmentId: deptId,
      doctorId,
      date: dateStr,
      time: timeStr,
      createdAt: new Date().toISOString(),
    };
    appts.push(newAppt);
    storageAPI.setAppointments(appts);

    alert("Appointment booked!");
    form.reset();
    window.location.hash = "home";
  };
}

// ===========================
// HOME: APPOINTMENTS TABLE
// ===========================
function renderAppointmentsTable(filterText = "") {
  const tbody = document.querySelector("#apptTable tbody");
  if (!tbody) return;

  const appts = storageAPI.getAppointments();
  const patients = storageAPI.getPatients();
  const doctors = storageAPI.getDoctors();
  const deps = storageAPI.getDepartments();

  const rows = appts.map((a, i) => {
    const p = storageAPI.byId(patients, a.patientId);
    const d = storageAPI.byId(doctors, a.doctorId);
    const dep = storageAPI.byId(deps, a.departmentId);
    return {
      num: i + 1,
      patient: p ? p.name : "Unknown",
      department: dep ? dep.name : "Unknown",
      doctor: d ? d.name : "Unknown",
      date: a.date,
      time: a.time,
      id: a.id,
      doctorId: a.doctorId,
    };
  });

  const search = filterText.toLowerCase();
  const filtered = rows.filter(r =>
    r.patient.toLowerCase().includes(search) ||
    r.department.toLowerCase().includes(search) ||
    r.doctor.toLowerCase().includes(search) ||
    r.date.includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No appointments found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(r => `
    <tr>
      <td>${r.num}</td>
      <td>${r.patient}</td>
      <td>${r.department}</td>
      <td>${r.doctor}</td>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${r.id}">✏️</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${r.id}">🗑️</button>
      </td>
    </tr>
  `).join("");
}

function initSearch() {
  const box = document.getElementById("searchBox");
  if (!box) return;
  box.oninput = (e) => renderAppointmentsTable(e.target.value);
}

// ---- Appointment Edit/Delete (uses existing Edit/Delete modals in HTML) ----
function initTableActions() {
  const table = document.getElementById("apptTable");
  if (!table) return;

  table.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === "edit") {
      openEditModal(id);
    } else if (action === "delete") {
      openDeleteModal(id);
    }
  });
}

function openEditModal(id) {
  const appt = storageAPI.getAppointments().find(a => a.id === id);
  if (!appt) return alert("Appointment not found");

  // set fields
  document.getElementById("editId").value = id;
  document.getElementById("editDate").value = appt.date;

  // fill times for that doctor
  const doc = storageAPI.getDoctors().find(d => d.id === appt.doctorId);
  const timeSelect = document.getElementById("editTime");
  timeSelect.innerHTML = doc.slots.map(t => `<option value="${t}">${t}</option>`).join("");
  timeSelect.value = appt.time;

  const modal = new bootstrap.Modal(document.getElementById("editModal"));
  modal.show();

  document.getElementById("saveEditBtn").onclick = () => saveEditChanges(modal);
}

function saveEditChanges(modal) {
  const id = document.getElementById("editId").value;
  const date = document.getElementById("editDate").value;
  const time = document.getElementById("editTime").value;

  if (!isFutureDate(date)) return alert("Date must be today or future");

  const appts = storageAPI.getAppointments();
  const index = appts.findIndex(a => a.id === id);
  if (index === -1) return alert("Appointment not found");

  const current = appts[index];

  // slot clash (ignore self)
  const clash = appts.some(a =>
    a.doctorId === current.doctorId &&
    a.id !== id &&
    a.date === date &&
    a.time === time
  );
  if (clash) return alert("Slot already booked for that doctor");

  appts[index].date = date;
  appts[index].time = time;
  storageAPI.setAppointments(appts);

  modal.hide();
  renderAppointmentsTable();
  alert("Appointment updated!");
}

function openDeleteModal(id) {
  document.getElementById("deleteId").value = id;
  const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
  modal.show();

  document.getElementById("confirmDeleteBtn").onclick = () => {
    const appts = storageAPI.getAppointments();
    const newList = appts.filter(a => a.id !== id);
    storageAPI.setAppointments(newList);
    modal.hide();
    renderAppointmentsTable();
    alert("Appointment deleted!");
  };
}

// ===========================
// RECORDS: PATIENTS TABLE
// ===========================
function renderPatientsTable(filterText = "") {
  const tbody = document.querySelector("#patientTable tbody");
  if (!tbody) return;

  const pts = storageAPI.getPatients();
  const q = filterText.trim().toLowerCase();

  const filtered = pts.filter(p => {
    const blob = `${p.name} ${p.contact} ${p.email || ""} ${p.address || ""}`.toLowerCase();
    return blob.includes(q);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No patients found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.age}/${p.gender}</td>
      <td>${p.contact}</td>
      <td>${p.email || "-"}</td>
      <td>${p.address || "-"}</td>
      <td class="d-flex gap-1">
        <button class="btn btn-sm btn-outline-primary" data-paction="edit" data-id="${p.id}" title="Edit">✏️</button>
        <button class="btn btn-sm btn-outline-danger" data-paction="delete" data-id="${p.id}" title="Delete">🗑️</button>
        <button class="btn btn-sm btn-outline-secondary" data-paction="bookings" data-id="${p.id}" title="View Bookings">📖</button>
      </td>
    </tr>
  `).join("");
}

function initPatientSearch() {
  const box = document.getElementById("patientSearch");
  if (!box) return;
  box.oninput = (e) => renderPatientsTable(e.target.value);
}

function initPatientActions() {
  const table = document.getElementById("patientTable");
  if (!table) return;

  table.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-paction]");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.paction;

    if (action === "edit") {
      openPatientEditModal(id);
    } else if (action === "delete") {
      deletePatient(id);
    } else if (action === "bookings") {
      openPatientBookingsModal(id);
    }
  });
}

// --- EDIT PATIENT (modal) ---
function openPatientEditModal(id) {
  const pts = storageAPI.getPatients();
  const p = pts.find(x => x.id === id);
  if (!p) return alert("Patient not found");

  document.getElementById("editPid").value = p.id;
  document.getElementById("editName").value = p.name || "";
  document.getElementById("editAge").value = p.age || "";
  document.getElementById("editGender").value = p.gender || "";
  document.getElementById("editContact").value = p.contact || "";
  document.getElementById("editEmail").value = p.email || "";
  document.getElementById("editAddress").value = p.address || "";

  const modal = new bootstrap.Modal(document.getElementById("patientEditModal"));
  modal.show();

  document.getElementById("savePatientEditBtn").onclick = () => savePatientEdit(modal);
}

function savePatientEdit(modal) {
  const id = document.getElementById("editPid").value;
  const name = document.getElementById("editName").value;
  const age = document.getElementById("editAge").value;
  const gender = document.getElementById("editGender").value;
  const contact = document.getElementById("editContact").value;
  const email = document.getElementById("editEmail").value;
  const address = document.getElementById("editAddress").value;

  if (!validator.name(name)) return alert("Invalid name");
  if (!validator.age(age)) return alert("Age must be greater than 0");
  if (!validator.gender(gender)) return alert("Select gender");
  if (!validator.contact(contact)) return alert("Contact must be 10 digits");
  if (!validator.email(email || "")) return alert("Invalid email");

  const pts = storageAPI.getPatients();
  const idx = pts.findIndex(p => p.id === id);
  if (idx === -1) return alert("Patient not found");

  pts[idx] = { ...pts[idx], name, age, gender, contact, email, address };
  storageAPI.setPatients(pts);

  const q = document.getElementById("patientSearch")?.value || "";
  renderPatientsTable(q);
  if (location.hash === "#home") renderAppointmentsTable();
  modal.hide();
  alert("Patient updated!");
}

// --- PATIENT BOOKINGS (modal) ---
function openPatientBookingsModal(patientId) {
  const bookingsDiv = document.getElementById("bookingsList");
  const appts = storageAPI.getAppointments().filter(a => a.patientId === patientId);
  const docs = storageAPI.getDoctors();
  const deps = storageAPI.getDepartments();

  if (appts.length === 0) {
    bookingsDiv.innerHTML = `<div class="text-muted">No appointments for this patient.</div>`;
  } else {
    bookingsDiv.innerHTML = appts.map(a => {
      const doc = storageAPI.byId(docs, a.doctorId);
      const dep = storageAPI.byId(deps, a.departmentId);
      return `
        <div class="border rounded p-2 mb-2">
          <div><strong>Date:</strong> ${a.date} &nbsp; <strong>Time:</strong> ${a.time}</div>
          <div><strong>Department:</strong> ${dep ? dep.name : "-"} &nbsp; <strong>Doctor:</strong> ${doc ? doc.name : "-"}</div>
          <div class="small text-muted">Appt ID: ${a.id}</div>
        </div>
      `;
    }).join("");
  }

  const modal = new bootstrap.Modal(document.getElementById("patientBookingsModal"));
  modal.show();
}

// --- DELETE PATIENT (and their appts) ---
function deletePatient(id) {
  if (!confirm("Delete this patient and their appointments?")) return;

  const pts = storageAPI.getPatients().filter(p => p.id !== id);
  storageAPI.setPatients(pts);

  const appts = storageAPI.getAppointments().filter(a => a.patientId !== id);
  storageAPI.setAppointments(appts);

  const q = document.getElementById("patientSearch")?.value || "";
  renderPatientsTable(q);
  if (location.hash === "#home") renderAppointmentsTable();
  alert("Patient and their appointments deleted.");
}

// ===========================
// BOOT
// ===========================
window.addEventListener("DOMContentLoaded", () => {
  setupRouting();
  handleRouting();     // show initial view
  handlePatientForm(); // wire registration form
});
