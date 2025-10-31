import { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, FileText } from 'lucide-react';

interface HistoryItem {
  id: string;
  fileName: string;
  fullPath: string; // 전체 경로 (예: "재무보고서/분기별/2024년_1분기_재무보고서.pdf")
  confidence: number;
  changeDate: string;
  changeType: 'created' | 'updated' | 'deleted';
  previousCategory?: string;
}

interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
  files: HistoryItem[];
  isExpanded?: boolean;
}

export function ChangeHistory() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null); // 선택된 최상위 폴더
  const [viewMode, setViewMode] = useState<'cards' | 'tree'>('cards'); // 카드 보기 vs 트리 보기

  // 샘플 데이터 - 계층적 폴더 구조 확인용
  const historyData: HistoryItem[] = [
    // 재무보고서 - 다양한 하위 폴더
    {
      id: '1',
      fileName: '2024년_1분기_재무보고서.pdf',
      fullPath: '재무보고서/분기별/2024/Q1/2024년_1분기_재무보고서.pdf',
      confidence: 95,
      changeDate: '2024-09-12 14:23:15',
      changeType: 'created'
    },
    {
      id: '2',
      fileName: '2024년_2분기_재무보고서.pdf',
      fullPath: '재무보고서/분기별/2024/Q2/2024년_2분기_재무보고서.pdf',
      confidence: 93,
      changeDate: '2024-09-12 14:23:10',
      changeType: 'created'
    },
    {
      id: '3',
      fileName: '2023년_4분기_재무보고서.pdf',
      fullPath: '재무보고서/분기별/2023/Q4/2023년_4분기_재무보고서.pdf',
      confidence: 94,
      changeDate: '2024-09-12 14:23:08',
      changeType: 'created'
    },
    {
      id: '4',
      fileName: '2024년_연간_재무보고서.pdf',
      fullPath: '재무보고서/연간/2024/2024년_연간_재무보고서.pdf',
      confidence: 96,
      changeDate: '2024-09-12 14:23:05',
      changeType: 'created'
    },
    {
      id: '5',
      fileName: '2023년_연간_재무보고서.pdf',
      fullPath: '재무보고서/연간/2023/2023년_연간_재무보고서.pdf',
      confidence: 97,
      changeDate: '2024-09-12 14:23:00',
      changeType: 'created'
    },
    {
      id: '6',
      fileName: '감사보고서_2024.pdf',
      fullPath: '재무보고서/감사/2024/감사보고서_2024.pdf',
      confidence: 92,
      changeDate: '2024-09-12 14:22:55',
      changeType: 'created'
    },

    // 인사관리 - 여러 계층
    {
      id: '7',
      fileName: '신입사원_채용공고_2024.pdf',
      fullPath: '인사관리/채용/신입/공고/신입사원_채용공고_2024.pdf',
      confidence: 88,
      changeDate: '2024-09-12 14:22:48',
      changeType: 'created',
    },
    {
      id: '8',
      fileName: '신입사원_면접평가표.pdf',
      fullPath: '인사관리/채용/신입/평가/신입사원_면접평가표.pdf',
      confidence: 90,
      changeDate: '2024-09-12 14:22:45',
      changeType: 'created'
    },
    {
      id: '9',
      fileName: '경력사원_채용공고_2024.pdf',
      fullPath: '인사관리/채용/경력/공고/경력사원_채용공고_2024.pdf',
      confidence: 90,
      changeDate: '2024-09-12 14:22:40',
      changeType: 'created'
    },
    {
      id: '10',
      fileName: '인사고과_평가표_2024.pdf',
      fullPath: '인사관리/평가/연간평가/2024/인사고과_평가표_2024.pdf',
      confidence: 91,
      changeDate: '2024-09-12 14:22:30',
      changeType: 'created'
    },
    {
      id: '11',
      fileName: '승진심사_자료.pdf',
      fullPath: '인사관리/평가/승진심사/2024/승진심사_자료.pdf',
      confidence: 89,
      changeDate: '2024-09-12 14:22:25',
      changeType: 'created'
    },
    {
      id: '12',
      fileName: '급여명세서_양식.pdf',
      fullPath: '인사관리/급여/양식/급여명세서_양식.pdf',
      confidence: 95,
      changeDate: '2024-09-12 14:22:20',
      changeType: 'created'
    },

    // 마케팅기획
    {
      id: '13',
      fileName: '마케팅_전략_기획안_Q3.pdf',
      fullPath: '마케팅기획/전략/분기별/Q3/마케팅_전략_기획안_Q3.pdf',
      previousCategory: '기획관리',
      confidence: 72,
      changeDate: '2024-09-12 14:20:33',
      changeType: 'updated'
    },
    {
      id: '14',
      fileName: '연간_마케팅_전략.pdf',
      fullPath: '마케팅기획/전략/연간/2024/연간_마케팅_전략.pdf',
      confidence: 86,
      changeDate: '2024-09-12 14:20:28',
      changeType: 'created'
    },
    {
      id: '15',
      fileName: 'SNS_마케팅_캠페인.pdf',
      fullPath: '마케팅기획/캠페인/디지털/SNS/SNS_마케팅_캠페인.pdf',
      confidence: 85,
      changeDate: '2024-09-12 14:20:15',
      changeType: 'created'
    },
    {
      id: '16',
      fileName: '이메일_마케팅_가이드.pdf',
      fullPath: '마케팅기획/캠페인/디지털/이메일/이메일_마케팅_가이드.pdf',
      confidence: 83,
      changeDate: '2024-09-12 14:20:10',
      changeType: 'created'
    },
    {
      id: '17',
      fileName: 'TV광고_기획안.pdf',
      fullPath: '마케팅기획/캠페인/오프라인/TV광고/TV광고_기획안.pdf',
      confidence: 88,
      changeDate: '2024-09-12 14:20:05',
      changeType: 'created'
    },

    // 경영관리 - 깊은 계층 구조
    {
      id: '18',
      fileName: '회의록_경영전략회의_20240910.pdf',
      fullPath: '경영관리/회의록/전략회의/2024/09/회의록_경영전략회의_20240910.pdf',
      confidence: 92,
      changeDate: '2024-09-12 14:18:12',
      changeType: 'created'
    },
    {
      id: '19',
      fileName: '회의록_경영전략회의_20240903.pdf',
      fullPath: '경영관리/회의록/전략회의/2024/09/회의록_경영전략회의_20240903.pdf',
      confidence: 91,
      changeDate: '2024-09-12 14:18:10',
      changeType: 'created'
    },
    {
      id: '20',
      fileName: '회의록_임원회의_20240905.pdf',
      fullPath: '경영관리/회의록/임원회의/2024/09/회의록_임원회의_20240905.pdf',
      confidence: 94,
      changeDate: '2024-09-12 14:18:05',
      changeType: 'created'
    },
    {
      id: '21',
      fileName: '회의록_부서장회의_20240908.pdf',
      fullPath: '경영관리/회의록/부서장회의/2024/09/회의록_부서장회의_20240908.pdf',
      confidence: 90,
      changeDate: '2024-09-12 14:18:02',
      changeType: 'created'
    },
    {
      id: '22',
      fileName: '월간_경영_보고서_9월.pdf',
      fullPath: '경영관리/보고서/월간/2024/09/월간_경영_보고서_9월.pdf',
      confidence: 89,
      changeDate: '2024-09-12 14:18:00',
      changeType: 'created'
    },
    {
      id: '23',
      fileName: '월간_경영_보고서_8월.pdf',
      fullPath: '경영관리/보고서/월간/2024/08/월간_경영_보고서_8월.pdf',
      confidence: 88,
      changeDate: '2024-09-12 14:17:55',
      changeType: 'created'
    },
    {
      id: '24',
      fileName: '분기_경영_보고서_Q2.pdf',
      fullPath: '경영관리/보고서/분기별/2024/Q2/분기_경영_보고서_Q2.pdf',
      confidence: 93,
      changeDate: '2024-09-12 14:17:50',
      changeType: 'created'
    },

    // 프로젝트관리
    {
      id: '25',
      fileName: '프로젝트_제안서_2024.pdf',
      fullPath: '프로젝트관리/제안서/내부/2024/프로젝트_제안서_2024.pdf',
      previousCategory: '일반문서',
      confidence: 85,
      changeDate: '2024-09-12 13:45:22',
      changeType: 'updated'
    },
    {
      id: '26',
      fileName: '고객사_제안서.pdf',
      fullPath: '프로젝트관리/제안서/외부/고객사A/고객사_제안서.pdf',
      confidence: 87,
      changeDate: '2024-09-12 13:45:18',
      changeType: 'created'
    },
    {
      id: '27',
      fileName: '프로젝트_진행상황_보고.pdf',
      fullPath: '프로젝트관리/진행보고/주간/2024/9월/프로젝트_진행상황_보고.pdf',
      confidence: 87,
      changeDate: '2024-09-12 13:45:10',
      changeType: 'created'
    },
    {
      id: '28',
      fileName: '프로젝트_완료보고서.pdf',
      fullPath: '프로젝트관리/완료보고/2024/프로젝트A/프로젝트_완료보고서.pdf',
      confidence: 91,
      changeDate: '2024-09-12 13:45:05',
      changeType: 'created'
    },

    // 기술개발
    {
      id: '29',
      fileName: '기술개발_계획서.pdf',
      fullPath: '기술개발/계획/연간/2024/기술개발_계획서.pdf',
      confidence: 84,
      changeDate: '2024-09-12 13:40:00',
      changeType: 'created'
    },
    {
      id: '30',
      fileName: '특허출원_신청서.pdf',
      fullPath: '기술개발/특허/출원/2024/특허출원_신청서.pdf',
      confidence: 92,
      changeDate: '2024-09-12 13:39:55',
      changeType: 'created'
    },
    {
      id: '31',
      fileName: '연구개발_보고서.pdf',
      fullPath: '기술개발/연구/프로젝트A/보고서/연구개발_보고서.pdf',
      confidence: 88,
      changeDate: '2024-09-12 13:39:50',
      changeType: 'created'
    }
  ];

  // 경로를 기반으로 폴더 트리 구조 생성
  const buildFolderTree = (): FolderNode[] => {
    const root: { [key: string]: any } = {};

    historyData.forEach(item => {
      const parts = item.fullPath.split('/');
      const fileName = parts.pop()!; // 파일명 제거

      let current = root;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!current[part]) {
          current[part] = {
            _meta: {
              name: part,
              path: currentPath,
              files: []
            },
            // 하위 폴더들을 여기에 추가
          };
        }

        // 마지막 폴더라면 파일 추가
        if (index === parts.length - 1) {
          current[part]._meta.files.push(item);
        }

        // 다음 레벨로 이동
        current = current[part];
      });
    });

    // 중첩된 객체를 FolderNode 배열로 변환
    const convertToNodes = (obj: any): FolderNode[] => {
      const nodes: FolderNode[] = [];

      for (const key in obj) {
        if (key === '_meta') continue;

        const meta = obj[key]._meta;
        const children = convertToNodes(obj[key]);

        nodes.push({
          name: meta.name,
          path: meta.path,
          files: meta.files,
          children: children
        });
      }

      return nodes;
    };

    return convertToNodes(root);
  };

  const folderTree = buildFolderTree();

  // 최상위 폴더와 파일 개수 추출
  const getTopLevelFolders = () => {
    const folders: { [key: string]: number } = {};

    historyData.forEach(item => {
      const topFolder = item.fullPath.split('/')[0];
      folders[topFolder] = (folders[topFolder] || 0) + 1;
    });

    return Object.entries(folders).map(([name, count]) => ({ name, count }));
  };

  const topLevelFolders = getTopLevelFolders();

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFolderCardClick = (folderName: string) => {
    setSelectedFolder(folderName);
    setViewMode('tree');
  };

  const handleBackToCards = () => {
    setSelectedFolder(null);
    setViewMode('cards');
    setSelectedFile(null);
  };

  // 선택된 폴더의 트리만 필터링
  const getFilteredTree = () => {
    if (!selectedFolder) return folderTree;
    return folderTree.filter(node => node.name === selectedFolder);
  };

  const selectedFileData = selectedFile ? historyData.find(item => item.id === selectedFile) : null;

  // 재귀적으로 폴더 트리 렌더링
  const renderFolderTree = (nodes: FolderNode[], depth: number = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedFolders.has(node.path);
      const hasChildren = node.children && node.children.length > 0;
      const hasFiles = node.files && node.files.length > 0;

      return (
        <div key={node.path}>
          {/* 폴더 */}
          <div
            onClick={() => toggleFolder(node.path)}
            style={{
              paddingLeft: `${depth * 20 + 16}px`,
              paddingRight: '16px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              background: 'white',
              borderBottom: '1px solid #F3F3F3'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9F9F9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
            }}
          >
            {(hasChildren || hasFiles) && (
              isExpanded ?
                <ChevronDown style={{ width: '16px', height: '16px', color: '#666666', flexShrink: 0 }} /> :
                <ChevronRight style={{ width: '16px', height: '16px', color: '#666666', flexShrink: 0 }} />
            )}
            {!hasChildren && !hasFiles && <div style={{ width: '16px' }} />}
            <Folder style={{ width: '18px', height: '18px', color: '#F59E0B', flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: '13px', fontFamily: 'Roboto', fontWeight: '600', color: '#333333' }}>
              {node.name}
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'Roboto', color: '#999999' }}>
              {node.files.length > 0 && `${node.files.length}개`}
            </div>
          </div>

          {/* 하위 폴더 */}
          {isExpanded && hasChildren && renderFolderTree(node.children, depth + 1)}

          {/* 파일 목록 */}
          {isExpanded && hasFiles && node.files
            .filter(file => filterType === 'all' || file.changeType === filterType)
            .map((file, index) => (
            <div
              key={file.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(file.id);
              }}
              style={{
                paddingLeft: `${(depth + 1) * 20 + 16}px`,
                paddingRight: '16px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                background: selectedFile === file.id ? '#EEF2FF' : 'white',
                borderBottom: '1px solid #F3F3F3'
              }}
              onMouseEnter={(e) => {
                if (selectedFile !== file.id) {
                  e.currentTarget.style.background = '#F9F9F9';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFile !== file.id) {
                  e.currentTarget.style.background = 'white';
                }
              }}
            >
              <div style={{ width: '16px' }} />
              <FileText style={{ width: '16px', height: '16px', color: '#666666', flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '12px', fontFamily: 'Roboto', color: '#333333' }}>
                {file.fileName}
              </div>
              <div style={{ marginRight: '8px' }}>
                {file.changeType === 'created' && (
                  <span style={{ padding: '2px 6px', background: '#DBEAFE', color: '#1E40AF', borderRadius: '10px', fontSize: '9px', fontWeight: '600' }}>
                    신규
                  </span>
                )}
                {file.changeType === 'updated' && (
                  <span style={{ padding: '2px 6px', background: '#FEF3C7', color: '#F59E0B', borderRadius: '10px', fontSize: '9px', fontWeight: '600' }}>
                    변경
                  </span>
                )}
                {file.changeType === 'deleted' && (
                  <span style={{ padding: '2px 6px', background: '#FEE2E2', color: '#DC2626', borderRadius: '10px', fontSize: '9px', fontWeight: '600' }}>
                    삭제
                  </span>
                )}
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'Roboto', color: '#999999', width: '110px', textAlign: 'right' }}>
                {file.changeDate.substring(5)}
              </div>
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div style={{ width: '1440px', height: '900px', position: 'relative', background: '#F9F9F9', overflow: 'hidden' }}>
      <div style={{ width: '1440px', height: '900px', left: '0px', top: '0px', position: 'absolute' }}>
        <div style={{ width: '1440px', height: '844px', left: '0px', top: '56px', position: 'absolute' }}>
          <div style={{ width: '1384px', height: '844px', left: '56px', top: '0px', position: 'absolute', background: 'white' }}>

            {/* 상단 경로 */}
            <div style={{ left: '24px', top: '25px', position: 'absolute' }}>
              <span style={{ color: '#666666', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}>카테고리 분류 &gt;</span>
              <span style={{ color: 'black', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}> </span>
              <span style={{ color: '#0070F3', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}>변경이력</span>
            </div>

            {/* 메인 컨테이너 */}
            <div style={{ width: '1336px', height: '800px', left: '24px', top: '48px', position: 'absolute', background: 'white', borderRadius: '6px', border: '1px #E5E5E5 solid' }}>

              {/* 왼쪽 패널 - 폴더 카드 or 트리 */}
              <div style={{ width: '820px', height: '798px', left: '1px', top: '1px', position: 'absolute', borderRight: '1px solid #E5E5E5' }}>

                {/* 헤더 */}
                <div style={{ width: '820px', height: '50px', left: '0px', top: '0px', position: 'absolute', background: '#F9F9F9', borderBottom: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', paddingLeft: '16px', gap: '12px' }}>
                  {viewMode === 'tree' && (
                    <div
                      onClick={handleBackToCards}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: '#FFFFFF',
                        border: '1px solid #E5E5E5'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F3F3F3'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                    >
                      <ChevronRight style={{ width: '14px', height: '14px', transform: 'rotate(180deg)', color: '#666666' }} />
                      <span style={{ fontSize: '12px', fontFamily: 'Roboto', color: '#666666' }}>뒤로</span>
                    </div>
                  )}
                  <div style={{ color: '#333333', fontSize: '13px', fontFamily: 'Roboto', fontWeight: '700' }}>
                    {viewMode === 'cards' ? '카테고리 폴더' : selectedFolder}
                  </div>
                  <div style={{ color: '#999999', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400' }}>
                    (총 {viewMode === 'cards' ? historyData.length : historyData.filter(item => item.fullPath.startsWith(selectedFolder + '/')).length}개 문서)
                  </div>
                </div>

                {/* 필터 영역 - 트리 뷰일 때만 표시 */}
                {viewMode === 'tree' && (
                  <div style={{ width: '820px', height: '50px', left: '0px', top: '50px', position: 'absolute', borderBottom: '1px solid #E5E5E5', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      style={{
                        width: '180px',
                        height: '32px',
                        padding: '0 8px',
                        border: '1px solid #CCCCCC',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'Roboto',
                        background: '#FFFFFF'
                      }}
                    >
                      <option value="all">변경유형: 전체</option>
                      <option value="created">신규 생성</option>
                      <option value="updated">카테고리 변경</option>
                      <option value="deleted">삭제</option>
                    </select>

                    <div
                      style={{
                        padding: '6px 16px',
                        border: '1px solid #CCCCCC',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'Roboto',
                        cursor: 'pointer',
                        background: '#FFFFFF'
                      }}
                      onClick={() => setFilterType('all')}
                    >
                      필터 초기화
                    </div>

                    <div
                      style={{
                        marginLeft: 'auto',
                      padding: '6px 12px',
                      border: '1px solid #E5E5E5',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'Roboto',
                      cursor: 'pointer',
                      background: '#F9F9F9',
                      color: '#666666'
                    }}
                    onClick={() => {
                      // 모든 폴더 펼치기/접기
                      if (expandedFolders.size > 0) {
                        setExpandedFolders(new Set());
                      } else {
                        const allPaths = new Set<string>();
                        const collectPaths = (nodes: FolderNode[]) => {
                          nodes.forEach(node => {
                            allPaths.add(node.path);
                            if (node.children.length > 0) {
                              collectPaths(node.children);
                            }
                          });
                        };
                        collectPaths(folderTree);
                        setExpandedFolders(allPaths);
                      }
                    }}
                  >
                      {expandedFolders.size > 0 ? '모두 접기' : '모두 펼치기'}
                    </div>
                  </div>
                )}

                {/* 컨텐츠 영역 */}
                <div style={{
                  width: '820px',
                  height: viewMode === 'tree' ? '698px' : '748px',
                  left: '0px',
                  top: viewMode === 'tree' ? '100px' : '50px',
                  position: 'absolute',
                  overflowY: 'auto'
                }}>
                  {viewMode === 'cards' ? (
                    // 폴더 카드 뷰
                    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                      {topLevelFolders.map((folder) => (
                        <div
                          key={folder.name}
                          onClick={() => handleFolderCardClick(folder.name)}
                          style={{
                            padding: '24px',
                            background: '#FFFFFF',
                            border: '1px solid #E5E5E5',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3B82F6';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E5E5E5';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Folder style={{ width: '24px', height: '24px', color: '#FFFFFF' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#333333', fontSize: '15px', fontFamily: 'Roboto', fontWeight: '700', marginBottom: '4px' }}>
                                {folder.name}
                              </div>
                              <div style={{ color: '#999999', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400' }}>
                                {folder.count}개 문서
                              </div>
                            </div>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            color: '#3B82F6',
                            fontSize: '11px',
                            fontFamily: 'Roboto',
                            fontWeight: '600'
                          }}>
                            자세히 보기
                            <ChevronRight style={{ width: '14px', height: '14px', marginLeft: '4px' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // 트리 뷰
                    renderFolderTree(getFilteredTree())
                  )}
                </div>
              </div>

              {/* 오른쪽 패널 - 상세 정보 */}
              <div style={{ width: '514px', height: '798px', left: '822px', top: '1px', position: 'absolute' }}>
                {viewMode === 'cards' ? (
                  // 카드 뷰일 때 안내 메시지
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                    <Folder style={{ width: '64px', height: '64px', color: '#CCCCCC' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#666666', fontSize: '14px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '8px' }}>
                        폴더를 선택해주세요
                      </div>
                      <div style={{ color: '#999999', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400' }}>
                        왼쪽에서 폴더를 클릭하면<br/>변경 이력을 확인할 수 있습니다
                      </div>
                    </div>
                  </div>
                ) : selectedFileData ? (
                  <>
                    {/* 헤더 */}
                    <div style={{ width: '514px', height: '50px', left: '0px', top: '0px', position: 'absolute', background: '#F9F9F9', borderBottom: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>
                      <div style={{ color: '#333333', fontSize: '13px', fontFamily: 'Roboto', fontWeight: '700' }}>
                        변경 이력 상세
                      </div>
                    </div>

                    {/* 상세 내용 */}
                    <div style={{ width: '514px', height: '748px', left: '0px', top: '50px', position: 'absolute', padding: '24px', overflowY: 'auto' }}>

                      {/* 파일 경로 */}
                      <div style={{ marginBottom: '24px', padding: '12px', background: '#F9F9F9', borderRadius: '6px' }}>
                        <div style={{ color: '#999999', fontSize: '10px', fontFamily: 'Roboto', fontWeight: '400', marginBottom: '6px' }}>
                          파일 경로
                        </div>
                        <div style={{ color: '#666666', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', wordBreak: 'break-all' }}>
                          {selectedFileData.fullPath}
                        </div>
                      </div>

                      {/* 파일명 */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ color: '#999999', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', marginBottom: '8px' }}>
                          파일명
                        </div>
                        <div style={{ color: '#333333', fontSize: '14px', fontFamily: 'Roboto', fontWeight: '600' }}>
                          {selectedFileData.fileName}
                        </div>
                      </div>

                      {/* 변경 유형 */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ color: '#999999', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', marginBottom: '8px' }}>
                          변경 유형
                        </div>
                        <div>
                          {selectedFileData.changeType === 'created' && (
                            <span style={{ padding: '6px 12px', background: '#DBEAFE', color: '#1E40AF', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>
                              신규 생성
                            </span>
                          )}
                          {selectedFileData.changeType === 'updated' && (
                            <span style={{ padding: '6px 12px', background: '#FEF3C7', color: '#F59E0B', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>
                              카테고리 변경
                            </span>
                          )}
                          {selectedFileData.changeType === 'deleted' && (
                            <span style={{ padding: '6px 12px', background: '#FEE2E2', color: '#DC2626', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>
                              삭제
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 변경일시 */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ color: '#999999', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', marginBottom: '8px' }}>
                          변경일시
                        </div>
                        <div style={{ color: '#333333', fontSize: '13px', fontFamily: 'Roboto', fontWeight: '400' }}>
                          {selectedFileData.changeDate}
                        </div>
                      </div>

                      {/* 카테고리 변경 정보 */}
                      {selectedFileData.previousCategory && (
                        <div style={{ marginBottom: '24px', padding: '16px', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                          <div style={{ color: '#92400E', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '12px' }}>
                            카테고리 변경 내역
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#78716C', fontSize: '10px', marginBottom: '4px' }}>이전 카테고리</div>
                              <div style={{ color: '#DC2626', fontSize: '13px', fontFamily: 'Roboto', fontWeight: '600', textDecoration: 'line-through' }}>
                                {selectedFileData.previousCategory}
                              </div>
                            </div>
                            <div style={{ color: '#92400E', fontSize: '18px' }}>→</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ color: '#78716C', fontSize: '10px', marginBottom: '4px' }}>현재 카테고리</div>
                              <div style={{ color: '#16A34A', fontSize: '13px', fontFamily: 'Roboto', fontWeight: '600' }}>
                                {selectedFileData.fullPath.split('/')[0]}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 현재 카테고리 (신규 생성인 경우) */}
                      {!selectedFileData.previousCategory && (
                        <div style={{ marginBottom: '24px' }}>
                          <div style={{ color: '#999999', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', marginBottom: '8px' }}>
                            카테고리
                          </div>
                          <div style={{ color: '#4A658F', fontSize: '14px', fontFamily: 'Roboto', fontWeight: '700' }}>
                            {selectedFileData.fullPath.split('/')[0]}
                          </div>
                        </div>
                      )}

                      {/* 신뢰도 */}
                      <div style={{ marginBottom: '24px' }}>
                        <div style={{ color: '#999999', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', marginBottom: '8px' }}>
                          분류 신뢰도
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            color: selectedFileData.confidence >= 80 ? '#10B981' : selectedFileData.confidence >= 60 ? '#F59E0B' : '#EF4444',
                            fontSize: '20px',
                            fontFamily: 'Roboto',
                            fontWeight: '700'
                          }}>
                            {selectedFileData.confidence}%
                          </div>
                          <div style={{ flex: 1, height: '8px', background: '#E5E5E5', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${selectedFileData.confidence}%`,
                              height: '100%',
                              background: selectedFileData.confidence >= 80 ? '#10B981' : selectedFileData.confidence >= 60 ? '#F59E0B' : '#EF4444',
                              borderRadius: '4px'
                            }}></div>
                          </div>
                        </div>
                      </div>

                      {/* 분류 결과 */}
                      <div style={{ marginBottom: '24px', padding: '16px', background: '#F9F9F9', borderRadius: '8px' }}>
                        <div style={{ color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '12px' }}>
                          AI 분류 결과
                        </div>
                        <div style={{ color: '#666666', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '18px' }}>
                          이 문서는 내용 분석 결과 "{selectedFileData.fullPath.split('/').slice(0, -1).join(' > ')}" 경로로 분류되었습니다.
                          분류 신뢰도는 {selectedFileData.confidence}%입니다.
                          {selectedFileData.previousCategory && ` 이전 "${selectedFileData.previousCategory}" 카테고리에서 재분류되었습니다.`}
                        </div>
                      </div>

                      {/* 추가 정보 */}
                      <div style={{ padding: '16px', background: '#EEF2FF', borderRadius: '8px', border: '1px solid #C7D2FE' }}>
                        <div style={{ color: '#4338CA', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '8px' }}>
                          참고사항
                        </div>
                        <div style={{ color: '#6366F1', fontSize: '10px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                          • 신뢰도 80% 이상: 높은 정확도로 분류됨<br/>
                          • 신뢰도 60-79%: 검토 권장<br/>
                          • 신뢰도 60% 미만: 수동 재분류 권장
                        </div>
                      </div>

                    </div>
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#999999', fontSize: '14px', fontFamily: 'Roboto', fontWeight: '400' }}>
                        왼쪽 트리에서 파일을 선택하세요
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
