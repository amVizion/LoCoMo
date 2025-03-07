import { iDialogue, iQuestion } from '../types'
import { findAnswers } from './2.FindAnswers'
import questions from '../data/questions.json'
import { execSync } from 'child_process'
import axios from 'axios'


export const callOllama = async(prompt:string) => {
    const OLLAMA_URL = 'http://localhost:11434/api/generate'

    console.log(prompt)
    const request = { prompt, model:'mistral', stream:false, verbose:true }
    const { data } = await axios.post(OLLAMA_URL, request)
    console.log(data.response)

    return data.response
}

const getPrompt = (dialogues:iDialogue[], question:iQuestion) => {
    return `
Context:
${dialogues.map(d => `- ${d.speaker} (${d.date_time}): ${d.text}`).join('\n')}

Given the information above attempt to answer the following question.
Question: ${question.question}
`
}

const inference = async() => {
    const question = questions.sort(() => Math.random() - 0.5)[0] as iQuestion
    const dialogues = findAnswers({question})

    const prompt = getPrompt(dialogues as iDialogue[], question as iQuestion)
    const response = await callOllama(prompt)

    console.log('question', question.question)
    console.log('response', response)

    const answer = question.answer || question.adversarial_answer
    console.log('answer', answer)

    const score = execSync(`bert-score --lang en -r "${answer}" -c "${response}"`)
    console.log('score', score.toString().replace(/['"]+/g, ''))

}

// TODO: Add iterative retrieval (by selecting ).
// inference()
