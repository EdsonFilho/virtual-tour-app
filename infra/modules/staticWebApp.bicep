param baseName string
param location string
param tags object

resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: 'swa-${baseName}'
  location: location
  tags: tags
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

output defaultHostname string = staticWebApp.properties.defaultHostname
output staticWebAppName string = staticWebApp.name
