**Prerequisites** 
--------

Before running or creating tests you need first to install cypress by following the guidelines described on cypress website https://docs.cypress.io/guides/getting-started/installing-cypress.html#System-requirements

**Cypress test files:**
--------

cypress\integration\

By default, all test files are located in cypress\integration but it is possible to put it on another directory

cypress\support

commands.js file is used  to create custom commands and overwrite existing commands. Make sure to put the command.js file in the correct folder (cypress\support)


**Creating new tests:**
--------

1. Create a new file in cypress/integration/example.spec.js 

2. Start writing tests, cypress is well documented https://docs.cypress.io/api/api/table-of-contents.html


**Running existing tests:**
--------

To use cypress you have to run the following commands in shell:
1. First Go to the folder where cypress has been installed example: cd D:\Users\myuser\Desktop\cypressAutomation\

2. Then to excute this command /node_modules/.bin/cypress open

3. A new cypress windows is opened as follows

4. Select the test to run 
