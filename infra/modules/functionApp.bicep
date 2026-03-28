param baseName string
param location string
param tags object
param storageAccountName string
param cosmosConnectionString string
param speechKey string
param speechRegion string
param cdnBaseUrl string

resource appServicePlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: 'asp-${baseName}'
  location: location
  tags: tags
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {
    reserved: false
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' existing = {
  name: storageAccountName
}

resource functionApp 'Microsoft.Web/sites@2022-09-01' = {
  name: 'func-${baseName}'
  location: location
  tags: tags
  kind: 'functionapp'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}'
        }
        { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' }
        { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'node' }
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '~24' }
        { name: 'COSMOS_CONNECTION_STRING', value: cosmosConnectionString }
        { name: 'COSMOS_DATABASE_NAME', value: 'virtual-tour' }
        { name: 'BLOB_CONNECTION_STRING', value: 'DefaultEndpointsProtocol=https;AccountName=${storageAccount.name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storageAccount.listKeys().keys[0].value}' }
        { name: 'BLOB_CONTAINER_NAME', value: 'media' }
        { name: 'CDN_BASE_URL', value: cdnBaseUrl }
        { name: 'SPEECH_KEY', value: speechKey }
        { name: 'SPEECH_REGION', value: speechRegion }
      ]
      cors: {
        allowedOrigins: [
          'https://${staticWebAppHostname}'
          'http://localhost:5173'
        ]
      }
    }
  }
}

output functionAppUrl string = 'https://${functionApp.properties.defaultHostName}'
output functionAppName string = functionApp.name
