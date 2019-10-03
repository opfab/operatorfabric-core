package org.lfenergy.operatorfabric.users.configuration.jwt.groups;

import java.util.List;

import javax.validation.constraints.NotBlank;

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
	public GroupsMode mode;
	
	public List<RolesClaim> rolesClaim;
	
}
