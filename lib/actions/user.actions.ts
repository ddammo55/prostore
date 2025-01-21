'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from '@/auth';
import { signInFormSchema } from '../validators'

// 자격 증명으로 사용자 로그인
export async function signInWithCredentials(
    prevState: unknown,
    formData: FormData
  ) {
    try {
      // formData에서 이메일과 비밀번호를 추출하여 유효성 검사
      const user = signInFormSchema.parse({
        email: formData.get('email'),
        password: formData.get('password'),
      });
   
      // 자격 증명으로 사용자 로그인 시도
      await signIn('credentials', user);
   
      return { success: true, message: '로그인 성공' }; // 로그인 성공 메시지 반환
    } catch (error) {
      if (isRedirectError(error)) {
        throw error; // 리다이렉트 오류가 발생하면 오류를 던짐
      }
   
      return { success: false, message: '잘못된 이메일 또는 비밀번호' }; // 로그인 실패 메시지 반환
    }
  }

  // 사용자 로그아웃
export async function signOutUser() {
    await signOut();
  }
