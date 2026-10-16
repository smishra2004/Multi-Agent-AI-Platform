import express from "express"
import dotenv from "dotenv"
import morgan from "morgan";
import proxy from "express-http-proxy"
import cookieParser from "cookie-parser";
import cors from "cors"
import getCurrentUser  from "./controllers/user.controller.js";
import protect from "./middlewares/auth.middleware.js"
import { proxyWithHeader } from "./utils/proxyWithHeader.js";
dotenv.config()

const port = process.env.PORT

const app = express()

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use(morgan("dev"))
app.use(cookieParser())

app.use("/api/auth",proxy(process.env.AUTH_SERVICE_URL))
app.use("/api/chat",protect,proxyWithHeader(process.env.CHAT_SERVICE_URL))
app.use("/api/agent",protect,proxyWithHeader(process.env.AGENT_SERVICE_URL))
app.use("/api/billing",protect,proxyWithHeader(process.env.BILLING_SERVICE_URL))
app.use("/api/me",protect,getCurrentUser)

app.get("/",(req,res)=>{
    res.json({message:"hello from gateway"})
})

app.listen(port,()=>{
    console.log(`Gateway started listening at port ${port}`)
})