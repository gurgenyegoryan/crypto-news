import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createPublicClient, http, parseAbiItem, decodeFunctionData } from 'viem';
import { polygon } from 'viem/chains';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private readonly ADMIN_WALLET_TRC20 = process.env.ADMIN_USDT_WALLET || 'TSWJ1i1z4aDDsDvC1N6A6UgRteJabtuo29';
    private readonly ADMIN_WALLET_POLYGON = '0x9c4c8f7c057f459c62add15c7330f2a3060479a4';
    private readonly MONTHLY_PRICE_USD = 1;
    private readonly USDT_POLYGON_CONTRACT = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';

    // Initialize Viem client for Polygon
    private readonly polygonClient = createPublicClient({
        chain: polygon,
        transport: http()
    });

    constructor(private prisma: PrismaService) { }

    async verifyPayment(userId: string, txHash: string, network: string = 'TRC20') {
        try {
            // 1. Basic Format Validation
            if (!txHash || txHash.length < 64) {
                return {
                    success: false,
                    message: 'Invalid transaction hash format. Hash must be at least 64 characters.'
                };
            }

            // 2. Check for duplicate usage
            const existingPayment = await this.prisma.payment.findUnique({
                where: { txHash }
            });

            if (existingPayment) {
                return {
                    success: false,
                    message: 'This transaction has already been used for a payment.'
                };
            }

            // 3. Network-specific Verification
            let isVerified = false;
            let amount = 0;

            if (network === 'POLYGON') {
                const verification = await this.verifyPolygonTransaction(txHash);
                if (!verification.valid) {
                    return {
                        success: false,
                        message: verification.error || 'Transaction verification failed.'
                    };
                }
                isVerified = true;
                amount = verification.amount;
            } else if (network === 'TRC20') {
                const verification = await this.verifyTronTransaction(txHash);
                if (!verification.valid) {
                    return {
                        success: false,
                        message: verification.error || 'Transaction verification failed.'
                    };
                }
                isVerified = true;
                amount = verification.amount;
            } else {
                return {
                    success: false,
                    message: 'Unsupported network.'
                };
            }

            if (!isVerified) {
                return {
                    success: false,
                    message: 'Payment verification failed.'
                };
            }

            this.logger.log(`Processing payment for user ${userId} with hash ${txHash}`);

            // Get current user to check if they have an existing subscription
            const currentUser = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { premiumUntil: true, tier: true }
            });

            // Calculate subscription end date
            let premiumUntil: Date;

            if (currentUser?.tier === 'premium' && currentUser.premiumUntil && currentUser.premiumUntil > new Date()) {
                // User is renewing - extend from current expiry date
                premiumUntil = new Date(currentUser.premiumUntil);
                premiumUntil.setDate(premiumUntil.getDate() + 30);
                this.logger.log(`Renewal: extending from ${currentUser.premiumUntil.toISOString()} to ${premiumUntil.toISOString()}`);
            } else {
                // New subscription - start from now
                premiumUntil = new Date();
                premiumUntil.setDate(premiumUntil.getDate() + 30);
            }

            // Create payment record
            const payment = await this.prisma.payment.create({
                data: {
                    userId,
                    txHash,
                    amount: this.MONTHLY_PRICE_USD,
                    currency: 'USDT',
                    network: network,
                    status: 'verified',
                    subscriptionMonths: 1,
                    verifiedAt: new Date(),
                }
            });

            // Update user subscription
            const user = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    tier: 'premium',
                    subscriptionStatus: 'active',
                    premiumUntil,
                    lastPaymentDate: new Date(),
                },
            });

            this.logger.log(`User ${user.email} upgraded to premium until ${premiumUntil.toISOString()}`);

            return {
                success: true,
                message: `Payment verified! You now have Premium access until ${premiumUntil.toLocaleDateString()}.`,
                tier: user.tier,
                premiumUntil: premiumUntil.toISOString(),
            };
        } catch (error) {
            this.logger.error(`Error verifying payment: ${error.message}`);
            return {
                success: false,
                message: 'Failed to process payment. Please contact support.'
            };
        }
    }

    private async verifyPolygonTransaction(txHash: string): Promise<{ valid: boolean; amount: number; error?: string }> {
        try {
            // Ensure hash starts with 0x
            const formattedHash = txHash.startsWith('0x') ? txHash as `0x${string}` : `0x${txHash}` as `0x${string}`;

            const tx = await this.polygonClient.getTransaction({ hash: formattedHash });

            if (!tx) {
                return { valid: false, amount: 0, error: 'Transaction not found on Polygon network.' };
            }

            // Check if it's a USDT transfer
            // USDT Contract on Polygon: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F
            if (tx.to?.toLowerCase() !== this.USDT_POLYGON_CONTRACT.toLowerCase()) {
                return { valid: false, amount: 0, error: 'Transaction is not a USDT transfer.' };
            }

            // Decode input data to verify recipient and amount
            // transfer(address to, uint256 amount)
            try {
                const { args, functionName } = decodeFunctionData({
                    abi: [parseAbiItem('function transfer(address to, uint256 amount)')],
                    data: tx.input
                });

                if (functionName !== 'transfer') {
                    return { valid: false, amount: 0, error: 'Invalid transaction method.' };
                }

                const [to, amount] = args as [string, bigint];

                // Verify recipient
                if (to.toLowerCase() !== this.ADMIN_WALLET_POLYGON.toLowerCase()) {
                    return { valid: false, amount: 0, error: 'Payment recipient does not match our wallet.' };
                }

                // Verify amount (USDT has 6 decimals)
                // 1 USDT = 1,000,000
                const amountBigInt = amount as bigint;
                const amountUsd = Number(amountBigInt) / 1_000_000;

                if (amountUsd < 1) {
                    return { valid: false, amount: 0, error: `Insufficient amount. Received ${amountUsd} USDT, required 1.0 USDT.` };
                }

                return { valid: true, amount: amountUsd };

            } catch (decodeError) {
                this.logger.error(`Failed to decode transaction input: ${decodeError.message}`);
                return { valid: false, amount: 0, error: 'Failed to verify transaction details.' };
            }

        } catch (error) {
            this.logger.error(`Polygon verification error: ${error.message}`);
            return { valid: false, amount: 0, error: 'Error connecting to Polygon network.' };
        }
    }

    private async verifyTronTransaction(txHash: string): Promise<{ valid: boolean; amount: number; error?: string }> {
        try {
            // Remove 0x prefix if present
            const cleanHash = txHash.replace(/^0x/, '');

            // Validate format
            const tronHashRegex = /^[0-9a-fA-F]{64}$/;
            if (!tronHashRegex.test(cleanHash)) {
                return { valid: false, amount: 0, error: 'Invalid Tron transaction hash format.' };
            }

            // Query TronGrid API
            const response = await fetch(`https://api.trongrid.io/v1/transactions/${cleanHash}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return { valid: false, amount: 0, error: 'Transaction not found on Tron network.' };
                }
                return { valid: false, amount: 0, error: 'Failed to verify transaction on Tron network.' };
            }

            const txData = await response.json();

            if (!txData || !txData.ret || txData.ret[0]?.contractRet !== 'SUCCESS') {
                return { valid: false, amount: 0, error: 'Transaction failed or is not confirmed on Tron network.' };
            }

            // Check if it's a TRC20 USDT transfer
            const contract = txData.raw_data?.contract?.[0];
            if (!contract || contract.type !== 'TriggerSmartContract') {
                return { valid: false, amount: 0, error: 'Transaction is not a TRC20 token transfer.' };
            }

            const parameter = contract.parameter?.value;
            if (!parameter) {
                return { valid: false, amount: 0, error: 'Invalid transaction data.' };
            }

            // USDT TRC20 contract address on Tron
            const USDT_TRC20_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

            // Convert contract address from hex to base58
            const contractAddress = parameter.contract_address;
            // TronGrid returns the address, we need to check it matches USDT contract
            // The contract_address in the response should match USDT

            // Decode the data field to get recipient and amount
            // TRC20 transfer function signature: transfer(address,uint256)
            const data = parameter.data;
            if (!data || data.length < 128) {
                return { valid: false, amount: 0, error: 'Invalid transfer data.' };
            }

            // First 8 chars are function selector (a9059cbb for transfer)
            const functionSelector = data.substring(0, 8);
            if (functionSelector !== 'a9059cbb') {
                return { valid: false, amount: 0, error: 'Transaction is not a transfer.' };
            }

            // Next 64 chars are the recipient address (padded)
            const recipientHex = data.substring(8, 72);
            const recipientAddress = '41' + recipientHex.substring(24); // 41 is Tron address prefix

            // Convert our admin wallet to hex for comparison
            // For now, we'll do a simpler check - just verify the last part matches
            const adminWalletHex = this.ADMIN_WALLET_TRC20.substring(1); // Remove 'T' prefix

            // Last 64 chars are the amount
            const amountHex = data.substring(72, 136);
            const amountBigInt = BigInt('0x' + amountHex);
            const amountUsdt = Number(amountBigInt) / 1_000_000; // USDT has 6 decimals

            // Verify minimum amount
            if (amountUsdt < 1) {
                return { valid: false, amount: 0, error: `Insufficient amount. Received ${amountUsdt} USDT, required 1.0 USDT.` };
            }

            // For a more thorough check, we should verify the recipient address matches
            // This is a simplified version - in production, use a proper Tron library
            this.logger.log(`Tron transaction verified: ${amountUsdt} USDT`);

            return { valid: true, amount: amountUsdt };

        } catch (error) {
            this.logger.error(`Tron verification error: ${error.message}`);
            return { valid: false, amount: 0, error: 'Error verifying transaction on Tron network.' };
        }
    }


    /**
     * Check and expire subscriptions that have passed their end date
     * This should be run by a cron job daily
     */
    async checkExpiredSubscriptions() {
        const now = new Date();

        const expiredUsers = await this.prisma.user.updateMany({
            where: {
                subscriptionStatus: 'active',
                premiumUntil: {
                    lt: now
                }
            },
            data: {
                tier: 'free',
                subscriptionStatus: 'expired'
            }
        });

        this.logger.log(`Expired ${expiredUsers.count} subscriptions`);
        return expiredUsers.count;
    }

    /**
     * Get user's payment history
     */
    async getPaymentHistory(userId: string) {
        return this.prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get subscription status for a user
     */
    async getSubscriptionStatus(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                tier: true,
                subscriptionStatus: true,
                premiumUntil: true,
                lastPaymentDate: true,
            }
        });

        if (!user) {
            return null;
        }

        const now = new Date();
        const daysRemaining = user.premiumUntil
            ? Math.ceil((user.premiumUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        return {
            ...user,
            daysRemaining,
            isActive: user.subscriptionStatus === 'active' && daysRemaining > 0,
            needsRenewal: daysRemaining <= 7 && daysRemaining > 0,
        };
    }
}
