import axios from 'axios'

export const callOllama = async(prompt:string) => {
    const OLLAMA_URL = 'http://localhost:11434/api/generate'

    console.log(prompt)
    const request = { prompt, model:'mistral', stream:false, verbose:true }
    const { data } = await axios.post(OLLAMA_URL, request)
    console.log(data.response)

    return data.response
}

export const calculate = (numbers:number[], operation:string) => {
    const [a, b] = numbers
    // TODO: Handle multiple numbers.

    switch(operation) {
        case 'addition':
            return a + b
        case 'subtraction':
            return a - b
        case 'multiplication':
            return a * b
        case 'division':
            return a / b
        default:
            return 'Invalid operation'
    }
}

