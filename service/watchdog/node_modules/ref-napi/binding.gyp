{
  'targets': [{
    'target_name': 'binding',
    'sources': [ 'src/binding.cc' ],
    'include_dirs': [
      "<!@(node -p \"require('node-addon-api').include\")",
      "<!@(node -p \"require('get-symbol-from-current-process-h').include\")",
      "<!@(node -p \"require('./lib/get-paths').include\")",
    ],
    'dependencies': [
      "<!(node -p \"require('node-addon-api').gyp\")"
    ],
    'cflags!': [ '-fno-exceptions' ],
    'cflags_cc!': [ '-fno-exceptions' ],
    'xcode_settings': {
      'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
      'CLANG_CXX_LIBRARY': 'libc++',
      'MACOSX_DEPLOYMENT_TARGET': '10.7',
    },
    'msvs_settings': {
      'VCCLCompilerTool': { 'ExceptionHandling': 1 },
    },
  }]
}
