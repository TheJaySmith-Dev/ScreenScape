import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { db } from "~/db/index.ts";
import { likes, dislikes, users } from "~/db/schema.ts";
import { eq } from "drizzle-orm";
import { validateToken } from "./utils/auth.ts";
import type { LikedItem, DislikedItem } from './utils/types.ts';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  const { user: decodedUser, error, status } = await validateToken(event);

  if (error) {
    return { statusCode: status, body: JSON.stringify({ error }), headers };
  }

  // Auth0 `sub` is the unique user identifier
  const auth0Sub = decodedUser.sub;
  if (!auth0Sub) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Auth0 user ID (sub) not found in token.' }), headers };
  }

  try {
    // Find or create user in our database
    let user = await db.query.users.findFirst({ where: eq(users.auth0Sub, auth0Sub) });
    
    if (!user) {
        // Auth0 provides user details in the token if scopes (openid, profile, email) are configured correctly.
        const newUserResult = await db.insert(users).values({
            auth0Sub: auth0Sub,
            email: (decodedUser.email as string) || 'No Email Provided',
            displayName: (decodedUser.name as string) || 'User',
            photoURL: (decodedUser.picture as string) || null,
        }).returning();
        user = newUserResult[0];
    }
    const userId = user.id;

    // Get user preferences
    if (event.httpMethod === 'GET') {
      const userLikes = await db.select({
        id: likes.id,
        type: likes.type,
        title: likes.title,
        posterUrl: likes.posterUrl,
        releaseYear: likes.releaseYear,
      }).from(likes).where(eq(likes.userId, userId));
      
      const userDislikes = await db.select({
        id: dislikes.id,
        type: dislikes.type,
      }).from(dislikes).where(eq(dislikes.userId, userId));

      return {
        statusCode: 200,
        body: JSON.stringify({ likes: userLikes, dislikes: userDislikes }),
        headers,
      };
    }

    // Save user preferences
    if (event.httpMethod === 'POST') {
      const { likes: newLikes, dislikes: newDislikes } = JSON.parse(event.body || '{}') as { likes: LikedItem[], dislikes: DislikedItem[] };

      await db.transaction(async (tx) => {
        // Clear existing preferences for the user
        await tx.delete(likes).where(eq(likes.userId, userId));
        await tx.delete(dislikes).where(eq(dislikes.userId, userId));

        // Insert new likes if any
        if (newLikes && newLikes.length > 0) {
          const likesToInsert = newLikes.map(like => ({ ...like, userId, posterUrl: like.posterUrl }));
          await tx.insert(likes).values(likesToInsert);
        }

        // Insert new dislikes if any
        if (newDislikes && newDislikes.length > 0) {
          const dislikesToInsert = newDislikes.map(dislike => ({ ...dislike, userId }));
          await tx.insert(dislikes).values(dislikesToInsert);
        }
      });

      return { statusCode: 200, body: JSON.stringify({ message: 'Preferences saved successfully.' }), headers };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }), headers };

  } catch (error) {
    console.error('Error in preferences function:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'An internal server error occurred.' }), headers };
  }
};

export { handler };