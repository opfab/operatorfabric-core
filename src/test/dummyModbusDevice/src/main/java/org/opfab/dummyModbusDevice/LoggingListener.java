package org.opfab.dummyModbusDevice;

import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@NoArgsConstructor
public class LoggingListener implements ModbusEventListener {

    @Override
    public void onWriteToSingleCoil(int address, boolean value) {
        log.info("onWriteToSingleCoil: address " + address + ", value " + value);
    }

    @Override
    public void onWriteToMultipleCoils(int address, int quantity, boolean[] values) {
        log.info("onWriteToMultipleCoils: address " + address + ", quantity " + quantity);
    }

    @Override
    public void onWriteToSingleHoldingRegister(int address, int value) {
        log.info("onWriteToSingleHoldingRegister: address " + address + ", value " + value);
    }

    @Override
    public void onWriteToMultipleHoldingRegisters(int address, int quantity, int[] values) {
        log.info("onWriteToMultipleHoldingRegisters: address " + address + ", quantity " + quantity);
    }
}
