rem based on http://forum.script-coding.com/viewtopic.php?pid=75356#p75356

rem Option Explicit:


Dim completed
rem Dim returnValue
rem returnValue = MsgBoxMultiple("123&11&1367&1","123","321&1&7684&1&1&1&1&1&153")
rem 
rem MsgBox returnValue(0),vbInformation,"Yay"

Function MsgBoxMultiple(prompt,title,defval)
    Dim content, wnd, status
    
    Dim prompt_list: prompt_list = Split(prompt, "&")
    Dim defval_list: defval_list = Split(defval, "&")
    
    Dim val_count : val_count = UBound(prompt_list) + 1
    
    Dim block_wrap_beg : block_wrap_beg  = "<div class='input_line'>"
    Dim prompt_wrap_beg: prompt_wrap_beg = "<label for='a'>"
    Dim prompt_wrap_end: prompt_wrap_end = "</label>"
    Dim defval_wrap_beg1: defval_wrap_beg1 = "<span><input id='input_val_"
    Dim defval_wrap_beg2: defval_wrap_beg2 = "' type='text' value='"
    Dim defval_wrap_end: defval_wrap_end = "'/></span>"
    Dim block_wrap_end : block_wrap_end  = "</div>"
    
    Dim input_text
    Dim i
    For i = 0 To val_count - 1
        input_text = input_text + block_wrap_beg & prompt_wrap_beg & prompt_list(i) & prompt_wrap_end & defval_wrap_beg1 & i & defval_wrap_beg2 & defval_list(i) & defval_wrap_end & block_wrap_end
    Next

    content =  "<html>" &_
                    "<head>" &_
                        "<meta http-equiv='x-ua-compatible' content='IE=9'/>" &_
                        "<style type='text/css'>" &_ 
                             "div { overflow: hidden; }" &_ 
                             "span { display: block; overflow: hidden; padding-right:10px; }" &_
                             "label { float:left; width: 80px; text-align: right; padding-right:7px; }" &_
                             "input { width: 100%; }" &_
                             "button { width: 75px; margin: 5px; padding: 3px; float: right; }" &_
                             ".input_line { padding-bottom:7px; }" &_
                         "</style>" &_
                    "</head>" &_
                    "<body background='buttonface'>" &_
                        "<div>" &_
                            input_text &_
                            "<button id='hta_cancel'>Cancel</button>" & _ 
                            "<button id='hta_ok'>OK</button>" & _ 
                        "</div>" &_
                    "</body>" &_
                "</html>"

    Set wnd = createWindow(content,"border=dialog " &_
                                "minimizeButton=no " &_
                                "maximizeButton=no " &_
                                "scroll=no " &_
                                "showIntaskbar=yes " &_
                                "contextMenu=no " &_
                                "selection=no " &_
                                "innerBorder=no")

    Dim window_h : window_h = 29*(UBound(prompt_list) + 1) + 83
    With wnd
        .status = 0
        .document.title = title
        .moveTo 100, 100
        .resizeTo 370, window_h
    End With
    
    wnd.hta_ok.focus
    
    Set wnd.hta_cancel.onclick = getref("hta_cancel")
    Set wnd.hta_ok.onclick = getref("hta_ok")
    Set wnd.document.body.onunload = getref("hta_onunload")
        
    Dim retVal()
    ReDim retVal(val_count)
    
    do until completed > 0
        wscript.sleep 10
    loop
    select case completed
    case 1
        MsgBoxMultiple = ""
    case 2
        MsgBoxMultiple = ""
        wnd.close
    case 3        
        Dim cmd
        For i = 0 To val_count - 1
             cmd = "Option Explicit: retVal(i) = wnd.input_val_" & i & ".Value"
             Execute cmd
        Next
        
        MsgBoxMultiple = retVal
        wnd.close
    end select
End Function

Function createWindow(content,features)
    Dim wid, we, sw, id, i, doc
    Randomize:wid = Clng(Rnd*100000)
    Set we = CreateObject("WScript.Shell").Exec("mshta about:""" & _
    "<script>moveTo(-1000,-1000);resizeTo(0,0);</script>" & _
    "<hta:application id=app " & features & " />" & _
    "<object id=" & wid & " style='display:none' classid='clsid:8856F961-340A-11D0-A96B-00C04FD705A2'>" & _
    "<param name=RegisterAsBrowser value=1>" & _
    "</object>""")
    With CreateObject("Shell.Application")
        For i=1 to 1000
            For Each sw in .Windows
                On Error Resume Next
                id = Clng(sw.id)
                On Error Goto 0
                if id = wid Then
                    Set doc = sw.container
                    doc.write CStr(content)
                    Set createWindow = doc.parentWindow
                    Exit Function
                End if
            Next
        Next
    End With
    we.Terminate
    Err.Raise vbObjectError,"createWindow","Can't connect with created window !"
End Function

Sub hta_onunload
    completed = 1
end Sub
 
Sub hta_cancel
    completed = 2
end Sub
 
Sub hta_ok
    completed = 3
end Sub

Sub ArrayAdd(ByRef arr, ByVal val)
  Dim ub
  If IsArray(arr) Then
    On Error Resume Next
    ub = UBound(arr)
    If Err.Number <> 0 Then ub = -1
    ReDim Preserve arr(ub + 1)
    arr(UBound(arr)) = val
  End If
End Sub
