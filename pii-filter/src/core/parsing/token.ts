import { Associations, ClassificationScore, Confidences } from '../interfaces/parsing/classification';
import { POSInfo } from '../interfaces/parsing/tagging';
import { Token } from '../interfaces/parsing/tokens';
import { CoreAssociations } from './classification';

/**
 * @inheritdoc Token
 * @private
 */
export class CoreToken implements Token
{
    /** @inheritdoc */
    public previous:        Token = null;
    /** @inheritdoc */
    public next:            Token = null;
    /** @inheritdoc */
    public confidence_dictionary:       ClassificationScore;
    /** @inheritdoc */
    public confidences_associative:     Associations =          new CoreAssociations();
    /** @inheritdoc */
    public confidences_classification:  Array<Confidences> =    new Array<Confidences>();
    /**
     * Creates a new CoreToken.
     * @param symbol the original string symbol
     * @param stem the stemmed symbol
     * @param tag the POSInfo tag
     * @param index the token index
     * @param c_index_start the start index in characters
     * @param c_index_end the end index in characters
     */
    constructor(
        public symbol:          string,
        public stem:            string,
        public tag:             POSInfo,
        public index:           number,
        public c_index_start:   number,
        public c_index_end:     number
    ) {}
};