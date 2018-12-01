/*
 * Create and export configuration variables
 *
 */

// Dependencies


// Container for all environments
var environments = {};


// Staging (default) environment
environments.staging = {
    'httpPort'  : 3000,
    'envName'   : 'staging',
    'ip'        : 'localhost',
    'databaseURL' : 'testdb'
}
  
// Production environment
environments.production = {
    'httpPort'  : 5000,
    'envName'   : 'production',
    'ip'        : 'localhost',
    'databaseURL' : 'testdb' // "username:password@example.com/mydb"\\
}

var environmentToExport = environments.staging;

// Export the module
module.exports = environmentToExport;
  