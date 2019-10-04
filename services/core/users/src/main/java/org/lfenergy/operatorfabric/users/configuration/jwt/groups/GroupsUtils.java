package org.lfenergy.operatorfabric.users.configuration.jwt.groups;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.lfenergy.operatorfabric.users.configuration.jwt.JwtProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * Utility class to retrieve the GrantedAuthority list through a jwt
 * @author chengyli
 *
 */

@Component
@Slf4j
public class GroupsUtils {
	
	public static final String PATH_CLAIM_SEPARATOR = "/";
	public static final String PREFIX_ROLE = "ROLE_";
	
	@Autowired
	private GroupsProperties groupsProperties;
	
	@Autowired
	private JwtProperties jwtProperties;
	
	/**
	 * get a GrantedAuthority list from the Jwt 
	 * @param jwt
	 * @return List<GrantedAuthority>
	 */
	public List<GrantedAuthority> createAuthorityList(Jwt jwt) {
		
		List<RolesClaim> listRolesClaim = groupsProperties.getRolesClaim();
		List<String> listGroupsFromUniqueValueClaim = getGroupsFromListRolesClaim(jwt, listRolesClaim);
		
		return computeAuthorities(listGroupsFromUniqueValueClaim);
	}
	
	/**
	 * get a GrantedAuthority list from a groups list
	 * @param listGroups
	 * @return List<GrantedAuthority>
	 */
	public List<GrantedAuthority> computeAuthorities(List<String> listGroups) {
		return AuthorityUtils
				.createAuthorityList(listGroups.stream().map(g -> PREFIX_ROLE + g).toArray(size -> new String[size]));
	}
	
	/**
	 * get a groups list from the jwt through a roles claims list defined
	 * @param jwt
	 * @param listRolesClaim
	 * @return a groups list
	 */
	private List<String> getGroupsFromListRolesClaim(Jwt jwt, List<RolesClaim> listRolesClaim) {
		
		String user = jwt.getClaimAsString(jwtProperties.getSubClaim());
		List<String> listGroupsResult = new ArrayList<String>();
		
		listRolesClaim.stream()
			.forEach(roleClaim -> { 
				Object rolesRawResult = getRolesRawFromRolesClaim(jwt, roleClaim);
				
				List<String> listRoles = getListRolesFromRolesRawResult(user, roleClaim, rolesRawResult);
				
				listGroupsResult.addAll(listRoles);
			});
		
		return listGroupsResult;
	}

	/**
	 * get the role in a raw format (String, JSONArray or JSONObject)
	 * @param jwt
	 * @param rolesClaim
	 * @return raw role object
	 */
	private Object getRolesRawFromRolesClaim(Jwt jwt, RolesClaim rolesClaim) {
		String[] pathEltSplited = rolesClaim.getPath().split(PATH_CLAIM_SEPARATOR);
		
		int lengthTab = pathEltSplited.length;
		int position = 0;
		Object rolesResult = null; 
		String valueTempResult = null;
		JSONObject jsonObjectTemp = null;
		boolean isFirstElement = true;
		boolean isDone = false;
		
		try {
			while (!isDone) {
				if (isFirstElement) {
					// end process
					if ((position+1) == lengthTab) {
						// at this stage, we know it is a String in a format of a simple value or a JSONObject
						rolesResult = jwt.getClaimAsString(pathEltSplited[position]);	
						isDone = true;
					} else {
						valueTempResult = jwt.getClaimAsString(pathEltSplited[position]);
						if (null == valueTempResult) {
							// stop the process, can't retrieve the next element 
							isDone = true;
						} else {
							jsonObjectTemp = new JSONObject(valueTempResult);
						}						
					}
					isFirstElement = false;
				} else {
					// end process
					if ((position+1) == lengthTab) {
						// at this stage, we don't know what type is, can be a String, JSONArray or JSONObject...
						rolesResult= jsonObjectTemp.get(pathEltSplited[position]);
						isDone = true;
					} else {
						jsonObjectTemp = jsonObjectTemp.getJSONObject(pathEltSplited[position]);
					}
				}
				position++;
			};
		} catch (JSONException err) {
		    log.debug("error : " + err.getMessage());
		    rolesResult = null;
		}

		return rolesResult;
	}
	
	/**
	 * from a raw role format, get the group list by applying the rules 
	 * defined by the role claim (checkExistPath/roleValue/singleValue/separator)  
	 * @param user
	 * @param roleClaim
	 * @param rolesRawResult
	 * @return
	 */
	private List<String> getListRolesFromRolesRawResult(String user, RolesClaim roleClaim, Object rolesRawResult) {
		// get roles through all the parameters set (checkExistPath/roleValue/singleValue/separator)  
		List<String> listGroupsResult = new ArrayList<String>();
		
		if (null != rolesRawResult) {
			if (roleClaim.getCheckExistPath()) {
				// default value, implicite value, the last element of the path
				if (null == roleClaim.getRoleValue()) {
					String[] pathEltSPlited = roleClaim.getPath().split(PATH_CLAIM_SEPARATOR);
					String implicitRoleValue = pathEltSPlited[pathEltSPlited.length-1];
					listGroupsResult.add(implicitRoleValue);					
				} else 
					listGroupsResult.add(roleClaim.getRoleValue());
			} else {
				if (roleClaim.getSingleValue()) {
					listGroupsResult.add((String) rolesRawResult);
				} else {
					// case multiple value, by defaut, it is a JSONArray object,
					// otherwise, use the separator value to split the String result
					if (null == roleClaim.getSeparator()) {
						for (Object o : ((JSONArray) rolesRawResult).toList()) {
							listGroupsResult.add((String) o);
						}
					} else {
						listGroupsResult.addAll(Arrays.asList(((String) rolesRawResult).split(roleClaim.getSeparator())));
					}		
				}
			}
		} else {
			log.debug("no matched group for user " + user + " with the claim " + roleClaim.getPath());
		}
		
		return listGroupsResult;
	}

}
