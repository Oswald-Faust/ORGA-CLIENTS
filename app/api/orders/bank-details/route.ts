import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bankDetails } = await req.json();

    await dbConnect();

    // Find and update the order for the current user
    const order = await Order.findOneAndUpdate(
      { clientEmail: session.user.email },
      { $set: { bankDetails } },
      { new: true, upsert: true } // Create if doesn't exist (though it should usually exist)
    );

    return NextResponse.json({ 
      message: "Coordonnées bancaires mises à jour", 
      bankDetails: order.bankDetails 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating bank details:', error);
    return NextResponse.json({ message: error.message || "Internal Error" }, { status: 500 });
  }
}
