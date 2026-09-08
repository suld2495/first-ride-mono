import type { Href } from 'expo-router';
import { Redirect, useLocalSearchParams } from 'expo-router';

const getFirstParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? (value[0] ?? '') : (value ?? '');

export default function RoutineDetailRoute() {
  const { ownerId, routineId } = useLocalSearchParams<{
    ownerId?: string | string[];
    routineId?: string | string[];
  }>();
  const ownerIdParam = getFirstParam(ownerId);
  const routineIdParam = getFirstParam(routineId);
  const query = [
    'type=routine-detail',
    ownerIdParam ? `ownerId=${encodeURIComponent(ownerIdParam)}` : null,
    routineIdParam ? `routineId=${encodeURIComponent(routineIdParam)}` : null,
  ]
    .filter((parameter): parameter is string => parameter !== null)
    .join('&');

  return <Redirect href={`/modal?${query}` as Href} />;
}
