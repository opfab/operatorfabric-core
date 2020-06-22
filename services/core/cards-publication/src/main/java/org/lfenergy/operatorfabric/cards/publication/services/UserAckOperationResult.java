package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.Getter;
import lombok.ToString;

/**
 * User acknowledgement result data
 */
@ToString
public class UserAckOperationResult {

	@Getter
	private boolean cardFound;

	@Getter
	private Boolean operationDone;

	private UserAckOperationResult(boolean cardFound, Boolean operationDone) {
		this.cardFound = cardFound;
		this.operationDone = operationDone;
	}
	
	public static UserAckOperationResult cardNotFound() {
		return new UserAckOperationResult(false, null);
	}
	
	public static UserAckOperationResultBuilder cardFound() {
		return new UserAckOperationResultBuilder();
	}

	static class UserAckOperationResultBuilder {
		
		private UserAckOperationResultBuilder() {}

		public UserAckOperationResult operationDone(boolean operationDone) {
			return new UserAckOperationResult(true, operationDone);
		}
		
	}
}
