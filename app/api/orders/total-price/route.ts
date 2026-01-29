import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

// Mettre à jour le prix total TTC
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { totalPrice } = body;

    if (totalPrice === undefined || totalPrice < 0) {
      return NextResponse.json({ message: "Prix total valide requis" }, { status: 400 });
    }

    await dbConnect();

    // Trouver ou créer la commande du client
    let order = await Order.findOne({ clientEmail: session.user.email });
    
    if (!order) {
      // Créer une nouvelle commande si elle n'existe pas
      order = await Order.create({
        clientEmail: session.user.email,
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        totalPrice: Number(totalPrice),
        references: [],
        deposit30: { isPaid: false },
        payment15_1: { isPaid: false },
        payment15_2: { isPaid: false },
        isCompleted: false
      });
    } else {
      order.totalPrice = Number(totalPrice);
      await order.save();
    }

    return NextResponse.json({ 
      message: "Prix total mis à jour", 
      totalPrice: order.totalPrice 
    }, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error updating total price:', err);
    return NextResponse.json({ message: err.message || "Internal Error" }, { status: 500 });
  }
}
