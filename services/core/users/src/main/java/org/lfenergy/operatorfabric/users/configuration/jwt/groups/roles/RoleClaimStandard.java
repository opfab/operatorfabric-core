package org.lfenergy.operatorfabric.users.configuration.jwt.groups.roles;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.json.JSONArray;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Define the structure of the RoleClaimStandard, the most common use case, which is a key/value system.
 * @author chengyli
 *
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper=true)
public class RoleClaimStandard extends RoleClaim {
	
	protected Boolean singleValue = Boolean.TRUE;
	protected String separator;
	
	public RoleClaimStandard(String path, Boolean singleValue, String separator) {
		this(path, singleValue);
		this.separator = separator;
	}
	
	public RoleClaimStandard(String path, Boolean singleValue) {
		this(path);
		this.singleValue = singleValue;
	}
	
	public RoleClaimStandard(String path) {
		super(path);
	}

	/**
	 * The field singleValue defines if the roleClaimStandard has one role or not.
	 * if not, it returns a list of roles.
	 * 		By default : we deal a JSONArray object that it is converted into a list of roles
	 * 		otherwise, we compute through the field separator to convert a String that contains a list of roles separated by a separator.
	 */
	@Override
	public List<String> computeRolesRawResult(Object objectResult) {
		
		List<String> listGroupsResult = new ArrayList<>();
		
		if (null != objectResult) {
			if (Boolean.TRUE.equals(singleValue)) {
				listGroupsResult.add((String) objectResult);
			} else {
				// case multiple value, by defaut, it is a JSONArray object,
				// otherwise, use the separator value to split the String result
				if (null == separator) {
					for (Object o : ((JSONArray) objectResult).toList()) {
						listGroupsResult.add((String) o);
					}
				} else {
					listGroupsResult.addAll(Arrays.asList(((String) objectResult).split(separator)));
				}		
			}
		} 
		
		return listGroupsResult;
	}
	
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("RoleClaimStandard(path="+path+", singleValue="+ singleValue + ", separator=" + separator);
		return sb.toString();
	}
	 
}

