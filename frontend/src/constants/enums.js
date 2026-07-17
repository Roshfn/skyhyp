// Kept in exact sync with the backend enums shown in /v3/api-docs.
// NOTE: Setup uses "RETEST" (not "RESET") per the live schema.

export const SETUP_OPTIONS = ['BREAKOUT', 'RETEST', 'WEEK_52_HIGH', 'TOP_PERFORMER']

export const RISK_REWARD_OPTIONS = ['RR_1_1', 'RR_1_2', 'RR_1_3', 'CUSTOM']

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
