#!/usr/bin/env python3
"""
Vibe Coding Teacher Kit - Model Context Protocol (MCP) Server
표준 MCP (Model Context Protocol) JSON-RPC 2.0 stdio 서버 구현체입니다.
AI 에이전트(Antigravity, Claude Desktop, Cursor 등)가 이 서버에 연결하여
학급운영 도구 프롬프트, 리소스, 소스코드를 실시간 조회하고 생성할 수 있게 합니다.
"""

import sys
import json
import os

# 현재 폴더 기반 서빙
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. MCP 리소스 데이터베이스
RESOURCES = {
    "vibe://prompts/seat_arranger": {
        "name": "자리 배치도 생성 프롬프트",
        "description": "교실 자리 배치 및 드래그앤드롭 기능을 생성하는 제미나이용 프롬프트",
        "mimeType": "text/plain",
        "text": """초등학교 학급운영을 위한 '학급 자리 배치도 생성 프로그램'을 만들어줘. HTML, CSS, JavaScript를 단 하나의 파일로 결합해줘. 조건: 1) 가로/세로 줄 수 설정. 2) 명단 무작위 배치. 3) 드래그 앤 드롭으로 자리 맞교환. 4) localStorage 저장."""
    },
    "vibe://prompts/roulette_picker": {
        "name": "모둠 및 룰렛 추첨기 프롬프트",
        "description": "원형 룰렛, TTS 음성 읽기, 폭죽 효과를 가진 발표자 추첨 프롬프트",
        "mimeType": "text/plain",
        "text": """수업 시간 발표자 추첨 및 모둠 구성기를 단일 HTML 파일로 코딩해줘. 조건: 1) Canvas 룰렛 회전 애니메이션. 2) 당첨 시 모달 팝업 및 브라우저 음성 합성(TTS)으로 이름 읽기. 3) 캔버스 폭죽 효과. 4) 모둠 수 지정 자동 모둠 분배."""
    },
    "vibe://prompts/class_board": {
        "name": "오늘의 학급 안내판 프롬프트",
        "description": "실시간 시간표, 뽀모도로 타이머, 알림장 체크리스트 대시보드 프롬프트",
        "mimeType": "text/plain",
        "text": """교실 TV용 오늘의 학급 안내판 대시보드를 단일 HTML 파일로 만들어줘. 조건: 1) 다크/라이트 테마 토글. 2) 실시간 시계 & 뽀모도로 타이머(알람음 포함). 3) 1~6교시 편집 시간표. 4) 체크리스트 알림장 & 급식/청소 칸. 5) localStorage 자동 보존."""
    },
    "vibe://guide": {
        "name": "AI 개발 사양서 (VIBE_CODING_PROJECT_GUIDE)",
        "description": "단일 파일 HTML, CORS 우회 srcdoc, 오프라인 구현 지침서",
        "mimeType": "text/markdown",
        "text": open(os.path.join(BASE_DIR, "VIBE_CODING_PROJECT_GUIDE.md"), "r", encoding="utf-8").read() if os.path.exists(os.path.join(BASE_DIR, "VIBE_CODING_PROJECT_GUIDE.md")) else "가이드 파일 없음"
    }
}

# 2. MCP 도구(Tools) 목록
TOOLS = [
    {
        "name": "get_training_prompt",
        "description": "선생님들이 제미나이(무료)에 입력할 특정 학급운영 도구의 핵심 프롬프트를 조회합니다.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "tool_name": {
                    "type": "string",
                    "enum": ["seat", "roulette", "board"],
                    "description": "조회할 도구 종류 (seat: 자리배치, roulette: 룰렛, board: 안내판)"
                }
            },
            "required": ["tool_name"]
        }
    },
    {
        "name": "get_portal_urls",
        "description": "연수 포털 및 3대 예제 도구의 로컬/온라인 공개 주소 목록을 반환합니다.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    }
]

def send_response(response):
    """MCP JSON-RPC 응답 전송 유틸리티"""
    sys.stdout.write(json.dumps(response) + "\n")
    sys.stdout.flush()

def handle_request(request):
    """MCP JSON-RPC 요청 처리기"""
    method = request.get("method")
    req_id = request.get("id")

    if method == "initialize":
        send_response({
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "resources": {},
                    "tools": {}
                },
                "serverInfo": {
                    "name": "vibe-coding-mcp-server",
                    "version": "1.0.0"
                }
            }
        })

    elif method == "resources/list":
        res_list = []
        for uri, item in RESOURCES.items():
            res_list.append({
                "uri": uri,
                "name": item["name"],
                "description": item["description"],
                "mimeType": item["mimeType"]
            })
        send_response({
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {"resources": res_list}
        })

    elif method == "resources/read":
        uri = request.get("params", {}).get("uri")
        if uri in RESOURCES:
            send_response({
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "contents": [{
                        "uri": uri,
                        "mimeType": RESOURCES[uri]["mimeType"],
                        "text": RESOURCES[uri]["text"]
                    }]
                }
            })
        else:
            send_response({
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {"code": -32602, "message": f"Resource not found: {uri}"}
            })

    elif method == "tools/list":
        send_response({
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {"tools": TOOLS}
        })

    elif method == "tools/call":
        params = request.get("params", {})
        name = params.get("name")
        args = params.get("arguments", {})

        if name == "get_training_prompt":
            tool_name = args.get("tool_name")
            key_map = {"seat": "vibe://prompts/seat_arranger", "roulette": "vibe://prompts/roulette_picker", "board": "vibe://prompts/class_board"}
            uri = key_map.get(tool_name)
            if uri and uri in RESOURCES:
                prompt_text = RESOURCES[uri]["text"]
                send_response({
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [{
                            "type": "text",
                            "text": f"[{RESOURCES[uri]['name']}]\n\n{prompt_text}"
                        }]
                    }
                })
            else:
                send_response({
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32602, "message": "Invalid tool_name parameter."}
                })

        elif name == "get_portal_urls":
            urls_text = """[바이브 코딩 연수 포털 주소 안내]
- 포털 메인 홈: http://localhost:8000/index.html (또는 ./index.html)
- 📺 연수 슬라이드: http://localhost:8000/slides.html
- 🛠️ 실습 워크벤치: http://localhost:8000/workbench.html
- 📖 초보 가이드북: http://localhost:8000/playbook.html
- 🖨️ 인쇄용 유인물: http://localhost:8000/handout.html
- 🪑 자리 배치도 예제: http://localhost:8000/seat_arranger.html
- 🎉 룰렛 추첨기 예제: http://localhost:8000/roulette_picker.html
- 📅 학급 안내판 예제: http://localhost:8000/class_board.html"""
            send_response({
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": urls_text}]
                }
            })

def main():
    """stdio 기반 메인 루프"""
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
            handle_request(request)
        except Exception as e:
            pass

if __name__ == "__main__":
    main()
