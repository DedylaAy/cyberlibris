Set WshShell = CreateObject("WScript.Shell")
scriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' Check if port 8080 is already running
Set oExec = WshShell.Exec("cmd /c netstat -ano | findstr :8080")
Do While oExec.Status = 0
    WScript.Sleep 50
Loop
output = oExec.StdOut.ReadAll()

If InStr(output, ":8080") = 0 Then
    ' Start server in completely hidden window (0)
    WshShell.Run "python server.py", 0, False
    WScript.Sleep 1000
End If

' Open default browser
WshShell.Run "http://localhost:8080"
