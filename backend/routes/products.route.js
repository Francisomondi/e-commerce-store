import express from "express"
import { getProducts, getSingleProduct,getFeaturedProducts, createProduct, deleteProduct} from "../controllers/products.controller.js"
import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protectedRoute, adminRoute, getProducts)
router.get("/featured", getFeaturedProducts)
router.post("/", protectedRoute, adminRoute, createProduct)
router.get("/:id", getSingleProduct)
router.delete("/:id", protectedRoute, adminRoute,deleteProduct)

export default router