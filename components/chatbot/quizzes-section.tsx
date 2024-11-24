import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export function QuizzesSection() {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">Language Quizzes</h2>
      <p className="text-center text-gray-600">Test your knowledge with our interactive quizzes.</p>
      <div className="w-full p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Question 1 of 10</h3>
        <p className="text-lg mb-4">What is the correct translation of "Hello" in Spanish?</p>
        <RadioGroup defaultValue="option-1" className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-1" id="option-1" />
            <Label htmlFor="option-1">Hola</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-2" id="option-2" />
            <Label htmlFor="option-2">Adiós</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-3" id="option-3" />
            <Label htmlFor="option-3">Gracias</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option-4" id="option-4" />
            <Label htmlFor="option-4">Por favor</Label>
          </div>
        </RadioGroup>
        <Button className="w-full mt-6">Submit Answer</Button>
      </div>
    </div>
  )
}

