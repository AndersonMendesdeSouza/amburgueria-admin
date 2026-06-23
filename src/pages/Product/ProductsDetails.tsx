import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ProductDetails.module.css";
import { FiEye, FiTrash2, FiX } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Colors from "../../themes/Colors";
import { BiTrash } from "react-icons/bi";
import { ProductService } from "../../service/product.service";
import type { ProductResponse } from "../../dtos/response/product-response.dto";
import type { ImageResponse } from "../../dtos/response/image-response.dto";
import type {
  ProductAddonRequest,
  ProductRequest,
} from "../../dtos/request/product-request.dto";
import { ProductCategoryEnum } from "../../dtos/enums/product-category.enum";
import { ProductStatusEnum } from "../../dtos/enums/product-status.enum";
import { API_BASE_URL } from "../../service/api";

type Media = {
  id: string;
  url: string;
  isPrimary?: boolean;
  file?: File;
};

type Addon = {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive?: boolean;
};

type FieldErrors = {
  name?: string;
  description?: string;
  category?: string;
  price?: string;
  promoPrice?: string;
  stockEnabled?: string;
  stock?: string;
};

type ProductDetailsCssVars = CSSProperties & {
  "--bgPrimary": string;
  "--bgSecondary": string;
  "--highlight": string;
  "--textPrimary": string;
  "--textSecondary": string;
};

function currencyBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ProductsDetails() {
  const [media, setMedia] = useState<Media[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [addonName, setAddonName] = useState("");
  const [addonDescription, setAddonDescription] = useState("");
  const [addonPrice, setAddonPrice] = useState("");
  const [showAddonForm, setShowAddonForm] = useState(false);
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const navigate = useNavigate();

  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProductCategoryEnum>(
    ProductCategoryEnum.FOOD,
  );
  const [price, setPrice] = useState("");
  const [promoPrice, setPromoPrice] = useState("");
  const [isActive, setActive] = useState<ProductStatusEnum>(
    ProductStatusEnum.DISABLED,
  );
  const [stockEnabled, setStockEnabled] = useState<boolean>(false);
  const [stock, setStock] = useState<string>("0");
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function alterationIsActive(): void {
    const newStatus =
      isActive === ProductStatusEnum.ACTIVED
        ? ProductStatusEnum.DISABLED
        : ProductStatusEnum.ACTIVED;

    setActive(newStatus);
  }

  function alterationStockEnabled(): void {
    setStockEnabled((v) => !v);
    setErrors((prev) => ({ ...prev, stock: undefined }));
  }

  useEffect(() => {
    const fetchProduct = async () => {
      if (!isEdit || !id) {
        setProduct(null);
        setMedia([]);
        setName("");
        setDescription("");
        setCategory(ProductCategoryEnum.FOOD);
        setPrice("");
        setPromoPrice("");
        setActive(ProductStatusEnum.DISABLED);
        setStockEnabled(false);
      setStock("0");
        setAddons([]);
        setAddonName("");
        setAddonDescription("");
        setAddonPrice("");
        setShowAddonForm(false);
        setErrors({});
        setSubmitted(false);
        return;
      }

      const data = await ProductService.findOne(id);
      setProduct(data);
      setActive(data.isActive || ProductStatusEnum.DISABLED);
      setStockEnabled(!!data.stockEnabled);
      setMedia(
        (data.images || []).map((img: ImageResponse) => ({
          id: String(img.id ?? img.fileName ?? img.url),
          url: img.url?.startsWith("http")
            ? img.url
            : `${API_BASE_URL}/${String(img.url || "").replace(/^\/+/, "")}`,
          isPrimary: !!img.isPrimary,
        })),
      );

      setName(data.name || "");
      setDescription(data.description || "");
      setCategory(
        (data.category as ProductCategoryEnum) || ProductCategoryEnum.FOOD,
      );
      setPrice(data.price ? String(data.price).replace(".", ",") : "");
      setPromoPrice(
        data.promoPrice ? String(data.promoPrice).replace(".", ",") : "",
      );
      setStock(String(data.stock ?? 0));
      setAddons(
        (data.addons || []).map((addon) => ({
          id: String(addon.id),
          name: addon.name,
          description: addon.description || "",
          price: Number(addon.price || 0),
          isActive: addon.isActive ?? true,
        })),
      );
      setAddonName("");
      setAddonDescription("");
      setAddonPrice("");
      setShowAddonForm(false);
      setErrors({});
      setSubmitted(false);
    };

    fetchProduct();
  }, [id, isEdit]);

  const primaryId = useMemo(
    () => media.find((m) => m.isPrimary)?.id ?? media[0]?.id,
    [media],
  );

  const setPrimary = (mid: string) => {
    setMedia((prev) => prev.map((m) => ({ ...m, isPrimary: m.id === mid })));
  };

  const removeMedia = (mid: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== mid));
  };

  const removeAddon = (aid: string) => {
    setAddons((prev) => prev.filter((a) => a.id !== aid));
  };

  const createAddonId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const addAddon = () => {
    const cleanName = addonName.trim();
    const cleanDescription = addonDescription.trim();
    const cleanPrice = toDot(addonPrice);
    const priceNumber = Number(cleanPrice);

    if (!cleanName || !Number.isFinite(priceNumber) || priceNumber < 0) {
      return;
    }

    setAddons((prev) => [
      ...prev,
      {
        id: createAddonId(),
        name: cleanName,
        description: cleanDescription || undefined,
        price: priceNumber,
        isActive: true,
      },
    ]);
    setAddonName("");
    setAddonDescription("");
    setAddonPrice("");
    setShowAddonForm(false);
  };

  function deletFood(pid: string | undefined): void {
    if (!pid) return;
    ProductService.remove(pid);
    navigate(-1);
  }

  const toDot = (v: string) => v.replace(/\./g, "").replace(",", ".").trim();

  function onPickFilesClick() {
    fileInputRef.current?.click();
  }

  function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      url: URL.createObjectURL(file),
      isPrimary: false,
      file,
    }));

    setMedia((prev) => {
      const merged = [...prev, ...next];
      if (!merged.some((m) => m.isPrimary) && merged.length) {
        merged[0] = { ...merged[0], isPrimary: true };
      }
      return merged;
    });

    e.target.value = "";
  }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!name.trim()) next.name = "Preencha o nome do produto";
    if (!description.trim()) next.description = "Preencha a descrição";
    if (!category) next.category = "Selecione uma categoria";

    const p = toDot(price);
    const pNum = p ? Number(p) : NaN;
    if (!price.trim()) next.price = "Preencha o preço";
    else if (!Number.isFinite(pNum) || pNum < 0) next.price = "Preço inválido";

    if (promoPrice.trim()) {
      const pp = toDot(promoPrice);
      const ppNum = Number(pp);
      if (!Number.isFinite(ppNum) || ppNum < 0)
        next.promoPrice = "Preço promocional inválido";
      if (Number.isFinite(ppNum) && Number.isFinite(pNum) && ppNum > pNum)
        next.promoPrice = "Promoção não pode ser maior que o preço base";
    }

    if (stockEnabled) {
      const sNum = Number(String(stock ?? "").trim());
      if (!String(stock ?? "").trim()) next.stock = "Informe o estoque";
      else if (!Number.isInteger(sNum) || sNum < 0)
        next.stock = "Estoque inválido";
    }

    return next;
  };

  async function onSave(): Promise<void> {
    if (saving) return;

    setSubmitted(true);

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      const firstKey = Object.keys(nextErrors)[0] as keyof FieldErrors;
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const payload: ProductRequest = {
      name: name.trim(),
      description: description.trim(),
      category,
      price: Number(toDot(price)),
      promoPrice: promoPrice.trim() ? Number(toDot(promoPrice)) : undefined,
      isActive,
      stockEnabled: !!stockEnabled,
      stock: stockEnabled ? Number(stock || 0) : 0,
      addons: addons.map<ProductAddonRequest>((addon) => ({
        id: addon.id,
        name: addon.name,
        description: addon.description,
        price: addon.price,
        isActive: addon.isActive ?? true,
      })),
    };

    const filesToUpload = media
      .filter((m) => m.file instanceof File)
      .map((m) => m.file as File);

    try {
      setSaving(true);

      if (isEdit && id) {
        await ProductService.update(id, payload);
        navigate(-1);
        return;
      }

      await ProductService.create(payload, filesToUpload);
      navigate(-1);
    } finally {
      setSaving(false);
    }
  }

  const inputErrorClass = (key: keyof FieldErrors) =>
    submitted && errors[key]
      ? `${styles.input} ${styles.inputError}`
      : styles.input;

  const textareaErrorClass = (key: keyof FieldErrors) =>
    submitted && errors[key]
      ? `${styles.textarea} ${styles.inputError}`
      : styles.textarea;

  const selectErrorClass = (key: keyof FieldErrors) =>
    submitted && errors[key]
      ? `${styles.select} ${styles.inputError}`
      : styles.select;

  return (
    <div
      className={styles.page}
      style={
        {
          "--bgPrimary": Colors.Background.primary,
          "--bgSecondary": Colors.Background.secondary,
          "--highlight": Colors.Highlight.primary,
          "--textPrimary": Colors.Texts.primary,
          "--textSecondary": Colors.Texts.secondary,
        } as ProductDetailsCssVars
      }
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={onFilesSelected}
      />

      <div className={styles.top}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className={styles.backBtn}
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Voltar"
            >
              ←
            </button>

            <h1 className={styles.title}>
              {isEdit ? "EDITAR PRODUTO" : "CRIAR PRODUTO"}
            </h1>
          </div>
          <p className={styles.subtitle}>
            {isEdit
              ? "Atualize as informações, mídias e valores do seu produto."
              : "Preencha as informações, mídias e valores do seu produto."}
          </p>
        </div>

        <div className={styles.topActions}>
          <button className={styles.btnGhost} type="button">
            <FiEye />
            Ver no App
          </button>
          <button className={styles.discard} type="button">
            Descartar
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              className={styles.save}
              type="button"
              onClick={onSave}
              disabled={saving}
            >
              <span className={styles.check}>✓</span>
              {isEdit ? "SALVAR ALTERAÇÕES" : "CRIAR PRODUTO"}
            </button>

            {isEdit && (
              <button
                className={styles.delete}
                type="button"
                onClick={() => deletFood(product?.id)}
              >
                <BiTrash size={13} />
                Excluir do Cardápio
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sectionLabel}>
        <span className={styles.sectionDot} />
        GALERIA DE IMAGENS
      </div>

      <div className={styles.gallery}>
        {media.map((m) => (
          <div
            key={m.id}
            className={`${styles.mediaCard} ${
              m.id === primaryId ? styles.mediaCardActive : ""
            }`}
          >
            {m.id === primaryId ? (
              <div className={styles.primaryTag}>PRINCIPAL</div>
            ) : null}

            <img src={m.url} alt="" className={styles.mediaImg} />

            <div className={styles.mediaActions}>
              <button
                className={styles.mediaBtn}
                type="button"
                onClick={() => setPrimary(m.id)}
                aria-label="Definir como principal"
              >
                ★
              </button>
              <button
                className={styles.mediaBtn}
                type="button"
                onClick={() => removeMedia(m.id)}
                aria-label="Excluir"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}

        <button
          className={styles.uploadCard}
          type="button"
          onClick={onPickFilesClick}
        >
          <div className={styles.uploadIcon}>+</div>
          <div className={styles.uploadText}>Upload mais fotos</div>
        </button>
      </div>

      <div className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}>📄</span>
            <span className={styles.panelTitle}>Informações Principais</span>
          </div>

          <div className={styles.form}>
            <div className={styles.field} data-field="name">
              <label className={styles.label}>NOME DO PRODUTO</label>
              <input
                className={inputErrorClass("name")}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (submitted) setErrors((p) => ({ ...p, name: undefined }));
                }}
              />
              {submitted && errors.name ? (
                <div className={styles.fieldError}>{errors.name}</div>
              ) : null}
            </div>

            <div className={styles.row2}>
              <div className={styles.field} data-field="category">
                <label className={styles.label}>CATEGORIA</label>
                <select
                  className={selectErrorClass("category")}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as ProductCategoryEnum);
                    if (submitted)
                      setErrors((p) => ({ ...p, category: undefined }));
                  }}
                >
                  <option value={ProductCategoryEnum.FOOD}>Comidas</option>
                  <option value={ProductCategoryEnum.DRINK}>Bebidas</option>
                  <option value={ProductCategoryEnum.ADDON}>
                    Acompanhamentos
                  </option>
                  <option value={ProductCategoryEnum.DESSERT}>
                    Sobremesas
                  </option>
                </select>
                {submitted && errors.category ? (
                  <div className={styles.fieldError}>{errors.category}</div>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>STATUS</label>
                <div className={styles.availability}>
                  <button
                    type="button"
                    className={`${styles.pill} ${
                      isActive === ProductStatusEnum.ACTIVED
                        ? styles.pillOn
                        : styles.pillOff
                    }`}
                    aria-label="Disponível"
                    onClick={() => alterationIsActive()}
                  >
                    <span className={styles.pillDot} />
                  </button>
                  <span className={styles.disp}>DISP.</span>
                </div>
              </div>
            </div>

            <div className={styles.field} data-field="description">
              <label className={styles.label}>DESCRIÇÃO DETALHADA</label>
              <textarea
                className={textareaErrorClass("description")}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (submitted)
                    setErrors((p) => ({ ...p, description: undefined }));
                }}
              />
              {submitted && errors.description ? (
                <div className={styles.fieldError}>{errors.description}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelIcon}>💳</span>
            <span className={styles.panelTitle}>Precificação</span>
          </div>

          <div className={styles.form}>
            <div className={styles.field} data-field="price">
              <label className={styles.label}>PREÇO BASE</label>
              <div className={styles.moneyInput}>
                <span className={styles.moneyPrefix}>R$</span>
                <input
                  className={inputErrorClass("price")}
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (submitted)
                      setErrors((p) => ({ ...p, price: undefined }));
                  }}
                />
              </div>
              {submitted && errors.price ? (
                <div className={styles.fieldError}>{errors.price}</div>
              ) : null}
            </div>

            <div className={styles.field} data-field="promoPrice">
              <label className={styles.label}>PREÇO PROMOCIONAL</label>
              <div className={styles.moneyInput}>
                <span className={styles.moneyPrefix}>R$</span>
                <input
                  className={
                    submitted && errors.promoPrice
                      ? `${styles.input} ${styles.inputMuted} ${styles.inputError}`
                      : `${styles.input} ${styles.inputMuted}`
                  }
                  value={promoPrice}
                  onChange={(e) => {
                    setPromoPrice(e.target.value);
                    if (submitted)
                      setErrors((p) => ({ ...p, promoPrice: undefined }));
                  }}
                />
              </div>
              {submitted && errors.promoPrice ? (
                <div className={styles.fieldError}>{errors.promoPrice}</div>
              ) : (
                <div className={styles.help}>
                  Deixe em branco para não aplicar promoção.
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>INVENTÁRIO</label>
              <div className={styles.inventory}>
                <span className={styles.inventoryLabel}>
                  Controle de estoque
                </span>
                <div className={styles.availability}>
                  <button
                    type="button"
                    className={`${styles.pill} ${
                      stockEnabled ? styles.pillOn : styles.pillOff
                    }`}
                    aria-label="Disponível"
                    onClick={() => alterationStockEnabled()}
                  >
                    <span className={styles.pillDot} />
                  </button>
                  <span className={styles.disp}>DISP.</span>
                </div>
              </div>
            </div>

            {stockEnabled && (
              <div className={styles.field} data-field="stock">
                <label className={styles.label}>ESTOQUE</label>
                <input
                  className={inputErrorClass("stock")}
                  value={stock}
                  onChange={(e) => {
                    setStock(e.target.value);
                    if (submitted)
                      setErrors((p) => ({ ...p, stock: undefined }));
                  }}
                />
                {submitted && errors.stock ? (
                  <div className={styles.fieldError}>{errors.stock}</div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.addonsPanel}>
        <div className={styles.addonsHeader}>
          <div className={styles.addonsTitle}>
            <span className={styles.addonDot}>+</span>
            Adicionais
          </div>
          <button
            className={styles.linkNew}
            type="button"
            onClick={() => setShowAddonForm((v) => !v)}
          >
            + Vincular Novo
          </button>
        </div>

        {showAddonForm && (
          <div className={styles.addonForm}>
            <div className={styles.field}>
              <label className={styles.label}>NOME DO ADICIONAL</label>
              <input
                className={styles.input}
                value={addonName}
                onChange={(e) => setAddonName(e.target.value)}
                placeholder="Ex: Bacon extra"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>DESCRIÇÃO</label>
              <input
                className={styles.input}
                value={addonDescription}
                onChange={(e) => setAddonDescription(e.target.value)}
                placeholder="Ex: Fatia extra crocante"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>PREÇO</label>
              <div className={styles.moneyInput}>
                <span className={styles.moneyPrefix}>R$</span>
                <input
                  className={styles.input}
                  value={addonPrice}
                  onChange={(e) => setAddonPrice(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className={styles.addonFormActions}>
              <button
                className={styles.discard}
                type="button"
                onClick={() => {
                  setAddonName("");
                  setAddonDescription("");
                  setAddonPrice("");
                  setShowAddonForm(false);
                }}
              >
                Cancelar
              </button>
              <button className={styles.save} type="button" onClick={addAddon}>
                Adicionar
              </button>
            </div>
          </div>
        )}

        <div className={styles.addonsList}>
          {addons.length ? (
            addons.map((a) => (
              <div key={a.id} className={styles.addonChip}>
                <div className={styles.addonLeft}>
                  <span className={styles.addonIcon}>+</span>
                  <div>
                    <div className={styles.addonName}>{a.name}</div>
                    {a.description ? (
                      <div className={styles.addonDesc}>{a.description}</div>
                    ) : null}
                    <div className={styles.addonPrice}>
                      {currencyBRL(a.price)}
                    </div>
                  </div>
                </div>

                <button
                  className={styles.addonRemove}
                  type="button"
                  onClick={() => removeAddon(a.id)}
                  aria-label="Remover"
                >
                  <FiX />
                </button>
              </div>
            ))
          ) : (
            <div className={styles.addonsEmpty}>
              Nenhum adicional vinculado a este produto.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
