// utils/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GOOGLE_GEMINI_API_KEY!
export const genAI = new GoogleGenerativeAI(apiKey)