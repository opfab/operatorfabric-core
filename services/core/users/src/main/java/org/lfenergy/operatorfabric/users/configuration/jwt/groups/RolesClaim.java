package org.lfenergy.operatorfabric.users.configuration.jwt.groups;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RolesClaim {
	
	public Boolean mandatory;
	public String path;
	public Boolean singleValue;
	public String separator;
	
}
