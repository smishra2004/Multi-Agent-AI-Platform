import express from "express"
import dotenv from "dotenv"
import proxy from "express-http-proxy"
import cookieParser from "cookie-parser";
import cors from "cors"
dotenv.config()

const port = process.env.PORT

const app = express()

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use(cookieParser())

app.use("/auth",proxy(process.env.AUTH_SERVICE_URL))

app.get("/",(req,res)=>{
    res.json({message:"hello from gateway"})
})

app.listen(port,()=>{
    console.log(`Gateway started listening at port ${port}`)
})