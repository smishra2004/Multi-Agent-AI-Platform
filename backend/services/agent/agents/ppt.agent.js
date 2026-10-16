import { getModel } from "../config/llmModels.js"
import { generatePPT } from "../utils/generatePPT.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const pptAgent = async(state)=>{
    await checkAgentLimit(state.userId,"ppt")
    try {
        const llm = await getModel("ppt")
        const prompt = `
        you are a proffessional presentation designer
        return only valid json

        format:
        {
            "title":"",
            "subtitle":"",
            "slides":[
                {
                    "title":"",
                    "points":["","",""]
                }
            ]
        }

        rules:
        -generate exactly 6 content slides
        -each slide should have 4-6 concise bullet points
        -no markdown
        -no explanation
        -no code block
        -return only json

        topic: ${state.prompt}
        `

        const res = await llm.invoke(prompt)
        const data = JSON.parse(res.content)
        await deductCredits(state.userId,"ppt")
        const ppt = await generatePPT(data)
        const buffer = await ppt.write({
            outputType:"nodebuffer"
        })

        const filename = `ppt-${Date.now()}.pptx`

        await uploadToS3(filename,buffer,"application/vnd.openxmlformats-officedocument.presentationml.presentation")
        const downloadUrl = await getFromS3(filename,24*60*60)

        return{
            ...state,
            aiResponse:`
#PPT generated
**${data.title}**
[Download PPT] (${downloadUrl})
Link expires in 10 minutes
            `
        }
    } catch (error) {
        console.log(error)
        return{
            ...state,
            aiResponse:error?.data?.message || "Failed to generate PPT"
        }
    }
}