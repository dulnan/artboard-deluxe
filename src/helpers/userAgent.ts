/**
 * Determine whether the library is used in a Apple (Mac, iPhone, iPad) context.
 */
export function isMac() {
  return /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent)
}
