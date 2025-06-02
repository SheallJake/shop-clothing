import { toast } from "react-hot-toast";

export async function addToCart(product, quantity = 1) {
  try {
    // Check if user is authenticated
    const sessionRes = await fetch("/api/session");
    const sessionData = await sessionRes.json();
    const isAuthenticated = !!sessionData.user;

    if (isAuthenticated) {
      // Add to database for authenticated users
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add item to cart");
      }
    } else {
      // Add to localStorage for guests
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = storedCart.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        storedCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        storedCart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity,
        });
      }

      localStorage.setItem("cart", JSON.stringify(storedCart));
    }

    toast.success("Товар додано до кошика");
    return true;
  } catch (error) {
    console.error("Error adding to cart:", error);
    toast.error("Помилка при додаванні товару до кошика");
    return false;
  }
}
