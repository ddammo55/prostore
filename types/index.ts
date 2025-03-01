import { z } from "zod";
import { insertProductShema, cartItemSchema, insertCartSchema } from "@/lib/validators";

export type Product = z.infer<typeof insertProductShema> & {
    id : string;
    rating : string;
    createdAt : Date;
    
}

export type Cart = z.infer<typeof insertCartSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;