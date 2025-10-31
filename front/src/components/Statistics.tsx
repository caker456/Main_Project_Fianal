import { useState } from 'react';
import { Folder, ChevronRight } from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface FolderStats {
  name: string;
  totalFiles: number;
  classifiedFiles: number;
  unclassifiedFiles: number;
  classificationRate: number;
  categories: {
    name: string;
    count: number;
    percentage: number;
  }[];
}

export function Statistics() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // 전체 카테고리별 파일 분류 현황
  const overallCategoryData = [
    { name: '의안원문', value: 450, color: '#3B82F6' },
    { name: '심사보고서', value: 320, color: '#8B5CF6' },
    { name: '검토보고서', value: 280, color: '#10B981' },
    { name: '위원회의결안', value: 210, color: '#F59E0B' },
    { name: '비용추계서', value: 180, color: '#EF4444' },
    { name: '본회의수정안', value: 150, color: '#6366F1' },
    { name: '미분류', value: 120, color: '#9CA3AF' }
  ];

  const totalFiles = overallCategoryData.reduce((sum, item) => sum + item.value, 0);
  const classifiedFiles = totalFiles - (overallCategoryData.find(item => item.name === '미분류')?.value || 0);
  const overallClassificationRate = ((classifiedFiles / totalFiles) * 100).toFixed(1);

  // 폴더별 통계 데이터
  const folderStats: FolderStats[] = [
    {
      name: '재무보고서',
      totalFiles: 285,
      classifiedFiles: 270,
      unclassifiedFiles: 15,
      classificationRate: 94.7,
      categories: [
        { name: '의안원문', count: 120, percentage: 42.1 },
        { name: '심사보고서', count: 80, percentage: 28.1 },
        { name: '검토보고서', count: 70, percentage: 24.6 },
        { name: '미분류', count: 15, percentage: 5.3 }
      ]
    },
    {
      name: '인사관리',
      totalFiles: 198,
      classifiedFiles: 185,
      unclassifiedFiles: 13,
      classificationRate: 93.4,
      categories: [
        { name: '위원회의결안', count: 90, percentage: 45.5 },
        { name: '심사보고서', count: 60, percentage: 30.3 },
        { name: '검토보고서', count: 35, percentage: 17.7 },
        { name: '미분류', count: 13, percentage: 6.6 }
      ]
    },
    {
      name: '마케팅기획',
      totalFiles: 156,
      classifiedFiles: 142,
      unclassifiedFiles: 14,
      classificationRate: 91.0,
      categories: [
        { name: '의안원문', count: 70, percentage: 44.9 },
        { name: '비용추계서', count: 45, percentage: 28.8 },
        { name: '검토보고서', count: 27, percentage: 17.3 },
        { name: '미분류', count: 14, percentage: 9.0 }
      ]
    },
    {
      name: '경영관리',
      totalFiles: 243,
      classifiedFiles: 220,
      unclassifiedFiles: 23,
      classificationRate: 90.5,
      categories: [
        { name: '심사보고서', count: 95, percentage: 39.1 },
        { name: '의안원문', count: 75, percentage: 30.9 },
        { name: '위원회의결안', count: 50, percentage: 20.6 },
        { name: '미분류', count: 23, percentage: 9.5 }
      ]
    },
    {
      name: '프로젝트관리',
      totalFiles: 189,
      classifiedFiles: 165,
      unclassifiedFiles: 24,
      classificationRate: 87.3,
      categories: [
        { name: '검토보고서', count: 80, percentage: 42.3 },
        { name: '비용추계서', count: 50, percentage: 26.5 },
        { name: '위원회의결안', count: 35, percentage: 18.5 },
        { name: '미분류', count: 24, percentage: 12.7 }
      ]
    },
    {
      name: '기술개발',
      totalFiles: 219,
      classifiedFiles: 188,
      unclassifiedFiles: 31,
      classificationRate: 85.8,
      categories: [
        { name: '비용추계서', count: 85, percentage: 38.8 },
        { name: '의안원문', count: 60, percentage: 27.4 },
        { name: '본회의수정안', count: 43, percentage: 19.6 },
        { name: '미분류', count: 31, percentage: 14.2 }
      ]
    }
  ];

  const selectedFolderData = selectedFolder
    ? folderStats.find(f => f.name === selectedFolder)
    : null;

  // 선택된 폴더의 차트 데이터
  const selectedFolderChartData = selectedFolderData?.categories.map((cat, index) => ({
    name: cat.name,
    count: cat.count,
    percentage: cat.percentage,
    color: cat.name === '미분류' ? '#9CA3AF' : ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'][index]
  })) || [];

  return (
    <div style={{ width: '1440px', minHeight: '900px', position: 'relative', background: '#F9F9F9' }}>
      <div style={{ width: '1440px', height: '844px', left: '0px', top: '56px', position: 'absolute' }}>
        <div style={{ width: '1384px', height: '844px', left: '56px', top: '0px', position: 'absolute', background: 'white' }}>

          {/* 상단 경로 */}
          <div style={{ left: '24px', top: '25px', position: 'absolute' }}>
            <span style={{ color: '#666666', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', lineHeight: '16px' }}>통계</span>
          </div>

          {/* 상단 영역 - 전체 분류 현황 */}
          <div style={{ width: '1336px', height: '340px', left: '24px', top: '60px', position: 'absolute', background: 'white', borderRadius: '6px', border: '1px #E5E5E5 solid' }}>
            <div style={{ padding: '24px' }}>
              {/* 제목 */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#333333', fontSize: '16px', fontFamily: 'Roboto', fontWeight: '700', marginBottom: '8px' }}>
                  전체 파일 분류 현황
                </div>
                <div style={{ color: '#666666', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400' }}>
                  전체 {totalFiles.toLocaleString()}개 파일 중 {classifiedFiles.toLocaleString()}개 분류 완료 ({overallClassificationRate}%)
                </div>
              </div>

              {/* 통계 카드들 */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ flex: 1, padding: '16px', background: '#F0F9FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                  <div style={{ color: '#1E40AF', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '8px' }}>
                    전체 파일
                  </div>
                  <div style={{ color: '#1E3A8A', fontSize: '24px', fontFamily: 'Roboto', fontWeight: '800' }}>
                    {totalFiles.toLocaleString()}개
                  </div>
                </div>
                <div style={{ flex: 1, padding: '16px', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                  <div style={{ color: '#15803D', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '8px' }}>
                    분류 완료
                  </div>
                  <div style={{ color: '#166534', fontSize: '24px', fontFamily: 'Roboto', fontWeight: '800' }}>
                    {classifiedFiles.toLocaleString()}개
                  </div>
                </div>
                <div style={{ flex: 1, padding: '16px', background: '#FEF3C7', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                  <div style={{ color: '#B45309', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '8px' }}>
                    미분류
                  </div>
                  <div style={{ color: '#92400E', fontSize: '24px', fontFamily: 'Roboto', fontWeight: '800' }}>
                    {(totalFiles - classifiedFiles).toLocaleString()}개
                  </div>
                </div>
                <div style={{ flex: 1, padding: '16px', background: '#F5F3FF', borderRadius: '8px', border: '1px solid #DDD6FE' }}>
                  <div style={{ color: '#6D28D9', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '8px' }}>
                    분류율
                  </div>
                  <div style={{ color: '#5B21B6', fontSize: '24px', fontFamily: 'Roboto', fontWeight: '800' }}>
                    {overallClassificationRate}%
                  </div>
                </div>
              </div>

              {/* 차트 */}
              <div style={{ width: '100%', height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={overallCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {overallCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #E5E5E5',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 하단 영역 - 폴더별 분류 현황 */}
          <div style={{ width: '1336px', height: '415px', left: '24px', top: '420px', position: 'absolute', background: 'white', borderRadius: '6px', border: '1px #E5E5E5 solid' }}>

            {/* 제목 */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E5E5' }}>
              <div style={{ color: '#333333', fontSize: '16px', fontFamily: 'Roboto', fontWeight: '700', marginBottom: '4px' }}>
                폴더별 분류 현황
              </div>
              <div style={{ color: '#666666', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400' }}>
                폴더를 선택하면 상세한 분류 통계를 확인할 수 있습니다
              </div>
            </div>

            <div style={{ display: 'flex', height: '345px' }}>
              {/* 왼쪽 - 폴더 리스트 */}
              <div style={{ width: '400px', borderRight: '1px solid #E5E5E5', overflowY: 'auto' }}>
                {folderStats.map((folder) => (
                  <div
                    key={folder.name}
                    onClick={() => setSelectedFolder(folder.name)}
                    style={{
                      padding: '20px 24px',
                      cursor: 'pointer',
                      background: selectedFolder === folder.name ? '#EEF2FF' : 'white',
                      borderBottom: '1px solid #F3F3F3',
                      borderLeft: selectedFolder === folder.name ? '3px solid #3B82F6' : '3px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFolder !== folder.name) {
                        e.currentTarget.style.background = '#F9F9F9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFolder !== folder.name) {
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <Folder style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#333333', fontSize: '14px', fontFamily: 'Roboto', fontWeight: '700', marginBottom: '4px' }}>
                          {folder.name}
                        </div>
                        <div style={{ color: '#666666', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '400' }}>
                          전체 {folder.totalFiles}개
                        </div>
                      </div>
                      <ChevronRight style={{ width: '16px', height: '16px', color: '#999999' }} />
                    </div>

                    {/* 진행률 바 */}
                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ width: '100%', height: '8px', background: '#E5E5E5', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${folder.classificationRate}%`,
                          height: '100%',
                          background: folder.classificationRate >= 90 ? '#10B981' : folder.classificationRate >= 80 ? '#F59E0B' : '#EF4444',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: '#10B981', fontWeight: '600' }}>분류 {folder.classifiedFiles}개</span>
                      <span style={{ color: '#999999' }}>미분류 {folder.unclassifiedFiles}개</span>
                      <span style={{ color: '#3B82F6', fontWeight: '700' }}>{folder.classificationRate}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 오른쪽 - 선택된 폴더의 상세 차트 */}
              <div style={{ flex: 1, padding: '24px' }}>
                {selectedFolderData ? (
                  <>
                    {/* 상세 정보 */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ color: '#333333', fontSize: '15px', fontFamily: 'Roboto', fontWeight: '700', marginBottom: '12px' }}>
                        {selectedFolderData.name} 상세 분류 현황
                      </div>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1, padding: '12px', background: '#F0F9FF', borderRadius: '6px' }}>
                          <div style={{ color: '#1E40AF', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '4px' }}>
                            전체
                          </div>
                          <div style={{ color: '#1E3A8A', fontSize: '18px', fontFamily: 'Roboto', fontWeight: '800' }}>
                            {selectedFolderData.totalFiles}개
                          </div>
                        </div>
                        <div style={{ flex: 1, padding: '12px', background: '#F0FDF4', borderRadius: '6px' }}>
                          <div style={{ color: '#15803D', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '4px' }}>
                            분류완료
                          </div>
                          <div style={{ color: '#166534', fontSize: '18px', fontFamily: 'Roboto', fontWeight: '800' }}>
                            {selectedFolderData.classifiedFiles}개
                          </div>
                        </div>
                        <div style={{ flex: 1, padding: '12px', background: '#F5F3FF', borderRadius: '6px' }}>
                          <div style={{ color: '#6D28D9', fontSize: '11px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '4px' }}>
                            분류율
                          </div>
                          <div style={{ color: '#5B21B6', fontSize: '18px', fontFamily: 'Roboto', fontWeight: '800' }}>
                            {selectedFolderData.classificationRate}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 차트 */}
                    <div style={{ width: '100%', height: '220px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={selectedFolderChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: '#666666' }}
                            axisLine={{ stroke: '#E5E5E5' }}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: '#666666' }}
                            axisLine={{ stroke: '#E5E5E5' }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: 'white',
                              border: '1px solid #E5E5E5',
                              borderRadius: '6px',
                              fontSize: '12px'
                            }}
                            formatter={(value: any, name: string) => {
                              const item = selectedFolderChartData.find(d => d.name === name);
                              return [`${value}개 (${item?.percentage.toFixed(1)}%)`, '파일 수'];
                            }}
                          />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {selectedFolderChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                ) : (
                  // 폴더 선택 안내
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                    <Folder style={{ width: '64px', height: '64px', color: '#CCCCCC' }} />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#666666', fontSize: '14px', fontFamily: 'Roboto', fontWeight: '600', marginBottom: '8px' }}>
                        폴더를 선택해주세요
                      </div>
                      <div style={{ color: '#999999', fontSize: '12px', fontFamily: 'Roboto', fontWeight: '400' }}>
                        왼쪽에서 폴더를 클릭하면<br/>상세한 분류 통계를 확인할 수 있습니다
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
