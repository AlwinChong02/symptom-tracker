export type Frequency = 'Daily' | 'Weekly' | 'As Needed';
export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface ReminderCreate {
  name: string;
  dosage: string;
  frequency: Frequency;
  times: string[]; // 'HH:mm' strings
  daysOfWeek?: DayOfWeek[]; // Only for Weekly
  startDate?: string; // ISO date (YYYY-MM-DD)
  active?: boolean;
}

export interface ReminderRecord extends ReminderCreate {
  _id: string;
  user: string;
  active: boolean;
}
