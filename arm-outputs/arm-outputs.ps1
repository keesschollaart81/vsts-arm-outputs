Write-Verbose "Entering script arm-outputs.ps1"
 
Write-Debug "ResourceGroupName= $resourceGroupName"

$lastResourceGroupDeployments = Get-AzureRmResourceGroupDeployment -ResourceGroupName $resourceGroupName | where {$_.DeploymentName -match $deploymentNameFilter -or $deploymentNameFilter -eq $null} | Sort-Object Timestamp -Descending        
$lastResourceGroupDeployment = $lastResourceGroupDeployments | Select-Object -First 1      

if ($whenLastDeploymentIsFailed -eq "latestSuccesful" ) {
    $lastDeploymentStatus = $lastResourceGroupDeployment.ProvisioningState
    $deploymentName = $lastResourceGroupDeployment.DeploymentName
    if ($lastResourceGroupDeployment -and $lastDeploymentStatus -ne "Succeeded") {
        Write-Verbose "Deployment '$deploymentName' of Resource Group '$resourceGroupName' did not succeed ('$lastDeploymentStatus'), ingoring this deployment and finding latest succesful deployment"
    }
    $lastResourceGroupDeployments = $lastResourceGroupDeployments | Where-Object {$_.ProvisioningState -eq "Succeeded"} 
}

$lastResourceGroupDeployment = $lastResourceGroupDeployments | Select-Object -First 1      

if (!$lastResourceGroupDeployment) {
    throw "Deployment could not be found for Resource Group '$resourceGroupName'."
}

$lastDeploymentStatus = $lastResourceGroupDeployment.ProvisioningState
$deploymentName = $lastResourceGroupDeployment.DeploymentName
if ($whenLastDeploymentIsFailed -eq "fail" -and $lastDeploymentStatus -ne "Succeeded") {
    throw "Deployment '$deploymentName' of Resource Group '$resourceGroupName' did not succeed (status '$lastDeploymentStatus')"
}

if (!$lastResourceGroupDeployment.Outputs) {
    Write-Warning "No output parameters could be found for the deployment '$deploymentName' of Resource Group '$resourceGroupName'."
    return;
}

$outputNamesArray = $null

if ($outputNames) {
    $outputNamesArray = $outputNames.split(',') | ForEach-Object { $_.Trim() }
}
$outputNamesCount = $outputNamesArray.length

foreach ($key in $lastResourceGroupDeployment.Outputs.Keys) {
    $type = $lastResourceGroupDeployment.Outputs.Item($key).Type
    $value = $lastResourceGroupDeployment.Outputs.Item($key).Value

    if ($outputNamesCount -gt 0 -and $outputNamesArray -notcontains $key) {
        Write-Debug "Variable '$key' is not one of the $outputNamesCount given key's to set, ignoring..."
        continue;
    }
    
    if ($type -eq "SecureString") {
        Write-Verbose "Variable '$key' is of type SecureString, ignoring..."
    }
    else {
        Write-Verbose "Updating VSTS variable '$key' to value '$value'"
        Write-Host "##vso[task.setvariable variable=$prefix$key;$isSecret]$value" 
    }
}