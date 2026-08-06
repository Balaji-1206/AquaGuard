/**
 * Type declarations for expo-speech
 * expo-speech is part of the Expo SDK 51 managed workflow and does not
 * require a separate npm install — it ships with the expo package.
 */

declare module 'expo-speech' {
  export interface SpeakOptions {
    language?: string;
    pitch?: number;
    rate?: number;
    onStart?: () => void;
    onDone?: () => void;
    onStopped?: () => void;
    onError?: (error: Error) => void;
    voice?: string;
    volume?: number;
  }

  /**
   * Speak the text aloud using the device's text-to-speech engine.
   */
  export function speak(text: string, options?: SpeakOptions): void;

  /**
   * Stop any currently speaking text.
   */
  export function stop(): void;

  /**
   * Pause the current speech (iOS only).
   */
  export function pause(): void;

  /**
   * Resume paused speech (iOS only).
   */
  export function resume(): void;

  /**
   * Returns whether text is currently being spoken.
   */
  export function isSpeakingAsync(): Promise<boolean>;

  /**
   * Returns a list of all available voices.
   */
  export function getAvailableVoicesAsync(): Promise<{ identifier: string; name: string; quality: number; language: string }[]>;

  /**
   * Maximum number of characters that can be spoken at once.
   */
  export const maxSpeechInputLength: number;
}
