export interface iQuestion {
    embeddings: number[]
    question: string
    answer?: string
    evidence: string[]
    category: number
    adversarial_answer?: undefined;
}

export interface iDialogue {
    embeddings: number[]
    id: string
    text: string
    speaker: string
    date_time:string
}

export interface iSummary {
    embeddings: number[]
    summary: string
    idx: number
}
