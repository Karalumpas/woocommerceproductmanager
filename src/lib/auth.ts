import { db } from './db'
import { users, sessions } from './db/schema'
import { eq, and, gt, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { NextRequest } from 'next/server'

export interface User {
  id: number
  email: string
  username: string
  isActive: boolean
  autoSync: boolean
  lastLogin?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  id: string
  userId: number
  expiresAt: Date
  createdAt: Date
}

const SESSION_COOKIE_NAME = 'session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateSessionId(): string {
  return randomBytes(32).toString('hex')
}

export async function createSession(userId: number): Promise<Session> {
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  const [session] = await db
    .insert(sessions)
    .values({
      id: sessionId,
      userId,
      expiresAt,
    })
    .returning()

  return session
}

export async function getSessionFromCookie(): Promise<{ user: User; session: Session } | null> {
  const cookieStore = cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  return getSession(sessionId)
}

export async function getSession(sessionId: string): Promise<{ user: User; session: Session } | null> {
  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date()),
        eq(users.isActive, true)
      )
    )
    .limit(1)

  if (result.length === 0) {
    return null
  }

  const { user, session } = result[0]
  return { user, session }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId))
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function authenticateUser(emailOrUsername: string, password: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        or(
          eq(users.email, emailOrUsername),
          eq(users.username, emailOrUsername)
        ),
        eq(users.isActive, true)
      )
    )
    .limit(1)

  if (!user) {
    return null
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash)
  if (!isValidPassword) {
    return null
  }

  // Update last login and return fresh user data
  const now = new Date()
  await db
    .update(users)
    .set({ lastLogin: now, updatedAt: now })
    .where(eq(users.id, user.id))

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    isActive: user.isActive,
    autoSync: user.autoSync,
    lastLogin: now,
    createdAt: user.createdAt,
    updatedAt: now,
  }
}

export async function createUser(email: string, username: string, password: string): Promise<User> {
  const passwordHash = await hashPassword(password)

  const [user] = await db
    .insert(users)
    .values({
      email,
      username,
      passwordHash,
    })
    .returning()

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    isActive: user.isActive,
    autoSync: user.autoSync,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword)
  
  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, userId))
}

export async function updateUserProfile(
  userId: number, 
  updates: { email?: string; username?: string; autoSync?: boolean }
): Promise<void> {
  await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, userId))
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value
  
  if (!sessionId) {
    return null
  }

  const sessionData = await getSession(sessionId)
  return sessionData?.user || null
}
