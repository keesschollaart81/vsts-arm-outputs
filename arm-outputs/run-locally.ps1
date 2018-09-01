#Login-AzureRmAccount -TenantId "7d25d723-384b-4d25-aaba-4e6c8b0762d5"
Select-AzureRmSubscription -SubscriptionName "f2da982c-fc6f-4663-ad1e-46a186f9fa84"
$resourceGroupName = "Home-Assistant-Backend"
$prefix = $null
[Array]$outputNames = $null
$deploymentNameFilter = $null
.\arm-outputs.ps1