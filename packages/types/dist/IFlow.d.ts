export interface IFlow {
    name: string;
    status: TFlowStatus;
    steps?: TFlowStep[];
}
export declare enum TFlowStatus {
    PENDING = "pending",
    FAILED = "failed",
    COMPLETED = "completed"
}
export type TFlowStep = {
    name: string;
    status: TFlowStatus;
};
//# sourceMappingURL=IFlow.d.ts.map