import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const categories = ['Футболки', 'Джинси', 'Худі', 'Сорочки', 'Куртки', 'Сукні', 'Взуття', 'Аксесуари'];

  await prisma.category.createMany({
    data: categories.map(name => ({ name }))
  });

  const allCategories = await prisma.category.findMany();

  for (const category of allCategories) {
    const products = [
      {
        name: `${category.name} Basic`,
        description: `Базова модель ${category.name}`,
        color: ['Чорний', 'Білий'],
        size: 'M',
        brand: 'Basic Brand',
        price: 299,
        stockQuantity: 10,
        image: `/products/${category.name.toLowerCase()}-basic.jpg`,
        categoryId: category.id
      },
      {
        name: `${category.name} Premium`,
        description: `Преміум модель ${category.name}`,
        color: ['Синій', 'Сірий'],
        size: 'L',
        brand: 'Premium Brand',
        price: 599,
        stockQuantity: 15,
        image: `/products/${category.name.toLowerCase()}-premium.jpg`,
        categoryId: category.id
      },
      {
        name: `${category.name} Limited`,
        description: `Лімітована серія ${category.name}`,
        color: ['Червоний', 'Зелений'],
        size: 'S',
        brand: 'Limited Brand',
        price: 899,
        stockQuantity: 5,
        image: `/products/${category.name.toLowerCase()}-limited.jpg`,
        categoryId: category.id
      }
    ];

    await prisma.product.createMany({ data: products });
  }

  console.log('✅ Seed успішно завершено');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
