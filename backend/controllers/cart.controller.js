import Product from "../models/product.model.js"

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body
        const user = req.user

        const existingItem = await user.cartItems.find(item=> item.id === productId)
        if (existingItem) {
            existingItem.quantity += 1
        } else {
            user.cartItems.push(productId )
        }
        await user.save()
        res.status(200).json( user.cartItems )

    } catch (error) {
        console.log("error adding to cart", error.message)
        res.status(500).json({ message: error.message })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params
        const user = req.user
        if (!productId) {
            user.cartItems = []
        } else {
           user.cartItems = user.cartItems.filter(item => item.id !== productId) 
        }
        await user.save()

        res.status(200).json({ message: "Product removed from cart successfully", cartItems: user.cartItems })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const getCartProducts = async (req, res) => {
	try {
		const products = await Product.find({ _id: { $in: req.user.cartItems } });

		// add quantity for each product
		const cartItems = products.map((product) => {
			const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
			return { ...product.toJSON(), quantity: item.quantity };
		});

		res.json(cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId, quantity } = req.body
        const user = req.user
        const existingItem = await cartItems.find(item => item.id === productId)
        if (existingItem && quantity === 0) {
            user.cartItems = user.cartItems.filter(item => item.id !== productId)
            await user.save()   
            return res.status(200).json( user.cartItems )

        } else {
           res.status(404).json({ message: "Product not found" }) 
        }
        existingItem.quantity = quantity
        await user.save()

        res.status(200).json({ message: "Product quantity updated successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
