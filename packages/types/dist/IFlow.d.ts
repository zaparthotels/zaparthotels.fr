export interface IFlow {
    name: string;
    status: TFlowStatus;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum TFlowStatus {
    PENDING = "pending",
    RUNNING = "running",
    COMPLETED = "completed",
    FAILED = "failed"
}
//# sourceMappingURL=IFlow.d.ts.map