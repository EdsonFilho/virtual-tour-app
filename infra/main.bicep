@description('Base name for all resources')
param baseName string = 'virtualtour'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Environment tag (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

var tags = {
  project: 'virtual-tour-app'
  environment: environment
}

// ── Modules ──────────────────────────────────────────────────────────────────

module storage 'modules/blobStorage.bicep' = {
  name: 'storage'
  params: {
    baseName: baseName
    location: location
    tags: tags
  }
}

module cosmos 'modules/cosmosDb.bicep' = {
  name: 'cosmos'
  params: {
    baseName: baseName
    location: location
    tags: tags
  }
}

module speech 'modules/cognitiveServices.bicep' = {
  name: 'speech'
  params: {
    baseName: baseName
    location: location
    tags: tags
  }
}

module functions 'modules/functionApp.bicep' = {
  name: 'functions'
  params: {
    baseName: baseName
    location: location
    tags: tags
    storageAccountName: storage.outputs.storageAccountName
    cosmosConnectionString: cosmos.outputs.connectionString
    speechKey: speech.outputs.speechKey
    speechRegion: location
    cdnBaseUrl: 'https://${storage.outputs.blobEndpointHostname}'
  }
}

module staticWebApp 'modules/staticWebApp.bicep' = {
  name: 'staticWebApp'
  params: {
    baseName: baseName
    location: location
    tags: tags
  }
}

// ── Outputs ──────────────────────────────────────────────────────────────────

output staticWebAppUrl string = staticWebApp.outputs.defaultHostname
output functionAppUrl string = functions.outputs.functionAppUrl
output mediaBaseUrl string = 'https://${storage.outputs.blobEndpointHostname}'
