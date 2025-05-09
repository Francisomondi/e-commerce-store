import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, "Name is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim:true
    },
    password:{
        type: String,
        required: [true,"password is required"],
        minlength: [6,"password must be atleast 6 characters long1"]
    },
    cartItems: [
        {quantity:{ 
            type: Number,
            default: 1
        },
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        }}
    ],

    role: {
         type: String,
         enum:["customer", "admin"],
         default: "customer"

      },

      //createdAt updatedAt
   


},
    {
        timestamps: true
    }
)



//hashing password
 userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()

        try{
            const salt = await bcrypt.genSalt(10)
            this.password = await bcrypt.hash(this.password, salt)
            next()
        }catch(error){
            next(error)
        }
 })

 userSchema.methods.comparePassword = async function (password){
    return bcrypt.compare(password, this.password)
 }

const User = mongoose.model("User", userSchema)

export default User