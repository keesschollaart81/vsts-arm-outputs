Write-Verbose "Entering script Out-ARMOutput.ps1"

Write-Warning "You're using the old 4.* (PowerShell based) version of this task which will be removed any time soon. Please upgrade to the new 5.* version which is much faster and enables Linux based agents!"

. .\Select-OutputsFromObjectTree.ps1
 
Write-Debug "ResourceGroupName= $resourceGroupName"

#region Get Latest Deployment

$lastResourceGroupDeployments = Get-AzureRmResourceGroupDeployment -ResourceGroupName $resourceGroupName | Where-Object {$_.DeploymentName -match $deploymentNameFilter -or $deploymentNameFilter -eq $null} | Sort-Object Timestamp -Descending        
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
#endregion

$outputNamesArray = $null

if ($outputNames) {
    $outputNamesArray = $outputNames.split(',') | ForEach-Object { $_.Trim() }
}

#region generate array with all outputs

$Outputs = @()

$lastResourceGroupDeployment.Outputs.GetEnumerator() | ForEach-Object {  
    $value = $_.Value.Value 

    if ($outputNamesArray.length -gt 0 -and $outputNamesArray -notcontains $_.Key) {
        Write-Debug "Variable '$($_.Key)' is not one of the $($outputNamesArray.length) given key's to set, ignoring..."
        return
    }
    
    if ($_.Value.Type -eq "SecureString") {
        Write-Verbose "Variable '$($_.Key)' is of type SecureString, ignoring..."
        return
    } 
    
    if ($value.GetType().Name -eq "JObject"){
        $objectOutput = ConvertFrom-Json $value.ToString() # Is this really needed?
        $Outputs += Select-OutputsFromObjectTree -Object $objectOutput -PathName $_.Key -Level 0 -MaxLevels 7 
        return
    } 

    $Outputs += [PSCustomObject]@{
        Key = $_.Key
        Value = $value 
    }    
}
#endregion

$Outputs | ForEach-Object { 
    Write-Verbose "Updating VSTS variable '$($_.Key)' to value '$($_.Value)'"
    Write-Host "##vso[task.setvariable variable=$prefix$($_.Key);]$($_.Value)"  
}