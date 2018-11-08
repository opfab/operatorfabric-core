package org.lfenergy.operatorfabric.utilities;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;


/**
 * Utility class for date manipulation (relying on {@link java.time} package
 */
public class DateTimeUtil {

    public static final DateTimeFormatter reseauFormat = DateTimeFormatter.ofPattern("yyyyMMdd-HHmm");
    public static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");

    public static final DateTimeFormatter OUT_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter OUT_TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss");
    public static final DateTimeFormatter OUT_TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    public static final DateTimeFormatter OUT_DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    public static final DateTimeFormatter OUT_DATE_TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    public static final DateTimeFormatter OUT_FILE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss-SSS");

    /**
     * Private constructor to avoid instantiation as it is a utility class
     */
    private DateTimeUtil() {
    }


    /**
     * Compare 2 LocalDate (possibly null).
     *
     * @param d1
     * @param d2
     * @return
     */
    public static int compareDay(LocalDate d1, LocalDate d2) {
        Integer comp = compareObject(d1, d2);

        return comp != null ? comp : d1.compareTo(d2);
    }


    private static Integer compareObject(Object o1, Object o2){
        if (o1 == o2) {
            return 0;
        } else if (o1 == null) {
            return -1;
        } else if (o2 == null)
            return 1;
        return null;
    }


    /**
     * Is it the same day? The LocalDate can be null.
     *
     * @param d1
     * @param d2
     * @return
     */

    public static boolean isSameDay(LocalDate d1, LocalDate d2) {
        return compareDay(d1, d2) == 0;
    }


    /**
     * Compare 2 LocalTime (possibly null) considering only hours and minutes.
     *
     * @param lt1
     * @param lt2
     * @return
     */
    public static int compareTimeHM(LocalTime lt1, LocalTime lt2) {
        Integer comp = compareObject(lt1, lt2);

        return comp != null ? comp : lt1.truncatedTo(ChronoUnit.MINUTES).compareTo(lt2.truncatedTo(ChronoUnit.MINUTES));
    }


    /**
     * Is it the same hour (HH:mm)? The LocalTime can be null.
     *
     * @param lt1
     * @param lt2
     * @return
     */
    public static boolean isSameTimeHM(LocalTime lt1, LocalTime lt2) {
        return compareTimeHM(lt1, lt2) == 0;
    }



    /**
     * Compare 2 LocalDateTime (possibly null) considering only date, hours and minutes.
     *
     * @param ldt1
     * @param ldt2
     * @return
     */
    public static int compareDateTimeHM(LocalDateTime ldt1, LocalDateTime ldt2){
        Integer comp = compareObject(ldt1, ldt2);
        if(comp != null)
            return comp;

        int compDay = compareDay(ldt1.toLocalDate(), ldt2.toLocalDate());
        if(compDay != 0)
            return compDay;

        return compareTimeHM(ldt1.toLocalTime(), ldt2.toLocalTime());
    }



    /**
     * Return the min time between <code>lt1</code> and <code>lt2</code> (hours and minutes only considered).
     *
     * @param lt1
     *         a {@link LocalTime}
     * @param lt2
     *         an other {@link LocalTime}
     * @return the min time between <code>lt1</code> and <code>lt2</code> or null if one of the parameters is null.
     */
    public static LocalTime min(LocalTime lt1, LocalTime lt2) {
        if ((lt1 == null) || (lt2 == null)) {
            return null;
        }

        if (DateTimeUtil.compareTimeHM(lt1, lt2) <= 0) {
            return lt1;
        } else {
            return lt2;
        }
    }


    /**
     * Return the max time between <code>lt1</code> and <code>lt2</code> (hours and minutes only considered).
     *
     * @param lt1
     *         a {@link LocalTime}
     * @param lt2
     *         an other {@link LocalTime}
     * @return the max time between <code>lt1</code> and <code>lt2</code> or null if one of the parameters is null.
     */
    public static LocalTime max(LocalTime lt1, LocalTime lt2) {
        if ((lt1 == null) || (lt2 == null)) {
            return null;
        }

        if (DateTimeUtil.compareTimeHM(lt1, lt2) >= 0) {
            return lt1;
        } else {
            return lt2;
        }
    }


    /**
     * Return the min date between <code>ld1</code> and <code>ld2</code>.
     *
     * @param ld1 a {@link LocalDate}
     * @param ld2 an other {@link LocalDate}
     * @return the min time between <code>ld1</code> and <code>ld2</code> or null if one of the parameters is null.
     */
    public static LocalDate min(LocalDate ld1, LocalDate ld2) {
        if ((ld1 == null) || (ld2 == null)) {
            return null;
        }

        if (DateTimeUtil.compareDay(ld1, ld2) <= 0) {
            return ld1;
        } else {
            return ld2;
        }
    }

    public static LocalDateTime min(LocalDateTime date1, LocalDateTime date2){
        if(date1.isBefore(date2))
            return date1;
        return date2;
    }
    public static LocalDateTime max(LocalDateTime date1, LocalDateTime date2){
        if(date1.isAfter(date2))
            return date1;
        return date2;
    }

    /**
     * Return the max date between <code>ld1</code> and <code>ld2</code>.
     *
     * @param ld1 a {@link LocalDate}
     * @param ld2 an other {@link LocalDate}
     * @return the max time between <code>ld1</code> and <code>ld2</code> or null if one of the parameters is null.
     */
    public static LocalDate max(LocalDate ld1, LocalDate ld2) {
        if ((ld1 == null) || (ld2 == null)) {
            return null;
        }

        if (DateTimeUtil.compareDay(ld1, ld2) >= 0) {
            return ld1;
        } else {
            return ld2;
        }
    }


    /**
     * Check whether the day of dateToTest is inside the interval defined by |startIntervalDate ; endIntervalDate|
     * (the sense of the brackets depends of the booleans).
     *
     * @param dateToTest
     *         the date to test
     * @param startIntervalDate
     *         the lower boundary of the date interval
     * @param startIncluded
     *         is the lower boundary included?
     * @param endIntervalDate
     *         the upper boundary of the date interval
     * @param endIncluded
     *         is the upper boundary included?
     * @return <code>true</code> if dateToTest is inside |startIntervalDate ; endIntervalDate| (the sense of the brackets
     * depends of the booleans) ; else <code>false</code>.
     */
    public static boolean isInsideDateInterval(LocalDateTime dateToTest,
                                               LocalDate startIntervalDate, boolean startIncluded,
                                               LocalDate endIntervalDate, boolean endIncluded) {
        if (dateToTest == null) {
            return false;
        }
        LocalDate ld = dateToTest.toLocalDate();
        return isInsideDateInterval(ld, startIntervalDate, startIncluded, endIntervalDate, endIncluded);
    }


    /**
     * Check whether the day of dateToTest is inside the interval defined by |startIntervalDate ; endIntervalDate|
     * (the sense of the brackets depends of the booleans).
     *
     * @param dateToTest
     *         the date to test
     * @param startIntervalDate
     *         the lower boundary of the date interval
     * @param startIncluded
     *         is the lower boundary included?
     * @param endIntervalDate
     *         the upper boundary of the date interval
     * @param endIncluded
     *         is the upper boundary included?
     * @return <code>true</code> if dateToTest is inside |startIntervalDate ; endIntervalDate| (the sense of the brackets
     * depends of the booleans) ; else <code>false</code>.
     */
    public static boolean isInsideDateInterval(LocalDate dateToTest,
                                               LocalDate startIntervalDate, boolean startIncluded,
                                               LocalDate endIntervalDate, boolean endIncluded) {
        if (dateToTest == null) {
            return false;
        }

        boolean testLower;
        if(startIncluded){
            testLower = compareDay(dateToTest, startIntervalDate) >= 0;
        }
        else{
            testLower = compareDay(dateToTest, startIntervalDate) > 0;
        }

        boolean testUpper;
        if(endIncluded){
            testUpper = compareDay(dateToTest, endIntervalDate) <= 0;
        }
        else{
            testUpper = compareDay(dateToTest, endIntervalDate) < 0;
        }

        return testLower && testUpper;
    }


    /**
     * Check whether the hour of hourToTest is inside the interval defined by [startIntervalHour ; endIntervalHour]. In
     * this test, only the hours and minutes are considered (seconds, milliseconds, ... are ignored).
     *
     * @param timeToTest
     *         the hour to test
     * @param startIntervalHour
     *         the lower boundary of the hour interval
     * @param endIntervalHour
     *         the upper boundary of the hour interval
     * @return <code>true</code> if the time (Hours Minutes) of hourToTest is inside [startIntervalHour ;
     * endIntervalHour] ; else <code>false</code>.
     */
    public static boolean isInsideHourInterval(LocalDateTime timeToTest, LocalTime startIntervalHour, LocalTime
            endIntervalHour) {
        if (timeToTest == null) {
            return false;
        }
        LocalTime lt = timeToTest.toLocalTime();
        return isInsideHourInterval(lt, startIntervalHour, endIntervalHour);
    }


    /**
     * Check whether timeToTest is inside the interval defined by [startIntervalHour ; endIntervalHour]. In this test,
     * only the hours and minutes are considered (seconds, milliseconds, ... are ignored).
     *
     * @param timeToTest
     *         the hour to test
     * @param startIntervalHour
     *         the lower boundary of the hour interval
     * @param endIntervalHour
     *         the upper boundary of the hour interval
     * @return <code>true</code> if timeToTest is inside [startIntervalHour ; endIntervalHour] ; else
     * <code>false</code>.
     */
    public static boolean isInsideHourInterval(LocalTime timeToTest, LocalTime startIntervalHour, LocalTime
            endIntervalHour) {
        if (timeToTest == null) {
            return false;
        }
        return (compareTimeHM(timeToTest, startIntervalHour) >= 0) && (compareTimeHM(timeToTest, endIntervalHour) <= 0);
    }


    /**
     * Convert a java.time.LocalDateTime in java.util.Date
     *
     * @param ldt
     *         a LocalDateTime
     * @return its corresponding Date
     */
    public static Date toDate(LocalDateTime ldt) {
        Instant instant = ldt.atZone(ZoneId.systemDefault()).toInstant();
        return Date.from(instant);
    }


    /**
     * Convert a java.time.LocalDate in java.util.Date
     *
     * @param ld
     *         a LocalDate
     * @return its corresponding Date (at 00:00:00.000)
     */
    public static Date toDate(LocalDate ld) {
        Instant instant = ld.atStartOfDay().atZone(ZoneId.systemDefault()).toInstant();
        return Date.from(instant);
    }


    public static LocalDateTime toLocalDateTime(Long epochMilli) {
        return LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMilli), ZoneId.systemDefault());
    }

    public static Long toLong(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return toInstant(localDateTime).toEpochMilli();
    }


    /**
     * converts instant to local date time of server
     * (in the default time-zone)
     *
     * @param time
     * @return
     */
    public static LocalDateTime toLocalDateTime(Instant time) {
        return LocalDateTime.ofInstant(time, ZoneId.systemDefault());
    }

    /**
     * Get the {@code LocalDate} part of this {@code Instant} (in the default time-zone)
     *
     * @param time the Instant
     * @return the corresponding LocalDate
     */
    public static LocalDate toLocalDate(Instant time) {
        return toLocalDateTime(time).toLocalDate();
    }

    /**
     * Get the {@code LocalTime} part of this {@code Instant} (in the default time-zone)
     *
     * @param time the Instant
     * @return the corresponding LocalTime
     */
    public static LocalTime toLocalTime(Instant time) {
        return toLocalDateTime(time).toLocalTime();
    }


    /**
     * Get the LocalDateTime corresponding to the given date (in the default time-zone)
     * @param date  the date
     * @return the corresponding LocalDateTime
     */
    public static LocalDateTime toLocalDateTime(Date date) {
        return toLocalDateTime(date.getTime());
    }


    /**
     * Get the LocalDate part of the given date (in the default time-zone)
     * @param date  the date
     * @return the corresponding LocalDate
     */
    public static LocalDate toLocalDate(Date date){
        return toLocalDateTime(date).toLocalDate();
    }


    /**
     * Get the LocalTime part of the given date (in the default time-zone)
     * @param date  the date
     * @return the corresponding LocalTime
     */
    public static LocalTime toLocalTime(Date date){
        return toLocalDateTime(date).toLocalTime();
    }


    /**
     * converts local date time to instant
     *
     * @param ldt
     * @return
     */
    public static Instant toInstant(LocalDateTime ldt) {
        return ldt.atZone(ZoneId.systemDefault()).toInstant();
    }

    /**
     * converts local date time to instant
     *
     * @param epochMillis
     * @return
     */
    public static Instant toInstant(Long epochMillis) {
        return Instant.ofEpochMilli(epochMillis);
    }
    
    public static LocalDateTime parseReseauDate(String reseauDate){
        return LocalDateTime.parse(reseauDate, reseauFormat);
    }
}
