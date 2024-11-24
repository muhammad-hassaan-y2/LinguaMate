'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Volume2, Send, Loader2, StopCircle, Paperclip, VolumeX } from 'lucide-react';
import { useGeminiAPI } from '@/hooks/useGeminiAPI';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  isVoiceMessage?: boolean;
}

export function Chatbot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [welcomeIsSpeaking, setWelcomeIsSpeaking] = useState(false);
  const [voiceAttachment, setVoiceAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateStreamingResponse, generateResponseWithVoiceAttachment } = useGeminiAPI();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognitionInstance = new SpeechRecognition();
          recognitionInstance.continuous = false; // Changed to false for better control
          recognitionInstance.interimResults = true;
          recognitionInstance.lang = 'en-US';

          recognitionInstance.onstart = () => {
            setIsRecording(true);
            setFinalTranscript('');
            setInput('');
            toast.success("Listening...");
          };

          recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            toast.error("Error recording voice. Please try again.");
          };

          recognitionInstance.onend = async () => {
            setIsRecording(false);
            if (finalTranscript.trim()) {
              setInput(finalTranscript.trim());
              // Automatically submit the voice message
              await handleVoiceSubmission(finalTranscript.trim());
            }
            toast.success("Recording finished");
          };

          recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscriptPart = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscriptPart += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            setFinalTranscript(prev => prev + finalTranscriptPart);
            setInput(finalTranscriptPart || interimTranscript);
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

  // Text-to-speech functionality
  const speak = (text: string, onEnd?: () => void) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => voice.lang.includes('en'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (onEnd) {
        utterance.onend = onEnd;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    }
    return false;
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setWelcomeIsSpeaking(false);
    }
  };

  const handleWelcomeSpeech = () => {
    if (welcomeIsSpeaking) {
      stopSpeaking();
    } else {
      setWelcomeIsSpeaking(true);
      const success = speak("Hi, what can I help you with?", () => {
        setWelcomeIsSpeaking(false);
      });
      if (!success) {
        toast.error("Text-to-speech is not supported in your browser");
      }
    }
  };

  const handleMessageSpeech = (message: Message) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      setIsSpeaking(true);
      const success = speak(message.content, () => {
        setIsSpeaking(false);
      });
      if (!success) {
        toast.error("Text-to-speech is not supported in your browser");
      }
    }
  };

  // Voice message submission handler
  const handleVoiceSubmission = async (voiceInput: string) => {
    if (!voiceInput.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: voiceInput,
      timestamp: new Date(),
      isVoiceMessage: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setFinalTranscript('');
    setIsThinking(true);

    try {
      setMessages(prev => [...prev, {
        role: 'system',
        content: "Processing your voice message...",
        timestamp: new Date()
      }]);

      await generateStreamingResponse(voiceInput, (partialResponse) => {
        setMessages(prev => [
          ...prev.filter(msg => msg.role !== 'system' && msg.role !== 'assistant'),
          {
            role: 'assistant',
            content: partialResponse,
            timestamp: new Date()
          }
        ]);
      });
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [
        ...prev.filter(msg => msg.role !== 'system'),
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVoiceAttachment(file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !voiceAttachment) return;

    if (isRecording) {
      recognition?.stop();
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
      isVoiceMessage: Boolean(voiceAttachment)
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      setMessages(prev => [...prev, {
        role: 'system',
        content: "Processing your message...",
        timestamp: new Date()
      }]);

      let response: string;
      if (voiceAttachment) {
        const formData = new FormData();
        formData.append('file', voiceAttachment);
        formData.append('message', input);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload voice attachment');
        }

        const { url } = await uploadResponse.json();
        response = await generateResponseWithVoiceAttachment(input, url, (partialResponse) => {
          setMessages(prev => [
            ...prev.filter(msg => msg.role !== 'system' && msg.role !== 'assistant'),
            {
              role: 'assistant',
              content: partialResponse,
              timestamp: new Date()
            }
          ]);
        });
      } else {
        response = await generateStreamingResponse(input, (partialResponse) => {
          setMessages(prev => [
            ...prev.filter(msg => msg.role !== 'system' && msg.role !== 'assistant'),
            {
              role: 'assistant',
              content: partialResponse,
              timestamp: new Date()
            }
          ]);
        });
      }

      setVoiceAttachment(null);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [
        ...prev.filter(msg => msg.role !== 'system'),
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const thinkingMessages = [
    "Analyzing your request...",
    "Processing with Gemini...",
    "Generating response...",
    "Almost there..."
  ];
  const [currentThinkingMessage, setCurrentThinkingMessage] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isThinking) {
      interval = setInterval(() => {
        setCurrentThinkingMessage((prev) => (prev + 1) % thinkingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isThinking]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);

  const handleVoiceInput = () => {
    if (!recognition) {
      toast.error("Speech recognition is not supported");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      setFinalTranscript('');
      setInput('');
      recognition.start();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-4 h-full">
      <div className="max-w-2xl w-full space-y-5">
        {/* Welcome message */}
        {showWelcome && (
          <div className="flex items-center justify-center space-x-4 animate-fade-in">
            <h2 className="text-[1.6875rem] font-semibold text-black font-sans text-center">
              Hi, what can I help you with?
            </h2>
            <div className="mx-36" />
            <Button
              onClick={handleWelcomeSpeech}
              variant="ghost"
              size="icon"
              className="h-10 w-10"
            >
              {welcomeIsSpeaking ? (
                <VolumeX className="h-8 w-8" />
              ) : (
                <Volume2 className="h-8 w-8" />
              )}
            </Button>
          </div>
        )}

        {/* Chat messages */}
        <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto px-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} 
                         ${message.role === 'system' ? 'justify-center' : ''}`}
            >
              <div
                className={cn(
                  "max-w-[80%] p-4 rounded-2xl relative group",
                  message.role === 'user' 
                    ? 'bg-blue-100 text-black' 
                    : message.role === 'system'
                    ? 'bg-gray-50 text-gray-600 italic'
                    : 'bg-gray-100 text-black',
                  message.role === 'system' && 'animate-pulse'
                )}
              >
                <div className="flex items-start gap-2">
                  {message.isVoiceMessage && message.role === 'user' && (
                    <Mic className="h-4 w-4 flex-shrink-0 mt-1" />
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {message.role !== 'system' && (
                    <Button
                      onClick={() => handleMessageSpeech(message)}
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isThinking && !messages.some(m => m.role === 'system') && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{thinkingMessages[currentThinkingMessage]}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="relative">
          <Input
            className={cn(
              "w-full py-7 px-4 bg-[#E2E8F0] rounded-full pr-36 placeholder-black",
              isRecording && "animate-pulse border-red-500"
            )}
            placeholder={isRecording ? "Listening..." : "Ask LinguaMate"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking || isRecording}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept=".txt,.wav,.mp3"
            />
            <Button
              type="button"
              className="h-10 w-10"
              size="icon"
              variant="ghost"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isThinking || isRecording}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              className={cn(
                "h-10 w-10",
                isRecording && "bg-red-100"
              )}
              size="icon"
              variant="ghost"
              onClick={handleVoiceInput}
              disabled={isThinking}
            >
              {isRecording ? (
                <StopCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <Button
              type="submit"
              className="h-10 w-10"
              size="icon"
              variant="ghost"
              disabled={isThinking || isRecording || (!input.trim() && !voiceAttachment)}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            className="bg-[#FBE025] hover:bg-[#FBE037] text-black rounded-full px-6 py-5 border border-b-4 border-[#444545] transition-all"
            disabled={isThinking || isRecording}
          >
            Help me practice speaking
          </Button>
          <Button 
            className="bg-[#DCCAEF] hover:bg-[#DCCAEF] text-black rounded-full px-6 py-5 border border-b-4 border-[#444545] transition-all"
            disabled={isThinking || isRecording}
          >
            Help me transcribe
          </Button>
          <Button 
            className="bg-[#BAF3D9] hover:bg-[#BAF3D9] text-black rounded-full px-6 py-5 border border-b-4 border-[#444545] transition-all"
            disabled={isThinking || isRecording}
          >
            Make me a quiz
          </Button>
        </div>
      </div>
    </div>
  );
}