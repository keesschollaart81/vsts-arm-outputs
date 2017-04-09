# vsts-arm-outputs - a VSTS Extension

Using this extenion in your VSTS environment enables you to use the values coming out of the ARM Deployment outputs.

This step will use the last successful deployment within the selected resource group. If this deployent has outputs, all of them are copied to VSTS variables by the ARM Output key.

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {},
  "variables":{},
  "resources":{},
  "outputs": {
    "dbserver-fqdn": {
      "type": "string",
      "value": "[reference(concat('Microsoft.Sql/servers/',variables('dbserver-name'))).fullyQualifiedDomainName]"
    },
    "sample-variable": {
      "type": "string",
      "value": "[variables('sample-variable')]"
    }
  }
}
```

This outputs can then be used by default VSTS ways: ```$(sample-variable)```

Usually this task is ran directly after the 'Azure Resource Group Deployment' task.

//todo: screenshot of VSTS