import { useEffect, useMemo, useState } from 'react';
import {
  useDeleteRewardMutation,
  useFetchRewardsQuery,
} from '@repo/shared/hooks/useQuest';
import { Reward, RewardTypeFilter } from '@repo/types';

import RewardFilter from '@/components/admin/reward/RewardFilter';
import RewardFormModal from '@/components/admin/reward/RewardFormModal';
import RewardTable from '@/components/admin/reward/RewardTable';
import Button from '@/components/common/button/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DarkMode from '@/components/common/DarkMode';
import Pagination from '@/components/common/Pagination';
import Paragraph from '@/components/common/paragraph/Paragraph';
import ToastContainer from '@/components/common/ToastContainer';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/utils/error-utils';

const RewardManagement = () => {
  const [selectedType, setSelectedType] = useState<RewardTypeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | undefined>();

  const { data: rewards = [], isLoading } = useFetchRewardsQuery(selectedType);
  const deleteMutation = useDeleteRewardMutation();
  const { toasts, success, error, removeToast } = useToast();
  const { confirmState, confirm } = useConfirm();

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      if (searchQuery !== debouncedSearchQuery) {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  const filteredRewards = useMemo(() => {
    if (!debouncedSearchQuery) return rewards;
    return rewards.filter((r) =>
      r.rewardName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    );
  }, [rewards, debouncedSearchQuery]);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);

  const handleTypeChange = (type: RewardTypeFilter) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (rewardId: number) => {
    const confirmed = await confirm({
      title: '보상 삭제',
      message: '정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
      isDangerous: true,
    });

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(rewardId);
      success('보상이 삭제되었습니다');
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '삭제 중 오류가 발생했습니다',
      );

      error(errorMessage);
    }
  };

  const handleCreate = () => {
    setEditingReward(undefined);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingReward(undefined);
  };

  return (
    <div className="container mx-auto p-4 max-w-[var(--max-width)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <Paragraph variant="title" className="font-bold mb-2">
            보상 관리
          </Paragraph>
          <div className="flex gap-3 items-center">
            <DarkMode />
            <Button onClick={handleCreate}>+ 새 보상</Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          보상 관리 &gt; 보상 목록
        </p>
      </div>

      {/* Filter */}
      <RewardFilter
        selectedType={selectedType}
        searchQuery={searchQuery}
        onTypeChange={handleTypeChange}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
      />

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : (
        <RewardTable
          rewards={filteredRewards}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Form Modal */}
      <RewardFormModal
        isOpen={isFormModalOpen}
        reward={editingReward}
        onClose={handleCloseModal}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Confirm Dialog */}
      <ConfirmDialog {...confirmState} />
    </div>
  );
};

export default RewardManagement;
