'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Volume2, Send, Loader2, StopCircle, Paperclip, VolumeX } from 'lucide-react';
import { useGeminiAPI } from '@/hooks/useGeminiAPI';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { saveMessage } from '@/app/(chat)/actions';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
  isVoiceMessage?: boolean;
  id?:"";
  chatId:string;
}

export function Chatbot({activeChat}:{activeChat:any}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [voiceAttachment, setVoiceAttachment] = useState<File | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateStreamingResponse } = useGeminiAPI();

  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognitionInstance = new SpeechRecognition();
          recognitionInstance.continuous = false;
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
              await handleSubmitVoice(finalTranscript.trim());
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
        }
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
      }
    }
  }, []);

  // Speech synthesis
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        toast.error("Error playing speech");
      };

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Text-to-speech is not supported in your browser");
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle voice recording
  const handleVoiceInput = () => {
    if (!recognition) {
      toast.error("Speech recognition is not supported");
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Handle voice submission
  const handleSubmitVoice = async (voiceInput: string) => {
    if (!voiceInput.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: voiceInput,
      createdAt: new Date(),
      isVoiceMessage: true,
      chatId:activeChat.id
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setFinalTranscript('');
    setIsThinking(true);

    try {
      setMessages(prev => [...prev, {
        role: 'system',
        content: "Processing your voice message...",
        createdAt: new Date(),
        chatId:activeChat.id
      }]);

      await generateStreamingResponse(voiceInput, (partialResponse) => {
        setMessages(prev => [
          ...prev.filter(msg => msg.role !== 'system' && msg.role !== 'assistant'),
          {
            role: 'assistant',
            content: partialResponse,
            createdAt: new Date(),
            chatId:activeChat.id
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
          createdAt: new Date(),
          chatId:activeChat.id
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Handle text input submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const currentMessages = []
    const userMessage = {
      role: 'user' as const,
      content: input,
      createdAt: new Date(),
      isVoiceMessage: false,
      chatId:activeChat.id
    };
    currentMessages.push(userMessage)
    currentMessages.push({})

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      await generateStreamingResponse(input,async (partialResponse) => {
        partialResponse = partialResponse.replaceAll("**", "")
        const assistantMessage = {
          role: 'assistant',
          content: partialResponse,
          createdAt: new Date(),
          chatId:activeChat.id
        }
        currentMessages.pop()
        currentMessages.push(assistantMessage)
        
        setMessages((prev:any) => {
          if(prev[prev.length -1].role == "assistant"){
            prev.pop()
            return [
              ...prev,
              {...assistantMessage}
            ]
          }else{
            return [
              ...prev,
              {
                role: 'assistant',
                content: partialResponse,
                createdAt: new Date()
              }
            ]
          }
        });
      })

    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again.',
          createdAt: new Date(),
          chatId:activeChat.id
        }
      ]);
    } finally {
     
      
      setIsThinking(false);
      saveMessage({message:currentMessages as any})
        .then(()=>{
          console.log("message saved");
          
        }).catch((e)=>{
          console.log(e);
        })
    }

  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Hide welcome message when chat starts
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center px-4 h-full">
      <div className="max-w-2xl w-full space-y-5">
        {/* Welcome message */}
        {showWelcome && (
          <div className="flex items-center justify-center space-x-4 animate-fade-in">
            <h2 className="text-[1.6875rem] font-semibold text-black font-sans text-center">
              Hi, what can I help you with?
            </h2>
            <Button
              onClick={() => speak("Hi, what can I help you with?")}
              variant="ghost"
              size="icon"
              className="h-10 w-10"
            >
              {isSpeaking ? (
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
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={cn(
                  "max-w-[80%] p-4 rounded-2xl relative group",
                  message.role === 'user' 
                    ? 'bg-blue-100 text-black' 
                    : 'bg-gray-100 text-black'
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
                    {formatTimestamp(message.createdAt)}
                  </span>
                  <Button
                    onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}
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
                </div>
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="relative">
          <Input
            className={cn(
              "w-full py-7 px-4 bg-[#E2E8F0] rounded-full pr-24 placeholder-black",
              isRecording && "animate-pulse border-red-500"
            )}
            placeholder={isRecording ? "Listening..." : "Ask LinguaMate"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking || isRecording}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
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
              disabled={isThinking || !input.trim()}
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