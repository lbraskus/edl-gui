import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import subprocess
import threading
import time
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', os.urandom(24))
socketio = SocketIO(app, cors_allowed_origins='*', async_mode='eventlet')

EDL_SCRIPT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'edl.py')

running_processes = {}

# Known Qualcomm EDL / diagnostic USB IDs
QUALCOMM_IDS = [
    (0x05c6, 0x9008),  # EDL mode (primary)
    (0x05c6, 0x9006),  # EDL alt
    (0x05c6, 0x900e),  # Sahara
    (0x05c6, 0x9025),  # Diag
    (0x05c6, 0x9091),  # Firehose
    (0x413c, 0x81d7),  # Dell DW5811e
    (0x1199, 0x9070),  # Sierra EM7455
    (0x1199, 0x9090),  # Sierra EM7565
]


def scan_usb_devices():
    """Scan for Qualcomm EDL USB devices."""
    results = []
    try:
        import usb.core
        import usb.util
        for vid, pid in QUALCOMM_IDS:
            devices = list(usb.core.find(idVendor=vid, idProduct=pid, find_all=True) or [])
            for dev in devices:
                try:
                    mfg = ''
                    prod = ''
                    try:
                        mfg = usb.util.get_string(dev, dev.iManufacturer) if dev.iManufacturer else ''
                    except Exception:
                        pass
                    try:
                        prod = usb.util.get_string(dev, dev.iProduct) if dev.iProduct else ''
                    except Exception:
                        pass
                    results.append({
                        'type': 'usb',
                        'vid': f'0x{vid:04X}',
                        'pid': f'0x{pid:04X}',
                        'bus': dev.bus,
                        'address': dev.address,
                        'manufacturer': mfg or 'Qualcomm',
                        'product': prod or 'EDL Device',
                    })
                except Exception:
                    results.append({
                        'type': 'usb',
                        'vid': f'0x{vid:04X}',
                        'pid': f'0x{pid:04X}',
                        'bus': '?',
                        'address': '?',
                        'manufacturer': 'Qualcomm',
                        'product': 'EDL Device',
                    })
    except Exception as e:
        pass
    return results


def scan_serial_ports():
    """Scan for available serial ports."""
    ports = []
    try:
        import serial.tools.list_ports
        for p in serial.tools.list_ports.comports():
            ports.append({
                'device': p.device,
                'description': p.description or '',
                'hwid': p.hwid or '',
            })
    except Exception:
        pass
    return ports


def stream_process(sid, cmd, proc):
    try:
        for line in iter(proc.stdout.readline, b''):
            text = line.decode('utf-8', errors='replace')
            socketio.emit('output', {'data': text, 'type': 'stdout'}, room=sid)
        proc.stdout.close()
        for line in iter(proc.stderr.readline, b''):
            text = line.decode('utf-8', errors='replace')
            socketio.emit('output', {'data': text, 'type': 'stderr'}, room=sid)
        proc.stderr.close()
        proc.wait()
        rc = proc.returncode
        socketio.emit('done', {'returncode': rc}, room=sid)
    except Exception as e:
        socketio.emit('output', {'data': f'[Error streaming output: {e}]\n', 'type': 'error'}, room=sid)
        socketio.emit('done', {'returncode': -1}, room=sid)
    finally:
        running_processes.pop(sid, None)


def build_cmd(form):
    args = ['python3', EDL_SCRIPT]
    cmd = form.get('command', '').strip()
    if not cmd:
        return None, 'No command selected'

    if cmd == 'printgpt':
        args.append('printgpt')
    elif cmd == 'gpt':
        directory = form.get('directory', '').strip()
        if not directory:
            return None, 'Directory is required for gpt'
        args += ['gpt', directory]
        if form.get('genxml'):
            args.append('--genxml')
    elif cmd == 'r':
        part = form.get('partition', '').strip()
        fname = form.get('filename', '').strip()
        if not part or not fname:
            return None, 'Partition and filename required'
        args += ['r', part, fname]
    elif cmd == 'rl':
        directory = form.get('directory', '').strip()
        if not directory:
            return None, 'Directory required'
        args += ['rl', directory]
        skip = form.get('skip', '').strip()
        if skip:
            args += ['--skip=' + skip]
        if form.get('genxml'):
            args.append('--genxml')
    elif cmd == 'rf':
        fname = form.get('filename', '').strip()
        if not fname:
            return None, 'Filename required'
        args += ['rf', fname]
    elif cmd == 'rs':
        start = form.get('start_sector', '').strip()
        sectors = form.get('sectors', '').strip()
        fname = form.get('filename', '').strip()
        if not start or not sectors or not fname:
            return None, 'Start sector, sectors count, and filename required'
        args += ['rs', start, sectors, fname]
    elif cmd == 'w':
        part = form.get('partition', '').strip()
        fname = form.get('filename', '').strip()
        if not part or not fname:
            return None, 'Partition and filename required'
        args += ['w', part, fname]
        if form.get('skipwrite'):
            args.append('--skipwrite')
    elif cmd == 'wl':
        directory = form.get('directory', '').strip()
        if not directory:
            return None, 'Directory required'
        args += ['wl', directory]
        skip = form.get('skip', '').strip()
        if skip:
            args += ['--skip=' + skip]
    elif cmd == 'wf':
        fname = form.get('filename', '').strip()
        if not fname:
            return None, 'Filename required'
        args += ['wf', fname]
    elif cmd == 'ws':
        start = form.get('start_sector', '').strip()
        fname = form.get('filename', '').strip()
        if not start or not fname:
            return None, 'Start sector and filename required'
        args += ['ws', start, fname]
    elif cmd == 'e':
        part = form.get('partition', '').strip()
        if not part:
            return None, 'Partition required'
        args += ['e', part]
        if form.get('skipwrite'):
            args.append('--skipwrite')
    elif cmd == 'es':
        start = form.get('start_sector', '').strip()
        sectors = form.get('sectors', '').strip()
        if not start or not sectors:
            return None, 'Start sector and sectors count required'
        args += ['es', start, sectors]
    elif cmd == 'peek':
        offset = form.get('offset', '').strip()
        length = form.get('length', '').strip()
        fname = form.get('filename', '').strip()
        if not offset or not length or not fname:
            return None, 'Offset, length, and filename required'
        args += ['peek', offset, length, fname]
    elif cmd == 'peekhex':
        offset = form.get('offset', '').strip()
        length = form.get('length', '').strip()
        if not offset or not length:
            return None, 'Offset and length required'
        args += ['peekhex', offset, length]
    elif cmd == 'poke':
        offset = form.get('offset', '').strip()
        fname = form.get('filename', '').strip()
        if not offset or not fname:
            return None, 'Offset and filename required'
        args += ['poke', offset, fname]
    elif cmd == 'pokehex':
        offset = form.get('offset', '').strip()
        data = form.get('data', '').strip()
        if not offset or not data:
            return None, 'Offset and data required'
        args += ['pokehex', offset, data]
    elif cmd == 'secureboot':
        args.append('secureboot')
    elif cmd == 'pbl':
        fname = form.get('filename', '').strip()
        if not fname:
            return None, 'Filename required'
        args += ['pbl', fname]
    elif cmd == 'qfp':
        fname = form.get('filename', '').strip()
        if not fname:
            return None, 'Filename required'
        args += ['qfp', fname]
    elif cmd == 'getstorageinfo':
        args.append('getstorageinfo')
    elif cmd == 'getactiveslot':
        args.append('getactiveslot')
    elif cmd == 'setactiveslot':
        slot = form.get('slot', '').strip()
        if not slot:
            return None, 'Slot required (a or b)'
        args += ['setactiveslot', slot]
    elif cmd == 'reset':
        args.append('reset')
        mode = form.get('resetmode', '').strip()
        if mode:
            args.append('--resetmode=' + mode)
    elif cmd == 'nop':
        args.append('nop')
    elif cmd == 'memorydump':
        args.append('memorydump')
        parts = form.get('partitions', '').strip()
        if parts:
            args.append('--partitions=' + parts)
    elif cmd == 'send':
        command_str = form.get('send_command', '').strip()
        if not command_str:
            return None, 'Command string required'
        args += ['send', command_str]
    elif cmd == 'modules':
        mod_cmd = form.get('mod_command', '').strip()
        mod_opts = form.get('mod_options', '').strip()
        if not mod_cmd:
            return None, 'Module command required'
        args += ['modules', mod_cmd, mod_opts]
    else:
        return None, f'Unknown command: {cmd}'

    # Common options
    loader = form.get('loader', '').strip()
    if loader:
        args.append('--loader=' + loader)
    memory = form.get('memory', '').strip()
    if memory:
        args.append('--memory=' + memory)
    lun = form.get('lun', '').strip()
    if lun:
        args.append('--lun=' + lun)
    vid = form.get('vid', '').strip()
    if vid:
        args.append('--vid=' + vid)
    pid = form.get('pid', '').strip()
    if pid:
        args.append('--pid=' + pid)
    portname = form.get('portname', '').strip()
    if portname:
        args.append('--portname=' + portname)
    if form.get('serial'):
        args.append('--serial')
    if form.get('debugmode'):
        args.append('--debugmode')
    if form.get('skipresponse'):
        args.append('--skipresponse')
    if form.get('skipstorageinit'):
        args.append('--skipstorageinit')

    return args, None


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on('scan_device')
def handle_scan_device():
    """Scan for connected Qualcomm EDL devices and serial ports."""
    emit('scan_start')
    usb_devices = scan_usb_devices()
    serial_ports = scan_serial_ports()
    emit('scan_result', {
        'usb': usb_devices,
        'serial': serial_ports,
        'found': len(usb_devices) > 0,
    })


@socketio.on('run_command')
def handle_run_command(data):
    sid = request.sid
    if sid in running_processes:
        emit('output', {'data': '[A command is already running. Please wait or kill it first.]\n', 'type': 'error'})
        return

    args, err = build_cmd(data)
    if err:
        emit('output', {'data': f'[Error: {err}]\n', 'type': 'error'})
        emit('done', {'returncode': -1})
        return

    cmd_display = ' '.join(args[2:])
    emit('output', {'data': f'$ python3 edl.py {cmd_display}\n', 'type': 'cmd'})

    try:
        proc = subprocess.Popen(
            args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        running_processes[sid] = proc
        t = threading.Thread(target=stream_process, args=(sid, args, proc), daemon=True)
        t.start()
    except Exception as e:
        emit('output', {'data': f'[Failed to start process: {e}]\n', 'type': 'error'})
        emit('done', {'returncode': -1})


@socketio.on('kill_command')
def handle_kill():
    sid = request.sid
    proc = running_processes.get(sid)
    if proc:
        proc.terminate()
        emit('output', {'data': '[Process terminated by user]\n', 'type': 'error'})


@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    proc = running_processes.pop(sid, None)
    if proc:
        proc.terminate()


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
