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
 * @param {number=} smallCategoryId The small category's identity.
 * @returns
 */
export async function getItems(smallCategoryId) {
  if (smallCategoryId) {
    const { data, error } = await supabase
      .from('items')
      .select('id, name, life, description, small_category_id')
      .eq('small_category_id', smallCategoryId);

    if (error) throw error;
    return data.map(({ life, name, small_category_id, ...others }) => ({
      ...others,
      expireDate: life,
      productName: name,
      smallCategoryId: small_category_id,
    }));
  } else {
    const { data, error } = await supabase
      .from('items')
      .select('id, name, life, description, small_category_id');

    if (error) throw error;
    return data.map(({ life, name, small_category_id, ...others }) => ({
      ...others,
      expireDate: life,
      productName: name,
      smallCategoryId: small_category_id,
    }));
  }
}

/**
 * Retreives the items whose expiring date is in the range.
 * @param {string} rangeStart The date string of the range start date or end date. If rangeEnd is not given, this works as range end date.
 * @param {string=} rangeEnd The date range end value string.
 * @returns
 */
export async function getItemsWithDateRange(rangeStart, rangeEnd) {
  if (rangeEnd) {
    const { data, error } = await supabase
      .from('items')
      .select('id, name, life, description, small_category_id')
      .lte('life', rangeEnd)
      .gte('life', rangeStart);

    if (error) throw error;
    return data.map(({ life, name, small_category_id, ...others }) => ({
      ...others,
      expireDate: life,
      productName: name,
      smallCategoryId: small_category_id,
    }));
  } else {
    const { data, error } = await supabase
      .from('items')
      .select('id, name, life, description, small_category_id')
      .lte('life', rangeStart);

    if (error) throw error;
    return data.map(({ life, name, small_category_id, ...others }) => ({
      ...others,
      expireDate: life,
      smallCategoryId: small_category_id,
      productName: name,
    }));
  }
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
      } else if (step.name === 'getItemsWithDateRange') {
        const result = await getItemsWithDateRange(step.arguments.rangeStart, step.arguments.rangeEnd);

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
    description: 'Retreives all items under the identified small category given in the parameter. If no parameter is given, this returns all items in the database.',
    name: 'getItems',
    parameters: {
      type: 'object',
      properties: {
        smallCategoryId: {
          type: 'number',
          description: 'The identity of the small category to filter.',
        },
      },
      required: [],
    },
  },
  {
    type: 'function',
    description: 'Retreives all items with the given range of timestamp values. If one timestamp is given, this returns the items whose expiring date is before the timestamp; otherwise this returns ones with the range between the two timestamps. The timestamps must be ISO encoded string.',
    name: 'getItemsWithDateRange',
    parameters: {
      type: 'object',
      properties: {
        rangeStart: {
          type: 'string',
          description: 'The range start timestamp in ISO formatted string. If you pass only this argument, this means the range end timestamp.',
        },
        rangeEnd: {
          type: 'string',
          description: 'The range end timestamp in ISO specific string format. Optional',
        },
      },
      required: ['rangeStart'],
    },
  },
  {
    type: 'google_search',
  },
];