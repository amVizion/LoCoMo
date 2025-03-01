import questions from '../data/questions.json'
import { writeFileSync } from 'fs'

import { iDialogue, iQuestion } from '../types'
import { findAnswers } from './2.FindAnswers'
import { getDelta } from './5.Analysis'


const logs = {
    results: {},
    questions: [] as any[]
}

const evaluateAnswers = (dialogues:iDialogue[], question:iQuestion) => {
    const { evidence } = question
    const answers = dialogues.filter(({ id }) => evidence.includes(id))

    const ranks = answers.map(({ id }) => {
        return dialogues.findIndex(({ id:dialog_id }) => id === dialog_id)
    })

    const results = {
        answerFound: answers.length === evidence.length,
        percentageFound: answers.length / evidence.length,
        avgRank: ranks.length ? ranks.reduce((a,b) => a+b, 0) / ranks.length : dialogues.length
    }

    const questionLogs = {
        question: question.question,
        answer: `${question.evidence}: ${question.answer || question.adversarial_answer}`,
        dialogues: dialogues.map(({ text, id }) => `${id}, ${text}`),
        results
    }

    logs.questions.push(questionLogs)
    return results
}

const evaluate = (sample?:number, useDelta?:boolean) => {
    const data = sample ? questions.sort(() => Math.random() - 0.5).slice(0, sample) : questions

    // For each question in data, find relevant answers.
    const results = data.map(q => {
        const delta = useDelta ? getDelta() : q.embeddings.map(() => 0)
        const question = {...q, embeddings: q.embeddings.map((val, i) => val + delta[i])}
        const answers = findAnswers(question as iQuestion)
        return evaluateAnswers(answers as iDialogue[], question as iQuestion)
    })

    const finalResults = {
        avgAnswerFound: results.reduce((a,{ answerFound:b}) => b === true ? a + 1 : a, 0) / results.length,
        avgPercentageFound: results.reduce((a,b) => a+b.percentageFound, 0) / results.length,
        avgAvgRank: results.reduce((a,b) => a+b.avgRank, 0) / results.length
    }

    logs.results = finalResults

    const date = new Date().toISOString().replace(/:/g, '-')
    const fileName = `results/${date}${useDelta ? '-delta' : ''}.json`
    writeFileSync(fileName, JSON.stringify(logs, null, 2))
    return finalResults
}

evaluate(100)
evaluate(100, true)
