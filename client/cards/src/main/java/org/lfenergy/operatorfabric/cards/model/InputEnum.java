package org.lfenergy.operatorfabric.cards.model;

/**
 * The type of input
 * <dl>
 *     <dt>TEXT</dt><dd>This input will be displayed as an input text</dd>
 *     <dt>LIST</dt><dd>This input will be displayed as a dropbox</dd>
 *     <dt>LIST_RADIO</dt><dd>This input will be displayed as a radio button group</dd>
 *     <dt>SWITCH_LIST</dt><dd>This input is displayed as two list whose values may be exchanged</dd>
 *     <dt>LONG_TEXT</dt><dd>This input will be displayed as a multi line input text</dd>
 *     <dt>BOOLEAN</dt><dd>This input will be displayed as a boolean</dd>
 *     <dt>STATIC</dt><dd>This input won't be displayed, it may serve as a constant parameter</dd>
 * </dl>
 *
 * @author David Binder
 */
public enum InputEnum {
  
  TEXT,
  LIST,
  LIST_RADIO,
  SWITCH_LIST,
  LONGTEXT,
  BOOLEAN,
  STATIC
}

