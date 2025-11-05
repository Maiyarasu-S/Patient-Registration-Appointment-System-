# 🏥 Sterlo Hospital – Patient Registration & Appointment System

A responsive single-page web application for managing patient registrations, appointments, and records — built using **HTML**, **CSS (Bootstrap 5 + Custom Theme)**, and **Vanilla JavaScript** with **LocalStorage** as the backend.

---

## 🚀 Features

### 👤 Patient Management

* Register new patients with validation (name, contact, age, etc.)
* Edit or delete patient details in a modern modal interface
* View all registered patients in a searchable records table

### 📅 Appointment Booking

* Book appointments by selecting department, doctor, and available time slots
* Prevent double-booking through slot validation
* Edit or cancel appointments easily
* Filter and export appointments to CSV

### 📊 Dashboard Overview

* Dynamic cards showing total, today’s, and upcoming appointments
* Search bar for instant appointment filtering
* Clean, responsive data tables for all records

### 💾 Local Data Storage

* Uses browser **LocalStorage** to store patients, doctors, and appointment data
* Works offline — no backend setup required

### 🎨 UI & UX

* Custom **Sea-green / Teal** color palette
* Modern typography (**Inter + Poppins**)
* Mobile-responsive layout with a **hamburger menu**
* Sticky sidebar for desktop and top-nav for mobile
* Smooth form validation and toast notifications

---

## 🧩 Tech Stack

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| Frontend         | HTML5, CSS3, Bootstrap 5      |
| Logic            | JavaScript (ES6)              |
| Data Persistence | LocalStorage                  |
| Icons            | Bootstrap Icons               |
| Fonts            | Google Fonts (Inter, Poppins) |

---

## 📁 Folder Structure

```
SterloHospital/
│
├── index.html               # Main app file
├── assets/
│   └── style.css            # Custom styling
├── js/
│   ├── app.js               # Core logic (routing, UI, CRUD)
│   ├── storage.js           # LocalStorage operations
│   └── validate.js          # Input validation
└── README.md
```

## 🧠 Learning Highlights

This project demonstrates:

* Building a **Single Page Application (SPA)** using only HTML, CSS, and JS.
* Implementing **modular JavaScript** with `storage.js` and `validate.js`.
* Designing clean UI using Bootstrap and custom color tokens.
* Managing **form validation, modals, and state** without frameworks.
* Applying UX principles — responsive layout, clear CTAs, and feedback.

---

## 🪄 Future Enhancements

* ✅ Doctor availability calendar
* ✅ Appointment reminders via email
* ⏳ Database (MySQL / Firebase) integration
* ⏳ Admin dashboard for analytics


This project is open-source under the **MIT License**.
