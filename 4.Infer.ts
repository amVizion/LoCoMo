import { iDialogue, iQuestion } from './types'
import { findAnswers } from './2.FindAnswers'
import questions from './questions.json'
import axios from 'axios'
import { execSync } from 'child_process'


const callOllama = async(dialogues:iDialogue[], question:iQuestion) => {
    const OLLAMA_URL = 'http://localhost:11434/api/generate'
    const prompt = `
Context:
${dialogues.map(d => `- ${d.speaker} (${d.date_time}): ${d.text}`).join('\n')}

Given the information above attempt to answer the following question
Question:
${question.question}
`

    console.log(prompt)
    const request = { prompt, model:'mistral', stream:false, verbose:true }
    const { data } = await axios.post(OLLAMA_URL, request)
    console.log(data.response)

    return data.response
}

const inference = async() => {
    const question = questions.sort(() => Math.random() - 0.5)[0]
    const answer = question.answer || question.adversarial_answer
    const dialogues = findAnswers(question as iQuestion)

    const response = await callOllama(dialogues as iDialogue[], question as iQuestion)

    console.log('question', question.question)
    console.log('answer', answer)

    console.log('response', response)

    const score = execSync(`bert-score --lang en -r "${answer}" -c "${response}"`)
    console.log('score', score.toString().replace(/['"]+/g, ''))

}

// TODO: Add iterative retrieval (by selecting ).
inference()
