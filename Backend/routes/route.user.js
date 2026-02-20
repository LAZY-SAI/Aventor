import { Router } from 'express'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'  

const userRoute = Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, "../.env") })

const BACKEND = process.env.BACKEND_URL

userRoute.get('/admin/profile/:id', async (req, res) => {
    const token = req.headers.authorization 
    const { id } = req.params
    try {
        const response = await axios.get(`${BACKEND}/api/v1/users/${id}`, {
            headers: {
                Authorization: token,
                "ngrok-skip-browser-warning": "true"  
            }
        })
        res.status(200).json(response.data)  
        console.log(response)
    } catch (error) {
        console.error(error)
        res.status(error.response?.status || 500).json({ message: "Failed to fetch profile" }) // ✅ always respond
    }
})

export default userRoute