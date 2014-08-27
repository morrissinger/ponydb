var Utils = require('./utils.js');
var toString = Object.prototype.toString, ArrayProto = Array.prototype, push = ArrayProto.push, slice = ArrayProto.slice, indexOf = ArrayProto.indexOf;


var Mogwai = {};

function getEndPipe() {
	return this.endPipe;
}
Mogwai.getEndPipe = getEndPipe;
var Pipeline = (function () {
	function Pipeline(graph, elements) {
		this.graph = graph;
		if(!!elements) {
			this.startPipe(elements);
		}
	}
	Pipeline.prototype.startPipe = function (elements) {
		var pipe;
		this.steps = {
			currentStep: 1
		};
		this.endPipe = [];
		this.pipeline = this.graph.traceEnabled ? [] : undefined;
		Utils.each(elements, function (element) {
			if(this.graph.traceEnabled) {
				pipe = [];
				pipe.push(element);
				this.pipeline.push(pipe);
			}
			this.endPipe.push(element);
		}, this);
		this.steps[this.steps.currentStep] = {
			func: 'startPipe',
			args: []
		};
		if(this.graph.traceEnabled) {
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		}
		return this;
	};
	Pipeline.prototype.id = function () {
		return this.property(this.graph.meta.id);
	};
	Pipeline.prototype.label = function () {
		return this.property(this.graph.meta.label);
	};
	Pipeline.prototype.out = function () {
		var labels = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			labels[_i] = arguments[_i + 0];
		}
		var value, vertex, iter = [], endPipeArray = [], hasArgs = !!labels.length, tracing = !!this.graph.traceEnabled, pipes, pipe;
		if(!!this.endPipe.length && this.endPipe[0].Type !== 'Vertex') {
			throw new TypeError('Only accepts incoming ' + this.endPipe[0].Type + 's');
		}
		this.steps[++this.steps.currentStep] = {
			func: 'out',
			args: labels
		};
		if(tracing) {
			iter = this.pipeline;
			pipes = [];
		} else {
			this.traversed = {
			};
			iter = this.endPipe;
		}
		Utils.each(iter, function (next) {
			if(tracing) {
				vertex = slice.call(next, -1)[0];
			} else {
				vertex = next;
				if(this.traversed.hasOwnProperty(vertex.obj[this.graph.meta.id])) {
					if(!!this.traversed[vertex.obj[this.graph.meta.id]].length) {
						endPipeArray.push.apply(endPipeArray, this.traversed[vertex.obj[this.graph.meta.id]]);
					}
					return;
				} else {
					this.traversed[vertex.obj[this.graph.meta.id]] = [];
				}
			}
			value = hasArgs ? Utils.pick(vertex.outE, labels) : vertex.outE;
			Utils.each(Utils.flatten(Utils.values(value)), function (edge) {
				endPipeArray.push(edge.inV);
				if(tracing) {
					pipe = [];
					pipe.push.apply(pipe, next);
					pipe.push(edge.inV);
					pipes.push(pipe);
				} else {
					push.call(this.traversed[vertex.obj[this.graph.meta.id]], edge.inV);
				}
			}, this);
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		} else {
			this.traversed = undefined;
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.in = function () {
		var labels = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			labels[_i] = arguments[_i + 0];
		}
		var value, vertex, iter = [], endPipeArray = [], hasArgs = !!labels.length, tracing = !!this.graph.traceEnabled, pipes, pipe;
		if(!!this.endPipe.length && this.endPipe[0].Type !== 'Vertex') {
			throw new TypeError('Only accepts incoming ' + this.endPipe[0].Type + 's');
		}
		this.steps[++this.steps.currentStep] = {
			func: 'in',
			args: labels
		};
		if(tracing) {
			iter = this.pipeline;
			pipes = [];
		} else {
			this.traversed = {
			};
			iter = this.endPipe;
		}
		Utils.each(iter, function (next) {
			if(tracing) {
				vertex = slice.call(next, -1)[0];
			} else {
				vertex = next;
				if(this.traversed.hasOwnProperty(vertex.obj[this.graph.meta.id])) {
					if(!!this.traversed[vertex.obj[this.graph.meta.id]].length) {
						endPipeArray.push.apply(endPipeArray, this.traversed[vertex.obj[this.graph.meta.id]]);
					}
					return;
				} else {
					this.traversed[vertex.obj[this.graph.meta.id]] = [];
				}
			}
			value = hasArgs ? Utils.pick(vertex.inE, labels) : vertex.inE;
			Utils.each(Utils.flatten(Utils.values(value)), function (edge) {
				endPipeArray.push(edge.outV);
				if(tracing) {
					pipe = [];
					pipe.push.apply(pipe, next);
					pipe.push(edge.outV);
					pipes.push(pipe);
				} else {
					push.call(this.traversed[vertex.obj[this.graph.meta.id]], edge.outV);
				}
			}, this);
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		} else {
			this.traversed = undefined;
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.outV = function () {
		var edge, iter, endPipeArray = [], tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe;
		this.steps[++this.steps.currentStep] = {
			func: 'outV'
		};
		if(!!this.endPipe.length && this.endPipe[0].Type !== 'Edge') {
			throw new TypeError('Step ' + this.steps.currentStep + ' only accepts incoming ' + this.endPipe[0].Type + 's');
		}
		iter = tracing ? this.pipeline : this.endPipe;
		Utils.each(iter, function (next) {
			edge = tracing ? slice.call(next, -1)[0] : next;
			endPipeArray.push(edge.outV);
			if(tracing) {
				pipe = [];
				pipe.push.apply(pipe, next);
				pipe.push(edge.outV);
				pipes.push(pipe);
			}
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.inV = function () {
		var edge, iter = [], endPipeArray = [], tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe;
		;
		this.steps[++this.steps.currentStep] = {
			func: 'inV'
		};
		if(!!this.endPipe.length && this.endPipe[0].Type !== 'Edge') {
			throw new TypeError('Step ' + this.steps.currentStep + ' only accepts incoming ' + this.endPipe[0].Type + 's');
		}
		iter = tracing ? this.pipeline : this.endPipe;
		Utils.each(iter, function (next) {
			edge = tracing ? slice.call(next, -1)[0] : next;
			endPipeArray.push(edge.inV);
			if(tracing) {
				pipe = [];
				pipe.push.apply(pipe, next);
				pipe.push(edge.inV);
				pipes.push(pipe);
			}
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.outE = function () {
		var labels = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			labels[_i] = arguments[_i + 0];
		}
		var value, vertex, iter = [], endPipeArray = [], hasArgs = !!labels.length, tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe;
		if(!!this.endPipe.length && this.endPipe[0].Type !== 'Vertex') {
			throw new TypeError('Only accepts incoming ' + this.endPipe[0].Type + 's');
		}
		this.steps[++this.steps.currentStep] = {
			func: 'outE',
			args: labels
		};
		if(tracing) {
			iter = this.pipeline;
			pipes = [];
		} else {
			this.traversed = {
			};
			iter = this.endPipe;
		}
		Utils.each(iter, function (next) {
			if(tracing) {
				vertex = slice.call(next, -1)[0];
			} else {
				vertex = next;
				if(this.traversed.hasOwnProperty(vertex.obj[this.graph.meta.id])) {
					if(!!this.traversed[vertex.obj[this.graph.meta.id]].length) {
						endPipeArray.push.apply(endPipeArray, this.traversed[vertex.obj[this.graph.meta.id]]);
					}
					return;
				} else {
					this.traversed[vertex.obj[this.graph.meta.id]] = [];
				}
			}
			value = hasArgs ? Utils.pick(vertex.outE, labels) : vertex.outE;
			Utils.each(Utils.flatten(Utils.values(value)), function (edge) {
				endPipeArray.push(edge);
				if(tracing) {
					pipe = [];
					pipe.push.apply(pipe, next);
					pipe.push(edge);
					pipes.push(pipe);
				} else {
					push.call(this.traversed[vertex.obj[this.graph.meta.id]], edge);
				}
			}, this);
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		} else {
			this.traversed = undefined;
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.inE = function () {
		var labels = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			labels[_i] = arguments[_i + 0];
		}
		var value, vertex, iter = [], endPipeArray = [], hasArgs = !!labels.length, tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe;
		if(!!this.endPipe.length && this.endPipe[0].Type !== 'Vertex') {
			throw new TypeError('Only accepts incoming ' + this.endPipe[0].Type + 's');
		}
		this.steps[++this.steps.currentStep] = {
			func: 'inE',
			args: labels
		};
		if(tracing) {
			iter = this.pipeline;
			pipes = [];
		} else {
			this.traversed = {
			};
			iter = this.endPipe;
		}
		Utils.each(iter, function (next) {
			if(tracing) {
				vertex = slice.call(next, -1)[0];
			} else {
				vertex = next;
				if(this.traversed.hasOwnProperty(vertex.obj[this.graph.meta.id])) {
					if(!!this.traversed[vertex.obj[this.graph.meta.id]].length) {
						endPipeArray.push.apply(endPipeArray, this.traversed[vertex.obj[this.graph.meta.id]]);
					}
					return;
				} else {
					this.traversed[vertex.obj[this.graph.meta.id]] = [];
				}
			}
			value = hasArgs ? Utils.pick(vertex.inE, labels) : vertex.inE;
			Utils.each(Utils.flatten(Utils.values(value)), function (edge) {
				endPipeArray.push(edge);
				if(tracing) {
					pipe = [];
					pipe.push.apply(pipe, next);
					pipe.push(edge);
					pipes.push(pipe);
				} else {
					push.call(this.traversed[vertex.obj[this.graph.meta.id]], edge);
				}
			}, this);
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		} else {
			this.traversed = undefined;
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.both = function () {
		var labels = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			labels[_i] = arguments[_i + 0];
		}
		var value, vertex, iter = [], endPipeArray = [], hasArgs = !!labels.length, tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe;
		this.steps[++this.steps.currentStep] = {
			func: 'both',
			args: labels
		};
		if(!!this.endPipe.length && this.endPipe[0].Type !== 'Vertex') {
			throw new TypeError('Only accepts incoming ' + this.endPipe[0].Type + 's');
		}
		if(tracing) {
			iter = this.pipeline;
			pipes = [];
		} else {
			this.traversed = {
			};
			iter = this.endPipe;
		}
		Utils.each(iter, function (next) {
			if(tracing) {
				vertex = slice.call(next, -1)[0];
			} else {
				vertex = next;
				if(this.traversed.hasOwnProperty(vertex.obj[this.graph.meta.id])) {
					if(!!this.traversed[vertex.obj[this.graph.meta.id]].length) {
						endPipeArray.push.apply(endPipeArray, this.traversed[vertex.obj[this.graph.meta.id]]);
					}
					return;
				} else {
					this.traversed[vertex.obj[this.graph.meta.id]] = [];
				}
			}
			value = hasArgs ? Utils.pick(vertex.outE, labels) : vertex.outE;
			Utils.each(Utils.flatten(Utils.values(value)), function (edge) {
				endPipeArray.push(edge.inV);
				if(tracing) {
					pipe = [];
					pipe.push.apply(pipe, next);
					pipe.push(edge.inV);
					pipes.push(pipe);
				} else {
					push.call(this.traversed[vertex.obj[this.graph.meta.id]], edge.inV);
				}
			}, this);
			value = hasArgs ? Utils.pick(vertex.inE, labels) : vertex.inE;
			Utils.each(Utils.flatten(Utils.values(value)), function (edge) {
				endPipeArray.push(edge.outV);
				if(tracing) {
					pipe = [];
					pipe.push.apply(pipe, next);
					pipe.push(edge.outV);
					pipes.push(pipe);
				} else {
					push.call(this.traversed[vertex.obj[this.graph.meta.id]], edge.outV);
				}
			}, this);
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		} else {
			this.traversed = undefined;
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.bothV = function () {
		var edge, iter = [], endPipeArray = [], tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe;
		;
		this.steps[++this.steps.currentStep] = {
			func: 'bothV'
		};
		if(!!this.endPipe.length && this.endPipe[0].Type !== 'Edge') {
			throw new TypeError('Only accepts incoming ' + this.endPipe[0].Type + 's');
		}
		iter = tracing ? this.pipeline : this.endPipe;
		Utils.each(iter, function (next) {
			edge = tracing ? slice.call(next, -1)[0] : next;
			endPipeArray.push.apply(endPipeArray, [
				edge.outV,
				edge.inV
			]);
			if(tracing) {
				pipe = [];
				pipe.push.apply(pipe, next);
				pipe.push(edge.outV);
				pipes.push(pipe);
				pipe = [];
				pipe.push.apply(pipe, next);
				pipe.push(edge.inV);
				pipes.push(pipe);
			}
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.bothE = function () {
		var labels = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			labels[_i] = arguments[_i + 0];
		}
		var value, vertex, iter = [], endPipeArray = [], hasArgs = !!labels.length, tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe;
		this.steps[++this.steps.currentStep] = {
			func: 'bothE',
			args: labels
		};
		if(!!this.endPipe.length && this.endPipe[0].Type !== 'Vertex') {
			throw new TypeError('Only accepts incoming ' + this.endPipe[0].Type + 's');
		}
		if(tracing) {
			iter = this.pipeline;
			pipes = [];
		} else {
			this.traversed = {
			};
			iter = this.endPipe;
		}
		Utils.each(iter, function (next) {
			if(tracing) {
				vertex = slice.call(next, -1)[0];
			} else {
				vertex = next;
				if(this.traversed.hasOwnProperty(vertex.obj[this.graph.meta.id])) {
					if(!!this.traversed[vertex.obj[this.graph.meta.id]].length) {
						push.apply(endPipeArray, this.traversed[vertex.obj[this.graph.meta.id]]);
					}
					return;
				} else {
					this.traversed[vertex.obj[this.graph.meta.id]] = [];
				}
			}
			value = hasArgs ? Utils.pick(vertex.outE, labels) : vertex.outE;
			Utils.each(Utils.flatten(Utils.values(value)), function (edge) {
				endPipeArray.push(edge);
				if(tracing) {
					pipe = [];
					pipe.push.apply(pipe, next);
					pipe.push(edge);
					pipes.push(pipe);
				} else {
					push.call(this.traversed[vertex.obj[this.graph.meta.id]], edge);
				}
			}, this);
			value = hasArgs ? Utils.pick(vertex.inE, labels) : vertex.inE;
			Utils.each(Utils.flatten(Utils.values(value)), function (edge) {
				endPipeArray.push(edge);
				if(tracing) {
					pipe = [];
					pipe.push.apply(pipe, next);
					pipe.push(edge);
					pipes.push(pipe);
				} else {
					push.call(this.traversed[vertex.obj[this.graph.meta.id]], edge);
				}
			}, this);
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		} else {
			this.traversed = undefined;
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.property = function (prop) {
		var element, iter = [], endPipeArray = [], tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe, array = [], tempObj, tempProp, isEmbedded = prop.indexOf(".") > -1;
		tempProp = isEmbedded ? prop.split(".").slice(-1)[0] : prop;
		this.steps[++this.steps.currentStep] = {
			func: 'property',
			args: prop
		};
		iter = tracing ? this.pipeline : this.endPipe;
		Utils.each(iter, function (next) {
			element = tracing ? slice.call(next, -1)[0] : next;
			tempObj = isEmbedded ? Utils.embeddedObject(element.obj, prop) : element.obj;
			if(!Utils.isObject(tempObj[tempProp]) && tempObj.hasOwnProperty(tempProp)) {
				array.push(tempObj[tempProp]);
				if(tracing) {
					pipe = [];
					pipe.push.apply(pipe, next);
					pipe.push(tempObj[tempProp]);
					pipes.push(pipe);
				}
			}
		});
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		}
		this.endPipe = array;
		return this;
	};
	Pipeline.prototype.order = function () {
		var prop = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			prop[_i] = arguments[_i + 0];
		}
		this.steps[++this.steps.currentStep] = {
			func: 'order',
			args: prop,
			'exclFromPath': true
		};
		if(!!this.graph.traceEnabled) {
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		}
		if(!prop.length) {
			if(!!this.endPipe.length && Utils.isElement(this.endPipe[0])) {
				this.endPipe.sort(Utils.dynamicSortMultiple([
					this.graph.meta.id
				]));
			} else {
				this.endPipe.sort(Utils.defaultSort);
			}
		} else if(prop.length == 1 && prop[0] === '-') {
			if(!!this.endPipe.length && Utils.isElement(this.endPipe[0])) {
				this.endPipe.sort(Utils.dynamicSortMultiple([
						'-' + this.graph.meta.id
				]));
			} else {
				this.endPipe.sort(Utils.defaultSort).reverse();
			}
		} else {
			this.endPipe.sort(Utils.dynamicSortMultiple(Utils.flatten(prop)));
		}
		return this;
	};
	Pipeline.prototype.range = function (start, end) {
		this.endPipe = !!end ? this.endPipe.slice(start, end + 1) : this.endPipe.slice(start);
		return this;
	};
	Pipeline.prototype.index = function () {
		var indices = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			indices[_i] = arguments[_i + 0];
		}
		var endPipeArray = [], idx = Utils.flatten(indices);
		for(var i = 0, l = idx.length; i < l; i++) {
			if(idx[i] > -1 && idx[i] < this.endPipe.length) {
				endPipeArray.push(this.endPipe[idx[i]]);
			}
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.dedup = function () {
		this.endPipe = Utils.uniqueElement(this.endPipe);
		return this;
	};
	Pipeline.prototype.except = function (any) {
		var exclIds, ids, endPipeIds;
		if(!!any.length) {
			ids = Utils.pluck(this.endPipe, this.graph.meta.id);
			exclIds = Utils.isObject(any[0]) ? Utils.pluck(Utils.flatten(any), this.graph.meta.id) : any;
			endPipeIds = Utils.difference(ids, exclIds);
			this.endPipe = Utils.materializeElementArray(endPipeIds, this.graph, this.endPipe[0].Type);
		} else {
			this.endPipe = [];
		}
		return this;
	};
	Pipeline.prototype.retain = function (any) {
		var intersectIds, ids, endPipeIds;
		if(!!any.length) {
			ids = Utils.pluck(this.endPipe, this.graph.meta.id);
			intersectIds = Utils.isObject(any[0]) ? Utils.pluck(Utils.flatten(any), this.graph.meta.id) : any;
			endPipeIds = Utils.intersection(ids, intersectIds);
			this.endPipe = Utils.materializeElementArray(endPipeIds, this.graph, this.endPipe[0].Type);
		} else {
			this.endPipe = [];
		}
		return this;
	};
	Pipeline.prototype.where = function () {
		var args = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			args[_i] = arguments[_i + 0];
		}
		var element, iter = [], l, nextIter = [], comparables = [], endPipeArray = [], tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, funcObj, tempObj, compObj, tempProp, propVals = [], isIn, norArray = [], origArray = [];
		this.steps[++this.steps.currentStep] = {
			func: 'where',
			args: args,
			'exclFromPath': true
		};
		iter = tracing ? this.pipeline : this.endPipe;
		comparables = Utils.flatten(args);
		l = comparables.length;
		for(var i = 0; i < l; i++) {
			compObj = comparables[i];
			if('$nor' in compObj) {
				norArray.push.apply(norArray, this.endPipe);
				origArray.push.apply(origArray, this.endPipe);
				for(var x = 0, xl = compObj['$nor'].length; x < xl; x++) {
					this.where.call(this, compObj['$nor'][x]);
					norArray.push.apply(norArray, this.endPipe);
					this.endPipe = origArray;
				}
				endPipeArray = Utils.findInstances(norArray, 1);
				continue;
			}
			Utils.each(iter, function (next) {
				element = tracing ? slice.call(next, -1)[0] : next;
				for(var prop in compObj) {
					isIn = false;
					if(compObj.hasOwnProperty(prop)) {
						if(prop.charAt(0) === "$") {
							propVals = compObj[prop];
							if(!Compare[prop].call(null, element.obj, propVals)) {
								if(i < l) {
									nextIter.push(next);
								}
								return;
							}
						} else {
							tempObj = element.obj;
							tempProp = prop;
							if(tempProp.indexOf(".") > -1) {
								tempObj = Utils.embeddedObject(tempObj, tempProp);
								tempProp = tempProp.split(".").slice(-1)[0];
							}
							if(Utils.isObject(tempObj[tempProp]) || !tempObj.hasOwnProperty(tempProp)) {
								if(i < l) {
									nextIter.push(next);
								}
								return;
							}
							funcObj = compObj[prop];
							for(var func in funcObj) {
								if(funcObj.hasOwnProperty(func)) {
									if(Compare[func].call(null, tempObj[tempProp], funcObj[func])) {
										if(!isIn) {
											isIn = true;
										}
									}
								}
							}
							if(!isIn) {
								if(i < l) {
									nextIter.push(next);
								}
								return;
							}
						}
					}
				}
				endPipeArray.push(element);
				if(tracing) {
					push.call(next, element);
					pipes.push(next);
				}
			}, this);
			iter = nextIter;
			nextIter = [];
		}
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.filter = function (closure) {
		var element, iter = [], endPipeArray = [], tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe, customClosure = new Function("it", Utils.funcBody(closure));
		this.steps[++this.steps.currentStep] = {
			func: 'filter',
			args: [],
			'exclFromPath': true
		};
		iter = tracing ? this.pipeline : this.endPipe;
		Utils.each(iter, function (next) {
			element = tracing ? slice.call(next, -1)[0] : next;
			if(customClosure.call(element.obj, element.obj)) {
				endPipeArray.push(element);
				if(tracing) {
					pipe = [];
					pipe.push.apply(pipe, next);
					pipe.push(element);
					pipes.push(pipe);
				}
			}
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.ifThenElse = function (ifClosure, thenClosure, elseClosure) {
		var element, iter = [], endPipeArray = [], tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe, itObj, closureOut, ifC = new Function("it", Utils.funcBody(ifClosure)), thenC = new Function("it", Utils.funcBody(thenClosure)), elseC = new Function("it", Utils.funcBody(elseClosure));
		this.steps[++this.steps.currentStep] = {
			func: 'ifThenElse',
			args: []
		};
		iter = tracing ? this.pipeline : this.endPipe;
		Utils.each(iter, function (next) {
			element = tracing ? slice.call(next, -1)[0] : next;
			itObj = Utils.isElement(element) ? element.obj : element;
			if(ifC.call(itObj, itObj)) {
				closureOut = thenC.call(itObj, itObj);
			} else {
				closureOut = elseC.call(itObj, itObj);
			}
			endPipeArray.push(closureOut);
			if(tracing) {
				pipe = [];
				pipe.push.apply(pipe, next);
				pipe.push(closureOut);
				pipes.push(pipe);
			}
		}, this);
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.as = function (name) {
		this.asHash = this.asHash || {
		};
		if(!this.asHash[name]) {
			this.asHash[name] = {
			};
		}
		this.asHash[name].step = this.steps.currentStep;
		return this;
	};
	Pipeline.prototype.back = function (x) {
		var backTo, i = 0, l = 0, endPipeArray = [];
		if(!this.graph.traceEnabled) {
			throw Error('Tracing is off');
			return;
		}
		;
		if(!x) {
			throw Error('Paramater is required');
			return;
		}
		if(Utils.isString(x)) {
			if(x in this.asHash) {
				backTo = this.asHash[x].step;
			} else {
				throw Error('Unknown named position');
			}
		} else {
			x = this.steps.looped ? x + this.steps.looped : x;
			backTo = this.steps.currentStep - x;
		}
		this.pipeline = Utils.uniqueRow(this.pipeline, backTo);
		l = this.pipeline.length;
		for(i = 0; i < l; i++) {
			push.call(endPipeArray, this.pipeline[i][backTo - 1]);
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.optional = function (x) {
		var backTo, i = 0, l = 0, endPipeArray = [];
		if(!this.graph.traceEnabled) {
			throw Error('Tracing is off');
			return;
		}
		;
		if(!x) {
			throw Error('Paramater is required');
			return;
		}
		if(Utils.isString(x)) {
			if(x in this.asHash) {
				backTo = this.asHash[x].step;
			} else {
				throw Error('Unknown named position');
			}
		} else {
			backTo = this.steps.currentStep - x;
		}
		this.pipeline = this.steps[backTo].elements;
		l = this.pipeline.length;
		for(i = 0; i < l; i++) {
			push.call(endPipeArray, this.pipeline[i][backTo - 1]);
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.select = function (list) {
		var closure = [];
		for (var _i = 0; _i < (arguments.length - 1); _i++) {
			closure[_i] = arguments[_i + 1];
		}
		var backTo, i, l = this.pipeline.length, k, endPipeHash = {
		}, tempEndPipeArray, endPipeArray = [], closureArray = [], closureOut, pos = 0;
		if(!this.graph.traceEnabled) {
			throw Error('Tracing is off');
			return;
		}
		;
		if(!list) {
			for(i = 0; i < l; i++) {
				tempEndPipeArray = [];
				for(k in this.asHash) {
					if(this.asHash.hasOwnProperty(k)) {
						endPipeHash = {
						};
						backTo = this.asHash[k].step;
						endPipeHash[k] = this.pipeline[i][backTo - 1].obj;
						push.call(tempEndPipeArray, endPipeHash);
					}
				}
				push.call(endPipeArray, tempEndPipeArray);
			}
		} else {
			if(!Utils.isArray(list)) {
				closure.unshift(list);
				list = undefined;
			}
			for(var j = 0, funcsLen = closure.length; j < funcsLen; j++) {
				closureArray.push(new Function("it", Utils.funcBody(closure[j])));
			}
			if(list && Utils.isArray(list)) {
				for(i = 0; i < l; i++) {
					tempEndPipeArray = [];
					for(var x = 0, len = list.length; x < len; x++) {
						endPipeHash = {
						};
						if(list[x] in this.asHash) {
							backTo = this.asHash[list[x]].step;
							if(!!closureArray.length) {
								endPipeHash[list[x]] = closureArray[pos % funcsLen].call(this.pipeline[i][backTo - 1].obj, this.pipeline[i][backTo - 1].obj);
								++pos;
							} else {
								endPipeHash[list[x]] = this.pipeline[i][backTo - 1].obj;
							}
							push.call(tempEndPipeArray, endPipeHash);
						} else {
							throw Error('Unknown named position');
						}
					}
					push.call(endPipeArray, tempEndPipeArray);
				}
			} else {
				for(i = 0; i < l; i++) {
					tempEndPipeArray = [];
					for(k in this.asHash) {
						if(this.asHash.hasOwnProperty(k)) {
							endPipeHash = {
							};
							backTo = this.asHash[k].step;
							endPipeHash[k] = closureArray[pos % funcsLen].call(this.pipeline[i][backTo - 1].obj, this.pipeline[i][backTo - 1].obj);
							push.call(tempEndPipeArray, endPipeHash);
						}
						pos++;
					}
					push.call(endPipeArray, tempEndPipeArray);
				}
			}
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.path = function () {
		var props = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			props[_i] = arguments[_i + 0];
		}
		var tempObjArray = [], tempArr = [], tempObj = {
		}, outputArray = [], i = 0, len = 0, j = 0, l = 0, isClosure, closureArray = [], propsLen = props.length;
		if(!this.graph.traceEnabled) {
			throw Error('Tracing is off');
			return;
		}
		len = this.pipeline.length;
		if(!!propsLen) {
			isClosure = /^\s*it(?=\.[A-Za-z_])/.exec(props[0]) ? true : false;
			if(isClosure) {
				for(var c = 0, funcsLen = propsLen; c < funcsLen; c++) {
					closureArray.push(new Function("it", Utils.funcBody(props[c])));
				}
				for(i = 0; i < len; i++) {
					tempObjArray = Utils.toPathArray(this.pipeline[i], this.steps);
					l = tempObjArray.length;
					for(j = 0; j < l; j++) {
						push.call(tempArr, closureArray[j % propsLen].call(tempObjArray[j], tempObjArray[j]));
					}
					push.call(outputArray, tempArr);
					tempObjArray = [];
					tempArr = [];
				}
			} else {
				for(i = 0; i < len; i++) {
					tempObjArray = Utils.toPathArray(this.pipeline[i], this.steps);
					l = tempObjArray.length;
					for(j = 0; j < l; j++) {
						push.call(tempArr, Utils.pick(tempObjArray[j], props));
					}
					push.call(outputArray, tempArr);
					tempObjArray = [];
					tempArr = [];
				}
			}
		} else {
			for(i = 0; i < len; i++) {
				push.call(outputArray, Utils.toPathArray(this.pipeline[i], this.steps));
			}
		}
		this.endPipe = outputArray;
		return this;
	};
	Pipeline.prototype.count = function () {
		var cnt = this.endPipe.length;
		this.endPipe = cnt;
		return this;
	};
	Pipeline.prototype.group = function (args) {
		var tracing = !!this.graph.traceEnabled, props = [], tempObj, tempProp, groupObj = {
		}, o = {
		}, outputObj = {
		}, element;
		args = Utils.flatten(args);
		Utils.each(this.endPipe, function (next) {
			element = tracing ? slice.call(next, -1)[0].obj : next.obj;
			o = {
			};
			o[element[this.graph.meta.id]] = element;
			for(var j = args.length - 1, propsLen = 0; j >= propsLen; j--) {
				tempObj = element;
				tempProp = args[j];
				if(tempProp.indexOf(".") > -1) {
					tempObj = Utils.embeddedObject(tempObj, tempProp);
					tempProp = tempProp.split(".").slice(-1)[0];
				}
				if(!(Utils.isObject(tempObj[tempProp])) && tempObj.hasOwnProperty(tempProp)) {
					props = Utils.isArray(tempObj[tempProp]) ? tempObj[tempProp] : [
						tempObj[tempProp]
					];
					for(var f = 0, flen = props.length; f < flen; f++) {
						groupObj[props[f]] = o;
					}
				} else {
					groupObj['_no_' + args[j]] = o;
				}
				o = groupObj;
				groupObj = {
				};
			}
			outputObj = Utils.merge(o, outputObj);
		});
		this.endPipe = [];
		return outputObj;
	};
	Pipeline.prototype.sum = function (args) {
		var tracing = !!this.graph.traceEnabled, props = [], tempObj, tempProp, outputObj, o = {
		}, isEmbedded = false;
		function createChildren(val) {
			var properties = [];
			for (var _i = 0; _i < (arguments.length - 1); _i++) {
				properties[_i] = arguments[_i + 1];
			}
			var i = properties.length, retObj = {
			}, groupObj = {
				value: val
			};
			retObj = groupObj;
			while(!!i) {
				groupObj = {
				};
				groupObj[properties[--i]] = retObj;
				retObj = groupObj;
			}
			return retObj;
		}
		args = Utils.flatten(args);
		for(var i = 0, propsLen = args.length; i < propsLen; i++) {
			tempProp = args[i];
			o[tempProp] = 0;
			isEmbedded = false;
			if(args[i].indexOf(".") > -1) {
				tempProp = args[i].split(".").slice(-1)[0];
				isEmbedded = true;
			}
			Utils.each(this.endPipe, function (next) {
				tempObj = tracing ? slice.call(next, -1)[0].obj : next.obj;
				if(isEmbedded) {
					tempObj = Utils.embeddedObject(tempObj, args[i]);
				}
				if(!(Utils.isObject(tempObj[tempProp])) && tempObj.hasOwnProperty(tempProp)) {
					props = Utils.isArray(tempObj[tempProp]) ? tempObj[tempProp] : [
						tempObj[tempProp]
					];
					for(var j = 0, len = props.length; j < len; j++) {
						o[args[i]] = o[args[i]] + Utils.parseNumber([
							props[j]
						]);
					}
				}
			});
		}
		props = [];
		var o2, o3 = {
		};
		for(var k in o) {
			if(o.hasOwnProperty(k)) {
				if(k.indexOf(".") > -1) {
					props.push(o[k]);
					props.push.apply(props, k.split("."));
					o2 = createChildren.apply(null, props);
				} else {
					o2 = {
					};
					o2[k] = {
					};
					o2[k].value = o[k];
				}
				o3 = Utils.merge(o2, o3);
			}
		}
		outputObj.summed = o3;
		outputObj.results = this.endPipe;
		this.endPipe = [];
		return outputObj;
	};
	Pipeline.prototype.transform = function (closure) {
		var element, iter = [], endPipeArray = [], tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe, itObj, customClosure = new Function("it", Utils.funcBody(closure)), closureOut;
		this.steps[++this.steps.currentStep] = {
			func: 'transform',
			args: closure
		};
		iter = tracing ? this.pipeline : this.endPipe;
		Utils.each(iter, function (next) {
			element = tracing ? slice.call(next, -1)[0] : next;
			itObj = Utils.isElement(element) ? element.obj : element;
			closureOut = customClosure.call(itObj, itObj);
			endPipeArray.push(closureOut);
			if(tracing) {
				pipe = [];
				pipe.push.apply(pipe, next);
				pipe.push(closureOut);
				pipes.push(pipe);
			}
		});
		if(tracing) {
			this.pipeline = pipes;
			this.steps[this.steps.currentStep].elements = [];
			push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
		}
		this.endPipe = endPipeArray;
		return this;
	};
	Pipeline.prototype.loop = function (stepBack, iterations, closure) {
		var element, iter = [], endPipeArray = [], tracing = !!this.graph.traceEnabled, pipes = tracing ? [] : undefined, pipe, tempPipeline = [], backTo, currentStep = this.steps.currentStep, loopFor = iterations - 1, step, i, j, l, customClosure = closure ? new Function("it", Utils.funcBody(closure)) : undefined;
		this.steps.looped = this.steps.looped + (iterations - 1) || iterations - 1;
		if(Utils.isString(stepBack)) {
			if(stepBack in this.asHash) {
				backTo = this.asHash[stepBack].step;
			} else {
				throw Error('Unknown named position');
			}
		} else {
			backTo = this.steps.currentStep - (stepBack - 1);
		}
		if(closure) {
			iter = tracing ? this.pipeline : this.endPipe;
			Utils.each(iter, function (next) {
				element = tracing ? slice.call(next, -1)[0] : next;
				if(customClosure.call(element.obj, element.obj)) {
					endPipeArray.push(element);
					if(tracing) {
						pipe = [];
						pipe.push.apply(pipe, next);
						pipes.push(pipe);
					}
				}
			});
		}
		while(loopFor) {
			--loopFor;
			for(i = backTo; i < currentStep + 1; i++) {
				step = this.steps[i];
				this[step.func].apply(this, step.args);
				if(closure) {
					iter = tracing ? this.pipeline : this.endPipe;
					Utils.each(iter, function (next) {
						element = tracing ? slice.call(next, -1)[0] : next;
						if(customClosure.call(element.obj, element.obj)) {
							endPipeArray.push(element);
							if(tracing) {
								pipe = [];
								pipe.push.apply(pipe, next);
								pipes.push(pipe);
							}
						}
					});
					if(tracing) {
						this.pipeline = pipes;
						this.steps[this.steps.currentStep].elements = [];
						push.apply(this.steps[this.steps.currentStep].elements, this.pipeline);
					}
				}
			}
		}
		if(closure) {
			this.endPipe = endPipeArray;
		}
		return this;
	};
	Pipeline.prototype.emit = function () {
		var result = undefined;
		if(!!this.endPipe.length) {
			if(!this.endPipe[0] || !Utils.isElement(this.endPipe[0])) {
				result = this.endPipe;
			} else {
				result = Utils.toObjArray(this.endPipe);
			}
		} else {
			result = this.endPipe;
		}
		this.traversed = undefined;
		this.asHash = undefined;
		this.endPipe = undefined;
		this.pipeline = undefined;
		this.steps = {
			currentStep: 0
		};
		return result;
	};
	Pipeline.prototype.stringify = function () {
		this.endPipe = JSON.stringify(Utils.toObjArray(this.endPipe));
		return this;
	};
	Pipeline.prototype.hash = function () {
		this.endPipe = Utils.toHash(this.endPipe);
		return this;
	};
	Pipeline.prototype.map = function () {
		var props = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			props[_i] = arguments[_i + 0];
		}
		var tempObjArray = [], outputArray = [];
		if(!!props.length) {
			tempObjArray = Utils.toObjArray(this.endPipe);
			for(var j = 0, l = tempObjArray.length; j < l; j++) {
				push.call(outputArray, Utils.pick(tempObjArray[j], props));
			}
			tempObjArray = [];
		} else {
			outputArray = Utils.toObjArray(this.endPipe);
		}
		this.endPipe = outputArray;
		return this;
	};
	return Pipeline;
})();
Mogwai.Pipeline = Pipeline;
var Compare = (function () {
	function Compare() { }
	Compare.$eq = function $eq(objVal, val) {
		var objValIsArray = Utils.isArray(objVal), index;
		objVal = objValIsArray ? Utils.unique(objVal) : [
			objVal
		];
		index = objVal.length;
		while(index) {
			--index;
			if(((Utils.isDate(val) && Utils.isDate(objVal[index])) || (Utils.isBoolean(val) && Utils.isBoolean(objVal[index])) || (!(Utils.isDate(objVal[index]) || Utils.isBoolean(objVal[index])))) && (Utils.parseValue(objVal[index]) === Utils.parseValue(val))) {
				return true;
			}
		}
		return false;
	};
	Compare.$neq = function $neq(objVal, val) {
		return !Compare.$eq(objVal, val);
	};
	Compare.$lt = function $lt(objVal, val) {
		var objValIsArray = Utils.isArray(objVal), index;
		objVal = objValIsArray ? Utils.unique(objVal) : [
			objVal
		];
		index = objVal.length;
		while(index) {
			--index;
			if(((Utils.isDate(val) && Utils.isDate(objVal[index])) || (Utils.isBoolean(val) && Utils.isBoolean(objVal[index])) || (!(Utils.isDate(objVal[index]) || Utils.isBoolean(objVal[index])))) && (Utils.parseValue(objVal[index]) < Utils.parseValue(val))) {
				return true;
			}
		}
		return false;
	};
	Compare.$lte = function $lte(objVal, val) {
		var objValIsArray = Utils.isArray(objVal), index;
		objVal = objValIsArray ? Utils.unique(objVal) : [
			objVal
		];
		index = objVal.length;
		while(index) {
			--index;
			if(((Utils.isDate(val) && Utils.isDate(objVal[index])) || (Utils.isBoolean(val) && Utils.isBoolean(objVal[index])) || (!(Utils.isDate(objVal[index]) || Utils.isBoolean(objVal[index])))) && (Utils.parseValue(objVal[index]) <= Utils.parseValue(val))) {
				return true;
			}
		}
		return false;
	};
	Compare.$gt = function $gt(objVal, val) {
		return !Compare.$lte(objVal, val);
	};
	Compare.$gte = function $gte(objVal, val) {
		return !Compare.$lt(objVal, val);
	};
	Compare.$btw = function $btw(objVal, val) {
		return Compare.$gte(objVal, val[0]) && Compare.$lte(objVal, val[1]);
	};
	Compare.$len = function $len(objVal, val) {
		var len = objVal.length;
		if(Utils.isNumber(Utils.parseNumber(val))) {
			return len == val;
		}
		return eval(len + /^\s*(?:<|>)\=*\s*\d+|^\s*(?:!|=)\={1,2}\s*\d/.exec(val)[0]);
	};
	Compare.$in = function $in(objVal, val) {
		var objValIsArray = Utils.isArray(objVal), index, i = 0, valLen;
		objVal = objValIsArray ? Utils.unique(objVal) : [
			objVal
		];
		val = Utils.flatten([
			val
		]);
		valLen = val.length;
		index = objVal.length;
		while(index) {
			--index;
			i = valLen;
			while(!!i) {
				--i;
				if(((Utils.isDate(val[i]) && Utils.isDate(objVal[index])) || (Utils.isBoolean(val[i]) && Utils.isBoolean(objVal[index])) || (!(Utils.isDate(objVal[index]) || Utils.isBoolean(objVal[index])))) && (Utils.parseValue(objVal[index]) === Utils.parseValue(val[i]))) {
					return true;
				}
			}
		}
		return false;
	};
	Compare.$ex = function $ex(objVal, val) {
		return !Compare.$in(objVal, val);
	};
	Compare.$like = function $like(objVal, val) {
		var objValIsArray = Utils.isArray(objVal), index, i = 0, valLen;
		objVal = objValIsArray ? Utils.unique(objVal) : [
			objVal
		];
		val = Utils.flatten([
			val
		]);
		valLen = val.length;
		index = objVal.length;
		while(index) {
			--index;
			i = valLen;
			while(!!i) {
				--i;
				if(Utils.isString(objVal[index]) && !(objVal[index].search(val[i]) === -1)) {
					return true;
				}
			}
		}
		return false;
	};
	Compare.$startsWith = function $startsWith(objVal, val) {
		var objValIsArray = Utils.isArray(objVal), index;
		objVal = objValIsArray ? Utils.unique(objVal) : [
			objVal
		];
		index = objVal.length;
		while(index) {
			--index;
			if(Utils.isString(objVal[index]) && !(objVal[index].search('^' + val) === -1)) {
				return true;
			}
		}
		return false;
	};
	Compare.$endsWith = function $endsWith(objVal, val) {
		var objValIsArray = Utils.isArray(objVal), index;
		objVal = objValIsArray ? Utils.unique(objVal) : [
			objVal
		];
		index = objVal.length;
		while(index) {
			--index;
			if(Utils.isString(objVal[index]) && !(objVal[index].search(val + '$') === -1)) {
				return true;
			}
		}
		return false;
	};
	Compare.$all = function $all(objVal, val) {
		var matchCnt = 0, index = 0, i = 0, valLen = 0;
		val = Utils.unique(val);
		objVal = Utils.unique(objVal);
		valLen = val.length;
		index = objVal.length;
		if(valLen <= index) {
			while(index) {
				--index;
				i = valLen;
				while(!!i) {
					--i;
					if(((Utils.isDate(val[i]) && Utils.isDate(objVal[index])) || (Utils.isBoolean(val[i]) && Utils.isBoolean(objVal[index])) || (!(Utils.isDate(objVal[index]) || Utils.isBoolean(objVal[index])))) && (Utils.parseValue(objVal[index]) === Utils.parseValue(val[i]))) {
						matchCnt++;
					}
				}
			}
		}
		return matchCnt == valLen;
	};
	Compare.$match = function $match(objVal, val) {
		var matchCnt = 0, index = 0, i = 0, valLen = 0;
		val = Utils.unique(val);
		objVal = Utils.unique(objVal);
		valLen = val.length;
		index = objVal.length;
		if(valLen == index) {
			while(index) {
				--index;
				i = valLen;
				while(!!i) {
					--i;
					if(((Utils.isDate(val[i]) && Utils.isDate(objVal[index])) || (Utils.isBoolean(val[i]) && Utils.isBoolean(objVal[index])) || (!(Utils.isDate(objVal[index]) || Utils.isBoolean(objVal[index])))) && (Utils.parseValue(objVal[index]) === Utils.parseValue(val[i]))) {
						matchCnt++;
					}
				}
			}
		}
		return matchCnt == valLen;
	};
	Compare.$has = function $has(obj, val) {
		var i = 0, tempObj, tempProp;
		val = Utils.flatten([
			val
		]);
		i = val.length;
		while(!!i) {
			--i;
			tempObj = obj;
			tempProp = val[i];
			if(tempProp.indexOf(".") > -1) {
				tempObj = Utils.embeddedObject(tempObj, tempProp);
				tempProp = tempProp.split(".").slice(-1)[0];
			}
			if(tempObj.hasOwnProperty(tempProp)) {
				return true;
			}
		}
		return false;
	};
	Compare.$hasNot = function $hasNot(obj, val) {
		return !Compare.$has(obj, val);
	};
	return Compare;
})();
Mogwai.Compare = Compare;

module.exports = Mogwai;