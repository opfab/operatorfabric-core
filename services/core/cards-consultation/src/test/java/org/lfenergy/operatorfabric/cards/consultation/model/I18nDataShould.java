package org.lfenergy.operatorfabric.cards.consultation.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * <p></p>
 * Created on 25/10/18
 *
 * @author davibind
 */
class I18nDataShould {
    @Test
    public void exposeData(){
        I18nData i18n = I18nData.builder().key("key").build();
        assertThat(i18n).hasFieldOrPropertyWithValue("key", "key");
    }

}