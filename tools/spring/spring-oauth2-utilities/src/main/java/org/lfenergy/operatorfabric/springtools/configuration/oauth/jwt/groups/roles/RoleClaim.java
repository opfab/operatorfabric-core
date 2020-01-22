package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import javax.validation.constraints.NotBlank;

import org.springframework.security.oauth2.jwt.Jwt;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Define the structure of the RoleClaim.
 * Must contain the field path, which defines where will be the key in the JWT structure.
 * 
 * @author chengyli
 *
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Slf4j
public abstract class RoleClaim {
	
	public static final String ROOT_PATH = "/";

	@NotBlank
	protected String path;
	
	/**
	 * Through a jwt, get a list of roles.
	 * 1) get the payload
	 * 2) Retrieve the node that contains the role information defined by the path
	 * 3) if null, not role will be mapped
	 * 		otherwise get a list of roles through a computation (defined by the child class) 
	 * @param jwt
	 * @return a list of roles
	 */
	public List<String> getListRoles(Jwt jwt) {
		
		JsonNode jsonNodeRoot;
		List<String> listRoleResult = new ArrayList<>();

		String payload = getPayload(jwt);
		
		try {
			jsonNodeRoot = getJsonNodeRoot(payload);
			listRoleResult = getListRoles(jsonNodeRoot);
		} catch (IOException e) {
			log.error("Unexpected Error arose",e);
		}
		
		return listRoleResult;
	}
	
	/**
	 * Get the jwt payload 
	 * @param jwt
	 * @return a payload decoded
	 */
	private String getPayload(Jwt jwt) {		
        String jwtToken = jwt.getTokenValue();
        String[] tokenSplit = jwtToken.split("\\.");
        
        // position 1 is the payload
        String base64EncodedBody = tokenSplit[1];
        String body = new String(Base64.getUrlDecoder().decode(base64EncodedBody));
 
		return body;
	}
	
	/**
	 * Get the payload in a format of JSON
	 * @param jwtBodyValue
	 * @return the payload jsonNodeRoot 
	 * @throws IOException
	 */
	private JsonNode getJsonNodeRoot(String jwtBodyValue) throws IOException {
		ObjectMapper objectMapper = new ObjectMapper();
		return objectMapper.readTree(jwtBodyValue);
	}
	
	/**
	 * Get the list of roles from the JSON node that contains the structure of role
	 * We control if the path exists
	 * 	 if not, not role mapped
	 * 		otherwise, get the list throught the computation depends on the node format
	 * @param jsonNodeRoot
	 * @return the list of roles 
	 */
	private List<String> getListRoles(JsonNode jsonNodeRoot) {	
		JsonNode jsonNodeElementRole = jsonNodeRoot.at(ROOT_PATH+path);
		
		// node not found, role not mapped
		if (null == jsonNodeElementRole || jsonNodeElementRole.isMissingNode())
			return new ArrayList<>();	
		
		return computeNodeElementRole(jsonNodeElementRole);
	}
	
	/**
	 * Get the list of roles from the JSON node that contains the structure of role
	 * The computation will be dealed by the child class
	 * @param jsonNodeElementRole
	 * @return a list of roles
	 */
	public abstract List<String> computeNodeElementRole(JsonNode jsonNodeElementRole) ;

}