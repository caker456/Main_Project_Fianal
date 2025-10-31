import { Users, HardDrive } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Member {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export function Home() {
  // 샘플 데이터
  const documentData = [
    { name: '월', 신규등록: 450, 업데이트: 320 },
    { name: '화', 신규등록: 380, 업데이트: 290 },
    { name: '수', 신규등록: 520, 업데이트: 410 },
    { name: '목', 신규등록: 470, 업데이트: 350 },
    { name: '금', 신규등록: 600, 업데이트: 480 },
    { name: '토', 신규등록: 280, 업데이트: 180 },
    { name: '일', 신규등록: 150, 업데이트: 90 }
  ];

  const connectionData = [
    { time: '00:00', 접속자: 5 },
    { time: '02:00', 접속자: 8 },
    { time: '04:00', 접속자: 12 },
    { time: '06:00', 접속자: 15 },
    { time: '08:00', 접속자: 18 },
    { time: '10:00', 접속자: 22 },
    { time: '12:00', 접속자: 28 },
    { time: '14:00', 접속자: 32 },
    { time: '16:00', 접속자: 30 },
    { time: '18:00', 접속자: 25 },
    { time: '20:00', 접속자: 20 },
    { time: '22:00', 접속자: 15 }
  ];

  const viewData = [
    { name: '검색', value: 1, color: '#F59E0B' },
    { name: '추천', value: 0, color: '#10B981' }
  ];

  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/member/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch member info");
        return res.json();
      })
      .then(data => setCurrentUser(data))
      .catch(err => console.error(err));
  }, []);

  const [totalMembers, setTotalMembers] = useState<number>(0);

  useEffect(() => {
    // 백엔드 API 호출
    fetch("http://localhost:8000/member/count", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch total members");
        return res.json();
      })
      .then(data => {
        if (data && typeof data.total_members === "number") {
          setTotalMembers(data.total_members);
        }
      })
      .catch(err => {
        console.error("Error fetching total members:", err);
        setTotalMembers(0); // 기본값
      });
      }, []);

  return (
    <div style={{width: 1440, height: 852, position: 'relative', background: 'white'}}>

      {/* Top Section */}
      <div style={{width: 1336, height: 180, left: 80, top: 30, position: 'absolute'}}>
        {/* Left Card - Service Info */}
        <div style={{width: 750, height: 180, left: 0, top: 0, position: 'absolute', background: 'white', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 6}}>
          <div style={{width: 120, height: 140, left: 20, top: 20, position: 'absolute'}}>
            <div style={{width: 120, height: 40, left: 0, top: 25, position: 'absolute'}}>
              <div style={{left: 0, top: 0, position: 'absolute', color: '#666666', fontSize: 14, fontFamily: 'Roboto', fontWeight: '700', lineHeight: '20px', wordWrap: 'break-word'}}>사용자명</div>
              <div style={{left: 0, top: 20, position: 'absolute', color: '#333333', fontSize: 14, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '20px', wordWrap: 'break-word'}}>{currentUser?.name || "USER"} {/* 여기서 사용자명 표시 */}</div>
            </div>
            <div style={{width: 120, height: 40, left: 0, top: 75, position: 'absolute'}}>
              <div style={{left: 0, top: 0, position: 'absolute', color: '#666666', fontSize: 14, fontFamily: 'Roboto', fontWeight: '700', lineHeight: '20px', wordWrap: 'break-word'}}>중앙문서함</div>
              <div style={{left: 0, top: 20, position: 'absolute', color: '#333333', fontSize: 14, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '20px', wordWrap: 'break-word'}}>6개</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{width: 590, height: 140, left: 145, top: 20, position: 'absolute'}}>
            {/* Total Users Card */}
            <div style={{width: 285, height: 140, left: 0, top: 0, position: 'absolute', background: '#1E90FF', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8}}>
              <div style={{width: 60, height: 65, left: 20, top: 37, position: 'absolute', background: '#7ED6DF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Users style={{width: 30, height: 25, color: '#2C3E50'}} />
              </div>
              <div style={{width: 180, height: 65, left: 90, top: 37, position: 'absolute'}}>
                <div style={{left: 0, top: 0, position: 'absolute', color: 'white', fontSize: 14, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>총 사용자 수</div>
                <div style={{left: 0, top: 25, position: 'absolute', color: 'white', fontSize: 28, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '40px', wordWrap: 'break-word'}}>{totalMembers}명</div>
              </div>
            </div>

            {/* Total Storage Card */}
            <div style={{width: 285, height: 140, left: 305, top: 0, position: 'absolute', background: '#1E90FF', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 8}}>
              <div style={{width: 52, height: 65, left: 20, top: 37, position: 'absolute', background: '#7ED6DF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <HardDrive style={{width: 22, height: 25, color: '#2C3E50'}} />
              </div>
              <div style={{width: 190, height: 65, left: 82, top: 37, position: 'absolute'}}>
                <div style={{left: 0, top: 0, position: 'absolute', color: 'white', fontSize: 14, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>총 인덱싱 용량</div>
                <div style={{left: 0, top: 25, position: 'absolute', color: 'white', fontSize: 28, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '40px', wordWrap: 'break-word'}}>153.5 GB</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card - AI History */}
        <div style={{width: 566, height: 180, left: 770, top: 0, position: 'absolute', background: 'white', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 6}}>
          <div style={{width: 530, height: 20, left: 20, top: 20, position: 'absolute'}}>
            <div style={{left: 0, top: 0, position: 'absolute', color: '#666666', fontSize: 14, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>AI 작업 이력</div>
          </div>
          <div style={{width: 530, height: 110, left: 20, top: 50, position: 'absolute'}}>
            <div style={{width: 530, height: 20, left: 0, top: 0, position: 'absolute'}}>
              <div style={{left: 0, top: 0, position: 'absolute', color: '#666666', fontSize: 13, fontFamily: 'Roboto', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>카테고리 생성 스레드 중속 결과 업데이트가 종료되었습니다.</div>
              <div style={{left: 410, top: 0, position: 'absolute', color: '#999999', fontSize: 11, fontFamily: 'Roboto', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>2024-09-12 15:59:02</div>
            </div>
            <div style={{width: 530, height: 20, left: 0, top: 30, position: 'absolute'}}>
              <div style={{left: 0, top: 0, position: 'absolute', color: '#666666', fontSize: 13, fontFamily: 'Roboto', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>카테고리 생성 스레드 중속 결과 업데이트를 시작합니다.</div>
              <div style={{left: 410, top: 0, position: 'absolute', color: '#999999', fontSize: 11, fontFamily: 'Roboto', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>2024-09-12 15:59:01</div>
            </div>
            <div style={{width: 530, height: 20, left: 0, top: 60, position: 'absolute'}}>
              <div style={{left: 0, top: 0, position: 'absolute', color: '#666666', fontSize: 13, fontFamily: 'Roboto', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>카테고리 생성 스레드 중속 결과 업데이트 대기 중입니다.</div>
              <div style={{left: 410, top: 0, position: 'absolute', color: '#999999', fontSize: 11, fontFamily: 'Roboto', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>2024-09-12 15:59:00</div>
            </div>
            <div style={{width: 530, height: 20, left: 0, top: 90, position: 'absolute'}}>
              <div style={{left: 0, top: 0, position: 'absolute', color: '#666666', fontSize: 13, fontFamily: 'Roboto', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>카테고리 전문가 DB 생성이 종료되었습니다.</div>
              <div style={{left: 410, top: 0, position: 'absolute', color: '#999999', fontSize: 11, fontFamily: 'Roboto', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>2024-09-12 15:58:30</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{width: 1336, height: 380, left: 80, top: 230, position: 'absolute'}}>
        {/* Document Status Card */}
        <div style={{width: 750, height: 380, left: 0, top: 0, position: 'absolute', background: 'white', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 6}}>
          <div style={{width: 710, height: 20, left: 20, top: 20, position: 'absolute'}}>
            <div style={{left: 0, top: 0, position: 'absolute', color: '#666666', fontSize: 14, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>문서 현황</div>
          </div>
          <div style={{width: 710, height: 40, left: 20, top: 50, position: 'absolute'}}>
            <div style={{width: 120, height: 40, left: 0, top: 0, position: 'absolute'}}>
              <div style={{left: 0, top: -2, position: 'absolute', color: '#333333', fontSize: 22, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '20px', wordWrap: 'break-word'}}>2,820,691건</div>
              <div style={{left: 0, top: 20, position: 'absolute', color: '#666666', fontSize: 14, fontFamily: 'Roboto', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>전체 등록 문서</div>
            </div>
            <div style={{width: 240, height: 40, left: 470, top: 0, position: 'absolute'}}>
              <div style={{width: 100, height: 40, left: 0, top: 0, position: 'absolute', borderLeft: '2px solid #1E90FF', paddingLeft: 12}}>
                <div style={{left: 12, top: 0, position: 'absolute', color: '#1E90FF', fontSize: 14, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>금일 신규 등록</div>
                <div style={{left: 12, top: 20, position: 'absolute', color: '#333333', fontSize: 14, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '20px', wordWrap: 'break-word'}}>0개</div>
              </div>
              <div style={{width: 100, height: 40, left: 140, top: 0, position: 'absolute', borderLeft: '2px solid #1E90FF', paddingLeft: 12}}>
                <div style={{left: 12, top: 0, position: 'absolute', color: '#1E90FF', fontSize: 14, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>금일 업데이트</div>
                <div style={{left: 12, top: 20, position: 'absolute', color: '#333333', fontSize: 14, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '20px', wordWrap: 'break-word'}}>0개</div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div style={{width: 710, height: 260, left: 20, top: 100, position: 'absolute'}}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={documentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="circle"
                />
                <Bar dataKey="신규등록" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="업데이트" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usage Status Card */}
        <div style={{width: 280, height: 380, left: 770, top: 0, position: 'absolute', background: 'white', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 6}}>
          <div style={{width: 240, height: 20, left: 20, top: 20, position: 'absolute'}}>
            <div style={{left: 0, top: 0, position: 'absolute', color: '#666666', fontSize: 14, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>사용 현황</div>
          </div>
          <div style={{width: 240, height: 55, left: 20, top: 50, position: 'absolute'}}>
            <div style={{width: 120, height: 55, left: 0, top: 0, position: 'absolute'}}>
              <div style={{left: 0, top: 0, position: 'absolute', color: '#333333', fontSize: 16, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>현재 접속자</div>
              <div style={{left: 35, top: 20, position: 'absolute', color: '#333333', fontSize: 22, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '35px', wordWrap: 'break-word'}}>2명</div>
            </div>
            <div style={{width: 120, height: 55, left: 120, top: 0, position: 'absolute'}}>
              <div style={{left: 0, top: 0, position: 'absolute', color: '#333333', fontSize: 16, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>금일 로그인</div>
              <div style={{left: 30, top: 20, position: 'absolute', color: '#333333', fontSize: 22, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '35px', wordWrap: 'break-word'}}>12명</div>
            </div>
          </div>
          <div style={{left: 20, top: 115, position: 'absolute', color: '#666666', fontSize: 12, fontFamily: 'Roboto', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word'}}>접속 현황</div>

          {/* Chart */}
          <div style={{width: 240, height: 240, left: 20, top: 135, position: 'absolute'}}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={connectionData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 9, fill: '#666666' }}
                  axisLine={{ stroke: '#E5E5E5' }}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#666666' }}
                  axisLine={{ stroke: '#E5E5E5' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="접속자"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* View Status Card */}
        <div style={{width: 266, height: 380, left: 1070, top: 0, position: 'absolute', background: 'white', boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', borderRadius: 6}}>
          <div style={{width: 226, height: 20, left: 20, top: 20, position: 'absolute'}}>
            <div style={{left: 0, top: 0, position: 'absolute', color: '#666666', fontSize: 14, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>열람 현황</div>
          </div>
          <div style={{width: 226, height: 70, left: 20, top: 50, position: 'absolute'}}>
            <div style={{width: 226, height: 70, left: 0, top: 0, position: 'absolute', borderBottom: '1px solid #F59E0B'}}>
              <div style={{width: 100, height: 20, left: 3.53, top: 5, position: 'absolute', color: '#333333', fontSize: 16, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>금일 열람 현황</div>
              <div style={{left: 95, top: 32, position: 'absolute', color: '#333333', fontSize: 22, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '35px', wordWrap: 'break-word'}}>1건</div>
            </div>
          </div>
          <div style={{width: 226, height: 50, left: 20, top: 130, position: 'absolute', display: 'flex', justifyContent: 'space-around'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{color: '#F59E0B', fontSize: 16, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>검색</div>
              <div style={{color: '#F59E0B', fontSize: 22, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '35px', wordWrap: 'break-word'}}>1건</div>
            </div>
            <div style={{textAlign: 'center'}}>
              <div style={{color: '#10B981', fontSize: 16, fontFamily: 'Roboto', fontWeight: '600', lineHeight: '20px', wordWrap: 'break-word'}}>추천</div>
              <div style={{color: '#10B981', fontSize: 22, fontFamily: 'Roboto', fontWeight: '800', lineHeight: '35px', wordWrap: 'break-word'}}>0건</div>
            </div>
          </div>

          {/* Chart */}
          <div style={{width: 226, height: 160, left: 20, top: 190, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={viewData}
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {viewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '6px',
                    fontSize: '11px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
