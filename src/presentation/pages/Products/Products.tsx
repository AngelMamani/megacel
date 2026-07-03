import { useEffect, useState, useRef, useMemo, useDeferredValue } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Products.css';
import { useApplication, useInfrastructure } from '../../providers/DependencyProvider.tsx';
import type { Product } from '../../../domain/entities/Product.ts';
import type { Category } from '../../../domain/entities/Category.ts';
import type { Brand } from '../../../domain/entities/Brand.ts';
import {
  calculateFinalPrice as calculateDomainFinalPrice,
  formatMoney,
} from '../../../domain/value-objects/Money.ts';
import {
  compareObjects,
  uploadProductImage,
  deleteProductImage,
  deleteProductFolder,
} from '../../../infrastructure/index.ts';
import { increment, deleteField } from 'firebase/firestore';
import type {
  BrandOption,
  CategoryOption,
  ProductFormData,
  ProductSortKey,
  ProductVariantField,
  ProductVariantFieldKey,
  ProductViewMode,
} from './types/ProductPageTypes.ts';
import { ProductPageHeader } from './components/ProductPageHeader.tsx';
import { ProductKpiStrip } from './components/ProductKpiStrip.tsx';
import { ProductCommandBar } from './components/ProductCommandBar.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductTableView } from './components/ProductTableView.tsx';
import {
  ProductRichTextEditor,
  NormalizeDescriptionHtml,
  StripHtmlTags,
} from './components/ProductRichTextEditor.tsx';
import { ProductVariantsSection } from './components/ProductVariantsSection.tsx';
import {
  FindVariantSiblingProducts,
  GetProductBaseName,
  MapProductToVariantField,
  ShouldUseVariantEditor,
  VARIANT_NAME_SEPARATOR,
} from './utils/productPresentationUtils.ts';

const MAX_PRODUCT_IMAGES = 10;
const MAX_VARIANT_IMAGES = 6;

const IsFirebaseStorageUrl = (url: string): boolean =>
  url.includes('firebasestorage.googleapis.com');

const IsValidHttpImageUrl = (raw: string): boolean => {
  try {
    const parsed = new URL(raw.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/* const mockProducts: Product[] = [
  {
    id: '1',
    sku: 'IPH15PM256-001',
    name: 'iPhone 15 Pro Max 256GB',
    categoryId: '1',
    brandId: '1',
    price: 1499,
    costPrice: 1200,
    finalPrice: 1499,
    stock: 12,
    minStock: 5,
    status: 'activo',
    images: [celImage],
    description: 'Smartphone premium de Apple con chip A17 Pro, pantalla Super Retina XDR de 6.7 pulgadas, cámara triple de 48MP y batería de larga duración.',
    shortDescription: 'Smartphone premium con chip A17 Pro',
    specifications: {
      'Modelo': 'iPhone 15 Pro Max',
      'Color': 'Titanio Natural',
      'Capacidad': '256GB',
      'RAM': '8GB',
      'Garantía': '12 meses',
      'Peso': '221g',
      'Dimensiones': '159.9 x 76.7 x 8.25 mm',
    },
    createdAt: new Date('2024-01-15T10:30:00').toISOString(),
  },
  {
    id: '2',
    sku: 'SGS24U512-001',
    name: 'Samsung Galaxy S24 Ultra 512GB',
    categoryId: '1',
    brandId: '2',
    price: 1299,
    costPrice: 1050,
    discount: 100,
    discountPercentage: 7.7,
    finalPrice: 1199,
    stock: 8,
    minStock: 5,
    status: 'activo',
    images: [celImage],
    description: 'Teléfono inteligente con pantalla Dynamic AMOLED 2X de 6.8 pulgadas, cámara de 200MP, procesador Snapdragon 8 Gen 3 y S Pen integrado.',
    shortDescription: 'Smartphone con S Pen y cámara de 200MP',
    specifications: {
      'Modelo': 'Galaxy S24 Ultra',
      'Color': 'Titanio Negro',
      'Capacidad': '512GB',
      'RAM': '12GB',
      'Garantía': '12 meses',
      'Peso': '232g',
      'Dimensiones': '162.3 x 79.0 x 8.6 mm',
    },
    createdAt: new Date('2024-01-20T14:20:00').toISOString(),
  },
  {
    id: '3',
    sku: 'XIA14P256-001',
    name: 'Xiaomi 14 Pro 256GB',
    categoryId: '1',
    brandId: '2',
    price: 899,
    costPrice: 700,
    finalPrice: 899,
    stock: 15,
    minStock: 5,
    status: 'activo',
    images: [celImage],
    description: 'Smartphone flagship con pantalla AMOLED de 6.73 pulgadas, cámara Leica de 50MP y procesador Snapdragon 8 Gen 3.',
    shortDescription: 'Smartphone flagship con cámara Leica',
    specifications: {
      'Modelo': 'Xiaomi 14 Pro',
      'Color': 'Negro',
      'Capacidad': '256GB',
      'RAM': '12GB',
      'Garantía': '12 meses',
      'Peso': '210g',
      'Dimensiones': '160.8 x 75.3 x 8.5 mm',
    },
    createdAt: new Date('2024-02-01T09:15:00').toISOString(),
  },
  {
    id: '4',
    sku: 'IPAD12M2-001',
    name: 'iPad Pro 12.9" M2 256GB',
    categoryId: '2',
    brandId: '1',
    price: 1099,
    costPrice: 900,
    finalPrice: 1099,
    stock: 10,
    minStock: 3,
    status: 'activo',
    images: [celImage],
    description: 'Tablet profesional con chip Apple M2, pantalla Liquid Retina XDR de 12.9 pulgadas, soporte para Apple Pencil y Magic Keyboard.',
    shortDescription: 'Tablet profesional con chip M2',
    specifications: {
      'Modelo': 'iPad Pro 12.9"',
      'Color': 'Gris Espacial',
      'Capacidad': '256GB',
      'RAM': '8GB',
      'Garantía': '12 meses',
      'Peso': '682g',
      'Dimensiones': '280.6 x 214.9 x 6.4 mm',
    },
    createdAt: new Date('2024-01-10T11:00:00').toISOString(),
  },
  {
    id: '5',
    sku: 'SGTABS9-001',
    name: 'Samsung Galaxy Tab S9 Ultra',
    categoryId: '2',
    brandId: '2',
    price: 999,
    costPrice: 800,
    finalPrice: 999,
    stock: 7,
    minStock: 3,
    status: 'activo',
    images: [celImage],
    description: 'Tablet premium con pantalla Super AMOLED de 14.6 pulgadas, S Pen incluido, procesador Snapdragon 8 Gen 2 y batería de larga duración.',
    shortDescription: 'Tablet premium con S Pen incluido',
    specifications: {
      'Modelo': 'Galaxy Tab S9 Ultra',
      'Color': 'Grafito',
      'Capacidad': '256GB',
      'RAM': '12GB',
      'Garantía': '12 meses',
      'Peso': '732g',
      'Dimensiones': '326.4 x 208.6 x 5.5 mm',
    },
    createdAt: new Date('2024-01-25T16:45:00').toISOString(),
  },
  {
    id: '6',
    sku: 'AIRPODSP2-001',
    name: 'AirPods Pro 2da Generación',
    categoryId: '5',
    brandId: '1',
    price: 249,
    costPrice: 180,
    discount: 20,
    discountPercentage: 8.0,
    finalPrice: 229,
    stock: 25,
    minStock: 10,
    status: 'activo',
    images: [audifonosImage],
    description: 'Auriculares inalámbricos con cancelación activa de ruido, chip H2, audio espacial y hasta 6 horas de batería con estuche de carga.',
    shortDescription: 'Auriculares con cancelación de ruido activa',
    specifications: {
      'Modelo': 'AirPods Pro (2da Gen)',
      'Color': 'Blanco',
      'Garantía': '12 meses',
      'Peso': '56g',
      'Dimensiones': '46.4 x 21.8 x 24.0 mm',
    },
    createdAt: new Date('2024-02-05T13:30:00').toISOString(),
  },
]; */

export const Products = () => {
  const { repositories } = useInfrastructure();
  const application = useApplication();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<ProductSortKey>('recent');
  const [viewMode, setViewMode] = useState<ProductViewMode>('grid');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [pendingProductIds, setPendingProductIds] = useState<Set<string>>(() => new Set());
  const optimisticProductsRef = useRef<Map<string, Product>>(new Map());
  const editVariantProductIdsRef = useRef<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [variantUrlInputs, setVariantUrlInputs] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    categoryId: '',
    brandId: '',
    price: 0,
    costPrice: 0,
    discount: 0,
    discountPercentage: 0,
    stock: 0,
    minStock: 0,
    status: 'activo',
    images: [],
    description: '',
    shortDescription: '',
    specifications: [],
    notes: '',
    variants: [],
  });

  const displayedProducts = useMemo(() => {
    let list = products.filter((p) => p.status === 'activo');
    const query = deferredSearch.trim().toLowerCase();

    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          (p.description && StripHtmlTags(p.description).toLowerCase().includes(query)) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(query))
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter((p) => p.categoryId === categoryFilter);
    }

    if (brandFilter !== 'all') {
      list = list.filter((p) => p.brandId === brandFilter);
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'es');
      if (sortBy === 'price') {
        return (b.finalPrice || b.price) - (a.finalPrice || a.price);
      }
      if (sortBy === 'stock') return b.stock - a.stock;
      const aDate = a.editedAt || a.createdAt || '';
      const bDate = b.editedAt || b.createdAt || '';
      return new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime();
    });
  }, [products, deferredSearch, categoryFilter, brandFilter, sortBy]);

  const isSearching = searchQuery !== deferredSearch;
  const hasFilters =
    searchQuery.trim().length > 0 || categoryFilter !== 'all' || brandFilter !== 'all';

  useEffect(() => {
    const unsubProducts = repositories.product.subscribe(
      (items) => {
        const server = items;
        const serverIds = new Set(server.map((p) => p.id));

        serverIds.forEach((id) => optimisticProductsRef.current.delete(id));
        setPendingProductIds((prev) => {
          const next = new Set(prev);
          let changed = false;
          serverIds.forEach((id) => {
            if (next.delete(id)) changed = true;
          });
          return changed ? next : prev;
        });

        const pending = Array.from(optimisticProductsRef.current.values()).filter(
          (p) => !serverIds.has(p.id)
        );
        setProducts([...pending, ...server]);
      },
      (error) => console.error('Error subscribing products:', error)
    );

    const unsubCategories = repositories.category.subscribe(
      (items) => setCategories(items),
      (error) => console.error('Error subscribing categories:', error)
    );

    const unsubBrands = repositories.brand.subscribe(
      (items) =>
        setBrands(
          items.map((b) => ({
            ...b,
            categoryIds: Array.isArray(b.categoryIds) ? b.categoryIds : [],
          }))
        ),
      (error) => console.error('Error subscribing brands:', error)
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBrands();
    };
  }, [repositories.product, repositories.category, repositories.brand]);

  useEffect(() => {
    const HandleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', HandleKeyboard);
    return () => window.removeEventListener('keydown', HandleKeyboard);
  }, [searchQuery]);

  const activeCategories = categories.filter((cat) => cat.isActive);
  const activeBrands = brands.filter((brand) => brand.isActive);

  const getCategoryById = (categoryId: string): CategoryOption | undefined => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const getBrandById = (brandId: string): BrandOption | undefined => {
    return brands.find((brand) => brand.id === brandId);
  };

  const generateSKU = (name: string, categoryId: string, brandId: string, colorName?: string): string => {
    const category = getCategoryById(categoryId);
    const brand = getBrandById(brandId);
    
    // Prefijo de categoría (3 letras)
    const categoryPrefix = category 
      ? category.name.substring(0, 3).toUpperCase().replace(/\s/g, '') 
      : 'PRD';
    
    // Prefijo de marca (3 letras)
    const brandPrefix = brand 
      ? brand.name.substring(0, 3).toUpperCase().replace(/\s/g, '') 
      : 'GEN';
    
    // Prefijo del nombre (primeras 3 letras sin espacios)
    const nameWords = name.trim().split(/\s+/);
    let namePrefix = '';
    if (nameWords.length >= 2) {
      // Si tiene 2+ palabras, toma primera letra de cada palabra
      namePrefix = nameWords.slice(0, 3).map(word => word.charAt(0).toUpperCase()).join('');
    } else {
      // Si es una sola palabra, toma las primeras 3 letras
      namePrefix = name.substring(0, 3).toUpperCase().replace(/\s/g, '');
    }
    
    // Número secuencial basado en timestamp (últimos 4 dígitos)
    const timestamp = Date.now().toString();
    const sequential = timestamp.slice(-4);
    const colorSuffix = colorName
      ? `-${colorName.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')}`
      : '';

    return `${categoryPrefix}-${brandPrefix}-${namePrefix}${colorSuffix}-${sequential}`;
  };

  const calculateDiscountPercentage = (price: number, discount: number): number => {
    if (price <= 0 || discount <= 0) return 0;
    return Math.round((discount / price) * 100 * 10) / 10;
  };

  const calculateFinalPrice = (price: number, discount: number): number => {
    return calculateDomainFinalPrice(price, discount > 0 ? discount : undefined);
  };

  const calculateProfitMargin = (costPrice: number, finalPrice: number): number => {
    if (costPrice <= 0 || finalPrice <= costPrice) return 0;
    return Math.round(((finalPrice - costPrice) / costPrice) * 100 * 10) / 10;
  };

  const ResolveVariantPricing = (
    variant: Pick<ProductVariantField, 'price' | 'costPrice' | 'discount'>
  ) => {
    const price = variant.price;
    const discount = variant.discount || 0;
    const discountPercentage = calculateDiscountPercentage(price, discount);
    const finalPrice = calculateFinalPrice(price, discount);

    return {
      price,
      costPrice: variant.costPrice > 0 ? variant.costPrice : undefined,
      discount: discount > 0 ? discount : undefined,
      discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
      finalPrice,
    };
  };

  const CreateDefaultVariantFields = (
    defaults: Pick<ProductFormData, 'price' | 'costPrice' | 'discount'>
  ): Pick<
    ProductVariantField,
    'colorName' | 'colorHex' | 'stock' | 'images' | 'price' | 'costPrice' | 'discount'
  > => ({
    colorName: '',
    colorHex: '#db2777',
    stock: 0,
    images: [],
    price: defaults.price,
    costPrice: defaults.costPrice,
    discount: defaults.discount,
  });

  const slugify = (value: string) => {
    const normalized = value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const slug = normalized
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return slug || 'producto';
  };

  const buildProductId = (name: string, colorName?: string) => {
    const slugPart = colorName ? `${slugify(name)}-${slugify(colorName)}` : slugify(name);
    const base = `prd-${slugPart}`.slice(0, 48);
    const existing = new Set(products.map((p) => p.id));
    if (!existing.has(base)) return base;

    let suffix = 2;
    while (existing.has(`${base}-${suffix}`)) {
      suffix++;
    }
    return `${base}-${suffix}`;
  };

  const showToast = (
    type: 'success' | 'error' | 'warning',
    message: string,
    duration: number = 3000
  ) => {
    const toastOptions = {
      duration,
      className: `toast-with-progress ${type}`,
      style: {
        '--toast-duration': `${duration}ms`,
      } as React.CSSProperties,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast(message, { ...toastOptions, icon: '⚠️' });
        break;
    }
  };

  const handleOpenModal = () => {
    setFormData({
      sku: '',
      name: '',
      categoryId: '',
      brandId: '',
      price: 0,
      costPrice: 0,
      discount: 0,
      discountPercentage: 0,
      stock: 0,
      minStock: 0,
      status: 'activo',
      images: [],
      description: '',
      shortDescription: '',
      specifications: [],
      notes: '',
      variants: [],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setImageUrlInput('');
    setVariantUrlInputs({});
    setFormData({
      sku: '',
      name: '',
      categoryId: '',
      brandId: '',
      price: 0,
      costPrice: 0,
      discount: 0,
      discountPercentage: 0,
      stock: 0,
      minStock: 0,
      status: 'activo',
      images: [],
      description: '',
      shortDescription: '',
      specifications: [],
      notes: '',
      variants: [],
    });
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProductId(product.id);
    setEditingProductId(product.id);
    setIsEditModalOpen(true);
    setVariantUrlInputs({});

    const siblings = FindVariantSiblingProducts(products, product);
    const useVariantEditor = ShouldUseVariantEditor(siblings);
    const baseName = GetProductBaseName(product.name);

    const specifications = product.specifications
      ? Object.entries(product.specifications)
          .filter(([key]) => !(useVariantEditor && key === 'Color'))
          .map(([key, value], index) => ({
            id: `spec-${index}-${Date.now()}`,
            key,
            value,
          }))
      : [];

    const variants = useVariantEditor ? siblings.map(MapProductToVariantField) : [];
    editVariantProductIdsRef.current = siblings.map((item) => item.id);

    const images = useVariantEditor
      ? []
      : product.images
        ? product.images.map((url, index) => ({
            id: `img-${index}-${Date.now()}`,
            file: null as File | null,
            preview: url,
            url,
          }))
        : [];

    setFormData({
      sku: useVariantEditor ? '' : product.sku,
      name: useVariantEditor ? baseName : product.name,
      categoryId: product.categoryId,
      brandId: product.brandId,
      price: product.price,
      costPrice: product.costPrice || 0,
      discount: product.discount || 0,
      discountPercentage: product.discountPercentage || 0,
      stock: useVariantEditor ? 0 : product.stock,
      minStock: product.minStock || 0,
      status: product.status,
      images,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      specifications,
      notes: product.notes || '',
      variants,
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProductId(null);
    setSelectedProductId(null);
    editVariantProductIdsRef.current = [];
    handleCloseModal();
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
  };

  const handleDescriptionChange = (html: string) => {
    setFormData((prev) => ({ ...prev, description: html }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    const currentImageCount = formData.images.length;
    const remainingSlots = MAX_PRODUCT_IMAGES - currentImageCount;

    if (files.length > remainingSlots) {
      showToast(
        'warning',
        `Solo puedes agregar ${remainingSlots} imagen${remainingSlots > 1 ? 'es' : ''} más (máximo ${MAX_PRODUCT_IMAGES} imágenes)`,
        4000
      );
    }

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (muy grande, máximo 5MB)`);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} (formato inválido, solo imágenes)`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      showToast('error', `Algunas imágenes no se pudieron cargar: ${invalidFiles.join(', ')}`, 4000);
    }

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const newImages = validFiles.map((file, index) => {
      const reader = new FileReader();
      const imageId = `img-${Date.now()}-${index}-${Math.random()}`;
      
      return new Promise<{ id: string; file: File; preview: string }>((resolve, reject) => {
        reader.onerror = () => {
          reject(new Error(`Error al leer el archivo ${file.name}`));
        };
        reader.onloadend = () => {
          resolve({
            id: imageId,
            file,
            preview: reader.result as string,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages)
      .then((loadedImages) => {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...loadedImages],
        }));
        if (loadedImages.length > 0) {
          showToast('success', `${loadedImages.length} imagen${loadedImages.length > 1 ? 'es' : ''} agregada${loadedImages.length > 1 ? 's' : ''} correctamente`, 2000);
        }
      })
      .catch((error) => {
        console.error('Error procesando imágenes:', error);
        showToast('error', 'Error al procesar algunas imágenes', 3000);
      });

    e.target.value = '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = ['price', 'costPrice', 'discount', 'stock', 'minStock', 'warranty', 'weight'].includes(name) 
      ? parseFloat(value) || 0 
      : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: numValue };
      
      if (name === 'price' || name === 'discount') {
        const price = name === 'price' ? numValue as number : prev.price;
        const discount = name === 'discount' ? numValue as number : prev.discount;
        updated.discountPercentage = calculateDiscountPercentage(price, discount);
      }
      
      // Generar SKU automáticamente cuando cambia nombre, categoría o marca
      if ((name === 'name' || name === 'categoryId' || name === 'brandId') && !editingProductId) {
        const productName = name === 'name' ? value.trim() : prev.name.trim();
        const productCategory = name === 'categoryId' ? value : prev.categoryId;
        const productBrand = name === 'brandId' ? value : prev.brandId;
        
        if (productName && productCategory && productBrand) {
          updated.sku = generateSKU(productName, productCategory, productBrand);
        }
      }

      if (name === 'categoryId') {
        const selectedBrand = prev.brandId ? getBrandById(prev.brandId) : null;
        if (selectedBrand && !selectedBrand.categoryIds.includes(value)) {
          updated.brandId = '';
          updated.sku = '';
          if (value) {
            showToast('warning', 'La marca seleccionada no pertenece a esta categoría. Por favor selecciona una marca válida.', 3000);
          }
        }
        if (value && !prev.brandId) {
          const availableBrands = activeBrands.filter((b) => b.categoryIds.includes(value));
          if (availableBrands.length === 0) {
            showToast('warning', 'No hay marcas disponibles para esta categoría', 3000);
          }
        }
      }

      if (name === 'brandId' && prev.categoryId) {
        const selectedBrand = value ? getBrandById(value) : null;
        if (selectedBrand && !selectedBrand.categoryIds.includes(prev.categoryId)) {
          updated.categoryId = '';
          updated.brandId = '';
          updated.sku = '';
          showToast('error', 'La marca seleccionada no pertenece a la categoría actual', 3000);
        }
      }
      
      return updated;
    });
  };

  const TryAddImageUrl = (rawUrl: string, clearInput = true): boolean => {
    const url = rawUrl.trim();
    if (!url) {
      showToast('error', 'Escribe o pega una URL de imagen', 3000);
      return false;
    }
    if (!IsValidHttpImageUrl(url)) {
      showToast('error', 'URL inválida. Debe comenzar con http:// o https://', 3000);
      return false;
    }
    if (formData.images.length >= MAX_PRODUCT_IMAGES) {
      showToast('warning', `Máximo ${MAX_PRODUCT_IMAGES} imágenes por producto`, 3000);
      return false;
    }
    if (formData.images.some((img) => (img.url || img.preview) === url)) {
      showToast('warning', 'Esa URL ya está en la lista', 2500);
      return false;
    }

    setFormData((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          id: `img-url-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file: null,
          preview: url,
          url,
        },
      ],
    }));

    if (clearInput) setImageUrlInput('');
    showToast('success', 'Imagen por URL agregada', 2000);
    return true;
  };

  const handleAddImageUrl = () => {
    TryAddImageUrl(imageUrlInput);
  };

  const handleImageUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted.trim() || !IsValidHttpImageUrl(pasted)) return;

    e.preventDefault();
    if (formData.images.length >= MAX_PRODUCT_IMAGES) {
      setImageUrlInput(pasted.trim());
      showToast('warning', `Límite de ${MAX_PRODUCT_IMAGES} imágenes alcanzado`, 3000);
      return;
    }
    TryAddImageUrl(pasted, true);
  };

  const handleAddVariant = () => {
    if (isEditModalOpen && editingProductId && formData.variants.length === 0) {
      const existing = products.find((item) => item.id === editingProductId);
      if (existing && !ShouldUseVariantEditor(FindVariantSiblingProducts(products, existing))) {
        const seeded = MapProductToVariantField(existing);
        const firstColor = seeded.colorName || 'Principal';
        const newVariantId = `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        setFormData((prev) => ({
          ...prev,
          name: GetProductBaseName(existing.name),
          images: [],
          stock: 0,
          sku: '',
          variants: [
            { ...seeded, colorName: firstColor },
            {
              id: newVariantId,
              ...CreateDefaultVariantFields(formData),
            },
          ],
        }));
        editVariantProductIdsRef.current = [editingProductId];
        return;
      }
    }

    const variantId = `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: variantId,
          ...CreateDefaultVariantFields(prev),
        },
      ],
    }));
  };

  const handleRemoveVariant = (variantId: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.id !== variantId),
    }));
    setVariantUrlInputs((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  };

  const handleVariantFieldChange = (
    variantId: string,
    field: ProductVariantFieldKey,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)),
    }));
  };

  const handleApplyColorPreset = (variantId: string, name: string, hex: string) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === variantId ? { ...v, colorName: v.colorName || name, colorHex: hex } : v
      ),
    }));
  };

  const TryAddVariantImageUrl = (variantId: string, rawUrl: string, clearInput = true): boolean => {
    const url = rawUrl.trim();
    if (!url || !IsValidHttpImageUrl(url)) {
      showToast('error', 'URL de imagen inválida', 3000);
      return false;
    }

    const variant = formData.variants.find((v) => v.id === variantId);
    if (!variant) return false;
    if (variant.images.length >= MAX_VARIANT_IMAGES) {
      showToast('warning', `Máximo ${MAX_VARIANT_IMAGES} imágenes por color`, 3000);
      return false;
    }
    if (variant.images.some((img) => (img.url || img.preview) === url)) {
      showToast('warning', 'Esa URL ya está en este color', 2500);
      return false;
    }

    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === variantId
          ? {
              ...v,
              images: [
                ...v.images,
                {
                  id: `img-var-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                  file: null,
                  preview: url,
                  url,
                },
              ],
            }
          : v
      ),
    }));

    if (clearInput) {
      setVariantUrlInputs((prev) => ({ ...prev, [variantId]: '' }));
    }
    return true;
  };

  const handleVariantImageUpload = (variantId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const variant = formData.variants.find((v) => v.id === variantId);
    if (!variant) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const remainingSlots = MAX_VARIANT_IMAGES - variant.images.length;
    const validFiles: File[] = [];

    Array.from(files)
      .slice(0, remainingSlots)
      .forEach((file) => {
        if (file.size <= MAX_FILE_SIZE && file.type.startsWith('image/')) {
          validFiles.push(file);
        }
      });

    if (validFiles.length === 0) {
      e.target.value = '';
      return;
    }

    const loaders = validFiles.map(
      (file, index) =>
        new Promise<ProductVariantField['images'][number]>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error(`Error leyendo ${file.name}`));
          reader.onloadend = () => {
            resolve({
              id: `img-var-${Date.now()}-${index}`,
              file,
              preview: reader.result as string,
            });
          };
          reader.readAsDataURL(file);
        })
    );

    void Promise.all(loaders).then((loaded) => {
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.map((v) =>
          v.id === variantId ? { ...v, images: [...v.images, ...loaded] } : v
        ),
      }));
      showToast('success', `${loaded.length} imagen(es) agregada(s) al color`, 2000);
    });

    e.target.value = '';
  };

  const handleVariantAddImageUrl = (variantId: string) => {
    TryAddVariantImageUrl(variantId, variantUrlInputs[variantId] || '');
  };

  const handleVariantImageUrlPaste = (
    variantId: string,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted.trim() || !IsValidHttpImageUrl(pasted)) return;
    e.preventDefault();
    TryAddVariantImageUrl(variantId, pasted, true);
  };

  const handleVariantImageRemove = (variantId: string, imageId: string) => {
    const variant = formData.variants.find((v) => v.id === variantId);
    const imageToRemove = variant?.images.find((img) => img.id === imageId);

    if (imageToRemove?.url && IsFirebaseStorageUrl(imageToRemove.url)) {
      void deleteProductImage(imageToRemove.url).catch((error) => {
        console.error('Error eliminando imagen del Storage:', error);
      });
    }

    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === variantId ? { ...v, images: v.images.filter((img) => img.id !== imageId) } : v
      ),
    }));
  };

  const handleImageRemove = async (imageId: string) => {
    const imageToRemove = formData.images.find((img) => img.id === imageId);

    if (imageToRemove?.url && IsFirebaseStorageUrl(imageToRemove.url)) {
      try {
        await deleteProductImage(imageToRemove.url);
      } catch (error: unknown) {
        console.error('Error eliminando imagen del Storage:', error);
        showToast(
          'warning',
          'La imagen fue removida del formulario pero no se pudo eliminar del Storage',
          4000
        );
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const handleAddSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        { id: `spec-${Date.now()}-${Math.random()}`, key: '', value: '' },
      ],
    }));
  };

  const handleRemoveSpecification = (specId: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter(spec => spec.id !== specId),
    }));
  };

  const handleSpecificationChange = (specId: string, field: 'key' | 'value', newValue: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map(spec =>
        spec.id === specId ? { ...spec, [field]: newValue } : spec
      ),
    }));
  };

  const updateRelatedCounts = async (
    categoryId: string,
    brandId: string,
    delta: 1 | -1
  ) => {
    await Promise.all([
      repositories.category.update(categoryId, {
        productCount: increment(delta),
      } as unknown as Partial<Category>),
      repositories.brand.update(brandId, {
        productCount: increment(delta),
      } as unknown as Partial<Brand>),
    ]);
  };

  const uploadPendingImagesFromSnapshot = async (
    productName: string,
    images: ProductFormData['images']
  ): Promise<string[]> => {
    const pending = images.filter((img) => !!img.file);
    if (pending.length === 0) return [];

    const urls: string[] = [];
    const errors: Array<{ name: string; message: string }> = [];

    for (let i = 0; i < pending.length; i++) {
      const img = pending[i];
      const file = img.file;
      if (!file) continue;

      try {
        const url = await uploadProductImage({ productName, file });
        urls.push(url);
      } catch (error: unknown) {
        const err = error as { message?: string };
        console.error(`Error subiendo imagen ${i + 1}/${pending.length}:`, error);
        const errorMessage = err?.message || 'Error desconocido';
        errors.push({ name: file.name, message: errorMessage });

        if (
          errorMessage.includes('autenticado') ||
          errorMessage.includes('permisos') ||
          errorMessage.includes('No estás')
        ) {
          showToast('error', errorMessage, 6000);
          break;
        }
      }
    }

    if (errors.length > 0 && urls.length > 0) {
      const errorNames = errors.map((e) => e.name).join(', ');
      showToast(
        'warning',
        `Se subieron ${urls.length} de ${pending.length} imágenes. Errores en: ${errorNames}`,
        5000
      );
    } else if (errors.length === pending.length) {
      const firstError = errors[0]?.message || 'Error al subir imágenes';
      showToast('error', firstError, 6000);
    }

    return urls;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.categoryId || !formData.brandId) {
      showToast('error', 'Por favor completa todos los campos requeridos', 3000);
      return;
    }

    const selectedBrand = getBrandById(formData.brandId);
    if (selectedBrand && !selectedBrand.categoryIds.includes(formData.categoryId)) {
      showToast('error', 'La marca seleccionada no pertenece a la categoría elegida', 3000);
      return;
    }

    const activeVariants = formData.variants.filter((v) => v.colorName.trim());
    const hasVariants = activeVariants.length > 0;

    if (hasVariants) {
      for (const variant of activeVariants) {
        if (variant.price <= 0) {
          showToast(
            'error',
            `El precio del color "${variant.colorName.trim()}" debe ser mayor a 0`,
            4000
          );
          return;
        }
        if ((variant.discount || 0) > variant.price) {
          showToast(
            'error',
            `El descuento del color "${variant.colorName.trim()}" no puede ser mayor al precio`,
            4000
          );
          return;
        }
        if (variant.images.length === 0) {
          showToast(
            'error',
            `Agrega al menos una imagen para el color "${variant.colorName.trim()}"`,
            4000
          );
          return;
        }
      }
    } else {
      if (formData.price <= 0) {
        showToast('error', 'El precio debe ser mayor a 0', 3000);
        return;
      }

      if (formData.discount > formData.price) {
        showToast('error', 'El descuento no puede ser mayor al precio', 3000);
        return;
      }
    }

    const discountPercentage = hasVariants
      ? 0
      : calculateDiscountPercentage(formData.price, formData.discount);
    const finalPrice = hasVariants ? 0 : calculateFinalPrice(formData.price, formData.discount);
    const createdAt = new Date().toISOString();
    const trimmedName = formData.name.trim();
    const snapshotForm = {
      ...formData,
      images: formData.images.map((img) => ({ ...img })),
      variants: formData.variants.map((v) => ({
        ...v,
        images: v.images.map((img) => ({ ...img })),
      })),
    };

    const specificationsObj: Record<string, string> = {};
    formData.specifications.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specificationsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    type CreateDraft = {
      productId: string;
      optimisticProduct: Product;
      imageSnapshot: ProductFormData['images'];
      productName: string;
    };

    const drafts: CreateDraft[] = [];

    if (hasVariants) {
      activeVariants.forEach((variant, index) => {
        const colorName = variant.colorName.trim();
        const displayName = `${trimmedName} — ${colorName}`;
        const productId = buildProductId(trimmedName, colorName);
        const imageUrls = variant.images
          .map((img) => img.url || img.preview)
          .filter((url) => url);
        const variantSpecs = { ...specificationsObj, Color: colorName };
        const variantPricing = ResolveVariantPricing(variant);

        drafts.push({
          productId,
          productName: displayName,
          imageSnapshot: variant.images.map((img) => ({ ...img })),
          optimisticProduct: {
            id: productId,
            sku:
              formData.sku ||
              generateSKU(trimmedName, formData.categoryId, formData.brandId, colorName),
            name: displayName,
            categoryId: formData.categoryId,
            brandId: formData.brandId,
            price: variantPricing.price,
            costPrice: variantPricing.costPrice,
            discount: variantPricing.discount,
            discountPercentage: variantPricing.discountPercentage,
            finalPrice: variantPricing.finalPrice,
            stock: variant.stock,
            minStock: formData.minStock > 0 ? formData.minStock : undefined,
            status: formData.status,
            images: imageUrls.length > 0 ? imageUrls : undefined,
            description: NormalizeDescriptionHtml(formData.description) || undefined,
            shortDescription: formData.shortDescription.trim() || undefined,
            specifications: variantSpecs,
            notes: formData.notes.trim() || undefined,
            createdAt: new Date(Date.now() + index).toISOString(),
          },
        });
      });
    } else {
      if (formData.stock <= 0 && formData.images.length === 0) {
        showToast('error', 'Indica el stock o agrega imágenes del producto', 3000);
        return;
      }

      const existingUrls = formData.images
        .map((img) => img.url || img.preview)
        .filter((url) => url);
      const productId = buildProductId(trimmedName);

      drafts.push({
        productId,
        productName: trimmedName,
        imageSnapshot: snapshotForm.images,
        optimisticProduct: {
          id: productId,
          sku: formData.sku || generateSKU(trimmedName, formData.categoryId, formData.brandId),
          name: trimmedName,
          categoryId: formData.categoryId,
          brandId: formData.brandId,
          price: formData.price,
          costPrice: formData.costPrice > 0 ? formData.costPrice : undefined,
          discount: formData.discount > 0 ? formData.discount : undefined,
          discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
          finalPrice,
          stock: formData.stock,
          minStock: formData.minStock > 0 ? formData.minStock : undefined,
          status: formData.status,
          images: existingUrls.length > 0 ? existingUrls : undefined,
          description: NormalizeDescriptionHtml(formData.description) || undefined,
          shortDescription: formData.shortDescription.trim() || undefined,
          specifications:
            Object.keys(specificationsObj).length > 0 ? specificationsObj : undefined,
          notes: formData.notes.trim() || undefined,
          createdAt,
        },
      });
    }

    const draftIds = new Set(drafts.map((d) => d.productId));

    drafts.forEach((draft) => {
      optimisticProductsRef.current.set(draft.productId, draft.optimisticProduct);
    });

    setPendingProductIds((prev) => {
      const next = new Set(prev);
      draftIds.forEach((id) => next.add(id));
      return next;
    });

    setProducts((prev) => [
      ...drafts.map((d) => d.optimisticProduct),
      ...prev.filter((p) => !draftIds.has(p.id)),
    ]);

    handleCloseModal();

    if (hasVariants) {
      showToast(
        'success',
        `${drafts.length} variantes de "${trimmedName}" agregadas — sincronizando en segundo plano`,
        3000
      );
    } else {
      showToast('success', `Producto "${trimmedName}" agregado — sincronizando en segundo plano`, 2500);
    }

    void (async () => {
      const syncedIds: string[] = [];

      try {
        for (const draft of drafts) {
          const storedUrls = draft.imageSnapshot
            .map((img) => img.url || '')
            .filter((url) => url);

          const newProduct: Product = {
            ...draft.optimisticProduct,
            images: storedUrls.length > 0 ? storedUrls : undefined,
          };

          await application.products.create.execute({ product: newProduct });
          await updateRelatedCounts(newProduct.categoryId, newProduct.brandId, 1);
          syncedIds.push(draft.productId);

          const willUploadImages = draft.imageSnapshot.some((img) => !!img.file);
          if (willUploadImages) {
            const uploadedUrls = await uploadPendingImagesFromSnapshot(
              draft.productName,
              draft.imageSnapshot
            );
            const finalUrls = [...storedUrls, ...uploadedUrls];
            if (finalUrls.length > 0) {
              await repositories.product.update(newProduct.id, { images: finalUrls });
            }
          }
        }
      } catch (error: unknown) {
        syncedIds.forEach((id) => optimisticProductsRef.current.delete(id));
        draftIds.forEach((id) => optimisticProductsRef.current.delete(id));

        setPendingProductIds((prev) => {
          const next = new Set(prev);
          draftIds.forEach((id) => next.delete(id));
          return next;
        });

        setProducts((prev) => prev.filter((p) => !draftIds.has(p.id)));

        const err = error as { message?: string; code?: string };
        console.error('Error creating product(s):', error);
        let errorMessage = hasVariants
          ? 'No se pudieron guardar todas las variantes.'
          : 'No se pudo crear el producto.';

        if (
          err?.message?.includes('autenticado') ||
          err?.code?.includes('unauthorized') ||
          err?.code?.includes('unauthenticated')
        ) {
          errorMessage = 'Error al subir imágenes: Debes iniciar sesión con Google para subir imágenes.';
        } else if (err?.code?.includes('permission')) {
          errorMessage = 'Error de permisos: Verifica las reglas de Storage en Firebase Console.';
        }

        showToast('error', errorMessage, 6000);
      }
    })();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.categoryId || !formData.brandId) {
      showToast('error', 'Por favor completa todos los campos requeridos', 3000);
      return;
    }

    if (!editingProductId) return;

    const selectedBrand = getBrandById(formData.brandId);
    if (selectedBrand && !selectedBrand.categoryIds.includes(formData.categoryId)) {
      showToast('error', 'La marca seleccionada no pertenece a la categoría elegida', 3000);
      return;
    }

    const activeVariants = formData.variants.filter((v) => v.colorName.trim());
    const hasVariants = activeVariants.length > 0;

    if (hasVariants) {
      for (const variant of activeVariants) {
        if (variant.price <= 0) {
          showToast(
            'error',
            `El precio del color "${variant.colorName.trim()}" debe ser mayor a 0`,
            4000
          );
          return;
        }
        if ((variant.discount || 0) > variant.price) {
          showToast(
            'error',
            `El descuento del color "${variant.colorName.trim()}" no puede ser mayor al precio`,
            4000
          );
          return;
        }
        if (variant.images.length === 0) {
          showToast(
            'error',
            `Agrega al menos una imagen para el color "${variant.colorName.trim()}"`,
            4000
          );
          return;
        }
      }
    } else {
      if (formData.price <= 0) {
        showToast('error', 'El precio debe ser mayor a 0', 3000);
        return;
      }

      if (formData.discount > formData.price) {
        showToast('error', 'El descuento no puede ser mayor al precio', 3000);
        return;
      }
    }

    const discountPercentage = hasVariants
      ? 0
      : calculateDiscountPercentage(formData.price, formData.discount);
    const finalPrice = hasVariants ? 0 : calculateFinalPrice(formData.price, formData.discount);
    const editedAt = new Date().toISOString();
    const baseName = formData.name.trim();

    const specificationsObj: Record<string, string> = {};
    formData.specifications.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specificationsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    type VariantEditDraft = {
      variant: ProductVariantField;
      productId: string;
      productName: string;
      optimisticProduct: Product;
      imageSnapshot: ProductFormData['images'];
      isNew: boolean;
      rollback?: Product;
    };

    const rollbackSnapshots = new Map<string, Product>();
    const variantDrafts: VariantEditDraft[] = [];
    const removedProductIds = hasVariants
      ? editVariantProductIdsRef.current.filter(
          (id) => !activeVariants.some((v) => v.productId === id)
        )
      : [];

    if (hasVariants) {
      activeVariants.forEach((variant, index) => {
        const colorName = variant.colorName.trim();
        const displayName = `${baseName} — ${colorName}`;
        const productId = variant.productId || buildProductId(baseName, colorName);
        const existingProduct = variant.productId
          ? products.find((item) => item.id === variant.productId)
          : undefined;
        const imageUrls = variant.images
          .map((img) => img.url || img.preview)
          .filter((url) => url);
        const variantSpecs = { ...specificationsObj, Color: colorName };
        const variantPricing = ResolveVariantPricing(variant);

        const optimisticProduct: Product = {
          id: productId,
          sku:
            existingProduct?.sku ||
            generateSKU(baseName, formData.categoryId, formData.brandId, colorName),
          name: displayName,
          categoryId: formData.categoryId,
          brandId: formData.brandId,
          price: variantPricing.price,
          costPrice: variantPricing.costPrice,
          discount: variantPricing.discount,
          discountPercentage: variantPricing.discountPercentage,
          finalPrice: variantPricing.finalPrice,
          stock: variant.stock,
          minStock: formData.minStock > 0 ? formData.minStock : undefined,
          status: formData.status,
          images: imageUrls.length > 0 ? imageUrls : undefined,
          description: NormalizeDescriptionHtml(formData.description) || undefined,
          shortDescription: formData.shortDescription.trim() || undefined,
          specifications: variantSpecs,
          notes: formData.notes.trim() || undefined,
          createdAt: existingProduct?.createdAt || new Date(Date.now() + index).toISOString(),
          editedAt,
        };

        if (existingProduct) rollbackSnapshots.set(productId, { ...existingProduct });

        variantDrafts.push({
          variant,
          productId,
          productName: displayName,
          optimisticProduct,
          imageSnapshot: variant.images.map((img) => ({ ...img })),
          isNew: !variant.productId,
          rollback: existingProduct,
        });
      });
    } else {
      const existing = products.find((item) => item.id === editingProductId);
      if (!existing) return;

      const trimmedName = baseName;
      const optimisticImageUrls = formData.images
        .map((img) => img.url || img.preview)
        .filter((url) => url);

      variantDrafts.push({
        variant: {
          id: `variant-${existing.id}`,
          productId: existing.id,
          colorName: '',
          colorHex: '#db2777',
          price: formData.price,
          costPrice: formData.costPrice,
          discount: formData.discount,
          stock: formData.stock,
          images: formData.images,
        },
        productId: existing.id,
        productName: trimmedName,
        isNew: false,
        rollback: { ...existing },
        imageSnapshot: formData.images.map((img) => ({ ...img })),
        optimisticProduct: {
          ...existing,
          sku: formData.sku,
          name: trimmedName,
          categoryId: formData.categoryId,
          brandId: formData.brandId,
          price: formData.price,
          costPrice: formData.costPrice > 0 ? formData.costPrice : undefined,
          discount: formData.discount > 0 ? formData.discount : undefined,
          discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
          finalPrice,
          stock: formData.stock,
          minStock: formData.minStock > 0 ? formData.minStock : undefined,
          status: formData.status,
          images: optimisticImageUrls.length > 0 ? optimisticImageUrls : undefined,
          description: NormalizeDescriptionHtml(formData.description) || undefined,
          shortDescription: formData.shortDescription.trim() || undefined,
          specifications:
            Object.keys(specificationsObj).length > 0 ? specificationsObj : undefined,
          notes: formData.notes.trim() || undefined,
          editedAt,
        },
      });
    }

    const affectedIds = new Set([
      ...variantDrafts.map((d) => d.productId),
      ...removedProductIds,
    ]);

    setPendingProductIds((prev) => {
      const next = new Set(prev);
      variantDrafts.forEach((d) => next.add(d.productId));
      return next;
    });

    setProducts((prev) => {
      const optimisticMap = new Map(variantDrafts.map((d) => [d.productId, d.optimisticProduct]));
      const filtered = prev.filter((item) => !removedProductIds.includes(item.id));
      const merged = filtered.map((item) => optimisticMap.get(item.id) || item);
      const newOnes = variantDrafts
        .filter((d) => d.isNew && !filtered.some((item) => item.id === d.productId))
        .map((d) => d.optimisticProduct);
      return [...newOnes, ...merged.filter((item) => !newOnes.some((n) => n.id === item.id))];
    });

    handleCloseEditModal();

    if (hasVariants) {
      showToast(
        'success',
        `${variantDrafts.length} variante(s) de "${baseName}" actualizadas — sincronizando en segundo plano`,
        3000
      );
    } else {
      showToast('success', `Producto "${baseName}" actualizado — sincronizando en segundo plano`, 2500);
    }

    void (async () => {
      try {
        for (const removedId of removedProductIds) {
          const removed = products.find((item) => item.id === removedId);
          if (!removed) continue;

          try {
            await deleteProductFolder(removed.name);
          } catch (error) {
            console.error('Error eliminando carpeta del producto:', error);
          }

          await application.products.delete.execute({
            productId: removedId,
            itemName: removed.name,
          });
          await updateRelatedCounts(removed.categoryId, removed.brandId, -1);
        }

        for (const draft of variantDrafts) {
          const existingProduct = draft.rollback;
          const storedUrls = draft.imageSnapshot
            .map((img) => img.url || '')
            .filter((url) => url);
          const previousImages = existingProduct?.images || [];
          const removedImageUrls = previousImages.filter((url) => !storedUrls.includes(url));

          if (removedImageUrls.length > 0) {
            const storageUrls = removedImageUrls.filter(IsFirebaseStorageUrl);
            await Promise.all(
              storageUrls.map((url) =>
                deleteProductImage(url).catch((err) => {
                  console.error('Error eliminando imagen:', err);
                  return null;
                })
              )
            );
          }

          if (draft.isNew) {
            const newProduct: Product = {
              ...draft.optimisticProduct,
              images: storedUrls.length > 0 ? storedUrls : undefined,
            };
            await application.products.create.execute({ product: newProduct });
            await updateRelatedCounts(newProduct.categoryId, newProduct.brandId, 1);
          } else if (existingProduct) {
            const updateData: Record<string, unknown> = {
              sku: draft.optimisticProduct.sku,
              name: draft.optimisticProduct.name,
              categoryId: formData.categoryId,
              brandId: formData.brandId,
              price: draft.optimisticProduct.price,
              costPrice: draft.optimisticProduct.costPrice,
              discount: draft.optimisticProduct.discount,
              discountPercentage: draft.optimisticProduct.discountPercentage,
              finalPrice: draft.optimisticProduct.finalPrice,
              stock: draft.optimisticProduct.stock,
              minStock: formData.minStock > 0 ? formData.minStock : undefined,
              status: formData.status,
              description: NormalizeDescriptionHtml(formData.description) || undefined,
              shortDescription: formData.shortDescription.trim() || undefined,
              specifications: draft.optimisticProduct.specifications,
              notes: formData.notes.trim() || undefined,
              editedAt,
            };

            if (storedUrls.length > 0) {
              updateData.images = storedUrls;
            } else {
              updateData.images = deleteField();
            }

            await repositories.product.update(draft.productId, updateData as Partial<Product>);

            if (
              existingProduct.categoryId !== formData.categoryId ||
              existingProduct.brandId !== formData.brandId
            ) {
              await updateRelatedCounts(existingProduct.categoryId, existingProduct.brandId, -1);
              await updateRelatedCounts(formData.categoryId, formData.brandId, 1);
            }

            const beforeData: Record<string, unknown> = {
              nombre: existingProduct.name,
              stock: existingProduct.stock,
              imagenes: existingProduct.images?.length || 0,
            };
            const afterData: Record<string, unknown> = {
              nombre: draft.optimisticProduct.name,
              stock: draft.optimisticProduct.stock,
              imagenes: storedUrls.length,
            };
            const changes = compareObjects(beforeData, afterData, {
              nombre: 'Nombre',
              stock: 'Stock',
              imagenes: 'Imágenes',
            });

            await application.history.log.execute({
              action: 'update',
              section: 'products',
              itemName: draft.productName,
              itemId: draft.productId,
              details: `Producto "${draft.productName}" actualizado`,
              changes: changes.length > 0 ? changes : undefined,
              actorType: 'admin',
            });
          }

          const willUploadImages = draft.imageSnapshot.some((img) => !!img.file);
          if (willUploadImages) {
            const uploadedUrls = await uploadPendingImagesFromSnapshot(
              draft.productName,
              draft.imageSnapshot
            );
            const finalUrls = [...storedUrls, ...uploadedUrls];
            if (finalUrls.length > 0) {
              await repositories.product.update(draft.productId, { images: finalUrls });
            }
          }
        }
      } catch (error: unknown) {
        setProducts((prev) => {
          let next = prev.filter((item) => !variantDrafts.some((d) => d.isNew && d.productId === item.id));
          rollbackSnapshots.forEach((snapshot, id) => {
            next = next.map((item) => (item.id === id ? snapshot : item));
          });
          return next;
        });

        setPendingProductIds((prev) => {
          const next = new Set(prev);
          affectedIds.forEach((id) => next.delete(id));
          return next;
        });

        const err = error as { message?: string; code?: string };
        console.error('Error updating product(s):', error);
        let errorMessage = hasVariants
          ? 'No se pudieron guardar todas las variantes.'
          : 'No se pudo editar el producto.';

        if (
          err?.message?.includes('autenticado') ||
          err?.code?.includes('unauthorized') ||
          err?.code?.includes('unauthenticated')
        ) {
          errorMessage = 'Error al subir imágenes: Debes iniciar sesión con Google para subir imágenes.';
        } else if (err?.code?.includes('permission')) {
          errorMessage = 'Error de permisos: Verifica las reglas de Storage en Firebase Console.';
        }

        showToast('error', errorMessage, 6000);
      }
    })();
  };

  const handleDeleteProduct = async (product: Product) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      html: `
        <div style="text-align: center;">
          <p style="font-size: 1.1rem; margin-bottom: 1rem;">
            El producto <strong style="color: #ef4444;">"${product.name}"</strong> será eliminado permanentemente.
          </p>
          <p style="color: #991b1b; font-size: 0.9rem; background: #fef2f2; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #ef4444;">
            Esta acción no se puede deshacer.
          </p>
        </div>
      `,
      icon: 'warning',
      iconColor: '#ef4444',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusConfirm: false,
      customClass: {
        popup: 'swal2-popup-custom',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom',
      },
    });

    if (result.isConfirmed) {
      try {
        // Eliminar todas las imágenes del Storage primero
        showToast('success', `Eliminando imágenes del producto "${product.name}"...`, 3000);
        try {
          await deleteProductFolder(product.name);
        } catch (error: any) {
          console.error('Error eliminando carpeta del producto del Storage:', error);
          // Continuar aunque falle la eliminación del Storage, pero informar al usuario
          showToast('warning', 'El producto se eliminó pero algunas imágenes pueden no haberse eliminado del Storage', 4000);
        }

        await application.products.delete.execute({
          productId: product.id,
          itemName: product.name,
        });
        await updateRelatedCounts(product.categoryId, product.brandId, -1);
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast('error', 'No se pudo eliminar el producto', 3000);
        return;
      }

      await Swal.fire({
        title: '¡Eliminado!',
        text: `El producto "${product.name}" ha sido eliminado permanentemente`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Perfecto',
        timer: 2000,
        timerProgressBar: true,
      });

      showToast('success', `Producto "${product.name}" eliminado permanentemente`, 3000);
    }
  };

  const formatCurrency = (amount: number) => formatMoney(amount);

  const totalProducts = displayedProducts.length;
  const totalStock = displayedProducts.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = displayedProducts.reduce((sum, p) => {
    const finalPrice = p.finalPrice || p.price;
    return sum + finalPrice * p.stock;
  }, 0);
  const lowStockCount = displayedProducts.filter((p) => {
    const minStock = p.minStock || 10;
    return p.stock <= minStock;
  }).length;

  const hasActiveVariants = formData.variants.length > 0;

  const RenderProductImagesSection = (fileInputId: string) => (
    <div className="form-section">
      <h3 className="form-section-title">Imágenes del Producto</h3>
      <p className="form-hint form-hint--block">
        Sube archivos desde tu PC, pega URLs de otras páginas o combina ambos métodos (máximo{' '}
        {MAX_PRODUCT_IMAGES} imágenes, 5MB por archivo).
      </p>

      {formData.images.length > 0 && (
        <p
          className="form-hint form-hint--block"
          style={{ color: formData.images.length >= MAX_PRODUCT_IMAGES ? '#ef4444' : undefined }}
        >
          {formData.images.length} de {MAX_PRODUCT_IMAGES} imágenes agregadas
        </p>
      )}

      {formData.images.length > 0 && (
        <div className="images-preview-grid">
          {formData.images.map((img) => (
            <div key={img.id} className="image-preview-item">
              <img
                src={img.preview || img.url || ''}
                alt="Vista previa"
                className="image-preview-thumb"
              />
              <button
                type="button"
                className="btn-remove-image-small"
                onClick={() => handleImageRemove(img.id)}
                title="Eliminar imagen"
              >
                ×
              </button>
              {img.file && (
                <div className="image-upload-indicator" title="Archivo pendiente de subir">
                  ⏳
                </div>
              )}
              {!img.file && img.url && !IsFirebaseStorageUrl(img.url) && (
                <div className="image-url-indicator" title="Imagen por URL externa">
                  🔗
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="image-sources">
        <div className="form-group">
          <label className="form-label">Subir desde tu dispositivo</label>
          <div className="image-upload-area">
            <input
              type="file"
              id={fileInputId}
              name="image"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="image-input"
              disabled={formData.images.length >= MAX_PRODUCT_IMAGES}
            />
            <label
              htmlFor={fileInputId}
              className="image-upload-label"
              style={{ opacity: formData.images.length >= MAX_PRODUCT_IMAGES ? 0.6 : 1 }}
            >
              <span className="upload-icon">📷</span>
              <span className="upload-text">
                <strong>Haz clic para subir</strong> o arrastra imágenes aquí
              </span>
              <span className="upload-hint">
                PNG, JPG, WEBP hasta 5MB cada una
                {formData.images.length >= MAX_PRODUCT_IMAGES && ' (límite alcanzado)'}
              </span>
            </label>
          </div>
        </div>

        <div className="image-source-divider" aria-hidden="true">
          <span>o</span>
        </div>

        <div className="form-group">
          <label htmlFor={`${fileInputId}-url`} className="form-label">
            Pegar URL de imagen
          </label>
          <div className="image-url-row">
            <input
              type="url"
              id={`${fileInputId}-url`}
              className="form-input image-url-input"
              placeholder="https://ejemplo.com/imagen-producto.jpg"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              onPaste={handleImageUrlPaste}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddImageUrl();
                }
              }}
              disabled={formData.images.length >= MAX_PRODUCT_IMAGES}
            />
            <button
              type="button"
              className="btn-add-image-url"
              onClick={handleAddImageUrl}
              disabled={!imageUrlInput.trim() || formData.images.length >= MAX_PRODUCT_IMAGES}
            >
              Agregar URL
            </button>
          </div>
          <span className="form-hint">
            Pega el enlace directo de la imagen (Ctrl+V). También puedes escribir la URL y pulsar
            Enter o &quot;Agregar URL&quot;.
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="products-page">
      <ProductPageHeader OnOpenCreate={handleOpenModal} />

      <ProductKpiStrip
        TotalProducts={totalProducts}
        TotalStock={totalStock}
        TotalValue={formatCurrency(totalValue)}
        LowStockCount={lowStockCount}
      />

      <ProductCommandBar
        SearchQuery={searchQuery}
        OnSearchChange={setSearchQuery}
        OnClearSearch={() => setSearchQuery('')}
        IsSearching={isSearching}
        CategoryFilter={categoryFilter}
        BrandFilter={brandFilter}
        OnCategoryFilterChange={setCategoryFilter}
        OnBrandFilterChange={setBrandFilter}
        ActiveCategories={activeCategories}
        ActiveBrands={activeBrands}
        ViewMode={viewMode}
        OnViewModeChange={setViewMode}
        SortBy={sortBy}
        OnSortChange={setSortBy}
        ResultCount={displayedProducts.length}
        SearchInputRef={searchInputRef}
      />

      {viewMode === 'table' ? (
        <ProductTableView
          Products={displayedProducts}
          PendingProductIds={pendingProductIds}
          SelectedProductId={selectedProductId}
          GetCategoryById={getCategoryById}
          GetBrandById={getBrandById}
          FormatCurrency={formatCurrency}
          CalculateDiscountPercentage={calculateDiscountPercentage}
          OnSelect={handleSelectProduct}
          OnEdit={handleOpenEditModal}
          OnDelete={handleDeleteProduct}
          HasFilters={hasFilters}
        />
      ) : (
        <div className="products-grid">
          {displayedProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              Product={product}
              Index={index}
              IsPending={pendingProductIds.has(product.id)}
              IsSelected={selectedProductId === product.id}
              Category={getCategoryById(product.categoryId)}
              Brand={getBrandById(product.brandId)}
              FormatCurrency={formatCurrency}
              CalculateDiscountPercentage={calculateDiscountPercentage}
              OnSelect={handleSelectProduct}
              OnEdit={handleOpenEditModal}
              OnDelete={handleDeleteProduct}
            />
          ))}
          {displayedProducts.length === 0 && (
            <div className="products-empty" style={{ gridColumn: '1 / -1' }}>
              <span className="products-empty__emoji" aria-hidden="true">
                📦
              </span>
              <h3>Sin resultados</h3>
              <p>
                {hasFilters
                  ? 'No hay productos activos que coincidan con los filtros.'
                  : 'Aún no hay productos activos. Crea el primero desde el botón superior.'}
              </p>
              {!hasFilters && (
                <button type="button" className="products-empty__cta" onClick={handleOpenModal}>
                  Crear primer producto
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nuevo Producto / Variantes</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-section">
                <h3 className="form-section-title">Información Básica</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sku" className="form-label">
                      SKU / Código <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Se genera automáticamente al ingresar nombre, categoría y marca"
                      required
                      readOnly
                    />
                    <span className="form-hint">Se genera automáticamente basado en categoría, marca y nombre del producto</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Nombre del Producto <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: iPhone 15 Pro Max 256GB"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="categoryId" className="form-label">
                      Categoría <span className="required">*</span>
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {activeCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="brandId" className="form-label">
                      Marca <span className="required">*</span>
                    </label>
                    <select
                      id="brandId"
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Selecciona una marca</option>
                      {(formData.categoryId
                        ? activeBrands.filter((b) => b.categoryIds.includes(formData.categoryId))
                        : activeBrands
                      ).map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="shortDescription" className="form-label">
                    Descripción Corta
                  </label>
                  <input
                    type="text"
                    id="shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Breve descripción del producto (máx. 100 caracteres)"
                    maxLength={100}
                  />
                  <span className="form-hint">Aparecerá en listados y tarjetas de producto</span>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Descripción Completa
                  </label>
                  <ProductRichTextEditor
                    Id="description"
                    Value={formData.description}
                    OnChange={handleDescriptionChange}
                    Placeholder="Descripción detallada del producto, características principales, beneficios..."
                  />
                  <span className="form-hint">
                    Usa la barra de herramientas para negritas, viñetas, tipo de letra y más formatos.
                  </span>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">
                  {hasActiveVariants ? 'Precios de referencia' : 'Precios y Descuentos'}
                </h3>
                {hasActiveVariants && (
                  <p className="form-hint form-hint--block product-variants-pricing-hint">
                    Cada color define su propio precio en la sección de variantes. Los valores de
                    aquí solo se usan como plantilla al agregar un color nuevo.
                  </p>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price" className="form-label">
                      Precio de Venta (PEN){' '}
                      {!hasActiveVariants && <span className="required">*</span>}
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required={!hasActiveVariants}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="costPrice" className="form-label">
                      Precio de Costo (PEN)
                    </label>
                    <input
                      type="number"
                      id="costPrice"
                      name="costPrice"
                      value={formData.costPrice || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    <span className="form-hint">Para calcular el margen de ganancia</span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="discount" className="form-label">
                      Descuento (PEN)
                    </label>
                    <input
                      type="number"
                      id="discount"
                      name="discount"
                      value={formData.discount || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      max={formData.price}
                    />
                    <span className="form-hint">
                      {formData.discount > 0 && formData.price > 0 && (
                        <span className="discount-badge">
                          Descuento: {calculateDiscountPercentage(formData.price, formData.discount)}% | 
                          Precio Final: {formatCurrency(calculateFinalPrice(formData.price, formData.discount))}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Margen de Ganancia
                    </label>
                    <div className="profit-margin-display">
                      {formData.costPrice > 0 && formData.price > 0 ? (
                        <span className={`profit-value ${formData.price > formData.costPrice ? 'positive' : 'negative'}`}>
                          {calculateProfitMargin(formData.costPrice, calculateFinalPrice(formData.price, formData.discount))}%
                        </span>
                      ) : (
                        <span className="profit-value neutral">Ingresa precio y costo</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Inventario</h3>

                {!hasActiveVariants ? (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="stock" className="form-label">
                        Stock Disponible <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock || ''}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="0"
                        min="0"
                        required
                      />
                      <span className="form-hint">Cantidad de unidades en inventario</span>
                    </div>

                    <div className="form-group">
                      <label htmlFor="minStock" className="form-label">
                        Stock Mínimo
                      </label>
                      <input
                        type="number"
                        id="minStock"
                        name="minStock"
                        value={formData.minStock || ''}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="0"
                        min="0"
                      />
                      <span className="form-hint">Recibirás alerta cuando baje de este nivel</span>
                    </div>
                  </div>
                ) : (
                  <p className="form-hint form-hint--block product-variants-stock-hint">
                    El stock se define por cada color en la sección de variantes de abajo.
                  </p>
                )}

                <div className="form-row">
                  {hasActiveVariants && (
                    <div className="form-group">
                      <label htmlFor="minStock" className="form-label">
                        Stock Mínimo (global)
                      </label>
                      <input
                        type="number"
                        id="minStock"
                        name="minStock"
                        value={formData.minStock || ''}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="0"
                        min="0"
                      />
                      <span className="form-hint">Aplica a todas las variantes creadas</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="status" className="form-label">
                      Estado <span className="required">*</span>
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <ProductVariantsSection
                Variants={formData.variants}
                VariantUrlInputs={variantUrlInputs}
                OnVariantUrlInputChange={(variantId, value) =>
                  setVariantUrlInputs((prev) => ({ ...prev, [variantId]: value }))
                }
                OnAddVariant={handleAddVariant}
                OnRemoveVariant={handleRemoveVariant}
                OnVariantFieldChange={handleVariantFieldChange}
                OnApplyColorPreset={handleApplyColorPreset}
                OnVariantImageUpload={handleVariantImageUpload}
                OnVariantAddImageUrl={handleVariantAddImageUrl}
                OnVariantImageUrlPaste={handleVariantImageUrlPaste}
                OnVariantImageRemove={handleVariantImageRemove}
                MaxImagesPerVariant={MAX_VARIANT_IMAGES}
                FormatCurrency={formatCurrency}
                CalculateDiscountPercentage={calculateDiscountPercentage}
                CalculateFinalPrice={calculateFinalPrice}
              />

              <div className="form-section">
                <h3 className="form-section-title">Especificaciones Técnicas</h3>
                <p className="form-hint" style={{ marginBottom: '1rem' }}>
                  Agrega especificaciones personalizadas según el tipo de producto (ej: Modelo, Color, Capacidad para celulares; Voltaje, Amperaje para cargadores)
                </p>
                
                <div className="specifications-list">
                  {formData.specifications.map((spec) => (
                    <div key={spec.id} className="specification-item">
                      <div className="form-row" style={{ marginBottom: 0 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Nombre de la especificación (ej: Modelo, Color, Voltaje)"
                            value={spec.key}
                            onChange={(e) => handleSpecificationChange(spec.id, 'key', e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Valor (ej: iPhone 15, 5V, 256GB)"
                            value={spec.value}
                            onChange={(e) => handleSpecificationChange(spec.id, 'value', e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ width: 'auto', minWidth: '48px' }}>
                          <button
                            type="button"
                            className="btn-remove-spec"
                            onClick={() => handleRemoveSpecification(spec.id)}
                            title="Eliminar especificación"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-add-spec"
                  onClick={handleAddSpecification}
                >
                  <span>+</span>
                  Agregar Especificación
                </button>
              </div>

              {hasActiveVariants ? (
                <div className="form-section product-variants-images-note">
                  <p className="form-hint form-hint--block">
                    Las imágenes se configuran por color en cada tarjeta de variante. No necesitas
                    subir imágenes generales aquí.
                  </p>
                </div>
              ) : (
                RenderProductImagesSection('image')
              )}

              <div className="form-section">
                <h3 className="form-section-title">Notas Adicionales</h3>
                
                <div className="form-group">
                  <label htmlFor="notes" className="form-label">
                    Notas Internas
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Notas privadas solo para administradores (no visible para clientes)"
                    rows={3}
                  />
                  <span className="form-hint">Información interna sobre el producto</span>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-submit">
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Editar Producto / Variantes</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="product-form">
              <div className="form-section">
                <h3 className="form-section-title">Información Básica</h3>
                
                <div className="form-row">
                  {!hasActiveVariants && (
                    <div className="form-group">
                      <label htmlFor="edit-sku" className="form-label">
                        SKU / Código <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="edit-sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Se genera automáticamente"
                        required
                        readOnly
                      />
                      <span className="form-hint">El SKU se genera automáticamente y no puede modificarse manualmente</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="edit-name" className="form-label">
                      {hasActiveVariants ? 'Nombre base del modelo' : 'Nombre del Producto'}{' '}
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                    {hasActiveVariants && (
                      <span className="form-hint">
                        Cada color se guarda como &quot;{formData.name || 'Modelo'}
                        {VARIANT_NAME_SEPARATOR}Color&quot;
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-categoryId" className="form-label">
                      Categoría <span className="required">*</span>
                    </label>
                    <select
                      id="edit-categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {activeCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-brandId" className="form-label">
                      Marca <span className="required">*</span>
                    </label>
                    <select
                      id="edit-brandId"
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Selecciona una marca</option>
                      {(formData.categoryId
                        ? activeBrands.filter((b) => b.categoryIds.includes(formData.categoryId))
                        : activeBrands
                      ).map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-shortDescription" className="form-label">
                    Descripción Corta
                  </label>
                  <input
                    type="text"
                    id="edit-shortDescription"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    className="form-input"
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-description" className="form-label">
                    Descripción Completa
                  </label>
                  <ProductRichTextEditor
                    Id="edit-description"
                    Value={formData.description}
                    OnChange={handleDescriptionChange}
                    Placeholder="Descripción detallada del producto, características principales, beneficios..."
                  />
                  <span className="form-hint">
                    Usa la barra de herramientas para negritas, viñetas, tipo de letra y más formatos.
                  </span>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">
                  {hasActiveVariants ? 'Precios de referencia' : 'Precios y Descuentos'}
                </h3>
                {hasActiveVariants && (
                  <p className="form-hint form-hint--block product-variants-pricing-hint">
                    Cada color define su propio precio en la sección de variantes. Los valores de
                    aquí solo se usan como plantilla al agregar un color nuevo.
                  </p>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-price" className="form-label">
                      Precio de Venta (PEN){' '}
                      {!hasActiveVariants && <span className="required">*</span>}
                    </label>
                    <input
                      type="number"
                      id="edit-price"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      step="0.01"
                      required={!hasActiveVariants}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-costPrice" className="form-label">
                      Precio de Costo (PEN)
                    </label>
                    <input
                      type="number"
                      id="edit-costPrice"
                      name="costPrice"
                      value={formData.costPrice || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-discount" className="form-label">
                      Descuento (PEN)
                    </label>
                    <input
                      type="number"
                      id="edit-discount"
                      name="discount"
                      value={formData.discount || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      step="0.01"
                      max={formData.price}
                    />
                    <span className="form-hint">
                      {formData.discount > 0 && formData.price > 0 && (
                        <span className="discount-badge">
                          Descuento: {calculateDiscountPercentage(formData.price, formData.discount)}% | 
                          Precio Final: {formatCurrency(calculateFinalPrice(formData.price, formData.discount))}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Margen de Ganancia
                    </label>
                    <div className="profit-margin-display">
                      {formData.costPrice > 0 && formData.price > 0 ? (
                        <span className={`profit-value ${formData.price > formData.costPrice ? 'positive' : 'negative'}`}>
                          {calculateProfitMargin(formData.costPrice, calculateFinalPrice(formData.price, formData.discount))}%
                        </span>
                      ) : (
                        <span className="profit-value neutral">Ingresa precio y costo</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Inventario</h3>

                {!hasActiveVariants ? (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-stock" className="form-label">
                        Stock Disponible <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        id="edit-stock"
                        name="stock"
                        value={formData.stock || ''}
                        onChange={handleInputChange}
                        className="form-input"
                        min="0"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-minStock" className="form-label">
                        Stock Mínimo
                      </label>
                      <input
                        type="number"
                        id="edit-minStock"
                        name="minStock"
                        value={formData.minStock || ''}
                        onChange={handleInputChange}
                        className="form-input"
                        min="0"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="form-hint form-hint--block product-variants-stock-hint">
                    El stock se define por cada color en la sección de variantes.
                  </p>
                )}

                <div className="form-row">
                  {hasActiveVariants && (
                    <div className="form-group">
                      <label htmlFor="edit-minStock" className="form-label">
                        Stock Mínimo (global)
                      </label>
                      <input
                        type="number"
                        id="edit-minStock"
                        name="minStock"
                        value={formData.minStock || ''}
                        onChange={handleInputChange}
                        className="form-input"
                        min="0"
                      />
                      <span className="form-hint">Aplica a todas las variantes</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="edit-status" className="form-label">
                      Estado <span className="required">*</span>
                    </label>
                    <select
                      id="edit-status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              <ProductVariantsSection
                Variants={formData.variants}
                VariantUrlInputs={variantUrlInputs}
                OnVariantUrlInputChange={(variantId, value) =>
                  setVariantUrlInputs((prev) => ({ ...prev, [variantId]: value }))
                }
                OnAddVariant={handleAddVariant}
                OnRemoveVariant={handleRemoveVariant}
                OnVariantFieldChange={handleVariantFieldChange}
                OnApplyColorPreset={handleApplyColorPreset}
                OnVariantImageUpload={handleVariantImageUpload}
                OnVariantAddImageUrl={handleVariantAddImageUrl}
                OnVariantImageUrlPaste={handleVariantImageUrlPaste}
                OnVariantImageRemove={handleVariantImageRemove}
                MaxImagesPerVariant={MAX_VARIANT_IMAGES}
                FormatCurrency={formatCurrency}
                CalculateDiscountPercentage={calculateDiscountPercentage}
                CalculateFinalPrice={calculateFinalPrice}
              />

              <div className="form-section">
                <h3 className="form-section-title">Especificaciones Técnicas</h3>
                <p className="form-hint" style={{ marginBottom: '1rem' }}>
                  Agrega especificaciones personalizadas según el tipo de producto (ej: Modelo, Color, Capacidad para celulares; Voltaje, Amperaje para cargadores)
                </p>
                
                <div className="specifications-list">
                  {formData.specifications.map((spec) => (
                    <div key={spec.id} className="specification-item">
                      <div className="form-row" style={{ marginBottom: 0 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Nombre de la especificación (ej: Modelo, Color, Voltaje)"
                            value={spec.key}
                            onChange={(e) => handleSpecificationChange(spec.id, 'key', e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Valor (ej: iPhone 15, 5V, 256GB)"
                            value={spec.value}
                            onChange={(e) => handleSpecificationChange(spec.id, 'value', e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ width: 'auto', minWidth: '48px' }}>
                          <button
                            type="button"
                            className="btn-remove-spec"
                            onClick={() => handleRemoveSpecification(spec.id)}
                            title="Eliminar especificación"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-add-spec"
                  onClick={handleAddSpecification}
                >
                  <span>+</span>
                  Agregar Especificación
                </button>
              </div>

              {hasActiveVariants ? (
                <div className="form-section product-variants-images-note">
                  <p className="form-hint form-hint--block">
                    Las imágenes se editan por color en cada tarjeta de variante.
                  </p>
                </div>
              ) : (
                RenderProductImagesSection('edit-image')
              )}

              <div className="form-section">
                <h3 className="form-section-title">Notas Adicionales</h3>
                
                <div className="form-group">
                  <label htmlFor="edit-notes" className="form-label">
                    Notas Internas
                  </label>
                  <textarea
                    id="edit-notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={handleCloseEditModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-submit">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
