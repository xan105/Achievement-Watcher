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
// See the Apache Version 2.0 License for specific language governing permissions
// and limitations under the License.

#include "OpaqueWrapper.h"
#include "NodeRtUtils.h"

using v8::String;
using v8::FunctionTemplate;

Nan::Persistent<v8::FunctionTemplate> NodeRT::OpaqueWrapper::s_constructorTemplate;

void NodeRT::OpaqueWrapper::New(Nan::NAN_METHOD_ARGS_TYPE info)
{
  NodeRT::Utils::SetHiddenValue(info.This(), Nan::New<String>("__winrtOpaqueWrapper__").ToLocalChecked(), Nan::True());

  info.GetReturnValue().Set(info.This());
}


void  NodeRT::OpaqueWrapper::Init()
{
  Nan::HandleScope scope;
  // Prepare constructor template
  s_constructorTemplate.Reset(Nan::New<FunctionTemplate>(New));
  v8::Local<v8::FunctionTemplate> localRef = Nan::New<FunctionTemplate>(s_constructorTemplate);
  localRef->SetClassName(Nan::New<String>("OpaqueWrapper").ToLocalChecked());
  localRef->InstanceTemplate()->SetInternalFieldCount(1);
}

namespace NodeRT {
  v8::Local<v8::Value> CreateOpaqueWrapper(::Platform::Object^ winRtInstance)
  {
    Nan::EscapableHandleScope scope;
    if (winRtInstance == nullptr)
    {
      return scope.Escape(Nan::Undefined());
    }

    v8::Local<v8::Value> args[] = { Nan::Undefined() };
    if (OpaqueWrapper::s_constructorTemplate.IsEmpty())
    {
      OpaqueWrapper::Init();
    }

	  v8::Local<FunctionTemplate> localRef = Nan::New<FunctionTemplate>(OpaqueWrapper::s_constructorTemplate);
    v8::Local<v8::Object> objectInstance = Nan::NewInstance(Nan::GetFunction(localRef).ToLocalChecked(), 0, args).ToLocalChecked();
    if (objectInstance.IsEmpty())
    {
      return scope.Escape(Nan::Undefined());
    }
    OpaqueWrapper* wrapperInstance = new OpaqueWrapper(winRtInstance);
    wrapperInstance->Wrap(objectInstance);
    return scope.Escape(objectInstance);
  }
}

