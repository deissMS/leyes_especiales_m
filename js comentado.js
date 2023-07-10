document.addEventListener('DOMContentLoaded', (event) => {
  // Espera a que se cargue el evento "DOMContentLoaded" en el documento

  fetch('https://deissms.github.io/pmo_m/consolidado.json')
  // Realiza una solicitud fetch para obtener los datos del archivo JSON

  .then(response => response.json())
  // Convierte la respuesta en formato JSON

  .then(data => {
    // Se ejecuta después de que se obtienen los datos en formato JSON

    let categories = [...new Set(data.map(item => item.categoria))];
    // Obtiene las categorías únicas de los datos y las almacena en "categories"

    let selectElement = document.getElementById('categoria');
    // Obtiene el elemento de selección con el ID "categoria"

    categories.forEach(category => {
      // Itera sobre cada categoría

      let optionElement = document.createElement('option');
      // Crea un elemento de opción

      optionElement.value = category;
      // Asigna el valor de la categoría al atributo "value" del elemento de opción

      optionElement.textContent = category;
      // Asigna el nombre de la categoría como texto del elemento de opción

      selectElement.appendChild(optionElement);
      // Agrega el elemento de opción al elemento de selección
    });

    document.getElementById('busqueda').addEventListener('input', function(e) {
      // Asigna un evento "input" al campo de búsqueda con el ID "busqueda"

      document.getElementById('categoria').value = '';
      // Establece el valor del elemento de selección "categoria" en vacío cuando se ingresa texto en el campo de búsqueda
    });

    document.getElementById('categoria').addEventListener('change', function(e) {
      // Asigna un evento "change" al elemento de selección con el ID "categoria"

      document.getElementById('busqueda').value = '';
      // Establece el valor del campo de búsqueda "busqueda" en vacío cuando se cambia la selección en el elemento de selección "categoria"
    });

    document.getElementById('buscador').addEventListener('submit', function(e) {
      // Asigna un evento "submit" al formulario con el ID "buscador"

      e.preventDefault();
      // Previene el comportamiento predeterminado de enviar el formulario

      document.getElementById('texto-seccion').innerHTML = '';
      // Limpia el contenido del elemento con el ID "texto-seccion" para eliminar los resultados anteriores

      var valorBuscado = document.getElementById('busqueda').value;
      // Obtiene el valor ingresado en el campo de búsqueda con el ID "busqueda"

      var valorCategoria = document.getElementById('categoria').value;
      // Obtiene el valor seleccionado en el campo de categoría con el ID "categoria"

      var resultado = data.filter(function(obj) {
        // Filtra los datos basándose en el valor ingresado en el campo de búsqueda y/o en la categoría seleccionada

        if (valorBuscado !== "") {
          // Si se ha ingresado un valor en el campo de búsqueda
          return obj.nombre.toLowerCase().includes(valorBuscado.toLowerCase()) || obj.categoria.toLowerCase().includes(valorBuscado.toLowerCase());
          // Retorna los objetos cuyo nombre o categoría contengan el valor buscado (ignorando mayúsculas/minúsculas)
        } else {
          // Si no se ha ingresado un valor en el campo de búsqueda
          return obj.categoria === valorCategoria;
          // Retorna los objetos cuya categoría coincida con la categoría seleccionada
        }
      });

      if (resultado.length > 0) {
        // Si se encuentran resultados

        document.getElementById('texto-seccion').style.display = 'block';
        // Muestra el elemento con el ID "texto-seccion"

        var coberturas = resultado.map(function(obj) {
          // Crea un arreglo de texto para mostrar cada resultado

          var coberturaText;
          if (isNumeric(obj.cobertura)) {
            coberturaText = (obj.cobertura * 100) + '%';
          } else {
            coberturaText = obj.cobertura;
          }
          // Verifica si la cobertura es numérica y la formatea en porcentaje si es el caso

          return '<p class="nombre-resultado">'+ obj.nombre +'</p>' +
                 '<p class="resultado">Categoría: ' + obj.categoria + '</p>' +
                 '<p class="resultado">Subcategoría: ' + obj.subcategoria + '</p>' +
                 '<p class="resultado">Normativa que la incluye: ' + obj.norma + '</p>' +
                 '<p class="resultado"><b>Nivel de cobertura: ' + coberturaText + '</b></p>' +
                 '<p class="resultado">Recomendaciones de uso: ' + obj.recomendaciones + '</p>';
          // Crea un bloque de texto para cada resultado con los detalles correspondientes
        });

        var tituloResultado = resultado.length === 1 ? "Resultado de la búsqueda: 1 prestación encontrada" : "Resultado de la búsqueda: " + resultado.length + " prestaciones encontradas";
        // Crea el título para mostrar el número de resultados encontrados

        document.getElementById('texto-seccion').innerHTML = `
          <div class="acciones">
            <button id="descargar-resultados" class="boton-accion">Descargar Resultados</button>
            <button id="descargar-consolidado" class="boton-accion">Descargar Canasta Prestacional</button>
            <a href="https://www.argentina.gob.ar/normativa/nacional/resolución-201-2002-73649/actualizacion" target="_blank" class="boton-accion">Ver legislación</a>
          </div>
          <h2 class="titulo-resultado">${tituloResultado}</h2>
          ` + coberturas.join('<hr>');
        // Agrega los botones, enlace y resultados al elemento con el ID "texto-seccion"

        document.getElementById('descargar-consolidado').addEventListener('click', function() {
          // Asigna un evento de clic al botón "descargar-consolidado"

          window.location.href = 'data/consolidado.xlsx';
          // Redirige al usuario a la descarga del archivo XLSX (ruta del archivo puede requerir ajuste)
        });

        document.getElementById('descargar-resultados').addEventListener('click', function() {
          // Asigna un evento de clic al botón "descargar-resultados"

          var wb = XLSX.utils.book_new();
          // Crea un objeto de libro de trabajo en Excel

          wb.Props = {
              Title: "Resultados de la búsqueda",
              Author: "Tu nombre",
              CreatedDate: new Date()
          };
          // Asigna propiedades al libro de trabajo

          wb.SheetNames.push("Resultados");
          // Crea una hoja de cálculo en el libro de trabajo

          var ws_data = resultado.map(function(obj) {
            // Con```javascript
          var ws_data = resultado.map(function(obj) {
            // Convierte los resultados en un formato compatible con una hoja de cálculo

            return [
              obj.nombre,
              obj.categoria,
              obj.subcategoria,
              obj.norma,
              isNumeric(obj.cobertura) ? (obj.cobertura * 100) + '%' : obj.cobertura,
              obj.recomendaciones
            ];
            // Crea una fila de datos para cada resultado
          });

          ws_data.unshift(["Nombre", "Categoría", "Subcategoría", "Normativa", "Nivel de cobertura", "Recomendaciones"]);
          // Agrega una fila de encabezados de columna al inicio de los datos

          var ws = XLSX.utils.aoa_to_sheet(ws_data);
          // Convierte los datos en formato de hoja de cálculo

          wb.Sheets["Resultados"] = ws;
          // Agrega la hoja de cálculo al libro de trabajo

          var wbout = XLSX.write(wb, {bookType:'xlsx', type: 'binary'});
          saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'resultados.xlsx');
          // Guarda el libro de trabajo como un archivo XLSX para descargarlo
        });
      } else {
        alert('No se encontró el valor buscado');
        // Muestra una alerta si no se encuentran resultados
      }
    });
  })
  .catch(error => console.error('Error:', error));
});

function isNumeric(n) {
  // Verifica si un valor es numérico

  return !isNaN(parseFloat(n)) && isFinite(n);
}

function s2ab(s) {
  // Convierte una cadena en un arreglo de bytes

  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}
