package org.lfenergy.operatorfabric.users.configuration.groups;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Data;

@ConfigurationProperties("operatorfabric.groups")
@Data
public class GroupsProperties {
	
	public GroupsMode mode;
	
	public List<UniqueValueClaim> uniqueValueClaim;
	public List<MultipleValuesClaim> multipleValuesClaim;
		
}
