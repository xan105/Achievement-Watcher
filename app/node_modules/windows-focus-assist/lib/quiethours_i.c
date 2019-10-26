

/* this ALWAYS GENERATED file contains the IIDs and CLSIDs */

/* link this file in with the server and any clients */


 /* File created by MIDL compiler version 8.00.0603 */
/* at Mon Sep 23 16:38:45 2019
 */
/* Compiler settings for ..\lib\quiethours.idl:
    Oicf, W1, Zp8, env=Win64 (32b run), target_arch=AMD64 8.00.0603 
    protocol : dce , ms_ext, c_ext, robust
    error checks: allocation ref bounds_check enum stub_data 
    VC __declspec() decoration level: 
         __declspec(uuid()), __declspec(selectany), __declspec(novtable)
         DECLSPEC_UUID(), MIDL_INTERFACE()
*/
/* @@MIDL_FILE_HEADING(  ) */

#pragma warning( disable: 4049 )  /* more than 64k source lines */


#ifdef __cplusplus
extern "C"{
#endif 


#include <rpc.h>
#include <rpcndr.h>

#ifdef _MIDL_USE_GUIDDEF_

#ifndef INITGUID
#define INITGUID
#include <guiddef.h>
#undef INITGUID
#else
#include <guiddef.h>
#endif

#define MIDL_DEFINE_GUID(type,name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8) \
        DEFINE_GUID(name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8)

#else // !_MIDL_USE_GUIDDEF_

#ifndef __IID_DEFINED__
#define __IID_DEFINED__

typedef struct _IID
{
    unsigned long x;
    unsigned short s1;
    unsigned short s2;
    unsigned char  c[8];
} IID;

#endif // __IID_DEFINED__

#ifndef CLSID_DEFINED
#define CLSID_DEFINED
typedef IID CLSID;
#endif // CLSID_DEFINED

#define MIDL_DEFINE_GUID(type,name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8) \
        const type name = {l,w1,w2,{b1,b2,b3,b4,b5,b6,b7,b8}}

#endif !_MIDL_USE_GUIDDEF_

MIDL_DEFINE_GUID(IID, LIBID_QuietHours,0xe0b5ef8b,0xa9b4,0x497a,0x8f,0x71,0x08,0xdd,0x5c,0x8a,0xb2,0xbf);


MIDL_DEFINE_GUID(CLSID, CLSID_QuietHoursSettings,0xf53321fa,0x34f8,0x4b7f,0xb9,0xa3,0x36,0x18,0x77,0xcb,0x94,0xcf);


MIDL_DEFINE_GUID(IID, IID_IQuietHoursProfile,0xe813fe81,0x62b6,0x417d,0xb9,0x51,0x9d,0x2e,0x08,0x48,0x6a,0xc1);


MIDL_DEFINE_GUID(IID, IID_IQuietHoursSettings,0x6bff4732,0x81ec,0x4ffb,0xae,0x67,0xb6,0xc1,0xbc,0x29,0x63,0x1f);

#undef MIDL_DEFINE_GUID

#ifdef __cplusplus
}
#endif



