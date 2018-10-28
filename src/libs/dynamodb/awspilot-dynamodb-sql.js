(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value)) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":3,"ieee754":4}],3:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],4:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],5:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":6}],6:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],7:[function(require,module,exports){
window['@awspilot/dynamodb-sql'] = require('./lib/dynamodb')

},{"./lib/dynamodb":8}],8:[function(require,module,exports){
(function (global){
'use strict';
var AWS = (typeof window !== "undefined" ? window['AWS'] : typeof global !== "undefined" ? global['AWS'] : null)



var dynamo_parser = require('./parser.min.js');
function extend (a,b){
	if(typeof a == 'undefined') a = {};
	for(var key in b) {
		if(b.hasOwnProperty(key)) {
			a[key] = b[key]
		}
	}
	return a;
};
dynamo_parser.parser.yy.extend = extend
var extract_value = function(v) {
	return (
		v.type === 'string' ?
		eval(v.string)
		:
		(
			v.type === 'number' ?
			parseInt(v.number)
			:
			v.type === 'boolean' ?
				v.value
				:
				undefined // unhandled
		)
	)
}


function SyntaxException(message){
	this.message = 'You have an error in your SQL syntax: ' + message;
	this.code = 'syntax_error'
}





function DynamoSQL ( $config ) {
	this.events = {
		error: function() {},
		beforeRequest: function() {}
	}
	if ($config instanceof AWS.DynamoDB) {
		this.client = $config
	} else {
		if ($config)
			this.client = new AWS.DynamoDB($config)
		else
			this.client = new AWS.DynamoDB()
	}
	this.db = require('@awspilot/dynamodb')(this.client)
}

DynamoSQL.prototype.query = function($query, $replaces, cb ) {
	var $cb = typeof cb === "function" ? cb : (typeof $replaces === "function" ? $replaces : function(err, data ) { console.log( err, data ) })
	var sqp
	try {
		sqp = dynamo_parser.parse( $query );
	} catch(e){
		return $cb(e)
	}

	if (global.DDBSQL === true )
		console.log("sqp=", JSON.stringify(sqp, null, "\t"))

	if (sqp.length > 1)
		return $cb( new SyntaxException('[AWSPILOT] Multiple queries not supported, yet!') )

	sqp = sqp[0];



	switch (sqp.statement) {
		case 'SHOW_TABLES':
			var $parsed = {}
			this.db.client.listTables({}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb(null, data)
			} )
			break
		case 'DESCRIBE_TABLE':
			var $parsed = {
				tableName: sqp.dynamodb.TableName,
			}
			this.db.client.describeTable({TableName: $parsed.tableName}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'DROP_TABLE':
			var $parsed = sqp.dynamodb
			this.db.client.deleteTable({TableName: $parsed.TableName}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'DROP_INDEX':
			var $parsed = sqp.dynamodb;

			this.db.client.updateTable($parsed, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'INSERT':
			var $parsed = {
				TableName: sqp.dynamodb.TableName,
				KV: sqp.dynamodb.set,
			}
			this.db.table($parsed.TableName).insert( $parsed.KV, $cb )
			break
		case 'UPDATE':
			var $parsed = {
				TableName: sqp.dynamodb.TableName,
				KV: sqp.dynamodb.set,
				WHERE: sqp.dynamodb.where,
			}

			var $db = this.db.table($parsed.TableName)
			$parsed.WHERE.map(function(w) {
				$db.where(w.k).eq(w.v)
			})
			var $update = {}

			var $this = this
			$parsed.KV.map(function(set) {
				if (set.op === '+=') {
					$update[set.k] = $this.db.add(set.v )
				} else if (set.op === 'delete') {
					$update[set.k] = $this.db.del( )
				} else {
					$update[set.k] = set.v
				}

			})
			
			$db.update($update, $cb)
			break;
		case 'REPLACE':
			var $parsed = {
				TableName: sqp.dynamodb.TableName,
				KV: sqp.dynamodb.set,
			}
			var $db = this.db.table($parsed.TableName)
			$db.insert_or_replace($parsed.KV, $cb)
			break;
		case 'DELETE':
			var $parsed = {
				tableName: sqp.dynamodb.TableName,
				WHERE: sqp.dynamodb.where,
			}
			var $db = this.db.table($parsed.tableName)
			$db.return(this.db.ALL_OLD)
			$parsed.WHERE.map(function(w) {
				$db.where(w.k).eq(w.v)
			})
			$db.delete( $cb )
			break
		case 'SELECT':


			if (sqp.dynamodb.from.length > 1)
				return $cb( new SyntaxException('[AWSPILOT] Select from multiple tables not supported') )

			var $parsed = {
				tableName: sqp.dynamodb.from[0].table,
				WHERE: {},
				FIELDS: null,
				FILTER: {},
				CONSISTENT_READ: false,
			}

			if (!sqp.dynamodb.where)
				return $cb( new SyntaxException('[AWSPILOT] Expected WHERE in SELECT, Please use SCAN statement instead') )

			if ( sqp.dynamodb.index )
				$parsed.indexName = sqp.dynamodb.index

			var w = sqp.dynamodb.where



			switch (w.op) {
				case '=':
					// WHERE a = 'a'
					if (!w.left.column)
						return $cb( new SyntaxException('[AWSPILOT] Left side assignment in WHERE needs to be a column') )

					$parsed.WHERE[ w.left.column ] = {
						op: w.op,
						value: extract_value(w.right),
					}
					break;
				case 'AND':
					// WHERE a = 'a' and b OP 'b'

					// at least one of left.op or right.op must be '=' because hash requires =
					if ([w.left.op, w.right.op].indexOf('=') === -1 )
						return $cb( new SyntaxException('[AWSPILOT] Expected at least one of operators in WHERE to be \'=\' ') )

					var and1 = w.left.op === '=' ? w.left : w.right
					$parsed.WHERE[ and1.left.column ] = {
						op: and1.op,
						value: extract_value(and1.right),
					}


					var and2 = w.left.op === '=' ? w.right : w.left
					switch ( and2.op ) {
			 			case '=':
						case '>':
						case '>=':
						case '<':
						case '<=':

							$parsed.WHERE[ and2.left.column ] = {
								op: and2.op,
								value: extract_value(and2.right),
							}
							break;
						case 'BETWEEN':

							$parsed.WHERE[ and2.left.column ] = {
								op: 'between',
								value: [
									extract_value(and2.right.left),
									extract_value(and2.right.right)
								]
							}
							break;
						case 'LIKE':
							if (and2.right.type !== 'string')
								return $cb( new SyntaxException( "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' " ) )

							if (eval(and2.right.string).substr(-1) !== '%')
								return $cb( new SyntaxException( "[AWSPILOT] Unsupported LIKE 'text', text must end in % " ) )

							$parsed.WHERE[ and2.left.column ] = {
								op: 'begins_with',
								value: eval(and2.right.string).slice(0,-1),
							}
							break;
						default:
							return $cb( new SyntaxException( "[AWSPILOT] Unexpected operation for key ( " + and2.left.column + " ) in WHERE, expected one of =, >, >=, <, <=, BETWEEN, LIKE  " ) )
					}
					break;
				case '>':
				case '>=':
				case '<':
				case '<=':
				case '!=':
				case 'like':
					return $cb( new SyntaxException( "[AWSPILOT] Expected '$KEY = ' in WHERE, found '" + w.left.column + " " + w.op + " '  instead " ) )
					break;
				case 'or':
					return $cb( new SyntaxException( "[AWSPILOT] 'OR' not supported in WHERE, use HAVING to filter results" ) )
				default:
					return $cb( new SyntaxException( '[AWSPILOT] Unhandled operation ' + w.op ) ) // there is only one op and is not '='
			}

			if ( sqp.dynamodb.limit )
				$parsed.LIMIT = parseInt(sqp.dynamodb.limit)

			if ( sqp.dynamodb.sort === 'DESC' )
				$parsed.DESC = true

			// there is always at least 1 element, the *
			// make sure we dont have no SELECT *, field
			if (sqp.dynamodb.columns.length > 1 ) {
				
				if (sqp.dynamodb.columns.map(function(c) { return c.type }).indexOf('star') !== -1)
					return $cb( new SyntaxException(  "[AWSPILOT] you can not have both * and column names in SELECT" ) )
			}
			sqp.dynamodb.columns = sqp.dynamodb.columns.filter(function(c) { return c.type !== 'star'})

			if (sqp.dynamodb.columns.filter(function(c) { return c.hasOwnProperty('alias') }).length)
				return $cb( new SyntaxException(  "[AWSPILOT] 'SELECT field AS alias' not supported, yet!" ) )


			// after removing *, handle remaining fields
			if (sqp.dynamodb.columns.length) {
				$parsed.FIELDS = sqp.dynamodb.columns.map(function(c) { 
					return c.column 
				})
			}


			if (sqp.dynamodb.consistent_read === true)
				$parsed.CONSISTENT_READ = true


			// FILTER
			if (sqp.dynamodb.having) {
				var h = sqp.dynamodb.having
				switch (h.op) {
					case 'LIKE':
						if (h.right.type !== 'string')
							return $cb( new SyntaxException( "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' " ) )

						if (eval(h.right.string).substr(-1) !== '%')
							return $cb( new SyntaxException( "[AWSPILOT] Unsupported LIKE 'text', text must end in % " ) )

						$parsed.FILTER[ h.left.column ] = {
							op: 'begins_with',
							value: eval(h.right.string).slice(0,-1),
						}
						break;
					case 'CONTAINS':
						
						//if (h.right.type !== 'string')
						//	throw "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' "

						$parsed.FILTER[ h.left.column ] = {
							op: 'contains',
							value: extract_value(h.right),
						}
						break;
					case 'BETWEEN':

						$parsed.FILTER[ h.left.column ] = {
							op: 'between',
							value: [
								extract_value(h.right.left),
								extract_value(h.right.right)
							]
						}
						break;

					case '=':
					case '>':
					case '>=':
					case '<':
					case '<=':
					case '!=':

					
						if (!h.left.column)
							return $cb(  new SyntaxException('[AWSPILOT] Left side assignment in HAVING needs to be a column') )

						$parsed.FILTER[ h.left.column ] = {
							op: h.op,
							value: extract_value(h.right)
						}
						break;
					case 'OR':
						return $cb( new SyntaxException( "[AWSPILOT] 'OR' not supported in HAVING, yet!" ) )
						break;
					
					case 'AND':
						return $cb( new SyntaxException( "[AWSPILOT] 'AND' not supported in HAVING, yet!" ) )
						break;

					default:
						return $cb( new SyntaxException( '[AWSPILOT] Unhandled operation ' + w.op ) )// there is only one op and is not '='
					
				}

			}

			
			if (global.DDBSQL === true )
				console.log("[AWSPILOT] parsed=", JSON.stringify($parsed,null,"\t"))









			var $db = this.db.table($parsed.tableName)
			if ($parsed.hasOwnProperty('indexName'))
				$db.index($parsed.indexName)

			Object.keys($parsed.WHERE).map(function(k) {
				switch ($parsed.WHERE[k].op) {
					case '=' : $db.where(k).eq($parsed.WHERE[k].value); break;
					case '>' : $db.where(k).gt($parsed.WHERE[k].value); break;
					case '<' : $db.where(k).lt($parsed.WHERE[k].value); break;
					case '>=': $db.where(k).ge($parsed.WHERE[k].value); break;
					case '<=': $db.where(k).le($parsed.WHERE[k].value); break;
					
					case 'begins_with' : $db.where(k).begins_with($parsed.WHERE[k].value); break;
					case 'between': $db.where(k).between($parsed.WHERE[k].value[0],$parsed.WHERE[k].value[1]); break;
				}
			})
			if ($parsed.hasOwnProperty('FILTER')) {
				
				Object.keys($parsed.FILTER).map(function(k) {
					switch ($parsed.FILTER[k].op) {
						case '=' : $db.filter(k).eq($parsed.FILTER[k].value); break;
						case '>' : $db.filter(k).gt($parsed.FILTER[k].value); break;
						case '<' : $db.filter(k).lt($parsed.FILTER[k].value); break;
						case '>=': $db.filter(k).ge($parsed.FILTER[k].value); break;
						case '<=': $db.filter(k).le($parsed.FILTER[k].value); break;

						case 'begins_with' : $db.filter(k).begins_with($parsed.FILTER[k].value); break;
						case 'between':      $db.filter(k).between($parsed.FILTER[k].value[0],$parsed.FILTER[k].value[1]); break;
						case 'contains' :    $db.filter(k).contains($parsed.FILTER[k].value); break;
					}
				})
			}
			if ($parsed.hasOwnProperty('DESC') && $parsed.DESC )
				$db.descending()

			if ($parsed.hasOwnProperty('LIMIT'))
				$db.limit($parsed.LIMIT)

			if ( $parsed.CONSISTENT_READ === true )
				$db.consistent_read()

			if ($parsed.FIELDS !== null ) {
				$parsed.FIELDS.map(function(f) {
					$db.addSelect(f)
				})
			}

			//this.db.on('beforeRequest', function(op, payload) {
			//	console.log(op, JSON.stringify(payload,null,"\t"))
			//})

			$db.query( $cb )
			break

		case 'SCAN':


			var $parsed = {
				TableName: sqp.dynamodb.TableName,
				FIELDS: null,
				FILTER: {},
				CONSISTENT_READ: false,
			}
			if ( sqp.dynamodb.index )
				$parsed.indexName = sqp.dynamodb.index

			if ( sqp.dynamodb.limit )
				$parsed.LIMIT = parseInt(sqp.dynamodb.limit)

			// there is always at least 1 element, the *
			// make sure we dont have no SELECT *, field

			if (sqp.dynamodb.columns.length > 1 ) {
				if (sqp.dynamodb.columns.map(function(c) { return c.type }).indexOf('star') !== -1)
					return $cb(  new SyntaxException( "[AWSPILOT] you can not have both * and column names in SCAN" ) )
			}

			sqp.dynamodb.columns = sqp.dynamodb.columns.filter(function(c) { return c.type !== 'star'})

			if (sqp.dynamodb.columns.filter(function(c) { return c.hasOwnProperty('alias') }).length)
				return $cb(  new SyntaxException( "[AWSPILOT] 'SCAN field AS alias' not supported, yet!" ) )

			// after removing *, handle remaining fields
			if (sqp.dynamodb.columns.length) {
				$parsed.FIELDS = sqp.dynamodb.columns.map(function(c) { 
					return c.column 
				})
			}

			if (sqp.dynamodb.consistent_read === true)
				$parsed.CONSISTENT_READ = true

			// FILTER
			if (sqp.dynamodb.having) {
				var h = sqp.dynamodb.having
				switch (h.op) {
					case 'LIKE':
						if (h.right.type !== 'string')
							return $cb(  new SyntaxException( "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' " ) )

						if (eval(h.right.string).substr(-1) !== '%')
							return $cb(  new SyntaxException( "[AWSPILOT] Unsupported LIKE 'text', text must end in % " ) )

						$parsed.FILTER[ h.left.column ] = {
							op: 'begins_with',
							value: eval(h.right.string).slice(0,-1),
						}
						break;
					case 'CONTAINS':
						
						//if (h.right.type !== 'string')
						//	throw "[AWSPILOT] Unsupported LIKE, must use LIKE 'text' "

						$parsed.FILTER[ h.left.column ] = {
							op: 'contains',
							value: extract_value(h.right),
						}
						break;
					case 'BETWEEN':

						$parsed.FILTER[ h.left.column ] = {
							op: 'between',
							value: [
								extract_value(h.right.left),
								extract_value(h.right.right)
							]
						}
						break;

					case '=':
					case '>':
					case '>=':
					case '<':
					case '<=':
					case '!=':

					
						if (!h.left.column)
							return $cb( new SyntaxException('[AWSPILOT] Left side assignment in HAVING needs to be a column') )

						$parsed.FILTER[ h.left.column ] = {
							op: h.op,
							value: extract_value(h.right)
						}
						break;
					case 'OR':
						return $cb(  new SyntaxException( "[AWSPILOT] 'OR' not supported in HAVING, yet!" ) )
						break;
					
					case 'AND':
						return $cb(  new SyntaxException( "[AWSPILOT] 'AND' not supported in HAVING, yet!" ) )
						break;

					default:
						return $cb(  new SyntaxException( '[AWSPILOT] Unhandled operation ' + w.op ) ) // there is only one op and is not '='
					
				}

			}

			
			if (global.DDBSQL === true )
				console.log("[AWSPILOT] parsed=", JSON.stringify($parsed,null,"\t"))

			var $db = this.db.table($parsed.TableName)

			if ($parsed.hasOwnProperty('indexName'))
				$db.index($parsed.indexName)

			if ($parsed.FIELDS !== null ) {
				$parsed.FIELDS.map(function(f) {
					$db.addSelect(f)
				})
			}
			


			if ($parsed.hasOwnProperty('FILTER')) {
				
				Object.keys($parsed.FILTER).map(function(k) {
					switch ($parsed.FILTER[k].op) {
						case '=' : $db.filter(k).eq($parsed.FILTER[k].value); break;
						case '>' : $db.filter(k).gt($parsed.FILTER[k].value); break;
						case '<' : $db.filter(k).lt($parsed.FILTER[k].value); break;
						case '>=': $db.filter(k).ge($parsed.FILTER[k].value); break;
						case '<=': $db.filter(k).le($parsed.FILTER[k].value); break;

						case 'begins_with' : $db.filter(k).begins_with($parsed.FILTER[k].value); break;
						case 'between':      $db.filter(k).between($parsed.FILTER[k].value[0],$parsed.FILTER[k].value[1]); break;
						case 'contains' :    $db.filter(k).contains($parsed.FILTER[k].value); break;
					}
				})
			}

			if ($parsed.hasOwnProperty('DESC') && $parsed.DESC )
				$db.descending()

			if ($parsed.hasOwnProperty('LIMIT'))
				$db.limit($parsed.LIMIT)

			if ( $parsed.CONSISTENT_READ === true )
				$db.consistent_read()

			//this.db.on('beforeRequest', function(op, payload) {
			//	console.log(op, JSON.stringify(payload,null,"\t"))
			//})

			$db.scan( $cb )
			break

		case 'CREATE_TABLE':
			var $parsed = {
				TableName: sqp.dynamodb.TableName,
				KeySchema: sqp.dynamodb.KeySchema,
				AttributeDefinitions: sqp.dynamodb.AttributeDefinitions,
				LocalSecondaryIndexes: sqp.dynamodb.LocalSecondaryIndexes,
				GlobalSecondaryIndexes: sqp.dynamodb.GlobalSecondaryIndexes,
				ProvisionedThroughput: sqp.dynamodb.ProvisionedThroughput,
			}
			this.db.client.createTable($parsed, $cb )
			break;
		default:
			return cb({
				errorCode: 'UNKNOWN_QUERY_TYPE'
			})
			break;
	}
}

DynamoSQL.prototype.prepare = function() {

}
DynamoSQL.prototype.execute = function() {

}


module.exports = function ( $config ) {
	return new DynamoSQL($config)
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./parser.min.js":9,"@awspilot/dynamodb":10}],9:[function(require,module,exports){
(function (process){
var parser=function(){var o=function(k,v,o,l){for(o=o||{},l=k.length;l--;o[k[l]]=v);return o},$V0=[1,16],$V1=[1,17],$V2=[1,18],$V3=[1,19],$V4=[1,25],$V5=[1,20],$V6=[1,21],$V7=[1,22],$V8=[1,23],$V9=[1,26],$Va=[5,6],$Vb=[5,6,82,84],$Vc=[1,34],$Vd=[1,35],$Ve=[5,6,84],$Vf=[20,21,90],$Vg=[1,50],$Vh=[5,6,23,28,49,56,59,62,65,68,70,75,82,83,84,91,96,101,105,106,107,108,109,110,112,113,116,120,123,125,134,139],$Vi=[1,67],$Vj=[1,70],$Vk=[49,75],$Vl=[5,6,65,82,83,84,96,101],$Vm=[5,6,49,65,75,82,83,84,96,101],$Vn=[49,65],$Vo=[5,6,65,82,83,84,101],$Vp=[5,6,82,84,101],$Vq=[5,6,49],$Vr=[1,135],$Vs=[1,133],$Vt=[1,134],$Vu=[1,136],$Vv=[1,137],$Vw=[1,138],$Vx=[1,140],$Vy=[1,139],$Vz=[5,6,82,83,84,101],$VA=[5,6,48,49,54,65,70],$VB=[5,6,48,49,54,65],$VC=[49,54],$VD=[2,52],$VE=[1,169],$VF=[1,170],$VG=[48,49],$VH=[2,42],$VI=[5,6,82,83,84],$VJ=[1,200],$VK=[1,201],$VL=[1,202],$VM=[1,196],$VN=[1,211],$VO=[1,212],$VP=[1,209],$VQ=[5,6,70],$VR=[1,230],$VS=[1,234],$VT=[1,232],$VU=[1,235],$VV=[1,236],$VW=[1,237],$VX=[1,238],$VY=[1,239],$VZ=[1,240],$V_=[5,6,62,70,82,83,84,101,105,106,107,108,109,110,112],$V$=[5,6,62,70,82,83,84,101,105,106,107,108,109,110,112,113],$V01=[1,243],$V11=[1,241],$V21=[1,244],$V31=[1,245],$V41=[1,246],$V51=[1,247],$V61=[1,248],$V71=[1,249],$V81=[1,250],$V91=[5,6,62,70,82,84,105,106,107,108,109,110,112,113],$Va1=[5,6,62,70,82,83,84,105,106,107,108,109,110,112,113],$Vb1=[1,274],$Vc1=[1,278],$Vd1=[1,276],$Ve1=[1,279],$Vf1=[1,280],$Vg1=[1,281],$Vh1=[1,282],$Vi1=[1,283],$Vj1=[1,284],$Vk1=[1,285],$Vl1=[49,120],$Vm1=[2,176],$Vn1=[1,336],$Vo1=[2,178],$Vp1=[1,349],$Vq1=[49,120,129];var parser={trace:function trace(){},yy:{},symbols_:{error:2,main:3,sql_stmt_list:4,EOF:5,SEMICOLON:6,sql_stmt:7,select_stmt:8,insert_stmt:9,update_stmt:10,replace_stmt:11,delete_stmt:12,create_table_stmt:13,show_tables_stmt:14,drop_table_stmt:15,describe_table_stmt:16,drop_index_stmt:17,scan_stmt:18,name:19,LITERAL:20,BRALITERAL:21,database_table_name:22,DOT:23,dynamodb_table_name:24,database_index_name:25,dynamodb_index_name:26,signed_number:27,NUMBER:28,string_literal:29,SINGLE_QUOTED_STRING:30,DOUBLE_QUOTED_STRING:31,XSTRING:32,literal_value:33,"boolean":34,TRUE:35,FALSE:36,boolean_value:37,dynamodb_data_string:38,dynamodb_data_number:39,dynamodb_data_boolean:40,dynamodb_data_null:41,NULL:42,dynamodb_data_undefined:43,UNDEFINED:44,dynamodb_data_array:45,ARRAYLPAR:46,array_list:47,ARRAYRPAR:48,COMMA:49,array_value:50,dynamodb_data_json:51,JSONLPAR:52,dynamodb_data_json_list:53,JSONRPAR:54,dynamodb_data_json_kv:55,COLON:56,INSERT:57,INTO:58,SET:59,def_insert_columns:60,def_insert_onecolumn:61,EQ:62,UPDATE:63,def_update_columns:64,WHERE:65,def_update_where:66,def_update_onecolumn:67,PLUSEQ:68,def_update_where_cond:69,AND:70,REPLACE:71,def_replace_columns:72,def_replace_onecolumn:73,DELETE:74,FROM:75,def_delete_where:76,def_delete_where_cond:77,def_select:78,sort_clause:79,limit_clause:80,def_consistent_read:81,LIMIT:82,DESC:83,CONSISTENT_READ:84,distinct_all:85,DISTINCT:86,ALL:87,def_select_columns:88,def_select_onecolumn:89,STAR:90,AS:91,join_clause:92,table_or_subquery:93,from:94,use_index:95,USE:96,INDEX:97,def_where:98,where_expr:99,def_having:100,HAVING:101,having_expr:102,SELECT:103,bind_parameter:104,OR:105,GT:106,GE:107,LT:108,LE:109,BETWEEN:110,where_between:111,LIKE:112,CONTAINS:113,CREATE:114,TABLE:115,LPAR:116,def_ct_typedef_list:117,def_ct_pk:118,def_ct_indexes:119,RPAR:120,def_ct_index_list:121,def_ct_index:122,LSI:123,def_ct_projection:124,GSI:125,def_ct_throughput:126,PRIMARY:127,KEY:128,THROUGHPUT:129,PROJECTION:130,KEYS_ONLY:131,def_ct_projection_list:132,def_ct_typedef:133,STRING:134,SHOW:135,TABLES:136,DROP:137,DESCRIBE:138,ON:139,def_scan:140,def_scan_limit_clause:141,def_scan_consistent_read:142,SCAN:143,def_scan_columns:144,def_scan_use_index:145,def_scan_having:146,def_scan_onecolumn:147,def_scan_from:148,def_scan_having_expr:149,$accept:0,$end:1},terminals_:{2:"error",5:"EOF",6:"SEMICOLON",20:"LITERAL",21:"BRALITERAL",23:"DOT",28:"NUMBER",30:"SINGLE_QUOTED_STRING",31:"DOUBLE_QUOTED_STRING",32:"XSTRING",35:"TRUE",36:"FALSE",42:"NULL",44:"UNDEFINED",46:"ARRAYLPAR",48:"ARRAYRPAR",49:"COMMA",52:"JSONLPAR",54:"JSONRPAR",56:"COLON",57:"INSERT",58:"INTO",59:"SET",62:"EQ",63:"UPDATE",65:"WHERE",68:"PLUSEQ",70:"AND",71:"REPLACE",74:"DELETE",75:"FROM",82:"LIMIT",83:"DESC",84:"CONSISTENT_READ",86:"DISTINCT",87:"ALL",90:"STAR",91:"AS",96:"USE",97:"INDEX",101:"HAVING",103:"SELECT",104:"bind_parameter",105:"OR",106:"GT",107:"GE",108:"LT",109:"LE",110:"BETWEEN",112:"LIKE",113:"CONTAINS",114:"CREATE",115:"TABLE",116:"LPAR",120:"RPAR",123:"LSI",125:"GSI",127:"PRIMARY",128:"KEY",129:"THROUGHPUT",130:"PROJECTION",131:"KEYS_ONLY",134:"STRING",135:"SHOW",136:"TABLES",137:"DROP",138:"DESCRIBE",139:"ON",143:"SCAN"},productions_:[0,[3,2],[4,3],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[19,1],[19,1],[22,3],[22,1],[24,1],[25,1],[26,1],[27,1],[29,1],[29,1],[29,1],[33,1],[33,1],[34,1],[34,1],[37,1],[37,1],[38,1],[38,1],[39,1],[40,1],[40,1],[41,1],[43,1],[45,3],[47,3],[47,1],[50,0],[50,1],[50,1],[50,1],[50,1],[50,1],[50,1],[51,3],[53,3],[53,1],[55,0],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[55,3],[9,5],[60,3],[60,1],[61,3],[61,3],[61,3],[61,3],[61,3],[61,3],[10,6],[64,3],[64,1],[67,3],[67,3],[67,3],[67,3],[67,3],[67,3],[67,3],[67,3],[66,1],[66,3],[69,3],[69,3],[11,5],[72,3],[72,1],[73,3],[73,3],[73,3],[73,3],[73,3],[73,3],[12,5],[76,1],[76,3],[77,3],[77,3],[8,4],[80,0],[80,2],[79,0],[79,1],[81,0],[81,1],[85,0],[85,1],[85,1],[88,3],[88,1],[89,1],[89,1],[89,3],[92,1],[93,1],[94,0],[94,2],[95,0],[95,3],[98,2],[98,0],[100,2],[100,0],[78,7],[99,1],[99,1],[99,1],[99,3],[99,3],[99,3],[99,3],[99,3],[99,3],[99,3],[99,3],[99,3],[111,3],[111,3],[102,1],[102,1],[102,1],[102,1],[102,3],[102,3],[102,3],[102,3],[102,3],[102,3],[102,3],[102,3],[102,3],[102,3],[102,3],[102,3],[13,9],[119,0],[119,2],[121,3],[121,1],[122,7],[122,8],[122,9],[122,10],[118,6],[118,8],[126,0],[126,3],[124,0],[124,2],[124,2],[124,4],[132,3],[132,1],[117,3],[117,1],[133,2],[133,2],[14,2],[15,3],[16,3],[17,5],[18,3],[140,6],[141,0],[141,2],[142,0],[142,1],[144,3],[144,1],[147,1],[147,1],[147,3],[148,0],[148,2],[145,0],[145,3],[146,2],[146,0],[149,1],[149,1],[149,1],[149,1],[149,3],[149,3],[149,3],[149,3],[149,3],[149,3],[149,3],[149,3],[149,3],[149,3],[149,3],[149,3]],performAction:function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$){var $0=$$.length-1;switch(yystate){case 1:this.$=$$[$0-1];return this.$;break;case 2:this.$=$$[$0-2];if($$[$0])this.$.push($$[$0]);break;case 3:case 41:case 51:case 73:case 82:case 97:case 120:case 124:case 183:case 199:this.$=[$$[$0]];break;case 15:case 19:case 21:case 22:case 23:case 24:case 25:case 125:case 129:case 135:case 149:case 150:case 206:case 209:case 210:this.$=$$[$0];break;case 16:this.$=$$[$0].substr(1,$$[$0].length-2);break;case 17:this.$={database:$$[$0-2],table:$$[$0]};break;case 18:this.$={table:$$[$0]};break;case 20:this.$={index:$$[$0]};break;case 26:this.$={type:"number",number:$$[$0]};break;case 27:this.$={type:"string",string:$$[$0]};break;case 28:case 35:this.$=true;break;case 29:case 36:this.$=false;break;case 30:this.$={type:"boolean",value:true};break;case 31:this.$={type:"boolean",value:false};break;case 32:case 33:case 34:this.$=eval($$[$0]);break;case 37:this.$=null;break;case 38:this.$="\x00";break;case 39:if($$[$0-1].slice(-1)=="\x00"){this.$=$$[$0-1].slice(0,-1)}else this.$=$$[$0-1];break;case 40:this.$=$$[$0-2];this.$.push($$[$0]);break;case 42:this.$="\x00";break;case 43:case 44:case 45:case 46:case 47:case 48:case 204:this.$=$$[$0];break;case 49:var $kv={};if($$[$0-1]){$$[$0-1].map(function(v){if(v)$kv[v[0]]=v[1]})}this.$=$kv;break;case 50:case 72:case 81:case 96:case 119:case 168:case 182:case 198:this.$=$$[$0-2];this.$.push($$[$0]);break;case 52:case 110:case 112:case 114:case 116:case 126:case 128:case 166:case 194:case 196:case 203:case 205:this.$=undefined;break;case 53:case 54:case 55:case 56:case 57:case 58:case 59:case 60:case 61:case 62:case 63:case 64:case 65:case 66:case 67:case 68:case 69:case 70:this.$=[$$[$0-2],$$[$0]];break;case 71:var $kv={};$$[$0].map(function(v){$kv[v[0]]=v[1]});this.$={statement:"INSERT",dynamodb:{TableName:$$[$0-2],set:$kv}};break;case 74:case 75:case 76:case 77:case 78:case 79:case 83:case 84:case 85:case 86:case 87:case 88:case 98:case 99:case 100:case 101:case 102:case 103:this.$=[$$[$0-2],$$[$0]];break;case 80:var $kv=[];$$[$0-2].map(function(v){$kv.push({k:v[0],v:v[1],op:v[2]})});this.$={statement:"UPDATE",dynamodb:{TableName:$$[$0-4],set:$kv,where:$$[$0]}};break;case 89:this.$=[$$[$0-2],$$[$0],"+="];break;case 90:this.$=[$$[$0-2],undefined,"delete"];break;case 91:case 105:case 169:case 185:this.$=[$$[$0]];break;case 92:case 106:this.$=[$$[$0-2],$$[$0]];break;case 93:case 94:case 107:case 108:this.$={k:$$[$0-2],v:$$[$0]};break;case 95:var $kv={};$$[$0].map(function(v){$kv[v[0]]=v[1]});this.$={statement:"REPLACE",dynamodb:{TableName:$$[$0-2],set:$kv}};break;case 104:this.$={statement:"DELETE",dynamodb:{TableName:$$[$0-2],set:$kv,where:$$[$0]}};break;case 109:this.$={statement:"SELECT",dynamodb:$$[$0-3]};yy.extend(this.$.dynamodb,$$[$0-2]);yy.extend(this.$.dynamodb,$$[$0-1]);yy.extend(this.$.dynamodb,$$[$0]);break;case 111:case 195:this.$={limit:$$[$0]};break;case 113:this.$={sort:"DESC"};break;case 115:case 197:this.$={consistent_read:true};break;case 117:this.$={distinct:true};break;case 118:this.$={all:true};break;case 121:case 200:this.$={type:"star",star:true};break;case 122:case 201:this.$={type:"column",column:$$[$0]};break;case 123:case 202:this.$={type:"column",column:$$[$0-2],alias:$$[$0]};break;case 127:this.$={from:$$[$0]};break;case 130:this.$={where:$$[$0]};break;case 132:case 207:this.$={having:$$[$0]};break;case 134:this.$={columns:$$[$0-4]};yy.extend(this.$,$$[$0-5]);yy.extend(this.$,$$[$0-3]);yy.extend(this.$,$$[$0-2]);yy.extend(this.$,$$[$0-1]);yy.extend(this.$,$$[$0]);break;case 136:case 151:case 211:this.$={bind_parameter:$$[$0]};break;case 137:case 152:case 212:this.$={column:$$[$0]};break;case 138:case 153:case 213:this.$={op:"AND",left:$$[$0-2],right:$$[$0]};break;case 139:case 154:case 214:this.$={op:"OR",left:$$[$0-2],right:$$[$0]};break;case 140:case 155:case 215:this.$={op:"=",left:$$[$0-2],right:$$[$0]};break;case 141:case 156:case 216:this.$={op:">",left:$$[$0-2],right:$$[$0]};break;case 142:case 157:case 217:this.$={op:">=",left:$$[$0-2],right:$$[$0]};break;case 143:case 158:case 218:this.$={op:"<",left:$$[$0-2],right:$$[$0]};break;case 144:case 159:case 219:this.$={op:"<=",left:$$[$0-2],right:$$[$0]};break;case 145:case 160:case 220:this.$={op:"BETWEEN",left:$$[$0-2],right:$$[$0]};break;case 146:case 161:case 221:this.$={op:"LIKE",left:$$[$0-2],right:{type:"string",string:$$[$0]}};break;case 147:this.$={left:{type:"number",number:$$[$0-2]},right:{type:"number",number:$$[$0]}};break;case 148:this.$={left:{type:"string",string:$$[$0-2]},right:{type:"string",string:$$[$0]}};break;case 162:case 222:this.$={op:"CONTAINS",left:$$[$0-2],right:{type:"string",string:$$[$0]}};break;case 163:case 223:this.$={op:"CONTAINS",left:$$[$0-2],right:{type:"number",number:$$[$0]}};break;case 164:case 224:this.$={op:"CONTAINS",left:$$[$0-2],right:{type:"boolean",value:$$[$0]}};break;case 165:this.$={statement:"CREATE_TABLE",dynamodb:{TableName:$$[$0-6],AttributeDefinitions:$$[$0-4]}};yy.extend(this.$.dynamodb,$$[$0-2]);yy.extend(this.$.dynamodb,$$[$0-1]);break;case 167:var indexes={LocalSecondaryIndexes:[],GlobalSecondaryIndexes:[]};$$[$0].map(function(idx){if(idx.hasOwnProperty("LSI"))indexes.LocalSecondaryIndexes.push(idx.LSI);if(idx.hasOwnProperty("GSI"))indexes.GlobalSecondaryIndexes.push(idx.GSI)});this.$=indexes;break;case 170:this.$={};this.$[$$[$0-4]]={IndexName:$$[$0-5],KeySchema:[{AttributeName:$$[$0-2],KeyType:"HASH"}],Projection:$$[$0]};break;case 171:this.$={};this.$[$$[$0-5]]={IndexName:$$[$0-6],KeySchema:[{AttributeName:$$[$0-3],KeyType:"HASH"}],Projection:$$[$0-1],ProvisionedThroughput:$$[$0]};break;case 172:this.$={};this.$[$$[$0-6]]={IndexName:$$[$0-7],KeySchema:[{AttributeName:$$[$0-4],KeyType:"HASH"},{AttributeName:$$[$0-2],KeyType:"RANGE"}],Projection:$$[$0]};break;case 173:this.$={};this.$[$$[$0-7]]={IndexName:$$[$0-8],KeySchema:[{AttributeName:$$[$0-5],KeyType:"HASH"},{AttributeName:$$[$0-3],KeyType:"RANGE"}],Projection:$$[$0-1],ProvisionedThroughput:$$[$0]};break;case 174:this.$={KeySchema:[{AttributeName:$$[$0-2],KeyType:"HASH"}],ProvisionedThroughput:$$[$0]};break;case 175:this.$={KeySchema:[{AttributeName:$$[$0-4],KeyType:"HASH"},{AttributeName:$$[$0-2],KeyType:"RANGE"}],ProvisionedThroughput:$$[$0]};break;case 176:this.$={ReadCapacityUnits:1,WriteCapacityUnits:1};break;case 177:this.$={ReadCapacityUnits:eval($$[$0-1]),WriteCapacityUnits:eval($$[$0])};break;case 178:case 179:this.$={ProjectionType:"ALL"};break;case 180:this.$={ProjectionType:"KEYS_ONLY"};break;case 181:this.$={ProjectionType:"INCLUDE",NonKeyAttributes:$$[$0-1]};break;case 184:this.$=$$[$0-2];this.$.push($$[$0]);break;case 186:this.$={AttributeName:$$[$0-1],AttributeType:"S"};break;case 187:this.$={AttributeName:$$[$0-1],AttributeType:"N"};break;case 188:this.$={statement:"SHOW_TABLES"};break;case 189:this.$={statement:"DROP_TABLE",dynamodb:{TableName:$$[$0]}};break;case 190:this.$={statement:"DESCRIBE_TABLE",dynamodb:{TableName:$$[$0]}};break;case 191:this.$={statement:"DROP_INDEX",dynamodb:{TableName:$$[$0],GlobalSecondaryIndexUpdates:[{Delete:{IndexName:$$[$0-2]}}]}};break;case 192:this.$={statement:"SCAN",dynamodb:{}};yy.extend(this.$.dynamodb,$$[$0-2]);yy.extend(this.$.dynamodb,$$[$0-1]);yy.extend(this.$.dynamodb,$$[$0]);break;case 193:this.$={TableName:$$[$0-2],columns:$$[$0-4]};yy.extend(this.$,$$[$0-1]);yy.extend(this.$,$$[$0]);break}},table:[{3:1,4:2,7:3,8:4,9:5,10:6,11:7,12:8,13:9,14:10,15:11,16:12,17:13,18:14,57:$V0,63:$V1,71:$V2,74:$V3,78:15,103:$V4,114:$V5,135:$V6,137:$V7,138:$V8,140:24,143:$V9},{1:[3]},{5:[1,27],6:[1,28]},o($Va,[2,3]),o($Va,[2,4]),o($Va,[2,5]),o($Va,[2,6]),o($Va,[2,7]),o($Va,[2,8]),o($Va,[2,9]),o($Va,[2,10]),o($Va,[2,11]),o($Va,[2,12]),o($Va,[2,13]),o($Va,[2,14]),o($Vb,[2,112],{79:29,83:[1,30]}),{58:[1,31]},{19:33,20:$Vc,21:$Vd,24:32},{58:[1,36]},{75:[1,37]},{115:[1,38]},{136:[1,39]},{97:[1,41],115:[1,40]},{115:[1,42]},o($Ve,[2,194],{141:43,82:[1,44]}),o($Vf,[2,116],{85:45,86:[1,46],87:[1,47]}),{19:51,20:$Vc,21:$Vd,90:$Vg,144:48,147:49},{1:[2,1]},{7:52,8:4,9:5,10:6,11:7,12:8,13:9,14:10,15:11,16:12,17:13,18:14,57:$V0,63:$V1,71:$V2,74:$V3,78:15,103:$V4,114:$V5,135:$V6,137:$V7,138:$V8,140:24,143:$V9},o($Ve,[2,110],{80:53,82:[1,54]}),o($Vb,[2,113]),{19:33,20:$Vc,21:$Vd,24:55},{59:[1,56]},o([5,6,59,65,82,84,96,101,116],[2,19]),o($Vh,[2,15]),o($Vh,[2,16]),{19:33,20:$Vc,21:$Vd,24:57},{19:33,20:$Vc,21:$Vd,24:58},{19:33,20:$Vc,21:$Vd,24:59},o($Va,[2,188]),{19:33,20:$Vc,21:$Vd,24:60},{19:62,20:$Vc,21:$Vd,26:61},{19:33,20:$Vc,21:$Vd,24:63},o($Va,[2,196],{142:64,84:[1,65]}),{27:66,28:$Vi},{19:71,20:$Vc,21:$Vd,88:68,89:69,90:$Vj},o($Vf,[2,117]),o($Vf,[2,118]),{49:[1,73],75:[1,72]},o($Vk,[2,199]),o($Vk,[2,200]),o($Vk,[2,201],{91:[1,74]}),o($Va,[2,2]),o($Va,[2,114],{81:75,84:[1,76]}),{27:77,28:$Vi},{59:[1,78]},{19:81,20:$Vc,21:$Vd,64:79,67:80},{59:[1,82]},{65:[1,83]},{116:[1,84]},o($Va,[2,189]),{139:[1,85]},{139:[2,21]},o($Va,[2,190]),o($Va,[2,192]),o($Va,[2,197]),o($Ve,[2,195]),o([5,6,28,49,62,70,82,83,84,101,105,106,107,108,109,110,112,113,120],[2,22]),o($Vl,[2,126],{94:86,49:[1,87],75:[1,88]}),o($Vm,[2,120]),o($Vm,[2,121]),o($Vm,[2,122],{91:[1,89]}),{19:33,20:$Vc,21:$Vd,24:90},{19:51,20:$Vc,21:$Vd,90:$Vg,147:91},{19:92,20:$Vc,21:$Vd},o($Va,[2,109]),o($Va,[2,115]),o($Ve,[2,111]),{19:95,20:$Vc,21:$Vd,60:93,61:94},{49:[1,97],65:[1,96]},o($Vn,[2,82]),{62:[1,98],68:[1,99]},{19:102,20:$Vc,21:$Vd,72:100,73:101},{19:105,20:$Vc,21:$Vd,76:103,77:104},{19:108,20:$Vc,21:$Vd,117:106,133:107},{19:33,20:$Vc,21:$Vd,24:109},o($Vo,[2,128],{95:110,96:[1,111]}),{19:71,20:$Vc,21:$Vd,89:112,90:$Vj},{19:116,20:$Vc,21:$Vd,22:115,92:113,93:114},{19:117,20:$Vc,21:$Vd},o($Vp,[2,205],{145:118,96:[1,119]}),o($Vk,[2,198]),o($Vk,[2,202]),o($Va,[2,71],{49:[1,120]}),o($Vq,[2,73]),{62:[1,121]},{19:124,20:$Vc,21:$Vd,66:122,69:123},{19:81,20:$Vc,21:$Vd,67:125},{28:$Vr,30:$Vs,31:$Vt,35:$Vu,36:$Vv,38:126,39:127,40:128,41:129,42:$Vw,43:132,44:[1,141],45:131,46:$Vx,51:130,52:$Vy},{28:$Vr,39:142},o($Va,[2,95],{49:[1,143]}),o($Vq,[2,97]),{62:[1,144]},o($Va,[2,104]),o($Va,[2,105],{70:[1,145]}),{62:[1,146]},{49:[1,147]},{49:[2,185]},{28:[1,149],134:[1,148]},o($Va,[2,191]),o($Vz,[2,131],{98:150,65:[1,151]}),{97:[1,152]},o($Vm,[2,119]),o($Vl,[2,127]),o($Vl,[2,124]),o($Vl,[2,125]),o($Vl,[2,18],{23:[1,153]}),o($Vm,[2,123]),o($Vb,[2,208],{146:154,101:[1,155]}),{97:[1,156]},{19:95,20:$Vc,21:$Vd,61:157},{28:$Vr,30:$Vs,31:$Vt,35:$Vu,36:$Vv,38:158,39:159,40:160,41:161,42:$Vw,45:163,46:$Vx,51:162,52:$Vy},o($Va,[2,80]),o($Va,[2,91],{70:[1,164]}),{62:[1,165]},o($Vn,[2,81]),o($Vn,[2,83]),o($Vn,[2,84]),o($Vn,[2,85]),o($Vn,[2,86]),o($Vn,[2,87]),o($Vn,[2,88]),o($Vn,[2,90]),o($VA,[2,32]),o($VA,[2,33]),o($VA,[2,34]),o($VB,[2,35]),o($VB,[2,36]),o($VB,[2,37]),o($VC,$VD,{53:166,55:167,19:168,20:$Vc,21:$Vd,30:$VE,31:$VF}),o($VG,$VH,{47:171,50:172,39:173,38:174,40:175,41:176,45:177,51:178,28:$Vr,30:$Vs,31:$Vt,35:$Vu,36:$Vv,42:$Vw,46:$Vx,52:$Vy}),o($Vn,[2,38]),o($Vn,[2,89]),{19:102,20:$Vc,21:$Vd,73:179},{28:$Vr,30:$Vs,31:$Vt,35:$Vu,36:$Vv,38:180,39:181,40:182,41:183,42:$Vw,45:185,46:$Vx,51:184,52:$Vy},{19:105,20:$Vc,21:$Vd,77:186},{28:$Vr,30:$Vs,31:$Vt,38:187,39:188},{19:108,20:$Vc,21:$Vd,118:189,127:[1,191],133:190},{49:[2,186]},{49:[2,187]},o($VI,[2,133],{100:192,101:[1,193]}),{19:197,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:195,99:194,104:$VM},{19:204,20:$Vc,21:$Vd,25:203},{19:205,20:$Vc,21:$Vd},o($Vb,[2,193]),{19:210,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:207,35:$VN,36:$VO,37:208,104:$VP,149:206},{19:204,20:$Vc,21:$Vd,25:213},o($Vq,[2,72]),o($Vq,[2,74]),o($Vq,[2,75]),o($Vq,[2,76]),o($Vq,[2,77]),o($Vq,[2,78]),o($Vq,[2,79]),{19:124,20:$Vc,21:$Vd,69:214},{28:$Vr,30:$Vs,31:$Vt,38:215,39:216},{49:[1,218],54:[1,217]},o($VC,[2,51]),{56:[1,219]},{56:[1,220]},{56:[1,221]},{48:[1,222],49:[1,223]},o($VG,[2,41]),o($VG,[2,43]),o($VG,[2,44]),o($VG,[2,45]),o($VG,[2,46]),o($VG,[2,47]),o($VG,[2,48]),o($Vq,[2,96]),o($Vq,[2,98]),o($Vq,[2,99]),o($Vq,[2,100]),o($Vq,[2,101]),o($Vq,[2,102]),o($Vq,[2,103]),o($Va,[2,106]),o($VQ,[2,107]),o($VQ,[2,108]),{49:[1,225],119:224,120:[2,166]},{49:[2,184]},{128:[1,226]},o($VI,[2,134]),{19:231,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:228,35:$VN,36:$VO,37:229,102:227,104:$VR},o($Vz,[2,130],{62:$VS,70:$VT,105:[1,233],106:$VU,107:$VV,108:$VW,109:$VX,110:$VY,112:$VZ}),o($V_,[2,135]),o($V_,[2,136]),o($V_,[2,137]),o($V$,[2,26]),o($V$,[2,27]),o($V$,[2,23]),o($V$,[2,24]),o($V$,[2,25]),o($Vo,[2,129]),o($Vo,[2,20]),o($Vl,[2,17]),o($Vb,[2,207],{62:$V01,70:$V11,105:[1,242],106:$V21,107:$V31,108:$V41,109:$V51,110:$V61,112:$V71,113:$V81}),o($V91,[2,209]),o($V91,[2,210]),o($V91,[2,211]),o($V91,[2,212]),o($Va1,[2,30]),o($Va1,[2,31]),o($Vp,[2,206]),o($Va,[2,92]),o($VQ,[2,93]),o($VQ,[2,94]),o($VB,[2,49]),o($VC,$VD,{19:168,55:251,20:$Vc,21:$Vd,30:$VE,31:$VF}),{28:$Vr,30:$Vs,31:$Vt,35:$Vu,36:$Vv,38:253,39:252,40:254,41:255,42:$Vw,45:256,46:$Vx,51:257,52:$Vy},{28:$Vr,30:$Vs,31:$Vt,35:$Vu,36:$Vv,38:259,39:258,40:260,41:261,42:$Vw,45:262,46:$Vx,51:263,52:$Vy},{28:$Vr,30:$Vs,31:$Vt,35:$Vu,36:$Vv,38:265,39:264,40:266,41:267,42:$Vw,45:268,46:$Vx,51:269,52:$Vy},o($VB,[2,39]),o($VG,$VH,{39:173,38:174,40:175,41:176,45:177,51:178,50:270,28:$Vr,30:$Vs,31:$Vt,35:$Vu,36:$Vv,42:$Vw,46:$Vx,52:$Vy}),{120:[1,271]},{97:$Vb1,121:272,122:273},{116:[1,275]},o($VI,[2,132],{62:$Vc1,70:$Vd1,105:[1,277],106:$Ve1,107:$Vf1,108:$Vg1,109:$Vh1,110:$Vi1,112:$Vj1,113:$Vk1}),o($Va1,[2,149]),o($Va1,[2,150]),o($Va1,[2,151]),o($Va1,[2,152]),{19:197,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:195,99:286,104:$VM},{19:197,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:195,99:287,104:$VM},{19:197,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:195,99:288,104:$VM},{19:197,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:195,99:289,104:$VM},{19:197,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:195,99:290,104:$VM},{19:197,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:195,99:291,104:$VM},{19:197,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:195,99:292,104:$VM},{27:294,28:$Vi,29:295,30:$VJ,31:$VK,32:$VL,111:293},{29:296,30:$VJ,31:$VK,32:$VL},{19:210,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:207,35:$VN,36:$VO,37:208,104:$VP,149:297},{19:210,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:207,35:$VN,36:$VO,37:208,104:$VP,149:298},{19:210,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:207,35:$VN,36:$VO,37:208,104:$VP,149:299},{19:210,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:207,35:$VN,36:$VO,37:208,104:$VP,149:300},{19:210,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:207,35:$VN,36:$VO,37:208,104:$VP,149:301},{19:210,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:207,35:$VN,36:$VO,37:208,104:$VP,149:302},{19:210,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:207,35:$VN,36:$VO,37:208,104:$VP,149:303},{27:294,28:$Vi,29:295,30:$VJ,31:$VK,32:$VL,111:304},{29:305,30:$VJ,31:$VK,32:$VL},{27:307,28:$Vi,29:306,30:$VJ,31:$VK,32:$VL,35:$VN,36:$VO,37:308},o($VC,[2,50]),o($VC,[2,53]),o($VC,[2,56]),o($VC,[2,59]),o($VC,[2,62]),o($VC,[2,65]),o($VC,[2,68]),o($VC,[2,54]),o($VC,[2,57]),o($VC,[2,60]),o($VC,[2,63]),o($VC,[2,66]),o($VC,[2,69]),o($VC,[2,55]),o($VC,[2,58]),o($VC,[2,61]),o($VC,[2,64]),o($VC,[2,67]),o($VC,[2,70]),o($VG,[2,40]),o($Va,[2,165]),{49:[1,309],120:[2,167]},o($Vl1,[2,169]),{19:310,20:$Vc,21:$Vd},{19:311,20:$Vc,21:$Vd},{19:231,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:228,35:$VN,36:$VO,37:229,102:312,104:$VR},{19:231,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:228,35:$VN,36:$VO,37:229,102:313,104:$VR},{19:231,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:228,35:$VN,36:$VO,37:229,102:314,104:$VR},{19:231,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:228,35:$VN,36:$VO,37:229,102:315,104:$VR},{19:231,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:228,35:$VN,36:$VO,37:229,102:316,104:$VR},{19:231,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:228,35:$VN,36:$VO,37:229,102:317,104:$VR},{19:231,20:$Vc,21:$Vd,27:198,28:$Vi,29:199,30:$VJ,31:$VK,32:$VL,33:228,35:$VN,36:$VO,37:229,102:318,104:$VR},{27:294,28:$Vi,29:295,30:$VJ,31:$VK,32:$VL,111:319},{29:320,30:$VJ,31:$VK,32:$VL},{27:322,28:$Vi,29:321,30:$VJ,31:$VK,32:$VL,35:$VN,36:$VO,37:323},o([5,6,70,82,83,84,101,105],[2,138],{62:$VS,106:$VU,107:$VV,108:$VW,109:$VX,110:$VY,112:$VZ}),o([5,6,82,83,84,101,105],[2,139],{62:$VS,70:$VT,106:$VU,107:$VV,108:$VW,109:$VX,110:$VY,112:$VZ}),o([5,6,62,70,82,83,84,101,105,110,112],[2,140],{106:$VU,107:$VV,108:$VW,109:$VX}),o($V_,[2,141]),o($V_,[2,142]),o($V_,[2,143]),o($V_,[2,144]),o($V_,[2,145]),{70:[1,324]},{70:[1,325]},o($V_,[2,146]),o([5,6,70,82,84,105],[2,213],{62:$V01,106:$V21,107:$V31,108:$V41,109:$V51,110:$V61,112:$V71,113:$V81}),o([5,6,82,84,105],[2,214],{62:$V01,70:$V11,106:$V21,107:$V31,108:$V41,109:$V51,110:$V61,112:$V71,113:$V81}),o([5,6,62,70,82,84,105,110,112,113],[2,215],{106:$V21,107:$V31,108:$V41,109:$V51}),o($V91,[2,216]),o($V91,[2,217]),o($V91,[2,218]),o($V91,[2,219]),o($V91,[2,220]),o($V91,[2,221]),o($V91,[2,222]),o($V91,[2,223]),o($V91,[2,224]),{97:$Vb1,122:326},{123:[1,327],125:[1,328]},{49:[1,330],120:[1,329]},o([5,6,70,82,83,84,105],[2,153],{62:$Vc1,106:$Ve1,107:$Vf1,108:$Vg1,109:$Vh1,110:$Vi1,112:$Vj1,113:$Vk1}),o([5,6,82,83,84,105],[2,154],{62:$Vc1,70:$Vd1,106:$Ve1,107:$Vf1,108:$Vg1,109:$Vh1,110:$Vi1,112:$Vj1,113:$Vk1}),o([5,6,62,70,82,83,84,105,110,112,113],[2,155],{106:$Ve1,107:$Vf1,108:$Vg1,109:$Vh1}),o($Va1,[2,156]),o($Va1,[2,157]),o($Va1,[2,158]),o($Va1,[2,159]),o($Va1,[2,160]),o($Va1,[2,161]),o($Va1,[2,162]),o($Va1,[2,163]),o($Va1,[2,164]),{27:331,28:$Vi},{29:332,30:$VJ,31:$VK,32:$VL},o($Vl1,[2,168]),{116:[1,333]},{116:[1,334]},o($Vl1,$Vm1,{126:335,129:$Vn1}),{19:337,20:$Vc,21:$Vd},o($V$,[2,147]),o($V$,[2,148]),{19:338,20:$Vc,21:$Vd},{19:339,20:$Vc,21:$Vd},o($Vl1,[2,174]),{27:340,28:$Vi},{120:[1,341]},{49:[1,343],120:[1,342]},{49:[1,345],120:[1,344]},{27:346,28:$Vi},o($Vl1,$Vm1,{126:347,129:$Vn1}),o($Vl1,$Vo1,{124:348,130:$Vp1}),{19:350,20:$Vc,21:$Vd},o($Vq1,$Vo1,{124:351,130:$Vp1}),{19:352,20:$Vc,21:$Vd},o($Vl1,[2,177]),o($Vl1,[2,175]),o($Vl1,[2,170]),{87:[1,353],116:[1,355],131:[1,354]},{120:[1,356]},o($Vl1,$Vm1,{126:357,129:$Vn1}),{120:[1,358]},o($Vq1,[2,179]),o($Vq1,[2,180]),{19:360,20:$Vc,21:$Vd,132:359},o($Vl1,$Vo1,{124:361,130:$Vp1}),o($Vl1,[2,171]),o($Vq1,$Vo1,{124:362,130:$Vp1}),{49:[1,364],120:[1,363]},o($Vl1,[2,183]),o($Vl1,[2,172]),o($Vl1,$Vm1,{126:365,129:$Vn1}),o($Vq1,[2,181]),{19:366,20:$Vc,21:$Vd},o($Vl1,[2,173]),o($Vl1,[2,182])],defaultActions:{27:[2,1],62:[2,21],107:[2,185],148:[2,186],149:[2,187],190:[2,184]},parseError:function parseError(str,hash){if(hash.recoverable){this.trace(str)}else{var error=new Error(str);error.hash=hash;throw error}},parse:function parse(input){var self=this,stack=[0],tstack=[],vstack=[null],lstack=[],table=this.table,yytext="",yylineno=0,yyleng=0,recovering=0,TERROR=2,EOF=1;var args=lstack.slice.call(arguments,1);var lexer=Object.create(this.lexer);var sharedState={yy:{}};for(var k in this.yy){if(Object.prototype.hasOwnProperty.call(this.yy,k)){sharedState.yy[k]=this.yy[k]}}lexer.setInput(input,sharedState.yy);sharedState.yy.lexer=lexer;sharedState.yy.parser=this;if(typeof lexer.yylloc=="undefined"){lexer.yylloc={}}var yyloc=lexer.yylloc;lstack.push(yyloc);var ranges=lexer.options&&lexer.options.ranges;if(typeof sharedState.yy.parseError==="function"){this.parseError=sharedState.yy.parseError}else{this.parseError=Object.getPrototypeOf(this).parseError}function popStack(n){stack.length=stack.length-2*n;vstack.length=vstack.length-n;lstack.length=lstack.length-n}_token_stack:var lex=function(){var token;token=lexer.lex()||EOF;if(typeof token!=="number"){token=self.symbols_[token]||token}return token};var symbol,preErrorSymbol,state,action,a,r,yyval={},p,len,newState,expected;while(true){state=stack[stack.length-1];if(this.defaultActions[state]){action=this.defaultActions[state]}else{if(symbol===null||typeof symbol=="undefined"){symbol=lex()}action=table[state]&&table[state][symbol]}if(typeof action==="undefined"||!action.length||!action[0]){var errStr="";expected=[];for(p in table[state]){if(this.terminals_[p]&&p>TERROR){expected.push("'"+this.terminals_[p]+"'")}}if(lexer.showPosition){errStr="Parse error on line "+(yylineno+1)+":\n"+lexer.showPosition()+"\nExpecting "+expected.join(", ")+", got '"+(this.terminals_[symbol]||symbol)+"'"}else{errStr="Parse error on line "+(yylineno+1)+": Unexpected "+(symbol==EOF?"end of input":"'"+(this.terminals_[symbol]||symbol)+"'")}this.parseError(errStr,{text:lexer.match,token:this.terminals_[symbol]||symbol,line:lexer.yylineno,loc:yyloc,expected:expected})}if(action[0]instanceof Array&&action.length>1){throw new Error("Parse Error: multiple actions possible at state: "+state+", token: "+symbol)}switch(action[0]){case 1:stack.push(symbol);vstack.push(lexer.yytext);lstack.push(lexer.yylloc);stack.push(action[1]);symbol=null;if(!preErrorSymbol){yyleng=lexer.yyleng;yytext=lexer.yytext;yylineno=lexer.yylineno;yyloc=lexer.yylloc;if(recovering>0){recovering--}}else{symbol=preErrorSymbol;preErrorSymbol=null}break;case 2:len=this.productions_[action[1]][1];yyval.$=vstack[vstack.length-len];yyval._$={first_line:lstack[lstack.length-(len||1)].first_line,last_line:lstack[lstack.length-1].last_line,first_column:lstack[lstack.length-(len||1)].first_column,last_column:lstack[lstack.length-1].last_column};if(ranges){yyval._$.range=[lstack[lstack.length-(len||1)].range[0],lstack[lstack.length-1].range[1]]}r=this.performAction.apply(yyval,[yytext,yyleng,yylineno,sharedState.yy,action[1],vstack,lstack].concat(args));if(typeof r!=="undefined"){return r}if(len){stack=stack.slice(0,-1*len*2);vstack=vstack.slice(0,-1*len);lstack=lstack.slice(0,-1*len)}stack.push(this.productions_[action[1]][0]);vstack.push(yyval.$);lstack.push(yyval._$);newState=table[stack[stack.length-2]][stack[stack.length-1]];stack.push(newState);break;case 3:return true}}return true}};var lexer=function(){var lexer={EOF:1,parseError:function parseError(str,hash){if(this.yy.parser){this.yy.parser.parseError(str,hash)}else{throw new Error(str)}},setInput:function(input,yy){this.yy=yy||this.yy||{};this._input=input;this._more=this._backtrack=this.done=false;this.yylineno=this.yyleng=0;this.yytext=this.matched=this.match="";this.conditionStack=["INITIAL"];this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0};if(this.options.ranges){this.yylloc.range=[0,0]}this.offset=0;return this},input:function(){var ch=this._input[0];this.yytext+=ch;this.yyleng++;this.offset++;this.match+=ch;this.matched+=ch;var lines=ch.match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno++;this.yylloc.last_line++}else{this.yylloc.last_column++}if(this.options.ranges){this.yylloc.range[1]++}this._input=this._input.slice(1);return ch},unput:function(ch){var len=ch.length;var lines=ch.split(/(?:\r\n?|\n)/g);this._input=ch+this._input;this.yytext=this.yytext.substr(0,this.yytext.length-len);this.offset-=len;var oldLines=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1);this.matched=this.matched.substr(0,this.matched.length-1);if(lines.length-1){this.yylineno-=lines.length-1}var r=this.yylloc.range;this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:lines?(lines.length===oldLines.length?this.yylloc.first_column:0)+oldLines[oldLines.length-lines.length].length-lines[0].length:this.yylloc.first_column-len};if(this.options.ranges){this.yylloc.range=[r[0],r[0]+this.yyleng-len]}this.yyleng=this.yytext.length;return this},more:function(){this._more=true;return this},reject:function(){if(this.options.backtrack_lexer){this._backtrack=true}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}return this},less:function(n){this.unput(this.match.slice(n))},pastInput:function(){var past=this.matched.substr(0,this.matched.length-this.match.length);return(past.length>20?"...":"")+past.substr(-20).replace(/\n/g,"")},upcomingInput:function(){var next=this.match;if(next.length<20){next+=this._input.substr(0,20-next.length)}return(next.substr(0,20)+(next.length>20?"...":"")).replace(/\n/g,"")},showPosition:function(){var pre=this.pastInput();var c=new Array(pre.length+1).join("-");return pre+this.upcomingInput()+"\n"+c+"^"},test_match:function(match,indexed_rule){var token,lines,backup;if(this.options.backtrack_lexer){backup={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done};if(this.options.ranges){backup.yylloc.range=this.yylloc.range.slice(0)}}lines=match[0].match(/(?:\r\n?|\n).*/g);if(lines){this.yylineno+=lines.length}this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:lines?lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+match[0].length};this.yytext+=match[0];

this.match+=match[0];this.matches=match;this.yyleng=this.yytext.length;if(this.options.ranges){this.yylloc.range=[this.offset,this.offset+=this.yyleng]}this._more=false;this._backtrack=false;this._input=this._input.slice(match[0].length);this.matched+=match[0];token=this.performAction.call(this,this.yy,this,indexed_rule,this.conditionStack[this.conditionStack.length-1]);if(this.done&&this._input){this.done=false}if(token){return token}else if(this._backtrack){for(var k in backup){this[k]=backup[k]}return false}return false},next:function(){if(this.done){return this.EOF}if(!this._input){this.done=true}var token,match,tempMatch,index;if(!this._more){this.yytext="";this.match=""}var rules=this._currentRules();for(var i=0;i<rules.length;i++){tempMatch=this._input.match(this.rules[rules[i]]);if(tempMatch&&(!match||tempMatch[0].length>match[0].length)){match=tempMatch;index=i;if(this.options.backtrack_lexer){token=this.test_match(tempMatch,rules[i]);if(token!==false){return token}else if(this._backtrack){match=false;continue}else{return false}}else if(!this.options.flex){break}}}if(match){token=this.test_match(match,rules[index]);if(token!==false){return token}return false}if(this._input===""){return this.EOF}else{return this.parseError("Lexical error on line "+(this.yylineno+1)+". Unrecognized text.\n"+this.showPosition(),{text:"",token:null,line:this.yylineno})}},lex:function lex(){var r=this.next();if(r){return r}else{return this.lex()}},begin:function begin(condition){this.conditionStack.push(condition)},popState:function popState(){var n=this.conditionStack.length-1;if(n>0){return this.conditionStack.pop()}else{return this.conditionStack[0]}},_currentRules:function _currentRules(){if(this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]){return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules}else{return this.conditions["INITIAL"].rules}},topState:function topState(n){n=this.conditionStack.length-1-Math.abs(n||0);if(n>=0){return this.conditionStack[n]}else{return"INITIAL"}},pushState:function pushState(condition){this.begin(condition)},stateStackSize:function stateStackSize(){return this.conditionStack.length},options:{"case-insensitive":true},performAction:function anonymous(yy,yy_,$avoiding_name_collisions,YY_START){var YYSTATE=YY_START;switch($avoiding_name_collisions){case 0:return 21;break;case 1:return 30;break;case 2:return 31;break;case 3:break;case 4:break;case 5:return"ABORT";break;case 6:return"ADD";break;case 7:return"AFTER";break;case 8:return"ALTER";break;case 9:return"ANALYZE";break;case 10:return 70;break;case 11:return 91;break;case 12:return"ASC";break;case 13:return"ATTACH";break;case 14:return"BEFORE";break;case 15:return"BEGIN";break;case 16:return 110;break;case 17:return"BY";break;case 18:return"CASCADE";break;case 19:return"CASE";break;case 20:return"CAST";break;case 21:return"CHECK";break;case 22:return"COLLATE";break;case 23:return"COLUMN";break;case 24:return"CONFLICT";break;case 25:return 84;break;case 26:return"CONSTRAINT";break;case 27:return 114;break;case 28:return"CROSS";break;case 29:return"CURRENT DATE";break;case 30:return"CURRENT TIME";break;case 31:return"CURRENT TIMESTAMP";break;case 32:return"DATABASE";break;case 33:return"DEFAULT";break;case 34:return"DEFERRABLE";break;case 35:return"DEFERRED";break;case 36:return 74;break;case 37:return 83;break;case 38:return"DETACH";break;case 39:return 86;break;case 40:return 137;break;case 41:return 138;break;case 42:return"EACH";break;case 43:return"ELSE";break;case 44:return"END";break;case 45:return"ESCAPE";break;case 46:return"EXCEPT";break;case 47:return"EXCLUSIVE";break;case 48:return"EXISTS";break;case 49:return"EXPLAIN";break;case 50:return"FAIL";break;case 51:return"FOR";break;case 52:return"FOREIGN";break;case 53:return 75;break;case 54:return"FULL";break;case 55:return"GLOB";break;case 56:return"GROUP";break;case 57:return 101;break;case 58:return"IF";break;case 59:return"IGNORE";break;case 60:return"IMMEDIATE";break;case 61:return"IN";break;case 62:return 96;break;case 63:return 97;break;case 64:return"INDEXED";break;case 65:return"INITIALLY";break;case 66:return"INNER";break;case 67:return 57;break;case 68:return"INSTEAD";break;case 69:return"INTERSECT";break;case 70:return 58;break;case 71:return"IS";break;case 72:return"ISNULL";break;case 73:return"JOIN";break;case 74:return 128;break;case 75:return"LEFT";break;case 76:return 112;break;case 77:return 113;break;case 78:return 82;break;case 79:return"MATCH";break;case 80:return"NATURAL";break;case 81:return"NO";break;case 82:return"NOT";break;case 83:return"NOTNULL";break;case 84:return 42;break;case 85:return 44;break;case 86:return"OF";break;case 87:return"OFFSET";break;case 88:return 139;break;case 89:return 105;break;case 90:return"ORDER";break;case 91:return"OUTER";break;case 92:return"PLAN";break;case 93:return"PRAGMA";break;case 94:return 127;break;case 95:return"QUERY";break;case 96:return"RAISE";break;case 97:return"RECURSIVE";break;case 98:return"REFERENCES";break;case 99:return"REGEXP";break;case 100:return"REINDEX";break;case 101:return"RELEASE";break;case 102:return"RENAME";break;case 103:return 71;break;case 104:return"RESTRICT";break;case 105:return"RIGHT";break;case 106:return"ROLLBACK";break;case 107:return"ROW";break;case 108:return 103;break;case 109:return 143;break;case 110:return 59;break;case 111:return 115;break;case 112:return"TEMP";break;case 113:return"THEN";break;case 114:return"TO";break;case 115:return"TRIGGER";break;case 116:return"UNION";break;case 117:return"UNIQUE";break;case 118:return 63;break;case 119:return"USING";break;case 120:return"VACUUM";break;case 121:return"VALUES";break;case 122:return"VIEW";break;case 123:return"WHEN";break;case 124:return 65;break;case 125:return"WITH";break;case 126:return 35;break;case 127:return 36;break;case 128:return 135;break;case 129:return 136;break;case 130:return 134;break;case 131:return 28;break;case 132:return 129;break;case 133:return 125;break;case 134:return 123;break;case 135:return 130;break;case 136:return 87;break;case 137:return 131;break;case 138:return 28;break;case 139:return 28;break;case 140:return"TILDEs";break;case 141:return 68;break;case 142:return"PLUS";break;case 143:return"MINUS";break;case 144:return 90;break;case 145:return"SLASH";break;case 146:return"REM";break;case 147:return"RSHIFT";break;case 148:return"LSHIFT";break;case 149:return"NE";break;case 150:return"NE";break;case 151:return 107;break;case 152:return 106;break;case 153:return 109;break;case 154:return 108;break;case 155:return 62;break;case 156:return"BITAND";break;case 157:return"BITOR";break;case 158:return 116;break;case 159:return 120;break;case 160:return 52;break;case 161:return 54;break;case 162:return 46;break;case 163:return 48;break;case 164:return 23;break;case 165:return 49;break;case 166:return 56;break;case 167:return 6;break;case 168:return"DOLLAR";break;case 169:return"QUESTION";break;case 170:return"CARET";break;case 171:return 20;break;case 172:return 5;break;case 173:return"INVALID";break}},rules:[/^(?:([`](\\.|[^"]|\\")*?[`])+)/i,/^(?:(['](\\.|[^']|\\')*?['])+)/i,/^(?:(["](\\.|[^"]|\\")*?["])+)/i,/^(?:--(.*?)($|\r\n|\r|\n))/i,/^(?:\s+)/i,/^(?:ABORT\b)/i,/^(?:ADD\b)/i,/^(?:AFTER\b)/i,/^(?:ALTER\b)/i,/^(?:ANALYZE\b)/i,/^(?:AND\b)/i,/^(?:AS\b)/i,/^(?:ASC\b)/i,/^(?:ATTACH\b)/i,/^(?:BEFORE\b)/i,/^(?:BEGIN\b)/i,/^(?:BETWEEN\b)/i,/^(?:BY\b)/i,/^(?:CASCADE\b)/i,/^(?:CASE\b)/i,/^(?:CAST\b)/i,/^(?:CHECK\b)/i,/^(?:COLLATE\b)/i,/^(?:COLUMN\b)/i,/^(?:CONFLICT\b)/i,/^(?:CONSISTENT_READ\b)/i,/^(?:CONSTRAINT\b)/i,/^(?:CREATE\b)/i,/^(?:CROSS\b)/i,/^(?:CURRENT_DATE\b)/i,/^(?:CURRENT_TIME\b)/i,/^(?:CURRENT_TIMESTAMP\b)/i,/^(?:DATABASE\b)/i,/^(?:DEFAULT\b)/i,/^(?:DEFERRABLE\b)/i,/^(?:DEFERRED\b)/i,/^(?:DELETE\b)/i,/^(?:DESC\b)/i,/^(?:DETACH\b)/i,/^(?:DISTINCT\b)/i,/^(?:DROP\b)/i,/^(?:DESCRIBE\b)/i,/^(?:EACH\b)/i,/^(?:ELSE\b)/i,/^(?:END\b)/i,/^(?:ESCAPE\b)/i,/^(?:EXCEPT\b)/i,/^(?:EXCLUSIVE\b)/i,/^(?:EXISTS\b)/i,/^(?:EXPLAIN\b)/i,/^(?:FAIL\b)/i,/^(?:FOR\b)/i,/^(?:FOREIGN\b)/i,/^(?:FROM\b)/i,/^(?:FULL\b)/i,/^(?:GLOB\b)/i,/^(?:GROUP\b)/i,/^(?:HAVING\b)/i,/^(?:IF\b)/i,/^(?:IGNORE\b)/i,/^(?:IMMEDIATE\b)/i,/^(?:IN\b)/i,/^(?:USE\b)/i,/^(?:INDEX\b)/i,/^(?:INDEXED\b)/i,/^(?:INITIALLY\b)/i,/^(?:INNER\b)/i,/^(?:INSERT\b)/i,/^(?:INSTEAD\b)/i,/^(?:INTERSECT\b)/i,/^(?:INTO\b)/i,/^(?:IS\b)/i,/^(?:ISNULL\b)/i,/^(?:JOIN\b)/i,/^(?:KEY\b)/i,/^(?:LEFT\b)/i,/^(?:LIKE\b)/i,/^(?:CONTAINS\b)/i,/^(?:LIMIT\b)/i,/^(?:MATCH\b)/i,/^(?:NATURAL\b)/i,/^(?:NO\b)/i,/^(?:NOT\b)/i,/^(?:NOTNULL\b)/i,/^(?:NULL\b)/i,/^(?:UNDEFINED\b)/i,/^(?:OF\b)/i,/^(?:OFFSET\b)/i,/^(?:ON\b)/i,/^(?:OR\b)/i,/^(?:ORDER\b)/i,/^(?:OUTER\b)/i,/^(?:PLAN\b)/i,/^(?:PRAGMA\b)/i,/^(?:PRIMARY\b)/i,/^(?:QUERY\b)/i,/^(?:RAISE\b)/i,/^(?:RECURSIVE\b)/i,/^(?:REFERENCES\b)/i,/^(?:REGEXP\b)/i,/^(?:REINDEX\b)/i,/^(?:RELEASE\b)/i,/^(?:RENAME\b)/i,/^(?:REPLACE\b)/i,/^(?:RESTRICT\b)/i,/^(?:RIGHT\b)/i,/^(?:ROLLBACK\b)/i,/^(?:ROW\b)/i,/^(?:SELECT\b)/i,/^(?:SCAN\b)/i,/^(?:SET\b)/i,/^(?:TABLE\b)/i,/^(?:TEMP\b)/i,/^(?:THEN\b)/i,/^(?:TO\b)/i,/^(?:TRIGGER\b)/i,/^(?:UNION\b)/i,/^(?:UNIQUE\b)/i,/^(?:UPDATE\b)/i,/^(?:USING\b)/i,/^(?:VACUUM\b)/i,/^(?:VALUES\b)/i,/^(?:VIEW\b)/i,/^(?:WHEN\b)/i,/^(?:WHERE\b)/i,/^(?:WITH\b)/i,/^(?:TRUE\b)/i,/^(?:FALSE\b)/i,/^(?:SHOW\b)/i,/^(?:TABLES\b)/i,/^(?:STRING\b)/i,/^(?:NUMBER\b)/i,/^(?:THROUGHPUT\b)/i,/^(?:GSI\b)/i,/^(?:LSI\b)/i,/^(?:PROJECTION\b)/i,/^(?:ALL\b)/i,/^(?:KEYS_ONLY\b)/i,/^(?:[-]?(\d*[.])?\d+[eE]\d+)/i,/^(?:[-]?(\d*[.])?\d+)/i,/^(?:~)/i,/^(?:\+=)/i,/^(?:\+)/i,/^(?:-)/i,/^(?:\*)/i,/^(?:\/)/i,/^(?:%)/i,/^(?:>>)/i,/^(?:<<)/i,/^(?:<>)/i,/^(?:!=)/i,/^(?:>=)/i,/^(?:>)/i,/^(?:<=)/i,/^(?:<)/i,/^(?:=)/i,/^(?:&)/i,/^(?:\|)/i,/^(?:\()/i,/^(?:\))/i,/^(?:\{)/i,/^(?:\})/i,/^(?:\[)/i,/^(?:\])/i,/^(?:\.)/i,/^(?:,)/i,/^(?::)/i,/^(?:;)/i,/^(?:\$)/i,/^(?:\?)/i,/^(?:\^)/i,/^(?:[a-zA-Z_][a-zA-Z_0-9]*)/i,/^(?:$)/i,/^(?:.)/i],conditions:{INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173],inclusive:true}}};return lexer}();parser.lexer=lexer;function Parser(){this.yy={}}Parser.prototype=parser;parser.Parser=Parser;return new Parser}();if(typeof require!=="undefined"&&typeof exports!=="undefined"){exports.parser=parser;exports.Parser=parser.Parser;exports.parse=function(){return parser.parse.apply(parser,arguments)};exports.main=function commonjsMain(args){if(!args[1]){console.log("Usage: "+args[0]+" FILE");process.exit(1)}var source=require("fs").readFileSync(require("path").normalize(args[1]),"utf8");return exports.parser.parse(source)};if(typeof module!=="undefined"&&require.main===module){exports.main(process.argv.slice(1))}}
}).call(this,require('_process'))
},{"_process":6,"fs":1,"path":5}],10:[function(require,module,exports){
'use strict';

	// @todo: nice handling of throtteling https://github.com/aws/aws-sdk-js/issues/402 for now let aws take care of it

	var Promise = require('promise')
	var util = require('./util')
	var AWS = require('aws-sdk')

	var filterOperators = {
		EQ: '=',
		NE: '<>',
		LT: '<',
		LE: '<=',
		GT: '>',
		GE: '>=',

		BETWEEN: 'BETWEEN',
		IN: 'IN',

		NOT_NULL: 'attribute_exists',
		NULL:     'attribute_not_exists',

		BEGINS_WITH: 'begins_with',
		CONTAINS: 'contains',
		NOT_CONTAINS: 'not_contains',

	 }

	function DynamoDB ( $config ) {
		this.events = {
			error: function() {},
			beforeRequest: function() {}
		}

		// $config will not be an instance of DynamoDB becanse we have a different instance of AWS sdk loaded
		// aws had similar issues in the past: https://github.com/awslabs/dynamodb-document-js-sdk/issues/16

		// a way around to make sure it is an instance of AWS.DynamoDB
		if ((typeof $config === "object") && (($config.config || {}).hasOwnProperty('dynamoDbCrc32'))) {
		//if ($config instanceof AWS.DynamoDB) {
				this.client = $config
				return
		}


		// delay implementation of amazon-dax-client,
		// if node-gyp is not available during npm install,
		// amazon-dax-client will throw error when require('@awspilot/dynamodb')


		//if (process.version.match(/^v(\d+)/)[1] !== '0') {
		//	// amazon-dax-client does not work on node 0.x atm
		//	var AmazonDaxClient = require('amazon-dax-client')
		//	if ($config instanceof AmazonDaxClient) {
		//		this.client = $config
		//		$config = null
		//		return
		//	}
		//}


		if ($config && $config.hasOwnProperty('accessKeyId')) {
			$config.credentials = {
				accessKeyId: $config.accessKeyId,
				secretAccessKey: $config.secretAccessKey || null
			}
			delete $config.accessKeyId
			delete $config.secretAccessKey
		}

		if ($config)
			this.client = new AWS.DynamoDB($config)
		else
			this.client = new AWS.DynamoDB()


	}
	DynamoDB.prototype.SS = function(data) {
		if (Array.isArray(data))
			return new util.Raw({'SS': data })
		throw new Error('SS: argument should be a array')
	}
	DynamoDB.prototype.stringSet = DynamoDB.prototype.SS


	DynamoDB.prototype.N = function(data) {
		if (typeof data === "number" || typeof data === "string")
			return new util.Raw({'N': data.toString() })
		throw new Error('N: argument should be a number or string that converts to a number')
	}
	DynamoDB.prototype.number = DynamoDB.prototype.N


	DynamoDB.prototype.S = function(data) {
		if (typeof data === "string")
			return new util.Raw({'S': data })

		throw new Error('S: argument should be a string')
	}
	DynamoDB.prototype.string = DynamoDB.prototype.S

	DynamoDB.prototype.NS = function(data) {
		if (Array.isArray(data)) {
			var $to_ret = []
			return new util.Raw({'NS': data.map(function(el,idx) { return el.toString() }) })
		}
		throw new Error('NS: argument should be an Array')
	}
	DynamoDB.prototype.numberSet = DynamoDB.prototype.NS


	DynamoDB.prototype.L = function(data) {
		if (Array.isArray(data)) {
			var $to_ret = []
			for (var i in data) {
				$to_ret[i] = util.anormalizeValue( data[i] )
			}
			return new util.Raw({'L': $to_ret })
		}
		throw new Error('L: argument should be an Array')
	}
	DynamoDB.prototype.list = DynamoDB.prototype.L



	DynamoDB.prototype.add = function(data, datatype ) {
		// if datatype is defined then force it
		if (typeof datatype == "string") {
			switch (datatype) {
				case 'N':  return this.add(this.N(data));break
				case 'NS': return this.add(this.NS(data));break
				case 'SS': return this.add(this.SS(data));break
				case 'L':  return this.add(this.L(data));break

				// unsupported by AWS
				case 'B':
				case 'BOOL':
				case 'NULL':
				case 'S':
					throw new Error('ADD action is not supported for the type: ' + datatype );
					break

				// unsupported by aws-dynamodb
				case 'BS':
				case 'M':
				default:
					 throw new Error('ADD action is not supported by aws-dynamodb for type: ' + datatype );
					 break
			}
			return
		}

		// check if it is instance of Raw
		if ((typeof data === "object") && (data instanceof util.Raw )) {
			return new DynamoDB.Raw({
				Action: 'ADD',
				Value: data.data
			})
		}

		// autodetect

		// number or undefined: increment number, eg add(5), add()
		if ((typeof data === "number") || (typeof data === "undefined"))
			return this.add(this.N(data || 1));

		if (Array.isArray(data))
			return this.add(this.L(data));

		// further autodetection
		throw new Error('ADD action is not supported by aws-dynamodb for type: ' + typeof data );
	}

	DynamoDB.prototype.del = function(data, datatype) {
		// if datatype is defined then force it
		if (typeof datatype == "string") {
			switch (datatype) {
				case 'NS': return this.del(this.NS(data));break
				case 'SS': return this.del(this.SS(data));break

				// unsupported by AWS
				case 'S':
				case 'N':
				case 'L':
					throw new Error('DELETE action with value is not supported for the type: ' + datatype );
					break

				// unsupported by aws-dynamodb
				case 'B':
				case 'BOOL':
				case 'NULL':
				case 'BS':
				case 'M':
				default:
					 throw new Error('DELETE action is not supported by aws-dynamodb for type: ' + datatype );
					 break
			}
			return
		}

		// check if it is instance of Raw
		if ((typeof data === "object") && (data instanceof util.Raw )) {
			return new DynamoDB.Raw({
				Action: 'DELETE',
				Value: data.data
			})
		}

		// autodetect

		if (!arguments.length)
			return new DynamoDB.Raw({ Action: 'DELETE'})

		throw new Error('DELETE action is not supported by aws-dynamodb for type: ' + typeof data );
	}

	DynamoDB.prototype.table = function($tableName) {
		return new Request( this.client, this.events ).table($tableName)
	}

	DynamoDB.prototype.getClient = function() {
		return this.client
	}

	DynamoDB.prototype.on = function( event, handler ) {
		this.events[event] = handler
	}

	// select
	DynamoDB.prototype.ALL = 1
	DynamoDB.prototype.ALL_ATTRIBUTES = 1
	DynamoDB.prototype.PROJECTED = 2
	DynamoDB.prototype.ALL_PROJECTED_ATTRIBUTES = 2
	DynamoDB.prototype.COUNT = 3

	// ReturnValues
	DynamoDB.prototype.NONE = 'NONE'
	DynamoDB.prototype.ALL_OLD = 'ALL_OLD'
	DynamoDB.prototype.UPDATED_OLD = 'UPDATED_OLD'
	DynamoDB.prototype.ALL_NEW = 'ALL_NEW'
	DynamoDB.prototype.UPDATED_NEW = 'UPDATED_NEW'

	// ReturnConsumedCapacity
	//DynamoDB.prototype.NONE = 'NONE'
	DynamoDB.prototype.TOTAL = 'TOTAL'
	DynamoDB.prototype.INDEXES = 'INDEXES'

	function Request( $client, $events ) {
		this.events = $events // global events
		this.local_events = {}
		this.client = $client

		this.reset()
	}

	Request.prototype.reset = function() {
		//console.log("reseting")

		this.Select = null

		this.AttributesToGet = [] // deprecated in favor of ProjectionExpression
		this.ProjectionExpression = undefined
		this.ExpressionAttributeNames = undefined
		this.ExpressionAttributeValues = undefined

		this.FilterExpression = undefined

		this.pendingKey = null
		this.pendingFilter = null
		this.pendingIf = null

		this.whereKey = {}
		this.KeyConditionExpression = undefined

		this.whereOther = {}
		this.whereFilter = {}
		this.whereFilterExpression = []  // same as whereFilter, except we can support same attribute compared multiple times

		this.ifFilter = {}
		this.ifConditionExpression = []  // same as ifFilter, except we can support same attribute compared multiple times
		this.ConditionExpression = undefined

		this.limit_value = null
		this.IndexName = null
		this.ScanIndexForward = true
		this.LastEvaluatedKey = null
		this.ExclusiveStartKey = null
		this.ConsistentRead = false
		this.ReturnConsumedCapacity = 'TOTAL'
		this.ReturnValues = DynamoDB.NONE
		//this.ConsumedCapacity = null

	}

	Request.prototype.routeCall = function(method, params, reset ,callback ) {
		var $this = this
		this.events.beforeRequest.apply( this, [ method, params ])

		this.client[method]( params, function( err, data ) {

			if (err)
				$this.events.error.apply( $this, [ method, err , params ] )

			if ((data || {}).hasOwnProperty('ConsumedCapacity') )
				$this.ConsumedCapacity = data.ConsumedCapacity

			if ( reset === true )
				$this.reset()

			callback.apply( $this, [ err, data ] )
		})
	}
	Request.prototype.describeTable = function( table, callback ) {
		this.routeCall('describeTable', { TableName: table }, false, function(err,data) {
			return callback.apply( this, [ err, data ] )
		})
	}

	Request.prototype.describe = function( callback ) {
		this.routeCall('describeTable', { TableName: this.tableName }, true,function(err,raw) {
			if (err)
				return callback.apply( this, [ err ] )

			if (!raw.hasOwnProperty('Table'))
				return callback.apply( this, [ { errorMessage: "Invalid data. No Table Property in describeTable"} ] )

			var info = raw.Table
			delete info.TableStatus
			delete info.TableArn
			delete info.TableSizeBytes
			delete info.ItemCount
			delete info.CreationDateTime
			delete info.ProvisionedThroughput.NumberOfDecreasesToday
			delete info.ProvisionedThroughput.LastIncreaseDateTime
			delete info.ProvisionedThroughput.LastDecreaseDateTime
			if (info.hasOwnProperty('GlobalSecondaryIndexes')) {
				for (var i in info.GlobalSecondaryIndexes) {
					delete info.GlobalSecondaryIndexes[i].IndexSizeBytes
					delete info.GlobalSecondaryIndexes[i].IndexStatus
					delete info.GlobalSecondaryIndexes[i].ItemCount
					delete info.GlobalSecondaryIndexes[i].IndexArn
					delete info.GlobalSecondaryIndexes[i].ProvisionedThroughput.NumberOfDecreasesToday
				}
			}
			if (info.hasOwnProperty('LocalSecondaryIndexes')) {
				for (var i in info.LocalSecondaryIndexes) {
					delete info.LocalSecondaryIndexes[i].IndexSizeBytes
					delete info.LocalSecondaryIndexes[i].ItemCount
					delete info.LocalSecondaryIndexes[i].IndexArn
				}
			}
			return callback.apply( this, [ err, info, raw ] )
		})
	}

	Request.prototype.table = function($tableName) {
		this.tableName = $tableName;
		return this;
	}
	Request.prototype.on = function(eventName, callback ) {
		this.local_events[eventName] = callback
		return this
	}
	Request.prototype.select = function() {

		if (arguments.length === 1 && arguments[0] === DynamoDB.ALL_ATTRIBUTES ) {
			this.Select = 'ALL_ATTRIBUTES'
			return this
		}

		if (arguments.length === 1 && arguments[0] === DynamoDB.ALL_PROJECTED_ATTRIBUTES ) {
			this.Select = 'ALL_PROJECTED_ATTRIBUTES'
			return this
		}

		if (arguments.length === 1 && arguments[0] === 3 ) {
			this.Select = 'COUNT'
			return this
		}

		this.AttributesToGet = []

		for (var i = 0; i < arguments.length; i++)
			this.AttributesToGet.push(arguments[i])

		return this;
	}
	Request.prototype.return = function(rv) {
		this.ReturnValues = rv
		return this
	}
	Request.prototype.addSelect = function($field) {
		this.AttributesToGet.push($field)
		return this
	}

	Request.prototype.consistentRead = function( $value ) {
		if ($value === undefined ) {
			this.ConsistentRead = true
			return this
		}

		if ($value)
			this.ConsistentRead = true
		else
			this.ConsistentRead = false

		return this
	}
	Request.prototype.consistent_read = Request.prototype.consistentRead

	Request.prototype.return_consumed_capacity = function( $value ) { this.ReturnConsumedCapacity = $value; return this }
	Request.prototype.ReturnConsumedCapacity = Request.prototype.return_consumed_capacity

	Request.prototype.descending = function( ) {
		this.ScanIndexForward = false
		return this
	}
	Request.prototype.desc = Request.prototype.descending
	Request.prototype.index = function( $IndexName ) {
		this.IndexName = $IndexName
		return this
	}
	Request.prototype.order_by = Request.prototype.index

	Request.prototype.where = function($key,$value1,$value2) {
		if ($value1 === undefined ) {
			this.pendingKey = $key
			return this
		}

		if ($value2 === undefined) {
			this.whereKey[$key] = {'S' : $value1};

			if (typeof $value1 == "number")
				this.whereKey[$key] = {'N' : ($value1).toString() };

		} else {
			this.whereOther[$key] = {
				type: 'S',
				value: $value2,
				operator: $value1
			};
		}

		return this;
	}

	Request.prototype.insert = function(item, callback) {
		var $this = this

		if (typeof callback !== "function") {
			return new Promise(function(fullfill, reject) {
				$this.describeTable($this.tableName, function(err,data) {
					if (err)
						return reject(err)

					for (var i in data.Table.KeySchema ) {
						$this.if(data.Table.KeySchema[i].AttributeName).not_exists()
					}

					var $thisQuery = {
						TableName: $this.tableName,
						Item: util.anormalizeItem(item),
						Expected: util.buildExpected( $this.ifFilter ),
						ReturnConsumedCapacity: $this.ReturnConsumedCapacity,
						ReturnValues: $this.ReturnValues
					}

				if (typeof $this.local_events['beforeRequest'] === "function" )
						$this.local_events['beforeRequest']('updateItem', $thisQuery)

					$this.routeCall('putItem', $thisQuery ,true, function(err,data) {
						if (err)
							return reject(err)

						fullfill(util.normalizeItem(data.Attributes || {}))
					})
				})
			})
		}

		this.describeTable(this.tableName, function(err,data) {
			if (err)
				return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

			for (var i in data.Table.KeySchema ) {
				this.if(data.Table.KeySchema[i].AttributeName).not_exists()
			}

			var $thisQuery = {
				TableName: this.tableName,
				Item: util.anormalizeItem(item),
				Expected: util.buildExpected( this.ifFilter ),
				ReturnConsumedCapacity: this.ReturnConsumedCapacity,
				ReturnValues: this.ReturnValues
			}

			if (typeof this.local_events['beforeRequest'] === "function" )
				this.local_events['beforeRequest']('updateItem', $thisQuery)

			this.routeCall('putItem', $thisQuery ,true, function(err,data) {
				if (err)
					return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

				typeof callback !== "function" ? null : callback.apply( this, [ err, util.normalizeItem(data.Attributes || {}), data ])
			})
		})
	}

	// remember that replace should fail if item does not exist
	Request.prototype.replace = function(item, callback) {
		var $this = this
		if (typeof callback !== "function") {
			return new Promise(function(fullfill, reject) {
				$this.describeTable($this.tableName, function(err,data) {
					if (err)
						return reject(err)

					for (var i in data.Table.KeySchema ) {
						$this.if(data.Table.KeySchema[i].AttributeName).eq(item[ data.Table.KeySchema[i].AttributeName ])
					}

					var $thisQuery = {
						TableName: $this.tableName,
						Item: util.anormalizeItem(item),
						Expected: util.buildExpected( $this.ifFilter ),
						ReturnConsumedCapacity: $this.ReturnConsumedCapacity,
						ReturnValues: $this.ReturnValues
					}

					$this.routeCall('putItem', $thisQuery, true , function(err,data) {
						if (err)
							return reject(err)

						fullfill(util.normalizeItem(data.Attributes || {}))
					})
				})
			})
		}

		this.describeTable(this.tableName, function(err,data) {
			if (err)
				return callback(err, false)

			for (var i in data.Table.KeySchema ) {
				this.if(data.Table.KeySchema[i].AttributeName).eq(item[ data.Table.KeySchema[i].AttributeName ])
			}

			var $thisQuery = {
				TableName: this.tableName,
				Item: util.anormalizeItem(item),
				Expected: util.buildExpected( this.ifFilter ),
				ReturnConsumedCapacity: this.ReturnConsumedCapacity,
				ReturnValues: this.ReturnValues
			}

			this.routeCall('putItem', $thisQuery, true , function(err,data) {
				if (err)
					return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

				typeof callback !== "function" ? null : callback.apply( this, [ err, util.normalizeItem(data.Attributes || {}), data ])
			})
		})
	}

	Request.prototype.update = function($attrz, callback, $action ) {
		var $this = this

		if (typeof callback !== "function") {
			return new Promise(function(fullfill, reject) {

				$this.describeTable($this.tableName, function(err,data) {
					if (err)
						return reject(err)

					for (var i in data.Table.KeySchema ) {
						if (!$this.whereKey.hasOwnProperty(data.Table.KeySchema[i].AttributeName)) {
							// aws will throw: Uncaught ValidationException: The provided key element does not match the schema
							// we're throwing a more understandable error
							return reject({message: "Uncaught ValidationException: Missing value for Attribute '" + data.Table.KeySchema[i].AttributeName + "' in .where()" })
						} else {
							$this.if(data.Table.KeySchema[i].AttributeName).eq(util.normalizeItem({key: $this.whereKey[ data.Table.KeySchema[i].AttributeName ]}).key )
						}
					}

					var $to_update = {}
					for (var $k in $attrz) {
						if ($attrz.hasOwnProperty($k)) {
							if ($attrz[$k] === undefined ) {
								$to_update[$k] = {
									Action: $action ? $action : 'DELETE',
								}
							} else if ($attrz[$k] instanceof DynamoDB.Raw) {
								$to_update[$k] = $attrz[$k].getRawData()
							} else {
								$to_update[$k] = {
									Action: $action ? $action : 'PUT',
									Value: util.anormalizeValue($attrz[$k])
								}
							}
						}
					}
					//this.buildConditionExpression()
					var $thisQuery = {
						TableName: $this.tableName,
						Key: $this.whereKey,

						Expected: util.buildExpected( $this.ifFilter ),

						//ConditionExpression: $this.ConditionExpression,
						//ExpressionAttributeNames: $this.ExpressionAttributeNames,
						//ExpressionAttributeValues: $this.ExpressionAttributeValues,

						//UpdateExpression
						AttributeUpdates : $to_update,

						ReturnConsumedCapacity: $this.ReturnConsumedCapacity,
						ReturnValues: $this.ReturnValues,

					}

					if (typeof $this.local_events['beforeRequest'] === "function" )
						$this.local_events['beforeRequest']('updateItem', $thisQuery)

					$this.routeCall('updateItem', $thisQuery, true , function(err,data) {
						if (err)
							return reject(err)

						fullfill(util.normalizeItem(data.Attributes || {}))
					})
				})
			})
		}

		this.describeTable(this.tableName, function(err,data) {
			if (err)
				return typeof callback !== "function" ? null : callback(err, false)

			for (var i in data.Table.KeySchema ) {
				if (!this.whereKey.hasOwnProperty(data.Table.KeySchema[i].AttributeName)) {
					// aws will throw: Uncaught ValidationException: The provided key element does not match the schema
					// we're throwing a more understandable error
					typeof callback !== "function" ? null : callback.apply( this, [{message: "Uncaught ValidationException: Missing value for Attribute '" + data.Table.KeySchema[i].AttributeName + "' in .where()" }])
				} else {
					this.if(data.Table.KeySchema[i].AttributeName).eq(util.normalizeItem({key: this.whereKey[ data.Table.KeySchema[i].AttributeName ]}).key )
				}

			}

			var $to_update = {}
			for (var $k in $attrz) {
				if ($attrz.hasOwnProperty($k)) {
					if ($attrz[$k] === undefined ) {
						$to_update[$k] = {
							Action: $action ? $action : 'DELETE',
						}
					} else if ($attrz[$k] instanceof DynamoDB.Raw) {
						$to_update[$k] = $attrz[$k].getRawData()
					} else {
						$to_update[$k] = {
							Action: $action ? $action : 'PUT',
							Value: util.anormalizeValue($attrz[$k])
						}
					}
				}
			}
			//this.buildConditionExpression()
			var $thisQuery = {
				TableName: this.tableName,
				Key: this.whereKey,


				Expected: util.buildExpected( this.ifFilter ),

				//ConditionExpression: this.ConditionExpression,
				//ExpressionAttributeNames: this.ExpressionAttributeNames,
				//ExpressionAttributeValues: this.ExpressionAttributeValues,

				//UpdateExpression
				AttributeUpdates : $to_update,

				ReturnConsumedCapacity: this.ReturnConsumedCapacity,
				ReturnValues: this.ReturnValues,

			}

			if (typeof this.local_events['beforeRequest'] === "function" )
				this.local_events['beforeRequest']('updateItem', $thisQuery)

			this.routeCall('updateItem', $thisQuery, true , function(err,data) {
				if (err)
					return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

				typeof callback !== "function" ? null : callback.apply( this, [ err, util.normalizeItem(data.Attributes || {}), data ])
			})
		})
	}

	Request.prototype.insert_or_update = function( params, callback, $action ) {
		var $this = this
		var $attrz = util.clone( params )

		if (typeof callback !== "function") {
			return new Promise(function(fullfill, reject) {

				$this.describeTable($this.tableName, function(err,data) {
					if (err)
						return reject(err)

					// extract the hash/range keys
					for (var i in data.Table.KeySchema ) {
						$this.where(data.Table.KeySchema[i].AttributeName).eq( $attrz[data.Table.KeySchema[i].AttributeName])
						delete $attrz[data.Table.KeySchema[i].AttributeName]
					}
					var $to_update = {}
					for (var $k in $attrz) {
						if ($attrz.hasOwnProperty($k)) {
							if ($attrz[$k] === undefined ) {
								$to_update[$k] = {
									Action: $action ? $action : 'DELETE',
								}
							} else if ($attrz[$k] instanceof DynamoDB.Raw) {
								$to_update[$k] = $attrz[$k].getRawData()
							} else {
								$to_update[$k] = {
									Action: $action ? $action : 'PUT',
									Value: util.anormalizeValue($attrz[$k])
								}
							}
						}
					}
					var $thisQuery = {
						TableName: $this.tableName,
						Key: $this.whereKey,
						AttributeUpdates : $to_update,
						ReturnConsumedCapacity: $this.ReturnConsumedCapacity,
						ReturnValues: $this.ReturnValues
					}
					$this.routeCall('updateItem', $thisQuery, true , function(err,data) {
						if (err)
							return reject(err)

						fullfill(util.normalizeItem(data.Attributes || {}))
					})
				})
			})
		}



		this.describeTable(this.tableName, function(err,data) {
			if (err)
				return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

			// extract the hash/range keys
			for (var i in data.Table.KeySchema ) {
				this.where(data.Table.KeySchema[i].AttributeName).eq( $attrz[data.Table.KeySchema[i].AttributeName])
				delete $attrz[data.Table.KeySchema[i].AttributeName]
			}
			var $to_update = {}
			for (var $k in $attrz) {
				if ($attrz.hasOwnProperty($k)) {
					if ($attrz[$k] === undefined ) {
						$to_update[$k] = {
							Action: $action ? $action : 'DELETE',
						}
					} else if ($attrz[$k] instanceof DynamoDB.Raw) {
						$to_update[$k] = $attrz[$k].getRawData()
					} else {
						$to_update[$k] = {
							Action: $action ? $action : 'PUT',
							Value: util.anormalizeValue($attrz[$k])
						}
					}
				}
			}
			var $thisQuery = {
				TableName: this.tableName,
				Key: this.whereKey,
				AttributeUpdates : $to_update,
				ReturnConsumedCapacity: this.ReturnConsumedCapacity,
				ReturnValues: this.ReturnValues
			}
			this.routeCall('updateItem', $thisQuery, true , function(err,data) {
				if (err)
					return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

				typeof callback !== "function" ? null : callback.apply( this, [ err, util.normalizeItem(data.Attributes || {}), data ])
			})
		})
	}

	Request.prototype.insert_or_replace = function( item, callback ) {
		var $this = this

		var $thisQuery = {
			TableName: this.tableName,
			Item: util.anormalizeItem(item),
			ReturnConsumedCapacity: this.ReturnConsumedCapacity,
			ReturnValues: this.ReturnValues
		}

		if (typeof this.local_events['beforeRequest'] === "function" )
			this.local_events['beforeRequest']('putItem', $thisQuery)

		if (typeof callback !== "function") {
			return new Promise(function(fullfill, reject) {
				$this.routeCall('putItem', $thisQuery , true, function(err,data) {
					if (err)
						return reject(err)

					fullfill(util.normalizeItem(data.Attributes || {}))
				})
			})
		}

		this.routeCall('putItem', $thisQuery , true , function(err,data) {
			if (err)
				return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

			typeof callback !== "function" ? null : callback.apply( this, [ err, util.normalizeItem(data.Attributes || {}), data ])
		})
	}

	Request.prototype.delete = function($attrz, callback ) {
		var $this = this

		if ( arguments.length === 0) {
			var $thisQuery = {
				TableName: this.tableName,
				Key: this.whereKey,
				ReturnConsumedCapacity: this.ReturnConsumedCapacity,
				ReturnValues: this.ReturnValues
			}
			return new Promise(function(fullfill, reject) {
				$this.routeCall('deleteItem', $thisQuery , true, function(err,data) {
					if (err)
						return reject(err)

					fullfill(util.normalizeItem(data.Attributes || {}))
				})
			})
		} else if (typeof $attrz == 'function') {
			// delete entire item, $attrz is actually the callback

			var $thisQuery = {
				TableName: this.tableName,
				Key: this.whereKey,
				ReturnConsumedCapacity: this.ReturnConsumedCapacity,
				ReturnValues: this.ReturnValues
			}
			this.routeCall('deleteItem', $thisQuery, true , function(err,data) {
				if (err)
					return $attrz.apply( this, [ err, false ] )

				$attrz.apply( this, [ err, util.normalizeItem(data.Attributes || {}), data ])
			})
		} else {
			// delete attributes
			var $to_delete = {};
			for (var $i = 0; $i < $attrz.length;$i++) {
				$to_delete[$attrz[$i]] = {
					Action: 'DELETE'
				}
			}
			var $thisQuery = {
				TableName: this.tableName,
				Key: this.whereKey,
				AttributeUpdates : $to_delete,
				ReturnConsumedCapacity: this.ReturnConsumedCapacity,
				ReturnValues: this.ReturnValues
			}
			this.routeCall('updateItem', $thisQuery , true , function(err,data) {
				if (err)
					return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

				typeof callback !== "function" ? null : callback.apply( this, [ err, util.normalizeItem(data.Attributes || {}), data ])
			})
		}
	}

	Request.prototype.get = function(callback) {
		var $this = this
		this.buildProjectionExpression() // this will set ProjectionExpression and ExpressionAttributeNames
		var $thisQuery = {
			TableName: this.tableName,
			Key: this.whereKey,
			ConsistentRead: this.ConsistentRead,
			ReturnConsumedCapacity: this.ReturnConsumedCapacity,

			ProjectionExpression: this.ProjectionExpression,
			ExpressionAttributeNames: this.ExpressionAttributeNames,
		}

		if (typeof callback !== "function") {
			return new Promise(function(fullfill, reject) {
				$this.routeCall('getItem', $thisQuery , true, function(err,data) {
					if (err)
						return reject(err)

					fullfill(util.normalizeItem(data.Item))
				})
			})
		}


		this.routeCall('getItem', $thisQuery , true, function(err,data) {
			if (err)
				return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

			typeof callback !== "function" ? null : callback.apply( this, [ err, util.normalizeItem(data.Item), data ])
		})
	}

	Request.prototype.query = function(callback) {
		var $this = this
		this.buildProjectionExpression() // this will set ProjectionExpression and ExpressionAttributeNames
		this.buildFilterExpression()
		this.buildKeyConditionExpression()
		var $thisQuery = {
			TableName: this.tableName,

			//KeyConditions: this.anormalizeQuery(),
			KeyConditionExpression: this.KeyConditionExpression,

			ConsistentRead: this.ConsistentRead,
			ReturnConsumedCapacity: this.ReturnConsumedCapacity,

			"Select": this.Select !== null ? this.Select : undefined,
			//AttributesToGet: this.AttributesToGet.length ? this.AttributesToGet : undefined

			ProjectionExpression: this.ProjectionExpression,
			ExpressionAttributeNames: this.ExpressionAttributeNames,

			FilterExpression: this.FilterExpression,

			ExpressionAttributeValues: this.ExpressionAttributeValues,
		}
		if (this.limit_value !== null)
			$thisQuery['Limit'] = this.limit_value;

		if (this.ScanIndexForward !== true) {
				$thisQuery['ScanIndexForward'] = false;
		}
		if ( this.IndexName !== null )
			$thisQuery['IndexName'] = this.IndexName;

		if ( this.ExclusiveStartKey !== null )
			$thisQuery['ExclusiveStartKey'] = this.ExclusiveStartKey;

		if (typeof this.local_events['beforeRequest'] === "function" )
			this.local_events['beforeRequest']('updateItem', $thisQuery)

		if (typeof callback !== "function") {
			return new Promise(function(fullfill, reject) {
				$this.routeCall('query', $thisQuery , true, function(err,data) {
					if (err)
						return reject(err)

					fullfill(util.normalizeList(data.Items))
				})
			})
		}

		this.routeCall('query', $thisQuery , true , function(err,data) {
			if (err)
				return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

			this.LastEvaluatedKey = data.LastEvaluatedKey === undefined ? null : data.LastEvaluatedKey

			typeof callback !== "function" ? null : callback.apply( this, [ err, util.normalizeList(data.Items), data ])
		})

		return this
	}

	Request.prototype.scan = function( callback ) {
		var $this = this
		this.buildProjectionExpression() // this will set ProjectionExpression and ExpressionAttributeNames
		this.buildFilterExpression()
		var $thisQuery = {
			TableName: this.tableName,
			"Select": this.Select !== null ? this.Select : undefined,

			ProjectionExpression: this.ProjectionExpression,
			ExpressionAttributeNames: this.ExpressionAttributeNames,

			FilterExpression: this.FilterExpression,

			ExpressionAttributeValues: this.ExpressionAttributeValues,

			ReturnConsumedCapacity: this.ReturnConsumedCapacity
		}

		if (this.limit_value !== null)
			$thisQuery['Limit'] = this.limit_value;


		if ( this.ExclusiveStartKey !== null )
			$thisQuery['ExclusiveStartKey'] = this.ExclusiveStartKey;

		if ( this.IndexName !== null )
			$thisQuery['IndexName'] = this.IndexName;

		if (typeof callback !== "function") {
			return new Promise(function(fullfill, reject) {
				$this.routeCall('scan', $thisQuery , true, function(err,data) {
					if (err)
						return reject(err)

					fullfill(util.normalizeList(data.Items))
				})
			})
		}

		this.routeCall('scan', $thisQuery, true , function(err,data) {
			if (err)
				return typeof callback !== "function" ? null : callback.apply( this, [ err, false ] )

			this.LastEvaluatedKey = data.LastEvaluatedKey === undefined ? null : data.LastEvaluatedKey

			typeof callback !== "function" ? null : callback.apply( this, [ err, util.normalizeList(data.Items), data ])

		})
	}

	Request.prototype.resume = function( from ) {
		this.ExclusiveStartKey = from
		return this
	}
	Request.prototype.compare = function( $comparison, $value , $value2 ) {
		if (this.pendingFilter !== null) {
			this.whereFilter[this.pendingFilter] = {
				operator: $comparison,
				type: util.anormalizeType($value),
				value: $value,
				value2: $value2
			}
			this.whereFilterExpression.push({
				attribute: this.pendingFilter,
				operator: $comparison,
				type: util.anormalizeType($value),
				value: $value,
				value2: $value2
			})
			this.pendingFilter = null
			return this
		}

		if (this.pendingIf !== null) {
			if ($comparison == 'EQ') {
				this.ifFilter[this.pendingIf] = new util.Raw({ Exists: true, Value: util.anormalizeValue($value) })
			} else {
				this.ifFilter[this.pendingIf] = { operator: $comparison, type: util.anormalizeType($value), value: $value, value2: $value2 }
			}

			this.ifConditionExpression.push({
				attribute: this.pendingIf,
				operator: $comparison,
				type: util.anormalizeType($value),
				value: $value,
				value2: $value2
			})

			this.pendingIf = null
			return this
		}

		this.whereOther[this.pendingKey] = { operator: $comparison, type: util.anormalizeType($value), value: $value, value2: $value2 }
		this.pendingKey = null
		return this
	}

	Request.prototype.filter = function($key) {
		this.pendingFilter = $key
		return this
	}
	// alias
	Request.prototype.having = Request.prototype.filter

	Request.prototype.if = function($key) {
		this.pendingIf = $key
		return this
	}

	Request.prototype.limit = function($limit) {
		this.limit_value = $limit;
		return this;
	}

	// comparison functions
	Request.prototype.eq = function( $value ) {
		if (this.pendingFilter !== null)
			return this.compare( 'EQ', $value )

		if (this.pendingIf !== null)
			return this.compare( 'EQ', $value )

		this.whereKey[this.pendingKey] = util.anormalizeValue( $value )

		this.pendingKey = null

		return this
	}
	Request.prototype.le = function( $value ) {
		return this.compare( 'LE', $value )
	}
	Request.prototype.lt = function( $value ) {
		return this.compare( 'LT', $value )
	}
	Request.prototype.ge = function( $value ) {
		return this.compare( 'GE', $value )
	}
	Request.prototype.gt = function( $value ) {
		return this.compare( 'GT', $value )
	}
	Request.prototype.begins_with = function( $value ) {
		return this.compare( 'BEGINS_WITH', $value )
	}
	Request.prototype.between = function( $value1, $value2 ) {
		return this.compare( 'BETWEEN', $value1, $value2 )
	}

	// QueryFilter only
	Request.prototype.ne = function( $value ) {
		return this.compare( 'NE', $value )
	}
	Request.prototype.not_null = function( ) {
		return this.compare( 'NOT_NULL' )
	}
	Request.prototype.defined = Request.prototype.not_null
	Request.prototype.null = function( $value ) {
		return this.compare( 'NULL' )
	}
	Request.prototype.undefined = Request.prototype.null
	Request.prototype.contains = function( $value ) {
		return this.compare( 'CONTAINS', $value )
	}
	Request.prototype.not_contains = function( $value ) {
		return this.compare( 'NOT_CONTAINS', $value )
	}
	Request.prototype.in = function( $value ) {
		return this.compare( 'IN', $value )
	}

	// Expected only
	Request.prototype.exists = function( ) {
		if (this.pendingIf !== null) {
			this.ifFilter[this.pendingIf] = new util.Raw({ Exists: true })

			this.pendingIf = null
			return this
		}
		return this
	}
	Request.prototype.not_exists = function( ) {
		if (this.pendingIf !== null) {
			this.ifFilter[this.pendingIf] = new util.Raw({ Exists: false })
			this.pendingIf = null
			return this
		}
		return this
	}

	// helper functions ...
	Request.prototype.anormalizeQuery = function() {
		var anormal = {}
		for (var key in this.whereKey) {
			if (this.whereKey.hasOwnProperty(key)) {
					anormal[key] = {
						ComparisonOperator: 'EQ',
						AttributeValueList: [ this.whereKey[key] ]
					}
			}
		}
		for (var key in this.whereOther) {
			if (this.whereOther.hasOwnProperty(key)) {
					var whereVal = {}

					if (this.whereOther[key].hasOwnProperty('value2') && this.whereOther[key].value2 !== undefined ) {
						anormal[key] = {
							ComparisonOperator: this.whereOther[key].operator,
							AttributeValueList: [ util.anormalizeValue( this.whereOther[key].value ), util.anormalizeValue( this.whereOther[key].value2 ) ]
						}
					} else {
						anormal[key] = {
							ComparisonOperator: this.whereOther[key].operator,
							AttributeValueList: [ util.anormalizeValue( this.whereOther[key].value ) ]
						}
					}
			}
		}
		return anormal;
	}


	Request.prototype.registerExpressionAttributeName = function(item, ALLOW_DOT ) {
		var $this = this

		if ($this.ExpressionAttributeNames === undefined)
			$this.ExpressionAttributeNames = {}



		if (!ALLOW_DOT)
			return util.expression_name_split(item).map(function(original_attName) {

				var attName =  original_attName.split('-').join('_minus_').split('.').join('_dot_') // "-","." not allowed
				var attSpecialName = '#' + attName


				if (attName.indexOf('[') !== -1) {
					attSpecialName = attName.split('[').map(function(v) {
						if (v[v.length-1] == ']')
							return v

						$this.ExpressionAttributeNames[ '#'+v ] = v
						return '#' + v
					}).join('[')
				} else {
					if (attSpecialName[0] === '#')
						$this.ExpressionAttributeNames[ attSpecialName ] = original_attName
				}

				return attSpecialName
			}).join('.')


		//if (ALLOW_DOT)
		var original_attName = item
		var attName =  original_attName.split('-').join('_minus_').split('.').join('_dot_') // "-","." not allowed

		var attSpecialName = '#' + attName


		if (attName.indexOf('[') !== -1) {
			attSpecialName = attName.split('[').map(function(v) {
				if (v[v.length-1] == ']')
					return v

				$this.ExpressionAttributeNames[ '#'+v ] = v
				return '#' + v
			}).join('[')
		} else {
			if (attSpecialName[0] === '#')
				$this.ExpressionAttributeNames[ attSpecialName ] = original_attName
		}

		return attSpecialName

	}
	Request.prototype.registerExpressionAttributeValue = function(original_attName, value) {
		if (this.ExpressionAttributeValues === undefined)
			this.ExpressionAttributeValues = {}

		var attName = original_attName.split('-').join('_minus_').split('"').join("_quote_") // "-" not allowed

		var attNameValue = ':' + attName.split('.').join('_').split('[').join('_idx_').split(']').join('')

		var attNameValueVersion = 1;
		while (this.ExpressionAttributeValues.hasOwnProperty(attNameValue+'_v'+attNameValueVersion)) attNameValueVersion++

		this.ExpressionAttributeValues[attNameValue+'_v'+attNameValueVersion] = util.anormalizeValue( value )

		return attNameValue+'_v'+attNameValueVersion
	}

	Request.prototype.buildProjectionExpression = function(idx) {
		if (!this.AttributesToGet.length)
			return

		idx = idx || 'att'

		var $this = this

		this.ProjectionExpression = this.AttributesToGet.map(function(item) {
			return $this.registerExpressionAttributeName(item)
		}).join(', ')
	}

	//
	Request.prototype.buildKeyConditionExpression = function(idx) {
		var $this = this
		var ret = []
		this.KeyConditionExpression = Object.keys(this.whereKey).map(function(key) {
			return $this.registerExpressionAttributeName(key, true ) + ' ' +
				'=' + ' ' +
				$this.registerExpressionAttributeValue(key, util.normalizeItem({value: $this.whereKey[key] }).value, true )
		}).concat(
			Object.keys(this.whereOther).map(function(key) {
				var whereFilter = $this.whereOther[key]

				switch (filterOperators[whereFilter.operator]) {
					case '=':
					case '<':
					case '<=':
					case '>':
					case '>=':
						return $this.registerExpressionAttributeName(key, true ) + ' ' +
							filterOperators[whereFilter.operator] + ' ' +
							$this.registerExpressionAttributeValue(key, whereFilter.value, true )
						break

					case  'BETWEEN':
						return $this.registerExpressionAttributeName(key, true ) + ' BETWEEN ' +
							$this.registerExpressionAttributeValue(key+'_1', whereFilter.value, true ) +
							' AND ' +
							$this.registerExpressionAttributeValue(key+'_2', whereFilter.value2, true )
						break;

					case 'begins_with':
						return 'begins_with(' + $this.registerExpressionAttributeName(key, true ) + ', ' + $this.registerExpressionAttributeValue(key, whereFilter.value, true ) + ')'
						break;

				}
			})
		).map(function(v) { return '( ' + v + ' )'}).join(" AND \n")
	}

	Request.prototype.buildFilterExpression = function(idx) {
		var $this = this

		if (!this.whereFilterExpression.length)
			return

		var ret = []
		this.FilterExpression = this.whereFilterExpression.map(function(whereFilter) {
			var key = whereFilter.attribute

			switch (filterOperators[whereFilter.operator]) {
				case '=':
				case '<>':
				case '<':
				case '<=':
				case '>':
				case '>=':
					return $this.registerExpressionAttributeName(whereFilter.attribute) + ' ' +
						filterOperators[whereFilter.operator] + ' ' +
						$this.registerExpressionAttributeValue(whereFilter.attribute, whereFilter.value)
					break

				case  'BETWEEN':
					return $this.registerExpressionAttributeName(whereFilter.attribute) + ' BETWEEN ' +
						$this.registerExpressionAttributeValue(whereFilter.attribute+'_1', whereFilter.value) +
						' AND ' +
						$this.registerExpressionAttributeValue(whereFilter.attribute+'_2', whereFilter.value2)
					break;

				case 'IN':
					return $this.registerExpressionAttributeName(whereFilter.attribute) + ' IN (' +
							whereFilter.value.map(function(v, idx) {
								return $this.registerExpressionAttributeValue(whereFilter.attribute+'_' + idx, v)
							}).join(',')  +
						' )'
					break;


				case 'attribute_exists':
					return 'attribute_exists(' + $this.registerExpressionAttributeName(whereFilter.attribute) + ')'
					break;

				case 'attribute_not_exists':
					return 'attribute_not_exists(' + $this.registerExpressionAttributeName(whereFilter.attribute) + ')'
					break;

				case 'begins_with':
					return 'begins_with(' + $this.registerExpressionAttributeName(whereFilter.attribute) + ', ' + $this.registerExpressionAttributeValue(whereFilter.attribute, whereFilter.value) + ')'
					break;

				case 'contains':
					return 'contains(' + $this.registerExpressionAttributeName(whereFilter.attribute) + ', ' + $this.registerExpressionAttributeValue(whereFilter.attribute, whereFilter.value) + ')'
					break;

				case 'not_contains':
					return 'NOT contains(' + $this.registerExpressionAttributeName(whereFilter.attribute) + ', ' + $this.registerExpressionAttributeValue(whereFilter.attribute, whereFilter.value) + ')'
					break;
				//attribute_type (path, type)
				//size (path)
			}
		}).map(function(v) { return '( ' + v + ' )'}).join(" AND \n")
	}

DynamoDB.Raw = function(data) {
	this.data = data
}
DynamoDB.Raw.prototype.getRawData = function() {
	return this.data
}
module.exports = function ( $config ) {
	return new DynamoDB($config)
}

},{"./util":11,"aws-sdk":"aws-sdk","promise":"promise"}],11:[function(require,module,exports){
(function (Buffer){

var DynamoUtil = {}

DynamoUtil.Raw = function(data) {
	this.data = data
}

DynamoUtil.anormalizeList = function(list) {
	var $ret = []
	for (var $i in list) {
		$ret.push(DynamoUtil.anormalizeItem(list[$i]))
	}
	return $ret;
}

DynamoUtil.anormalizeItem = function(item) {
	var anormal = {}
	for (var key in item) {
		if (item.hasOwnProperty(key)) {
			anormal[key] = DynamoUtil.anormalizeValue(item[key])
		}
	}
	return anormal;
}


DynamoUtil.anormalizeValue = function( $value ) {
	if (typeof $value == 'boolean')
		return {'BOOL' : $value }

	if (typeof $value == 'number')
		return {'N' : $value.toString() }

	if (typeof $value == 'string')
		return {'S' : $value }

	if ($value === null)
		return {'NULL' : true }

	if ($value instanceof Buffer)
		return {'B' : $value }

	// stringSet, numberSet
	if ((typeof $value == 'object') && ($value instanceof DynamoUtil.Raw) ) {
		return $value.data
	}

	if (typeof $value == 'object') {
		if(Array.isArray($value) ) {
			var to_ret = {'L': [] }
			for (var i in $value) {
				if ($value.hasOwnProperty(i)) {
					to_ret.L[i] = DynamoUtil.anormalizeValue($value[i] )
				}
			}
			return to_ret
		}

		var to_ret = {'M': {} }
		for (var i in $value) {
			if ($value.hasOwnProperty(i)) {
					to_ret.M[i] = DynamoUtil.anormalizeValue($value[i] )
				}
			}
			return to_ret
	}

	// @todo: support other types
}

DynamoUtil.anormalizeType = function( $value ) {
	if (typeof $value == 'boolean')
		return 'BOOL'

	if (typeof $value == 'number')
		return 'N'

	if (typeof $value == 'string')
		return 'S'

	if (Array.isArray($value))
		return 'L'

	if ($value === null) {
		return 'NULL'
	}
	// @todo: support other types
}

DynamoUtil.normalizeList = function($items) {
	var $list = []
	for (var i in $items) {
		$list.push(DynamoUtil.normalizeItem($items[i]))
	}
	return $list;
}

DynamoUtil.normalizeItem = function($item) {
	// disabled for now so we dont break compatibility with older versions, should return null on undefined $item
	//if (!$item)
	//	return null

	var normal = {}
	for (var key in $item) {
		if ($item.hasOwnProperty(key)) {
			if ($item[key].hasOwnProperty('S'))
				normal[key] = $item[key]['S']

			if ($item[key].hasOwnProperty('N'))
				normal[key] = +($item[key]['N'])

			if ($item[key].hasOwnProperty('BOOL'))
				normal[key] = $item[key]['BOOL']

			if ($item[key].hasOwnProperty('NULL'))
				normal[key] = null

			if ($item[key].hasOwnProperty('B'))
				normal[key] = $item[key]['B']

			if ($item[key].hasOwnProperty('SS'))
				normal[key] = $item[key]['SS']

			if ($item[key].hasOwnProperty('NS')) {
				normal[key] = []
				$item[key]['NS'].forEach(function(el,idx) {
					normal[key].push(parseFloat(el))
				})
			}

			if ($item[key].hasOwnProperty('L')){
				normal[key] = []
				for (var i in $item[key]['L'] ) {
					if ($item[key]['L'].hasOwnProperty(i)) {
						normal[key][i] = DynamoUtil.normalizeItem({
								key: $item[key]['L'][i]
						}).key
					}
				}
			}

			if ($item[key].hasOwnProperty('M')) {
				normal[key] = {}
				for (var i in $item[key]['M'] ) {
					if ($item[key]['M'].hasOwnProperty(i)) {
						normal[key][i] = DynamoUtil.normalizeItem({
								key: $item[key]['M'][i]
						}).key
					}
				}
			}
		}
	}
	return normal;
}


DynamoUtil.buildExpected = function( $expected ) {
	var anormal = {}

	for (var key in $expected ) {
		if ($expected.hasOwnProperty(key)) {

				var whereVal = {}

				if ((typeof $expected[key] == 'object') && ($expected[key] instanceof DynamoUtil.Raw) ) {
					anormal[key] = $expected[key].data
				} else if ($expected[key].hasOwnProperty('value2') && $expected[key].value2 !== undefined ) {
					anormal[key] = {
						ComparisonOperator: $expected[key].operator,
						AttributeValueList: [ DynamoUtil.anormalizeValue( $expected[key].value ), DynamoUtil.anormalizeValue( $expected[key].value2 ) ]
					}
				} else {
					anormal[key] = {
						ComparisonOperator: $expected[key].operator,
						AttributeValueList: [ DynamoUtil.anormalizeValue( $expected[key].value ) ]
					}
				}
		}
	}
	return anormal
}


DynamoUtil.expression_name_split = function(item) {
	var ret = []
	var split = ''
	var in_brackets = false
	for (var i = 0;i<item.length;i++) {
		if (in_brackets) {
			if (item[i] == '"') {
				in_brackets = false
				ret.push(split)
				split = ''
			} else {
				split+=item[i]
			}
		} else {
			if (item[i] == '"') {
				in_brackets = true
			} else {
				if (item[i] == '.') {
					ret.push(split)
					split = ''
				} else {
					split+=item[i]
				}
			}
		}
	}
	ret.push(split)
	return ret.filter(function(v) { return v.trim() !== '' })
}
DynamoUtil.clone = function ( source) {

	var from;
	var to = Object({});
	var symbols;

	for (var s = 0; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (Object.prototype.hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (Object.prototype.propertyIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
}

module.exports = DynamoUtil

}).call(this,require("buffer").Buffer)
},{"buffer":2}]},{},[7]);
