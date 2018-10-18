/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.model;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * the severity of the card subject > * ADD - Operation lists cards object to add * UPDATE - Operation lists cards object to update * DELETE - Operation lists card ids to delete
 */
public enum CardOperationTypeEnum {
  
  ADD,UPDATE,DELETE
}

