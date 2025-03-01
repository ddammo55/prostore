import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;

        // Find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // Check if user exists and if the password matches
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          // If password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // If user does not exist or password does not match return null
        return null;
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user, trigger, token }: any) {
      // Set the user ID from the token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      //console.log(token);

      // If there is an update, set the user name
      if (trigger === 'update') {
        session.user.name = user.name;
      }

      return session;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger, session }: any) {
      // Assign user fields to token
      if (user) {
        token.role = user.role;
 
        // If user has no name, use email as their default name
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];
 
          // Update the user in the database with the new name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }
 
      // Handle session updates (e.g., name change)
      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }
 
      return token;
    },

    authorized({ request, auth }: any) {
      // 카트 쿠키 확인
      if (!request.cookies.get('sessionCartId')) {
      // 카트 쿠키 생성
        const sessionCartId = crypto.randomUUID(); 
     
        // 요청 헤더 복제
        const newRequestHeaders = new Headers(request.headers); 
     
       // 새 응답을 생성하고 새 헤더를 추가합니다
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });
     
        // 응답 쿠키에서 새로 생성된 세션CartId 설정
        response.cookies.set('sessionCartId', sessionCartId);
     
       // 세션CartId 세트로 응답 반환
        return response;
      } else {
        return true;
      }
    },


  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);