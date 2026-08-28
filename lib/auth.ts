import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type AuthUserStatus = {
  role?: string;
  isBlocked?: boolean;
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        const email = credentials.email.trim().toLowerCase();

        const user = await User.findOne({
          email,
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Blocked account check
        if (user.isBlocked === true) {
          throw new Error(
            "Your PetroHub account has been blocked. Please contact the administrator."
          );
        }

        const passwordMatches = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatches) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role ?? "user",
          isBlocked: false,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // First login
      if (user) {
        token.id = user.id;

        token.role =
          (user as {
            role?: string;
          }).role ?? "user";

        token.isBlocked =
          (user as {
            isBlocked?: boolean;
          }).isBlocked === true;

        return token;
      }

      // Refresh account status from MongoDB
      if (token.id) {
        try {
          await connectDB();

          const dbUser = (await User.findById(token.id)
            .select("role isBlocked")
            .lean()) as AuthUserStatus | null;

          // Account deleted
          if (!dbUser) {
            token.isBlocked = true;
            token.role = "user";

            return token;
          }

          // Account block status
          token.isBlocked =
            dbUser.isBlocked === true;

          // Current role
          token.role =
            dbUser.role ?? "user";
        } catch (error) {
          console.error(
            "Unable to refresh user authentication status:",
            error
          );
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const sessionUser =
          session.user as typeof session.user & {
            id?: string;
            role?: string;
            isBlocked?: boolean;
          };

        sessionUser.id =
          token.id as string;

        sessionUser.role =
          token.role as string;

        sessionUser.isBlocked =
          token.isBlocked === true;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};