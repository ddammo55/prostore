import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//Prisma 객체를 일반 JS 객체로 변환하면 됩니다.
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

//소수점 이하 숫자 형식
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}

// 포멧에러
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any): string {
  if (error.name === 'ZodError') {
    // 핸들 조드 오류
    const fieldErrors = Object.keys(error.errors).map((field) => {
      const message = error.errors[field].message;
      return typeof message === 'string' ? message : JSON.stringify(message);
    });
 
    return fieldErrors.join('. ');
  } else if (
    error.name === 'PrismaClientKnownRequestError' &&
    error.code === 'P2002'
  ) {
    // 프리스마 오류 처리
    const field = error.meta?.target ? error.meta.target[0] : 'Field';
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // 다른 오류 처리
    return typeof error.message === 'string'
      ? error.message
      : JSON.stringify(error.message);
  }
}


// 소수점 이하 두 자리로 반올림
export const round2 = (value: number | string) => {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100; // 반올림 오류 방지
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error('value is not a number nor a string');
  }
};