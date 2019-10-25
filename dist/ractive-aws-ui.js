(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("ractive"));
	else if(typeof define === 'function' && define.amd)
		define("aws-ui", ["ractive"], factory);
	else if(typeof exports === 'object')
		exports["aws-ui"] = factory(require("ractive"));
	else
		root["aws-ui"] = factory(root["Ractive"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__0__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ractive = __webpack_require__(0);

var _ractive2 = _interopRequireDefault(_ractive);

var _ractiveDynamodbUi = __webpack_require__(2);

var _ractiveDynamodbUi2 = _interopRequireDefault(_ractiveDynamodbUi);

var _ractiveCloudformationUi = __webpack_require__(4);

var _ractiveCloudformationUi2 = _interopRequireDefault(_ractiveCloudformationUi);

var _header = __webpack_require__(3);

var _header2 = _interopRequireDefault(_header);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _ractive2.default.extend({
	template: { v: 4, t: [{ t: 7, e: "WindowHost" }, " ", { t: 7, e: "header", m: [{ n: "region", f: [{ t: 2, r: "region" }], t: 13 }] }, " ", { t: 7, e: "div", m: [{ t: 13, n: "style", f: "position: absolute;top: 42px;left:0px;right:0px;bottom:0px;overflow:hidden;", g: 1 }], f: [{ t: 4, f: [{ t: 7, e: "dynamodbui", m: [{ n: "region", f: [{ t: 2, r: "region" }], t: 13 }, { n: "accessKeyId", f: "myKeyId", t: 13, g: 1 }, { n: "secretAccessKey", f: "y", t: 13, g: 1 }, { n: "endpoint", f: [{ t: 2, r: "dynamodb_endpoint" }], t: 13 }, { n: "cwendpoint", f: [{ t: 2, r: "cloudwatch_endpoint" }], t: 13 }] }], n: 50, x: { r: ["service"], s: "_0===\"dynamodb\"" } }, " ", { t: 4, f: [{ t: 7, e: "cloudformationui", m: [{ n: "region", f: [{ t: 2, r: "region" }], t: 13 }, { n: "accessKeyId", f: "myKeyId", t: 13, g: 1 }, { n: "secretAccessKey", f: "y", t: 13, g: 1 }, { n: "endpoint", f: [{ t: 2, r: "cloudformation_endpoint" }], t: 13 }] }], n: 50, x: { r: ["service"], s: "_0===\"cloudformation\"" } }] }], e: { "_0===\"dynamodb\"": function _0Dynamodb(_0) {
				return _0 === "dynamodb";
			}, "_0===\"cloudformation\"": function _0Cloudformation(_0) {
				return _0 === "cloudformation";
			} } },
	components: {
		dynamodbui: _ractiveDynamodbUi2.default,
		cloudformationui: _ractiveCloudformationUi2.default,
		header: _header2.default,

		Window: RactiveWindow.default.Window,
		WindowHost: RactiveWindow.default.WindowHost
	},
	css: " header {position: absolute;top: 0px;left: 0px;right: 0px;height: 41px;} header .region-dropdown {} header .region-dropdown > a {display: inline-block;line-height: 40px;font-size: 12px;margin: 0px 20px 0px 0px;cursor: pointer;color: #eee;} header .region-dropdown > .dropdown-menu > li > a {text-decoration: none;} header .services-dropdown {} header .services-dropdown > a {display: inline-block;line-height: 40px;font-size: 14px;font-weight: bold;margin: 0px 20px 0px 0px;cursor: pointer;color: #eee;} header .services-dropdown > .dropdown-menu > li > a {text-decoration: none;} body.theme_light header {background-color: #232f3e; }",

	data: function data() {
		return {
			region: this.deparam(location.href).region || 'us-east-1',

			dynamodb_endpoint: location.protocol + '//' + location.host + '/v1/dynamodb', // https://djaorxfotj9hr.cloudfront.net/v1/dynamodb
			cloudwatch_endpoint: location.protocol + '//' + location.host + '/v1/cloudwatch', // https://djaorxfotj9hr.cloudfront.net/v1/cloudwatch

			cloudformation_endpoint: location.protocol + '//' + location.host + '/v1/cloudformation' // https://djaorxfotj9hr.cloudfront.net/v1/cloudformation
		};
	},

	deparam: function (d, x, params, pair, i) {
		return function (qs) {
			params = {};
			qs = qs.substring(qs.indexOf('?') + 1).replace(x, ' ').split('&');
			for (i = qs.length; i > 0;) {
				pair = qs[--i].split('=');
				params[d(pair[0])] = d(pair[1]);
			}
			return params;
		}; //--  fn  deparam
	}(decodeURIComponent, /\+/g),

	on: {
		init: function init() {
			console.log("deparam", this.deparam(location.href));
		}
	}

});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory(__webpack_require__(0));
	else {}
})(window, function(__WEBPACK_EXTERNAL_MODULE__22__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 42);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var freeGlobal = __webpack_require__(27);

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsNative = __webpack_require__(70),
    getValue = __webpack_require__(75);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var listCacheClear = __webpack_require__(60),
    listCacheDelete = __webpack_require__(61),
    listCacheGet = __webpack_require__(62),
    listCacheHas = __webpack_require__(63),
    listCacheSet = __webpack_require__(64);

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var eq = __webpack_require__(25);

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(12),
    getRawTag = __webpack_require__(71),
    objectToString = __webpack_require__(72);

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(1);

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var isKeyable = __webpack_require__(85);

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var assignValue = __webpack_require__(29),
    baseAssignValue = __webpack_require__(30);

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

module.exports = copyObject;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Ractive.extend({
	isolated: true,
	template: "\
		<div class='tabledata' style='{{style}}'>\
			<div class='tabledatahead'>\
				{{#columns:i}}\
					<div style='width: {{#if i === 0}}22px{{else}}{{100/columns.length}}%{{/if}} '>{{.}}</div>\
				{{/columns}}\
			</div>\
			<div class='tabledatacontent'>\
		\
				{{#if rows.length === 0}}\
					<br><small>Empty</small>\
				{{/if}}\
				{{#if rows === null }}\
					<br><small>Loading...</small>\
				{{/if}}\
		\
				{{#rows:row}}\
				<div class='tabledatarow {{#if .[0].selected}}selected{{/if}}' on-click='selectrow'>\
					{{#each .:i}}\
					<div class='tabledatacell\
						{{#if .KEY}}t-K{{/if}}\
						{{#if .HASH}}t-HASH{{/if}}\
						{{#if .S}}t-S{{/if}}\
						{{#if .N}}t-N{{/if}}\
						{{#if .BOOL}}t-BOOL{{/if}}\
						{{#if .NULL}}t-NULL{{/if}}\
						{{#if .L}}t-L{{/if}}\
						{{#if .M}}t-M{{/if}}\
						{{#if .U}}t-U{{/if}}\
						' style='width: {{#if i === 0}}22px{{else}}{{100/columns.length}}%{{/if}} '\
						{{#if .HASH}}on-click='cellclick'{{/if}}\
						>\
						{{#if .KEY}}\
							{{#if .selected}}\
								<i class='zmdi selectrow zmdi-hc-fw zmdi-check-square'></i>\
							{{else}}\
								<i class='zmdi selectrow zmdi-hc-fw zmdi-square-o'></i>\
							{{/if}}\
						{{/if}}\
						{{#if .HASH}}<a>{{.HASH}}</a>{{/if}}\
						{{#if .S}}{{.S}}{{/if}}\
						{{#if .N}}{{.N}}{{else}}{{#if .N === 0}}0{{/if}}{{/if}}\
						{{#if .BOOL}}{{.BOOL}}{{/if}}\
						{{#if .NULL}}NULL{{/if}}\
						{{#if .L}}[...]{{/if}}\
						{{#if .M}}{...}{{/if}}\
					</div>\
					{{/each}}\
				</div>\
				{{/rows}}\
			</div>\
		</div>",

	data: function data() {
		return {};
	},
	oninit: function oninit() {
		this.on('cellclick', function (e) {
			var col = this.get(e.resolve());
			//console.log("cellclick", e.resolve(), " = ",this.get( e.resolve())  )
			//console.log( this.get(e.resolve().split('.').slice(0,-1).join('.')) )
			this.fire('colclick', undefined, col.item, col.raw);
		});
	}
});

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(1),
    root = __webpack_require__(0);

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(0);

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(31),
    baseKeys = __webpack_require__(99),
    isArrayLike = __webpack_require__(35);

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;


/***/ }),
/* 14 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 16 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var freeGlobal = __webpack_require__(27);

/** Detect free variable `exports`. */
var freeExports =   true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(15)(module)))

/***/ }),
/* 18 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var arrayFilter = __webpack_require__(107),
    stubArray = __webpack_require__(37);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

module.exports = getSymbols;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var DataView = __webpack_require__(111),
    Map = __webpack_require__(11),
    Promise = __webpack_require__(112),
    Set = __webpack_require__(113),
    WeakMap = __webpack_require__(114),
    baseGetTag = __webpack_require__(6),
    toSource = __webpack_require__(28);

/** `Object#toString` result references. */
var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';

var dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
    (Map && getTag(new Map) != mapTag) ||
    (Promise && getTag(Promise.resolve()) != promiseTag) ||
    (Set && getTag(new Set) != setTag) ||
    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag;
        case mapCtorString: return mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag;
        case weakMapCtorString: return weakMapTag;
      }
    }
    return result;
  };
}

module.exports = getTag;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

var Uint8Array = __webpack_require__(117);

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__22__;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

!function(t,e){ true?module.exports=e(__webpack_require__(22)):undefined}(window,function(n){return(i={},r.m=o=[function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:"\n\t\t<tr>\n\t\t\t<td>\n\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea' ></button>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu' ></button>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ level * 24 }}px;'>\n\t\t\t\t\t<tbody>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-invisible' ></button>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>{{key}} </div>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\x3c!-- <td class='jsoneditor-datatype'>String</td> --\x3e\n\t\t\t\t\t\t\t<td class='jsoneditor-separator'>:</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree' style='width: 100%;'>\n\t\t\t\t\t\t\t\t{{#if editing}}\n\t\t\t\t\t\t\t\t\t<textarea class='jsoneditor-input jsoneditor-string' style='height: {{textarea_height}}px;line-height: {{line_height}}px' on-focus='focus' on-blur='blur' on-keyup='keyup' value='{{value}}'></textarea>\n\t\t\t\t\t\t\t\t{{else}}\n\t\t\t\t\t\t\t\t\t<input class='jsoneditor-input jsoneditor-string' value='{{ JSON.stringify(value) }}' readonly='true' on-click='startEditing' />\n\t\t\t\t\t\t\t\t\t\x3c!--<div class='jsoneditor-value jsoneditor-string' style='cursor: pointer;height: {{line_height}}px;line-height: {{line_height}}px;overflow: hidden;' on-click='startEditing'>{{ JSON.stringify(value) }}</div>--\x3e\n\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t</tbody>\n\t\t\t\t</table>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t\t</button>\n\t\t\t</td>\n\t\t</tr>\n\t\t",data:function(){return{line_height:22,textarea_height:22}},on:{startEditing:function(t){var e=t.node.parentNode;this.set("editing",!0),e.getElementsByTagName("textarea").length&&e.getElementsByTagName("textarea")[0].focus()},focus:function(){var t=this.get("value").split("\n").length;this.set("textarea_height",t*this.get("line_height"))},blur:function(){this.set("editing",!1)},keyup:function(){var t=this.get("value").split("\n").length;this.set("textarea_height",t*this.get("line_height"))},delete:function(){this.parent.delete_key(this.get("key"))}}})},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:"\n\t<tr>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea' ></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu' ></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ level * 24 }}px;'>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-invisible' ></button>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>{{key}}</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\x3c!--<td class='jsoneditor-datatype'>Number</td>--\x3e\n\t\t\t\t\t\t<td class='jsoneditor-separator'>:</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree' style='width: 100%;'>\n\t\t\t\t\t\t\t<input type='number' value='{{mirror_value}}' class='jsoneditor-input jsoneditor-number'  />\n\t\t\t\t\t\t\t\x3c!--\n\t\t\t\t\t\t\t<div contenteditable='true' spellcheck='false' class='jsoneditor-value jsoneditor-number' >{{ value }}</div>\n\t\t\t\t\t\t\t--\x3e\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n\t\t</td>\n\t\t<td>\n\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t</button>\n\t\t</td>\n\t</tr>\n\t",data:function(){return{mirror_value:""}},on:{delete:function(){this.parent.delete_key(this.get("key"))},init:function(){var t=this.get("value");this.set("mirror_value",t),this.observe("mirror_value",function(t,e,n){this.set({value:parseFloat(t)?t.toString():""})})}}})},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:"\n\t<tr>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea' ></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu' ></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ level * 24 }}px;'>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-invisible' ></button>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>{{key}}</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-datatype'>Binary</td>\n\t\t\t\t\t\t<td class='jsoneditor-separator'>:</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree' style='width: 100%;'>\n\t\t\t\t\t\t\t<input value='{{updated_value}}' class='jsoneditor-input jsoneditor-binary' />\n\t\t\t\t\t\t\t\x3c!--\n\t\t\t\t\t\t\t<div contenteditable='true' spellcheck='false' class='jsoneditor-value jsoneditor-binary' >{{ updated_value }}</div>\n\t\t\t\t\t\t\t--\x3e\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n\t\t</td>\n\t\t<td>\n\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t</button>\n\t\t</td>\n\t</tr>\n\t",data:function(){return{updated_value:""}},on:{init:function(){var r=this.get("value");"string"==typeof r&&(this.set({updated_value:JSON.parse(JSON.stringify(r))}),r=Uint8Array.from(atob(r),function(t){return t.charCodeAt(0)}),this.set({value:r})),r instanceof Uint8Array&&this.set({updated_value:btoa(String.fromCharCode.apply(null,r))}),this.observe("updated_value",function(t,e,n){if(console.log("changed",t,e),"string"==typeof r)return this.set("value",t);try{var o=Uint8Array.from(atob(t),function(t){return t.charCodeAt(0)});this.set({value:o}),console.log(o)}catch(t){}})},delete:function(){this.parent.delete_key(this.get("key"))}}})},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:"\n\t<tr>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea' ></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu' ></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ level * 24 }}px;'>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-invisible' ></button>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>{{key}}</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\x3c!--<td class='jsoneditor-datatype'>Boolean</td> --\x3e\n\t\t\t\t\t\t<td class='jsoneditor-separator'>:</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree' style='width: 100%;'>\n\t\t\t\t\t\t\t<input value='{{value}}' class='jsoneditor-input jsoneditor-boolean {{#if (value !== true ) && (value !== false) }}error{{/if}}' on-keyup='validate' on-blur='validate' />\n\t\t\t\t\t\t\t\x3c!--\n\t\t\t\t\t\t\t<div contenteditable='true' spellcheck='false' class='jsoneditor-value jsoneditor-boolean' >{{ value ? true : false }}</div>\n\t\t\t\t\t\t\t--\x3e\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n\t\t</td>\n\t\t<td>\n\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t</button>\n\t\t</td>\n\t</tr>\n\t",on:{init:function(){},validate:function(){"true"===this.get("value")&&this.set("value",!0),"false"===this.get("value")&&this.set("value",!1)},delete:function(){this.parent.delete_key(this.get("key"))}}})},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:"\n\t<tr>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea' ></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu' ></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ level * 24 }}px;'>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-invisible' ></button>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>{{key}}</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\x3c!--<td class='jsoneditor-datatype'>Null</td>--\x3e\n\t\t\t\t\t\t<td class='jsoneditor-separator'>:</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div class='jsoneditor-input jsoneditor-null' >null</div>\n\t\t\t\t\t\t\t\x3c!--<div class='jsoneditor-value jsoneditor-null' >null</div>--\x3e\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n\t\t</td>\n\t\t<td>\n\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t</button>\n\t\t</td>\n\t</tr>\n\t",on:{delete:function(){this.parent.delete_key(this.get("key"))}}})},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o,r=n(0),i=(o=r)&&o.__esModule?o:{default:o};e.default=Ractive.extend({components:{S:i.default},template:"\n\n\t<tr class=' jsoneditor-expandable'>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea'></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu'></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ level * 24 }}px;'>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button {{#if open}}jsoneditor-expanded{{else}}jsoneditor-collapsed{{/if}}' on-click='@this.toggle('open')'></button>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>{{key}}</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-datatype'>StringSet[{{ value.length }}]</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'></td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div class='jsoneditor-value jsoneditor-array'></div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n\t\t</td>\n\t\t<td>\n\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t</button>\n\t\t</td>\n\t</tr>\n\n\t{{#if open}}\n\t<tr class='jsoneditor-appender'>\n\t\t<td></td><td></td><td>\n\t\t\t<div style='margin-left: {{ 24 * level + 40 }}px;' on-click='prepend'></div>\n\t\t</td><td></td>\n\t</tr>\n\t{{#value}}\n\t\t<S key={{@index}} value={{ . }} level='{{ level + 1 }}' />\n\t\t<tr class='jsoneditor-appender'>\n\t\t\t<td></td><td></td><td>\n\t\t\t\t<div style='margin-left: {{ 24 * level + 40 }}px;' on-click='elementinsert'></div>\n\t\t\t</td><td></td>\n\t\t</tr>\n\t{{/value}}\n\t{{/if}}\n\n\t<tr class='jsoneditor-append'></tr>\n\n\t",delete_key:function(o){var t=this.get("value");t=t.filter(function(t,e,n){return e!==o}),this.set({value:t})},data:function(){return{open:!1}},on:{delete:function(){this.parent.delete_key(this.get("key"))},prepend:function(){var t=this.get("value");t=[""].concat(t),this.set({value:t})},elementinsert:function(t){var e=this.get("value"),n=parseInt(t.resolve().split(".").pop());e.splice(n+1,0,""),this.set({value:e})}}})},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o,r=n(1),i=(o=r)&&o.__esModule?o:{default:o};e.default=Ractive.extend({components:{N:i.default},template:"\n\n\t<tr class=' jsoneditor-expandable'>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea'></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu'></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ level * 24 }}px;'>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button {{#if open}}jsoneditor-expanded{{else}}jsoneditor-collapsed{{/if}}' on-click='@this.toggle('open')'></button>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>{{key}}</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-datatype'>NumberSet[{{ value.length }}]</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'></td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div class='jsoneditor-value jsoneditor-array'></div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n\t\t</td>\n\t\t<td>\n\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t</button>\n\t\t</td>\n\t</tr>\n\n\t{{#if open}}\n\t<tr class='jsoneditor-appender'>\n\t\t<td></td><td></td><td>\n\t\t\t<div style='margin-left: {{ 24 * level + 40 }}px;' on-click='prepend'></div>\n\t\t</td><td></td>\n\t</tr>\n\t{{#value}}\n\t\t{{#if !hide}}\n\t\t<N key={{@index}} value={{ . }} level='{{ level + 1 }}' />\n\t\t<tr class='jsoneditor-appender'>\n\t\t\t<td></td><td></td><td>\n\t\t\t\t<div style='margin-left: {{ 24 * level + 40 }}px;' on-click='elementinsert'></div>\n\t\t\t</td><td></td>\n\t\t</tr>\n\t\t{{/if}}\n\t{{/value}}\n\t{{/if}}\n\n\t<tr class='jsoneditor-append'></tr>\n\n\t",delete_key:function(o){var t=this.get("value");t=t.filter(function(t,e,n){return e!==o}),this.set({value:t})},data:function(){return{open:!1,hide:!1}},on:{delete:function(){this.parent.delete_key(this.get("key"))},prepend:function(){var t=this.get("value");t=[""].concat(t),this.set({value:t}),this.set("hide",!0),this.set("hide",!1)},elementinsert:function(t){var e=this.get("value"),n=parseInt(t.resolve().split(".").pop());e.splice(n+1,0,""),this.set({value:e}),this.set("hide",!0),this.set("hide",!1)}}})},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o,r=n(2),i=(o=r)&&o.__esModule?o:{default:o};e.default=Ractive.extend({components:{B:i.default},template:"\n\n\t<tr class=' jsoneditor-expandable'>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea'></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu'></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ level * 24 }}px;'>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button {{#if open}}jsoneditor-expanded{{else}}jsoneditor-collapsed{{/if}}' on-click='@this.toggle('open')'></button>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>{{key}}</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-datatype'>BinarySet[{{ value.length }}]</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'></td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div class='jsoneditor-value jsoneditor-array'></div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n\t\t</td>\n\t\t<td>\n\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t</button>\n\t\t</td>\n\t</tr>\n\n\t{{#if open}}\n\t\t<tr class='jsoneditor-appender'>\n\t\t\t<td></td><td></td><td>\n\t\t\t\t<div style='margin-left: {{ 24 * level + 40 }}px;'  on-click='prepend'></div>\n\t\t\t</td><td></td>\n\t\t</tr>\n\t{{#value}}\n\t\t{{#if !hide}}\n\t\t<B key={{@index}} value={{ . }} level='{{ level + 1 }}' />\n\t\t<tr class='jsoneditor-appender'>\n\t\t\t<td></td><td></td><td>\n\t\t\t\t<div style='margin-left: {{ 24 * level + 40 }}px;' on-click='elementinsert'></div>\n\t\t\t</td><td></td>\n\t\t</tr>\n\t\t{{/if}}\n\t{{/value}}\n\t{{/if}}\n\n\t<tr class='jsoneditor-append'></tr>\n\n\t",delete_key:function(o){var t=this.get("value");t=t.filter(function(t,e,n){return e!==o}),this.set({value:t})},data:function(){return{open:!1,hide:!1}},on:{delete:function(){this.parent.delete_key(this.get("key"))},prepend:function(){var t=this.get("value");t=[Uint8Array.from(atob("InsertBase64Here"),function(t){return t.charCodeAt(0)})].concat(t),this.set({value:t}),this.set("hide",!0),this.set("hide",!1)},elementinsert:function(t){var e=this.get("value"),n=parseInt(t.resolve().split(".").pop());e.splice(n+1,0,Uint8Array.from(atob("InsertBase64Here"),function(t){return t.charCodeAt(0)})),this.set({value:e}),this.set("hide",!0),this.set("hide",!1)}}})},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=f(n(0)),r=f(n(1)),i=f(n(3)),s=f(n(4)),d=f(n(2)),l=f(n(5)),a=f(n(6)),u=f(n(7)),c=f(n(9)),p=f(n(13));function f(t){return t&&t.__esModule?t:{default:t}}var b=Ractive.extend({components:{S:o.default,N:r.default,BOOL:i.default,NULL:s.default,B:d.default,SS:l.default,NS:a.default,BS:u.default,M:c.default,appender:p.default},onconfig:function(){this.components.L=b},template:"\n\n\t<tr class=' jsoneditor-expandable'>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea'></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu'></button>\n\t\t</td>\n\t\t<td>\n\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ level * 24 }}px;'>\n\t\t\t\t<tbody>\n\t\t\t\t\t<tr>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button {{#if open}}jsoneditor-expanded{{else}}jsoneditor-collapsed{{/if}}' on-click='@this.toggle('open')'></button>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>{{key}}</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t\t<td class='jsoneditor-datatype'>List[{{ value.length }}]</td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'></td>\n\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t<div class='jsoneditor-value jsoneditor-array'></div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t</tbody>\n\t\t\t</table>\n\t\t</td>\n\t\t<td>\n\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t</button>\n\t\t</td>\n\t</tr>\n\n\t{{#if open}}\n\t\t<appender level={{level}} index={{null}}/>\n\t{{#value}}\n\t\t{{#if .hasOwnProperty('S')}}\n\t\t\t<S key={{@index}} value={{ .S }} level='{{ level + 1 }}' />\n\t\t{{/if}}\n\n\t\t{{#if .hasOwnProperty('N')}}\n\t\t\t<N key={{@index}} value={{ .N }} level='{{ level + 1 }}' />\n\t\t{{/if}}\n\n\t\t{{#if .hasOwnProperty('BOOL')}}\n\t\t\t<BOOL key={{@index}} value={{ .BOOL }} level='{{ level + 1 }}' />\n\t\t{{/if}}\n\n\t\t{{#if .hasOwnProperty('NULL')}}\n\t\t\t<NULL key={{@index}} level='1' level='{{ level + 1 }}' />\n\t\t{{/if}}\n\n\t\t{{#if .hasOwnProperty('B')}}\n\t\t\t<B key={{@index}} value={{ .B }} level='{{ level + 1 }}' />\n\t\t{{/if}}\n\n\t\t{{#if .hasOwnProperty('L')}}\n\t\t\t<L key={{@index}} value={{ .L }} level='{{ level + 1 }}' />\n\t\t{{/if}}\n\n\t\t{{#if .hasOwnProperty('M')}}\n\t\t\t<M key={{@index}} value={{ .M }} level='{{ level + 1 }}' />\n\t\t{{/if}}\n\n\t\t{{#if .hasOwnProperty('SS')}}\n\t\t\t<SS key={{@index}} value={{ .SS }} level='{{ level + 1 }}' />\n\t\t{{/if}}\n\n\t\t{{#if .hasOwnProperty('NS')}}\n\t\t\t<NS key={{@index}} value={{ .NS }} level='{{ level + 1 }}' />\n\t\t{{/if}}\n\n\t\t{{#if .hasOwnProperty('BS')}}\n\t\t\t<BS key={{@index}} value={{ .BS }} level='{{ level + 1 }}' />\n\t\t{{/if}}\n\n\t\t<appender level={{level}} index={{@index}}/>\n\n\t{{/value}}\n\t{{/if}}\n\n\t<tr class='jsoneditor-append'></tr>\n\n\t",delete_key:function(o){var t=this.get("value");t=t.filter(function(t,e,n){return e!==o}),this.set({value:t})},data:function(){return{open:!1}},prepend_attribute:function(t,e){var n,o=this.get("value");"S"===t&&(n={S:""}),"N"===t&&(n={N:""}),"BOOL"===t&&(n={BOOL:""}),"NULL"===t&&(n={NULL:!0}),"B"===t&&(n={B:Uint8Array.from(atob("InsertBase64Here"),function(t){return t.charCodeAt(0)})}),"SS"===t&&(n={SS:[]}),"NS"===t&&(n={NS:[]}),"BS"===t&&(n={BS:[]}),"L"===t&&(n={L:[]}),"M"===t&&(n={M:{}}),null===e?o=[n].concat(o):o.splice(e+1,0,n),this.set({value:o})},on:{delete:function(){this.parent.delete_key(this.get("key"))}}});e.default=b},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=f(n(0)),r=f(n(1)),i=f(n(3)),s=f(n(4)),d=f(n(2)),l=f(n(5)),a=f(n(6)),u=f(n(7)),c=f(n(8)),p=f(n(10));function f(t){return t&&t.__esModule?t:{default:t}}var b=Ractive.extend({components:{S:o.default,N:r.default,BOOL:i.default,NULL:s.default,B:d.default,SS:l.default,NS:a.default,BS:u.default,L:c.default,appender:p.default},onconfig:function(){this.components.M=b,this.components.L=c.default},template:"\n\n\t\t<tr class=' jsoneditor-expandable'>\n\t\t\t<td>\n\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea'></button>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu' ></button>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ level * 24 }}px;'>\n\t\t\t\t\t<tbody>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button {{#if open}}jsoneditor-expanded{{else}}jsoneditor-collapsed{{/if}}' on-click='@this.toggle('open')'></button>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>{{key}}</div>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-datatype'>Map{{ '{' + Object.keys(value).length + '}' }}</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree'></td>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t\t<div class='jsoneditor-value jsoneditor-object'></div>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t</tbody>\n\t\t\t\t</table>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t\t</button>\n\t\t\t</td>\n\t\t</tr>\n\n\t\t{{#if open}}\n\t\t\t<appender level={{level}} index={{null}}/>\n\t\t{{#each value }}\n\t\t\t{{#if .hasOwnProperty('S')}}\n\t\t\t\t<S key={{@key}} value={{ .S }} level='{{ level + 1 }}' />\n\t\t\t{{/if}}\n\n\t\t\t{{#if .hasOwnProperty('N')}}\n\t\t\t\t<N key={{@key}} value={{ .N }} level='{{ level + 1 }}' />\n\t\t\t{{/if}}\n\n\t\t\t{{#if .hasOwnProperty('BOOL')}}\n\t\t\t\t<BOOL key={{@key}} value={{ .BOOL }} level='{{ level + 1 }}' />\n\t\t\t{{/if}}\n\n\t\t\t{{#if .hasOwnProperty('NULL')}}\n\t\t\t\t<NULL key={{@key}} level='1' level='{{ level + 1 }}' />\n\t\t\t{{/if}}\n\n\t\t\t{{#if .hasOwnProperty('B')}}\n\t\t\t\t<B key={{@key}} value={{ .B }} level='{{ level + 1 }}' />\n\t\t\t{{/if}}\n\n\t\t\t{{#if .hasOwnProperty('L')}}\n\t\t\t\t<L key={{@key}} value={{ .L }} level='{{ level + 1 }}' />\n\t\t\t{{/if}}\n\n\t\t\t{{#if .hasOwnProperty('M')}}\n\t\t\t\t<M key={{@key}} value={{ .M }} level='{{ level + 1 }}' />\n\t\t\t{{/if}}\n\n\t\t\t{{#if .hasOwnProperty('SS')}}\n\t\t\t\t<SS key={{@key}} value={{ .SS }} level='{{ level + 1 }}' />\n\t\t\t{{/if}}\n\n\t\t\t{{#if .hasOwnProperty('NS')}}\n\t\t\t\t<NS key={{@key}} value={{ .NS }} level='{{ level + 1 }}' />\n\t\t\t{{/if}}\n\n\t\t\t{{#if .hasOwnProperty('BS')}}\n\t\t\t\t<BS key={{@key}} value={{ .BS }} level='{{ level + 1 }}' />\n\t\t\t{{/if}}\n\t\t\t<appender level={{level}} index={{@key}}/>\n\n\t\t{{/each}}\n\t\t{{/if}}\n\n\n\t\t<tr class='jsoneditor-append'></tr>\n\n\t",delete_key:function(t){var e=this.get("value");delete e[t],this.set({value:e})},data:function(){return{open:!1}},prepend_attribute:function(t,e,n){console.log("prepend",t,e,n);var o,r=this.get("value");"S"===t&&(o={S:""}),"N"===t&&(o={N:""}),"BOOL"===t&&(o={BOOL:""}),"NULL"===t&&(o={NULL:!0}),"B"===t&&(o={B:Uint8Array.from(atob("InsertBase64Here"),function(t){return t.charCodeAt(0)})}),"SS"===t&&(o={SS:[]}),"NS"===t&&(o={NS:[]}),"BS"===t&&(o={BS:[]}),"L"===t&&(o={L:[]}),"M"===t&&(o={M:{}});var i={};null===e?(i[n]=o,Object.keys(r).map(function(t){i[t]=r[t]})):Object.keys(r).map(function(t){i[t]=r[t],t===e&&(i[n]=o)}),this.set({value:{}}),this.set({value:i})},on:{delete:function(){this.parent.delete_key(this.get("key"))}}});e.default=b},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:"\n\t{{#if type === null}}\n\t<tr class='jsoneditor-appender'>\n\t\t<td></td><td></td><td>\n\t\t\t\t<div style='margin-left: {{ 24 * level + 40 }}px;' on-click='pickatype'></div>\n\t\t</td><td></td>\n\t</tr>\n\t{{/if}}\n\n\t{{#if type !== null }}\n\t\t<tr>\n\t\t\t<td>\n\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea' ></button>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu' ></button>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ (level+1) * 24 }}px;'>\n\t\t\t\t\t<tbody>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-invisible' ></button>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t\t<input value={{field_name}} placeholder='Attribute Name' style='margin-top: 3px;' />\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-separator'>:</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree' style='width: 100%;'>\n\t\t\t\t\t\t\t\t<select value={{type}} on-change='typepicked' style='margin-top: 3px;'>\n\t\t\t\t\t\t\t\t\t<option value=''>Select Data Type</option>\n\t\t\t\t\t\t\t\t\t<option value='S'>String</option>\n\t\t\t\t\t\t\t\t\t<option value='N'>Number</option>\n\t\t\t\t\t\t\t\t\t<option value='BOOL'>Boolean</option>\n\t\t\t\t\t\t\t\t\t<option value='NULL'>Null</option>\n\t\t\t\t\t\t\t\t\t<option value='B'>Binary</option>\n\t\t\t\t\t\t\t\t\t<option value='SS'>StringSet</option>\n\t\t\t\t\t\t\t\t\t<option value='NS'>NumberSet</option>\n\t\t\t\t\t\t\t\t\t<option value='BS'>BinarySet</option>\n\t\t\t\t\t\t\t\t\t<option value='L'>List</option>\n\t\t\t\t\t\t\t\t\t<option value='M'>Map</option>\n\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t</tbody>\n\t\t\t\t</table>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t\t</button>\n\t\t\t</td>\n\t\t</tr>\n\t{{/if}}\n\t",data:function(){return{type:null,field_name:""}},on:{delete:function(){this.set({type:null})},pickatype:function(){this.set({type:""})},typepicked:function(){this.parent.prepend_attribute(this.get("type"),this.get("index"),this.get("field_name")),this.set({type:null})}}})},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o=v(n(12)),r=v(n(0)),i=v(n(1)),s=v(n(3)),d=v(n(4)),l=v(n(2)),a=v(n(5)),u=v(n(6)),c=v(n(7)),p=v(n(8)),f=v(n(9)),b=v(n(10));function v(t){return t&&t.__esModule?t:{default:t}}e.default=o.default.extend({template:{v:4,t:[{t:7,e:"div",m:[{t:13,n:"class",f:"jsoneditor",g:1},{n:"style",f:[{t:2,r:"style"}],t:13}],f:[{t:7,e:"div",m:[{n:"class",f:["jsoneditor-menu ",{t:2,rx:{r:".",m:[{r:[],s:'"menu-class"'}]}}],t:13},{n:"style",f:[{t:2,rx:{r:".",m:[{r:[],s:'"menu-style"'}]}}],t:13}],f:[{t:7,e:"select",m:[{n:"value",f:[{t:2,r:"mode"}],t:13},{n:"style",f:"height: 20px;margin: 6px;",t:13}],f:[{t:7,e:"option",m:[{n:"value",f:"tree",t:13}],f:["Tree"]}," ",{t:7,e:"option",m:[{n:"value",f:"code",t:13}],f:["Code"]}]}]}," ",{t:4,f:[{t:7,e:"div",m:[{n:"class",f:["jsoneditor-navbar ",{t:2,x:{r:["navbar","class"],s:"_0-_1"}}],t:13},{n:"style",f:[{t:2,rx:{r:".",m:[{r:[],s:'"navbar-style"'}]}}],t:13}]}],n:50,x:{r:["mode","navigationBar"],s:'(_0==="tree")&&(_1===true)'}}," ",{t:7,e:"div",m:[{n:"class",f:["jsoneditor-outer has-main-menu-bar ",{t:4,f:["has-nav-bar"],n:50,x:{r:["mode","navigationBar"],s:'(_0==="tree")&&(_1===true)'}}],t:13}],f:[{t:4,f:[{t:7,e:"textarea",m:[{n:"style",f:"width: 100%;height: 100%;border: 0px;margin: 0px;padding: 0px;",t:13}],f:[{t:2,x:{r:["item"],s:'JSON.stringify(_0,null,"\\t")'}}]}],n:50,x:{r:["mode"],s:'_0==="code"'}},{t:4,f:[{t:7,e:"div",m:[{t:13,n:"class",f:"jsoneditor-tree",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"jsoneditor-tree-inner",g:1}],f:[{t:7,e:"table",m:[{t:13,n:"class",f:"jsoneditor-tree",g:1},{n:"border",f:"0",t:13,g:1}],f:[{t:7,e:"colgroup",f:[{t:7,e:"col",m:[{n:"width",f:"24px",t:13,g:1}]},{t:7,e:"col",m:[{n:"width",f:"24px",t:13,g:1}]},{t:7,e:"col"}]}," ",{t:7,e:"tbody",f:[{t:7,e:"tr",m:[{t:13,n:"class",f:" jsoneditor-expandable",g:1}],f:[{t:7,e:"td"}," ",{t:7,e:"td",f:[{t:7,e:"button",m:[{t:13,n:"class",f:"jsoneditor-button jsoneditor-contextmenu",g:1},{n:"type",f:"button",t:13,g:1}]}]}," ",{t:7,e:"td",f:[{t:7,e:"table",m:[{t:13,n:"style",f:"border-collapse: collapse; margin-left: 0px;",g:1},{t:13,n:"class",f:"jsoneditor-values",g:1}],f:[{t:7,e:"tbody",f:[{t:7,e:"tr",f:[{t:7,e:"td",m:[{t:13,n:"class",f:"jsoneditor-tree",g:1}],f:[{t:7,e:"button",m:[{n:"type",f:"button",t:13,g:1},{n:"class",f:["jsoneditor-button ",{t:4,f:["jsoneditor-expanded"],n:50,r:"open"},{t:4,f:["jsoneditor-collapsed"],n:51,l:1}],t:13},{n:["click"],t:70,f:{r:["@this"],s:'[_0.toggle("open")]'}}]}]}," ",{t:7,e:"td",m:[{t:13,n:"class",f:"jsoneditor-tree",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"jsoneditor-readonly",g:1},{n:"contenteditable",f:"false",t:13}],f:["Item"]}]}," ",{t:7,e:"td",m:[{t:13,n:"class",f:"jsoneditor-tree",g:1}]}," ",{t:7,e:"td",m:[{t:13,n:"class",f:"jsoneditor-tree",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"class",f:"jsoneditor-value jsoneditor-object",g:1}],f:["{ ",{t:2,x:{r:["item"],s:"Object.keys(_0).length"}}," }"]}]}]}]}]}]}," ",{t:7,e:"td",f:[]}]}," ",{t:4,f:[{t:7,e:"appender",m:[{n:"level",f:[{t:2,x:{r:[],s:"0"}}],t:13},{n:"index",f:[{t:2,x:{r:[],s:"null"}}],t:13}]}," ",{t:4,f:[{t:4,f:[{t:7,e:"S",m:[{n:"key",f:[{t:2,r:"@key"}],t:13},{n:"value",f:[{t:2,r:".S"}],t:13},{n:"level",f:"1",t:13,g:1}]}],n:50,x:{r:["."],s:'_0.hasOwnProperty("S")'}}," ",{t:4,f:[{t:7,e:"N",m:[{n:"key",f:[{t:2,r:"@key"}],t:13},{n:"value",f:[{t:2,r:".N"}],t:13},{n:"level",f:"1",t:13,g:1}]}],n:50,x:{r:["."],s:'_0.hasOwnProperty("N")'}}," ",{t:4,f:[{t:7,e:"BOOL",m:[{n:"key",f:[{t:2,r:"@key"}],t:13},{n:"value",f:[{t:2,r:".BOOL"}],t:13},{n:"level",f:"1",t:13,g:1}]}],n:50,x:{r:["."],s:'_0.hasOwnProperty("BOOL")'}}," ",{t:4,f:[{t:7,e:"NULL",m:[{n:"key",f:[{t:2,r:"@key"}],t:13},{n:"level",f:"1",t:13,g:1},{n:"level",f:"1",t:13,g:1}]}],n:50,x:{r:["."],s:'_0.hasOwnProperty("NULL")'}}," ",{t:4,f:[{t:7,e:"B",m:[{n:"key",f:[{t:2,r:"@key"}],t:13},{n:"value",f:[{t:2,r:".B"}],t:13},{n:"level",f:"1",t:13,g:1}]}],n:50,x:{r:["."],s:'_0.hasOwnProperty("B")'}}," ",{t:4,f:[{t:7,e:"L",m:[{n:"key",f:[{t:2,r:"@key"}],t:13},{n:"value",f:[{t:2,r:".L"}],t:13},{n:"level",f:"1",t:13,g:1}]}],n:50,x:{r:["."],s:'_0.hasOwnProperty("L")'}}," ",{t:4,f:[{t:7,e:"M",m:[{n:"key",f:[{t:2,r:"@key"}],t:13},{n:"value",f:[{t:2,r:".M"}],t:13},{n:"level",f:"1",t:13,g:1}]}],n:50,x:{r:["."],s:'_0.hasOwnProperty("M")'}}," ",{t:4,f:[{t:7,e:"SS",m:[{n:"key",f:[{t:2,r:"@key"}],t:13},{n:"value",f:[{t:2,r:".SS"}],t:13},{n:"level",f:"1",t:13,g:1}]}],n:50,x:{r:["."],s:'_0.hasOwnProperty("SS")'}}," ",{t:4,f:[{t:7,e:"NS",m:[{n:"key",f:[{t:2,r:"@key"}],t:13},{n:"value",f:[{t:2,r:".NS"}],t:13},{n:"level",f:"1",t:13,g:1}]}],n:50,x:{r:["."],s:'_0.hasOwnProperty("NS")'}}," ",{t:4,f:[{t:7,e:"BS",m:[{n:"key",f:[{t:2,r:"@key"}],t:13},{n:"value",f:[{t:2,r:".BS"}],t:13},{n:"level",f:"1",t:13,g:1}]}],n:50,x:{r:["."],s:'_0.hasOwnProperty("BS")'}}," ",{t:7,e:"appender",m:[{n:"level",f:[{t:2,x:{r:[],s:"0"}}],t:13},{n:"index",f:[{t:2,r:"@key"}],t:13}]}],n:52,r:"item"}],n:50,r:"open"}]}]}]}]}],n:51,l:1}]}]}],e:{0:function(){return 0},'"menu-class"':function(){return"menu-class"},'"menu-style"':function(){return"menu-style"},"_0-_1":function(t,e){return t-e},'"navbar-style"':function(){return"navbar-style"},'(_0==="tree")&&(_1===true)':function(t,e){return"tree"===t&&!0===e},'JSON.stringify(_0,null,"\\t")':function(t){return JSON.stringify(t,null,"\t")},'_0==="code"':function(t){return"code"===t},'[_0.toggle("open")]':function(t){return[t.toggle("open")]},"Object.keys(_0).length":function(t){return Object.keys(t).length},null:function(){return null},'_0.hasOwnProperty("S")':function(t){return t.hasOwnProperty("S")},'_0.hasOwnProperty("N")':function(t){return t.hasOwnProperty("N")},'_0.hasOwnProperty("BOOL")':function(t){return t.hasOwnProperty("BOOL")},'_0.hasOwnProperty("NULL")':function(t){return t.hasOwnProperty("NULL")},'_0.hasOwnProperty("B")':function(t){return t.hasOwnProperty("B")},'_0.hasOwnProperty("L")':function(t){return t.hasOwnProperty("L")},'_0.hasOwnProperty("M")':function(t){return t.hasOwnProperty("M")},'_0.hasOwnProperty("SS")':function(t){return t.hasOwnProperty("SS")},'_0.hasOwnProperty("NS")':function(t){return t.hasOwnProperty("NS")},'_0.hasOwnProperty("BS")':function(t){return t.hasOwnProperty("BS")}}},components:{S:r.default,N:i.default,BOOL:s.default,NULL:d.default,B:l.default,SS:a.default,NS:u.default,BS:c.default,L:p.default,M:f.default,appender:b.default},css:".jsoneditor { display: 'inline-block'; color: #1a1a1a; border: thin solid #f4a460; box-sizing: border-box; width: 100%; height: 100%; position: relative; padding: 0; line-height: 100%; width: 534px; background-color: #fff; } .jsoneditor-menu { width: 100%; height: 35px; padding: 2px; margin: 0; box-sizing: border-box; color: #fff; border-bottom: 1px solid #3883fa; background-color: #f4a460; border-color: #f4a460; } .jsoneditor-navbar { width: 100%; height: 26px; line-height: 26px; padding: 0; margin: 0; box-sizing: border-box; color: grey; overflow: hidden; font-family: arial,sans-serif; font-size: 10pt; border-bottom: 1px solid #d3d3d3; background-color: #ebebeb; } .jsoneditor-outer { overflow: auto; position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; box-sizing: border-box; } .jsoneditor-outer.has-main-menu-bar { top: 35px; } .jsoneditor-outer.has-main-menu-bar.has-nav-bar { top: 61px; } .jsoneditor table { border-collapse: collapse; width: auto; } div.jsoneditor-tree table.jsoneditor-tree { border-collapse: collapse; border-spacing: 0; width: 100%; } div.jsoneditor td, div.jsoneditor th, div.jsoneditor tr { padding: 0;margin: 0; } div.jsoneditor tr:hover {background-color: #f0f0f0;} div.jsoneditor tr.jsoneditor-appender {} div.jsoneditor tr.jsoneditor-appender > td:nth-child(3) {position: relative;height: 4px;} div.jsoneditor tr.jsoneditor-appender > td:nth-child(3) > div {cursor: row-resize;} div.jsoneditor tr.jsoneditor-appender > td:nth-child(4) {width: 32px;} div.jsoneditor tr.jsoneditor-appender:hover {background-color: transparent;} div.jsoneditor tr.jsoneditor-appender:hover > td:nth-child(3) {} div.jsoneditor tr.jsoneditor-appender:hover > td:nth-child(3) > div {height: 4px;background-color: #000099} .jsoneditor-field {white-space: nowrap} .jsoneditor-popover, .jsoneditor-schema-error, div.jsoneditor td, div.jsoneditor textarea, div.jsoneditor th, div.jsoneditor-field, div.jsoneditor-value, pre.jsoneditor-preview { font-family: \"dejavu sans mono\",\"droid sans mono\",consolas,monaco,\"lucida console\",\"courier new\",courier,monospace,sans-serif; font-size: 10pt; color: #1a1a1a; } div.jsoneditor-default, div.jsoneditor-field, div.jsoneditor-readonly, div.jsoneditor-value { border: 1px solid transparent; min-height: 16px; min-width: 32px; padding: 2px; margin: 1px; word-wrap: break-word; float: left; } div.jsoneditor td { vertical-align: top; } .jsoneditor td, .jsoneditor th { padding: 0; display: table-cell; text-align: left; vertical-align: inherit; border-radius: inherit; } div.jsoneditor-tree button.jsoneditor-contextmenu { background-position: -48px -72px; } /* buttons */ div.jsoneditor-tree button.jsoneditor-button { width: 24px; height: 24px; padding: 0; margin: 0; border: none; cursor: pointer; background-color: transparent; outline: none; } div.jsoneditor-tree button.jsoneditor-invisible { visibility: hidden; } div.jsoneditor-tree button.jsoneditor-expanded { background-color: '#4499ff'; position: relative; outline: none; } div.jsoneditor-tree button.jsoneditor-expanded:after { content: ' '; position: absolute; top: 9px; left: 9px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #000; } div.jsoneditor-tree button.jsoneditor-collapsed { background-color: '#4499ff'; position: relative; outline: none; } div.jsoneditor-tree button.jsoneditor-collapsed:after { content: ' '; position: absolute; top: 9px; left: 9px; width: 0; height: 0; border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-left: 5px solid #000; } div.jsoneditor td.jsoneditor-tree { vertical-align: top; } div.jsoneditor td.jsoneditor-separator { padding: 3px 0; vertical-align: top; color: grey; } div.jsoneditor td.jsoneditor-separator { padding: 3px 0; vertical-align: top; color: grey; } div.jsoneditor td.jsoneditor-datatype { padding: 3px 0; vertical-align: top; color: grey; } .jsoneditor-contextmenu { position: absolute; box-sizing: content-box; z-index: 99; } div.jsoneditor-value.jsoneditor-string { color: #006000; } input.jsoneditor-input.jsoneditor-string { border: 0px;padding: 0px;margin: 0px;font-size: 14px;vertical-align: sub;outline: none;color: #006000;width: 100%;background-color: transparent; } input.jsoneditor-input.jsoneditor-string:focus { background-color: #bcffa0; } textarea.jsoneditor-input.jsoneditor-string { border: 0px;padding: 0px;margin: 0px;outline: none;color: #006000;width:100%;box-sizing:border-box;display:block;max-width:100%;font:13px Tahoma, cursive; } textarea.jsoneditor-input.jsoneditor-string:focus { background-color: #bcffa0; } div.jsoneditor-value.jsoneditor-number { color: #ee422e; } input.jsoneditor-input.jsoneditor-number { border: 0px;padding: 0px;margin: 0px;font-size: 14px;vertical-align: sub;outline: none;color: #ee422e;width: 100%;background-color: transparent; } input.jsoneditor-input.jsoneditor-number:focus { background-color: #bcffa0; } div.jsoneditor-value.jsoneditor-boolean { color: #ff8c00; } input.jsoneditor-input.jsoneditor-boolean { border: 0px;padding: 0px;margin: 0px;font-size: 14px;vertical-align: sub;outline: none;color: #ff8c00;width: 100%;background-color: transparent; } input.jsoneditor-input.jsoneditor-boolean:focus { background-color: #bcffa0; } input.jsoneditor-input.jsoneditor-boolean.error { background-color: red !important; } div.jsoneditor-value.jsoneditor-binary { color: #004ed0; } input.jsoneditor-input.jsoneditor-binary { border: 0px;padding: 0px;margin: 0px;font-size: 14px;vertical-align: sub;outline: none;color: #004ed0;width: 100%;background-color: transparent; } input.jsoneditor-input.jsoneditor-binary:focus { background-color: #bcffa0; } div.jsoneditor-value.jsoneditor-null { color: #004ed0; } .jsoneditor-input.jsoneditor-null { border: 0px;padding: 0px;margin: 0px;font-size: 14px;vertical-align: sub;outline: none;color: #004ed0;width: 100%;background-color: transparent;line-height: 27px; } /* icons and btns */ .btn-delete-attribute {display: none;} tr:hover .btn-delete-attribute {display: inline-block;} .trash-solid.icon { color: #aaa; position: absolute; margin-left: 5px; margin-top: 0px; width: 8px; height: 8px; border-left: solid 1px currentColor; border-right: solid 1px currentColor; border-bottom: solid 1px currentColor; border-radius: 0 0 2px 2px; background-color: currentColor; } .trash-solid.icon:hover {color: #999;} .trash-solid.icon:before { content: ''; position: absolute; left: -4px; top: -2px; width: 17px; height: 1px; background-color: currentColor; } .trash-solid.icon:after { content: ''; position: absolute; left: 0px; top: -5px; width: 7px; height: 2px; border-left: solid 1px currentColor; border-right: solid 1px currentColor; border-top: solid 1px currentColor; background-color: currentColor; border-radius: 4px 4px 0 0; } ",data:function(){return{open:!0,mode:"tree",mainMenuBar:!0,navigationBar:!0,statusBar:!0}},prepend_attribute:function(t,e,n){console.log("prepend",t,e,n);var o,r=this.get("item");"S"===t&&(o={S:""}),"N"===t&&(o={N:""}),"BOOL"===t&&(o={BOOL:""}),"NULL"===t&&(o={NULL:!0}),"B"===t&&(o={B:Uint8Array.from(atob("InsertBase64Here"),function(t){return t.charCodeAt(0)})}),"SS"===t&&(o={SS:[]}),"NS"===t&&(o={NS:[]}),"BS"===t&&(o={BS:[]}),"L"===t&&(o={L:[]}),"M"===t&&(o={M:{}});var i={};null===e?(i[n]=o,Object.keys(r).map(function(t){i[t]=r[t]})):Object.keys(r).map(function(t){i[t]=r[t],t===e&&(i[n]=o)}),this.set({item:{}}),this.set({item:i})},delegate:!1,elToFocus:null,delete_key:function(t){var e=this.get("item");delete e[t],this.set({item:e})},on:{}})},function(t,e){t.exports=n},function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:"\n\t{{#if type === null}}\n\t<tr class='jsoneditor-appender'>\n\t\t<td></td><td></td><td>\n\t\t\t\t<div style='margin-left: {{ 24 * level + 40 }}px;' on-click='pickatype'></div>\n\t\t</td><td></td>\n\t</tr>\n\t{{/if}}\n\n\t{{#if type !== null }}\n\t\t<tr>\n\t\t\t<td>\n\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-dragarea' ></button>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-contextmenu' ></button>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<table class='jsoneditor-values' style='border-collapse: collapse; margin-left: {{ (level+1) * 24 }}px;'>\n\t\t\t\t\t<tbody>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t\t<button type='button' class='jsoneditor-button jsoneditor-invisible' ></button>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree'>\n\t\t\t\t\t\t\t\t<div contenteditable='false' spellcheck='false' class='jsoneditor-field'>*</div>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-separator'>:</td>\n\t\t\t\t\t\t\t<td class='jsoneditor-tree' style='width: 100%;'>\n\t\t\t\t\t\t\t\t<select value={{type}} on-change='typepicked' style='margin-top: 3px;'>\n\t\t\t\t\t\t\t\t\t<option value=''>Select Data Type</option>\n\t\t\t\t\t\t\t\t\t<option value='S'>String</option>\n\t\t\t\t\t\t\t\t\t<option value='N'>Number</option>\n\t\t\t\t\t\t\t\t\t<option value='BOOL'>Boolean</option>\n\t\t\t\t\t\t\t\t\t<option value='NULL'>Null</option>\n\t\t\t\t\t\t\t\t\t<option value='B'>Binary</option>\n\t\t\t\t\t\t\t\t\t<option value='SS'>StringSet</option>\n\t\t\t\t\t\t\t\t\t<option value='NS'>NumberSet</option>\n\t\t\t\t\t\t\t\t\t<option value='BS'>BinarySet</option>\n\t\t\t\t\t\t\t\t\t<option value='L'>List</option>\n\t\t\t\t\t\t\t\t\t<option value='M'>Map</option>\n\t\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t</tbody>\n\t\t\t\t</table>\n\t\t\t</td>\n\t\t\t<td>\n\t\t\t\t<button class='jsoneditor-button btn-delete-attribute' on-click='delete' >\n\t\t\t\t\t<div class='trash-solid icon'></div>\n\t\t\t\t</button>\n\t\t\t</td>\n\t\t</tr>\n\t{{/if}}\n\t",data:function(){return{type:null}},on:{delete:function(){this.set({type:null})},pickatype:function(){this.set({type:""})},typepicked:function(){this.parent.prepend_attribute(this.get("type"),this.get("index")),this.set({type:null})}}})}],r.c=i,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=11)).default;function r(t){if(i[t])return i[t].exports;var e=i[t]={i:t,l:!1,exports:{}};return o[t].call(e.exports,e,e.exports,r),e.l=!0,e.exports}var o,i});

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var baseClone = __webpack_require__(58);

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_SYMBOLS_FLAG = 4;

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}

module.exports = cloneDeep;


/***/ }),
/* 25 */
/***/ (function(module, exports) {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(6),
    isObject = __webpack_require__(2);

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;


/***/ }),
/* 28 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var baseAssignValue = __webpack_require__(30),
    eq = __webpack_require__(25);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

var defineProperty = __webpack_require__(90);

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

var baseTimes = __webpack_require__(92),
    isArguments = __webpack_require__(93),
    isArray = __webpack_require__(14),
    isBuffer = __webpack_require__(32),
    isIndex = __webpack_require__(96),
    isTypedArray = __webpack_require__(97);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(0),
    stubFalse = __webpack_require__(95);

/** Detect free variable `exports`. */
var freeExports =   true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(15)(module)))

/***/ }),
/* 33 */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),
/* 34 */
/***/ (function(module, exports) {

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(26),
    isLength = __webpack_require__(33);

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeKeys = __webpack_require__(31),
    baseKeysIn = __webpack_require__(102),
    isArrayLike = __webpack_require__(35);

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;


/***/ }),
/* 37 */
/***/ (function(module, exports) {

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

module.exports = stubArray;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__(39),
    getPrototype = __webpack_require__(40),
    getSymbols = __webpack_require__(19),
    stubArray = __webpack_require__(37);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols(object));
    object = getPrototype(object);
  }
  return result;
};

module.exports = getSymbolsIn;


/***/ }),
/* 39 */
/***/ (function(module, exports) {

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

module.exports = arrayPush;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(34);

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

var arrayPush = __webpack_require__(39),
    isArray = __webpack_require__(14);

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ractive = __webpack_require__(22);

var _ractive2 = _interopRequireDefault(_ractive);

var _minitablelist = __webpack_require__(43);

var _minitablelist2 = _interopRequireDefault(_minitablelist);

var _tabs = __webpack_require__(44);

var _tabs2 = _interopRequireDefault(_tabs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ddb;
var DynamodbFactory;

var DynamodbFactory = window['@awspilot/dynamodb'];
//var DynamodbFactory = require('@awspilot/dynamodb')

var hsplit = _ractive2.default.extend({
	isolated: false,
	data: {
		direction: 'horizontal'
	},
	template: '<div class="hsplit {{class}} " style="{{style}}">{{yield}}</div>'
});

exports.default = _ractive2.default.extend({
	template: { v: 4, t: [{ t: 7, e: "hsplit", m: [{ t: 13, n: "style", f: ";", g: 1 }, { t: 13, n: "class", f: "ractive-dynamodb-ui", g: 1 }], f: [{ t: 7, e: "left", f: [{ t: 7, e: "minitablelist" }] }, " ", { t: 7, e: "content", f: [{ t: 7, e: "tabs", m: [{ n: "active_id", f: "tables", t: 13, g: 1 }] }] }] }] },
	components: {
		hsplit: hsplit,
		minitablelist: _minitablelist2.default,
		tabs: _tabs2.default
	},
	css: " /* bootstrap */ .pull-right { float: right!important; } a { color: #337ab7; text-decoration: none; } a.btn.disabled, fieldset[disabled] a.btn { pointer-events: none; } .btn.disabled, .btn[disabled], fieldset[disabled] .btn { cursor: not-allowed; filter: alpha(opacity=65); -webkit-box-shadow: none; box-shadow: none; opacity: .65; } .btn-group .dropdown-toggle:active, .btn-group.open .dropdown-toggle { outline: 0; } .btn { display: inline-block; padding: 6px 12px; margin-bottom: 0; font-size: 14px; font-weight: 400; line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; -ms-touch-action: manipulation; touch-action: manipulation; cursor: pointer; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; background-image: none; border: 1px solid transparent; border-radius: 4px; } .btn-default { color: #333; background-color: #fff; border-color: #ccc; } .btn-group>.btn { position: relative; float: left; } .btn-group, .btn-group-vertical { position: relative; display: inline-block; vertical-align: middle; } .btn-group>.btn:first-child { margin-left: 0; } .btn-group>.btn:first-child:not(:last-child):not(.dropdown-toggle) { border-top-right-radius: 0; border-bottom-right-radius: 0; } .btn-group-xs>.btn, .btn-xs { padding: 1px 5px; font-size: 12px; line-height: 1.5; border-radius: 3px; } .btn-group>.btn:last-child:not(:first-child), .btn-group>.dropdown-toggle:not(:first-child) { border-top-left-radius: 0; border-bottom-left-radius: 0; } .btn-group>.btn+.dropdown-toggle { padding-right: 8px; padding-left: 8px; } .btn-group .btn+.btn, .btn-group .btn+.btn-group, .btn-group .btn-group+.btn, .btn-group .btn-group+.btn-group { margin-left: -1px; } .btn-default.active.focus, .btn-default.active:focus, .btn-default.active:hover, .btn-default:active.focus, .btn-default:active:focus, .btn-default:active:hover, .open>.dropdown-toggle.btn-default.focus, .open>.dropdown-toggle.btn-default:focus, .open>.dropdown-toggle.btn-default:hover { color: #333; background-color: #d4d4d4; border-color: #8c8c8c; } .btn.active.focus, .btn.active:focus, .btn.focus, .btn:active.focus, .btn:active:focus, .btn:focus { outline: 5px auto -webkit-focus-ring-color; outline-offset: -2px; } .btn-group-sm>.btn, .btn-sm { padding: 5px 10px; font-size: 12px; line-height: 1.5; border-radius: 3px; } .dropdown-menu { position: absolute; top: 100%; left: 0; z-index: 1000; display: none; float: left; min-width: 160px; padding: 5px 0; margin: 2px 0 0; font-size: 14px; text-align: left; list-style: none; background-color: #fff; -webkit-background-clip: padding-box; background-clip: padding-box; border: 1px solid #ccc; border: 1px solid rgba(0,0,0,.15); border-radius: 4px; -webkit-box-shadow: 0 6px 12px rgba(0,0,0,.175); box-shadow: 0 6px 12px rgba(0,0,0,.175); } .dropdown-menu.pull-right { right: 0; left: auto; } .show { display: block!important; } .btn-primary {color: #fff;background-color: #337ab7;border-color: #2e6da4;} .btn-danger {color: #fff;background-color: #d9534f;border-color: #d43f3a;} /* */ .ractive-dynamodb-ui {font-family: sans-serif;} .ractive-dynamodb-ui * {box-sizing: border-box } .hsplit {position: absolute;top:0px;left: 0px;right: 0px;bottom: 0px; /*background-color: #f0f0f0;*/background-color: #c9c9c9; color: #999999;} left {position:absolute;display: block;top: 0px;left: 0px;width: 260px;bottom: 0px;margin-top: 5px;} content {position:absolute;display: block;top: 0px;left: 265px;right: 0px;bottom: 0px;margin-top: 5px;} miniheader {display: block;height: 28px;line-height: 28px;font-size: 12px;padding-left: 10px;} miniheader .icon:hover {box-shadow: 0px 0px 1px rgba(255,255,255,.3);} .miniheaderbody {left: 0px;top: 29px;right: 0px;bottom: 0px;} left tables > div {display: block;height: 30px; line-height: 30px;font-size: 13px;padding: 0px 10px;border-top: 1px solid transparent;border-left: 1px solid transparent;;margin-bottom: 0px;cursor: pointer} content tabhead {position: absolute;top: 0px;left: 0px;right:0px;height: 28px;overflow: hidden;font-size: 0px;} content tabhead tab {display: inline-block;height: 28px;line-height: 28px;padding: 0px 10px;cursor: pointer;font-size: 14px;} content tabhead tab.active {} content tabhead tab .icon {width: 15px;height: 15px;line-height: 15px;text-align: center;margin-top: 2px;cursor: pointer;font-size: 14px;} content tabhead tab .icon:hover {box-shadow: 0px 0px 1px rgba(255,255,255,.3);} content tabcontent {position: absolute;top: 28px;left: 0px;right: 0px;bottom: 0px;} .btn-tableview-tab {display: inline-block;height: 30px;line-height: 30px;text-align: center;vertical-align: middle;border-radius: 3px 3px 0px 0px;text-decoration: none;} .btn-tableview-tab:hover {cursor: pointer;} .btn-tableview-tab i {line-height: 40px;line-height: 30px;margin: 5px;width: 30px;height: 30px;border-radius: 5px;} content tabcontent .tableview-table-tabs {position: absolute;top: 10px;left: 30px;height: 30px;right: 30px;border-bottom: 1px solid #bbb;padding: 0px 20px;} content tabcontent .tableview { visibility: hidden } content tabcontent .tableview.active { visibility: visible } content tabcontent .tableview .tablebrowse {display: block;position: absolute;top: 0px;left:0px;right: 0px;bottom: 0px;} content tabcontent .tablesqlquery {display: block;position: absolute;top: 0;left:0px;right: 0px;height: 119px;overflow: hidden;} content tabcontent .tablequery {display: block;position: absolute;top: 0;left:0px;right: 0px;height: 119px;overflow: hidden; padding: 10px;margin-top: 6px;} content tabcontent .tablequery select { background-color: #6d6565; outline: none; color: #ccc; border-radius: 5px; border: 0px;} content tabcontent .tablequery input[type=text] {background-color: #6d6565; border: 0px; border-radius: 5px; outline: none;height: 19px;padding: 0px 7px; color: #ccc; } content tabcontent .tabledatacontrols {position: absolute;top: 120px;left: 0px;right: 0px;height: 28px;padding: 3px 0px 0px 30px;} content tabcontent .tabledata {display: block;position: absolute;left:0px;right: 0px;bottom: 0px;overflow: hidden;} content tabcontent .tabledata .tabledatahead, content tabcontent .tabledata .tabledatarow { display: flex;width: 100%;justify-content: stretch} content tabcontent .tabledata .tabledatahead {position: absolute;top: 0px;left: 0px;right: 0px;height: 20px;} content tabcontent .tabledata .tabledatarow .zmdi.selectrow {font-size: 14px;} content tabcontent .tabledata .tabledatahead > div, content tabcontent .tabledata .tabledatarow .tabledatacell {display: flex;height: 20px;align-items: center;overflow: hidden;white-space: nowrap;padding-left: 6px;position: relative;} content tabcontent .tabledata .tabledatarow .tabledatacell:before {content: ' ';position:absolute;top: 0px;left: 0px;bottom: 0px;width: 5px;} content tabcontent .tabledata .tabledatarow .tabledatacell:after {content: ' ';position:absolute;top: 0px;right: 0px;bottom: 0px;width: 5px;} content tabcontent .tabledata .tabledatacontent {position: absolute;top: 23px;left: 0px;right: 0px;bottom: 0px;overflow-x: auto;} content tabcontent .tabledata .tabledatahead > div {font-size: 12px;} content tabcontent .tabledata .tabledatarow .tabledatacell {font-size: 11px;} .scrollarea:hover > span {position: absolute; right: 0px;width: 3px;background-color: rgba(255, 255, 255, 0.3);z-index: 1;} .pull-right {float: right;} body.theme_light {background-color: #f0f0f0;color: #999999;} body.theme_light header {background-color: #232f3e;/*box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);*/ } body.theme_light miniheader {background: linear-gradient(#eee , #e0e0e0);border: 1px solid #b9b8b6;border-top: 1px solid #fff;border-bottom: 1px solid #ccc;} body.theme_light left {background-color: #ffffff} body.theme_light left > .scrollarea {border-right: 1px solid #b9b8b6;} body.theme_light left tables > div {border-bottom: 1px solid #e0e0e0;color: #146eb4} body.theme_light left tables > div:hover {background-color: #eaf3fe;/*border: 1px solid #636363;*/} body.theme_light content {border: 1px solid #b9b8b6;background-color: #ffffff;border-top: 1px solid #fff;border-right: 0px;} body.theme_light content tabhead {background-color: #ececec;background: linear-gradient(#eee , #e0e0e0);} body.theme_light content tabhead tab:first-child {} body.theme_light content tabhead tab {border-right: 1px solid #cccccc;} body.theme_light content tabhead tab.active {background-color: #ffffff;color: #000000;} body.theme_light content tabcontent {background-color: #ffffff;} body.theme_light content tabcontent .tableview-table-tabs {background: #ffffff} body.theme_light .btn-tableview-tab {background-color: #eee;border: 1px solid #ccc;border-bottom: 1px solid #bbb;color: #635858;font-weight: bold;font-size: 12px;padding: 0px 12px;} body.theme_light .btn-tableview-tab.active {background-color: #fff;border-bottom: 1px solid #fff;color: #000000;} body.theme_light content tabcontent .tablequery {background-color: #444;} body.theme_light content tabcontent .tablesqlquery {} body.theme_light content tabcontent .tabledatacontrols {background-color: #ffffff;border-bottom: 1px solid #383838;} body.theme_light content tabcontent .tabledata {border-top: 1px solid #e0e0e0;} body.theme_light content tabcontent .tabledata .tabledatahead {background: linear-gradient(#eee , #e0e0e0);border-top: 1px solid #fff;border-bottom: 1px solid #ccc;} body.theme_light content tabcontent .tabledata .tabledatahead > div {border-right: 1px solid #c3b7b7;border-left: 1px solid #ffffff;} body.theme_light content tabcontent .tabledata .tabledatarow {border-bottom: 1px solid #e0e0e0;} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell {border-right: 1px solid #c3b7b7;border-left: 1px solid #ffffff;} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-K {color: #8ea7aa;} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-HASH {color:#004b91;cursor: pointer;} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-HASH:hover a {text-decoration: underline;} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-S {color: #a79b9b;} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-N {color: green;} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-BOOL {color: #ff7676;} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-NULL {color: grey} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-SS {} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-NS {} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-L {} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-M {} body.theme_light content tabcontent .tabledata .tabledatarow .tabledatacell.t-U {background-color: #f9f3f3;} body.theme_light content tabcontent .tabledata .tabledatarow:hover {background-color: #f3f3f3;} body.theme_light content tabcontent .tabledata .tabledatarow:hover .tabledatacell {color: #a59797;} body.theme_light content tabcontent .tabledata .tabledatarow:hover .tabledatacell.t-HASH {color:#004b91;} body.theme_light content tabcontent .tabledata .tabledatarow.selected {background-color: #ddecff;} body.theme_light content tabcontent .tabledata .tabledatarow.selected .tabledatacell {color: #396396;} body.theme_light content tabcontent .tabledata .tabledatarow.selected:hover {background-color: #0747a0 !important;} body.theme_light content tabcontent .tabledata .tabledatarow.selected:hover .tabledatacell {color: #fff;} content {position:absolute;display: block;top: 0px;left: 265px;right: 0px;bottom: 0px;} ",
	data: function data() {
		return {};
	},
	delegate: false,
	elToFocus: null,
	on: {
		init: function init() {

			this.on('open-table', function (e, table) {
				this.findComponent('tabs').newtab('tabletab', table);
			});

			// if (this.get('account.endpoint')) {
			// 	credentials.endpoint = this.get('account.endpoint')
			// 	if (this.get('account.endpoint').indexOf( location.protocol + '//' + location.host ) === 0) {
			// 		// dynamodb is proxied via same host, force version signature 3 so Authorization header is not used
			// 		credentials.signatureVersion = 'v3'
			// 		// httpOptions: { xhrWithCredentials: true },
			// 	}
			// }

			ddb = new AWS.DynamoDB({
				endpoint: this.get('endpoint'),
				region: this.get('region'),
				credentials: {
					accessKeyId: this.get('accessKeyId'),
					secretAccessKey: this.get('secretAccessKey')
				}
			});

			DynamoDB = new DynamodbFactory(ddb);

			cloudwatch = new AWS.CloudWatch({
				endpoint: this.get('cwendpoint'),
				region: this.get('region'),
				credentials: {
					accessKeyId: this.get('accessKeyId'),
					secretAccessKey: this.get('secretAccessKey')
				}
			});
		}
	}
});

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Ractive.extend({
	//isolated: true,
	template: '\n\t\t<miniheader>\n\t\t\tTables\n\t\t\t<div class=\'pull-right\' style=\'margin-right: 5px;\'>\n\t\t\t\t<a class=\'btn btn-xs btn-default\' on-click=\'create\'><i class=\'icon zmdi zmdi-plus\'></i></a>\n\t\t\t\t<a class=\'btn btn-xs btn-default\' on-click=\'@this.refresh_tables()\'><i class=\'icon zmdi zmdi-refresh\'></i></a>\n\t\t\t</div>\n\t\t</miniheader>\n\t\t<scrollarea class=\'scrollarea miniheaderbody\' style=\'position: absolute;\'>\n\t\t<tables>\n\t\t\t{{#tables}}\n\t\t\t<div on-click=\'@this.fire( "open-table",.)\'> {{.}} </div>\n\t\t\t{{/tables}}\n\t\t</tables>\n\t\t</scrollarea>\n\t\t',
	data: function data() {
		return {};
	},
	refresh_tables: function refresh_tables() {
		var ractive = this;

		ractive.set('tables');

		DynamoDB.query('SHOW TABLES', function (err, data) {

			if (err) return ractive.set('err', err);

			ractive.set('err');
			ractive.set('tables', data);
		});
	},
	oninit: function oninit() {
		this.refresh_tables();
		var ractive = this;
		ractive.on('open-table', function (e, table) {
			ractive.parent.fire('open-table', table);
		});
		ractive.on('create', function () {
			ractive.root.findComponent('tabs').newtab('tablecreate', 'Create Table');
		});
	}
});

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _tablelistfull = __webpack_require__(45);

var _tablelistfull2 = _interopRequireDefault(_tablelistfull);

var _tablecreate = __webpack_require__(46);

var _tablecreate2 = _interopRequireDefault(_tablecreate);

var _tabletab = __webpack_require__(47);

var _tabletab2 = _interopRequireDefault(_tabletab);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = Ractive.extend({
	//isolated: true,
	components: {
		tablelistfull: _tablelistfull2.default,
		tablecreate: _tablecreate2.default,
		tabletab: _tabletab2.default
	},
	template: "\
		<tabhead>\
			<tab class='{{#if active_id === \"tables\" }}active{{/if}}' on-click='@this.fire(\"activetab\", \"tables\")'>\
				<i class='icon zmdi zmdi-view-dashboard'></i>\
			</tab>\
		{{#tabs}}\
			{{#if .closed !== true}}\
			<tab class='{{#if .id === active_id }}active{{/if}}' on-click='@this.fire(\"activetab\",.id)'>\
				{{.name}}\
				<i class='icon zmdi zmdi-close' on-click='closetab'></i>\
			</tab>\
			{{/if}}\
		{{/tabs}}\
		</tabhead>\
		<tabcontent>\
			{{#if active_id === \"tables\" }}\
				<tablelistfull />\
			{{else}}\
				{{#tabs}}\
					{{#if .closed === true}}\
						<div class='closedtab'></div>\
					{{else}}\
						{{#if .type === 'tablecreate' }}\
							<tablecreate active={{ .id === active_id  }} />\
						{{/if}}\
						{{#if .type === 'tabletab' }}\
							<tabletab table={{.}} active={{ .id === active_id  }} />\
						{{/if}}\
					{{/if}}\
				{{/tabs}}\
			{{/if}}\
		</tabcontent>\
		",
	data: function data() {
		return {};
	},
	active_cache: [],
	activetabcontent: function activetabcontent() {
		var ractive = this;
		ractive.active_cache.push(ractive.get('active_id'));
		ractive.findAllComponents('tabletab').map(function (tableview_c) {
			tableview_c.set('active', tableview_c.get('table.id') === ractive.get('active_id'));
		});
	},
	newtab: function newtab(component_name, param1) {
		var id = Math.random();
		this.set('active_id', id);
		this.push('tabs', {
			id: id,

			name: param1,
			type: component_name,

			sql: "\nSCAN * FROM `" + param1 + "` LIMIT 100\n"
		});
		this.activetabcontent();
	},
	oninit: function oninit() {
		var ractive = this;

		this.observe('active_id', function (newvalue, oldvalue, keypath) {
			ractive.activetabcontent();
		});

		this.on('closetab', function (e) {

			console.log("close", e.resolve());
			var id = this.get(e.resolve() + '.id');

			this.set(e.resolve() + '.closed', true);

			this.active_cache = this.active_cache.filter(function (tid) {
				return tid !== id;
			});
			//this.set('tabs', this.get('tabs').filter(function(t) { return t.id !== id }) )

			if (this.get('active_id') === id) {
				// the current tab was closed
				this.set('active_id', this.active_cache.pop());
			}
			ractive.activetabcontent();
			return false;
		});
		this.on('activetab', function (e, id) {
			this.set('active_id', id);
			return false;
		});
	}
});

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _tabledata = __webpack_require__(10);

var _tabledata2 = _interopRequireDefault(_tabledata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = Ractive.extend({
	//isolated: true,
	components: {
		tabledata: _tabledata2.default
	},
	template: "\
			<div class='pull-right' style='padding: 7px;'>\
				<a class='btn btn-xs btn-primary ' on-click='create'><i class='icon zmdi zmdi-plus'></i> CREATE TABLE <i class='zmdi'></i></a>\
				<a class='btn btn-xs btn-default {{#if selection_length > 0}}{{else}}disabled{{/if}}' on-click='delete' as-tooltip=' \" Delete table \" '><i class='icon zmdi zmdi-delete'></i></a>\
				<a class='btn btn-xs btn-default {{#if refresh_tables }}disabled{{/if}}' on-click='@this.refresh_tables()'><i class='icon zmdi zmdi-refresh {{#if refresh_tables }}zmdi-hc-spin{{/if}}'></i></a>\
			</div>\
		\
		<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 38px;' />\
		",
	data: function data() {
		return {
			selection_length: 0,
			refresh_tables: false
		};
	},
	refresh_tables: function refresh_tables() {
		var ractive = this;
		ractive.set('refresh_tables', true);
		ractive.set('tables');

		DynamoDB.query('SHOW TABLES', function (err, data) {

			ractive.set('refresh_tables', false);

			if (err) return ractive.set('err', err);

			ractive.set('err');

			ractive.set('columns', [null, 'Name', 'Status', 'Partition', 'Sort', 'Indexes', 'Read Capacity', 'Write Capacity']);
			ractive.set('rows', data.map(function (t) {
				return [{ KEY: true }, { S: t }, {}, {}, {}, {}, {}, {}];
			}));
			var waterfallz = data.map(function (t) {

				var f = function f(cb) {
					//console.log(t)
					DynamoDB.client.describeTable({ TableName: t }, function (err, data) {
						if (err) return cb();

						ractive.set('rows', ractive.get('rows').map(function (row) {
							if (row[1].S === t) {

								row[2].S = data.Table.TableStatus;
								row[3].S = ((data.Table.KeySchema || []).filter(function (ks) {
									return ks.KeyType === 'HASH';
								})[0] || {}).AttributeName || '-';
								row[4].S = ((data.Table.KeySchema || []).filter(function (ks) {
									return ks.KeyType === 'RANGE';
								})[0] || {}).AttributeName || '-';
								row[5].S = (data.Table.GlobalSecondaryIndexes || []).length.toString();
								row[6].S = [data.Table.ProvisionedThroughput.ReadCapacityUnits].concat((data.Table.GlobalSecondaryIndexes || []).map(function (tr) {
									return tr.ProvisionedThroughput.ReadCapacityUnits;
								})).reduce(function (a, b) {
									return a + b;
								}, 0);
								row[7].S = [data.Table.ProvisionedThroughput.WriteCapacityUnits].concat((data.Table.GlobalSecondaryIndexes || []).map(function (tr) {
									return tr.ProvisionedThroughput.WriteCapacityUnits;
								})).reduce(function (a, b) {
									return a + b;
								}, 0);

								if ((data.Table.BillingModeSummary || {}).BillingMode === 'PAY_PER_REQUEST') {
									row[6].S = 'On-Demand';
									row[7].S = 'On-Demand';
								}
							}
							return row;
						}));
						cb();
					});
				};
				return f;
			});

			async.parallel(waterfallz, function (err) {});
		});
		//ddb.listTables({}, function(err, data) {
		//})
	},
	oninit: function oninit() {
		this.refresh_tables();
		var ractive = this;
		//ractive.on('open-table', function(e, table ) {
		//	ractive.root.fire('open-table', table )
		//})
		ractive.on('tabledata.selectrow', function (context) {
			var keypath = context.resolve();
			ractive.set(keypath + '.0.selected', !ractive.get(keypath + '.0.selected'));

			ractive.set('selection_length', ractive.get('rows').filter(function (r) {
				return r[0].selected === true;
			}).length);
		});
		ractive.on('delete', function () {
			var selected = ractive.get('rows').filter(function (r) {
				return r[0].selected === true;
			});

			if (selected.length === 0) return alert('Please select a table to delete');

			if (selected.length > 1) return alert('Please select one table at a time');

			var tablename = selected[0][1].S;

			if (confirm('Are you sure you want to delete table ' + tablename)) {

				DynamoDB.client.deleteTable({ TableName: tablename }, function (err, data) {
					if (err) return alert(err.message);

					ractive.refresh_tables();

					// refresh leftside as well
					window.ractive.findComponent('minitablelist').refresh_tables();
				});
			}
		});
		ractive.on('create', function () {
			ractive.root.findComponent('tabs').newtab('tablecreate', 'Create Table');
		});
	}
});

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Ractive.extend({
	//isolated: true,
	template: "\
		<div class='tableview {{#if active}}active{{/if}}'>\
		<div style='position: absolute;top: 0px;left: 0px;bottom: 0px;right: 0px;overflow-x: auto;'>\
			<div style='padding: 30px'>\
				<h3>Create DynamoDB table</h3>\
				<br>\
				<div style='color:red'>{{ err }}</div>\
				<hr>\
				DynamoDB is a schema-less database that only requires a table name and primary key. The table's primary key is made up of one or two attributes that uniquely identify items, partition the data, and sort data within each partition.\
\
				<br><br>\
				<table style='border-collapse: separate;border-spacing: 10px;'>\
					<tr>\
						<td>Table name</td>\
						<td><input type='text' value='{{newtable.TableName}}' on-focus='focus'></td>\
					</tr>\
					<tr>\
						<td>Partition key</td>\
						<td><input type='text' value='{{ newtable.AttributeDefinitions.0.AttributeName }}'></td>\
						<td>\
							<select value='{{ newtable.AttributeDefinitions.0.AttributeType }}' on-focus='focus'>\
								<option value='S'>String</option>\
								<option value='N'>Number</option>\
								<option value='B'>Binary</option>\
							</select>\
						</td>\
					</tr>\
					<tr>\
						<td></td>\
						<td><input type='checkbox' checked='{{newtable.sort_enabled}}' />Add sort key</td>\
					</tr>\
					{{#if newtable.sort_enabled}}\
					<tr>\
						<td>Sort key</td>\
						<td><input type='text' value='{{newtable.sort_key_name}}' on-focus='focus'></td>\
						<td>\
							<select value='{{ newtable.sort_key_type}}' on-focus='focus'>\
								<option value='S'>String</option>\
								<option value='N'>Number</option>\
								<option value='B'>Binary</option>\
							</select>\
						</td>\
					</tr>\
					{{/if}}\
				</table>\
				<br><br>\
				<h4>Secondary indexes</h4>\
				<table style='border-collapse: separate;border-spacing: 10px;'>\
					<tr style='background-color: #eadfdf'>\
						<td>Name</td>\
						<td>Type</td>\
						<td>Partition key</td>\
						<td>Sort key</td>\
						<td>Projection type</td>\
						<td>Projected attributes</td>\
						<td></td>\
					</tr>\
					{{#newtable.LocalSecondaryIndexes:i}}\
					<tr style='background-color: #ffefef'>\
						<td><input type='text' value='{{.IndexName}}' on-focus='focus' /></td>\
						<td>LSI</td>\
						<td><input type='text' value='{{ newtable.AttributeDefinitions.0.AttributeName }}' disabled> (\
							{{#if newtable.AttributeDefinitions.0.AttributeType === 'S' }}String{{/if}}\
							{{#if newtable.AttributeDefinitions.0.AttributeType === 'N' }}Number{{/if}}\
							{{#if newtable.AttributeDefinitions.0.AttributeType === 'B' }}Binary{{/if}}\
						)</td>\
						<td>\
							{{#.KeySchema }}\
								{{#if .KeyType === 'RANGE'}}\
									<input type='text' value='{{ .AttributeName }}' />\
									<select value='{{ .AttributeType }}'>\
										<option value='S'>String</option>\
										<option value='N'>Number</option>\
										<option value='B'>Binary</option>\
									</select>\
								{{/if}}\
							{{/.KeySchema }}\
						</td>\
						<td>\
							<select value='{{.Projection.ProjectionType}}'>\
								<option value='ALL'>ALL</option>\
								<option value='KEYS_ONLY'>KEYS_ONLY</option>\
								<option value='INCLUDE'>INCLUDE</option>\
							</select>\
						</td>\
						<td>\
							{{#if .Projection.ProjectionType === 'INCLUDE'}}\
\
							{{#.Projection.NonKeyAttributes}}\
								<span class='badge badge-info'>{{.}}</span><br>\
							{{/.Projection.NonKeyAttributes}}\
\
							<input type='text' value='{{ ~/nonkeyattribute }}' /><a class='btn btn-xs btn-primary' on-click='add-nonkey-attribute'><i class='icon zmdi zmdi-plus'></i></a>\
\
							{{/if}}\
						</td>\
						<td>\
							<a class='btn btn-xs btn-danger' on-click='lsi-delete'><i class='zmdi zmdi-delete'></i></a>\
						</td>\
					</tr>\
					{{/newtable.LocalSecondaryIndexes}}\
\
\
					{{#newtable.GlobalSecondaryIndexes:i}}\
					<tr style='background-color: #ffefef'>\
						<td><input type='text' value='{{.IndexName}}' on-focus='focus' /></td>\
						<td>GSI</td>\
						<td>\
							{{#.KeySchema }}\
								{{#if .KeyType === 'HASH'}}\
									<input type='text' value='{{ .AttributeName }}' />\
									<select value='{{ .AttributeType }}'>\
										<option value='S'>String</option>\
										<option value='N'>Number</option>\
										<option value='B'>Binary</option>\
									</select>\
								{{/if}}\
							{{/.KeySchema }}\
						</td>\
						<td>\
							{{#.KeySchema }}\
								{{#if .KeyType === 'RANGE'}}\
									<input type='text' value='{{ .AttributeName }}' />\
									<select value='{{ .AttributeType }}'>\
										<option value='S'>String</option>\
										<option value='N'>Number</option>\
										<option value='B'>Binary</option>\
									</select>\
								{{/if}}\
							{{/.KeySchema }}\
						</td>\
						<td>\
							<select value='{{.Projection.ProjectionType}}'>\
								<option value='ALL'>ALL</option>\
								<option value='KEYS_ONLY'>KEYS_ONLY</option>\
								<option value='INCLUDE'>INCLUDE</option>\
							</select>\
						</td>\
						<td>\
							{{#if .Projection.ProjectionType === 'INCLUDE'}}\
\
							{{#.Projection.NonKeyAttributes}}\
								<span class='badge badge-info'>{{.}}</span><br>\
							{{/.Projection.NonKeyAttributes}}\
\
							<input type='text' value='{{ ~/nonkeyattribute }}' /><a class='btn btn-xs btn-primary' on-click='add-nonkey-attribute'><i class='icon zmdi zmdi-plus'></i></a>\
\
							{{/if}}\
						</td>\
						<td>\
							<a class='btn btn-xs btn-danger' on-click='gsi-delete'><i class='zmdi zmdi-delete'></i></a>\
						</td>\
					</tr>\
					{{/newtable.GlobalSecondaryIndexes}}\
\
				</table>\
				<a class='btn btn-md btn-default' on-click='lsi-add'>Add LSI</a>\
				<a class='btn btn-md btn-default' on-click='gsi-add'>Add GSI</a>\
\
\
\
				<br>\
				<br>\
				<h4>Read/write capacity mode</h4>\
				<div>\
					Select on-demand if you want to pay only for the read and writes you perform, with no capacity planning required. Select provisioned to save on throughput costs if you can reliably estimate your application's throughput requirements.\
					See the <a target='_blank' href='http://aws.amazon.com/dynamodb/pricing'>DynamoDB pricing page</a> and <a target='_blank' href='http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ProvisionedThroughput.html'>DynamoDB Developer Guide</a> to learn more.\
					<br><br>Read/write capacity mode can be changed later.\
				</div>\
				<table style='border-collapse: separate;border-spacing: 10px;'>\
					<tr>\
						<td></td>\
						<td><input type='radio' name='{{newtable.BillingMode}}' value='PROVISIONED'> Provisioned</td>\
						<td><input type='radio' name='{{newtable.BillingMode}}' value='PAY_PER_REQUEST'> On-demand</td>\
					</tr>\
				</table>\
\
				<br>\
				<br>\
				<h4>Provisioned capacity</h4>\
\
\
				{{#if newtable.BillingMode === 'PROVISIONED'}}\
				<table cellpadding='10'>\
					<tr>\
						<td></td>\
						<td>Read capacity</td>\
						<td>Write capacity</td>\
					</tr>\
					<tr>\
						<td>Table</td>\
						<td><input type='text' value='{{newtable.ProvisionedThroughput.ReadCapacityUnits}}'  size='4' on-focus='focus' /></td>\
						<td><input type='text' value='{{newtable.ProvisionedThroughput.WriteCapacityUnits}}' size='4' on-focus='focus' /></td>\
					</tr>\
					{{#newtable.GlobalSecondaryIndexes:i}}\
					<tr>\
						<td>{{.IndexName}} ( GSI )</td>\
						<td><input type='text' value='{{.ProvisionedThroughput.ReadCapacityUnits}}'  size='4' on-focus='focus' /></td>\
						<td><input type='text' value='{{.ProvisionedThroughput.WriteCapacityUnits}}' size='4' on-focus='focus' /></td>\
					</tr>\
					{{/newtable.GlobalSecondaryIndexes}}\
				</table>\
				{{/if}}\
\
\
				{{#if newtable.BillingMode === 'PAY_PER_REQUEST'}}\
					Not applicable because read/write capacity mode is on-demand.\
				{{/if}}\
\
				<br>\
				<hr>\
				<div style='color:red'>{{ errorMessage }}&nbsp;</div>\
				<br>\
				<a class='btn btn-md btn-primary' on-click='create'>Create</a>\
				<br>\
			</div>\
		</div>\
		</div>\
	",
	data: function data() {
		return {
			newtable: {
				BillingMode: 'PROVISIONED',
				ProvisionedThroughput: {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1
				},

				AttributeDefinitions: [{
					AttributeName: '',
					AttributeType: 'S'
				}],
				LocalSecondaryIndexes: [],
				GlobalSecondaryIndexes: []
			}
		};
	},

	oninit: function oninit() {
		var ractive = this;
		ractive.on('lsi-add', function () {
			ractive.push('newtable.LocalSecondaryIndexes', {
				IndexName: '',
				KeySchema: [{
					AttributeName: ractive.get('newtable.AttributeDefinitions.0.AttributeName'),
					KeyType: 'HASH'
				}, {
					AttributeName: '',
					KeyType: 'RANGE'
				}],
				Projection: {
					ProjectionType: 'ALL',
					NonKeyAttributes: []
				}
			});
		});
		ractive.on('gsi-add', function () {
			ractive.push('newtable.GlobalSecondaryIndexes', {
				IndexName: '',
				KeySchema: [{
					AttributeName: '',
					KeyType: 'HASH'
				}, {
					AttributeName: '',
					KeyType: 'RANGE'
				}],
				Projection: {
					ProjectionType: 'ALL',
					NonKeyAttributes: []
				},
				ProvisionedThroughput: {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1
				}
			});
		});
		ractive.on('add-nonkey-attribute', function (e) {
			var keypath = e.resolve() + '.Projection.NonKeyAttributes';
			ractive.push(keypath, ractive.get('nonkeyattribute'));
			ractive.set(keypath, ractive.get(keypath).filter(function (value, index, self) {
				return self.indexOf(value) === index;
			}));
			ractive.set('nonkeyattribute');
		});
		ractive.on('lsi-delete', function (e) {
			ractive.set('newtable.LocalSecondaryIndexes', ractive.get('newtable.LocalSecondaryIndexes').filter(function (val, key) {
				return e.resolve() !== 'newtable.LocalSecondaryIndexes.' + key;
			}));
		});
		ractive.on('gsi-delete', function (e) {
			ractive.set('newtable.GlobalSecondaryIndexes', ractive.get('newtable.GlobalSecondaryIndexes').filter(function (val, key) {
				return e.resolve() !== 'newtable.GlobalSecondaryIndexes.' + key;
			}));
		});

		ractive.observe('newtable.AttributeDefinitions.0.AttributeName', function () {
			ractive.set('newtable.LocalSecondaryIndexes', ractive.get('newtable.LocalSecondaryIndexes').map(function (lsi) {
				lsi.KeySchema[0].AttributeName = ractive.get('newtable.AttributeDefinitions.0.AttributeName');
				return lsi;
			}));
		});

		ractive.on('focus', function () {
			ractive.set('errorMessage');
		});
		ractive.on('create', function () {
			ractive.set('errorMessage');

			var newtable = JSON.parse(JSON.stringify(ractive.get('newtable')));
			console.log('newtable', newtable);

			var payload = {
				TableName: newtable.TableName,
				BillingMode: newtable.BillingMode,
				AttributeDefinitions: newtable.AttributeDefinitions,
				KeySchema: [{
					AttributeName: newtable.AttributeDefinitions[0].AttributeName,
					KeyType: "HASH"
				}],
				ProvisionedThroughput: {
					ReadCapacityUnits: newtable.ProvisionedThroughput.ReadCapacityUnits,
					WriteCapacityUnits: newtable.ProvisionedThroughput.WriteCapacityUnits
				},
				GlobalSecondaryIndexes: newtable.GlobalSecondaryIndexes,
				LocalSecondaryIndexes: newtable.LocalSecondaryIndexes
			};

			if (ractive.get('newtable.sort_enabled')) {
				payload.KeySchema.push({
					AttributeName: newtable.sort_key_name,
					KeyType: "RANGE"
				});
				payload.AttributeDefinitions.push({
					AttributeName: newtable.sort_key_name,
					AttributeType: newtable.sort_key_type
				});
			}

			payload.LocalSecondaryIndexes = payload.LocalSecondaryIndexes.map(function (lsi) {
				if (lsi.Projection.ProjectionType !== 'INCLUDE') delete lsi.Projection.NonKeyAttributes;

				if (payload.AttributeDefinitions.map(function (atd) {
					return atd.AttributeName + '.' + atd.AttributeType;
				}).indexOf(lsi.KeySchema[1].AttributeName + '.' + lsi.KeySchema[1].AttributeType) === -1) payload.AttributeDefinitions.push({
					AttributeName: lsi.KeySchema[1].AttributeName,
					AttributeType: lsi.KeySchema[1].AttributeType
				});
				delete lsi.KeySchema[1].AttributeType;

				return lsi;
			});

			payload.GlobalSecondaryIndexes = payload.GlobalSecondaryIndexes.map(function (gsi) {
				if (gsi.Projection.ProjectionType !== 'INCLUDE') delete gsi.Projection.NonKeyAttributes;

				// add attribute, if not exists
				if (payload.AttributeDefinitions.map(function (atd) {
					return atd.AttributeName + '.' + atd.AttributeType;
				}).indexOf(gsi.KeySchema[0].AttributeName + '.' + gsi.KeySchema[0].AttributeType) === -1) payload.AttributeDefinitions.push({
					AttributeName: gsi.KeySchema[0].AttributeName,
					AttributeType: gsi.KeySchema[0].AttributeType
				});
				delete gsi.KeySchema[0].AttributeType;

				if (gsi.KeySchema[1].AttributeName.trim().length) {
					if (payload.AttributeDefinitions.map(function (atd) {
						return atd.AttributeName + '.' + atd.AttributeType;
					}).indexOf(gsi.KeySchema[1].AttributeName + '.' + gsi.KeySchema[1].AttributeType) === -1) payload.AttributeDefinitions.push({
						AttributeName: gsi.KeySchema[1].AttributeName,
						AttributeType: gsi.KeySchema[1].AttributeType
					});
					delete gsi.KeySchema[1].AttributeType;
				} else {
					gsi.KeySchema = [gsi.KeySchema[0]];
				}

				return gsi;
			});

			if (!payload.LocalSecondaryIndexes.length) delete payload.LocalSecondaryIndexes;

			if (!payload.GlobalSecondaryIndexes.length) delete payload.GlobalSecondaryIndexes;

			DynamoDB.client.createTable(payload, function (err, data) {
				if (err) {
					ractive.set('errorMessage', err.message);
					return;
				}
				window.ractive.findComponent('minitablelist').refresh_tables();

				// fulltablelist does not exist
				//ractive.root.findComponent('tablelist').refresh_tables()
			});
		});
	}
});

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _info = __webpack_require__(48);

var _info2 = _interopRequireDefault(_info);

var _alarms = __webpack_require__(49);

var _alarms2 = _interopRequireDefault(_alarms);

var _capacity = __webpack_require__(50);

var _capacity2 = _interopRequireDefault(_capacity);

var _indexes = __webpack_require__(51);

var _indexes2 = _interopRequireDefault(_indexes);

var _tableglobal = __webpack_require__(52);

var _tableglobal2 = _interopRequireDefault(_tableglobal);

var _tablebackup = __webpack_require__(53);

var _tablebackup2 = _interopRequireDefault(_tablebackup);

var _tabletriggers = __webpack_require__(54);

var _tabletriggers2 = _interopRequireDefault(_tabletriggers);

var _tablemetrics = __webpack_require__(55);

var _tablemetrics2 = _interopRequireDefault(_tablemetrics);

var _tableitems = __webpack_require__(56);

var _tableitems2 = _interopRequireDefault(_tableitems);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = Ractive.extend({
	isolated: true,
	components: {
		tableinfo: _info2.default,
		tablealarms: _alarms2.default,
		tablecapacity: _capacity2.default,
		tableindexes: _indexes2.default,
		tableglobal: _tableglobal2.default,
		tablebackup: _tablebackup2.default,
		tabletriggers: _tabletriggers2.default,
		tablemetrics: _tablemetrics2.default,
		tableitems: _tableitems2.default
	},
	template: "\
		<div class='tableview {{#if active}}active{{/if}}'>\
			<div class='tableview-table-tabs noselect'>\
				<a class='btn-tableview-tab {{#if tab === 'info'}}active{{/if}}'         on-click='@this.set('tab','info')'><!-- <i class='zmdi zmdi-info'></i>--> Overview </a>\
				<a class='btn-tableview-tab {{#if tab === 'data'}}active{{/if}}'         on-click='@this.set('tab','data')'><!--<i class='zmdi zmdi-format-list-bulleted'></i>--> Items</a>\
				<a class='btn-tableview-tab {{#if tab === 'metrics'}}active{{/if}}'      on-click='@this.set('tab','metrics')'><!--<i class='zmdi zmdi-chart'></i>--> Metrics</a>\
				<a class='btn-tableview-tab {{#if tab === 'alarms'}}active{{/if}}'       on-click='@this.set('tab','alarms')'><!--<i class='zmdi zmdi-notifications'></i>--> Alarms</a>\
				<a class='btn-tableview-tab {{#if tab === 'capacity'}}active{{/if}}'     on-click='@this.set('tab','capacity')'><!--<i class='zmdi zmdi-memory'></i>--> Capacity</a>\
				<a class='btn-tableview-tab {{#if tab === 'indexes'}}active{{/if}}'      on-click='@this.set('tab','indexes')'><!--<i class='zmdi zmdi-format-line-spacing'></i>--> Indexes</a>\
				<a class='btn-tableview-tab {{#if tab === 'globaltables'}}active{{/if}}' on-click='@this.set('tab','globaltables')'><!--<i class='zmdi zmdi-globe'></i>--> Global Tables</a>\
				<a class='btn-tableview-tab {{#if tab === 'backups'}}active{{/if}}'      on-click='@this.set('tab','backups')'><!--<i class='zmdi zmdi-card-sd'></i>--> Backups</a>\
				<a class='btn-tableview-tab {{#if tab === 'triggers'}}active{{/if}}'     on-click='@this.set('tab','triggers')'><!--<i class='zmdi zmdi-portable-wifi'></i>--> Triggers</a>\
			</div>\
			<div style='position: absolute;top: 42px;left: 30px;right: 30px;bottom: 0px;'>\
				{{#if err}}\
					<br> {{ err.errorMessage || err.message }}\
				{{else}}\
					{{#if describeTable === null }}\
						<br>Loading...\
					{{else}}\
\
						{{#if tab === 'info'}}\
							<tableinfo table='{{.table}}' describeTable='{{describeTable}}' />\
						{{/if}}\
\
						{{#if tab === 'data'}}\
							<tableitems table='{{.table}}' describeTable='{{describeTable}}' type='{{.type}}' scan='{{.scan}}' query='{{.query}}' sql='{{.sql}}' />\
						{{/if}}\
\
						{{#if tab === 'metrics'}}\
							<tablemetrics table='{{.table}}' describeTable='{{describeTable}}' />\
						{{/if}}\
\
						{{#if tab === 'alarms'}}\
							<tablealarms table='{{.table}}' describeTable='{{describeTable}}' />\
						{{/if}}\
\
						{{#if tab === 'capacity'}}\
							<tablecapacity table='{{.table}}' describeTable='{{describeTable}}' />\
						{{/if}}\
\
						{{#if tab === 'indexes'}}\
							<tableindexes table='{{.table}}' describeTable='{{describeTable}}' />\
						{{/if}}\
\
						{{#if tab === 'globaltables'}}\
							<tableglobal table='{{.table}}' describeTable='{{describeTable}}' />\
						{{/if}}\
\
						{{#if tab === 'backups'}}\
							<tablebackup table='{{.table}}' describeTable='{{describeTable}}' />\
						{{/if}}\
\
						{{#if tab === 'triggers'}}\
							<tabletriggers table='{{.table}}' describeTable='{{describeTable}}' />\
						{{/if}}\
\
					{{/if}}\
				{{/if}}\
\
			</div>\
		</div>\
	",
	data: function data() {
		return {
			tab: 'info',
			describeTable: null
		};
	},

	describe_table: function describe_table(cb) {
		var ractive = this;
		DynamoDB.client.describeTable({ TableName: ractive.get('table.name') }, function (err, data) {
			if (err) return ractive.set('err', err);

			ractive.set('err');
			ractive.set('describeTable', data.Table);
			if (typeof cb === "function") cb();
		});
	},

	oninit: function oninit() {

		var ractive = this;
		//ractive.observe('tab', function( tab ) {
		//})
		ractive.describe_table();
	}
});

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Ractive.extend({
	template: '\n\t\t<div class=\'tableinfo\' style="position: absolute;top: 0;left: 0;right: 0;bottom: 0;overflow: auto;font-size: 14px;">\n\t\t\t\t<div style=\'padding: 30px\'>\n\t\t\t\t\t<h3>\n\t\t\t\t\t\tStream details\n\t\t\t\t\t</h3>\n\t\t\t\t\t<hr>\n\n\t\t\t\t\t{{#if StreamEditing}}\n\t\t\t\t\t\t<table>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td align=\'right\' width=\'350\'><b>View type</b></td>\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t<input type=\'radio\' name=\'{{NewStreamViewType}}\' value=\'KEYS_ONLY\'>\tKeys only - only the key attributes of the modified item<br>\n\t\t\t\t\t\t\t\t\t<input type=\'radio\' name=\'{{NewStreamViewType}}\' value=\'NEW_IMAGE\'>\tNew image - the entire item, as it appears after it was modified<br>\n\t\t\t\t\t\t\t\t\t<input type=\'radio\' name=\'{{NewStreamViewType}}\' value=\'OLD_IMAGE\'>\tOld image - the entire item, as it appeared before it was modified<br>\n\t\t\t\t\t\t\t\t\t<input type=\'radio\' name=\'{{NewStreamViewType}}\' value=\'NEW_AND_OLD_IMAGES\'> New and old images - both the new and the old images of the item<br>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td align=\'right\' width=\'350\'></td>\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t<a class=\'btn btn-sm btn-primary\' on-click=\'update-stream\'>Enable</a>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t</table>\n\t\t\t\t\t{{else}}\n\t\t\t\t\t\t<table style=\'border-collapse: separate;border-spacing: 10px;\'>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td align=\'right\' width=\'350\'><b>Stream enabled</b></td>\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t{{#if !selfDescribeTable.StreamSpecification}}\n\t\t\t\t\t\t\t\t\t\tno\n\t\t\t\t\t\t\t\t\t{{else}}\n\t\t\t\t\t\t\t\t\t\t{{#if selfDescribeTable.StreamSpecification.StreamEnabled === true }}\n\t\t\t\t\t\t\t\t\t\tyes\n\t\t\t\t\t\t\t\t\t\t{{else}}\n\t\t\t\t\t\t\t\t\t\tno\n\t\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td align=\'right\' width=\'350\'><b>View type\t</b></td>\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t{{#if !selfDescribeTable.StreamSpecification}}\n\t\t\t\t\t\t\t\t\t\t-\n\t\t\t\t\t\t\t\t\t{{else}}\n\t\t\t\t\t\t\t\t\t\t{{selfDescribeTable.StreamSpecification.StreamViewType}}\n\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td align=\'right\' width=\'350\'><b>Latest stream ARN</b></td>\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t{{#if !selfDescribeTable.LatestStreamArn}}\n\t\t\t\t\t\t\t\t\t\t-\n\t\t\t\t\t\t\t\t\t{{else}}\n\t\t\t\t\t\t\t\t\t\t{{selfDescribeTable.LatestStreamArn}}\n\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td align=\'right\' width=\'350\'>\n\t\t\t\t\t\t\t\t\t{{#if selfDescribeTable.StreamSpecification.StreamEnabled === true}}\n\t\t\t\t\t\t\t\t\t\t<a class=\'btn btn-xs btn-default\' on-click=\'disable-stream\'>Disable Stream</a>\n\t\t\t\t\t\t\t\t\t{{else}}\n\t\t\t\t\t\t\t\t\t\t<a class=\'btn btn-xs btn-default\' on-click=\'manage-stream\'>Manage Stream</a>\n\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t</table>\n\t\t\t\t\t{{/if}}\n\n\n\t\t\t\t\t<h3>\n\t\t\t\t\t\tTable details\n\t\t\t\t\t\t<a class=\'btn btn-xs btn-default pull-right\' on-click=\'refresh-table\'><i class=\'icon zmdi zmdi-refresh\'></i></a>\n\t\t\t\t\t</h3>\n\t\t\t\t\t<div style=\'color:red\'>{{ err }}</div>\n\t\t\t\t\t<hr>\n\t\t\t\t\t<table style=\'border-collapse: separate;border-spacing: 10px;\'>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\' width=\'350\'><b>Table ID</b></td>\n\t\t\t\t\t\t\t<td> {{ selfDescribeTable.TableId }}</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\' width=\'350\'><b>Table name</b></td>\n\t\t\t\t\t\t\t<td> {{ selfDescribeTable.TableName }}</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Primary partition key</b></td>\n\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t{{#selfDescribeTable.KeySchema:i}}\n\t\t\t\t\t\t\t\t\t{{#if .KeyType === \'HASH\'}}\n\t\t\t\t\t\t\t\t\t\t{{.AttributeName}}\n\t\t\t\t\t\t\t\t\t\t{{# ~/selfDescribeTable.AttributeDefinitions }}\n\t\t\t\t\t\t\t\t\t\t\t{{#if .AttributeName === ~/.selfDescribeTable.KeySchema[i].AttributeName }}\n\t\t\t\t\t\t\t\t\t\t\t\t{{#if .AttributeType === \'S\'}}\n\t\t\t\t\t\t\t\t\t\t\t\t\t( String )\n\t\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t\t\t\t\t{{#if .AttributeType === \'N\'}}\n\t\t\t\t\t\t\t\t\t\t\t\t\t( Number )\n\t\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t\t\t\t\t{{#if .AttributeType === \'B\'}}\n\t\t\t\t\t\t\t\t\t\t\t\t\t( Binary )\n\t\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t\t\t{{/}}\n\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t{{/selfDescribeTable.KeySchema}}\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Primary sort key</b></td>\n\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t{{#selfDescribeTable.KeySchema:i}}\n\t\t\t\t\t\t\t\t\t{{#if .KeyType === \'RANGE\'}}\n\t\t\t\t\t\t\t\t\t\t{{.AttributeName}}\n\t\t\t\t\t\t\t\t\t\t{{# ~/selfDescribeTable.AttributeDefinitions }}\n\t\t\t\t\t\t\t\t\t\t\t{{#if .AttributeName === ~/.selfDescribeTable.KeySchema[i].AttributeName }}\n\t\t\t\t\t\t\t\t\t\t\t\t{{#if .AttributeType === \'S\'}}\n\t\t\t\t\t\t\t\t\t\t\t\t\t( String )\n\t\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t\t\t\t\t{{#if .AttributeType === \'N\'}}\n\t\t\t\t\t\t\t\t\t\t\t\t\t( Number )\n\t\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t\t\t\t\t{{#if .AttributeType === \'B\'}}\n\t\t\t\t\t\t\t\t\t\t\t\t\t( Binary )\n\t\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t\t\t{{/}}\n\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t{{/selfDescribeTable.KeySchema}}\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Point-in-time recovery</b></td>\n\t\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Encryption</b></td>\n\t\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Time to live attribute</b></td>\n\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t{{#if TimeToLiveDescription}}\n\t\t\t\t\t\t\t\t\t{{#if TimeToLiveDescriptionEditing}}\n\t\t\t\t\t\t\t\t\t\tTTL attribute <input type=\'text\' value=\'{{TimeToLiveDescriptionNewField}}\'> <a class=\'btn btn-xs btn-primary\' on-click=\'update-ttl\'>Save</a>\n\t\t\t\t\t\t\t\t\t{{else}}\n\t\t\t\t\t\t\t\t\t\t{{#if TimeToLiveDescriptionErr}}\n\t\t\t\t\t\t\t\t\t\t\tError {{TimeToLiveDescriptionErr.errorMessage}}\n\t\t\t\t\t\t\t\t\t\t{{else}}\n\t\t\t\t\t\t\t\t\t\t\t{{#if TimeToLiveDescription.TimeToLiveStatus === \'ENABLED\'}}\n\t\t\t\t\t\t\t\t\t\t\t{{else}}\n\t\t\t\t\t\t\t\t\t\t\t\t{{TimeToLiveDescription.TimeToLiveStatus}}\n\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\n\t\t\t\t\t\t\t\t\t\t\t{{TimeToLiveDescription.AttributeName}}\n\n\t\t\t\t\t\t\t\t\t\t\t{{#if TimeToLiveDescription.TimeToLiveStatus === \'DISABLED\'}}\n\t\t\t\t\t\t\t\t\t\t\t\t<a href=\'javascript:void(0)\' on-click=\'manage-ttl\' >Manage TTL</a>\n\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\n\t\t\t\t\t\t\t\t\t\t\t{{#if TimeToLiveDescription.TimeToLiveStatus === \'ENABLED\'}}\n\t\t\t\t\t\t\t\t\t\t\t\t<a href=\'javascript:void(0)\' on-click=\'disable-ttl\' >Disable TTL</a>\n\t\t\t\t\t\t\t\t\t\t\t{{/if}}\n\n\t\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t{{else}}\n\t\t\t\t\t\t\t\t\tLoading...\n\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Table status</b></td>\n\t\t\t\t\t\t\t<td>{{selfDescribeTable.TableStatus}}</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Creation date</b></td>\n\t\t\t\t\t\t\t<td>{{selfDescribeTable.CreationDateTime}}</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Read/write capacity mode</b></td>\n\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t{{#if selfDescribeTable.BillingModeSummary.BillingMode === \'PROVISIONED\'}}Provisioned{{/if}}\n\t\t\t\t\t\t\t\t{{#if selfDescribeTable.BillingModeSummary.BillingMode === \'PAY_PER_REQUEST\'}}On-Demand{{/if}}\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Provisioned read capacity units</b></td>\n\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t{{#if selfDescribeTable.BillingModeSummary.BillingMode === \'PROVISIONED\'}}\n\t\t\t\t\t\t\t\t\t{{selfDescribeTable.ProvisionedThroughput.ReadCapacityUnits}}\n\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t{{#if selfDescribeTable.BillingModeSummary.BillingMode === \'PAY_PER_REQUEST\'}}-{{/if}}\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Provisioned write capacity units</b></td>\n\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t{{#if selfDescribeTable.BillingModeSummary.BillingMode === \'PROVISIONED\'}}\n\t\t\t\t\t\t\t\t\t{{selfDescribeTable.ProvisionedThroughput.WriteCapacityUnits}}\n\t\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t\t\t{{#if selfDescribeTable.BillingModeSummary.BillingMode === \'PAY_PER_REQUEST\'}}-{{/if}}\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Last decrease time</b></td>\n\t\t\t\t\t\t\t<td>{{selfDescribeTable.ProvisionedThroughput.LastDecreaseDateTime || \'-\' }}</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Last increase time</b></td>\n\t\t\t\t\t\t\t<td>{{selfDescribeTable.ProvisionedThroughput.LastIncreaseDateTime || \'-\'}}</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Storage size (in bytes)</b></td>\n\t\t\t\t\t\t\t<td>{{selfDescribeTable.TableSizeBytes }}</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Item count</b></td>\n\t\t\t\t\t\t\t<td>{{ selfDescribeTable.ItemCount }}</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Region</b></td>\n\t\t\t\t\t\t\t<td></td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td align=\'right\'><b>Amazon Resource Name (ARN)</b></td>\n\t\t\t\t\t\t\t<td> {{selfDescribeTable.TableArn}}</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t</table>\n\t\t\t\t\t<small>Storage size and item count are not updated in real-time. They are updated periodically, roughly every six hours.</small>\n\t\t\t\t</div>\n\t\t</div>\n\t',

	refresh_table: function refresh_table() {
		var ractive = this;

		ractive.set('selfDescribeTable');
		ractive.set('TimeToLiveDescriptionEditing');
		ractive.set('TimeToLiveDescription');
		ractive.set('TimeToLiveDescriptionErr');
		ractive.set('TimeToLiveDescriptionNewField', '');
		ractive.set('StreamEditing');

		async.waterfall([function (cb) {

			DynamoDB.client.describeTable({ TableName: ractive.get('table.name') }, function (err, data) {
				if (err) return cb(err);

				ractive.set('selfDescribeTable', data.Table);
				cb();
			});
		}, function (cb) {
			DynamoDB.client.describeTimeToLive({ TableName: ractive.get('table.name') }, function (err, data) {
				if (err) return ractive.set('TimeToLiveDescriptionErr', err);

				ractive.set('TimeToLiveDescription', data.TimeToLiveDescription);
				cb();
			});
		}], function (err) {
			if (err) ractive.set('err', err.errorMessage);
		});
	},
	data: function data() {
		return {
			selfDescribeTable: null
		};
	},
	oninit: function oninit() {
		var ractive = this;

		ractive.set('selfDescribeTable', ractive.get('describeTable'));

		ractive.on('manage-ttl', function () {
			ractive.set('TimeToLiveDescriptionEditing', true);
			return false;
		});

		ractive.on('update-ttl', function () {
			var newfield = ractive.get('TimeToLiveDescriptionNewField').trim();
			if (!newfield) return alert('invalid field name');

			var params = {
				TableName: ractive.get('table.name'),
				TimeToLiveSpecification: {
					AttributeName: newfield,
					Enabled: true
				}
			};
			DynamoDB.client.updateTimeToLive(params, function (err, data) {
				if (err) return alert('failed ' + err.errorMessage);

				ractive.refresh_table();
			});
		});
		ractive.on('disable-ttl', function () {
			if (confirm('Are you sure you want to disable TTL ?')) {
				var params = {
					TableName: ractive.get('table.name'),
					TimeToLiveSpecification: {
						AttributeName: ractive.get('TimeToLiveDescription.AttributeName'),
						Enabled: false
					}
				};
				DynamoDB.client.updateTimeToLive(params, function (err, data) {
					if (err) return alert('failed ' + err.errorMessage);

					ractive.refresh_table();
				});
			}
		});

		ractive.on('manage-stream', function () {
			ractive.set('StreamEditing', true);
		});
		ractive.on('update-stream', function () {
			var type = ractive.get('NewStreamViewType');
			DynamoDB.client.updateTable({
				TableName: ractive.get('table.name'),
				StreamSpecification: {
					StreamEnabled: true,
					StreamViewType: type
				}
			}, function (err, data) {
				if (err) return alert('Failed ' + err.errorMessage);

				ractive.refresh_table();
				cb();
			});
		});
		ractive.on('disable-stream', function () {
			if (confirm('Disable stream ?')) {
				DynamoDB.client.updateTable({
					TableName: ractive.get('table.name'),
					StreamSpecification: {
						StreamEnabled: false
					}
				}, function (err, data) {
					if (err) return alert('Failed ' + err.errorMessage);

					ractive.refresh_table();
					cb();
				});
			}
		});

		ractive.on('refresh-table', function () {
			ractive.refresh_table();
		});
		ractive.refresh_table();
	}
});

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Ractive.extend({
	template: "\n\t\t<div style='padding: 30px'>\n\t\t\t<h3>Alarms</h3>\n\t\t</div>\n\t"
});

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Ractive.extend({
	template: '\n\n\t\t\t<div style=\'padding: 30px\'>\n\t\t\t\t<h3>\n\t\t\t\t\tProvisioned capacity\n\t\t\t\t\t<a class=\'btn btn-xs btn-default pull-right\' on-click=\'refresh-table\'><i class=\'icon zmdi zmdi-refresh\'></i></a>\n\t\t\t\t</h3>\n\t\t\t\t<hr>\n\t\t\t\t\t{{#if describeTable.BillingModeSummary.BillingMode === \'PAY_PER_REQUEST\'}}\n\t\t\t\t\t\tNot applicable because read/write capacity mode is on-demand.<br>\n\t\t\t\t\t{{else}}\n\t\t\t\t\t\t<table>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td width=\'160\' align=\'right\'></td>\n\t\t\t\t\t\t\t\t<td width=\'160\'>Read capacity units</td>\n\t\t\t\t\t\t\t\t<td width=\'160\'>Write capacity units</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td>Table</td>\n\t\t\t\t\t\t\t\t<td><input type=\'text\' size=\'4\' value=\'{{describeTable.ProvisionedThroughput.ReadCapacityUnits}}\' on-focus=\'focus\' /></td>\n\t\t\t\t\t\t\t\t<td><input type=\'text\' size=\'4\' value=\'{{describeTable.ProvisionedThroughput.WriteCapacityUnits}}\' on-focus=\'focus\' /></td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t{{#describeTable.GlobalSecondaryIndexes}}\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td>{{ .IndexName }}</td>\n\t\t\t\t\t\t\t\t<td><input type=\'text\' size=\'4\' value=\'{{.ProvisionedThroughput.ReadCapacityUnits}}\' on-focus=\'focus\' /></td>\n\t\t\t\t\t\t\t\t<td><input type=\'text\' size=\'4\' value=\'{{.ProvisionedThroughput.WriteCapacityUnits}}\' on-focus=\'focus\' /></td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t{{/describeTable.GlobalSecondaryIndexes}}\n\t\t\t\t\t\t</table>\n\t\t\t\t\t{{/if}}\n\n\n\n\t\t\t\t<h3>Auto Scaling</h3>\n\t\t\t\t<hr/>\n\t\t\t\t\t<small>Auto Scaling not supported by this UI</small>\n\t\t\t\t\t<br>\n\t\t\t\t\t<div style=\'color:red\'>{{ err }}&nbsp;</div>\n\t\t\t\t\t<table>\n\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t<td width=\'160\'>\n\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t<a class=\'btn btn-md btn-primary\' on-click=\'save\'>Save</a>\n\t\t\t\t\t\t\t\t<a class=\'btn btn-md btn-default\' on-click=\'cancel\'>Cancel</a>\n\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t</tr>\n\t\t\t\t\t</table>\n\t\t\t</div>\n\n\t',
	oninit: function oninit() {
		var ractive = this;
		var refresh_table = function refresh_table() {
			ractive.set('describeTable', {});
			DynamoDB.client.describeTable({ TableName: ractive.get('table.name') }, function (err, data) {
				if (err) return ractive.set('err', err.message);

				console.log(data);
				ractive.set('describeTable', data.Table);
				ractive.set('originalDescribeTable', JSON.parse(JSON.stringify(data.Table))); // this wont change
			});
		};
		ractive.on('cancel', function () {
			refresh_table();
		});
		ractive.on('focus', function () {
			ractive.set('err');
		});

		ractive.on('save', function () {

			var payload = {
				TableName: ractive.get('describeTable.TableName')
			};

			if (ractive.get('describeTable.ProvisionedThroughput.ReadCapacityUnits') !== ractive.get('originalDescribeTable.ProvisionedThroughput.ReadCapacityUnits') || ractive.get('describeTable.ProvisionedThroughput.WriteCapacityUnits') !== ractive.get('originalDescribeTable.ProvisionedThroughput.WriteCapacityUnits')) {
				payload.ProvisionedThroughput = {
					ReadCapacityUnits: ractive.get('describeTable.ProvisionedThroughput.ReadCapacityUnits'),
					WriteCapacityUnits: ractive.get('describeTable.ProvisionedThroughput.WriteCapacityUnits')
				};
			} else {}
			// if no changes, do not add obj at all
			//payload.ProvisionedThroughput = { ... }


			// each index
			if ((ractive.get('describeTable.GlobalSecondaryIndexes') || []).length) {
				payload.GlobalSecondaryIndexUpdates = [];
				ractive.get('describeTable.GlobalSecondaryIndexes').map(function (gsi, i) {
					var original_gsi = ractive.get('originalDescribeTable.GlobalSecondaryIndexes.' + i);

					console.log("gsi", gsi);
					console.log("original gsi", original_gsi);

					if (gsi.ProvisionedThroughput.ReadCapacityUnits !== ractive.get('originalDescribeTable.GlobalSecondaryIndexes.' + i + '.ProvisionedThroughput.ReadCapacityUnits') || gsi.ProvisionedThroughput.WriteCapacityUnits !== ractive.get('originalDescribeTable.GlobalSecondaryIndexes.' + i + '.ProvisionedThroughput.WriteCapacityUnits')) {
						payload.GlobalSecondaryIndexUpdates.push({
							Update: {
								IndexName: gsi.IndexName,
								ProvisionedThroughput: {
									ReadCapacityUnits: gsi.ProvisionedThroughput.ReadCapacityUnits,
									WriteCapacityUnits: gsi.ProvisionedThroughput.WriteCapacityUnits
								}
							}
						});
					}
				});
			}

			if ((payload.GlobalSecondaryIndexUpdates || []).length === 0) delete payload.GlobalSecondaryIndexUpdates;

			//console.log('payload', payload )

			DynamoDB.client.updateTable(payload, function (err, data) {
				if (err) return ractive.set('err', err.message);

				setTimeout(refresh_table, 1000);
				//console.log( err, data )
			});
		});
		ractive.on('refresh-table', function () {
			refresh_table();
		});
		refresh_table();
	}
});

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _tabledata = __webpack_require__(10);

var _tabledata2 = _interopRequireDefault(_tabledata);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = Ractive.extend({
	components: {
		tabledata: _tabledata2.default
	},
	template: '\n\t\t<div style=\'padding: 30px\'>\n\t\t\t{{#if tab === \'create\'}}\n\t\t\t\t<h3>Create Global Secondary Index</h3>\n\t\t\t\t<table cellpadding=\'10\' border=\'0\'>\n\t\t\t\t\t<tr style=\'background-color: #ffefef\'>\n\t\t\t\t\t\t<td style=\'background-color: #eadfdf\'>Name</td>\n\t\t\t\t\t\t<td><input type=\'text\' value=\'{{newindex.IndexName}}\' on-focus=\'focus\' /></td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr style=\'background-color: #ffefef\'>\n\t\t\t\t\t\t<td style=\'background-color: #eadfdf\'>Type</td>\n\t\t\t\t\t\t<td>GSI</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr style=\'background-color: #ffefef\'>\n\t\t\t\t\t\t<td style=\'background-color: #eadfdf\'>Partition key</td>\n\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t<input type=\'text\' value=\'{{ newindex.KeySchema.0.AttributeName }}\' on-focus=\'focus\' />\n\t\t\t\t\t\t\t<select value=\'{{ newindex.KeySchema.0.AttributeType }}\'>\n\t\t\t\t\t\t\t\t<option value=\'S\'>String</option>\n\t\t\t\t\t\t\t\t<option value=\'N\'>Number</option>\n\t\t\t\t\t\t\t\t<option value=\'B\'>Binary</option>\n\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr style=\'background-color: #ffefef\'>\n\t\t\t\t\t\t<td style=\'background-color: #eadfdf\'>Sort key</td>\n\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t<input type=\'text\' value=\'{{ newindex.KeySchema.1.AttributeName }}\' on-focus=\'focus\' />\n\t\t\t\t\t\t\t<select value=\'{{ newindex.KeySchema.1.AttributeType }}\'>\n\t\t\t\t\t\t\t\t<option value=\'S\'>String</option>\n\t\t\t\t\t\t\t\t<option value=\'N\'>Number</option>\n\t\t\t\t\t\t\t\t<option value=\'B\'>Binary</option>\n\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr style=\'background-color: #ffefef\'>\n\t\t\t\t\t\t<td style=\'background-color: #eadfdf\'>Projection type</td>\n\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t<select value=\'{{ newindex.Projection.ProjectionType}}\'>\n\t\t\t\t\t\t\t\t<option value=\'ALL\'>ALL</option>\n\t\t\t\t\t\t\t\t<option value=\'KEYS_ONLY\'>KEYS_ONLY</option>\n\t\t\t\t\t\t\t\t<option value=\'INCLUDE\'>INCLUDE</option>\n\t\t\t\t\t\t\t</select>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t{{#if newindex.Projection.ProjectionType === \'INCLUDE\' }}\n\t\t\t\t\t<tr style=\'background-color: #ffefef\'>\n\t\t\t\t\t\t<td style=\'background-color: #eadfdf\'>Projected attributes</td>\n\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t{{#if newindex.Projection.ProjectionType === \'INCLUDE\'}}\n\n\t\t\t\t\t\t\t{{#newindex.Projection.NonKeyAttributes}}\n\t\t\t\t\t\t\t\t<span class=\'badge badge-info\'>{{.}}</span><br>\n\t\t\t\t\t\t\t{{/newindex.Projection.NonKeyAttributes}}\n\n\t\t\t\t\t\t\t<input type=\'text\' value=\'{{ ~/nonkeyattribute }}\' on-focus=\'focus\' /><a class=\'btn btn-xs btn-primary\' on-click=\'add-nonkey-attribute\'><i class=\'icon zmdi zmdi-plus\'></i></a>\n\n\t\t\t\t\t\t\t{{/if}}\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t{{/if}}\n\t\t\t\t\t<tr style=\'background-color: #ffefef\'>\n\t\t\t\t\t\t<td style=\'background-color: #eadfdf\'>Read capacity</td>\n\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t<input type=\'text\' value=\'{{ newindex.ProvisionedThroughput.ReadCapacityUnits }}\'  size=\'4\' on-focus=\'focus\' />\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\t\t\t\t\t<tr style=\'background-color: #ffefef\'>\n\t\t\t\t\t\t<td style=\'background-color: #eadfdf\'>Write capacity</td>\n\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t<input type=\'text\' value=\'{{ newindex.ProvisionedThroughput.WriteCapacityUnits}}\' size=\'4\' on-focus=\'focus\' />\n\t\t\t\t\t\t</td>\n\t\t\t\t\t</tr>\n\n\t\t\t\t</table>\n\t\t\t\t<br>\n\t\t\t\t<div style=\'color:red\'>{{ err }}&nbsp;</div>\n\t\t\t\t<br>\n\t\t\t\t<a class=\'btn btn-md btn-primary\' on-click=\'create-gsi\'>Create</a>\n\t\t\t\t<a class=\'btn btn-md btn-default\' on-click=\'cancel-gsi\'>Cancel</a>\n\t\t\t\t<br>\n\t\t\t{{else}}\n\t\t\t\t<h3>Indexes</h3>\n\t\t\t\t<div>\n\t\t\t\t\t<a class=\'btn btn-sm btn-primary\' on-click=\'create\'>Create index</a>\n\t\t\t\t\t<a class=\'btn btn-sm btn-default\' on-click=\'delete\'>Delete index</a>\n\n\t\t\t\t\t<a class=\'btn btn-sm btn-default pull-right\' on-click=\'refresh-table\'><i class=\'icon zmdi zmdi-refresh\'></i></a>\n\t\t\t\t</div>\n\t\t\t\t<tabledata columns=\'{{columns}}\' rows=\'{{rows}}\' style=\'top: 128px\'/>\n\t\t\t{{/if}}\n\t\t</div>\n\t',

	refresh_table_indexes: function refresh_table_indexes() {
		var ractive = this;

		ractive.set('rows', (ractive.get('describeTable').LocalSecondaryIndexes || []).map(function (index) {
			var partition_key_name = ((index.KeySchema || []).filter(function (ks) {
				return ks.KeyType === 'HASH';
			})[0] || {}).AttributeName;
			var partition_key_type = { S: 'String', N: 'Number', B: 'Binary' }[ractive.get('describeTable').AttributeDefinitions.filter(function (at) {
				return at.AttributeName === ((index.KeySchema || []).filter(function (ks) {
					return ks.KeyType === 'HASH';
				})[0] || {}).AttributeName;
			})[0].AttributeType];
			var sort_key_name = ((index.KeySchema || []).filter(function (ks) {
				return ks.KeyType === 'RANGE';
			})[0] || {}).AttributeName || '';
			var sort_key_type = { S: 'String', N: 'Number', B: 'Binary' }[(ractive.get('describeTable').AttributeDefinitions.filter(function (at) {
				return at.AttributeName === ((index.KeySchema || []).filter(function (ks) {
					return ks.KeyType === 'RANGE';
				})[0] || {}).AttributeName;
			})[0] || {}).AttributeType] || '';

			return [{ KEY: true }, { S: index.IndexName }, { S: 'N/A' }, { S: 'LSI' }, { S: partition_key_name + ' (' + partition_key_type + ' )' }, { S: sort_key_name + (sort_key_type ? ' ( ' + sort_key_type + ' )' : '') }, { S: index.Projection.ProjectionType + ' ' + (index.Projection.ProjectionType === 'INCLUDE' ? index.Projection.NonKeyAttributes.join(', ') : '') }, { N: index.IndexSizeBytes.toString() }, { N: index.ItemCount.toString() }];
		}).concat((ractive.get('describeTable').GlobalSecondaryIndexes || []).map(function (index) {
			var partition_key_name;
			var partition_key_type;
			var sort_key_name;
			var sort_key_type;
			var projection = '';
			try {
				partition_key_name = ((index.KeySchema || []).filter(function (ks) {
					return ks.KeyType === 'HASH';
				})[0] || {}).AttributeName;
				partition_key_type = { S: 'String', N: 'Number', B: 'Binary' }[ractive.get('describeTable').AttributeDefinitions.filter(function (at) {
					return at.AttributeName === ((index.KeySchema || []).filter(function (ks) {
						return ks.KeyType === 'HASH';
					})[0] || {}).AttributeName;
				})[0].AttributeType];
				sort_key_name = ((index.KeySchema || []).filter(function (ks) {
					return ks.KeyType === 'RANGE';
				})[0] || {}).AttributeName || '';
				sort_key_type = { S: 'String', N: 'Number', B: 'Binary' }[(ractive.get('describeTable').AttributeDefinitions.filter(function (at) {
					return at.AttributeName === ((index.KeySchema || []).filter(function (ks) {
						return ks.KeyType === 'RANGE';
					})[0] || {}).AttributeName;
				})[0] || {}).AttributeType] || '';
				projection = index.Projection.ProjectionType + ' ' + (index.Projection.ProjectionType === 'INCLUDE' ? index.Projection.NonKeyAttributes.join(', ') : '');
			} catch (e) {}

			return [{ KEY: true }, { S: index.IndexName }, { S: index.IndexStatus }, { S: 'GSI' }, { S: partition_key_name + ' (' + partition_key_type + ' )' }, { S: sort_key_name + (sort_key_type ? ' ( ' + sort_key_type + ' )' : '') }, { S: projection }, { N: index.hasOwnProperty('IndexSizeBytes') ? index.IndexSizeBytes.toString() : 0 }, { N: index.hasOwnProperty('ItemCount') ? index.ItemCount.toString() : 0 }];
		})));
	},

	oninit: function oninit() {
		var ractive = this;
		ractive.on('tabledata.selectrow', function (context) {
			var keypath = context.resolve();
			ractive.set(keypath + '.0.selected', !ractive.get(keypath + '.0.selected'));
		});
		ractive.on('focus', function () {
			ractive.set('err');
		});
		ractive.on('create', function () {
			ractive.set('tab', 'create');
			ractive.set('newindex', {
				IndexName: '',
				KeySchema: [{
					AttributeName: '',
					AttributeType: 'S',
					KeyType: 'HASH'
				}, {
					AttributeName: '',
					AttributeType: 'S',
					KeyType: 'RANGE'
				}],
				Projection: {
					ProjectionType: 'ALL',
					NonKeyAttributes: []
				},
				ProvisionedThroughput: {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1
				}
			});
		});
		ractive.on('cancel-gsi', function () {
			ractive.set('tab');
			ractive.set('newindex');
		});

		ractive.on('add-nonkey-attribute', function (e) {
			var keypath = 'newindex.Projection.NonKeyAttributes';
			ractive.push(keypath, ractive.get('nonkeyattribute'));
			ractive.set(keypath, ractive.get(keypath).filter(function (value, index, self) {
				return self.indexOf(value) === index;
			}));
			ractive.set('nonkeyattribute');
		});
		ractive.on('create-gsi', function () {
			var newindex = JSON.parse(JSON.stringify(ractive.get('newindex')));
			var AttributeDefinitions = [];

			newindex.KeySchema.map(function (ks) {
				if (ks.KeyType === 'HASH') {
					AttributeDefinitions.push({
						AttributeName: ks.AttributeName,
						AttributeType: ks.AttributeType
					});
					delete ks.AttributeType;
				}
				if (ks.KeyType === 'RANGE') {
					if (ks.AttributeName.trim() === '') {
						newindex.KeySchema = [newindex.KeySchema[0]];
					} else {
						AttributeDefinitions.push({
							AttributeName: ks.AttributeName,
							AttributeType: ks.AttributeType
						});
						delete ks.AttributeType;
					}
				}
			});
			if (newindex.Projection.ProjectionType !== 'INCLUDE') delete newindex.Projection.NonKeyAttributes;

			var payload = {
				TableName: ractive.get('describeTable.TableName'),
				AttributeDefinitions: AttributeDefinitions,
				GlobalSecondaryIndexUpdates: []
			};

			payload.GlobalSecondaryIndexUpdates.push({
				Create: newindex
			});

			DynamoDB.client.updateTable(payload, function (err, data) {

				if (err) return ractive.set('err', err.message || err.errorMessage);

				ractive.set('tab');
				ractive.set('newindex');

				ractive.set('rows', null);
				setTimeout(function () {
					ractive.parent.describe_table(function () {
						ractive.refresh_table_indexes();
					});
				}, 500);
			});
		});

		ractive.on('delete', function () {
			var selected = ractive.get('rows').filter(function (r) {
				return r[0].selected === true;
			});

			if (selected.length === 0) return alert('Please select an index to delete');

			if (selected.length > 1) return alert('Please select one index at a time');

			var tablename = ractive.get('describeTable.TableName');
			var indexname = selected[0][1].S;

			if (confirm('Are you sure you want to delete index ' + indexname + ' from table ' + tablename)) {

				var payload = {
					TableName: ractive.get('describeTable.TableName'),
					GlobalSecondaryIndexUpdates: []
				};

				payload.GlobalSecondaryIndexUpdates.push({
					Delete: {
						IndexName: indexname
					}
				});

				DynamoDB.client.updateTable(payload, function (err, data) {

					if (err) return alert(err.message);

					ractive.set('rows', null);
					setTimeout(function () {
						ractive.parent.describe_table(function () {
							ractive.refresh_table_indexes();
						});
					}, 500);
				});
			}
		});

		ractive.on('refresh-table', function () {
			ractive.set('rows', null);
			ractive.parent.describe_table(function () {
				ractive.refresh_table_indexes();
			});
		});

		ractive.refresh_table_indexes();
	},
	data: function data() {
		return {
			columns: [null, 'Name', 'Status', 'Type', 'Partition key', 'Sort key', 'Attributes', 'Size', 'Item count'],
			rows: null
			//newindex:
		};
	}
});

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Ractive.extend({
	template: "\
		<div style='padding: 30px'>\
			<h3>Global Tables</h3>\
		</div>\
	"
});

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Ractive.extend({
	template: "\
			<div>\
\
				<br>\
				<br>\
				<h4>On-Demand Backup and Restore</h4>\
				<hr />\
				<div>You can create and restore a complete backup of your DynamoDB table data and its settings at any time.\
				<a target='_blank' href='http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/BackupRestore.html'>Learn more</a>\
				</div>\
\
				<br>\
				<div>\
					<a class='btn btn-sm btn-primary disabled' on-click='create'>Create backup</a>\
					<a class='btn btn-sm btn-default disabled' on-click='restore'>Restore backup</a>\
					<a class='btn btn-sm btn-default disabled' on-click='delete'>Delete backup</a>\
\
					<a class='btn btn-sm btn-default pull-right' on-click='refresh'><i class='icon zmdi zmdi-refresh'></i></a>\
				</div>\
\
				<tabledata columns='{{columns}}' rows='{{rows}}' style='top: 180px'/>\
\
\
\
			</div>\
\
	",
	list_backups: function list_backups() {
		var ractive = this;
		ractive.set('rows', null);

		DynamoDB.client.listBackups({ TableName: 'created_by_cloudformation' }, function (err, data) {
			if (err) return alert('failed getting backup list');

			ractive.set('rows', data.BackupSummaries.map(function (b) {
				return {};
			}));
		});
	},
	oninit: function oninit() {
		var ractive = this;

		this.on('refresh', function () {
			ractive.list_backups();
		});

		ractive.list_backups();
	},
	data: function data() {
		return {
			columns: [null, 'Backup name', 'Status', 'Creation time', 'Size', 'Backup type', 'Expiration date', 'Backup ARN'],
			rows: null
			//newindex:
		};
	}
});

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Ractive.extend({
	template: "\
		<div style='padding: 30px'>\
			<h3>Triggers</h3>\
		</div>\
	"
});

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

;

var DynamoMetrics = Ractive.extend({
	template: "<chart style='width: 100%;height: 216px;' series='{{metrics.table.read.series}}' debug='{{debug}}' />",
	load_graph_data: function load_graph_data() {
		var ractive = this;

		var period = 60;
		var interval = ractive.get('interval');
		switch (interval) {
			case '1':
				period = 60; // 60 per minute
				break;
			case '3':
				period = 300; // 20 per minute, 60 per total
				break;
			case '6':
				period = 300; // should be at 5 min ?
				break;
			case '12':
				period = 60 * 60; // one per minute, 12 per total
				break;
			case '24':
				period = 60 * 60; // one per minute, 24 per total
				break;
			case '72':
				period = 60 * 60; //
				break;
			case '168':
				period = 60 * 60; // shoul be daily
				break;
			case '336':
				period = 60 * 60; // should be daily
				break;
		}

		cloudwatch.getMetricStatistics({
			StartTime: new Date(new Date().getTime() - 1000 * 60 * 60 * interval),
			EndTime: new Date(),
			Namespace: 'AWS/DynamoDB',
			MetricName: ractive.get('metric'),
			Period: period,
			Statistics: ['Sum'],
			Dimensions: [{
				Name: 'TableName',
				Value: ractive.get('table')
			}]
		}, function (err, data) {
			if (err) return ractive.set('disabled', 'Failed');

			var series = [{ data: data.Datapoints.map(function (dp) {
					return ['', dp.Sum];
				}) }];
			ractive.set('metrics.table.read.series', series);
			console.log('series', series);
			console.log('series', ractive.get('series'));

			ractive.set('disabled');
		});
	},
	oninit: function oninit() {
		var ractive = this;

		ractive.load_graph_data();

		ractive.observe('interval', function () {
			ractive.load_graph_data();
		});
	},
	data: function data() {

		return {
			debug: true,
			metrics: {
				table: {
					read: {
						series: [{
							//name
							data: []
						}]
					}
				}
			}
		};
	}
});

exports.default = Ractive.extend({
	components: {
		DynamoMetrics: DynamoMetrics
	},
	template: "\
		<div style='padding: 30px'>\
			<h3>\
				Metrics\
\
				<div style='float:right'>\
					<select value='{{interval}}'>\
						<option value='1'>Last hour</option>\
						<option value='3'>Last 3 hours</option>\
						<option value='6'>Last 6 hours</option>\
						<option value='12'>Last 12 hours</option>\
						<option value='24'>Last 24 hours</option>\
\
						<option value='72'>Last 3 days</option>\
						<option value='168'>Last 1 week</option>\
						<option value='336'>Last 2 weeks</option>\
\
					</select>\
				</div>\
			</h3>\
			<hr>\
\
			<h4>Capacity: table</h4>\
			<hr>\
\
			<div style='float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;'>\
				<div><b>Read capacity</b> Units/Minute</div>\
				<DynamoMetrics table='{{ describeTable.TableName }}' disabled='Loading...' metric='ConsumedReadCapacityUnits' interval='{{interval}}' period='{{period}}' color='#f7a35c' namespace='AWS/DynamoDB' />\
			</div>\
\
			<div style='float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;'>\
				<div><b>Throttled read requests</b> Count</div>\
				<chart style='width: 100%;height: 216px;' disabled='Not Tracked' />\
			</div>\
\
			<div style='float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;'>\
				<div><b>Throttled read events</b> Count</div>\
				<chart style='width: 100%;height: 216px;' disabled='Not Tracked' />\
			</div>\
\
			<div style='clear:both;padding: 20px;'></div>\
\
			<div style='float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;'>\
				<div><b>Write capacity</b> Units/Second</div>\
				<DynamoMetrics table='{{ describeTable.TableName }}' disabled='Loading...' metric='ConsumedWriteCapacityUnits' interval='{{interval}}' period='{{period}}' color='#f7a35c' namespace='AWS/DynamoDB' />\
			</div>\
\
			<div style='float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;'>\
				<div><b>Throttled write requests</b> Count</div>\
				<chart style='width: 100%;height: 216px;' disabled='Not Tracked' />\
			</div>\
\
			<div style='float: left;width: 30%;min-width: 300px;max-width: 380px;margin-right: 20px;'>\
				<div><b>Throttled write events</b> Count</div>\
				<chart style='width: 100%;height: 216px;' disabled='Not Tracked' />\
			</div>\
\
		</div>\
	",
	oninit: function oninit() {
		var ractive = this;
		console.log('init metrics with', ractive.get());
	},
	data: function data() {
		return {
			interval: 1
		};
	}

});

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _tabledata = __webpack_require__(10);

var _tabledata2 = _interopRequireDefault(_tabledata);

var _edit = __webpack_require__(57);

var _edit2 = _interopRequireDefault(_edit);

var _add = __webpack_require__(128);

var _add2 = _interopRequireDefault(_add);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = Ractive.extend({
	components: {
		tabledata: _tabledata2.default
	},
	isolated: true,
	template: "\
	<div class='tablebrowse'>\
		{{#if !describeTable }}\
			<br>reading table schema...\
		{{else}}\
		<div class='tablequery'>\
			<table width='100%' style='border-collapse: separate;border-spacing: 5px;'>\
				<tr>\
					<td>\
						<select value='{{ .type }}'>\
							<option value='scan'>SCAN</option>\
							<option value='query'>QUERY</option>\
						</select>\
					</td>\
					<td colspan='4'>\
						{{#if .type === 'scan' }}\
						<select value='{{ .scan.table }}'>\
							<option value=''>\
								[ Table ] {{ describeTable.TableName }}: {{ @this._hash_key_name() }} ( {{ @this._hash_key_type_name() }} )\
								{{#if describeTable.KeySchema.length === 2}}\
									, {{ @this._range_key_name() }} ( {{ @this._range_key_type_name() }} )\
								{{/if}}\
							</option>\
\
							{{#describeTable.LocalSecondaryIndexes:j}}\
							<option value='lsi:{{ .IndexName }}'>\
								[ LSI ] {{ .IndexName }}: {{ @this._lsi_hash_key_name( .IndexName ) }} ( {{ @this._lsi_hash_key_type_name( .IndexName ) }} )\
								{{#if .KeySchema.length === 2}}\
									, {{ @this._lsi_range_key_name( .IndexName ) }} (  {{ @this._lsi_range_key_type_name( .IndexName ) }} )\
								{{/if}}\
							</option>\
							{{/describeTable.LocalSecondaryIndexes}}\
\
							{{#describeTable.GlobalSecondaryIndexes:j}}\
							<option value='gsi:{{ .IndexName }}'>\
								[ GSI ] {{ .IndexName }}: {{ @this._gsi_hash_key_name( .IndexName ) }} ( {{ @this._gsi_hash_key_type_name( .IndexName ) }} )\
								{{#if .KeySchema.length === 2}}\
									, {{ @this._gsi_range_key_name( .IndexName ) }} (  {{ @this._gsi_range_key_type_name( .IndexName ) }} )\
								{{/if}}\
							</option>\
							{{/describeTable.GlobalSecondaryIndexes}}\
						</select>\
						{{/if}}\
\
						{{#if .type === 'query' }}\
						<select value='{{ .query.table }}'>\
							<option value=''>\
								[ Table ] {{ describeTable.TableName }}: {{ @this._hash_key_name() }} ( {{ @this._hash_key_type_name() }} )\
								{{#if describeTable.KeySchema.length === 2}}\
									, {{ @this._range_key_name() }} ( {{ @this._range_key_type_name() }} )\
								{{/if}}\
\
							</option>\
\
							{{#describeTable.LocalSecondaryIndexes:j}}\
							<option value='lsi:{{ .IndexName }}'>\
								[ LSI ] {{ .IndexName }}: {{ @this._lsi_hash_key_name( .IndexName ) }} ( {{ @this._lsi_hash_key_type_name( .IndexName ) }} )\
								{{#if .KeySchema.length === 2}}\
									, {{ @this._lsi_range_key_name( .IndexName ) }} (  {{ @this._lsi_range_key_type_name( .IndexName ) }} )\
								{{/if}}\
							</option>\
							{{/describeTable.LocalSecondaryIndexes}}\
\
							{{#describeTable.GlobalSecondaryIndexes:j}}\
							<option value='gsi:{{ .IndexName }}'>\
								[ GSI ] {{ .IndexName }}: {{ @this._gsi_hash_key_name( .IndexName ) }} ( {{ @this._gsi_hash_key_type_name( .IndexName ) }} )\
								{{#if .KeySchema.length === 2}}\
									, {{ @this._gsi_range_key_name( .IndexName ) }} (  {{ @this._gsi_range_key_type_name( .IndexName ) }} )\
								{{/if}}\
							</option>\
							{{/describeTable.GlobalSecondaryIndexes}}\
						</select>\
						{{/if}}\
					</td>\
				</tr>\
				{{#if .type === 'query' }}\
				<tr>\
					<td>Partition</td>\
					{{#if .query.table === ''  }}\
						<td>{{ _hash_key_name() }}</td>\
						<td><select><option>{{ @this._hash_key_type_name() }}</option></select></td>\
					{{/if}}\
					{{#describeTable.LocalSecondaryIndexes:j}}\
						{{#if ~/.query.table === ('lsi:' +  .IndexName)  }}\
							<td>{{ @this._lsi_hash_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ @this._lsi_hash_key_type_name( .IndexName ) }}</option></select></td>\
						{{/if}}\
					{{/describeTable.LocalSecondaryIndexes}}\
					{{#describeTable.GlobalSecondaryIndexes:j}}\
						{{#if ~/.query.table === ('gsi:' +  .IndexName)  }}\
							<td>{{ @this._gsi_hash_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ @this._gsi_hash_key_type_name( .IndexName ) }}</option></select></td>\
						{{/if}}\
					{{/describeTable.GlobalSecondaryIndexes}}\
					<td><select><option>=</option></select></td>\
					<td><input type='text' value='{{.query.partition.value}}'></td>\
				</tr>\
				{{#if .query.table === ''  }}\
					{{#if describeTable.KeySchema.length === 2}}\
					<tr>\
						<td>Sort</td>\
						<td>{{ @this._range_key_name() }}</td>\
						<td><select><option>{{ @this._range_key_type_name( ) }}</option></select></td>\
						<td>\
							<select value='{{ ~/query.sort.op }}'>\
								<option value='eq'>=</option>\
								<option value='gt'>&gt;</option>\
								<option value='ge'>&gt;=</option>\
								<option value='lt'>&lt;</option>\
								<option value='le'>&lt;=</option>\
								<option value='between'>between</option>\
								{{#if _range_key_type()  === 'S' }}\
									<option value='begins_with'>begins with</option>\
								{{/if}}\
							</select>\
						</td>\
						<td>\
							<input type='text' value='{{ ~/query.sort.value }}'>\
							{{#if ~/query.sort.op === 'between' }}\
								<input type='text' value='{{ ~/query.sort.value2 }}'>\
							{{/if}}\
						</td>\
					</tr>\
					{{/if}}\
				{{/if}}\
				{{#describeTable.GlobalSecondaryIndexes:j}}\
					{{#if ~/.query.table === ('gsi:' +  .IndexName)  }}\
						{{#if .KeySchema.length === 2}}\
						<tr>\
							<td>Sort</td>\
							<td>{{ @this._gsi_range_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ @this._gsi_range_key_type_name( .IndexName ) }}</option></select></td>\
							<td>\
								<select value='{{ ~/query.sort.op }}'>\
									<option value='eq'>=</option>\
									<option value='gt'>&gt;</option>\
									<option value='ge'>&gt;=</option>\
									<option value='lt'>&lt;</option>\
									<option value='le'>&lt;=</option>\
									<option value='between'>between</option>\
									{{#if @this._gsi_range_key_type( .IndexName )  === 'S' }}\
										<option value='begins_with'>begins with</option>\
									{{/if}}\
								</select>\
							</td>\
							<td>\
								<input type='text' value='{{ ~/query.sort.value }}'>\
								{{#if ~/query.sort.op === 'between' }}\
									<input type='text' value='{{ ~/query.sort.value2 }}'>\
								{{/if}}\
							</td>\
						</tr>\
						{{/if}}\
					{{/if}}\
				{{/describeTable.GlobalSecondaryIndexes}}\
				{{#describeTable.LocalSecondaryIndexes:j}}\
					{{#if ~/.query.table === ('lsi:' +  .IndexName)  }}\
						{{#if .KeySchema.length === 2}}\
						<tr>\
							<td>Sort</td>\
							<td>{{ @this._lsi_range_key_name( .IndexName ) }}</td>\
							<td><select><option>{{ @this._lsi_range_key_type_name( .IndexName ) }}</option></select></td>\
							<td>\
								<select value='{{ ~/query.sort.op }}'>\
									<option value='eq'>=</option>\
									<option value='gt'>&gt;</option>\
									<option value='ge'>&gt;=</option>\
									<option value='lt'>&lt;</option>\
									<option value='le'>&lt;=</option>\
									<option value='between'>between</option>\
									{{#if @this._lsi_range_key_type( .IndexName )  === 'S' }}\
										<option value='begins_with'>begins with</option>\
									{{/if}}\
								</select>\
							</td>\
							<td>\
								<input type='text' value='{{ ~/query.sort.value }}'>\
								{{#if ~/query.sort.op === 'between' }}\
									<input type='text' value='{{ ~/query.sort.value2 }}'>\
								{{/if}}\
							</td>\
						</tr>\
						{{/if}}\
					{{/if}}\
				{{/describeTable.LocalSecondaryIndexes}}\
\
				{{/if}}\
			</table>\
\
		</div>\
		<div class='tabledatacontrols'>\
			<div class='btn btn-xs btn-default {{#if oop_running}}disabled{{/if}}' on-click='run-oop' style='padding-right: 10px;'><i class='zmdi zmdi-hc-fw zmdi-play'></i> RUN</div>\
			<div class='btn btn-xs btn-default {{#if prev_running}}disabled{{/if}} {{#if start_reached }}disabled{{/if}}' on-click='prev'><i class='zmdi zmdi-hc-fw zmdi-chevron-left'></i></div>\
			<div class='btn btn-xs btn-default {{#if next_running}}disabled{{/if}} {{#if end_reached   }}disabled{{/if}}' on-click='next'><i class='zmdi zmdi-hc-fw zmdi-chevron-right'></i></div>\
\
			<div class='pull-right'>\
				<a class='btn btn-xs btn-default' on-click='refresh'><i class='zmdi zmdi-refresh'></i></a>\
				<div class='btn-group'>\
					<button class='btn btn-default btn-xs' type='button'>\
						<i class='zmdi zmdi-filter-list'></i>\
					</button>\
					<button type='button' class='btn btn-xs btn-default dropdown-toggle dropdown-toggle-split' on-click='@this.toggle(\"drowndownfilteropen\")'>\
						<i class='zmdi zmdi-caret-down'></i>\
					</button>\
					<div class='dropdown-menu pull-right {{#if drowndownfilteropen}}show{{/if}}' style='max-height: 250px;overflow-y: auto;'>\
						{{#display_columns}}\
							<li><a> <input type=checkbox checked='{{.show}}' />  {{.name}}</a>\
						{{/display_columns}}\
\
					</div>\
				</div>\
				<a class='btn btn-xs btn-primary' on-click='create-item-window' as-tooltip=' \"Create Item \" ' ><i class='zmdi zmdi-plus'></i> Create Item </a>\
				<a class='btn btn-xs btn-danger {{#if selection_length > 0}}{{else}}disabled{{/if}}'  on-click='delete-selected'    as-tooltip=' \"Delete selected items \"' ><i class='zmdi zmdi-delete'></i></a>\
			</div>\
		</div>\
		<tabledata columns='{{columns}}' rows='{{rows}}' on-colclick='open-item' style='top: 148px'/>\
		{{/if}}\
	</div>\
		",
	_hash_key_name: function _hash_key_name() {
		return (this.get('describeTable').KeySchema.filter(function (k) {
			return k.KeyType === 'HASH';
		})[0] || {}).AttributeName;
	},
	_hash_key_type: function _hash_key_type() {
		var ractive = this;

		var ret;
		this.get('describeTable.AttributeDefinitions').map(function (at) {
			if (at.AttributeName === ractive._hash_key_name()) ret = at.AttributeType;
		});
		return ret;
	},
	_hash_key_type_name: function _hash_key_type_name() {
		return { S: 'String', N: 'Number', 'B': 'Binary' }[this._hash_key_type()];
	},

	_range_key_name: function _range_key_name() {
		return (this.get('describeTable').KeySchema.filter(function (k) {
			return k.KeyType === 'RANGE';
		})[0] || {}).AttributeName;
	},
	_range_key_type: function _range_key_type() {
		var ractive = this;

		var ret;
		this.get('describeTable.AttributeDefinitions').map(function (at) {
			if (at.AttributeName === ractive._range_key_name()) ret = at.AttributeType;
		});
		return ret;
	},
	_range_key_type_name: function _range_key_type_name() {
		return { S: 'String', N: 'Number', 'B': 'Binary' }[this._range_key_type()];
	},

	_gsi_hash_key_name: function _gsi_hash_key_name(indexname) {

		var index = (this.get('describeTable.GlobalSecondaryIndexes') || []).filter(function (i) {
			return i.IndexName === indexname;
		})[0];
		if (!index) return;

		return (index.KeySchema.filter(function (k) {
			return k.KeyType === 'HASH';
		})[0] || {}).AttributeName;
	},
	_gsi_hash_key_type: function _gsi_hash_key_type(indexname) {
		var ractive = this;

		var ret;
		this.get('describeTable.AttributeDefinitions').map(function (at) {
			if (at.AttributeName === ractive._gsi_hash_key_name(indexname)) ret = at.AttributeType;
		});
		return ret;
	},
	_gsi_hash_key_type_name: function _gsi_hash_key_type_name(indexname) {
		return { S: 'String', N: 'Number', 'B': 'Binary' }[this._gsi_hash_key_type(indexname)];
	},

	_gsi_range_key_name: function _gsi_range_key_name(indexname) {

		var index = (this.get('describeTable.GlobalSecondaryIndexes') || []).filter(function (i) {
			return i.IndexName === indexname;
		})[0];
		if (!index) return;

		return (index.KeySchema.filter(function (k) {
			return k.KeyType === 'RANGE';
		})[0] || {}).AttributeName;
	},
	_gsi_range_key_type: function _gsi_range_key_type(indexname) {
		var ractive = this;

		var ret;
		this.get('describeTable.AttributeDefinitions').map(function (at) {
			if (at.AttributeName === ractive._gsi_range_key_name(indexname)) ret = at.AttributeType;
		});
		return ret;
	},
	_gsi_range_key_type_name: function _gsi_range_key_type_name(indexname) {
		return { S: 'String', N: 'Number', 'B': 'Binary' }[this._gsi_range_key_type(indexname)];
	},

	_lsi_hash_key_name: function _lsi_hash_key_name(indexname) {

		var index = (this.get('describeTable.LocalSecondaryIndexes') || []).filter(function (i) {
			return i.IndexName === indexname;
		})[0];
		if (!index) return;

		return (index.KeySchema.filter(function (k) {
			return k.KeyType === 'HASH';
		})[0] || {}).AttributeName;
	},
	_lsi_hash_key_type: function _lsi_hash_key_type(indexname) {
		var ractive = this;

		var ret;
		this.get('describeTable.AttributeDefinitions').map(function (at) {
			if (at.AttributeName === ractive._lsi_hash_key_name(indexname)) ret = at.AttributeType;
		});
		return ret;
	},
	_lsi_hash_key_type_name: function _lsi_hash_key_type_name(indexname) {
		return { S: 'String', N: 'Number', 'B': 'Binary' }[this._lsi_hash_key_type(indexname)];
	},

	_lsi_range_key_name: function _lsi_range_key_name(indexname) {

		var index = (this.get('describeTable.LocalSecondaryIndexes') || []).filter(function (i) {
			return i.IndexName === indexname;
		})[0];
		if (!index) return;

		return (index.KeySchema.filter(function (k) {
			return k.KeyType === 'RANGE';
		})[0] || {}).AttributeName;
	},
	_lsi_range_key_type: function _lsi_range_key_type(indexname) {
		var ractive = this;

		var ret;
		this.get('describeTable.AttributeDefinitions').map(function (at) {
			if (at.AttributeName === ractive._lsi_range_key_name(indexname)) ret = at.AttributeType;
		});
		return ret;
	},
	_lsi_range_key_type_name: function _lsi_range_key_type_name(indexname) {
		return { S: 'String', N: 'Number', 'B': 'Binary' }[this._lsi_range_key_type(indexname)];
	},

	display_data: function display_data() {
		var ractive = this;

		var dbrows_json = this.get('dbrows_json');
		var dbrows_raw = this.get('dbrows_raw');

		var columns = [null];
		var rows = [];
		var display_columns = {};
		this.get('display_columns').map(function (dc) {
			if (dc.show) columns.push(dc.name);
		});
		var rows = [];

		dbrows_json.map(function (row, idx) {
			var thisrow = [];

			columns.map(function (column_name) {
				if (column_name === null) {
					// checkbox
					var key = {};
					key[ractive._hash_key_name()] = row[ractive._hash_key_name()];
					if (ractive._range_key_name()) key[ractive._range_key_name()] = row[ractive._range_key_name()];
					thisrow.push({ KEY: key });
				} else {
					if (row.hasOwnProperty(column_name)) {
						if (column_name === ractive._hash_key_name()) {
							thisrow.push({
								HASH: row[column_name],
								item: row,
								raw: dbrows_raw[idx]
							});
						} else if (typeof row[column_name] === 'string') thisrow.push({ 'S': row[column_name] });else if (typeof row[column_name] === 'number') thisrow.push({ 'N': row[column_name] });else if (typeof row[column_name] === 'boolean') {
							thisrow.push({ 'BOOL': row[column_name].toString() });
						} else if (row[column_name] === null) {
							thisrow.push({ 'NULL': "NULL" });
						} else if (_typeof(row[column_name]) === 'object' && Array.isArray(row[column_name])) {
							thisrow.push({ 'L': true });
						} else if (_typeof(row[column_name]) === 'object' && !Array.isArray(row[column_name])) {
							thisrow.push({ 'M': true });
						} else thisrow.push({ 'U': true });
					} else {
						thisrow.push({ 'U': true });
					}
				}
			});
			rows.push(thisrow);
		});

		this.set('columns', columns);
		this.set('rows', rows);
	},

	refresh_data: function refresh_data(LastEvaluatedKey) {

		var ractive = this;
		this.set('columns', []);
		this.set('rows', []);

		var dbrows_json = null;
		var dbrows_raw = null;
		var hash_key = null;
		var range_key = null;
		var fields = {};
		var columns = [null];

		async.waterfall([

		// describeTable is set by parent

		function (cb) {
			if (ractive.get('type') !== 'scan') return cb();

			fields = {};

			hash_key = ractive._hash_key_name();
			range_key = ractive._range_key_name();

			columns.push(hash_key);
			ractive.add_display_column(hash_key, true);
			fields[hash_key] = 1;
			if (range_key) {
				columns.push(range_key);
				ractive.add_display_column(range_key, true);
				fields[range_key] = 1;
			}

			var scan_index = ractive.get('scan.table');
			if (scan_index === '') {} else {
				var scan_type = scan_index.split(':')[0];
				scan_index = scan_index.split(':')[1];
				if (scan_type === 'gsi') {
					var index = ractive.get('describeTable.GlobalSecondaryIndexes').filter(function (i) {
						return i.IndexName === scan_index;
					})[0];

					var index_hash_key = (index.KeySchema.filter(function (k) {
						return k.KeyType === 'HASH';
					})[0] || {}).AttributeName;
					var index_range_key = (index.KeySchema.filter(function (k) {
						return k.KeyType === 'RANGE';
					})[0] || {}).AttributeName;

					columns.push(index_hash_key);
					ractive.add_display_column(index_hash_key, true);
					fields[index_hash_key] = 1;

					if (index_range_key) {
						columns.push(index_range_key);
						ractive.add_display_column(index_range_key, true);
						fields[index_range_key] = 1;
					}
				}
			}

			var ddb = DynamoDB.table(ractive.get('table.name'));
			if (LastEvaluatedKey) ddb.resume(LastEvaluatedKey);
			ddb.limit(100);
			if (scan_index) ddb = ddb.index(scan_index);

			ddb.scan(function (err, data, raw) {
				if (err) return alert("scan error");

				dbrows_json = data;
				dbrows_raw = raw.Items;

				ractive.push('scan.LastEvaluatedKey', data.LastEvaluatedKey);
				ractive.set('end_reached', data.LastEvaluatedKey ? false : true);

				cb();
			});
		}, function (cb) {
			if (ractive.get('type') !== 'query') return cb();

			fields = {};
			var query_partition_name = '';
			var query_partition_type = 'S';
			var query_sort_name = '';
			var query_sort_type = 'S';

			hash_key = ractive._hash_key_name();
			range_key = ractive._range_key_name();

			columns.push(hash_key);
			ractive.add_display_column(hash_key, true);
			fields[hash_key] = 1;
			if (range_key) {
				columns.push(range_key);
				ractive.add_display_column(range_key, true);
				fields[range_key] = 1;
			}

			var query_index = ractive.get('query.table');
			if (query_index === '') {
				query_partition_name = hash_key;
				query_partition_type = ractive._hash_key_type();
				if (range_key) {
					query_sort_name = ractive._range_key_name();
					query_sort_type = ractive._range_key_type();
				}
			} else {
				var query_type = query_index.split(':')[0];
				query_index = query_index.split(':')[1];
				if (query_type === 'gsi') {

					var index = ractive.get('describeTable.GlobalSecondaryIndexes').filter(function (i) {
						return i.IndexName === query_index;
					})[0];
					var index_hash_key = ractive._gsi_hash_key_name(index.IndexName);
					var index_range_key = ractive._gsi_range_key_name(index.IndexName);
					query_partition_name = index_hash_key;
					query_partition_type = ractive._gsi_hash_key_type(index.IndexName);

					if (index_range_key) {
						query_sort_name = ractive._gsi_range_key_name(index.IndexName);
						query_sort_type = ractive._gsi_range_key_type(index.IndexName);
					}

					columns.push(index_hash_key);
					ractive.add_display_column(index_hash_key, true);
					fields[index_hash_key] = 1;

					if (index_range_key) {
						columns.push(index_range_key);
						ractive.add_display_column(index_range_key, true);
						fields[index_range_key] = 1;
					}
				}
				if (query_type === 'lsi') {

					var index = ractive.get('describeTable.LocalSecondaryIndexes').filter(function (i) {
						return i.IndexName === query_index;
					})[0];
					var index_hash_key = ractive._lsi_hash_key_name(index.IndexName);
					var index_range_key = ractive._lsi_range_key_name(index.IndexName);
					query_partition_name = index_hash_key;
					query_partition_type = ractive._lsi_hash_key_type(index.IndexName);

					if (index_range_key) {
						query_sort_name = ractive._lsi_range_key_name(index.IndexName);
						query_sort_type = ractive._lsi_range_key_type(index.IndexName);
					}

					columns.push(index_hash_key);
					ractive.add_display_column(index_hash_key, true);
					fields[index_hash_key] = 1;

					if (index_range_key) {
						columns.push(index_range_key);
						ractive.add_display_column(index_range_key, true);
						fields[index_range_key] = 1;
					}
				}
			}

			var ddb = DynamoDB.table(ractive.get('table.name'));
			if (LastEvaluatedKey) ddb.resume(LastEvaluatedKey);
			ddb.limit(100);
			if (query_index) ddb = ddb.index(query_index);

			if (query_partition_type === 'S') ddb = ddb.where(query_partition_name).eq(ractive.get('query.partition.value').toString());

			if (query_partition_type === 'N') ddb = ddb.where(query_partition_name).eq(parseFloat(ractive.get('query.partition.value')));

			if (ractive.get('query.sort.value').length) {
				// apply sort
				console.log("sort", query_sort_name, ractive.get('query.sort.op'), query_sort_type);
				if (query_sort_type === 'S') ddb = ddb.where(query_sort_name)[ractive.get('query.sort.op')](ractive.get('query.sort.value').toString(), ractive.get('query.sort.value2').toString());

				if (query_sort_type === 'N') ddb = ddb.where(query_sort_name)[ractive.get('query.sort.op')](parseFloat(ractive.get('query.sort.value')), parseFloat(ractive.get('query.sort.value2')));
			}

			console.log("query_partition_name=", query_partition_name);

			dbrows_json = [];
			ddb.query(function (err, data, raw) {
				if (err) {
					alert("query error");
					return cb(err);
				}

				dbrows_json = data;
				dbrows_raw = raw.Items;

				ractive.push('scan.LastEvaluatedKey', data.LastEvaluatedKey);

				ractive.set('end_reached', data.LastEvaluatedKey ? false : true);

				cb();
			});
		},

		// save raw data
		function (cb) {
			ractive.set('dbrows_json', dbrows_json);
			ractive.set('dbrows_raw', dbrows_raw);
			cb();
		}], function (err) {
			ractive.set('oop_running', false);
			ractive.set('prev_running', false);
			ractive.set('next_running', false);

			if (err) ractive.set('err', err.errorMessage);

			if (ractive.get('autocolumns')) {
				dbrows_json.map(function (row) {
					Object.keys(row).map(function (column_name) {
						if (!fields.hasOwnProperty(column_name)) {
							if (columns.length > 10) {
								ractive.add_display_column(column_name, false);
							} else {
								ractive.add_display_column(column_name, true);
								fields[column_name] = 1;
								columns.push(column_name);
							}
						}
					});
				});
				ractive.set('autocolumns', false);
			}
			ractive.display_data();
			/*
   var rows = []
   
   		dbrows_.map(function(row) {
   	var thisrow = []
   		columns.map(function(column_name) {
   		if (column_name === null) {
   			// checkbox
   			var key = {}
   			key[hash_key] = row[hash_key]
   			if (range_key) key[range_key] = row[range_key]
   			thisrow.push({KEY: key})
   		} else {
   			if (row.hasOwnProperty(column_name)) {
   				if (typeof row[column_name] === 'string')
   					thisrow.push({'S':row[column_name]})
   				else if (typeof row[column_name] === 'number')
   					thisrow.push({'N':row[column_name]})
   				else if (typeof row[column_name] === 'boolean') {
   					thisrow.push({'BOOL':row[column_name].toString()})
   				} else if (row[column_name] === null) {
   					thisrow.push({'NULL': "NULL"})
   				} else if ((typeof row[column_name] === 'object') &&  Array.isArray(row[column_name]) ) {
   					thisrow.push({'L': true })
   				} else if ((typeof row[column_name] === 'object') && !Array.isArray(row[column_name]) ) {
   					thisrow.push({'M': true })
   				} else
   					thisrow.push({'U': true })
   			} else {
   				thisrow.push({'U': true })
   			}
   		}
   	})
   	rows.push(thisrow)
   })
   ractive.set('columns', columns )
   ractive.set('rows', rows )
   */
		});
	},
	add_display_column: function add_display_column(cname, show) {
		var display_columns = this.get('display_columns');
		if (display_columns.filter(function (dc) {
			return dc.name === cname;
		}).length) return;

		display_columns.push({
			name: cname,
			show: show
		});
		this.set('display_columns', display_columns);
	},
	data: function data() {
		return {
			oop_running: false,
			prev_running: false,
			next_running: false,
			start_reached: true,
			end_reached: false,

			type: 'scan',
			display_columns: [
				// { name, type, show: true|false|null}
			],
			autocolumns: true,
			scan: {
				table: '',
				LastEvaluatedKey: [null]
			},
			query: {
				table: '',
				sort: {
					op: 'eq',
					value: '',
					value2: ''
				}
			}
		};
	},
	oninit: function oninit() {
		var ractive = this;

		this.on('open-item', function (e, col, item, rawitem) {
			var describeTable = this.get('describeTable');
			var hash = this._hash_key_name();
			var range = this._range_key_name();
			//console.log("open-item", "table=",describeTable.TableName, "hash=",hash, "range=", range, "item=", item, rawitem  )
			window.ractive.findComponent('WindowHost').newWindow(function ($window) {
				$window.set({
					title: 'Edit Item',
					'geometry.width': window.innerWidth - 100,
					'geometry.height': window.innerHeight - 100,
					'geometry.left': 50,
					'geometry.top': 50
				});

				var vid = "window" + (Math.random() * 0xFFFFFF << 0).toString(16);
				$window.content('<div id="' + vid + '"/>').then(function () {
					var ractive = new Ractive({
						components: {
							itemedit: _edit2.default
						},
						el: $('#' + vid).get(0).parentNode,
						template: '<itemedit describeTable="{{describeTable}}" item="{{item}}" rawitem="{{rawitem}}" window={{window}} />',
						data: {
							describeTable: describeTable,
							//item: item,
							rawitem: rawitem,
							window: $window
						}
					});
				});
			});
		});

		this.on('run-oop', function () {
			if (this.get('oop_running')) return;

			this.set('oop_running', true);

			// reset scan.LastEvaluatedKey
			ractive.set('scan.LastEvaluatedKey', [null]);

			this.refresh_data(null);
		});
		this.on('prev', function () {

			if (this.get('prev_running')) return;

			this.set('prev_running', true);

			if (ractive.get('scan.LastEvaluatedKey').length < 3) return;

			var next = ractive.pop('scan.LastEvaluatedKey');

			var current = ractive.pop('scan.LastEvaluatedKey');

			var LastEvaluatedKey = ractive.get('scan.LastEvaluatedKey').slice(-1)[0];

			ractive.refresh_data(LastEvaluatedKey);
		});
		this.on('next', function () {

			if (this.get('next_running')) return;

			if (this.get('end_reached')) return;

			this.set('next_running', true);
			var LastEvaluatedKey = ractive.get('scan.LastEvaluatedKey').slice(-1)[0];
			ractive.refresh_data(LastEvaluatedKey);
		});

		ractive.observe('scan.LastEvaluatedKey', function (n, o, keypath) {
			if (n.length > 2) ractive.set('start_reached', false);else ractive.set('start_reached', true);
		});
		ractive.observe('display_columns.*.show', function (n, o, keypath) {
			if (o === undefined) return;

			if (o == n) return;

			var col = ractive.get(keypath.slice(0, -5)).name;
			console.log(col, n, o);
			ractive.display_data();
		});

		ractive.on('tabledata.selectrow', function (context) {
			var keypath = context.resolve();
			ractive.set(keypath + '.0.selected', !ractive.get(keypath + '.0.selected'));

			ractive.set('selection_length', ractive.get('rows').filter(function (r) {
				return r[0].selected === true;
			}).length);
		});
		ractive.on('create-item-window', function () {

			var describeTable = this.get('describeTable');

			var rawitem = {};

			/* add partition */
			var htype = this._hash_key_type();

			var to_add = null;
			if (htype === "S") to_add = { S: "" };

			if (htype === "N") to_add = { N: "" };

			if (htype === "B") to_add = { B: Uint8Array.from(atob("InsertBase64Here"), function (c) {
					return c.charCodeAt(0);
				}) };

			rawitem[this._hash_key_name()] = to_add;

			/* add sort */
			if (this._range_key_name()) {
				var rtype = this._range_key_type();
				var to_add = null;
				if (rtype === "S") to_add = { S: "" };

				if (rtype === "N") to_add = { N: "" };

				if (rtype === "B") to_add = { B: Uint8Array.from(atob("InsertBase64Here"), function (c) {
						return c.charCodeAt(0);
					}) };

				rawitem[this._range_key_name()] = to_add;
			}

			console.log(rawitem);

			window.ractive.findComponent('WindowHost').newWindow(function ($window) {
				$window.set({
					title: 'Create Item',
					'geometry.width': window.innerWidth - 100,
					'geometry.height': window.innerHeight - 100,
					'geometry.left': 50,
					'geometry.top': 50
				});

				var vid = "window" + (Math.random() * 0xFFFFFF << 0).toString(16);
				$window.content('<div id="' + vid + '"/>').then(function () {
					var ractive = new Ractive({
						components: {
							itemadd: _add2.default
						},
						el: $('#' + vid).get(0).parentNode,
						template: '<itemadd describeTable="{{describeTable}}" item="{{item}}" rawitem="{{rawitem}}" window={{window}} />',
						data: {
							describeTable: describeTable,
							// item: {
							//
							// },
							rawitem: rawitem,
							window: $window
						}
					});
				});
			});

			/*
   
   
   
   
   
   					var ractive = new Ractive({
   						components: {
   							itemedit: itemedit,
   						},
   						el: $('#'+vid).get(0).parentNode,
   						template: '<itemedit describeTable="{{describeTable}}" item="{{item}}" rawitem="{{rawitem}}" window={{window}} />',
   						data: {
   							describeTable: describeTable,
   							item: item,
   							rawitem: rawitem,
   							window: $window,
   						}
   					})
   
   
   */
		});
		ractive.on('delete-selected', function (context) {
			//console.log(ractive.findComponent('tabledata').get('rows'))
			var to_delete = ractive.findComponent('tabledata').get('rows').map(function (r) {
				return r[0];
			}).filter(function (r) {
				return r.selected;
			}).map(function (r) {
				return r.KEY;
			});

			if (!to_delete.length) return alert('No Items Selected');

			var to_remove_from_list = [];

			async.each(to_delete, function (item, cb) {

				var Key = {};
				Object.keys(item).map(function (k) {
					if (typeof item[k] === "string") Key[k] = { "S": item[k] };

					if (typeof item[k] === "number") Key[k] = { "N": item[k].toString() };
				});

				var payload = {
					Key: Key,
					TableName: ractive.get('table.name')
				};

				DynamoDB.client.deleteItem(payload, function (err, data) {

					if (err) {
						alert("delete failed " + err.message);
						return cb(err);
					} else to_remove_from_list.push(item);

					cb();
				});
			}, function (err) {
				if (err) alert('some items failed to delete');

				ractive.set('rows', ractive.get('rows').filter(function (r) {

					var is_in_deleted_list = false;
					to_remove_from_list.map(function (deleted_item) {
						var isequal = true;
						Object.keys(deleted_item).map(function (k) {
							if (deleted_item[k] !== r[0].KEY[k]) isequal = false;
						});

						if (isequal) is_in_deleted_list = true;
					});
					return !is_in_deleted_list;
				}));
			});
		});

		ractive.refresh_data(null);
	}
});

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ractiveDynamodbJsonEditor = __webpack_require__(23);

var _ractiveDynamodbJsonEditor2 = _interopRequireDefault(_ractiveDynamodbJsonEditor);

var _cloneDeep = __webpack_require__(24);

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//var jsoneditor = require('@awspilot/ractive-dynamodb-json-editor');
exports.default = Ractive.extend({
	isolated: true,
	components: {
		jsoneditor: _ractiveDynamodbJsonEditor2.default
	},
	template: '\n\t\t<jsoneditor item={{itemtoedit}} navigationBar="{{false}}"  style="position: absolute;top: -1px;left: -1px;right: -1px;bottom: 50px;width: auto;height: auto;border: 1px solid #dadada" menu-style="background-color: #d5ddf6;border-bottom: 1px solid #97b0f8;color: #444;" />\n\t\t<div style="position: absolute;left: 10px;right:10px;bottom:10px;height: 30px;box-sizing: border-box;">\n\t\t\t<span style="color: red;line-height: 30px;">{{errorMessage}}</span>\n\t\t\t<a class="btn btn-sm btn-primary pull-right" style="color: #fff;background-color: #337ab7;border-color: #2e6da4;float: right;padding: 5px 10px; font-size: 12px; line-height: 1.5;border-radius: 3px;font-family: sans-serif;" on-click="update-item">Save</a>\n\t\t</div>\n\t\t',
	data: function data() {
		return {
			itemtoedit: {}
		};
	},
	_hash_key_name: function _hash_key_name() {
		return (this.get('describeTable').KeySchema.filter(function (k) {
			return k.KeyType === 'HASH';
		})[0] || {}).AttributeName;
	},
	_range_key_name: function _range_key_name() {
		return (this.get('describeTable').KeySchema.filter(function (k) {
			return k.KeyType === 'RANGE';
		})[0] || {}).AttributeName;
	},
	oninit: function oninit() {
		var ractive = this;

		//this.set({itemtoedit: Object.assign({}, this.get('rawitem'))  })

		this.set({ itemtoedit: (0, _cloneDeep2.default)(this.get('rawitem')) });

		this.observe('itemtoedit', function (n, o, kp) {
			this.set({ errorMessage: '' });
		});

		//var rawitem = this.get('rawitem')
		//this.set({itemtoedit: { ...rawitem }  })

		//var debug = this.get('itemtoedit');

		this.on('update-item', function () {
			//console.log("table=","HASH=", this._hash_key_name(), " RANGE=", this._range_key_name() )

			var originalitem = this.get('rawitem');
			var updateditem = (0, _cloneDeep2.default)(this.get('itemtoedit'));

			//console.log("originalitem", originalitem.binary, typeof originalitem.binary )

			//console.log('hello', updateditem )


			var updateItemCall = {
				TableName: this.get('describeTable.TableName'),
				Key: {},
				AttributeUpdates: {}
			};

			if (!updateditem.hasOwnProperty(this._hash_key_name())) return alert('Missing PARTITION_KEY ' + this._hash_key_name());

			if (this._range_key_name() && !updateditem.hasOwnProperty(this._range_key_name())) return alert('Missing SORT_KEY ' + this._range_key_name());

			if (JSON.stringify(updateditem[this._hash_key_name()]) !== JSON.stringify(originalitem[this._hash_key_name()])) return alert('PARTITION_KEY(' + this._hash_key_name() + ') changed value. Operation not permitted');

			if (this._range_key_name() && JSON.stringify(updateditem[this._range_key_name()]) !== JSON.stringify(originalitem[this._range_key_name()])) return alert('SORT_KEY(' + this._range_key_name() + ') changed value. Operation not permitted');

			Object.keys(originalitem).map(function (k) {
				if (!updateditem.hasOwnProperty(k)) updateItemCall.AttributeUpdates[k] = {
					Action: 'DELETE'
				};
			});

			updateItemCall.Key[this._hash_key_name()] = updateditem[this._hash_key_name()];
			delete updateditem[this._hash_key_name()];

			if (this._range_key_name()) {
				updateItemCall.Key[this._range_key_name()] = updateditem[this._range_key_name()];
				delete updateditem[this._range_key_name()];
			}

			Object.keys(updateditem).map(function (k) {
				updateItemCall.AttributeUpdates[k] = {
					Action: 'PUT', //
					Value: updateditem[k]
				};
			});

			//console.log("should update item", this.get('item') )
			console.log("updateItem", updateItemCall);
			DynamoDB.client.updateItem(updateItemCall, function (err, data) {
				if (err) return ractive.set('errorMessage', err.message);

				ractive.get('window').close();
				//ractive.parent.fire('close-window')
			});
		});
	}

});

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

var Stack = __webpack_require__(59),
    arrayEach = __webpack_require__(89),
    assignValue = __webpack_require__(29),
    baseAssign = __webpack_require__(91),
    baseAssignIn = __webpack_require__(101),
    cloneBuffer = __webpack_require__(104),
    copyArray = __webpack_require__(105),
    copySymbols = __webpack_require__(106),
    copySymbolsIn = __webpack_require__(108),
    getAllKeys = __webpack_require__(109),
    getAllKeysIn = __webpack_require__(110),
    getTag = __webpack_require__(20),
    initCloneArray = __webpack_require__(115),
    initCloneByTag = __webpack_require__(116),
    initCloneObject = __webpack_require__(122),
    isArray = __webpack_require__(14),
    isBuffer = __webpack_require__(32),
    isMap = __webpack_require__(124),
    isObject = __webpack_require__(2),
    isSet = __webpack_require__(126),
    keys = __webpack_require__(13);

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject(value)) {
    return value;
  }
  var isArr = isArray(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

module.exports = baseClone;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(4),
    stackClear = __webpack_require__(65),
    stackDelete = __webpack_require__(66),
    stackGet = __webpack_require__(67),
    stackHas = __webpack_require__(68),
    stackSet = __webpack_require__(69);

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

module.exports = Stack;


/***/ }),
/* 60 */
/***/ (function(module, exports) {

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(5);

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(5);

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(5);

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

var assocIndexOf = __webpack_require__(5);

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(4);

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

module.exports = stackClear;


/***/ }),
/* 66 */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

module.exports = stackDelete;


/***/ }),
/* 67 */
/***/ (function(module, exports) {

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;


/***/ }),
/* 68 */
/***/ (function(module, exports) {

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

var ListCache = __webpack_require__(4),
    Map = __webpack_require__(11),
    MapCache = __webpack_require__(76);

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

var isFunction = __webpack_require__(26),
    isMasked = __webpack_require__(73),
    isObject = __webpack_require__(2),
    toSource = __webpack_require__(28);

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(12);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),
/* 72 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

var coreJsData = __webpack_require__(74);

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(0);

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),
/* 75 */
/***/ (function(module, exports) {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

var mapCacheClear = __webpack_require__(77),
    mapCacheDelete = __webpack_require__(84),
    mapCacheGet = __webpack_require__(86),
    mapCacheHas = __webpack_require__(87),
    mapCacheSet = __webpack_require__(88);

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

var Hash = __webpack_require__(78),
    ListCache = __webpack_require__(4),
    Map = __webpack_require__(11);

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

var hashClear = __webpack_require__(79),
    hashDelete = __webpack_require__(80),
    hashGet = __webpack_require__(81),
    hashHas = __webpack_require__(82),
    hashSet = __webpack_require__(83);

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(7);

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;


/***/ }),
/* 80 */
/***/ (function(module, exports) {

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(7);

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(7);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

var nativeCreate = __webpack_require__(7);

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(8);

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;


/***/ }),
/* 85 */
/***/ (function(module, exports) {

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(8);

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(8);

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

var getMapData = __webpack_require__(8);

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;


/***/ }),
/* 89 */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

module.exports = arrayEach;


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(1);

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(9),
    keys = __webpack_require__(13);

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

module.exports = baseAssign;


/***/ }),
/* 92 */
/***/ (function(module, exports) {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsArguments = __webpack_require__(94),
    isObjectLike = __webpack_require__(3);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(6),
    isObjectLike = __webpack_require__(3);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),
/* 95 */
/***/ (function(module, exports) {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),
/* 96 */
/***/ (function(module, exports) {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsTypedArray = __webpack_require__(98),
    baseUnary = __webpack_require__(16),
    nodeUtil = __webpack_require__(17);

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetTag = __webpack_require__(6),
    isLength = __webpack_require__(33),
    isObjectLike = __webpack_require__(3);

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

var isPrototype = __webpack_require__(18),
    nativeKeys = __webpack_require__(100);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;


/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

var overArg = __webpack_require__(34);

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;


/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(9),
    keysIn = __webpack_require__(36);

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

module.exports = baseAssignIn;


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2),
    isPrototype = __webpack_require__(18),
    nativeKeysIn = __webpack_require__(103);

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;


/***/ }),
/* 103 */
/***/ (function(module, exports) {

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;


/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var root = __webpack_require__(0);

/** Detect free variable `exports`. */
var freeExports =   true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(15)(module)))

/***/ }),
/* 105 */
/***/ (function(module, exports) {

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

module.exports = copyArray;


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(9),
    getSymbols = __webpack_require__(19);

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols(source), object);
}

module.exports = copySymbols;


/***/ }),
/* 107 */
/***/ (function(module, exports) {

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

module.exports = arrayFilter;


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

var copyObject = __webpack_require__(9),
    getSymbolsIn = __webpack_require__(38);

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn(source), object);
}

module.exports = copySymbolsIn;


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__(41),
    getSymbols = __webpack_require__(19),
    keys = __webpack_require__(13);

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

var baseGetAllKeys = __webpack_require__(41),
    getSymbolsIn = __webpack_require__(38),
    keysIn = __webpack_require__(36);

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn);
}

module.exports = getAllKeysIn;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(1),
    root = __webpack_require__(0);

/* Built-in method references that are verified to be native. */
var DataView = getNative(root, 'DataView');

module.exports = DataView;


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(1),
    root = __webpack_require__(0);

/* Built-in method references that are verified to be native. */
var Promise = getNative(root, 'Promise');

module.exports = Promise;


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(1),
    root = __webpack_require__(0);

/* Built-in method references that are verified to be native. */
var Set = getNative(root, 'Set');

module.exports = Set;


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

var getNative = __webpack_require__(1),
    root = __webpack_require__(0);

/* Built-in method references that are verified to be native. */
var WeakMap = getNative(root, 'WeakMap');

module.exports = WeakMap;


/***/ }),
/* 115 */
/***/ (function(module, exports) {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

module.exports = initCloneArray;


/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(21),
    cloneDataView = __webpack_require__(118),
    cloneRegExp = __webpack_require__(119),
    cloneSymbol = __webpack_require__(120),
    cloneTypedArray = __webpack_require__(121);

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return cloneArrayBuffer(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return cloneTypedArray(object, isDeep);

    case mapTag:
      return new Ctor;

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return cloneRegExp(object);

    case setTag:
      return new Ctor;

    case symbolTag:
      return cloneSymbol(object);
  }
}

module.exports = initCloneByTag;


/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

var root = __webpack_require__(0);

/** Built-in value references. */
var Uint8Array = root.Uint8Array;

module.exports = Uint8Array;


/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(21);

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

module.exports = cloneDataView;


/***/ }),
/* 119 */
/***/ (function(module, exports) {

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

module.exports = cloneRegExp;


/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

var Symbol = __webpack_require__(12);

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

module.exports = cloneSymbol;


/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

var cloneArrayBuffer = __webpack_require__(21);

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;


/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

var baseCreate = __webpack_require__(123),
    getPrototype = __webpack_require__(40),
    isPrototype = __webpack_require__(18);

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
}

module.exports = initCloneObject;


/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(2);

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

module.exports = baseCreate;


/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsMap = __webpack_require__(125),
    baseUnary = __webpack_require__(16),
    nodeUtil = __webpack_require__(17);

/* Node.js helper references. */
var nodeIsMap = nodeUtil && nodeUtil.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

module.exports = isMap;


/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

var getTag = __webpack_require__(20),
    isObjectLike = __webpack_require__(3);

/** `Object#toString` result references. */
var mapTag = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return isObjectLike(value) && getTag(value) == mapTag;
}

module.exports = baseIsMap;


/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

var baseIsSet = __webpack_require__(127),
    baseUnary = __webpack_require__(16),
    nodeUtil = __webpack_require__(17);

/* Node.js helper references. */
var nodeIsSet = nodeUtil && nodeUtil.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

module.exports = isSet;


/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

var getTag = __webpack_require__(20),
    isObjectLike = __webpack_require__(3);

/** `Object#toString` result references. */
var setTag = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return isObjectLike(value) && getTag(value) == setTag;
}

module.exports = baseIsSet;


/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ractiveDynamodbJsonEditor = __webpack_require__(23);

var _ractiveDynamodbJsonEditor2 = _interopRequireDefault(_ractiveDynamodbJsonEditor);

var _cloneDeep = __webpack_require__(24);

var _cloneDeep2 = _interopRequireDefault(_cloneDeep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//var jsoneditor = require('@awspilot/ractive-dynamodb-json-editor');
exports.default = Ractive.extend({
	isolated: true,
	components: {
		jsoneditor: _ractiveDynamodbJsonEditor2.default
	},
	template: '\n\t\t<jsoneditor item={{itemtoedit}} navigationBar="{{false}}"  style="position: absolute;top: -1px;left: -1px;right: -1px;bottom: 50px;width: auto;height: auto;border: 1px solid #dadada" menu-style="background-color: #d5ddf6;border-bottom: 1px solid #97b0f8;color: #444;" />\n\t\t<div style="position: absolute;left: 10px;right:10px;bottom:10px;height: 30px;box-sizing: border-box;">\n\t\t\t<span style="color: red;line-height: 30px;">{{errorMessage}}</span>\n\t\t\t<a class="btn btn-sm btn-primary pull-right" style="color: #fff;background-color: #337ab7;border-color: #2e6da4;float: right;padding: 5px 10px; font-size: 12px; line-height: 1.5;border-radius: 3px;font-family: sans-serif;"  on-click="update-item">Save</a>\n\t\t</div>\n\t\t',
	data: function data() {
		return {
			itemtoedit: {}
		};
	},
	_hash_key_name: function _hash_key_name() {
		return (this.get('describeTable').KeySchema.filter(function (k) {
			return k.KeyType === 'HASH';
		})[0] || {}).AttributeName;
	},
	_range_key_name: function _range_key_name() {
		return (this.get('describeTable').KeySchema.filter(function (k) {
			return k.KeyType === 'RANGE';
		})[0] || {}).AttributeName;
	},
	oninit: function oninit() {
		var ractive = this;

		//this.set({itemtoedit: Object.assign({}, this.get('rawitem'))  })

		this.set({ itemtoedit: (0, _cloneDeep2.default)(this.get('rawitem')) });

		this.observe('itemtoedit', function (n, o, kp) {
			this.set({ errorMessage: '' });
		});

		//var rawitem = this.get('rawitem')
		//this.set({itemtoedit: { ...rawitem }  })

		//var debug = this.get('itemtoedit');

		this.on('update-item', function () {
			//console.log("table=","HASH=", this._hash_key_name(), " RANGE=", this._range_key_name() )

			var originalitem = this.get('rawitem');
			var updateditem = (0, _cloneDeep2.default)(this.get('itemtoedit'));

			//console.log("originalitem", originalitem.binary, typeof originalitem.binary )

			//console.log('hello', updateditem )


			var updateItemCall = {
				TableName: this.get('describeTable.TableName'),
				Key: {},
				AttributeUpdates: {}
			};

			if (!updateditem.hasOwnProperty(this._hash_key_name())) return alert('Missing PARTITION_KEY ' + this._hash_key_name());

			if (this._range_key_name() && !updateditem.hasOwnProperty(this._range_key_name())) return alert('Missing SORT_KEY ' + this._range_key_name());

			updateItemCall.Key[this._hash_key_name()] = updateditem[this._hash_key_name()];
			delete updateditem[this._hash_key_name()];

			if (this._range_key_name()) {
				updateItemCall.Key[this._range_key_name()] = updateditem[this._range_key_name()];
				delete updateditem[this._range_key_name()];
			}

			Object.keys(updateditem).map(function (k) {
				updateItemCall.AttributeUpdates[k] = {
					Action: 'PUT', //
					Value: updateditem[k]
				};
			});

			console.log("updateItem", updateItemCall);
			DynamoDB.client.updateItem(updateItemCall, function (err, data) {
				if (err) return ractive.set('errorMessage', err.message);

				ractive.get('window').close();
			});
		});
	}

});

/***/ })
/******/ ])["default"];
});

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Ractive.extend({
	template: '\n\t\t<header>\n\t\t\t\t<div class="dropdown services-dropdown pull-left" style="margin-left: 100px;">\n\t\t\t\t\t<a on-click="@this.toggle(\'show_services_dropdown\')">\n\t\t\t\t\t\tServices\n\t\t\t\t\t\t<i class="icon zmdi {{#if show_services_dropdown}}zmdi-chevron-up{{else}}zmdi-chevron-down{{/if}}"></i>\n\t\t\t\t\t</a>\n\t\t\t\t\t<div class="dropdown-menu {{#if show_services_dropdown}}show{{/if}}">\n\t\t\t\t\t\t<li><a class="dropdown-item" href="../cloudformation/?region={{region}}">Cloudformation</a>\n\t\t\t\t\t\t<li><a class="dropdown-item" href="../dynamodb/?region={{region}}">DynamoDB</a>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t\t<div class="dropdown region-dropdown pull-right">\n\t\t\t\t\t<a on-click="@this.toggle(\'show_region_dropdown\')">\n\t\t\t\t\t\t{{#regions}}{{#if region === .id }}{{.name}}{{/if}}{{/regions}}\n\t\t\t\t\t\t<i class="icon zmdi {{#if show_region_dropdown}}zmdi-chevron-up{{else}}zmdi-chevron-down{{/if}}"></i>\n\t\t\t\t\t</a>\n\t\t\t\t\t<div class="dropdown-menu {{#if show_region_dropdown}}show{{/if}}">\n\t\t\t\t\t\t{{#regions}}\n\t\t\t\t\t\t\t<li class="{{#if region === .id }}active{{/if}}"><a class="dropdown-item" href="?region={{.id}}">{{.name}}</a>\n\t\t\t\t\t\t{{/regions}}\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t</header>\n\t',
	data: function data() {
		return {

			regions: [{ id: 'us-east-1', name: 'US East (N. Virginia)' }, { id: 'us-east-2', name: 'US East (Ohio)' }, { id: 'us-west-1', name: 'US West (N. California)' }, { id: 'us-west-2', name: 'US West (Oregon)' }, { id: 'ap-south-1', name: 'Asia Pacific (Mumbai)' }, { id: 'ap-northeast-2', name: 'Asia Pacific (Seoul)' }, { id: 'ap-southeast-1', name: 'Asia Pacific (Singapore)' }, { id: 'ap-southeast-2', name: 'Asia Pacific (Sydney)' }, { id: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)' }, { id: 'ca-central-1', name: 'Canada (Central)' }, { id: 'eu-central-1', name: 'EU (Frankfurt)' }, { id: 'eu-west-1', name: 'EU (Ireland)' }, { id: 'eu-west-2', name: 'EU (London)' }, { id: 'eu-west-3', name: 'EU (Paris)' }, { id: 'eu-north-1', name: 'EU (Stockholm)' }, { id: 'sa-east-1', name: 'South America (Sao Paulo)' }]
		};
	}
});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

!function(t,e){ true?module.exports=e(__webpack_require__(0)):undefined}(window,function(a){return(i={},o.m=n=[function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=s(a(1)),o=s(a(2)),i=s(a(3));function s(t){return t&&t.__esModule?t:{default:t}}e.default=n.default.extend({template:{v:4,t:[{t:7,e:"hsplit",m:[{t:13,n:"style",f:";",g:1},{t:13,n:"class",f:"ractive-cloudformation-ui",g:1}],f:[{t:7,e:"left",m:[{t:13,n:"style",f:"border-right: 1px solid #b9b8b6;",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"style",f:"display: block;font-size: 12px;padding-left: 10px;font-size: 18px;font-weight: 700;color: #000;line-height: 2rem;padding: 12px 35px;border-bottom: 1px solid #ddd;",g:1}],f:["Cloudformation"]}," ",{t:7,e:"div",m:[{t:13,n:"style",f:"position: absolute;bottom: 0px;top: 60px;left: 0px;right: 0px;",g:1}],f:[{t:7,e:"div",m:[{t:13,n:"style",f:"display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 35px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;color: #ec7211;font-weight: bold;",g:1}],f:["Stacks"]}," ",{t:7,e:"div",m:[{t:13,n:"style",f:"display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 35px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;color: #000;",g:1}],f:["StacksSets"]}," ",{t:7,e:"div",m:[{t:13,n:"style",f:"display: block;height: 30px;line-height: 30px;font-size: 13px;padding: 0px 35px;border-top: 1px solid transparent;border-left: 1px solid transparent;margin-bottom: 0px;color: #000;",g:1}],f:["Exports"]}]}]}," ",{t:7,e:"content",m:[{t:13,n:"style",f:"background-color: transparent;border: 0px;overflow-x: auto;",g:1}],f:[{t:7,e:"cftabs",m:[{n:"active_id",f:"stacklist",t:13,g:1}]}]}]}]},components:{hsplit:o.default,cftabs:i.default},css:".hsplit {position: absolute;top:0px;left: 0px;right: 0px;bottom: 0px; /*background-color: #f0f0f0;*/background-color: #f2f3f3; color: #999999;} left {position:absolute;display: block;top: 0px;left: 0px;width: 260px;bottom: 0px;background-color: #fff;} content {position:absolute;display: block;top: 0px;left: 265px;right: 0px;bottom: 0px;margin-top: 5px;} content tabcontent {position: absolute;top: 28px;left: 0px;right: 0px;bottom: 0px;} .ractive-cloudformation-ui {font-family: sans-serif;} .ractive-cloudformation-ui * {box-sizing: border-box } content tabhead {position: absolute;top: 0px;left: 0px;right:0px;height: 38px;overflow: hidden;font-size: 0px;} content tabhead tab {display: inline-block;line-height: 28px;padding: 0px 25px 0px 25px; margin-bottom: 10px; cursor: pointer;font-size: 14px;} content tabhead tab.active {} body.theme_light content tabhead { padding-bottom: 10px;border-bottom: 1px solid #cccccc;} body.theme_light content tabhead tab:first-child {border-left: 0px;} body.theme_light content tabhead tab {border-left: 1px solid #cccccc;font-weight: bold;color: #545b64;} body.theme_light content tabhead tab.active {color: #eb5f07;position: relative;} body.theme_light content tabhead tab.active:after {content: '';position: absolute;left: 0px;right: 0px;bottom: -9px;border-bottom: 2px solid #000;} ",data:function(){return{}},on:{init:function(){var n;cloudformation=new AWS.CloudFormation({endpoint:this.get("endpoint"),region:this.get("region"),credentials:{accessKeyId:this.get("accessKeyId"),secretAccessKey:this.get("secretAccessKey")}}),(n=jQuery).fn.pickafile=function(a){return this.each(function(){var t=n(this),e=n("<input/>",{type:"file",accept:a.accept||void 0,style:"display: none"});e.on("change",function(){if(1<e.get(0).files.length)return alert("Please upload one file at a time");a.onselect.apply(t,[e.get(0).files[0]])}),e.click()}),this}}}})},function(t,e){t.exports=a},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:'<div class="hsplit {{class}} " style="{{style}}">{{yield}}</div>',isolated:!1,data:{direction:"horizontal"}})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=d(a(4)),o=d(a(13)),i=d(a(6)),s=d(a(14));function d(t){return t&&t.__esModule?t:{default:t}}e.default=Ractive.extend({components:{stacklist:n.default,ministacklist:o.default,stackdetails:i.default,stackcreate:s.default},template:'\n\n\t\t\t<div style="height: 30px;margin-left: 10px;line-height: 30px;font-size: 15px;">\n\t\t\t\t<a style="cursor: pointer;text-decoration: none;">Cloudformation</a> &gt;\n\t\t\t\t<a style="cursor: pointer;text-decoration: none;" on-click="@this.set(\'active_id\', \'stacklist\')">Stacks</a>\n\t\t\t\t{{#if active_id === \'stackdetails\'}}\n\t\t\t\t\t&gt; <a style="cursor: pointer;text-decoration: none;color: #999;">{{stackdetails}}</a>\n\t\t\t\t{{/if}}\n\t\t\t</div>\n\n\t\t\t{{#if active_id === "stacklist" || active_id === "stackdetails" }}\n\t\t\t<div style="position: absolute;top: 40px;left: 10px;right: 10px;bottom: 10px;">\n\t\t\t\t{{#if active_id === "stacklist"}}\n\t\t\t\t\t<div style="position: absolute;top: 0px;left: 0px;width: {{#if active_id === \'stackdetails\'}} 260px; {{else}}100%;{{/if}}; box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color: #fff">\n\t\t\t\t\t\t<stacklist />\n\t\t\t\t\t</div>\n\t\t\t\t{{/if}}\n\n\t\t\t\t{{#if active_id === \'stackdetails\'}}\n\t\t\t\t\t<div style="position: absolute;top: 0px;left: 0px;width: {{#if active_id === \'stackdetails\'}} 260px; {{else}}100%;{{/if}}; bottom: 0px;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color: #fff">\n\t\t\t\t\t\t<ministacklist active-stack="{{stackdetails}}" />\n\t\t\t\t\t</div>\n\t\t\t\t{{/if}}\n\t\t\t\t{{#if active_id === \'stackdetails\'}}\n\t\t\t\t\t<stackdetails stack="{{stackdetails}}" />\n\t\t\t\t{{/if}}\n\t\t\t</div>\n\t\t\t{{/if}}\n\n\t\t\t{{#if active_id === "stackcreate" }}\n\t\t\t<div style="position: absolute;top: 10px;left: 50px;right: 50px;bottom: 10px;">\n\t\t\t\t<stackcreate />\n\t\t\t</div>\n\t\t\t{{/if}}\n\t\t',data:function(){return{}},active_cache:[],activetabcontent:function(){var e=this;e.active_cache.push(e.get("active_id")),e.findAllComponents("tabletab").map(function(t){t.set("active",t.get("table.id")===e.get("active_id"))})},command:function(t,e){"stackdetails"===t&&this.set("stackdetails",e),this.set("active_id",t)},oninit:function(){var n=this;this.observe("active_id",function(t,e,a){n.activetabcontent()}),this.on("closetab",function(t,e){return this.active_cache=this.active_cache.filter(function(t){return t!==e}),this.set("tabs",this.get("tabs").filter(function(t){return t.id!==e})),this.get("active_id")===e&&this.set("active_id",this.active_cache.pop()),n.activetabcontent(),!1}),this.on("activetab",function(t,e){return this.set("active_id",e),!1})}})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({components:{},template:'\n\t\t<div style="height: 50px;padding: 10px 10px 0px 0px;background-color: #fafafa;;">\n\n\t\t\t<div style="float: right;">\n\t\t\t\t<a class="btn btn-sm btn-default" on-click="refresh"><i class="icon zmdi zmdi-refresh"></i></a>\n\t\t\t\t<a class="btn btn-sm btn-default {{#if selection}}{{else}}disabled{{/if}}" on-click=\'delete\'> Delete </a>\n\t\t\t\t<a class="btn btn-sm btn-default disabled" on-click=\'update-stack\'> Update </a>\n\t\t\t\t<a class="btn btn-sm btn-warning" on-click="create-stack"> Create stack </a>\n\t\t\t</div>\n\t\t</div>\n\n\t\t<table style="border-collapse: collapse;border-spacing: 0; empty-cells: show; border: 1px solid #eaeded;width: 100%;">\n\t\t    <thead style="background-color: #fafafa;color: #000;text-align: left;vertical-align: bottom;border-bottom: 1px solid #eaeded">\n\t\t        <tr>\n\t\t            <th style="padding: 0.5em 1em;"></th>\n\t\t            <th style="padding: 0.5em 1em;">Stack name</th>\n\t\t            <th style="padding: 0.5em 1em;">Status</th>\n\t\t            <th style="padding: 0.5em 1em;">Created time</th>\n\t\t\t\t\t<th style="padding: 0.5em 1em;">Description</th>\n\t\t        </tr>\n\t\t    </thead>\n\t\t    <tbody>\n\t\t\t\t{{#stacks}}\n\n\t\t        <tr style="{{#if selection === .StackName }}background-color: #f1faff;{{/if}}">\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;"><input type="radio" name={{selection}} value=\'{{.StackName}}\'></td>\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;"><a style="cursor: pointer;" on-click="gotostack">{{.StackName}}</a></td>\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;">{{.StackStatus}}</td>\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;">{{.CreationTimeFormatted}}</td>\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;">-</td>\n\t\t        </tr>\n\t\t\t\t{{/stacks}}\n\n\t\t    </tbody>\n\t\t</table>\n\t',stack_list:function(a){var n=this;this.set({stacks:[]}),this.set("selection"),cloudformation.listStacks({},function(t,e){t?a&&a(t):(n.set("stacks",e.StackSummaries.sort(function(t,e){return new Date(t.CreationTime).getTime()>new Date(e.CreationTime).getTime()?-1:1}).filter(function(t){return"DELETE_COMPLETE"!==t.StackStatus}).sort(function(t){return t.CreationTimeFormatted=new Date(t.CreationTime).toISOString(),t})),a&&a(t,e))})},data:function(){return{selection:""}},on:{init:function(){var a=this;a.set("columns",[null,"Stack Name","Status","Created time"]),a.set("rows",[]),a.on("refresh",function(){a.stack_list()}),a.on("create-stack",function(){a.root.findComponent("cftabs").command("stackcreate","Create Stack")}),a.on("delete",function(){var t=a.get("selection");if(!t)return alert("Please select a stack to delete");var e=t;confirm("Are you sure you want to delete stack "+e)&&cloudformation.deleteStack({StackName:e},function(t,e){t&&alert("delete stack failed"),setTimeout(function(){a.stack_list()},1500)})}),a.stack_list()},gotostack:function(t){this.root.findComponent("cftabs").command("stackdetails",this.get(t.resolve()+".StackName"))}}})},,function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n,o=a(12),i=(n=o)&&n.__esModule?n:{default:n};e.default=Ractive.extend({isolated:!0,components:{stackdetailtabs:i.default},template:'\n\t\t{{#if show}}\n\t\t\t<stackdetailtabs StackName="{{stack}}" />\n\t\t{{/if}}\n\t',data:function(){return{show:!0}},on:{init:function(){this.observe("stack",function(t){console.log("stack changed to ",t),this.set({show:!1});var e=this;setTimeout(function(){e.set({show:!0})},50)})}}})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:'\n\t\t<div style="position: absolute;top: 0px;left:0px;right: 0px;bottom: 0px;overflow: auto;white-space: pre;font-family: monospace;padding: 15px;">\n\t\t{{TemplateBody}}\n\t\t</div>\n\t',oninit:function(){var a=this,t={StackName:this.get("StackName")};cloudformation.getTemplate(t,function(t,e){if(t)return alert("failed getting stack template");a.set("TemplateBody",e.TemplateBody)})}})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({components:{},template:'\n\t\t<table style="border-collapse: collapse;border-spacing: 0; empty-cells: show; border: 1px solid #eaeded;width: 100%;">\n\t\t    <thead style="background-color: #fafafa;color: #000;text-align: left;vertical-align: bottom;border-bottom: 1px solid #eaeded">\n\t\t        <tr>\n\t\t            <th style="padding: 0.5em 1em;">Key</th>\n\t\t            <th style="padding: 0.5em 1em;">Value</th>\n\t\t            <th style="padding: 0.5em 1em;">Resolved value</th>\n\t\t        </tr>\n\t\t    </thead>\n\t\t    <tbody>\n\t\t\t\t{{#parameters}}\n\t\t        <tr>\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;">{{.ParameterKey}}</td>\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;">{{.ParameterValue}}</td>\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;"></td>\n\t\t        </tr>\n\t\t\t\t{{/parameters}}\n\n\t\t    </tbody>\n\t\t</table>\n\n\t',oninit:function(){var a=this,t={StackName:this.get("StackName")};cloudformation.describeStacks(t,function(t,e){if(t)return alert("failed describing stack");console.log(e.Stacks[0]),a.set("stack",e.Stacks[0]),a.set("parameters",e.Stacks[0].Parameters)})}})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({components:{},template:'\n\n\n\n\t\t<div style="background-color: #fafafa;border-bottom: 1px solid #eaeded;height: 50px;padding: 7px;">\n\t\t\t<div style="float:right;">\n\t\t\t\t<a class="btn btn-sm btn-default" on-click="@this.list_resources()"><i class="icon zmdi zmdi-refresh"></i></a>\n\t\t\t</div>\n\t\t\t<div style="font-size: 20px;line-height: 40px;">Resources</div>\n\n\t\t</div>\n\n\t\t<table style="border-collapse: collapse;border-spacing: 0; empty-cells: show;width: 100%;">\n\t\t    <thead style="background-color: #fafafa;color: #000;text-align: left;vertical-align: bottom;border-bottom: 1px solid #eaeded">\n\t\t        <tr>\n\t\t            <th style="padding: 0.5em 1em;">Logical ID</th>\n\t\t            <th style="padding: 0.5em 1em;">Phisical ID</th>\n\t\t            <th style="padding: 0.5em 1em;">Type</th>\n\t\t\t\t\t<th style="padding: 0.5em 1em;">Status</th>\n\t\t\t\t\t<th style="padding: 0.5em 1em;">Status Reason</th>\n\t\t        </tr>\n\t\t    </thead>\n\t\t    <tbody>\n\t\t\t\t{{#resources}}\n\t\t        <tr>\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;">{{.LogicalResourceId}}</td>\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;">{{.PhysicalResourceId}}</td>\n\t\t            <td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;">{{.ResourceType}}</td>\n\t\t\t\t\t<td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;">{{.ResourceStatus}}</td>\n\t\t\t\t\t<td style="padding: 0.5em 1em;border-width: 0 0 1px 0;border-bottom: 1px solid #eaeded;">&nbsp;</td>\n\t\t        </tr>\n\t\t\t\t{{/resources}}\n\n\t\t    </tbody>\n\t\t</table>\n\n\t',list_resources:function(){var a=this;a.set("resources",[]);var t={StackName:this.get("StackName")};cloudformation.listStackResources(t,function(t,e){if(t)return alert("get stack resources failed");a.set("resources",e.StackResourceSummaries)})},oninit:function(){this.get("StackName");this.list_resources()}})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:'\n\t\t<div style="padding: 15px;">Events Not Implemented</div>\n\t'})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({template:'\n\t\t<div style="padding: 15px;">Exports Not Implemented</div>\n\t'})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var n=r(a(7)),o=r(a(8)),i=r(a(9)),s=r(a(10)),d=r(a(11));function r(t){return t&&t.__esModule?t:{default:t}}e.default=Ractive.extend({components:{stackdetailstemplate:n.default,stackdetailsparameters:o.default,stackdetailsresources:i.default,stackdetailsevents:s.default,stackdetailsexports:d.default},template:'\n\t\t<div style="position: absolute;left: 270px;right:0px;top: 0px;height: 50px;">\n\t\t\t<div style="float: right;padding-top: 7px;">\n\t\t\t\t<a class="btn btn-sm btn-default" on-click=\'delete-stack\' > Delete </a>\n\t\t\t\t<a class="btn btn-sm btn-default disabled"  > Update </a>\n\t\t\t\t<a class="btn btn-sm btn-default" on-click="create-stack"> Create Stack </a>\n\t\t\t</div>\n\t\t\t<h4 style="color: #000;">{{StackName}}</h4>\n\n\t\t</div>\n\t\t<div style="position: absolute;left: 270px;right:0px;top: 40px;bottom: 0px;">\n\t\t\t\t<tabhead style="">\n\t\t\t\t\t<tab class=\'{{#if active_id === "exports" }}active{{/if}}\' on-click=\'@this.fire("activetab", "exports")\'>Outputs</tab>\n\t\t\t\t\t<tab class=\'{{#if active_id === "resources" }}active{{/if}}\' on-click=\'@this.fire("activetab", "resources")\'>Resources</tab>\n\t\t\t\t\t<tab class=\'{{#if active_id === "events" }}active{{/if}}\' on-click=\'@this.fire("activetab", "events")\'>Events</tab>\n\t\t\t\t\t<tab class=\'{{#if active_id === "template" }}active{{/if}}\'   on-click=\'@this.fire("activetab", "template")\'>Template</tab>\n\t\t\t\t\t<tab class=\'{{#if active_id === "parameters" }}active{{/if}}\' on-click=\'@this.fire("activetab", "parameters")\'>Parameters</tab>\n\t\t\t\t</tabhead>\n\n\t\t\t\t<tabcontent style="top: 50px;">\n\t\t\t\t\t{{#if active_id === "template" }}\n\t\t\t\t\t\t<div style="position: absolute;top: 0;left: 0;right:0;bottom: 0; background-color:#fff;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;">\n\t\t\t\t\t\t\t<stackdetailstemplate StackName="{{StackName}}">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t{{/if}}\n\t\t\t\t\t{{#if active_id === "parameters" }}\n\t\t\t\t\t\t<div style="background-color:#fff;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;">\n\t\t\t\t\t\t\t<stackdetailsparameters StackName="{{StackName}}">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t{{/if}}\n\t\t\t\t\t{{#if active_id === "resources" }}\n\t\t\t\t\t\t<div style="background-color:#fff;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;">\n\t\t\t\t\t\t\t<stackdetailsresources StackName="{{StackName}}">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t{{/if}}\n\t\t\t\t\t{{#if active_id === "events" }}\n\t\t\t\t\t\t<div style="background-color:#fff;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;">\n\t\t\t\t\t\t\t<stackdetailsevents StackName="{{StackName}}">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t{{/if}}\n\t\t\t\t\t{{#if active_id === "exports" }}\n\t\t\t\t\t\t<div style="background-color:#fff;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;">\n\t\t\t\t\t\t\t<stackdetailsexports StackName="{{StackName}}">\n\t\t\t\t\t\t</div>\n\t\t\t\t\t{{/if}}\n\t\t\t\t</tabcontent>\n\t\t</div>\n\t',data:function(){return{active_id:"resources"}},oninit:function(){var a=this;this.on("create-stack",function(){a.root.findComponent("cftabs").command("stackcreate","Create Stack")}),this.on("delete-stack",function(){var t=this.get("StackName");confirm("Are you sure you want to delete stack "+t)&&cloudformation.deleteStack({StackName:t},function(t,e){t&&alert("delete stack failed"),setTimeout(function(){a.root.findComponent("cftabs").command("stacklist","")},1500)})}),this.on("activetab",function(t,e){return this.set("active_id",e),!1})}})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=Ractive.extend({components:{},template:'\n\t\t<div style="padding: 7px;text-align: right;background-color: #fafafa;">\n\t\t\t<a class="btn btn-sm btn-default" on-click="refresh"><i class="icon zmdi zmdi-refresh"></i></a>\n\t\t</div>\n\n\t\t{{#stacks}}\n\t\t\t<div style="height: 86px;padding: 15px 20px;border-bottom: 1px solid #eaeded;text-decoration: none;cursor: pointer;{{#if ~/[\'active-stack\'] === .StackName }}border: 1px solid #0073bb;{{/if}}" on-click="gotostack">\n\t\t\t\t<div style="color: #000;line-height: 20px;">{{.StackName}}</div>\n\t\t\t\t<div style="color: #aaa;font-size: 12px;line-height: 20px;margin-top: 5px;">{{.CreationTimeFormatted}}</div>\n\t\t\t\t<div style="color: #1d8102;font-size: 13px;">{{.StackStatus}}</div>\n\t\t\t</div>\n\t\t{{/stacks}}\n\n\t',data:function(){return{stacks:[]}},stack_list:function(a){var n=this;this.set({stacks:[]}),cloudformation.listStacks({},function(t,e){t?a&&a(t):(n.set("stacks",e.StackSummaries.sort(function(t,e){return new Date(t.CreationTime).getTime()>new Date(e.CreationTime).getTime()?-1:1}).filter(function(t){return"DELETE_COMPLETE"!==t.StackStatus}).sort(function(t){return t.CreationTimeFormatted=new Date(t.CreationTime).toISOString(),t})),a&&a(t,e))})},on:{init:function(){var t=this;t.on("refresh",function(){t.stack_list()}),t.stack_list()},gotostack:function(t){this.root.findComponent("cftabs").command("stackdetails",this.get(t.resolve()+".StackName"))}}})},function(t,e,a){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};e.default=Ractive.extend({template:'\n\n\t\t\t{{#if page === \'upload\'}}\n\t\t\t\t<h3>Create Stack</h3>\n\t\t\t\t<div style="box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;max-width: 800px;margin-bottom: 15px;">\n\n\n\t\t\t\t\t<div style="font-size: 18px;line-height: 30px;background-color: #fafafa;border-bottom: 1px solid #eaeded;padding: 15px 30px;font-weight: 700;color: #000;">Specify template</div>\n\t\t\t\t\t<div style="padding: 30px;">\n\n\t\t\t\t\t\t\t{{#if err}}\n\t\t\t\t\t\t\t\t<div class="err" style=\'color: #dc3636;background-color: #e69ca6;border: 1px solid #ec6b6b;border-radius: 3px;padding: 6px;\'>{{ err.message || "Template parse failed" }}</div>\n\t\t\t\t\t\t\t{{/if}}\n\n\n\t\t\t\t\t\t\t<br>\n\t\t\t\t\t\t\t<h4>Specify template</h4>\n\t\t\t\t\t\t\t<p>\n\t\t\t\t\t\t\t\t<li>✅ .yaml or .json\n\t\t\t\t\t\t\t\t<li>✅ !Join, !Sub, !Select, !Split\n\t\t\t\t\t\t\t\t<li>✅ !Base64, !GetAZs, !FindInMap\n\t\t\t\t\t\t\t\t<li>✅ !Ref to in-template and pseudo parameters\n\t\t\t\t\t\t\t\t<li>❌ !Ref to another resource\n\t\t\t\t\t\t\t\t<li>❌ !ImportValue, !GetAtt !Transform, !Cidr\n\t\t\t\t\t\t\t\t<li>❌ !If, !And, !Equals, !Not, !Or\n\t\t\t\t\t\t\t\t<li>✅ partially supported <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html" target="_blank">AWS::DynamoDB::Table</a>\n\t\t\t\t\t\t\t\t<li>✅ partially supported <a href="https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket.html" target="_blank">AWS::S3::Bucket</a>\n\t\t\t\t\t\t\t\t<li>❌ all other resource types are created as decoy\n\t\t\t\t\t\t\t</p>\n\t\t\t\t\t\t\t<a class="btn btn-md btn-default"  on-click=\'upload\' >Upload Template</a>\n\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div style="max-width: 800px;">\n\t\t\t\t\t<a class="btn btn-warning {{#if newstack.TemplateBody === null }}disabled{{/if}} pull-right" on-click="goto-parameters">Next</a>\n\t\t\t\t</div>\n\t\t\t{{/if}}\n\n\t\t\t{{#if page === \'parameters\'}}\n\t\t\t\t<h3>Specify stack details</h3>\n\n\t\t\t\t<div style="box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;max-width: 800px;margin-bottom: 15px;">\n\t\t\t\t\t<div style="font-size: 18px;line-height: 30px;background-color: #fafafa;border-bottom: 1px solid #eaeded;padding: 15px 30px;font-weight: 700;color: #000;">Stack name</div>\n\t\t\t\t\t<div style="padding: 30px;">\n\t\t\t\t\t\t<br>\n\t\t\t\t\t\t<div>Stack name</div>\n\t\t\t\t\t\t<input type="text" value="{{newstack.StackName}}" style="width: 100%;padding: 10px;"/>\n\t\t\t\t\t\t<small>Stack name can include letters (A-Z and a-z), numbers (0-9), and dashes (-).</small>\n\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div style="box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;max-width: 800px;margin-bottom: 15px;">\n\t\t\t\t\t<div style="font-size: 18px;line-height: 30px;background-color: #fafafa;border-bottom: 1px solid #eaeded;padding: 15px 30px;font-weight: 700;color: #000;">Parameters</div>\n\t\t\t\t\t<div style="padding: 30px;">\n\n\n\t\t\t\t{{#newstack.Parameters}}\n\t\t\t\t<br>\n\t\t\t\t<div>{{.ParameterKey}}</div>\n\t\t\t\t\t<div>\n\t\t\t\t\t{{#if .ParameterConstraints.AllowedValues}}\n\t\t\t\t\t\t<select value="{{.ParameterValue}}" style="width: 100%;padding: 10px;height: 37px;">\n\t\t\t\t\t\t\t{{#.ParameterConstraints.AllowedValues}}\n\t\t\t\t\t\t\t<option value="{{.}}">{{.}}</option>\n\t\t\t\t\t\t\t{{/.ParameterConstraints.AllowedValues}}\n\t\t\t\t\t\t</select>\n\t\t\t\t\t{{else}}\n\t\t\t\t\t\t<input type="text" value="{{.ParameterValue}}" style="width: 100%;padding: 10px;">\n\t\t\t\t\t{{/if}}\n\t\t\t\t</div>\n\t\t\t\t{{/newstack.Parameters}}\n\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t\t<div style="max-width: 800px;">\n\t\t\t\t\t<a class="btn btn-warning {{#if newstack.StackName === \'\' }}disabled{{/if}} pull-right" on-click="goto-confirm">Next</a>\n\t\t\t\t</div>\n\n\t\t\t{{/if}}\n\n\n\t\t\t{{#if page === \'confirm\'}}\n\t\t\t\t<div style="position: absolute;top: 0px;left: 0px;right:0px;overflow: auto;box-shadow: 0 1px 1px 0 rgba(0,28,36,.5);border-top: 1px solid #eaeded;background-color:#fff;">\n\t\t\t\t\t<div style="padding: 30px;">\n\n\t\t\t\t\t\t<div class="err" style=\'{{#if !err}}visibility:hidden;{{/if}}color: #dc3636;background-color: #e69ca6;border: 1px solid #ec6b6b;border-radius: 3px;padding: 6px;margin-bottom: 10px;\'>{{ err.message || "Create failed" }}</div>\n\n\t\t\t\t\t\t<a class="btn btn-warning" on-click="create">Create</a>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t{{/if}}\n\n\t',data:function(){return{page:"upload",newstack:{StackName:"",TemplateBody:null}}},oninit:function(){var n=this;n.on("upload",function(t){n.set("err"),$("body").pickafile({onselect:function(e){console.log("selected",e);var a=new FileReader;a.onload=function(t){n.set("newstack.StackName",e.name.split(".yaml").join("").split(".json").join("")),n.set("newstack.TemplateBody",a.result)},a.readAsBinaryString(e)}})}),n.on("goto-parameters",function(){var t={TemplateBody:n.get("newstack.TemplateBody")};cloudformation.getTemplateSummary(t,function(t,e){if(t)return n.set("err",t),void console.log("getTemplateSummary failed",void 0===t?"undefined":o(t),JSON.stringify(t),t.message);n.set("newstack.Parameters",e.Parameters.map(function(t){return t.DefaultValue&&(t.ParameterValue=t.DefaultValue),t})),n.set("newstack.ResourceTypes",e.ResourceTypes),n.set("page","parameters")})}),n.on("goto-confirm",function(){n.set("err"),n.set("page","confirm")}),n.on("create",function(){n.set("err");var t=n.get("newstack");t.Parameters=t.Parameters.map(function(t){return{ParameterKey:t.ParameterKey,ParameterValue:t.ParameterValue}}),cloudformation.createStack(t,function(t,e){t?n.set("err",t):setTimeout(function(){n.root.findComponent("cftabs").command("stacklist")},1500)})})}})}],o.c=i,o.d=function(t,e,a){o.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(o.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)o.d(a,n,function(t){return e[t]}.bind(null,n));return a},o.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(e,"a",e),e},o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},o.p="",o(o.s=0)).default;function o(t){if(i[t])return i[t].exports;var e=i[t]={i:t,l:!1,exports:{}};return n[t].call(e.exports,e,e.exports,o),e.l=!0,e.exports}var n,i});

/***/ })
/******/ ])["default"];
});