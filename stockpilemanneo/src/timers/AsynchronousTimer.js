/**
 * The asynchronous time which can be waited with await.
 * @param {number} duration The timer duration in milliseconds.
 * @returns {Promise<number>} The promise returning the duration.
 */
export default function asynchronousTimer(duration) {
  return new Promise(resolve => {
    setTimeout(() => resolve(duration), duration);
  });
}