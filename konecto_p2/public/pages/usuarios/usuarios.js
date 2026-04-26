/**
 * public/pages/usuarios/usuarios.js
 * Controlador para la gestión administrativa de usuarios
 */

import * as almacenaje from '../../shared/js/almacenaje.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Inicialización de la interfaz
    actualizarNavbarUI();
    pintarTabla();

    const userForm = document.getElementById('userForm');
    
    // ==========================================================================
    // GESTIÓN DEL ALTA DE USUARIO
    // ==========================================================================
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Captura de valores y limpieza de espacios (trim)
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('emailUser').value.trim();
        const password = document.getElementById('passUser').value;

        // 2. Validaciones explícitas de negocio
        if (!nombre || !email || !password) {
            alert("⚠️ Todos los campos son obligatorios.");
            return;
        }

        // Validación de formato de email mediante RegEx
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert("⚠️ Por favor, introduce un correo electrónico válido.");
            return;
        }

        // Validación de longitud mínima de seguridad
        if (password.length < 6) {
            alert("⚠️ La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        const nuevoUsuario = { nombre, email, password };

        try {
            // 3. Intento de persistencia en IndexedDB
            await almacenaje.guardarUsuario(nuevoUsuario);
            alert("✅ Usuario registrado correctamente.");
            
            userForm.reset(); // Limpiar formulario
            pintarTabla();    // Refrescar lista visual
        } catch (err) {
            // Captura el error si el email ya existe (llave duplicada en IndexedDB)
            alert("❌ Error: Este correo electrónico ya está registrado.");
            console.error(err);
        }
    });

    // ==========================================================================
    // GESTIÓN DEL LOGOUT
    // ==========================================================================
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
                almacenaje.cerrarSesion();
                window.location.reload(); // Recarga para actualizar UI
            }
        });
    }
});

/**
 * Recupera los usuarios de la DB y genera las filas de la tabla dinámicamente
 */
async function pintarTabla() {
    const tbody = document.getElementById('tablaUsuariosBody');
    if (!tbody) return;

    tbody.innerHTML = ''; // Limpiar contenido previo
    
    try {
        const lista = await almacenaje.obtenerUsuarios();

        if (lista.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4">No hay usuarios registrados.</td></tr>';
            return;
        }

        lista.forEach(u => {
            const tr = document.createElement('tr');
            
            // Usamos plantillas de cadena para construir la fila
            tr.innerHTML = `
                <td>${u.nombre}</td>
                <td>${u.email}</td>
                <td><span class="password-mask">••••••</span></td>
                <td>
                    <button class="btn-eliminar" data-email="${u.email}">BORRAR</button>
                </td>
            `;
            
            // Asignar evento al botón de eliminar de esta fila específica
            tr.querySelector('.btn-eliminar').addEventListener('click', async () => {
                const confirmacion = confirm(`¿Estás seguro de eliminar al usuario ${u.email}?`);
                if (confirmacion) {
                    await almacenaje.borrarUsuario(u.email);
                    pintarTabla(); // Refrescar tras borrar
                }
            });

            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar la tabla:", error);
    }
}

/**
 * Actualiza los elementos del Navbar basándose en el estado del LocalStorage
 */
function actualizarNavbarUI() {
    const user = almacenaje.obtenerUsuarioActivo();
    const display = document.getElementById('usuarioActivo');
    const logoutBtn = document.getElementById('logoutButton');

    if (user && display) {
        display.textContent = `Sesión: ${user}`;
        display.style.color = "var(--amarillo)";
        if (logoutBtn) logoutBtn.classList.remove('d-none');
    } else {
        if (display) display.textContent = "Invitado";
        if (logoutBtn) logoutBtn.classList.add('d-none');
    }
}