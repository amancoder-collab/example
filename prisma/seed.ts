import { PrismaClient, AddressType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Clean the database
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const _user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'John Doe',
      phone: '+1234567890',
      addresses: {
        create: {
          type: AddressType.SHIPPING,
          address: '123 Main St, New York, NY 10001'
        }
      }
    }
  });

  const _user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: await bcrypt.hash('password456', 10),
      name: 'Jane Smith',
      phone: '+1987654321',
      addresses: {
        create: {
          type: AddressType.PICKUP,
          address: '456 Park Ave, Los Angeles, CA 90001'
        }
      }
    }
  });

  const _user3 = await prisma.user.create({
    data: {
      email: 'mike.wilson@example.com',
      password: await bcrypt.hash('password789', 10),
      name: 'Mike Wilson',
      phone: '+1122334455',
      addresses: {
        create: {
          type: AddressType.SHIPPING,
          address: '789 Broadway, Chicago, IL 60601'
        }
      }
    }
  });

  console.log('Database has been seeded with sample data! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
