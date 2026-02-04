'use client';

import { useState } from 'react';
import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import { QuestTypeFilter } from '@repo/types';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'quest-badge-active';
    case 'COMPLETED':
      return 'quest-badge-completed';
    case 'INACTIVE':
      return 'quest-badge-inactive';
    default:
      return 'quest-badge';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return '진행중';
    case 'COMPLETED':
      return '완료';
    default:
      return '비활성';
  }
};

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'DAILY':
      return 'quest-badge-daily';
    case 'WEEKLY':
      return 'quest-badge-weekly';
    default:
      return 'quest-badge';
  }
};

export default function QuestsPage() {
  const [filter, setFilter] = useState<QuestTypeFilter>('ALL');
  const { data: quests, isLoading, error } = useFetchQuestsQuery(filter);

  const filterOptions: { value: QuestTypeFilter; label: string }[] = [
    { value: 'ALL', label: '전체' },
    { value: 'DAILY', label: '일일' },
    { value: 'WEEKLY', label: '주간' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-glow text-3xl font-bold text-[#1ddeff]">
            ⚔️ 퀘스트 관리
          </h1>
          <p className="mt-1 text-[#90a1b9]">퀘스트를 생성하고 관리합니다</p>
        </div>
        <Button className="btn-quest flex items-center gap-2">
          <span>+</span>
          <span>퀘스트 생성</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="quest-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(8,145,178,0.2)]">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1ddeff]">
                {quests?.length ?? 0}
              </p>
              <p className="text-sm text-[#90a1b9]">전체 퀘스트</p>
            </div>
          </div>
        </div>
        <div className="quest-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(34,197,94,0.2)]">
              <span className="text-2xl">🟢</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#4ade80]">
                {quests?.filter((q) => q.status === 'ACTIVE').length ?? 0}
              </p>
              <p className="text-sm text-[#90a1b9]">진행 중</p>
            </div>
          </div>
        </div>
        <div className="quest-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(251,191,36,0.2)]">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#fbbf24]">
                {quests?.filter((q) => q.status === 'COMPLETED').length ?? 0}
              </p>
              <p className="text-sm text-[#90a1b9]">완료</p>
            </div>
          </div>
        </div>
        <div className="quest-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(144,161,185,0.2)]">
              <span className="text-2xl">⏸️</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#90a1b9]">
                {quests?.filter((q) => q.status === 'INACTIVE').length ?? 0}
              </p>
              <p className="text-sm text-[#90a1b9]">비활성</p>
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
                className={`filter-tab ${filter === option.value ? 'active' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="quest-card flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0891b2] border-t-transparent"></div>
            <p className="text-[#90a1b9]">퀘스트를 불러오는 중...</p>
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

      {/* Quest Table */}
      {quests && !isLoading && (
        <div className="quest-card overflow-hidden p-0">
          <table className="quest-table">
            <thead>
              <tr>
                <th className="rounded-tl-lg">퀘스트명</th>
                <th>타입</th>
                <th>기간</th>
                <th>상태</th>
                <th>참여자</th>
                <th className="rounded-tr-lg">액션</th>
              </tr>
            </thead>
            <tbody>
              {quests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-4xl">🔍</span>
                      <p className="text-[#90a1b9]">퀘스트가 없습니다</p>
                      <Button className="btn-quest-outline mt-2">
                        첫 퀘스트 만들기
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                quests.map((quest) => (
                  <tr key={quest.questId}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(8,145,178,0.2)]">
                          <span className="text-lg">⚔️</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#e0f2fe]">
                            {quest.questName}
                          </p>
                          <p className="text-xs text-[#90a1b9]">
                            ID: {quest.questId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`quest-badge ${getTypeBadgeClass(quest.questType)}`}
                      >
                        {quest.questType === 'DAILY' ? '일일' : '주간'}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        <p className="text-[#e0f2fe]">
                          {new Date(quest.startDate).toLocaleDateString(
                            'ko-KR',
                          )}
                        </p>
                        <p className="text-[#90a1b9]">
                          ~{' '}
                          {new Date(quest.endDate).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`quest-badge ${getStatusBadgeClass(quest.status)}`}
                      >
                        {getStatusLabel(quest.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="quest-progress w-20">
                          <div
                            className="quest-progress-fill"
                            style={{
                              width: `${Math.min((quest.currentParticipants / quest.maxParticipants) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm">
                          <span className="text-[#f97316]">
                            {quest.currentParticipants}
                          </span>
                          <span className="text-[#90a1b9]">
                            /{quest.maxParticipants}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link href={`/quests/${quest.questId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="btn-quest-outline text-xs"
                          >
                            상세
                          </Button>
                        </Link>
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
