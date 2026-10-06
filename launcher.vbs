Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Onder\Desktop\OmniHub"
WshShell.Run chr(34) & "C:\Users\Onder\Desktop\OmniHub\baslat.bat" & Chr(34), 0
Set WshShell = Nothing
