package org.opfab.externaldevices.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "userConfigurations")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserConfigurationData implements UserConfiguration {

    @Id
    private String userLogin;
    private List<String> externalDeviceIds;

    public UserConfigurationData(UserConfiguration userConfiguration){
        this();
        this.userLogin = userConfiguration.getUserLogin();
        this.externalDeviceIds = userConfiguration.getExternalDeviceIds();
    }

}
