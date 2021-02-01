import { POSInfo, PhraseGroup } from '../interfaces/parsing/tagging';

/**
 * Parts of Speech
 * @private
 */
export namespace POS
{
    /**
     * @inheritdoc POSInfo
     * @private
     */
    export class Tag implements POSInfo
    {
        /** @inheritdoc POSInfo.group */
        public group:   Tag.Group = null;
        /**
         * Creates a new POS.Tag.
         * @param tag_base the POS tag base
         * @param tag_rest other POS information
         */
        constructor(
            public tag_base: string,
            public tag_rest: Array<string>
        ) {};
    }
    /**
     * @private
     */
    export namespace Tag
    {
        /**
         * @inheritdoc PhraseGroup
         * @private
         */
        export class Group implements PhraseGroup
        {
            /**
             * Creates a new POS.Tag.Group.
             * @param well_formed the 'well-formedness' score
             * @param n_tags the number of tags which are part of this group
             */
            constructor(
                public well_formed: number = 0,
                public n_tags: number = 0
            ) {}
        };
    };

    /**
     * Converts a Brill_POS string tag to {@link POSInfo}
     * @private
     * @param tag the Brill_POS string tag
     */
    export function from_brill_pos_tag(tag: string): POSInfo
    {
        let tag_base:           string =        tag;
        let tag_rest:           Array<string> = new Array<string>();
        let left_paren_index:   number =        tag.indexOf('(');
        let right_paren_index:  number =        tag.indexOf(')', left_paren_index);
        if (left_paren_index > -1 && right_paren_index > -1)
        {
            tag_base = tag.substr(0, left_paren_index);
            tag_rest = tag.substr(left_paren_index + 1, right_paren_index - left_paren_index - 1).split(',');
        }
        return new POS.Tag(
            tag_base,
            tag_rest
        );
    }
};