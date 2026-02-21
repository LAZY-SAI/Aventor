import { Router } from "express";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const interestRoute = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const BACKEND = process.env.BACKEND_URL;

//get all interest
interestRoute.get("/admin/interests", async (req, res) => {
  const token = req.headers.authorization;

  try {
    const response = await axios.get(`${BACKEND}/api/v1/interests`, {
      headers: {
        authorization: token,
      },
    });
    res.status(201).json(response.data);
    console.log(response);
  } catch (error) {
    console.error(error);
  }
});

//create new interest 
interestRoute.post('/admin/create/interest', async(req,res)=>{
    const token = req.headers.authorization
    const body = req.body

    try{
        const response = await axios.post(`${BACKEND}/api/v1/interests`,
            body,
            {
                headers:{
                    authorization:token
                }
            }

        )
    }
    catch(error)
    {
        console.error(error)
    }
})

export default interestRoute;
