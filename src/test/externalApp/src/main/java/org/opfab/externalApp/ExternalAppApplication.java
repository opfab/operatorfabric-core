/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externalApp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@Slf4j
@SpringBootApplication
public class ExternalAppApplication implements CommandLineRunner {

	public static void main(String[] args) {
		SpringApplication.run(ExternalAppApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		log.info(" ******************************************************");
		log.info(" ***********  Welcome to External Application **********");
		log.info(" ******************************************************");
	}

}
