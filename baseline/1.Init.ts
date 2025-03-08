/*
    Initializes memory.
    Stores encoded questions & answers.
*/

import data from '../data/data.json'

import * as use from '@tensorflow-models/universal-sentence-encoder'
import '@tensorflow/tfjs-node'
import { writeFileSync } from 'fs'


const getTexts = () => {
    const { conversation } = data

    // Get all sessions from conversation.
    // Conversations have a format of session_1, session_2, etc.
    
    const sessions = Object.keys(conversation).filter(key => key.includes('session'))
    // Filter out timestamps that end in "_date_time".
    const sessionKeys = sessions.filter(key => !key.includes('date_time'))

    // For every session get the text. 
    const texts = sessionKeys.map(key => (conversation[key as keyof typeof conversation] as any[]).map(s => ({
        id: s.dia_id, text: s.text, speaker: s.speaker, 
        date_time: conversation[`${key}_date_time` as keyof typeof conversation]
    }))).flat()

    return texts
}

const embedTexts = async(texts:string[]) => {
    const model = await use.load()

    const tensors = await model.embed(texts)
    const embeddings = tensors.arraySync()

    return embeddings
}

const initMemory = async() => {
    const conversations = getTexts() 
    const texts = conversations.map(({ text }) => text)
    const embeddings = await embedTexts(texts)
    const embeddedConversations = conversations.map((c, i) => ({...c, embeddings:embeddings[i]}))
    writeFileSync('./data/conversations.json', JSON.stringify(embeddedConversations))

    const { qa } = data
    const questions = qa.map(({ question }) => question)
    const questionEmbeddings = await embedTexts(questions)
    const embeddedQuestions = qa.map((q, i) => ({...q, embeddings:questionEmbeddings[i]}))
    writeFileSync('./data/questions.json', JSON.stringify(embeddedQuestions))

    const { session_summary } = data
    const sessionKeys = Object.keys(session_summary)
    const summaryTexts = sessionKeys.map(key => session_summary[key as keyof typeof session_summary])
    const summaryEmbeddings = await embedTexts(texts)
    const summaries = summaryTexts.map((s, i) => ({summary:s, idx:i, embeddings:summaryEmbeddings[i]}))
    writeFileSync('./data/summaries.json', JSON.stringify(summaries))
}

// initMemory()
