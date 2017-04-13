# ARM Outputs

This extension enables you to use the ARM Deployment outputs in your VSTS environment.

This step will use the last successful deployment within the selected resource group. If this deployent has outputs, all of them are copied to VSTS variables by the ARM Output key.

This outputs can then be used by default VSTS ways: ```$(same-key-as-in-arm-template)```

Usually this task is ran directly after the 'Azure Resource Group Deployment' task.

[![screenshot-1](images/screenshots-vsts-arm-outputs-1.png "Screenshot-1")](images/screenshots-vsts-arm-outputs-1.png)