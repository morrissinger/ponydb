"use strict";

/* Third party libraries. */
var Q = require('q'),
	sax = require('sax'),
	Utils = require('./lib/utils.js');

/* Our Modules */
var Element = require('./lib/element.js'),
	Vertex = require('./lib/vertex.js'),
	Edge = require('./lib/edge.js'),
	GraphDatabase = require('./lib/graphdatabase.js'),
	Mogwai = require('./lib/mogwai.js');

var PonyDB = {
	Element: Element,
	Vertex: Vertex,
	Edge: Edge,
	GraphDatabase: GraphDatabase,
	Mogwai: Mogwai
};

module.exports = PonyDB;
