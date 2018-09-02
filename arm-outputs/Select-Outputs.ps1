function Select-OutputsFromObjectTree($Object, $MaxLevels="7", $PathName = "", $Level=0)
{
    # Recursivly traverse over (nested) objects, flattening the object-tree to: parent.child.propery: value
    
    $OutputArray = @()
 
    $Object | Get-Member | Where-Object { $_.MemberType -match "Property"} | ForEach-Object { 
        $key = "$PathName.$($_.Name)"
        $value = $Object | Select-Object -ExpandProperty $_.Name

        switch ($value.GetType().ToString())
        {
            "System.Management.Automation.PSCustomObject" { 
                $OutputArray += Select-OutputsFromObjectTree -Object $value -PathName $key -Level ($Level + 1) -MaxLevels $MaxLevels 
            }
            "System.Object[]"{
                For ($i=0; $i -lt $value.Length; $i++) { 
                    $OutputArray += Select-OutputsFromObjectTree -Object $value[$i] -PathName "$key[$i]" -Level ($Level + 1) -MaxLevels $MaxLevels 
                }
            }
            default{
                $OutputArray += [PSCustomObject]@{
                    Key = $key
                    Value = $value
                }
            }
        } 
    }
    return $OutputArray;
}