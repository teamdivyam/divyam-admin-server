function convertDecimal(obj) {
  if (obj === null || obj === undefined) return obj;

  // If it's a Decimal128, convert it to a float
  if (obj && obj._bsontype === "Decimal128") {
    return parseFloat(obj.toString());
  }

  // If it's an array, recursively handle each item
  if (Array.isArray(obj)) {
    return obj.map(convertDecimal);
  }

  // If it's an object, recursively handle its properties
  if (typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = convertDecimal(obj[key]);
    }
    return newObj;
  }

  // Otherwise, return as-is
  return obj;
}

export default convertDecimal;
