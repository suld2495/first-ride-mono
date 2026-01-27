'use client';

import { useFetchRewardsQuery } from '@repo/shared/hooks/useQuest';
import { RewardTypeFilter } from '@repo/types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function RewardsPage() {
  const [filter, setFilter] = useState<RewardTypeFilter>('ALL');
  const { data: rewards, isLoading } = useFetchRewardsQuery(filter);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">리워드 관리</h1>
        <Button>리워드 생성</Button>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilter('ALL')}
        >
          전체
        </Button>
        <Button
          variant={filter === 'BADGE' ? 'default' : 'outline'}
          onClick={() => setFilter('BADGE')}
        >
          배지
        </Button>
        <Button
          variant={filter === 'EXP' ? 'default' : 'outline'}
          onClick={() => setFilter('EXP')}
        >
          경험치
        </Button>
      </div>

      {isLoading && <div>로딩 중...</div>}

      {rewards && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>리워드명</TableHead>
              <TableHead>타입</TableHead>
              <TableHead>경험치</TableHead>
              <TableHead>설명</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.map((reward) => (
              <TableRow key={reward.rewardId}>
                <TableCell>{reward.rewardName}</TableCell>
                <TableCell>{reward.rewardType}</TableCell>
                <TableCell>{reward.expAmount}</TableCell>
                <TableCell>{reward.description}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
