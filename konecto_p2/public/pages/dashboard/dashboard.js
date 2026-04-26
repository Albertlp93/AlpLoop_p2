/**
 * public/pages/dashboard/dashboard.js
 * Controlador con persistencia de estado y ordenación garantizada.
 */

import * as almacenaje from '../../shared/js/almacenaje.js';

document.addEventListener('DOMContentLoaded', async () => {
    actualizarInterfaz();
    await refrescarDashboard();

    const origen = document.getElementById('contenedorOrigen');
    const destino = document.getElementById('contenedorDestino');

    // Configuración de Zonas de Drop (Ida y Vuelta)
    [origen, destino].forEach(zona => {
        zona.addEventListener('dragover', e => {
            e.preventDefault(); // Permite el drop
            zona.classList.add('dragover');
        });

        zona.addEventListener('dragleave', () => zona.classList.remove('dragover'));

        zona.addEventListener('drop', e => {
            e.preventDefault();
            zona.classList.remove('dragover');
            
            const cardId = e.dataTransfer.getData('text/plain');
            
            // 🚩 LÓGICA DE ESTADO: En lugar de mover el HTML, actualizamos la base de datos visual
            gestionarCambioDeColumna(cardId, zona.id);
        });
    });

    // Evento Logout
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            almacenaje.cerrarSesion();
            localStorage.removeItem('mis_seleccionados');
            window.location.reload();
        });
    }
});

/**
 * Gestiona en qué lista debe estar el ID y vuelve a pintar para mantener el orden.
 */
function gestionarCambioDeColumna(cardId, idContenedorDestino) {
    let seleccionados = JSON.parse(localStorage.getItem('mis_seleccionados')) || [];

    if (idContenedorDestino === 'contenedorDestino') {
        // Mover a la derecha
        if (!seleccionados.includes(cardId)) {
            seleccionados.push(cardId);
        }
    } else {
        // Mover a la izquierda (quitar de seleccionados)
        seleccionados = seleccionados.filter(id => id !== cardId);
    }

    // Guardar nuevo estado y refrescar la vista completa
    localStorage.setItem('mis_seleccionados', JSON.stringify(seleccionados));
    refrescarDashboard();
}

/**
 * Pinta el Dashboard consultando la DB y respetando el orden original de los IDs.
 */
async function refrescarDashboard() {
    const origen = document.getElementById('contenedorOrigen');
    const destino = document.getElementById('contenedorDestino');
    const seleccionadosGuardados = JSON.parse(localStorage.getItem('mis_seleccionados')) || [];

    // 1. Obtener datos de la base de datos
    const datos = await almacenaje.obtenerVoluntariados();

    // 2. 🚩 LA CLAVE: Ordenar los datos por ID antes de pintar
    // Esto garantiza que siempre recuperen su posición original (1, 2, 3...)
    datos.sort((a, b) => a.id - b.id);

    // 3. Limpiar columnas
    origen.innerHTML = '';
    destino.innerHTML = '';

    if (datos.length === 0) {
        origen.innerHTML = '<p class="text-center opacity-75 mt-4">No hay publicaciones.</p>';
        return;
    }

    // 4. Repartir las tarjetas según el estado guardado
    datos.forEach(item => {
        const cardId = `vol-${item.id}`;
        const card = crearElementoCard(item, cardId);

        if (seleccionadosGuardados.includes(cardId)) {
            destino.appendChild(card);
        } else {
            origen.appendChild(card);
        }
    });
}

/**
 * Crea el componente visual de la tarjeta.
 */
function crearElementoCard(item, cardId) {
    const card = document.createElement('div');
    const esOferta = item.tipo === 'Oferta';
    
    card.className = `card ${esOferta ? 'tarjeta-oferta' : 'tarjeta-demanda'} p-3`;
    card.id = cardId;
    card.draggable = true;

    const htmlSueldo = esOferta ? `<span class="badge-dashboard">💰 ${item.sueldo}€/año</span>` : '';

    card.innerHTML = `
        <div class="card-body p-0">
            <div class="card-title-dashboard">${item.titulo.toUpperCase()}</div>
            <p class="card-description">${item.descripcion}</p>
            <div class="badge-container">
                <span class="badge-dashboard">${item.tipo}</span>
                <span class="badge-dashboard">⏱️ ${item.jornada}</span>
                ${htmlSueldo}
            </div>
        </div>
    `;

    // Eventos Drag & Drop de la tarjeta
    card.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.id);
        card.style.opacity = "0.5";
    });

    card.addEventListener('dragend', () => {
        card.style.opacity = "1";
    });

    return card;
}

/**
 * Actualiza la información del usuario logueado.
 */
function actualizarInterfaz() {
    const user = almacenaje.obtenerUsuarioActivo();
    const displayNav = document.getElementById('usuarioActivo');
    const displayHero = document.getElementById('nombreUsuarioHero');
    const displayAvatar = document.getElementById('avatarUsuario');
    const logoutBtn = document.getElementById('logoutButton');

    if (user) {
        displayNav.textContent = user;
        displayHero.textContent = user;
        displayAvatar.textContent = user.charAt(0).toUpperCase();
        if (logoutBtn) logoutBtn.classList.remove('d-none');
    } else {
        displayNav.textContent = "- no login -";
        displayHero.textContent = "Invitado (Sin sesión)";
        displayAvatar.textContent = "?";
        if (logoutBtn) logoutBtn.classList.add('d-none');
    }
}