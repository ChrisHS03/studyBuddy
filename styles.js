import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  authContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  dashboardContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 14,
  },
  brandBlock: {
    marginBottom: 14,
  },
  heroCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe2ea',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandTitle: {
    color: '#0f172a',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  brandSubtitle: {
    color: '#475569',
    fontSize: 15,
  },
  formTitle: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSubtitle: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 14,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe2ea',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    elevation: 3,
  },
  errorBanner: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  noticeText: {
    marginBottom: 10,
    color: '#8a2a2a',
    fontSize: 13,
  },
  input: {
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c9d3df',
    color: '#0f172a',
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  largeInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    marginBottom: 10,
    color: '#b91c1c',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonBase: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rowButton: {
    flex: 1,
  },
  fullWidthButton: {
    width: '100%',
  },
  primaryButton: {
    marginTop: 2,
    backgroundColor: '#0f172a',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#0f172a',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fff1f2',
  },
  dangerButtonText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '700',
  },
  signOutButton: {
    minWidth: 112,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  chipRow: {
    gap: 10,
    paddingBottom: 12,
  },
  groupChip: {
    minWidth: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbe2ea',
  },
  groupChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  groupChipTitle: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  groupChipTitleActive: {
    color: '#ffffff',
  },
  groupChipSubtitle: {
    color: '#64748b',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  groupChipSubtitleActive: {
    color: '#cbd5e1',
  },
  groupMeta: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
  },
  tabButtonActive: {
    backgroundColor: '#0f172a',
  },
  tabButtonText: {
    color: '#334155',
    fontWeight: '700',
    fontSize: 13,
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  sectionPanel: {
    paddingTop: 4,
  },
  sectionLabel: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionHint: {
    color: '#64748b',
    fontSize: 13,
    marginBottom: 12,
  },
  listBlock: {
    marginTop: 14,
    gap: 10,
  },
  listItem: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  listItemTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  listItemBody: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  metaText: {
    color: '#64748b',
    fontSize: 12,
  },
  statusBadge: {
    color: '#0f172a',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  itemActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 10,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  linkAction: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  messageList: {
    gap: 10,
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: '86%',
    padding: 12,
    borderRadius: 14,
  },
  messageBubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#0f172a',
  },
  messageBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#e2e8f0',
  },
  messageText: {
    color: '#0f172a',
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextMine: {
    color: '#ffffff',
  },
  messageSender: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageSenderMine: {
    color: '#cbd5e1',
  },
  messageTime: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 6,
  },
  messageTimeMine: {
    color: '#cbd5e1',
  },
});
