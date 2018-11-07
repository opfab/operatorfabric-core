/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.lfenergy.operatorfabric.cards.model.CardOperationTypeEnum;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * <p>Please use builder to instantiate</p>
 *
 * <p>Card Operation Model, documented at {@link CardOperation}</p>
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardOperationData implements CardOperation {

    private Long number;
    private Long publicationDate;
    private CardOperationTypeEnum type;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<String> cardIds;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private List<? extends LightCard> cards;

    public static CardOperationDataBuilder builder() {
        return new CardOperationDataBuilder();
    }

    public static class CardOperationDataBuilder {
        private Long number;
        private Long publicationDate;
        private CardOperationTypeEnum type;
        private ArrayList<String> cardIds;
        private ArrayList<LightCard> cards;

        CardOperationDataBuilder() {
        }

        public CardOperationDataBuilder number(Long number) {
            this.number = number;
            return this;
        }

        public CardOperationDataBuilder publicationDate(Long publicationDate) {
            this.publicationDate = publicationDate;
            return this;
        }

        public CardOperationDataBuilder type(CardOperationTypeEnum type) {
            this.type = type;
            return this;
        }

        public CardOperationDataBuilder cardId(String cardId) {
            if (this.cardIds == null) this.cardIds = new ArrayList<String>();
            this.cardIds.add(cardId);
            return this;
        }

        public CardOperationDataBuilder cardIds(Collection<? extends String> cardIds) {
            if (this.cardIds == null) this.cardIds = new ArrayList<String>();
            this.cardIds.addAll(cardIds);
            return this;
        }

        public CardOperationDataBuilder clearCardIds() {
            if (this.cardIds != null)
                this.cardIds.clear();

            return this;
        }

        public CardOperationDataBuilder card(LightCard card) {
            if (this.cards == null) this.cards = new ArrayList<LightCard>();
            this.cards.add(card);
            return this;
        }

        public CardOperationDataBuilder cards(Collection<? extends LightCard> cards) {
            if (this.cards == null) this.cards = new ArrayList<LightCard>();
            this.cards.addAll(cards);
            return this;
        }

        public CardOperationDataBuilder clearCards() {
            if (this.cards != null)
                this.cards.clear();

            return this;
        }

        public CardOperationData build() {
            List<String> cardIds;
            switch (this.cardIds == null ? 0 : this.cardIds.size()) {
                case 0:
                    cardIds = java.util.Collections.emptyList();
                    break;
                case 1:
                    cardIds = java.util.Collections.singletonList(this.cardIds.get(0));
                    break;
                default:
                    cardIds = java.util.Collections.unmodifiableList(new ArrayList<String>(this.cardIds));
            }
            List<LightCard> cards;
            switch (this.cards == null ? 0 : this.cards.size()) {
                case 0:
                    cards = java.util.Collections.emptyList();
                    break;
                case 1:
                    cards = java.util.Collections.singletonList(this.cards.get(0));
                    break;
                default:
                    cards = java.util.Collections.unmodifiableList(new ArrayList<LightCard>(this.cards));
            }

            return new CardOperationData(number, publicationDate, type, cardIds, cards);
        }

        public String toString() {
            return "CardOperationData.CardOperationDataBuilder(number=" + this.number + ", publicationDate=" + this.publicationDate + ", type=" + this.type + ", cardIds=" + this.cardIds + ", cards=" + this.cards + ")";
        }
    }
}
