import type { Pipeline, Step } from '../../types';

export interface StepWithEnabled extends Step {
  enabled: boolean;
}

export interface PipelineWithEnabled extends Pipeline {
  steps?: StepWithEnabled[];
  enabled: boolean;
}

export interface EnvPreset {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'input';
  required?: boolean; // 是否必填
  options?: Array<{ label: string; value: string }>;
}