// common.js
var EPSILON = 1e-6;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
var ANGLE_ORDER = "zyx";
function setMatrixArrayType(type) {
  ARRAY_TYPE = type;
}
var degree = Math.PI / 180;
function toRadian(a) {
  return a * degree;
}
function equals(a, b) {
  return Math.abs(a - b) <= EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
}
if (!Math.hypot) Math.hypot = function() {
  var y = 0, i = arguments.length;
  while (i--) {
    y += arguments[i] * arguments[i];
  }
  return Math.sqrt(y);
};
export {
  ANGLE_ORDER,
  ARRAY_TYPE,
  EPSILON,
  RANDOM,
  equals,
  setMatrixArrayType,
  toRadian
};
