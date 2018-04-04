"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toArray = toArray;
exports.isObjectSchema = isObjectSchema;
exports.isArraySchema = isArraySchema;
exports.deepCopy = deepCopy;
function toArray(el) {
  if (Array.isArray(el)) {
    return el;
  } else {
    return [el];
  }
}

function isObjectSchema(schema) {
  return schema.type === "object" || schema.items && schema.items.type === "object";
}

function isArraySchema(schema) {
  return schema.type === "array";
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}