import express from "express"
import { 
    getProducts, 
    getSingleProduct,
    getFeaturedProducts, 
    createProduct, 
    deleteProduct,
    getRecommendedProducts,
    getProductsByCategory,
    toggleFeaturedProduct
} from "../controllers/products.controller.js"

import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protectedRoute, adminRoute, getProducts)
router.get("/featured", getFeaturedProducts)
router.get("/recommendation", protectedRoute, getRecommendedProducts)
router.get("/category/:category", getProductsByCategory)
router.post("/", protectedRoute, adminRoute, createProduct)
router.get("/:id", getSingleProduct)
router.delete("/:id", protectedRoute, adminRoute,deleteProduct)
router.patch("/:id", protectedRoute, adminRoute,toggleFeaturedProduct)

export default router