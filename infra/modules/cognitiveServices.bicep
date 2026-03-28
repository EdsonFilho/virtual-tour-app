param baseName string
param location string
param tags object

resource speechService 'Microsoft.CognitiveServices/accounts@2023-05-01' = {
  name: 'speech-${baseName}'
  location: location
  tags: tags
  kind: 'SpeechServices'
  sku: {
    name: 'S0'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
    customSubDomainName: 'speech-${baseName}'
  }
}

output speechKey string = speechService.listKeys().key1
output speechEndpoint string = speechService.properties.endpoint
