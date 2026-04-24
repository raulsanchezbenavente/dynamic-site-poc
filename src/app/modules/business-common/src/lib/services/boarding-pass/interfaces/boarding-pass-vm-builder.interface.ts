import { BoardingPassVMBuilderData } from '..';
import { BoardingPassVM } from '../../../components/boarding-pass/boarding-pass-preview';

export interface IBoardingPassVMBuilder {
  getBoardingPassVM(data: BoardingPassVMBuilderData): BoardingPassVM;
}
