
package org.lfenergy.operatorfabric.springtools.configuration.oauth;

import org.springframework.cloud.bus.event.RemoteApplicationEvent;

/**
 * <p>Custom event fired by users-business-service when a user is updated.</p>
 * See issue #64
 *
 * @author Alexandra Guironnet
 */
public class UpdatedUserEvent extends RemoteApplicationEvent {

    /**
     * Updated user login
     * */
    private String login;

    protected UpdatedUserEvent() {
    }

    public UpdatedUserEvent(Object source, String originService, String name) {
        super(source, originService);
        this.login = name;
    }

    public String getLogin() {
        return this.login;
    }

    public void setLogin(String name) {
        this.login = name;
    }


}

