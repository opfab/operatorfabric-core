import { DateTimeNgb, padNumber, toInteger, isNumber } from './datetime-ngb.model';

describe('Ngb Datetime modal', () => {


  it('should parse a string date', () => {
    const date = '2006-12-12';
    const customDateFormatter = new DateTimeNgb();
    expect(customDateFormatter.parse(date)).toEqual({day: 12, month: 12, year: 2006});
  });

  it('should parse a ngbdatestruct date', () => {
    const date = {day: 12, month: 6, year: 2010};
    const customDateFormatter = new DateTimeNgb(date);
    expect(customDateFormatter.format()).toEqual('2010-06-12');
  });
  it('should test padNumber function', () => {
    const date = padNumber(6);
    expect(date).toEqual('06');
  });
  it('should return empty string if padNumber argument is not a number', () => {
    const date = padNumber('e');
    expect(date).toEqual('');
  });

  it('should test toInteger function', () => {
    const date = toInteger(6);
    expect(date).toEqual(6);
  });

  it('should test toInteger function', () => {
    const date = isNumber(6);
    expect(date).toBeTruthy();
  });
  // {hour: 3, minute: 3, second: 0}
  it('should format time function', () => {
    const time = {hour: 3, minute: 3, second: 0};
    const customDateFormatter = new DateTimeNgb(null, time);
    expect(customDateFormatter.formatTime()).toEqual('03:03');
  });
  it('should format date and time', () => {
    const time = {hour: 3, minute: 3, second: 0};
    const date = {day: 12, month: 6, year: 2010};
    const customDateFormatter = new DateTimeNgb(date, time);
    expect(customDateFormatter.formatDateTime()).toEqual('2010-06-12T03:03');
    // if date and time are both null should return empty string
    expect(new DateTimeNgb(null, null).formatDateTime()).toEqual('');
    // if date is set but time null we set the time to zero
    expect(new DateTimeNgb({day: 1, month: 1, year: 2019}, null).formatDateTime()).toEqual('2019-01-01T00:00');
  });
});

