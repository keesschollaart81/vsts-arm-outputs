import { FailBehaviour } from "./FailBehaviour";
import * as msrestAzure from 'ms-rest-azure';

export class ArmOutputParams {
    public tokenCredentials: msrestAzure.ApplicationTokenCredentials;
    public subscriptionId: string;
    public resourceGroupName: string;
    public prefix: string;
    public outputNames: string[];
    public whenLastDeploymentIsFailed: FailBehaviour;
    public deploymentNameFilter: string;
}
