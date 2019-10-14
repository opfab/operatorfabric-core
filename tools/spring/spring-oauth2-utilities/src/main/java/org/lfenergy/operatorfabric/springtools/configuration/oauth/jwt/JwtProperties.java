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
	
	public String subClaim;
	public String givenNameClaim;
	public String familyNameClaim;

}
