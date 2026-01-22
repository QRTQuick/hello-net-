#!/usr/bin/env python3
"""
Hello Net Browser - Full Stack Startup Script
Starts both the Python backend and React frontend
"""
import subprocess
import sys
import os
import time
import threading
import webbrowser
from pathlib import Path

def print_banner():
    print("""
🌐 Hello Net Browser
=====================
AI-Powered Mobile Browser with Backend Proxy
    """)

def check_python():
    """Check if Python is available"""
    try:
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        print(f"✅ Python: {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"❌ Python not found: {e}")
        return False

def check_node():
    """Check if Node.js is available"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(f"✅ Node.js: {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"❌ Node.js not found: {e}")
        return False

def start_backend():
    """Start the Python backend server"""
    print("\n🐍 Starting Python Backend...")
    backend_dir = Path(__file__).parent / "backend"
    
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return None
    
    try:
        # Change to backend directory and start server
        process = subprocess.Popen(
            [sys.executable, "start.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Wait a moment for server to start
        time.sleep(3)
        
        if process.poll() is None:
            print("✅ Backend server started successfully!")
            print("📍 Backend URL: http://localhost:8000")
            return process
        else:
            print("❌ Backend failed to start")
            return None
            
    except Exception as e:
        print(f"❌ Backend startup error: {e}")
        return None

def start_frontend():
    """Start the React frontend"""
    print("\n⚛️  Starting React Frontend...")
    
    try:
        # Check if node_modules exists
        if not Path("node_modules").exists():
            print("📦 Installing frontend dependencies...")
            subprocess.run(["npm", "install"], check=True)
        
        # Start the development server
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Wait for frontend to start
        time.sleep(5)
        
        if process.poll() is None:
            print("✅ Frontend server started successfully!")
            print("📍 Frontend URL: http://localhost:3000")
            return process
        else:
            print("❌ Frontend failed to start")
            return None
            
    except Exception as e:
        print(f"❌ Frontend startup error: {e}")
        return None

def open_browser():
    """Open the browser after a delay"""
    time.sleep(8)  # Wait for both servers to be ready
    print("\n🚀 Opening Hello Net Browser...")
    webbrowser.open("http://localhost:3000")

def main():
    print_banner()
    
    # Check prerequisites
    if not check_python():
        print("Please install Python 3.7+ to continue.")
        sys.exit(1)
    
    if not check_node():
        print("Please install Node.js to continue.")
        sys.exit(1)
    
    print("\n🚀 Starting Hello Net Browser...")
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Failed to start backend. Continuing with frontend only...")
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ Failed to start frontend.")
        if backend_process:
            backend_process.terminate()
        sys.exit(1)
    
    # Open browser in a separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    print("\n" + "="*50)
    print("🎉 Hello Net Browser is running!")
    print("📱 Frontend: http://localhost:3000")
    if backend_process:
        print("🔧 Backend:  http://localhost:8000")
        print("📚 API Docs: http://localhost:8000/docs")
    print("🛑 Press Ctrl+C to stop all servers")
    print("="*50)
    
    try:
        # Wait for processes
        while True:
            if frontend_process.poll() is not None:
                print("❌ Frontend process stopped")
                break
            if backend_process and backend_process.poll() is not None:
                print("❌ Backend process stopped")
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down Hello Net Browser...")
        
        if frontend_process:
            frontend_process.terminate()
            print("✅ Frontend stopped")
        
        if backend_process:
            backend_process.terminate()
            print("✅ Backend stopped")
        
        print("👋 Goodbye!")

if __name__ == "__main__":
    main()