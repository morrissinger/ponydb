var Element = require('./element.js');

var __extends = this.__extends || function (d, b) {
	function __() { this.constructor = d; }
	__.prototype = b.prototype;
	d.prototype = new __();
};

var Vertex = (function (_super) {
	__extends(Vertex, _super);
	function Vertex(obj, graph) {
		_super.call(this, obj, graph);
		this.outE = {
		};
		this.inE = {
		};
		this.Type = 'Vertex';
	}
	return Vertex;
})(Element);

module.exports = Vertex;