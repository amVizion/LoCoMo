import { ROUTER_PROMPT, RETRIEVER_PROMPT, ERROR_MESSAGE } from './prompts'
import { callOllama, calculate } from './utils'

const main = async(input:string) => {
    // Generate router prompt call ollama, and validate.
    const routerPrompt = ROUTER_PROMPT(input)
    const routerResponse = await callOllama(routerPrompt)
    const cleanResponse = routerResponse.trim().toUpperCase()
    if(cleanResponse !== 'YES') return ERROR_MESSAGE
    console.log('Router response:', cleanResponse)
    
    // Generate retriever prompt and call ollama, and validate.
    const retrieverPrompt = RETRIEVER_PROMPT(input)
    const retrieverResponse = await callOllama(retrieverPrompt)
    console.log('Retriever response:', retrieverResponse)

    // Calculate result, return result.   
    try{
        const { numbers, operation } = JSON.parse(retrieverResponse)
        return calculate(numbers, operation)
    } catch(e) { return ERROR_MESSAGE }

}

// main('What is 1 + 1?').then(console.log)
// main('What is two + two?').then(console.log)
// main('What is two plus two?').then(console.log)
// main('If I have one pizza, and Alice has another. How many pizzas do we have?').then(console.log)
main('If I have one pizza with two slices, and another pizza with three slices. How many pizzas slices do we have?').then(console.log)
