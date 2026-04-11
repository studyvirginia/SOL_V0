// Standardizes and validates input objects from LLMs to guard geometry libraries against crashing.

/**
 * Validates a coordinate array [x,y] or [x,y,z]. Returns a safe fallback or null if totally invalid.
 */
export function validateCoordinates(coords, dimensions = 2, fallback = null) {
  if (!Array.isArray(coords)) return fallback;
  const parsed = coords.map(Number);
  if (parsed.some(Number.isNaN)) return fallback;
  if (parsed.length < dimensions) return fallback;
  return parsed.slice(0, dimensions);
}

/**
 * Validates a numerical dimension (radius, width, height) ensuring it is a positive finite number.
 */
export function validatePositiveNumber(num, fallback = 1) {
  const parsed = Number(num);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

/**
 * Validates an array of elements loosely. If elements is not an array, returns an empty array.
 */
export function validateElementsArray(elements) {
  if (!Array.isArray(elements)) return [];
  return elements.filter(el => el && typeof el === "object");
}

export function validateJsxGraphPayload(payload) {
  return {
    ...payload,
    elements: validateElementsArray(payload?.elements),
    boundingBox: validateCoordinates(payload?.boundingBox, 4, [-10, 10, 10, -10])
  };
}

export function validateThreeScenePayload(payload) {
  return {
    ...payload,
    objects: validateElementsArray(payload?.objects),
    camera: {
      ...payload?.camera,
      position: validateCoordinates(payload?.camera?.position, 3, [0, 0, 6])
    }
  };
}

export function validateKonvaPayload(payload) {
  return {
    ...payload,
    shapes: validateElementsArray(payload?.shapes),
    width: validatePositiveNumber(payload?.width, 640),
    height: validatePositiveNumber(payload?.height, 420)
  };
}
