package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups;

import java.util.List;
import java.util.stream.Collectors;

import org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles.RoleClaim;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Utility class to retrieve the GrantedAuthority list through a jwt
 * @author chengyli
 *
 */

@Component
public class GroupsUtils {
	
	public static final String PREFIX_ROLE = "ROLE_";
	
	@Autowired
	private GroupsProperties groupsProperties;
	
	/**
	 * get a GrantedAuthority list from the Jwt 
	 * @param jwt
	 * @return List<GrantedAuthority>
	 */
	public List<GrantedAuthority> createAuthorityList(Jwt jwt) {
		
		List<RoleClaim> listRoleClaim = groupsProperties.getListRoleClaim();
		List<String> listGroupsFromListRolesClaim = getGroupsFromListRolesClaim(jwt, listRoleClaim);
		List<GrantedAuthority> listGrantedAuthority = computeAuthorities(listGroupsFromListRolesClaim);
		
		return listGrantedAuthority;
	}
	
	/**
	 * get a groups list from the jwt through a roles claims list defined
	 * @param jwt
	 * @param listRolesClaim
	 * @return a groups list
	 */
	private List<String> getGroupsFromListRolesClaim(Jwt jwt, List<RoleClaim> listRoleClaim) {	
		return listRoleClaim.stream().map(roleClaim -> roleClaim.getListRoles(jwt))
				.flatMap(List::stream)
				.collect(Collectors.toList());
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
	
}

