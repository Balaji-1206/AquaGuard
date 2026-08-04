const express = require('express');
const { evaluateTelemetryRules } = require('../services/alertEngine');

function createTelemetryRouter(dataStore, broadcastWebSocket) {
  const router = express.Router();

  // POST /api/telemetry — ESP32 Sensor Ingestion Endpoint
  router.post('/telemetry', (req, res) => {
    const { deviceId, pH, tds, temperature, turbidity, flowRate, zone } = req.body;

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    // Find or initialize target device
    let device = dataStore.devices.find((d) => d.id === deviceId);
    if (!device) {
      device = {
        id: deviceId,
        name: req.body.deviceName || `Sensor Node (${deviceId})`,
        zone: zone || 'Kitchen RO Purifier',
        location: req.body.location || 'Main Supply Line',
        status: 'ONLINE',
        battery: 100,
        wifiSignal: -55,
        lastSeen: 'Just now',
        waterStatus: 'SAFE',
        valveState: 'OPEN',
        readings: {
          pH: parseFloat(pH) || 7.2,
          tds: parseInt(tds, 10) || 85,
          temperature: parseFloat(temperature) || 24.5,
          turbidity: parseFloat(turbidity) || 0.2,
          flowRate: parseFloat(flowRate) || 0.0,
          timestamp: new Date().toISOString(),
        },
      };
      dataStore.devices.push(device);
    } else {
      device.status = 'ONLINE';
      device.lastSeen = 'Just now';
      device.readings = {
        pH: parseFloat(pH) || device.readings.pH,
        tds: parseInt(tds, 10) || device.readings.tds,
        temperature: parseFloat(temperature) || device.readings.temperature,
        turbidity: parseFloat(turbidity) || device.readings.turbidity,
        flowRate: parseFloat(flowRate) || device.readings.flowRate,
        timestamp: new Date().toISOString(),
      };
    }

    // Run rules engine against new reading
    const ruleResult = evaluateTelemetryRules(device, device.readings, dataStore.alerts);
    if (ruleResult.alerts.length > 0) {
      dataStore.alerts.unshift(...ruleResult.alerts);
    }

    if (ruleResult.emergencyShutoffTriggered) {
      device.valveState = 'CLOSED';
    }

    // Broadcast live telemetry & alert update via WebSocket
    broadcastWebSocket({
      type: 'TELEMETRY_UPDATE',
      deviceId,
      reading: device.readings,
      deviceState: device,
      newAlerts: ruleResult.alerts,
    });

    return res.status(200).json({
      success: true,
      message: 'Telemetry received',
      valveState: device.valveState,
      alertsTriggered: ruleResult.alerts.length,
    });
  });

  // GET /api/devices — Fetch all connected smart devices
  router.get('/devices', (req, res) => {
    return res.json(dataStore.devices);
  });

  // POST /api/valves/control — Command smart valve (OPEN / CLOSED)
  router.post('/valves/control', (req, res) => {
    const { deviceId, targetState } = req.body;
    const device = dataStore.devices.find((d) => d.id === deviceId) || dataStore.devices[0];

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    device.valveState = targetState === 'CLOSED' ? 'CLOSED' : 'OPEN';

    broadcastWebSocket({
      type: 'VALVE_STATE_CHANGE',
      deviceId: device.id,
      valveState: device.valveState,
    });

    return res.json({
      success: true,
      device,
    });
  });

  // GET /api/alerts — Fetch all alerts
  router.get('/alerts', (req, res) => {
    return res.json(dataStore.alerts);
  });

  // POST /api/alerts/:id/resolve — Resolve single alert
  router.post('/alerts/:id/resolve', (req, res) => {
    const { id } = req.params;
    const alert = dataStore.alerts.find((a) => a.id === id);
    if (alert) {
      alert.isResolved = true;
      alert.actionTaken = 'Acknowledged & Resolved via Dashboard';
    }
    return res.json(dataStore.alerts);
  });

  // POST /api/alerts/resolve-all — Resolve all active alerts
  router.post('/alerts/resolve-all', (req, res) => {
    dataStore.alerts.forEach((a) => {
      if (!a.isResolved) {
        a.isResolved = true;
        a.actionTaken = 'Batch Resolved by User';
      }
    });
    return res.json(dataStore.alerts);
  });

  return router;
}

module.exports = {
  createTelemetryRouter,
};
