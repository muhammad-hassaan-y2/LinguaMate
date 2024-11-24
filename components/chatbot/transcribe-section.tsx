'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Volume2, Languages, Wand2, Upload, StopCircle, Loader2 } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface TranscriptionResult {
  text: string;
  language?: string;
}

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect', bcp47: 'en-US' },
  { code: 'en-US', name: 'English (US)', bcp47: 'en-US' },
  { code: 'es-ES', name: 'Spanish', bcp47: 'es-ES' },
  { code: 'fr-FR', name: 'French', bcp47: 'fr-FR' },
  { code: 'de-DE', name: 'German', bcp47: 'de-DE' },
  { code: 'it-IT', name: 'Italian', bcp47: 'it-IT' },
  { code: 'ja-JP', name: 'Japanese', bcp47: 'ja-JP' },
  { code: 'ko-KR', name: 'Korean', bcp47: 'ko-KR' },
  { code: 'zh-CN', name: 'Chinese', bcp47: 'zh-CN' },
  { code: 'hi-IN', name: 'Hindi', bcp47: 'hi-IN' },
  { code: 'ar-SA', name: 'Arabic', bcp47: 'ar-SA' },
] as const;

export function TranscribeSection() {
  const [step, setStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [translation, setTranslation] = useState('')
  const [slangSuggestions, setSlangSuggestions] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('auto')
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioContext = useRef<AudioContext | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognitionInstance = new SpeechRecognition();
          recognitionInstance.continuous = true;
          recognitionInstance.interimResults = true;
          
          recognitionInstance.onstart = () => {
            setIsRecording(true);
            toast.success("Recording started");
          };

          recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            toast.error("Error recording voice. Please try again.");
          };

          recognitionInstance.onend = () => {
            setIsRecording(false);
            toast.success("Recording finished");
          };

          recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = Array.from(event.results)
              .map(result => result[0].transcript)
              .join(' ');
            
            setTranscription(transcript);
            
            if (event.results[event.results.length - 1].isFinal) {
              processTranscription(transcript);
            }
          };

          setRecognition(recognitionInstance);
        } else {
          toast.error("Speech recognition is not supported in your browser");
        }
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
      }
    }
  }, []);

  const translateText = async (text: string) => {
    try {
      setIsProcessing(true);
      const targetLang = LANGUAGES.find(lang => lang.code === selectedLanguage)?.bcp47 || 'en-US';
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLanguage: 'auto',
          targetLanguage: targetLang
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      
      if (data.translation) {
        setTranslation(data.translation);
      }
      
      if (data.slangAnalysis) {
        const slangArray = Array.isArray(data.slangAnalysis) 
          ? data.slangAnalysis 
          : data.slangAnalysis.split('\n').filter(Boolean);
        setSlangSuggestions(slangArray);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate text');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLanguageSelect = (value: string) => {
    setSelectedLanguage(value);
    if (recognition) {
      recognition.lang = value === 'auto' ? 'en-US' : value;
    }
  };

  const startTranscription = () => {
    setStep(2);
  };

  const toggleRecording = () => {
    if (!recognition) {
      toast.error("Speech recognition is not supported");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      setTranscription('');
      setTranslation('');
      setSlangSuggestions([]);
      recognition.start();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', selectedLanguage);

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process audio file');
      }

      const data = await response.json();
      
      if (data.text) {
        setTranscription(data.text);
        await processTranscription(data.text);
        setStep(3);
      } else {
        throw new Error('No transcription received');
      }
    } catch (error) {
      console.error('Error processing audio file:', error);
      toast.error('Failed to process audio file');
    } finally {
      setIsProcessing(false);
    }
  };

  const processTranscription = async (text: string) => {
    try {
      setIsProcessing(true);
      setTranscription(text);
      
      // If a specific language is selected (not auto), translate the text
      if (selectedLanguage !== 'auto') {
        await translateText(text);
      } else {
        setTranslation(text); // For auto, initially set same as transcription
      }
      
      setStep(3);
    } catch (error) {
      console.error('Error processing transcription:', error);
      toast.error('Failed to process transcription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImproveTranslation = async () => {
    if (!transcription) return;
    
    try {
      setIsProcessing(true);
      await translateText(transcription);
      toast.success('Translation improved');
    } catch (error) {
      console.error('Error improving translation:', error);
      toast.error('Failed to improve translation');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedLanguage !== 'auto') {
        utterance.lang = selectedLanguage;
      }
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech is not supported in your browser");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 h-full">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[1.6875rem] font-semibold text-black font-sans mt-9">
            {step === 1 && "Let's transcribe something"}
            {step === 2 && "Record or upload your audio"}
            {step === 3 && "Here's your transcription"}
          </h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => speakText(
              step === 1 ? "Let's transcribe something" :
              step === 2 ? "Record or upload your audio" :
              "Here's your transcription"
            )}
          >
            <Volume2 className="w-8 h-8" />
          </Button>
        </div>

        {/* Language Selection */}
        {step >= 2 && (
          <div className="flex items-center gap-4">
            <Languages className="h-5 w-5" />
            <Select onValueChange={handleLanguageSelect} value={selectedLanguage}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Recording and File Upload Interface */}
        {step === 2 && (
          <Card className="border-2 border-dashed border-gray-200 p-8">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className={`p-4 rounded-full ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'}`}>
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                ) : (
                  <Mic className={`h-8 w-8 ${isRecording ? 'text-red-500' : 'text-gray-500'}`} />
                )}
              </div>
              <Button 
                onClick={toggleRecording}
                disabled={isProcessing}
                className={`
                  rounded-full px-6 py-5 border border-b-4 border-[#444545] transition-all
                  ${isRecording 
                    ? 'bg-red-100 hover:bg-red-200 text-red-500' 
                    : 'bg-[#DCCAEF] hover:bg-[#DCCAEF] text-black'}
                `}
              >
                {isRecording ? <StopCircle className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">or</p>
                <Input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="bg-[#FBE025] hover:bg-[#FBE037] text-black rounded-full px-6 py-5 border border-b-4 border-[#444545] transition-all"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Audio File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transcription and Translation Result */}
        {step === 3 && (
          <div className="space-y-4">
            <Card className="p-4">
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Transcription:</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => speakText(transcription)}
                      disabled={!transcription}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea 
                    value={transcription} 
                    readOnly 
                    className="w-full min-h-[100px]"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Translation:</h3>
                    <div className="flex items-center gap-2">
                      {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => speakText(translation)}
                        disabled={isProcessing || !translation}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Textarea 
                    value={translation} 
                    readOnly 
                    className={`w-full min-h-[100px] ${isProcessing ? 'opacity-50' : ''}`}
                  />
                </div>
                {slangSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Slang Suggestions:</h3>
                    <ul className="list-disc pl-5">
                      {slangSuggestions.map((slang, index) => (
                        <li key={index} className="mb-2">{slang}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex gap-4 justify-center">
              <Button 
                className="bg-[#FBE025] hover:bg-[#FBE037] text-black rounded-full px-6 py-5 border border-b-4 border-[#444545] transition-all"
                onClick={() => {
                  setStep(1);
                  setTranscription('');
                  setTranslation('');
                  setSlangSuggestions([]);
                }}
              >
                New Transcription
              </Button>
              <Button 
                className="bg-[#BAF3D9] hover:bg-[#BAF3D9] text-black rounded-full px-6 py-5 border border-b-4 border-[#444545] transition-all"
                onClick={handleImproveTranslation}
                disabled={isProcessing || !transcription}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Improve Translation
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Initial State Button */}
        {step === 1 && (
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              className="bg-[#DCCAEF] hover:bg-[#DCCAEF] text-black rounded-full px-6 py-5 border border-b-4 border-[#444545] transition-all"
              onClick={startTranscription}
            >
              Start New Transcription
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}