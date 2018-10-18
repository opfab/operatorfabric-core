/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.model;

/**
 * Counter
 */
public class Counter {

    long value = 0;

    public long increment(){return ++value;}
    public long increment(long addition){value+=addition;return value;}
    public long get(){return value;}
}