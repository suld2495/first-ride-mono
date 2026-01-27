'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  useFetchQuestDetailQuery,
  useUpdateQuestMutation,
  useDeleteQuestMutation,
} from '@repo/shared/hooks/useQuest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

export default function QuestEditPage() {
  const params = useParams();
  const router = useRouter();
  const questId = Number(params.id);

  const { data: quest } = useFetchQuestDetailQuery(questId);
  const updateMutation = useUpdateQuestMutation();
  const deleteMutation = useDeleteQuestMutation();

  const [formData, setFormData] = useState({
    questName: '',
    description: '',
    questType: 'DAILY' as 'DAILY' | 'WEEKLY',
    startDate: '',
    endDate: '',
    requiredLevel: 1,
    maxParticipants: 100,
    rewardId: 1,
  });

  useEffect(() => {
    if (quest) {
      setFormData({
        questName: quest.questName,
        description: quest.description,
        questType: quest.questType,
        startDate: quest.startDate.split('T')[0],
        endDate: quest.endDate.split('T')[0],
        requiredLevel: quest.requiredLevel,
        maxParticipants: quest.maxParticipants,
        rewardId: quest.rewardId,
      });
    }
  }, [quest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateMutation.mutateAsync({ ...formData, questId });
    router.push('/quests');
  };

  const handleDelete = async () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await deleteMutation.mutateAsync(questId);
      router.push('/quests');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">퀘스트 수정</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <Label htmlFor="questName">퀘스트명</Label>
          <Input
            id="questName"
            value={formData.questName}
            onChange={(e) =>
              setFormData({ ...formData, questName: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="description">설명</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
        <div className="flex gap-4">
          <Button type="submit">저장</Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            삭제
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
