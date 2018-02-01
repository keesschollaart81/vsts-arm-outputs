Login-AzureRmAccount -TenantId "xxx"
Select-AzureRmSubscription -SubscriptionName "xxx"
$resourceGroupName = "xxx"
$prefix = $null
[Array]$outputNames = $null
$deploymentNameFilter = $null
.\arm-outputs.ps1