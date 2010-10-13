jsio('import .Image');
jsio('from .util import mergeDefaults');



exports = Class(function() {
	var defaults = {
		imageUrl: "",
		mapData: [[]],
		tileWidth: 0,
		tileHeight: 0
	}
	
	this.init = function(opts) {
		mergeDefaults(opts, defaults);
		this._image = new Image({ url: opts.imageUrl });
		this._mapData = opts.mapData;
		this._tileWidth = opts.tileWidth;
		this._tileHeight = opts.tileHeight;
		this._ready = false;
	}
	
	this.getNumRows = function() {
		return this._mapData.length;
	}
	this.getNumCols = function() {
		return this._mapData[0] ? this._mapData[0].length : 0;
	}
	
	this.getTileValueAt = function(row, col) {
		if (row < 0 ||  row >= this._mapData.length) {
			return -1;
		}
		
		var rowData = this._mapData[row];
		var num;
		if (typeof(rowData) === 'string') {
			try {
				num = parseInt(rowData.substring(col,col+1));
			} catch(e) {
				return -1;
			}
		} 
		if (col < 0 ||  col >= rowData.length) {
			return -1;
		}
		return rowData[col]
	}
	
	this.getTileAt = function(row, col) {
		if (!this._ready) { 
			if (!this._image.isReady()) { return null; }
			this._ready = true;
			this._sourceWidth = this._image.getWidth();
			this._sourceHeight = this._image.getHeight();
			this._image.setSourceW(this._tileWidth);
			this._image.setSourceH(this._tileHeight);
		}
		var rowData = this._mapData[row];
		var num = this.getTileValueAt(row, col);
		if (num == -1) { return null; }
		var tilesPerRow = Math.floor(this._sourceWidth / this._tileWidth);
		var tileRow = Math.floor(num / tilesPerRow );
		var tileCol = num % tilesPerRow;
		//logger.info('_tileWidth', this._tileWidth, 'tilesPerRow', tilesPerRow, 'num', num, 'tileRow', tileRow, 'tileCol', tileCol);
//		logger.info('sourceX', this._tileWidth * tileCol, 'sourceY', this._tileHeight * tileRow);
//		logger.info('this._tileWidth', this._tileWidth, 'this.tileHeight', this._tileHeight);
		this._image.setSourceX(this._tileWidth * tileCol);
		this._image.setSourceY(this._tileHeight * tileRow);
		return this._image;
	}	
})