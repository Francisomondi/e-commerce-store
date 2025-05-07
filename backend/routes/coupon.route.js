import express from "express"
import { createCoupon, deleteCoupon, getCoupons, updateCoupon ,validateCoupon} from "../controllers/coupon.controller.js"
import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/", protectedRoute, adminRoute, createCoupon)
router.get("/", protectedRoute, getCoupons)
router.put("/:id", protectedRoute, adminRoute, updateCoupon)
router.delete("/:id", protectedRoute, adminRoute, deleteCoupon)
router.get("/validate", protectedRoute, adminRoute, validateCoupon)

export default router