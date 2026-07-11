$exePath = "$env:LOCALAPPDATA\Programs\PDFMaster Pro\PDFMaster Pro.exe"
if (-not (Test-Path $exePath)) {
    $exePath = "$PSScriptRoot\dist\win-unpacked\PDFMaster Pro.exe"
}

Write-Host "Registering $exePath for .pdf files..."

# Register under Applications
$appKey = "HKCU:\Software\Classes\Applications\PDFMaster Pro.exe"
New-Item -Path $appKey -Force | Out-Null
Set-ItemProperty -Path $appKey -Name "(default)" -Value "PDFMaster Pro"
New-Item -Path "$appKey\SupportedTypes" -Force | Out-Null
Set-ItemProperty -Path "$appKey\SupportedTypes" -Name ".pdf" -Value ""
New-Item -Path "$appKey\shell\open\command" -Force | Out-Null
Set-ItemProperty -Path "$appKey\shell\open\command" -Name "(default)" -Value "`"$exePath`" `"%1`""

# Register ProgID for Open With menu & Default Apps
$progIdKey = "HKCU:\Software\Classes\PDFMasterPro.PDF"
New-Item -Path $progIdKey -Force | Out-Null
Set-ItemProperty -Path $progIdKey -Name "(default)" -Value "PDF Document"
New-Item -Path "$progIdKey\DefaultIcon" -Force | Out-Null
Set-ItemProperty -Path "$progIdKey\DefaultIcon" -Name "(default)" -Value "`"$exePath`",0"
New-Item -Path "$progIdKey\shell\open\command" -Force | Out-Null
Set-ItemProperty -Path "$progIdKey\shell\open\command" -Name "(default)" -Value "`"$exePath`" `"%1`""

# Link .pdf extension to our ProgID in OpenWithProgids
$extKey = "HKCU:\Software\Classes\.pdf\OpenWithProgids"
New-Item -Path $extKey -Force | Out-Null
Set-ItemProperty -Path $extKey -Name "PDFMasterPro.PDF" -Value ""

# Notify Windows Explorer to refresh context menu & icons
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@
[Win32]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)

Write-Host "SUCCESS: PDFMaster Pro has been registered in Windows 'Open with' context menu and as a default .pdf handler!"
