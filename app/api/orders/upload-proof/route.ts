import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { put } from '@vercel/blob';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;
    const paymentField = formData.get('paymentField') as string;
    const referenceId = formData.get('referenceId') as string;

    if (!file || !orderId || !paymentField) {
      return NextResponse.json({ message: "Fichier, orderId et paymentField requis" }, { status: 400 });
    }

    // Validate payment field
    if (!['deposit70', 'payment15_1', 'payment15_2'].includes(paymentField)) {
      return NextResponse.json({ message: "Champ de paiement invalide" }, { status: 400 });
    }

    await dbConnect();

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Commande non trouvée" }, { status: 404 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'png';
    const filename = `proofs/${orderId}_${referenceId || 'main'}_${paymentField}_${timestamp}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    // Update order with proof URL
    const proofUrl = blob.url;
    
    // Dynamic update based on payment field
    const updateQuery: Record<string, unknown> = {};

    if (referenceId) {
        // Update specific reference
        // Note: This requires the order model to have references array with _id matching referenceId
        await Order.findOneAndUpdate(
            { _id: orderId, "references._id": referenceId },
            { 
                $set: {
                    [`references.$.${paymentField}.proofUrl`]: proofUrl,
                    [`references.$.${paymentField}.isPaid`]: true,
                    [`references.$.${paymentField}.paidAt`]: new Date()
                }
            }
        );
    } else {
        // Legacy/Top-level update
        updateQuery[`${paymentField}.proofUrl`] = proofUrl;
        updateQuery[`${paymentField}.isPaid`] = true;
        updateQuery[`${paymentField}.paidAt`] = new Date();
        await Order.findByIdAndUpdate(orderId, { $set: updateQuery });
    }

    return NextResponse.json({ 
      message: "Preuve de paiement téléchargée", 
      proofUrl 
    }, { status: 200 });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error uploading proof:', err);
    return NextResponse.json({ message: err.message || "Internal Error" }, { status: 500 });
  }
}
