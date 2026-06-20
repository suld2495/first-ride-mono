export type ModalType =
  | 'account'
  | 'routine-add'
  | 'routine-update'
  | 'routine-detail'
  | 'routine-reorder'
  | 'hidden-routines'
  | 'quest-add'
  | 'quest-detail'
  | 'request'
  | 'request-list'
  | 'request-detail'
  | 'friend-request-list'
  | 'friend-routines'
  | 'stat'
  | 'policies'
  | 'privacy'
  | 'theme';

const MODAL_TYPES: readonly ModalType[] = [
  'account',
  'routine-add',
  'routine-update',
  'routine-detail',
  'routine-reorder',
  'hidden-routines',
  'quest-add',
  'quest-detail',
  'request',
  'request-list',
  'request-detail',
  'friend-request-list',
  'friend-routines',
  'stat',
  'policies',
  'privacy',
  'theme',
];

const LEGACY_MODAL_TYPE_ALIASES = {
  'routine-edit': 'routine-update',
} as const satisfies Record<string, ModalType>;

export const normalizeModalType = (type: unknown): ModalType | null => {
  const modalType = Array.isArray(type) ? (type[0] as unknown) : type;

  if (typeof modalType !== 'string') {
    return null;
  }

  if (modalType in LEGACY_MODAL_TYPE_ALIASES) {
    return LEGACY_MODAL_TYPE_ALIASES[
      modalType as keyof typeof LEGACY_MODAL_TYPE_ALIASES
    ];
  }

  return MODAL_TYPES.includes(modalType as ModalType)
    ? (modalType as ModalType)
    : null;
};
