package org.lfenergy.operatorfabric.users.configuration.groups;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MultipleValuesClaim {

	public String path;
	public String separator;
}
