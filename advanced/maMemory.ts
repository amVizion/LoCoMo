/*

1. Dos agentes, uno para la primera sesion y otro para la segunda.
2. Modificar el contexto para incluir ambas sesiones.

*/

import { getSession, RELEVANT_MSG_PROMT, ANSWER_QUESTION_PROMPT } from './memoryRAG'
import CONVERSATIONS from '../data/conversations.json'
import QUESTIONS from '../data/questions.json'

import { callOllama } from '../baseline/4.Infer'
import { iQuestion } from '../types'

const COMBINE_ANSWERS = (answerA:string, answerB:string, question:string) => `
QUESTION:
${question}

ANSWER A:
${answerA}

ANSWER B:
${answerB}

COMBINED ANSWER:
`

const answerQuestion = async(memory:string[], question:iQuestion) => {
    const prompt = ANSWER_QUESTION_PROMPT(memory, question.question)
    const response = await callOllama(prompt)
    return response
}

const getMemory = async(question:iQuestion, session:string) => {
    const RELEVANT_MSGS:string[] = []

    const conversations = CONVERSATIONS.filter(conversation => {
        const conversationSession = getSession(conversation.id)
        return conversationSession === session
    })

    for (const c of conversations) {
        const prompt = RELEVANT_MSG_PROMT(c, question.question)
        const response = await callOllama(prompt)
        const cleanResponse = response.toUpperCase().trim().substring(0, 3)
        if(cleanResponse === 'YES') RELEVANT_MSGS.push(c.text)
    }

    return RELEVANT_MSGS
    // Could add question answering here (optionally)
}



export const getSessions = ({ evidence }:iQuestion) => {
    const getSessions = evidence.map(e => getSession(e))

    const uniqueSessions = [...new Set(getSessions)]
    console.log('uniqueSessions', uniqueSessions)

    return uniqueSessions
} 

const index = async(question:iQuestion) => {
    if(question.category !== 1) return

    const getSessions = question.evidence.map(evidence => getSession(evidence))

    const uniqueSessions = [...new Set(getSessions)]
    console.log('uniqueSessions', uniqueSessions)

    const contextA = await getMemory(question, uniqueSessions[0])
    const contextB = await getMemory(question, uniqueSessions[1])

    // Answer question individually.
    const answerA = await answerQuestion(contextA, question)
    const answerB = await answerQuestion(contextB, question)

    // Combine both answers.
    const prompt = COMBINE_ANSWERS(answerA, answerB, question.question)
    const response = await callOllama(prompt)
    console.log('ANSWER:', response)

    console.log('Ground Truth:', question.answer)
}

// index(QUESTIONS[5] as iQuestion)
