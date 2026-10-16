import fs from "fs"
import {PDFParse} from "pdf-parse"
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import { vectorStore } from "../config/vectorDb.js"
import { getModel } from "../config/llmModels.js"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const pdfRag= async(state)=>{
    await checkAgentLimit(state.userId,"pdf")
    try {
        const buffer = fs.readFileSync(state.file.path)
        const pdf = new PDFParse({
            data:buffer
        })

        const result = await pdf.getText()
        const text = result.text

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize:1000,
            chunkOverlap:200
        })

        const docs = await splitter.createDocuments([text])
        const collectionName = `pdf-${Date.now()}`
        const store = await vectorStore(docs,collectionName)

        const relevantDocs = await store.similaritySearch(state.prompt,5)

        const context = relevantDocs.map(d=>d.pageContent).join("\n\n")

        const llm = await getModel("pdfRag")

        const messages=[
            new SystemMessage(
                `
                you are cortexai pdf assistant
                rules:
                -answer ONLY from the uploaded pdf
                -never make up information
                -if the answer is not present in the pdf reply:"i couldn't find this information in the uploaded pdf"
                -use markdown formatting
                `
            ),
            new HumanMessage(
                `
                Context:${context}
                Question:${state.prompt}
                `
            )
        ]

        const response = await llm.invoke(messages)
        await deductCredits(state.userId,"pdf")
        return{
            ...state,
            aiResponse:response.content
        }
    } catch (error) {
        console.log(error)
        return{
            ...state,
            aiResponse:error?.data?.message || "Failed to generate PDF"
        }
    }finally{
        await fs.unlinkSync(state.file.path)
    }
}