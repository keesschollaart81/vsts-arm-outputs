import { FailBehaviour } from "./FailBehaviour"; 
import { ServiceClientCredentials } from "ms-rest";

export class ArmOutputParams {
    public tokenCredentials: ServiceClientCredentials;
    public environmentName: string;
    public subscriptionId: string;
    public resourceGroupName: string;
    public prefix: string;
    public outputNames: string[];
    public whenLastDeploymentIsFailed: FailBehaviour;
    public deploymentNameFilter: string;
}
