// Browser-based text-to-speech utility
// Phase 1a: Uses Web Speech API (free, works offline)
// Phase 1b: Can be swapped to OpenAI TTS or ElevenLabs

export interface TTSControls {
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPaused: () => boolean;
  isSpeaking: () => boolean;
}

export function extractPlainText(content: { lede: string; blocks: { type: string; content: string }[] }): string {
  const parts: string[] = [];
  if (content.lede) parts.push(content.lede);
  for (const block of content.blocks || []) {
    if (block.type === 'key') {
      parts.push('Key takeaway: ' + block.content);
    } else if (block.type === 'step') {
      parts.push('Next step: ' + block.content);
    } else {
      parts.push(block.content);
    }
  }
  return parts.join('. ');
}

export function speakText(
  text: string, 
  rate: number = 1,
  onEnd?: () => void,
  onBoundary?: (charIndex: number) => void
): TTSControls {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to pick a good English voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Samantha')) 
    || voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
    || voices.find(v => v.lang.startsWith('en') && v.localService);
  if (preferred) utterance.voice = preferred;

  if (onEnd) utterance.onend = onEnd;
  if (onBoundary) utterance.onboundary = (e) => onBoundary(e.charIndex);

  window.speechSynthesis.speak(utterance);

  return {
    pause: () => window.speechSynthesis.pause(),
    resume: () => window.speechSynthesis.resume(),
    stop: () => window.speechSynthesis.cancel(),
    isPaused: () => window.speechSynthesis.paused,
    isSpeaking: () => window.speechSynthesis.speaking,
  };
}
