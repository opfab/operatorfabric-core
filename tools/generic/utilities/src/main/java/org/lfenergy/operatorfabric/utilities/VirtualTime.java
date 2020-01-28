
package org.lfenergy.operatorfabric.utilities;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Allows to simulate a clock.
 * This class belongs to the utilities package because it's meant to be usable on its own if needed (as a library).
 */
public class VirtualTime {
    /**
     * Interface to define classes listening for the modifications of the time flow.
     */
    public interface TimeWarpListener {
        /**
         * Method called when a modification of the time flow occurs
         */
        void timeWarpOccurred();
    }

    private static VirtualTime singleton;
    private Instant referenceSystemTime;
    private Instant startVirtualTime;
    private float speed;
    private List<Runnable> initialisationListeners;
    private Set<TimeWarpListener> timeWarpListenerSet = new HashSet<>();

    /**
     * Constructor.
     */
    private VirtualTime() {
        speed = 1.0f;
        initialisationListeners = new ArrayList<>();
    }

    /**
     * Generates or retrieve singleton instance
     * @return singleton instance
     */
    public static VirtualTime getInstance() {
        if (singleton == null) {
            singleton = new VirtualTime();
        }
        return singleton;
    }

    public Instant getReferenceSystemTime() {
        return referenceSystemTime;
    }

    public void setReferenceSystemTime(Instant referenceSystemTime) {
        this.referenceSystemTime = referenceSystemTime;
    }

    public Instant getStartVirtualTime() {
        return startVirtualTime;
    }

    public void setStartVirtualTime(Instant startVirtualTime) {
        this.startVirtualTime = startVirtualTime;
    }

    public float getSpeed() {
        return speed;
    }

    public void setSpeed(float speed) {
        if (Float.compare(speed, 0) != 0) {
            this.speed = speed;
        }
    }

    /**
     * Computes the virtual current time as an {@link Instant}
     * @return now
     */
    public Instant computeNow() {
        if (referenceSystemTime == null)
            return Instant.now();
        long delta = referenceSystemTime.until(Instant.now(), ChronoUnit.MILLIS);
        double coefDelta = delta * speed;
        return startVirtualTime.plus(Math.round(coefDelta), ChronoUnit.MILLIS);
    }

    /**
     * resets internal configuration
     */
    public void reset() {
        referenceSystemTime = null;
        speed = 1;
        startVirtualTime = null;
    }


    /**
     * Return the "real" instant corresponding to the given virtual instant
     * @param instant an instant to convert
     * @return the system instant corresponding to the given instant in the virtual referential
     */
    public Instant convertToSystemInstant(Instant instant) {
        if (referenceSystemTime == null) {
            return instant;
        } else if (Float.compare(speed, 0) == 0) {
            // should never happen, but it secures this method...
            return instant;
        }

        double delta = startVirtualTime.until(instant, ChronoUnit.MILLIS);
        double coefDelta = delta / speed;
        return referenceSystemTime.plus(Math.round(coefDelta), ChronoUnit.MILLIS);
    }


    /**
     * Return the "virtual" instant corresponding to the given system instant
     * @param systemInstant an instant to convert
     * @return the virtual instant corresponding to the given instant in the system referential
     */
    public Instant convertToVirtualInstant(Instant systemInstant) {
        if (referenceSystemTime == null)
            return systemInstant;
        long delta = referenceSystemTime.until(systemInstant, ChronoUnit.MILLIS);
        double coefDelta = delta * speed;
        return startVirtualTime.plus(Math.round(coefDelta), ChronoUnit.MILLIS);
    }


    /**
     * Return the number of milliseconds in the system time referential
     * corresponding to the given number of milliseconds in the virtual time referential.
     * @param nbMillis a number of milliseconds in the virtual time referential
     * @return its correspondence in the "real" time referential (i.e. the system one)
     */
    public long convertToSystemMillis(long nbMillis) {
        return Math.round((double) nbMillis / (double) speed);
    }

    /**
     * Current thread waits for a given duration in virtual time
     * @param durationMillis sleep duration
     * @throws InterruptedException see {@link Thread#sleep(long)} exception
     */
    public void sleep(long durationMillis) throws InterruptedException {
        Thread.sleep(convertToSystemMillis(durationMillis));
    }

    /**
     * Notifies that the time has been initialised.
     */
    public void notifyInitialisation() {
        initialisationListeners.forEach(Runnable::run);
    }

    /**
     * Listeners will be notified when the time is available.
     * @param runnable thing to run after init
     */
    public void addInitialisationListener(Runnable runnable) {
        initialisationListeners.add(runnable);
    }

    /**
     * Add a listener for modification of the time flow
     * @param listener notified after update
     */
    public void addTimeWarpListener(TimeWarpListener listener) {
        timeWarpListenerSet.add(listener);
    }

    /**
     * Notifies that a time warp occured.
     */
    public void notifyTimeWarp() {
        timeWarpListenerSet.forEach(TimeWarpListener::timeWarpOccurred);
    }
}
