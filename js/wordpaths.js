"use strict";

/*las diferentes direcciones
*
* Nota: vertical - izquierda -> derecha
* horizontal - arriba-> abajo
* diagonal primaria - esquina superior izquierda -> esquina inferior derecha
* diagonal secundaria - esquina superior derecha -> esquina inferior izquierda
*
* 'hacia atrás' al final de la cadena se refiere a que va en la dirección opuesta (por lo que
* abajo -> arriba o abajo a la izquierda -> arriba a la derecha)
*/
var paths = { 

	vert: "vertical",
	horizon: "horizontal",
	priDiag: "primaryDiagonal",
	secDiag: "secondaryDiagonal",

	vertBack: "verticalBackwards",
	horizonBack: "horizonBackwards",
	priDiagBack: "primaryDiagonalBackwards",
	secDiagBack: "secondaryDiagonalBackwards",

};

/** este objeto configura los límites de la matriz para cada orientación (solo para asegurarse al insertar
 * una palabra en el tablero en un camino dado, la palabra no excede el tamaño de la matriz)
 * @param {Number} x fila del índice de matriz actual
 * @param {Number} y columna del índice de matriz actual
 * @param {Number} s tamaño (ancho o alto, cualquiera de los dos ya que deben ser iguales) de la matriz de letras
 */
var bounds = { 

	[paths.vert]: (x, y, s) => (x < s),
	[paths.horizon]: (x, y, s) => (y < s),
	[paths.priDiag]: (x, y, s) => (x < s) && (y < s),
	[paths.secDiag]: (x, y, s) =>  (x < s) && (y >= 0),

	[paths.vertBack]: (x, y, s) => (x >= 0),
	[paths.horizonBack]: (x, y, s) => (y >= 0),
	[paths.priDiagBack]: (x, y, s) => (x >= 0) && (y >= 0),
	[paths.secDiagBack]: (x, y, s) => (x >= 0) && (y < s)

};

/** este objeto toma la fila/columna de la matriz dada y la aumenta en la
 * dirección del camino dado
 *
 * @param {Number} x fila de matriz para incrementar
 * @param {Number} y columna de matriz para incrementar
 * @return coordenadas Y y x incrementadas (por un factor de 1)
 */
var incr = { 

	[paths.vert]: (x, y) => ({x: x+1, y: y}),
	[paths.horizon]: (x, y) => ({x: x, y: y+1}),
	[paths.priDiag]: (x, y) => ({x: x+1, y: y+1}),
	[paths.secDiag]: (x, y) => ({x: x+1, y: y-1}),

	[paths.vertBack]: (x, y) => ({x: x-1, y: y}),
	[paths.horizonBack]: (x, y) => ({x: x, y: y-1}),
	[paths.priDiagBack]: (x, y) => ({x: x-1, y: y-1}),
	[paths.secDiagBack]: (x, y) => ({x: x-1, y: y+1})

};