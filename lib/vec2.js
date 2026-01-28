// common.js
var EPSILON = 1e-6;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
var degree = Math.PI / 180;
if (!Math.hypot) Math.hypot = function() {
  var y = 0, i = arguments.length;
  while (i--) {
    y += arguments[i] * arguments[i];
  }
  return Math.sqrt(y);
};

// vec2.js
function heading(v) {
  return Math.atan2(v[1], v[0]);
}
function magnitude(out, v, m) {
  normalize(out, v);
  scale(out, out, m);
  return out;
}
function limit(out, v, m) {
  if (length(v) > m) {
    normalize(out, v);
    scale(out, out, m);
  } else {
    copy(out, v);
  }
  return out;
}
function create() {
  var out = new ARRAY_TYPE(2);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
  }
  return out;
}
function clone(a) {
  var out = new ARRAY_TYPE(2);
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
function fromValues(x, y) {
  var out = new ARRAY_TYPE(2);
  out[0] = x;
  out[1] = y;
  return out;
}
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  return out;
}
function set(out, x, y) {
  out[0] = x;
  out[1] = y;
  return out;
}
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  return out;
}
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  return out;
}
function multiply(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  return out;
}
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  return out;
}
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  return out;
}
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  return out;
}
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  return out;
}
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  return out;
}
function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  return out;
}
function scale(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  return out;
}
function scaleAndAdd(out, a, b, scale2) {
  out[0] = a[0] + b[0] * scale2;
  out[1] = a[1] + b[1] * scale2;
  return out;
}
function distance(a, b) {
  var x = b[0] - a[0], y = b[1] - a[1];
  return Math.hypot(x, y);
}
function squaredDistance(a, b) {
  var x = b[0] - a[0], y = b[1] - a[1];
  return x * x + y * y;
}
function length(a) {
  var x = a[0], y = a[1];
  return Math.hypot(x, y);
}
function squaredLength(a) {
  var x = a[0], y = a[1];
  return x * x + y * y;
}
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  return out;
}
function inverse(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  return out;
}
function normalize(out, a) {
  var x = a[0], y = a[1];
  var len2 = x * x + y * y;
  if (len2 > 0) {
    len2 = 1 / Math.sqrt(len2);
  }
  out[0] = a[0] * len2;
  out[1] = a[1] * len2;
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}
function cross(out, a, b) {
  var z = a[0] * b[1] - a[1] * b[0];
  out[0] = out[1] = 0;
  out[2] = z;
  return out;
}
function lerp(out, a, b, t) {
  var ax = a[0], ay = a[1];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  return out;
}
function random(out, scale2) {
  scale2 = scale2 === void 0 ? 1 : scale2;
  var r = RANDOM() * 2 * Math.PI;
  out[0] = Math.cos(r) * scale2;
  out[1] = Math.sin(r) * scale2;
  return out;
}
function transformMat2(out, a, m) {
  var x = a[0], y = a[1];
  out[0] = m[0] * x + m[2] * y;
  out[1] = m[1] * x + m[3] * y;
  return out;
}
function transformMat2d(out, a, m) {
  var x = a[0], y = a[1];
  out[0] = m[0] * x + m[2] * y + m[4];
  out[1] = m[1] * x + m[3] * y + m[5];
  return out;
}
function transformMat3(out, a, m) {
  var x = a[0], y = a[1];
  out[0] = m[0] * x + m[3] * y + m[6];
  out[1] = m[1] * x + m[4] * y + m[7];
  return out;
}
function transformMat4(out, a, m) {
  var x = a[0];
  var y = a[1];
  out[0] = m[0] * x + m[4] * y + m[12];
  out[1] = m[1] * x + m[5] * y + m[13];
  return out;
}
function rotate(out, a, b, rad) {
  var p0 = a[0] - b[0], p1 = a[1] - b[1], sinC = Math.sin(rad), cosC = Math.cos(rad);
  out[0] = p0 * cosC - p1 * sinC + b[0];
  out[1] = p0 * sinC + p1 * cosC + b[1];
  return out;
}
function angle(a, b) {
  var x1 = a[0], y1 = a[1], x2 = b[0], y2 = b[1], mag = Math.sqrt((x1 * x1 + y1 * y1) * (x2 * x2 + y2 * y2)), cosine = mag && (x1 * x2 + y1 * y2) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
function zero(out) {
  out[0] = 0;
  out[1] = 0;
  return out;
}
function str(a) {
  return "vec2(" + a[0] + ", " + a[1] + ")";
}
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}
function equals(a, b) {
  var a0 = a[0], a1 = a[1];
  var b0 = b[0], b1 = b[1];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1));
}
var len = length;
var sub = subtract;
var mul = multiply;
var div = divide;
var dist = distance;
var sqrDist = squaredDistance;
var sqrLen = squaredLength;
var forEach = (function() {
  var vec = create();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 2;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset; i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
    }
    return a;
  };
})();
export {
  add,
  angle,
  ceil,
  clone,
  copy,
  create,
  cross,
  dist,
  distance,
  div,
  divide,
  dot,
  equals,
  exactEquals,
  floor,
  forEach,
  fromValues,
  heading,
  inverse,
  len,
  length,
  lerp,
  limit,
  magnitude,
  max,
  min,
  mul,
  multiply,
  negate,
  normalize,
  random,
  rotate,
  round,
  scale,
  scaleAndAdd,
  set,
  sqrDist,
  sqrLen,
  squaredDistance,
  squaredLength,
  str,
  sub,
  subtract,
  transformMat2,
  transformMat2d,
  transformMat3,
  transformMat4,
  zero
};
