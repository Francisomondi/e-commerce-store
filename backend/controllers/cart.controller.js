export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body
        const user = req.user
        const existingItem = await cartItems.find(item=> item.id === productId)
        if (existingItem) {
            existingItem.quantity += 1
        } else {
            user.cartItems.push({ id: productId, quantity: 1 })
        }
        await user.save()
        res.status(200).json({ message: "Product added to cart successfully", cartItems: user.cartItems })

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

export const getCart = async (req, res) => {
    try {
        res.status(200).json({ message: "Cart fetched successfully" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

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
