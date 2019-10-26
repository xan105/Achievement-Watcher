{
  "targets": [
    {
      "target_name": "focus-assist",
      "sources": [ ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "conditions": [
        ['OS=="win"', {
          "sources": [ "lib/focus-assist.cc", "lib/quiethours.idl", "lib/quiethours_h.h", "lib/quiethours_i.c" ],
        }]
      ]
    }
  ]
}
