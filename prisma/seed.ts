import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bazario.test' },
    update: {},
    create: { name: 'Admin', email: 'admin@bazario.test', passwordHash, role: 'ADMIN' },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@bazario.test' },
    update: {},
    create: { name: 'Anita Textiles', email: 'seller@bazario.test', passwordHash, role: 'SELLER' },
  });

  await prisma.user.upsert({
    where: { email: 'customer@bazario.test' },
    update: {},
    create: { name: 'Rahul Sharma', email: 'customer@bazario.test', passwordHash, role: 'CUSTOMER' },
  });

  const categoryNames = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports & Fitness', 'Beauty'];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({
        where: { slug: name.toLowerCase().replace(/[^\w]+/g, '-') },
        update: {},
        create: { name, slug: name.toLowerCase().replace(/[^\w]+/g, '-') },
      })
    )
  );

  const sampleProducts = [
    { title: 'Wireless Bluetooth Earbuds', price: 149900, mrp: 249900, cat: 0, img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600' },
    { title: 'Smart Fitness Band', price: 199900, mrp: 299900, cat: 0, img: 'https://images.unsplash.com/photo-1575311373937-64ce70e0b8c1?w=600' },
    { title: "Men's Cotton Kurta", price: 89900, mrp: 149900, cat: 1, img: 'https://images.unsplash.com/photo-1622470953794-aa9c70b0fb9d?w=600' },
    { title: 'Non-stick Cookware Set', price: 249900, mrp: 399900, cat: 2, img: 'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=600' },
    { title: 'The Alchemist — Paperback', price: 29900, mrp: 39900, cat: 3, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600' },
    { title: 'Yoga Mat, Anti-Slip', price: 69900, mrp: 99900, cat: 4, img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600' },
    { title: 'Herbal Face Wash 150ml', price: 24900, mrp: 34900, cat: 5, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600' },
    { title: '4K Action Camera', price: 599900, mrp: 799900, cat: 0, img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600' },
  ];

  for (const p of sampleProducts) {
    await prisma.product.create({
      data: {
        title: p.title,
        description: `${p.title} — quality guaranteed, ships across India with easy returns.`,
        price: p.price,
        mrp: p.mrp,
        stock: 50,
        images: [p.img],
        categoryId: categories[p.cat].id,
        sellerId: seller.id,
      },
    });
  }

  console.log('Seed complete.');
  console.log('Login as admin@bazario.test / seller@bazario.test / customer@bazario.test, password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
