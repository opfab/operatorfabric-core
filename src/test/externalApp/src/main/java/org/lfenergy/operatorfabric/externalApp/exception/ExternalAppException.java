package org.lfenergy.operatorfabric.externalApp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(code = HttpStatus.NOT_FOUND)
public class ExternalAppException extends RuntimeException {

	/**
	 * Default version id for serializable class
	 */
	private static final long serialVersionUID = 1L;

	public ExternalAppException(String message) {
	    super(message);
	}
}