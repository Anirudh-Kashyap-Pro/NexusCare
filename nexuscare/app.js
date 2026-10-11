/**
 * NexusCare - Hospital Operations & Patient-Flow Application Logic
 * Comprehensive Architecture:
 * 1. Audio Synthesis (Web Audio API & Speech Synthesis)
 * 2. Navigation & View Routing (Hero <-> Dashboard, Triage, Tokens, Map, AI Desk, Beds)
 * 3. Operational Dashboard (Radial Dial, Spline Curves, Dot Matrix, Constellation Graph, Mood)
 * 4. Interactive Anatomical Body Navigator & Symptom Triage
 * 5. Live Token Kiosk & Queue Management System
 * 6. Interactive Multi-Floor Hospital Map & Vector Wayfinding
 * 7. NexusCare AI Care Desk & Customer Assistant
 * 8. Live Hospital Simulation Engine
 */

// ==========================================================================
// 1. Audio Engine (Web Audio API Synthesizer)
// ==========================================================================
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  playTap() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playChime() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 hospital chime
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.16;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch (e) {
      console.warn('Chime error:', e);
    }
  }

  playAlert() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Alert error:', e);
    }
  }

  speak(text) {
    if (!this.soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

const audio = new AudioEngine();

// ==========================================================================
// 2. Application State
// ==========================================================================
const state = {
  currentView: 'hero', // 'hero', 'dashboard', 'triage', 'tokens', 'map', 'aidesk', 'beds'
  simulationActive: true,
  dashboardFilter: 'occupancy',
  dashboardPeriod: 'week',
  
  // Dashboard Metrics
  metrics: {
    totalBeds: 2125,
    occupiedBeds: 1594,
    currentPatients: 1583,
    avgWaitTime: 14.2,
    patientSatisfaction: 81,
    avgCost: 8520
  },

  // Anatomical Triage State
  triage: {
    view: 'front', // 'front' or 'back'
    selectedZone: 'chest',
    painScore: 7,
    selectedSymptoms: ['Crushing retrosternal chest pain', 'Shortness of breath']
  },

  // Token System State
  tokens: {
    nowServing: { id: 'CARD-104', dept: 'Cardiology', room: 'Suite 204', doctor: 'Dr. Alistair Vance' },
    nextUp: [
      { id: 'EMRG-022', dept: 'Emergency', room: 'Trauma Bay 02', doctor: 'Dr. Sarah Lin', wait: '3 mins', priority: 'Urgent' },
      { id: 'RAD-047', dept: 'Radiology', room: 'MRI Suite 2B', doctor: 'Dr. Robert Miller', wait: '8 mins', priority: 'Standard' },
      { id: 'OPD-219', dept: 'General OPD', room: 'Room 102', doctor: 'Dr. Elena Rostova', wait: '12 mins', priority: 'Standard' },
      { id: 'ORTH-088', dept: 'Orthopedics', room: 'Room 110', doctor: 'Dr. Marcus Wright', wait: '18 mins', priority: 'Senior' }
    ],
    history: []
  },

  // Hospital Map State
  map: {
    activeFloor: 2,
    startLocation: 'entrance',
    targetLocation: 'cardiology_204',
    accessibleRoute: false
  },

  // Chat History
  chat: [
    { sender: 'ai', text: 'Welcome to NexusCare Intelligence Desk. I can assist with emergency triage, room wayfinding, queue status, or patient registration. How can I help you right now?' }
  ]
};

// ==========================================================================
// 3. Anatomical Data & Symptom Knowledge Base
// ==========================================================================
const BODY_ZONES = {
  head: {
    name: 'Head & Neurological System',
    department: 'Neurology & Stroke Clinic',
    floor: 'Floor 3, Wing B (Room 304)',
    doctor: 'Dr. Evelyn Zhang (Chief Neurologist)',
    defaultTier: 'Urgent',
    defaultWait: '8 mins',
    symptoms: [
      'Severe sudden thunderclap headache',
      'Facial numbness or unilateral weakness',
      'Visual disturbance or vertigo',
      'Post-concussive nausea & confusion',
      'Mild tension headache / sinus pressure'
    ],
    mapTarget: 'neuro_304'
  },
  throat: {
    name: 'Neck, Throat & ENT',
    department: 'Otolaryngology (ENT)',
    floor: 'Floor 1, Wing C (Room 115)',
    doctor: 'Dr. Keith Thorne',
    defaultTier: 'Routine',
    defaultWait: '14 mins',
    symptoms: [
      'Difficulty swallowing (dysphagia)',
      'Severe acute sore throat with fever',
      'Hoarseness lasting over 2 weeks',
      'Acute earache / fluid discharge',
      'Cervical lymph node swelling'
    ],
    mapTarget: 'ent_115'
  },
  chest: {
    name: 'Chest, Heart & Lungs',
    department: 'Cardiology & Acute CCU',
    floor: 'Floor 2, Wing A (Suite 204)',
    doctor: 'Dr. Alistair Vance (Interventional Cardiologist)',
    defaultTier: 'Urgent',
    defaultWait: '2 mins (Immediate Priority)',
    symptoms: [
      'Crushing retrosternal chest pain',
      'Shortness of breath / dyspnea on exertion',
      'Radiating pain to left arm, jaw or shoulder',
      'Rapid irregular heart palpitations',
      'Persistent dry cough with wheezing'
    ],
    mapTarget: 'cardiology_204'
  },
  abdomen: {
    name: 'Abdomen & Digestive System',
    department: 'Gastroenterology & General Surgery',
    floor: 'Floor 2, Wing D (Room 220)',
    doctor: 'Dr. Maya Patel',
    defaultTier: 'Moderate',
    defaultWait: '16 mins',
    symptoms: [
      'Sharp right-lower quadrant pain (possible appendicitis)',
      'Severe epigastric burning / acid reflux',
      'Nausea, recurrent vomiting and dehydration',
      'Right upper quadrant pain after fatty meals',
      'Abdominal distension and cramping'
    ],
    mapTarget: 'gastro_220'
  },
  pelvis: {
    name: 'Pelvic & Renal / Urology',
    department: 'Nephrology & Urology Center',
    floor: 'Floor 3, Wing C (Room 312)',
    doctor: 'Dr. Jonathan Blake',
    defaultTier: 'Moderate',
    defaultWait: '12 mins',
    symptoms: [
      'Severe acute flank / kidney colic pain',
      'Burning pain during urination (dysuria)',
      'Hematuria (blood in urine)',
      'Lower pelvic pressure and frequency',
      'Suprapubic discomfort'
    ],
    mapTarget: 'urology_312'
  },
  spine: {
    name: 'Spine & Musculoskeletal',
    department: 'Spine & Orthopedic Institute',
    floor: 'Floor 1, Wing B (Room 108)',
    doctor: 'Dr. Marcus Wright',
    defaultTier: 'Routine',
    defaultWait: '20 mins',
    symptoms: [
      'Radiating lumbar pain to legs (sciatica)',
      'Severe lower back stiffness on bending',
      'Cervical neck pain with finger tingling',
      'Restricted spinal range of motion',
      'Postural back fatigue'
    ],
    mapTarget: 'ortho_108'
  },
  upperLimbs: {
    name: 'Arms, Shoulders & Hands',
    department: 'Orthopedic & Trauma Care',
    floor: 'Floor 1, Wing A (Room 104)',
    doctor: 'Dr. Sarah Lin',
    defaultTier: 'Moderate',
    defaultWait: '15 mins',
    symptoms: [
      'Shoulder dislocation or acute rotator tear',
      'Forearm / wrist fracture following trauma',
      'Carpal tunnel tingling in thumb & fingers',
      'Elbow joint effusion and tenderness',
      'Sudden loss of grip strength'
    ],
    mapTarget: 'ortho_104'
  },
  lowerLimbs: {
    name: 'Legs, Knees & Ankles',
    department: 'Orthopedic & Sports Medicine',
    floor: 'Floor 1, Wing A (Room 106)',
    doctor: 'Dr. David Ross',
    defaultTier: 'Routine',
    defaultWait: '18 mins',
    symptoms: [
      'Acute knee pop and swelling (ACL suspicion)',
      'Inability to bear weight on ankle',
      'Unilateral calf pain & warmth (DVT check)',
      'Hip joint pain while walking',
      'Achilles tendon sharp pain'
    ],
    mapTarget: 'ortho_106'
  }
};

// ==========================================================================
// 4. Map Directory Data
// ==========================================================================
const MAP_LOCATIONS = {
  entrance: { name: 'Main Hospital Entrance & Lobby', floor: 1, x: 80, y: 400 },
  er_bay: { name: 'Emergency Trauma Bay', floor: 1, x: 200, y: 380 },
  triage_pod: { name: 'Automated Triage Pod A', floor: 1, x: 140, y: 320 },
  pharmacy: { name: 'Central Pharmacy & Dispense', floor: 1, x: 380, y: 390 },
  ortho_104: { name: 'Orthopedics & Trauma (Room 104)', floor: 1, x: 120, y: 150 },
  ortho_106: { name: 'Sports Medicine (Room 106)', floor: 1, x: 220, y: 150 },
  ortho_108: { name: 'Spine Care (Room 108)', floor: 1, x: 320, y: 150 },
  ent_115: { name: 'ENT Clinic (Room 115)', floor: 1, x: 420, y: 150 },
  
  elevator_b: { name: 'Elevator Core B', floor: 2, x: 260, y: 260 },
  cardiology_204: { name: 'Cardiology Clinic (Suite 204)', floor: 2, x: 140, y: 120 },
  mri_suite: { name: '3T MRI Diagnostic Suite 2B', floor: 2, x: 380, y: 120 },
  gastro_220: { name: 'Gastroenterology (Room 220)', floor: 2, x: 420, y: 350 },
  cath_lab: { name: 'Cardiac Cath Lab', floor: 2, x: 140, y: 350 },

  neuro_304: { name: 'Neurology Unit (Room 304)', floor: 3, x: 160, y: 140 },
  urology_312: { name: 'Nephrology & Urology (Room 312)', floor: 3, x: 360, y: 140 },
  icu_complex: { name: 'Intensive Care Unit (ICU)', floor: 3, x: 260, y: 360 },

  inpatient_suites: { name: 'Private Suites 401-415', floor: 4, x: 160, y: 160 },
  pediatric_ward: { name: 'Pediatric Pavilion', floor: 4, x: 360, y: 160 },
  cafeteria: { name: 'Hospital Sky Garden & Bistro', floor: 4, x: 260, y: 360 }
};

// ==========================================================================
// 5. Application Core Initializer
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupHeroView();
  setupDashboardCharts();
  setupAnatomicalTriage();
  setupTokenSystem();
  setupHospitalMap();
  setupAIDesk();
  setupBedMatrix();
  setupSimulationEngine();
  setupHeaderControls();
  
  // Render default view
  renderCurrentView();
});

// ==========================================================================
// 6. Navigation & View Routing
// ==========================================================================
function setupNavigation() {
  const dockButtons = document.querySelectorAll('.dock-item-btn');
  dockButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.dataset.view;
      if (targetView) {
        audio.playTap();
        switchView(targetView);
      }
    });
  });

  // Top header brand click returns to Hero / Landing
  const headerBrand = document.querySelector('.header-brand');
  if (headerBrand) {
    headerBrand.addEventListener('click', (e) => {
      e.preventDefault();
      audio.playTap();
      switchView('hero');
    });
  }

  // Quick triage header button
  const quickTriageBtn = document.getElementById('header-quick-triage');
  if (quickTriageBtn) {
    quickTriageBtn.addEventListener('click', () => {
      audio.playTap();
      switchView('triage');
    });
  }
}

function switchView(viewName) {
  state.currentView = viewName;

  // Update Dock active state
  document.querySelectorAll('.dock-item-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Hide all view sections
  const allViews = [
    'hero-view',
    'dashboard-view',
    'triage-view',
    'token-view',
    'map-view',
    'aidesk-view',
    'beds-view'
  ];

  allViews.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // Show target view
  const targetEl = document.getElementById(`${viewName}-view`);
  if (targetEl) {
    targetEl.classList.remove('hidden');
    targetEl.classList.add('fade-in');
  }

  // Special view triggers
  if (viewName === 'map') {
    renderHospitalMap(state.map.activeFloor);
  } else if (viewName === 'dashboard') {
    animateDashboardGauges();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCurrentView() {
  switchView(state.currentView);
}

// ==========================================================================
// 7. Hero View Interactions
// ==========================================================================
function setupHeroView() {
  const exploreBtn = document.getElementById('hero-explore-btn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      audio.playTap();
      switchView('dashboard');
    });
  }

  const triageCtaBtn = document.getElementById('hero-triage-btn');
  if (triageCtaBtn) {
    triageCtaBtn.addEventListener('click', () => {
      audio.playTap();
      switchView('triage');
    });
  }

  const mapCtaBtn = document.getElementById('hero-map-btn');
  if (mapCtaBtn) {
    mapCtaBtn.addEventListener('click', () => {
      audio.playTap();
      switchView('map');
    });
  }

  // Hero Preview Cards click triggers
  document.querySelectorAll('.hero-stat-card').forEach(card => {
    card.addEventListener('click', () => {
      const target = card.dataset.targetView || 'dashboard';
      audio.playTap();
      switchView(target);
    });
  });
}

// ==========================================================================
// 8. Operations Dashboard Visualizations
// ==========================================================================
function setupDashboardCharts() {
  // Filter pills interactions
  document.querySelectorAll('.dashboard-filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      audio.playTap();
      document.querySelectorAll('.dashboard-filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.dashboardFilter = pill.dataset.filter || 'occupancy';
      updateDashboardDataByFilter(state.dashboardFilter);
    });
  });

  // Period toggle
  document.querySelectorAll('.period-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      audio.playTap();
      document.querySelectorAll('.period-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.dashboardPeriod = pill.dataset.period || 'week';
      renderTreatmentCostSpline();
    });
  });

  // Mood history emoji click
  document.querySelectorAll('.mood-icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playTap();
      const day = btn.dataset.day || 'Today';
      const score = btn.dataset.score || '90%';
      const comment = btn.dataset.comment || 'Smooth triage flow, minimal emergency queues.';
      showToast(`😊 Patient Feedback (${day}): ${score} Satisfaction. "${comment}"`);
    });
  });

  // Initial chart renders
  renderBedOccupancyDial(75);
  renderSatisfactionArc(81);
  renderTreatmentCostSpline();
  renderConstellationGraph();
}

function renderBedOccupancyDial(percent) {
  const container = document.getElementById('occupancy-dial-svg');
  if (!container) return;

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  container.innerHTML = `
    <svg width="110" height="110" viewBox="0 0 110 110">
      <!-- Background Track with subtle tick dashes -->
      <circle cx="55" cy="55" r="42" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" stroke-dasharray="3 3"/>
      <!-- Active Progress Arc -->
      <circle cx="55" cy="55" r="42" fill="none" stroke="url(#mintGrad)" stroke-width="8" 
              stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"
              stroke-linecap="round" transform="rotate(-90 55 55)" style="transition: stroke-dashoffset 1s ease;"/>
      <defs>
        <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#34d399"/>
          <stop offset="100%" stop-color="#c4b5fd"/>
        </linearGradient>
      </defs>
    </svg>
  `;

  const textEl = document.getElementById('occupancy-percent-text');
  if (textEl) textEl.textContent = `${percent}%`;
}

function renderSatisfactionArc(percent) {
  const container = document.getElementById('satisfaction-arc-svg');
  if (!container) return;

  // Semi circle arc radius 75
  const arcLen = Math.PI * 75;
  const offset = arcLen - (percent / 100) * arcLen;

  container.innerHTML = `
    <svg width="220" height="110" viewBox="0 0 220 110">
      <!-- Background semi-arc -->
      <path d="M 25 100 A 75 75 0 0 1 195 100" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="12" stroke-dasharray="4 4"/>
      <!-- Active satisfaction arc -->
      <path d="M 25 100 A 75 75 0 0 1 195 100" fill="none" stroke="url(#arcGradient)" stroke-width="12" 
            stroke-dasharray="${arcLen}" stroke-dashoffset="${offset}" stroke-linecap="round"
            style="transition: stroke-dashoffset 1.2s ease;"/>
      <defs>
        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#34d399"/>
          <stop offset="70%" stop-color="#c4b5fd"/>
          <stop offset="100%" stop-color="#f472b6"/>
        </linearGradient>
      </defs>
    </svg>
  `;

  const percentEl = document.getElementById('satisfaction-percent-val');
  if (percentEl) percentEl.textContent = `${percent}%`;
}

function renderTreatmentCostSpline() {
  const container = document.getElementById('costs-spline-svg');
  if (!container) return;

  // Labeled checkpoints from reference image: $6,850, $10,720, $8,420, $8,720, $8,220
  const points = [
    { x: 30, y: 70, val: '$6,850', age: '1-17' },
    { x: 100, y: 25, val: '$10,720', age: '18-44' },
    { x: 170, y: 58, val: '$8,420', age: '45-64' },
    { x: 240, y: 52, val: '$8,720', age: '65-84' },
    { x: 310, y: 62, val: '$8,220', age: '85+' }
  ];

  const pathD = `M 20 85 C 60 80, 75 25, 100 25 C 130 25, 150 60, 170 58 C 200 55, 215 50, 240 52 C 275 55, 285 64, 320 62`;

  let nodesHtml = '';
  points.forEach(pt => {
    nodesHtml += `
      <g class="spline-node" style="cursor: pointer;" onclick="showToast('Average Cost for Age Group ${pt.age}: ${pt.val}')">
        <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#ffffff" stroke="#c4b5fd" stroke-width="2"/>
        <text x="${pt.x}" y="${pt.y - 8}" text-anchor="middle" font-size="9" fill="#c4b5fd" font-weight="600">${pt.val}</text>
        <text x="${pt.x}" y="105" text-anchor="middle" font-size="9" fill="#64748b">${pt.age}</text>
      </g>
    `;
  });

  container.innerHTML = `
    <svg width="100%" height="115" viewBox="0 0 340 115" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(196, 181, 253, 0.25)"/>
          <stop offset="100%" stop-color="rgba(196, 181, 253, 0)"/>
        </linearGradient>
      </defs>
      <!-- Horizontal reference lines -->
      <line x1="20" y1="30" x2="320" y2="30" stroke="rgba(255,255,255,0.04)" stroke-dasharray="2 2"/>
      <line x1="20" y1="65" x2="320" y2="65" stroke="rgba(255,255,255,0.04)" stroke-dasharray="2 2"/>
      <!-- Curve Path -->
      <path d="${pathD}" fill="none" stroke="#c4b5fd" stroke-width="2.5" stroke-linecap="round"/>
      ${nodesHtml}
    </svg>
  `;
}

function renderConstellationGraph() {
  const container = document.getElementById('constellation-svg');
  if (!container) return;

  // Department follow up rates from reference: Medicine 27%, Geriatrics 29%, Surgery 31%, Gynecology 32%, Cardiology 28%
  const nodes = [
    { id: 'med', name: 'Medicine', rate: '27%', x: 80, y: 55, color: '#c4b5fd' },
    { id: 'ger', name: 'Geriatrics', rate: '29%', x: 230, y: 75, color: '#f472b6' },
    { id: 'sur', name: 'Surgery', rate: '31%', x: 190, y: 135, color: '#34d399' },
    { id: 'gyn', name: 'Gynecology', rate: '32%', x: 275, y: 130, color: '#c4b5fd' },
    { id: 'car', name: 'Cardiology', rate: '29%', x: 60, y: 135, color: '#f472b6' }
  ];

  // Links connecting constellation
  const links = [
    [0, 1], [0, 4], [1, 2], [1, 3], [2, 3], [2, 4], [0, 2]
  ];

  let linksHtml = '';
  links.forEach(([i, j]) => {
    const n1 = nodes[i];
    const n2 = nodes[j];
    linksHtml += `
      <line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" 
            stroke="rgba(255,255,255,0.12)" stroke-width="1.2" stroke-dasharray="3 2"/>
    `;
  });

  let nodesHtml = '';
  nodes.forEach(n => {
    nodesHtml += `
      <g style="cursor: pointer;" onclick="showToast('${n.name} Follow-up Rate: ${n.rate}')">
        <circle cx="${n.x}" cy="${n.y}" r="17" fill="#181b24" stroke="${n.color}" stroke-width="1.8"/>
        <text x="${n.x}" y="${n.y - 2}" text-anchor="middle" font-size="8" fill="#94a3b8" font-weight="500">${n.name}</text>
        <text x="${n.x}" y="${n.y + 9}" text-anchor="middle" font-size="9.5" fill="#ffffff" font-weight="700">${n.rate}</text>
      </g>
    `;
  });

  container.innerHTML = `
    <svg width="100%" height="160" viewBox="0 0 340 160">
      ${linksHtml}
      ${nodesHtml}
    </svg>
  `;
}

function updateDashboardDataByFilter(filter) {
  if (filter === 'occupancy') {
    renderBedOccupancyDial(75);
    renderSatisfactionArc(81);
  } else if (filter === 'turnover') {
    renderBedOccupancyDial(68);
    renderSatisfactionArc(86);
  } else if (filter === 'efficiency') {
    renderBedOccupancyDial(84);
    renderSatisfactionArc(89);
  } else {
    renderBedOccupancyDial(78);
    renderSatisfactionArc(83);
  }
}

function animateDashboardGauges() {
  renderBedOccupancyDial(state.metrics.occupiedBeds / state.metrics.totalBeds * 100 | 0);
  renderSatisfactionArc(state.metrics.patientSatisfaction);
}

// ==========================================================================
// 9. Interactive Anatomical Body Navigator & Symptom Triage
// ==========================================================================
function setupAnatomicalTriage() {
  // Body view toggle (Front / Back)
  document.querySelectorAll('.body-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playTap();
      document.querySelectorAll('.body-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.triage.view = btn.dataset.view;
      renderAnatomicalBodySVG();
    });
  });

  // Pain range slider
  const painInput = document.getElementById('pain-severity-range');
  const painValDisplay = document.getElementById('pain-severity-value');
  if (painInput && painValDisplay) {
    painInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.triage.painScore = val;
      painValDisplay.textContent = `${val}/10`;
      updateTriageRecommendation();
    });
  }

  // Triage Action Buttons
  const issueTokenBtn = document.getElementById('triage-issue-token-btn');
  if (issueTokenBtn) {
    issueTokenBtn.addEventListener('click', () => {
      audio.playChime();
      const zoneData = BODY_ZONES[state.triage.selectedZone];
      generateTokenForDepartment(zoneData.department);
      switchView('tokens');
      showToast(`🎫 Priority Token generated for ${zoneData.department}!`);
    });
  }

  const showMapBtn = document.getElementById('triage-show-map-btn');
  if (showMapBtn) {
    showMapBtn.addEventListener('click', () => {
      audio.playTap();
      const zoneData = BODY_ZONES[state.triage.selectedZone];
      state.map.targetLocation = zoneData.mapTarget || 'cardiology_204';
      state.map.activeFloor = MAP_LOCATIONS[state.map.targetLocation]?.floor || 2;
      switchView('map');
      showToast(`🗺️ Navigating to ${zoneData.department} on Floor ${state.map.activeFloor}`);
    });
  }

  const askAiBtn = document.getElementById('triage-ask-ai-btn');
  if (askAiBtn) {
    askAiBtn.addEventListener('click', () => {
      audio.playTap();
      const zoneData = BODY_ZONES[state.triage.selectedZone];
      switchView('aidesk');
      postChatMessage(`I'm experiencing ${state.triage.selectedSymptoms.join(' and ')} in my ${zoneData.name}. Pain level is ${state.triage.painScore}/10. What should I prepare before seeing the physician?`);
    });
  }

  // Render initial SVG body and details
  renderAnatomicalBodySVG();
  selectBodyZone('chest');
}

function renderAnatomicalBodySVG() {
  const container = document.getElementById('anatomical-body-svg');
  if (!container) return;

  const isFront = state.triage.view === 'front';

  container.innerHTML = `
    <svg width="100%" height="480" viewBox="0 0 280 480">
      <defs>
        <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(184, 165, 254, 0.15)"/>
          <stop offset="100%" stop-color="rgba(184, 165, 254, 0)"/>
        </radialGradient>
      </defs>

      <!-- Background silhouette glow -->
      <ellipse cx="140" cy="240" rx="100" ry="210" fill="url(#bodyGlow)" />

      <!-- Head Zone -->
      <path id="zone-head" class="body-zone-shape ${state.triage.selectedZone === 'head' ? 'selected' : ''}" 
            d="M 120 40 C 120 18, 160 18, 160 40 C 160 62, 120 62, 120 40 Z"
            onclick="selectBodyZone('head')"/>
      <text x="140" y="44" class="body-zone-tag" text-anchor="middle">Head / Brain</text>

      <!-- Neck / ENT Zone -->
      <rect id="zone-throat" class="body-zone-shape ${state.triage.selectedZone === 'throat' ? 'selected' : ''}"
            x="130" y="65" width="20" height="18" rx="4"
            onclick="selectBodyZone('throat')"/>

      <!-- Chest & Heart Zone -->
      <path id="zone-chest" class="body-zone-shape ${state.triage.selectedZone === 'chest' ? 'selected' : ''}"
            d="M 110 88 C 125 84, 155 84, 170 88 L 175 145 C 150 152, 130 152, 105 145 Z"
            onclick="selectBodyZone('chest')"/>
      <text x="140" y="118" class="body-zone-tag" text-anchor="middle">Chest & Heart</text>

      <!-- Abdomen Zone (Front) or Spine Zone (Back) -->
      ${isFront ? `
        <path id="zone-abdomen" class="body-zone-shape ${state.triage.selectedZone === 'abdomen' ? 'selected' : ''}"
              d="M 108 148 C 130 154, 150 154, 172 148 L 168 205 C 145 210, 135 210, 112 205 Z"
              onclick="selectBodyZone('abdomen')"/>
        <text x="140" y="180" class="body-zone-tag" text-anchor="middle">Abdomen</text>
      ` : `
        <path id="zone-spine" class="body-zone-shape ${state.triage.selectedZone === 'spine' ? 'selected' : ''}"
              d="M 132 90 L 148 90 L 146 220 L 134 220 Z"
              onclick="selectBodyZone('spine')"/>
        <text x="140" y="160" class="body-zone-tag" text-anchor="middle">Spine</text>
      `}

      <!-- Pelvis & Urology Zone -->
      <path id="zone-pelvis" class="body-zone-shape ${state.triage.selectedZone === 'pelvis' ? 'selected' : ''}"
            d="M 114 208 C 130 212, 150 212, 166 208 L 172 245 C 145 252, 135 252, 108 245 Z"
            onclick="selectBodyZone('pelvis')"/>
      <text x="140" y="232" class="body-zone-tag" text-anchor="middle">Pelvis / Renal</text>

      <!-- Upper Limbs (Left & Right Arms) -->
      <path id="zone-upperLimbs" class="body-zone-shape ${state.triage.selectedZone === 'upperLimbs' ? 'selected' : ''}"
            d="M 98 90 L 80 180 L 68 250 L 80 252 L 95 185 L 106 100 Z
               M 182 90 L 200 180 L 212 250 L 200 252 L 185 185 L 174 100 Z"
            onclick="selectBodyZone('upperLimbs')"/>
      <text x="64" y="170" class="body-zone-tag" text-anchor="middle">Limbs</text>

      <!-- Lower Limbs (Legs & Knees) -->
      <path id="zone-lowerLimbs" class="body-zone-shape ${state.triage.selectedZone === 'lowerLimbs' ? 'selected' : ''}"
            d="M 112 250 L 102 360 L 98 440 L 118 440 L 126 360 L 136 250 Z
               M 168 250 L 178 360 L 182 440 L 162 440 L 154 360 L 144 250 Z"
            onclick="selectBodyZone('lowerLimbs')"/>
      <text x="140" y="350" class="body-zone-tag" text-anchor="middle">Knees & Legs</text>
    </svg>
  `;
}

window.selectBodyZone = function(zoneKey) {
  audio.playTap();
  state.triage.selectedZone = zoneKey;
  
  // Highlight shape
  document.querySelectorAll('.body-zone-shape').forEach(s => s.classList.remove('selected'));
  const targetShape = document.getElementById(`zone-${zoneKey}`);
  if (targetShape) targetShape.classList.add('selected');

  const zoneData = BODY_ZONES[zoneKey] || BODY_ZONES.chest;
  state.triage.selectedSymptoms = [zoneData.symptoms[0]];

  updateTriagePanelUI(zoneData);
};

function updateTriagePanelUI(zoneData) {
  const titleEl = document.getElementById('triage-zone-title');
  if (titleEl) titleEl.textContent = zoneData.name;

  // Render Symptom Check chips
  const chipsContainer = document.getElementById('triage-symptoms-chips');
  if (chipsContainer) {
    chipsContainer.innerHTML = '';
    zoneData.symptoms.forEach((sym, idx) => {
      const isChecked = state.triage.selectedSymptoms.includes(sym);
      const chip = document.createElement('div');
      chip.className = `symptom-chip ${isChecked ? 'checked' : ''}`;
      chip.textContent = sym;
      chip.addEventListener('click', () => {
        audio.playTap();
        if (state.triage.selectedSymptoms.includes(sym)) {
          state.triage.selectedSymptoms = state.triage.selectedSymptoms.filter(s => s !== sym);
        } else {
          state.triage.selectedSymptoms.push(sym);
        }
        chip.classList.toggle('checked');
        updateTriageRecommendation();
      });
      chipsContainer.appendChild(chip);
    });
  }

  updateTriageRecommendation();
}

function updateTriageRecommendation() {
  const zoneData = BODY_ZONES[state.triage.selectedZone] || BODY_ZONES.chest;
  const pain = state.triage.painScore;

  // Determine Triage Severity Tier
  let tier = 'Routine';
  let tierClass = 'tier-routine';
  let wait = zoneData.defaultWait;

  if (pain >= 8 || state.triage.selectedZone === 'chest') {
    tier = 'Level 1: Urgent Emergency';
    tierClass = 'tier-urgent';
    wait = 'Immediate (0-2 mins)';
  } else if (pain >= 5) {
    tier = 'Level 2: Priority Care';
    tierClass = 'tier-moderate';
    wait = '8-12 mins';
  }

  const badgeEl = document.getElementById('triage-tier-badge');
  if (badgeEl) {
    badgeEl.textContent = tier;
    badgeEl.className = `triage-tier-badge ${tierClass}`;
  }

  const deptEl = document.getElementById('rec-dept-name');
  if (deptEl) deptEl.textContent = zoneData.department;

  const doctorEl = document.getElementById('rec-doctor-name');
  if (doctorEl) doctorEl.textContent = zoneData.doctor;

  const floorEl = document.getElementById('rec-floor-loc');
  if (floorEl) floorEl.textContent = zoneData.floor;

  const waitEl = document.getElementById('rec-wait-time');
  if (waitEl) waitEl.textContent = wait;
}

// ==========================================================================
// 10. Live Token Kiosk & Queue Management System
// ==========================================================================
function setupTokenSystem() {
  const issueForm = document.getElementById('token-issue-form');
  if (issueForm) {
    issueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      audio.playChime();

      const dept = document.getElementById('token-dept-select')?.value || 'General OPD';
      const patientName = document.getElementById('token-patient-name')?.value || 'Patient';
      const priority = document.getElementById('token-priority-select')?.value || 'Standard';

      const newToken = createNewToken(dept, patientName, priority);
      renderLiveQueueBoard();
      showToast(`🎟️ Token ${newToken.id} issued for ${patientName} (${dept})`);
    });
  }

  // Call Next Token button (simulates staff desk)
  const callNextBtn = document.getElementById('token-call-next-btn');
  if (callNextBtn) {
    callNextBtn.addEventListener('click', () => {
      callNextInQueue();
    });
  }

  // Initial queue render
  renderLiveQueueBoard();
}

function createNewToken(dept, patientName, priority) {
  const prefixes = {
    'Cardiology': 'CARD',
    'Emergency': 'EMRG',
    'Radiology': 'RAD',
    'Orthopedics': 'ORTH',
    'Neurology': 'NEUR',
    'General OPD': 'OPD',
    'Pharmacy': 'RX'
  };

  const prefix = prefixes[dept] || 'OPD';
  const num = Math.floor(Math.random() * 800) + 100;
  const tokenId = `${prefix}-${num}`;

  const tokenObj = {
    id: tokenId,
    patientName,
    dept,
    room: getRoomForDept(dept),
    doctor: getDoctorForDept(dept),
    wait: '15 mins',
    priority,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  state.tokens.nextUp.push(tokenObj);

  // Update Preview Ticket
  const previewIdEl = document.getElementById('ticket-preview-id');
  if (previewIdEl) previewIdEl.textContent = tokenId;

  const previewDeptEl = document.getElementById('ticket-preview-dept');
  if (previewDeptEl) previewDeptEl.textContent = dept;

  const previewRoomEl = document.getElementById('ticket-preview-room');
  if (previewRoomEl) previewRoomEl.textContent = tokenObj.room;

  return tokenObj;
}

function generateTokenForDepartment(deptName) {
  createNewToken(deptName, 'Walk-in Patient', 'Triage Direct');
  renderLiveQueueBoard();
}

function callNextInQueue() {
  if (state.tokens.nextUp.length === 0) {
    showToast('All queues are currently clear!');
    return;
  }

  audio.playChime();
  const next = state.tokens.nextUp.shift();
  state.tokens.history.unshift(state.tokens.nowServing);
  state.tokens.nowServing = next;

  renderLiveQueueBoard();

  // Voice announcement
  const announcement = `Attention please. Token ${next.id}, please proceed to ${next.room}`;
  audio.speak(announcement);

  showToast(`📢 Now Calling: Token ${next.id} -> ${next.room}`);
}

function renderLiveQueueBoard() {
  const nowServingId = document.getElementById('now-serving-id');
  if (nowServingId) nowServingId.textContent = state.tokens.nowServing.id;

  const nowServingDept = document.getElementById('now-serving-dept');
  if (nowServingDept) nowServingDept.textContent = state.tokens.nowServing.dept;

  const nowServingRoom = document.getElementById('now-serving-room');
  if (nowServingRoom) nowServingRoom.textContent = state.tokens.nowServing.room;

  const queueTableBody = document.getElementById('queue-table-body');
  if (queueTableBody) {
    queueTableBody.innerHTML = '';
    state.tokens.nextUp.forEach((t, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="font-family: var(--font-mono); color: var(--lavender-300);">${t.id}</strong></td>
        <td>${t.dept}</td>
        <td>${t.room}</td>
        <td><span class="patient-badge-trend" style="font-size:0.75rem;">${t.wait}</span></td>
        <td>
          <span style="font-size:0.72rem; padding: 2px 7px; border-radius: 99px; background: rgba(255,255,255,0.06);">
            ${t.priority}
          </span>
        </td>
      `;
      queueTableBody.appendChild(tr);
    });
  }
}

function getRoomForDept(dept) {
  const map = {
    'Cardiology': 'Suite 204 (Floor 2)',
    'Emergency': 'Trauma Bay 01 (Floor 1)',
    'Radiology': 'MRI Suite 2B (Floor 2)',
    'Orthopedics': 'Room 104 (Floor 1)',
    'Neurology': 'Room 304 (Floor 3)',
    'General OPD': 'Room 102 (Floor 1)',
    'Pharmacy': 'Counter 3 (Floor 1)'
  };
  return map[dept] || 'Room 101';
}

function getDoctorForDept(dept) {
  const map = {
    'Cardiology': 'Dr. Alistair Vance',
    'Emergency': 'Dr. Sarah Lin',
    'Radiology': 'Dr. Robert Miller',
    'Orthopedics': 'Dr. Marcus Wright',
    'Neurology': 'Dr. Evelyn Zhang',
    'General OPD': 'Dr. Elena Rostova',
    'Pharmacy': 'Pharm. Leo Chen'
  };
  return map[dept] || 'Attending Physician';
}

// ==========================================================================
// 11. Interactive Hospital Multi-Floor Map & Wayfinding
// ==========================================================================
function setupHospitalMap() {
  // Floor tabs
  document.querySelectorAll('.floor-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playTap();
      document.querySelectorAll('.floor-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const floorNum = parseInt(btn.dataset.floor, 10);
      state.map.activeFloor = floorNum;
      renderHospitalMap(floorNum);
    });
  });

  // Start & Target select
  const startSelect = document.getElementById('map-start-select');
  const targetSelect = document.getElementById('map-target-select');

  if (startSelect && targetSelect) {
    startSelect.addEventListener('change', (e) => {
      state.map.startLocation = e.target.value;
      calculateAndRenderRoute();
    });

    targetSelect.addEventListener('change', (e) => {
      state.map.targetLocation = e.target.value;
      const targetLoc = MAP_LOCATIONS[state.map.targetLocation];
      if (targetLoc) {
        state.map.activeFloor = targetLoc.floor;
        // update floor tab active state
        document.querySelectorAll('.floor-tab-btn').forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.floor, 10) === targetLoc.floor);
        });
      }
      renderHospitalMap(state.map.activeFloor);
    });
  }

  // Accessibility toggle
  const accessToggle = document.getElementById('map-accessible-toggle');
  if (accessToggle) {
    accessToggle.addEventListener('change', (e) => {
      state.map.accessibleRoute = e.target.checked;
      audio.playTap();
      calculateAndRenderRoute();
    });
  }
}

function renderHospitalMap(floor) {
  const container = document.getElementById('hospital-map-svg-container');
  if (!container) return;

  const floorLabels = {
    1: 'Ground Floor: Emergency, Registration, Pharmacy & Outpatient Clinics',
    2: 'Level 2: Diagnostic Imaging, Cath Lab & Cardiology Suite',
    3: 'Level 3: Intensive Care Units, Neurology & Surgical Pavilion',
    4: 'Level 4: Inpatient Private Suites & Pediatric Care'
  };

  const titleEl = document.getElementById('map-floor-title');
  if (titleEl) titleEl.textContent = floorLabels[floor] || `Floor ${floor}`;

  // Floor architectural blueprints
  let roomsSvg = '';
  if (floor === 1) {
    roomsSvg = `
      <!-- Hallway Corridor -->
      <rect x="60" y="240" width="400" height="40" fill="#141720" stroke="rgba(255,255,255,0.06)"/>
      <rect x="240" y="100" width="40" height="300" fill="#141720" stroke="rgba(255,255,255,0.06)"/>

      <!-- Rooms -->
      <rect id="room-entrance" class="map-room-rect" x="60" y="360" width="100" height="80" rx="8" onclick="onRoomClick('Main Entrance & Lobby')"/>
      <text x="110" y="405" font-size="11" fill="#c4b5fd" font-weight="700" text-anchor="middle">Main Lobby</text>

      <rect id="room-er" class="map-room-rect" x="180" y="340" width="120" height="90" rx="8" onclick="onRoomClick('Emergency Trauma Bay')"/>
      <text x="240" y="390" font-size="11" fill="#f472b6" font-weight="700" text-anchor="middle">Emergency Bay</text>

      <rect id="room-pharmacy" class="map-room-rect" x="320" y="350" width="140" height="80" rx="8" onclick="onRoomClick('Central Pharmacy')"/>
      <text x="390" y="395" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Pharmacy</text>

      <rect id="room-ortho1" class="map-room-rect" x="60" y="100" width="90" height="80" rx="8" onclick="onRoomClick('Orthopedics Room 104')"/>
      <text x="105" y="145" font-size="10" fill="#ffffff" font-weight="600" text-anchor="middle">Ortho 104</text>

      <rect id="room-ortho2" class="map-room-rect" x="160" y="100" width="90" height="80" rx="8" onclick="onRoomClick('Sports Med Room 106')"/>
      <text x="205" y="145" font-size="10" fill="#ffffff" font-weight="600" text-anchor="middle">Sports 106</text>

      <rect id="room-spine" class="map-room-rect" x="290" y="100" width="90" height="80" rx="8" onclick="onRoomClick('Spine Center Room 108')"/>
      <text x="335" y="145" font-size="10" fill="#ffffff" font-weight="600" text-anchor="middle">Spine 108</text>

      <rect id="room-ent" class="map-room-rect" x="390" y="100" width="90" height="80" rx="8" onclick="onRoomClick('ENT Clinic Room 115')"/>
      <text x="435" y="145" font-size="10" fill="#ffffff" font-weight="600" text-anchor="middle">ENT 115</text>
    `;
  } else if (floor === 2) {
    roomsSvg = `
      <!-- Hallway Corridor -->
      <rect x="60" y="240" width="400" height="40" fill="#141720" stroke="rgba(255,255,255,0.06)"/>
      <rect x="240" y="80" width="40" height="340" fill="#141720" stroke="rgba(255,255,255,0.06)"/>

      <!-- Elevator Core -->
      <rect id="room-elev" class="map-room-rect" x="230" y="230" width="60" height="60" rx="10" fill="#1f2330"/>
      <text x="260" y="265" font-size="10" fill="#fbbf24" font-weight="700" text-anchor="middle">Elevators</text>

      <!-- Rooms -->
      <rect id="room-cardiology_204" class="map-room-rect highlighted" x="70" y="80" width="140" height="100" rx="8" onclick="onRoomClick('Cardiology Suite 204')"/>
      <text x="140" y="135" font-size="11" fill="#c4b5fd" font-weight="700" text-anchor="middle">Cardiology Suite 204</text>

      <rect id="room-mri" class="map-room-rect" x="310" y="80" width="140" height="100" rx="8" onclick="onRoomClick('3T MRI Suite 2B')"/>
      <text x="380" y="135" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">MRI Suite 2B</text>

      <rect id="room-cath" class="map-room-rect" x="70" y="310" width="140" height="90" rx="8" onclick="onRoomClick('Cardiac Cath Lab')"/>
      <text x="140" y="360" font-size="11" fill="#ffffff" font-weight="600" text-anchor="middle">Cath Lab</text>

      <rect id="room-gastro" class="map-room-rect" x="310" y="310" width="140" height="90" rx="8" onclick="onRoomClick('Gastroenterology Room 220')"/>
      <text x="380" y="360" font-size="11" fill="#ffffff" font-weight="600" text-anchor="middle">Gastroenterology</text>
    `;
  } else if (floor === 3) {
    roomsSvg = `
      <rect x="60" y="240" width="400" height="40" fill="#141720" stroke="rgba(255,255,255,0.06)"/>
      <rect id="room-neuro" class="map-room-rect" x="90" y="90" width="150" height="100" rx="8" onclick="onRoomClick('Neurology Unit Room 304')"/>
      <text x="165" y="145" font-size="11" fill="#c4b5fd" font-weight="700" text-anchor="middle">Neurology 304</text>

      <rect id="room-urology" class="map-room-rect" x="280" y="90" width="150" height="100" rx="8" onclick="onRoomClick('Nephrology & Urology')"/>
      <text x="355" y="145" font-size="11" fill="#ffffff" font-weight="600" text-anchor="middle">Urology 312</text>

      <rect id="room-icu" class="map-room-rect" x="140" y="310" width="240" height="90" rx="8" onclick="onRoomClick('Intensive Care Unit (ICU)')"/>
      <text x="260" y="360" font-size="12" fill="#f472b6" font-weight="800" text-anchor="middle">Critical ICU Complex</text>
    `;
  } else {
    roomsSvg = `
      <rect x="60" y="240" width="400" height="40" fill="#141720" stroke="rgba(255,255,255,0.06)"/>
      <rect class="map-room-rect" x="90" y="90" width="150" height="100" rx="8" onclick="onRoomClick('Private Suites 401-415')"/>
      <text x="165" y="145" font-size="11" fill="#c4b5fd" font-weight="700" text-anchor="middle">Private Suites</text>

      <rect class="map-room-rect" x="280" y="90" width="150" height="100" rx="8" onclick="onRoomClick('Pediatric Pavilion')"/>
      <text x="355" y="145" font-size="11" fill="#34d399" font-weight="700" text-anchor="middle">Pediatrics</text>

      <rect class="map-room-rect" x="140" y="310" width="240" height="90" rx="8" onclick="onRoomClick('Sky Garden & Cafeteria')"/>
      <text x="260" y="360" font-size="11" fill="#ffffff" font-weight="600" text-anchor="middle">Sky Garden & Bistro</text>
    `;
  }

  container.innerHTML = `
    <svg class="svg-map-svg" viewBox="0 0 520 460">
      <!-- Grid Lines -->
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="520" height="460" fill="url(#grid)" />
      ${roomsSvg}

      <!-- Animated Path Route (if on active floor) -->
      <g id="dynamic-route-group"></g>
    </svg>
  `;

  calculateAndRenderRoute();
}

window.onRoomClick = function(roomName) {
  audio.playTap();
  showToast(`📍 Selected: ${roomName}. Doctor on Duty: Available. Average Wait: 10 mins.`);
};

function calculateAndRenderRoute() {
  const routeGroup = document.getElementById('dynamic-route-group');
  if (!routeGroup) return;

  const target = MAP_LOCATIONS[state.map.targetLocation] || MAP_LOCATIONS.cardiology_204;
  
  // Render animated route if we are looking at the target floor
  if (state.map.activeFloor === target.floor) {
    let pathD = `M 260 260 L 260 140 L ${target.x} ${target.y}`;
    if (state.map.activeFloor === 1) {
      pathD = `M 110 400 L 260 400 L 260 260 L ${target.x} 260 L ${target.x} ${target.y}`;
    }

    routeGroup.innerHTML = `
      <path class="map-path-route" d="${pathD}"/>
      <!-- Destination pulsing marker -->
      <circle cx="${target.x}" cy="${target.y}" r="8" fill="#34d399" opacity="0.8">
        <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${target.x}" cy="${target.y}" r="4" fill="#ffffff"/>
    `;
  } else {
    routeGroup.innerHTML = '';
  }

  // Update Turn-by-Turn Instruction List
  renderTurnByTurnSteps(target);
}

function renderTurnByTurnSteps(target) {
  const stepsContainer = document.getElementById('route-steps-list');
  if (!stepsContainer) return;

  const isWheelchair = state.map.accessibleRoute;

  const steps = [
    `Start at Main Entrance Lobby (Ground Level).`,
    isWheelchair 
      ? `Proceed along the North Ramp toward Elevator Core B (Wide-access).` 
      : `Proceed through Central Hallway to Elevator Core B or Stairs.`,
    `Take Elevator B to Floor ${target.floor}.`,
    `Exit elevator and follow the glowing mint hallway wayfinding signage.`,
    `Arrive at ${target.name} (Estimated walking time: 2 mins • 95m).`
  ];

  stepsContainer.innerHTML = '';
  steps.forEach((step, idx) => {
    const item = document.createElement('div');
    item.className = 'route-step-item';
    item.innerHTML = `
      <span class="route-step-num">${idx + 1}</span>
      <span>${step}</span>
    `;
    stepsContainer.appendChild(item);
  });
}

// ==========================================================================
// 12. NexusCare AI Care Desk & Customer Assistant
// ==========================================================================
function setupAIDesk() {
  const sendBtn = document.getElementById('aidesk-send-btn');
  const inputEl = document.getElementById('aidesk-input');

  if (sendBtn && inputEl) {
    sendBtn.addEventListener('click', () => {
      const msg = inputEl.value.trim();
      if (msg) {
        postChatMessage(msg);
        inputEl.value = '';
      }
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const msg = inputEl.value.trim();
        if (msg) {
          postChatMessage(msg);
          inputEl.value = '';
        }
      }
    });
  }

  // Quick suggestion chips
  document.querySelectorAll('.ai-quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      audio.playTap();
      const question = chip.dataset.prompt;
      if (question) postChatMessage(question);
    });
  });
}

function postChatMessage(userText) {
  audio.playTap();
  const chatScroll = document.getElementById('aidesk-messages-list');
  if (!chatScroll) return;

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble bubble-user';
  userBubble.textContent = userText;
  chatScroll.appendChild(userBubble);
  chatScroll.scrollTop = chatScroll.scrollHeight;

  // Simulate AI Thinking & Typing
  setTimeout(() => {
    const aiResponse = generateAIResponse(userText);
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble bubble-ai';
    aiBubble.innerHTML = aiResponse;
    chatScroll.appendChild(aiBubble);
    chatScroll.scrollTop = chatScroll.scrollHeight;

    audio.playChime();
  }, 450);
}

function generateAIResponse(query) {
  const q = query.toLowerCase();

  if (q.includes('chest') || q.includes('heart') || q.includes('pain') || q.includes('shortness of breath')) {
    return `
      <strong style="color: var(--pink-300);">⚠️ CLINICAL PRIORITY ALERT: Acute Cardiac Triage Flagged</strong><br>
      Retrosternal chest discomfort or shortness of breath warrants immediate evaluation.
      <br><br>
      • <strong>Action Plan:</strong> Please proceed immediately to <strong>Emergency Trauma Bay (Floor 1, Wing A)</strong> or press the button below.<br>
      • <strong>Duty Physician:</strong> Dr. Alistair Vance (Interventional Cardiology) on standby.<br>
      <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <button class="btn-primary-pill" style="background: var(--pink-300); color: #000;" onclick="generateTokenForDepartment('Emergency'); switchView('tokens');">🚨 Dispatch Emergency Token</button>
        <button class="btn-icon-pill" onclick="switchView('map');">🗺️ Trace Emergency Route</button>
      </div>
    `;
  }

  if (q.includes('pharmacy') || q.includes('medicine') || q.includes('prescription')) {
    return `
      <strong>Central Pharmacy & Medication Dispense:</strong><br>
      The main dispensary is located on <strong>Floor 1, East Wing</strong>, directly opposite Registration Bay.<br>
      • <strong>Hours:</strong> 24/7 Operations.<br>
      • <strong>Digital Token:</strong> Present your prescription token (Prefix <code>RX-</code>) at Counter 3 or 4.<br>
      • <strong>Discharge Medications:</strong> Usually prepared within 8 minutes of physician electronic sign-off.
    `;
  }

  if (q.includes('wheelchair') || q.includes('elderly') || q.includes('escort') || q.includes('access')) {
    return `
      <strong>♿ NexusCare Accessibility & Escort Support:</strong><br>
      Wheelchair assistance has been logged for your arrival.<br>
      • Free transit wheelchairs are parked at <strong>Main Entrance Lobby (Bay A)</strong>.<br>
      • All clinical wings feature <strong>Wide-Access Elevator Core B</strong> and step-free gentle slope ramps.
    `;
  }

  if (q.includes('visiting') || q.includes('hours') || q.includes('icu')) {
    return `
      <strong>Hospital Visiting Guidelines & Hours:</strong><br>
      • <strong>General Inpatient Wards:</strong> 10:00 AM – 1:00 PM and 4:30 PM – 8:00 PM daily.<br>
      • <strong>Critical Care (ICU / CCU - Level 3):</strong> 11:00 AM – 12:00 PM and 5:00 PM – 6:00 PM (Strict limit: 1 immediate family member).<br>
      • Sanitization passes can be scanned at the Level 3 nursing station.
    `;
  }

  // General intelligent triage response
  return `
    <strong>NexusCare Clinical Guidance:</strong><br>
    I've indexed your query into our department directory.<br>
    • <strong>Recommended Action:</strong> You can use our <strong>Interactive Body Triage</strong> to pinpoint your symptoms, or issue an instant OPD queue token.<br>
    • <strong>Live Hospital Status:</strong> All 6 department queues are operating nominally with an average 11.4 min wait time.
  `;
}

// ==========================================================================
// 13. Bed Allocation Matrix View
// ==========================================================================
function setupBedMatrix() {
  const container = document.getElementById('bed-matrix-grid-container');
  if (!container) return;

  const wings = [
    { name: 'ICU Wing (Level 3)', count: 12, prefix: 'ICU' },
    { name: 'Emergency Bay (Level 1)', count: 10, prefix: 'ER' },
    { name: 'Cardiology Ward (Level 2)', count: 14, prefix: 'CARD' },
    { name: 'General Inpatient (Level 4)', count: 20, prefix: 'GEN' }
  ];

  let html = '';
  wings.forEach(wing => {
    html += `
      <div style="grid-column: 1 / -1; margin-top: 1rem; margin-bottom: 0.25rem;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--lavender-300);">${wing.name}</h4>
      </div>
    `;

    for (let i = 1; i <= wing.count; i++) {
      const bedId = `${wing.prefix}-${String(i).padStart(2, '0')}`;
      const isOccupied = Math.random() > 0.3;
      const isCleaning = !isOccupied && Math.random() > 0.6;
      const status = isOccupied ? 'occupied' : isCleaning ? 'cleaning' : 'available';

      html += `
        <div class="bed-tile" onclick="onBedTileClick('${bedId}', '${status}')">
          <div class="bed-tile-header">
            <span class="bed-id-label">${bedId}</span>
            <span class="bed-status-indicator status-${status}"></span>
          </div>
          <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: capitalize;">${status}</span>
        </div>
      `;
    }
  });

  container.innerHTML = html;
}

window.onBedTileClick = function(bedId, status) {
  audio.playTap();
  showToast(`🛏️ Bed ${bedId}: Status is "${status.toUpperCase()}". Click to update nurse allocation.`);
};

// ==========================================================================
// 14. Real-Time Hospital Simulation Engine
// ==========================================================================
function setupSimulationEngine() {
  const simEvents = [
    () => {
      state.metrics.occupiedBeds += 1;
      showToast('🚑 New triage intake admitted to Emergency Bay 03.');
      renderBedOccupancyDial(state.metrics.occupiedBeds / state.metrics.totalBeds * 100 | 0);
    },
    () => {
      showToast('🧼 Bed GEN-08 sanitized and flagged AVAILABLE in Wing 4.');
    },
    () => {
      const wait = (12 + Math.random() * 4).toFixed(1);
      state.metrics.avgWaitTime = wait;
      showToast(`⚡ Queue Telemetry Update: Average Wait Time optimized to ${wait} mins.`);
    },
    () => {
      showToast('📊 Cardiology follow-up rate synchronized with Electronic Health Records.');
    }
  ];

  // Periodic simulation heartbeat every 18 seconds
  setInterval(() => {
    if (state.simulationActive) {
      const randomEvent = simEvents[Math.floor(Math.random() * simEvents.length)];
      randomEvent();
    }
  }, 18000);
}

// ==========================================================================
// 15. Header Controls & Toasts
// ==========================================================================
function setupHeaderControls() {
  // Sound toggle button
  const soundBtn = document.getElementById('header-sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const enabled = audio.toggleSound();
      soundBtn.innerHTML = enabled 
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> Audio ON`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg> Audio MUTED`;
      showToast(enabled ? '🔊 Sound effects enabled' : '🔇 Audio muted');
    });
  }

  // Simulation toggle button
  const simBtn = document.getElementById('header-sim-toggle');
  if (simBtn) {
    simBtn.addEventListener('click', () => {
      audio.playTap();
      state.simulationActive = !state.simulationActive;
      simBtn.classList.toggle('active', state.simulationActive);
      showToast(state.simulationActive ? '🟢 Live telemetry streaming ACTIVE' : '⏸️ Telemetry simulation PAUSED');
    });
  }
}

function showToast(message) {
  const stack = document.getElementById('toast-container');
  if (!stack) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <span style="color: var(--mint-400);">●</span>
    <span>${message}</span>
  `;

  stack.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

window.showToast = showToast;
