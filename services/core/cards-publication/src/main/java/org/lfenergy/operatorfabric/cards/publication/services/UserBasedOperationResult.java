package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.Getter;
import lombok.ToString;

/**
 * User acknowledgement result data
 */
@ToString
public class UserBasedOperationResult {

	@Getter
	private boolean cardFound;

	@Getter
	private Boolean operationDone;

	private UserBasedOperationResult(boolean cardFound, Boolean operationDone) {
		this.cardFound = cardFound;
		this.operationDone = operationDone;
	}
	
	public static UserBasedOperationResult cardNotFound() {
		return new UserBasedOperationResult(false, null);
	}
	
	public static UserAckOperationResultBuilder cardFound() {
		return new UserAckOperationResultBuilder();
	}

	static class UserAckOperationResultBuilder {
		
		private UserAckOperationResultBuilder() {}

		public UserBasedOperationResult operationDone(boolean operationDone) {
			return new UserBasedOperationResult(true, operationDone);
		}
		
	}
}
