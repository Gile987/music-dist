import { Royalty } from './royalty.interface';

export interface GroupedRoyalty {
  releaseId: number;
  releaseTitle: string;
  royalties: Royalty[];
  totalRoyalty: number;
}