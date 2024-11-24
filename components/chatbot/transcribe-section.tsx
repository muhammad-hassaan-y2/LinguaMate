'use client'

import { useState, useRef } from 'react'
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
import { Mic, Volume2, Languages, Wand2, Upload, StopCircle } from 'lucide-react'
import { Textarea } from "@/components/ui/textarea"

export function TranscribeSection() {
  const [step, setStep] = useState(1)
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [translation, setTranslation] = useState('')
  const [slangSuggestions, setSlangSuggestions] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('auto')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLanguageSelect = (value: string) => {
    setSelectedLanguage(value)
  }

  const startTranscription = () => {
    setStep(2)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Start recording logic here
    } else {
      // Stop recording and process audio
      processAudioOrFile()
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Process the uploaded file
      processAudioOrFile(file)
    }
  }

  const processAudioOrFile = (file?: File) => {
    // Simulating API call for transcription, translation, and slang detection
    setTimeout(() => {
      setTranscription("This is an example transcription of the audio or file.")
      setTranslation("This is the translated text in the target language.")
      setSlangSuggestions(["slang1: meaning", "slang2: meaning", "slang3: meaning"])
      setStep(3)
    }, 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 h-full">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[1.6875rem] font-semibold text-black font-sans">
            {step === 1 && "Let's transcribe something"}
            {step === 2 && "Record or upload your audio"}
            {step === 3 && "Here's your transcription"}
          </h2>
          <Button variant="ghost" size="icon">
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
                <SelectItem value="auto">Auto Detect</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Recording and File Upload Interface */}
        {step === 2 && (
          <Card className="border-2 border-dashed border-gray-200 p-8">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className={`p-4 rounded-full ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'}`}>
                <Mic className={`h-8 w-8 ${isRecording ? 'text-red-500' : 'text-gray-500'}`} />
              </div>
              <Button 
                onClick={toggleRecording}
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
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
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
                  <h3 className="text-lg font-semibold mb-2">Transcription:</h3>
                  <Textarea 
                    value={transcription} 
                    readOnly 
                    className="w-full min-h-[100px]"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Translation:</h3>
                  <Textarea 
                    value={translation} 
                    readOnly 
                    className="w-full min-h-[100px]"
                  />
                </div>
                {slangSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Slang Suggestions:</h3>
                    <ul className="list-disc pl-5">
                      {slangSuggestions.map((slang, index) => (
                        <li key={index}>{slang}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex gap-4 justify-center">
              <Button 
                className="bg-[#FBE025] hover:bg-[#FBE037] text-black rounded-full px-6 py-5 border border-b-4 border-[#444545] transition-all"
                onClick={() => setStep(1)}
              >
                New Transcription
              </Button>
              <Button 
                className="bg-[#BAF3D9] hover:bg-[#BAF3D9] text-black rounded-full px-6 py-5 border border-b-4 border-[#444545] transition-all"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Improve Translation
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

