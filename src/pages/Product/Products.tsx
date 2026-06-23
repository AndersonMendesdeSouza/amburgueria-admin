import styles from "./Product.module.css";
import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiPlus } from "react-icons/fi";
import ProductCard from "../../components/ProductCard";
import { CgFileAdd } from "react-icons/cg";
import type { CategoryKey } from "../../types/Product-type";
import { ProductService } from "../../service/product.service";
import type { ProductResponse } from "../../dtos/response/product-response.dto";
import { ProductCategoryEnum } from "../../dtos/enums/product-category.enum";
import { useNavigate } from "react-router-dom";

export function Products() {
  const [activeCat, setActiveCat] = useState<CategoryKey>("all");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const categoryFromKey = (key: CategoryKey) => {
    switch (key) {
      case "hamburgers":
        return ProductCategoryEnum.FOOD;
      case "sides":
        return ProductCategoryEnum.ADDON;
      case "drinks":
        return ProductCategoryEnum.DRINK;
      case "desserts":
        return ProductCategoryEnum.DESSERT;
      default:
        return null;
    }
  };

  const filtered = useMemo(() => {
    if (activeCat === "all") return products;
    const category = categoryFromKey(activeCat);
    if (!category) return products;
    return products.filter((p) => p.category === category);
  }, [activeCat, products]);

  const pageSize = 4;
  const total = filtered.length;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, maxPage);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const counts = useMemo(() => {
    const countBy = (category: ProductCategoryEnum) =>
      products.filter((p) => p.category === category).length;

    return {
      all: products.length,
      hamburgers: countBy(ProductCategoryEnum.FOOD),
      sides: countBy(ProductCategoryEnum.ADDON),
      drinks: countBy(ProductCategoryEnum.DRINK),
      desserts: countBy(ProductCategoryEnum.DESSERT),
    };
  }, [products]);

  const CATEGORIES: { key: CategoryKey; label: string }[] = useMemo(
    () => [
      { key: "all", label: `Todos ${counts.all}` },
      { key: "hamburgers", label: "Comidas" },
      { key: "sides", label: "Acompanhamentos " },
      { key: "drinks", label: "Bebidas" },
      { key: "desserts", label: "Sobremesas" },
    ],
    [counts],
  );

  // const getPrimaryImageUrl = (images: ImageResponse[]) => {
  //   const primary = (images || []).find((img: any) => img?.isPrimary);
  //   return primary?.url || (images?.[0] as any)?.url || "";
  // };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProductService.findAll();
        setProducts(data);
      } catch (err: unknown) {
        console.error(err);
        setError("Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className={styles.page}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div className={styles.tabs}>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setActiveCat(c.key);
                setPage(1);
              }}
              className={`${styles.tab} ${activeCat === c.key ? styles.tabActive : ""}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          style={{
            width: 150,
            height: 40,
            borderRadius: 10,
            backgroundColor: "#ffd400",
            color: "#000",
            fontWeight: "600",
            border: "none",
            alignItems: "center",
            display: "flex",
            gap: 5,
            justifyContent: "center",
          }}
          onClick={() => navigate("/product-details")}
        >
          <CgFileAdd size={20} />
          Novo Produto
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 12 }}>Carregando...</div>
      ) : error ? (
        <div style={{ padding: 12 }}>{error}</div>
      ) : (
        <div className={styles.grid}>
          {paginated.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              description={p.description}
              category={p.category}
              price={p.price}
              imageUrl={p.images}
              isActive={p.isActive}
              stockEnabled={p.stockEnabled}
              stock={p.stock}
              available
              onEdit={() => {}}
              onDelete={() => {}}
              onToggleAvailable={() => {}}
              navigateTo="/product-details"
            />
          ))}
        </div>
      )}

      <div className={styles.bottom}>
        <div className={styles.counter}>
          Exibindo {paginated.length} de {total} produtos cadastrados
        </div>

        <div className={styles.pager}>
          <button
            type="button"
            className={styles.pagerBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Anterior"
            disabled={currentPage <= 1}
          >
            <FiChevronLeft />
          </button>
          <button
            type="button"
            className={styles.pagerBtn}
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            aria-label="Próximo"
            disabled={currentPage >= maxPage}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <button
        className={styles.fab}
        type="button"
        aria-label="Adicionar produto"
        onClick={() => navigate("/product-details")}
      >
        <FiPlus />
      </button>
    </div>
  );
}
