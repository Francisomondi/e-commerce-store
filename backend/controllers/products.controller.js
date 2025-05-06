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

export const createProduct = async (req,res)=>{
    try {
        const {name, description, price, image, category} = req.body
        let cloudinaryResponse = null
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, {
                folder: "products"
            })
        }
        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.url ? cloudinaryResponse.url : "",
            category
        })
        res.status(200).json({message: "Product created successfully"})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const deleteProduct = async (req,res)=>{
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if (!product) {
            return res.status(404).json({message: "Product not found"})
        }
        if (product.image) {
            try {
                await cloudinary.uploader.destroy(`products/${product.image.split("/").pop().split(".")[0]}`)
                console.log("deleted image from cloudinary")
            } catch (error) {
                console.log("errr deleting image", error.message)
            }
           
        }

        res.status(200).json({message: "Product deleted successfully"})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const getRecommendedProducts = async (req,res)=>{
    try {
        const products = await Product.aggregate([
            {$sample: {size: 3}},
            {$lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }},
            {$project: {
                _id: 1,
                name: 1,
                description: 1,
                price: 1,
                image: 1
                
            }}
        ])
        res.status(200).json({message: "Products fetched successfully"})
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const getProductsBycategory = async (req,res)=>{
    try {
        const { category } = req.params
        const products = await Product.find({category}).lean()
        res.status(200).json({message: "Products fetched successfully"}, products)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const toggleFeaturedProduct = async (req,res)=>{
    try {
        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(404).json({message: "Product not found"})
        }
        product.isfeatured = !product.isfeatured
        const updatedProduct = await product.save()
        await updatedFeaturedProductsCache()
        res.status(200).json({message: "Product updated successfully"},updatedProduct)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

async function updatedFeaturedProductsCache() {
    const featured_products = await Product.find({isfeatured: true}).lean()
    await redis.set("featured_products", JSON.stringify(featured_products))
}