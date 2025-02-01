import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Vocabulary from '@/models/Vocabulary';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const updates = await req.json();

    // Find the word and verify ownership
    const word = await Vocabulary.findOne({
      _id: params.id,
      userId: session.user.id
    });

    if (!word) {
      return new NextResponse("Word not found", { status: 404 });
    }

    // Validate confidence level if provided
    if (updates.confidenceLevel !== undefined) {
      if (updates.confidenceLevel < 1 || updates.confidenceLevel > 5) {
        return new NextResponse("Confidence level must be between 1 and 5", { status: 400 });
      }
    }

    // Update the word with all provided fields
    const updatedWord = await Vocabulary.findByIdAndUpdate(
      params.id,
      { ...updates },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedWord);
  } catch (error) {
    console.error("[VOCABULARY_PATCH]", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    // Find the word and verify ownership
    const word = await Vocabulary.findOne({
      _id: params.id,
      userId: session.user.id
    });

    if (!word) {
      return new NextResponse("Word not found", { status: 404 });
    }

    // Delete the word
    await Vocabulary.findByIdAndDelete(params.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[VOCABULARY_DELETE]", error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
