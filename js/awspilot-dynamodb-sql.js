(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"base64-js":2,"ieee754":3}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
window['@awspilot/dynamodb-sql'] = require('./lib/dynamodb')

},{"./lib/dynamodb":5}],5:[function(require,module,exports){
(function (global){
'use strict';
var AWS = (typeof window !== "undefined" ? window['AWS'] : typeof global !== "undefined" ? global['AWS'] : null)
var sqlparser = require('./sqlparser')


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
	try {
		var $parsed = sqlparser.parse(sqlparser.cleanup_sql($query),$replaces)
	} catch(e){
		return $cb(e)
	}

	switch ($parsed.type) {
		case 'SHOW_TABLES':
			this.db.client.listTables({}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb(null, data)
			} )
			break
		case 'DESCRIBE_TABLE':
			this.db.client.describeTable({TableName: $parsed.o.tableName}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'DROP_TABLE':
			this.db.client.deleteTable({TableName: $parsed.o.tableName}, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'DROP_INDEX':
			this.db.client.updateTable($parsed.o, function(err, data) {
				if (err)
					return $cb(err)

				return $cb( null, data )
			} )
			break
		case 'INSERT':
			this.db.table($parsed.o.tableName).insert( $parsed.o.KV, $cb )
			break
		case 'UPDATE':
			var $db = this.db.table($parsed.o.tableName)
			Object.keys($parsed.o.WHERE).map(function(k) {
				$db.where(k).eq($parsed.o.WHERE[k])
			})
			var $update = {}
			var $this = this
			Object.keys($parsed.o.K_V_OP).map(function(k) {
				if ($parsed.o.K_V_OP[k].op === '=')
					$update[k] = $parsed.o.K_V_OP[k].v

				if ($parsed.o.K_V_OP[k].op === '+=')
					$update[k] = $this.db.add( $parsed.o.K_V_OP[k].v )
			})
			$db.update($update, $cb)
			break;
		case 'REPLACE':
			var $db = this.db.table($parsed.o.tableName)
			//Object.keys($parsed.WHERE).map(function(k) {
			//	$db.if(k).eq($parsed.WHERE[k])
			//	$parsed.KV[k]=$parsed.WHERE[k]
			//})
			$db.insert_or_replace($parsed.o.KV, $cb)
			break;
		case 'DELETE':
			var $db = this.db.table($parsed.o.tableName)
			$db.return(this.db.ALL_OLD)
			Object.keys($parsed.o.WHERE).map(function(k) {
				$db.where(k).eq($parsed.o.WHERE[k])
			})
			$db.delete( $cb )
			break
		case 'SELECT':
			var $db = this.db.table($parsed.o.tableName)
			if ($parsed.o.hasOwnProperty('indexName'))
				$db.index($parsed.o.indexName)

			Object.keys($parsed.o.WHERE).map(function(k) {
				switch ($parsed.o.WHERE[k].op) {
					case '=' : $db.where(k).eq($parsed.o.WHERE[k].value); break;
					case '>' : $db.where(k).gt($parsed.o.WHERE[k].value); break;
					case '<' : $db.where(k).lt($parsed.o.WHERE[k].value); break;
					case '>=': $db.where(k).ge($parsed.o.WHERE[k].value); break;
					case '<=': $db.where(k).le($parsed.o.WHERE[k].value); break;
					case '^' : $db.where(k).begins_with($parsed.o.WHERE[k].value); break;
					case '><': $db.where(k).between($parsed.o.WHERE[k].value[0],$parsed.o.WHERE[k].value[1]); break;
				}
			})
			if ($parsed.hasOwnProperty('FILTER')) {
				Object.keys($parsed.o.FILTER).map(function(k) {
					switch ($parsed.o.FILTER[k].op) {
						case '=' : $db.filter(k).eq($parsed.o.FILTER[k].value); break;
						case '>' : $db.filter(k).gt($parsed.o.FILTER[k].value); break;
						case '<' : $db.filter(k).lt($parsed.o.FILTER[k].value); break;
						case '>=': $db.filter(k).ge($parsed.o.FILTER[k].value); break;
						case '<=': $db.filter(k).le($parsed.o.FILTER[k].value); break;
						case '^' : $db.filter(k).begins_with($parsed.o.FILTER[k].value); break;
						case '><': $db.filter(k).between($parsed.o.FILTER[k].value[0],$parsed.o.FILTER[k].value[1]); break;
					}
				})
			}
			if ($parsed.o.hasOwnProperty('DESC') && $parsed.o.DESC )
				$db.descending()

			if ($parsed.o.hasOwnProperty('LIMIT'))
				$db.limit($parsed.o.LIMIT)

			if ($parsed.o.hasOwnProperty('CONSISTENT_READ'))
				$db.consistent_read()

			//this.db.on('beforeRequest', function(op, payload) {
			//	console.log(op, JSON.stringify(payload,null,"\t"))
			//})

			$db.query( $cb )
			break

		case 'SCAN':
			console.log($parsed)
			var $db = this.db.table($parsed.o.tableName)
			if ($parsed.o.hasOwnProperty('indexName'))
				$db.index($parsed.o.indexName)

			if ($parsed.hasOwnProperty('FILTER')) {
				Object.keys($parsed.o.FILTER).map(function(k) {
					switch ($parsed.o.FILTER[k].op) {
						case '=' : $db.filter(k).eq($parsed.o.FILTER[k].value); break;
						case '>' : $db.filter(k).gt($parsed.o.FILTER[k].value); break;
						case '<' : $db.filter(k).lt($parsed.o.FILTER[k].value); break;
						case '>=': $db.filter(k).ge($parsed.o.FILTER[k].value); break;
						case '<=': $db.filter(k).le($parsed.o.FILTER[k].value); break;
						case '^' : $db.filter(k).begins_with($parsed.o.FILTER[k].value); break;
						case '><': $db.filter(k).between($parsed.o.FILTER[k].value[0],$parsed.o.FILTER[k].value[1]); break;
					}
				})
			}
			if ($parsed.o.hasOwnProperty('DESC') && $parsed.o.DESC )
				$db.descending()

			if ($parsed.o.hasOwnProperty('LIMIT'))
				$db.limit($parsed.o.LIMIT)

			if ($parsed.o.hasOwnProperty('CONSISTENT_READ'))
				$db.consistent_read()

			//this.db.on('beforeRequest', function(op, payload) {
			//	console.log(op, JSON.stringify(payload,null,"\t"))
			//})

			$db.scan( $cb )
			break

		case 'CREATE':
			this.db.client.createTable($parsed.o, $cb )
			break;
		default:
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
},{"./sqlparser":6,"@awspilot/dynamodb":7}],6:[function(require,module,exports){
'use strict';
var SqlParser = {}

var BLANK = ["\t"," ","\n","\r"]
var STR = ["\"","'","`","/*","*/"]

var EXPECT = {
	"\"": ["\""],
	"'" : ["'"],
	"`" : ["`"],
	"/*": ["*/"],
	"{" : ["\"","'","`","/*","*/","{","}","[","]","(",")"],
	"[" : ["\"","'","`","/*","*/","{","}","[","]","(",")"],
	"(" : ["\"","'","`","/*","*/","{","}","[","]","(",")"],
}

var KV_BLANK = [',']
var KV_STR = ["\"","'","`","{","}","[","]","(",")"]
var KW  = [
		"INSERT", "INTO", "SET",
		"UPDATE", "SET",  "WHERE", "AND",
		"REPLACE", "INTO", "SET",
		"SELECT", "CONSISTENT_READ","FROM", "USE", "INDEX", "WHERE", "BEGINS_WITH", "BETWEEN", "AND", "HAVING", "DESC", "LIMIT",
		"SCAN", "CONSISTENT_READ","FROM", "USE", "INDEX", "BEGINS_WITH", "BETWEEN", "AND", "HAVING", "LIMIT",
		"DELETE", "FROM", "WHERE",
		"CREATE", "TABLE", // "STRING", "NUMBER", "PRIMARY", "KEY", "INDEX", "GSI", "LSI",
		"SHOW","TABLES",
		"DESCRIBE","TABLE",
		"DROP","TABLE",
		"DROP", "INDEX", "ON"
	]
var OP = ["INSERT","UPDATE","REPLACE","SELECT","SCAN","DELETE","CREATE","SHOW","DESCRIBE_TABLE","DROP_TABLE","DROP_INDEX"]

function SyntaxException(message){
	this.message = 'You have an error in your SQL syntax: ' + message;
	this.code = 'syntax_error'
}

SqlParser.array_split = function(arr, splits ) {
	var $current = 'other'
	var $split = {}
	arr.map(function(item) {
		if (splits.indexOf(item) !== -1) {
			$current = item
			$split[$current] = ($split[$current] || [])
		} else {
			$split[$current] = ($split[$current] || []).concat([item])
		}
	})
	//return Object.keys($split).map(function(v) {return {k: v,v: $split[v]}})
	return $split
}

SqlParser.parse = function( $query, $replaces ) {
	var $split_sql = SqlParser.split_sql($query, BLANK, STR )
	var $query_type = SqlParser.query_type($split_sql)
	switch ($query_type) {
		case 'INSERT':
			var $parsed = SqlParser.split_insert($split_sql)
			break
		case 'UPDATE':
			var $parsed = SqlParser.split_update($split_sql)
			break;
		case 'REPLACE':
			var $parsed = SqlParser.split_replace($split_sql)
			break;
		case 'DELETE':
			var $parsed = SqlParser.split_delete($split_sql)
			break;
		case 'SELECT':
			var $parsed = SqlParser.split_select($split_sql)
			break;
		case 'SCAN':
			var $parsed = SqlParser.split_scan($split_sql)
			break;
		case 'CREATE':
			var $parsed = SqlParser.split_create_table($split_sql)
			break;
		case 'SHOW':
			var $parsed = SqlParser.split_show_tables($split_sql)
			$query_type = 'SHOW_TABLES'
			break;
		case 'DESCRIBE_TABLE':
			var $parsed = SqlParser.split_describe_table($split_sql)
			$query_type = 'DESCRIBE_TABLE'
			break;
		case 'DROP_TABLE':
			var $parsed = SqlParser.split_drop_table($split_sql)
			$query_type = 'DROP_TABLE'
			break;
		case 'DROP_INDEX':
			var $parsed = SqlParser.split_drop_index($split_sql)
			$query_type = 'DROP_INDEX'
			break;
		default:
			throw new SyntaxException("unsupported query type " + $split_sql[0])
	}
	return { type: $query_type, o: $parsed }

}


SqlParser.cleanup_sql = function($q) {
	//var $q = JSON.parse(JSON.stringify($q))
	var NON_BREAKING_START_QUOTES = ["\"","'","`","/*"]
	var NEED_SOME_SPACE = ["{", "}", "(", ")", "[", "]", ","]

	var in_quote = false
	var in_quote_word = ''

	var splits = []

	// for each char in query
	for (var i = 0, len = $q.length; i < len; i++) {
		if (!in_quote) {
			// see if now its the begining of a quote
			NON_BREAKING_START_QUOTES.map(function(v) {
				if ($q.substr(i).indexOf(v) === 0 ) {
					// opening quote
					in_quote = v
					in_quote_word+=v
				}
			})
			// if we now are in quote advance with the quote lenght, else just add the current char
			if (in_quote) {
				i =  i + in_quote.length; // advance the size of the quote
				splits.push(' ')
			} else {
				// replace new line and tabs with space
				if (NEED_SOME_SPACE.indexOf($q[i]) !== -1 ) {
					splits.push(' ',$q[i],' ')
				} else {
					splits.push($q[i].replace("\n",' ').replace("\r",' ').replace("\t",' ') )
				}
			}
		}

		if (in_quote) {
			// see if it is the end of quote
			EXPECT[in_quote].map(function(v) {
				if ($q.substr(i).indexOf(v) === 0 ) {
					// closing double quote if its not escaped
					if (! (($q[i] == '"') && ($q[i-1] == "\\")) ) {
						splits.push(' ')
						if (in_quote !== '/*')
							splits.push(in_quote_word+v, ' ')

						in_quote_word = ''
						in_quote = false
						i =  i + v.length-1; // advance the size of the quote
					}
				}
			})

			// if we are still in quote, just add it at the end of quote_word
			if (in_quote) {
				in_quote_word+=$q[i]
			} else {

			}
		}
	}

	// remove multiple spaces
	var $space = false
	splits = splits.filter(function(v) {
		if (v === ' ') {
			if ($space)
				return false

			$space = true
			return true
		}
		$space = false
		return true
	})

	return splits.join('')
}
SqlParser.split_sql = function($query, BLANK, STR ) {
	var in_quotes = []
	var word_index = 0
	var splits = []
	for (var i = 0, len = $query.length; i < len; i++) {
		;(in_quotes.length ? EXPECT[in_quotes[in_quotes.length-1]] : STR).map(function(v) {
			if ($query.substr(i).indexOf(v) === 0 ) {
				// begin or end quote
				if (in_quotes.length && SqlParser.is_closing(in_quotes[in_quotes.length-1], v )) {
						// closing quote
						in_quotes.pop()
				} else {
						// opening quote
						in_quotes.push(v)
				}
			}
		})
		if (!in_quotes.length && (BLANK.indexOf($query[i]) !== -1) ) {
			word_index++
		} else {
			splits[word_index] = (splits[word_index] || '') + $query[i]
		}
	}
	return splits
		.filter(function(v) { return (BLANK.indexOf(v) === -1) })
		.map(function(v) { return v.trim() } )
		.filter(function(v) { return !(v.indexOf('/*') === 0 && v.indexOf('*/') == v.length-2 )}) // remove comments
		.map(function(v) { return KW.indexOf(v.toUpperCase()) !== -1 ? v.toUpperCase() : v })
}

SqlParser.split_show_tables = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'SHOW')
		throw new SyntaxException("expected SHOW found " + $q[0])
	$q.shift()

	if ($q[0] !== 'TABLES')
		throw new SyntaxException("expected TABLES found " + $q[0])
	$q.shift()

	if ($q.length)
		throw new SyntaxException("SHOW TABLES does not support additional parameters")


	return $parsed
}
SqlParser.split_describe_table = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'DESCRIBE')
		throw new SyntaxException("expected DESCRIBE found " + $q[0])
	$q.shift()

	if ($q[0] !== 'TABLE')
		throw new SyntaxException("expected TABLE found " + $q[0])
	$q.shift()

	if ($q.length == 0)
		throw new SyntaxException("DESCRIBE TABLE expected table name")

	if ($q.length != 1)
		throw new SyntaxException("DESCRIBE TABLE only supports one parameter")

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')

	return $parsed
}
SqlParser.split_drop_table = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'DROP')
		throw new SyntaxException("expected DROP found " + $q[0])
	$q.shift()

	if ($q[0] !== 'TABLE')
		throw new SyntaxException("expected TABLE found " + $q[0])
	$q.shift()

	if ($q.length == 0)
		throw new SyntaxException("DROP TABLE expected table name")

	if ($q.length != 1)
		throw new SyntaxException("DROP TABLE only supports one parameter")

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')

	return $parsed
}
SqlParser.split_drop_index = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'DROP')
		throw new SyntaxException("expected DROP found " + $q[0])
	$q.shift()

	if ($q[0] !== 'INDEX')
		throw new SyntaxException("expected INDEX found " + $q[0])
	$q.shift()

	if ($q.length == 0)
		throw new SyntaxException("DROP INDEX expected index name")

	$parsed.GlobalSecondaryIndexUpdates = [
		{
			Delete: {
				IndexName: $q[0].replace(/^`(.+(?=`$))`$/, '$1')
			}
		}
	]
	$q.shift()

	if ($q.length == 0)
		throw new SyntaxException("DROP INDEX expected ON after index name")

	if ($q[0] !== 'ON')
		throw new SyntaxException("DROP INDEX expected ON, found " + $q[0])
	$q.shift()

	$parsed.TableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q.length > 0)
		throw new SyntaxException("DROP INDEX unexpected content after table name" + $q[0])

	return $parsed
}
SqlParser.split_insert = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'INSERT')
		throw new SyntaxException("expected INSERT found " + $q[0])
	$q.shift()

	if ($q[0] !== 'INTO')
		throw new SyntaxException("expected INTO found " + $q[0])
	$q.shift()

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== 'SET')
		throw new SyntaxException("expected SET found " + $q[0])
	$q.shift()

	$parsed.raw_KV = $q.join(' ')
	$parsed.raw_K_V = SqlParser.split_sql($parsed.raw_KV, KV_BLANK, KV_STR )


	$parsed.KV = {}
	$parsed.raw_K_V.map(function(kv) {
		var kv = SqlParser.split_kv(kv)
		$parsed.KV[kv[0]] = kv[1]
	})
	delete $parsed.raw_KV
	delete $parsed.raw_K_V
	return $parsed
}


SqlParser.split_update = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'UPDATE')
		throw new SyntaxException("expected UPDATE found " + $q[0])
	$q.shift()

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== 'SET')
		throw new SyntaxException("expected SET found " + $q[0])
	$q.shift()

	if ($q.indexOf('WHERE') === -1 )
		throw new SyntaxException("expected WHERE")

	$parsed.raw_KV = $q.slice(0, $q.indexOf('WHERE') ).join(' ')
	$parsed.raw_K_V = SqlParser.split_sql($parsed.raw_KV, KV_BLANK, KV_STR )
	$parsed.K_V_OP = {}
	$parsed.raw_K_V.map(function(kv) {
		var kv = SqlParser.split_kv(kv, ["=", "+="])
		$parsed.K_V_OP[kv[0]] = { v: kv[1], op: kv[2] }
	})

	delete $parsed.raw_KV
	delete $parsed.raw_K_V

	$parsed.raw_WHERE = $q.slice($q.indexOf('WHERE')+1).join(' ')
	$parsed.raw_WHERE_KV = [[]]
	SqlParser.split_sql($parsed.raw_WHERE, BLANK, KV_STR ).map(function(v) {
		if (v === 'AND')
			$parsed.raw_WHERE_KV.push([])
		else {
			$parsed.raw_WHERE_KV[$parsed.raw_WHERE_KV.length-1].push(v)
		}
	})
	$parsed.raw_WHERE_KV = $parsed.raw_WHERE_KV.map(function(v) {return v.join(' ')})
	delete $parsed.raw_WHERE

	$parsed.WHERE = {}
	$parsed.raw_WHERE_KV.map(function(kv) {
		var kv = SqlParser.split_kv(kv)
		$parsed.WHERE[kv[0]] = kv[1]
	})
	delete $parsed.raw_WHERE_KV

	return $parsed

}

SqlParser.split_replace = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'REPLACE')
		throw new SyntaxException("expected REPLACE found " + $q[0])
	$q.shift()

	if ($q[0] !== 'INTO')
		throw new SyntaxException("expected INTO found " + $q[0])
	$q.shift()

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== 'SET')
		throw new SyntaxException("expected SET found " + $q[0])
	$q.shift()

	//if ($q.indexOf('WHERE') === -1 )
	//	throw new SyntaxException("expected WHERE")

	//$parsed.raw_KV = $q.slice(0, $q.indexOf('WHERE') ).join(' ')
	$parsed.raw_KV = $q.join(' ')
	$parsed.raw_K_V = SqlParser.split_sql($parsed.raw_KV, KV_BLANK, KV_STR )
	$parsed.KV = {}
	$parsed.raw_K_V.map(function(kv) {
		var kv = SqlParser.split_kv(kv)
		$parsed.KV[kv[0]] = kv[1]
	})
	delete $parsed.raw_KV
	delete $parsed.raw_K_V

	return $parsed
}
SqlParser.split_delete = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))
	if ($q[0] !== 'DELETE')
		throw new SyntaxException("expected DELETE, found " + $q[0])
	$q.shift()

	if ($q[0] !== 'FROM')
		throw new SyntaxException("expected FROM, found " + $q[0])
	$q.shift()

	$parsed.tableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== 'WHERE')
		throw new SyntaxException("expected WHERE, found " + $q[0])
	$q.shift()

	$parsed.raw_WHERE = $q.join(' ')
	$parsed.raw_WHERE_KV = [[]]
	SqlParser.split_sql($parsed.raw_WHERE, BLANK, KV_STR ).map(function(v) {
		if (v === 'AND')
			$parsed.raw_WHERE_KV.push([])
		else {
			$parsed.raw_WHERE_KV[$parsed.raw_WHERE_KV.length-1].push(v)
		}
	})
	$parsed.raw_WHERE_KV = $parsed.raw_WHERE_KV.map(function(v) {return v.join(' ')})
	delete $parsed.raw_WHERE

	$parsed.WHERE = {}
	$parsed.raw_WHERE_KV.map(function(kv) {
		var kv = SqlParser.split_kv(kv)
		$parsed.WHERE[kv[0]] = kv[1]
	})
	delete $parsed.raw_WHERE_KV

	return $parsed

}
SqlParser.split_select = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))

	var $split = SqlParser.array_split($q,  ['SELECT','CONSISTENT_READ','FROM','USE','INDEX','WHERE','HAVING','DESC','LIMIT'] )

	if ($q[0] !== 'SELECT')
		throw new SyntaxException("expected SELECT found " + $q[0])
	$q.shift()

	if (!$split.hasOwnProperty('FROM'))
		throw new SyntaxException("expected FROM")

	$parsed.raw_SELECT = $split['SELECT'].join(' ')

	if ($parsed.raw_SELECT !== '*')
		throw new SyntaxException("expected * after SELECT")

	$q = $q.slice($q.indexOf('FROM')+1 )

	$parsed.tableName = $split['FROM'].join(' ').replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] == 'USE') {
		$q.shift()
		if ($q[0] !== 'INDEX')
			throw new SyntaxException("expected INDEX after USE")

		$q.shift()
		$parsed.indexName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
		$q.shift()
	}

	if ($q[0] !== 'WHERE')
		throw new SyntaxException("expected WHERE, found " + $q[0] )
	$q.shift()


	//################### WHERE
	$parsed.raw_WHERE = $split['WHERE'].join(' ')
	$parsed.raw_WHERE_KV = [[]]
	SqlParser.split_sql($parsed.raw_WHERE, BLANK, KV_STR ).map(function(v) {
		if (v === 'AND')
			$parsed.raw_WHERE_KV.push([])
		else {
			$parsed.raw_WHERE_KV[$parsed.raw_WHERE_KV.length-1].push(v)
		}
	})
	$parsed.raw_WHERE_KV = $parsed.raw_WHERE_KV.map(function(v) {return v.join(' ')})
	delete $parsed.raw_WHERE

	$parsed.WHERE = {}
	$parsed.raw_WHERE_KV.map(function(kv) {
		var kv = SqlParser.split_kv_where(kv)
		$parsed.WHERE[kv[0]] = { op: kv[2], value: kv[1] }
	})
	delete $parsed.raw_WHERE_KV

	//################### HAVING
	if ($split.hasOwnProperty('HAVING')) {
		$parsed.raw_FILTER = $split['HAVING'].join(' ')
		$parsed.raw_FILTER_KV = [[]]
		SqlParser.split_sql($parsed.raw_FILTER, BLANK, KV_STR ).map(function(v) {
			if (v === 'AND')
				$parsed.raw_FILTER_KV.push([])
			else {
				$parsed.raw_FILTER_KV[$parsed.raw_FILTER_KV.length-1].push(v)
			}
		})
		$parsed.raw_FILTER_KV = $parsed.raw_FILTER_KV.map(function(v) {return v.join(' ')})
		delete $parsed.raw_FILTER

		$parsed.FILTER = {}
		$parsed.raw_FILTER_KV.map(function(kv) {
			var kv = SqlParser.split_kv_where(kv)
			$parsed.FILTER[kv[0]] = { op: kv[2], value: kv[1] }
		})
		delete $parsed.raw_FILTER_KV
	}

	if ($split.hasOwnProperty('DESC'))
		$parsed.DESC = true

	if ($split.hasOwnProperty('CONSISTENT_READ'))
		$parsed.CONSISTENT_READ = true

	if ($split.hasOwnProperty('LIMIT'))
		$parsed.LIMIT = parseInt($split.LIMIT.join(' '))

	//console.log($split,null,"\t")
	//console.log($parsed,null, "\t")
	return $parsed
}
SqlParser.split_scan = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))

	var $split = SqlParser.array_split($q,  ['SCAN','CONSISTENT_READ','FROM','USE','INDEX','HAVING','LIMIT'] )

	if ($q[0] !== 'SCAN')
		throw new SyntaxException("expected SCAN found " + $q[0])
	$q.shift()

	if (!$split.hasOwnProperty('FROM'))
		throw new SyntaxException("expected FROM")

	$parsed.raw_SCAN = $split['SCAN'].join(' ')

	if ($parsed.raw_SCAN !== '*')
		throw new SyntaxException("expected * after SCAN")

	$q = $q.slice($q.indexOf('FROM')+1 )

	$parsed.tableName = $split['FROM'].join(' ').replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] == 'USE') {
		$q.shift()
		if ($q[0] !== 'INDEX')
			throw new SyntaxException("expected INDEX after USE")

		$q.shift()
		$parsed.indexName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
		$q.shift()
	}

	//################### HAVING
	if ($split.hasOwnProperty('HAVING')) {
		$parsed.raw_FILTER = $split['HAVING'].join(' ')
		$parsed.raw_FILTER_KV = [[]]
		SqlParser.split_sql($parsed.raw_FILTER, BLANK, KV_STR ).map(function(v) {
			if (v === 'AND')
				$parsed.raw_FILTER_KV.push([])
			else {
				$parsed.raw_FILTER_KV[$parsed.raw_FILTER_KV.length-1].push(v)
			}
		})
		$parsed.raw_FILTER_KV = $parsed.raw_FILTER_KV.map(function(v) {return v.join(' ')})
		delete $parsed.raw_FILTER

		$parsed.FILTER = {}
		$parsed.raw_FILTER_KV.map(function(kv) {
			var kv = SqlParser.split_kv_where(kv)
			$parsed.FILTER[kv[0]] = { op: kv[2], value: kv[1] }
		})
		delete $parsed.raw_FILTER_KV
	}

	if ($split.hasOwnProperty('CONSISTENT_READ'))
		$parsed.CONSISTENT_READ = true

	if ($split.hasOwnProperty('LIMIT'))
		$parsed.LIMIT = parseInt($split.LIMIT.join(' '))

	//console.log($split,null,"\t")
	//console.log($parsed,null, "\t")
	return $parsed
}

SqlParser.split_create_table = function($query) {
	var $parsed = {}
	var $q = JSON.parse(JSON.stringify($query))

	if ($q[0] !== 'CREATE')
		throw new SyntaxException("expected CREATE found " + $q[0])
	$q.shift()

	if ($q[0] !== 'TABLE')
		throw new SyntaxException("expected TABLE found " + $q[0])
	$q.shift()

	if (!$q.length)
		throw new SyntaxException("expected table name")

	$parsed.TableName = $q[0].replace(/^`(.+(?=`$))`$/, '$1')
	$q.shift()

	if ($q[0] !== '(')
		throw new SyntaxException("expected ( found " + $q[0])
	$q.shift()

	if ($q[$q.length-1] !== ')')
		throw new SyntaxException("expected ) found " + $q[0])
	$q = $q.slice(0,-1)

	$parsed.KeySchema = []
	$parsed.AttributeDefinitions = []
	//$parsed.LocalSecondaryIndexes = []
	SqlParser.split_sql($q.join(' '), KV_BLANK, KV_STR ).map(function(v,k) {
		return SqlParser.split_sql(v, BLANK, STR )
	}).map(function(v) {
		if (v.length === 2 && (v[1] === 'STRING' || v[1] === 'NUMBER' )) {
			$parsed.AttributeDefinitions.push({
				AttributeName: v[0],
				AttributeType: v[1] === 'STRING' ? 'S' : (v[1] === 'NUMBER' ? 'N' : '' )
			})
		} else if (v[0] == 'PRIMARY') {
			var $split = SqlParser.array_split(v,  ['PRIMARY','KEY','THROUGHPUT'] )
			v.shift()
			if (v[0] !== 'KEY')
				throw new SyntaxException("expected KEY found " + v[0])
			v.shift()

			var v =  SqlParser.split_sql($split['KEY'].join(' ') , BLANK, STR )


			if (v[0] !== '(')
				throw new SyntaxException("PRIMARY KEY expected ( found " + v[0])
			v.shift()
			if (v[v.length-1] !== ')')
				throw new SyntaxException("PRIMARY KEY expected ) found " + v[v.length-1])
			v = v.slice(0,-1)
			v = v.join(' ').split(',').map(function(v) { return v.trim()}).filter(function(v) { return v !== ''})
			if (!v.length)
				throw new SyntaxException("expected partition key name for PRIMARY KEY")

			if (v.length > 2)
				throw new SyntaxException("maximum 2 attributes for PRIMARY KEY ( partision, sort )")

			$parsed.KeySchema.push({
				AttributeName: v[0],
				KeyType: "HASH"
			})
			v.shift()
			if (v.length) {
				$parsed.KeySchema.push( {
					AttributeName: v[0],
					KeyType: "RANGE"
				})
			}

			if (!$split.hasOwnProperty('THROUGHPUT')) {
				$parsed.ProvisionedThroughput = {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1
				}
			} else {
				if (!$split['THROUGHPUT'].length)
					throw new SyntaxException("PRIMARY KEY nothing specified for THROUGHPUT ")

				var v =  SqlParser.split_sql($split['THROUGHPUT'].join(' ') , BLANK, STR )
				if (v.length !== 2)
					throw new SyntaxException("PRIMARY KEY THROUGHPUT requires exacly 2 number values ")

				if (!parseInt(v[0]))
					throw new SyntaxException("PRIMARY KEY THROUGHPUT requires exacly 2 number values ")

				if (!parseInt(v[1]))
					throw new SyntaxException("PRIMARY KEY THROUGHPUT requires exacly 2 number values ")

					$parsed.ProvisionedThroughput = {
						ReadCapacityUnits: v[0],
						WriteCapacityUnits: v[1]
					}
			}


		} else if (v[0] == 'INDEX') {
			var $split = SqlParser.array_split(v,  ['INDEX','PROJECTION','THROUGHPUT'] )
			//console.log('split=',JSON.stringify($split,null,"\t"))
			var v =  SqlParser.split_sql($split['INDEX'].join(' ') , BLANK, STR )

			var $thisIndex = {}
			$thisIndex.KeySchema = []

			//v.shift()
			$thisIndex.IndexName = v[0]
			v.shift()

			var $index_type = v[0]
			if ($index_type !== 'GSI' && $index_type !== 'LSI')
				throw new SyntaxException("expected index type GSI or LSI , found " + v[0])
			v.shift()

			if (v[0] !== '(')
				throw new SyntaxException("expected ( found " + v[0])
			v.shift()
			if (v[v.length-1] !== ')')
				throw new SyntaxException("expected ) found " + v[v.length-1])
			v = v.slice(0,-1)
			v = v.join(' ').split(',').map(function(v) { return v.trim()}).filter(function(v) { return v !== ''})
			if (!v.length)
				throw new SyntaxException("expected partition key name for INDEX")

			if (v.length > 2)
				throw new SyntaxException("maximum 2 attributes for INDEX type gsi ( partision, sort ) and 1 attribute for index type lsi ( sort ) ")

			$thisIndex.KeySchema.push({
				AttributeName: v[0],
				KeyType: "HASH"
			})
			v.shift()
			if (v.length) {
				$thisIndex.KeySchema.push( {
					AttributeName: v[0],
					KeyType: "RANGE"
				})
			}

			if ($index_type === 'GSI') {
				$thisIndex.ProvisionedThroughput = {
					ReadCapacityUnits: 1,
					WriteCapacityUnits: 1
				}
			}

			if ($index_type === 'GSI') {
				if (!$parsed.hasOwnProperty('GlobalSecondaryIndexes') )
					$parsed.GlobalSecondaryIndexes = []

				$parsed.GlobalSecondaryIndexes.push($thisIndex)
			} else if ($index_type === 'LSI') {
				if (!$parsed.hasOwnProperty('LocalSecondaryIndexes') )
					$parsed.LocalSecondaryIndexes = []

				$parsed.LocalSecondaryIndexes.push($thisIndex)

			} else {
				throw new SyntaxException("INDEX type " + $index_type  + " not yet supported ")
			}

			if (!$split.hasOwnProperty('PROJECTION')) {
				$thisIndex.Projection = {
					ProjectionType: "ALL"
				}
			} else {
				if (!$split['PROJECTION'].length)
					throw new SyntaxException("INDEX " + $thisIndex.IndexName  + " nothing specified for PROJECTION ")

				if ($split['PROJECTION'].length === 1) {
					switch ($split['PROJECTION'][0].toUpperCase()) {
						case 'ALL':
						$thisIndex.Projection = {
							ProjectionType: "ALL"
						}
						break
						case 'KEYS_ONLY':
						$thisIndex.Projection = {
							ProjectionType: "KEYS_ONLY"
						}
						break
						default:
							throw new SyntaxException("Unsupported projection type for INDEX " + $thisIndex.IndexName  + " : " + $split['PROJECTION'][0])

					}
				} else {
					$thisIndex.Projection = {
						ProjectionType: "INCLUDE"
					}
					var v =  SqlParser.split_sql($split['PROJECTION'].join(' ') , BLANK, STR )

					if (v[0] !== '(')
						throw new SyntaxException("PROJECTION expected ( found " + v[0])
					v.shift()
					if (v[v.length-1] !== ')')
						throw new SyntaxException("PROJECTION expected ) found " + v[v.length-1])
					v = v.slice(0,-1)
					v = v.join(' ').split(',').map(function(v) { return v.trim()}).filter(function(v) { return v !== ''})
					if (!v.length)
						throw new SyntaxException("PROJECTION no attribute specified")

					$thisIndex.Projection.NonKeyAttributes = v
					return
				}


			}

			// GSI supports ProvisionedThroughput
			if ($index_type === 'GSI') {
				if (!$split.hasOwnProperty('THROUGHPUT')) {
					$thisIndex.ProvisionedThroughput = {
						ReadCapacityUnits: 1,
						WriteCapacityUnits: 1
					}
				} else {
					if (!$split['THROUGHPUT'].length)
						throw new SyntaxException("INDEX " + $thisIndex.IndexName  + " nothing specified for THROUGHPUT ")

					var v =  SqlParser.split_sql($split['THROUGHPUT'].join(' ') , BLANK, STR )
					if (v.length !== 2)
						throw new SyntaxException("INDEX " + $thisIndex.IndexName  + " THROUGHPUT requires exacly 2 number values ")

					if (!parseInt(v[0]))
						throw new SyntaxException("INDEX " + $thisIndex.IndexName  + " THROUGHPUT requires exacly 2 number values ")

					if (!parseInt(v[1]))
						throw new SyntaxException("INDEX " + $thisIndex.IndexName  + " THROUGHPUT requires exacly 2 number values ")

					$thisIndex.ProvisionedThroughput = {
						ReadCapacityUnits: v[0],
						WriteCapacityUnits: v[1]
					}
				}
			} else if ($index_type === 'LSI') {
				if ($split.hasOwnProperty('THROUGHPUT'))
					throw new SyntaxException("INDEX type LSI " + $thisIndex.IndexName  + " does not support THROUGHPUT ")
			}


		} else {
			throw new SyntaxException("unexpected " + v[0] )
		}
		return v
	})


	//console.log(JSON.stringify($q,null,"\t"))
	//console.log(JSON.stringify($split,null,"\t"))

	return $parsed
}

SqlParser.split_kv = function (kv, split_by ) {
	var $k,$v
	if ( split_by === undefined )
		split_by = ['=']

	var $op_idx = Math.min.apply(Math,
		split_by.map(function(v) {
			return kv.indexOf(v)
		}).filter(function(v) {
		return v !== -1
	}))
	var op = null
	split_by.map(function(v) {
		if ($op_idx === kv.indexOf(v) ) op = v
	})

	$k = kv.split(op)[0]
	$v = kv.split(op,2)[1]
	return [SqlParser.unqoute_key($k),SqlParser.unquote_value($v), op ]
}

SqlParser.split_kv_where = function (kv) {
	var $k,$v

	var $comparison_idx = Math.min.apply(Math, [
		kv.indexOf('='),
		kv.indexOf('>'),
		kv.indexOf('>='),
		kv.indexOf('<'),
		kv.indexOf('<='),
		//kv.indexOf('^'),
		kv.indexOf('BEGINS_WITH'),
		kv.indexOf('BETWEEN')
	].filter(function(v) {
		return v !== -1
	}))

	if ($comparison_idx === kv.indexOf('BEGINS_WITH') ) {
		var $operation = '^'
		$k = kv.split('BEGINS_WITH')[0]
		$v = kv.split('BEGINS_WITH',2)[1]
	} else if($comparison_idx === kv.indexOf('BETWEEN')) {
		var $operation = '><'
		$k = kv.split('BETWEEN')[0]
		$v = kv.split('BETWEEN',2)[1]
	} else {
		var $operation = kv.substr($comparison_idx,2).replace(/[^<>=]/g, '')
		$k = kv.split($operation)[0]
		$v = kv.split($operation,2)[1]
	}

	return [SqlParser.unqoute_key($k),SqlParser.unquote_value($v),$operation]
}

SqlParser.unqoute_key = function(k) {
	return k.trim().replace(/^"(.+(?="$))"$/, '$1').replace(/^'(.+(?='$))'$/, '$1').replace(/^`(.+(?=`$))`$/, '$1')
}
SqlParser.unquote_value = function(v) {
	var $v = JSON.parse(JSON.stringify(v)).trim()

	if ("\"" + $v.replace(/^"(.+(?="$))"$/, '$1') + "\"" === $v )
		return $v.replace(/^"(.+(?="$))"$/, '$1')

	if ("'" + $v.replace(/^'(.+(?='$))'$/, '$1') + "'" === $v )
		return $v.replace(/^'(.+(?='$))'$/, '$1')

	try {
		return eval("v = " + v)
	} catch (e) {
		//console.log(e)
	}
	return $v
}
SqlParser.query_type = function($q) {

	if (OP.indexOf($q[0] + '_' + $q[1]) !== -1)
		return $q[0] + '_' + $q[1]

	return OP.indexOf($q[0]) !== -1 ? $q[0] : false

}
SqlParser.is_closing = function($begin,$end) {
	return [["\"","\""],["'","'"],["`","`"],["{","}"],["[","]"],["(",")"],["/*","*/"]].filter(function(v) { return (v[0] === $begin) && (v[1] === $end ) }).length === 1
}

module.exports = SqlParser

},{}],7:[function(require,module,exports){
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

},{"./util":8,"aws-sdk":"aws-sdk","promise":"promise"}],8:[function(require,module,exports){
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
},{"buffer":1}]},{},[4]);
