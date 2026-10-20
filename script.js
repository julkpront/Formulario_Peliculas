// 1. DATOS

// Aquí guardamos todas las películas (se pierden al recargar la página)
let peliculas = [];

// Si es null, estamos AÑADIENDO. Si tiene un número (id), estamos EDITANDO esa película.
let idEditando = null;



// 2. ELEMENTOS DEL HTML

const formulario = document.getElementById('formulario');
const tituloFormulario = document.getElementById('tituloFormulario');
const inputTitulo = document.getElementById('titulo');
const inputAño = document.getElementById('año');
const inputDescripcion = document.getElementById('descripcion');
const inputFoto = document.getElementById('foto');
const inputGenero = document.getElementById('genero');
const listaErrores = document.getElementById('errores');
const botonGuardar = document.getElementById('botonGuardar');
const botonCancelar = document.getElementById('botonCancelar');

const filtroGenero = document.getElementById('filtroGenero');
const filtroTexto = document.getElementById('filtroTexto');
const cuerpoTabla = document.getElementById('cuerpoTabla');


// 3. VALIDAR EL FORMULARIO

// Recibe los valores del formulario y devuelve una lista con los errores encontrados.
// Si la lista está vacía, todo está correcto.
function validarFormulario(titulo, año, descripcion, foto, genero) {
  const errores = [];
  const añoActual = new Date().getFullYear(); // Por ejemplo: 2026

  // Título: no puede estar vacío
  if (titulo === '') {
    errores.push('El título es obligatorio.');
  }

  // Año: 4 cifras y entre 1800 y el año actual
  // /^\d{4}$/ significa "exactamente 4 números y nada más"
  if (!/^\d{4}$/.test(año)) {
    errores.push('El año debe tener 4 cifras (por ejemplo 1999).');
  // "else if" = "si no, y además se cumple esto otro". Solo se mira si el año SÍ tiene 4 cifras.
  } else if (Number(año) < 1800 || Number(año) > añoActual) {
    // Number("1980") convierte el texto en número (1980) para poder compararlo.
    // || significa "O": error si es menor que 1800 O mayor que el año actual
    errores.push('El año debe estar entre 1800 y ' + añoActual + '.');
  }

  // Descripción: no puede estar vacía
  if (descripcion === '') {
    errores.push('La descripción es obligatoria.');
  }

  // Foto: debe ser una dirección web (empieza por http)
  // startsWith('http') comprueba si el texto EMPIEZA por "http".
  // El ! delante significa "NO": "si NO empieza por http, hay error"
  if (!foto.startsWith('http')) {
    errores.push('La URL de la foto debe empezar por http.');
  }

  // Género: hay que elegir uno
  if (genero === '') {
    errores.push('Elige un género.');
  }

  return errores;
}

// Pinta los errores en pantalla, uno por línea
function mostrarErrores(errores) {
  listaErrores.innerHTML = '';  // Primero borramos los errores que hubiera
  // for...of recorre la lista: en cada vuelta "error" es un mensaje distinto
  for (const error of errores) {
    // += añade algo al final de lo que ya había.
    // Aquí añadimos un <li> (una línea de la lista) por cada error.
    listaErrores.innerHTML += '<li>' + error + '</li>';
  }
}

// 4. AÑADIR O EDITAR (cuando se envía el formulario)

formulario.addEventListener('submit', function (evento) {
  // Evita que la página se recargue al enviar el formulario
  evento.preventDefault();

  // Leemos lo que ha escrito el usuario (trim quita espacios sobrantes)
  const titulo = inputTitulo.value.trim();
  const año = inputAño.value.trim();
  const descripcion = inputDescripcion.value.trim();
  const foto = inputFoto.value.trim();
  const genero = inputGenero.value;

  // Validamos. Si hay errores, los mostramos y paramos aquí.
  const errores = validarFormulario(titulo, año, descripcion, foto, genero);
  if (errores.length > 0) {
    mostrarErrores(errores);
    return; // "return" corta la función aquí: no se guarda nada
  }
  mostrarErrores([]); // Todo bien: le pasamos una lista vacía para borrar errores anteriores

  if (idEditando === null) {
    // --- AÑADIR una película nueva ---
    peliculas.push({
      id: Date.now(), // Número único para identificar la película
      titulo: titulo,
      año: Number(año), // Lo guardamos como número, no como texto
      descripcion: descripcion,
      foto: foto,
      genero: genero
    });
  } else {
    // --- EDITAR la película que ya existe ---
    // find recorre el array y devuelve la PRIMERA película que cumple la condición.
    // "p" es cada película por turnos; buscamos la que tenga el id que estamos editando.
    // === compara si dos valores son exactamente iguales.
    const pelicula = peliculas.find(function (p) {
      return p.id === idEditando;
    });
    // Como "pelicula" es la misma que está dentro del array, al cambiar sus datos
    // se cambian también en el array
    pelicula.titulo = titulo;
    pelicula.año = Number(año);
    pelicula.descripcion = descripcion;
    pelicula.foto = foto;
    pelicula.genero = genero;
    salirModoEdicion();
  }

  formulario.reset();   // Vaciamos el formulario
  mostrarPeliculas();   // Actualizamos la tabla
});


// 5. MOSTRAR LA TABLA (aplicando los filtros)

// Evita que el texto escrito por el usuario rompa el HTML
function escapar(texto) {
  // replace(lo_que_busco, por_lo_que_lo_cambio). La "g" final significa "todas las veces que aparezca".
  // Así, si alguien escribe <b> en el título, se verá como texto y no se creará una etiqueta.
  return String(texto)              // Nos aseguramos de que sea texto
    .replace(/&/g, '&amp;')         // & se cambia por su código seguro
    .replace(/</g, '&lt;')          // < se cambia por su código seguro
    .replace(/>/g, '&gt;')          // > se cambia por su código seguro
    .replace(/"/g, '&quot;');       // las comillas " también
}

function mostrarPeliculas() {
  const generoElegido = filtroGenero.value;
  // toLowerCase() pasa el texto a minúsculas, para que "TERROR" y "terror" cuenten igual
  const textoBuscado = filtroTexto.value.trim().toLowerCase();

  // filter recorre el array y crea uno NUEVO solo con las películas que
  // devuelven true. "p" es cada película por turnos.
  const filtradas = peliculas.filter(function (p) {
    // Cumple el género si se ha elegido "todos" O si el género de la película es el elegido
    const coincideGenero = generoElegido === 'todos' || p.genero === generoElegido;
    // includes comprueba si el título CONTIENE el texto buscado (si no escribes nada, siempre es true)
    const coincideTexto = p.titulo.toLowerCase().includes(textoBuscado);
    // && significa "Y": la película solo pasa si cumple LOS DOS filtros a la vez
    return coincideGenero && coincideTexto;
  });

  // Vaciamos la tabla antes de volver a pintarla
  cuerpoTabla.innerHTML = '';

  // Si no hay nada que mostrar, ponemos un aviso
  if (filtradas.length === 0) {
    cuerpoTabla.innerHTML = '<tr><td colspan="6">No hay películas para mostrar.</td></tr>';
    return;
  }

  // Una fila (<tr>) por cada película.
  // Vamos uniendo trozos de HTML con el signo +, y metiendo los datos de la película (p.titulo, p.año...).
  // En los botones, onclick="editarPelicula(123)" llama a la función de más abajo
  // pasándole el id de ESA película, para saber a cuál nos referimos.
  for (const p of filtradas) {
    cuerpoTabla.innerHTML +=
      '<tr>' +
        '<td><img src="' + escapar(p.foto) + '" alt="Póster de ' + escapar(p.titulo) + '"></td>' +
        '<td>' + escapar(p.titulo) + '</td>' +
        '<td>' + p.año + '</td>' +
        '<td class="genero">' + escapar(p.genero) + '</td>' +
        '<td>' + escapar(p.descripcion) + '</td>' +
        '<td>' +
          '<button class="btn-editar" onclick="editarPelicula(' + p.id + ')">Editar</button> ' +
          '<button class="btn-borrar" onclick="borrarPelicula(' + p.id + ')">Borrar</button>' +
        '</td>' +
      '</tr>';
  }
}


// 6. FILTROS

// Filtro por género: se actualiza al cambiar el desplegable
filtroGenero.addEventListener('change', mostrarPeliculas);

// Filtro por nombre: usamos "input" (y no "change") porque "change" solo salta
// cuando sales del campo. "input" salta con cada letra que escribes.
filtroTexto.addEventListener('input', mostrarPeliculas);

// 7. EDITAR UNA PELÍCULA

function editarPelicula(id) {
  // Buscamos la película con ese id
  const pelicula = peliculas.find(function (p) {
    return p.id === id;
  });

  // Rellenamos el formulario con sus datos
  inputTitulo.value = pelicula.titulo;
  inputAño.value = pelicula.año;
  inputDescripcion.value = pelicula.descripcion;
  inputFoto.value = pelicula.foto;
  inputGenero.value = pelicula.genero;

  // Pasamos a "modo edición"
  idEditando = id;
  tituloFormulario.textContent = 'Editar película';
  botonGuardar.textContent = 'Guardar cambios';
  botonCancelar.hidden = false; // hidden = false -> el botón Cancelar se vuelve visible
  mostrarErrores([]);

  // scrollIntoView hace que la página se desplace hasta el formulario
  formulario.scrollIntoView();
}

// Vuelve el formulario a su estado normal (modo "añadir")
function salirModoEdicion() {
  idEditando = null;
  tituloFormulario.textContent = 'Añadir película';
  botonGuardar.textContent = 'Añadir película';
  botonCancelar.hidden = true;
}

// Botón "Cancelar": dejamos de editar y vaciamos el formulario
botonCancelar.addEventListener('click', function () {
  salirModoEdicion();
  formulario.reset();
  mostrarErrores([]);
});

// 8. BORRAR UNA PELÍCULA

function borrarPelicula(id) {
  // confirm abre una ventanita con Aceptar / Cancelar y devuelve true o false.
  // Si el usuario cancela (!confirm), salimos de la función sin borrar nada.
  if (!confirm('¿Seguro que quieres borrar esta película?')) {
    return;
  }

  // Así se borra: filter crea un array nuevo con todas las películas MENOS la que tiene ese id.
  // Después guardamos ese array nuevo en "peliculas" (por eso "peliculas" se declaró con let).
  peliculas = peliculas.filter(function (p) {
    return p.id !== id;
  });

  // Si justo estábamos editando la película borrada, cancelamos la edición
  if (idEditando === id) {
    salirModoEdicion();
    formulario.reset();
  }

  mostrarPeliculas();
}


// 9. AL ABRIR LA PÁGINA


mostrarPeliculas(); // Pinta la tabla vacía con su mensaje
