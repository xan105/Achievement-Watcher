package xinput

import (
	"syscall"
	"unsafe"
)

type State struct {
	PacketNumber uint32 // increased for every controller change
	Gamepad      Gamepad
}

type Button uint16

type Gamepad struct {
	Buttons      uint16
	LeftTrigger  uint8
	RightTrigger uint8
	ThumbLX      int16
	ThumbLY      int16
	ThumbRX      int16
	ThumbRY      int16
}

type Vibration struct {
	LeftMotorSpeed  uint16
	RightMotorSpeed uint16
}

const (
	CONTROLLER_MAX       = 4 // valid controller numbers are 0-3
	TRIGGER_TRESHOLD     = 30
	LEFT_THUMB_DEADZONE  = 7849
	RIGHT_THUMB_DEADZONE = 8689
)

const (
	DPAD_UP        Button = 0x0001
	DPAD_DOWN      Button = 0x0002
	DPAD_LEFT      Button = 0x0004
	DPAD_RIGHT     Button = 0x0008
	START          Button = 0x0010
	BACK           Button = 0x0020
	LEFT_THUMB     Button = 0x0040
	RIGHT_THUMB    Button = 0x0080
	LEFT_SHOULDER  Button = 0x0100
	RIGHT_SHOULDER Button = 0x0200
	BUTTON_A       Button = 0x1000
	BUTTON_B       Button = 0x2000
	BUTTON_X       Button = 0x4000
	BUTTON_Y       Button = 0x8000
)

var (
	loadError          error
	procXInputGetState *syscall.Proc
	procXInputSetState *syscall.Proc
)

func init() {
	loadError = load()
}

func load() error {
	dll, err := syscall.LoadDLL("xinput1_4.dll")
	defer func() {
		if err != nil {
			dll.Release()
		}
	}()
	if err != nil {
		dll, err = syscall.LoadDLL("xinput1_3.dll")
		if err != nil {
			dll, err = syscall.LoadDLL("xinput9_1_0.dll")
			return err
		}
	}
	procXInputGetState, err = dll.FindProc("XInputGetState")
	if err != nil {
		return err
	}
	procXInputSetState, err = dll.FindProc("XInputSetState")
	return err
}

// Load() checks if XInput was successfully loaded.
// Other functions of the library may be used safely only if it returns no error.
func Load() error {
	return loadError
}

// GetState retrieves the current state of the controller.
func GetState(controller uint, state *State) error {
	r, _, _ := procXInputGetState.Call(uintptr(controller), uintptr(unsafe.Pointer(state)))
	if r == 0 {
		return nil
	}
	return syscall.Errno(r)
}

// SetState sets the vibration for the controller.
func SetState(controller uint, vibration *Vibration) error {
	r, _, _ := procXInputSetState.Call(uintptr(controller), uintptr(unsafe.Pointer(vibration)))
	if r == 0 {
		return nil
	}
	return syscall.Errno(r)
}
