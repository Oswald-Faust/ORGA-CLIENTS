import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await dbConnect();

  // Check if this is a payment status toggle
  if (body.field && typeof body.isPaid === 'boolean') {
    const { field, isPaid } = body;
    const updateData = {
      [`${field}.isPaid`]: isPaid,
      [`${field}.paidAt`]: isPaid ? new Date() : null
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(updatedOrder);
  } 
  
  // Otherwise, assume it's a general update (firstName, lastName, totalPrice, seller)
  // Sanitize input to only allow specific fields
  const allowedUpdates = ['firstName', 'lastName', 'totalPrice', 'seller', 'clientEmail'];
  const updateData: any = {};
  
  Object.keys(body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updateData[key] = body[key];
    }
  });

  if (Object.keys(updateData).length === 0) {
     return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );

  if (!updatedOrder) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(updatedOrder);



}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();

  const deletedOrder = await Order.findByIdAndDelete(id);

  if (!deletedOrder) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Order deleted successfully" });
}
