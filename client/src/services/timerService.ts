import { apiClient } from "./apiClient";
import type { TimedMessage, TimedMessageDelivery } from "../types/timedMessage";

// Keep in sync with CAPSULE_STATUSES in server/src/validation/schemas.ts but do that.
export type messageType = "timeCapsule" | "letter";
export type deliveryStatus = "pending" | "delivered" | "failed";

export async function getCapsule(
    type: messageType = "timeCapsule",
    status: deliveryStatus = "pending",
): Promise<TimedMessage[]> {
    const response = await apiClient(`/capsules?status=${status}`, `/capsules?type=${type}`);
    return response.json();
}

export async function createCapsule(
    name: string,
    description: string | null,
    deliveredAt: string | null,
): Promise<TimedMessage> {
    const response = await apiClient("/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, deliveredAt })
    });
    return response.json();
}

export async function getCapsuleDeliveries(
    messageId: string,
    messageType: messageType = "timeCapsule",
    deliveryStatus: deliveryStatus = "pending",
): Promise<TimedMessageDelivery[]> {
    const response = await apiClient(`/capsules/${messageId}/deliveries`, `/capsules/${messageId}/deliveries?status=${deliveryStatus}`);
    return response.json();
}