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
#include "NodeRtUtils.h"
#include "OpaqueWrapper.h"
#include "WrapperBase.h"
#include "nan.h"

#include <functional>

namespace NodeRT {
namespace Collections {

using Nan::False;
using Nan::HandleScope;
using Nan::MaybeLocal;
using Nan::Null;
using Nan::Persistent;
using Nan::True;
using Nan::Undefined;
using v8::Boolean;
using v8::FunctionTemplate;
using v8::Integer;
using v8::Local;
using v8::String;
using v8::Value;

template <class T>
class ArrayWrapper : NodeRT::WrapperBase {
 public:
  static void Init() {
    EscapableHandleScope scope;

    Local<FunctionTemplate> localRef = Nan::New<FunctionTemplate>(New);
    s_constructorTemplate.Reset(localRef);

    localRef->SetClassName(
        Nan::New<String>("Windows::Foundation::Array").ToLocalChecked());
    localRef->InstanceTemplate()->SetInternalFieldCount(1);
    Nan::SetIndexedPropertyHandler(localRef->InstanceTemplate(), Get, Set);

    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("length").ToLocalChecked(), LengthGetter);

    return;
  }

  static Local<Value> CreateArrayWrapper(
      ::Platform::Array<T> ^ winRtInstance,
      const std::function<Local<Value>(T)>& getterFunc = nullptr,
      const std::function<bool(Local<Value>)>& checkTypeFunc = nullptr,
      const std::function<T(Local<Value>)>& convertToTypeFunc = nullptr) {
    EscapableHandleScope scope;
    if (winRtInstance == nullptr) {
      return scope.Escape(Undefined());
    }

    if (s_constructorTemplate.IsEmpty()) {
      Init();
    }

    v8::Local<Value> args[] = {Undefined()};
    Local<FunctionTemplate> localRef =
        Nan::New<FunctionTemplate>(s_constructorTemplate);
    Local<Object> objectInstance =
        Nan::NewInstance(Nan::GetFunction(localRef).ToLocalChecked(), 0, args)
            .ToLocalChecked();
    if (objectInstance.IsEmpty()) {
      return scope.Escape(Undefined());
    }

    ArrayWrapper<T>* wrapperInstance = new ArrayWrapper<T>(
        winRtInstance, getterFunc, checkTypeFunc, convertToTypeFunc);
    wrapperInstance->Wrap(objectInstance);
    return scope.Escape(objectInstance);
  }

  virtual ::Platform::Object ^ GetObjectInstance() const override {
    return _instance;
  }

 private:
  ArrayWrapper(
      ::Platform::Array<T> ^ winRtInstance,
      const std::function<Local<Value>(T)>& getterFunc,
      const std::function<bool(Local<Value>)>& checkTypeFunc = nullptr,
      const std::function<T(Local<Value>)>& convertToTypeFunc = nullptr)
      : _instance(winRtInstance),
        _getterFunc(getterFunc),
        _checkTypeFunc(checkTypeFunc),
        _convertToTypeFunc(convertToTypeFunc) {}

  static void New(Nan::NAN_METHOD_ARGS_TYPE info) {
    NodeRT::Utils::SetHiddenValue(
        info.This(), Nan::New<String>("__winRtInstance__").ToLocalChecked(),
        True());

    info.GetReturnValue().Set(info.This());
  }

  static void LengthGetter(Local<String> property,
                           const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<::Platform::Array<T> ^>(info.This())) {
      return;
    }

    ArrayWrapper<T>* wrapper =
        ArrayWrapper<T>::Unwrap<ArrayWrapper<T>>(info.This());

    try {
      unsigned int result = wrapper->_instance->Length;
      info.GetReturnValue().Set(Nan::New<Integer>(result));
    } catch (Platform::Exception ^ exception) {
      NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
      return;
    }
  }

  static void Get(uint32_t index,
                  const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<::Platform::Array<T> ^>(info.This())) {
      return;
    }

    ArrayWrapper<T>* wrapper =
        ArrayWrapper<T>::Unwrap<ArrayWrapper<T>>(info.This());

    if (wrapper->_instance->Length <= index) {
      return;
    }

    if (wrapper->_getterFunc == nullptr) {
      info.GetReturnValue().Set(CreateOpaqueWrapper(wrapper->_instance[index]));
    } else {
      info.GetReturnValue().Set(
          wrapper->_getterFunc(wrapper->_instance[index]));
    }
  }

  static void Set(uint32_t index,
                  Local<Value> value,
                  const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<::Platform::Array<T> ^>(info.This())) {
      return;
    }

    ArrayWrapper<T>* wrapper =
        ArrayWrapper<T>::Unwrap<ArrayWrapper<T>>(info.This());

    if (wrapper->_checkTypeFunc && !wrapper->_checkTypeFunc(value)) {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"The argument to set isn't of the expected type or internal WinRt "
          L"object was disposed")));
      return;
    }

    if (wrapper->_instance->Length <= index) {
      Nan::ThrowError(Nan::Error(
          NodeRT::Utils::NewString(L"Given index exceeded array length")));
      return;
    }

    if (wrapper->_convertToTypeFunc) {
      try {
        wrapper->_instance[index] = wrapper->_convertToTypeFunc(value);
      } catch (::Platform::Exception ^ e) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(e);
      }
    }

    return;
  }

 private:
  ::Platform::Array<T> ^ _instance;
  std::function<Local<Value>(T)> _getterFunc;
  std::function<bool(Local<Value>)> _checkTypeFunc;
  std::function<T(Local<Value>)> _convertToTypeFunc;
  static Persistent<FunctionTemplate> s_constructorTemplate;
};

template <class T>
Persistent<FunctionTemplate> ArrayWrapper<T>::s_constructorTemplate;

template <class T>
class IteratorWrapper : NodeRT::WrapperBase {
 public:
  static void Init() {
    HandleScope scope;

    Local<FunctionTemplate> localRef = Nan::New<FunctionTemplate>(New);
    s_constructorTemplate.Reset(localRef);
    localRef->SetClassName(
        Nan::New<String>("Windows::Foundation::Collections:IIterator")
            .ToLocalChecked());
    localRef->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(localRef, "getMany", GetMany);
    Nan::SetPrototypeMethod(localRef, "moveNext", MoveNext);

    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("current").ToLocalChecked(),
                     CurrentGetter);
    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("hasCurrent").ToLocalChecked(),
                     HasCurrentGetter);

    return;
  }

  static Local<Value> CreateIteratorWrapper(
      ::Windows::Foundation::Collections::IIterator<T> ^ winRtInstance,
      const std::function<Local<Value>(T)>& getterFunc = nullptr) {
    EscapableHandleScope scope;
    if (winRtInstance == nullptr) {
      return scope.Escape(Undefined());
    }

    if (s_constructorTemplate.IsEmpty()) {
      Init();
    }

    v8::Local<Value> args[] = {Undefined()};
    Local<FunctionTemplate> localRef =
        Nan::New<FunctionTemplate>(s_constructorTemplate);
    Local<Object> objectInstance =
        Nan::NewInstance(Nan::GetFunction(localRef).ToLocalChecked(), 0, args)
            .ToLocalChecked();
    if (objectInstance.IsEmpty()) {
      return scope.Escape(Undefined());
    }

    IteratorWrapper<T>* wrapperInstance =
        new IteratorWrapper<T>(winRtInstance, getterFunc);
    wrapperInstance->Wrap(objectInstance);
    return scope.Escape(objectInstance);
  }

  virtual ::Platform::Object ^ GetObjectInstance() const override {
    return _instance;
  }

 private:
  IteratorWrapper(::Windows::Foundation::Collections::IIterator<T> ^
                      winRtInstance,
                  const std::function<Local<Value>(T)>& getterFunc)
      : _instance(winRtInstance), _getterFunc(getterFunc) {}

  static void New(Nan::NAN_METHOD_ARGS_TYPE info) {
    NodeRT::Utils::SetHiddenValue(
        info.This(), Nan::New<String>("__winRtInstance__").ToLocalChecked(),
        True());
    info.GetReturnValue().Set(info.This());
  }

  static void MoveNext(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IIterator<T> ^>(info.This())) {
      return;
    }

    IteratorWrapper<T>* wrapper =
        IteratorWrapper<T>::Unwrap<IteratorWrapper<T>>(info.This());

    if (info.Length() == 0) {
      try {
        bool result;
        result = wrapper->_instance->MoveNext();
        info.GetReturnValue().Set(Nan::New<Boolean>(result));
        return;
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }
  }

  // Not supporting this for now since we need to initialize the array ourselves
  // and don't know which size to use
  static void GetMany(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;
    Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(L"Not implemented")));
    return;
  }

  static void CurrentGetter(Local<String> property,
                            const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IIterator<T> ^>(info.This())) {
      return;
    }

    IteratorWrapper<T>* wrapper =
        IteratorWrapper<T>::Unwrap<IteratorWrapper<T>>(info.This());

    try {
      T current = wrapper->_instance->Current;

      if (wrapper->_getterFunc != nullptr) {
        info.GetReturnValue().Set(wrapper->_getterFunc(current));
      } else {
        info.GetReturnValue().Set(CreateOpaqueWrapper(current));
      }
    } catch (Platform::Exception ^ exception) {
      NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
      return;
    }
  }

  static void HasCurrentGetter(
      Local<String> property,
      const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IIterator<T> ^>(info.This())) {
      return;
    }

    IteratorWrapper<T>* wrapper =
        IteratorWrapper<T>::Unwrap<IteratorWrapper<T>>(info.This());

    try {
      bool result = wrapper->_instance->HasCurrent;
      info.GetReturnValue().Set(Nan::New<Boolean>(result));
    } catch (Platform::Exception ^ exception) {
      NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
      return;
    }
  }

 private:
  ::Windows::Foundation::Collections::IIterator<T> ^ _instance;
  std::function<Local<Value>(T)> _getterFunc;
  static Persistent<FunctionTemplate> s_constructorTemplate;
};

template <class T>
class IterableWrapper : NodeRT::WrapperBase {
 public:
  static void Init() {
    HandleScope scope;

    Local<FunctionTemplate> localRef = Nan::New<FunctionTemplate>(New);
    s_constructorTemplate.Reset(localRef);
    localRef->SetClassName(
        Nan::New<String>("Windows::Foundation::Collections:IIterable")
            .ToLocalChecked());
    localRef->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(localRef, "first", First);

    return;
  }

  static Local<Value> CreateIterableWrapper(
      ::Windows::Foundation::Collections::IIterable<T> ^ winRtInstance,
      const std::function<Local<Value>(T)>& getterFunc = nullptr) {
    EscapableHandleScope scope;
    if (winRtInstance == nullptr) {
      return scope.Escape(Undefined());
    }

    if (s_constructorTemplate.IsEmpty()) {
      Init();
    }

    v8::Local<Value> args[] = {Undefined()};
    Local<FunctionTemplate> localRef =
        Nan::New<FunctionTemplate>(s_constructorTemplate);
    Local<Object> objectInstance =
        Nan::NewInstance(Nan::GetFunction(localRef).ToLocalChecked(), 0, args)
            .ToLocalChecked();

    if (objectInstance.IsEmpty()) {
      return scope.Escape(Undefined());
    }

    IterableWrapper<T>* wrapperInstance =
        new IterableWrapper<T>(winRtInstance, getterFunc);
    wrapperInstance->Wrap(objectInstance);
    return scope.Escape(objectInstance);
  }

  virtual ::Platform::Object ^ GetObjectInstance() const override {
    return _instance;
  }

 private:
  IterableWrapper(::Windows::Foundation::Collections::IIterable<T> ^
                      winRtInstance,
                  const std::function<Local<Value>(T)>& getterFunc)
      : _instance(winRtInstance), _getterFunc(getterFunc) {}

  static void New(Nan::NAN_METHOD_ARGS_TYPE info) {
    NodeRT::Utils::SetHiddenValue(
        info.This().Nan::New<String>("__winRtInstance__").ToLocalChecked(),
        True());
    info.GetReturnValue().Set(info.This());
  }

  static void First(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IIterable<T> ^>(info.This())) {
      return;
    }

    IterableWrapper<T>* wrapper =
        IterableWrapper<T>::Unwrap<IterableWrapper<T>>(info.This());

    if (info.Length() == 0) {
      try {
        ::Windows::Foundation::Collections::IIterator<T> ^ result =
            wrapper->_instance->First();

        info.GetReturnValue().Set(IteratorWrapper<T>::CreateIteratorWrapper(
            result, wrapper->_getterFunc));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

 private:
  ::Windows::Foundation::Collections::IIterable<T> ^ _instance;
  std::function<Local<Value>(T)> _getterFunc;
  static Persistent<FunctionTemplate> s_constructorTemplate;
};

template <class T>
Persistent<FunctionTemplate> IterableWrapper<T>::s_constructorTemplate;

template <class T>
Persistent<FunctionTemplate> IteratorWrapper<T>::s_constructorTemplate;

template <class T>
class VectorViewWrapper : NodeRT::WrapperBase {
 public:
  static void Init() {
    HandleScope scope;

    Local<FunctionTemplate> localRef = Nan::New<FunctionTemplate>(New);
    s_constructorTemplate.Reset(localRef);
    localRef->SetClassName(
        Nan::New<String>("Windows::Foundation::Collections:IVectorView")
            .ToLocalChecked());
    localRef->InstanceTemplate()->SetInternalFieldCount(1);
    Nan::SetIndexedPropertyHandler(localRef->InstanceTemplate(), Get);

    Nan::SetPrototypeMethod(localRef, "getMany", GetMany);
    Nan::SetPrototypeMethod(localRef, "getAt", GetAt);
    Nan::SetPrototypeMethod(localRef, "indexOf", IndexOf);
    Nan::SetPrototypeMethod(localRef, "first", First);

    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("size").ToLocalChecked(), SizeGetter);
    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("length").ToLocalChecked(), SizeGetter);

    return;
  }

  static Local<Value> CreateVectorViewWrapper(
      ::Windows::Foundation::Collections::IVectorView<T> ^ winRtInstance,
      const std::function<Local<Value>(T)>& getterFunc,
      const std::function<bool(Local<Value>)>& checkTypeFunc = nullptr,
      const std::function<T(Local<Value>)>& convertToTypeFunc = nullptr) {
    EscapableHandleScope scope;
    if (winRtInstance == nullptr) {
      return scope.Escape(Undefined());
    }

    if (s_constructorTemplate.IsEmpty()) {
      Init();
    }

    v8::Local<Value> args[] = {Undefined()};
    Local<FunctionTemplate> localRef =
        Nan::New<FunctionTemplate>(s_constructorTemplate);
    Local<Object> objectInstance =
        Nan::NewInstance(Nan::GetFunction(localRef).ToLocalChecked(), 0, args)
            .ToLocalChecked();
    if (objectInstance.IsEmpty()) {
      return scope.Escape(Undefined());
    }

    VectorViewWrapper<T>* wrapperInstance =
        new VectorViewWrapper<T>(winRtInstance, getterFunc);
    wrapperInstance->Wrap(objectInstance);
    return scope.Escape(objectInstance);
  }

  virtual ::Platform::Object ^ GetObjectInstance() const override {
    return _instance;
  }

 private:
  VectorViewWrapper(
      ::Windows::Foundation::Collections::IVectorView<T> ^ winRtInstance,
      const std::function<Local<Value>(T)>& getterFunc,
      const std::function<bool(Local<Value>)>& checkTypeFunc = nullptr,
      const std::function<T(Local<Value>)>& convertToTypeFunc = nullptr)
      : _instance(winRtInstance),
        _getterFunc(getterFunc),
        _checkTypeFunc(checkTypeFunc),
        _convertToTypeFunc(convertToTypeFunc) {}

  static void New(Nan::NAN_METHOD_ARGS_TYPE info) {
    NodeRT::Utils::SetHiddenValue(
        info.This(), Nan::New<String>("__winRtInstance__").ToLocalChecked(),
        True());

    info.GetReturnValue().Set(info.This());
  }

  static void Get(uint32_t index,
                  const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVectorView<T> ^>(
            info.This())) {
      return;
    }

    VectorViewWrapper<T>* wrapper =
        VectorViewWrapper<T>::Unwrap<VectorViewWrapper<T>>(info.This());

    if (wrapper->_instance->Size <= index) {
      return;
    }

    if (wrapper->_getterFunc == nullptr) {
      info.GetReturnValue().Set(
          CreateOpaqueWrapper(wrapper->_instance->GetAt(index)));
    } else {
      info.GetReturnValue().Set(
          wrapper->_getterFunc(wrapper->_instance->GetAt(index)));
    }
  }

  static void GetAt(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVectorView<T> ^>(
            info.This())) {
      return;
    }

    VectorViewWrapper<T>* wrapper =
        VectorViewWrapper<T>::Unwrap<VectorViewWrapper<T>>(info.This());

    if (info.Length() == 1 && info[0]->IsUint32()) {
      try {
        unsigned int index = info[0]->Uint32Value(Nan::GetCurrentContext()).FromMaybe(0);

        if (index >= wrapper->_instance->Size) {
          return;
        }
        T result;
        result = wrapper->_instance->GetAt(index);

        if (wrapper->_getterFunc) {
          info.GetReturnValue().Set(wrapper->_getterFunc(result));
        }
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void GetMany(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;
    Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(L"Not implemented")));
    return;
  }

  static void First(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVectorView<T> ^>(
            info.This())) {
      return;
    }

    VectorViewWrapper<T>* wrapper =
        VectorViewWrapper<T>::Unwrap<VectorViewWrapper<T>>(info.This());

    if (info.Length() == 0) {
      try {
        info.GetReturnValue().Set(IteratorWrapper<T>::CreateIteratorWrapper(
            wrapper->_instance->First(), wrapper->_getterFunc));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void IndexOf(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVectorView<T> ^>(
            info.This())) {
      return;
    }

    VectorViewWrapper<T>* wrapper =
        VectorViewWrapper<T>::Unwrap<VectorViewWrapper<T>>(info.This());

    if (wrapper->_convertToTypeFunc == nullptr ||
        wrapper->_checkTypeFunc == nullptr) {
      Nan::ThrowError(
          Nan::Error(NodeRT::Utils::NewString(L"Method isn't supported")));
      return;
    }

    if (info.Length() == 1 && wrapper->_checkTypeFunc(info[0])) {
      try {
        T item = wrapper->_convertToTypeFunc(info[0]);

        unsigned int index;
        bool result = wrapper->_instance->IndexOf(item, &index);

        Local<Object> resObj = Nan::New<Object>();
        Nan::Set(resObj, Nan::New<String>("boolean").ToLocalChecked(),
                 Nan::New<v8::Boolean>(result));
        Nan::Set(resObj, Nan::New<String>("index").ToLocalChecked(),
                 Nan::New<v8::Integer>(index));
        info.GetReturnValue().Set(resObj);
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void SizeGetter(Local<String> property,
                         const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVectorView<T> ^>(
            info.This())) {
      return;
    }

    VectorViewWrapper<T>* wrapper =
        VectorViewWrapper<T>::Unwrap<VectorViewWrapper<T>>(info.This());

    try {
      info.GetReturnValue().Set(Nan::New<Integer>(wrapper->_instance->Size));
    } catch (Platform::Exception ^ exception) {
      NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
      return;
    }
  }

 private:
  ::Windows::Foundation::Collections::IVectorView<T> ^ _instance;
  std::function<Local<Value>(T)> _getterFunc;
  std::function<bool(Local<Value>)> _checkTypeFunc;
  std::function<T(Local<Value>)> _convertToTypeFunc;
  static Persistent<FunctionTemplate> s_constructorTemplate;
};

template <class T>
Persistent<FunctionTemplate> VectorViewWrapper<T>::s_constructorTemplate;

template <class T>
class VectorWrapper : NodeRT::WrapperBase {
 public:
  static void Init() {
    HandleScope scope;

    Local<FunctionTemplate> localRef = Nan::New<FunctionTemplate>(New);
    s_constructorTemplate.Reset(localRef);
    localRef->SetClassName(
        Nan::New<String>("Windows::Foundation::Collections:IVector")
            .ToLocalChecked());
    localRef->InstanceTemplate()->SetInternalFieldCount(1);
    Nan::SetIndexedPropertyHandler(localRef->InstanceTemplate(), Get, Set);

    Nan::SetPrototypeMethod(localRef, "getMany", GetMany);
    Nan::SetPrototypeMethod(localRef, "getAt", GetAt);
    Nan::SetPrototypeMethod(localRef, "indexOf", IndexOf);
    Nan::SetPrototypeMethod(localRef, "first", First);
    Nan::SetPrototypeMethod(localRef, "append", Append);
    Nan::SetPrototypeMethod(localRef, "clear", Clear);
    Nan::SetPrototypeMethod(localRef, "getView", GetView);
    Nan::SetPrototypeMethod(localRef, "insertAt", InsertAt);
    Nan::SetPrototypeMethod(localRef, "removeAt", RemoveAt);
    Nan::SetPrototypeMethod(localRef, "removeAtEnd", RemoveAtEnd);
    Nan::SetPrototypeMethod(localRef, "replaceAll", ReplaceAll);
    Nan::SetPrototypeMethod(localRef, "setAt", SetAt);

    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("size").ToLocalChecked(), SizeGetter);
    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("length").ToLocalChecked(), SizeGetter);

    return;
  }

  static Local<Value> CreateVectorWrapper(
      ::Windows::Foundation::Collections::IVector<T> ^ winRtInstance,
      const std::function<Local<Value>(T)>& getterFunc,
      const std::function<bool(Local<Value>)>& checkTypeFunc = nullptr,
      const std::function<T(Local<Value>)>& convertToTypeFunc = nullptr) {
    EscapableHandleScope scope;
    if (winRtInstance == nullptr) {
      return scope.Escape(Undefined());
    }

    if (s_constructorTemplate.IsEmpty()) {
      Init();
    }

    v8::Local<Value> args[] = {Undefined()};
    Local<FunctionTemplate> localRef =
        Nan::New<FunctionTemplate>(s_constructorTemplate);
    Local<Object> objectInstance =
        Nan::NewInstance(Nan::GetFunction(localRef).ToLocalChecked(), 0, args)
            .ToLocalChecked();
    if (objectInstance.IsEmpty()) {
      return scope.Escape(Undefined());
    }

    VectorWrapper<T>* wrapperInstance = new VectorWrapper<T>(
        winRtInstance, getterFunc, checkTypeFunc, convertToTypeFunc);
    wrapperInstance->Wrap(objectInstance);
    return scope.Escape(objectInstance);
  }

  virtual ::Platform::Object ^ GetObjectInstance() const override {
    return _instance;
  }

 private:
  VectorWrapper(
      ::Windows::Foundation::Collections::IVector<T> ^ winRtInstance,
      const std::function<Local<Value>(T)>& getterFunc,
      const std::function<bool(Local<Value>)>& checkTypeFunc = nullptr,
      const std::function<T(Local<Value>)>& convertToTypeFunc = nullptr)
      : _instance(winRtInstance),
        _getterFunc(getterFunc),
        _checkTypeFunc(checkTypeFunc),
        _convertToTypeFunc(convertToTypeFunc) {}

  static void New(Nan::NAN_METHOD_ARGS_TYPE info) {
    NodeRT::Utils::SetHiddenValue(
        info.This(), Nan::New<String>("__winRtInstance__").ToLocalChecked(),
        True());

    info.GetReturnValue().Set(info.This());
  }

  static void Get(uint32_t index,
                  const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (wrapper->_instance->Size <= index) {
      return;
    }

    if (wrapper->_getterFunc == nullptr) {
      info.GetReturnValue().Set(
          CreateOpaqueWrapper(wrapper->_instance->GetAt(index)));
    } else {
      info.GetReturnValue().Set(
          wrapper->_getterFunc(wrapper->_instance->GetAt(index)));
    }
  }

  static void Set(uint32 index,
                  Local<Value> value,
                  const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (!wrapper->_checkTypeFunc(value)) {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"The value to set isn't of the expected type")));
      return;
    }

    try {
      T item = wrapper->_convertToTypeFunc(value);

      wrapper->_instance->SetAt(index, item);
    } catch (Platform::Exception ^ exception) {
      NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
      return;
    }

    return;
  }

  static void Append(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (info.Length() == 1 && wrapper->_checkTypeFunc(info[0])) {
      try {
        T value = wrapper->_convertToTypeFunc(info[0]);

        wrapper->_instance->Append(value);
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void Clear(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (info.Length() == 0) {
      try {
        wrapper->_instance->Clear();
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void GetMany(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;
    Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(L"Not implemented")));
    return;
  }

  static void GetView(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (info.Length() == 0) {
      try {
        ::Windows::Foundation::Collections::IVectorView<T> ^ result =
            wrapper->_instance->GetView();
        info.GetReturnValue().Set(VectorViewWrapper<T>::CreateVectorViewWrapper(
            result, wrapper->_getterFunc, wrapper->_checkTypeFunc,
            wrapper->_convertToTypeFunc));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void InsertAt(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (info.Length() == 2 && info[0]->IsUint32() &&
        wrapper->_checkTypeFunc(info[1])) {
      try {
        unsigned int index = info[0]->Uint32Value(Nan::GetCurrentContext()).FromMaybe(0);

        T value = wrapper->_convertToTypeFunc(info[1]);
        wrapper->_instance->InsertAt(index, value);
        return;
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }
  }

  static void RemoveAt(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (info.Length() == 1 && info[0]->IsUint32()) {
      try {
        unsigned int index = info[0]->Uint32Value(Nan::GetCurrentContext()).FromMaybe(0);

        wrapper->_instance->RemoveAt(index);
        return;
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }
  }

  static void RemoveAtEnd(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (info.Length() == 0) {
      try {
        wrapper->_instance->RemoveAtEnd();
        return;
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }
  }

  static void ReplaceAll(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (info.Length() == 1 &&
        NodeRT::Utils::IsWinRtWrapperOf<::Platform::Array<T> ^>(info[0])) {
      try {
        WrapperBase* itemsWrapper =
            WrapperBase::Unwrap<WrapperBase>(info[0].As<Object>());
        ::Platform::Array<T> ^ items =
            (::Platform::Array<T> ^) itemsWrapper->GetObjectInstance();
        wrapper->_instance->ReplaceAll(items);
        return;
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }
  }

  static void GetAt(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (info.Length() == 1 && info[0]->IsUint32()) {
      try {
        unsigned int index = info[0]->Uint32Value(Nan::GetCurrentContext()).FromMaybe(0);

        if (index >= wrapper->_instance->Size) {
          return;
        }
        T result;
        result = wrapper->_instance->GetAt(index);

        if (wrapper->_getterFunc) {
          info.GetReturnValue().Set(wrapper->_getterFunc(result));
        }
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void SetAt(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (info.Length() == 2 && info[0]->IsUint32() &&
        wrapper->_checkTypeFunc(info[1])) {
      try {
        unsigned int index = info[0]->Uint32Value(Nan::GetCurrentContext()).FromMaybe(0);

        if (index >= wrapper->_instance->Size) {
          return;
        }

        T item = wrapper->_convertToTypeFunc(info[1]);

        wrapper->_instance->SetAt(index, item);
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void First(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (info.Length() == 0) {
      try {
        info.GetReturnValue().Set(IteratorWrapper<T>::CreateIteratorWrapper(
            wrapper->_instance->First(), wrapper->_getterFunc));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void IndexOf(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    if (wrapper->_convertToTypeFunc == nullptr ||
        wrapper->_checkTypeFunc == nullptr) {
      Nan::ThrowError(
          Nan::Error(NodeRT::Utils::NewString(L"Method isn't supported")));
      return;
    }

    if (info.Length() == 1 && wrapper->_checkTypeFunc(info[0])) {
      try {
        T item = wrapper->_convertToTypeFunc(info[0]);

        unsigned int index;
        bool result = wrapper->_instance->IndexOf(item, &index);

        Local<Object> resObj = Nan::New<Object>();
        Nan::Set(resObj, Nan::New<String>("boolean").ToLocalChecked(),
                 Nan::New<Boolean>(result));
        Nan::Set(resObj, Nan::New<String>("index").ToLocalChecked(),
                 Nan::New<Integer>(index));
        info.GetReturnValue().Set(resObj);
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void SizeGetter(Local<String> property,
                         const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IVector<T> ^>(info.This())) {
      return;
    }

    VectorWrapper<T>* wrapper =
        VectorWrapper<T>::Unwrap<VectorWrapper<T>>(info.This());

    try {
      info.GetReturnValue().Set(Nan::New<Integer>(wrapper->_instance->Size));
    } catch (Platform::Exception ^ exception) {
      NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
      return;
    }
  }

 private:
  ::Windows::Foundation::Collections::IVector<T> ^ _instance;
  std::function<Local<Value>(T)> _getterFunc;
  std::function<bool(Local<Value>)> _checkTypeFunc;
  std::function<T(Local<Value>)> _convertToTypeFunc;
  static Persistent<FunctionTemplate> s_constructorTemplate;
};

template <class T>
Persistent<FunctionTemplate> VectorWrapper<T>::s_constructorTemplate;

template <class K, class V>
class KeyValuePairWrapper : NodeRT::WrapperBase {
 public:
  static void Init() {
    HandleScope scope;

    Local<FunctionTemplate> localRef = Nan::New<FunctionTemplate>(New);
    s_constructorTemplate.Reset(localRef);
    localRef->SetClassName(
        Nan::New<String>("Windows::Foundation::Collections:IKeyValuePair")
            .ToLocalChecked());
    localRef->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("key").ToLocalChecked(), KeyGetter);
    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("value").ToLocalChecked(), ValueGetter);

    return;
  }

  static Local<Value> CreateKeyValuePairWrapper(
      ::Windows::Foundation::Collections::IKeyValuePair<K, V> ^ winRtInstance,
      const std::function<Local<Value>(K)>& keyGetterFunc,
      const std::function<Local<Value>(V)>& valueGetterFunc) {
    EscapableHandleScope scope;
    if (winRtInstance == nullptr) {
      return scope.Escape(Undefined());
    }

    if (s_constructorTemplate.IsEmpty()) {
      Init();
    }

    v8::Local<Value> args[] = {Undefined()};
    Local<FunctionTemplate> localRef =
        Nan::New<FunctionTemplate>(s_constructorTemplate);
    Local<Object> objectInstance =
        Nan::NewInstance(Nan::GetFunction(localRef).ToLocalChecked(), 0, args)
            .ToLocalChecked();
    if (objectInstance.IsEmpty()) {
      return scope.Escape(Undefined());
    }

    KeyValuePairWrapper<K, V>* wrapperInstance = new KeyValuePairWrapper<K, V>(
        winRtInstance, keyGetterFunc, valueGetterFunc);
    wrapperInstance->Wrap(objectInstance);
    return scope.Escape(objectInstance);
  }

  virtual ::Platform::Object ^ GetObjectInstance() const override {
    return _instance;
  }

 private:
  KeyValuePairWrapper(::Windows::Foundation::Collections::IKeyValuePair<K, V> ^
                          winRtInstance,
                      const std::function<Local<Value>(K)>& keyGetterFunc,
                      const std::function<Local<Value>(V)>& valueGetterFunc)
      : _instance(winRtInstance),
        _keyGetterFunc(keyGetterFunc),
        _valueGetterFunc(valueGetterFunc) {}

  static void New(Nan::NAN_METHOD_ARGS_TYPE info) {
    NodeRT::Utils::SetHiddenValue(
        info.This(), Nan::New<String>("__winRtInstance__").ToLocalChecked(),
        True());
    info.GetReturnValue().Set(info.This());
  }

  static void KeyGetter(Local<String> property,
                        const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IKeyValuePair<K, V> ^>(
            info.This())) {
      return;
    }

    KeyValuePairWrapper<K, V>* wrapper =
        KeyValuePairWrapper<K, V>::Unwrap<KeyValuePairWrapper<K, V>>(
            info.This());

    try {
      info.GetReturnValue().Set(
          wrapper->_keyGetterFunc(wrapper->_instance->Key));
    } catch (Platform::Exception ^ exception) {
      NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
      return;
    }
  }

  static void ValueGetter(Local<String> property,
                          const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IKeyValuePair<K, V> ^>(
            info.This())) {
      return;
    }

    KeyValuePairWrapper<K, V>* wrapper =
        KeyValuePairWrapper<K, V>::Unwrap<KeyValuePairWrapper<K, V>>(
            info.This());

    try {
      info.GetReturnValue().Set(
          wrapper->_valueGetterFunc(wrapper->_instance->Value));
    } catch (Platform::Exception ^ exception) {
      NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
      return;
    }
  }

 private:
  ::Windows::Foundation::Collections::IKeyValuePair<K, V> ^ _instance;
  std::function<Local<Value>(K)> _keyGetterFunc;
  std::function<Local<Value>(V)> _valueGetterFunc;
  static Persistent<FunctionTemplate> s_constructorTemplate;
};

template <class K, class V>
Persistent<FunctionTemplate> KeyValuePairWrapper<K, V>::s_constructorTemplate;

template <class K, class V>
class MapViewWrapper : NodeRT::WrapperBase {
 public:
  static void Init() {
    HandleScope scope;

    Local<FunctionTemplate> localRef = Nan::New<FunctionTemplate>(New);
    s_constructorTemplate.Reset(localRef);
    localRef->SetClassName(
        Nan::New<String>("Windows::Foundation::Collections:IMapView")
            .ToLocalChecked());
    localRef->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(localRef, "hasKey", HasKey);
    Nan::SetPrototypeMethod(localRef, "lookup", Lookup);
    Nan::SetPrototypeMethod(localRef, "split", Split);
    Nan::SetPrototypeMethod(localRef, "first", First);

    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("size").ToLocalChecked(), SizeGetter);
    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("length").ToLocalChecked(), SizeGetter);

    return;
  }

  static Local<Value> CreateMapViewWrapper(
      ::Windows::Foundation::Collections::IMapView<K, V> ^ winRtInstance,
      const std::function<Local<Value>(K)>& keyGetterFunc,
      const std::function<bool(Local<Value>)>& checkKeyTypeFunc,
      const std::function<K(Local<Value>)>& convertToKeyTypeFunc,
      const std::function<Local<Value>(V)>& valueGetterFunc) {
    EscapableHandleScope scope;
    if (winRtInstance == nullptr) {
      return scope.Escape(Undefined());
    }

    if (s_constructorTemplate.IsEmpty()) {
      Init();
    }

    v8::Local<Value> args[] = {Undefined()};
    Local<FunctionTemplate> localRef =
        Nan::New<FunctionTemplate>(s_constructorTemplate);
    Local<Object> objectInstance =
        Nan::NewInstance(Nan::GetFunction(localRef).ToLocalChecked(), 0, args)
            .ToLocalChecked();
    if (objectInstance.IsEmpty()) {
      return scope.Escape(Undefined());
    }

    MapViewWrapper<K, V>* wrapperInstance =
        new MapViewWrapper<K, V>(winRtInstance, keyGetterFunc, checkKeyTypeFunc,
                                 convertToKeyTypeFunc, valueGetterFunc);
    wrapperInstance->Wrap(objectInstance);
    return scope.Escape(objectInstance);
  }

  virtual ::Platform::Object ^ GetObjectInstance() const override {
    return _instance;
  }

 private:
  MapViewWrapper(::Windows::Foundation::Collections::IMapView<K, V> ^
                     winRtInstance,
                 const std::function<Local<Value>(K)>& keyGetterFunc,
                 const std::function<bool(Local<Value>)>& checkKeyTypeFunc,
                 const std::function<K(Local<Value>)>& convertToKeyTypeFunc,
                 const std::function<Local<Value>(V)>& valueGetterFunc)
      : _instance(winRtInstance),
        _keyGetterFunc(keyGetterFunc),
        _checkKeyTypeFunc(checkKeyTypeFunc),
        _convertToKeyTypeFunc(convertToKeyTypeFunc),
        _valueGetterFunc(valueGetterFunc) {}

  static void New(Nan::NAN_METHOD_ARGS_TYPE info) {
    NodeRT::Utils::SetHiddenValue(
        info.This(), Nan::New<String>("__winRtInstance__").ToLocalChecked(),
        True());

    info.GetReturnValue().Set(info.This());
  }

  static void HasKey(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMapView<K, V> ^>(
            info.This())) {
      return;
    }

    MapViewWrapper<K, V>* wrapper =
        MapViewWrapper<K, V>::Unwrap<MapViewWrapper<K, V>>(info.This());

    if (info.Length() == 1 && wrapper->_checkKeyTypeFunc(info[0])) {
      try {
        K key = wrapper->_convertToKeyTypeFunc(info[0]);

        bool result = wrapper->_instance->HasKey(key);

        info.GetReturnValue().Set(Nan::New<Boolean>(result));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void First(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMapView<K, V> ^>(
            info.This())) {
      return;
    }

    MapViewWrapper<K, V>* wrapper =
        MapViewWrapper<K, V>::Unwrap<MapViewWrapper<K, V>>(info.This());

    if (info.Length() == 0) {
      try {
        const std::function<Local<Value>(K)>& keyGetter =
            wrapper->_keyGetterFunc;
        const std::function<Local<Value>(V)>& valueGetter =
            wrapper->_valueGetterFunc;
        info.GetReturnValue().Set(
            IteratorWrapper<
                ::Windows::Foundation::Collections::IKeyValuePair<K, V> ^>::
                CreateIteratorWrapper(
                    wrapper->_instance->First(),
                    [keyGetter, valueGetter](
                        ::Windows::Foundation::Collections::IKeyValuePair<K,
                                                                          V> ^
                        value) {
                      return KeyValuePairWrapper<
                          K, V>::CreateKeyValuePairWrapper(value, keyGetter,
                                                           valueGetter);
                    }));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void Lookup(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMapView<K, V> ^>(
            info.This())) {
      return;
    }

    MapViewWrapper<K, V>* wrapper =
        MapViewWrapper<K, V>::Unwrap<MapViewWrapper<K, V>>(info.This());

    if (info.Length() == 1 && wrapper->_checkKeyTypeFunc(info[0])) {
      try {
        K key = wrapper->_convertToKeyTypeFunc(info[0]);

        V result = wrapper->_instance->Lookup(key);

        info.GetReturnValue().Set(wrapper->_valueGetterFunc(result));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void Split(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMapView<K, V> ^>(
            info.This())) {
      return;
    }

    MapViewWrapper<K, V>* wrapper =
        MapViewWrapper<K, V>::Unwrap<MapViewWrapper<K, V>>(info.This());

    if (info.Length() == 0) {
      try {
        ::Windows::Foundation::Collections::IMapView<K, V> ^ first;
        ::Windows::Foundation::Collections::IMapView<K, V> ^ second;

        wrapper->_instance->Split(&first, &second);

        Local<Object> resObj = Nan::New<Object>();
        Nan::Set(
            resObj, Nan::New<String>("first").ToLocalChecked(),
            MapViewWrapper<K, V>::CreateMapViewWrapper(
                first, wrapper->_keyGetterFunc, wrapper->_checkTypeFunc,
                wrapper->_convertToKeyTypeFunc, wrapper->_valueGetterFunc));
        Nan::Set(
            resObj, Nan::New<String>("second").ToLocalChecked(),
            MapViewWrapper<K, V>::CreateMapViewWrapper(
                second, wrapper->_keyGetterFunc, wrapper->_checkTypeFunc,
                wrapper->_convertToKeyTypeFunc, wrapper->_valueGetterFunc));
        info.GetReturnValue().Set(resObj);
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void SizeGetter(Local<String> property,
                         const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMapView<K, V> ^>(
            info.This())) {
      return;
    }

    MapViewWrapper<K, V>* wrapper =
        MapViewWrapper<K, V>::Unwrap<MapViewWrapper<K, V>>(info.This());

    try {
      info.GetReturnValue().Set(Nan::New<Integer>(wrapper->_instance->Size));
    } catch (Platform::Exception ^ exception) {
      NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
      return;
    }
  }

 private:
  ::Windows::Foundation::Collections::IMapView<K, V> ^ _instance;
  std::function<bool(Local<Value>)> _checkTypeFunc;
  std::function<Local<Value>(K)> _keyGetterFunc;
  std::function<K(Local<Value>)> _convertToKeyTypeFunc;
  std::function<Local<Value>(V)> _valueGetterFunc;
  std::function<bool(Local<Value>)> _checkKeyTypeFunc;
  static Persistent<FunctionTemplate> s_constructorTemplate;
};

template <class K, class V>
Persistent<FunctionTemplate> MapViewWrapper<K, V>::s_constructorTemplate;

template <class K, class V>
class MapWrapper : NodeRT::WrapperBase {
 public:
  static void Init() {
    HandleScope scope;

    Local<FunctionTemplate> localRef = Nan::New<FunctionTemplate>(New);
    s_constructorTemplate.Reset(localRef);
    localRef->SetClassName(
        Nan::New<String>("Windows::Foundation::Collections:IMap")
            .ToLocalChecked());
    localRef->InstanceTemplate()->SetInternalFieldCount(1);

    Nan::SetPrototypeMethod(localRef, "hasKey", HasKey);
    Nan::SetPrototypeMethod(localRef, "lookup", Lookup);
    Nan::SetPrototypeMethod(localRef, "getView", GetView);
    Nan::SetPrototypeMethod(localRef, "clear", Clear);
    Nan::SetPrototypeMethod(localRef, "insert", Insert);
    Nan::SetPrototypeMethod(localRef, "remove", Remove);
    Nan::SetPrototypeMethod(localRef, "first", First);

    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("size").ToLocalChecked(), SizeGetter);
    Nan::SetAccessor(localRef->PrototypeTemplate(),
                     Nan::New<String>("length").ToLocalChecked(), SizeGetter);

    return;
  }

  static Local<Value> CreateMapWrapper(
      ::Windows::Foundation::Collections::IMap<K, V> ^ winRtInstance,
      const std::function<Local<Value>(K)>& keyGetterFunc,
      const std::function<bool(Local<Value>)>& checkKeyTypeFunc,
      const std::function<K(Local<Value>)>& convertToKeyTypeFunc,
      const std::function<Local<Value>(V)>& valueGetterFunc,
      const std::function<bool(Local<Value>)>& checkValueTypeFunc,
      const std::function<V(Local<Value>)>& convertToValueTypeFunc) {
    EscapableHandleScope scope;
    if (winRtInstance == nullptr) {
      return scope.Escape(Undefined());
    }

    if (s_constructorTemplate.IsEmpty()) {
      Init();
    }

    v8::Local<Value> args[] = {Undefined()};
    Local<FunctionTemplate> localRef =
        Nan::New<FunctionTemplate>(s_constructorTemplate);
    Local<Object> objectInstance =
        Nan::NewInstance(Nan::GetFunction(localRef).ToLocalChecked(), 0, args)
            .ToLocalChecked();
    if (objectInstance.IsEmpty()) {
      return scope.Escape(Undefined());
    }

    MapWrapper<K, V>* wrapperInstance = new MapWrapper<K, V>(
        winRtInstance, keyGetterFunc, checkKeyTypeFunc, convertToKeyTypeFunc,
        valueGetterFunc, checkValueTypeFunc, convertToValueTypeFunc);
    wrapperInstance->Wrap(objectInstance);
    return scope.Escape(objectInstance);
  }

  virtual ::Platform::Object ^ GetObjectInstance() const override {
    return _instance;
  }

 private:
  MapWrapper(::Windows::Foundation::Collections::IMap<K, V> ^ winRtInstance,
             const std::function<Local<Value>(K)>& keyGetterFunc,
             const std::function<bool(Local<Value>)>& checkKeyTypeFunc,
             const std::function<K(Local<Value>)>& convertToKeyTypeFunc,
             const std::function<Local<Value>(V)>& valueGetterFunc,
             const std::function<bool(Local<Value>)>& checkValueTypeFunc,
             const std::function<V(Local<Value>)>& convertToValueTypeFunc)
      : _instance(winRtInstance),
        _keyGetterFunc(keyGetterFunc),
        _checkKeyTypeFunc(checkKeyTypeFunc),
        _convertToKeyTypeFunc(convertToKeyTypeFunc),
        _valueGetterFunc(valueGetterFunc),
        _checkValueTypeFunc(checkValueTypeFunc),
        _convertToValueTypeFunc(convertToValueTypeFunc) {}

  static void New(Nan::NAN_METHOD_ARGS_TYPE info) {
    NodeRT::Utils::SetHiddenValue(
        info.This(), Nan::New<String>("__winRtInstance__").ToLocalChecked(),
        True());

    info.GetReturnValue().Set(info.This());
  }

  static void HasKey(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMap<K, V> ^>(info.This())) {
      return;
    }

    MapWrapper<K, V>* wrapper =
        MapWrapper<K, V>::Unwrap<MapWrapper<K, V>>(info.This());

    if (info.Length() == 1 && wrapper->_checkKeyTypeFunc(info[0])) {
      try {
        K key = wrapper->_convertToKeyTypeFunc(info[0]);

        bool result = wrapper->_instance->HasKey(key);

        info.GetReturnValue().Set(Nan::New<Boolean>(result));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void Remove(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMap<K, V> ^>(info.This())) {
      return;
    }

    MapWrapper<K, V>* wrapper =
        MapWrapper<K, V>::Unwrap<MapWrapper<K, V>>(info.This());

    if (info.Length() == 1 && wrapper->_checkKeyTypeFunc(info[0])) {
      try {
        K key = wrapper->_convertToKeyTypeFunc(info[0]);

        wrapper->_instance->Remove(key);

        return;
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }
  }

  static void Insert(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMap<K, V> ^>(info.This())) {
      return;
    }

    MapWrapper<K, V>* wrapper =
        MapWrapper<K, V>::Unwrap<MapWrapper<K, V>>(info.This());

    if (info.Length() == 2 && wrapper->_checkKeyTypeFunc(info[0]) &&
        wrapper->_checkValueTypeFunc(info[1])) {
      try {
        K key = wrapper->_convertToKeyTypeFunc(info[0]);
        V value = wrapper->_convertToValueTypeFunc(info[1]);

        bool result = wrapper->_instance->Insert(key, value);

        info.GetReturnValue().Set(Nan::New<Boolean>(result));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }
  }

  static void First(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMap<K, V> ^>(info.This())) {
      return;
    }

    MapWrapper<K, V>* wrapper =
        MapWrapper<K, V>::Unwrap<MapWrapper<K, V>>(info.This());

    if (info.Length() == 0) {
      try {
        const std::function<Local<Value>(K)>& keyGetter =
            wrapper->_keyGetterFunc;
        const std::function<Local<Value>(V)>& valueGetter =
            wrapper->_valueGetterFunc;
        info.GetReturnValue().Set(
            IteratorWrapper<
                ::Windows::Foundation::Collections::IKeyValuePair<K, V> ^>::
                CreateIteratorWrapper(
                    wrapper->_instance->First(),
                    [keyGetter, valueGetter](
                        ::Windows::Foundation::Collections::IKeyValuePair<K,
                                                                          V> ^
                        value) {
                      return KeyValuePairWrapper<
                          K, V>::CreateKeyValuePairWrapper(value, keyGetter,
                                                           valueGetter);
                    }));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void Lookup(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMap<K, V> ^>(info.This())) {
      return;
    }

    MapWrapper<K, V>* wrapper =
        MapWrapper<K, V>::Unwrap<MapWrapper<K, V>>(info.This());

    if (info.Length() == 1 && wrapper->_checkKeyTypeFunc(info[0])) {
      try {
        K key = wrapper->_convertToKeyTypeFunc(info[0]);

        V result = wrapper->_instance->Lookup(key);

        info.GetReturnValue().Set(wrapper->_valueGetterFunc(result));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }

    return;
  }

  static void GetView(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMap<K, V> ^>(info.This())) {
      return;
    }

    MapWrapper<K, V>* wrapper =
        MapWrapper<K, V>::Unwrap<MapWrapper<K, V>>(info.This());

    if (info.Length() == 0) {
      try {
        ::Windows::Foundation::Collections::IMapView<K, V> ^ result =
            wrapper->_instance->GetView();

        info.GetReturnValue().Set(MapViewWrapper<K, V>::CreateMapViewWrapper(
            result, wrapper->_keyGetterFunc, wrapper->_checkKeyTypeFunc,
            wrapper->_convertToKeyTypeFunc, wrapper->_valueGetterFunc));
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }
  }

  static void Clear(Nan::NAN_METHOD_ARGS_TYPE info) {
    HandleScope scope;

    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMap<K, V> ^>(info.This())) {
      return;
    }

    MapWrapper<K, V>* wrapper =
        MapWrapper<K, V>::Unwrap<MapWrapper<K, V>>(info.This());

    if (info.Length() == 0) {
      try {
        wrapper->_instance->Clear();
        return;
      } catch (Platform::Exception ^ exception) {
        NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
        return;
      }
    } else {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Bad arguments: no suitable overload found")));
      return;
    }
  }

  static void SizeGetter(Local<String> property,
                         const Nan::PropertyCallbackInfo<v8::Value>& info) {
    HandleScope scope;
    if (!NodeRT::Utils::IsWinRtWrapperOf<
            ::Windows::Foundation::Collections::IMap<K, V> ^>(info.This())) {
      return;
    }

    MapWrapper<K, V>* wrapper =
        MapWrapper<K, V>::Unwrap<MapWrapper<K, V>>(info.This());

    try {
      info.GetReturnValue().Set(Nan::New<Integer>(wrapper->_instance->Size));
    } catch (Platform::Exception ^ exception) {
      NodeRT::Utils::ThrowWinRtExceptionInJs(exception);
      return;
    }
  }

 private:
  ::Windows::Foundation::Collections::IMap<K, V> ^ _instance;

  std::function<Local<Value>(K)> _keyGetterFunc;
  std::function<K(Local<Value>)> _convertToKeyTypeFunc;
  std::function<bool(Local<Value>)> _checkKeyTypeFunc;

  std::function<Local<Value>(V)> _valueGetterFunc;
  std::function<V(Local<Value>)> _convertToValueTypeFunc;
  std::function<bool(Local<Value>)> _checkValueTypeFunc;

  static Persistent<FunctionTemplate> s_constructorTemplate;
};

template <class K, class V>
Persistent<FunctionTemplate> MapWrapper<K, V>::s_constructorTemplate;

}  // namespace Collections
};  // namespace NodeRT
