const findObject = (object, _class, name) => {
  if (object._class === _class && object.name === name) return object;
  if (Array.isArray(object.layers)) {
    for (const child of object.layers) {
      const result = findObject(child, _class, name);
      if (result !== null) return result;
    }
  }
  return null;
};

module.exports = findObject;
