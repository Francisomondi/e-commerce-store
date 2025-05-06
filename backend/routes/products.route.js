import express from "express"
import { 
    getProducts, 
    getSingleProduct,
    getFeaturedProducts, 
    createProduct, 
    deleteProduct,
    getRecommendedProducts,
    getProductsBycategory,
    toggleFeaturedProduct
} from "../controllers/products.controller.js"

import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/", protectedRoute, adminRoute, getProducts)
router.get("/featured", getFeaturedProducts)
router.get("/recommendation", protectedRoute, getRecommendedProducts)
router.get("/category/:category", getProductsBycategory)
router.post("/", protectedRoute, adminRoute, createProduct)
router.get("/:id", getSingleProduct)
router.delete("/:id", protectedRoute, adminRoute,deleteProduct)
router.delete("/:id", protectedRoute, adminRoute,toggleFeaturedProduct)

export default router