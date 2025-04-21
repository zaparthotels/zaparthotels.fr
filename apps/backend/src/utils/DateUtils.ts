export class DateUtils extends Date {
  setTimeFromString(time: string): this {
    const timeParts = time.split(':').map(Number);
    const [hours = 0, minutes = 0, seconds = 0] = timeParts;

    this.setHours(hours, minutes, seconds, 0);

    return this;
  }
}
