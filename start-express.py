#!/usr/bin/env python3
"""
Hello Net Browser - Express.js Backend Startup Script
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
🌐 Hello Net Browser - Express.js Edition
==========================================
AI-Powered Mobile Browser with Express.js Backend
    """)

def check_node():
    """Check if Node.js is available"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(f"✅ Node.js: {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"❌ Node.js not found: {e}")
        return False

def check_npm():
    """Check if npm is available"""
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        print(f"✅ npm: {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"❌ npm not found: {e}")
        return False

def install_backend_deps():
    """Install backend dependencies"""
    print("\n🔧 Installing Express.js backend dependencies...")
    server_dir = Path(__file__).parent / "server"
    
    if not server_dir.exists():
        print("❌ Server directory not found!")
        return False
    
    try:
        subprocess.run(["npm", "install"], cwd=server_dir, check=True)
        print("✅ Backend dependencies installed!")
        return True
    except Exception as e:
        print(f"❌ Failed to install backend dependencies: {e}")
        return False

def install_frontend_deps():
    """Install frontend dependencies"""
    print("\n⚛️  Installing React frontend dependencies...")
    
    try:
        if not Path("node_modules").exists():
            subprocess.run(["npm", "install"], check=True)
            print("✅ Frontend dependencies installed!")
        else:
            print("✅ Frontend dependencies already installed!")
        return True
    except Exception as e:
        print(f"❌ Failed to install frontend dependencies: {e}")
        return False

def start_backend():
    """Start the Express.js backend server"""
    print("\n🚀 Starting Express.js Backend...")
    server_dir = Path(__file__).parent / "server"
    
    try:
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=server_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        # Wait for server to start
        time.sleep(3)
        
        if process.poll() is None:
            print("✅ Express.js backend started successfully!")
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
    if not check_node():
        print("Please install Node.js to continue.")
        sys.exit(1)
    
    if not check_npm():
        print("Please install npm to continue.")
        sys.exit(1)
    
    print("\n🚀 Starting Hello Net Browser with Express.js...")
    
    # Install dependencies
    if not install_backend_deps():
        print("❌ Failed to install backend dependencies.")
        sys.exit(1)
    
    if not install_frontend_deps():
        print("❌ Failed to install frontend dependencies.")
        sys.exit(1)
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Failed to start Express.js backend.")
        sys.exit(1)
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ Failed to start React frontend.")
        if backend_process:
            backend_process.terminate()
        sys.exit(1)
    
    # Open browser in a separate thread
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    print("\n" + "="*60)
    print("🎉 Hello Net Browser is running!")
    print("📱 Frontend: http://localhost:3000")
    print("🔧 Backend:  http://localhost:8000")
    print("📚 API Docs: http://localhost:8000 (JSON endpoints)")
    print("🛑 Press Ctrl+C to stop all servers")
    print("="*60)
    
    try:
        # Wait for processes
        while True:
            if frontend_process.poll() is not None:
                print("❌ Frontend process stopped")
                break
            if backend_process.poll() is not None:
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