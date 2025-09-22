import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'energyFormat',
  standalone: false
})
export class EnergyFormatPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
