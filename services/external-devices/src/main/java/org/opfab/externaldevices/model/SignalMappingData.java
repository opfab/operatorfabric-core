package org.opfab.externaldevices.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "signalMapping")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class SignalMappingData implements SignalMapping {

    private String id;
    private Map<String, Integer> supportedSignals;

}
