// Using the Web Speech API for cross-platform compatibility
export class TextToSpeech {
  private static instance: TextToSpeech;
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private chineseVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded: boolean = false;

  private constructor() {
    if (typeof window === 'undefined') return;
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }

  public static getInstance(): TextToSpeech {
    if (!TextToSpeech.instance) {
      TextToSpeech.instance = new TextToSpeech();
    }
    return TextToSpeech.instance;
  }

  private loadVoices(): void {
    if (typeof window === 'undefined') return;
    
    const loadVoicesHandler = () => {
      this.voices = this.synthesis.getVoices();
      this.chineseVoice = this.voices.find(
        voice => voice.lang.includes('zh-') || voice.lang.includes('cmn-')
      ) || null;
      this.voicesLoaded = true;
      this.synthesis.removeEventListener('voiceschanged', loadVoicesHandler);
    };

    // Try to load voices immediately
    this.voices = this.synthesis.getVoices();
    if (this.voices.length > 0) {
      this.chineseVoice = this.voices.find(
        voice => voice.lang.includes('zh-') || voice.lang.includes('cmn-')
      ) || null;
      this.voicesLoaded = true;
    } else {
      // If voices aren't loaded yet, wait for them
      this.synthesis.addEventListener('voiceschanged', loadVoicesHandler);
    }
  }

  public speak(text: string, options: {
    rate?: number;    // 0.1 to 10
    pitch?: number;   // 0 to 2
    volume?: number;  // 0 to 1
    onEnd?: () => void;
  } = {}): void {
    if (!text || typeof window === 'undefined') return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Use Chinese voice if available
    if (this.chineseVoice) {
      utterance.voice = this.chineseVoice;
    }

    // Set speech properties
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Add end event handler if provided
    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    // Speak the text
    this.synthesis.speak(utterance);
  }

  public stop(): void {
    if (typeof window === 'undefined') return;
    this.synthesis.cancel();
  }

  public pause(): void {
    if (typeof window === 'undefined') return;
    this.synthesis.pause();
  }

  public resume(): void {
    if (typeof window === 'undefined') return;
    this.synthesis.resume();
  }

  public get speaking(): boolean {
    if (typeof window === 'undefined') return false;
    return this.synthesis.speaking;
  }

  public get paused(): boolean {
    if (typeof window === 'undefined') return false;
    return this.synthesis.paused;
  }
}
