import { useState, useEffect } from 'react';

interface OCRProgressProps {
  selectedFolderFiles: string[];
  totalFiles: number;
  onCancel?: () => void;
  onComplete?: () => void;
}

interface FileOCRStatus {
  fileName: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
  pagesProcessed?: number;
  totalPages?: number;
  error?: string;
}

export function OCRProgress({
  selectedFolderFiles,
  totalFiles,
  onCancel,
  onComplete
}: OCRProgressProps) {
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(1);
  const [filesProgress, setFilesProgress] = useState<FileOCRStatus[]>([]);
  const [startTime] = useState(new Date());
  const [estimatedEndTime, setEstimatedEndTime] = useState<Date>(new Date(Date.now() + 3 * 60 * 1000));
  
  useEffect(() => {
  let fileIndex = 0;
  let progress = 0;

  // 상태 초기화
  const initialProgress: FileOCRStatus[] = selectedFolderFiles.map((path, i) => ({
    fileName: path.split(/[\\/]/).pop() ?? `문서${i + 1}.pdf`,
    status: 'waiting',
    progress: 0,
    totalPages: Math.floor(Math.random() * 10) + 5,
    pagesProcessed: 0
  }));
  setFilesProgress(initialProgress);

  const estimatedDuration = totalFiles * 20 * 1000;
  setEstimatedEndTime(new Date(Date.now() + estimatedDuration));

  const interval = setInterval(() => {
    setFilesProgress(prev => {
      if (fileIndex >= prev.length) {
        clearInterval(interval);
        return prev;
      }

      const newProgress = [...prev];
      const currentFilePages = newProgress[fileIndex]?.totalPages ?? 10;

      newProgress[fileIndex] = {
        ...newProgress[fileIndex],
        status: 'processing',
        progress: newProgress[fileIndex].progress + 10,
        pagesProcessed: Math.floor(((newProgress[fileIndex].progress + 10) / 100) * currentFilePages)
      };

      if (newProgress[fileIndex].progress >= 100) {
        newProgress[fileIndex].status = 'completed';
        fileIndex++;
      }

      return newProgress;
    });
  }, 150);

  // ✅ cleanup: 이전 interval 완전 제거
  return () => {
    clearInterval(interval);
    setFilesProgress([]); // 상태 초기화 (중복 방지)
  };
}, [selectedFolderFiles, totalFiles]);


  const completedCount = filesProgress.filter(f => f.status === 'completed').length;
  const errorCount = filesProgress.filter(f => f.status === 'error').length;

  const formatTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <div style={{ width: '1440px', height: '900px', position: 'relative', background: '#F9F9F9', overflow: 'hidden' }}>
      <div style={{ width: '1440px', height: '900px', left: '0px', top: '0px', position: 'absolute' }}>
        <div style={{ width: '1440px', height: '844px', left: '0px', top: '56px', position: 'absolute' }}>
          <div style={{ width: '1384px', height: '844px', left: '56px', top: '0px', position: 'absolute', background: 'white' }}>

            {/* 상단 경로 */}
            <div style={{ left: '24px', top: '25px', position: 'absolute' }}>
              <span style={{ color: '#666666', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}>문서 &gt;</span>
              <span style={{ color: 'black', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}> </span>
              <span style={{ color: '#0070F3', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}>OCR 텍스트 추출</span>
            </div>

            <div style={{ width: '1336px', height: '800px', left: '24px', top: '48px', position: 'absolute', background: 'white', borderRadius: '6px', border: '1px #E5E5E5 solid' }}>

              {/* 제목 */}
              <div style={{ left: '17px', top: '17px', position: 'absolute', color: '#666666', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                PDF 문서에서 텍스트를 추출하고 있습니다.
              </div>

              {/* 메인 콘텐츠 */}
              <div style={{ width: '1302px', height: '650px', left: '17px', top: '60px', position: 'absolute' }}>

                {/* 로딩 스피너 */}
                <div style={{ width: '120px', height: '100px', left: '591px', top: '0px', position: 'absolute', overflow: 'hidden' }}>
                  <div style={{ width: '120px', height: '100px', left: '0px', top: '0px', position: 'absolute', background: '#DDDDDD', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="animate-spin" style={{ width: '50px', height: '50px', border: '5px solid #999999', borderTopColor: '#3B82F6', borderRadius: '50%' }}></div>
                  </div>
                </div>

                {/* 상태 텍스트 */}
                <div style={{ width: '400px', left: '451px', top: '110px', position: 'absolute', textAlign: 'center' }}>
                  <div style={{ color: '#333333', fontSize: '14px', fontFamily: 'Roboto', fontWeight: '700', lineHeight: '19px', marginBottom: '8px' }}>
                    OCR 텍스트 추출 진행 중...
                  </div>
                  <div style={{ color: '#999999', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                    {currentFile}/{totalFiles} 파일 처리 중
                  </div>
                </div>

                {/* 진행률 바 */}
                <div style={{ width: '576px', height: '32px', left: '363px', top: '170px', position: 'absolute' }}>
                  <div style={{ width: '576px', height: '16px', left: '0px', top: '0px', position: 'absolute' }}>
                    <div style={{ left: '0px', top: '0px', position: 'absolute', color: '#3B82F6', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                      전체 진행률
                    </div>
                    <div style={{ left: '558.66px', top: '0px', position: 'absolute', color: '#999999', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                      {Math.round(overallProgress)}%
                    </div>
                  </div>
                  <div style={{ width: '576px', height: '12px', left: '0px', top: '20px', position: 'absolute', background: '#E5E5E5', borderRadius: '9999px' }}>
                    <div style={{ width: `${overallProgress * 5.76}px`, height: '12px', left: '0px', top: '0px', position: 'absolute', background: '#3B82F6', borderRadius: '9999px' }}></div>
                  </div>
                </div>

                {/* 상세 정보 */}
                <div style={{ width: '576px', left: '363px', top: '230px', position: 'absolute' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '700', lineHeight: '16px' }}>
                        총 파일 수
                      </div>
                      <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                        {totalFiles}개
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '700', lineHeight: '16px' }}>
                        완료된 파일
                      </div>
                      <div style={{ color: '#10B981', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                        {completedCount}개
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '700', lineHeight: '16px' }}>
                        오류 발생
                      </div>
                      <div style={{ color: errorCount > 0 ? '#EF4444' : '#666666', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                        {errorCount}개
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px', borderTop: '1px solid #E5E5E5', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '700', lineHeight: '16px' }}>
                        시작 시간
                      </div>
                      <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                        {formatTime(startTime)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '700', lineHeight: '16px' }}>
                        종료 예상 시간
                      </div>
                      <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                        {formatTime(estimatedEndTime)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 파일별 진행 상태 */}
                <div style={{ width: '1302px', height: '250px', left: '0px', top: '400px', position: 'absolute', border: '1px solid #E5E5E5', borderRadius: '4px', overflowY: 'auto' }}>
                  <div style={{ padding: '12px' }}>
                    <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '700', marginBottom: '12px' }}>
                      파일별 OCR 진행 상태
                      
                    </div>
                    <div>
                        
                      </div>

                    {filesProgress.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px',
                          borderBottom: '1px solid #F3F3F3',
                          background: file.status === 'completed' ? '#EFF6FF' : file.status === 'error' ? '#FEF2F2' : 'white'
                        }}
                      >
                        <div style={{ width: '30px', color: '#666666', fontSize: '11px' }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1, fontSize: '11px', color: '#333333' }}>
                          {file.fileName}
                        </div>
                        <div style={{ width: '150px', fontSize: '11px', textAlign: 'center' }}>
                          {file.status === 'waiting' && <span style={{ color: '#999999' }}>대기 중</span>}
                          {file.status === 'processing' && (
                            <span style={{ color: '#3B82F6' }}>
                              처리 중 ({file.pagesProcessed}/{file.totalPages} 페이지)
                            </span>
                          )}
                          {file.status === 'completed' && <span style={{ color: '#10B981' }}>완료</span>}
                          {file.status === 'error' && <span style={{ color: '#EF4444' }}>오류</span>}
                        </div>
                        <div style={{ width: '80px', textAlign: 'right', fontSize: '11px', color: '#666666' }}>
                          {file.progress}%
                        </div>
                      </div>
                    ))} 
                  </div>
                </div>

                {/* 버튼 */}
                <div style={{ position: 'absolute', left: '0', right: '0', top: '665px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <div
                    onClick={onCancel}
                    style={{
                      width: '110px',
                      height: '34px',
                      borderRadius: '4px',
                      border: '1px #E5E5E5 solid',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                      목록으로 돌아가기
                    </div>
                  </div>

                  <div
                    onClick={onComplete}
                    style={{
                      width: '74px',
                      height: '34px',
                      borderRadius: '4px',
                      background: '#3B82F6',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div style={{ color: 'white', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                      다음
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
