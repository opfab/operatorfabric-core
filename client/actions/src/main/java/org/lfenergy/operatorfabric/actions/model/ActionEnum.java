
package org.lfenergy.operatorfabric.actions.model;

/**
 * Card associated Action type
 * <dl>
 *     <dt>EXTERNAL</dt><dd>Not defined</dd>
 *     <dt>JNLP</dt><dd>The action triggers a JNLP link</dd>
 *     <dt>URL</dt><dd>The action is tied to a url which must conform the specification of 3rd Party actions (see reference manual)</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Cards API.
 *
 * @author David Binder
 */
public enum ActionEnum {
  EXTERNAL,
  JNLP,
  URL
}

