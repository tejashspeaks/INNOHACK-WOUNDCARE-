// Multilingual Web Speech API utility for Hindi, Tamil, and English medical triage read-aloud

export function getLanguageLocale(lang: 'en' | 'hi' | 'ta'): string {
  switch (lang) {
    case 'hi':
      return 'hi-IN';
    case 'ta':
      return 'ta-IN';
    case 'en':
    default:
      return 'en-IN';
  }
}

export function getLanguageName(lang: 'en' | 'hi' | 'ta'): string {
  switch (lang) {
    case 'hi':
      return 'हिन्दी (Hindi)';
    case 'ta':
      return 'தமிழ் (Tamil)';
    case 'en':
    default:
      return 'English';
  }
}

export function speakText(
  text: string,
  lang: 'en' | 'hi' | 'ta',
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this environment');
      onEnd?.();
      return resolve();
    }

    // Cancel previous utterance
    window.speechSynthesis.cancel();

    if (!text || text.trim().length === 0) {
      onEnd?.();
      return resolve();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocale = getLanguageLocale(lang);
    utterance.lang = targetLocale;

    // Pick best matching voice if available in browser registry
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchedVoice = voices.find(v => 
          v.lang.toLowerCase() === targetLocale.toLowerCase() ||
          v.lang.toLowerCase().startsWith(lang)
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }
    } catch (e) {
      console.warn('Error reading voices:', e);
    }

    utterance.rate = 0.92; // Clear, measured delivery for rural healthcare triage
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      onEnd?.();
      resolve();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      onEnd?.();
      resolve();
    };

    // Ensure audio plays even if synthesis was paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
