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

    // Función para establecer la fecha mínima/actual
    const establecerFechaHoy = () => {
        const hoy = new Date().toISOString().split('T')[0];
        inputFecha.value = hoy;
    };

    // Lógica dinámica del formulario
    selectTipo.addEventListener('change', () => {
        camposDinamicos.classList.remove('d-none');
        establecerFechaHoy();

        if (selectTipo.value === 'Oferta') {
            labelTitulo.textContent = "Título de la oferta";
            grupoSueldo.classList.remove('d-none');
        } else {
            labelTitulo.textContent = "Título de la demanda";
            grupoSueldo.classList.add('d-none');
            inputSueldo.value = ""; 
        }
    });

    // Gestión del envío con VALIDACIONES EXPLÍCITAS
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 1. Captura y limpieza de datos
        const titulo = document.getElementById('titulo').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const sueldoVal = inputSueldo.value;
        const usuarioLogueado = almacenaje.obtenerUsuarioActivo();

        // 2. Validaciones de negocio
        if (titulo.length < 5) {
            alert("⚠️ El título es demasiado corto (mínimo 5 caracteres).");
            return;
        }

        if (descripcion.length < 10) {
            alert("⚠️ Por favor, añade una descripción más detallada.");
            return;
        }

        if (selectTipo.value === 'Oferta' && (!sueldoVal || sueldoVal <= 0)) {
            alert("⚠️ Debes indicar un sueldo anual válido para las ofertas.");
            return;
        }

        if (!usuarioLogueado) {
            alert("⚠️ Debes estar logueado para publicar. Redirigiendo...");
            window.location.href = "../login/index.html";
            return;
        }

        const datos = {
            titulo: titulo,
            tipo: selectTipo.value,
            jornada: document.getElementById('jornada').value,
            sueldo: selectTipo.value === 'Oferta' ? sueldoVal : 'N/A',
            descripcion: descripcion,
            email: usuarioLogueado,
            fecha: inputFecha.value
        };
        
        try {
            await almacenaje.guardarVoluntariado(datos);
            form.reset();
            camposDinamicos.classList.add('d-none');
            await refrescarVista();
            alert("✅ Publicación guardada con éxito.");
        } catch (error) {
            alert("❌ Error al guardar en la base de datos.");
        }
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
    
    // Ordenar por fecha (más reciente primero)
    datos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (datos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center p-4">No hay publicaciones disponibles.</td></tr>';
        return;
    }

    datos.forEach(item => {
        const tr = document.createElement('tr');
        const badgeClass = item.tipo === 'Oferta' ? 'badge-oferta' : 'badge-demanda';
        const infoSueldo = item.sueldo !== 'N/A' ? ` | 💰 ${item.sueldo}€` : '';
        const fechaFormateada = item.fecha.split('-').reverse().join('/');

        tr.innerHTML = `
            <td class="celda-detalles">
                <span class="titulo-actividad">${item.titulo}</span>
                <span class="subtitulo-actividad">⏱️ ${item.jornada}${infoSueldo}</span>
            </td>
            <td><small>${item.email}</small></td>
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

/**
 * MOTOR GRÁFICO MEJORADO (Caz
 */
function dibujarGrafico(datos) {
    const canvas = document.getElementById('graficoCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const ofertas = datos.filter(d => d.tipo === 'Oferta').length;
    const demandas = datos.filter(d => d.tipo === 'Demanda').length;
    const total = ofertas + demandas;

    // Limpieza y configuración de dimensiones
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 40;
    const chartW = canvas.width - (padding * 2);
    const chartH = canvas.height - (padding * 2);
    const baseY = canvas.height - padding;

    // 1. Fondo suave para el área del gráfico
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (total === 0) {
        ctx.fillStyle = "#999";
        ctx.textAlign = "center";
        ctx.font = "italic 14px Nunito";
        ctx.fillText("Esperando datos para estadísticas...", canvas.width / 2, canvas.height / 2);
        return;
    }

    // 2. Cálculo de porcentajes
    const porcOf = ((ofertas / total) * 100).toFixed(0);
    const porcDem = ((demandas / total) * 100).toFixed(0);
    const hOf = (ofertas / total) * chartH;
    const hDem = (demandas / total) * chartH;

    // Colores corporativos
    const colorOf = "#FF9F1C"; // Naranja
    const colorDem = "#011627"; // Azul Marino

    // 3. Dibujo de Ejes (Línea L)
    ctx.strokeStyle = "#cbd5e0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding / 2);
    ctx.lineTo(padding, baseY);
    ctx.lineTo(canvas.width - padding / 2, baseY);
    ctx.stroke();

    // 4. Función auxiliar para dibujar barras con bordes redondeados
    const drawBar = (x, height, color, label, percentage) => {
        const barWidth = 50;
        
        // Sombra suave
        ctx.shadowColor = "rgba(0,0,0,0.1)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;

        // Barra
        ctx.fillStyle = color;
        ctx.fillRect(x, baseY - height, barWidth, height);
        
        // Reset de sombra para el texto
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Etiqueta de cantidad (encima de la barra)
        ctx.fillStyle = "#333";
        ctx.font = "bold 14px Nunito";
        ctx.textAlign = "center";
        ctx.fillText(label, x + barWidth / 2, baseY - height - 10);

        // Etiqueta de porcentaje (dentro de la barra si hay espacio)
        if (height > 20) {
            ctx.fillStyle = "#fff";
            ctx.font = "900 10px Nunito";
            ctx.fillText(`${percentage}%`, x + barWidth / 2, baseY - height + 15);
        }
    };

    // 5. Renderizar barras
    drawBar(padding + 30, hOf, colorOf, ofertas, porcOf);
    drawBar(padding + 110, hDem, colorDem, demandas, porcDem);

    // 6. Etiquetas de Eje X
    ctx.fillStyle = "#666";
    ctx.font = "700 10px Nunito";
    ctx.fillText("OFERTAS", padding + 55, baseY + 20);
    ctx.fillText("DEMANDAS", padding + 135, baseY + 20);
}

function actualizarNavbar() {
    const user = almacenaje.obtenerUsuarioActivo();
    const display = document.getElementById('usuarioActivo');
    const logoutBtn = document.getElementById('logoutButton');
    
    if (user && display) {
        display.textContent = user;
        if (logoutBtn) logoutBtn.classList.remove('d-none');
    }

    if (logoutBtn) {
        logoutBtn.onclick = (e) => {
            e.preventDefault();
            almacenaje.cerrarSesion();
            window.location.href = "../login/index.html";
        };
    }
}