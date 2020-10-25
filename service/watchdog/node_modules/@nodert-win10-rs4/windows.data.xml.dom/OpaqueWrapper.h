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

#include <node.h>
#include <v8.h>
#include <string>
#include "NodeRTUtils.h"
#include "WrapperBase.h"
#include "nan.h"
#include "nan_object_wrap.h"

namespace NodeRT {
class OpaqueWrapperInitializer;

v8::Local<v8::Value> CreateOpaqueWrapper(::Platform::Object ^ wintRtHandle);

class OpaqueWrapper : public WrapperBase {
 public:
  virtual ::Platform::Object ^ GetObjectInstance() const override {
    return _instance;
  }

  static bool IsOpaqueWrapper(v8::Local<v8::Value> value) {
    if (value.IsEmpty() || !value->IsObject()) {
      return false;
    }

    v8::Local<v8::Value> hiddenVal = NodeRT::Utils::GetHiddenValue(
        value.As<v8::Object>(),
        Nan::New<v8::String>("__winrtOpaqueWrapper__").ToLocalChecked());

    if (hiddenVal.IsEmpty() || !hiddenVal->IsBoolean()) {
      return false;
    }

    return hiddenVal->IsTrue();
  }

 private:
  OpaqueWrapper(::Platform::Object ^ instance) : _instance(instance) {}

  static void New(Nan::NAN_METHOD_ARGS_TYPE info);
  static void Init();

 private:
  ::Platform::Object ^ _instance;
  static Nan::Persistent<v8::FunctionTemplate> s_constructorTemplate;

  friend OpaqueWrapperInitializer;
  friend v8::Local<v8::Value> CreateOpaqueWrapper(::Platform::Object ^
                                                  wintRtInstance);
};
}  // namespace NodeRT
