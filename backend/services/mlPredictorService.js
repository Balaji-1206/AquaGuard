/**
 * AquaGuard Node.js ML Predictor Service
 * =====================================
 * Executes Python script (predict.py) via child_process.execFile
 * to predict Early Warning Score (EWS) and Anomaly status using trained joblib .pkl models.
 */

const { execFile } = require('child_process');
const path = require('path');

const PREDICT_SCRIPT = path.join(__dirname, '..', 'predict.py');

/**
 * Calls python predict.py <model_name> <pH> <TDS> <Turbidity> <FlowRate> <Temp>
 * Returns Promise<{ success: boolean, model: string, prediction: string, telemetry: object }>
 */
function runMlPrediction(modelName, telemetry) {
  return new Promise((resolve, reject) => {
    const { pH = 7.2, tds = 100, turbidity = 0.4, flowRate = 1.5, temperature = 24 } = telemetry;
    
    // Command line args for python predict.py
    const args = [
      PREDICT_SCRIPT,
      modelName.toLowerCase(),
      String(pH),
      String(tds),
      String(turbidity),
      String(flowRate),
      String(temperature),
    ];

    execFile('python', args, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error && !stdout) {
        return reject({
          success: false,
          error: stderr || error.message,
        });
      }

      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (parseError) {
        reject({
          success: false,
          error: `Failed to parse Python ML output: ${stdout || stderr}`,
        });
      }
    });
  });
}

/**
 * Predict Early Warning Score ("Normal", "Warning", or "Critical")
 */
async function predictEWS(telemetry) {
  return runMlPrediction('ews', telemetry);
}

/**
 * Predict Anomaly Detection ("Normal" or "Abnormal")
 */
async function predictAnomaly(telemetry) {
  return runMlPrediction('anomaly', telemetry);
}

module.exports = {
  runMlPrediction,
  predictEWS,
  predictAnomaly,
};
