import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Mic, Play, Pause, RotateCcw } from "lucide-react"

export function SpeakingSection() {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">Practice Speaking</h2>
      <p className="text-center text-gray-600">Improve your pronunciation and fluency with our speaking exercises.</p>
      <div className="w-full p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Repeat after me:</h3>
        <p className="text-lg mb-4">"The quick brown fox jumps over the lazy dog."</p>
        <div className="flex justify-center gap-4 mb-4">
          <Button size="icon" variant="outline">
            <Play className="h-6 w-6" />
          </Button>
          <Button size="icon" variant="outline">
            <Mic className="h-6 w-6" />
          </Button>
          <Button size="icon" variant="outline">
            <Pause className="h-6 w-6" />
          </Button>
          <Button size="icon" variant="outline">
            <RotateCcw className="h-6 w-6" />
          </Button>
        </div>
        <Progress value={33} className="w-full" />
        <p className="text-sm text-center mt-2">Your pronunciation accuracy: 85%</p>
      </div>
    </div>
  )
}

