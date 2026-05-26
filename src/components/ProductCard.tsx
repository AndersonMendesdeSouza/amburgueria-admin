import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import type { ProductCategoryEnum } from "../dtos/enums/product-category.enum";
import type { ImageResponse } from "../dtos/response/image-response.dto";
import { ProductStatusEnum } from "../dtos/enums/product-status.enum";
import { ProductService } from "../service/product.service";

type Props = {
  id: string;
  name: string;
  description: string | undefined;
  category: ProductCategoryEnum;
  price: string;
  imageUrl: ImageResponse[];
  stock: number | undefined;
  stockEnabled: boolean;
  available: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleAvailable?: (id: string) => void;
  navigateTo: string;
  isActive: ProductStatusEnum;
};

function currencyBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProductCard({
  id,
  name,
  description,
  category,
  price,
  imageUrl,
  onDelete,
  isActive,
}: Props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ProductStatusEnum>(isActive);
  function alterationStatus(): void {
    const newStatus =
      status === ProductStatusEnum.ACTIVED
        ? ProductStatusEnum.DISABLED
        : ProductStatusEnum.ACTIVED;

    setStatus(newStatus);
    ProductService.actived(id, newStatus);
  }

  const API_BASE_URL = "http://localhost:3000";

  function resolveImageUrl(url?: string) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}/${url}`;
  }

  return (
    <div className={styles.card}>
      <div className={styles.media}>
        <img
          // className={`${styles.image} ${inStock === ProductStatusEnum.DISABLED ? styles.imageDim : ""}`}
          className={`${styles.image} ${!status ? styles.imageDim : ""}`}
          src={resolveImageUrl(imageUrl[0]?.url)}
          alt=""
        />

        <div className={styles.cardActions}>
          <button
            className={styles.iconBtn}
            type="button"
            aria-label="Editar"
            // onClick={() => onEdit?.(id)}
            onClick={() => navigate(`/product-details/${id}`)}
          >
            <FiEdit2 />
          </button>
          <button
            className={styles.iconBtn}
            type="button"
            aria-label="Excluir"
            onClick={() => onDelete?.(id)}
          >
            <FiTrash2 />
          </button>
        </div>

        {/* {inStock === ProductStatusEnum.DISABLED ? ( */}
        {!status ? <div className={styles.outOfStock}>SEM ESTOQUE</div> : null}
      </div>

      <div className={styles.body}>
        <div className={styles.category}>{category}</div>
        <div className={styles.name}>{name}</div>
        <div className={styles.desc}>{description}</div>

        <div className={styles.footer}>
          <div className={styles.price}>{currencyBRL(Number(price))}</div>

          <div className={styles.availability}>
            <button
              type="button"
              className={`${styles.pill} ${status === ProductStatusEnum.ACTIVED ? styles.pillOn : styles.pillOff}`}
              aria-label="Disponível"
              // onClick={() => onToggleAvailable?.(id)}
              onClick={() => alterationStatus()}
            >
              <span className={styles.pillDot} />
            </button>
            <span className={styles.disp}>DISP.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
