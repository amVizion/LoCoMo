/*

Habilitar la comunicacion entre agentes inteligentes.
Para responder una pregunta Q.
Con la peculiaridad de que la respuesta requiere de sumarizar y razonamiento.

Dar el resumen de una conversacion al agente A.
Le vamos a permitir hacer una pregunta al agente B.

En base a la pregunta y respuesta de los agentes.
Intentar responder la pregunta Q.

*/

import QUESTIONS from "../data/questions.json"
import SUMMARIES from "../data/summaries.json"

import { getSessions } from "./maMemory"
import { iQuestion } from "../types"
import { callOllama } from "../baseline/4.Infer"


const POSE_QUESTION_PROMPT = (summary:string, question:string) => `
SUMMARY:
${summary}

QUESTION:
${question}

INSTRUCTIONS:
Your task is to answer the question above based on the summary provided.
However, you are missing some information. You can ask the other agent a question to help you answer the question.

What question would you like to ask the other agent?

Only provide the question, do not provide additional text or explanations.

QUESTION for Agent B:
`

// TODO: Evaluate if we want to include the original question or only the agent's question.
const CONTRAST_SUMMARIES = (summary:string, question:string) => `
SUMMARY:
${summary}

QUESTION:
${question}

INSTRUCTIONS:
Your task is to answer the question above based on the summary provided.
Answer confidently, even if you do not have enough information.

Do not provide additional text or explanations beyond the answer.

ANSWER:
`

// It's possible that based on the answer of agent B, we need to query summary A-
const ANSWER_QUESTION = (question:string, summary:string, answer:string) => `
QUESTION: 
${question}

SUMMARY:
${summary}

ADDITIONAL INFORMATION:
${answer}

INSTRUCTIONS:
Based on the information above, answer the question.
Do not provide additional text or explanations beyond the answer.
Answer confidently, even if you do not have enough information.

ANSWER:
`

const index = async(question:iQuestion) => {
    if(question.category !== 1) return question.question
    const sessions = getSessions(question)

    // Get Summaries
    const summaryA = SUMMARIES[parseInt(sessions[0]) -1]
    const summaryB = SUMMARIES[parseInt(sessions[1]) -1]

    const questionPrompt = POSE_QUESTION_PROMPT(summaryA.summary, question.question)
    const questionResponse = await callOllama(questionPrompt)

    const contrastPrompt = CONTRAST_SUMMARIES(summaryB.summary, questionResponse)
    const contrastResponse = await callOllama(contrastPrompt)

    const answerPrompt = ANSWER_QUESTION(question.question, summaryA.summary, contrastResponse)
    const response = await callOllama(answerPrompt)

    console.log('Answer:', response)
    console.log('Ground Truth:', question.answer)

    return response

}

index(QUESTIONS[18] as iQuestion).then(console.log)
