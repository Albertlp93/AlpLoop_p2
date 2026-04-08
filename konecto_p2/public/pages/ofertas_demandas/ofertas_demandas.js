import * as almacenaje from '../../shared/js/almacenaje.js';

document.addEventListener('DOMContentLoaded', async () => {
    actualizarNavbar();
    await refrescarVista();
    
    const form = document.getElementById('formEmpleos');
    const selectTipo = document.getElementById('tipo');
    const camposDinamicos = document.getElementById('camposDinamicos');
    const grupoSueldo = document.getElementById('grupoSueldo');
    const labelTitulo = document.getElementById('labelTitulo');
    const inputSueldo = document.getElementById('sueldo');
    const inputFecha = document.getElementById('fechaPublicacion');

    const establecerFechaHoy = () => {
        const hoy = new Date().toISOString().split('T')[0];
        inputFecha.value = hoy;
    };

    selectTipo.addEventListener('change', () => {
        camposDinamicos.classList.remove('d-none');
        establecerFechaHoy();

        if (selectTipo.value === 'Oferta') {
            labelTitulo.textContent = "Título de la oferta";
            grupoSueldo.classList.remove('d-none');
            inputSueldo.setAttribute('required', 'true');
        } else {
            labelTitulo.textContent = "Título de la demanda";
            grupoSueldo.classList.add('d-none');
            inputSueldo.removeAttribute('required');
            inputSueldo.value = ""; 
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usuarioLogueado = almacenaje.obtenerUsuarioActivo();
        
        const datos = {
            titulo: document.getElementById('titulo').value,
            tipo: selectTipo.value,
            jornada: document.getElementById('jornada').value,
            sueldo: selectTipo.value === 'Oferta' ? document.getElementById('sueldo').value : 'N/A',
            descripcion: document.getElementById('descripcion').value,
            email: usuarioLogueado || 'Anónimo',
            fecha: inputFecha.value
        };
        
        await almacenaje.guardarVoluntariado(datos);
        form.reset();
        camposDinamicos.classList.add('d-none');
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
    
    datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    datos.forEach(item => {
        const tr = document.createElement('tr');
        const badgeClass = item.tipo === 'Oferta' ? 'badge-oferta' : 'badge-demanda';
        const infoSueldo = item.sueldo !== 'N/A' ? ` | 💰 ${item.sueldo}€` : '';
        const fechaFormateada = item.fecha.split('-').reverse().join('/');

        tr.innerHTML = `
            <td class="celda-detalles">
                <span class="titulo-actividad">${item.titulo}</span>
                <span class="subtitulo-actividad">
                    ⏱️ ${item.jornada}${infoSueldo}
                </span>
            </td>
            <td>${item.email}</td>
            <td>${fechaFormateada}</td>
            <td><span class="badge-tipo ${badgeClass}">${item.tipo}</span></td>
            <td>
                <button class="btn-eliminar" data-id="${item.id}">BORRAR</button>
            </td>
        `;
        
        tr.querySelector('.btn-eliminar').addEventListener('click', async () => {
            if(confirm("¿Seguro que quieres eliminar esta publicación?")) {
                await almacenaje.borrarVoluntariado(item.id);
                await refrescarVista();
            }
        });
        
        tbody.appendChild(tr);
    });
}

function dibujarGrafico(datos) {
    const canvas = document.getElementById('graficoCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const ofertas = datos.filter(d => d.tipo === 'Oferta').length;
    const demandas = datos.filter(d => d.tipo === 'Demanda').length;
    const total = ofertas + demandas || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const maxH = 120;
    const hOf = (ofertas / total) * maxH;
    const hDem = (demandas / total) * maxH;

    // Colores obtenidos de las variables CSS (vía JS para el Canvas)
    const colorOferta = getComputedStyle(document.documentElement).getPropertyValue('--naranja').trim();
    const colorDemanda = getComputedStyle(document.documentElement).getPropertyValue('--azul-marino').trim();

    ctx.fillStyle = colorOferta; 
    ctx.fillRect(60, 150 - hOf, 50, hOf);
    
    ctx.fillStyle = colorDemanda; 
    ctx.fillRect(170, 150 - hDem, 50, hDem);

    ctx.fillStyle = "#212529";
    ctx.font = "bold 14px Nunito";
    ctx.textAlign = "center";
    ctx.fillText(ofertas, 85, 145 - hOf);
    ctx.fillText(demandas, 195, 145 - hDem);

    ctx.strokeStyle = colorDemanda;
    ctx.beginPath(); ctx.moveTo(30, 150); ctx.lineTo(250, 150); ctx.stroke();
}

function actualizarNavbar() {
    const user = almacenaje.obtenerUsuarioActivo();
    const display = document.getElementById('usuarioActivo');
    const logoutBtn = document.getElementById('logoutButton');
    
    if (user) {
        display.textContent = user;
        logoutBtn.classList.remove('d-none');
    }

    logoutBtn.onclick = (e) => {
        e.preventDefault();
        almacenaje.cerrarSesion();
        window.location.href = "../login/index.html";
    };
}