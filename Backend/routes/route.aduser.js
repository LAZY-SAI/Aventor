import {Router} from 'express'
import axios from 'axios'
const adUser = Router()
const BACKEND = process.env.BACKEND_URL
adUser.post('/admin-users',(req,res)=>{

    const {username, description,from} = req.body

    console.log("data received:",req.body)
    if(!username || !description || !from){
        return res.status(400).json({message:"all fields are required"})
    }
    return res.status(201).json({message:"guide added successfully"})
})

adUser.get("/admin/userStats", async (req, res) => {
   const token = req.headers.authorization
    try {
        const response = await axios.get(
            `${BACKEND}/api/admin/stats`,
            {
                headers: {
                    Authorization:token
                }
            }
        );
        console.log("Response:", response.data) // ADD THIS
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Full error:", error.message); // CHECK THIS
        res.status(500).json({ message: "Failed to fetch admin users" });
    }
});
export default adUser