// public/pages/login/login.js
import * as almacenaje from '../../shared/js/almacenaje.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mostrar estado inicial
    actualizarInterfaz();

    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutButton');

    // 2. Evento de Inicio de Sesión
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const pass = document.getElementById('password').value;

        if (!email || !pass) {
            alert("Por favor, rellena todos los campos.");
            return;
        }

        try {
            // Llamada asíncrona al módulo de base de datos
            const usuario = await almacenaje.loguearUsuario(email, pass);
            
            // ÉXITO: Guardamos la sesión
            localStorage.setItem('usuarioActivo', usuario.email);
            
            // 🚩 REDIRECCIÓN: Enviamos al usuario al Dashboard
            // Usamos un pequeño delay opcional o el alert para que el usuario sepa que entró
            alert(`¡Bienvenido de nuevo, ${usuario.nombre || usuario.email}!`);
            window.location.href = '../dashboard/index.html'; 

        } catch (error) {
            // Error de autenticación (usuario no existe o contraseña mal)
            alert("⚠️ " + error.message);
        }
    });

    // 3. Evento de Cerrar Sesión
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Evitamos que el enlace # recargue la página antes de tiempo
        almacenaje.cerrarSesion();
        alert("Has cerrado sesión correctamente.");
        window.location.reload();
    });
});

/**
 * Actualiza los elementos de la Navbar según el estado de la sesión
 */
function actualizarInterfaz() {
    const display = document.getElementById('usuarioActivo');
    const logoutBtn = document.getElementById('logoutButton');
    const user = almacenaje.obtenerUsuarioActivo();

    if (user) {
        display.textContent = user;
        display.style.color = "var(--amarillo)"; // Estética acorde a tu CSS
        logoutBtn.classList.remove('d-none');
    } else {
        display.textContent = "no conectado";
        display.style.color = "inherit";
        logoutBtn.classList.add('d-none');
    }
}