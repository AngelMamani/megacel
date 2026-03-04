import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Categories.css';
import { historyService, compareObjects } from '../../utils/historyService';
import { COLLECTIONS } from '../../firebase/collections';
import {
  deleteDocById,
  setDocById,
  subscribeCollection,
  updateDocById,
} from '../../firebase/firestoreHelpers';
import { uploadCategoryImage } from '../../firebase/storageHelpers';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'activo' | 'inactivo';
}

interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  products: Product[];
  image: string;
  color: string;
  gradient: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  createdAt: string;
  editedAt?: string;
  isActive: boolean;
}

/* FIX: Se eliminó el uso de datos locales para categorías; la página consume Firestore (onSnapshot)
const initialCategories: Category[] = [
  {
    id: '1',
    name: 'Smartphones',
    description: 'Teléfonos inteligentes de última generación con tecnología avanzada',
    productCount: 3,
    products: [
      {
        id: '1-1',
        name: 'iPhone 15 Pro Max 256GB',
        price: 1299,
        stock: 15,
        status: 'activo',
      },
      {
        id: '1-2',
        name: 'Samsung Galaxy S24 Ultra 512GB',
        price: 1199,
        stock: 12,
        status: 'activo',
      },
      {
        id: '1-3',
        name: 'Xiaomi 14 Pro 256GB',
        price: 899,
        stock: 8,
        status: 'activo',
      },
    ],
    image: celImage,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    trend: 'up',
    trendValue: 12,
    createdAt: new Date('2024-01-01T10:30:00').toISOString(),
    isActive: true,
  },
  {
    id: '2',
    name: 'Tablets',
    description: 'Tabletas y dispositivos portátiles para productividad y entretenimiento',
    productCount: 3,
    products: [
      {
        id: '2-1',
        name: 'iPad Pro 12.9" M2 256GB',
        price: 1099,
        stock: 10,
        status: 'activo',
      },
      {
        id: '2-2',
        name: 'Samsung Galaxy Tab S9 Ultra 256GB',
        price: 999,
        stock: 7,
        status: 'activo',
      },
      {
        id: '2-3',
        name: 'Lenovo Tab P12 Pro 128GB',
        price: 499,
        stock: 6,
        status: 'activo',
      },
    ],
    image: celImage,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    trend: 'stable',
    trendValue: 0,
    createdAt: new Date('2024-01-05T14:20:00').toISOString(),
    isActive: true,
  },
  {
    id: '3',
    name: 'Accesorios',
    description: 'Fundas, cargadores, auriculares y accesorios complementarios',
    productCount: 3,
    products: [
      {
        id: '3-1',
        name: 'Funda Protectora iPhone 15 Pro Max',
        price: 29,
        stock: 45,
        status: 'activo',
      },
      {
        id: '3-2',
        name: 'Cargador Rápido USB-C 65W',
        price: 39,
        stock: 32,
        status: 'activo',
      },
      {
        id: '3-3',
        name: 'Auriculares Inalámbricos Bluetooth',
        price: 49,
        stock: 28,
        status: 'activo',
      },
    ],
    image: audifonosImage,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    trend: 'up',
    trendValue: 8,
    createdAt: new Date('2024-01-10T09:15:00').toISOString(),
    isActive: true,
  },
  {
    id: '4',
    name: 'Smartwatches',
    description: 'Relojes inteligentes con funciones avanzadas de salud y fitness',
    productCount: 3,
    products: [
      {
        id: '4-1',
        name: 'Apple Watch Series 9 GPS 45mm',
        price: 429,
        stock: 18,
        status: 'activo',
      },
      {
        id: '4-2',
        name: 'Samsung Galaxy Watch 6 Classic 47mm',
        price: 399,
        stock: 15,
        status: 'activo',
      },
      {
        id: '4-3',
        name: 'Fitbit Versa 4',
        price: 199,
        stock: 12,
        status: 'activo',
      },
    ],
    image: celImage,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    trend: 'up',
    trendValue: 15,
    createdAt: new Date('2024-01-12T16:45:00').toISOString(),
    isActive: true,
  },
  {
    id: '5',
    name: 'Audio',
    description: 'Auriculares, altavoces y sistemas de sonido de alta calidad',
    productCount: 3,
    products: [
      {
        id: '5-1',
        name: 'AirPods Pro 2da Generación',
        price: 249,
        stock: 25,
        status: 'activo',
      },
      {
        id: '5-2',
        name: 'Sony WH-1000XM5 Auriculares',
        price: 399,
        stock: 18,
        status: 'activo',
      },
      {
        id: '5-3',
        name: 'JBL Flip 6 Altavoz Portátil',
        price: 129,
        stock: 22,
        status: 'activo',
      },
    ],
    image: audifonosImage,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    trend: 'down',
    trendValue: -5,
    createdAt: new Date('2024-01-15T11:30:00').toISOString(),
    isActive: true,
  },
  {
    id: '6',
    name: 'Cámaras',
    description: 'Cámaras digitales y accesorios para fotografía profesional',
    productCount: 3,
    products: [
      {
        id: '6-1',
        name: 'Canon EOS R6 Mark II',
        price: 2499,
        stock: 5,
        status: 'activo',
      },
      {
        id: '6-2',
        name: 'Nikon Z7 II Body',
        price: 2999,
        stock: 4,
        status: 'activo',
      },
      {
        id: '6-3',
        name: 'Sony Alpha 7 IV',
        price: 2499,
        stock: 3,
        status: 'activo',
      },
    ],
    image: celImage,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    trend: 'stable',
    trendValue: 0,
    createdAt: new Date('2024-01-18T13:00:00').toISOString(),
    isActive: true,
  },
]; */

const gradientOptions = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
];

const colorOptions = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
];


export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | string | null,
    imagePreview: '',
  });

  const filteredCategories = showInactive 
    ? categories 
    : categories.filter(cat => cat.isActive);

  const totalProducts = filteredCategories.reduce((sum, cat) => sum + cat.productCount, 0);

  useEffect(() => {
    const unsubscribe = subscribeCollection<Category>(
      COLLECTIONS.categories,
      (items) => {
        setCategories(
          items.map((c) => ({
            ...c,
            products: Array.isArray((c as unknown as { products?: unknown }).products)
              ? (c as unknown as { products: Product[] }).products
              : [],
          }))
        );
      },
      (error) => console.error('Error subscribing categories:', error)
    );

    return () => unsubscribe();
  }, []);

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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      image: null,
      imagePreview: '',
    });
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategoryId(category.id);
    setIsEditModalOpen(true);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image,
      imagePreview: category.image,
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCategoryId(null);
    setFormData({
      name: '',
      description: '',
      image: null,
      imagePreview: '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      showToast('error', 'Por favor completa todos los campos requeridos', 3000);
      return;
    }

    if (!formData.image && !formData.imagePreview) {
      showToast('error', 'Por favor selecciona una imagen para la categoría', 3000);
      return;
    }

    if (!editingCategoryId) return;

    const existing = categories.find((c) => c.id === editingCategoryId);
    if (!existing) return;

    const trimmedName = formData.name.trim();
    let imageUrl: string;

    // Si hay un archivo nuevo, subirlo a Storage
    if (formData.image instanceof File) {
      try {
        showToast('success', 'Subiendo imagen...', 2000);
        imageUrl = await uploadCategoryImage({
          categoryName: trimmedName,
          file: formData.image,
        });
      } catch (error: any) {
        console.error('Error uploading category image:', error);
        let errorMessage = 'No se pudo subir la imagen de la categoría.';
        
        if (error?.message?.includes('autenticado') || error?.code?.includes('unauthorized') || error?.code?.includes('unauthenticated')) {
          errorMessage = 'Error al subir imagen: Debes iniciar sesión con Google para subir imágenes.';
        } else if (error?.code?.includes('permission')) {
          errorMessage = 'Error de permisos: Verifica las reglas de Storage en Firebase Console.';
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        showToast('error', errorMessage, 6000);
        return;
      }
    } else {
      // Si ya es una URL (no cambió la imagen), usar la URL existente
      imageUrl = formData.imagePreview || (formData.image as string);
    }

    const editedAt = new Date().toISOString();

    // Preparar objeto "antes" para comparación
    const beforeData: Record<string, unknown> = {
      nombre: existing.name,
      descripcion: existing.description,
      imagen: existing.image ? 'Sí' : 'No',
    };

    // Preparar objeto "después" para comparación
    const afterData: Record<string, unknown> = {
      nombre: formData.name.trim(),
      descripcion: formData.description.trim(),
      imagen: imageUrl ? 'Sí' : 'No',
    };

    // Generar cambios
    const changes = compareObjects(beforeData, afterData, {
      nombre: 'Nombre',
      descripcion: 'Descripción',
      imagen: 'Imagen',
    });

    try {
      await updateDocById<Category>(COLLECTIONS.categories, editingCategoryId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageUrl as string,
        editedAt,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      showToast('error', 'No se pudo editar la categoría', 3000);
      return;
    }

    historyService.add({
      action: 'update',
      section: 'categories',
      itemName: formData.name.trim(),
      itemId: editingCategoryId!,
      details: `Categoría "${formData.name.trim()}" actualizada`,
      changes: changes.length > 0 ? changes : undefined,
    });

    showToast('success', `Categoría "${formData.name.trim()}" editada exitosamente`, 3000);
    
    handleCloseEditModal();
  };

  const handleDeleteCategory = async (category: Category) => {
    // Si tiene productos, solo desactivar (soft delete)
    if (category.productCount > 0) {
      const result = await Swal.fire({
        title: '¿Desactivar categoría?',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">
              La categoría <strong style="color: #f59e0b;">"${category.name}"</strong> tiene <strong>${category.productCount} productos</strong> asociados.
            </p>
            <p style="color: #92400e; font-size: 0.9rem; background: #fffbeb; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #f59e0b;">
              ⚠️ Se desactivará la categoría (no se eliminará). Los productos mantendrán su relación y podrás reactivarla después.
            </p>
          </div>
        `,
        icon: 'warning',
        iconColor: '#f59e0b',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, desactivar',
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
          await updateDocById<Category>(COLLECTIONS.categories, category.id, {
            isActive: false,
          });
        } catch (error) {
          console.error('Error deactivating category:', error);
          showToast('error', 'No se pudo desactivar la categoría', 3000);
          return;
        }

        await Swal.fire({
          title: '¡Desactivada!',
          text: `La categoría "${category.name}" ha sido desactivada`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Perfecto',
          timer: 2000,
          timerProgressBar: true,
        });

        historyService.add({
          action: 'deactivate',
          section: 'categories',
          itemName: category.name,
          itemId: category.id,
          details: `Categoría "${category.name}" desactivada`,
        });

        showToast('success', `Categoría "${category.name}" desactivada exitosamente`, 3000);
      }
    } else {
      // Si no tiene productos, eliminar permanentemente
      const result = await Swal.fire({
        title: '¿Eliminar permanentemente?',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">
              La categoría <strong style="color: #ef4444;">"${category.name}"</strong> será eliminada permanentemente.
            </p>
            <p style="color: #991b1b; font-size: 0.9rem; background: #fef2f2; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #ef4444;">
              ⚠️ Esta acción no se puede deshacer.
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
          await deleteDocById(COLLECTIONS.categories, category.id);
        } catch (error) {
          console.error('Error deleting category:', error);
          showToast('error', 'No se pudo eliminar la categoría', 3000);
          return;
        }

        await Swal.fire({
          title: '¡Eliminada!',
          text: `La categoría "${category.name}" ha sido eliminada permanentemente`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Perfecto',
          timer: 2000,
          timerProgressBar: true,
        });

        historyService.add({
          action: 'delete',
          section: 'categories',
          itemName: category.name,
          itemId: category.id,
          details: `Categoría "${category.name}" eliminada permanentemente`,
        });

        showToast('success', `Categoría "${category.name}" eliminada permanentemente`, 3000);
      }
    }
  };

  const handleReactivateCategory = async (category: Category) => {
    const result = await Swal.fire({
      title: '¿Reactivar categoría?',
      html: `
        <div style="text-align: center;">
          <p style="font-size: 1.1rem;">
            ¿Deseas reactivar la categoría <strong style="color: #10b981;">"${category.name}"</strong>?
          </p>
        </div>
      `,
      icon: 'question',
      iconColor: '#10b981',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusConfirm: false,
    });

    if (result.isConfirmed) {
      try {
        await updateDocById<Category>(COLLECTIONS.categories, category.id, {
          isActive: true,
        });
      } catch (error) {
        console.error('Error reactivating category:', error);
        showToast('error', 'No se pudo reactivar la categoría', 3000);
        return;
      }

      historyService.add({
        action: 'reactivate',
        section: 'categories',
        itemName: category.name,
        itemId: category.id,
        details: `Categoría "${category.name}" reactivada`,
      });

      showToast('success', `Categoría "${category.name}" reactivada exitosamente`, 3000);
    }
  };

  const handleViewProducts = (category: Category) => {
    setViewingCategory(category);
    setIsProductsModalOpen(true);
  };

  const handleCloseProductsModal = () => {
    setIsProductsModalOpen(false);
    setViewingCategory(null);
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'La imagen es demasiado grande. Por favor selecciona una imagen menor a 5MB', 4000);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        showToast('error', 'Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP, etc.)', 4000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imagePreview: '',
    }));
  };

  const getAutoGeneratedStyles = (index: number) => {
    const gradientIndex = index % gradientOptions.length;
    return {
      gradient: gradientOptions[gradientIndex],
      color: colorOptions[gradientIndex],
    };
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const calculateTrend = (currentCount: number, previousCount: number) => {
    if (previousCount === 0) {
      return { trend: 'stable' as const, trendValue: 0 };
    }
    
    const change = ((currentCount - previousCount) / previousCount) * 100;
    const roundedChange = Math.round(change);
    
    if (roundedChange > 0) {
      return { trend: 'up' as const, trendValue: roundedChange };
    } else if (roundedChange < 0) {
      return { trend: 'down' as const, trendValue: roundedChange };
    } else {
      return { trend: 'stable' as const, trendValue: 0 };
    }
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

    return slug || 'categoria';
  };

  const buildCategoryId = (name: string) => {
    const base = `cat-${slugify(name)}`.slice(0, 48);
    const existing = new Set(categories.map((c) => c.id));
    if (!existing.has(base)) return base;

    let suffix = 2;
    while (existing.has(`${base}-${suffix}`)) {
      suffix++;
    }
    return `${base}-${suffix}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      showToast('error', 'Por favor completa todos los campos requeridos', 3000);
      return;
    }

    if (!formData.image && !formData.imagePreview) {
      showToast('error', 'Por favor selecciona una imagen para la categoría', 3000);
      return;
    }

    const trimmedName = formData.name.trim();
    let imageUrl: string;

    // Si hay un archivo nuevo, subirlo a Storage
    if (formData.image instanceof File) {
      try {
        showToast('success', 'Subiendo imagen...', 2000);
        imageUrl = await uploadCategoryImage({
          categoryName: trimmedName,
          file: formData.image,
        });
      } catch (error: any) {
        console.error('Error uploading category image:', error);
        let errorMessage = 'No se pudo subir la imagen de la categoría.';
        
        if (error?.message?.includes('autenticado') || error?.code?.includes('unauthorized') || error?.code?.includes('unauthenticated')) {
          errorMessage = 'Error al subir imagen: Debes iniciar sesión con Google para subir imágenes.';
        } else if (error?.code?.includes('permission')) {
          errorMessage = 'Error de permisos: Verifica las reglas de Storage en Firebase Console.';
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        showToast('error', errorMessage, 6000);
        return;
      }
    } else {
      // Si ya es una URL (editando y no cambió la imagen), usar la URL existente
      imageUrl = formData.imagePreview || (formData.image as string);
    }
    
    const newIndex = categories.length;
    const styles = getAutoGeneratedStyles(newIndex);
    const trendData = calculateTrend(0, 0);
    const createdAt = new Date().toISOString();

    const newCategory: Category = {
      id: buildCategoryId(trimmedName),
      name: trimmedName,
      description: formData.description.trim(),
      productCount: 0,
      image: imageUrl,
      color: styles.color,
      gradient: styles.gradient,
      trend: trendData.trend,
      trendValue: trendData.trendValue,
      createdAt,
      isActive: true,
      products: [],
    };

    try {
      const { id, ...data } = newCategory;
      await setDocById(COLLECTIONS.categories, id, data);
    } catch (error: any) {
      console.error('Error creating category:', error);
      let errorMessage = 'No se pudo crear la categoría.';
      
      if (error?.message?.includes('longer than')) {
        errorMessage = 'La imagen es demasiado grande. Por favor selecciona una imagen más pequeña (máximo 5MB).';
      }
      
      showToast('error', errorMessage, 4000);
      return;
    }
    
    historyService.add({
      action: 'create',
      section: 'categories',
      itemName: newCategory.name,
      itemId: newCategory.id,
      details: `Categoría "${newCategory.name}" creada`,
    });
    
    showToast('success', `Categoría "${newCategory.name}" creada exitosamente`, 3000);
    
    handleCloseModal();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-description">
            Gestiona y organiza tus productos por categorías
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <span className="btn-icon">+</span>
          Nueva Categoría
        </button>
      </div>

      <div className="categories-stats">
        <div className="stat-badge">
          <span className="stat-badge-label">Total Categorías</span>
          <span className="stat-badge-value">{filteredCategories.length}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Total Productos</span>
          <span className="stat-badge-value">{totalProducts}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Promedio</span>
          <span className="stat-badge-value">
            {filteredCategories.length > 0 ? Math.round(totalProducts / filteredCategories.length) : 0}
          </span>
        </div>
      </div>

      <div className="categories-header-controls">
        <div className="toggle-inactive">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="toggle-checkbox"
            />
            <span className="toggle-text">Mostrar categorías desactivadas</span>
          </label>
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
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Productos</th>
                <th>Tendencia</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="table-category-image">
                        <img src={category.image} alt={category.name} />
                      </div>
                    </td>
                    <td>
                      <div className="table-category-name">{category.name}</div>
                    </td>
                    <td>
                      <div className="table-category-description">{category.description}</div>
                    </td>
                    <td>
                      <div className="table-category-products">
                        <span className="product-count-number">{category.productCount}</span>
                        <span className="product-count-label">
                          {category.productCount === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-category-trend">
                        <span
                          className="trend-value"
                          style={{ color: getTrendColor(category.trend) }}
                        >
                          {getTrendIcon(category.trend)} {category.trendValue > 0 ? '+' : ''}
                          {category.trendValue}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${category.isActive ? 'activo' : 'inactivo'}`}>
                        {category.isActive ? '✓ Activo' : '✗ Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-category-date">
                        {category.editedAt ? (
                          <>
                            <div>Editado: {formatDate(category.editedAt)}</div>
                          </>
                        ) : (
                          <div>{formatDate(category.createdAt)}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewProducts(category)}
                          title="Ver productos"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleOpenEditModal(category)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        {category.isActive ? (
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteCategory(category)}
                            title={category.productCount > 0 ? 'Desactivar' : 'Eliminar'}
                          >
                            🗑️
                          </button>
                        ) : (
                          <button
                            className="btn-action btn-reactivate"
                            onClick={() => handleReactivateCategory(category)}
                            title="Reactivar"
                          >
                            ♻️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="table-empty">
                    <div className="empty-state">
                      <div className="empty-icon">📂</div>
                      <p>No se encontraron categorías con los filtros seleccionados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="categories-grid">
        {filteredCategories.map((category, index) => {
          const percentage = totalProducts > 0 ? (category.productCount / totalProducts) * 100 : 0;
          
          return (
            <div
              key={category.id}
              className="category-card"
              style={{
                '--category-color': category.color,
                '--category-gradient': category.gradient,
              } as React.CSSProperties}
              data-index={index}
            >
              <div className="category-card-image-wrapper">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="category-card-image"
                />
                <div className="category-image-overlay" />
                <div className="category-product-badge">
                  <span className="product-badge-icon">📦</span>
                  <span className="product-badge-count">{category.productCount}</span>
                  <span className="product-badge-label">{category.productCount === 1 ? 'producto' : 'productos'}</span>
                </div>
              </div>
              
              <div className="category-card-content">
                {!category.isActive && (
                  <div className="category-inactive-badge">
                    <span className="inactive-icon">🚫</span>
                    <span className="inactive-text">Desactivada</span>
                  </div>
                )}
                <div className="category-card-header">
                  <div className="category-header-info">
                    <h3 className="category-card-name">{category.name}</h3>
                    <div className="category-trend">
                      <span
                        className="category-trend-value"
                        style={{ color: getTrendColor(category.trend) }}
                      >
                        {getTrendIcon(category.trend)} {category.trendValue > 0 ? '+' : ''}
                        {category.trendValue}%
                      </span>
                      <span className="category-trend-label">este mes</span>
                    </div>
                  </div>
                </div>

                <p className="category-card-description">{category.description}</p>

                <div className="category-date">
                  <span className="date-icon">📅</span>
                  <span className="date-text">
                    {category.editedAt ? (
                      <>
                        Editado: {formatDate(category.editedAt)}
                      </>
                    ) : (
                      formatDate(category.createdAt)
                    )}
                  </span>
                </div>

                <div className="category-stats">
                  <div className="category-product-count">
                    <div className="product-count-wrapper">
                      <span className="product-count-icon">📊</span>
                      <div className="product-count-content">
                        <span className="count-number">
                          {category.productCount.toLocaleString('es-PE')}
                        </span>
                        <span className="count-label">
                          {category.productCount === 1 ? 'Producto' : 'Productos'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="category-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`,
                          background: category.gradient,
                        }}
                      />
                    </div>
                    <span className="progress-percentage">{Math.round(percentage)}%</span>
                  </div>
                </div>

                <div className="category-card-actions">
                  <button 
                    className="btn-action btn-view"
                    onClick={() => handleViewProducts(category)}
                  >
                    <span>Ver productos ({category.productCount})</span>
                  </button>
                  <button 
                    className="btn-action btn-edit"
                    onClick={() => handleOpenEditModal(category)}
                  >
                    <span>Editar</span>
                  </button>
                  {category.isActive ? (
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteCategory(category)}
                    >
                      <span>{category.productCount > 0 ? 'Desactivar' : 'Eliminar'}</span>
                    </button>
                  ) : (
                    <button 
                      className="btn-action btn-reactivate"
                      onClick={() => handleReactivateCategory(category)}
                    >
                      <span>Reactivar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Nueva Categoría</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nombre de la Categoría <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: Smartphones"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="form-label">
                  Descripción <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Describe la categoría..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image" className="form-label">
                  Imagen de la Categoría <span className="required">*</span>
                </label>
                {formData.imagePreview ? (
                  <div className="image-preview-container">
                    <img 
                      src={formData.imagePreview} 
                      alt="Preview" 
                      className="image-preview"
                    />
                    <button 
                      type="button" 
                      className="btn-remove-image"
                      onClick={handleImageRemove}
                    >
                      Eliminar imagen
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-area">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="image-input"
                    />
                    <label htmlFor="image" className="image-upload-label">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">
                        <strong>Haz clic para subir</strong> o arrastra una imagen aquí
                      </span>
                      <span className="upload-hint">PNG, JPG, WEBP hasta 5MB</span>
                    </label>
                  </div>
                )}
                <span className="form-hint">
                  El color y tendencia se generarán automáticamente
                </span>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-submit">
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Editar Categoría</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="edit-name" className="form-label">
                  Nombre de la Categoría <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: Smartphones"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description" className="form-label">
                  Descripción <span className="required">*</span>
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Describe la categoría..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-image" className="form-label">
                  Imagen de la Categoría <span className="required">*</span>
                </label>
                {formData.imagePreview ? (
                  <div className="image-preview-container">
                    <img 
                      src={formData.imagePreview} 
                      alt="Preview" 
                      className="image-preview"
                    />
                    <button 
                      type="button" 
                      className="btn-remove-image"
                      onClick={handleImageRemove}
                    >
                      Eliminar imagen
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-area">
                    <input
                      type="file"
                      id="edit-image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="image-input"
                    />
                    <label htmlFor="edit-image" className="image-upload-label">
                      <span className="upload-icon">📷</span>
                      <span className="upload-text">
                        <strong>Haz clic para subir</strong> o arrastra una imagen aquí
                      </span>
                      <span className="upload-hint">PNG, JPG, WEBP hasta 5MB</span>
                    </label>
                  </div>
                )}
                <span className="form-hint">
                  El color y tendencia se generarán automáticamente
                </span>
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

      {isProductsModalOpen && viewingCategory && (
        <div className="modal-overlay" onClick={handleCloseProductsModal}>
          <div className="modal-content products-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Productos de "{viewingCategory.name}"</h2>
                <p className="modal-subtitle">
                  {viewingCategory.productCount} {viewingCategory.productCount === 1 ? 'producto' : 'productos'} en esta categoría
                </p>
              </div>
              <button className="modal-close" onClick={handleCloseProductsModal}>
                ×
              </button>
            </div>

            <div className="products-list-container">
              {viewingCategory.products && viewingCategory.products.length > 0 ? (
                <div className="products-list">
                  {viewingCategory.products.map((product) => (
                    <div key={product.id} className="product-item">
                      <div className="product-info">
                        <h4 className="product-name">{product.name}</h4>
                        <div className="product-details">
                          <span className="product-price">${product.price.toLocaleString()}</span>
                          <span className="product-stock">Stock: {product.stock}</span>
                          <span className={`product-status ${product.status}`}>
                            {product.status === 'activo' ? '✓ Activo' : '✗ Inactivo'}
                          </span>
                        </div>
                      </div>
                      <div className="product-actions">
                        <button className="btn-product-action btn-edit-product">
                          Editar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-products">
                  <div className="empty-icon">📦</div>
                  <h3>No hay productos</h3>
                  <p>Esta categoría aún no tiene productos asociados.</p>
                  <button className="btn btn-primary" onClick={handleCloseProductsModal}>
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
