import couponModel from "../models/coupon.model.js"

export const createCoupon = async (req, res) => {}

export const getCoupons = async (req, res) => {

    try {
        const coupon = await couponModel.findOne({userId: req.user._id,isActive: true})
        res.json(coupon || null) 

    } catch (error) {
        console.log("error fetching coupons", error.message)
        res.status(500).json({ message: error.message })
    }
}

export const updateCoupon = async (req, res) => {}

export const deleteCoupon = async (req, res) => {}

export const validateCoupon = async (req, res) => {
    try {
        const {code} = req.body
        const coupon = await couponModel.findOne({code: code, userId: req.user._id, isActive: true})
        if (!coupon) {
            return res.status(404).json({message: "Coupon not found"})
        }
        if (coupon.expiryDate < Date.now()) {
            coupon.isActive = false
            await coupon.save()
            return res.status(400).json({message: "Coupon expired"})
        }
        res.json({
            message: "Coupon applied successfully",
            discount: coupon.discount,
            code: coupon.code
        })
    } catch (error) {
        console.log("error validating coupon", error.message)
        res.status(500).json({ message: error.message })
    }
}
