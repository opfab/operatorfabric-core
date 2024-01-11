/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


 package org.opfab.users.model;

 import com.fasterxml.jackson.annotation.JsonCreator;
 import com.fasterxml.jackson.annotation.JsonValue;
 
 public enum RolesEnum {
     ACTIVITY_AREA("ACTIVITY_AREA"),
     ACTIVITY_AREA_GROUP("ACTIVITY_AREA_GROUP"),
     CARD_SENDER("CARD_SENDER"),
     CARD_RECEIVER("CARD_RECEIVER");
 
     private String value;
 
     RolesEnum(String value) {
         this.value = value;
     }
 
     @Override
     @JsonValue
     public String toString() {
         return String.valueOf(value);
     }
 
     @JsonCreator
     public static RolesEnum fromValue(String text) {
         for (RolesEnum b : RolesEnum.values()) {
             if (String.valueOf(b.value).equals(text)) {
                 return b;
             }
         }
         return null;
     }
 }