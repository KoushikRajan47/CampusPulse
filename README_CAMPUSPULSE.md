# CampusPulse — Reverse-Engineered Campus Intelligence Engine

> A high-performance, 100% free, zero-knowledge academic companion designed for university students (featuring SRMIST KTR curriculum & Academia integration). Built to replace sluggish, paywalled student apps.

---

## 🌟 Key Differentiating Features

### 1. 🚨 "Ghost Absent" Detector & Automated OD (On-Duty) Auditor (Feature 1)
- **The Problem Solved:** Professors frequently make human errors marking students absent, or forget to convert absences to "On-Duty" (OD) for college fests, hackathons, and sports tournaments. Students only find out after the strict 7-day appeal cutoff.
- **How It Works:**
  - Automated discrepancy engine compares scheduled timetable periods with marked attendance records.
  - Automatically flags **Ghost Absences** (classes marked "Absent" during approved OD dates like Milan '26).
  - **1-Click Appeal Email Generator:** Drafts an official, pre-formatted appeal to your Faculty Advisor (FA) with student registration number, subject codes, dates, periods, and linked OD certificate references.
  - Tracks OD lifecycle: *Submitted ➔ FA Approved ➔ Credited on Academia*.

### 2. 🎰 Course Registration (Enrollment) Clash Simulator (Feature 4)
- **The Problem Solved:** When university course registration opens, seats vanish in 15 seconds. If a preferred slot or faculty fills up, students scramble without a clash-free backup schedule.
- **How It Works:**
  - Pre-build and save **Plan A, Plan B, and Plan C** schedules.
  - **Live Conflict Matrix:** Detects overlapping slot codes (Slot A, B, C, D, E, F, G, Labs P1–P5) and prevents timetable clashes before you enter the portal.
  - **⚡ Quick-Copy Bar:** 1-tap copies formatted course codes and faculty numbers for instant pasting into university enrollment portals.

### 3. 🛡️ Safe Bunk & Attendance Margin Forecaster
- Dynamic percentage forecaster with target thresholds (75%, 80%, 85%).
- Computes exact safe bunks remaining: *"You can safely miss 2 classes of DAA while staying above 75%."*
- Computes deficit recovery: *"You must attend the next 4 consecutive classes of Operating Systems to reach 75%."*

### 4. 🗺️ Day Order Timetable & Smart Room Decoder
- Supports rotating university Day Orders (Day 1 through Day 5).
- Automatically decodes cryptic room numbers into plain location info:
  - `TP-502` ➔ **Tech Park, 5th Floor, Room 502 (Nearest: Lift B)**
  - `UB-604` ➔ **University Building (UB), 6th Floor (Nearest: East Stairwell)**
  - `BEL-201` ➔ **Believers Block, 2nd Floor (Near Bio-Engg Connector)**

### 5. 🔒 Zero-Knowledge & Offline-First Resilience
- Credentials and session tokens remain on the client device.
- Local snapshot caching enables instant viewing of timetables and attendance even during morning university server crashes.
- 100% Free: No subscriptions, no paywalls, no tracking.

---

## 📂 Project Structure

```
├── mobile/                           # React Native & Expo Native App
│   ├── App.tsx                       # Root Tab Navigation Shell
│   ├── app.json                      # Expo configuration
│   ├── package.json                  # Native dependencies
│   ├── types/index.ts                # TypeScript data interfaces
│   ├── services/api.ts               # Backend & offline API client
│   └── screens/
│       ├── DashboardScreen.tsx       # Attendance & Safe Bunk Meter
│       ├── ODAuditorScreen.tsx       # Ghost Absent & OD Auditor (Feature 1)
│       ├── ClashSimulatorScreen.tsx  # Course Clash Simulator (Feature 4)
│       ├── TimetableScreen.tsx       # Rotating Day Order & Room Decoder
│       └── SettingsScreen.tsx        # Zero-Knowledge & Cache Settings
│
├── src/                              # Backend & University Scraper
│   ├── server.js                     # Express API Server (Port 4000)
│   ├── routes/campusRoutes.js        # REST endpoints for Academia, OD, Simulator
│   └── services/
│       ├── mockData.js               # Realistic SRM KTR CSE Dataset (Hybrid Mode)
│       ├── academiaClient.js         # Reverse-engineered Academia scraper
│       ├── odAuditor.js              # Discrepancy & email generator engine
│       └── clashSimulator.js         # Slot overlap & clash matrix engine
│
└── frontend/                         # Responsive Web Companion (Vite + TypeScript)
    ├── src/main.ts                   # Interactive Web Client
    ├── src/style.css                 # Dark-mode mobile frame styling
    └── index.html                    # Web entry point
```

---

## 🚀 Running the Project

### 1. Web Preview (Immediate Browser Access)
Both servers are running live:
- **Frontend Web App:** [http://localhost:5173/](http://localhost:5173/)
- **Backend API:** [http://localhost:4000/](http://localhost:4000/)

To run manually:
```powershell
# Terminal 1: Backend
node src/server.js

# Terminal 2: Web Frontend
cd frontend
npm run dev
```

### 2. Native Mobile App (React Native / Expo)
To launch the native iOS/Android mobile version using Expo:
```powershell
cd mobile
npx expo start
```
- Press `a` to open Android Emulator / Device.
- Press `i` to open iOS Simulator.
- Press `w` to open in Web preview.
- Or scan the QR code using the **Expo Go** app on your physical iPhone or Android phone.

