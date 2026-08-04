# ⚡ AquaGuard ESP32 Sensor Hardware Setup & Wiring Guide

This guide explains how to connect your physical water quality sensors to an **ESP32 DevKit v1** microcontroller and configure it to transmit live telemetry to your **AquaGuard Backend Server**.

---

## 🛠️ Hardware Bill of Materials (BOM)

| Component | Quantity | Description / Model |
| :--- | :---: | :--- |
| **Microcontroller** | 1 | ESP32-WROOM-32 DevKit v1 |
| **pH Sensor Module** | 1 | Analog pH Sensor Kit (SEN0161 / E-201-C) |
| **TDS Sensor Module** | 1 | Gravity Analog TDS Sensor (DFRobot / Keyestudio) |
| **Turbidity Sensor** | 1 | Analog Turbidity Sensor Module (TS-300B) |
| **Water Flow Meter** | 1 | YF-S201 Hall Effect Water Flow Sensor (1/2") |
| **Ultrasonic Level Sensor**| 1 | HC-SR04 / JSN-SR04T Waterproof Level Sensor |
| **Solenoid Shutoff Valve** | 1 | 12V NC Solenoid Water Valve + 5V Relay Module |
| **Power Supply** | 1 | 5V 2A Power Adapter for ESP32 & 12V 2A for Valve Relay |

---

## 🔌 ESP32 Pin Mapping & Wiring Diagram

```
       +---------------------------------------------+
       |             ESP32 DevKit v1                 |
       |                                             |
       |  GPIO 34 (ADC1_CH6)  <--- Analog pH Signal  |
       |  GPIO 35 (ADC1_CH7)  <--- Analog TDS Signal |
       |  GPIO 32 (ADC1_CH4)  <--- Turbidity Signal  |
       |  GPIO 27 (Touch7)    <--- Flow Pulse (YF-S201)|
       |  GPIO 5  (VSPI_CS)   ---> Trig (HC-SR04)    |
       |  GPIO 18 (VSPI_CLK)  <--- Echo (HC-SR04)    |
       |  GPIO 26 (DAC2)      ---> Relay Signal (Valve)|
       |                                             |
       |  3V3                 ---> Sensor VCC (3.3V) |
       |  5V (VIN)            ---> Relay & Sensor VCC |
       |  GND                 ---> Common Ground     |
       +---------------------------------------------+
```

---

## 🚀 Flashing Instructions (Arduino IDE)

1. **Install ESP32 Board Support:**
   - Open Arduino IDE -> `Preferences`.
   - Add Board Manager URL: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`.
   - Open `Tools -> Board -> Boards Manager`, search for `esp32` and click **Install**.

2. **Install Required Arduino Libraries:**
   - Open `Tools -> Manage Libraries`.
   - Install **`ArduinoJson`** (by Benoit Blanchon, v6.x or newer).

3. **Configure Network & Server Address:**
   - Open `esp32_aquaguard.ino`.
   - Update lines 24–28 with your Wi-Fi SSID, Password, and your backend server's IP address:
     ```cpp
     const char* WIFI_SSID     = "YOUR_HOME_WIFI";
     const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
     const char* BACKEND_ENDPOINT = "http://192.168.1.100:5000/api/telemetry";
     ```

4. **Upload to ESP32:**
   - Connect ESP32 via USB cable.
   - Select Board: `DOIT ESP32 DEVKIT V1` and Port.
   - Click **Upload** (press & hold `BOOT` button on ESP32 if upload stays on `Connecting...`).

5. **Verify Live Output:**
   - Open `Tools -> Serial Monitor` at **115200 baud rate**.
   - You should see Wi-Fi connection logs and HTTP POST confirmations every 3 seconds!

---

## 🔒 Automated Emergency Safety Trigger
If the backend detects an abnormal flow spike (e.g. `flowRate > 10.0 L/min` indicating a burst pipe) or hazardous pH level, the response payload will contain `"valveState":"CLOSED"`. The ESP32 will automatically trigger **GPIO 26 HIGH** to shut the solenoid valve instantly!
