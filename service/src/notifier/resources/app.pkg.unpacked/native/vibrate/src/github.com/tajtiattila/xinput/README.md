xinput
======

XInput (XBOX 360 compatible controller) library for [Go][] on Windows.

[Go]: http://golang.org

Requirements
------------

- Windows 8.1: xinput1_4.dll
- Windows 7: xinput1_3.dll
- Windows Vista: xinput9_1_0.dll

Tested on Windows 7 x64.

Installation
------------

`go get github.com/tajtiattila/xinput`

Usage
-----

Only three functions are available.

`Load` loads xinput.dll. Not strictly necessary, but useful for
checking whether xinput is actually available.

`GetState` retrieves the state thumbsticks, d-pad, buttons and triggers.

`SetState` sets vibration state.
