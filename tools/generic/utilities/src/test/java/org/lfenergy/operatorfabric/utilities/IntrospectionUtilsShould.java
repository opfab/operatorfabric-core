package org.lfenergy.operatorfabric.utilities;

import lombok.Getter;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class IntrospectionUtilsShould {
    @Test
    public void invokeSafe() throws NoSuchMethodException {
        Method method = TestClass.class.getMethod("method");
        String failingObject = "";
        assertThat(IntrospectionUtils.invokeSafe(failingObject,method)).isNull();
        TestClass successObject = new TestClass();
        assertThat(IntrospectionUtils.invokeSafe(successObject,method)).isEqualTo(1);
        Method privateMethod = TestClass.class.getDeclaredMethod("privateMethod");
        assertThat(IntrospectionUtils.invokeSafe(successObject,privateMethod)).isNull();
        Method exceptionMethod = TestClass.class.getDeclaredMethod("exceptionMethod");
        assertThat(IntrospectionUtils.invokeSafe(successObject,exceptionMethod)).isNull();
        Method lombokGetter = TestClass.class.getDeclaredMethod("getLombokValue");
        assertThat(IntrospectionUtils.invokeSafe(successObject,lombokGetter)).isEqualTo("lombokValue");
    }

    @Test
    public void extractData(){
        TestClass object = new TestClass();
        assertThat(IntrospectionUtils.extractData(object,"value")).isEqualTo("value");
        assertThat(IntrospectionUtils.extractData(object,"noValue")).isNull();
        Map map = new HashMap();
        map.put("key","value");
        assertThat(IntrospectionUtils.extractData(map,"key")).isEqualTo("value");
        assertThat(IntrospectionUtils.extractData(map,"noKey")).isNull();
    }

    @Test
    public void extractPath(){
        TestClass successObject = new TestClass();
        assertThat(IntrospectionUtils.extractPath(successObject,"map.mapKey")).isEqualTo("mapValue");
        assertThat(IntrospectionUtils.extractPath(successObject,"value1.value2")).isEqualTo("value2");
        assertThat(IntrospectionUtils.extractPath(successObject,"lombokValue1.lombokValue2")).isEqualTo("lombokValue");
        assertThat(IntrospectionUtils.extractPath(successObject,"map.noMapKey")).isNull();
    }
}

class TestClass{

    public int method(){
        return 1;
    }

    public int exceptionMethod() throws Exception {
        throw new Exception("message");
    }

    private int privateMethod(){
        return 2;
    }

    public String getValue(){
        return "value";
    }

    public Map getMap(){
        HashMap map = new HashMap();
        map.put("mapKey","mapValue");
        return map;
    }

    public TestClass2 getValue1(){
        return new TestClass2();
    }

    @Getter
    private TestClass2 lombokValue1 = new TestClass2();

    @Getter
    private String lombokValue = "lombokValue";
}

class TestClass2{

    public String getValue2(){
        return "value2";
    }

    @Getter
    private String lombokValue2 = "lombokValue";
}
