# 💧 AquaGuard — Smart Home Water Intelligence Platform

> **"Intelligent Water. Protected Home."**  
> A full-stack IoT system for real-time household water quality monitoring, autonomous safety control, and AI-driven purity insights.

[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-61DAFB?logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-SDK%2051-000020?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org)
[![ESP32](https://img.shields.io/badge/Firmware-ESP32%20Arduino-E7352C?logo=arduino)](https://www.espressif.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📌 Overview

**AquaGuard** bridges IoT hardware, a real-time backend, and a cross-platform mobile application to give homeowners **complete visibility and autonomous control** over their household water quality. The system monitors every critical water zone — from the underground sump to the overhead roof tank, kitchen RO purifier, and bathroom softener unit — using a network of ESP32-based sensor nodes.

AquaGuard is not just a monitoring dashboard. It is an **autonomous safety system** that detects contamination events and pipe leaks in real time, and can **automatically shut off solenoid valves** to protect your family before they are even aware of a problem.

---

## 🏗️ System Architecture

```
+-------------------------------------------------------------------+
|                    HARDWARE LAYER (ESP32)                         |
|  pH Sensor | TDS Sensor | Turbidity | Flow Meter | Ultrasonic     |
|                    Solenoid Shutoff Valve (Relay)                 |
+------------------------------+------------------------------------+
                               | HTTP REST — JSON Telemetry (3 s)
                               v
+-------------------------------------------------------------------+
|              NODE.JS BACKEND (Express + WebSocket)                |
|  - Telemetry Ingestion API  (/api/telemetry)                      |
|  - Rule-Based Alert Engine + Cross-Node Correlation               |
|  - Real-Time WebSocket Broadcast                                  |
|    (TELEMETRY_UPDATE, VALVE_STATE_CHANGE, CONTAMINATION_SOURCE)   |
|  - Smart Valve Command API  (/api/valves/control)                 |
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

## ✨ Features

| Feature | Description |
|---|---|
| 🌐 **Multi-Zone Monitoring** | 4 independent zones: Kitchen RO, Roof Tank, Underground Sump, Bathroom Softener |
| 📡 **Real-Time Telemetry** | ESP32 → HTTP POST every 3 s → Express backend → WebSocket → Mobile app |
| 🚨 **Autonomous Emergency Response** | Flow spike (>10 L/min) triggers immediate solenoid shutoff |
| 🧠 **AI Water Quality Insights** | Purity Score (0–100%), SAFE/BORDERLINE/UNSAFE/HAZARDOUS classification, 7-day trend chart |
| 🔩 **RO Filter Health Manager** | 4-stage filter tracking with one-tap replacement ordering |
| 🚰 **Smart Valve Control** | Per-device manual & autonomous valve toggle, backend-synced to ESP32 relay |
| 💧 **Tank Level & Usage Analytics** | Level visualization, daily consumption tracking, weekly trends |
| 📊 **Historical Analytics** | Daily/Weekly/Monthly charts for pH, TDS, Turbidity, Temperature |
| 🔔 **Alert & Notification Engine** | Multi-severity (CRITICAL/WARNING/INFO), per-alert & batch resolve |
| 🎭 **Demo Mode** | 5 realistic scenarios with a 24-hour diurnal sensor cycle — no hardware needed |

---

## 🌟 Novel Capabilities

### 🔬 Novelty 1 — Predictive Filter Degradation Engine
Pure-TypeScript polynomial regression analyzes historical TDS, turbidity, and flow load to predict actual filter lifespan — not just a calendar countdown. Shows AI-predicted days ± confidence band alongside the calendar estimate.

**Key files:** `src/services/filterDegradationEngine.ts`, `src/components/home/FilterLifespanWidget.tsx`

### 🗣️ Novelty 2 — Multilingual Voice Alert System
`expo-speech` powered TTS announces CRITICAL and WARNING alerts in **English, Tamil, or Hindi** based on the user's language setting. CRITICAL alerts interrupt immediately; WARNING alerts are queued; INFO is silent.

**Key files:** `src/services/voiceAlertService.ts`, `src/context/VoiceAlertContext.tsx`

### 📍 Novelty 3 — Contamination Source Triangulation
Cross-node correlation engine on the backend models the household water graph and pinpoints the exact contamination source zone. An SVG topology diagram on the dashboard highlights the contaminated pipe segment with a confidence score.

**Key files:** `backend/services/alertEngine.js`, `src/components/dashboard/ContaminationMap.tsx`

---

## 🛠️ Tech Stack

### 📱 Mobile Application
| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 51) |
| Language | TypeScript |
| Navigation | React Navigation (Stack + Bottom Tabs) |
| State Management | React Context API + Custom Hooks |
| Animations | React Native Reanimated + Animated API |
| Graphics | React Native SVG, Expo Linear Gradient |
| Real-Time | MQTT Simulator + WebSocket (`apiClient`) |
| Voice | expo-speech (multilingual TTS) |

### 🖥️ Backend Server
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Real-Time | WebSocket (`ws`) |
| Data Store | In-Memory (runtime-persistent) |
| Rules Engine | Custom Alert Engine + Cross-Node Correlation |

### ⚙️ Firmware (IoT)
| Layer | Technology |
|---|---|
| Microcontroller | ESP32 DevKit V1 |
| Language | Arduino C++ |
| Libraries | WiFi, HTTPClient, ArduinoJson, DallasTemperature |
| Protocol | HTTP REST over Wi-Fi (3-second intervals) |
| Sensors | pH, TDS (ADC), Turbidity (ADC), DS18B20 Temperature, Flow (Hall-Effect), Ultrasonic Level |
| Actuator | Solenoid Shutoff Valve (relay-controlled) |

---

## 📐 Project Structure

```
AquaGuard/
├── docs/
│   └── PROJECT_DESCRIPTION.md
├── firmware/
│   └── esp32_aquaguard/
│       └── esp32_aquaguard.ino        # ESP32 sensor node firmware
├── backend/
│   ├── server.js                      # Express + WebSocket server entry
│   ├── routes/
│   │   └── telemetryRoutes.js         # Telemetry & contamination endpoints
│   └── services/
│       └── alertEngine.js             # Rule engine + cross-node correlation
└── src/
    ├── components/
    │   ├── common/                    # Shared UI primitives
    │   └── dashboard/
    │       ├── SensorCard.tsx
    │       └── ContaminationMap.tsx   # SVG topology diagram
    ├── constants/
    │   ├── mockData.ts
    │   ├── demoMockData.ts            # 5 demo scenarios
    │   └── thresholds.ts
    ├── context/
    │   ├── AuthContext.tsx
    │   ├── ThemeContext.tsx
    │   ├── WaterDataContext.tsx
    │   ├── NotificationContext.tsx
    │   └── VoiceAlertContext.tsx      # TTS context
    ├── screens/
    │   ├── dashboard/                 # Main dashboard + contamination map
    │   ├── ai/                        # AI water quality insights
    │   ├── alerts/                    # Alert centre
    │   ├── analytics/                 # Historical charts
    │   ├── devices/                   # Device & valve management
    │   ├── nodes/                     # Per-node sensor details
    │   ├── profile/
    │   └── settings/                  # Voice, demo mode, theme
    ├── services/
    │   ├── apiClient.ts               # WebSocket + REST client
    │   ├── mqttSimulator.ts           # Scenario switching
    │   ├── filterDegradationEngine.ts # ML filter prediction
    │   ├── voiceAlertService.ts       # TTS service
    │   └── demoDataService.ts         # Demo mode service
    ├── theme/                         # Design tokens & typography
    ├── types/index.ts                 # Shared TypeScript types
    └── utils/                         # Formatters & helpers
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18
- **npm** >= 9
- **Expo CLI** (`npm install -g expo-cli`) — for physical device testing
- **Arduino IDE** — for firmware flashing
- **ESP32 board support** installed in Arduino IDE

---

### 1 · Backend Server

```bash
cd AquaGuard/backend
npm install
node server.js
# Server starts on http://localhost:5000
```

The backend exposes:
- `POST /api/telemetry` — sensor data ingestion
- `GET  /api/telemetry/latest` — latest readings per device
- `POST /api/valves/control` — remote valve toggle
- WebSocket on `ws://localhost:5000` — real-time broadcast

---

### 2 · Mobile App

```bash
cd AquaGuard
npm install

# Web browser (recommended for quick preview)
npx expo start --web

# Android device / emulator
npx expo start --android

# iOS device / simulator (macOS only)
npx expo start --ios
```

> **Demo Mode** — Launch the app with the backend offline and it automatically enters Demo Mode. Switch between 5 scenarios via **Settings → Demo Mode**.

The web build renders a responsive layout with a **📱 Mobile Preview** / **💻 Web Desktop** toggle in the top bar.

---

### 3 · ESP32 Firmware

1. Open `firmware/esp32_aquaguard/esp32_aquaguard.ino` in **Arduino IDE**.
2. Install the required libraries via Library Manager:
   - `ArduinoJson` by Benoit Blanchon
   - `DallasTemperature` by Miles Burton
   - `OneWire` by Paul Stoffregen
3. Edit the configuration block at the top of the sketch:

```cpp
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* BACKEND_ENDPOINT = "http://<your-pc-local-ip>:5000/api/telemetry";
const char* DEVICE_ID   = "DEV-RO-01";           // Unique per node
const char* DEVICE_NAME = "Kitchen RO Purifier";
```

4. Select board **ESP32 Dev Module**, correct COM port, and click **Upload**.

#### Pin Mapping

| Pin | GPIO | Sensor / Actuator |
|---|---|---|
| TDS_PIN | 35 | TDS sensor (ADC) |
| TURBIDITY_PIN | 34 | Turbidity sensor (ADC) |
| ONE_WIRE_BUS | 4 | DS18B20 temperature |
| LED_PIN | 26 | Solenoid relay / status LED |

---

## 🎭 Demo Mode Scenarios

| Scenario | Description |
|---|---|
| Normal Day | Baseline readings — all zones safe |
| High TDS Event | Elevated dissolved solids in sump zone |
| Pipe Leak Emergency | Flow spike triggers autonomous shutoff |
| pH Drop | Acidic water event in RO purifier |
| Post-Rain Turbidity | Turbidity spike from runoff contamination |

Activate from **Settings → Demo Mode** — no hardware required.

---

## 🔌 API Reference

### `POST /api/telemetry`
Ingest a sensor reading from an ESP32 node.

```json
{
  "deviceId":    "DEV-RO-01",
  "deviceName":  "Kitchen RO Purifier",
  "zone":        "Kitchen RO Purifier",
  "pH":          7.2,
  "tds":         145,
  "turbidity":   0.5,
  "temperature": 28.3,
  "flowRate":    1.5
}
```

**Response** — includes a `valveState` field the firmware reads to execute emergency shutoff:
```json
{
  "success": true,
  "valveState": "OPEN",
  "alerts": []
}
```

### `POST /api/valves/control`
```json
{ "deviceId": "DEV-RO-01", "state": "CLOSED" }
```

### WebSocket Events
| Event | Direction | Payload |
|---|---|---|
| `TELEMETRY_UPDATE` | Server → Client | Latest sensor data for all devices |
| `VALVE_STATE_CHANGE` | Server → Client | `{ deviceId, state }` |
| `CONTAMINATION_SOURCE` | Server → Client | `{ zone, confidence, affectedNodes }` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — Open source for community and educational use.

---

*Built with ESP32 · Node.js · React Native · TypeScript*
