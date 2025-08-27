export type NumericIndicator =
  | 'Close'
  | 'Open'
  | 'High'
  | 'Low'
  | 'Volume'
  | 'Previous Close'
  | 'Change %'
  | 'VWAP'
  | 'Delivery %'
  | '52 Week High'
  | '52 Week Low';

export type ParamIndicator =
  | 'EMA'
  | 'SMA'
  | 'RSI'
  | 'MACD'
  | 'ADX'
  | 'Supertrend'
  | 'CCI'
  | 'ATR'
  | 'WMA'
  | 'Stochastic K'
  | 'Stochastic D'
  | 'Bollinger Bands'
  | 'MFI';

export type Operator =
  | '>' | '<' | '>=' | '<=' | '=' | '!='
  | 'crossed above' | 'crossed below'
  | 'increased by' | 'decreased by';

export type Joiner = 'AND' | 'OR';

export type IndicatorSource = 'Close' | 'Open' | 'High' | 'Low' | 'Volume';

export interface ParamIndicatorMetaParam {
  name: string;
  type: 'select' | 'number';
  options?: string[];
}

export interface ParamIndicatorMeta {
  name: ParamIndicator;
  params: ParamIndicatorMetaParam[];
}

export type ConditionValueType = 'number' | 'indicator' | 'field';

export interface Condition {
  id: string;
  left: NumericIndicator | ParamIndicator;
  leftParams?: Record<string, any>;
  operator: Operator;
  valueType: ConditionValueType;
  rightNumber?: number;
  rightIndicator?: {
    type: ParamIndicator;
    params: Record<string, any>;
  };
  rightField?: NumericIndicator;
  joiner?: Joiner;
} 