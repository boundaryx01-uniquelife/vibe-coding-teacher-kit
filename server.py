import http.server
import socketserver
import socket
import webbrowser
import os
import sys

PORT = 8000

# 1. 로컬 네트워크 IP 주소 구하기 (연수실 타 교사 접속용)
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

# 2. MIME 타입 보정 (PWA 서비스 워커 및 매니페스트 호환)
class PWAHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # CORS 허용
        self.send_header('Access-Control-Allow-Origin', '*')
        # PWA 캐시 제어
        if self.path.endswith('.js') or self.path.endswith('sw.js'):
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
        elif self.path.endswith('.json') or self.path.endswith('manifest.json'):
            self.send_header('Content-Type', 'application/json; charset=utf-8')
        super().end_headers()

def main():
    # 현재 디렉터리를 서버 루트로 설정
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    local_ip = get_local_ip()
    server_address = ('', PORT)
    
    Handler = PWAHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(server_address, Handler) as httpd:
            print("=" * 65)
            print("  🚀 [바이브 코딩 학급운영 연수 Kit] 웹 서버가 가동되었습니다!")
            print("=" * 65)
            print(f"  📌 강사 PC (내 컴퓨터) 접속 주소 : http://localhost:{PORT}")
            print(f"  📌 같은 와이파이 연수생 교사 접속 주소: http://{local_ip}:{PORT}")
            print("=" * 65)
            print("  💡 브라우저 주소창 우측의 '앱 설치(Install App)'를 누르면 PWA로 설치됩니다.")
            print("  Press Ctrl+C to stop the server.")
            print("=" * 65)
            
            # 브라우저 자동 오픈
            webbrowser.open(f"http://localhost:{PORT}")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n웹 서버를 종료합니다.")
        sys.exit(0)
    except Exception as e:
        print(f"서버 구동 중 에러 발생: {e}")

if __name__ == '__main__':
    main()
