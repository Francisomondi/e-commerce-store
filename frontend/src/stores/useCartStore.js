import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";


export const useCartStore = create((set,get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
   
    addToCart: async (product) => {
        set({ loading: true });
        try {
           await axios.post("/cart", { productId: product._id }, { withCredentials: true });
            toast.success("Product added to cart");

            set((prevState) => {
				const existingItem = prevState.cart.find((item) => item._id === product._id);
				const newCart = existingItem
					? prevState.cart.map((item) =>
							item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
					  )
					: [...prevState.cart, { ...product, quantity: 1 }];
				return { cart: newCart };
			});
			get().calculateTotals();

        } catch (error) {
            set({ loading: false });
            toast.error(error?.response?.data?.message || "An error occurred");
        }
    },  

    getCartItems: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/cart" );
            set({ cart: res.data });
            set({ loading: false });
            get().calculateTotals();

        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "An error occurred");
        }
    },

    calculateTotals: () => {
		const { cart, coupon } = get();
		const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
		let total = subtotal;

		if (coupon) {
			const discount = subtotal * (coupon.discountPercentage / 100);
			total = subtotal - discount;
		}

		set({ subtotal, total });
	}
}));

