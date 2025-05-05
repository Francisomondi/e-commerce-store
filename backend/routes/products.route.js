import express from "express"
import { getProducts, getSingleProduct,getFeaturedProducts } from "../controllers/products.controller.js"
import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protectedRoute, adminRoute, getProducts)
router.get("/featured", getFeaturedProducts)
router.get("/:id", getSingleProduct)

export default router