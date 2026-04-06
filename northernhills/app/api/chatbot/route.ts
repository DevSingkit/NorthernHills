// app/api/chatbot/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const { message, sessionInfo } = await req.json()

  const systemPrompt = `You are a post-operative care assistant for Northern Hills Veterinary Clinic's Stray Neuter Project (SNP) in Caloocan City, Philippines.

You are helping the owner of the following pets who recently underwent spay/neuter procedures:
${sessionInfo.pets.map((p: any) => `- ${p.name} (${p.species})${p.procedure ? `: ${p.procedure}` : ''}`).join('\n')}

Event: ${sessionInfo.event_name} on ${sessionInfo.event_date}
Owner: ${sessionInfo.owner_name}

Your role:
- Answer questions about post-operative recovery for spay/neuter procedures
- Give guidance on wound care, activity restrictions, feeding, medications
- Help identify warning signs that require immediate vet attention
- Be warm, caring, and easy to understand
- Use simple language appropriate for Filipino pet owners
- Keep responses concise but thorough
- Always recommend contacting the clinic for serious concerns

Clinic contact: 0927 867 8760 | northernhillsvet@gmail.com

Do NOT provide dosage advice for medications not prescribed by the clinic.`

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt
    })

    const result = await model.generateContent(message)
    const reply = result.response.text()

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ reply: 'Sorry, I encountered an error. Please try again.' }, { status: 500 })
  }
}