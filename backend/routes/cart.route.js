import express from "express"
import { addToCart, removeFromCart, getCartProducts, updateQuantity } from "../controllers/cart.controller.js"
import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/", protectedRoute, addToCart)
router.get("/", protectedRoute, getCartProducts)
router.put("/:id", protectedRoute, updateQuantity)
router.delete("/:id", protectedRoute, removeFromCart)

export default router