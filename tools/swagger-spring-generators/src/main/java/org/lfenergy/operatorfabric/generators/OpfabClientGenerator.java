/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.generators;

import io.swagger.codegen.languages.SpringCodegen;

import java.util.List;
import java.util.ListIterator;
import java.util.Map;

public class OpfabClientGenerator extends SpringCodegen {

    @Override
    public Map<String, Object> postProcessModels(Map<String, Object> objs) {
        Map<String, Object> result = super.postProcessModels(objs);
        List<Map<String, String>> imports = (List)objs.get("imports");
        ListIterator listIterator = imports.listIterator();

        while(listIterator.hasNext()) {
            String _import = (String)((Map)listIterator.next()).get("import");
            if(_import.contains("Json"))
                listIterator.remove();
        }
        return result;
    }
}
