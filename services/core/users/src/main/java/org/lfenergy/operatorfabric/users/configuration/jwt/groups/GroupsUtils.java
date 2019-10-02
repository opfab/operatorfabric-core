package org.lfenergy.operatorfabric.users.configuration.jwt.groups;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.json.JSONException;
import org.json.JSONObject;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.users.configuration.jwt.JwtProperties;
import org.lfenergy.operatorfabric.users.configuration.users.UsersProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class GroupsUtils {
	
	public static final String PATH_CLAIM_SEPARATOR = "/";
	public static final String PREFIX_ROLE = "ROLE_";
	
	@Autowired
	private GroupsProperties groupsProperties;
	
	@Autowired
	private JwtProperties jwtProperties;
	
	
	public List<GrantedAuthority> createAuthorityList(Jwt jwt) {
		
		List<GrantedAuthority> listResult = new ArrayList<GrantedAuthority>();
		
		List<RolesClaim> listRolesClaim = groupsProperties.getRolesClaim();
		List<String> listGroupsFromUniqueValueClaim = getGroupsFromListRolesClaim(jwt, listRolesClaim);
		listResult.addAll(computeAuthorities(listGroupsFromUniqueValueClaim));
		
		return listResult;
	}
	
	public List<GrantedAuthority> computeAuthorities(List<String> listGroups) {
		return AuthorityUtils
				.createAuthorityList(listGroups.stream().map(g -> PREFIX_ROLE + g).toArray(size -> new String[size]));
	}
	
	private List<String> getGroupsFromListRolesClaim(Jwt jwt, List<RolesClaim> listRolesClaim) {
		
		String user = jwt.getClaimAsString(jwtProperties.getSubClaim());
		
		List<String> listGroupsResult = new ArrayList<String>();
		listRolesClaim.stream()
//			.filter(roleClaim -> roleClaim.getMandatory())
			.forEach(roleClaim -> { 
				String valueResult = getListRolesFromClaim(jwt, roleClaim);
				// CONTROLE  
				if (roleClaim.getMandatory()) {
					if (null != valueResult) {
						if (roleClaim.getSingleValue()) {
							listGroupsResult.add(valueResult);
						} else {
							listGroupsResult.addAll(Arrays.asList(valueResult.split(roleClaim.getSeparator())));
						}
					} else {
						log.warn("no matched group for user " + user + " with the claim " + roleClaim.getPath());
					}		
				} else {
					if (null != valueResult) {
						listGroupsResult.add(valueResult);
					} else {
						log.info("no matched group for user " + user + " with the no mandatory claim " + roleClaim.getPath());
					}
				}
//			if (null == listGroupsResult)
//				throw new NullPointerException(pathEltSplited + " has no value set");
			
		});
				
		
		return listGroupsResult;
	}
	
	private String getListRolesFromClaim(Jwt jwt, RolesClaim rolesClaim) {
		String[] pathEltSplited = rolesClaim.getPath().split(PATH_CLAIM_SEPARATOR);
		
		int lengthTab = pathEltSplited.length;
		int position = 0;
		String valueResult = null; 
		String valueTempResult = null;
		JSONObject jsonObjectTemp = null;
		boolean isFirstElement = true;
		boolean isDone = false;
		
		while (!isDone) {
			if (isFirstElement) {
				// end process
				if ((position+1) == lengthTab) {
					valueResult = jwt.getClaimAsString(pathEltSplited[position]);	
					log.info(pathEltSplited[position] + " : " + valueResult);
					isDone = true;
				} else {
					try {
						valueTempResult = jwt.getClaimAsString(pathEltSplited[position]);
						if (null == valueTempResult) {
							// stop the loop, can't retrieve the next element 
							isDone = true;
						} else {						
							jsonObjectTemp = new JSONObject(valueTempResult);
							if (null != jsonObjectTemp) {
						    	 log.info(pathEltSplited[position] + " : " + jsonObjectTemp.toString());
						    }
						}
					} catch (JSONException err) {
					    log.error("Error", err.toString());
					    isDone = true;
					}
				}
				isFirstElement = false;
			} else {
				// end process
				if ((position+1) == lengthTab) {
					if (rolesClaim.getMandatory()) {
						valueResult = jsonObjectTemp.getString(pathEltSplited[position]);
						log.info(pathEltSplited[position] + " : " + valueResult);					
					} else {
						if (null != jsonObjectTemp.get(pathEltSplited[position])) {
							valueResult = pathEltSplited[position];
						} else {
							valueResult = null;
						}
					}
					isDone = true;
				} else {
					jsonObjectTemp = jsonObjectTemp.getJSONObject(pathEltSplited[position]);
					if (null == jsonObjectTemp) {
						// stop the loop, can't retrieve the next element 
						isDone = true;
					}
					else {	
						log.info(pathEltSplited[position] + " : " + jsonObjectTemp.toString());
					}
				}
			}
			position++;
		};
		
		return valueResult;
	}

}
