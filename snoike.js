// jshint esnext: true
(function () {
	'use strict';

	const SNK_CELL_NOTHING = 0;
	const SNK_SYMBOL_NOTHING = '.';

	const SNK_CELL_WALL = 1;
	const SNK_SYMBOL_WALL = '#';

	const SNK_CELL_APPLE = 2;
	const SNK_SYMBOL_APPLE = '@';

	const SNK_CELL_SNOIKE = 3;
	const SNK_SYMBOL_SNOIKE = '+';

	window.addEventListener('load', onLoad, false);

	function onLoad() {
		const grid = produceGrid();
		console.log(grid);
		console.log(getRenderedGrid(grid));
	}

	function produceGrid(width, height) {
		let grid = {};
		grid.width = sanitizeGridDimension(width);
		grid.height = sanitizeGridDimension(height);
		const totalCells = grid.width * grid.height;
		const cells = new Array(totalCells);
		grid.cells = resetCells(cells, grid);
		grid.hasApple = false;
		grid = dropApple(grid);
		return grid;
	}

	function getRenderedGrid(grid) {
		const cells = [];
		let x, y;
		let cellIndex;
		let cell;
		for (y = 0; y < grid.height; y += 1) {
			for (x = 0; x < grid.width; x += 1) {
				cellIndex = getCellIndex(x, y, grid);
				cell = grid.cells[cellIndex];
				cells.push( cellToSymbol(cell) + ' ');
			}
			cells.push('\n');
		}
		return cells.join('');
	}

	function dropApple(grid) {
		const cellIndex = Math.round(Math.random() * (grid.cells.length - 1));
		if (grid.cells[cellIndex] !== SNK_CELL_NOTHING) {
			return dropApple(grid);
		}
		grid.cells[cellIndex] = SNK_CELL_APPLE;
		grid.hasApple = true;
		return grid;
	}

	function resetCells(cells, grid) {
		let idx;
		for (idx = 0; idx < cells.length; idx += 1) {
			// top wall
			if (idx < grid.width) {
				cells[idx] = SNK_CELL_WALL;
				continue;
			}
			// bottom wall
			if (idx > (cells.length - grid.width)) {
				cells[idx] = SNK_CELL_WALL;
				continue;
			}
			// side walls
			if (((idx % grid.width) === 0) && (idx > 1)) {
				cells[idx] = SNK_CELL_WALL;
				cells[idx - 1] = SNK_CELL_WALL;
				continue;
			}
			// everything else
			cells[idx] = SNK_CELL_NOTHING;
		}
		return cells;
	}

	function getCellIndex(x, y, grid) {
		const cellIndex = x + (y * grid.width);
		return sanitizeCellIndex(cellIndex, grid);
	}

	function sanitizeCellIndex(cellIndex, grid) {
		const MIN_INDEX = 0;
		const MAX_INDEX = (grid.cells.length - 1);
		if (!isNumber(cellIndex)) { return MIN_INDEX; }
		cellIndex = Math.round(cellIndex);
		if (cellIndex < MIN_INDEX) { return MIN_INDEX; }
		if (cellIndex > MAX_INDEX) { return MAX_INDEX; }
		return cellIndex;
	}

	function sanitizeGridDimension(value) {
		const MIN_VALUE = 8;
		const MAX_VALUE = 64;
		if (!isNumber(value)) { return MIN_VALUE; }
		value = Math.round(value);
		if (value < MIN_VALUE) { return MIN_VALUE; }
		if (value > MAX_VALUE) { return MAX_VALUE; }
		return value;
	}

	function cellToSymbol(cell) {
		if (cell === SNK_CELL_WALL) { return SNK_SYMBOL_WALL; }
		if (cell === SNK_CELL_SNOIKE) { return SNK_SYMBOL_SNOIKE; }
		if (cell === SNK_CELL_APPLE) { return SNK_SYMBOL_APPLE; }
		return SNK_SYMBOL_NOTHING;
	}

	// Utility stuff

	function isNumber(item) {
		return (toStringCall(item) === '[object Number]') &&
			isFinite(item);
	}

	function toStringCall(item) {
		return Object.prototype.toString.call(item);
	}

})();
