import supabase from "../../client.js";

/**
 * Returns the set of all available categories.
 * @returns
 */
export async function getLargeLargeCategories() {
  const { data, error } = await supabase
    .from('large_large_categories')
    .select('id, name');

  if (error) throw error;
  return data;
}

/**
 * Retreives all large categories under the designated largest category.
 * @param {number} largeLargeCategoryId The largest category's identity.
 * @returns
 */
export async function getLargeCategories(largeLargeCategoryId) {
  const { data, error } = await supabase
    .from('large_categories')
    .select('id, name')
    .eq('large_large_category_id', largeLargeCategoryId);

  if (error) throw error;
  return data;
}

/**
 * Retreives all small categories related to the designated large category.
 * @param {number} largeCategoryId The large category's identity.
 * @returns
 */
export async function getSmallCategories(largeCategoryId) {
  const { data, error } = await supabase
    .from('small_categories')
    .select('id, name')
    .eq('large_category_id', largeCategoryId);

  if (error) throw error;
  return data;
}

/**
 * Retreives all of items related to the designated small category.
 * @param {number} smallCategoryId The small category's identity.
 * @returns
 */
export async function getItems(smallCategoryId) {
  const { data, error } = await supabase
    .from('items')
    .select('id, name, life, description')
    .eq('small_category_id', smallCategoryId);

  if (error) throw error;
  return data.map(({ life, name, ...others }) => ({
    ...others,
    expireDate: life,
    productName: name,
  }));
}

/**
 * Executes the function.
 * @param {import("@google/genai").Interactions.Interaction} response The interaction object to call function.
 * @returns {AsyncGenerator<import("@google/genai").Interactions.FunctionResultStep | undefined>}
 */
export async function* execFuncCall(response) {
  const steps = response.steps?.filter(value => value.type === 'function_call');
  if (steps) {
    for (const step of steps) {
      if (step.name === 'getLargeLargeCategories') {
        const result = await getLargeLargeCategories();
        yield {
          type: 'function_result',
          call_id: step.id,
          name: step.name,
          result: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      } else if (step.name === 'getLargeCategories') {
        const result = await getLargeCategories(step.arguments.largeLargeCategoryId);
        yield {
          type: 'function_result',
          call_id: step.id,
          name: step.name,
          result: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      } else if (step.name === 'getSmallCategories') {
        const result = await getSmallCategories(step.arguments.largeCategoryId);
        yield {
          type: 'function_result',
          call_id: step.id,
          name: step.name,
          result: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      } else if (step.name === 'getItems') {
        const result = await getItems(step.arguments.smallCategoryId);

        yield {
          type: 'function_result',
          call_id: step.id,
          name: step.name,
          result: [
            {
              type: 'text',
              text: JSON.stringify(result),
            },
          ],
        };
      } else {
        return {
          type: 'function_result',
          call_id: step.id,
          name: step.name,
          is_error: true,
          result: 'Such a function is not defined.',
        };
      }
    }
    return;
  }

  throw new Error('The call is not defined.');
}

/**
 * The tools which can be called by the AI.
 * @type {import("@google/genai").Interactions.Tool[]}
 */
export const tools = [
  {
    type: 'function',
    name: 'getLargeLargeCategories',
    description: 'Retreives all the largest categories from the database.',
  },
  {
    type: 'function',
    name: 'getLargeCategories',
    description: 'Retreives all the large categories related with the given largest category.',
    parameters: {
      type: 'object',
      properties: {
        largeLargeCategoryId: {
          type: 'number',
          description: "The largest category's identity.",
        },
      },
      required: ['largeLargeCategoryId'],
    },
  },
  {
    type: 'function',
    description: 'Retreives all small categories related to the designated large category.',
    name: 'getSmallCategories',
    parameters: {
      type: 'object',
      properties: {
        largeCategoryId: {
          type: 'number',
          description: "The large category's identity.",
        },
      },
      required: ['largeCategoryId'],
    },
  },
  {
    type: 'function',
    description: 'Retreives all items under the identified small category given in the parameter.',
    name: 'getItems',
    parameters: {
      type: 'object',
      properties: {
        smallCategoryId: {
          type: 'number',
          description: 'The identity of the small category to filter.',
        },
      },
      required: ['smallCategoryId'],
    },
  },
];