package org.lfenergy.operatorfabric.aop.process;

public enum AopTraceType {

    ACK("Acknowledgment");

    private String action;

    AopTraceType(String action) {
        this.action =action;
    }

    // getter method
    public String getAction()
    {
        return this.action;
    }
}
