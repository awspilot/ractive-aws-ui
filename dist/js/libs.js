(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.async = global.async || {})));
}(this, (function (exports) { 'use strict';

function slice(arrayLike, start) {
    start = start|0;
    var newLen = Math.max(arrayLike.length - start, 0);
    var newArr = Array(newLen);
    for(var idx = 0; idx < newLen; idx++)  {
        newArr[idx] = arrayLike[start + idx];
    }
    return newArr;
}

/**
 * Creates a continuation function with some arguments already applied.
 *
 * Useful as a shorthand when combined with other control flow functions. Any
 * arguments passed to the returned function are added to the arguments
 * originally passed to apply.
 *
 * @name apply
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {Function} fn - The function you want to eventually apply all
 * arguments to. Invokes with (arguments...).
 * @param {...*} arguments... - Any number of arguments to automatically apply
 * when the continuation is called.
 * @returns {Function} the partially-applied function
 * @example
 *
 * // using apply
 * async.parallel([
 *     async.apply(fs.writeFile, 'testfile1', 'test1'),
 *     async.apply(fs.writeFile, 'testfile2', 'test2')
 * ]);
 *
 *
 * // the same process without using apply
 * async.parallel([
 *     function(callback) {
 *         fs.writeFile('testfile1', 'test1', callback);
 *     },
 *     function(callback) {
 *         fs.writeFile('testfile2', 'test2', callback);
 *     }
 * ]);
 *
 * // It's possible to pass any number of additional arguments when calling the
 * // continuation:
 *
 * node> var fn = async.apply(sys.puts, 'one');
 * node> fn('two', 'three');
 * one
 * two
 * three
 */
var apply = function(fn/*, ...args*/) {
    var args = slice(arguments, 1);
    return function(/*callArgs*/) {
        var callArgs = slice(arguments);
        return fn.apply(null, args.concat(callArgs));
    };
};

var initialParams = function (fn) {
    return function (/*...args, callback*/) {
        var args = slice(arguments);
        var callback = args.pop();
        fn.call(this, args, callback);
    };
};

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

var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

function fallback(fn) {
    setTimeout(fn, 0);
}

function wrap(defer) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        defer(function () {
            fn.apply(null, args);
        });
    };
}

var _defer;

if (hasSetImmediate) {
    _defer = setImmediate;
} else if (hasNextTick) {
    _defer = process.nextTick;
} else {
    _defer = fallback;
}

var setImmediate$1 = wrap(_defer);

/**
 * Take a sync function and make it async, passing its return value to a
 * callback. This is useful for plugging sync functions into a waterfall,
 * series, or other async functions. Any arguments passed to the generated
 * function will be passed to the wrapped function (except for the final
 * callback argument). Errors thrown will be passed to the callback.
 *
 * If the function passed to `asyncify` returns a Promise, that promises's
 * resolved/rejected state will be used to call the callback, rather than simply
 * the synchronous return value.
 *
 * This also means you can asyncify ES2017 `async` functions.
 *
 * @name asyncify
 * @static
 * @memberOf module:Utils
 * @method
 * @alias wrapSync
 * @category Util
 * @param {Function} func - The synchronous function, or Promise-returning
 * function to convert to an {@link AsyncFunction}.
 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
 * invoked with `(args..., callback)`.
 * @example
 *
 * // passing a regular synchronous function
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(JSON.parse),
 *     function (data, next) {
 *         // data is the result of parsing the text.
 *         // If there was a parsing error, it would have been caught.
 *     }
 * ], callback);
 *
 * // passing a function returning a promise
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(function (contents) {
 *         return db.model.create(contents);
 *     }),
 *     function (model, next) {
 *         // `model` is the instantiated model object.
 *         // If there was an error, this function would be skipped.
 *     }
 * ], callback);
 *
 * // es2017 example, though `asyncify` is not needed if your JS environment
 * // supports async functions out of the box
 * var q = async.queue(async.asyncify(async function(file) {
 *     var intermediateStep = await processFile(file);
 *     return await somePromise(intermediateStep)
 * }));
 *
 * q.push(files);
 */
function asyncify(func) {
    return initialParams(function (args, callback) {
        var result;
        try {
            result = func.apply(this, args);
        } catch (e) {
            return callback(e);
        }
        // if result is Promise object
        if (isObject(result) && typeof result.then === 'function') {
            result.then(function(value) {
                invokeCallback(callback, null, value);
            }, function(err) {
                invokeCallback(callback, err.message ? err : new Error(err));
            });
        } else {
            callback(null, result);
        }
    });
}

function invokeCallback(callback, error, value) {
    try {
        callback(error, value);
    } catch (e) {
        setImmediate$1(rethrow, e);
    }
}

function rethrow(error) {
    throw error;
}

var supportsSymbol = typeof Symbol === 'function';

function isAsync(fn) {
    return supportsSymbol && fn[Symbol.toStringTag] === 'AsyncFunction';
}

function wrapAsync(asyncFn) {
    return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
}

function applyEach$1(eachfn) {
    return function(fns/*, ...args*/) {
        var args = slice(arguments, 1);
        var go = initialParams(function(args, callback) {
            var that = this;
            return eachfn(fns, function (fn, cb) {
                wrapAsync(fn).apply(that, args.concat(cb));
            }, callback);
        });
        if (args.length) {
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol$1 = root.Symbol;

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
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

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

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

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

// A temporary value used to identify if the loop should be broken.
// See #1064, #1293
var breakLoop = {};

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

function once(fn) {
    return function () {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

var getIterator = function (coll) {
    return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
};

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

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

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
  return isObjectLike(value) && hasOwnProperty$2.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

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

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

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

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

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
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag$1 = '[object Function]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var objectTag = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
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

/** Detect free variable `exports`. */
var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports$1 && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

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

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

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
    if ((inherited || hasOwnProperty$1.call(value, key)) &&
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

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

  return value === proto;
}

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

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

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
    if (hasOwnProperty$3.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

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

function createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
        return ++i < len ? {value: coll[i], key: i} : null;
    }
}

function createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
        var item = iterator.next();
        if (item.done)
            return null;
        i++;
        return {value: item.value, key: i};
    }
}

function createObjectIterator(obj) {
    var okeys = keys(obj);
    var i = -1;
    var len = okeys.length;
    return function next() {
        var key = okeys[++i];
        return i < len ? {value: obj[key], key: key} : null;
    };
}

function iterator(coll) {
    if (isArrayLike(coll)) {
        return createArrayIterator(coll);
    }

    var iterator = getIterator(coll);
    return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
}

function onlyOnce(fn) {
    return function() {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, arguments);
    };
}

function _eachOfLimit(limit) {
    return function (obj, iteratee, callback) {
        callback = once(callback || noop);
        if (limit <= 0 || !obj) {
            return callback(null);
        }
        var nextElem = iterator(obj);
        var done = false;
        var running = 0;

        function iterateeCallback(err, value) {
            running -= 1;
            if (err) {
                done = true;
                callback(err);
            }
            else if (value === breakLoop || (done && running <= 0)) {
                done = true;
                return callback(null);
            }
            else {
                replenish();
            }
        }

        function replenish () {
            while (running < limit && !done) {
                var elem = nextElem();
                if (elem === null) {
                    done = true;
                    if (running <= 0) {
                        callback(null);
                    }
                    return;
                }
                running += 1;
                iteratee(elem.value, elem.key, onlyOnce(iterateeCallback));
            }
        }

        replenish();
    };
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name eachOfLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`. The `key` is the item's key, or index in the case of an
 * array.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachOfLimit(coll, limit, iteratee, callback) {
    _eachOfLimit(limit)(coll, wrapAsync(iteratee), callback);
}

function doLimit(fn, limit) {
    return function (iterable, iteratee, callback) {
        return fn(iterable, limit, iteratee, callback);
    };
}

// eachOf implementation optimized for array-likes
function eachOfArrayLike(coll, iteratee, callback) {
    callback = once(callback || noop);
    var index = 0,
        completed = 0,
        length = coll.length;
    if (length === 0) {
        callback(null);
    }

    function iteratorCallback(err, value) {
        if (err) {
            callback(err);
        } else if ((++completed === length) || value === breakLoop) {
            callback(null);
        }
    }

    for (; index < length; index++) {
        iteratee(coll[index], index, onlyOnce(iteratorCallback));
    }
}

// a generic version of eachOf which can handle array, object, and iterator cases.
var eachOfGeneric = doLimit(eachOfLimit, Infinity);

/**
 * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
 * to the iteratee.
 *
 * @name eachOf
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEachOf
 * @category Collection
 * @see [async.each]{@link module:Collections.each}
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each
 * item in `coll`.
 * The `key` is the item's key, or index in the case of an array.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
 * var configs = {};
 *
 * async.forEachOf(obj, function (value, key, callback) {
 *     fs.readFile(__dirname + value, "utf8", function (err, data) {
 *         if (err) return callback(err);
 *         try {
 *             configs[key] = JSON.parse(data);
 *         } catch (e) {
 *             return callback(e);
 *         }
 *         callback();
 *     });
 * }, function (err) {
 *     if (err) console.error(err.message);
 *     // configs is now a map of JSON data
 *     doSomethingWith(configs);
 * });
 */
var eachOf = function(coll, iteratee, callback) {
    var eachOfImplementation = isArrayLike(coll) ? eachOfArrayLike : eachOfGeneric;
    eachOfImplementation(coll, wrapAsync(iteratee), callback);
};

function doParallel(fn) {
    return function (obj, iteratee, callback) {
        return fn(eachOf, obj, wrapAsync(iteratee), callback);
    };
}

function _asyncMap(eachfn, arr, iteratee, callback) {
    callback = callback || noop;
    arr = arr || [];
    var results = [];
    var counter = 0;
    var _iteratee = wrapAsync(iteratee);

    eachfn(arr, function (value, _, callback) {
        var index = counter++;
        _iteratee(value, function (err, v) {
            results[index] = v;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Produces a new collection of values by mapping each value in `coll` through
 * the `iteratee` function. The `iteratee` is called with an item from `coll`
 * and a callback for when it has finished processing. Each of these callback
 * takes 2 arguments: an `error`, and the transformed item from `coll`. If
 * `iteratee` passes an error to its callback, the main `callback` (for the
 * `map` function) is immediately called with the error.
 *
 * Note, that since this function applies the `iteratee` to each item in
 * parallel, there is no guarantee that the `iteratee` functions will complete
 * in order. However, the results array will be in the same order as the
 * original `coll`.
 *
 * If `map` is passed an Object, the results will be an Array.  The results
 * will roughly be in the order of the original Objects' keys (but this can
 * vary across JavaScript engines).
 *
 * @name map
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an Array of the
 * transformed items from the `coll`. Invoked with (err, results).
 * @example
 *
 * async.map(['file1','file2','file3'], fs.stat, function(err, results) {
 *     // results is now an array of stats for each file
 * });
 */
var map = doParallel(_asyncMap);

/**
 * Applies the provided arguments to each function in the array, calling
 * `callback` after all functions have completed. If you only provide the first
 * argument, `fns`, then it will return a function which lets you pass in the
 * arguments as if it were a single function call. If more arguments are
 * provided, `callback` is required while `args` is still optional.
 *
 * @name applyEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s
 * to all call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument, `fns`, is provided, it will
 * return a function which lets you pass in the arguments as if it were a single
 * function call. The signature is `(..args, callback)`. If invoked with any
 * arguments, `callback` is required.
 * @example
 *
 * async.applyEach([enableSearch, updateSchema], 'bucket', callback);
 *
 * // partial application example:
 * async.each(
 *     buckets,
 *     async.applyEach([enableSearch, updateSchema]),
 *     callback
 * );
 */
var applyEach = applyEach$1(map);

function doParallelLimit(fn) {
    return function (obj, limit, iteratee, callback) {
        return fn(_eachOfLimit(limit), obj, wrapAsync(iteratee), callback);
    };
}

/**
 * The same as [`map`]{@link module:Collections.map} but runs a maximum of `limit` async operations at a time.
 *
 * @name mapLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapLimit = doParallelLimit(_asyncMap);

/**
 * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
 *
 * @name mapSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with the transformed item.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Results is an array of the
 * transformed items from the `coll`. Invoked with (err, results).
 */
var mapSeries = doLimit(mapLimit, 1);

/**
 * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
 *
 * @name applyEachSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.applyEach]{@link module:ControlFlow.applyEach}
 * @category Control Flow
 * @param {Array|Iterable|Object} fns - A collection of {@link AsyncFunction}s to all
 * call with the same arguments
 * @param {...*} [args] - any number of separate arguments to pass to the
 * function.
 * @param {Function} [callback] - the final argument should be the callback,
 * called when all functions have completed processing.
 * @returns {Function} - If only the first argument is provided, it will return
 * a function which lets you pass in the arguments as if it were a single
 * function call.
 */
var applyEachSeries = applyEach$1(mapSeries);

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

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? strictIndexOf(array, value, fromIndex)
    : baseFindIndex(array, baseIsNaN, fromIndex);
}

/**
 * Determines the best order for running the {@link AsyncFunction}s in `tasks`, based on
 * their requirements. Each function can optionally depend on other functions
 * being completed first, and each function is run as soon as its requirements
 * are satisfied.
 *
 * If any of the {@link AsyncFunction}s pass an error to their callback, the `auto` sequence
 * will stop. Further tasks will not execute (so any other functions depending
 * on it will not run), and the main `callback` is immediately called with the
 * error.
 *
 * {@link AsyncFunction}s also receive an object containing the results of functions which
 * have completed so far as the first argument, if they have dependencies. If a
 * task function has no dependencies, it will only be passed a callback.
 *
 * @name auto
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Object} tasks - An object. Each of its properties is either a
 * function or an array of requirements, with the {@link AsyncFunction} itself the last item
 * in the array. The object's key of a property serves as the name of the task
 * defined by that property, i.e. can be used when specifying requirements for
 * other tasks. The function receives one or two arguments:
 * * a `results` object, containing the results of the previously executed
 *   functions, only passed if the task has any dependencies,
 * * a `callback(err, result)` function, which must be called when finished,
 *   passing an `error` (which can be `null`) and the result of the function's
 *   execution.
 * @param {number} [concurrency=Infinity] - An optional `integer` for
 * determining the maximum number of tasks that can be run in parallel. By
 * default, as many as possible.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback. Results are always returned; however, if an
 * error occurs, no further `tasks` will be performed, and the results object
 * will only contain partial results. Invoked with (err, results).
 * @returns undefined
 * @example
 *
 * async.auto({
 *     // this function will just be passed a callback
 *     readData: async.apply(fs.readFile, 'data.txt', 'utf-8'),
 *     showData: ['readData', function(results, cb) {
 *         // results.readData is the file's contents
 *         // ...
 *     }]
 * }, callback);
 *
 * async.auto({
 *     get_data: function(callback) {
 *         console.log('in get_data');
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         console.log('in make_folder');
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: ['get_data', 'make_folder', function(results, callback) {
 *         console.log('in write_file', JSON.stringify(results));
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(results, callback) {
 *         console.log('in email_link', JSON.stringify(results));
 *         // once the file is written let's email a link to it...
 *         // results.write_file contains the filename returned by write_file.
 *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
 *     }]
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('results = ', results);
 * });
 */
var auto = function (tasks, concurrency, callback) {
    if (typeof concurrency === 'function') {
        // concurrency is optional, shift the args.
        callback = concurrency;
        concurrency = null;
    }
    callback = once(callback || noop);
    var keys$$1 = keys(tasks);
    var numTasks = keys$$1.length;
    if (!numTasks) {
        return callback(null);
    }
    if (!concurrency) {
        concurrency = numTasks;
    }

    var results = {};
    var runningTasks = 0;
    var hasError = false;

    var listeners = Object.create(null);

    var readyTasks = [];

    // for cycle detection:
    var readyToCheck = []; // tasks that have been identified as reachable
    // without the possibility of returning to an ancestor task
    var uncheckedDependencies = {};

    baseForOwn(tasks, function (task, key) {
        if (!isArray(task)) {
            // no dependencies
            enqueueTask(key, [task]);
            readyToCheck.push(key);
            return;
        }

        var dependencies = task.slice(0, task.length - 1);
        var remainingDependencies = dependencies.length;
        if (remainingDependencies === 0) {
            enqueueTask(key, task);
            readyToCheck.push(key);
            return;
        }
        uncheckedDependencies[key] = remainingDependencies;

        arrayEach(dependencies, function (dependencyName) {
            if (!tasks[dependencyName]) {
                throw new Error('async.auto task `' + key +
                    '` has a non-existent dependency `' +
                    dependencyName + '` in ' +
                    dependencies.join(', '));
            }
            addListener(dependencyName, function () {
                remainingDependencies--;
                if (remainingDependencies === 0) {
                    enqueueTask(key, task);
                }
            });
        });
    });

    checkForDeadlocks();
    processQueue();

    function enqueueTask(key, task) {
        readyTasks.push(function () {
            runTask(key, task);
        });
    }

    function processQueue() {
        if (readyTasks.length === 0 && runningTasks === 0) {
            return callback(null, results);
        }
        while(readyTasks.length && runningTasks < concurrency) {
            var run = readyTasks.shift();
            run();
        }

    }

    function addListener(taskName, fn) {
        var taskListeners = listeners[taskName];
        if (!taskListeners) {
            taskListeners = listeners[taskName] = [];
        }

        taskListeners.push(fn);
    }

    function taskComplete(taskName) {
        var taskListeners = listeners[taskName] || [];
        arrayEach(taskListeners, function (fn) {
            fn();
        });
        processQueue();
    }


    function runTask(key, task) {
        if (hasError) return;

        var taskCallback = onlyOnce(function(err, result) {
            runningTasks--;
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            if (err) {
                var safeResults = {};
                baseForOwn(results, function(val, rkey) {
                    safeResults[rkey] = val;
                });
                safeResults[key] = result;
                hasError = true;
                listeners = Object.create(null);

                callback(err, safeResults);
            } else {
                results[key] = result;
                taskComplete(key);
            }
        });

        runningTasks++;
        var taskFn = wrapAsync(task[task.length - 1]);
        if (task.length > 1) {
            taskFn(results, taskCallback);
        } else {
            taskFn(taskCallback);
        }
    }

    function checkForDeadlocks() {
        // Kahn's algorithm
        // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
        // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
        var currentTask;
        var counter = 0;
        while (readyToCheck.length) {
            currentTask = readyToCheck.pop();
            counter++;
            arrayEach(getDependents(currentTask), function (dependent) {
                if (--uncheckedDependencies[dependent] === 0) {
                    readyToCheck.push(dependent);
                }
            });
        }

        if (counter !== numTasks) {
            throw new Error(
                'async.auto cannot execute tasks due to a recursive dependency'
            );
        }
    }

    function getDependents(taskName) {
        var result = [];
        baseForOwn(tasks, function (task, key) {
            if (isArray(task) && baseIndexOf(task, taskName, 0) >= 0) {
                result.push(key);
            }
        });
        return result;
    }
};

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
var symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/**
 * Casts `array` to a slice if it's needed.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {number} start The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the cast slice.
 */
function castSlice(array, start, end) {
  var length = array.length;
  end = end === undefined ? length : end;
  return (!start && end >= length) ? array : baseSlice(array, start, end);
}

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the last unmatched string symbol.
 */
function charsEndIndex(strSymbols, chrSymbols) {
  var index = strSymbols.length;

  while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
 * that is not found in the character symbols.
 *
 * @private
 * @param {Array} strSymbols The string symbols to inspect.
 * @param {Array} chrSymbols The character symbols to find.
 * @returns {number} Returns the index of the first unmatched string symbol.
 */
function charsStartIndex(strSymbols, chrSymbols) {
  var index = -1,
      length = strSymbols.length;

  while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
  return index;
}

/**
 * Converts an ASCII `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function asciiToArray(string) {
  return string.split('');
}

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff';
var rsComboMarksRange = '\\u0300-\\u036f';
var reComboHalfMarksRange = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange = '\\u20d0-\\u20ff';
var rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange;
var rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

/** Used to compose unicode character classes. */
var rsAstralRange$1 = '\\ud800-\\udfff';
var rsComboMarksRange$1 = '\\u0300-\\u036f';
var reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f';
var rsComboSymbolsRange$1 = '\\u20d0-\\u20ff';
var rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1;
var rsVarRange$1 = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange$1 + ']';
var rsCombo = '[' + rsComboRange$1 + ']';
var rsFitz = '\\ud83c[\\udffb-\\udfff]';
var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
var rsNonAstral = '[^' + rsAstralRange$1 + ']';
var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
var rsZWJ$1 = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?';
var rsOptVar = '[' + rsVarRange$1 + ']?';
var rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
var rsSeq = rsOptVar + reOptMod + rsOptJoin;
var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Converts a Unicode `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function unicodeToArray(string) {
  return string.match(reUnicode) || [];
}

/**
 * Converts `string` to an array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the converted array.
 */
function stringToArray(string) {
  return hasUnicode(string)
    ? unicodeToArray(string)
    : asciiToArray(string);
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/**
 * Removes leading and trailing whitespace or specified characters from `string`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to trim.
 * @param {string} [chars=whitespace] The characters to trim.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
 * @returns {string} Returns the trimmed string.
 * @example
 *
 * _.trim('  abc  ');
 * // => 'abc'
 *
 * _.trim('-_-abc-_-', '_-');
 * // => 'abc'
 *
 * _.map(['  foo  ', '  bar  '], _.trim);
 * // => ['foo', 'bar']
 */
function trim(string, chars, guard) {
  string = toString(string);
  if (string && (guard || chars === undefined)) {
    return string.replace(reTrim, '');
  }
  if (!string || !(chars = baseToString(chars))) {
    return string;
  }
  var strSymbols = stringToArray(string),
      chrSymbols = stringToArray(chars),
      start = charsStartIndex(strSymbols, chrSymbols),
      end = charsEndIndex(strSymbols, chrSymbols) + 1;

  return castSlice(strSymbols, start, end).join('');
}

var FN_ARGS = /^(?:async\s+)?(function)?\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /(=.+)?(\s*)$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

function parseParams(func) {
    func = func.toString().replace(STRIP_COMMENTS, '');
    func = func.match(FN_ARGS)[2].replace(' ', '');
    func = func ? func.split(FN_ARG_SPLIT) : [];
    func = func.map(function (arg){
        return trim(arg.replace(FN_ARG, ''));
    });
    return func;
}

/**
 * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto} function. Dependent
 * tasks are specified as parameters to the function, after the usual callback
 * parameter, with the parameter names matching the names of the tasks it
 * depends on. This can provide even more readable task graphs which can be
 * easier to maintain.
 *
 * If a final callback is specified, the task results are similarly injected,
 * specified as named parameters after the initial error parameter.
 *
 * The autoInject function is purely syntactic sugar and its semantics are
 * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
 *
 * @name autoInject
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.auto]{@link module:ControlFlow.auto}
 * @category Control Flow
 * @param {Object} tasks - An object, each of whose properties is an {@link AsyncFunction} of
 * the form 'func([dependencies...], callback). The object's key of a property
 * serves as the name of the task defined by that property, i.e. can be used
 * when specifying requirements for other tasks.
 * * The `callback` parameter is a `callback(err, result)` which must be called
 *   when finished, passing an `error` (which can be `null`) and the result of
 *   the function's execution. The remaining parameters name other tasks on
 *   which the task is dependent, and the results from those tasks are the
 *   arguments of those parameters.
 * @param {Function} [callback] - An optional callback which is called when all
 * the tasks have been completed. It receives the `err` argument if any `tasks`
 * pass an error to their callback, and a `results` object with any completed
 * task results, similar to `auto`.
 * @example
 *
 * //  The example from `auto` can be rewritten as follows:
 * async.autoInject({
 *     get_data: function(callback) {
 *         // async code to get some data
 *         callback(null, 'data', 'converted to array');
 *     },
 *     make_folder: function(callback) {
 *         // async code to create a directory to store a file in
 *         // this is run at the same time as getting the data
 *         callback(null, 'folder');
 *     },
 *     write_file: function(get_data, make_folder, callback) {
 *         // once there is some data and the directory exists,
 *         // write the data to a file in the directory
 *         callback(null, 'filename');
 *     },
 *     email_link: function(write_file, callback) {
 *         // once the file is written let's email a link to it...
 *         // write_file contains the filename returned by write_file.
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 *
 * // If you are using a JS minifier that mangles parameter names, `autoInject`
 * // will not work with plain functions, since the parameter names will be
 * // collapsed to a single letter identifier.  To work around this, you can
 * // explicitly specify the names of the parameters your task function needs
 * // in an array, similar to Angular.js dependency injection.
 *
 * // This still has an advantage over plain `auto`, since the results a task
 * // depends on are still spread into arguments.
 * async.autoInject({
 *     //...
 *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
 *         callback(null, 'filename');
 *     }],
 *     email_link: ['write_file', function(write_file, callback) {
 *         callback(null, {'file':write_file, 'email':'user@example.com'});
 *     }]
 *     //...
 * }, function(err, results) {
 *     console.log('err = ', err);
 *     console.log('email_link = ', results.email_link);
 * });
 */
function autoInject(tasks, callback) {
    var newTasks = {};

    baseForOwn(tasks, function (taskFn, key) {
        var params;
        var fnIsAsync = isAsync(taskFn);
        var hasNoDeps =
            (!fnIsAsync && taskFn.length === 1) ||
            (fnIsAsync && taskFn.length === 0);

        if (isArray(taskFn)) {
            params = taskFn.slice(0, -1);
            taskFn = taskFn[taskFn.length - 1];

            newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
        } else if (hasNoDeps) {
            // no dependencies, use the function as-is
            newTasks[key] = taskFn;
        } else {
            params = parseParams(taskFn);
            if (taskFn.length === 0 && !fnIsAsync && params.length === 0) {
                throw new Error("autoInject task functions require explicit parameters.");
            }

            // remove callback param
            if (!fnIsAsync) params.pop();

            newTasks[key] = params.concat(newTask);
        }

        function newTask(results, taskCb) {
            var newArgs = arrayMap(params, function (name) {
                return results[name];
            });
            newArgs.push(taskCb);
            wrapAsync(taskFn).apply(null, newArgs);
        }
    });

    auto(newTasks, callback);
}

// Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
// used for queues. This implementation assumes that the node provided by the user can be modified
// to adjust the next and last properties. We implement only the minimal functionality
// for queue support.
function DLL() {
    this.head = this.tail = null;
    this.length = 0;
}

function setInitial(dll, node) {
    dll.length = 1;
    dll.head = dll.tail = node;
}

DLL.prototype.removeLink = function(node) {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;

    node.prev = node.next = null;
    this.length -= 1;
    return node;
};

DLL.prototype.empty = function () {
    while(this.head) this.shift();
    return this;
};

DLL.prototype.insertAfter = function(node, newNode) {
    newNode.prev = node;
    newNode.next = node.next;
    if (node.next) node.next.prev = newNode;
    else this.tail = newNode;
    node.next = newNode;
    this.length += 1;
};

DLL.prototype.insertBefore = function(node, newNode) {
    newNode.prev = node.prev;
    newNode.next = node;
    if (node.prev) node.prev.next = newNode;
    else this.head = newNode;
    node.prev = newNode;
    this.length += 1;
};

DLL.prototype.unshift = function(node) {
    if (this.head) this.insertBefore(this.head, node);
    else setInitial(this, node);
};

DLL.prototype.push = function(node) {
    if (this.tail) this.insertAfter(this.tail, node);
    else setInitial(this, node);
};

DLL.prototype.shift = function() {
    return this.head && this.removeLink(this.head);
};

DLL.prototype.pop = function() {
    return this.tail && this.removeLink(this.tail);
};

DLL.prototype.toArray = function () {
    var arr = Array(this.length);
    var curr = this.head;
    for(var idx = 0; idx < this.length; idx++) {
        arr[idx] = curr.data;
        curr = curr.next;
    }
    return arr;
};

DLL.prototype.remove = function (testFn) {
    var curr = this.head;
    while(!!curr) {
        var next = curr.next;
        if (testFn(curr)) {
            this.removeLink(curr);
        }
        curr = next;
    }
    return this;
};

function queue(worker, concurrency, payload) {
    if (concurrency == null) {
        concurrency = 1;
    }
    else if(concurrency === 0) {
        throw new Error('Concurrency must not be zero');
    }

    var _worker = wrapAsync(worker);
    var numRunning = 0;
    var workersList = [];

    var processingScheduled = false;
    function _insert(data, insertAtFront, callback) {
        if (callback != null && typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0 && q.idle()) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function() {
                q.drain();
            });
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                callback: callback || noop
            };

            if (insertAtFront) {
                q._tasks.unshift(item);
            } else {
                q._tasks.push(item);
            }
        }

        if (!processingScheduled) {
            processingScheduled = true;
            setImmediate$1(function() {
                processingScheduled = false;
                q.process();
            });
        }
    }

    function _next(tasks) {
        return function(err){
            numRunning -= 1;

            for (var i = 0, l = tasks.length; i < l; i++) {
                var task = tasks[i];

                var index = baseIndexOf(workersList, task, 0);
                if (index === 0) {
                    workersList.shift();
                } else if (index > 0) {
                    workersList.splice(index, 1);
                }

                task.callback.apply(task, arguments);

                if (err != null) {
                    q.error(err, task.data);
                }
            }

            if (numRunning <= (q.concurrency - q.buffer) ) {
                q.unsaturated();
            }

            if (q.idle()) {
                q.drain();
            }
            q.process();
        };
    }

    var isProcessing = false;
    var q = {
        _tasks: new DLL(),
        concurrency: concurrency,
        payload: payload,
        saturated: noop,
        unsaturated:noop,
        buffer: concurrency / 4,
        empty: noop,
        drain: noop,
        error: noop,
        started: false,
        paused: false,
        push: function (data, callback) {
            _insert(data, false, callback);
        },
        kill: function () {
            q.drain = noop;
            q._tasks.empty();
        },
        unshift: function (data, callback) {
            _insert(data, true, callback);
        },
        remove: function (testFn) {
            q._tasks.remove(testFn);
        },
        process: function () {
            // Avoid trying to start too many processing operations. This can occur
            // when callbacks resolve synchronously (#1267).
            if (isProcessing) {
                return;
            }
            isProcessing = true;
            while(!q.paused && numRunning < q.concurrency && q._tasks.length){
                var tasks = [], data = [];
                var l = q._tasks.length;
                if (q.payload) l = Math.min(l, q.payload);
                for (var i = 0; i < l; i++) {
                    var node = q._tasks.shift();
                    tasks.push(node);
                    workersList.push(node);
                    data.push(node.data);
                }

                numRunning += 1;

                if (q._tasks.length === 0) {
                    q.empty();
                }

                if (numRunning === q.concurrency) {
                    q.saturated();
                }

                var cb = onlyOnce(_next(tasks));
                _worker(data, cb);
            }
            isProcessing = false;
        },
        length: function () {
            return q._tasks.length;
        },
        running: function () {
            return numRunning;
        },
        workersList: function () {
            return workersList;
        },
        idle: function() {
            return q._tasks.length + numRunning === 0;
        },
        pause: function () {
            q.paused = true;
        },
        resume: function () {
            if (q.paused === false) { return; }
            q.paused = false;
            setImmediate$1(q.process);
        }
    };
    return q;
}

/**
 * A cargo of tasks for the worker function to complete. Cargo inherits all of
 * the same methods and event callbacks as [`queue`]{@link module:ControlFlow.queue}.
 * @typedef {Object} CargoObject
 * @memberOf module:ControlFlow
 * @property {Function} length - A function returning the number of items
 * waiting to be processed. Invoke like `cargo.length()`.
 * @property {number} payload - An `integer` for determining how many tasks
 * should be process per round. This property can be changed after a `cargo` is
 * created to alter the payload on-the-fly.
 * @property {Function} push - Adds `task` to the `queue`. The callback is
 * called once the `worker` has finished processing the task. Instead of a
 * single task, an array of `tasks` can be submitted. The respective callback is
 * used for every task in the list. Invoke like `cargo.push(task, [callback])`.
 * @property {Function} saturated - A callback that is called when the
 * `queue.length()` hits the concurrency and further tasks will be queued.
 * @property {Function} empty - A callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - A callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke like `cargo.idle()`.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke like `cargo.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke like `cargo.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. Invoke like `cargo.kill()`.
 */

/**
 * Creates a `cargo` object with the specified payload. Tasks added to the
 * cargo will be processed altogether (up to the `payload` limit). If the
 * `worker` is in progress, the task is queued until it becomes available. Once
 * the `worker` has completed some tasks, each callback of those tasks is
 * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
 * for how `cargo` and `queue` work.
 *
 * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
 * at a time, cargo passes an array of tasks to a single worker, repeating
 * when the worker is finished.
 *
 * @name cargo
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {AsyncFunction} worker - An asynchronous function for processing an array
 * of queued tasks. Invoked with `(tasks, callback)`.
 * @param {number} [payload=Infinity] - An optional `integer` for determining
 * how many tasks should be processed per round; if omitted, the default is
 * unlimited.
 * @returns {module:ControlFlow.CargoObject} A cargo object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the cargo and inner queue.
 * @example
 *
 * // create a cargo object with payload 2
 * var cargo = async.cargo(function(tasks, callback) {
 *     for (var i=0; i<tasks.length; i++) {
 *         console.log('hello ' + tasks[i].name);
 *     }
 *     callback();
 * }, 2);
 *
 * // add some items
 * cargo.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * cargo.push({name: 'bar'}, function(err) {
 *     console.log('finished processing bar');
 * });
 * cargo.push({name: 'baz'}, function(err) {
 *     console.log('finished processing baz');
 * });
 */
function cargo(worker, payload) {
    return queue(worker, 1, payload);
}

/**
 * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
 *
 * @name eachOfSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.eachOf]{@link module:Collections.eachOf}
 * @alias forEachOfSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * Invoked with (item, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Invoked with (err).
 */
var eachOfSeries = doLimit(eachOfLimit, 1);

/**
 * Reduces `coll` into a single value using an async `iteratee` to return each
 * successive step. `memo` is the initial state of the reduction. This function
 * only operates in series.
 *
 * For performance reasons, it may make sense to split a call to this function
 * into a parallel map, and then use the normal `Array.prototype.reduce` on the
 * results. This function is for situations where each step in the reduction
 * needs to be async; if you can get the data before reducing it, then it's
 * probably a good idea to do so.
 *
 * @name reduce
 * @static
 * @memberOf module:Collections
 * @method
 * @alias inject
 * @alias foldl
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 * @example
 *
 * async.reduce([1,2,3], 0, function(memo, item, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         callback(null, memo + item)
 *     });
 * }, function(err, result) {
 *     // result is now equal to the last value of memo, which is 6
 * });
 */
function reduce(coll, memo, iteratee, callback) {
    callback = once(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    eachOfSeries(coll, function(x, i, callback) {
        _iteratee(memo, x, function(err, v) {
            memo = v;
            callback(err);
        });
    }, function(err) {
        callback(err, memo);
    });
}

/**
 * Version of the compose function that is more natural to read. Each function
 * consumes the return value of the previous function. It is the equivalent of
 * [compose]{@link module:ControlFlow.compose} with the arguments reversed.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name seq
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.compose]{@link module:ControlFlow.compose}
 * @category Control Flow
 * @param {...AsyncFunction} functions - the asynchronous functions to compose
 * @returns {Function} a function that composes the `functions` in order
 * @example
 *
 * // Requires lodash (or underscore), express3 and dresende's orm2.
 * // Part of an app, that fetches cats of the logged user.
 * // This example uses `seq` function to avoid overnesting and error
 * // handling clutter.
 * app.get('/cats', function(request, response) {
 *     var User = request.models.User;
 *     async.seq(
 *         _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))
 *         function(user, fn) {
 *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
 *         }
 *     )(req.session.user_id, function (err, cats) {
 *         if (err) {
 *             console.error(err);
 *             response.json({ status: 'error', message: err.message });
 *         } else {
 *             response.json({ status: 'ok', message: 'Cats found', data: cats });
 *         }
 *     });
 * });
 */
function seq(/*...functions*/) {
    var _functions = arrayMap(arguments, wrapAsync);
    return function(/*...args*/) {
        var args = slice(arguments);
        var that = this;

        var cb = args[args.length - 1];
        if (typeof cb == 'function') {
            args.pop();
        } else {
            cb = noop;
        }

        reduce(_functions, args, function(newargs, fn, cb) {
            fn.apply(that, newargs.concat(function(err/*, ...nextargs*/) {
                var nextargs = slice(arguments, 1);
                cb(err, nextargs);
            }));
        },
        function(err, results) {
            cb.apply(that, [err].concat(results));
        });
    };
}

/**
 * Creates a function which is a composition of the passed asynchronous
 * functions. Each function consumes the return value of the function that
 * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
 * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
 *
 * Each function is executed with the `this` binding of the composed function.
 *
 * @name compose
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {...AsyncFunction} functions - the asynchronous functions to compose
 * @returns {Function} an asynchronous function that is the composed
 * asynchronous `functions`
 * @example
 *
 * function add1(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n + 1);
 *     }, 10);
 * }
 *
 * function mul3(n, callback) {
 *     setTimeout(function () {
 *         callback(null, n * 3);
 *     }, 10);
 * }
 *
 * var add1mul3 = async.compose(mul3, add1);
 * add1mul3(4, function (err, result) {
 *     // result now equals 15
 * });
 */
var compose = function(/*...args*/) {
    return seq.apply(null, slice(arguments).reverse());
};

var _concat = Array.prototype.concat;

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs a maximum of `limit` async operations at a time.
 *
 * @name concatLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatLimit = function(coll, limit, iteratee, callback) {
    callback = callback || noop;
    var _iteratee = wrapAsync(iteratee);
    mapLimit(coll, limit, function(val, callback) {
        _iteratee(val, function(err /*, ...args*/) {
            if (err) return callback(err);
            return callback(null, slice(arguments, 1));
        });
    }, function(err, mapResults) {
        var result = [];
        for (var i = 0; i < mapResults.length; i++) {
            if (mapResults[i]) {
                result = _concat.apply(result, mapResults[i]);
            }
        }

        return callback(err, result);
    });
};

/**
 * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
 * the concatenated list. The `iteratee`s are called in parallel, and the
 * results are concatenated as they return. There is no guarantee that the
 * results array will be returned in the original order of `coll` passed to the
 * `iteratee` function.
 *
 * @name concat
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
 * which should use an array as its result. Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 * @example
 *
 * async.concat(['dir1','dir2','dir3'], fs.readdir, function(err, files) {
 *     // files is now a list of filenames that exist in the 3 directories
 * });
 */
var concat = doLimit(concatLimit, Infinity);

/**
 * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
 *
 * @name concatSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.concat]{@link module:Collections.concat}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`.
 * The iteratee should complete with an array an array of results.
 * Invoked with (item, callback).
 * @param {Function} [callback(err)] - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is an array
 * containing the concatenated results of the `iteratee` function. Invoked with
 * (err, results).
 */
var concatSeries = doLimit(concatLimit, 1);

/**
 * Returns a function that when called, calls-back with the values provided.
 * Useful as the first function in a [`waterfall`]{@link module:ControlFlow.waterfall}, or for plugging values in to
 * [`auto`]{@link module:ControlFlow.auto}.
 *
 * @name constant
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {...*} arguments... - Any number of arguments to automatically invoke
 * callback with.
 * @returns {AsyncFunction} Returns a function that when invoked, automatically
 * invokes the callback with the previous given arguments.
 * @example
 *
 * async.waterfall([
 *     async.constant(42),
 *     function (value, next) {
 *         // value === 42
 *     },
 *     //...
 * ], callback);
 *
 * async.waterfall([
 *     async.constant(filename, "utf8"),
 *     fs.readFile,
 *     function (fileData, next) {
 *         //...
 *     }
 *     //...
 * ], callback);
 *
 * async.auto({
 *     hostname: async.constant("https://server.net/"),
 *     port: findFreePort,
 *     launchServer: ["hostname", "port", function (options, cb) {
 *         startServer(options, cb);
 *     }],
 *     //...
 * }, callback);
 */
var constant = function(/*...values*/) {
    var values = slice(arguments);
    var args = [null].concat(values);
    return function (/*...ignoredArgs, callback*/) {
        var callback = arguments[arguments.length - 1];
        return callback.apply(this, args);
    };
};

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

function _createTester(check, getResult) {
    return function(eachfn, arr, iteratee, cb) {
        cb = cb || noop;
        var testPassed = false;
        var testResult;
        eachfn(arr, function(value, _, callback) {
            iteratee(value, function(err, result) {
                if (err) {
                    callback(err);
                } else if (check(result) && !testResult) {
                    testPassed = true;
                    testResult = getResult(true, value);
                    callback(null, breakLoop);
                } else {
                    callback();
                }
            });
        }, function(err) {
            if (err) {
                cb(err);
            } else {
                cb(null, testPassed ? testResult : getResult(false));
            }
        });
    };
}

function _findGetResult(v, x) {
    return x;
}

/**
 * Returns the first value in `coll` that passes an async truth test. The
 * `iteratee` is applied in parallel, meaning the first iteratee to return
 * `true` will fire the detect `callback` with that result. That means the
 * result might not be the first item in the original `coll` (in terms of order)
 * that passes the test.

 * If order within the original `coll` is important, then look at
 * [`detectSeries`]{@link module:Collections.detectSeries}.
 *
 * @name detect
 * @static
 * @memberOf module:Collections
 * @method
 * @alias find
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 * @example
 *
 * async.detect(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // result now equals the first file in the list that exists
 * });
 */
var detect = doParallel(_createTester(identity, _findGetResult));

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name detectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findLimit
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectLimit = doParallelLimit(_createTester(identity, _findGetResult));

/**
 * The same as [`detect`]{@link module:Collections.detect} but runs only a single async operation at a time.
 *
 * @name detectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.detect]{@link module:Collections.detect}
 * @alias findSeries
 * @category Collections
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 */
var detectSeries = doLimit(detectLimit, 1);

function consoleFunc(name) {
    return function (fn/*, ...args*/) {
        var args = slice(arguments, 1);
        args.push(function (err/*, ...args*/) {
            var args = slice(arguments, 1);
            if (typeof console === 'object') {
                if (err) {
                    if (console.error) {
                        console.error(err);
                    }
                } else if (console[name]) {
                    arrayEach(args, function (x) {
                        console[name](x);
                    });
                }
            }
        });
        wrapAsync(fn).apply(null, args);
    };
}

/**
 * Logs the result of an [`async` function]{@link AsyncFunction} to the
 * `console` using `console.dir` to display the properties of the resulting object.
 * Only works in Node.js or in browsers that support `console.dir` and
 * `console.error` (such as FF and Chrome).
 * If multiple arguments are returned from the async function,
 * `console.dir` is called on each argument in order.
 *
 * @name dir
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} function - The function you want to eventually apply
 * all arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, {hello: name});
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.dir(hello, 'world');
 * {hello: 'world'}
 */
var dir = consoleFunc('dir');

/**
 * The post-check version of [`during`]{@link module:ControlFlow.during}. To reflect the difference in
 * the order of operations, the arguments `test` and `fn` are switched.
 *
 * Also a version of [`doWhilst`]{@link module:ControlFlow.doWhilst} with asynchronous `test` function.
 * @name doDuring
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.during]{@link module:ControlFlow.during}
 * @category Control Flow
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (...args, callback), where `...args` are the
 * non-error args from the previous callback of `fn`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error if one occurred, otherwise `null`.
 */
function doDuring(fn, test, callback) {
    callback = onlyOnce(callback || noop);
    var _fn = wrapAsync(fn);
    var _test = wrapAsync(test);

    function next(err/*, ...args*/) {
        if (err) return callback(err);
        var args = slice(arguments, 1);
        args.push(check);
        _test.apply(this, args);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        _fn(next);
    }

    check(null, true);

}

/**
 * The post-check version of [`whilst`]{@link module:ControlFlow.whilst}. To reflect the difference in
 * the order of operations, the arguments `test` and `iteratee` are switched.
 *
 * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
 *
 * @name doWhilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - A function which is called each time `test`
 * passes. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with any non-error callback results of
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped.
 * `callback` will be passed an error and any arguments passed to the final
 * `iteratee`'s callback. Invoked with (err, [results]);
 */
function doWhilst(iteratee, test, callback) {
    callback = onlyOnce(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    var next = function(err/*, ...args*/) {
        if (err) return callback(err);
        var args = slice(arguments, 1);
        if (test.apply(this, args)) return _iteratee(next);
        callback.apply(null, [null].concat(args));
    };
    _iteratee(next);
}

/**
 * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
 * argument ordering differs from `until`.
 *
 * @name doUntil
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
 * @category Control Flow
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {Function} test - synchronous truth test to perform after each
 * execution of `iteratee`. Invoked with any non-error callback results of
 * `iteratee`.
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 */
function doUntil(iteratee, test, callback) {
    doWhilst(iteratee, function() {
        return !test.apply(this, arguments);
    }, callback);
}

/**
 * Like [`whilst`]{@link module:ControlFlow.whilst}, except the `test` is an asynchronous function that
 * is passed a callback in the form of `function (err, truth)`. If error is
 * passed to `test` or `fn`, the main callback is immediately called with the
 * value of the error.
 *
 * @name during
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {AsyncFunction} test - asynchronous truth test to perform before each
 * execution of `fn`. Invoked with (callback).
 * @param {AsyncFunction} fn - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `fn` has stopped. `callback`
 * will be passed an error, if one occurred, otherwise `null`.
 * @example
 *
 * var count = 0;
 *
 * async.during(
 *     function (callback) {
 *         return callback(null, count < 5);
 *     },
 *     function (callback) {
 *         count++;
 *         setTimeout(callback, 1000);
 *     },
 *     function (err) {
 *         // 5 seconds have passed
 *     }
 * );
 */
function during(test, fn, callback) {
    callback = onlyOnce(callback || noop);
    var _fn = wrapAsync(fn);
    var _test = wrapAsync(test);

    function next(err) {
        if (err) return callback(err);
        _test(check);
    }

    function check(err, truth) {
        if (err) return callback(err);
        if (!truth) return callback(null);
        _fn(next);
    }

    _test(check);
}

function _withoutIndex(iteratee) {
    return function (value, index, callback) {
        return iteratee(value, callback);
    };
}

/**
 * Applies the function `iteratee` to each item in `coll`, in parallel.
 * The `iteratee` is called with an item from the list, and a callback for when
 * it has finished. If the `iteratee` passes an error to its `callback`, the
 * main `callback` (for the `each` function) is immediately called with the
 * error.
 *
 * Note, that since this function applies `iteratee` to each item in parallel,
 * there is no guarantee that the iteratee functions will complete in order.
 *
 * @name each
 * @static
 * @memberOf module:Collections
 * @method
 * @alias forEach
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to
 * each item in `coll`. Invoked with (item, callback).
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOf`.
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @example
 *
 * // assuming openFiles is an array of file names and saveFile is a function
 * // to save the modified contents of that file:
 *
 * async.each(openFiles, saveFile, function(err){
 *   // if any of the saves produced an error, err would equal that error
 * });
 *
 * // assuming openFiles is an array of file names
 * async.each(openFiles, function(file, callback) {
 *
 *     // Perform operation on file here.
 *     console.log('Processing file ' + file);
 *
 *     if( file.length > 32 ) {
 *       console.log('This file name is too long');
 *       callback('File name too long');
 *     } else {
 *       // Do work to process file here
 *       console.log('File processed');
 *       callback();
 *     }
 * }, function(err) {
 *     // if any of the file processing produced an error, err would equal that error
 *     if( err ) {
 *       // One of the iterations produced an error.
 *       // All processing will now stop.
 *       console.log('A file failed to process');
 *     } else {
 *       console.log('All files have been processed successfully');
 *     }
 * });
 */
function eachLimit(coll, iteratee, callback) {
    eachOf(coll, _withoutIndex(wrapAsync(iteratee)), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
 *
 * @name eachLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfLimit`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
function eachLimit$1(coll, limit, iteratee, callback) {
    _eachOfLimit(limit)(coll, _withoutIndex(wrapAsync(iteratee)), callback);
}

/**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfSeries`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 */
var eachSeries = doLimit(eachLimit$1, 1);

/**
 * Wrap an async function and ensure it calls its callback on a later tick of
 * the event loop.  If the function already calls its callback on a next tick,
 * no extra deferral is added. This is useful for preventing stack overflows
 * (`RangeError: Maximum call stack size exceeded`) and generally keeping
 * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
 * contained. ES2017 `async` functions are returned as-is -- they are immune
 * to Zalgo's corrupting influences, as they always resolve on a later tick.
 *
 * @name ensureAsync
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - an async function, one that expects a node-style
 * callback as its last argument.
 * @returns {AsyncFunction} Returns a wrapped function with the exact same call
 * signature as the function passed in.
 * @example
 *
 * function sometimesAsync(arg, callback) {
 *     if (cache[arg]) {
 *         return callback(null, cache[arg]); // this would be synchronous!!
 *     } else {
 *         doSomeIO(arg, callback); // this IO would be asynchronous
 *     }
 * }
 *
 * // this has a risk of stack overflows if many results are cached in a row
 * async.mapSeries(args, sometimesAsync, done);
 *
 * // this will defer sometimesAsync's callback if necessary,
 * // preventing stack overflows
 * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
 */
function ensureAsync(fn) {
    if (isAsync(fn)) return fn;
    return initialParams(function (args, callback) {
        var sync = true;
        args.push(function () {
            var innerArgs = arguments;
            if (sync) {
                setImmediate$1(function () {
                    callback.apply(null, innerArgs);
                });
            } else {
                callback.apply(null, innerArgs);
            }
        });
        fn.apply(this, args);
        sync = false;
    });
}

function notId(v) {
    return !v;
}

/**
 * Returns `true` if every element in `coll` satisfies an async test. If any
 * iteratee call returns `false`, the main `callback` is immediately called.
 *
 * @name every
 * @static
 * @memberOf module:Collections
 * @method
 * @alias all
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 * @example
 *
 * async.every(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then every file exists
 * });
 */
var every = doParallel(_createTester(notId, notId));

/**
 * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
 *
 * @name everyLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in parallel.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everyLimit = doParallelLimit(_createTester(notId, notId));

/**
 * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
 *
 * @name everySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.every]{@link module:Collections.every}
 * @alias allSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collection in series.
 * The iteratee must complete with a boolean result value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result will be either `true` or `false`
 * depending on the values of the async tests. Invoked with (err, result).
 */
var everySeries = doLimit(everyLimit, 1);

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

function filterArray(eachfn, arr, iteratee, callback) {
    var truthValues = new Array(arr.length);
    eachfn(arr, function (x, index, callback) {
        iteratee(x, function (err, v) {
            truthValues[index] = !!v;
            callback(err);
        });
    }, function (err) {
        if (err) return callback(err);
        var results = [];
        for (var i = 0; i < arr.length; i++) {
            if (truthValues[i]) results.push(arr[i]);
        }
        callback(null, results);
    });
}

function filterGeneric(eachfn, coll, iteratee, callback) {
    var results = [];
    eachfn(coll, function (x, index, callback) {
        iteratee(x, function (err, v) {
            if (err) {
                callback(err);
            } else {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            }
        });
    }, function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, arrayMap(results.sort(function (a, b) {
                return a.index - b.index;
            }), baseProperty('value')));
        }
    });
}

function _filter(eachfn, coll, iteratee, callback) {
    var filter = isArrayLike(coll) ? filterArray : filterGeneric;
    filter(eachfn, coll, wrapAsync(iteratee), callback || noop);
}

/**
 * Returns a new array of all the values in `coll` which pass an async truth
 * test. This operation is performed in parallel, but the results array will be
 * in the same order as the original.
 *
 * @name filter
 * @static
 * @memberOf module:Collections
 * @method
 * @alias select
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.filter(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of the existing files
 * });
 */
var filter = doParallel(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name filterLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var filterLimit = doParallelLimit(_filter);

/**
 * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
 *
 * @name filterSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @alias selectSeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - A truth test to apply to each item in `coll`.
 * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
 * with a boolean argument once it has completed. Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results)
 */
var filterSeries = doLimit(filterLimit, 1);

/**
 * Calls the asynchronous function `fn` with a callback parameter that allows it
 * to call itself again, in series, indefinitely.

 * If an error is passed to the callback then `errback` is called with the
 * error, and execution stops, otherwise it will never be called.
 *
 * @name forever
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} fn - an async function to call repeatedly.
 * Invoked with (next).
 * @param {Function} [errback] - when `fn` passes an error to it's callback,
 * this function will be called, and execution stops. Invoked with (err).
 * @example
 *
 * async.forever(
 *     function(next) {
 *         // next is suitable for passing to things that need a callback(err [, whatever]);
 *         // it will result in this function being called again.
 *     },
 *     function(err) {
 *         // if next is called with a value in its first parameter, it will appear
 *         // in here as 'err', and execution will stop.
 *     }
 * );
 */
function forever(fn, errback) {
    var done = onlyOnce(errback || noop);
    var task = wrapAsync(ensureAsync(fn));

    function next(err) {
        if (err) return done(err);
        task(next);
    }
    next();
}

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs a maximum of `limit` async operations at a time.
 *
 * @name groupByLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
var groupByLimit = function(coll, limit, iteratee, callback) {
    callback = callback || noop;
    var _iteratee = wrapAsync(iteratee);
    mapLimit(coll, limit, function(val, callback) {
        _iteratee(val, function(err, key) {
            if (err) return callback(err);
            return callback(null, {key: key, val: val});
        });
    }, function(err, mapResults) {
        var result = {};
        // from MDN, handle object having an `hasOwnProperty` prop
        var hasOwnProperty = Object.prototype.hasOwnProperty;

        for (var i = 0; i < mapResults.length; i++) {
            if (mapResults[i]) {
                var key = mapResults[i].key;
                var val = mapResults[i].val;

                if (hasOwnProperty.call(result, key)) {
                    result[key].push(val);
                } else {
                    result[key] = [val];
                }
            }
        }

        return callback(err, result);
    });
};

/**
 * Returns a new object, where each value corresponds to an array of items, from
 * `coll`, that returned the corresponding key. That is, the keys of the object
 * correspond to the values passed to the `iteratee` callback.
 *
 * Note: Since this function applies the `iteratee` to each item in parallel,
 * there is no guarantee that the `iteratee` functions will complete in order.
 * However, the values for each key in the `result` will be in the same order as
 * the original `coll`. For Objects, the values will roughly be in the order of
 * the original Objects' keys (but this can vary across JavaScript engines).
 *
 * @name groupBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 * @example
 *
 * async.groupBy(['userId1', 'userId2', 'userId3'], function(userId, callback) {
 *     db.findById(userId, function(err, user) {
 *         if (err) return callback(err);
 *         return callback(null, user.age);
 *     });
 * }, function(err, result) {
 *     // result is object containing the userIds grouped by age
 *     // e.g. { 30: ['userId1', 'userId3'], 42: ['userId2']};
 * });
 */
var groupBy = doLimit(groupByLimit, Infinity);

/**
 * The same as [`groupBy`]{@link module:Collections.groupBy} but runs only a single async operation at a time.
 *
 * @name groupBySeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.groupBy]{@link module:Collections.groupBy}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a `key` to group the value under.
 * Invoked with (value, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. Result is an `Object` whoses
 * properties are arrays of values which returned the corresponding key.
 */
var groupBySeries = doLimit(groupByLimit, 1);

/**
 * Logs the result of an `async` function to the `console`. Only works in
 * Node.js or in browsers that support `console.log` and `console.error` (such
 * as FF and Chrome). If multiple arguments are returned from the async
 * function, `console.log` is called on each argument in order.
 *
 * @name log
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} function - The function you want to eventually apply
 * all arguments to.
 * @param {...*} arguments... - Any number of arguments to apply to the function.
 * @example
 *
 * // in a module
 * var hello = function(name, callback) {
 *     setTimeout(function() {
 *         callback(null, 'hello ' + name);
 *     }, 1000);
 * };
 *
 * // in the node repl
 * node> async.log(hello, 'world');
 * 'hello world'
 */
var log = consoleFunc('log');

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name mapValuesLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
function mapValuesLimit(obj, limit, iteratee, callback) {
    callback = once(callback || noop);
    var newObj = {};
    var _iteratee = wrapAsync(iteratee);
    eachOfLimit(obj, limit, function(val, key, next) {
        _iteratee(val, key, function (err, result) {
            if (err) return next(err);
            newObj[key] = result;
            next();
        });
    }, function (err) {
        callback(err, newObj);
    });
}

/**
 * A relative of [`map`]{@link module:Collections.map}, designed for use with objects.
 *
 * Produces a new Object by mapping each value of `obj` through the `iteratee`
 * function. The `iteratee` is called each `value` and `key` from `obj` and a
 * callback for when it has finished processing. Each of these callbacks takes
 * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
 * passes an error to its callback, the main `callback` (for the `mapValues`
 * function) is immediately called with the error.
 *
 * Note, the order of the keys in the result is not guaranteed.  The keys will
 * be roughly in the order they complete, (but this is very engine-specific)
 *
 * @name mapValues
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 * @example
 *
 * async.mapValues({
 *     f1: 'file1',
 *     f2: 'file2',
 *     f3: 'file3'
 * }, function (file, key, callback) {
 *   fs.stat(file, callback);
 * }, function(err, result) {
 *     // result is now a map of stats for each file, e.g.
 *     // {
 *     //     f1: [stats for file1],
 *     //     f2: [stats for file2],
 *     //     f3: [stats for file3]
 *     // }
 * });
 */

var mapValues = doLimit(mapValuesLimit, Infinity);

/**
 * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
 *
 * @name mapValuesSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.mapValues]{@link module:Collections.mapValues}
 * @category Collection
 * @param {Object} obj - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A function to apply to each value and key
 * in `coll`.
 * The iteratee should complete with the transformed value as its result.
 * Invoked with (value, key, callback).
 * @param {Function} [callback] - A callback which is called when all `iteratee`
 * functions have finished, or an error occurs. `result` is a new object consisting
 * of each key from `obj`, with each transformed value on the right-hand side.
 * Invoked with (err, result).
 */
var mapValuesSeries = doLimit(mapValuesLimit, 1);

function has(obj, key) {
    return key in obj;
}

/**
 * Caches the results of an async function. When creating a hash to store
 * function results against, the callback is omitted from the hash and an
 * optional hash function can be used.
 *
 * If no hash function is specified, the first argument is used as a hash key,
 * which may work reasonably if it is a string or a data type that converts to a
 * distinct string. Note that objects and arrays will not behave reasonably.
 * Neither will cases where the other arguments are significant. In such cases,
 * specify your own hash function.
 *
 * The cache of results is exposed as the `memo` property of the function
 * returned by `memoize`.
 *
 * @name memoize
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function to proxy and cache results from.
 * @param {Function} hasher - An optional function for generating a custom hash
 * for storing results. It has all the arguments applied to it apart from the
 * callback, and must be synchronous.
 * @returns {AsyncFunction} a memoized version of `fn`
 * @example
 *
 * var slow_fn = function(name, callback) {
 *     // do something
 *     callback(null, result);
 * };
 * var fn = async.memoize(slow_fn);
 *
 * // fn can now be used as if it were slow_fn
 * fn('some name', function() {
 *     // callback
 * });
 */
function memoize(fn, hasher) {
    var memo = Object.create(null);
    var queues = Object.create(null);
    hasher = hasher || identity;
    var _fn = wrapAsync(fn);
    var memoized = initialParams(function memoized(args, callback) {
        var key = hasher.apply(null, args);
        if (has(memo, key)) {
            setImmediate$1(function() {
                callback.apply(null, memo[key]);
            });
        } else if (has(queues, key)) {
            queues[key].push(callback);
        } else {
            queues[key] = [callback];
            _fn.apply(null, args.concat(function(/*args*/) {
                var args = slice(arguments);
                memo[key] = args;
                var q = queues[key];
                delete queues[key];
                for (var i = 0, l = q.length; i < l; i++) {
                    q[i].apply(null, args);
                }
            }));
        }
    });
    memoized.memo = memo;
    memoized.unmemoized = fn;
    return memoized;
}

/**
 * Calls `callback` on a later loop around the event loop. In Node.js this just
 * calls `process.nextTicl`.  In the browser it will use `setImmediate` if
 * available, otherwise `setTimeout(callback, 0)`, which means other higher
 * priority events may precede the execution of `callback`.
 *
 * This is used internally for browser-compatibility purposes.
 *
 * @name nextTick
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.setImmediate]{@link module:Utils.setImmediate}
 * @category Util
 * @param {Function} callback - The function to call on a later loop around
 * the event loop. Invoked with (args...).
 * @param {...*} args... - any number of additional arguments to pass to the
 * callback on the next tick.
 * @example
 *
 * var call_order = [];
 * async.nextTick(function() {
 *     call_order.push('two');
 *     // call_order now equals ['one','two']
 * });
 * call_order.push('one');
 *
 * async.setImmediate(function (a, b, c) {
 *     // a, b, and c equal 1, 2, and 3
 * }, 1, 2, 3);
 */
var _defer$1;

if (hasNextTick) {
    _defer$1 = process.nextTick;
} else if (hasSetImmediate) {
    _defer$1 = setImmediate;
} else {
    _defer$1 = fallback;
}

var nextTick = wrap(_defer$1);

function _parallel(eachfn, tasks, callback) {
    callback = callback || noop;
    var results = isArrayLike(tasks) ? [] : {};

    eachfn(tasks, function (task, key, callback) {
        wrapAsync(task)(function (err, result) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            }
            results[key] = result;
            callback(err);
        });
    }, function (err) {
        callback(err, results);
    });
}

/**
 * Run the `tasks` collection of functions in parallel, without waiting until
 * the previous function has completed. If any of the functions pass an error to
 * its callback, the main `callback` is immediately called with the value of the
 * error. Once the `tasks` have completed, the results are passed to the final
 * `callback` as an array.
 *
 * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
 * parallel execution of code.  If your tasks do not use any timers or perform
 * any I/O, they will actually be executed in series.  Any synchronous setup
 * sections for each task will happen one after the other.  JavaScript remains
 * single-threaded.
 *
 * **Hint:** Use [`reflect`]{@link module:Utils.reflect} to continue the
 * execution of other tasks when a task fails.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 * results from {@link async.parallel}.
 *
 * @name parallel
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 *
 * @example
 * async.parallel([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // the results array will equal ['one','two'] even though
 *     // the second function had a shorter timeout.
 * });
 *
 * // an example using an object instead of an array
 * async.parallel({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equals to: {one: 1, two: 2}
 * });
 */
function parallelLimit(tasks, callback) {
    _parallel(eachOf, tasks, callback);
}

/**
 * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name parallelLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.parallel]{@link module:ControlFlow.parallel}
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection of
 * [async functions]{@link AsyncFunction} to run.
 * Each async function can complete with any number of optional `result` values.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed successfully. This function gets a results array
 * (or object) containing all the result arguments passed to the task callbacks.
 * Invoked with (err, results).
 */
function parallelLimit$1(tasks, limit, callback) {
    _parallel(_eachOfLimit(limit), tasks, callback);
}

/**
 * A queue of tasks for the worker function to complete.
 * @typedef {Object} QueueObject
 * @memberOf module:ControlFlow
 * @property {Function} length - a function returning the number of items
 * waiting to be processed. Invoke with `queue.length()`.
 * @property {boolean} started - a boolean indicating whether or not any
 * items have been pushed and processed by the queue.
 * @property {Function} running - a function returning the number of items
 * currently being processed. Invoke with `queue.running()`.
 * @property {Function} workersList - a function returning the array of items
 * currently being processed. Invoke with `queue.workersList()`.
 * @property {Function} idle - a function returning false if there are items
 * waiting or being processed, or true if not. Invoke with `queue.idle()`.
 * @property {number} concurrency - an integer for determining how many `worker`
 * functions should be run in parallel. This property can be changed after a
 * `queue` is created to alter the concurrency on-the-fly.
 * @property {Function} push - add a new task to the `queue`. Calls `callback`
 * once the `worker` has finished processing the task. Instead of a single task,
 * a `tasks` array can be submitted. The respective callback is used for every
 * task in the list. Invoke with `queue.push(task, [callback])`,
 * @property {Function} unshift - add a new task to the front of the `queue`.
 * Invoke with `queue.unshift(task, [callback])`.
 * @property {Function} remove - remove items from the queue that match a test
 * function.  The test function will be passed an object with a `data` property,
 * and a `priority` property, if this is a
 * [priorityQueue]{@link module:ControlFlow.priorityQueue} object.
 * Invoked with `queue.remove(testFn)`, where `testFn` is of the form
 * `function ({data, priority}) {}` and returns a Boolean.
 * @property {Function} saturated - a callback that is called when the number of
 * running workers hits the `concurrency` limit, and further tasks will be
 * queued.
 * @property {Function} unsaturated - a callback that is called when the number
 * of running workers is less than the `concurrency` & `buffer` limits, and
 * further tasks will not be queued.
 * @property {number} buffer - A minimum threshold buffer in order to say that
 * the `queue` is `unsaturated`.
 * @property {Function} empty - a callback that is called when the last item
 * from the `queue` is given to a `worker`.
 * @property {Function} drain - a callback that is called when the last item
 * from the `queue` has returned from the `worker`.
 * @property {Function} error - a callback that is called when a task errors.
 * Has the signature `function(error, task)`.
 * @property {boolean} paused - a boolean for determining whether the queue is
 * in a paused state.
 * @property {Function} pause - a function that pauses the processing of tasks
 * until `resume()` is called. Invoke with `queue.pause()`.
 * @property {Function} resume - a function that resumes the processing of
 * queued tasks when the queue is paused. Invoke with `queue.resume()`.
 * @property {Function} kill - a function that removes the `drain` callback and
 * empties remaining tasks from the queue forcing it to go idle. No more tasks
 * should be pushed to the queue after calling this function. Invoke with `queue.kill()`.
 */

/**
 * Creates a `queue` object with the specified `concurrency`. Tasks added to the
 * `queue` are processed in parallel (up to the `concurrency` limit). If all
 * `worker`s are in progress, the task is queued until one becomes available.
 * Once a `worker` completes a `task`, that `task`'s callback is called.
 *
 * @name queue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} worker - An async function for processing a queued task.
 * If you want to handle errors from an individual task, pass a callback to
 * `q.push()`. Invoked with (task, callback).
 * @param {number} [concurrency=1] - An `integer` for determining how many
 * `worker` functions should be run in parallel.  If omitted, the concurrency
 * defaults to `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can
 * attached as certain properties to listen for specific events during the
 * lifecycle of the queue.
 * @example
 *
 * // create a queue object with concurrency 2
 * var q = async.queue(function(task, callback) {
 *     console.log('hello ' + task.name);
 *     callback();
 * }, 2);
 *
 * // assign a callback
 * q.drain = function() {
 *     console.log('all items have been processed');
 * };
 *
 * // add some items to the queue
 * q.push({name: 'foo'}, function(err) {
 *     console.log('finished processing foo');
 * });
 * q.push({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 *
 * // add some items to the queue (batch-wise)
 * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
 *     console.log('finished processing item');
 * });
 *
 * // add some items to the front of the queue
 * q.unshift({name: 'bar'}, function (err) {
 *     console.log('finished processing bar');
 * });
 */
var queue$1 = function (worker, concurrency) {
    var _worker = wrapAsync(worker);
    return queue(function (items, cb) {
        _worker(items[0], cb);
    }, concurrency, 1);
};

/**
 * The same as [async.queue]{@link module:ControlFlow.queue} only tasks are assigned a priority and
 * completed in ascending priority order.
 *
 * @name priorityQueue
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.queue]{@link module:ControlFlow.queue}
 * @category Control Flow
 * @param {AsyncFunction} worker - An async function for processing a queued task.
 * If you want to handle errors from an individual task, pass a callback to
 * `q.push()`.
 * Invoked with (task, callback).
 * @param {number} concurrency - An `integer` for determining how many `worker`
 * functions should be run in parallel.  If omitted, the concurrency defaults to
 * `1`.  If the concurrency is `0`, an error is thrown.
 * @returns {module:ControlFlow.QueueObject} A priorityQueue object to manage the tasks. There are two
 * differences between `queue` and `priorityQueue` objects:
 * * `push(task, priority, [callback])` - `priority` should be a number. If an
 *   array of `tasks` is given, all tasks will be assigned the same priority.
 * * The `unshift` method was removed.
 */
var priorityQueue = function(worker, concurrency) {
    // Start with a normal queue
    var q = queue$1(worker, concurrency);

    // Override push to accept second parameter representing priority
    q.push = function(data, priority, callback) {
        if (callback == null) callback = noop;
        if (typeof callback !== 'function') {
            throw new Error('task callback must be a function');
        }
        q.started = true;
        if (!isArray(data)) {
            data = [data];
        }
        if (data.length === 0) {
            // call drain immediately if there are no tasks
            return setImmediate$1(function() {
                q.drain();
            });
        }

        priority = priority || 0;
        var nextNode = q._tasks.head;
        while (nextNode && priority >= nextNode.priority) {
            nextNode = nextNode.next;
        }

        for (var i = 0, l = data.length; i < l; i++) {
            var item = {
                data: data[i],
                priority: priority,
                callback: callback
            };

            if (nextNode) {
                q._tasks.insertBefore(nextNode, item);
            } else {
                q._tasks.push(item);
            }
        }
        setImmediate$1(q.process);
    };

    // Remove unshift function
    delete q.unshift;

    return q;
};

/**
 * Runs the `tasks` array of functions in parallel, without waiting until the
 * previous function has completed. Once any of the `tasks` complete or pass an
 * error to its callback, the main `callback` is immediately called. It's
 * equivalent to `Promise.race()`.
 *
 * @name race
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array containing [async functions]{@link AsyncFunction}
 * to run. Each function can complete with an optional `result` value.
 * @param {Function} callback - A callback to run once any of the functions have
 * completed. This function gets an error or result from the first function that
 * completed. Invoked with (err, result).
 * @returns undefined
 * @example
 *
 * async.race([
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ],
 * // main callback
 * function(err, result) {
 *     // the result will be equal to 'two' as it finishes earlier
 * });
 */
function race(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new TypeError('First argument to race must be an array of functions'));
    if (!tasks.length) return callback();
    for (var i = 0, l = tasks.length; i < l; i++) {
        wrapAsync(tasks[i])(callback);
    }
}

/**
 * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
 *
 * @name reduceRight
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reduce]{@link module:Collections.reduce}
 * @alias foldr
 * @category Collection
 * @param {Array} array - A collection to iterate over.
 * @param {*} memo - The initial state of the reduction.
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * array to produce the next step in the reduction.
 * The `iteratee` should complete with the next state of the reduction.
 * If the iteratee complete with an error, the reduction is stopped and the
 * main `callback` is immediately called with the error.
 * Invoked with (memo, item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the reduced value. Invoked with
 * (err, result).
 */
function reduceRight (array, memo, iteratee, callback) {
    var reversed = slice(array).reverse();
    reduce(reversed, memo, iteratee, callback);
}

/**
 * Wraps the async function in another function that always completes with a
 * result object, even when it errors.
 *
 * The result object has either the property `error` or `value`.
 *
 * @name reflect
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} fn - The async function you want to wrap
 * @returns {Function} - A function that always passes null to it's callback as
 * the error. The second argument to the callback will be an `object` with
 * either an `error` or a `value` property.
 * @example
 *
 * async.parallel([
 *     async.reflect(function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff but error ...
 *         callback('bad stuff happened');
 *     }),
 *     async.reflect(function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     })
 * ],
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = 'bad stuff happened'
 *     // results[2].value = 'two'
 * });
 */
function reflect(fn) {
    var _fn = wrapAsync(fn);
    return initialParams(function reflectOn(args, reflectCallback) {
        args.push(function callback(error, cbArg) {
            if (error) {
                reflectCallback(null, { error: error });
            } else {
                var value;
                if (arguments.length <= 2) {
                    value = cbArg;
                } else {
                    value = slice(arguments, 1);
                }
                reflectCallback(null, { value: value });
            }
        });

        return _fn.apply(this, args);
    });
}

/**
 * A helper function that wraps an array or an object of functions with `reflect`.
 *
 * @name reflectAll
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.reflect]{@link module:Utils.reflect}
 * @category Util
 * @param {Array|Object|Iterable} tasks - The collection of
 * [async functions]{@link AsyncFunction} to wrap in `async.reflect`.
 * @returns {Array} Returns an array of async functions, each wrapped in
 * `async.reflect`
 * @example
 *
 * let tasks = [
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     function(callback) {
 *         // do some more stuff but error ...
 *         callback(new Error('bad stuff happened'));
 *     },
 *     function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'two');
 *         }, 100);
 *     }
 * ];
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results[0].value = 'one'
 *     // results[1].error = Error('bad stuff happened')
 *     // results[2].value = 'two'
 * });
 *
 * // an example using an object instead of an array
 * let tasks = {
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'one');
 *         }, 200);
 *     },
 *     two: function(callback) {
 *         callback('two');
 *     },
 *     three: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 'three');
 *         }, 100);
 *     }
 * };
 *
 * async.parallel(async.reflectAll(tasks),
 * // optional callback
 * function(err, results) {
 *     // values
 *     // results.one.value = 'one'
 *     // results.two.error = 'two'
 *     // results.three.value = 'three'
 * });
 */
function reflectAll(tasks) {
    var results;
    if (isArray(tasks)) {
        results = arrayMap(tasks, reflect);
    } else {
        results = {};
        baseForOwn(tasks, function(task, key) {
            results[key] = reflect.call(this, task);
        });
    }
    return results;
}

function reject$1(eachfn, arr, iteratee, callback) {
    _filter(eachfn, arr, function(value, cb) {
        iteratee(value, function(err, v) {
            cb(err, !v);
        });
    }, callback);
}

/**
 * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
 *
 * @name reject
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.filter]{@link module:Collections.filter}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 * @example
 *
 * async.reject(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, results) {
 *     // results now equals an array of missing files
 *     createFiles(results);
 * });
 */
var reject = doParallel(reject$1);

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name rejectLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectLimit = doParallelLimit(reject$1);

/**
 * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
 *
 * @name rejectSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.reject]{@link module:Collections.reject}
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {Function} iteratee - An async truth test to apply to each item in
 * `coll`.
 * The should complete with a boolean value as its `result`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Invoked with (err, results).
 */
var rejectSeries = doLimit(rejectLimit, 1);

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant$1(value) {
  return function() {
    return value;
  };
}

/**
 * Attempts to get a successful response from `task` no more than `times` times
 * before returning an error. If the task is successful, the `callback` will be
 * passed the result of the successful task. If all attempts fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name retry
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @see [async.retryable]{@link module:ControlFlow.retryable}
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
 * object with `times` and `interval` or a number.
 * * `times` - The number of attempts to make before giving up.  The default
 *   is `5`.
 * * `interval` - The time to wait between retries, in milliseconds.  The
 *   default is `0`. The interval may also be specified as a function of the
 *   retry count (see example).
 * * `errorFilter` - An optional synchronous function that is invoked on
 *   erroneous result. If it returns `true` the retry attempts will continue;
 *   if the function returns `false` the retry flow is aborted with the current
 *   attempt's error and result being returned to the final callback.
 *   Invoked with (err).
 * * If `opts` is a number, the number specifies the number of times to retry,
 *   with the default interval of `0`.
 * @param {AsyncFunction} task - An async function to retry.
 * Invoked with (callback).
 * @param {Function} [callback] - An optional callback which is called when the
 * task has succeeded, or after the final failed attempt. It receives the `err`
 * and `result` arguments of the last attempt at completing the `task`. Invoked
 * with (err, results).
 *
 * @example
 *
 * // The `retry` function can be used as a stand-alone control flow by passing
 * // a callback, as shown below:
 *
 * // try calling apiMethod 3 times
 * async.retry(3, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 3 times, waiting 200 ms between each retry
 * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod 10 times with exponential backoff
 * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
 * async.retry({
 *   times: 10,
 *   interval: function(retryCount) {
 *     return 50 * Math.pow(2, retryCount);
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod the default 5 times no delay between each retry
 * async.retry(apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // try calling apiMethod only when error condition satisfies, all other
 * // errors will abort the retry control flow and return to final callback
 * async.retry({
 *   errorFilter: function(err) {
 *     return err.message === 'Temporary error'; // only retry on a specific error
 *   }
 * }, apiMethod, function(err, result) {
 *     // do something with the result
 * });
 *
 * // to retry individual methods that are not as reliable within other
 * // control flow functions, use the `retryable` wrapper:
 * async.auto({
 *     users: api.getUsers.bind(api),
 *     payments: async.retryable(3, api.getPayments.bind(api))
 * }, function(err, results) {
 *     // do something with the results
 * });
 *
 */
function retry(opts, task, callback) {
    var DEFAULT_TIMES = 5;
    var DEFAULT_INTERVAL = 0;

    var options = {
        times: DEFAULT_TIMES,
        intervalFunc: constant$1(DEFAULT_INTERVAL)
    };

    function parseTimes(acc, t) {
        if (typeof t === 'object') {
            acc.times = +t.times || DEFAULT_TIMES;

            acc.intervalFunc = typeof t.interval === 'function' ?
                t.interval :
                constant$1(+t.interval || DEFAULT_INTERVAL);

            acc.errorFilter = t.errorFilter;
        } else if (typeof t === 'number' || typeof t === 'string') {
            acc.times = +t || DEFAULT_TIMES;
        } else {
            throw new Error("Invalid arguments for async.retry");
        }
    }

    if (arguments.length < 3 && typeof opts === 'function') {
        callback = task || noop;
        task = opts;
    } else {
        parseTimes(options, opts);
        callback = callback || noop;
    }

    if (typeof task !== 'function') {
        throw new Error("Invalid arguments for async.retry");
    }

    var _task = wrapAsync(task);

    var attempt = 1;
    function retryAttempt() {
        _task(function(err) {
            if (err && attempt++ < options.times &&
                (typeof options.errorFilter != 'function' ||
                    options.errorFilter(err))) {
                setTimeout(retryAttempt, options.intervalFunc(attempt));
            } else {
                callback.apply(null, arguments);
            }
        });
    }

    retryAttempt();
}

/**
 * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method
 * wraps a task and makes it retryable, rather than immediately calling it
 * with retries.
 *
 * @name retryable
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.retry]{@link module:ControlFlow.retry}
 * @category Control Flow
 * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
 * options, exactly the same as from `retry`
 * @param {AsyncFunction} task - the asynchronous function to wrap.
 * This function will be passed any arguments passed to the returned wrapper.
 * Invoked with (...args, callback).
 * @returns {AsyncFunction} The wrapped function, which when invoked, will
 * retry on an error, based on the parameters specified in `opts`.
 * This function will accept the same parameters as `task`.
 * @example
 *
 * async.auto({
 *     dep1: async.retryable(3, getFromFlakyService),
 *     process: ["dep1", async.retryable(3, function (results, cb) {
 *         maybeProcessData(results.dep1, cb);
 *     })]
 * }, callback);
 */
var retryable = function (opts, task) {
    if (!task) {
        task = opts;
        opts = null;
    }
    var _task = wrapAsync(task);
    return initialParams(function (args, callback) {
        function taskFn(cb) {
            _task.apply(null, args.concat(cb));
        }

        if (opts) retry(opts, taskFn, callback);
        else retry(taskFn, callback);

    });
};

/**
 * Run the functions in the `tasks` collection in series, each one running once
 * the previous function has completed. If any functions in the series pass an
 * error to its callback, no more functions are run, and `callback` is
 * immediately called with the value of the error. Otherwise, `callback`
 * receives an array of results when `tasks` have completed.
 *
 * It is also possible to use an object instead of an array. Each property will
 * be run as a function, and the results will be passed to the final `callback`
 * as an object instead of an array. This can be a more readable way of handling
 *  results from {@link async.series}.
 *
 * **Note** that while many implementations preserve the order of object
 * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
 * explicitly states that
 *
 * > The mechanics and order of enumerating the properties is not specified.
 *
 * So if you rely on the order in which your series of functions are executed,
 * and want this to work on all platforms, consider using an array.
 *
 * @name series
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing
 * [async functions]{@link AsyncFunction} to run in series.
 * Each function can complete with any number of optional `result` values.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This function gets a results array (or object)
 * containing all the result arguments passed to the `task` callbacks. Invoked
 * with (err, result).
 * @example
 * async.series([
 *     function(callback) {
 *         // do some stuff ...
 *         callback(null, 'one');
 *     },
 *     function(callback) {
 *         // do some more stuff ...
 *         callback(null, 'two');
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     // results is now equal to ['one', 'two']
 * });
 *
 * async.series({
 *     one: function(callback) {
 *         setTimeout(function() {
 *             callback(null, 1);
 *         }, 200);
 *     },
 *     two: function(callback){
 *         setTimeout(function() {
 *             callback(null, 2);
 *         }, 100);
 *     }
 * }, function(err, results) {
 *     // results is now equal to: {one: 1, two: 2}
 * });
 */
function series(tasks, callback) {
    _parallel(eachOfSeries, tasks, callback);
}

/**
 * Returns `true` if at least one element in the `coll` satisfies an async test.
 * If any iteratee call returns `true`, the main `callback` is immediately
 * called.
 *
 * @name some
 * @static
 * @memberOf module:Collections
 * @method
 * @alias any
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 * @example
 *
 * async.some(['file1','file2','file3'], function(filePath, callback) {
 *     fs.access(filePath, function(err) {
 *         callback(null, !err)
 *     });
 * }, function(err, result) {
 *     // if result is true then at least one of the files exists
 * });
 */
var some = doParallel(_createTester(Boolean, identity));

/**
 * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
 *
 * @name someLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anyLimit
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in parallel.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someLimit = doParallelLimit(_createTester(Boolean, identity));

/**
 * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
 *
 * @name someSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.some]{@link module:Collections.some}
 * @alias anySeries
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async truth test to apply to each item
 * in the collections in series.
 * The iteratee should complete with a boolean `result` value.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the iteratee functions have finished.
 * Result will be either `true` or `false` depending on the values of the async
 * tests. Invoked with (err, result).
 */
var someSeries = doLimit(someLimit, 1);

/**
 * Sorts a list by the results of running each `coll` value through an async
 * `iteratee`.
 *
 * @name sortBy
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The iteratee should complete with a value to use as the sort criteria as
 * its `result`.
 * Invoked with (item, callback).
 * @param {Function} callback - A callback which is called after all the
 * `iteratee` functions have finished, or an error occurs. Results is the items
 * from the original `coll` sorted by the values returned by the `iteratee`
 * calls. Invoked with (err, results).
 * @example
 *
 * async.sortBy(['file1','file2','file3'], function(file, callback) {
 *     fs.stat(file, function(err, stats) {
 *         callback(err, stats.mtime);
 *     });
 * }, function(err, results) {
 *     // results is now the original array of files sorted by
 *     // modified date
 * });
 *
 * // By modifying the callback parameter the
 * // sorting order can be influenced:
 *
 * // ascending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x);
 * }, function(err,result) {
 *     // result callback
 * });
 *
 * // descending order
 * async.sortBy([1,9,3,5], function(x, callback) {
 *     callback(null, x*-1);    //<- x*-1 instead of x, turns the order around
 * }, function(err,result) {
 *     // result callback
 * });
 */
function sortBy (coll, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    map(coll, function (x, callback) {
        _iteratee(x, function (err, criteria) {
            if (err) return callback(err);
            callback(null, {value: x, criteria: criteria});
        });
    }, function (err, results) {
        if (err) return callback(err);
        callback(null, arrayMap(results.sort(comparator), baseProperty('value')));
    });

    function comparator(left, right) {
        var a = left.criteria, b = right.criteria;
        return a < b ? -1 : a > b ? 1 : 0;
    }
}

/**
 * Sets a time limit on an asynchronous function. If the function does not call
 * its callback within the specified milliseconds, it will be called with a
 * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
 *
 * @name timeout
 * @static
 * @memberOf module:Utils
 * @method
 * @category Util
 * @param {AsyncFunction} asyncFn - The async function to limit in time.
 * @param {number} milliseconds - The specified time limit.
 * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
 * to timeout Error for more information..
 * @returns {AsyncFunction} Returns a wrapped function that can be used with any
 * of the control flow functions.
 * Invoke this function with the same parameters as you would `asyncFunc`.
 * @example
 *
 * function myFunction(foo, callback) {
 *     doAsyncTask(foo, function(err, data) {
 *         // handle errors
 *         if (err) return callback(err);
 *
 *         // do some stuff ...
 *
 *         // return processed data
 *         return callback(null, data);
 *     });
 * }
 *
 * var wrapped = async.timeout(myFunction, 1000);
 *
 * // call `wrapped` as you would `myFunction`
 * wrapped({ bar: 'bar' }, function(err, data) {
 *     // if `myFunction` takes < 1000 ms to execute, `err`
 *     // and `data` will have their expected values
 *
 *     // else `err` will be an Error with the code 'ETIMEDOUT'
 * });
 */
function timeout(asyncFn, milliseconds, info) {
    var fn = wrapAsync(asyncFn);

    return initialParams(function (args, callback) {
        var timedOut = false;
        var timer;

        function timeoutCallback() {
            var name = asyncFn.name || 'anonymous';
            var error  = new Error('Callback function "' + name + '" timed out.');
            error.code = 'ETIMEDOUT';
            if (info) {
                error.info = info;
            }
            timedOut = true;
            callback(error);
        }

        args.push(function () {
            if (!timedOut) {
                callback.apply(null, arguments);
                clearTimeout(timer);
            }
        });

        // setup timer and call original function
        timer = setTimeout(timeoutCallback, milliseconds);
        fn.apply(null, args);
    });
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil;
var nativeMax = Math.max;

/**
 * The base implementation of `_.range` and `_.rangeRight` which doesn't
 * coerce arguments.
 *
 * @private
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {number} step The value to increment or decrement by.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Array} Returns the range of numbers.
 */
function baseRange(start, end, step, fromRight) {
  var index = -1,
      length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
      result = Array(length);

  while (length--) {
    result[fromRight ? length : ++index] = start;
    start += step;
  }
  return result;
}

/**
 * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
 * time.
 *
 * @name timesLimit
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} count - The number of times to run the function.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see [async.map]{@link module:Collections.map}.
 */
function timeLimit(count, limit, iteratee, callback) {
    var _iteratee = wrapAsync(iteratee);
    mapLimit(baseRange(0, count, 1), limit, _iteratee, callback);
}

/**
 * Calls the `iteratee` function `n` times, and accumulates results in the same
 * manner you would use with [map]{@link module:Collections.map}.
 *
 * @name times
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.map]{@link module:Collections.map}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 * @example
 *
 * // Pretend this is some complicated async factory
 * var createUser = function(id, callback) {
 *     callback(null, {
 *         id: 'user' + id
 *     });
 * };
 *
 * // generate 5 users
 * async.times(5, function(n, next) {
 *     createUser(n, function(err, user) {
 *         next(err, user);
 *     });
 * }, function(err, users) {
 *     // we should now have 5 users
 * });
 */
var times = doLimit(timeLimit, Infinity);

/**
 * The same as [times]{@link module:ControlFlow.times} but runs only a single async operation at a time.
 *
 * @name timesSeries
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.times]{@link module:ControlFlow.times}
 * @category Control Flow
 * @param {number} n - The number of times to run the function.
 * @param {AsyncFunction} iteratee - The async function to call `n` times.
 * Invoked with the iteration index and a callback: (n, next).
 * @param {Function} callback - see {@link module:Collections.map}.
 */
var timesSeries = doLimit(timeLimit, 1);

/**
 * A relative of `reduce`.  Takes an Object or Array, and iterates over each
 * element in series, each step potentially mutating an `accumulator` value.
 * The type of the accumulator defaults to the type of collection passed in.
 *
 * @name transform
 * @static
 * @memberOf module:Collections
 * @method
 * @category Collection
 * @param {Array|Iterable|Object} coll - A collection to iterate over.
 * @param {*} [accumulator] - The initial state of the transform.  If omitted,
 * it will default to an empty Object or Array, depending on the type of `coll`
 * @param {AsyncFunction} iteratee - A function applied to each item in the
 * collection that potentially modifies the accumulator.
 * Invoked with (accumulator, item, key, callback).
 * @param {Function} [callback] - A callback which is called after all the
 * `iteratee` functions have finished. Result is the transformed accumulator.
 * Invoked with (err, result).
 * @example
 *
 * async.transform([1,2,3], function(acc, item, index, callback) {
 *     // pointless async:
 *     process.nextTick(function() {
 *         acc.push(item * 2)
 *         callback(null)
 *     });
 * }, function(err, result) {
 *     // result is now equal to [2, 4, 6]
 * });
 *
 * @example
 *
 * async.transform({a: 1, b: 2, c: 3}, function (obj, val, key, callback) {
 *     setImmediate(function () {
 *         obj[key] = val * 2;
 *         callback();
 *     })
 * }, function (err, result) {
 *     // result is equal to {a: 2, b: 4, c: 6}
 * })
 */
function transform (coll, accumulator, iteratee, callback) {
    if (arguments.length <= 3) {
        callback = iteratee;
        iteratee = accumulator;
        accumulator = isArray(coll) ? [] : {};
    }
    callback = once(callback || noop);
    var _iteratee = wrapAsync(iteratee);

    eachOf(coll, function(v, k, cb) {
        _iteratee(accumulator, v, k, cb);
    }, function(err) {
        callback(err, accumulator);
    });
}

/**
 * It runs each task in series but stops whenever any of the functions were
 * successful. If one of the tasks were successful, the `callback` will be
 * passed the result of the successful task. If all tasks fail, the callback
 * will be passed the error and result (if any) of the final attempt.
 *
 * @name tryEach
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array|Iterable|Object} tasks - A collection containing functions to
 * run, each function is passed a `callback(err, result)` it must call on
 * completion with an error `err` (which can be `null`) and an optional `result`
 * value.
 * @param {Function} [callback] - An optional callback which is called when one
 * of the tasks has succeeded, or all have failed. It receives the `err` and
 * `result` arguments of the last attempt at completing the `task`. Invoked with
 * (err, results).
 * @example
 * async.tryEach([
 *     function getDataFromFirstWebsite(callback) {
 *         // Try getting the data from the first website
 *         callback(err, data);
 *     },
 *     function getDataFromSecondWebsite(callback) {
 *         // First website failed,
 *         // Try getting the data from the backup website
 *         callback(err, data);
 *     }
 * ],
 * // optional callback
 * function(err, results) {
 *     Now do something with the data.
 * });
 *
 */
function tryEach(tasks, callback) {
    var error = null;
    var result;
    callback = callback || noop;
    eachSeries(tasks, function(task, callback) {
        wrapAsync(task)(function (err, res/*, ...args*/) {
            if (arguments.length > 2) {
                result = slice(arguments, 1);
            } else {
                result = res;
            }
            error = err;
            callback(!err);
        });
    }, function () {
        callback(error, result);
    });
}

/**
 * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
 * unmemoized form. Handy for testing.
 *
 * @name unmemoize
 * @static
 * @memberOf module:Utils
 * @method
 * @see [async.memoize]{@link module:Utils.memoize}
 * @category Util
 * @param {AsyncFunction} fn - the memoized function
 * @returns {AsyncFunction} a function that calls the original unmemoized function
 */
function unmemoize(fn) {
    return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
    };
}

/**
 * Repeatedly call `iteratee`, while `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs.
 *
 * @name whilst
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` passes. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has failed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 * @returns undefined
 * @example
 *
 * var count = 0;
 * async.whilst(
 *     function() { return count < 5; },
 *     function(callback) {
 *         count++;
 *         setTimeout(function() {
 *             callback(null, count);
 *         }, 1000);
 *     },
 *     function (err, n) {
 *         // 5 seconds have passed, n = 5
 *     }
 * );
 */
function whilst(test, iteratee, callback) {
    callback = onlyOnce(callback || noop);
    var _iteratee = wrapAsync(iteratee);
    if (!test()) return callback(null);
    var next = function(err/*, ...args*/) {
        if (err) return callback(err);
        if (test()) return _iteratee(next);
        var args = slice(arguments, 1);
        callback.apply(null, [null].concat(args));
    };
    _iteratee(next);
}

/**
 * Repeatedly call `iteratee` until `test` returns `true`. Calls `callback` when
 * stopped, or an error occurs. `callback` will be passed an error and any
 * arguments passed to the final `iteratee`'s callback.
 *
 * The inverse of [whilst]{@link module:ControlFlow.whilst}.
 *
 * @name until
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @see [async.whilst]{@link module:ControlFlow.whilst}
 * @category Control Flow
 * @param {Function} test - synchronous truth test to perform before each
 * execution of `iteratee`. Invoked with ().
 * @param {AsyncFunction} iteratee - An async function which is called each time
 * `test` fails. Invoked with (callback).
 * @param {Function} [callback] - A callback which is called after the test
 * function has passed and repeated execution of `iteratee` has stopped. `callback`
 * will be passed an error and any arguments passed to the final `iteratee`'s
 * callback. Invoked with (err, [results]);
 */
function until(test, iteratee, callback) {
    whilst(function() {
        return !test.apply(this, arguments);
    }, iteratee, callback);
}

/**
 * Runs the `tasks` array of functions in series, each passing their results to
 * the next in the array. However, if any of the `tasks` pass an error to their
 * own callback, the next function is not executed, and the main `callback` is
 * immediately called with the error.
 *
 * @name waterfall
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
 * to run.
 * Each function should complete with any number of `result` values.
 * The `result` values will be passed as arguments, in order, to the next task.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This will be passed the results of the last task's
 * callback. Invoked with (err, [results]).
 * @returns undefined
 * @example
 *
 * async.waterfall([
 *     function(callback) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(arg1, arg2, callback) {
 *         // arg1 now equals 'one' and arg2 now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(arg1, callback) {
 *         // arg1 now equals 'three'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 *
 * // Or, with named functions:
 * async.waterfall([
 *     myFirstFunction,
 *     mySecondFunction,
 *     myLastFunction,
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 * function myFirstFunction(callback) {
 *     callback(null, 'one', 'two');
 * }
 * function mySecondFunction(arg1, arg2, callback) {
 *     // arg1 now equals 'one' and arg2 now equals 'two'
 *     callback(null, 'three');
 * }
 * function myLastFunction(arg1, callback) {
 *     // arg1 now equals 'three'
 *     callback(null, 'done');
 * }
 */
var waterfall = function(tasks, callback) {
    callback = once(callback || noop);
    if (!isArray(tasks)) return callback(new Error('First argument to waterfall must be an array of functions'));
    if (!tasks.length) return callback();
    var taskIndex = 0;

    function nextTask(args) {
        var task = wrapAsync(tasks[taskIndex++]);
        args.push(onlyOnce(next));
        task.apply(null, args);
    }

    function next(err/*, ...args*/) {
        if (err || taskIndex === tasks.length) {
            return callback.apply(null, arguments);
        }
        nextTask(slice(arguments, 1));
    }

    nextTask([]);
};

/**
 * An "async function" in the context of Async is an asynchronous function with
 * a variable number of parameters, with the final parameter being a callback.
 * (`function (arg1, arg2, ..., callback) {}`)
 * The final callback is of the form `callback(err, results...)`, which must be
 * called once the function is completed.  The callback should be called with a
 * Error as its first argument to signal that an error occurred.
 * Otherwise, if no error occurred, it should be called with `null` as the first
 * argument, and any additional `result` arguments that may apply, to signal
 * successful completion.
 * The callback must be called exactly once, ideally on a later tick of the
 * JavaScript event loop.
 *
 * This type of function is also referred to as a "Node-style async function",
 * or a "continuation passing-style function" (CPS). Most of the methods of this
 * library are themselves CPS/Node-style async functions, or functions that
 * return CPS/Node-style async functions.
 *
 * Wherever we accept a Node-style async function, we also directly accept an
 * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
 * In this case, the `async` function will not be passed a final callback
 * argument, and any thrown error will be used as the `err` argument of the
 * implicit callback, and the return value will be used as the `result` value.
 * (i.e. a `rejected` of the returned Promise becomes the `err` callback
 * argument, and a `resolved` value becomes the `result`.)
 *
 * Note, due to JavaScript limitations, we can only detect native `async`
 * functions and not transpilied implementations.
 * Your environment must have `async`/`await` support for this to work.
 * (e.g. Node > v7.6, or a recent version of a modern browser).
 * If you are using `async` functions through a transpiler (e.g. Babel), you
 * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
 * because the `async function` will be compiled to an ordinary function that
 * returns a promise.
 *
 * @typedef {Function} AsyncFunction
 * @static
 */

/**
 * Async is a utility module which provides straight-forward, powerful functions
 * for working with asynchronous JavaScript. Although originally designed for
 * use with [Node.js](http://nodejs.org) and installable via
 * `npm install --save async`, it can also be used directly in the browser.
 * @module async
 * @see AsyncFunction
 */


/**
 * A collection of `async` functions for manipulating collections, such as
 * arrays and objects.
 * @module Collections
 */

/**
 * A collection of `async` functions for controlling the flow through a script.
 * @module ControlFlow
 */

/**
 * A collection of `async` utility functions.
 * @module Utils
 */

var index = {
    apply: apply,
    applyEach: applyEach,
    applyEachSeries: applyEachSeries,
    asyncify: asyncify,
    auto: auto,
    autoInject: autoInject,
    cargo: cargo,
    compose: compose,
    concat: concat,
    concatLimit: concatLimit,
    concatSeries: concatSeries,
    constant: constant,
    detect: detect,
    detectLimit: detectLimit,
    detectSeries: detectSeries,
    dir: dir,
    doDuring: doDuring,
    doUntil: doUntil,
    doWhilst: doWhilst,
    during: during,
    each: eachLimit,
    eachLimit: eachLimit$1,
    eachOf: eachOf,
    eachOfLimit: eachOfLimit,
    eachOfSeries: eachOfSeries,
    eachSeries: eachSeries,
    ensureAsync: ensureAsync,
    every: every,
    everyLimit: everyLimit,
    everySeries: everySeries,
    filter: filter,
    filterLimit: filterLimit,
    filterSeries: filterSeries,
    forever: forever,
    groupBy: groupBy,
    groupByLimit: groupByLimit,
    groupBySeries: groupBySeries,
    log: log,
    map: map,
    mapLimit: mapLimit,
    mapSeries: mapSeries,
    mapValues: mapValues,
    mapValuesLimit: mapValuesLimit,
    mapValuesSeries: mapValuesSeries,
    memoize: memoize,
    nextTick: nextTick,
    parallel: parallelLimit,
    parallelLimit: parallelLimit$1,
    priorityQueue: priorityQueue,
    queue: queue$1,
    race: race,
    reduce: reduce,
    reduceRight: reduceRight,
    reflect: reflect,
    reflectAll: reflectAll,
    reject: reject,
    rejectLimit: rejectLimit,
    rejectSeries: rejectSeries,
    retry: retry,
    retryable: retryable,
    seq: seq,
    series: series,
    setImmediate: setImmediate$1,
    some: some,
    someLimit: someLimit,
    someSeries: someSeries,
    sortBy: sortBy,
    timeout: timeout,
    times: times,
    timesLimit: timeLimit,
    timesSeries: timesSeries,
    transform: transform,
    tryEach: tryEach,
    unmemoize: unmemoize,
    until: until,
    waterfall: waterfall,
    whilst: whilst,

    // aliases
    all: every,
    allLimit: everyLimit,
    allSeries: everySeries,
    any: some,
    anyLimit: someLimit,
    anySeries: someSeries,
    find: detect,
    findLimit: detectLimit,
    findSeries: detectSeries,
    forEach: eachLimit,
    forEachSeries: eachSeries,
    forEachLimit: eachLimit$1,
    forEachOf: eachOf,
    forEachOfSeries: eachOfSeries,
    forEachOfLimit: eachOfLimit,
    inject: reduce,
    foldl: reduce,
    foldr: reduceRight,
    select: filter,
    selectLimit: filterLimit,
    selectSeries: filterSeries,
    wrapSync: asyncify
};

exports['default'] = index;
exports.apply = apply;
exports.applyEach = applyEach;
exports.applyEachSeries = applyEachSeries;
exports.asyncify = asyncify;
exports.auto = auto;
exports.autoInject = autoInject;
exports.cargo = cargo;
exports.compose = compose;
exports.concat = concat;
exports.concatLimit = concatLimit;
exports.concatSeries = concatSeries;
exports.constant = constant;
exports.detect = detect;
exports.detectLimit = detectLimit;
exports.detectSeries = detectSeries;
exports.dir = dir;
exports.doDuring = doDuring;
exports.doUntil = doUntil;
exports.doWhilst = doWhilst;
exports.during = during;
exports.each = eachLimit;
exports.eachLimit = eachLimit$1;
exports.eachOf = eachOf;
exports.eachOfLimit = eachOfLimit;
exports.eachOfSeries = eachOfSeries;
exports.eachSeries = eachSeries;
exports.ensureAsync = ensureAsync;
exports.every = every;
exports.everyLimit = everyLimit;
exports.everySeries = everySeries;
exports.filter = filter;
exports.filterLimit = filterLimit;
exports.filterSeries = filterSeries;
exports.forever = forever;
exports.groupBy = groupBy;
exports.groupByLimit = groupByLimit;
exports.groupBySeries = groupBySeries;
exports.log = log;
exports.map = map;
exports.mapLimit = mapLimit;
exports.mapSeries = mapSeries;
exports.mapValues = mapValues;
exports.mapValuesLimit = mapValuesLimit;
exports.mapValuesSeries = mapValuesSeries;
exports.memoize = memoize;
exports.nextTick = nextTick;
exports.parallel = parallelLimit;
exports.parallelLimit = parallelLimit$1;
exports.priorityQueue = priorityQueue;
exports.queue = queue$1;
exports.race = race;
exports.reduce = reduce;
exports.reduceRight = reduceRight;
exports.reflect = reflect;
exports.reflectAll = reflectAll;
exports.reject = reject;
exports.rejectLimit = rejectLimit;
exports.rejectSeries = rejectSeries;
exports.retry = retry;
exports.retryable = retryable;
exports.seq = seq;
exports.series = series;
exports.setImmediate = setImmediate$1;
exports.some = some;
exports.someLimit = someLimit;
exports.someSeries = someSeries;
exports.sortBy = sortBy;
exports.timeout = timeout;
exports.times = times;
exports.timesLimit = timeLimit;
exports.timesSeries = timesSeries;
exports.transform = transform;
exports.tryEach = tryEach;
exports.unmemoize = unmemoize;
exports.until = until;
exports.waterfall = waterfall;
exports.whilst = whilst;
exports.all = every;
exports.allLimit = everyLimit;
exports.allSeries = everySeries;
exports.any = some;
exports.anyLimit = someLimit;
exports.anySeries = someSeries;
exports.find = detect;
exports.findLimit = detectLimit;
exports.findSeries = detectSeries;
exports.forEach = eachLimit;
exports.forEachSeries = eachSeries;
exports.forEachLimit = eachLimit$1;
exports.forEachOf = eachOf;
exports.forEachOfSeries = eachOfSeries;
exports.forEachOfLimit = eachOfLimit;
exports.inject = reduce;
exports.foldl = reduce;
exports.foldr = reduceRight;
exports.select = filter;
exports.selectLimit = filterLimit;
exports.selectSeries = filterSeries;
exports.wrapSync = asyncify;

Object.defineProperty(exports, '__esModule', { value: true });

})));
(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f;
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function(e) {
        var n = t[o][1][e];
        return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
})({
  1: [ function(require, module, exports) {
    var process = module.exports = {};
    process.nextTick = function() {
      var canSetImmediate = typeof window !== "undefined" && window.setImmediate;
      var canPost = typeof window !== "undefined" && window.postMessage && window.addEventListener;
      if (canSetImmediate) {
        return function(f) {
          return window.setImmediate(f);
        };
      }
      if (canPost) {
        var queue = [];
        window.addEventListener("message", function(ev) {
          var source = ev.source;
          if ((source === window || source === null) && ev.data === "process-tick") {
            ev.stopPropagation();
            if (queue.length > 0) {
              var fn = queue.shift();
              fn();
            }
          }
        }, true);
        return function nextTick(fn) {
          queue.push(fn);
          window.postMessage("process-tick", "*");
        };
      }
      return function nextTick(fn) {
        setTimeout(fn, 0);
      };
    }();
    process.title = "browser";
    process.browser = true;
    process.env = {};
    process.argv = [];
    function noop() {}
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.binding = function(name) {
      throw new Error("process.binding is not supported");
    };
    process.cwd = function() {
      return "/";
    };
    process.chdir = function(dir) {
      throw new Error("process.chdir is not supported");
    };
  }, {} ],
  2: [ function(require, module, exports) {
    "use strict";
    var asap = require("asap");
    module.exports = Promise;
    function Promise(fn) {
      if (typeof this !== "object") throw new TypeError("Promises must be constructed via new");
      if (typeof fn !== "function") throw new TypeError("not a function");
      var state = null;
      var value = null;
      var deferreds = [];
      var self = this;
      this.then = function(onFulfilled, onRejected) {
        return new self.constructor(function(resolve, reject) {
          handle(new Handler(onFulfilled, onRejected, resolve, reject));
        });
      };
      function handle(deferred) {
        if (state === null) {
          deferreds.push(deferred);
          return;
        }
        asap(function() {
          var cb = state ? deferred.onFulfilled : deferred.onRejected;
          if (cb === null) {
            (state ? deferred.resolve : deferred.reject)(value);
            return;
          }
          var ret;
          try {
            ret = cb(value);
          } catch (e) {
            deferred.reject(e);
            return;
          }
          deferred.resolve(ret);
        });
      }
      function resolve(newValue) {
        try {
          if (newValue === self) throw new TypeError("A promise cannot be resolved with itself.");
          if (newValue && (typeof newValue === "object" || typeof newValue === "function")) {
            var then = newValue.then;
            if (typeof then === "function") {
              doResolve(then.bind(newValue), resolve, reject);
              return;
            }
          }
          state = true;
          value = newValue;
          finale();
        } catch (e) {
          reject(e);
        }
      }
      function reject(newValue) {
        state = false;
        value = newValue;
        finale();
      }
      function finale() {
        for (var i = 0, len = deferreds.length; i < len; i++) handle(deferreds[i]);
        deferreds = null;
      }
      doResolve(fn, resolve, reject);
    }
    function Handler(onFulfilled, onRejected, resolve, reject) {
      this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
      this.onRejected = typeof onRejected === "function" ? onRejected : null;
      this.resolve = resolve;
      this.reject = reject;
    }
    function doResolve(fn, onFulfilled, onRejected) {
      var done = false;
      try {
        fn(function(value) {
          if (done) return;
          done = true;
          onFulfilled(value);
        }, function(reason) {
          if (done) return;
          done = true;
          onRejected(reason);
        });
      } catch (ex) {
        if (done) return;
        done = true;
        onRejected(ex);
      }
    }
  }, {
    asap: 4
  } ],
  3: [ function(require, module, exports) {
    "use strict";
    var Promise = require("./core.js");
    var asap = require("asap");
    module.exports = Promise;
    function ValuePromise(value) {
      this.then = function(onFulfilled) {
        if (typeof onFulfilled !== "function") return this;
        return new Promise(function(resolve, reject) {
          asap(function() {
            try {
              resolve(onFulfilled(value));
            } catch (ex) {
              reject(ex);
            }
          });
        });
      };
    }
    ValuePromise.prototype = Promise.prototype;
    var TRUE = new ValuePromise(true);
    var FALSE = new ValuePromise(false);
    var NULL = new ValuePromise(null);
    var UNDEFINED = new ValuePromise(undefined);
    var ZERO = new ValuePromise(0);
    var EMPTYSTRING = new ValuePromise("");
    Promise.resolve = function(value) {
      if (value instanceof Promise) return value;
      if (value === null) return NULL;
      if (value === undefined) return UNDEFINED;
      if (value === true) return TRUE;
      if (value === false) return FALSE;
      if (value === 0) return ZERO;
      if (value === "") return EMPTYSTRING;
      if (typeof value === "object" || typeof value === "function") {
        try {
          var then = value.then;
          if (typeof then === "function") {
            return new Promise(then.bind(value));
          }
        } catch (ex) {
          return new Promise(function(resolve, reject) {
            reject(ex);
          });
        }
      }
      return new ValuePromise(value);
    };
    Promise.all = function(arr) {
      var args = Array.prototype.slice.call(arr);
      return new Promise(function(resolve, reject) {
        if (args.length === 0) return resolve([]);
        var remaining = args.length;
        function res(i, val) {
          try {
            if (val && (typeof val === "object" || typeof val === "function")) {
              var then = val.then;
              if (typeof then === "function") {
                then.call(val, function(val) {
                  res(i, val);
                }, reject);
                return;
              }
            }
            args[i] = val;
            if (--remaining === 0) {
              resolve(args);
            }
          } catch (ex) {
            reject(ex);
          }
        }
        for (var i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    };
    Promise.reject = function(value) {
      return new Promise(function(resolve, reject) {
        reject(value);
      });
    };
    Promise.race = function(values) {
      return new Promise(function(resolve, reject) {
        values.forEach(function(value) {
          Promise.resolve(value).then(resolve, reject);
        });
      });
    };
    Promise.prototype["catch"] = function(onRejected) {
      return this.then(null, onRejected);
    };
  }, {
    "./core.js": 2,
    asap: 4
  } ],
  4: [ function(require, module, exports) {
    (function(process) {
      var head = {
        task: void 0,
        next: null
      };
      var tail = head;
      var flushing = false;
      var requestFlush = void 0;
      var isNodeJS = false;
      function flush() {
        while (head.next) {
          head = head.next;
          var task = head.task;
          head.task = void 0;
          var domain = head.domain;
          if (domain) {
            head.domain = void 0;
            domain.enter();
          }
          try {
            task();
          } catch (e) {
            if (isNodeJS) {
              if (domain) {
                domain.exit();
              }
              setTimeout(flush, 0);
              if (domain) {
                domain.enter();
              }
              throw e;
            } else {
              setTimeout(function() {
                throw e;
              }, 0);
            }
          }
          if (domain) {
            domain.exit();
          }
        }
        flushing = false;
      }
      if (typeof process !== "undefined" && process.nextTick) {
        isNodeJS = true;
        requestFlush = function() {
          process.nextTick(flush);
        };
      } else if (typeof setImmediate === "function") {
        if (typeof window !== "undefined") {
          requestFlush = setImmediate.bind(window, flush);
        } else {
          requestFlush = function() {
            setImmediate(flush);
          };
        }
      } else if (typeof MessageChannel !== "undefined") {
        var channel = new MessageChannel();
        channel.port1.onmessage = flush;
        requestFlush = function() {
          channel.port2.postMessage(0);
        };
      } else {
        requestFlush = function() {
          setTimeout(flush, 0);
        };
      }
      function asap(task) {
        tail = tail.next = {
          task: task,
          domain: isNodeJS && process.domain,
          next: null
        };
        if (!flushing) {
          flushing = true;
          requestFlush();
        }
      }
      module.exports = asap;
    }).call(this, require("_process"));
  }, {
    _process: 1
  } ],
  5: [ function(require, module, exports) {
    if (typeof Promise.prototype.done !== "function") {
      Promise.prototype.done = function(onFulfilled, onRejected) {
        var self = arguments.length ? this.then.apply(this, arguments) : this;
        self.then(null, function(err) {
          setTimeout(function() {
            throw err;
          }, 0);
        });
      };
    }
  }, {} ],
  6: [ function(require, module, exports) {
    var asap = require("asap");
    if (typeof Promise === "undefined") {
      Promise = require("./lib/core.js");
      require("./lib/es6-extensions.js");
    }
    require("./polyfill-done.js");
  }, {
    "./lib/core.js": 2,
    "./lib/es6-extensions.js": 3,
    "./polyfill-done.js": 5,
    asap: 4
  } ]
}, {}, [ 6 ]);
//# sourceMappingURL=/polyfills/promise-6.1.0.js.map
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):function(){var n=t.Ractive,i=e();t.Ractive=i,i.noConflict=function(){return t.Ractive=n,i}}()}(this,function(){"use strict";function t(t,e){return Object.prototype.hasOwnProperty.call(t,e)}function e(e){for(var n=[],i=arguments.length-1;i-->0;)n[i]=arguments[i+1];for(var r=0;r<n.length;r++){var s=n[r];for(var a in s)a in e||!t(s,a)||(e[a]=s[a])}return e}function n(e){void 0===e&&(e={});var n=[];for(var i in e)t(e,i)&&n.push([i,e[i]]);return n}function i(t,e){return null===t&&null===e?!0:o(t)||o(e)?!1:t===e}function r(t){return!isNaN(parseFloat(t))&&isFinite(t)}function s(t){return t&&"[object Object]"===aa.call(t)}function a(t){return!(!t||!o(t)&&!u(t))}function o(t){return"object"==typeof t}function u(t){return"function"==typeof t}function h(t){return"string"==typeof t}function l(t){return"number"==typeof t}function c(t,e){return t.replace(/%s/g,function(){return e.shift()})}function d(t){for(var e=[],n=arguments.length-1;n-->0;)e[n]=arguments[n+1];throw t=c(t,e),new Error(t)}function f(){Xs.DEBUG&&ga.apply(null,arguments)}function p(t){for(var e=[],n=arguments.length-1;n-->0;)e[n]=arguments[n+1];t=c(t,e),ya(t,e)}function m(t){for(var e=[],n=arguments.length-1;n-->0;)e[n]=arguments[n+1];t=c(t,e),ja[t]||(ja[t]=!0,ya(t,e))}function v(){Xs.DEBUG&&p.apply(null,arguments)}function g(){Xs.DEBUG&&m.apply(null,arguments)}function y(t,e,n){var i=b(t,e,n);return i?i[t][n]:null}function b(t,e,n){for(;e;){if(n in e[t])return e;if(e.isolated)return null;e=e.parent}}function w(t,e,n,i){if(t===e)return null;if(i){var r=y("interpolators",n,i);if(r)return r(t,e)||null;d(Ma(i,"interpolator"))}return Ba.number(t,e)||Ba.array(t,e)||Ba.object(t,e)||null}function x(t){return h(t)?t.replace(Da,"\\$&"):t}function _(t){return t?t.replace(Ra,".$1"):""}function k(t){var e,n=[];for(t=_(t);e=Ka.exec(t);){var i=e.index+e[1].length;n.push(t.substr(0,i)),t=t.substr(i+1)}return n.push(t),n}function E(t){return h(t)?t.replace(La,"$1$2"):t}function A(t,e){var n=t.indexOf(e);-1===n&&t.push(e)}function C(t,e){for(var n=0,i=t.length;i>n;n++)if(t[n]==e)return!0;return!1}function S(t,e){var n;if(!oa(t)||!oa(e))return!1;if(t.length!==e.length)return!1;for(n=t.length;n--;)if(t[n]!==e[n])return!1;return!0}function O(t){return h(t)?[t]:void 0===t?[]:t}function j(t){return t[t.length-1]}function N(t,e){if(t){var n=t.indexOf(e);-1!==n&&t.splice(n,1)}}function T(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];for(var n=t.concat.apply([],t),i=n.length;i--;){var r=n.indexOf(n[i]);~r&&i>r&&n.splice(i,1)}return n}function V(t){for(var e=[],n=t.length;n--;)e[n]=t[n];return e}function P(t,e){for(var n=t.length,i=0;n>i;i++){var r=e(t[i]);if(r)return r}}function I(){Fa.push(Va=[])}function M(){var t=Fa.pop();return Va=Fa[Fa.length-1],t}function B(t){Va&&Va.push(t)}function R(t){t.bind()}function K(t){t.cancel()}function D(t){t.destroyed()}function L(t){t.handleChange()}function F(t){t.mark()}function z(t){t.mark(!0)}function U(t){t.marked()}function $(t){t.markedAll()}function q(t){t.render()}function H(t){t.shuffled()}function Z(t){t.teardown()}function W(t){t.unbind()}function G(t){t.unrender()}function Y(t){t.unrender(!0)}function Q(t){t.update()}function J(t){return t.toString()}function X(t){return t.toString(!0)}function tt(t,e){if(!/this/.test(t.toString()))return t;var n=Ha.call(t,e);for(var i in t)n[i]=t[i];return n}function et(t,e,n){return n&&u(e)&&t.parent&&t.parent.isRoot?(t.boundValue||(t.boundValue=tt(e._r_unbound||e,t.parent.ractive)),t.boundValue):e}function nt(t){t.updateFromBindings(!0)}function it(t){for(var e=t.length;e--;)if(t[e].bound){var n=t[e].owner;if(n){var i="checked"===n.name?n.node.checked:n.node.value;return{value:i}}}}function rt(t){if(t){var e=Za[t];Za[t]=[];for(var n=e.length;n--;)e[n]();var i=Wa[t];for(Wa[t]=[],n=i.length;n--;)i[n].model.register(i[n].item)}else rt("early"),rt("mark")}function st(t,e,n,i){t.shuffling=!0;for(var r=e.length;r--;){var s=e[r];r!==s&&(r in t.childByKey&&t.childByKey[r].rebind(~s?t.joinKey(s):void 0,t.childByKey[r],!i),!~s&&t.keyModels[r]?t.keyModels[r].rebind(void 0,t.keyModels[r],!1):~s&&t.keyModels[r]&&(t.keyModels[s]||t.childByKey[s].getKeyModel(s),t.keyModels[r].rebind(t.keyModels[s],t.keyModels[r],!1)))}var a=t.source().length!==t.source().value.length;for(t.links.forEach(function(t){return t.shuffle(e)}),n||rt("early"),r=t.deps.length;r--;)t.deps[r].shuffle&&t.deps[r].shuffle(e);t[n?"marked":"mark"](),n||rt("mark"),a&&t.notifyUpstream(),t.shuffling=!1}function at(t,e,n,i){var r=t.r||t;if(!r||!h(r))return e;if("."===r||"@"===r[0]||(e||n).isKey||(e||n).isKeypath)return e;var s=r.split("/"),a=k(s[s.length-1]),o=a[a.length-1],u=e||n;u&&1===a.length&&o!==u.key&&i&&(a=ot(o,i)||a);for(var l=a.length,c=!0,d=!1;u&&l--;)u.shuffling&&(d=!0),a[l]!=u.key&&(c=!1),u=u.parent;return!e&&c&&d?n:e&&!c&&d?n:e}function ot(t,e){for(;e;){var n=e.aliases;if(n&&n[t]){for(var i=(e.owner.iterations?e.owner:e).owner.template.z,r=0;r<i.length;r++)if(i[r].n===t){var s=i[r].x;if(!s.r)return!1;var a=s.r.split("/");return k(a[a.length-1])}return}e=e.componentParent||e.parent}}function ut(t){t.detach()}function ht(t){t.detachNodes()}function lt(t){!t.ready||t.outros.length||t.outroChildren||(t.outrosComplete||(t.outrosComplete=!0,t.parent&&!t.parent.outrosComplete?t.parent.decrementOutros(t):t.detachNodes()),t.intros.length||t.totalChildren||(u(t.callback)&&t.callback(),t.parent&&!t.notifiedTotal&&(t.notifiedTotal=!0,t.parent.decrementTotal())))}function ct(t){var e,n,i=t.detachQueue,r=dt(t),s=i.length,a=0;t:for(;s--;){for(e=i[s].node,a=r.length;a--;)if(n=r[a].element.node,n===e||n.contains(e)||e.contains(n))continue t;i[s].detach(),i.splice(s,1)}}function dt(t,e){var n=e;if(n){for(var i=t.children.length;i--;)n=dt(t.children[i],n);return t.outros.length&&(n=n.concat(t.outros)),n}n=[];for(var r=t;r.parent;)r=r.parent;return dt(r,n)}function ft(t){t.dispatch()}function pt(){var t=eo.immediateObservers;eo.immediateObservers=[],t.forEach(ft);var e,n=eo.fragments.length;for(t=eo.fragments,eo.fragments=[];n--;)e=t[n],e.update();eo.transitionManager.ready(),t=eo.deferredObservers,eo.deferredObservers=[],t.forEach(ft);var i=eo.tasks;for(eo.tasks=[],n=0;n<i.length;n+=1)i[n]();return eo.fragments.length||eo.immediateObservers.length||eo.deferredObservers.length||eo.tasks.length?pt():void 0}function mt(){no.start();var t,e,n=performance.now();for(t=0;t<io.length;t+=1)e=io[t],e.tick(n)||io.splice(t--,1);no.end(),io.length?requestAnimationFrame(mt):ro=!1}function vt(e,n){var i={};if(!n)return e;n+=".";for(var r in e)t(e,r)&&(i[n+r]=e[r]);return i}function gt(t){var e;return oo[t]||(e=t?t+".":"",oo[t]=function(n,i){var r;return h(n)?(r={},r[e+n]=i,r):o(n)?e?vt(n,t):n:void 0}),oo[t]}function yt(t){for(var e=[],n=0;n<t.length;n++)e[n]=(t.childByKey[n]||{}).value;return e}function bt(e,n){var i=e;if("."===n)return e.findContext();if("~"===n[0])return e.ractive.viewmodel.joinAll(k(n.slice(2)));if("."===n[0]||"^"===n[0]){var r=e,s=n.split("/"),a="^^"===s[0],o=a?null:e.findContext();for(a&&s.unshift("^^");"^^"===s[0];)for(s.shift(),o=null;r&&!o;)o=r.context,r=r.parent.component?r.parent.component.up:r.parent;if(!o&&a)throw new Error("Invalid context parent reference ('"+n+"'). There is not context at that level.");for(;"."===s[0]||".."===s[0];){var h=s.shift();".."===h&&(o=o.parent)}return n=s.join("/"),"."===n[0]&&(n=n.slice(1)),o.joinAll(k(n))}var l=k(n);if(l.length){var c=l.shift();if("@"===c[0]){if("@this"===c||"@"===c)return e.ractive.viewmodel.getRactiveModel().joinAll(l);if("@index"===c||"@key"===c){l.length&&wt(c);var d=e.findRepeatingFragment();if(!d.isIteration)return;return d.context&&d.context.getKeyModel(d["i"===n[1]?"index":"key"])}if("@global"===c)return fo.joinAll(l);if("@shared"===c)return co.joinAll(l);if("@keypath"===c||"@rootpath"===c){for(var f="r"===n[1]?e.ractive.root:null,p=e.findContext();f&&p.isRoot&&p.ractive.component;)p=p.ractive.component.up.findContext();return p.getKeypathModel(f)}if("@context"===c)return new po(e.getContext());if("@local"===c)return e.getContext()._data.joinAll(l);if("@style"===c)return e.ractive.constructor._cssModel.joinAll(l);throw new Error("Invalid special reference '"+c+"'")}var m=e.findContext();if(m.has(c))return m.joinKey(c).joinAll(l);for(var g=!1,y=e.ractive.warnAboutAmbiguity;e;){if(e.isIteration){if(c===e.parent.keyRef)return l.length&&wt(c),e.context.getKeyModel(e.key);if(c===e.parent.indexRef)return l.length&&wt(c),e.context.getKeyModel(e.index)}if(e.aliases&&t(e.aliases,c)){var b=e.aliases[c];if(0===l.length)return b;if(u(b.joinAll))return b.joinAll(l)}if(e.context&&e.context.has(c))return g?(y&&v("'"+n+"' resolved but is ambiguous and will create a mapping to a parent component."),m.root.createLink(c,e.context.joinKey(c),c,{implicit:!0}).joinAll(l)):(y&&v("'"+n+"' resolved but is ambiguous."),e.context.joinKey(c).joinAll(l));(e.componentParent||!e.parent&&e.ractive.component)&&!e.ractive.isolated?(e=e.componentParent||e.ractive.component.up,g=!0):e=e.parent}var w=i.ractive;return w.resolveInstanceMembers&&"data"!==c&&c in w?w.viewmodel.getRactiveModel().joinKey(c).joinAll(l):(y&&v("'"+n+"' is ambiguous and did not resolve."),m.joinKey(c).joinAll(l))}}function wt(t){throw new Error("An index or key reference ("+t+") cannot have child properties")}function xt(t){for(var e=[],n=arguments.length-1;n-->0;)e[n]=arguments[n+1];var i=t.fragment||t._fakeFragment||(t._fakeFragment=new vo(t));return i.getContext.apply(i,e)}function _t(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return this.ctx||(this.ctx=new mo.Context(this)),t.unshift(na(this.ctx)),ea.apply(null,t)}function kt(t){for(var e=t;e&&!e.context;)e=e.parent;return e?e:t&&t.ractive.fragment}function Et(t,e){var n=yo,i=e&&e.deep,r=e&&e.shuffle,s=no.start();e&&"keep"in e&&(yo=e.keep);for(var a=t.length;a--;){var o=t[a][0],u=t[a][1],h=t[a][2];if(!o)throw no.end(),new Error("Failed to set invalid keypath '"+h+"'");if(i)St(o,u);else if(r){var l=u,c=o.get();if(l||(l=c),void 0===c)o.set(l);else{if(!oa(c)||!oa(l))throw no.end(),new Error("You cannot merge an array with a non-array");var d=Ot(r);o.merge(l,d)}}else o.set(u)}return no.end(),yo=n,s}function At(t,e,n,i){if(!n&&("."===e[0]||"^"===e[1]))return v("Attempted to set a relative keypath from a non-relative context. You can use a context object to set relative keypaths."),[];var r=k(e),s=n||t.viewmodel;return bo.test(e)?s.findMatches(r):s===t.viewmodel?!t.component||t.isolated||s.has(r[0])||"@"===e[0]||!e[0]||i?[s.joinAll(r)]:[bt(t.fragment||new vo(t),e)]:[s.joinAll(r)]}function Ct(e,n,i,r){var a=[];if(s(n)){var o=function(i){t(n,i)&&a.push.apply(a,At(e,i,null,r).map(function(t){return[t,n[i],i]}))};for(var u in n)o(u)}else a.push.apply(a,At(e,n,null,r).map(function(t){return[t,i,n]}));return a}function St(e,n){var i=e.get(!1,wo);if(null==i||!o(n))return e.set(n);if(!o(i))return e.set(n);for(var r in n)t(n,r)&&St(e.joinKey(r),n[r])}function Ot(t){if(t===!0)return null;if(u(t))return t;if(h(t))return xo[t]||(xo[t]=function(e){return e[t]});throw new Error("If supplied, options.compare must be a string, function, or true")}function jt(t,e,n,i){if(!h(e)||!r(n))throw new Error("Bad arguments");var s=Ct(t,e,n,i&&i.isolated);return Et(s.map(function(t){var e=t[0],n=t[1],i=e.get();if(!r(n)||!r(i))throw new Error(_o);return[e,i+n]}))}function Nt(t,e,n){var i=l(e)?e:1,r=o(e)?e:n;return jt(this,t,i,r)}function Tt(t){var e=Promise.resolve(t);return ia(e,"stop",{value:Oa}),e}function Vt(t,e){t=t||{};var n;return t.easing&&(n=u(t.easing)?t.easing:e.easing[t.easing]),{easing:n||ko,duration:"duration"in t?t.duration:400,complete:t.complete||Oa,step:t.step||Oa,interpolator:t.interpolator}}function Pt(t,e,n,r){r=Vt(r,t);var s=e.get();if(i(s,n))return r.complete(r.to),Tt(n);var a=w(s,n,t,r.interpolator);return a?e.animate(s,n,r,a):(no.start(),e.set(n),no.end(),Tt(n))}function It(t,e,n){if(o(t)){var i=sa(t);throw new Error("ractive.animate(...) no longer supports objects. Instead of ractive.animate({\n  "+i.map(function(e){return"'"+e+"': "+t[e]}).join("\n  ")+"\n}, {...}), do\n\n"+i.map(function(e){return"ractive.animate('"+e+"', "+t[e]+", {...});"}).join("\n")+"\n")}return Pt(this,this.viewmodel.joinAll(k(t)),e,n)}function Mt(t,e){t.event&&t._eventQueue.push(t.event),t.event=e}function Bt(t){t._eventQueue.length?t.event=t._eventQueue.pop():t.event=null}function Rt(t,e){var n=e?Eo:Ao;if(n[t])return n[t];var i=t.split("."),r=[],s=!1;e&&(i.unshift("this"),s=!0);for(var a=Math.pow(2,i.length)-(e?1:0),o=0;a>o;o++){for(var u=[],h=0;h<i.length;h++)u.push(1&o>>h?"*":i[h]);r.unshift(u.join("."))}return s&&(i.length>2?r.push.apply(r,Rt(t,!1)):(r.push("*"),r.push(t))),n[t]=r,r}function Kt(t,e,n,i){if(void 0===i&&(i=[]),e){n.name=e,i.unshift(n);var r=t._nsSubs?Rt(e,!0):["*",e];return Dt(t,r,n,i,!0)}}function Dt(t,e,n,i,r){void 0===r&&(r=!1);var s=!0;if(r||t._nsSubs){Mt(t,n);for(var a=e.length;a--;)e[a]in t._subs&&(s=Lt(t,t._subs[e[a]],n,i)&&s);Bt(t)}if(t.parent&&s){if(r&&t.component){var o=t.component.name+"."+e[e.length-1];e=Rt(o,!1),n&&!n.component&&(n.component=t)}s=Dt(t.parent,e,n,i)}return s}function Lt(t,e,n,i){var r=null,s=!1;e=e.slice();for(var a=0,o=e.length;o>a;a+=1)e[a].off||e[a].handler.apply(t,i)!==!1||(s=!0);return n&&s&&(r=n.event)&&(r.preventDefault&&r.preventDefault(),r.stopPropagation&&r.stopPropagation()),!s}function Ft(t,e){void 0===e&&(e=null);var n=[];return zt(t,e,n),n}function zt(t,e,n){t.isAnchor?e&&t.name!==e||n.push(t):t.items?t.items.forEach(function(t){return zt(t,e,n)}):t.iterations?t.iterations.forEach(function(t){return zt(t,e,n)}):t.fragment&&!t.component&&zt(t.fragment,e,n)}function Ut(t,e){void 0===e&&(e=null);var n=Ft(t.fragment,e),i={},r=t._children.byName;n.forEach(function(t){var e=t.name;e in i||(i[e]=0);var n=i[e],s=(r[e]||[])[n];s&&s.lastBound!==t&&(s.lastBound&&s.lastBound.removeChild(s),t.addChild(s)),i[e]++})}function $t(t){t.instance.fragment.rendered&&(t.shouldDestroy=!0,t.instance.unrender()),t.instance.el=null}function qt(t,e){void 0===e&&(e={});var n,i=this._children;if(t.parent&&t.parent!==this)throw new Error("Instance "+t._guid+" is already attached to a different instance "+t.parent._guid+". Please detach it from the other instance using detachChild first.");if(t.parent)throw new Error("Instance "+t._guid+" is already attached to this instance.");var r={instance:t,ractive:this,name:e.name||t.constructor.name||"Ractive",target:e.target||!1,bubble:Ht,findNextNode:Zt};if(r.nameOption=e.name,r.target){var s;(s=i.byName[r.target])||(s=[],this.set("@this.children.byName."+r.target,s)),n=e.prepend?0:void 0!==e.insertAt?e.insertAt:s.length}else r.up=this.fragment,r.external=!0;t.set({"@this.parent":this,"@this.root":this.root}),t.component=r,i.push(r),So.fire(t);var a=no.start();return r.target?($t(r),this.splice("@this.children.byName."+r.target,n,0,r),Ut(this,r.target)):t.isolated||t.viewmodel.attached(this.fragment),no.end(),a.ractive=t,a.then(function(){return t})}function Ht(){no.addFragment(this.instance.fragment)}function Zt(){return this.anchor?this.anchor.findNextNode():void 0}function Wt(){return this.isDetached?this.el:(this.el&&N(this.el.__ractive_instances__,this),this.el=this.fragment.detach(),this.isDetached=!0,Oo.fire(this),this.el)}function Gt(t){for(var e,n,i=this._children,r=i.length;r--;)if(i[r].instance===t){n=r,e=i[r];break}if(!e||t.parent!==this)throw new Error("Instance "+t._guid+" is not attached to this instance.");var s=no.start();return e.anchor&&e.anchor.removeChild(e),t.isolated||t.viewmodel.detached(),no.end(),i.splice(n,1),e.target&&(this.splice("@this.children.byName."+e.target,i.byName[e.target].indexOf(e),1),Ut(this,e.target)),t.set({"@this.parent":void 0,"@this.root":t}),t.component=null,jo.fire(t),s.ractive=t,s.then(function(){return t})}function Yt(t,e){var n=this;if(void 0===e&&(e={}),!this.el)throw new Error("Cannot call ractive.find('"+t+"') unless instance is rendered to the DOM");var i=this.fragment.find(t,e);if(i)return i;if(e.remote)for(var r=0;r<this._children.length;r++)if(n._children[r].instance.fragment.rendered&&(i=n._children[r].instance.find(t,e)))return i}function Qt(t,e){if(void 0===e&&(e={}),!this.el)throw new Error("Cannot call ractive.findAll('"+t+"', ...) unless instance is rendered to the DOM");return oa(e.result)||(e.result=[]),this.fragment.findAll(t,e),e.remote&&this._children.forEach(function(n){!n.target&&n.instance.fragment&&n.instance.fragment.rendered&&n.instance.findAll(t,e)}),e.result}function Jt(t,e){return!e&&o(t)&&(e=t,t=""),e=e||{},oa(e.result)||(e.result=[]),this.fragment.findAllComponents(t,e),e.remote&&this._children.forEach(function(n){!n.target&&n.instance.fragment&&n.instance.fragment.rendered&&(t&&n.name!==t||e.result.push(n.instance),n.instance.findAllComponents(t,e))}),e.result}function Xt(t,e){var n=this;void 0===e&&(e={}),o(t)&&(e=t,t="");var i=this.fragment.findComponent(t,e);if(i)return i;if(e.remote){if(!t&&this._children.length)return this._children[0].instance;for(var r=0;r<this._children.length;r++)if(!n._children[r].target){if(n._children[r].name===t)return n._children[r].instance;if(i=n._children[r].instance.findComponent(t,e))return i}}}function te(t){return this.container?this.container.component&&this.container.component.name===t?this.container:this.container.findContainer(t):null}function ee(t){return this.parent?this.parent.component&&this.parent.component.name===t?this.parent:this.parent.findParent(t):null}function ne(t,e,n){for(void 0===e&&(e=!0);t&&(t.type!==Bo||n&&t.name!==n)&&(!e||t.type!==Uo&&t.type!==Lo);)t=t.owner?t.owner:t.component?t.containerFragment||t.component.up:t.parent?t.parent:t.up?t.up:void 0;return t}function ie(t,e,n){var i=[],r=re(t,e,n);if(!r)return null;var s=r.length-2-r[1],a=Math.min(t,r[0]),o=a+r[1];i.startIndex=a;var u;for(u=0;a>u;u+=1)i.push(u);for(;o>u;u+=1)i.push(-1);for(;t>u;u+=1)i.push(u+s);return 0!==s?i.touchedFrom=r[0]:i.touchedFrom=t,i}function re(t,e,n){switch(e){case"splice":for(void 0!==n[0]&&n[0]<0&&(n[0]=t+Math.max(n[0],-t)),void 0===n[0]&&(n[0]=0);n.length<2;)n.push(t-n[0]);return l(n[1])||(n[1]=t-n[0]),n[1]=Math.min(n[1],t-n[0]),n;case"sort":case"reverse":return null;case"pop":return t?[t-1,1]:[0,0];case"push":return[t,0].concat(n);case"shift":return[0,t?1:0];case"unshift":return[0,0].concat(n)}}function se(t,e,n){e.parent&&e.parent.wrapper&&e.parent.adapt();var i=no.start();return e.mark(n&&n.force),e.notifyUpstream(),no.end(),Eu.fire(t,e),i}function ae(t,e){var n,i;return h(t)?(i=k(t),n=e):n=t,se(this,i?this.viewmodel.joinAll(i):this.viewmodel,n)}function oe(e,n,i){var r=[];if(s(n))for(var a in n)t(n,a)&&r.push([ue(e,a).model,n[a]]);else r.push([ue(e,n).model,i]);return r}function ue(t,e){var n=t.fragment;return h(e)?{model:bt(n,e),instance:n.ractive}:{model:n.findContext(),instance:e}}function he(t,e){return t.attributes&&t.attributes.find(function(t){return t.template.t===gu&&~t.template.n.indexOf(e)})}function le(t){for(var e=[],n=arguments.length-1;n-->0;)e[n]=arguments[n+1];var i;if(e[0]instanceof Pu){var r=e.shift();i=na(r),ea(i,r)}else i=!o(e[0])||null!==e[0]&&e[0].constructor!==Object?Pu.forRactive(this):Pu.forRactive(this,e.shift());return Kt(this,t,i,e)}function ce(t,e){if(!h(t))return this.viewmodel.get(!0,t);var n,i=k(t),r=i[0];return this.viewmodel.has(r)||this.component&&!this.isolated&&(n=bt(this.fragment||new vo(this),r)),n=this.viewmodel.joinAll(i),n.get(!0,e)}function de(t){h(t)&&qu&&(t=qu.call(document,t));var e;if(t){if(t._ractive)return t._ractive.proxy.getContext();if((e=t.__ractive_instances__)&&1===e.length)return xt(e[0])}}function fe(t){return g("getNodeInfo has been renamed to getContext, and the getNodeInfo alias will be removed in a future release."),de(t)}function pe(t,e){return h(t)&&(t=this.find(t,e)),de(t)}function me(t,e){return h(t)&&(t=this.find(t,e)),fe(t)}function ve(){return ka.createDocumentFragment()}function ge(t){var e;if(t&&"boolean"!=typeof t){if(!_a||!ka||!t)return null;if(t.nodeType)return t;if(h(t)){if(e=ka.getElementById(t),!e&&ka.querySelector)try{e=ka.querySelector(t)}catch(n){}if(e&&e.nodeType)return e}return t[0]&&t[0].nodeType?t[0]:null}}function ye(t){return t&&"unknown"!=typeof t.parentNode&&t.parentNode&&t.parentNode.removeChild(t),t}function be(t){return null==t||l(t)&&isNaN(t)||!t.toString?"":""+t}function we(t){return be(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function xe(t,e){if(!this.fragment.rendered)throw new Error("The API has changed - you must call `ractive.render(target[, anchor])` to render your Ractive instance. Once rendered you can use `ractive.insert()`.");if(t=ge(t),e=ge(e)||null,!t)throw new Error("You must specify a valid target to insert into");t.insertBefore(this.detach(),e),this.el=t,(t.__ractive_instances__||(t.__ractive_instances__=[])).push(this),this.isDetached=!1,_e(this)}function _e(t){Xu.fire(t),t.findAllComponents("*").forEach(function(t){_e(t.instance)})}function ke(t,e,n){var i,r=n&&(n.ractive||n.instance)||this,s=k(t);!r.viewmodel.has(s[0])&&r.component&&(i=bt(r.component.up,s[0]),i=i.joinAll(s.slice(1)));var a=i||r.viewmodel.joinAll(s),o=this.viewmodel.joinAll(k(e),{lastLink:!1});if(Ee(a,o)||Ee(o,a))throw new Error("A keypath cannot be linked to itself.");var u=no.start();return o.link(a,n&&n.keypath||t),no.end(),u}function Ee(t,e){for(var n=e;n;){if(n===t||n.owner===t)return!0;n=n.target||n.parent}}function Ae(t,e){var n=e&&t.model?t.model.get():t.newValue;t.oldValue=t.oldFn?t.oldFn.call(t.oldContext,void 0,n,t.keypath):n}function Ce(t,e,n){var i=t.oldValues;t.oldFn?(n||(t.oldValues={}),sa(e).forEach(function(n){var r=[i[n],e[n],n],s=t.pattern.exec(n);s&&r.push.apply(r,s.slice(1)),t.oldValues[n]=t.oldFn.apply(t.oldContext,r)})):n?sa(e).forEach(function(t){return i[t]=e[t]}):t.oldValues=e}function Se(){return-1}function Oe(t,e,n){var i,r,a=this,o=[];s(t)?(i=t,r=e||{}):u(t)?(i={"":t},r=e||{}):(i={},i[t]=e,r=n||{});var h=!1;return sa(i).forEach(function(t){var e=i[t],n=function(){for(var t=[],n=arguments.length;n--;)t[n]=arguments[n];return h?void 0:e.apply(this,t)},s=t.split(" ");s.length>1&&(s=s.filter(function(t){return t})),s.forEach(function(t){r.keypath=t;var e=je(a,t,n,r);e&&o.push(e)})}),this._observers.push.apply(this._observers,o),{cancel:function(){return o.forEach(function(t){return t.cancel()})},isSilenced:function(){return h},silence:function(){return h=!0},resume:function(){return h=!1}}}function je(t,e,n,i){var r=k(e),s=r.indexOf("*");~s||(s=r.indexOf("**")),i.fragment=i.fragment||t.fragment;var a;if(i.fragment?~r[0].indexOf(".*")?(a=i.fragment.findContext(),s=0,r[0]=r[0].slice(1)):a=0===s?i.fragment.findContext():bt(i.fragment,r[0]):a=t.viewmodel.joinKey(r[0]),a||(a=t.viewmodel.joinKey(r[0])),~s){var o=r.indexOf("**");return~o&&(o+1!==r.length||~r.indexOf("*"))?void g("Recursive observers may only specify a single '**' at the end of the path."):(a=a.joinAll(r.slice(1,s)),new ih(t,a,r.slice(s),n,i))}return a=a.joinAll(r.slice(1)),i.array?new sh(t,a,n,i):new th(t,a,n,i)}function Ne(t,e,n){return s(t)||u(t)?(n=ea(e||{},oh),this.observe(t,n)):(n=ea(n||{},oh),this.observe(t,e,n))}function Te(t,e){var n=this;if(t){var i=t.split(" ").map(uh).filter(hh);i.forEach(function(t){var i=n._subs[t];if(i&&e){var r=i.find(function(t){return t.callback===e});r&&(N(i,r),r.off=!0,t.indexOf(".")&&n._nsSubs--)}else i&&(t.indexOf(".")&&(n._nsSubs-=i.length),i.length=0)})}else this._subs={};return this}function Ve(e,n){var i=this,r=o(e)?e:{};h(e)&&(r[e]=n);var s=!1,a=[],u=function(e){var n=r[e],o=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return s?void 0:n.apply(this,t)},u={callback:n,handler:o};if(t(r,e)){var h=e.split(" ").map(uh).filter(hh);h.forEach(function(t){(i._subs[t]||(i._subs[t]=[])).push(u),t.indexOf(".")&&i._nsSubs++,a.push([t,u])})}};for(var l in r)u(l);return{cancel:function(){return a.forEach(function(t){return i.off(t[0],t[1].callback)})},isSilenced:function(){return s},silence:function(){return s=!0},resume:function(){return s=!1}}}function Pe(t,e){var n=this.on(t,function(){e.apply(this,arguments),n.cancel()});return n}function Ie(t,e){void 0===e&&(e={});var n=k(t);if(this.viewmodel.has(n[0])){var i=this.viewmodel.joinAll(n);if(!i.isLink)return;for(;(i=i.target)&&e.canonical!==!1&&i.isLink;);if(i)return{ractive:i.root.ractive,keypath:i.getKeypath()}}}function Me(t){fh.push(t),ph=!0}function Be(t){var e=Ke();e&&(t||ph)&&(vh?e.styleSheet.cssText=Re(null):e.innerHTML=Re(null),ph=!1)}function Re(t){var e=t?fh.filter(function(e){return~t.indexOf(e.id)}):fh;return e.forEach(function(t){return t.applied=!0}),e.reduce(function(t,e){return""+(t?t+"\n\n/* {"+e.id+"} */\n"+e.styles:"")},dh)}function Ke(){return ka&&!mh&&(mh=ka.createElement("style"),mh.type="text/css",mh.setAttribute("data-ractive-css",""),ka.getElementsByTagName("head")[0].appendChild(mh),vh=!!mh.styleSheet),mh}function De(t){return t.trim()}function Le(t){return t.str}function Fe(t,e){for(var n,i=[];n=Eh.exec(t);)i.push({str:n[0],base:n[1],modifiers:n[2]});for(var r=i.map(Le),s=[],a=i.length;a--;){var o=r.slice(),u=i[a];o[a]=u.base+e+u.modifiers||"";var h=r.slice();h[a]=e+" "+h[a],s.push(o.join(" "),h.join(" "))}return s.join(", ")}function ze(t,e){var n,i='[data-ractive-css~="{'+e+'}"]';return n=Ch.test(t)?t.replace(Ch,i):xh(t,function(t,e){return t=t.replace(_h,function(t,e){if(Ah.test(e))return t;var n=e.split(",").map(De),r=n.map(function(t){return Fe(t,i)}).join(", ")+" ";return t.replace(e,r)}),e(t)},[kh])}function Ue(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}function $e(){return Ue()+Ue()+"-"+Ue()+"-"+Ue()+"-"+Ue()+"-"+Ue()+Ue()+Ue()}function qe(t,e,n){var i=o(t)?e:n,r=this._cssModel;r.locked=!0;var s=Et(Ct({viewmodel:r},t,e,!0),i);r.locked=!1;var a=no.start();return this.extensions.forEach(function(t){var e=t._cssModel;e.mark(),e.downstreamChanged("",1)}),no.end(),He(this,!i||i.apply!==!1),s.then(function(){return a})}function He(t,e){var n=Ze(t),i=t.extensions.map(function(t){return He(t,!1)}).reduce(function(t,e){return e||t},!1);if(e&&(n||i)){var r=t._cssDef;(!r||r&&r.applied)&&Be(!0)}return n||i}function Ze(t){var e=t._css;if(u(e)){var n=t._cssDef,i=Ge(t,e),r=n.transform?ze(i,n.id):i;if(n.styles!==r)return n.styles=r,!0}}function We(t){for(var e=t,n=[];e;)e.prototype.cssId&&n.push(e.prototype.cssId),e=e.Parent;return n}function Ge(t,e){var n=t.cssData,i=t._cssModel,r=function(t){return i.joinAll(k(t)).get()};r.__proto__=n;var s=e.call(t,r);return h(s)?s:""}function Ye(t,e,n){var i=h(t.css)&&!Oh.test(t.css)?ge(t.css)||t.css:t.css,r=t.cssId||$e();o(i)?i="textContent"in i?i.textContent:i.innerHTML:u(i)&&(e._css=t.css,i=Ge(e,i));var s=e._cssDef={transform:!t.noCssTransform};s.styles=s.transform?ze(i,r):i,s.id=n.cssId=r,e._cssIds.push(r),Me(e._cssDef)}function Qe(t){t&&t.constructor!==Object&&(u(t)||(o(t)?v("If supplied, options.data should be a plain JavaScript object - using a non-POJO as the root object may work, but is discouraged"):d("data option must be an object or a function, `"+t+"` is not valid")))}function Je(){return{}}function Xe(t,e){Qe(e);var n=u(t);e||n||(e=Je);var i=u(e);return n||i?function(){var r=i?tn(e,this):e,s=n?tn(t,this):t;return en(r,s)}:en(e,t)}function tn(t,e){var n=t.call(e);if(n)return o(n)||d("Data function must return an object"),n.constructor!==Object&&g("Data function returned something other than a plain JavaScript object. This might work, but is strongly discouraged"),n}function en(t,e){if(t&&e){for(var n in e)n in t||(t[n]=e[n]);return t}return t||e}function nn(t,e){void 0===e&&(e=0);for(var n=new Array(e);e--;)n[e]="_"+e;return new Function([],"return function ("+n.join(",")+"){return("+t+");};")()}function rn(t,e){var n,i="return ("+t.replace(Vh,function(t,e){return n=!0,'__ractive.get("'+e+'")'})+");";n&&(i="var __ractive = this; "+i);var r=new Function(i);return n?r.bind(e):r}function sn(t){if(!t.matchString("="))return null;var e=t.pos;t.sp();var n=t.matchPattern(Rh);if(!n)return t.pos=e,null;if(!t.matchPattern(Kh))return null;var i=t.matchPattern(Rh);return i?(t.sp(),t.matchString("=")?[n,i]:(t.pos=e,null)):(t.pos=e,null)}function an(t){var e;return(e=t.matchPattern(Dh))?{t:Xo,v:e}:null}function on(t){return t.replace(Lh,"\\$&")}function un(t){return t.replace(Zh,function(t,e){var n;return n="#"!==e[0]?qh[e]:"x"===e[1]?parseInt(e.substring(2),16):parseInt(e.substring(1),10),n?Gh(ln(n)):t})}function hn(t){return t.replace(Jh,"&amp;").replace(Yh,"&lt;").replace(Qh,"&gt;")}function ln(t){return t?10===t?32:128>t?t:159>=t?Hh[t-128]:55296>t?t:57343>=t?Xh:65535>=t?t:Wh?t>=65536&&131071>=t?t:t>=131072&&196607>=t?t:Xh:Xh:Xh}function cn(t){var e;return(e=t.matchPattern(nl))?{t:Wo,v:e}:null}function dn(t){var e=t.remaining();return"true"===e.substr(0,4)?(t.pos+=4,{t:Jo,v:"true"}):"false"===e.substr(0,5)?(t.pos+=5,{t:Jo,v:"false"}):null}function fn(t){return JSON.parse('"'+t.replace(cl,pn)+'"')}function pn(t){switch(t){case"\n":return"\\n";case"\r":return"\\r";case"	":return"\\t";case"\b":return"\\b";case"\f":return"\\f"}}function mn(t){if(!t.matchString("`"))return null;for(var e,n="",i=!1,r=[];!i;)if(e=t.matchPattern(ll)||t.matchPattern(rl)||t.matchString("$")||t.matchString('"'))if('"'===e)n+='\\"';else if("\\`"===e)n+="`";else if("$"===e)if(t.matchString("{")){r.push({t:Go,v:fn(n)}),n="",t.sp();var s=En(t);s||t.error("Expected valid expression"),r.push({t:au,x:s}),t.sp(),t.matchString("}")||t.error("Expected closing '}' after interpolated expression")}else n+="$";else n+=e;else e=t.matchPattern(sl),e?n+="\\u"+("000"+e.charCodeAt(1).toString(16)).slice(-4):i=!0;if(n.length&&r.push({t:Go,v:fn(n)}),t.matchString("`")||t.error("Expected closing '`'"),1===r.length)return r[0];for(var a,o=r.pop();a=r.pop();)o={t:uu,s:"+",o:[a,o]};return{t:au,x:o}}function vn(t){var e;return(e=hl(t))?vl.test(e.v)?e.v:'"'+e.v.replace(/"/g,'\\"')+'"':(e=cn(t))?e.v:(e=t.matchPattern(dl))?e:null}function gn(t){var e,n=t.pos;t.sp();var i="'"!==t.nextChar()&&'"'!==t.nextChar();i&&(e=t.matchPattern(fl));var r=e?En(t):vn(t);if(null===r)return t.pos=n,null;if(t.sp(),i&&(","===t.nextChar()||"}"===t.nextChar())){e||dl.test(r)||t.error("Expected a valid reference, but found '"+r+"' instead.");var s={t:eu,k:r,v:{t:nu,n:r}};return e&&(s.p=!0),s}if(!t.matchString(":"))return t.pos=n,null;t.sp();var a=En(t);return null===a?(t.pos=n,null):{t:eu,k:r,v:a}}function yn(t){var e=t.pos,n=gn(t);if(null===n)return null;var i=[n];if(t.matchString(",")){var r=yn(t);return r?i.concat(r):(t.pos=e,null)}return i}function bn(t){return cn(t)||dn(t)||hl(t)||mn(t)||gl(t)||yl(t)||an(t)}function wn(t){var e,n,i,r,s,a=t.pos;e=t.matchPattern(xl)||"",n=!e&&t.relaxedNames&&t.matchPattern(ml)||t.matchPattern(pl);var o=e.length+(n&&n.length||0);if("@."===e&&(e="@",n=n?"this."+n:"this"),!n&&e&&(n=e,e=""),!n)return null;if("@"===e)if(_l.test(n))if(!~n.indexOf("event")&&!~n.indexOf("node")||t.inEvent){if(~n.indexOf("context"))return t.pos=t.pos-(n.length-7),{t:au,x:{t:nu,n:"@context"}}}else t.error("@event and @node are only valid references within an event directive");else t.error("Unrecognized special reference @"+n);if(!e&&!t.relaxedNames&&wl.test(n))return t.pos=a,null;if(!e&&bl.test(n))return i=bl.exec(n)[0],t.pos=a+i.length,{t:tu,v:i};if(r=(e||"")+_(n),t.matchString("("))if(s=r.lastIndexOf("."),-1!==s&&"]"!==n[n.length-1])if(0===s)r=".",t.pos=a;else{var u=r.length;r=r.substr(0,s),t.pos=a+(o-(u-s))}else t.pos-=1;return{t:nu,n:r.replace(/^this\./,"./").replace(/^this$/,".")}}function xn(t){if(!t.matchString("("))return null;t.sp();var e=En(t);return e||t.error(tl),t.sp(),t.matchString(")")||t.error(el),{t:au,x:e}}function _n(t){if(t.strictRefinement||t.sp(),t.matchString(".")){t.sp();var e=t.matchPattern(dl);if(e)return{t:iu,n:e};t.error("Expected a property name")}if(t.matchString("[")){t.sp();var n=En(t);return n||t.error(tl),t.sp(),t.matchString("]")||t.error("Expected ']'"),{t:iu,x:n}}return null}function kn(t){var e=jl(t);
if(!e)return null;var n=t.pos;if(t.sp(),!t.matchString("?"))return t.pos=n,e;t.sp();var i=En(t);i||t.error(tl),t.sp(),t.matchString(":")||t.error('Expected ":"'),t.sp();var r=En(t);return r||t.error(tl),{t:ou,o:[e,i,r]}}function En(t){if(t.allowExpressions===!1){var e=wn(t);return t.sp(),e}return kn(t)}function An(t,e){var n,i=[],r=t.pos;do{t.sp(),e&&(n=t.matchPattern(fl));var s=En(t);if(null===s&&i.length)t.error(tl);else if(null===s)return t.pos=r,null;n&&(s.p=!0),i.push(s),t.sp()}while(t.matchString(","));return i}function Cn(t,e){var n=t.pos,i=En(t);if(!i){var r=t.matchPattern(/^(\w+)/);return r?{t:nu,n:r}:null}for(var s=0;s<e.length;s+=1)if(t.remaining().substr(0,e[s].length)===e[s])return i;return t.pos=n,wn(t)}function Sn(t){function e(t){for(var e=[],n=a-1;n>=0;n--)e.push("x$"+n);return e.length?"(function(){var "+e.join(",")+";return("+t+");})()":t}function n(t){if(h(t))return t;switch(t.t){case Jo:case tu:case Wo:case Xo:return t.v;case Go:return JSON.stringify(String(t.v));case Yo:return t.m&&On(t.m)?"[].concat("+r(t.m,"[","]",n)+")":"["+(t.m?t.m.map(n).join(","):"")+"]";case Qo:return t.m&&On(t.m)?"Object.assign({},"+r(t.m,"{","}",i)+")":"{"+(t.m?t.m.map(function(t){return t.k+":"+n(t.v)}).join(","):"")+"}";case su:return("typeof"===t.s?"typeof ":t.s)+n(t.o);case uu:return n(t.o[0])+("in"===t.s.substr(0,2)?" "+t.s+" ":t.s)+n(t.o[1]);case hu:if(t.o&&On(t.o)){var e=a++;return"(x$"+e+"="+n(t.x)+").apply(x$"+e+","+n({t:Yo,m:t.o})+")"}return n(t.x)+"("+(t.o?t.o.map(n).join(","):"")+")";case au:return"("+n(t.x)+")";case ru:return n(t.x)+n(t.r);case iu:return t.n?"."+t.n:"["+n(t.x)+"]";case ou:return n(t.o[0])+"?"+n(t.o[1])+":"+n(t.o[2]);case nu:return"_"+s.indexOf(t.n);default:throw new Error("Expected legal JavaScript")}}function i(t){return t.p?n(t.k):t.k+":"+n(t.v)}function r(t,e,n,i){var r=t.reduce(function(t,r){return r.p?t.str+=""+(t.open?n+",":t.str.length?",":"")+i(r):t.str+=""+(t.str.length?t.open?",":","+e:e)+i(r),t.open=!r.p,t},{open:!1,str:""});return r.open&&(r.str+=n),r.str}var s,a=0;jn(t,s=[]);var o=n(t);return{r:s,s:e(o)}}function On(t){for(var e=0;e<t.length;e++)if(t[e].p)return!0;return!1}function jn(t,e){t.t===nu&&h(t.n)&&(~e.indexOf(t.n)||e.unshift(t.n));var n=t.o||t.m;if(n)if(s(n))jn(n,e);else for(var i=n.length;i--;)jn(n[i],e);t.k&&t.t===eu&&!h(t.k)&&jn(t.k,e),t.x&&jn(t.x,e),t.r&&jn(t.r,e),t.v&&jn(t.v,e)}function Nn(t,e){var n;if(t){for(;t.t===au&&t.x;)t=t.x;if(t.t===nu){var i=t.n;~i.indexOf("@context")?e.x=Sn(t):e.r=t.n}else(n=Tn(t))?e.rx=n:e.x=Sn(t);return e}}function Tn(t){for(var e,n=[];t.t===ru&&t.r.t===iu;)e=t.r,e.x?e.x.t===nu?n.unshift(e.x):n.unshift(Sn(e.x)):n.unshift(e.n),t=t.x;return t.t!==nu?null:{r:t.n,m:n}}function Vn(t){for(var e=[],n=0,i=0;i<t.length;i++)"-"===t[i]&&"\\"!==t[i-1]&&(e.push(t.substring(n,i).replace(Fl,"")),n=i+1);return e.push(t.substring(n).replace(Fl,"")),e}function Pn(t){var e,n,i,r;if(t.sp(),e=t.matchPattern(Nl),!e)return null;for(i=e.length,n=0;n<t.tags.length;n++)~(r=e.indexOf(t.tags[n].open))&&i>r&&(i=r);return i<e.length&&(t.pos-=e.length-i,e=e.substr(0,i),!e)?null:{n:e}}function In(t){var e=t.pos;if(/[=\/>\s]/.test(t.nextChar())||t.error("Expected `=`, `/`, `>` or whitespace"),t.sp(),!t.matchString("="))return t.pos=e,null;t.sp();var n=t.pos,i=t.sectionDepth,r=Rn(t,"'")||Rn(t,'"')||Bn(t);return null===r&&t.error("Expected valid attribute value"),t.sectionDepth!==i&&(t.pos=n,t.error("An attribute value must contain as many opening section tags as closing section tags")),r.length?1===r.length&&h(r[0])?un(r[0]):r:""}function Mn(t){var e,n,i=t.pos;if(e=t.matchPattern(Kl),!e)return null;var r=e,s=t.tags.map(function(t){return t.open});return-1!==(n=zh(r,s))&&(e=e.substr(0,n),t.pos=i+e.length),e}function Bn(t){t.inAttribute=!0;for(var e=[],n=zn(t)||Mn(t);n;)e.push(n),n=zn(t)||Mn(t);return e.length?(t.inAttribute=!1,e):null}function Rn(t,e){var n=t.pos;if(!t.matchString(e))return null;t.inAttribute=e;for(var i=[],r=zn(t)||Kn(t,e);null!==r;)i.push(r),r=zn(t)||Kn(t,e);return t.matchString(e)?(t.inAttribute=!1,i):(t.pos=n,null)}function Kn(t,e){var n=t.remaining(),i=t.tags.map(function(t){return t.open});i.push(e);var r=zh(n,i);return-1===r&&t.error("Quoted attribute value must have a closing quote"),r?(t.pos+=r,n.substr(0,r)):null}function Dn(t){var e,n,i=Pn(t,!1);if(!i)return null;if(n=Rl[i.n])i.t=n.t,n.v&&(i.v=n.v),delete i.n,t.sp(),"="===t.nextChar()&&(i.f=In(t));else if(e=Il.exec(i.n))i.n=e[1],i.t=yu,Fn(t,i);else if(e=Ml.exec(i.n))i.n=e[1],i.t=bu,Fn(t,i),i.v="in-out"===e[2]?"t0":"in"===e[2]?"t1":"t2";else if(e=Vl.exec(i.n))i.n=Vn(e[1]),i.t=gu,t.inEvent=!0,Ln(t,i)?Pl.test(i.f)&&(t.pos-=i.f.length,t.error("Cannot use reserved event names (change, reset, teardown, update, construct, config, init, render, unrender, complete, detach, insert, destruct, attachchild, detachchild)")):Fn(t,i,!0),t.inEvent=!1;else if(e=Bl.exec(i.n)){var r="bind"===e[2];i.n=r?e[3]:e[1],i.t=Fo,Fn(t,i,!1,!0),!i.f&&r&&(i.f=[{t:To,r:e[3]}])}else{t.sp();var s="="===t.nextChar()?In(t):null;if(i.f=null!=s?s:i.f,t.sanitizeEventAttributes&&Tl.test(i.n))return{exclude:!0};i.f=i.f||(""===i.f?"":0),i.t=Fo}return i}function Ln(t,e){var n=t.pos;t.matchString("=")||t.error("Missing required directive arguments");var i=t.matchString("'")||t.matchString('"');t.sp();var r=t.matchPattern(Dl);if(void 0!==r)if(i){if(t.sp(),t.matchString(i))return(e.f=r)||!0;t.pos=n}else{if(t.matchPattern(Ll))return(e.f=r)||!0;t.pos=n}else t.pos=n}function Fn(t,e,n,i){if(void 0===n&&(n=!1),void 0===i&&(i=!1),t.sp(),!t.matchString("="))return void(n&&t.error("Missing required directive arguments"));t.sp();var r=t.matchString('"')||t.matchString("'"),s=t.spreadArgs;t.spreadArgs=!0,t.inUnquotedAttribute=!r;var a=i?Cn(t,[r||" ","/",">"]):{m:An(t),t:Yo};if(t.inUnquotedAttribute=!1,t.spreadArgs=s,r&&(t.sp(),t.matchString(r)!==r&&t.error("Expected matching quote '"+r+"'")),i){var o={t:To};Nn(a,o),e.f=[o]}else e.f=Sn(a)}function zn(t){var e,n;if(t.interpolate[t.inside]===!1)return null;for(n=0;n<t.tags.length;n+=1)if(e=Un(t,t.tags[n]))return e;return t.inTag&&!t.inAttribute&&(e=Dn(t))?(t.sp(),e):void 0}function Un(t,e){var n,i,r,s=t.pos;if(t.matchString("\\"+e.open)){if(0===s||"\\"!==t.str[s-1])return e.open}else if(!t.matchString(e.open))return null;if(n=sn(t))return t.matchString(e.close)?(e.open=n[0],e.close=n[1],t.sortMustacheTags(),zl):null;if(t.sp(),t.matchString("/")){t.pos-=1;var a=t.pos;if(an(t))t.pos=a;else{if(t.pos=a-e.close.length,t.inAttribute)return t.pos=s,null;t.error("Attempted to close a section that wasn't open")}}for(r=0;r<e.readers.length;r+=1)if(i=e.readers[r],n=i(t,e))return e.isStatic&&(n.s=1),t.includeLinePositions&&(n.p=t.getLinePos(s)),n;return t.pos=s,null}function $n(t,e){var n=En(t);if(!n)return null;t.matchString(e.close)||t.error("Expected closing delimiter '"+e.close+"'");var i={t:Vo};return Nn(n,i),i}function qn(t,e){if(!t.matchString("&"))return null;t.sp();var n=En(t);if(!n)return null;t.matchString(e.close)||t.error("Expected closing delimiter '"+e.close+"'");var i={t:Vo};return Nn(n,i),i}function Hn(t){var e,n=[],i=t.pos;if(t.sp(),e=Zn(t)){for(e.x=Nn(e.x,{}),n.push(e),t.sp();t.matchString(",");)e=Zn(t),e||t.error("Expected another alias."),e.x=Nn(e.x,{}),n.push(e),t.sp();return n}return t.pos=i,null}function Zn(t){var e=t.pos;t.sp();var n=En(t,[]);if(!n)return t.pos=e,null;if(t.sp(),!t.matchPattern($l))return t.pos=e,null;t.sp();var i=t.matchPattern(Ul);return i||t.error("Expected a legal alias name."),{n:i,x:n}}function Wn(t,e){var n,i=t.matchString(">")||t.matchString("yield"),r={t:">"===i?Ro:$o};if(!i)return null;if(t.sp(),">"===i||!(n=t.matchString("with"))){t.relaxedNames=t.strictRefinement=!0;var s=En(t);if(t.relaxedNames=t.strictRefinement=!1,!s&&">"===i)return null;s&&(Nn(s,r),t.sp(),">"!==i&&(n=t.matchString("with")))}if(t.sp(),n||">"===i)if(n=Hn(t),n&&n.length)r.z=n;else if(">"===i){var a=En(t);a&&(r.c={},Nn(a,r.c))}else t.error("Expected one or more aliases");return t.sp(),t.matchString(e.close)||t.error("Expected closing delimiter '"+e.close+"'"),r}function Gn(t,e){if(!t.matchString("!"))return null;var n=t.remaining().indexOf(e.close);return-1!==n?(t.pos+=n+e.close.length,{t:Ko}):void 0}function Yn(t,e){var n,i,r=t.pos;try{n=Cn(t,[e.close])}catch(s){i=s}if(!n){if("!"===t.str.charAt(r))return t.pos=r,null;if(i)throw i}if(!t.matchString(e.close)&&(t.error("Expected closing delimiter '"+e.close+"' after reference"),!n)){if("!"===t.nextChar())return null;t.error("Expected expression or legal reference")}var a={t:To};return Nn(n,a),a}function Qn(t,e){var n=t.pos;if(!t.matchString(e.open))return null;if(t.sp(),!t.matchString("/"))return t.pos=n,null;t.sp();var i=t.remaining(),r=i.indexOf(e.close);if(-1!==r){var s={t:Mo,r:i.substr(0,r).split(" ")[0]};return t.pos+=r,t.matchString(e.close)||t.error("Expected closing delimiter '"+e.close+"'"),s}return t.pos=n,null}function Jn(t,e){var n=t.pos;return t.matchString(e.open)?t.matchPattern(ql)?(t.matchString(e.close)||t.error("Expected closing delimiter '"+e.close+"'"),{t:mu}):(t.pos=n,null):null}function Xn(t,e){var n=t.pos;if(!t.matchString(e.open))return null;if(!t.matchPattern(Hl))return t.pos=n,null;var i=En(t);return t.matchString(e.close)||t.error("Expected closing delimiter '"+e.close+"'"),{t:vu,x:i}}function ti(t,e){var n,i,r,s,a,o,u,h,l,c,d=!1,f=t.pos;if(t.matchString("^")){if(t.matchString("^/"))return t.pos=f,null;i={t:Po,f:[],n:cu}}else{if(!t.matchString("#"))return null;i={t:Po,f:[]},t.matchString("partial")&&(t.pos=f-t.standardDelimiters[0].length,t.error("Partial definitions can only be at the top level of the template, or immediately inside components")),(o=t.matchPattern(Yl))&&(c=o,i.n=Zl[o])}if(t.sp(),"with"===o){var p=Hn(t);p&&(d=!0,i.z=p,i.t=Zo)}else if("each"===o){var m=Zn(t);m&&(i.z=[{n:m.n,x:{r:"."}}],n=m.x)}if(!d){if(n||(n=En(t)),n||t.error("Expected expression"),l=t.matchPattern(Wl)){var v;(v=t.matchPattern(Gl))?i.i=l+","+v:i.i=l}!o&&n.n&&(c=n.n)}t.sp(),t.matchString(e.close)||t.error("Expected closing delimiter '"+e.close+"'"),t.sectionDepth+=1,s=i.f;var g;do if(g=t.pos,r=Qn(t,e))c&&r.r!==c&&(o?(t.pos=g,t.error("Expected "+e.open+"/"+c+e.close)):r.r&&t.warn("Expected "+e.open+"/"+c+e.close+" but found "+e.open+"/"+r.r+e.close)),t.sectionDepth-=1,h=!0;else if(!d&&(r=Xn(t,e))){i.n===cu&&t.error("{{else}} not allowed in {{#unless}}"),a&&t.error("illegal {{elseif...}} after {{else}}"),u||(u=[]);var y={t:Po,n:lu,f:s=[]};Nn(r.x,y),u.push(y)}else if(!d&&(r=Jn(t,e)))i.n===cu&&t.error("{{else}} not allowed in {{#unless}}"),a&&t.error("there can only be one {{else}} block, at the end of a section"),a=!0,u||(u=[]),u.push({t:Po,n:cu,f:s=[]});else{if(r=t.read(bc),!r)break;s.push(r)}while(!h);return u&&(i.l=u),d||Nn(n,i),i.f.length||delete i.f,i}function ei(t){var e=t.pos;if(t.textOnlyMode||!t.matchString(Ql))return null;var n=t.remaining(),i=n.indexOf(Jl);-1===i&&t.error("Illegal HTML - expected closing comment sequence ('-->')");var r=n.substr(0,i);t.pos+=i+3;var s={t:Ko,c:r};return t.includeLinePositions&&(s.p=t.getLinePos(e)),s}function ni(t){return t.t===Ko||t.t===Do}function ii(t){return(t.t===Po||t.t===Io)&&t.f}function ri(t,e,n,i,r){if(!h(t)){var s,a,o,u,l,c,d;for(ec(t),s=t.length;s--;)a=t[s],a.exclude?t.splice(s,1):e&&a.t===Ko&&t.splice(s,1);for(nc(t,i?sc:null,r?ac:null),s=t.length;s--;){if(a=t[s],a.f){var f=a.t===Bo&&rc.test(a.e);l=n||f,!n&&f&&nc(a.f,oc,uc),l||(o=t[s-1],u=t[s+1],(!o||h(o)&&ac.test(o))&&(c=!0),(!u||h(u)&&sc.test(u))&&(d=!0)),ri(a.f,e,l,c,d)}a.l&&(ri(a.l,e,n,c,d),a.l.forEach(function(t){return t.l=1}),a.l.unshift(s+1,0),t.splice.apply(t,a.l),delete a.l),a.m&&(ri(a.m,e,n,c,d),a.m.length<1&&delete a.m)}for(s=t.length;s--;)h(t[s])&&(h(t[s+1])&&(t[s]=t[s]+t[s+1],t.splice(s+1,1)),n||(t[s]=t[s].replace(ic," ")),""===t[s]&&t.splice(s,1))}}function si(t){var e,n=t.pos;return t.matchString("</")?(e=t.matchPattern(hc))?t.inside&&e!==t.inside?(t.pos=n,null):{t:zo,e:e}:(t.pos-=2,void t.error("Illegal closing tag")):null}function ai(t){var e,n,i,r,s,a,o,u,h,l,c,d=t.pos;if(t.inside||t.inAttribute||t.textOnlyMode)return null;if(!t.matchString("<"))return null;if("/"===t.nextChar())return null;var f={};if(t.includeLinePositions&&(f.p=t.getLinePos(d)),t.matchString("!"))return f.t=Ho,t.matchPattern(/^doctype/i)||t.error("Expected DOCTYPE declaration"),f.a=t.matchPattern(/^(.+?)>/),f;if(c=t.matchString("#"))t.sp(),f.t=Lo,f.n=t.matchPattern(cc);else if(f.t=Bo,f.e=t.matchPattern(lc),!f.e)return null;for(dc.test(t.nextChar())||t.error("Illegal tag name"),t.sp(),t.inTag=!0;e=zn(t);)e!==!1&&(f.m||(f.m=[]),f.m.push(e)),t.sp();if(t.inTag=!1,t.sp(),t.matchString("/")&&(n=!0),!t.matchString(">"))return null;var p=(f.e||f.n).toLowerCase(),m=t.preserveWhitespace;if(!n&&(c||!$h.test(f.e))){c||(t.elementStack.push(p),p in t.interpolate&&(t.inside=p)),i=[],r=na(null);do{if(u=t.pos,h=t.remaining(),!h){if("script"===t.inside){o=!0;break}t.error("Missing end "+(t.elementStack.length>1?"tags":"tag")+" ("+t.elementStack.reverse().map(function(t){return"</"+t+">"}).join("")+")")}if(c||oi(p,h))if(!c&&(l=si(t))){o=!0;var v=l.e.toLowerCase();if(v!==p&&(t.pos=u,!~t.elementStack.indexOf(v))){var g="Unexpected closing tag";$h.test(v)&&(g+=" (<"+v+"> is a void element - it cannot contain children)"),t.error(g)}}else if(c&&ui(t,f.n))o=!0;else{var y={open:t.standardDelimiters[0],close:t.standardDelimiters[1]},b=[Qn,Xn,Jn];b.some(function(e){return e(t,y)})?(o=!0,t.pos=u):(a=t.read(wc))?(r[a.n]&&(t.pos=u,t.error("Duplicate partial definition")),ri(a.f,t.stripComments,m,!m,!m),r[a.n]=a.f,s=!0):(a=t.read(bc))?i.push(a):o=!0}else o=!0}while(!o);i.length&&(f.f=i),s&&(f.p=r),t.elementStack.pop()}return t.inside=null,t.sanitizeElements&&-1!==t.sanitizeElements.indexOf(p)?fc:f}function oi(t,e){var n=/^<([a-zA-Z][a-zA-Z0-9]*)/.exec(e),i=pc[t];return n&&i?!~i.indexOf(n[1].toLowerCase()):!0}function ui(t,e){var n=t.pos;return t.matchString("</")?(t.matchString("#"),t.sp(),t.matchString(e)?(t.sp(),t.matchString(">")?!0:(t.pos=n,null)):(t.pos=n,null)):null}function hi(t){var e,n,i,r=t.remaining();return t.textOnlyMode?(n=t.tags.map(function(t){return t.open}),n=n.concat(t.tags.map(function(t){return"\\"+t.open})),e=zh(r,n)):(i=t.inside?"</"+t.inside:"<",t.inside&&!t.interpolate[t.inside]?e=r.indexOf(i):(n=t.tags.map(function(t){return t.open}),n=n.concat(t.tags.map(function(t){return"\\"+t.open})),t.inAttribute===!0?n.push('"',"'","=","<",">","`"):t.inAttribute?n.push(t.inAttribute):n.push(i),e=zh(r,n))),e?(-1===e&&(e=r.length),t.pos+=e,t.inside&&"textarea"!==t.inside||t.textOnlyMode?r.substr(0,e):un(r.substr(0,e))):null}function li(t){var e,n,i=t.pos,r=t.standardDelimiters;if(!t.matchString(r[0]))return null;if(!t.matchPattern(mc))return t.pos=i,null;var s=t.matchPattern(/^[a-zA-Z_$][a-zA-Z_$0-9\-\/]*/);s||t.error("expected legal partial name"),t.sp(),t.matchString(r[1])||t.error("Expected closing delimiter '"+r[1]+"'");var a=[],o=r[0],u=r[1];do(e=Qn(t,{open:o,close:u}))?("partial"!==e.r&&t.error("Expected "+o+"/partial"+u),n=!0):(e=t.read(bc),e||t.error("Expected "+o+"/partial"+u),a.push(e));while(!n);return{t:qo,n:s,f:a}}function ci(t){for(var e=[],n=na(null),i=!1,r=t.preserveWhitespace;t.pos<t.str.length;){var s=t.pos,a=void 0,o=void 0;(o=t.read(wc))?(n[o.n]&&(t.pos=s,t.error("Duplicated partial definition")),ri(o.f,t.stripComments,r,!r,!r),n[o.n]=o.f,i=!0):(a=t.read(bc))?e.push(a):t.error("Unexpected template content")}var u={v:Th,t:e};return i&&(u.p=n),u}function di(t,e){sa(t).forEach(function(n){if(fi(n,t))return pi(t,e);var i=t[n];mi(i)&&di(i,e)})}function fi(t,e){return"s"===t&&oa(e.r)}function pi(t,e){var n=t.s,i=t.r;e[n]||(e[n]=nn(n,i.length))}function mi(t){return oa(t)||s(t)}function vi(t,e){return new _c(t,e||{}).result}function gi(t,e,n){t||d("Missing Ractive.parse - cannot parse "+e+". "+n)}function yi(t,e){return gi(nn,"new expression function",Ec),nn(t,e)}function bi(t,e){return gi(rn,'compution string "${str}"',Ac),rn(t,e)}function wi(t,e){return Sc[t]?Sc[t]:Sc[t]=yi(t,e)}function xi(t){if(t){var e=t.e;e&&sa(e).forEach(function(t){Sc[t]||(Sc[t]=e[t])})}}function _i(t){var e=t._config.template;if(e&&e.fn){var n=ki(t,e.fn);return n!==e.result?(e.result=n,n):void 0}}function ki(t,e){return e.call(t,{fromId:Cc.fromId,isParsed:Cc.isParsed,parse:function(e,n){return void 0===n&&(n=Cc.getParseOptions(t)),Cc.parse(e,n)}})}function Ei(t,e){return h(t)?t=Ai(t,e):(Ci(t),xi(t)),t}function Ai(t,e){return"#"===t[0]&&(t=Cc.fromId(t)),Cc.parseFor(t,e)}function Ci(t){if(void 0==t)throw new Error("The template cannot be "+t+".");if(!l(t.v))throw new Error("The template parser was passed a non-string template, but the template doesn't have a version.  Make sure you're passing in the template you think you are.");if(t.v!==Th)throw new Error("Mismatched template version (expected "+Th+", got "+t.v+") Please ensure you are using the latest version of Ractive.js in your build process as well as in your app")}function Si(e,n,i){if(n)for(var r in n)(i||!t(e,r))&&(e[r]=n[r])}function Oi(t,e,n){function i(){var t=ji(i._parent,e),r="_super"in this,s=this._super;this._super=t;var a=n.apply(this,arguments);return r?this._super=s:delete this._super,a}return/_super/.test(n)?(i._parent=t,i._method=n,i):n}function ji(t,e){if(e in t){var n=t[e];return u(n)?n:function(){return n}}return Oa}function Ni(t,e,n){return"options."+t+" has been deprecated in favour of options."+e+"."+(n?" You cannot specify both options, please use options."+e+".":"")}function Ti(t,e,n){if(e in t){if(n in t)throw new Error(Ni(e,n,!0));v(Ni(e,n)),t[n]=t[e]}}function Vi(t){Ti(t,"beforeInit","onconstruct"),Ti(t,"init","onrender"),Ti(t,"complete","oncomplete"),Ti(t,"eventDefinitions","events"),oa(t.adaptors)&&Ti(t,"adaptors","adapt")}function Pi(e,n,i,r,s){Vi(r);for(var a in r)if(t(Bc,a)){var o=r[a];"el"!==a&&u(o)?v(a+" is a Ractive option that does not expect a function and will be ignored","init"===e?i:null):i[a]=o}if(r.append&&r.enhance)throw new Error("Cannot use append and enhance at the same time");Pc.forEach(function(t){t[e](n,i,r,s)}),gh[e](n,i,r,s),Oc[e](n,i,r,s),jh[e](n,i,r,s),Ii(n.prototype,i,r)}function Ii(e,n,i){for(var r in i)if(!Rc[r]&&t(i,r)){var s=i[r];u(s)&&(r in Np&&!Lc.test(s.toString())&&v("Overriding Ractive prototype function '"+r+"' without calling the '"+Lc+"' method can be very dangerous."),s=Oi(e,r,s)),n[r]=s}}function Mi(t){var e={};return t.forEach(function(t){return e[t]=!0}),e}function Bi(t,e){return e.r?bt(t,e.r):e.x?new Wc(t,e.x):e.rx?new Xc(t,e.rx):void 0}function Ri(t,e){for(var n={},i=0;i<t.length;i++)n[t[i].n]=Bi(e,t[i].x);for(var r in n)n[r].reference();return n}function Ki(t){return h(t)?xh(t,function(t,e){return t.split(";").filter(function(t){return!!t.trim()}).map(e).reduce(function(t,e){var n=e.indexOf(":"),i=e.substr(0,n).trim();return t[i]=e.substr(n+1).trim(),t},{})}):{}}function Di(t){for(var e=t.split(nd),n=e.length;n--;)e[n]||e.splice(n,1);return e}function Li(t){var e=t.element,n=t.name;if("value"===n){if(t.interpolator&&(t.interpolator.bound=!0),"select"===e.name&&"value"===n)return e.getAttribute("multiple")?Fi:zi;if("textarea"===e.name)return Hi;if(null!=e.getAttribute("contenteditable"))return Ui;if("input"===e.name){var i=e.getAttribute("type");if("file"===i)return Oa;if("radio"===i&&e.binding&&"name"===e.binding.attribute.name)return $i;if(~id.indexOf(i))return Hi}return qi}var r=e.node;if(t.isTwoway&&"name"===n){if("radio"===r.type)return Zi;if("checkbox"===r.type)return Wi}if("style"===n)return Gi;if(0===n.indexOf("style-"))return Yi;if("class"===n&&(!r.namespaceURI||r.namespaceURI===Hu))return Qi;if(0===n.indexOf("class-"))return Ji;if(t.isBoolean){var s=e.getAttribute("type");return!t.interpolator||"checked"!==n||"checkbox"!==s&&"radio"!==s||(t.interpolator.bound=!0),Xi}return t.namespace&&t.namespace!==t.node.namespaceURI?er:tr}function Fi(t){var e=this.getValue();oa(e)||(e=[e]);var n=this.node.options,i=n.length;if(t)for(;i--;)n[i].selected=!1;else for(;i--;){var r=n[i],s=r._ractive?r._ractive.value:r.value;r.selected=C(e,s)}}function zi(t){var e=this.getValue();if(!this.locked){this.node._ractive.value=e;var n=this.node.options,i=n.length,r=!1;if(t)for(;i--;)n[i].selected=!1;else for(;i--;){var s=n[i],a=s._ractive?s._ractive.value:s.value;if(s.disabled&&s.selected&&(r=!0),a==e)return void(s.selected=!0)}r||(this.node.selectedIndex=-1)}}function Ui(t){var e=this.getValue();this.locked||(t?this.node.innerHTML="":this.node.innerHTML=void 0===e?"":e)}function $i(t){var e=this.node,n=e.checked,i=this.getValue();return t?e.checked=!1:(e.value=this.node._ractive.value=i,e.checked=this.element.compare(i,this.element.getAttribute("name")),void(n&&!e.checked&&this.element.binding&&this.element.binding.rendered&&this.element.binding.group.model.set(this.element.binding.group.getValue())))}function qi(t){if(!this.locked)if(t)this.node.removeAttribute("value"),this.node.value=this.node._ractive.value=null;else{var e=this.getValue();this.node.value=this.node._ractive.value=e,this.node.setAttribute("value",be(e))}}function Hi(t){if(!this.locked)if(t)this.node._ractive.value="",this.node.removeAttribute("value");else{var e=this.getValue();this.node._ractive.value=e,this.node.value=be(e),this.node.setAttribute("value",be(e))}}function Zi(t){t?this.node.checked=!1:this.node.checked=this.element.compare(this.getValue(),this.element.binding.getValue())}function Wi(t){var e=this,n=e.element,i=e.node,r=n.binding,s=this.getValue(),a=n.getAttribute("value");if(oa(s)){for(var o=s.length;o--;)if(n.compare(a,s[o]))return void(r.isChecked=i.checked=!0);r.isChecked=i.checked=!1}else r.isChecked=i.checked=n.compare(s,a)}function Gi(t){for(var e=t?{}:Ki(this.getValue()||""),n=this.node.style,i=sa(e),r=this.previous||[],s=0;s<i.length;){if(i[s]in n){var a=e[i[s]].replace("!important","");n.setProperty(i[s],a,a.length!==e[i[s]].length?"important":"")}s++}for(s=r.length;s--;)!~i.indexOf(r[s])&&r[s]in n&&n.setProperty(r[s],"","");this.previous=i}function Yi(t){if(this.style||(this.style=ed(this.name.substr(6))),!t||this.node.style.getPropertyValue(this.style)===this.last){var e=t?"":be(this.getValue()),n=e.replace("!important","");this.node.style.setProperty(this.style,n,n.length!==e.length?"important":""),this.last=n}}function Qi(t){var e=t?[]:Di(be(this.getValue())),n=this.node.className;n=void 0!==n.baseVal?n.baseVal:n;var i=Di(n),r=this.previous||i.slice(0),s=e.concat(i.filter(function(t){return!~r.indexOf(t)})).join(" ");s!==n&&(h(this.node.className)?this.node.className=s:this.node.className.baseVal=s),this.previous=e}function Ji(t){var e=this.name.substr(6),n=this.node.className;n=void 0!==n.baseVal?n.baseVal:n;var i=Di(n),r=t?!1:this.getValue();this.inlineClass||(this.inlineClass=e),r&&!~i.indexOf(e)?i.push(e):!r&&~i.indexOf(e)&&i.splice(i.indexOf(e),1),h(this.node.className)?this.node.className=i.join(" "):this.node.className.baseVal=i.join(" ")}function Xi(t){if(!this.locked)if(t)this.useProperty&&(this.node[this.propertyName]=!1),this.node.removeAttribute(this.propertyName);else if(this.useProperty)this.node[this.propertyName]=this.getValue();else{var e=this.getValue();e?this.node.setAttribute(this.propertyName,h(e)?e:""):this.node.removeAttribute(this.propertyName)}}function tr(t){t?this.node.getAttribute(this.name)===this.value&&this.node.removeAttribute(this.name):(this.value=be(this.getString()),this.node.setAttribute(this.name,this.value))}function er(t){t?this.value===this.node.getAttributeNS(this.namespace,this.name.slice(this.name.indexOf(":")+1))&&this.node.removeAttributeNS(this.namespace,this.name.slice(this.name.indexOf(":")+1)):(this.value=be(this.getString()),this.node.setAttributeNS(this.namespace,this.name.slice(this.name.indexOf(":")+1),this.value))}function nr(){return ad}function ir(t,e){if(ud.test(t))return[];var n=e?"svg":"div";return t?(sd.innerHTML="<"+n+" "+t+"></"+n+">")&&V(sd.childNodes[0].attributes):[]}function rr(t,e){for(var n=t.length;n--;)if(t[n].name===e.name)return!1;return!0}function sr(t,e){for(var n="xmlns:"+e;t;){if(t.hasAttribute&&t.hasAttribute(n))return t.getAttribute(n);t=t.parentNode}return Ju[e]}function ar(){return hd}function or(t,e,n){0===e?t.value=!0:"true"===e?t.value=!0:"false"===e||"0"===e?t.value=!1:t.value=e;var i=t.element[t.flag];return t.element[t.flag]=t.value,n&&!t.element.attributes.binding&&i!==t.value&&t.element.recreateTwowayBinding(),t.value}function ur(t){Fc.call(this,t)}function hr(){var t=this;return this.torndown?(v("ractive.teardown() was called on a Ractive instance that was already torn down"),Promise.resolve()):(this.shouldDestroy=!0,lr(this,function(){return t.fragment.rendered?t.unrender():Promise.resolve()}))}function lr(t,e){t.torndown=!0,t.fragment.unbind(),t._observers.slice().forEach(K),t.el&&t.el.__ractive_instances__&&N(t.el.__ractive_instances__,t);var n=e();return fd.fire(t),n.then(function(){pd.fire(t),t.viewmodel.teardown()}),n}function cr(t,e){return t.applyValue=function(t){this.parent.value[e]=t,t&&t.viewmodel?(this.link(t.viewmodel.getRactiveModel(),e),this._link.markedAll()):(this.link(na(Qa),e),this._link.markedAll())},t.applyValue(t.parent.ractive[e],e),t._link.set=function(e){return t.applyValue(e)},t._link.applyValue=function(e){return t.applyValue(e)},t._link}function dr(t,e){t._link&&t._link.implicit&&t._link.isDetached()&&t.attach(e);for(var n in t.childByKey)if(n in t.value)dr(t.childByKey[n],e);else if(!t.childByKey[n]._link||t.childByKey[n]._link.isDetached()){var i=bt(e,n);i&&t.childByKey[n].link(i,n,{implicit:!0})}}function fr(t){t._link&&t._link.implicit&&t.unlink();for(var e in t.childByKey)fr(t.childByKey[e])}function pr(t,e,n){var i,r,s,a,l;return u(n)&&(i=tt(n,t),s=n.toString(),a=!0),h(n)&&(i=bi(n,t),s=n),o(n)&&(h(n.get)?(i=bi(n.get,t),s=n.get):u(n.get)?(i=tt(n.get,t),s=n.get.toString(),a=!0):d("`%s` computation must have a `get()` method",e),u(n.set)&&(r=tt(n.set,t),l=n.set.toString())),{getter:i,setter:r,getterString:s,setterString:l,getterUseStack:a}}function mr(t,e,i){var r=(t.constructor["_"+i]||[]).concat(n(e[i]||[])),s="on"===i?"once":i+"Once";r.forEach(function(e){var n=e[0],r=e[1];u(r)?t[i](n,r):o(r)&&u(r.handler)&&t[r.once?s:i](n,r.handler,na(r))})}function vr(e,n){Xs.DEBUG&&ba(),yr(e),br(e),mr(e,n,"on"),!t(n,"delegate")&&e.parent&&e.parent.delegate!==e.delegate&&(e.delegate=!1),gd.fire(e,n);for(var i=yd.length;i--;){var r=yd[i];e[r]=ea(na(e.constructor[r]||null),n[r])}e._attributePartial&&(e.partials["extra-attributes"]=e._attributePartial,delete e._attributePartial);var s=new vd({adapt:gr(e,e.adapt,n),data:Nh.init(e.constructor,e,n),ractive:e});e.adapt=s.adaptors,e.viewmodel=s;var a=ea(na(e.constructor.prototype.computed),n.computed);for(var o in a)if("__proto__"!==o){var u=pr(e,o,a[o]);s.compute(o,u)}}function gr(t,e,n){function i(e){return h(e)&&(e=y("adaptors",t,e),e||d(Ma(e,"adaptor"))),e}e=e.map(i);var r=O(n.adapt).map(i),s=[e,r];return t.parent&&!t.isolated&&s.push(t.parent.viewmodel.adaptors),T.apply(null,s)}function yr(t){t._guid="r-"+bd++,t._subs=na(null),t._nsSubs=0,t._config={},t.event=null,t._eventQueue=[],t._observers=[],t._children=[],t._children.byName={},t.children=t._children,t.component||(t.root=t,t.parent=t.container=null)}function br(t){var e=t.component,n=t.constructor.attributes;if(n&&e){var i=e.template,r=i.m?i.m.slice():[],s=r.filter(function(t){return t.t===Fo}).map(function(t){return t.n});n.required.forEach(function(t){~s.indexOf(t)||v("Component '"+e.name+"' requires attribute '"+t+"' to be provided")});for(var a=n.optional.concat(n.required),o=[],u=r.length;u--;){var h=r[u];h.t!==Fo||~a.indexOf(h.n)||(n.mapAll?o.unshift({t:Fo,n:h.n,f:[{t:To,r:"~/"+h.n}]}):o.unshift(r.splice(u,1)[0]))}o.length&&(e.template={t:i.t,e:i.e,f:i.f,m:r,p:i.p}),t._attributePartial=o}}function wr(t){this.item&&this.removeChild(this.item);var e=t.instance;t.anchor=this,t.up=this.up,t.name=t.nameOption||this.name,this.name=t.name,e.isolated||e.viewmodel.attached(this.up),this.rendered&&_r(this,t)}function xr(t){this.item===t&&(kr(this,t),this.name=this.template.n)}function _r(t,e){if(t.rendered){e.shouldDestroy=!1,e.up=t.up,t.item=e,t.instance=e.instance;var n=t.up.findNextNode(t);e.instance.fragment.rendered&&e.instance.unrender(),e.partials=e.instance.partials,e.instance.partials=ea(na(e.partials),e.partials,t._partials),e.instance.fragment.unbind(),e.instance.fragment.componentParent=t.up,e.instance.fragment.bind(e.instance.viewmodel),t.attributes.forEach(R),t.eventHandlers.forEach(R),t.attributes.forEach(q),t.eventHandlers.forEach(q);var i=t.up.findParentNode();Ss(e.instance,i,i.contains(n)?n:null,t.occupants),e.lastBound!==t&&(e.lastBound=t)}}function kr(t,e){t.rendered&&(e.shouldDestroy=!0,e.instance.unrender(),t.eventHandlers.forEach(G),t.attributes.forEach(G),t.eventHandlers.forEach(W),t.attributes.forEach(W),e.instance.el=e.instance.anchor=null,e.instance.fragment.componentParent=null,e.up=null,e.anchor=null,t.item=null,t.instance=null)}function Er(){var t=xd;xd=[],t.forEach(Ut)}function Ar(t,e,n,i){void 0===i&&(i={}),e&&e.f&&e.f.s&&(t.fn=wi(e.f.s,e.f.r.length),i.register===!0&&(t.models=Cr(t,e,n,i)))}function Cr(t,e,n,i){return void 0===i&&(i={}),e.f.r.map(function(e,r){var s;return i.specialRef&&(s=i.specialRef(e,r))?s:(s=bt(n,e),i.register===!0&&s.register(t),s)})}function Sr(t,e){e&&e.f&&e.f.s&&(t.models&&t.models.forEach(function(e){e&&e.unregister&&e.unregister(t)}),t.models=null)}function Or(){this._ractive.binding.handleChange()}function jr(t,e,n){var i=t+"-bindingGroup";return e[i]||(e[i]=new Nd(i,e,n))}function Nr(){var t=this,e=this.bindings.filter(function(t){return t.node&&t.node.checked}).map(function(t){return t.element.getAttribute("value")}),n=[];return e.forEach(function(e){t.bindings[0].arrayContains(n,e)||n.push(e)}),n}function Tr(){Or.call(this);var t=this._ractive.binding.model.get();this.value=void 0==t?"":t}function Vr(t){var e;return function(){var n=this;e&&clearTimeout(e),e=setTimeout(function(){var t=n._ractive.binding;t.rendered&&Or.call(n),e=null},t)}}function Pr(t){return t.selectedOptions?V(t.selectedOptions):t.options?V(t.options).filter(function(t){return t.selected}):[]}function Ir(t){return Dd[t]||(Dd[t]=[])}function Mr(){var t=this.bindings.filter(function(t){return t.node.checked});return t.length>0?t[0].element.getAttribute("value"):void 0}function Br(t){return t&&t.template.f&&1===t.template.f.length&&!t.template.f[0].s?t.template.f[0].t===To?!0:(t.template.f[0].t===Vo&&v("It is not possible create a binding using a triple mustache."),!1):!1}function Rr(t){var e=t.name,n=t.attributeByName,i=Br(n.value),r=Br(n.contenteditable),s=t.getAttribute("contenteditable");if((s||r)&&i)return Id;if("input"===e){var a=t.getAttribute("type");if("radio"===a){var o=Br(n.name),u=Br(n.checked);return o&&u?(v("A radio input can have two-way binding on its name attribute, or its checked attribute - not both",{ractive:t.root}),Fd):o?Fd:u?Ld:null}if("checkbox"===a){var h=Br(n.name),l=Br(n.checked);return h&&l?jd:h?Pd:l?jd:null}return"file"===a&&i?Bd:"number"===a&&i?Kd:"range"===a&&i?Kd:i?Md:null}return"select"===e&&i?t.getAttribute("multiple")?Rd:zd:"textarea"===e&&i?Md:null}function Kr(t){var e=t.attributeByName.name;return"radio"===t.getAttribute("type")&&(e||{}).interpolator&&t.getAttribute("value")===e.interpolator.model.get()}function Dr(t){var e=t.toString();return e?" "+e:""}function Lr(t){var e=t.getAttribute("xmlns");if(e)return e;if("svg"===t.name)return Wu;var n=t.parent;return n?"foreignobject"===n.name?Hu:n.node.namespaceURI:t.ractive.el.namespaceURI}function Fr(t){for(var e,n=t.type,i=t.currentTarget,r=i._ractive&&i._ractive.proxy,s=t.target,a=!0;a&&s&&s!==i;){var o=s._ractive&&s._ractive.proxy;o&&o.up.delegate===r&&zr(t,s,i)&&(e=o.listeners&&o.listeners[n],e&&e.forEach(function(e){a=e.call(s,t)!==!1&&a})),s=s.parentNode||s.correspondingUseElement}return a}function zr(t,e,n){if(qd&&t instanceof qd)for(var i=e;i&&i!==n;){if(i.disabled)return!1;i=i.parentNode||i.correspondingUseElement}return!0}function Ur(t){var e=this,n=this._ractive.proxy;n.listeners&&n.listeners[t.type]&&n.listeners[t.type].forEach(function(n){
return n.call(e,t)})}function $r(){var t=this._ractive.proxy;no.start(),t.formBindings.forEach(qr),no.end()}function qr(t){t.model.set(t.resetValue)}function Hr(t,e,n,i){if(n){var r=n[0];if(r&&3===r.nodeType){var s=r.nodeValue.indexOf(i);n.shift(),0===s?r.nodeValue.length!==i.length&&n.unshift(r.splitText(i.length)):r.nodeValue=i}else r=t.node=ka.createTextNode(i),n[0]?e.insertBefore(r,n[0]):e.appendChild(r);t.node=r}else t.node||(t.node=ka.createTextNode(i)),e.appendChild(t.node)}function Zr(t){rf.call(this,t)}function Wr(t){t.sp();var e=vn(t);if(!e)return null;var n={key:e};if(t.sp(),!t.matchString(":"))return null;t.sp();var i=t.read();return i?(n.value=i.v,n):null}function Gr(t){var e=t.template.f,n=t.element.instance.viewmodel,i=n.value;if(1===e.length&&e[0].t===To){var r=Bi(t.up,e[0]),s=r.get(!1);e[0].s?!o(s)||e[0].x?n.joinKey(k(t.name)).set(s):v("Cannot copy non-computed object value from static mapping '"+t.name+"'"):(t.model=r,t.link=n.createLink(t.name,r,e[0].r,{mapping:!0}),void 0===s&&!r.isReadonly&&t.name in i&&r.set(i[t.name]))}else t.boundFragment=new lp({owner:t,template:e}).bind(),t.model=n.joinKey(k(t.name)),t.model.set(t.boundFragment.valueOf()),t.boundFragment.bubble=function(){lp.prototype.bubble.call(t.boundFragment),no.scheduleTask(function(){t.boundFragment.update(),t.model.set(t.boundFragment.valueOf())})}}function Yr(t,n,i){var r=Qr(t,n,i||{});if(r)return r;if(r=Cc.fromId(n,{noThrow:!0})){var s=Cc.parseFor(r,t);return s.p&&e(t.partials,s.p),t.partials[n]=s.t}}function Qr(e,n,i){var r=ts(n,i.owner);if(r)return r;var s=b("partials",e,n);if(s){r=s.partials[n];var a;if(u(r)){if(a=r,a.styleSet)return a;a=r.bind(s),a.isOwner=t(s.partials,n),r=a.call(e,Cc)}if(!r&&""!==r)return void v(Ia,n,"partial","partial",{ractive:e});if(!Cc.isParsed(r)){var o=Cc.parseFor(r,s);o.p&&v("Partials ({{>%s}}) cannot contain nested inline partials",n,{ractive:e});var h=a?s:Jr(s,n);h.partials[n]=r=o.t}return a&&(r._fn=a),r.v?r.t:r}}function Jr(e,n){return t(e.partials,n)?e:Xr(e.constructor,n)}function Xr(e,n){return e?t(e.partials,n)?e:Xr(e.Parent,n):void 0}function ts(e,n){if(n){if(n.template&&n.template.p&&!oa(n.template.p)&&t(n.template.p,e))return n.template.p[e];if(n.up&&n.up.owner)return ts(e,n.up.owner)}}function es(t){Zr.call(this,t);var e=t.template;e.t===$o?this.yielder=1:e.t===Bo&&(this.type=Ro,this.macro=t.macro)}function ns(t,e){t.partial=e,is(t);var n={owner:t,template:t.partial};t.yielder&&(n.ractive=t.container.parent),t.fn&&(n.cssIds=t.fn._cssIds);var i=t.fragment=new lp(n);t.template.z&&(i.aliases=Ri(t.template.z,t.containerFragment||t.up))}function is(t){t.template.c&&(t.partial=[{t:Po,n:fu,f:t.partial}],ea(t.partial[0],t.template.c))}function rs(t,e,n){var i=e;return oa(i)?t.partial=i:o(i)?oa(i.t)?t.partial=i.t:h(i.template)&&(t.partial=us(i.template,i.template,t.ractive).t):u(i)&&i.styleSet?(t.fn=i,t.fragment&&(t.fragment.cssIds=i._cssIds)):null!=i&&(i=Yr(t.ractive,""+i,t.containerFragment||t.up),i?(t.name=e,i.styleSet?(t.fn=i,t.fragment&&(t.fragment.cssIds=i._cssIds)):t.partial=i):n?t.partial=us(""+e,""+e,t.ractive).t:t.name=e),t.partial}function ss(t){if(rs(this,t,!0),!this.initing){if(this.dirtyTemplate=!0,this.fnTemplate=this.partial,!this.updating){var e=no.start();return this.bubble(),no.end(),e}this.bubble(),no.promise()}}function as(t,e){var n=this.fragment.aliases||(this.fragment.aliases={});e?n[e]=this._data.joinAll(k(t)):n[t]=this._data}function os(e){var n=e.fn,i=e.fragment,r=e.template=ea({},e.template),s=e.handle=i.getContext({proxy:e,aliasLocal:as,name:e.template.e||e.name,attributes:{},setTemplate:ss.bind(e),template:r});if(r.p||(r.p={}),r.p=s.partials=ea({},r.p),t(r.p,"content")||(r.p.content=r.f||[]),oa(n.attributes)){e._attrs={};var a=function(){this.dirty=!0,e.dirtyAttrs=!0,e.bubble()};if(oa(r.m)){var o=r.m;r.p[bf]=r.m=o.filter(function(t){return!~n.attributes.indexOf(t.n)}),o.filter(function(t){return~n.attributes.indexOf(t.n)}).forEach(function(t){var n=new lp({template:t.f,owner:e});n.bubble=a,n.findFirstNode=Oa,e._attrs[t.n]=n})}else r.p[bf]=[]}else r.p[bf]=r.m;e._attrs&&(sa(e._attrs).forEach(function(t){e._attrs[t].bind()}),e.refreshAttrs()),e.initing=1,e.proxy=n(s,s.attributes)||{},e.partial||(e.partial=[]),e.fnTemplate=e.partial,e.initing=0,is(e),i.resetTemplate(e.partial)}function us(t,e,n){var i;try{i=Cc.parse(e,Cc.getParseOptions(n))}catch(r){v("Could not parse partial from expression '"+t+"'\n"+r.message)}return i||{t:[]}}function hs(t){for(var e=t,n=t;e;)e.delegate&&(n=e),e=e.parent;return n}function ls(t){return!t||oa(t)&&0===t.length||s(t)&&0===sa(t).length}function cs(t,e){return e||oa(t)?du:a(t)?pu:void 0===t?null:lu}function ds(t,e){var n=t.up.findNextNode(t);if(n){var i=ve();e.render(i),n.parentNode.insertBefore(i,n)}else e.render(t.up.findParentNode())}function fs(){Sf=!ka[Of]}function ps(){Sf=!1}function ms(){Sf=!0}function vs(e,n,i){for(var r=n;r;){if(t(r,e)&&(void 0===i||i?r.rendering:r.unrendering))return r[e];r=r.component&&r.component.ractive}return n[e]}function gs(t){return rp[t]||(rp[t]=Bu(t))}function ys(e,n){var i,r=b("components",e,n);if(r&&(i=r.components[n],i&&!i.isInstance&&!i.then)){var s=i.bind(r);if(s.isOwner=t(r.components,n),i=s(),!i)return void v(Ia,n,"component","component",{ractive:e});h(i)&&(i=ys(e,i)),i._fn=s,r.components[n]=i}return i}function bs(t,e){var n=e.template.p||{},i=e.template.e,r=ea({},e,{template:{t:Bo,e:i},macro:function(r){r.setTemplate(n["async-loading"]||[]),t.then(function(t){e.up.ractive.components[i]=t,n["async-loaded"]?(r.partials.component=[e.template],r.setTemplate(n["async-loaded"])):r.setTemplate([e.template])},function(t){n["async-failed"]?(r.aliasLocal("error","error"),r.set("@local.error",t),r.setTemplate(n["async-failed"])):r.setTemplate([])})}});return new es(r)}function ws(t){if(h(t.template))return new Af(t);var e,n,i=t.template.t;if(i===Bo)return n=t.template.e,e=b("partials",t.up.ractive,n),e&&(e=e.partials[n],e.styleSet)?(t.macro=e,new es(t)):(e=ys(t.up.ractive,n))?u(e.then)?bs(e,t):new wd(t,e):new(e=hp[n.toLowerCase()]||$d)(t);var r;if(i===Fo){var s=t.owner;(!s||s.type!==Lo&&s.type!==Uo&&s.type!==Bo)&&(s=ne(t.up)),t.element=s,r=s.type===Uo||s.type===Lo?vf:ld}else r=up[i];if(!r)throw new Error("Unrecognised item type "+i);return new r(t)}function xs(t,e,n,i){return void 0===i&&(i=0),t.map(function(t){if(t.type===No)return t.template;if(t.fragment)return t.fragment.iterations?t.fragment.iterations.map(function(t){return xs(t.items,e,n,i)}).join(""):xs(t.fragment.items,e,n,i);var r=n+"-"+i++,s=t.model||t.newModel;return e[r]=s?s.wrapper?s.wrapperValue:s.get():void 0,"${"+r+"}"}).join("")}function _s(t){t.unrender(!0)}function ks(t,e){return t[e._guid]||(t[e._guid]=[])}function Es(t,e){var n=ks(t.queue,e);for(t.hook.fire(e);n.length;)Es(t,n.shift());delete t.queue[e._guid]}function As(e,n,i){sa(e.viewmodel.computations).forEach(function(n){var i=e.viewmodel.computations[n];t(e.viewmodel.value,n)&&i.set(e.viewmodel.value[n])}),Dc.init(e.constructor,e,n),pp.fire(e),mp.begin(e);var r=e.fragment=Cs(e,i);if(r&&r.bind(e.viewmodel),mp.end(e),mr(e,n,"observe"),r){var s=ge(e.el||e.target);if(s){var a=e.render(s,e.append);Xs.DEBUG_PROMISES&&a["catch"](function(t){throw g("Promise debugging is enabled, to help solve errors that happen asynchronously. Some browsers will log unhandled promise rejections, in which case you can safely disable promise debugging:\n  Ractive.DEBUG_PROMISES = false;"),v("An error happened during rendering",{ractive:e}),f(t),t})}}}function Cs(t,e){if(void 0===e&&(e={}),t.template){var n=[].concat(t.constructor._cssIds||[],e.cssIds||[]);return new lp({owner:t,template:t.template,cssIds:n})}}function Ss(t,e,n,i){t.rendering=!0;var r=no.start();if(no.scheduleTask(function(){return vp.fire(t)},!0),t.fragment.rendered)throw new Error("You cannot call ractive.render() on an already rendered instance! Call ractive.unrender() first");if(t.destroyed&&(t.destroyed=!1,t.fragment=Cs(t).bind(t.viewmodel)),n=ge(n)||t.anchor,t.el=t.target=e,t.anchor=n,t.cssId&&Be(),e)if((e.__ractive_instances__||(e.__ractive_instances__=[])).push(t),n){var s=ka.createDocumentFragment();t.fragment.render(s),e.insertBefore(s,n)}else t.fragment.render(e,i);return no.end(),t.rendering=!1,r.then(function(){t.torndown||gp.fire(t)})}function Os(t,e){if(this.torndown)return v("ractive.render() was called on a Ractive instance that was already torn down"),Promise.resolve();if(t=ge(t)||this.el,!this.append&&t){var n=t.__ractive_instances__;n&&n.forEach(Z),this.enhance||(t.innerHTML="")}var i=this.enhance?V(t.childNodes):null,r=Ss(this,t,e,i);if(i)for(;i.length;)t.removeChild(i.pop());return r}function js(t){if(t=t||{},!o(t))throw new Error("The reset method takes either no arguments, or an object containing new data");t=Nh.init(this.constructor,this,{data:t});var e=no.start(),n=this.viewmodel.wrapper;n&&n.reset?n.reset(t)===!1&&this.viewmodel.set(t):this.viewmodel.set(t);for(var i,r=Dc.reset(this),s=r.length;s--;)if(yp.indexOf(r[s])>-1){i=!0;break}return i&&(_p.fire(this),this.fragment.resetTemplate(this.template),xp.fire(this),bp.fire(this)),no.end(),wp.fire(this,t),e}function Ns(t,e,n,i){t.forEach(function(t){if(t.type===Ro&&(t.refName===e||t.name===e))return t.inAttribute=n,void i.push(t);if(t.fragment)Ns(t.fragment.iterations||t.fragment.items,e,n,i);else if(oa(t.items))Ns(t.items,e,n,i);else if(t.type===Uo&&t.instance){if(t.instance.partials[e])return;Ns(t.instance.fragment.items,e,n,i)}t.type===Bo&&oa(t.attributes)&&Ns(t.attributes,e,!0,i)})}function Ts(t){Oc.init(null,this,{template:t});var e=this.transitionsEnabled;this.transitionsEnabled=!1;var n=this.component;n&&(n.shouldDestroy=!0),this.unrender(),n&&(n.shouldDestroy=!1);var i=no.start();this.fragment.unbind().unrender(!0),this.fragment=new lp({template:this.template,root:this,owner:this});var r=ve();return this.fragment.bind(this.viewmodel).render(r),n&&!n.external?this.fragment.findParentNode().insertBefore(r,n.findNextNode()):this.el.insertBefore(r,this.anchor),no.end(),this.transitionsEnabled=e,i}function Vs(t,e,n){var i=this,r=o(t)?e:n;return Et(Ct(i,t,e,r&&r.isolated),r)}function Ps(t,e,n){var i=l(e)?-e:-1,r=o(e)?e:n;return jt(this,t,i,r)}function Is(t,e){if(!h(t))throw new TypeError(Pa);return Et(At(this,t,null,e&&e.isolated).map(function(t){return[t,!t.get()]}),e)}function Ms(){var t=[this.cssId].concat(this.findAllComponents().map(function(t){return t.cssId})),e=sa(t.reduce(function(t,e){return t[e]=!0,t},{}));return Re(e)}function Bs(){return this.fragment.toString(!0)}function Rs(){return this.fragment.toString(!1)}function Ks(t,e,n){e instanceof HTMLElement||s(e)&&(n=e),e=e||this.event.node,e&&e._ractive||d("No node was supplied for transition "+t),n=n||{};var i=e._ractive.proxy,r=new Xf({owner:i,up:i.up,name:t,params:n});r.bind();var a=no.start();return no.registerTransition(r),no.end(),a.then(function(){return r.unbind()}),a}function Ds(t){var e=no.start();return this.viewmodel.joinAll(k(t),{lastLink:!1}).unlink(),no.end(),e}function Ls(){if(!this.fragment.rendered)return v("ractive.unrender() was called on a Ractive instance that was not rendered"),Promise.resolve();this.unrendering=!0;var t=no.start(),e=!this.component||(this.component.anchor||{}).shouldDestroy||this.component.shouldDestroy||this.shouldDestroy;return this.fragment.unrender(e),e&&(this.destroyed=!0),N(this.el.__ractive_instances__,this),Op.fire(this),no.end(),this.unrendering=!1,t}function Fs(t,e){var n=no.start();return t?this.viewmodel.joinAll(k(t)).updateFromBindings(e!==!1):this.viewmodel.updateFromBindings(!0),no.end(),n}function zs(t){return t&&t instanceof this}function Us(t){return this._cssModel.joinAll(k(t)).get()}function $s(t,e,n){var i=o(t)?e:n,r=co;return Et(Ct({viewmodel:r},t,e,!0),i)}function qs(t){return co.joinAll(k(t)).get()}function Hs(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return t.length?t.reduce(Ws,this):Ws(this)}function Zs(t,e){return void 0===e&&(e={}),Ws(this,e,t)}function Ws(t,e,i){void 0===e&&(e={});var r,s=u(i)&&i;if(e.prototype instanceof Xs)throw new Error("Ractive no longer supports multiple inheritance.");if(s){if(!(s.prototype instanceof t))throw new Error("Only classes that inherit the appropriate prototype may be used with extend");if(!Tp.test(s.toString()))throw new Error("Only classes that call super in their constructor may be used with extend");r=s.prototype}else s=function(t){return this instanceof s?(vr(this,t||{}),void As(this,t||{},{})):new s(t)},r=na(t.prototype),r.constructor=s,s.prototype=r;if(ra(s,{defaults:{value:r},extend:{value:Hs,writable:!0,configurable:!0},extendWith:{value:Zs,writable:!0,configurable:!0},extensions:{value:[]},isInstance:{value:zs},Parent:{value:t},Ractive:{value:Xs},styleGet:{value:Us.bind(s),configurable:!0},styleSet:{value:qe.bind(s),configurable:!0}}),Dc.extend(t,r,e,s),s._on=(t._on||[]).concat(n(e.on)),s._observe=(t._observe||[]).concat(n(e.observe)),t.extensions.push(s),e.attributes){var a;a=oa(e.attributes)?{optional:e.attributes,required:[]}:e.attributes,oa(a.required)||(a.required=[]),oa(a.optional)||(a.optional=[]),s.attributes=a}return Nh.extend(t,r,e,s),e.computed&&(r.computed=ea(na(t.prototype.computed),e.computed)),s}function Gs(t,e){if(!u(t))throw new Error("The macro must be a function");return ea(t,e),ra(t,{extensions:{value:[]},_cssIds:{value:[]},cssData:{value:ea(na(this.cssData),t.cssData||{})},styleGet:{value:Us.bind(t)},styleSet:{value:qe.bind(t)}}),ia(t,"_cssModel",{value:new Sh(t)}),t.css&&Ye(t,t,t),this.extensions.push(t),t}function Ys(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return t.map(x).join(".")}function Qs(t){return k(t).map(E)}function Js(t,e,n){return y(e,n,t)}function Xs(t){return this instanceof Xs?(vr(this,t||{}),void As(this,t||{},{})):new Xs(t)}Object.assign||(Object.assign=function(t){for(var e=[],n=arguments.length-1;n-->0;)e[n]=arguments[n+1];if(null==t)throw new TypeError("Cannot convert undefined or null to object");for(var i=Object(t),r=e.length,s=0;r>s;s++){var a=e[s];for(var o in a)Object.prototype.hasOwnProperty.call(a,o)&&(i[o]=a[o])}return i});var ta=Object,ea=ta.assign,na=ta.create,ia=ta.defineProperty,ra=ta.defineProperties,sa=ta.keys,aa=Object.prototype.toString,oa=Array.isArray;if(Array.prototype.find||ia(Array.prototype,"find",{value:function(e,n){if(null===this||void 0===this)throw new TypeError("Array.prototype.find called on null or undefined");if(!u(e))throw new TypeError(e+" is not a function");for(var i=Object(this),r=i.length>>>0,s=0;r>s;s++)if(t(i,s)&&e.call(n,i[s],s,i))return i[s];return void 0},configurable:!0,writable:!0}),"undefined"!=typeof window&&window.Node&&window.Node.prototype&&!window.Node.prototype.contains&&(Node.prototype.contains=function(t){var e=this;if(!t)throw new TypeError("node required");do if(e===t)return!0;while(t=t&&t.parentNode);return!1}),"undefined"!=typeof window&&window.performance&&!window.performance.now){window.performance=window.performance||{};var ua=Date.now();window.performance.now=function(){return Date.now()-ua}}if("undefined"!=typeof window&&!window.Promise){var ha={},la={},ca={},da=window.Promise=function(t){var e,n,i=[],r=[],s=ha,a=function(t){return function(a){s===ha&&(e=a,s=t,n=pa(s===la?i:r,e),fa(n))}},o=a(la),h=a(ca);try{t(o,h)}catch(l){h(l)}return{then:function(t,e){var a=new da(function(o,h){var l=function(t,e,n){u(t)?e.push(function(e){try{ma(a,t(e),o,h)}catch(n){h(n)}}):e.push(n)};l(t,i,o),l(e,r,h),s!==ha&&fa(n)});return a},"catch":function(t){return this.then(null,t)}}};da.all=function(t){return new da(function(e,n){var i,r,s=[];if(!t.length)return void e(s);var a=function(t,r){t&&u(t.then)?t.then(function(t){s[r]=t,--i||e(s)},n):(s[r]=t,--i||e(s))};for(i=r=t.length;r--;)a(t[r],r)})},da.resolve=function(t){return new da(function(e){e(t)})},da.reject=function(t){return new da(function(e,n){n(t)})};var fa=function(t){setTimeout(t,0)},pa=function(t,e){return function(){for(var n=void 0;n=t.shift();)n(e)}},ma=function(t,e,n,i){var r;if(e===t)throw new TypeError("A promise's fulfillment handler cannot return the same promise");if(e instanceof da)e.then(n,i);else if(e&&(o(e)||u(e))){try{r=e.then}catch(s){return void i(s)}if(u(r)){var a,h=function(e){a||(a=!0,ma(t,e,n,i))},l=function(t){a||(a=!0,i(t))};try{r.call(e,h,l)}catch(s){if(!a)return i(s),void(a=!0)}}else n(e)}else n(e)}}if(!("undefined"==typeof window||window.requestAnimationFrame&&window.cancelAnimationFrame)){var va=0;window.requestAnimationFrame=function(t){var e=Date.now(),n=Math.max(0,16-(e-va)),i=window.setTimeout(function(){t(e+n)},n);return va=e+n,i},window.cancelAnimationFrame=function(t){clearTimeout(t)}}var ga,ya,ba,wa={el:void 0,append:!1,delegate:!0,template:null,allowExpressions:!0,delimiters:["{{","}}"],tripleDelimiters:["{{{","}}}"],staticDelimiters:["[[","]]"],staticTripleDelimiters:["[[[","]]]"],csp:!0,interpolate:!1,preserveWhitespace:!1,sanitize:!1,stripComments:!0,contextLines:0,data:{},computed:{},syncComputedChildren:!1,resolveInstanceMembers:!0,warnAboutAmbiguity:!1,adapt:[],isolated:!0,twoway:!0,lazy:!1,noIntro:!1,noOutro:!1,transitionsEnabled:!0,complete:void 0,nestedTransitions:!0,css:null,noCssTransform:!1},xa={linear:function(t){return t},easeIn:function(t){return Math.pow(t,3)},easeOut:function(t){return Math.pow(t-1,3)+1},easeInOut:function(t){return(t/=.5)<1?.5*Math.pow(t,3):.5*(Math.pow(t-2,3)+2)}},_a="undefined"!=typeof window?window:null,ka=_a?document:null,Ea=!!ka,Aa="undefined"!=typeof console&&u(console.warn)&&u(console.warn.apply),Ca=ka?ka.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1"):!1,Sa=["o","ms","moz","webkit"],Oa=function(){},ja={};if(Aa){var Na=["%cRactive.js %c1.0.0-edge %cin debug mode, %cmore...","color: rgb(114, 157, 52); font-weight: normal;","color: rgb(85, 85, 85); font-weight: normal;","color: rgb(85, 85, 85); font-weight: normal;","color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;"],Ta="You're running Ractive 1.0.0-edge in debug mode - messages will be printed to the console to help you fix problems and optimise your application.\n\nTo disable debug mode, add this line at the start of your app:\n  Ractive.DEBUG = false;\n\nTo disable debug mode when your app is minified, add this snippet:\n  Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});\n\nGet help and support:\n  http://ractive.js.org\n  http://stackoverflow.com/questions/tagged/ractivejs\n  http://groups.google.com/forum/#!forum/ractive-js\n  http://twitter.com/ractivejs\n\nFound a bug? Raise an issue:\n  https://github.com/ractivejs/ractive/issues\n\n";ba=function(){if(Xs.WELCOME_MESSAGE===!1)return void(ba=Oa);var t="WELCOME_MESSAGE"in Xs?Xs.WELCOME_MESSAGE:Ta,e=!!console.groupCollapsed;e&&console.groupCollapsed.apply(console,Na),console.log(t),e&&console.groupEnd(Na),ba=Oa},ya=function(t,e){if(ba(),o(e[e.length-1])){var n=e.pop(),i=n?n.ractive:null;if(i){var r;i.component&&(r=i.component.name)&&(t="<"+r+"> "+t);var s;(s=n.node||i.fragment&&i.fragment.rendered&&i.find("*"))&&e.push(s)}}console.warn.apply(console,["%cRactive.js: %c"+t,"color: rgb(114, 157, 52);","color: rgb(85, 85, 85);"].concat(e))},ga=function(){console.log.apply(console,arguments)}}else ya=ga=ba=Oa;var Va,Pa="Bad arguments",Ia='A function was specified for "%s" %s, but no %s was returned',Ma=function(t,e){return'Missing "'+t+'" '+e+" plugin. You may need to download a plugin via http://ractive.js.org/integrations/#"+e+"s"},Ba={number:function(t,e){if(!r(t)||!r(e))return null;t=+t,e=+e;var n=e-t;return n?function(e){return t+e*n}:function(){return t}},array:function(t,e){var n,i;if(!oa(t)||!oa(e))return null;var r=[],s=[];for(i=n=Math.min(t.length,e.length);i--;)s[i]=w(t[i],e[i]);for(i=n;i<t.length;i+=1)r[i]=t[i];for(i=n;i<e.length;i+=1)r[i]=e[i];return function(t){for(var e=n;e--;)r[e]=s[e](t);return r}},object:function(e,n){if(!s(e)||!s(n))return null;var i=[],r={},a={},o=function(s){t(e,s)&&(t(n,s)?(i.push(s),a[s]=w(e[s],n[s])||function(){return n[s]}):r[s]=e[s])};for(var u in e)o(u);for(var h in n)t(n,h)&&!t(e,h)&&(r[h]=n[h]);var l=i.length;return function(t){for(var e=l;e--;){var n=i[e];r[n]=a[n](t)}return r}}},Ra=/\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g,Ka=/([^\\](?:\\\\)*)\./,Da=/\\|\./g,La=/((?:\\)+)\1|\\(\.)/g,Fa=[],za=function(t,e){this.value=t,this.isReadonly=this.isKey=!0,this.deps=[],this.links=[],this.parent=e},Ua=za.prototype;Ua.get=function(t){return t&&B(this),E(this.value)},Ua.getKeypath=function(){return E(this.value)},Ua.has=function(){return!1},Ua.rebind=function(t,e){for(var n=this,i=this.deps.length;i--;)n.deps[i].rebind(t,e,!1);for(i=this.links.length;i--;)n.links[i].relinking(t,!1)},Ua.register=function(t){this.deps.push(t)},Ua.registerLink=function(t){A(this.links,t)},Ua.unregister=function(t){N(this.deps,t)},Ua.unregisterLink=function(t){N(this.links,t)},za.prototype.reference=Oa,za.prototype.unreference=Oa;var $a=function(t,e){this.parent=t,this.ractive=e,this.value=e?t.getKeypath(e):t.getKeypath(),this.deps=[],this.children={},this.isReadonly=this.isKeypath=!0},qa=$a.prototype;qa.get=function(t){return t&&B(this),this.value},qa.getChild=function(t){if(!(t._guid in this.children)){var e=new $a(this.parent,t);this.children[t._guid]=e,e.owner=this}return this.children[t._guid]},qa.getKeypath=function(){return this.value},qa.handleChange=function(){for(var t=this,e=sa(this.children),n=e.length;n--;)t.children[e[n]].handleChange();this.deps.forEach(L)},qa.has=function(){return!1},qa.rebindChildren=function(t){for(var e=this,n=sa(this.children),i=n.length;i--;){var r=e.children[n[i]];r.value=t.getKeypath(r.ractive),r.handleChange()}},qa.rebind=function(t,e){for(var n=this,i=t?t.getKeypathModel(this.ractive):void 0,r=sa(this.children),s=r.length;s--;)n.children[r[s]].rebind(t,e,!1);for(s=this.deps.length;s--;)n.deps[s].rebind(i,n,!1)},qa.register=function(t){this.deps.push(t)},qa.removeChild=function(t){t.ractive&&delete this.children[t.ractive._guid]},qa.teardown=function(){var t=this;this.owner&&this.owner.removeChild(this);for(var e=sa(this.children),n=e.length;n--;)t.children[e[n]].teardown()},qa.unregister=function(t){N(this.deps,t),this.deps.length||this.teardown()},$a.prototype.reference=Oa,$a.prototype.unreference=Oa;var Ha=Function.prototype.bind,Za={early:[],mark:[]},Wa={early:[],mark:[]},Ga=function(t){this.deps=[],this.children=[],this.childByKey={},this.links=[],this.keyModels={},this.bindings=[],this.patternObservers=[],t&&(this.parent=t,this.root=t.root)},Ya=Ga.prototype;Ya.addShuffleTask=function(t,e){void 0===e&&(e="early"),Za[e].push(t)},Ya.addShuffleRegister=function(t,e){void 0===e&&(e="early"),Wa[e].push({model:this,item:t})},Ya.downstreamChanged=function(){},Ya.findMatches=function(t){var e,n,i=t.length,r=[this],s=function(){var i=t[n];"*"===i?(e=[],r.forEach(function(t){e.push.apply(e,t.getValueChildren(t.get()))})):e=r.map(function(t){return t.joinKey(i)}),r=e};for(n=0;i>n;n+=1)s();return e},Ya.getKeyModel=function(t,e){return void 0===t||e?(t in this.keyModels||(this.keyModels[t]=new za(x(t),this)),this.keyModels[t]):this.parent.getKeyModel(t,!0)},Ya.getKeypath=function(t){if(t!==this.ractive&&this._link)return this._link.target.getKeypath(t);if(!this.keypath){var e=this.parent&&this.parent.getKeypath(t);this.keypath=e?this.parent.getKeypath(t)+"."+x(this.key):x(this.key)}return this.keypath},Ya.getValueChildren=function(t){var e,n=this;if(oa(t))e=[],"length"in this&&this.length!==t.length&&e.push(this.joinKey("length")),t.forEach(function(t,i){e.push(n.joinKey(i))});else if(s(t)||u(t))e=sa(t).map(function(t){return n.joinKey(t)});else if(null!=t)return[];return e},Ya.getVirtual=function(t){var e=this,n=this.get(t,{virtual:!1});if(s(n)){for(var i=oa(n)?[]:{},r=sa(n),a=r.length;a--;){var o=e.childByKey[r[a]];o?o._link?i[r[a]]=o._link.getVirtual():i[r[a]]=o.getVirtual():i[r[a]]=n[r[a]]}for(a=this.children.length;a--;){var u=e.children[a];u.key in i||!u._link||(i[u.key]=u._link.getVirtual())}return i}return n},Ya.has=function(e){if(this._link)return this._link.has(e);var n=this.get();if(!n)return!1;if(e=E(e),t(n,e))return!0;for(var i=n.constructor;i!==Function&&i!==Array&&i!==Object;){if(t(i.prototype,e))return!0;i=i.constructor}return!1},Ya.joinAll=function(t,e){for(var n=this,i=0;i<t.length;i+=1){if(e&&e.lastLink===!1&&i+1===t.length&&n.childByKey[t[i]]&&n.childByKey[t[i]]._link)return n.childByKey[t[i]];n=n.joinKey(t[i],e)}return n},Ya.notifyUpstream=function(t){for(var e=this,n=this.parent,i=t||[this.key];n;)n.patternObservers.length&&n.patternObservers.forEach(function(t){return t.notify(i.slice())}),i.unshift(n.key),n.links.forEach(function(t){return t.notifiedUpstream(i,e.root)}),n.deps.forEach(function(t){return t.handleChange(i)}),n.downstreamChanged(t),n=n.parent},Ya.rebind=function(t,e,n){var i=this;this._link&&this._link.rebind(t,e,!1);for(var r=this.deps.length;r--;)i.deps[r].rebind&&i.deps[r].rebind(t,e,n);for(r=this.links.length;r--;){var s=i.links[r];s.owner._link&&s.relinking(t,n)}for(r=this.children.length;r--;){var a=i.children[r];a.rebind(t?t.joinKey(a.key):void 0,a,n)}for(this.keypathModel&&this.keypathModel.rebind(t,e,!1),r=this.bindings.length;r--;)i.bindings[r].rebind(t,e,n)},Ya.reference=function(){"refs"in this?this.refs++:this.refs=1},Ya.register=function(t){this.deps.push(t)},Ya.registerLink=function(t){A(this.links,t)},Ya.registerPatternObserver=function(t){this.patternObservers.push(t),this.register(t)},Ya.registerTwowayBinding=function(t){this.bindings.push(t)},Ya.unreference=function(){"refs"in this&&this.refs--},Ya.unregister=function(t){N(this.deps,t)},Ya.unregisterLink=function(t){N(this.links,t)},Ya.unregisterPatternObserver=function(t){N(this.patternObservers,t),this.unregister(t)},Ya.unregisterTwowayBinding=function(t){N(this.bindings,t)},Ya.updateFromBindings=function(t){for(var e=this,n=this.bindings.length;n--;){var i=e.bindings[n].getValue();i!==e.value&&e.set(i)}if(!this.bindings.length){var r=it(this.deps);r&&r.value!==this.value&&this.set(r.value)}t&&(this.children.forEach(nt),this.links.forEach(nt),this._link&&this._link.updateFromBindings(t))},za.prototype.addShuffleTask=Ga.prototype.addShuffleTask,za.prototype.addShuffleRegister=Ga.prototype.addShuffleRegister,$a.prototype.addShuffleTask=Ga.prototype.addShuffleTask,$a.prototype.addShuffleRegister=Ga.prototype.addShuffleRegister;var Qa={key:"@missing",animate:Oa,applyValue:Oa,get:Oa,getKeypath:function(){return this.key},joinAll:function(){return this},joinKey:function(){return this},mark:Oa,registerLink:Oa,shufle:Oa,set:Oa,unregisterLink:Oa};Qa.parent=Qa;var Ja=function(e){function n(t,n,i,r){e.call(this,t),this.owner=n,this.target=i,this.key=void 0===r?n.key:r,n.isLink&&(this.sourcePath=n.sourcePath+"."+this.key),i.registerLink(this),t&&(this.isReadonly=t.isReadonly),this.isLink=!0}e&&(n.__proto__=e);var i=n.prototype=Object.create(e&&e.prototype);return i.constructor=n,i.animate=function(t,e,n,i){return this.target.animate(t,e,n,i)},i.applyValue=function(t){this.boundValue&&(this.boundValue=null),this.target.applyValue(t)},i.attach=function(t){var e=bt(t,this.key);e?this.relinking(e,!1):this.owner.unlink()},i.detach=function(){this.relinking(Qa,!1)},i.get=function(t,e){void 0===e&&(e={}),t&&(B(this),e.unwrap="unwrap"in e?e.unwrap:!0);var n="shouldBind"in e?e.shouldBind:!0;return e.shouldBind=this.mapping&&this.target.parent&&this.target.parent.isRoot,et(this,this.target.get(!1,e),n)},i.getKeypath=function(t){return t&&t!==this.root.ractive?this.target.getKeypath(t):e.prototype.getKeypath.call(this,t)},i.getKeypathModel=function(t){return this.keypathModel||(this.keypathModel=new $a(this)),t&&t!==this.root.ractive?this.keypathModel.getChild(t):this.keypathModel},i.handleChange=function(){this.deps.forEach(L),this.links.forEach(L),this.notifyUpstream()},i.isDetached=function(){return this.virtual&&this.target===Qa},i.joinKey=function(e){if(void 0===e||""===e)return this;if(!t(this.childByKey,e)){var i=new n(this,this,this.target.joinKey(e),e);this.children.push(i),this.childByKey[e]=i}return this.childByKey[e]},i.mark=function(t){this.target.mark(t)},i.marked=function(){this.boundValue&&(this.boundValue=null),this.links.forEach(U),this.deps.forEach(L)},i.markedAll=function(){this.children.forEach($),this.marked()},i.notifiedUpstream=function(t,e){var n=this;if(this.links.forEach(function(e){return e.notifiedUpstream(t,n.root)}),this.deps.forEach(L),t&&this.rootLink&&this.root!==e){var i=t.slice(1);i.unshift(this.key),this.notifyUpstream(i)}},i.relinked=function(){this.target.registerLink(this),this.children.forEach(function(t){return t.relinked()})},i.relinking=function(t,e){var n=this;this.rootLink&&this.sourcePath&&(t=at(this.sourcePath,t,this.target)),t&&this.target!==t&&(this.target.unregisterLink(this),this.keypathModel&&this.keypathModel.rebindChildren(t),this.target=t,this.children.forEach(function(n){n.relinking(t.joinKey(n.key),e)}),this.rootLink&&this.addShuffleTask(function(){n.relinked(),e||(n.markedAll(),n.notifyUpstream())}))},i.set=function(t){this.boundValue&&(this.boundValue=null),this.target.set(t)},i.shuffle=function(t){this.shuffling||(this.target.shuffling?st(this,t,!0):this.target.shuffle?this.target.shuffle(t):this.target.mark())},i.source=function(){return this.target.source?this.target.source():this.target},i.teardown=function(){this._link&&this._link.teardown(),this.target.unregisterLink(this),this.children.forEach(Z)},n}(Ga);Ga.prototype.link=function(t,e,n){var i=this._link||new Ja(this.parent,this,t,this.key);return i.implicit=n&&n.implicit,i.mapping=n&&n.mapping,i.sourcePath=e,i.rootLink=!0,this._link&&this._link.relinking(t,!1),this.rebind(i,this,!1),rt(),this._link=i,i.markedAll(),this.notifyUpstream(),i},Ga.prototype.unlink=function(){if(this._link){var t=this._link;this._link=void 0,t.rebind(this,t,!1),rt(),t.teardown(),this.notifyUpstream()}};var Xa=function(t,e){this.callback=t,this.parent=e,this.intros=[],this.outros=[],this.children=[],this.totalChildren=this.outroChildren=0,this.detachQueue=[],this.outrosComplete=!1,e&&e.addChild(this)},to=Xa.prototype;to.add=function(t){var e=t.isIntro?this.intros:this.outros;t.starting=!0,e.push(t)},to.addChild=function(t){this.children.push(t),this.totalChildren+=1,this.outroChildren+=1},to.decrementOutros=function(){this.outroChildren-=1,lt(this)},to.decrementTotal=function(){this.totalChildren-=1,lt(this)},to.detachNodes=function(){this.detachQueue.forEach(ut),this.children.forEach(ht),this.detachQueue=[]},to.ready=function(){this.detachQueue.length&&ct(this)},to.remove=function(t){var e=t.isIntro?this.intros:this.outros;N(e,t),lt(this)},to.start=function(){this.children.forEach(function(t){return t.start()}),this.intros.concat(this.outros).forEach(function(t){return t.start()}),this.ready=!0,lt(this)};var eo,no={start:function(){var t,e=new Promise(function(e){return t=e});return eo={previousBatch:eo,transitionManager:new Xa(t,eo&&eo.transitionManager),fragments:[],tasks:[],immediateObservers:[],deferredObservers:[],promise:e},e},end:function(){pt(),eo.previousBatch||eo.transitionManager.start(),eo=eo.previousBatch},addFragment:function(t){A(eo.fragments,t)},addFragmentToRoot:function(t){if(eo){for(var e=eo;e.previousBatch;)e=e.previousBatch;A(e.fragments,t)}},addObserver:function(t,e){eo?A(e?eo.deferredObservers:eo.immediateObservers,t):t.dispatch()},registerTransition:function(t){t._manager=eo.transitionManager,eo.transitionManager.add(t)},detachWhenReady:function(t){eo.transitionManager.detachQueue.push(t)},scheduleTask:function(t,e){var n;if(eo){for(n=eo;e&&n.previousBatch;)n=n.previousBatch;n.tasks.push(t)}else t()},promise:function(){if(!eo)return Promise.resolve();for(var t=eo;t.previousBatch;)t=t.previousBatch;return t.promise||Promise.resolve()}},io=[],ro=!1,so=function(t){this.duration=t.duration,this.step=t.step,this.complete=t.complete,this.easing=t.easing,this.start=performance.now(),this.end=this.start+this.duration,this.running=!0,io.push(this),ro||requestAnimationFrame(mt)},ao=so.prototype;ao.tick=function(t){
if(!this.running)return!1;if(t>this.end)return this.step&&this.step(1),this.complete&&this.complete(1),!1;var e=t-this.start,n=this.easing(e/this.duration);return this.step&&this.step(n),!0},ao.stop=function(){this.abort&&this.abort(),this.running=!1};var oo={},uo=function(e){function n(t,n){e.call(this,t),this.ticker=null,t&&(this.key=E(n),this.isReadonly=t.isReadonly,t.value&&(this.value=t.value[this.key],oa(this.value)&&(this.length=this.value.length),this.adapt()))}e&&(n.__proto__=e);var s=n.prototype=Object.create(e&&e.prototype);return s.constructor=n,s.adapt=function(){var t=this,e=this.root.adaptors,n=e.length;if(this.rewrap=!1,0!==n){var i=this.wrapper?"newWrapperValue"in this?this.newWrapperValue:this.wrapperValue:this.value,r=this.root.ractive,s=this.getKeypath();if(this.wrapper){var a=this.wrapperValue===i?!1:!this.wrapper.reset||this.wrapper.reset(i)===!1;if(!a)return delete this.newWrapperValue,void(this.value=this.wrapper.get());if(this.wrapper.teardown(),delete this.wrapper,delete this.wrapperValue,void 0!==this.value){var o=this.parent.value||this.parent.createBranch(this.key);o[this.key]!==i&&(o[this.key]=i),this.value=i}}var u;for(u=0;n>u;u+=1){var h=e[u];if(h.filter(i,s,r)){t.wrapper=h.wrap(r,i,s,gt(s)),t.wrapperValue=i,t.wrapper.__model=t,t.value=t.wrapper.get();break}}}},s.animate=function(t,e,n,i){var r=this;this.ticker&&this.ticker.stop();var s,a=new Promise(function(t){return s=t});return this.ticker=new so({duration:n.duration,easing:n.easing,step:function(t){var e=i(t);r.applyValue(e),n.step&&n.step(t,e)},complete:function(){r.applyValue(e),n.complete&&n.complete(e),r.ticker=null,s(e)}}),a.stop=this.ticker.stop,a},s.applyValue=function(t,e){if(void 0===e&&(e=!0),!i(t,this.value)){if(this.boundValue&&(this.boundValue=null),this.parent.wrapper&&this.parent.wrapper.set)this.parent.wrapper.set(this.key,t),this.parent.value=this.parent.wrapper.get(),this.value=this.parent.value[this.key],this.wrapper&&(this.newWrapperValue=this.value),this.adapt();else if(this.wrapper)this.newWrapperValue=t,this.adapt();else{var n=this.parent.value||this.parent.createBranch(this.key);if(!a(n))return void v("Attempted to set a property of a non-object '"+this.getKeypath()+"'");n[this.key]=t,this.value=t,this.adapt()}oa(t)?(this.length=t.length,this.isArray=!0):this.isArray=!1,this.links.forEach(L),this.children.forEach(F),this.deps.forEach(L),e&&this.notifyUpstream(),this.parent.isArray&&("length"===this.key?this.parent.length=t:this.parent.joinKey("length").mark())}},s.createBranch=function(t){var e=r(t)?[]:{};return this.applyValue(e,!1),e},s.get=function(t,e){return this._link?this._link.get(t,e):(t&&B(this),e&&e.virtual?this.getVirtual(!1):et(this,(e&&"unwrap"in e?e.unwrap!==!1:t)&&this.wrapper?this.wrapperValue:this.value,!e||e.shouldBind!==!1))},s.getKeypathModel=function(){return this.keypathModel||(this.keypathModel=new $a(this)),this.keypathModel},s.joinKey=function(e,i){if(this._link)return!i||i.lastLink===!1||void 0!==e&&""!==e?this._link.joinKey(e):this;if(void 0===e||""===e)return this;if(!t(this.childByKey,e)){var r=new n(this,e);this.children.push(r),this.childByKey[e]=r}return!this.childByKey[e]._link||i&&i.lastLink===!1?this.childByKey[e]:this.childByKey[e]._link},s.mark=function(t){if(this._link)return this._link.mark(t);var e=this.value,n=this.retrieve();(t||!i(n,e))&&(this.value=n,this.boundValue&&(this.boundValue=null),(e!==n||this.rewrap)&&(this.wrapper&&(this.newWrapperValue=n),this.adapt()),oa(n)?(this.length=n.length,this.isArray=!0):this.isArray=!1,this.children.forEach(t?z:F),this.links.forEach(U),this.deps.forEach(L))},s.merge=function(t,e){var n=this.value,i=t;n===i&&(n=yt(this)),e&&(n=n.map(e),i=i.map(e));var r=n.length,s={},a=0,o=n.map(function(t){var e,n=a;do{if(e=i.indexOf(t,n),-1===e)return-1;n=e+1}while(s[e]===!0&&r>n);return e===a&&(a+=1),s[e]=!0,e});this.parent.value[this.key]=t,this.shuffle(o,!0)},s.retrieve=function(){return this.parent.value?this.parent.value[this.key]:void 0},s.set=function(t){this.ticker&&this.ticker.stop(),this.applyValue(t)},s.shuffle=function(t,e){st(this,t,!1,e)},s.source=function(){return this},s.teardown=function(){this._link&&(this._link.teardown(),this._link=null),this.children.forEach(Z),this.wrapper&&this.wrapper.teardown(),this.keypathModel&&this.keypathModel.teardown()},n}(Ga),ho={},lo=function(t){function e(e,n){t.call(this,null,"@"+n),this.key="@"+n,this.value=e,this.isRoot=!0,this.root=this,this.adaptors=[]}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.getKeypath=function(){return this.key},n.retrieve=function(){return this.value},e}(uo),co=new lo(ho,"shared"),fo=new lo("undefined"!=typeof global?global:window,"global"),po=function(t){this.context=t};po.prototype.get=function(){return this.context};var mo={},vo=function(t){this.ractive=t};vo.prototype.findContext=function(){return this.ractive.viewmodel};var go=vo.prototype;go.getContext=_t,go.find=go.findComponent=go.findAll=go.findAllComponents=Oa;var yo=!1,bo=/\*/,wo={virtual:!1},xo={},_o="Cannot add to a non-numeric value",ko=xa.linear,Eo={},Ao={},Co=function(t){this.event=t,this.method="on"+t};Co.prototype.fire=function(t,e){var n=xt(t);t[this.method]&&(e?t[this.method](n,e):t[this.method](n)),Kt(t,this.event,n,e?[e,t]:[t])};var So=new Co("attachchild"),Oo=new Co("detach"),jo=new Co("detachchild"),No=1,To=2,Vo=3,Po=4,Io=5,Mo=6,Bo=7,Ro=8,Ko=9,Do=10,Lo=11,Fo=13,zo=14,Uo=15,$o=16,qo=17,Ho=18,Zo=19,Wo=20,Go=21,Yo=22,Qo=23,Jo=24,Xo=25,tu=26,eu=27,nu=30,iu=31,ru=32,su=33,au=34,ou=35,uu=36,hu=40,lu=50,cu=51,du=52,fu=53,pu=54,mu=60,vu=61,gu=70,yu=71,bu=72,wu=73,xu=74,_u=Array.prototype,ku=function(t){function e(t){for(var e=[],i=arguments.length-1;i-->0;)e[i]=arguments[i+1];return n(this.viewmodel.joinAll(k(t)),e)}function n(e,n){var i=e.get();if(!oa(i)){if(void 0===i){i=[];var r=_u[t].apply(i,n),s=no.start().then(function(){return r});return e.set(i),no.end(),s}throw new Error("shuffle array method "+t+" called on non-array at "+e.getKeypath())}var a=ie(i.length,t,n),o=_u[t].apply(i,n),u=no.start().then(function(){return o});return u.result=o,a?e.shuffle?e.shuffle(a):e.mark():e.set(o),no.end(),u}return{path:e,model:n}},Eu=new Co("update"),Au=ku("push").model,Cu=ku("pop").model,Su=ku("shift").model,Ou=ku("unshift").model,ju=ku("sort").model,Nu=ku("splice").model,Tu=ku("reverse").model,Vu=function(t){function e(e){t.call(this,null,null),this.isRoot=!0,this.root=this,this.value={},this.ractive=e.ractive,this.adaptors=[],this.context=e.context}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.getKeypath=function(){return"@context.data"},e}(uo),Pu=function(t,e){this.fragment=t,this.element=e||ne(t),this.node=this.element&&this.element.node,this.ractive=t.ractive,this.root=this},Iu=Pu.prototype,Mu={decorators:{},_data:{}};Mu.decorators.get=function(){var t={};return this.element?(this.element.decorators.forEach(function(e){return t[e.name]=e.handle}),t):t},Mu._data.get=function(){return this.model||(this.root.model=new Vu({ractive:this.ractive,context:this.root}))},Iu.add=function(t,e,n){var i=l(e)?+e:1,s=o(e)?e:n;return Et(oe(this,t,i).map(function(t){var e=t[0],n=t[1],i=e.get();if(!r(n)||!r(i))throw new Error("Cannot add non-numeric value");return[e,i+n]}),s)},Iu.animate=function(t,e,n){var i=ue(this,t).model;return Pt(this.ractive,i,e,n)},Iu.get=function(t){if(!t)return this.fragment.findContext().get(!0);var e=ue(this,t),n=e.model;return n?n.get(!0):void 0},Iu.getParent=function(t){var e=this.fragment;return e.context?e=kt(e.parent||t&&e.componentParent):(e=kt(e.parent||t&&e.componentParent),e&&(e=kt(e.parent||t&&e.componentParent))),e&&e!==this.fragment?e.getContext():void 0},Iu.hasListener=function(t,e){var n=this.element||this.fragment.owner;do{if(n.template.t===Bo&&he(n,t))return!0;n=n.up&&n.up.owner,n&&n.component&&(n=n.component)}while(n&&e)},Iu.link=function(t,e){var n=ue(this,t).model,i=ue(this,e).model,r=no.start();return i.link(n,t),no.end(),r},Iu.listen=function(t,e){var n=this.element;return n.on(t,e),{cancel:function(){n.off(t,e)}}},Iu.observe=function(t,e,n){return void 0===n&&(n={}),s(t)&&(n=e||{}),n.fragment=this.fragment,this.ractive.observe(t,e,n)},Iu.observeOnce=function(t,e,n){return void 0===n&&(n={}),s(t)&&(n=e||{}),n.fragment=this.fragment,this.ractive.observeOnce(t,e,n)},Iu.pop=function(t){return Cu(ue(this,t).model,[])},Iu.push=function(t){for(var e=[],n=arguments.length-1;n-->0;)e[n]=arguments[n+1];return Au(ue(this,t).model,e)},Iu.raise=function(t,e){for(var n=[],i=arguments.length-2;i-->0;)n[i]=arguments[i+2];for(var r,s=this.element;s;){if(s.component&&(s=s.component),r=he(s,t))return r.fire(r.element.getContext(e||{},!e||"original"in e?{}:{original:{}}),n);s=s.up&&s.up.owner}},Iu.readLink=function(t,e){return this.ractive.readLink(this.resolve(t),e)},Iu.resolve=function(t,e){var n=ue(this,t),i=n.model,r=n.instance;return i?i.getKeypath(e||r):t},Iu.reverse=function(t){return Tu(ue(this,t).model,[])},Iu.set=function(t,e,n){return Et(oe(this,t,e),n)},Iu.shift=function(t){return Su(ue(this,t).model,[])},Iu.splice=function(t,e,n){for(var i=[],r=arguments.length-3;r-->0;)i[r]=arguments[r+3];return i.unshift(e,n),Nu(ue(this,t).model,i)},Iu.sort=function(t){return ju(ue(this,t).model,[])},Iu.subtract=function(t,e,n){var i=l(e)?e:1,s=o(e)?e:n;return Et(oe(this,t,i).map(function(t){var e=t[0],n=t[1],i=e.get();if(!r(n)||!r(i))throw new Error("Cannot add non-numeric value");return[e,i-n]}),s)},Iu.toggle=function(t,e){var n=ue(this,t),i=n.model;return Et([[i,!i.get()]],e)},Iu.unlink=function(t){var e=ue(this,t).model,n=no.start();return e.owner&&e.owner._link&&e.owner.unlink(),no.end(),n},Iu.unlisten=function(t,e){this.element.off(t,e)},Iu.unshift=function(t){for(var e=[],n=arguments.length-1;n-->0;)e[n]=arguments[n+1];return Ou(ue(this,t).model,e)},Iu.update=function(t,e){return se(this.ractive,ue(this,t).model,e)},Iu.updateModel=function(t,e){var n=ue(this,t),i=n.model,r=no.start();return i.updateFromBindings(e),no.end(),r},Iu.isBound=function(){var t=this.getBindingModel(this),e=t.model;return!!e},Iu.getBindingPath=function(t){var e=this.getBindingModel(this),n=e.model,i=e.instance;return n?n.getKeypath(t||i):void 0},Iu.getBinding=function(){var t=this.getBindingModel(this),e=t.model;return e?e.get(!0):void 0},Iu.getBindingModel=function(t){var e=t.element;return{model:e.binding&&e.binding.model,instance:e.up.ractive}},Iu.setBinding=function(t){var e=this.getBindingModel(this),n=e.model;return Et([[n,t]])},Object.defineProperties(Iu,Mu),Pu.forRactive=xt,mo.Context=Pu;var Bu,Ru,Ku,Du,Lu,Fu,zu,Uu,$u,qu=ka&&ka.querySelector,Hu="http://www.w3.org/1999/xhtml",Zu="http://www.w3.org/1998/Math/MathML",Wu="http://www.w3.org/2000/svg",Gu="http://www.w3.org/1999/xlink",Yu="http://www.w3.org/XML/1998/namespace",Qu="http://www.w3.org/2000/xmlns",Ju={html:Hu,mathml:Zu,svg:Wu,xlink:Gu,xml:Yu,xmlns:Qu};if(Bu=Ca?function(t,e,n){return e&&e!==Hu?n?ka.createElementNS(e,t,n):ka.createElementNS(e,t):n?ka.createElement(t,n):ka.createElement(t)}:function(t,e,n){if(e&&e!==Hu)throw"This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you're trying to render SVG in an older browser. See http://ractive.js.org/support/#svgs for more information";return n?ka.createElement(t,n):ka.createElement(t)},Ea){for(Ku=Bu("div"),Du=["matches","matchesSelector"],$u=function(t){return function(e,n){return e[t](n)}},zu=Du.length;zu--&&!Ru;)if(Lu=Du[zu],Ku[Lu])Ru=$u(Lu);else for(Uu=Sa.length;Uu--;)if(Fu=Sa[zu]+Lu.substr(0,1).toUpperCase()+Lu.substring(1),Ku[Fu]){Ru=$u(Fu);break}Ru||(Ru=function(t,e){var n,i;n=t.parentNode,n||(Ku.innerHTML="",n=Ku,t=t.cloneNode(),Ku.appendChild(t));var r=n.querySelectorAll(e);for(i=r.length;i--;)if(r[i]===t)return!0;return!1})}else Ru=null;var Xu=new Co("insert"),th=function(t,e,n,i){this.context=i.context||t,this.callback=n,this.ractive=t,this.keypath=i.keypath,this.options=i,e&&this.resolved(e),u(i.old)&&(this.oldContext=na(t),this.oldFn=i.old),i.init!==!1?(this.dirty=!0,this.dispatch()):Ae(this),this.dirty=!1},eh=th.prototype;eh.cancel=function(){this.cancelled=!0,this.model?this.model.unregister(this):this.resolver.unbind(),N(this.ractive._observers,this)},eh.dispatch=function(){this.cancelled||(this.callback.call(this.context,this.newValue,this.oldValue,this.keypath),Ae(this,!0),this.dirty=!1)},eh.handleChange=function(){var t=this;if(!this.dirty){var e=this.model.get();if(i(e,this.oldValue))return;if(this.newValue=e,this.options.strict&&this.newValue===this.oldValue)return;no.addObserver(this,this.options.defer),this.dirty=!0,this.options.once&&no.scheduleTask(function(){return t.cancel()})}},eh.rebind=function(t,e){var n=this;return t=at(this.keypath,t,e),t===this.model?!1:(this.model&&this.model.unregister(this),void(t&&t.addShuffleTask(function(){return n.resolved(t)})))},eh.resolved=function(t){this.model=t,this.oldValue=void 0,this.newValue=t.get(),t.register(this)};var nh=/\*+/g,ih=function(t,e,n,i,r){var s=this;this.context=r.context||t,this.ractive=t,this.baseModel=e,this.keys=n,this.callback=i;var a=n.join("\\.").replace(nh,"(.+)"),o=this.baseKeypath=e.getKeypath(t);this.pattern=new RegExp("^"+(o?o+"\\.":"")+a+"$"),this.recursive=1===n.length&&"**"===n[0],this.recursive&&(this.keys=["*"]),r.old&&(this.oldContext=na(t),this.oldFn=r.old),this.oldValues={},this.newValues={},this.defer=r.defer,this.once=r.once,this.strict=r.strict,this.dirty=!1,this.changed=[],this.partial=!1,this.links=r.links;var u=e.findMatches(this.keys);u.forEach(function(t){s.newValues[t.getKeypath(s.ractive)]=t.get()}),r.init!==!1?this.dispatch():Ce(this,this.newValues),e.registerPatternObserver(this)},rh=ih.prototype;rh.cancel=function(){this.baseModel.unregisterPatternObserver(this),N(this.ractive._observers,this)},rh.dispatch=function(){var t=this,e=this.newValues;this.newValues={},sa(e).forEach(function(n){var r=e[n],s=t.oldValues[n];if(!(t.strict&&r===s||i(r,s))){var a=[r,s,n];if(n){var o=t.pattern.exec(n);o&&(a=a.concat(o.slice(1)))}t.callback.apply(t.context,a)}}),Ce(this,e,this.partial),this.dirty=!1},rh.notify=function(t){this.changed.push(t)},rh.shuffle=function(t){var e=this;if(oa(this.baseModel.value)){for(var n=this.baseModel.value.length,i=0;i<t.length;i++)-1!==t[i]&&t[i]!==i&&e.changed.push([i]);for(var r=t.touchedFrom;n>r;r++)e.changed.push([r])}},rh.handleChange=function(){var t=this;if(!this.dirty||this.changed.length){if(this.dirty||(this.newValues={}),this.changed.length){var e=0;if(this.recursive)this.changed.forEach(function(n){var i=t.baseModel.joinAll(n);(!i.isLink||t.links)&&(e++,t.newValues[i.getKeypath(t.ractive)]=i.get())});else{var n=this.baseModel.isRoot?this.changed.map(function(t){return t.map(x).join(".")}):this.changed.map(function(e){return t.baseKeypath+"."+e.map(x).join(".")});this.baseModel.findMatches(this.keys).forEach(function(i){var r=i.getKeypath(t.ractive),s=function(t){return 0===t.indexOf(r)&&(t.length===r.length||"."===t[r.length])||0===r.indexOf(t)&&(t.length===r.length||"."===r[t.length])};n.filter(s).length&&(e++,t.newValues[r]=i.get())})}if(!e)return;this.partial=!0}else this.baseModel.findMatches(this.keys).forEach(function(e){var n=e.getKeypath(t.ractive);t.newValues[n]=e.get()}),this.partial=!1;no.addObserver(this,this.defer),this.dirty=!0,this.changed.length=0,this.once&&this.cancel()}};var sh=function(t,e,n,i){this.ractive=t,this.model=e,this.keypath=e.getKeypath(),this.callback=n,this.options=i,this.pending=null,e.register(this),i.init!==!1?(this.sliced=[],this.shuffle([]),this.dispatch()):this.sliced=this.slice()},ah=sh.prototype;ah.cancel=function(){this.model.unregister(this),N(this.ractive._observers,this)},ah.dispatch=function(){this.callback(this.pending),this.pending=null,this.options.once&&this.cancel()},ah.handleChange=function(t){this.pending?no.addObserver(this,this.options.defer):t||(this.shuffle(this.sliced.map(Se)),this.handleChange())},ah.shuffle=function(t){var e,n=this,i=this.slice(),r=[],s=[],a={};t.forEach(function(t,i){a[t]=!0,t!==i&&void 0===e&&(e=i),-1===t&&s.push(n.sliced[i])}),void 0===e&&(e=t.length);for(var o=i.length,u=0;o>u;u+=1)a[u]||r.push(i[u]);this.pending={inserted:r,deleted:s,start:e},this.sliced=i},ah.slice=function(){var t=this.model.get();return oa(t)?t.slice():[]};var oh={init:!1,once:!0},uh=function(t){return t.trim()},hh=function(t){return""!==t},lh=ku("pop").path,ch=ku("push").path,dh="/* Ractive.js component styles */",fh=[],ph=!1,mh=null,vh=null,gh={extend:function(t,e,n){e.adapt=T(e.adapt,O(n.adapt))},init:function(){}},yh=/\/\*(?:[\s\S]*?)\*\//g,bh=/url\(\s*(['"])(?:\\[\s\S]|(?!\1).)*\1\s*\)|url\((?:\\[\s\S]|[^)])*\)|(['"])(?:\\[\s\S]|(?!\2).)*\2/gi,wh=/\0(\d+)/g,xh=function(t,e,n){void 0===n&&(n=[]);var i=[],r=function(t){return t.replace(wh,function(t,e){return i[e]})};return t=t.replace(bh,function(t){return"\x00"+(i.push(t)-1)}).replace(yh,""),n.forEach(function(e){t=t.replace(e,function(t){return"\x00"+(i.push(t)-1)})}),e(t,r)},_h=/(?:^|\}|\{)\s*([^\{\}\0]+)\s*(?=\{)/g,kh=/@keyframes\s+[^\{\}]+\s*\{(?:[^{}]+|\{[^{}]+})*}/gi,Eh=/((?:(?:\[[^\]]+\])|(?:[^\s\+\>~:]))+)((?:::?[^\s\+\>\~\(:]+(?:\([^\)]+\))?)*\s*[\s\+\>\~]?)\s*/g,Ah=/^(?:@|\d+%)/,Ch=/\[data-ractive-css~="\{[a-z0-9-]+\}"]/g,Sh=function(t){function e(e){t.call(this,e.cssData,"@style"),this.component=e}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.downstreamChanged=function(t,e){if(!this.locked){var n=this.component;n.extensions.forEach(function(n){var i=n._cssModel;i.mark(),i.downstreamChanged(t,e||1)}),e||He(n,!0)}},e}(lo),Oh=/\{/,jh={name:"css",extend:function(t,e,n,i){i._cssIds=We(t),ia(i,"cssData",{configurable:!0,value:ea(na(t.cssData),n.cssData||{})}),ia(i,"_cssModel",{configurable:!0,value:new Sh(i)}),n.css&&Ye(n,i,e)},init:function(t,e,n){n.css&&v("\nThe css option is currently not supported on a per-instance basis and will be discarded. Instead, we recommend instantiating from a component definition with a css option.\n\nconst Component = Ractive.extend({\n	...\n	css: '/* your css */',\n	...\n});\n\nconst componentInstance = new Component({ ... })\n		")}},Nh={name:"data",extend:function(t,e,n){var i,r;if(n.data&&s(n.data))for(i in n.data)r=n.data[i],r&&o(r)&&(s(r)||oa(r))&&v("Passing a `data` option with object and array properties to Ractive.extend() is discouraged, as mutating them is likely to cause bugs. Consider using a data function instead:\n\n  // this...\n  data: function () {\n    return {\n      myObject: {}\n    };\n  })\n\n  // instead of this:\n  data: {\n    myObject: {}\n  }");e.data=Xe(e.data,n.data)},init:function(t,e,n){var i=Xe(t.prototype.data,n.data);if(u(i)&&(i=i.call(e)),i&&i.constructor===Object)for(var r in i)if(u(i[r])){var s=i[r];i[r]=tt(s,e),i[r]._r_unbound=s}return i||{}},reset:function(t){var e=this.init(t.constructor,t,t.viewmodel);return t.viewmodel.root.set(e),!0}},Th=4,Vh=/\$\{([^\}]+)\}/g,Ph=/^\s+/,Ih=function(t){this.name="ParseError",this.message=t;try{throw new Error(t)}catch(e){this.stack=e.stack}};Ih.prototype=Error.prototype;var Mh=function(t,e){var n,i=0;this.str=t,this.options=e||{},this.pos=0,this.lines=this.str.split("\n"),this.lineEnds=this.lines.map(function(t){var e=i+t.length+1;return i=e,e},0),this.init&&this.init(t,e);for(var r=[];this.pos<this.str.length&&(n=this.read());)r.push(n);this.leftover=this.remaining(),this.result=this.postProcess?this.postProcess(r,e):r};Mh.prototype={read:function(t){var e,n,i=this;t||(t=this.converters);var r=this.pos,s=t.length;for(e=0;s>e;e+=1)if(i.pos=r,n=t[e](i))return n;return null},getContextMessage:function(t,e){var n=this.getLinePos(t),i=n[0],r=n[1];if(-1===this.options.contextLines)return[i,r,e+" at line "+i+" character "+r];var s=this.lines[i-1],a="",o="";if(this.options.contextLines){var u=i-1-this.options.contextLines<0?0:i-1-this.options.contextLines;a=this.lines.slice(u,i-1-u).join("\n").replace(/\t/g,"  "),o=this.lines.slice(i,i+this.options.contextLines).join("\n").replace(/\t/g,"  "),a&&(a+="\n"),o&&(o="\n"+o)}var h=0,l=a+s.replace(/\t/g,function(t,e){return r>e&&(h+=1),"  "})+"\n"+new Array(r+h).join(" ")+"^----"+o;return[i,r,e+" at line "+i+" character "+r+":\n"+l]},getLinePos:function(t){for(var e=this,n=0,i=0;t>=this.lineEnds[n];)i=e.lineEnds[n],n+=1;var r=t-i;return[n+1,r+1,t]},error:function Ip(t){var e=this.getContextMessage(this.pos,t),n=e[0],i=e[1],r=e[2],Ip=new Ih(r);throw Ip.line=n,Ip.character=i,Ip.shortMessage=t,Ip},matchString:function(t){return this.str.substr(this.pos,t.length)===t?(this.pos+=t.length,t):void 0},matchPattern:function(t){var e;return(e=t.exec(this.remaining()))?(this.pos+=e[0].length,e[1]||e[0]):void 0},sp:function(){this.matchPattern(Ph)},remaining:function(){return this.str.substring(this.pos)},nextChar:function(){return this.str.charAt(this.pos)},warn:function(t){var e=this.getContextMessage(this.pos,t)[2];v(e)}},Mh.extend=function(e){var n=this,i=function(t,e){Mh.call(this,t,e)};i.prototype=na(n.prototype);for(var r in e)t(e,r)&&(i.prototype[r]=e[r]);return i.extend=Mh.extend,i};var Bh,Rh=/^[^\s=]+/,Kh=/^\s+/,Dh=/^(\/(?:[^\n\r\u2028\u2029\/\\[]|\\.|\[(?:[^\n\r\u2028\u2029\]\\]|\\.)*])+\/(?:([gimuy])(?![a-z]*\2))*(?![a-zA-Z_$0-9]))/,Lh=/[-\/\\^$*+?.()|[\]{}]/g,Fh={},zh=function(t,e){return t.search(Fh[e.join()]||(Fh[e.join()]=new RegExp(e.map(on).join("|"))))},Uh=/^(allowFullscreen|async|autofocus|autoplay|checked|compact|controls|declare|default|defaultChecked|defaultMuted|defaultSelected|defer|disabled|enabled|formNoValidate|hidden|indeterminate|inert|isMap|itemScope|loop|multiple|muted|noHref|noResize|noShade|noValidate|noWrap|open|pauseOnExit|readOnly|required|reversed|scoped|seamless|selected|sortable|translate|trueSpeed|typeMustMatch|visible)$/i,$h=/^(?:area|base|br|col|command|doctype|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i,qh={quot:34,amp:38,apos:39,lt:60,gt:62,nbsp:160,iexcl:161,cent:162,pound:163,curren:164,yen:165,brvbar:166,sect:167,uml:168,copy:169,ordf:170,laquo:171,not:172,shy:173,reg:174,macr:175,deg:176,plusmn:177,sup2:178,sup3:179,acute:180,micro:181,para:182,middot:183,cedil:184,sup1:185,ordm:186,raquo:187,frac14:188,frac12:189,frac34:190,iquest:191,Agrave:192,Aacute:193,Acirc:194,Atilde:195,Auml:196,Aring:197,AElig:198,Ccedil:199,Egrave:200,Eacute:201,Ecirc:202,Euml:203,Igrave:204,Iacute:205,Icirc:206,Iuml:207,ETH:208,Ntilde:209,Ograve:210,Oacute:211,Ocirc:212,Otilde:213,Ouml:214,times:215,Oslash:216,Ugrave:217,Uacute:218,Ucirc:219,Uuml:220,Yacute:221,THORN:222,szlig:223,agrave:224,aacute:225,acirc:226,atilde:227,auml:228,aring:229,aelig:230,ccedil:231,egrave:232,eacute:233,ecirc:234,euml:235,igrave:236,iacute:237,icirc:238,iuml:239,eth:240,ntilde:241,ograve:242,oacute:243,ocirc:244,otilde:245,ouml:246,divide:247,oslash:248,ugrave:249,uacute:250,ucirc:251,uuml:252,yacute:253,thorn:254,yuml:255,OElig:338,oelig:339,Scaron:352,scaron:353,Yuml:376,fnof:402,circ:710,tilde:732,Alpha:913,Beta:914,Gamma:915,Delta:916,Epsilon:917,Zeta:918,Eta:919,Theta:920,Iota:921,Kappa:922,Lambda:923,Mu:924,Nu:925,Xi:926,Omicron:927,Pi:928,Rho:929,Sigma:931,Tau:932,Upsilon:933,Phi:934,Chi:935,Psi:936,Omega:937,alpha:945,beta:946,gamma:947,delta:948,epsilon:949,zeta:950,eta:951,theta:952,iota:953,kappa:954,lambda:955,mu:956,nu:957,xi:958,omicron:959,pi:960,rho:961,sigmaf:962,sigma:963,tau:964,upsilon:965,phi:966,chi:967,psi:968,omega:969,thetasym:977,upsih:978,piv:982,ensp:8194,emsp:8195,thinsp:8201,zwnj:8204,zwj:8205,lrm:8206,rlm:8207,ndash:8211,mdash:8212,lsquo:8216,rsquo:8217,sbquo:8218,ldquo:8220,rdquo:8221,bdquo:8222,dagger:8224,Dagger:8225,bull:8226,hellip:8230,permil:8240,prime:8242,Prime:8243,lsaquo:8249,rsaquo:8250,oline:8254,frasl:8260,euro:8364,image:8465,weierp:8472,real:8476,trade:8482,alefsym:8501,larr:8592,uarr:8593,rarr:8594,darr:8595,harr:8596,crarr:8629,lArr:8656,uArr:8657,rArr:8658,dArr:8659,hArr:8660,forall:8704,part:8706,exist:8707,empty:8709,nabla:8711,isin:8712,notin:8713,ni:8715,prod:8719,sum:8721,minus:8722,lowast:8727,radic:8730,prop:8733,infin:8734,ang:8736,and:8743,or:8744,cap:8745,cup:8746,"int":8747,there4:8756,sim:8764,cong:8773,asymp:8776,ne:8800,equiv:8801,le:8804,ge:8805,sub:8834,sup:8835,nsub:8836,sube:8838,supe:8839,oplus:8853,otimes:8855,perp:8869,sdot:8901,lceil:8968,rceil:8969,lfloor:8970,rfloor:8971,lang:9001,rang:9002,loz:9674,spades:9824,clubs:9827,hearts:9829,diams:9830},Hh=[8364,129,8218,402,8222,8230,8224,8225,710,8240,352,8249,338,141,381,143,144,8216,8217,8220,8221,8226,8211,8212,732,8482,353,8250,339,157,382,376],Zh=new RegExp("&(#?(?:x[\\w\\d]+|\\d+|"+sa(qh).join("|")+"));?","g"),Wh=u(String.fromCodePoint),Gh=Wh?String.fromCodePoint:String.fromCharCode,Yh=/</g,Qh=/>/g,Jh=/&/g,Xh=65533,tl="Expected a JavaScript expression",el="Expected closing paren",nl=/^(?:[+-]?)0*(?:(?:(?:[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/,il=/^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/,rl=/^\\(?:[`'"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/,sl=/^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/,al=function(t){return function(e){for(var n,i='"',r=!1;!r;)n=e.matchPattern(il)||e.matchPattern(rl)||e.matchString(t),n?i+='"'===n?'\\"':"\\'"===n?"'":n:(n=e.matchPattern(sl),n?i+="\\u"+("000"+n.charCodeAt(1).toString(16)).slice(-4):r=!0);return i+='"',JSON.parse(i)}},ol=al('"'),ul=al("'"),hl=function(t){var e=t.pos,n=t.matchString("'")||t.matchString('"');if(n){var i=("'"===n?ol:ul)(t);return t.matchString(n)?{t:Go,v:i}:(t.pos=e,null)}return null},ll=/^[^`"\\\$]+?(?:(?=[`"\\\$]))/,cl=/[\r\n\t\b\f]/g,dl=/^[a-zA-Z_$][a-zA-Z_$0-9]*/,fl=/^\s*\.{3}/,pl=/^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:\.(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/,ml=/^[a-zA-Z_$][-\/a-zA-Z_$0-9]*(?:\.(?:[a-zA-Z_$][-\/a-zA-Z_$0-9]*))*/,vl=/^[a-zA-Z_$][a-zA-Z_$0-9]*$/,gl=function(t){var e=t.pos;if(t.sp(),!t.matchString("{"))return t.pos=e,null;var n=yn(t);return t.sp(),t.matchString("}")?{t:Qo,m:n}:(t.pos=e,null)},yl=function(t){var e=t.pos;if(t.sp(),!t.matchString("["))return t.pos=e,null;var n=An(t,!0);return t.matchString("]")?{t:Yo,m:n}:(t.pos=e,null)},bl=/^(?:Array|console|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null|Object|Number|String|Boolean)\b/,wl=/^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/,xl=/^(?:\@\.|\@|~\/|(?:\^\^\/(?:\^\^\/)*(?:\.\.\/)*)|(?:\.\.\/)+|\.\/(?:\.\.\/)*|\.)/,_l=/^(key|index|keypath|rootpath|this|global|shared|context|event|node|local|style)/,kl=function(t){return bn(t)||wn(t)||xn(t)},El=function(t){var e=kl(t);if(!e)return null;for(;e;){var n=_n(t);if(n)e={t:ru,x:e,r:n};else{if(!t.matchString("("))break;t.sp();var i=An(t,!0);t.sp(),t.matchString(")")||t.error(el),e={t:hu,x:e},i&&(e.o=i)}}return e},Al=function(t,e){return function(n){var i;return(i=e(n))?i:n.matchString(t)?(n.sp(),i=En(n),i||n.error(tl),{s:t,o:i,t:su}):null}};!function(){var t,e,n,i,r="! ~ + - typeof".split(" ");for(i=El,t=0,e=r.length;e>t;t+=1)n=Al(r[t],i),i=n;Bh=i}();var Cl,Sl=Bh,Ol=function(t,e){return function(n){if(n.inUnquotedAttribute&&(">"===t||"/"===t))return e(n);var i,r,s;if(r=e(n),!r)return null;for(;;){if(i=n.pos,n.sp(),!n.matchString(t))return n.pos=i,r;if("in"===t&&/[a-zA-Z_$0-9]/.test(n.remaining().charAt(0)))return n.pos=i,r;if(n.sp(),s=e(n),!s)return n.pos=i,r;r={t:uu,s:t,o:[r,s]}}}};!function(){var t,e,n,i,r="* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||".split(" ");for(i=Sl,t=0,e=r.length;e>t;t+=1)n=Ol(r[t],i),i=n;Cl=i}();var jl=Cl,Nl=/^[^\s"'>\/=]+/,Tl=/^on/,Vl=/^on-([a-zA-Z\*\.$_]((?:[a-zA-Z\*\.$_0-9\-]|\\-)+))$/,Pl=/^(?:change|reset|teardown|update|construct|config|init|render|complete|unrender|detach|insert|destruct|attachchild|detachchild)$/,Il=/^as-([a-z-A-Z][-a-zA-Z_0-9]*)$/,Ml=/^([a-zA-Z](?:(?!-in-out)[-a-zA-Z_0-9])*)-(in|out|in-out)$/,Bl=/^((bind|class)-(([-a-zA-Z0-9_])+))$/,Rl={lazy:{t:wu,v:"l"},twoway:{t:wu,v:"t"},"no-delegation":{t:xu}},Kl=/^[^\s"'=<>\/`]+/,Dl=/^[^\s"'=<>@\[\]()]*/,Ll=/^\s+/,Fl=/\\/g,zl={t:Do,exclude:!0},Ul=/^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/,$l=/^as/i,ql=/^\s*else\s*/,Hl=/^\s*elseif\s+/,Zl={each:du,"if":lu,"with":pu,unless:cu},Wl=/^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,Gl=/^\s*,\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/,Yl=new RegExp("^("+sa(Zl).join("|")+")\\b"),Ql="<!--",Jl="-->",Xl=/^[ \t\f\r\n]*\r?\n/,tc=/\r?\n[ \t\f\r\n]*$/,ec=function(t){var e,n,i,r,s;for(e=1;e<t.length;e+=1)n=t[e],i=t[e-1],r=t[e-2],h(n)&&ni(i)&&h(r)&&tc.test(r)&&Xl.test(n)&&(t[e-2]=r.replace(tc,"\n"),t[e]=n.replace(Xl,"")),ii(n)&&h(i)&&tc.test(i)&&h(n.f[0])&&Xl.test(n.f[0])&&(t[e-1]=i.replace(tc,"\n"),n.f[0]=n.f[0].replace(Xl,"")),h(n)&&ii(i)&&(s=j(i.f),h(s)&&tc.test(s)&&Xl.test(n)&&(i.f[i.f.length-1]=s.replace(tc,"\n"),t[e]=n.replace(Xl,"")));return t},nc=function(t,e,n){var i;e&&(i=t[0],h(i)&&(i=i.replace(e,""),i?t[0]=i:t.shift())),n&&(i=j(t),h(i)&&(i=i.replace(n,""),i?t[t.length-1]=i:t.pop()))},ic=/[ \t\f\r\n]+/g,rc=/^(?:pre|script|style|textarea)$/i,sc=/^[ \t\f\r\n]+/,ac=/[ \t\f\r\n]+$/,oc=/^(?:\r\n|\r|\n)/,uc=/(?:\r\n|\r|\n)$/,hc=/^([a-zA-Z]{1,}:?[a-zA-Z0-9\-]*)\s*\>/,lc=/^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/,cc=/^[a-zA-Z_$][-a-zA-Z0-9_$]*/,dc=/^[\s\n\/>]/,fc={exclude:!0},pc={li:["li"],dt:["dt","dd"],dd:["dt","dd"],p:"address article aside blockquote div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul".split(" "),rt:["rt","rp"],rp:["rt","rp"],optgroup:["optgroup"],option:["option","optgroup"],thead:["tbody","tfoot"],tbody:["tbody","tfoot"],tfoot:["tbody"],tr:["tr","tbody"],td:["td","th","tr"],th:["td","th","tr"]},mc=/^\s*#\s*partial\s+/,vc={},gc=[Wn,qn,ti,Yn,Gn],yc=[$n],bc=[zn,ei,ai,hi],wc=[li],xc=["script","style","template"],_c=Mh.extend({init:function(t,e){var n=this,i=e.tripleDelimiters||vc.defaults.tripleDelimiters,r=e.staticDelimiters||vc.defaults.staticDelimiters,s=e.staticTripleDelimiters||vc.defaults.staticTripleDelimiters;this.standardDelimiters=e.delimiters||vc.defaults.delimiters,this.tags=[{isStatic:!1,isTriple:!1,open:this.standardDelimiters[0],close:this.standardDelimiters[1],readers:gc},{isStatic:!1,isTriple:!0,open:i[0],close:i[1],readers:yc},{isStatic:!0,isTriple:!1,open:r[0],close:r[1],readers:gc},{isStatic:!0,isTriple:!0,open:s[0],close:s[1],readers:yc}],this.contextLines=e.contextLines||vc.defaults.contextLines,this.sortMustacheTags(),this.sectionDepth=0,this.elementStack=[],this.interpolate=na(e.interpolate||vc.defaults.interpolate||{}),this.interpolate.textarea=!0,xc.forEach(function(t){return n.interpolate[t]=!e.interpolate||e.interpolate[t]!==!1}),e.sanitize===!0&&(e.sanitize={elements:"applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title".split(" "),eventAttributes:!0}),this.stripComments=e.stripComments!==!1,this.preserveWhitespace=e.preserveWhitespace,this.sanitizeElements=e.sanitize&&e.sanitize.elements,this.sanitizeEventAttributes=e.sanitize&&e.sanitize.eventAttributes,this.includeLinePositions=e.includeLinePositions,this.textOnlyMode=e.textOnlyMode,this.csp=e.csp,this.allowExpressions=e.allowExpressions,e.attributes&&(this.inTag=!0)},postProcess:function(t){if(!t.length)return{t:[],v:Th};if(this.sectionDepth>0&&this.error("A section was left open"),ri(t[0].t,this.stripComments,this.preserveWhitespace,!this.preserveWhitespace,!this.preserveWhitespace),this.csp!==!1){var e={};di(t[0].t,e),sa(e).length&&(t[0].e=e)}return t[0]},converters:[ci],sortMustacheTags:function(){this.tags.sort(function(t,e){return e.open.length-t.open.length})}}),kc=["delimiters","tripleDelimiters","staticDelimiters","staticTripleDelimiters","csp","interpolate","preserveWhitespace","sanitize","stripComments","contextLines","allowExpressions","attributes"],Ec="Either preparse or use a ractive runtime source that includes the parser. ",Ac="Either include a version of Ractive that can parse or convert your computation strings to functions.",Cc={
fromId:function(t,e){if(!ka){if(e&&e.noThrow)return;throw new Error("Cannot retrieve template #"+t+" as Ractive is not running in a browser.")}t&&(t=t.replace(/^#/,""));var n;if(!(n=ka.getElementById(t))){if(e&&e.noThrow)return;throw new Error("Could not find template element with id #"+t)}if("SCRIPT"!==n.tagName.toUpperCase()){if(e&&e.noThrow)return;throw new Error("Template element with id #"+t+", must be a <script> element")}return"textContent"in n?n.textContent:n.innerHTML},isParsed:function(t){return!h(t)},getParseOptions:function(t){return t.defaults&&(t=t.defaults),kc.reduce(function(e,n){return e[n]=t[n],e},{})},parse:function(t,e){gi(vi,"template",Ec);var n=vi(t,e);return xi(n),n},parseFor:function(t,e){return this.parse(t,this.getParseOptions(e))}},Sc=na(null),Oc={name:"template",extend:function(t,e,n){if("template"in n){var i=n.template;u(i)?e.template=i:e.template=Ei(i,e)}},init:function(t,e,n){var i="template"in n?n.template:t.prototype.template;if(i=i||{v:Th,t:[]},u(i)){var r=i;i=ki(e,r),e._config.template={fn:r,result:i}}i=Ei(i,e),e.template=i.t,i.p&&Si(e.partials,i.p)},reset:function(t){var e=_i(t);if(e){var n=Ei(e,t);return t.template=n.t,Si(t.partials,n.p,!0),!0}}},jc=["adaptors","components","computed","decorators","easing","events","interpolators","partials","transitions"],Nc=["computed"],Tc=function(t,e){this.name=t,this.useDefaults=e},Vc=Tc.prototype;Vc.extend=function(t,e,n){var i=this.useDefaults?t.defaults:t,r=this.useDefaults?e:e.constructor;this.configure(i,r,n)},Vc.init=function(){},Vc.configure=function(t,e,n){var i=this.name,r=n[i],s=na(t[i]);for(var a in r)s[a]=r[a];e[i]=s},Vc.reset=function(t){var e=t[this.name],n=!1;return sa(e).forEach(function(t){var i=e[t];i._fn&&(i._fn.isOwner?e[t]=i._fn:delete e[t],n=!0)}),n};var Pc=jc.map(function(t){var e=Nc.indexOf(t)>-1;return new Tc(t,e)}),Ic={adapt:gh,css:jh,data:Nh,template:Oc},Mc=sa(wa),Bc=Mi(Mc.filter(function(t){return!Ic[t]})),Rc=Mi(Mc.concat(Pc.map(function(t){return t.name}),["on","observe","attributes","cssData"])),Kc=[].concat(Mc.filter(function(t){return!Pc[t]&&!Ic[t]}),Pc,Ic.template,Ic.css),Dc={extend:function(t,e,n,i){return Pi("extend",t,e,n,i)},init:function(t,e,n){return Pi("init",t,e,n)},reset:function(t){return Kc.filter(function(e){return e.reset&&e.reset(t)}).map(function(t){return t.name})}},Lc=/\b_super\b/,Fc=function(t){this.up=t.up,this.ractive=t.up.ractive,this.template=t.template,this.index=t.index,this.type=t.template.t,this.dirty=!1},zc=Fc.prototype;zc.bubble=function(){this.dirty||(this.dirty=!0,this.up.bubble())},zc.destroyed=function(){this.fragment&&this.fragment.destroyed()},zc.find=function(){return null},zc.findComponent=function(){return null},zc.findNextNode=function(){return this.up.findNextNode(this)},zc.shuffled=function(){this.fragment&&this.fragment.shuffled()},zc.valueOf=function(){return this.toString()},Fc.prototype.findAll=Oa,Fc.prototype.findAllComponents=Oa;var Uc=function(t){function e(e){t.call(this,e)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.detach=function(){return this.fragment?this.fragment.detach():ve()},n.find=function(t){return this.fragment?this.fragment.find(t):void 0},n.findAll=function(t,e){this.fragment&&this.fragment.findAll(t,e)},n.findComponent=function(t){return this.fragment?this.fragment.findComponent(t):void 0},n.findAllComponents=function(t,e){this.fragment&&this.fragment.findAllComponents(t,e)},n.firstNode=function(t){return this.fragment&&this.fragment.firstNode(t)},n.toString=function(t){return this.fragment?this.fragment.toString(t):""},e}(Fc),$c=function(e){function n(t,n){e.call(this,t,n),this.isReadonly=!this.root.ractive.syncComputedChildren,this.dirty=!0}e&&(n.__proto__=e);var i=n.prototype=Object.create(e&&e.prototype);i.constructor=n;var r={setRoot:{}};return r.setRoot.get=function(){return this.parent.setRoot},i.applyValue=function(t){if(e.prototype.applyValue.call(this,t),!this.isReadonly){for(var n=this.parent;n&&n.shuffle;)n=n.parent;n&&n.dependencies.forEach(F)}this.setRoot&&this.setRoot.set(this.setRoot.value)},i.get=function(t,e){if(t&&B(this),this.dirty){this.dirty=!1;var n=this.parent.get();this.value=n?n[this.key]:void 0,this.wrapper&&(this.newWrapperValue=this.value),this.adapt()}return(e&&"unwrap"in e?e.unwrap!==!1:t)&&this.wrapper?this.wrapperValue:this.value},i.handleChange=function(){this.dirty=!0,this.boundValue&&(this.boundValue=null),this.links.forEach(U),this.deps.forEach(L),this.children.forEach(L)},i.joinKey=function(e){if(void 0===e||""===e)return this;if(!t(this.childByKey,e)){var i=new n(this,e);this.children.push(i),this.childByKey[e]=i}return this.childByKey[e]},Object.defineProperties(i,r),n}(uo),qc=function(t){function e(e,n,i){t.call(this,null,null),this.root=this.parent=e,this.signature=n,this.key=i,this.isExpression=i&&"@"===i[0],this.isReadonly=!this.signature.setter,this.context=e.computationContext,this.dependencies=[],this.children=[],this.childByKey={},this.deps=[],this.dirty=!0,this.shuffle=void 0}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);n.constructor=e;var r={setRoot:{}};return r.setRoot.get=function(){return this.signature.setter?this:void 0},n.get=function(t,e){if(t&&B(this),this.dirty){this.dirty=!1;var n=this.value;this.value=this.getValue(),i(n,this.value)||this.notifyUpstream(),this.wrapper&&(this.newWrapperValue=this.value),this.adapt()}return et(this,this.wrapper&&(e&&"unwrap"in e?e.unwrap!==!1:t)?this.wrapperValue:this.value,!e||e.shouldBind!==!1)},n.getValue=function(){I();var t;try{t=this.signature.getter.call(this.context)}catch(e){if(v("Failed to compute "+this.getKeypath()+": "+(e.message||e)),Aa){console.groupCollapsed&&console.groupCollapsed("%cshow details","color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;");var n=this.signature;console.error(e.name+": "+e.message+"\n\n"+n.getterString+(n.getterUseStack?"\n\n"+e.stack:"")),console.groupCollapsed&&console.groupEnd()}}var i=M();return this.setDependencies(i),t},n.mark=function(){this.handleChange()},n.rebind=function(t,e){t!==e&&this.handleChange()},n.set=function(t){if(this.isReadonly)throw new Error("Cannot set read-only computed value '"+this.key+"'");this.signature.setter(t),this.mark()},n.setDependencies=function(t){for(var e=this,n=this.dependencies.length;n--;){var i=e.dependencies[n];~t.indexOf(i)||i.unregister(e)}for(n=t.length;n--;){var r=t[n];~e.dependencies.indexOf(r)||r.register(e)}this.dependencies=t},n.teardown=function(){for(var e=this,n=this.dependencies.length;n--;)e.dependencies[n]&&e.dependencies[n].unregister(e);this.root.computations[this.key]===this&&delete this.root.computations[this.key],t.prototype.teardown.call(this)},Object.defineProperties(n,r),e}(uo),Hc=qc.prototype,Zc=$c.prototype;Hc.handleChange=Zc.handleChange,Hc.joinKey=Zc.joinKey;var Wc=function(t){function e(e,n){var i=this;t.call(this,e.ractive.viewmodel,null),this.fragment=e,this.template=n,this.isReadonly=!0,this.dirty=!0,this.fn=e.ractive.allowExpressions===!1?Oa:wi(n.s,n.r.length),this.models=this.template.r.map(function(t){return bt(i.fragment,t)}),this.dependencies=[],this.shuffle=void 0,this.bubble()}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bubble=function(t){void 0===t&&(t=!0),this.keypath=void 0,t&&this.handleChange()},n.getKeypath=function(){var t=this;return this.template?(this.keypath||(this.keypath="@"+this.template.s.replace(/_(\d+)/g,function(e,n){if(n>=t.models.length)return e;var i=t.models[n];return i?i.getKeypath():"@undefined"})),this.keypath):"@undefined"},n.getValue=function(){var t=this;I();var e;try{var n=this.models.map(function(t){return t?t.get(!0):void 0});e=this.fn.apply(this.fragment.ractive,n)}catch(i){v("Failed to compute "+this.getKeypath()+": "+(i.message||i))}var r=M();return this.dependencies.filter(function(t){return!~r.indexOf(t)}).forEach(function(e){e.unregister(t),N(t.dependencies,e)}),r.filter(function(e){return!~t.dependencies.indexOf(e)}).forEach(function(e){e.register(t),t.dependencies.push(e)}),e},n.notifyUpstream=function(){},n.rebind=function(t,e,n){var i=this.models.indexOf(e);~i&&(t=at(this.template.r[i],t,e),t!==e&&(e.unregister(this),this.models.splice(i,1,t),t&&t.addShuffleRegister(this,"mark"))),this.bubble(!n)},n.retrieve=function(){return this.get()},n.teardown=function(){var e=this;this.fragment=void 0,this.dependencies&&this.dependencies.forEach(function(t){return t.unregister(e)}),t.prototype.teardown.call(this)},n.unreference=function(){t.prototype.unreference.call(this),this.deps.length||this.refs||this.teardown()},n.unregister=function(e){t.prototype.unregister.call(this,e),this.deps.length||this.refs||this.teardown()},e}(uo),Gc=Wc.prototype,Yc=qc.prototype;Gc.get=Yc.get,Gc.handleChange=Yc.handleChange,Gc.joinKey=Yc.joinKey,Gc.mark=Yc.mark,Gc.unbind=Oa;var Qc=function(e){function n(t,n){e.call(this,t,n),this.dirty=!0}e&&(n.__proto__=e);var r=n.prototype=Object.create(e&&e.prototype);return r.constructor=n,r.applyValue=function(t){if(!i(t,this.value))for(var e=this.parent,n=[this.key];e;){if(e.base){var r=e.model.joinAll(n);r.applyValue(t);break}n.unshift(e.key),e=e.parent}},r.get=function(t,n){return this.retrieve(),e.prototype.get.call(this,t,n)},r.joinKey=function(e){if(void 0===e||""===e)return this;if(!t(this.childByKey,e)){var i=new n(this,e);this.children.push(i),this.childByKey[e]=i}return this.childByKey[e]},r.mark=function(){this.dirty=!0,e.prototype.mark.call(this)},r.retrieve=function(){if(this.dirty){this.dirty=!1;var t=this.parent.get();this.value=t&&t[this.key]}return this.value},n}(uo),Jc={get:function(){}},Xc=function(e){function n(t,n){var i=this;e.call(this,null,null),this.dirty=!0,this.root=t.ractive.viewmodel,this.template=n,this.base=Bi(t,n);var r=this.intermediary={handleChange:function(){return i.handleChange()},rebind:function(t,e){if(e===i.base)t=at(n,t,e),t!==i.base&&(i.base.unregister(r),i.base=t);else{var s=i.members.indexOf(e);~s&&(t=at(n.m[s].n,t,e),t!==i.members[s]&&i.members.splice(s,1,t||Jc))}t!==e&&e.unregister(r),t&&t.addShuffleTask(function(){return t.register(r)}),i.bubble()}};this.members=n.m.map(function(e){if(h(e))return{get:function(){return e}};var n;return e.t===nu?(n=bt(t,e.n),n.register(r),n):(n=new Wc(t,e),n.register(r),n)}),this.base.register(r),this.bubble()}e&&(n.__proto__=e);var i=n.prototype=Object.create(e&&e.prototype);return i.constructor=n,i.bubble=function(){this.base&&(this.dirty||this.handleChange())},i.get=function(t,e){if(this.dirty){this.bubble();var n=this.members.map(function(t){return x(String(t.get()))}),i=this.base.joinAll(n);return i!==this.model&&(this.model&&(this.model.unregister(this),this.model.unregisterTwowayBinding(this)),this.model=i,this.parent=i.parent,this.model.register(this),this.model.registerTwowayBinding(this),this.keypathModel&&this.keypathModel.handleChange()),this.value=this.model.get(t,e),this.dirty=!1,this.mark(),this.value}return this.model?this.model.get(t,e):void 0},i.getValue=function(){var t=this;this.value=this.model?this.model.get():void 0;for(var e=this.bindings.length;e--;){var n=t.bindings[e].getValue();if(n!==t.value)return n}var i=it(this.deps);return i?i.value:this.value},i.getKeypath=function(){return this.model?this.model.getKeypath():"@undefined"},i.handleChange=function(){this.dirty=!0,this.mark()},i.joinKey=function(e){if(void 0===e||""===e)return this;if(!t(this.childByKey,e)){var n=new Qc(this,e);this.children.push(n),this.childByKey[e]=n}return this.childByKey[e]},i.mark=function(){this.dirty&&this.deps.forEach(L),this.links.forEach(U),this.children.forEach(F)},i.rebind=function(){this.handleChange()},i.retrieve=function(){return this.value},i.set=function(t){this.model.set(t)},i.teardown=function(){var t=this;this.base&&this.base.unregister(this.intermediary),this.model&&(this.model.unregister(this),this.model.unregisterTwowayBinding(this)),this.members&&this.members.forEach(function(e){return e&&e.unregister&&e.unregister(t.intermediary)})},i.unreference=function(){e.prototype.unreference.call(this),this.deps.length||this.refs||this.teardown()},i.unregister=function(t){e.prototype.unregister.call(this,t),this.deps.length||this.refs||this.teardown()},n}(uo),td=function(t){function e(e){t.call(this,e),this.fragment=null}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){this.fragment=new lp({owner:this,template:this.template.f}),this.fragment.aliases=Ri(this.template.z,this.up),this.fragment.bind()},n.render=function(t){this.rendered=!0,this.fragment&&this.fragment.render(t)},n.unbind=function(){var t=this;for(var e in t.fragment.aliases)t.fragment.aliases[e].unreference();this.fragment.aliases={},this.fragment&&this.fragment.unbind()},n.unrender=function(t){this.rendered&&this.fragment&&this.fragment.unrender(t),this.rendered=!1},n.update=function(){this.dirty&&(this.dirty=!1,this.fragment.update())},e}(Uc),ed=function(t){return t.replace(/([A-Z])/g,function(t,e){return"-"+e.toLowerCase()})},nd=/\s+/,id=[void 0,"text","search","url","email","hidden","password","search","reset","submit"],rd={"accept-charset":"acceptCharset",accesskey:"accessKey",bgcolor:"bgColor","class":"className",codebase:"codeBase",colspan:"colSpan",contenteditable:"contentEditable",datetime:"dateTime",dirname:"dirName","for":"htmlFor","http-equiv":"httpEquiv",ismap:"isMap",maxlength:"maxLength",novalidate:"noValidate",pubdate:"pubDate",readonly:"readOnly",rowspan:"rowSpan",tabindex:"tabIndex",usemap:"useMap"},sd=ka?Bu("div"):null,ad=!1,od=function(t){function e(e){t.call(this,e),this.attributes=[],this.owner=e.owner,this.fragment=new lp({ractive:this.ractive,owner:this,template:this.template}),this.fragment.findNextNode=Oa,this.dirty=!1}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){this.fragment.bind()},n.bubble=function(){this.dirty||(this.dirty=!0,this.owner.bubble())},n.destroyed=function(){this.unrender()},n.render=function(){this.node=this.owner.node,this.node&&(this.isSvg=this.node.namespaceURI===Wu),ad=!0,this.rendered||this.fragment.render(),this.rendered=!0,this.dirty=!0,this.update(),ad=!1},n.toString=function(){return this.fragment.toString()},n.unbind=function(){this.fragment.unbind()},n.unrender=function(){this.rendered=!1,this.fragment.unrender()},n.update=function(){var t,e,n=this;if(this.dirty){this.dirty=!1;var i=ad;ad=!0,this.fragment.update(),this.rendered&&this.node&&(t=this.fragment.toString(),e=ir(t,this.isSvg),this.attributes.filter(function(t){return rr(e,t)}).forEach(function(t){n.node.removeAttribute(t.name)}),e.forEach(function(t){n.node.setAttribute(t.name,t.value)}),this.attributes=e),ad=i||!1}},e}(Fc),ud=/^\s*$/,hd=!1,ld=function(t){function e(e){t.call(this,e),this.name=e.template.n,this.namespace=null,this.owner=e.owner||e.up.owner||e.element||ne(e.up),this.element=e.element||(this.owner.attributeByName?this.owner:ne(e.up)),this.up=e.up,this.ractive=this.up.ractive,this.rendered=!1,this.updateDelegate=null,this.fragment=null,this.element.attributeByName[this.name]=this,oa(e.template.f)?this.fragment=new lp({owner:this,template:e.template.f}):(this.value=e.template.f,0===this.value?this.value="":void 0===this.value&&(this.value=!0)),this.interpolator=this.fragment&&1===this.fragment.items.length&&this.fragment.items[0].type===To&&this.fragment.items[0],this.interpolator&&(this.interpolator.owner=this)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){this.fragment&&this.fragment.bind()},n.bubble=function(){this.dirty||(this.up.bubble(),this.element.bubble(),this.dirty=!0)},n.firstNode=function(){},n.getString=function(){hd=!0;var t=this.fragment?this.fragment.toString():null!=this.value?""+this.value:"";return hd=!1,t},n.getValue=function(){hd=!0;var t=this.fragment?this.fragment.valueOf():Uh.test(this.name)?!0:this.value;return hd=!1,t},n.render=function(){var t=this.element.node;if(this.node=t,t.namespaceURI&&t.namespaceURI!==Ju.html||(this.propertyName=rd[this.name]||this.name,void 0!==t[this.propertyName]&&(this.useProperty=!0),(Uh.test(this.name)||this.isTwoway)&&(this.isBoolean=!0),"value"===this.propertyName&&(t._ractive.value=this.value)),t.namespaceURI){var e=this.name.indexOf(":");-1!==e?this.namespace=sr(t,this.name.slice(0,e)):this.namespace=t.namespaceURI}this.rendered=!0,this.updateDelegate=Li(this),this.updateDelegate()},n.toString=function(){if(nr())return"";hd=!0;var t=this.getValue();if("value"!==this.name||void 0===this.element.getAttribute("contenteditable")&&"select"!==this.element.name&&"textarea"!==this.element.name){if("name"===this.name&&"input"===this.element.name&&this.interpolator&&"radio"===this.element.getAttribute("type"))return'name="{{'+this.interpolator.model.getKeypath()+'}}"';if(this.owner!==this.element||"style"!==this.name&&"class"!==this.name&&!this.style&&!this.inlineClass){if(!(this.rendered||this.owner!==this.element||this.name.indexOf("style-")&&this.name.indexOf("class-")))return void(this.name.indexOf("style-")?this.inlineClass=this.name.substr(6):this.style=ed(this.name.substr(6)));if(Uh.test(this.name))return t?h(t)?this.name+'="'+we(t)+'"':this.name:"";if(null==t)return"";var e=we(this.getString());return hd=!1,e?this.name+'="'+e+'"':this.name}}},n.unbind=function(){this.fragment&&this.fragment.unbind()},n.unrender=function(){this.updateDelegate(!0),this.rendered=!1},n.update=function(){if(this.dirty){var t;if(this.dirty=!1,this.fragment&&this.fragment.update(),this.rendered&&this.updateDelegate(),this.isTwoway&&!this.locked)this.interpolator.twowayBinding.lastVal(!0,this.interpolator.model.get());else if("value"===this.name&&(t=this.element.binding)){var e=t.attribute;e&&!e.dirty&&e.rendered&&this.element.binding.attribute.updateDelegate()}}},e}(Fc),cd=function(t){function e(e){t.call(this,e),this.owner=e.owner||e.up.owner||ne(e.up),this.element=this.owner.attributeByName?this.owner:ne(e.up),this.flag="l"===e.template.v?"lazy":"twoway",this.bubbler=this.owner===this.element?this.element:this.up,this.element.type===Bo&&(oa(e.template.f)&&(this.fragment=new lp({owner:this,template:e.template.f})),this.interpolator=this.fragment&&1===this.fragment.items.length&&this.fragment.items[0].type===To&&this.fragment.items[0])}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){this.fragment&&this.fragment.bind(),or(this,this.getValue(),!0)},n.bubble=function(){this.dirty||(this.bubbler.bubble(),this.dirty=!0)},n.getValue=function(){return this.fragment?this.fragment.valueOf():"value"in this?this.value:"f"in this.template?this.template.f:!0},n.render=function(){or(this,this.getValue(),!0)},n.toString=function(){return""},n.unbind=function(){this.fragment&&this.fragment.unbind(),delete this.element[this.flag]},n.unrender=function(){this.element.rendered&&this.element.recreateTwowayBinding()},n.update=function(){this.dirty&&(this.dirty=!1,this.fragment&&this.fragment.update(),or(this,this.getValue(),!0))},e}(Fc),dd=na(Fc.prototype);ea(dd,{bind:Oa,unbind:Oa,update:Oa,detach:function(){return ye(this.node)},firstNode:function(){return this.node},render:function(t){this.rendered=!0,this.node=ka.createComment(this.template.c),t.appendChild(this.node)},toString:function(){return"<!-- "+this.template.c+" -->"},unrender:function(t){this.rendered&&t&&this.detach(),this.rendered=!1}}),ur.prototype=dd;var fd=new Co("teardown"),pd=new Co("destruct"),md=function(t){function e(e){t.call(this,e,"@this"),this.ractive=e}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.joinKey=function(e){var n=t.prototype.joinKey.call(this,e);return"root"!==e&&"parent"!==e||n.isLink?"data"===e?this.ractive.viewmodel:"cssData"===e?this.ractive.constructor._cssModel:n:cr(n,e)},e}(lo),vd=function(e){function n(t){e.call(this,null,null),this.isRoot=!0,this.root=this,this.ractive=t.ractive,this.value=t.data,this.adaptors=t.adapt,this.adapt(),this.computationContext=t.ractive,this.computations={}}e&&(n.__proto__=e);var i=n.prototype=Object.create(e&&e.prototype);return i.constructor=n,i.attached=function(t){dr(this,t)},i.compute=function(t,e){var n=new qc(this,e,t);return this.computations[x(t)]=n,n},i.createLink=function(t,e,n,i){for(var r=k(t),s=this;r.length;){var a=r.shift();s=s.childByKey[a]||s.joinKey(a)}return s.link(e,n,i)},i.detached=function(){fr(this)},i.get=function(t,e){var n=this;if(t&&B(this),e&&e.virtual===!1)return this.value;for(var i=this.getVirtual(),r=sa(this.computations),s=r.length;s--;)i[r[s]]=n.computations[r[s]].get();return i},i.getKeypath=function(){return""},i.getRactiveModel=function(){return this.ractiveModel||(this.ractiveModel=new md(this.ractive))},i.getValueChildren=function(){var t=this,n=e.prototype.getValueChildren.call(this,this.value);this.children.forEach(function(t){if(t._link){var e=n.indexOf(t);~e?n.splice(e,1,t._link):n.push(t._link)}});for(var i in t.computations)n.push(t.computations[i]);return n},i.has=function(e){var n=this.value,i=E(e);if("@this"===i||"@global"===i||"@shared"===i||"@style"===i)return!0;if("~"===i[0]&&"/"===i[1]&&(i=i.slice(2)),""===e||t(n,i))return!0;if(e in this.computations||this.childByKey[i]&&this.childByKey[i]._link)return!0;for(var r=n.constructor;r!==Function&&r!==Array&&r!==Object;){if(t(r.prototype,i))return!0;r=r.constructor}return!1},i.joinKey=function(n,i){return"@"!==n[0]?("~"===n[0]&&"/"===n[1]&&(n=n.slice(2)),t(this.computations,n)?this.computations[n]:e.prototype.joinKey.call(this,n,i)):"@this"===n||"@"===n?this.getRactiveModel():"@global"===n?fo:"@shared"===n?co:"@style"===n?this.getRactiveModel().joinKey("cssData"):void 0},i.set=function(t){var e=this.wrapper;if(e){var n=!e.reset||e.reset(t)===!1;n&&(e.teardown(),this.wrapper=null,this.value=t,this.adapt())}else this.value=t,this.adapt();this.deps.forEach(L),this.children.forEach(F)},i.retrieve=function(){return this.wrapper?this.wrapper.get():this.value},i.teardown=function(){var t=this;e.prototype.teardown.call(this);for(var n in t.computations)t.computations[n].teardown()},n}(uo);vd.prototype.update=Oa;var gd=new Co("construct"),yd=["adaptors","components","decorators","easing","events","interpolators","partials","transitions"],bd=0,wd=function(t){function e(e,n){var i=this;t.call(this,e);var r=e.template;this.isAnchor=r.t===Lo,this.type=this.isAnchor?Lo:Uo;var s=r.m,a=r.p||{};if("content"in a||(a.content=r.f||[]),this._partials=a,this.isAnchor)this.name=r.n,this.addChild=wr,this.removeChild=xr;else{var o=na(n.prototype);this.instance=o,this.name=r.e,o.el&&v("The <"+this.name+"> component has a default 'el' property; it has been disregarded");for(var u,l=e.up;l;){if(l.owner.type===$o){u=l.owner.container;break}l=l.parent}o.parent=this.up.ractive,o.container=u||null,o.root=o.parent.root,o.component=this,vr(this.instance,{partials:a}),r=this.template,s=r.m,oa(this.mappings)?s=(s||[]).concat(this.mappings):h(this.mappings)&&(s=(s||[]).concat(Cc.parse(this.mappings,{attributes:!0}).t)),o._inlinePartials=a}if(this.attributeByName={},this.attributes=[],s){var c=[];s.forEach(function(t){switch(t.t){case Fo:case gu:i.attributes.push(ws({owner:i,up:i.up,template:t}));break;case bu:case wu:case yu:break;default:c.push(t)}}),c.length&&this.attributes.push(new od({owner:this,up:this.up,template:c}))}this.eventHandlers=[]}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){this.isAnchor||(this.attributes.forEach(R),As(this.instance,{partials:this._partials},{cssIds:this.up.cssIds}),this.eventHandlers.forEach(R),this.bound=!0)},n.bubble=function(){this.dirty||(this.dirty=!0,this.up.bubble())},n.destroyed=function(){!this.isAnchor&&this.instance.fragment&&this.instance.fragment.destroyed()},n.detach=function(){return this.isAnchor?this.instance?this.instance.fragment.detach():ve():this.instance.fragment.detach()},n.find=function(t,e){return this.instance?this.instance.fragment.find(t,e):void 0},n.findAll=function(t,e){this.instance&&this.instance.fragment.findAll(t,e)},n.findComponent=function(t,e){return t&&this.name!==t?this.instance.fragment?this.instance.fragment.findComponent(t,e):void 0:this.instance},n.findAllComponents=function(t,e){var n=e.result;!this.instance||t&&this.name!==t||n.push(this.instance),this.instance&&this.instance.findAllComponents(t,e)},n.firstNode=function(t){return this.instance?this.instance.fragment.firstNode(t):void 0},n.getContext=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return t.unshift(this.instance),xt.apply(null,t)},n.render=function(t,e){this.isAnchor?(this.rendered=!0,this.target=t,xd.length||(xd.push(this.ractive),e?(this.occupants=e,Er(),this.occupants=null):no.scheduleTask(Er,!0))):(this.attributes.forEach(q),this.eventHandlers.forEach(q),Ss(this.instance,t,null,e),this.rendered=!0)},n.toString=function(){return this.instance?this.instance.toHTML():void 0},n.unbind=function(){this.isAnchor||(this.bound=!1,this.attributes.forEach(W),lr(this.instance,function(){return no.promise()}))},n.unrender=function(t){this.shouldDestroy=t,this.isAnchor?(this.item&&kr(this,this.item),this.target=null,xd.length||(xd.push(this.ractive),no.scheduleTask(Er,!0))):(this.instance.unrender(),this.instance.el=this.instance.target=null,this.attributes.forEach(G),this.eventHandlers.forEach(G)),this.rendered=!1},n.update=function(){this.dirty=!1,this.instance&&(this.instance.fragment.update(),this.attributes.forEach(Q),this.eventHandlers.forEach(Q))},e}(Fc),xd=[],_d={update:Oa,teardown:Oa},kd=function(t){this.owner=t.owner||t.up.owner||ne(t.up),this.element=this.owner.attributeByName?this.owner:ne(t.up),this.up=t.up||this.owner.up,this.ractive=this.owner.ractive;var e=this.template=t.template;this.name=e.n,this.node=null,this.handle=null,this.element.decorators.push(this)},Ed=kd.prototype;Ed.bind=function(){Ar(this,this.template,this.up,{register:!0})},Ed.bubble=function(){this.dirty||(this.dirty=!0,this.owner.bubble(),this.up.bubble())},Ed.destroyed=function(){this.handle&&(this.handle.teardown(),this.handle=null),this.shouldDestroy=!0},Ed.handleChange=function(){this.bubble()},Ed.rebind=function(t,e,n){var i=this.models.indexOf(e);~i&&(t=at(this.template.f.r[i],t,e),t!==e&&(e.unregister(this),this.models.splice(i,1,t),t&&t.addShuffleRegister(this,"mark"),n||this.bubble()))},Ed.render=function(){var t=this;this.shouldDestroy=!1,this.handle&&this.unrender(),no.scheduleTask(function(){var e=y("decorators",t.ractive,t.name);if(!e)return m(Ma(t.name,"decorator")),void(t.handle=_d);t.node=t.element.node;var n;if(t.fn&&(n=t.models.map(function(t){return t?t.get():void 0}),n=t.fn.apply(t.ractive,n)),t.handle=e.apply(t.ractive,[t.node].concat(n)),!t.handle||!t.handle.teardown)throw new Error("The '"+t.name+"' decorator must return an object with a teardown method");t.shouldDestroy&&t.destroyed()},!0)},Ed.toString=function(){return""},Ed.unbind=function(){Sr(this,this.template)},Ed.unrender=function(t){t&&!this.element.rendered||!this.handle||(this.handle.teardown(),this.handle=null)},Ed.update=function(){var t=this.handle;if(!this.dirty)return void(t&&t.invalidate&&no.scheduleTask(function(){return t.invalidate()},!0));if(this.dirty=!1,t)if(t.update){var e=this.models.map(function(t){return t&&t.get()});t.update.apply(this.ractive,this.fn.apply(this.ractive,e))}else this.unrender(),this.render()};var Ad=function(t){function e(){t.apply(this,arguments)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.toString=function(){return"<!DOCTYPE"+this.template.a+">"},e}(Fc),Cd=Ad.prototype;Cd.bind=Cd.render=Cd.teardown=Cd.unbind=Cd.unrender=Cd.update=Oa;var Sd=function(t,e){void 0===e&&(e="value"),this.element=t,this.ractive=t.ractive,this.attribute=t.attributeByName[e];var n=this.attribute.interpolator;n.twowayBinding=this;var i=n.model;if(i.isReadonly&&!i.setRoot){var r=i.getKeypath().replace(/^@/,"");return g("Cannot use two-way binding on <"+t.name+"> element: "+r+" is read-only. To suppress this warning use <"+t.name+" twoway='false'...>",{ractive:this.ractive}),!1}this.attribute.isTwoway=!0,this.model=i;var s=i.get();this.wasUndefined=void 0===s,void 0===s&&this.getInitialValue&&(s=this.getInitialValue(),i.set(s)),this.lastVal(!0,s);var a=ne(this.element,!1,"form");a&&(this.resetValue=s,a.formBindings.push(this))},Od=Sd.prototype;Od.bind=function(){this.model.registerTwowayBinding(this)},Od.handleChange=function(){var t=this,e=this.getValue();this.lastVal()!==e&&(no.start(),this.attribute.locked=!0,this.model.set(e),this.lastVal(!0,e),this.model.get()!==e?this.attribute.locked=!1:no.scheduleTask(function(){return t.attribute.locked=!1}),no.end())},Od.lastVal=function(t,e){return t?void(this.lastValue=e):this.lastValue},Od.rebind=function(t,e){var n=this;this.model&&this.model===e&&e.unregisterTwowayBinding(this),t&&(this.model=t,no.scheduleTask(function(){return t.registerTwowayBinding(n)}))},Od.render=function(){this.node=this.element.node,this.node._ractive.binding=this,this.rendered=!0},Od.setFromNode=function(t){this.model.set(t.value)},Od.unbind=function(){this.model.unregisterTwowayBinding(this)},Sd.prototype.unrender=Oa;var jd=function(t){function e(e){t.call(this,e,"checked")}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.render=function(){t.prototype.render.call(this),this.element.on("change",Or),this.node.attachEvent&&this.element.on("click",Or)},n.unrender=function(){this.element.off("change",Or),this.element.off("click",Or)},n.getInitialValue=function(){return!!this.element.getAttribute("checked")},n.getValue=function(){return this.node.checked},n.setFromNode=function(t){this.model.set(t.checked)},e}(Sd),Nd=function(t,e,n){var i=this;this.model=e,this.hash=t,this.getValue=function(){return i.value=n.call(i),i.value},this.bindings=[]},Td=Nd.prototype;Td.add=function(t){this.bindings.push(t)},Td.bind=function(){this.value=this.model.get(),this.model.registerTwowayBinding(this),this.bound=!0},Td.remove=function(t){N(this.bindings,t),this.bindings.length||this.unbind()},Td.unbind=function(){this.model.unregisterTwowayBinding(this),this.bound=!1,delete this.model[this.hash]},Nd.prototype.rebind=Sd.prototype.rebind;var Vd=[].push,Pd=function(t){function e(e){if(t.call(this,e,"name"),this.checkboxName=!0,this.group=jr("checkboxes",this.model,Nr),this.group.add(this),this.noInitialValue&&(this.group.noInitialValue=!0),this.group.noInitialValue&&this.element.getAttribute("checked")){var n=this.model.get(),i=this.element.getAttribute("value");this.arrayContains(n,i)||Vd.call(n,i)}}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){this.group.bound||this.group.bind()},n.getInitialValue=function(){return this.noInitialValue=!0,[]},n.getValue=function(){return this.group.value},n.handleChange=function(){this.isChecked=this.element.node.checked,this.group.value=this.model.get();var e=this.element.getAttribute("value");this.isChecked&&!this.arrayContains(this.group.value,e)?this.group.value.push(e):!this.isChecked&&this.arrayContains(this.group.value,e)&&this.removeFromArray(this.group.value,e),this.lastValue=null,t.prototype.handleChange.call(this)},n.render=function(){t.prototype.render.call(this);var e=this.node,n=this.model.get(),i=this.element.getAttribute("value");oa(n)?this.isChecked=this.arrayContains(n,i):this.isChecked=this.element.compare(n,i),e.name="{{"+this.model.getKeypath()+"}}",e.checked=this.isChecked,this.element.on("change",Or),this.node.attachEvent&&this.element.on("click",Or)},n.setFromNode=function(t){if(this.group.bindings.forEach(function(t){return t.wasUndefined=!0}),t.checked){var e=this.group.getValue();e.push(this.element.getAttribute("value")),this.group.model.set(e)}},n.unbind=function(){this.group.remove(this)},n.unrender=function(){var t=this.element;t.off("change",Or),
t.off("click",Or)},n.arrayContains=function(t,e){for(var n=this,i=t.length;i--;)if(n.element.compare(e,t[i]))return!0;return!1},n.removeFromArray=function(t,e){var n=this;if(t)for(var i=t.length;i--;)n.element.compare(e,t[i])&&t.splice(i,1)},e}(Sd),Id=function(t){function e(){t.apply(this,arguments)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.getInitialValue=function(){return this.element.fragment?this.element.fragment.toString():""},n.getValue=function(){return this.element.node.innerHTML},n.render=function(){t.prototype.render.call(this);var e=this.element;e.on("change",Or),e.on("blur",Or),this.ractive.lazy||(e.on("input",Or),this.node.attachEvent&&e.on("keyup",Or))},n.setFromNode=function(t){this.model.set(t.innerHTML)},n.unrender=function(){var t=this.element;t.off("blur",Or),t.off("change",Or),t.off("input",Or),t.off("keyup",Or)},e}(Sd),Md=function(t){function e(){t.apply(this,arguments)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.getInitialValue=function(){return""},n.getValue=function(){return this.node.value},n.render=function(){t.prototype.render.call(this);var e=this.ractive.lazy,n=!1,i=this.element;"lazy"in this.element&&(e=this.element.lazy),r(e)&&(n=+e,e=!1),this.handler=n?Vr(n):Or;var s=this.node;i.on("change",Or),"file"!==s.type&&(e||(i.on("input",this.handler),s.attachEvent&&i.on("keyup",this.handler)),i.on("blur",Tr))},n.unrender=function(){var t=this.element;this.rendered=!1,t.off("change",Or),t.off("input",this.handler),t.off("keyup",this.handler),t.off("blur",Tr)},e}(Sd),Bd=function(t){function e(){t.apply(this,arguments)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.getInitialValue=function(){return void 0},n.getValue=function(){return this.node.files},n.render=function(){this.element.lazy=!1,t.prototype.render.call(this)},n.setFromNode=function(t){this.model.set(t.files)},e}(Md),Rd=function(t){function e(){t.apply(this,arguments)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.getInitialValue=function(){return this.element.options.filter(function(t){return t.getAttribute("selected")}).map(function(t){return t.getAttribute("value")})},n.getValue=function(){for(var t=this.element.node.options,e=t.length,n=[],i=0;e>i;i+=1){var r=t[i];if(r.selected){var s=r._ractive?r._ractive.value:r.value;n.push(s)}}return n},n.handleChange=function(){var e=this.attribute,n=e.getValue(),i=this.getValue();return void 0!==n&&S(i,n)||t.prototype.handleChange.call(this),this},n.render=function(){t.prototype.render.call(this),this.element.on("change",Or),void 0===this.model.get()&&this.handleChange()},n.setFromNode=function(t){for(var e=Pr(t),n=e.length,i=new Array(n);n--;){var r=e[n];i[n]=r._ractive?r._ractive.value:r.value}this.model.set(i)},n.unrender=function(){this.element.off("change",Or)},e}(Sd),Kd=function(t){function e(){t.apply(this,arguments)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.getInitialValue=function(){return void 0},n.getValue=function(){var t=parseFloat(this.node.value);return isNaN(t)?void 0:t},n.setFromNode=function(t){var e=parseFloat(t.value);isNaN(e)||this.model.set(e)},e}(Md),Dd={},Ld=function(t){function e(e){t.call(this,e,"checked"),this.siblings=Ir(this.ractive._guid+this.element.getAttribute("name")),this.siblings.push(this)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.getValue=function(){return this.node.checked},n.handleChange=function(){no.start(),this.siblings.forEach(function(t){t.model.set(t.getValue())}),no.end()},n.render=function(){t.prototype.render.call(this),this.element.on("change",Or),this.node.attachEvent&&this.element.on("click",Or)},n.setFromNode=function(t){this.model.set(t.checked)},n.unbind=function(){N(this.siblings,this)},n.unrender=function(){this.element.off("change",Or),this.element.off("click",Or)},e}(Sd),Fd=function(t){function e(e){t.call(this,e,"name"),this.group=jr("radioname",this.model,Mr),this.group.add(this),e.checked&&(this.group.value=this.getValue())}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){var t=this;this.group.bound||this.group.bind(),this.nameAttributeBinding={handleChange:function(){return t.node.name="{{"+t.model.getKeypath()+"}}"},rebind:Oa},this.model.getKeypathModel().register(this.nameAttributeBinding)},n.getInitialValue=function(){return this.element.getAttribute("checked")?this.element.getAttribute("value"):void 0},n.getValue=function(){return this.element.getAttribute("value")},n.handleChange=function(){this.node.checked&&(this.group.value=this.getValue(),t.prototype.handleChange.call(this))},n.lastVal=function(t,e){return this.group?t?void(this.group.lastValue=e):this.group.lastValue:void 0},n.render=function(){t.prototype.render.call(this);var e=this.node;e.name="{{"+this.model.getKeypath()+"}}",e.checked=this.element.compare(this.model.get(),this.element.getAttribute("value")),this.element.on("change",Or),e.attachEvent&&this.element.on("click",Or)},n.setFromNode=function(t){t.checked&&this.group.model.set(this.element.getAttribute("value"))},n.unbind=function(){this.group.remove(this),this.model.getKeypathModel().unregister(this.nameAttributeBinding)},n.unrender=function(){var t=this.element;t.off("change",Or),t.off("click",Or)},e}(Sd),zd=function(t){function e(){t.apply(this,arguments)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.forceUpdate=function(){var t=this,e=this.getValue();void 0!==e&&(this.attribute.locked=!0,no.scheduleTask(function(){return t.attribute.locked=!1}),this.model.set(e))},n.getInitialValue=function(){if(void 0===this.element.getAttribute("value")){var t=this.element.options,e=t.length;if(e){for(var n,i,r=e;r--;){var s=t[r];if(s.getAttribute("selected")){s.getAttribute("disabled")||(n=s.getAttribute("value")),i=!0;break}}if(!i)for(;++r<e;)if(!t[r].getAttribute("disabled")){n=t[r].getAttribute("value");break}return void 0!==n&&(this.element.attributeByName.value.value=n),n}}},n.getValue=function(){var t,e=this.node.options,n=e.length;for(t=0;n>t;t+=1){var i=e[t];if(e[t].selected&&!e[t].disabled)return i._ractive?i._ractive.value:i.value}},n.render=function(){t.prototype.render.call(this),this.element.on("change",Or)},n.setFromNode=function(t){var e=Pr(t)[0];this.model.set(e._ractive?e._ractive.value:e.value)},n.unrender=function(){this.element.off("change",Or)},e}(Sd),Ud=/;\s*$/,$d=function(t){function e(e){var n=this;if(t.call(this,e),this.name=e.template.e.toLowerCase(),this.parent=ne(this.up,!1),this.parent&&"option"===this.parent.name)throw new Error("An <option> element cannot contain other elements (encountered <"+this.name+">)");this.decorators=[],this.attributeByName={};for(var i,r,s,a,o,u,h,l,c=this.template.m,d=c&&c.length||0,f=0;d>f;f++)switch(h=c[f],h.t){case Fo:case wu:case yu:case gu:case bu:s=ws({owner:n,up:n.up,template:h}),r=h.n,i=i||(i=n.attributes=[]),"value"===r?a=s:"name"===r?u=s:"class"===r?o=s:i.push(s);break;case xu:n.delegate=!1;break;default:(l||(l=[])).push(h)}a&&i.push(a),u&&i.push(u),o&&i.unshift(o),l&&((i||(this.attributes=[])).push(new od({owner:this,up:this.up,template:l})),l=[]),e.template.f&&!e.deferContent&&(this.fragment=new lp({template:e.template.f,owner:this,cssIds:null})),this.binding=null}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){var t=this.attributes;t&&(t.binding=!0,t.forEach(R),t.binding=!1),this.fragment&&this.fragment.bind(),this.binding?this.binding.bind():this.recreateTwowayBinding()},n.createTwowayBinding=function(){if("twoway"in this?this.twoway:this.ractive.twoway){var t=Rr(this);if(t){var e=new t(this);if(e&&e.model)return e}}},n.destroyed=function(){var t=this;if(this.attributes&&this.attributes.forEach(D),!this.up.delegate&&this.listeners){var e=this.listeners;for(var n in e)e[n]&&e[n].length&&t.node.removeEventListener(n,Ur)}this.fragment&&this.fragment.destroyed()},n.detach=function(){return this.rendered||this.destroyed(),ye(this.node)},n.find=function(t,e){return this.node&&Ru(this.node,t)?this.node:this.fragment?this.fragment.find(t,e):void 0},n.findAll=function(t,e){var n=e.result;Ru(this.node,t)&&n.push(this.node),this.fragment&&this.fragment.findAll(t,e)},n.findNextNode=function(){return null},n.firstNode=function(){return this.node},n.getAttribute=function(t){var e=this.attributeByName[t];return e?e.getValue():void 0},n.getContext=function(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];return this.fragment?(n=this.fragment).getContext.apply(n,t):(this.ctx||(this.ctx=new Pu(this.up,this)),t.unshift(na(this.ctx)),ea.apply(null,t));var n},n.off=function(t,e,n){void 0===n&&(n=!1);var i=this.up.delegate,r=this.listeners&&this.listeners[t];if(r)if(N(r,e),i){var s=(i.listeners||(i.listeners=[]))&&(i.listeners[t]||(i.listeners[t]=[]));s.refs&&!--s.refs&&i.off(t,Fr,!0)}else if(this.rendered){var a=this.node,o=a.addEventListener,u=a.removeEventListener;r.length?r.length&&!r.refs&&n&&(u.call(a,t,Ur,!0),o.call(a,t,Ur,!1)):u.call(a,t,Ur,n)}},n.on=function(t,e,n){void 0===n&&(n=!1);var i=this.up.delegate,r=(this.listeners||(this.listeners={}))[t]||(this.listeners[t]=[]);if(i){var s=(i.listeners||(i.listeners=[]))&&i.listeners[t]||(i.listeners[t]=[]);s.refs?s.refs++:(s.refs=0,i.on(t,Fr,!0),s.refs++)}else if(this.rendered){var a=this.node,o=a.addEventListener,u=a.removeEventListener;r.length?r.length&&!r.refs&&n&&(u.call(a,t,Ur,!1),o.call(a,t,Ur,!0)):o.call(a,t,Ur,n)}A(this.listeners[t],e)},n.recreateTwowayBinding=function(){this.binding&&(this.binding.unbind(),this.binding.unrender()),(this.binding=this.createTwowayBinding())&&(this.binding.bind(),this.rendered&&this.binding.render())},n.render=function(t,e){var n=this;this.namespace=Lr(this);var i,r=!1;if(e)for(var s;s=e.shift();){if(s.nodeName.toUpperCase()===n.template.e.toUpperCase()&&s.namespaceURI===n.namespace){n.node=i=s,r=!0;break}ye(s)}if(!r&&this.node&&(i=this.node,t.appendChild(i),r=!0),!i){var a=this.template.e;i=Bu(this.namespace===Hu?a.toLowerCase():a,this.namespace,this.getAttribute("is")),this.node=i}ia(i,"_ractive",{value:{proxy:this},configurable:!0}),r&&this.foundNode&&this.foundNode(i);var o=this.intro;if(o&&o.shouldFire("intro")&&(o.isIntro=!0,o.isOutro=!1,no.registerTransition(o)),this.fragment){var u=r?V(i.childNodes):void 0;this.fragment.render(i,u),u&&u.forEach(ye)}if(r){this.binding&&this.binding.wasUndefined&&this.binding.setFromNode(i);for(var h=i.attributes.length;h--;){var l=i.attributes[h].name;l in n.attributeByName||i.removeAttribute(l)}}if(this.up.cssIds&&i.setAttribute("data-ractive-css",this.up.cssIds.map(function(t){return"{"+t+"}"}).join(" ")),this.attributes&&this.attributes.forEach(q),this.binding&&this.binding.render(),!this.up.delegate&&this.listeners){var c=this.listeners;for(var d in c)c[d]&&c[d].length&&n.node.addEventListener(d,Ur,!!c[d].refs)}r||t.appendChild(i),this.rendered=!0},n.toString=function(){var t=this.template.e,e=this.attributes&&this.attributes.map(Dr).join("")||"";"option"===this.name&&this.isSelected()&&(e+=" selected"),"input"===this.name&&Kr(this)&&(e+=" checked");var n,i;this.attributes&&this.attributes.forEach(function(t){"class"===t.name?i=(i||"")+(i?" ":"")+we(t.getString()):"style"===t.name?(n=(n||"")+(n?" ":"")+we(t.getString()),n&&!Ud.test(n)&&(n+=";")):t.style?n=(n||"")+(n?" ":"")+t.style+": "+we(t.getString())+";":t.inlineClass&&t.getValue()&&(i=(i||"")+(i?" ":"")+t.inlineClass)}),void 0!==n&&(e=" style"+(n?'="'+n+'"':"")+e),void 0!==i&&(e=" class"+(i?'="'+i+'"':"")+e),this.up.cssIds&&(e+=' data-ractive-css="'+this.up.cssIds.map(function(t){return"{"+t+"}"}).join(" ")+'"');var r="<"+t+e+">";return $h.test(this.name)?r:("textarea"===this.name&&void 0!==this.getAttribute("value")?r+=hn(this.getAttribute("value")):void 0!==this.getAttribute("contenteditable")&&(r+=this.getAttribute("value")||""),this.fragment&&(r+=this.fragment.toString(!/^(?:script|style)$/i.test(this.template.e))),r+="</"+t+">")},n.unbind=function(){var t=this.attributes;t&&(t.unbinding=!0,t.forEach(W),t.unbinding=!1),this.binding&&this.binding.unbind(),this.fragment&&this.fragment.unbind()},n.unrender=function(t){if(this.rendered){this.rendered=!1;var e=this.intro;e&&e.complete&&e.complete(),"option"===this.name?this.detach():t&&no.detachWhenReady(this);var n=this.outro;n&&n.shouldFire("outro")&&(n.isIntro=!1,n.isOutro=!0,no.registerTransition(n)),this.fragment&&this.fragment.unrender(),this.binding&&this.binding.unrender()}},n.update=function(){this.dirty&&(this.dirty=!1,this.attributes&&this.attributes.forEach(Q),this.fragment&&this.fragment.update())},e}(Uc),qd=null!==_a?_a.UIEvent:null,Hd=function(t){function e(e){t.call(this,e),this.formBindings=[]}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.render=function(e,n){t.prototype.render.call(this,e,n),this.on("reset",$r)},n.unrender=function(e){this.off("reset",$r),t.prototype.unrender.call(this,e)},e}($d),Zd=function(t,e){-1!==t.indexOf("*")&&d('Only component proxy-events may contain "*" wildcards, <'+e.name+" on-"+t+'="..."/> is not valid'),this.name=t,this.owner=e,this.handler=null},Wd=Zd.prototype;Wd.listen=function(t){var e=this.owner.node,n=this.name;"on"+n in e&&this.owner.on(n,this.handler=function(i){return t.fire({node:e,original:i,event:i,name:n})})},Wd.unlisten=function(){this.handler&&this.owner.off(this.name,this.handler)};var Gd=function(t,e,n){this.eventPlugin=t,this.owner=e,this.name=n,this.handler=null},Yd=Gd.prototype;Yd.listen=function(t){var e=this,n=this.owner.node;this.handler=this.eventPlugin(n,function(i){return void 0===i&&(i={}),i.original?i.event=i.original:i.original=i.event,i.name=e.name,i.node=i.node||n,t.fire(i)})},Yd.unlisten=function(){this.handler.teardown()};var Qd=function(t,e){this.component=t,this.name=e,this.handler=null},Jd=Qd.prototype;Jd.listen=function(t){var e=this.component.instance;this.handler=e.on(this.name,function(){for(var n=[],i=arguments.length;i--;)n[i]=arguments[i];if(n[0]instanceof Pu){var r=n.shift();r.component=e,t.fire(r,n)}else t.fire({},n);return!1})},Jd.unlisten=function(){this.handler.cancel()};var Xd=/^(event|arguments|@node|@event|@context)(\..+)?$/,tf=/^\$(\d+)(\..+)?$/,ef=function(t){var e=this;this.owner=t.owner||t.up.owner||ne(t.up),this.element=this.owner.attributeByName?this.owner:ne(t.up,!0),this.template=t.template,this.up=t.up,this.ractive=t.up.ractive,this.events=[],this.element.type===Uo||this.element.type===Lo?this.template.n.forEach(function(t){e.events.push(new Qd(e.element,t))}):this.template.n.forEach(function(t){var n=y("events",e.ractive,t);n?e.events.push(new Gd(n,e.element,t)):e.events.push(new Zd(t,e.element))}),this.models=null},nf=ef.prototype;nf.bind=function(){A(this.element.events||(this.element.events=[]),this),Ar(this,this.template),this.fn||(this.action=this.template.f)},nf.destroyed=function(){this.events.forEach(function(t){return t.unlisten()})},nf.fire=function(t,e){var n=this;void 0===e&&(e=[]);var i=t instanceof Pu&&t.refire?t:this.element.getContext(t);if(this.fn){var r=[],s=Cr(this,this.template,this.up,{specialRef:function(t){var e=Xd.exec(t);if(e)return{special:e[1],keys:e[2]?k(e[2].substr(1)):[]};var n=tf.exec(t);return n?{special:"arguments",keys:[n[1]-1].concat(n[2]?k(n[2].substr(1)):[])}:void 0}});s&&s.forEach(function(s){if(!s)return r.push(void 0);if(s.special){var a,o=s.special;"@node"===o?a=n.element.node:"@event"===o?a=t&&t.event:"event"===o?(g("The event reference available to event directives is deprecated and should be replaced with @context and @event"),a=i):a="@context"===o?i:e;for(var u=s.keys.slice();a&&u.length;)a=a[u.shift()];return r.push(a)}return s.wrapper?r.push(s.wrapperValue):void r.push(s.get())});var a=this.ractive,o=a.event;a.event=i;var u=this.fn.apply(a,r),l=u.pop();if(l===!1){var c=t?t.original:void 0;c?(c.preventDefault&&c.preventDefault(),c.stopPropagation&&c.stopPropagation()):g("handler '"+this.template.n.join(" ")+"' returned false, but there is no event available to cancel")}else!u.length&&oa(l)&&h(l[0])&&(l=Kt(this.ractive,l.shift(),i,l));return a.event=o,l}return Kt(this.ractive,this.action,i,e)},nf.handleChange=function(){},nf.render=function(){var t=this;no.scheduleTask(function(){return t.events.forEach(function(e){return e.listen(t)})},!0)},nf.toString=function(){return""},nf.unbind=function(){N(this.element.events,this)},nf.unrender=function(){this.events.forEach(function(t){return t.unlisten()})},ef.prototype.update=Oa;var rf=function(t){function e(e){t.call(this,e),e.owner&&(this.parent=e.owner),this.isStatic=!!e.template.s,this.model=null,this.dirty=!1}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){var t=this.containerFragment||this.up,e=Bi(t,this.template);if(e){var n=e.get();if(this.isStatic)return void(this.model={get:function(){return n}});e.register(this),this.model=e}},n.handleChange=function(){this.bubble()},n.rebind=function(t,e,n){return t=at(this.template,t,e,this.up),t===this.model?!1:(this.model&&this.model.unregister(this),t&&t.addShuffleRegister(this,"mark"),this.model=t,n||this.handleChange(),!0)},n.unbind=function(){this.isStatic||(this.model&&this.model.unregister(this),this.model=void 0)},e}(Fc),sf=Zr.prototype=Object.create(Uc.prototype);ea(sf,rf.prototype,{constructor:Zr});var af=function(t){function e(){t.apply(this,arguments)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bubble=function(){this.owner&&this.owner.bubble(),t.prototype.bubble.call(this)},n.detach=function(){return ye(this.node)},n.firstNode=function(){return this.node},n.getString=function(){return this.model?be(this.model.get()):""},n.render=function(t,e){if(!nr()){var n=this.getString();this.rendered=!0,Hr(this,t,e,n)}},n.toString=function(t){var e=this.getString();return t?hn(e):e},n.unrender=function(t){t&&this.detach(),this.rendered=!1},n.update=function(){this.dirty&&(this.dirty=!1,this.rendered&&(this.node.data=this.getString()))},n.valueOf=function(){return this.model?this.model.get():void 0},e}(rf),of=function(t){function e(){t.apply(this,arguments)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.render=function(e,n){t.prototype.render.call(this,e,n),this.node.defaultValue=this.node.value},n.compare=function(t,e){var n=this.getAttribute("value-comparator");if(n){if(u(n))return n(t,e);if(t&&e)return t[n]==e[n]}return t==e},e}($d),uf={"true":!0,"false":!1,"null":null,undefined:void 0},hf=new RegExp("^(?:"+sa(uf).join("|")+")"),lf=/^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/,cf=/\$\{([^\}]+)\}/g,df=/^\$\{([^\}]+)\}/,ff=/^\s*$/,pf=Mh.extend({init:function(t,e){this.values=e.values,this.sp()},postProcess:function(t){return 1===t.length&&ff.test(this.leftover)?{value:t[0].v}:null},converters:[function(e){if(!e.values)return null;var n=e.matchPattern(df);return n&&t(e.values,n)?{v:e.values[n]}:void 0},function(t){var e=t.matchPattern(hf);return e?{v:uf[e]}:void 0},function(t){var e=t.matchPattern(lf);return e?{v:+e}:void 0},function(t){var e=hl(t),n=t.values;return e&&n?{v:e.v.replace(cf,function(t,e){return e in n?n[e]:e})}:e},function(t){if(!t.matchString("{"))return null;var e={};if(t.sp(),t.matchString("}"))return{v:e};for(var n;n=Wr(t);){if(e[n.key]=n.value,t.sp(),t.matchString("}"))return{v:e};if(!t.matchString(","))return null}return null},function(t){if(!t.matchString("["))return null;var e=[];if(t.sp(),t.matchString("]"))return{v:e};for(var n;n=t.read();){if(e.push(n.v),t.sp(),t.matchString("]"))return{v:e};if(!t.matchString(","))return null;t.sp()}return null}]}),mf=function(t,e){var n=new pf(t,{values:e});return n.result},vf=function(t){function e(e){t.call(this,e),this.name=e.template.n,this.owner=e.owner||e.up.owner||e.element||ne(e.up),this.element=e.element||(this.owner.attributeByName?this.owner:ne(e.up)),this.up=this.element.up,this.ractive=this.up.ractive,this.element.attributeByName[this.name]=this,this.value=e.template.f}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){var t=this.template.f,e=this.element.instance.viewmodel;if(0===t)e.joinKey(this.name).set(!0);else if(h(t)){var n=mf(t);e.joinKey(this.name).set(n?n.value:t)}else oa(t)&&Gr(this,!0)},n.render=function(){},n.unbind=function(){this.model&&this.model.unregister(this),this.boundFragment&&this.boundFragment.unbind(),this.element.bound&&this.link.target===this.model&&this.link.owner.unlink()},n.unrender=function(){},n.update=function(){this.dirty&&(this.dirty=!1,this.boundFragment&&this.boundFragment.update())},e}(Fc),gf=function(t){function e(e){var n=e.template;n.a||(n.a={}),void 0!==n.a.value||"disabled"in n.a||(n.a.value=n.f||""),t.call(this,e),this.select=ne(this.parent||this.up,!1,"select")}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){if(!this.select)return void t.prototype.bind.call(this);var e=this.attributeByName.selected;if(e&&void 0!==this.select.getAttribute("value")){var n=this.attributes.indexOf(e);this.attributes.splice(n,1),delete this.attributeByName.selected}t.prototype.bind.call(this),this.select.options.push(this)},n.bubble=function(){var e=this.getAttribute("value");this.node&&this.node.value!==e&&(this.node._ractive.value=e),t.prototype.bubble.call(this)},n.getAttribute=function(t){var e=this.attributeByName[t];return e?e.getValue():"value"===t&&this.fragment?this.fragment.valueOf():void 0},n.isSelected=function(){var t=this,e=this.getAttribute("value");if(void 0===e||!this.select)return!1;var n=this.select.getAttribute("value");if(this.select.compare(n,e))return!0;if(this.select.getAttribute("multiple")&&oa(n))for(var i=n.length;i--;)if(t.select.compare(n[i],e))return!0},n.render=function(e,n){t.prototype.render.call(this,e,n),this.attributeByName.value||(this.node._ractive.value=this.getAttribute("value"))},n.unbind=function(){t.prototype.unbind.call(this),this.select&&N(this.select.options,this)},e}($d),yf=es.prototype=na(Zr.prototype);ea(yf,{constructor:es,bind:function(){var t=this.template;if(this.yielder){if(this.container=this.up.ractive,this.component=this.container.component,this.containerFragment=this.up,!this.component)return this.fragment=new lp({owner:this,template:[]}),void this.fragment.bind();this.up=this.component.up,t.r||t.x||t.tx||(this.refName="content")}this.macro?this.fn=this.macro:(this.refName||(this.refName=t.r),this.refName&&rs(this,this.refName),this.partial||this.fn||(Zr.prototype.bind.call(this),this.model&&rs(this,this.model.get()))),this.partial||this.fn||g("Could not find template for partial '"+this.name+"'"),ns(this,this.partial||[]),this.fn&&os(this),this.fragment.bind()},bubble:function(){this.dirty||(this.dirty=!0,this.yielder?this.containerFragment.bubble():this.up.bubble())},findNextNode:function(){return(this.containerFragment||this.up).findNextNode(this)},handleChange:function(){this.dirtyTemplate=!0,this.externalChange=!0,this.bubble()},refreshAttrs:function(){var t=this;sa(this._attrs).forEach(function(e){t.handle.attributes[e]=t._attrs[e].valueOf()})},resetTemplate:function(){var t=this;if(this.fn&&this.proxy){if(!this.externalChange)return void(this.partial=this.fnTemplate);u(this.proxy.teardown)&&this.proxy.teardown(),this.fn=this.proxy=null}this.partial=null,this.refName&&(this.partial=Yr(this.ractive,this.refName,this.up)),!this.partial&&this.model&&rs(this,this.model.get()),this.unbindAttrs(),this.fn?(os(this),u(this.proxy.render)&&no.scheduleTask(function(){return t.proxy.render()})):this.partial||g("Could not find template for partial '"+this.name+"'")},render:function(t,e){this.fn&&this.fn._cssDef&&!this.fn._cssDef.applied&&Be(),this.fragment.render(t,e),this.proxy&&u(this.proxy.render)&&this.proxy.render()},unbind:function(){this.fragment.unbind(),this.fragment.aliases=null,this.unbindAttrs(),Zr.prototype.unbind.call(this)},unbindAttrs:function(){var t=this;this._attrs&&sa(this._attrs).forEach(function(e){t._attrs[e].unbind()})},unrender:function(t){this.proxy&&u(this.proxy.teardown)&&this.proxy.teardown(),this.fragment.unrender(t)},update:function(){var t=this.proxy;this.updating=1,this.dirtyAttrs&&(this.dirtyAttrs=!1,this.refreshAttrs(),u(t.update)&&t.update(this.handle.attributes)),this.dirtyTemplate&&(this.dirtyTemplate=!1,this.resetTemplate(),this.fragment.resetTemplate(this.partial||[])),this.dirty&&(this.dirty=!1,t&&u(t.invalidate)&&t.invalidate(),this.fragment.update()),this.externalChange=!1,this.updating=0}});var bf="extra-attributes",wf=function(t){this.parent=t.owner.up,this.up=this,this.owner=t.owner,this.ractive=this.parent.ractive,this.delegate=this.ractive.delegate!==!1&&(this.parent.delegate||hs(ne(t.owner))),this.delegate&&this.delegate.delegate===!1&&(this.delegate=!1),this.delegate&&(this.delegate.delegate=this.delegate),this.cssIds="cssIds"in t?t.cssIds:this.parent?this.parent.cssIds:null,this.context=null,this.rendered=!1,this.iterations=[],this.template=t.template,this.indexRef=t.indexRef,this.keyRef=t.keyRef,this.pendingNewIndices=null,this.previousIterations=null,this.isArray=!1},xf=wf.prototype;xf.bind=function(t){var e=this;this.context=t,this.bound=!0;var n=t.get();if(this.isArray=oa(n)){this.iterations=[];for(var i=n.length,r=0;i>r;r+=1)e.iterations[r]=e.createIteration(r,r)}else if(s(n)){if(this.isArray=!1,this.indexRef){var a=this.indexRef.split(",");this.keyRef=a[0],this.indexRef=a[1]}this.iterations=sa(n).map(function(t,n){return e.createIteration(t,n)})}return this},xf.bubble=function(t){this.bubbled||(this.bubbled=[]),this.bubbled.push(t),this.owner.bubble()},xf.createIteration=function(t,e){var n=new lp({owner:this,template:this.template});n.key=t,n.index=e,n.isIteration=!0,n.delegate=this.delegate;var i=this.context.joinKey(t);return this.owner.template.z&&(n.aliases={},n.aliases[this.owner.template.z[0].n]=i),n.bind(i)},xf.destroyed=function(){this.iterations.forEach(D)},xf.detach=function(){var t=ve();return this.iterations.forEach(function(e){return t.appendChild(e.detach())}),t},xf.find=function(t,e){return P(this.iterations,function(n){return n.find(t,e)})},xf.findAll=function(t,e){return this.iterations.forEach(function(n){return n.findAll(t,e)})},xf.findAllComponents=function(t,e){return this.iterations.forEach(function(n){return n.findAllComponents(t,e)})},xf.findComponent=function(t,e){return P(this.iterations,function(n){return n.findComponent(t,e)})},xf.findContext=function(){return this.context},xf.findNextNode=function(t){var e=this;if(t.index<this.iterations.length-1)for(var n=t.index+1;n<this.iterations.length;n++){var i=e.iterations[n].firstNode(!0);if(i)return i}return this.owner.findNextNode()},xf.firstNode=function(t){return this.iterations[0]?this.iterations[0].firstNode(t):null},xf.rebind=function(t){var e=this;this.context=t,this.iterations.forEach(function(n){var i=t?t.joinKey(n.key):void 0;n.context=i,e.owner.template.z&&(n.aliases={},n.aliases[e.owner.template.z[0].n]=i)})},xf.render=function(t,e){var n=this.iterations;if(n)for(var i=n.length,r=0;i>r;r++)n[r].render(t,e);this.rendered=!0},xf.shuffle=function(t){var e=this;this.pendingNewIndices||(this.previousIterations=this.iterations.slice()),this.pendingNewIndices||(this.pendingNewIndices=[]),this.pendingNewIndices.push(t);var n=[];t.forEach(function(t,i){if(-1!==t){var r=e.iterations[i];n[t]=r,t!==i&&r&&(r.dirty=!0)}}),this.iterations=n,this.bubble()},xf.shuffled=function(){this.iterations.forEach(H)},xf.toString=function(t){return this.iterations?this.iterations.map(t?X:J).join(""):""},xf.unbind=function(){return this.bound=!1,this.iterations.forEach(W),this},xf.unrender=function(t){this.iterations.forEach(t?Y:G),this.pendingNewIndices&&this.previousIterations&&this.previousIterations.forEach(function(e){e.rendered&&(t?Y(e):G(e))}),this.rendered=!1},xf.update=function(){var t=this;if(this.pendingNewIndices)return this.bubbled.length=0,void this.updatePostShuffle();if(!this.updating){this.updating=!0;var e,n,i,r=this.context.get(),a=this.isArray,o=!0;if(this.isArray=oa(r))a&&(o=!1,this.iterations.length>r.length&&(e=this.iterations.splice(r.length)));else if(s(r)&&!a)for(o=!1,e=[],n={},i=this.iterations.length;i--;){var u=t.iterations[i];u.key in r?n[u.key]=!0:(t.iterations.splice(i,1),e.push(u))}if(o&&(e=this.iterations,this.iterations=[]),e&&e.forEach(function(t){t.unbind(),t.unrender(!0)}),!o&&this.isArray&&this.bubbled&&this.bubbled.length){var h=this.bubbled;this.bubbled=[],h.forEach(function(e){return t.iterations[e]&&t.iterations[e].update()})}else this.iterations.forEach(Q);var l,c,d=oa(r)?r.length:s(r)?sa(r).length:0;if(d>this.iterations.length){if(l=this.rendered?ve():null,i=this.iterations.length,oa(r))for(;i<r.length;)c=t.createIteration(i,i),t.iterations.push(c),t.rendered&&c.render(l),i+=1;else if(s(r)){if(this.indexRef&&!this.keyRef){var f=this.indexRef.split(",");this.keyRef=f[0],this.indexRef=f[1]}sa(r).forEach(function(e){n&&e in n||(c=t.createIteration(e,i),t.iterations.push(c),t.rendered&&c.render(l),i+=1)})}if(this.rendered){var p=this.parent.findParentNode(),m=this.parent.findNextNode(this.owner);p.insertBefore(l,m)}}this.updating=!1}},xf.updatePostShuffle=function(){var t=this,e=this.pendingNewIndices[0];this.pendingNewIndices.slice(1).forEach(function(t){e.forEach(function(n,i){e[i]=t[n]})});var n,i=this.context.get().length,r=this.previousIterations.length,s={};e.forEach(function(e,n){var i=t.previousIterations[n];if(t.previousIterations[n]=null,-1===e)s[n]=i;else if(i.index!==e){var r=t.context.joinKey(e);i.index=i.key=e,i.context=r,t.owner.template.z&&(i.aliases={},i.aliases[t.owner.template.z[0].n]=r)}}),this.previousIterations.forEach(function(t,e){t&&(s[e]=t)});var a=this.rendered?ve():null,o=this.rendered?this.parent.findParentNode():null,u="startIndex"in e;for(n=u?e.startIndex:0;i>n;n++){var h=t.iterations[n];h&&u?t.rendered&&(s[n]&&a.appendChild(s[n].detach()),a.childNodes.length&&o.insertBefore(a,h.firstNode())):(h||(t.iterations[n]=t.createIteration(n,n)),t.rendered&&(s[n]&&a.appendChild(s[n].detach()),h?a.appendChild(h.detach()):t.iterations[n].render(a)))}if(this.rendered){for(n=i;r>n;n++)s[n]&&a.appendChild(s[n].detach());a.childNodes.length&&o.insertBefore(a,this.owner.findNextNode())}sa(s).forEach(function(t){return s[t].unbind().unrender(!0)}),this.iterations.forEach(Q),this.pendingNewIndices=null,this.shuffled()},wf.prototype.getContext=_t;var _f=function(t){function e(e){t.call(this,e),this.sectionType=e.template.n||null,this.templateSectionType=this.sectionType,this.subordinate=1===e.template.l,this.fragment=null}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bind=function(){t.prototype.bind.call(this),this.subordinate&&(this.sibling=this.up.items[this.up.items.indexOf(this)-1],this.sibling.nextSibling=this),this.model?(this.dirty=!0,this.update()):!this.sectionType||this.sectionType!==cu||this.sibling&&this.sibling.isTruthy()||(this.fragment=new lp({owner:this,template:this.template.f}).bind())},n.detach=function(){var e=this.fragment||this.detached;return e?e.detach():t.prototype.detach.call(this)},n.isTruthy=function(){if(this.subordinate&&this.sibling.isTruthy())return!0;var t=this.model?this.model.isRoot?this.model.value:this.model.get():void 0;return!(!t||this.templateSectionType!==pu&&ls(t))},n.rebind=function(e,n,i){t.prototype.rebind.call(this,e,n,i)&&this.fragment&&this.sectionType!==lu&&this.sectionType!==cu&&this.fragment.rebind(e)},n.render=function(t,e){this.rendered=!0,this.fragment&&this.fragment.render(t,e)},n.shuffle=function(t){this.fragment&&this.sectionType===du&&this.fragment.shuffle(t)},n.unbind=function(){t.prototype.unbind.call(this),this.fragment&&this.fragment.unbind();
},n.unrender=function(t){this.rendered&&this.fragment&&this.fragment.unrender(t),this.rendered=!1},n.update=function(){var t=this;if(this.dirty&&(this.fragment&&this.sectionType!==lu&&this.sectionType!==cu&&(this.fragment.context=this.model),this.model||this.sectionType===cu)){this.dirty=!1;var e=this.model?this.model.isRoot?this.model.value:this.model.get():void 0,n=!this.subordinate||!this.sibling.isTruthy(),i=this.sectionType;(null===this.sectionType||null===this.templateSectionType)&&(this.sectionType=cs(e,this.template.i)),i&&i!==this.sectionType&&this.fragment&&(this.rendered&&this.fragment.unbind().unrender(!0),this.fragment=null);var r,s=this.sectionType===du||this.sectionType===fu||n&&(this.sectionType===cu?!this.isTruthy():this.isTruthy());if(s)if(this.fragment||(this.fragment=this.detached),this.fragment)this.detached&&(ds(this,this.fragment),this.detached=!1,this.rendered=!0),this.fragment.bound||this.fragment.bind(this.model),this.fragment.update();else if(this.sectionType===du)r=new wf({owner:this,template:this.template.f,indexRef:this.template.i}).bind(this.model);else{var a=this.sectionType!==lu&&this.sectionType!==cu?this.model:null;r=new lp({owner:this,template:this.template.f}).bind(a)}else this.fragment&&this.rendered?yo!==!0?this.fragment.unbind().unrender(!0):(this.unrender(!1),this.detached=this.fragment,no.promise().then(function(){t.detached&&t.detach()})):this.fragment&&this.fragment.unbind(),this.fragment=null;r&&(this.rendered&&ds(this,r),this.fragment=r),this.nextSibling&&(this.nextSibling.dirty=!0,this.nextSibling.update())}},e}(Zr),kf=function(t){function e(e){t.call(this,e),this.options=[]}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.foundNode=function(t){if(this.binding){var e=Pr(t);e.length>0&&(this.selectedOptions=e)}},n.render=function(e,n){t.prototype.render.call(this,e,n),this.sync();for(var i=this.node,r=i.options.length;r--;)i.options[r].defaultSelected=i.options[r].selected;this.rendered=!0},n.sync=function(){var t=this,e=this.node;if(e){var n=V(e.options);if(this.selectedOptions)return n.forEach(function(e){t.selectedOptions.indexOf(e)>=0?e.selected=!0:e.selected=!1}),this.binding.setFromNode(e),void delete this.selectedOptions;var i=this.getAttribute("value"),r=this.getAttribute("multiple"),s=r&&oa(i);if(void 0!==i){var a;n.forEach(function(e){var n=e._ractive?e._ractive.value:e.value,o=r?s&&t.valueContains(i,n):t.compare(i,n);o&&(a=!0),e.selected=o}),a||r||this.binding&&this.binding.forceUpdate()}else this.binding&&this.binding.forceUpdate()}},n.valueContains=function(t,e){for(var n=this,i=t.length;i--;)if(n.compare(e,t[i]))return!0},n.compare=function(t,e){var n=this.getAttribute("value-comparator");if(n){if(u(n))return n(e,t);if(e&&t)return e[n]==t[n]}return e==t},n.update=function(){var e=this.dirty;t.prototype.update.call(this),e&&this.sync()},e}($d),Ef=function(t){function e(e){var n=e.template;e.deferContent=!0,t.call(this,e),this.attributeByName.value||(n.f&&Br({template:n})?(this.attributes||(this.attributes=[])).push(ws({owner:this,template:{t:Fo,f:n.f,n:"value"},up:this.up})):this.fragment=new lp({owner:this,cssIds:null,template:n.f}))}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.bubble=function(){var t=this;this.dirty||(this.dirty=!0,this.rendered&&!this.binding&&this.fragment&&no.scheduleTask(function(){t.dirty=!1,t.node.value=t.fragment.toString()}),this.up.bubble())},e}(of),Af=function(t){function e(e){t.call(this,e),this.type=No}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.detach=function(){return ye(this.node)},n.firstNode=function(){return this.node},n.render=function(t,e){nr()||(this.rendered=!0,Hr(this,t,e,this.template))},n.toString=function(t){return t?hn(this.template):this.template},n.unrender=function(t){this.rendered&&t&&this.detach(),this.rendered=!1},n.valueOf=function(){return this.template},e}(Fc),Cf=Af.prototype;Cf.bind=Cf.unbind=Cf.update=Oa;var Sf,Of="hidden";if(ka){var jf;if(Of in ka)jf="";else for(var Nf=Sa.length;Nf--;){var Tf=Sa[Nf];if(Of=Tf+"Hidden",Of in ka){jf=Tf;break}}void 0!==jf?(ka.addEventListener(jf+"visibilitychange",fs),fs()):("onfocusout"in ka?(ka.addEventListener("focusout",ps),ka.addEventListener("focusin",ms)):(_a.addEventListener("pagehide",ps),_a.addEventListener("blur",ps),_a.addEventListener("pageshow",ms),_a.addEventListener("focus",ms)),Sf=!0)}var Vf;if(Ea){var Pf={},If=Bu("div").style;Vf=function(t){if(!Pf[t]){var e=ed(t);if(void 0!==If[t])Pf[t]=e;else for(var n=Sa.length;n--;){var i="-"+Sa[n]+"-"+e;if(void 0!==If[i]){Pf[t]=i;break}}}return Pf[t]}}else Vf=null;var Mf,Bf=Vf,Rf=new RegExp("^(?:"+Sa.join("|")+")([A-Z])"),Kf=function(t){return t?(Rf.test(t)&&(t="-"+t),t.replace(/[A-Z]/g,function(t){return"-"+t.toLowerCase()})):""};if(Ea){var Df,Lf,Ff,zf,Uf,$f,qf=Bu("div").style,Hf=function(t){return t},Zf={},Wf={};void 0!==qf.transition?(Df="transition",Lf="transitionend",Ff=!0):void 0!==qf.webkitTransition?(Df="webkitTransition",Lf="webkitTransitionEnd",Ff=!0):Ff=!1,Df&&(zf=Df+"Duration",Uf=Df+"Property",$f=Df+"TimingFunction"),Mf=function(t,e,n,i,r){setTimeout(function(){function s(){clearTimeout(f)}function a(){c&&d&&(t.unregisterCompleteHandler(s),t.ractive.fire(t.name+":end",t.node,t.isIntro),r())}function o(t){var e=i.indexOf(t.propertyName);-1!==e&&i.splice(e,1),i.length||(clearTimeout(f),l())}function l(){m[Uf]=y.property,m[$f]=y.duration,m[zf]=y.timing,t.node.removeEventListener(Lf,o,!1),d=!0,a()}var c,d,f,p=(t.node.namespaceURI||"")+t.node.tagName,m=t.node.style,y={property:m[Uf],timing:m[$f],duration:m[zf]};t.node.addEventListener(Lf,o,!1),f=setTimeout(function(){i=[],l()},n.duration+(n.delay||0)+50),t.registerCompleteHandler(s),m[Uf]=i.join(",");var b=Kf(n.easing||"linear");m[$f]=b;var x=m[$f]===b;m[zf]=n.duration/1e3+"s",setTimeout(function(){for(var r,s,l,f,y,b=i.length,_=null,k=[];b--;){if(l=i[b],r=p+l,x&&Ff&&!Wf[r]){var E=m[l];m[l]=e[l],r in Zf||(_=t.getStyle(l),Zf[r]=t.getStyle(l)!=e[l],Wf[r]=!Zf[r],Wf[r]&&(m[l]=E))}x&&Ff&&!Wf[r]||(null===_&&(_=t.getStyle(l)),s=i.indexOf(l),-1===s?v("Something very strange happened with transitions. Please raise an issue at https://github.com/ractivejs/ractive/issues - thanks!",{node:t.node}):i.splice(s,1),f=/[^\d]*$/.exec(_)[0],y=w(parseFloat(_),parseFloat(e[l])),y?k.push({name:l,interpolator:y,suffix:f}):m[l]=e[l],_=null)}if(k.length){var A;h(n.easing)?(A=t.ractive.easing[n.easing],A||(g(Ma(n.easing,"easing")),A=Hf)):A=u(n.easing)?n.easing:Hf,new so({duration:n.duration,easing:A,step:function(t){for(var e=k.length;e--;){var n=k[e];m[n.name]=n.interpolator(t)+n.suffix}},complete:function(){c=!0,a()}})}else c=!0;i.length?m[Uf]=i.join(","):(m[Uf]="none",t.node.removeEventListener(Lf,o,!1),d=!0,a())},0)},n.delay||0)}}else Mf=null;var Gf=Mf,Yf=_a&&_a.getComputedStyle,Qf=Promise.resolve(),Jf={t0:"intro-outro",t1:"intro",t2:"outro"},Xf=function(t){this.owner=t.owner||t.up.owner||ne(t.up),this.element=this.owner.attributeByName?this.owner:ne(t.up),this.ractive=this.owner.ractive,this.template=t.template,this.up=t.up,this.options=t,this.onComplete=[]},tp=Xf.prototype;tp.animateStyle=function(t,e,n){var i=this;if(4===arguments.length)throw new Error("t.animateStyle() returns a promise - use .then() instead of passing a callback");if(!Sf)return this.setStyle(t,e),Qf;var r;return h(t)?(r={},r[t]=e):(r=t,n=e),new Promise(function(t){if(!n.duration)return i.setStyle(r),void t();for(var e=sa(r),s=[],a=Yf(i.node),o=e.length;o--;){var u=e[o],h=Bf(u),l=a[Bf(u)],c=i.node.style[h];h in i.originals||(i.originals[h]=i.node.style[h]),i.node.style[h]=r[u],i.targets[h]=i.node.style[h],i.node.style[h]=c,l!=r[u]&&(s.push(h),r[h]=r[u],i.node.style[h]=l)}return s.length?void Gf(i,r,n,s,t):void t()})},tp.bind=function(){var t=this.options,e=t.template&&t.template.v;e&&(("t0"===e||"t1"===e)&&(this.element.intro=this),("t0"===e||"t2"===e)&&(this.element.outro=this),this.eventName=Jf[e]);var n=this.owner.ractive;this.name=t.name||t.template.n,t.params&&(this.params=t.params),u(this.name)?(this._fn=this.name,this.name=this._fn.name):this._fn=y("transitions",n,this.name),this._fn||g(Ma(this.name,"transition"),{ractive:n}),Ar(this,t.template)},tp.getParams=function(){if(this.params)return this.params;if(this.fn){var t=Cr(this,this.template,this.up).map(function(t){return t?t.get():void 0});return this.fn.apply(this.ractive,t)}},tp.getStyle=function(t){var e=Yf(this.node);if(h(t))return e[Bf(t)];if(!oa(t))throw new Error("Transition$getStyle must be passed a string, or an array of strings representing CSS properties");for(var n={},i=t.length;i--;){var r=t[i],s=e[Bf(r)];"0px"===s&&(s=0),n[r]=s}return n},tp.processParams=function(t,e){return l(t)?t={duration:t}:h(t)?t="slow"===t?{duration:600}:"fast"===t?{duration:200}:{duration:400}:t||(t={}),ea({},e,t)},tp.registerCompleteHandler=function(t){A(this.onComplete,t)},tp.setStyle=function(e,n){var i=this;if(h(e)){var r=Bf(e);t(this.originals,r)||(this.originals[r]=this.node.style[r]),this.node.style[r]=n,this.targets[r]=this.node.style[r]}else{var s;for(s in e)t(e,s)&&i.setStyle(s,e[s])}return this},tp.shouldFire=function(t){if(!this.ractive.transitionsEnabled)return!1;if("intro"===t&&this.ractive.rendering&&vs("noIntro",this.ractive,!0))return!1;if("outro"===t&&this.ractive.unrendering&&vs("noOutro",this.ractive,!1))return!1;var e=this.getParams();if(!this.element.parent)return!0;if(e&&e[0]&&s(e[0])&&"nested"in e[0]){if(e[0].nested!==!1)return!0}else if(vs("nestedTransitions",this.ractive)!==!1)return!0;for(var n=this.element.parent;n;){if(n[t]&&n[t].starting)return!1;n=n.parent}return!0},tp.start=function(){var t,e=this,n=this.node=this.element.node,i=this.originals={},r=this.targets={},s=this.getParams();if(this.complete=function(s){if(e.starting=!1,!t){if(e.onComplete.forEach(function(t){return t()}),!s&&e.isIntro)for(var a in r)n.style[a]===r[a]&&(n.style[a]=i[a]);e._manager.remove(e),t=!0}},!this._fn)return void this.complete();var a=this._fn.apply(this.ractive,[this].concat(s));a&&a.then(this.complete)},tp.toString=function(){return""},tp.unbind=function(){if(!this.element.attributes.unbinding){var t=this.options&&this.options.template&&this.options.template.v;("t0"===t||"t1"===t)&&(this.element.intro=null),("t0"===t||"t2"===t)&&(this.element.outro=null)}},tp.unregisterCompleteHandler=function(t){N(this.onComplete,t)};var ep=Xf.prototype;ep.destroyed=ep.render=ep.unrender=ep.update=Oa;var np,ip,rp={};try{Bu("table").innerHTML="foo"}catch(sp){np=!0,ip={TABLE:['<table class="x">',"</table>"],THEAD:['<table><thead class="x">',"</thead></table>"],TBODY:['<table><tbody class="x">',"</tbody></table>"],TR:['<table><tr class="x">',"</tr></table>"],SELECT:['<select class="x">',"</select>"]}}var ap=function(t,e){var n=[];if(null==t||""===t)return n;var i,r,s;np&&(r=ip[e.tagName])?(i=gs("DIV"),i.innerHTML=r[0]+t+r[1],i=i.querySelector(".x"),"SELECT"===i.tagName&&(s=i.options[i.selectedIndex])):e.namespaceURI===Wu?(i=gs("DIV"),i.innerHTML='<svg class="x">'+t+"</svg>",i=i.querySelector(".x")):"TEXTAREA"===e.tagName?(i=Bu("div"),"undefined"!=typeof i.textContent?i.textContent=t:i.innerHTML=t):(i=gs(e.tagName),i.innerHTML=t,"SELECT"===i.tagName&&(s=i.options[i.selectedIndex]));for(var a;a=i.firstChild;)n.push(a),i.removeChild(a);var o;if("SELECT"===e.tagName)for(o=n.length;o--;)n[o]!==s&&(n[o].selected=!1);return n},op=function(t){function e(e){t.call(this,e)}t&&(e.__proto__=t);var n=e.prototype=Object.create(t&&t.prototype);return n.constructor=e,n.detach=function(){var t=ve();return this.nodes&&this.nodes.forEach(function(e){return t.appendChild(e)}),t},n.find=function(t){var e,n=this,i=this.nodes.length;for(e=0;i>e;e+=1){var r=n.nodes[e];if(1===r.nodeType){if(Ru(r,t))return r;var s=r.querySelector(t);if(s)return s}}return null},n.findAll=function(t,e){var n,i=this,r=e.result,s=this.nodes.length;for(n=0;s>n;n+=1){var a=i.nodes[n];if(1===a.nodeType){Ru(a,t)&&r.push(a);var o=a.querySelectorAll(t);o&&r.push.apply(r,o)}}},n.findComponent=function(){return null},n.firstNode=function(){return this.rendered&&this.nodes[0]},n.render=function(t,e,n){var i=this;if(!this.nodes){var r=this.model?this.model.get():"";this.nodes=ap(r,t)}var s=this.nodes;if(e){for(var a,o=-1;e.length&&(a=this.nodes[o+1]);)for(var u=void 0;u=e.shift();){var h=u.nodeType;if(h===a.nodeType&&(1===h&&u.outerHTML===a.outerHTML||(3===h||8===h)&&u.nodeValue===a.nodeValue)){i.nodes.splice(++o,1,u);break}t.removeChild(u)}o>=0&&(s=this.nodes.slice(o)),e.length&&(n=e[0])}if(s.length){var l=ve();s.forEach(function(t){return l.appendChild(t)}),n?t.insertBefore(l,n):t.appendChild(l)}this.rendered=!0},n.toString=function(){var t=this.model&&this.model.get();return t=null!=t?""+t:"",ar()?un(t):t},n.unrender=function(){this.nodes&&this.nodes.forEach(function(t){no.detachWhenReady({node:t,detach:function(){ye(t)}})}),this.rendered=!1,this.nodes=null},n.update=function(){this.rendered&&this.dirty?(this.dirty=!1,this.unrender(),this.render(this.up.findParentNode(),null,this.up.findNextNode(this))):this.dirty=!1},e}(rf),up={};up[Zo]=td,up[Lo]=wd,up[Ho]=Ad,up[To]=af,up[Ro]=es,up[Po]=_f,up[Vo]=op,up[$o]=es,up[Fo]=ld,up[wu]=cd,up[yu]=kd,up[gu]=ef,up[bu]=Xf,up[Ko]=ur;var hp={doctype:Ad,form:Hd,input:of,option:gf,select:kf,textarea:Ef},lp=function(t){this.owner=t.owner,this.isRoot=!t.owner.up,this.parent=this.isRoot?null:this.owner.up,this.ractive=t.ractive||(this.isRoot?t.owner:this.parent.ractive),this.componentParent=this.isRoot&&this.ractive.component?this.ractive.component.up:null,this.delegate=(this.parent?this.parent.delegate:this.componentParent&&this.componentParent.delegate)||this.owner.containerFragment&&this.owner.containerFragment.delegate,this.context=null,this.rendered=!1,"cssIds"in t?this.cssIds=t.cssIds&&t.cssIds.length&&t.cssIds:this.cssIds=this.parent?this.parent.cssIds:null,this.dirty=!1,this.dirtyValue=!0,this.template=t.template||[],this.createItems()},cp=lp.prototype;cp.bind=function(t){return this.context=t,this.items.forEach(R),this.bound=!0,this.dirty&&this.update(),this},cp.bubble=function(){this.dirtyValue=!0,this.dirty||(this.dirty=!0,this.isRoot?this.ractive.component?this.ractive.component.bubble():this.bound&&no.addFragment(this):this.owner.bubble(this.index))},cp.createItems=function(){var t=this,e=this.template.length;this.items=[];for(var n=0;e>n;n++)t.items[n]=ws({up:t,template:t.template[n],index:n})},cp.destroyed=function(){this.items.forEach(D)},cp.detach=function(){for(var t=ve(),e=this.items,n=e.length,i=0;n>i;i++)t.appendChild(e[i].detach());return t},cp.find=function(t,e){return P(this.items,function(n){return n.find(t,e)})},cp.findAll=function(t,e){this.items&&this.items.forEach(function(n){return n.findAll&&n.findAll(t,e)})},cp.findComponent=function(t,e){return P(this.items,function(n){return n.findComponent(t,e)})},cp.findAllComponents=function(t,e){this.items&&this.items.forEach(function(n){return n.findAllComponents&&n.findAllComponents(t,e)})},cp.findContext=function(){var t=kt(this);return t&&t.context?t.context:this.ractive.viewmodel},cp.findNextNode=function(t){var e=this;if(t)for(var n,i=t.index+1;i<this.items.length;i++)if(n=e.items[i],n&&n.firstNode){var r=n.firstNode(!0);if(r)return r}return this.isRoot?this.ractive.component?this.ractive.component.up.findNextNode(this.ractive.component):null:this.parent?this.owner.findNextNode(this):void 0},cp.findParentNode=function(){var t=this;do{if(t.owner.type===Bo)return t.owner.node;if(t.isRoot&&!t.ractive.component)return t.ractive.el;t=t.owner.type===$o?t.owner.containerFragment:t.componentParent||t.parent}while(t);throw new Error("Could not find parent node")},cp.findRepeatingFragment=function(){for(var t=this;(t.parent||t.componentParent)&&!t.isIteration;)t=t.parent||t.componentParent;return t},cp.firstNode=function(t){var e=P(this.items,function(t){return t.firstNode(!0)});return e?e:t?null:this.parent.findNextNode(this.owner)},cp.rebind=function(t){this.context=t},cp.render=function(t,e){if(this.rendered)throw new Error("Fragment is already rendered!");this.rendered=!0;for(var n=this.items,i=n.length,r=0;i>r;r++)n[r].render(t,e)},cp.resetTemplate=function(t){var e=this.bound,n=this.rendered;if(e&&(n&&this.unrender(!0),this.unbind()),this.template=t,this.createItems(),e&&(this.bind(this.context),n)){var i=this.findParentNode(),r=this.findNextNode();if(r){var s=ve();this.render(s),i.insertBefore(s,r)}else this.render(i)}},cp.shuffled=function(){this.items.forEach(H)},cp.toString=function(t){return this.items.map(t?X:J).join("")},cp.unbind=function(){return this.context=null,this.items.forEach(W),this.bound=!1,this},cp.unrender=function(t){this.items.forEach(t?_s:G),this.rendered=!1},cp.update=function(){this.dirty&&(this.updating?this.isRoot&&no.addFragmentToRoot(this):(this.dirty=!1,this.updating=!0,this.items.forEach(Q),this.updating=!1))},cp.valueOf=function(){if(1===this.items.length)return this.items[0].valueOf();if(this.dirtyValue){var t={},e=xs(this.items,t,this.ractive._guid),n=mf(e,t);this.value=n?n.value:this.toString(),this.dirtyValue=!1}return this.value},lp.prototype.getContext=_t;var dp=function(t){this.hook=new Co(t),this.inProcess={},this.queue={}},fp=dp.prototype;fp.begin=function(t){this.inProcess[t._guid]=!0},fp.end=function(t){var e=t.parent;e&&this.inProcess[e._guid]?ks(this.queue,e).push(t):Es(this,t),delete this.inProcess[t._guid]};var pp=new Co("config"),mp=new dp("init"),vp=new Co("render"),gp=new Co("complete"),yp=["template","partials","components","decorators","events"],bp=new Co("complete"),wp=new Co("reset"),xp=new Co("render"),_p=new Co("unrender"),kp=function(t,e){var n=[];Ns(this.fragment.items,t,!1,n);var i=no.start();return this.partials[t]=e,n.forEach(L),no.end(),i},Ep=ku("reverse").path,Ap=ku("shift").path,Cp=ku("sort").path,Sp=ku("splice").path,Op=new Co("unrender"),jp=ku("unshift").path,Np={add:Nt,animate:It,attachChild:qt,detach:Wt,detachChild:Gt,find:Yt,findAll:Qt,findAllComponents:Jt,findComponent:Xt,findContainer:te,findParent:ee,fire:le,get:ce,getContext:pe,getNodeInfo:me,insert:xe,link:ke,observe:Oe,observeOnce:Ne,off:Te,on:Ve,once:Pe,pop:lh,push:ch,readLink:Ie,render:Os,reset:js,resetPartial:kp,resetTemplate:Ts,reverse:Ep,set:Vs,shift:Ap,sort:Cp,splice:Sp,subtract:Ps,teardown:hr,toggle:Is,toCSS:Ms,toCss:Ms,toHTML:Bs,toHtml:Bs,toText:Rs,transition:Ks,unlink:Ds,unrender:Ls,unshift:jp,update:ae,updateModel:Fs};ia(Np,"target",{get:function(){return this.el}});var Tp=/super\s*\(|\.call\s*\(\s*this/;if(ra(Xs,{sharedGet:{value:qs},sharedSet:{value:$s},styleGet:{configurable:!0,value:Us.bind(Xs)},styleSet:{configurable:!0,value:qe.bind(Xs)}}),_a&&!_a.Ractive){var Vp="",Pp=document.currentScript||document.querySelector("script[data-ractive-options]");Pp&&(Vp=Pp.getAttribute("data-ractive-options")||""),~Vp.indexOf("ForceGlobal")&&(_a.Ractive=Xs)}else _a&&p("Ractive already appears to be loaded while loading 1.0.0-edge.");return ea(Xs.prototype,Np,wa),Xs.prototype.constructor=Xs,Xs.defaults=Xs.prototype,vc.defaults=Xs.defaults,vc.Ractive=Xs,ra(Xs,{DEBUG:{writable:!0,value:!0},DEBUG_PROMISES:{writable:!0,value:!0},extend:{value:Hs},extendWith:{value:Zs},escapeKey:{value:x},evalObjectString:{value:mf},findPlugin:{value:Js},getContext:{value:de},getCSS:{value:Re},getNodeInfo:{value:fe},isInstance:{value:zs},joinKeys:{value:Ys},macro:{value:Gs},normaliseKeypath:{value:_},parse:{value:vi},splitKeypath:{value:Qs},unescapeKey:{value:E},enhance:{writable:!0,value:!1},svg:{value:Ca},VERSION:{value:"1.0.0-edge"},adaptors:{writable:!0,value:{}},components:{writable:!0,value:{}},decorators:{writable:!0,value:{}},easing:{writable:!0,value:xa},events:{writable:!0,value:{}},extensions:{value:[]},interpolators:{writable:!0,value:Ba},partials:{writable:!0,value:{}},transitions:{writable:!0,value:{}},cssData:{configurable:!0,value:{}},sharedData:{value:ho},Ractive:{value:Xs},Context:{value:mo.Context.prototype}}),ia(Xs,"_cssModel",{configurable:!0,value:new Sh(Xs)}),Xs});
//# sourceMappingURL=ractive.min.js.map
;
(function(global,factory){typeof exports==="object"&&typeof module!=="undefined"?factory(exports):typeof define==="function"&&define.amd?define(["exports"],factory):factory(global.RactiveWindow={})})(this,function(exports){"use strict";var _slicedToArray=function(arr,i){if(Array.isArray(arr)){return arr}else if(Symbol.iterator in Object(arr)){var _arr=[];for(var _iterator=arr[Symbol.iterator](),_step;!(_step=_iterator.next()).done;){_arr.push(_step.value);if(i&&_arr.length===i)break}return _arr}else{throw new TypeError("Invalid attempt to destructure non-iterable instance")}};var template="		{{#_wnd_rendered}}			<div id='ractive-window-{{.id}}' 						class='ractive-window{{#(.buttons.length > 0)}} with-buttons{{/}}{{#.resizable}} resizable{{else}} fixed{{/}}{{#.geometry.state === 2}} maximized{{/}}{{#.class.window}} {{.class.window}}{{/}}{{#.topmost}} topmost{{/}}' 						on-click='_raise' 						style='{{#.hidden}}display: none;{{/}}top: {{.geometry.top}}px; left: {{.geometry.left}}px; {{#(.resizable || .geometry.state === 2)}}width: {{.geometry.width}}{{.geometry.dwunit}}; height: {{.geometry.height}}{{.geometry.dhunit}}; {{/}}z-index: {{.geometry.index}};{{#.style.window}} {{.style.window}}{{/}}'>\n							<div class='rw-modal' on-mousedown='_moveStart' style='{{^.blocked}}display: none;{{/}}'></div>\n  							<div class='rw-interior'>\n 								<div class='rw-controls'>{{>controls}}</div>\n  								<div class='rw-title' on-touchstart-mousedown='_moveStart' on-dblclick='_restore'>{{>title}}</div>\n  								{{#if dialog}}<div class='rw-dialog-cover'></div><div class='rw-dialog' style='width: {{dialog.width}}px; {{#if dialog.height}}height: {{dialog.height}}px; {{/if}}'>{{> ~/makePartial('sharedialog', dialog.raw) }}</div>{{/if}}								<div class='rw-body{{#.class.body}} {{.class.body}}{{/}}' {{#.style.body}}style='{{.style.body}}'{{/}}>{{>body}}</div>\n  								{{#(.buttons.length > 0)}}<div class='rw-buttons'>{{>buttons}}</div>{{/}}\n  								<div class='rw-resize-handle' on-touchstart-mousedown='_resizeStart'></div>\n   								<div class='rw-foot'>{{>foot}}</div>\n 							</div>\n			</div>		{{/}}";var Window;Window=Ractive.extend({template:template,prompt:function(message,cb){this.dialog({content:message,raw:"{{dialog.content}}<br><input class='form-control' value='{{dialog.reply}}' /> <div style='position: absolute;bottom: 10px;right: 10px;'><a class='btn btn-xs btn-default' on-click='@this.set(\"dialog\", false )'>Cancel</a> <a class='btn btn-xs btn-primary' on-click='dialog.callback.prompt:{{dialog}}'>OK</a></div>",width:300,cb:cb})},confirm:function(message,cb){this.dialog({content:message,raw:"{{dialog.content}} <div style='position: absolute;bottom: 10px;right: 10px;'><a class='btn btn-xs btn-default' on-click='@this.set(\"dialog\", false )'>Cancel</a> <a class='btn btn-xs btn-primary' on-click='dialog.callback.ok:{{dialog}}'>OK</a></div>",width:300,cb:cb})},dialog:function(opts){this.set("dialog",{content:opts.content,params:opts.params,raw:opts.raw,width:opts.width,height:opts.height,cb:opts.cb})},onconstruct:function(opts){var wnd=this;var sx,sy;var moveFn;moveFn=function(e){var x,y;e.preventDefault();if(e.type.indexOf("touch")>=0){x=+e.changedTouches[0].clientX;y=+e.changedTouches[0].clientY}else{x=+(e.x||e.clientX);y=+(e.y||e.clientY)}wnd.move(+wnd.get("geometry.left")+x-+sx,+wnd.get("geometry.top")+y-+sy);sx=x;sy=y;if(e.type==="mouseup"||e.type==="touchend"){document.removeEventListener("mousemove",moveFn,false);document.removeEventListener("mouseup",moveFn,false);document.removeEventListener("touchmove",moveFn,false);document.removeEventListener("touchend",moveFn,false)}};wnd.on("_moveStart",function(e){if(e.original.type==="mousedown"&&e.original.button===0||e.original.type==="touchstart"){wnd.restore();if(e.original.type.indexOf("touch")>=0){sx=+e.original.changedTouches[0].clientX;sy=+e.original.changedTouches[0].clientY}else{sx=+(e.original.x||e.original.clientX);sy=+(e.original.y||e.original.clientY)}document.addEventListener("mousemove",moveFn);document.addEventListener("mouseup",moveFn);document.addEventListener("touchmove",moveFn);document.addEventListener("touchend",moveFn);e.original.preventDefault()}$("iframe",wnd.element).focus()});var resizeFn;resizeFn=function(e){var x,y;e.preventDefault();if(e.type.indexOf("touch")>=0){x=e.changedTouches[0].clientX;y=e.changedTouches[0].clientY}else{x=+(e.x||e.clientX);y=+(e.y||e.clientY)}var w=+wnd.get("geometry.width")+(x-+sx);var h=+wnd.get("geometry.height")+(y-+sy);wnd.resize(w,h);sx=x;sy=y;if(e.type==="mouseup"||e.type==="touchend"){document.removeEventListener("mousemove",resizeFn,false);document.removeEventListener("mouseup",resizeFn,false);document.removeEventListener("touchmove",resizeFn,false);document.removeEventListener("touchend",resizeFn,false)}};wnd.on("_resizeStart",function(e){if(e.original.type=="mousedown"&&e.original.button===0||e.original.type==="touchstart"){wnd.restore();if(e.original.type.indexOf("touch")>=0){sx=e.original.changedTouches[0].clientX;sy=e.original.changedTouches[0].clientY}else{sx=e.original.x||e.original.clientX;sy=e.original.y||e.original.clientY}document.addEventListener("mousemove",resizeFn);document.addEventListener("mouseup",resizeFn);document.addEventListener("touchmove",resizeFn);document.addEventListener("touchend",resizeFn)}});var stateFn=function(target,e){switch(target){case"min":wnd.minimize();break;case"max":wnd.maximize();break;case"normal":wnd.restore();break;default:break}};wnd.on("dialog.callback.ok",function(e,dialog){this.set("dialog",false);try{dialog.cb()}catch(e){}});wnd.on("dialog.callback.prompt",function(e,dialog){try{dialog.cb(dialog.reply)}catch(e){}this.set("dialog",false)});wnd.on("_minimize",function(e){stateFn("min",e)});wnd.on("_restore",function(e){switch(wnd.get("geometry.state")){case 0:stateFn("max",e);break;case 1:case 2:stateFn("normal",e);break;default:break}});wnd.on("_raise",function(e){wnd.raise()});wnd.on("_close",function(e){wnd.close()});wnd.on("_dialog-button",function(e){var fn=e.context.action;if(!!fn&&typeof fn==="function")fn.call(this)});wnd.result=null;wnd.waitForClose=wnd.afterClose=new Promise(function(y,n){var fn=function(t){return function(v){wnd.completeAfterClose=null;wnd.rejectAfterClose=null;t(v)}};wnd.completeAfterClose=fn(y);wnd.rejectAfterClose=fn(n)})},onrender:function onrender(){var _this=this;if(!!!this.get("buttonClass")&&!!this.parent.get("buttonClass")){this.set("buttonClass",this.parent.get("buttonClass"))}this.watchers=this.observe({title:function(n,o){_this.fire("retitle",n,_this)},"geometry.state":function(n,o){switch(n){case 0:_this.fire("restore",n,_this);break;case 1:_this.fire("minimize",n,_this);break;case 2:_this.fire("maximize",n,_this);break}}})},onunrender:function onunrender(){if(this.watchers&&typeof this.watchers.cancel==="function")this.watchers.cancel()},activated:function activated(){},data:function data(){return{dialog:false,_wnd_rendered:false,blocked:false,resizable:true,geometry:{top:-9999,left:-9999,width:200,height:200,state:0,dwunit:"px",dhunit:"px",index:1e3,minimum:{x:0,y:0,width:70,height:50}},style:{},"class":{},makePartial:function makePartial(key,template){if(!this._makePartial_templates)this._makePartial_templates={};if(this._makePartial_templates[key]!=template){this.resetPartial(key,template);this._makePartial_templates[key]=template}return key}}},partials:{title:"{{> ~/makePartial('titleTpl', .title) }}",body:"",foot:"",buttons:"{{#.buttons:i}}<button on-click='_dialog-button' class='{{.position || ''}}{{#.buttonClass}} {{.buttonClass}}{{/}}{{#../../class.button}} {{../../class.button}}{{/}}' disabled='{{!.enabled}}'>{{> ~/makePartial('button' + i + 'Tpl', .label) }}</button>{{/}}",controls:"{{#controls:i}}"+"	{{#if .raw}}{{>  ~/makePartial('custom_control_template'+i, .raw) }}{{/if}}"+"{{/controls}}"+"{{#if minimizable === false}}{{else}}{{>minimizeControl}}{{/if}}"+"{{>restoreControl}}{{>closeControl}}",minimizeControl:"<button on-click='_minimize' class='btn btn-sm rw-minimize'><i class='zmdi zmdi-window-minimize'></button>",restoreControl:"<button on-click='_restore'  class='btn btn-sm rw-restore'><i class='zmdi zmdi-window-restore'></button>",closeControl:"<button on-click='_close'    class='btn btn-sm rw-close'><i class='zmdi zmdi-close'></i></button>"},rerender:function(){var wnd=this;if(!wnd.get("_wnd_rendered"))return Promise.resolve("ok");wnd.set("_wnd_rendered",false);return this.set("_wnd_rendered",true)},title:function(str){this.set("title",str)},move:function(x,y){if(typeof x==="string"){switch(x){case"center":case"centerScreen":return this.set({"geometry.top":(this.parent.el.clientHeight-this.element.clientHeight)/2,"geometry.left":(this.parent.el.clientWidth-this.element.clientWidth)/2});case"cascade":return this.set({"geometry.top":this.parentNumber%10*20+10,"geometry.left":this.parentNumber%50*20+10})}return Promise.resolve(false)}y=+y;x=+x;var min=this.get("geometry.minimum");var max=this.get("geometry.maximum");var w=+this.get("geometry.width");var h=+this.get("geometry.height");if(!!max){if(x+w>+max.x)x=+max.x-x;if(y+h>+max.y)y=+max.y-y}if(!!min){if(x<+min.x)x=+min.x;if(y<+min.y)y=+min.y}return this.set({"geometry.top":y,"geometry.left":x})},resize:function(w,h){w=getDimPx.call(this,"width",w);h=getDimPx.call(this,"height",h);var min=this.get("geometry.minimum");var max=this.get("geometry.maximum");if(!!max){if(w>max.width)w=max.width;if(w>max.height)w=max.height}if(!!min){if(w<min.width)w=min.width;if(h<min.height)h=min.height}this.set({"geometry.width":w,"geometry.height":h});$("iframe",this.element).focus()},resizable:function(b){this.set("resizable",b)},minimize:function(){var wnd=this;if(wnd.get("geometry.state")!==1){wnd.set({hidden:true,"geometry.state":1});wnd.fire("minimized",{window:wnd})}},maximize:function(){var wnd=this;if(wnd.get("geometry.state")!==2){wnd.normalGeometry={top:wnd.get("geometry.top"),left:wnd.get("geometry.left"),width:wnd.get("geometry.width"),height:wnd.get("geometry.height")};wnd.set({hidden:false,"geometry.left":0,"geometry.top":0,"geometry.width":100,"geometry.height":100,"geometry.dwunit":"%","geometry.dhunit":"%","geometry.state":2});wnd.fire("maximized",{window:wnd})}},restore:function(){var wnd=this;switch(wnd.get("geometry.state")){case 1:wnd.set({hidden:false,"geometry.state":0});break;case 2:var g=wnd.normalGeometry||{};wnd.normalGeometry=null;if(g.top<0||g.left<0){g.top=0;g.left=0}wnd.set({hidden:false,"geometry.left":g.left,"geometry.top":g.top,"geometry.width":g.width,"geometry.height":g.height,"geometry.dwunit":"px","geometry.dhunit":"px","geometry.state":0});break;default:break}this.raise()},raise:function(){if(!!this.parent)this.parent.raiseWindow(this)},kill:function(){var wnd=this;this.fire("close",this);if(!!wnd.parent){wnd.parent.killWindow(wnd)}else{wnd.teardown()}if(!!wnd.completeAfterClose)wnd.completeAfterClose(wnd.result)},content:function(ct){return this.resetPartial("body",ct)},buttons:function(){var arr=[],i;this.set("buttons",arr);if(arguments.length===1&&typeof arguments[0].length==="number"){arr=arguments[0]}else{for(i=0;i<arguments.length;i++){arr.push(arguments[i])}}var left=[],right=[],middle=[];for(i=0;i<arr.length;i++){var b=arr[i];if(!!b.position){if(b.position==="left")left.push(b);else if(b.position==="right")right.push(b);else if(b.position==="middle")middle.push(b);else if(b.position==="center")middle.push(b);else{right.push(b);b.position="right"}}else{right.push(b);b.position="right"}if(!b.hasOwnProperty("enabled"))b.enabled=true}arr=[];for(i=0;i<left.length;i++)arr.push(left[i]);for(i=right.length-1;i>=0;i--)arr.push(right[i]);for(i=0;i<middle.length;i++)arr.push(middle[i]);this.set("buttons",arr)},button:function(name,cb){var arr=this.get("buttons");var btn,i;if(typeof name==="number"){btn=arr[name];i=name}else for(i=0;i<arr.length;i++){if(arr[i].label===name){btn=arr[i];break}}if(!!btn){cb(btn);this.set("buttons."+i,btn)}},controls:function(){var arr=[],i,str="";if(arguments.length===1&&typeof arguments[0]!=="string")arr=arguments[0];else{for(i=0;i<arguments.length;i++)arr.push(arguments[i])}for(i=0;i<arr.length;i++)str+="{{>"+arr[i]+"Control}}";this.partials.controls=str;return this.rerender()},onClose:function(){this.kill()},close:function(fn){if(!!!fn)fn=this.onClose;if(fn.length===0)fn.call(this);else{var wnd=this;fn.call(this,function(close){if(close)wnd.kill()})}}});var cssUnit=/([\d\.]+)(.*)/;function getDimPx(dim,length){var _cssUnit$exec=cssUnit.exec(length.toString());var _cssUnit$exec2=_slicedToArray(_cssUnit$exec,3);var whole=_cssUnit$exec2[0];var size=_cssUnit$exec2[1];var unit=_cssUnit$exec2[2];unit=unit||"px";var dunit=dim==="width"?"dwunit":"dhunit";var div=this.find("div");if(unit==="px"){return size}else if(div){var toSet={};toSet["geometry."+dim]=size;toSet["geometry."+dunit]=unit;this.set(toSet);var v=this.find("div")["client"+dim[0].toUpperCase()+dim.substring(1)];toSet["geometry."+dim]=v;toSet["geometry."+dunit]="px";this.set(toSet);return v}}var messageButtons={ok:{label:"OK",action:function(){this.result="ok";this.close()},position:"middle"},cancel:{label:"Cancel",action:function(){this.result="cancel";this.close()},position:"middle"},yes:{label:"Yes",action:function(){this.result="yes";this.close()},position:"middle"},no:{label:"No",action:function(){this.result="no";this.close()},position:"middle"}};var WindowHost;WindowHost=function(){var counter=0;function newWindow(e,cb){var current=counter;counter+=1;var host=this;return host.push("windowSlots",current).then(function(){var pr;var wnds=host.findAllComponents("Window");var wnd=wnds[wnds.length-1];host.set("windows."+current,wnd);wnd.parentNumber=current;wnd.set({"geometry.index":1e3+wnds.length,"geometry.left":-9999,"geometry.top":-9999,id:current});var step1=function(){var mpr;if(!!cb&&typeof cb==="function"){try{mpr=cb(wnd);if(!!mpr&&typeof mpr.then==="function")return mpr}catch(e1){console.log(e1)}}else if(typeof e==="function"){try{mpr=e(wnd);if(!!mpr&&typeof mpr.then==="function")pr=mpr}catch(e2){console.log(e2)}}};pr=step1();var step2=function(){var mpr;wnd.raise();return wnd.set("_wnd_rendered",true).then(function(){wnd.element=wnd.find(".ractive-window");try{mpr=wnd.activated();if(!!mpr&&typeof mpr.then==="function")return mpr}catch(e4){console.log(e4)}})};if(!!pr)pr=pr.then(step2);else pr=step2();var step3=function(){var mpr;if(wnd.get("geometry.left")===-9999){return wnd.move("cascade").then(function(){return wnd})}return wnd};if(!!pr)pr=pr.then(step3);else pr=step3();return pr})}function messageBox(opts){var args=arguments;var host=this;return new Promise(function(y){host.newWindow(function(w){var message;if(args.length>=2){message=args[0];opts=args[1]}else if(args.length===1&&typeof args[0]==="string"){message=args[0];opts={}}w.set("title",opts.title||"Message");w.set("resizable",false);w.controls("close");w.content(message);var btns=opts.buttons||["ok"],out=[];for(var i=0;i<btns.length;i++)if(messageButtons.hasOwnProperty(btns[i]))out.push(messageButtons[btns[i]]);w.buttons(out);w.onClose=function(){this.kill();y(w.result||"none")};if(!opts.hasOwnProperty("modal")||opts.modal)host.set("globalBlock",w);w.activated=function(){w.move("center")}})})}return Ractive.extend({isolated:true,defaults:{control:{label:function label(control,lbl){Window.partials[control+"ControlLabel"]=lbl}},controls:function(){var partial="";for(var i=0;i<arguments.length;i++){partial+="{{>"+arguments[i]+"Control}}"}Window.partials.controls=partial}},components:{Window:Window},data:{windowSlots:[],windows:{},blocks:{},globalBlock:null},computed:{blocked:function(){return!!this.get("globalBlock")}},template:"<div class='ractive-window-host-modal' style='{{^blocked}}display: none;{{/blocked}}'></div><div class='host-content'>{{yield}}</div>{{#windowSlots}}<Window/>{{/windowSlots}}",newWindow:newWindow,killWindow:function(wnd){var blocks=this.get("blocks");var wnds=this.get("windows");var topWnd,topIdx=-1,i;if(!!wnds){for(var w in wnds){if(wnds[w]===wnd)delete wnds[w];else{i=wnds[w].get("geometry.index");if(i>topIdx){topIdx=i;topWnd=wnds[w]}}}if(topWnd&&!topWnd.get("topmost")){topWnd.set("topmost",true);$("iframe",topWnd.element).focus()}}var slots=this.get("windowSlots");if(!!slots){this.splice("windowSlots",slots.indexOf(wnd.parentNumber),1)}for(i in blocks){var arr=blocks[i];if(!!arr&&Array.isArray(arr)&&arr.indexOf(wnd.parentNumber)>=0)arr.splice(arr.indexOf(wnd.parentNumber),1)}if(wnd===this.get("globalBlock"))this.set("globalBlock",null);this.unblockUnblockedWindows()},raiseWindow:function(wnd){var wndso=this.get("windows");var slots=this.get("windowSlots");var blocks=this.get("blocks");var wnds=[];var target=this.topLevelBlockers(wnd);target.push(wnd);for(var k in wndso)if(target.indexOf(wndso[k])<0)wnds.push(wndso[k]);wnds.sort(function(a,b){var ai=a.get("geometry.index"),bi=b.get("geometry.index");if(ai<bi)return-1;else if(ai>bi)return 1;else return 0});if(!!wnd)wnds=wnds.concat(target);function moveBeforeBlocker(wnd,blockers){for(var i in blockers){var bl=wndso[blockers[i]];var wi=wnds.indexOf(wnd),bi=wnds.indexOf(bl);if(!!!bl||wi<0||bi<0)continue;var arr=blocks[bl.parentNumber];if(!!!arr&&Array.isArray(arr)&&arr.length>0)moveBeforeBlocker(bl,arr);if(wi>bi){wnds.splice(wi,1);wnds.splice(bi,0,wnd)}}}var i;for(i in slots){var arr=blocks[slots[i]];if(!!arr&&Array.isArray(arr)&&arr.length>0)moveBeforeBlocker(wndso[slots[i]],arr)}for(i in wnds){wnds[i].set("geometry.index",1e3+ +i);if(wnds[i]!==wnd){wnds[i].set("topmost",false)}}if(!wnd.get("topmost")){wnd.set("topmost",true);$("iframe",wnd.element).focus()}function globalBlocks(wnd){var res=[];if(!!!wnd){return res}var arr=blocks[wnd.parentNumber];if(!!arr&&Array.isArray(arr)&&arr.length>0){for(var i in arr){res=res.concat(globalBlocks(wndso[arr[i]]))}}res.push(wnd);return res}var globals=globalBlocks(this.get("globalBlock"));for(i in globals)globals[i].add("geometry.index",1e4)},topLevelBlockers:function(wnd){if(!!!wnd)return[];var blocks=this.get("blocks");var wndso=this.get("windows");var arr=blocks[wnd.parentNumber];var res=[];if(!!!arr||!Array.isArray(arr)||arr.length===0)return res;for(var i in arr){var arr2=blocks[arr[i]];if(!!!arr2||!Array.isArray(arr2)||arr2.length===0)res.push(wndso[arr[i]]);else{res=res.concat(this.topLevelBlockers(wndso[arr[i]]))}}return res},blockWindow:function(target,blocker){if(!!!target||!!!blocker)return;var blocks=this.get("blocks");var arr=blocks[target.parentNumber];if(!!!arr||!Array.isArray(arr))arr=[];if(arr.indexOf(blocker.parentNumber)<0)arr.push(blocker.parentNumber);blocks[target.parentNumber]=arr;for(var i=2;i<arguments.length;i++){if(arr.indexOf(arguments[i].parentNumber)<0)arr.push(arguments[i].parentNumber)}if(arr.length>0)target.set("blocked",true);this.raiseWindow()},unblockWindow:function(target,blocker){if(!!!target|!!!blocker)return;var blocks=this.get("blocks");var arr=blocks[target.parentNumber];if(!!!arr||!Array.isArray(arr))return;if(arr.indexOf(blocker.parentNumber)>=0)arr.splice(arr.indexOf(blocker.parentNumber),1);for(var i=2;i<arguments.length;i++){if(arr.indexOf(arguments[i].parentNumber)>=0)arr.splice(arr.indexOf(arguments[i].parentNumber),1)}if(arr.length===0)target.set("blocked",false);this.raiseWindow()},unblockUnblockedWindows:function(){var blocks=this.get("blocks");var wndso=this.get("windows");for(var i in blocks){var arr=blocks[i];if(!!!arr||!Array.isArray(arr)||arr.length===0){var wnd=wndso[i];if(!!wnd)wnd.set("blocked",false)}}},messageBox:messageBox})}();var Host=WindowHost;var res={Window:Window,WindowHost:Host};var index=res;exports["default"]=index});



/*
	<script src="https://raw.githubusercontent.com/ractivejs/ractive-events-mousewheel/master/ractive-events-mousewheel.js"></script>
	ractive-events-mousewheel
	=========================

	Version 0.1.1.

	Dealing with mousewheel events in browsers is an epic pain. The
	official DOM wheel event is badly designed enough that Chrome,
	Opera and Safari have so far refused to implement it, which isn't
	to say that the non-standard mousewheel event (or the DOMMouseScroll
	and MozMousePixelScroll events &ndash; yes, really) is a whole lot
	better. It's a total mess.

	The mousewheel event plugin is a (work-in-progress!) attempt to
	smooth over differences between browsers and operating systems, and
	provide you with the only bit of information you actually care about
	in 99% of cases: how many pixels of scroll the mousewheel event is
	equivalent to.

	Be aware that intercepting mousewheel events rather than using native
	scroll is often a bad idea &ndash; it doesn't perform as well in all
	cases, and doesn't work with mobile devices.

	Thanks to https://github.com/brandonaaron/jquery-mousewheel for
	figuring out a lot of this stuff.

	==========================

	Troubleshooting: If you're using a module system in your app (AMD or
	something more nodey) then you may need to change the paths below,
	where it says `require( 'ractive' )` or `define([ 'ractive' ]...)`.

	==========================

	Usage: Include this file on your page below Ractive, e.g:

	    <script src='lib/ractive.js'></script>
	    <script src='lib/ractive-events-mousewheel.js'></script>

	Or, if you're using a module loader, require this module:

	    // requiring the plugin will 'activate' it - no need to use
	    // the return value
	    require( 'ractive-events-mousewheel' );

	Add a mousewheel event in the normal fashion:

	    <div on-mousewheel='scroll'>scroll here</div>

	Then add a handler:

	    ractive.on( 'scroll', function ( event ) {
	      alert( event.dx, event.dy ); // dx and dy - pixel scroll equivalent values
	    });

*/

;(function ( global, factory ) {

	'use strict';

	// Common JS (i.e. browserify) environment
	if ( typeof module !== 'undefined' && module.exports && typeof require === 'function' ) {
		factory( require( 'ractive' ) );
	}

	// AMD?
	else if ( typeof define === 'function' && define.amd ) {
		define([ 'ractive' ], factory );
	}

	// browser global
	else if ( global.Ractive ) {
		factory( global.Ractive );
	}

	else {
		throw new Error( 'Could not find Ractive! It must be loaded before the ractive-events-mousewheel plugin' );
	}

}( typeof window !== 'undefined' ? window : this, function ( Ractive ) {

	'use strict';

	var mousewheel, events;

	if ( typeof document === 'undefined' ) {
		return;
	}

	// Modern Firefox, or IE9+
	if ( 'onwheel' in document || document.documentMode >= 9 ) {


		mousewheel = function ( node, fire ) {
			var handler = function ( event ) {
				var pixelScale = 1;

				if ( event.deltaMode === event.DOM_DELTA_LINE ) {
					pixelScale = 40;
				}

				fire({
					node: this,
					original: event,
					dx: event.deltaX * -pixelScale,
					dy: event.deltaY * -pixelScale
				});
			};

			node.addEventListener( 'wheel', handler, false );

			return {
				teardown: function () {
					node.removeEventListener( 'wheel', handler, false );
				}
			};
		};
	}

	//
	else {
		events = [ 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll' ];

		mousewheel = function ( node, fire ) {
			var i, handler = function ( event ) {
				var delta, deltaX, deltaY;

				delta = deltaX = deltaY = 0;

				// Old school scrollwheel delta
				if ( event.wheelDelta ) { delta = event.wheelDelta; }
				if ( event.detail )	 { delta = event.detail * -1; }

				// At a minimum, setup the deltaY to be delta
				deltaY = delta;

				// Firefox < 17 related to DOMMouseScroll event
				if ( event.axis !== undefined && event.axis === event.HORIZONTAL_AXIS ) {
					deltaY = 0;
					deltaX = delta * -1;
				}

				// Webkit
				if ( event.wheelDeltaY !== undefined ) { deltaY = event.wheelDeltaY / 3; }
				if ( event.wheelDeltaX !== undefined ) { deltaX = event.wheelDeltaX / 3; }

				fire({
					node: this,
					original: event,
					dx: deltaX,
					dy: deltaY
				});
			};

			i = events.length;
			while ( i-- ) {
				node.addEventListener( events[i], handler, false );
			}

			return {
				teardown: function () {
					var i = events.length;
					while ( i-- ) {
						node.removeEventListener( events[i], handler, false );
					}
				}
			};
		};
	}

	Ractive.events.mousewheel = mousewheel;

}));



Ractive.components.scrollarea = Ractive.extend({
	isolated: true,
	template: "\
		<div class='viewport {{class}}' style='position: relative;overflow: hidden;{{style}}' on-mousewheel='scroll'>\
				<div class='viewport-inner' style='position: relative;white-space: nowrap;top: {{top}}px; left: {{left}}px;'>\
					{{ yield }}\
				</div>\
				<span style='display: inline-block;' class='{{scrollbar_class}}' style='height: {{scrollbar.height}}%; top: {{scrollbar.top}}%'></span>\
			</div>",

	scroll: function(v) {
		this.fire('scroll', { dx: 0, dy: v })
	},
	update_scroll: function(event) {

		if (!event)
			event = { dx: 0, dy: 0 }



		var outer = this.find( '.viewport' ).getBoundingClientRect();
		var inner = this.find( '.viewport-inner' ).getBoundingClientRect();

		if (inner.height < outer.height) {
			this.set('scrollbar.height', 0)

			// bugfix: when area shrinks and scrollbar no longer needed, reset scroll to top
			this.set('scrollbar.top', 0 )
			this.set('top', 0 )
			//this.reset()
			return false;
		}

		//var minLeft = outer.width - inner.width;
		var minTop = outer.height - inner.height;


		//var left = Math.max( minLeft, Math.min( 0, this.get( 'left' ) + event.dx ) )
		var top = Math.max( minTop, Math.min( 0, this.get( 'top' ) + event.dy ) )
		var scrollbar_height = ( outer.height * 100 ) / inner.height;
		var scrollbar_remaining_100percent = 100 - scrollbar_height;
		var scroll_percent = Math.abs(Math.round(top*100/minTop))

		this.set('scrollbar.top', (scroll_percent * scrollbar_remaining_100percent)/100  )
		this.set('scrollbar.height', scrollbar_height )
		this.set({
			//left: left,
			top: top
		});
	},
	onrender: function () {

		var ractive = this
		this.observer = new MutationObserver(function() {ractive.update_scroll()})
		this.observer.observe(this.find('.viewport-inner'), {childList: true,subtree: true,characterData: true,attributes: false,})

		this.on( 'scroll', function ( event ) {

			if (event.original)
				event.original.preventDefault(); // prevent entire page from scrolling

			this.update_scroll(event)

		})
		this.update_scroll()
	},
	data: {
		left: 0,
		top: 0
	}
})

;(function(){function o(n){var i=e;n&&(e[n]||(e[n]={}),i=e[n]);if(!i.define||!i.define.packaged)t.original=i.define,i.define=t,i.define.packaged=!0;if(!i.require||!i.require.packaged)r.original=i.require,i.require=r,i.require.packaged=!0}var ACE_NAMESPACE="",e=function(){return this}();!e&&typeof window!="undefined"&&(e=window);if(!ACE_NAMESPACE&&typeof requirejs!="undefined")return;var t=function(e,n,r){if(typeof e!="string"){t.original?t.original.apply(this,arguments):(console.error("dropping module because define wasn't a string."),console.trace());return}arguments.length==2&&(r=n),t.modules[e]||(t.payloads[e]=r,t.modules[e]=null)};t.modules={},t.payloads={};var n=function(e,t,n){if(typeof t=="string"){var i=s(e,t);if(i!=undefined)return n&&n(),i}else if(Object.prototype.toString.call(t)==="[object Array]"){var o=[];for(var u=0,a=t.length;u<a;++u){var f=s(e,t[u]);if(f==undefined&&r.original)return;o.push(f)}return n&&n.apply(null,o)||!0}},r=function(e,t){var i=n("",e,t);return i==undefined&&r.original?r.original.apply(this,arguments):i},i=function(e,t){if(t.indexOf("!")!==-1){var n=t.split("!");return i(e,n[0])+"!"+i(e,n[1])}if(t.charAt(0)=="."){var r=e.split("/").slice(0,-1).join("/");t=r+"/"+t;while(t.indexOf(".")!==-1&&s!=t){var s=t;t=t.replace(/\/\.\//,"/").replace(/[^\/]+\/\.\.\//,"")}}return t},s=function(e,r){r=i(e,r);var s=t.modules[r];if(!s){s=t.payloads[r];if(typeof s=="function"){var o={},u={id:r,uri:"",exports:o,packaged:!0},a=function(e,t){return n(r,e,t)},f=s(a,o,u);o=f||u.exports,t.modules[r]=o,delete t.payloads[r]}s=t.modules[r]=o||s}return s};o(ACE_NAMESPACE)})(),define("ace/lib/regexp",["require","exports","module"],function(e,t,n){"use strict";function o(e){return(e.global?"g":"")+(e.ignoreCase?"i":"")+(e.multiline?"m":"")+(e.extended?"x":"")+(e.sticky?"y":"")}function u(e,t,n){if(Array.prototype.indexOf)return e.indexOf(t,n);for(var r=n||0;r<e.length;r++)if(e[r]===t)return r;return-1}var r={exec:RegExp.prototype.exec,test:RegExp.prototype.test,match:String.prototype.match,replace:String.prototype.replace,split:String.prototype.split},i=r.exec.call(/()??/,"")[1]===undefined,s=function(){var e=/^/g;return r.test.call(e,""),!e.lastIndex}();if(s&&i)return;RegExp.prototype.exec=function(e){var t=r.exec.apply(this,arguments),n,a;if(typeof e=="string"&&t){!i&&t.length>1&&u(t,"")>-1&&(a=RegExp(this.source,r.replace.call(o(this),"g","")),r.replace.call(e.slice(t.index),a,function(){for(var e=1;e<arguments.length-2;e++)arguments[e]===undefined&&(t[e]=undefined)}));if(this._xregexp&&this._xregexp.captureNames)for(var f=1;f<t.length;f++)n=this._xregexp.captureNames[f-1],n&&(t[n]=t[f]);!s&&this.global&&!t[0].length&&this.lastIndex>t.index&&this.lastIndex--}return t},s||(RegExp.prototype.test=function(e){var t=r.exec.call(this,e);return t&&this.global&&!t[0].length&&this.lastIndex>t.index&&this.lastIndex--,!!t})}),define("ace/lib/es5-shim",["require","exports","module"],function(e,t,n){function r(){}function w(e){try{return Object.defineProperty(e,"sentinel",{}),"sentinel"in e}catch(t){}}function H(e){return e=+e,e!==e?e=0:e!==0&&e!==1/0&&e!==-1/0&&(e=(e>0||-1)*Math.floor(Math.abs(e))),e}function B(e){var t=typeof e;return e===null||t==="undefined"||t==="boolean"||t==="number"||t==="string"}function j(e){var t,n,r;if(B(e))return e;n=e.valueOf;if(typeof n=="function"){t=n.call(e);if(B(t))return t}r=e.toString;if(typeof r=="function"){t=r.call(e);if(B(t))return t}throw new TypeError}Function.prototype.bind||(Function.prototype.bind=function(t){var n=this;if(typeof n!="function")throw new TypeError("Function.prototype.bind called on incompatible "+n);var i=u.call(arguments,1),s=function(){if(this instanceof s){var e=n.apply(this,i.concat(u.call(arguments)));return Object(e)===e?e:this}return n.apply(t,i.concat(u.call(arguments)))};return n.prototype&&(r.prototype=n.prototype,s.prototype=new r,r.prototype=null),s});var i=Function.prototype.call,s=Array.prototype,o=Object.prototype,u=s.slice,a=i.bind(o.toString),f=i.bind(o.hasOwnProperty),l,c,h,p,d;if(d=f(o,"__defineGetter__"))l=i.bind(o.__defineGetter__),c=i.bind(o.__defineSetter__),h=i.bind(o.__lookupGetter__),p=i.bind(o.__lookupSetter__);if([1,2].splice(0).length!=2)if(!function(){function e(e){var t=new Array(e+2);return t[0]=t[1]=0,t}var t=[],n;t.splice.apply(t,e(20)),t.splice.apply(t,e(26)),n=t.length,t.splice(5,0,"XXX"),n+1==t.length;if(n+1==t.length)return!0}())Array.prototype.splice=function(e,t){var n=this.length;e>0?e>n&&(e=n):e==void 0?e=0:e<0&&(e=Math.max(n+e,0)),e+t<n||(t=n-e);var r=this.slice(e,e+t),i=u.call(arguments,2),s=i.length;if(e===n)s&&this.push.apply(this,i);else{var o=Math.min(t,n-e),a=e+o,f=a+s-o,l=n-a,c=n-o;if(f<a)for(var h=0;h<l;++h)this[f+h]=this[a+h];else if(f>a)for(h=l;h--;)this[f+h]=this[a+h];if(s&&e===c)this.length=c,this.push.apply(this,i);else{this.length=c+s;for(h=0;h<s;++h)this[e+h]=i[h]}}return r};else{var v=Array.prototype.splice;Array.prototype.splice=function(e,t){return arguments.length?v.apply(this,[e===void 0?0:e,t===void 0?this.length-e:t].concat(u.call(arguments,2))):[]}}Array.isArray||(Array.isArray=function(t){return a(t)=="[object Array]"});var m=Object("a"),g=m[0]!="a"||!(0 in m);Array.prototype.forEach||(Array.prototype.forEach=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=arguments[1],s=-1,o=r.length>>>0;if(a(t)!="[object Function]")throw new TypeError;while(++s<o)s in r&&t.call(i,r[s],s,n)}),Array.prototype.map||(Array.prototype.map=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0,s=Array(i),o=arguments[1];if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");for(var u=0;u<i;u++)u in r&&(s[u]=t.call(o,r[u],u,n));return s}),Array.prototype.filter||(Array.prototype.filter=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0,s=[],o,u=arguments[1];if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");for(var f=0;f<i;f++)f in r&&(o=r[f],t.call(u,o,f,n)&&s.push(o));return s}),Array.prototype.every||(Array.prototype.every=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0,s=arguments[1];if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");for(var o=0;o<i;o++)if(o in r&&!t.call(s,r[o],o,n))return!1;return!0}),Array.prototype.some||(Array.prototype.some=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0,s=arguments[1];if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");for(var o=0;o<i;o++)if(o in r&&t.call(s,r[o],o,n))return!0;return!1}),Array.prototype.reduce||(Array.prototype.reduce=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0;if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");if(!i&&arguments.length==1)throw new TypeError("reduce of empty array with no initial value");var s=0,o;if(arguments.length>=2)o=arguments[1];else do{if(s in r){o=r[s++];break}if(++s>=i)throw new TypeError("reduce of empty array with no initial value")}while(!0);for(;s<i;s++)s in r&&(o=t.call(void 0,o,r[s],s,n));return o}),Array.prototype.reduceRight||(Array.prototype.reduceRight=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0;if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");if(!i&&arguments.length==1)throw new TypeError("reduceRight of empty array with no initial value");var s,o=i-1;if(arguments.length>=2)s=arguments[1];else do{if(o in r){s=r[o--];break}if(--o<0)throw new TypeError("reduceRight of empty array with no initial value")}while(!0);do o in this&&(s=t.call(void 0,s,r[o],o,n));while(o--);return s});if(!Array.prototype.indexOf||[0,1].indexOf(1,2)!=-1)Array.prototype.indexOf=function(t){var n=g&&a(this)=="[object String]"?this.split(""):F(this),r=n.length>>>0;if(!r)return-1;var i=0;arguments.length>1&&(i=H(arguments[1])),i=i>=0?i:Math.max(0,r+i);for(;i<r;i++)if(i in n&&n[i]===t)return i;return-1};if(!Array.prototype.lastIndexOf||[0,1].lastIndexOf(0,-3)!=-1)Array.prototype.lastIndexOf=function(t){var n=g&&a(this)=="[object String]"?this.split(""):F(this),r=n.length>>>0;if(!r)return-1;var i=r-1;arguments.length>1&&(i=Math.min(i,H(arguments[1]))),i=i>=0?i:r-Math.abs(i);for(;i>=0;i--)if(i in n&&t===n[i])return i;return-1};Object.getPrototypeOf||(Object.getPrototypeOf=function(t){return t.__proto__||(t.constructor?t.constructor.prototype:o)});if(!Object.getOwnPropertyDescriptor){var y="Object.getOwnPropertyDescriptor called on a non-object: ";Object.getOwnPropertyDescriptor=function(t,n){if(typeof t!="object"&&typeof t!="function"||t===null)throw new TypeError(y+t);if(!f(t,n))return;var r,i,s;r={enumerable:!0,configurable:!0};if(d){var u=t.__proto__;t.__proto__=o;var i=h(t,n),s=p(t,n);t.__proto__=u;if(i||s)return i&&(r.get=i),s&&(r.set=s),r}return r.value=t[n],r}}Object.getOwnPropertyNames||(Object.getOwnPropertyNames=function(t){return Object.keys(t)});if(!Object.create){var b;Object.prototype.__proto__===null?b=function(){return{__proto__:null}}:b=function(){var e={};for(var t in e)e[t]=null;return e.constructor=e.hasOwnProperty=e.propertyIsEnumerable=e.isPrototypeOf=e.toLocaleString=e.toString=e.valueOf=e.__proto__=null,e},Object.create=function(t,n){var r;if(t===null)r=b();else{if(typeof t!="object")throw new TypeError("typeof prototype["+typeof t+"] != 'object'");var i=function(){};i.prototype=t,r=new i,r.__proto__=t}return n!==void 0&&Object.defineProperties(r,n),r}}if(Object.defineProperty){var E=w({}),S=typeof document=="undefined"||w(document.createElement("div"));if(!E||!S)var x=Object.defineProperty}if(!Object.defineProperty||x){var T="Property description must be an object: ",N="Object.defineProperty called on non-object: ",C="getters & setters can not be defined on this javascript engine";Object.defineProperty=function(t,n,r){if(typeof t!="object"&&typeof t!="function"||t===null)throw new TypeError(N+t);if(typeof r!="object"&&typeof r!="function"||r===null)throw new TypeError(T+r);if(x)try{return x.call(Object,t,n,r)}catch(i){}if(f(r,"value"))if(d&&(h(t,n)||p(t,n))){var s=t.__proto__;t.__proto__=o,delete t[n],t[n]=r.value,t.__proto__=s}else t[n]=r.value;else{if(!d)throw new TypeError(C);f(r,"get")&&l(t,n,r.get),f(r,"set")&&c(t,n,r.set)}return t}}Object.defineProperties||(Object.defineProperties=function(t,n){for(var r in n)f(n,r)&&Object.defineProperty(t,r,n[r]);return t}),Object.seal||(Object.seal=function(t){return t}),Object.freeze||(Object.freeze=function(t){return t});try{Object.freeze(function(){})}catch(k){Object.freeze=function(t){return function(n){return typeof n=="function"?n:t(n)}}(Object.freeze)}Object.preventExtensions||(Object.preventExtensions=function(t){return t}),Object.isSealed||(Object.isSealed=function(t){return!1}),Object.isFrozen||(Object.isFrozen=function(t){return!1}),Object.isExtensible||(Object.isExtensible=function(t){if(Object(t)===t)throw new TypeError;var n="";while(f(t,n))n+="?";t[n]=!0;var r=f(t,n);return delete t[n],r});if(!Object.keys){var L=!0,A=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],O=A.length;for(var M in{toString:null})L=!1;Object.keys=function I(e){if(typeof e!="object"&&typeof e!="function"||e===null)throw new TypeError("Object.keys called on a non-object");var I=[];for(var t in e)f(e,t)&&I.push(t);if(L)for(var n=0,r=O;n<r;n++){var i=A[n];f(e,i)&&I.push(i)}return I}}Date.now||(Date.now=function(){return(new Date).getTime()});var _="	\n\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\ufeff";if(!String.prototype.trim||_.trim()){_="["+_+"]";var D=new RegExp("^"+_+_+"*"),P=new RegExp(_+_+"*$");String.prototype.trim=function(){return String(this).replace(D,"").replace(P,"")}}var F=function(e){if(e==null)throw new TypeError("can't convert "+e+" to object");return Object(e)}}),define("ace/lib/fixoldbrowsers",["require","exports","module","ace/lib/regexp","ace/lib/es5-shim"],function(e,t,n){"use strict";e("./regexp"),e("./es5-shim")}),define("ace/lib/dom",["require","exports","module"],function(e,t,n){"use strict";var r="http://www.w3.org/1999/xhtml";t.getDocumentHead=function(e){return e||(e=document),e.head||e.getElementsByTagName("head")[0]||e.documentElement},t.createElement=function(e,t){return document.createElementNS?document.createElementNS(t||r,e):document.createElement(e)},t.hasCssClass=function(e,t){var n=(e.className+"").split(/\s+/g);return n.indexOf(t)!==-1},t.addCssClass=function(e,n){t.hasCssClass(e,n)||(e.className+=" "+n)},t.removeCssClass=function(e,t){var n=e.className.split(/\s+/g);for(;;){var r=n.indexOf(t);if(r==-1)break;n.splice(r,1)}e.className=n.join(" ")},t.toggleCssClass=function(e,t){var n=e.className.split(/\s+/g),r=!0;for(;;){var i=n.indexOf(t);if(i==-1)break;r=!1,n.splice(i,1)}return r&&n.push(t),e.className=n.join(" "),r},t.setCssClass=function(e,n,r){r?t.addCssClass(e,n):t.removeCssClass(e,n)},t.hasCssString=function(e,t){var n=0,r;t=t||document;if(t.createStyleSheet&&(r=t.styleSheets)){while(n<r.length)if(r[n++].owningElement.id===e)return!0}else if(r=t.getElementsByTagName("style"))while(n<r.length)if(r[n++].id===e)return!0;return!1},t.importCssString=function(n,r,i){i=i||document;if(r&&t.hasCssString(r,i))return null;var s;r&&(n+="\n/*# sourceURL=ace/css/"+r+" */"),i.createStyleSheet?(s=i.createStyleSheet(),s.cssText=n,r&&(s.owningElement.id=r)):(s=t.createElement("style"),s.appendChild(i.createTextNode(n)),r&&(s.id=r),t.getDocumentHead(i).appendChild(s))},t.importCssStylsheet=function(e,n){if(n.createStyleSheet)n.createStyleSheet(e);else{var r=t.createElement("link");r.rel="stylesheet",r.href=e,t.getDocumentHead(n).appendChild(r)}},t.getInnerWidth=function(e){return parseInt(t.computedStyle(e,"paddingLeft"),10)+parseInt(t.computedStyle(e,"paddingRight"),10)+e.clientWidth},t.getInnerHeight=function(e){return parseInt(t.computedStyle(e,"paddingTop"),10)+parseInt(t.computedStyle(e,"paddingBottom"),10)+e.clientHeight},t.scrollbarWidth=function(e){var n=t.createElement("ace_inner");n.style.width="100%",n.style.minWidth="0px",n.style.height="200px",n.style.display="block";var r=t.createElement("ace_outer"),i=r.style;i.position="absolute",i.left="-10000px",i.overflow="hidden",i.width="200px",i.minWidth="0px",i.height="150px",i.display="block",r.appendChild(n);var s=e.documentElement;s.appendChild(r);var o=n.offsetWidth;i.overflow="scroll";var u=n.offsetWidth;return o==u&&(u=r.clientWidth),s.removeChild(r),o-u};if(typeof document=="undefined"){t.importCssString=function(){};return}window.pageYOffset!==undefined?(t.getPageScrollTop=function(){return window.pageYOffset},t.getPageScrollLeft=function(){return window.pageXOffset}):(t.getPageScrollTop=function(){return document.body.scrollTop},t.getPageScrollLeft=function(){return document.body.scrollLeft}),window.getComputedStyle?t.computedStyle=function(e,t){return t?(window.getComputedStyle(e,"")||{})[t]||"":window.getComputedStyle(e,"")||{}}:t.computedStyle=function(e,t){return t?e.currentStyle[t]:e.currentStyle},t.setInnerHtml=function(e,t){var n=e.cloneNode(!1);return n.innerHTML=t,e.parentNode.replaceChild(n,e),n},"textContent"in document.documentElement?(t.setInnerText=function(e,t){e.textContent=t},t.getInnerText=function(e){return e.textContent}):(t.setInnerText=function(e,t){e.innerText=t},t.getInnerText=function(e){return e.innerText}),t.getParentWindow=function(e){return e.defaultView||e.parentWindow}}),define("ace/lib/oop",["require","exports","module"],function(e,t,n){"use strict";t.inherits=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})},t.mixin=function(e,t){for(var n in t)e[n]=t[n];return e},t.implement=function(e,n){t.mixin(e,n)}}),define("ace/lib/keys",["require","exports","module","ace/lib/fixoldbrowsers","ace/lib/oop"],function(e,t,n){"use strict";e("./fixoldbrowsers");var r=e("./oop"),i=function(){var e={MODIFIER_KEYS:{16:"Shift",17:"Ctrl",18:"Alt",224:"Meta"},KEY_MODS:{ctrl:1,alt:2,option:2,shift:4,"super":8,meta:8,command:8,cmd:8},FUNCTION_KEYS:{8:"Backspace",9:"Tab",13:"Return",19:"Pause",27:"Esc",32:"Space",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",44:"Print",45:"Insert",46:"Delete",96:"Numpad0",97:"Numpad1",98:"Numpad2",99:"Numpad3",100:"Numpad4",101:"Numpad5",102:"Numpad6",103:"Numpad7",104:"Numpad8",105:"Numpad9","-13":"NumpadEnter",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"Numlock",145:"Scrolllock"},PRINTABLE_KEYS:{32:" ",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",59:";",61:"=",65:"a",66:"b",67:"c",68:"d",69:"e",70:"f",71:"g",72:"h",73:"i",74:"j",75:"k",76:"l",77:"m",78:"n",79:"o",80:"p",81:"q",82:"r",83:"s",84:"t",85:"u",86:"v",87:"w",88:"x",89:"y",90:"z",107:"+",109:"-",110:".",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",111:"/",106:"*"}},t,n;for(n in e.FUNCTION_KEYS)t=e.FUNCTION_KEYS[n].toLowerCase(),e[t]=parseInt(n,10);for(n in e.PRINTABLE_KEYS)t=e.PRINTABLE_KEYS[n].toLowerCase(),e[t]=parseInt(n,10);return r.mixin(e,e.MODIFIER_KEYS),r.mixin(e,e.PRINTABLE_KEYS),r.mixin(e,e.FUNCTION_KEYS),e.enter=e["return"],e.escape=e.esc,e.del=e["delete"],e[173]="-",function(){var t=["cmd","ctrl","alt","shift"];for(var n=Math.pow(2,t.length);n--;)e.KEY_MODS[n]=t.filter(function(t){return n&e.KEY_MODS[t]}).join("-")+"-"}(),e.KEY_MODS[0]="",e.KEY_MODS[-1]="input-",e}();r.mixin(t,i),t.keyCodeToString=function(e){var t=i[e];return typeof t!="string"&&(t=String.fromCharCode(e)),t.toLowerCase()}}),define("ace/lib/useragent",["require","exports","module"],function(e,t,n){"use strict";t.OS={LINUX:"LINUX",MAC:"MAC",WINDOWS:"WINDOWS"},t.getOS=function(){return t.isMac?t.OS.MAC:t.isLinux?t.OS.LINUX:t.OS.WINDOWS};if(typeof navigator!="object")return;var r=(navigator.platform.match(/mac|win|linux/i)||["other"])[0].toLowerCase(),i=navigator.userAgent;t.isWin=r=="win",t.isMac=r=="mac",t.isLinux=r=="linux",t.isIE=navigator.appName=="Microsoft Internet Explorer"||navigator.appName.indexOf("MSAppHost")>=0?parseFloat((i.match(/(?:MSIE |Trident\/[0-9]+[\.0-9]+;.*rv:)([0-9]+[\.0-9]+)/)||[])[1]):parseFloat((i.match(/(?:Trident\/[0-9]+[\.0-9]+;.*rv:)([0-9]+[\.0-9]+)/)||[])[1]),t.isOldIE=t.isIE&&t.isIE<9,t.isGecko=t.isMozilla=(window.Controllers||window.controllers)&&window.navigator.product==="Gecko",t.isOldGecko=t.isGecko&&parseInt((i.match(/rv:(\d+)/)||[])[1],10)<4,t.isOpera=window.opera&&Object.prototype.toString.call(window.opera)=="[object Opera]",t.isWebKit=parseFloat(i.split("WebKit/")[1])||undefined,t.isChrome=parseFloat(i.split(" Chrome/")[1])||undefined,t.isAIR=i.indexOf("AdobeAIR")>=0,t.isIPad=i.indexOf("iPad")>=0,t.isChromeOS=i.indexOf(" CrOS ")>=0,t.isIOS=/iPad|iPhone|iPod/.test(i)&&!window.MSStream,t.isIOS&&(t.isMac=!0)}),define("ace/lib/event",["require","exports","module","ace/lib/keys","ace/lib/useragent"],function(e,t,n){"use strict";function a(e,t,n){var a=u(t);if(!i.isMac&&s){t.getModifierState&&(t.getModifierState("OS")||t.getModifierState("Win"))&&(a|=8);if(s.altGr){if((3&a)==3)return;s.altGr=0}if(n===18||n===17){var f="location"in t?t.location:t.keyLocation;if(n===17&&f===1)s[n]==1&&(o=t.timeStamp);else if(n===18&&a===3&&f===2){var l=t.timeStamp-o;l<50&&(s.altGr=!0)}}}n in r.MODIFIER_KEYS&&(n=-1),a&8&&n>=91&&n<=93&&(n=-1);if(!a&&n===13){var f="location"in t?t.location:t.keyLocation;if(f===3){e(t,a,-n);if(t.defaultPrevented)return}}if(i.isChromeOS&&a&8){e(t,a,n);if(t.defaultPrevented)return;a&=-9}return!!a||n in r.FUNCTION_KEYS||n in r.PRINTABLE_KEYS?e(t,a,n):!1}function f(){s=Object.create(null)}var r=e("./keys"),i=e("./useragent"),s=null,o=0;t.addListener=function(e,t,n){if(e.addEventListener)return e.addEventListener(t,n,!1);if(e.attachEvent){var r=function(){n.call(e,window.event)};n._wrapper=r,e.attachEvent("on"+t,r)}},t.removeListener=function(e,t,n){if(e.removeEventListener)return e.removeEventListener(t,n,!1);e.detachEvent&&e.detachEvent("on"+t,n._wrapper||n)},t.stopEvent=function(e){return t.stopPropagation(e),t.preventDefault(e),!1},t.stopPropagation=function(e){e.stopPropagation?e.stopPropagation():e.cancelBubble=!0},t.preventDefault=function(e){e.preventDefault?e.preventDefault():e.returnValue=!1},t.getButton=function(e){return e.type=="dblclick"?0:e.type=="contextmenu"||i.isMac&&e.ctrlKey&&!e.altKey&&!e.shiftKey?2:e.preventDefault?e.button:{1:0,2:2,4:1}[e.button]},t.capture=function(e,n,r){function i(e){n&&n(e),r&&r(e),t.removeListener(document,"mousemove",n,!0),t.removeListener(document,"mouseup",i,!0),t.removeListener(document,"dragstart",i,!0)}return t.addListener(document,"mousemove",n,!0),t.addListener(document,"mouseup",i,!0),t.addListener(document,"dragstart",i,!0),i},t.addTouchMoveListener=function(e,n){var r,i;t.addListener(e,"touchstart",function(e){var t=e.touches,n=t[0];r=n.clientX,i=n.clientY}),t.addListener(e,"touchmove",function(e){var t=e.touches;if(t.length>1)return;var s=t[0];e.wheelX=r-s.clientX,e.wheelY=i-s.clientY,r=s.clientX,i=s.clientY,n(e)})},t.addMouseWheelListener=function(e,n){"onmousewheel"in e?t.addListener(e,"mousewheel",function(e){var t=8;e.wheelDeltaX!==undefined?(e.wheelX=-e.wheelDeltaX/t,e.wheelY=-e.wheelDeltaY/t):(e.wheelX=0,e.wheelY=-e.wheelDelta/t),n(e)}):"onwheel"in e?t.addListener(e,"wheel",function(e){var t=.35;switch(e.deltaMode){case e.DOM_DELTA_PIXEL:e.wheelX=e.deltaX*t||0,e.wheelY=e.deltaY*t||0;break;case e.DOM_DELTA_LINE:case e.DOM_DELTA_PAGE:e.wheelX=(e.deltaX||0)*5,e.wheelY=(e.deltaY||0)*5}n(e)}):t.addListener(e,"DOMMouseScroll",function(e){e.axis&&e.axis==e.HORIZONTAL_AXIS?(e.wheelX=(e.detail||0)*5,e.wheelY=0):(e.wheelX=0,e.wheelY=(e.detail||0)*5),n(e)})},t.addMultiMouseDownListener=function(e,n,r,s){function c(e){t.getButton(e)!==0?o=0:e.detail>1?(o++,o>4&&(o=1)):o=1;if(i.isIE){var c=Math.abs(e.clientX-u)>5||Math.abs(e.clientY-a)>5;if(!f||c)o=1;f&&clearTimeout(f),f=setTimeout(function(){f=null},n[o-1]||600),o==1&&(u=e.clientX,a=e.clientY)}e._clicks=o,r[s]("mousedown",e);if(o>4)o=0;else if(o>1)return r[s](l[o],e)}function h(e){o=2,f&&clearTimeout(f),f=setTimeout(function(){f=null},n[o-1]||600),r[s]("mousedown",e),r[s](l[o],e)}var o=0,u,a,f,l={2:"dblclick",3:"tripleclick",4:"quadclick"};Array.isArray(e)||(e=[e]),e.forEach(function(e){t.addListener(e,"mousedown",c),i.isOldIE&&t.addListener(e,"dblclick",h)})};var u=!i.isMac||!i.isOpera||"KeyboardEvent"in window?function(e){return 0|(e.ctrlKey?1:0)|(e.altKey?2:0)|(e.shiftKey?4:0)|(e.metaKey?8:0)}:function(e){return 0|(e.metaKey?1:0)|(e.altKey?2:0)|(e.shiftKey?4:0)|(e.ctrlKey?8:0)};t.getModifierString=function(e){return r.KEY_MODS[u(e)]},t.addCommandKeyListener=function(e,n){var r=t.addListener;if(i.isOldGecko||i.isOpera&&!("KeyboardEvent"in window)){var o=null;r(e,"keydown",function(e){o=e.keyCode}),r(e,"keypress",function(e){return a(n,e,o)})}else{var u=null;r(e,"keydown",function(e){s[e.keyCode]=(s[e.keyCode]||0)+1;var t=a(n,e,e.keyCode);return u=e.defaultPrevented,t}),r(e,"keypress",function(e){u&&(e.ctrlKey||e.altKey||e.shiftKey||e.metaKey)&&(t.stopEvent(e),u=null)}),r(e,"keyup",function(e){s[e.keyCode]=null}),s||(f(),r(window,"focus",f))}};if(typeof window=="object"&&window.postMessage&&!i.isOldIE){var l=1;t.nextTick=function(e,n){n=n||window;var r="zero-timeout-message-"+l;t.addListener(n,"message",function i(s){s.data==r&&(t.stopPropagation(s),t.removeListener(n,"message",i),e())}),n.postMessage(r,"*")}}t.nextFrame=typeof window=="object"&&(window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame),t.nextFrame?t.nextFrame=t.nextFrame.bind(window):t.nextFrame=function(e){setTimeout(e,17)}}),define("ace/lib/lang",["require","exports","module"],function(e,t,n){"use strict";t.last=function(e){return e[e.length-1]},t.stringReverse=function(e){return e.split("").reverse().join("")},t.stringRepeat=function(e,t){var n="";while(t>0){t&1&&(n+=e);if(t>>=1)e+=e}return n};var r=/^\s\s*/,i=/\s\s*$/;t.stringTrimLeft=function(e){return e.replace(r,"")},t.stringTrimRight=function(e){return e.replace(i,"")},t.copyObject=function(e){var t={};for(var n in e)t[n]=e[n];return t},t.copyArray=function(e){var t=[];for(var n=0,r=e.length;n<r;n++)e[n]&&typeof e[n]=="object"?t[n]=this.copyObject(e[n]):t[n]=e[n];return t},t.deepCopy=function s(e){if(typeof e!="object"||!e)return e;var t;if(Array.isArray(e)){t=[];for(var n=0;n<e.length;n++)t[n]=s(e[n]);return t}if(Object.prototype.toString.call(e)!=="[object Object]")return e;t={};for(var n in e)t[n]=s(e[n]);return t},t.arrayToMap=function(e){var t={};for(var n=0;n<e.length;n++)t[e[n]]=1;return t},t.createMap=function(e){var t=Object.create(null);for(var n in e)t[n]=e[n];return t},t.arrayRemove=function(e,t){for(var n=0;n<=e.length;n++)t===e[n]&&e.splice(n,1)},t.escapeRegExp=function(e){return e.replace(/([.*+?^${}()|[\]\/\\])/g,"\\$1")},t.escapeHTML=function(e){return e.replace(/&/g,"&#38;").replace(/"/g,"&#34;").replace(/'/g,"&#39;").replace(/</g,"&#60;")},t.getMatchOffsets=function(e,t){var n=[];return e.replace(t,function(e){n.push({offset:arguments[arguments.length-2],length:e.length})}),n},t.deferredCall=function(e){var t=null,n=function(){t=null,e()},r=function(e){return r.cancel(),t=setTimeout(n,e||0),r};return r.schedule=r,r.call=function(){return this.cancel(),e(),r},r.cancel=function(){return clearTimeout(t),t=null,r},r.isPending=function(){return t},r},t.delayedCall=function(e,t){var n=null,r=function(){n=null,e()},i=function(e){n==null&&(n=setTimeout(r,e||t))};return i.delay=function(e){n&&clearTimeout(n),n=setTimeout(r,e||t)},i.schedule=i,i.call=function(){this.cancel(),e()},i.cancel=function(){n&&clearTimeout(n),n=null},i.isPending=function(){return n},i}}),define("ace/keyboard/textinput_ios",["require","exports","module","ace/lib/event","ace/lib/useragent","ace/lib/dom","ace/lib/lang","ace/lib/keys"],function(e,t,n){"use strict";var r=e("../lib/event"),i=e("../lib/useragent"),s=e("../lib/dom"),o=e("../lib/lang"),u=e("../lib/keys"),a=u.KEY_MODS,f=i.isChrome<18,l=i.isIE,c=function(e,t){function x(e){if(m)return;m=!0;if(k)t=0,n=e?0:c.value.length-1;else var t=4,n=5;try{c.setSelectionRange(t,n)}catch(r){}m=!1}function T(){if(m)return;c.value=h,i.isWebKit&&S.schedule()}function R(){clearTimeout(q),q=setTimeout(function(){g&&(c.style.cssText=g,g=""),t.renderer.$keepTextAreaAtCursor==null&&(t.renderer.$keepTextAreaAtCursor=!0,t.renderer.$moveTextAreaToCursor())},0)}var n=this,c=s.createElement("textarea");c.className=i.isIOS?"ace_text-input ace_text-input-ios":"ace_text-input",i.isTouchPad&&c.setAttribute("x-palm-disable-auto-cap",!0),c.setAttribute("wrap","off"),c.setAttribute("autocorrect","off"),c.setAttribute("autocapitalize","off"),c.setAttribute("spellcheck",!1),c.style.opacity="0",e.insertBefore(c,e.firstChild);var h="\n aaaa a\n",p=!1,d=!1,v=!1,m=!1,g="",y=!0;try{var b=document.activeElement===c}catch(w){}r.addListener(c,"blur",function(e){t.onBlur(e),b=!1}),r.addListener(c,"focus",function(e){b=!0,t.onFocus(e),x()}),this.focus=function(){if(g)return c.focus();c.style.position="fixed",c.focus()},this.blur=function(){c.blur()},this.isFocused=function(){return b};var E=o.delayedCall(function(){b&&x(y)}),S=o.delayedCall(function(){m||(c.value=h,b&&x())});i.isWebKit||t.addEventListener("changeSelection",function(){t.selection.isEmpty()!=y&&(y=!y,E.schedule())}),T(),b&&t.onFocus();var N=function(e){return e.selectionStart===0&&e.selectionEnd===e.value.length},C=function(e){N(c)?(t.selectAll(),x()):k&&x(t.selection.isEmpty())},k=null;this.setInputHandler=function(e){k=e},this.getInputHandler=function(){return k};var L=!1,A=function(e){if(c.selectionStart===4&&c.selectionEnd===5)return;k&&(e=k(e),k=null),v?(x(),e&&t.onPaste(e),v=!1):e==h.substr(0)&&c.selectionStart===4?L?t.execCommand("del",{source:"ace"}):t.execCommand("backspace",{source:"ace"}):p||(e.substring(0,9)==h&&e.length>h.length?e=e.substr(9):e.substr(0,4)==h.substr(0,4)?e=e.substr(4,e.length-h.length+1):e.charAt(e.length-1)==h.charAt(0)&&(e=e.slice(0,-1)),e!=h.charAt(0)&&e.charAt(e.length-1)==h.charAt(0)&&(e=e.slice(0,-1)),e&&t.onTextInput(e)),p&&(p=!1),L&&(L=!1)},O=function(e){if(m)return;var t=c.value;A(t),T()},M=function(e,t,n){var r=e.clipboardData||window.clipboardData;if(!r||f)return;var i=l||n?"Text":"text/plain";try{return t?r.setData(i,t)!==!1:r.getData(i)}catch(e){if(!n)return M(e,t,!0)}},_=function(e,n){var s=t.getCopyText();if(!s)return r.preventDefault(e);M(e,s)?(i.isIOS&&(d=n,c.value="\n aa"+s+"a a\n",c.setSelectionRange(4,4+s.length),p={value:s}),n?t.onCut():t.onCopy(),i.isIOS||r.preventDefault(e)):(p=!0,c.value=s,c.select(),setTimeout(function(){p=!1,T(),x(),n?t.onCut():t.onCopy()}))},D=function(e){_(e,!0)},P=function(e){_(e,!1)},H=function(e){var n=M(e);typeof n=="string"?(n&&t.onPaste(n,e),i.isIE&&setTimeout(x),r.preventDefault(e)):(c.value="",v=!0)};r.addCommandKeyListener(c,t.onCommandKey.bind(t)),r.addListener(c,"select",C),r.addListener(c,"input",O),r.addListener(c,"cut",D),r.addListener(c,"copy",P),r.addListener(c,"paste",H);var B=function(e){if(m||!t.onCompositionStart||t.$readOnly)return;m={},m.canUndo=t.session.$undoManager,t.onCompositionStart(),setTimeout(j,0),t.on("mousedown",F),m.canUndo&&!t.selection.isEmpty()&&(t.insert(""),t.session.markUndoGroup(),t.selection.clearSelection()),t.session.markUndoGroup()},j=function(){if(!m||!t.onCompositionUpdate||t.$readOnly)return;var e=c.value.replace(/\x01/g,"");if(m.lastValue===e)return;t.onCompositionUpdate(e),m.lastValue&&t.undo(),m.canUndo&&(m.lastValue=e);if(m.lastValue){var n=t.selection.getRange();t.insert(m.lastValue),t.session.markUndoGroup(),m.range=t.selection.getRange(),t.selection.setRange(n),t.selection.clearSelection()}},F=function(e){if(!t.onCompositionEnd||t.$readOnly)return;var n=m;m=!1;var r=setTimeout(function(){r=null;var e=c.value.replace(/\x01/g,"");if(m)return;e==n.lastValue?T():!n.lastValue&&e&&(T(),A(e))});k=function(i){return r&&clearTimeout(r),i=i.replace(/\x01/g,""),i==n.lastValue?"":(n.lastValue&&r&&t.undo(),i)},t.onCompositionEnd(),t.removeListener("mousedown",F),e.type=="compositionend"&&n.range&&t.selection.setRange(n.range);var s=!!i.isChrome&&i.isChrome>=53||!!i.isWebKit&&i.isWebKit>=603;s&&O()},I=o.delayedCall(j,50);r.addListener(c,"compositionstart",B),i.isGecko?r.addListener(c,"text",function(){I.schedule()}):(r.addListener(c,"keyup",function(){I.schedule()}),r.addListener(c,"keydown",function(){I.schedule()})),r.addListener(c,"compositionend",F),this.getElement=function(){return c},this.setReadOnly=function(e){c.readOnly=e},this.onContextMenu=function(e){L=!0,x(t.selection.isEmpty()),t._emit("nativecontextmenu",{target:t,domEvent:e}),this.moveToMouse(e,!0)},this.moveToMouse=function(e,n){g||(g=c.style.cssText),c.style.cssText=(n?"z-index:100000;":"")+"height:"+c.style.height+";"+(i.isIE?"opacity:0.1;":"");var o=t.container.getBoundingClientRect(),u=s.computedStyle(t.container),a=o.top+(parseInt(u.borderTopWidth)||0),f=o.left+(parseInt(o.borderLeftWidth)||0),l=o.bottom-a-c.clientHeight-2,h=function(e){c.style.left=e.clientX-f-2+"px",c.style.top=Math.min(e.clientY-a-2,l)+"px"};h(e);if(e.type!="mousedown")return;t.renderer.$keepTextAreaAtCursor&&(t.renderer.$keepTextAreaAtCursor=null),clearTimeout(q),i.isWin&&r.capture(t.container,h,R)},this.onContextMenuClose=R;var q,U=function(e){t.textInput.onContextMenu(e),R()};r.addListener(c,"mouseup",U),r.addListener(c,"mousedown",function(e){e.preventDefault(),R()}),r.addListener(t.renderer.scroller,"contextmenu",U),r.addListener(c,"contextmenu",U);if(i.isIOS){var z=null,W=!1;e.addEventListener("keydown",function(e){z&&clearTimeout(z),W=!0}),e.addEventListener("keyup",function(e){z=setTimeout(function(){W=!1},100)});var X=function(e){if(document.activeElement!==c)return;if(W)return;if(d)return setTimeout(function(){d=!1},100);var n=c.selectionStart,r=c.selectionEnd;c.setSelectionRange(4,5);if(n==r)switch(n){case 0:t.onCommandKey(null,0,u.up);break;case 1:t.onCommandKey(null,0,u.home);break;case 2:t.onCommandKey(null,a.option,u.left);break;case 4:t.onCommandKey(null,0,u.left);break;case 5:t.onCommandKey(null,0,u.right);break;case 7:t.onCommandKey(null,a.option,u.right);break;case 8:t.onCommandKey(null,0,u.end);break;case 9:t.onCommandKey(null,0,u.down)}else{switch(r){case 6:t.onCommandKey(null,a.shift,u.right);break;case 7:t.onCommandKey(null,a.shift|a.option,u.right);break;case 8:t.onCommandKey(null,a.shift,u.end);break;case 9:t.onCommandKey(null,a.shift,u.down)}switch(n){case 0:t.onCommandKey(null,a.shift,u.up);break;case 1:t.onCommandKey(null,a.shift,u.home);break;case 2:t.onCommandKey(null,a.shift|a.option,u.left);break;case 3:t.onCommandKey(null,a.shift,u.left)}}};document.addEventListener("selectionchange",X),t.on("destroy",function(){document.removeEventListener("selectionchange",X)})}};t.TextInput=c}),define("ace/keyboard/textinput",["require","exports","module","ace/lib/event","ace/lib/useragent","ace/lib/dom","ace/lib/lang","ace/keyboard/textinput_ios"],function(e,t,n){"use strict";var r=e("../lib/event"),i=e("../lib/useragent"),s=e("../lib/dom"),o=e("../lib/lang"),u=i.isChrome<18,a=i.isIE,f=e("./textinput_ios").TextInput,l=function(e,t){function w(e){if(p)return;p=!0;if(T)var t=0,r=e?0:n.value.length-1;else var t=e?2:1,r=2;try{n.setSelectionRange(t,r)}catch(i){}p=!1}function E(){if(p)return;n.value=l,i.isWebKit&&b.schedule()}function F(){clearTimeout(j),j=setTimeout(function(){d&&(n.style.cssText=d,d=""),t.renderer.$keepTextAreaAtCursor==null&&(t.renderer.$keepTextAreaAtCursor=!0,t.renderer.$moveTextAreaToCursor())},0)}if(i.isIOS)return f.call(this,e,t);var n=s.createElement("textarea");n.className="ace_text-input",n.setAttribute("wrap","off"),n.setAttribute("autocorrect","off"),n.setAttribute("autocapitalize","off"),n.setAttribute("spellcheck",!1),n.style.opacity="0",e.insertBefore(n,e.firstChild);var l="\u2028\u2028",c=!1,h=!1,p=!1,d="",v=!0;try{var m=document.activeElement===n}catch(g){}r.addListener(n,"blur",function(e){t.onBlur(e),m=!1}),r.addListener(n,"focus",function(e){m=!0,t.onFocus(e),w()}),this.focus=function(){if(d)return n.focus();var e=n.style.top;n.style.position="fixed",n.style.top="0px",n.focus(),setTimeout(function(){n.style.position="",n.style.top=="0px"&&(n.style.top=e)},0)},this.blur=function(){n.blur()},this.isFocused=function(){return m};var y=o.delayedCall(function(){m&&w(v)}),b=o.delayedCall(function(){p||(n.value=l,m&&w())});i.isWebKit||t.addEventListener("changeSelection",function(){t.selection.isEmpty()!=v&&(v=!v,y.schedule())}),E(),m&&t.onFocus();var S=function(e){return e.selectionStart===0&&e.selectionEnd===e.value.length},x=function(e){c?c=!1:S(n)?(t.selectAll(),w()):T&&w(t.selection.isEmpty())},T=null;this.setInputHandler=function(e){T=e},this.getInputHandler=function(){return T};var N=!1,C=function(e){T&&(e=T(e),T=null),h?(w(),e&&t.onPaste(e),h=!1):e==l.charAt(0)?N?t.execCommand("del",{source:"ace"}):t.execCommand("backspace",{source:"ace"}):(e.substring(0,2)==l?e=e.substr(2):e.charAt(0)==l.charAt(0)?e=e.substr(1):e.charAt(e.length-1)==l.charAt(0)&&(e=e.slice(0,-1)),e.charAt(e.length-1)==l.charAt(0)&&(e=e.slice(0,-1)),e&&t.onTextInput(e)),N&&(N=!1)},k=function(e){if(p)return;var t=n.value;C(t),E()},L=function(e,t,n){var r=e.clipboardData||window.clipboardData;if(!r||u)return;var i=a||n?"Text":"text/plain";try{return t?r.setData(i,t)!==!1:r.getData(i)}catch(e){if(!n)return L(e,t,!0)}},A=function(e,i){var s=t.getCopyText();if(!s)return r.preventDefault(e);L(e,s)?(i?t.onCut():t.onCopy(),r.preventDefault(e)):(c=!0,n.value=s,n.select(),setTimeout(function(){c=!1,E(),w(),i?t.onCut():t.onCopy()}))},O=function(e){A(e,!0)},M=function(e){A(e,!1)},_=function(e){var s=L(e);typeof s=="string"?(s&&t.onPaste(s,e),i.isIE&&setTimeout(w),r.preventDefault(e)):(n.value="",h=!0)};r.addCommandKeyListener(n,t.onCommandKey.bind(t)),r.addListener(n,"select",x),r.addListener(n,"input",k),r.addListener(n,"cut",O),r.addListener(n,"copy",M),r.addListener(n,"paste",_),(!("oncut"in n)||!("oncopy"in n)||!("onpaste"in n))&&r.addListener(e,"keydown",function(e){if(i.isMac&&!e.metaKey||!e.ctrlKey)return;switch(e.keyCode){case 67:M(e);break;case 86:_(e);break;case 88:O(e)}});var D=function(e){if(p||!t.onCompositionStart||t.$readOnly)return;p={},p.canUndo=t.session.$undoManager,t.onCompositionStart(),setTimeout(P,0),t.on("mousedown",H),p.canUndo&&!t.selection.isEmpty()&&(t.insert(""),t.session.markUndoGroup(),t.selection.clearSelection()),t.session.markUndoGroup()},P=function(){if(!p||!t.onCompositionUpdate||t.$readOnly)return;var e=n.value.replace(/\u2028/g,"");if(p.lastValue===e)return;t.onCompositionUpdate(e),p.lastValue&&t.undo(),p.canUndo&&(p.lastValue=e);if(p.lastValue){var r=t.selection.getRange();t.insert(p.lastValue),t.session.markUndoGroup(),p.range=t.selection.getRange(),t.selection.setRange(r),t.selection.clearSelection()}},H=function(e){if(!t.onCompositionEnd||t.$readOnly)return;var r=p;p=!1;var s=setTimeout(function(){s=null;var e=n.value.replace(/\u2028/g,"");if(p)return;e==r.lastValue?E():!r.lastValue&&e&&(E(),C(e))});T=function(n){return s&&clearTimeout(s),n=n.replace(/\u2028/g,""),n==r.lastValue?"":(r.lastValue&&s&&t.undo(),n)},t.onCompositionEnd(),t.removeListener("mousedown",H),e.type=="compositionend"&&r.range&&t.selection.setRange(r.range);var o=!!i.isChrome&&i.isChrome>=53||!!i.isWebKit&&i.isWebKit>=603;o&&k()},B=o.delayedCall(P,50);r.addListener(n,"compositionstart",D),i.isGecko?r.addListener(n,"text",function(){B.schedule()}):(r.addListener(n,"keyup",function(){B.schedule()}),r.addListener(n,"keydown",function(){B.schedule()})),r.addListener(n,"compositionend",H),this.getElement=function(){return n},this.setReadOnly=function(e){n.readOnly=e},this.onContextMenu=function(e){N=!0,w(t.selection.isEmpty()),t._emit("nativecontextmenu",{target:t,domEvent:e}),this.moveToMouse(e,!0)},this.moveToMouse=function(e,o){d||(d=n.style.cssText),n.style.cssText=(o?"z-index:100000;":"")+"height:"+n.style.height+";"+(i.isIE?"opacity:0.1;":"");var u=t.container.getBoundingClientRect(),a=s.computedStyle(t.container),f=u.top+(parseInt(a.borderTopWidth)||0),l=u.left+(parseInt(u.borderLeftWidth)||0),c=u.bottom-f-n.clientHeight-2,h=function(e){n.style.left=e.clientX-l-2+"px",n.style.top=Math.min(e.clientY-f-2,c)+"px"};h(e);if(e.type!="mousedown")return;t.renderer.$keepTextAreaAtCursor&&(t.renderer.$keepTextAreaAtCursor=null),clearTimeout(j),i.isWin&&r.capture(t.container,h,F)},this.onContextMenuClose=F;var j,I=function(e){t.textInput.onContextMenu(e),F()};r.addListener(n,"mouseup",I),r.addListener(n,"mousedown",function(e){e.preventDefault(),F()}),r.addListener(t.renderer.scroller,"contextmenu",I),r.addListener(n,"contextmenu",I)};t.TextInput=l}),define("ace/mouse/default_handlers",["require","exports","module","ace/lib/dom","ace/lib/event","ace/lib/useragent"],function(e,t,n){"use strict";function a(e){e.$clickSelection=null;var t=e.editor;t.setDefaultHandler("mousedown",this.onMouseDown.bind(e)),t.setDefaultHandler("dblclick",this.onDoubleClick.bind(e)),t.setDefaultHandler("tripleclick",this.onTripleClick.bind(e)),t.setDefaultHandler("quadclick",this.onQuadClick.bind(e)),t.setDefaultHandler("mousewheel",this.onMouseWheel.bind(e)),t.setDefaultHandler("touchmove",this.onTouchMove.bind(e));var n=["select","startSelect","selectEnd","selectAllEnd","selectByWordsEnd","selectByLinesEnd","dragWait","dragWaitEnd","focusWait"];n.forEach(function(t){e[t]=this[t]},this),e.selectByLines=this.extendSelectionBy.bind(e,"getLineRange"),e.selectByWords=this.extendSelectionBy.bind(e,"getWordRange")}function f(e,t,n,r){return Math.sqrt(Math.pow(n-e,2)+Math.pow(r-t,2))}function l(e,t){if(e.start.row==e.end.row)var n=2*t.column-e.start.column-e.end.column;else if(e.start.row==e.end.row-1&&!e.start.column&&!e.end.column)var n=t.column-4;else var n=2*t.row-e.start.row-e.end.row;return n<0?{cursor:e.start,anchor:e.end}:{cursor:e.end,anchor:e.start}}var r=e("../lib/dom"),i=e("../lib/event"),s=e("../lib/useragent"),o=0,u=250;(function(){this.onMouseDown=function(e){var t=e.inSelection(),n=e.getDocumentPosition();this.mousedownEvent=e;var r=this.editor,i=e.getButton();if(i!==0){var o=r.getSelectionRange(),u=o.isEmpty();r.$blockScrolling++,(u||i==1)&&r.selection.moveToPosition(n),r.$blockScrolling--,i==2&&(r.textInput.onContextMenu(e.domEvent),s.isMozilla||e.preventDefault());return}this.mousedownEvent.time=Date.now();if(t&&!r.isFocused()){r.focus();if(this.$focusTimout&&!this.$clickSelection&&!r.inMultiSelectMode){this.setState("focusWait"),this.captureMouse(e);return}}return this.captureMouse(e),this.startSelect(n,e.domEvent._clicks>1),e.preventDefault()},this.startSelect=function(e,t){e=e||this.editor.renderer.screenToTextCoordinates(this.x,this.y);var n=this.editor;n.$blockScrolling++,this.mousedownEvent.getShiftKey()?n.selection.selectToPosition(e):t||n.selection.moveToPosition(e),t||this.select(),n.renderer.scroller.setCapture&&n.renderer.scroller.setCapture(),n.setStyle("ace_selecting"),this.setState("select"),n.$blockScrolling--},this.select=function(){var e,t=this.editor,n=t.renderer.screenToTextCoordinates(this.x,this.y);t.$blockScrolling++;if(this.$clickSelection){var r=this.$clickSelection.comparePoint(n);if(r==-1)e=this.$clickSelection.end;else if(r==1)e=this.$clickSelection.start;else{var i=l(this.$clickSelection,n);n=i.cursor,e=i.anchor}t.selection.setSelectionAnchor(e.row,e.column)}t.selection.selectToPosition(n),t.$blockScrolling--,t.renderer.scrollCursorIntoView()},this.extendSelectionBy=function(e){var t,n=this.editor,r=n.renderer.screenToTextCoordinates(this.x,this.y),i=n.selection[e](r.row,r.column);n.$blockScrolling++;if(this.$clickSelection){var s=this.$clickSelection.comparePoint(i.start),o=this.$clickSelection.comparePoint(i.end);if(s==-1&&o<=0){t=this.$clickSelection.end;if(i.end.row!=r.row||i.end.column!=r.column)r=i.start}else if(o==1&&s>=0){t=this.$clickSelection.start;if(i.start.row!=r.row||i.start.column!=r.column)r=i.end}else if(s==-1&&o==1)r=i.end,t=i.start;else{var u=l(this.$clickSelection,r);r=u.cursor,t=u.anchor}n.selection.setSelectionAnchor(t.row,t.column)}n.selection.selectToPosition(r),n.$blockScrolling--,n.renderer.scrollCursorIntoView()},this.selectEnd=this.selectAllEnd=this.selectByWordsEnd=this.selectByLinesEnd=function(){this.$clickSelection=null,this.editor.unsetStyle("ace_selecting"),this.editor.renderer.scroller.releaseCapture&&this.editor.renderer.scroller.releaseCapture()},this.focusWait=function(){var e=f(this.mousedownEvent.x,this.mousedownEvent.y,this.x,this.y),t=Date.now();(e>o||t-this.mousedownEvent.time>this.$focusTimout)&&this.startSelect(this.mousedownEvent.getDocumentPosition())},this.onDoubleClick=function(e){var t=e.getDocumentPosition(),n=this.editor,r=n.session,i=r.getBracketRange(t);i?(i.isEmpty()&&(i.start.column--,i.end.column++),this.setState("select")):(i=n.selection.getWordRange(t.row,t.column),this.setState("selectByWords")),this.$clickSelection=i,this.select()},this.onTripleClick=function(e){var t=e.getDocumentPosition(),n=this.editor;this.setState("selectByLines");var r=n.getSelectionRange();r.isMultiLine()&&r.contains(t.row,t.column)?(this.$clickSelection=n.selection.getLineRange(r.start.row),this.$clickSelection.end=n.selection.getLineRange(r.end.row).end):this.$clickSelection=n.selection.getLineRange(t.row),this.select()},this.onQuadClick=function(e){var t=this.editor;t.selectAll(),this.$clickSelection=t.getSelectionRange(),this.setState("selectAll")},this.onMouseWheel=function(e){if(e.getAccelKey())return;e.getShiftKey()&&e.wheelY&&!e.wheelX&&(e.wheelX=e.wheelY,e.wheelY=0);var t=this.editor;this.$lastScroll||(this.$lastScroll={t:0,vx:0,vy:0,allowed:0});var n=this.$lastScroll,r=e.domEvent.timeStamp,i=r-n.t,s=e.wheelX/i,o=e.wheelY/i;i<u&&(s=(s+n.vx)/2,o=(o+n.vy)/2);var a=Math.abs(s/o),f=!1;a>=1&&t.renderer.isScrollableBy(e.wheelX*e.speed,0)&&(f=!0),a<=1&&t.renderer.isScrollableBy(0,e.wheelY*e.speed)&&(f=!0);if(f)n.allowed=r;else if(r-n.allowed<u){var l=Math.abs(s)<=1.1*Math.abs(n.vx)&&Math.abs(o)<=1.1*Math.abs(n.vy);l?(f=!0,n.allowed=r):n.allowed=0}n.t=r,n.vx=s,n.vy=o;if(f)return t.renderer.scrollBy(e.wheelX*e.speed,e.wheelY*e.speed),e.stop()},this.onTouchMove=function(e){this.editor._emit("mousewheel",e)}}).call(a.prototype),t.DefaultHandlers=a}),define("ace/tooltip",["require","exports","module","ace/lib/oop","ace/lib/dom"],function(e,t,n){"use strict";function s(e){this.isOpen=!1,this.$element=null,this.$parentNode=e}var r=e("./lib/oop"),i=e("./lib/dom");(function(){this.$init=function(){return this.$element=i.createElement("div"),this.$element.className="ace_tooltip",this.$element.style.display="none",this.$parentNode.appendChild(this.$element),this.$element},this.getElement=function(){return this.$element||this.$init()},this.setText=function(e){i.setInnerText(this.getElement(),e)},this.setHtml=function(e){this.getElement().innerHTML=e},this.setPosition=function(e,t){this.getElement().style.left=e+"px",this.getElement().style.top=t+"px"},this.setClassName=function(e){i.addCssClass(this.getElement(),e)},this.show=function(e,t,n){e!=null&&this.setText(e),t!=null&&n!=null&&this.setPosition(t,n),this.isOpen||(this.getElement().style.display="block",this.isOpen=!0)},this.hide=function(){this.isOpen&&(this.getElement().style.display="none",this.isOpen=!1)},this.getHeight=function(){return this.getElement().offsetHeight},this.getWidth=function(){return this.getElement().offsetWidth},this.destroy=function(){this.isOpen=!1,this.$element&&this.$element.parentNode&&this.$element.parentNode.removeChild(this.$element)}}).call(s.prototype),t.Tooltip=s}),define("ace/mouse/default_gutter_handler",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/event","ace/tooltip"],function(e,t,n){"use strict";function u(e){function l(){var r=u.getDocumentPosition().row,s=n.$annotations[r];if(!s)return c();var o=t.session.getLength();if(r==o){var a=t.renderer.pixelToScreenCoordinates(0,u.y).row,l=u.$pos;if(a>t.session.documentToScreenRow(l.row,l.column))return c()}if(f==s)return;f=s.text.join("<br/>"),i.setHtml(f),i.show(),t._signal("showGutterTooltip",i),t.on("mousewheel",c);if(e.$tooltipFollowsMouse)h(u);else{var p=u.domEvent.target,d=p.getBoundingClientRect(),v=i.getElement().style;v.left=d.right+"px",v.top=d.bottom+"px"}}function c(){o&&(o=clearTimeout(o)),f&&(i.hide(),f=null,t._signal("hideGutterTooltip",i),t.removeEventListener("mousewheel",c))}function h(e){i.setPosition(e.x,e.y)}var t=e.editor,n=t.renderer.$gutterLayer,i=new a(t.container);e.editor.setDefaultHandler("guttermousedown",function(r){if(!t.isFocused()||r.getButton()!=0)return;var i=n.getRegion(r);if(i=="foldWidgets")return;var s=r.getDocumentPosition().row,o=t.session.selection;if(r.getShiftKey())o.selectTo(s,0);else{if(r.domEvent.detail==2)return t.selectAll(),r.preventDefault();e.$clickSelection=t.selection.getLineRange(s)}return e.setState("selectByLines"),e.captureMouse(r),r.preventDefault()});var o,u,f;e.editor.setDefaultHandler("guttermousemove",function(t){var n=t.domEvent.target||t.domEvent.srcElement;if(r.hasCssClass(n,"ace_fold-widget"))return c();f&&e.$tooltipFollowsMouse&&h(t),u=t;if(o)return;o=setTimeout(function(){o=null,u&&!e.isMousePressed?l():c()},50)}),s.addListener(t.renderer.$gutter,"mouseout",function(e){u=null;if(!f||o)return;o=setTimeout(function(){o=null,c()},50)}),t.on("changeSession",c)}function a(e){o.call(this,e)}var r=e("../lib/dom"),i=e("../lib/oop"),s=e("../lib/event"),o=e("../tooltip").Tooltip;i.inherits(a,o),function(){this.setPosition=function(e,t){var n=window.innerWidth||document.documentElement.clientWidth,r=window.innerHeight||document.documentElement.clientHeight,i=this.getWidth(),s=this.getHeight();e+=15,t+=15,e+i>n&&(e-=e+i-n),t+s>r&&(t-=20+s),o.prototype.setPosition.call(this,e,t)}}.call(a.prototype),t.GutterHandler=u}),define("ace/mouse/mouse_event",["require","exports","module","ace/lib/event","ace/lib/useragent"],function(e,t,n){"use strict";var r=e("../lib/event"),i=e("../lib/useragent"),s=t.MouseEvent=function(e,t){this.domEvent=e,this.editor=t,this.x=this.clientX=e.clientX,this.y=this.clientY=e.clientY,this.$pos=null,this.$inSelection=null,this.propagationStopped=!1,this.defaultPrevented=!1};(function(){this.stopPropagation=function(){r.stopPropagation(this.domEvent),this.propagationStopped=!0},this.preventDefault=function(){r.preventDefault(this.domEvent),this.defaultPrevented=!0},this.stop=function(){this.stopPropagation(),this.preventDefault()},this.getDocumentPosition=function(){return this.$pos?this.$pos:(this.$pos=this.editor.renderer.screenToTextCoordinates(this.clientX,this.clientY),this.$pos)},this.inSelection=function(){if(this.$inSelection!==null)return this.$inSelection;var e=this.editor,t=e.getSelectionRange();if(t.isEmpty())this.$inSelection=!1;else{var n=this.getDocumentPosition();this.$inSelection=t.contains(n.row,n.column)}return this.$inSelection},this.getButton=function(){return r.getButton(this.domEvent)},this.getShiftKey=function(){return this.domEvent.shiftKey},this.getAccelKey=i.isMac?function(){return this.domEvent.metaKey}:function(){return this.domEvent.ctrlKey}}).call(s.prototype)}),define("ace/mouse/dragdrop_handler",["require","exports","module","ace/lib/dom","ace/lib/event","ace/lib/useragent"],function(e,t,n){"use strict";function f(e){function T(e,n){var r=Date.now(),i=!n||e.row!=n.row,s=!n||e.column!=n.column;if(!S||i||s)t.$blockScrolling+=1,t.moveCursorToPosition(e),t.$blockScrolling-=1,S=r,x={x:p,y:d};else{var o=l(x.x,x.y,p,d);o>a?S=null:r-S>=u&&(t.renderer.scrollCursorIntoView(),S=null)}}function N(e,n){var r=Date.now(),i=t.renderer.layerConfig.lineHeight,s=t.renderer.layerConfig.characterWidth,u=t.renderer.scroller.getBoundingClientRect(),a={x:{left:p-u.left,right:u.right-p},y:{top:d-u.top,bottom:u.bottom-d}},f=Math.min(a.x.left,a.x.right),l=Math.min(a.y.top,a.y.bottom),c={row:e.row,column:e.column};f/s<=2&&(c.column+=a.x.left<a.x.right?-3:2),l/i<=1&&(c.row+=a.y.top<a.y.bottom?-1:1);var h=e.row!=c.row,v=e.column!=c.column,m=!n||e.row!=n.row;h||v&&!m?E?r-E>=o&&t.renderer.scrollCursorIntoView(c):E=r:E=null}function C(){var e=g;g=t.renderer.screenToTextCoordinates(p,d),T(g,e),N(g,e)}function k(){m=t.selection.toOrientedRange(),h=t.session.addMarker(m,"ace_selection",t.getSelectionStyle()),t.clearSelection(),t.isFocused()&&t.renderer.$cursorLayer.setBlinking(!1),clearInterval(v),C(),v=setInterval(C,20),y=0,i.addListener(document,"mousemove",O)}function L(){clearInterval(v),t.session.removeMarker(h),h=null,t.$blockScrolling+=1,t.selection.fromOrientedRange(m),t.$blockScrolling-=1,t.isFocused()&&!w&&t.renderer.$cursorLayer.setBlinking(!t.getReadOnly()),m=null,g=null,y=0,E=null,S=null,i.removeListener(document,"mousemove",O)}function O(){A==null&&(A=setTimeout(function(){A!=null&&h&&L()},20))}function M(e){var t=e.types;return!t||Array.prototype.some.call(t,function(e){return e=="text/plain"||e=="Text"})}function _(e){var t=["copy","copymove","all","uninitialized"],n=["move","copymove","linkmove","all","uninitialized"],r=s.isMac?e.altKey:e.ctrlKey,i="uninitialized";try{i=e.dataTransfer.effectAllowed.toLowerCase()}catch(e){}var o="none";return r&&t.indexOf(i)>=0?o="copy":n.indexOf(i)>=0?o="move":t.indexOf(i)>=0&&(o="copy"),o}var t=e.editor,n=r.createElement("img");n.src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",s.isOpera&&(n.style.cssText="width:1px;height:1px;position:fixed;top:0;left:0;z-index:2147483647;opacity:0;");var f=["dragWait","dragWaitEnd","startDrag","dragReadyEnd","onMouseDrag"];f.forEach(function(t){e[t]=this[t]},this),t.addEventListener("mousedown",this.onMouseDown.bind(e));var c=t.container,h,p,d,v,m,g,y=0,b,w,E,S,x;this.onDragStart=function(e){if(this.cancelDrag||!c.draggable){var r=this;return setTimeout(function(){r.startSelect(),r.captureMouse(e)},0),e.preventDefault()}m=t.getSelectionRange();var i=e.dataTransfer;i.effectAllowed=t.getReadOnly()?"copy":"copyMove",s.isOpera&&(t.container.appendChild(n),n.scrollTop=0),i.setDragImage&&i.setDragImage(n,0,0),s.isOpera&&t.container.removeChild(n),i.clearData(),i.setData("Text",t.session.getTextRange()),w=!0,this.setState("drag")},this.onDragEnd=function(e){c.draggable=!1,w=!1,this.setState(null);if(!t.getReadOnly()){var n=e.dataTransfer.dropEffect;!b&&n=="move"&&t.session.remove(t.getSelectionRange()),t.renderer.$cursorLayer.setBlinking(!0)}this.editor.unsetStyle("ace_dragging"),this.editor.renderer.setCursorStyle("")},this.onDragEnter=function(e){if(t.getReadOnly()||!M(e.dataTransfer))return;return p=e.clientX,d=e.clientY,h||k(),y++,e.dataTransfer.dropEffect=b=_(e),i.preventDefault(e)},this.onDragOver=function(e){if(t.getReadOnly()||!M(e.dataTransfer))return;return p=e.clientX,d=e.clientY,h||(k(),y++),A!==null&&(A=null),e.dataTransfer.dropEffect=b=_(e),i.preventDefault(e)},this.onDragLeave=function(e){y--;if(y<=0&&h)return L(),b=null,i.preventDefault(e)},this.onDrop=function(e){if(!g)return;var n=e.dataTransfer;if(w)switch(b){case"move":m.contains(g.row,g.column)?m={start:g,end:g}:m=t.moveText(m,g);break;case"copy":m=t.moveText(m,g,!0)}else{var r=n.getData("Text");m={start:g,end:t.session.insert(g,r)},t.focus(),b=null}return L(),i.preventDefault(e)},i.addListener(c,"dragstart",this.onDragStart.bind(e)),i.addListener(c,"dragend",this.onDragEnd.bind(e)),i.addListener(c,"dragenter",this.onDragEnter.bind(e)),i.addListener(c,"dragover",this.onDragOver.bind(e)),i.addListener(c,"dragleave",this.onDragLeave.bind(e)),i.addListener(c,"drop",this.onDrop.bind(e));var A=null}function l(e,t,n,r){return Math.sqrt(Math.pow(n-e,2)+Math.pow(r-t,2))}var r=e("../lib/dom"),i=e("../lib/event"),s=e("../lib/useragent"),o=200,u=200,a=5;(function(){this.dragWait=function(){var e=Date.now()-this.mousedownEvent.time;e>this.editor.getDragDelay()&&this.startDrag()},this.dragWaitEnd=function(){var e=this.editor.container;e.draggable=!1,this.startSelect(this.mousedownEvent.getDocumentPosition()),this.selectEnd()},this.dragReadyEnd=function(e){this.editor.renderer.$cursorLayer.setBlinking(!this.editor.getReadOnly()),this.editor.unsetStyle("ace_dragging"),this.editor.renderer.setCursorStyle(""),this.dragWaitEnd()},this.startDrag=function(){this.cancelDrag=!1;var e=this.editor,t=e.container;t.draggable=!0,e.renderer.$cursorLayer.setBlinking(!1),e.setStyle("ace_dragging");var n=s.isWin?"default":"move";e.renderer.setCursorStyle(n),this.setState("dragReady")},this.onMouseDrag=function(e){var t=this.editor.container;if(s.isIE&&this.state=="dragReady"){var n=l(this.mousedownEvent.x,this.mousedownEvent.y,this.x,this.y);n>3&&t.dragDrop()}if(this.state==="dragWait"){var n=l(this.mousedownEvent.x,this.mousedownEvent.y,this.x,this.y);n>0&&(t.draggable=!1,this.startSelect(this.mousedownEvent.getDocumentPosition()))}},this.onMouseDown=function(e){if(!this.$dragEnabled)return;this.mousedownEvent=e;var t=this.editor,n=e.inSelection(),r=e.getButton(),i=e.domEvent.detail||1;if(i===1&&r===0&&n){if(e.editor.inMultiSelectMode&&(e.getAccelKey()||e.getShiftKey()))return;this.mousedownEvent.time=Date.now();var o=e.domEvent.target||e.domEvent.srcElement;"unselectable"in o&&(o.unselectable="on");if(t.getDragDelay()){if(s.isWebKit){this.cancelDrag=!0;var u=t.container;u.draggable=!0}this.setState("dragWait")}else this.startDrag();this.captureMouse(e,this.onMouseDrag.bind(this)),e.defaultPrevented=!0}}}).call(f.prototype),t.DragdropHandler=f}),define("ace/lib/net",["require","exports","module","ace/lib/dom"],function(e,t,n){"use strict";var r=e("./dom");t.get=function(e,t){var n=new XMLHttpRequest;n.open("GET",e,!0),n.onreadystatechange=function(){n.readyState===4&&t(n.responseText)},n.send(null)},t.loadScript=function(e,t){var n=r.getDocumentHead(),i=document.createElement("script");i.src=e,n.appendChild(i),i.onload=i.onreadystatechange=function(e,n){if(n||!i.readyState||i.readyState=="loaded"||i.readyState=="complete")i=i.onload=i.onreadystatechange=null,n||t()}},t.qualifyURL=function(e){var t=document.createElement("a");return t.href=e,t.href}}),define("ace/lib/event_emitter",["require","exports","module"],function(e,t,n){"use strict";var r={},i=function(){this.propagationStopped=!0},s=function(){this.defaultPrevented=!0};r._emit=r._dispatchEvent=function(e,t){this._eventRegistry||(this._eventRegistry={}),this._defaultHandlers||(this._defaultHandlers={});var n=this._eventRegistry[e]||[],r=this._defaultHandlers[e];if(!n.length&&!r)return;if(typeof t!="object"||!t)t={};t.type||(t.type=e),t.stopPropagation||(t.stopPropagation=i),t.preventDefault||(t.preventDefault=s),n=n.slice();for(var o=0;o<n.length;o++){n[o](t,this);if(t.propagationStopped)break}if(r&&!t.defaultPrevented)return r(t,this)},r._signal=function(e,t){var n=(this._eventRegistry||{})[e];if(!n)return;n=n.slice();for(var r=0;r<n.length;r++)n[r](t,this)},r.once=function(e,t){var n=this;t&&this.addEventListener(e,function r(){n.removeEventListener(e,r),t.apply(null,arguments)})},r.setDefaultHandler=function(e,t){var n=this._defaultHandlers;n||(n=this._defaultHandlers={_disabled_:{}});if(n[e]){var r=n[e],i=n._disabled_[e];i||(n._disabled_[e]=i=[]),i.push(r);var s=i.indexOf(t);s!=-1&&i.splice(s,1)}n[e]=t},r.removeDefaultHandler=function(e,t){var n=this._defaultHandlers;if(!n)return;var r=n._disabled_[e];if(n[e]==t){var i=n[e];r&&this.setDefaultHandler(e,r.pop())}else if(r){var s=r.indexOf(t);s!=-1&&r.splice(s,1)}},r.on=r.addEventListener=function(e,t,n){this._eventRegistry=this._eventRegistry||{};var r=this._eventRegistry[e];return r||(r=this._eventRegistry[e]=[]),r.indexOf(t)==-1&&r[n?"unshift":"push"](t),t},r.off=r.removeListener=r.removeEventListener=function(e,t){this._eventRegistry=this._eventRegistry||{};var n=this._eventRegistry[e];if(!n)return;var r=n.indexOf(t);r!==-1&&n.splice(r,1)},r.removeAllListeners=function(e){this._eventRegistry&&(this._eventRegistry[e]=[])},t.EventEmitter=r}),define("ace/lib/app_config",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(e,t,n){"no use strict";function o(e){typeof console!="undefined"&&console.warn&&console.warn.apply(console,arguments)}function u(e,t){var n=new Error(e);n.data=t,typeof console=="object"&&console.error&&console.error(n),setTimeout(function(){throw n})}var r=e("./oop"),i=e("./event_emitter").EventEmitter,s={setOptions:function(e){Object.keys(e).forEach(function(t){this.setOption(t,e[t])},this)},getOptions:function(e){var t={};return e?Array.isArray(e)||(t=e,e=Object.keys(t)):e=Object.keys(this.$options),e.forEach(function(e){t[e]=this.getOption(e)},this),t},setOption:function(e,t){if(this["$"+e]===t)return;var n=this.$options[e];if(!n)return o('misspelled option "'+e+'"');if(n.forwardTo)return this[n.forwardTo]&&this[n.forwardTo].setOption(e,t);n.handlesSet||(this["$"+e]=t),n&&n.set&&n.set.call(this,t)},getOption:function(e){var t=this.$options[e];return t?t.forwardTo?this[t.forwardTo]&&this[t.forwardTo].getOption(e):t&&t.get?t.get.call(this):this["$"+e]:o('misspelled option "'+e+'"')}},a=function(){this.$defaultOptions={}};(function(){r.implement(this,i),this.defineOptions=function(e,t,n){return e.$options||(this.$defaultOptions[t]=e.$options={}),Object.keys(n).forEach(function(t){var r=n[t];typeof r=="string"&&(r={forwardTo:r}),r.name||(r.name=t),e.$options[r.name]=r,"initialValue"in r&&(e["$"+r.name]=r.initialValue)}),r.implement(e,s),this},this.resetOptions=function(e){Object.keys(e.$options).forEach(function(t){var n=e.$options[t];"value"in n&&e.setOption(t,n.value)})},this.setDefaultValue=function(e,t,n){var r=this.$defaultOptions[e]||(this.$defaultOptions[e]={});r[t]&&(r.forwardTo?this.setDefaultValue(r.forwardTo,t,n):r[t].value=n)},this.setDefaultValues=function(e,t){Object.keys(t).forEach(function(n){this.setDefaultValue(e,n,t[n])},this)},this.warn=o,this.reportError=u}).call(a.prototype),t.AppConfig=a}),define("ace/config",["require","exports","module","ace/lib/lang","ace/lib/oop","ace/lib/net","ace/lib/app_config"],function(e,t,n){"no use strict";function f(r){if(!u||!u.document)return;a.packaged=r||e.packaged||n.packaged||u.define&&define.packaged;var i={},s="",o=document.currentScript||document._currentScript,f=o&&o.ownerDocument||document,c=f.getElementsByTagName("script");for(var h=0;h<c.length;h++){var p=c[h],d=p.src||p.getAttribute("src");if(!d)continue;var v=p.attributes;for(var m=0,g=v.length;m<g;m++){var y=v[m];y.name.indexOf("data-ace-")===0&&(i[l(y.name.replace(/^data-ace-/,""))]=y.value)}var b=d.match(/^(.*)\/ace(\-\w+)?\.js(\?|$)/);b&&(s=b[1])}s&&(i.base=i.base||s,i.packaged=!0),i.basePath=i.base,i.workerPath=i.workerPath||i.base,i.modePath=i.modePath||i.base,i.themePath=i.themePath||i.base,delete i.base;for(var w in i)typeof i[w]!="undefined"&&t.set(w,i[w])}function l(e){return e.replace(/-(.)/g,function(e,t){return t.toUpperCase()})}var r=e("./lib/lang"),i=e("./lib/oop"),s=e("./lib/net"),o=e("./lib/app_config").AppConfig;n.exports=t=new o;var u=function(){return this||typeof window!="undefined"&&window}(),a={packaged:!1,workerPath:null,modePath:null,themePath:null,basePath:"",suffix:".js",$moduleUrls:{}};t.get=function(e){if(!a.hasOwnProperty(e))throw new Error("Unknown config key: "+e);return a[e]},t.set=function(e,t){if(!a.hasOwnProperty(e))throw new Error("Unknown config key: "+e);a[e]=t},t.all=function(){return r.copyObject(a)},t.moduleUrl=function(e,t){if(a.$moduleUrls[e])return a.$moduleUrls[e];var n=e.split("/");t=t||n[n.length-2]||"";var r=t=="snippets"?"/":"-",i=n[n.length-1];if(t=="worker"&&r=="-"){var s=new RegExp("^"+t+"[\\-_]|[\\-_]"+t+"$","g");i=i.replace(s,"")}(!i||i==t)&&n.length>1&&(i=n[n.length-2]);var o=a[t+"Path"];return o==null?o=a.basePath:r=="/"&&(t=r=""),o&&o.slice(-1)!="/"&&(o+="/"),o+t+r+i+this.get("suffix")},t.setModuleUrl=function(e,t){return a.$moduleUrls[e]=t},t.$loading={},t.loadModule=function(n,r){var i,o;Array.isArray(n)&&(o=n[0],n=n[1]);try{i=e(n)}catch(u){}if(i&&!t.$loading[n])return r&&r(i);t.$loading[n]||(t.$loading[n]=[]),t.$loading[n].push(r);if(t.$loading[n].length>1)return;var a=function(){e([n],function(e){t._emit("load.module",{name:n,module:e});var r=t.$loading[n];t.$loading[n]=null,r.forEach(function(t){t&&t(e)})})};if(!t.get("packaged"))return a();s.loadScript(t.moduleUrl(n,o),a)},t.init=f}),define("ace/mouse/mouse_handler",["require","exports","module","ace/lib/event","ace/lib/useragent","ace/mouse/default_handlers","ace/mouse/default_gutter_handler","ace/mouse/mouse_event","ace/mouse/dragdrop_handler","ace/config"],function(e,t,n){"use strict";var r=e("../lib/event"),i=e("../lib/useragent"),s=e("./default_handlers").DefaultHandlers,o=e("./default_gutter_handler").GutterHandler,u=e("./mouse_event").MouseEvent,a=e("./dragdrop_handler").DragdropHandler,f=e("../config"),l=function(e){var t=this;this.editor=e,new s(this),new o(this),new a(this);var n=function(t){var n=!document.hasFocus||!document.hasFocus()||!e.isFocused()&&document.activeElement==(e.textInput&&e.textInput.getElement());n&&window.focus(),e.focus()},u=e.renderer.getMouseEventTarget();r.addListener(u,"click",this.onMouseEvent.bind(this,"click")),r.addListener(u,"mousemove",this.onMouseMove.bind(this,"mousemove")),r.addMultiMouseDownListener([u,e.renderer.scrollBarV&&e.renderer.scrollBarV.inner,e.renderer.scrollBarH&&e.renderer.scrollBarH.inner,e.textInput&&e.textInput.getElement()].filter(Boolean),[400,300,250],this,"onMouseEvent"),r.addMouseWheelListener(e.container,this.onMouseWheel.bind(this,"mousewheel")),r.addTouchMoveListener(e.container,this.onTouchMove.bind(this,"touchmove"));var f=e.renderer.$gutter;r.addListener(f,"mousedown",this.onMouseEvent.bind(this,"guttermousedown")),r.addListener(f,"click",this.onMouseEvent.bind(this,"gutterclick")),r.addListener(f,"dblclick",this.onMouseEvent.bind(this,"gutterdblclick")),r.addListener(f,"mousemove",this.onMouseEvent.bind(this,"guttermousemove")),r.addListener(u,"mousedown",n),r.addListener(f,"mousedown",n),i.isIE&&e.renderer.scrollBarV&&(r.addListener(e.renderer.scrollBarV.element,"mousedown",n),r.addListener(e.renderer.scrollBarH.element,"mousedown",n)),e.on("mousemove",function(n){if(t.state||t.$dragDelay||!t.$dragEnabled)return;var r=e.renderer.screenToTextCoordinates(n.x,n.y),i=e.session.selection.getRange(),s=e.renderer;!i.isEmpty()&&i.insideStart(r.row,r.column)?s.setCursorStyle("default"):s.setCursorStyle("")})};(function(){this.onMouseEvent=function(e,t){this.editor._emit(e,new u(t,this.editor))},this.onMouseMove=function(e,t){var n=this.editor._eventRegistry&&this.editor._eventRegistry.mousemove;if(!n||!n.length)return;this.editor._emit(e,new u(t,this.editor))},this.onMouseWheel=function(e,t){var n=new u(t,this.editor);n.speed=this.$scrollSpeed*2,n.wheelX=t.wheelX,n.wheelY=t.wheelY,this.editor._emit(e,n)},this.onTouchMove=function(e,t){var n=new u(t,this.editor);n.speed=1,n.wheelX=t.wheelX,n.wheelY=t.wheelY,this.editor._emit(e,n)},this.setState=function(e){this.state=e},this.captureMouse=function(e,t){this.x=e.x,this.y=e.y,this.isMousePressed=!0;var n=this.editor.renderer;n.$keepTextAreaAtCursor&&(n.$keepTextAreaAtCursor=null);var s=this,o=function(e){if(!e)return;if(i.isWebKit&&!e.which&&s.releaseMouse)return s.releaseMouse();s.x=e.clientX,s.y=e.clientY,t&&t(e),s.mouseEvent=new u(e,s.editor),s.$mouseMoved=!0},a=function(e){clearInterval(l),f(),s[s.state+"End"]&&s[s.state+"End"](e),s.state="",n.$keepTextAreaAtCursor==null&&(n.$keepTextAreaAtCursor=!0,n.$moveTextAreaToCursor()),s.isMousePressed=!1,s.$onCaptureMouseMove=s.releaseMouse=null,e&&s.onMouseEvent("mouseup",e)},f=function(){s[s.state]&&s[s.state](),s.$mouseMoved=!1};if(i.isOldIE&&e.domEvent.type=="dblclick")return setTimeout(function(){a(e)});s.$onCaptureMouseMove=o,s.releaseMouse=r.capture(this.editor.container,o,a);var l=setInterval(f,20)},this.releaseMouse=null,this.cancelContextMenu=function(){var e=function(t){if(t&&t.domEvent&&t.domEvent.type!="contextmenu")return;this.editor.off("nativecontextmenu",e),t&&t.domEvent&&r.stopEvent(t.domEvent)}.bind(this);setTimeout(e,10),this.editor.on("nativecontextmenu",e)}}).call(l.prototype),f.defineOptions(l.prototype,"mouseHandler",{scrollSpeed:{initialValue:2},dragDelay:{initialValue:i.isMac?150:0},dragEnabled:{initialValue:!0},focusTimout:{initialValue:0},tooltipFollowsMouse:{initialValue:!0}}),t.MouseHandler=l}),define("ace/mouse/fold_handler",["require","exports","module"],function(e,t,n){"use strict";function r(e){e.on("click",function(t){var n=t.getDocumentPosition(),r=e.session,i=r.getFoldAt(n.row,n.column,1);i&&(t.getAccelKey()?r.removeFold(i):r.expandFold(i),t.stop())}),e.on("gutterclick",function(t){var n=e.renderer.$gutterLayer.getRegion(t);if(n=="foldWidgets"){var r=t.getDocumentPosition().row,i=e.session;i.foldWidgets&&i.foldWidgets[r]&&e.session.onFoldWidgetClick(r,t),e.isFocused()||e.focus(),t.stop()}}),e.on("gutterdblclick",function(t){var n=e.renderer.$gutterLayer.getRegion(t);if(n=="foldWidgets"){var r=t.getDocumentPosition().row,i=e.session,s=i.getParentFoldRangeData(r,!0),o=s.range||s.firstRange;if(o){r=o.start.row;var u=i.getFoldAt(r,i.getLine(r).length,1);u?i.removeFold(u):(i.addFold("...",o),e.renderer.scrollCursorIntoView({row:o.start.row,column:0}))}t.stop()}})}t.FoldHandler=r}),define("ace/keyboard/keybinding",["require","exports","module","ace/lib/keys","ace/lib/event"],function(e,t,n){"use strict";var r=e("../lib/keys"),i=e("../lib/event"),s=function(e){this.$editor=e,this.$data={editor:e},this.$handlers=[],this.setDefaultHandler(e.commands)};(function(){this.setDefaultHandler=function(e){this.removeKeyboardHandler(this.$defaultHandler),this.$defaultHandler=e,this.addKeyboardHandler(e,0)},this.setKeyboardHandler=function(e){var t=this.$handlers;if(t[t.length-1]==e)return;while(t[t.length-1]&&t[t.length-1]!=this.$defaultHandler)this.removeKeyboardHandler(t[t.length-1]);this.addKeyboardHandler(e,1)},this.addKeyboardHandler=function(e,t){if(!e)return;typeof e=="function"&&!e.handleKeyboard&&(e.handleKeyboard=e);var n=this.$handlers.indexOf(e);n!=-1&&this.$handlers.splice(n,1),t==undefined?this.$handlers.push(e):this.$handlers.splice(t,0,e),n==-1&&e.attach&&e.attach(this.$editor)},this.removeKeyboardHandler=function(e){var t=this.$handlers.indexOf(e);return t==-1?!1:(this.$handlers.splice(t,1),e.detach&&e.detach(this.$editor),!0)},this.getKeyboardHandler=function(){return this.$handlers[this.$handlers.length-1]},this.getStatusText=function(){var e=this.$data,t=e.editor;return this.$handlers.map(function(n){return n.getStatusText&&n.getStatusText(t,e)||""}).filter(Boolean).join(" ")},this.$callKeyboardHandlers=function(e,t,n,r){var s,o=!1,u=this.$editor.commands;for(var a=this.$handlers.length;a--;){s=this.$handlers[a].handleKeyboard(this.$data,e,t,n,r);if(!s||!s.command)continue;s.command=="null"?o=!0:o=u.exec(s.command,this.$editor,s.args,r),o&&r&&e!=-1&&s.passEvent!=1&&s.command.passEvent!=1&&i.stopEvent(r);if(o)break}return!o&&e==-1&&(s={command:"insertstring"},o=u.exec("insertstring",this.$editor,t)),o&&this.$editor._signal&&this.$editor._signal("keyboardActivity",s),o},this.onCommandKey=function(e,t,n){var i=r.keyCodeToString(n);this.$callKeyboardHandlers(t,i,n,e)},this.onTextInput=function(e){this.$callKeyboardHandlers(-1,e)}}).call(s.prototype),t.KeyBinding=s}),define("ace/lib/bidiutil",["require","exports","module"],function(e,t,n){"use strict";function F(e,t,n,r){var i=s?d:p,c=null,h=null,v=null,m=0,g=null,y=null,b=-1,w=null,E=null,T=[];if(!r)for(w=0,r=[];w<n;w++)r[w]=R(e[w]);o=s,u=!1,a=!1,f=!1,l=!1;for(E=0;E<n;E++){c=m,T[E]=h=q(e,r,T,E),m=i[c][h],g=m&240,m&=15,t[E]=v=i[m][5];if(g>0)if(g==16){for(w=b;w<E;w++)t[w]=1;b=-1}else b=-1;y=i[m][6];if(y)b==-1&&(b=E);else if(b>-1){for(w=b;w<E;w++)t[w]=v;b=-1}r[E]==S&&(t[E]=0),o|=v}if(l)for(w=0;w<n;w++)if(r[w]==x){t[w]=s;for(var C=w-1;C>=0;C--){if(r[C]!=N)break;t[C]=s}}}function I(e,t,n){if(o<e)return;if(e==1&&s==m&&!f){n.reverse();return}var r=n.length,i=0,u,a,l,c;while(i<r){if(t[i]>=e){u=i+1;while(u<r&&t[u]>=e)u++;for(a=i,l=u-1;a<l;a++,l--)c=n[a],n[a]=n[l],n[l]=c;i=u}i++}}function q(e,t,n,r){var i=t[r],o,c,h,p;switch(i){case g:case y:u=!1;case E:case w:return i;case b:return u?w:b;case T:return u=!0,a=!0,y;case N:return E;case C:if(r<1||r+1>=t.length||(o=n[r-1])!=b&&o!=w||(c=t[r+1])!=b&&c!=w)return E;return u&&(c=w),c==o?c:E;case k:o=r>0?n[r-1]:S;if(o==b&&r+1<t.length&&t[r+1]==b)return b;return E;case L:if(r>0&&n[r-1]==b)return b;if(u)return E;p=r+1,h=t.length;while(p<h&&t[p]==L)p++;if(p<h&&t[p]==b)return b;return E;case A:h=t.length,p=r+1;while(p<h&&t[p]==A)p++;if(p<h){var d=e[r],v=d>=1425&&d<=2303||d==64286;o=t[p];if(v&&(o==y||o==T))return y}if(r<1||(o=t[r-1])==S)return E;return n[r-1];case S:return u=!1,f=!0,s;case x:return l=!0,E;case O:case M:case D:case P:case _:u=!1;case H:return E}}function R(e){var t=e.charCodeAt(0),n=t>>8;return n==0?t>191?g:B[t]:n==5?/[\u0591-\u05f4]/.test(e)?y:g:n==6?/[\u0610-\u061a\u064b-\u065f\u06d6-\u06e4\u06e7-\u06ed]/.test(e)?A:/[\u0660-\u0669\u066b-\u066c]/.test(e)?w:t==1642?L:/[\u06f0-\u06f9]/.test(e)?b:T:n==32&&t<=8287?j[t&255]:n==254?t>=65136?T:E:E}function U(e){return e>="\u064b"&&e<="\u0655"}var r=["\u0621","\u0641"],i=["\u063a","\u064a"],s=0,o=0,u=!1,a=!1,f=!1,l=!1,c=!1,h=!1,p=[[0,3,0,1,0,0,0],[0,3,0,1,2,2,0],[0,3,0,17,2,0,1],[0,3,5,5,4,1,0],[0,3,21,21,4,0,1],[0,3,5,5,4,2,0]],d=[[2,0,1,1,0,1,0],[2,0,1,1,0,2,0],[2,0,2,1,3,2,0],[2,0,2,33,3,1,1]],v=0,m=1,g=0,y=1,b=2,w=3,E=4,S=5,x=6,T=7,N=8,C=9,k=10,L=11,A=12,O=13,M=14,_=15,D=16,P=17,H=18,B=[H,H,H,H,H,H,H,H,H,x,S,x,N,S,H,H,H,H,H,H,H,H,H,H,H,H,H,H,S,S,S,x,N,E,E,L,L,L,E,E,E,E,E,k,C,k,C,C,b,b,b,b,b,b,b,b,b,b,C,E,E,E,E,E,E,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,E,E,E,E,E,E,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,E,E,E,E,H,H,H,H,H,H,S,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,C,E,L,L,L,L,E,E,E,E,g,E,E,H,E,E,L,L,b,b,E,g,E,E,E,b,g,E,E,E,E,E],j=[N,N,N,N,N,N,N,N,N,N,N,H,H,H,g,y,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,N,S,O,M,_,D,P,C,L,L,L,L,L,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,C,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,N];t.L=g,t.R=y,t.EN=b,t.ON_R=3,t.AN=4,t.R_H=5,t.B=6,t.DOT="\u00b7",t.doBidiReorder=function(e,n,r){if(e.length<2)return{};var i=e.split(""),o=new Array(i.length),u=new Array(i.length),a=[];s=r?m:v,F(i,a,i.length,n);for(var f=0;f<o.length;o[f]=f,f++);I(2,a,o),I(1,a,o);for(var f=0;f<o.length-1;f++)n[f]===w?a[f]=t.AN:a[f]===y&&(n[f]>T&&n[f]<O||n[f]===E||n[f]===H)?a[f]=t.ON_R:f>0&&i[f-1]==="\u0644"&&/\u0622|\u0623|\u0625|\u0627/.test(i[f])&&(a[f-1]=a[f]=t.R_H,f++);i[i.length-1]===t.DOT&&(a[i.length-1]=t.B);for(var f=0;f<o.length;f++)u[f]=a[o[f]];return{logicalFromVisual:o,bidiLevels:u}},t.hasBidiCharacters=function(e,t){var n=!1;for(var r=0;r<e.length;r++)t[r]=R(e.charAt(r)),!n&&(t[r]==y||t[r]==T)&&(n=!0);return n},t.getVisualFromLogicalIdx=function(e,t){for(var n=0;n<t.logicalFromVisual.length;n++)if(t.logicalFromVisual[n]==e)return n;return 0}}),define("ace/bidihandler",["require","exports","module","ace/lib/bidiutil","ace/lib/lang","ace/lib/useragent"],function(e,t,n){"use strict";var r=e("./lib/bidiutil"),i=e("./lib/lang"),s=e("./lib/useragent"),o=/[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/,u=function(e){this.session=e,this.bidiMap={},this.currentRow=null,this.bidiUtil=r,this.charWidths=[],this.EOL="\u00ac",this.showInvisibles=!0,this.isRtlDir=!1,this.line="",this.wrapIndent=0,this.isLastRow=!1,this.EOF="\u00b6",this.seenBidi=!1};(function(){this.isBidiRow=function(e,t,n){return this.seenBidi?(e!==this.currentRow&&(this.currentRow=e,this.updateRowLine(t,n),this.updateBidiMap()),this.bidiMap.bidiLevels):!1},this.onChange=function(e){this.seenBidi?this.currentRow=null:e.action=="insert"&&o.test(e.lines.join("\n"))&&(this.seenBidi=!0,this.currentRow=null)},this.getDocumentRow=function(){var e=0,t=this.session.$screenRowCache;if(t.length){var n=this.session.$getRowCacheIndex(t,this.currentRow);n>=0&&(e=this.session.$docRowCache[n])}return e},this.getSplitIndex=function(){var e=0,t=this.session.$screenRowCache;if(t.length){var n,r=this.session.$getRowCacheIndex(t,this.currentRow);while(this.currentRow-e>0){n=this.session.$getRowCacheIndex(t,this.currentRow-e-1);if(n!==r)break;r=n,e++}}return e},this.updateRowLine=function(e,t){e===undefined&&(e=this.getDocumentRow()),this.wrapIndent=0,this.isLastRow=e===this.session.getLength()-1,this.line=this.session.getLine(e);if(this.session.$useWrapMode){var n=this.session.$wrapData[e];n&&(t===undefined&&(t=this.getSplitIndex()),t>0&&n.length?(this.wrapIndent=n.indent,this.line=t<n.length?this.line.substring(n[t-1],n[n.length-1]):this.line.substring(n[n.length-1])):this.line=this.line.substring(0,n[t]))}var s=this.session,o=0,u;this.line=this.line.replace(/\t|[\u1100-\u2029, \u202F-\uFFE6]/g,function(e,t){return e==="	"||s.isFullWidth(e.charCodeAt(0))?(u=e==="	"?s.getScreenTabSize(t+o):2,o+=u-1,i.stringRepeat(r.DOT,u)):e})},this.updateBidiMap=function(){var e=[],t=this.isLastRow?this.EOF:this.EOL,n=this.line+(this.showInvisibles?t:r.DOT);r.hasBidiCharacters(n,e)?this.bidiMap=r.doBidiReorder(n,e,this.isRtlDir):this.bidiMap={}},this.markAsDirty=function(){this.currentRow=null},this.updateCharacterWidths=function(e){if(!this.seenBidi)return;if(this.characterWidth===e.$characterSize.width)return;var t=this.characterWidth=e.$characterSize.width,n=e.$measureCharWidth("\u05d4");this.charWidths[r.L]=this.charWidths[r.EN]=this.charWidths[r.ON_R]=t,this.charWidths[r.R]=this.charWidths[r.AN]=n,this.charWidths[r.R_H]=s.isChrome?n:n*.45,this.charWidths[r.B]=0,this.currentRow=null},this.getShowInvisibles=function(){return this.showInvisibles},this.setShowInvisibles=function(e){this.showInvisibles=e,this.currentRow=null},this.setEolChar=function(e){this.EOL=e},this.setTextDir=function(e){this.isRtlDir=e},this.getPosLeft=function(e){e-=this.wrapIndent;var t=r.getVisualFromLogicalIdx(e>0?e-1:0,this.bidiMap),n=this.bidiMap.bidiLevels,i=0;e===0&&n[t]%2!==0&&t++;for(var s=0;s<t;s++)i+=this.charWidths[n[s]];return e!==0&&n[t]%2===0&&(i+=this.charWidths[n[t]]),this.wrapIndent&&(i+=this.wrapIndent*this.charWidths[r.L]),i},this.getSelections=function(e,t){var n=this.bidiMap,i=n.bidiLevels,s,o=this.wrapIndent*this.charWidths[r.L],u=[],a=Math.min(e,t)-this.wrapIndent,f=Math.max(e,t)-this.wrapIndent,l=!1,c=!1,h=0;for(var p,d=0;d<i.length;d++)p=n.logicalFromVisual[d],s=i[d],l=p>=a&&p<f,l&&!c?h=o:!l&&c&&u.push({left:h,width:o-h}),o+=this.charWidths[s],c=l;return l&&d===i.length&&u.push({left:h,width:o-h}),u},this.offsetToCol=function(e){var t=0,e=Math.max(e,0),n=0,i=0,s=this.bidiMap.bidiLevels,o=this.charWidths[s[i]];this.wrapIndent&&(e-=this.wrapIndent*this.charWidths[r.L]);while(e>n+o/2){n+=o;if(i===s.length-1){o=0;break}o=this.charWidths[s[++i]]}return i>0&&s[i-1]%2!==0&&s[i]%2===0?(e<n&&i--,t=this.bidiMap.logicalFromVisual[i]):i>0&&s[i-1]%2===0&&s[i]%2!==0?t=1+(e>n?this.bidiMap.logicalFromVisual[i]:this.bidiMap.logicalFromVisual[i-1]):this.isRtlDir&&i===s.length-1&&o===0&&s[i-1]%2===0||!this.isRtlDir&&i===0&&s[i]%2!==0?t=1+this.bidiMap.logicalFromVisual[i]:(i>0&&s[i-1]%2!==0&&o!==0&&i--,t=this.bidiMap.logicalFromVisual[i]),t+this.wrapIndent}}).call(u.prototype),t.BidiHandler=u}),define("ace/range",["require","exports","module"],function(e,t,n){"use strict";var r=function(e,t){return e.row-t.row||e.column-t.column},i=function(e,t,n,r){this.start={row:e,column:t},this.end={row:n,column:r}};(function(){this.isEqual=function(e){return this.start.row===e.start.row&&this.end.row===e.end.row&&this.start.column===e.start.column&&this.end.column===e.end.column},this.toString=function(){return"Range: ["+this.start.row+"/"+this.start.column+"] -> ["+this.end.row+"/"+this.end.column+"]"},this.contains=function(e,t){return this.compare(e,t)==0},this.compareRange=function(e){var t,n=e.end,r=e.start;return t=this.compare(n.row,n.column),t==1?(t=this.compare(r.row,r.column),t==1?2:t==0?1:0):t==-1?-2:(t=this.compare(r.row,r.column),t==-1?-1:t==1?42:0)},this.comparePoint=function(e){return this.compare(e.row,e.column)},this.containsRange=function(e){return this.comparePoint(e.start)==0&&this.comparePoint(e.end)==0},this.intersects=function(e){var t=this.compareRange(e);return t==-1||t==0||t==1},this.isEnd=function(e,t){return this.end.row==e&&this.end.column==t},this.isStart=function(e,t){return this.start.row==e&&this.start.column==t},this.setStart=function(e,t){typeof e=="object"?(this.start.column=e.column,this.start.row=e.row):(this.start.row=e,this.start.column=t)},this.setEnd=function(e,t){typeof e=="object"?(this.end.column=e.column,this.end.row=e.row):(this.end.row=e,this.end.column=t)},this.inside=function(e,t){return this.compare(e,t)==0?this.isEnd(e,t)||this.isStart(e,t)?!1:!0:!1},this.insideStart=function(e,t){return this.compare(e,t)==0?this.isEnd(e,t)?!1:!0:!1},this.insideEnd=function(e,t){return this.compare(e,t)==0?this.isStart(e,t)?!1:!0:!1},this.compare=function(e,t){return!this.isMultiLine()&&e===this.start.row?t<this.start.column?-1:t>this.end.column?1:0:e<this.start.row?-1:e>this.end.row?1:this.start.row===e?t>=this.start.column?0:-1:this.end.row===e?t<=this.end.column?0:1:0},this.compareStart=function(e,t){return this.start.row==e&&this.start.column==t?-1:this.compare(e,t)},this.compareEnd=function(e,t){return this.end.row==e&&this.end.column==t?1:this.compare(e,t)},this.compareInside=function(e,t){return this.end.row==e&&this.end.column==t?1:this.start.row==e&&this.start.column==t?-1:this.compare(e,t)},this.clipRows=function(e,t){if(this.end.row>t)var n={row:t+1,column:0};else if(this.end.row<e)var n={row:e,column:0};if(this.start.row>t)var r={row:t+1,column:0};else if(this.start.row<e)var r={row:e,column:0};return i.fromPoints(r||this.start,n||this.end)},this.extend=function(e,t){var n=this.compare(e,t);if(n==0)return this;if(n==-1)var r={row:e,column:t};else var s={row:e,column:t};return i.fromPoints(r||this.start,s||this.end)},this.isEmpty=function(){return this.start.row===this.end.row&&this.start.column===this.end.column},this.isMultiLine=function(){return this.start.row!==this.end.row},this.clone=function(){return i.fromPoints(this.start,this.end)},this.collapseRows=function(){return this.end.column==0?new i(this.start.row,0,Math.max(this.start.row,this.end.row-1),0):new i(this.start.row,0,this.end.row,0)},this.toScreenRange=function(e){var t=e.documentToScreenPosition(this.start),n=e.documentToScreenPosition(this.end);return new i(t.row,t.column,n.row,n.column)},this.moveBy=function(e,t){this.start.row+=e,this.start.column+=t,this.end.row+=e,this.end.column+=t}}).call(i.prototype),i.fromPoints=function(e,t){return new i(e.row,e.column,t.row,t.column)},i.comparePoints=r,i.comparePoints=function(e,t){return e.row-t.row||e.column-t.column},t.Range=i}),define("ace/selection",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/lib/event_emitter","ace/range"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/lang"),s=e("./lib/event_emitter").EventEmitter,o=e("./range").Range,u=function(e){this.session=e,this.doc=e.getDocument(),this.clearSelection(),this.lead=this.selectionLead=this.doc.createAnchor(0,0),this.anchor=this.selectionAnchor=this.doc.createAnchor(0,0);var t=this;this.lead.on("change",function(e){t._emit("changeCursor"),t.$isEmpty||t._emit("changeSelection"),!t.$keepDesiredColumnOnChange&&e.old.column!=e.value.column&&(t.$desiredColumn=null)}),this.selectionAnchor.on("change",function(){t.$isEmpty||t._emit("changeSelection")})};(function(){r.implement(this,s),this.isEmpty=function(){return this.$isEmpty||this.anchor.row==this.lead.row&&this.anchor.column==this.lead.column},this.isMultiLine=function(){return this.isEmpty()?!1:this.getRange().isMultiLine()},this.getCursor=function(){return this.lead.getPosition()},this.setSelectionAnchor=function(e,t){this.anchor.setPosition(e,t),this.$isEmpty&&(this.$isEmpty=!1,this._emit("changeSelection"))},this.getSelectionAnchor=function(){return this.$isEmpty?this.getSelectionLead():this.anchor.getPosition()},this.getSelectionLead=function(){return this.lead.getPosition()},this.shiftSelection=function(e){if(this.$isEmpty){this.moveCursorTo(this.lead.row,this.lead.column+e);return}var t=this.getSelectionAnchor(),n=this.getSelectionLead(),r=this.isBackwards();(!r||t.column!==0)&&this.setSelectionAnchor(t.row,t.column+e),(r||n.column!==0)&&this.$moveSelection(function(){this.moveCursorTo(n.row,n.column+e)})},this.isBackwards=function(){var e=this.anchor,t=this.lead;return e.row>t.row||e.row==t.row&&e.column>t.column},this.getRange=function(){var e=this.anchor,t=this.lead;return this.isEmpty()?o.fromPoints(t,t):this.isBackwards()?o.fromPoints(t,e):o.fromPoints(e,t)},this.clearSelection=function(){this.$isEmpty||(this.$isEmpty=!0,this._emit("changeSelection"))},this.selectAll=function(){var e=this.doc.getLength()-1;this.setSelectionAnchor(0,0),this.moveCursorTo(e,this.doc.getLine(e).length)},this.setRange=this.setSelectionRange=function(e,t){t?(this.setSelectionAnchor(e.end.row,e.end.column),this.selectTo(e.start.row,e.start.column)):(this.setSelectionAnchor(e.start.row,e.start.column),this.selectTo(e.end.row,e.end.column)),this.getRange().isEmpty()&&(this.$isEmpty=!0),this.$desiredColumn=null},this.$moveSelection=function(e){var t=this.lead;this.$isEmpty&&this.setSelectionAnchor(t.row,t.column),e.call(this)},this.selectTo=function(e,t){this.$moveSelection(function(){this.moveCursorTo(e,t)})},this.selectToPosition=function(e){this.$moveSelection(function(){this.moveCursorToPosition(e)})},this.moveTo=function(e,t){this.clearSelection(),this.moveCursorTo(e,t)},this.moveToPosition=function(e){this.clearSelection(),this.moveCursorToPosition(e)},this.selectUp=function(){this.$moveSelection(this.moveCursorUp)},this.selectDown=function(){this.$moveSelection(this.moveCursorDown)},this.selectRight=function(){this.$moveSelection(this.moveCursorRight)},this.selectLeft=function(){this.$moveSelection(this.moveCursorLeft)},this.selectLineStart=function(){this.$moveSelection(this.moveCursorLineStart)},this.selectLineEnd=function(){this.$moveSelection(this.moveCursorLineEnd)},this.selectFileEnd=function(){this.$moveSelection(this.moveCursorFileEnd)},this.selectFileStart=function(){this.$moveSelection(this.moveCursorFileStart)},this.selectWordRight=function(){this.$moveSelection(this.moveCursorWordRight)},this.selectWordLeft=function(){this.$moveSelection(this.moveCursorWordLeft)},this.getWordRange=function(e,t){if(typeof t=="undefined"){var n=e||this.lead;e=n.row,t=n.column}return this.session.getWordRange(e,t)},this.selectWord=function(){this.setSelectionRange(this.getWordRange())},this.selectAWord=function(){var e=this.getCursor(),t=this.session.getAWordRange(e.row,e.column);this.setSelectionRange(t)},this.getLineRange=function(e,t){var n=typeof e=="number"?e:this.lead.row,r,i=this.session.getFoldLine(n);return i?(n=i.start.row,r=i.end.row):r=n,t===!0?new o(n,0,r,this.session.getLine(r).length):new o(n,0,r+1,0)},this.selectLine=function(){this.setSelectionRange(this.getLineRange())},this.moveCursorUp=function(){this.moveCursorBy(-1,0)},this.moveCursorDown=function(){this.moveCursorBy(1,0)},this.wouldMoveIntoSoftTab=function(e,t,n){var r=e.column,i=e.column+t;return n<0&&(r=e.column-t,i=e.column),this.session.isTabStop(e)&&this.doc.getLine(e.row).slice(r,i).split(" ").length-1==t},this.moveCursorLeft=function(){var e=this.lead.getPosition(),t;if(t=this.session.getFoldAt(e.row,e.column,-1))this.moveCursorTo(t.start.row,t.start.column);else if(e.column===0)e.row>0&&this.moveCursorTo(e.row-1,this.doc.getLine(e.row-1).length);else{var n=this.session.getTabSize();this.wouldMoveIntoSoftTab(e,n,-1)&&!this.session.getNavigateWithinSoftTabs()?this.moveCursorBy(0,-n):this.moveCursorBy(0,-1)}},this.moveCursorRight=function(){var e=this.lead.getPosition(),t;if(t=this.session.getFoldAt(e.row,e.column,1))this.moveCursorTo(t.end.row,t.end.column);else if(this.lead.column==this.doc.getLine(this.lead.row).length)this.lead.row<this.doc.getLength()-1&&this.moveCursorTo(this.lead.row+1,0);else{var n=this.session.getTabSize(),e=this.lead;this.wouldMoveIntoSoftTab(e,n,1)&&!this.session.getNavigateWithinSoftTabs()?this.moveCursorBy(0,n):this.moveCursorBy(0,1)}},this.moveCursorLineStart=function(){var e=this.lead.row,t=this.lead.column,n=this.session.documentToScreenRow(e,t),r=this.session.screenToDocumentPosition(n,0),i=this.session.getDisplayLine(e,null,r.row,r.column),s=i.match(/^\s*/);s[0].length!=t&&!this.session.$useEmacsStyleLineStart&&(r.column+=s[0].length),this.moveCursorToPosition(r)},this.moveCursorLineEnd=function(){var e=this.lead,t=this.session.getDocumentLastRowColumnPosition(e.row,e.column);if(this.lead.column==t.column){var n=this.session.getLine(t.row);if(t.column==n.length){var r=n.search(/\s+$/);r>0&&(t.column=r)}}this.moveCursorTo(t.row,t.column)},this.moveCursorFileEnd=function(){var e=this.doc.getLength()-1,t=this.doc.getLine(e).length;this.moveCursorTo(e,t)},this.moveCursorFileStart=function(){this.moveCursorTo(0,0)},this.moveCursorLongWordRight=function(){var e=this.lead.row,t=this.lead.column,n=this.doc.getLine(e),r=n.substring(t),i;this.session.nonTokenRe.lastIndex=0,this.session.tokenRe.lastIndex=0;var s=this.session.getFoldAt(e,t,1);if(s){this.moveCursorTo(s.end.row,s.end.column);return}if(i=this.session.nonTokenRe.exec(r))t+=this.session.nonTokenRe.lastIndex,this.session.nonTokenRe.lastIndex=0,r=n.substring(t);if(t>=n.length){this.moveCursorTo(e,n.length),this.moveCursorRight(),e<this.doc.getLength()-1&&this.moveCursorWordRight();return}if(i=this.session.tokenRe.exec(r))t+=this.session.tokenRe.lastIndex,this.session.tokenRe.lastIndex=0;this.moveCursorTo(e,t)},this.moveCursorLongWordLeft=function(){var e=this.lead.row,t=this.lead.column,n;if(n=this.session.getFoldAt(e,t,-1)){this.moveCursorTo(n.start.row,n.start.column);return}var r=this.session.getFoldStringAt(e,t,-1);r==null&&(r=this.doc.getLine(e).substring(0,t));var s=i.stringReverse(r),o;this.session.nonTokenRe.lastIndex=0,this.session.tokenRe.lastIndex=0;if(o=this.session.nonTokenRe.exec(s))t-=this.session.nonTokenRe.lastIndex,s=s.slice(this.session.nonTokenRe.lastIndex),this.session.nonTokenRe.lastIndex=0;if(t<=0){this.moveCursorTo(e,0),this.moveCursorLeft(),e>0&&this.moveCursorWordLeft();return}if(o=this.session.tokenRe.exec(s))t-=this.session.tokenRe.lastIndex,this.session.tokenRe.lastIndex=0;this.moveCursorTo(e,t)},this.$shortWordEndIndex=function(e){var t,n=0,r,i=/\s/,s=this.session.tokenRe;s.lastIndex=0;if(t=this.session.tokenRe.exec(e))n=this.session.tokenRe.lastIndex;else{while((r=e[n])&&i.test(r))n++;if(n<1){s.lastIndex=0;while((r=e[n])&&!s.test(r)){s.lastIndex=0,n++;if(i.test(r)){if(n>2){n--;break}while((r=e[n])&&i.test(r))n++;if(n>2)break}}}}return s.lastIndex=0,n},this.moveCursorShortWordRight=function(){var e=this.lead.row,t=this.lead.column,n=this.doc.getLine(e),r=n.substring(t),i=this.session.getFoldAt(e,t,1);if(i)return this.moveCursorTo(i.end.row,i.end.column);if(t==n.length){var s=this.doc.getLength();do e++,r=this.doc.getLine(e);while(e<s&&/^\s*$/.test(r));/^\s+/.test(r)||(r=""),t=0}var o=this.$shortWordEndIndex(r);this.moveCursorTo(e,t+o)},this.moveCursorShortWordLeft=function(){var e=this.lead.row,t=this.lead.column,n;if(n=this.session.getFoldAt(e,t,-1))return this.moveCursorTo(n.start.row,n.start.column);var r=this.session.getLine(e).substring(0,t);if(t===0){do e--,r=this.doc.getLine(e);while(e>0&&/^\s*$/.test(r));t=r.length,/\s+$/.test(r)||(r="")}var s=i.stringReverse(r),o=this.$shortWordEndIndex(s);return this.moveCursorTo(e,t-o)},this.moveCursorWordRight=function(){this.session.$selectLongWords?this.moveCursorLongWordRight():this.moveCursorShortWordRight()},this.moveCursorWordLeft=function(){this.session.$selectLongWords?this.moveCursorLongWordLeft():this.moveCursorShortWordLeft()},this.moveCursorBy=function(e,t){var n=this.session.documentToScreenPosition(this.lead.row,this.lead.column),r;t===0&&(e!==0&&(this.session.$bidiHandler.isBidiRow(n.row,this.lead.row)?(r=this.session.$bidiHandler.getPosLeft(n.column),n.column=Math.round(r/this.session.$bidiHandler.charWidths[0])):r=n.column*this.session.$bidiHandler.charWidths[0]),this.$desiredColumn?n.column=this.$desiredColumn:this.$desiredColumn=n.column);var i=this.session.screenToDocumentPosition(n.row+e,n.column,r);e!==0&&t===0&&i.row===this.lead.row&&i.column===this.lead.column&&this.session.lineWidgets&&this.session.lineWidgets[i.row]&&(i.row>0||e>0)&&i.row++,this.moveCursorTo(i.row,i.column+t,t===0)},this.moveCursorToPosition=function(e){this.moveCursorTo(e.row,e.column)},this.moveCursorTo=function(e,t,n){var r=this.session.getFoldAt(e,t,1);r&&(e=r.start.row,t=r.start.column),this.$keepDesiredColumnOnChange=!0;var i=this.session.getLine(e);/[\uDC00-\uDFFF]/.test(i.charAt(t))&&i.charAt(t-1)&&(this.lead.row==e&&this.lead.column==t+1?t-=1:t+=1),this.lead.setPosition(e,t),this.$keepDesiredColumnOnChange=!1,n||(this.$desiredColumn=null)},this.moveCursorToScreen=function(e,t,n){var r=this.session.screenToDocumentPosition(e,t);this.moveCursorTo(r.row,r.column,n)},this.detach=function(){this.lead.detach(),this.anchor.detach(),this.session=this.doc=null},this.fromOrientedRange=function(e){this.setSelectionRange(e,e.cursor==e.start),this.$desiredColumn=e.desiredColumn||this.$desiredColumn},this.toOrientedRange=function(e){var t=this.getRange();return e?(e.start.column=t.start.column,e.start.row=t.start.row,e.end.column=t.end.column,e.end.row=t.end.row):e=t,e.cursor=this.isBackwards()?e.start:e.end,e.desiredColumn=this.$desiredColumn,e},this.getRangeOfMovements=function(e){var t=this.getCursor();try{e(this);var n=this.getCursor();return o.fromPoints(t,n)}catch(r){return o.fromPoints(t,t)}finally{this.moveCursorToPosition(t)}},this.toJSON=function(){if(this.rangeCount)var e=this.ranges.map(function(e){var t=e.clone();return t.isBackwards=e.cursor==e.start,t});else{var e=this.getRange();e.isBackwards=this.isBackwards()}return e},this.fromJSON=function(e){if(e.start==undefined){if(this.rangeList){this.toSingleRange(e[0]);for(var t=e.length;t--;){var n=o.fromPoints(e[t].start,e[t].end);e[t].isBackwards&&(n.cursor=n.start),this.addRange(n,!0)}return}e=e[0]}this.rangeList&&this.toSingleRange(e),this.setSelectionRange(e,e.isBackwards)},this.isEqual=function(e){if((e.length||this.rangeCount)&&e.length!=this.rangeCount)return!1;if(!e.length||!this.ranges)return this.getRange().isEqual(e);for(var t=this.ranges.length;t--;)if(!this.ranges[t].isEqual(e[t]))return!1;return!0}}).call(u.prototype),t.Selection=u}),define("ace/tokenizer",["require","exports","module","ace/config"],function(e,t,n){"use strict";var r=e("./config"),i=2e3,s=function(e){this.states=e,this.regExps={},this.matchMappings={};for(var t in this.states){var n=this.states[t],r=[],i=0,s=this.matchMappings[t]={defaultToken:"text"},o="g",u=[];for(var a=0;a<n.length;a++){var f=n[a];f.defaultToken&&(s.defaultToken=f.defaultToken),f.caseInsensitive&&(o="gi");if(f.regex==null)continue;f.regex instanceof RegExp&&(f.regex=f.regex.toString().slice(1,-1));var l=f.regex,c=(new RegExp("(?:("+l+")|(.))")).exec("a").length-2;Array.isArray(f.token)?f.token.length==1||c==1?f.token=f.token[0]:c-1!=f.token.length?(this.reportError("number of classes and regexp groups doesn't match",{rule:f,groupCount:c-1}),f.token=f.token[0]):(f.tokenArray=f.token,f.token=null,f.onMatch=this.$arrayTokens):typeof f.token=="function"&&!f.onMatch&&(c>1?f.onMatch=this.$applyToken:f.onMatch=f.token),c>1&&(/\\\d/.test(f.regex)?l=f.regex.replace(/\\([0-9]+)/g,function(e,t){return"\\"+(parseInt(t,10)+i+1)}):(c=1,l=this.removeCapturingGroups(f.regex)),!f.splitRegex&&typeof f.token!="string"&&u.push(f)),s[i]=a,i+=c,r.push(l),f.onMatch||(f.onMatch=null)}r.length||(s[0]=0,r.push("$")),u.forEach(function(e){e.splitRegex=this.createSplitterRegexp(e.regex,o)},this),this.regExps[t]=new RegExp("("+r.join(")|(")+")|($)",o)}};(function(){this.$setMaxTokenCount=function(e){i=e|0},this.$applyToken=function(e){var t=this.splitRegex.exec(e).slice(1),n=this.token.apply(this,t);if(typeof n=="string")return[{type:n,value:e}];var r=[];for(var i=0,s=n.length;i<s;i++)t[i]&&(r[r.length]={type:n[i],value:t[i]});return r},this.$arrayTokens=function(e){if(!e)return[];var t=this.splitRegex.exec(e);if(!t)return"text";var n=[],r=this.tokenArray;for(var i=0,s=r.length;i<s;i++)t[i+1]&&(n[n.length]={type:r[i],value:t[i+1]});return n},this.removeCapturingGroups=function(e){var t=e.replace(/\[(?:\\.|[^\]])*?\]|\\.|\(\?[:=!]|(\()/g,function(e,t){return t?"(?:":e});return t},this.createSplitterRegexp=function(e,t){if(e.indexOf("(?=")!=-1){var n=0,r=!1,i={};e.replace(/(\\.)|(\((?:\?[=!])?)|(\))|([\[\]])/g,function(e,t,s,o,u,a){return r?r=u!="]":u?r=!0:o?(n==i.stack&&(i.end=a+1,i.stack=-1),n--):s&&(n++,s.length!=1&&(i.stack=n,i.start=a)),e}),i.end!=null&&/^\)*$/.test(e.substr(i.end))&&(e=e.substring(0,i.start)+e.substr(i.end))}return e.charAt(0)!="^"&&(e="^"+e),e.charAt(e.length-1)!="$"&&(e+="$"),new RegExp(e,(t||"").replace("g",""))},this.getLineTokens=function(e,t){if(t&&typeof t!="string"){var n=t.slice(0);t=n[0],t==="#tmp"&&(n.shift(),t=n.shift())}else var n=[];var r=t||"start",s=this.states[r];s||(r="start",s=this.states[r]);var o=this.matchMappings[r],u=this.regExps[r];u.lastIndex=0;var a,f=[],l=0,c=0,h={type:null,value:""};while(a=u.exec(e)){var p=o.defaultToken,d=null,v=a[0],m=u.lastIndex;if(m-v.length>l){var g=e.substring(l,m-v.length);h.type==p?h.value+=g:(h.type&&f.push(h),h={type:p,value:g})}for(var y=0;y<a.length-2;y++){if(a[y+1]===undefined)continue;d=s[o[y]],d.onMatch?p=d.onMatch(v,r,n,e):p=d.token,d.next&&(typeof d.next=="string"?r=d.next:r=d.next(r,n),s=this.states[r],s||(this.reportError("state doesn't exist",r),r="start",s=this.states[r]),o=this.matchMappings[r],l=m,u=this.regExps[r],u.lastIndex=m),d.consumeLineEnd&&(l=m);break}if(v)if(typeof p=="string")!!d&&d.merge===!1||h.type!==p?(h.type&&f.push(h),h={type:p,value:v}):h.value+=v;else if(p){h.type&&f.push(h),h={type:null,value:""};for(var y=0;y<p.length;y++)f.push(p[y])}if(l==e.length)break;l=m;if(c++>i){c>2*e.length&&this.reportError("infinite loop with in ace tokenizer",{startState:t,line:e});while(l<e.length)h.type&&f.push(h),h={value:e.substring(l,l+=2e3),type:"overflow"};r="start",n=[];break}}return h.type&&f.push(h),n.length>1&&n[0]!==r&&n.unshift("#tmp",r),{tokens:f,state:n.length?n:r}},this.reportError=r.reportError}).call(s.prototype),t.Tokenizer=s}),define("ace/mode/text_highlight_rules",["require","exports","module","ace/lib/lang"],function(e,t,n){"use strict";var r=e("../lib/lang"),i=function(){this.$rules={start:[{token:"empty_line",regex:"^$"},{defaultToken:"text"}]}};(function(){this.addRules=function(e,t){if(!t){for(var n in e)this.$rules[n]=e[n];return}for(var n in e){var r=e[n];for(var i=0;i<r.length;i++){var s=r[i];if(s.next||s.onMatch)typeof s.next=="string"&&s.next.indexOf(t)!==0&&(s.next=t+s.next),s.nextState&&s.nextState.indexOf(t)!==0&&(s.nextState=t+s.nextState)}this.$rules[t+n]=r}},this.getRules=function(){return this.$rules},this.embedRules=function(e,t,n,i,s){var o=typeof e=="function"?(new e).getRules():e;if(i)for(var u=0;u<i.length;u++)i[u]=t+i[u];else{i=[];for(var a in o)i.push(t+a)}this.addRules(o,t);if(n){var f=Array.prototype[s?"push":"unshift"];for(var u=0;u<i.length;u++)f.apply(this.$rules[i[u]],r.deepCopy(n))}this.$embeds||(this.$embeds=[]),this.$embeds.push(t)},this.getEmbeds=function(){return this.$embeds};var e=function(e,t){return(e!="start"||t.length)&&t.unshift(this.nextState,e),this.nextState},t=function(e,t){return t.shift(),t.shift()||"start"};this.normalizeRules=function(){function i(s){var o=r[s];o.processed=!0;for(var u=0;u<o.length;u++){var a=o[u],f=null;Array.isArray(a)&&(f=a,a={}),!a.regex&&a.start&&(a.regex=a.start,a.next||(a.next=[]),a.next.push({defaultToken:a.token},{token:a.token+".end",regex:a.end||a.start,next:"pop"}),a.token=a.token+".start",a.push=!0);var l=a.next||a.push;if(l&&Array.isArray(l)){var c=a.stateName;c||(c=a.token,typeof c!="string"&&(c=c[0]||""),r[c]&&(c+=n++)),r[c]=l,a.next=c,i(c)}else l=="pop"&&(a.next=t);a.push&&(a.nextState=a.next||a.push,a.next=e,delete a.push);if(a.rules)for(var h in a.rules)r[h]?r[h].push&&r[h].push.apply(r[h],a.rules[h]):r[h]=a.rules[h];var p=typeof a=="string"?a:a.include;p&&(Array.isArray(p)?f=p.map(function(e){return r[e]}):f=r[p]);if(f){var d=[u,1].concat(f);a.noEscape&&(d=d.filter(function(e){return!e.next})),o.splice.apply(o,d),u--}a.keywordMap&&(a.token=this.createKeywordMapper(a.keywordMap,a.defaultToken||"text",a.caseInsensitive),delete a.defaultToken)}}var n=0,r=this.$rules;Object.keys(r).forEach(i,this)},this.createKeywordMapper=function(e,t,n,r){var i=Object.create(null);return Object.keys(e).forEach(function(t){var s=e[t];n&&(s=s.toLowerCase());var o=s.split(r||"|");for(var u=o.length;u--;)i[o[u]]=t}),Object.getPrototypeOf(i)&&(i.__proto__=null),this.$keywordList=Object.keys(i),e=null,n?function(e){return i[e.toLowerCase()]||t}:function(e){return i[e]||t}},this.getKeywords=function(){return this.$keywords}}).call(i.prototype),t.TextHighlightRules=i}),define("ace/mode/behaviour",["require","exports","module"],function(e,t,n){"use strict";var r=function(){this.$behaviours={}};(function(){this.add=function(e,t,n){switch(undefined){case this.$behaviours:this.$behaviours={};case this.$behaviours[e]:this.$behaviours[e]={}}this.$behaviours[e][t]=n},this.addBehaviours=function(e){for(var t in e)for(var n in e[t])this.add(t,n,e[t][n])},this.remove=function(e){this.$behaviours&&this.$behaviours[e]&&delete this.$behaviours[e]},this.inherit=function(e,t){if(typeof e=="function")var n=(new e).getBehaviours(t);else var n=e.getBehaviours(t);this.addBehaviours(n)},this.getBehaviours=function(e){if(!e)return this.$behaviours;var t={};for(var n=0;n<e.length;n++)this.$behaviours[e[n]]&&(t[e[n]]=this.$behaviours[e[n]]);return t}}).call(r.prototype),t.Behaviour=r}),define("ace/token_iterator",["require","exports","module","ace/range"],function(e,t,n){"use strict";var r=e("./range").Range,i=function(e,t,n){this.$session=e,this.$row=t,this.$rowTokens=e.getTokens(t);var r=e.getTokenAt(t,n);this.$tokenIndex=r?r.index:-1};(function(){this.stepBackward=function(){this.$tokenIndex-=1;while(this.$tokenIndex<0){this.$row-=1;if(this.$row<0)return this.$row=0,null;this.$rowTokens=this.$session.getTokens(this.$row),this.$tokenIndex=this.$rowTokens.length-1}return this.$rowTokens[this.$tokenIndex]},this.stepForward=function(){this.$tokenIndex+=1;var e;while(this.$tokenIndex>=this.$rowTokens.length){this.$row+=1,e||(e=this.$session.getLength());if(this.$row>=e)return this.$row=e-1,null;this.$rowTokens=this.$session.getTokens(this.$row),this.$tokenIndex=0}return this.$rowTokens[this.$tokenIndex]},this.getCurrentToken=function(){return this.$rowTokens[this.$tokenIndex]},this.getCurrentTokenRow=function(){return this.$row},this.getCurrentTokenColumn=function(){var e=this.$rowTokens,t=this.$tokenIndex,n=e[t].start;if(n!==undefined)return n;n=0;while(t>0)t-=1,n+=e[t].value.length;return n},this.getCurrentTokenPosition=function(){return{row:this.$row,column:this.getCurrentTokenColumn()}},this.getCurrentTokenRange=function(){var e=this.$rowTokens[this.$tokenIndex],t=this.getCurrentTokenColumn();return new r(this.$row,t,this.$row,t+e.value.length)}}).call(i.prototype),t.TokenIterator=i}),define("ace/mode/behaviour/cstyle",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/token_iterator","ace/lib/lang"],function(e,t,n){"use strict";var r=e("../../lib/oop"),i=e("../behaviour").Behaviour,s=e("../../token_iterator").TokenIterator,o=e("../../lib/lang"),u=["text","paren.rparen","punctuation.operator"],a=["text","paren.rparen","punctuation.operator","comment"],f,l={},c={'"':'"',"'":"'"},h=function(e){var t=-1;e.multiSelect&&(t=e.selection.index,l.rangeCount!=e.multiSelect.rangeCount&&(l={rangeCount:e.multiSelect.rangeCount}));if(l[t])return f=l[t];f=l[t]={autoInsertedBrackets:0,autoInsertedRow:-1,autoInsertedLineEnd:"",maybeInsertedBrackets:0,maybeInsertedRow:-1,maybeInsertedLineStart:"",maybeInsertedLineEnd:""}},p=function(e,t,n,r){var i=e.end.row-e.start.row;return{text:n+t+r,selection:[0,e.start.column+1,i,e.end.column+(i?0:1)]}},d=function(e){this.add("braces","insertion",function(t,n,r,i,s){var u=r.getCursorPosition(),a=i.doc.getLine(u.row);if(s=="{"){h(r);var l=r.getSelectionRange(),c=i.doc.getTextRange(l);if(c!==""&&c!=="{"&&r.getWrapBehavioursEnabled())return p(l,c,"{","}");if(d.isSaneInsertion(r,i))return/[\]\}\)]/.test(a[u.column])||r.inMultiSelectMode||e&&e.braces?(d.recordAutoInsert(r,i,"}"),{text:"{}",selection:[1,1]}):(d.recordMaybeInsert(r,i,"{"),{text:"{",selection:[1,1]})}else if(s=="}"){h(r);var v=a.substring(u.column,u.column+1);if(v=="}"){var m=i.$findOpeningBracket("}",{column:u.column+1,row:u.row});if(m!==null&&d.isAutoInsertedClosing(u,a,s))return d.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}else{if(s=="\n"||s=="\r\n"){h(r);var g="";d.isMaybeInsertedClosing(u,a)&&(g=o.stringRepeat("}",f.maybeInsertedBrackets),d.clearMaybeInsertedClosing());var v=a.substring(u.column,u.column+1);if(v==="}"){var y=i.findMatchingBracket({row:u.row,column:u.column+1},"}");if(!y)return null;var b=this.$getIndent(i.getLine(y.row))}else{if(!g){d.clearMaybeInsertedClosing();return}var b=this.$getIndent(a)}var w=b+i.getTabString();return{text:"\n"+w+"\n"+b+g,selection:[1,w.length,1,w.length]}}d.clearMaybeInsertedClosing()}}),this.add("braces","deletion",function(e,t,n,r,i){var s=r.doc.getTextRange(i);if(!i.isMultiLine()&&s=="{"){h(n);var o=r.doc.getLine(i.start.row),u=o.substring(i.end.column,i.end.column+1);if(u=="}")return i.end.column++,i;f.maybeInsertedBrackets--}}),this.add("parens","insertion",function(e,t,n,r,i){if(i=="("){h(n);var s=n.getSelectionRange(),o=r.doc.getTextRange(s);if(o!==""&&n.getWrapBehavioursEnabled())return p(s,o,"(",")");if(d.isSaneInsertion(n,r))return d.recordAutoInsert(n,r,")"),{text:"()",selection:[1,1]}}else if(i==")"){h(n);var u=n.getCursorPosition(),a=r.doc.getLine(u.row),f=a.substring(u.column,u.column+1);if(f==")"){var l=r.$findOpeningBracket(")",{column:u.column+1,row:u.row});if(l!==null&&d.isAutoInsertedClosing(u,a,i))return d.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}}),this.add("parens","deletion",function(e,t,n,r,i){var s=r.doc.getTextRange(i);if(!i.isMultiLine()&&s=="("){h(n);var o=r.doc.getLine(i.start.row),u=o.substring(i.start.column+1,i.start.column+2);if(u==")")return i.end.column++,i}}),this.add("brackets","insertion",function(e,t,n,r,i){if(i=="["){h(n);var s=n.getSelectionRange(),o=r.doc.getTextRange(s);if(o!==""&&n.getWrapBehavioursEnabled())return p(s,o,"[","]");if(d.isSaneInsertion(n,r))return d.recordAutoInsert(n,r,"]"),{text:"[]",selection:[1,1]}}else if(i=="]"){h(n);var u=n.getCursorPosition(),a=r.doc.getLine(u.row),f=a.substring(u.column,u.column+1);if(f=="]"){var l=r.$findOpeningBracket("]",{column:u.column+1,row:u.row});if(l!==null&&d.isAutoInsertedClosing(u,a,i))return d.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}}),this.add("brackets","deletion",function(e,t,n,r,i){var s=r.doc.getTextRange(i);if(!i.isMultiLine()&&s=="["){h(n);var o=r.doc.getLine(i.start.row),u=o.substring(i.start.column+1,i.start.column+2);if(u=="]")return i.end.column++,i}}),this.add("string_dquotes","insertion",function(e,t,n,r,i){var s=r.$mode.$quotes||c;if(i.length==1&&s[i]){if(this.lineCommentStart&&this.lineCommentStart.indexOf(i)!=-1)return;h(n);var o=i,u=n.getSelectionRange(),a=r.doc.getTextRange(u);if(a!==""&&(a.length!=1||!s[a])&&n.getWrapBehavioursEnabled())return p(u,a,o,o);if(!a){var f=n.getCursorPosition(),l=r.doc.getLine(f.row),d=l.substring(f.column-1,f.column),v=l.substring(f.column,f.column+1),m=r.getTokenAt(f.row,f.column),g=r.getTokenAt(f.row,f.column+1);if(d=="\\"&&m&&/escape/.test(m.type))return null;var y=m&&/string|escape/.test(m.type),b=!g||/string|escape/.test(g.type),w;if(v==o)w=y!==b,w&&/string\.end/.test(g.type)&&(w=!1);else{if(y&&!b)return null;if(y&&b)return null;var E=r.$mode.tokenRe;E.lastIndex=0;var S=E.test(d);E.lastIndex=0;var x=E.test(d);if(S||x)return null;if(v&&!/[\s;,.})\]\\]/.test(v))return null;w=!0}return{text:w?o+o:"",selection:[1,1]}}}}),this.add("string_dquotes","deletion",function(e,t,n,r,i){var s=r.doc.getTextRange(i);if(!i.isMultiLine()&&(s=='"'||s=="'")){h(n);var o=r.doc.getLine(i.start.row),u=o.substring(i.start.column+1,i.start.column+2);if(u==s)return i.end.column++,i}})};d.isSaneInsertion=function(e,t){var n=e.getCursorPosition(),r=new s(t,n.row,n.column);if(!this.$matchTokenType(r.getCurrentToken()||"text",u)){var i=new s(t,n.row,n.column+1);if(!this.$matchTokenType(i.getCurrentToken()||"text",u))return!1}return r.stepForward(),r.getCurrentTokenRow()!==n.row||this.$matchTokenType(r.getCurrentToken()||"text",a)},d.$matchTokenType=function(e,t){return t.indexOf(e.type||e)>-1},d.recordAutoInsert=function(e,t,n){var r=e.getCursorPosition(),i=t.doc.getLine(r.row);this.isAutoInsertedClosing(r,i,f.autoInsertedLineEnd[0])||(f.autoInsertedBrackets=0),f.autoInsertedRow=r.row,f.autoInsertedLineEnd=n+i.substr(r.column),f.autoInsertedBrackets++},d.recordMaybeInsert=function(e,t,n){var r=e.getCursorPosition(),i=t.doc.getLine(r.row);this.isMaybeInsertedClosing(r,i)||(f.maybeInsertedBrackets=0),f.maybeInsertedRow=r.row,f.maybeInsertedLineStart=i.substr(0,r.column)+n,f.maybeInsertedLineEnd=i.substr(r.column),f.maybeInsertedBrackets++},d.isAutoInsertedClosing=function(e,t,n){return f.autoInsertedBrackets>0&&e.row===f.autoInsertedRow&&n===f.autoInsertedLineEnd[0]&&t.substr(e.column)===f.autoInsertedLineEnd},d.isMaybeInsertedClosing=function(e,t){return f.maybeInsertedBrackets>0&&e.row===f.maybeInsertedRow&&t.substr(e.column)===f.maybeInsertedLineEnd&&t.substr(0,e.column)==f.maybeInsertedLineStart},d.popAutoInsertedClosing=function(){f.autoInsertedLineEnd=f.autoInsertedLineEnd.substr(1),f.autoInsertedBrackets--},d.clearMaybeInsertedClosing=function(){f&&(f.maybeInsertedBrackets=0,f.maybeInsertedRow=-1)},r.inherits(d,i),t.CstyleBehaviour=d}),define("ace/unicode",["require","exports","module"],function(e,t,n){"use strict";function r(e){var n=/\w{4}/g;for(var r in e)t.packages[r]=e[r].replace(n,"\\u$&")}t.packages={},r({L:"0041-005A0061-007A00AA00B500BA00C0-00D600D8-00F600F8-02C102C6-02D102E0-02E402EC02EE0370-037403760377037A-037D03860388-038A038C038E-03A103A3-03F503F7-0481048A-05250531-055605590561-058705D0-05EA05F0-05F20621-064A066E066F0671-06D306D506E506E606EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA07F407F507FA0800-0815081A082408280904-0939093D09500958-0961097109720979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10D05-0D0C0D0E-0D100D12-0D280D2A-0D390D3D0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E460E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EC60EDC0EDD0F000F40-0F470F49-0F6C0F88-0F8B1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10A0-10C510D0-10FA10FC1100-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317D717DC1820-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541AA71B05-1B331B45-1B4B1B83-1BA01BAE1BAF1C00-1C231C4D-1C4F1C5A-1C7D1CE9-1CEC1CEE-1CF11D00-1DBF1E00-1F151F18-1F1D1F20-1F451F48-1F4D1F50-1F571F591F5B1F5D1F5F-1F7D1F80-1FB41FB6-1FBC1FBE1FC2-1FC41FC6-1FCC1FD0-1FD31FD6-1FDB1FE0-1FEC1FF2-1FF41FF6-1FFC2071207F2090-209421022107210A-211321152119-211D212421262128212A-212D212F-2139213C-213F2145-2149214E218321842C00-2C2E2C30-2C5E2C60-2CE42CEB-2CEE2D00-2D252D30-2D652D6F2D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE2E2F300530063031-3035303B303C3041-3096309D-309F30A1-30FA30FC-30FF3105-312D3131-318E31A0-31B731F0-31FF3400-4DB54E00-9FCBA000-A48CA4D0-A4FDA500-A60CA610-A61FA62AA62BA640-A65FA662-A66EA67F-A697A6A0-A6E5A717-A71FA722-A788A78BA78CA7FB-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2A9CFAA00-AA28AA40-AA42AA44-AA4BAA60-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADB-AADDABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA2DFA30-FA6DFA70-FAD9FB00-FB06FB13-FB17FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF21-FF3AFF41-FF5AFF66-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",Ll:"0061-007A00AA00B500BA00DF-00F600F8-00FF01010103010501070109010B010D010F01110113011501170119011B011D011F01210123012501270129012B012D012F01310133013501370138013A013C013E014001420144014601480149014B014D014F01510153015501570159015B015D015F01610163016501670169016B016D016F0171017301750177017A017C017E-0180018301850188018C018D019201950199-019B019E01A101A301A501A801AA01AB01AD01B001B401B601B901BA01BD-01BF01C601C901CC01CE01D001D201D401D601D801DA01DC01DD01DF01E101E301E501E701E901EB01ED01EF01F001F301F501F901FB01FD01FF02010203020502070209020B020D020F02110213021502170219021B021D021F02210223022502270229022B022D022F02310233-0239023C023F0240024202470249024B024D024F-02930295-02AF037103730377037B-037D039003AC-03CE03D003D103D5-03D703D903DB03DD03DF03E103E303E503E703E903EB03ED03EF-03F303F503F803FB03FC0430-045F04610463046504670469046B046D046F04710473047504770479047B047D047F0481048B048D048F04910493049504970499049B049D049F04A104A304A504A704A904AB04AD04AF04B104B304B504B704B904BB04BD04BF04C204C404C604C804CA04CC04CE04CF04D104D304D504D704D904DB04DD04DF04E104E304E504E704E904EB04ED04EF04F104F304F504F704F904FB04FD04FF05010503050505070509050B050D050F05110513051505170519051B051D051F0521052305250561-05871D00-1D2B1D62-1D771D79-1D9A1E011E031E051E071E091E0B1E0D1E0F1E111E131E151E171E191E1B1E1D1E1F1E211E231E251E271E291E2B1E2D1E2F1E311E331E351E371E391E3B1E3D1E3F1E411E431E451E471E491E4B1E4D1E4F1E511E531E551E571E591E5B1E5D1E5F1E611E631E651E671E691E6B1E6D1E6F1E711E731E751E771E791E7B1E7D1E7F1E811E831E851E871E891E8B1E8D1E8F1E911E931E95-1E9D1E9F1EA11EA31EA51EA71EA91EAB1EAD1EAF1EB11EB31EB51EB71EB91EBB1EBD1EBF1EC11EC31EC51EC71EC91ECB1ECD1ECF1ED11ED31ED51ED71ED91EDB1EDD1EDF1EE11EE31EE51EE71EE91EEB1EED1EEF1EF11EF31EF51EF71EF91EFB1EFD1EFF-1F071F10-1F151F20-1F271F30-1F371F40-1F451F50-1F571F60-1F671F70-1F7D1F80-1F871F90-1F971FA0-1FA71FB0-1FB41FB61FB71FBE1FC2-1FC41FC61FC71FD0-1FD31FD61FD71FE0-1FE71FF2-1FF41FF61FF7210A210E210F2113212F21342139213C213D2146-2149214E21842C30-2C5E2C612C652C662C682C6A2C6C2C712C732C742C76-2C7C2C812C832C852C872C892C8B2C8D2C8F2C912C932C952C972C992C9B2C9D2C9F2CA12CA32CA52CA72CA92CAB2CAD2CAF2CB12CB32CB52CB72CB92CBB2CBD2CBF2CC12CC32CC52CC72CC92CCB2CCD2CCF2CD12CD32CD52CD72CD92CDB2CDD2CDF2CE12CE32CE42CEC2CEE2D00-2D25A641A643A645A647A649A64BA64DA64FA651A653A655A657A659A65BA65DA65FA663A665A667A669A66BA66DA681A683A685A687A689A68BA68DA68FA691A693A695A697A723A725A727A729A72BA72DA72F-A731A733A735A737A739A73BA73DA73FA741A743A745A747A749A74BA74DA74FA751A753A755A757A759A75BA75DA75FA761A763A765A767A769A76BA76DA76FA771-A778A77AA77CA77FA781A783A785A787A78CFB00-FB06FB13-FB17FF41-FF5A",Lu:"0041-005A00C0-00D600D8-00DE01000102010401060108010A010C010E01100112011401160118011A011C011E01200122012401260128012A012C012E01300132013401360139013B013D013F0141014301450147014A014C014E01500152015401560158015A015C015E01600162016401660168016A016C016E017001720174017601780179017B017D018101820184018601870189-018B018E-0191019301940196-0198019C019D019F01A001A201A401A601A701A901AC01AE01AF01B1-01B301B501B701B801BC01C401C701CA01CD01CF01D101D301D501D701D901DB01DE01E001E201E401E601E801EA01EC01EE01F101F401F6-01F801FA01FC01FE02000202020402060208020A020C020E02100212021402160218021A021C021E02200222022402260228022A022C022E02300232023A023B023D023E02410243-02460248024A024C024E03700372037603860388-038A038C038E038F0391-03A103A3-03AB03CF03D2-03D403D803DA03DC03DE03E003E203E403E603E803EA03EC03EE03F403F703F903FA03FD-042F04600462046404660468046A046C046E04700472047404760478047A047C047E0480048A048C048E04900492049404960498049A049C049E04A004A204A404A604A804AA04AC04AE04B004B204B404B604B804BA04BC04BE04C004C104C304C504C704C904CB04CD04D004D204D404D604D804DA04DC04DE04E004E204E404E604E804EA04EC04EE04F004F204F404F604F804FA04FC04FE05000502050405060508050A050C050E05100512051405160518051A051C051E0520052205240531-055610A0-10C51E001E021E041E061E081E0A1E0C1E0E1E101E121E141E161E181E1A1E1C1E1E1E201E221E241E261E281E2A1E2C1E2E1E301E321E341E361E381E3A1E3C1E3E1E401E421E441E461E481E4A1E4C1E4E1E501E521E541E561E581E5A1E5C1E5E1E601E621E641E661E681E6A1E6C1E6E1E701E721E741E761E781E7A1E7C1E7E1E801E821E841E861E881E8A1E8C1E8E1E901E921E941E9E1EA01EA21EA41EA61EA81EAA1EAC1EAE1EB01EB21EB41EB61EB81EBA1EBC1EBE1EC01EC21EC41EC61EC81ECA1ECC1ECE1ED01ED21ED41ED61ED81EDA1EDC1EDE1EE01EE21EE41EE61EE81EEA1EEC1EEE1EF01EF21EF41EF61EF81EFA1EFC1EFE1F08-1F0F1F18-1F1D1F28-1F2F1F38-1F3F1F48-1F4D1F591F5B1F5D1F5F1F68-1F6F1FB8-1FBB1FC8-1FCB1FD8-1FDB1FE8-1FEC1FF8-1FFB21022107210B-210D2110-211221152119-211D212421262128212A-212D2130-2133213E213F214521832C00-2C2E2C602C62-2C642C672C692C6B2C6D-2C702C722C752C7E-2C802C822C842C862C882C8A2C8C2C8E2C902C922C942C962C982C9A2C9C2C9E2CA02CA22CA42CA62CA82CAA2CAC2CAE2CB02CB22CB42CB62CB82CBA2CBC2CBE2CC02CC22CC42CC62CC82CCA2CCC2CCE2CD02CD22CD42CD62CD82CDA2CDC2CDE2CE02CE22CEB2CEDA640A642A644A646A648A64AA64CA64EA650A652A654A656A658A65AA65CA65EA662A664A666A668A66AA66CA680A682A684A686A688A68AA68CA68EA690A692A694A696A722A724A726A728A72AA72CA72EA732A734A736A738A73AA73CA73EA740A742A744A746A748A74AA74CA74EA750A752A754A756A758A75AA75CA75EA760A762A764A766A768A76AA76CA76EA779A77BA77DA77EA780A782A784A786A78BFF21-FF3A",Lt:"01C501C801CB01F21F88-1F8F1F98-1F9F1FA8-1FAF1FBC1FCC1FFC",Lm:"02B0-02C102C6-02D102E0-02E402EC02EE0374037A0559064006E506E607F407F507FA081A0824082809710E460EC610FC17D718431AA71C78-1C7D1D2C-1D611D781D9B-1DBF2071207F2090-20942C7D2D6F2E2F30053031-3035303B309D309E30FC-30FEA015A4F8-A4FDA60CA67FA717-A71FA770A788A9CFAA70AADDFF70FF9EFF9F",Lo:"01BB01C0-01C3029405D0-05EA05F0-05F20621-063F0641-064A066E066F0671-06D306D506EE06EF06FA-06FC06FF07100712-072F074D-07A507B107CA-07EA0800-08150904-0939093D09500958-096109720979-097F0985-098C098F09900993-09A809AA-09B009B209B6-09B909BD09CE09DC09DD09DF-09E109F009F10A05-0A0A0A0F0A100A13-0A280A2A-0A300A320A330A350A360A380A390A59-0A5C0A5E0A72-0A740A85-0A8D0A8F-0A910A93-0AA80AAA-0AB00AB20AB30AB5-0AB90ABD0AD00AE00AE10B05-0B0C0B0F0B100B13-0B280B2A-0B300B320B330B35-0B390B3D0B5C0B5D0B5F-0B610B710B830B85-0B8A0B8E-0B900B92-0B950B990B9A0B9C0B9E0B9F0BA30BA40BA8-0BAA0BAE-0BB90BD00C05-0C0C0C0E-0C100C12-0C280C2A-0C330C35-0C390C3D0C580C590C600C610C85-0C8C0C8E-0C900C92-0CA80CAA-0CB30CB5-0CB90CBD0CDE0CE00CE10D05-0D0C0D0E-0D100D12-0D280D2A-0D390D3D0D600D610D7A-0D7F0D85-0D960D9A-0DB10DB3-0DBB0DBD0DC0-0DC60E01-0E300E320E330E40-0E450E810E820E840E870E880E8A0E8D0E94-0E970E99-0E9F0EA1-0EA30EA50EA70EAA0EAB0EAD-0EB00EB20EB30EBD0EC0-0EC40EDC0EDD0F000F40-0F470F49-0F6C0F88-0F8B1000-102A103F1050-1055105A-105D106110651066106E-10701075-1081108E10D0-10FA1100-1248124A-124D1250-12561258125A-125D1260-1288128A-128D1290-12B012B2-12B512B8-12BE12C012C2-12C512C8-12D612D8-13101312-13151318-135A1380-138F13A0-13F41401-166C166F-167F1681-169A16A0-16EA1700-170C170E-17111720-17311740-17511760-176C176E-17701780-17B317DC1820-18421844-18771880-18A818AA18B0-18F51900-191C1950-196D1970-19741980-19AB19C1-19C71A00-1A161A20-1A541B05-1B331B45-1B4B1B83-1BA01BAE1BAF1C00-1C231C4D-1C4F1C5A-1C771CE9-1CEC1CEE-1CF12135-21382D30-2D652D80-2D962DA0-2DA62DA8-2DAE2DB0-2DB62DB8-2DBE2DC0-2DC62DC8-2DCE2DD0-2DD62DD8-2DDE3006303C3041-3096309F30A1-30FA30FF3105-312D3131-318E31A0-31B731F0-31FF3400-4DB54E00-9FCBA000-A014A016-A48CA4D0-A4F7A500-A60BA610-A61FA62AA62BA66EA6A0-A6E5A7FB-A801A803-A805A807-A80AA80C-A822A840-A873A882-A8B3A8F2-A8F7A8FBA90A-A925A930-A946A960-A97CA984-A9B2AA00-AA28AA40-AA42AA44-AA4BAA60-AA6FAA71-AA76AA7AAA80-AAAFAAB1AAB5AAB6AAB9-AABDAAC0AAC2AADBAADCABC0-ABE2AC00-D7A3D7B0-D7C6D7CB-D7FBF900-FA2DFA30-FA6DFA70-FAD9FB1DFB1F-FB28FB2A-FB36FB38-FB3CFB3EFB40FB41FB43FB44FB46-FBB1FBD3-FD3DFD50-FD8FFD92-FDC7FDF0-FDFBFE70-FE74FE76-FEFCFF66-FF6FFF71-FF9DFFA0-FFBEFFC2-FFC7FFCA-FFCFFFD2-FFD7FFDA-FFDC",M:"0300-036F0483-04890591-05BD05BF05C105C205C405C505C70610-061A064B-065E067006D6-06DC06DE-06E406E706E806EA-06ED07110730-074A07A6-07B007EB-07F30816-0819081B-08230825-08270829-082D0900-0903093C093E-094E0951-0955096209630981-098309BC09BE-09C409C709C809CB-09CD09D709E209E30A01-0A030A3C0A3E-0A420A470A480A4B-0A4D0A510A700A710A750A81-0A830ABC0ABE-0AC50AC7-0AC90ACB-0ACD0AE20AE30B01-0B030B3C0B3E-0B440B470B480B4B-0B4D0B560B570B620B630B820BBE-0BC20BC6-0BC80BCA-0BCD0BD70C01-0C030C3E-0C440C46-0C480C4A-0C4D0C550C560C620C630C820C830CBC0CBE-0CC40CC6-0CC80CCA-0CCD0CD50CD60CE20CE30D020D030D3E-0D440D46-0D480D4A-0D4D0D570D620D630D820D830DCA0DCF-0DD40DD60DD8-0DDF0DF20DF30E310E34-0E3A0E47-0E4E0EB10EB4-0EB90EBB0EBC0EC8-0ECD0F180F190F350F370F390F3E0F3F0F71-0F840F860F870F90-0F970F99-0FBC0FC6102B-103E1056-1059105E-10601062-10641067-106D1071-10741082-108D108F109A-109D135F1712-17141732-1734175217531772177317B6-17D317DD180B-180D18A91920-192B1930-193B19B0-19C019C819C91A17-1A1B1A55-1A5E1A60-1A7C1A7F1B00-1B041B34-1B441B6B-1B731B80-1B821BA1-1BAA1C24-1C371CD0-1CD21CD4-1CE81CED1CF21DC0-1DE61DFD-1DFF20D0-20F02CEF-2CF12DE0-2DFF302A-302F3099309AA66F-A672A67CA67DA6F0A6F1A802A806A80BA823-A827A880A881A8B4-A8C4A8E0-A8F1A926-A92DA947-A953A980-A983A9B3-A9C0AA29-AA36AA43AA4CAA4DAA7BAAB0AAB2-AAB4AAB7AAB8AABEAABFAAC1ABE3-ABEAABECABEDFB1EFE00-FE0FFE20-FE26",Mn:"0300-036F0483-04870591-05BD05BF05C105C205C405C505C70610-061A064B-065E067006D6-06DC06DF-06E406E706E806EA-06ED07110730-074A07A6-07B007EB-07F30816-0819081B-08230825-08270829-082D0900-0902093C0941-0948094D0951-095509620963098109BC09C1-09C409CD09E209E30A010A020A3C0A410A420A470A480A4B-0A4D0A510A700A710A750A810A820ABC0AC1-0AC50AC70AC80ACD0AE20AE30B010B3C0B3F0B41-0B440B4D0B560B620B630B820BC00BCD0C3E-0C400C46-0C480C4A-0C4D0C550C560C620C630CBC0CBF0CC60CCC0CCD0CE20CE30D41-0D440D4D0D620D630DCA0DD2-0DD40DD60E310E34-0E3A0E47-0E4E0EB10EB4-0EB90EBB0EBC0EC8-0ECD0F180F190F350F370F390F71-0F7E0F80-0F840F860F870F90-0F970F99-0FBC0FC6102D-10301032-10371039103A103D103E10581059105E-10601071-1074108210851086108D109D135F1712-17141732-1734175217531772177317B7-17BD17C617C9-17D317DD180B-180D18A91920-19221927192819321939-193B1A171A181A561A58-1A5E1A601A621A65-1A6C1A73-1A7C1A7F1B00-1B031B341B36-1B3A1B3C1B421B6B-1B731B801B811BA2-1BA51BA81BA91C2C-1C331C361C371CD0-1CD21CD4-1CE01CE2-1CE81CED1DC0-1DE61DFD-1DFF20D0-20DC20E120E5-20F02CEF-2CF12DE0-2DFF302A-302F3099309AA66FA67CA67DA6F0A6F1A802A806A80BA825A826A8C4A8E0-A8F1A926-A92DA947-A951A980-A982A9B3A9B6-A9B9A9BCAA29-AA2EAA31AA32AA35AA36AA43AA4CAAB0AAB2-AAB4AAB7AAB8AABEAABFAAC1ABE5ABE8ABEDFB1EFE00-FE0FFE20-FE26",Mc:"0903093E-09400949-094C094E0982098309BE-09C009C709C809CB09CC09D70A030A3E-0A400A830ABE-0AC00AC90ACB0ACC0B020B030B3E0B400B470B480B4B0B4C0B570BBE0BBF0BC10BC20BC6-0BC80BCA-0BCC0BD70C01-0C030C41-0C440C820C830CBE0CC0-0CC40CC70CC80CCA0CCB0CD50CD60D020D030D3E-0D400D46-0D480D4A-0D4C0D570D820D830DCF-0DD10DD8-0DDF0DF20DF30F3E0F3F0F7F102B102C10311038103B103C105610571062-10641067-106D108310841087-108C108F109A-109C17B617BE-17C517C717C81923-19261929-192B193019311933-193819B0-19C019C819C91A19-1A1B1A551A571A611A631A641A6D-1A721B041B351B3B1B3D-1B411B431B441B821BA11BA61BA71BAA1C24-1C2B1C341C351CE11CF2A823A824A827A880A881A8B4-A8C3A952A953A983A9B4A9B5A9BAA9BBA9BD-A9C0AA2FAA30AA33AA34AA4DAA7BABE3ABE4ABE6ABE7ABE9ABEAABEC",Me:"0488048906DE20DD-20E020E2-20E4A670-A672",N:"0030-003900B200B300B900BC-00BE0660-066906F0-06F907C0-07C90966-096F09E6-09EF09F4-09F90A66-0A6F0AE6-0AEF0B66-0B6F0BE6-0BF20C66-0C6F0C78-0C7E0CE6-0CEF0D66-0D750E50-0E590ED0-0ED90F20-0F331040-10491090-10991369-137C16EE-16F017E0-17E917F0-17F91810-18191946-194F19D0-19DA1A80-1A891A90-1A991B50-1B591BB0-1BB91C40-1C491C50-1C5920702074-20792080-20892150-21822185-21892460-249B24EA-24FF2776-27932CFD30073021-30293038-303A3192-31953220-32293251-325F3280-328932B1-32BFA620-A629A6E6-A6EFA830-A835A8D0-A8D9A900-A909A9D0-A9D9AA50-AA59ABF0-ABF9FF10-FF19",Nd:"0030-00390660-066906F0-06F907C0-07C90966-096F09E6-09EF0A66-0A6F0AE6-0AEF0B66-0B6F0BE6-0BEF0C66-0C6F0CE6-0CEF0D66-0D6F0E50-0E590ED0-0ED90F20-0F291040-10491090-109917E0-17E91810-18191946-194F19D0-19DA1A80-1A891A90-1A991B50-1B591BB0-1BB91C40-1C491C50-1C59A620-A629A8D0-A8D9A900-A909A9D0-A9D9AA50-AA59ABF0-ABF9FF10-FF19",Nl:"16EE-16F02160-21822185-218830073021-30293038-303AA6E6-A6EF",No:"00B200B300B900BC-00BE09F4-09F90BF0-0BF20C78-0C7E0D70-0D750F2A-0F331369-137C17F0-17F920702074-20792080-20892150-215F21892460-249B24EA-24FF2776-27932CFD3192-31953220-32293251-325F3280-328932B1-32BFA830-A835",P:"0021-00230025-002A002C-002F003A003B003F0040005B-005D005F007B007D00A100AB00B700BB00BF037E0387055A-055F0589058A05BE05C005C305C605F305F40609060A060C060D061B061E061F066A-066D06D40700-070D07F7-07F90830-083E0964096509700DF40E4F0E5A0E5B0F04-0F120F3A-0F3D0F850FD0-0FD4104A-104F10FB1361-13681400166D166E169B169C16EB-16ED1735173617D4-17D617D8-17DA1800-180A1944194519DE19DF1A1E1A1F1AA0-1AA61AA8-1AAD1B5A-1B601C3B-1C3F1C7E1C7F1CD32010-20272030-20432045-20512053-205E207D207E208D208E2329232A2768-277527C527C627E6-27EF2983-299829D8-29DB29FC29FD2CF9-2CFC2CFE2CFF2E00-2E2E2E302E313001-30033008-30113014-301F3030303D30A030FBA4FEA4FFA60D-A60FA673A67EA6F2-A6F7A874-A877A8CEA8CFA8F8-A8FAA92EA92FA95FA9C1-A9CDA9DEA9DFAA5C-AA5FAADEAADFABEBFD3EFD3FFE10-FE19FE30-FE52FE54-FE61FE63FE68FE6AFE6BFF01-FF03FF05-FF0AFF0C-FF0FFF1AFF1BFF1FFF20FF3B-FF3DFF3FFF5BFF5DFF5F-FF65",Pd:"002D058A05BE140018062010-20152E172E1A301C303030A0FE31FE32FE58FE63FF0D",Ps:"0028005B007B0F3A0F3C169B201A201E2045207D208D23292768276A276C276E27702772277427C527E627E827EA27EC27EE2983298529872989298B298D298F299129932995299729D829DA29FC2E222E242E262E283008300A300C300E3010301430163018301A301DFD3EFE17FE35FE37FE39FE3BFE3DFE3FFE41FE43FE47FE59FE5BFE5DFF08FF3BFF5BFF5FFF62",Pe:"0029005D007D0F3B0F3D169C2046207E208E232A2769276B276D276F27712773277527C627E727E927EB27ED27EF298429862988298A298C298E2990299229942996299829D929DB29FD2E232E252E272E293009300B300D300F3011301530173019301B301E301FFD3FFE18FE36FE38FE3AFE3CFE3EFE40FE42FE44FE48FE5AFE5CFE5EFF09FF3DFF5DFF60FF63",Pi:"00AB2018201B201C201F20392E022E042E092E0C2E1C2E20",Pf:"00BB2019201D203A2E032E052E0A2E0D2E1D2E21",Pc:"005F203F20402054FE33FE34FE4D-FE4FFF3F",Po:"0021-00230025-0027002A002C002E002F003A003B003F0040005C00A100B700BF037E0387055A-055F058905C005C305C605F305F40609060A060C060D061B061E061F066A-066D06D40700-070D07F7-07F90830-083E0964096509700DF40E4F0E5A0E5B0F04-0F120F850FD0-0FD4104A-104F10FB1361-1368166D166E16EB-16ED1735173617D4-17D617D8-17DA1800-18051807-180A1944194519DE19DF1A1E1A1F1AA0-1AA61AA8-1AAD1B5A-1B601C3B-1C3F1C7E1C7F1CD3201620172020-20272030-2038203B-203E2041-20432047-205120532055-205E2CF9-2CFC2CFE2CFF2E002E012E06-2E082E0B2E0E-2E162E182E192E1B2E1E2E1F2E2A-2E2E2E302E313001-3003303D30FBA4FEA4FFA60D-A60FA673A67EA6F2-A6F7A874-A877A8CEA8CFA8F8-A8FAA92EA92FA95FA9C1-A9CDA9DEA9DFAA5C-AA5FAADEAADFABEBFE10-FE16FE19FE30FE45FE46FE49-FE4CFE50-FE52FE54-FE57FE5F-FE61FE68FE6AFE6BFF01-FF03FF05-FF07FF0AFF0CFF0EFF0FFF1AFF1BFF1FFF20FF3CFF61FF64FF65",S:"0024002B003C-003E005E0060007C007E00A2-00A900AC00AE-00B100B400B600B800D700F702C2-02C502D2-02DF02E5-02EB02ED02EF-02FF03750384038503F604820606-0608060B060E060F06E906FD06FE07F609F209F309FA09FB0AF10B700BF3-0BFA0C7F0CF10CF20D790E3F0F01-0F030F13-0F170F1A-0F1F0F340F360F380FBE-0FC50FC7-0FCC0FCE0FCF0FD5-0FD8109E109F13601390-139917DB194019E0-19FF1B61-1B6A1B74-1B7C1FBD1FBF-1FC11FCD-1FCF1FDD-1FDF1FED-1FEF1FFD1FFE20442052207A-207C208A-208C20A0-20B8210021012103-21062108210921142116-2118211E-2123212521272129212E213A213B2140-2144214A-214D214F2190-2328232B-23E82400-24262440-244A249C-24E92500-26CD26CF-26E126E326E8-26FF2701-27042706-2709270C-27272729-274B274D274F-27522756-275E2761-276727942798-27AF27B1-27BE27C0-27C427C7-27CA27CC27D0-27E527F0-29822999-29D729DC-29FB29FE-2B4C2B50-2B592CE5-2CEA2E80-2E992E9B-2EF32F00-2FD52FF0-2FFB300430123013302030363037303E303F309B309C319031913196-319F31C0-31E33200-321E322A-32503260-327F328A-32B032C0-32FE3300-33FF4DC0-4DFFA490-A4C6A700-A716A720A721A789A78AA828-A82BA836-A839AA77-AA79FB29FDFCFDFDFE62FE64-FE66FE69FF04FF0BFF1C-FF1EFF3EFF40FF5CFF5EFFE0-FFE6FFE8-FFEEFFFCFFFD",Sm:"002B003C-003E007C007E00AC00B100D700F703F60606-060820442052207A-207C208A-208C2140-2144214B2190-2194219A219B21A021A321A621AE21CE21CF21D221D421F4-22FF2308-230B23202321237C239B-23B323DC-23E125B725C125F8-25FF266F27C0-27C427C7-27CA27CC27D0-27E527F0-27FF2900-29822999-29D729DC-29FB29FE-2AFF2B30-2B442B47-2B4CFB29FE62FE64-FE66FF0BFF1C-FF1EFF5CFF5EFFE2FFE9-FFEC",Sc:"002400A2-00A5060B09F209F309FB0AF10BF90E3F17DB20A0-20B8A838FDFCFE69FF04FFE0FFE1FFE5FFE6",Sk:"005E006000A800AF00B400B802C2-02C502D2-02DF02E5-02EB02ED02EF-02FF0375038403851FBD1FBF-1FC11FCD-1FCF1FDD-1FDF1FED-1FEF1FFD1FFE309B309CA700-A716A720A721A789A78AFF3EFF40FFE3",So:"00A600A700A900AE00B000B60482060E060F06E906FD06FE07F609FA0B700BF3-0BF80BFA0C7F0CF10CF20D790F01-0F030F13-0F170F1A-0F1F0F340F360F380FBE-0FC50FC7-0FCC0FCE0FCF0FD5-0FD8109E109F13601390-1399194019E0-19FF1B61-1B6A1B74-1B7C210021012103-21062108210921142116-2118211E-2123212521272129212E213A213B214A214C214D214F2195-2199219C-219F21A121A221A421A521A7-21AD21AF-21CD21D021D121D321D5-21F32300-2307230C-231F2322-2328232B-237B237D-239A23B4-23DB23E2-23E82400-24262440-244A249C-24E92500-25B625B8-25C025C2-25F72600-266E2670-26CD26CF-26E126E326E8-26FF2701-27042706-2709270C-27272729-274B274D274F-27522756-275E2761-276727942798-27AF27B1-27BE2800-28FF2B00-2B2F2B452B462B50-2B592CE5-2CEA2E80-2E992E9B-2EF32F00-2FD52FF0-2FFB300430123013302030363037303E303F319031913196-319F31C0-31E33200-321E322A-32503260-327F328A-32B032C0-32FE3300-33FF4DC0-4DFFA490-A4C6A828-A82BA836A837A839AA77-AA79FDFDFFE4FFE8FFEDFFEEFFFCFFFD",Z:"002000A01680180E2000-200A20282029202F205F3000",Zs:"002000A01680180E2000-200A202F205F3000",Zl:"2028",Zp:"2029",C:"0000-001F007F-009F00AD03780379037F-0383038B038D03A20526-05300557055805600588058B-059005C8-05CF05EB-05EF05F5-0605061C061D0620065F06DD070E070F074B074C07B2-07BF07FB-07FF082E082F083F-08FF093A093B094F095609570973-097809800984098D098E0991099209A909B109B3-09B509BA09BB09C509C609C909CA09CF-09D609D8-09DB09DE09E409E509FC-0A000A040A0B-0A0E0A110A120A290A310A340A370A3A0A3B0A3D0A43-0A460A490A4A0A4E-0A500A52-0A580A5D0A5F-0A650A76-0A800A840A8E0A920AA90AB10AB40ABA0ABB0AC60ACA0ACE0ACF0AD1-0ADF0AE40AE50AF00AF2-0B000B040B0D0B0E0B110B120B290B310B340B3A0B3B0B450B460B490B4A0B4E-0B550B58-0B5B0B5E0B640B650B72-0B810B840B8B-0B8D0B910B96-0B980B9B0B9D0BA0-0BA20BA5-0BA70BAB-0BAD0BBA-0BBD0BC3-0BC50BC90BCE0BCF0BD1-0BD60BD8-0BE50BFB-0C000C040C0D0C110C290C340C3A-0C3C0C450C490C4E-0C540C570C5A-0C5F0C640C650C70-0C770C800C810C840C8D0C910CA90CB40CBA0CBB0CC50CC90CCE-0CD40CD7-0CDD0CDF0CE40CE50CF00CF3-0D010D040D0D0D110D290D3A-0D3C0D450D490D4E-0D560D58-0D5F0D640D650D76-0D780D800D810D840D97-0D990DB20DBC0DBE0DBF0DC7-0DC90DCB-0DCE0DD50DD70DE0-0DF10DF5-0E000E3B-0E3E0E5C-0E800E830E850E860E890E8B0E8C0E8E-0E930E980EA00EA40EA60EA80EA90EAC0EBA0EBE0EBF0EC50EC70ECE0ECF0EDA0EDB0EDE-0EFF0F480F6D-0F700F8C-0F8F0F980FBD0FCD0FD9-0FFF10C6-10CF10FD-10FF1249124E124F12571259125E125F1289128E128F12B112B612B712BF12C112C612C712D7131113161317135B-135E137D-137F139A-139F13F5-13FF169D-169F16F1-16FF170D1715-171F1737-173F1754-175F176D17711774-177F17B417B517DE17DF17EA-17EF17FA-17FF180F181A-181F1878-187F18AB-18AF18F6-18FF191D-191F192C-192F193C-193F1941-1943196E196F1975-197F19AC-19AF19CA-19CF19DB-19DD1A1C1A1D1A5F1A7D1A7E1A8A-1A8F1A9A-1A9F1AAE-1AFF1B4C-1B4F1B7D-1B7F1BAB-1BAD1BBA-1BFF1C38-1C3A1C4A-1C4C1C80-1CCF1CF3-1CFF1DE7-1DFC1F161F171F1E1F1F1F461F471F4E1F4F1F581F5A1F5C1F5E1F7E1F7F1FB51FC51FD41FD51FDC1FF01FF11FF51FFF200B-200F202A-202E2060-206F20722073208F2095-209F20B9-20CF20F1-20FF218A-218F23E9-23FF2427-243F244B-245F26CE26E226E4-26E727002705270A270B2728274C274E2753-2755275F27602795-279727B027BF27CB27CD-27CF2B4D-2B4F2B5A-2BFF2C2F2C5F2CF2-2CF82D26-2D2F2D66-2D6E2D70-2D7F2D97-2D9F2DA72DAF2DB72DBF2DC72DCF2DD72DDF2E32-2E7F2E9A2EF4-2EFF2FD6-2FEF2FFC-2FFF3040309730983100-3104312E-3130318F31B8-31BF31E4-31EF321F32FF4DB6-4DBF9FCC-9FFFA48D-A48FA4C7-A4CFA62C-A63FA660A661A674-A67BA698-A69FA6F8-A6FFA78D-A7FAA82C-A82FA83A-A83FA878-A87FA8C5-A8CDA8DA-A8DFA8FC-A8FFA954-A95EA97D-A97FA9CEA9DA-A9DDA9E0-A9FFAA37-AA3FAA4EAA4FAA5AAA5BAA7C-AA7FAAC3-AADAAAE0-ABBFABEEABEFABFA-ABFFD7A4-D7AFD7C7-D7CAD7FC-F8FFFA2EFA2FFA6EFA6FFADA-FAFFFB07-FB12FB18-FB1CFB37FB3DFB3FFB42FB45FBB2-FBD2FD40-FD4FFD90FD91FDC8-FDEFFDFEFDFFFE1A-FE1FFE27-FE2FFE53FE67FE6C-FE6FFE75FEFD-FF00FFBF-FFC1FFC8FFC9FFD0FFD1FFD8FFD9FFDD-FFDFFFE7FFEF-FFFBFFFEFFFF",Cc:"0000-001F007F-009F",Cf:"00AD0600-060306DD070F17B417B5200B-200F202A-202E2060-2064206A-206FFEFFFFF9-FFFB",Co:"E000-F8FF",Cs:"D800-DFFF",Cn:"03780379037F-0383038B038D03A20526-05300557055805600588058B-059005C8-05CF05EB-05EF05F5-05FF06040605061C061D0620065F070E074B074C07B2-07BF07FB-07FF082E082F083F-08FF093A093B094F095609570973-097809800984098D098E0991099209A909B109B3-09B509BA09BB09C509C609C909CA09CF-09D609D8-09DB09DE09E409E509FC-0A000A040A0B-0A0E0A110A120A290A310A340A370A3A0A3B0A3D0A43-0A460A490A4A0A4E-0A500A52-0A580A5D0A5F-0A650A76-0A800A840A8E0A920AA90AB10AB40ABA0ABB0AC60ACA0ACE0ACF0AD1-0ADF0AE40AE50AF00AF2-0B000B040B0D0B0E0B110B120B290B310B340B3A0B3B0B450B460B490B4A0B4E-0B550B58-0B5B0B5E0B640B650B72-0B810B840B8B-0B8D0B910B96-0B980B9B0B9D0BA0-0BA20BA5-0BA70BAB-0BAD0BBA-0BBD0BC3-0BC50BC90BCE0BCF0BD1-0BD60BD8-0BE50BFB-0C000C040C0D0C110C290C340C3A-0C3C0C450C490C4E-0C540C570C5A-0C5F0C640C650C70-0C770C800C810C840C8D0C910CA90CB40CBA0CBB0CC50CC90CCE-0CD40CD7-0CDD0CDF0CE40CE50CF00CF3-0D010D040D0D0D110D290D3A-0D3C0D450D490D4E-0D560D58-0D5F0D640D650D76-0D780D800D810D840D97-0D990DB20DBC0DBE0DBF0DC7-0DC90DCB-0DCE0DD50DD70DE0-0DF10DF5-0E000E3B-0E3E0E5C-0E800E830E850E860E890E8B0E8C0E8E-0E930E980EA00EA40EA60EA80EA90EAC0EBA0EBE0EBF0EC50EC70ECE0ECF0EDA0EDB0EDE-0EFF0F480F6D-0F700F8C-0F8F0F980FBD0FCD0FD9-0FFF10C6-10CF10FD-10FF1249124E124F12571259125E125F1289128E128F12B112B612B712BF12C112C612C712D7131113161317135B-135E137D-137F139A-139F13F5-13FF169D-169F16F1-16FF170D1715-171F1737-173F1754-175F176D17711774-177F17DE17DF17EA-17EF17FA-17FF180F181A-181F1878-187F18AB-18AF18F6-18FF191D-191F192C-192F193C-193F1941-1943196E196F1975-197F19AC-19AF19CA-19CF19DB-19DD1A1C1A1D1A5F1A7D1A7E1A8A-1A8F1A9A-1A9F1AAE-1AFF1B4C-1B4F1B7D-1B7F1BAB-1BAD1BBA-1BFF1C38-1C3A1C4A-1C4C1C80-1CCF1CF3-1CFF1DE7-1DFC1F161F171F1E1F1F1F461F471F4E1F4F1F581F5A1F5C1F5E1F7E1F7F1FB51FC51FD41FD51FDC1FF01FF11FF51FFF2065-206920722073208F2095-209F20B9-20CF20F1-20FF218A-218F23E9-23FF2427-243F244B-245F26CE26E226E4-26E727002705270A270B2728274C274E2753-2755275F27602795-279727B027BF27CB27CD-27CF2B4D-2B4F2B5A-2BFF2C2F2C5F2CF2-2CF82D26-2D2F2D66-2D6E2D70-2D7F2D97-2D9F2DA72DAF2DB72DBF2DC72DCF2DD72DDF2E32-2E7F2E9A2EF4-2EFF2FD6-2FEF2FFC-2FFF3040309730983100-3104312E-3130318F31B8-31BF31E4-31EF321F32FF4DB6-4DBF9FCC-9FFFA48D-A48FA4C7-A4CFA62C-A63FA660A661A674-A67BA698-A69FA6F8-A6FFA78D-A7FAA82C-A82FA83A-A83FA878-A87FA8C5-A8CDA8DA-A8DFA8FC-A8FFA954-A95EA97D-A97FA9CEA9DA-A9DDA9E0-A9FFAA37-AA3FAA4EAA4FAA5AAA5BAA7C-AA7FAAC3-AADAAAE0-ABBFABEEABEFABFA-ABFFD7A4-D7AFD7C7-D7CAD7FC-D7FFFA2EFA2FFA6EFA6FFADA-FAFFFB07-FB12FB18-FB1CFB37FB3DFB3FFB42FB45FBB2-FBD2FD40-FD4FFD90FD91FDC8-FDEFFDFEFDFFFE1A-FE1FFE27-FE2FFE53FE67FE6C-FE6FFE75FEFDFEFEFF00FFBF-FFC1FFC8FFC9FFD0FFD1FFD8FFD9FFDD-FFDFFFE7FFEF-FFF8FFFEFFFF"})}),define("ace/mode/text",["require","exports","module","ace/tokenizer","ace/mode/text_highlight_rules","ace/mode/behaviour/cstyle","ace/unicode","ace/lib/lang","ace/token_iterator","ace/range"],function(e,t,n){"use strict";var r=e("../tokenizer").Tokenizer,i=e("./text_highlight_rules").TextHighlightRules,s=e("./behaviour/cstyle").CstyleBehaviour,o=e("../unicode"),u=e("../lib/lang"),a=e("../token_iterator").TokenIterator,f=e("../range").Range,l=function(){this.HighlightRules=i};(function(){this.$defaultBehaviour=new s,this.tokenRe=new RegExp("^["+o.packages.L+o.packages.Mn+o.packages.Mc+o.packages.Nd+o.packages.Pc+"\\$_]+","g"),this.nonTokenRe=new RegExp("^(?:[^"+o.packages.L+o.packages.Mn+o.packages.Mc+o.packages.Nd+o.packages.Pc+"\\$_]|\\s])+","g"),this.getTokenizer=function(){return this.$tokenizer||(this.$highlightRules=this.$highlightRules||new this.HighlightRules(this.$highlightRuleConfig),this.$tokenizer=new r(this.$highlightRules.getRules())),this.$tokenizer},this.lineCommentStart="",this.blockComment="",this.toggleCommentLines=function(e,t,n,r){function w(e){for(var t=n;t<=r;t++)e(i.getLine(t),t)}var i=t.doc,s=!0,o=!0,a=Infinity,f=t.getTabSize(),l=!1;if(!this.lineCommentStart){if(!this.blockComment)return!1;var c=this.blockComment.start,h=this.blockComment.end,p=new RegExp("^(\\s*)(?:"+u.escapeRegExp(c)+")"),d=new RegExp("(?:"+u.escapeRegExp(h)+")\\s*$"),v=function(e,t){if(g(e,t))return;if(!s||/\S/.test(e))i.insertInLine({row:t,column:e.length},h),i.insertInLine({row:t,column:a},c)},m=function(e,t){var n;(n=e.match(d))&&i.removeInLine(t,e.length-n[0].length,e.length),(n=e.match(p))&&i.removeInLine(t,n[1].length,n[0].length)},g=function(e,n){if(p.test(e))return!0;var r=t.getTokens(n);for(var i=0;i<r.length;i++)if(r[i].type==="comment")return!0}}else{if(Array.isArray(this.lineCommentStart))var p=this.lineCommentStart.map(u.escapeRegExp).join("|"),c=this.lineCommentStart[0];else var p=u.escapeRegExp(this.lineCommentStart),c=this.lineCommentStart;p=new RegExp("^(\\s*)(?:"+p+") ?"),l=t.getUseSoftTabs();var m=function(e,t){var n=e.match(p);if(!n)return;var r=n[1].length,s=n[0].length;!b(e,r,s)&&n[0][s-1]==" "&&s--,i.removeInLine(t,r,s)},y=c+" ",v=function(e,t){if(!s||/\S/.test(e))b(e,a,a)?i.insertInLine({row:t,column:a},y):i.insertInLine({row:t,column:a},c)},g=function(e,t){return p.test(e)},b=function(e,t,n){var r=0;while(t--&&e.charAt(t)==" ")r++;if(r%f!=0)return!1;var r=0;while(e.charAt(n++)==" ")r++;return f>2?r%f!=f-1:r%f==0}}var E=Infinity;w(function(e,t){var n=e.search(/\S/);n!==-1?(n<a&&(a=n),o&&!g(e,t)&&(o=!1)):E>e.length&&(E=e.length)}),a==Infinity&&(a=E,s=!1,o=!1),l&&a%f!=0&&(a=Math.floor(a/f)*f),w(o?m:v)},this.toggleBlockComment=function(e,t,n,r){var i=this.blockComment;if(!i)return;!i.start&&i[0]&&(i=i[0]);var s=new a(t,r.row,r.column),o=s.getCurrentToken(),u=t.selection,l=t.selection.toOrientedRange(),c,h;if(o&&/comment/.test(o.type)){var p,d;while(o&&/comment/.test(o.type)){var v=o.value.indexOf(i.start);if(v!=-1){var m=s.getCurrentTokenRow(),g=s.getCurrentTokenColumn()+v;p=new f(m,g,m,g+i.start.length);break}o=s.stepBackward()}var s=new a(t,r.row,r.column),o=s.getCurrentToken();while(o&&/comment/.test(o.type)){var v=o.value.indexOf(i.end);if(v!=-1){var m=s.getCurrentTokenRow(),g=s.getCurrentTokenColumn()+v;d=new f(m,g,m,g+i.end.length);break}o=s.stepForward()}d&&t.remove(d),p&&(t.remove(p),c=p.start.row,h=-i.start.length)}else h=i.start.length,c=n.start.row,t.insert(n.end,i.end),t.insert(n.start,i.start);l.start.row==c&&(l.start.column+=h),l.end.row==c&&(l.end.column+=h),t.selection.fromOrientedRange(l)},this.getNextLineIndent=function(e,t,n){return this.$getIndent(t)},this.checkOutdent=function(e,t,n){return!1},this.autoOutdent=function(e,t,n){},this.$getIndent=function(e){return e.match(/^\s*/)[0]},this.createWorker=function(e){return null},this.createModeDelegates=function(e){this.$embeds=[],this.$modes={};for(var t in e)e[t]&&(this.$embeds.push(t),this.$modes[t]=new e[t]);var n=["toggleBlockComment","toggleCommentLines","getNextLineIndent","checkOutdent","autoOutdent","transformAction","getCompletions"];for(var t=0;t<n.length;t++)(function(e){var r=n[t],i=e[r];e[n[t]]=function(){return this.$delegator(r,arguments,i)}})(this)},this.$delegator=function(e,t,n){var r=t[0];typeof r!="string"&&(r=r[0]);for(var i=0;i<this.$embeds.length;i++){if(!this.$modes[this.$embeds[i]])continue;var s=r.split(this.$embeds[i]);if(!s[0]&&s[1]){t[0]=s[1];var o=this.$modes[this.$embeds[i]];return o[e].apply(o,t)}}var u=n.apply(this,t);return n?u:undefined},this.transformAction=function(e,t,n,r,i){if(this.$behaviour){var s=this.$behaviour.getBehaviours();for(var o in s)if(s[o][t]){var u=s[o][t].apply(this,arguments);if(u)return u}}},this.getKeywords=function(e){if(!this.completionKeywords){var t=this.$tokenizer.rules,n=[];for(var r in t){var i=t[r];for(var s=0,o=i.length;s<o;s++)if(typeof i[s].token=="string")/keyword|support|storage/.test(i[s].token)&&n.push(i[s].regex);else if(typeof i[s].token=="object")for(var u=0,a=i[s].token.length;u<a;u++)if(/keyword|support|storage/.test(i[s].token[u])){var r=i[s].regex.match(/\(.+?\)/g)[u];n.push(r.substr(1,r.length-2))}}this.completionKeywords=n}return e?n.concat(this.$keywordList||[]):this.$keywordList},this.$createKeywordList=function(){return this.$highlightRules||this.getTokenizer(),this.$keywordList=this.$highlightRules.$keywordList||[]},this.getCompletions=function(e,t,n,r){var i=this.$keywordList||this.$createKeywordList();return i.map(function(e){return{name:e,value:e,score:0,meta:"keyword"}})},this.$id="ace/mode/text"}).call(l.prototype),t.Mode=l}),define("ace/apply_delta",["require","exports","module"],function(e,t,n){"use strict";function r(e,t){throw console.log("Invalid Delta:",e),"Invalid Delta: "+t}function i(e,t){return t.row>=0&&t.row<e.length&&t.column>=0&&t.column<=e[t.row].length}function s(e,t){t.action!="insert"&&t.action!="remove"&&r(t,"delta.action must be 'insert' or 'remove'"),t.lines instanceof Array||r(t,"delta.lines must be an Array"),(!t.start||!t.end)&&r(t,"delta.start/end must be an present");var n=t.start;i(e,t.start)||r(t,"delta.start must be contained in document");var s=t.end;t.action=="remove"&&!i(e,s)&&r(t,"delta.end must contained in document for 'remove' actions");var o=s.row-n.row,u=s.column-(o==0?n.column:0);(o!=t.lines.length-1||t.lines[o].length!=u)&&r(t,"delta.range must match delta lines")}t.applyDelta=function(e,t,n){var r=t.start.row,i=t.start.column,s=e[r]||"";switch(t.action){case"insert":var o=t.lines;if(o.length===1)e[r]=s.substring(0,i)+t.lines[0]+s.substring(i);else{var u=[r,1].concat(t.lines);e.splice.apply(e,u),e[r]=s.substring(0,i)+e[r],e[r+t.lines.length-1]+=s.substring(i)}break;case"remove":var a=t.end.column,f=t.end.row;r===f?e[r]=s.substring(0,i)+s.substring(a):e.splice(r,f-r+1,s.substring(0,i)+e[f].substring(a))}}}),define("ace/anchor",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/event_emitter").EventEmitter,s=t.Anchor=function(e,t,n){this.$onChange=this.onChange.bind(this),this.attach(e),typeof n=="undefined"?this.setPosition(t.row,t.column):this.setPosition(t,n)};(function(){function e(e,t,n){var r=n?e.column<=t.column:e.column<t.column;return e.row<t.row||e.row==t.row&&r}function t(t,n,r){var i=t.action=="insert",s=(i?1:-1)*(t.end.row-t.start.row),o=(i?1:-1)*(t.end.column-t.start.column),u=t.start,a=i?u:t.end;return e(n,u,r)?{row:n.row,column:n.column}:e(a,n,!r)?{row:n.row+s,column:n.column+(n.row==a.row?o:0)}:{row:u.row,column:u.column}}r.implement(this,i),this.getPosition=function(){return this.$clipPositionToDocument(this.row,this.column)},this.getDocument=function(){return this.document},this.$insertRight=!1,this.onChange=function(e){if(e.start.row==e.end.row&&e.start.row!=this.row)return;if(e.start.row>this.row)return;var n=t(e,{row:this.row,column:this.column},this.$insertRight);this.setPosition(n.row,n.column,!0)},this.setPosition=function(e,t,n){var r;n?r={row:e,column:t}:r=this.$clipPositionToDocument(e,t);if(this.row==r.row&&this.column==r.column)return;var i={row:this.row,column:this.column};this.row=r.row,this.column=r.column,this._signal("change",{old:i,value:r})},this.detach=function(){this.document.removeEventListener("change",this.$onChange)},this.attach=function(e){this.document=e||this.document,this.document.on("change",this.$onChange)},this.$clipPositionToDocument=function(e,t){var n={};return e>=this.document.getLength()?(n.row=Math.max(0,this.document.getLength()-1),n.column=this.document.getLine(n.row).length):e<0?(n.row=0,n.column=0):(n.row=e,n.column=Math.min(this.document.getLine(n.row).length,Math.max(0,t))),t<0&&(n.column=0),n}}).call(s.prototype)}),define("ace/document",["require","exports","module","ace/lib/oop","ace/apply_delta","ace/lib/event_emitter","ace/range","ace/anchor"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./apply_delta").applyDelta,s=e("./lib/event_emitter").EventEmitter,o=e("./range").Range,u=e("./anchor").Anchor,a=function(e){this.$lines=[""],e.length===0?this.$lines=[""]:Array.isArray(e)?this.insertMergedLines({row:0,column:0},e):this.insert({row:0,column:0},e)};(function(){r.implement(this,s),this.setValue=function(e){var t=this.getLength()-1;this.remove(new o(0,0,t,this.getLine(t).length)),this.insert({row:0,column:0},e)},this.getValue=function(){return this.getAllLines().join(this.getNewLineCharacter())},this.createAnchor=function(e,t){return new u(this,e,t)},"aaa".split(/a/).length===0?this.$split=function(e){return e.replace(/\r\n|\r/g,"\n").split("\n")}:this.$split=function(e){return e.split(/\r\n|\r|\n/)},this.$detectNewLine=function(e){var t=e.match(/^.*?(\r\n|\r|\n)/m);this.$autoNewLine=t?t[1]:"\n",this._signal("changeNewLineMode")},this.getNewLineCharacter=function(){switch(this.$newLineMode){case"windows":return"\r\n";case"unix":return"\n";default:return this.$autoNewLine||"\n"}},this.$autoNewLine="",this.$newLineMode="auto",this.setNewLineMode=function(e){if(this.$newLineMode===e)return;this.$newLineMode=e,this._signal("changeNewLineMode")},this.getNewLineMode=function(){return this.$newLineMode},this.isNewLine=function(e){return e=="\r\n"||e=="\r"||e=="\n"},this.getLine=function(e){return this.$lines[e]||""},this.getLines=function(e,t){return this.$lines.slice(e,t+1)},this.getAllLines=function(){return this.getLines(0,this.getLength())},this.getLength=function(){return this.$lines.length},this.getTextRange=function(e){return this.getLinesForRange(e).join(this.getNewLineCharacter())},this.getLinesForRange=function(e){var t;if(e.start.row===e.end.row)t=[this.getLine(e.start.row).substring(e.start.column,e.end.column)];else{t=this.getLines(e.start.row,e.end.row),t[0]=(t[0]||"").substring(e.start.column);var n=t.length-1;e.end.row-e.start.row==n&&(t[n]=t[n].substring(0,e.end.column))}return t},this.insertLines=function(e,t){return console.warn("Use of document.insertLines is deprecated. Use the insertFullLines method instead."),this.insertFullLines(e,t)},this.removeLines=function(e,t){return console.warn("Use of document.removeLines is deprecated. Use the removeFullLines method instead."),this.removeFullLines(e,t)},this.insertNewLine=function(e){return console.warn("Use of document.insertNewLine is deprecated. Use insertMergedLines(position, ['', '']) instead."),this.insertMergedLines(e,["",""])},this.insert=function(e,t){return this.getLength()<=1&&this.$detectNewLine(t),this.insertMergedLines(e,this.$split(t))},this.insertInLine=function(e,t){var n=this.clippedPos(e.row,e.column),r=this.pos(e.row,e.column+t.length);return this.applyDelta({start:n,end:r,action:"insert",lines:[t]},!0),this.clonePos(r)},this.clippedPos=function(e,t){var n=this.getLength();e===undefined?e=n:e<0?e=0:e>=n&&(e=n-1,t=undefined);var r=this.getLine(e);return t==undefined&&(t=r.length),t=Math.min(Math.max(t,0),r.length),{row:e,column:t}},this.clonePos=function(e){return{row:e.row,column:e.column}},this.pos=function(e,t){return{row:e,column:t}},this.$clipPosition=function(e){var t=this.getLength();return e.row>=t?(e.row=Math.max(0,t-1),e.column=this.getLine(t-1).length):(e.row=Math.max(0,e.row),e.column=Math.min(Math.max(e.column,0),this.getLine(e.row).length)),e},this.insertFullLines=function(e,t){e=Math.min(Math.max(e,0),this.getLength());var n=0;e<this.getLength()?(t=t.concat([""]),n=0):(t=[""].concat(t),e--,n=this.$lines[e].length),this.insertMergedLines({row:e,column:n},t)},this.insertMergedLines=function(e,t){var n=this.clippedPos(e.row,e.column),r={row:n.row+t.length-1,column:(t.length==1?n.column:0)+t[t.length-1].length};return this.applyDelta({start:n,end:r,action:"insert",lines:t}),this.clonePos(r)},this.remove=function(e){var t=this.clippedPos(e.start.row,e.start.column),n=this.clippedPos(e.end.row,e.end.column);return this.applyDelta({start:t,end:n,action:"remove",lines:this.getLinesForRange({start:t,end:n})}),this.clonePos(t)},this.removeInLine=function(e,t,n){var r=this.clippedPos(e,t),i=this.clippedPos(e,n);return this.applyDelta({start:r,end:i,action:"remove",lines:this.getLinesForRange({start:r,end:i})},!0),this.clonePos(r)},this.removeFullLines=function(e,t){e=Math.min(Math.max(0,e),this.getLength()-1),t=Math.min(Math.max(0,t),this.getLength()-1);var n=t==this.getLength()-1&&e>0,r=t<this.getLength()-1,i=n?e-1:e,s=n?this.getLine(i).length:0,u=r?t+1:t,a=r?0:this.getLine(u).length,f=new o(i,s,u,a),l=this.$lines.slice(e,t+1);return this.applyDelta({start:f.start,end:f.end,action:"remove",lines:this.getLinesForRange(f)}),l},this.removeNewLine=function(e){e<this.getLength()-1&&e>=0&&this.applyDelta({start:this.pos(e,this.getLine(e).length),end:this.pos(e+1,0),action:"remove",lines:["",""]})},this.replace=function(e,t){e instanceof o||(e=o.fromPoints(e.start,e.end));if(t.length===0&&e.isEmpty())return e.start;if(t==this.getTextRange(e))return e.end;this.remove(e);var n;return t?n=this.insert(e.start,t):n=e.start,n},this.applyDeltas=function(e){for(var t=0;t<e.length;t++)this.applyDelta(e[t])},this.revertDeltas=function(e){for(var t=e.length-1;t>=0;t--)this.revertDelta(e[t])},this.applyDelta=function(e,t){var n=e.action=="insert";if(n?e.lines.length<=1&&!e.lines[0]:!o.comparePoints(e.start,e.end))return;n&&e.lines.length>2e4&&this.$splitAndapplyLargeDelta(e,2e4),i(this.$lines,e,t),this._signal("change",e)},this.$splitAndapplyLargeDelta=function(e,t){var n=e.lines,r=n.length,i=e.start.row,s=e.start.column,o=0,u=0;do{o=u,u+=t-1;var a=n.slice(o,u);if(u>r){e.lines=a,e.start.row=i+o,e.start.column=s;break}a.push(""),this.applyDelta({start:this.pos(i+o,s),end:this.pos(i+u,s=0),action:e.action,lines:a},!0)}while(!0)},this.revertDelta=function(e){this.applyDelta({start:this.clonePos(e.start),end:this.clonePos(e.end),action:e.action=="insert"?"remove":"insert",lines:e.lines.slice()})},this.indexToPosition=function(e,t){var n=this.$lines||this.getAllLines(),r=this.getNewLineCharacter().length;for(var i=t||0,s=n.length;i<s;i++){e-=n[i].length+r;if(e<0)return{row:i,column:e+n[i].length+r}}return{row:s-1,column:n[s-1].length}},this.positionToIndex=function(e,t){var n=this.$lines||this.getAllLines(),r=this.getNewLineCharacter().length,i=0,s=Math.min(e.row,n.length);for(var o=t||0;o<s;++o)i+=n[o].length+r;return i+e.column}}).call(a.prototype),t.Document=a}),define("ace/background_tokenizer",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/event_emitter").EventEmitter,s=function(e,t){this.running=!1,this.lines=[],this.states=[],this.currentLine=0,this.tokenizer=e;var n=this;this.$worker=function(){if(!n.running)return;var e=new Date,t=n.currentLine,r=-1,i=n.doc,s=t;while(n.lines[t])t++;var o=i.getLength(),u=0;n.running=!1;while(t<o){n.$tokenizeRow(t),r=t;do t++;while(n.lines[t]);u++;if(u%5===0&&new Date-e>20){n.running=setTimeout(n.$worker,20);break}}n.currentLine=t,r==-1&&(r=t),s<=r&&n.fireUpdateEvent(s,r)}};(function(){r.implement(this,i),this.setTokenizer=function(e){this.tokenizer=e,this.lines=[],this.states=[],this.start(0)},this.setDocument=function(e){this.doc=e,this.lines=[],this.states=[],this.stop()},this.fireUpdateEvent=function(e,t){var n={first:e,last:t};this._signal("update",{data:n})},this.start=function(e){this.currentLine=Math.min(e||0,this.currentLine,this.doc.getLength()),this.lines.splice(this.currentLine,this.lines.length),this.states.splice(this.currentLine,this.states.length),this.stop(),this.running=setTimeout(this.$worker,700)},this.scheduleStart=function(){this.running||(this.running=setTimeout(this.$worker,700))},this.$updateOnChange=function(e){var t=e.start.row,n=e.end.row-t;if(n===0)this.lines[t]=null;else if(e.action=="remove")this.lines.splice(t,n+1,null),this.states.splice(t,n+1,null);else{var r=Array(n+1);r.unshift(t,1),this.lines.splice.apply(this.lines,r),this.states.splice.apply(this.states,r)}this.currentLine=Math.min(t,this.currentLine,this.doc.getLength()),this.stop()},this.stop=function(){this.running&&clearTimeout(this.running),this.running=!1},this.getTokens=function(e){return this.lines[e]||this.$tokenizeRow(e)},this.getState=function(e){return this.currentLine==e&&this.$tokenizeRow(e),this.states[e]||"start"},this.$tokenizeRow=function(e){var t=this.doc.getLine(e),n=this.states[e-1],r=this.tokenizer.getLineTokens(t,n,e);return this.states[e]+""!=r.state+""?(this.states[e]=r.state,this.lines[e+1]=null,this.currentLine>e+1&&(this.currentLine=e+1)):this.currentLine==e&&(this.currentLine=e+1),this.lines[e]=r.tokens}}).call(s.prototype),t.BackgroundTokenizer=s}),define("ace/search_highlight",["require","exports","module","ace/lib/lang","ace/lib/oop","ace/range"],function(e,t,n){"use strict";var r=e("./lib/lang"),i=e("./lib/oop"),s=e("./range").Range,o=function(e,t,n){this.setRegexp(e),this.clazz=t,this.type=n||"text"};(function(){this.MAX_RANGES=500,this.setRegexp=function(e){if(this.regExp+""==e+"")return;this.regExp=e,this.cache=[]},this.update=function(e,t,n,i){if(!this.regExp)return;var o=i.firstRow,u=i.lastRow;for(var a=o;a<=u;a++){var f=this.cache[a];f==null&&(f=r.getMatchOffsets(n.getLine(a),this.regExp),f.length>this.MAX_RANGES&&(f=f.slice(0,this.MAX_RANGES)),f=f.map(function(e){return new s(a,e.offset,a,e.offset+e.length)}),this.cache[a]=f.length?f:"");for(var l=f.length;l--;)t.drawSingleLineMarker(e,f[l].toScreenRange(n),this.clazz,i)}}}).call(o.prototype),t.SearchHighlight=o}),define("ace/edit_session/fold_line",["require","exports","module","ace/range"],function(e,t,n){"use strict";function i(e,t){this.foldData=e,Array.isArray(t)?this.folds=t:t=this.folds=[t];var n=t[t.length-1];this.range=new r(t[0].start.row,t[0].start.column,n.end.row,n.end.column),this.start=this.range.start,this.end=this.range.end,this.folds.forEach(function(e){e.setFoldLine(this)},this)}var r=e("../range").Range;(function(){this.shiftRow=function(e){this.start.row+=e,this.end.row+=e,this.folds.forEach(function(t){t.start.row+=e,t.end.row+=e})},this.addFold=function(e){if(e.sameRow){if(e.start.row<this.startRow||e.endRow>this.endRow)throw new Error("Can't add a fold to this FoldLine as it has no connection");this.folds.push(e),this.folds.sort(function(e,t){return-e.range.compareEnd(t.start.row,t.start.column)}),this.range.compareEnd(e.start.row,e.start.column)>0?(this.end.row=e.end.row,this.end.column=e.end.column):this.range.compareStart(e.end.row,e.end.column)<0&&(this.start.row=e.start.row,this.start.column=e.start.column)}else if(e.start.row==this.end.row)this.folds.push(e),this.end.row=e.end.row,this.end.column=e.end.column;else{if(e.end.row!=this.start.row)throw new Error("Trying to add fold to FoldRow that doesn't have a matching row");this.folds.unshift(e),this.start.row=e.start.row,this.start.column=e.start.column}e.foldLine=this},this.containsRow=function(e){return e>=this.start.row&&e<=this.end.row},this.walk=function(e,t,n){var r=0,i=this.folds,s,o,u,a=!0;t==null&&(t=this.end.row,n=this.end.column);for(var f=0;f<i.length;f++){s=i[f],o=s.range.compareStart(t,n);if(o==-1){e(null,t,n,r,a);return}u=e(null,s.start.row,s.start.column,r,a),u=!u&&e(s.placeholder,s.start.row,s.start.column,r);if(u||o===0)return;a=!s.sameRow,r=s.end.column}e(null,t,n,r,a)},this.getNextFoldTo=function(e,t){var n,r;for(var i=0;i<this.folds.length;i++){n=this.folds[i],r=n.range.compareEnd(e,t);if(r==-1)return{fold:n,kind:"after"};if(r===0)return{fold:n,kind:"inside"}}return null},this.addRemoveChars=function(e,t,n){var r=this.getNextFoldTo(e,t),i,s;if(r){i=r.fold;if(r.kind=="inside"&&i.start.column!=t&&i.start.row!=e)window.console&&window.console.log(e,t,i);else if(i.start.row==e){s=this.folds;var o=s.indexOf(i);o===0&&(this.start.column+=n);for(o;o<s.length;o++){i=s[o],i.start.column+=n;if(!i.sameRow)return;i.end.column+=n}this.end.column+=n}}},this.split=function(e,t){var n=this.getNextFoldTo(e,t);if(!n||n.kind=="inside")return null;var r=n.fold,s=this.folds,o=this.foldData,u=s.indexOf(r),a=s[u-1];this.end.row=a.end.row,this.end.column=a.end.column,s=s.splice(u,s.length-u);var f=new i(o,s);return o.splice(o.indexOf(this)+1,0,f),f},this.merge=function(e){var t=e.folds;for(var n=0;n<t.length;n++)this.addFold(t[n]);var r=this.foldData;r.splice(r.indexOf(e),1)},this.toString=function(){var e=[this.range.toString()+": ["];return this.folds.forEach(function(t){e.push("  "+t.toString())}),e.push("]"),e.join("\n")},this.idxToPosition=function(e){var t=0;for(var n=0;n<this.folds.length;n++){var r=this.folds[n];e-=r.start.column-t;if(e<0)return{row:r.start.row,column:r.start.column+e};e-=r.placeholder.length;if(e<0)return r.start;t=r.end.column}return{row:this.end.row,column:this.end.column+e}}}).call(i.prototype),t.FoldLine=i}),define("ace/range_list",["require","exports","module","ace/range"],function(e,t,n){"use strict";var r=e("./range").Range,i=r.comparePoints,s=function(){this.ranges=[]};(function(){this.comparePoints=i,this.pointIndex=function(e,t,n){var r=this.ranges;for(var s=n||0;s<r.length;s++){var o=r[s],u=i(e,o.end);if(u>0)continue;var a=i(e,o.start);return u===0?t&&a!==0?-s-2:s:a>0||a===0&&!t?s:-s-1}return-s-1},this.add=function(e){var t=!e.isEmpty(),n=this.pointIndex(e.start,t);n<0&&(n=-n-1);var r=this.pointIndex(e.end,t,n);return r<0?r=-r-1:r++,this.ranges.splice(n,r-n,e)},this.addList=function(e){var t=[];for(var n=e.length;n--;)t.push.apply(t,this.add(e[n]));return t},this.substractPoint=function(e){var t=this.pointIndex(e);if(t>=0)return this.ranges.splice(t,1)},this.merge=function(){var e=[],t=this.ranges;t=t.sort(function(e,t){return i(e.start,t.start)});var n=t[0],r;for(var s=1;s<t.length;s++){r=n,n=t[s];var o=i(r.end,n.start);if(o<0)continue;if(o==0&&!r.isEmpty()&&!n.isEmpty())continue;i(r.end,n.end)<0&&(r.end.row=n.end.row,r.end.column=n.end.column),t.splice(s,1),e.push(n),n=r,s--}return this.ranges=t,e},this.contains=function(e,t){return this.pointIndex({row:e,column:t})>=0},this.containsPoint=function(e){return this.pointIndex(e)>=0},this.rangeAtPoint=function(e){var t=this.pointIndex(e);if(t>=0)return this.ranges[t]},this.clipRows=function(e,t){var n=this.ranges;if(n[0].start.row>t||n[n.length-1].start.row<e)return[];var r=this.pointIndex({row:e,column:0});r<0&&(r=-r-1);var i=this.pointIndex({row:t,column:0},r);i<0&&(i=-i-1);var s=[];for(var o=r;o<i;o++)s.push(n[o]);return s},this.removeAll=function(){return this.ranges.splice(0,this.ranges.length)},this.attach=function(e){this.session&&this.detach(),this.session=e,this.onChange=this.$onChange.bind(this),this.session.on("change",this.onChange)},this.detach=function(){if(!this.session)return;this.session.removeListener("change",this.onChange),this.session=null},this.$onChange=function(e){if(e.action=="insert")var t=e.start,n=e.end;else var n=e.start,t=e.end;var r=t.row,i=n.row,s=i-r,o=-t.column+n.column,u=this.ranges;for(var a=0,f=u.length;a<f;a++){var l=u[a];if(l.end.row<r)continue;if(l.start.row>r)break;l.start.row==r&&l.start.column>=t.column&&(l.start.column!=t.column||!this.$insertRight)&&(l.start.column+=o,l.start.row+=s);if(l.end.row==r&&l.end.column>=t.column){if(l.end.column==t.column&&this.$insertRight)continue;l.end.column==t.column&&o>0&&a<f-1&&l.end.column>l.start.column&&l.end.column==u[a+1].start.column&&(l.end.column-=o),l.end.column+=o,l.end.row+=s}}if(s!=0&&a<f)for(;a<f;a++){var l=u[a];l.start.row+=s,l.end.row+=s}}}).call(s.prototype),t.RangeList=s}),define("ace/edit_session/fold",["require","exports","module","ace/range","ace/range_list","ace/lib/oop"],function(e,t,n){"use strict";function u(e,t){e.row-=t.row,e.row==0&&(e.column-=t.column)}function a(e,t){u(e.start,t),u(e.end,t)}function f(e,t){e.row==0&&(e.column+=t.column),e.row+=t.row}function l(e,t){f(e.start,t),f(e.end,t)}var r=e("../range").Range,i=e("../range_list").RangeList,s=e("../lib/oop"),o=t.Fold=function(e,t){this.foldLine=null,this.placeholder=t,this.range=e,this.start=e.start,this.end=e.end,this.sameRow=e.start.row==e.end.row,this.subFolds=this.ranges=[]};s.inherits(o,i),function(){this.toString=function(){return'"'+this.placeholder+'" '+this.range.toString()},this.setFoldLine=function(e){this.foldLine=e,this.subFolds.forEach(function(t){t.setFoldLine(e)})},this.clone=function(){var e=this.range.clone(),t=new o(e,this.placeholder);return this.subFolds.forEach(function(e){t.subFolds.push(e.clone())}),t.collapseChildren=this.collapseChildren,t},this.addSubFold=function(e){if(this.range.isEqual(e))return;if(!this.range.containsRange(e))throw new Error("A fold can't intersect already existing fold"+e.range+this.range);a(e,this.start);var t=e.start.row,n=e.start.column;for(var r=0,i=-1;r<this.subFolds.length;r++){i=this.subFolds[r].range.compare(t,n);if(i!=1)break}var s=this.subFolds[r];if(i==0)return s.addSubFold(e);var t=e.range.end.row,n=e.range.end.column;for(var o=r,i=-1;o<this.subFolds.length;o++){i=this.subFolds[o].range.compare(t,n);if(i!=1)break}var u=this.subFolds[o];if(i==0)throw new Error("A fold can't intersect already existing fold"+e.range+this.range);var f=this.subFolds.splice(r,o-r,e);return e.setFoldLine(this.foldLine),e},this.restoreRange=function(e){return l(e,this.start)}}.call(o.prototype)}),define("ace/edit_session/folding",["require","exports","module","ace/range","ace/edit_session/fold_line","ace/edit_session/fold","ace/token_iterator"],function(e,t,n){"use strict";function u(){this.getFoldAt=function(e,t,n){var r=this.getFoldLine(e);if(!r)return null;var i=r.folds;for(var s=0;s<i.length;s++){var o=i[s];if(o.range.contains(e,t)){if(n==1&&o.range.isEnd(e,t))continue;if(n==-1&&o.range.isStart(e,t))continue;return o}}},this.getFoldsInRange=function(e){var t=e.start,n=e.end,r=this.$foldData,i=[];t.column+=1,n.column-=1;for(var s=0;s<r.length;s++){var o=r[s].range.compareRange(e);if(o==2)continue;if(o==-2)break;var u=r[s].folds;for(var a=0;a<u.length;a++){var f=u[a];o=f.range.compareRange(e);if(o==-2)break;if(o==2)continue;if(o==42)break;i.push(f)}}return t.column-=1,n.column+=1,i},this.getFoldsInRangeList=function(e){if(Array.isArray(e)){var t=[];e.forEach(function(e){t=t.concat(this.getFoldsInRange(e))},this)}else var t=this.getFoldsInRange(e);return t},this.getAllFolds=function(){var e=[],t=this.$foldData;for(var n=0;n<t.length;n++)for(var r=0;r<t[n].folds.length;r++)e.push(t[n].folds[r]);return e},this.getFoldStringAt=function(e,t,n,r){r=r||this.getFoldLine(e);if(!r)return null;var i={end:{column:0}},s,o;for(var u=0;u<r.folds.length;u++){o=r.folds[u];var a=o.range.compareEnd(e,t);if(a==-1){s=this.getLine(o.start.row).substring(i.end.column,o.start.column);break}if(a===0)return null;i=o}return s||(s=this.getLine(o.start.row).substring(i.end.column)),n==-1?s.substring(0,t-i.end.column):n==1?s.substring(t-i.end.column):s},this.getFoldLine=function(e,t){var n=this.$foldData,r=0;t&&(r=n.indexOf(t)),r==-1&&(r=0);for(r;r<n.length;r++){var i=n[r];if(i.start.row<=e&&i.end.row>=e)return i;if(i.end.row>e)return null}return null},this.getNextFoldLine=function(e,t){var n=this.$foldData,r=0;t&&(r=n.indexOf(t)),r==-1&&(r=0);for(r;r<n.length;r++){var i=n[r];if(i.end.row>=e)return i}return null},this.getFoldedRowCount=function(e,t){var n=this.$foldData,r=t-e+1;for(var i=0;i<n.length;i++){var s=n[i],o=s.end.row,u=s.start.row;if(o>=t){u<t&&(u>=e?r-=t-u:r=0);break}o>=e&&(u>=e?r-=o-u:r-=o-e+1)}return r},this.$addFoldLine=function(e){return this.$foldData.push(e),this.$foldData.sort(function(e,t){return e.start.row-t.start.row}),e},this.addFold=function(e,t){var n=this.$foldData,r=!1,o;e instanceof s?o=e:(o=new s(t,e),o.collapseChildren=t.collapseChildren),this.$clipRangeToDocument(o.range);var u=o.start.row,a=o.start.column,f=o.end.row,l=o.end.column;if(u<f||u==f&&a<=l-2){var c=this.getFoldAt(u,a,1),h=this.getFoldAt(f,l,-1);if(c&&h==c)return c.addSubFold(o);c&&!c.range.isStart(u,a)&&this.removeFold(c),h&&!h.range.isEnd(f,l)&&this.removeFold(h);var p=this.getFoldsInRange(o.range);p.length>0&&(this.removeFolds(p),p.forEach(function(e){o.addSubFold(e)}));for(var d=0;d<n.length;d++){var v=n[d];if(f==v.start.row){v.addFold(o),r=!0;break}if(u==v.end.row){v.addFold(o),r=!0;if(!o.sameRow){var m=n[d+1];if(m&&m.start.row==f){v.merge(m);break}}break}if(f<=v.start.row)break}return r||(v=this.$addFoldLine(new i(this.$foldData,o))),this.$useWrapMode?this.$updateWrapData(v.start.row,v.start.row):this.$updateRowLengthCache(v.start.row,v.start.row),this.$modified=!0,this._signal("changeFold",{data:o,action:"add"}),o}throw new Error("The range has to be at least 2 characters width")},this.addFolds=function(e){e.forEach(function(e){this.addFold(e)},this)},this.removeFold=function(e){var t=e.foldLine,n=t.start.row,r=t.end.row,i=this.$foldData,s=t.folds;if(s.length==1)i.splice(i.indexOf(t),1);else if(t.range.isEnd(e.end.row,e.end.column))s.pop(),t.end.row=s[s.length-1].end.row,t.end.column=s[s.length-1].end.column;else if(t.range.isStart(e.start.row,e.start.column))s.shift(),t.start.row=s[0].start.row,t.start.column=s[0].start.column;else if(e.sameRow)s.splice(s.indexOf(e),1);else{var o=t.split(e.start.row,e.start.column);s=o.folds,s.shift(),o.start.row=s[0].start.row,o.start.column=s[0].start.column}this.$updating||(this.$useWrapMode?this.$updateWrapData(n,r):this.$updateRowLengthCache(n,r)),this.$modified=!0,this._signal("changeFold",{data:e,action:"remove"})},this.removeFolds=function(e){var t=[];for(var n=0;n<e.length;n++)t.push(e[n]);t.forEach(function(e){this.removeFold(e)},this),this.$modified=!0},this.expandFold=function(e){this.removeFold(e),e.subFolds.forEach(function(t){e.restoreRange(t),this.addFold(t)},this),e.collapseChildren>0&&this.foldAll(e.start.row+1,e.end.row,e.collapseChildren-1),e.subFolds=[]},this.expandFolds=function(e){e.forEach(function(e){this.expandFold(e)},this)},this.unfold=function(e,t){var n,i;e==null?(n=new r(0,0,this.getLength(),0),t=!0):typeof e=="number"?n=new r(e,0,e,this.getLine(e).length):"row"in e?n=r.fromPoints(e,e):n=e,i=this.getFoldsInRangeList(n);if(t)this.removeFolds(i);else{var s=i;while(s.length)this.expandFolds(s),s=this.getFoldsInRangeList(n)}if(i.length)return i},this.isRowFolded=function(e,t){return!!this.getFoldLine(e,t)},this.getRowFoldEnd=function(e,t){var n=this.getFoldLine(e,t);return n?n.end.row:e},this.getRowFoldStart=function(e,t){var n=this.getFoldLine(e,t);return n?n.start.row:e},this.getFoldDisplayLine=function(e,t,n,r,i){r==null&&(r=e.start.row),i==null&&(i=0),t==null&&(t=e.end.row),n==null&&(n=this.getLine(t).length);var s=this.doc,o="";return e.walk(function(e,t,n,u){if(t<r)return;if(t==r){if(n<i)return;u=Math.max(i,u)}e!=null?o+=e:o+=s.getLine(t).substring(u,n)},t,n),o},this.getDisplayLine=function(e,t,n,r){var i=this.getFoldLine(e);if(!i){var s;return s=this.doc.getLine(e),s.substring(r||0,t||s.length)}return this.getFoldDisplayLine(i,e,t,n,r)},this.$cloneFoldData=function(){var e=[];return e=this.$foldData.map(function(t){var n=t.folds.map(function(e){return e.clone()});return new i(e,n)}),e},this.toggleFold=function(e){var t=this.selection,n=t.getRange(),r,i;if(n.isEmpty()){var s=n.start;r=this.getFoldAt(s.row,s.column);if(r){this.expandFold(r);return}(i=this.findMatchingBracket(s))?n.comparePoint(i)==1?n.end=i:(n.start=i,n.start.column++,n.end.column--):(i=this.findMatchingBracket({row:s.row,column:s.column+1}))?(n.comparePoint(i)==1?n.end=i:n.start=i,n.start.column++):n=this.getCommentFoldRange(s.row,s.column)||n}else{var o=this.getFoldsInRange(n);if(e&&o.length){this.expandFolds(o);return}o.length==1&&(r=o[0])}r||(r=this.getFoldAt(n.start.row,n.start.column));if(r&&r.range.toString()==n.toString()){this.expandFold(r);return}var u="...";if(!n.isMultiLine()){u=this.getTextRange(n);if(u.length<4)return;u=u.trim().substring(0,2)+".."}this.addFold(u,n)},this.getCommentFoldRange=function(e,t,n){var i=new o(this,e,t),s=i.getCurrentToken(),u=s.type;if(s&&/^comment|string/.test(u)){u=u.match(/comment|string/)[0],u=="comment"&&(u+="|doc-start");var a=new RegExp(u),f=new r;if(n!=1){do s=i.stepBackward();while(s&&a.test(s.type));i.stepForward()}f.start.row=i.getCurrentTokenRow(),f.start.column=i.getCurrentTokenColumn()+2,i=new o(this,e,t);if(n!=-1){var l=-1;do{s=i.stepForward();if(l==-1){var c=this.getState(i.$row);a.test(c)||(l=i.$row)}else if(i.$row>l)break}while(s&&a.test(s.type));s=i.stepBackward()}else s=i.getCurrentToken();return f.end.row=i.getCurrentTokenRow(),f.end.column=i.getCurrentTokenColumn()+s.value.length-2,f}},this.foldAll=function(e,t,n){n==undefined&&(n=1e5);var r=this.foldWidgets;if(!r)return;t=t||this.getLength(),e=e||0;for(var i=e;i<t;i++){r[i]==null&&(r[i]=this.getFoldWidget(i));if(r[i]!="start")continue;var s=this.getFoldWidgetRange(i);if(s&&s.isMultiLine()&&s.end.row<=t&&s.start.row>=e){i=s.end.row;try{var o=this.addFold("...",s);o&&(o.collapseChildren=n)}catch(u){}}}},this.$foldStyles={manual:1,markbegin:1,markbeginend:1},this.$foldStyle="markbegin",this.setFoldStyle=function(e){if(!this.$foldStyles[e])throw new Error("invalid fold style: "+e+"["+Object.keys(this.$foldStyles).join(", ")+"]");if(this.$foldStyle==e)return;this.$foldStyle=e,e=="manual"&&this.unfold();var t=this.$foldMode;this.$setFolding(null),this.$setFolding(t)},this.$setFolding=function(e){if(this.$foldMode==e)return;this.$foldMode=e,this.off("change",this.$updateFoldWidgets),this.off("tokenizerUpdate",this.$tokenizerUpdateFoldWidgets),this._signal("changeAnnotation");if(!e||this.$foldStyle=="manual"){this.foldWidgets=null;return}this.foldWidgets=[],this.getFoldWidget=e.getFoldWidget.bind(e,this,this.$foldStyle),this.getFoldWidgetRange=e.getFoldWidgetRange.bind(e,this,this.$foldStyle),this.$updateFoldWidgets=this.updateFoldWidgets.bind(this),this.$tokenizerUpdateFoldWidgets=this.tokenizerUpdateFoldWidgets.bind(this),this.on("change",this.$updateFoldWidgets),this.on("tokenizerUpdate",this.$tokenizerUpdateFoldWidgets)},this.getParentFoldRangeData=function(e,t){var n=this.foldWidgets;if(!n||t&&n[e])return{};var r=e-1,i;while(r>=0){var s=n[r];s==null&&(s=n[r]=this.getFoldWidget(r));if(s=="start"){var o=this.getFoldWidgetRange(r);i||(i=o);if(o&&o.end.row>=e)break}r--}return{range:r!==-1&&o,firstRange:i}},this.onFoldWidgetClick=function(e,t){t=t.domEvent;var n={children:t.shiftKey,all:t.ctrlKey||t.metaKey,siblings:t.altKey},r=this.$toggleFoldWidget(e,n);if(!r){var i=t.target||t.srcElement;i&&/ace_fold-widget/.test(i.className)&&(i.className+=" ace_invalid")}},this.$toggleFoldWidget=function(e,t){if(!this.getFoldWidget)return;var n=this.getFoldWidget(e),r=this.getLine(e),i=n==="end"?-1:1,s=this.getFoldAt(e,i===-1?0:r.length,i);if(s)return t.children||t.all?this.removeFold(s):this.expandFold(s),s;var o=this.getFoldWidgetRange(e,!0);if(o&&!o.isMultiLine()){s=this.getFoldAt(o.start.row,o.start.column,1);if(s&&o.isEqual(s.range))return this.removeFold(s),s}if(t.siblings){var u=this.getParentFoldRangeData(e);if(u.range)var a=u.range.start.row+1,f=u.range.end.row;this.foldAll(a,f,t.all?1e4:0)}else t.children?(f=o?o.end.row:this.getLength(),this.foldAll(e+1,f,t.all?1e4:0)):o&&(t.all&&(o.collapseChildren=1e4),this.addFold("...",o));return o},this.toggleFoldWidget=function(e){var t=this.selection.getCursor().row;t=this.getRowFoldStart(t);var n=this.$toggleFoldWidget(t,{});if(n)return;var r=this.getParentFoldRangeData(t,!0);n=r.range||r.firstRange;if(n){t=n.start.row;var i=this.getFoldAt(t,this.getLine(t).length,1);i?this.removeFold(i):this.addFold("...",n)}},this.updateFoldWidgets=function(e){var t=e.start.row,n=e.end.row-t;if(n===0)this.foldWidgets[t]=null;else if(e.action=="remove")this.foldWidgets.splice(t,n+1,null);else{var r=Array(n+1);r.unshift(t,1),this.foldWidgets.splice.apply(this.foldWidgets,r)}},this.tokenizerUpdateFoldWidgets=function(e){var t=e.data;t.first!=t.last&&this.foldWidgets.length>t.first&&this.foldWidgets.splice(t.first,this.foldWidgets.length)}}var r=e("../range").Range,i=e("./fold_line").FoldLine,s=e("./fold").Fold,o=e("../token_iterator").TokenIterator;t.Folding=u}),define("ace/edit_session/bracket_match",["require","exports","module","ace/token_iterator","ace/range"],function(e,t,n){"use strict";function s(){this.findMatchingBracket=function(e,t){if(e.column==0)return null;var n=t||this.getLine(e.row).charAt(e.column-1);if(n=="")return null;var r=n.match(/([\(\[\{])|([\)\]\}])/);return r?r[1]?this.$findClosingBracket(r[1],e):this.$findOpeningBracket(r[2],e):null},this.getBracketRange=function(e){var t=this.getLine(e.row),n=!0,r,s=t.charAt(e.column-1),o=s&&s.match(/([\(\[\{])|([\)\]\}])/);o||(s=t.charAt(e.column),e={row:e.row,column:e.column+1},o=s&&s.match(/([\(\[\{])|([\)\]\}])/),n=!1);if(!o)return null;if(o[1]){var u=this.$findClosingBracket(o[1],e);if(!u)return null;r=i.fromPoints(e,u),n||(r.end.column++,r.start.column--),r.cursor=r.end}else{var u=this.$findOpeningBracket(o[2],e);if(!u)return null;r=i.fromPoints(u,e),n||(r.start.column++,r.end.column--),r.cursor=r.start}return r},this.$brackets={")":"(","(":")","]":"[","[":"]","{":"}","}":"{"},this.$findOpeningBracket=function(e,t,n){var i=this.$brackets[e],s=1,o=new r(this,t.row,t.column),u=o.getCurrentToken();u||(u=o.stepForward());if(!u)return;n||(n=new RegExp("(\\.?"+u.type.replace(".","\\.").replace("rparen",".paren").replace(/\b(?:end)\b/,"(?:start|begin|end)")+")+"));var a=t.column-o.getCurrentTokenColumn()-2,f=u.value;for(;;){while(a>=0){var l=f.charAt(a);if(l==i){s-=1;if(s==0)return{row:o.getCurrentTokenRow(),column:a+o.getCurrentTokenColumn()}}else l==e&&(s+=1);a-=1}do u=o.stepBackward();while(u&&!n.test(u.type));if(u==null)break;f=u.value,a=f.length-1}return null},this.$findClosingBracket=function(e,t,n){var i=this.$brackets[e],s=1,o=new r(this,t.row,t.column),u=o.getCurrentToken();u||(u=o.stepForward());if(!u)return;n||(n=new RegExp("(\\.?"+u.type.replace(".","\\.").replace("lparen",".paren").replace(/\b(?:start|begin)\b/,"(?:start|begin|end)")+")+"));var a=t.column-o.getCurrentTokenColumn();for(;;){var f=u.value,l=f.length;while(a<l){var c=f.charAt(a);if(c==i){s-=1;if(s==0)return{row:o.getCurrentTokenRow(),column:a+o.getCurrentTokenColumn()}}else c==e&&(s+=1);a+=1}do u=o.stepForward();while(u&&!n.test(u.type));if(u==null)break;a=0}return null}}var r=e("../token_iterator").TokenIterator,i=e("../range").Range;t.BracketMatch=s}),define("ace/edit_session",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/bidihandler","ace/config","ace/lib/event_emitter","ace/selection","ace/mode/text","ace/range","ace/document","ace/background_tokenizer","ace/search_highlight","ace/edit_session/folding","ace/edit_session/bracket_match"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/lang"),s=e("./bidihandler").BidiHandler,o=e("./config"),u=e("./lib/event_emitter").EventEmitter,a=e("./selection").Selection,f=e("./mode/text").Mode,l=e("./range").Range,c=e("./document").Document,h=e("./background_tokenizer").BackgroundTokenizer,p=e("./search_highlight").SearchHighlight,d=function(e,t){this.$breakpoints=[],this.$decorations=[],this.$frontMarkers={},this.$backMarkers={},this.$markerId=1,this.$undoSelect=!0,this.$foldData=[],this.id="session"+ ++d.$uid,this.$foldData.toString=function(){return this.join("\n")},this.on("changeFold",this.onChangeFold.bind(this)),this.$onChange=this.onChange.bind(this);if(typeof e!="object"||!e.getLine)e=new c(e);this.$bidiHandler=new s(this),this.setDocument(e),this.selection=new a(this),o.resetOptions(this),this.setMode(t),o._signal("session",this)};d.$uid=0,function(){function m(e){return e<4352?!1:e>=4352&&e<=4447||e>=4515&&e<=4519||e>=4602&&e<=4607||e>=9001&&e<=9002||e>=11904&&e<=11929||e>=11931&&e<=12019||e>=12032&&e<=12245||e>=12272&&e<=12283||e>=12288&&e<=12350||e>=12353&&e<=12438||e>=12441&&e<=12543||e>=12549&&e<=12589||e>=12593&&e<=12686||e>=12688&&e<=12730||e>=12736&&e<=12771||e>=12784&&e<=12830||e>=12832&&e<=12871||e>=12880&&e<=13054||e>=13056&&e<=19903||e>=19968&&e<=42124||e>=42128&&e<=42182||e>=43360&&e<=43388||e>=44032&&e<=55203||e>=55216&&e<=55238||e>=55243&&e<=55291||e>=63744&&e<=64255||e>=65040&&e<=65049||e>=65072&&e<=65106||e>=65108&&e<=65126||e>=65128&&e<=65131||e>=65281&&e<=65376||e>=65504&&e<=65510}r.implement(this,u),this.setDocument=function(e){this.doc&&this.doc.removeListener("change",this.$onChange),this.doc=e,e.on("change",this.$onChange),this.bgTokenizer&&this.bgTokenizer.setDocument(this.getDocument()),this.resetCaches()},this.getDocument=function(){return this.doc},this.$resetRowCache=function(e){if(!e){this.$docRowCache=[],this.$screenRowCache=[];return}var t=this.$docRowCache.length,n=this.$getRowCacheIndex(this.$docRowCache,e)+1;t>n&&(this.$docRowCache.splice(n,t),this.$screenRowCache.splice(n,t))},this.$getRowCacheIndex=function(e,t){var n=0,r=e.length-1;while(n<=r){var i=n+r>>1,s=e[i];if(t>s)n=i+1;else{if(!(t<s))return i;r=i-1}}return n-1},this.resetCaches=function(){this.$modified=!0,this.$wrapData=[],this.$rowLengthCache=[],this.$resetRowCache(0),this.bgTokenizer&&this.bgTokenizer.start(0)},this.onChangeFold=function(e){var t=e.data;this.$resetRowCache(t.start.row)},this.onChange=function(e){this.$modified=!0,this.$bidiHandler.onChange(e),this.$resetRowCache(e.start.row);var t=this.$updateInternalDataOnChange(e);!this.$fromUndo&&this.$undoManager&&!e.ignore&&(this.$deltasDoc.push(e),t&&t.length!=0&&this.$deltasFold.push({action:"removeFolds",folds:t}),this.$informUndoManager.schedule()),this.bgTokenizer&&this.bgTokenizer.$updateOnChange(e),this._signal("change",e)},this.setValue=function(e){this.doc.setValue(e),this.selection.moveTo(0,0),this.$resetRowCache(0),this.$deltas=[],this.$deltasDoc=[],this.$deltasFold=[],this.setUndoManager(this.$undoManager),this.getUndoManager().reset()},this.getValue=this.toString=function(){return this.doc.getValue()},this.getSelection=function(){return this.selection},this.getState=function(e){return this.bgTokenizer.getState(e)},this.getTokens=function(e){return this.bgTokenizer.getTokens(e)},this.getTokenAt=function(e,t){var n=this.bgTokenizer.getTokens(e),r,i=0;if(t==null){var s=n.length-1;i=this.getLine(e).length}else for(var s=0;s<n.length;s++){i+=n[s].value.length;if(i>=t)break}return r=n[s],r?(r.index=s,r.start=i-r.value.length,r):null},this.setUndoManager=function(e){this.$undoManager=e,this.$deltas=[],this.$deltasDoc=[],this.$deltasFold=[],this.$informUndoManager&&this.$informUndoManager.cancel();if(e){var t=this;this.$syncInformUndoManager=function(){t.$informUndoManager.cancel(),t.$deltasFold.length&&(t.$deltas.push({group:"fold",deltas:t.$deltasFold}),t.$deltasFold=[]),t.$deltasDoc.length&&(t.$deltas.push({group:"doc",deltas:t.$deltasDoc}),t.$deltasDoc=[]),t.$deltas.length>0&&e.execute({action:"aceupdate",args:[t.$deltas,t],merge:t.mergeUndoDeltas}),t.mergeUndoDeltas=!1,t.$deltas=[]},this.$informUndoManager=i.delayedCall(this.$syncInformUndoManager)}},this.markUndoGroup=function(){this.$syncInformUndoManager&&this.$syncInformUndoManager()},this.$defaultUndoManager={undo:function(){},redo:function(){},reset:function(){}},this.getUndoManager=function(){return this.$undoManager||this.$defaultUndoManager},this.getTabString=function(){return this.getUseSoftTabs()?i.stringRepeat(" ",this.getTabSize()):"	"},this.setUseSoftTabs=function(e){this.setOption("useSoftTabs",e)},this.getUseSoftTabs=function(){return this.$useSoftTabs&&!this.$mode.$indentWithTabs},this.setTabSize=function(e){this.setOption("tabSize",e)},this.getTabSize=function(){return this.$tabSize},this.isTabStop=function(e){return this.$useSoftTabs&&e.column%this.$tabSize===0},this.setNavigateWithinSoftTabs=function(e){this.setOption("navigateWithinSoftTabs",e)},this.getNavigateWithinSoftTabs=function(){return this.$navigateWithinSoftTabs},this.$overwrite=!1,this.setOverwrite=function(e){this.setOption("overwrite",e)},this.getOverwrite=function(){return this.$overwrite},this.toggleOverwrite=function(){this.setOverwrite(!this.$overwrite)},this.addGutterDecoration=function(e,t){this.$decorations[e]||(this.$decorations[e]=""),this.$decorations[e]+=" "+t,this._signal("changeBreakpoint",{})},this.removeGutterDecoration=function(e,t){this.$decorations[e]=(this.$decorations[e]||"").replace(" "+t,""),this._signal("changeBreakpoint",{})},this.getBreakpoints=function(){return this.$breakpoints},this.setBreakpoints=function(e){this.$breakpoints=[];for(var t=0;t<e.length;t++)this.$breakpoints[e[t]]="ace_breakpoint";this._signal("changeBreakpoint",{})},this.clearBreakpoints=function(){this.$breakpoints=[],this._signal("changeBreakpoint",{})},this.setBreakpoint=function(e,t){t===undefined&&(t="ace_breakpoint"),t?this.$breakpoints[e]=t:delete this.$breakpoints[e],this._signal("changeBreakpoint",{})},this.clearBreakpoint=function(e){delete this.$breakpoints[e],this._signal("changeBreakpoint",{})},this.addMarker=function(e,t,n,r){var i=this.$markerId++,s={range:e,type:n||"line",renderer:typeof n=="function"?n:null,clazz:t,inFront:!!r,id:i};return r?(this.$frontMarkers[i]=s,this._signal("changeFrontMarker")):(this.$backMarkers[i]=s,this._signal("changeBackMarker")),i},this.addDynamicMarker=function(e,t){if(!e.update)return;var n=this.$markerId++;return e.id=n,e.inFront=!!t,t?(this.$frontMarkers[n]=e,this._signal("changeFrontMarker")):(this.$backMarkers[n]=e,this._signal("changeBackMarker")),e},this.removeMarker=function(e){var t=this.$frontMarkers[e]||this.$backMarkers[e];if(!t)return;var n=t.inFront?this.$frontMarkers:this.$backMarkers;t&&(delete n[e],this._signal(t.inFront?"changeFrontMarker":"changeBackMarker"))},this.getMarkers=function(e){return e?this.$frontMarkers:this.$backMarkers},this.highlight=function(e){if(!this.$searchHighlight){var t=new p(null,"ace_selected-word","text");this.$searchHighlight=this.addDynamicMarker(t)}this.$searchHighlight.setRegexp(e)},this.highlightLines=function(e,t,n,r){typeof t!="number"&&(n=t,t=e),n||(n="ace_step");var i=new l(e,0,t,Infinity);return i.id=this.addMarker(i,n,"fullLine",r),i},this.setAnnotations=function(e){this.$annotations=e,this._signal("changeAnnotation",{})},this.getAnnotations=function(){return this.$annotations||[]},this.clearAnnotations=function(){this.setAnnotations([])},this.$detectNewLine=function(e){var t=e.match(/^.*?(\r?\n)/m);t?this.$autoNewLine=t[1]:this.$autoNewLine="\n"},this.getWordRange=function(e,t){var n=this.getLine(e),r=!1;t>0&&(r=!!n.charAt(t-1).match(this.tokenRe)),r||(r=!!n.charAt(t).match(this.tokenRe));if(r)var i=this.tokenRe;else if(/^\s+$/.test(n.slice(t-1,t+1)))var i=/\s/;else var i=this.nonTokenRe;var s=t;if(s>0){do s--;while(s>=0&&n.charAt(s).match(i));s++}var o=t;while(o<n.length&&n.charAt(o).match(i))o++;return new l(e,s,e,o)},this.getAWordRange=function(e,t){var n=this.getWordRange(e,t),r=this.getLine(n.end.row);while(r.charAt(n.end.column).match(/[ \t]/))n.end.column+=1;return n},this.setNewLineMode=function(e){this.doc.setNewLineMode(e)},this.getNewLineMode=function(){return this.doc.getNewLineMode()},this.setUseWorker=function(e){this.setOption("useWorker",e)},this.getUseWorker=function(){return this.$useWorker},this.onReloadTokenizer=function(e){var t=e.data;this.bgTokenizer.start(t.first),this._signal("tokenizerUpdate",e)},this.$modes={},this.$mode=null,this.$modeId=null,this.setMode=function(e,t){if(e&&typeof e=="object"){if(e.getTokenizer)return this.$onChangeMode(e);var n=e,r=n.path}else r=e||"ace/mode/text";this.$modes["ace/mode/text"]||(this.$modes["ace/mode/text"]=new f);if(this.$modes[r]&&!n){this.$onChangeMode(this.$modes[r]),t&&t();return}this.$modeId=r,o.loadModule(["mode",r],function(e){if(this.$modeId!==r)return t&&t();this.$modes[r]&&!n?this.$onChangeMode(this.$modes[r]):e&&e.Mode&&(e=new e.Mode(n),n||(this.$modes[r]=e,e.$id=r),this.$onChangeMode(e)),t&&t()}.bind(this)),this.$mode||this.$onChangeMode(this.$modes["ace/mode/text"],!0)},this.$onChangeMode=function(e,t){t||(this.$modeId=e.$id);if(this.$mode===e)return;this.$mode=e,this.$stopWorker(),this.$useWorker&&this.$startWorker();var n=e.getTokenizer();if(n.addEventListener!==undefined){var r=this.onReloadTokenizer.bind(this);n.addEventListener("update",r)}if(!this.bgTokenizer){this.bgTokenizer=new h(n);var i=this;this.bgTokenizer.addEventListener("update",function(e){i._signal("tokenizerUpdate",e)})}else this.bgTokenizer.setTokenizer(n);this.bgTokenizer.setDocument(this.getDocument()),this.tokenRe=e.tokenRe,this.nonTokenRe=e.nonTokenRe,t||(e.attachToSession&&e.attachToSession(this),this.$options.wrapMethod.set.call(this,this.$wrapMethod),this.$setFolding(e.foldingRules),this.bgTokenizer.start(0),this._emit("changeMode"))},this.$stopWorker=function(){this.$worker&&(this.$worker.terminate(),this.$worker=null)},this.$startWorker=function(){try{this.$worker=this.$mode.createWorker(this)}catch(e){o.warn("Could not load worker",e),this.$worker=null}},this.getMode=function(){return this.$mode},this.$scrollTop=0,this.setScrollTop=function(e){if(this.$scrollTop===e||isNaN(e))return;this.$scrollTop=e,this._signal("changeScrollTop",e)},this.getScrollTop=function(){return this.$scrollTop},this.$scrollLeft=0,this.setScrollLeft=function(e){if(this.$scrollLeft===e||isNaN(e))return;this.$scrollLeft=e,this._signal("changeScrollLeft",e)},this.getScrollLeft=function(){return this.$scrollLeft},this.getScreenWidth=function(){return this.$computeWidth(),this.lineWidgets?Math.max(this.getLineWidgetMaxWidth(),this.screenWidth):this.screenWidth},this.getLineWidgetMaxWidth=function(){if(this.lineWidgetsWidth!=null)return this.lineWidgetsWidth;var e=0;return this.lineWidgets.forEach(function(t){t&&t.screenWidth>e&&(e=t.screenWidth)}),this.lineWidgetWidth=e},this.$computeWidth=function(e){if(this.$modified||e){this.$modified=!1;if(this.$useWrapMode)return this.screenWidth=this.$wrapLimit;var t=this.doc.getAllLines(),n=this.$rowLengthCache,r=0,i=0,s=this.$foldData[i],o=s?s.start.row:Infinity,u=t.length;for(var a=0;a<u;a++){if(a>o){a=s.end.row+1;if(a>=u)break;s=this.$foldData[i++],o=s?s.start.row:Infinity}n[a]==null&&(n[a]=this.$getStringScreenWidth(t[a])[0]),n[a]>r&&(r=n[a])}this.screenWidth=r}},this.getLine=function(e){return this.doc.getLine(e)},this.getLines=function(e,t){return this.doc.getLines(e,t)},this.getLength=function(){return this.doc.getLength()},this.getTextRange=function(e){return this.doc.getTextRange(e||this.selection.getRange())},this.insert=function(e,t){return this.doc.insert(e,t)},this.remove=function(e){return this.doc.remove(e)},this.removeFullLines=function(e,t){return this.doc.removeFullLines(e,t)},this.undoChanges=function(e,t){if(!e.length)return;this.$fromUndo=!0;var n=null;for(var r=e.length-1;r!=-1;r--){var i=e[r];i.group=="doc"?(this.doc.revertDeltas(i.deltas),n=this.$getUndoSelection(i.deltas,!0,n)):i.deltas.forEach(function(e){this.addFolds(e.folds)},this)}return this.$fromUndo=!1,n&&this.$undoSelect&&!t&&this.selection.setSelectionRange(n),n},this.redoChanges=function(e,t){if(!e.length)return;this.$fromUndo=!0;var n=null;for(var r=0;r<e.length;r++){var i=e[r];i.group=="doc"&&(this.doc.applyDeltas(i.deltas),n=this.$getUndoSelection(i.deltas,!1,n))}return this.$fromUndo=!1,n&&this.$undoSelect&&!t&&this.selection.setSelectionRange(n),n},this.setUndoSelect=function(e){this.$undoSelect=e},this.$getUndoSelection=function(e,t,n){function r(e){return t?e.action!=="insert":e.action==="insert"}var i=e[0],s,o,u=!1;r(i)?(s=l.fromPoints(i.start,i.end),u=!0):(s=l.fromPoints(i.start,i.start),u=!1);for(var a=1;a<e.length;a++)i=e[a],r(i)?(o=i.start,s.compare(o.row,o.column)==-1&&s.setStart(o),o=i.end,s.compare(o.row,o.column)==1&&s.setEnd(o),u=!0):(o=i.start,s.compare(o.row,o.column)==-1&&(s=l.fromPoints(i.start,i.start)),u=!1);if(n!=null){l.comparePoints(n.start,s.start)===0&&(n.start.column+=s.end.column-s.start.column,n.end.column+=s.end.column-s.start.column);var f=n.compareRange(s);f==1?s.setStart(n.start):f==-1&&s.setEnd(n.end)}return s},this.replace=function(e,t){return this.doc.replace(e,t)},this.moveText=function(e,t,n){var r=this.getTextRange(e),i=this.getFoldsInRange(e),s=l.fromPoints(t,t);if(!n){this.remove(e);var o=e.start.row-e.end.row,u=o?-e.end.column:e.start.column-e.end.column;u&&(s.start.row==e.end.row&&s.start.column>e.end.column&&(s.start.column+=u),s.end.row==e.end.row&&s.end.column>e.end.column&&(s.end.column+=u)),o&&s.start.row>=e.end.row&&(s.start.row+=o,s.end.row+=o)}s.end=this.insert(s.start,r);if(i.length){var a=e.start,f=s.start,o=f.row-a.row,u=f.column-a.column;this.addFolds(i.map(function(e){return e=e.clone(),e.start.row==a.row&&(e.start.column+=u),e.end.row==a.row&&(e.end.column+=u),e.start.row+=o,e.end.row+=o,e}))}return s},this.indentRows=function(e,t,n){n=n.replace(/\t/g,this.getTabString());for(var r=e;r<=t;r++)this.doc.insertInLine({row:r,column:0},n)},this.outdentRows=function(e){var t=e.collapseRows(),n=new l(0,0,0,0),r=this.getTabSize();for(var i=t.start.row;i<=t.end.row;++i){var s=this.getLine(i);n.start.row=i,n.end.row=i;for(var o=0;o<r;++o)if(s.charAt(o)!=" ")break;o<r&&s.charAt(o)=="	"?(n.start.column=o,n.end.column=o+1):(n.start.column=0,n.end.column=o),this.remove(n)}},this.$moveLines=function(e,t,n){e=this.getRowFoldStart(e),t=this.getRowFoldEnd(t);if(n<0){var r=this.getRowFoldStart(e+n);if(r<0)return 0;var i=r-e}else if(n>0){var r=this.getRowFoldEnd(t+n);if(r>this.doc.getLength()-1)return 0;var i=r-t}else{e=this.$clipRowToDocument(e),t=this.$clipRowToDocument(t);var i=t-e+1}var s=new l(e,0,t,Number.MAX_VALUE),o=this.getFoldsInRange(s).map(function(e){return e=e.clone(),e.start.row+=i,e.end.row+=i,e}),u=n==0?this.doc.getLines(e,t):this.doc.removeFullLines(e,t);return this.doc.insertFullLines(e+i,u),o.length&&this.addFolds(o),i},this.moveLinesUp=function(e,t){return this.$moveLines(e,t,-1)},this.moveLinesDown=function(e,t){return this.$moveLines(e,t,1)},this.duplicateLines=function(e,t){return this.$moveLines(e,t,0)},this.$clipRowToDocument=function(e){return Math.max(0,Math.min(e,this.doc.getLength()-1))},this.$clipColumnToRow=function(e,t){return t<0?0:Math.min(this.doc.getLine(e).length,t)},this.$clipPositionToDocument=function(e,t){t=Math.max(0,t);if(e<0)e=0,t=0;else{var n=this.doc.getLength();e>=n?(e=n-1,t=this.doc.getLine(n-1).length):t=Math.min(this.doc.getLine(e).length,t)}return{row:e,column:t}},this.$clipRangeToDocument=function(e){e.start.row<0?(e.start.row=0,e.start.column=0):e.start.column=this.$clipColumnToRow(e.start.row,e.start.column);var t=this.doc.getLength()-1;return e.end.row>t?(e.end.row=t,e.end.column=this.doc.getLine(t).length):e.end.column=this.$clipColumnToRow(e.end.row,e.end.column),e},this.$wrapLimit=80,this.$useWrapMode=!1,this.$wrapLimitRange={min:null,max:null},this.setUseWrapMode=function(e){if(e!=this.$useWrapMode){this.$useWrapMode=e,this.$modified=!0,this.$resetRowCache(0);if(e){var t=this.getLength();this.$wrapData=Array(t),this.$updateWrapData(0,t-1)}this._signal("changeWrapMode")}},this.getUseWrapMode=function(){return this.$useWrapMode},this.setWrapLimitRange=function(e,t){if(this.$wrapLimitRange.min!==e||this.$wrapLimitRange.max!==t)this.$wrapLimitRange={min:e,max:t},this.$modified=!0,this.$bidiHandler.markAsDirty(),this.$useWrapMode&&this._signal("changeWrapMode")},this.adjustWrapLimit=function(e,t){var n=this.$wrapLimitRange;n.max<0&&(n={min:t,max:t});var r=this.$constrainWrapLimit(e,n.min,n.max);return r!=this.$wrapLimit&&r>1?(this.$wrapLimit=r,this.$modified=!0,this.$useWrapMode&&(this.$updateWrapData(0,this.getLength()-1),this.$resetRowCache(0),this._signal("changeWrapLimit")),!0):!1},this.$constrainWrapLimit=function(e,t,n){return t&&(e=Math.max(t,e)),n&&(e=Math.min(n,e)),e},this.getWrapLimit=function(){return this.$wrapLimit},this.setWrapLimit=function(e){this.setWrapLimitRange(e,e)},this.getWrapLimitRange=function(){return{min:this.$wrapLimitRange.min,max:this.$wrapLimitRange.max}},this.$updateInternalDataOnChange=function(e){var t=this.$useWrapMode,n=e.action,r=e.start,i=e.end,s=r.row,o=i.row,u=o-s,a=null;this.$updating=!0;if(u!=0)if(n==="remove"){this[t?"$wrapData":"$rowLengthCache"].splice(s,u);var f=this.$foldData;a=this.getFoldsInRange(e),this.removeFolds(a);var l=this.getFoldLine(i.row),c=0;if(l){l.addRemoveChars(i.row,i.column,r.column-i.column),l.shiftRow(-u);var h=this.getFoldLine(s);h&&h!==l&&(h.merge(l),l=h),c=f.indexOf(l)+1}for(c;c<f.length;c++){var l=f[c];l.start.row>=i.row&&l.shiftRow(-u)}o=s}else{var p=Array(u);p.unshift(s,0);var d=t?this.$wrapData:this.$rowLengthCache;d.splice.apply(d,p);var f=this.$foldData,l=this.getFoldLine(s),c=0;if(l){var v=l.range.compareInside(r.row,r.column);v==0?(l=l.split(r.row,r.column),l&&(l.shiftRow(u),l.addRemoveChars(o,0,i.column-r.column))):v==-1&&(l.addRemoveChars(s,0,i.column-r.column),l.shiftRow(u)),c=f.indexOf(l)+1}for(c;c<f.length;c++){var l=f[c];l.start.row>=s&&l.shiftRow(u)}}else{u=Math.abs(e.start.column-e.end.column),n==="remove"&&(a=this.getFoldsInRange(e),this.removeFolds(a),u=-u);var l=this.getFoldLine(s);l&&l.addRemoveChars(s,r.column,u)}return t&&this.$wrapData.length!=this.doc.getLength()&&console.error("doc.getLength() and $wrapData.length have to be the same!"),this.$updating=!1,t?this.$updateWrapData(s,o):this.$updateRowLengthCache(s,o),a},this.$updateRowLengthCache=function(e,t,n){this.$rowLengthCache[e]=null,this.$rowLengthCache[t]=null},this.$updateWrapData=function(e,t){var r=this.doc.getAllLines(),i=this.getTabSize(),o=this.$wrapData,u=this.$wrapLimit,a,f,l=e;t=Math.min(t,r.length-1);while(l<=t)f=this.getFoldLine(l,f),f?(a=[],f.walk(function(e,t,i,o){var u;if(e!=null){u=this.$getDisplayTokens(e,a.length),u[0]=n;for(var f=1;f<u.length;f++)u[f]=s}else u=this.$getDisplayTokens(r[t].substring(o,i),a.length);a=a.concat(u)}.bind(this),f.end.row,r[f.end.row].length+1),o[f.start.row]=this.$computeWrapSplits(a,u,i),l=f.end.row+1):(a=this.$getDisplayTokens(r[l]),o[l]=this.$computeWrapSplits(a,u,i),l++)};var e=1,t=2,n=3,s=4,a=9,c=10,d=11,v=12;this.$computeWrapSplits=function(e,r,i){function g(){var t=0;if(m===0)return t;if(p)for(var n=0;n<e.length;n++){var r=e[n];if(r==c)t+=1;else{if(r!=d){if(r==v)continue;break}t+=i}}return h&&p!==!1&&(t+=i),Math.min(t,m)}function y(t){var n=e.slice(f,t),r=n.length;n.join("").replace(/12/g,function(){r-=1}).replace(/2/g,function(){r-=1}),o.length||(b=g(),o.indent=b),l+=r,o.push(l),f=t}if(e.length==0)return[];var o=[],u=e.length,f=0,l=0,h=this.$wrapAsCode,p=this.$indentedSoftWrap,m=r<=Math.max(2*i,8)||p===!1?0:Math.floor(r/2),b=0;while(u-f>r-b){var w=f+r-b;if(e[w-1]>=c&&e[w]>=c){y(w);continue}if(e[w]==n||e[w]==s){for(w;w!=f-1;w--)if(e[w]==n)break;if(w>f){y(w);continue}w=f+r;for(w;w<e.length;w++)if(e[w]!=s)break;if(w==e.length)break;y(w);continue}var E=Math.max(w-(r-(r>>2)),f-1);while(w>E&&e[w]<n)w--;if(h){while(w>E&&e[w]<n)w--;while(w>E&&e[w]==a)w--}else while(w>E&&e[w]<c)w--;if(w>E){y(++w);continue}w=f+r,e[w]==t&&w--,y(w-b)}return o},this.$getDisplayTokens=function(n,r){var i=[],s;r=r||0;for(var o=0;o<n.length;o++){var u=n.charCodeAt(o);if(u==9){s=this.getScreenTabSize(i.length+r),i.push(d);for(var f=1;f<s;f++)i.push(v)}else u==32?i.push(c):u>39&&u<48||u>57&&u<64?i.push(a):u>=4352&&m(u)?i.push(e,t):i.push(e)}return i},this.$getStringScreenWidth=function(e,t,n){if(t==0)return[0,0];t==null&&(t=Infinity),n=n||0;var r,i;for(i=0;i<e.length;i++){r=e.charCodeAt(i),r==9?n+=this.getScreenTabSize(n):r>=4352&&m(r)?n+=2:n+=1;if(n>t)break}return[n,i]},this.lineWidgets=null,this.getRowLength=function(e){if(this.lineWidgets)var t=this.lineWidgets[e]&&this.lineWidgets[e].rowCount||0;else t=0;return!this.$useWrapMode||!this.$wrapData[e]?1+t:this.$wrapData[e].length+1+t},this.getRowLineCount=function(e){return!this.$useWrapMode||!this.$wrapData[e]?1:this.$wrapData[e].length+1},this.getRowWrapIndent=function(e){if(this.$useWrapMode){var t=this.screenToDocumentPosition(e,Number.MAX_VALUE),n=this.$wrapData[t.row];return n.length&&n[0]<t.column?n.indent:0}return 0},this.getScreenLastRowColumn=function(e){var t=this.screenToDocumentPosition(e,Number.MAX_VALUE);return this.documentToScreenColumn(t.row,t.column)},this.getDocumentLastRowColumn=function(e,t){var n=this.documentToScreenRow(e,t);return this.getScreenLastRowColumn(n)},this.getDocumentLastRowColumnPosition=function(e,t){var n=this.documentToScreenRow(e,t);return this.screenToDocumentPosition(n,Number.MAX_VALUE/10)},this.getRowSplitData=function(e){return this.$useWrapMode?this.$wrapData[e]:undefined},this.getScreenTabSize=function(e){return this.$tabSize-e%this.$tabSize},this.screenToDocumentRow=function(e,t){return this.screenToDocumentPosition(e,t).row},this.screenToDocumentColumn=function(e,t){return this.screenToDocumentPosition(e,t).column},this.screenToDocumentPosition=function(e,t,n){if(e<0)return{row:0,column:0};var r,i=0,s=0,o,u=0,a=0,f=this.$screenRowCache,l=this.$getRowCacheIndex(f,e),c=f.length;if(c&&l>=0)var u=f[l],i=this.$docRowCache[l],h=e>f[c-1];else var h=!c;var p=this.getLength()-1,d=this.getNextFoldLine(i),v=d?d.start.row:Infinity;while(u<=e){a=this.getRowLength(i);if(u+a>e||i>=p)break;u+=a,i++,i>v&&(i=d.end.row+1,d=this.getNextFoldLine(i,d),v=d?d.start.row:Infinity),h&&(this.$docRowCache.push(i),this.$screenRowCache.push(u))}if(d&&d.start.row<=i)r=this.getFoldDisplayLine(d),i=d.start.row;else{if(u+a<=e||i>p)return{row:p,column:this.getLine(p).length};r=this.getLine(i),d=null}var m=0,g=Math.floor(e-u);if(this.$useWrapMode){var y=this.$wrapData[i];y&&(o=y[g],g>0&&y.length&&(m=y.indent,s=y[g-1]||y[y.length-1],r=r.substring(s)))}return n!==undefined&&this.$bidiHandler.isBidiRow(u+g,i,g)&&(t=this.$bidiHandler.offsetToCol(n)),s+=this.$getStringScreenWidth(r,t-m)[1],this.$useWrapMode&&s>=o&&(s=o-1),d?d.idxToPosition(s):{row:i,column:s}},this.documentToScreenPosition=function(e,t){if(typeof t=="undefined")var n=this.$clipPositionToDocument(e.row,e.column);else n=this.$clipPositionToDocument(e,t);e=n.row,t=n.column;var r=0,i=null,s=null;s=this.getFoldAt(e,t,1),s&&(e=s.start.row,t=s.start.column);var o,u=0,a=this.$docRowCache,f=this.$getRowCacheIndex(a,e),l=a.length;if(l&&f>=0)var u=a[f],r=this.$screenRowCache[f],c=e>a[l-1];else var c=!l;var h=this.getNextFoldLine(u),p=h?h.start.row:Infinity;while(u<e){if(u>=p){o=h.end.row+1;if(o>e)break;h=this.getNextFoldLine(o,h),p=h?h.start.row:Infinity}else o=u+1;r+=this.getRowLength(u),u=o,c&&(this.$docRowCache.push(u),this.$screenRowCache.push(r))}var d="";h&&u>=p?(d=this.getFoldDisplayLine(h,e,t),i=h.start.row):(d=this.getLine(e).substring(0,t),i=e);var v=0;if(this.$useWrapMode){var m=this.$wrapData[i];if(m){var g=0;while(d.length>=m[g])r++,g++;d=d.substring(m[g-1]||0,d.length),v=g>0?m.indent:0}}return{row:r,column:v+this.$getStringScreenWidth(d)[0]}},this.documentToScreenColumn=function(e,t){return this.documentToScreenPosition(e,t).column},this.documentToScreenRow=function(e,t){return this.documentToScreenPosition(e,t).row},this.getScreenLength=function(){var e=0,t=null;if(!this.$useWrapMode){e=this.getLength();var n=this.$foldData;for(var r=0;r<n.length;r++)t=n[r],e-=t.end.row-t.start.row}else{var i=this.$wrapData.length,s=0,r=0,t=this.$foldData[r++],o=t?t.start.row:Infinity;while(s<i){var u=this.$wrapData[s];e+=u?u.length+1:1,s++,s>o&&(s=t.end.row+1,t=this.$foldData[r++],o=t?t.start.row:Infinity)}}return this.lineWidgets&&(e+=this.$getWidgetScreenLength()),e},this.$setFontMetrics=function(e){if(!this.$enableVarChar)return;this.$getStringScreenWidth=function(t,n,r){if(n===0)return[0,0];n||(n=Infinity),r=r||0;var i,s;for(s=0;s<t.length;s++){i=t.charAt(s),i==="	"?r+=this.getScreenTabSize(r):r+=e.getCharacterWidth(i);if(r>n)break}return[r,s]}},this.destroy=function(){this.bgTokenizer&&(this.bgTokenizer.setDocument(null),this.bgTokenizer=null),this.$stopWorker()},this.isFullWidth=m}.call(d.prototype),e("./edit_session/folding").Folding.call(d.prototype),e("./edit_session/bracket_match").BracketMatch.call(d.prototype),o.defineOptions(d.prototype,"session",{wrap:{set:function(e){!e||e=="off"?e=!1:e=="free"?e=!0:e=="printMargin"?e=-1:typeof e=="string"&&(e=parseInt(e,10)||!1);if(this.$wrap==e)return;this.$wrap=e;if(!e)this.setUseWrapMode(!1);else{var t=typeof e=="number"?e:null;this.setWrapLimitRange(t,t),this.setUseWrapMode(!0)}},get:function(){return this.getUseWrapMode()?this.$wrap==-1?"printMargin":this.getWrapLimitRange().min?this.$wrap:"free":"off"},handlesSet:!0},wrapMethod:{set:function(e){e=e=="auto"?this.$mode.type!="text":e!="text",e!=this.$wrapAsCode&&(this.$wrapAsCode=e,this.$useWrapMode&&(this.$modified=!0,this.$resetRowCache(0),this.$updateWrapData(0,this.getLength()-1)))},initialValue:"auto"},indentedSoftWrap:{initialValue:!0},firstLineNumber:{set:function(){this._signal("changeBreakpoint")},initialValue:1},useWorker:{set:function(e){this.$useWorker=e,this.$stopWorker(),e&&this.$startWorker()},initialValue:!0},useSoftTabs:{initialValue:!0},tabSize:{set:function(e){if(isNaN(e)||this.$tabSize===e)return;this.$modified=!0,this.$rowLengthCache=[],this.$tabSize=e,this._signal("changeTabSize")},initialValue:4,handlesSet:!0},navigateWithinSoftTabs:{initialValue:!1},overwrite:{set:function(e){this._signal("changeOverwrite")},initialValue:!1},newLineMode:{set:function(e){this.doc.setNewLineMode(e)},get:function(){return this.doc.getNewLineMode()},handlesSet:!0},mode:{set:function(e){this.setMode(e)},get:function(){return this.$modeId}}}),t.EditSession=d}),define("ace/search",["require","exports","module","ace/lib/lang","ace/lib/oop","ace/range"],function(e,t,n){"use strict";function u(e,t){function n(e){return/\w/.test(e)||t.regExp?"\\b":""}return n(e[0])+e+n(e[e.length-1])}var r=e("./lib/lang"),i=e("./lib/oop"),s=e("./range").Range,o=function(){this.$options={}};(function(){this.set=function(e){return i.mixin(this.$options,e),this},this.getOptions=function(){return r.copyObject(this.$options)},this.setOptions=function(e){this.$options=e},this.find=function(e){var t=this.$options,n=this.$matchIterator(e,t);if(!n)return!1;var r=null;return n.forEach(function(e,n,i,o){return r=new s(e,n,i,o),n==o&&t.start&&t.start.start&&t.skipCurrent!=0&&r.isEqual(t.start)?(r=null,!1):!0}),r},this.findAll=function(e){var t=this.$options;if(!t.needle)return[];this.$assembleRegExp(t);var n=t.range,i=n?e.getLines(n.start.row,n.end.row):e.doc.getAllLines(),o=[],u=t.re;if(t.$isMultiLine){var a=u.length,f=i.length-a,l;e:for(var c=u.offset||0;c<=f;c++){for(var h=0;h<a;h++)if(i[c+h].search(u[h])==-1)continue e;var p=i[c],d=i[c+a-1],v=p.length-p.match(u[0])[0].length,m=d.match(u[a-1])[0].length;if(l&&l.end.row===c&&l.end.column>v)continue;o.push(l=new s(c,v,c+a-1,m)),a>2&&(c=c+a-2)}}else for(var g=0;g<i.length;g++){var y=r.getMatchOffsets(i[g],u);for(var h=0;h<y.length;h++){var b=y[h];o.push(new s(g,b.offset,g,b.offset+b.length))}}if(n){var w=n.start.column,E=n.start.column,g=0,h=o.length-1;while(g<h&&o[g].start.column<w&&o[g].start.row==n.start.row)g++;while(g<h&&o[h].end.column>E&&o[h].end.row==n.end.row)h--;o=o.slice(g,h+1);for(g=0,h=o.length;g<h;g++)o[g].start.row+=n.start.row,o[g].end.row+=n.start.row}return o},this.replace=function(e,t){var n=this.$options,r=this.$assembleRegExp(n);if(n.$isMultiLine)return t;if(!r)return;var i=r.exec(e);if(!i||i[0].length!=e.length)return null;t=e.replace(r,t);if(n.preserveCase){t=t.split("");for(var s=Math.min(e.length,e.length);s--;){var o=e[s];o&&o.toLowerCase()!=o?t[s]=t[s].toUpperCase():t[s]=t[s].toLowerCase()}t=t.join("")}return t},this.$assembleRegExp=function(e,t){if(e.needle instanceof RegExp)return e.re=e.needle;var n=e.needle;if(!e.needle)return e.re=!1;e.regExp||(n=r.escapeRegExp(n)),e.wholeWord&&(n=u(n,e));var i=e.caseSensitive?"gm":"gmi";e.$isMultiLine=!t&&/[\n\r]/.test(n);if(e.$isMultiLine)return e.re=this.$assembleMultilineRegExp(n,i);try{var s=new RegExp(n,i)}catch(o){s=!1}return e.re=s},this.$assembleMultilineRegExp=function(e,t){var n=e.replace(/\r\n|\r|\n/g,"$\n^").split("\n"),r=[];for(var i=0;i<n.length;i++)try{r.push(new RegExp(n[i],t))}catch(s){return!1}return r},this.$matchIterator=function(e,t){var n=this.$assembleRegExp(t);if(!n)return!1;var r=t.backwards==1,i=t.skipCurrent!=0,s=t.range,o=t.start;o||(o=s?s[r?"end":"start"]:e.selection.getRange()),o.start&&(o=o[i!=r?"end":"start"]);var u=s?s.start.row:0,a=s?s.end.row:e.getLength()-1;if(r)var f=function(e){var n=o.row;if(c(n,o.column,e))return;for(n--;n>=u;n--)if(c(n,Number.MAX_VALUE,e))return;if(t.wrap==0)return;for(n=a,u=o.row;n>=u;n--)if(c(n,Number.MAX_VALUE,e))return};else var f=function(e){var n=o.row;if(c(n,o.column,e))return;for(n+=1;n<=a;n++)if(c(n,0,e))return;if(t.wrap==0)return;for(n=u,a=o.row;n<=a;n++)if(c(n,0,e))return};if(t.$isMultiLine)var l=n.length,c=function(t,i,s){var o=r?t-l+1:t;if(o<0)return;var u=e.getLine(o),a=u.search(n[0]);if(!r&&a<i||a===-1)return;for(var f=1;f<l;f++){u=e.getLine(o+f);if(u.search(n[f])==-1)return}var c=u.match(n[l-1])[0].length;if(r&&c>i)return;if(s(o,a,o+l-1,c))return!0};else if(r)var c=function(t,r,i){var s=e.getLine(t),o=[],u,a=0;n.lastIndex=0;while(u=n.exec(s)){var f=u[0].length;a=u.index;if(!f){if(a>=s.length)break;n.lastIndex=a+=1}if(u.index+f>r)break;o.push(u.index,f)}for(var l=o.length-1;l>=0;l-=2){var c=o[l-1],f=o[l];if(i(t,c,t,c+f))return!0}};else var c=function(t,r,i){var s=e.getLine(t),o,u=r;n.lastIndex=r;while(o=n.exec(s)){var a=o[0].length;u=o.index;if(i(t,u,t,u+a))return!0;if(!a){n.lastIndex=u+=1;if(u>=s.length)return!1}}};return{forEach:f}}}).call(o.prototype),t.Search=o}),define("ace/keyboard/hash_handler",["require","exports","module","ace/lib/keys","ace/lib/useragent"],function(e,t,n){"use strict";function o(e,t){this.platform=t||(i.isMac?"mac":"win"),this.commands={},this.commandKeyBinding={},this.addCommands(e),this.$singleCommand=!0}function u(e,t){o.call(this,e,t),this.$singleCommand=!1}var r=e("../lib/keys"),i=e("../lib/useragent"),s=r.KEY_MODS;u.prototype=o.prototype,function(){function e(e){return typeof e=="object"&&e.bindKey&&e.bindKey.position||(e.isDefault?-100:0)}this.addCommand=function(e){this.commands[e.name]&&this.removeCommand(e),this.commands[e.name]=e,e.bindKey&&this._buildKeyHash(e)},this.removeCommand=function(e,t){var n=e&&(typeof e=="string"?e:e.name);e=this.commands[n],t||delete this.commands[n];var r=this.commandKeyBinding;for(var i in r){var s=r[i];if(s==e)delete r[i];else if(Array.isArray(s)){var o=s.indexOf(e);o!=-1&&(s.splice(o,1),s.length==1&&(r[i]=s[0]))}}},this.bindKey=function(e,t,n){typeof e=="object"&&e&&(n==undefined&&(n=e.position),e=e[this.platform]);if(!e)return;if(typeof t=="function")return this.addCommand({exec:t,bindKey:e,name:t.name||e});e.split("|").forEach(function(e){var r="";if(e.indexOf(" ")!=-1){var i=e.split(/\s+/);e=i.pop(),i.forEach(function(e){var t=this.parseKeys(e),n=s[t.hashId]+t.key;r+=(r?" ":"")+n,this._addCommandToBinding(r,"chainKeys")},this),r+=" "}var o=this.parseKeys(e),u=s[o.hashId]+o.key;this._addCommandToBinding(r+u,t,n)},this)},this._addCommandToBinding=function(t,n,r){var i=this.commandKeyBinding,s;if(!n)delete i[t];else if(!i[t]||this.$singleCommand)i[t]=n;else{Array.isArray(i[t])?(s=i[t].indexOf(n))!=-1&&i[t].splice(s,1):i[t]=[i[t]],typeof r!="number"&&(r=e(n));var o=i[t];for(s=0;s<o.length;s++){var u=o[s],a=e(u);if(a>r)break}o.splice(s,0,n)}},this.addCommands=function(e){e&&Object.keys(e).forEach(function(t){var n=e[t];if(!n)return;if(typeof n=="string")return this.bindKey(n,t);typeof n=="function"&&(n={exec:n});if(typeof n!="object")return;n.name||(n.name=t),this.addCommand(n)},this)},this.removeCommands=function(e){Object.keys(e).forEach(function(t){this.removeCommand(e[t])},this)},this.bindKeys=function(e){Object.keys(e).forEach(function(t){this.bindKey(t,e[t])},this)},this._buildKeyHash=function(e){this.bindKey(e.bindKey,e)},this.parseKeys=function(e){var t=e.toLowerCase().split(/[\-\+]([\-\+])?/).filter(function(e){return e}),n=t.pop(),i=r[n];if(r.FUNCTION_KEYS[i])n=r.FUNCTION_KEYS[i].toLowerCase();else{if(!t.length)return{key:n,hashId:-1};if(t.length==1&&t[0]=="shift")return{key:n.toUpperCase(),hashId:-1}}var s=0;for(var o=t.length;o--;){var u=r.KEY_MODS[t[o]];if(u==null)return typeof console!="undefined"&&console.error("invalid modifier "+t[o]+" in "+e),!1;s|=u}return{key:n,hashId:s}},this.findKeyCommand=function(t,n){var r=s[t]+n;return this.commandKeyBinding[r]},this.handleKeyboard=function(e,t,n,r){if(r<0)return;var i=s[t]+n,o=this.commandKeyBinding[i];e.$keyChain&&(e.$keyChain+=" "+i,o=this.commandKeyBinding[e.$keyChain]||o);if(o)if(o=="chainKeys"||o[o.length-1]=="chainKeys")return e.$keyChain=e.$keyChain||i,{command:"null"};if(e.$keyChain)if(!!t&&t!=4||n.length!=1){if(t==-1||r>0)e.$keyChain=""}else e.$keyChain=e.$keyChain.slice(0,-i.length-1);return{command:o}},this.getStatusText=function(e,t){return t.$keyChain||""}}.call(o.prototype),t.HashHandler=o,t.MultiHashHandler=u}),define("ace/commands/command_manager",["require","exports","module","ace/lib/oop","ace/keyboard/hash_handler","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("../keyboard/hash_handler").MultiHashHandler,s=e("../lib/event_emitter").EventEmitter,o=function(e,t){i.call(this,t,e),this.byName=this.commands,this.setDefaultHandler("exec",function(e){return e.command.exec(e.editor,e.args||{})})};r.inherits(o,i),function(){r.implement(this,s),this.exec=function(e,t,n){if(Array.isArray(e)){for(var r=e.length;r--;)if(this.exec(e[r],t,n))return!0;return!1}typeof e=="string"&&(e=this.commands[e]);if(!e)return!1;if(t&&t.$readOnly&&!e.readOnly)return!1;if(e.isAvailable&&!e.isAvailable(t))return!1;var i={editor:t,command:e,args:n};return i.returnValue=this._emit("exec",i),this._signal("afterExec",i),i.returnValue===!1?!1:!0},this.toggleRecording=function(e){if(this.$inReplay)return;return e&&e._emit("changeStatus"),this.recording?(this.macro.pop(),this.removeEventListener("exec",this.$addCommandToMacro),this.macro.length||(this.macro=this.oldMacro),this.recording=!1):(this.$addCommandToMacro||(this.$addCommandToMacro=function(e){this.macro.push([e.command,e.args])}.bind(this)),this.oldMacro=this.macro,this.macro=[],this.on("exec",this.$addCommandToMacro),this.recording=!0)},this.replay=function(e){if(this.$inReplay||!this.macro)return;if(this.recording)return this.toggleRecording(e);try{this.$inReplay=!0,this.macro.forEach(function(t){typeof t=="string"?this.exec(t,e):this.exec(t[0],e,t[1])},this)}finally{this.$inReplay=!1}},this.trimMacro=function(e){return e.map(function(e){return typeof e[0]!="string"&&(e[0]=e[0].name),e[1]||(e=e[0]),e})}}.call(o.prototype),t.CommandManager=o}),define("ace/commands/default_commands",["require","exports","module","ace/lib/lang","ace/config","ace/range"],function(e,t,n){"use strict";function o(e,t){return{win:e,mac:t}}var r=e("../lib/lang"),i=e("../config"),s=e("../range").Range;t.commands=[{name:"showSettingsMenu",bindKey:o("Ctrl-,","Command-,"),exec:function(e){i.loadModule("ace/ext/settings_menu",function(t){t.init(e),e.showSettingsMenu()})},readOnly:!0},{name:"goToNextError",bindKey:o("Alt-E","F4"),exec:function(e){i.loadModule("ace/ext/error_marker",function(t){t.showErrorMarker(e,1)})},scrollIntoView:"animate",readOnly:!0},{name:"goToPreviousError",bindKey:o("Alt-Shift-E","Shift-F4"),exec:function(e){i.loadModule("ace/ext/error_marker",function(t){t.showErrorMarker(e,-1)})},scrollIntoView:"animate",readOnly:!0},{name:"selectall",bindKey:o("Ctrl-A","Command-A"),exec:function(e){e.selectAll()},readOnly:!0},{name:"centerselection",bindKey:o(null,"Ctrl-L"),exec:function(e){e.centerSelection()},readOnly:!0},{name:"gotoline",bindKey:o("Ctrl-L","Command-L"),exec:function(e){var t=parseInt(prompt("Enter line number:"),10);isNaN(t)||e.gotoLine(t)},readOnly:!0},{name:"fold",bindKey:o("Alt-L|Ctrl-F1","Command-Alt-L|Command-F1"),exec:function(e){e.session.toggleFold(!1)},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"unfold",bindKey:o("Alt-Shift-L|Ctrl-Shift-F1","Command-Alt-Shift-L|Command-Shift-F1"),exec:function(e){e.session.toggleFold(!0)},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"toggleFoldWidget",bindKey:o("F2","F2"),exec:function(e){e.session.toggleFoldWidget()},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"toggleParentFoldWidget",bindKey:o("Alt-F2","Alt-F2"),exec:function(e){e.session.toggleFoldWidget(!0)},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"foldall",bindKey:o(null,"Ctrl-Command-Option-0"),exec:function(e){e.session.foldAll()},scrollIntoView:"center",readOnly:!0},{name:"foldOther",bindKey:o("Alt-0","Command-Option-0"),exec:function(e){e.session.foldAll(),e.session.unfold(e.selection.getAllRanges())},scrollIntoView:"center",readOnly:!0},{name:"unfoldall",bindKey:o("Alt-Shift-0","Command-Option-Shift-0"),exec:function(e){e.session.unfold()},scrollIntoView:"center",readOnly:!0},{name:"findnext",bindKey:o("Ctrl-K","Command-G"),exec:function(e){e.findNext()},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"findprevious",bindKey:o("Ctrl-Shift-K","Command-Shift-G"),exec:function(e){e.findPrevious()},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"selectOrFindNext",bindKey:o("Alt-K","Ctrl-G"),exec:function(e){e.selection.isEmpty()?e.selection.selectWord():e.findNext()},readOnly:!0},{name:"selectOrFindPrevious",bindKey:o("Alt-Shift-K","Ctrl-Shift-G"),exec:function(e){e.selection.isEmpty()?e.selection.selectWord():e.findPrevious()},readOnly:!0},{name:"find",bindKey:o("Ctrl-F","Command-F"),exec:function(e){i.loadModule("ace/ext/searchbox",function(t){t.Search(e)})},readOnly:!0},{name:"overwrite",bindKey:"Insert",exec:function(e){e.toggleOverwrite()},readOnly:!0},{name:"selecttostart",bindKey:o("Ctrl-Shift-Home","Command-Shift-Home|Command-Shift-Up"),exec:function(e){e.getSelection().selectFileStart()},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"gotostart",bindKey:o("Ctrl-Home","Command-Home|Command-Up"),exec:function(e){e.navigateFileStart()},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"selectup",bindKey:o("Shift-Up","Shift-Up|Ctrl-Shift-P"),exec:function(e){e.getSelection().selectUp()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"golineup",bindKey:o("Up","Up|Ctrl-P"),exec:function(e,t){e.navigateUp(t.times)},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selecttoend",bindKey:o("Ctrl-Shift-End","Command-Shift-End|Command-Shift-Down"),exec:function(e){e.getSelection().selectFileEnd()},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"gotoend",bindKey:o("Ctrl-End","Command-End|Command-Down"),exec:function(e){e.navigateFileEnd()},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"selectdown",bindKey:o("Shift-Down","Shift-Down|Ctrl-Shift-N"),exec:function(e){e.getSelection().selectDown()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"golinedown",bindKey:o("Down","Down|Ctrl-N"),exec:function(e,t){e.navigateDown(t.times)},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectwordleft",bindKey:o("Ctrl-Shift-Left","Option-Shift-Left"),exec:function(e){e.getSelection().selectWordLeft()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotowordleft",bindKey:o("Ctrl-Left","Option-Left"),exec:function(e){e.navigateWordLeft()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selecttolinestart",bindKey:o("Alt-Shift-Left","Command-Shift-Left|Ctrl-Shift-A"),exec:function(e){e.getSelection().selectLineStart()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotolinestart",bindKey:o("Alt-Left|Home","Command-Left|Home|Ctrl-A"),exec:function(e){e.navigateLineStart()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectleft",bindKey:o("Shift-Left","Shift-Left|Ctrl-Shift-B"),exec:function(e){e.getSelection().selectLeft()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotoleft",bindKey:o("Left","Left|Ctrl-B"),exec:function(e,t){e.navigateLeft(t.times)},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectwordright",bindKey:o("Ctrl-Shift-Right","Option-Shift-Right"),exec:function(e){e.getSelection().selectWordRight()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotowordright",bindKey:o("Ctrl-Right","Option-Right"),exec:function(e){e.navigateWordRight()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selecttolineend",bindKey:o("Alt-Shift-Right","Command-Shift-Right|Shift-End|Ctrl-Shift-E"),exec:function(e){e.getSelection().selectLineEnd()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotolineend",bindKey:o("Alt-Right|End","Command-Right|End|Ctrl-E"),exec:function(e){e.navigateLineEnd()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectright",bindKey:o("Shift-Right","Shift-Right"),exec:function(e){e.getSelection().selectRight()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotoright",bindKey:o("Right","Right|Ctrl-F"),exec:function(e,t){e.navigateRight(t.times)},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectpagedown",bindKey:"Shift-PageDown",exec:function(e){e.selectPageDown()},readOnly:!0},{name:"pagedown",bindKey:o(null,"Option-PageDown"),exec:function(e){e.scrollPageDown()},readOnly:!0},{name:"gotopagedown",bindKey:o("PageDown","PageDown|Ctrl-V"),exec:function(e){e.gotoPageDown()},readOnly:!0},{name:"selectpageup",bindKey:"Shift-PageUp",exec:function(e){e.selectPageUp()},readOnly:!0},{name:"pageup",bindKey:o(null,"Option-PageUp"),exec:function(e){e.scrollPageUp()},readOnly:!0},{name:"gotopageup",bindKey:"PageUp",exec:function(e){e.gotoPageUp()},readOnly:!0},{name:"scrollup",bindKey:o("Ctrl-Up",null),exec:function(e){e.renderer.scrollBy(0,-2*e.renderer.layerConfig.lineHeight)},readOnly:!0},{name:"scrolldown",bindKey:o("Ctrl-Down",null),exec:function(e){e.renderer.scrollBy(0,2*e.renderer.layerConfig.lineHeight)},readOnly:!0},{name:"selectlinestart",bindKey:"Shift-Home",exec:function(e){e.getSelection().selectLineStart()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectlineend",bindKey:"Shift-End",exec:function(e){e.getSelection().selectLineEnd()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"togglerecording",bindKey:o("Ctrl-Alt-E","Command-Option-E"),exec:function(e){e.commands.toggleRecording(e)},readOnly:!0},{name:"replaymacro",bindKey:o("Ctrl-Shift-E","Command-Shift-E"),exec:function(e){e.commands.replay(e)},readOnly:!0},{name:"jumptomatching",bindKey:o("Ctrl-P","Ctrl-P"),exec:function(e){e.jumpToMatching()},multiSelectAction:"forEach",scrollIntoView:"animate",readOnly:!0},{name:"selecttomatching",bindKey:o("Ctrl-Shift-P","Ctrl-Shift-P"),exec:function(e){e.jumpToMatching(!0)},multiSelectAction:"forEach",scrollIntoView:"animate",readOnly:!0},{name:"expandToMatching",bindKey:o("Ctrl-Shift-M","Ctrl-Shift-M"),exec:function(e){e.jumpToMatching(!0,!0)},multiSelectAction:"forEach",scrollIntoView:"animate",readOnly:!0},{name:"passKeysToBrowser",bindKey:o(null,null),exec:function(){},passEvent:!0,readOnly:!0},{name:"copy",exec:function(e){},readOnly:!0},{name:"cut",exec:function(e){var t=e.getSelectionRange();e._emit("cut",t),e.selection.isEmpty()||(e.session.remove(t),e.clearSelection())},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"paste",exec:function(e,t){e.$handlePaste(t)},scrollIntoView:"cursor"},{name:"removeline",bindKey:o("Ctrl-D","Command-D"),exec:function(e){e.removeLines()},scrollIntoView:"cursor",multiSelectAction:"forEachLine"},{name:"duplicateSelection",bindKey:o("Ctrl-Shift-D","Command-Shift-D"),exec:function(e){e.duplicateSelection()},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"sortlines",bindKey:o("Ctrl-Alt-S","Command-Alt-S"),exec:function(e){e.sortLines()},scrollIntoView:"selection",multiSelectAction:"forEachLine"},{name:"togglecomment",bindKey:o("Ctrl-/","Command-/"),exec:function(e){e.toggleCommentLines()},multiSelectAction:"forEachLine",scrollIntoView:"selectionPart"},{name:"toggleBlockComment",bindKey:o("Ctrl-Shift-/","Command-Shift-/"),exec:function(e){e.toggleBlockComment()},multiSelectAction:"forEach",scrollIntoView:"selectionPart"},{name:"modifyNumberUp",bindKey:o("Ctrl-Shift-Up","Alt-Shift-Up"),exec:function(e){e.modifyNumber(1)},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"modifyNumberDown",bindKey:o("Ctrl-Shift-Down","Alt-Shift-Down"),exec:function(e){e.modifyNumber(-1)},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"replace",bindKey:o("Ctrl-H","Command-Option-F"),exec:function(e){i.loadModule("ace/ext/searchbox",function(t){t.Search(e,!0)})}},{name:"undo",bindKey:o("Ctrl-Z","Command-Z"),exec:function(e){e.undo()}},{name:"redo",bindKey:o("Ctrl-Shift-Z|Ctrl-Y","Command-Shift-Z|Command-Y"),exec:function(e){e.redo()}},{name:"copylinesup",bindKey:o("Alt-Shift-Up","Command-Option-Up"),exec:function(e){e.copyLinesUp()},scrollIntoView:"cursor"},{name:"movelinesup",bindKey:o("Alt-Up","Option-Up"),exec:function(e){e.moveLinesUp()},scrollIntoView:"cursor"},{name:"copylinesdown",bindKey:o("Alt-Shift-Down","Command-Option-Down"),exec:function(e){e.copyLinesDown()},scrollIntoView:"cursor"},{name:"movelinesdown",bindKey:o("Alt-Down","Option-Down"),exec:function(e){e.moveLinesDown()},scrollIntoView:"cursor"},{name:"del",bindKey:o("Delete","Delete|Ctrl-D|Shift-Delete"),exec:function(e){e.remove("right")},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"backspace",bindKey:o("Shift-Backspace|Backspace","Ctrl-Backspace|Shift-Backspace|Backspace|Ctrl-H"),exec:function(e){e.remove("left")},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"cut_or_delete",bindKey:o("Shift-Delete",null),exec:function(e){if(!e.selection.isEmpty())return!1;e.remove("left")},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolinestart",bindKey:o("Alt-Backspace","Command-Backspace"),exec:function(e){e.removeToLineStart()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolineend",bindKey:o("Alt-Delete","Ctrl-K|Command-Delete"),exec:function(e){e.removeToLineEnd()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolinestarthard",bindKey:o("Ctrl-Shift-Backspace",null),exec:function(e){var t=e.selection.getRange();t.start.column=0,e.session.remove(t)},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolineendhard",bindKey:o("Ctrl-Shift-Delete",null),exec:function(e){var t=e.selection.getRange();t.end.column=Number.MAX_VALUE,e.session.remove(t)},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removewordleft",bindKey:o("Ctrl-Backspace","Alt-Backspace|Ctrl-Alt-Backspace"),exec:function(e){e.removeWordLeft()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removewordright",bindKey:o("Ctrl-Delete","Alt-Delete"),exec:function(e){e.removeWordRight()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"outdent",bindKey:o("Shift-Tab","Shift-Tab"),exec:function(e){e.blockOutdent()},multiSelectAction:"forEach",scrollIntoView:"selectionPart"},{name:"indent",bindKey:o("Tab","Tab"),exec:function(e){e.indent()},multiSelectAction:"forEach",scrollIntoView:"selectionPart"},{name:"blockoutdent",bindKey:o("Ctrl-[","Ctrl-["),exec:function(e){e.blockOutdent()},multiSelectAction:"forEachLine",scrollIntoView:"selectionPart"},{name:"blockindent",bindKey:o("Ctrl-]","Ctrl-]"),exec:function(e){e.blockIndent()},multiSelectAction:"forEachLine",scrollIntoView:"selectionPart"},{name:"insertstring",exec:function(e,t){e.insert(t)},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"inserttext",exec:function(e,t){e.insert(r.stringRepeat(t.text||"",t.times||1))},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"splitline",bindKey:o(null,"Ctrl-O"),exec:function(e){e.splitLine()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"transposeletters",bindKey:o("Alt-Shift-X","Ctrl-T"),exec:function(e){e.transposeLetters()},multiSelectAction:function(e){e.transposeSelections(1)},scrollIntoView:"cursor"},{name:"touppercase",bindKey:o("Ctrl-U","Ctrl-U"),exec:function(e){e.toUpperCase()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"tolowercase",bindKey:o("Ctrl-Shift-U","Ctrl-Shift-U"),exec:function(e){e.toLowerCase()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"expandtoline",bindKey:o("Ctrl-Shift-L","Command-Shift-L"),exec:function(e){var t=e.selection.getRange();t.start.column=t.end.column=0,t.end.row++,e.selection.setRange(t,!1)},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"joinlines",bindKey:o(null,null),exec:function(e){var t=e.selection.isBackwards(),n=t?e.selection.getSelectionLead():e.selection.getSelectionAnchor(),i=t?e.selection.getSelectionAnchor():e.selection.getSelectionLead(),o=e.session.doc.getLine(n.row).length,u=e.session.doc.getTextRange(e.selection.getRange()),a=u.replace(/\n\s*/," ").length,f=e.session.doc.getLine(n.row);for(var l=n.row+1;l<=i.row+1;l++){var c=r.stringTrimLeft(r.stringTrimRight(e.session.doc.getLine(l)));c.length!==0&&(c=" "+c),f+=c}i.row+1<e.session.doc.getLength()-1&&(f+=e.session.doc.getNewLineCharacter()),e.clearSelection(),e.session.doc.replace(new s(n.row,0,i.row+2,0),f),a>0?(e.selection.moveCursorTo(n.row,n.column),e.selection.selectTo(n.row,n.column+a)):(o=e.session.doc.getLine(n.row).length>o?o+1:o,e.selection.moveCursorTo(n.row,o))},multiSelectAction:"forEach",readOnly:!0},{name:"invertSelection",bindKey:o(null,null),exec:function(e){var t=e.session.doc.getLength()-1,n=e.session.doc.getLine(t).length,r=e.selection.rangeList.ranges,i=[];r.length<1&&(r=[e.selection.getRange()]);for(var o=0;o<r.length;o++)o==r.length-1&&(r[o].end.row!==t||r[o].end.column!==n)&&i.push(new s(r[o].end.row,r[o].end.column,t,n)),o===0?(r[o].start.row!==0||r[o].start.column!==0)&&i.push(new s(0,0,r[o].start.row,r[o].start.column)):i.push(new s(r[o-1].end.row,r[o-1].end.column,r[o].start.row,r[o].start.column));e.exitMultiSelectMode(),e.clearSelection();for(var o=0;o<i.length;o++)e.selection.addRange(i[o],!1)},readOnly:!0,scrollIntoView:"none"}]}),define("ace/editor",["require","exports","module","ace/lib/fixoldbrowsers","ace/lib/oop","ace/lib/dom","ace/lib/lang","ace/lib/useragent","ace/keyboard/textinput","ace/mouse/mouse_handler","ace/mouse/fold_handler","ace/keyboard/keybinding","ace/edit_session","ace/search","ace/range","ace/lib/event_emitter","ace/commands/command_manager","ace/commands/default_commands","ace/config","ace/token_iterator"],function(e,t,n){"use strict";e("./lib/fixoldbrowsers");var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./lib/lang"),o=e("./lib/useragent"),u=e("./keyboard/textinput").TextInput,a=e("./mouse/mouse_handler").MouseHandler,f=e("./mouse/fold_handler").FoldHandler,l=e("./keyboard/keybinding").KeyBinding,c=e("./edit_session").EditSession,h=e("./search").Search,p=e("./range").Range,d=e("./lib/event_emitter").EventEmitter,v=e("./commands/command_manager").CommandManager,m=e("./commands/default_commands").commands,g=e("./config"),y=e("./token_iterator").TokenIterator,b=function(e,t){var n=e.getContainerElement();this.container=n,this.renderer=e,this.id="editor"+ ++b.$uid,this.commands=new v(o.isMac?"mac":"win",m),typeof document=="object"&&(this.textInput=new u(e.getTextAreaContainer(),this),this.renderer.textarea=this.textInput.getElement(),this.$mouseHandler=new a(this),new f(this)),this.keyBinding=new l(this),this.$blockScrolling=0,this.$search=(new h).set({wrap:!0}),this.$historyTracker=this.$historyTracker.bind(this),this.commands.on("exec",this.$historyTracker),this.$initOperationListeners(),this._$emitInputEvent=s.delayedCall(function(){this._signal("input",{}),this.session&&this.session.bgTokenizer&&this.session.bgTokenizer.scheduleStart()}.bind(this)),this.on("change",function(e,t){t._$emitInputEvent.schedule(31)}),this.setSession(t||new c("")),g.resetOptions(this),g._signal("editor",this)};b.$uid=0,function(){r.implement(this,d),this.$initOperationListeners=function(){function e(e){return e[e.length-1]}this.selections=[],this.commands.on("exec",this.startOperation.bind(this),!0),this.commands.on("afterExec",this.endOperation.bind(this),!0),this.$opResetTimer=s.delayedCall(this.endOperation.bind(this)),this.on("change",function(){this.curOp||this.startOperation(),this.curOp.docChanged=!0}.bind(this),!0),this.on("changeSelection",function(){this.curOp||this.startOperation(),this.curOp.selectionChanged=!0}.bind(this),!0)},this.curOp=null,this.prevOp={},this.startOperation=function(e){if(this.curOp){if(!e||this.curOp.command)return;this.prevOp=this.curOp}e||(this.previousCommand=null,e={}),this.$opResetTimer.schedule(),this.curOp={command:e.command||{},args:e.args,scrollTop:this.renderer.scrollTop},this.curOp.command.name&&this.curOp.command.scrollIntoView!==undefined&&this.$blockScrolling++},this.endOperation=function(e){if(this.curOp){if(e&&e.returnValue===!1)return this.curOp=null;this._signal("beforeEndOperation");var t=this.curOp.command;t.name&&this.$blockScrolling>0&&this.$blockScrolling--;var n=t&&t.scrollIntoView;if(n){switch(n){case"center-animate":n="animate";case"center":this.renderer.scrollCursorIntoView(null,.5);break;case"animate":case"cursor":this.renderer.scrollCursorIntoView();break;case"selectionPart":var r=this.selection.getRange(),i=this.renderer.layerConfig;(r.start.row>=i.lastRow||r.end.row<=i.firstRow)&&this.renderer.scrollSelectionIntoView(this.selection.anchor,this.selection.lead);break;default:}n=="animate"&&this.renderer.animateScrolling(this.curOp.scrollTop)}this.prevOp=this.curOp,this.curOp=null}},this.$mergeableCommands=["backspace","del","insertstring"],this.$historyTracker=function(e){if(!this.$mergeUndoDeltas)return;var t=this.prevOp,n=this.$mergeableCommands,r=t.command&&e.command.name==t.command.name;if(e.command.name=="insertstring"){var i=e.args;this.mergeNextCommand===undefined&&(this.mergeNextCommand=!0),r=r&&this.mergeNextCommand&&(!/\s/.test(i)||/\s/.test(t.args)),this.mergeNextCommand=!0}else r=r&&n.indexOf(e.command.name)!==-1;this.$mergeUndoDeltas!="always"&&Date.now()-this.sequenceStartTime>2e3&&(r=!1),r?this.session.mergeUndoDeltas=!0:n.indexOf(e.command.name)!==-1&&(this.sequenceStartTime=Date.now())},this.setKeyboardHandler=function(e,t){if(e&&typeof e=="string"){this.$keybindingId=e;var n=this;g.loadModule(["keybinding",e],function(r){n.$keybindingId==e&&n.keyBinding.setKeyboardHandler(r&&r.handler),t&&t()})}else this.$keybindingId=null,this.keyBinding.setKeyboardHandler(e),t&&t()},this.getKeyboardHandler=function(){return this.keyBinding.getKeyboardHandler()},this.setSession=function(e){if(this.session==e)return;this.curOp&&this.endOperation(),this.curOp={};var t=this.session;if(t){this.session.off("change",this.$onDocumentChange),this.session.off("changeMode",this.$onChangeMode),this.session.off("tokenizerUpdate",this.$onTokenizerUpdate),this.session.off("changeTabSize",this.$onChangeTabSize),this.session.off("changeWrapLimit",this.$onChangeWrapLimit),this.session.off("changeWrapMode",this.$onChangeWrapMode),this.session.off("changeFold",this.$onChangeFold),this.session.off("changeFrontMarker",this.$onChangeFrontMarker),this.session.off("changeBackMarker",this.$onChangeBackMarker),this.session.off("changeBreakpoint",this.$onChangeBreakpoint),this.session.off("changeAnnotation",this.$onChangeAnnotation),this.session.off("changeOverwrite",this.$onCursorChange),this.session.off("changeScrollTop",this.$onScrollTopChange),this.session.off("changeScrollLeft",this.$onScrollLeftChange);var n=this.session.getSelection();n.off("changeCursor",this.$onCursorChange),n.off("changeSelection",this.$onSelectionChange)}this.session=e,e?(this.$onDocumentChange=this.onDocumentChange.bind(this),e.on("change",this.$onDocumentChange),this.renderer.setSession(e),this.$onChangeMode=this.onChangeMode.bind(this),e.on("changeMode",this.$onChangeMode),this.$onTokenizerUpdate=this.onTokenizerUpdate.bind(this),e.on("tokenizerUpdate",this.$onTokenizerUpdate),this.$onChangeTabSize=this.renderer.onChangeTabSize.bind(this.renderer),e.on("changeTabSize",this.$onChangeTabSize),this.$onChangeWrapLimit=this.onChangeWrapLimit.bind(this),e.on("changeWrapLimit",this.$onChangeWrapLimit),this.$onChangeWrapMode=this.onChangeWrapMode.bind(this),e.on("changeWrapMode",this.$onChangeWrapMode),this.$onChangeFold=this.onChangeFold.bind(this),e.on("changeFold",this.$onChangeFold),this.$onChangeFrontMarker=this.onChangeFrontMarker.bind(this),this.session.on("changeFrontMarker",this.$onChangeFrontMarker),this.$onChangeBackMarker=this.onChangeBackMarker.bind(this),this.session.on("changeBackMarker",this.$onChangeBackMarker),this.$onChangeBreakpoint=this.onChangeBreakpoint.bind(this),this.session.on("changeBreakpoint",this.$onChangeBreakpoint),this.$onChangeAnnotation=this.onChangeAnnotation.bind(this),this.session.on("changeAnnotation",this.$onChangeAnnotation),this.$onCursorChange=this.onCursorChange.bind(this),this.session.on("changeOverwrite",this.$onCursorChange),this.$onScrollTopChange=this.onScrollTopChange.bind(this),this.session.on("changeScrollTop",this.$onScrollTopChange),this.$onScrollLeftChange=this.onScrollLeftChange.bind(this),this.session.on("changeScrollLeft",this.$onScrollLeftChange),this.selection=e.getSelection(),this.selection.on("changeCursor",this.$onCursorChange),this.$onSelectionChange=this.onSelectionChange.bind(this),this.selection.on("changeSelection",this.$onSelectionChange),this.onChangeMode(),this.$blockScrolling+=1,this.onCursorChange(),this.$blockScrolling-=1,this.onScrollTopChange(),this.onScrollLeftChange(),this.onSelectionChange(),this.onChangeFrontMarker(),this.onChangeBackMarker(),this.onChangeBreakpoint(),this.onChangeAnnotation(),this.session.getUseWrapMode()&&this.renderer.adjustWrapLimit(),this.renderer.updateFull()):(this.selection=null,this.renderer.setSession(e)),this._signal("changeSession",{session:e,oldSession:t}),this.curOp=null,t&&t._signal("changeEditor",{oldEditor:this}),e&&e._signal("changeEditor",{editor:this}),e&&e.bgTokenizer&&e.bgTokenizer.scheduleStart()},this.getSession=function(){return this.session},this.setValue=function(e,t){return this.session.doc.setValue(e),t?t==1?this.navigateFileEnd():t==-1&&this.navigateFileStart():this.selectAll(),e},this.getValue=function(){return this.session.getValue()},this.getSelection=function(){return this.selection},this.resize=function(e){this.renderer.onResize(e)},this.setTheme=function(e,t){this.renderer.setTheme(e,t)},this.getTheme=function(){return this.renderer.getTheme()},this.setStyle=function(e){this.renderer.setStyle(e)},this.unsetStyle=function(e){this.renderer.unsetStyle(e)},this.getFontSize=function(){return this.getOption("fontSize")||i.computedStyle(this.container,"fontSize")},this.setFontSize=function(e){this.setOption("fontSize",e)},this.$highlightBrackets=function(){this.session.$bracketHighlight&&(this.session.removeMarker(this.session.$bracketHighlight),this.session.$bracketHighlight=null);if(this.$highlightPending)return;var e=this;this.$highlightPending=!0,setTimeout(function(){e.$highlightPending=!1;var t=e.session;if(!t||!t.bgTokenizer)return;var n=t.findMatchingBracket(e.getCursorPosition());if(n)var r=new p(n.row,n.column,n.row,n.column+1);else if(t.$mode.getMatching)var r=t.$mode.getMatching(e.session);r&&(t.$bracketHighlight=t.addMarker(r,"ace_bracket","text"))},50)},this.$highlightTags=function(){if(this.$highlightTagPending)return;var e=this;this.$highlightTagPending=!0,setTimeout(function(){e.$highlightTagPending=!1;var t=e.session;if(!t||!t.bgTokenizer)return;var n=e.getCursorPosition(),r=new y(e.session,n.row,n.column),i=r.getCurrentToken();if(!i||!/\b(?:tag-open|tag-name)/.test(i.type)){t.removeMarker(t.$tagHighlight),t.$tagHighlight=null;return}if(i.type.indexOf("tag-open")!=-1){i=r.stepForward();if(!i)return}var s=i.value,o=0,u=r.stepBackward();if(u.value=="<"){do u=i,i=r.stepForward(),i&&i.value===s&&i.type.indexOf("tag-name")!==-1&&(u.value==="<"?o++:u.value==="</"&&o--);while(i&&o>=0)}else{do i=u,u=r.stepBackward(),i&&i.value===s&&i.type.indexOf("tag-name")!==-1&&(u.value==="<"?o++:u.value==="</"&&o--);while(u&&o<=0);r.stepForward()}if(!i){t.removeMarker(t.$tagHighlight),t.$tagHighlight=null;return}var a=r.getCurrentTokenRow(),f=r.getCurrentTokenColumn(),l=new p(a,f,a,f+i.value.length),c=t.$backMarkers[t.$tagHighlight];t.$tagHighlight&&c!=undefined&&l.compareRange(c.range)!==0&&(t.removeMarker(t.$tagHighlight),t.$tagHighlight=null),l&&!t.$tagHighlight&&(t.$tagHighlight=t.addMarker(l,"ace_bracket","text"))},50)},this.focus=function(){var e=this;setTimeout(function(){e.textInput.focus()}),this.textInput.focus()},this.isFocused=function(){return this.textInput.isFocused()},this.blur=function(){this.textInput.blur()},this.onFocus=function(e){if(this.$isFocused)return;this.$isFocused=!0,this.renderer.showCursor(),this.renderer.visualizeFocus(),this._emit("focus",e)},this.onBlur=function(e){if(!this.$isFocused)return;this.$isFocused=!1,this.renderer.hideCursor(),this.renderer.visualizeBlur(),this._emit("blur",e)},this.$cursorChange=function(){this.renderer.updateCursor()},this.onDocumentChange=function(e){var t=this.session.$useWrapMode,n=e.start.row==e.end.row?e.end.row:Infinity;this.renderer.updateLines(e.start.row,n,t),this._signal("change",e),this.$cursorChange(),this.$updateHighlightActiveLine()},this.onTokenizerUpdate=function(e){var t=e.data;this.renderer.updateLines(t.first,t.last)},this.onScrollTopChange=function(){this.renderer.scrollToY(this.session.getScrollTop())},this.onScrollLeftChange=function(){this.renderer.scrollToX(this.session.getScrollLeft())},this.onCursorChange=function(){this.$cursorChange(),this.$blockScrolling||(g.warn("Automatically scrolling cursor into view after selection change","this will be disabled in the next version","set editor.$blockScrolling = Infinity to disable this message"),this.renderer.scrollCursorIntoView()),this.$highlightBrackets(),this.$highlightTags(),this.$updateHighlightActiveLine(),this._signal("changeSelection")},this.$updateHighlightActiveLine=function(){var e=this.getSession(),t;if(this.$highlightActiveLine){if(this.$selectionStyle!="line"||!this.selection.isMultiLine())t=this.getCursorPosition();this.renderer.$maxLines&&this.session.getLength()===1&&!(this.renderer.$minLines>1)&&(t=!1)}if(e.$highlightLineMarker&&!t)e.removeMarker(e.$highlightLineMarker.id),e.$highlightLineMarker=null;else if(!e.$highlightLineMarker&&t){var n=new p(t.row,t.column,t.row,Infinity);n.id=e.addMarker(n,"ace_active-line","screenLine"),e.$highlightLineMarker=n}else t&&(e.$highlightLineMarker.start.row=t.row,e.$highlightLineMarker.end.row=t.row,e.$highlightLineMarker.start.column=t.column,e._signal("changeBackMarker"))},this.onSelectionChange=function(e){var t=this.session;t.$selectionMarker&&t.removeMarker(t.$selectionMarker),t.$selectionMarker=null;if(!this.selection.isEmpty()){var n=this.selection.getRange(),r=this.getSelectionStyle();t.$selectionMarker=t.addMarker(n,"ace_selection",r)}else this.$updateHighlightActiveLine();var i=this.$highlightSelectedWord&&this.$getSelectionHighLightRegexp();this.session.highlight(i),this._signal("changeSelection")},this.$getSelectionHighLightRegexp=function(){var e=this.session,t=this.getSelectionRange();if(t.isEmpty()||t.isMultiLine())return;var n=t.start.column-1,r=t.end.column+1,i=e.getLine(t.start.row),s=i.length,o=i.substring(Math.max(n,0),Math.min(r,s));if(n>=0&&/^[\w\d]/.test(o)||r<=s&&/[\w\d]$/.test(o))return;o=i.substring(t.start.column,t.end.column);if(!/^[\w\d]+$/.test(o))return;var u=this.$search.$assembleRegExp({wholeWord:!0,caseSensitive:!0,needle:o});return u},this.onChangeFrontMarker=function(){this.renderer.updateFrontMarkers()},this.onChangeBackMarker=function(){this.renderer.updateBackMarkers()},this.onChangeBreakpoint=function(){this.renderer.updateBreakpoints()},this.onChangeAnnotation=function(){this.renderer.setAnnotations(this.session.getAnnotations())},this.onChangeMode=function(e){this.renderer.updateText(),this._emit("changeMode",e)},this.onChangeWrapLimit=function(){this.renderer.updateFull()},this.onChangeWrapMode=function(){this.renderer.onResize(!0)},this.onChangeFold=function(){this.$updateHighlightActiveLine(),this.renderer.updateFull()},this.getSelectedText=function(){return this.session.getTextRange(this.getSelectionRange())},this.getCopyText=function(){var e=this.getSelectedText();return this._signal("copy",e),e},this.onCopy=function(){this.commands.exec("copy",this)},this.onCut=function(){this.commands.exec("cut",this)},this.onPaste=function(e,t){var n={text:e,event:t};this.commands.exec("paste",this,n)},this.$handlePaste=function(e){typeof e=="string"&&(e={text:e}),this._signal("paste",e);var t=e.text;if(!this.inMultiSelectMode||this.inVirtualSelectionMode)this.insert(t);else{var n=t.split(/\r\n|\r|\n/),r=this.selection.rangeList.ranges;if(n.length>r.length||n.length<2||!n[1])return this.commands.exec("insertstring",this,t);for(var i=r.length;i--;){var s=r[i];s.isEmpty()||this.session.remove(s),this.session.insert(s.start,n[i])}}},this.execCommand=function(e,t){return this.commands.exec(e,this,t)},this.insert=function(e,t){var n=this.session,r=n.getMode(),i=this.getCursorPosition();if(this.getBehavioursEnabled()&&!t){var s=r.transformAction(n.getState(i.row),"insertion",this,n,e);s&&(e!==s.text&&(this.session.mergeUndoDeltas=!1,this.$mergeNextCommand=!1),e=s.text)}e=="	"&&(e=this.session.getTabString());if(!this.selection.isEmpty()){var o=this.getSelectionRange();i=this.session.remove(o),this.clearSelection()}else if(this.session.getOverwrite()&&e.indexOf("\n")==-1){var o=new p.fromPoints(i,i);o.end.column+=e.length,this.session.remove(o)}if(e=="\n"||e=="\r\n"){var u=n.getLine(i.row);if(i.column>u.search(/\S|$/)){var a=u.substr(i.column).search(/\S|$/);n.doc.removeInLine(i.row,i.column,i.column+a)}}this.clearSelection();var f=i.column,l=n.getState(i.row),u=n.getLine(i.row),c=r.checkOutdent(l,u,e),h=n.insert(i,e);s&&s.selection&&(s.selection.length==2?this.selection.setSelectionRange(new p(i.row,f+s.selection[0],i.row,f+s.selection[1])):this.selection.setSelectionRange(new p(i.row+s.selection[0],s.selection[1],i.row+s.selection[2],s.selection[3])));if(n.getDocument().isNewLine(e)){var d=r.getNextLineIndent(l,u.slice(0,i.column),n.getTabString());n.insert({row:i.row+1,column:0},d)}c&&r.autoOutdent(l,n,i.row)},this.onTextInput=function(e){this.keyBinding.onTextInput(e)},this.onCommandKey=function(e,t,n){this.keyBinding.onCommandKey(e,t,n)},this.setOverwrite=function(e){this.session.setOverwrite(e)},this.getOverwrite=function(){return this.session.getOverwrite()},this.toggleOverwrite=function(){this.session.toggleOverwrite()},this.setScrollSpeed=function(e){this.setOption("scrollSpeed",e)},this.getScrollSpeed=function(){return this.getOption("scrollSpeed")},this.setDragDelay=function(e){this.setOption("dragDelay",e)},this.getDragDelay=function(){return this.getOption("dragDelay")},this.setSelectionStyle=function(e){this.setOption("selectionStyle",e)},this.getSelectionStyle=function(){return this.getOption("selectionStyle")},this.setHighlightActiveLine=function(e){this.setOption("highlightActiveLine",e)},this.getHighlightActiveLine=function(){return this.getOption("highlightActiveLine")},this.setHighlightGutterLine=function(e){this.setOption("highlightGutterLine",e)},this.getHighlightGutterLine=function(){return this.getOption("highlightGutterLine")},this.setHighlightSelectedWord=function(e){this.setOption("highlightSelectedWord",e)},this.getHighlightSelectedWord=function(){return this.$highlightSelectedWord},this.setAnimatedScroll=function(e){this.renderer.setAnimatedScroll(e)},this.getAnimatedScroll=function(){return this.renderer.getAnimatedScroll()},this.setShowInvisibles=function(e){this.renderer.setShowInvisibles(e)},this.getShowInvisibles=function(){return this.renderer.getShowInvisibles()},this.setDisplayIndentGuides=function(e){this.renderer.setDisplayIndentGuides(e)},this.getDisplayIndentGuides=function(){return this.renderer.getDisplayIndentGuides()},this.setShowPrintMargin=function(e){this.renderer.setShowPrintMargin(e)},this.getShowPrintMargin=function(){return this.renderer.getShowPrintMargin()},this.setPrintMarginColumn=function(e){this.renderer.setPrintMarginColumn(e)},this.getPrintMarginColumn=function(){return this.renderer.getPrintMarginColumn()},this.setReadOnly=function(e){this.setOption("readOnly",e)},this.getReadOnly=function(){return this.getOption("readOnly")},this.setBehavioursEnabled=function(e){this.setOption("behavioursEnabled",e)},this.getBehavioursEnabled=function(){return this.getOption("behavioursEnabled")},this.setWrapBehavioursEnabled=function(e){this.setOption("wrapBehavioursEnabled",e)},this.getWrapBehavioursEnabled=function(){return this.getOption("wrapBehavioursEnabled")},this.setShowFoldWidgets=function(e){this.setOption("showFoldWidgets",e)},this.getShowFoldWidgets=function(){return this.getOption("showFoldWidgets")},this.setFadeFoldWidgets=function(e){this.setOption("fadeFoldWidgets",e)},this.getFadeFoldWidgets=function(){return this.getOption("fadeFoldWidgets")},this.remove=function(e){this.selection.isEmpty()&&(e=="left"?this.selection.selectLeft():this.selection.selectRight());var t=this.getSelectionRange();if(this.getBehavioursEnabled()){var n=this.session,r=n.getState(t.start.row),i=n.getMode().transformAction(r,"deletion",this,n,t);if(t.end.column===0){var s=n.getTextRange(t);if(s[s.length-1]=="\n"){var o=n.getLine(t.end.row);/^\s+$/.test(o)&&(t.end.column=o.length)}}i&&(t=i)}this.session.remove(t),this.clearSelection()},this.removeWordRight=function(){this.selection.isEmpty()&&this.selection.selectWordRight(),this.session.remove(this.getSelectionRange()),this.clearSelection()},this.removeWordLeft=function(){this.selection.isEmpty()&&this.selection.selectWordLeft(),this.session.remove(this.getSelectionRange()),this.clearSelection()},this.removeToLineStart=function(){this.selection.isEmpty()&&this.selection.selectLineStart(),this.session.remove(this.getSelectionRange()),this.clearSelection()},this.removeToLineEnd=function(){this.selection.isEmpty()&&this.selection.selectLineEnd();var e=this.getSelectionRange();e.start.column==e.end.column&&e.start.row==e.end.row&&(e.end.column=0,e.end.row++),this.session.remove(e),this.clearSelection()},this.splitLine=function(){this.selection.isEmpty()||(this.session.remove(this.getSelectionRange()),this.clearSelection());var e=this.getCursorPosition();this.insert("\n"),this.moveCursorToPosition(e)},this.transposeLetters=function(){if(!this.selection.isEmpty())return;var e=this.getCursorPosition(),t=e.column;if(t===0)return;var n=this.session.getLine(e.row),r,i;t<n.length?(r=n.charAt(t)+n.charAt(t-1),i=new p(e.row,t-1,e.row,t+1)):(r=n.charAt(t-1)+n.charAt(t-2),i=new p(e.row,t-2,e.row,t)),this.session.replace(i,r),this.session.selection.moveToPosition(i.end)},this.toLowerCase=function(){var e=this.getSelectionRange();this.selection.isEmpty()&&this.selection.selectWord();var t=this.getSelectionRange(),n=this.session.getTextRange(t);this.session.replace(t,n.toLowerCase()),this.selection.setSelectionRange(e)},this.toUpperCase=function(){var e=this.getSelectionRange();this.selection.isEmpty()&&this.selection.selectWord();var t=this.getSelectionRange(),n=this.session.getTextRange(t);this.session.replace(t,n.toUpperCase()),this.selection.setSelectionRange(e)},this.indent=function(){var e=this.session,t=this.getSelectionRange();if(t.start.row<t.end.row){var n=this.$getSelectedRows();e.indentRows(n.first,n.last,"	");return}if(t.start.column<t.end.column){var r=e.getTextRange(t);if(!/^\s+$/.test(r)){var n=this.$getSelectedRows();e.indentRows(n.first,n.last,"	");return}}var i=e.getLine(t.start.row),o=t.start,u=e.getTabSize(),a=e.documentToScreenColumn(o.row,o.column);if(this.session.getUseSoftTabs())var f=u-a%u,l=s.stringRepeat(" ",f);else{var f=a%u;while(i[t.start.column-1]==" "&&f)t.start.column--,f--;this.selection.setSelectionRange(t),l="	"}return this.insert(l)},this.blockIndent=function(){var e=this.$getSelectedRows();this.session.indentRows(e.first,e.last,"	")},this.blockOutdent=function(){var e=this.session.getSelection();this.session.outdentRows(e.getRange())},this.sortLines=function(){var e=this.$getSelectedRows(),t=this.session,n=[];for(var r=e.first;r<=e.last;r++)n.push(t.getLine(r));n.sort(function(e,t){return e.toLowerCase()<t.toLowerCase()?-1:e.toLowerCase()>t.toLowerCase()?1:0});var i=new p(0,0,0,0);for(var r=e.first;r<=e.last;r++){var s=t.getLine(r);i.start.row=r,i.end.row=r,i.end.column=s.length,t.replace(i,n[r-e.first])}},this.toggleCommentLines=function(){var e=this.session.getState(this.getCursorPosition().row),t=this.$getSelectedRows();this.session.getMode().toggleCommentLines(e,this.session,t.first,t.last)},this.toggleBlockComment=function(){var e=this.getCursorPosition(),t=this.session.getState(e.row),n=this.getSelectionRange();this.session.getMode().toggleBlockComment(t,this.session,n,e)},this.getNumberAt=function(e,t){var n=/[\-]?[0-9]+(?:\.[0-9]+)?/g;n.lastIndex=0;var r=this.session.getLine(e);while(n.lastIndex<t){var i=n.exec(r);if(i.index<=t&&i.index+i[0].length>=t){var s={value:i[0],start:i.index,end:i.index+i[0].length};return s}}return null},this.modifyNumber=function(e){var t=this.selection.getCursor().row,n=this.selection.getCursor().column,r=new p(t,n-1,t,n),i=this.session.getTextRange(r);if(!isNaN(parseFloat(i))&&isFinite(i)){var s=this.getNumberAt(t,n);if(s){var o=s.value.indexOf(".")>=0?s.start+s.value.indexOf(".")+1:s.end,u=s.start+s.value.length-o,a=parseFloat(s.value);a*=Math.pow(10,u),o!==s.end&&n<o?e*=Math.pow(10,s.end-n-1):e*=Math.pow(10,s.end-n),a+=e,a/=Math.pow(10,u);var f=a.toFixed(u),l=new p(t,s.start,t,s.end);this.session.replace(l,f),this.moveCursorTo(t,Math.max(s.start+1,n+f.length-s.value.length))}}},this.removeLines=function(){var e=this.$getSelectedRows();this.session.removeFullLines(e.first,e.last),this.clearSelection()},this.duplicateSelection=function(){var e=this.selection,t=this.session,n=e.getRange(),r=e.isBackwards();if(n.isEmpty()){var i=n.start.row;t.duplicateLines(i,i)}else{var s=r?n.start:n.end,o=t.insert(s,t.getTextRange(n),!1);n.start=s,n.end=o,e.setSelectionRange(n,r)}},this.moveLinesDown=function(){this.$moveLines(1,!1)},this.moveLinesUp=function(){this.$moveLines(-1,!1)},this.moveText=function(e,t,n){return this.session.moveText(e,t,n)},this.copyLinesUp=function(){this.$moveLines(-1,!0)},this.copyLinesDown=function(){this.$moveLines(1,!0)},this.$moveLines=function(e,t){var n,r,i=this.selection;if(!i.inMultiSelectMode||this.inVirtualSelectionMode){var s=i.toOrientedRange();n=this.$getSelectedRows(s),r=this.session.$moveLines(n.first,n.last,t?0:e),t&&e==-1&&(r=0),s.moveBy(r,0),i.fromOrientedRange(s)}else{var o=i.rangeList.ranges;i.rangeList.detach(this.session),this.inVirtualSelectionMode=!0;var u=0,a=0,f=o.length;for(var l=0;l<f;l++){var c=l;o[l].moveBy(u,0),n=this.$getSelectedRows(o[l]);var h=n.first,p=n.last;while(++l<f){a&&o[l].moveBy(a,0);var d=this.$getSelectedRows(o[l]);if(t&&d.first!=p)break;if(!t&&d.first>p+1)break;p=d.last}l--,u=this.session.$moveLines(h,p,t?0:e),t&&e==-1&&(c=l+1);while(c<=l)o[c].moveBy(u,0),c++;t||(u=0),a+=u}i.fromOrientedRange(i.ranges[0]),i.rangeList.attach(this.session),this.inVirtualSelectionMode=!1}},this.$getSelectedRows=function(e){return e=(e||this.getSelectionRange()).collapseRows(),{first:this.session.getRowFoldStart(e.start.row),last:this.session.getRowFoldEnd(e.end.row)}},this.onCompositionStart=function(e){this.renderer.showComposition(this.getCursorPosition())},this.onCompositionUpdate=function(e){this.renderer.setCompositionText(e)},this.onCompositionEnd=function(){this.renderer.hideComposition()},this.getFirstVisibleRow=function(){return this.renderer.getFirstVisibleRow()},this.getLastVisibleRow=function(){return this.renderer.getLastVisibleRow()},this.isRowVisible=function(e){return e>=this.getFirstVisibleRow()&&e<=this.getLastVisibleRow()},this.isRowFullyVisible=function(e){return e>=this.renderer.getFirstFullyVisibleRow()&&e<=this.renderer.getLastFullyVisibleRow()},this.$getVisibleRowCount=function(){return this.renderer.getScrollBottomRow()-this.renderer.getScrollTopRow()+1},this.$moveByPage=function(e,t){var n=this.renderer,r=this.renderer.layerConfig,i=e*Math.floor(r.height/r.lineHeight);this.$blockScrolling++,t===!0?this.selection.$moveSelection(function(){this.moveCursorBy(i,0)}):t===!1&&(this.selection.moveCursorBy(i,0),this.selection.clearSelection()),this.$blockScrolling--;var s=n.scrollTop;n.scrollBy(0,i*r.lineHeight),t!=null&&n.scrollCursorIntoView(null,.5),n.animateScrolling(s)},this.selectPageDown=function(){this.$moveByPage(1,!0)},this.selectPageUp=function(){this.$moveByPage(-1,!0)},this.gotoPageDown=function(){this.$moveByPage(1,!1)},this.gotoPageUp=function(){this.$moveByPage(-1,!1)},this.scrollPageDown=function(){this.$moveByPage(1)},this.scrollPageUp=function(){this.$moveByPage(-1)},this.scrollToRow=function(e){this.renderer.scrollToRow(e)},this.scrollToLine=function(e,t,n,r){this.renderer.scrollToLine(e,t,n,r)},this.centerSelection=function(){var e=this.getSelectionRange(),t={row:Math.floor(e.start.row+(e.end.row-e.start.row)/2),column:Math.floor(e.start.column+(e.end.column-e.start.column)/2)};this.renderer.alignCursor(t,.5)},this.getCursorPosition=function(){return this.selection.getCursor()},this.getCursorPositionScreen=function(){return this.session.documentToScreenPosition(this.getCursorPosition())},this.getSelectionRange=function(){return this.selection.getRange()},this.selectAll=function(){this.$blockScrolling+=1,this.selection.selectAll(),this.$blockScrolling-=1},this.clearSelection=function(){this.selection.clearSelection()},this.moveCursorTo=function(e,t){this.selection.moveCursorTo(e,t)},this.moveCursorToPosition=function(e){this.selection.moveCursorToPosition(e)},this.jumpToMatching=function(e,t){var n=this.getCursorPosition(),r=new y(this.session,n.row,n.column),i=r.getCurrentToken(),s=i||r.stepForward();if(!s)return;var o,u=!1,a={},f=n.column-s.start,l,c={")":"(","(":"(","]":"[","[":"[","{":"{","}":"{"};do{if(s.value.match(/[{}()\[\]]/g))for(;f<s.value.length&&!u;f++){if(!c[s.value[f]])continue;l=c[s.value[f]]+"."+s.type.replace("rparen","lparen"),isNaN(a[l])&&(a[l]=0);switch(s.value[f]){case"(":case"[":case"{":a[l]++;break;case")":case"]":case"}":a[l]--,a[l]===-1&&(o="bracket",u=!0)}}else s&&s.type.indexOf("tag-name")!==-1&&(isNaN(a[s.value])&&(a[s.value]=0),i.value==="<"?a[s.value]++:i.value==="</"&&a[s.value]--,a[s.value]===-1&&(o="tag",u=!0));u||(i=s,s=r.stepForward(),f=0)}while(s&&!u);if(!o)return;var h,d;if(o==="bracket"){h=this.session.getBracketRange(n);if(!h){h=new p(r.getCurrentTokenRow(),r.getCurrentTokenColumn()+f-1,r.getCurrentTokenRow(),r.getCurrentTokenColumn()+f-1),d=h.start;if(t||d.row===n.row&&Math.abs(d.column-n.column)<2)h=this.session.getBracketRange(d)}}else if(o==="tag"){if(!s||s.type.indexOf("tag-name")===-1)return;var v=s.value;h=new p(r.getCurrentTokenRow(),r.getCurrentTokenColumn()-2,r.getCurrentTokenRow(),r.getCurrentTokenColumn()-2);if(h.compare(n.row,n.column)===0){u=!1;do s=i,i=r.stepBackward(),i&&(i.type.indexOf("tag-close")!==-1&&h.setEnd(r.getCurrentTokenRow(),r.getCurrentTokenColumn()+1),s.value===v&&s.type.indexOf("tag-name")!==-1&&(i.value==="<"?a[v]++:i.value==="</"&&a[v]--,a[v]===0&&(u=!0)));while(i&&!u)}s&&s.type.indexOf("tag-name")&&(d=h.start,d.row==n.row&&Math.abs(d.column-n.column)<2&&(d=h.end))}d=h&&h.cursor||d,d&&(e?h&&t?this.selection.setRange(h):h&&h.isEqual(this.getSelectionRange())?this.clearSelection():this.selection.selectTo(d.row,d.column):this.selection.moveTo(d.row,d.column))},this.gotoLine=function(e,t,n){this.selection.clearSelection(),this.session.unfold({row:e-1,column:t||0}),this.$blockScrolling+=1,this.exitMultiSelectMode&&this.exitMultiSelectMode(),this.moveCursorTo(e-1,t||0),this.$blockScrolling-=1,this.isRowFullyVisible(e-1)||this.scrollToLine(e-1,!0,n)},this.navigateTo=function(e,t){this.selection.moveTo(e,t)},this.navigateUp=function(e){if(this.selection.isMultiLine()&&!this.selection.isBackwards()){var t=this.selection.anchor.getPosition();return this.moveCursorToPosition(t)}this.selection.clearSelection(),this.selection.moveCursorBy(-e||-1,0)},this.navigateDown=function(e){if(this.selection.isMultiLine()&&this.selection.isBackwards()){var t=this.selection.anchor.getPosition();return this.moveCursorToPosition(t)}this.selection.clearSelection(),this.selection.moveCursorBy(e||1,0)},this.navigateLeft=function(e){if(!this.selection.isEmpty()){var t=this.getSelectionRange().start;this.moveCursorToPosition(t)}else{e=e||1;while(e--)this.selection.moveCursorLeft()}this.clearSelection()},this.navigateRight=function(e){if(!this.selection.isEmpty()){var t=this.getSelectionRange().end;this.moveCursorToPosition(t)}else{e=e||1;while(e--)this.selection.moveCursorRight()}this.clearSelection()},this.navigateLineStart=function(){this.selection.moveCursorLineStart(),this.clearSelection()},this.navigateLineEnd=function(){this.selection.moveCursorLineEnd(),this.clearSelection()},this.navigateFileEnd=function(){this.selection.moveCursorFileEnd(),this.clearSelection()},this.navigateFileStart=function(){this.selection.moveCursorFileStart(),this.clearSelection()},this.navigateWordRight=function(){this.selection.moveCursorWordRight(),this.clearSelection()},this.navigateWordLeft=function(){this.selection.moveCursorWordLeft(),this.clearSelection()},this.replace=function(e,t){t&&this.$search.set(t);var n=this.$search.find(this.session),r=0;return n?(this.$tryReplace(n,e)&&(r=1),n!==null&&(this.selection.setSelectionRange(n),this.renderer.scrollSelectionIntoView(n.start,n.end)),r):r},this.replaceAll=function(e,t){t&&this.$search.set(t);var n=this.$search.findAll(this.session),r=0;if(!n.length)return r;this.$blockScrolling+=1;var i=this.getSelectionRange();this.selection.moveTo(0,0);for(var s=n.length-1;s>=0;--s)this.$tryReplace(n[s],e)&&r++;return this.selection.setSelectionRange(i),this.$blockScrolling-=1,r},this.$tryReplace=function(e,t){var n=this.session.getTextRange(e);return t=this.$search.replace(n,t),t!==null?(e.end=this.session.replace(e,t),e):null},this.getLastSearchOptions=function(){return this.$search.getOptions()},this.find=function(e,t,n){t||(t={}),typeof e=="string"||e instanceof RegExp?t.needle=e:typeof e=="object"&&r.mixin(t,e);var i=this.selection.getRange();t.needle==null&&(e=this.session.getTextRange(i)||this.$search.$options.needle,e||(i=this.session.getWordRange(i.start.row,i.start.column),e=this.session.getTextRange(i)),this.$search.set({needle:e})),this.$search.set(t),t.start||this.$search.set({start:i});var s=this.$search.find(this.session);if(t.preventScroll)return s;if(s)return this.revealRange(s,n),s;t.backwards?i.start=i.end:i.end=i.start,this.selection.setRange(i)},this.findNext=function(e,t){this.find({skipCurrent:!0,backwards:!1},e,t)},this.findPrevious=function(e,t){this.find(e,{skipCurrent:!0,backwards:!0},t)},this.revealRange=function(e,t){this.$blockScrolling+=1,this.session.unfold(e),this.selection.setSelectionRange(e),this.$blockScrolling-=1;var n=this.renderer.scrollTop;this.renderer.scrollSelectionIntoView(e.start,e.end,.5),t!==!1&&this.renderer.animateScrolling(n)},this.undo=function(){this.$blockScrolling++,this.session.getUndoManager().undo(),this.$blockScrolling--,this.renderer.scrollCursorIntoView(null,.5)},this.redo=function(){this.$blockScrolling++,this.session.getUndoManager().redo(),this.$blockScrolling--,this.renderer.scrollCursorIntoView(null,.5)},this.destroy=function(){this.renderer.destroy(),this._signal("destroy",this),this.session&&this.session.destroy()},this.setAutoScrollEditorIntoView=function(e){if(!e)return;var t,n=this,r=!1;this.$scrollAnchor||(this.$scrollAnchor=document.createElement("div"));var i=this.$scrollAnchor;i.style.cssText="position:absolute",this.container.insertBefore(i,this.container.firstChild);var s=this.on("changeSelection",function(){r=!0}),o=this.renderer.on("beforeRender",function(){r&&(t=n.renderer.container.getBoundingClientRect())}),u=this.renderer.on("afterRender",function(){if(r&&t&&(n.isFocused()||n.searchBox&&n.searchBox.isFocused())){var e=n.renderer,s=e.$cursorLayer.$pixelPos,o=e.layerConfig,u=s.top-o.offset;s.top>=0&&u+t.top<0?r=!0:s.top<o.height&&s.top+t.top+o.lineHeight>window.innerHeight?r=!1:r=null,r!=null&&(i.style.top=u+"px",i.style.left=s.left+"px",i.style.height=o.lineHeight+"px",i.scrollIntoView(r)),r=t=null}});this.setAutoScrollEditorIntoView=function(e){if(e)return;delete this.setAutoScrollEditorIntoView,this.off("changeSelection",s),this.renderer.off("afterRender",u),this.renderer.off("beforeRender",o)}},this.$resetCursorStyle=function(){var e=this.$cursorStyle||"ace",t=this.renderer.$cursorLayer;if(!t)return;t.setSmoothBlinking(/smooth/.test(e)),t.isBlinking=!this.$readOnly&&e!="wide",i.setCssClass(t.element,"ace_slim-cursors",/slim/.test(e))}}.call(b.prototype),g.defineOptions(b.prototype,"editor",{selectionStyle:{set:function(e){this.onSelectionChange(),this._signal("changeSelectionStyle",{data:e})},initialValue:"line"},highlightActiveLine:{set:function(){this.$updateHighlightActiveLine()},initialValue:!0},highlightSelectedWord:{set:function(e){this.$onSelectionChange()},initialValue:!0},readOnly:{set:function(e){this.$resetCursorStyle()},initialValue:!1},cursorStyle:{set:function(e){this.$resetCursorStyle()},values:["ace","slim","smooth","wide"],initialValue:"ace"},mergeUndoDeltas:{values:[!1,!0,"always"],initialValue:!0},behavioursEnabled:{initialValue:!0},wrapBehavioursEnabled:{initialValue:!0},autoScrollEditorIntoView:{set:function(e){this.setAutoScrollEditorIntoView(e)}},keyboardHandler:{set:function(e){this.setKeyboardHandler(e)},get:function(){return this.keybindingId},handlesSet:!0},hScrollBarAlwaysVisible:"renderer",vScrollBarAlwaysVisible:"renderer",highlightGutterLine:"renderer",animatedScroll:"renderer",showInvisibles:"renderer",showPrintMargin:"renderer",printMarginColumn:"renderer",printMargin:"renderer",fadeFoldWidgets:"renderer",showFoldWidgets:"renderer",showLineNumbers:"renderer",showGutter:"renderer",displayIndentGuides:"renderer",fontSize:"renderer",fontFamily:"renderer",maxLines:"renderer",minLines:"renderer",scrollPastEnd:"renderer",fixedWidthGutter:"renderer",theme:"renderer",scrollSpeed:"$mouseHandler",dragDelay:"$mouseHandler",dragEnabled:"$mouseHandler",focusTimout:"$mouseHandler",tooltipFollowsMouse:"$mouseHandler",firstLineNumber:"session",overwrite:"session",newLineMode:"session",useWorker:"session",useSoftTabs:"session",tabSize:"session",wrap:"session",indentedSoftWrap:"session",foldStyle:"session",mode:"session"}),t.Editor=b}),define("ace/undomanager",["require","exports","module"],function(e,t,n){"use strict";var r=function(){this.reset()};(function(){function e(e){return{action:e.action,start:e.start,end:e.end,lines:e.lines.length==1?null:e.lines,text:e.lines.length==1?e.lines[0]:null}}function t(e){return{action:e.action,start:e.start,end:e.end,lines:e.lines||[e.text]}}function n(e,t){var n=new Array(e.length);for(var r=0;r<e.length;r++){var i=e[r],s={group:i.group,deltas:new Array(i.length)};for(var o=0;o<i.deltas.length;o++){var u=i.deltas[o];s.deltas[o]=t(u)}n[r]=s}return n}this.execute=function(e){var t=e.args[0];this.$doc=e.args[1],e.merge&&this.hasUndo()&&(this.dirtyCounter--,t=this.$undoStack.pop().concat(t)),this.$undoStack.push(t),this.$redoStack=[],this.dirtyCounter<0&&(this.dirtyCounter=NaN),this.dirtyCounter++},this.undo=function(e){var t=this.$undoStack.pop(),n=null;return t&&(n=this.$doc.undoChanges(t,e),this.$redoStack.push(t),this.dirtyCounter--),n},this.redo=function(e){var t=this.$redoStack.pop(),n=null;return t&&(n=this.$doc.redoChanges(this.$deserializeDeltas(t),e),this.$undoStack.push(t),this.dirtyCounter++),n},this.reset=function(){this.$undoStack=[],this.$redoStack=[],this.dirtyCounter=0},this.hasUndo=function(){return this.$undoStack.length>0},this.hasRedo=function(){return this.$redoStack.length>0},this.markClean=function(){this.dirtyCounter=0},this.isClean=function(){return this.dirtyCounter===0},this.$serializeDeltas=function(t){return n(t,e)},this.$deserializeDeltas=function(e){return n(e,t)}}).call(r.prototype),t.UndoManager=r}),define("ace/layer/gutter",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/lang","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("../lib/dom"),i=e("../lib/oop"),s=e("../lib/lang"),o=e("../lib/event_emitter").EventEmitter,u=function(e){this.element=r.createElement("div"),this.element.className="ace_layer ace_gutter-layer",e.appendChild(this.element),this.setShowFoldWidgets(this.$showFoldWidgets),this.gutterWidth=0,this.$annotations=[],this.$updateAnnotations=this.$updateAnnotations.bind(this),this.$cells=[]};(function(){i.implement(this,o),this.setSession=function(e){this.session&&this.session.removeEventListener("change",this.$updateAnnotations),this.session=e,e&&e.on("change",this.$updateAnnotations)},this.addGutterDecoration=function(e,t){window.console&&console.warn&&console.warn("deprecated use session.addGutterDecoration"),this.session.addGutterDecoration(e,t)},this.removeGutterDecoration=function(e,t){window.console&&console.warn&&console.warn("deprecated use session.removeGutterDecoration"),this.session.removeGutterDecoration(e,t)},this.setAnnotations=function(e){this.$annotations=[];for(var t=0;t<e.length;t++){var n=e[t],r=n.row,i=this.$annotations[r];i||(i=this.$annotations[r]={text:[]});var o=n.text;o=o?s.escapeHTML(o):n.html||"",i.text.indexOf(o)===-1&&i.text.push(o);var u=n.type;u=="error"?i.className=" ace_error":u=="warning"&&i.className!=" ace_error"?i.className=" ace_warning":u=="info"&&!i.className&&(i.className=" ace_info")}},this.$updateAnnotations=function(e){if(!this.$annotations.length)return;var t=e.start.row,n=e.end.row-t;if(n!==0)if(e.action=="remove")this.$annotations.splice(t,n+1,null);else{var r=new Array(n+1);r.unshift(t,1),this.$annotations.splice.apply(this.$annotations,r)}},this.update=function(e){var t=this.session,n=e.firstRow,i=Math.min(e.lastRow+e.gutterOffset,t.getLength()-1),s=t.getNextFoldLine(n),o=s?s.start.row:Infinity,u=this.$showFoldWidgets&&t.foldWidgets,a=t.$breakpoints,f=t.$decorations,l=t.$firstLineNumber,c=0,h=t.gutterRenderer||this.$renderer,p=null,d=-1,v=n;for(;;){v>o&&(v=s.end.row+1,s=t.getNextFoldLine(v,s),o=s?s.start.row:Infinity);if(v>i){while(this.$cells.length>d+1)p=this.$cells.pop(),this.element.removeChild(p.element);break}p=this.$cells[++d],p||(p={element:null,textNode:null,foldWidget:null},p.element=r.createElement("div"),p.textNode=document.createTextNode(""),p.element.appendChild(p.textNode),this.element.appendChild(p.element),this.$cells[d]=p);var m="ace_gutter-cell ";a[v]&&(m+=a[v]),f[v]&&(m+=f[v]),this.$annotations[v]&&(m+=this.$annotations[v].className),p.element.className!=m&&(p.element.className=m);var g=t.getRowLength(v)*e.lineHeight+"px";g!=p.element.style.height&&(p.element.style.height=g);if(u){var y=u[v];y==null&&(y=u[v]=t.getFoldWidget(v))}if(y){p.foldWidget||(p.foldWidget=r.createElement("span"),p.element.appendChild(p.foldWidget));var m="ace_fold-widget ace_"+y;y=="start"&&v==o&&v<s.end.row?m+=" ace_closed":m+=" ace_open",p.foldWidget.className!=m&&(p.foldWidget.className=m);var g=e.lineHeight+"px";p.foldWidget.style.height!=g&&(p.foldWidget.style.height=g)}else p.foldWidget&&(p.element.removeChild(p.foldWidget),p.foldWidget=null);var b=c=h?h.getText(t,v):v+l;b!==p.textNode.data&&(p.textNode.data=b),v++}this.element.style.height=e.minHeight+"px";if(this.$fixedWidth||t.$useWrapMode)c=t.getLength()+l;var w=h?h.getWidth(t,c,e):c.toString().length*e.characterWidth,E=this.$padding||this.$computePadding();w+=E.left+E.right,w!==this.gutterWidth&&!isNaN(w)&&(this.gutterWidth=w,this.element.style.width=Math.ceil(this.gutterWidth)+"px",this._emit("changeGutterWidth",w))},this.$fixedWidth=!1,this.$showLineNumbers=!0,this.$renderer="",this.setShowLineNumbers=function(e){this.$renderer=!e&&{getWidth:function(){return""},getText:function(){return""}}},this.getShowLineNumbers=function(){return this.$showLineNumbers},this.$showFoldWidgets=!0,this.setShowFoldWidgets=function(e){e?r.addCssClass(this.element,"ace_folding-enabled"):r.removeCssClass(this.element,"ace_folding-enabled"),this.$showFoldWidgets=e,this.$padding=null},this.getShowFoldWidgets=function(){return this.$showFoldWidgets},this.$computePadding=function(){if(!this.element.firstChild)return{left:0,right:0};var e=r.computedStyle(this.element.firstChild);return this.$padding={},this.$padding.left=parseInt(e.paddingLeft)+1||0,this.$padding.right=parseInt(e.paddingRight)||0,this.$padding},this.getRegion=function(e){var t=this.$padding||this.$computePadding(),n=this.element.getBoundingClientRect();if(e.x<t.left+n.left)return"markers";if(this.$showFoldWidgets&&e.x>n.right-t.right)return"foldWidgets"}}).call(u.prototype),t.Gutter=u}),define("ace/layer/marker",["require","exports","module","ace/range","ace/lib/dom"],function(e,t,n){"use strict";var r=e("../range").Range,i=e("../lib/dom"),s=function(e){this.element=i.createElement("div"),this.element.className="ace_layer ace_marker-layer",e.appendChild(this.element)};(function(){function e(e,t,n,r){return(e?1:0)|(t?2:0)|(n?4:0)|(r?8:0)}this.$padding=0,this.setPadding=function(e){this.$padding=e},this.setSession=function(e){this.session=e},this.setMarkers=function(e){this.markers=e},this.update=function(e){if(!e)return;this.config=e;var t=[];for(var n in this.markers){var r=this.markers[n];if(!r.range){r.update(t,this,this.session,e);continue}var i=r.range.clipRows(e.firstRow,e.lastRow);if(i.isEmpty())continue;i=i.toScreenRange(this.session);if(r.renderer){var s=this.$getTop(i.start.row,e),o=this.$padding+(this.session.$bidiHandler.isBidiRow(i.start.row)?this.session.$bidiHandler.getPosLeft(i.start.column):i.start.column*e.characterWidth);r.renderer(t,i,o,s,e)}else r.type=="fullLine"?this.drawFullLineMarker(t,i,r.clazz,e):r.type=="screenLine"?this.drawScreenLineMarker(t,i,r.clazz,e):i.isMultiLine()?r.type=="text"?this.drawTextMarker(t,i,r.clazz,e):this.drawMultiLineMarker(t,i,r.clazz,e):this.session.$bidiHandler.isBidiRow(i.start.row)?this.drawBidiSingleLineMarker(t,i,r.clazz+" ace_start"+" ace_br15",e):this.drawSingleLineMarker(t,i,r.clazz+" ace_start"+" ace_br15",e)}this.element.innerHTML=t.join("")},this.$getTop=function(e,t){return(e-t.firstRowScreen)*t.lineHeight},this.drawTextMarker=function(t,n,i,s,o){var u=this.session,a=n.start.row,f=n.end.row,l=a,c=0,h=0,p=u.getScreenLastRowColumn(l),d=null,v=new r(l,n.start.column,l,h);for(;l<=f;l++)v.start.row=v.end.row=l,v.start.column=l==a?n.start.column:u.getRowWrapIndent(l),v.end.column=p,c=h,h=p,p=l+1<f?u.getScreenLastRowColumn(l+1):l==f?0:n.end.column,d=i+(l==a?" ace_start":"")+" ace_br"+e(l==a||l==a+1&&n.start.column,c<h,h>p,l==f),this.session.$bidiHandler.isBidiRow(l)?this.drawBidiSingleLineMarker(t,v,d,s,l==f?0:1,o):this.drawSingleLineMarker(t,v,d,s,l==f?0:1,o)},this.drawMultiLineMarker=function(e,t,n,r,i){var s=this.$padding,o,u,a;i=i||"";if(this.session.$bidiHandler.isBidiRow(t.start.row)){var f=t.clone();f.end.row=f.start.row,f.end.column=this.session.getLine(f.start.row).length,this.drawBidiSingleLineMarker(e,f,n+" ace_br1 ace_start",r,null,i)}else o=r.lineHeight,u=this.$getTop(t.start.row,r),a=s+t.start.column*r.characterWidth,e.push("<div class='",n," ace_br1 ace_start' style='","height:",o,"px;","right:0;","top:",u,"px;","left:",a,"px;",i,"'></div>");if(this.session.$bidiHandler.isBidiRow(t.end.row)){var f=t.clone();f.start.row=f.end.row,f.start.column=0,this.drawBidiSingleLineMarker(e,f,n+" ace_br12",r,null,i)}else{var l=t.end.column*r.characterWidth;o=r.lineHeight,u=this.$getTop(t.end.row,r),e.push("<div class='",n," ace_br12' style='","height:",o,"px;","width:",l,"px;","top:",u,"px;","left:",s,"px;",i,"'></div>")}o=(t.end.row-t.start.row-1)*r.lineHeight;if(o<=0)return;u=this.$getTop(t.start.row+1,r);var c=(t.start.column?1:0)|(t.end.column?0:8);e.push("<div class='",n,c?" ace_br"+c:"","' style='","height:",o,"px;","right:0;","top:",u,"px;","left:",s,"px;",i,"'></div>")},this.drawSingleLineMarker=function(e,t,n,r,i,s){var o=r.lineHeight,u=(t.end.column+(i||0)-t.start.column)*r.characterWidth,a=this.$getTop(t.start.row,r),f=this.$padding+t.start.column*r.characterWidth;e.push("<div class='",n,"' style='","height:",o,"px;","width:",u,"px;","top:",a,"px;","left:",f,"px;",s||"","'></div>")},this.drawBidiSingleLineMarker=function(e,t,n,r,i,s){var o=r.lineHeight,u=this.$getTop(t.start.row,r),a=this.$padding,f=this.session.$bidiHandler.getSelections(t.start.column,t.end.column);f.forEach(function(t){e.push("<div class='",n,"' style='","height:",o,"px;","width:",t.width+(i||0),"px;","top:",u,"px;","left:",a+t.left,"px;",s||"","'></div>")})},this.drawFullLineMarker=function(e,t,n,r,i){var s=this.$getTop(t.start.row,r),o=r.lineHeight;t.start.row!=t.end.row&&(o+=this.$getTop(t.end.row,r)-s),e.push("<div class='",n,"' style='","height:",o,"px;","top:",s,"px;","left:0;right:0;",i||"","'></div>")},this.drawScreenLineMarker=function(e,t,n,r,i){var s=this.$getTop(t.start.row,r),o=r.lineHeight;e.push("<div class='",n,"' style='","height:",o,"px;","top:",s,"px;","left:0;right:0;",i||"","'></div>")}}).call(s.prototype),t.Marker=s}),define("ace/layer/text",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/lib/lang","ace/lib/useragent","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("../lib/dom"),s=e("../lib/lang"),o=e("../lib/useragent"),u=e("../lib/event_emitter").EventEmitter,a=function(e){this.element=i.createElement("div"),this.element.className="ace_layer ace_text-layer",e.appendChild(this.element),this.$updateEolChar=this.$updateEolChar.bind(this)};(function(){r.implement(this,u),this.EOF_CHAR="\u00b6",this.EOL_CHAR_LF="\u00ac",this.EOL_CHAR_CRLF="\u00a4",this.EOL_CHAR=this.EOL_CHAR_LF,this.TAB_CHAR="\u2014",this.SPACE_CHAR="\u00b7",this.$padding=0,this.$updateEolChar=function(){var e=this.session.doc.getNewLineCharacter()=="\n"?this.EOL_CHAR_LF:this.EOL_CHAR_CRLF;if(this.EOL_CHAR!=e)return this.EOL_CHAR=e,!0},this.setPadding=function(e){this.$padding=e,this.element.style.padding="0 "+e+"px"},this.getLineHeight=function(){return this.$fontMetrics.$characterSize.height||0},this.getCharacterWidth=function(){return this.$fontMetrics.$characterSize.width||0},this.$setFontMetrics=function(e){this.$fontMetrics=e,this.$fontMetrics.on("changeCharacterSize",function(e){this._signal("changeCharacterSize",e)}.bind(this)),this.$pollSizeChanges()},this.checkForSizeChanges=function(){this.$fontMetrics.checkForSizeChanges()},this.$pollSizeChanges=function(){return this.$pollSizeChangesTimer=this.$fontMetrics.$pollSizeChanges()},this.setSession=function(e){this.session=e,e&&this.$computeTabString()},this.showInvisibles=!1,this.setShowInvisibles=function(e){return this.showInvisibles==e?!1:(this.showInvisibles=e,this.$computeTabString(),!0)},this.displayIndentGuides=!0,this.setDisplayIndentGuides=function(e){return this.displayIndentGuides==e?!1:(this.displayIndentGuides=e,this.$computeTabString(),!0)},this.$tabStrings=[],this.onChangeTabSize=this.$computeTabString=function(){var e=this.session.getTabSize();this.tabSize=e;var t=this.$tabStrings=[0];for(var n=1;n<e+1;n++)this.showInvisibles?t.push("<span class='ace_invisible ace_invisible_tab'>"+s.stringRepeat(this.TAB_CHAR,n)+"</span>"):t.push(s.stringRepeat(" ",n));if(this.displayIndentGuides){this.$indentGuideRe=/\s\S| \t|\t |\s$/;var r="ace_indent-guide",i="",o="";if(this.showInvisibles){r+=" ace_invisible",i=" ace_invisible_space",o=" ace_invisible_tab";var u=s.stringRepeat(this.SPACE_CHAR,this.tabSize),a=s.stringRepeat(this.TAB_CHAR,this.tabSize)}else var u=s.stringRepeat(" ",this.tabSize),a=u;this.$tabStrings[" "]="<span class='"+r+i+"'>"+u+"</span>",this.$tabStrings["	"]="<span class='"+r+o+"'>"+a+"</span>"}},this.updateLines=function(e,t,n){(this.config.lastRow!=e.lastRow||this.config.firstRow!=e.firstRow)&&this.scrollLines(e),this.config=e;var r=Math.max(t,e.firstRow),i=Math.min(n,e.lastRow),s=this.element.childNodes,o=0;for(var u=e.firstRow;u<r;u++){var a=this.session.getFoldLine(u);if(a){if(a.containsRow(r)){r=a.start.row;break}u=a.end.row}o++}var u=r,a=this.session.getNextFoldLine(u),f=a?a.start.row:Infinity;for(;;){u>f&&(u=a.end.row+1,a=this.session.getNextFoldLine(u,a),f=a?a.start.row:Infinity);if(u>i)break;var l=s[o++];if(l){var c=[];this.$renderLine(c,u,!this.$useLineGroups(),u==f?a:!1),l.style.height=e.lineHeight*this.session.getRowLength(u)+"px",l.innerHTML=c.join("")}u++}},this.scrollLines=function(e){var t=this.config;this.config=e;if(!t||t.lastRow<e.firstRow)return this.update(e);if(e.lastRow<t.firstRow)return this.update(e);var n=this.element;if(t.firstRow<e.firstRow)for(var r=this.session.getFoldedRowCount(t.firstRow,e.firstRow-1);r>0;r--)n.removeChild(n.firstChild);if(t.lastRow>e.lastRow)for(var r=this.session.getFoldedRowCount(e.lastRow+1,t.lastRow);r>0;r--)n.removeChild(n.lastChild);if(e.firstRow<t.firstRow){var i=this.$renderLinesFragment(e,e.firstRow,t.firstRow-1);n.firstChild?n.insertBefore(i,n.firstChild):n.appendChild(i)}if(e.lastRow>t.lastRow){var i=this.$renderLinesFragment(e,t.lastRow+1,e.lastRow);n.appendChild(i)}},this.$renderLinesFragment=function(e,t,n){var r=this.element.ownerDocument.createDocumentFragment(),s=t,o=this.session.getNextFoldLine(s),u=o?o.start.row:Infinity;for(;;){s>u&&(s=o.end.row+1,o=this.session.getNextFoldLine(s,o),u=o?o.start.row:Infinity);if(s>n)break;var a=i.createElement("div"),f=[];this.$renderLine(f,s,!1,s==u?o:!1),a.innerHTML=f.join("");if(this.$useLineGroups())a.className="ace_line_group",r.appendChild(a),a.style.height=e.lineHeight*this.session.getRowLength(s)+"px";else while(a.firstChild)r.appendChild(a.firstChild);s++}return r},this.update=function(e){this.config=e;var t=[],n=e.firstRow,r=e.lastRow,i=n,s=this.session.getNextFoldLine(i),o=s?s.start.row:Infinity;for(;;){i>o&&(i=s.end.row+1,s=this.session.getNextFoldLine(i,s),o=s?s.start.row:Infinity);if(i>r)break;this.$useLineGroups()&&t.push("<div class='ace_line_group' style='height:",e.lineHeight*this.session.getRowLength(i),"px'>"),this.$renderLine(t,i,!1,i==o?s:!1),this.$useLineGroups()&&t.push("</div>"),i++}this.element.innerHTML=t.join("")},this.$textToken={text:!0,rparen:!0,lparen:!0},this.$renderToken=function(e,t,n,r){var i=this,o=/\t|&|<|>|( +)|([\x00-\x1f\x80-\xa0\xad\u1680\u180E\u2000-\u200f\u2028\u2029\u202F\u205F\u3000\uFEFF\uFFF9-\uFFFC])|[\u1100-\u115F\u11A3-\u11A7\u11FA-\u11FF\u2329-\u232A\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3000-\u303E\u3041-\u3096\u3099-\u30FF\u3105-\u312D\u3131-\u318E\u3190-\u31BA\u31C0-\u31E3\u31F0-\u321E\u3220-\u3247\u3250-\u32FE\u3300-\u4DBF\u4E00-\uA48C\uA490-\uA4C6\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE66\uFE68-\uFE6B\uFF01-\uFF60\uFFE0-\uFFE6]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,u=function(e,n,r,o,u){if(n)return i.showInvisibles?"<span class='ace_invisible ace_invisible_space'>"+s.stringRepeat(i.SPACE_CHAR,e.length)+"</span>":e;if(e=="&")return"&#38;";if(e=="<")return"&#60;";if(e==">")return"&#62;";if(e=="	"){var a=i.session.getScreenTabSize(t+o);return t+=a-1,i.$tabStrings[a]}if(e=="\u3000"){var f=i.showInvisibles?"ace_cjk ace_invisible ace_invisible_space":"ace_cjk",l=i.showInvisibles?i.SPACE_CHAR:"";return t+=1,"<span class='"+f+"' style='width:"+i.config.characterWidth*2+"px'>"+l+"</span>"}return r?"<span class='ace_invisible ace_invisible_space ace_invalid'>"+i.SPACE_CHAR+"</span>":(t+=1,"<span class='ace_cjk' style='width:"+i.config.characterWidth*2+"px'>"+e+"</span>")},a=r.replace(o,u);if(!this.$textToken[n.type]){var f="ace_"+n.type.replace(/\./g," ace_"),l="";n.type=="fold"&&(l=" style='width:"+n.value.length*this.config.characterWidth+"px;' "),e.push("<span class='",f,"'",l,">",a,"</span>")}else e.push(a);return t+r.length},this.renderIndentGuide=function(e,t,n){var r=t.search(this.$indentGuideRe);return r<=0||r>=n?t:t[0]==" "?(r-=r%this.tabSize,e.push(s.stringRepeat(this.$tabStrings[" "],r/this.tabSize)),t.substr(r)):t[0]=="	"?(e.push(s.stringRepeat(this.$tabStrings["	"],r)),t.substr(r)):t},this.$renderWrappedLine=function(e,t,n,r){var i=0,o=0,u=n[0],a=0;for(var f=0;f<t.length;f++){var l=t[f],c=l.value;if(f==0&&this.displayIndentGuides){i=c.length,c=this.renderIndentGuide(e,c,u);if(!c)continue;i-=c.length}if(i+c.length<u)a=this.$renderToken(e,a,l,c),i+=c.length;else{while(i+c.length>=u)a=this.$renderToken(e,a,l,c.substring(0,u-i)),c=c.substring(u-i),i=u,r||e.push("</div>","<div class='ace_line' style='height:",this.config.lineHeight,"px'>"),e.push(s.stringRepeat("\u00a0",n.indent)),o++,a=0,u=n[o]||Number.MAX_VALUE;c.length!=0&&(i+=c.length,a=this.$renderToken(e,a,l,c))}}},this.$renderSimpleLine=function(e,t){var n=0,r=t[0],i=r.value;this.displayIndentGuides&&(i=this.renderIndentGuide(e,i)),i&&(n=this.$renderToken(e,n,r,i));for(var s=1;s<t.length;s++)r=t[s],i=r.value,n=this.$renderToken(e,n,r,i)},this.$renderLine=function(e,t,n,r){!r&&r!=0&&(r=this.session.getFoldLine(t));if(r)var i=this.$getFoldLineTokens(t,r);else var i=this.session.getTokens(t);n||e.push("<div class='ace_line' style='height:",this.config.lineHeight*(this.$useLineGroups()?1:this.session.getRowLength(t)),"px'>");if(i.length){var s=this.session.getRowSplitData(t);s&&s.length?this.$renderWrappedLine(e,i,s,n):this.$renderSimpleLine(e,i)}this.showInvisibles&&(r&&(t=r.end.row),e.push("<span class='ace_invisible ace_invisible_eol'>",t==this.session.getLength()-1?this.EOF_CHAR:this.EOL_CHAR,"</span>")),n||e.push("</div>")},this.$getFoldLineTokens=function(e,t){function i(e,t,n){var i=0,s=0;while(s+e[i].value.length<t){s+=e[i].value.length,i++;if(i==e.length)return}if(s!=t){var o=e[i].value.substring(t-s);o.length>n-t&&(o=o.substring(0,n-t)),r.push({type:e[i].type,value:o}),s=t+o.length,i+=1}while(s<n&&i<e.length){var o=e[i].value;o.length+s>n?r.push({type:e[i].type,value:o.substring(0,n-s)}):r.push(e[i]),s+=o.length,i+=1}}var n=this.session,r=[],s=n.getTokens(e);return t.walk(function(e,t,o,u,a){e!=null?r.push({type:"fold",value:e}):(a&&(s=n.getTokens(t)),s.length&&i(s,u,o))},t.end.row,this.session.getLine(t.end.row).length),r},this.$useLineGroups=function(){return this.session.getUseWrapMode()},this.destroy=function(){clearInterval(this.$pollSizeChangesTimer),this.$measureNode&&this.$measureNode.parentNode.removeChild(this.$measureNode),delete this.$measureNode}}).call(a.prototype),t.Text=a}),define("ace/layer/cursor",["require","exports","module","ace/lib/dom"],function(e,t,n){"use strict";var r=e("../lib/dom"),i,s=function(e){this.element=r.createElement("div"),this.element.className="ace_layer ace_cursor-layer",e.appendChild(this.element),i===undefined&&(i=!("opacity"in this.element.style)),this.isVisible=!1,this.isBlinking=!0,this.blinkInterval=1e3,this.smoothBlinking=!1,this.cursors=[],this.cursor=this.addCursor(),r.addCssClass(this.element,"ace_hidden-cursors"),this.$updateCursors=(i?this.$updateVisibility:this.$updateOpacity).bind(this)};(function(){this.$updateVisibility=function(e){var t=this.cursors;for(var n=t.length;n--;)t[n].style.visibility=e?"":"hidden"},this.$updateOpacity=function(e){var t=this.cursors;for(var n=t.length;n--;)t[n].style.opacity=e?"":"0"},this.$padding=0,this.setPadding=function(e){this.$padding=e},this.setSession=function(e){this.session=e},this.setBlinking=function(e){e!=this.isBlinking&&(this.isBlinking=e,this.restartTimer())},this.setBlinkInterval=function(e){e!=this.blinkInterval&&(this.blinkInterval=e,this.restartTimer())},this.setSmoothBlinking=function(e){e!=this.smoothBlinking&&!i&&(this.smoothBlinking=e,r.setCssClass(this.element,"ace_smooth-blinking",e),this.$updateCursors(!0),this.$updateCursors=this.$updateOpacity.bind(this),this.restartTimer())},this.addCursor=function(){var e=r.createElement("div");return e.className="ace_cursor",this.element.appendChild(e),this.cursors.push(e),e},this.removeCursor=function(){if(this.cursors.length>1){var e=this.cursors.pop();return e.parentNode.removeChild(e),e}},this.hideCursor=function(){this.isVisible=!1,r.addCssClass(this.element,"ace_hidden-cursors"),this.restartTimer()},this.showCursor=function(){this.isVisible=!0,r.removeCssClass(this.element,"ace_hidden-cursors"),this.restartTimer()},this.restartTimer=function(){var e=this.$updateCursors;clearInterval(this.intervalId),clearTimeout(this.timeoutId),this.smoothBlinking&&r.removeCssClass(this.element,"ace_smooth-blinking"),e(!0);if(!this.isBlinking||!this.blinkInterval||!this.isVisible)return;this.smoothBlinking&&setTimeout(function(){r.addCssClass(this.element,"ace_smooth-blinking")}.bind(this));var t=function(){this.timeoutId=setTimeout(function(){e(!1)},.6*this.blinkInterval)}.bind(this);this.intervalId=setInterval(function(){e(!0),t()},this.blinkInterval),t()},this.getPixelPosition=function(e,t){if(!this.config||!this.session)return{left:0,top:0};e||(e=this.session.selection.getCursor());var n=this.session.documentToScreenPosition(e),r=this.$padding+(this.session.$bidiHandler.isBidiRow(n.row,e.row)?this.session.$bidiHandler.getPosLeft(n.column):n.column*this.config.characterWidth),i=(n.row-(t?this.config.firstRowScreen:0))*this.config.lineHeight;return{left:r,top:i}},this.update=function(e){this.config=e;var t=this.session.$selectionMarkers,n=0,r=0;if(t===undefined||t.length===0)t=[{cursor:null}];for(var n=0,i=t.length;n<i;n++){var s=this.getPixelPosition(t[n].cursor,!0);if((s.top>e.height+e.offset||s.top<0)&&n>1)continue;var o=(this.cursors[r++]||this.addCursor()).style;this.drawCursor?this.drawCursor(o,s,e,t[n],this.session):(o.left=s.left+"px",o.top=s.top+"px",o.width=e.characterWidth+"px",o.height=e.lineHeight+"px")}while(this.cursors.length>r)this.removeCursor();var u=this.session.getOverwrite();this.$setOverwrite(u),this.$pixelPos=s,this.restartTimer()},this.drawCursor=null,this.$setOverwrite=function(e){e!=this.overwrite&&(this.overwrite=e,e?r.addCssClass(this.element,"ace_overwrite-cursors"):r.removeCssClass(this.element,"ace_overwrite-cursors"))},this.destroy=function(){clearInterval(this.intervalId),clearTimeout(this.timeoutId)}}).call(s.prototype),t.Cursor=s}),define("ace/scrollbar",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/lib/event","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./lib/event"),o=e("./lib/event_emitter").EventEmitter,u=32768,a=function(e){this.element=i.createElement("div"),this.element.className="ace_scrollbar ace_scrollbar"+this.classSuffix,this.inner=i.createElement("div"),this.inner.className="ace_scrollbar-inner",this.element.appendChild(this.inner),e.appendChild(this.element),this.setVisible(!1),this.skipEvent=!1,s.addListener(this.element,"scroll",this.onScroll.bind(this)),s.addListener(this.element,"mousedown",s.preventDefault)};(function(){r.implement(this,o),this.setVisible=function(e){this.element.style.display=e?"":"none",this.isVisible=e,this.coeff=1}}).call(a.prototype);var f=function(e,t){a.call(this,e),this.scrollTop=0,this.scrollHeight=0,t.$scrollbarWidth=this.width=i.scrollbarWidth(e.ownerDocument),this.inner.style.width=this.element.style.width=(this.width||15)+5+"px",this.$minWidth=0};r.inherits(f,a),function(){this.classSuffix="-v",this.onScroll=function(){if(!this.skipEvent){this.scrollTop=this.element.scrollTop;if(this.coeff!=1){var e=this.element.clientHeight/this.scrollHeight;this.scrollTop=this.scrollTop*(1-e)/(this.coeff-e)}this._emit("scroll",{data:this.scrollTop})}this.skipEvent=!1},this.getWidth=function(){return Math.max(this.isVisible?this.width:0,this.$minWidth||0)},this.setHeight=function(e){this.element.style.height=e+"px"},this.setInnerHeight=this.setScrollHeight=function(e){this.scrollHeight=e,e>u?(this.coeff=u/e,e=u):this.coeff!=1&&(this.coeff=1),this.inner.style.height=e+"px"},this.setScrollTop=function(e){this.scrollTop!=e&&(this.skipEvent=!0,this.scrollTop=e,this.element.scrollTop=e*this.coeff)}}.call(f.prototype);var l=function(e,t){a.call(this,e),this.scrollLeft=0,this.height=t.$scrollbarWidth,this.inner.style.height=this.element.style.height=(this.height||15)+5+"px"};r.inherits(l,a),function(){this.classSuffix="-h",this.onScroll=function(){this.skipEvent||(this.scrollLeft=this.element.scrollLeft,this._emit("scroll",{data:this.scrollLeft})),this.skipEvent=!1},this.getHeight=function(){return this.isVisible?this.height:0},this.setWidth=function(e){this.element.style.width=e+"px"},this.setInnerWidth=function(e){this.inner.style.width=e+"px"},this.setScrollWidth=function(e){this.inner.style.width=e+"px"},this.setScrollLeft=function(e){this.scrollLeft!=e&&(this.skipEvent=!0,this.scrollLeft=this.element.scrollLeft=e)}}.call(l.prototype),t.ScrollBar=f,t.ScrollBarV=f,t.ScrollBarH=l,t.VScrollBar=f,t.HScrollBar=l}),define("ace/renderloop",["require","exports","module","ace/lib/event"],function(e,t,n){"use strict";var r=e("./lib/event"),i=function(e,t){this.onRender=e,this.pending=!1,this.changes=0,this.window=t||window};(function(){this.schedule=function(e){this.changes=this.changes|e;if(!this.pending&&this.changes){this.pending=!0;var t=this;r.nextFrame(function(){t.pending=!1;var e;while(e=t.changes)t.changes=0,t.onRender(e)},this.window)}}}).call(i.prototype),t.RenderLoop=i}),define("ace/layer/font_metrics",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/lib/lang","ace/lib/useragent","ace/lib/event_emitter"],function(e,t,n){var r=e("../lib/oop"),i=e("../lib/dom"),s=e("../lib/lang"),o=e("../lib/useragent"),u=e("../lib/event_emitter").EventEmitter,a=0,f=t.FontMetrics=function(e){this.el=i.createElement("div"),this.$setMeasureNodeStyles(this.el.style,!0),this.$main=i.createElement("div"),this.$setMeasureNodeStyles(this.$main.style),this.$measureNode=i.createElement("div"),this.$setMeasureNodeStyles(this.$measureNode.style),this.el.appendChild(this.$main),this.el.appendChild(this.$measureNode),e.appendChild(this.el),a||this.$testFractionalRect(),this.$measureNode.innerHTML=s.stringRepeat("X",a),this.$characterSize={width:0,height:0},this.checkForSizeChanges()};(function(){r.implement(this,u),this.$characterSize={width:0,height:0},this.$testFractionalRect=function(){var e=i.createElement("div");this.$setMeasureNodeStyles(e.style),e.style.width="0.2px",document.documentElement.appendChild(e);var t=e.getBoundingClientRect().width;t>0&&t<1?a=50:a=100,e.parentNode.removeChild(e)},this.$setMeasureNodeStyles=function(e,t){e.width=e.height="auto",e.left=e.top="0px",e.visibility="hidden",e.position="absolute",e.whiteSpace="pre",o.isIE<8?e["font-family"]="inherit":e.font="inherit",e.overflow=t?"hidden":"visible"},this.checkForSizeChanges=function(){var e=this.$measureSizes();if(e&&(this.$characterSize.width!==e.width||this.$characterSize.height!==e.height)){this.$measureNode.style.fontWeight="bold";var t=this.$measureSizes();this.$measureNode.style.fontWeight="",this.$characterSize=e,this.charSizes=Object.create(null),this.allowBoldFonts=t&&t.width===e.width&&t.height===e.height,this._emit("changeCharacterSize",{data:e})}},this.$pollSizeChanges=function(){if(this.$pollSizeChangesTimer)return this.$pollSizeChangesTimer;var e=this;return this.$pollSizeChangesTimer=setInterval(function(){e.checkForSizeChanges()},500)},this.setPolling=function(e){e?this.$pollSizeChanges():this.$pollSizeChangesTimer&&(clearInterval(this.$pollSizeChangesTimer),this.$pollSizeChangesTimer=0)},this.$measureSizes=function(){if(a===50){var e=null;try{e=this.$measureNode.getBoundingClientRect()}catch(t){e={width:0,height:0}}var n={height:e.height,width:e.width/a}}else var n={height:this.$measureNode.clientHeight,width:this.$measureNode.clientWidth/a};return n.width===0||n.height===0?null:n},this.$measureCharWidth=function(e){this.$main.innerHTML=s.stringRepeat(e,a);var t=this.$main.getBoundingClientRect();return t.width/a},this.getCharacterWidth=function(e){var t=this.charSizes[e];return t===undefined&&(t=this.charSizes[e]=this.$measureCharWidth(e)/this.$characterSize.width),t},this.destroy=function(){clearInterval(this.$pollSizeChangesTimer),this.el&&this.el.parentNode&&this.el.parentNode.removeChild(this.el)}}).call(f.prototype)}),define("ace/virtual_renderer",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/config","ace/lib/useragent","ace/layer/gutter","ace/layer/marker","ace/layer/text","ace/layer/cursor","ace/scrollbar","ace/scrollbar","ace/renderloop","ace/layer/font_metrics","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./config"),o=e("./lib/useragent"),u=e("./layer/gutter").Gutter,a=e("./layer/marker").Marker,f=e("./layer/text").Text,l=e("./layer/cursor").Cursor,c=e("./scrollbar").HScrollBar,h=e("./scrollbar").VScrollBar,p=e("./renderloop").RenderLoop,d=e("./layer/font_metrics").FontMetrics,v=e("./lib/event_emitter").EventEmitter,m='.ace_editor {position: relative;overflow: hidden;font: 12px/normal \'Monaco\', \'Menlo\', \'Ubuntu Mono\', \'Consolas\', \'source-code-pro\', monospace;direction: ltr;text-align: left;-webkit-tap-highlight-color: rgba(0, 0, 0, 0);}.ace_scroller {position: absolute;overflow: hidden;top: 0;bottom: 0;background-color: inherit;-ms-user-select: none;-moz-user-select: none;-webkit-user-select: none;user-select: none;cursor: text;}.ace_content {position: absolute;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;min-width: 100%;}.ace_dragging .ace_scroller:before{position: absolute;top: 0;left: 0;right: 0;bottom: 0;content: \'\';background: rgba(250, 250, 250, 0.01);z-index: 1000;}.ace_dragging.ace_dark .ace_scroller:before{background: rgba(0, 0, 0, 0.01);}.ace_selecting, .ace_selecting * {cursor: text !important;}.ace_gutter {position: absolute;overflow : hidden;width: auto;top: 0;bottom: 0;left: 0;cursor: default;z-index: 4;-ms-user-select: none;-moz-user-select: none;-webkit-user-select: none;user-select: none;}.ace_gutter-active-line {position: absolute;left: 0;right: 0;}.ace_scroller.ace_scroll-left {box-shadow: 17px 0 16px -16px rgba(0, 0, 0, 0.4) inset;}.ace_gutter-cell {padding-left: 19px;padding-right: 6px;background-repeat: no-repeat;}.ace_gutter-cell.ace_error {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABOFBMVEX/////////QRswFAb/Ui4wFAYwFAYwFAaWGAfDRymzOSH/PxswFAb/SiUwFAYwFAbUPRvjQiDllog5HhHdRybsTi3/Tyv9Tir+Syj/UC3////XurebMBIwFAb/RSHbPx/gUzfdwL3kzMivKBAwFAbbvbnhPx66NhowFAYwFAaZJg8wFAaxKBDZurf/RB6mMxb/SCMwFAYwFAbxQB3+RB4wFAb/Qhy4Oh+4QifbNRcwFAYwFAYwFAb/QRzdNhgwFAYwFAbav7v/Uy7oaE68MBK5LxLewr/r2NXewLswFAaxJw4wFAbkPRy2PyYwFAaxKhLm1tMwFAazPiQwFAaUGAb/QBrfOx3bvrv/VC/maE4wFAbRPBq6MRO8Qynew8Dp2tjfwb0wFAbx6eju5+by6uns4uH9/f36+vr/GkHjAAAAYnRSTlMAGt+64rnWu/bo8eAA4InH3+DwoN7j4eLi4xP99Nfg4+b+/u9B/eDs1MD1mO7+4PHg2MXa347g7vDizMLN4eG+Pv7i5evs/v79yu7S3/DV7/498Yv24eH+4ufQ3Ozu/v7+y13sRqwAAADLSURBVHjaZc/XDsFgGIBhtDrshlitmk2IrbHFqL2pvXf/+78DPokj7+Fz9qpU/9UXJIlhmPaTaQ6QPaz0mm+5gwkgovcV6GZzd5JtCQwgsxoHOvJO15kleRLAnMgHFIESUEPmawB9ngmelTtipwwfASilxOLyiV5UVUyVAfbG0cCPHig+GBkzAENHS0AstVF6bacZIOzgLmxsHbt2OecNgJC83JERmePUYq8ARGkJx6XtFsdddBQgZE2nPR6CICZhawjA4Fb/chv+399kfR+MMMDGOQAAAABJRU5ErkJggg==");background-repeat: no-repeat;background-position: 2px center;}.ace_gutter-cell.ace_warning {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAmVBMVEX///8AAAD///8AAAAAAABPSzb/5sAAAAB/blH/73z/ulkAAAAAAAD85pkAAAAAAAACAgP/vGz/rkDerGbGrV7/pkQICAf////e0IsAAAD/oED/qTvhrnUAAAD/yHD/njcAAADuv2r/nz//oTj/p064oGf/zHAAAAA9Nir/tFIAAAD/tlTiuWf/tkIAAACynXEAAAAAAAAtIRW7zBpBAAAAM3RSTlMAABR1m7RXO8Ln31Z36zT+neXe5OzooRDfn+TZ4p3h2hTf4t3k3ucyrN1K5+Xaks52Sfs9CXgrAAAAjklEQVR42o3PbQ+CIBQFYEwboPhSYgoYunIqqLn6/z8uYdH8Vmdnu9vz4WwXgN/xTPRD2+sgOcZjsge/whXZgUaYYvT8QnuJaUrjrHUQreGczuEafQCO/SJTufTbroWsPgsllVhq3wJEk2jUSzX3CUEDJC84707djRc5MTAQxoLgupWRwW6UB5fS++NV8AbOZgnsC7BpEAAAAABJRU5ErkJggg==");background-position: 2px center;}.ace_gutter-cell.ace_info {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAJ0Uk5TAAB2k804AAAAPklEQVQY02NgIB68QuO3tiLznjAwpKTgNyDbMegwisCHZUETUZV0ZqOquBpXj2rtnpSJT1AEnnRmL2OgGgAAIKkRQap2htgAAAAASUVORK5CYII=");background-position: 2px center;}.ace_dark .ace_gutter-cell.ace_info {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAJFBMVEUAAAChoaGAgIAqKiq+vr6tra1ZWVmUlJSbm5s8PDxubm56enrdgzg3AAAAAXRSTlMAQObYZgAAAClJREFUeNpjYMAPdsMYHegyJZFQBlsUlMFVCWUYKkAZMxZAGdxlDMQBAG+TBP4B6RyJAAAAAElFTkSuQmCC");}.ace_scrollbar {position: absolute;right: 0;bottom: 0;z-index: 6;}.ace_scrollbar-inner {position: absolute;cursor: text;left: 0;top: 0;}.ace_scrollbar-v{overflow-x: hidden;overflow-y: scroll;top: 0;}.ace_scrollbar-h {overflow-x: scroll;overflow-y: hidden;left: 0;}.ace_print-margin {position: absolute;height: 100%;}.ace_text-input {position: absolute;z-index: 0;width: 0.5em;height: 1em;opacity: 0;background: transparent;-moz-appearance: none;appearance: none;border: none;resize: none;outline: none;overflow: hidden;font: inherit;padding: 0 1px;margin: 0 -1px;text-indent: -1em;-ms-user-select: text;-moz-user-select: text;-webkit-user-select: text;user-select: text;white-space: pre!important;}.ace_text-input.ace_composition {background: inherit;color: inherit;z-index: 1000;opacity: 1;text-indent: 0;}.ace_layer {z-index: 1;position: absolute;overflow: hidden;word-wrap: normal;white-space: pre;height: 100%;width: 100%;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;pointer-events: none;}.ace_gutter-layer {position: relative;width: auto;text-align: right;pointer-events: auto;}.ace_text-layer {font: inherit !important;}.ace_cjk {display: inline-block;text-align: center;}.ace_cursor-layer {z-index: 4;}.ace_cursor {z-index: 4;position: absolute;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;border-left: 2px solid;transform: translatez(0);}.ace_multiselect .ace_cursor {border-left-width: 1px;}.ace_slim-cursors .ace_cursor {border-left-width: 1px;}.ace_overwrite-cursors .ace_cursor {border-left-width: 0;border-bottom: 1px solid;}.ace_hidden-cursors .ace_cursor {opacity: 0.2;}.ace_smooth-blinking .ace_cursor {-webkit-transition: opacity 0.18s;transition: opacity 0.18s;}.ace_marker-layer .ace_step, .ace_marker-layer .ace_stack {position: absolute;z-index: 3;}.ace_marker-layer .ace_selection {position: absolute;z-index: 5;}.ace_marker-layer .ace_bracket {position: absolute;z-index: 6;}.ace_marker-layer .ace_active-line {position: absolute;z-index: 2;}.ace_marker-layer .ace_selected-word {position: absolute;z-index: 4;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;}.ace_line .ace_fold {-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;display: inline-block;height: 11px;margin-top: -2px;vertical-align: middle;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAJCAYAAADU6McMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJpJREFUeNpi/P//PwOlgAXGYGRklAVSokD8GmjwY1wasKljQpYACtpCFeADcHVQfQyMQAwzwAZI3wJKvCLkfKBaMSClBlR7BOQikCFGQEErIH0VqkabiGCAqwUadAzZJRxQr/0gwiXIal8zQQPnNVTgJ1TdawL0T5gBIP1MUJNhBv2HKoQHHjqNrA4WO4zY0glyNKLT2KIfIMAAQsdgGiXvgnYAAAAASUVORK5CYII="),url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAA3CAYAAADNNiA5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACJJREFUeNpi+P//fxgTAwPDBxDxD078RSX+YeEyDFMCIMAAI3INmXiwf2YAAAAASUVORK5CYII=");background-repeat: no-repeat, repeat-x;background-position: center center, top left;color: transparent;border: 1px solid black;border-radius: 2px;cursor: pointer;pointer-events: auto;}.ace_dark .ace_fold {}.ace_fold:hover{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAJCAYAAADU6McMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJpJREFUeNpi/P//PwOlgAXGYGRklAVSokD8GmjwY1wasKljQpYACtpCFeADcHVQfQyMQAwzwAZI3wJKvCLkfKBaMSClBlR7BOQikCFGQEErIH0VqkabiGCAqwUadAzZJRxQr/0gwiXIal8zQQPnNVTgJ1TdawL0T5gBIP1MUJNhBv2HKoQHHjqNrA4WO4zY0glyNKLT2KIfIMAAQsdgGiXvgnYAAAAASUVORK5CYII="),url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAA3CAYAAADNNiA5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACBJREFUeNpi+P//fz4TAwPDZxDxD5X4i5fLMEwJgAADAEPVDbjNw87ZAAAAAElFTkSuQmCC");}.ace_tooltip {background-color: #FFF;background-image: -webkit-linear-gradient(top, transparent, rgba(0, 0, 0, 0.1));background-image: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1));border: 1px solid gray;border-radius: 1px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);color: black;max-width: 100%;padding: 3px 4px;position: fixed;z-index: 999999;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;cursor: default;white-space: pre;word-wrap: break-word;line-height: normal;font-style: normal;font-weight: normal;letter-spacing: normal;pointer-events: none;}.ace_folding-enabled > .ace_gutter-cell {padding-right: 13px;}.ace_fold-widget {-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;margin: 0 -12px 0 1px;display: none;width: 11px;vertical-align: top;background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAANElEQVR42mWKsQ0AMAzC8ixLlrzQjzmBiEjp0A6WwBCSPgKAXoLkqSot7nN3yMwR7pZ32NzpKkVoDBUxKAAAAABJRU5ErkJggg==");background-repeat: no-repeat;background-position: center;border-radius: 3px;border: 1px solid transparent;cursor: pointer;}.ace_folding-enabled .ace_fold-widget {display: inline-block;   }.ace_fold-widget.ace_end {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAANElEQVR42m3HwQkAMAhD0YzsRchFKI7sAikeWkrxwScEB0nh5e7KTPWimZki4tYfVbX+MNl4pyZXejUO1QAAAABJRU5ErkJggg==");}.ace_fold-widget.ace_closed {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAGCAYAAAAG5SQMAAAAOUlEQVR42jXKwQkAMAgDwKwqKD4EwQ26sSOkVWjgIIHAzPiCgaqiqnJHZnKICBERHN194O5b9vbLuAVRL+l0YWnZAAAAAElFTkSuQmCCXA==");}.ace_fold-widget:hover {border: 1px solid rgba(0, 0, 0, 0.3);background-color: rgba(255, 255, 255, 0.2);box-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);}.ace_fold-widget:active {border: 1px solid rgba(0, 0, 0, 0.4);background-color: rgba(0, 0, 0, 0.05);box-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);}.ace_dark .ace_fold-widget {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHklEQVQIW2P4//8/AzoGEQ7oGCaLLAhWiSwB146BAQCSTPYocqT0AAAAAElFTkSuQmCC");}.ace_dark .ace_fold-widget.ace_end {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAH0lEQVQIW2P4//8/AxQ7wNjIAjDMgC4AxjCVKBirIAAF0kz2rlhxpAAAAABJRU5ErkJggg==");}.ace_dark .ace_fold-widget.ace_closed {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAFCAYAAACAcVaiAAAAHElEQVQIW2P4//+/AxAzgDADlOOAznHAKgPWAwARji8UIDTfQQAAAABJRU5ErkJggg==");}.ace_dark .ace_fold-widget:hover {box-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);background-color: rgba(255, 255, 255, 0.1);}.ace_dark .ace_fold-widget:active {box-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);}.ace_fold-widget.ace_invalid {background-color: #FFB4B4;border-color: #DE5555;}.ace_fade-fold-widgets .ace_fold-widget {-webkit-transition: opacity 0.4s ease 0.05s;transition: opacity 0.4s ease 0.05s;opacity: 0;}.ace_fade-fold-widgets:hover .ace_fold-widget {-webkit-transition: opacity 0.05s ease 0.05s;transition: opacity 0.05s ease 0.05s;opacity:1;}.ace_underline {text-decoration: underline;}.ace_bold {font-weight: bold;}.ace_nobold .ace_bold {font-weight: normal;}.ace_italic {font-style: italic;}.ace_error-marker {background-color: rgba(255, 0, 0,0.2);position: absolute;z-index: 9;}.ace_highlight-marker {background-color: rgba(255, 255, 0,0.2);position: absolute;z-index: 8;}.ace_br1 {border-top-left-radius    : 3px;}.ace_br2 {border-top-right-radius   : 3px;}.ace_br3 {border-top-left-radius    : 3px; border-top-right-radius:    3px;}.ace_br4 {border-bottom-right-radius: 3px;}.ace_br5 {border-top-left-radius    : 3px; border-bottom-right-radius: 3px;}.ace_br6 {border-top-right-radius   : 3px; border-bottom-right-radius: 3px;}.ace_br7 {border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-right-radius: 3px;}.ace_br8 {border-bottom-left-radius : 3px;}.ace_br9 {border-top-left-radius    : 3px; border-bottom-left-radius:  3px;}.ace_br10{border-top-right-radius   : 3px; border-bottom-left-radius:  3px;}.ace_br11{border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-left-radius:  3px;}.ace_br12{border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}.ace_br13{border-top-left-radius    : 3px; border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}.ace_br14{border-top-right-radius   : 3px; border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}.ace_br15{border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-right-radius: 3px; border-bottom-left-radius: 3px;}.ace_text-input-ios {position: absolute !important;top: -100000px !important;left: -100000px !important;}';i.importCssString(m,"ace_editor.css");var g=function(e,t){var n=this;this.container=e||i.createElement("div"),this.$keepTextAreaAtCursor=!o.isOldIE,i.addCssClass(this.container,"ace_editor"),this.setTheme(t),this.$gutter=i.createElement("div"),this.$gutter.className="ace_gutter",this.container.appendChild(this.$gutter),this.$gutter.setAttribute("aria-hidden",!0),this.scroller=i.createElement("div"),this.scroller.className="ace_scroller",this.container.appendChild(this.scroller),this.content=i.createElement("div"),this.content.className="ace_content",this.scroller.appendChild(this.content),this.$gutterLayer=new u(this.$gutter),this.$gutterLayer.on("changeGutterWidth",this.onGutterResize.bind(this)),this.$markerBack=new a(this.content);var r=this.$textLayer=new f(this.content);this.canvas=r.element,this.$markerFront=new a(this.content),this.$cursorLayer=new l(this.content),this.$horizScroll=!1,this.$vScroll=!1,this.scrollBar=this.scrollBarV=new h(this.container,this),this.scrollBarH=new c(this.container,this),this.scrollBarV.addEventListener("scroll",function(e){n.$scrollAnimation||n.session.setScrollTop(e.data-n.scrollMargin.top)}),this.scrollBarH.addEventListener("scroll",function(e){n.$scrollAnimation||n.session.setScrollLeft(e.data-n.scrollMargin.left)}),this.scrollTop=0,this.scrollLeft=0,this.cursorPos={row:0,column:0},this.$fontMetrics=new d(this.container),this.$textLayer.$setFontMetrics(this.$fontMetrics),this.$textLayer.addEventListener("changeCharacterSize",function(e){n.updateCharacterSize(),n.onResize(!0,n.gutterWidth,n.$size.width,n.$size.height),n._signal("changeCharacterSize",e)}),this.$size={width:0,height:0,scrollerHeight:0,scrollerWidth:0,$dirty:!0},this.layerConfig={width:1,padding:0,firstRow:0,firstRowScreen:0,lastRow:0,lineHeight:0,characterWidth:0,minHeight:1,maxHeight:1,offset:0,height:1,gutterOffset:1},this.scrollMargin={left:0,right:0,top:0,bottom:0,v:0,h:0},this.$loop=new p(this.$renderChanges.bind(this),this.container.ownerDocument.defaultView),this.$loop.schedule(this.CHANGE_FULL),this.updateCharacterSize(),this.setPadding(4),s.resetOptions(this),s._emit("renderer",this)};(function(){this.CHANGE_CURSOR=1,this.CHANGE_MARKER=2,this.CHANGE_GUTTER=4,this.CHANGE_SCROLL=8,this.CHANGE_LINES=16,this.CHANGE_TEXT=32,this.CHANGE_SIZE=64,this.CHANGE_MARKER_BACK=128,this.CHANGE_MARKER_FRONT=256,this.CHANGE_FULL=512,this.CHANGE_H_SCROLL=1024,r.implement(this,v),this.updateCharacterSize=function(){this.$textLayer.allowBoldFonts!=this.$allowBoldFonts&&(this.$allowBoldFonts=this.$textLayer.allowBoldFonts,this.setStyle("ace_nobold",!this.$allowBoldFonts)),this.layerConfig.characterWidth=this.characterWidth=this.$textLayer.getCharacterWidth(),this.layerConfig.lineHeight=this.lineHeight=this.$textLayer.getLineHeight(),this.$updatePrintMargin()},this.setSession=function(e){this.session&&this.session.doc.off("changeNewLineMode",this.onChangeNewLineMode),this.session=e,e&&this.scrollMargin.top&&e.getScrollTop()<=0&&e.setScrollTop(-this.scrollMargin.top),this.$cursorLayer.setSession(e),this.$markerBack.setSession(e),this.$markerFront.setSession(e),this.$gutterLayer.setSession(e),this.$textLayer.setSession(e);if(!e)return;this.$loop.schedule(this.CHANGE_FULL),this.session.$setFontMetrics(this.$fontMetrics),this.scrollBarH.scrollLeft=this.scrollBarV.scrollTop=null,this.onChangeNewLineMode=this.onChangeNewLineMode.bind(this),this.onChangeNewLineMode(),this.session.doc.on("changeNewLineMode",this.onChangeNewLineMode)},this.updateLines=function(e,t,n){t===undefined&&(t=Infinity),this.$changedLines?(this.$changedLines.firstRow>e&&(this.$changedLines.firstRow=e),this.$changedLines.lastRow<t&&(this.$changedLines.lastRow=t)):this.$changedLines={firstRow:e,lastRow:t};if(this.$changedLines.lastRow<this.layerConfig.firstRow){if(!n)return;this.$changedLines.lastRow=this.layerConfig.lastRow}if(this.$changedLines.firstRow>this.layerConfig.lastRow)return;this.$loop.schedule(this.CHANGE_LINES)},this.onChangeNewLineMode=function(){this.$loop.schedule(this.CHANGE_TEXT),this.$textLayer.$updateEolChar(),this.session.$bidiHandler.setEolChar(this.$textLayer.EOL_CHAR)},this.onChangeTabSize=function(){this.$loop.schedule(this.CHANGE_TEXT|this.CHANGE_MARKER),this.$textLayer.onChangeTabSize()},this.updateText=function(){this.$loop.schedule(this.CHANGE_TEXT)},this.updateFull=function(e){e?this.$renderChanges(this.CHANGE_FULL,!0):this.$loop.schedule(this.CHANGE_FULL)},this.updateFontSize=function(){this.$textLayer.checkForSizeChanges()},this.$changes=0,this.$updateSizeAsync=function(){this.$loop.pending?this.$size.$dirty=!0:this.onResize()},this.onResize=function(e,t,n,r){if(this.resizing>2)return;this.resizing>0?this.resizing++:this.resizing=e?1:0;var i=this.container;r||(r=i.clientHeight||i.scrollHeight),n||(n=i.clientWidth||i.scrollWidth);var s=this.$updateCachedSize(e,t,n,r);if(!this.$size.scrollerHeight||!n&&!r)return this.resizing=0;e&&(this.$gutterLayer.$padding=null),e?this.$renderChanges(s|this.$changes,!0):this.$loop.schedule(s|this.$changes),this.resizing&&(this.resizing=0),this.scrollBarV.scrollLeft=this.scrollBarV.scrollTop=null},this.$updateCachedSize=function(e,t,n,r){r-=this.$extraHeight||0;var i=0,s=this.$size,o={width:s.width,height:s.height,scrollerHeight:s.scrollerHeight,scrollerWidth:s.scrollerWidth};r&&(e||s.height!=r)&&(s.height=r,i|=this.CHANGE_SIZE,s.scrollerHeight=s.height,this.$horizScroll&&(s.scrollerHeight-=this.scrollBarH.getHeight()),this.scrollBarV.element.style.bottom=this.scrollBarH.getHeight()+"px",i|=this.CHANGE_SCROLL);if(n&&(e||s.width!=n)){i|=this.CHANGE_SIZE,s.width=n,t==null&&(t=this.$showGutter?this.$gutter.offsetWidth:0),this.gutterWidth=t,this.scrollBarH.element.style.left=this.scroller.style.left=t+"px",s.scrollerWidth=Math.max(0,n-t-this.scrollBarV.getWidth()),this.scrollBarH.element.style.right=this.scroller.style.right=this.scrollBarV.getWidth()+"px",this.scroller.style.bottom=this.scrollBarH.getHeight()+"px";if(this.session&&this.session.getUseWrapMode()&&this.adjustWrapLimit()||e)i|=this.CHANGE_FULL}return s.$dirty=!n||!r,i&&this._signal("resize",o),i},this.onGutterResize=function(){var e=this.$showGutter?this.$gutter.offsetWidth:0;e!=this.gutterWidth&&(this.$changes|=this.$updateCachedSize(!0,e,this.$size.width,this.$size.height)),this.session.getUseWrapMode()&&this.adjustWrapLimit()?this.$loop.schedule(this.CHANGE_FULL):this.$size.$dirty?this.$loop.schedule(this.CHANGE_FULL):(this.$computeLayerConfig(),this.$loop.schedule(this.CHANGE_MARKER))},this.adjustWrapLimit=function(){var e=this.$size.scrollerWidth-this.$padding*2,t=Math.floor(e/this.characterWidth);return this.session.adjustWrapLimit(t,this.$showPrintMargin&&this.$printMarginColumn)},this.setAnimatedScroll=function(e){this.setOption("animatedScroll",e)},this.getAnimatedScroll=function(){return this.$animatedScroll},this.setShowInvisibles=function(e){this.setOption("showInvisibles",e),this.session.$bidiHandler.setShowInvisibles(e)},this.getShowInvisibles=function(){return this.getOption("showInvisibles")},this.getDisplayIndentGuides=function(){return this.getOption("displayIndentGuides")},this.setDisplayIndentGuides=function(e){this.setOption("displayIndentGuides",e)},this.setShowPrintMargin=function(e){this.setOption("showPrintMargin",e)},this.getShowPrintMargin=function(){return this.getOption("showPrintMargin")},this.setPrintMarginColumn=function(e){this.setOption("printMarginColumn",e)},this.getPrintMarginColumn=function(){return this.getOption("printMarginColumn")},this.getShowGutter=function(){return this.getOption("showGutter")},this.setShowGutter=function(e){return this.setOption("showGutter",e)},this.getFadeFoldWidgets=function(){return this.getOption("fadeFoldWidgets")},this.setFadeFoldWidgets=function(e){this.setOption("fadeFoldWidgets",e)},this.setHighlightGutterLine=function(e){this.setOption("highlightGutterLine",e)},this.getHighlightGutterLine=function(){return this.getOption("highlightGutterLine")},this.$updateGutterLineHighlight=function(){var e=this.$cursorLayer.$pixelPos,t=this.layerConfig.lineHeight;if(this.session.getUseWrapMode()){var n=this.session.selection.getCursor();n.column=0,e=this.$cursorLayer.getPixelPosition(n,!0),t*=this.session.getRowLength(n.row)}this.$gutterLineHighlight.style.top=e.top-this.layerConfig.offset+"px",this.$gutterLineHighlight.style.height=t+"px"},this.$updatePrintMargin=function(){if(!this.$showPrintMargin&&!this.$printMarginEl)return;if(!this.$printMarginEl){var e=i.createElement("div");e.className="ace_layer ace_print-margin-layer",this.$printMarginEl=i.createElement("div"),this.$printMarginEl.className="ace_print-margin",e.appendChild(this.$printMarginEl),this.content.insertBefore(e,this.content.firstChild)}var t=this.$printMarginEl.style;t.left=this.characterWidth*this.$printMarginColumn+this.$padding+"px",t.visibility=this.$showPrintMargin?"visible":"hidden",this.session&&this.session.$wrap==-1&&this.adjustWrapLimit()},this.getContainerElement=function(){return this.container},this.getMouseEventTarget=function(){return this.scroller},this.getTextAreaContainer=function(){return this.container},this.$moveTextAreaToCursor=function(){if(!this.$keepTextAreaAtCursor)return;var e=this.layerConfig,t=this.$cursorLayer.$pixelPos.top,n=this.$cursorLayer.$pixelPos.left;t-=e.offset;var r=this.textarea.style,i=this.lineHeight;if(t<0||t>e.height-i){r.top=r.left="0";return}var s=this.characterWidth;if(this.$composition){var o=this.textarea.value.replace(/^\x01+/,"");s*=this.session.$getStringScreenWidth(o)[0]+2,i+=2}n-=this.scrollLeft,n>this.$size.scrollerWidth-s&&(n=this.$size.scrollerWidth-s),n+=this.gutterWidth,r.height=i+"px",r.width=s+"px",r.left=Math.min(n,this.$size.scrollerWidth-s)+"px",r.top=Math.min(t,this.$size.height-i)+"px"},this.getFirstVisibleRow=function(){return this.layerConfig.firstRow},this.getFirstFullyVisibleRow=function(){return this.layerConfig.firstRow+(this.layerConfig.offset===0?0:1)},this.getLastFullyVisibleRow=function(){var e=this.layerConfig,t=e.lastRow,n=this.session.documentToScreenRow(t,0)*e.lineHeight;return n-this.session.getScrollTop()>e.height-e.lineHeight?t-1:t},this.getLastVisibleRow=function(){return this.layerConfig.lastRow},this.$padding=null,this.setPadding=function(e){this.$padding=e,this.$textLayer.setPadding(e),this.$cursorLayer.setPadding(e),this.$markerFront.setPadding(e),this.$markerBack.setPadding(e),this.$loop.schedule(this.CHANGE_FULL),this.$updatePrintMargin()},this.setScrollMargin=function(e,t,n,r){var i=this.scrollMargin;i.top=e|0,i.bottom=t|0,i.right=r|0,i.left=n|0,i.v=i.top+i.bottom,i.h=i.left+i.right,i.top&&this.scrollTop<=0&&this.session&&this.session.setScrollTop(-i.top),this.updateFull()},this.getHScrollBarAlwaysVisible=function(){return this.$hScrollBarAlwaysVisible},this.setHScrollBarAlwaysVisible=function(e){this.setOption("hScrollBarAlwaysVisible",e)},this.getVScrollBarAlwaysVisible=function(){return this.$vScrollBarAlwaysVisible},this.setVScrollBarAlwaysVisible=function(e){this.setOption("vScrollBarAlwaysVisible",e)},this.$updateScrollBarV=function(){var e=this.layerConfig.maxHeight,t=this.$size.scrollerHeight;!this.$maxLines&&this.$scrollPastEnd&&(e-=(t-this.lineHeight)*this.$scrollPastEnd,this.scrollTop>e-t&&(e=this.scrollTop+t,this.scrollBarV.scrollTop=null)),this.scrollBarV.setScrollHeight(e+this.scrollMargin.v),this.scrollBarV.setScrollTop(this.scrollTop+this.scrollMargin.top)},this.$updateScrollBarH=function(){this.scrollBarH.setScrollWidth(this.layerConfig.width+2*this.$padding+this.scrollMargin.h),this.scrollBarH.setScrollLeft(this.scrollLeft+this.scrollMargin.left)},this.$frozen=!1,this.freeze=function(){this.$frozen=!0},this.unfreeze=function(){this.$frozen=!1},this.$renderChanges=function(e,t){this.$changes&&(e|=this.$changes,this.$changes=0);if(!this.session||!this.container.offsetWidth||this.$frozen||!e&&!t){this.$changes|=e;return}if(this.$size.$dirty)return this.$changes|=e,this.onResize(!0);this.lineHeight||this.$textLayer.checkForSizeChanges(),this._signal("beforeRender"),this.session&&this.session.$bidiHandler&&this.session.$bidiHandler.updateCharacterWidths(this.$fontMetrics);var n=this.layerConfig;if(e&this.CHANGE_FULL||e&this.CHANGE_SIZE||e&this.CHANGE_TEXT||e&this.CHANGE_LINES||e&this.CHANGE_SCROLL||e&this.CHANGE_H_SCROLL){e|=this.$computeLayerConfig();if(n.firstRow!=this.layerConfig.firstRow&&n.firstRowScreen==this.layerConfig.firstRowScreen){var r=this.scrollTop+(n.firstRow-this.layerConfig.firstRow)*this.lineHeight;r>0&&(this.scrollTop=r,e|=this.CHANGE_SCROLL,e|=this.$computeLayerConfig())}n=this.layerConfig,this.$updateScrollBarV(),e&this.CHANGE_H_SCROLL&&this.$updateScrollBarH(),this.$gutterLayer.element.style.marginTop=-n.offset+"px",this.content.style.marginTop=-n.offset+"px",this.content.style.width=n.width+2*this.$padding+"px",this.content.style.height=n.minHeight+"px"}e&this.CHANGE_H_SCROLL&&(this.content.style.marginLeft=-this.scrollLeft+"px",this.scroller.className=this.scrollLeft<=0?"ace_scroller":"ace_scroller ace_scroll-left");if(e&this.CHANGE_FULL){this.$textLayer.update(n),this.$showGutter&&this.$gutterLayer.update(n),this.$markerBack.update(n),this.$markerFront.update(n),this.$cursorLayer.update(n),this.$moveTextAreaToCursor(),this.$highlightGutterLine&&this.$updateGutterLineHighlight(),this._signal("afterRender");return}if(e&this.CHANGE_SCROLL){e&this.CHANGE_TEXT||e&this.CHANGE_LINES?this.$textLayer.update(n):this.$textLayer.scrollLines(n),this.$showGutter&&this.$gutterLayer.update(n),this.$markerBack.update(n),this.$markerFront.update(n),this.$cursorLayer.update(n),this.$highlightGutterLine&&this.$updateGutterLineHighlight(),this.$moveTextAreaToCursor(),this._signal("afterRender");return}e&this.CHANGE_TEXT?(this.$textLayer.update(n),this.$showGutter&&this.$gutterLayer.update(n)):e&this.CHANGE_LINES?(this.$updateLines()||e&this.CHANGE_GUTTER&&this.$showGutter)&&this.$gutterLayer.update(n):(e&this.CHANGE_TEXT||e&this.CHANGE_GUTTER)&&this.$showGutter&&this.$gutterLayer.update(n),e&this.CHANGE_CURSOR&&(this.$cursorLayer.update(n),this.$moveTextAreaToCursor(),this.$highlightGutterLine&&this.$updateGutterLineHighlight()),e&(this.CHANGE_MARKER|this.CHANGE_MARKER_FRONT)&&this.$markerFront.update(n),e&(this.CHANGE_MARKER|this.CHANGE_MARKER_BACK)&&this.$markerBack.update(n),this._signal("afterRender")},this.$autosize=function(){var e=this.session.getScreenLength()*this.lineHeight,t=this.$maxLines*this.lineHeight,n=Math.min(t,Math.max((this.$minLines||1)*this.lineHeight,e))+this.scrollMargin.v+(this.$extraHeight||0);this.$horizScroll&&(n+=this.scrollBarH.getHeight()),this.$maxPixelHeight&&n>this.$maxPixelHeight&&(n=this.$maxPixelHeight);var r=e>t;if(n!=this.desiredHeight||this.$size.height!=this.desiredHeight||r!=this.$vScroll){r!=this.$vScroll&&(this.$vScroll=r,this.scrollBarV.setVisible(r));var i=this.container.clientWidth;this.container.style.height=n+"px",this.$updateCachedSize(!0,this.$gutterWidth,i,n),this.desiredHeight=n,this._signal("autosize")}},this.$computeLayerConfig=function(){var e=this.session,t=this.$size,n=t.height<=2*this.lineHeight,r=this.session.getScreenLength(),i=r*this.lineHeight,s=this.$getLongestLine(),o=!n&&(this.$hScrollBarAlwaysVisible||t.scrollerWidth-s-2*this.$padding<0),u=this.$horizScroll!==o;u&&(this.$horizScroll=o,this.scrollBarH.setVisible(o));var a=this.$vScroll;this.$maxLines&&this.lineHeight>1&&this.$autosize();var f=this.scrollTop%this.lineHeight,l=t.scrollerHeight+this.lineHeight,c=!this.$maxLines&&this.$scrollPastEnd?(t.scrollerHeight-this.lineHeight)*this.$scrollPastEnd:0;i+=c;var h=this.scrollMargin;this.session.setScrollTop(Math.max(-h.top,Math.min(this.scrollTop,i-t.scrollerHeight+h.bottom))),this.session.setScrollLeft(Math.max(-h.left,Math.min(this.scrollLeft,s+2*this.$padding-t.scrollerWidth+h.right)));var p=!n&&(this.$vScrollBarAlwaysVisible||t.scrollerHeight-i+c<0||this.scrollTop>h.top),d=a!==p;d&&(this.$vScroll=p,this.scrollBarV.setVisible(p));var v=Math.ceil(l/this.lineHeight)-1,m=Math.max(0,Math.round((this.scrollTop-f)/this.lineHeight)),g=m+v,y,b,w=this.lineHeight;m=e.screenToDocumentRow(m,0);var E=e.getFoldLine(m);E&&(m=E.start.row),y=e.documentToScreenRow(m,0),b=e.getRowLength(m)*w,g=Math.min(e.screenToDocumentRow(g,0),e.getLength()-1),l=t.scrollerHeight+e.getRowLength(g)*w+b,f=this.scrollTop-y*w;var S=0;this.layerConfig.width!=s&&(S=this.CHANGE_H_SCROLL);if(u||d)S=this.$updateCachedSize(!0,this.gutterWidth,t.width,t.height),this._signal("scrollbarVisibilityChanged"),d&&(s=this.$getLongestLine());return this.layerConfig={width:s,padding:this.$padding,firstRow:m,firstRowScreen:y,lastRow:g,lineHeight:w,characterWidth:this.characterWidth,minHeight:l,maxHeight:i,offset:f,gutterOffset:w?Math.max(0,Math.ceil((f+t.height-t.scrollerHeight)/w)):0,height:this.$size.scrollerHeight},S},this.$updateLines=function(){if(!this.$changedLines)return;var e=this.$changedLines.firstRow,t=this.$changedLines.lastRow;this.$changedLines=null;var n=this.layerConfig;if(e>n.lastRow+1)return;if(t<n.firstRow)return;if(t===Infinity){this.$showGutter&&this.$gutterLayer.update(n),this.$textLayer.update(n);return}return this.$textLayer.updateLines(n,e,t),!0},this.$getLongestLine=function(){var e=this.session.getScreenWidth();return this.showInvisibles&&!this.session.$useWrapMode&&(e+=1),Math.max(this.$size.scrollerWidth-2*this.$padding,Math.round(e*this.characterWidth))},this.updateFrontMarkers=function(){this.$markerFront.setMarkers(this.session.getMarkers(!0)),this.$loop.schedule(this.CHANGE_MARKER_FRONT)},this.updateBackMarkers=function(){this.$markerBack.setMarkers(this.session.getMarkers()),this.$loop.schedule(this.CHANGE_MARKER_BACK)},this.addGutterDecoration=function(e,t){this.$gutterLayer.addGutterDecoration(e,t)},this.removeGutterDecoration=function(e,t){this.$gutterLayer.removeGutterDecoration(e,t)},this.updateBreakpoints=function(e){this.$loop.schedule(this.CHANGE_GUTTER)},this.setAnnotations=function(e){this.$gutterLayer.setAnnotations(e),this.$loop.schedule(this.CHANGE_GUTTER)},this.updateCursor=function(){this.$loop.schedule(this.CHANGE_CURSOR)},this.hideCursor=function(){this.$cursorLayer.hideCursor()},this.showCursor=function(){this.$cursorLayer.showCursor()},this.scrollSelectionIntoView=function(e,t,n){this.scrollCursorIntoView(e,n),this.scrollCursorIntoView(t,n)},this.scrollCursorIntoView=function(e,t,n){if(this.$size.scrollerHeight===0)return;var r=this.$cursorLayer.getPixelPosition(e),i=r.left,s=r.top,o=n&&n.top||0,u=n&&n.bottom||0,a=this.$scrollAnimation?this.session.getScrollTop():this.scrollTop;a+o>s?(t&&a+o>s+this.lineHeight&&(s-=t*this.$size.scrollerHeight),s===0&&(s=-this.scrollMargin.top),this.session.setScrollTop(s)):a+this.$size.scrollerHeight-u<s+this.lineHeight&&(t&&a+this.$size.scrollerHeight-u<s-this.lineHeight&&(s+=t*this.$size.scrollerHeight),this.session.setScrollTop(s+this.lineHeight-this.$size.scrollerHeight));var f=this.scrollLeft;f>i?(i<this.$padding+2*this.layerConfig.characterWidth&&(i=-this.scrollMargin.left),this.session.setScrollLeft(i)):f+this.$size.scrollerWidth<i+this.characterWidth?this.session.setScrollLeft(Math.round(i+this.characterWidth-this.$size.scrollerWidth)):f<=this.$padding&&i-f<this.characterWidth&&this.session.setScrollLeft(0)},this.getScrollTop=function(){return this.session.getScrollTop()},this.getScrollLeft=function(){return this.session.getScrollLeft()},this.getScrollTopRow=function(){return this.scrollTop/this.lineHeight},this.getScrollBottomRow=function(){return Math.max(0,Math.floor((this.scrollTop+this.$size.scrollerHeight)/this.lineHeight)-1)},this.scrollToRow=function(e){this.session.setScrollTop(e*this.lineHeight)},this.alignCursor=function(e,t){typeof e=="number"&&(e={row:e,column:0});var n=this.$cursorLayer.getPixelPosition(e),r=this.$size.scrollerHeight-this.lineHeight,i=n.top-r*(t||0);return this.session.setScrollTop(i),i},this.STEPS=8,this.$calcSteps=function(e,t){var n=0,r=this.STEPS,i=[],s=function(e,t,n){return n*(Math.pow(e-1,3)+1)+t};for(n=0;n<r;++n)i.push(s(n/this.STEPS,e,t-e));return i},this.scrollToLine=function(e,t,n,r){var i=this.$cursorLayer.getPixelPosition({row:e,column:0}),s=i.top;t&&(s-=this.$size.scrollerHeight/2);var o=this.scrollTop;this.session.setScrollTop(s),n!==!1&&this.animateScrolling(o,r)},this.animateScrolling=function(e,t){var n=this.scrollTop;if(!this.$animatedScroll)return;var r=this;if(e==n)return;if(this.$scrollAnimation){var i=this.$scrollAnimation.steps;if(i.length){e=i[0];if(e==n)return}}var s=r.$calcSteps(e,n);this.$scrollAnimation={from:e,to:n,steps:s},clearInterval(this.$timer),r.session.setScrollTop(s.shift()),r.session.$scrollTop=n,this.$timer=setInterval(function(){s.length?(r.session.setScrollTop(s.shift()),r.session.$scrollTop=n):n!=null?(r.session.$scrollTop=-1,r.session.setScrollTop(n),n=null):(r.$timer=clearInterval(r.$timer),r.$scrollAnimation=null,t&&t())},10)},this.scrollToY=function(e){this.scrollTop!==e&&(this.$loop.schedule(this.CHANGE_SCROLL),this.scrollTop=e)},this.scrollToX=function(e){this.scrollLeft!==e&&(this.scrollLeft=e),this.$loop.schedule(this.CHANGE_H_SCROLL)},this.scrollTo=function(e,t){this.session.setScrollTop(t),this.session.setScrollLeft(t)},this.scrollBy=function(e,t){t&&this.session.setScrollTop(this.session.getScrollTop()+t),e&&this.session.setScrollLeft(this.session.getScrollLeft()+e)},this.isScrollableBy=function(e,t){if(t<0&&this.session.getScrollTop()>=1-this.scrollMargin.top)return!0;if(t>0&&this.session.getScrollTop()+this.$size.scrollerHeight-this.layerConfig.maxHeight<-1+this.scrollMargin.bottom)return!0;if(e<0&&this.session.getScrollLeft()>=1-this.scrollMargin.left)return!0;if(e>0&&this.session.getScrollLeft()+this.$size.scrollerWidth-this.layerConfig.width<-1+this.scrollMargin.right)return!0},this.pixelToScreenCoordinates=function(e,t){var n=this.scroller.getBoundingClientRect(),r=e+this.scrollLeft-n.left-this.$padding,i=r/this.characterWidth,s=Math.floor((t+this.scrollTop-n.top)/this.lineHeight),o=Math.round(i);return{row:s,column:o,side:i-o>0?1:-1,offsetX:r}},this.screenToTextCoordinates=function(e,t){var n=this.scroller.getBoundingClientRect(),r=e+this.scrollLeft-n.left-this.$padding,i=Math.round(r/this.characterWidth),s=(t+this.scrollTop-n.top)/this.lineHeight;return this.session.screenToDocumentPosition(s,Math.max(i,0),r)},this.textToScreenCoordinates=function(e,t){var n=this.scroller.getBoundingClientRect(),r=this.session.documentToScreenPosition(e,t),i=this.$padding+(this.session.$bidiHandler.isBidiRow(r.row,e)?this.session.$bidiHandler.getPosLeft(r.column):Math.round(r.column*this.characterWidth)),s=r.row*this.lineHeight;return{pageX:n.left+i-this.scrollLeft,pageY:n.top+s-this.scrollTop}},this.visualizeFocus=function(){i.addCssClass(this.container,"ace_focus")},this.visualizeBlur=function(){i.removeCssClass(this.container,"ace_focus")},this.showComposition=function(e){this.$composition||(this.$composition={keepTextAreaAtCursor:this.$keepTextAreaAtCursor,cssText:this.textarea.style.cssText}),this.$keepTextAreaAtCursor=!0,i.addCssClass(this.textarea,"ace_composition"),this.textarea.style.cssText="",this.$moveTextAreaToCursor()},this.setCompositionText=function(e){this.$moveTextAreaToCursor()},this.hideComposition=function(){if(!this.$composition)return;i.removeCssClass(this.textarea,"ace_composition"),this.$keepTextAreaAtCursor=this.$composition.keepTextAreaAtCursor,this.textarea.style.cssText=this.$composition.cssText,this.$composition=null},this.setTheme=function(e,t){function o(r){if(n.$themeId!=e)return t&&t();if(!r||!r.cssClass)throw new Error("couldn't load module "+e+" or it didn't call define");i.importCssString(r.cssText,r.cssClass,n.container.ownerDocument),n.theme&&i.removeCssClass(n.container,n.theme.cssClass);var s="padding"in r?r.padding:"padding"in(n.theme||{})?4:n.$padding;n.$padding&&s!=n.$padding&&n.setPadding(s),n.$theme=r.cssClass,n.theme=r,i.addCssClass(n.container,r.cssClass),i.setCssClass(n.container,"ace_dark",r.isDark),n.$size&&(n.$size.width=0,n.$updateSizeAsync()),n._dispatchEvent("themeLoaded",{theme:r}),t&&t()}var n=this;this.$themeId=e,n._dispatchEvent("themeChange",{theme:e});if(!e||typeof e=="string"){var r=e||this.$options.theme.initialValue;s.loadModule(["theme",r],o)}else o(e)},this.getTheme=function(){return this.$themeId},this.setStyle=function(e,t){i.setCssClass(this.container,e,t!==!1)},this.unsetStyle=function(e){i.removeCssClass(this.container,e)},this.setCursorStyle=function(e){this.scroller.style.cursor!=e&&(this.scroller.style.cursor=e)},this.setMouseCursor=function(e){this.scroller.style.cursor=e},this.destroy=function(){this.$textLayer.destroy(),this.$cursorLayer.destroy()}}).call(g.prototype),s.defineOptions(g.prototype,"renderer",{animatedScroll:{initialValue:!1},showInvisibles:{set:function(e){this.$textLayer.setShowInvisibles(e)&&this.$loop.schedule(this.CHANGE_TEXT)},initialValue:!1},showPrintMargin:{set:function(){this.$updatePrintMargin()},initialValue:!0},printMarginColumn:{set:function(){this.$updatePrintMargin()},initialValue:80},printMargin:{set:function(e){typeof e=="number"&&(this.$printMarginColumn=e),this.$showPrintMargin=!!e,this.$updatePrintMargin()},get:function(){return this.$showPrintMargin&&this.$printMarginColumn}},showGutter:{set:function(e){this.$gutter.style.display=e?"block":"none",this.$loop.schedule(this.CHANGE_FULL),this.onGutterResize()},initialValue:!0},fadeFoldWidgets:{set:function(e){i.setCssClass(this.$gutter,"ace_fade-fold-widgets",e)},initialValue:!1},showFoldWidgets:{set:function(e){this.$gutterLayer.setShowFoldWidgets(e)},initialValue:!0},showLineNumbers:{set:function(e){this.$gutterLayer.setShowLineNumbers(e),this.$loop.schedule(this.CHANGE_GUTTER)},initialValue:!0},displayIndentGuides:{set:function(e){this.$textLayer.setDisplayIndentGuides(e)&&this.$loop.schedule(this.CHANGE_TEXT)},initialValue:!0},highlightGutterLine:{set:function(e){if(!this.$gutterLineHighlight){this.$gutterLineHighlight=i.createElement("div"),this.$gutterLineHighlight.className="ace_gutter-active-line",this.$gutter.appendChild(this.$gutterLineHighlight);return}this.$gutterLineHighlight.style.display=e?"":"none",this.$cursorLayer.$pixelPos&&this.$updateGutterLineHighlight()},initialValue:!1,value:!0},hScrollBarAlwaysVisible:{set:function(e){(!this.$hScrollBarAlwaysVisible||!this.$horizScroll)&&this.$loop.schedule(this.CHANGE_SCROLL)},initialValue:!1},vScrollBarAlwaysVisible:{set:function(e){(!this.$vScrollBarAlwaysVisible||!this.$vScroll)&&this.$loop.schedule(this.CHANGE_SCROLL)},initialValue:!1},fontSize:{set:function(e){typeof e=="number"&&(e+="px"),this.container.style.fontSize=e,this.updateFontSize()},initialValue:12},fontFamily:{set:function(e){this.container.style.fontFamily=e,this.updateFontSize()}},maxLines:{set:function(e){this.updateFull()}},minLines:{set:function(e){this.updateFull()}},maxPixelHeight:{set:function(e){this.updateFull()},initialValue:0},scrollPastEnd:{set:function(e){e=+e||0;if(this.$scrollPastEnd==e)return;this.$scrollPastEnd=e,this.$loop.schedule(this.CHANGE_SCROLL)},initialValue:0,handlesSet:!0},fixedWidthGutter:{set:function(e){this.$gutterLayer.$fixedWidth=!!e,this.$loop.schedule(this.CHANGE_GUTTER)}},theme:{set:function(e){this.setTheme(e)},get:function(){return this.$themeId||this.theme},initialValue:"./theme/textmate",handlesSet:!0}}),t.VirtualRenderer=g}),define("ace/worker/worker_client",["require","exports","module","ace/lib/oop","ace/lib/net","ace/lib/event_emitter","ace/config"],function(e,t,n){"use strict";function u(e){var t="importScripts('"+i.qualifyURL(e)+"');";try{return new Blob([t],{type:"application/javascript"})}catch(n){var r=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder,s=new r;return s.append(t),s.getBlob("application/javascript")}}function a(e){var t=u(e),n=window.URL||window.webkitURL,r=n.createObjectURL(t);return new Worker(r)}var r=e("../lib/oop"),i=e("../lib/net"),s=e("../lib/event_emitter").EventEmitter,o=e("../config"),f=function(t,n,r,i,s){this.$sendDeltaQueue=this.$sendDeltaQueue.bind(this),this.changeListener=this.changeListener.bind(this),this.onMessage=this.onMessage.bind(this),e.nameToUrl&&!e.toUrl&&(e.toUrl=e.nameToUrl);if(o.get("packaged")||!e.toUrl)i=i||o.moduleUrl(n,"worker");else{var u=this.$normalizePath;i=i||u(e.toUrl("ace/worker/worker.js",null,"_"));var f={};t.forEach(function(t){f[t]=u(e.toUrl(t,null,"_").replace(/(\.js)?(\?.*)?$/,""))})}this.$worker=a(i),s&&this.send("importScripts",s),this.$worker.postMessage({init:!0,tlns:f,module:n,classname:r}),this.callbackId=1,this.callbacks={},this.$worker.onmessage=this.onMessage};(function(){r.implement(this,s),this.onMessage=function(e){var t=e.data;switch(t.type){case"event":this._signal(t.name,{data:t.data});break;case"call":var n=this.callbacks[t.id];n&&(n(t.data),delete this.callbacks[t.id]);break;case"error":this.reportError(t.data);break;case"log":window.console&&console.log&&console.log.apply(console,t.data)}},this.reportError=function(e){window.console&&console.error&&console.error(e)},this.$normalizePath=function(e){return i.qualifyURL(e)},this.terminate=function(){this._signal("terminate",{}),this.deltaQueue=null,this.$worker.terminate(),this.$worker=null,this.$doc&&this.$doc.off("change",this.changeListener),this.$doc=null},this.send=function(e,t){this.$worker.postMessage({command:e,args:t})},this.call=function(e,t,n){if(n){var r=this.callbackId++;this.callbacks[r]=n,t.push(r)}this.send(e,t)},this.emit=function(e,t){try{this.$worker.postMessage({event:e,data:{data:t.data}})}catch(n){console.error(n.stack)}},this.attachToDocument=function(e){this.$doc&&this.terminate(),this.$doc=e,this.call("setValue",[e.getValue()]),e.on("change",this.changeListener)},this.changeListener=function(e){this.deltaQueue||(this.deltaQueue=[],setTimeout(this.$sendDeltaQueue,0)),e.action=="insert"?this.deltaQueue.push(e.start,e.lines):this.deltaQueue.push(e.start,e.end)},this.$sendDeltaQueue=function(){var e=this.deltaQueue;if(!e)return;this.deltaQueue=null,e.length>50&&e.length>this.$doc.getLength()>>1?this.call("setValue",[this.$doc.getValue()]):this.emit("change",{data:e})}}).call(f.prototype);var l=function(e,t,n){this.$sendDeltaQueue=this.$sendDeltaQueue.bind(this),this.changeListener=this.changeListener.bind(this),this.callbackId=1,this.callbacks={},this.messageBuffer=[];var r=null,i=!1,u=Object.create(s),a=this;this.$worker={},this.$worker.terminate=function(){},this.$worker.postMessage=function(e){a.messageBuffer.push(e),r&&(i?setTimeout(f):f())},this.setEmitSync=function(e){i=e};var f=function(){var e=a.messageBuffer.shift();e.command?r[e.command].apply(r,e.args):e.event&&u._signal(e.event,e.data)};u.postMessage=function(e){a.onMessage({data:e})},u.callback=function(e,t){this.postMessage({type:"call",id:t,data:e})},u.emit=function(e,t){this.postMessage({type:"event",name:e,data:t})},o.loadModule(["worker",t],function(e){r=new e[n](u);while(a.messageBuffer.length)f()})};l.prototype=f.prototype,t.UIWorkerClient=l,t.WorkerClient=f,t.createWorker=a}),define("ace/placeholder",["require","exports","module","ace/range","ace/lib/event_emitter","ace/lib/oop"],function(e,t,n){"use strict";var r=e("./range").Range,i=e("./lib/event_emitter").EventEmitter,s=e("./lib/oop"),o=function(e,t,n,r,i,s){var o=this;this.length=t,this.session=e,this.doc=e.getDocument(),this.mainClass=i,this.othersClass=s,this.$onUpdate=this.onUpdate.bind(this),this.doc.on("change",this.$onUpdate),this.$others=r,this.$onCursorChange=function(){setTimeout(function(){o.onCursorChange()})},this.$pos=n;var u=e.getUndoManager().$undoStack||e.getUndoManager().$undostack||{length:-1};this.$undoStackDepth=u.length,this.setup(),e.selection.on("changeCursor",this.$onCursorChange)};(function(){s.implement(this,i),this.setup=function(){var e=this,t=this.doc,n=this.session;this.selectionBefore=n.selection.toJSON(),n.selection.inMultiSelectMode&&n.selection.toSingleRange(),this.pos=t.createAnchor(this.$pos.row,this.$pos.column);var i=this.pos;i.$insertRight=!0,i.detach(),i.markerId=n.addMarker(new r(i.row,i.column,i.row,i.column+this.length),this.mainClass,null,!1),this.others=[],this.$others.forEach(function(n){var r=t.createAnchor(n.row,n.column);r.$insertRight=!0,r.detach(),e.others.push(r)}),n.setUndoSelect(!1)},this.showOtherMarkers=function(){if(this.othersActive)return;var e=this.session,t=this;this.othersActive=!0,this.others.forEach(function(n){n.markerId=e.addMarker(new r(n.row,n.column,n.row,n.column+t.length),t.othersClass,null,!1)})},this.hideOtherMarkers=function(){if(!this.othersActive)return;this.othersActive=!1;for(var e=0;e<this.others.length;e++)this.session.removeMarker(this.others[e].markerId)},this.onUpdate=function(e){if(this.$updating)return this.updateAnchors(e);var t=e;if(t.start.row!==t.end.row)return;if(t.start.row!==this.pos.row)return;this.$updating=!0;var n=e.action==="insert"?t.end.column-t.start.column:t.start.column-t.end.column,i=t.start.column>=this.pos.column&&t.start.column<=this.pos.column+this.length+1,s=t.start.column-this.pos.column;this.updateAnchors(e),i&&(this.length+=n);if(i&&!this.session.$fromUndo)if(e.action==="insert")for(var o=this.others.length-1;o>=0;o--){var u=this.others[o],a={row:u.row,column:u.column+s};this.doc.insertMergedLines(a,e.lines)}else if(e.action==="remove")for(var o=this.others.length-1;o>=0;o--){var u=this.others[o],a={row:u.row,column:u.column+s};this.doc.remove(new r(a.row,a.column,a.row,a.column-n))}this.$updating=!1,this.updateMarkers()},this.updateAnchors=function(e){this.pos.onChange(e);for(var t=this.others.length;t--;)this.others[t].onChange(e);this.updateMarkers()},this.updateMarkers=function(){if(this.$updating)return;var e=this,t=this.session,n=function(n,i){t.removeMarker(n.markerId),n.markerId=t.addMarker(new r(n.row,n.column,n.row,n.column+e.length),i,null,!1)};n(this.pos,this.mainClass);for(var i=this.others.length;i--;)n(this.others[i],this.othersClass)},this.onCursorChange=function(e){if(this.$updating||!this.session)return;var t=this.session.selection.getCursor();t.row===this.pos.row&&t.column>=this.pos.column&&t.column<=this.pos.column+this.length?(this.showOtherMarkers(),this._emit("cursorEnter",e)):(this.hideOtherMarkers(),this._emit("cursorLeave",e))},this.detach=function(){this.session.removeMarker(this.pos&&this.pos.markerId),this.hideOtherMarkers(),this.doc.removeEventListener("change",this.$onUpdate),this.session.selection.removeEventListener("changeCursor",this.$onCursorChange),this.session.setUndoSelect(!0),this.session=null},this.cancel=function(){if(this.$undoStackDepth===-1)return;var e=this.session.getUndoManager(),t=(e.$undoStack||e.$undostack).length-this.$undoStackDepth;for(var n=0;n<t;n++)e.undo(!0);this.selectionBefore&&this.session.selection.fromJSON(this.selectionBefore)}}).call(o.prototype),t.PlaceHolder=o}),define("ace/mouse/multi_select_handler",["require","exports","module","ace/lib/event","ace/lib/useragent"],function(e,t,n){function s(e,t){return e.row==t.row&&e.column==t.column}function o(e){var t=e.domEvent,n=t.altKey,o=t.shiftKey,u=t.ctrlKey,a=e.getAccelKey(),f=e.getButton();u&&i.isMac&&(f=t.button);if(e.editor.inMultiSelectMode&&f==2){e.editor.textInput.onContextMenu(e.domEvent);return}if(!u&&!n&&!a){f===0&&e.editor.inMultiSelectMode&&e.editor.exitMultiSelectMode();return}if(f!==0)return;var l=e.editor,c=l.selection,h=l.inMultiSelectMode,p=e.getDocumentPosition(),d=c.getCursor(),v=e.inSelection()||c.isEmpty()&&s(p,d),m=e.x,g=e.y,y=function(e){m=e.clientX,g=e.clientY},b=l.session,w=l.renderer.pixelToScreenCoordinates(m,g),E=w,S;if(l.$mouseHandler.$enableJumpToDef)u&&n||a&&n?S=o?"block":"add":n&&l.$blockSelectEnabled&&(S="block");else if(a&&!n){S="add";if(!h&&o)return}else n&&l.$blockSelectEnabled&&(S="block");S&&i.isMac&&t.ctrlKey&&l.$mouseHandler.cancelContextMenu();if(S=="add"){if(!h&&v)return;if(!h){var x=c.toOrientedRange();l.addSelectionMarker(x)}var T=c.rangeList.rangeAtPoint(p);l.$blockScrolling++,l.inVirtualSelectionMode=!0,o&&(T=null,x=c.ranges[0]||x,l.removeSelectionMarker(x)),l.once("mouseup",function(){var e=c.toOrientedRange();T&&e.isEmpty()&&s(T.cursor,e.cursor)?c.substractPoint(e.cursor):(o?c.substractPoint(x.cursor):x&&(l.removeSelectionMarker(x),c.addRange(x)),c.addRange(e)),l.$blockScrolling--,l.inVirtualSelectionMode=!1})}else if(S=="block"){e.stop(),l.inVirtualSelectionMode=!0;var N,C=[],k=function(){var e=l.renderer.pixelToScreenCoordinates(m,g),t=b.screenToDocumentPosition(e.row,e.column,e.offsetX);if(s(E,e)&&s(t,c.lead))return;E=e,l.$blockScrolling++,l.selection.moveToPosition(t),l.renderer.scrollCursorIntoView(),l.removeSelectionMarkers(C),C=c.rectangularRangeBlock(E,w),l.$mouseHandler.$clickSelection&&C.length==1&&C[0].isEmpty()&&(C[0]=l.$mouseHandler.$clickSelection.clone()),C.forEach(l.addSelectionMarker,l),l.updateSelectionMarkers(),l.$blockScrolling--};l.$blockScrolling++,h&&!a?c.toSingleRange():!h&&a&&(N=c.toOrientedRange(),l.addSelectionMarker(N)),o?w=b.documentToScreenPosition(c.lead):c.moveToPosition(p),l.$blockScrolling--,E={row:-1,column:-1};var L=function(e){clearInterval(O),l.removeSelectionMarkers(C),C.length||(C=[c.toOrientedRange()]),l.$blockScrolling++,N&&(l.removeSelectionMarker(N),c.toSingleRange(N));for(var t=0;t<C.length;t++)c.addRange(C[t]);l.inVirtualSelectionMode=!1,l.$mouseHandler.$clickSelection=null,l.$blockScrolling--},A=k;r.capture(l.container,y,L);var O=setInterval(function(){A()},20);return e.preventDefault()}}var r=e("../lib/event"),i=e("../lib/useragent");t.onMouseDown=o}),define("ace/commands/multi_select_commands",["require","exports","module","ace/keyboard/hash_handler"],function(e,t,n){t.defaultCommands=[{name:"addCursorAbove",exec:function(e){e.selectMoreLines(-1)},bindKey:{win:"Ctrl-Alt-Up",mac:"Ctrl-Alt-Up"},scrollIntoView:"cursor",readOnly:!0},{name:"addCursorBelow",exec:function(e){e.selectMoreLines(1)},bindKey:{win:"Ctrl-Alt-Down",mac:"Ctrl-Alt-Down"},scrollIntoView:"cursor",readOnly:!0},{name:"addCursorAboveSkipCurrent",exec:function(e){e.selectMoreLines(-1,!0)},bindKey:{win:"Ctrl-Alt-Shift-Up",mac:"Ctrl-Alt-Shift-Up"},scrollIntoView:"cursor",readOnly:!0},{name:"addCursorBelowSkipCurrent",exec:function(e){e.selectMoreLines(1,!0)},bindKey:{win:"Ctrl-Alt-Shift-Down",mac:"Ctrl-Alt-Shift-Down"},scrollIntoView:"cursor",readOnly:!0},{name:"selectMoreBefore",exec:function(e){e.selectMore(-1)},bindKey:{win:"Ctrl-Alt-Left",mac:"Ctrl-Alt-Left"},scrollIntoView:"cursor",readOnly:!0},{name:"selectMoreAfter",exec:function(e){e.selectMore(1)},bindKey:{win:"Ctrl-Alt-Right",mac:"Ctrl-Alt-Right"},scrollIntoView:"cursor",readOnly:!0},{name:"selectNextBefore",exec:function(e){e.selectMore(-1,!0)},bindKey:{win:"Ctrl-Alt-Shift-Left",mac:"Ctrl-Alt-Shift-Left"},scrollIntoView:"cursor",readOnly:!0},{name:"selectNextAfter",exec:function(e){e.selectMore(1,!0)},bindKey:{win:"Ctrl-Alt-Shift-Right",mac:"Ctrl-Alt-Shift-Right"},scrollIntoView:"cursor",readOnly:!0},{name:"splitIntoLines",exec:function(e){e.multiSelect.splitIntoLines()},bindKey:{win:"Ctrl-Alt-L",mac:"Ctrl-Alt-L"},readOnly:!0},{name:"alignCursors",exec:function(e){e.alignCursors()},bindKey:{win:"Ctrl-Alt-A",mac:"Ctrl-Alt-A"},scrollIntoView:"cursor"},{name:"findAll",exec:function(e){e.findAll()},bindKey:{win:"Ctrl-Alt-K",mac:"Ctrl-Alt-G"},scrollIntoView:"cursor",readOnly:!0}],t.multiSelectCommands=[{name:"singleSelection",bindKey:"esc",exec:function(e){e.exitMultiSelectMode()},scrollIntoView:"cursor",readOnly:!0,isAvailable:function(e){return e&&e.inMultiSelectMode}}];var r=e("../keyboard/hash_handler").HashHandler;t.keyboardHandler=new r(t.multiSelectCommands)}),define("ace/multi_select",["require","exports","module","ace/range_list","ace/range","ace/selection","ace/mouse/multi_select_handler","ace/lib/event","ace/lib/lang","ace/commands/multi_select_commands","ace/search","ace/edit_session","ace/editor","ace/config"],function(e,t,n){function h(e,t,n){return c.$options.wrap=!0,c.$options.needle=t,c.$options.backwards=n==-1,c.find(e)}function v(e,t){return e.row==t.row&&e.column==t.column}function m(e){if(e.$multiselectOnSessionChange)return;e.$onAddRange=e.$onAddRange.bind(e),e.$onRemoveRange=e.$onRemoveRange.bind(e),e.$onMultiSelect=e.$onMultiSelect.bind(e),e.$onSingleSelect=e.$onSingleSelect.bind(e),e.$multiselectOnSessionChange=t.onSessionChange.bind(e),e.$checkMultiselectChange=e.$checkMultiselectChange.bind(e),e.$multiselectOnSessionChange(e),e.on("changeSession",e.$multiselectOnSessionChange),e.on("mousedown",o),e.commands.addCommands(f.defaultCommands),g(e)}function g(e){function r(t){n&&(e.renderer.setMouseCursor(""),n=!1)}var t=e.textInput.getElement(),n=!1;u.addListener(t,"keydown",function(t){var i=t.keyCode==18&&!(t.ctrlKey||t.shiftKey||t.metaKey);e.$blockSelectEnabled&&i?n||(e.renderer.setMouseCursor("crosshair"),n=!0):n&&r()}),u.addListener(t,"keyup",r),u.addListener(t,"blur",r)}var r=e("./range_list").RangeList,i=e("./range").Range,s=e("./selection").Selection,o=e("./mouse/multi_select_handler").onMouseDown,u=e("./lib/event"),a=e("./lib/lang"),f=e("./commands/multi_select_commands");t.commands=f.defaultCommands.concat(f.multiSelectCommands);var l=e("./search").Search,c=new l,p=e("./edit_session").EditSession;(function(){this.getSelectionMarkers=function(){return this.$selectionMarkers}}).call(p.prototype),function(){this.ranges=null,this.rangeList=null,this.addRange=function(e,t){if(!e)return;if(!this.inMultiSelectMode&&this.rangeCount===0){var n=this.toOrientedRange();this.rangeList.add(n),this.rangeList.add(e);if(this.rangeList.ranges.length!=2)return this.rangeList.removeAll(),t||this.fromOrientedRange(e);this.rangeList.removeAll(),this.rangeList.add(n),this.$onAddRange(n)}e.cursor||(e.cursor=e.end);var r=this.rangeList.add(e);return this.$onAddRange(e),r.length&&this.$onRemoveRange(r),this.rangeCount>1&&!this.inMultiSelectMode&&(this._signal("multiSelect"),this.inMultiSelectMode=!0,this.session.$undoSelect=!1,this.rangeList.attach(this.session)),t||this.fromOrientedRange(e)},this.toSingleRange=function(e){e=e||this.ranges[0];var t=this.rangeList.removeAll();t.length&&this.$onRemoveRange(t),e&&this.fromOrientedRange(e)},this.substractPoint=function(e){var t=this.rangeList.substractPoint(e);if(t)return this.$onRemoveRange(t),t[0]},this.mergeOverlappingRanges=function(){var e=this.rangeList.merge();e.length?this.$onRemoveRange(e):this.ranges[0]&&this.fromOrientedRange(this.ranges[0])},this.$onAddRange=function(e){this.rangeCount=this.rangeList.ranges.length,this.ranges.unshift(e),this._signal("addRange",{range:e})},this.$onRemoveRange=function(e){this.rangeCount=this.rangeList.ranges.length;if(this.rangeCount==1&&this.inMultiSelectMode){var t=this.rangeList.ranges.pop();e.push(t),this.rangeCount=0}for(var n=e.length;n--;){var r=this.ranges.indexOf(e[n]);this.ranges.splice(r,1)}this._signal("removeRange",{ranges:e}),this.rangeCount===0&&this.inMultiSelectMode&&(this.inMultiSelectMode=!1,this._signal("singleSelect"),this.session.$undoSelect=!0,this.rangeList.detach(this.session)),t=t||this.ranges[0],t&&!t.isEqual(this.getRange())&&this.fromOrientedRange(t)},this.$initRangeList=function(){if(this.rangeList)return;this.rangeList=new r,this.ranges=[],this.rangeCount=0},this.getAllRanges=function(){return this.rangeCount?this.rangeList.ranges.concat():[this.getRange()]},this.splitIntoLines=function(){if(this.rangeCount>1){var e=this.rangeList.ranges,t=e[e.length-1],n=i.fromPoints(e[0].start,t.end);this.toSingleRange(),this.setSelectionRange(n,t.cursor==t.start)}else{var n=this.getRange(),r=this.isBackwards(),s=n.start.row,o=n.end.row;if(s==o){if(r)var u=n.end,a=n.start;else var u=n.start,a=n.end;this.addRange(i.fromPoints(a,a)),this.addRange(i.fromPoints(u,u));return}var f=[],l=this.getLineRange(s,!0);l.start.column=n.start.column,f.push(l);for(var c=s+1;c<o;c++)f.push(this.getLineRange(c,!0));l=this.getLineRange(o,!0),l.end.column=n.end.column,f.push(l),f.forEach(this.addRange,this)}},this.toggleBlockSelection=function(){if(this.rangeCount>1){var e=this.rangeList.ranges,t=e[e.length-1],n=i.fromPoints(e[0].start,t.end);this.toSingleRange(),this.setSelectionRange(n,t.cursor==t.start)}else{var r=this.session.documentToScreenPosition(this.selectionLead),s=this.session.documentToScreenPosition(this.selectionAnchor),o=this.rectangularRangeBlock(r,s);o.forEach(this.addRange,this)}},this.rectangularRangeBlock=function(e,t,n){var r=[],s=e.column<t.column;if(s)var o=e.column,u=t.column,a=e.offsetX,f=t.offsetX;else var o=t.column,u=e.column,a=t.offsetX,f=e.offsetX;var l=e.row<t.row;if(l)var c=e.row,h=t.row;else var c=t.row,h=e.row;o<0&&(o=0),c<0&&(c=0),c==h&&(n=!0);for(var p=c;p<=h;p++){var d=i.fromPoints(this.session.screenToDocumentPosition(p,o,a),this.session.screenToDocumentPosition(p,u,f));if(d.isEmpty()){if(m&&v(d.end,m))break;var m=d.end}d.cursor=s?d.start:d.end,r.push(d)}l&&r.reverse();if(!n){var g=r.length-1;while(r[g].isEmpty()&&g>0)g--;if(g>0){var y=0;while(r[y].isEmpty())y++}for(var b=g;b>=y;b--)r[b].isEmpty()&&r.splice(b,1)}return r}}.call(s.prototype);var d=e("./editor").Editor;(function(){this.updateSelectionMarkers=function(){this.renderer.updateCursor(),this.renderer.updateBackMarkers()},this.addSelectionMarker=function(e){e.cursor||(e.cursor=e.end);var t=this.getSelectionStyle();return e.marker=this.session.addMarker(e,"ace_selection",t),this.session.$selectionMarkers.push(e),this.session.selectionMarkerCount=this.session.$selectionMarkers.length,e},this.removeSelectionMarker=function(e){if(!e.marker)return;this.session.removeMarker(e.marker);var t=this.session.$selectionMarkers.indexOf(e);t!=-1&&this.session.$selectionMarkers.splice(t,1),this.session.selectionMarkerCount=this.session.$selectionMarkers.length},this.removeSelectionMarkers=function(e){var t=this.session.$selectionMarkers;for(var n=e.length;n--;){var r=e[n];if(!r.marker)continue;this.session.removeMarker(r.marker);var i=t.indexOf(r);i!=-1&&t.splice(i,1)}this.session.selectionMarkerCount=t.length},this.$onAddRange=function(e){this.addSelectionMarker(e.range),this.renderer.updateCursor(),this.renderer.updateBackMarkers()},this.$onRemoveRange=function(e){this.removeSelectionMarkers(e.ranges),this.renderer.updateCursor(),this.renderer.updateBackMarkers()},this.$onMultiSelect=function(e){if(this.inMultiSelectMode)return;this.inMultiSelectMode=!0,this.setStyle("ace_multiselect"),this.keyBinding.addKeyboardHandler(f.keyboardHandler),this.commands.setDefaultHandler("exec",this.$onMultiSelectExec),this.renderer.updateCursor(),this.renderer.updateBackMarkers()},this.$onSingleSelect=function(e){if(this.session.multiSelect.inVirtualMode)return;this.inMultiSelectMode=!1,this.unsetStyle("ace_multiselect"),this.keyBinding.removeKeyboardHandler(f.keyboardHandler),this.commands.removeDefaultHandler("exec",this.$onMultiSelectExec),this.renderer.updateCursor(),this.renderer.updateBackMarkers(),this._emit("changeSelection")},this.$onMultiSelectExec=function(e){var t=e.command,n=e.editor;if(!n.multiSelect)return;if(!t.multiSelectAction){var r=t.exec(n,e.args||{});n.multiSelect.addRange(n.multiSelect.toOrientedRange()),n.multiSelect.mergeOverlappingRanges()}else t.multiSelectAction=="forEach"?r=n.forEachSelection(t,e.args):t.multiSelectAction=="forEachLine"?r=n.forEachSelection(t,e.args,!0):t.multiSelectAction=="single"?(n.exitMultiSelectMode(),r=t.exec(n,e.args||{})):r=t.multiSelectAction(n,e.args||{});return r},this.forEachSelection=function(e,t,n){if(this.inVirtualSelectionMode)return;var r=n&&n.keepOrder,i=n==1||n&&n.$byLines,o=this.session,u=this.selection,a=u.rangeList,f=(r?u:a).ranges,l;if(!f.length)return e.exec?e.exec(this,t||{}):e(this,t||{});var c=u._eventRegistry;u._eventRegistry={};var h=new s(o);this.inVirtualSelectionMode=!0;for(var p=f.length;p--;){if(i)while(p>0&&f[p].start.row==f[p-1].end.row)p--;h.fromOrientedRange(f[p]),h.index=p,this.selection=o.selection=h;var d=e.exec?e.exec(this,t||{}):e(this,t||{});!l&&d!==undefined&&(l=d),h.toOrientedRange(f[p])}h.detach(),this.selection=o.selection=u,this.inVirtualSelectionMode=!1,u._eventRegistry=c,u.mergeOverlappingRanges();var v=this.renderer.$scrollAnimation;return this.onCursorChange(),this.onSelectionChange(),v&&v.from==v.to&&this.renderer.animateScrolling(v.from),l},this.exitMultiSelectMode=function(){if(!this.inMultiSelectMode||this.inVirtualSelectionMode)return;this.multiSelect.toSingleRange()},this.getSelectedText=function(){var e="";if(this.inMultiSelectMode&&!this.inVirtualSelectionMode){var t=this.multiSelect.rangeList.ranges,n=[];for(var r=0;r<t.length;r++)n.push(this.session.getTextRange(t[r]));var i=this.session.getDocument().getNewLineCharacter();e=n.join(i),e.length==(n.length-1)*i.length&&(e="")}else this.selection.isEmpty()||(e=this.session.getTextRange(this.getSelectionRange()));return e},this.$checkMultiselectChange=function(e,t){if(this.inMultiSelectMode&&!this.inVirtualSelectionMode){var n=this.multiSelect.ranges[0];if(this.multiSelect.isEmpty()&&t==this.multiSelect.anchor)return;var r=t==this.multiSelect.anchor?n.cursor==n.start?n.end:n.start:n.cursor;(r.row!=t.row||this.session.$clipPositionToDocument(r.row,r.column).column!=t.column)&&this.multiSelect.toSingleRange(this.multiSelect.toOrientedRange())}},this.findAll=function(e,t,n){t=t||{},t.needle=e||t.needle;if(t.needle==undefined){var r=this.selection.isEmpty()?this.selection.getWordRange():this.selection.getRange();t.needle=this.session.getTextRange(r)}this.$search.set(t);var i=this.$search.findAll(this.session);if(!i.length)return 0;this.$blockScrolling+=1;var s=this.multiSelect;n||s.toSingleRange(i[0]);for(var o=i.length;o--;)s.addRange(i[o],!0);return r&&s.rangeList.rangeAtPoint(r.start)&&s.addRange(r,!0),this.$blockScrolling-=1,i.length},this.selectMoreLines=function(e,t){var n=this.selection.toOrientedRange(),r=n.cursor==n.end,s=this.session.documentToScreenPosition(n.cursor);this.selection.$desiredColumn&&(s.column=this.selection.$desiredColumn);var o=this.session.screenToDocumentPosition(s.row+e,s.column);if(!n.isEmpty())var u=this.session.documentToScreenPosition(r?n.end:n.start),a=this.session.screenToDocumentPosition(u.row+e,u.column);else var a=o;if(r){var f=i.fromPoints(o,a);f.cursor=f.start}else{var f=i.fromPoints(a,o);f.cursor=f.end}f.desiredColumn=s.column;if(!this.selection.inMultiSelectMode)this.selection.addRange(n);else if(t)var l=n.cursor;this.selection.addRange(f),l&&this.selection.substractPoint(l)},this.transposeSelections=function(e){var t=this.session,n=t.multiSelect,r=n.ranges;for(var i=r.length;i--;){var s=r[i];if(s.isEmpty()){var o=t.getWordRange(s.start.row,s.start.column);s.start.row=o.start.row,s.start.column=o.start.column,s.end.row=o.end.row,s.end.column=o.end.column}}n.mergeOverlappingRanges();var u=[];for(var i=r.length;i--;){var s=r[i];u.unshift(t.getTextRange(s))}e<0?u.unshift(u.pop()):u.push(u.shift());for(var i=r.length;i--;){var s=r[i],o=s.clone();t.replace(s,u[i]),s.start.row=o.start.row,s.start.column=o.start.column}},this.selectMore=function(e,t,n){var r=this.session,i=r.multiSelect,s=i.toOrientedRange();if(s.isEmpty()){s=r.getWordRange(s.start.row,s.start.column),s.cursor=e==-1?s.start:s.end,this.multiSelect.addRange(s);if(n)return}var o=r.getTextRange(s),u=h(r,o,e);u&&(u.cursor=e==-1?u.start:u.end,this.$blockScrolling+=1,this.session.unfold(u),this.multiSelect.addRange(u),this.$blockScrolling-=1,this.renderer.scrollCursorIntoView(null,.5)),t&&this.multiSelect.substractPoint(s.cursor)},this.alignCursors=function(){var e=this.session,t=e.multiSelect,n=t.ranges,r=-1,s=n.filter(function(e){if(e.cursor.row==r)return!0;r=e.cursor.row});if(!n.length||s.length==n.length-1){var o=this.selection.getRange(),u=o.start.row,f=o.end.row,l=u==f;if(l){var c=this.session.getLength(),h;do h=this.session.getLine(f);while(/[=:]/.test(h)&&++f<c);do h=this.session.getLine(u);while(/[=:]/.test(h)&&--u>0);u<0&&(u=0),f>=c&&(f=c-1)}var p=this.session.removeFullLines(u,f);p=this.$reAlignText(p,l),this.session.insert({row:u,column:0},p.join("\n")+"\n"),l||(o.start.column=0,o.end.column=p[p.length-1].length),this.selection.setRange(o)}else{s.forEach(function(e){t.substractPoint(e.cursor)});var d=0,v=Infinity,m=n.map(function(t){var n=t.cursor,r=e.getLine(n.row),i=r.substr(n.column).search(/\S/g);return i==-1&&(i=0),n.column>d&&(d=n.column),i<v&&(v=i),i});n.forEach(function(t,n){var r=t.cursor,s=d-r.column,o=m[n]-v;s>o?e.insert(r,a.stringRepeat(" ",s-o)):e.remove(new i(r.row,r.column,r.row,r.column-s+o)),t.start.column=t.end.column=d,t.start.row=t.end.row=r.row,t.cursor=t.end}),t.fromOrientedRange(n[0]),this.renderer.updateCursor(),this.renderer.updateBackMarkers()}},this.$reAlignText=function(e,t){function u(e){return a.stringRepeat(" ",e)}function f(e){return e[2]?u(i)+e[2]+u(s-e[2].length+o)+e[4].replace(/^([=:])\s+/,"$1 "):e[0]}function l(e){return e[2]?u(i+s-e[2].length)+e[2]+u(o," ")+e[4].replace(/^([=:])\s+/,"$1 "):e[0]}function c(e){return e[2]?u(i)+e[2]+u(o)+e[4].replace(/^([=:])\s+/,"$1 "):e[0]}var n=!0,r=!0,i,s,o;return e.map(function(e){var t=e.match(/(\s*)(.*?)(\s*)([=:].*)/);return t?i==null?(i=t[1].length,s=t[2].length,o=t[3].length,t):(i+s+o!=t[1].length+t[2].length+t[3].length&&(r=!1),i!=t[1].length&&(n=!1),i>t[1].length&&(i=t[1].length),s<t[2].length&&(s=t[2].length),o>t[3].length&&(o=t[3].length),t):[e]}).map(t?f:n?r?l:f:c)}}).call(d.prototype),t.onSessionChange=function(e){var t=e.session;t&&!t.multiSelect&&(t.$selectionMarkers=[],t.selection.$initRangeList(),t.multiSelect=t.selection),this.multiSelect=t&&t.multiSelect;var n=e.oldSession;n&&(n.multiSelect.off("addRange",this.$onAddRange),n.multiSelect.off("removeRange",this.$onRemoveRange),n.multiSelect.off("multiSelect",this.$onMultiSelect),n.multiSelect.off("singleSelect",this.$onSingleSelect),n.multiSelect.lead.off("change",this.$checkMultiselectChange),n.multiSelect.anchor.off("change",this.$checkMultiselectChange)),t&&(t.multiSelect.on("addRange",this.$onAddRange),t.multiSelect.on("removeRange",this.$onRemoveRange),t.multiSelect.on("multiSelect",this.$onMultiSelect),t.multiSelect.on("singleSelect",this.$onSingleSelect),t.multiSelect.lead.on("change",this.$checkMultiselectChange),t.multiSelect.anchor.on("change",this.$checkMultiselectChange)),t&&this.inMultiSelectMode!=t.selection.inMultiSelectMode&&(t.selection.inMultiSelectMode?this.$onMultiSelect():this.$onSingleSelect())},t.MultiSelect=m,e("./config").defineOptions(d.prototype,"editor",{enableMultiselect:{set:function(e){m(this),e?(this.on("changeSession",this.$multiselectOnSessionChange),this.on("mousedown",o)):(this.off("changeSession",this.$multiselectOnSessionChange),this.off("mousedown",o))},value:!0},enableBlockSelect:{set:function(e){this.$blockSelectEnabled=e},value:!0}})}),define("ace/mode/folding/fold_mode",["require","exports","module","ace/range"],function(e,t,n){"use strict";var r=e("../../range").Range,i=t.FoldMode=function(){};(function(){this.foldingStartMarker=null,this.foldingStopMarker=null,this.getFoldWidget=function(e,t,n){var r=e.getLine(n);return this.foldingStartMarker.test(r)?"start":t=="markbeginend"&&this.foldingStopMarker&&this.foldingStopMarker.test(r)?"end":""},this.getFoldWidgetRange=function(e,t,n){return null},this.indentationBlock=function(e,t,n){var i=/\S/,s=e.getLine(t),o=s.search(i);if(o==-1)return;var u=n||s.length,a=e.getLength(),f=t,l=t;while(++t<a){var c=e.getLine(t).search(i);if(c==-1)continue;if(c<=o)break;l=t}if(l>f){var h=e.getLine(l).length;return new r(f,u,l,h)}},this.openingBracketBlock=function(e,t,n,i,s){var o={row:n,column:i+1},u=e.$findClosingBracket(t,o,s);if(!u)return;var a=e.foldWidgets[u.row];return a==null&&(a=e.getFoldWidget(u.row)),a=="start"&&u.row>o.row&&(u.row--,u.column=e.getLine(u.row).length),r.fromPoints(o,u)},this.closingBracketBlock=function(e,t,n,i,s){var o={row:n,column:i},u=e.$findOpeningBracket(t,o);if(!u)return;return u.column++,o.column--,r.fromPoints(u,o)}}).call(i.prototype)}),define("ace/theme/textmate",["require","exports","module","ace/lib/dom"],function(e,t,n){"use strict";t.isDark=!1,t.cssClass="ace-tm",t.cssText='.ace-tm .ace_gutter {background: #f0f0f0;color: #333;}.ace-tm .ace_print-margin {width: 1px;background: #e8e8e8;}.ace-tm .ace_fold {background-color: #6B72E6;}.ace-tm {background-color: #FFFFFF;color: black;}.ace-tm .ace_cursor {color: black;}.ace-tm .ace_invisible {color: rgb(191, 191, 191);}.ace-tm .ace_storage,.ace-tm .ace_keyword {color: blue;}.ace-tm .ace_constant {color: rgb(197, 6, 11);}.ace-tm .ace_constant.ace_buildin {color: rgb(88, 72, 246);}.ace-tm .ace_constant.ace_language {color: rgb(88, 92, 246);}.ace-tm .ace_constant.ace_library {color: rgb(6, 150, 14);}.ace-tm .ace_invalid {background-color: rgba(255, 0, 0, 0.1);color: red;}.ace-tm .ace_support.ace_function {color: rgb(60, 76, 114);}.ace-tm .ace_support.ace_constant {color: rgb(6, 150, 14);}.ace-tm .ace_support.ace_type,.ace-tm .ace_support.ace_class {color: rgb(109, 121, 222);}.ace-tm .ace_keyword.ace_operator {color: rgb(104, 118, 135);}.ace-tm .ace_string {color: rgb(3, 106, 7);}.ace-tm .ace_comment {color: rgb(76, 136, 107);}.ace-tm .ace_comment.ace_doc {color: rgb(0, 102, 255);}.ace-tm .ace_comment.ace_doc.ace_tag {color: rgb(128, 159, 191);}.ace-tm .ace_constant.ace_numeric {color: rgb(0, 0, 205);}.ace-tm .ace_variable {color: rgb(49, 132, 149);}.ace-tm .ace_xml-pe {color: rgb(104, 104, 91);}.ace-tm .ace_entity.ace_name.ace_function {color: #0000A2;}.ace-tm .ace_heading {color: rgb(12, 7, 255);}.ace-tm .ace_list {color:rgb(185, 6, 144);}.ace-tm .ace_meta.ace_tag {color:rgb(0, 22, 142);}.ace-tm .ace_string.ace_regex {color: rgb(255, 0, 0)}.ace-tm .ace_marker-layer .ace_selection {background: rgb(181, 213, 255);}.ace-tm.ace_multiselect .ace_selection.ace_start {box-shadow: 0 0 3px 0px white;}.ace-tm .ace_marker-layer .ace_step {background: rgb(252, 255, 0);}.ace-tm .ace_marker-layer .ace_stack {background: rgb(164, 229, 101);}.ace-tm .ace_marker-layer .ace_bracket {margin: -1px 0 0 -1px;border: 1px solid rgb(192, 192, 192);}.ace-tm .ace_marker-layer .ace_active-line {background: rgba(0, 0, 0, 0.07);}.ace-tm .ace_gutter-active-line {background-color : #dcdcdc;}.ace-tm .ace_marker-layer .ace_selected-word {background: rgb(250, 250, 255);border: 1px solid rgb(200, 200, 250);}.ace-tm .ace_indent-guide {background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;}';var r=e("../lib/dom");r.importCssString(t.cssText,t.cssClass)}),define("ace/line_widgets",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/range"],function(e,t,n){"use strict";function o(e){this.session=e,this.session.widgetManager=this,this.session.getRowLength=this.getRowLength,this.session.$getWidgetScreenLength=this.$getWidgetScreenLength,this.updateOnChange=this.updateOnChange.bind(this),this.renderWidgets=this.renderWidgets.bind(this),this.measureWidgets=this.measureWidgets.bind(this),this.session._changedWidgets=[],this.$onChangeEditor=this.$onChangeEditor.bind(this),this.session.on("change",this.updateOnChange),this.session.on("changeFold",this.updateOnFold),this.session.on("changeEditor",this.$onChangeEditor)}var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./range").Range;(function(){this.getRowLength=function(e){var t;return this.lineWidgets?t=this.lineWidgets[e]&&this.lineWidgets[e].rowCount||0:t=0,!this.$useWrapMode||!this.$wrapData[e]?1+t:this.$wrapData[e].length+1+t},this.$getWidgetScreenLength=function(){var e=0;return this.lineWidgets.forEach(function(t){t&&t.rowCount&&!t.hidden&&(e+=t.rowCount)}),e},this.$onChangeEditor=function(e){this.attach(e.editor)},this.attach=function(e){e&&e.widgetManager&&e.widgetManager!=this&&e.widgetManager.detach();if(this.editor==e)return;this.detach(),this.editor=e,e&&(e.widgetManager=this,e.renderer.on("beforeRender",this.measureWidgets),e.renderer.on("afterRender",this.renderWidgets))},this.detach=function(e){var t=this.editor;if(!t)return;this.editor=null,t.widgetManager=null,t.renderer.off("beforeRender",this.measureWidgets),t.renderer.off("afterRender",this.renderWidgets);var n=this.session.lineWidgets;n&&n.forEach(function(e){e&&e.el&&e.el.parentNode&&(e._inDocument=!1,e.el.parentNode.removeChild(e.el))})},this.updateOnFold=function(e,t){var n=t.lineWidgets;if(!n||!e.action)return;var r=e.data,i=r.start.row,s=r.end.row,o=e.action=="add";for(var u=i+1;u<s;u++)n[u]&&(n[u].hidden=o);n[s]&&(o?n[i]?n[s].hidden=o:n[i]=n[s]:(n[i]==n[s]&&(n[i]=undefined),n[s].hidden=o))},this.updateOnChange=function(e){var t=this.session.lineWidgets;if(!t)return;var n=e.start.row,r=e.end.row-n;if(r!==0)if(e.action=="remove"){var i=t.splice(n+1,r);i.forEach(function(e){e&&this.removeLineWidget(e)},this),this.$updateRows()}else{var s=new Array(r);s.unshift(n,0),t.splice.apply(t,s),this.$updateRows()}},this.$updateRows=function(){var e=this.session.lineWidgets;if(!e)return;var t=!0;e.forEach(function(e,n){if(e){t=!1,e.row=n;while(e.$oldWidget)e.$oldWidget.row=n,e=e.$oldWidget}}),t&&(this.session.lineWidgets=null)},this.addLineWidget=function(e){this.session.lineWidgets||(this.session.lineWidgets=new Array(this.session.getLength()));var t=this.session.lineWidgets[e.row];t&&(e.$oldWidget=t,t.el&&t.el.parentNode&&(t.el.parentNode.removeChild(t.el),t._inDocument=!1)),this.session.lineWidgets[e.row]=e,e.session=this.session;var n=this.editor.renderer;e.html&&!e.el&&(e.el=i.createElement("div"),e.el.innerHTML=e.html),e.el&&(i.addCssClass(e.el,"ace_lineWidgetContainer"),e.el.style.position="absolute",e.el.style.zIndex=5,n.container.appendChild(e.el),e._inDocument=!0),e.coverGutter||(e.el.style.zIndex=3),e.pixelHeight==null&&(e.pixelHeight=e.el.offsetHeight),e.rowCount==null&&(e.rowCount=e.pixelHeight/n.layerConfig.lineHeight);var r=this.session.getFoldAt(e.row,0);e.$fold=r;if(r){var s=this.session.lineWidgets;e.row==r.end.row&&!s[r.start.row]?s[r.start.row]=e:e.hidden=!0}return this.session._emit("changeFold",{data:{start:{row:e.row}}}),this.$updateRows(),this.renderWidgets(null,n),this.onWidgetChanged(e),e},this.removeLineWidget=function(e){e._inDocument=!1,e.session=null,e.el&&e.el.parentNode&&e.el.parentNode.removeChild(e.el);if(e.editor&&e.editor.destroy)try{e.editor.destroy()}catch(t){}if(this.session.lineWidgets){var n=this.session.lineWidgets[e.row];if(n==e)this.session.lineWidgets[e.row]=e.$oldWidget,e.$oldWidget&&this.onWidgetChanged(e.$oldWidget);else while(n){if(n.$oldWidget==e){n.$oldWidget=e.$oldWidget;break}n=n.$oldWidget}}this.session._emit("changeFold",{data:{start:{row:e.row}}}),this.$updateRows()},this.getWidgetsAtRow=function(e){var t=this.session.lineWidgets,n=t&&t[e],r=[];while(n)r.push(n),n=n.$oldWidget;return r},this.onWidgetChanged=function(e){this.session._changedWidgets.push(e),this.editor&&this.editor.renderer.updateFull()},this.measureWidgets=function(e,t){var n=this.session._changedWidgets,r=t.layerConfig;if(!n||!n.length)return;var i=Infinity;for(var s=0;s<n.length;s++){var o=n[s];if(!o||!o.el)continue;if(o.session!=this.session)continue;if(!o._inDocument){if(this.session.lineWidgets[o.row]!=o)continue;o._inDocument=!0,t.container.appendChild(o.el)}o.h=o.el.offsetHeight,o.fixedWidth||(o.w=o.el.offsetWidth,o.screenWidth=Math.ceil(o.w/r.characterWidth));var u=o.h/r.lineHeight;o.coverLine&&(u-=this.session.getRowLineCount(o.row),u<0&&(u=0)),o.rowCount!=u&&(o.rowCount=u,o.row<i&&(i=o.row))}i!=Infinity&&(this.session._emit("changeFold",{data:{start:{row:i}}}),this.session.lineWidgetWidth=null),this.session._changedWidgets=[]},this.renderWidgets=function(e,t){var n=t.layerConfig,r=this.session.lineWidgets;if(!r)return;var i=Math.min(this.firstRow,n.firstRow),s=Math.max(this.lastRow,n.lastRow,r.length);while(i>0&&!r[i])i--;this.firstRow=n.firstRow,this.lastRow=n.lastRow,t.$cursorLayer.config=n;for(var o=i;o<=s;o++){var u=r[o];if(!u||!u.el)continue;if(u.hidden){u.el.style.top=-100-(u.pixelHeight||0)+"px";continue}u._inDocument||(u._inDocument=!0,t.container.appendChild(u.el));var a=t.$cursorLayer.getPixelPosition({row:o,column:0},!0).top;u.coverLine||(a+=n.lineHeight*this.session.getRowLineCount(u.row)),u.el.style.top=a-n.offset+"px";var f=u.coverGutter?0:t.gutterWidth;u.fixedWidth||(f-=t.scrollLeft),u.el.style.left=f+"px",u.fullWidth&&u.screenWidth&&(u.el.style.minWidth=n.width+2*n.padding+"px"),u.fixedWidth?u.el.style.right=t.scrollBar.getWidth()+"px":u.el.style.right=""}}}).call(o.prototype),t.LineWidgets=o}),define("ace/ext/error_marker",["require","exports","module","ace/line_widgets","ace/lib/dom","ace/range"],function(e,t,n){"use strict";function o(e,t,n){var r=0,i=e.length-1;while(r<=i){var s=r+i>>1,o=n(t,e[s]);if(o>0)r=s+1;else{if(!(o<0))return s;i=s-1}}return-(r+1)}function u(e,t,n){var r=e.getAnnotations().sort(s.comparePoints);if(!r.length)return;var i=o(r,{row:t,column:-1},s.comparePoints);i<0&&(i=-i-1),i>=r.length?i=n>0?0:r.length-1:i===0&&n<0&&(i=r.length-1);var u=r[i];if(!u||!n)return;if(u.row===t){do u=r[i+=n];while(u&&u.row===t);if(!u)return r.slice()}var a=[];t=u.row;do a[n<0?"unshift":"push"](u),u=r[i+=n];while(u&&u.row==t);return a.length&&a}var r=e("../line_widgets").LineWidgets,i=e("../lib/dom"),s=e("../range").Range;t.showErrorMarker=function(e,t){var n=e.session;n.widgetManager||(n.widgetManager=new r(n),n.widgetManager.attach(e));var s=e.getCursorPosition(),o=s.row,a=n.widgetManager.getWidgetsAtRow(o).filter(function(e){return e.type=="errorMarker"})[0];a?a.destroy():o-=t;var f=u(n,o,t),l;if(f){var c=f[0];s.column=(c.pos&&typeof c.column!="number"?c.pos.sc:c.column)||0,s.row=c.row,l=e.renderer.$gutterLayer.$annotations[s.row]}else{if(a)return;l={text:["Looks good!"],className:"ace_ok"}}e.session.unfold(s.row),e.selection.moveToPosition(s);var h={row:s.row,fixedWidth:!0,coverGutter:!0,el:i.createElement("div"),type:"errorMarker"},p=h.el.appendChild(i.createElement("div")),d=h.el.appendChild(i.createElement("div"));d.className="error_widget_arrow "+l.className;var v=e.renderer.$cursorLayer.getPixelPosition(s).left;d.style.left=v+e.renderer.gutterWidth-5+"px",h.el.className="error_widget_wrapper",p.className="error_widget "+l.className,p.innerHTML=l.text.join("<br>"),p.appendChild(i.createElement("div"));var m=function(e,t,n){if(t===0&&(n==="esc"||n==="return"))return h.destroy(),{command:"null"}};h.destroy=function(){if(e.$mouseHandler.isMousePressed)return;e.keyBinding.removeKeyboardHandler(m),n.widgetManager.removeLineWidget(h),e.off("changeSelection",h.destroy),e.off("changeSession",h.destroy),e.off("mouseup",h.destroy),e.off("change",h.destroy)},e.keyBinding.addKeyboardHandler(m),e.on("changeSelection",h.destroy),e.on("changeSession",h.destroy),e.on("mouseup",h.destroy),e.on("change",h.destroy),e.session.widgetManager.addLineWidget(h),h.el.onmousedown=e.focus.bind(e),e.renderer.scrollCursorIntoView(null,.5,{bottom:h.el.offsetHeight})},i.importCssString("    .error_widget_wrapper {        background: inherit;        color: inherit;        border:none    }    .error_widget {        border-top: solid 2px;        border-bottom: solid 2px;        margin: 5px 0;        padding: 10px 40px;        white-space: pre-wrap;    }    .error_widget.ace_error, .error_widget_arrow.ace_error{        border-color: #ff5a5a    }    .error_widget.ace_warning, .error_widget_arrow.ace_warning{        border-color: #F1D817    }    .error_widget.ace_info, .error_widget_arrow.ace_info{        border-color: #5a5a5a    }    .error_widget.ace_ok, .error_widget_arrow.ace_ok{        border-color: #5aaa5a    }    .error_widget_arrow {        position: absolute;        border: solid 5px;        border-top-color: transparent!important;        border-right-color: transparent!important;        border-left-color: transparent!important;        top: -5px;    }","")}),define("ace/ace",["require","exports","module","ace/lib/fixoldbrowsers","ace/lib/dom","ace/lib/event","ace/editor","ace/edit_session","ace/undomanager","ace/virtual_renderer","ace/worker/worker_client","ace/keyboard/hash_handler","ace/placeholder","ace/multi_select","ace/mode/folding/fold_mode","ace/theme/textmate","ace/ext/error_marker","ace/config"],function(e,t,n){"use strict";e("./lib/fixoldbrowsers");var r=e("./lib/dom"),i=e("./lib/event"),s=e("./editor").Editor,o=e("./edit_session").EditSession,u=e("./undomanager").UndoManager,a=e("./virtual_renderer").VirtualRenderer;e("./worker/worker_client"),e("./keyboard/hash_handler"),e("./placeholder"),e("./multi_select"),e("./mode/folding/fold_mode"),e("./theme/textmate"),e("./ext/error_marker"),t.config=e("./config"),t.require=e,typeof define=="function"&&(t.define=define),t.edit=function(e){if(typeof e=="string"){var n=e;e=document.getElementById(n);if(!e)throw new Error("ace.edit can't find div #"+n)}if(e&&e.env&&e.env.editor instanceof s)return e.env.editor;var o="";if(e&&/input|textarea/i.test(e.tagName)){var u=e;o=u.value,e=r.createElement("pre"),u.parentNode.replaceChild(e,u)}else e&&(o=r.getInnerText(e),e.innerHTML="");var f=t.createEditSession(o),l=new s(new a(e));l.setSession(f);var c={document:f,editor:l,onResize:l.resize.bind(l,null)};return u&&(c.textarea=u),i.addListener(window,"resize",c.onResize),l.on("destroy",function(){i.removeListener(window,"resize",c.onResize),c.editor.container.env=null}),l.container.env=l.env=c,l},t.createEditSession=function(e,t){var n=new o(e,t);return n.setUndoManager(new u),n},t.EditSession=o,t.UndoManager=u,t.version="1.2.9"});
            (function() {
                window.require(["ace/ace"], function(a) {
                    if (a) {
                        a.config.init(true);
                        a.define = window.define;
                    }
                    if (!window.ace)
                        window.ace = a;
                    for (var key in a) if (a.hasOwnProperty(key))
                        window.ace[key] = a[key];
                });
            })();


// autocomplete example http://plnkr.co/edit/6MVntVmXYUbjR0DI82Cr?p=preview
;
Ractive.components['ace'] = Ractive.extend({
	template: "<div style='{{style}}' class='{{class}}'></div>",
	isolated: true,
	data: {
		style: "height:100%",
		value: "",
		mode: "html",
		theme: null
	},
	oncomplete: function () {
		var self = this
		var div = this.find('div')
		var updating = false; // a flag to avoid recursive calls between ace and the change observer
		var editor = ace.edit(div);
		editor.$blockScrolling = Infinity;

		editor.getSession().on('change', function() {
			if( updating )
				return
			updating = true
			self.set('value', editor.getValue())
			updating = false
		})

		this.observe('value', function(val, old, kp) {
			if( updating )
				return
			updating = true
			if( !val && typeof(val) !== 'string' )
				val = ''
			editor.setValue( val, -1 )
			updating = false
		})

		this.observe('mode', function(val, old, kp) {
			if(val)
				editor.getSession().setMode( "ace/mode/" + val);
		})
		this.observe('theme', function(val, old, kp) {
			if(val)
				editor.setTheme("ace/theme/" + val);
			else
				editor.setTheme(null)
		})
	}
})



define(
	"ace/mode/sql_highlight_rules",
	[	"require",
		"exports",
		"module",
		"ace/lib/oop",
		"ace/mode/text_highlight_rules"
	],
	function(e,t,n){
		"use strict";
		var r=e("../lib/oop"),
			i=e("./text_highlight_rules").TextHighlightRules,
			s=function(){
				var e="scan|select|insert|update|delete|from|where|and|or|group|by|order|limit|offset|having|as|case|when|else|end|type|left|right|join|on|outer|desc|asc|union|create|table|primary|key|if|foreign|not|references|default|null|inner|cross|natural|database|drop|grant",
					t="true|false",
					n="avg|count|first|last|max|min|sum|ucase|lcase|mid|len|round|rank|now|format|coalesce|ifnull|isnull|nvl",
					r="int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|money|real|number|integer",
					i=this.createKeywordMapper({
						"support.function":n,
						keyword:e,
						"constant.language":t,
						"storage.type":r
					},"identifier",!0);

				this.$rules={
					start:[
						{token:"comment",regex:"--.*$"},
						{token:"comment",start:"/\\*",end:"\\*/"},
						{token:"string",regex:'".*?"'},
						{token:"string",regex:"'.*?'"},
						{token:"string",regex:"`.*?`"},
						{token:"constant.numeric",regex:"[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"},
						{token:i,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},
						{token:"keyword.operator",regex:"\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="},
						{token:"paren.lparen",regex:"[\\(]"},{token:"paren.rparen",regex:"[\\)]"},
						{token:"text",regex:"\\s+"}]
				},
				this.normalizeRules()};r.inherits(s,i),t.SqlHighlightRules=s}),define("ace/mode/sql",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/sql_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text").Mode,s=e("./sql_highlight_rules").SqlHighlightRules,o=function(){this.HighlightRules=s,this.$behaviour=this.$defaultBehaviour};r.inherits(o,i),function(){this.lineCommentStart="--",this.$id="ace/mode/sql"}.call(o.prototype),t.Mode=o})

define(
	"ace/theme/custom",
	[
		"require",
		"exports",
		"module",
		"ace/lib/dom"
	],
	function(e,t,n){
		t.isDark=!0,
		t.cssClass="ace-custom",
		t.cssText="\
			.ace-custom .ace_gutter {background: #424242;color: #8F938F}\
			.ace-custom .ace_print-margin {width: 0px;background: #353030}\
			.ace-custom {background-color: #474747;color: #8F938F}\
			.ace-custom .ace_cursor {color: #A7A7A7}\
			.ace-custom .ace_marker-layer .ace_selection {background: rgba(221, 240, 255, 0.20)}\
			.ace-custom.ace_multiselect .ace_selection.ace_start {box-shadow: 0 0 3px 0px #2C2828;}\
			.ace-custom .ace_marker-layer .ace_step {background: rgb(102, 82, 0)}\
			.ace-custom .ace_marker-layer .ace_bracket {margin: -1px 0 0 -1px;border: 1px solid rgba(255, 255, 255, 0.25)}\
			.ace-custom .ace_marker-layer .ace_active-line {/*background: rgba(255, 255, 255, 0.031)*/}\
			.ace-custom .ace_gutter-active-line {/*background-color: rgba(255, 255, 255, 0.031)*/}\
			.ace-custom .ace_marker-layer .ace_selected-word {border: 1px solid rgba(221, 240, 255, 0.20)}\
			.ace-custom .ace_invisible {color: rgba(255, 255, 255, 0.25)}\
			.ace-custom .ace_keyword,\
			.ace-custom .ace_meta {color: #757aD8}\
			.ace-custom .ace_constant,\
			.ace-custom .ace_constant.ace_character,\
			.ace-custom .ace_constant.ace_character.ace_escape,\
			.ace-custom .ace_constant.ace_other {color: #4FB7C5}\
			.ace-custom .ace_keyword.ace_operator {color: #797878}\
			.ace-custom .ace_constant.ace_character {color: #AFA472}\
			.ace-custom .ace_constant.ace_language {color: #DE8E30}\
			.ace-custom .ace_constant.ace_numeric {color: #CCCCCC}\
			.ace-custom .ace_invalid,\
			.ace-custom .ace_invalid.ace_illegal {color: #F8F8F8;background-color: rgba(86, 45, 86, 0.75)}\
			.ace-custom .ace_invalid.ace_deprecated {text-decoration: underline;font-style: italic;color: #D2A8A1}\
			.ace-custom .ace_fold {background-color: #757aD8;border-color: #8F938F}\
			.ace-custom .ace_support.ace_function {color: #AEB2F8}\
			.ace-custom .ace_string {color: #66A968}\
			.ace-custom .ace_string.ace_regexp {color: #E9C062}\
			.ace-custom .ace_comment {color: #A6C6FF}\
			.ace-custom .ace_variable {color: #BEBF55}\
			.ace-custom .ace_variable.ace_language {color: #C1C144}\
			.ace-custom .ace_xml-pe {color: #494949}\
			.ace-custom .ace_indent-guide {background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQImWNgYGBgYIiPj/8PAARgAh2NTMh8AAAAAElFTkSuQmCC) right repeat-y}\
		";var r=e("../lib/dom");r.importCssString(t.cssText,t.cssClass)})
