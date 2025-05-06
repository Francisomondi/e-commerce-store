import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    code: {
        type: String,
        required: [true, "Code is required"],
        unique: true
    },
    discount: {
        type: Number,
        min: [0, "Discount must be greater than 0"],
        max: [100, "Discount must be less than 100"],
        required: [true, "Discount is required"]
    },
    expiryDate: {
        type: Date,
        required: [true, "Expiry date is required"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
        unique: true
    }
}, {
    timestamps: true
})

export default mongoose.model("Coupon", couponSchema)   