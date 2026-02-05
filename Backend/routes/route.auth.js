import {Router} from 'express'
import axios from 'axios'
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url"
const authRoute = Router()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });
const BACKEND = process.env.BACKEND_URL 


// authRoute.post("/signup",async(req,res)=>{
//     const data = req.body
//     try{
//         const response = await axios.post(`${BACKEND}/api/auth/register`,
//             data,
//             {
//                 headers:{
//                 "content-type":"application/json"
//             }
//             }
//         )
//         res.sendStatus(200).json({message:"user registered successfuly"})
//         console.log(response)
//     }
//     catch(error)
//     {
//         console.error(error)
//     }
// })

authRoute.post('/auth',async(req,res)=>{
        try{
            const response = await axios.post(`${BACKEND}/api/auth/login`, req.body)

            res.status(200).json(response.data)
        }
        catch(error){
            console.error(error)
            res.status(500).json({message:"Authentication failed"})
        }
})

export default authRoute