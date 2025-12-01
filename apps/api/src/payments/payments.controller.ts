import { Controller, Post, Get, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('verify')
    async verifyPayment(@Request() req: any, @Body() body: VerifyPaymentDto) {
        const result = await this.paymentsService.verifyPayment(req.user.id, body.txHash, body.network);
        if (!result.success) {
            throw new BadRequestException(result.message);
        }
        return result;
    }

    @Get('subscription-status')
    getSubscriptionStatus(@Request() req: any) {
        return this.paymentsService.getSubscriptionStatus(req.user.id);
    }

    @Get('history')
    getPaymentHistory(@Request() req: any) {
        return this.paymentsService.getPaymentHistory(req.user.id);
    }
}
