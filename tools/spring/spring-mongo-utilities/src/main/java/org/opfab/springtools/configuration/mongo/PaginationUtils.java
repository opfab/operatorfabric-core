/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.mongo;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

public class PaginationUtils {

    public static final int DEFAULT_PAGE_SIZE = 10;

    private PaginationUtils() {
    }
    public static Pageable createPageable(Integer page, Integer size) {
        if (page != null && size != null) {
            return PageRequest.of(page.intValue(), size.intValue());
        } else if (page != null) {
            //If page number is specified but not size, use default size
            return PageRequest.of(page.intValue(), DEFAULT_PAGE_SIZE);
        } else if (size != null) {
            //If page size is specified but not page number, return first page by default
            return PageRequest.of(0, size.intValue());
        } else {
            return Pageable.unpaged();
        }
    }
}
