const homeBtn = document.getElementById("homeBtn");
const registerBtn = document.getElementById("registerBtn");
const appointmentBtn = document.getElementById("appointmentBtn");
const viewAppointmentsBtn = document.getElementById("viewAppointmentsBtn");
const exportBtn = document.getElementById("exportBtn");

const registerModal = new bootstrap.Modal(document.getElementById("registerModal"));
const appointmentModal = new bootstrap.Modal(document.getElementById("appointmentModal"));

const patientForm = document.getElementById("patientForm");
const patientsTblBody = document.querySelector("#patientsTbl tbody");
const apptForm = document.getElementById("apptForm");
const apptsTblBody = document.querySelector("#apptsTbl tbody");
const patientSelect = document.getElementById("patientSelect");

let patients = JSON.parse(localStorage.getItem("patients")) || [];
window.patients = patients;
let appointments = JSON.parse(localStorage.getItem("appointments")) || [];
window.appointments = appointments;

// home button
homeBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});

// new register button
registerBtn.addEventListener("click", () => {
  patientForm.reset();
  delete patientForm.dataset.id;
  document.getElementById("duplicateAlert").classList.add("d-none"); 
  registerModal.show();
});

//book appointment button
appointmentBtn.addEventListener("click", () => {
  populatePatientSelect();
  appointmentModal.show();
});

// view appointments button
viewAppointmentsBtn.addEventListener("click", () => {
  document.getElementById("patientTableSection").style.display = "none";
  document.getElementById("appointmentTableSection").style.display = "block";
  renderAppointments();
});

// Render Patients 
function renderPatients() {
  patientsTblBody.innerHTML = "";
  patients.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.firstName} ${p.lastName}</td>
      <td>${p.age}</td>
      <td>${p.gender}</td>
      <td>${p.contact}</td>
      <td>${p.email}</td>
      <td><button class="btn btn-sm btn-warning me-2" onclick="editPatient(${p.id})"><i class="bi bi-pencil-square"></i></button></td>
      <td><button class="btn btn-sm btn-danger" onclick="deletePatient(${p.id})"><i class="bi bi-trash3"></i></button></td>     
    `;
    patientsTblBody.appendChild(tr);
  });
  document.getElementById("totalPatients").innerText = patients.length;
}
renderPatients();

// Add/Edit Patient 
patientForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!window.validatePatientForm()) return;

  // ID assignment
  const newId = patientForm.dataset.id 
    ? parseInt(patientForm.dataset.id) 
    : (patients.length > 0 ? patients[patients.length - 1].id + 1 : 1);

  const data = {
    id: newId,
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    age: age.value,
    gender: gender.value,
    contact: contact.value,
    email: email.value,
  };

  if (patientForm.dataset.id) {
    const i = patients.findIndex((x) => x.id == data.id);
    patients[i] = data;
    alert("✅ Patient updated");
  } else {
    patients.push(data);
    alert("✅ Patient registered");
  }

  localStorage.setItem("patients", JSON.stringify(patients));
  window.patients = patients;
  renderPatients();
  registerModal.hide();
});

// Edit 
function editPatient(id) {
  const p = patients.find((x) => x.id === id);
  if (!p) return;
  firstName.value = p.firstName;
  lastName.value = p.lastName;
  age.value = p.age;
  gender.value = p.gender;
  contact.value = p.contact;
  email.value = p.email;
  patientForm.dataset.id = p.id;
  document.getElementById("duplicateAlert").classList.add("d-none");
  registerModal.show();
}

// Delete 
function deletePatient(id) {
  if (confirm("Are you sure to delete?")) {
    patients = patients.filter((p) => p.id !== id);
    localStorage.setItem("patients", JSON.stringify(patients));
    window.patients = patients;
    renderPatients();
  }
}

// Populate Select 
function populatePatientSelect() {
  patientSelect.innerHTML = `<option value="">Select Patient</option>`;
  patients.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.firstName} ${p.lastName}`;
    patientSelect.appendChild(opt);
  });
}

// Book Appointment 
apptForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!patientSelect.value) return alert("Select patient!");

  // ID for appointment
  const newApptId = appointments.length > 0 ? appointments[appointments.length - 1].id + 1 : 1;

  const appt = {
    id: newApptId,
    patientId: patientSelect.value,
    dept: deptSelect.value,
    doctor: doctorSelect.value,
    date: apptDate.value,
    time: timeSelect.value,
  };

  appointments.push(appt);
  localStorage.setItem("appointments", JSON.stringify(appointments));
  alert("✅ Appointment booked!");
  appointmentModal.hide();
  apptForm.reset();
  updateDashboardCounts();
});

// Render Appointments 
function renderAppointments() {
  apptsTblBody.innerHTML = "";
  appointments.forEach((a) => {
    const patient = patients.find((p) => p.id == a.patientId);
    const pname = patient ? `${patient.firstName} ${patient.lastName}` : "Unknown";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.id}</td>
      <td>${pname}</td>
      <td>${a.dept}</td>
      <td>${a.doctor}</td>
      <td>${a.date}</td>
      <td>${a.time}</td>
    `;
    apptsTblBody.appendChild(tr);
  });
  updateDashboardCounts();
}

// Dashboard Counts 
function updateDashboardCounts() {
  document.getElementById("totalAppointments").innerText = appointments.length;
  document.getElementById("totalPatients").innerText = patients.length;
}
updateDashboardCounts();

// Export CSV 
exportBtn.addEventListener("click", () => {
  if (patients.length === 0) return alert("No data!");
  const csvRows = [["ID", "First", "Last", "Age", "Gender", "Contact", "Email"],
    ...patients.map(p => [p.id, p.firstName, p.lastName, p.age, p.gender, p.contact, p.email])
  ];
  const csv = "data:text/csv;charset=utf-8," + csvRows.map(r => r.join(",")).join("\n");
  const link = document.createElement("a");
  link.href = encodeURI(csv);
  link.download = "patients.csv";
  link.click();
});