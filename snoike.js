// jshint esnext: true
(function () {
	'use strict';

	const SNK_CELL_NOTHING = 0;
	const SNK_CELL_WALL = 1;
	const SNK_CELL_APPLE = 2;
	const SNK_CELL_SNOIKE = 3;

	const SNK_SYMBOL_NOTHING = ' ';
	const SNK_SYMBOL_WALL = '.';
	const SNK_SYMBOL_APPLE = '@';
	const SNK_SYMBOL_SNOIKE = '+';

	const SNK_DIRECTION_UP = 0;
	const SNK_DIRECTION_RIGHT = 1;
	const SNK_DIRECTION_DOWN = 2;
	const SNK_DIRECTION_LEFT = 3;

	const SNK_KEYCODE_H = 72;
	const SNK_KEYCODE_J = 74;
	const SNK_KEYCODE_K = 75;
	const SNK_KEYCODE_L = 76;

	const SNK_KEYCODE_W = 87;
	const SNK_KEYCODE_A = 65;
	const SNK_KEYCODE_S = 83;
	const SNK_KEYCODE_D = 68;

	const SNK_KEYCODE_ARROW_LEFT = 37;
	const SNK_KEYCODE_ARROW_DOWN = 40;
	const SNK_KEYCODE_ARROW_UP = 38;
	const SNK_KEYCODE_ARROW_RIGHT = 39;

	const SNK_KEYCODE_SPACEBAR = 32;

	window.addEventListener('load', onLoad, false);

	function onLoad() {
		const directionMap = {};
		// HJKL
		directionMap[SNK_KEYCODE_H] = SNK_DIRECTION_LEFT;
		directionMap[SNK_KEYCODE_J] = SNK_DIRECTION_DOWN;
		directionMap[SNK_KEYCODE_K] = SNK_DIRECTION_UP;
		directionMap[SNK_KEYCODE_L] = SNK_DIRECTION_RIGHT;
		// WASD
		directionMap[SNK_KEYCODE_W] = SNK_DIRECTION_UP;
		directionMap[SNK_KEYCODE_A] = SNK_DIRECTION_LEFT;
		directionMap[SNK_KEYCODE_S] = SNK_DIRECTION_DOWN;
		directionMap[SNK_KEYCODE_D] = SNK_DIRECTION_RIGHT;
		// Arrows
		directionMap[SNK_KEYCODE_ARROW_UP] = SNK_DIRECTION_UP;
		directionMap[SNK_KEYCODE_ARROW_LEFT] = SNK_DIRECTION_LEFT;
		directionMap[SNK_KEYCODE_ARROW_RIGHT] = SNK_DIRECTION_RIGHT;
		directionMap[SNK_KEYCODE_ARROW_DOWN] = SNK_DIRECTION_DOWN;

		const actionMap = {};
		actionMap[SNK_KEYCODE_SPACEBAR] = togglePause;

		const internals = {};
		internals.direction = SNK_DIRECTION_DOWN;

		let grid = produceGrid(30, 20);
		let snoike = produceSnoike(grid);

		window.addEventListener('keydown', dispatchAction, false);

		pause();

		function nextFrame() {
			moveSnoike(snoike, grid, internals.direction);
			dropSnoike(snoike, grid);
			if (!grid.hasApple) {
				dropApple(grid);
			}
			console.clear();
			console.log(getRenderedGrid(grid));
			if (snoike.isDead) {
				pause();
				console.log('ded');
			}
		}

		function dispatchAction(event) {
			if (snoike.isDead) {
				return;
			}
			event.preventDefault();
			const keyCode = event.keyCode;
			if (directionMap.hasOwnProperty(keyCode)) {
				internals.direction = directionMap[keyCode];
				return;
			}
			if (actionMap.hasOwnProperty(keyCode)) {
				actionMap[keyCode]();
			}
		}

		function resume() {
			internals.updateInterval = setInterval(nextFrame, 150);
			internals.isPaused = false;
		}

		function pause() {
			clearInterval(internals.updateInterval);
			internals.isPaused = true;
		}

		function togglePause() {
			return internals.isPaused ? resume() : pause();
		}
	}

	function moveSnoike(snoike, grid, direction) {
		snoike.direction = sanitizeDirection(snoike.direction, direction);
		const headCellIndex = getNextCell(snoike, grid, snoike.direction);
		const tailCellIndex = snoike.cells[snoike.cells.length - 1];
		if (snoike.cells[0] === headCellIndex) {
			return snoike;
		}
		const snoikeLength = snoike.cells.length;
		snoike.cells.unshift(headCellIndex);
		snoike.cells.length = snoikeLength;
		grid.cells[tailCellIndex] = SNK_CELL_NOTHING;
		const headCell = grid.cells[headCellIndex];
		if (headCell === SNK_CELL_APPLE) {
			snoike.cells.length += 1;
			grid.hasApple = false;
		}
		snoike.isDead = (headCell === SNK_CELL_WALL) ||
			(headCell === SNK_CELL_SNOIKE);
		return snoike;
	}

	function getNextCell(snoike, grid, direction) {
		const headCell = snoike.cells[0];
		if (direction === SNK_DIRECTION_UP) {
			return headCell - grid.width;
		}
		if (direction === SNK_DIRECTION_DOWN) {
			return headCell + grid.width;
		}
		if (direction === SNK_DIRECTION_LEFT) {
			return headCell - 1;
		}
		if (direction === SNK_DIRECTION_RIGHT) {
			return headCell + 1;
		}
		return headCell;
	}

	function sanitizeDirection(old_direction, new_direction) {
		if (old_direction === new_direction) {
			return old_direction;
		}
		if ((old_direction === SNK_DIRECTION_UP) &&
			(new_direction === SNK_DIRECTION_DOWN)) {
			return old_direction;
		}
		if ((old_direction === SNK_DIRECTION_DOWN) &&
			(new_direction === SNK_DIRECTION_UP)) {
			return old_direction;
		}
		if ((old_direction === SNK_DIRECTION_LEFT) &&
			(new_direction === SNK_DIRECTION_RIGHT)) {
			return old_direction;
		}
		if ((old_direction === SNK_DIRECTION_RIGHT) &&
			(new_direction === SNK_DIRECTION_LEFT)) {
			return old_direction;
		}
		return new_direction;
	}

	function dropSnoike(snoike, grid) {
		let idx;
		let snoikeCell;
		for (idx = 0; idx < snoike.cells.length; idx += 1) {
			snoikeCell = snoike.cells[idx]; 
			grid.cells[snoikeCell] = SNK_CELL_SNOIKE;
		}
		return grid;
	}

	function produceSnoike(grid) {
		const snoike = {};
		const headX = Math.round(grid.width / 2);
		const headY = Math.round(grid.height / 2);
		snoike.cells = [
			getCellIndex(headX, headY, grid),
			getCellIndex(headX, headY - 1, grid)
		];
		snoike.direction = SNK_DIRECTION_DOWN;
		snoike.isDead = false;
		return snoike;
	}

	function produceGrid(width, height) {
		let grid = {};
		grid.width = sanitizeGridDimension(width);
		grid.height = sanitizeGridDimension(height);
		const totalCells = grid.width * grid.height;
		const cells = new Array(totalCells);
		grid.cells = resetCells(cells, grid);
		grid.hasApple = false;
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
				cells.push(cellToSymbol(cell) + ' ');
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
