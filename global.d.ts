interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
  speechSynthesis: SpeechSynthesis;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  onaudiostart: () => void;
  onaudioend: () => void;
  onnomatch: () => void;
  onsoundstart: () => void;
  onsoundend: () => void;
  onspeechstart: () => void;
  onspeechend: () => void;
}

interface SpeechSynthesisUtterance extends EventTarget {
  lang: string;
  pitch: number;
  rate: number;
  text: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  onboundary: (event: SpeechSynthesisEvent) => void;
  onend: (event: SpeechSynthesisEvent) => void;
  onerror: (event: SpeechSynthesisErrorEvent) => void;
  onmark: (event: SpeechSynthesisEvent) => void;
  onpause: (event: SpeechSynthesisEvent) => void;
  onresume: (event: SpeechSynthesisEvent) => void;
  onstart: (event: SpeechSynthesisEvent) => void;
}

interface SpeechSynthesisEvent extends Event {
  charIndex: number;
  charLength?: number;
  elapsedTime: number;
  name?: string;
  utterance: SpeechSynthesisUtterance;
}

interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
  error: string;
}

interface SpeechSynthesisVoice {
  default: boolean;
  lang: string;
  localService: boolean;
  name: string;
  voiceURI: string;
}

interface SpeechSynthesis {
  paused: boolean;
  pending: boolean;
  speaking: boolean;
  cancel(): void;
  getVoices(): SpeechSynthesisVoice[];
  pause(): void;
  resume(): void;
  speak(utterance: SpeechSynthesisUtterance): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
  onvoiceschanged: () => void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

declare var SpeechSynthesisUtterance: {
  prototype: SpeechSynthesisUtterance;
  new(text?: string): SpeechSynthesisUtterance;
};

declare var speechSynthesis: SpeechSynthesis;