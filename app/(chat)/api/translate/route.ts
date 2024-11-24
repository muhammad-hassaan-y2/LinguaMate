import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { text, targetLanguage } = await request.json()

    // Get translation
    const translationPrompt = `Translate the following text to ${targetLanguage}: "${text}"`
    const translationResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a translator. Provide only the translation without any explanations."
        },
        {
          role: "user",
          content: translationPrompt
        }
      ]
    })

    // Get slang analysis
    const slangResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Identify and explain any slang terms, idioms, or colloquial expressions in the text. If none are found, return an empty array."
        },
        {
          role: "user",
          content: text
        }
      ]
    })

    return NextResponse.json({
      translation: translationResponse.choices[0].message.content,
      slangAnalysis: slangResponse.choices[0].message.content
    })
  } catch (error) {
    console.error('Translation API Error:', error)
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    )
  }
}