'use client';

import { useState } from 'react';
import { useFetchQuestsQuery } from '@repo/shared/hooks/useQuest';
import { QuestTypeFilter } from '@repo/types';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function QuestsPage() {
  const [filter, setFilter] = useState<QuestTypeFilter>('ALL');
  const { data: quests, isLoading, error } = useFetchQuestsQuery(filter);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">퀘스트 관리</h1>
        <Button>퀘스트 생성</Button>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilter('ALL')}
        >
          전체
        </Button>
        <Button
          variant={filter === 'DAILY' ? 'default' : 'outline'}
          onClick={() => setFilter('DAILY')}
        >
          일일
        </Button>
        <Button
          variant={filter === 'WEEKLY' ? 'default' : 'outline'}
          onClick={() => setFilter('WEEKLY')}
        >
          주간
        </Button>
      </div>

      {isLoading && <div>로딩 중...</div>}
      {error && <div className="text-red-600">에러: {error.message}</div>}

      {quests && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>퀘스트명</TableHead>
              <TableHead>타입</TableHead>
              <TableHead>시작일</TableHead>
              <TableHead>종료일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>참여자</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  퀘스트가 없습니다
                </TableCell>
              </TableRow>
            ) : (
              quests.map((quest) => (
                <TableRow key={quest.questId}>
                  <TableCell>{quest.questName}</TableCell>
                  <TableCell>{quest.questType}</TableCell>
                  <TableCell>
                    {new Date(quest.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(quest.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{quest.status}</TableCell>
                  <TableCell>
                    {quest.currentParticipants} / {quest.maxParticipants}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                      <Button variant="destructive" size="sm">
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
