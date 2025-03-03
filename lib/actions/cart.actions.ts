'use server';

import { CartItem } from '@/types';
import { cookies } from 'next/headers';
import { convertToPlainObject, formatError, round2 } from '../utils';
import { auth } from '@/auth';
import { prisma } from '@/db/prisma';
import { cartItemSchema, insertCartSchema } from '../validators';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@prisma/client';


// 품목을 기준으로 카트 가격 계산
const calcPrice = (items: z.infer<typeof cartItemSchema>[]) => {
    const itemsPrice = round2(
        items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
      ),
      shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
      taxPrice = round2(0.15 * itemsPrice),
      totalPrice = round2(itemsPrice + shippingPrice + taxPrice);
    return {
      itemsPrice: itemsPrice.toFixed(2),
      shippingPrice: shippingPrice.toFixed(2),
      taxPrice: taxPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
    };
  };


// 카트에 품목 추가
export async function addItemToCart(data: CartItem) {
    try {
        // 카트 쿠키 확인
        const sessionCartId = (await cookies()).get('sessionCartId')?.value;

        if(!sessionCartId) throw new Error('Cart session not found');

        // 세션 및 사용자 ID 가져오기
        const session = await auth();
        const userId = session?.user?.id ? (session.user.id as string) : undefined;

        // 데이터베이스에서 카트 가져오기
        const cart = await getMyCart();

        // 제출된 항목 데이터 분석 및 검증
        const item = cartItemSchema.parse(data);

        // 데이터베이스에서 제품 찾기
        const product = await prisma.product.findFirst({
        where: { id: item.productId },
        });
        if (!product) throw new Error('Product not found');

        // 5-6 카트가 없으면 새로 만들기
        if (!cart) {
            // 새 카트 객체 만들기
            const newCart = insertCartSchema.parse({
              userId: userId,
              items: [item],
              sessionCartId: sessionCartId,
              ...calcPrice([item]),
            });
            // 데이터베이스에 추가
            await prisma.cart.create({
              data: newCart,
            });
           
            // 제품 페이지 재검증
            revalidatePath(`/product/${product.slug}`);
           
            return {
              success: true,
              message: `${product.name} added to cart`,
            };
          }else{
            // 품목이 이미 카트에 있는지 확인 합니다.
            const existItem = (cart.items as CartItem[]).find((x) => x.productId === item.productId);

            // 재고가 충분하지 않으면 오류를 버립니다
            if (existItem){
                // 재고 확인
                
                if(product.stock < existItem.qty + 1) {
                  throw new Error('재고 부족');
                }
                // 수량 업데이트
                (cart.items as CartItem[]).find((x) => x.productId === item.productId)!.qty = existItem.qty + 1;
            }else {
              // 재고가 있는 경우 장바구니에 품목 추가
              // 재고 확인
              if(product.stock < 1) throw new Error('재고 부족');

              // 장바구니에 항목을 추가합니다.items
              cart.items.push(item);

            }

            // 카트 업데이트
            await prisma.cart.update({
              where: { id: cart.id },
              data: {
                items: cart.items as Prisma.CartUpdateitemsInput[],
                ...calcPrice(cart.items as CartItem[]),
              },
            });

            revalidatePath(`/product/${product.slug}`);

            return {
              success: true,
              message: `${product.name} ${
                existItem ? 'updated in' : 'added to'
              } cart successfully`,
            };

          }
    }catch (error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
}

//  데이터베이스에서 사용자 카트 가져오기
export async function getMyCart() {
       // 카트 쿠키 확인
       const sessionCartId = (await cookies()).get('sessionCartId')?.value;

       if(!sessionCartId) throw new Error('Cart session not found');

       // 세션 및 사용자 ID 가져오기
       const session = await auth();
       const userId = session?.user?.id ? (session.user.id as string) : undefined;

       // 데이터베이스에서 사용자 카트 가져오기
       const cart = await prisma.cart.findFirst({
            where: userId ? { userId: userId } : { sessionCartId: sessionCartId },  
       })

       if (!cart) return undefined;

         // 십진수 값을 문자열로 변환
        return convertToPlainObject({
            ...cart,
            items: cart.items as CartItem[],
            itemsPrice: cart.itemsPrice.toString(),
            totalPrice: cart.totalPrice.toString(),
            shippingPrice: cart.shippingPrice.toString(),
            taxPrice: cart.taxPrice.toString(),
        });
}

// 카트에서 품목 제거
export async function removeItemFromCart(productId:string) {
  try {
    // 카트 쿠키 확인
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if(!sessionCartId) throw new Error('Cart session not found');

    // 제품 받기
    const product = await prisma.product.findFirst({
      where: { id: productId },
    })
    if(!product) throw new Error('Product not found');

    // 사용자카트
    const cart = await getMyCart();
    if(!cart) throw new Error('Cart not found');

    // 카트에 아이템이 있는지 확인
    const exist = (cart.items as CartItem[]).find((x) => x.productId === productId);
    if(!exist) throw new Error('Item not found in cart');

    // 카트에 하나의 항목만 있는지 확인한다
    if(exist.qty === 1) {
      // 카트에서 제거
      cart.items = (cart.items as CartItem[]).filter((x) => x.productId !== productId);
    }else {
      // 카트에서 수량을 줄입니다.
      (cart.items as CartItem[]).find((x) => x.productId === productId)!.qty =
    exist.qty - 1;
    }

    // 데이터베이스에서 카트 업데이트
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    })

    // 제품 페이지 재검증
    revalidatePath(`/product/${product.slug}`);

    return {
      success: true,
      message: `${product.name}  ${
        (cart.items as CartItem[]).find((x) => x.productId === productId)
          ? 'updated in'
          : 'removed from'
      } cart successfully`,
    };

  } catch (error) {
    return{
      success: false,
      message: formatError(error)
    }
  }
}