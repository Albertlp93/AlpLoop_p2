import * as almacenaje from '../../shared/js/almacenaje.js';

document.addEventListener('DOMContentLoaded', async () => {
    actualizarInterfaz();
    await cargarCards();

    const origen = document.getElementById('contenedorOrigen');
    const destino = document.getElementById('contenedorDestino');

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

    document.getElementById('logoutButton').addEventListener('click', () => {
        almacenaje.cerrarSesion();
        window.location.reload();
    });
});

async function cargarCards() {
    const contenedor = document.getElementById('contenedorOrigen');
    const datos = await almacenaje.obtenerVoluntariados();
    contenedor.innerHTML = '';

    datos.forEach(item => {
        const card = document.createElement('div');
        const claseTipo = item.tipo === 'Oferta' ? 'tarjeta-oferta' : 'tarjeta-demanda';
        
        card.className = `card ${claseTipo} card-draggable p-3`;
        card.id = `vol-${item.id}`;
        card.draggable = true;

        card.innerHTML = `
            <div class="card-body p-0">
                <h5 class="card-title">${item.titulo.toUpperCase()}</h5>
                <div class="mt-2">
                    <span class="badge-tarjeta">${item.tipo}</span>
                    <span class="badge-tarjeta">${item.email}</span>
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
    if (user) {
        document.getElementById('usuarioActivo').textContent = user;
        document.getElementById('nombreUsuarioHero').textContent = user;
        document.getElementById('avatarUsuario').textContent = user.charAt(0).toUpperCase();
        document.getElementById('logoutButton').classList.remove('d-none');
    }
}