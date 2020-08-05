package org.lfenergy.operatorfabric.aop.process;

public abstract class AbstractActionAspect<T> {

    protected String action;
    abstract void trace(T trace);


}
