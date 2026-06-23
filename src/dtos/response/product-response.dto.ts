import type { ProductCategoryEnum } from "../enums/product-category.enum";
import type { ProductStatusEnum } from "../enums/product-status.enum";
import type { ImageResponse } from "./image-response.dto";

export interface ProductAddonResponse {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  isActive?: boolean;
}

export interface ProductResponse {
  id: string;
  name: string;
  description?: string;
  category: ProductCategoryEnum;
  price: string;
  promoPrice?: string;
  isActive: ProductStatusEnum;
  stockEnabled: boolean;
  stock?: number;
  images: ImageResponse[];
  addons?: ProductAddonResponse[];
  createdAt: string;
  updatedAt: string;
}
