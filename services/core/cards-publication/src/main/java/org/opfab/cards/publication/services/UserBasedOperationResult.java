package org.opfab.cards.publication.services;

import lombok.Getter;
import lombok.ToString;

import java.util.Objects;

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


	@Override
	public int hashCode() {
		return Objects.hash(cardFound, operationDone);
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		UserBasedOperationResult that = (UserBasedOperationResult) o;
		return isCardFound() == that.isCardFound() &&
				Objects.equals(getOperationDone(), that.getOperationDone());
	}
}
