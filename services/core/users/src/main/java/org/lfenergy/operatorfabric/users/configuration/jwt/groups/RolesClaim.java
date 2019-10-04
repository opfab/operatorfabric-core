package org.lfenergy.operatorfabric.users.configuration.jwt.groups;

import javax.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Define the parameters to get a role value in the JWT mode
 * @author chengyli
 *
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RolesClaim {
	
	@NotBlank
	public String path;
	
	public Boolean singleValue = Boolean.TRUE;
	public String separator;
	
	public Boolean checkExistPath = Boolean.FALSE;
	public String roleValue;
	
}
