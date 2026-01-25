import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/password';

export async function POST(req: Request) {
  try {
    const { email, password, name, phone } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: 'client'
    });

    return NextResponse.json({ message: 'User created successfully', userId: user._id }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
