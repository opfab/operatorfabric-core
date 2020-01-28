
package org.lfenergy.operatorfabric.springtools.error.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.springframework.http.HttpStatus;

import java.util.List;

/**
 * Api Error model used to return formatted error in http response payload
 *
 * @author David Binder
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApiError {

  private HttpStatus status;
  private String message;
  @Singular
  @JsonInclude(value=JsonInclude.Include.NON_EMPTY, content=JsonInclude.Include.NON_NULL)
  private List<String> errors;
}