import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  try {
    // Read the JSON file
    const jsonData = fs.readFileSync("formatted_products.json", "utf8");
    const products = JSON.parse(jsonData);

    // Create categories with their IDs
    const categories = [
      {
        id: 1,
        name: "Вітровки",
        description: "Легка верхня одяг для захисту від вітру та дощу",
      },
      {
        id: 2,
        name: "Куртки",
        description: "Тепла верхня одяг для холодної пори року",
      },
      {
        id: 3,
        name: "Худі",
        description: "Зручний одяг з капюшоном для повсякденного використання",
      },
      {
        id: 4,
        name: "Кросівки",
        description: "Зручне взуття для спорту та повсякденного використання",
      },
      {
        id: 5,
        name: "Спортивні штани",
        description: "Зручний одяг для спорту та активного відпочинку",
      },
    ];

    // Create categories
    for (const category of categories) {
      try {
        await prisma.category.upsert({
          where: { id: category.id },
          update: { name: category.name, description: category.description },
          create: category,
        });
        console.log(`✅ Category created/updated: ${category.name}`);
      } catch (error) {
        console.error(
          `❌ Error creating category ${category.name}:`,
          error.message
        );
      }
    }

    // Group products by category
    const productsByCategory = {};
    categories.forEach((category) => {
      productsByCategory[category.id] = products.filter(
        (p) => p.categoryId === category.id
      );
    });

    // Process each product
    for (const product of products) {
      try {
        // Check if this product should have discount
        const categoryProducts = productsByCategory[product.categoryId] || [];
        const productIndex = categoryProducts.findIndex(
          (p) => p.name === product.name
        );
        const shouldHaveDiscount = productIndex < 25; // First 25 products in each category get discount

        await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            color: product.color || [],
            size: product.size,
            brand: product.brand || "AGER",
            price: parseFloat(product.price),
            stockQuantity: parseInt(product.stockQuantity) || 10,
            mainImage: product.mainImage ? `/img/${product.mainImage}` : null,
            galleryImages: product.galleryImages
              ? product.galleryImages.map((img) => `/img/${img}`)
              : [],
            categoryId: product.categoryId,
            averageRating: parseFloat(product.averageRating) || 0,
            reviewCount: parseInt(product.reviewCount) || 0,
            discountPrice: shouldHaveDiscount
              ? parseFloat(product.price) * 0.8
              : null, // 20% discount
            isDiscountActive: shouldHaveDiscount,
          },
        });
        console.log(
          `✅ Added product: ${product.name} (Discount: ${shouldHaveDiscount})`
        );
      } catch (error) {
        console.error(
          `❌ Error adding product ${product.name}:`,
          error.message
        );
      }
    }

    console.log("✅ Seed2 успішно завершено");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
