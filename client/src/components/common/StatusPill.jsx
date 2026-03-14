import Badge from '../ui/Badge';
import { formatStatus } from '../../utils/formatStatus';

const toneMap = {
  planning: 'neutral',
  active: 'info',
  on_hold: 'warning',
  completed: 'success',
  healthy: 'success',
  on_track: 'info',
  at_risk: 'warning',
  overdue: 'danger',
  archived: 'neutral',
  todo: 'neutral',
  in_progress: 'info',
  done: 'success',
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
};

export default function StatusPill({ value }) {
  return <Badge tone={toneMap[value] || 'neutral'}>{formatStatus(value)}</Badge>;
}
