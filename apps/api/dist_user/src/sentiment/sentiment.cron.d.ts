import { SentimentService } from './sentiment.service';
export declare class SentimentCronService {
    private sentimentService;
    constructor(sentimentService: SentimentService);
    analyzeSentiment(): Promise<void>;
}
