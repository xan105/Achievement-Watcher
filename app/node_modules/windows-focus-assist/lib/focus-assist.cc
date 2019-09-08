#include <nan.h>
#include <v8.h>

enum API_RESULT
{
    NOT_SUPPORTED = -2,
    FAILED = -1,
    Off = 0,
    PRIORITY_ONLY = 1,
    ALARMS_ONLY = 2
};


#ifdef _WIN32
    #include <windows.h>

    #pragma comment(lib, "ntdll.lib")

    #define NT_SUCCESS_STATUS(Status) (((NTSTATUS)(Status)) >= 0)

    typedef struct _WNF_STATE_NAME
    {
        ULONG Data[2];
    } WNF_STATE_NAME, *PWNF_STATE_NAME;

    typedef struct _WNF_TYPE_ID
    {
        GUID TypeId;
    } WNF_TYPE_ID, *PWNF_TYPE_ID;

    typedef const WNF_TYPE_ID *PCWNF_TYPE_ID;
    typedef ULONG WNF_CHANGE_STAMP, *PWNF_CHANGE_STAMP;

    extern "C"
    NTSTATUS
    NTAPI
    NtQueryWnfStateData(
        _In_ PWNF_STATE_NAME StateName,
        _In_opt_ PWNF_TYPE_ID TypeId,
        _In_opt_ const VOID* ExplicitScope,
        _Out_ PWNF_CHANGE_STAMP ChangeStamp,
        _Out_writes_bytes_to_opt_(*BufferSize, *BufferSize) PVOID Buffer,
        _Inout_ PULONG BufferSize);

    int InternalGetFocusAssist()
    {
        WNF_STATE_NAME WNF_SHEL_QUIETHOURS_ACTIVE_PROFILE_CHANGED{ 0xA3BF1C75, 0xD83063E };

        WNF_CHANGE_STAMP unused_change_stamp{};
        DWORD buffer = 0;
        ULONG buffer_size = sizeof(buffer);
        int status = -1;

        if (NT_SUCCESS_STATUS(::NtQueryWnfStateData(&WNF_SHEL_QUIETHOURS_ACTIVE_PROFILE_CHANGED, nullptr, nullptr, &unused_change_stamp, &buffer, &buffer_size)))
        {
            if(buffer >= 0 || buffer <= 2)
            {
                status = buffer;
            }
        }
        else
        {
            status = API_RESULT::FAILED;
        }

        return status;
    }
#endif

NAN_METHOD (GetFocusAssist) 
{
    #ifdef _WIN32
        int status;
        try
        {
            status = InternalGetFocusAssist();
        }
        catch (...)
        {
            status = API_RESULT::FAILED;
        }
        auto message = Nan::New<v8::Int32>(status);    
    #else
        auto message = Nan::New<v8::Int32>(API_RESULT::NOT_SUPPORTED);
    #endif
        info.GetReturnValue().Set(message);
}

NAN_MODULE_INIT(Initialize) 
{
	NAN_EXPORT(target, GetFocusAssist);
}

#if NODE_MAJOR_VERSION >= 10
NAN_MODULE_WORKER_ENABLED(GetFocusAssist, Initialize)
#else
NODE_MODULE(GetFocusAssist, Initialize)
#endif
