package org.lfenergy.operatorfabric.users.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TimeLineFormatsData implements TimeLineFormats {
    private String dateInsideTooltipsWeek;
    private String dateInsideTooltipsMonth;
    private String dateOnDay;
    private String dateOnWeek;
    private String dateOnMonth;
    private String dateOnYear;
    private String titleDateInsideTooltips;
    private String titleHourInsideTooltips;
    private String dateOnDayNewYear;
    private String realTimeBarFormat;
    private String dateSimplifliedOnDayNewYear;
    private String dateSimplifliedOnDay;
    private String hoursOnly;
    private String minutesOnly;
    private String secondedsOnly;
    private String weekNumberOnly;

    public TimeLineFormatsData copy() {
        return TimeLineFormatsData.builder()
                .dateInsideTooltipsWeek(this.getDateInsideTooltipsWeek())
                .dateInsideTooltipsMonth(this.getDateInsideTooltipsMonth())
                .dateOnDay(this.getDateOnDay())
                .dateOnWeek(this.getDateOnWeek())
                .dateOnMonth(this.getDateOnMonth())
                .dateOnYear(this.getDateOnYear())
                .titleDateInsideTooltips(this.getTitleDateInsideTooltips())
                .titleHourInsideTooltips(this.getTitleHourInsideTooltips())
                .dateOnDayNewYear(this.getDateOnDayNewYear())
                .realTimeBarFormat(this.getRealTimeBarFormat())
                .dateSimplifliedOnDayNewYear(this.getDateSimplifliedOnDayNewYear())
                .dateSimplifliedOnDay(this.getDateSimplifliedOnDay())
                .hoursOnly(this.getHoursOnly())
                .minutesOnly(this.getMinutesOnly())
                .secondedsOnly(this.getSecondedsOnly())
                .weekNumberOnly(this.getWeekNumberOnly())
                .build();
    }
}
