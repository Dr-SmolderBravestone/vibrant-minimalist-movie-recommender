import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { favorites } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { movieId } = await params;
    const movieIdNum = parseInt(movieId);

    if (isNaN(movieIdNum)) {
      return NextResponse.json({ 
        error: "Valid movieId is required",
        code: "INVALID_MOVIE_ID" 
      }, { status: 400 });
    }

    const existingFavorite = await db.select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.movieId, movieIdNum)
      ))
      .limit(1);

    if (existingFavorite.length === 0) {
      return NextResponse.json({ 
        error: 'Favorite not found',
        code: "FAVORITE_NOT_FOUND" 
      }, { status: 404 });
    }

    const deleted = await db.delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.movieId, movieIdNum)
      ))
      .returning();

    return NextResponse.json({ 
      message: 'Favorite deleted successfully',
      favorite: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}