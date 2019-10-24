package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

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
	public String subClaim = "sub";
	
	// optional claims
	public String givenNameClaim;
	public String familyNameClaim;

}
