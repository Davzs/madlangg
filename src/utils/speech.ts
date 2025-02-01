export function speakText(text: string, lang: string = 'zh-CN') {
  // Check if speech synthesis is available
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.8; // Slightly slower for better clarity
  
  // Speak
  window.speechSynthesis.speak(utterance);
}
