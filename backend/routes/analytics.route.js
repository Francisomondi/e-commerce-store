import express from "express"
import { getAnalytics } from "../controllers/analytics.controller.js"
import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js"

const router = express.Router()  

router.get("/", protectedRoute, adminRoute, getAnalytics)

export default router       