import SUMMARIES from '../data/summaries.json'
import CONVERSATIONS from '../data/conversations.json'
import QUESTIONS from '../data/questions.json'

import { callOllama } from '../baseline/4.Infer'
import { findAnswers } from '../baseline/2.FindAnswers'
import { iDialogue, iQuestion, iSummary } from '../types'

// PROMPTS
const VALIDATE_INFO_PROMPT = (info:string, question:string) => `
INFORMATION:
${info}

Given the information above, determine if you have enough information to answer the following question. 

Question: ${question}

Reply with "YES" or "NO".
` 

const validateInfo = async(text:string, question:string) => {
    const prompt = VALIDATE_INFO_PROMPT(text, question)
    const response = await callOllama(prompt)
    const cleanResponse = response.toUpperCase().trim().substring(0, 3)

    if (cleanResponse === 'YES') return true
    return false    
}


const ANSWER_QUESTION_PROMPT = (information:string, question:string) => `
INFORMATION:
${information}

Given the information above attempt to answer the following question.
Question: ${question}
`

interface iIndexMemory {
    type: 'SUMMARY' | 'CONVERSATION' 
    index: number
}

// TODO: Refactor
const getInfo = (indexMemory:iIndexMemory) => {
    // 1. Start with the most relevant summary.
    // 2. Continue with conversations.
    // 3. Use the index as memory.
}

export const adanAI = async(question:iQuestion) => {
    let index = 0
    let information = ''

    const summaries = findAnswers({ question, topAnswers:SUMMARIES.length, textType:'summary' }) as iSummary[]
    const conversations = findAnswers({ question, topAnswers:CONVERSATIONS.length, textType:'conversation' }) as iDialogue[]

    // 1. Obtener la informacion (conversacion o pregunta).
    while (true) {
        information = summaries[index].summary

        // 2. Validar la informacion y continuar al siguiente paso.
        const summaryInfo = await validateInfo(information, question.question)
        if (summaryInfo === true) break

        // Get next 10 conversations based on index.
        const rawConversations = conversations.slice(index*10, (index*10) + 10)

        // Parse conversations into bullet point text.
        information = rawConversations.map(c => `- ${c.speaker} (${c.date_time}): ${c.text}`).join('\n')
        const conversationInfo = await validateInfo(information, question.question)
        if (conversationInfo === true) break

        index++
    }

    // 3. Resolver la pregunta
    const prompt = ANSWER_QUESTION_PROMPT(information, question.question)
    const response = await callOllama(prompt)
    console.log('response', response)

    return response
}

adanAI(QUESTIONS[0] as iQuestion)

