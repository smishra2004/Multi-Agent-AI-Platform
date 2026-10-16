import { checkAgentLimit } from "../config/agentLimit.js"
import { getModel } from "../config/llmModels.js"
import { deductCredits } from "../utils/deductCredits.js"

export const codeAgent = async(state)=>{
    try {
        await checkAgentLimit(state.userId,"coding")
        const intentLLM = await getModel("intent")
        const codeLLM = await getModel("coding")
        const intentResponse = await intentLLM.invoke(`
            You are an intent classifier
            return only one of the folllowing values : 
            CODE_GENERATION
            CODE_REVIEW
            CODE_EXPLANATION
            DEBUGGING
            OPTIMIZATION
            CONVERSION
            DOCUMENTATION

            User Request: ${state.prompt}
        `)

        const intent = intentResponse.content
        console.log(intent)

        if(intent == "CODE_GENERATION"){
            const prompt = `
            you are cortexai coding agent
            generate the requested project.

            default stack : 
            -html
            -css
            -javascript

            use react/next.js/vue only if explicitly requested

            rules:
            -responsive
            -modern ui
            -css variables
            -flexbox/grid
            -smooth scroll
            -hover effects
            -beautiful spacing
            -single page unless user asks otherwise
            IMAGES : 
            -always use real unsplash images
            -never use placeholders

            return only valid json
            schema:
            {
                "files":[
                    {
                        "name":"index.html",
                        "content":"..."
                    },
                    {
                        "name":"style.css",
                        "content":"..."
                    },
                    {
                        "name":"script.js",
                        "content":"..."
                    }
                ]
            }
            
            rules:
            -output must start with{
            -output must end with }
            -no markdown
            -no explanation
            -no extra text
            -no \`\`\`
            -never mention intent

            user request:${state.prompt}
            `
            const response = await codeLLM.invoke(prompt)
            const data = JSON.parse(response.content)

            await deductCredits(state.userId,"coding")

            return{
                ...state,
                aiResponse:"Code generated successfully!",
                artifacts:[
                    {
                        id:Date.now(),
                        type:"Project",
                        files:data.files || [],
                        title:state.prompt
                    }
                ]
            }
        }

        const res = await codeLLM.invoke(`
            the user's request is:
            ${intent}

            return markdown only
            never generate project files
            use headings like : 
            #overview
            ##explanation
            ##problems
            ##improvements
            ##best practices
            ##optimized code(if needed)

            user request : ${state.prompt}
        `)

        const data = res.content

        await deductCredits(state.userId,"coding")
        return{
            ...state,
            aiResponse:data,
            artifacts:[]
        }
    } catch (error) {
        console.log(error)
        return{
            ...state,
            aiResponse:error?.data?.message || "Failed to generate code"
        }
    }
    
}