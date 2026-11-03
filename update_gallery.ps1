# TOTAL BEAUTY - Actualizador de Catalogo de Fotos
$f = Join-Path $PSScriptRoot "fotosacademia"
if (Test-Path $f) {
    $imgs = @(Get-ChildItem -Path $f | Where-Object { $_.Extension -match '\.(jpe?g|png|webp|gif)$' -and $_.Name -ne 'manifest.json' } | Select-Object -ExpandProperty Name)
    $json = if ($imgs.Count -eq 0) { "[]" } elseif ($imgs.Count -eq 1) { "[`"$($imgs[0])`"]" } else { $imgs | ConvertTo-Json }
    [System.IO.File]::WriteAllText((Join-Path $f "manifest.json"), $json, [System.Text.Encoding]::UTF8)
}
