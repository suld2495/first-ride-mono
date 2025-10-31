import { useEffect, useMemo, useState } from 'react';
import {
  useDeleteQuestMutation,
  useFetchQuestsQuery,
} from '@repo/shared/hooks/useQuest';
import { Quest, QuestTypeFilter } from '@repo/types';

import Button from '@/components/common/button/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DarkMode from '@/components/common/DarkMode';
import Pagination from '@/components/common/Pagination';
import Paragraph from '@/components/common/paragraph/Paragraph';
import ToastContainer from '@/components/common/ToastContainer';
import QuestFilter from '@/components/quest/QuestFilter';
import QuestFormModal from '@/components/quest/QuestFormModal';
import QuestTable from '@/components/quest/QuestTable';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/useToast';

const QuestManagement = () => {
  const [selectedType, setSelectedType] = useState<QuestTypeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | undefined>();

  const { data: quests = [], isLoading } = useFetchQuestsQuery(selectedType);
  const deleteMutation = useDeleteQuestMutation();
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
  }, [searchQuery]);

  const filteredQuests = useMemo(() => {
    if (!debouncedSearchQuery) return quests;
    return quests.filter((q) =>
      q.questName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    );
  }, [quests, debouncedSearchQuery]);

  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredQuests.length / itemsPerPage);

  const handleTypeChange = (type: QuestTypeFilter) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleEdit = (quest: Quest) => {
    setEditingQuest(quest);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: '퀘스트 삭제',
      message: '정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
      isDangerous: true,
    });

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      success('퀘스트가 삭제되었습니다');
    } catch (err) {
      error('삭제 중 오류가 발생했습니다');
    }
  };

  const handleCreate = () => {
    setEditingQuest(undefined);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setEditingQuest(undefined);
  };

  return (
    <div className="container mx-auto p-4 max-w-[var(--max-width)]">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <Paragraph variant="h2" className="font-bold mb-2">
            퀘스트 관리
          </Paragraph>
          <div className="flex gap-3 items-center">
            <DarkMode />
            <Button onClick={handleCreate}>+ 새 퀘스트</Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          퀘스트 관리 &gt; 퀘스트 목록
        </p>
      </div>

      {/* Filter */}
      <QuestFilter
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
        <QuestTable
          quests={filteredQuests}
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
      <QuestFormModal
        isOpen={isFormModalOpen}
        quest={editingQuest}
        onClose={handleCloseModal}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Confirm Dialog */}
      <ConfirmDialog {...confirmState} />
    </div>
  );
};

export default QuestManagement;
