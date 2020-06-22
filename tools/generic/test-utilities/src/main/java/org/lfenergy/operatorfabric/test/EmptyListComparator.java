/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.test;

import java.util.Comparator;
import java.util.List;

/**
 * This comparator returns 0 if the two {@link List} are equal but also if one is empty and the other is null.
 */
public class EmptyListComparator<T> implements Comparator<List<T>> {

    @Override
    public int compare(List<T> ts, List<T> t1) {
        if (ts==null && t1==null) return 0;
        if((ts==null&&t1.isEmpty())||(ts.isEmpty()&&t1==null)) {
            return 0;
        } else {
            if (ts.equals(t1)) {
                return 0;
            } else return 1;
        }
    }
}
