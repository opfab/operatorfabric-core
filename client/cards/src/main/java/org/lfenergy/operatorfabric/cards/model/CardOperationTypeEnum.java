
package org.lfenergy.operatorfabric.cards.model;

/**
 * the severity of the card subject:
 * <dl>
 *     <dt>ADD</dt><dd>Operation lists cards object to add</dd>
 *     <dt>UPDATE</dt><dd>Operation lists cards object to update</dd>
 *     <dt>DELETE</dt><dd>Operation lists card ids to delete</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Cards API.
 *
 * @author David Binder
 */
public enum CardOperationTypeEnum {
  
  ADD,UPDATE,DELETE
}

