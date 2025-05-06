import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js"

import cookieParser from 'cookie-parser';
import productsRoute from "./routes/products.route.js"
import cartRoutes from "./routes/cart.route.js"
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())
app.use(cookieParser());

app.use("/api/auth", authRoutes)
app.use("/api/products", productsRoute)
app.use("/api/cart", cartRoutes)

console.log(process.env.PORT)

app.listen(PORT,()=>{
    console.log(`Server runing on http://localhost:${PORT}`)

    connectDB()
} )