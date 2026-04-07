# EDL Tool — Qualcomm Flash Utility

## Overview
A comprehensive Qualcomm Sahara / Firehose attack and diagnostic toolset for reverse engineering, memory dumping, and flashing Qualcomm-based devices in Emergency Download Mode (EDL, USB PID 0x9008) or Diagnostic Mode.

## Tech Stack
- **Language:** Python 3.12
- **Web GUI:** Flask + Flask-SocketIO (real-time command output via WebSockets)
- **Frontend:** Vanilla JS + Socket.IO client (CDN), no build step needed
- **Package manager:** pip
- **Key dependencies:** pyusb, pyserial, lxml, pycryptodome, capstone, keystone-engine, docopt, colorama, Exscript, passlib, requests, pylzma, qrcode, flask, flask-socketio

## Project Structure
- `edl.py` — Main CLI entry point
- `gui/` — Web GUI layer
  - `app.py` — Flask + SocketIO server, wraps edl.py subprocesses
  - `templates/index.html` — Single-page GUI (dark theme, tabbed commands, real-time terminal)
- `edlclient/` — Core package
  - `Library/` — Protocol implementations (Sahara, Firehose, Streaming)
  - `Tools/` — CLI utilities (qc_diag, fhloaderparse, sierrakeygen, etc.)
  - `Config/` — Configuration files (usb_ids, qualcomm_config)
- `Drivers/` — USB driver rules for Linux and Windows
- `Loaders/` — Qualcomm programmer files (submodule, typically empty)
- `Example/` — Usage examples for API and TCP client

## Workflow
- **Start application**: Runs `python3 gui/app.py` on port 5000 (webview)

## GUI Features
- Sidebar: USB connection settings (VID, PID, port, loader, memory type, LUN, flags)
- **Partition Ops tab**: printgpt, gpt, r/rl/rf (read), w/wl/wf (write), e (erase), memorydump
- **Sector Ops tab**: rs (read sectors), ws (write sectors), es (erase sectors)
- **Memory tab**: peek, peekhex, poke, pokehex, secureboot, pbl, qfp
- **Device tab**: getstorageinfo, getactiveslot, setactiveslot, reset, nop, send, modules
- **Advanced tab**: Custom raw argument input
- Real-time terminal output via WebSockets
- Kill running process button

## Installation
All dependencies installed via `pip install -r requirements.txt` plus `pylzma`, `flask`, `flask-socketio`.

## CLI Usage (without GUI)
```bash
python3 edl.py <command> [options]
```
