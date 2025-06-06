import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
  // Create users
  const users = [
    {
      name: "Test 1",
      email: "123@gmail.com",
      passwordHash: await bcrypt.hash("12345678F", 10),
      role: "user",
    },
    {
      name: "Test 2",
      email: "123123@gmail.com",
      passwordHash: await bcrypt.hash("12345678F", 10),
      role: "user",
    },
    {
      name: "Admin",
      email: "admin@gmail.com",
      passwordHash: await bcrypt.hash("12345678F", 10),
      role: "admin",
    },
  ];

  // Create users in database
  await prisma.$transaction(
    users.map((user) => prisma.user.create({ data: user }))
  );

  const categories = [
    "Футболки",
    "Джинси",
    "Худі",
    "Сорочки",
    "Куртки",
    "Сукні",
    "Взуття",
    "Аксесуари",
  ];

  // Створюємо категорії через Prisma Client (вони не містять Unsupported полів)
  await prisma.$transaction(
    categories.map((name) => prisma.category.create({ data: { name } }))
  );

  const allCategories = await prisma.category.findMany();

  for (const category of allCategories) {
    const products = [
      {
        name: `${category.name} Basic`,
        description: `Базова модель ${category.name}`,
        color: ["Чорний", "Білий"],
        size: "M",
        brand: "Basic Brand",
        price: 299,
        stockQuantity: 10,
        image: `/products/${category.name.toLowerCase()}-basic.jpg`,
        categoryId: category.id,
      },
      {
        name: `${category.name} Premium`,
        description: `Преміум модель ${category.name}`,
        color: ["Синій", "Сірий"],
        size: "L",
        brand: "Premium Brand",
        price: 599,
        stockQuantity: 15,
        image: `/products/${category.name.toLowerCase()}-premium.jpg`,
        categoryId: category.id,
      },
      {
        name: `${category.name} Limited`,
        description: `Лімітована серія ${category.name}`,
        color: ["Червоний", "Зелений"],
        size: "S",
        brand: "Limited Brand",
        price: 899,
        stockQuantity: 5,
        image: `/products/${category.name.toLowerCase()}-limited.jpg`,
        categoryId: category.id,
      },
    ];

    // Вставляємо продукти через Prisma Client замість raw SQL
    for (const product of products) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          color: product.color,
          size: product.size,
          brand: product.brand,
          price: product.price,
          stockQuantity: product.stockQuantity,
          image: product.image,
          categoryId: product.categoryId,
        },
      });
    }
  }

  console.log("✅ Seed успішно завершено");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
