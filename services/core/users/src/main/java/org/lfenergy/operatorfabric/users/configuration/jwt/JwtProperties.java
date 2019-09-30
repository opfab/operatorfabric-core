package org.lfenergy.operatorfabric.users.configuration.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Data;

@ConfigurationProperties("operatorfabric.security.jwt")
@Data
public class JwtProperties {
	
	public String subClaim;
	public String givenNameClaim;
	public String familyNameClaim;

}
