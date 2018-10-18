/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.springtools.error.model;

import lombok.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiError {

  private HttpStatus status;
  private String message;
  @Singular
  private List<String> errors;
}