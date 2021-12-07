package org.opfab.dummy.modbusdevice;

import com.intelligt.modbus.jlibmodbus.slave.ModbusSlave;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;
import java.util.stream.Collectors;

@Slf4j
@AllArgsConstructor
public class LoggingListener implements ModbusEventListener {

    private final ModbusSlave modbusSlave;

    @Override
    public void onWriteToSingleCoil(int address, boolean value) {
        // Not needed for our tests
    }

    @Override
    public void onWriteToMultipleCoils(int address, int quantity, boolean[] values) {
        // Not needed for our tests
    }

    @Override
    public void onWriteToSingleHoldingRegister(int address, int value) {
        log.info("onWriteToSingleHoldingRegister: register " + address + ", value " + value);
        log.debug("Current state of holding registers: "+ currentHoldingRegistersState());
    }

    @Override
    public void onWriteToMultipleHoldingRegisters(int address, int quantity, int[] values) {
        // Not needed for our tests
    }

    private String currentHoldingRegistersState() {
        return Arrays.stream(modbusSlave.getDataHolder().getHoldingRegisters().getRegisters())
                .mapToObj(String::valueOf)
                .collect(Collectors.joining(" "));
    }

}
