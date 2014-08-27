module.exports = (function () {
	var toString = Object.prototype.toString, ArrayProto = Array.prototype, push = ArrayProto.push, slice = ArrayProto.slice, indexOf = ArrayProto.indexOf;

	function Utils() { }
	Utils.validNumeric = /^\$?\-?([1-9]{1}[0-9]{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(?:\.\d{0,2})?|0(?:\.\d{0,2})?|(?:\.\d{1,2}))$|^\-?\$?(?:[1-9]{1}\d{0,2}(?:\,\d{3})*(?:\.\d{0,2})?|[1-9]{1}\d{0,}(?:\.\d{0,2})?|0(?:\.\d{0,2})?|(?:\.\d{1,2}))$|^\(\$?(?:[1-9]{1}\d{0,2}(?:\,\d{3})*(?:\.\d{0,2})?|[1-9]{1}\d{0,}(?:\.\d{0,2})?|0(?:\.\d{0,2})?|(?:\.\d{1,2}))\)$/;
	Utils.toArray = function toArray(o) {
		var k, r = [];
		for(k in o) {
			if(o.hasOwnProperty(k)) {
				r.push(o[k]);
			}
		}
		return r;
	};
	Utils.each = function each(array, func, context) {
		var i, len, val;
		if(Utils.isArray(array)) {
			len = array.length;
			for(i = 0; i < len; i += 1) {
				val = array[i];
				func.call(context, val);
			}
		} else {
			for(i in array) {
				if(array.hasOwnProperty(i)) {
					val = array[i];
					func.call(context, val);
				}
			}
		}
	};
	Utils.intersection = function intersection(arr1, arr2) {
		var r = [], o = {
		}, i, comp;
		for(i = 0; i < arr2.length; i += 1) {
			o[arr2[i]] = true;
		}
		for(i = 0; i < arr1.length; i += 1) {
			comp = arr1[i];
			if(!!o[comp]) {
				r.push(arr1[i]);
			}
		}
		return r;
	};
	Utils.intersectElement = function intersectElement(elements) {
		var o, outputObj = {
		}, compObj;
		elements = Utils.flatten(elements);
		compObj = elements[0];
		for(var i = 1, l = elements.length; i < l; i++) {
			o = {
			};
			for(var k in elements[i]) {
				if(elements[i].hasOwnProperty(k)) {
					o[k] = true;
				}
			}
			for(var h in compObj) {
				if(!!o[h]) {
					outputObj[h] = compObj[h];
				}
			}
			if(Utils.isEmpty(outputObj)) {
				return {
				};
			}
			compObj = outputObj;
		}
		return outputObj;
	};
	Utils.difference = function difference(arr1, arr2) {
		var r = [], o = {
		}, i, comp;
		for(i = 0; i < arr2.length; i += 1) {
			o[arr2[i]] = true;
		}
		for(i = 0; i < arr1.length; i += 1) {
			comp = arr1[i];
			if(!o[comp]) {
				r.push(arr1[i]);
			}
		}
		return r;
	};
	Utils.diffElement = function diffElement(arr1, arr2) {
		var r = [], o = {
		}, i, comp;
		for(i = 0; i < arr2.length; i += 1) {
			o[arr2[i].obj[arr2[i].graph.meta.id]] = true;
		}
		for(i = 0; i < arr1.length; i += 1) {
			comp = arr1[i].obj[arr1[i].graph.meta.id];
			if(!o[comp]) {
				r.push(arr1[i]);
			}
		}
		return r;
	};
	Utils.unique = function unique(array) {
		var o = {
		}, i, k, l = array.length, r = [];
		for(i = 0; i < l; i += 1) {
			o[array[i]] = array[i];
		}
		for(k in o) {
			if(o.hasOwnProperty(k)) {
				r.push(o[k]);
			}
		}
		return r;
	};
	Utils.uniqueRow = function uniqueRow(arrays, step) {
		var o = {
		}, i, j, k, l = arrays.length, r = [];
		var prop;
		for(i = 0; i < l; i++) {
			prop = "";
			for(j = 0; j < step; j++) {
				prop += arrays[i][j].obj[arrays[i][j].graph.meta.id] + ",";
			}
			o[prop] = arrays[i].slice(0, step);
		}
		for(k in o) {
			if(o.hasOwnProperty(k)) {
				r.push(o[k]);
			}
		}
		return r;
	};
	Utils.uniqueElement = function uniqueElement(array) {
		var o = {
		}, i, l = array.length, r = [];
		for(i = 0; i < l; i += 1) {
			o[array[i].obj[array[i].graph.meta.id]] = array[i];
		}
		for(i in o) {
			if(o.hasOwnProperty(i)) {
				r.push(o[i]);
			}
		}
		return r;
	};
	Utils.findInstances = function findInstances(array, instances) {
		var o = {
		}, id, i, l = array.length, r = [];
		for(i = 0; i < l; i += 1) {
			id = array[i].obj[array[i].graph.meta.id];
			o[id] = array[i];
			('count' in o[id]) ? o[id].count++ : o[id].count = 1;
		}
		for(i in o) {
			if(o.hasOwnProperty(i)) {
				if(o[i].count == instances) {
					r.push(o[i]);
				}
				delete o[i].count;
			}
		}
		return r;
	};
	Utils.include = function include(array, i) {
		return indexOf.call(array, i) === -1 ? false : true;
	};
	Utils.keys = function keys(o) {
		var k, r = [];
		for(k in o) {
			if(o.hasOwnProperty(k)) {
				r.push(k);
			}
		}
		return r;
	};
	Utils.values = function values(o) {
		return Utils.toArray(o);
	};
	Utils.funcBody = function funcBody(closure) {
		return "it = " + closure + "; return it;";
	};
	Utils.pick = function pick(o, props) {
		var props = Utils.flatten(props), i = props.length, result = {
		}, tempObj, tempProp;
		while(i) {
			i -= 1;
			tempProp = props[i];
			tempObj = o;
			if(tempProp.indexOf(".") > -1) {
				tempObj = Utils.embeddedObject(o, tempProp);
				tempProp = tempProp.split(".").slice(-1)[0];
			}
			if(tempObj.hasOwnProperty(tempProp)) {
				result[tempProp] = tempObj[tempProp];
			}
		}
		return result;
	};
	Utils.pluck = function pluck(objs, prop) {
		var o, i = objs.length, tempObj, tempProp = prop, result = [], isElement = false, isEmbedded = false;
		if(!!i) {
			isElement = !!objs[0].obj;
		}
		if(prop.indexOf(".") > -1) {
			isEmbedded = true;
			tempProp = prop.split(".").slice(-1)[0];
		}
		while(i) {
			i -= 1;
			o = isElement ? objs[i].obj : objs[i];
			tempObj = isEmbedded ? Utils.embeddedObject(o, prop) : o;
			if(tempObj.hasOwnProperty(tempProp)) {
				push.call(result, tempObj[tempProp]);
			}
		}
		return result;
	};
	Utils.toHash = function toHash(array) {
		var id, i, len = array.length, result = {
		}, o = {
		};
		if(!!len) {
			id = array[0].graph.meta.id;
			for(i = 0; i < len; i += 1) {
				o = array[i].obj;
				result[o[id]] = o;
			}
		}
		return result;
	};
	Utils.toObjArray = function toObjArray(array) {
		var i, l = array.length, result = [];
		for(i = 0; i < l; i += 1) {
			result.push(array[i].obj);
		}
		return result;
	};
	Utils.toPathArray = function toPathArray(array, steps) {
		var i, l = array.length, result = [];
		for(i = 0; i < l; i += 1) {
			if(!steps[i + 1].exclFromPath) {
				result.push(Utils.isElement(array[i]) ? array[i].obj : array[i]);
			}
		}
		return result;
	};
	Utils.materializeElementArray = function materializeElementArray(array, db, type) {
		var i, l = array.length, result = [], elements = type == "Vertex" ? db.vertices : db.edges, isObjArray = false;
		if(!!l) {
			isObjArray = Utils.isObject(array[0]);
		}
		for(i = 0; i < l; i += 1) {
			result.push(isObjArray ? elements[array[i][db.meta.id]] : elements[array[i]]);
		}
		return result;
	};
	Utils.flatten = function flatten(array, shallow) {
		if (typeof shallow === "undefined") { shallow = false; }
		var result = [], value, index = -1, length;
		if(!array) {
			return result;
		}
		length = array.length;
		while((index += 1) < length) {
			value = array[index];
			if(Utils.isArray(value)) {
				push.apply(result, shallow ? value : Utils.flatten(value));
			} else {
				result.push(value);
			}
		}
		return result;
	};
	Utils.embeddedObject = function embeddedObject(o, prop) {
		var props = prop.indexOf(".") > -1 ? prop.split(".") : [
			prop
		], l = props.length, lastProp = props[l - 1], currentProp;
		for(var i = 0; i < l; i++) {
			if(o.hasOwnProperty(props[i])) {
				currentProp = props[i];
				if(!Utils.isObject(o[currentProp])) {
					break;
				}
				o = o[currentProp];
			}
		}
		if(currentProp != lastProp) {
			o = {
			};
		}
		return o;
	};
	Utils.merge = function merge(obj1, obj2) {
		for(var p in obj2) {
			try  {
				if(obj1.hasOwnProperty(p)) {
					obj1[p] = Utils.merge(obj1[p], obj2[p]);
				} else {
					obj1[p] = obj2[p];
				}
			} catch (e) {
				obj1[p] = obj2[p];
			}
		}
		return obj1;
	};
	Utils.isArray = function isArray(o) {
		return toString.call(o) === '[object Array]';
	};
	Utils.isString = function isString(o) {
		return toString.call(o) === '[object String]';
	};
	Utils.isNumber = function isNumber(o) {
		return toString.call(o) === '[object Number]';
	};
	Utils.isBoolean = function isBoolean(o) {
		return toString.call(Utils.parseBoolean(o)) === '[object Boolean]';
	};
	Utils.isObject = function isObject(o) {
		return toString.call(o) === '[object Object]';
	};
	Utils.isEmpty = function isEmpty(o) {
		var key;
		if(!o) {
			return true;
		}
		for(key in o) {
			if(o.hasOwnProperty(key)) {
				return !o[key];
			}
		}
		return true;
	};
	Utils.isFunction = function isFunction(o) {
		return toString.call(o) === '[object Function]';
	};
	Utils.isNull = function isNull(o) {
		return toString.call(o) === '[object Null]';
	};
	Utils.isUndefined = function isUndefined(o) {
		return toString.call(o) === '[object Undefined]';
	};
	Utils.isElement = function isElement(o) {
		return o.hasOwnProperty('obj');
	};
	Utils.isDate = function isDate(o) {
		return Utils.isString(o) && !(new Date(o).toString() === 'Invalid Date');
	};
	Utils.isMoney = function isMoney(val) {
		if(Utils.validNumeric.exec(val) != null) {
			return Utils.validNumeric.exec(val)[0].length === Utils.validNumeric.exec(val)[1].length;
		}
		return false;
	};
	Utils.parseNumber = function parseNumber(val) {
		var numResult = Utils.validNumeric.exec(val);
		if(numResult != null) {
			return parseFloat(numResult[1]);
		}
		return val;
	};
	Utils.parseBoolean = function parseBoolean(val) {
		if(Utils.isString(val)) {
			if(val.toLowerCase() === 'true') {
				return true;
			}
			if(val.toLowerCase() === 'false') {
				return false;
			}
		}
		return val;
	};
	Utils.parseValue = function parseValue(val) {
		var numResult = Utils.validNumeric.exec(val);
		if(numResult != null) {
			if(!!numResult[2]) {
				return parseFloat(numResult[1].replace(numResult[2].charAt(0), ''));
			}
			return parseFloat(numResult[1]);
		}
		if(Utils.isBoolean(val)) {
			return Utils.parseBoolean(val);
		}
		if(Utils.isDate(val)) {
			return Date.parse(val);
		}
		return val;
	};
	Utils.dynamicSort = function dynamicSort(property, modifier) {
		if (typeof modifier === "undefined") { modifier = 'default'; }
		var sortOrder = 1, tempProp, isEmbedded = property.indexOf(".") > -1, modifier;
		if(property[0] === "-") {
			sortOrder = -1;
			property = property.slice(1);
		}
		tempProp = isEmbedded ? property.split(".").slice(-1)[0] : property;
		return function (a, b) {
			var result, tempObjA, tempObjB, objA, objB, isAElement = Utils.isElement(a), isAObject = Utils.isObject(a), isBElement = Utils.isElement(b), isBObject = Utils.isObject(b);
			objA = isAElement ? a.obj : a;
			objB = isBElement ? b.obj : b;
			tempObjA = isEmbedded ? Utils.embeddedObject(objA, property) : objA;
			tempObjB = isEmbedded ? Utils.embeddedObject(objB, property) : objB;
			if((isAElement && isBElement) || (isAObject && isBObject)) {
				if(!(tempProp in tempObjA)) {
					if(!(tempProp in tempObjB)) {
						return 0;
					}
					return 1 * sortOrder;
				}
				if(!(tempProp in tempObjB)) {
					return -1 * sortOrder;
				}
			}
			switch(modifier) {
				case 'case-i':
					result = (tempObjA[tempProp].toUpperCase() < tempObjB[tempProp].toUpperCase()) ? -1 : (tempObjA[tempProp].toUpperCase() > tempObjB[tempProp].toUpperCase()) ? 1 : 0;
					break;
				case 'case-s':
					result = (tempObjA[tempProp] < tempObjB[tempProp]) ? -1 : (tempObjA[tempProp] > tempObjB[tempProp]) ? 1 : 0;
					break;
				default:
					result = (Utils.parseValue(tempObjA[tempProp]) < Utils.parseValue(tempObjB[tempProp])) ? -1 : (Utils.parseValue(tempObjA[tempProp]) > Utils.parseValue(tempObjB[tempProp])) ? 1 : 0;
			}
			return result * sortOrder;
		};
	};
	Utils.dynamicSortMultiple = function dynamicSortMultiple(props) {
		return function (obj1, obj2) {
			var i = 0, result = 0, numberOfProperties = props.length, prop, modifier;
			while(result === 0 && i < numberOfProperties) {
				if(Utils.isObject(props[i])) {
					prop = Utils.keys(props[i])[0];
					modifier = props[i][prop];
					result = Utils.dynamicSort(prop, modifier)(obj1, obj2);
				} else {
					result = Utils.dynamicSort(props[i])(obj1, obj2);
				}
				i++;
			}
			return result;
		};
	};
	Utils.defaultSort = function defaultSort(obj1, obj2) {
		return (Utils.parseValue(obj1) < Utils.parseValue(obj2)) ? -1 : (Utils.parseValue(obj1) > Utils.parseValue(obj2)) ? 1 : 0;
	};
	return Utils;
})();
