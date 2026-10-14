import { Router } from "express"
import { ListTrmBackGroundJobs, startTrmBackGroundJobs, stopTrmBackGroundJobs } from "../controllers/trm.controller.js"



const trm = Router()

trm.post("/ListTrmBackGroundJobs",ListTrmBackGroundJobs)
trm.post("/startTrmBackGroundJob",startTrmBackGroundJobs)
trm.post("/stopTrmBackGroundJob",stopTrmBackGroundJobs)


export default trm
