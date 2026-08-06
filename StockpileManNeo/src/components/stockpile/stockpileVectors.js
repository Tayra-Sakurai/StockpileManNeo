import aimodel from '../../aimodules/Gemini.jsx';

const VECTOR_DIMENSIONS = 768;
const ZERO_VECTOR = Array.from({ length: VECTOR_DIMENSIONS }, () => 0);

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

export async function createEmbeddingVector(text) {
  if (!import.meta.env.VITE_GEMINI_API_KEY || !text?.trim()) {
    return ZERO_VECTOR;
  }

  try {
    const response = await aimodel.models.embedContent({
      model: 'gemini-embedding-2',
      contents: `title: stockpile | text: ${text}`,
      embedContentConfig: {
        outputDimensionality: VECTOR_DIMENSIONS,
      },
    });

    return normalizeVector(response?.embedding?.values);
  } catch (error) {
    console.warn('Embedding generation failed; using a zero vector.', error);
    return ZERO_VECTOR;
  }
}

export function toScalarVector(vector) {
  return Number(vector?.[0]) || 0;
}
