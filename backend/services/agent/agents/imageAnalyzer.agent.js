import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import fs from "fs/promises"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const imageAnalyzer=async(state)=>{
    await checkAgentLimit(state.userId,"image")
    try {
        const llm = await getModel("imageAnalyzer")

        const imageBuffer = await fs.readFile(state.file.path)
        const base64Image = imageBuffer.toString("base64")

        const messages = [
            new SystemMessage(
                `
                you are cortex ai image analyzer agent
                rules:
                -answer only the uploaded image
                -answer the user's question accurately
                -if the text exists in image extract it
                -if charts or tables exist explain them
                -if something is unclear say so
                -use markdown when helpful
                -do not hallucinate
                `
            ),
            new HumanMessage(
                {
                    content:[
                        {
                            type:"text",
                            text:state.prompt || "analyze the image"
                        },
                        {
                            type:"image_url",
                            "image_url":{
                                url:`data:${state.file.mimetype};base64,${base64Image}`
                            }
                        }
                    ]
                }
            )
        ]

        const response = await llm.invoke(messages)
        await deductCredits(state.userId,"vision")
        return{
            ...state,
            aiResponse:response.content
        }

    } catch (error) {
        console.log(error)
        return{
            ...state,
            aiResponse:error?.data?.message || "Failed to analyze image"
        }
    }
    finally{
        fs.unlink(state.file.path)
    }
}