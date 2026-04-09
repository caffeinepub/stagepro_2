import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface StarredEntry {
    id: bigint;
    name: string;
    createdAt: Time;
    description: string;
    updatedAt: Time;
    imageUrl: string;
    userPrincipal: Principal;
    prompt: string;
}
export interface PlanLimits {
    plan: SubscriptionPlan;
    videoLimit: bigint;
    price: bigint;
    photoLimit: bigint;
}
export interface CustomTheme {
    principal: Principal;
    name: string;
    createdAt: Time;
    prompt: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface DesignEntry {
    principal: Principal;
    createdAt: Time;
    style: string;
    roomType: string;
}
export interface AiGenerationLog {
    id: bigint;
    createdAt: Time;
    inputImageBlobId: string;
    userPrincipal: Principal;
    prompt: string;
    outputImageBlobId: string;
}
export interface SubscriptionUsage {
    lastReset: Time;
    photosUsed: bigint;
    createdAt: Time;
    plan: SubscriptionPlan;
    videosUsed: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface UserProfile {
    principal: Principal;
    name: string;
    createdAt: Time;
}
export enum SubscriptionPlan {
    max = "max",
    pro = "pro",
    growth = "growth",
    starter = "starter",
    basic = "basic"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomTheme(name: string, prompt: string): Promise<bigint>;
    addDesign(roomType: string, style: string): Promise<bigint>;
    addStarredEntry(name: string, description: string, imageUrl: string, prompt: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimDodoPayment(paymentId: string, planId: SubscriptionPlan): Promise<string>;
    createCheckoutSession(planId: SubscriptionPlan, successUrl: string, cancelUrl: string): Promise<string>;
    deleteCustomTheme(themeId: bigint): Promise<void>;
    deleteStarredEntry(entryId: bigint): Promise<void>;
    getAiGenerationLogCount(): Promise<bigint>;
    getAiGenerationLogs(): Promise<Array<AiGenerationLog>>;
    getAiGenerationLogsReverse(): Promise<Array<AiGenerationLog>>;
    getAiGenerationLogsSorted(): Promise<Array<AiGenerationLog>>;
    getAllDesigns(): Promise<Array<DesignEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDesignHistorySorted(): Promise<Array<DesignEntry>>;
    getImage(image: ExternalBlob): Promise<ExternalBlob>;
    getMyCustomThemes(): Promise<Array<CustomTheme>>;
    getMyProfile(): Promise<UserProfile>;
    getMyStarredEntries(): Promise<Array<StarredEntry>>;
    getMyStarredEntryCount(): Promise<bigint>;
    getMySubscription(): Promise<SubscriptionUsage>;
    getPlanLimitsQuery(plan: SubscriptionPlan): Promise<PlanLimits>;
    getStarredEntries(userPrincipal: Principal): Promise<Array<StarredEntry>>;
    getTotalStarredEntryCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    handleDodoWebhook(payload: string, signature: string): Promise<string>;
    isCallerAdmin(): Promise<boolean>;
    logAiGeneration(prompt: string, inputImageBlobId: string, outputImageBlobId: string): Promise<void>;
    recordPhotoUsage(): Promise<void>;
    recordVideoUsage(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    selfRegister(name: string): Promise<void>;
    setUserPlan(user: Principal, newPlan: SubscriptionPlan): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateMyProfile(newName: string): Promise<void>;
    updateStarredEntry(entryId: bigint, name: string, description: string): Promise<void>;
}
