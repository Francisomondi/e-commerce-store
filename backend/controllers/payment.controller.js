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
           success_url: `${process.env.CLIENT_URL}/success/session_id={CHECKOUT_SESSION_ID}`,
           cancel_url: `${process.env.CLIENT_URL}/cancel`,
           discounts: coupon ? [{coupon: await createStripeCoupon(coupon.discount)}] : [],
           metadata: {
               userId: req.user._id.toString,
               couponId: coupon?._id,
               couponCode:couponCode || ""
           }
       })
       if(totalAmount >= 200000){
           await createNewCoupon(req.user._id)
           res.status(200).json({id: session.id,totalAmount: totalAmount})
       }
       
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

async function createStripeCoupon(discount) {
    const stripeCoupon = await stripe.coupons.create({
        duration: "once",
        percent_off: discount
    })
    return stripeCoupon.id
}

async function createNewCoupon(userId, code, discount, expiryDate) {
    const newCoupon = new couponModel({
        
        code: "GIFT" + Math.random().toString(36).substring(2,8).toUpperCase(),
        discount:10,
        expiryDate: new Date(Date.now() + 30 + 24 * 60 * 60 * 1000),
        userId: userId
    })

    await newCoupon.save()
    return newCoupon

}