import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Products.css';
import { historyService, compareObjects } from '../../utils/historyService';
import { COLLECTIONS } from '../../firebase/collections';
import {
  deleteDocById,
  setDocById,
  subscribeCollection,
  updateDocById,
} from '../../firebase/firestoreHelpers';
import { increment, deleteField } from 'firebase/firestore';
import { uploadProductImage, deleteProductImage, deleteProductFolder } from '../../firebase/storageHelpers';

interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  brandId: string;
  price: number;
  costPrice?: number;
  discount?: number;
  discountPercentage?: number;
  finalPrice: number;
  stock: number;
  minStock?: number;
  status: 'activo' | 'inactivo';
  images?: string[];
  description?: string;
  shortDescription?: string;
  specifications?: { [key: string]: string };
  notes?: string;
  createdAt?: string;
  editedAt?: string;
}

interface FirestoreCategory {
  id: string;
  name: string;
  isActive: boolean;
  color: string;
  gradient: string;
}

interface FirestoreBrand {
  id: string;
  name: string;
  isActive: boolean;
  color: string;
  gradient: string;
  categoryIds: string[];
}

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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [brands, setBrands] = useState<FirestoreBrand[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
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
    status: 'activo' as 'activo' | 'inactivo',
    images: [] as Array<{ id: string; file: File | null; preview: string; url?: string }>,
    description: '',
    shortDescription: '',
    specifications: [] as Array<{ key: string; value: string; id: string }>,
    notes: '',
  });

  useEffect(() => {
    const unsubProducts = subscribeCollection<Product>(
      COLLECTIONS.products,
      (items) => setProducts(items),
      (error) => console.error('Error subscribing products:', error)
    );

    const unsubCategories = subscribeCollection<FirestoreCategory>(
      COLLECTIONS.categories,
      (items) => setCategories(items),
      (error) => console.error('Error subscribing categories:', error)
    );

    const unsubBrands = subscribeCollection<FirestoreBrand & { categoryId?: string; categoryIds?: string[] }>(
      COLLECTIONS.brands,
      (items) =>
        setBrands(
          items.map((b) => ({
            ...b,
            categoryIds: Array.isArray(b.categoryIds)
              ? b.categoryIds
              : b.categoryId
                ? [b.categoryId]
                : [],
          }))
        ),
      (error) => console.error('Error subscribing brands:', error)
    );

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBrands();
    };
  }, []);

  const activeCategories = categories.filter((cat) => cat.isActive);
  const activeBrands = brands.filter((brand) => brand.isActive);

  const getCategoryById = (categoryId: string): FirestoreCategory | undefined => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const getBrandById = (brandId: string): FirestoreBrand | undefined => {
    return brands.find((brand) => brand.id === brandId);
  };

  const generateSKU = (name: string, categoryId: string, brandId: string): string => {
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
    
    // Formato: CAT-MAR-NOM-####
    return `${categoryPrefix}-${brandPrefix}-${namePrefix}-${sequential}`;
  };

  const calculateDiscountPercentage = (price: number, discount: number): number => {
    if (price <= 0 || discount <= 0) return 0;
    return Math.round((discount / price) * 100 * 10) / 10;
  };

  const calculateFinalPrice = (price: number, discount: number): number => {
    return Math.max(0, price - discount);
  };

  const calculateProfitMargin = (costPrice: number, finalPrice: number): number => {
    if (costPrice <= 0 || finalPrice <= costPrice) return 0;
    return Math.round(((finalPrice - costPrice) / costPrice) * 100 * 10) / 10;
  };

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

  const buildProductId = (name: string) => {
    const base = `prd-${slugify(name)}`.slice(0, 48);
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
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
    });
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setIsEditModalOpen(true);
    const specifications = product.specifications 
      ? Object.entries(product.specifications).map(([key, value], index) => ({
          id: `spec-${index}-${Date.now()}`,
          key,
          value,
        }))
      : [];
    const images = product.images 
      ? product.images.map((url, index) => ({
          id: `img-${index}-${Date.now()}`,
          file: null as File | null,
          preview: url,
          url: url,
        }))
      : [];
    setFormData({
      sku: product.sku,
      name: product.name,
      categoryId: product.categoryId,
      brandId: product.brandId,
      price: product.price,
      costPrice: product.costPrice || 0,
      discount: product.discount || 0,
      discountPercentage: product.discountPercentage || 0,
      stock: product.stock,
      minStock: product.minStock || 0,
      status: product.status,
      images,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      specifications,
      notes: product.notes || '',
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProductId(null);
    handleCloseModal();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_IMAGES = 10;
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    const currentImageCount = formData.images.length;
    const remainingSlots = MAX_IMAGES - currentImageCount;

    if (files.length > remainingSlots) {
      showToast(
        'warning',
        `Solo puedes agregar ${remainingSlots} imagen${remainingSlots > 1 ? 'es' : ''} más (máximo ${MAX_IMAGES} imágenes)`,
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

  const handleImageRemove = async (imageId: string) => {
    const imageToRemove = formData.images.find(img => img.id === imageId);
    
    // Si la imagen tiene URL (ya está en Storage), eliminarla
    if (imageToRemove?.url) {
      try {
        await deleteProductImage(imageToRemove.url);
      } catch (error: any) {
        console.error('Error eliminando imagen del Storage:', error);
        showToast('warning', 'La imagen fue removida del formulario pero no se pudo eliminar del Storage', 4000);
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId),
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
      updateDocById(COLLECTIONS.categories, categoryId, {
        productCount: increment(delta),
      } as unknown as object),
      updateDocById(COLLECTIONS.brands, brandId, {
        productCount: increment(delta),
      } as unknown as object),
    ]);
  };

  const uploadPendingImages = async (productName: string): Promise<string[]> => {
    const pending = formData.images.filter((img) => !!img.file);
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
      } catch (error: any) {
        console.error(`Error subiendo imagen ${i + 1}/${pending.length}:`, error);
        const errorMessage = error?.message || 'Error desconocido';
        errors.push({ name: file.name, message: errorMessage });
        
        if (errorMessage.includes('autenticado') || errorMessage.includes('permisos') || errorMessage.includes('No estás')) {
          showToast('error', errorMessage, 6000);
          break;
        }
      }
    }

    if (errors.length > 0 && urls.length > 0) {
      const errorNames = errors.map(e => e.name).join(', ');
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    if (formData.price <= 0) {
      showToast('error', 'El precio debe ser mayor a 0', 3000);
      return;
    }

    if (formData.discount > formData.price) {
      showToast('error', 'El descuento no puede ser mayor al precio', 3000);
      return;
    }

    const willUploadImages = formData.images.some((img) => !!img.file);
    const pendingImageCount = formData.images.filter((img) => !!img.file).length;

    const discountPercentage = calculateDiscountPercentage(formData.price, formData.discount);
    const finalPrice = calculateFinalPrice(formData.price, formData.discount);
    const existingUrls = formData.images
      .map((img) => img.url || '')
      .filter((url) => url);
    const createdAt = new Date().toISOString();

    const specificationsObj: { [key: string]: string } = {};
    formData.specifications.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specificationsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    const trimmedName = formData.name.trim();

    const newProduct: Product = {
      id: buildProductId(trimmedName),
      sku: formData.sku || generateSKU(formData.name.trim(), formData.categoryId, formData.brandId),
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
      description: formData.description.trim() || undefined,
      shortDescription: formData.shortDescription.trim() || undefined,
      specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : undefined,
      notes: formData.notes.trim() || undefined,
      createdAt,
    };

    try {
      const { id, ...data } = newProduct;
      await setDocById(COLLECTIONS.products, id, data);
      await updateRelatedCounts(newProduct.categoryId, newProduct.brandId, 1);

      if (willUploadImages) {
        showToast('success', `Subiendo ${pendingImageCount} imagen${pendingImageCount > 1 ? 'es' : ''}...`, 3000);
        const uploadedUrls = await uploadPendingImages(newProduct.name);
        const finalUrls = [...existingUrls, ...uploadedUrls];
        if (finalUrls.length > 0) {
          await updateDocById<Product>(COLLECTIONS.products, id, { images: finalUrls });
        }
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      let errorMessage = 'No se pudo crear el producto.';
      
      if (error?.message?.includes('autenticado') || error?.code?.includes('unauthorized') || error?.code?.includes('unauthenticated')) {
        errorMessage = 'Error al subir imágenes: Debes iniciar sesión con Google para subir imágenes.';
      } else if (error?.code?.includes('permission')) {
        errorMessage = 'Error de permisos: Verifica las reglas de Storage en Firebase Console.';
      }
      
      showToast('error', errorMessage, 6000);
      return;
    }
    
    historyService.add({
      action: 'create',
      section: 'products',
      itemName: newProduct.name,
      itemId: newProduct.id,
      details: `Producto "${newProduct.name}" agregado al catálogo`,
    });
    
    showToast('success', `Producto "${newProduct.name}" creado exitosamente`, 3000);
    
    handleCloseModal();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.categoryId || !formData.brandId) {
      showToast('error', 'Por favor completa todos los campos requeridos', 3000);
      return;
    }

    if (formData.price <= 0) {
      showToast('error', 'El precio debe ser mayor a 0', 3000);
      return;
    }

    if (formData.discount > formData.price) {
      showToast('error', 'El descuento no puede ser mayor al precio', 3000);
      return;
    }

    if (!editingProductId) return;

    const existing = products.find((p) => p.id === editingProductId);
    if (!existing) return;
    
    const previousCategoryId = existing.categoryId;
    const previousBrandId = existing.brandId;
    const previousImages = existing.images || [];

    const selectedBrand = getBrandById(formData.brandId);
    if (selectedBrand && !selectedBrand.categoryIds.includes(formData.categoryId)) {
      showToast('error', 'La marca seleccionada no pertenece a la categoría elegida', 3000);
      return;
    }

    const willUploadImages = formData.images.some((img) => !!img.file);
    const pendingImageCount = formData.images.filter((img) => !!img.file).length;

    const discountPercentage = calculateDiscountPercentage(formData.price, formData.discount);
    const finalPrice = calculateFinalPrice(formData.price, formData.discount);
    const existingUrls = formData.images
      .map((img) => img.url || '')
      .filter((url) => url);
    
    // Detectar imágenes que fueron eliminadas
    const removedImageUrls = previousImages.filter(url => !existingUrls.includes(url));
    const editedAt = new Date().toISOString();

    const specificationsObj: { [key: string]: string } = {};
    formData.specifications.forEach(spec => {
      if (spec.key.trim() && spec.value.trim()) {
        specificationsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    try {
      // Eliminar imágenes que fueron removidas del Storage
      if (removedImageUrls.length > 0) {
        const deletePromises = removedImageUrls.map(url => deleteProductImage(url).catch(err => {
          console.error('Error eliminando imagen:', err);
          return null; // Continuar aunque falle alguna eliminación
        }));
        await Promise.all(deletePromises);
      }

      // Preparar el objeto de actualización
      const updateData: any = {
        sku: formData.sku,
        name: formData.name.trim(),
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
        description: formData.description.trim() || undefined,
        shortDescription: formData.shortDescription.trim() || undefined,
        specifications: Object.keys(specificationsObj).length > 0 ? specificationsObj : undefined,
        notes: formData.notes.trim() || undefined,
        editedAt,
      };

      // Si no hay imágenes, eliminar el campo del documento
      if (existingUrls.length > 0) {
        updateData.images = existingUrls;
      } else {
        updateData.images = deleteField();
      }

      await updateDocById(COLLECTIONS.products, editingProductId, updateData as object);

      if (willUploadImages) {
        showToast('success', `Subiendo ${pendingImageCount} imagen${pendingImageCount > 1 ? 'es' : ''}...`, 3000);
        const uploadedUrls = await uploadPendingImages(formData.name.trim());
        const finalUrls = [...existingUrls, ...uploadedUrls];
        
        // Actualizar las imágenes en el documento
        if (finalUrls.length > 0) {
          await updateDocById(COLLECTIONS.products, editingProductId, { images: finalUrls } as object);
        } else {
          // Si no hay imágenes, eliminar el campo
          await updateDocById(COLLECTIONS.products, editingProductId, { images: deleteField() } as object);
        }
      }

      // Si el nombre del producto cambió, eliminar la carpeta antigua si está vacía o tiene imágenes huérfanas
      // Nota: Firebase Storage no tiene una forma directa de renombrar carpetas, así que las imágenes nuevas
      // se subirán a la nueva carpeta. Las imágenes antiguas seguirán en la carpeta antigua pero ya no
      // estarán referenciadas en el producto, así que se pueden considerar huérfanas.
      // Por ahora, dejamos que el usuario las elimine manualmente si es necesario, o podemos implementar
      // una limpieza periódica más adelante.

      if (previousCategoryId && previousBrandId) {
        if (previousCategoryId !== formData.categoryId || previousBrandId !== formData.brandId) {
          await updateRelatedCounts(previousCategoryId, previousBrandId, -1);
          await updateRelatedCounts(formData.categoryId, formData.brandId, 1);
        }
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      let errorMessage = 'No se pudo editar el producto.';
      
      if (error?.message?.includes('autenticado') || error?.code?.includes('unauthorized') || error?.code?.includes('unauthenticated')) {
        errorMessage = 'Error al subir imágenes: Debes iniciar sesión con Google para subir imágenes.';
      } else if (error?.code?.includes('permission')) {
        errorMessage = 'Error de permisos: Verifica las reglas de Storage en Firebase Console.';
      }
      
      showToast('error', errorMessage, 6000);
      return;
    }

    // Preparar objeto "antes" para comparación
    const beforeData: Record<string, unknown> = {
      nombre: existing.name,
      sku: existing.sku,
      categoria: getCategoryById(existing.categoryId)?.name || existing.categoryId,
      marca: getBrandById(existing.brandId)?.name || existing.brandId,
      precio: existing.price,
      precioCosto: existing.costPrice || 0,
      descuento: existing.discount || 0,
      precioFinal: existing.finalPrice,
      stock: existing.stock,
      stockMinimo: existing.minStock || 0,
      estado: existing.status,
      descripcion: existing.description || '',
      descripcionCorta: existing.shortDescription || '',
      especificaciones: existing.specifications ? Object.keys(existing.specifications).length : 0,
      notas: existing.notes || '',
      imagenes: existing.images?.length || 0,
    };

    // Preparar objeto "después" para comparación
    const afterData: Record<string, unknown> = {
      nombre: formData.name.trim(),
      sku: formData.sku,
      categoria: getCategoryById(formData.categoryId)?.name || formData.categoryId,
      marca: getBrandById(formData.brandId)?.name || formData.brandId,
      precio: formData.price,
      precioCosto: formData.costPrice || 0,
      descuento: formData.discount || 0,
      precioFinal: finalPrice,
      stock: formData.stock,
      stockMinimo: formData.minStock || 0,
      estado: formData.status,
      descripcion: formData.description.trim() || '',
      descripcionCorta: formData.shortDescription.trim() || '',
      especificaciones: Object.keys(specificationsObj).length,
      notas: formData.notes.trim() || '',
      imagenes: existingUrls.length + (willUploadImages ? pendingImageCount : 0),
    };

    // Generar cambios
    const changes = compareObjects(beforeData, afterData, {
      nombre: 'Nombre',
      sku: 'SKU',
      categoria: 'Categoría',
      marca: 'Marca',
      precio: 'Precio',
      precioCosto: 'Precio de Costo',
      descuento: 'Descuento',
      precioFinal: 'Precio Final',
      stock: 'Stock',
      stockMinimo: 'Stock Mínimo',
      estado: 'Estado',
      descripcion: 'Descripción',
      descripcionCorta: 'Descripción Corta',
      especificaciones: 'Especificaciones',
      notas: 'Notas',
      imagenes: 'Imágenes',
    });

    historyService.add({
      action: 'update',
      section: 'products',
      itemName: formData.name.trim(),
      itemId: editingProductId,
      details: `Producto "${formData.name.trim()}" actualizado`,
      changes: changes.length > 0 ? changes : undefined,
    });

    showToast('success', `Producto "${formData.name.trim()}" editado exitosamente`, 3000);
    
    handleCloseEditModal();
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

        // Eliminar el documento del producto de Firestore
        await deleteDocById(COLLECTIONS.products, product.id);
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

      historyService.add({
        action: 'delete',
        section: 'products',
        itemName: product.name,
        itemId: product.id,
        details: `Producto "${product.name}" eliminado permanentemente`,
      });

      showToast('success', `Producto "${product.name}" eliminado permanentemente`, 3000);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower));
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
    const matchesBrand = brandFilter === 'all' || product.brandId === brandFilter;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const totalProducts = filteredProducts.length;
  const totalStock = filteredProducts.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = filteredProducts.reduce((sum, p) => {
    const finalPrice = p.finalPrice || p.price;
    return sum + (finalPrice * p.stock);
  }, 0);
  const lowStockProducts = filteredProducts.filter(p => {
    const minStock = p.minStock || 10;
    return p.stock <= minStock;
  }).length;

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-description">
            Gestiona el catálogo de productos de tu tienda
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <span className="btn-icon">+</span>
          Nuevo Producto
        </button>
      </div>

      <div className="products-stats">
        <div className="stat-badge">
          <span className="stat-badge-label">Total Productos</span>
          <span className="stat-badge-value">{totalProducts}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Stock Total</span>
          <span className="stat-badge-value">{totalStock}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Valor Total</span>
          <span className="stat-badge-value">{formatCurrency(totalValue)}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Stock Bajo</span>
          <span className="stat-badge-value">{lowStockProducts}</span>
        </div>
      </div>

      <div className="products-filters-container">
        <div className="products-filters">
          <div className="filter-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar productos..."
              className="filter-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {activeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="all">Todas las marcas</option>
            {activeBrands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div className="view-mode-toggle">
          <button
            className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Vista de tabla"
          >
            📋
          </button>
          <button
            className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vista de cuadrícula"
          >
            ⊞
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Marca</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Fecha/Hora</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const category = getCategoryById(product.categoryId);
                  const brand = getBrandById(product.brandId);
                  
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="table-product">
                          {product.images && product.images.length > 0 ? (
                            <div className="table-product-avatar">
                              <img src={product.images[0]} alt={product.name} className="table-product-image" />
                              {product.images.length > 1 && (
                                <span className="image-count-badge">+{product.images.length - 1}</span>
                              )}
                            </div>
                          ) : (
                            <div 
                              className="table-product-avatar"
                              style={category ? {
                                background: category.gradient,
                              } : {}}
                            >
                              {product.name.charAt(0)}
                            </div>
                          )}
                          <div className="table-product-info">
                            <div className="table-product-header">
                              <span className="table-product-name">{product.name}</span>
                              <span className="table-product-sku">SKU: {product.sku}</span>
                            </div>
                            <div className="table-product-details">
                              {product.specifications && Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                                <span key={key} className="table-product-detail-item">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                            {product.shortDescription && (
                              <span className="table-product-description">{product.shortDescription}</span>
                            )}
                            {!product.shortDescription && product.description && (
                              <span className="table-product-description">{product.description}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {category ? (
                          <span 
                            className="table-category"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                              border: `1px solid ${category.color}40`,
                            }}
                          >
                            {category.name}
                          </span>
                        ) : (
                          <span className="table-category">Sin categoría</span>
                        )}
                      </td>
                      <td>
                        {brand ? (
                          <span 
                            className="table-brand"
                            style={{
                              backgroundColor: `${brand.color}20`,
                              color: brand.color,
                              border: `1px solid ${brand.color}40`,
                            }}
                          >
                            {brand.name}
                          </span>
                        ) : (
                          <span className="table-brand">Sin marca</span>
                        )}
                      </td>
                      <td>
                        <div className="price-container">
                          {product.discount && product.discount > 0 && product.finalPrice < product.price ? (
                            <>
                              <span className="table-price-original">{formatCurrency(product.price)}</span>
                              <span className="table-price-discount">{formatCurrency(product.finalPrice)}</span>
                              <span className="discount-percentage-badge">-{product.discountPercentage?.toFixed(1) || calculateDiscountPercentage(product.price, product.discount)}%</span>
                            </>
                          ) : (
                            <span className="table-price">{formatCurrency(product.finalPrice || product.price)}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="stock-container">
                          {(() => {
                            const minStock = product.minStock || 10;
                            const stockClass = product.stock <= minStock ? 'low' : product.stock <= minStock * 2 ? 'medium' : '';
                            return (
                              <span className={`table-stock ${stockClass}`}>
                                {product.stock.toLocaleString('es-PE')}
                              </span>
                            );
                          })()}
                          {product.minStock && (
                            <span className="stock-label">Mín: {product.minStock}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${product.status}`}>
                          {product.status === 'activo' ? '✓ Activo' : '✗ Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className="table-datetime">
                          <div className="datetime-date">
                            {formatDateTime(product.createdAt || product.editedAt)}
                          </div>
                          {product.editedAt && product.createdAt && product.editedAt !== product.createdAt && (
                            <div className="datetime-edited">
                              Editado: {formatDateTime(product.editedAt)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="btn-action btn-edit" 
                            title="Editar"
                            onClick={() => handleOpenEditModal(product)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-action btn-delete" 
                            title="Eliminar"
                            onClick={() => handleDeleteProduct(product)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="table-empty">
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <p>No se encontraron productos con los filtros seleccionados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const category = getCategoryById(product.categoryId);
              const brand = getBrandById(product.brandId);
              
              return (
                <div key={product.id} className="product-card">
                  {product.images && product.images.length > 0 ? (
                    <div className="product-image-wrapper">
                      <img src={product.images[0]} alt={product.name} className="product-image" />
                      {product.images.length > 1 && (
                        <div className="image-gallery-indicator">
                          <span className="gallery-icon">📷</span>
                          <span className="gallery-count">{product.images.length}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div 
                      className="product-card-header"
                      style={category ? {
                        background: category.gradient,
                      } : {}}
                    >
                      <div className="product-card-avatar">
                        {product.name.charAt(0)}
                      </div>
                      <div className="product-card-badges">
                        {category && (
                          <span 
                            className="product-badge category-badge"
                            style={{
                              backgroundColor: `${category.color}20`,
                              color: category.color,
                              border: `1px solid ${category.color}40`,
                            }}
                          >
                            {category.name}
                          </span>
                        )}
                        {brand && (
                          <span 
                            className="product-badge brand-badge"
                            style={{
                              backgroundColor: `${brand.color}20`,
                              color: brand.color,
                              border: `1px solid ${brand.color}40`,
                            }}
                          >
                            {brand.name}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {product.images && product.images.length > 0 && (
                    <div className="product-card-badges-top">
                      {category && (
                        <span 
                          className="product-badge category-badge"
                          style={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                            border: `1px solid ${category.color}40`,
                          }}
                        >
                          {category.name}
                        </span>
                      )}
                      {brand && (
                        <span 
                          className="product-badge brand-badge"
                          style={{
                            backgroundColor: `${brand.color}20`,
                            color: brand.color,
                            border: `1px solid ${brand.color}40`,
                          }}
                        >
                          {brand.name}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="product-card-content">
                    <div className="product-card-header-info">
                      <h3 className="product-card-name">{product.name}</h3>
                      <span className="product-card-sku">SKU: {product.sku}</span>
                    </div>
                    {product.specifications && Object.keys(product.specifications).length > 0 && (
                      <div className="product-card-specs">
                        {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                          <span key={key} className="product-spec-item">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                    {product.shortDescription && (
                      <p className="product-card-description">{product.shortDescription}</p>
                    )}
                    {!product.shortDescription && product.description && (
                      <p className="product-card-description">{product.description}</p>
                    )}
                    <div className="product-card-stats">
                      <div className="product-stat">
                        <span className="stat-label">Precio</span>
                        {product.discount && product.discount > 0 && product.finalPrice < product.price ? (
                          <div className="price-discount-wrapper">
                            <span className="stat-value price-value-discount">{formatCurrency(product.finalPrice)}</span>
                            <span className="stat-value price-value-original">{formatCurrency(product.price)}</span>
                            <span className="discount-badge-small">-{product.discountPercentage?.toFixed(1) || calculateDiscountPercentage(product.price, product.discount)}%</span>
                          </div>
                        ) : (
                          <span className="stat-value price-value">{formatCurrency(product.finalPrice || product.price)}</span>
                        )}
                      </div>
                      <div className="product-stat">
                        <span className="stat-label">Stock</span>
                        {(() => {
                          const minStock = product.minStock || 10;
                          const stockClass = product.stock <= minStock ? 'low' : product.stock <= minStock * 2 ? 'medium' : '';
                          return (
                            <span className={`stat-value stock-value ${stockClass}`}>
                              {product.stock.toLocaleString('es-PE')} {product.stock === 1 ? 'unidad' : 'unidades'}
                            </span>
                          );
                        })()}
                        {product.minStock && (
                          <span className="stat-hint">Mín: {product.minStock}</span>
                        )}
                      </div>
                    </div>
                    <div className="product-card-footer">
                      <span className={`status-badge ${product.status}`}>
                        {product.status === 'activo' ? '✓ Activo' : '✗ Inactivo'}
                      </span>
                      <div className="product-card-actions">
                        <button 
                          className="btn-card-action btn-edit" 
                          title="Editar"
                          onClick={() => handleOpenEditModal(product)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-card-action btn-delete" 
                          title="Eliminar"
                          onClick={() => handleDeleteProduct(product)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-full">
              <div className="empty-icon">📦</div>
              <h2>No se encontraron productos</h2>
              <p>No se encontraron productos con los filtros seleccionados</p>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nuevo Producto</h2>
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
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Descripción detallada del producto, características principales, beneficios..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Precios y Descuentos</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price" className="form-label">
                      Precio de Venta (PEN) <span className="required">*</span>
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
                      required
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

                <div className="form-row">
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

              <div className="form-section">
                <h3 className="form-section-title">Imágenes del Producto</h3>
                <p className="form-hint" style={{ marginBottom: '1rem' }}>
                  Puedes subir múltiples imágenes para mostrar diferentes ángulos del producto (máximo 10 imágenes, 5MB cada una)
                </p>
                {formData.images.length > 0 && (
                  <p className="form-hint" style={{ marginBottom: '1rem', color: formData.images.length >= 10 ? '#ef4444' : '#6b7280' }}>
                    {formData.images.length} de 10 imágenes agregadas
                  </p>
                )}
                
                {formData.images.length > 0 && (
                  <div className="images-preview-grid">
                    {formData.images.map((img) => (
                      <div key={img.id} className="image-preview-item">
                        <img 
                          src={img.preview || img.url || ''} 
                          alt="Preview" 
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
                          <div className="image-upload-indicator" title="Imagen pendiente de subir">
                            ⏳
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <div className="image-upload-area">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="image-input"
                      disabled={formData.images.length >= 10}
                    />
                    <label htmlFor="image" className="image-upload-label" style={{ opacity: formData.images.length >= 10 ? 0.6 : 1 }}>
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">
                        <strong>Haz clic para subir</strong> o arrastra imágenes aquí
                      </span>
                      <span className="upload-hint">
                        PNG, JPG, WEBP hasta 5MB cada una. Puedes seleccionar múltiples archivos
                        {formData.images.length >= 10 && ' (límite alcanzado)'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

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
              <h2 className="modal-title">Editar Producto</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="product-form">
              <div className="form-section">
                <h3 className="form-section-title">Información Básica</h3>
                
                <div className="form-row">
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

                  <div className="form-group">
                    <label htmlFor="edit-name" className="form-label">
                      Nombre del Producto <span className="required">*</span>
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
                  <textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows={4}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">Precios y Descuentos</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-price" className="form-label">
                      Precio de Venta (PEN) <span className="required">*</span>
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
                      required
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

                <div className="form-row">
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

              <div className="form-section">
                <h3 className="form-section-title">Imágenes del Producto</h3>
                <p className="form-hint" style={{ marginBottom: '1rem' }}>
                  Puedes subir múltiples imágenes para mostrar diferentes ángulos del producto (máximo 10 imágenes, 5MB cada una)
                </p>
                {formData.images.length > 0 && (
                  <p className="form-hint" style={{ marginBottom: '1rem', color: formData.images.length >= 10 ? '#ef4444' : '#6b7280' }}>
                    {formData.images.length} de 10 imágenes agregadas
                  </p>
                )}
                
                {formData.images.length > 0 && (
                  <div className="images-preview-grid">
                    {formData.images.map((img) => (
                      <div key={img.id} className="image-preview-item">
                        <img 
                          src={img.preview || img.url || ''} 
                          alt="Preview" 
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
                          <div className="image-upload-indicator" title="Imagen pendiente de subir">
                            ⏳
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-group">
                  <div className="image-upload-area">
                    <input
                      type="file"
                      id="edit-image"
                      name="image"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="image-input"
                      disabled={formData.images.length >= 10}
                    />
                    <label htmlFor="edit-image" className="image-upload-label" style={{ opacity: formData.images.length >= 10 ? 0.6 : 1 }}>
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">
                        <strong>Haz clic para subir</strong> o arrastra imágenes aquí
                      </span>
                      <span className="upload-hint">
                        PNG, JPG, WEBP hasta 5MB cada una. Puedes seleccionar múltiples archivos
                        {formData.images.length >= 10 && ' (límite alcanzado)'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

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
