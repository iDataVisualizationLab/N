## Notes

Some notes about the concepts used in this project.

Demo: https://idatavisualizationlab.github.io/MalViz/

Example of a record:
````
Detail: "Desired Access: Generic Read, Disposition: Open, Options: , Attributes: n/a, ShareMode: Read, Delete, AllocationSize: n/a, OpenResult: Opened"
Operation: "CreateFile"
PID: "1652"
Path: "C:\Program Files\Internet Explorer\en-US\iexplore.exe.mui"
Process_Name: "Explorer.EXE"
Timestamp: "2:25:10.1991692 PM"
````
1. **CreateFile**: According to the [docs](https://docs.microsoft.com/en-us/windows/desktop/FileIO/creating-and-opening-files),
CreateFile function can create a new file or open an existing file. The scenarios for this function include:

    - Creating a new file when a file with that name does not already exist.
    - Creating a new file even if a file of the same name already exists, clearing its data and starting empty.
    - Opening an existing file only if it exists, and only intact.
    - Opening an existing file only if it exists, truncating it to be empty.
    - Opening a file always: as-is if it exists, creating a new one if it does not exist.
    
2. **Process_Name**: The values for this property mostly are executable file names (.exe) of all the running programs 
captured. Besides, the values can be `System` or `Idle`.
    - [System](https://www.neuber.com/taskmanager/process/system.html): It is the host of all kind of drivers. The system process has always the PID 4, otherwise it is malware.
    - [Idle](https://www.neuber.com/taskmanager/process/system%20idle.html): Indicates the percentage of time that 
    the processor is idle. It is a single thread running on each processor, which has the sole task of 
    accounting for processor time when the system isn't processing other threads. The system idle process has always the 
    PID 0  in the Windows Task Manager, otherwise it is malware.
    
3. **Windows System Information** [[link]](https://docs.microsoft.com/en-us/windows/desktop/sysinfo/handles-and-objects)
    
    - Objects: An object is a data structure that **represents a system resource**, such as a file, thread, or graphic 
    image. An application cannot directly access object data or the system resource that an object represents. 
    Application must obtain an object **handle**, which it can use to examine or modify the system resource.
    
    - Handle: This can be explained in two ways: 
        1. Each handle has an entry in an internally maintained table. These entries contain the addresses of the 
        resources and the means to identify the resource type [[link]](https://docs.microsoft.com/en-us/windows/desktop/sysinfo/handles-and-objects)
        2. An index into a table of pointers, you use the index for the system API calls, and the system can change 
        the pointer in the table at will [[link]](https://stackoverflow.com/a/902969/)
        
        Consider this case: You need to access a drawer of a locker. A receptionist is in the middle: She hands you a
         card to your drawer when you arrive. You hand it to her when you want to take back the item. All the cards 
         hung on the wall for all of drawers (Table of pointers). The handle is the card that the receptionist 
         gives you. You don't know exactly where is the drawer, but you know how to access it (you use the index for the system API calls).
         The handle is the card.
         
4. **CreateProcess vs. CreateFile .exe**

Question: Is there any difference between them?

|       | [CreateProcess](https://docs.microsoft.com/en-us/windows/desktop/api/processthreadsapi/nf-processthreadsapi-createprocessa)           | [CreateFile](https://docs.microsoft.com/en-us/windows/desktop/api/fileapi/nf-fileapi-createfilea)  |
| ------------- |:-------------| :-----|
| Definition      | Creates a new process and its primary thread | Creates or opens a file or I/O device |
| Activity      | Runs an executable file **as a process**, it will not create a file.| Opens or creates a file. It will not execute that file as a process. |
| Return value (succesfully) |Two separate handles, one each for the process and the thread       |An open handle to the specified file,  which you can then use, e.g., to read the contents of the file |
|Answer |The new process runs in the security context of the calling process.  |The file extension is irrelevant.|


5. Filter 
By regex expression 

`^.*(procmon.exe|procmon64.exe|Profiling|procexp.exe|procexp64.exe).*\n` [Sublime]

`^.*(procmon|profiling|processmonitor).*\n`

6. About self-call processes
Process calls to self = Has an operation that call to itself as an object.
This is not simply reading content from file, but calling to the corresponding process/thread.
For example: [Load Image](https://docs.microsoft.com/en-us/windows/desktop/api/winuser/nf-winuser-loadimagea)
Parameter: A handle to the module of either a DLL or executable (.exe) that contains the image to be loaded - Handle INSTANCE
