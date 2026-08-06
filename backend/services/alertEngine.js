/**
 * Alert Engine for AquaGuard Backend
 * ====================================
 * Evaluates real-time sensor telemetry against water purity & safety rules.
 *
 * Includes:
 *  - Per-device rule evaluation (Novelty 1 thresholds)
 *  - Cross-node contamination source triangulation (Novelty 3)
 */

// ─── Per-Device Rule Engine ───────────────────────────────────────────────────

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

  // Rule 2: Unsafe TDS Levels (> 180 ppm in Drinking RO)
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

// ─── Novelty 3: Cross-Node Contamination Source Triangulation ─────────────────
//
// Models the home water supply graph:
//   Municipal Supply → Sump Pump → Roof Tank → Kitchen RO (drinking)
//                                             → Bathroom Supply
//
// By comparing readings across all nodes simultaneously, we can pinpoint
// which segment of the supply chain is the contamination source.

const HOME_WATER_GRAPH = {
  // Each zone's position in the supply chain (lower = closer to source)
  'Underground Sump':    1,
  'Overhead Roof Tank':  2,
  'Kitchen RO Purifier': 3,
  'Bathroom Supply':     3,
};

function runCrossNodeCorrelation(devices) {
  if (!devices || devices.length < 2) return null;

  const evidenceRules = [];
  let sourceZone = null;
  let affectedZones = [];
  let confidence = 0;

  // Index devices by zone for easy access
  const byZone = {};
  devices.forEach((d) => { byZone[d.zone] = d; });

  const sump    = byZone['Underground Sump'];
  const tank    = byZone['Overhead Roof Tank'];
  const ro      = byZone['Kitchen RO Purifier'];
  const bath    = byZone['Bathroom Supply'];

  // ── Decision Rule Set ──────────────────────────────────────────────────────

  // Rule A: Flow spike ONLY in Sump → burst in sump inlet pipe
  if (sump && sump.readings.flowRate > 10 &&
      (!ro   || ro.readings.flowRate < 5) &&
      (!bath || bath.readings.flowRate < 5)) {
    sourceZone = 'Underground Sump';
    affectedZones = ['Underground Sump'];
    confidence += 35;
    evidenceRules.push({
      rule: `Flow spike (${sump.readings.flowRate} L/min) isolated to Sump — RO/Bathroom normal`,
      nodeId: sump.id,
      metric: 'flowRate',
      observedValue: sump.readings.flowRate,
      threshold: 10,
    });
  }

  // Rule B: TDS spike in Sump AND Tank but NOT in RO → pre-RO supply contamination
  if (sump && tank && sump.readings.tds > 250 && tank.readings.tds > 250 &&
      ro && ro.readings.tds < 160) {
    sourceZone = 'Underground Sump';
    affectedZones = ['Underground Sump', 'Overhead Roof Tank'];
    confidence += 30;
    evidenceRules.push({
      rule: `TDS elevated in Sump (${sump.readings.tds} ppm) and Tank (${tank.readings.tds} ppm) but not RO (${ro && ro.readings.tds} ppm)`,
      nodeId: sump.id,
      metric: 'tds',
      observedValue: sump.readings.tds,
      threshold: 250,
    });
  }

  // Rule C: Turbidity spike across ALL zones → municipal supply issue
  const allHighTurbidity = devices.filter((d) => d.readings.turbidity > 1.5);
  if (allHighTurbidity.length >= 3) {
    sourceZone = 'Underground Sump'; // municipal entry point
    affectedZones = devices.map((d) => d.zone);
    confidence += 25;
    evidenceRules.push({
      rule: `Turbidity > 1.5 NTU across ${allHighTurbidity.length} zones — upstream municipal issue`,
      nodeId: sump ? sump.id : devices[0].id,
      metric: 'turbidity',
      observedValue: Math.max(...allHighTurbidity.map((d) => d.readings.turbidity)),
      threshold: 1.5,
    });
  }

  // Rule D: pH anomaly in RO only → RO post-carbon or UV failure
  if (ro && (ro.readings.pH < 6.5 || ro.readings.pH > 8.5) &&
      (!sump || (sump.readings.pH >= 6.5 && sump.readings.pH <= 8.5)) &&
      (!tank || (tank.readings.pH >= 6.5 && tank.readings.pH <= 8.5))) {
    sourceZone = 'Kitchen RO Purifier';
    affectedZones = ['Kitchen RO Purifier'];
    confidence += 40;
    evidenceRules.push({
      rule: `pH anomaly (${ro.readings.pH}) isolated to RO outlet — Sump and Tank pH normal`,
      nodeId: ro.id,
      metric: 'pH',
      observedValue: ro.readings.pH,
      threshold: 6.5,
    });
  }

  // Rule E: pH anomaly in BOTH Sump and RO → municipal or inlet supply issue
  if (sump && ro &&
      (sump.readings.pH < 6.5 || sump.readings.pH > 8.5) &&
      (ro.readings.pH < 6.5   || ro.readings.pH > 8.5)) {
    sourceZone = 'Underground Sump';
    affectedZones = ['Underground Sump', 'Kitchen RO Purifier', 'Bathroom Supply'];
    confidence += 35;
    evidenceRules.push({
      rule: `pH out of range in both Sump (${sump.readings.pH}) and RO (${ro.readings.pH}) — supply chain issue`,
      nodeId: sump.id,
      metric: 'pH',
      observedValue: sump.readings.pH,
      threshold: 6.5,
    });
  }

  // Rule F: High turbidity in Tank and Bathroom but NOT Sump → tank contamination
  if (tank && bath && tank.readings.turbidity > 2.0 && bath.readings.turbidity > 2.0 &&
      (!sump || sump.readings.turbidity < 1.2)) {
    sourceZone = 'Overhead Roof Tank';
    affectedZones = ['Overhead Roof Tank', 'Bathroom Supply'];
    confidence += 30;
    evidenceRules.push({
      rule: `High turbidity in Tank (${tank.readings.turbidity} NTU) and Bathroom (${bath.readings.turbidity} NTU) — Sump clean`,
      nodeId: tank ? tank.id : devices[0].id,
      metric: 'turbidity',
      observedValue: tank.readings.turbidity,
      threshold: 2.0,
    });
  }

  // No pattern matched
  if (!sourceZone || evidenceRules.length === 0) return null;

  // Cap confidence at 95%
  confidence = Math.min(95, confidence);

  return {
    id: `ctam_${Date.now()}`,
    timestamp: new Date().toISOString(),
    sourceZone,
    affectedZones: [...new Set(affectedZones)],
    confidence,
    evidenceRules,
    recommendedAction: getRecommendedAction(sourceZone, evidenceRules),
  };
}

function getRecommendedAction(sourceZone, evidenceRules) {
  if (sourceZone === 'Underground Sump') {
    const hasFlowSpike = evidenceRules.some((r) => r.metric === 'flowRate');
    if (hasFlowSpike) return 'Inspect sump inlet pipe for burst or loose joint. Keep main valve CLOSED until repaired.';
    return 'Check municipal supply quality and sump filtration system. Contact water authority if issue persists.';
  }
  if (sourceZone === 'Overhead Roof Tank') {
    return 'Clean and flush the overhead roof tank. Check for algae, sediment buildup, or a cracked inlet pipe.';
  }
  if (sourceZone === 'Kitchen RO Purifier') {
    return 'Replace RO post-carbon filter and UV lamp. Run flush cycle before resuming drinking water use.';
  }
  return 'Inspect identified zone and isolate supply using the valve control panel.';
}

module.exports = {
  evaluateTelemetryRules,
  runCrossNodeCorrelation,
};
