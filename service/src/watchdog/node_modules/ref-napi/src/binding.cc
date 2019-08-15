#include <stdlib.h>
#include <string.h>
#include <errno.h>

#include "napi.h"

#ifdef _WIN32
  #define __alignof__ __alignof
  #define snprintf(buf, bufSize, format, arg) _snprintf_s(buf, bufSize, _TRUNCATE, format, arg)
  #define strtoll _strtoi64
  #define strtoull _strtoui64
  #define PRId64 "lld"
  #define PRIu64 "llu"
#else
  #define __STDC_FORMAT_MACROS
  #include <inttypes.h>
#endif


using namespace Napi;

namespace {

// used by the Int64 functions to determine whether to return a Number
// or String based on whether or not a Number will lose precision.
// http://stackoverflow.com/q/307179/376773
#define JS_MAX_INT +9007199254740992LL
#define JS_MIN_INT -9007199254740992LL

// mirrors deps/v8/src/objects.h.
// we could use `node::Buffer::kMaxLength`, but it's not defined on node v0.6.x
static const unsigned int kMaxLength = 0x3fffffff;

char* AddressForArgs(const CallbackInfo& args, size_t offset_index = 1) {
  Value buf = args[0];
  if (!buf.IsBuffer()) {
    throw TypeError::New(args.Env(), "Buffer instance expected");
  }

  int64_t offset = args[offset_index].ToNumber();
  return buf.As<Buffer<char>>().Data() + offset;
}

/**
 * Returns the pointer address as a Number of the given Buffer instance.
 * It's recommended to use `hexAddress()` in most cases instead of this function.
 *
 * WARNING: a JavaScript Number cannot precisely store a full 64-bit memory
 * address, so there's a possibility of an inaccurate value being returned
 * on 64-bit systems.
 *
 * args[0] - Buffer - the Buffer instance get the memory address of
 * args[1] - Number - optional (0) - the offset of the Buffer start at
 */

Value Address (const CallbackInfo& args) {
  char* ptr = AddressForArgs(args);
  uintptr_t intptr = reinterpret_cast<uintptr_t>(ptr);

  return Number::New(args.Env(), static_cast<double>(intptr));
}

/**
 * Returns the pointer address as a hexadecimal String. This function
 * is safe to use for displaying memory addresses, as compared to the
 * `address()` function which could overflow since it returns a Number.
 *
 * args[0] - Buffer - the Buffer instance get the memory address of
 * args[1] - Number - optional (0) - the offset of the Buffer start at
 */

Value HexAddress(const CallbackInfo& args) {
  char* ptr = AddressForArgs(args);
  char strbuf[30]; /* should be plenty... */
  snprintf(strbuf, 30, "%p", ptr);

  if (strbuf[0] == '0' && strbuf[1] == 'x') {
    /* strip the leading "0x" from the address */
    ptr = strbuf + 2;
  } else {
    ptr = strbuf;
  }

  return String::New(args.Env(), ptr);
}

/**
 * Returns "true" if the given Buffer points to nullptr, "false" otherwise.
 *
 * args[0] - Buffer - the Buffer instance to check for nullptr
 * args[1] - Number - optional (0) - the offset of the Buffer start at
 */

Value IsNull(const CallbackInfo& args) {
  char* ptr = AddressForArgs(args);
  return Boolean::New(args.Env(), ptr == nullptr);
}

/**
 * Converts an arbitrary pointer to a node Buffer with specified length
 */

Value WrapPointer(Env env, char* ptr, size_t length) {
  if (ptr == nullptr)
    length = 0;
  return Buffer<char>::New(env, ptr, length, [](Env,char*){});
}

/**
 * Retreives a JS Object instance that was previously stored in
 * the given Buffer instance at the given offset.
 *
 * args[0] - Buffer - the "buf" Buffer instance to read from
 * args[1] - Number - the offset from the "buf" buffer's address to read from
 */

Value ReadObject(const CallbackInfo& args) {
  char* ptr = AddressForArgs(args);

  if (ptr == nullptr) {
    throw Error::New(args.Env(), "readObject: Cannot read from nullptr pointer");
  }

  Reference<Object>* rptr = reinterpret_cast<Reference<Object>*>(ptr);
  return rptr->Value();
}

/**
 * Writes a weak reference to given Object to the given Buffer
 * instance and offset.
 *
 * args[0] - Buffer - the "buf" Buffer instance to write to
 * args[1] - Number - the offset from the "buf" buffer's address to write to
 * args[2] - Object - the "obj" Object which will have a new Persistent reference
 *                    created for the obj, whose memory address will be written.
 */

void WriteObject(const CallbackInfo& args) {
  Env env = args.Env();
  char* ptr = AddressForArgs(args);

  if (ptr == nullptr) {
    throw Error::New(env, "readObject: Cannot write to nullptr pointer");
  }

  Reference<Object>* rptr = reinterpret_cast<Reference<Object>*>(ptr);
  if (args[2].IsObject()) {
    Object val = args[2].As<Object>();
    *rptr = std::move(Reference<Object>::New(val));
  } else if (args[2].IsNull()) {
    rptr->Reset();
  } else {
    throw TypeError::New(env, "WriteObject's 3rd argument needs to be an object");
  }
}

/**
 * Reads the memory address of the given "buf" pointer Buffer at the specified
 * offset, and returns a new SlowBuffer instance from the memory address stored.
 *
 * args[0] - Buffer - the "buf" Buffer instance to read from
 * args[1] - Number - the offset from the "buf" buffer's address to read from
 * args[2] - Number - the length in bytes of the returned SlowBuffer instance
 */

Value ReadPointer(const CallbackInfo& args) {
  Env env = args.Env();
  char* ptr = AddressForArgs(args);

  if (ptr == nullptr) {
    throw Error::New(env, "readPointer: Cannot read from nullptr pointer");
  }

  int64_t size = args[2].ToNumber();

  char* val = *reinterpret_cast<char**>(ptr);
  return WrapPointer(env, val, size);
}

/**
 * Writes the memory address of the "input" buffer (and optional offset) to the
 * specified "buf" buffer and offset. Essentially making "buf" hold a reference
 * to the "input" Buffer.
 *
 * args[0] - Buffer - the "buf" Buffer instance to write to
 * args[1] - Number - the offset from the "buf" buffer's address to write to
 * args[2] - Buffer - the "input" Buffer whose memory address will be written
 */

void WritePointer(const CallbackInfo& args) {
  Env env = args.Env();
  char* ptr = AddressForArgs(args);
  Value input = args[2];

  if (!input.IsNull() && !input.IsBuffer()) {
    throw TypeError::New(env, "writePointer: Buffer instance expected as third argument");
  }

  if (input.IsNull()) {
    *reinterpret_cast<char**>(ptr) = nullptr;
  } else {
    char* input_ptr = input.As<Buffer<char>>().Data();
    *reinterpret_cast<char**>(ptr) = input_ptr;
  }
}

/**
 * Reads a machine-endian int64_t from the given Buffer at the given offset.
 *
 * args[0] - Buffer - the "buf" Buffer instance to read from
 * args[1] - Number - the offset from the "buf" buffer's address to read from
 */

Value ReadInt64(const CallbackInfo& args) {
  Env env = args.Env();
  char* ptr = AddressForArgs(args);

  if (ptr == nullptr) {
    throw TypeError::New(env, "readInt64: Cannot read from nullptr pointer");
  }

  int64_t val = *reinterpret_cast<int64_t*>(ptr);

  if (val < JS_MIN_INT || val > JS_MAX_INT) {
    char strbuf[128];
    snprintf(strbuf, 128, "%" PRId64, val);
    return String::New(env, strbuf);
  } else {
    return Number::New(env, val);
  }
}

/**
 * Writes the input Number/String int64 value as a machine-endian int64_t to
 * the given Buffer at the given offset.
 *
 * args[0] - Buffer - the "buf" Buffer instance to write to
 * args[1] - Number - the offset from the "buf" buffer's address to write to
 * args[2] - String/Number - the "input" String or Number which will be written
 */

void WriteInt64(const CallbackInfo& args) {
  Env env = args.Env();
  char* ptr = AddressForArgs(args);

  Value in = args[2];
  int64_t val;
  if (in.IsNumber()) {
    val = in.As<Number>();
  } else if (in.IsString()) {
    char* endptr;
    char* str;
    int base = 0;
    std::string _str = in.As<String>();
    str = &_str[0];

    errno = 0;     /* To distinguish success/failure after call */
    val = strtoll(str, &endptr, base);

    if (endptr == str) {
      throw TypeError::New(env, "writeInt64: no digits we found in input String");
    } else  if (errno == ERANGE && (val == INT64_MAX || val == INT64_MIN)) {
      throw TypeError::New(env, "writeInt64: input String numerical value out of range");
    } else if (errno != 0 && val == 0) {
      char errmsg[200];
      snprintf(errmsg, sizeof(errmsg), "writeInt64: %s", strerror(errno));
      throw TypeError::New(env, errmsg);
    }
  } else {
    throw TypeError::New(env, "writeInt64: Number/String 64-bit value required");
  }

  *reinterpret_cast<int64_t*>(ptr) = val;
}

/**
 * Reads a machine-endian uint64_t from the given Buffer at the given offset.
 *
 * args[0] - Buffer - the "buf" Buffer instance to read from
 * args[1] - Number - the offset from the "buf" buffer's address to read from
 */

Value ReadUInt64(const CallbackInfo& args) {
  Env env = args.Env();
  char* ptr = AddressForArgs(args);

  if (ptr == nullptr) {
    throw TypeError::New(env, "readUInt64: Cannot read from nullptr pointer");
  }

  uint64_t val = *reinterpret_cast<uint64_t*>(ptr);

  if (val > JS_MAX_INT) {
    char strbuf[128];
    snprintf(strbuf, 128, "%" PRId64, val);
    return String::New(env, strbuf);
  } else {
    return Number::New(env, val);
  }
}

/**
 * Writes the input Number/String uint64 value as a machine-endian uint64_t to
 * the given Buffer at the given offset.
 *
 * args[0] - Buffer - the "buf" Buffer instance to write to
 * args[1] - Number - the offset from the "buf" buffer's address to write to
 * args[2] - String/Number - the "input" String or Number which will be written
 */

void WriteUInt64(const CallbackInfo& args) {
  Env env = args.Env();
  char* ptr = AddressForArgs(args);

  Value in = args[2];
  uint64_t val;
  if (in.IsNumber()) {
    val = static_cast<int64_t>(in.As<Number>());
  } else if (in.IsString()) {
    char* endptr;
    char* str;
    int base = 0;
    std::string _str = in.As<String>();
    str = &_str[0];

    errno = 0;     /* To distinguish success/failure after call */
    val = strtoull(str, &endptr, base);

    if (endptr == str) {
      throw TypeError::New(env, "writeUInt64: no digits we found in input String");
    } else  if (errno == ERANGE && (val == UINT64_MAX)) {
      throw TypeError::New(env, "writeUInt64: input String numerical value out of range");
    } else if (errno != 0 && val == 0) {
      char errmsg[200];
      snprintf(errmsg, sizeof(errmsg), "writeUInt64: %s", strerror(errno));
      throw TypeError::New(env, errmsg);
    }
  } else {
    throw TypeError::New(env, "writeUInt64: Number/String 64-bit value required");
  }

  *reinterpret_cast<uint64_t*>(ptr) = val;
}

/**
 * Reads a Utf8 C String from the given pointer at the given offset (or 0).
 * I didn't want to add this function but it ends up being necessary for reading
 * past a 0 or 1 length Buffer's boundary in node-ffi :\
 *
 * args[0] - Buffer - the "buf" Buffer instance to read from
 * args[1] - Number - the offset from the "buf" buffer's address to read from
 */

Value ReadCString(const CallbackInfo& args) {
  Env env = args.Env();
  char* ptr = AddressForArgs(args);

  if (ptr == nullptr) {
    throw Error::New(env, "readCString: Cannot read from nullptr pointer");
  }

  return String::New(env, ptr);
}

/**
 * Returns a new Buffer instance that has the same memory address
 * as the given buffer, but with the specified size.
 *
 * args[0] - Buffer - the "buf" Buffer instance to read the address from
 * args[1] - Number - the size in bytes that the returned Buffer should be
 * args[2] - Number - the offset from the "buf" buffer's address to read from
 */

Value ReinterpretBuffer(const CallbackInfo& args) {
  Env env = args.Env();
  char* ptr = AddressForArgs(args, 2);

  if (ptr == nullptr) {
    throw Error::New(env, "reinterpret: Cannot reinterpret from nullptr pointer");
  }

  int64_t size = args[1].ToNumber();

  return WrapPointer(env, ptr, size);
}

/**
 * Returns a new Buffer instance that has the same memory address
 * as the given buffer, but with a length up to the first aligned set of values of
 * 0 in a row for the given length.
 *
 * args[0] - Buffer - the "buf" Buffer instance to read the address from
 * args[1] - Number - the number of sequential 0-byte values that need to be read
 * args[2] - Number - the offset from the "buf" buffer's address to read from
 */

Value ReinterpretBufferUntilZeros(const CallbackInfo& args) {
  Env env = args.Env();
  char* ptr = AddressForArgs(args, 2);

  if (ptr == nullptr) {
    throw Error::New(env, "reinterpretUntilZeros: Cannot reinterpret from nullptr pointer");
  }

  uint32_t numZeros = args[1].ToNumber();
  uint32_t i = 0;
  size_t size = 0;
  bool end = false;

  while (!end && size < kMaxLength) {
    end = true;
    for (i = 0; i < numZeros; i++) {
      if (ptr[size + i] != 0) {
        end = false;
        break;
      }
    }
    if (!end) {
      size += numZeros;
    }
  }

  return WrapPointer(env, ptr, size);
}


} // anonymous namespace

Object Init(Env env, Object exports) {
  // "sizeof" map
  Object smap = Object::New(env);
  // fixed sizes
#define SET_SIZEOF(name, type) \
  smap[ #name ] = Number::New(env, sizeof(type));
  SET_SIZEOF(int8, int8_t);
  SET_SIZEOF(uint8, uint8_t);
  SET_SIZEOF(int16, int16_t);
  SET_SIZEOF(uint16, uint16_t);
  SET_SIZEOF(int32, int32_t);
  SET_SIZEOF(uint32, uint32_t);
  SET_SIZEOF(int64, int64_t);
  SET_SIZEOF(uint64, uint64_t);
  SET_SIZEOF(float, float);
  SET_SIZEOF(double, double);
  // (potentially) variable sizes
  SET_SIZEOF(bool, bool);
  SET_SIZEOF(byte, unsigned char);
  SET_SIZEOF(char, char);
  SET_SIZEOF(uchar, unsigned char);
  SET_SIZEOF(short, short);
  SET_SIZEOF(ushort, unsigned short);
  SET_SIZEOF(int, int);
  SET_SIZEOF(uint, unsigned int);
  SET_SIZEOF(long, long);
  SET_SIZEOF(ulong, unsigned long);
  SET_SIZEOF(longlong, long long);
  SET_SIZEOF(ulonglong, unsigned long long);
  SET_SIZEOF(pointer, char *);
  SET_SIZEOF(size_t, size_t);
  // size of a weak handle to a JS object
  SET_SIZEOF(Object, Reference<Object>);

  // "alignof" map
  Object amap = Object::New(env);
#define SET_ALIGNOF(name, type) \
  struct s_##name { type a; }; \
  amap[ #name ] = Number::New(env, alignof(struct s_##name));
  SET_ALIGNOF(int8, int8_t);
  SET_ALIGNOF(uint8, uint8_t);
  SET_ALIGNOF(int16, int16_t);
  SET_ALIGNOF(uint16, uint16_t);
  SET_ALIGNOF(int32, int32_t);
  SET_ALIGNOF(uint32, uint32_t);
  SET_ALIGNOF(int64, int64_t);
  SET_ALIGNOF(uint64, uint64_t);
  SET_ALIGNOF(float, float);
  SET_ALIGNOF(double, double);
  SET_ALIGNOF(bool, bool);
  SET_ALIGNOF(char, char);
  SET_ALIGNOF(uchar, unsigned char);
  SET_ALIGNOF(short, short);
  SET_ALIGNOF(ushort, unsigned short);
  SET_ALIGNOF(int, int);
  SET_ALIGNOF(uint, unsigned int);
  SET_ALIGNOF(long, long);
  SET_ALIGNOF(ulong, unsigned long);
  SET_ALIGNOF(longlong, long long);
  SET_ALIGNOF(ulonglong, unsigned long long);
  SET_ALIGNOF(pointer, char *);
  SET_ALIGNOF(size_t, size_t);
  SET_ALIGNOF(Object, Reference<Object>);

  // exports
  exports["sizeof"] = smap;
  exports["alignof"] = amap;
  exports["nullptr"] = exports["NULL"] = WrapPointer(env, nullptr, 0);
  exports["address"] = Function::New(env, Address);
  exports["hexAddress"] = Function::New(env, HexAddress);
  exports["isNull"] = Function::New(env, IsNull);
  exports["readObject"] = Function::New(env, ReadObject);
  exports["writeObject"] = Function::New(env, WriteObject);
  exports["readPointer"] = Function::New(env, ReadPointer);
  exports["writePointer"] = Function::New(env, WritePointer);
  exports["readInt64"] = Function::New(env, ReadInt64);
  exports["writeInt64"] = Function::New(env, WriteInt64);
  exports["readUInt64"] = Function::New(env, ReadUInt64);
  exports["writeUInt64"] = Function::New(env, WriteUInt64);
  exports["readCString"] = Function::New(env, ReadCString);
  exports["reinterpret"] = Function::New(env, ReinterpretBuffer);
  exports["reinterpretUntilZeros"] = Function::New(env, ReinterpretBufferUntilZeros);
  return exports;
}

NODE_API_MODULE(binding, Init)
