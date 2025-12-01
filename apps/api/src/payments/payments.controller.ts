import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('verify')
    verifyPayment(@Request() req: any, @Body() body: VerifyPaymentDto) {
        return this.paymentsService.verifyPayment(req.user.id, body.txHash, body.network);
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
