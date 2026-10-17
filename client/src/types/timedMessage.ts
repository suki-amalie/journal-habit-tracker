export interface TimedMessage {
    id: number;
    userId: number;
    name: string;
    description: string | null;
    createdAt: string;
    deliveredAt: string | null;
    messageType: "timeCapsule" | "letter";
}

export interface TimedMessageDelivery {
    id: number;
    messageId: number;
    date: string;
    deliveryStatus: "pending" | "delivered" | "failed";
}