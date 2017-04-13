Import-Module $PSScriptRoot\ps_modules\VstsAzureHelpers_
Initialize-Azure

$resourceGroupName = Get-VstsInput -Name resourceGroupName -Require

Write-Verbose "Entering script run.ps1"
 
Write-Host "ResourceGroupName= $resourceGroupName"

$lastResourceGroupDeployment = Get-AzureRmResourceGroupDeployment -ResourceGroupName $resourceGroupName | Sort Timestamp -Descending | Select -First 1        

if(!$lastResourceGroupDeployment)
{
    throw "Deployment could not be found for Resource Group '$resourceGroupName'."
}

if(!$lastResourceGroupDeployment.Outputs)
{
    throw "No output parameters could be found for the last deployment of Resource Group '$resourceGroupName'."
}

foreach ($key in $lastResourceGroupDeployment.Outputs.Keys){
	$value = $lastResourceGroupDeployment.Outputs.Item($key).Value
	Write-Host "##vso[task.setvariable variable=$key;]$value"

    Write-Verbose "Updating VSTS variable '$key' to value '$value'"
}