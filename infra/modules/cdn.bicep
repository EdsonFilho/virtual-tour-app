param baseName string
param location string
param tags object
param storageAccountHostname string

resource cdnProfile 'Microsoft.Cdn/profiles@2023-05-01' = {
  name: 'afd-${baseName}'
  location: 'global'
  tags: tags
  sku: {
    name: 'Standard_AzureFrontDoor'
  }
}

resource originGroup 'Microsoft.Cdn/profiles/originGroups@2023-05-01' = {
  parent: cdnProfile
  name: 'blob-origin-group'
  properties: {
    loadBalancingSettings: {
      sampleSize: 4
      successfulSamplesRequired: 3
      additionalLatencyInMilliseconds: 50
    }
    healthProbeSettings: {
      probePath: '/'
      probeRequestType: 'HEAD'
      probeProtocol: 'Https'
      probeIntervalInSeconds: 100
    }
  }
}

resource origin 'Microsoft.Cdn/profiles/originGroups/origins@2023-05-01' = {
  parent: originGroup
  name: 'blob-origin'
  properties: {
    hostName: storageAccountHostname
    httpPort: 80
    httpsPort: 443
    originHostHeader: storageAccountHostname
    priority: 1
    weight: 1000
    enforceCertificateNameCheck: true
  }
}

resource afdEndpoint 'Microsoft.Cdn/profiles/afdEndpoints@2023-05-01' = {
  parent: cdnProfile
  name: 'media-${take(baseName, 12)}'
  location: 'global'
  tags: tags
  properties: {
    enabledState: 'Enabled'
  }
}

resource route 'Microsoft.Cdn/profiles/afdEndpoints/routes@2023-05-01' = {
  parent: afdEndpoint
  name: 'blob-route'
  properties: {
    originGroup: {
      id: originGroup.id
    }
    supportedProtocols: ['Https']
    patternsToMatch: ['/*']
    forwardingProtocol: 'HttpsOnly'
    linkToDefaultDomain: 'Enabled'
    httpsRedirect: 'Enabled'
    cacheConfiguration: {
      queryStringCachingBehavior: 'IgnoreQueryString'
      compressionSettings: {
        isCompressionEnabled: true
        contentTypesToCompress: ['image/jpeg', 'image/png', 'image/webp']
      }
    }
  }
  dependsOn: [origin]
}

output cdnEndpointUrl string = 'https://${afdEndpoint.properties.hostName}'
