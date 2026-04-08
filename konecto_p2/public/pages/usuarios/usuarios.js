import * as almacenaje from '../../shared/js/almacenaje.js';

document.addEventListener('DOMContentLoaded', async () => {
    actualizarNavbarUI();
    pintarTabla();

    const userForm = document.getElementById('userForm');
    
    // Gestión del Alta
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nuevo = {
            nombre: document.getElementById('nombre').value,
            email: document.getElementById('emailUser').value,
            password: document.getElementById('passUser').value
        };

        try {
            await almacenaje.guardarUsuario(nuevo);
            alert("Usuario registrado");
            userForm.reset();
            pintarTabla();
        } catch (err) {
            alert(err);
        }
    });

    // Gestión del Logout
    document.getElementById('logoutButton').addEventListener('click', () => {
        almacenaje.cerrarSesion();
        window.location.reload();
    });
});

async function pintarTabla() {
    const tbody = document.getElementById('tablaUsuariosBody');
    tbody.innerHTML = '';
    const lista = await almacenaje.obtenerUsuarios();

    lista.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td>••••••</td>
            <td>
                <button class="btn-eliminar" data-email="${u.email}">BORRAR</button>
            </td>
        `;
        
        tr.querySelector('.btn-eliminar').addEventListener('click', async () => {
            if(confirm(`¿Borrar a ${u.email}?`)) {
                await almacenaje.borrarUsuario(u.email);
                pintarTabla();
            }
        });
        tbody.appendChild(tr);
    });
}

function actualizarNavbarUI() {
    const user = almacenaje.obtenerUsuarioActivo();
    const display = document.getElementById('usuarioActivo');
    const logoutBtn = document.getElementById('logoutButton');

    if (user) {
        display.textContent = user;
        display.style.color = "var(--amarillo)";
        logoutBtn.classList.remove('d-none');
    }
}