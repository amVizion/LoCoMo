import { findAnswers } from '../baseline/2.FindAnswers'
import { callOllama } from '../baseline/4.Infer'
import questions from '../data/questions.json'
import SUMMARIES from '../data/summaries.json'
import { iQuestion, iSummary } from '../types'

const getPrompt = (summary:string, question:string) => {
    return `
Summary:
${summary}

Given the summary above, determine if you have enough information to answer the following question. Question:
${question}

Reply exactly with "yes" or "no".
`
}

const selectSummary = async(question:iQuestion) => {
    const input = { question, textType: 'summary' as const, topAnswers: SUMMARIES.length }
    const summaries = findAnswers(input) as iSummary[]
    for (const {summary, idx} of summaries) {
        const prompt = getPrompt(summary, question.question)
        const response = await callOllama(prompt)
        if (response === 'yes') return idx
    }

    return 0
}

const evaluateSummary = async() => {
    const categoryQuestions = questions.filter(({ category }) => category === 2)
    const question = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)] as iQuestion

    const idx = await selectSummary(question)
    const { evidence } = question

    const truth = evidence[0].split(':')[0].slice(1)
    console.log(idx, truth)
    return (idx + 1) === parseInt(truth)
}

// evaluateSummary().then(console.log)
