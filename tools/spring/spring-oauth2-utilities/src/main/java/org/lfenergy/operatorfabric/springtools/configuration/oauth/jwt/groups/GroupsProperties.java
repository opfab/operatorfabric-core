package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups;

import java.util.List;
import java.util.stream.Collectors;

import javax.validation.constraints.NotBlank;

import org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles.RoleClaim;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

/**
 * Define how to get the roles from a JWT mode or from the OPERATOR_FABRIC mode
 * @author chengyli
 *
 */

@ConfigurationProperties("operatorfabric.security.jwt.groups")
@Component
@Data
public class GroupsProperties {
		
	@NotBlank
	private GroupsMode mode;
	
	private RolesClaim rolesClaim;
	
	/**
	 * retrieve all the RolesClaimStandard and all the RolesClaimCheckExistPath converted into a generic RoleClaim.
	 * @return a list of generic roleClaim 
	 */
	public List<RoleClaim> getListRoleClaim() {
		List<RoleClaim> listRoleClaimResult = rolesClaim.getRolesClaimStandard()
			.stream()
			.map(roleClaimStandard -> (RoleClaim) roleClaimStandard)
			.collect(Collectors.toList());
		
		listRoleClaimResult.addAll(
				rolesClaim.getRolesClaimCheckExistPath()
				.stream()
				.map(roleClaimCheckExistPath -> (RoleClaim) roleClaimCheckExistPath)
				.collect(Collectors.toList()));
		
		return listRoleClaimResult;
	}
	
}
