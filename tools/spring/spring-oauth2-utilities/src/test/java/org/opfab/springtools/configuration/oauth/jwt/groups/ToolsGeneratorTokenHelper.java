/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.springtools.configuration.oauth.jwt.groups;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
/**
 * 
 *
 *
 */
public class ToolsGeneratorTokenHelper {
	
	public static final String JWT_HEADER = "{\"alg\":\"HS256\",\"typ\":\"JWT\",\"kid\":\"RmqNU3K7LxrNRFkHU2qq6Yq12kTCismFL9ScpnCOx0c\"}";

	public static final String JWT_BODY = "{ \n" + 
			"    \"jti\": \"ebf36450-e18c-490b-9a68-feef8dfab1c1\",\n" + 
			"    \"exp\": 1571170078,\n" + 
			"    \"nbf\": 0,\n" + 
			"    \"iat\": 1571152078,\n" + 
			"    \"iss\": \"http://localhost:89/auth/realms/dev\",\n" + 
			"    \"aud\": \"account\",\n" + 
			"    \"sub\": \"user_not_opfab\",\n" + 
			"    \"typ\": \"Bearer\",\n" + 
			"    \"azp\": \"opfab-client\",\n" + 
			"    \"acr\": \"1\",\n" + 
			"    \"roleClaim\":\"RoleClaimValue\",\n" + 
			"    \"pathA1\": {\n" + 
			"        \"pathA2\": {\n" + 
			"            \"roleClaim\":\"ADMIN\"    \n" + 
			"        }\n" + 
			"    },\n" + 
			"    \"pathB1\": {\n" + 
			"        \"pathB2\": {\n" + 
			"            \"pathB3\": {\n" + 
			"                \"listRoleClaim\":\"RoleB1;RoleB2;RoleB3\"    \n" + 
			"            }   \n" + 
			"        }\n" + 
			"    },\n" + 
			"    \"pathC1\": {\n" + 
			"        \"listRoleClaim\":\"RoleC1,RoleC2\"\n" + 
			"    },\n" + 
			"    \"pathF1\": {\n" + 
			"        \"pathF2\": {\n" + 
			"            \"listRoleClaim\": [\n" + 
			"                \"F1\", \n" + 
			"                \"F2\", \n" + 
			"                \"F3\"\n" + 
			"            ]\n" + 
			"        }\n" + 
			"    },\n" + 
			"    \"pathD1\": {\n" + 
			"        \"RoleClaimOptionalD1\": {\n" + 
			"            \"othersD2\": \"Value not important\"\n" + 
			"        }\n" + 
			"    },\n" + 
			"    \"pathE1\": {\n" + 
			"        \"pathE2\": {\n" + 
			"            \"RoleClaimOptionalE1\": \"Value not important\"\n" + 
			"        }\n" + 
			"    }\n" + 
			"}";

	public static String getTokenEncoded(String header, String payload) {
		String signature = hmacSha256(encode(header.getBytes()) + "." + encode(payload.getBytes()), "app-secret");
		String jwtToken = encode(header.getBytes()) + "." + encode(payload.getBytes()) + "." + signature;
		return jwtToken;
	}
	
	public static String encode(byte[] bytes) {
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private static String hmacSha256(String data, String secret) {
		try {

			// MessageDigest digest = MessageDigest.getInstance("SHA-256");
			byte[] hash = secret.getBytes(StandardCharsets.UTF_8);// digest.digest(secret.getBytes(StandardCharsets.UTF_8));

			Mac sha256Hmac = Mac.getInstance("HmacSHA256");
			SecretKeySpec secretKey = new SecretKeySpec(hash, "HmacSHA256");
			sha256Hmac.init(secretKey);

			byte[] signedBytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
			return encode(signedBytes);
		} catch (NoSuchAlgorithmException | InvalidKeyException ex) {
			Logger.getLogger(ToolsGeneratorTokenHelper.class.getName()).log(Level.SEVERE, ex.getMessage(), ex);
			return null;
		}
	}

	public static String getPayload(String jwtToken) {		
        String[] tokenSplit = jwtToken.split("\\.");
        
        // position 1 is the payload
        String base64EncodedBody = tokenSplit[1];
        String body = new String(Base64.getUrlDecoder().decode(base64EncodedBody));
 
		return body;
	}
	
	public static void main(String args[]) {

		String jwtEncoded = getTokenEncoded(JWT_HEADER, JWT_BODY);
//		System.out.println("token encoded : " + jwtEncoded);
		String payload = getPayload(jwtEncoded);
//		System.out.println("payload decoded : " + payload);

	}

}
