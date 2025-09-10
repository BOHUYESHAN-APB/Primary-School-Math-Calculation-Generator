# PowerShell script to generate app icons using ImageMagick
param()
$ErrorActionPreference = 'Stop'

# repo root (one level up from this script)
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')

# source logo (must exist)
$logo = Join-Path $repoRoot 'res\logo.png'
if (-not (Test-Path $logo)) {
  Write-Error "Logo not found: $logo"
  exit 1
}

# output directory
$buildDir = Join-Path $repoRoot 'build'
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

$icon512 = Join-Path $buildDir 'icon-512.png'
$icon256 = Join-Path $buildDir 'icon-256.png'
$icon128 = Join-Path $buildDir 'icon-128.png'
$icon64  = Join-Path $buildDir 'icon-64.png'
$icoPath = Join-Path $buildDir 'icon.ico'
$mainPng = Join-Path $buildDir 'icon.png'

# find ImageMagick executable (prefer 'magick' and validate it's ImageMagick)
$magickCmd = $null

# try 'magick' first (ImageMagick 7+)
$cmd = Get-Command magick -ErrorAction SilentlyContinue
if ($cmd) {
  try {
    $ver = & $cmd.Source '-version' 2>&1
    if ($ver -and $ver -match 'ImageMagick') {
      $magickCmd = $cmd.Source
    }
  } catch {
    # ignore
  }
}

# fallback to 'convert' only if it is actually ImageMagick (avoid Windows native convert.exe)
if (-not $magickCmd) {
  $cmd = Get-Command convert -ErrorAction SilentlyContinue
  if ($cmd) {
    try {
      $ver = & $cmd.Source '--version' 2>&1
      if ($ver -and $ver -match 'ImageMagick') {
        $magickCmd = $cmd.Source
      }
    } catch {
      # ignore
    }
  }
}

if (-not $magickCmd) {
  Write-Error 'ImageMagick not found or not recognized. Install ImageMagick and ensure "magick" is on PATH. On Windows, the built-in convert.exe is not ImageMagick.'
  exit 1
}

Write-Output "Using ImageMagick: $magickCmd"

# generate PNG sizes (center + transparent background)
& $magickCmd $logo '-resize' '512x512' '-gravity' 'center' '-background' 'transparent' '-extent' '512x512' $icon512
& $magickCmd $logo '-resize' '256x256' '-gravity' 'center' '-background' 'transparent' '-extent' '256x256' $icon256
& $magickCmd $logo '-resize' '128x128' '-gravity' 'center' '-background' 'transparent' '-extent' '128x128' $icon128
& $magickCmd $logo '-resize' '64x64'  '-gravity' 'center' '-background' 'transparent' '-extent' '64x64'  $icon64

# create ICO from multiple sizes (64,128,256,512)
& $magickCmd $icon64 $icon128 $icon256 $icon512 $icoPath

# ensure main icon.png exists (electron/main.js expects build/icon.png)
Copy-Item -Force $icon512 $mainPng

Write-Output "Generated icons in: $buildDir`n- $mainPng`n- $icoPath`n- $icon512, $icon256, $icon128, $icon64"