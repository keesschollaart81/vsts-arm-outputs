Write-Verbose "Entering script run-vsts.ps1"

Import-Module $PSScriptRoot\ps_modules\VstsAzureHelpers_
Initialize-Azure

$resourceGroupName = Get-VstsInput -Name resourceGroupName -Require

.\arm-outputs.ps1