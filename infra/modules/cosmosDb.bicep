param baseName string
param location string
param tags object

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2023-09-15' = {
  name: 'cosmos-${baseName}'
  location: location
  tags: tags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    capabilities: [
      { name: 'EnableServerless' }
    ]
    enableFreeTier: false
  }
}

resource database 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-09-15' = {
  parent: cosmosAccount
  name: 'virtual-tour'
  properties: {
    resource: { id: 'virtual-tour' }
  }
}

// Collections
var containers = ['museums', 'tours', 'steps']
resource cosmosContainers 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-09-15' = [for name in containers: {
  parent: database
  name: name
  properties: {
    resource: {
      id: name
      partitionKey: {
        paths: ['/id']
        kind: 'Hash'
      }
      indexingPolicy: {
        indexingMode: 'consistent'
        automatic: true
      }
    }
  }
}]

output connectionString string = cosmosAccount.listConnectionStrings().connectionStrings[0].connectionString
output cosmosAccountName string = cosmosAccount.name
