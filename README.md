# SwasthyaLink | Smart Hospital & Digital Healthcare Ecosystem

An integrated digital healthcare platform connecting patients with verified doctors, live OPD queue management, digital health records, pharmacy price comparisons, and an optional IoT emergency healthcare band (ESP32 + MAX30102).

Developed as an academic software engineering prototype based on the **Smart Hospital Management System** specification (Java, Swing, MySQL, JDBC, Web Architecture).

---

## 🌟 Key Features

### 1. Public Marketing & Ecosystem Showcase
- **Ecosystem Explorer**: Tabbed overview of the Mobile/Web App, Smart Hospital Operations Suite, Pharmacy Network, IoT Health Band, and AI Care Assistant.
- **Doctor Discovery & Specialty Matcher**: Dynamic directory search that maps patient symptoms (e.g. *headache*, *chest discomfort*, *joint pain*, *rash*) to clinical specialties with transparent consultation fee comparisons.
- **Live OPD Queue Monitor**: Real-time queue tracker showing current tokens being examined, waiting line counts, and melodic bell chimes.
- **Cross-Pharmacy Medicine Price Matrix**: Transparent price comparison across retail chemists and Jan Aushadhi Kendras with live stock status and savings indicators.
- **IoT Healthcare Band Simulator**: Realistic wrist wearable rendering a live arterial photoplethysmogram (PPG) pulse wave on an HTML5 canvas at 60fps, pulse-oximetry (SpO₂), and physical SOS trigger.
- **Emergency SOS 5-Step Safety Protocol**: 15-second configurable countdown timer, false-alarm cancel button, simulated GPS coordinate geocoding, and unconfirmed emergency escalation.
- **Academic Research Hub**: Complete documentation of the 4-layer system architecture, 5-member engineering team work division, and test case verification matrix.

---

### 2. Full Role-Based Management Portal
Instant 1-click workspace switching between 5 hospital roles:

1. **👤 Patient Portal (Aarav Singh / UHID: P0001)**
   - Active OPD token status & queue position
   - Interactive daily pill/dose reminder checklist with adherence tracking
   - Digital medical records & printable e-prescriptions
   - Vitals log with simulated one-click Bluetooth sync from the IoT band
   - Emergency SOS trigger

2. **👨‍⚕️ Doctor Workspace (Dr. Rohan Sharma - General Medicine)**
   - OPD consultation room queue
   - "Call Next Patient" workflow with melodic chime
   - Clinical assessment: symptoms, examination notes, final diagnosis, treatment plan
   - Electronic Prescription (e-Rx) builder with dosage, frequency, and duration
   - Auto-generates billing invoices upon completing a visit

3. **🛎️ Reception Desk (Front Desk / Triage)**
   - Rapid patient registration with automatic UHID generation
   - Appointment conflict management (double-booking collision detection)
   - Walk-in and scheduled check-in token generator
   - Master live queue board with real-time status transitions

4. **💊 Pharmacy Counter (CityCare Pharmacy)**
   - Live inventory management with low-stock alerts (<20 units)
   - Real-time medication dispensing linked to doctor prescriptions
   - Stock deduction and transaction audit logs

5. **⚙️ Hospital Administrator**
   - Executive operational analytics (patient visits, active doctors, revenue billed vs. collected)
   - Doctor directory & department configurations
   - Billing and receipt management
   - Emergency SOS Command Center for monitoring and acknowledging incoming distress alerts
   - Database reset button to restore fresh demo seed data

---

## 📂 Project Structure

```text
swasthyalink-hospital/
├── index.html          # Semantic HTML5 single-page application & showcase
├── css/
│   └── style.css       # Responsive medical design system (Light/Dark themes)
├── js/
│   └── app.js          # Core engine, Web Audio synthesis, PPG canvas, state & routing
└── README.md           # Documentation & specification overview
```

---

## 🚀 How to Run & View

1. **Open in Any Web Browser**:
   - Double-click `index.html` or open `file:///C:/Users/Admin/.gemini/antigravity/scratch/swasthyalink-hospital/index.html` directly in Chrome, Edge, Firefox, or Safari.
   - Zero build tools or npm dependencies required—100% self-contained and performant.

2. **Audio & Dark Mode**:
   - Click the **🌙 / ☀️** button in the header to toggle between light and dark themes.
   - Click **🔔 Sound ON / 🔕 Muted** to enable or silence hospital bell chimes and pulse sounds.

3. **Workspace Recommendation**:
   - You can set `C:\Users\Admin\.gemini\antigravity\scratch\swasthyalink-hospital` as your active workspace in Antigravity.
