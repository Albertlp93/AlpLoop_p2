// public/pages/login/login.js
import * as almacenaje from '../../shared/js/almacenaje.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mostrar estado inicial (si ya estaba logueado)
    actualizarInterfaz();

    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutButton');

    // 2. Evento de Inicio de Sesión
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;

        try {
            // Llamada asíncrona al módulo shared
            const usuario = await almacenaje.loguearUsuario(email, pass);
            
            // Éxito: Guardar en LocalStorage y avisar
            localStorage.setItem('usuarioActivo', usuario.email);
            alert(`¡Hola de nuevo, ${usuario.email}!`);
            
            actualizarInterfaz();
            loginForm.reset();
        } catch (error) {
            // Manejo de errores de la Promesa
            alert("Error: " + error.message);
        }
    });

    // 3. Evento de Cerrar Sesión
    logoutBtn.addEventListener('click', () => {
        almacenaje.cerrarSesion();
        alert("Has cerrado sesión correctamente.");
        actualizarInterfaz();
        // Opcional: Redirigir o recargar para limpiar el estado
        window.location.reload();
    });
});

/**
 * Función que actualiza los elementos de la Navbar según el estado de la sesión
 */
function actualizarInterfaz() {
    const display = document.getElementById('usuarioActivo');
    const logoutBtn = document.getElementById('logoutButton');
    const user = almacenaje.obtenerUsuarioActivo();

    if (user) {
        display.textContent = user;
        display.classList.replace('bg-secondary', 'bg-success');
        logoutBtn.classList.remove('d-none'); // Mostrar botón de cerrar sesión
    } else {
        display.textContent = "-no login-";
        display.classList.replace('bg-success', 'bg-secondary');
        logoutBtn.classList.add('d-none');    // Ocultar botón de cerrar sesión
    }
}