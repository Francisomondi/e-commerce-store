import Product from "../models/product.model.js"

export const getProducts = async (req,res)=>{
    try {
        const products = await Product.find({})
        res.status(200).json({message: "Products fetched successfully"})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const getSingleProduct = async (req,res)=>{
    try {
        res.status(200).json({message: "Product fetched successfully"})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const getFeaturedProducts = async (req,res)=>{
    try {
        await redis.get("featured_products")
        if (featured_products) {
            return res.json(JSON.parse(featured_products))  
        }

        //if not in redis, fetch from mongo db
        const featured_products = await Product.find({isfeatured: true}).lean()

        if(!featured_products.length){
            return res.status(404).json({message: "No featured products found"})
        }
        await redis.set("featured_products", JSON.stringify(featured_products))

        res.status(200).json({message: "Products fetched successfully"}, featured_products)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}