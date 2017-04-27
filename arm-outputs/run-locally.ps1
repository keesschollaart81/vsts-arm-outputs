Login-AzureRmAccount -TenantId "xxx"
Select-AzureRmSubscription -SubscriptionName "xxx"
$resourceGroupName = "xxx"
$prefix = $null
[Array]$outputNames = $null
.\arm-outputs.ps1