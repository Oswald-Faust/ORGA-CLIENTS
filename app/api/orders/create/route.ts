import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, totalPrice, itemCount, seller, clientEmail } = body;

    // Security check: ensure the user creates an order for themselves
    if (session.user.email !== clientEmail && session.user.role !== 'admin') {
         return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    // Check if order already exists
    const existingOrder = await Order.findOne({ clientEmail });
    if (existingOrder) {
      return NextResponse.json({ message: "Order already exists" }, { status: 409 });
    }

    // Initialize with default unpaid status structure matching our schema
    const newOrder = await Order.create({
      clientEmail,
      firstName,
      lastName,
      totalPrice: Number(totalPrice),
      itemCount: Number(itemCount),
      seller,
      deposit30: { isPaid: false, dueDate: new Date() }, // Due immediately by default?
      payment15_1: { isPaid: false },
      payment15_2: { isPaid: false },
      isCompleted: false
    });

    return NextResponse.json({ message: "Order created", orderId: newOrder._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}
