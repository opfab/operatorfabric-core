/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.dummyModbusDevice;

import com.intelligt.modbus.jlibmodbus.data.DataHolder;
import com.intelligt.modbus.jlibmodbus.data.ModbusHoldingRegisters;
import com.intelligt.modbus.jlibmodbus.exception.IllegalDataAddressException;
import com.intelligt.modbus.jlibmodbus.exception.IllegalDataValueException;

import java.util.ArrayList;
import java.util.List;

public class OwnDataHolder extends DataHolder {

    final List<ModbusEventListener> modbusEventListenerList = new ArrayList<>();

    public OwnDataHolder() {

        super();

        ModbusHoldingRegisters holdingRegisters = new ModbusHoldingRegisters(120); //TODO How many to replicate real CDS?
        setHoldingRegisters(holdingRegisters);

    }

    public void addEventListener(ModbusEventListener listener) {
        modbusEventListenerList.add(listener);
    }

    public boolean removeEventListener(ModbusEventListener listener) {
        return modbusEventListenerList.remove(listener);
    }

    @Override
    public void writeHoldingRegister(int offset, int value) throws IllegalDataAddressException, IllegalDataValueException {
        for (ModbusEventListener l : modbusEventListenerList) {
            l.onWriteToSingleHoldingRegister(offset, value);
        }
        super.writeHoldingRegister(offset, value);
    }

    @Override
    public void writeHoldingRegisterRange(int offset, int[] range) throws IllegalDataAddressException, IllegalDataValueException {
        for (ModbusEventListener l : modbusEventListenerList) {
            l.onWriteToMultipleHoldingRegisters(offset, range.length, range);
        }
        super.writeHoldingRegisterRange(offset, range);
    }

    @Override
    public void writeCoil(int offset, boolean value) throws IllegalDataAddressException, IllegalDataValueException {
        for (ModbusEventListener l : modbusEventListenerList) {
            l.onWriteToSingleCoil(offset, value);
        }
        super.writeCoil(offset, value);
    }

    @Override
    public void writeCoilRange(int offset, boolean[] range) throws IllegalDataAddressException, IllegalDataValueException {
        for (ModbusEventListener l : modbusEventListenerList) {
            l.onWriteToMultipleCoils(offset, range.length, range);
        }
        super.writeCoilRange(offset, range);
    }
}