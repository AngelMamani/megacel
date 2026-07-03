import type { IHistoryRepository } from '../../../domain/repositories/IHistoryRepository.ts';
import type { LogHistoryInput, LogHistoryOutput } from '../../dto/history/LogHistoryDto.ts';
import type { UseCase } from '../../types/UseCaseTypes.ts';

export type LogHistoryDeps = {
  historyRepository: IHistoryRepository;
};

export function createLogHistoryUseCase(
  deps: LogHistoryDeps
): UseCase<LogHistoryInput, LogHistoryOutput> {
  return {
    async execute(input) {
      await deps.historyRepository.log(input);
      return { logged: true };
    },
  };
}
