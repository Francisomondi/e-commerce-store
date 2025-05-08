import stripe from "../lib/stripe.js"
import couponModel from "../models/coupon.model.js"
import Order from "../models/order.model.js"

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
               couponCode:couponCode || "",
               products: JSON.stringify(
                products.map(product => ({
                    id: product.id,
                    quantity: product.quantity,
                    price: product.price
                }))
               )
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

async function createNewCoupon(userId) {
    const newCoupon = new couponModel({
        
        code: "GIFT" + Math.random().toString(36).substring(2,8).toUpperCase(),
        discount:10,
        expiryDate: new Date(Date.now() + 30 + 24 * 60 * 60 * 1000),
        userId: userId
    })

    await newCoupon.save()
    return newCoupon

}


export const successPayment = async (req, res) => {
    try {
        const {session_id} = req.body
        const session = await stripe.checkout.sessions.retrieve(session_id)
        if (session.payment_status === "paid") {
            if (session.metadata.couponCode) {
                const coupon = await couponModel.findOneAndUpdate({code: session.metadata.couponCode,
                    userId: session.metadata.userId}, {
                        isActive: false})                    
               
            }
            //create new order
            const products = JSON.parse(session.metadata.products)
            const order = await Order.create({
                user: session.metadata.userId,
                products: products.map(product => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price
                })),
                totalAmount: session.amount_total,
                stripeSessionId: session_id
            })
            await order.save()
            res.status(200).json({
                success: true,
                message: "Payment success",
                orderId: order._id
            })
        }
       
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }   
}