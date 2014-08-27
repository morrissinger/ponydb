var Element = require('./element.js');

var __extends = this.__extends || function (d, b) {
	function __() { this.constructor = d; }
	__.prototype = b.prototype;
	d.prototype = new __();
};

var Edge = (function (_super) {
	__extends(Edge, _super);
	function Edge(obj, graph) {
		_super.call(this, obj, graph);
		this.Type = 'Edge';
	}
	return Edge;
})(Element);

module.exports = Edge;