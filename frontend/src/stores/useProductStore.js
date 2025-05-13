import { create } from "zustand";
import axios from "../lib/axios";
import toast from "react-hot-toast";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,
    setProducts: (products) => set({ products }),

    createProduct: async (product) => {
        set({ loading: true });
        try {
            const res = await axios.post("/products", product);
            set((prevState) =>({ products: [...prevState.products, res.data] }));
            set({ loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "An error occurred");
        }
    },

    fetchAllProducts: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/products");
            set({ products: res.data.products, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "An error occurred");
        }
    },
     deleteProduct: async (productId) => {
        set({ loading: true });
        try {
         await axios.delete(`/products/${productId}`, { withCredentials: true });
            set((prevProducts) => ({
                products: prevProducts.products.filter((product) => product._id !== productId),
                loading: false,
            }));
            toast.success("Product deleted successfully");
        } catch (error) {
            set({ loading: false });
            toast.error(error.response.data.message || "An error occurred");
        }
    },
  toggleFeaturedProduct: async (productId) => {
		set({ loading: true });
		try {
			const res = await axios.patch(`/products/${productId }`, 
                {}, { withCredentials: true });
			// this will update the isFeatured prop of the product
			set((prevProducts) => ({
				products: prevProducts.products.map((product) =>
					product._id === productId ? { ...product, isfeatured: res.data.isfeatured } : product
				),
				loading: false,
			}));
            toast.success(res.data.message || "Product updated successfully");
            
		} catch (error) {
			set({ loading: false });
			toast.error(error?.res?.data.message || "Failed to update product");
		}
	},
}));