package org.lfenergy.operatorfabric.users.configuration.jwt.groups;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@ConfigurationProperties("operatorfabric.security.jwt.groups")
@Component
@Data
public class GroupsProperties {
	
	public GroupsMode mode;
	
	public List<RolesClaim> rolesClaim;
	
}
