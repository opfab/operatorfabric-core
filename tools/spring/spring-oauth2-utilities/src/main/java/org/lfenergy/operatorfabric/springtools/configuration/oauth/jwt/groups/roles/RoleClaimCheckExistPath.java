package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles;

import java.util.ArrayList;
import java.util.List;

import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Define the structure of the RoleClaimCheckExistPath.
 * It is a specific case to retrieve a role through a path value.
 * @author chengyli
 *
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper=true)
public class RoleClaimCheckExistPath extends RoleClaim {

	@NotNull
	protected String roleValue;
	
	public RoleClaimCheckExistPath(String path) {
		super(path);
	}
	
	public RoleClaimCheckExistPath(String path, String roleValue) {
		this(path);
		this.roleValue = roleValue;
	}
	
	/**
	 * Get the list of role through the computation
	 * No need to check (already check before) 
	 * In this case, return the role value associated.
	 */
	@Override
	public List<String> computeNodeElementRole(JsonNode jsonNodeElement) {
		List<String> listGroupsResult = new ArrayList<>();
		listGroupsResult.add(roleValue);
		return listGroupsResult;
	}
	
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("RoleClaimCheckExistPath(path="+path+", roleValue="+ roleValue+")");
		return sb.toString();
	}


}
