#ifndef _GET_UV_EVENT_LOOP_NAPI_H
#define _GET_UV_EVENT_LOOP_NAPI_H

#include <assert.h>
#include <node_api.h>

#if !defined(NAPI_VERSION) || NAPI_VERSION < 2
#include <get-symbol-from-current-process.h>
#endif

inline
uv_loop_t* get_uv_event_loop(napi_env env) {
  typedef napi_status (*get_uv_event_loop_fn)(napi_env env, uv_loop_t** loop);
  get_uv_event_loop_fn napi_get_uv_event_loop__ = NULL;
  uint32_t napi_version = 0;
  napi_status status;
  status = napi_get_version(env, &napi_version);
  assert(status == napi_ok);
  if (napi_version < 2)
    return uv_default_loop();

#if !defined(NAPI_VERSION) || NAPI_VERSION < 2
  napi_get_uv_event_loop__ = (get_uv_event_loop_fn)
      get_symbol_from_current_process("napi_get_uv_event_loop");
#else
  napi_get_uv_event_loop__ = &napi_get_uv_event_loop;
#endif

  uv_loop_t* ret;
  status = napi_get_uv_event_loop__(env, &ret);
  assert(status == napi_ok);
  return ret;
}

#endif
