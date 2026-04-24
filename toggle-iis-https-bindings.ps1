param(
  [string[]]$SiteNames = @(
    'av-booking-local.newshore.es',
    'av-static-local.newshore.es'
  ),
  [int]$PortA = 443,
  [int]$PortB = 4433
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Test-IsAdministrator {
  $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-PortFromBindingInformation {
  param([string]$BindingInformation)

  if ($BindingInformation -match '^.*:(\d+):[^:]*$') {
    return [int]$Matches[1]
  }

  throw "Could not parse port from binding '$BindingInformation'."
}

if (-not (Test-IsAdministrator)) {
  throw 'Run this script in an elevated PowerShell (Administrator).'
}

Import-Module WebAdministration

$siteBindingMap = @{}
foreach ($siteName in $SiteNames) {
  $bindings = @(Get-WebBinding -Name $siteName -Protocol 'https')
  if ($bindings.Count -eq 0) {
    throw "Site '$siteName' has no HTTPS bindings."
  }

  $siteBindingMap[$siteName] = $bindings
}

$siteState = @{}
foreach ($siteName in $SiteNames) {
  $bindings = $siteBindingMap[$siteName]
  $hasPortA = $false
  $hasPortB = $false

  foreach ($binding in $bindings) {
    $bindingPort = Get-PortFromBindingInformation -BindingInformation $binding.bindingInformation
    if ($bindingPort -eq $PortA) { $hasPortA = $true }
    if ($bindingPort -eq $PortB) { $hasPortB = $true }
  }

  if ($hasPortA -and $hasPortB) {
    throw "Site '$siteName' has HTTPS bindings on both ports $PortA and $PortB. Leave only one port active before toggling."
  }

  if (-not $hasPortA -and -not $hasPortB) {
    throw "Site '$siteName' has HTTPS bindings, but none on ports $PortA or $PortB."
  }

  $siteState[$siteName] = [PSCustomObject]@{
    HasPortA = $hasPortA
    HasPortB = $hasPortB
  }
}

$allOnPortA = $true
$allOnPortB = $true
foreach ($siteName in $SiteNames) {
  if (-not $siteState[$siteName].HasPortA) { $allOnPortA = $false }
  if (-not $siteState[$siteName].HasPortB) { $allOnPortB = $false }
}

if ($allOnPortA) {
  $fromPort = $PortA
  $toPort = $PortB
} elseif ($allOnPortB) {
  $fromPort = $PortB
  $toPort = $PortA
} else {
  throw "Mixed state detected across sites. Ensure all target sites are on port $PortA or all on port $PortB before toggling."
}

$changes = @()
foreach ($siteName in $SiteNames) {
  foreach ($binding in $siteBindingMap[$siteName]) {
    $bindingPort = Get-PortFromBindingInformation -BindingInformation $binding.bindingInformation
    if ($bindingPort -ne $fromPort) {
      continue
    }

    $changes += [PSCustomObject]@{
      SiteName = $siteName
      BindingInformation = $binding.bindingInformation
    }
  }
}

if ($changes.Count -eq 0) {
  throw "No HTTPS bindings found on port $fromPort to move."
}

foreach ($change in $changes) {
  Set-WebBinding `
    -Name $change.SiteName `
    -BindingInformation $change.BindingInformation `
    -PropertyName Port `
    -Value $toPort

  Write-Host "[$($change.SiteName)] $($change.BindingInformation) => port $toPort"
}

Write-Host "Done. Toggled HTTPS bindings from $fromPort to $toPort for sites: $($SiteNames -join ', ')."
