(function () {
  // IDs used
  const fields = ["firstName","lastName","age","gender","contact","email"]; // update if you replaced age with dob

  function getErrorEl(inputEl) {
    const errId = inputEl.id + "-error";
    let err = document.getElementById(errId);
    if (!err) {
      err = document.createElement("span");
      err.id = errId;
      err.className = "error-text";
      inputEl.parentNode.insertBefore(err, inputEl.nextSibling);
    }
    return err;
  }

  function resetErrors() {
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove("input-error");
      const err = document.getElementById(id + "-error");
      if (err) err.textContent = "";
    });
    const alertBox = document.getElementById("duplicateAlert");
    if (alertBox) alertBox.classList.add("d-none");
  }

  // small validators
  function validName(v){ return /^[A-Za-z][A-Za-z\s]{1,}$/.test(v.trim()); } 
  function validAge(v){ const n = parseInt(v,10); return !isNaN(n) && n>0 && n<130; }
  function validContact(v){ return /^[0-9]{10}$/.test(v.trim()); }
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

  // Ensure top alert exists (creates it next to form if missing)
  function ensureAlertBox() {
    let alertBox = document.getElementById("duplicateAlert");
    const form = document.getElementById("patientForm");
    if (!alertBox && form) {
      alertBox = document.createElement("div");
      alertBox.id = "duplicateAlert";
      alertBox.className = "alert alert-danger d-none";
      form.parentNode.insertBefore(alertBox, form); // insert above the form
    }
    return alertBox;
  }

  // main validator
  function validatePatientForm() {
    resetErrors();
    ensureAlertBox();

    const firstName = (document.getElementById("firstName") || {}).value || "";
    const lastName  = (document.getElementById("lastName") || {}).value || "";
    const age       = (document.getElementById("age") || {}).value || "";
    const gender    = (document.getElementById("gender") || {}).value || "";
    const contact   = (document.getElementById("contact") || {}).value || "";
    const email     = (document.getElementById("email") || {}).value || "";

    let isValid = true;

    // First name
    const fnEl = document.getElementById("firstName");
    if (!firstName.trim() || !validName(firstName)) {
      if (fnEl) {
        fnEl.classList.add("input-error");
        getErrorEl(fnEl).textContent = "Enter a valid first name (letters, min 2).";
      }
      isValid = false;
    }

    // Last name
    const lnEl = document.getElementById("lastName");
    if (!lastName.trim() || !validName(lastName)) {
      if (lnEl) {
        lnEl.classList.add("input-error");
        getErrorEl(lnEl).textContent = "Enter a valid last name (letters, min 2).";
      }
      isValid = false;
    }

    // Age (if present)
    const ageEl = document.getElementById("age");
    if (ageEl) {
      if (!validAge(age)) {
        ageEl.classList.add("input-error");
        getErrorEl(ageEl).textContent = "Enter a valid age (1–129).";
        isValid = false;
      }
    }

    // Gender
    const genderEl = document.getElementById("gender");
    if (!gender || gender === "") {
      if (genderEl) {
        genderEl.classList.add("input-error");
        getErrorEl(genderEl).textContent = "Please select gender.";
      }
      isValid = false;
    }

    // Contact
    const contactEl = document.getElementById("contact");
    if (!validContact(contact)) {
      if (contactEl) {
        contactEl.classList.add("input-error");
        getErrorEl(contactEl).textContent = "Contact must be 10 digits.";
      }
      isValid = false;
    } else {
      if (window.patients && Array.isArray(window.patients)) {
        const pf = document.getElementById("patientForm");
        const existing = window.patients.find(p => p.contact === contact.trim());
        if (existing && (!pf.dataset.id || existing.id != pf.dataset.id)) {
          if (contactEl) {
            contactEl.classList.add("input-error");
            getErrorEl(contactEl).textContent = "This contact is already registered.";
          }
          isValid = false;
        }
      }
    }

    // Email
    const emailEl = document.getElementById("email");
    if (email.trim() !== "" && !validEmail(email)) {
      if (emailEl) {
        emailEl.classList.add("input-error");
        getErrorEl(emailEl).textContent = "Enter a valid email address.";
      }
      isValid = false;
    }
    // DUPLICATE CHECK: same first + last + email 
    if (isValid && window.patients && Array.isArray(window.patients)) {
      const nameLower = firstName.trim().toLowerCase();
      const lastLower = lastName.trim().toLowerCase();
      const emailLower = email.trim().toLowerCase();

      // if user did NOT enter an email, skip this duplicate check
      if (emailLower !== "") {
        const pf = document.getElementById("patientForm");
        const alertBox = ensureAlertBox();

        const duplicate = window.patients.find(p =>
          (p.firstName || "").toString().trim().toLowerCase() === nameLower &&
          (p.lastName || "").toString().trim().toLowerCase() === lastLower &&
          ((p.email || "").toString().trim().toLowerCase() || "") === emailLower
        );

        if (duplicate && (!pf.dataset.id || duplicate.id != pf.dataset.id)) {
          alertBox.textContent = "This patient already exists with the same name and email.";
          alertBox.classList.remove("d-none");
          return false; // block submit
        } else {
          alertBox.classList.add("d-none");
        }
      } else {
        // ensure alert hidden if no email entered
        const alertBox = document.getElementById("duplicateAlert");
        if (alertBox) alertBox.classList.add("d-none");
      }
    }
    return isValid;
  }

  function attachLiveClearing() {
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", () => {
        el.classList.remove("input-error");
        const err = document.getElementById(id + "-error");
        if (err) err.textContent = "";
        const alertBox = document.getElementById("duplicateAlert");
        if (alertBox) alertBox.classList.add("d-none");
      });
      el.addEventListener("change", () => {
        el.classList.remove("input-error");
        const err = document.getElementById(id + "-error");
        if (err) err.textContent = "";
        const alertBox = document.getElementById("duplicateAlert");
        if (alertBox) alertBox.classList.add("d-none");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", attachLiveClearing);

  window.validatePatientForm = validatePatientForm;
  window.resetPatientErrors = resetErrors;
})();
