Write-Verbose "Entering script arm-outputs.ps1"
 
Write-Debug "ResourceGroupName= $resourceGroupName"

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
    $type = $lastResourceGroupDeployment.Outputs.Item($key).Type
	$value = $lastResourceGroupDeployment.Outputs.Item($key).Value

	if ($type -eq "SecureString")
	{
	    Write-Information "Variable '$key' is of type SecureString and is therefore ignored"
	}
    else
    {
        Write-Information "Updating VSTS variable '$key' to value '$value'"
	    Write-Host "##vso[task.setvariable variable=$key;$isSecret]$value" 
    }
}