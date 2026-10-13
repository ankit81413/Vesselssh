import { Router } from "express"
import { ListTrmBackGroundJobs, startTrmBackGroundJobs } from "../controllers/trm.controller.js"



const trm = Router()

trm.post("/ListTrmBackGroundJobs",ListTrmBackGroundJobs)
trm.post("/startTrmBackGroundJob",startTrmBackGroundJobs)


export default trm