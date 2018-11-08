package org.lfenergy.operatorfabric.springtools.config.mongo;

import org.springframework.core.convert.converter.Converter;

import java.util.List;

public abstract class AbstractLocalMongoConfiguration {

    public abstract List<Converter> converterList();
}
