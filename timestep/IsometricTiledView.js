jsio('import .TiledView');
jsio('import .Image');
exports = Class(TiledView, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', arguments);
		this._fullHeight = this._dataSource.getNumRows() * this._tileHeight/2;
		this._tileBaseHeight = opts.tileBaseHeight;
	}
	
	this.render = function(ctx) {
		var offsetY = Math.floor(this._offsetY);
		var offsetX = Math.floor(this._offsetX);
		var rowStart = Math.floor(offsetY / (this._tileBaseHeight / 2));
		var rowEnd = Math.min(Math.ceil((this._height + offsetY) / (this._tileBaseHeight / 2)), this._dataSource.getNumRows()-1);
		var colStart = Math.floor(offsetX / this._tileWidth);
		var colEnd = Math.min(Math.ceil((this._width + offsetX) / this._tileWidth), this._dataSource.getNumCols()-1);
		var xOffset = -(offsetX % this._tileWidth);
		var yOffset = -(offsetY % (this._tileBaseHeight / 2));
		var numRows = this._dataSource.getNumRows();
		var numCols = this._dataSource.getNumCols();
		
		yOffset -= 48;
		
//		logger.info('rowStart', rowStart, 'rowEnd', rowEnd, 'colStart', colStart, 'colEnd', colEnd,  'xOffset', xOffset, 'yOffset', yOffset, 'numRows', numRows, 'numCols', numCols);
		for (var row = rowStart; row <= rowEnd; ++row) {
			var xRowOffset = (row % 2) ? -this._tileWidth / 2 : 0;
//			logger.info('xOffset', xOffset);
			for (var col = colStart; col <= colEnd; ++col) {
				var img = this._dataSource.getTileAt(row,col)
				var x = this._tileWidth * (col - colStart) + xRowOffset + xOffset;
				var y = this._tileBaseHeight/2 * (row - rowStart) + yOffset;
//				logger.info('call getTileAt', row, col);
//				logger.info('x,y', x, y);
				img.render(ctx, x, y, this._tileWidth, this._tileHeight);
			}
		}
	}
})


