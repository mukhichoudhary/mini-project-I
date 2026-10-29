import uvicorn
import os
import sys
import socket

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    lan_ip = get_lan_ip()
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    env = os.getenv("ENVIRONMENT", os.getenv("APP_ENV", "development")).strip().lower()
    is_prod = env in ("production", "prod")
    reload = not is_prod and os.getenv("RELOAD", "true").lower() == "true"
    docs_info = f"http://localhost:{port}/docs" if not is_prod else "Disabled (production mode)"

    print("=======================================================================")
    print(f"  [*] Starting Bhasha_AI Backend Server on port {port} ({env} mode)...")
    print(f"  * This Computer:     http://localhost:{port}/login.html              ")
    print(f"  * Other Devices:     http://{lan_ip}:{port}/login.html               ")
    print(f"  * Swagger API Docs:  {docs_info}                                     ")
    print(f"  * Network API Base:  http://{lan_ip}:{port}/api                      ")
    print("=======================================================================")
    print(f"  Tip: Connect phone/tablet to the same Wi-Fi and open:")
    print(f"       http://{lan_ip}:{port}/login.html")
    print("=======================================================================")
    uvicorn.run("app.main:app", host=host, port=port, reload=reload)
