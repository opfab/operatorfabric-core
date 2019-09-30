package org.lfenergy.operatorfabric.users.configuration.groups;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.json.JSONException;
import org.json.JSONObject;
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
	
	
	public List<GrantedAuthority> createAuthorityList(Jwt jwt) {
		
		List<GrantedAuthority> listResult = new ArrayList<GrantedAuthority>();
		
		List<UniqueValueClaim> listUniqueValueClaim = groupsProperties.getUniqueValueClaim();
		List<String> listGroupsFromUniqueValueClaim = getGroupsFromListUniqueValueClaim(jwt, listUniqueValueClaim);
		listResult.addAll(computeAuthorities(listGroupsFromUniqueValueClaim));
		
		List<MultipleValuesClaim> listMultipleValuesClaim = groupsProperties.getMultipleValuesClaim();
		List<String> listGroupsFromMultipleValueClaim = getGroupsFromListMultipleValuesClaim(jwt, listMultipleValuesClaim);
		listResult.addAll(computeAuthorities(listGroupsFromMultipleValueClaim));
		
		return listResult;
	}
	
	public List<GrantedAuthority> computeAuthorities(List<String> listGroups) {
		return AuthorityUtils
				.createAuthorityList(listGroups.stream().map(g -> PREFIX_ROLE + g).toArray(size -> new String[size]));
	}
	
	private List<String> getGroupsFromListUniqueValueClaim(Jwt jwt, List<UniqueValueClaim> listUniqueValueClaim) {
		
		List<String> listGroups = listUniqueValueClaim.stream()
			.map(pathElt -> pathElt.getPath().split(PATH_CLAIM_SEPARATOR))
			.map(pathEltSplited -> {
				
				int lengthTab = pathEltSplited.length;
				int position = 0;
				String result = null;
				JSONObject jsonObjectTemp = null;
				boolean isFirstElement = true;
				boolean isDone = false;
				
				while (!isDone) {
					if (isFirstElement) {
						if ((position+1) == lengthTab) {
							result = jwt.getClaimAsString(pathEltSplited[position]);
							log.info(result);
							isDone = true;
						} else {
							try {
								jsonObjectTemp = new JSONObject(jwt.getClaimAsString(pathEltSplited[position]));
							    log.info(jsonObjectTemp.toString()); 
							} catch (JSONException err) {
							    log.debug("Error", err.toString());
							}
						}
						isFirstElement = false;
					} else {
						if ((position+1) == lengthTab) {
							result = jsonObjectTemp.getString(pathEltSplited[position]);
							if (null != result) {
						    	 log.info(result);
						    }
							isDone = true;
						} else {
							jsonObjectTemp = jsonObjectTemp.getJSONObject(pathEltSplited[position]);
							if (null != jsonObjectTemp) {
						    	 log.info(jsonObjectTemp.toString());
						    }
						}
					}
					position++;
				};
				
				if (null == result)
					throw new NullPointerException(pathEltSplited + " has no value set");
				return result;

			}).collect(Collectors.toList());
		
		return listGroups;
	}
	
	private List<String> getGroupsFromListMultipleValuesClaim(Jwt jwt, List<MultipleValuesClaim> listMultipleValuesClaim) {
		
		List<String> listGroups = listMultipleValuesClaim.stream()
			.map(pathElt -> {
				
				String[] pathEltSplited = pathElt.getPath().split(PATH_CLAIM_SEPARATOR);
				int lengthTab = pathEltSplited.length;
				int position = 0;
				String groupValueResult = null;
				String[] listGroupsResult = null;
				JSONObject jsonObjectTemp = null;
				boolean isFirstElement = true;
				boolean isDone = false;
				
				while (!isDone) {
					if (isFirstElement) {
						if ((position+1) == lengthTab) {
							groupValueResult = jwt.getClaimAsString(pathEltSplited[position]);							
							log.info(groupValueResult);
							listGroupsResult = groupValueResult.split(pathElt.getSeparator());
							isDone = true;
						} else {
							try {
								jsonObjectTemp = new JSONObject(jwt.getClaimAsString(pathEltSplited[position]));
							    log.info(jsonObjectTemp.toString()); 
							} catch (JSONException err) {
							    log.debug("Error", err.toString());
							}
						}
						isFirstElement = false;
					} else {
						if ((position+1) == lengthTab) {
							groupValueResult = jsonObjectTemp.getString(pathEltSplited[position]);
							if (null != groupValueResult) {
						    	 log.info(groupValueResult);
						    }
							listGroupsResult = groupValueResult.split(pathElt.getSeparator());
							isDone = true;
						} else {
							jsonObjectTemp = jsonObjectTemp.getJSONObject(pathEltSplited[position]);
							if (null != jsonObjectTemp) {
						    	 log.info(jsonObjectTemp.toString());
						    }
						}
					}
					position++;
				};
				
				if (null == listGroupsResult)
					throw new NullPointerException();
				return Arrays.asList(listGroupsResult);
			})
			.flatMap(List::stream)
			.collect(Collectors.toList());		
		
		return listGroups;
	}

}
