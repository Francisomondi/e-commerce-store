import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js"
import cors from "cors"

import cookieParser from 'cookie-parser';
import productsRoute from "./routes/products.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000


// Allow requests from your Vite frontend
app.use(cors({
  origin: "http://localhost:5173", // React app origin
  credentials: true // If you're using cookies or auth headers
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/products", productsRoute)
app.use("/api/cart", cartRoutes)
app.use("/api/coupon", couponRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/analytics", analyticsRoutes)

console.log(process.env.PORT)

app.listen(PORT,()=>{
    console.log(`Server runing on http://localhost:${PORT}`)

    connectDB()
} )