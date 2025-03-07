/*
Objectivo: Identificar los mensajes dentro de una conversacion que son relevantes para responder una pregunta.

Pasos:
1. Iterar por los msjs de una conversación y encontrar los relevantes con un LLM.
2. Almacenar los mensajes relevantes en una memoria.
3. Utilizando la memoria, contestar la pregunta.
4. Evaluar los resultados (manualmente).

*/

import { callOllama } from '../baseline/4.Infer'
import CONVERSATIONS from '../data/conversations.json'
import QUESTIONS from '../data/questions.json'
import { iDialogue, iQuestion } from "../types"


export const RELEVANT_MSG_PROMT = (dialogue:iDialogue, question:string) => `
QUESTION: 
${question}

Determine if the following information will be relevant to answer the question above.

INFORMATION: 
${dialogue.text}

ANSWER: YES or NO
Do not provide additional explanations.
`

export const ANSWER_QUESTION_PROMPT = (memory:string[], question:string) => `
CONTEXT: 
${memory.join('\n')}

Based on the context above, answer the following question.

QUESTION: ${question}

ANSWER:
`

export const getSession = (evidence:string) => {
    return evidence.split(':')[0].replace('D', '')
}

export const answerWithMemory = async(question:iQuestion) => {
    const RELEVANT_MSGS:string[] = []
    if(question.category !== 4) return

    // Filtrar messages from relevant session.
    const [ evidence ] = question.evidence
    const session = getSession(evidence)
    console.log(session)

    const conversations = CONVERSATIONS.filter(conversation => {
        const conversationSession = getSession(conversation.id)
        return conversationSession === session
    })

    // Iterate through messages in a convesation (ask if relevant).
    for (const c of conversations) {
        const prompt = RELEVANT_MSG_PROMT(c, question.question)
        const response = await callOllama(prompt)
        const cleanResponse = response.toUpperCase().trim().substring(0, 3)
        if(cleanResponse === 'YES') RELEVANT_MSGS.push(c.text)
    }

    // Use Memory to answer question.
    const prompt = ANSWER_QUESTION_PROMPT(RELEVANT_MSGS, question.question)
    const answer = await callOllama(prompt)
    console.log('ANSWER:', answer)

    // Print and return results
}

// index(QUESTIONS[2] as iQuestion)
