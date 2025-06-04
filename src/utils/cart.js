import { toast } from "react-hot-toast";

export async function addToCart(product, quantity = 1) {
  try {
    if (!product || !product.id) {
      throw new Error("Invalid product data");
    }

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
          quantity: Number(quantity) || 1,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add item to cart");
      }
    } else {
      // Add to localStorage for guests
      const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingItemIndex = storedCart.findIndex(
        (item) =>
          item.id === product.id &&
          item.selectedSize === product.selectedSize &&
          item.selectedColor === product.selectedColor
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        storedCart[existingItemIndex].quantity =
          Number(storedCart[existingItemIndex].quantity) + Number(quantity);
      } else {
        // Add new item with all necessary data
        const productName = product.name || "Без назви";
        storedCart.push({
          id: product.id,
          name: productName,
          price: Number(product.price) || 0,
          image: product.image,
          category:
            typeof product.category === "object"
              ? product.category.name
              : product.category,
          quantity: Number(quantity) || 1,
          selectedSize: product.selectedSize,
          selectedColor: product.selectedColor,
          description: product.description,
          material: product.material,
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
