/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.generators;

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
import java.util.Map;

/**
 * <p>specific client OperatorFabric generator derived from {@link SpringCodegen}</p>
 * <ul>
 *     <li>Adds x-operatorfabric-spring-subPath vendor extension, it contains subpath
 *     to allow affecting a base path to class main mapping and subpath to method mapping</li>
 *     <li>Changes generic parameter from X to ? extends X which allows to define interfaces only in generated code</li>
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
            t.printStackTrace();
        }
    }

    @Override
    public String toInstantiationType(Property p) {
        if (p instanceof MapProperty) {
            MapProperty ap = (MapProperty) p;
            Property additionalProperties2 = ap.getAdditionalProperties();
            String type = additionalProperties2.getType();
            if (null == type) {
                log.error("No Type defined for Additional Property %s\n" //
                   + "\tIn Property: %s", additionalProperties2,p);
            }
            String inner = getSwaggerType(additionalProperties2);
            return instantiationTypes.get("map") + "<String, ? extends " + inner + ">";
        } else if (p instanceof ArrayProperty) {
            ArrayProperty ap = (ArrayProperty) p;
            String inner = getSwaggerType(ap.getItems());
            return instantiationTypes.get("array") + "<? extends " + inner + ">";
        } else {
            return null;
        }
    }

  @Override
  public String getTypeDeclaration(Property p) {
    if (p instanceof ArrayProperty) {
      ArrayProperty ap = (ArrayProperty) p;
      Property inner = ap.getItems();
      if (inner == null) {
        log.warn(ap.getName() + "(array property) does not have a proper inner type defined");
        return null;
      }
      log.info("inner property type "+inner.getClass().getName()+" "+getTypeDeclaration(inner));
      if(inner instanceof RefProperty)
        return getSwaggerType(p) + "< ? extends " + getTypeDeclaration(inner) + ">";
      else
        return getSwaggerType(p) + "<" + getTypeDeclaration(inner) + ">";
    } else if (p instanceof MapProperty) {
      MapProperty mp = (MapProperty) p;
      Property inner = mp.getAdditionalProperties();
      if (inner == null) {
        log.warn(mp.getName() + "(map property) does not have a proper inner type defined");
        return null;
      }
      if(inner instanceof RefProperty)
        return getSwaggerType(p) + "<String, ? extends " + getTypeDeclaration(inner) + ">";
      else
        return getSwaggerType(p) + "<String, " + getTypeDeclaration(inner) + ">";
    }
    return super.getTypeDeclaration(p);
  }
}
