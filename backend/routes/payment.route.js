import express from "express"
import { createCheckoutSession } from "../controllers/payment.controller.js"
import { protectedRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/create-checkout-session", protectedRoute, createCheckoutSession) 
router.post("/success", protectedRoute, successPayment) 

export default router