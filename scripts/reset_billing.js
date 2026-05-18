import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const shop = "devs-tore-2.myshopify.com";

async function main() {
  console.log(`Deleting billing record for shop: ${shop}...`);
  const deleted = await prisma.billingDetail.deleteMany({
    where: { shop },
  });
  console.log(`Deleted ${deleted.count} billing record(s).`);
  
  if (deleted.count === 0) {
      // Try to list all to see if I define the shop wrong
      const all = await prisma.billingDetail.findMany();
      console.log("Existing billing records:", all);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
