/* Copyright (c) 2023, Alliander N.V. (https://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.kafka.util;

import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

/**
 * A utility to get beans.
 */
@Component
public class BeanUtil implements ApplicationContextAware {

	private static ApplicationContext context;

	static synchronized void setAppContext(final ApplicationContext applicationContext){
		BeanUtil.context = applicationContext;
	}

	/**
	 * Sets the application context to a static variable
	 *
	 * @param applicationContext
	 * @throws BeansException
	 */
	@Override
	public void setApplicationContext(final ApplicationContext applicationContext) {
		BeanUtil.setAppContext(applicationContext);
	}

	/**
	 * Gets a bean that can be used in non spring wired objects.
	 *
	 * @param beanClass
	 * @param <T>
	 * @return T
	 */
	public static <T> T getBean(final Class<T> beanClass) {
		return BeanUtil.context.getBean(beanClass);
	}

	public static boolean isContextSet() {
		return context != null;
	}
}
