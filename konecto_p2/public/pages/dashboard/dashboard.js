import * as almacenaje from '../../shared/js/almacenaje.js';

document.addEventListener('DOMContentLoaded', async () => {
    actualizarInterfaz();
    await cargarCards();

    const origen = document.getElementById('contenedorOrigen');
    const destino = document.getElementById('contenedorDestino');

    // Configuración Drag & Drop
    [origen, destino].forEach(zona => {
        zona.addEventListener('dragover', e => {
            e.preventDefault();
            zona.classList.add('dragover');
        });
        zona.addEventListener('dragleave', () => zona.classList.remove('dragover'));
        zona.addEventListener('drop', e => {
            e.preventDefault();
            zona.classList.remove('dragover');
            const id = e.dataTransfer.getData('text/plain');
            const card = document.getElementById(id);
            if (card) zona.appendChild(card);
        });
    });

    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            almacenaje.cerrarSesion();
            window.location.reload(); // Recarga para volver al estado "invitado"
        });
    }
});

async function cargarCards() {
    const contenedor = document.getElementById('contenedorOrigen');
    const datos = await almacenaje.obtenerVoluntariados();
    contenedor.innerHTML = '';

    if (datos.length === 0) {
        contenedor.innerHTML = '<p class="text-center opacity-75 mt-4">No hay publicaciones disponibles.</p>';
        return;
    }

    datos.forEach(item => {
        const card = document.createElement('div');
        const esOferta = item.tipo === 'Oferta';
        const claseTipo = esOferta ? 'tarjeta-oferta' : 'tarjeta-demanda';
        
        card.className = `card ${claseTipo} p-3`;
        card.id = `vol-${item.id}`;
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
                    <span class="badge-dashboard">📧 ${item.email}</span>
                </div>
            </div>
        `;

        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', card.id);
            card.style.opacity = "0.5";
        });
        card.addEventListener('dragend', () => card.style.opacity = "1");

        contenedor.appendChild(card);
    });
}

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
        logoutBtn.classList.remove('d-none');
    } else {
        // En lugar de redirigir, mostramos estados por defecto para poder testear
        displayNav.textContent = "- no login -";
        displayHero.textContent = "Invitado (sin sesión)";
        displayAvatar.textContent = "?";
        logoutBtn.classList.add('d-none');
    }
}