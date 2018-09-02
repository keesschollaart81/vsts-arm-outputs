Login-AzureRmAccount -TenantId "7d25d723-384b-4d25-aaba-4e6c8b0762d5"
Select-AzureRmSubscription -SubscriptionName "Kees Prive"
$resourceGroupName = "Home-Assistant-Backend"
$prefix = $null
[Array]$outputNames = $null
$deploymentNameFilter = $null
.\Out-ARMOutput.ps1