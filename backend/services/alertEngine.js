/**
 * Alert Engine for AquaGuard Backend
 * Evaluates real-time sensor telemetries against water purity & safety safety rules.
 */

function evaluateTelemetryRules(device, reading, existingAlerts) {
  const generatedAlerts = [];
  let emergencyShutoffTriggered = false;

  // Rule 1: High Pressure Leak / Excessive Flow Rate Spike
  if (reading.flowRate > 10.0) {
    emergencyShutoffTriggered = true;
    generatedAlerts.push({
      id: `alt_leak_${Date.now()}`,
      time: 'Just now',
      deviceName: device.name || 'Smart Valve',
      zone: device.zone || 'Underground Sump',
      severity: 'CRITICAL',
      title: 'High Pressure Flow Spike / Potential Pipe Leak',
      message: `Abnormal flow rate of ${reading.flowRate} L/min detected. Emergency main shutoff valve auto-closing.`,
      actionTaken: 'Emergency Solenoid Shutoff Signal Broadcasted',
      isResolved: false,
    });
  }

  // Rule 2: Unsafe TDS Levels (> 200 ppm in Drinking RO)
  if (reading.tds > 180 && device.zone === 'Kitchen RO Purifier') {
    generatedAlerts.push({
      id: `alt_tds_${Date.now()}`,
      time: 'Just now',
      deviceName: device.name || 'Kitchen RO Purifier',
      zone: 'Kitchen RO Purifier',
      severity: 'WARNING',
      title: 'TDS Elevated (Total Dissolved Solids)',
      message: `TDS level registered at ${reading.tds} ppm (ideal drinking range 50-150 ppm). Filter inspection recommended.`,
      actionTaken: 'Logged to Purity Timeline',
      isResolved: false,
    });
  }

  // Rule 3: High Turbidity / Cloudiness (> 1.5 NTU)
  if (reading.turbidity > 1.5) {
    generatedAlerts.push({
      id: `alt_turb_${Date.now()}`,
      time: 'Just now',
      deviceName: device.name || 'Water Supply Sensor',
      zone: device.zone || 'Bathroom Supply',
      severity: 'WARNING',
      title: 'High Turbidity Detected',
      message: `Turbidity level reached ${reading.turbidity} NTU. Sediment filtration bypass active.`,
      actionTaken: 'Auto-backwash process initiated',
      isResolved: false,
    });
  }

  // Rule 4: Critical pH Levels (< 6.5 or > 8.5)
  if (reading.pH < 6.5 || reading.pH > 8.5) {
    generatedAlerts.push({
      id: `alt_ph_${Date.now()}`,
      time: 'Just now',
      deviceName: device.name || 'Main Line Sensor',
      zone: device.zone || 'Kitchen RO Purifier',
      severity: 'CRITICAL',
      title: 'pH Level Out of Safe Drinking Range',
      message: `pH reading of ${reading.pH} is outside safe potable limits (6.5 - 8.5 pH).`,
      actionTaken: 'Potable Water Alert Triggered',
      isResolved: false,
    });
  }

  return {
    alerts: generatedAlerts,
    emergencyShutoffTriggered,
  };
}

module.exports = {
  evaluateTelemetryRules,
};
