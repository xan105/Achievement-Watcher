

/* this ALWAYS GENERATED file contains the definitions for the interfaces */


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


/* verify that the <rpcndr.h> version is high enough to compile this file*/
#ifndef __REQUIRED_RPCNDR_H_VERSION__
#define __REQUIRED_RPCNDR_H_VERSION__ 475
#endif

#include "rpc.h"
#include "rpcndr.h"

#ifndef __RPCNDR_H_VERSION__
#error this stub requires an updated version of <rpcndr.h>
#endif // __RPCNDR_H_VERSION__


#ifndef __quiethours_h_h__
#define __quiethours_h_h__

#if defined(_MSC_VER) && (_MSC_VER >= 1020)
#pragma once
#endif

/* Forward Declarations */ 

#ifndef __QuietHoursSettings_FWD_DEFINED__
#define __QuietHoursSettings_FWD_DEFINED__

#ifdef __cplusplus
typedef class QuietHoursSettings QuietHoursSettings;
#else
typedef struct QuietHoursSettings QuietHoursSettings;
#endif /* __cplusplus */

#endif 	/* __QuietHoursSettings_FWD_DEFINED__ */


#ifndef __IQuietHoursProfile_FWD_DEFINED__
#define __IQuietHoursProfile_FWD_DEFINED__
typedef interface IQuietHoursProfile IQuietHoursProfile;

#endif 	/* __IQuietHoursProfile_FWD_DEFINED__ */


#ifndef __IQuietHoursSettings_FWD_DEFINED__
#define __IQuietHoursSettings_FWD_DEFINED__
typedef interface IQuietHoursSettings IQuietHoursSettings;

#endif 	/* __IQuietHoursSettings_FWD_DEFINED__ */


/* header files for imported files */
#include "oaidl.h"

#ifdef __cplusplus
extern "C"{
#endif 



#ifndef __QuietHours_LIBRARY_DEFINED__
#define __QuietHours_LIBRARY_DEFINED__

/* library QuietHours */
/* [uuid] */ 


EXTERN_C const IID LIBID_QuietHours;

EXTERN_C const CLSID CLSID_QuietHoursSettings;

#ifdef __cplusplus

class DECLSPEC_UUID("f53321fa-34f8-4b7f-b9a3-361877cb94cf")
QuietHoursSettings;
#endif

#ifndef __IQuietHoursProfile_INTERFACE_DEFINED__
#define __IQuietHoursProfile_INTERFACE_DEFINED__

/* interface IQuietHoursProfile */
/* [object][uuid] */ 


EXTERN_C const IID IID_IQuietHoursProfile;

#if defined(__cplusplus) && !defined(CINTERFACE)
    
    MIDL_INTERFACE("e813fe81-62b6-417d-b951-9d2e08486ac1")
    IQuietHoursProfile : public IUnknown
    {
    public:
        virtual /* [propget] */ HRESULT STDMETHODCALLTYPE get_DisplayName( 
            /* [retval][string][out] */ LPWSTR *displayName) = 0;
        
        virtual /* [propget] */ HRESULT STDMETHODCALLTYPE get_ProfileId( 
            /* [retval][string][out] */ LPWSTR *profileId) = 0;
        
        virtual HRESULT STDMETHODCALLTYPE GetSetting( 
            int setting,
            /* [retval][out] */ int *value) = 0;
        
        virtual HRESULT STDMETHODCALLTYPE PutSetting( 
            int setting,
            int value) = 0;
        
        virtual /* [propget] */ HRESULT STDMETHODCALLTYPE get_IsCustomizable( 
            /* [retval][out] */ BOOL *result) = 0;
        
        virtual HRESULT STDMETHODCALLTYPE GetAllowedContacts( 
            /* [out] */ UINT32 *count,
            /* [retval][out] */ LPWSTR *allowedContacts) = 0;
        
        virtual HRESULT STDMETHODCALLTYPE AddAllowedContact( 
            /* [string][in] */ LPWSTR allowedContact) = 0;
        
        virtual HRESULT STDMETHODCALLTYPE RemoveAllowedContact( 
            /* [string][in] */ LPWSTR allowedContact) = 0;
        
        virtual HRESULT STDMETHODCALLTYPE GetAllowedApps( 
            /* [out] */ UINT32 *count,
            /* [retval][out] */ LPWSTR **allowedApps) = 0;
        
        virtual HRESULT STDMETHODCALLTYPE AddAllowedApp( 
            /* [string][in] */ LPWSTR allowedApp) = 0;
        
        virtual HRESULT STDMETHODCALLTYPE RemoveAllowedApp( 
            /* [string][in] */ LPWSTR allowedApp) = 0;
        
        virtual /* [propget] */ HRESULT STDMETHODCALLTYPE get_Description( 
            /* [retval][string][out] */ LPWSTR *description) = 0;
        
        virtual /* [propget] */ HRESULT STDMETHODCALLTYPE get_CustomizeLinkText( 
            /* [retval][string][out] */ LPWSTR *linkText) = 0;
        
        virtual /* [propget] */ HRESULT STDMETHODCALLTYPE get_RestrictiveLevel( 
            /* [retval][string][out] */ LPWSTR *restrictiveLevel) = 0;
        
    };
    
    
#else 	/* C style interface */

    typedef struct IQuietHoursProfileVtbl
    {
        BEGIN_INTERFACE
        
        HRESULT ( STDMETHODCALLTYPE *QueryInterface )( 
            IQuietHoursProfile * This,
            /* [in] */ REFIID riid,
            /* [annotation][iid_is][out] */ 
            _COM_Outptr_  void **ppvObject);
        
        ULONG ( STDMETHODCALLTYPE *AddRef )( 
            IQuietHoursProfile * This);
        
        ULONG ( STDMETHODCALLTYPE *Release )( 
            IQuietHoursProfile * This);
        
        /* [propget] */ HRESULT ( STDMETHODCALLTYPE *get_DisplayName )( 
            IQuietHoursProfile * This,
            /* [retval][string][out] */ LPWSTR *displayName);
        
        /* [propget] */ HRESULT ( STDMETHODCALLTYPE *get_ProfileId )( 
            IQuietHoursProfile * This,
            /* [retval][string][out] */ LPWSTR *profileId);
        
        HRESULT ( STDMETHODCALLTYPE *GetSetting )( 
            IQuietHoursProfile * This,
            int setting,
            /* [retval][out] */ int *value);
        
        HRESULT ( STDMETHODCALLTYPE *PutSetting )( 
            IQuietHoursProfile * This,
            int setting,
            int value);
        
        /* [propget] */ HRESULT ( STDMETHODCALLTYPE *get_IsCustomizable )( 
            IQuietHoursProfile * This,
            /* [retval][out] */ BOOL *result);
        
        HRESULT ( STDMETHODCALLTYPE *GetAllowedContacts )( 
            IQuietHoursProfile * This,
            /* [out] */ UINT32 *count,
            /* [retval][out] */ LPWSTR *allowedContacts);
        
        HRESULT ( STDMETHODCALLTYPE *AddAllowedContact )( 
            IQuietHoursProfile * This,
            /* [string][in] */ LPWSTR allowedContact);
        
        HRESULT ( STDMETHODCALLTYPE *RemoveAllowedContact )( 
            IQuietHoursProfile * This,
            /* [string][in] */ LPWSTR allowedContact);
        
        HRESULT ( STDMETHODCALLTYPE *GetAllowedApps )( 
            IQuietHoursProfile * This,
            /* [out] */ UINT32 *count,
            /* [retval][out] */ LPWSTR **allowedApps);
        
        HRESULT ( STDMETHODCALLTYPE *AddAllowedApp )( 
            IQuietHoursProfile * This,
            /* [string][in] */ LPWSTR allowedApp);
        
        HRESULT ( STDMETHODCALLTYPE *RemoveAllowedApp )( 
            IQuietHoursProfile * This,
            /* [string][in] */ LPWSTR allowedApp);
        
        /* [propget] */ HRESULT ( STDMETHODCALLTYPE *get_Description )( 
            IQuietHoursProfile * This,
            /* [retval][string][out] */ LPWSTR *description);
        
        /* [propget] */ HRESULT ( STDMETHODCALLTYPE *get_CustomizeLinkText )( 
            IQuietHoursProfile * This,
            /* [retval][string][out] */ LPWSTR *linkText);
        
        /* [propget] */ HRESULT ( STDMETHODCALLTYPE *get_RestrictiveLevel )( 
            IQuietHoursProfile * This,
            /* [retval][string][out] */ LPWSTR *restrictiveLevel);
        
        END_INTERFACE
    } IQuietHoursProfileVtbl;

    interface IQuietHoursProfile
    {
        CONST_VTBL struct IQuietHoursProfileVtbl *lpVtbl;
    };

    

#ifdef COBJMACROS


#define IQuietHoursProfile_QueryInterface(This,riid,ppvObject)	\
    ( (This)->lpVtbl -> QueryInterface(This,riid,ppvObject) ) 

#define IQuietHoursProfile_AddRef(This)	\
    ( (This)->lpVtbl -> AddRef(This) ) 

#define IQuietHoursProfile_Release(This)	\
    ( (This)->lpVtbl -> Release(This) ) 


#define IQuietHoursProfile_get_DisplayName(This,displayName)	\
    ( (This)->lpVtbl -> get_DisplayName(This,displayName) ) 

#define IQuietHoursProfile_get_ProfileId(This,profileId)	\
    ( (This)->lpVtbl -> get_ProfileId(This,profileId) ) 

#define IQuietHoursProfile_GetSetting(This,setting,value)	\
    ( (This)->lpVtbl -> GetSetting(This,setting,value) ) 

#define IQuietHoursProfile_PutSetting(This,setting,value)	\
    ( (This)->lpVtbl -> PutSetting(This,setting,value) ) 

#define IQuietHoursProfile_get_IsCustomizable(This,result)	\
    ( (This)->lpVtbl -> get_IsCustomizable(This,result) ) 

#define IQuietHoursProfile_GetAllowedContacts(This,count,allowedContacts)	\
    ( (This)->lpVtbl -> GetAllowedContacts(This,count,allowedContacts) ) 

#define IQuietHoursProfile_AddAllowedContact(This,allowedContact)	\
    ( (This)->lpVtbl -> AddAllowedContact(This,allowedContact) ) 

#define IQuietHoursProfile_RemoveAllowedContact(This,allowedContact)	\
    ( (This)->lpVtbl -> RemoveAllowedContact(This,allowedContact) ) 

#define IQuietHoursProfile_GetAllowedApps(This,count,allowedApps)	\
    ( (This)->lpVtbl -> GetAllowedApps(This,count,allowedApps) ) 

#define IQuietHoursProfile_AddAllowedApp(This,allowedApp)	\
    ( (This)->lpVtbl -> AddAllowedApp(This,allowedApp) ) 

#define IQuietHoursProfile_RemoveAllowedApp(This,allowedApp)	\
    ( (This)->lpVtbl -> RemoveAllowedApp(This,allowedApp) ) 

#define IQuietHoursProfile_get_Description(This,description)	\
    ( (This)->lpVtbl -> get_Description(This,description) ) 

#define IQuietHoursProfile_get_CustomizeLinkText(This,linkText)	\
    ( (This)->lpVtbl -> get_CustomizeLinkText(This,linkText) ) 

#define IQuietHoursProfile_get_RestrictiveLevel(This,restrictiveLevel)	\
    ( (This)->lpVtbl -> get_RestrictiveLevel(This,restrictiveLevel) ) 

#endif /* COBJMACROS */


#endif 	/* C style interface */




#endif 	/* __IQuietHoursProfile_INTERFACE_DEFINED__ */


#ifndef __IQuietHoursSettings_INTERFACE_DEFINED__
#define __IQuietHoursSettings_INTERFACE_DEFINED__

/* interface IQuietHoursSettings */
/* [object][uuid] */ 


EXTERN_C const IID IID_IQuietHoursSettings;

#if defined(__cplusplus) && !defined(CINTERFACE)
    
    MIDL_INTERFACE("6bff4732-81ec-4ffb-ae67-b6c1bc29631f")
    IQuietHoursSettings : public IUnknown
    {
    public:
        virtual /* [propget] */ HRESULT STDMETHODCALLTYPE get_UserSelectedProfile( 
            /* [retval][string][out] */ LPWSTR *profileId) = 0;
        
        virtual /* [propput] */ HRESULT STDMETHODCALLTYPE put_UserSelectedProfile( 
            /* [in] */ LPWSTR profileId) = 0;
        
        virtual HRESULT STDMETHODCALLTYPE GetProfile( 
            /* [string][in] */ LPWSTR profileId,
            /* [retval][out] */ IQuietHoursProfile **__MIDL__IQuietHoursSettings0000) = 0;
        
    };
    
    
#else 	/* C style interface */

    typedef struct IQuietHoursSettingsVtbl
    {
        BEGIN_INTERFACE
        
        HRESULT ( STDMETHODCALLTYPE *QueryInterface )( 
            IQuietHoursSettings * This,
            /* [in] */ REFIID riid,
            /* [annotation][iid_is][out] */ 
            _COM_Outptr_  void **ppvObject);
        
        ULONG ( STDMETHODCALLTYPE *AddRef )( 
            IQuietHoursSettings * This);
        
        ULONG ( STDMETHODCALLTYPE *Release )( 
            IQuietHoursSettings * This);
        
        /* [propget] */ HRESULT ( STDMETHODCALLTYPE *get_UserSelectedProfile )( 
            IQuietHoursSettings * This,
            /* [retval][string][out] */ LPWSTR *profileId);
        
        /* [propput] */ HRESULT ( STDMETHODCALLTYPE *put_UserSelectedProfile )( 
            IQuietHoursSettings * This,
            /* [in] */ LPWSTR profileId);
        
        HRESULT ( STDMETHODCALLTYPE *GetProfile )( 
            IQuietHoursSettings * This,
            /* [string][in] */ LPWSTR profileId,
            /* [retval][out] */ IQuietHoursProfile **__MIDL__IQuietHoursSettings0000);
        
        END_INTERFACE
    } IQuietHoursSettingsVtbl;

    interface IQuietHoursSettings
    {
        CONST_VTBL struct IQuietHoursSettingsVtbl *lpVtbl;
    };

    

#ifdef COBJMACROS


#define IQuietHoursSettings_QueryInterface(This,riid,ppvObject)	\
    ( (This)->lpVtbl -> QueryInterface(This,riid,ppvObject) ) 

#define IQuietHoursSettings_AddRef(This)	\
    ( (This)->lpVtbl -> AddRef(This) ) 

#define IQuietHoursSettings_Release(This)	\
    ( (This)->lpVtbl -> Release(This) ) 


#define IQuietHoursSettings_get_UserSelectedProfile(This,profileId)	\
    ( (This)->lpVtbl -> get_UserSelectedProfile(This,profileId) ) 

#define IQuietHoursSettings_put_UserSelectedProfile(This,profileId)	\
    ( (This)->lpVtbl -> put_UserSelectedProfile(This,profileId) ) 

#define IQuietHoursSettings_GetProfile(This,profileId,__MIDL__IQuietHoursSettings0000)	\
    ( (This)->lpVtbl -> GetProfile(This,profileId,__MIDL__IQuietHoursSettings0000) ) 

#endif /* COBJMACROS */


#endif 	/* C style interface */




#endif 	/* __IQuietHoursSettings_INTERFACE_DEFINED__ */

#endif /* __QuietHours_LIBRARY_DEFINED__ */

/* Additional Prototypes for ALL interfaces */

/* end of Additional Prototypes */

#ifdef __cplusplus
}
#endif

#endif


