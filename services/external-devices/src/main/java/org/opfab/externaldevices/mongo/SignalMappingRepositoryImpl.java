
/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

 package org.opfab.externaldevices.mongo;


import org.opfab.externaldevices.model.SignalMapping;
import org.opfab.externaldevices.repositories.SignalMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
public class SignalMappingRepositoryImpl implements SignalMappingRepository{
    private final SignalMappingMongoRepository signalMappingMongoRepository;

    @Autowired
    public SignalMappingRepositoryImpl(SignalMappingMongoRepository signalMappingMongoRepository) {
        this.signalMappingMongoRepository = signalMappingMongoRepository;
    }

    public void insert(SignalMapping signalMapping) {
        this.signalMappingMongoRepository.insert(signalMapping);
    }

    public Optional<SignalMapping> findById(String id) {
        return this.signalMappingMongoRepository.findById(id);
    }

    public void deleteById(String id) {
        this.signalMappingMongoRepository.deleteById(id);
    }

    
    public List<SignalMapping> findAll() {
        return this.signalMappingMongoRepository.findAll();
    }

    public void deleteAll() {
       this.signalMappingMongoRepository.deleteAll();
    }

    
}

