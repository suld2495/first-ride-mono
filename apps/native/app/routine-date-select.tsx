import { getFormatDate } from '@repo/shared/utils';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import DateCalendar from '@/components/calendar/date-calendar';
import Container from '@/components/layout/container';
import PageHeader from '@/components/layout/page-header';
import { StyleSheet } from '@/components/ui/tamagui';
import {
  useClearRoutineDateSelection,
  useConfirmRoutineDateSelection,
  useRoutineDateSelection,
} from '@/hooks/useRoutineSelection';

const getDateFromFormValue = (date?: string) => {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
};

const getStartOfToday = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  return today;
};

export default function RoutineDateSelectPage() {
  const router = useRouter();
  const routineDateSelection = useRoutineDateSelection();
  const confirmRoutineDateSelection = useConfirmRoutineDateSelection();
  const clearRoutineDateSelection = useClearRoutineDateSelection();
  const today = useMemo(() => getStartOfToday(), []);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(() =>
    getDateFromFormValue(routineDateSelection?.initialStartDate ?? undefined),
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(() =>
    getDateFromFormValue(routineDateSelection?.initialEndDate ?? undefined),
  );

  const handleCancel = () => {
    clearRoutineDateSelection();
    router.back();
  };

  const handleSelectDate = (date: Date) => {
    if (routineDateSelection?.isStartDateFixed && selectedStartDate) {
      setSelectedEndDate(date);
      return;
    }

    if (!selectedStartDate || selectedEndDate) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      return;
    }

    if (date.getTime() < selectedStartDate.getTime()) {
      setSelectedStartDate(date);
      return;
    }

    setSelectedEndDate(date);
  };

  const handleConfirm = () => {
    if (!selectedStartDate) {
      return;
    }

    confirmRoutineDateSelection(
      getFormatDate(selectedStartDate),
      selectedEndDate ? getFormatDate(selectedEndDate) : null,
    );
    router.back();
  };

  return (
    <Container noPadding>
      <PageHeader title="날짜 선택" showBackButton onBackPress={handleCancel} />
      <View style={styles.content}>
        <DateCalendar
          minimumDate={today}
          selectedDate={selectedStartDate}
          selectedEndDate={selectedEndDate}
          onSelectDate={handleSelectDate}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create((theme) => ({
  content: {
    flex: 1,
    paddingHorizontal: theme.foundation.spacing[6],
    paddingTop: theme.foundation.spacing[6],
  },
}));
