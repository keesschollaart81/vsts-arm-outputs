import * as tl from 'azure-pipelines-task-lib/task';
import * as msrestAzure from 'ms-rest-azure';
import { ArmOutputs } from './arm-outputs';
import { ArmOutputParams } from './ArmOutputParams';
import { FailBehaviour } from './FailBehaviour';
import { _checkPath } from 'azure-pipelines-task-lib/internal';
import appInsights from "./logger"
import { ServiceClientCredentials } from 'ms-rest';

export class AzureDevOpsArmOutputsTaskHost {

    public run = async (): Promise<void> => {
        let start = Date.now();
        let success = true;

        try {
            console.info("kees:3");
            const debugModeString: string = tl.getVariable('System.Debug');
            const debugMode: boolean = debugModeString ? debugModeString.toLowerCase() != 'false' : false;
            if (debugMode) {
                tl.warning("You are running in debug mode (variable System.Debug is set to true), the values of your ARM Outputs will be printed to the log. If your deployment outputs any secret values, they will be shown, be careful (especially with public projects)!");
            }

            console.info("kees:4");
            let connectedServiceNameARM: string = tl.getInput("ConnectedServiceNameARM");
            var endpointAuth = tl.getEndpointAuthorization(connectedServiceNameARM, true);
            var authScheme = tl.getEndpointAuthorizationScheme(connectedServiceNameARM, true);
            console.info("kees:5");
            var environmentName = tl.getEndpointDataParameter(connectedServiceNameARM, "environment", true);
            var credentials = this.getCredentials(endpointAuth, authScheme, environmentName);
            var subscriptionId = tl.getEndpointDataParameter(connectedServiceNameARM, "SubscriptionId", true);

            console.info("kees:6");
            var resourceGroupName = tl.getInput("resourceGroupName", true);
            var prefix = tl.getInput("prefix", false);
            var outputNames = tl.getDelimitedInput("outputNames", ",", false);
            var whenLastDeploymentIsFailedString = tl.getInput("whenLastDeploymentIsFailed", true);
            var whenLastDeploymentIsFailed = FailBehaviour[whenLastDeploymentIsFailedString];
            var deploymentNameFilter = tl.getInput("deploymentNameFilter", false);

            console.info("kees:7");
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
            console.info("kees:8");
            var outputs = await armOutputs.run();

            console.info("kees:9");
            if (outputs && outputs.length == 0) {
                tl.warning(`No output parameters could be found for the deployment`);
            } else {
                outputs.forEach(output => {
                    console.info(`Updating Azure Pipelines variable '${output.key}'`);
                    tl.setVariable(output.key, output.value, false);
                });
            }
        }
        catch (err) {
            console.error("Unhandled exception during ARM Outputs Task", err);
            try {
                if (!tl.getVariable("arm-outputs-notelemetry")) {
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
                if (!tl.getVariable("arm-outputs-notelemetry")) {
                    appInsights.trackRequest({ duration: duration, name: "ARM Outputs", url: "/", resultCode: success ? 200 : 500, success: success })
                    appInsights.flush();
                }
            }
            catch{ }// dont let AI cause exceptions
        }
    }

    private getCredentials = (endpointAuthorization: tl.EndpointAuthorization, authScheme: string, environmentName: string): ServiceClientCredentials => {
        if (authScheme == "ManagedServiceIdentity") {
            console.log("Logging in using MSIVmTokenCredentials");
            return new msrestAzure.MSIVmTokenCredentials();
        }

        console.log(`Logging in using ApplicationTokenCredentials, authScheme is '${authScheme}'`);

        var servicePrincipalId: string = endpointAuthorization.parameters["serviceprincipalid"];
        var servicePrincipalKey: string = endpointAuthorization.parameters["serviceprincipalkey"];
        var tenantId: string = endpointAuthorization.parameters["tenantid"];
        var azureEnvironment: msrestAzure.AzureEnvironment = this.getEnvironment(environmentName);
        const tokenCredentialsOptions: msrestAzure.AzureTokenCredentialsOptions = {
            environment: azureEnvironment
        };

        var credentials = new msrestAzure.ApplicationTokenCredentials(servicePrincipalId, tenantId, servicePrincipalKey, tokenCredentialsOptions);

        return credentials;
    }

    private getEnvironment = (environmentName: string): msrestAzure.AzureEnvironment => {
        if (!environmentName) return msrestAzure.AzureEnvironment.Azure;

        const azureEnvironmentMaps = {
            azurechinacloud: msrestAzure.AzureEnvironment.AzureChina,
            azurecloud: msrestAzure.AzureEnvironment.Azure,
            azuregermancloud: msrestAzure.AzureEnvironment.AzureGermanCloud,
            azureusgovernment: msrestAzure.AzureEnvironment.AzureUSGovernment,
        };

        return azureEnvironmentMaps[environmentName.toLowerCase()];
    }
}
var azureDevOpsArmOutputsTaskHost = new AzureDevOpsArmOutputsTaskHost();

azureDevOpsArmOutputsTaskHost.run().then((result) => {
    console.info("kees:1");
    tl.setResult(tl.TaskResult.Succeeded, "")
}
).catch((error) => {
    console.error("kees:2", error)
    tl.setResult(tl.TaskResult.Failed, error)
}
);