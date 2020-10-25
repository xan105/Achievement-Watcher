// Copyright (c) The NodeRT Contributors
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the ""License""); you may
// not use this file except in compliance with the License. You may obtain a
// copy of the License at http://www.apache.org/licenses/LICENSE-2.0
//
// THIS CODE IS PROVIDED ON AN  *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
// OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
// IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
// MERCHANTABLITY OR NON-INFRINGEMENT.
//
// See the Apache Version 2.0 License for specific language governing
// permissions and limitations under the License.

#include "NodeRtUtils.h"
#include <v8.h>
#include <string>
#include "OpaqueWrapper.h"
#include "nan.h"

#define WCHART_NOT_BUILTIN_IN_NODE 1

namespace NodeRT {
namespace Utils {

using Nan::EscapableHandleScope;
using Nan::False;
using Nan::HandleScope;
using Nan::MaybeLocal;
using Nan::Null;
using Nan::Persistent;
using Nan::True;
using Nan::Undefined;
using v8::Boolean;
using v8::Date;
using v8::Function;
using v8::FunctionTemplate;
using v8::Local;
using v8::Integer;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::Primitive;
using v8::PropertyAttribute;
using v8::String;
using v8::Value;

v8::Local<v8::Value> WinRtExceptionToJsError(Platform::Exception ^ exception) {
  EscapableHandleScope scope;

  if (exception == nullptr) {
    return scope.Escape(Undefined());
  }

  // we use casting here in case that wchar_t is not a built-in type
  const wchar_t* errorMessage = exception->Message->Data();
  unsigned int length = exception->Message->Length();

  Local<Value> error = Nan::Error(
      Nan::New<String>(reinterpret_cast<const uint16_t*>(errorMessage))
          .ToLocalChecked());
  Nan::Set(Nan::To<Object>(error).ToLocalChecked(),
           Nan::New<String>("HRESULT").ToLocalChecked(),
           Nan::New<Integer>(exception->HResult));

  return scope.Escape(error);
}

void ThrowWinRtExceptionInJs(Platform::Exception ^ exception) {
  if (exception == nullptr) {
    return;
  }

  Nan::ThrowError(WinRtExceptionToJsError(exception));
}

// creates an object with the following structure:
// {
//    "callback" : [callback fuction]
//    "domain" : [the domain in which the async function/event was
//    called/registered] (this is optional)
// }
Local<v8::Object> CreateCallbackObjectInDomain(Local<v8::Function> callback) {
  EscapableHandleScope scope;

  // get the current domain:
  MaybeLocal<v8::Object> callbackObject = Nan::New<Object>();

  Nan::Set(callbackObject.ToLocalChecked(),
           Nan::New<String>("callback").ToLocalChecked(), callback);

  MaybeLocal<Value> processVal =
      Nan::Get(Nan::GetCurrentContext()->Global(),
               Nan::New<String>("process").ToLocalChecked());
  v8::Local<Object> process =
      Nan::To<Object>(processVal.ToLocalChecked()).ToLocalChecked();
  if (process.IsEmpty() || Nan::Equals(process, Undefined()).FromMaybe(true)) {
    return scope.Escape(callbackObject.ToLocalChecked());
  }

  MaybeLocal<Value> currentDomain =
      Nan::Get(process, Nan::New<String>("domain").ToLocalChecked());

  if (!currentDomain.IsEmpty() &&
      !Nan::Equals(currentDomain.ToLocalChecked(), Undefined())
           .FromMaybe(true)) {
    Nan::Set(callbackObject.ToLocalChecked(),
             Nan::New<String>("domain").ToLocalChecked(),
             currentDomain.ToLocalChecked());
  }

  return scope.Escape(callbackObject.ToLocalChecked());
}

// Calls the callback in the appropriate domwin, expects an object in the
// following format:
// {
//    "callback" : [callback function]
//    "domain" : [the domain in which the async function/event was
//    called/registered] (this is optional)
// }
Local<Value> CallCallbackInDomain(Local<v8::Object> callbackObject,
                                  int argc,
                                  Local<Value> argv[]) {
  Nan::AsyncResource asyncResource(Nan::New<String>("CallCallbackInDomain").ToLocalChecked());
  return asyncResource.runInAsyncScope(
                          callbackObject,
                          Nan::New<String>("callback").ToLocalChecked(), argc,
                          argv)
      .FromMaybe(v8::Local<v8::Value>());
}

::Platform::Object ^
    GetObjectInstance(Local<Value> value) {
      // nulls are allowed when a WinRT wrapped object is expected
      if (value->IsNull()) {
        return nullptr;
      }

      WrapperBase* wrapper = Nan::ObjectWrap::Unwrap<WrapperBase>(
          Nan::To<Object>(value).ToLocalChecked());
      return wrapper->GetObjectInstance();
    }

    Local<String> NewString(const wchar_t* str) {
#ifdef WCHART_NOT_BUILTIN_IN_NODE
  return Nan::New<String>(reinterpret_cast<const uint16_t*>(str))
      .ToLocalChecked();
#else
  return Nan::New<String>(str).ToLocalChecked();
#endif
}

const wchar_t* StringToWchar(v8::String::Value& str) {
#ifdef WCHART_NOT_BUILTIN_IN_NODE
  return reinterpret_cast<const wchar_t*>(*str);
#else
  return *str;
#endif
}

// Note: current implementation converts any JS value that has a toString method
// to a ::Platform::String^ Changes to this code might break the Collection
// Convertor logic
::Platform::String ^
    V8StringToPlatformString(Local<Value> value) {
      v8::String::Value stringVal(v8::Isolate::GetCurrent(), value);
#ifdef WCHART_NOT_BUILTIN_IN_NODE
      return ref new Platform::String(
          reinterpret_cast<const wchar_t*>(*stringVal));
#else
      return ref new Platform::String(*stringVal);
#endif
    }

#ifndef min
    size_t min(size_t one, size_t two) {
  if (one < two) {
    return one;
  }

  return two;
}
#endif

#ifdef WCHART_NOT_BUILTIN_IN_NODE
// compares 2 strings using a case insensitive comparison
bool CaseInsenstiveEquals(const wchar_t* str1, const uint16_t* str2) {
  int maxCount = static_cast<int>(
      min(wcslen(str1), wcslen(reinterpret_cast<const wchar_t*>(str2))));
  return (_wcsnicmp(str1, reinterpret_cast<const wchar_t*>(str2), maxCount) ==
          0);
}
#endif

// compares 2 strings using a case insensitive comparison
bool CaseInsenstiveEquals(const wchar_t* str1, const wchar_t* str2) {
  int maxCount = static_cast<int>(min(wcslen(str1), wcslen(str2)));
  return (_wcsnicmp(str1, str2, maxCount) == 0);
}

void RegisterNameSpace(const char* ns, Local<Value> nsExports) {
  HandleScope scope;
  Local<Object> global = Nan::GetCurrentContext()->Global();

  if (!Nan::Has(global,
                Nan::New<String>("__winRtNamespaces__").ToLocalChecked())
           .FromMaybe(false)) {
    Nan::ForceSet(global,
                  Nan::New<String>("__winRtNamespaces__").ToLocalChecked(),
                  Nan::New<Object>(),
                  (v8::PropertyAttribute)(v8::PropertyAttribute::DontEnum &
                                          v8::PropertyAttribute::DontDelete));
  }

  MaybeLocal<Value> nsObject = Nan::Get(
      global, Nan::New<String>("__winRtNamespaces__").ToLocalChecked());
  Nan::Set(Nan::To<Object>(nsObject.ToLocalChecked()).ToLocalChecked(),
           Nan::New<String>(ns).ToLocalChecked(), nsExports);
}

Local<Value> CreateExternalWinRTObject(const char* ns,
                                       const char* objectName,
                                       ::Platform::Object ^ instance) {
  EscapableHandleScope scope;
  Local<Value> opaqueWrapper = CreateOpaqueWrapper(instance);

  Local<Object> global = Nan::GetCurrentContext()->Global();
  if (!Nan::Has(global,
                Nan::New<String>("__winRtNamespaces__").ToLocalChecked())
           .FromMaybe(false)) {
    return scope.Escape(opaqueWrapper);
  }

  Local<Object> winRtObj =
      Nan::To<Object>(
          Nan::Get(global,
                   Nan::New<String>("__winRtNamespaces__").ToLocalChecked())
              .ToLocalChecked())
          .ToLocalChecked();

  Local<String> nsSymbol = Nan::New<String>(ns).ToLocalChecked();
  if (!Nan::Has(winRtObj, nsSymbol).FromMaybe(false)) {
    return scope.Escape(opaqueWrapper);
  }

  v8::MaybeLocal<Value> maybeLocalRef = Nan::Get(winRtObj, nsSymbol);

  if (maybeLocalRef.IsEmpty()) {
    return scope.Escape(opaqueWrapper);
  }

  Local<Value> nsObjectValue = maybeLocalRef.ToLocalChecked();

  if (Nan::Equals(nsObjectValue, Undefined()).FromMaybe(false)) {
    Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
        L"Failed to obtain external namespace object")));
    return Undefined();
  }

  Local<Object> nsObject = Nan::To<Object>(nsObjectValue).ToLocalChecked();

  Local<String> objectNameSymbol =
      Nan::New<String>(objectName).ToLocalChecked();
  if (!Nan::Has(nsObject, objectNameSymbol).FromMaybe(false)) {
    return scope.Escape(opaqueWrapper);
  }

  Local<Function> objectFunc =
      Nan::Get(nsObject, objectNameSymbol).ToLocalChecked().As<Function>();
  Local<Value> args[] = {opaqueWrapper};
  return scope.Escape(
      Nan::NewInstance(objectFunc, _countof(args), args).ToLocalChecked());
}

bool IsWinRtWrapper(Local<Value> value) {
  if (value.IsEmpty() || (!value->IsObject() && !value->IsNull())) {
    return false;
  }

  // allow passing nulls when a WinRT wrapped object is expected
  if (value->IsNull()) {
    return true;
  }

  if (NodeRT::OpaqueWrapper::IsOpaqueWrapper(value)) {
    return true;
  }

  Local<Value> hiddenVal =
      GetHiddenValue(Nan::To<Object>(value).ToLocalChecked(),
                     Nan::New<String>("__winRtInstance__").ToLocalChecked());

  return (!hiddenVal.IsEmpty() && hiddenVal->IsTrue());
}

void SetHiddenValue(Local<Object> obj,
                    Local<String> symbol,
                    Local<Primitive> data) {
  Nan::ForceSet(obj, symbol, data,
                static_cast<PropertyAttribute>(v8::ReadOnly & v8::DontEnum));
}

void SetHiddenValueWithObject(Local<Object> obj,
                              Local<String> symbol,
                              Local<Object> data) {
  Nan::ForceSet(obj, symbol, data,
                static_cast<PropertyAttribute>(v8::ReadOnly & v8::DontEnum));
}

Local<Value> GetHiddenValue(Local<Object> obj, Local<String> symbol) {
  return Nan::Get(obj, symbol).ToLocalChecked();
}

::Windows::Foundation::TimeSpan TimeSpanFromMilli(int64_t millis) {
  ::Windows::Foundation::TimeSpan timeSpan;
  timeSpan.Duration = millis * 10000;

  return timeSpan;
}

::Windows::Foundation::DateTime DateTimeFromJSDate(Local<Value> value) {
  ::Windows::Foundation::DateTime time;
  time.UniversalTime = 0;
  if (value->IsDate()) {
    // 116444736000000000 = The time in 100 nanoseconds between 1/1/1970(UTC) to
    // 1/1/1601(UTC) ux_time = (Current time since 1601 in 100 nano sec
    // units)/10000 - 116444736000000000;
    time.UniversalTime = value->IntegerValue(Nan::GetCurrentContext()).FromMaybe(0) * 10000 + 116444736000000000;
  }

  return time;
}

Local<Date> DateTimeToJS(::Windows::Foundation::DateTime value) {
  // 116444736000000000 = The time 100 nanoseconds between 1/1/1970(UTC) to
  // 1/1/1601(UTC) ux_time = (Current time since 1601 in 100 nano sec
  // units)/10000 - 11644473600000;
  return Nan::New<Date>(value.UniversalTime / 10000.0 - 11644473600000)
      .ToLocalChecked();
}

bool StrToGuid(Local<Value> value, LPCLSID guid) {
  if (value.IsEmpty() || !value->IsString()) {
    return false;
  }

  v8::String::Value stringVal(v8::Isolate::GetCurrent(), value);
  std::wstring guidStr(L"{");
  guidStr += StringToWchar(stringVal);
  guidStr += L"}";

  HRESULT hr = CLSIDFromString(guidStr.c_str(), guid);
  if (FAILED(hr)) {
    return false;
  }

  return true;
}

bool IsGuid(Local<Value> value) {
  GUID guid;
  return StrToGuid(value, &guid);
}

::Platform::Guid GuidFromJs(Local<Value> value) {
  GUID guid;
  if (!StrToGuid(value, &guid)) {
    return ::Platform::Guid();
  }

  return ::Platform::Guid(guid);
}

Local<String> GuidToJs(::Platform::Guid guid) {
  OLECHAR* bstrGuid;
  StringFromCLSID(guid, &bstrGuid);

  Local<String> strVal = NewString(bstrGuid);
  CoTaskMemFree(bstrGuid);
  return strVal;
}

Local<Object> ColorToJs(::Windows::UI::Color color) {
  EscapableHandleScope scope;
  Local<Object> obj = Nan::New<Object>();

  Nan::Set(obj, Nan::New<String>("G").ToLocalChecked(),
           Nan::New<Integer>(color.G));
  Nan::Set(obj, Nan::New<String>("B").ToLocalChecked(),
           Nan::New<Integer>(color.B));
  Nan::Set(obj, Nan::New<String>("A").ToLocalChecked(),
           Nan::New<Integer>(color.A));
  Nan::Set(obj, Nan::New<String>("R").ToLocalChecked(),
           Nan::New<Integer>(color.R));

  return scope.Escape(obj);
}

::Windows::UI::Color ColorFromJs(Local<Value> value) {
  ::Windows::UI::Color retVal = ::Windows::UI::Colors::Black;
  if (!value->IsObject()) {
    Nan::ThrowError(Nan::Error(
        NodeRT::Utils::NewString(L"Value to set is of unexpected type")));
    return retVal;
  }

  Local<Object> obj = Nan::To<Object>(value).ToLocalChecked();
  if (!Nan::Has(obj, Nan::New<String>("G").ToLocalChecked()).FromMaybe(false)) {
    retVal.G = static_cast<unsigned char>(
        Nan::To<uint32_t>(Nan::Get(obj, Nan::New<String>("G").ToLocalChecked())
                              .ToLocalChecked())
            .FromMaybe(0));
  }

  if (!Nan::Has(obj, Nan::New<String>("A").ToLocalChecked()).FromMaybe(false)) {
    retVal.G = static_cast<unsigned char>(
        Nan::To<uint32_t>(Nan::Get(obj, Nan::New<String>("A").ToLocalChecked())
                              .ToLocalChecked())
            .FromMaybe(0));
  }

  if (!Nan::Has(obj, Nan::New<String>("B").ToLocalChecked()).FromMaybe(false)) {
    retVal.G = static_cast<unsigned char>(
        Nan::To<uint32_t>(Nan::Get(obj, Nan::New<String>("B").ToLocalChecked())
                              .ToLocalChecked())
            .FromMaybe(0));
  }

  if (!Nan::Has(obj, Nan::New<String>("R").ToLocalChecked()).FromMaybe(false)) {
    retVal.G = static_cast<unsigned char>(
        Nan::To<uint32_t>(Nan::Get(obj, Nan::New<String>("R").ToLocalChecked())
                              .ToLocalChecked())
            .FromMaybe(0));
  }

  return retVal;
}

bool IsColor(Local<Value> value) {
  if (!value->IsObject()) {
    return false;
  }

  Local<Object> obj = Nan::To<Object>(value).ToLocalChecked();
  if (!Nan::Has(obj, Nan::New<String>("G").ToLocalChecked()).FromMaybe(false)) {
    return false;
  }

  if (!Nan::Has(obj, Nan::New<String>("A").ToLocalChecked()).FromMaybe(false)) {
    return false;
  }

  if (!Nan::Has(obj, Nan::New<String>("B").ToLocalChecked()).FromMaybe(false)) {
    return false;
  }

  if (!Nan::Has(obj, Nan::New<String>("R").ToLocalChecked()).FromMaybe(false)) {
    return false;
  }

  return true;
}

Local<Object> RectToJs(::Windows::Foundation::Rect rect) {
  EscapableHandleScope scope;
  Local<Object> obj = Nan::New<Object>();

  Nan::Set(obj, Nan::New<String>("bottom").ToLocalChecked(),
           Nan::New<Number>(rect.Bottom));
  Nan::Set(obj, Nan::New<String>("height").ToLocalChecked(),
           Nan::New<Number>(rect.Height));
  Nan::Set(obj, Nan::New<String>("left").ToLocalChecked(),
           Nan::New<Number>(rect.Left));
  Nan::Set(obj, Nan::New<String>("right").ToLocalChecked(),
           Nan::New<Number>(rect.Right));
  Nan::Set(obj, Nan::New<String>("top").ToLocalChecked(),
           Nan::New<Number>(rect.Top));
  Nan::Set(obj, Nan::New<String>("width").ToLocalChecked(),
           Nan::New<Number>(rect.Width));
  Nan::Set(obj, Nan::New<String>("x").ToLocalChecked(),
           Nan::New<Number>(rect.X));
  Nan::Set(obj, Nan::New<String>("y").ToLocalChecked(),
           Nan::New<Number>(rect.Y));

  return scope.Escape(obj);
}

::Windows::Foundation::Rect RectFromJs(Local<Value> value) {
  ::Windows::Foundation::Rect rect = ::Windows::Foundation::Rect::Empty;

  if (!value->IsObject()) {
    Nan::ThrowError(Nan::Error(
        NodeRT::Utils::NewString(L"Value to set is of unexpected type")));
    return rect;
  }

  Local<Object> obj = Nan::To<Object>(value).ToLocalChecked();

  if (Nan::Has(obj, Nan::New<String>("x").ToLocalChecked()).FromMaybe(false)) {
    rect.X = static_cast<float>(
        Nan::To<double>(Nan::Get(obj, Nan::New<String>("x").ToLocalChecked())
                            .ToLocalChecked())
            .FromMaybe(0.0));
  }

  if (Nan::Has(obj, Nan::New<String>("y").ToLocalChecked()).FromMaybe(false)) {
    rect.Y = static_cast<float>(
        Nan::To<double>(Nan::Get(obj, Nan::New<String>("y").ToLocalChecked())
                            .ToLocalChecked())
            .FromMaybe(0.0));
  }

  if (Nan::Has(obj, Nan::New<String>("height").ToLocalChecked())
          .FromMaybe(false)) {
    rect.Height = static_cast<float>(
        Nan::To<double>(
            Nan::Get(obj, Nan::New<String>("height").ToLocalChecked())
                .ToLocalChecked())
            .FromMaybe(0.0));
  }

  if (Nan::Has(obj, Nan::New<String>("width").ToLocalChecked())
          .FromMaybe(false)) {
    rect.Width = static_cast<float>(
        Nan::To<double>(
            Nan::Get(obj, Nan::New<String>("width").ToLocalChecked())
                .ToLocalChecked())
            .FromMaybe(0.0));
  }

  return rect;
}

bool IsRect(Local<Value> value) {
  if (!value->IsObject()) {
    return false;
  }

  Local<Object> obj = Nan::To<Object>(value).ToLocalChecked();

  if (!Nan::Has(obj, Nan::New<String>("x").ToLocalChecked()).FromMaybe(false)) {
    return false;
  }

  if (!Nan::Has(obj, Nan::New<String>("y").ToLocalChecked()).FromMaybe(false)) {
    return false;
  }

  if (!Nan::Has(obj, Nan::New<String>("height").ToLocalChecked())
           .FromMaybe(false)) {
    return false;
  }

  if (!Nan::Has(obj, Nan::New<String>("width").ToLocalChecked())
           .FromMaybe(false)) {
    return false;
  }

  return true;
}

Local<Object> PointToJs(::Windows::Foundation::Point point) {
  EscapableHandleScope scope;
  Local<Object> obj = Nan::New<Object>();

  Nan::Set(obj, Nan::New<String>("x").ToLocalChecked(),
           Nan::New<Number>(point.X));
  Nan::Set(obj, Nan::New<String>("y").ToLocalChecked(),
           Nan::New<Number>(point.Y));

  return scope.Escape(obj);
}

::Windows::Foundation::Point PointFromJs(Local<Value> value) {
  ::Windows::Foundation::Point point(0, 0);

  if (!value->IsObject()) {
    Nan::ThrowError(Nan::Error(
        NodeRT::Utils::NewString(L"Value to set is of unexpected type")));
    return point;
  }

  Local<Object> obj = Nan::To<Object>(value).ToLocalChecked();

  if (Nan::Has(obj, Nan::New<String>("x").ToLocalChecked()).FromMaybe(false)) {
    point.X = static_cast<float>(
        Nan::To<double>(Nan::Get(obj, Nan::New<String>("x").ToLocalChecked())
                            .ToLocalChecked())
            .FromMaybe(0.0));
  }

  if (Nan::Has(obj, Nan::New<String>("y").ToLocalChecked()).FromMaybe(false)) {
    point.Y = static_cast<float>(
        Nan::To<double>(Nan::Get(obj, Nan::New<String>("y").ToLocalChecked())
                            .ToLocalChecked())
            .FromMaybe(0.0));
  }

  return point;
}

bool IsPoint(Local<Value> value) {
  if (!value->IsObject()) {
    return false;
  }

  Local<Object> obj = Nan::To<Object>(value).ToLocalChecked();

  if (!Nan::Has(obj, Nan::New<String>("x").ToLocalChecked()).FromMaybe(false)) {
    return false;
  }

  if (!Nan::Has(obj, Nan::New<String>("y").ToLocalChecked()).FromMaybe(false)) {
    return false;
  }

  return true;
}

Local<Object> SizeToJs(::Windows::Foundation::Size size) {
  EscapableHandleScope scope;
  Local<Object> obj = Nan::New<Object>();

  Nan::Set(obj, Nan::New<String>("height").ToLocalChecked(),
           Nan::New<Number>(size.Height));
  Nan::Set(obj, Nan::New<String>("width").ToLocalChecked(),
           Nan::New<Number>(size.Width));

  return scope.Escape(obj);
}

::Windows::Foundation::Size SizeFromJs(Local<Value> value) {
  ::Windows::Foundation::Size size(0, 0);

  if (!value->IsObject()) {
    Nan::ThrowError(Nan::Error(
        NodeRT::Utils::NewString(L"Value to set is of unexpected type")));
    return size;
  }

  Local<Object> obj = Nan::To<Object>(value).ToLocalChecked();

  if (Nan::Has(obj, Nan::New<String>("height").ToLocalChecked())
          .FromMaybe(false)) {
    size.Height = static_cast<float>(
        Nan::To<double>(
            Nan::Get(obj, Nan::New<String>("height").ToLocalChecked())
                .ToLocalChecked())
            .FromMaybe(0.0));
  }

  if (Nan::Has(obj, Nan::New<String>("width").ToLocalChecked())
          .FromMaybe(false)) {
    size.Width = static_cast<float>(
        Nan::To<double>(
            Nan::Get(obj, Nan::New<String>("width").ToLocalChecked())
                .ToLocalChecked())
            .FromMaybe(0.0));
  }

  return size;
}

bool IsSize(Local<Value> value) {
  if (!value->IsObject()) {
    return false;
  }

  Local<Object> obj = Nan::To<Object>(value).ToLocalChecked();

  if (!Nan::Has(obj, Nan::New<String>("height").ToLocalChecked())
           .FromMaybe(false)) {
    return false;
  }

  if (!Nan::Has(obj, Nan::New<String>("width").ToLocalChecked())
           .FromMaybe(false)) {
    return false;
  }

  return true;
}

wchar_t GetFirstChar(Local<Value> value) {
  wchar_t retVal = 0;

  if (!value->IsString()) {
    return retVal;
  }

  Local<String> str = Nan::To<String>(value).ToLocalChecked();
  if (str->Length() == 0) {
    return retVal;
  }

  String::Value val(v8::Isolate::GetCurrent(), str);
  retVal = (*val)[0];
  return retVal;
}

Local<String> JsStringFromChar(wchar_t value) {
  wchar_t str[2];
  str[0] = value;
  str[1] = L'\0';

  return NewString(str);
}

::Windows::Foundation::HResult HResultFromJsInt32(int32_t value) {
  ::Windows::Foundation::HResult res;
  res.Value = value;
  return res;
}

}  // namespace Utils
}  // namespace NodeRT
