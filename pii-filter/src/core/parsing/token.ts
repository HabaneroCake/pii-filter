import { IAssociations, IClassificationScore, IConfidences } from '../interfaces/parsing/classification';
import { ITag } from '../interfaces/parsing/tagging';
import { IToken } from '../interfaces/parsing/tokens';
import { Associations } from './classification';


export class Token implements IToken
{
    public previous:        IToken = null;
    public next:            IToken = null;
    // stores passes
    public confidence_dictionary:       IClassificationScore;
    public confidences_associative:     IAssociations =          new Associations();
    public confidences_classification:  Array<IConfidences> =    new Array<IConfidences>();
    constructor(
        public symbol:      string,
        public tag:         ITag,
        public index:       number
    ) {}
};