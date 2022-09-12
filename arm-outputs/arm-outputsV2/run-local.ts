
import * as msRestAzure from 'ms-rest-azure';
import { ArmOutputs } from './arm-outputs';
import { ArmOutputParams } from './ArmOutputParams';
import { FailBehaviour } from './FailBehaviour';

const environmentName = "AzureCloud";
const subscriptionId = "f2da982c-fc6f-4663-ad1e-46a186f9fa84";
const tenantId = "7d25d723-384b-4d25-aaba-4e6c8b0762d5";
const resourceGroupName = "arm-outputs"
const prefix = ""
const outputNames = [ ]
const whenLastDeploymentIsFailed: FailBehaviour = FailBehaviour.fail
const deploymentNameFilter = "*"

msRestAzure.interactiveLogin({ domain: tenantId }, (err, creds) => {
    if (err) {
        console.error(err);
        return;
    }

    var params = <ArmOutputParams>{
        tokenCredentials: creds,
        environmentName: environmentName,
        subscriptionId: subscriptionId,
        resourceGroupName: resourceGroupName,
        prefix: prefix,
        outputNames: outputNames,
        whenLastDeploymentIsFailed: whenLastDeploymentIsFailed,
        deploymentNameFilter: deploymentNameFilter,
    };

    var armOutputs = new ArmOutputs(params);
    armOutputs
        .run()
        .then((results) => {
            results.forEach(result => {
                console.log(`${result.key}=${result.value}`);
            });
            console.info("Done")
        })
});