/*
    Initializes memory.
    Stores encoded questions & answers.
*/

import data from './data.json'

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
    const texts = sessionKeys.map(key => conversation[key as keyof typeof conversation])
    .map(conversation => (conversation as []).map(({ text, dia_id, speaker }) => 
        ({id:dia_id, text, speaker})
    )).flat()

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
    writeFileSync('conversations.json', JSON.stringify(embeddedConversations))

    const { qa } = data
    const questions = qa.map(({ question }) => question)
    const questionEmbeddings = await embedTexts(questions)
    const embeddedQuestions = qa.map((q, i) => ({...q, embeddings:questionEmbeddings[i]}))
    writeFileSync('questions.json', JSON.stringify(embeddedQuestions))
}

initMemory()
