"""
Fingerprint/USB Sensor Detection Service
Detects external USB mice and fingerprint/biometric sensors.
Excludes built-in touchpads and internal devices.
"""
import subprocess
import time
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

usb_state = {
    "connected": False,
    "device_name": None,
    "device_count": 0,
    "debug_info": ""
}


def get_external_mouse_devices():
    """
    Use PowerShell to get mouse devices - more reliable than WMI in Python.
    Only returns USB mice (with VID_), excludes internal touchpads.
    """
    ps_script = '''
    $devices = Get-PnpDevice -Class 'Mouse' -PresentOnly -ErrorAction SilentlyContinue
    $devices += Get-PnpDevice -Class 'Biometric' -PresentOnly -ErrorAction SilentlyContinue
    foreach ($d in $devices) {
        $id = $d.InstanceId
        # Only include USB devices (have VID_ in instance ID)
        if ($id -match 'VID_') {
            Write-Output "$($d.FriendlyName)|$($id)"
        }
    }
    '''
    
    try:
        # Use CREATE_NO_WINDOW flag to prevent command prompt from appearing
        CREATE_NO_WINDOW = 0x08000000
        result = subprocess.run(
            ['powershell', '-NoProfile', '-WindowStyle', 'Hidden', '-Command', ps_script],
            capture_output=True,
            text=True,
            timeout=10,
            creationflags=CREATE_NO_WINDOW
        )
        
        devices = []
        if result.returncode == 0 and result.stdout.strip():
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if '|' in line:
                    parts = line.strip().split('|')
                    if len(parts) >= 2:
                        devices.append({
                            'name': parts[0],
                            'device_id': parts[1]
                        })
        return devices
    except Exception as e:
        print(f"PowerShell scan error: {e}")
        return []


def monitor_loop():
    """Background monitor that continuously checks for devices."""
    while True:
        try:
            devices = get_external_mouse_devices()
            
            if devices:
                usb_state["connected"] = True
                usb_state["device_name"] = devices[0]['name']
                usb_state["device_count"] = len(devices)
                usb_state["debug_info"] = f"Found: {[d['name'] for d in devices]}"
                print(f"[DETECTED] {usb_state['device_name']}")
            else:
                if usb_state["connected"]:  # Only log on state change
                    print("[DISCONNECTED] No USB mouse/sensor")
                usb_state["connected"] = False
                usb_state["device_name"] = None
                usb_state["device_count"] = 0
                usb_state["debug_info"] = "No external USB mouse/sensor found"
        except Exception as e:
            usb_state["debug_info"] = f"Error: {e}"
            print(f"Monitor error: {e}")

        time.sleep(2)


@app.route('/api/usb-status', methods=['GET'])
def get_usb_status():
    """Get current USB sensor status."""
    return jsonify(usb_state)


@app.route('/api/usb-scan', methods=['GET'])
def scan_now():
    """Force an immediate scan and return results."""
    devices = get_external_mouse_devices()
    return jsonify({
        "devices": devices,
        "count": len(devices),
        "connected": len(devices) > 0
    })


if __name__ == '__main__':
    import threading
    
    print("=" * 60)
    print("Fingerprint Sensor Detection Service")
    print("=" * 60)
    print("Detects: USB Mouse, USB Fingerprint/Biometric sensors")
    print("Excludes: Built-in touchpads (no VID_)")
    print("=" * 60)
    
    # Initial scan
    devices = get_external_mouse_devices()
    if devices:
        usb_state["connected"] = True
        usb_state["device_name"] = devices[0]['name']
        usb_state["device_count"] = len(devices)
        print(f"Initial: USB device found - {devices[0]['name']}")
    else:
        print("Initial: No USB mouse/sensor connected")
    
    # Start background monitor
    t = threading.Thread(target=monitor_loop, daemon=True)
    t.start()
    
    print(f"Status API: http://127.0.0.1:5005/api/usb-status")
    print("=" * 60)
    
    app.run(port=5005, host="127.0.0.1", debug=False, use_reloader=False)
