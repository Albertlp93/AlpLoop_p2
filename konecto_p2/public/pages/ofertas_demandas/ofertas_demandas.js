import * as almacenaje from '../../shared/js/almacenaje.js';

document.addEventListener('DOMContentLoaded', async () => {
    actualizarNavbar();
    await refrescarVista();
    
    // --- PRECARGA DE DATOS POR DEFECTO ---
    const inputFecha = document.getElementById('fecha');
    const inputEmail = document.getElementById('emailContacto');
    
    // 1. Establecer fecha actual (YYYY-MM-DD)
    const hoy = new Date().toISOString().split('T')[0];
    inputFecha.value = hoy;

    // 2. Establecer email si hay sesión activa
    const usuarioLogueado = almacenaje.obtenerUsuarioActivo();
    if (usuarioLogueado) {
        inputEmail.value = usuarioLogueado;
    }

    // Manejo del Formulario
    document.getElementById('formEmpleos').addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = {
            titulo: document.getElementById('titulo').value,
            email: document.getElementById('emailContacto').value,
            fecha: document.getElementById('fecha').value,
            tipo: document.getElementById('tipo').value,
            descripcion: document.getElementById('descripcion').value
        };
        
        await almacenaje.guardarVoluntariado(datos);
        document.getElementById('formEmpleos').reset();
        
        // Tras el reset, volvemos a poner los valores por defecto
        inputFecha.value = hoy;
        if (usuarioLogueado) inputEmail.value = usuarioLogueado;
        
        await refrescarVista();
    });
});

async function refrescarVista() {
    const datos = await almacenaje.obtenerVoluntariados();
    pintarTabla(datos);
    dibujarGrafico(datos);
}

function pintarTabla(datos) {
    const tbody = document.getElementById('tablaEmpleosBody');
    tbody.innerHTML = '';
    
    datos.forEach(item => {
        const tr = document.createElement('tr');
        const badgeClass = item.tipo === 'Oferta' ? 'badge-oferta' : 'badge-demanda';
        
        tr.innerHTML = `
            <td>${item.titulo}</td>
            <td>${item.email}</td>
            <td>${item.fecha}</td>
            <td><span class="badge-tipo ${badgeClass}">${item.tipo}</span></td>
            <td>
                <button class="btn-eliminar" data-id="${item.id}">BORRAR</button>
            </td>
        `;
        
        tr.querySelector('.btn-eliminar').addEventListener('click', async () => {
            await almacenaje.borrarVoluntariado(item.id);
            await refrescarVista();
        });
        
        tbody.appendChild(tr);
    });
}

function dibujarGrafico(datos) {
    const canvas = document.getElementById('graficoCanvas');
    const ctx = canvas.getContext('2d');
    const ofertas = datos.filter(d => d.tipo === 'Oferta').length;
    const demandas = datos.filter(d => d.tipo === 'Demanda').length;
    const total = ofertas + demandas || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configuración de barras
    const maxH = 140;
    const hOf = (ofertas / total) * maxH;
    const hDem = (demandas / total) * maxH;

    // Dibujar Ofertas (Naranja)
    ctx.fillStyle = '#e07040';
    ctx.fillRect(60, 170 - hOf, 50, hOf);
    ctx.fillStyle = '#212529';
    ctx.fillText(ofertas, 80, 165 - hOf);

    // Dibujar Demandas (Azul Marino)
    ctx.fillStyle = '#1a3a6b';
    ctx.fillRect(170, 170 - hDem, 50, hDem);
    ctx.fillStyle = '#212529';
    ctx.fillText(demandas, 190, 165 - hDem);

    // Eje base
    ctx.strokeStyle = '#1a3a6b';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, 170); ctx.lineTo(250, 170); ctx.stroke();
}

function actualizarNavbar() {
    const user = almacenaje.obtenerUsuarioActivo();
    const display = document.getElementById('usuarioActivo');
    const logoutBtn = document.getElementById('logoutButton');
    if (user) {
        display.textContent = user;
        logoutBtn.classList.remove('d-none');
    }
}