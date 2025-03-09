
/*
## Temporal Reasoning

1. Sequence (one event after another).
2. Duration (how long an event lasts).
3. Frequency: (how many times an event ocurr).
*/

import { callOllama } from '../baseline/4.Infer'
import CONVERSATIONS from '../data/conversations.json'
import QUESTIONS from '../data/questions.json'
import { iQuestion } from "../types"


type iEvent = {
    timestamp: number
    event: string
}

type iDelta = {
    days?: number
    months?: number
    years?: number
}


// 1. Ask Ollama to get conversation date.
// 2. Ask Ollama to get the difference between two dates.
// 3. Answer the question


const PARSE_DATE_PROMPT = (date:string) => `
Given the following date, provide the year, month, and day. 
Return in JSON format. Do not provide additional information.

Date:
4:04 pm on 20 April, 2023 

JSON format:
{ "days": 20, "months": 4, "years": 2023 }


Date: 
${date}

JSON format:
`

const parseDate = async(date:string) => {
    const prompt = PARSE_DATE_PROMPT(date)
    const response = await callOllama(prompt)

    // TODO: Validate response
    const { days, months, years} = JSON.parse(response)
    return { day: days, month: months -1, year: years }
}


const PARAMS_PROMPT = (text:string) => `
The following conversation has a temporal diffence.
Please provide the difference in days, months years in JSON format. 

Converation: 
I started a business last week.

JSON format:
{ "days": -7, "months": 0, "years": 0 }

Conversation:
${text}

JSON format:
`

const getParameters = async(text:string) => {
    const prompt = PARAMS_PROMPT(text)
    const response = await callOllama(prompt)
    const cleanResponse = JSON.parse(response)
    return cleanResponse
}

const WRITE_DATE_PROMPT = (date:iDelta) => `
Your task is to communicate the following date in a human-readable format.

Date:
{ "days": 20, "months": 4, "years": 2023 }

Human-readable format:
20 April, 2023

Date:
${JSON.stringify(date)}

Human-readable format:
`


const computeDifference = async(question:iQuestion) => {
    const [evidence] = question.evidence
    const conversation = CONVERSATIONS.find(c => c.id === evidence)!

    const { date_time:d, text } = conversation
    const date = await parseDate(d)
    const params = await getParameters(text)

    const newDate = {
        days: date.day + params.days,
        months: date.month + params.months + 1,
        years: date.year + params.years
    }

    const prompt = WRITE_DATE_PROMPT(newDate)
    const response = await callOllama(prompt)

    console.log('Ground Truth:', question.answer)
    console.log('Answer:', response)
    return response
}

computeDifference(QUESTIONS[0] as iQuestion)
