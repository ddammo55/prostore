import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    'Price must have exactly two decimal places (e.g., 49.99)'
  );

// Schema for inserting products
export const insertProductShema = z.object({
    name: z.string().min(3, 'Name_세 글자이상 작성하세요'),
    slug: z.string().min(3, 'Slug_세 글자이상 작성하세요'),
    category: z.string().min(3, 'category_세 글자이상 작성하세요'),
    brand: z.string().min(3, 'brand_세 글자이상 작성하세요'),
    description: z.string().min(3, 'description_세 글자이상 작성하세요'),
    stock: z.coerce.number(),
    images : z.array(z.string()).min(1, 'images_이미지를 하나이상 추가하세요'),
    isFeatured : z.boolean(),
    banner : z.string().nullable(),
    price: currency,
})

// 사용자 서명 스키마
export const signInFormSchema = z.object({
    email: z.string().email('이메일 형식이 아닙니다'),
    password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
})

// 사용자 등록 스키마
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, 'Name_세 글자이상 작성하세요'),
    email: z.string().min(3, 'Email_세 글자이상 작성하세요'),
    password: z.string().min(3, '비밀번호는 최소 3자 이상이어야 합니다'),
    confirmPassword: z
      .string()
      .min(3, '비밀번호는 최소 3자 이상이어야 합니다')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })


// 항목스키마
export const cartItemSchema = z.object({
  productId : z.string().min(1, 'productId_상품은 필수 입력사항입니다.'),
  name: z.string().min(1, 'name_이름을은 필수 입력사항입니다.'),
  slug: z.string().min(1, 'slug_슬러그는 필수 입력사항입니다.'),
  qty: z.number().int().nonnegative('수량은 음수가아닌 양수이어야합니다.'),
  image: z.string().min(1, '이미지가 필요합니다.'),
  price: z
  .number()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(Number(value).toFixed(2)),
    '가격은 소수점 이하 두 자리까지 정확히 표시해야 합니다. (e.g., 49.99)'
  ),
})


// 카트 스키마
export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, 'Session cart id is required'),
  userId: z.string().optional().nullable(),
});

