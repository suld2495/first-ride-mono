'use client';

import {
  useFetchQuestsQuery,
  useFetchRewardsQuery,
} from '@repo/shared/hooks/useQuest';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

function getStatusLabel(status: string) {
  if (status === 'ACTIVE') return '진행중';
  if (status === 'COMPLETED') return '완료';
  return '비활성';
}

function getStatusBadgeClass(status: string) {
  if (status === 'ACTIVE') return 'quest-badge-active';
  if (status === 'COMPLETED') return 'quest-badge-completed';
  return 'quest-badge-inactive';
}

export default function DashboardPage() {
  const { data: quests } = useFetchQuestsQuery('ALL');
  const { data: rewards } = useFetchRewardsQuery('ALL');

  const activeQuests = quests?.filter((q) => q.status === 'ACTIVE').length ?? 0;
  const completedQuests =
    quests?.filter((q) => q.status === 'COMPLETED').length ?? 0;
  const totalParticipants =
    quests?.reduce((acc, q) => acc + q.currentParticipants, 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="quest-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-glow text-3xl font-bold text-[#1ddeff]">
              🎮 대시보드
            </h1>
            <p className="mt-2 text-[#90a1b9]">
              First Ride 관리자 페이지에 오신 것을 환영합니다
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/quests">
              <Button className="btn-quest">퀘스트 관리</Button>
            </Link>
            <Link href="/rewards">
              <Button className="btn-amber">리워드 관리</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="quest-card">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-2xl">📋</span>
            <span className="quest-badge text-xs">TOTAL</span>
          </div>
          <p className="text-3xl font-bold text-[#1ddeff]">
            {quests?.length ?? 0}
          </p>
          <p className="text-sm text-[#90a1b9]">전체 퀘스트</p>
        </div>

        <div className="quest-card">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-2xl">🟢</span>
            <span className="quest-badge-active text-xs">ACTIVE</span>
          </div>
          <p className="text-3xl font-bold text-[#4ade80]">{activeQuests}</p>
          <p className="text-sm text-[#90a1b9]">진행 중인 퀘스트</p>
        </div>

        <div className="quest-card">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-2xl">🏆</span>
            <span className="quest-badge-completed text-xs">REWARDS</span>
          </div>
          <p className="text-3xl font-bold text-[#fbbf24]">
            {rewards?.length ?? 0}
          </p>
          <p className="text-sm text-[#90a1b9]">등록된 리워드</p>
        </div>

        <div className="quest-card">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-2xl">👥</span>
            <span className="quest-badge text-xs">USERS</span>
          </div>
          <p className="text-3xl font-bold text-[#f97316]">
            {totalParticipants}
          </p>
          <p className="text-sm text-[#90a1b9]">총 참여자</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Quests */}
        <div className="quest-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#e0f2fe]">
              <span>⚔️</span> 최근 퀘스트
            </h2>
            <Link href="/quests">
              <span className="text-sm text-[#0891b2] hover:text-[#1ddeff]">
                전체보기 →
              </span>
            </Link>
          </div>

          {quests && quests.length > 0 ? (
            <div className="space-y-3">
              {quests.slice(0, 5).map((quest) => (
                <div
                  key={quest.questId}
                  className="flex items-center justify-between rounded-lg border border-[rgba(8,145,178,0.3)] bg-[rgba(8,145,178,0.05)] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[rgba(8,145,178,0.2)]">
                      <span>⚔️</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#e0f2fe]">
                        {quest.questName}
                      </p>
                      <p className="text-xs text-[#90a1b9]">
                        {quest.questType === 'DAILY' ? '일일' : '주간'} 퀘스트
                      </p>
                    </div>
                  </div>
                  <span
                    className={`quest-badge text-xs ${getStatusBadgeClass(quest.status)}`}
                  >
                    {getStatusLabel(quest.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <span className="text-4xl">🔍</span>
              <p className="mt-3 text-[#90a1b9]">퀘스트가 없습니다</p>
              <Link href="/quests">
                <Button className="btn-quest-outline mt-4">
                  퀘스트 만들기
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Rewards */}
        <div className="quest-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#e0f2fe]">
              <span>🏆</span> 등록된 리워드
            </h2>
            <Link href="/rewards">
              <span className="text-sm text-[#f59e0b] hover:text-[#fbbf24]">
                전체보기 →
              </span>
            </Link>
          </div>

          {rewards && rewards.length > 0 ? (
            <div className="space-y-3">
              {rewards.slice(0, 5).map((reward) => (
                <div
                  key={reward.rewardId}
                  className="flex items-center justify-between rounded-lg border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.05)] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[rgba(251,191,36,0.2)]">
                      <span>{reward.rewardType === 'BADGE' ? '🎖️' : '✨'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#e0f2fe]">
                        {reward.rewardName}
                      </p>
                      <p className="text-xs text-[#90a1b9]">
                        +{reward.expAmount} EXP
                      </p>
                    </div>
                  </div>
                  <span
                    className={`quest-badge text-xs ${
                      reward.rewardType === 'BADGE'
                        ? 'quest-badge-weekly'
                        : 'quest-badge-completed'
                    }`}
                  >
                    {reward.rewardType === 'BADGE' ? '배지' : '경험치'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <span className="text-4xl">🎁</span>
              <p className="mt-3 text-[#90a1b9]">리워드가 없습니다</p>
              <Link href="/rewards">
                <Button className="btn-amber mt-4">리워드 만들기</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="quest-card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#e0f2fe]">
          <span>📊</span> 퀘스트 현황
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="stat-box">
            <div className="stat-label mb-1">완료율</div>
            <div className="stat-value">
              {quests && quests.length > 0
                ? Math.round((completedQuests / quests.length) * 100)
                : 0}
              %
            </div>
            <div className="quest-progress mt-2 w-full">
              <div
                className="quest-progress-fill"
                style={{
                  width: `${quests && quests.length > 0 ? (completedQuests / quests.length) * 100 : 0}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label mb-1">활성 퀘스트</div>
            <div className="stat-value text-[#4ade80]">{activeQuests}</div>
            <div className="mt-2 text-xs text-[#90a1b9]">
              전체 {quests?.length ?? 0}개 중
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label mb-1">평균 참여자</div>
            <div className="stat-value text-[#f97316]">
              {quests && quests.length > 0
                ? Math.round(totalParticipants / quests.length)
                : 0}
            </div>
            <div className="mt-2 text-xs text-[#90a1b9]">퀘스트당 평균</div>
          </div>
        </div>
      </div>
    </div>
  );
}
