/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.model;

import java.math.BigDecimal;
import java.util.List;

import org.opfab.useractiontracing.model.UserActionLog;
public class UserActionLogPage {
    private List<UserActionLog> content;

    private Boolean first;

    private Boolean last;

    private BigDecimal totalPages;

    private BigDecimal totalElements;

    private BigDecimal numberOfElements;

    private BigDecimal size;

    private BigDecimal number;

    public List<UserActionLog> getContent() {
        return content;
    }

    public void setContent(List<UserActionLog> content) {
        this.content = content;
    }

    public Boolean getFirst() {
        return first;
    }

    public void setFirst(Boolean first) {
        this.first = first;
    }

    public Boolean getLast() {
        return last;
    }

    public void setLast(Boolean last) {
        this.last = last;
    }

    public BigDecimal getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(BigDecimal totalPages) {
        this.totalPages = totalPages;
    }

    public BigDecimal getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(BigDecimal totalElements) {
        this.totalElements = totalElements;
    }

    public BigDecimal getNumberOfElements() {
        return numberOfElements;
    }

    public void setNumberOfElements(BigDecimal numberOfElements) {
        this.numberOfElements = numberOfElements;
    }

    public BigDecimal getSize() {
        return size;
    }

    public void setSize(BigDecimal size) {
        this.size = size;
    }

    public BigDecimal getNumber() {
        return number;
    }

    public void setNumber(BigDecimal number) {
        this.number = number;
    }


}
