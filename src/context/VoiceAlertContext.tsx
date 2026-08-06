import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { HomeAlert } from '../types';
import {
  speakAlert,
  speakCustomMessage,
  speakAllClear,
  stopSpeaking,
  AppLanguage,
} from '../services/voiceAlertService';
import { useNotifications } from './NotificationContext';

interface VoiceAlertContextType {
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  triggerVoiceAlert: (alert: HomeAlert) => void;
  speakTestMessage: () => void;
  speakCustomText: (text: string) => void;
  speakAllClearMessage: () => void;
  stopVoice: () => void;
}

const VoiceAlertContext = createContext<VoiceAlertContextType | undefined>(undefined);

export const VoiceAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [voiceEnabled, setVoiceEnabledState] = useState<boolean>(true);
  const [language, setLanguageState] = useState<AppLanguage>('English');

  // Access the notification context to register the voice callback
  const { setVoiceTriggerCallback } = useNotifications();

  // Keep track of already-spoken alert IDs so we don't repeat on re-render
  const spokenAlertIds = useRef<Set<string>>(new Set());

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    setVoiceEnabledState(enabled);
    if (!enabled) stopSpeaking();
  }, []);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
  }, []);

  const triggerVoiceAlert = useCallback(
    (alert: HomeAlert) => {
      if (!voiceEnabled) return;
      if (alert.isResolved) return;
      if (spokenAlertIds.current.has(alert.id)) return;

      spokenAlertIds.current.add(alert.id);
      speakAlert(alert, language);
    },
    [voiceEnabled, language]
  );

  // Register the trigger callback with the NotificationContext
  useEffect(() => {
    setVoiceTriggerCallback(voiceEnabled ? triggerVoiceAlert : null);
    return () => setVoiceTriggerCallback(null);
  }, [voiceEnabled, triggerVoiceAlert, setVoiceTriggerCallback]);

  const speakTestMessage = useCallback(() => {
    const testMessages: Record<AppLanguage, string> = {
      English: 'AquaGuard voice alerts are active. Your water quality is being monitored.',
      Tamil:   'AquaGuard குரல் எச்சரிக்கைகள் செயலில் உள்ளன. உங்கள் நீர் தரம் கண்காணிக்கப்படுகிறது.',
      Hindi:   'AquaGuard वॉयस अलर्ट सक्रिय हैं। आपके जल की गुणवत्ता की निगरानी हो रही है।',
    };
    speakCustomMessage(testMessages[language], language);
  }, [language]);

  const speakCustomText = useCallback((text: string) => {
    if (!voiceEnabled) return;
    speakCustomMessage(text, language);
  }, [voiceEnabled, language]);

  const speakAllClearMessage = useCallback(() => {
    if (!voiceEnabled) return;
    speakAllClear(language);
  }, [voiceEnabled, language]);

  const stopVoice = useCallback(() => {
    stopSpeaking();
  }, []);

  return (
    <VoiceAlertContext.Provider
      value={{
        voiceEnabled,
        setVoiceEnabled,
        language,
        setLanguage,
        triggerVoiceAlert,
        speakTestMessage,
        speakCustomText,
        speakAllClearMessage,
        stopVoice,
      }}
    >
      {children}
    </VoiceAlertContext.Provider>
  );
};

export const useVoiceAlerts = () => {
  const context = useContext(VoiceAlertContext);
  if (!context) {
    throw new Error('useVoiceAlerts must be used within a VoiceAlertProvider');
  }
  return context;
};
