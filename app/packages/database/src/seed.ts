import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    { name: 'Wireless Mouse', description: 'A smooth and ergonomic wireless mouse for everyday use.', price: 29.99 },
    { name: 'Bluetooth Headphones', description: 'Noise-cancelling Bluetooth headphones with great sound quality.', price: 89.99 },
    { name: 'Gaming Laptop', description: 'A high-performance laptop with powerful GPU for gaming and rendering.', price: 1499.99 },
    { name: 'USB-C Cable', description: 'Fast-charging USB-C cable for various devices.', price: 15.99 },
    { name: 'Smartwatch', description: 'A smartwatch with fitness tracking and heart rate monitoring.', price: 199.99 },
    { name: '4K Monitor', description: 'A 27-inch 4K monitor with vibrant color reproduction.', price: 349.99 },
    { name: 'Mechanical Keyboard', description: 'A high-quality mechanical keyboard with customizable RGB lighting.', price: 109.99 },
    { name: 'Webcam', description: 'A high-definition webcam for video calls and streaming.', price: 59.99 },
    { name: 'Bluetooth Speaker', description: 'Portable Bluetooth speaker with amazing sound quality.', price: 49.99 },
    { name: 'Noise-Cancelling Earbuds', description: 'Compact and portable noise-cancelling earbuds for on-the-go use.', price: 129.99 },
    { name: 'Wireless Charger', description: 'Fast wireless charger compatible with various devices.', price: 39.99 },
    { name: 'Laptop Stand', description: 'Adjustable laptop stand to improve ergonomics.', price: 29.99 },
    { name: 'Portable SSD', description: 'High-speed portable SSD with 1TB storage for data transfer.', price: 149.99 },
    { name: 'Ergonomic Office Chair', description: 'A comfortable office chair with adjustable height and lumbar support.', price: 219.99 },
    { name: 'Gaming Headset', description: 'A premium gaming headset with surround sound and noise cancellation.', price: 99.99 },
    { name: 'Smart Light Bulb', description: 'Energy-efficient smart LED bulb with customizable color settings.', price: 29.99 },
    { name: 'Fitbit Tracker', description: 'A fitness tracker with heart rate monitoring and step tracking.', price: 129.99 },
    { name: 'Laptop Backpack', description: 'A stylish and durable backpack with multiple compartments.', price: 49.99 },
    { name: 'Drone', description: 'A high-definition camera drone with long battery life.', price: 499.99 },
    { name: 'Electric Kettle', description: 'A stainless steel electric kettle with rapid boiling technology.', price: 39.99 },
  ];

  await prisma.product.createMany({
    data: products,
  });

  console.log('20 Products have been added to the database.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//   const productIds = [
//     '67c8830b7ef1b848ac52ebec',
//     '67c8830b7ef1b848ac52ebed',
//     '67c8830b7ef1b848ac52ebee',
//   ];

//   for (const productId of productIds) {
//     await prisma.inventory.create({
//       data: {
//         productId: productId,
//         location: 'bangalore',
//         stock: 10,
//       },
//     });
//     console.log(`Inventory added for product: ${productId}`);
//   }

//   console.log('All products added to inventory.');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
