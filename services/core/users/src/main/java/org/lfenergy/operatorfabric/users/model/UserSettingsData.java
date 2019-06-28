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
    private String dateTimeFormat;
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
        this.dateTimeFormat = settings.getDateFormat();
        if(settings.getDefaultTags()!=null)
            this.defaultTagsSet = new HashSet<>(settings.getDefaultTags());
        else
            this.defaultTagsSet = null;
        this.email = settings.getEmail();
    }

    public Set<String> getDefaultTagsSet() {
        if (this.defaultTagsSet == null)
            return Collections.emptySet();
        return defaultTagsSet;
    }

//    public void addDefaultTag(String tag){
//        if(this.defaultTagsSet == null)
//            this.defaultTagsSet = new HashSet<>();
//        this.defaultTagsSet.add(tag);
//    }
//
//    public void deleteDefaultTag(String tag){
//        if(this.defaultTagsSet!= null)
//            this.defaultTagsSet.remove(tag);
//    }

    @Override
    public List<String> getDefaultTags() {
        if (defaultTagsSet == null)
            return null;
        return new ArrayList<>(defaultTagsSet);
    }

    @Override
    public void setDefaultTags(List<String> defaultTags) {
        if (defaultTags != null)
            defaultTagsSet = new HashSet<>(defaultTags);
        else
            defaultTagsSet = null;
    }

    public UserSettingsData clearTags(){
        setDefaultTags(null);
        return this;
    }

    /**
     * Create a new patched settings using this as reference and overiding fields from other parameter when filed is not
     * null.
     * <br>
     * NB: resulting field defaultTags is the addition of collectins from both sides
     * NB2: login cannot be changed
     *
     * @param other
     * @return
     */
    public UserSettingsData patch(UserSettings other) {
        UserSettingsData result = new UserSettingsData();
        result.login = this.login;
        result.description = other.getDescription() != null ? other.getDescription() : this.getDescription();
        result.timeZone = other.getTimeZone() != null ? other.getTimeZone() : this.getTimeZone();
        result.locale = other.getLocale() != null ? other.getLocale() : this.getLocale();
        result.timeFormat = other.getTimeFormat() != null ? other.getTimeFormat() : this.getTimeFormat();
        result.dateFormat = other.getDateFormat() != null ? other.getDateFormat() : this.getDateFormat();
        result.dateTimeFormat = other.getDateTimeFormat() != null ? other.getDateTimeFormat() : this.getDateTimeFormat();
        result.email = other.getEmail() != null ? other.getEmail() : this.getEmail();
        if(other.getDefaultTags()!=null)
            result.defaultTagsSet = new HashSet<>(other.getDefaultTags());
        else if (this.getDefaultTags()!=null)
            result.defaultTagsSet = new HashSet<>(this.getDefaultTags());
        else
            result.defaultTagsSet = null;
        return result;
    }
}
