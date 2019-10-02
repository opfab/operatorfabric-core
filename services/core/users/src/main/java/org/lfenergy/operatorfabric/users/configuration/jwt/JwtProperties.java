package org.lfenergy.operatorfabric.users.configuration.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@ConfigurationProperties("operatorfabric.security.jwt")
@Component
@Data
public class JwtProperties {
	
	public String subClaim;
	public String givenNameClaim;
	public String familyNameClaim;

}
