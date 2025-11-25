import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post('verify')
    verifyPayment(@Request() req: any, @Body() body: { txHash: string }) {
        return this.paymentsService.verifyPayment(req.user.id, body.txHash);
    }
}
