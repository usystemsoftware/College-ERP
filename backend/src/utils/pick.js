 /**
 * Create an object composed of the picked object properties.
 *
 * @param {Object} obj The source object.
 * @param {Array<string>} keys The property paths to pick.
 * @returns {Object} Returns the new object.
 */
const pick = (obj, keys) => {
  return keys.reduce((finalObj, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      finalObj[key] = obj[key];
    }
    return finalObj;
  }, {});
};

module.exports = pick;
