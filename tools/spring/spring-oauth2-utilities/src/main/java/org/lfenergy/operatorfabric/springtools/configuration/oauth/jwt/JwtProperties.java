package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

/**
 * define the jwt properties
 * @author chengyli
 *
 */

@ConfigurationProperties("operatorfabric.security.jwt")
@Component
@Data
public class JwtProperties {
	
	// mandatory claim, default value
	public String loginClaim = "sub";
	
	// optional claims
	public String givenNameClaim = "given-name";
	public String familyNameClaim = "family-name";

}
