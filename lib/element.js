var Utils = require('./utils.js');

var Element = (function () {
	function Element(obj, graph) {
		this.obj = obj;
		this.graph = graph;
	}
	Element.prototype.addToIndex = function (idx, indexName) {
		var indexes, props, tempObj = {
		};
		indexes = !indexName ? Utils.keys(idx) : [
			indexName
		];
		for(var i = 0, l = indexes.length; i < l; i++) {
			props = indexes[i].indexOf(".") > -1 ? indexes[i].split(".") : [
				indexes[i]
			];
			tempObj = this.obj;
			for(var i2 = 0, l2 = props.length; i2 < l2; i2++) {
				if(tempObj.hasOwnProperty(props[i2])) {
					if(Utils.isObject(tempObj[props[i2]])) {
						tempObj = tempObj[props[i2]];
					} else {
						if(i2 < l2 - 1) {
							break;
						}
						var iter = Utils.isArray(tempObj[props[i2]]) ? tempObj[props[i2]] : [
							tempObj[props[i2]]
						];
						for(var i3 = 0, l3 = iter.length; i3 < l3; i3++) {
							if(!(idx[indexes[i]].hasOwnProperty(iter[i3]))) {
								idx[indexes[i]][iter[i3]] = {
								};
							}
							idx[indexes[i]][iter[i3]][this.obj[this.graph.meta.id]] = this;
							push.call(this.indexKeys, indexes[i]);
						}
					}
				}
			}
		}
	};
	return Element;
})();

module.exports = Element;