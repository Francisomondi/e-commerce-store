import {create} from "zustand"
import axios from "../lib/axios.js"
import { toast } from "react-hot-toast"
import { Navigate} from "react-router-dom"

export const useUserStore = create((set,get) => ({
    user: null,
    loading: false,
    checkingAuth: true,

    signup: async({name,email,password,confirmPassword})=>{
        set({loading: true})
        if(password !== confirmPassword){
            set({loading: false})
            return toast.error("Passwords do not match")
        }
        try {
            const res = await axios.post("/auth/signup",{name,email,password})

             localStorage.setItem("token", res.data.token);
            set({user: res.data.user,loading: false})
            return toast.success(res.data.message)
        } catch (error) {
            set({loading: false})
            return toast.error(error.response.data.message || "Something went wrong")    
        }
    },

    login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });

			set({ user: res.data, loading: false });
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},
 


Logout: async () => {
	try {
		await axios.post("/auth/logout", {}, { withCredentials: true });
        
		set({ user: null });

		toast.success("Logged out successfully");

		
	} catch (error) {
		toast.error(error.response?.data?.message || "An error occurred during logout");
	}
},




    checkAuth: async()=>{
        set({checkingAuth: true})
        try {
            const res = await axios.get("/auth/profile")
            
            set({user: res.data,checkingAuth: false})
            console.log(res.data)
        } catch (error) {
            set({checkingAuth: false,user: null})
        }
    }
}))


