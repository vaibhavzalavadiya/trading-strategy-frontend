import { Condition, NumericIndicator, ParamIndicator, Operator, Joiner } from './types';

function indicatorToString(type: ParamIndicator, params: Record<string, any>): string {
  if (type === 'EMA' || type === 'SMA') {
    return `${type}(${params.source || 'Close'}, ${params.period})`;
  }
  if (type === 'RSI') {
    return `RSI(${params.source || 'Close'}, ${params.period})`;
  }
  if (type === 'Supertrend') {
    return `Supertrend(${params.period}, ${params.multiplier})`;
  }
  // Add more as needed
  return `${type}`;
}

function leftToString(left: NumericIndicator | ParamIndicator, leftParams?: Record<string, any>) {
  if (leftParams && Object.keys(leftParams).length > 0) {
    return indicatorToString(left as ParamIndicator, leftParams);
  }
  return left;
}

export function conditionToString(cond: Condition): string {
  const left = leftToString(cond.left, cond.leftParams);
  const op = cond.operator;
  let right = '';
  if (cond.valueType === 'number') right = cond.rightNumber?.toString() ?? '';
  if (cond.valueType === 'field') right = cond.rightField ?? '';
  if (cond.valueType === 'indicator' && cond.rightIndicator)
    right = indicatorToString(cond.rightIndicator.type, cond.rightIndicator.params);
  return `${left} ${op} ${right}`;
}

export function conditionsToString(conditions: Condition[]): string {
  return conditions
    .map((c, i) => (i > 0 ? ` ${c.joiner} ` : '') + conditionToString(c))
    .join('');
} 