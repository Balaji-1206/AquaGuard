/**
 * AquaGuard Voice Alert Service
 * ==============================
 * Novelty 2: Multilingual Text-to-Speech announcements for water safety alerts.
 * Uses expo-speech — available in Expo SDK 51, zero additional install required.
 *
 * Alert Priority:
 *   CRITICAL → speaks immediately, interrupts any current speech
 *   WARNING  → queued after current speech
 *   INFO     → silent (no TTS)
 */

import * as Speech from 'expo-speech';
import { HomeAlert, Severity } from '../types';

export type AppLanguage = 'English' | 'Tamil' | 'Hindi';

// ─── Language-to-BCP47 Locale Map ────────────────────────────────────────────
const LOCALE_MAP: Record<AppLanguage, string> = {
  English: 'en-IN',
  Tamil:   'ta-IN',
  Hindi:   'hi-IN',
};

// ─── Alert Message Templates ──────────────────────────────────────────────────

interface AlertTemplates {
  pipeLeakCritical:    string;
  phCritical:          string;
  tdsCritical:         string;
  turbidityWarning:    string;
  uvLampWarning:       string;
  deviceOffline:       string;
  contaminationSource: string;
  genericCritical:     (title: string) => string;
  genericWarning:      (title: string) => string;
  allClear:            string;
}

const ALERT_MESSAGES: Record<AppLanguage, AlertTemplates> = {
  English: {
    pipeLeakCritical:
      'Emergency! High pressure pipe leak detected. Main water valve has been automatically closed. Please contact a plumber immediately.',
    phCritical:
      'Critical water safety alert! pH level has dropped below safe drinking limits. Do not drink or cook with current water supply.',
    tdsCritical:
      'Warning. Dissolved solids in your drinking water have exceeded safe limits. RO filter inspection is recommended.',
    turbidityWarning:
      'Caution. Water cloudiness is elevated. Post-rain sediment detected. Allow thirty minutes for settling.',
    uvLampWarning:
      'Your UV sterilization lamp is reaching end of life. Please order a replacement to maintain water safety.',
    deviceOffline:
      'A water sensor has gone offline. Please check your Wi-Fi connection and device battery.',
    contaminationSource:
      'Contamination source identified. AquaGuard has isolated the affected pipe zone. Check the dashboard for details.',
    genericCritical:  (t) => `Critical water alert: ${t}. Please check the AquaGuard app immediately.`,
    genericWarning:   (t) => `Water safety warning: ${t}. Review the alert in your AquaGuard app.`,
    allClear:
      'All home water sensors are operating within safe thresholds. Your water is clean and safe.',
  },

  Tamil: {
    pipeLeakCritical:
      'அவசரநிலை! அதிக அழுத்த குழாய் கசிவு கண்டறியப்பட்டது. முக்கிய நீர் வால்வு தானாகவே மூடப்பட்டது. உடனடியாக பிளம்பரை தொடர்பு கொள்ளுங்கள்.',
    phCritical:
      'முக்கியமான நீர் பாதுகாப்பு எச்சரிக்கை! pH அளவு குடிநீர் வரம்பிற்கு கீழே சென்றுள்ளது. தற்போதைய நீரை குடிக்கவோ சமைக்கவோ பயன்படுத்தாதீர்கள்.',
    tdsCritical:
      'எச்சரிக்கை. குடிநீரில் கரைந்த திடப்பொருட்கள் அதிகமாக உள்ளன. RO வடிகட்டி சரிபார்க்கப்பட வேண்டும்.',
    turbidityWarning:
      'கவனிக்கவும். நீரின் கலக்கம் அதிகரித்துள்ளது. மழையின் பின் வண்டல் கண்டறியப்பட்டது. முப்பது நிமிடங்கள் காத்திருங்கள்.',
    uvLampWarning:
      'UV கிருமிநாசினி விளக்கின் ஆயுள் முடியும் தருவாயில் உள்ளது. நீர் பாதுகாப்பை பேண மாற்று விளக்கை ஆர்டர் செய்யவும்.',
    deviceOffline:
      'ஒரு நீர் சென்சார் ஆஃப்லைனில் உள்ளது. Wi-Fi இணைப்பு மற்றும் சாதன பேட்டரியை சரிபார்க்கவும்.',
    contaminationSource:
      'மாசு ஆதாரம் கண்டறியப்பட்டது. AquaGuard பாதிக்கப்பட்ட குழாய் பகுதியை தனிமைப்படுத்தியுள்ளது.',
    genericCritical:  (t) => `முக்கியமான நீர் எச்சரிக்கை: ${t}. உடனடியாக ஆப்பை சரிபார்க்கவும்.`,
    genericWarning:   (t) => `நீர் பாதுகாப்பு எச்சரிக்கை: ${t}.`,
    allClear:
      'அனைத்து வீட்டு நீர் சென்சார்களும் பாதுகாப்பான வரம்பில் இயங்குகின்றன. உங்கள் நீர் சுத்தமாகவும் பாதுகாப்பாகவும் உள்ளது.',
  },

  Hindi: {
    pipeLeakCritical:
      'आपातकाल! उच्च दबाव पाइप रिसाव का पता चला। मुख्य जल वाल्व स्वतः बंद हो गया है। कृपया तुरंत प्लम्बर से संपर्क करें।',
    phCritical:
      'महत्वपूर्ण जल सुरक्षा चेतावनी! pH स्तर सुरक्षित पेयजल सीमा से नीचे गिर गया है। वर्तमान जल पीने या खाना पकाने के लिए उपयोग न करें।',
    tdsCritical:
      'चेतावनी। पेयजल में घुले ठोस पदार्थ सुरक्षित सीमा से अधिक हो गए हैं। RO फिल्टर जांच की सिफारिश की जाती है।',
    turbidityWarning:
      'सावधान। पानी की गंदगी बढ़ गई है। बारिश के बाद तलछट का पता चला। तीस मिनट प्रतीक्षा करें।',
    uvLampWarning:
      'UV स्टेरिलाइजेशन लैंप की उम्र समाप्त होने वाली है। जल सुरक्षा बनाए रखने के लिए प्रतिस्थापन मंगवाएं।',
    deviceOffline:
      'एक जल सेंसर ऑफलाइन हो गया है। कृपया Wi-Fi कनेक्शन और बैटरी जांचें।',
    contaminationSource:
      'संदूषण स्रोत पहचाना गया। AquaGuard ने प्रभावित पाइप क्षेत्र को अलग कर दिया है।',
    genericCritical:  (t) => `महत्वपूर्ण जल चेतावनी: ${t}. कृपया तुरंत ऐप जांचें।`,
    genericWarning:   (t) => `जल सुरक्षा चेतावनी: ${t}.`,
    allClear:
      'सभी घरेलू जल सेंसर सुरक्षित सीमा में काम कर रहे हैं। आपका पानी स्वच्छ और सुरक्षित है।',
  },
};

// ─── Queue ────────────────────────────────────────────────────────────────────
let isSpeaking = false;
const speechQueue: Array<{ text: string; language: AppLanguage }> = [];

async function processQueue(): Promise<void> {
  if (isSpeaking || speechQueue.length === 0) return;
  const { text, language } = speechQueue.shift()!;
  isSpeaking = true;
  Speech.speak(text, {
    language: LOCALE_MAP[language],
    rate: 0.92,
    pitch: 1.0,
    onDone: () => { isSpeaking = false; processQueue(); },
    onError: () => { isSpeaking = false; processQueue(); },
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Determine the appropriate speech text for a given alert.
 */
function buildAlertText(alert: HomeAlert, language: AppLanguage): string | null {
  const t = ALERT_MESSAGES[language];
  const title = alert.title.toLowerCase();

  // CRITICAL first
  if (alert.severity === 'CRITICAL') {
    if (title.includes('leak') || title.includes('flow'))  return t.pipeLeakCritical;
    if (title.includes('ph'))                              return t.phCritical;
    if (title.includes('tds') || title.includes('solid'))  return t.tdsCritical;
    if (title.includes('contamination'))                   return t.contaminationSource;
    return t.genericCritical(alert.title);
  }

  // WARNING
  if (alert.severity === 'WARNING') {
    if (title.includes('turbidity') || title.includes('cloud')) return t.turbidityWarning;
    if (title.includes('uv') || title.includes('lamp'))         return t.uvLampWarning;
    if (title.includes('tds'))                                   return t.tdsCritical;
    if (title.includes('offline'))                               return t.deviceOffline;
    return t.genericWarning(alert.title);
  }

  // INFO — no voice
  return null;
}

/**
 * Speak a water alert in the user's chosen language.
 * CRITICAL alerts stop current speech and play immediately.
 * WARNING alerts are added to the queue.
 */
export function speakAlert(alert: HomeAlert, language: AppLanguage = 'English'): void {
  const text = buildAlertText(alert, language);
  if (!text) return; // INFO — silent

  if (alert.severity === 'CRITICAL') {
    // Interrupt immediately
    Speech.stop();
    speechQueue.unshift({ text, language });
    isSpeaking = false;
    processQueue();
  } else {
    // Queue WARNING
    speechQueue.push({ text, language });
    processQueue();
  }
}

/**
 * Speak an arbitrary custom message.
 */
export function speakCustomMessage(message: string, language: AppLanguage = 'English'): void {
  Speech.stop();
  speechQueue.unshift({ text: message, language });
  isSpeaking = false;
  processQueue();
}

/**
 * Speak the "all clear" message.
 */
export function speakAllClear(language: AppLanguage = 'English'): void {
  const text = ALERT_MESSAGES[language].allClear;
  speechQueue.push({ text, language });
  processQueue();
}

/**
 * Stop any current speech and clear the queue.
 */
export function stopSpeaking(): void {
  Speech.stop();
  speechQueue.length = 0;
  isSpeaking = false;
}

export function getIsSpeaking(): boolean {
  return isSpeaking;
}
