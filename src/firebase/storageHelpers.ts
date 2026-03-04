import { getDownloadURL, ref, uploadBytes, deleteObject, listAll } from 'firebase/storage';
import { firebaseStorage, firebaseAuth } from './firebase';

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
 * Elimina una imagen específica del Storage usando su URL
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  await ensureAuthenticated();

  try {
    // Extraer la ruta del Storage desde la URL
    const storagePath = extractStoragePathFromUrl(imageUrl);
    const storageRef = ref(firebaseStorage, storagePath);
    
    await deleteObject(storageRef);
  } catch (error: any) {
    if (error?.code === 'storage/object-not-found') {
      console.warn('La imagen ya no existe en Storage:', imageUrl);
      return; // No es un error crítico si la imagen ya no existe
    }
    
    // Si el error es sobre la extracción de la URL, loguearlo pero no lanzar error crítico
    if (error?.message?.includes('No se pudo extraer la ruta')) {
      console.warn('No se pudo eliminar la imagen del Storage (URL inválida):', imageUrl);
      return; // Continuar sin error crítico
    }
    
    console.error('Error eliminando imagen del Storage:', error);
    throw new Error(`Error al eliminar imagen: ${error?.message || 'Error desconocido'}`);
  }
}

/**
 * Elimina todas las imágenes de un producto del Storage
 */
export async function deleteProductFolder(productName: string): Promise<void> {
  await ensureAuthenticated();

  try {
    const safeProductName = sanitizeProductName(productName);
    const folderRef = ref(firebaseStorage, `products/${safeProductName}`);
    
    // Listar todos los archivos en la carpeta (y subcarpetas si las hay)
    const listResult = await listAll(folderRef);
    
    // Eliminar todos los archivos directamente en la carpeta
    const fileDeletePromises = listResult.items.map((itemRef) => 
      deleteObject(itemRef).catch((err: any) => {
        // Si un archivo no existe, no es crítico
        if (err?.code !== 'storage/object-not-found') {
          console.warn('Error eliminando archivo individual:', itemRef.fullPath, err);
        }
        return null;
      })
    );
    
    // Eliminar también archivos en subcarpetas si las hay
    const folderDeletePromises = listResult.prefixes.map((prefixRef) => {
      // Recursivamente eliminar archivos en subcarpetas
      return listAll(prefixRef).then((subList) => {
        return Promise.all(
          subList.items.map((itemRef) => 
            deleteObject(itemRef).catch((err: any) => {
              if (err?.code !== 'storage/object-not-found') {
                console.warn('Error eliminando archivo en subcarpeta:', itemRef.fullPath, err);
              }
              return null;
            })
          )
        );
      });
    });
    
    // Esperar a que se eliminen todos los archivos
    await Promise.all([...fileDeletePromises, ...folderDeletePromises]);
    
    console.log(`Carpeta del producto "${productName}" eliminada exitosamente del Storage`);
  } catch (error: any) {
    if (error?.code === 'storage/object-not-found' || error?.code === 'storage/not-found') {
      console.warn('La carpeta del producto ya no existe en Storage:', productName);
      return; // No es un error crítico si la carpeta ya no existe
    }
    
    console.error('Error eliminando carpeta del producto:', error);
    throw new Error(`Error al eliminar carpeta del producto: ${error?.message || 'Error desconocido'}`);
  }
}


