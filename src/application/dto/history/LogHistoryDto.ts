import type { LogHistoryParams } from '../../../domain/repositories/IHistoryRepository.ts';

export type LogHistoryInput = LogHistoryParams;

export interface LogHistoryOutput {
  logged: true;
}
