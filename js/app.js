const formularioContactos = document.querySelector('#contacto');
const listadoContactos = document.querySelector('#listado-contactos tbody');
const inputBuscador = document.querySelector('#buscar');

eventListeners();
function eventListeners() {
    //Cuando el formulario de crear o editar se ejecuta
    formularioContactos.addEventListener('submit', leerFormulario);

    //Listener para eliminar el contacto
    if (listadoContactos) {
        listadoContactos.addEventListener('click', eliminarContacto);
    }

    //Buscador
    inputBuscador.addEventListener('input', buscarContactos);

    numeroContactos();
}

function leerFormulario(e) {
    e.preventDefault();

    //Leer los datos de los inputs
    const nombre = document.querySelector('#nombre').value;
    const empresa = document.querySelector('#empresa').value;
    const telefono = document.querySelector('#telefono').value;
    const accion = document.querySelector('#accion').value;

    if(nombre === '' || empresa === '' || telefono === ''){
        mostrarNotificacion('Todos los campos son obligatorios', 'error');
    } else{
        //Pasa la validación, crear llamado a Ajax
        const infoContacto = new FormData;
        infoContacto.append('nombre', nombre);
        infoContacto.append('empresa', empresa);
        infoContacto.append('telefono', telefono);
        infoContacto.append('accion', accion);

        if (accion === 'crear') {
            //Creamos un nuevo contacto
            insertarBD(infoContacto);
        }else{
            //editar el contacto
            //leer el id
            const idRegistro = document.querySelector('#id').value;
            infoContacto.append('id', idRegistro);
            actualizarRegistro(infoContacto);
        }
    }
}

// Inserta en la BD vía Ajax
function insertarBD(datos) {
    //Llamado a Ajax
    //crear el objeto
    const xhr = new XMLHttpRequest();

    //abrir la conexión
    xhr.open('POST', 'inc/models/modelo-contactos.php', true);

    //pasar los datos
    xhr.onload = function () {
        if (this.status === 200) {
            // console.log(JSON.parse(xhr.responseText));
            const respuesta = JSON.parse(xhr.responseText);
            const {id, empresa, nombre, telefono} = respuesta.datos;

            //Inserta un nuevo elemento a la tabla
            const nuevoContacto = document.createElement('TR');
            nuevoContacto.innerHTML = `
                <td>${nombre}</td>
                <td>${empresa}</td>
                <td>${telefono}</td>
            `;

            //Crear contenedor para los botones
            const contenedorAcciones = document.createElement('TD');

            //crear el icono de Editar
            const iconoEditar = document.createElement('I');
            iconoEditar.className = 'fas fa-pen-square';

            //crea el enlace para editar
            const btnEditar = document.createElement('A');
            btnEditar.appendChild(iconoEditar);
            btnEditar.className = 'btn-editar btn';
            btnEditar.href = `editar.php?id=${id}`;

            //Agregando al padre
            contenedorAcciones.appendChild(btnEditar);

            //Crear el icono de eliminar
            const iconoEliminar = document.createElement('I');
            iconoEliminar.className = 'fas fa-trash-alt';

            //Crear el boton para eliminar
            const btnEliminar = document.createElement('button');
            btnEliminar.appendChild(iconoEliminar);
            btnEliminar.setAttribute('data-id', id);
            btnEliminar.className = "btn-borrar btn";

            //Agregando al padre
            contenedorAcciones.appendChild(btnEliminar);
            
            //Agregando al tr
            nuevoContacto.appendChild(contenedorAcciones);

            //Agregarlo con los contactos
            listadoContactos.appendChild(nuevoContacto);

            //Resetear el formulario
            formularioContactos.reset();
            //Mostrar la notificación
            mostrarNotificacion('Contacto creado correctamente', 'correcto');
            // Actualizar el número
            numeroContactos();
        }
    }

    //Enviar los datos
    xhr.send(datos);
}

function actualizarRegistro(datos) {
    //Crear el objeto
    const xhr = new XMLHttpRequest();

    //abrir la conexión
    xhr.open('POST', 'inc/models/modelo-contactos.php', true);

    //leer la respuesta
    xhr.onload = function () {
        if (this.status === 200) {
            const resultado = JSON.parse(xhr.responseText);
            if (resultado.respuesta === 'correcto') {
                //Mostrar notificación
                mostrarNotificacion('Actualizado correctamente', 'correcto');
            } else{
                mostrarNotificacion('Se produjo un error', 'error');
            }

            //Después de 3 segundos redireccionar
            setTimeout(() => {
                window.location.href = 'index.php';
            }, 1500);
        }
    }

    //enviar la petición
    xhr.send(datos);
}

function eliminarContacto(e) {
    if (e.target.parentElement.classList.contains('btn-borrar')) {
        //tomar el ID
        const id = e.target.parentElement.getAttribute('data-id');

        //preguntar al usuario
        const respuesta = confirm ('¿Estás seguro');

        if (respuesta) {
            //Llamado a Ajax
            //Crear el objeto
            const xhr = new XMLHttpRequest();

            //Abrir la conexión
            xhr.open('GET', `inc/models/modelo-contactos.php?id=${id}&accion=borrar`, true);

            //Leer la respuesta
            xhr.onload = function () {
                if (this.status === 200) {
                    const resultado = JSON.parse(xhr.responseText);
                    if (resultado.respuesta === 'correcto') {
                        //Eliminar el registro del DOM
                        e.target.parentElement.parentElement.parentElement.remove();

                        //Mostrar notifiación
                        mostrarNotificacion('Contacto eliminado', 'correcto');
                        // Actualizar el número
                        numeroContactos();
                    }else{
                        //Mostramos una notificación
                        mostrarNotificacion('Hubo un error...', 'error');
                    }
                }
            }

            //Enviar peticion
            xhr.send();
        }
    }
}

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('DIV');
    notificacion.textContent = mensaje;
    notificacion.classList.add('notificacion', 'sombra', tipo);

    //formulario
    formularioContactos.insertBefore(notificacion, document.querySelector('form legend'));
    setTimeout(() => {
        notificacion.classList.add('visible');
        
        setTimeout(() => {
            notificacion.classList.remove('visible');
            setTimeout(() => {
                notificacion.remove();
            }, 500);
        }, 3000);
    }, 100);
}

function buscarContactos(e) {
    const expresion = new RegExp(e.target.value, "i");
    const registros = document.querySelectorAll('tbody tr');

    registros.forEach(registro => {
        registro.style.display = 'none';

        if (registro.childNodes[1].textContent.replace(/\s/g, " ").search(expresion)  != -1) {
            registro.style.display = 'table-row';
        }
        numeroContactos();
    });
}

function numeroContactos() {
    const totalContactos = document.querySelectorAll('tbody tr');
    const contenedorNumero = document.querySelector('.total-contactos span');
    let total = 0;

    totalContactos.forEach(contacto => {
        if (contacto.style.display === '' || contacto.style.display === 'table-row') {
            total++;
        }
    });

    contenedorNumero.textContent = total;
}