export declare class EmailService {
    private transporter;
    private readonly logger;
    constructor();
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendExpiryReminder(email: string, daysRemaining: number): Promise<void>;
    sendWhaleAlert(email: string, alertData: any): Promise<void>;
}
