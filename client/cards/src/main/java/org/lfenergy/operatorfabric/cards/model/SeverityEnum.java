
package org.lfenergy.operatorfabric.cards.model;

/**
 * Severity of the card content
 *
 * <dl>
 *     <dt>ALARM</dt><dd>Action is needed and the emitter process may be in critical state</dd>
 *     <dt>ACTION</dt><dd>Action is needed</dd>
 *     <dt>INFORMATION </dt><dd>Card content is informational only</dd>
 *     <dt>COMPLIANT </dt><dd> The process related to the card is in a compliant status </dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Cards API.
 *
 * Created on 10/07/18
 *
 * @author David Binder
 */
public enum SeverityEnum {
    ALARM,
    ACTION,
    INFORMATION,
    COMPLIANT
}
