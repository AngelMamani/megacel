import { getDownloadURL, ref, uploadBytes, deleteObject, listAll } from 'firebase/storage';
import { firebaseStorage, firebaseAuth } from '../config/FirebaseConfig.ts';

function sanitizeFileName(name: string) {
  const base = name.trim().toLowerCase();
  const safe = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return safe || 'image';
}

function sanitizeProductName(name: string): string {
  return sanitizeFileName(name);
}

async function ensureAuthenticated(): Promise<void> {
  if (firebaseAuth.currentUser) {
    return;
  }

  throw new Error(
    'No estás autenticado. Por favor inicia sesión con Google primero.\n' +
    'Asegúrate de que tu correo esté registrado como administrador en el sistema.'
  );
}

export async function uploadProductImage(params: {
  productName: string;
  file: File;
}): Promise<string> {
  const { productName, file } = params;
  
  await ensureAuthenticated();

  const stamp = Date.now();
  const safeProductName = sanitizeProductName(productName);
  const safeFileName = sanitizeFileName(file.name);
  const path = `products/${safeProductName}/${stamp}-${safeFileName}`;

  try {
    const storageRef = ref(firebaseStorage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    console.error('Error detallado de Storage:', {
      code: error?.code,
      message: error?.message,
      serverResponse: error?.serverResponse,
      currentUser: firebaseAuth.currentUser?.uid,
    });

    if (error?.code === 'storage/unauthorized' || error?.code === 'storage/permission-denied') {
      throw new Error(
        'No tienes permisos para subir imágenes. Verifica:\n' +
        '1. Que estés autenticado con Google\n' +
        '2. Que tu correo esté registrado como administrador\n' +
        '3. Que las reglas de Storage permitan escritura para usuarios autenticados'
      );
    }
    
    if (error?.code === 'storage/unauthenticated') {
      throw new Error(
        'No estás autenticado. Por favor inicia sesión con Google e intenta nuevamente.'
      );
    }

    throw new Error(`Error al subir imagen: ${error?.message || 'Error desconocido'}`);
  }
}

export async function uploadAdminAvatar(params: {
  adminId: string;
  file: File;
}): Promise<string> {
  const { adminId, file } = params;

  await ensureAuthenticated();

  const stamp = Date.now();
  const safeAdminId = sanitizeFileName(adminId);
  const safeFileName = sanitizeFileName(file.name);
  const path = `admins/${safeAdminId}/avatar/${stamp}-${safeFileName}`;

  try {
    const storageRef = ref(firebaseStorage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    console.error('Error detallado de Storage (avatar):', {
      code: error?.code,
      message: error?.message,
      serverResponse: error?.serverResponse,
      currentUser: firebaseAuth.currentUser?.uid,
    });

    if (error?.code === 'storage/unauthorized' || error?.code === 'storage/permission-denied') {
      throw new Error(
        'No tienes permisos para subir el avatar. Verifica:\n' +
          '1. Que estés autenticado\n' +
          '2. Que tu correo esté registrado como administrador\n' +
          '3. Que las reglas de Storage permitan escritura para usuarios autenticados'
      );
    }

    if (error?.code === 'storage/unauthenticated') {
      throw new Error('No estás autenticado. Por favor inicia sesión e intenta nuevamente.');
    }

    throw new Error(`Error al subir avatar: ${error?.message || 'Error desconocido'}`);
  }
}

export async function uploadProductReviewImage(params: {
  productId: string;
  platformUserId: string;
  file: File;
}): Promise<string> {
  const { productId, platformUserId, file } = params;

  await ensureAuthenticated();

  const stamp = Date.now();
  const safeProductId = sanitizeFileName(productId);
  const safeUserId = sanitizeFileName(platformUserId);
  const safeFileName = sanitizeFileName(file.name);
  const path = `product-reviews/${safeProductId}/${safeUserId}/${stamp}-${safeFileName}`;

  try {
    const storageRef = ref(firebaseStorage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return await getDownloadURL(storageRef);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.error('Error detallado de Storage (review):', {
      code: err?.code,
      message: err?.message,
      currentUser: firebaseAuth.currentUser?.uid,
    });

    if (err?.code === 'storage/unauthorized' || err?.code === 'storage/permission-denied') {
      throw new Error('No tienes permisos para subir imágenes de la valoración.');
    }

    if (err?.code === 'storage/unauthenticated') {
      throw new Error('Inicia sesión para subir imágenes.');
    }

    throw new Error(`Error al subir imagen: ${err?.message || 'Error desconocido'}`);
  }
}

export async function uploadBrandImage(params: {
  brandName: string;
  file: File;
}): Promise<string> {
  const { brandName, file } = params;
  
  await ensureAuthenticated();

  const stamp = Date.now();
  const safeBrandName = sanitizeFileName(brandName);
  const safeFileName = sanitizeFileName(file.name);
  const path = `brands/${safeBrandName}/${stamp}-${safeFileName}`;

  try {
    const storageRef = ref(firebaseStorage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    console.error('Error detallado de Storage (brand):', {
      code: error?.code,
      message: error?.message,
      serverResponse: error?.serverResponse,
      currentUser: firebaseAuth.currentUser?.uid,
    });

    if (error?.code === 'storage/unauthorized' || error?.code === 'storage/permission-denied') {
      throw new Error(
        'No tienes permisos para subir la imagen de la marca. Verifica:\n' +
        '1. Que estés autenticado con Google\n' +
        '2. Que tu correo esté registrado como administrador\n' +
        '3. Que las reglas de Storage permitan escritura para usuarios autenticados'
      );
    }
    
    if (error?.code === 'storage/unauthenticated') {
      throw new Error(
        'No estás autenticado. Por favor inicia sesión con Google e intenta nuevamente.'
      );
    }

    throw new Error(`Error al subir imagen de marca: ${error?.message || 'Error desconocido'}`);
  }
}

export async function uploadCategoryImage(params: {
  categoryName: string;
  file: File;
}): Promise<string> {
  const { categoryName, file } = params;
  
  await ensureAuthenticated();

  const stamp = Date.now();
  const safeCategoryName = sanitizeFileName(categoryName);
  const safeFileName = sanitizeFileName(file.name);
  const path = `categories/${safeCategoryName}/${stamp}-${safeFileName}`;

  try {
    const storageRef = ref(firebaseStorage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return await getDownloadURL(storageRef);
  } catch (error: any) {
    console.error('Error detallado de Storage (category):', {
      code: error?.code,
      message: error?.message,
      serverResponse: error?.serverResponse,
      currentUser: firebaseAuth.currentUser?.uid,
    });

    if (error?.code === 'storage/unauthorized' || error?.code === 'storage/permission-denied') {
      throw new Error(
        'No tienes permisos para subir la imagen de la categoría. Verifica:\n' +
        '1. Que estés autenticado con Google\n' +
        '2. Que tu correo esté registrado como administrador\n' +
        '3. Que las reglas de Storage permitan escritura para usuarios autenticados'
      );
    }
    
    if (error?.code === 'storage/unauthenticated') {
      throw new Error(
        'No estás autenticado. Por favor inicia sesión con Google e intenta nuevamente.'
      );
    }

    throw new Error(`Error al subir imagen de categoría: ${error?.message || 'Error desconocido'}`);
  }
}

/**
 * Extrae la ruta del Storage desde una URL de Firebase Storage
 */
function extractStoragePathFromUrl(url: string): string {
  try {
    // Las URLs de Firebase Storage tienen el formato:
    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media&token=...
    // o también pueden tener el formato con %2F para las barras:
    // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/products%2Fproduct-name%2Ffile.jpg?alt=media&token=...
    
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Buscar el patrón /o/ en el pathname
    const oIndex = pathname.indexOf('/o/');
    
    if (oIndex === -1) {
      console.warn('URL no tiene el patrón /o/ esperado:', { url, pathname });
      throw new Error('URL no tiene el formato esperado de Firebase Storage (no se encontró /o/)');
    }
    
    // Extraer todo después de /o/ hasta el final del pathname o hasta un ?
    let encodedPath = pathname.substring(oIndex + 3); // +3 para saltar '/o/'
    
    // Si el pathname tiene query params, ya están separados por el URL constructor
    // pero si hay caracteres especiales, pueden estar codificados
        
    // Intentar decodificar la ruta (Firebase codifica espacios y caracteres especiales)
    try {
      // Decodificar la ruta (puede tener %2F para /, %20 para espacios, etc.)
      const decodedPath = decodeURIComponent(encodedPath);
      return decodedPath;
    } catch (decodeError) {
      // Si falla el decode, puede que ya esté decodificado o tenga formato diferente
      // Intentar usar el pathname directamente después de /o/
      console.warn('No se pudo decodificar la ruta, usando tal cual:', encodedPath);
      return encodedPath;
    }
  } catch (error: any) {
    // Si el error es porque no es una URL válida, intentar parsear manualmente
    if (error instanceof TypeError && error.message.includes('Invalid URL')) {
      // Intentar extraer con regex directamente
      const regexMatch = url.match(/\/o\/([^?]+)/);
      if (regexMatch && regexMatch[1]) {
        try {
          return decodeURIComponent(regexMatch[1]);
        } catch {
          return regexMatch[1];
        }
      }
    }
    
    console.error('Error extrayendo ruta de URL:', { 
      url, 
      error: error.message,
      stack: error.stack 
    });
    throw new Error(`No se pudo extraer la ruta de la imagen desde la URL: ${error.message}`);
  }
}

/**
 * Elimina todas las imágenes de una carpeta en Storage (`{basePath}/{nombre}/`).
 * @returns true si se eliminó al menos un archivo.
 */
async function deleteStorageFolder(basePath: string, entityName: string): Promise<boolean> {
  await ensureAuthenticated();

  try {
    const safeName = sanitizeFileName(entityName);
    const folderRef = ref(firebaseStorage, `${basePath}/${safeName}`);

    const listResult = await listAll(folderRef);
    const hasFiles = listResult.items.length > 0 || listResult.prefixes.length > 0;

    if (!hasFiles) {
      return false;
    }

    const fileDeletePromises = listResult.items.map((itemRef) =>
      deleteObject(itemRef).catch((err: { code?: string }) => {
        if (err?.code !== 'storage/object-not-found') {
          console.warn('Error eliminando archivo individual:', itemRef.fullPath, err);
        }
        return null;
      })
    );

    const folderDeletePromises = listResult.prefixes.map((prefixRef) =>
      listAll(prefixRef).then((subList) =>
        Promise.all(
          subList.items.map((itemRef) =>
            deleteObject(itemRef).catch((err: { code?: string }) => {
              if (err?.code !== 'storage/object-not-found') {
                console.warn('Error eliminando archivo en subcarpeta:', itemRef.fullPath, err);
              }
              return null;
            })
          )
        )
      )
    );

    await Promise.all([...fileDeletePromises, ...folderDeletePromises]);

    return true;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === 'storage/object-not-found' || err?.code === 'storage/not-found') {
      return false;
    }

    console.error('Error eliminando carpeta del Storage:', error);
    throw new Error(`Error al eliminar carpeta: ${err?.message || 'Error desconocido'}`);
  }
}

/**
 * Elimina una imagen del Storage usando su URL de descarga.
 */
export async function deleteStorageImageByUrl(imageUrl: string): Promise<void> {
  await ensureAuthenticated();

  try {
    const storagePath = extractStoragePathFromUrl(imageUrl);
    const storageRef = ref(firebaseStorage, storagePath);

    await deleteObject(storageRef);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err?.code === 'storage/object-not-found') {
      console.warn('La imagen ya no existe en Storage:', imageUrl);
      return;
    }

    if (err?.message?.includes('No se pudo extraer la ruta')) {
      console.warn('No se pudo eliminar la imagen del Storage (URL inválida):', imageUrl);
      return;
    }

    console.error('Error eliminando imagen del Storage:', error);
    throw new Error(`Error al eliminar imagen: ${err?.message || 'Error desconocido'}`);
  }
}

/** @deprecated Usar deleteStorageImageByUrl — alias por compatibilidad con productos. */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  return deleteStorageImageByUrl(imageUrl);
}

/**
 * Elimina todas las imágenes de un producto del Storage
 */
export async function deleteProductFolder(productName: string): Promise<boolean> {
  return deleteStorageFolder('products', productName);
}

/**
 * Elimina todas las imágenes de una marca del Storage
 */
export async function deleteBrandFolder(brandName: string): Promise<boolean> {
  return deleteStorageFolder('brands', brandName);
}

/**
 * Elimina assets de marca: primero por carpeta del nombre actual;
 * si no hay archivos (ej. marca renombrada), intenta por URL guardada.
 */
export async function deleteBrandStorageAssets(params: {
  brandName: string;
  imageUrl?: string;
}): Promise<void> {
  const deletedFromFolder = await deleteBrandFolder(params.brandName);

  if (!deletedFromFolder && params.imageUrl) {
    await deleteStorageImageByUrl(params.imageUrl);
  }
}

export async function deleteCategoryFolder(categoryName: string): Promise<boolean> {
  return deleteStorageFolder('categories', categoryName);
}

export async function deleteCategoryStorageAssets(params: {
  categoryName: string;
  imageUrl?: string;
}): Promise<void> {
  const deletedFromFolder = await deleteCategoryFolder(params.categoryName);

  if (!deletedFromFolder && params.imageUrl) {
    await deleteStorageImageByUrl(params.imageUrl);
  }
}


