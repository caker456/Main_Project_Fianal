#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
서비스 상태 확인 스크립트
BERT 분류 및 Ollama 연결 테스트
"""

import sys
import requests

print("="*60)
print("🔍 서비스 상태 확인")
print("="*60)
print()

# 1. Classification Service 테스트
print("1️⃣ BERT 분류 서비스 테스트")
print("-" * 60)

try:
    from classification_service import get_classification_service

    print(f"✓ classification_service import 성공")

    # Context manager로 테스트 - 자동 메모리 해제
    with get_classification_service() as classifier:
        print(f"  Model loaded: {classifier.model is not None}")
        print(f"  Device: {classifier.device}")

        # 테스트 분류
        test_text = "국회 법제사법위원회의 체계자구검토보고서입니다. 선박직원법 일부개정법률안에 대한 내용을 담고 있습니다."
        print(f"\n📝 테스트 텍스트: {test_text[:50]}...")

        result = classifier.predict(test_text, return_probs=True)

        print(f"\n✅ 분류 결과:")
        print(f"  기관: {result.get('기관')} (신뢰도: {result.get('confidence', {}).get('기관', 0):.2%})")
        print(f"  문서유형: {result.get('문서유형')} (신뢰도: {result.get('confidence', {}).get('문서유형', 0):.2%})")

        if result.get('기관') == 'Unknown':
            print(f"\n⚠️  경고: Unknown 결과 반환")
            print(f"  에러: {result.get('error', 'N/A')}")
        else:
            print(f"\n✓ BERT 분류 정상 작동")

except ImportError as e:
    print(f"❌ classification_service import 실패")
    print(f"   에러: {e}")
except Exception as e:
    print(f"❌ 예외 발생: {e}")
    import traceback
    traceback.print_exc()

print()
print()

# 2. Ollama 연결 테스트
print("2️⃣ Ollama (Gemma3) 연결 테스트")
print("-" * 60)

try:
    # Ollama API 테스트
    ollama_url = "http://localhost:11434/api/generate"
    test_payload = {
        "model": "gemma3:4b",
        "prompt": "안녕하세요",
        "stream": False
    }

    print(f"📡 Ollama API 호출 중... ({ollama_url})")
    response = requests.post(ollama_url, json=test_payload, timeout=5)

    if response.status_code == 200:
        result = response.json()
        response_text = result.get('response', '')
        print(f"\n✅ Ollama 연결 성공!")
        print(f"  모델: gemma3:4b")
        print(f"  응답: {response_text[:100]}...")
    else:
        print(f"\n❌ Ollama API 오류: {response.status_code}")
        print(f"  응답: {response.text[:200]}")

except requests.exceptions.ConnectionError:
    print(f"\n❌ Ollama 서버에 연결할 수 없습니다")
    print(f"  해결 방법:")
    print(f"    1. Ollama 설치: https://ollama.com/download")
    print(f"    2. Ollama 실행: ollama serve")
    print(f"    3. 모델 다운로드: ollama pull gemma3:4b")
except requests.exceptions.Timeout:
    print(f"\n❌ Ollama 응답 시간 초과")
    print(f"  Ollama 서버가 응답하지 않습니다")
except Exception as e:
    print(f"\n❌ 예외 발생: {e}")

print()
print()

# 3. OCR Service 테스트
print("3️⃣ OCR 서비스 테스트")
print("-" * 60)

try:
    from ocr_service import get_ocr_service, OCR_AVAILABLE

    print(f"✓ ocr_service import 성공")
    print(f"  OCR_AVAILABLE: {OCR_AVAILABLE}")

    if OCR_AVAILABLE:
        print(f"✓ OCR 서비스 정상 (lazy loading 방식)")
    else:
        print(f"⚠️  OCR 서비스를 사용할 수 없습니다")

except ImportError as e:
    print(f"❌ ocr_service import 실패")
    print(f"   에러: {e}")
except Exception as e:
    print(f"❌ 예외 발생: {e}")

print()
print("="*60)
print("테스트 완료")
print("="*60)
print()

# 요약
print("📊 서비스 상태 요약:")
print("-" * 60)

services = []

try:
    from classification_service import get_classification_service
    # Lazy loading 방식이므로 import만 성공하면 OK
    services.append(("BERT 분류", "✓ 정상 (lazy loading)"))
except:
    services.append(("BERT 분류", "❌ 로드 실패"))

try:
    response = requests.post("http://localhost:11434/api/generate",
                            json={"model": "gemma3:4b", "prompt": "test", "stream": False},
                            timeout=2)
    ollama_ok = response.status_code == 200
    services.append(("Ollama (Gemma3)", "✓ 정상" if ollama_ok else "❌ 오류"))
except:
    services.append(("Ollama (Gemma3)", "❌ 연결 불가"))

try:
    from ocr_service import get_ocr_service, OCR_AVAILABLE
    status = "✓ 정상 (lazy loading)" if OCR_AVAILABLE else "⚠️  사용 불가"
    services.append(("OCR", status))
except:
    services.append(("OCR", "❌ 로드 실패"))

for service_name, status in services:
    print(f"  {service_name:<20} {status}")

print()
print("다음 명령으로 서버를 실행하세요:")
print("  python app.py")
print()
