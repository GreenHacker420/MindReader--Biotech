import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// Secret token for revalidation requests
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET || 'your-secret-token';

export async function POST(request) {
  try {
    // Verify secret token
    const secret = request.headers.get('x-revalidate-secret');
    if (secret !== REVALIDATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid revalidation token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { path, tag, type = 'path' } = body;

    if (!path && !tag) {
      return NextResponse.json(
        { error: 'Either path or tag is required' },
        { status: 400 }
      );
    }

    // Revalidate by path
    if (type === 'path' && path) {
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        path,
        timestamp: new Date().toISOString(),
      });
    }

    // Revalidate by tag
    if (type === 'tag' && tag) {
      revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        tag,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: 'Invalid revalidation type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Revalidation failed', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET(request) {
  return NextResponse.json({
    status: 'ok',
    message: 'Revalidation endpoint is ready',
    timestamp: new Date().toISOString(),
  });
}
