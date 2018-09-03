# ARM Outputs

[Click here to view this extension in the VSTS Marketplace](https://marketplace.visualstudio.com/items?itemName=keesschollaart.arm-outputs)

This extension enables you to use the ARM Deployment outputs in your VSTS environment.

This step will use the last successful deployment within the selected resource group. If this deployent has outputs, all of them are copied to VSTS variables by the ARM Output key.

This outputs can then be used by default VSTS ways: ```$(same-key-as-in-arm-template)```

Usually this task is ran directly after the 'Azure Resource Group Deployment' task.

[![screenshot-1](images/screenshots-vsts-arm-outputs-1.png "Screenshot-1")](images/screenshots-vsts-arm-outputs-1.png)

## How to use

Checkout the docs in the [Marketplace page](Marketplace.md)

## Help & Contact

Find me at http://case.schollaart.net/. Experiencing problems, or do you have an idea? Please let me know via [Twitter](https://twitter.com/keesschollaart) or by [mail](mailto:keesschollaart81@hotmail.com). Or even better, raise an issue on [GitHub](https://github.com/keesschollaart81/vsts-arm-outputs/issues).