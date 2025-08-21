/**
 * Possible values for the MouseEvent.buttons property.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
 */
export const MOUSE_BUTTONS = Object.freeze({
  /**
   *No button or un-initialized.
   */
  NONE: 0,

  /**
   * Primary button (usually the left button).
   */
  PRIMARY: 1,

  /**
   * Secondary button (usually the right button).
   */
  SECONDARY: 2,

  /**
   * Auxiliary button (usually the mouse wheel button or middle button).
   */
  AUXILIARY: 4,

  /**
   * 4th button (typically the "Browser Back" button).
   */
  FOURTH: 8,

  /**
   * 5th button (typically the "Browser Forward" button).
   */
  FIFTH: 16,
})
