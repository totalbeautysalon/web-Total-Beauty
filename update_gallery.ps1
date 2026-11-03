# TOTAL BEAUTY - Actualizador de Catalogo de Fotos
$dir = Join-Path $PSScriptRoot "fotosacademia"
if (Test-Path $dir) {
    $imgs = @(Get-ChildItem -Path $dir | Where-Object { 
        $_.Extension -match '^\.(jpe?g|png|webp|gif)$' -and 
        $_.Name -ne 'manifest.json' -and 
        $_.Name -ne 'galeria.js' 
    } | Select-Object -ExpandProperty Name)

    $json = if ($imgs.Count -eq 0) { "[]" } elseif ($imgs.Count -eq 1) { "[`"$($imgs[0])`"]" } else { $imgs | ConvertTo-Json }
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    
    # Escribir manifest.json sin BOM
    [System.IO.File]::WriteAllText((Join-Path $dir "manifest.json"), $json, $utf8NoBom)

    # Escribir galeria.js para carga directa sin restricciones CORS locales
    $jsContent = "window.TOTAL_BEAUTY_GALERIA = " + $json + ";"
    [System.IO.File]::WriteAllText((Join-Path $dir "galeria.js"), $jsContent, $utf8NoBom)
}
