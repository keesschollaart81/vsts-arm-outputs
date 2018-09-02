[CmdletBinding(DefaultParameterSetName = 'None')]
param
(
	[String] [Parameter(Mandatory = $true)]
	$ConnectedServiceNameSelector,

	[String] [Parameter(Mandatory = $true)]
	$ConnectedServiceNameARM,

	[String] [Parameter(Mandatory = $true)]
	$resourceGroupName,

	[String] [Parameter(Mandatory = $false)]
	$prefix,

	[String] [Parameter(Mandatory = $false)]
	$outputNames,

	[String] [Parameter(Mandatory = $true)]
	$whenLastDeploymentIsFailed,

	[String] [Parameter(Mandatory = $false)]
	$deploymentNameFilter 
)
Write-Verbose "Entering script run-vsts.ps1"

.\Out-ARMOutput.ps1