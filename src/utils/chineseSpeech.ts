interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export const speakChinese = (text: string, options: SpeakOptions = {}) => {
  const {
    rate = 1,
    pitch = 1,
    onStart,
    onEnd,
    onError
  } = options;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set Chinese voice
  const voices = window.speechSynthesis.getVoices();
  const chineseVoice = voices.find(voice => 
    voice.lang.includes('zh') || // Matches zh-CN, zh-HK, zh-TW
    voice.lang.includes('cmn') || // Matches cmn-Hans-CN
    voice.name.toLowerCase().includes('chinese')
  );

  if (chineseVoice) {
    utterance.voice = chineseVoice;
  } else {
    // Fallback to basic Chinese language setting
    utterance.lang = 'zh-CN';
  }

  // Set speech parameters
  utterance.rate = rate;
  utterance.pitch = pitch;

  // Add event listeners
  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  // Speak the text
  window.speechSynthesis.speak(utterance);

  return {
    stop: () => window.speechSynthesis.cancel(),
    pause: () => window.speechSynthesis.pause(),
    resume: () => window.speechSynthesis.resume(),
    speaking: () => window.speechSynthesis.speaking,
  };
};

// Initialize voices as soon as possible
if (typeof window !== 'undefined') {
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}
