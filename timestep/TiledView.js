jsio('import .ScrollView');
jsio('import .Image');
exports = Class(ScrollView, function(supr) {
	this.init = function(opts) {
		supr(this, 'init', arguments);
		this._dataSource = opts.dataSource;
		this._tileWidth = opts.tileWidth;
		this._tileHeight = opts.tileHeight;
		this._fullWidth = this._dataSource.getNumCols() * this._tileWidth;
		this._fullHeight = this._dataSource.getNumRows() * this._tileHeight;
		
	}
	
	this.render = function(ctx) {
//		logger.info('this._offsetY', this._offsetY, 'this._tileHeight', this._tileHeight);
		var iStart = Math.floor(this._offsetY / this._tileHeight);
		var iEnd = Math.min(Math.ceil((this._height + this._offsetY) / this._tileHeight), this._dataSource.getNumRows()-1);
		var jStart = Math.floor(this._offsetX / this._tileWidth);
		var jEnd = Math.min(Math.ceil((this._width + this._offsetX) / this._tileWidth), this._dataSource.getNumCols()-1);
		var xOffset = this._offsetX % this._tileWidth;
		var yOffset = this._offsetY % this._tileHeight;
		var numRows = this._dataSource.getNumRows();
		var numCols = this._dataSource.getNumCols();
//		logger.info('iStart', iStart, 'iEnd', iEnd, 'jStart', jStart, 'jEnd', jEnd, 'xOffset', xOffset, 'yOffset', yOffset, 'numRows', numRows, 'numCols', numCols);
		for (var i = iStart; i <= iEnd; ++i) {
			for (var j = jStart; j <= jEnd; ++j) {
				var img = this._dataSource.getTileAt(i,j);
				if (!img) { continue; }
				var x = this._tileWidth * (j-jStart) - xOffset;
				var y = this._tileHeight * (i-iStart) - yOffset;
//				x = Math.floor(x);
				y = Math.ceil(y);
//				logger.info('img.render', x, y, this._tileWidth, this._tileHeight);
				img.render(ctx, x, y, this._tileWidth, this._tileHeight);
			}
		}
	}
})


