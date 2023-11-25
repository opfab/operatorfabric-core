/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.generators;

import io.swagger.codegen.CodegenOperation;
import io.swagger.codegen.languages.SpringCodegen;
import io.swagger.models.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.ListIterator;
import java.util.Map;

/**
 * <p>specific client OperatorFabric generator derived from {@link SpringCodegen}</p>
 * <ul>
 *     <li>Adds x-operatorfabric-spring-subPath vendor extension, it contains subpath
 *     to allow affecting a base path to class main mapping and subpath to method mapping</li>
 * </ul>
 */
public class OpfabSpringGenerator extends SpringCodegen {

    protected final Logger log = LoggerFactory.getLogger(OpfabSpringGenerator.class);
  
    @Override
    public void addOperationToGroup(String tag, String resourcePath, Operation operation, CodegenOperation co, Map<String, List<CodegenOperation>> operations) {
        try {
            super.addOperationToGroup(tag, resourcePath, operation, co, operations);
            if((library.equals(DEFAULT_LIBRARY) || library.equals(SPRING_MVC_LIBRARY)) && !useTags) {
                String basePath = resourcePath;
                String subPath = "";
                if (basePath.startsWith("/")) {
                    basePath = basePath.substring(1);
                }
                int pos = basePath.indexOf('/');
                if (pos > 0) {
                    subPath = basePath.substring(pos);
                }

                if (subPath != null && !"".equals(subPath))
                    co.vendorExtensions.put("x-operatorfabric-spring-subPath",subPath);
            }
        } catch (Exception exc){
            log.error("Unexpected Error arose", exc);
        }
    } 
    @Override
    public Map<String, Object> postProcessModels(Map<String, Object> objs) {
        Map<String, Object> result = super.postProcessModels(objs);
        List<Map<String, String>> imports = (List<Map<String, String>>) (List<?>) objs.get("imports");
        ListIterator<Map<String, String>> listIterator = imports.listIterator();

        while (listIterator.hasNext()) {
            Map<String, String> currentImport = listIterator.next();
            String importValue = currentImport.get("import");
            if (importValue.contains("io.swagger.annotations") || importValue.contains("springfox")) {
                listIterator.remove();
            }
        }
        return result;
    }
}
