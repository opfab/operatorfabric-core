[1mdiff --git a/config/web-ui/ui-config/web-ui-base.json b/config/web-ui/ui-config/web-ui-base.json[m
[1mindex 4b217547b..d5cf12a52 100644[m
[1m--- a/config/web-ui/ui-config/web-ui-base.json[m
[1m+++ b/config/web-ui/ui-config/web-ui-base.json[m
[36m@@ -7,6 +7,7 @@[m
   "selectActivityAreaOnLogin": false,[m
   "heartbeatSendingInterval": 30,[m
   "defaultEntryPage": "feed",[m
[32m+[m[32m  "dateRangePickerConfig":"default",[m
   "alerts": {[m
     "alarmLevelAutoClose": false,[m
     "messageOnBottomOfTheScreen": false,[m
[1mdiff --git a/ui/main/src/app/utils/DateRangePickerConfig.ts b/ui/main/src/app/utils/DateRangePickerConfig.ts[m
[1mindex 7c0517df8..b467d63cc 100644[m
[1m--- a/ui/main/src/app/utils/DateRangePickerConfig.ts[m
[1m+++ b/ui/main/src/app/utils/DateRangePickerConfig.ts[m
[36m@@ -7,6 +7,7 @@[m
  * This file is part of the OperatorFabric project.[m
  */[m
 [m
[32m+[m[32mimport {ConfigService} from '@ofServices/config/ConfigService';[m
 import {DateTimeFormatterService} from '@ofServices/dateTimeFormatter/DateTimeFormatterService';[m
 import {TranslationService} from '@ofServices/translation/TranslationService';[m
 import {startOfWeek, sub} from 'date-fns';[m
[36m@@ -22,6 +23,12 @@[m [mexport class DateRangePickerConfig {[m
     }[m
 [m
     public static getCustomRanges() {[m
[32m+[m[32m        if (ConfigService.getConfigValue('dateRangePickerConfig', 'default') === 'ahead')[m
[32m+[m[32m            return DateRangePickerConfig.getAheadRange();[m
[32m+[m[32m        return DateRangePickerConfig.getDefaultCustomRanges();[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    private static getDefaultCustomRanges() {[m
         const currentDate = new Date(),[m
             y = currentDate.getFullYear(),[m
             m = currentDate.getMonth();[m
[36m@@ -75,4 +82,31 @@[m [mexport class DateRangePickerConfig {[m
             [lastYearTranslation]: [startPreviousYear, endPreviousYear][m
         };[m
     }[m
[32m+[m
[32m+[m[32m    private static getAheadRange() {[m
[32m+[m[32m        const now = new Date();[m
[32m+[m[32m        const year = now.getFullYear();[m
[32m+[m[32m        const month = now.getMonth();[m
[32m+[m
[32m+[m[32m        // Calculate upcoming Saturday[m
[32m+[m[32m        const dayOfWeek = now.getDay();[m
[32m+[m[32m        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7; // always at least 1 day ahead[m
[32m+[m[32m        const upcomingSaturday = new Date(year, month, now.getDate() + daysUntilSaturday, 0, 0, 0, 0);[m
[32m+[m
[32m+[m[32m        // Next Friday after upcoming Saturday[m
[32m+[m[32m        const nextFriday = new Date(upcomingSaturday);[m
[32m+[m[32m        nextFriday.setDate(upcomingSaturday.getDate() + 6);[m
[32m+[m[32m        nextFriday.setHours(23, 59, 59, 999);[m
[32m+[m
[32m+[m[32m        const startNextMonth = new Date(year, month + 1, 1);[m
[32m+[m[32m        const endCurrentYear = new Date(year, 11, 31);[m
[32m+[m[32m        const startNextYear = new Date(year + 1, 0, 1);[m
[32m+[m[32m        const endNextYear = new Date(year + 1, 11, 31);[m
[32m+[m
[32m+[m[32m        return {[m
[32m+[m[32m            ['W-1']: [upcomingSaturday, nextFriday],[m
[32m+[m[32m            ['M-1']: [startNextMonth, endCurrentYear],[m
[32m+[m[32m            ['Y-1']: [startNextYear, endNextYear][m
[32m+[m[32m        };[m
[32m+[m[32m    }[m
 }[m
