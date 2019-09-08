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
          "sources": [ "lib/focus-assist.cc" ],
        }]
      ]
    }
  ]
}
