import {QdrantVectorStore} from "@langchain/qdrant"
import dotenv from "dotenv"
import { embeddings } from "./embeddings.js"
dotenv.config()

export const vectorStore = async(docs,collctionName)=>{
    return await QdrantVectorStore.fromDocuments(docs,embeddings,{
        url: process.env.QDRANT_ENDPOINT,
        apiKey: process.env.QDRANT_API_KEY,
        collctionName
    })
}