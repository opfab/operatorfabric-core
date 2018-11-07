package org.lfenergy.operatorfabric.cards.publication.services;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;

/**
 * Recipient computation result data
 */
@Data
@AllArgsConstructor
public class ComputedRecipient {
    private String main;
    private Set<String> groups;
    private Set<String> users;
    private Set<String> orphanUsers;

    public static ComputedRecipientBuilder builder() {
        return new ComputedRecipientBuilder();
    }


    public static class ComputedRecipientBuilder {
        private String main;
        private ArrayList<String> groups;
        private ArrayList<String> users;
        private ArrayList<String> orphanUsers;

        ComputedRecipientBuilder() {
        }

        public ComputedRecipientBuilder main(String main) {
            this.main = main;
            return this;
        }

        public ComputedRecipientBuilder group(String group) {
            if (this.groups == null) this.groups = new ArrayList<String>();
            this.groups.add(group);
            return this;
        }

        public ComputedRecipientBuilder groups(Collection<? extends String> groups) {
            if (this.groups == null) this.groups = new ArrayList<String>();
            this.groups.addAll(groups);
            return this;
        }

        public ComputedRecipientBuilder clearGroups() {
            if (this.groups != null)
                this.groups.clear();

            return this;
        }

        public ComputedRecipientBuilder user(String user) {
            if (this.users == null) this.users = new ArrayList<String>();
            this.users.add(user);
            return this;
        }

        public ComputedRecipientBuilder users(Collection<? extends String> users) {
            if (this.users == null) this.users = new ArrayList<String>();
            this.users.addAll(users);
            return this;
        }

        public ComputedRecipientBuilder clearUsers() {
            if (this.users != null)
                this.users.clear();

            return this;
        }

        public ComputedRecipientBuilder orphanUser(String orphanUser) {
            if (this.orphanUsers == null) this.orphanUsers = new ArrayList<String>();
            this.orphanUsers.add(orphanUser);
            return this;
        }

        public ComputedRecipientBuilder orphanUsers(Collection<? extends String> orphanUsers) {
            if (this.orphanUsers == null) this.orphanUsers = new ArrayList<String>();
            this.orphanUsers.addAll(orphanUsers);
            return this;
        }

        public ComputedRecipientBuilder clearOrphanUsers() {
            if (this.orphanUsers != null)
                this.orphanUsers.clear();

            return this;
        }

        public ComputedRecipient build() {
            Set<String> groups;
            switch (this.groups == null ? 0 : this.groups.size()) {
                case 0:
                    groups = java.util.Collections.emptySet();
                    break;
                case 1:
                    groups = java.util.Collections.singleton(this.groups.get(0));
                    break;
                default:
                    groups = new java.util.LinkedHashSet<String>(this.groups.size() < 1073741824 ? 1 + this.groups.size() + (this.groups.size() - 3) / 3 : Integer.MAX_VALUE);
                    groups.addAll(this.groups);
                    groups = java.util.Collections.unmodifiableSet(groups);
            }
            Set<String> users;
            switch (this.users == null ? 0 : this.users.size()) {
                case 0:
                    users = java.util.Collections.emptySet();
                    break;
                case 1:
                    users = java.util.Collections.singleton(this.users.get(0));
                    break;
                default:
                    users = new java.util.LinkedHashSet<String>(this.users.size() < 1073741824 ? 1 + this.users.size() + (this.users.size() - 3) / 3 : Integer.MAX_VALUE);
                    users.addAll(this.users);
                    users = java.util.Collections.unmodifiableSet(users);
            }
            Set<String> orphanUsers;
            switch (this.orphanUsers == null ? 0 : this.orphanUsers.size()) {
                case 0:
                    orphanUsers = java.util.Collections.emptySet();
                    break;
                case 1:
                    orphanUsers = java.util.Collections.singleton(this.orphanUsers.get(0));
                    break;
                default:
                    orphanUsers = new java.util.LinkedHashSet<String>(this.orphanUsers.size() < 1073741824 ? 1 + this.orphanUsers.size() + (this.orphanUsers.size() - 3) / 3 : Integer.MAX_VALUE);
                    orphanUsers.addAll(this.orphanUsers);
                    orphanUsers = java.util.Collections.unmodifiableSet(orphanUsers);
            }

            return new ComputedRecipient(main, groups, users, orphanUsers);
        }

        public String toString() {
            return "ComputedRecipient.ComputedRecipientBuilder(main=" + this.main + ", groups=" + this.groups + ", users=" + this.users + ", orphanUsers=" + this.orphanUsers + ")";
        }
    }
}
