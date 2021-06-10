/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import io.swagger.models.properties.ArrayProperty;
import io.swagger.models.properties.MapProperty;
import io.swagger.models.properties.Property;
import io.swagger.models.properties.RefProperty;
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
        try{
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

                if(subPath!=null && !"".equals(subPath))
                    co.vendorExtensions.put("x-operatorfabric-spring-subPath",subPath);
            }
        }catch (Throwable t){
            log.error("Unexpected Error arose", t);
        }
    } 
    @Override
    public Map<String, Object> postProcessModels(Map<String, Object> objs) {
        Map<String, Object> result = super.postProcessModels(objs);
        List<Map<String, String>> imports = (List)objs.get("imports");
        ListIterator listIterator = imports.listIterator();

        while(listIterator.hasNext()) {
            String _import = (String)((Map)listIterator.next()).get("import");
            if(_import.contains("io.swagger.annotations") ||_import.contains("springfox"))
                listIterator.remove();
        }
        return result;
    }
}
