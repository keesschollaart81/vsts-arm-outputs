import * as tl from 'azure-pipelines-task-lib/task';
import * as msrestAzure from 'ms-rest-azure';
import { ArmOutputs } from './arm-outputs';
import { ArmOutputParams } from './ArmOutputParams';
import { FailBehaviour } from './FailBehaviour';
import { _checkPath } from 'azure-pipelines-task-lib/internal';
import appInsights from "./logger"

export class AzureDevOpsArmOutputsTaskHost {

    public run = async (): Promise<void> => {
        let start = Date.now();
        let success = true;

        try {
            let connectedServiceNameARM: string = tl.getInput("ConnectedServiceNameARM");
            var endpointAuth = tl.getEndpointAuthorization(connectedServiceNameARM, true);
            var credentials = this.getCredentials(endpointAuth);
            var subscriptionId = tl.getEndpointDataParameter(connectedServiceNameARM, "SubscriptionId", true);

            var resourceGroupName = tl.getInput("resourceGroupName", true);
            var prefix = tl.getInput("prefix", false);
            var outputNames = tl.getDelimitedInput("outputNames", ",", false);
            var whenLastDeploymentIsFailedString = tl.getInput("whenLastDeploymentIsFailed", true);
            var whenLastDeploymentIsFailed = FailBehaviour[whenLastDeploymentIsFailedString];
            var deploymentNameFilter = tl.getInput("deploymentNameFilter", false);

            if (!prefix || prefix == "null") prefix = "";

            var params = <ArmOutputParams>{
                tokenCredentials: credentials,
                subscriptionId: subscriptionId,
                resourceGroupName: resourceGroupName,
                prefix: prefix,
                outputNames: outputNames,
                whenLastDeploymentIsFailed: whenLastDeploymentIsFailed,
                deploymentNameFilter: deploymentNameFilter,
            };

            var armOutputs = new ArmOutputs(params);
            var outputs = await armOutputs.run();
            outputs.forEach(output => {
                console.info(`Updating Azure Pipeline variable '${output.key}' to value '${output.value}'`)
                tl.setVariable(output.key, output.value, false);
            });
        }
        catch (err) {
            console.error("Unhandled exception during ARM Outputs Task", err);
            try {
                if (tl.getVariable("arm-outputs-notelemetry")) {
                    appInsights.trackException({ exception: err });
                }
                success = false;
            }
            catch{ } // dont let AI cause exceptions
            throw err;
        }
        finally {
            try {
                let duration = Date.now() - start;
                if (tl.getVariable("arm-outputs-notelemetry")) {
                    appInsights.trackRequest({ duration: duration, name: "ARM Outputs", url: "/", resultCode: success ? 200 : 500, success: success })
                    appInsights.flush();
                }
            }
            catch{ }// dont let AI cause exceptions
        }
    }

    private getCredentials = (endpointAuthorization: tl.EndpointAuthorization): msrestAzure.ApplicationTokenCredentials => {
        var servicePrincipalId: string = endpointAuthorization.parameters["serviceprincipalid"];
        var servicePrincipalKey: string = endpointAuthorization.parameters["serviceprincipalkey"];
        var tenantId: string = endpointAuthorization.parameters["tenantid"];
        var credentials = new msrestAzure.ApplicationTokenCredentials(servicePrincipalId, tenantId, servicePrincipalKey);

        return credentials;
    }
}
var azureDevOpsArmOutputsTaskHost = new AzureDevOpsArmOutputsTaskHost();

azureDevOpsArmOutputsTaskHost.run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, "")
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
);