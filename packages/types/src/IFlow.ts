export interface IFlow {
  name: string;
  status: TFlowStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TFlowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
