import { getModel } from "../config/llmModels.js"

export const router = async (state)=>{

    if(state.agent && state.agent!=="auto"){
        return {
            ...state,
            agent: state.agent
        }
    }

    if(state.file){
        if(state.file.mimetype==="application/pdf"){
            return{
                ...state,
                agent:"pdfRag"
            }
        }

        if(state.file.mimetype.startsWith("image/")){
            return{
                ...state,
                agent:"imageAnalyzer"
            }
        }

    }

    const llm = await getModel("router")

    const prompt = `You are an **Agent Router**. Analyze the user's request and select the most appropriate agent.

    **Available agents:**

    * **chat** — General conversation, everyday questions, explanations, advice, and general knowledge.
    * **search** — Requests requiring internet access, online research, latest/current information, news, or web sources.
    * **coding** — Programming, code generation, debugging, scripts, algorithms, and software development.
    * **pdf** — Questions, analysis, creation, editing, or processing related to PDF files.
    * **ppt** — Questions, creation, editing, or processing related to PowerPoint/PPT presentations.
    * **image** — Image generation, creation, drawing, design, or image editing.

    Choose exactly **one** agent based on the user's primary intent.

    **Output ONLY one word:**
    chat, search, coding, pdf, ppt, or image.

    Do not provide explanations or anything else.

    User Query:
        ${state.prompt}
    `

    const response = await llm.invoke(prompt)

    return{
        ...state,
        agent:response.content.trim().toLowerCase()
    }
}