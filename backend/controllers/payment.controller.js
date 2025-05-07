export const createCheckoutSession = async (req, res) => {
    try {
        const {products, couponCode} = req.body

       if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ message: "Invalid cart data" })
       }

       let totalAmount = 0
       const lineItems = products.map(product => {
           const amount = Math.round(product.price * 100 )// convert to cents
           totalAmount += amount * product.quantity
           return {
               price_data: {
                   currency: "KES",
                   product_data: {
                       name: product.name,
                       images: [product.image]
                   },
                   unit_amount: amount
               },
               quantity: 1
           }
       })

       let coupon = null
       if (couponCode) {
          coupon = await coupon.findOne({code: couponCode, userId: req.user._id, isActive: true})
          if (coupon) {
              totalAmount -= Math.round(totalAmount * (coupon.discount / 100))
          }
       }
       const session = await stripe.checkout.sessions.create({
           payment_method_types: ["card"],
           line_items: lineItems,
           mode: "payment",
           success_url: `${process.env.CLIENT_URL}/success`,
           cancel_url: `${process.env.CLIENT_URL}/cancel`,
           metadata: {
               userId: req.user._id,
               couponId: coupon?._id
           }
       })
       res.json({ url: session.url })
       
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}