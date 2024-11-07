/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
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
	

	public static String getTokenEncoded(String header, String payload) {
		String signature = hmacSha256(encode(header.getBytes()) + "." + encode(payload.getBytes()), "app-secret");
		String jwtToken = encode(header.getBytes()) + "." + encode(payload.getBytes()) + "." + signature;
		return jwtToken;
	}
	
	private static String encode(byte[] bytes) {
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private static String hmacSha256(String data, String secret) {
		try {

			byte[] hash = secret.getBytes(StandardCharsets.UTF_8);

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



}
