"""
AquaGuard ML Model Trainer Script
Trains RandomForestClassifier for EWS and IsolationForest for Anomaly Detection,
saving the resulting .pkl files into backend/src/models/ using joblib.
"""

import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, IsolationForest

def generate_synthetic_water_data(n_samples=2000):
    np.random.seed(42)
    
    # 1. Normal Samples (75%)
    n_normal = int(n_samples * 0.75)
    pH_norm = np.random.normal(7.2, 0.4, n_normal)
    TDS_norm = np.random.normal(110, 25, n_normal)
    Turb_norm = np.random.normal(0.4, 0.2, n_normal)
    Flow_norm = np.random.normal(1.5, 0.8, n_normal)
    Temp_norm = np.random.normal(24, 3, n_normal)
    
    X_normal = np.column_stack([pH_norm, TDS_norm, Turb_norm, Flow_norm, Temp_norm])
    y_normal = np.array(['Normal'] * n_normal)
    
    # 2. Warning Samples (15%)
    n_warn = int(n_samples * 0.15)
    pH_warn = np.random.uniform(6.0, 8.8, n_warn)
    TDS_warn = np.random.uniform(175, 280, n_warn)
    Turb_warn = np.random.uniform(1.2, 2.2, n_warn)
    Flow_warn = np.random.uniform(4.5, 8.0, n_warn)
    Temp_warn = np.random.uniform(28, 38, n_warn)
    
    X_warn = np.column_stack([pH_warn, TDS_warn, Turb_warn, Flow_warn, Temp_warn])
    y_warn = np.array(['Warning'] * n_warn)
    
    # 3. Critical Samples (10%)
    n_crit = n_samples - n_normal - n_warn
    pH_crit = np.random.choice([np.random.uniform(4.0, 5.8), np.random.uniform(9.0, 11.5)], n_crit)
    TDS_crit = np.random.uniform(300, 600, n_crit)
    Turb_crit = np.random.uniform(2.5, 6.0, n_crit)
    Flow_crit = np.random.uniform(9.0, 18.0, n_crit)
    Temp_crit = np.random.uniform(38, 50, n_crit)
    
    X_crit = np.column_stack([pH_crit, TDS_crit, Turb_crit, Flow_crit, Temp_crit])
    y_crit = np.array(['Critical'] * n_crit)
    
    X = np.vstack([X_normal, X_warn, X_crit])
    y = np.hstack([y_normal, y_warn, y_crit])
    
    return X, y

def main():
    models_dir = Path(__file__).parent / 'src' / 'models'
    models_dir.mkdir(parents=True, exist_ok=True)
    
    print("Generating synthetic water quality dataset...")
    X, y = generate_synthetic_water_data(3000)
    
    # Train EWS Model (RandomForestClassifier)
    print("Training EWS RandomForestClassifier model...")
    ews_clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    ews_clf.fit(X, y)
    ews_path = models_dir / 'EWS_model.pkl'
    joblib.dump(ews_clf, ews_path)
    print(f"Saved EWS model to {ews_path}")
    
    # Train Anomaly Model (IsolationForest)
    print("Training Anomaly IsolationForest model...")
    anomaly_clf = IsolationForest(contamination=0.15, random_state=42)
    anomaly_clf.fit(X)
    anomaly_path = models_dir / 'Anomaly_model.pkl'
    joblib.dump(anomaly_clf, anomaly_path)
    print(f"Saved Anomaly model to {anomaly_path}")
    
    print("\nModel training complete! Both .pkl files saved successfully.")

if __name__ == '__main__':
    main()
