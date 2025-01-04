'use server';
import { convertToPlainObject } from '../utils';
import { LATEST_PRODUCTS_LIMIT } from '../constants';
import { prisma } from '@/db/prisma';

// 최신 제품 받기
export async function getLatestProducts() {
   
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: 'desc' },
  });
 
  return convertToPlainObject(data);
}

// 슬러그로 단일 제품 받기
export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug },
  });
}