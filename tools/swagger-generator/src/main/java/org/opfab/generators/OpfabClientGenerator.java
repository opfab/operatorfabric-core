/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.generators;

import org.openapitools.codegen.languages.JavaClientCodegen;
import org.openapitools.codegen.model.ModelsMap;

import java.util.List;
import java.util.ListIterator;
import java.util.Map;

/**
 * <p>specific client OperatorFabric generator derived from {@link JavaClientCodegen}</p>
 * <p>Remove non standard java references from generated files</p>
 */
public class OpfabClientGenerator extends JavaClientCodegen {

    @Override
    public ModelsMap postProcessModels(ModelsMap objs) {
        ModelsMap result = super.postProcessModels(objs);
        List<Map<String, String>> imports = (List<Map<String, String>>) objs.get("imports");
        if (imports != null) {
            ListIterator<Map<String, String>> listIterator = imports.listIterator();

            while (listIterator.hasNext()) {
                String currentImport = listIterator.next().get("import");
                if (currentImport != null && (currentImport.contains("com.fasterxml.jackson.annotation") || currentImport.contains("io.swagger.annotation")))
                    listIterator.remove();
            }
        }
        return result;
    }
}
