"""
AquaGuard Smart Home Water Intelligence — ML Model Predictor Service

This script loads the trained .pkl models and makes water safety & anomaly predictions.
Called by Node.js backend via child_process.

Usage:
    python predict.py <model_name> <pH> <TDS> <Turbidity> <FlowRate> <Temp>

Models:
    - ews: Early Warning Score classifier ("Normal", "Warning", or "Critical")
    - anomaly: Anomaly detection model ("Normal" or "Abnormal")
"""

import sys
import joblib  # Using joblib for model serialization
import json
import numpy as np
from pathlib import Path

def load_model(model_name):
    """Load a .pkl model from src/models directory using joblib"""
    base_dir = Path(__file__).parent
    model_path = base_dir / 'src' / 'models' / f'{model_name}_model.pkl'
    
    if not model_path.exists():
        # Fallback search path in models/
        model_path = base_dir / 'models' / f'{model_name}_model.pkl'
    
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    # Load scikit-learn model using joblib
    model = joblib.load(model_path)
    return model

def predict_ews(telemetry):
    """
    Predict Early Warning Score using RandomForestClassifier
    Returns: "Normal", "Warning", or "Critical"
    """
    try:
        model = load_model('EWS')
        
        # Prepare input features: [pH, TDS, Turbidity, FlowRate, Temp]
        X = np.array([[
            telemetry['pH'],
            telemetry['TDS'],
            telemetry['Turbidity'],
            telemetry['FlowRate'],
            telemetry['Temp']
        ]])
        
        # Get prediction label from trained classifier
        prediction = model.predict(X)[0]
        return str(prediction)
            
    except Exception as e:
        # Fallback to rule-based logic if model fails or file missing
        print(f"EWS Model Warning: {e}", file=sys.stderr)
        return fallback_ews(telemetry)

def predict_anomaly(telemetry):
    """
    Predict Anomaly Detection using IsolationForest
    Returns: "Normal" or "Abnormal"
    """
    try:
        model = load_model('Anomaly')
        
        # Prepare input features: [pH, TDS, Turbidity, FlowRate, Temp]
        X = np.array([[
            telemetry['pH'],
            telemetry['TDS'],
            telemetry['Turbidity'],
            telemetry['FlowRate'],
            telemetry['Temp']
        ]])
        
        # Get prediction (-1 = anomaly/outlier, 1 = normal/inlier)
        prediction = model.predict(X)[0]
        return 'Abnormal' if prediction == -1 else 'Normal'
            
    except Exception as e:
        # Fallback to rule-based logic if model fails or file missing
        print(f"Anomaly Model Warning: {e}", file=sys.stderr)
        return fallback_anomaly(telemetry)

def fallback_ews(telemetry):
    """Fallback rule-based EWS when model is unavailable"""
    pH = telemetry['pH']
    TDS = telemetry['TDS']
    Turbidity = telemetry['Turbidity']
    FlowRate = telemetry['FlowRate']
    Temp = telemetry['Temp']
    
    if FlowRate > 10.0 or pH < 5.5 or pH > 9.0 or TDS > 400 or Turbidity > 3.0:
        return 'Critical'
    if pH < 6.5 or pH > 8.5 or TDS > 180 or Turbidity > 1.5 or FlowRate > 5.0 or Temp > 40:
        return 'Warning'
    return 'Normal'

def fallback_anomaly(telemetry):
    """Fallback rule-based anomaly detection when model is unavailable"""
    pH = telemetry['pH']
    TDS = telemetry['TDS']
    Turbidity = telemetry['Turbidity']
    FlowRate = telemetry['FlowRate']
    Temp = telemetry['Temp']
    
    if FlowRate > 12.0 or pH < 5.0 or pH > 9.5 or TDS > 500 or Turbidity > 4.0 or Temp > 45:
        return 'Abnormal'
    if TDS > 250 and Turbidity > 2.0:
        return 'Abnormal'
    return 'Normal'

def main():
    if len(sys.argv) != 7:
        print(json.dumps({
            "error": "Invalid arguments",
            "usage": "python predict.py <model_name> <pH> <TDS> <Turbidity> <FlowRate> <Temp>"
        }))
        sys.exit(1)
    
    try:
        model_name = sys.argv[1].lower()
        telemetry = {
            'pH': float(sys.argv[2]),
            'TDS': float(sys.argv[3]),
            'Turbidity': float(sys.argv[4]),
            'FlowRate': float(sys.argv[5]),
            'Temp': float(sys.argv[6])
        }
        
        if model_name == 'ews':
            result = predict_ews(telemetry)
        elif model_name == 'anomaly':
            result = predict_anomaly(telemetry)
        else:
            raise ValueError(f"Unknown model: {model_name}")
        
        # Output result as formatted JSON to stdout
        print(json.dumps({
            "success": True,
            "model": model_name,
            "prediction": result,
            "telemetry": telemetry
        }))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
