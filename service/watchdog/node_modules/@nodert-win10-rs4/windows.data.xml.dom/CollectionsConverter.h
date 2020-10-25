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
#include <collection.h>
#include <v8.h>
#include "CollectionsConverterUtils.h"
#include "NodeRtUtils.h"
#include "nan.h"

namespace NodeRT {
namespace Collections {

Nan::Persistent<v8::String> g_keyProp;
Nan::Persistent<v8::String> g_valueProp;

static void initProps() {
  if (g_keyProp.IsEmpty())
    g_keyProp.Reset(Nan::New<v8::String>("key").ToLocalChecked());

  if (g_valueProp.IsEmpty())
    g_valueProp.Reset(Nan::New<v8::String>("value").ToLocalChecked());
}

static std::function<bool(v8::Local<v8::Value>)> checkStringFunc =
    [](v8::Local<v8::Value> value) -> bool { return value->IsString(); };

template <class K, class V>
    static ::Platform::Collections::Map<K, V> ^
    JsArrayToWinrtMap(
        v8::Local<v8::Array> arr,
        const std::function<bool(v8::Local<v8::Value>)>& checkKeyTypeFunc,
        const std::function<K(v8::Local<v8::Value>)>& convertToKeyTypeFunc,
        const std::function<bool(v8::Local<v8::Value>)>& checkValueTypeFunc,
        const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc) {
      std::map<K, V> stdMap;
      if (!FillMapFromJsArray(arr, checkKeyTypeFunc, convertToKeyTypeFunc,
                              checkValueTypeFunc, convertToValueTypeFunc,
                              stdMap)) {
        return nullptr;
      }

      // TODO: michfa: consider using std::move (here & everywhere), e.g: return
      // ref new ::Platform::Collections::Map<K, V>(std::move(stdMap));
      // std::move will give a more efficient initialization from std::map, will
      // invalidate stdMap however- some types will throw while moving
      return ref new ::Platform::Collections::Map<K, V>(stdMap);
    }

    template <class K, class V>
    static ::Platform::Collections::MapView<K, V> ^
    JsArrayToWinrtMapView(
        v8::Local<v8::Array> arr,
        const std::function<bool(v8::Local<v8::Value>)>& checkKeyTypeFunc,
        const std::function<K(v8::Local<v8::Value>)>& convertToKeyTypeFunc,
        const std::function<bool(v8::Local<v8::Value>)>& checkValueTypeFunc,
        const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc) {
      std::map<K, V> stdMap;
      if (!FillMapFromJsArray(arr, checkKeyTypeFunc, convertToKeyTypeFunc,
                              checkValueTypeFunc, convertToValueTypeFunc,
                              stdMap)) {
        return nullptr;
      }

      return ref new ::Platform::Collections::MapView<K, V>(stdMap);
    }

    // A special implementation for the case were the map's keys are strings
    // In this case we expect a non-array JS object.
    template <class V>
    static ::Platform::Collections::Map<Platform::String ^, V> ^
    JsObjectToWinrtMap(
        v8::Local<v8::Object> obj,
        const std::function<bool(v8::Local<v8::Value>)>& checkValueTypeFunc,
        const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc) {
      std::map<::Platform::String ^, V> stdMap;

      if (!FillMapFromJsObject(
              obj, checkStringFunc, NodeRT::Utils::V8StringToPlatformString,
              checkValueTypeFunc, convertToValueTypeFunc, stdMap)) {
        return nullptr;
      }

      return ref new ::Platform::Collections::Map<::Platform::String ^, V>(
          stdMap);
    }

    template <class V>
    static ::Platform::Collections::MapView<Platform::String ^, V> ^
    JsObjectToWinrtMapView(
        v8::Local<v8::Object> obj,
        const std::function<bool(v8::Local<v8::Value>)>& checkValueTypeFunc,
        const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc) {
      std::map<::Platform::String ^, V> stdMap;
      if (!FillMapFromJsObject(
              obj, checkStringFunc, NodeRT::Utils::V8StringToPlatformString,
              checkValueTypeFunc, convertToValueTypeFunc, stdMap)) {
        return nullptr;
      }

      return ref new ::Platform::Collections::MapView<::Platform::String ^, V>(
          stdMap);
    }

    template <class V>
    static ::Platform::Collections::Vector<V> ^
    JsArrayToWinrtVector(
        v8::Local<v8::Array> arr,
        const std::function<bool(v8::Local<v8::Value>)>& checkValueTypeFunc,
        const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc) {
      std::vector<V> vec(arr->Length());
      if (!FillVector<std::vector<V>&, V>(arr, checkValueTypeFunc,
                                          convertToValueTypeFunc, vec)) {
        return nullptr;
      }

      return ref new ::Platform::Collections::Vector<V>(vec);
    }

    template <class V>
    static ::Platform::Collections::VectorView<V> ^
    JsArrayToWinrtVectorView(
        v8::Local<v8::Array> arr,
        const std::function<bool(v8::Local<v8::Value>)>& checkValueTypeFunc,
        const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc) {
      std::vector<V> vec(arr->Length());

      if (!FillVector<std::vector<V>&, V>(arr, checkValueTypeFunc,
                                          convertToValueTypeFunc, vec)) {
        return nullptr;
      }

      return ref new ::Platform::Collections::VectorView<V>(vec);
    }

    template <class V>
    static ::Platform::Array<V> ^
    JsArrayToWinrtArray(
        v8::Local<v8::Array> arr,
        const std::function<bool(v8::Local<v8::Value>)>& checkValueTypeFunc,
        const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc) {
      auto vec = ref new ::Platform::Array<V>(arr->Length());
      if (!FillVector<::Platform::Array<V> ^, V>(arr, checkValueTypeFunc,
                                                 convertToValueTypeFunc, vec)) {
        return nullptr;
      }

      return vec;
    }
}  // namespace Collections

template <class V>
static void InsertToVector(
    uint32_t index,
    v8::Local<v8::Value> value,
    const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc,
    std::vector<V>& vec) {
  vec[index] = convertToValueTypeFunc(value);
}

template <class V>
static void InsertToVector(
    uint32_t index,
    v8::Local<v8::Value> value,
    const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc,
    ::Platform::Array<V> ^ vec) {
  vec->set(index, convertToValueTypeFunc(value));
}

// assumption: vec length >= arr length
template <class T, class V>
static bool FillVector(
    v8::Local<v8::Array> arr,
    const std::function<bool(v8::Local<v8::Value>)>& checkValueTypeFunc,
    const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc,
    T vec) {
  for (uint32_t i = 0; i < arr->Length(); i++) {
    Local<Value> value = Nan::Get(arr, i).ToLocalChecked();

    if (!checkValueTypeFunc(value)) {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Received array with unexpected value type")));
      return false;
    }

    InsertToVector(i, value, convertToValueTypeFunc, vec);
  }

  return true;
}

template <class K, class V>
static bool FillMapFromJsArray(
    v8::Local<v8::Array> arr,
    const std::function<bool(v8::Local<v8::Value>)>& checkKeyTypeFunc,
    const std::function<K(v8::Local<v8::Value>)>& convertToKeyTypeFunc,
    const std::function<bool(v8::Local<v8::Value>)>& checkValueTypeFunc,
    const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc,
    std::map<K, V>& stdMap) {
  initProps();

  // expect that each element in the array will be an object with 2 properties:
  // key and value (with types that match K and V respectively)
  for (uint32_t i = 0; i < arr->Length(); i++) {
    Local<Value> curr = Nan::Get(arr, i).ToLocalChecked();

    if (!curr->IsObject()) {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Array elements are expected to be javascript objects")));
      return false;
    }

    v8::Local<v8::Object> obj = curr.As<v8::Object>();

    if (!obj->Has(g_keyProp) || !obj->Has(g_valueProp)) {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Array elements are expected to be javascript objects with \'key\' "
          L"and \'value\' properties")));
      return false;
    }

    Local<Value> key = Nan::Get(obj, g_keyProp).ToLocalChecked();
    Local<Value> value = Nan::Get(obj, g_valueProp).ToLocalChecked();

    if (!checkKeyTypeFunc(key)) {
      Nan::ThrowError(Nan::Error(
          NodeRT::Utils::NewString(L"Array element has invalid key type")));
      return false;
    }

    if (!checkValueTypeFunc(value)) {
      Nan::ThrowError(Nan::Error(
          NodeRT::Utils::NewString(L"Array element has invalid value type")));
      return false;
    }

    stdMap.insert(std::pair<K, V>(convertToKeyTypeFunc(key),
                                  convertToValueTypeFunc(value)));
  }

  return true;
}

template <class V>
static bool FillMapFromJsObject(
    v8::Local<v8::Object> obj,
    const std::function<bool(v8::Local<v8::Value>)>& checkKeyTypeFunc,
    const std::function<::Platform::String ^ (v8::Local<v8::Value>)>&
        convertToKeyTypeFunc,
    const std::function<bool(v8::Local<v8::Value>)>& checkValueTypeFunc,
    const std::function<V(v8::Local<v8::Value>)>& convertToValueTypeFunc,
    std::map<::Platform::String ^, V>& stdMap) {
  Local<Array> objProps = Nan::GetPropertyNames(obj).ToLocalChecked();
  for (uint32_t i = 0; i < objProps->Length(); i++) {
    Local<Value> key = Nan::Get(objProps, i).ToLocalChecked();
    Local<Value> value = Nan::Get(obj, key).ToLocalChecked();
    if (!checkValueTypeFunc(value)) {
      Nan::ThrowError(Nan::Error(NodeRT::Utils::NewString(
          L"Received object with unexpected value type")));
      return false;
    }

    stdMap.insert(std::pair<::Platform::String ^, V>(
        convertToKeyTypeFunc(key), convertToValueTypeFunc(value)));
  }
  return true;
}
};  // namespace NodeRT
