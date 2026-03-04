import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './Brands.css';
import { historyService, compareObjects } from '../../utils/historyService';
import { COLLECTIONS } from '../../firebase/collections';
import { deleteDocById, setDocById, subscribeCollection, updateDocById } from '../../firebase/firestoreHelpers';
import { uploadBrandImage } from '../../firebase/storageHelpers';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: 'activo' | 'inactivo';
}

interface Brand {
  id: string;
  name: string;
  description: string;
  categoryIds: string[];
  productCount: number;
  products: Product[];
  image: string;
  imageFit?: 'cover' | 'contain';
  color: string;
  gradient: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  createdAt: string;
  editedAt?: string;
  isActive: boolean;
}

interface FirestoreCategory {
  id: string;
  name: string;
  isActive: boolean;
}

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

export const Brands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<FirestoreCategory[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
  const [viewingBrand, setViewingBrand] = useState<Brand | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryIds: [] as string[],
    image: null as File | string | null,
    imagePreview: '',
    imageFit: 'cover' as 'cover' | 'contain',
  });

  const filteredBrands = showInactive 
    ? brands 
    : brands.filter(brand => brand.isActive);

  const totalProducts = filteredBrands.reduce((sum, brand) => sum + brand.productCount, 0);

  const activeCategories = categories.filter((cat) => cat.isActive);

  useEffect(() => {
    const unsubscribe = subscribeCollection<
      Brand & { categoryId?: string; categoryIds?: string[] }
    >(
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
            imageFit: b.imageFit ?? 'cover',
          }))
        ),
      (error) => console.error('Error subscribing brands:', error)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeCollection<FirestoreCategory>(
      COLLECTIONS.categories,
      (items) => setCategories(items),
      (error) => console.error('Error subscribing categories:', error)
    );
    return () => unsubscribe();
  }, []);

  const getCategoryById = (categoryId: string): FirestoreCategory | undefined => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const getCategoryLabels = (ids: string[]) => {
    const labels = ids
      .map((id) => getCategoryById(id)?.name)
      .filter(Boolean) as string[];
    return labels.length ? labels.join(', ') : 'Sin categoría';
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      categoryIds: [],
      image: null,
      imagePreview: '',
      imageFit: 'cover',
    });
  };

  const handleOpenEditModal = (brand: Brand) => {
    setEditingBrandId(brand.id);
    setIsEditModalOpen(true);
    setFormData({
      name: brand.name,
      description: brand.description,
      categoryIds: brand.categoryIds,
      image: brand.image,
      imagePreview: brand.image,
      imageFit: brand.imageFit ?? 'cover',
    });
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBrandId(null);
    setFormData({
      name: '',
      description: '',
      categoryIds: [],
      image: null,
      imagePreview: '',
      imageFit: 'cover',
    });
  };

  const handleViewProducts = (brand: Brand) => {
    setViewingBrand(brand);
    setIsProductsModalOpen(true);
  };

  const handleCloseProductsModal = () => {
    setIsProductsModalOpen(false);
    setViewingBrand(null);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleCategoryId = (categoryId: string, checked: boolean) => {
    setFormData((prev) => {
      const next = new Set(prev.categoryIds);
      if (checked) {
        next.add(categoryId);
      } else {
        next.delete(categoryId);
      }
      return { ...prev, categoryIds: Array.from(next) };
    });
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

    return slug || 'marca';
  };

  const buildBrandId = (name: string) => {
    const base = `marca-${slugify(name)}`.slice(0, 48);
    const existing = new Set(brands.map((b) => b.id));
    if (!existing.has(base)) return base;

    let suffix = 2;
    while (existing.has(`${base}-${suffix}`)) {
      suffix++;
    }
    return `${base}-${suffix}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || formData.categoryIds.length === 0) {
      showToast('error', 'Por favor completa todos los campos requeridos', 3000);
      return;
    }

    if (!formData.image && !formData.imagePreview) {
      showToast('error', 'Por favor selecciona una imagen para la marca', 3000);
      return;
    }

    const trimmedName = formData.name.trim();
    let imageUrl: string;

    // Si hay un archivo nuevo, subirlo a Storage
    if (formData.image instanceof File) {
      try {
        showToast('success', 'Subiendo imagen...', 2000);
        imageUrl = await uploadBrandImage({
          brandName: trimmedName,
          file: formData.image,
        });
      } catch (error: any) {
        console.error('Error uploading brand image:', error);
        let errorMessage = 'No se pudo subir la imagen de la marca.';
        
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
    
    const newIndex = brands.length;
    const styles = getAutoGeneratedStyles(newIndex);
    const trendData = calculateTrend(0, 0);
    const createdAt = new Date().toISOString();

    const newBrand: Brand = {
      id: buildBrandId(trimmedName),
      name: formData.name.trim(),
      description: formData.description.trim(),
      categoryIds: formData.categoryIds,
      productCount: 0,
      products: [],
      image: imageUrl,
      imageFit: formData.imageFit,
      color: styles.color,
      gradient: styles.gradient,
      trend: trendData.trend,
      trendValue: trendData.trendValue,
      createdAt,
      isActive: true,
    };

    try {
      const { id, ...data } = newBrand;
      await setDocById(COLLECTIONS.brands, id, data);
    } catch (error: any) {
      console.error('Error creating brand:', error);
      let errorMessage = 'No se pudo crear la marca.';
      
      if (error?.message?.includes('longer than')) {
        errorMessage = 'La imagen es demasiado grande. Por favor selecciona una imagen más pequeña (máximo 5MB).';
      }
      
      showToast('error', errorMessage, 4000);
      return;
    }
    
    historyService.add({
      action: 'create',
      section: 'brands',
      itemName: newBrand.name,
      itemId: newBrand.id,
      details: `Marca "${newBrand.name}" creada`,
    });
    
    showToast('success', `Marca "${newBrand.name}" creada exitosamente`, 3000);
    
    handleCloseModal();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || formData.categoryIds.length === 0) {
      showToast('error', 'Por favor completa todos los campos requeridos', 3000);
      return;
    }

    if (!formData.image && !formData.imagePreview) {
      showToast('error', 'Por favor selecciona una imagen para la marca', 3000);
      return;
    }

    if (!editingBrandId) return;

    const existing = brands.find((b) => b.id === editingBrandId);
    if (!existing) return;

    const trimmedName = formData.name.trim();
    let imageUrl: string;

    // Si hay un archivo nuevo, subirlo a Storage
    if (formData.image instanceof File) {
      try {
        showToast('success', 'Subiendo imagen...', 2000);
        imageUrl = await uploadBrandImage({
          brandName: trimmedName,
          file: formData.image,
        });
      } catch (error: any) {
        console.error('Error uploading brand image:', error);
        let errorMessage = 'No se pudo subir la imagen de la marca.';
        
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
    const beforeCategoryNames = existing.categoryIds
      .map((id) => categories.find((c) => c.id === id)?.name || id)
      .join(', ');
    
    const beforeData: Record<string, unknown> = {
      nombre: existing.name,
      descripcion: existing.description,
      categorias: beforeCategoryNames || 'Ninguna',
      imagen: existing.image ? 'Sí' : 'No',
    };

    // Preparar objeto "después" para comparación
    const afterCategoryNames = formData.categoryIds
      .map((id) => categories.find((c) => c.id === id)?.name || id)
      .join(', ');
    
    const afterData: Record<string, unknown> = {
      nombre: formData.name.trim(),
      descripcion: formData.description.trim(),
      categorias: afterCategoryNames || 'Ninguna',
      imagen: imageUrl ? 'Sí' : 'No',
    };

    // Generar cambios
    const changes = compareObjects(beforeData, afterData, {
      nombre: 'Nombre',
      descripcion: 'Descripción',
      categorias: 'Categorías',
      imagen: 'Imagen',
    });

    try {
      await updateDocById<Brand>(COLLECTIONS.brands, editingBrandId, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryIds: formData.categoryIds,
        image: imageUrl as string,
        imageFit: formData.imageFit,
        editedAt,
      });
    } catch (error) {
      console.error('Error updating brand:', error);
      showToast('error', 'No se pudo editar la marca', 3000);
      return;
    }

    historyService.add({
      action: 'update',
      section: 'brands',
      itemName: formData.name.trim(),
      itemId: editingBrandId!,
      details: `Marca "${formData.name.trim()}" actualizada`,
      changes: changes.length > 0 ? changes : undefined,
    });

    showToast('success', `Marca "${formData.name.trim()}" editada exitosamente`, 3000);
    
    handleCloseEditModal();
  };

  const handleDeleteBrand = async (brand: Brand) => {
    if (brand.productCount > 0) {
      const result = await Swal.fire({
        title: '¿Desactivar marca?',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">
              La marca <strong style="color: #f59e0b;">"${brand.name}"</strong> tiene <strong>${brand.productCount} productos</strong> asociados.
            </p>
            <p style="color: #92400e; font-size: 0.9rem; background: #fffbeb; padding: 0.75rem; border-radius: 0.5rem; border-left: 3px solid #f59e0b;">
              ⚠️ Se desactivará la marca (no se eliminará). Los productos mantendrán su relación y podrás reactivarla después.
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
          await updateDocById<Brand>(COLLECTIONS.brands, brand.id, { isActive: false });
        } catch (error) {
          console.error('Error deactivating brand:', error);
          showToast('error', 'No se pudo desactivar la marca', 3000);
          return;
        }

        await Swal.fire({
          title: '¡Desactivada!',
          text: `La marca "${brand.name}" ha sido desactivada`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Perfecto',
          timer: 2000,
          timerProgressBar: true,
        });

        historyService.add({
          action: 'deactivate',
          section: 'brands',
          itemName: brand.name,
          itemId: brand.id,
          details: `Marca "${brand.name}" desactivada`,
        });

        showToast('success', `Marca "${brand.name}" desactivada exitosamente`, 3000);
      }
    } else {
      const result = await Swal.fire({
        title: '¿Eliminar permanentemente?',
        html: `
          <div style="text-align: center;">
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">
              La marca <strong style="color: #ef4444;">"${brand.name}"</strong> será eliminada permanentemente.
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
          await deleteDocById(COLLECTIONS.brands, brand.id);
        } catch (error) {
          console.error('Error deleting brand:', error);
          showToast('error', 'No se pudo eliminar la marca', 3000);
          return;
        }

        await Swal.fire({
          title: '¡Eliminada!',
          text: `La marca "${brand.name}" ha sido eliminada permanentemente`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Perfecto',
          timer: 2000,
          timerProgressBar: true,
        });

        historyService.add({
          action: 'delete',
          section: 'brands',
          itemName: brand.name,
          itemId: brand.id,
          details: `Marca "${brand.name}" eliminada permanentemente`,
        });

        showToast('success', `Marca "${brand.name}" eliminada permanentemente`, 3000);
      }
    }
  };

  const handleReactivateBrand = async (brand: Brand) => {
    const result = await Swal.fire({
      title: '¿Reactivar marca?',
      html: `
        <div style="text-align: center;">
          <p style="font-size: 1.1rem;">
            ¿Deseas reactivar la marca <strong style="color: #10b981;">"${brand.name}"</strong>?
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
        await updateDocById<Brand>(COLLECTIONS.brands, brand.id, { isActive: true });
      } catch (error) {
        console.error('Error reactivating brand:', error);
        showToast('error', 'No se pudo reactivar la marca', 3000);
        return;
      }

      historyService.add({
        action: 'reactivate',
        section: 'brands',
        itemName: brand.name,
        itemId: brand.id,
        details: `Marca "${brand.name}" reactivada`,
      });

      showToast('success', `Marca "${brand.name}" reactivada exitosamente`, 3000);
    }
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
    <div className="brands-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Marcas</h1>
          <p className="page-description">
            Gestiona y organiza las marcas de tus productos
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <span className="btn-icon">+</span>
          Nueva Marca
        </button>
      </div>

      <div className="brands-stats">
        <div className="stat-badge">
          <span className="stat-badge-label">Total Marcas</span>
          <span className="stat-badge-value">{filteredBrands.length}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Total Productos</span>
          <span className="stat-badge-value">{totalProducts}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-badge-label">Promedio</span>
          <span className="stat-badge-value">
            {filteredBrands.length > 0 ? Math.round(totalProducts / filteredBrands.length) : 0}
          </span>
        </div>
      </div>

      <div className="brands-header-controls">
        <div className="toggle-inactive">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="toggle-checkbox"
            />
            <span className="toggle-text">Mostrar marcas desactivadas</span>
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
        <div className="brands-table-container">
          <table className="brands-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Productos</th>
                <th>Tendencia</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <div className="table-brand-image">
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className={
                            brand.imageFit === 'contain'
                              ? 'table-brand-image-img table-brand-image-img--contain'
                              : 'table-brand-image-img'
                          }
                        />
                      </div>
                    </td>
                    <td>
                      <div className="table-brand-name">{brand.name}</div>
                    </td>
                    <td>
                      <div className="table-brand-description">{brand.description}</div>
                    </td>
                    <td>
                      <div className="table-brand-category">
                        <>
                          <span className="category-icon">📂</span>
                          <span className="category-name">{getCategoryLabels(brand.categoryIds)}</span>
                        </>
                      </div>
                    </td>
                    <td>
                      <div className="table-brand-products">
                        <span className="product-count-number">{brand.productCount}</span>
                        <span className="product-count-label">productos</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-brand-trend">
                        <span
                          className="trend-value"
                          style={{ color: getTrendColor(brand.trend) }}
                        >
                          {getTrendIcon(brand.trend)} {brand.trendValue > 0 ? '+' : ''}
                          {brand.trendValue}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${brand.isActive ? 'activo' : 'inactivo'}`}>
                        {brand.isActive ? '✓ Activo' : '✗ Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-brand-date">
                        {brand.editedAt ? (
                          <>
                            <div>Editado: {formatDate(brand.editedAt)}</div>
                          </>
                        ) : (
                          <div>{formatDate(brand.createdAt)}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-action btn-view"
                          onClick={() => handleViewProducts(brand)}
                          title="Ver productos"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleOpenEditModal(brand)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        {brand.isActive ? (
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDeleteBrand(brand)}
                            title={brand.productCount > 0 ? 'Desactivar' : 'Eliminar'}
                          >
                            🗑️
                          </button>
                        ) : (
                          <button
                            className="btn-action btn-reactivate"
                            onClick={() => handleReactivateBrand(brand)}
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
                  <td colSpan={9} className="table-empty">
                    <div className="empty-state">
                      <div className="empty-icon">🏷️</div>
                      <p>No se encontraron marcas con los filtros seleccionados</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="brands-grid">
        {filteredBrands.map((brand, index) => {
          const percentage = (brand.productCount / totalProducts) * 100;
          
          return (
            <div
              key={brand.id}
              className="brand-card"
              style={{
                '--brand-color': brand.color,
                '--brand-gradient': brand.gradient,
              } as React.CSSProperties}
              data-index={index}
            >
              <div className="brand-card-image-wrapper">
                <img 
                  src={brand.image} 
                  alt={brand.name}
                  className={
                    brand.imageFit === 'contain'
                      ? 'brand-card-image brand-card-image--contain'
                      : 'brand-card-image'
                  }
                />
                <div className="brand-image-overlay" />
              </div>
              
              <div className="brand-card-content">
                {!brand.isActive && (
                  <div className="brand-inactive-badge">
                    <span className="inactive-icon">🚫</span>
                    <span className="inactive-text">Desactivada</span>
                  </div>
                )}
                <div className="brand-card-header">
                  <div className="brand-header-info">
                    <h3 className="brand-card-name">{brand.name}</h3>
                    <div className="brand-trend">
                      <span
                        className="brand-trend-value"
                        style={{ color: getTrendColor(brand.trend) }}
                      >
                        {getTrendIcon(brand.trend)} {brand.trendValue > 0 ? '+' : ''}
                        {brand.trendValue}%
                      </span>
                      <span className="brand-trend-label">este mes</span>
                    </div>
                  </div>
                </div>

                <p className="brand-card-description">{brand.description}</p>

                {brand.categoryIds.length > 0 && (
                  <div className="brand-category">
                    <span className="category-icon">📂</span>
                    <span className="category-name">{getCategoryLabels(brand.categoryIds)}</span>
                  </div>
                )}

                <div className="brand-date">
                  <span className="date-icon">📅</span>
                  <span className="date-text">
                    {brand.editedAt ? (
                      <>
                        Editado: {formatDate(brand.editedAt)}
                      </>
                    ) : (
                      formatDate(brand.createdAt)
                    )}
                  </span>
                </div>

                <div className="brand-stats">
                  <div className="brand-product-count">
                    <span className="count-number">{brand.productCount}</span>
                    <span className="count-label">productos</span>
                  </div>
                  <div className="brand-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`,
                          background: brand.gradient,
                        }}
                      />
                    </div>
                    <span className="progress-percentage">{Math.round(percentage)}%</span>
                  </div>
                </div>

                <div className="brand-card-actions">
                  <button 
                    className="btn-action btn-view"
                    onClick={() => handleViewProducts(brand)}
                  >
                    <span>Ver productos ({brand.productCount})</span>
                  </button>
                  <button 
                    className="btn-action btn-edit"
                    onClick={() => handleOpenEditModal(brand)}
                  >
                    <span>Editar</span>
                  </button>
                  {brand.isActive ? (
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteBrand(brand)}
                    >
                      <span>{brand.productCount > 0 ? 'Desactivar' : 'Eliminar'}</span>
                    </button>
                  ) : (
                    <button 
                      className="btn-action btn-reactivate"
                      onClick={() => handleReactivateBrand(brand)}
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
              <h2 className="modal-title">Nueva Marca</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="brand-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nombre de la Marca <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: Apple"
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
                  placeholder="Describe la marca..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <span className="form-label">
                  Categorías <span className="required">*</span>
                </span>
                <div className="checkbox-list" role="group" aria-label="Categorías">
                  {activeCategories.map((category) => {
                    const checked = formData.categoryIds.includes(category.id);
                    return (
                      <label key={category.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={checked}
                          onChange={(e) => toggleCategoryId(category.id, e.target.checked)}
                        />
                        <span className="checkbox-label">{category.name}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="form-hint">Marca una o varias categorías.</p>
                <span className="form-hint">
                  Selecciona la categoría a la que pertenece esta marca
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="image" className="form-label">
                  Imagen de la Marca <span className="required">*</span>
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
                <div className="image-options-row">
                  <div className="image-fit-control">
                    <label className="form-label" htmlFor="imageFit">
                      Modo de presentación
                    </label>
                    <select
                      id="imageFit"
                      name="imageFit"
                      className="form-select"
                      value={formData.imageFit}
                      onChange={handleInputChange}
                    >
                      <option value="cover">Banner recortado (ocupa todo el ancho)</option>
                      <option value="contain">Logo centrado (mantiene proporción)</option>
                    </select>
                    <p className="form-hint">
                      Usa <strong>Logo centrado</strong> para logos cuadrados o horizontales, y{' '}
                      <strong>Banner recortado</strong> para imágenes panorámicas.
                    </p>
                  </div>
                </div>
                <span className="form-hint">El color y tendencia se generarán automáticamente</span>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-submit">
                  Crear Marca
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
              <h2 className="modal-title">Editar Marca</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="brand-form">
              <div className="form-group">
                <label htmlFor="edit-name" className="form-label">
                  Nombre de la Marca <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ej: Apple"
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
                  placeholder="Describe la marca..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <span className="form-label">
                  Categorías <span className="required">*</span>
                </span>
                <div className="checkbox-list" role="group" aria-label="Categorías">
                  {activeCategories.map((category) => {
                    const checked = formData.categoryIds.includes(category.id);
                    return (
                      <label key={category.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          className="checkbox-input"
                          checked={checked}
                          onChange={(e) => toggleCategoryId(category.id, e.target.checked)}
                        />
                        <span className="checkbox-label">{category.name}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="form-hint">Marca una o varias categorías.</p>
                <span className="form-hint">
                  Selecciona la categoría a la que pertenece esta marca
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="edit-image" className="form-label">
                  Imagen de la Marca <span className="required">*</span>
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
                <div className="image-options-row">
                  <div className="image-fit-control">
                    <label className="form-label" htmlFor="edit-imageFit">
                      Modo de presentación
                    </label>
                    <select
                      id="edit-imageFit"
                      name="imageFit"
                      className="form-select"
                      value={formData.imageFit}
                      onChange={handleInputChange}
                    >
                      <option value="cover">Banner recortado (ocupa todo el ancho)</option>
                      <option value="contain">Logo centrado (mantiene proporción)</option>
                    </select>
                    <p className="form-hint">
                      Usa <strong>Logo centrado</strong> para logos cuadrados o horizontales, y{' '}
                      <strong>Banner recortado</strong> para imágenes panorámicas.
                    </p>
                  </div>
                </div>
                <span className="form-hint">El color y tendencia se generarán automáticamente</span>
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

      {isProductsModalOpen && viewingBrand && (
        <div className="modal-overlay" onClick={handleCloseProductsModal}>
          <div className="modal-content products-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Productos de "{viewingBrand.name}"</h2>
                <p className="modal-subtitle">
                  {viewingBrand.productCount} {viewingBrand.productCount === 1 ? 'producto' : 'productos'} de esta marca
                </p>
              </div>
              <button className="modal-close" onClick={handleCloseProductsModal}>
                ×
              </button>
            </div>

            <div className="products-list-container">
              {viewingBrand.products && viewingBrand.products.length > 0 ? (
                <div className="products-list">
                  {viewingBrand.products.map((product) => (
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
                  <p>Esta marca aún no tiene productos asociados.</p>
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
