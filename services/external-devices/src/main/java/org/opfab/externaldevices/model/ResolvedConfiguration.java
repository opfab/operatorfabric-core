package org.opfab.externaldevices.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@AllArgsConstructor
@Getter
@Data
public class ResolvedConfiguration {

    DeviceConfiguration deviceConfiguration;
    int signalId;

}
