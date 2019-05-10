# Dev Key Cloak configuration

Go to [host]:89/auth/admin

## Add Realm

* Click top Lleft down arrow next to Master
* Add Realm
* Name it dev (or whatever)

## Setup at least one client (or best one per service)

### Create client
 * Click Clients in left menu
 * Click Create Button
 * Set client ID to "opfab-client" (or whatever)
 * Select Openid-Connect Protocol
 * Enable Authorization
 * Access Type to Confidential
 * save
 
### Add a Role to Client

* In client view, click Roles tab
* Click Add button
* create a USER role (or whatever)
* save
### create a Mapper

Used to map the user name to a field that suits services

* name it sub
* set mapper type to User Property
* set Property to username
* set Token claim name to sub
* enable add to access token
* save

## create Users

 * Click Users in left menu
 * Click Add User button
 * Set username to admin 
 * Save
 * Select Role Mappings tab
 * Select "opfab-client" in client roles combo (or whatever id you formerly chose)
 * Select USER  as assigned role (or whatever role you formerly created)
 * Select Credentials tab
 * set password and confirmation to "test"
 * 
 
repeat process for other users:
rte-operator, tso1-operator, tso2-operator