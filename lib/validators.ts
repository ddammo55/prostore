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