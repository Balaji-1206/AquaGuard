const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { createTelemetryRouter } = require('./routes/telemetryRoutes');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Parsing
app.use(cors());
app.use(express.json());

// In-Memory Data Store (Persisted during server runtime)
const dataStore = {
  devices: [
    {
      id: 'DEV-RO-01',
      name: 'Kitchen RO Purifier',
      zone: 'Kitchen RO Purifier',
      location: 'Main Kitchen Counter',
      status: 'ONLINE',
      battery: 100,
      wifiSignal: -52,
      lastSeen: 'Just now',
      waterStatus: 'SAFE',
      valveState: 'OPEN',
      readings: {
        pH: 7.2,
        tds: 85,
        temperature: 24.5,
        turbidity: 0.2,
        flowRate: 1.8,
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: 'DEV-TANK-02',
      name: 'Overhead Roof Tank Sensor',
      zone: 'Overhead Roof Tank',
      location: 'Terrace Level 2 Tank',
      status: 'ONLINE',
      battery: 88,
      wifiSignal: -64,
      lastSeen: '2 mins ago',
      waterStatus: 'SAFE',
      valveState: 'OPEN',
      readings: {
        pH: 7.4,
        tds: 210,
        temperature: 27.8,
        turbidity: 1.1,
        flowRate: 0.0,
        timestamp: new Date().toISOString(),
      },
    },
    {
      id: 'DEV-VALVE-03',
      name: 'Smart Main Shutoff Valve',
      zone: 'Underground Sump',
      location: 'Sump Pump Inlet Valve',
      status: 'ONLINE',
      battery: 95,
      wifiSignal: -58,
      lastSeen: '1 min ago',
      waterStatus: 'SAFE',
      valveState: 'OPEN',
      readings: {
        pH: 7.3,
        tds: 220,
        temperature: 26.0,
        turbidity: 1.4,
        flowRate: 0.0,
        timestamp: new Date().toISOString(),
      },
    },
  ],
  alerts: [
    {
      id: 'alt_init_1',
      time: '10 mins ago',
      deviceName: 'Kitchen RO Purifier',
      zone: 'Kitchen RO Purifier',
      severity: 'WARNING',
      title: 'UV Lamp Lifespan Alert',
      message: 'UV Sterilization Lamp has reached 22% health (12 days remaining).',
      actionTaken: 'Auto-reorder reminder queued',
      isResolved: false,
    },
  ],
};

// WebSocket Broadcast Function
function broadcastWebSocket(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Register API Routes
app.use('/api', createTelemetryRouter(dataStore, broadcastWebSocket));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AquaGuard Sensor Backend',
    timestamp: new Date().toISOString(),
    connectedClients: wss.clients.size,
  });
});

// WebSocket Connection Lifecycle
wss.on('connection', (ws) => {
  console.log('⚡ Client connected to AquaGuard Real-time WebSocket Feed');
  
  // Send current state to newly connected client
  ws.send(
    JSON.stringify({
      type: 'INIT_STATE',
      devices: dataStore.devices,
      alerts: dataStore.alerts,
    })
  );

  ws.on('close', () => {
    console.log('🔌 Client disconnected from WebSocket Feed');
  });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`💧 AquaGuard Backend Server running on port ${PORT}`);
  console.log(`📡 ESP32 HTTP Ingestion: http://localhost:${PORT}/api/telemetry`);
  console.log(`⚡ WebSocket Stream: ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});
