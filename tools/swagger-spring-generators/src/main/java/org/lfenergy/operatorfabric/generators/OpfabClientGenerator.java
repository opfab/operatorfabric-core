
package org.lfenergy.operatorfabric.generators;

import io.swagger.codegen.languages.SpringCodegen;

import java.util.List;
import java.util.ListIterator;
import java.util.Map;

/**
 * <p>specific client OperatorFabric generator derived from {@link SpringCodegen}</p>
 * <p>Remove non standard java references from generated files</p>
 */
public class OpfabClientGenerator extends SpringCodegen {

    @Override
    public Map<String, Object> postProcessModels(Map<String, Object> objs) {
        Map<String, Object> result = super.postProcessModels(objs);
        List<Map<String, String>> imports = (List)objs.get("imports");
        ListIterator listIterator = imports.listIterator();

        while(listIterator.hasNext()) {
            String _import = (String)((Map)listIterator.next()).get("import");
            if(_import.contains("Json") || _import.contains("ApiModel"))
                listIterator.remove();
        }
        return result;
    }
}
