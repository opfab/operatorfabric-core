package org.lfenergy.operatorfabric.thirds.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThirdMenuEntryData implements ThirdMenuEntry {

    private String id;
    private String url;
    private String label;

}
