import { ArmOutputParams } from "./ArmOutputParams";
import * as r from "azure-arm-resource"
import * as mm from "micromatch"
import { FailBehaviour } from "./FailBehaviour";
import { ArmOutputResult } from "./ArmOutputResult";

export class ArmOutputs {

    private resourceManagementClient: r.ResourceManagementClient.default;

    constructor(private config: ArmOutputParams) {
        this.resourceManagementClient = new r.ResourceManagementClient.ResourceManagementClient(this.config.tokenCredentials, this.config.subscriptionId);
    }

    public run = async (): Promise<ArmOutputResult[]> => {
        var deployments = await this.resourceManagementClient.deployments.listByResourceGroup(this.config.resourceGroupName);
        if (this.config.deploymentNameFilter) {
            deployments = deployments.filter(x => mm.isMatch(x.name, this.config.deploymentNameFilter, { nocase: true }));
        }
        deployments.sort((a, b) => +b.properties.timestamp - +a.properties.timestamp); // descending

        if (deployments.length > 0 && this.config.whenLastDeploymentIsFailed == FailBehaviour.latestSuccesful) {
            if (deployments[0].properties.provisioningState != "Succeeded") {
                console.debug(`Deployment '${deployments[0].name}' of Resource Group '${this.config.resourceGroupName}' did not succeed ('${deployments[0].properties.provisioningState}'), ingoring this deployment and finding latest succesful deployment`)
            }
            deployments = deployments.filter(x => x.properties.provisioningState == "Succeeded");
        }

        if (deployments.length == 0) {
            throw new Error(`Deployment could not be found for Resource Group '${this.config.resourceGroupName}'.`)
        }

        if (deployments[0].properties.provisioningState != "Succeeded" && this.config.whenLastDeploymentIsFailed == FailBehaviour.fail) {
            throw new Error(`Deployment '${deployments[0].name}' of Resource Group '${this.config.resourceGroupName}' did not succeed (status '${deployments[0].properties.provisioningState}')`);
        }

        var outputs = deployments[0].properties.outputs;
        if (!outputs) {
            throw new Error(`No output parameters could be found for the deployment '${deployments[0].name}' of Resource Group '${this.config.resourceGroupName}'."`)
        }

        var results: ArmOutputResult[] = [];
        for (var output in outputs) {

            if (this.config.outputNames.length > 0 && !this.config.outputNames.some(x => x == output)) {
                console.info(`Variable '${output}' is not one of the ${this.config.outputNames.length} given key's to set, ignoring...`);
                continue;
            }

            if (outputs[output]["type"] == "SecureString") {
                console.info(`Variable '${output}' is of type SecureString, ignoring...`);
                continue;
            }

            if (outputs[output]["type"] == "String") {
                results.push({ key: `${this.config.prefix}${output}`, value: `${outputs[output]["value"]}` });
            }

            if (outputs[output]["type"] == "Object") {
                var flatten = this.flatten(outputs[output]["value"]);
                for (var propery in flatten) {
                    results.push({ key: `${this.config.prefix}${output}.${propery}`, value: `${flatten[propery]}` }); 
                }
            }
        }
        return results;
    }

    private flatten = (o, prefix = "", out = {}) => {
        for (var name in o) {
            if (o.hasOwnProperty(name)) {
                typeof o[name] === "object" ? this.flatten(o[name], prefix + name + '_', out) : out[prefix + name] = o[name];
            }
        }
        return out;
    }
}
