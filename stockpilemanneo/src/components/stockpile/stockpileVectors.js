import aimodel from '../../aimodules/Gemini.jsx';

const VECTOR_DIMENSIONS = 768;
const ZERO_VECTOR = Array.from({ length: VECTOR_DIMENSIONS }, () => 0);

/**
 * Normalizes the vector array.
 * @param {any} values
 * @returns {Array<number>}
 */
function normalizeVector(values) {
  if (!Array.isArray(values)) {
    return ZERO_VECTOR;
  }

  const normalized = values.slice(0, VECTOR_DIMENSIONS).map((value) => Number(value) || 0);
  while (normalized.length < VECTOR_DIMENSIONS) {
    normalized.push(0);
  }
  return normalized;
}

/**
 * Creates the embedding vector.
 * @param {string} text The text to be embedded.
 * @param {string=} title The title if needed.
 * @returns {Promise<Array<number>>}
 */
export async function createEmbeddingVector(text, title) {
  if (!import.meta.env.VITE_GEMINI_API_KEY || !text?.trim()) {
    return ZERO_VECTOR;
  }

  try {
    const response = await aimodel.models.embedContent({
      model: 'gemini-embedding-2',
      contents: `title: ${title || 'none'} | text: ${text}`,
      config: {
        outputDimensionality: VECTOR_DIMENSIONS,
      },
    });

    return normalizeVector(response?.embeddings?.[0]?.values);
  } catch (error) {
    console.warn('Embedding generation failed; using a zero vector.', error);
    return ZERO_VECTOR;
  }
}

/**
 * Generates the vector for search query.
 * @param {string} text The search text.
 * @returns {Promise.<number[]>}
 */
export async function createSearchVector(text) {
  if (!import.meta.env.VITE_GEMINI_API_KEY || !text?.trim()) {
    return ZERO_VECTOR;
  }

  try {
    const response = await aimodel.models.embedContent({
      model: 'gemini-embedding-2',
      contents: `task: search result | query: ${text}`,
      config: {
        outputDimensionality: VECTOR_DIMENSIONS,
      },
    });

    return normalizeVector(response?.embeddings?.[0]?.values);
  } catch (error) {
    console.warn('Embedding generation failed; using a zero vector.', error);
    return ZERO_VECTOR;
  }
}

/**
 * Converts array of number to number.
 * @param {any} vector
 * @returns
 */
export function toScalarVector(vector) {
  return Number(vector?.[0]) || 0;
}

/**
 * Calculates the norm of the vector.
 * @param {Array.<number>} vector The vector.
 * @returns {number} The norm.
 */
export function calcNorm(vector) {
  if (!Array.isArray(vector)) {
    throw new TypeError('Not a vector.');
  }

  /**
   * The norm square.
   * @type {number}
   */
  let norm2 = 0;

  for (const value of vector) {
    if (isNaN(Number(value)))
      throw new TypeError('Not a number value.');

    norm2 += value;
  }

  return Math.sqrt(norm2);
}

/**
 * Calculates the inner product of the vectros.
 * @param {Array.<number>} vector1 First vector.
 * @param {Array.<number>} vector2 Second vector.
 * @returns {number}
 */
export function calcInnerProduct(vector1, vector2) {
  if (!(Array.isArray(vector1) && vector2 instanceof Array)) {
    throw new TypeError('Not vectors.');
  }

  if (vector1.length != vector2.length)
    throw new TypeError('Not the same-dimension pair of vectors.');

  let product = 0;

  const results = vector1.map((v, i) => v * vector2[i]);

  for (const elm of results)
    product += elm;

  return product;
}
