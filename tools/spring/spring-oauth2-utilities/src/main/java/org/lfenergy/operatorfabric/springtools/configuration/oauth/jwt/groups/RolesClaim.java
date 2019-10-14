package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups;

import java.util.List;

import org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles.RoleClaimCheckExistPath;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles.RoleClaimStandard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Contains all type of RoleClaim (RoleClaimStandard or RoleClaimCheckExistPath for instance)
 * @author chengyli
 *
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RolesClaim {

	private List<RoleClaimStandard> rolesClaimStandard;
	private List<RoleClaimCheckExistPath> rolesClaimCheckExistPath;

}
