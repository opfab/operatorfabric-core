package org.opfab.controllers;

import java.security.Principal;
import org.springframework.security.core.userdetails.User;

import org.springframework.security.core.Authentication;
import org.opfab.common.users.CurrentUserWithPerimeters;

public class OpfabController {
    /**
     * Extracts a CurrentUserWithPerimeters instance from the given Principal.
     * 
     * - If the principal represents a user authenticated via OAuth2 JWT (i.e., the
     * principal is a CurrentUserWithPerimeters),
     * it is returned directly.
     *
     * - If the principal represents an internal service account authenticated with
     * basic authentication (i.e., the principal is a
     * org.springframework.security.core.userdetails.User), a new
     * CurrentUserWithPerimeters instance is created and marked as internal.
     */
    protected CurrentUserWithPerimeters getCurrentUserWithPerimeter(Principal principal) {

        Object user = ((Authentication) principal).getPrincipal();
        if (user instanceof CurrentUserWithPerimeters) {
            return (CurrentUserWithPerimeters) principal;
        } else if (user instanceof org.springframework.security.core.userdetails.User) {
            CurrentUserWithPerimeters currentUser = new CurrentUserWithPerimeters();
            org.opfab.common.users.User userData = new org.opfab.common.users.User();
            userData.setLogin(((User) user).getUsername());
            currentUser.setUserData(userData);
            currentUser.setIsInternalServiceAccount(true);
            return currentUser;
        } else {
            throw new IllegalArgumentException("Unsupported principal type: " + user.getClass().getName());
        }
    }
}
