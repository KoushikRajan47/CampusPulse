# Contributing to CampusPulse

Thank you for your interest in contributing to **CampusPulse**! We welcome contributions from developers, students, and open-source enthusiasts.

---

## 🎯 High-Impact Areas for Contribution (Good First Issues)

We have organized several high-priority features that you can contribute to right away:

### 1. 🗺️ Room Decoder Support for More Campuses
- **Current status:** Decodes room codes for SRM KTR (Tech Park `TP`, University Building `UB`, Believers Block `BEL`).
- **Contribution needed:** Add regex and location mappers for:
  - SRM Ramapuram (Main Block, PG Block, Dental Block)
  - SRM AP (Neerukonda campus buildings)
  - SRM Vadapalani campus
- **Files to edit:** `src/services/mockData.js`, `frontend/src/main.ts`, `mobile/screens/TimetableScreen.tsx`.

### 2. 🍲 Daily Mess Menu Feed
- **Contribution needed:** Crowdsourced or automated daily menu parser for student hostels (Paari, Kaveri, Oori, Nelson Mandela, Senbagam).
- **Files to edit:** `src/routes/campusRoutes.js` and new screen in `mobile/screens/MessScreen.tsx`.

### 3. 📄 Attendance Report Export (PDF / CSV)
- **Contribution needed:** Add a 1-click button to download an official attendance summary as a formatted PDF for parents or scholarship applications.

### 4. 📲 Home Screen Widgets (Android / iOS)
- **Contribution needed:** Build an Expo widget or dynamic island component displaying the current Day Order and upcoming class.

---

## 🛠️ Local Development Setup

### 1. Clone & Install
```bash
git clone https://github.com/KoushikRajan47/campuspulse.git
cd campuspulse

# Install root backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Running Backend & Frontend
```bash
# Terminal 1: Backend API (port 4000)
npm run dev

# Terminal 2: Web Preview (port 5173)
cd frontend
npm run dev
```

### 3. Running Mobile App (Expo)
```bash
cd mobile
npm install
npx expo start
```

---

## 📋 Git Workflow Guidelines

1. **Fork** the repository and create your feature branch:
   ```bash
   git checkout -b feat/add-ramapuram-room-decoder
   ```
2. **Follow Conventional Commits**:
   - `feat(...)`: New features
   - `fix(...)`: Bug fixes
   - `docs(...)`: Documentation changes
   - `style(...)`: Formatting or CSS enhancements
   - `refactor(...)`: Code refactoring without behavior change
3. **Run Type Checks**:
   ```bash
   cd frontend && npm run build
   ```
4. **Open a Pull Request** with a detailed explanation of your changes.

