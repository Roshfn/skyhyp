// Kept in exact sync with the backend enums shown in /v3/api-docs.
// NOTE: Setup uses "RETEST" (not "RESET") per the live schema.

export const SETUP_OPTIONS = ['BREAKOUT', 'RETEST', 'WEEK_52_HIGH', 'TOP_PERFORMER']

export const RISK_REWARD_OPTIONS = ['RR_1_1', 'RR_1_2', 'RR_1_3', 'CUSTOM']

// ":" isn't legal inside a Java enum constant, so the backend stores these as
// RR_1_1 / RR_1_2 / etc. This is the one place that maps them back to the
// "1:1" display form - use this instead of labelize() for riskReward values.
const RISK_REWARD_LABELS = {
  RR_1_1: '1:1',
  RR_1_2: '1:2',
  RR_1_3: '1:3',
  CUSTOM: 'Custom'
}

export function riskRewardLabel(value, customRiskReward) {
  if (value === 'CUSTOM') return customRiskReward || 'Custom'
  return RISK_REWARD_LABELS[value] || value
}

export const DID_FOLLOW_PLAN_OPTIONS = ['YES', 'NO']

export const EMOTION_OPTIONS = ['CALM', 'FOMO', 'FEAR', 'CONFIDENCE']

export function labelize(value) {
  if (!value) return ''
  return value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}