import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password, preferredLanguage } = await req.json();

    // Log the received data (excluding password)
    console.log('Signup attempt:', { name, email, preferredLanguage });

    if (!name || !email || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate password requirements
    if (password.length < 8) {
      console.log('Password validation failed');
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log('Connected to database');

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Create user - password will be hashed by the pre-save hook
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      preferredLanguage: preferredLanguage || 'english',
      isActive: true,
      failedLoginAttempts: 0,
    });

    console.log('User created successfully:', { id: user._id, email: user.email });

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          preferredLanguage: user.preferredLanguage,
        },
        message: "Account created successfully"
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
