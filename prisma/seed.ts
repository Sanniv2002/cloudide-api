import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "sanniv.nitkkr@gmail.com" },
    update: {},
    create: {
      email: "sanniv.nitkkr@gmail.com",
      name: "Sanniv",
      role: 'ADMIN'
    },
  });
  // const bob = await prisma.user.upsert({
  //   where: { email: "bob@prisma.io" },
  //   update: {},
  //   create: {
  //     email: "bob@prisma.io",
  //     name: "Bob",
  //   },
  // });
  // console.log({ alice, bob });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
