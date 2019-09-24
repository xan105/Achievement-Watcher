#ifndef _GET_SYMBOL_FROM_CURRENT_PROCESS_H
#define _GET_SYMBOL_FROM_CURRENT_PROCESS_H

#include <assert.h>
#ifdef _WIN32
#include <windows.h>
#else
#include <dlfcn.h>
#endif

inline
void* get_symbol_from_current_process(const char* name) {
#ifdef _WIN32
  HMODULE handle = GetModuleHandle(NULL);
  assert(handle != NULL);
  return (void*) GetProcAddress(handle, name);
#else
  void* handle = dlopen(NULL, RTLD_LAZY);
  assert(handle != NULL);
  void* sym = dlsym(handle, name);
  dlclose(handle);
  dlerror();  // Clear any possible errors.
  return sym;
#endif
}

#endif
