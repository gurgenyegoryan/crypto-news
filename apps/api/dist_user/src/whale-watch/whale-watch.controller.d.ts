import { WhaleWatchService } from './whale-watch.service';
export declare class WhaleWatchController {
    private readonly whaleWatchService;
    constructor(whaleWatchService: WhaleWatchService);
    getTransactions(): Promise<import("./whale-watch.service").WhaleTransaction[]>;
}
