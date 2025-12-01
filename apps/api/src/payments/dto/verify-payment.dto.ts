import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class VerifyPaymentDto {
    @IsString()
    @IsNotEmpty({ message: 'Transaction hash is required' })
    @MinLength(20, { message: 'Transaction hash must be at least 20 characters' })
    @Matches(/^[a-fA-F0-9]+$/, { message: 'Transaction hash must contain only hexadecimal characters' })
    txHash: string;

    @IsString()
    @IsNotEmpty({ message: 'Network is required' })
    network: string;
}
