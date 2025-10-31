import { useRef, useState, useEffect } from "react";
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { OCRProgress } from './OCRProgress';
import { DocumentClassificationComplete } from './DocumentClassificationComplete';


type Step = 'select' | 'ocr' | 'complete';

interface FolderNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: FolderNode[];
  path: string;
  ocrCompleted?: boolean;
  classificationCompleted?: boolean;
  category?: string;
  confidence?: number;
}

const FolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.6875 3.5H7.4375L5.6875 1.75H1.3125C0.587617 1.75 0 2.33762 0 3.0625V10.9375C0 11.6624 0.587617 12.25 1.3125 12.25H12.6875C13.4124 12.25 14 11.6624 14 10.9375V4.8125C14 4.08762 13.4124 3.5 12.6875 3.5Z" fill="#F7B500" />
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.75 0.4375H2.625C1.89844 0.4375 1.3125 1.02344 1.3125 1.75V12.25C1.3125 12.9766 1.89844 13.5625 2.625 13.5625H11.375C12.1016 13.5625 12.6875 12.9766 12.6875 12.25V4.375L8.75 0.4375ZM11.375 12.25H2.625V1.75H8.3125V4.8125H11.375V12.25Z" fill="#999999" />
  </svg>
);

export function DocumentClassification() {
  const [selectedFolderFiles, setSelectedFolderFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 검색어 상태
  const [displayFiles, setDisplayFiles] = useState<FolderNode[]>([]);
  const [treeData, setTreeData] = useState<FolderNode[]>([]);
  const [step, setStep] = useState<Step>('select');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(new Set());
  const [fileStatuses, setFileStatuses] = useState<Map<string, { ocrCompleted: boolean; classificationCompleted: boolean; category?: string; confidence?: number }>>(new Map());
  const [filterOCR, setFilterOCR] = useState<'all' | 'completed' | 'pending'>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [folderStructure, setFolderStructure] = useState<FolderNode[]>([]);
  
  useEffect(() => {
    if (searchTerm.trim() === "") {
      // 검색어 없을 때 전체 트리
      setTreeData(folderStructure);
      return;
    }

    const filterTree = (nodes: FolderNode[]): FolderNode[] => {
      return nodes
        .map((node) => {
          if (node.type === "folder") {
            const lowerName = node.name.toLowerCase();
            const term = searchTerm.toLowerCase();

            // ✅ 폴더 이름이 검색어 포함이면, 하위 폴더 전부 유지
            if (lowerName.includes(term)) {
              return node;
            }

            // ✅ 아니면, 하위 폴더들만 필터링 재귀적으로 탐색
            const filteredChildren = node.children ? filterTree(node.children) : [];

            if (filteredChildren.length > 0) {
              return { ...node, children: filteredChildren };
            }
          }
          // ✅ 파일 이름 검색 (필요하면 활성화)
          else if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return node;
          }

          return null;
        })
        .filter(Boolean) as FolderNode[];
    };

    const filtered = filterTree(folderStructure);
    setTreeData(filtered);
  }, [searchTerm, folderStructure]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/files"); // ← FastAPI 엔드포인트
        if (!res.ok) throw new Error("서버 응답 실패");
        const data = await res.json(); // 예: [{ filepath: "test/test1/새 폴더/sample.pdf" }, ...]
        const filePaths = data.map((f: any) => f.filepath);
        console.log("텟?",filePaths)
        const tree = buildFolderTree(filePaths);
        console.log("🌲 DB에서 불러온 폴더 트리:", tree);
        setFolderStructure(tree);
      } catch (err) {
        console.error("❌ 파일 트리 불러오기 실패:", err);
      }
    };

    fetchFiles();
  }, []);




  const buildFolderTree = (filePaths: string[]): FolderNode[] => {
    const roots: FolderNode[] = [];

    for (const filePath of filePaths) {
      const parts = filePath.split("/").filter(Boolean);
      let currentLevel = roots;

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;

        // 현재 레벨에서 같은 이름의 노드가 있는지 확인
        let existing = currentLevel.find((node) => node.name === part);

        // 없으면 새로 생성
        if (!existing) {
          existing = {
            id: parts.slice(0, index + 1).join("/"),
            name: part,
            type: isFile ? "file" : "folder",
            path: parts.slice(0, index + 1).join("/"),
            children: isFile ? undefined : []
          };
          currentLevel.push(existing);
        }

        // 다음 단계로 이동
        if (!isFile && existing.children) {
          currentLevel = existing.children;
        }
      });
    }

    console.log("📁 루트 없는 최종 트리 구조:", roots);
    return roots;
  };
  const OcrProgressClick = async() =>{
    
    
   
  }
  const RemoveClick = async () => {
  // ✅ 현재 선택된 폴더 안의 파일 경로들을 가져옴
    const selectedFolderFiles = displayFiles.map((file) => file.path);
   
    if (selectedFolderFiles.length === 0) {
      alert("삭제할 파일이 없습니다. 먼저 폴더를 선택하세요.");
      return;
  }

  // 여러 파일을 순차적으로 삭제하는 함수
  const deleteMultipleFiles = async (paths: string[]) => {
    for (const path of paths) {
      const res = await fetch(`http://127.0.0.1:8000/api/remove?path=${encodeURIComponent(path)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error(`❌ 삭제 실패: ${path}`);
      } else {
        console.log(`✅ 삭제 성공: ${path}`);
      }
    }
  };

  try {
    await deleteMultipleFiles(selectedFolderFiles);
    alert("선택한 폴더의 모든 파일 삭제 완료 ✅");

    // 🔄 삭제 후 폴더 트리 새로고침
    const refreshRes = await fetch("http://localhost:8000/api/files");
    const newData = await refreshRes.json();
    const filePaths = newData.map((f: any) => f.filepath);
    const tree = buildFolderTree(filePaths);
    setFolderStructure(tree);
    setTreeData(tree);
    setDisplayFiles([]);
  } catch (error) {
    console.error("삭제 중 오류 발생:", error);
    alert("파일 삭제 중 오류가 발생했습니다.");
  }
};

  const SearchClick = () => {
    fileInputRef.current?.click();

  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // 파일이 존재하면 그 파일정보 가져옴
    if (!file) return;
    setSelectedFile(file);
    const formData = new FormData();
    formData.append("file", file);
    
    //확장자만 가져오기
    const ext = file.name.split('.').pop()?.toLowerCase();
    // zip 파일만 허용
    if (ext !== "zip" && ext !== "pdf") {
      alert("zip,pdf 파일을 선택해주세요.");
      return;
    }

    //뭘post로 보냄?formdata를
    
    console.log("ㅡㅡㅡㅡㅡㅡㅡ")
    try {
      const res = await fetch("http://localhost:8000/upload", {
        
        method: "POST",
        credentials: 'include',
        body: formData,
      });
        console.log("ㅡㅡㅡㅡㅡㅡㅡ")  
      // FastAPI 응답 JSON 파싱
      const data = await res.json();
      console.log("서버 응답:", data);

      if (!res.ok) {
        alert("업로드 실패: " + (data.detail || "서버 오류"));
        return;
      }

      alert("✅ 업로드 완료: " + (data.filename || "서버 저장 완료"));
      const refreshRes = await fetch("http://localhost:8000/api/files");
      if (!refreshRes.ok) throw new Error("DB 파일 목록 불러오기 실패");
      const newData = await refreshRes.json();
      const filePaths = newData.map((f: any) => f.filepath);
      const tree = buildFolderTree(filePaths);

      setFolderStructure(tree);
      setTreeData(tree); // ← 검색창용 트리도 갱신
      if (data.file_list) {
        const tree = buildFolderTree(data.file_list);
        setFolderStructure(tree);
        console.log("📂 변환된 폴더 구조:", tree);
      }
      // 업로드 후, DB에 저장된 폴더 구조 다시 불러오기
    } catch (err) {
      console.error("❌ 업로드 오류:", err);
      alert("업로드 중 오류가 발생했습니다.");
    }
  };



  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };



  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const toggleFolderSelection = (folderId: string, node: FolderNode) => {
    console.log("📂 클릭된 폴더 ID:", folderId);
    console.log("🧩 node.id:", node.id, "node.path:", node.path);
    console.log("현재 선택된 폴더들:", Array.from(selectedFolders));

    const newSelectedFolders = new Set(selectedFolders);
    const newSelectedFiles = new Set(selectedFiles);

    if (newSelectedFolders.has(folderId)) {


      // 폴더 선택 해제
      newSelectedFolders.delete(folderId);
      const removeRecursive = (n: FolderNode) => {
        if (n.type === "folder") newSelectedFolders.delete(n.id);
        if (n.children) {
          n.children.forEach(child => {
            if (child.type === "file") {
              newSelectedFiles.delete(child.id);
            } else {
              removeRecursive(child);
            }
          });
        }
      };

      removeRecursive(node);
    } else {
      function addRecursive(n: FolderNode) {
        if (n.type === "folder") newSelectedFolders.add(n.id);
        if (n.children) {
          n.children.forEach(child => {
            if (child.type === "file") {
              newSelectedFiles.add(child.id);
            } else {
              addRecursive(child);
            }
          });
        }
      }
      addRecursive(node);

    }

    // ✅ 여기서부터 내가 준 코드 붙여넣기
    // 중복 제거 및 실시간 표시 반영
    const updatedFolders = Array.from(newSelectedFolders);
    if (updatedFolders.length === 0) {
      setDisplayFiles([]);
    } else {
      const allFiles: FolderNode[] = [];
      const seen = new Set<string>();

      const findFolder = (nodes: FolderNode[], targetId: string): FolderNode | null => {
        for (const n of nodes) {
          if (n.id === targetId) return n;
          if (n.children) {
            const found = findFolder(n.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const collectFilesRecursive = (node: FolderNode) => {
        if (node.type === "file") {
          if (!seen.has(node.path)) {
            seen.add(node.path);
            allFiles.push(node);
          }
        } else if (node.children) {
          node.children.forEach(collectFilesRecursive);
        }
      };

      for (const folderId of updatedFolders) {
        const folderNode = findFolder(folderStructure, folderId);
        if (folderNode) collectFilesRecursive(folderNode);
      }
      setSelectedFolderFiles(allFiles.map(f => f.path));
      setDisplayFiles(allFiles);
    }

    // ✅ 상태 반영
    setSelectedFolders(new Set(newSelectedFolders));
    setSelectedFiles(new Set(newSelectedFiles));





    
  };
  //이쪽이 함수가 폴더값들 가져오는 트리 (즉 카테고리)
  const renderTree = (nodes: FolderNode[], level: number = 0) => {
    return nodes
      .filter(node => node.type === 'folder') // 🔥 폴더만 표시
      .map(node => (
        <div key={node.id} style={{ marginLeft: `${level * 24}px` }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 8px',
              cursor: 'pointer',
              background: selectedFolders.has(node.id) ? '#EEF2FF' : 'transparent',
              borderRadius: '4px',
              marginBottom: '4px'
            }}
            onClick={() => toggleNode(node.id)}
          >
            {node.children && node.children.some(child => child.type === 'folder') ? (
              expandedNodes.has(node.id)
                ? <ChevronDown style={{ width: '16px', height: '16px', color: '#666666' }} />
                : <ChevronRight style={{ width: '16px', height: '16px', color: '#666666' }} />
            ) : (
              <div style={{ width: '16px', height: '16px' }} /> // 🔹 자식 폴더 없으면 빈 공간으로 맞춤
            )}
            <input
              type="checkbox"
              checked={selectedFolders.has(node.id)}
              onChange={() => toggleFolderSelection(node.id, node)}
              onClick={(e) => e.stopPropagation()}
              style={{ marginRight: '8px' }}
            />
            <FolderIcon />
            <span style={{ fontSize: '13px', color: '#333333', marginLeft: '6px' }}>{node.name}</span>
          </div>

          {expandedNodes.has(node.id) && node.children && (
            <div>{renderTree(node.children, level + 1)}</div>
          )}
        </div>
      ));
  };

  const handleStartClassification = () => {
    if (selectedFiles.size === 0) {
      alert('분류할 파일을 선택해주세요.');
      return;
    }
    setStep('ocr');
  };

  return (
    <div style={{ width: '1440px', minHeight: '900px', position: 'relative', background: '#F9F9F9' }}>
      {step === 'select' && (
        <div style={{ width: '1440px', height: '900px', position: 'relative' }}>
          <div style={{ width: '1440px', height: '844px', left: '0px', top: '56px', position: 'absolute' }}>
            <div style={{ width: '1384px', height: '844px', left: '56px', top: '0px', position: 'absolute', background: 'white' }}>

              {/* 헤더 */}
              <div style={{ width: '1336px', left: '24px', top: '24px', position: 'absolute' }}>
                <div style={{ color: '#666666', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}>
                  문서 &gt; <span style={{ color: '#0070F3' }}>OCR 처리</span>
                </div>
              </div>

              {/* 설명 */}
              <div style={{ width: '1336px', left: '24px', top: '56px', position: 'absolute' }}>
                <div style={{ color: '#666666', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '14px' }}>
                  ① 좌측에서 OCR 처리할 폴더 또는 파일을 선택하세요.<br />
                  ② 우측 테이블에서 OCR 처리 여부를 확인할 수 있습니다.<br />
                  ③ "OCR 처리 시작" 버튼을 클릭하면 문서에서 텍스트를 추출하고 서버에 저장합니다.
                </div>
              </div>

              {/* 메인 콘텐츠 */}
              <div style={{ width: '1336px', height: '667.62px', left: '24px', top: '130.78px', position: 'absolute', borderRadius: '2px', border: '1px solid #DDDDDD' }}>

                {/* 왼쪽 패널 - 폴더/파일 트리 */}
                <div style={{ width: '600px', height: '665.62px', left: '1px', top: '1px', position: 'absolute', borderRight: '1px solid #DDDDDD', overflowY: 'auto' }}>
                  <div style={{ padding: '12px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ justifyContent: 'space-between', display: 'flex', color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '15px', marginBottom: '8px' }}>
                        폴더 및 파일 선택
                        <div onClick={SearchClick} style={{
                          display: 'flex',// 한 줄로 배치
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          backgroundColor: '#f5f5f5',
                          cursor: 'pointer',
                          marginTop: '8px', fontSize: '12px', color: '#333'
                        }}>
                          업로드

                        </div>
                        <div onClick={RemoveClick} style={{
                          display: 'flex',// 한 줄로 배치
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          backgroundColor: '#f5f5f5',
                          cursor: 'pointer',
                          marginTop: '8px', fontSize: '12px', color: '#333'
                        }}>
                          삭제

                        </div>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="검색..."
                          style={{
                            width: '100%',
                            height: '32px',
                            padding: '0 32px 0 12px',
                            border: '1px solid #CCCCCC',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {renderTree(treeData)}
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleChange}
                        />


                        <Search style={{ width: '14px', height: '14px', position: 'absolute', right: '12px', top: '9px', color: '#666666' }} />
                      </div>
                    </div>

                    {/* 트리 구조  여기다가카텍
                    
                    //<pre>{JSON.stringify(treeData, null, 2)}</pre>
                    */}

                  </div>
                </div>

                {/* 오른쪽 패널 - 파일 목록 테이블 */}
                <div style={{ width: '734px', height: '665.62px', left: '601px', top: '1px', position: 'absolute' }}>
                  {/* 헤더 및 필터 */}
                  <div style={{ height: '80px ', padding: '12px', borderBottom: '1px solid #DDDDDD' }}>
                    <div style={{ marginBottom: '8px', color: '#333333', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600' }}>
                      파일 목록 ({selectedFiles.size}개 선택됨)
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={filterOCR}
                        onChange={(e) => setFilterOCR(e.target.value as any)}
                        style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid #CCCCCC', borderRadius: '4px' }}
                      >
                        <option value="all">OCR: 전체</option>
                        <option value="completed">OCR: 완료</option>
                        <option value="pending">OCR: 미완료</option>
                      </select>
                      <button
                        onClick={() => {
                          setFilterOCR('all');
                        }}
                        style={{ padding: '4px 12px', fontSize: '11px', border: '1px solid #CCCCCC', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                      >
                        필터 초기화
                      </button>
                    </div>
                  </div>

                  {/* 테이블 */}
                  <div style={{ height: '585px', overflowY: 'auto' }}>
                    {/* 테이블 헤더 */}
                    <div style={{ display: 'flex', background: '#F9F9F9', borderBottom: '1px solid #DDDDDD', padding: '8px', fontSize: '11px', fontWeight: '700', position: 'sticky', top: 0, zIndex: 1 }}>
                      <div style={{ width: '30px', textAlign: 'center' }}>
                        <input type="checkbox" />
                      </div>
                      <div style={{ flex: 1 }}>파일명</div>
                      <div style={{ width: '100px', textAlign: 'center' }}>OCR 상태</div>
                      <div style={{ width: '150px', textAlign: 'center' }}>등록일</div>
                    </div>

                    {/* ✅ 선택된 폴더 안의 파일만 표시 */}
                    {(() => {
                      // 현재 선택된 폴더 중 하나만 보여줌 (여러 개일 경우 첫 번째)


                      // 폴더 트리에서 해당 폴더를 찾아서 children 중 파일만 추출
                      const findNodeById = (nodes: FolderNode[], id: string): FolderNode | null => {
                        for (const node of nodes) {
                          if (node.id === id) return node;
                          if (node.children) {
                            const found = findNodeById(node.children, id);
                            if (found) return found;
                          }
                        }
                        return null;
                      };


                      const collectFilesRecursive = (node: FolderNode): FolderNode[] => {
                        let collected: FolderNode[] = [];
                        if (node.children) {
                          for (const child of node.children) {
                            if (child.type === "file") {
                              collected.push(child);
                            } else if (child.type === "folder") {
                              collected = collected.concat(collectFilesRecursive(child));
                            }
                          }
                        }
                        return collected;
                      };

                      // ✅ 여러 폴더의 모든 파일을 표시하도록 수정
                      if (displayFiles.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999999', fontSize: '12px' }}>
                            왼쪽에서 폴더를 선택하세요.
                          </div>
                        );
                      }

                      return displayFiles.map((file) => {
                        const status = fileStatuses.get(file.id) || { ocrCompleted: false, classificationCompleted: false };

                        // 필터 적용
                        if (filterOCR === 'completed' && !status.ocrCompleted) return null;
                        if (filterOCR === 'pending' && status.ocrCompleted) return null;

                        return (
                          <div
                            key={file.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px',
                              borderBottom: '1px solid #F3F3F3',
                              fontSize: '11px'
                            }}
                          >
                            <div style={{ width: '30px', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={selectedFiles.has(file.id)}
                                onChange={() => toggleFileSelection(file.id)}
                              />
                            </div>
                            <div style={{ flex: 1, color: '#333333', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FileIcon />
                              {file.name}
                            </div>
                            <div style={{ width: '100px', textAlign: 'center' }}>
                              {status.ocrCompleted ? (
                                <span style={{ color: '#10B981', fontSize: '10px' }}>✓ 완료</span>
                              ) : (
                                <span style={{ color: '#999999', fontSize: '10px' }}>미완료</span>
                              )}
                            </div>
                            <div style={{ width: '150px', textAlign: 'center', fontSize: '10px', color: '#666666' }}>
                              2024-10-24 14:32:15
                            </div>
                          </div>
                        );
                      });




                    })()}

                  </div>
                </div>
              </div>

              {/* 하단 버튼 */}
              <div style={{ width: '1336px', height: '39.59px', left: '24px', top: '806.41px', position: 'absolute', background: '#111111', borderRadius: '2px' }}>
                <div style={{ left: '16px', top: '11.79px', position: 'absolute', color: 'white', fontSize: '13px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '16px' }}>
                  선택된 파일에서 텍스트를 추출하고 서버에 저장합니다.
                </div>

                <div
                  onClick={handleStartClassification}
                  style={{
                    width: '126.34px',
                    height: '23.59px',
                    left: '1190px',
                    top: '8px',
                    position: 'absolute',
                    background: selectedFiles.size > 0 ? '#2F4F8A' : '#666666',
                    borderRadius: '2px',
                    cursor: selectedFiles.size > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div onClick={OcrProgressClick} style={{ color: 'white', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400', lineHeight: '15px' }}>
                    OCR 처리 시작
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'ocr' && (
        <OCRProgress
          
          selectedFiles={selectedFiles}
          totalFiles={selectedFiles.size}
          onCancel={() => setStep('select')}
          onComplete={() => setStep('complete')}
        />
      )}

      {step === 'complete' && (
        <DocumentClassificationComplete
          totalFiles={selectedFiles.size}
          onConfirm={() => setStep('select')}
        />
      )}
    </div>
  );
}
