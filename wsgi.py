import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from gui.app import app, socketio

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
