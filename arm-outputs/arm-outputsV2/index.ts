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
            const debugModeString: string = tl.getVariable('System.Debug');
            const debugMode: boolean = debugModeString ? debugModeString.toLowerCase() != 'false' : false;
            if (debugMode) {
                tl.warning("You are running in debug mode (variable System.Debug is set to true), the values of your ARM Outputs will be printed to the log. If your deployment outputs any secret values, they will be shown, be careful (especially with public projects)!");
            }
            
            let connectedServiceNameARM: string = tl.getInput("ConnectedServiceNameARM");
            var endpointAuth = tl.getEndpointAuthorization(connectedServiceNameARM, true);
            var authScheme = tl.getEndpointAuthorizationScheme(connectedServiceNameARM, true);
            var environmentName = tl.getEndpointDataParameter(connectedServiceNameARM, "environment", true);
            var credentials = this.getCredentials(endpointAuth, authScheme, environmentName);
            var subscriptionId = tl.getEndpointDataParameter(connectedServiceNameARM, "SubscriptionId", true);

            var resourceGroupName = tl.getInput("resourceGroupName", true);
            var prefix = tl.getInput("prefix", false);
            var outputNames = tl.getDelimitedInput("outputNames", ",", false);
            var whenLastDeploymentIsFailedString = tl.getInput("whenLastDeploymentIsFailed", true);
            var whenLastDeploymentIsFailed = FailBehaviour[whenLastDeploymentIsFailedString];
            var deploymentNameFilter = tl.getInput("deploymentNameFilter", false);
            var setAsOutput = tl.getBoolInput("setAsOutput", true);

            if (!prefix || prefix == "null") prefix = "";

            var params = <ArmOutputParams>{
                tokenCredentials: credentials,
                environmentName: environmentName,
                subscriptionId: subscriptionId,
                resourceGroupName: resourceGroupName,
                prefix: prefix,
                outputNames: outputNames,
                whenLastDeploymentIsFailed: whenLastDeploymentIsFailed,
                deploymentNameFilter: deploymentNameFilter,
            };

            var armOutputs = new ArmOutputs(params);
            var outputs = await armOutputs.run();
            
            if (outputs && outputs.length == 0) {
                tl.warning(`No output parameters could be found for the deployment`);
            } else {
                outputs.forEach(output => {
                    console.info(`Updating Azure Pipelines variable '${output.key}'`);
                    tl.setVariable(output.key, output.value, setAsOutput);
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

azureDevOpsArmOutputsTaskHost.run().then((result) =>
    tl.setResult(tl.TaskResult.Succeeded, "")
).catch((error) =>
    tl.setResult(tl.TaskResult.Failed, error)
);