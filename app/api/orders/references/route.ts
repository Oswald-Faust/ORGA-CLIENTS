import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

// Ajouter une référence
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, price, info } = body;

    if (!firstName || !lastName || price === undefined) {
      return NextResponse.json({ message: "Nom, prénom et prix sont requis" }, { status: 400 });
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
        totalPrice: 0,
        references: [],
        deposit70: { isPaid: false },
        payment15_1: { isPaid: false },
        payment15_2: { isPaid: false },
        isCompleted: false
      });
    }

    // Ajouter la référence
    order.references.push({
      firstName,
      lastName,
      price: Number(price),
      info: info || ''
    });

    await order.save();

    return NextResponse.json({ 
      message: "Référence ajoutée", 
      reference: order.references[order.references.length - 1],
      references: order.references 
    }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error adding reference:', error);
    return NextResponse.json({ message: err.message || "Internal Error" }, { status: 500 });
  }
}

// Supprimer une référence
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const referenceId = searchParams.get('id');

    if (!referenceId) {
      return NextResponse.json({ message: "ID de référence requis" }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findOne({ clientEmail: session.user.email });
    if (!order) {
      return NextResponse.json({ message: "Commande non trouvée" }, { status: 404 });
    }

    // Supprimer la référence par ID
    order.references = order.references.filter(
      (ref: { _id: { toString: () => string } }) => ref._id.toString() !== referenceId
    );

    await order.save();

    return NextResponse.json({ 
      message: "Référence supprimée", 
      references: order.references 
    }, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error deleting reference:', error);
    return NextResponse.json({ message: err.message || "Internal Error" }, { status: 500 });
  }
}
