Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' Kill any previous stuck server on port 8080
WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %a", 0, True

' Start python server completely hidden
WshShell.Run "python server.py 8080", 0, False
WScript.Sleep 1000

' Open default browser directly via IPv4 to bypass any IPv6 DNS hang
WshShell.Run "http://127.0.0.1:8080"