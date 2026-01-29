import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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

    if (!file || !orderId || !paymentField) {
      return NextResponse.json({ message: "Fichier, orderId et paymentField requis" }, { status: 400 });
    }

    // Validate payment field
    if (!['deposit30', 'payment15_1', 'payment15_2'].includes(paymentField)) {
      return NextResponse.json({ message: "Champ de paiement invalide" }, { status: 400 });
    }

    await dbConnect();

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Commande non trouvée" }, { status: 404 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'proofs');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'png';
    const filename = `${orderId}_${paymentField}_${timestamp}.${extension}`;
    const filepath = join(uploadDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Update order with proof URL
    const proofUrl = `/uploads/proofs/${filename}`;
    
    // Dynamic update based on payment field
    const updateQuery: Record<string, unknown> = {};
    updateQuery[`${paymentField}.proofUrl`] = proofUrl;
    updateQuery[`${paymentField}.isPaid`] = true;
    updateQuery[`${paymentField}.paidAt`] = new Date();

    await Order.findByIdAndUpdate(orderId, { $set: updateQuery });

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
