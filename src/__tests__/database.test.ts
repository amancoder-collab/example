import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Database Tests', () => {
    beforeAll(async () => {
        console.log(`Database URL: ${process.env.DATABASE_URL}`);
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.address.deleteMany({});
        await prisma.user.deleteMany({});
    });

    test('should create and retrieve a user', async () => {
        const userData = {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
        };

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const createdUser = await prisma.user.create({
            data: {
                email: userData.email,
                password: hashedPassword,
                name: userData.name,
            },
        });

        expect(createdUser).toBeDefined();
        expect(createdUser.email).toBe(userData.email);
        expect(createdUser.name).toBe(userData.name);

        const retrievedUser = await prisma.user.findUnique({
            where: { email: userData.email },
        });

        expect(retrievedUser).not.toBeNull();
        expect(retrievedUser?.email).toBe(userData.email);

        const isPasswordValid = await bcrypt.compare(
            userData.password,
            retrievedUser!.password
        );
        expect(isPasswordValid).toBe(true);
    });
}); 