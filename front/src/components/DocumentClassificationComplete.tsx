import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DocumentClassificationCompleteProps {
  totalFiles: number;
  onConfirm?: () => void;
}

interface ClassificationResult {
  fileName: string;
  category: string;
  confidence: number;
  needsReview: boolean;
  extractedText: string;
  summary: string;
  keywords: string[];
}

export function DocumentClassificationComplete({
  totalFiles,
  onConfirm
}: DocumentClassificationCompleteProps) {
  // 샘플 분류 결과 (실제로는 백엔드에서 받아와야 함)
  const [results] = useState<ClassificationResult[]>(() => {
    const categories = ['의안원문', '심사보고서', '검토보고서', '위원회의결안', '비용추계서', '본회의수정안'];
    const sampleResults: ClassificationResult[] = [];

    for (let i = 0; i < totalFiles; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomConfidence = 0.65 + Math.random() * 0.34; // 0.65 ~ 0.99

      sampleResults.push({
        fileName: `문서${i + 1}.pdf`,
        category: randomCategory,
        confidence: randomConfidence,
        needsReview: randomConfidence < 0.7,
        extractedText: '법률안 전문 텍스트...',
        summary: `이 문서는 ${randomCategory}에 관한 내용을 담고 있습니다.`,
        keywords: ['법률', '개정', '심사', '위원회', '의결']
      });
    }

    return sampleResults;
  });

  const successCount = results.filter(r => !r.needsReview).length;
  const reviewCount = results.filter(r => r.needsReview).length;
  const successRate = Math.round((successCount / totalFiles) * 100);

  const [selectedResult, setSelectedResult] = useState<ClassificationResult | null>(null);

  return (
    <div style={{ width: '1440px', height: '900px', position: 'relative', background: '#F9F9F9' }}>
      <div style={{ width: '1440px', height: '844px', left: '0px', top: '56px', position: 'absolute' }}>
        <div style={{ width: '1384px', height: '844px', left: '56px', top: '0px', position: 'absolute', background: 'white' }}>

          {/* 상단 경로 */}
          <div style={{ left: '24px', top: '25px', position: 'absolute' }}>
            <span style={{ color: '#666666', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}>문서 &gt;</span>
            <span style={{ color: 'black', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}> </span>
            <span style={{ color: '#0070F3', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}>분류 완료</span>
          </div>

          <div style={{ width: '1336px', height: '800px', left: '24px', top: '24px', position: 'absolute', background: 'white', borderRadius: '6px', border: '1px #E5E5E5 solid' }}>

            {/* 완료 아이콘 및 메시지 */}
            <div style={{ textAlign: 'center', paddingTop: '40px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: '#10B981', borderRadius: '50%', marginBottom: '16px' }}>
                <CheckCircle style={{ width: '48px', height: '48px', color: 'white' }} />
              </div>
              <div style={{ color: '#333333', fontSize: '18px', fontFamily: 'Roboto', fontWeight: '700', marginBottom: '8px' }}>
                문서 분류가 완료되었습니다
              </div>
              <div style={{ color: '#666666', fontSize: '13px', fontFamily: 'Roboto', fontWeight: '400' }}>
                총 {totalFiles}개 파일 중 {successCount}개 성공, {reviewCount}개 검토 필요
              </div>
            </div>

            {/* 통계 요약 */}
            <div style={{ width: '600px', margin: '32px auto', padding: '24px', background: '#F9F9F9', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#999999', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', marginBottom: '8px' }}>
                    총 파일 수
                  </div>
                  <div style={{ color: '#333333', fontSize: '24px', fontFamily: 'Roboto', fontWeight: '700' }}>
                    {totalFiles}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#999999', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', marginBottom: '8px' }}>
                    분류 성공
                  </div>
                  <div style={{ color: '#10B981', fontSize: '24px', fontFamily: 'Roboto', fontWeight: '700' }}>
                    {successCount}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#999999', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', marginBottom: '8px' }}>
                    검토 필요
                  </div>
                  <div style={{ color: '#F59E0B', fontSize: '24px', fontFamily: 'Roboto', fontWeight: '700' }}>
                    {reviewCount}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#999999', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', marginBottom: '8px' }}>
                    성공률
                  </div>
                  <div style={{ color: '#4A658F', fontSize: '24px', fontFamily: 'Roboto', fontWeight: '700' }}>
                    {successRate}%
                  </div>
                </div>
              </div>
            </div>

            {/* 분류 결과 테이블 */}
            <div style={{ width: '1288px', height: '350px', margin: '0 24px', border: '1px solid #E5E5E5', borderRadius: '4px', overflowY: 'auto' }}>
              {/* 테이블 헤더 */}
              <div style={{ display: 'flex', background: '#F9F9F9', borderBottom: '1px solid #E5E5E5', padding: '12px', fontWeight: '700', fontSize: '12px', position: 'sticky', top: 0, zIndex: 1 }}>
                <div style={{ width: '40px', textAlign: 'center' }}>No</div>
                <div style={{ flex: 1 }}>파일명</div>
                <div style={{ width: '150px', textAlign: 'center' }}>카테고리</div>
                <div style={{ width: '100px', textAlign: 'center' }}>신뢰도</div>
                <div style={{ width: '80px', textAlign: 'center' }}>상태</div>
                <div style={{ width: '100px', textAlign: 'center' }}>작업</div>
              </div>

              {/* 테이블 내용 */}
              {results.map((result, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    borderBottom: '1px solid #F3F3F3',
                    background: selectedResult === result ? '#EEF2FF' : 'white',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedResult(result)}
                >
                  <div style={{ width: '40px', textAlign: 'center', fontSize: '11px', color: '#666666' }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, fontSize: '12px', color: '#333333' }}>
                    {result.fileName}
                  </div>
                  <div style={{ width: '150px', textAlign: 'center', fontSize: '12px', color: '#4A658F', fontWeight: '600' }}>
                    {result.category}
                  </div>
                  <div style={{ width: '100px', textAlign: 'center', fontSize: '12px' }}>
                    <span style={{ color: result.confidence >= 0.7 ? '#10B981' : '#F59E0B' }}>
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                  <div style={{ width: '80px', textAlign: 'center' }}>
                    {result.needsReview ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', background: '#FEF3C7', borderRadius: '12px' }}>
                        <AlertCircle style={{ width: '12px', height: '12px', color: '#F59E0B', marginRight: '4px' }} />
                        <span style={{ fontSize: '10px', color: '#F59E0B' }}>검토</span>
                      </div>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', background: '#D1FAE5', borderRadius: '12px' }}>
                        <CheckCircle style={{ width: '12px', height: '12px', color: '#10B981', marginRight: '4px' }} />
                        <span style={{ fontSize: '10px', color: '#10B981' }}>완료</span>
                      </div>
                    )}
                  </div>
                  <div style={{ width: '100px', textAlign: 'center' }}>
                    <button
                      style={{
                        padding: '4px 12px',
                        border: '1px solid #E5E5E5',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#666666'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedResult(result);
                      }}
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 확인 버튼 */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={onConfirm}
                style={{
                  padding: '10px 32px',
                  background: '#2F4F8A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 상세보기 모달 */}
      {selectedResult && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedResult(null)}
        >
          <div
            style={{
              width: '800px',
              maxHeight: '80vh',
              background: 'white',
              borderRadius: '8px',
              padding: '24px',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#333333' }}>
                분류 상세 정보
              </h3>
              <button
                onClick={() => setSelectedResult(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999999'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#999999', marginBottom: '4px' }}>파일명</div>
              <div style={{ fontSize: '14px', color: '#333333', fontWeight: '600' }}>{selectedResult.fileName}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#999999', marginBottom: '4px' }}>분류 카테고리</div>
              <div style={{ fontSize: '14px', color: '#4A658F', fontWeight: '700' }}>{selectedResult.category}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#999999', marginBottom: '4px' }}>신뢰도</div>
              <div style={{ fontSize: '14px', color: selectedResult.confidence >= 0.7 ? '#10B981' : '#F59E0B', fontWeight: '600' }}>
                {Math.round(selectedResult.confidence * 100)}%
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#999999', marginBottom: '4px' }}>요약</div>
              <div style={{ fontSize: '13px', color: '#333333', lineHeight: '1.6', padding: '12px', background: '#F9F9F9', borderRadius: '4px' }}>
                {selectedResult.summary}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#999999', marginBottom: '8px' }}>키워드</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedResult.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 12px',
                      background: '#EEF2FF',
                      color: '#4A658F',
                      borderRadius: '16px',
                      fontSize: '11px'
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#999999', marginBottom: '4px' }}>추출된 텍스트 (미리보기)</div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#666666',
                  lineHeight: '1.6',
                  padding: '12px',
                  background: '#F9F9F9',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}
              >
                {selectedResult.extractedText}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
