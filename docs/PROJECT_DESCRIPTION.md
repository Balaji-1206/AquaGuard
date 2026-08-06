# 💧 AquaGuard — Smart Home Water Intelligence Platform

> **"Intelligent Water. Protected Home."**
> A full-stack IoT system for real-time household water quality monitoring, autonomous safety control, and AI-driven purity insights.

---

## 📌 Project Overview

**AquaGuard** is a smart home water intelligence platform that bridges IoT hardware, a real-time backend, and a cross-platform mobile application to give homeowners **complete visibility and autonomous control** over their household water quality. The system monitors every critical water zone in a home — from the underground sump to the overhead roof tank, kitchen RO purifier, and bathroom softener unit — using a network of ESP32-based sensor nodes.

AquaGuard is not just a monitoring dashboard; it is an **autonomous safety system** that can detect contamination events and pipe leaks in real time, and automatically shut off solenoid valves to protect families before they are even aware of a problem.

---

## 🏗️ System Architecture

```
+-------------------------------------------------------------------+
|                    HARDWARE LAYER (ESP32)                         |
|  pH Sensor | TDS Sensor | Turbidity | Flow Meter | Ultrasonic     |
|                    Solenoid Shutoff Valve                         |
+------------------------------+------------------------------------+
                               | HTTP REST (JSON Telemetry / 3s)
                               v
+-------------------------------------------------------------------+
|              NODE.JS BACKEND (Express + WebSocket)                |
|  - Telemetry Ingestion API (/api/telemetry)                       |
|  - Rule-Based Alert Engine + Cross-Node Correlation               |
|  - Real-Time WebSocket Broadcast (TELEMETRY_UPDATE,               |
|    VALVE_STATE_CHANGE, CONTAMINATION_SOURCE)                      |
|  - Smart Valve Command API (/api/valves/control)                  |
+------------------------------+------------------------------------+
                               | WebSocket / REST
                               v
+-------------------------------------------------------------------+
|           REACT NATIVE MOBILE APP (Expo / TypeScript)             |
|  Dashboard | AI Insights | Alerts | Node Details | Settings       |
|  MQTT Simulator | RO Filter Health | Tank Level | Usage Stats     |
|  Voice Alerts (TTS) | Demo Mode | Contamination Map               |
+-------------------------------------------------------------------+
```

---

## 🛠️ Tech Stack

### Mobile Application
| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 51) |
| Language | TypeScript |
| Navigation | React Navigation (Stack + Bottom Tabs) |
| State Management | React Context API + Custom Hooks |
| Animations | React Native Reanimated + Animated API |
| Graphics | React Native SVG, Expo Linear Gradient |
| Real-Time Streaming | MQTT Simulator + WebSocket (apiClient) |
| Text-to-Speech | expo-speech (multilingual TTS) |

### Backend Server
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Real-Time | WebSocket (ws) |
| Data Store | In-Memory (runtime-persistent) |
| Rules Engine | Custom Alert Engine + Cross-Node Correlation |

### Firmware (IoT)
| Layer | Technology |
|---|---|
| Microcontroller | ESP32 |
| Language | Arduino C++ |
| Libraries | WiFi, HTTPClient, ArduinoJson |
| Protocol | HTTP REST over Wi-Fi (3-second intervals) |
| Sensors | pH, TDS, Turbidity, Flow (Hall-Effect), Ultrasonic Level |
| Actuator | Solenoid Shutoff Valve (Relay-controlled) |

---

## 🔑 Core Features

### 🌐 Multi-Zone Smart Monitoring
4 independent water zones: Kitchen RO Purifier, Overhead Roof Tank, Underground Sump, Bathroom Softener Unit.

### 📡 Real-Time Telemetry Pipeline
ESP32 → HTTP POST every 3s → Express backend → WebSocket broadcast → React Native app.

### 🚨 Autonomous Emergency Response
Flow spike (>10 L/min) triggers immediate solenoid shutoff. pH hazard, high TDS, and turbidity spikes fire tiered alerts.

### 🧠 AI Water Quality Insights
Purity Score (0–100%), water classification (SAFE/BORDERLINE/UNSAFE/HAZARDOUS), use-case safety breakdown, 7-day trend chart, and AI recommendations.

### 🔩 RO Filter Cartridge Health Manager
4-stage filter tracking (Sediment, Pre-Carbon, RO Membrane, UV Lamp) with one-tap replacement ordering.

### 🚰 Smart Valve Control
Per-device manual and autonomous valve toggle, backend-synced to ESP32 relay on every telemetry response.

### 💧 Tank Level & Usage Analytics
Tank level visualization, daily consumption tracking, weekly trend classification.

### 📊 Historical Data Analytics
Daily/Weekly/Monthly charts for pH, TDS, Turbidity, Temperature.

### 🔔 Alert & Notification Engine
Multi-severity (CRITICAL/WARNING/INFO), per-alert resolve, batch resolve, push notification toggle.

---

## 🌟 Three Implemented Novelties

### 🔬 Novelty 1 — Predictive Filter Degradation Engine
Pure-TypeScript polynomial regression analyzes historical TDS, turbidity, and flow load to predict actual filter lifespan — not just a calendar countdown. Shows AI-predicted days ± confidence band alongside the calendar estimate.

**Key files:** `src/services/filterDegradationEngine.ts`, `src/components/home/FilterLifespanWidget.tsx`

### 🗣️ Novelty 2 — Multilingual Voice Alert System
`expo-speech` powered TTS announces CRITICAL and WARNING alerts in English, Tamil, or Hindi based on the user's language setting. CRITICAL alerts interrupt immediately; WARNING alerts are queued; INFO is silent.

**Key files:** `src/services/voiceAlertService.ts`, `src/context/VoiceAlertContext.tsx`

### 📍 Novelty 3 — Contamination Source Triangulation
Cross-node correlation engine on the backend models the household water graph and pinpoints the exact contamination source zone. An SVG topology diagram on the dashboard highlights the contaminated pipe segment with a confidence score.

**Key files:** `backend/services/alertEngine.js`, `src/components/dashboard/ContaminationMap.tsx`

---

## 🎭 Demo Mode
When no sensors or backend is connected, AquaGuard switches to Demo Mode with 5 realistic scenarios (Normal Day, High TDS Event, Pipe Leak Emergency, pH Drop, Post-Rain Turbidity), a 24-hour diurnal sensor cycle, and one-tap event simulation from Settings.

**Key files:** `src/constants/demoMockData.ts`, `src/services/demoDataService.ts`

---

## 📐 Project File Structure

```
AquaGuard/
├── docs/
│   └── PROJECT_DESCRIPTION.md      ← This file
├── firmware/
│   └── esp32_aquaguard/
│       └── esp32_aquaguard.ino
├── backend/
│   ├── server.js
│   ├── routes/telemetryRoutes.js   ← + CONTAMINATION_SOURCE event
│   └── services/alertEngine.js     ← + runCrossNodeCorrelation()
└── src/
    ├── components/
    │   ├── common/
    │   └── dashboard/
    │       ├── SensorCard.tsx
    │       └── ContaminationMap.tsx ← [NEW] SVG topology diagram
    ├── constants/
    │   ├── mockData.ts              ← + MOCK_FILTER_HISTORY
    │   ├── demoMockData.ts          ← [NEW] 5 demo scenarios
    │   └── thresholds.ts
    ├── context/
    │   ├── AuthContext.tsx
    │   ├── ThemeContext.tsx
    │   ├── WaterDataContext.tsx
    │   ├── NotificationContext.tsx  ← + voice alert integration
    │   └── VoiceAlertContext.tsx    ← [NEW] TTS context
    ├── screens/
    │   ├── dashboard/DashboardScreen.tsx ← + ContaminationMap
    │   ├── settings/SettingsScreen.tsx   ← + Voice + Demo Mode
    │   └── ...
    ├── services/
    │   ├── apiClient.ts
    │   ├── mockApi.ts
    │   ├── mqttSimulator.ts         ← + scenario switching
    │   ├── filterDegradationEngine.ts ← [NEW] ML prediction
    │   ├── voiceAlertService.ts       ← [NEW] TTS service
    │   └── demoDataService.ts         ← [NEW] Demo mode service
    └── types/index.ts               ← + ContaminationSourceEvent
```

---

## 🚀 Getting Started

### Mobile App
```bash
cd AquaGuard
npm install
npx expo start --web
```

### Backend
```bash
cd AquaGuard/backend
npm install
node server.js
```

### ESP32
1. Open `firmware/esp32_aquaguard/esp32_aquaguard.ino` in Arduino IDE
2. Set Wi-Fi credentials and backend IP (lines 30–38)
3. Flash to ESP32 DevKit V1

### Demo Mode
Launch the app with the backend offline — it automatically enters Demo Mode. Switch scenarios in **Settings → Demo Mode**.

---

## 📄 License
MIT License — Open source for community and educational use.

*Built with ESP32 · Node.js · React Native · TypeScript*
