This directory contains all the configuration files needed to start Opfab.

# Directory Structure

## services

Contains all the YAML configuration files for the nodes and Java services.  
Files with the `-java.yml` suffix are only used when Opfab is started in Java mode.

'common.yml' is a common configuration file used by all nodes and services.

## web-ui

Contains Nginx configuration files:
- `nginx-dev.conf.template`: Used for development and Java mode. This template is processed by the startup script to set the Docker host IP, allowing services outside Docker (such as in Java mode) to be accessed. It includes permissive CORS settings.
- `nginx-prod.conf`: Used for production mode.
The startup script will copy the appropriate file to `nginx.conf`.

### ui-config

This directory contains configuration files for the UI:
- `ui-menu.json`: The menu configuration file.
- `web-ui-base.json`: The base configuration file for the web UI. This file will be copied to `web-ui.json` by the startup script.  
  We keep a separate `web-ui-base.json` because `web-ui.json` may be modified by Cypress tests.

### keycloak

Contains configuration files for Keycloak, including all required users.

### certificates

This is an example directory demonstrating how to use custom certificates (for example, for Keycloak) that are not from a certification authority trusted by the JVM for accessing the authentication service.  
See the documentation: https://opfab.github.io/documentation/current/deployment/#custom_certificates
