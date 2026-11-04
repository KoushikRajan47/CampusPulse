# CampusPulse ⚡

<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue?style=for-the-badge&logo=react" alt="Platform" />
  <img src="https://img.shields.io/badge/Stack-React%20Native%20%7C%20Expo%20%7C%20Node.js-61DAFB?style=for-the-badge&logo=expo" alt="Stack" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Zero--Knowledge-100%25%20On--Device-emerald?style=for-the-badge" alt="Zero-Knowledge" />
  <img src="https://img.shields.io/badge/University-SRM%20Academia%20Compatible-blueviolet?style=for-the-badge" alt="SRM" />
</p>

> **CampusPulse** is an open-source, zero-knowledge, 100% free campus companion built to solve real daily student friction points: catching uncredited On-Duty (OD) records, eliminating course registration clashes, forecasting safe bunks, and decoding labyrinthine campus buildings.

---

## 🚀 Key Features

### 1. 🚨 "Ghost Absent" Detector & Automated OD Auditor
* **Discrepancy Engine**: Automatically cross-references scheduled timetable hours with marked attendance logs.
* **Catch Ghost Absences**: Flags instances where professors mistakenly mark a student "Absent" during approved OD events (e.g. Hackathons, sports tournaments).
* **1-Click Appeal Email Generator**: Pre-formats an official letter to the Faculty Advisor (FA) with student registration numbers, subject codes, and linked certificate IDs before the 7-day condonation cutoff.

### 2. 🎰 Course Registration (Enrollment) Clash Simulator
* **Pre-Enrollment Planner**: Switch between **Plan A**, **Plan B**, and **Plan C** before university portals open.
* **Live Conflict Matrix**: Live validation of slot overlap (Slot A–G, Lab P1–P5) preventing timetable clashes before entering portal lotteries.
* **⚡ Quick-Copy Bar**: 1-tap copy of formatted course codes and faculty numbers for ultra-fast portal submission.

### 3. 🛡️ Safe Bunk & Deficit Forecaster
* Dynamic target selector (75%, 80%, 85%).
* Tells you exactly how many hours you can safely skip or must attend to recover from a deficit.

### 4. 🗺️ Rotating Day-Order Timetable & Room Decoder
* Decodes cryptic room codes:
  * `TP-502` ➔ **Tech Park, 5th Floor, Room 502 (Nearest: Lift B)**
  * `UB-604` ➔ **University Building (UB), 6th Floor (Nearest: East Stairwell)**
  * `BEL-201` ➔ **Believers Block, 2nd Floor (Near Bio-Engg Connector)**

### 5. 🔒 Zero-Knowledge Security & Hybrid Engine
* Credentials never leave the device.
* Works seamlessly in **Hybrid Mode**: loaded with realistic B.Tech CSE (Year 3) data for local testing, backed by a reverse-engineered scraper client for live Academia portal connection.

---

## 🏛️ Architecture

```mermaid
graph TD
  User([Student Client]) -->|Zero-Knowledge| LocalStore[(Encrypted Local Storage)]
  User -->|HTTP / React Native / Web| API[Express API Gateway :4000]
  
  subgraph Backend Core
    API --> ODAuditor[OD & Ghost Absent Auditor]
    API --> ClashSim[Course Clash Simulator]
    API --> BunkEngine[Safe Bunk & Forecaster Engine]
    API --> Scraper[AcademiaClient Scraper]
    API --> MockData[Hybrid Mock Engine]
  end

  Scraper -->|Session & Cookie Handshake| UniversityPortal[SRM Academia Portal]
  ODAuditor -->|1-Click Mailto Draft| FacultyAdvisor[Faculty Advisor Email]
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/KoushikRajan47/campuspulse.git
cd campuspulse

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Launch Local Web Companion
```bash
# Terminal 1: Backend Server
node src/server.js

# Terminal 2: Web Preview
cd frontend
npm run dev
```
Open **`http://localhost:5173/`** in your browser.

### 3. Launch React Native Mobile App (Expo)
```bash
cd mobile
npm install
npx expo start
```
Scan the QR code with **Expo Go** on Android or iOS.

---

## 🤝 Contributing
Contributions are warmly welcomed! Please check out [CONTRIBUTING.md](./CONTRIBUTING.md) for good first issues and development setup instructions.

---

## 📜 License
Distributed under the **MIT License**. See [LICENSE](./LICENSE) for details.
