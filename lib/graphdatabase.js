var Q = require('Q');

var Utils = require('./utils.js'),
	Vertex = require('./vertex.js'),
	Edge = require('./edge.js'),
	Mogwai = require('./mogwai.js');

var toString = Object.prototype.toString, ArrayProto = Array.prototype, push = ArrayProto.push, slice = ArrayProto.slice, indexOf = ArrayProto.indexOf;

var GraphDatabase = (function () {

	function GraphDatabase(options) {
		this.traceEnabled = true;
		this.meta = {
			id: '_id',
			label: '_label',
			type: '_type',
			outEid: '_outE',
			inEid: '_inE',
			outVid: '_outV',
			inVid: '_inV',
			VOut: '_out',
			VIn: '_in'
		};
		this.db = {
			'baseUri': 'localhost',
			'port': 8182,
			'name': 'tinker',
			'type': 'orientdb',
			'ssl': false
		};
		if(!!options) {
			for(var k in options) {
				if(options.hasOwnProperty(k)) {
					this[k] = options[k];
				}
			}
		} else {
			this.vertices = {
			};
			this.edges = {
			};
			this.v_idx = {
			};
			this.e_idx = {
			};
			if(!!options) {
				this.setConfiguration(options);
			}
		}
		this._ = new Mogwai.Pipeline(this);
	}
	GraphDatabase.prototype.shutdown = function () {
		this.vertices = {
		};
		this.edges = {
		};
		this.v_idx = {
		};
		this.e_idx = {
		};
	};
	GraphDatabase.prototype.startTrace = function (turnOn) {
		return this.traceEnabled = turnOn;
	};
	GraphDatabase.prototype.setConfiguration = function (options) {
		try {
			for(var k in options) {
				if(options.hasOwnProperty(k)) {
					if(Utils.isObject(options[k])) {
						var o = options[k];
						for(var i in o) {
							if(o.hasOwnProperty(i)) {
								this[k][i] = o[i];
							}
						}
						continue;
					}
					this[k] = options[k];
				}
			}
			return true;
		} catch(err){
			return false;
		}
	};
	GraphDatabase.prototype.loadVertices = function (rows) {
		var i, l = rows.length, hasVIndex = !Utils.isEmpty(this.v_idx), vertex;
		for(i = 0; i < l; i++) {
			vertex = new Vertex(rows[i], this);
			this.vertices[rows[i][this.meta.id]] = vertex;
			if(hasVIndex) {
				vertex.addToIndex(this.v_idx);
			}
		}
	};
	GraphDatabase.prototype.loadEdges = function (rows) {
		var i, l, edge, hasEIndex = !Utils.isEmpty(this.e_idx);
		for(i = 0 , l = rows.length; i < l; i += 1) {
			edge = new Edge(rows[i], this);
			this.edges[edge.obj[this.meta.id]] = edge;
			this.associateVertices(edge);
			if(hasEIndex) {
				edge.addToIndex(this.e_idx);
			}
		}
	};
	GraphDatabase.prototype.createVIndex = function (idxName) {
		if(!(this.v_idx.hasOwnProperty(idxName))) {
			this.v_idx[idxName] = {
			};
			for(var k in this.vertices) {
				if(this.vertices.hasOwnProperty(k)) {
					this.vertices[k].addToIndex(this.v_idx, idxName);
				}
			}
		}
	};
	GraphDatabase.prototype.createEIndex = function (idxName) {
		if(!(this.e_idx.hasOwnProperty(idxName))) {
			this.e_idx[idxName] = {
			};
			for(var k in this.edges) {
				if(this.edges.hasOwnProperty(k)) {
					this.edges[k].addToIndex(this.e_idx, idxName);
				}
			}
		}
	};
	GraphDatabase.prototype.deleteVIndex = function (idxName) {
		delete this.v_idx[idxName];
	};
	GraphDatabase.prototype.deleteEIndex = function (idxName) {
		delete this.e_idx[idxName];
	};
	GraphDatabase.prototype.associateVertices = function (edge) {
		var vertex, outVobj = {
		}, inVobj = {
		};
		if(!edge.graph.vertices[edge.obj[edge.graph.meta.outVid]]) {
			outVobj[edge.graph.meta.id] = edge.obj[edge.graph.meta.outVid];
			edge.graph.vertices[edge.obj[edge.graph.meta.outVid]] = new Vertex(outVobj, edge.graph);
		}
		vertex = edge.graph.vertices[edge.obj[edge.graph.meta.outVid]];
		if(!vertex.outE[edge.obj[edge.graph.meta.label]]) {
			vertex.outE[edge.obj[edge.graph.meta.label]] = [];
		}
		edge.outV = vertex;
		edge.obj[edge.graph.meta.VOut] = edge.outV.obj[edge.graph.meta.id];
		delete edge.obj[edge.graph.meta.outVid];
		push.call(vertex.outE[edge.obj[edge.graph.meta.label]], edge);
		if(!edge.graph.vertices[edge.obj[edge.graph.meta.inVid]]) {
			inVobj[edge.graph.meta.id] = edge.obj[edge.graph.meta.inVid];
			edge.graph.vertices[edge.obj[edge.graph.meta.inVid]] = new Vertex(inVobj, edge.graph);
		}
		vertex = edge.graph.vertices[edge.obj[edge.graph.meta.inVid]];
		if(!vertex.inE[edge.obj[edge.graph.meta.label]]) {
			vertex.inE[edge.obj[edge.graph.meta.label]] = [];
		}
		edge.inV = vertex;
		edge.obj[edge.graph.meta.VIn] = edge.inV.obj[edge.graph.meta.id];
		delete edge.obj[edge.graph.meta.inVid];
		push.call(vertex.inE[edge.obj[edge.graph.meta.label]], edge);
	};
	GraphDatabase.prototype.loadGraphSON = function (jsonData) {
		var deferred = Q.defer();

		var graph = this;
		if(Utils.isUndefined(jsonData)) {
			throw new Error('No JSON data to load into Graph database.');
		}
		if(!!jsonData.graph) {
			jsonData = jsonData.graph;
		}
		if(!!jsonData.vertices) {
			this.loadVertices(jsonData.vertices);
		}
		if(!!jsonData.edges) {
			this.loadEdges(jsonData.edges);
		}

		deferred.resolve(graph);
		return deferred.promise;
	};
	GraphDatabase.prototype.loadGraphML = function (xmlData) {
		var _this = this;
		var i, j, l, propLen, xmlV = [], xmlE = [], vertex, edge, attr, vertex, edge, fileExt, xmlhttp, currProp, xmlDoc, properties, tempObj = {
		}, parser = sax.parser(true, {
			lowercase: true
		});
		var hasVIndex = !Utils.isEmpty(this.v_idx);
		var hasEIndex = !Utils.isEmpty(this.e_idx);
		parser.onerror = function (e) {
		};
		parser.ontext = function (t) {
			if(!!tempObj && (currProp in tempObj)) {
				tempObj[currProp] = t;
				currProp = undefined;
			}
		};
		parser.onopentag = function (node) {
			switch(node.name) {
				case 'node':
					attr = node.attributes;
					for(var k in attr) {
						if(attr.hasOwnProperty(k)) {
							switch(k) {
								case 'id':
									if(!!_this.vertices[attr[k]]) {
										tempObj = _this.vertices[attr[k]].obj;
									} else {
										tempObj[_this.meta.id] = attr[k];
									}
									break;
								default:
							}
						}
					}
					break;
				case 'edge':
					attr = node.attributes;
					for(var k in attr) {
						if(attr.hasOwnProperty(k)) {
							switch(k) {
								case 'id':
									tempObj[_this.meta.id] = attr[k];
									break;
								case 'label':
									tempObj[_this.meta.label] = attr[k];
									break;
								case 'source':
									tempObj[_this.meta.outVid] = attr[k];
									break;
								case 'target':
									tempObj[_this.meta.inVid] = attr[k];
									break;
								default:
							}
						}
					}
					break;
				case 'data':
					tempObj[node.attributes.key] = undefined;
					currProp = node.attributes.key;
					break;
				default:
			}
			_this;
		};
		parser.onclosetag = function (node) {
			switch(node) {
				case 'node':
					vertex = new Vertex(tempObj, _this);
					_this.vertices[tempObj[_this.meta.id]] = vertex;
					if(hasVIndex) {
						vertex.addToIndex(_this.v_idx);
					}
					tempObj = {
					};
					break;
				case 'edge':
					edge = new Edge(tempObj, _this);
					_this.edges[tempObj[_this.meta.id]] = edge;
					_this.associateVertices(edge);
					if(hasEIndex) {
						edge.addToIndex(_this.e_idx);
					}
					tempObj = {
					};
					break;
				default:
			}
		};
		parser.onend = function () {
			tempObj = {
			};
			currProp = undefined;
		};
		if(Utils.isUndefined(xmlData)) {
			return false;
		}

		return true;
	};
	GraphDatabase.prototype.v = function () {
		var args = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			args[_i] = arguments[_i + 0];
		}
		var pipe = [], l, temp, tempObj = {
		}, compObj = {
		}, outputObj = {
		}, subset = {
		}, tempObjArray = {
		}, preProcObj = {
		}, postProcObj = {
		}, tempObjArrLen = 0, isObject = false;
		if(!args.length) {
			return this._.startPipe(this.vertices);
		}
		args = Utils.flatten(args);
		l = args.length;
		isObject = Utils.isObject(args[0]);
		if(isObject && !((this.meta.id in args[0]) && (args[0][this.meta.id] in this.vertices) && (this.vertices[args[0][this.meta.id]].Type == 'Vertex'))) {
			for(var i = 0; i < l; i++) {
				compObj = args[i];
				preProcObj = {
				};
				postProcObj = {
				};
				for(var k in compObj) {
					if(compObj.hasOwnProperty(k)) {
						if(this.v_idx.hasOwnProperty(k)) {
							preProcObj[k] = compObj[k];
						} else {
							postProcObj[k] = compObj[k];
						}
					}
				}
				var item;
				for(var prop in preProcObj) {
					if(preProcObj.hasOwnProperty(prop)) {
						var items = this.v_idx[prop];
						for(var m in items) {
							if(items.hasOwnProperty(m)) {
								var funcObj = preProcObj[prop];
								for(var func in funcObj) {
									if(funcObj.hasOwnProperty(func)) {
										if(Utils.include([
											'$match',
											'$all'
										], func)) {
											item = items[m];
											for(var it in item) {
												if(item.hasOwnProperty(it)) {
													if(Mogwai.Compare[func].call(null, item[it].obj[prop], funcObj[func])) {
														tempObj[it] = item[it];
													}
												}
											}
										} else {
											if(Mogwai.Compare[func].call(null, m, funcObj[func])) {
												item = items[m];
												for(var it in item) {
													if(item.hasOwnProperty(it)) {
														tempObj[it] = item[it];
													}
												}
											}
										}
									}
								}
							}
						}
						if(!Utils.isEmpty(tempObj)) {
							push.call(tempObjArray, tempObj);
						}
					}
				}
				var pipeline;
				var postIsEmpty = Utils.isEmpty(postProcObj);
				tempObjArrLen = tempObjArray.length;
				if(!!tempObjArrLen) {
					if(tempObjArrLen == 1) {
						if(postIsEmpty) {
							outputObj = tempObjArray[0];
						} else {
							pipeline = this._.startPipe(tempObjArray[0]);
							tempObjArray = Mogwai.getEndPipe.call(pipeline.where(postProcObj));
						}
					} else {
						if(postIsEmpty) {
							outputObj = Utils.intersectElement(tempObjArray);
						} else {
							pipeline = this._.startPipe(Utils.intersectElement(tempObjArray));
							tempObjArray = Mogwai.getEndPipe.call(pipeline.where(postProcObj));
						}
					}
				} else {
					if(!postIsEmpty) {
						pipeline = this._.startPipe(this.vertices);
						tempObjArray = Mogwai.getEndPipe.call(pipeline.where(postProcObj));
					}
				}
				if(!postIsEmpty) {
					var id;
					for(var ind = 0, len = tempObjArray.length; ind < len; ind++) {
						id = tempObjArray[ind].obj[this.meta.id];
						outputObj[id] = tempObjArray[ind];
					}
				}
				tempObj = {
				};
				tempObjArray = [];
			}
			return this._.startPipe(outputObj);
		}
		for(var i = 0; i < l; i++) {
			temp = isObject ? this.vertices[args[i][this.meta.id]] : this.vertices[args[i]];
			if(typeof temp === "undefined") {
				throw new ReferenceError('No vertex with id ' + isObject ? args[i][this.meta.id] : args[i]);
			}
			push.call(pipe, temp);
		}
		return this._.startPipe(pipe);
	};
	GraphDatabase.prototype.V = GraphDatabase.prototype.v;
	GraphDatabase.prototype.e = function () {
		var args = [];
		for (var _i = 0; _i < (arguments.length - 0); _i++) {
			args[_i] = arguments[_i + 0];
		}
		var pipe = [], l, temp, tempObj = {
		}, compObj = {
		}, outputObj = {
		}, subset = {
		}, tempObjArray = [], preProcObj = {
		}, postProcObj = {
		}, tempObjArrLen = 0, isObject = false;
		if(!args.length) {
			return this._.startPipe(this.edges);
		}
		args = Utils.flatten(args);
		l = args.length;
		isObject = Utils.isObject(args[0]);
		if(isObject && !((this.meta.id in args[0]) && (args[0][this.meta.id] in this.edges) && (this.edges[args[0][this.meta.id]].Type == 'Edge'))) {
			for(var i = 0; i < l; i++) {
				compObj = args[i];
				preProcObj = {
				};
				postProcObj = {
				};
				for(var k in compObj) {
					if(compObj.hasOwnProperty(k)) {
						if(this.e_idx.hasOwnProperty(k)) {
							preProcObj[k] = compObj[k];
						} else {
							postProcObj[k] = compObj[k];
						}
					}
				}
				var item;
				for(var prop in preProcObj) {
					if(preProcObj.hasOwnProperty(prop)) {
						var items = this.e_idx[prop];
						for(var m in items) {
							if(items.hasOwnProperty(m)) {
								var funcObj = preProcObj[prop];
								for(var func in funcObj) {
									if(funcObj.hasOwnProperty(func)) {
										if(Utils.include([
											'$match',
											'$all'
										], func)) {
											item = items[m];
											for(var it in item) {
												if(item.hasOwnProperty(it)) {
													if(Mogwai.Compare[func].call(null, item[it].obj[prop], funcObj[func])) {
														tempObj[it] = item[it];
													}
												}
											}
										} else {
											if(Mogwai.Compare[func].call(null, m, funcObj[func])) {
												item = items[m];
												for(var it in item) {
													if(item.hasOwnProperty(it)) {
														tempObj[it] = item[it];
													}
												}
											}
										}
									}
								}
							}
						}
						if(!Utils.isEmpty(tempObj)) {
							tempObjArray.push(tempObj);
						}
					}
				}
				var pipeline;
				var postIsEmpty = Utils.isEmpty(postProcObj);
				tempObjArrLen = tempObjArray.length;
				if(!!tempObjArrLen) {
					if(tempObjArrLen == 1) {
						if(postIsEmpty) {
							outputObj = tempObjArray[0];
						} else {
							pipeline = this._.startPipe(tempObjArray[0]);
							tempObjArray = Mogwai.getEndPipe.call(pipeline.where(postProcObj));
						}
					} else {
						if(postIsEmpty) {
							outputObj = Utils.intersectElement(tempObjArray);
						} else {
							pipeline = this._.startPipe(Utils.intersectElement(tempObjArray));
							tempObjArray = Mogwai.getEndPipe.call(pipeline.where(postProcObj));
						}
					}
				} else {
					if(!postIsEmpty) {
						pipeline = this._.startPipe(this.edges);
						tempObjArray = Mogwai.getEndPipe.call(pipeline.where(postProcObj));
					}
				}
				if(!postIsEmpty) {
					var id;
					for(var ind = 0, len = tempObjArray.length; ind < len; ind++) {
						id = tempObjArray[ind].obj[this.meta.id];
						outputObj[id] = tempObjArray[ind];
					}
				}
				tempObj = {
				};
				tempObjArray = [];
			}
			return this._.startPipe(outputObj);
		}
		for(var i = 0; i < l; i++) {
			temp = isObject ? this.edges[args[i][this.meta.id]] : this.edges[args[i]];
			if(typeof temp === "undefined") {
				throw new ReferenceError('No edge with id ' + isObject ? args[i][this.meta.id] : args[i]);
			}
			push.call(pipe, temp);
		}
		return this._.startPipe(pipe);
	};
	GraphDatabase.prototype.E = GraphDatabase.prototype.e;

	return GraphDatabase;
})();

module.exports = GraphDatabase;