package org.lfenergy.operatorfabric.users.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

@Document(collection = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettingsData implements UserSettings {
    @Id
    private String login;
    private String description;
    private String timeZone;
    private String locale;
    private String timeFormat;
    private String dateFormat;
    private String email;
    @JsonIgnore
    @Singular("defaultTag")
    private Set<String> defaultTagsSet;

    public UserSettingsData(UserSettings settings) {
        this.login = settings.getLogin();
        this.description = settings.getDescription();
        this.timeZone = settings.getTimeZone();
        this.locale = settings.getLocale();
        this.timeFormat = settings.getTimeFormat();
        this.dateFormat = settings.getDateFormat();
        this.defaultTagsSet = new HashSet<>(settings.getDefaultTags());
        this.email = settings.getEmail();
    }

    public Set<String> getDefaultTagsSet() {
        if (this.defaultTagsSet == null)
            return Collections.emptySet();
        return defaultTagsSet;
    }

    public void addDefaultTag(String tag){
        if(this.defaultTagsSet == null)
            this.defaultTagsSet = new HashSet<>();
        this.defaultTagsSet.add(tag);
    }

    public void deleteDefaultTag(String tag){
        if(this.defaultTagsSet!= null)
            this.defaultTagsSet.remove(tag);
    }

    @Override
    public List<String> getDefaultTags() {
        if (defaultTagsSet == null)
            return Collections.emptyList();
        return new ArrayList<>(defaultTagsSet);
    }

    @Override
    public void setDefaultTags(List<String> defaultTags) {
        defaultTagsSet = new HashSet<>(defaultTags);
    }

    public UserSettingsData patch(UserSettings settings) {
        UserSettingsData result = new UserSettingsData();
        result.login = settings.getLogin() != null ? settings.getLogin() : this.getLogin();
        result.description = settings.getDescription() != null ? settings.getDescription() : this.getDescription();
        result.timeZone = settings.getTimeZone() != null ? settings.getTimeZone() : this.getTimeZone();
        result.locale = settings.getLocale() != null ? settings.getLocale() : this.getLocale();
        result.timeFormat = settings.getTimeFormat() != null ? settings.getTimeFormat() : this.getTimeFormat();
        result.dateFormat = settings.getDateFormat() != null ? settings.getDateFormat() : this.getDateFormat();
        if (settings.getDefaultTags() != null)
            result.defaultTagsSet = new HashSet<>(settings.getDefaultTags());
        else if (this.defaultTagsSet != null)
            result.defaultTagsSet = new HashSet<>(this.getDefaultTags());
        return result;
    }
}
