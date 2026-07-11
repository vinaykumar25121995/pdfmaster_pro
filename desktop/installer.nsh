!macro customInstall
  # Register PDFMaster Pro as a supported application for .pdf files
  WriteRegStr HKCU "Software\Classes\Applications\PDFMaster Pro.exe" "" "PDFMaster Pro"
  WriteRegStr HKCU "Software\Classes\Applications\PDFMaster Pro.exe\SupportedTypes" ".pdf" ""
  WriteRegStr HKCU "Software\Classes\Applications\PDFMaster Pro.exe\shell\open" "FriendlyAppName" "PDFMaster Pro"
  WriteRegStr HKCU "Software\Classes\Applications\PDFMaster Pro.exe\shell\open\command" "" '"$INSTDIR\PDFMaster Pro.exe" "%1"'

  # Register ProgID for Open With context menu and Default App selection
  WriteRegStr HKCU "Software\Classes\PDFMasterPro.PDF" "" "PDF Document"
  WriteRegStr HKCU "Software\Classes\PDFMasterPro.PDF\DefaultIcon" "" '"$INSTDIR\PDFMaster Pro.exe",0'
  WriteRegStr HKCU "Software\Classes\PDFMasterPro.PDF\shell\open\command" "" '"$INSTDIR\PDFMaster Pro.exe" "%1"'
  WriteRegStr HKCU "Software\Classes\.pdf\OpenWithProgids" "PDFMasterPro.PDF" ""

  # Notify Windows shell of file association update
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend

!macro customUnInstall
  DeleteRegValue HKCU "Software\Classes\.pdf\OpenWithProgids" "PDFMasterPro.PDF"
  DeleteRegKey HKCU "Software\Classes\PDFMasterPro.PDF"
  DeleteRegKey HKCU "Software\Classes\Applications\PDFMaster Pro.exe"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, i 0, i 0)'
!macroend
