/**
 * public/shared/js/almacenaje.js
 * Módulo CRUD Centralizado para la gestión de persistencia (LocalStorage e IndexedDB)
 */

const DB_NAME = 'VoluntariAppDB';
const DB_VERSION = 1;
let db;

// ==========================================================================
// 1. CONFIGURACIÓN E INICIALIZACIÓN DE INDEXEDDB
// ==========================================================================

/**
 * Abre la conexión con la base de datos y crea los almacenes de objetos.
 * Se exporta para que las páginas puedan asegurar la conexión al cargar.
 */
export const conectarDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        // Se ejecuta si la base de datos no existe o se actualiza la versión
        request.onupgradeneeded = (e) => {
            const dbInstance = e.target.result;
            
            // Almacén de Usuarios (Clave primaria: email)
            if (!dbInstance.objectStoreNames.contains('usuarios')) {
                dbInstance.createObjectStore('usuarios', { keyPath: 'email' });
                console.log("Almacén 'usuarios' creado.");
            }
            
            // Almacén de Voluntariados (Clave primaria: id autoincremental)
            if (!dbInstance.objectStoreNames.contains('voluntariados')) {
                dbInstance.createObjectStore('voluntariados', { keyPath: 'id', autoIncrement: true });
                console.log("Almacén 'voluntariados' creado.");
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            resolve(db);
        };

        request.onerror = (e) => {
            reject("Error al abrir IndexedDB: " + e.target.error);
        };
    });
};

/**
 * Función interna para asegurar que la DB esté lista antes de cualquier operación
 */
const asegurarDB = async () => {
    if (!db) await conectarDB();
};

// ==========================================================================
// 2. GESTIÓN DE SESIÓN (WEB STORAGE API - LOCALSTORAGE)
// ==========================================================================

export const obtenerUsuarioActivo = () => localStorage.getItem('usuarioActivo');

export const cerrarSesion = () => localStorage.removeItem('usuarioActivo');

// ==========================================================================
// 3. CRUD DE USUARIOS (INDEXEDDB)
// ==========================================================================

/**
 * Registra un nuevo usuario en la base de datos
 */
export const guardarUsuario = async (usuario) => {
    await asegurarDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios'], 'readwrite');
        const store = transaction.objectStore('usuarios');
        const request = store.add(usuario); // .add falla si el email ya existe

        request.onsuccess = () => resolve("Usuario guardado correctamente");
        request.onerror = () => reject("El usuario ya existe o hubo un error.");
    });
};

/**
 * Obtiene la lista completa de usuarios
 */
export const obtenerUsuarios = async () => {
    await asegurarDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios'], 'readonly');
        const store = transaction.objectStore('usuarios');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Error al obtener usuarios.");
    });
};

/**
 * Elimina un usuario por su email
 */
export const borrarUsuario = async (email) => {
    await asegurarDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios'], 'readwrite');
        const store = transaction.objectStore('usuarios');
        const request = store.delete(email);

        request.onsuccess = () => resolve("Usuario eliminado.");
        request.onerror = () => reject("Error al borrar usuario.");
    });
};

// ==========================================================================
// 4. AUTENTICACIÓN (LOGIN)
// ==========================================================================

/**
 * Valida las credenciales buscando en IndexedDB
 */
export const loguearUsuario = async (email, password) => {
    await asegurarDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios'], 'readonly');
        const store = transaction.objectStore('usuarios');
        const request = store.get(email);

        request.onsuccess = () => {
            const usuario = request.result;
            if (usuario && usuario.password === password) {
                resolve(usuario);
            } else {
                reject(new Error("Email o contraseña incorrectos."));
            }
        };
        request.onerror = () => reject(new Error("Error en la autenticación."));
    });
};

// ==========================================================================
// 5. CRUD DE VOLUNTARIADOS (PARA PÁGINA OFERTAS Y DEMANDAS)
// ==========================================================================

export const guardarVoluntariado = async (datos) => {
    await asegurarDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['voluntariados'], 'readwrite');
        const store = transaction.objectStore('voluntariados');
        const request = store.add(datos);

        request.onsuccess = () => resolve("Voluntariado registrado.");
        request.onerror = () => reject("Error al guardar voluntariado.");
    });
};

export const obtenerVoluntariados = async () => {
    await asegurarDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['voluntariados'], 'readonly');
        const store = transaction.objectStore('voluntariados');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Error al obtener datos.");
    });
};

export const borrarVoluntariado = async (id) => {
    await asegurarDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['voluntariados'], 'readwrite');
        const store = transaction.objectStore('voluntariados');
        const request = store.delete(id);

        request.onsuccess = () => resolve("Registro eliminado.");
        request.onerror = () => reject("Error al borrar.");
    });
};