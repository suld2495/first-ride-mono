'use client';

import { useState } from 'react';
import { useFetchRewardsQuery } from '@repo/shared/hooks/useQuest';
import { RewardTypeFilter } from '@repo/types';

import { Button } from '@/components/ui/button';

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'BADGE':
      return 'quest-badge-weekly';
    case 'EXP':
      return 'quest-badge-completed';
    default:
      return 'quest-badge';
  }
};

export default function RewardsPage() {
  const [filter, setFilter] = useState<RewardTypeFilter>('ALL');
  const { data: rewards, isLoading, error } = useFetchRewardsQuery(filter);

  const filterOptions: {
    value: RewardTypeFilter;
    label: string;
    icon: string;
  }[] = [
    { value: 'ALL', label: '전체', icon: '📦' },
    { value: 'BADGE', label: '배지', icon: '🎖️' },
    { value: 'EXP', label: '경험치', icon: '✨' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-glow text-3xl font-bold text-[#1ddeff]">
            🏆 리워드 관리
          </h1>
          <p className="mt-1 text-[#90a1b9]">
            퀘스트 보상을 설정하고 관리합니다
          </p>
        </div>
        <Button className="btn-amber flex items-center gap-2">
          <span>+</span>
          <span>리워드 생성</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="quest-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(251,191,36,0.2)]">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#fbbf24]">
                {rewards?.length ?? 0}
              </p>
              <p className="text-sm text-[#90a1b9]">전체 리워드</p>
            </div>
          </div>
        </div>
        <div className="quest-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(139,92,246,0.2)]">
              <span className="text-2xl">🎖️</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#a78bfa]">
                {rewards?.filter((r) => r.rewardType === 'BADGE').length ?? 0}
              </p>
              <p className="text-sm text-[#90a1b9]">배지</p>
            </div>
          </div>
        </div>
        <div className="quest-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(251,191,36,0.2)]">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#fbbf24]">
                {rewards?.filter((r) => r.rewardType === 'EXP').length ?? 0}
              </p>
              <p className="text-sm text-[#90a1b9]">경험치</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="quest-card">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[#90a1b9]">타입 필터:</span>
          <div className="flex gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`filter-tab flex items-center gap-2 ${filter === option.value ? 'active' : ''}`}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="quest-card flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#fbbf24] border-t-transparent"></div>
            <p className="text-[#90a1b9]">리워드를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="quest-card border-[#ef4444] bg-[rgba(239,68,68,0.1)]">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-[#ef4444]">오류가 발생했습니다</p>
              <p className="text-sm text-[#90a1b9]">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Table */}
      {rewards && !isLoading && (
        <div className="quest-card overflow-hidden p-0">
          <table className="quest-table">
            <thead>
              <tr>
                <th className="rounded-tl-lg">리워드</th>
                <th>타입</th>
                <th>경험치</th>
                <th>설명</th>
                <th className="rounded-tr-lg">액션</th>
              </tr>
            </thead>
            <tbody>
              {rewards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl">🎁</span>
                      <p className="text-[#90a1b9]">리워드가 없습니다</p>
                      <Button className="btn-amber mt-2">
                        첫 리워드 만들기
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                rewards.map((reward) => (
                  <tr key={reward.rewardId}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(251,191,36,0.2)]">
                          <span className="text-lg">
                            {reward.rewardType === 'BADGE' ? '🎖️' : '✨'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#e0f2fe]">
                            {reward.rewardName}
                          </p>
                          <p className="text-xs text-[#90a1b9]">
                            ID: {reward.rewardId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`quest-badge ${getTypeBadgeClass(reward.rewardType)}`}
                      >
                        {reward.rewardType === 'BADGE' ? '배지' : '경험치'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-[#fbbf24]">
                          +{reward.expAmount}
                        </span>
                        <span className="text-xs text-[#90a1b9]">EXP</span>
                      </div>
                    </td>
                    <td>
                      <p className="max-w-xs truncate text-sm text-[#90a1b9]">
                        {reward.description || '-'}
                      </p>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-quest-outline text-xs"
                        >
                          수정
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#ef4444] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]"
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
