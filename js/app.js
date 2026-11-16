/**
 * SwasthyaLink - Smart Hospital & Digital Healthcare Ecosystem
 * High-Fidelity Interactive Web Application & Portal Engine
 */

(function () {
  'use strict';

  // --- Storage Key & State ---
  const STORAGE_KEY = 'swasthyalink_hospital_db_v2';
  let db = null;
  let currentRole = 'patient'; // 'patient' | 'doctor' | 'reception' | 'pharmacy' | 'admin'
  let currentUser = null;
  let activePortalTab = 'overview';
  let soundEnabled = true;

  // --- Audio Synthesis Engine (Web Audio API) ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, duration, type = 'sine', volume = 0.15) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not permitted or failed
    }
  }

  function playTokenChime() {
    // 2-tone melodic hospital chime (C5 -> G5)
    playTone(523.25, 0.35, 'sine', 0.2);
    setTimeout(() => playTone(783.99, 0.5, 'sine', 0.2), 200);
  }

  function playHeartbeatSound() {
    // Soft double thump
    playTone(65, 0.08, 'triangle', 0.1);
    setTimeout(() => playTone(55, 0.08, 'triangle', 0.08), 120);
  }

  function playTickSound() {
    playTone(880, 0.05, 'square', 0.05);
  }

  function playAlarmSound() {
    playTone(750, 0.15, 'sawtooth', 0.2);
    setTimeout(() => playTone(600, 0.15, 'sawtooth', 0.2), 150);
  }

  // --- Default Seed Database ---
  function getSeedDatabase() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowIso = new Date().toISOString();

    return {
      version: 2,
      counter: 120,
      departments: [
        'General Medicine',
        'Cardiology',
        'Neurology',
        'Orthopaedics',
        'Dermatology',
        'Paediatrics'
      ],
      doctors: [
        { id: 'D1', name: 'Dr. Rohan Sharma', spec: 'General Medicine', fee: 400, from: 9, to: 13, loc: 'OPD A-101', phone: '0131-555-0101', qual: 'MBBS, MD (Gen Med)' },
        { id: 'D2', name: 'Dr. Anita Gupta', spec: 'Cardiology', fee: 900, from: 10, to: 14, loc: 'OPD B-204', phone: '0131-555-0102', qual: 'MBBS, MD, DM (Cardio)' },
        { id: 'D3', name: 'Dr. Vikram Rao', spec: 'Neurology', fee: 1000, from: 11, to: 15, loc: 'OPD B-210', phone: '0131-555-0103', qual: 'MBBS, DM (Neuro)' },
        { id: 'D4', name: 'Dr. Sunita Verma', spec: 'Orthopaedics', fee: 800, from: 9, to: 12, loc: 'OPD C-110', phone: '0131-555-0104', qual: 'MBBS, MS (Ortho)' },
        { id: 'D5', name: 'Dr. Kabir Mehta', spec: 'Dermatology', fee: 600, from: 14, to: 18, loc: 'OPD A-120', phone: '0131-555-0105', qual: 'MBBS, MD (Derm)' },
        { id: 'D6', name: 'Dr. Priya Nair', spec: 'Paediatrics', fee: 500, from: 9, to: 13, loc: 'OPD D-101', phone: '0131-555-0106', qual: 'MBBS, DCH, MD (Paed)' }
      ],
      patients: [
        { id: 'P0001', name: 'Aarav Singh', age: 28, gender: 'Male', phone: '9876500001', addr: 'Civil Lines, Muzaffarnagar', ec: 'Neha Singh', ecp: '9876500002', blood: 'O+' },
        { id: 'P0002', name: 'Meera Rao', age: 54, gender: 'Female', phone: '9876500003', addr: 'Delhi Road, Muzaffarnagar', ec: 'Karan Rao', ecp: '9876500004', blood: 'B+' },
        { id: 'P0003', name: 'Sunil Verma', age: 42, gender: 'Male', phone: '9876500005', addr: 'Station Road, Muzaffarnagar', ec: 'Pooja Verma', ecp: '9876500006', blood: 'A+' }
      ],
      appointments: [
        { id: 'A1001', pid: 'P0001', did: 'D1', date: todayStr, time: '10:30', status: 'Booked', reason: 'Routine checkup & seasonal cough' },
        { id: 'A1002', pid: 'P0002', did: 'D2', date: todayStr, time: '11:00', status: 'Booked', reason: 'Hypertension follow-up' },
        { id: 'A1003', pid: 'P0003', did: 'D4', date: todayStr, time: '10:00', status: 'Completed', reason: 'Knee joint pain' }
      ],
      queue: [
        { id: 'Q101', tok: 11, pid: 'P0003', did: 'D4', date: todayStr, status: 'Completed', time: '09:45' },
        { id: 'Q102', tok: 12, pid: 'P0001', did: 'D1', date: todayStr, status: 'In Consultation', time: '10:15' },
        { id: 'Q103', tok: 13, pid: 'P0002', did: 'D2', date: todayStr, status: 'Waiting', time: '10:40' }
      ],
      records: [
        {
          id: 'REC01',
          pid: 'P0001',
          did: 'D1',
          date: todayStr,
          symptoms: 'Mild productive cough, low-grade evening fever for 3 days',
          notes: 'Chest clear bilaterally, throat mild congestion, no respiratory distress.',
          diagnosis: 'Acute Upper Respiratory Tract Infection',
          plan: 'Steam inhalation, oral antibiotics, paracetamol SOS, follow up in 5 days if fever persists.',
          author: 'Dr. Rohan Sharma'
        }
      ],
      prescriptions: [
        {
          id: 'RX001',
          pid: 'P0001',
          did: 'D1',
          date: todayStr,
          items: [
            { med: 'Amoxicillin', str: '500 mg', dose: '1 Capsule', freq: 'Twice daily', days: 5, inst: 'After meals' },
            { med: 'Paracetamol', str: '500 mg', dose: '1 Tablet', freq: 'Three times daily', days: 3, inst: 'When fever > 100°F' },
            { med: 'Cetirizine', str: '10 mg', dose: '1 Tablet', freq: 'Once daily', days: 5, inst: 'At bedtime' }
          ]
        }
      ],
      dosesTaken: {
        [`${todayStr}_RX001_0_09:00`]: true
      },
      vitals: [
        { pid: 'P0001', t: 'Today 09:30', hr: 74, sp: 98, temp: 98.4, note: 'Normal morning resting reading' },
        { pid: 'P0001', t: 'Yesterday 20:00', hr: 82, sp: 97, temp: 99.1, note: 'Mild evening fatigue' },
        { pid: 'P0002', t: 'Today 08:45', hr: 78, sp: 96, temp: 98.6, note: 'Baseline before medication' }
      ],
      pharmacies: [
        {
          id: 'PH1',
          name: 'CityCare Pharmacy (In-Hospital)',
          addr: 'OPD Ground Floor, Hospital Road',
          dist: 0.1,
          hours: '24 Hours',
          phone: '0131-555-0201',
          isLiveEditable: true,
          updated: nowIso,
          stock: [
            { med: 'Paracetamol', str: '500 mg', pack: 'Strip of 15', price: 28, qty: 140 },
            { med: 'Amoxicillin', str: '500 mg', pack: 'Strip of 10', price: 92, qty: 45 },
            { med: 'Metformin', str: '500 mg', pack: 'Strip of 10', price: 22, qty: 12 },
            { med: 'Atorvastatin', str: '10 mg', pack: 'Strip of 15', price: 110, qty: 65 },
            { med: 'Cetirizine', str: '10 mg', pack: 'Strip of 10', price: 24, qty: 85 },
            { med: 'Azithromycin', str: '500 mg', pack: 'Strip of 5', price: 115, qty: 30 },
            { med: 'Pantoprazole', str: '40 mg', pack: 'Strip of 10', price: 65, qty: 50 }
          ]
        },
        {
          id: 'PH2',
          name: 'Jan Aushadhi Kendra',
          addr: 'Civil Lines, Opp. Bus Stand',
          dist: 1.2,
          hours: '09:00 – 21:00',
          phone: '0131-555-0202',
          isLiveEditable: false,
          updated: nowIso,
          stock: [
            { med: 'Paracetamol', str: '500 mg', pack: 'Strip of 15', price: 18, qty: 90 },
            { med: 'Amoxicillin', str: '500 mg', pack: 'Strip of 10', price: 68, qty: 40 },
            { med: 'Metformin', str: '500 mg', pack: 'Strip of 10', price: 14, qty: 70 },
            { med: 'Atorvastatin', str: '10 mg', pack: 'Strip of 15', price: 75, qty: 35 },
            { med: 'Cetirizine', str: '10 mg', pack: 'Strip of 10', price: 16, qty: 60 }
          ]
        },
        {
          id: 'PH3',
          name: 'MediPlus Super Chemist',
          addr: 'Delhi Road Crossing',
          dist: 2.5,
          hours: '24 Hours',
          phone: '0131-555-0203',
          isLiveEditable: false,
          updated: nowIso,
          stock: [
            { med: 'Paracetamol', str: '500 mg', pack: 'Strip of 15', price: 32, qty: 0 },
            { med: 'Amoxicillin', str: '500 mg', pack: 'Strip of 10', price: 98, qty: 18 },
            { med: 'Metformin', str: '500 mg', pack: 'Strip of 10', price: 25, qty: 25 },
            { med: 'Atorvastatin', str: '10 mg', pack: 'Strip of 15', price: 125, qty: 40 },
            { med: 'Cetirizine', str: '10 mg', pack: 'Strip of 10', price: 28, qty: 30 }
          ]
        }
      ],
      dispensedLogs: [
        { id: 'DSP01', time: 'Today 10:10', med: 'Amoxicillin 500 mg', qty: 1, rxId: 'RX001', patient: 'Aarav Singh' }
      ],
      bills: [
        {
          id: 'INV1001',
          pid: 'P0001',
          date: todayStr,
          items: [
            { name: 'OPD Consultation - Dr. Rohan Sharma', amt: 400 },
            { name: 'Basic CBC Lab Test', amt: 300 }
          ],
          paid: 400
        },
        {
          id: 'INV1002',
          pid: 'P0003',
          date: todayStr,
          items: [
            { name: 'OPD Consultation - Dr. Sunita Verma', amt: 800 },
            { name: 'Knee Joint X-Ray (AP/Lat)', amt: 500 }
          ],
          paid: 1300
        }
      ],
      hospitals: [
        { name: 'City Hospital & Medical College', addr: 'Hospital Road, Muzaffarnagar', phone: '0131-555-0111', dist: 0.8, beds: 'Verified: 14 ICU / 42 General', depts: 'Trauma, Emergency, Cardiology, Surgery, Paediatrics' },
        { name: 'Sunrise Multispeciality Hospital', addr: 'Delhi Road, Muzaffarnagar', phone: '0131-555-0112', dist: 3.2, beds: 'Sample Data Only', depts: 'Neurology, Nephrology, General Medicine, Ortho' },
        { name: 'District Civil Hospital', addr: 'Civil Lines, Muzaffarnagar', phone: '0131-555-0113', dist: 4.5, beds: 'Sample Data Only', depts: 'General OPD, Maternal Care, Emergency 24x7' }
      ],
      sosAlerts: [
        {
          id: 'SOS901',
          pid: 'P0001',
          patientName: 'Aarav Singh',
          ts: 'Today 08:15',
          status: 'Acknowledged',
          unconfirmed: false,
          loc: { lat: 29.4727, lng: 77.7085, text: 'Muzaffarnagar, UP' },
          logs: [
            ['08:15:00', 'SOS Triggered via App Emergency Button'],
            ['08:15:10', 'Patient confirmed emergency during countdown'],
            ['08:15:11', 'Emergency contacts alerted (SMS simulated)'],
            ['08:16:30', 'Command Center Acknowledged by Dr. Rohan Sharma']
          ]
        }
      ]
    };
  }

  function initDatabase() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        db = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading localStorage:', e);
    }
    if (!db || db.version !== 2) {
      db = getSeedDatabase();
      saveDatabase();
    }
    currentUser = db.patients[0]; // Default logged-in patient
  }

  function saveDatabase() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  // --- Utility Functions ---
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  function showToast(message, type = 'success') {
    const container = $('#toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'danger' ? '⚠️' : type === 'warning' ? '🔔' : '✅';
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Realtime ECG / PPG Canvas Simulation ---
  let ppgX = 0;
  let ppgY = 35;
  let animFrameId = null;

  function initPPGCanvas() {
    const canvas = $('#ecgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.fillStyle = '#060b13';
    ctx.fillRect(0, 0, width, height);

    function step() {
      // Draw grid subtle line
      ctx.fillStyle = 'rgba(6, 11, 19, 0.05)';
      ctx.fillRect(ppgX, 0, 4, height);

      // Arterial Pulse Waveform function
      const t = (ppgX % 120);
      let targetY = height / 2;

      if (t > 20 && t < 35) {
        // Systolic peak
        targetY = (height / 2) - 25 * Math.sin(((t - 20) / 15) * Math.PI);
      } else if (t >= 35 && t < 45) {
        // Dicrotic notch
        targetY = (height / 2) - 8 * Math.sin(((t - 35) / 10) * Math.PI);
      } else if (t >= 45 && t < 65) {
        // Diastolic wave
        targetY = (height / 2) - 12 * Math.sin(((t - 45) / 20) * Math.PI);
      } else {
        // Baseline noise
        targetY = (height / 2) + (Math.random() - 0.5) * 2;
      }

      ctx.beginPath();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.moveTo(ppgX, ppgY);
      ctx.lineTo(ppgX + 2, targetY);
      ctx.stroke();

      ppgY = targetY;
      ppgX = (ppgX + 2) % width;

      // Pulse audio tick when peak is reached
      if (t === 28) {
        playHeartbeatSound();
      }

      animFrameId = requestAnimationFrame(step);
    }

    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(step);
  }

  // --- Symptom Matcher Map ---
  const SYMPTOM_MAP = [
    { regex: /chest|heart|bp|palpitation|pressure/i, dept: 'Cardiology', reason: 'Symptoms match cardiovascular health specialty.' },
    { regex: /headache|migraine|seizure|dizzy|numb|neuro/i, dept: 'Neurology', reason: 'Neurological evaluation recommended for chronic headaches or dizziness.' },
    { regex: /bone|joint|fracture|knee|back pain|sprain|spine/i, dept: 'Orthopaedics', reason: 'Bone, joint and musculoskeletal symptoms match Orthopaedics.' },
    { regex: /skin|rash|acne|itch|allergy|derma/i, dept: 'Dermatology', reason: 'Cutaneous eruptions and skin conditions match Dermatology.' },
    { regex: /child|baby|infant|kid|vaccination/i, dept: 'Paediatrics', reason: 'Children health, immunisation and growth match Paediatrics.' },
    { regex: /fever|cough|cold|stomach|flu|weakness|general/i, dept: 'General Medicine', reason: 'General practitioner / internal medicine is ideal for initial assessment.' }
  ];

  // --- Rendering Functions ---

  // 1. Render Public Showcase
  function renderPublicShowcase() {
    // Dynamic Stats
    const activeWaiting = db.queue.filter(q => q.status === 'Waiting').length;
    const currentConsulting = db.queue.find(q => q.status === 'In Consultation');
    const heroTokenVal = currentConsulting ? currentConsulting.tok : (db.queue[0]?.tok || 12);
    
    if ($('#heroTokenNumber')) $('#heroTokenNumber').textContent = heroTokenVal;
    if ($('#heroWaitingCount')) $('#heroWaitingCount').textContent = activeWaiting;

    renderDoctorCards();
    renderMedicineComparisonTable();
    initPPGCanvas();
  }

  function renderDoctorCards(filterSpec = '', query = '') {
    const container = $('#doctorsGrid');
    if (!container) return;

    let filtered = db.doctors.slice();
    if (filterSpec) {
      filtered = filtered.filter(d => d.spec === filterSpec);
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(d => d.name.toLowerCase().includes(q) || d.spec.toLowerCase().includes(q));
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div class="card" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p class="text-muted">No doctors found matching "${escapeHtml(query || filterSpec)}". Try another speciality or symptom.</p>
      </div>`;
      return;
    }

    container.innerHTML = filtered.map(doc => {
      return `
        <div class="doctor-card">
          <div class="doc-header">
            <div class="doc-avatar">${doc.name.replace('Dr. ', '').charAt(0)}</div>
            <div class="doc-info">
              <h4>${escapeHtml(doc.name)}</h4>
              <span class="doc-spec">${escapeHtml(doc.spec)}</span>
            </div>
          </div>
          <div class="doc-meta">
            <div>📍 <strong>Location:</strong> ${escapeHtml(doc.loc)}</div>
            <div>⏰ <strong>OPD Hours:</strong> ${doc.from}:00 – ${doc.to}:00</div>
            <div>🎓 <strong>Credentials:</strong> ${escapeHtml(doc.qual)}</div>
          </div>
          <div class="doc-footer">
            <div>
              <div class="doc-fee">₹${doc.fee} <small>/ visit</small></div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.app.quickBookDoctor('${doc.id}')">Book Appointment</button>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderMedicineComparisonTable(searchQuery = '') {
    const tbody = $('#pharmacyComparisonBody');
    if (!tbody) return;

    const q = searchQuery.toLowerCase().trim();
    let rows = [];

    db.pharmacies.forEach(pharm => {
      pharm.stock.forEach(item => {
        if (!q || item.med.toLowerCase().includes(q)) {
          rows.push({
            pharmName: pharm.name,
            isLive: pharm.isLiveEditable,
            dist: pharm.dist,
            hours: pharm.hours,
            phone: pharm.phone,
            updated: pharm.updated,
            ...item
          });
        }
      });
    });

    // Group by medicine to find lowest price
    const minPrices = {};
    rows.forEach(r => {
      const key = `${r.med}_${r.str}`;
      if (!minPrices[key] || r.price < minPrices[key]) {
        minPrices[key] = r.price;
      }
    });

    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">No medicines found matching "${escapeHtml(searchQuery)}".</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(r => {
      const isLowest = r.price === minPrices[`${r.med}_${r.str}`];
      const stockBadge = r.qty === 0 
        ? `<span class="badge badge-danger">Out of Stock</span>`
        : r.qty < 20 
          ? `<span class="badge badge-warning">${r.qty} Left</span>` 
          : `<span class="badge badge-success">In Stock (${r.qty})</span>`;

      return `
        <tr>
          <td>
            <strong>${escapeHtml(r.med)}</strong> ${escapeHtml(r.str)}
            <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(r.pack)}</div>
          </td>
          <td>
            <strong>${escapeHtml(r.pharmName)}</strong>
            ${r.isLive ? '<span class="badge badge-primary" style="font-size:0.65rem">Hospital Live</span>' : '<span class="badge" style="font-size:0.65rem">Partner</span>'}
            <div style="font-size: 0.75rem; color: var(--text-muted);">${r.dist} km · ${escapeHtml(r.hours)}</div>
          </td>
          <td>
            <span style="font-size: 1.1rem; font-weight: 800; font-family: var(--font-mono)">₹${r.price}</span>
            ${isLowest ? '<span class="badge badge-success" style="margin-left: 0.3rem">Best Price</span>' : ''}
          </td>
          <td>${stockBadge}</td>
          <td><a href="tel:${r.phone}">${r.phone}</a></td>
          <td style="font-size: 0.8rem; color: var(--text-muted);">${new Date(r.updated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
        </tr>
      `;
    }).join('');
  }

  // --- Portal App Mode Switching ---
  function setPortalRole(role) {
    currentRole = role;
    $$('.role-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.role === role);
    });

    // Update active user context based on role
    if (role === 'patient') currentUser = db.patients[0];
    else if (role === 'doctor') currentUser = db.doctors[0];
    else if (role === 'reception') currentUser = { name: 'Front Desk Officer', id: 'STAFF01', role: 'Reception' };
    else if (role === 'pharmacy') currentUser = { name: 'Lead Pharmacist', id: 'PHARM01', role: 'Pharmacy' };
    else if (role === 'admin') currentUser = { name: 'Hospital Administrator', id: 'ADMIN01', role: 'Admin' };

    renderPortalSidebar();
    renderPortalActiveView();
    showToast(`Switched workspace to ${currentUser.name} (${role.toUpperCase()})`);
  }

  function renderPortalSidebar() {
    const userBadge = $('#portalUserBadge');
    const navContainer = $('#portalNavButtons');
    if (!userBadge || !navContainer) return;

    userBadge.innerHTML = `
      <div class="portal-user-avatar">${currentUser.name.charAt(0)}</div>
      <div>
        <div style="font-weight: 700; font-size: 0.95rem;">${escapeHtml(currentUser.name)}</div>
        <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">${escapeHtml(currentRole)}</div>
      </div>
    `;

    // Role-specific nav items
    let navItems = [];
    if (currentRole === 'patient') {
      navItems = [
        { id: 'pat_dashboard', label: 'My Care & Token', icon: '🩺' },
        { id: 'pat_appointments', label: 'My Appointments', icon: '📅' },
        { id: 'pat_prescriptions', label: 'Prescriptions & Doses', icon: '💊' },
        { id: 'pat_vitals', label: 'Vitals & IoT Band', icon: '💓' },
        { id: 'pat_sos', label: 'Emergency SOS', icon: '🚨' }
      ];
    } else if (currentRole === 'doctor') {
      navItems = [
        { id: 'doc_queue', label: 'OPD Patient Queue', icon: '👥' },
        { id: 'doc_consult', label: 'Consultation Room', icon: '📝' },
        { id: 'doc_schedule', label: 'My Appointment Slots', icon: '🗓️' }
      ];
    } else if (currentRole === 'reception') {
      navItems = [
        { id: 'rec_checkin', label: 'Check-In & Tokens', icon: '🎫' },
        { id: 'rec_register', label: 'Patient Registration', icon: '➕' },
        { id: 'rec_appts', label: 'Master Appointment Desk', icon: '📋' }
      ];
    } else if (currentRole === 'pharmacy') {
      navItems = [
        { id: 'ph_inventory', label: 'Medicine Inventory', icon: '📦' },
        { id: 'ph_dispense', label: 'Dispense Prescriptions', icon: '💊' },
        { id: 'ph_compare', label: 'Price Benchmark Matrix', icon: '📊' }
      ];
    } else if (currentRole === 'admin') {
      navItems = [
        { id: 'adm_metrics', label: 'Hospital Analytics', icon: '📈' },
        { id: 'adm_billing', label: 'Billing & Invoicing', icon: '💳' },
        { id: 'adm_sos_monitor', label: 'Emergency Command Desk', icon: '🚨' },
        { id: 'adm_doctors', label: 'Doctors & Departments', icon: '👨‍⚕️' }
      ];
    }

    if (!navItems.some(n => n.id === activePortalTab)) {
      activePortalTab = navItems[0].id;
    }

    navContainer.innerHTML = navItems.map(item => `
      <button class="portal-nav-btn ${item.id === activePortalTab ? 'active' : ''}" onclick="window.app.setPortalTab('${item.id}')">
        <span>${item.icon}</span> <span>${escapeHtml(item.label)}</span>
      </button>
    `).join('');
  }

  function renderPortalActiveView() {
    const container = $('#portalMainContent');
    if (!container) return;

    if (currentRole === 'patient') {
      renderPatientViews(container);
    } else if (currentRole === 'doctor') {
      renderDoctorViews(container);
    } else if (currentRole === 'reception') {
      renderReceptionViews(container);
    } else if (currentRole === 'pharmacy') {
      renderPharmacyViews(container);
    } else if (currentRole === 'admin') {
      renderAdminViews(container);
    }
  }

  // --- Patient Views ---
  function renderPatientViews(container) {
    const patient = db.patients.find(p => p.id === currentUser.id) || db.patients[0];
    const todayStr = new Date().toISOString().slice(0, 10);
    
    // Find active token
    const myToken = db.queue.find(q => q.pid === patient.id && q.date === todayStr && q.status !== 'Completed');
    const myAppts = db.appointments.filter(a => a.pid === patient.id);
    const myRx = db.prescriptions.filter(r => r.pid === patient.id);
    const myVitals = db.vitals.filter(v => v.pid === patient.id);

    if (activePortalTab === 'pat_dashboard') {
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div>
            <h2>Welcome back, ${escapeHtml(patient.name)}</h2>
            <p>UHID: <strong>${patient.id}</strong> · Age: ${patient.age} · Blood Group: ${patient.blood || 'O+'}</p>
          </div>
          <button class="btn btn-danger" onclick="window.app.triggerSOSModal()">🚨 SOS Emergency</button>
        </div>

        <div class="metrics-grid" style="margin-bottom: 2rem;">
          <div class="card" style="text-align: left;">
            <span class="text-muted" style="font-size:0.8rem">ACTIVE OPD TOKEN</span>
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--primary);">
              ${myToken ? `#${myToken.tok}` : 'None Active'}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              ${myToken ? `Status: <strong>${myToken.status}</strong>` : 'Check in at reception to get a token'}
            </div>
          </div>
          <div class="card" style="text-align: left;">
            <span class="text-muted" style="font-size:0.8rem">UPCOMING APPOINTMENT</span>
            <div style="font-size: 1.3rem; font-weight: 700; margin: 0.4rem 0;">
              ${myAppts[0] ? `${myAppts[0].date} @ ${myAppts[0].time}` : 'No Upcoming'}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              ${myAppts[0] ? `With ${escapeHtml(db.doctors.find(d => d.id === myAppts[0].did)?.name)}` : 'Book online anytime'}
            </div>
          </div>
          <div class="card" style="text-align: left;">
            <span class="text-muted" style="font-size:0.8rem">TODAY'S MEDICINES</span>
            <div style="font-size: 2.2rem; font-weight: 800; color: var(--success);">
              ${calculateDosesToday(patient.id)}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Scheduled doses tracked today</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div class="card">
            <h3>💊 Today's Dose Checklist</h3>
            <p class="text-muted" style="font-size: 0.85rem;">Interactive adherence reminder. Mark medications as you take them.</p>
            <div class="dose-list">
              ${renderDoseChecklistHtml(patient.id)}
            </div>
          </div>

          <div class="card">
            <h3>📊 Recent Wearable Vitals</h3>
            <p class="text-muted" style="font-size: 0.85rem;">Synced with SwasthyaLink Healthcare Band (MAX30102 + ESP32).</p>
            <div style="margin-bottom: 1.25rem;">
              <button class="btn btn-outline btn-sm" onclick="window.app.simulateSyncWearable()">🔄 Sync Live from Wearable Band</button>
            </div>
            <div class="table-custom-wrap">
              <table class="table-custom">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Pulse</th>
                    <th>SpO₂</th>
                    <th>Temp</th>
                  </tr>
                </thead>
                <tbody>
                  ${myVitals.slice(0, 4).map(v => `
                    <tr>
                      <td>${v.t}</td>
                      <td><strong style="color:var(--danger)">${v.hr} bpm</strong></td>
                      <td><strong style="color:var(--accent)">${v.sp}%</strong></td>
                      <td>${v.temp ? v.temp + '°F' : '–'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    } else if (activePortalTab === 'pat_prescriptions') {
      container.innerHTML = `
        <h2>My Prescriptions & Medical Records</h2>
        <p class="text-muted">Digital health records, diagnosis history, and e-prescriptions generated by hospital doctors.</p>
        
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${myRx.map(rx => {
            const doc = db.doctors.find(d => d.id === rx.did);
            const rec = db.records.find(r => r.pid === rx.pid && r.date === rx.date);
            return `
              <div class="rx-sheet">
                <div class="rx-header-row">
                  <div>
                    <span class="rx-symbol">℞</span>
                    <h3 style="margin: 0.5rem 0 0.2rem;">${escapeHtml(doc?.name || 'Attending Physician')}</h3>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(doc?.spec)} · ${escapeHtml(doc?.qual)}</div>
                  </div>
                  <div style="text-align: right;">
                    <strong>Prescription ID: ${rx.id}</strong>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">Date: ${rx.date}</div>
                    <button class="btn btn-outline btn-sm no-print" style="margin-top: 0.5rem;" onclick="window.print()">🖨️ Print Prescription</button>
                  </div>
                </div>

                ${rec ? `
                  <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;">
                    <strong>Diagnosis:</strong> ${escapeHtml(rec.diagnosis)}<br>
                    <small style="color: var(--text-muted)"><strong>Clinical Notes:</strong> ${escapeHtml(rec.notes)}</small>
                  </div>
                ` : ''}

                <table class="table-custom">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Strength</th>
                      <th>Dose</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rx.items.map(it => `
                      <tr>
                        <td><strong>${escapeHtml(it.med)}</strong></td>
                        <td>${escapeHtml(it.str)}</td>
                        <td>${escapeHtml(it.dose)}</td>
                        <td><span class="badge badge-primary">${escapeHtml(it.freq)}</span></td>
                        <td>${it.days} days</td>
                        <td>${escapeHtml(it.inst)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (activePortalTab === 'pat_appointments') {
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <h2>My Appointments</h2>
            <p class="text-muted">Manage scheduled hospital consultations and check-in times.</p>
          </div>
          <button class="btn btn-primary" onclick="window.app.quickBookDoctor()">+ Book New Appointment</button>
        </div>

        <div class="card">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Appt ID</th>
                <th>Doctor</th>
                <th>Speciality</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${myAppts.map(a => {
                const doc = db.doctors.find(d => d.id === a.did);
                return `
                  <tr>
                    <td><strong>${a.id}</strong></td>
                    <td>${escapeHtml(doc?.name)}</td>
                    <td>${escapeHtml(doc?.spec)}</td>
                    <td>${a.date} at ${a.time}</td>
                    <td><span class="badge ${a.status === 'Completed' ? 'badge-success' : a.status === 'Cancelled' ? 'badge-danger' : 'badge-primary'}">${a.status}</span></td>
                    <td>
                      ${a.status === 'Booked' ? `
                        <button class="btn btn-sm btn-outline" onclick="window.app.cancelAppointment('${a.id}')">Cancel</button>
                      ` : '–'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activePortalTab === 'pat_vitals') {
      container.innerHTML = `
        <h2>Vitals & Health Band Sync</h2>
        <p class="text-muted">Biometric readings recorded manually or transmitted from the optional ESP32 + MAX30102 wrist band.</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
          <div class="card">
            <h3>Manual Vitals Entry</h3>
            <form id="vitalsForm" onsubmit="window.app.submitVitals(event)">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Heart Rate (bpm)</label>
                  <input type="number" class="form-control" name="hr" placeholder="e.g. 75" required min="40" max="220">
                </div>
                <div class="form-group">
                  <label class="form-label">SpO₂ (%)</label>
                  <input type="number" class="form-control" name="sp" placeholder="e.g. 98" required min="70" max="100">
                </div>
                <div class="form-group">
                  <label class="form-label">Temperature (°F)</label>
                  <input type="number" step="0.1" class="form-control" name="temp" placeholder="e.g. 98.6">
                </div>
                <div class="form-group">
                  <label class="form-label">Observation Notes</label>
                  <input type="text" class="form-control" name="note" placeholder="e.g. Post-exercise">
                </div>
              </div>
              <button type="submit" class="btn btn-primary">Save Biometric Reading</button>
            </form>
          </div>

          <div class="card" style="background: linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(2, 132, 199, 0.08) 100%);">
            <h3>SwasthyaLink IoT Band Sync</h3>
            <p style="font-size: 0.9rem;">The optional wrist wearable transmits continuous photoplethysmogram (PPG) pulses directly to your phone via Bluetooth Low Energy (BLE).</p>
            <div style="margin: 1.5rem 0;">
              <span class="status-pill"><span class="status-dot"></span> IoT Hardware Connected</span>
            </div>
            <button class="btn btn-outline" onclick="window.app.simulateSyncWearable()">📡 Read Live Sensor Telemetry</button>
          </div>
        </div>

        <div class="card">
          <h3>Historical Readings Log</h3>
          <table class="table-custom">
            <thead>
              <tr>
                <th>Recorded At</th>
                <th>Heart Rate</th>
                <th>SpO₂ Blood Oxygen</th>
                <th>Body Temp</th>
                <th>Clinical Notes</th>
              </tr>
            </thead>
            <tbody>
              ${myVitals.map(v => `
                <tr>
                  <td>${v.t}</td>
                  <td><strong>${v.hr} bpm</strong></td>
                  <td><strong>${v.sp}%</strong></td>
                  <td>${v.temp ? v.temp + ' °F' : '–'}</td>
                  <td>${escapeHtml(v.note || 'Regular Check')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activePortalTab === 'pat_sos') {
      container.innerHTML = `
        <div style="max-width: 600px; margin: 0 auto; text-align: center;">
          <h2>Emergency SOS Hub</h2>
          <p class="text-muted">Instant emergency dispatch simulator with countdown, GPS geocoding, and automated escalation to emergency contacts.</p>

          <div class="sos-demo-card" style="margin: 2rem 0;">
            <button class="sos-trigger-circle" onclick="window.app.triggerSOSModal()">SOS</button>
            <h3>Press to Trigger Emergency Alert</h3>
            <p style="font-size: 0.9rem; color: var(--text-muted);">
              A 15-second safety timer starts immediately. If not canceled, it notifies:
              <br><strong>${escapeHtml(patient.ec)}</strong> (${patient.ecp})
            </p>
          </div>

          <div class="card" style="text-align: left;">
            <h4>Recent Emergency Dispatches</h4>
            <div class="table-custom-wrap">
              <table class="table-custom">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  ${db.sosAlerts.filter(s => s.pid === patient.id).map(s => `
                    <tr>
                      <td>${s.ts}</td>
                      <td><span class="badge ${s.status === 'Acknowledged' ? 'badge-success' : 'badge-danger'}">${s.status}</span></td>
                      <td>${s.loc.text}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }
  }

  function calculateDosesToday(pid) {
    const rxList = db.prescriptions.filter(r => r.pid === pid);
    let count = 0;
    rxList.forEach(rx => {
      count += rx.items.length;
    });
    return `${count} Doses`;
  }

  function renderDoseChecklistHtml(pid) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const rxList = db.prescriptions.filter(r => r.pid === pid);
    if (rxList.length === 0) return '<p class="text-muted">No active prescriptions prescribed.</p>';

    let html = '';
    rxList.forEach(rx => {
      rx.items.forEach((item, idx) => {
        const key = `${todayStr}_${rx.id}_${idx}_09:00`;
        const isTaken = !!db.dosesTaken[key];

        html += `
          <div class="dose-card ${isTaken ? 'taken' : ''}">
            <div>
              <strong>${escapeHtml(item.med)} ${escapeHtml(item.str)}</strong>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(item.dose)} · ${escapeHtml(item.freq)} (${escapeHtml(item.inst)})</div>
            </div>
            <button class="btn btn-sm ${isTaken ? 'btn-secondary' : 'btn-primary'}" onclick="window.app.toggleDose('${key}')">
              ${isTaken ? '✓ Taken' : 'Mark Taken'}
            </button>
          </div>
        `;
      });
    });
    return html;
  }

  // --- Doctor Views ---
  function renderDoctorViews(container) {
    const doc = db.doctors.find(d => d.id === currentUser.id) || db.doctors[0];
    const todayStr = new Date().toISOString().slice(0, 10);
    const docQueue = db.queue.filter(q => q.did === doc.id && q.date === todayStr);

    if (activePortalTab === 'doc_queue') {
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div>
            <h2>${escapeHtml(doc.name)} – OPD Queue</h2>
            <p>${escapeHtml(doc.spec)} · Room: ${escapeHtml(doc.loc)} · Consultation Fee: ₹${doc.fee}</p>
          </div>
          <button class="btn btn-primary" onclick="window.app.callNextPatient('${doc.id}')">📢 Call Next Patient</button>
        </div>

        <div class="card">
          <h3>Today's Patient Queue</h3>
          <table class="table-custom">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Patient Name</th>
                <th>Check-in Time</th>
                <th>Current Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${docQueue.length === 0 ? '<tr><td colspan="5" style="text-align:center;">No patients currently in queue today.</td></tr>' : ''}
              ${docQueue.map(q => {
                const patient = db.patients.find(p => p.id === q.pid);
                const isConsulting = q.status === 'In Consultation';
                return `
                  <tr style="${isConsulting ? 'background-color: var(--primary-light); font-weight: 600;' : ''}">
                    <td><span class="badge badge-primary" style="font-size: 1.1rem; padding: 0.4rem 0.8rem;">#${q.tok}</span></td>
                    <td>
                      <strong>${escapeHtml(patient?.name || 'Walk-in')}</strong>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">${patient?.id} · Age: ${patient?.age} · ${patient?.blood || 'O+'}</div>
                    </td>
                    <td>${q.time}</td>
                    <td><span class="badge ${q.status === 'In Consultation' ? 'badge-warning' : q.status === 'Completed' ? 'badge-success' : 'badge-primary'}">${q.status}</span></td>
                    <td>
                      ${q.status !== 'Completed' ? `
                        <button class="btn btn-sm btn-primary" onclick="window.app.openConsultationRoom('${q.id}')">Open Consultation</button>
                      ` : '<span style="color:var(--success)">Finished</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activePortalTab === 'doc_consult') {
      // Find patient in consultation or selected
      const currentPatientQueue = docQueue.find(q => q.status === 'In Consultation') || docQueue[0];
      const patient = currentPatientQueue ? db.patients.find(p => p.id === currentPatientQueue.pid) : null;

      if (!patient) {
        container.innerHTML = `
          <div class="card" style="text-align: center; padding: 3rem;">
            <h3>No Patient In Consultation</h3>
            <p class="text-muted">Please go to your OPD queue and call the next patient to begin consultation documentation.</p>
            <button class="btn btn-primary" onclick="window.app.setPortalTab('doc_queue')">View OPD Queue</button>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <h2>Clinical Consultation Room</h2>
        <div class="card" style="margin-bottom: 1.5rem; background: var(--bg-tertiary);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin-bottom: 0.2rem;">${escapeHtml(patient.name)} (UHID: ${patient.id})</h3>
              <p style="margin: 0; font-size: 0.9rem;">Age: ${patient.age} · Gender: ${patient.gender || '–'} · Phone: ${patient.phone} · Blood: ${patient.blood || 'O+'}</p>
            </div>
            <div>
              <span class="badge badge-warning" style="font-size: 0.9rem;">Token #${currentPatientQueue.tok} In Consultation</span>
            </div>
          </div>
        </div>

        <form id="consultationForm" onsubmit="window.app.saveConsultation(event, '${currentPatientQueue.id}', '${patient.id}')">
          <div class="card" style="margin-bottom: 1.5rem;">
            <h3>Clinical Assessment & Diagnosis</h3>
            <div class="form-grid">
              <div class="form-group" style="grid-column: 1/-1;">
                <label class="form-label">Reported Symptoms & Chief Complaints</label>
                <input type="text" class="form-control" name="symptoms" placeholder="e.g. High fever, headache, body aches for 2 days" required>
              </div>
              <div class="form-group" style="grid-column: 1/-1;">
                <label class="form-label">Physical Examination & Clinical Notes</label>
                <textarea class="form-control" name="notes" rows="2" placeholder="e.g. Chest clear, BP 120/80, pulse 76, no pallor..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Final Diagnosis</label>
                <input type="text" class="form-control" name="diagnosis" placeholder="e.g. Viral Pharyngitis" required>
              </div>
              <div class="form-group">
                <label class="form-label">Treatment Plan & Follow-up</label>
                <input type="text" class="form-control" name="plan" placeholder="e.g. Rest, hydration, review in 3 days">
              </div>
            </div>
          </div>

          <div class="card" style="margin-bottom: 1.5rem;">
            <h3>Electronic Prescription (e-Rx)</h3>
            <p class="text-muted" style="font-size: 0.85rem;">Medicines added here will automatically sync to the patient's mobile app reminders and hospital pharmacy.</p>
            
            <div id="rxRowsContainer">
              <div class="form-grid" style="margin-bottom: 0.75rem;">
                <div class="form-group">
                  <label class="form-label">Medicine</label>
                  <input type="text" class="form-control" name="rx_med_0" placeholder="e.g. Paracetamol" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Strength</label>
                  <input type="text" class="form-control" name="rx_str_0" placeholder="e.g. 500 mg">
                </div>
                <div class="form-group">
                  <label class="form-label">Dose</label>
                  <input type="text" class="form-control" name="rx_dose_0" placeholder="e.g. 1 Tablet">
                </div>
                <div class="form-group">
                  <label class="form-label">Frequency</label>
                  <select class="form-control" name="rx_freq_0">
                    <option>Once daily</option>
                    <option selected>Twice daily</option>
                    <option>Three times daily</option>
                    <option>SOS (As needed)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Duration (Days)</label>
                  <input type="number" class="form-control" name="rx_days_0" value="5" min="1">
                </div>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 1rem;">
            <button type="submit" class="btn btn-primary btn-lg">💾 Complete Consultation & Issue Prescription</button>
            <button type="button" class="btn btn-secondary" onclick="window.app.setPortalTab('doc_queue')">Cancel</button>
          </div>
        </form>
      `;
    } else if (activePortalTab === 'doc_schedule') {
      container.innerHTML = `
        <h2>My OPD Schedule & Bookings</h2>
        <div class="card">
          <p>Upcoming scheduled appointments for <strong>${escapeHtml(doc.name)}</strong>:</p>
          <table class="table-custom">
            <thead>
              <tr>
                <th>Appt ID</th>
                <th>Patient</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${db.appointments.filter(a => a.did === doc.id).map(a => {
                const pat = db.patients.find(p => p.id === a.pid);
                return `
                  <tr>
                    <td>${a.id}</td>
                    <td><strong>${escapeHtml(pat?.name)}</strong></td>
                    <td>${a.date} at ${a.time}</td>
                    <td>${escapeHtml(a.reason || 'General Visit')}</td>
                    <td><span class="badge badge-primary">${a.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  // --- Receptionist Views ---
  function renderReceptionViews(container) {
    const todayStr = new Date().toISOString().slice(0, 10);

    if (activePortalTab === 'rec_checkin') {
      const waitAppointments = db.appointments.filter(a => a.date === todayStr && a.status === 'Booked' && !db.queue.some(q => q.pid === a.pid && q.date === todayStr));

      container.innerHTML = `
        <h2>Reception Check-In & Queue Token Issuer</h2>
        <p class="text-muted">Issue OPD waiting tokens to pre-booked appointment patients or walk-in arrivals.</p>

        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; margin-bottom: 2rem;">
          <div class="card">
            <h3>Pre-Booked Patient Check-in</h3>
            <p class="text-muted" style="font-size: 0.85rem;">Appointments scheduled for today awaiting token generation:</p>
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${waitAppointments.length === 0 ? '<tr><td colspan="4" style="text-align:center;">All pre-booked patients checked in!</td></tr>' : ''}
                ${waitAppointments.map(a => {
                  const pat = db.patients.find(p => p.id === a.pid);
                  const doc = db.doctors.find(d => d.id === a.did);
                  return `
                    <tr>
                      <td>${a.time}</td>
                      <td><strong>${escapeHtml(pat?.name)}</strong></td>
                      <td>${escapeHtml(doc?.name)}</td>
                      <td><button class="btn btn-primary btn-sm" onclick="window.app.issueToken('${a.pid}', '${a.did}')">Generate Token</button></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="card">
            <h3>Walk-In Token Issue</h3>
            <form onsubmit="window.app.submitWalkinToken(event)">
              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label">Select Patient</label>
                <select class="form-control" name="pid" required>
                  ${db.patients.map(p => `<option value="${p.id}">${escapeHtml(p.name)} (${p.id})</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label class="form-label">Select Doctor & OPD</label>
                <select class="form-control" name="did" required>
                  ${db.doctors.map(d => `<option value="${d.id}">${escapeHtml(d.name)} – ${escapeHtml(d.spec)}</option>`).join('')}
                </select>
              </div>
              <button type="submit" class="btn btn-primary">🎫 Issue Walk-in Token</button>
            </form>
          </div>
        </div>

        <div class="card">
          <h3>Master Live OPD Queue Board (Today)</h3>
          <table class="table-custom">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              ${db.queue.filter(q => q.date === todayStr).map(q => {
                const pat = db.patients.find(p => p.id === q.pid);
                const doc = db.doctors.find(d => d.id === q.did);
                return `
                  <tr>
                    <td><span class="badge badge-primary">#${q.tok}</span></td>
                    <td>${escapeHtml(pat?.name)}</td>
                    <td>${escapeHtml(doc?.name)} (${escapeHtml(doc?.spec)})</td>
                    <td><span class="badge ${q.status === 'Completed' ? 'badge-success' : q.status === 'In Consultation' ? 'badge-warning' : 'badge-primary'}">${q.status}</span></td>
                    <td>
                      <select class="form-control" style="width: auto; display: inline-block; padding: 0.2rem 0.5rem;" onchange="window.app.updateQueueStatus('${q.id}', this.value)">
                        <option ${q.status==='Waiting'?'selected':''}>Waiting</option>
                        <option ${q.status==='Called'?'selected':''}>Called</option>
                        <option ${q.status==='In Consultation'?'selected':''}>In Consultation</option>
                        <option ${q.status==='Completed'?'selected':''}>Completed</option>
                        <option ${q.status==='Absent'?'selected':''}>Absent</option>
                      </select>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activePortalTab === 'rec_register') {
      container.innerHTML = `
        <h2>New Patient Registration Desk</h2>
        <p class="text-muted">Register a new hospital visitor, issue a permanent UHID (Patient ID) and configure emergency contacts.</p>

        <div class="card" style="max-width: 800px;">
          <form onsubmit="window.app.submitNewPatient(event)">
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">Full Name *</label>
                <input type="text" class="form-control" name="name" required placeholder="e.g. Rajesh Kumar">
              </div>
              <div class="form-group">
                <label class="form-label">Age *</label>
                <input type="number" class="form-control" name="age" required placeholder="e.g. 35" min="1" max="120">
              </div>
              <div class="form-group">
                <label class="form-label">Gender</label>
                <select class="form-control" name="gender">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Phone Number *</label>
                <input type="tel" class="form-control" name="phone" required placeholder="10-digit mobile number">
              </div>
              <div class="form-group">
                <label class="form-label">Blood Group</label>
                <select class="form-control" name="blood">
                  <option>O+</option>
                  <option>A+</option>
                  <option>B+</option>
                  <option>AB+</option>
                  <option>O-</option>
                  <option>A-</option>
                  <option>B-</option>
                  <option>AB-</option>
                </select>
              </div>
              <div class="form-group" style="grid-column: 1/-1;">
                <label class="form-label">Residential Address</label>
                <input type="text" class="form-control" name="addr" placeholder="Street, City, Pin Code">
              </div>
              <div class="form-group">
                <label class="form-label">Emergency Contact Name</label>
                <input type="text" class="form-control" name="ec" placeholder="Kin / Contact person">
              </div>
              <div class="form-group">
                <label class="form-label">Emergency Contact Phone</label>
                <input type="tel" class="form-control" name="ecp" placeholder="Emergency mobile number">
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg">➕ Register Patient & Generate UHID</button>
          </form>
        </div>
      `;
    } else if (activePortalTab === 'rec_appts') {
      container.innerHTML = `
        <h2>Master Appointment Desk</h2>
        <div class="card">
          <table class="table-custom">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${db.appointments.map(a => {
                const pat = db.patients.find(p => p.id === a.pid);
                const doc = db.doctors.find(d => d.id === a.did);
                return `
                  <tr>
                    <td><strong>${a.id}</strong></td>
                    <td>${escapeHtml(pat?.name)} (${pat?.id})</td>
                    <td>${escapeHtml(doc?.name)}</td>
                    <td>${a.date} at ${a.time}</td>
                    <td><span class="badge ${a.status==='Completed'?'badge-success':'badge-primary'}">${a.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  // --- Pharmacy Views ---
  function renderPharmacyViews(container) {
    const livePharm = db.pharmacies[0]; // CityCare

    if (activePortalTab === 'ph_inventory') {
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <h2>${escapeHtml(livePharm.name)} – Inventory</h2>
            <p class="text-muted">Manage real-time medicine stock, packaging, and retail pricing.</p>
          </div>
          <button class="btn btn-primary" onclick="window.app.toggleAddMedicineModal()">+ Add New Drug</button>
        </div>

        <div class="card">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Drug Name</th>
                <th>Strength</th>
                <th>Pack Format</th>
                <th>Price (₹)</th>
                <th>Stock Level</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${livePharm.stock.map((s, idx) => `
                <tr>
                  <td><strong>${escapeHtml(s.med)}</strong></td>
                  <td>${escapeHtml(s.str)}</td>
                  <td>${escapeHtml(s.pack)}</td>
                  <td>₹${s.price}</td>
                  <td>
                    ${s.qty < 20 
                      ? `<span class="badge badge-warning">Low: ${s.qty} units</span>` 
                      : `<span class="badge badge-success">${s.qty} in stock</span>`}
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="window.app.restockItem(${idx})">+ Restock</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activePortalTab === 'ph_dispense') {
      container.innerHTML = `
        <h2>Prescription Dispensing Counter</h2>
        <p class="text-muted">Fulfill doctor prescriptions and deduct medicine inventory in real-time.</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div class="card">
            <h3>Dispense Medication</h3>
            <form onsubmit="window.app.submitDispense(event)">
              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label">Select Prescription</label>
                <select class="form-control" name="rxId" onchange="window.app.onRxSelectChange(this.value)">
                  ${db.prescriptions.map(rx => {
                    const pat = db.patients.find(p => p.id === rx.pid);
                    return `<option value="${rx.id}">${rx.id} – ${escapeHtml(pat?.name)} (${rx.date})</option>`;
                  }).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 1rem;">
                <label class="form-label">Medicine to Dispense</label>
                <select class="form-control" name="medIdx">
                  ${livePharm.stock.map((s, idx) => `<option value="${idx}">${s.med} ${s.str} (Available: ${s.qty})</option>`).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label class="form-label">Quantity</label>
                <input type="number" class="form-control" name="qty" value="1" min="1" max="100">
              </div>

              <button type="submit" class="btn btn-primary">💊 Dispense & Update Stock</button>
            </form>
          </div>

          <div class="card">
            <h3>Recent Dispensing Log</h3>
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Medicine</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                ${db.dispensedLogs.map(l => `
                  <tr>
                    <td>${l.time}</td>
                    <td>${escapeHtml(l.patient)}</td>
                    <td>${escapeHtml(l.med)}</td>
                    <td>${l.qty}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activePortalTab === 'ph_compare') {
      container.innerHTML = `
        <h2>Price Benchmark Matrix</h2>
        <p class="text-muted">Compare medicine prices across local pharmacies in Muzaffarnagar.</p>
        <div class="pharmacy-table-wrap">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Pharmacy</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Contact</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody id="portalPharmacyCompareBody"></tbody>
          </table>
        </div>
      `;
      // Populate benchmark
      const tbody = $('#portalPharmacyCompareBody');
      if (tbody) {
        tbody.innerHTML = $('#pharmacyComparisonBody')?.innerHTML || '';
      }
    }
  }

  // --- Admin Views ---
  function renderAdminViews(container) {
    if (activePortalTab === 'adm_metrics') {
      const totalBilled = db.bills.reduce((s, b) => s + b.items.reduce((sum, i) => sum + i.amt, 0), 0);
      const totalPaid = db.bills.reduce((s, b) => s + b.paid, 0);

      container.innerHTML = `
        <h2>Executive Hospital Analytics</h2>
        <div class="metrics-grid" style="margin-bottom: 2rem;">
          <div class="card" style="text-align: left;">
            <span class="text-muted" style="font-size:0.8rem">TOTAL REGISTERED PATIENTS</span>
            <div style="font-size: 2.4rem; font-weight: 800;">${db.patients.length}</div>
          </div>
          <div class="card" style="text-align: left;">
            <span class="text-muted" style="font-size:0.8rem">ACTIVE OPD DOCTORS</span>
            <div style="font-size: 2.4rem; font-weight: 800; color: var(--primary);">${db.doctors.length}</div>
          </div>
          <div class="card" style="text-align: left;">
            <span class="text-muted" style="font-size:0.8rem">TOTAL REVENUE BILLED</span>
            <div style="font-size: 2.4rem; font-weight: 800; color: var(--accent);">₹${totalBilled}</div>
          </div>
          <div class="card" style="text-align: left;">
            <span class="text-muted" style="font-size:0.8rem">TOTAL REVENUE COLLECTED</span>
            <div style="font-size: 2.4rem; font-weight: 800; color: var(--success);">₹${totalPaid}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div class="card">
            <h3>Department Overview</h3>
            <table class="table-custom">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Doctors</th>
                  <th>OPD Wing</th>
                </tr>
              </thead>
              <tbody>
                ${db.departments.map(dept => {
                  const docsInDept = db.doctors.filter(d => d.spec === dept);
                  return `
                    <tr>
                      <td><strong>${escapeHtml(dept)}</strong></td>
                      <td>${docsInDept.length} Doctors</td>
                      <td>Wing ${dept.charAt(0)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="card">
            <h3>Emergency Alerts Overview</h3>
            <p class="text-muted" style="font-size: 0.85rem;">Total SOS dispatches recorded: ${db.sosAlerts.length}</p>
            <div style="margin-top: 1rem;">
              <button class="btn btn-outline" onclick="window.app.setPortalTab('adm_sos_monitor')">Open Emergency Command Desk</button>
            </div>
            <div style="margin-top: 2rem; border-top: 1px solid var(--border-light); padding-top: 1rem;">
              <button class="btn btn-danger btn-sm" onclick="window.app.resetToDemoDatabase()">⚠️ Reset System to Default Demo Seed Data</button>
            </div>
          </div>
        </div>
      `;
    } else if (activePortalTab === 'adm_billing') {
      container.innerHTML = `
        <h2>Billing & Hospital Accounts</h2>
        <p class="text-muted">Review patient invoices, record payment receipts, and view outstanding balances.</p>

        <div class="card">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total (₹)</th>
                <th>Paid (₹)</th>
                <th>Balance (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${db.bills.map(b => {
                const pat = db.patients.find(p => p.id === b.pid);
                const total = b.items.reduce((s, i) => s + i.amt, 0);
                const balance = total - b.paid;
                const status = balance === 0 ? 'Paid' : b.paid > 0 ? 'Partial' : 'Unpaid';
                return `
                  <tr>
                    <td><strong>${b.id}</strong></td>
                    <td>${escapeHtml(pat?.name)}</td>
                    <td>${b.date}</td>
                    <td>${b.items.map(i => escapeHtml(i.name)).join(', ')}</td>
                    <td>₹${total}</td>
                    <td>₹${b.paid}</td>
                    <td><strong style="color: ${balance > 0 ? 'var(--danger)' : 'var(--success)'}">₹${balance}</strong></td>
                    <td><span class="badge ${status === 'Paid' ? 'badge-success' : 'badge-warning'}">${status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activePortalTab === 'adm_sos_monitor') {
      container.innerHTML = `
        <h2>🚨 Emergency Command Center</h2>
        <div class="note" style="margin-bottom: 1.5rem; background: var(--danger-light); color: var(--danger-text); padding: 1rem; border-radius: var(--radius-md);">
          <strong>Simulated Emergency Provider Dashboard:</strong> Incoming SOS distress triggers from patients and optional IoT bands appear here in real time.
        </div>

        <div class="card">
          <table class="table-custom">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Patient</th>
                <th>Time</th>
                <th>Status</th>
                <th>Geocoded GPS Coords</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${db.sosAlerts.map(a => `
                <tr>
                  <td><strong>${a.id}</strong></td>
                  <td><strong>${escapeHtml(a.patientName)}</strong></td>
                  <td>${a.ts}</td>
                  <td><span class="badge ${a.status === 'Acknowledged' ? 'badge-success' : 'badge-danger'}">${a.status}</span></td>
                  <td>
                    <a href="https://maps.google.com/?q=${a.loc.lat},${a.loc.lng}" target="_blank" rel="noopener">
                      📍 ${a.loc.lat.toFixed(4)}, ${a.loc.lng.toFixed(4)} (${a.loc.text})
                    </a>
                  </td>
                  <td>
                    ${a.status !== 'Acknowledged' ? `
                      <button class="btn btn-sm btn-primary" onclick="window.app.acknowledgeSOS('${a.id}')">Acknowledge</button>
                    ` : '<span style="color:var(--success)">✓ Resolved</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (activePortalTab === 'adm_doctors') {
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <h2>Doctor Directory Management</h2>
            <p class="text-muted">Configure hospital medical staff, fees, OPD timings and departments.</p>
          </div>
          <button class="btn btn-primary" onclick="window.app.toggleAddDoctorModal()">+ Add New Doctor</button>
        </div>

        <div class="card">
          <table class="table-custom">
            <thead>
              <tr>
                <th>ID</th>
                <th>Doctor</th>
                <th>Speciality</th>
                <th>Consultation Fee</th>
                <th>OPD Hours</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${db.doctors.map(d => `
                <tr>
                  <td>${d.id}</td>
                  <td><strong>${escapeHtml(d.name)}</strong></td>
                  <td><span class="badge badge-primary">${escapeHtml(d.spec)}</span></td>
                  <td>₹${d.fee}</td>
                  <td>${d.from}:00 – ${d.to}:00</td>
                  <td>${escapeHtml(d.loc)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  }

  // --- SOS Countdown Modal & Simulation ---
  let sosTimer = null;
  let sosCountdown = 15;

  function triggerSOSModal() {
    playAlarmSound();
    const overlay = $('#sosOverlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    sosCountdown = 15;
    $('#sosCountdownNumber').textContent = sosCountdown;

    if (sosTimer) clearInterval(sosTimer);
    sosTimer = setInterval(() => {
      sosCountdown--;
      playTickSound();
      if ($('#sosCountdownNumber')) $('#sosCountdownNumber').textContent = sosCountdown;

      if (sosCountdown <= 0) {
        clearInterval(sosTimer);
        sosTimer = null;
        finalizeSOS(true); // auto-escalate as unconfirmed emergency
      }
    }, 1000);
  }

  function cancelSOS() {
    if (sosTimer) {
      clearInterval(sosTimer);
      sosTimer = null;
    }
    const overlay = $('#sosOverlay');
    if (overlay) overlay.style.display = 'none';
    showToast('SOS Alert canceled. Safety verified.', 'warning');
  }

  function finalizeSOS(isAutoEscalated = false) {
    if (sosTimer) {
      clearInterval(sosTimer);
      sosTimer = null;
    }
    const overlay = $('#sosOverlay');
    if (overlay) overlay.style.display = 'none';

    const patient = db.patients[0];
    const newAlert = {
      id: 'SOS' + (++db.counter),
      pid: patient.id,
      patientName: patient.name,
      ts: 'Just now',
      status: isAutoEscalated ? 'Escalated (Unconfirmed)' : 'Sent',
      unconfirmed: isAutoEscalated,
      loc: { lat: 29.4727 + (Math.random() - 0.5) * 0.01, lng: 77.7085 + (Math.random() - 0.5) * 0.01, text: 'Muzaffarnagar Hospital Vicinity' },
      logs: [
        ['Just now', isAutoEscalated ? 'Timeout reached: Escalated as UNCONFIRMED EMERGENCY' : 'Confirmed by user'],
        ['Just now', `Emergency contact alerted: ${patient.ec} (${patient.ecp})`],
        ['Just now', 'Transmitted to Hospital Emergency Command Center']
      ]
    };

    db.sosAlerts.unshift(newAlert);
    saveDatabase();
    playAlarmSound();

    showToast(
      isAutoEscalated 
        ? 'Alert Escalated! Emergency contacts & Command Center notified.' 
        : 'Emergency SOS Sent! Help alerted.',
      'danger'
    );

    if ($('#appView').style.display === 'block') {
      renderPortalActiveView();
    }
  }

  // --- Global App Public API & Event Bindings ---
  window.app = {
    // Mode toggling
    showPortalView: function (role = 'patient') {
      $('#showcaseView').style.display = 'none';
      $('#appView').style.display = 'block';
      setPortalRole(role);
      window.scrollTo(0, 0);
    },

    showPublicView: function () {
      $('#appView').style.display = 'none';
      $('#showcaseView').style.display = 'block';
      renderPublicShowcase();
      window.scrollTo(0, 0);
    },

    setPortalRole: setPortalRole,

    setPortalTab: function (tabId) {
      activePortalTab = tabId;
      renderPortalSidebar();
      renderPortalActiveView();
    },

    // Interactive Symptom / Doctor Matcher
    onSymptomClick: function (symptomQuery, el) {
      $$('.symptom-chip').forEach(c => c.classList.remove('active'));
      if (el) el.classList.add('active');

      const match = SYMPTOM_MAP.find(m => m.regex.test(symptomQuery));
      const searchInput = $('#doctorSearchInput');
      if (searchInput) searchInput.value = symptomQuery;

      if (match) {
        renderDoctorCards(match.dept);
        const matchNote = $('#symptomMatchNote');
        if (matchNote) {
          matchNote.innerHTML = `💡 <strong>Matched Speciality:</strong> ${match.dept}. <small class="text-muted">(${match.reason})</small>`;
        }
      } else {
        renderDoctorCards('', symptomQuery);
      }
    },

    onDoctorSearchInput: function (val) {
      const match = SYMPTOM_MAP.find(m => m.regex.test(val));
      if (match) {
        renderDoctorCards(match.dept, val);
        const matchNote = $('#symptomMatchNote');
        if (matchNote) {
          matchNote.innerHTML = `💡 <strong>Suggested Speciality:</strong> ${match.dept}. <small class="text-muted">(${match.reason})</small>`;
        }
      } else {
        renderDoctorCards('', val);
        const matchNote = $('#symptomMatchNote');
        if (matchNote) matchNote.innerHTML = '';
      }
    },

    onMedicineSearchInput: function (val) {
      renderMedicineComparisonTable(val);
    },

    // Doctor Booking Modal
    quickBookDoctor: function (docId = '') {
      const modal = $('#bookingModal');
      if (!modal) return;
      modal.style.display = 'flex';
      const select = $('#bookingDoctorSelect');
      if (select && docId) select.value = docId;
    },

    closeBookingModal: function () {
      const modal = $('#bookingModal');
      if (modal) modal.style.display = 'none';
    },

    submitBooking: function (e) {
      e.preventDefault();
      const form = e.target;
      const did = form.did.value;
      const date = form.date.value;
      const time = form.time.value;
      const reason = form.reason.value;

      // Check for double booking collision
      const collision = db.appointments.some(a => a.did === did && a.date === date && a.time === time && a.status === 'Booked');
      if (collision) {
        showToast('That slot is already booked for this doctor. Please choose another time.', 'warning');
        return;
      }

      const newAppt = {
        id: 'A' + (++db.counter),
        pid: currentUser.id || 'P0001',
        did: did,
        date: date,
        time: time,
        status: 'Booked',
        reason: reason
      };

      db.appointments.unshift(newAppt);
      saveDatabase();
      window.app.closeBookingModal();
      playTokenChime();
      showToast(`Appointment booked successfully with ${db.doctors.find(d => d.id === did)?.name}!`);
      
      if ($('#appView').style.display === 'block') {
        renderPortalActiveView();
      }
    },

    cancelAppointment: function (id) {
      const a = db.appointments.find(x => x.id === id);
      if (a) {
        a.status = 'Cancelled';
        saveDatabase();
        showToast(`Appointment ${id} cancelled.`, 'warning');
        renderPortalActiveView();
      }
    },

    // Reception Actions
    issueToken: function (pid, did) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const existing = db.queue.filter(q => q.did === did && q.date === todayStr);
      const nextTokenNum = existing.length + 1;

      const newQ = {
        id: 'Q' + (++db.counter),
        tok: nextTokenNum,
        pid: pid,
        did: did,
        date: todayStr,
        status: 'Waiting',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      db.queue.push(newQ);
      saveDatabase();
      playTokenChime();
      showToast(`Issued Token #${nextTokenNum} for ${db.patients.find(p => p.id === pid)?.name}`);
      renderPortalActiveView();
    },

    submitWalkinToken: function (e) {
      e.preventDefault();
      const pid = e.target.pid.value;
      const did = e.target.did.value;
      window.app.issueToken(pid, did);
    },

    updateQueueStatus: function (qid, newStatus) {
      const item = db.queue.find(q => q.id === qid);
      if (item) {
        item.status = newStatus;
        saveDatabase();
        if (newStatus === 'Called') playTokenChime();
        showToast(`Token #${item.tok} status updated to ${newStatus}`);
        renderPortalActiveView();
      }
    },

    submitNewPatient: function (e) {
      e.preventDefault();
      const form = e.target;
      const newP = {
        id: 'P' + String(++db.counter).padStart(4, '0'),
        name: form.name.value,
        age: form.age.value,
        gender: form.gender.value,
        phone: form.phone.value,
        blood: form.blood.value,
        addr: form.addr.value,
        ec: form.ec.value,
        ecp: form.ecp.value
      };
      db.patients.push(newP);
      saveDatabase();
      showToast(`Registered new patient ${newP.name} (UHID: ${newP.id})`);
      form.reset();
      window.app.setPortalTab('rec_checkin');
    },

    // Doctor Actions
    callNextPatient: function (did) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const nextWaiting = db.queue.find(q => q.did === did && q.date === todayStr && q.status === 'Waiting');
      if (!nextWaiting) {
        showToast('No waiting patients in queue.', 'warning');
        return;
      }
      nextWaiting.status = 'In Consultation';
      saveDatabase();
      playTokenChime();
      showToast(`Calling Patient Token #${nextWaiting.tok}! Consultation starting.`);
      window.app.setPortalTab('doc_consult');
    },

    openConsultationRoom: function (qid) {
      const q = db.queue.find(x => x.id === qid);
      if (q) {
        q.status = 'In Consultation';
        saveDatabase();
        window.app.setPortalTab('doc_consult');
      }
    },

    saveConsultation: function (e, qid, pid) {
      e.preventDefault();
      const form = e.target;
      const q = db.queue.find(x => x.id === qid);
      const todayStr = new Date().toISOString().slice(0, 10);
      const doc = currentUser;

      // 1. Save EHR Record
      const newRec = {
        id: 'REC' + (++db.counter),
        pid: pid,
        did: doc.id,
        date: todayStr,
        symptoms: form.symptoms.value,
        notes: form.notes.value,
        diagnosis: form.diagnosis.value,
        plan: form.plan.value,
        author: doc.name
      };
      db.records.push(newRec);

      // 2. Save e-Prescription
      const newRx = {
        id: 'RX' + (++db.counter),
        pid: pid,
        did: doc.id,
        date: todayStr,
        items: [
          {
            med: form.rx_med_0.value,
            str: form.rx_str_0.value,
            dose: form.rx_dose_0.value,
            freq: form.rx_freq_0.value,
            days: form.rx_days_0.value,
            inst: 'After meals as directed'
          }
        ]
      };
      db.prescriptions.push(newRx);

      // 3. Mark queue completed
      if (q) q.status = 'Completed';

      // 4. Auto-generate billing invoice
      const newBill = {
        id: 'INV' + (++db.counter),
        pid: pid,
        date: todayStr,
        items: [
          { name: `OPD Consultation - ${doc.name}`, amt: doc.fee }
        ],
        paid: 0
      };
      db.bills.push(newBill);

      saveDatabase();
      playTone(523.25, 0.4, 'sine');
      showToast('Consultation saved! Prescription & Bill generated.');
      window.app.setPortalTab('doc_queue');
    },

    // Patient Actions
    toggleDose: function (key) {
      db.dosesTaken[key] = !db.dosesTaken[key];
      saveDatabase();
      if (db.dosesTaken[key]) {
        playTone(659.25, 0.2, 'sine');
        showToast('Dose recorded as taken! Great adherence.');
      }
      renderPortalActiveView();
    },

    submitVitals: function (e) {
      e.preventDefault();
      const form = e.target;
      const newV = {
        pid: currentUser.id,
        t: 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hr: Number(form.hr.value),
        sp: Number(form.sp.value),
        temp: Number(form.temp.value) || 98.6,
        note: form.note.value || 'Manual entry'
      };
      db.vitals.unshift(newV);
      saveDatabase();
      showToast('Biometric vital reading logged.');
      form.reset();
      renderPortalActiveView();
    },

    simulateSyncWearable: function () {
      playTone(880, 0.1, 'sine');
      setTimeout(() => {
        const simHR = 70 + Math.floor(Math.random() * 20);
        const simSp = 96 + Math.floor(Math.random() * 4);
        const newV = {
          pid: currentUser.id,
          t: 'Just now (IoT)',
          hr: simHR,
          sp: simSp,
          temp: 98.4,
          note: 'Bluetooth sync from MAX30102 band'
        };
        db.vitals.unshift(newV);
        saveDatabase();
        playHeartbeatSound();
        showToast(`IoT Band Synced! Pulse: ${simHR} bpm, SpO₂: ${simSp}%`);
        renderPortalActiveView();
      }, 500);
    },

    // Pharmacy Actions
    submitDispense: function (e) {
      e.preventDefault();
      const form = e.target;
      const rxId = form.rxId.value;
      const medIdx = Number(form.medIdx.value);
      const qty = Number(form.qty.value);

      const livePharm = db.pharmacies[0];
      const stockItem = livePharm.stock[medIdx];

      if (stockItem.qty < qty) {
        showToast(`Insufficient stock! Only ${stockItem.qty} available.`, 'danger');
        return;
      }

      stockItem.qty -= qty;
      livePharm.updated = new Date().toISOString();

      const rx = db.prescriptions.find(r => r.id === rxId);
      const pat = db.patients.find(p => p.id === rx?.pid);

      db.dispensedLogs.unshift({
        id: 'DSP' + (++db.counter),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        med: `${stockItem.med} ${stockItem.str}`,
        qty: qty,
        rxId: rxId,
        patient: pat?.name || 'Walk-in'
      });

      saveDatabase();
      showToast(`Dispensed ${qty} × ${stockItem.med}. Stock updated!`);
      renderPortalActiveView();
    },

    restockItem: function (idx) {
      const livePharm = db.pharmacies[0];
      livePharm.stock[idx].qty += 50;
      livePharm.updated = new Date().toISOString();
      saveDatabase();
      showToast(`Restocked 50 units of ${livePharm.stock[idx].med}.`);
      renderPortalActiveView();
    },

    // Admin Actions
    acknowledgeSOS: function (id) {
      const alert = db.sosAlerts.find(a => a.id === id);
      if (alert) {
        alert.status = 'Acknowledged';
        alert.logs.push([new Date().toLocaleTimeString(), 'Emergency Command Center dispatched triage unit']);
        saveDatabase();
        showToast(`SOS Alert ${id} marked as Acknowledged.`);
        renderPortalActiveView();
      }
    },

    resetToDemoDatabase: function () {
      if (confirm('Reset hospital database to default sample demo data? Any custom records will be reseeded.')) {
        localStorage.removeItem(STORAGE_KEY);
        db = getSeedDatabase();
        saveDatabase();
        showToast('Database reset to fresh demo data.');
        location.reload();
      }
    },

    // Modals & Overlays
    triggerSOSModal: triggerSOSModal,
    cancelSOS: cancelSOS,
    confirmEmergencyNow: function () {
      finalizeSOS(false);
    },

    // Theme Toggle
    toggleTheme: function () {
      const current = document.documentElement.getAttribute('data-theme');
      const target = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('swasthyalink_theme', target);
      const icon = $('#themeToggleBtn');
      if (icon) icon.textContent = target === 'dark' ? '☀️' : '🌙';
    },

    // Sound Toggle
    toggleSound: function () {
      soundEnabled = !soundEnabled;
      const btn = $('#soundToggleBtn');
      if (btn) btn.textContent = soundEnabled ? '🔔 Sound ON' : '🔕 Muted';
      showToast(soundEnabled ? 'Audio cues enabled' : 'Audio cues muted');
    }
  };

  // --- Initial Page Load ---
  document.addEventListener('DOMContentLoaded', () => {
    initDatabase();

    // Theme setup
    const savedTheme = localStorage.getItem('swasthyalink_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = $('#themeToggleBtn');
    if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    renderPublicShowcase();

    // Ecosystem Tab Switchers
    $$('.eco-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.eco-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        $$('.eco-tab-panel').forEach(p => p.classList.remove('active'));
        const activePanel = $(`#tab-${tab}`);
        if (activePanel) activePanel.classList.add('active');
      });
    });

    // Populate Booking Doctor Select
    const docSelect = $('#bookingDoctorSelect');
    if (docSelect) {
      docSelect.innerHTML = db.doctors.map(d => `
        <option value="${d.id}">${escapeHtml(d.name)} (${escapeHtml(d.spec)} – ₹${d.fee})</option>
      `).join('');
    }

    // Default booking date to tomorrow
    const dateInput = $('#bookingDateInput');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().slice(0, 10);
      dateInput.min = new Date().toISOString().slice(0, 10);
    }
  });

})();
