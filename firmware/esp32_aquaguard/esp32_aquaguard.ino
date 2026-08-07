#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// =============================================================================
// 1. HARDWARE PIN DEFINITIONS
// =============================================================================
#define TDS_PIN         35
#define TURBIDITY_PIN   34
#define ONE_WIRE_BUS    4
#define LED_PIN         26

// =============================================================================
// 2. NETWORK & BACKEND CONFIGURATION
// =============================================================================
const char* WIFI_SSID     = "POTHIGAI HOSTEL";
const char* WIFI_PASSWORD = "Pothigai@$C%I$T";

// Replace with your computer's local IP address
const char* BACKEND_ENDPOINT = "http://172.16.6.192:5000/api/telemetry";

const char* DEVICE_ID   = "DEV-RO-01";
const char* DEVICE_NAME = "Kitchen RO Purifier";
const char* HOME_ZONE   = "Kitchen RO Purifier";

// OneWire & Dallas Temperature Setup
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

unsigned long lastTelemetryTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n🚀 Starting AquaGuard ESP32 Sensor Node...");

  sensors.begin();

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW); // LOW = Safe / Valve Open

  connectToWiFi();
}

void loop() {
  // Ensure Wi-Fi connection is maintained
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFi();
  }

  unsigned long currentMillis = millis();

  // Send Telemetry every 3 seconds (3000 ms)
  if (currentMillis - lastTelemetryTime >= 3000) {
    lastTelemetryTime = currentMillis;

    // 1. Read Temperature (DS18B20 Sensor)
    sensors.requestTemperatures();
    float temperature = sensors.getTempCByIndex(0);

    // 2. Read TDS
    int tdsADC = analogRead(TDS_PIN);
    float tdsVoltage = tdsADC * (3.3 / 4095.0);
    int tdsPpm = (int)(tdsADC * 0.5);

    // 3. Read Turbidity
    int turbADC = analogRead(TURBIDITY_PIN);
    float turbVoltage = turbADC * (3.3 / 4095.0);
    float turbidityNTU = (turbADC < 3000) ? 3.5 : 0.5;

    // 4. Mock pH Data (Simulate realistic fluctuation around 7.2)
    float mockPH = 7.2 + (random(-2, 3) / 10.0);

    // 5. Evaluate Local Safety Thresholds
    bool unsafe = false;
    if (temperature > 35.0 || tdsADC > 600 || turbADC < 3000 || mockPH < 6.5 || mockPH > 8.5) {
      unsafe = true;
    }

    // Control Solenoid / LED Valve (HIGH = Shutoff Valve Activated / Unsafe)
    digitalWrite(LED_PIN, unsafe ? HIGH : LOW);

    // Print to Serial Monitor
    Serial.println("\n--------------------------------");
    Serial.printf("Temp: %.1f C | TDS ADC: %d (%.3fV) | Turbidity ADC: %d (%.3fV) | pH (Mock): %.2f\n",
                  temperature, tdsADC, tdsVoltage, turbADC, turbVoltage, mockPH);
    Serial.println(unsafe ? "LOCAL STATUS : UNSAFE WATER (Valve CLOSED / LED ON)" : "LOCAL STATUS : SAFE WATER (Valve OPEN / LED OFF)");

    // 6. Send telemetry payload to backend
    sendTelemetryToBackend(mockPH, tdsPpm, turbidityNTU, temperature, 1.5);
  }
}

// =============================================================================
// NETWORK TELEMETRY TRANSMISSION
// =============================================================================
void sendTelemetryToBackend(float pH, int tds, float turbidity, float temp, float flowRate) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(BACKEND_ENDPOINT);
  http.addHeader("Content-Type", "application/json");

  // Create JSON Document
  StaticJsonDocument<256> doc;
  doc["deviceId"]    = DEVICE_ID;
  doc["deviceName"]  = DEVICE_NAME;
  doc["zone"]        = HOME_ZONE;
  doc["pH"]          = pH;
  doc["tds"]         = tds;
  doc["turbidity"]   = turbidity;
  doc["temperature"] = temp;
  doc["flowRate"]    = flowRate;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  int httpCode = http.POST(jsonPayload);

  if (httpCode > 0) {
    String response = http.getString();
    Serial.printf("✅ Server Response (%d): %s\n", httpCode, response.c_str());

    // Check if Backend commanded Valve Shutoff
    if (response.indexOf("\"valveState\":\"CLOSED\"") > 0) {
      Serial.println("🚨 EMERGENCY SHUTOFF COMMAND RECEIVED FROM SERVER! Closing Relay Valve...");
      digitalWrite(LED_PIN, HIGH);
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

