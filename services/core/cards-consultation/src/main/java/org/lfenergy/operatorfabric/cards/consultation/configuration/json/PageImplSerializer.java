
package org.lfenergy.operatorfabric.cards.consultation.configuration.json;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import java.io.IOException;

/**
 * Custom serializer to serialize {@link PageImpl}
 *
 * @author Alexandra Guironnet
 */
public class PageImplSerializer extends StdSerializer<Page> {

    protected PageImplSerializer(Class<Page> t) {
        super(t);
    }

    public PageImplSerializer() {
        this(null);
    }

    @Override
    public void serialize(Page page, JsonGenerator gen, SerializerProvider provider) throws IOException {
        gen.writeStartObject();
        gen.writeObjectField("content", page.getContent());
        gen.writeBooleanField("first", page.isFirst());
        gen.writeBooleanField("last", page.isLast());
        gen.writeNumberField("totalPages", page.getTotalPages());
        gen.writeNumberField("totalElements", page.getTotalElements());
        gen.writeNumberField("numberOfElements", page.getNumberOfElements());
        gen.writeNumberField("size", page.getSize());
        gen.writeNumberField("number", page.getNumber());
        gen.writeEndObject();
    }

    @Override
    public Class<Page> handledType() {
        return Page.class;
    }
}
