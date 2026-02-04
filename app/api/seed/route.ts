import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import { hashPassword } from '@/lib/password';

export async function POST(req: Request) {
  const _ = req; // Keep linter happy
  try {
    await dbConnect();
    
    // Clear existing (optional, but good for clean slate seeding)
    // await Order.deleteMany({});
    // await User.deleteMany({});

    // Create Admin
    const adminEmail = "admin@orgaclients.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
        await User.create({
            email: adminEmail,
            password: await hashPassword("admin123"),
            name: "Mathias Admin",
            role: "admin"
        });
    }

    // Create Clients
    const clients = [
        {
            firstName: "Alice",
            lastName: "Dupont",
            email: "alice@example.com",
            totalPrice: 15000,
            seller: "Jean",
            itemCount: 2,
            deposit70: { isPaid: true, paidAt: new Date(), dueDate: new Date() },
            payment15_1: { isPaid: false, dueDate: new Date(Date.now() + 86400000 * 10) },
            payment15_2: { isPaid: false, dueDate: new Date(Date.now() + 86400000 * 30) }
        },
        {
            firstName: "Bob",
            lastName: "Martin",
            email: "bob@example.com",
            totalPrice: 4500,
            seller: "Paul",
            itemCount: 1,
            deposit70: { isPaid: true, paidAt: new Date(Date.now() - 86400000 * 5), dueDate: new Date() },
            payment15_1: { isPaid: true, paidAt: new Date(), dueDate: new Date() },
            payment15_2: { isPaid: false, dueDate: new Date(Date.now() + 86400000 * 15) }
        },
        {
            firstName: "Chloé",
            lastName: "Lefevre",
            email: "chloe@example.com",
            totalPrice: 22000,
            seller: "Jean",
            itemCount: 5,
            deposit70: { isPaid: false, dueDate: new Date() },
            payment15_1: { isPaid: false },
            payment15_2: { isPaid: false }
        }
    ];

    for (const client of clients) {
        // Create User account
        const existingUser = await User.findOne({ email: client.email });
        if (!existingUser) {
            await User.create({
                email: client.email,
                password: await hashPassword("password123"),
                name: `${client.firstName} ${client.lastName}`,
                role: "client"
            });
        }

        // Create Order
        // Check if order exists to avoid duplicates on re-seed
        const existingOrder = await Order.findOne({ clientEmail: client.email });
        if (!existingOrder) {
            await Order.create({
                clientEmail: client.email,
                firstName: client.firstName,
                lastName: client.lastName,
                totalPrice: client.totalPrice,
                seller: client.seller,
                itemCount: client.itemCount,
                deposit70: client.deposit70,
                payment15_1: client.payment15_1,
                payment15_2: client.payment15_2
            });
        }
    }

    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
