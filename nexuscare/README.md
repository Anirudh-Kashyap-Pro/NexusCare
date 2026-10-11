# 🏥 NexusCare — Hospital Operations & Intelligent Patient-Flow Engine

NexusCare is an authentic, high-fidelity web application engineered for modern hospital command centers and ambulatory patient flow orchestration. Inspired by premium dark obsidian dashboards, NexusCare pairs clinical rigor with intuitive wayfinding, real-time queue intelligence, and vector-driven anatomical triage.

---

## 🎨 Visual Identity & Design System

- **Dark Charcoal / Obsidian Foundation:** Deep slate backgrounds (`#0b0c10`, `#12141a`, `#171922`) with subtle borders and ambient radial illumination.
- **Restrained Tri-Color Clinical Accents:**
  - **Soft Lavender / Lilac (`#c4b5fd`, `#b8a5fe`):** Active controls, primary metrics, neurological & diagnostic pathways.
  - **Fresh Mint / Emerald (`#34d399`, `#6ee7b7`):** Nominal capacity, available beds, real-time queue progressions.
  - **Blush Pink & Rose (`#f472b6`, `#fb7185`):** Critical ICU occupancy, acute clinical alerts, high-pain severity indicators.
- **Bespoke Chart Visuals:**
  - **Radial Bed Occupancy Dial:** Circular tick tracks with real-time percentage readout and striped progress capsules.
  - **Patient Density Dot Matrix:** 24-node dynamic status grid displaying inpatient flow.
  - **Weekly Admissions Bar Chart:** Lavender-to-mint gradient pillars with 45-degree diagonal striped texture.
  - **Average Treatment Cost Spline:** Smoothed SVG bezier curve with interactive age-group price checkpoints ($6,850 to $10,720).
  - **Department Constellation Network:** Floating interconnected nodes with hover feedback and follow-up rates.
  - **Patient Satisfaction Arc & Mood History:** Semi-circular gauge (81%) with interactive 7-day emoji mood tracker.

---

## 🚀 Key Functional Modules

1. **Interactive Hero & Operations Command:**
   - Cinematic entry with headline, live telemetry counters, and seamless switching into workspace views.
   - Live Hospital Grid status bar with simulation toggle.

2. **Interactive Anatomical Body Navigator & Symptom Triage:**
   - Dual-view vector human anatomy model (Anterior / Posterior).
   - Clickable anatomical zones: Head & Brain, Neck/ENT, Chest & Cardiopulmonary, Abdomen, Pelvic/Renal, Spine, Upper Limbs, Lower Limbs.
   - Dynamic clinical triage tier calculation (Urgent Level 1, Priority Level 2, Routine Level 3) with pain-scale slider (1-10).
   - One-click actions to issue department tokens, plot indoor navigation routes, or consult the AI Desk.

3. **Live Token Kiosk & Queue Management:**
   - Dispense priority tokens across Cardiology, Emergency, Radiology, Orthopedics, Neurology, General OPD, and Pharmacy.
   - Digital printable token slip with QR code and barcode.
   - Live Digital Queue Display with "Now Serving" banner and queue wait times.
   - Staff "Call Next Patient" trigger with **synthesized hospital audio chimes** and **voice announcements**.

4. **Multi-Floor Architectural Hospital Map & Indoor Wayfinding:**
   - 4-Floor interactive architectural blueprint (Ground ER, Level 2 Diagnostics, Level 3 ICU/Surgery, Level 4 Private Suites).
   - Animated SVG pulse route tracer showing exact hallway paths.
   - Turn-by-turn navigation instructions with walking distance and duration.
   - Wheelchair-accessible route mode (elevators & ramps).

5. **NexusCare AI Care Desk & Clinical Concierge:**
   - 24/7 intelligent patient assistance with conversational responses.
   - Quick-action triage for acute chest pain, pharmacy hours, wheelchair requests, and visiting protocols.
   - Integrated action triggers directly inside chat replies.

6. **Bed Management Matrix:**
   - Real-time ward visualization of ICU, ER, Cardiology, and Inpatient beds.
   - Live color badges for Occupied, Cleaning, and Available beds.

7. **Floating Horizontal Bottom Navigation Dock:**
   - Acrylic glassmorphic bottom bar (`backdrop-filter: blur(24px)`) with instant switching between views on desktop, tablet, and mobile.

---

## 💻 Quick Start & Running the Project

### Option 1: Direct Browser Launch
Simply double-click or open `index.html` in any modern web browser (Edge, Chrome, Firefox, Safari). No build steps or installations needed!

### Option 2: PowerShell Local Server
Run the included PowerShell server script:
```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```
Open [http://localhost:8080](http://localhost:8080) in your browser.
