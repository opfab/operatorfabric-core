package org.lfenergy.operatorfabric.users.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Group Model, documented at {@link Group}
 *
 * {@inheritDoc}
 *
 * @author David Binder
 */
@Document(collection = "group")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GroupData implements Group {
    @Id
    private String name;
    private String description;
}
