import { getModel } from "../config/llmModels.js"
import axios from "axios"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const imageAgent = async(state)=>{
    await checkAgentLimit(state.userId,"image")
    try {
        const llm = await getModel("image")
        const res = await llm.invoke(`
            you are an elite ai image prompt engineer
            convert the user request into a highly detailed image generation prompt

            requirements:
            -cinematic lightning
            -professional composition
            -ultra realistic
            -high detail
            -beautiful color palette
            -sharp focus
            -8k quality
            -photrealistic
            -depth of field
            -professional photography
            -stunning visuals

            return only the image prompt

            user request : ${state.prompt}
        `)

        const prompt = res.content.trim()

        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`

        const imageRes = await axios.get(imageUrl,{responseType:"arraybuffer"})
        await deductCredits(state.userId,"vision")

        const buffer = Buffer.from(imageRes.data)
        const filename = `image-${Date.now()}.png`

        await uploadToS3(filename,buffer,"image/png")
        const downloadUrl = await getFromS3(filename,24*60*60)

        return{
            ...state,
            aiResponse:`

![Generated Image](${downloadUrl})
[Download Image](${downloadUrl})

⌛Link expires in 10 minutes...
            `
        }
    } catch (error) {
        console.log(error)
        return{
            ...state,
            aiResponse:error?.data?.message || "Failed to generate image"
        }
    }
}