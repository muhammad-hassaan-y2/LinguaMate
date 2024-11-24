'use client'

import { useState } from 'react'
import { Menu, Grid3X3, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BackgroundShapes } from '@/components/chatbot/background-shapes'
import { TranscribeSection } from "@/components/chatbot/transcribe-section"
import { SpeakingSection } from "@/components/chatbot/speaking-section"
import { QuizzesSection } from '@/components/chatbot/quizzes-section'
import { Chatbot } from '@/components/chatbot/chatbot'

export default function ChatInterface() {
  const [activeSection, setActiveSection] = useState('chat')

  return (
    <div className="flex h-screen bg-white overflow-hidden relative">
      <BackgroundShapes variant={activeSection as 'default' | 'transcribe' | 'speaking' | 'quizzes'} />
      
      {/* Sidebar */}
      <div className="w-20 bg-[#F5F7FA] flex flex-col items-center py-4 space-y-8 relative z-10">
        <Button variant="ghost" size="icon" className="rounded-md">
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col space-y-4">
          <Button
            variant={activeSection === 'chat' ? 'secondary' : 'ghost'}
            className="p-3 rounded-md flex flex-col items-center"
            onClick={() => setActiveSection('chat')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-xs mt-1">Chat</span>
          </Button>
          
          <Button
            variant={activeSection === 'transcribe' ? 'secondary' : 'ghost'}
            className="p-3 rounded-md flex flex-col items-center"
            onClick={() => setActiveSection('transcribe')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 7 10 10-5 5V2l5 5L7 17" />
            </svg>
            <span className="text-xs mt-1">Transcribe</span>
          </Button>
          
          <Button
            variant={activeSection === 'speaking' ? 'secondary' : 'ghost'}
            className="p-3 rounded-md flex flex-col items-center"
            onClick={() => setActiveSection('speaking')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            <span className="text-xs mt-1">Speaking</span>
          </Button>
          
          <Button
            variant={activeSection === 'quizzes' ? 'secondary' : 'ghost'}
            className="p-3 rounded-md flex flex-col items-center"
            onClick={() => setActiveSection('quizzes')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
            <span className="text-xs mt-1">Quizzes</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 
         bg-white/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font- text-[#718096]">LinguaMate</h1>
            <span className="text-2xl capitalize">{activeSection}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Grid3X3 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeSection === 'chat' && <Chatbot />}
          {activeSection === 'transcribe' && <TranscribeSection />}
          {activeSection === 'speaking' && <SpeakingSection />}
          {activeSection === 'quizzes' && <QuizzesSection />}
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-sm text-gray-500 bg-white/80 backdrop-blur-sm relative z-10">
          Lingua mate can make mistakes, so double-check it
        </footer>
      </div>
    </div>
  )
}
