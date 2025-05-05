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