package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles;

import java.util.List;

import javax.validation.constraints.NotBlank;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.security.oauth2.jwt.Jwt;

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

	public static final String PATH_CLAIM_SEPARATOR = "/";

	@NotBlank
	protected String path;
	
	/**
	 * Through a jwt, get a list of roles.
	 * 1) Convert the jwt object into a JSONObject root.
	 * 2) Retrieve the node that contains the role information defined by the path
	 * 3) if null, not role will be mapped
	 * 		otherwise get a list of roles through a computation (defined by the child class) 
	 * @param jwt
	 * @return a list of roles
	 */
	public List<String> getListRoles(Jwt jwt) {
		JSONObject rootJSONObject = getRootJSONObject(jwt);
		Object rolesRawResult = getRolesRawResult(rootJSONObject);
		return computeRolesRawResult(rolesRawResult);
	}
	
	/**
	 * Create a JSONObject root from a jwt
	 * @param jwt
	 * @return JSONObject root
	 */
	private JSONObject getRootJSONObject(Jwt jwt) {
		return new JSONObject(jwt.getClaims());
	}

	/**
	 * Retrieve the node that contains the role information defined by the path 
	 * @param rootJSONObject root
	 * @return Object that contains the role information
	 */
	private Object getRolesRawResult(JSONObject rootJSONObject) {

		String[] pathEltSplited = path.split(PATH_CLAIM_SEPARATOR);

		int lengthTab = pathEltSplited.length;
		int position = 0;
		Object rolesRawResult = null;
		JSONObject jsonObjectTemp = rootJSONObject;
		boolean isDone = false;
		
		try {
			while (!isDone) {
				// end process
				if ((position+1) == lengthTab) {
					// at this stage, we don't know what type is, can be a String, JSONArray or
					// JSONObject...
					rolesRawResult = jsonObjectTemp.get(pathEltSplited[position]);
					isDone = true;
				} else {
					jsonObjectTemp = jsonObjectTemp.getJSONObject(pathEltSplited[position]);
				}
				position++;
			}
		} catch (JSONException err) {
			log.debug("error : " + err.getMessage());
			rolesRawResult = null;
		}

		return rolesRawResult;
	}
	
	/**
	 * rolesRawResult contains the role information.
	 * Since the input is an Object, the role information can be in a String format or a JSONObject or a JSONArray.
	 * The computation will be dealed by the child class
	 * @param rolesRawResult
	 * @return a list of roles
	 */
	public abstract List<String> computeRolesRawResult(Object rolesRawResult);

}