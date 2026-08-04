/*
  =============================================================================
  AquaGuard Smart Water Quality & Solenoid Valve Control - ESP32 Firmware
  =============================================================================
  Description:
    Reads analog & pulse sensors (pH, TDS, Turbidity, Flow Rate, Tank Level),
    smooths signal noise, and transmits real-time telemetry to your custom
    AquaGuard backend API via HTTPS REST / HTTP JSON payloads.
  =============================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// =============================================================================
// 1. HARDWARE PIN DEFINITIONS
// =============================================================================
#define PIN_PH_SENSOR        34  // Analog ADC pin for pH Sensor
#define PIN_TDS_SENSOR       35  // Analog ADC pin for TDS Sensor
#define PIN_TURBIDITY_SENSOR 32  // Analog ADC pin for Turbidity Sensor
#define PIN_FLOW_SENSOR      27  // Interrupt pin for Flow Hall Effect Sensor
#define PIN_TANK_TRIG        5   // Ultrasonic Level Sensor Trigger Pin
#define PIN_TANK_ECHO        18  // Ultrasonic Level Sensor Echo Pin
#define PIN_VALVE_RELAY      26  // Output Relay pin to Solenoid Shutoff Valve

// =============================================================================
// 2. NETWORK & BACKEND CONFIGURATION
// =============================================================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Replace with your server's local IP or domain (e.g. http://192.168.1.100:5000/api/telemetry)
const char* BACKEND_ENDPOINT = "http://192.168.1.100:5000/api/telemetry";

const char* DEVICE_ID   = "DEV-RO-01";
const char* DEVICE_NAME = "Kitchen RO Purifier";
const char* HOME_ZONE   = "Kitchen RO Purifier";

// =============================================================================
// 3. SENSOR CALIBRATION CONSTANTS
// =============================================================================
const float VREF = 3.3;             // ESP32 ADC Reference Voltage
const int   ADC_RESOLUTION = 4095;  // 12-bit ADC

volatile unsigned int flowPulseCount = 0;
float flowRateLMin = 0.0;
unsigned long lastMillis = 0;

// Interrupt Service Routine (ISR) for Flow Meter
void IRAM_ATTR flowPulseCounter() {
  flowPulseCount++;
}

// =============================================================================
// 4. SETUP
// =============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n🚀 Initializing AquaGuard ESP32 Sensor Node...");

  // Configure Pin Modes
  pinMode(PIN_PH_SENSOR, INPUT);
  pinMode(PIN_TDS_SENSOR, INPUT);
  pinMode(PIN_TURBIDITY_SENSOR, INPUT);
  pinMode(PIN_TANK_TRIG, OUTPUT);
  pinMode(PIN_TANK_ECHO, INPUT);
  pinMode(PIN_VALVE_RELAY, OUTPUT);
  pinMode(PIN_FLOW_SENSOR, INPUT_PULLUP);

  // Initial Valve State: OPEN (Relay LOW for normally open valve)
  digitalWrite(PIN_VALVE_RELAY, LOW);

  // Attach Interrupt for Flow Sensor
  attachInterrupt(digitalPinToInterrupt(PIN_FLOW_SENSOR), flowPulseCounter, FALLING);

  // Connect to Wi-Fi
  connectToWiFi();
}

// =============================================================================
// 5. MAIN LOOP
// =============================================================================
void loop() {
  // Ensure Wi-Fi connection is maintained
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  unsigned long currentMillis = millis();
  // Sample and transmit telemetry every 3 seconds (3000 ms)
  if (currentMillis - lastMillis >= 3000) {
    lastMillis = currentMillis;

    // Calculate Flow Rate in Liters per minute (Pulse factor: 7.5 pulses per second = 1 L/min)
    flowRateLMin = (flowPulseCount / 7.5);
    flowPulseCount = 0; // Reset pulse counter

    // Read and calibrate sensors
    float phVal = readPH();
    int tdsVal = readTDS();
    float turbidityVal = readTurbidity();
    float waterTempC = 25.0; // Default temp sensor reading

    Serial.printf("\n📊 [Telemetry] pH: %.2f | TDS: %d ppm | Turbidity: %.2f NTU | Flow: %.1f L/min\n",
                  phVal, tdsVal, turbidityVal, flowRateLMin);

    // Send Payload to Backend
    sendTelemetryToBackend(phVal, tdsVal, turbidityVal, flowRateLMin, waterTempC);
  }
}

// =============================================================================
// 6. SENSOR READOUT & CALIBRATION FUNCTIONS
// =============================================================================
float readPH() {
  int rawADC = analogRead(PIN_PH_SENSOR);
  float voltage = (rawADC * VREF) / ADC_RESOLUTION;
  // Standard pH linear conversion formula: pH = 3.5 * voltage + pH_offset
  float phValue = 3.5 * voltage + 0.5;
  return constrain(phValue, 0.0, 14.0);
}

int readTDS() {
  int rawADC = analogRead(PIN_TDS_SENSOR);
  float voltage = (rawADC * VREF) / ADC_RESOLUTION;
  // TDS Conversion Formula (ppm) based on voltage calibration curve
  float tdsValue = (133.42 * voltage * voltage * voltage - 255.86 * voltage * voltage + 857.39 * voltage) * 0.5;
  return max(0, (int)tdsValue);
}

float readTurbidity() {
  int rawADC = analogRead(PIN_TURBIDITY_SENSOR);
  float voltage = (rawADC * VREF) / ADC_RESOLUTION;
  // Turbidity Formula: NTU = -1120.4 * (voltage^2) + 5742.3 * voltage - 4353.8
  float ntu = -1120.4 * voltage * voltage + 5742.3 * voltage - 4353.8;
  return max(0.0f, min(5.0f, ntu));
}

// =============================================================================
// 7. NETWORK TELEMETRY TRANSMISSION
// =============================================================================
void sendTelemetryToBackend(float pH, int tds, float turbidity, float flowRate, float temp) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(BACKEND_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  // Create JSON Document
  StaticJsonDocument<256> doc;
  doc["deviceId"]   = DEVICE_ID;
  doc["deviceName"] = DEVICE_NAME;
  doc["zone"]       = HOME_ZONE;
  doc["pH"]         = pH;
  doc["tds"]        = tds;
  doc["turbidity"]  = turbidity;
  doc["flowRate"]   = flowRate;
  doc["temperature"]= temp;

  String jsonString;
  serializeJson(doc, jsonString);

  int httpCode = http.POST(jsonString);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("✅ Server Response (%d): %s\n", httpCode, response.c_str());

    // Check if Backend commanded Valve Shutoff
    if (response.indexOf("\"valveState\":\"CLOSED\"") > 0) {
      Serial.println("🚨 EMERGENCY SHUTOFF COMMAND RECEIVED! Closing Relay Valve...");
      digitalWrite(PIN_VALVE_RELAY, HIGH); // Trigger Relay to close solenoid valve
    } else {
      digitalWrite(PIN_VALVE_RELAY, LOW);  // Valve Open
    }
  } else {
    Serial.printf("❌ HTTP POST Failed, Error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void connectToWiFi() {
  Serial.printf("📶 Connecting to Wi-Fi SSID: %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n🌐 Wi-Fi Connected! Local IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n⚠️ Wi-Fi Connection Timeout. Retrying...");
  }
}
