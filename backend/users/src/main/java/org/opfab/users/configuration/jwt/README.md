Spring uses a JwtAuthenticationToken to store information about the authenticated user, including their roles and permissions.

This object is built based on the user's JWT token.

However, the JWT token sent by the client may not contain all the necessary user information, or the information may need to be sourced differently depending on the Opfab instance configuration.

To address this, we implement a custom JwtAuthenticationToken, named OpfabJwtAuthenticationToken, which can store and manage all required user information. This class contains an instance of the User class representing the current user.

We also provide a converter, OpfabJwtTokenConverter, to create the OpfabJwtAuthenticationToken using both the JWT token and user information stored in the users MongoDB collection. Depending on the configuration, fields such as lastname, firstname, email, entities, and groups can be retrieved from the user collection instead of the JWT token.

To instruct Spring to use our custom AuthenticationTokenConverter, we provide a configuration class named JwtTokenConfiguration, which registers the custom converter. 
