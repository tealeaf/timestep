jsio('import lib.PubSub as PubSub');
exports = new (Class(PubSub, function(supr) {
	this.init = function() {
		this._loaded = {}
		this._assetList = [];
		this._loading = false;
	}
	
	this.load = function(assets) {
		if (assets) {
			for (var i = 0, a; a = assets[i]; ++i) {
				this.loadAsset(i);
			}
		}
		
		this.publish('Load');
	}
	
	this.loadAsset = function(asset) {
		if (asset in this._loaded) {
			return;
		}
		this._assetList.push(asset);
	}
	
	
}))();

