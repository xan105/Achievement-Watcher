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

#pragma once

#include <v8.h>
#include "nan.h"

#define WCHART_NOT_BUILTIN_IN_NODE 1

namespace NodeRT {
namespace Utils {

v8::Local<v8::Value> WinRtExceptionToJsError(Platform::Exception ^ exception);

void ThrowWinRtExceptionInJs(Platform::Exception ^ exception);

// creates an object with the following structure:
// {
//    "callback" : [callback function]
//    "domain" : [the domain in which the async function/event was
//    called/registered] (this is optional)
// }
v8::Local<v8::Object> CreateCallbackObjectInDomain(
    v8::Local<v8::Function> callback);

// Calls the callback in the appropriate domwin, expects an object in the
// following format:
// {
//    "callback" : [callback fuction]
//    "domain" : [the domain in which the async function/event was
//    called/registered] (this is optional)
// }
v8::Local<v8::Value> CallCallbackInDomain(v8::Local<v8::Object> callbackObject,
                                          int argc,
                                          v8::Local<v8::Value> argv[]);

v8::Local<v8::String> NewString(const wchar_t* str);

const wchar_t* StringToWchar(v8::String::Value& str);

::Platform::String ^ V8StringToPlatformString(v8::Local<v8::Value> value);

#ifdef WCHART_NOT_BUILTIN_IN_NODE
// compares 2 strings using a case insensitive comparison
bool CaseInsenstiveEquals(const wchar_t* str1, const uint16_t* str2);
#endif

// compares 2 strings using a case insensitive comparison
bool CaseInsenstiveEquals(const wchar_t* str1, const wchar_t* str2);

// registers the namespace & required object on the global object
void RegisterNameSpace(const char* ns, v8::Local<v8::Value> nsExports);

v8::Local<v8::Value> CreateExternalWinRTObject(const char* ns,
                                               const char* objectName,
                                               ::Platform::Object ^ instance);

bool IsWinRtWrapper(v8::Local<v8::Value> value);

template <class T>
bool IsWinRtWrapperOf(v8::Local<v8::Value> value) {
  if (!IsWinRtWrapper(value)) {
    return false;
  }

  if (value->IsNull()) {
    return true;
  }

  WrapperBase* wrapper =
      Nan::ObjectWrap::Unwrap<WrapperBase>(value.As<v8::Object>());

  if (wrapper->GetObjectInstance() == nullptr) {
    return false;
  }

  try {
    T instance = dynamic_cast<T>(wrapper->GetObjectInstance());
    return (instance != nullptr);
  } catch (...) {
    return false;
  }
}

::Platform::Object ^ GetObjectInstance(v8::Local<v8::Value> value);

void SetHiddenValue(v8::Local<v8::Object> obj,
                    v8::Local<v8::String> symbol,
                    v8::Local<v8::Primitive> data);
void SetHiddenValueWithObject(v8::Local<v8::Object> obj,
                              v8::Local<v8::String> symbol,
                              v8::Local<v8::Object> data);
v8::Local<v8::Value> GetHiddenValue(v8::Local<v8::Object> obj,
                                    v8::Local<v8::String> symbol);

v8::Local<v8::Date> DateTimeToJS(::Windows::Foundation::DateTime value);
::Windows::Foundation::TimeSpan TimeSpanFromMilli(int64_t millis);
::Windows::Foundation::DateTime DateTimeFromJSDate(v8::Local<v8::Value> value);

bool IsGuid(v8::Local<v8::Value> value);
::Platform::Guid GuidFromJs(v8::Local<v8::Value> value);
v8::Local<v8::String> GuidToJs(::Platform::Guid guid);

v8::Local<v8::Object> ColorToJs(::Windows::UI::Color color);
::Windows::UI::Color ColorFromJs(v8::Local<v8::Value> value);
bool IsColor(v8::Local<v8::Value> value);

v8::Local<v8::Object> RectToJs(::Windows::Foundation::Rect rect);
::Windows::Foundation::Rect RectFromJs(v8::Local<v8::Value> value);
bool IsRect(v8::Local<v8::Value> value);

v8::Local<v8::Object> PointToJs(::Windows::Foundation::Point point);
::Windows::Foundation::Point PointFromJs(v8::Local<v8::Value> value);
bool IsPoint(v8::Local<v8::Value> value);

v8::Local<v8::Object> SizeToJs(::Windows::Foundation::Size size);
::Windows::Foundation::Size SizeFromJs(v8::Local<v8::Value> value);
bool IsSize(v8::Local<v8::Value> value);

wchar_t GetFirstChar(v8::Local<v8::Value> value);
v8::Local<v8::String> JsStringFromChar(wchar_t value);

::Windows::Foundation::HResult HResultFromJsInt32(int32_t value);

}  // namespace Utils
}  // namespace NodeRT