import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sliceLine'
})
export class SliceLinePipe implements PipeTransform {

  transform(value: string, args?: any): any {
    var lines: string[] = value.split('\n');
    if (lines?.length > 1)
    {
      var firstLine = value.split('\n')[0];
      firstLine = firstLine + '...';
      return firstLine;
    }
    if (value.length > 125) {
      value = value.substr(0, 125);
      value = value + '...';
      return value;
    }
    return value;
  }
}
