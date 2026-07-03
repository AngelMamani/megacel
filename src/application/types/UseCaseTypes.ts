/** Contrato base de un caso de uso. */
export type UseCase<Input, Output> = {
  execute(input: Input): Promise<Output>;
};
