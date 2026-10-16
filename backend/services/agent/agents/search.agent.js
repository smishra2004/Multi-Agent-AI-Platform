import { checkAgentLimit } from "../config/agentLimit.js"
import { searchTool } from "../config/tavily.js"
import { deductCredits } from "../utils/deductCredits.js"

export const searchAgent = async(state)=>{
    await checkAgentLimit(state.userId,"search")
    try {
        const results = await searchTool.invoke({
            query:state.prompt
        })
        await deductCredits(state.userId,"search") 
        console.log(results)
        return{
            ...state,
            searchResults:results,
            images:results.images
        }
    } catch (error) {
        console.log(error)
        return{
            ...state,
            aiResponse:error?.data?.message || "Failed to search"
        }
    }
}