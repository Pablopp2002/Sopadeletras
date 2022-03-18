"use strict";

/**Este objeto contiene las funciones necesarias para crear la 'vista' de la sopa de letras,
 * que esencialmente se refiere a mostrar la sopa de letras y manejar los eventos del mouse. *
 * @author Noor Aftab
 * 
 * @param {Array[]} matrix - Array 2D que contiene la cuadrícula de búsqueda de palabras llena
 * @param {Array[]} list -Array 2D que contiene la lista de palabras en la cuadrícula
 * @param {String} gameId - ID de div para el contenedor de búsqueda de palabras
 * @param {String} listId - ID de div para el contenedor que muestra la lista de palabras para encontrar
 * @param {String} instructionsId - ID para el encabezado h2, para actualizar según sea necesario
 */

function WordSearchView(matrix, list, gameId, listId, instructionsId) {

	"use strict";

	//variable para almacenar si el rompecabezas fue resuelto por el jugador o por el botón de resolver
	var selfSolved = true;

	//Objeto para contener nombres de clase/id/atributo de uso frecuente
	var names = { 

		cell: "cell",
		pivot: "pivot",
		selectable: "selectable",
		selected: "selected",
		path: "path"

	};
 	
 	//objeto para contener selectores de clase/id de uso frecuente
	var select = {  

		cells: "." + names.cell,
		pivot: "#" + names.pivot,
		selectable: "." + names.selectable,
		selected: "." + names.selected

	};

	var searchGrid = {

		row: "row",
		column: "column"

	};

	/* crea la cuadrícula de la sopa de letras de la búsqueda de palabras y la tabla que contiene la lista
	* de palabras para encontrar
	 */
	 this.setUpView = function() {

		createSearchGrid(matrix, names.cell, searchGrid.row, searchGrid.column, gameId);
		createListOfWords(list, listId);

	}

	/**  esta funcion hace una 'tabla' de divs para almacenar cada letra en la matriz
	* creado en wordsearchlogic.js
	 *
	 * @param {Array[]} matrix
	 * @param {String} cellName
	 * @param {String} rowAttr
	 * @param {String} colAttr
	 * @param {String} boardId
	 */
	function createSearchGrid(matrix, cellName, rowAttr, colAttr, boardId) {

		//recorre filas
		for (var i = 0; i < matrix.length; i++) {

			//crea un div para la fila de la tabla y le da una clase de fila
			var row = $("<div/>");
			row.attr({class: "boardRow"});  //solo se usó una vez, por lo que no está en una variable

			//recorre las columnas
			for (var j = 0; j < matrix[i].length; j++) {

				//cada letra en la fila es un elemento de botón
				var letter = $("<button/>");  //Se prefieren los botones para las acciones en las que se puede hacer clic.
				//a la letra se le asigna una clase de celda y se le asignan atributos de fila y columna
				letter.attr({
					class: cellName, 
					[rowAttr]: i, 
					[colAttr]: j}).text(matrix[i][j]); //establece el texto del botón en la matriz respectiva al index

				//agrega letra al elemento de fila más grande
				letter.appendTo(row);

			}

			//agrega la fila de letras al elemento de tablero de juego más grande
			row.appendTo($(boardId));
		}

	}

	/** Esta función crea un objeto de tipo tabla para insertar todas las palabras
	* contenido en el rompecabezas de búsqueda de palabras! los jugadores se refieren a esta tabla
	* al buscar palabras para encontrar
	 *
	 * @param {Array[]} wordList una matriz de palabras para insertar en el contenedor de lista
	 * @param {String} wordListId la identificación del contenedor 
	 */
	function createListOfWords(wordList, wordListId) {

		//recorre filas
		for (var i = 0; i < wordList.length; i++) {

			//crea un div para la fila
			var row = $("<div/>");
			row.attr({class: "listRow"}); //gives the rows a list row class

			//recorre las columnas
			for (var j = 0; j < wordList[i].length; j++) {

				//cada palabra individual es un elemento de lista
				var word = $("<li/>");

				//se les da una clase de palabra de lista y un atributo que contiene su texto recortado (como en el rompecabezas)
				word.attr({class: "listWord", text: wordList[i][j].replace(/\W/g, "")});

				//texto dado de su index de lista respetado
				word.text(wordList[i][j]);

				//agregado al elemento de fila de la lista más grande
				word.appendTo(row);

			}

			//fila de palabras agregadas a la lista de palabras más grande div
			row.appendTo($(wordListId));

		}

	}

	/** Esta función resuelve el rompecabezas para el jugador
	 *
	 * @param {Object} loc un objeto que contiene las ubicaciones de todas las palabras para encontrar en la sopa de letras
	 * @param {Array[]} matrix la cuadrícula en la que se colocan las palabras
	 */
	this.solve = function(wordLoc, matrix) {

		/** convierte el objeto en un array y recorre cada índice para encontrar
		* la palabra con las propiedades de coordenadas/orientación, configurando las palabras para encontrar
		 *
		 * @param {String} word - la palabra (recortada) colocada en el rompecabezas
		 */
		Object.keys(wordLoc).forEach(function(word) {  	

			//camino de la palabra
			var p = wordLoc[word].p;

			//el valor Y y x desde que comienza la palabra
			var startX = wordLoc[word].x;
			var startY = wordLoc[word].y;

			/** variables inicializadas: k - para longitud de palabra
			* x - para iniciar x/fila
			* y - para comenzar y/columna
			*
			* condiciones: k - menos que la longitud total de la palabra
			*
			* incrementos: k - incrementado en 1,
			* x & y - incrementado por funciones x & y para la ruta p dentro
			* objeto 'incr'
			 */
			for (var k = 0, x = startX, y = startY; k < word.length; k++, x = incr[p](x, y).x, y = incr[p](x, y).y) {

				//encuentra la celda del rompecabezas con el valor x e y respectivo y la establece como encontrada
				$(select.cells + "[row = " + x + "][column = " + y + "]").addClass("found");	

			}

			//establecido en falso ya que el programa lo resolvió para el jugador
			selfSolved = false;

			//comprueba si la palabra hecha es válida 
			validWordMade(list, word, instructionsId);	
	
		});

	}

	/** esta función encapsula todos los eventos del mouse para hacer un movimiento desglosándolo
	* en tres partes principales: presionando el mouse hacia abajo (mousedown), arrastrándolo (mouseenter),
	* y por ultimo soltando el mouse (mouseup)
	 */
	 this.triggerMouseDrag = function() {	

	 	//array vacío para almacenar las celdas seleccionadas en un movimiento
		var selectedLetters = [];

		// //cadena vacía para almacenar la palabra hecha por un
		var wordMade = ''; 

	 	//variable para almacenar si el mouse está presionado
		var mouseIsDown = false;	

	 	/** se ejecuta cuando se presiona el ratón sobre una letra en el
		* cuadrícula de búsqueda
	 	 */
		$(select.cells).mousedown(function() {
			
			//establece que el mouse está abajo
			mouseIsDown = true;

			//selecciona la celda presionada
			$(this).addClass(names.selected);

			//establece la celda presionada para que sea el "pivote" del movimiento
			$(this).attr({id: names.pivot});

			//Resalta todas las rutas posibles que el usuario puede seguir para seleccionar más letras
			highlightValidDirections($(this), matrix, names.selectable);

		});

		/** este código se ejecuta cuando el mouse está presionado y el usuario comienza a mover su
		* ratón dentro del contenedor de rompecabezas
		 */
		$(select.cells).mouseenter(function() {  
			
			//asegura que el mouse esté presionado y que la celda en la que se encuentra el mouse esté en una ruta válida
			if (mouseIsDown && $(this).hasClass(names.selectable)) {  

				//mantiene la dirección de la ruta en la que se encuentra actualmente el mouse
				var currentDirection = $(this).attr(names.path);  

				//anula la selección de las celdas seleccionadas
				for (var i = 0; i < selectedLetters.length; i++) {

					selectedLetters[i].removeClass(names.selected);

				}

				//vacía el array de letras seleccionadas
				selectedLetters = [];

				//vacía la cadena de la palabra que se está construyendo
				wordMade = '';

				//restablece el rango de celdas para seleccionar
				var cells = selectCellRange(select.cells, $(this), names.path, currentDirection, selectedLetters, wordMade);

				wordMade = cells.word;
				selectedLetters = cells.array;

			}

		});

		/** este código llama a la función endMove cuando se suelta el mouse; en su mayoría verifica
		* la palabra hecha y si es una palabra que se encuentra, así como el restablecimiento de variables
		* para permitir otro movimiento
		 */
		$(select.cells).mouseup(function() {

			endMove();

		});

		/** si el usuario está jugando y mueve el mouse fuera de la cuadrícula de palabras, esta función
		* hace que el movimiento finalice automáticamente - esto hace que presionar el mouse hacia abajo 
		 */
		$(gameId).mouseleave (function() {

			if (mouseIsDown) { //comprueba que el usuario está presionando el mouse hacia abajo (por lo tanto, jugando)

				endMove();

			}	

		});

		/** esta función maneja todo lo que debe consistir en el final de un movimiento: restablecer variables
		* para un nuevo movimiento y verificar si se ha hecho una palabra adecuada para encontrar
		 */
		function endMove() {

			//establece el mouse hacia abajo como falso ya que el mouse ahora está arriba
			mouseIsDown = false;

			//comprueba si se seleccionó una palabra de la lista
			if (validWordMade(list, wordMade, instructionsId)) {

				$(select.selected).addClass("found");

			}

			//anula la selección de las letras seleccionadas
			$(select.selected).removeClass(names.selected);

			//elimina los atributos de dirección de cualquier celda (evita un comportamiento extraño)
			$(select.cells).removeAttr(names.path);

			//elimina la ID del pivote para que se pueda seleccionar un nuevo pivote
			$(select.pivot).removeAttr("id");

			//eliminar la seleccionabilidad de las celdas seleccionables
			$(select.selectable).removeClass(names.selectable);

			//vacía la cadena de palabras y el array de celdas seleccionadas
			wordMade = '';
			selectedLetters = [];

			}

	}

	/* resalta todas las direcciones válidas en la matriz desde donde se hace clic por primera vez con el mouse, como
	* arriba -> abajo, izquierda -> derecha, ¡y ambas diagonales!
	*
	* @param {jQuery} selectedCell - Elemento DOM sobre el que presionó el mouse (¡una celda en el rompecabezas de búsqueda de palabras!)
	* @param {Array[]} matriz - la matriz 2D del rompecabezas
	* @param {String} makeSelectable - selector para hacer que un elemento sea seleccionable
	 */
	function highlightValidDirections(selectedCell, matrix, makeSelectable) {

		//obtiene la fila y la columna donde está la celda en la que se presionó el mouse
		var cellRow = parseInt(selectedCell.attr(searchGrid.row));
		var cellCol = parseInt(selectedCell.attr(searchGrid.column));

		//convierte el objeto de rutas globales en una matriz
		Object.keys(paths).forEach(function(path) { ////path - each property's name (e.g. 'vert', 'priDiagBack')

			//hace que cada celda en cada una de las rutas sea seleccionable
			makeRangeSelectable(cellRow, cellCol, matrix.length, paths[path], makeSelectable);

		});

	}

	/** Estas funciones hacen que una ruta dada sea seleccionable pero le da a cada celda en la ruta una clase 'seleccionable'
	* esto hace que el jugador solo pueda seleccionar celdas en rutas específicas (lo que hace que la selección sea vertical,	
* ¡horizontalmente y en diagonal es mucho menos complicado
	 *
	 * @param {Number} x - coordenada x inicial/fila de la ruta
	 * @param {Number} y - coordenada y inicial/columna de la ruta
	 * @param {Number} l - longitud/tamaño de la matriz
	 * @param {String} p - nombre de la ruta (por ejemplo, vertical, primarioDiagonalAtrás)
	 * @param {String} selectable - selector para hacer seleccionable un elemento DOM
	 */
	function makeRangeSelectable(x, y, l, p, selectable) {  

		/** variables inicializadas: x - fila inicial, incrementada para excluir el pivote
		* y - columna inicial, incrementada para excluir el pivote
		*
		* condición: x & y para mantenerse dentro de los límites recomendados para la ruta p
		* (determinado por los límites del objeto)
		*
		* incrementos: x & y - incrementados por la función determinada para la ruta p (por
		* objeto 'incr')
		 */
		for (var i = incr[p](x, y).x, j = incr[p](x, y).y;  //variables inicializadas
			bounds[p](i, j, l);  							//condición 
			i = incr[p](i, j).x, j=incr[p](i, j).y) {		//incrementos

			//seleccione los elementos DOM específicos con los valores de atributo de fila/columna específicos
			$("[" + searchGrid.row + "= " + i + "][" + searchGrid.column + "= " + j + "]")
				.addClass(selectable) //lo hace seleccionable
				.attr({[names.path]: p}); //le da un atributo de ruta con el valor de p

		}

	}

	/** esta función encuentra y selecciona el rango de celdas desde el pivote (primera celda seleccionada) hasta
	* la celda sobre la que el mouse está actualmente, yendo de un extremo a otro en el rompecabezas
	* matriz
	 *
	 * @param {String} cellsSelector - nombre del selector para celdas en la cuadrícula de búsqueda
	 * @param {Array} selectedCells
	 * @param {jQuery} hoveredCell - celda sobre la que se mueve el ratón
	 * @param {String} pathAttr - atributo de ruta/dirección
	 * @param {String} path - valor del atributo de ruta
	 * @param {String} wordConstructed - palabra que el usuario hace arrastrando en la sopa de letras
	 * @return devuelve un objeto que contiene: la palabra construida y la matriz de celdas DOM seleccionadas.
	 */
	function selectCellRange(cellsSelector, hoveredCell, pathAttr, path, selectedCells, wordConstructed) {

		//variable para mantener el índice de la celda sobre la que se movió el cursor
		var hoverIndex;

		//variable para mantener el índice de pivote
		var pivotIndex;  

		//selector de celdas en la ruta particular en la que se encuentra el mouse
		var cellRange = cellsSelector + "[" + pathAttr + " =" + path + "]";

		//establecer índices dependiendo de cómo fluyen los caminos
		switch(path) {

			case paths.vert:
			case paths.horizon:
			case paths.priDiag: 
			case paths.secDiag:				

				//hoverIndex > pivotIndex 
				hoverIndex = hoveredCell.index(cellRange)+1;
				pivotIndex = 0;

				//configura wordConstructed con la letra del pivote (para comenzar)
				wordConstructed = $(select.pivot).text();

				//usando el texto dinámico, selecciona celdas y agrega su texto a wordConstructed
				wordConstructed = selectLetters(selectedCells, wordConstructed, cellRange, pivotIndex, hoverIndex);
				

				break;
			
			case paths.vertBack:   
			case paths.horizonBack:
			case paths.priDiagBack:
			case paths.secDiagBack:

				//hoverIndex < pivotIndex
				hoverIndex = hoveredCell.index(cellRange);
				pivotIndex = $(cellRange).length;

				//selecciona el rango de celdas entre el pivote y la celda en la que se encuentra el mouse
			 	wordConstructed += selectLetters(selectedCells, wordConstructed, cellRange, hoverIndex, pivotIndex);

			 	//agrega texto pivote al final
				wordConstructed += $(select.pivot).text();

				break;

		}

		return {word: wordConstructed, array: selectedCells};
		
	}

	/** esta función selecciona el rango de celdas entre la celda pivote y la
	* la celda sobre la que se pasa el mouse y agrega su texto a la cadena de la palabra construida
	 *
	 * @param {Array} selectedCells - matriz para contener
	 * @param {String} wordConstructed - Palabra siendo creada por el usuario
	 * @param {String} range - la ruta en la que seleccionar las celdas
	 * @param {Number} lowerIndex - index de la celda inferior
	 * @param {Number} upperIndex - index de la celda superior
	 * @return devuelve la palabra creada durante el proceso de selección
	 */
	function selectLetters(selectedCells, wordConstructed, range, lowerIndex, upperIndex) {

		//solo pasa por el rango entre el pivote y donde sea que esté el mouse en el camino
		$(range).slice(lowerIndex, upperIndex).each(function() {

			//selecciona la celda
			$(this).addClass(names.selected);

			//lo agrega a la matriz de celdas
			selectedCells.push($(this));

			//actualiza la palabra que se está creando para incluir la letra de la celda más nueva
			wordConstructed += $(this).text();

		});

		return wordConstructed;

	}
	
	/** comprueba si la palabra que un usuario hizo después de un movimiento es una palabra real para encontrar, y
	* si es así, ¡¿establece la palabra como encontrada, de lo contrario, no pasa nada (por lo que el movimiento es
	* esencialmente ignorado)
	 *
	 * @param {Array[]} wordList - matriz de palabras en la cuadrícula
	 * @param {String} wordToCheck - palabra para comprobar la validez
	 * @param {String} instructionsId - selector para el rumbo h2
	 * @return verdadero si la palabra hecha es una palabra en la lista
	 */
	function validWordMade (list, wordToCheck, instructionsId) {

		//recorre filas
		for (var i = 0; i < list.length; i++) {

			//recorre las columnas
			for (var j = 0; j < list[i].length; j++) {

				//recorta la palabra en el index (para facilitar la comparación)
				var trimmedWord = list[i][j].replace(/\W/g, "")

				//si la palabra creada por el usuario es la misma que la palabra recortada, o al revés
				if (wordToCheck == trimmedWord ||
					wordToCheck == reversedWord(trimmedWord)) {
					
					//establece la palabra dentro del div de la lista como se encuentra (cambia de color, tacha el texto)
					$(".listWord[text = " + trimmedWord + "]").addClass("found");

					//comprueba si se encontró la última palabra a buscar
					checkPuzzleSolved(".listWord", ".listWord.found", instructionsId);
					
					return true;
									
				}

			}

		}

	}	

	/** comprueba si se han encontrado todas las palabras del acertijo, qué método se utilizó para
		resuelver el rompecabezas y actualizar el título de instrucciones h2 en consecuencia
	 *
	 * @param {String} fullList - selector de palabras en la lista de palabras div
	 * @param {String} foundWordsList - selector encontró palabras en la lista de palabras div
	 * @param {String} instructionsId - selector para encabezado de instrucciones h2
	 * @return verdadero si se ha resuelto toda la sopa de letras
	 */
	function checkPuzzleSolved (fullList, foundWordsList, instructionsId) {

		//si se han encontrado todas las palabras de la lista a buscar (n° de palabras a buscar == n° de palabras encontradas)
		if ($(fullList).length == $(foundWordsList).length) {

			//si el usuario resolvió el rompecabezas por sí mismo
			if (selfSolved) {

				//actualiza el texto h2
				$(instructionsId).text("Felicidades");

			}

			//Si el usuario usó el botón resolver
			else {

				//actualiza el texto h2
				$(instructionsId).text("Lo haremos por ti");

			}	

			return true;

 		}

 		return false;

	}

	/** 
	 *
	 * @param {String} word -palabra para invertir
	 * @return la palabra al revés
	 */
	function reversedWord(word) {

		//crea una cadena vacía para almacenar la palabra invertida
		var reversedWord = "";

		//recorre desde el final de la palabra hasta el principio (en lugar del tradicional principio a fin)
		for (var i = word.length - 1; i >= 0; i--) {

			//agrega el carácter a la palabra invertida
			reversedWord += word.charAt(i);

		}

		return reversedWord;

	}

}
