const formularioContactos = document.querySelector('#contacto');
const listadoContactos = document.querySelector('#listado-contactos tbody');
const inputBuscador = document.querySelector('#buscar');

const url = '../inc/models/modelo-contactos.php';
    
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

	if (nombre === '' || empresa === '' || telefono === '') {
		mostrarNotificacion('Todos los campos son obligatorios', 'error');
	} else {
		//Pasa la validación
		const infoContacto = new FormData();
		infoContacto.append('nombre', nombre);
		infoContacto.append('empresa', empresa);
		infoContacto.append('telefono', telefono);
		infoContacto.append('accion', accion);

		if (accion === 'crear') {
			//Creamos un nuevo contacto
			insertarContacto(infoContacto);
		} else {
			//editar el contacto
			//leer el id
			const idRegistro = document.querySelector('#id').value;
			infoContacto.append('id', idRegistro);
			actualizarContacto(infoContacto);
		}
	}
}

function eliminarContacto(e) {
	if (e.target.parentElement.classList.contains('btn-borrar')) {
        //tomar el ID
		const id = e.target.parentElement.getAttribute('data-id');
        const urlEliminar =  url + `?id=${id}&accion=borrar`;

		//preguntar al usuario
		const respuesta = confirm('¿Estás seguro');

        if(respuesta){
            fetch(urlEliminar, {method: 'GET'})
                .then( resultado => resultado.json())
                .then( respuesta => {
                    if (respuesta.respuesta === 'correcto') {
                        //Eliminar el registro del DOM
                        e.target.parentElement.parentElement.parentElement.remove();

                        //Mostrar notifiación
                        mostrarNotificacion('Contacto eliminado', 'correcto');
                        // Actualizar el número
                        numeroContactos();
                    } else {
                        mostrarNotificacion('Se produjo un error', 'error');
                    }
                });
        }
	}
}

function actualizarContacto(datos) {
	fetch(url, {
		method: 'POST',
		body: datos,
	})
		.then((resultado) => resultado.json())
		.then((respuesta) => {
			if (respuesta.respuesta === 'correcto') {
				//Mostrar notificación
				mostrarNotificacion('Actualizado correctamente', 'correcto');
			} else {
				mostrarNotificacion('Se produjo un error', 'error');
			}
		});
	setTimeout(() => {
		window.location.href = 'index.php';
	}, 1500);
}

function mostrarNotificacion(mensaje, tipo) {
	const notificacion = document.createElement('DIV');
	notificacion.textContent = mensaje;
	notificacion.classList.add('notificacion', 'sombra', tipo);

	//formulario
	formularioContactos.insertBefore(
		notificacion,
		document.querySelector('form legend')
	);
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

function insertarContacto(datos) {
	fetch(url, {
		method: 'POST',
		body: datos,
	})
		.then((resultado) => resultado.json())
		.then((respuesta) => {
			const { id, empresa, nombre, telefono } = respuesta.datos;
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
			btnEliminar.className = 'btn-borrar btn';

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
		});
}

function buscarContactos(e) {
	const expresion = new RegExp(e.target.value, 'i');
	const registros = document.querySelectorAll('tbody tr');

	registros.forEach((registro) => {
		registro.style.display = 'none';

		if (
			registro.childNodes[1].textContent
				.replace(/\s/g, ' ')
				.search(expresion) != -1
		) {
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