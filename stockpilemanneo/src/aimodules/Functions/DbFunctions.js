import supabase from "../../client.js";

/**
 * Returns the set of all available categories.
 * @returns
 */
export async function getCategoriesSet() {
  const { data, error } = await supabase
    .from('large_large_categories')
    .select('id, name, large_categories(id, name, small_categories(id, name))');

  if (error) throw error;
  return new Set(data);
}

/**
 * Returns the set of items filtered by the small category.
 * @param {{
 *   id: number,
 *   name: string,
 * }} small_category The small category.
 * @returns
 */
export async function getItems(small_category) {
  const { data, error } = await supabase
    .from('items')
    .select('id, name, life, description')
    .eq('small_category_id', small_category.id);

  if (error) throw error;
  return new Set(data);
}