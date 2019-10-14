package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles;

import java.util.ArrayList;
import java.util.List;

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

	protected String roleValue;
	
	public RoleClaimCheckExistPath(String path) {
		super(path);
	}
	
	public RoleClaimCheckExistPath(String path, String roleValue) {
		this(path);
		this.roleValue = roleValue;
	}
	
	/**
	 * objectResult is not null meants that the path value exists in the JWT, 
	 * 		by default, the role associated is the last element of the path
	 * 		otherwise, use the field roleValue
	 */
	@Override
	public List<String> computeRolesRawResult(Object objectResult) {
		List<String> listGroupsResult = new ArrayList<>();

		if (null != objectResult) {
			// default value, implicite value, the last element of the path
			if (null == roleValue) {
				String[] pathEltSPlited = getPath().split(PATH_CLAIM_SEPARATOR);
				String implicitRoleValue = pathEltSPlited[pathEltSPlited.length - 1];
				listGroupsResult.add(implicitRoleValue);
			} else {
				listGroupsResult.add(roleValue);
			}

		}
		
		return listGroupsResult;
	}
	
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("RoleClaimCheckExistPath(path="+path+", roleValue="+ roleValue);
		return sb.toString();
	}

}
