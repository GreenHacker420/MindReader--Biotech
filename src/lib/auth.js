// NextAuth configuration
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import prisma from './prisma';
import { sendWelcomeEmail } from './email-service';

export const authOptions = {
  // Note: Prisma adapter disabled when using credentials provider
  // adapter: PrismaAdapter(prisma),
  providers: [
    // Email/Password Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // LinkedIn OAuth Provider
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
    }),
  ],

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Create or update user in database for OAuth providers
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new user
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || null,
              image: user.image || null,
              emailVerified: account.providerAccountId ? new Date() : null,
              provider: account.provider,
              providerId: account.providerAccountId,
            },
          });

          // Send welcome email
          try {
            await sendWelcomeEmail(user.email, user.name || 'User');
          } catch (error) {
            console.error('Email send error:', error);
          }
        } else {
          // Update existing user with OAuth info if missing
          if (!existingUser.provider || !existingUser.providerId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                provider: account.provider,
                providerId: account.providerAccountId,
                image: user.image || existingUser.image,
                name: user.name || existingUser.name,
                emailVerified: existingUser.emailVerified || (account.providerAccountId ? new Date() : null),
              },
            });
          }
        }
      }

      return true;
    },

    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in - fetch user from database
      if (user && account) {
        let dbUser;
        
        if (account.provider === 'credentials') {
          // For credentials, user object already has the data
          dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
        } else {
          // For OAuth, find by email
          dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
        }

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.role = dbUser.role;
          token.plan = dbUser.plan;
          token.emailVerified = dbUser.emailVerified;
          token.createdAt = dbUser.createdAt;
        } else {
          // Fallback to user object if not in DB
          token.id = user.id;
          token.email = user.email;
          token.role = user.role || 'USER';
          token.plan = user.plan || 'FREE';
          token.emailVerified = user.emailVerified;
          token.createdAt = user.createdAt || new Date();
        }
      }

      // On subsequent requests (no user object), ensure we have email for lookups
      if (!user && token.email && (!token.id || !token.plan)) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role || token.role;
          token.plan = dbUser.plan || token.plan;
          token.emailVerified = dbUser.emailVerified || token.emailVerified;
          token.createdAt = dbUser.createdAt || token.createdAt;
        }
      }

      // Update session - fetch latest user data from database
      if (trigger === 'update') {
        if (token.email) {
          const updatedUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: {
              plan: true,
              role: true,
              emailVerified: true,
            },
          });

          if (updatedUser) {
            token.plan = updatedUser.plan;
            token.role = updatedUser.role;
            token.emailVerified = updatedUser.emailVerified;
          }
        }

        // Merge any session data passed
        if (session) {
          token = { ...token, ...session };
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.plan = token.plan;
        session.user.emailVerified = token.emailVerified;
        session.user.createdAt = token.createdAt;
      }

      return session;
    },
  },

  events: {
    async createUser({ user }) {
      // Send welcome email for email/password signups
      await sendWelcomeEmail(user.email, user.name || 'User');
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Export auth helper for NextAuth v5
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
