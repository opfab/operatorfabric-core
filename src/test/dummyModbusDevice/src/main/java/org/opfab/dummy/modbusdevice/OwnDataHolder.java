/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.dummy.modbusdevice;

import com.intelligt.modbus.jlibmodbus.data.DataHolder;
import com.intelligt.modbus.jlibmodbus.exception.IllegalDataAddressException;
import com.intelligt.modbus.jlibmodbus.exception.IllegalDataValueException;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class OwnDataHolder extends DataHolder {

    final List<ModbusEventListener> modbusEventListenerList = new ArrayList<>();

    public OwnDataHolder() {
        super();
    }

    public void addEventListener(ModbusEventListener listener) {
        modbusEventListenerList.add(listener);
    }

    public boolean removeEventListener(ModbusEventListener listener) {
        return modbusEventListenerList.remove(listener);
    }

    @Override
    public void writeHoldingRegister(int offset, int value) {
        for (ModbusEventListener l : modbusEventListenerList) {
            l.onWriteToSingleHoldingRegister(offset, value);
        }
        try {
            super.writeHoldingRegister(offset, value);
        } catch (IllegalDataAddressException e) {
            log.error("Attempting write on register with illegal address {}",offset,e);
        } catch (IllegalDataValueException e) {
            log.error("Attempting write on register with illegal value {}",value,e);
        }
    }

    @Override
    public void writeHoldingRegisterRange(int offset, int[] range) {
        // Not needed for our tests
    }

    @Override
    public void writeCoil(int offset, boolean value) {
        // Not needed for our tests
    }

    @Override
    public void writeCoilRange(int offset, boolean[] range) {
        // Not needed for our tests
    }
}